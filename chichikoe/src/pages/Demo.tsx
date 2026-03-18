import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'

type Step = 'intro' | 'child-answer' | 'send' | 'reveal' | 'poem' | 'call'

interface QA {
  question: string
  childPrompt: string
  fatherPrompt: string
  childAnswer: string
  fatherAnswer: string
}

// ── 5問の設計方針 ─────────────────────────────────────────────────────────────
// Q1: 対称（両者が自分の記憶を答える）→ 時間軸のズレ（父は誕生から、子は記憶の始まりから）
// Q2: 非対称（子が父の「言えなかった言葉」を想像 ／ 父が実際に答える）→ 想像と現実のズレ
// Q3: 対称（両者が「家族は何色か」を答える）→ 感じ方そのもののズレ
// Q4: 非対称（子は「泣くのを見たことがあるか」 ／ 父は「最後に泣いた」）→ 孤独の可視化
// Q5: 対称（両者が「相手から受け取った形のないもの」を答える）→ 与え合いのズレ
// ──────────────────────────────────────────────────────────────────────────────

const BASE_QAS: Omit<QA, 'childAnswer' | 'fatherAnswer'>[] = [
  {
    question: 'いちばん古い記憶',
    childPrompt: 'お父さんとの、いちばん古い記憶は何ですか？',
    fatherPrompt: 'お子さんとの、いちばん古い記憶は何ですか？',
  },
  {
    question: '言えなかった言葉',
    childPrompt: 'お父さんが、あなたに本当は言いたかったけど言えなかった言葉があるとしたら、何だと思いますか？',
    fatherPrompt: 'お子さんに、本当は言いたかったけど言えなかった言葉はありますか？',
  },
  {
    question: '家族は何色',
    childPrompt: 'あなたにとって、「家族」は何色ですか？',
    fatherPrompt: 'あなたにとって、「家族」は何色ですか？',
  },
  {
    question: '泣いていた記憶',
    childPrompt: 'お父さんが泣いているのを、見たことがありますか？あるとしたら、どんな時だったと思いますか？',
    fatherPrompt: '最後に泣いたのは、いつですか？',
  },
  {
    question: '受け取った形のないもの',
    childPrompt: 'お父さんから受け取った、形のないものは何ですか？',
    fatherPrompt: 'お子さんから受け取った、形のないものは何ですか？',
  },
]

const FALLBACK_FATHER: string[] = [
  '病院で、初めて抱いた時。指を握られた。あの重さは、今でも手の中にある',
  'ありがとう、と言えたらよかった。毎朝、心の中で言っていた',
  '深い紺色。夜に似ている。でも、星がある',
  '定年の日、誰もいない会議室で少しだけ。嬉しくて、怖くて',
  'お前がいたから、毎朝起きることができた',
]

const FALLBACK_POEM = `お父さんの記憶の中で
あなたはまだ小さな手をしている

あなたの記憶の中で
お父さんはずっと働いている

ふたりの時間は
ずっとすれ違っていた

でも
向いていた方向は
同じだったかもしれない

でも、ふたりは同じ空の下にいる`

const FALLBACK_UNSAID = 'ただいまって、もう一度言いたかった。'

// ── API ──────────────────────────────────────────────────────────────────────

async function getFatherAnswers(qas: QA[], apiKey: string): Promise<string[]> {
  if (!apiKey) return FALLBACK_FATHER
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `あなたは65歳の日本人の父親です。不器用で愛情表現が苦手ですが、家族を深く愛しています。
以下の質問に父親として正直に答えてください。父親目線の本音で、詩的に、短く。各回答は1〜2文。

${qas.map(qa => `Q: ${qa.fatherPrompt}\n子の回答（参考）: ${qa.childAnswer}`).join('\n\n')}

Q1〜Q5の答えを1行ずつ出力。番号・記号なし。`
    const result = await model.generateContent(prompt)
    const lines = result.response.text().trim().split('\n')
      .map(l => l.replace(/^[\d\s\.\-・]+/, '').trim())
      .filter(l => l.length > 0)
      .slice(0, qas.length)
    return lines.length === qas.length ? lines : FALLBACK_FATHER
  } catch { return FALLBACK_FATHER }
}

async function getZurePoem(qas: QA[], apiKey: string): Promise<string> {
  if (!apiKey) return FALLBACK_POEM
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `あなたは日本の現代詩人です。父と子の「答え合わせ」の結果を詩にしてください。

${qas.map(qa => `【${qa.question}】\n子: 「${qa.childAnswer}」\n父: 「${qa.fatherAnswer}」`).join('\n\n')}

制約：
・ズレを「愛の形の違い」として昇華する。批判しない
・「愛してる」とは言わずに愛を感じさせる
・5〜8行。句読点は最小限
・最後の行は必ず「でも、ふたりは同じ空の下にいる」で終わる
・タイトルなし`
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch { return FALLBACK_POEM }
}

async function extractUnsaidMessage(qas: QA[], apiKey: string): Promise<string> {
  if (!apiKey) return FALLBACK_UNSAID
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `以下の「子の回答」から、この子がお父さんに言いたくて言えていない本音を、25字以内の一文で抽出してください。

${qas.map(qa => `Q: ${qa.childPrompt}\n答え: ${qa.childAnswer}`).join('\n\n')}

・直接的な言葉（ありがとう、会いたかった、など）
・回答の奥にある本音を凝縮する
・25字以内。完結した一文。`
    const result = await model.generateContent(prompt)
    return result.response.text().trim().replace(/^「|」$/g, '')
  } catch { return FALLBACK_UNSAID }
}

function calcResonance(qas: QA[]): number {
  const answered = qas.filter(qa => qa.childAnswer && qa.fatherAnswer)
  if (answered.length === 0) return 0
  const matchCount = answered.filter(qa =>
    qa.childAnswer.slice(0, 3) === qa.fatherAnswer.slice(0, 3)
  ).length
  return Math.round((matchCount / answered.length) * 100)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Demo() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('intro')
  const [apiKey, setApiKey] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [deceased, setDeceased] = useState(false)
  const [qas, setQas] = useState<QA[]>(BASE_QAS.map(q => ({ ...q, childAnswer: '', fatherAnswer: '' })))
  const [qIndex, setQIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [revealIndex, setRevealIndex] = useState(-1)
  const [poem, setPoem] = useState('')
  const [poemLines, setPoemLines] = useState<string[]>([])
  const [visibleLines, setVisibleLines] = useState(0)
  const [letterText, setLetterText] = useState('')
  const [reminderSet, setReminderSet] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [unsaidMsg, setUnsaidMsg] = useState('')
  const [unsaidSent, setUnsaidSent] = useState(false)

  const handleChildAnswer = (val: string) =>
    setQas(prev => prev.map((qa, i) => i === qIndex ? { ...qa, childAnswer: val } : qa))

  const handleNextChild = () => {
    if (qIndex < qas.length - 1) setQIndex(i => i + 1)
    else setStep('send')
  }

  const handleReveal = async () => {
    setStep('reveal')
    setLoading(true)
    const answers = await getFatherAnswers(qas, apiKey)
    const updated = qas.map((qa, i) => ({ ...qa, fatherAnswer: answers[i] }))
    setQas(updated)
    setLoading(false)
    for (let i = 0; i < updated.length; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 600 : 1300))
      setRevealIndex(i)
    }
  }

  const handlePoem = async () => {
    setStep('poem')
    setLoading(true)
    // 詩と「未送信の言葉」を並行生成
    const [p, unsaid] = await Promise.all([
      getZurePoem(qas, apiKey),
      extractUnsaidMessage(qas, apiKey),
    ])
    setPoem(p)
    setUnsaidMsg(unsaid)
    const lines = p.split('\n')
    setPoemLines(lines)
    setLoading(false)
    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 500 + i * 500))
      setVisibleLines(i + 1)
    }
    await new Promise(r => setTimeout(r, 1000))
    setStep('call')
  }

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return }
    const utter = new SpeechSynthesisUtterance(poem)
    utter.lang = 'ja-JP'
    utter.rate = 0.8
    utter.pitch = 0.9
    utter.onend = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utter)
  }

  const resonance = calcResonance(qas)
  const zureCount = qas.filter(qa => qa.childAnswer && qa.fatherAnswer &&
    qa.childAnswer.slice(0, 3) !== qa.fatherAnswer.slice(0, 3)).length

  const unsaidLineText = `${fatherName || 'お父さん'}へ。\n\n${unsaidMsg}\n\n— 父問より`

  return (
    <div style={s.root}>
      <div style={s.header}>
        <a href="/ChichiLog/" style={s.back}>← 父問</a>
        <StepDots step={step} />
      </div>

      <div style={s.body}>

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>父の日に</p>
            <h2 style={s.title}>答え合わせを、しよう。</h2>
            <p style={s.sub}>
              普段、父と言葉を交わせていない人へ。<br />
              お父さんについての5問に、まずあなたが答えます。<br />
              父が答えると、AIがふたりのズレを読み解きます。
            </p>
            <div style={s.formCol}>
              <label style={s.label}>
                お父さんの名前（任意）
                <input style={s.input} placeholder="例：健一"
                  value={fatherName} onChange={e => setFatherName(e.target.value)} />
              </label>
              <label style={s.label}>
                Gemini APIキー（任意）
                <input style={s.input} type="password" placeholder="AIzaSy...（空欄でもデモできます）"
                  value={apiKey} onChange={e => setApiKey(e.target.value)} />
                <span style={s.note}>キーはブラウザ内のみ。外部送信なし。</span>
              </label>
              <label style={{ ...s.label, flexDirection: 'row', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={deceased} onChange={e => setDeceased(e.target.checked)}
                  style={{ accentColor: 'var(--amber)' }} />
                <span>お父さんはもう亡くなっています</span>
              </label>
            </div>
            <button style={{ ...s.primary, alignSelf: 'flex-end' }} onClick={() => setStep('child-answer')}>
              はじめる →
            </button>
          </div>
        )}

        {/* ── CHILD ANSWER ── */}
        {step === 'child-answer' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }} key={qIndex}>
            <p style={s.stepLabel}>{qIndex + 1} / {qas.length}</p>
            <div style={s.questionCard}>
              <p style={s.qMark}>"</p>
              <p style={s.qText}>{qas[qIndex].childPrompt}</p>
            </div>
            <textarea style={s.textarea} placeholder="自由に、正直に…"
              value={qas[qIndex].childAnswer}
              onChange={e => handleChildAnswer(e.target.value)}
              rows={3} autoFocus
            />
            <div style={s.btnRow}>
              {qIndex > 0 && <button style={s.ghost} onClick={() => setQIndex(i => i - 1)}>← 前へ</button>}
              <button
                style={{ ...s.primary, opacity: qas[qIndex].childAnswer.trim() ? 1 : 0.35 }}
                disabled={!qas[qIndex].childAnswer.trim()}
                onClick={handleNextChild}
              >
                {qIndex < qas.length - 1 ? '次へ →' : 'お父さんへ送る →'}
              </button>
            </div>
          </div>
        )}

        {/* ── SEND ── */}
        {step === 'send' && (
          <div style={{ ...s.card, ...s.center, animation: 'fadeUp 0.8s ease both' }}>
            {deceased ? (
              <>
                <p style={s.stepLabel}>もし、答えてくれたなら</p>
                <h2 style={s.title}>{fatherName || 'お父さん'}ならどう答えただろう</h2>
                <p style={s.sub}>
                  AIが、あなたの記憶の中の{fatherName || 'お父さん'}として<br />
                  5つの問いに答えます。
                </p>
                <button style={{ ...s.primary, alignSelf: 'center' }} onClick={handleReveal}>
                  答えを想像する →
                </button>
              </>
            ) : (
              <>
                <p style={s.stepLabel}>お父さんへ</p>
                <h2 style={s.title}>リンクを送ろう</h2>
                <p style={s.sub}>理由は書かなくていい。アプリ不要。リンクを開くだけ。</p>
                <div style={s.messageBox}>
                  <p style={s.messageText}>
                    「一緒にやってほしいことがある。<br />5分だけ時間ちょうだい。」
                  </p>
                  <div style={s.linkPreview}>
                    <span style={{ fontSize: 12, color: 'var(--amber)' }}>chichitoi.app/f/xxxxxx</span>
                    <span style={{ fontSize: 10, color: 'var(--text-dimmer)', marginLeft: 8 }}>72時間有効</span>
                  </div>
                </div>
                <div style={s.btnRow}>
                  <button style={s.lineBtn}>LINEで送る</button>
                  <button style={s.primary} onClick={handleReveal}>
                    父が答えた（デモ）→
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── REVEAL ── */}
        {step === 'reveal' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>
              {loading ? '読み込み中…' : deceased
                ? `${fatherName || 'お父さん'}ならこう答えたかもしれない`
                : `${fatherName || 'お父さん'}の答えが届いた`}
            </p>
            {loading && <div style={s.spinner} />}

            {!loading && revealIndex >= qas.length - 1 && (
              <div style={s.resonanceBar}>
                <p style={s.resonanceLabel}>共鳴率</p>
                <div style={s.resonanceTrack}>
                  <div style={{ ...s.resonanceFill, width: `${resonance}%` }} />
                </div>
                <p style={s.resonanceNum}>{resonance}%</p>
                <p style={s.resonanceNote}>
                  {resonance < 30 ? 'ズレが大きいほど、詩は深くなる。' :
                   resonance < 60 ? '時間を超えて、ふたりは重なっていた。' :
                   '近くにいながら、伝えていなかっただけだ。'}
                </p>
              </div>
            )}

            <div style={s.revealList}>
              {qas.map((qa, i) => (
                <div key={i} style={s.revealItem}>
                  <p style={s.revealQ}>{qa.question}</p>
                  <div style={s.revealChild}>
                    <span style={s.revealLabelChild}>あなた</span>
                    <p style={s.revealTextChild}>{qa.childAnswer}</p>
                  </div>
                  <div style={{
                    ...s.revealFather,
                    opacity: revealIndex >= i ? 1 : 0,
                    transform: revealIndex >= i ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'all 1s ease',
                  }}>
                    <span style={s.revealLabelFather}>{fatherName || '父'}</span>
                    <p style={s.revealTextFather}>
                      {revealIndex >= i ? `「${qa.fatherAnswer}」` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {revealIndex >= qas.length - 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, animation: 'fadeUp 0.8s ease both' }}>
                <p style={{ fontSize: 22, fontFamily: 'var(--serif)', color: 'var(--text)', letterSpacing: '0.05em' }}>
                  {zureCount}問、ズレていた。
                </p>
                <button style={s.primary} onClick={handlePoem}>ズレを読み解く</button>
              </div>
            )}
          </div>
        )}

        {/* ── POEM ── */}
        {step === 'poem' && (
          <div style={{ ...s.card, ...s.center, animation: 'fadeUp 0.8s ease both' }}>
            {loading ? (
              <div style={s.spinner} />
            ) : (
              <div style={s.poemBox}>
                {poemLines.slice(0, visibleLines).map((line, i) => (
                  <p key={i} style={{
                    ...s.poemLine,
                    opacity: i < visibleLines ? 1 : 0,
                    transition: 'opacity 0.9s ease',
                    minHeight: line === '' ? '1em' : 'auto',
                  }}>
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CALL ── */}
        {step === 'call' && (
          <div style={{ ...s.card, ...s.center, animation: 'fadeUp 1s ease both' }}>
            <div style={s.poemBox}>
              {poemLines.map((line, i) => (
                <p key={i} style={{ ...s.poemLine, minHeight: line === '' ? '1em' : 'auto' }}>
                  {line || '\u00A0'}
                </p>
              ))}
              {'speechSynthesis' in window && (
                <button style={s.speakBtn} onClick={handleSpeak}>
                  {speaking ? '停止' : '詩を声で聴く'}
                </button>
              )}
            </div>

            {/* AIが抽出した「未送信の言葉」 */}
            {unsaidMsg && !deceased && (
              <div style={s.unsaidBox}>
                <p style={s.unsaidLabel}>詩の奥に、あなただけの言葉があった</p>
                <p style={s.unsaidMsg}>「{unsaidMsg}」</p>
                <p style={s.unsaidSub}>あなたの5つの答えから、AIが見つけた未送信の言葉です。今日だけ、送れます。</p>
                {!unsaidSent ? (
                  <button style={s.lineBtn} onClick={() => {
                    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(unsaidLineText)}`, '_blank')
                    setUnsaidSent(true)
                  }}>
                    LINEで{fatherName || 'お父さん'}に送る
                  </button>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--amber)', letterSpacing: '0.06em' }}>
                    送りました。
                  </p>
                )}
              </div>
            )}

            <div style={s.callSection}>
              <p style={s.callMain}>
                {fatherName || 'お父さん'}、今何してるかな。
              </p>

              {deceased ? (
                <div style={s.deceasedBox}>
                  <p style={s.deceasedLabel}>届かなくても、書くことで、あなたが変わる。伝えたかった言葉を、ここに残してください。</p>
                  <textarea style={{ ...s.textarea, border: 'none', borderBottom: '1px solid var(--text-dimmer)', borderRadius: 0, background: 'transparent', textAlign: 'center' }}
                    placeholder="送信ボタンはありません。ただ、書いてください。"
                    value={letterText} onChange={e => setLetterText(e.target.value)}
                    rows={4}
                  />
                </div>
              ) : (
                <>
                  <p style={s.callHint}>（声、聞きたくなったら）</p>
                  <div style={s.callBtnRow}>
                    <button style={s.callBtn}>
                      {fatherName || 'お父さん'}に電話する
                    </button>
                    {!reminderSet ? (
                      <button style={s.callGhost} onClick={() => setReminderSet(true)}>
                        あとで電話する →
                      </button>
                    ) : (
                      <p style={{ fontSize: 12, color: 'var(--amber)', letterSpacing: '0.06em' }}>
                        今夜8時にリマインドします
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <button style={s.cardLink} onClick={() =>
              navigate('/complete', { state: { qas, fatherName, poem, zureCount, unsaidMsg } })
            }>
              ズレカードをつくる →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['intro', 'child-answer', 'send', 'reveal', 'poem', 'call']
  const idx = steps.indexOf(step)
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {steps.map((_, i) => (
        <div key={i} style={{
          width: i <= idx ? '18px' : '5px', height: '3px', borderRadius: '2px',
          background: i <= idx ? 'var(--amber)' : 'var(--text-dimmer)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', borderBottom: '1px solid var(--text-dimmer)' },
  back: { fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.05em' },
  body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 80px' },
  card: { width: '100%', maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '24px' },
  center: { alignItems: 'center', textAlign: 'center' },
  stepLabel: { fontSize: '11px', letterSpacing: '0.2em', color: 'var(--amber)' },
  title: { fontFamily: 'var(--serif)', fontSize: 'clamp(24px,4vw,34px)', fontWeight: 300, color: 'var(--text)', letterSpacing: '0.05em', lineHeight: 1.7 },
  sub: { fontSize: '14px', color: 'var(--text-dim)', lineHeight: 2 },
  formCol: { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
  label: { display: 'flex', flexDirection: 'column' as const, gap: '8px', fontSize: '12px', letterSpacing: '0.06em', color: 'var(--text-dim)', cursor: 'default' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--text-dimmer)', borderRadius: '2px', color: 'var(--text)', fontSize: '15px', padding: '12px 16px', outline: 'none' },
  note: { fontSize: '11px', color: 'var(--text-dimmer)' },
  primary: { padding: '13px 30px', background: 'var(--amber)', color: '#0a0a0a', borderRadius: '2px', fontSize: '14px', letterSpacing: '0.08em', fontWeight: 400, transition: 'opacity 0.2s', alignSelf: 'flex-end' as const },
  ghost: { padding: '13px 22px', border: '1px solid var(--text-dimmer)', borderRadius: '2px', fontSize: '14px', color: 'var(--text-dim)' },
  btnRow: { display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' as const },
  questionCard: { position: 'relative', padding: '28px 32px', border: '1px solid rgba(200,145,58,0.2)', borderRadius: '2px', textAlign: 'center' },
  qMark: { position: 'absolute', top: '10px', left: '16px', fontFamily: 'var(--serif)', fontSize: '30px', color: 'var(--amber)', opacity: 0.2, lineHeight: 1 },
  qText: { fontFamily: 'var(--serif)', fontSize: 'clamp(15px,2.5vw,19px)', lineHeight: 2, color: 'var(--text)', fontWeight: 300 },
  textarea: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--text-dimmer)', borderRadius: '2px', color: 'var(--text)', fontSize: '15px', padding: '14px 16px', outline: 'none', resize: 'none' as const, lineHeight: 1.9, width: '100%' },
  messageBox: { padding: '28px', border: '1px solid var(--text-dimmer)', borderRadius: '2px', display: 'flex', flexDirection: 'column' as const, gap: '16px', textAlign: 'center' },
  messageText: { fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--text)', lineHeight: 2, fontWeight: 300 },
  linkPreview: { padding: '10px 16px', background: 'rgba(200,145,58,0.06)', borderRadius: '2px', textAlign: 'center' },
  lineBtn: { padding: '13px 22px', background: '#06C755', color: '#fff', borderRadius: '2px', fontSize: '14px', letterSpacing: '0.05em', fontWeight: 400 },
  resonanceBar: { display: 'flex', flexDirection: 'column' as const, gap: '8px', padding: '20px 24px', border: '1px solid rgba(200,145,58,0.15)', borderRadius: '2px', background: 'rgba(200,145,58,0.02)' },
  resonanceLabel: { fontSize: '10px', letterSpacing: '0.2em', color: 'var(--amber)' },
  resonanceTrack: { height: '3px', background: 'var(--text-dimmer)', borderRadius: '2px', overflow: 'hidden' },
  resonanceFill: { height: '100%', background: 'var(--amber)', borderRadius: '2px', transition: 'width 1.2s ease' },
  resonanceNum: { fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--text)' },
  resonanceNote: { fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.04em', lineHeight: 1.7 },
  revealList: { display: 'flex', flexDirection: 'column' as const, gap: '0' },
  revealItem: { padding: '20px 0', borderBottom: '1px solid var(--text-dimmer)', display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  revealQ: { fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', opacity: 0.8 },
  revealChild: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  revealLabelChild: { fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-dimmer)' },
  revealTextChild: { fontSize: '15px', color: 'rgba(232,224,213,0.65)', lineHeight: 1.8 },
  revealFather: { display: 'flex', flexDirection: 'column' as const, gap: '4px', paddingLeft: '16px', borderLeft: '2px solid rgba(200,145,58,0.4)' },
  revealLabelFather: { fontSize: '10px', letterSpacing: '0.12em', color: 'var(--amber)' },
  revealTextFather: { fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--text)', lineHeight: 1.9 },
  spinner: { width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--text-dimmer)', borderTopColor: 'var(--amber)', animation: 'rotateSlow 1s linear infinite', alignSelf: 'center' as const },
  poemBox: { padding: '0 8px', maxWidth: '440px', textAlign: 'left' as const, display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  poemLine: { fontFamily: 'var(--serif)', fontSize: '15px', lineHeight: 2.4, color: 'rgba(232,224,213,0.85)', fontWeight: 300, letterSpacing: '0.03em' },
  speakBtn: { marginTop: '16px', alignSelf: 'flex-start' as const, fontSize: '11px', letterSpacing: '0.1em', color: 'var(--amber)', border: '1px solid rgba(200,145,58,0.3)', borderRadius: '2px', padding: '6px 14px' },
  unsaidBox: { width: '100%', maxWidth: '440px', padding: '28px', border: '1px solid rgba(200,145,58,0.35)', borderRadius: '2px', background: 'rgba(200,145,58,0.04)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '14px', animation: 'fadeUp 0.8s ease 0.5s both' },
  unsaidLabel: { fontSize: '10px', letterSpacing: '0.18em', color: 'var(--amber)', opacity: 0.8 },
  unsaidMsg: { fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--text)', lineHeight: 1.9, letterSpacing: '0.04em', textAlign: 'center' },
  unsaidSub: { fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.06em' },
  callSection: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '20px', marginTop: '8px' },
  callMain: { fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', color: 'var(--text)', letterSpacing: '0.05em', lineHeight: 1.8 },
  callHint: { fontSize: '12px', color: 'var(--text-dimmer)', letterSpacing: '0.1em' },
  callBtnRow: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '12px' },
  callBtn: { padding: '16px 48px', background: 'var(--amber)', color: '#0a0a0a', borderRadius: '2px', fontSize: '16px', letterSpacing: '0.08em', fontWeight: 400 },
  callGhost: { fontSize: '12px', color: 'var(--text-dimmer)', textDecoration: 'underline', letterSpacing: '0.06em' },
  deceasedBox: { display: 'flex', flexDirection: 'column' as const, gap: '12px', width: '100%', maxWidth: '380px' },
  deceasedLabel: { fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.04em', lineHeight: 1.9 },
  cardLink: { fontSize: '12px', color: 'var(--text-dimmer)', textDecoration: 'underline', textDecorationColor: 'var(--text-dimmer)', letterSpacing: '0.06em' },
}

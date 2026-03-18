import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'

type Step = 'intro' | 'child-answer' | 'send' | 'reveal' | 'poem' | 'call'

interface QA {
  question: string
  childPrompt: string   // 子に見せる質問
  fatherPrompt: string  // 父に見せる質問
  childAnswer: string
  fatherAnswer: string
}

// ── 感動を誘う5問 ──────────────────────────────────────────────────────────────
const BASE_QAS: Omit<QA, 'childAnswer' | 'fatherAnswer'>[] = [
  {
    question: '人生で一番嬉しかった瞬間',
    childPrompt: 'お父さんが人生で一番嬉しかった瞬間は、どんな時だと思いますか？',
    fatherPrompt: 'あなたが人生で一番嬉しかった瞬間は、どんな時ですか？',
  },
  {
    question: '誰にも話したことのない自慢',
    childPrompt: 'お父さんが、誰にも話したことのない自慢があるとしたら、何だと思いますか？',
    fatherPrompt: '誰にも話したことのない、あなたの自慢はありますか？',
  },
  {
    question: '一番ホッとする瞬間',
    childPrompt: 'お父さんが一番ホッとするのは、どんな瞬間だと思いますか？',
    fatherPrompt: 'あなたが一番ホッとするのは、どんな瞬間ですか？',
  },
  {
    question: 'ずっと言いそびれていること',
    childPrompt: 'お父さんがあなたに、ずっと言いそびれていることがあるとしたら、何だと思いますか？',
    fatherPrompt: 'お子さんに、ずっと言いそびれていることはありますか？',
  },
  {
    question: 'あなたとの一番古い記憶',
    childPrompt: 'お父さんとの一番古い記憶は何ですか？',
    fatherPrompt: 'お子さんとの一番古い記憶は何ですか？',
  },
]

const FALLBACK_FATHER: string[] = [
  '会社で一番の契約が取れた時',
  '無名のまま定年を迎えたこと。誰も気づかなかったけど、家族を守れた',
  '早朝、誰も起きていない台所でお茶を飲む時',
  'お前が生まれた日、泣いた。嬉しくて、怖くて',
  '生まれて三日目、病院で抱いた時。指を握られた',
]

const FALLBACK_POEM = `あなたは、お父さんの答えを知っていましたか。

お父さんにとって、人生で一番嬉しかった瞬間は、
契約書にハンコを押した、あの夜のことでした。

あなたがまだ言葉も知らない頃のことです。
その夜、お父さんは何を思っていたのでしょう。
帰りの電車で、窓に映る自分の顔を見ながら、
「やっと、守れる」と思っていたのかもしれない。

お父さんは、「あなたが生まれた時」とは言いませんでした。
でもそれは、あなたのことを忘れていたからではない。

父親というのは、愛情を証明するために働くのではなく、
働くことで、愛情を黙って差し出す生き物なのかもしれません。

ズレていました。
でも、向いている方向は、ずっと同じだったかもしれない。`

// ── API ──────────────────────────────────────────────────────────────────────

async function getFatherAnswers(qas: QA[], apiKey: string): Promise<string[]> {
  if (!apiKey) return FALLBACK_FATHER
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `あなたは65歳の日本人の父親です。不器用で愛情表現が苦手ですが、家族を深く愛しています。
以下の質問に父親として正直に答えてください。子どもが予想しているものとは「少しズレた」答えになるようにしてください。
嘘をつくのではなく、父親目線の本音で答えてください。各回答は1〜2文で。

${qas.map((qa, _i) => `Q: ${qa.fatherPrompt}\n子の予想: ${qa.childAnswer}`).join('\n\n')}

Q1〜Q5の答えを1行ずつ出力してください。番号や記号なし。`
    const result = await model.generateContent(prompt)
    const lines = result.response.text().trim().split('\n').filter(l => l.trim()).slice(0, qas.length)
    return lines.length === qas.length ? lines : FALLBACK_FATHER
  } catch { return FALLBACK_FATHER }
}

async function getZurePoem(qas: QA[], apiKey: string): Promise<string> {
  if (!apiKey) return FALLBACK_POEM
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `父と子の「答え合わせ」の結果です。このズレを、是枝裕和映画のように静かに、美しく読み解いてください。

${qas.map(qa => `【${qa.question}】\n子の答え: 「${qa.childAnswer}」\n父の答え: 「${qa.fatherAnswer}」`).join('\n\n')}

ルール：
・父を弁護しない。ただ解像度を上げる
・「愛してる」とは言わずに愛を感じさせる
・最後は「今夜」に着地させる
・200〜250字以内
・改行を使って詩のリズムにする`
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch { return FALLBACK_POEM }
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
    // 順番に浮かび上がる
    for (let i = 0; i < updated.length; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 600 : 1200))
      setRevealIndex(i)
    }
  }

  const handlePoem = async () => {
    setStep('poem')
    setLoading(true)
    const p = await getZurePoem(qas, apiKey)
    setPoem(p)
    const lines = p.split('\n').filter(l => l !== undefined)
    setPoemLines(lines)
    setLoading(false)
    // 一行ずつ現れる
    for (let i = 0; i < lines.length; i++) {
      await new Promise(r => setTimeout(r, 700 + i * 400))
      setVisibleLines(i + 1)
    }
    await new Promise(r => setTimeout(r, 800))
    setStep('call')
  }

  const zureCount = qas.filter(qa => qa.childAnswer && qa.fatherAnswer &&
    qa.childAnswer.slice(0, 4) !== qa.fatherAnswer.slice(0, 4)).length

  return (
    <div style={s.root}>
      <div style={s.header}>
        <a href="/dentsu/" style={s.back}>← 父問</a>
        <StepDots step={step} />
      </div>

      <div style={s.body}>

        {/* ── INTRO ── */}
        {step === 'intro' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>父の日に</p>
            <h2 style={s.title}>答え合わせを、しよう。</h2>
            <p style={s.sub}>
              お父さんについての5つの問いに、まずあなたが答えます。<br />
              次にお父さんに同じ問いを送ります。<br />
              ふたりの答えのズレを、AIが読み解きます。
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
            <p style={s.stepLabel}>お父さんへ</p>
            <h2 style={s.title}>リンクを送ろう</h2>
            <p style={s.sub}>理由は書かなくていい。</p>
            <div style={s.messageBox}>
              <p style={s.messageText}>
                「一緒にやってほしいことがある。<br />5分だけ時間ちょうだい。」
              </p>
              <div style={s.linkPreview}>
                <span style={{ fontSize: 12, color: 'var(--amber)' }}>chichitoi.app/f/xxxxxx</span>
              </div>
            </div>
            <div style={s.btnRow}>
              <button style={{ ...s.lineBtn }}>LINEで送る</button>
              <button style={s.primary} onClick={handleReveal}>
                {deceased ? '父の答えを想像する' : '父が答えた（デモ）→'}
              </button>
            </div>
          </div>
        )}

        {/* ── REVEAL ── */}
        {step === 'reveal' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>
              {loading ? '読み込み中…' : `${fatherName || 'お父さん'}の答えが届いた`}
            </p>
            {loading && <div style={s.spinner} />}

            <div style={s.revealList}>
              {qas.map((qa, i) => (
                <div key={i} style={s.revealItem}>
                  {/* 子の答え（常に表示） */}
                  <p style={s.revealQ}>{qa.question}</p>
                  <div style={s.revealChild}>
                    <span style={s.revealLabelChild}>あなた</span>
                    <p style={s.revealTextChild}>{qa.childAnswer}</p>
                  </div>

                  {/* 父の答え（順番に浮かび上がる） */}
                  <div style={{
                    ...s.revealFather,
                    opacity: revealIndex >= i ? 1 : 0,
                    transform: revealIndex >= i ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'all 0.9s ease',
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
                <button style={s.primary} onClick={handlePoem}>ズレを読み解く ✦</button>
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
                    transition: 'opacity 0.8s ease',
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
            </div>

            <div style={s.callSection}>
              <p style={s.callMain}>
                {fatherName || 'お父さん'}、今何してるかな。
              </p>

              {deceased ? (
                <div style={s.deceasedBox}>
                  <p style={s.deceasedLabel}>伝えたかった言葉を、ここに残してください</p>
                  <textarea style={{ ...s.textarea, border: 'none', borderBottom: '1px solid var(--text-dimmer)', borderRadius: 0, background: 'transparent', textAlign: 'center' }}
                    placeholder="送信ボタンはありません。ただ、書いてください。"
                    value={letterText} onChange={e => setLetterText(e.target.value)}
                    rows={4}
                  />
                </div>
              ) : (
                <p style={s.callHint}>（声、聞きたくなったら）</p>
              )}

              {!deceased && (
                <button style={s.callBtn}>
                  📞 {fatherName || 'お父さん'}に電話する
                </button>
              )}
            </div>

            <button style={s.cardLink} onClick={() =>
              navigate('/complete', { state: { qas, fatherName, poem, zureCount } })
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
  poemBox: { padding: '0 8px', maxWidth: '440px', textAlign: 'left' as const },
  poemLine: { fontFamily: 'var(--serif)', fontSize: '15px', lineHeight: 2.4, color: 'rgba(232,224,213,0.8)', fontWeight: 300, letterSpacing: '0.03em' },
  callSection: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '20px', marginTop: '16px' },
  callMain: { fontFamily: 'var(--serif)', fontSize: 'clamp(20px,3vw,28px)', color: 'var(--text)', letterSpacing: '0.05em', lineHeight: 1.8 },
  callHint: { fontSize: '12px', color: 'var(--text-dimmer)', letterSpacing: '0.1em' },
  callBtn: { padding: '16px 48px', background: 'var(--amber)', color: '#0a0a0a', borderRadius: '2px', fontSize: '16px', letterSpacing: '0.08em', fontWeight: 400 },
  deceasedBox: { display: 'flex', flexDirection: 'column' as const, gap: '12px', width: '100%', maxWidth: '380px' },
  deceasedLabel: { fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.04em', lineHeight: 1.9 },
  cardLink: { fontSize: '12px', color: 'var(--text-dimmer)', textDecoration: 'underline', textDecorationColor: 'var(--text-dimmer)', letterSpacing: '0.06em' },
}

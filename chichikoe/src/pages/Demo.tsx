import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleGenerativeAI } from '@google/generative-ai'

type Step = 'intro' | 'child-answer' | 'send' | 'father-answer' | 'result'

interface QA { question: string; childAnswer: string; fatherAnswer: string }

const DEFAULT_QAS: QA[] = [
  { question: 'お父さんが人生で一番嬉しかった瞬間は？', childAnswer: '', fatherAnswer: '会社で一番の契約が取れた時' },
  { question: 'お父さんの口癖は？', childAnswer: '', fatherAnswer: 'まあ、なんとかなるさ' },
  { question: 'お父さんが後悔していることがあるとしたら？', childAnswer: '', fatherAnswer: '家族ともっと旅行に行けばよかった' },
]

async function generateFatherAnswers(questions: string[], childAnswers: string[], apiKey: string): Promise<string[]> {
  if (!apiKey) return DEFAULT_QAS.map(q => q.fatherAnswer)
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `あなたは65歳の日本人の父親です。不器用で愛情表現が苦手ですが、家族を深く愛しています。
子供が以下のようにあなたについて回答しました。あなた自身（父親）として同じ質問に答えてください。
子供の回答とは"ズレる"ように答えてください。どちらが正しいわけではなく、視点が違うだけです。

${questions.map((q, i) => `質問${i + 1}: ${q}\n子供の回答: ${childAnswers[i]}`).join('\n\n')}

各質問への回答を1行ずつ、余計な説明なしで出力してください。`
    const result = await model.generateContent(prompt)
    const lines = result.response.text().trim().split('\n').filter(l => l.trim()).slice(0, questions.length)
    return lines.length === questions.length ? lines : DEFAULT_QAS.map(q => q.fatherAnswer)
  } catch { return DEFAULT_QAS.map(q => q.fatherAnswer) }
}

async function generateZurePoem(qas: QA[], apiKey: string): Promise<string> {
  const fallback = `「お父さんの記憶の中のあなたは、まだ小さかった頃のまま止まっています。\nあなたの記憶の中の父は、いつも背中を見せていました。\nふたりとも、同じくらい、お互いを想っていた。」`
  if (!apiKey) return fallback
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const prompt = `父と子の「答え合わせ」の結果です。このズレを、批判せず、詩のように美しく読み解いてください。
温かく、少し切なく、でも最後は愛が感じられる文章にしてください。150字以内で。

${qas.map((qa, i) => `問${i + 1}: ${qa.question}\n子: ${qa.childAnswer}\n父: ${qa.fatherAnswer}`).join('\n\n')}

かっこ「」でくくって出力してください。`
    const result = await model.generateContent(prompt)
    return result.response.text().trim()
  } catch { return fallback }
}

export default function Demo() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('intro')
  const [apiKey, setApiKey] = useState('')
  const [fatherName, setFatherName] = useState('')
  const [qas, setQas] = useState<QA[]>(DEFAULT_QAS.map(q => ({ ...q, childAnswer: '' })))
  const [qIndex, setQIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [poem, setPoem] = useState('')
  const [revealIndex, setRevealIndex] = useState(-1)

  const handleChildAnswer = (val: string) => {
    setQas(prev => prev.map((qa, i) => i === qIndex ? { ...qa, childAnswer: val } : qa))
  }

  const handleNextChild = () => {
    if (qIndex < qas.length - 1) setQIndex(i => i + 1)
    else setStep('send')
  }

  const handleFatherReveal = async () => {
    setStep('father-answer')
    setLoading(true)
    const answers = await generateFatherAnswers(qas.map(q => q.question), qas.map(q => q.childAnswer), apiKey)
    setQas(prev => prev.map((qa, i) => ({ ...qa, fatherAnswer: answers[i] })))
    setLoading(false)
    // 順番に父の答えを表示
    for (let i = 0; i < qas.length; i++) {
      await new Promise(r => setTimeout(r, 800 + i * 600))
      setRevealIndex(i)
    }
  }

  const handleResult = async () => {
    setLoading(true)
    setStep('result')
    const p = await generateZurePoem(qas, apiKey)
    setPoem(p)
    setLoading(false)
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <a href="/dentsu/" style={s.back}>← 父問</a>
        <StepDots step={step} />
      </div>

      <div style={s.body}>

        {step === 'intro' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>はじめに</p>
            <h2 style={s.cardTitle}>父の日に、<br />答え合わせをしよう。</h2>
            <p style={s.cardSub}>
              お父さんについての問いに、まずあなたが答えます。<br />
              次にお父さんに同じ問いを送ります。<br />
              ふたりの答えのズレを、AIが読み解きます。
            </p>
            <div style={s.formCol}>
              <label style={s.label}>
                お父さんの名前（任意）
                <input style={s.input} placeholder="例：健一" value={fatherName}
                  onChange={e => setFatherName(e.target.value)} />
              </label>
              <label style={s.label}>
                Gemini APIキー（任意）
                <input style={s.input} type="password" placeholder="AIzaSy... （空欄でもデモできます）"
                  value={apiKey} onChange={e => setApiKey(e.target.value)} />
                <span style={s.note}>キーはブラウザ内のみで使用。外部送信なし。</span>
              </label>
            </div>
            <button style={{ ...s.primary, alignSelf: 'flex-end' }} onClick={() => setStep('child-answer')}>
              はじめる →
            </button>
          </div>
        )}

        {step === 'child-answer' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>あなたの回答 {qIndex + 1} / {qas.length}</p>
            <div style={s.questionCard}>
              <p style={s.questionMark}>"</p>
              <p style={s.questionText}>{qas[qIndex].question}</p>
            </div>
            <p style={s.cardSub}>お父さんが何と答えるか、想像しながら答えてください</p>
            <textarea
              style={s.textarea}
              placeholder="自由に書いてください…"
              value={qas[qIndex].childAnswer}
              onChange={e => handleChildAnswer(e.target.value)}
              rows={3}
            />
            <div style={s.btnRow}>
              {qIndex > 0 && <button style={s.ghost} onClick={() => setQIndex(i => i - 1)}>← 前へ</button>}
              <button
                style={{ ...s.primary, opacity: qas[qIndex].childAnswer.trim() ? 1 : 0.4 }}
                disabled={!qas[qIndex].childAnswer.trim()}
                onClick={handleNextChild}
              >
                {qIndex < qas.length - 1 ? '次の問いへ →' : 'お父さんに送る →'}
              </button>
            </div>
          </div>
        )}

        {step === 'send' && (
          <div style={{ ...s.card, ...s.centerCard, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>お父さんへ</p>
            <h2 style={s.cardTitle}>リンクを送ろう</h2>
            <p style={s.cardSub}>
              {fatherName || 'お父さん'}に、このメッセージだけ送ってください。<br />
              理由は書かなくていい。
            </p>
            <div style={s.messagePreview}>
              <p style={s.messageText}>
                「一緒にやってほしいことがある。<br />
                5分だけ時間ちょうだい。」
              </p>
              <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(200,145,58,0.08)', borderRadius: 2 }}>
                <p style={{ fontSize: 12, color: 'var(--amber)', letterSpacing: '0.05em' }}>
                  chichikoe.app/father/xxxxx
                </p>
              </div>
            </div>
            <div style={s.btnRow}>
              <button style={{ ...s.shareBtn, background: '#06C755', color: '#fff' }}>
                LINEで送る
              </button>
              <button style={s.primary} onClick={handleFatherReveal}>
                父が答えた（デモ） →
              </button>
            </div>
          </div>
        )}

        {step === 'father-answer' && (
          <div style={{ ...s.card, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>{fatherName || 'お父さん'}の回答</p>
            <h2 style={s.cardTitle}>
              {loading && revealIndex < 0 ? '読み込み中…' : '答えが届いた'}
            </h2>
            <div style={s.formCol}>
              {qas.map((qa, i) => (
                <div key={i} style={{
                  ...s.answerRow,
                  opacity: revealIndex >= i ? 1 : 0.15,
                  transition: 'opacity 0.6s ease',
                }}>
                  <p style={s.answerQ}>{qa.question}</p>
                  <div style={s.answerPair}>
                    <div style={s.answerBox}>
                      <p style={s.answerLabel}>あなた</p>
                      <p style={s.answerText}>{qa.childAnswer}</p>
                    </div>
                    <div style={s.divider} />
                    <div style={{ ...s.answerBox, alignItems: 'flex-end' as const }}>
                      <p style={{ ...s.answerLabel, color: 'var(--amber)' }}>{fatherName || '父'}</p>
                      <p style={{ ...s.answerText, textAlign: 'right' as const }}>
                        {revealIndex >= i ? qa.fatherAnswer : '…'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {revealIndex >= qas.length - 1 && (
              <button style={{ ...s.primary, alignSelf: 'center', marginTop: 16, animation: 'fadeUp 0.8s ease both' }} onClick={handleResult}>
                ズレを読み解く ✦
              </button>
            )}
          </div>
        )}

        {step === 'result' && (
          <div style={{ ...s.card, ...s.centerCard, animation: 'fadeUp 0.8s ease both' }}>
            <p style={s.stepLabel}>AIが読み解いたズレ</p>
            {loading ? (
              <div style={s.spinner} />
            ) : (
              <>
                <div style={s.poem}>
                  <p style={s.poemText}>{poem}</p>
                </div>
                <div style={s.zureScore}>
                  <p style={s.zureLabel}>ズレ</p>
                  <p style={s.zureNum}>
                    {qas.length}問中{Math.floor(qas.length * 0.6)}問
                  </p>
                </div>
                <div style={s.callSection}>
                  <p style={s.callSub}>これを、直接話してみませんか？</p>
                  <button style={{ ...s.primary, fontSize: '16px', padding: '16px 48px' }}>
                    📞 {fatherName || 'お父さん'}に電話する
                  </button>
                </div>
                <button style={s.shareCard} onClick={() => {
                  navigate('/complete', { state: { qas, fatherName, poem } })
                }}>
                  ズレカードをつくる →
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['intro', 'child-answer', 'send', 'father-answer', 'result']
  const idx = steps.indexOf(step)
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {steps.map((_, i) => (
        <div key={i} style={{
          width: i <= idx ? '20px' : '6px', height: '4px', borderRadius: '2px',
          background: i <= idx ? 'var(--amber)' : 'var(--text-dimmer)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 36px', borderBottom: '1px solid var(--text-dimmer)' },
  back: { fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.05em' },
  body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px 80px' },
  card: { width: '100%', maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '22px' },
  centerCard: { alignItems: 'center', textAlign: 'center' },
  stepLabel: { fontSize: '11px', letterSpacing: '0.18em', color: 'var(--amber)' },
  cardTitle: { fontFamily: 'var(--serif)', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 300, color: 'var(--text)', letterSpacing: '0.05em', lineHeight: 1.7 },
  cardSub: { fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.9 },
  formCol: { display: 'flex', flexDirection: 'column' as const, gap: '18px' },
  label: { display: 'flex', flexDirection: 'column' as const, gap: '8px', fontSize: '12px', letterSpacing: '0.08em', color: 'var(--text-dim)' },
  input: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--text-dimmer)', borderRadius: '2px', color: 'var(--text)', fontSize: '15px', padding: '12px 16px', outline: 'none' },
  note: { fontSize: '11px', color: 'var(--text-dimmer)' },
  primary: { padding: '14px 32px', background: 'var(--amber)', color: '#0a0a0a', borderRadius: '2px', fontSize: '15px', letterSpacing: '0.08em', fontWeight: 400, transition: 'opacity 0.2s' },
  ghost: { padding: '14px 24px', border: '1px solid var(--text-dimmer)', borderRadius: '2px', fontSize: '14px', color: 'var(--text-dim)' },
  btnRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' as const },
  questionCard: { position: 'relative', padding: '28px 36px', border: '1px solid rgba(200,145,58,0.25)', borderRadius: '2px', textAlign: 'center' },
  questionMark: { position: 'absolute', top: '10px', left: '18px', fontFamily: 'var(--serif)', fontSize: '32px', color: 'var(--amber)', opacity: 0.25, lineHeight: 1 },
  questionText: { fontFamily: 'var(--serif)', fontSize: 'clamp(16px,3vw,20px)', lineHeight: 1.9, color: 'var(--text)', fontWeight: 300 },
  textarea: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--text-dimmer)', borderRadius: '2px', color: 'var(--text)', fontSize: '15px', padding: '14px 16px', outline: 'none', resize: 'none' as const, lineHeight: 1.8 },
  messagePreview: { padding: '24px', border: '1px solid var(--text-dimmer)', borderRadius: '2px', textAlign: 'center' },
  messageText: { fontFamily: 'var(--serif)', fontSize: '17px', color: 'var(--text)', lineHeight: 2, fontWeight: 300 },
  shareBtn: { padding: '14px 24px', borderRadius: '2px', fontSize: '15px', letterSpacing: '0.05em', fontWeight: 400 },
  answerRow: { display: 'flex', flexDirection: 'column' as const, gap: '10px', padding: '16px 0', borderBottom: '1px solid var(--text-dimmer)' },
  answerQ: { fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.05em' },
  answerPair: { display: 'flex', gap: '0', alignItems: 'stretch' },
  answerBox: { flex: 1, display: 'flex', flexDirection: 'column' as const, gap: '4px' },
  answerLabel: { fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-dimmer)' },
  answerText: { fontSize: '14px', color: 'var(--text)', lineHeight: 1.8 },
  divider: { width: '1px', background: 'rgba(200,145,58,0.2)', margin: '0 16px' },
  poem: { padding: '28px 32px', border: '1px solid rgba(200,145,58,0.2)', borderRadius: '2px', background: 'rgba(200,145,58,0.03)', maxWidth: '460px' },
  poemText: { fontFamily: 'var(--serif)', fontSize: '15px', lineHeight: 2.3, color: 'rgba(232,224,213,0.8)', fontStyle: 'italic', whiteSpace: 'pre-wrap' as const },
  zureScore: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '4px' },
  zureLabel: { fontSize: '11px', letterSpacing: '0.18em', color: 'var(--amber)' },
  zureNum: { fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--text)' },
  callSection: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '16px' },
  callSub: { fontSize: '14px', color: 'var(--text-dim)', letterSpacing: '0.05em' },
  shareCard: { fontSize: '13px', color: 'var(--text-dimmer)', letterSpacing: '0.08em', textDecoration: 'underline', textDecorationColor: 'var(--text-dimmer)' },
  spinner: { width: '44px', height: '44px', borderRadius: '50%', border: '2px solid var(--text-dimmer)', borderTopColor: 'var(--amber)', animation: 'rotateSlow 1s linear infinite' },
}

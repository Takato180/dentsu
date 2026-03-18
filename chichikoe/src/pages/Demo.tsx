import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateQuestions } from '../lib/gemini'
import type { FatherProfile } from '../lib/gemini'
import VoiceRecorder from '../components/VoiceRecorder'

type Step = 'input' | 'apikey' | 'generating' | 'record' | 'capsule'

const RELATIONSHIPS = [
  { value: 'close', label: '仲が良い' },
  { value: 'normal', label: '普通' },
  { value: 'distant', label: '疎遠気味' },
]

export default function Demo() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('input')
  const [profile, setProfile] = useState<FatherProfile>({
    name: '', age: '65', job: '', hometown: '', relationship: 'normal',
  })
  const [apiKey, setApiKey] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [qIndex, setQIndex] = useState(0)
  const [recordings, setRecordings] = useState<(Blob | null)[]>([])
  const [deliveryDate, setDeliveryDate] = useState('')
  const [occasion, setOccasion] = useState('')

  const handleGenerate = async () => {
    setStep('generating')
    const qs = await generateQuestions(profile, apiKey)
    setQuestions(qs)
    setRecordings(new Array(qs.length).fill(null))
    setStep('record')
  }

  const handleRecorded = (blob: Blob) => {
    setRecordings(prev => {
      const next = [...prev]
      next[qIndex] = blob
      return next
    })
  }

  const handleNextQuestion = () => {
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1)
    } else {
      setStep('capsule')
    }
  }

  const handleComplete = () => {
    const audioUrls = recordings.map(blob =>
      blob && blob.size > 0 ? URL.createObjectURL(blob) : null
    )
    navigate('/complete', {
      state: { profile, questions, audioUrls, deliveryDate, occasion },
    })
  }

  return (
    <div style={sty.root}>
      <div style={sty.header}>
        <a href="/dentsu/" style={sty.back}>← チチコエ</a>
        <StepIndicator current={step} />
      </div>

      <div style={sty.body}>
        {step === 'input' && (
          <div style={{ ...sty.card, animation: 'fadeUp 0.8s ease both' }}>
            <h2 style={sty.cardTitle}>お父さんのことを教えてください</h2>
            <p style={sty.cardSub}>AIがあなたとお父さんに合わせた質問を生成します</p>

            <div style={sty.formGrid}>
              <label style={sty.label}>
                お父さんの名前（任意）
                <input
                  style={sty.input}
                  placeholder="例：健一"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                />
              </label>
              <label style={sty.label}>
                年齢
                <input
                  style={sty.input}
                  type="number"
                  placeholder="65"
                  value={profile.age}
                  onChange={e => setProfile(p => ({ ...p, age: e.target.value }))}
                />
              </label>
              <label style={sty.label}>
                職業（任意）
                <input
                  style={sty.input}
                  placeholder="例：元会社員、農家"
                  value={profile.job}
                  onChange={e => setProfile(p => ({ ...p, job: e.target.value }))}
                />
              </label>
              <label style={sty.label}>
                出身地（任意）
                <input
                  style={sty.input}
                  placeholder="例：秋田県"
                  value={profile.hometown}
                  onChange={e => setProfile(p => ({ ...p, hometown: e.target.value }))}
                />
              </label>
            </div>

            <div style={sty.label}>
              あなたとの関係
              <div style={sty.relRow}>
                {RELATIONSHIPS.map(r => (
                  <button
                    key={r.value}
                    style={{
                      ...sty.relBtn,
                      ...(profile.relationship === r.value ? sty.relBtnActive : {}),
                    }}
                    onClick={() => setProfile(p => ({ ...p, relationship: r.value as FatherProfile['relationship'] }))}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button style={sty.primary} onClick={() => setStep('apikey')}>
              次へ →
            </button>
          </div>
        )}

        {step === 'apikey' && (
          <div style={{ ...sty.card, animation: 'fadeUp 0.8s ease both' }}>
            <h2 style={sty.cardTitle}>Gemini APIキー（任意）</h2>
            <p style={sty.cardSub}>
              入力するとお父さんに合わせた質問をAIが生成します。<br />
              空欄の場合はサンプル質問を使います。
            </p>
            <input
              style={{ ...sty.input, width: '100%', marginBottom: '8px' }}
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
            />
            <p style={sty.note}>
              ※ キーはブラウザ内のみで使用され、外部には送信されません
            </p>
            <div style={sty.btnRow}>
              <button style={sty.ghost} onClick={() => setStep('input')}>← 戻る</button>
              <button style={sty.primary} onClick={handleGenerate}>
                {apiKey ? 'AIで質問を生成する' : 'サンプル質問を使う'}
              </button>
            </div>
          </div>
        )}

        {step === 'generating' && (
          <div style={{ ...sty.card, ...sty.centerCard, animation: 'fadeIn 0.6s ease both' }}>
            <div style={sty.spinner} />
            <p style={sty.generating}>
              お父さんのための質問を考えています…
            </p>
          </div>
        )}

        {step === 'record' && questions[qIndex] && (
          <div style={{ ...sty.card, animation: 'fadeUp 0.8s ease both' }}>
            <h2 style={sty.cardTitle}>録音する</h2>
            <p style={sty.cardSub}>
              お父さんに電話して、質問を読み上げてみてください
            </p>

            <VoiceRecorder
              key={qIndex}
              question={questions[qIndex]}
              questionIndex={qIndex}
              totalQuestions={questions.length}
              onRecorded={handleRecorded}
            />

            <div style={{ ...sty.btnRow, marginTop: '32px' }}>
              {qIndex > 0 && (
                <button style={sty.ghost} onClick={() => setQIndex(i => i - 1)}>← 前の質問</button>
              )}
              <button
                style={{
                  ...sty.primary,
                  opacity: recordings[qIndex] ? 1 : 0.4,
                }}
                disabled={!recordings[qIndex]}
                onClick={handleNextQuestion}
              >
                {qIndex < questions.length - 1 ? '次の質問 →' : 'タイムカプセルへ →'}
              </button>
            </div>
          </div>
        )}

        {step === 'capsule' && (
          <div style={{ ...sty.card, animation: 'fadeUp 0.8s ease both' }}>
            <h2 style={sty.cardTitle}>タイムカプセルに封入する</h2>
            <p style={sty.cardSub}>
              いつ、誰に届けますか？
            </p>

            <div style={sty.capsuleOrb}>
              <div style={sty.orbOuter}>
                <div style={sty.orbInner}>
                  <span style={sty.orbCount}>{questions.length}</span>
                  <span style={sty.orbLabel}>声</span>
                </div>
              </div>
            </div>

            <div style={sty.formGrid}>
              <label style={sty.label}>
                届けるシーン
                <select
                  style={{ ...sty.input, cursor: 'pointer' }}
                  value={occasion}
                  onChange={e => setOccasion(e.target.value)}
                >
                  <option value="">選んでください</option>
                  <option value="wedding">結婚式のとき</option>
                  <option value="grandchild">孫が生まれたとき</option>
                  <option value="retirement">定年退職のとき</option>
                  <option value="birthday">誕生日のとき</option>
                  <option value="date">日付を指定する</option>
                </select>
              </label>
              {occasion === 'date' && (
                <label style={sty.label}>
                  日付
                  <input
                    style={sty.input}
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                  />
                </label>
              )}
            </div>

            <button
              style={{
                ...sty.primary,
                opacity: occasion ? 1 : 0.4,
              }}
              disabled={!occasion}
              onClick={handleComplete}
            >
              封入する ✦
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function StepIndicator({ current }: { current: Step }) {
  const steps: Step[] = ['input', 'apikey', 'record', 'capsule']
  const activeIndex = steps.indexOf(current === 'generating' ? 'record' : current)
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {steps.map((_, i) => (
        <div
          key={i}
          style={{
            width: i <= activeIndex ? '20px' : '6px',
            height: '4px',
            borderRadius: '2px',
            background: i <= activeIndex ? 'var(--amber)' : 'var(--text-dimmer)',
            transition: 'all 0.4s ease',
          }}
        />
      ))}
    </div>
  )
}

const sty: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 40px',
    borderBottom: '1px solid var(--text-dimmer)',
  },
  back: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    letterSpacing: '0.05em',
  },
  body: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px 80px',
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  centerCard: {
    alignItems: 'center',
    gap: '32px',
  },
  cardTitle: {
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(22px, 4vw, 30px)',
    fontWeight: 300,
    color: 'var(--text)',
    letterSpacing: '0.05em',
  },
  cardSub: {
    fontSize: '14px',
    color: 'var(--text-dim)',
    lineHeight: 1.9,
  },
  formGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    fontSize: '12px',
    letterSpacing: '0.08em',
    color: 'var(--text-dim)',
  },
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--text-dimmer)',
    borderRadius: '2px',
    color: 'var(--text)',
    fontSize: '15px',
    padding: '12px 16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  relRow: {
    display: 'flex',
    gap: '8px',
  },
  relBtn: {
    flex: 1,
    padding: '10px 8px',
    border: '1px solid var(--text-dimmer)',
    borderRadius: '2px',
    fontSize: '13px',
    color: 'var(--text-dim)',
    transition: 'all 0.2s',
  },
  relBtnActive: {
    border: '1px solid var(--amber)',
    color: 'var(--amber)',
    background: 'var(--amber-dim)',
  },
  primary: {
    padding: '14px 32px',
    background: 'var(--amber)',
    color: '#0a0a0a',
    borderRadius: '2px',
    fontSize: '15px',
    letterSpacing: '0.08em',
    fontWeight: 400,
    alignSelf: 'flex-end',
    transition: 'opacity 0.2s',
  },
  ghost: {
    padding: '14px 24px',
    border: '1px solid var(--text-dimmer)',
    borderRadius: '2px',
    fontSize: '14px',
    color: 'var(--text-dim)',
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
  },
  note: {
    fontSize: '11px',
    color: 'var(--text-dimmer)',
    letterSpacing: '0.03em',
  },
  spinner: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid var(--text-dimmer)',
    borderTopColor: 'var(--amber)',
    animation: 'rotateSlow 1s linear infinite',
  },
  generating: {
    fontSize: '15px',
    color: 'var(--text-dim)',
    letterSpacing: '0.05em',
    animation: 'pulse 2s ease infinite',
  },
  capsuleOrb: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0',
  },
  orbOuter: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '1px solid rgba(200,145,58,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'float 3s ease infinite',
  },
  orbInner: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--amber-dim)',
    border: '1px solid rgba(200,145,58,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbCount: {
    fontFamily: 'var(--serif)',
    fontSize: '28px',
    color: 'var(--amber)',
    lineHeight: 1,
  },
  orbLabel: {
    fontSize: '11px',
    color: 'var(--amber)',
    opacity: 0.7,
    letterSpacing: '0.1em',
  },
}

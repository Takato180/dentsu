import { useEffect, useRef, useState } from 'react'

interface Props {
  question: string
  questionIndex: number
  totalQuestions: number
  onRecorded: (blob: Blob) => void
}

type RecordState = 'idle' | 'recording' | 'done'

export default function VoiceRecorder({ question, questionIndex, totalQuestions, onRecorded }: Props) {
  const [state, setState] = useState<RecordState>('idle')
  const [seconds, setSeconds] = useState(0)
  const [bars, setBars] = useState<number[]>(Array(28).fill(2))
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animRef = useRef<number | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onRecorded(blob)
        stream.getTracks().forEach(t => t.stop())
      }
      recorder.start()
      mediaRef.current = recorder
      setState('recording')
      setSeconds(0)

      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const animateBars = () => {
        analyser.getByteFrequencyData(dataArray)
        const newBars = Array(28).fill(0).map((_, i) => {
          const v = dataArray[Math.floor(i * dataArray.length / 28)] / 255
          return Math.max(4, v * 56)
        })
        setBars(newBars)
        animRef.current = requestAnimationFrame(animateBars)
      }
      animateBars()
    } catch (e) {
      console.error(e)
      // fallback: mock animation
      setState('recording')
      setSeconds(0)
      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000)
      let t = 0
      const mockAnim = () => {
        t += 0.08
        setBars(Array(28).fill(0).map((_, i) => Math.max(4, 16 + Math.sin(t + i * 0.4) * 14 + Math.sin(t * 1.7 + i * 0.2) * 8)))
        animRef.current = requestAnimationFrame(mockAnim)
      }
      mockAnim()
    }
  }

  const stopRecording = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRef.current?.state === 'recording') {
      mediaRef.current.stop()
    } else {
      // mock: create empty blob
      const blob = new Blob([], { type: 'audio/webm' })
      onRecorded(blob)
    }
    setBars(Array(28).fill(2))
    setState('done')
  }

  useEffect(() => () => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  return (
    <div style={sty.wrap}>
      <div style={sty.progress}>
        質問 {questionIndex + 1} / {totalQuestions}
      </div>

      <div style={sty.questionCard}>
        <div style={sty.questionMark}>"</div>
        <p style={sty.questionText}>{question}</p>
      </div>

      {state === 'idle' && (
        <div style={sty.hint}>
          お父さんに電話して、この質問を読み上げてください
        </div>
      )}

      {state !== 'idle' && (
        <div style={sty.waveform}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                ...sty.bar,
                height: `${h}px`,
                background: state === 'recording'
                  ? `rgba(200,145,58,${0.4 + (h / 56) * 0.6})`
                  : 'rgba(200,145,58,0.2)',
                transition: state === 'recording' ? 'height 0.08s ease' : 'height 0.4s ease',
              }}
            />
          ))}
        </div>
      )}

      {state === 'recording' && (
        <div style={sty.timer}>{fmt(seconds)}</div>
      )}

      {state === 'done' && audioUrl && (
        <audio controls src={audioUrl} style={sty.audio} />
      )}

      <div style={sty.btnRow}>
        {state === 'idle' && (
          <button style={sty.recBtn} onClick={startRecording}>
            <span style={sty.recDot} /> 録音開始
          </button>
        )}
        {state === 'recording' && (
          <button style={{ ...sty.recBtn, background: 'rgba(200,145,58,0.15)', border: '1px solid var(--amber)' }} onClick={stopRecording}>
            ■ 録音停止
          </button>
        )}
        {state === 'done' && (
          <div style={sty.doneMsg}>✓ 録音完了</div>
        )}
      </div>
    </div>
  )
}

const sty: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '28px',
    width: '100%',
  },
  progress: {
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: 'var(--amber)',
  },
  questionCard: {
    position: 'relative',
    padding: '32px 40px',
    border: '1px solid rgba(200,145,58,0.25)',
    borderRadius: '2px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
  },
  questionMark: {
    position: 'absolute',
    top: '12px',
    left: '20px',
    fontFamily: 'var(--serif)',
    fontSize: '36px',
    color: 'var(--amber)',
    opacity: 0.3,
    lineHeight: 1,
  },
  questionText: {
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(16px, 3vw, 22px)',
    lineHeight: 1.9,
    color: 'var(--text)',
    fontWeight: 300,
  },
  hint: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    letterSpacing: '0.03em',
  },
  waveform: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    height: '64px',
  },
  bar: {
    width: '3px',
    borderRadius: '2px',
    minHeight: '4px',
  },
  timer: {
    fontFamily: 'var(--serif)',
    fontSize: '28px',
    color: 'var(--amber)',
    letterSpacing: '0.1em',
  },
  audio: {
    width: '100%',
    maxWidth: '320px',
    filter: 'invert(1) hue-rotate(180deg)',
    opacity: 0.7,
  },
  btnRow: {
    display: 'flex',
    justifyContent: 'center',
  },
  recBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px',
    background: 'var(--amber)',
    color: '#0a0a0a',
    borderRadius: '2px',
    fontSize: '15px',
    letterSpacing: '0.08em',
    fontWeight: 400,
  },
  recDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#0a0a0a',
    animation: 'pulse 1.2s ease infinite',
    display: 'inline-block',
  },
  doneMsg: {
    fontSize: '16px',
    color: 'var(--amber)',
    letterSpacing: '0.08em',
  },
}

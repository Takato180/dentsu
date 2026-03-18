import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const OCCASION_LABEL: Record<string, string> = {
  wedding:     '結婚式のとき',
  grandchild:  '孫が生まれたとき',
  retirement:  '定年退職のとき',
  birthday:    '誕生日のとき',
  date:        '',
}

export default function Complete() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'rise' | 'stars' | 'message'>('rise')

  const occasionLabel = state?.occasion === 'date'
    ? state?.deliveryDate
    : OCCASION_LABEL[state?.occasion] ?? '未来のいつか'

  // Canvas starfield animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    type Star = { x: number; y: number; r: number; speed: number; alpha: number }
    let stars: Star[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = Array(120).fill(0).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        alpha: Math.random(),
      }))
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.alpha = 0.1 + (Math.sin(t * s.speed + s.x) * 0.5 + 0.5) * 0.5
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 145, 58, ${s.alpha})`
        ctx.fill()
      })
      t += 0.02
      raf = requestAnimationFrame(draw)
    }
    draw()

    // Phase transitions
    const t1 = setTimeout(() => setPhase('stars'), 1600)
    const t2 = setTimeout(() => setPhase('message'), 3000)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div style={sty.root}>
      <canvas ref={canvasRef} style={sty.canvas} />

      {/* Rising capsule */}
      <div style={{
        ...sty.capsule,
        animation: phase === 'rise' ? 'capsuleRise 1.8s ease forwards' : 'none',
        opacity: phase === 'rise' ? 1 : 0,
      }}>
        <div style={sty.capsuleOrb}>
          <div style={sty.orbRing} />
          <div style={sty.orbCore}>
            <span style={sty.orbIcon}>✦</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        ...sty.content,
        opacity: phase === 'message' ? 1 : 0,
        transition: 'opacity 1.2s ease',
      }}>
        <div style={sty.icon}>✦</div>

        <h1 style={sty.title}>
          タイムカプセルを<br />宇宙に送りました
        </h1>

        <p style={sty.sub}>
          {state?.profile?.name
            ? `${state.profile.name}さんの声が`
            : 'お父さんの声が'}
          、{occasionLabel}に届きます
        </p>

        <div style={sty.questions}>
          <p style={sty.qlabel}>封入した声</p>
          {(state?.questions ?? []).map((q: string, i: number) => (
            <div key={i} style={sty.qblock}>
              <div style={sty.qrow}>
                <span style={sty.qnum}>{String(i+1).padStart(2,'0')}</span>
                <span style={sty.qtext}>{q}</span>
              </div>
              {state?.audioUrls?.[i] && (
                <audio
                  controls
                  src={state.audioUrls[i]}
                  style={sty.audio}
                />
              )}
            </div>
          ))}
        </div>

        <div style={sty.share}>
          <p style={sty.shareLabel}>SNSでシェアする</p>
          <div style={sty.shareRow}>
            <button
              style={sty.shareBtn}
              onClick={() => {
                const text = `父の日に、お父さんの声をタイムカプセルに封入しました。${occasionLabel}に届きます。#チチコエ #父の日`
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
              }}
            >
              X (Twitter)
            </button>
          </div>
        </div>

        <button style={sty.again} onClick={() => navigate('/demo')}>
          もう一度つくる
        </button>
      </div>
    </div>
  )
}

const sty: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  capsule: {
    position: 'fixed',
    left: '50%',
    bottom: '30%',
    transform: 'translateX(-50%)',
    zIndex: 10,
  },
  capsuleOrb: {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '1px solid rgba(200,145,58,0.5)',
    animation: 'ripple 1.4s ease infinite',
  },
  orbCore: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'var(--amber-dim)',
    border: '1px solid rgba(200,145,58,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbIcon: {
    fontSize: '22px',
    color: 'var(--amber)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '32px',
    padding: '40px 24px 80px',
    maxWidth: '540px',
    width: '100%',
  },
  icon: {
    fontSize: '32px',
    color: 'var(--amber)',
    animation: 'float 3s ease infinite',
  },
  title: {
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(26px, 5vw, 42px)',
    fontWeight: 300,
    lineHeight: 1.7,
    letterSpacing: '0.05em',
    color: 'var(--text)',
  },
  sub: {
    fontSize: 'clamp(14px, 2vw, 17px)',
    color: 'var(--text-dim)',
    lineHeight: 2,
  },
  questions: {
    width: '100%',
    padding: '28px',
    border: '1px solid var(--text-dimmer)',
    borderRadius: '2px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  qlabel: {
    fontSize: '11px',
    letterSpacing: '0.15em',
    color: 'var(--amber)',
    marginBottom: '4px',
    textAlign: 'left',
  },
  qblock: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  qrow: {
    display: 'flex',
    gap: '16px',
    textAlign: 'left',
    alignItems: 'flex-start',
  },
  audio: {
    width: '100%',
    height: '32px',
    opacity: 0.75,
    accentColor: 'var(--amber)',
  },
  qnum: {
    fontFamily: 'var(--serif)',
    fontSize: '14px',
    color: 'var(--amber)',
    opacity: 0.6,
    minWidth: '24px',
    marginTop: '2px',
  },
  qtext: {
    fontSize: '14px',
    lineHeight: 1.9,
    color: 'var(--text-dim)',
  },
  share: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  shareLabel: {
    fontSize: '11px',
    letterSpacing: '0.12em',
    color: 'var(--text-dimmer)',
  },
  shareRow: {
    display: 'flex',
    gap: '12px',
  },
  shareBtn: {
    padding: '10px 24px',
    border: '1px solid rgba(200,145,58,0.3)',
    borderRadius: '2px',
    fontSize: '13px',
    color: 'var(--amber)',
    letterSpacing: '0.05em',
  },
  again: {
    fontSize: '13px',
    color: 'var(--text-dimmer)',
    letterSpacing: '0.08em',
    textDecoration: 'underline',
    textDecorationColor: 'var(--text-dimmer)',
  },
}

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Player } from '@remotion/player'
import { ChichikoePitch } from '../remotion/ChichikoePitch'

export default function Landing() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Particle waveform background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const bars = 48
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2
        const noise = Math.sin(t * 0.6 + i * 0.5) * 0.4 + Math.sin(t * 1.1 + i * 0.3) * 0.3 + 0.3
        const r = 120 + noise * 50
        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r
        const alpha = 0.08 + noise * 0.12
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 145, 58, ${alpha})`
        ctx.fill()
      }
      // subtle concentric rings
      for (let ring = 1; ring <= 3; ring++) {
        const r = 100 + ring * 60 + Math.sin(t * 0.4 + ring) * 8
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(200, 145, 58, ${0.04 - ring * 0.008})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      t += 0.015
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={styles.root}>
      <canvas ref={canvasRef} style={styles.canvas} />

      <nav style={styles.nav}>
        <span style={styles.logo}>チチコエ</span>
      </nav>

      {/* hero text + video + CTA */}
      <main style={styles.main}>
        <div style={{ ...styles.eyebrow, animation: visible ? 'fadeUp 1s ease both' : 'none' }}>
          父の日 2026.6.21
        </div>
        <h1 style={{ ...styles.title, animation: visible ? 'fadeUp 1.2s ease 0.2s both' : 'none' }}>
          お父さんの声を、<br />未来へ遺す。
        </h1>

        {/* ── Remotion ピッチ動画 ── */}
        <div style={{ ...styles.videoWrap, animation: visible ? 'fadeUp 1.2s ease 0.35s both' : 'none' }}>
          <Player
            component={ChichikoePitch}
            durationInFrames={1800}
            compositionWidth={960}
            compositionHeight={540}
            fps={30}
            style={{ width: '100%' }}
            controls
          />
        </div>

        <div style={{ ...styles.ctaRow, animation: visible ? 'fadeUp 1.2s ease 0.5s both' : 'none' }}>
          <button style={styles.ctaPrimary} onClick={() => navigate('/demo')}>
            はじめる
          </button>
          <button style={styles.ctaSecondary} onClick={() => {
            document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            詳しく見る
          </button>
        </div>
      </main>

      <section id="about" style={styles.about}>
        <div style={styles.aboutGrid}>
          {STEPS.map((s, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepNum}>{String(i + 1).padStart(2, '0')}</div>
              <div style={styles.stepTitle}>{s.title}</div>
              <div style={styles.stepDesc}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={styles.insight}>
          <p style={styles.insightQ}>「お父さんの若い頃の話、</p>
          <p style={styles.insightQ}>ちゃんと聞いたことがない」</p>
          <p style={styles.insightA}>
            多くの人が父を失ってから後悔する。<br />
            チチコエは、今この瞬間を逃さないための体験です。
          </p>
        </div>

        <div style={styles.startBtn}>
          <button style={styles.ctaPrimary} onClick={() => navigate('/demo')}>
            父の声を記録する →
          </button>
        </div>
      </section>

      <footer style={styles.footer}>
        <span>チチコエ — 父の声を、未来へ</span>
      </footer>
    </div>
  )
}

const STEPS = [
  {
    title: 'AIが質問を生成',
    desc: 'お父さんの年齢・職業・あなたとの関係をもとに、AIが「まだ聞いたことのない質問」を3つ選びます',
  },
  {
    title: '父に聞いて、録音する',
    desc: '電話でも、会って話してもOK。アプリ上でそのまま声を録音できます',
  },
  {
    title: 'タイムカプセルに封入',
    desc: '結婚式・孫の誕生日など「届けてほしい未来の日」を設定。その日に声が届きます',
  },
]

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'var(--bg)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  nav: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px 40px',
  },
  logo: {
    fontFamily: 'var(--serif)',
    fontSize: '18px',
    letterSpacing: '0.15em',
    color: 'var(--amber)',
  },
  main: {
    position: 'relative',
    zIndex: 10,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '60px 24px 120px',
    minHeight: '85vh',
  },
  eyebrow: {
    fontSize: '12px',
    letterSpacing: '0.2em',
    color: 'var(--amber)',
    marginBottom: '24px',
    opacity: 0,
  },
  title: {
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(36px, 7vw, 72px)',
    fontWeight: 300,
    lineHeight: 1.5,
    letterSpacing: '0.05em',
    color: 'var(--text)',
    marginBottom: '32px',
    opacity: 0,
  },
  sub: {
    fontSize: 'clamp(14px, 2vw, 17px)',
    lineHeight: 2,
    color: 'var(--text-dim)',
    marginBottom: '56px',
    opacity: 0,
  },
  ctaRow: {
    display: 'flex',
    gap: '16px',
    opacity: 0,
  },
  ctaPrimary: {
    padding: '14px 36px',
    background: 'var(--amber)',
    color: '#0a0a0a',
    borderRadius: '2px',
    fontSize: '15px',
    letterSpacing: '0.1em',
    fontWeight: 400,
    transition: 'opacity 0.2s',
  },
  ctaSecondary: {
    padding: '14px 36px',
    border: '1px solid rgba(200,145,58,0.4)',
    color: 'var(--text-dim)',
    borderRadius: '2px',
    fontSize: '15px',
    letterSpacing: '0.05em',
    transition: 'border-color 0.2s',
  },
  about: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '960px',
    margin: '0 auto',
    padding: '80px 24px 60px',
  },
  aboutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '40px',
    marginBottom: '80px',
  },
  step: {
    textAlign: 'left',
    padding: '32px',
    border: '1px solid var(--text-dimmer)',
    borderRadius: '2px',
  },
  stepNum: {
    fontFamily: 'var(--serif)',
    fontSize: '32px',
    color: 'var(--amber)',
    opacity: 0.6,
    marginBottom: '16px',
  },
  stepTitle: {
    fontSize: '16px',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    color: 'var(--text)',
  },
  stepDesc: {
    fontSize: '13px',
    lineHeight: 1.9,
    color: 'var(--text-dim)',
  },
  insight: {
    textAlign: 'center',
    padding: '60px 0',
    borderTop: '1px solid var(--text-dimmer)',
    borderBottom: '1px solid var(--text-dimmer)',
    marginBottom: '60px',
  },
  insightQ: {
    fontFamily: 'var(--serif)',
    fontSize: 'clamp(22px, 4vw, 36px)',
    fontWeight: 300,
    color: 'var(--text)',
    lineHeight: 1.8,
  },
  insightA: {
    marginTop: '28px',
    fontSize: '14px',
    lineHeight: 2.2,
    color: 'var(--text-dim)',
  },
  startBtn: {
    display: 'flex',
    justifyContent: 'center',
  },
  videoWrap: {
    width: '100%',
    maxWidth: '800px',
    overflow: 'hidden',
    background: '#080807',
    border: '1px solid var(--text-dimmer)',
    borderRadius: '2px',
    opacity: 0,
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '24px',
    fontSize: '11px',
    color: 'var(--text-dimmer)',
    letterSpacing: '0.1em',
    borderTop: '1px solid var(--text-dimmer)',
  },
}

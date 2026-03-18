import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Player } from '@remotion/player'
import { ChichikoePitch } from '../remotion/ChichikoePitch'

function useCountdown() {
  const target = new Date('2026-06-21T00:00:00+09:00')
  const calc = () => Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86400000))
  const [days, setDays] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setDays(calc()), 60000)
    return () => clearInterval(id)
  }, [])
  return days
}

export default function Landing() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const days = useCountdown()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2, cy = canvas.height / 2
      for (let ring = 1; ring <= 4; ring++) {
        const r = 80 + ring * 70 + Math.sin(t * 0.3 + ring) * 6
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(200,145,58,${0.04 - ring * 0.006})`
        ctx.lineWidth = 1; ctx.stroke()
      }
      for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2
        const noise = Math.sin(t * 0.5 + i * 0.5) * 0.4 + 0.3
        const r = 110 + noise * 40
        const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r
        ctx.beginPath(); ctx.arc(x, y, 1.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,145,58,${0.06 + noise * 0.08})`; ctx.fill()
      }
      t += 0.012; raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={s.canvas} />

      {/* スポンサーバー */}
      <div style={s.sponsorBar}>
        <span style={s.sponsorLabel}>presented by</span>
        <span style={s.sponsorBrand}>NTT docomo</span>
        <span style={s.sponsorDivider}>|</span>
        <span style={s.countdown}>父の日まであと <strong>{days}</strong> 日</span>
      </div>

      <nav style={s.nav}>
        <div style={s.logoWrap}>
          <span style={s.logoKanji}>父問</span>
          <span style={s.logoKana}>ちちとい</span>
        </div>
      </nav>

      <main style={s.main}>
        <p style={{ ...s.eyebrow, animation: visible ? 'fadeUp 1s ease both' : 'none' }}>
          社会人になってから、父に電話できていない人へ — 父の日 2026.6.21
        </p>

        <h1 style={{ ...s.title, animation: visible ? 'fadeUp 1.2s ease 0.2s both' : 'none' }}>
          あなたは、父のことを<br />
          何%知っていますか。
        </h1>

        <p style={{ ...s.sub, animation: visible ? 'fadeUp 1.2s ease 0.35s both' : 'none' }}>
          5つの問いに、父と子が別々に答える。<br />
          ズレがわかる。言えなかった言葉が見つかる。<br />
          関係は、そこから変わりはじめる。
        </p>

        {/* 動画 */}
        <div style={{ ...s.videoWrap, animation: visible ? 'fadeUp 1.2s ease 0.45s both' : 'none' }}>
          <Player
            component={ChichikoePitch}
            inputProps={{ bgmUrl: import.meta.env.BASE_URL + 'bgm.mp3' }}
            durationInFrames={1800}
            compositionWidth={960}
            compositionHeight={540}
            fps={30}
            style={{ width: '100%' }}
            controls
          />
        </div>

        <div style={{ ...s.ctaRow, animation: visible ? 'fadeUp 1.2s ease 0.55s both' : 'none' }}>
          <button style={s.primary} onClick={() => navigate('/demo')}>
            答え合わせをはじめる
          </button>
          <button style={s.ghost} onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
            どんな体験？
          </button>
        </div>

        {/* データバー */}
        <div style={{ ...s.dataBar, animation: visible ? 'fadeUp 1.2s ease 0.65s both' : 'none' }}>
          {STATS.map((st, i) => (
            <div key={i} style={s.statItem}>
              <p style={s.statNum}>{st.num}</p>
              <p style={s.statLabel}>{st.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* About */}
      <section id="about" style={s.about}>
        <div style={s.aboutGrid}>
          {STEPS.map((st, i) => (
            <div key={i} style={s.step}>
              <div style={s.stepNum}>{String(i + 1).padStart(2, '0')}</div>
              <div style={s.stepTitle}>{st.title}</div>
              <div style={s.stepDesc}>{st.desc}</div>
            </div>
          ))}
        </div>

        {/* なぜLINEじゃないか */}
        <div style={s.whyBox}>
          <p style={s.whyTitle}>なぜ、LINEではなく父問なのか。</p>
          <p style={s.whyText}>
            LINEは会話のツールです。<br />
            父問は、沈黙のための空間です。<br /><br />
            お父さんは、子どもに見られながら答えを考えません。<br />
            父問では、父は一人で、自分のペースで、<br />
            誰にも邪魔されず、正直に向き合います。<br /><br />
            AIが生む詩は、あなたたちの会話の「代わり」ではなく、<br />
            会話を「始める理由」です。<br /><br />
            AIはさらに、あなたの回答の奥から<br />
            言いそびれていた言葉を一文で抽出します。<br />
            送るかどうかは、あなたが決める。
          </p>
        </div>

        <div style={s.insight}>
          <p style={s.insightQ}>「父は、毎朝ありがとうと言っていた。</p>
          <p style={s.insightQ}>声に出さないまま。」</p>
          <p style={s.insightSub}>— 父問デモより、AIが生成した詩の一節</p>
          <p style={s.insightA}>
            これは架空ではない。<br />
            実際に答えると、AIはあなたと父のズレをこう読み解く。
          </p>
        </div>

        <div style={s.startBtn}>
          <button style={s.primary} onClick={() => navigate('/demo')}>
            父問、はじめる →
          </button>
        </div>
      </section>

      <footer style={s.footer}>
        <p>父問 — ズレが、愛だった。</p>
      </footer>
    </div>
  )
}

const STATS = [
  { num: '20代の67%', label: '父に感謝を言葉で伝えたことがない' },
  { num: '父の日SNS', label: '母の日の1/3しか投稿されない' },
  { num: '平均4,200円', label: '父の日ギフト消費額（モノ）' },
]

const STEPS = [
  { title: 'あなたが答える', desc: 'お父さんについての5つの問いに、あなたが一人で答える。父は何も知らない。' },
  { title: '父にリンクを送る', desc: '「一緒にやってほしいことがある」それだけ送る。理由は書かない。父はリンクを開くだけ。アプリ不要。' },
  { title: 'ズレを、知る', desc: '両方が答えると、AIがズレを「詩」として読み解く。そしてAIは、あなたがずっと言えなかった言葉を見つけ出す。その言葉を、今日だけ送れる。' },
]

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  canvas: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  sponsorBar: { position: 'relative', zIndex: 20, background: 'rgba(200,145,58,0.08)', borderBottom: '1px solid rgba(200,145,58,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '8px 24px', flexWrap: 'wrap' },
  sponsorLabel: { fontSize: '10px', letterSpacing: '0.15em', color: 'var(--text-dimmer)' },
  sponsorBrand: { fontSize: '12px', letterSpacing: '0.1em', color: 'var(--amber)', fontWeight: 500 },
  sponsorDivider: { color: 'var(--text-dimmer)', opacity: 0.4 },
  countdown: { fontSize: '11px', letterSpacing: '0.08em', color: 'var(--text-dim)' },
  nav: { position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', padding: '28px 40px' },
  logoWrap: { display: 'flex', alignItems: 'baseline', gap: '10px' },
  logoKanji: { fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--amber)', letterSpacing: '0.1em' },
  logoKana: { fontSize: '11px', color: 'var(--text-dimmer)', letterSpacing: '0.2em' },
  main: { position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px 80px', gap: '28px' },
  eyebrow: { fontSize: '11px', letterSpacing: '0.18em', color: 'var(--amber)', opacity: 0 },
  title: { fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 5.5vw, 58px)', fontWeight: 300, lineHeight: 1.8, letterSpacing: '0.06em', color: 'var(--text)', opacity: 0 },
  sub: { fontSize: 'clamp(13px, 2vw, 16px)', lineHeight: 2.1, color: 'var(--text-dim)', maxWidth: '440px', opacity: 0 },
  videoWrap: { width: '100%', maxWidth: '820px', overflow: 'hidden', border: '1px solid var(--text-dimmer)', borderRadius: '2px', background: '#080807', opacity: 0 },
  ctaRow: { display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0 },
  primary: { padding: '14px 36px', background: 'var(--amber)', color: '#0a0a0a', borderRadius: '2px', fontSize: '15px', letterSpacing: '0.08em', fontWeight: 400 },
  ghost: { padding: '14px 28px', border: '1px solid rgba(200,145,58,0.35)', color: 'var(--text-dim)', borderRadius: '2px', fontSize: '14px' },
  dataBar: { display: 'flex', gap: '0', alignItems: 'stretch', opacity: 0, width: '100%', maxWidth: '600px', border: '1px solid var(--text-dimmer)', borderRadius: '2px' },
  statItem: { flex: 1, padding: '16px 12px', textAlign: 'center', borderRight: '1px solid var(--text-dimmer)', display: 'flex', flexDirection: 'column', gap: '6px' },
  statNum: { fontFamily: 'var(--serif)', fontSize: 'clamp(12px,2vw,15px)', color: 'var(--amber)', letterSpacing: '0.04em' },
  statLabel: { fontSize: '10px', lineHeight: 1.6, color: 'var(--text-dimmer)', letterSpacing: '0.04em' },
  about: { position: 'relative', zIndex: 10, maxWidth: '920px', margin: '0 auto', padding: '60px 24px' },
  aboutGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '72px' },
  step: { textAlign: 'left', padding: '28px', border: '1px solid var(--text-dimmer)', borderRadius: '2px' },
  stepNum: { fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--amber)', opacity: 0.5, marginBottom: '14px' },
  stepTitle: { fontSize: '15px', letterSpacing: '0.05em', marginBottom: '10px', color: 'var(--text)' },
  stepDesc: { fontSize: '13px', lineHeight: 2, color: 'var(--text-dim)' },
  whyBox: { padding: '48px', border: '1px solid rgba(200,145,58,0.2)', borderRadius: '2px', marginBottom: '56px', background: 'rgba(200,145,58,0.02)' },
  whyTitle: { fontFamily: 'var(--serif)', fontSize: 'clamp(16px,2.5vw,22px)', color: 'var(--text)', letterSpacing: '0.05em', marginBottom: '24px', fontWeight: 300 },
  whyText: { fontSize: '14px', lineHeight: 2.3, color: 'var(--text-dim)' },
  insight: { textAlign: 'center', padding: '56px 0', borderTop: '1px solid var(--text-dimmer)', borderBottom: '1px solid var(--text-dimmer)', marginBottom: '56px' },
  insightQ: { fontFamily: 'var(--serif)', fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 300, color: 'var(--text)', lineHeight: 1.9 },
  insightSub: { fontSize: '11px', color: 'var(--amber)', letterSpacing: '0.12em', margin: '16px 0 24px' },
  insightA: { fontSize: '14px', lineHeight: 2.2, color: 'var(--text-dim)' },
  startBtn: { display: 'flex', justifyContent: 'center' },
  footer: { position: 'relative', zIndex: 10, textAlign: 'center', padding: '20px', fontSize: '11px', color: 'var(--text-dimmer)', letterSpacing: '0.1em', borderTop: '1px solid var(--text-dimmer)' },
}

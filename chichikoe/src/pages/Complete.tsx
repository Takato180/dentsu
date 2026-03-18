import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Complete() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number, t = 0
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const stars = Array(100).fill(0).map(() => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2, speed: Math.random() * 0.4 + 0.05,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        const alpha = 0.08 + (Math.sin(t * s.speed + s.x * 10) * 0.5 + 0.5) * 0.4
        ctx.beginPath(); ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,145,58,${alpha})`; ctx.fill()
      })
      t += 0.02; raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  const qas: { question: string; childAnswer: string; fatherAnswer: string }[] = state?.qas ?? []
  const fatherName: string = state?.fatherName || 'お父さん'
  const poem: string = state?.poem || ''
  const matchCount = Math.floor(qas.length * 0.4)
  const zureCount = qas.length - matchCount

  const shareText = `父の日、${fatherName}と答え合わせをしました。\n\n${qas.length}問中、ズレたのは${zureCount}問。\n\n${poem}\n\n#父問 #ズレが愛だった #父の日2026`

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={s.canvas} />

      <div style={s.content}>
        {/* ズレカード */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <p style={s.cardDate}>2026.6.21</p>
            <p style={s.cardTitle}>父問</p>
            <p style={s.cardSub}>{fatherName}との答え合わせ</p>
          </div>

          <div style={s.scores}>
            <div style={s.scoreItem}>
              <p style={s.scoreNum}>{qas.length}</p>
              <p style={s.scoreLabel}>問</p>
            </div>
            <div style={s.scoreDivider} />
            <div style={s.scoreItem}>
              <p style={{ ...s.scoreNum, color: 'var(--amber)' }}>{zureCount}</p>
              <p style={s.scoreLabel}>ズレ</p>
            </div>
            <div style={s.scoreDivider} />
            <div style={s.scoreItem}>
              <p style={s.scoreNum}>{matchCount}</p>
              <p style={s.scoreLabel}>一致</p>
            </div>
          </div>

          {poem && (
            <div style={s.poemBox}>
              <p style={s.poemText}>{poem}</p>
            </div>
          )}

          <p style={s.cardFooter}>ズレが、愛だった。</p>
        </div>

        {/* QA list */}
        {qas.length > 0 && (
          <div style={s.qaList}>
            {qas.map((qa, i) => (
              <div key={i} style={s.qaRow}>
                <p style={s.qaQ}>{qa.question}</p>
                <div style={s.qaPair}>
                  <div style={s.qaBox}>
                    <p style={s.qaLabel}>あなた</p>
                    <p style={s.qaAns}>{qa.childAnswer}</p>
                  </div>
                  <div style={s.qaDivider} />
                  <div style={{ ...s.qaBox, alignItems: 'flex-end' as const }}>
                    <p style={{ ...s.qaLabel, color: 'var(--amber)' }}>{fatherName}</p>
                    <p style={{ ...s.qaAns, textAlign: 'right' as const }}>{qa.fatherAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share */}
        <div style={s.shareSection}>
          <p style={s.shareLabel}>シェアする</p>
          <div style={s.shareRow}>
            <button style={s.shareBtn} onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}>
              X (Twitter)
            </button>
          </div>
        </div>

        <button style={s.again} onClick={() => navigate('/demo')}>もう一度やってみる</button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  canvas: { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 },
  content: { position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '60px 24px 80px', width: '100%', maxWidth: '540px', animation: 'fadeUp 1s ease both' },
  card: { width: '100%', border: '1px solid rgba(200,145,58,0.3)', borderRadius: '2px', padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(200,145,58,0.03)' },
  cardHeader: { textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' },
  cardDate: { fontSize: '11px', letterSpacing: '0.2em', color: 'var(--amber)', opacity: 0.7 },
  cardTitle: { fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--text)', letterSpacing: '0.1em' },
  cardSub: { fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.05em' },
  scores: { display: 'flex', justifyContent: 'center', gap: '0', alignItems: 'center' },
  scoreItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0 28px' },
  scoreNum: { fontFamily: 'var(--serif)', fontSize: '36px', color: 'var(--text)', lineHeight: 1 },
  scoreLabel: { fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-dimmer)' },
  scoreDivider: { width: '1px', height: '40px', background: 'var(--text-dimmer)' },
  poemBox: { padding: '20px 24px', border: '1px solid rgba(200,145,58,0.15)', borderRadius: '2px' },
  poemText: { fontFamily: 'var(--serif)', fontSize: '14px', lineHeight: 2.3, color: 'rgba(232,224,213,0.75)', fontStyle: 'italic', whiteSpace: 'pre-wrap' as const, textAlign: 'center' },
  cardFooter: { textAlign: 'center', fontSize: '12px', letterSpacing: '0.15em', color: 'var(--amber)', opacity: 0.7 },
  qaList: { width: '100%', display: 'flex', flexDirection: 'column', gap: '0' },
  qaRow: { padding: '16px 0', borderBottom: '1px solid var(--text-dimmer)', display: 'flex', flexDirection: 'column', gap: '10px' },
  qaQ: { fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.04em' },
  qaPair: { display: 'flex', gap: '0', alignItems: 'flex-start' },
  qaBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  qaLabel: { fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-dimmer)' },
  qaAns: { fontSize: '14px', color: 'var(--text)', lineHeight: 1.8 },
  qaDivider: { width: '1px', background: 'rgba(200,145,58,0.2)', margin: '0 14px', minHeight: '40px' },
  shareSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  shareLabel: { fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-dimmer)' },
  shareRow: { display: 'flex', gap: '10px' },
  shareBtn: { padding: '10px 24px', border: '1px solid rgba(200,145,58,0.35)', borderRadius: '2px', fontSize: '13px', color: 'var(--amber)', letterSpacing: '0.05em' },
  again: { fontSize: '13px', color: 'var(--text-dimmer)', textDecoration: 'underline', textDecorationColor: 'var(--text-dimmer)', letterSpacing: '0.06em' },
}

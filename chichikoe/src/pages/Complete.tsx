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

  const qas: { question: string; childPrompt?: string; childAnswer: string; fatherAnswer: string }[] = state?.qas ?? []
  const fatherName: string = state?.fatherName || 'お父さん'
  const poem: string = state?.poem || ''
  const zureCount: number = state?.zureCount ?? Math.floor(qas.length * 0.6)
  const matchCount = qas.length - zureCount
  const unsaidMsg: string = state?.unsaidMsg || ''

  const shareText = `父の日、${fatherName}と答え合わせをしました。\n\n${qas.length}問中、ズレたのは${zureCount}問。\n${unsaidMsg ? `\nAIが見つけた言葉：「${unsaidMsg}」\n` : ''}\n${poem.split('\n').slice(0, 2).join('\n')}\n\n#父問2026 #ズレが愛だった #ちちとい`
  const lineText = `父問で、${fatherName}と答え合わせしました。${qas.length}問中${zureCount}問ズレてた。あなたも試してみて→ https://takato180.github.io/dentsu/`

  return (
    <div style={s.root}>
      <canvas ref={canvasRef} style={s.canvas} />

      <div style={s.content}>

        {/* スポンサーバー */}
        <div style={s.sponsorBadge}>
          <span style={s.sponsorText}>presented by NTT docomo</span>
        </div>

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
              <p style={s.scoreLabel}>共鳴</p>
            </div>
          </div>

          {poem && (
            <div style={s.poemBox}>
              <div style={s.poemVertical}>
                {poem.split('\n').filter(l => l.trim()).map((line, i) => (
                  <p key={i} style={s.poemLine}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {unsaidMsg && (
            <div style={s.unsaidOnCard}>
              <p style={s.unsaidOnCardLabel}>言いそびれていた言葉</p>
              <p style={s.unsaidOnCardText}>「{unsaidMsg}」</p>
            </div>
          )}

          <p style={s.cardFooter}>ズレが、愛だった。</p>

          <div style={s.cardQr}>
            <p style={s.cardQrText}>#父問2026</p>
          </div>
        </div>

        {/* QA list */}
        {qas.length > 0 && (
          <div style={s.qaList}>
            {qas.map((qa, i) => (
              <div key={i} style={s.qaRow}>
                <p style={s.qaQ}>{qa.childPrompt ?? qa.question}</p>
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
            <button style={s.shareBtn} onClick={() =>
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')
            }>
              X (Twitter)
            </button>
            <button style={{ ...s.shareBtn, background: '#06C755', color: '#fff', border: 'none' }} onClick={() =>
              window.open(`https://line.me/R/msg/text/?${encodeURIComponent(lineText)}`, '_blank')
            }>
              LINE
            </button>
          </div>
          <p style={s.screenshotHint}>スクリーンショットしてInstagramストーリーズにも</p>
        </div>

        {/* docomo CTA */}
        <div style={s.sponsorCta}>
          <p style={s.sponsorCtaText}>
            ズレを埋めるより、<br />
            ズレたまま、つながろう。
          </p>
          <button style={s.sponsorCtaBtn}>
            家族割で、もっと気軽に電話できる
          </button>
          <p style={s.sponsorCtaNote}>presented by NTT docomo</p>
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
  sponsorBadge: { padding: '6px 16px', border: '1px solid rgba(200,145,58,0.2)', borderRadius: '20px' },
  sponsorText: { fontSize: '10px', letterSpacing: '0.15em', color: 'var(--text-dimmer)' },
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
  poemVertical: { display: 'flex', flexDirection: 'column', gap: '2px' },
  poemLine: { fontFamily: 'var(--serif)', fontSize: '14px', lineHeight: 2.3, color: 'rgba(232,224,213,0.75)', fontStyle: 'italic', whiteSpace: 'pre-wrap' as const, textAlign: 'center' },
  unsaidOnCard: { padding: '16px 20px', background: 'rgba(200,145,58,0.06)', borderRadius: '2px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' },
  unsaidOnCardLabel: { fontSize: '9px', letterSpacing: '0.2em', color: 'var(--amber)', opacity: 0.7 },
  unsaidOnCardText: { fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--text)', lineHeight: 1.9, fontStyle: 'italic' },
  cardFooter: { textAlign: 'center', fontSize: '12px', letterSpacing: '0.15em', color: 'var(--amber)', opacity: 0.7 },
  cardQr: { textAlign: 'center' },
  cardQrText: { fontSize: '10px', letterSpacing: '0.2em', color: 'var(--text-dimmer)' },
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
  screenshotHint: { fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.06em' },
  sponsorCta: { width: '100%', padding: '28px', border: '1px solid rgba(200,145,58,0.2)', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', background: 'rgba(200,145,58,0.03)', textAlign: 'center' },
  sponsorCtaText: { fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--text)', lineHeight: 2, fontWeight: 300, letterSpacing: '0.03em' },
  sponsorCtaBtn: { padding: '12px 28px', background: 'var(--amber)', color: '#0a0a0a', borderRadius: '2px', fontSize: '14px', letterSpacing: '0.08em', fontWeight: 400 },
  sponsorCtaNote: { fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.1em' },
  again: { fontSize: '13px', color: 'var(--text-dimmer)', textDecoration: 'underline', textDecorationColor: 'var(--text-dimmer)', letterSpacing: '0.06em' },
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ── モックデータ（キャンペーン14日間想定）─────────────────────────────────────
const METRICS = [
  { label: '参加者数', value: 12847, unit: '人', note: 'ローンチ14日間' },
  { label: '父への送信完了', value: 8203, unit: '件', note: '完了率 63.8%' },
  { label: '詩の生成数', value: 7891, unit: '件', note: '' },
  { label: '未送信メッセージ送信', value: 5102, unit: '件', note: '送信率 64.6%' },
  { label: 'ズレカードシェア', value: 4204, unit: '件', note: 'シェア率 53.3%' },
  { label: '電話CTA達成', value: 2109, unit: '件', note: '達成率 26.7%' },
  { label: 'SNSリーチ推計', value: 2300000, unit: '', note: 'カード経由' },
]

const PREFECTURES = [
  { name: '東京', x: 72, y: 44, count: 3241 },
  { name: '大阪', x: 56, y: 52, count: 1872 },
  { name: '福岡', x: 30, y: 62, count: 891 },
  { name: '名古屋', x: 62, y: 48, count: 1043 },
  { name: '仙台', x: 76, y: 34, count: 621 },
  { name: '札幌', x: 78, y: 18, count: 412 },
  { name: '広島', x: 44, y: 54, count: 538 },
  { name: '那覇', x: 40, y: 84, count: 287 },
  { name: '金沢', x: 58, y: 42, count: 334 },
  { name: '高松', x: 52, y: 56, count: 298 },
]

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toLocaleString()
}

function AnimatedNumber({ target }: { target: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const duration = 1800
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])
  return <>{fmt(val)}</>
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [dotVisible, setDotVisible] = useState<number[]>([])

  useEffect(() => {
    PREFECTURES.forEach((_, i) => {
      setTimeout(() => setDotVisible(prev => [...prev, i]), 300 + i * 200)
    })
  }, [])

  return (
    <div style={s.root}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate('/')}>← 父問</button>
        <p style={s.headerTitle}>Campaign Dashboard</p>
        <p style={s.headerSub}>2026.6.7 Launch — 14 days data</p>
      </div>

      <div style={s.body}>

        {/* キャンペーン指標 */}
        <div style={s.section}>
          <p style={s.sectionLabel}>CAMPAIGN METRICS</p>
          <div style={s.metricsGrid}>
            {METRICS.map((m, i) => (
              <div key={i} style={s.metricCard}>
                <p style={s.metricLabel}>{m.label}</p>
                <p style={s.metricValue}>
                  <AnimatedNumber target={m.value} />
                  {m.unit && <span style={s.metricUnit}>{m.unit}</span>}
                </p>
                {m.note && <p style={s.metricNote}>{m.note}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* ファネル */}
        <div style={s.section}>
          <p style={s.sectionLabel}>CONVERSION FUNNEL</p>
          <div style={s.funnel}>
            {[
              { label: '参加', value: 12847, pct: 100 },
              { label: '送信完了', value: 8203, pct: 63.8 },
              { label: '詩生成', value: 7891, pct: 61.4 },
              { label: '言葉送信', value: 5124, pct: 39.9 },
              { label: 'シェア', value: 4204, pct: 32.7 },
              { label: '電話', value: 2109, pct: 16.4 },
            ].map((row, i) => (
              <div key={i} style={s.funnelRow}>
                <p style={s.funnelLabel}>{row.label}</p>
                <div style={s.funnelTrack}>
                  <div style={{ ...s.funnelFill, width: `${row.pct}%`, transitionDelay: `${i * 0.15}s` }} />
                </div>
                <p style={s.funnelVal}>{row.value.toLocaleString()}</p>
                <p style={s.funnelPct}>{row.pct}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* 日本地図（SVG簡易） */}
        <div style={s.section}>
          <p style={s.sectionLabel}>PARTICIPATION MAP</p>
          <div style={s.mapWrap}>
            <svg viewBox="0 0 100 100" style={s.mapSvg} xmlns="http://www.w3.org/2000/svg">
              {/* 日本の輪郭（簡易） */}
              <path d="M 35 20 Q 40 15 48 18 Q 55 14 62 20 Q 70 22 75 30 Q 80 38 78 46 Q 76 52 72 54 Q 68 56 65 52 Q 60 50 58 54 Q 54 58 52 62 Q 48 66 44 64 Q 40 62 38 58 Q 34 54 30 56 Q 26 58 24 62 Q 22 66 20 70 Q 18 74 22 78 Q 26 82 30 80 Q 34 78 36 82 Q 38 86 42 84 Q 46 88 42 90 Q 38 92 35 88 Q 30 84 28 80 Q 24 76 20 74 Q 16 72 14 68 Q 12 64 16 60 Q 20 56 22 52 Q 24 48 22 44 Q 20 40 24 36 Q 28 32 32 28 Q 35 24 35 20 Z"
                fill="none" stroke="rgba(200,145,58,0.15)" strokeWidth="0.5" />
              {/* 北海道（簡易） */}
              <path d="M 70 14 Q 76 10 82 14 Q 88 18 86 24 Q 84 28 80 26 Q 76 24 72 20 Q 68 18 70 14 Z"
                fill="none" stroke="rgba(200,145,58,0.12)" strokeWidth="0.5" />
              {/* 九州（簡易） */}
              <path d="M 22 62 Q 26 58 30 62 Q 34 66 32 72 Q 30 76 26 74 Q 22 72 20 68 Q 18 64 22 62 Z"
                fill="none" stroke="rgba(200,145,58,0.12)" strokeWidth="0.5" />

              {PREFECTURES.map((p, i) => (
                <g key={i}>
                  {dotVisible.includes(i) && (
                    <>
                      <circle cx={p.x} cy={p.y} r={Math.sqrt(p.count / 300)} fill="rgba(200,145,58,0.25)" />
                      <circle cx={p.x} cy={p.y} r="1.5" fill="var(--amber)" opacity="0.9" />
                    </>
                  )}
                </g>
              ))}
            </svg>
            <div style={s.mapLegend}>
              {PREFECTURES.filter((_, i) => dotVisible.includes(i)).map((p, i) => (
                <div key={i} style={s.mapLegendItem}>
                  <span style={{ color: 'var(--amber)' }}>●</span>
                  <span>{p.name}</span>
                  <span style={{ color: 'var(--text-dimmer)' }}>{p.count.toLocaleString()}件</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ビジネスデータ */}
        <div style={s.section}>
          <p style={s.sectionLabel}>MARKET CONTEXT</p>
          <div style={s.insightGrid}>
            {[
              { q: '20代の67%', a: '父親に感謝を言葉で伝えたことがない', src: 'マクロミル調査 2023' },
              { q: '父の日SNS投稿', a: '母の日の1/3しか投稿されない', src: 'X (Twitter) データ 2024' },
              { q: '父の日ギフト', a: '平均4,200円。モノから体験へ転換が課題', src: '楽天市場調査 2024' },
              { q: '感情コンテンツ', a: 'ニュートラルな投稿の3.8倍シェアされる', src: 'NYT Viral Content Study' },
            ].map((item, i) => (
              <div key={i} style={s.insightCard}>
                <p style={s.insightQ}>{item.q}</p>
                <p style={s.insightA}>{item.a}</p>
                <p style={s.insightSrc}>{item.src}</p>
              </div>
            ))}
          </div>
        </div>

        {/* クライアント提案 */}
        <div style={s.section}>
          <p style={s.sectionLabel}>SPONSOR PROPOSAL</p>
          <div style={s.clientGrid}>
            {[
              { brand: 'NTT docomo', reason: '①電話CTA（家族割）②AIが抽出した「未送信の言葉」のLINE送信完了＝2段階コンバージョン。「家族とつながる」ブランド価値と完全一致。' },
              { brand: '明治安田生命', reason: '詩 → 未送信の言葉 → 「想いと一緒に安心を」でリード獲得。感情的ピークでの自然な保険訴求。「あとで電話」リマインダー登録でopt-in獲得。' },
              { brand: 'サントリー プレモル', reason: 'ズレカード完成後「このズレを、乾杯で埋めよう」EC誘導。父の日ギフトセット直接販売。シェア率×SNSリーチで純広告不要の拡散。' },
            ].map((c, i) => (
              <div key={i} style={s.clientCard}>
                <p style={s.clientBrand}>{c.brand}</p>
                <p style={s.clientReason}>{c.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 平均滞在時間 */}
        <div style={s.avgBox}>
          <p style={s.avgLabel}>平均滞在時間</p>
          <p style={s.avgVal}>8分43秒</p>
          <p style={s.avgNote}>一般的なブランドサイトの約6倍</p>
        </div>

      </div>

      <footer style={s.footer}>
        父問 2026 — Campaign Dashboard / For pitch use only
      </footer>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
  header: { padding: '24px 40px', borderBottom: '1px solid var(--text-dimmer)', display: 'flex', alignItems: 'baseline', gap: '20px' },
  back: { fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.05em' },
  headerTitle: { fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--text)', letterSpacing: '0.05em' },
  headerSub: { fontSize: '11px', color: 'var(--amber)', letterSpacing: '0.1em', marginLeft: 'auto' },
  body: { flex: 1, padding: '40px 40px 80px', maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '56px' },
  section: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionLabel: { fontSize: '10px', letterSpacing: '0.25em', color: 'var(--amber)', opacity: 0.7 },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' },
  metricCard: { padding: '20px 24px', border: '1px solid var(--text-dimmer)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '6px' },
  metricLabel: { fontSize: '11px', letterSpacing: '0.08em', color: 'var(--text-dimmer)' },
  metricValue: { fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--text)', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: '4px' },
  metricUnit: { fontSize: '13px', color: 'var(--text-dim)' },
  metricNote: { fontSize: '11px', color: 'var(--amber)', opacity: 0.7 },
  funnel: { display: 'flex', flexDirection: 'column', gap: '10px' },
  funnelRow: { display: 'grid', gridTemplateColumns: '80px 1fr 80px 50px', alignItems: 'center', gap: '12px' },
  funnelLabel: { fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '0.04em' },
  funnelTrack: { height: '4px', background: 'var(--text-dimmer)', borderRadius: '2px', overflow: 'hidden' },
  funnelFill: { height: '100%', background: 'var(--amber)', borderRadius: '2px', transition: 'width 1.5s ease' },
  funnelVal: { fontSize: '12px', color: 'var(--text)', textAlign: 'right' },
  funnelPct: { fontSize: '11px', color: 'var(--text-dimmer)' },
  mapWrap: { display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' },
  mapSvg: { width: '280px', height: '280px', background: 'rgba(200,145,58,0.02)', border: '1px solid var(--text-dimmer)', borderRadius: '2px' },
  mapLegend: { display: 'flex', flexDirection: 'column', gap: '8px' },
  mapLegendItem: { display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-dim)', alignItems: 'center' },
  insightGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  insightCard: { padding: '20px', border: '1px solid var(--text-dimmer)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '8px' },
  insightQ: { fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--amber)', letterSpacing: '0.03em' },
  insightA: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 },
  insightSrc: { fontSize: '10px', color: 'var(--text-dimmer)', letterSpacing: '0.06em', marginTop: '4px' },
  clientGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' },
  clientCard: { padding: '24px', border: '1px solid rgba(200,145,58,0.25)', borderRadius: '2px', background: 'rgba(200,145,58,0.02)', display: 'flex', flexDirection: 'column', gap: '10px' },
  clientBrand: { fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--amber)', letterSpacing: '0.05em' },
  clientReason: { fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.9 },
  avgBox: { padding: '40px', border: '1px solid rgba(200,145,58,0.3)', borderRadius: '2px', textAlign: 'center', background: 'rgba(200,145,58,0.03)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
  avgLabel: { fontSize: '11px', letterSpacing: '0.15em', color: 'var(--text-dimmer)' },
  avgVal: { fontFamily: 'var(--serif)', fontSize: '48px', color: 'var(--amber)', lineHeight: 1 },
  avgNote: { fontSize: '13px', color: 'var(--text-dim)', letterSpacing: '0.04em' },
  footer: { padding: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--text-dimmer)', borderTop: '1px solid var(--text-dimmer)', letterSpacing: '0.1em' },
}

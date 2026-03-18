import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion'

// ── helpers ──────────────────────────────────────────────────────────────────
const ease = Easing.out(Easing.cubic)

function fadeUp(frame: number, start: number, dur = 20) {
  return {
    opacity: interpolate(frame, [start, start + dur], [0, 1], { extrapolateRight: 'clamp', easing: ease }),
    transform: `translateY(${interpolate(frame, [start, start + dur], [18, 0], { extrapolateRight: 'clamp', easing: ease })}px)`,
  }
}

function fadeOut(frame: number, start: number, dur = 14) {
  return {
    opacity: interpolate(frame, [start, start + dur], [1, 0], { extrapolateRight: 'clamp' }),
  }
}

// ── sub-components ────────────────────────────────────────────────────────────

function Scene1({ frame }: { frame: number }) {
  // "お父さんの声を、最後に聞いたのはいつですか？"
  return (
    <AbsoluteFill style={sc.scene}>
      <div style={{ ...sc.center, gap: 0 }}>
        <p style={{ ...sc.serif, fontSize: 22, letterSpacing: '0.12em', color: '#b07830', opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp', easing: ease }) }}>
          — CHICHIKOE —
        </p>
        <p style={{ ...sc.serifBig, marginTop: 28, ...fadeUp(frame, 20, 30) }}>
          お父さんの声を、
        </p>
        <p style={{ ...sc.serifBig, ...fadeUp(frame, 38, 30) }}>
          最後に聞いたのは
        </p>
        <p style={{ ...sc.serifBig, ...fadeUp(frame, 56, 30) }}>
          いつですか？
        </p>
      </div>
    </AbsoluteFill>
  )
}

function Scene2({ frame }: { frame: number }) {
  // 父との日常会話の断片
  const dialogs = [
    { q: '「何が食べたい？」', a: '「別に、なんでもいい」', qF: 0, aF: 24 },
    { q: '「元気か？」', a: '「うん」', qF: 55, aF: 72 },
  ]
  return (
    <AbsoluteFill style={sc.scene}>
      <div style={sc.center}>
        {dialogs.map((d, i) => (
          <div key={i} style={{ marginBottom: 28, textAlign: 'center' }}>
            <p style={{ ...sc.dialog, color: '#e8e0d5', ...fadeUp(frame, d.qF, 18) }}>{d.q}</p>
            <p style={{ ...sc.dialog, color: '#c8913a', marginTop: 8, ...fadeUp(frame, d.aF, 18) }}>{d.a}</p>
          </div>
        ))}
        <p style={{
          ...sc.caption,
          marginTop: 40,
          ...fadeUp(frame, 90, 20),
          ...( frame > 115 ? fadeOut(frame, 115, 12) : {}),
        }}>
          その言葉の奥に、言えなかった言葉がある。
        </p>
      </div>
    </AbsoluteFill>
  )
}

function Scene3({ frame }: { frame: number }) {
  // AI質問生成モックUI
  const questions = [
    '仕事で一番辛かった時期は、いつですか？',
    '私が生まれた日のこと、覚えていますか？',
    '若い自分に一つだけ伝えるなら、何を言いますか？',
  ]
  return (
    <AbsoluteFill style={sc.scene}>
      <div style={sc.center}>
        <p style={{ ...sc.label, ...fadeUp(frame, 0, 18) }}>AI が選んだ、まだ聞いたことのない質問</p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 480 }}>
          {questions.map((q, i) => (
            <div key={i} style={{
              padding: '16px 20px',
              border: '1px solid rgba(200,145,58,0.3)',
              borderRadius: 2,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              ...fadeUp(frame, 16 + i * 22, 20),
            }}>
              <span style={{ color: '#c8913a', opacity: 0.5, fontFamily: 'serif', fontSize: 14, minWidth: 20 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.9, color: '#e8e0d5', letterSpacing: '0.03em' }}>{q}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

function Scene4({ frame }: { frame: number }) {
  // 声の波形 → 「今日、初めて聞いた」
  const bars = Array(36).fill(0).map((_, i) => {
    const h = 8 + (Math.sin((frame * 0.12) + i * 0.42) * 0.5 + 0.5) * 44
      + (Math.sin((frame * 0.19) + i * 0.28) * 0.5 + 0.5) * 18
    return Math.max(6, h)
  })
  const waveAlpha = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={sc.scene}>
      <div style={sc.center}>
        {/* waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 80, opacity: waveAlpha, marginBottom: 36 }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: `rgba(200,145,58,${0.35 + (h / 80) * 0.65})`,
            }} />
          ))}
        </div>
        <p style={{ ...sc.serifMid, ...fadeUp(frame, 30, 24) }}>今日、初めて聞いた。</p>
        <p style={{ ...sc.serifMid, ...fadeUp(frame, 52, 24) }}>お父さんが、泣いた。</p>
      </div>
    </AbsoluteFill>
  )
}

function Scene5({ frame }: { frame: number }) {
  // Final: logo + tagline
  const ringScale = interpolate(frame, [0, 40], [0.6, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2)) })
  return (
    <AbsoluteFill style={sc.scene}>
      <div style={sc.center}>
        <div style={{
          width: 90,
          height: 90,
          borderRadius: '50%',
          border: '1px solid rgba(200,145,58,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${ringScale})`,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' }),
          marginBottom: 28,
        }}>
          <span style={{ color: '#c8913a', fontSize: 28 }}>✦</span>
        </div>
        <p style={{ ...sc.serif, fontSize: 13, letterSpacing: '0.22em', color: '#c8913a', ...fadeUp(frame, 15, 20) }}>
          チチコエ
        </p>
        <p style={{ ...sc.serifBig, marginTop: 16, ...fadeUp(frame, 25, 24) }}>父の声を、未来へ。</p>
        <p style={{ ...sc.caption, marginTop: 24, ...fadeUp(frame, 45, 20) }}>
          父の日 2026.6.21
        </p>
      </div>
    </AbsoluteFill>
  )
}

// ── main composition ──────────────────────────────────────────────────────────

const SCENES = [
  { start: 0,   end: 90  },  // Scene1: 最後に聞いたのは
  { start: 82,  end: 200 },  // Scene2: 日常会話の断片
  { start: 192, end: 310 },  // Scene3: AI質問
  { start: 302, end: 410 },  // Scene4: 波形・泣いた
  { start: 402, end: 520 },  // Scene5: ロゴ・タグライン
]

export const ChichikoePitch: React.FC = () => {
  const frame = useCurrentFrame()
  useVideoConfig()

  // cross-fade opacity per scene
  const sceneOpacity = (i: number) => {
    const s = SCENES[i]
    const fadeInDur = 18
    const fadeOutDur = 12
    const fadeOutStart = s.end - fadeOutDur

    if (i < SCENES.length - 1) {
      return interpolate(
        frame,
        [s.start, s.start + fadeInDur, fadeOutStart, s.end],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    }
    return interpolate(frame, [s.start, s.start + fadeInDur], [0, 1], { extrapolateRight: 'clamp' })
  }

  const localFrame = (i: number) => Math.max(0, frame - SCENES[i].start)

  return (
    <AbsoluteFill style={{ background: '#080807' }}>
      {/* subtle vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        zIndex: 99,
      }} />

      {[Scene1, Scene2, Scene3, Scene4, Scene5].map((SceneComp, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, opacity: sceneOpacity(i) }}>
          <SceneComp frame={localFrame(i)} />
        </div>
      ))}
    </AbsoluteFill>
  )
}

// ── styles ────────────────────────────────────────────────────────────────────

const sc: Record<string, React.CSSProperties> = {
  scene: {
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 60px',
    gap: 4,
  },
  serifBig: {
    fontFamily: "'Noto Serif JP', serif",
    fontSize: 32,
    fontWeight: 300,
    color: '#e8e0d5',
    letterSpacing: '0.08em',
    lineHeight: 1.8,
  },
  serifMid: {
    fontFamily: "'Noto Serif JP', serif",
    fontSize: 26,
    fontWeight: 300,
    color: '#e8e0d5',
    letterSpacing: '0.08em',
    lineHeight: 1.9,
  },
  serif: {
    fontFamily: "'Noto Serif JP', serif",
    fontWeight: 300,
    color: '#e8e0d5',
    letterSpacing: '0.08em',
  },
  dialog: {
    fontFamily: "'Noto Serif JP', serif",
    fontSize: 20,
    fontWeight: 300,
    letterSpacing: '0.05em',
    lineHeight: 1.8,
  },
  caption: {
    fontSize: 14,
    color: 'rgba(232,224,213,0.55)',
    letterSpacing: '0.08em',
    lineHeight: 2,
    fontFamily: "'Noto Sans JP', sans-serif",
    fontWeight: 300,
  },
  label: {
    fontSize: 11,
    color: '#c8913a',
    letterSpacing: '0.18em',
    fontFamily: "'Noto Sans JP', sans-serif",
    fontWeight: 300,
    marginBottom: 8,
  },
}

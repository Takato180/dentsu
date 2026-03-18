import { AbsoluteFill, interpolate, useCurrentFrame, Easing, Audio } from 'remotion'

// ── helpers ───────────────────────────────────────────────────────────────────
const easeOut = Easing.out(Easing.cubic)

function fi(frame: number, from: number, to: number, inS: number, inE: number) {
  return interpolate(frame, [inS, inE], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut,
  })
}

function fadeUp(frame: number, start: number, dur = 20): React.CSSProperties {
  return {
    opacity: fi(frame, 0, 1, start, start + dur),
    transform: `translateY(${fi(frame, 14, 0, start, start + dur)}px)`,
  }
}

// ── 30fps × 60s = 1800 frames ─────────────────────────────────────────────────
// シーン構成（タイトなワンシーン＝約150〜200フレーム）
const S = {
  s1In: 0,    s1Out: 180,   // 0:00〜0:06  タイトル
  s2In: 165,  s2Out: 400,   // 0:05〜0:13  日常会話 → インサイト
  s3In: 385,  s3Out: 650,   // 0:13〜0:22  AI質問生成
  s4In: 635,  s4Out: 920,   // 0:21〜0:31  録音・波形・泣いた
  s5In: 905,  s5Out: 1200,  // 0:30〜0:40  タイムカプセル → 未来
  s6In: 1185, s6Out: 1500,  // 0:39〜0:50  「父の日だから」→ CTA
  s7In: 1485, s7Out: 1800,  // 0:49〜1:00  エンディング
}

// ── BG / layout helpers ───────────────────────────────────────────────────────
const CENTER: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', padding: '0 80px', gap: 6, height: '100%',
}

// ── Scenes ────────────────────────────────────────────────────────────────────

function Scene1({ f }: { f: number }) {
  return (
    <AbsoluteFill>
      <div style={CENTER}>
        <p style={{ ...T.eyebrow, ...fadeUp(f, 8) }}>— CHICHIKOE —</p>
        <p style={{ ...T.serifBig, fontSize: 36, ...fadeUp(f, 22) }}>お父さんの声を、</p>
        <p style={{ ...T.serifBig, fontSize: 36, ...fadeUp(f, 38) }}>最後に聞いたのは</p>
        <p style={{ ...T.serifBig, fontSize: 36, ...fadeUp(f, 54) }}>いつですか？</p>
      </div>
    </AbsoluteFill>
  )
}

function Scene2({ f }: { f: number }) {
  return (
    <AbsoluteFill>
      <div style={CENTER}>
        <p style={{ ...T.dialog, color: '#e8e0d5', ...fadeUp(f, 6) }}>「何が食べたい？」</p>
        <p style={{ ...T.dialog, color: '#c8913a', marginTop: 4, ...fadeUp(f, 22) }}>「別に、なんでもいい」</p>
        <div style={{ width: 36, height: 1, background: 'rgba(200,145,58,0.3)', margin: '24px 0', ...fadeUp(f, 50) }} />
        <p style={{ ...T.serifBig, fontSize: 26, ...fadeUp(f, 70) }}>「お父さんの若い頃の話、</p>
        <p style={{ ...T.serifBig, fontSize: 26, ...fadeUp(f, 88) }}>ちゃんと聞いたことがない」</p>
        <p style={{ ...T.caption, marginTop: 32, ...fadeUp(f, 130) }}>
          多くの人が、父を失ってから気づく。今なら、まだ間に合う。
        </p>
      </div>
    </AbsoluteFill>
  )
}

function Scene3({ f }: { f: number }) {
  const questions = [
    '仕事で一番辛かった時期は、いつですか？',
    '私が生まれた日のこと、覚えていますか？',
    '若い自分に一つだけ伝えるなら、何ですか？',
  ]
  return (
    <AbsoluteFill>
      <div style={CENTER}>
        <p style={{ ...T.label, ...fadeUp(f, 6) }}>AI が選んだ、まだ聞いたことのない質問</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 500, marginTop: 18 }}>
          {questions.map((q, i) => (
            <div key={i} style={{
              padding: '14px 20px',
              border: '1px solid rgba(200,145,58,0.3)',
              borderRadius: 2,
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: 'rgba(200,145,58,0.04)',
              ...fadeUp(f, 18 + i * 24, 20),
            }}>
              <span style={{ color: '#c8913a', opacity: 0.5, fontFamily: 'serif', fontSize: 13, minWidth: 20 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13, lineHeight: 1.9, color: '#e8e0d5', letterSpacing: '0.03em' }}>{q}</span>
            </div>
          ))}
        </div>
        <p style={{ ...T.caption, marginTop: 28, ...fadeUp(f, 100) }}>
          父のプロフィールをもとに、AIが「その人だけの質問」を生成する
        </p>
      </div>
    </AbsoluteFill>
  )
}

function Scene4({ f }: { f: number }) {
  const bars = Array(40).fill(0).map((_, i) =>
    8 + (Math.sin(f * 0.11 + i * 0.44) * 0.5 + 0.5) * 44
      + (Math.sin(f * 0.18 + i * 0.27) * 0.5 + 0.5) * 14
  )
  return (
    <AbsoluteFill>
      <div style={CENTER}>
        <p style={{ ...T.caption, ...fadeUp(f, 6) }}>お父さんに電話して、質問を読み上げる</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 80, margin: '28px 0', opacity: fi(f, 0, 1, 18, 38) }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              width: 3.5, height: Math.max(6, h), borderRadius: 2,
              background: `rgba(200,145,58,${0.3 + (h / 74) * 0.7})`,
            }} />
          ))}
        </div>
        <p style={{ ...T.serifBig, fontSize: 30, ...fadeUp(f, 60) }}>今日、初めて聞いた。</p>
        <p style={{ ...T.serifBig, fontSize: 26, ...fadeUp(f, 82) }}>お父さんが、泣いた。</p>
      </div>
    </AbsoluteFill>
  )
}

function Scene5({ f }: { f: number }) {
  const scale = interpolate(f, [8, 48], [0.6, 1], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.2))
  })
  return (
    <AbsoluteFill>
      <div style={CENTER}>
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          border: '1px solid rgba(200,145,58,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${scale})`, opacity: fi(f, 0, 1, 6, 28),
          marginBottom: 24,
        }}>
          <span style={{ color: '#c8913a', fontSize: 28 }}>✦</span>
        </div>
        <p style={{ ...T.serifBig, ...fadeUp(f, 30) }}>声を、タイムカプセルへ。</p>
        <p style={{ ...T.caption, marginTop: 20, ...fadeUp(f, 55) }}>
          届けたい未来の日を選ぶ
        </p>
        <p style={{ ...T.caption, color: '#c8913a', marginTop: 8, ...fadeUp(f, 75) }}>
          結婚式の朝、孫が生まれた日、定年の日
        </p>
        <div style={{ width: 36, height: 1, background: 'rgba(200,145,58,0.25)', margin: '28px 0', ...fadeUp(f, 110) }} />
        <p style={{ ...T.serifBig, fontSize: 22, ...fadeUp(f, 120) }}>「お前が生まれた日、俺は泣いてたんだ。」</p>
        <p style={{ ...T.caption, marginTop: 8, ...fadeUp(f, 140) }}>— 10年後、結婚式の朝に届いた声</p>
      </div>
    </AbsoluteFill>
  )
}

function Scene6({ f }: { f: number }) {
  return (
    <AbsoluteFill>
      <div style={CENTER}>
        <p style={{ ...T.serifBig, fontSize: 34, ...fadeUp(f, 10) }}>父の日だから、</p>
        <p style={{ ...T.serifBig, fontSize: 34, ...fadeUp(f, 30) }}>初めて聞けた。</p>
        <p style={{ ...T.caption, marginTop: 36, ...fadeUp(f, 70) }}>毎年来る父の日が、今年から変わる。</p>
        <div style={{
          marginTop: 48, padding: '14px 40px',
          background: '#c8913a', borderRadius: 2,
          opacity: fi(f, 0, 1, 110, 130),
          transform: `translateY(${fi(f, 12, 0, 110, 130)}px)`,
        }}>
          <p style={{ color: '#080807', fontSize: 15, letterSpacing: '0.12em', fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>
            チチコエ、はじめる
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}

function Scene7({ f }: { f: number }) {
  const scale = interpolate(f, [10, 50], [0.5, 1], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1))
  })
  return (
    <AbsoluteFill>
      <div style={CENTER}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: '1px solid rgba(200,145,58,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${scale})`, opacity: fi(f, 0, 1, 8, 30),
          marginBottom: 28,
        }}>
          <div style={{
            width: 66, height: 66, borderRadius: '50%',
            background: 'rgba(200,145,58,0.08)',
            border: '1px solid rgba(200,145,58,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#c8913a', fontSize: 24 }}>✦</span>
          </div>
        </div>
        <p style={{ ...T.eyebrow, ...fadeUp(f, 20) }}>チチコエ</p>
        <p style={{ ...T.serifBig, fontSize: 34, marginTop: 12, ...fadeUp(f, 35) }}>父の声を、未来へ。</p>
        <p style={{ ...T.caption, marginTop: 36, ...fadeUp(f, 75) }}>父の日 2026.6.21</p>
      </div>
    </AbsoluteFill>
  )
}

// ── Main Composition ──────────────────────────────────────────────────────────

const SCENE_DEFS = [
  { Comp: Scene1, inF: S.s1In, outF: S.s1Out },
  { Comp: Scene2, inF: S.s2In, outF: S.s2Out },
  { Comp: Scene3, inF: S.s3In, outF: S.s3Out },
  { Comp: Scene4, inF: S.s4In, outF: S.s4Out },
  { Comp: Scene5, inF: S.s5In, outF: S.s5Out },
  { Comp: Scene6, inF: S.s6In, outF: S.s6Out },
  { Comp: Scene7, inF: S.s7In, outF: S.s7Out },
]

export const ChichikoePitch: React.FC = () => {
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{ background: '#080807' }}>
      {/* BGM: 直接パスで指定 */}
      <Audio src="/bgm.mp3" volume={0.65} />

      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)',
      }} />

      {SCENE_DEFS.map(({ Comp, inF, outF }, i) => {
        const isLast = i === SCENE_DEFS.length - 1
        const fadeD = 20
        const opacity = isLast
          ? fi(frame, 0, 1, inF, inF + fadeD)
          : interpolate(frame, [inF, inF + fadeD, outF - fadeD, outF], [0, 1, 1, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            })
        if (opacity <= 0.01) return null
        return (
          <div key={i} style={{ position: 'absolute', inset: 0, opacity }}>
            <Comp f={Math.max(0, frame - inF)} />
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

// ── Type styles ───────────────────────────────────────────────────────────────
const T: Record<string, React.CSSProperties> = {
  serifBig: {
    fontFamily: "'Noto Serif JP', serif",
    fontSize: 32, fontWeight: 300,
    color: '#e8e0d5', letterSpacing: '0.08em', lineHeight: 1.8,
  },
  dialog: {
    fontFamily: "'Noto Serif JP', serif",
    fontSize: 22, fontWeight: 300,
    letterSpacing: '0.05em', lineHeight: 1.8,
  },
  caption: {
    fontSize: 13, lineHeight: 2.1,
    color: 'rgba(232,224,213,0.55)',
    letterSpacing: '0.06em',
    fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300,
  },
  label: {
    fontSize: 11, letterSpacing: '0.2em',
    color: '#c8913a',
    fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 300,
  },
  eyebrow: {
    fontSize: 12, letterSpacing: '0.22em',
    color: '#c8913a',
    fontFamily: "'Noto Serif JP', serif", fontWeight: 300,
  },
}

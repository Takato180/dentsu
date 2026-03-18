import { AbsoluteFill, interpolate, useCurrentFrame, Easing, Audio } from 'remotion'

const easeOut = Easing.out(Easing.cubic)
const easeBack = Easing.out(Easing.back(1.15))

function fi(frame: number, from: number, to: number, s: number, e: number, easing = easeOut) {
  return interpolate(frame, [s, e], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing })
}
function fu(f: number, start: number, dur = 22): React.CSSProperties {
  return { opacity: fi(f, 0, 1, start, start + dur), transform: `translateY(${fi(f, 16, 0, start, start + dur)}px)` }
}
function fo(f: number, start: number, dur = 16): React.CSSProperties {
  return { opacity: fi(f, 1, 0, start, start + dur) }
}

// 30fps × 60s = 1800 frames
const S = {
  s1: { i: 0,    o: 200  },  // 0:00〜0:06  問い
  s2: { i: 185,  o: 430  },  // 0:06〜0:14  ネクタイ・ビール → 本当に知ってる？
  s3: { i: 415,  o: 680  },  // 0:14〜0:23  問いが現れる → 子が答える
  s4: { i: 665,  o: 940  },  // 0:22〜0:31  父にリンクを送る → 父が答える
  s5: { i: 925,  o: 1220 },  // 0:31〜0:41  ズレの可視化
  s6: { i: 1205, o: 1500 },  // 0:40〜0:50  AIの詩 + 「父の日だから」
  s7: { i: 1485, o: 1800 },  // 0:49〜1:00  父問ロゴ + CTA
}

const C: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', padding: '0 80px', gap: 6, height: '100%',
}

// ── Scene 1: 「毎年、父の日が来る。」
function Scene1({ f }: { f: number }) {
  return (
    <AbsoluteFill>
      <div style={C}>
        <p style={{ ...T.caption, ...fu(f, 8) }}>毎年、父の日が来る。</p>
        <p style={{ ...T.serifBig, fontSize: 40, marginTop: 20, ...fu(f, 30) }}>
          今年は、何をあげますか？
        </p>
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 2: ギフト → 「本当に知っていますか？」
function Scene2({ f }: { f: number }) {
  const gifts = ['ネクタイ', 'ビール', '財布', '肉']
  return (
    <AbsoluteFill>
      <div style={C}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {gifts.map((g, i) => (
            <div key={i} style={{
              ...fu(f, 8 + i * 14),
              padding: '10px 22px',
              border: '1px solid rgba(232,224,213,0.2)',
              borderRadius: 2, fontSize: 15,
              color: fi(f, 1, 0.2, 80, 110) > 0.2 ? `rgba(232,224,213,${fi(f, 0, 1, 8 + i * 14, 28 + i * 14)})` : 'rgba(232,224,213,0.2)',
              textDecoration: f > 80 ? 'line-through' : 'none',
              transition: 'all 0.3s',
            }}>{g}</div>
          ))}
        </div>
        <p style={{ ...T.serifBig, fontSize: 30, ...fu(f, 105) }}>
          でも、お父さんのことを
        </p>
        <p style={{ ...T.serifBig, fontSize: 30, ...fu(f, 122) }}>
          本当に知っていますか？
        </p>
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 3: 問いが現れる → 子が答える
function Scene3({ f }: { f: number }) {
  const typed = '私が生まれた日'
  const chars = typed.split('')
  const typeStart = 100
  const typeSpeed = 6
  return (
    <AbsoluteFill>
      <div style={C}>
        <p style={{ ...T.label, ...fu(f, 8) }}>父の日に、こんな問いに答えてみてください</p>
        <div style={{
          margin: '24px 0', padding: '24px 32px',
          border: '1px solid rgba(200,145,58,0.35)',
          borderRadius: 2, maxWidth: 480, width: '100%',
          background: 'rgba(200,145,58,0.04)',
          ...fu(f, 20),
        }}>
          <p style={{ ...T.serif, fontSize: 18, lineHeight: 2 }}>
            お父さんが人生で一番<br />嬉しかった瞬間は？
          </p>
        </div>

        {/* 子の回答がタイプされていく */}
        {f > typeStart - 10 && (
          <div style={{ ...fu(f, typeStart - 10), textAlign: 'left', width: '100%', maxWidth: 480 }}>
            <p style={{ ...T.caption, marginBottom: 8 }}>あなたの回答：</p>
            <p style={{ ...T.serif, fontSize: 20, color: '#e8e0d5', letterSpacing: '0.08em' }}>
              「{chars.slice(0, Math.floor(Math.max(0, f - typeStart) / typeSpeed)).join('')}
              {f > typeStart && Math.floor((f - typeStart) / typeSpeed) < chars.length
                ? <span style={{ borderRight: '2px solid #c8913a', animation: 'pulse 1s infinite' }}> </span>
                : '」'
              }
            </p>
          </div>
        )}
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 4: 父にリンク → 父の回答
function Scene4({ f }: { f: number }) {
  return (
    <AbsoluteFill>
      <div style={C}>
        {/* Send to father */}
        <div style={{ ...fu(f, 8), ...fo(f, 100, 20), marginBottom: 12 }}>
          <p style={{ ...T.caption, marginBottom: 16 }}>父にリンクを送る</p>
          <div style={{
            padding: '14px 28px', background: '#c8913a',
            borderRadius: 2, display: 'inline-block',
          }}>
            <p style={{ color: '#080807', fontSize: 14, letterSpacing: '0.1em' }}>LINEで送る</p>
          </div>
        </div>

        {/* Father's POV */}
        <div style={{ ...fu(f, 115), width: '100%', maxWidth: 480 }}>
          <p style={{ ...T.label, marginBottom: 16 }}>父の回答：</p>
          <div style={{
            padding: '24px 32px',
            border: '1px solid rgba(200,145,58,0.2)',
            borderRadius: 2, background: 'rgba(200,145,58,0.03)',
          }}>
            <p style={{ ...T.serif, fontSize: 16, color: 'rgba(232,224,213,0.7)', marginBottom: 12 }}>
              お父さんが人生で一番嬉しかった瞬間は？
            </p>
            <p style={{ ...T.serif, fontSize: 20, color: '#e8e0d5', ...fu(f, 140) }}>
              「会社で一番の契約が取れた時」
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 5: ズレの可視化
function Scene5({ f }: { f: number }) {
  const gapW = fi(f, 0, 1, 40, 100, easeBack)
  return (
    <AbsoluteFill>
      <div style={C}>
        <p style={{ ...T.label, ...fu(f, 8) }}>答え合わせ</p>

        <div style={{ display: 'flex', gap: 0, width: '100%', maxWidth: 520, marginTop: 24 }}>
          {/* 子の答え */}
          <div style={{
            flex: 1, padding: '20px 16px',
            border: '1px solid rgba(200,145,58,0.25)',
            borderRight: 'none', borderRadius: '2px 0 0 2px',
            ...fu(f, 20),
          }}>
            <p style={{ ...T.label, marginBottom: 12, textAlign: 'left' }}>あなた</p>
            <p style={{ ...T.serif, fontSize: 16, color: '#e8e0d5', textAlign: 'left' }}>私が生まれた日</p>
          </div>

          {/* ズレ表示 */}
          <div style={{
            width: `${gapW * 60}px`, minWidth: 40,
            background: 'rgba(200,145,58,0.08)',
            borderTop: '1px solid rgba(200,145,58,0.25)',
            borderBottom: '1px solid rgba(200,145,58,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: fi(f, 0, 1, 40, 70),
          }}>
            <p style={{ fontSize: 10, color: '#c8913a', letterSpacing: '0.1em', writingMode: 'vertical-rl' }}>
              ズ　レ
            </p>
          </div>

          {/* 父の答え */}
          <div style={{
            flex: 1, padding: '20px 16px',
            border: '1px solid rgba(200,145,58,0.25)',
            borderLeft: 'none', borderRadius: '0 2px 2px 0',
            ...fu(f, 20),
          }}>
            <p style={{ ...T.label, marginBottom: 12, textAlign: 'right' }}>お父さん</p>
            <p style={{ ...T.serif, fontSize: 16, color: '#e8e0d5', textAlign: 'right' }}>
              仕事で大きな<br />契約が取れた時
            </p>
          </div>
        </div>

        <p style={{ ...T.serifBig, fontSize: 26, marginTop: 44, ...fu(f, 130) }}>
          ズレていた。
        </p>
        <p style={{ ...T.serifBig, fontSize: 26, ...fu(f, 150) }}>
          でも、これが愛だった。
        </p>
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 6: AIの詩 + 「父の日だから」
function Scene6({ f }: { f: number }) {
  return (
    <AbsoluteFill>
      <div style={C}>
        <p style={{ ...T.label, ...fu(f, 8) }}>AIが読み解いたズレ</p>
        <div style={{
          marginTop: 20, padding: '28px 36px',
          border: '1px solid rgba(200,145,58,0.2)',
          borderRadius: 2, maxWidth: 500,
          background: 'rgba(200,145,58,0.03)',
          ...fu(f, 20),
        }}>
          <p style={{ ...T.serif, fontSize: 15, lineHeight: 2.2, color: 'rgba(232,224,213,0.8)', fontStyle: 'italic' }}>
            「お父さんの記憶の中のあなたは、<br />
            まだ生まれたての頃のまま止まっています。<br />
            あなたの記憶の中の父は、<br />
            いつも仕事をしている背中でした。<br />
            ふたりとも、同じくらい<br />お互いを想っていた。」
          </p>
        </div>
        <div style={{ width: 36, height: 1, background: 'rgba(200,145,58,0.3)', margin: '32px 0', ...fu(f, 100) }} />
        <p style={{ ...T.serifBig, fontSize: 28, ...fu(f, 110) }}>父の日だから、</p>
        <p style={{ ...T.serifBig, fontSize: 28, ...fu(f, 128) }}>初めて知れた。</p>
      </div>
    </AbsoluteFill>
  )
}

// ── Scene 7: 父問ロゴ + CTA
function Scene7({ f }: { f: number }) {
  const scale = fi(f, 0.5, 1, 10, 50, easeBack)
  return (
    <AbsoluteFill>
      <div style={C}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: '1px solid rgba(200,145,58,0.4)',
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
            <p style={{ fontFamily: 'serif', fontSize: 22, color: '#c8913a', letterSpacing: '0.05em' }}>父問</p>
          </div>
        </div>
        <p style={{ ...T.eyebrow, ...fu(f, 30) }}>ちちとい</p>
        <p style={{ ...T.serifBig, fontSize: 32, marginTop: 14, ...fu(f, 44) }}>
          ズレが、愛だった。
        </p>
        <p style={{ ...T.caption, marginTop: 28, ...fu(f, 72) }}>
          父の日 2026.6.21 — その日だけ開きます
        </p>
        <div style={{
          marginTop: 40, padding: '13px 40px',
          background: '#c8913a', borderRadius: 2,
          opacity: fi(f, 0, 1, 100, 120),
          transform: `translateY(${fi(f, 12, 0, 100, 120)}px)`,
        }}>
          <p style={{ color: '#080807', fontSize: 14, letterSpacing: '0.12em', fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 400 }}>
            父問、はじめる
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const SCENES = [
  { Comp: Scene1, ...S.s1 },
  { Comp: Scene2, ...S.s2 },
  { Comp: Scene3, ...S.s3 },
  { Comp: Scene4, ...S.s4 },
  { Comp: Scene5, ...S.s5 },
  { Comp: Scene6, ...S.s6 },
  { Comp: Scene7, ...S.s7 },
]

export const ChichikoePitch: React.FC<{ bgmUrl?: string }> = ({ bgmUrl }) => {
  const frame = useCurrentFrame()
  return (
    <AbsoluteFill style={{ background: '#080807' }}>
      {bgmUrl && <Audio src={bgmUrl} volume={0.6} />}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.6) 100%)',
      }} />
      {SCENES.map(({ Comp, i: inF, o: outF }, idx) => {
        const last = idx === SCENES.length - 1
        const fd = 20
        const opacity = last
          ? fi(frame, 0, 1, inF, inF + fd)
          : interpolate(frame, [inF, inF + fd, outF - fd, outF], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
        if (opacity <= 0.01) return null
        return (
          <div key={idx} style={{ position: 'absolute', inset: 0, opacity }}>
            <Comp f={Math.max(0, frame - inF)} />
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

const T: Record<string, React.CSSProperties> = {
  serifBig: { fontFamily: "'Noto Serif JP',serif", fontSize: 32, fontWeight: 300, color: '#e8e0d5', letterSpacing: '0.08em', lineHeight: 1.8 },
  serif: { fontFamily: "'Noto Serif JP',serif", fontWeight: 300, color: '#e8e0d5', letterSpacing: '0.06em', lineHeight: 1.8 },
  caption: { fontSize: 13, lineHeight: 2.1, color: 'rgba(232,224,213,0.55)', letterSpacing: '0.06em', fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 300 },
  label: { fontSize: 11, letterSpacing: '0.2em', color: '#c8913a', fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 300 },
  eyebrow: { fontSize: 12, letterSpacing: '0.22em', color: '#c8913a', fontFamily: "'Noto Serif JP',serif", fontWeight: 300 },
}

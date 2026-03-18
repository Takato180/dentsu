import { AbsoluteFill, interpolate, useCurrentFrame, Easing, Audio, staticFile } from 'remotion'

// ── helpers ───────────────────────────────────────────────────────────────────
const easeOut = Easing.out(Easing.cubic)
const easeBezier = Easing.bezier(0.25, 0.1, 0.25, 1)

function fi(frame: number, from: number, to: number, inS: number, inE: number, opts?: object) {
  return interpolate(frame, [inS, inE], [from, to], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOut, ...opts,
  })
}

function fadeUp(frame: number, start: number, dur = 22) {
  return {
    opacity: fi(frame, 0, 1, start, start + dur),
    transform: `translateY(${fi(frame, 16, 0, start, start + dur)}px)`,
  }
}

// ── 30fps × 135s = 4050 frames ────────────────────────────────────────────────
// Scene timings (frames)
const S = {
  s1In: 0,    s1Out: 160,   // 0:00〜0:05  オープニング
  s2In: 150,  s2Out: 420,   // 0:05〜0:14  「会話がない」
  s3In: 410,  s3Out: 680,   // 0:14〜0:23  インサイト
  s4In: 670,  s4Out: 960,   // 0:22〜0:32  AI質問生成
  s5In: 950,  s5Out: 1280,  // 0:32〜0:43  録音・声の波形
  s6In: 1270, s6Out: 1600,  // 0:42〜0:53  タイムカプセル
  s7In: 1590, s7Out: 1900,  // 0:53〜1:03  未来へ届く
  s8In: 1890, s8Out: 2200,  // 1:03〜1:13  「今日だから聞けた」
  s9In: 2190, s9Out: 2550,  // 1:13〜1:25  関係性の変化
  s10In: 2540, s10Out: 3000, // 1:25〜1:40 チチコエとは
  s11In: 2990, s11Out: 3500, // 1:40〜1:57 CTA
  s12In: 3490, s12Out: 4050, // 1:57〜2:15 エンディング
}

// ── Scenes ────────────────────────────────────────────────────────────────────

const BG: React.CSSProperties = { background: 'transparent' }
const CENTER: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  textAlign: 'center', padding: '0 80px', gap: 6, height: '100%',
}

function BigText({ text, frame, start, size = 34 }: { text: string, frame: number, start: number, size?: number }) {
  return (
    <p style={{ ...T.serifBig, fontSize: size, ...fadeUp(frame, start, 28) }}>{text}</p>
  )
}

function Label({ text, frame, start }: { text: string, frame: number, start: number }) {
  return (
    <p style={{ ...T.label, ...fadeUp(frame, start, 20) }}>{text}</p>
  )
}

// S1: タイトル
function Scene1({ f }: { f: number }) {
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <p style={{ ...T.eyebrow, ...fadeUp(f, 10, 18) }}>— CHICHIKOE —</p>
        <BigText text="お父さんの声を、" frame={f} start={28} size={38} />
        <BigText text="最後に聞いたのは" frame={f} start={46} size={38} />
        <BigText text="いつですか？" frame={f} start={64} size={38} />
      </div>
    </AbsoluteFill>
  )
}

// S2: 日常会話の断片
function Scene2({ f }: { f: number }) {
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <p style={{ ...T.dialog, color: '#e8e0d5', ...fadeUp(f, 10) }}>「何が食べたい？」</p>
        <p style={{ ...T.dialog, color: '#c8913a', marginTop: 4, ...fadeUp(f, 28) }}>「別に、なんでもいい」</p>
        <div style={{ width: 40, height: 1, background: 'rgba(200,145,58,0.3)', margin: '28px 0', ...fadeUp(f, 60) }} />
        <p style={{ ...T.dialog, color: '#e8e0d5', ...fadeUp(f, 72) }}>「元気か？」</p>
        <p style={{ ...T.dialog, color: '#c8913a', marginTop: 4, ...fadeUp(f, 90) }}>「うん」</p>
        <p style={{ ...T.caption, marginTop: 40, ...fadeUp(f, 120) }}>
          父と子の会話は、いつからか<br />表面だけになっていた。
        </p>
      </div>
    </AbsoluteFill>
  )
}

// S3: インサイト
function Scene3({ f }: { f: number }) {
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <BigText text="「お父さんの若い頃の話、" frame={f} start={10} />
        <BigText text="ちゃんと聞いたことがない」" frame={f} start={32} />
        <p style={{ ...T.caption, marginTop: 48, maxWidth: 420, ...fadeUp(f, 80) }}>
          多くの人が、父を失ってから気づく。<br />
          でも今なら、まだ間に合う。
        </p>
      </div>
    </AbsoluteFill>
  )
}

// S4: AI質問生成モックUI
function Scene4({ f }: { f: number }) {
  const questions = [
    '仕事で一番辛かった時期は、いつですか？',
    '私が生まれた日のこと、覚えていますか？',
    '若い自分に一つだけ伝えるなら、何ですか？',
  ]
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <Label text="AI が選んだ、まだ聞いたことのない質問" frame={f} start={8} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 520, marginTop: 20 }}>
          {questions.map((q, i) => (
            <div key={i} style={{
              padding: '16px 22px',
              border: '1px solid rgba(200,145,58,0.3)',
              borderRadius: 2,
              display: 'flex', gap: 14, alignItems: 'flex-start',
              background: 'rgba(200,145,58,0.04)',
              ...fadeUp(f, 20 + i * 26, 22),
            }}>
              <span style={{ color: '#c8913a', opacity: 0.5, fontFamily: 'serif', fontSize: 13, minWidth: 22 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 14, lineHeight: 1.9, color: '#e8e0d5', letterSpacing: '0.03em' }}>{q}</span>
            </div>
          ))}
        </div>
        <p style={{ ...T.caption, marginTop: 32, ...fadeUp(f, 110) }}>
          父のプロフィールをもとに、AIが「その人だけの質問」を生成する
        </p>
      </div>
    </AbsoluteFill>
  )
}

// S5: 録音・声の波形
function Scene5({ f }: { f: number }) {
  const bars = Array(40).fill(0).map((_, i) => {
    return 8 + (Math.sin(f * 0.11 + i * 0.44) * 0.5 + 0.5) * 46
      + (Math.sin(f * 0.18 + i * 0.27) * 0.5 + 0.5) * 16
  })
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <p style={{ ...T.caption, ...fadeUp(f, 8) }}>お父さんに電話して、質問を読み上げる</p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          height: 90, margin: '32px 0',
          opacity: fi(f, 0, 1, 20, 40),
        }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              width: 3.5, height: Math.max(6, h), borderRadius: 2,
              background: `rgba(200,145,58,${0.3 + (h / 80) * 0.7})`,
            }} />
          ))}
        </div>
        <BigText text="今日、初めて聞いた。" frame={f} start={55} />
        <BigText text="お父さんが、泣いた。" frame={f} start={78} size={30} />
      </div>
    </AbsoluteFill>
  )
}

// S6: タイムカプセル
function Scene6({ f }: { f: number }) {
  const scale = fi(f, 0.7, 1, 10, 40, { easing: Easing.out(Easing.back(1.3)) })
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          border: '1px solid rgba(200,145,58,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${scale})`,
          opacity: fi(f, 0, 1, 8, 30),
          marginBottom: 28,
        }}>
          <span style={{ color: '#c8913a', fontSize: 32 }}>✦</span>
        </div>
        <BigText text="声を、タイムカプセルに封入する" frame={f} start={30} />
        <p style={{ ...T.caption, marginTop: 28, ...fadeUp(f, 60) }}>
          届けたい未来の日を設定する<br />
          結婚式のとき、孫が生まれたとき、定年のとき
        </p>
        <p style={{ ...T.caption, marginTop: 16, color: '#c8913a', ...fadeUp(f, 90) }}>
          その日に、お父さんの声が届く
        </p>
      </div>
    </AbsoluteFill>
  )
}

// S7: 未来へ届く
function Scene7({ f }: { f: number }) {
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <p style={{ ...T.caption, ...fadeUp(f, 8) }}>10年後</p>
        <BigText text="結婚式の朝、" frame={f} start={24} size={36} />
        <BigText text="お父さんの声が届いた。" frame={f} start={46} size={36} />
        <p style={{ ...T.caption, marginTop: 40, maxWidth: 400, ...fadeUp(f, 90) }}>
          「お前が生まれた日、俺は泣いてたんだ。<br />嬉しくて、怖くて、ずっと覚えてるよ。」
        </p>
      </div>
    </AbsoluteFill>
  )
}

// S8: 「今日だから聞けた」
function Scene8({ f }: { f: number }) {
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <BigText text="父の日だから、" frame={f} start={10} size={36} />
        <BigText text="初めて聞けた。" frame={f} start={32} size={36} />
        <p style={{ ...T.caption, marginTop: 44, ...fadeUp(f, 70) }}>
          毎年来る父の日が、<br />今年から変わる。
        </p>
      </div>
    </AbsoluteFill>
  )
}

// S9: 関係性の変化
function Scene9({ f }: { f: number }) {
  const changes = [
    '「なんでもいい」が、本音になった',
    '電話する回数が、増えた',
    '父の日が、待ち遠しくなった',
  ]
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <Label text="チチコエを使った人たちの変化" frame={f} start={8} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          {changes.map((c, i) => (
            <p key={i} style={{ ...T.serifMid, fontSize: 20, ...fadeUp(f, 24 + i * 30) }}>
              {c}
            </p>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// S10: チチコエとは
function Scene10({ f }: { f: number }) {
  const steps = [
    { n: '01', t: 'AIが質問を生成', d: '父のプロフィールから、まだ聞いたことのない質問を3つ' },
    { n: '02', t: '電話して、録音する', d: '父に質問を読み上げ、答えを声で記録する' },
    { n: '03', t: 'タイムカプセルへ', d: '届けたい未来の日を選んで封入する' },
  ]
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <p style={{ ...T.eyebrow, ...fadeUp(f, 6) }}>— HOW IT WORKS —</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 28, width: '100%', maxWidth: 500 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 20, alignItems: 'flex-start', textAlign: 'left',
              ...fadeUp(f, 20 + i * 28, 24),
            }}>
              <span style={{ color: '#c8913a', opacity: 0.5, fontFamily: 'serif', fontSize: 20, minWidth: 28 }}>{s.n}</span>
              <div>
                <p style={{ fontSize: 15, color: '#e8e0d5', letterSpacing: '0.05em', marginBottom: 4 }}>{s.t}</p>
                <p style={{ fontSize: 12, color: 'rgba(232,224,213,0.5)', lineHeight: 1.8 }}>{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}

// S11: CTA
function Scene11({ f }: { f: number }) {
  const btnOpacity = fi(f, 0, 1, 60, 80)
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <p style={{ ...T.eyebrow, ...fadeUp(f, 8) }}>父の日 2026.6.21</p>
        <BigText text="お父さんに、" frame={f} start={24} size={40} />
        <BigText text="まだ聞いていない質問がある。" frame={f} start={46} size={40} />
        <div style={{
          marginTop: 52, padding: '16px 44px',
          background: '#c8913a', borderRadius: 2,
          opacity: btnOpacity,
          transform: `translateY(${fi(f, 12, 0, 60, 80)}px)`,
        }}>
          <p style={{ color: '#080807', fontSize: 16, letterSpacing: '0.12em', fontFamily: "'Noto Sans JP', sans-serif" }}>
            チチコエ、はじめる
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// S12: エンディング
function Scene12({ f }: { f: number }) {
  const ringScale = fi(f, 0.5, 1, 10, 50, { easing: Easing.out(Easing.back(1.1)) })
  return (
    <AbsoluteFill style={BG}>
      <div style={CENTER}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          border: '1px solid rgba(200,145,58,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: `scale(${ringScale})`,
          opacity: fi(f, 0, 1, 8, 30),
          marginBottom: 32,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(200,145,58,0.08)',
            border: '1px solid rgba(200,145,58,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#c8913a', fontSize: 26 }}>✦</span>
          </div>
        </div>
        <p style={{ ...T.eyebrow, ...fadeUp(f, 20, 22) }}>チチコエ</p>
        <BigText text="父の声を、未来へ。" frame={f} start={36} size={36} />
        <p style={{ ...T.caption, marginTop: 40, ...fadeUp(f, 80) }}>
          父の日が、変わる。
        </p>
      </div>
    </AbsoluteFill>
  )
}

// ── Main Composition ──────────────────────────────────────────────────────────

const SCENE_DEFS = [
  { Comp: Scene1,  inF: S.s1In,  outF: S.s1Out  },
  { Comp: Scene2,  inF: S.s2In,  outF: S.s2Out  },
  { Comp: Scene3,  inF: S.s3In,  outF: S.s3Out  },
  { Comp: Scene4,  inF: S.s4In,  outF: S.s4Out  },
  { Comp: Scene5,  inF: S.s5In,  outF: S.s5Out  },
  { Comp: Scene6,  inF: S.s6In,  outF: S.s6Out  },
  { Comp: Scene7,  inF: S.s7In,  outF: S.s7Out  },
  { Comp: Scene8,  inF: S.s8In,  outF: S.s8Out  },
  { Comp: Scene9,  inF: S.s9In,  outF: S.s9Out  },
  { Comp: Scene10, inF: S.s10In, outF: S.s10Out },
  { Comp: Scene11, inF: S.s11In, outF: S.s11Out },
  { Comp: Scene12, inF: S.s12In, outF: S.s12Out },
]

export const ChichikoePitch: React.FC = () => {
  const frame = useCurrentFrame()

  return (
    <AbsoluteFill style={{ background: '#080807' }}>
      {/* BGM */}
      <Audio src={staticFile('bgm.mp3')} volume={0.7} />

      {/* vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
      }} />

      {/* scenes */}
      {SCENE_DEFS.map(({ Comp, inF, outF }, i) => {
        const isLast = i === SCENE_DEFS.length - 1
        const fadeInDur = 22
        const fadeOutDur = 18
        const opacity = isLast
          ? fi(frame, 0, 1, inF, inF + fadeInDur)
          : interpolate(
              frame,
              [inF, inF + fadeInDur, outF - fadeOutDur, outF],
              [0, 1, 1, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeBezier }
            )

        if (opacity <= 0) return null

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
    fontSize: 34, fontWeight: 300,
    color: '#e8e0d5', letterSpacing: '0.08em', lineHeight: 1.8,
  },
  serifMid: {
    fontFamily: "'Noto Serif JP', serif",
    fontSize: 24, fontWeight: 300,
    color: '#e8e0d5', letterSpacing: '0.08em', lineHeight: 1.9,
  },
  dialog: {
    fontFamily: "'Noto Serif JP', serif",
    fontSize: 22, fontWeight: 300,
    letterSpacing: '0.05em', lineHeight: 1.8,
  },
  caption: {
    fontSize: 14, lineHeight: 2.1,
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
    color: '#c8913a', opacity: 0.85,
    fontFamily: "'Noto Serif JP', serif", fontWeight: 300,
  },
}

import { GoogleGenerativeAI } from '@google/generative-ai'

export interface FatherProfile {
  name: string
  age: string
  job: string
  hometown: string
  relationship: 'close' | 'normal' | 'distant'
}

const FALLBACK_QUESTIONS: Record<FatherProfile['relationship'], string[]> = {
  close: [
    '子供の頃、一番誇りに思っていた瞬間はどんなときでしたか？',
    '人生でもう一度やり直せるとしたら、何を変えますか？',
    '自分が父親になって、一番驚いたことは何ですか？',
  ],
  normal: [
    '若い頃の夢は何でしたか？今から見てどう思いますか？',
    '仕事で一番辛かった時期はいつで、どうやって乗り越えましたか？',
    '私が生まれた日のこと、覚えていますか？',
  ],
  distant: [
    '子供のときに好きだった場所はどこですか？',
    '今まで生きてきて、一番大切にしていることは何ですか？',
    '若い自分に一つだけアドバイスをするなら、何を伝えますか？',
  ],
}

export async function generateQuestions(
  profile: FatherProfile,
  apiKey: string
): Promise<string[]> {
  if (!apiKey) return FALLBACK_QUESTIONS[profile.relationship]

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `あなたは「チチコエ」というサービスのAIアシスタントです。
父と子の関係をより深くするために、子供が父親に聞いておくべき「まだ聞いたことのない質問」を3つ生成してください。

父親のプロフィール：
- 名前：${profile.name || '未回答'}
- 年齢：${profile.age}歳
- 職業：${profile.job || '未回答'}
- 出身地：${profile.hometown || '未回答'}
- 子との関係性：${profile.relationship === 'close' ? '仲が良い' : profile.relationship === 'normal' ? '普通' : '疎遠気味'}

条件：
- 表面的ではなく、人生・感情・記憶に触れる深い質問
- 日本人の父親が答えやすいトーンで（重すぎず、軽すぎず）
- 1質問あたり30文字以内で、シンプルに
- 番号なし、1行1質問でそのまま出力（余計な説明不要）

質問3つを出力してください：`

    const result = await model.generateContent(prompt)
    const text = result.response.text()
    const lines = text.trim().split('\n').filter(l => l.trim()).slice(0, 3)
    return lines.length === 3 ? lines : FALLBACK_QUESTIONS[profile.relationship]
  } catch (e) {
    console.error('Gemini error:', e)
    return FALLBACK_QUESTIONS[profile.relationship]
  }
}

/* kak_categories に登録されているカテゴリ名の完全なリスト */
const EXPENSE_CATEGORIES = [
  '交通費',
  '通信費',
  '消耗品費',
  '接待交際費',
  '外注費',
  '広告宣伝費',
  '地代家賃',
  '水道光熱費',
  '新聞図書費',
  'その他経費',
] as const

const INCOME_CATEGORIES = ['売上・報酬', 'その他収入'] as const

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const

export type ClassificationResult = {
  date: string            // YYYY-MM-DD
  amount: number          // 円単位の整数
  description: string     // 店名・内容
  category: string        // ALL_CATEGORIES のいずれか
  type: 'income' | 'expense'
}

const SYSTEM_PROMPT = `あなたは日本の領収書・レシートを解析するAIです。
与えられたOCRテキストから情報を抽出し、必ず以下のJSONのみを返してください。
余分な説明・コードブロックは不要です。

{
  "date": "YYYY-MM-DD（不明な場合は今日の日付）",
  "amount": 金額（円単位の整数。税込金額を優先）,
  "description": "店名または取引内容（簡潔に）",
  "category": "以下のいずれか: ${ALL_CATEGORIES.join(' / ')}",
  "type": "income または expense"
}

カテゴリ選択のルール:
- 交通費: 電車・バス・タクシー・新幹線・飛行機
- 通信費: 携帯・インターネット・郵便
- 消耗品費: 文房具・事務用品・日用品
- 接待交際費: 飲食・会食・贈答品
- 外注費: 業務委託・フリーランス発注
- 広告宣伝費: 広告・PR・マーケティング
- 地代家賃: オフィス・店舗・駐車場の賃料
- 水道光熱費: 電気・ガス・水道
- 新聞図書費: 書籍・雑誌・新聞・教材
- その他経費: 上記に該当しない支出
- 売上・報酬: 売上・報酬・受取
- その他収入: その他の収入`

/**
 * OCR テキストをOpenAI GPT-4oで解析し、収支データを構造化して返す。
 * カテゴリ名は kak_categories テーブルの値と一致する。
 */
export async function classifyReceipt(
  ocrText: string
): Promise<ClassificationResult> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY が設定されていません')

  if (!ocrText.trim()) {
    throw new Error('OCRテキストが空です')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' }, // JSON 強制モード
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `以下の領収書テキストを解析してください:\n\n${ocrText}`,
        },
      ],
      max_tokens: 300,
      temperature: 0,  // 決定的な出力（分類タスクに適切）
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI API エラー (${response.status}): ${body}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(`OpenAI API エラー: ${data.error.message}`)
  }

  const content: string = data.choices?.[0]?.message?.content ?? ''

  let parsed: Partial<ClassificationResult>
  try {
    /* response_format: json_object を使っているが念のため strip */
    parsed = JSON.parse(content.replace(/```json|```/g, '').trim())
  } catch {
    throw new Error(`AIの返答をJSONとして解析できませんでした: ${content}`)
  }

  return validate(parsed)
}

/* ── バリデーション ── */
function validate(raw: Partial<ClassificationResult>): ClassificationResult {
  const date = typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
    ? raw.date
    : new Date().toISOString().split('T')[0]

  const amount =
    typeof raw.amount === 'number' && raw.amount > 0
      ? Math.round(raw.amount)
      : 0

  const description =
    typeof raw.description === 'string' && raw.description.trim()
      ? raw.description.trim()
      : '不明'

  /* カテゴリが既知のリストになければデフォルトに fallback */
  const category = (ALL_CATEGORIES as readonly string[]).includes(raw.category ?? '')
    ? (raw.category as string)
    : 'その他経費'

  /* type が 'income' なら収入カテゴリ、それ以外は支出として強制 */
  const type: 'income' | 'expense' =
    raw.type === 'income' ? 'income' : 'expense'

  /* type と category の整合性チェック */
  const isIncomeCategory = (INCOME_CATEGORIES as readonly string[]).includes(category)
  const isExpenseCategory = (EXPENSE_CATEGORIES as readonly string[]).includes(category)

  const correctedType: 'income' | 'expense' =
    isIncomeCategory ? 'income' : isExpenseCategory ? 'expense' : type

  const correctedCategory =
    correctedType === 'income' && isExpenseCategory
      ? 'その他収入'
      : correctedType === 'expense' && isIncomeCategory
        ? 'その他経費'
        : category

  return {
    date,
    amount,
    description,
    category: correctedCategory,
    type: correctedType,
  }
}

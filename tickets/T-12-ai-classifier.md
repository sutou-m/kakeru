# T-12 OpenAI GPT-4o統合（JSON構造化・科目分類）

## 担当エージェント
@ai-engineer


## 目的
OCRで抽出したテキストをAIで構造化し、勘定科目を自動提案する。

## 前提チケット
- T-11完了済みであること

## 環境変数追加
```
OPENAI_API_KEY=sk-...
```

## 完了条件
- [x] OCRテキストから日付・金額・摘要・科目候補がJSON形式で返ってくる
- [x] 科目候補がcategoriesテーブルの値と一致している

## 実装内容

### AI分類（`src/lib/ai-classifier.ts`）
```ts
export async function classifyReceipt(ocrText: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `以下の領収書テキストから情報を抽出してください。
JSON形式で返してください（他の文言は不要）。

{
  "date": "YYYY-MM-DD",
  "amount": 金額（数値・円単位）,
  "description": "摘要（店名・内容）",
  "category": "カテゴリ名（交通費/通信費/消耗品費/接待交際費/外注費/広告宣伝費/地代家賃/水道光熱費/新聞図書費/その他経費/売上・報酬/その他収入）",
  "type": "income または expense"
}

領収書テキスト:
${ocrText}`
      }],
      max_tokens: 500,
    })
  })
  const data = await response.json()
  const content = data.choices[0].message.content
  return JSON.parse(content.replace(/```json|```/g, '').trim())
}
```

---
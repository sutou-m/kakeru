# T-11 Google Cloud Vision API統合（OCRテキスト抽出）

## 担当エージェント
@ai-engineer @backend-architect


## 目的
アップロードされた領収書画像からテキストを抽出する。

## 前提チケット
- T-10完了済みであること

## 環境変数追加
```
GOOGLE_CLOUD_VISION_API_KEY=AIza...
```

## 完了条件
- [x] 画像からテキストが抽出できる
- [x] 抽出結果が `receipts.ocr_raw_text` に保存される
- [x] APIエラー時に適切なエラーメッセージが表示される

## 実装内容

### Vision API呼び出し（`src/lib/vision.ts`）
```ts
export async function extractTextFromImage(base64Image: string): Promise<string> {
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CLOUD_VISION_API_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }]
        }]
      })
    }
  )
  const data = await response.json()
  return data.responses[0]?.fullTextAnnotation?.text ?? ''
}
```

## 注意事項
- 無料枠：月1,000リクエストまで
- APIキーはサーバーサイドのみで使用（`NEXT_PUBLIC_` を付けない）

---
const VISION_API_URL =
  'https://vision.googleapis.com/v1/images:annotate'

/**
 * Google Cloud Vision API でテキスト抽出（OCR）を行う。
 * base64 エンコードされた画像データを受け取り、抽出テキストを返す。
 */
export async function extractTextFromImage(base64Image: string): Promise<string> {
  const key = process.env.GOOGLE_CLOUD_VISION_API_KEY
  if (!key) throw new Error('GOOGLE_CLOUD_VISION_API_KEY が設定されていません')

  const response = await fetch(`${VISION_API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          imageContext: { languageHints: ['ja', 'en'] },
        },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Vision API エラー (${response.status}): ${body}`)
  }

  const data = await response.json()

  const apiError = data.responses?.[0]?.error
  if (apiError) {
    throw new Error(`Vision API レスポンスエラー: ${apiError.message}`)
  }

  return data.responses?.[0]?.fullTextAnnotation?.text ?? ''
}

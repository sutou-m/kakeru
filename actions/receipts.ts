'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { extractTextFromImage } from '@/lib/vision'
import { classifyReceipt } from '@/lib/ai-classifier'
import type { ClassificationResult } from '@/lib/ai-classifier'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
]
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export type UploadState = {
  success?: boolean
  receiptId?: string
  error?: string
}

export async function uploadReceipt(
  _prevState: UploadState,
  formData: FormData
): Promise<UploadState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const file = formData.get('file') as File | null

  if (!file || file.size === 0) return { error: 'ファイルを選択してください' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      error:
        '対応していないファイル形式です（JPEG・PNG・WebP・HEIC・PDF）',
    }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'ファイルサイズは10MB以下にしてください' }
  }

  const userId = session.user.id
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const storagePath = `${userId}/${Date.now()}.${ext}`

  /* ── Supabase Storage にアップロード ── */
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: storageError } = await supabaseAdmin.storage
    .from('kak-receipts')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (storageError) {
    return { error: `アップロードに失敗しました: ${storageError.message}` }
  }

  /* ── kak_receipts テーブルにメタデータを保存 ── */
  const { data: receipt, error: dbError } = await supabaseAdmin
    .from('kak_receipts')
    .insert({
      user_id: userId,
      storage_path: storagePath,
      original_filename: file.name,
      ocr_status: 'pending',
    })
    .select('id')
    .single()

  if (dbError) {
    /* DB 保存失敗時は Storage も削除してロールバック */
    await supabaseAdmin.storage.from('kak-receipts').remove([storagePath])
    return { error: `メタデータの保存に失敗しました: ${dbError.message}` }
  }

  return { success: true, receiptId: receipt.id }
}

/* ─────────────────────────────────────────────────────────────
   OCR 実行
   receiptId を受け取り、Storage からダウンロード → Vision API →
   kak_receipts.ocr_raw_text に保存する
───────────────────────────────────────────────────────────── */

export type OcrState = {
  success?: boolean
  text?: string
  error?: string
}

export async function runOcr(receiptId: string): Promise<OcrState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  /* 自分の領収書か確認 */
  const { data: receipt } = await supabaseAdmin
    .from('kak_receipts')
    .select('id, storage_path, user_id, ocr_status')
    .eq('id', receiptId)
    .eq('user_id', session.user.id)
    .single()

  if (!receipt) return { error: '領収書が見つかりません' }

  /* 処理中に更新 */
  await supabaseAdmin
    .from('kak_receipts')
    .update({ ocr_status: 'processing' })
    .eq('id', receiptId)

  try {
    /* Storage からダウンロード */
    const { data: fileBlob, error: downloadError } = await supabaseAdmin.storage
      .from('kak-receipts')
      .download(receipt.storage_path)

    if (downloadError || !fileBlob) {
      await supabaseAdmin
        .from('kak_receipts')
        .update({ ocr_status: 'error' })
        .eq('id', receiptId)
      return {
        error: `ファイルのダウンロードに失敗しました: ${downloadError?.message ?? '不明なエラー'}`,
      }
    }

    /* base64 変換して Vision API を呼び出す */
    const base64 = Buffer.from(await fileBlob.arrayBuffer()).toString('base64')
    const text = await extractTextFromImage(base64)

    /* 結果を保存 */
    await supabaseAdmin
      .from('kak_receipts')
      .update({ ocr_raw_text: text, ocr_status: 'done' })
      .eq('id', receiptId)

    revalidatePath('/receipts/upload')
    return { success: true, text }
  } catch (err) {
    await supabaseAdmin
      .from('kak_receipts')
      .update({ ocr_status: 'error' })
      .eq('id', receiptId)
    return {
      error: err instanceof Error ? err.message : 'OCR処理中にエラーが発生しました',
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   OCR + AI分類 を一度に実行し、確認フォーム用の構造化データを返す
───────────────────────────────────────────────────────────── */

export type ClassifyState = {
  success?: boolean
  result?: ClassificationResult & { categoryId: string | null }
  error?: string
}

export async function runOcrAndClassify(receiptId: string): Promise<ClassifyState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const { data: receipt } = await supabaseAdmin
    .from('kak_receipts')
    .select('id, storage_path, user_id')
    .eq('id', receiptId)
    .eq('user_id', session.user.id)
    .single()

  if (!receipt) return { error: '領収書が見つかりません' }

  await supabaseAdmin
    .from('kak_receipts')
    .update({ ocr_status: 'processing' })
    .eq('id', receiptId)

  try {
    /* Storage からダウンロード */
    const { data: blob, error: dlErr } = await supabaseAdmin.storage
      .from('kak-receipts')
      .download(receipt.storage_path)

    if (dlErr || !blob) {
      await supabaseAdmin
        .from('kak_receipts')
        .update({ ocr_status: 'error' })
        .eq('id', receiptId)
      return { error: `ダウンロードに失敗しました: ${dlErr?.message ?? '不明なエラー'}` }
    }

    /* Vision API でテキスト抽出 */
    const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64')
    const text = await extractTextFromImage(base64)

    await supabaseAdmin
      .from('kak_receipts')
      .update({ ocr_raw_text: text, ocr_status: 'done' })
      .eq('id', receiptId)

    if (!text.trim()) {
      return { error: 'テキストが検出されませんでした。画像を確認してください。' }
    }

    /* AI でカテゴリ分類 */
    const classified = await classifyReceipt(text)

    /* カテゴリ名 → ID を DB から引く */
    const { data: category } = await supabaseAdmin
      .from('kak_categories')
      .select('id')
      .eq('name', classified.category)
      .maybeSingle()

    revalidatePath('/receipts/upload')
    return {
      success: true,
      result: { ...classified, categoryId: category?.id ?? null },
    }
  } catch (err) {
    await supabaseAdmin
      .from('kak_receipts')
      .update({ ocr_status: 'error' })
      .eq('id', receiptId)
    return {
      error: err instanceof Error ? err.message : 'OCR・AI分類中にエラーが発生しました',
    }
  }
}

/* ─────────────────────────────────────────────────────────────
   OCR確認フォームの内容を kak_transactions に保存する
───────────────────────────────────────────────────────────── */

export type SaveReceiptState = {
  success?: boolean
  error?: string
  fieldErrors?: Record<string, string>
}

export async function saveReceiptTransaction(
  _prevState: SaveReceiptState,
  formData: FormData
): Promise<SaveReceiptState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const userId = session.user.id

  const { data: taxYear } = await supabaseAdmin
    .from('kak_tax_years')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  if (!taxYear) return { error: 'アクティブな課税年度が設定されていません' }

  const receiptId = (formData.get('receiptId') as string) || null
  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const amountRaw = formData.get('amount') as string
  const description = formData.get('description') as string
  const categoryId = (formData.get('category_id') as string) || null
  const memo = (formData.get('memo') as string) || null

  const fieldErrors: Record<string, string> = {}
  if (!['income', 'expense'].includes(type)) fieldErrors.type = '種別を選択してください'
  if (!date) fieldErrors.date = '日付を入力してください'
  const amount = Number(amountRaw)
  if (!amountRaw || amount <= 0 || !Number.isFinite(amount))
    fieldErrors.amount = '正しい金額を入力してください'
  if (!description.trim()) fieldErrors.description = '摘要を入力してください'
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const { error } = await supabaseAdmin.from('kak_transactions').insert({
    user_id: userId,
    tax_year_id: taxYear.id,
    type: type as 'income' | 'expense',
    date,
    amount,
    description: description.trim(),
    category_id: categoryId,
    receipt_id: receiptId,
    memo: memo?.trim() || null,
    ai_suggested: true,
  })

  if (error) return { error: `保存に失敗しました: ${error.message}` }

  redirect('/transactions')
}

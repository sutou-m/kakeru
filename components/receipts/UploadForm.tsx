'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import {
  UploadCloud,
  FileImage,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  ScanText,
  Sparkles,
} from 'lucide-react'
import {
  uploadReceipt,
  runOcrAndClassify,
  saveReceiptTransaction,
} from '@/actions/receipts'
import type { UploadState, ClassifyState, SaveReceiptState } from '@/actions/receipts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ACCEPTED = 'image/*,.pdf'

type Category = { id: string; name: string; type: 'income' | 'expense' }

export function UploadForm({ categories }: { categories: Category[] }) {
  /* ── アップロード ── */
  const [uploadState, uploadAction, isUploading] = useActionState<UploadState, FormData>(
    uploadReceipt,
    {}
  )

  /* ── ファイル選択 ── */
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* ── OCR + AI 分類 ── */
  const [classifyState, setClassifyState] = useState<ClassifyState>({})
  const [isClassifying, startClassifyTransition] = useTransition()
  const ocrTriggeredFor = useRef<string | null>(null)

  /* ── 確認フォーム ── */
  const [saveState, saveAction, isSaving] = useActionState<SaveReceiptState, FormData>(
    saveReceiptTransaction,
    {}
  )
  const [txType, setTxType] = useState<'income' | 'expense'>('expense')

  /* アップロード成功後に自動で OCR + AI 分類を起動 */
  useEffect(() => {
    const id = uploadState.receiptId
    if (!uploadState.success || !id || ocrTriggeredFor.current === id) return
    ocrTriggeredFor.current = id
    startClassifyTransition(async () => {
      const result = await runOcrAndClassify(id)
      setClassifyState(result)
      if (result.result?.type) setTxType(result.result.type)
    })
  }, [uploadState.success, uploadState.receiptId])

  /* ファイル操作 */
  const handleFileChange = (file: File | null) => {
    if (!file) return
    setFileName(file.name)
    setPreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null)
  }
  const clearFile = () => {
    setPreview(null)
    setFileName(null)
    if (fileRef.current) fileRef.current.value = ''
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && fileRef.current) {
      const dt = new DataTransfer()
      dt.items.add(file)
      fileRef.current.files = dt.files
      handleFileChange(file)
    }
  }

  const filteredCategories = categories.filter((c) => c.type === txType)

  /* ────────────────────────────────────────
     Phase: OCR 処理中
  ──────────────────────────────────────── */
  if (uploadState.success && (isClassifying || (!classifyState.success && !classifyState.error))) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center gap-5">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-[#F5E6D8]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <ScanText size={28} className="text-[#E8884A]" />
          </div>
          <div className="absolute -inset-1 rounded-full border-2 border-[#E8884A] border-t-transparent animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D3B3B]">OCR・AI分類処理中…</p>
          <p className="text-xs text-[#C4B49A] mt-1">テキスト抽出とカテゴリ分類を行っています</p>
        </div>
        <div className="flex items-center gap-6 mt-2">
          <Step icon={<ScanText size={14} />} label="テキスト抽出" active />
          <div className="h-px w-8 bg-[#E8E0D5]" />
          <Step icon={<Sparkles size={14} />} label="AI分類" active />
        </div>
      </div>
    )
  }

  /* ────────────────────────────────────────
     Phase: OCR エラー
  ──────────────────────────────────────── */
  if (classifyState.error) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-sm px-4 py-3 rounded-[10px]">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {classifyState.error}
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => {
              ocrTriggeredFor.current = null
              setClassifyState({})
              startClassifyTransition(async () => {
                const result = await runOcrAndClassify(uploadState.receiptId!)
                setClassifyState(result)
                if (result.result?.type) setTxType(result.result.type)
              })
            }}
          >
            再試行
          </Button>
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            最初からやり直す
          </Button>
        </div>
      </div>
    )
  }

  /* ────────────────────────────────────────
     Phase: AI 確認フォーム
  ──────────────────────────────────────── */
  if (classifyState.success && classifyState.result) {
    const r = classifyState.result
    return (
      <div className="space-y-5">
        {/* ヘッダー */}
        <div className="flex items-center gap-2 text-sm text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-[10px] px-4 py-3">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>AI分類が完了しました。内容を確認・修正してから保存してください。</span>
        </div>

        {/* 確認・修正フォーム */}
        <form action={saveAction} className="space-y-4">
          <input type="hidden" name="receiptId" value={uploadState.receiptId} />

          {/* エラー表示 */}
          {saveState.error && (
            <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-sm px-4 py-3 rounded-[10px]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {saveState.error}
            </div>
          )}

          {/* 種別 */}
          <div>
            <p className="text-sm font-medium text-[#2D3B3B] mb-2">
              種別 <span className="text-[#DC2626]">*</span>
            </p>
            <div className="flex gap-4">
              {(['expense', 'income'] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="type"
                    value={t}
                    checked={txType === t}
                    onChange={() => setTxType(t)}
                    className="accent-[#E8884A] w-4 h-4"
                  />
                  <span className="text-sm text-[#2D3B3B]">
                    {t === 'income' ? '収入' : '支出'}
                  </span>
                </label>
              ))}
            </div>
            {saveState.fieldErrors?.type && (
              <p className="text-xs text-[#DC2626] mt-1">{saveState.fieldErrors.type}</p>
            )}
          </div>

          {/* 日付 */}
          <Input
            label="日付"
            name="date"
            type="date"
            required
            defaultValue={r.date}
            error={saveState.fieldErrors?.date}
          />

          {/* 金額 */}
          <Input
            label="金額（円）"
            name="amount"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={r.amount > 0 ? String(r.amount) : ''}
            placeholder="0"
            error={saveState.fieldErrors?.amount}
          />

          {/* 摘要 */}
          <Input
            label="摘要"
            name="description"
            type="text"
            required
            defaultValue={r.description}
            error={saveState.fieldErrors?.description}
          />

          {/* 勘定科目 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#2D3B3B]">
              勘定科目{' '}
              <span className="text-[#C4B49A] font-normal text-xs">（AI提案）</span>
            </label>
            <select
              name="category_id"
              defaultValue={r.categoryId ?? ''}
              className="w-full px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px] border border-[#E8E0D5] outline-none focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A] transition-colors"
            >
              <option value="">選択しない</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* メモ */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#2D3B3B]">
              メモ{' '}
              <span className="text-[#C4B49A] font-normal text-xs">（任意）</span>
            </label>
            <textarea
              name="memo"
              rows={2}
              placeholder="備考・メモ"
              className="w-full px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px] border border-[#E8E0D5] outline-none focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A] placeholder:text-[#C4B49A] resize-none transition-colors"
            />
          </div>

          {/* アクション */}
          <div className="flex gap-3 pt-1">
            <Button type="submit" loading={isSaving} className="flex-1">
              保存する
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              やり直す
            </Button>
          </div>
        </form>
      </div>
    )
  }

  /* ────────────────────────────────────────
     Phase: アップロードフォーム（初期）
  ──────────────────────────────────────── */
  return (
    <form action={uploadAction} className="space-y-5">
      {uploadState.error && (
        <div className="flex items-start gap-2 bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-sm px-4 py-3 rounded-[10px]">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {uploadState.error}
        </div>
      )}

      {/* ドロップゾーン */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={[
          'flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-[16px] p-8 cursor-pointer transition-colors',
          isDragging
            ? 'border-[#E8884A] bg-[#FFF8F4]'
            : 'border-[#E8E0D5] bg-[#FAF7F3] hover:border-[#E8884A] hover:bg-[#FFF8F4]',
        ].join(' ')}
      >
        <input
          ref={fileRef}
          type="file"
          name="file"
          accept={ACCEPTED}
          className="sr-only"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        {fileName ? (
          <div className="flex flex-col items-center gap-3 w-full">
            {preview ? (
              <img
                src={preview}
                alt="プレビュー"
                className="max-h-48 max-w-full object-contain rounded-[10px] border border-[#E8E0D5]"
              />
            ) : (
              <div className="w-16 h-16 bg-[#F5E6D8] rounded-[12px] flex items-center justify-center">
                <FileImage size={28} className="text-[#E8884A]" />
              </div>
            )}
            <p className="text-sm text-[#2D3B3B] font-medium truncate max-w-xs">{fileName}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="flex items-center gap-1 text-xs text-[#C4B49A] hover:text-[#DC2626] transition-colors"
            >
              <X size={12} />
              選択を解除
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-[#F5E6D8] rounded-full flex items-center justify-center">
              <UploadCloud size={26} className="text-[#E8884A]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[#2D3B3B]">
                クリックまたはドラッグ&ドロップ
              </p>
              <p className="text-xs text-[#C4B49A] mt-1">
                JPEG・PNG・WebP・HEIC・PDF（最大10MB）
              </p>
            </div>
          </>
        )}
      </div>

      <Button
        type="submit"
        disabled={!fileName || isUploading}
        loading={isUploading}
        className="w-full"
      >
        {isUploading ? 'アップロード中…' : 'アップロードしてOCR処理'}
      </Button>
    </form>
  )
}

/* ステップインジケーター */
function Step({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={[
          'w-8 h-8 rounded-full flex items-center justify-center',
          active ? 'bg-[#F5E6D8] text-[#E8884A]' : 'bg-[#F5F0E8] text-[#C4B49A]',
        ].join(' ')}
      >
        {icon}
      </div>
      <span className={`text-xs ${active ? 'text-[#2D3B3B]' : 'text-[#C4B49A]'}`}>{label}</span>
    </div>
  )
}

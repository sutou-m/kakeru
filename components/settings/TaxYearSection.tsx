'use client'

import { useState, useTransition, useActionState } from 'react'
import { CheckCircle2, AlertCircle, PlusCircle, CalendarDays, Check } from 'lucide-react'
import { createTaxYearAction, setActiveTaxYearAction, updateDeclarationTypeAction } from '@/actions/settings'
import type { TaxYearState } from '@/actions/settings'

type TaxYear = {
  id: string
  year: number
  declaration_type: 'blue' | 'white'
  is_active: boolean
}

const DECLARATION_LABELS: Record<'blue' | 'white', string> = {
  blue: '青色申告（65万円控除）',
  white: '白色申告',
}

export function TaxYearSection({ taxYears }: { taxYears: TaxYear[] }) {
  const [isPending, startTransition] = useTransition()
  const [mutationError, setMutationError] = useState('')
  const [showAddForm, setShowAddForm] = useState(taxYears.length === 0)
  const [createState, createAction, isCreating] = useActionState<TaxYearState, FormData>(
    createTaxYearAction,
    {}
  )

  const handleSetActive = (id: string) => {
    setMutationError('')
    startTransition(async () => {
      const result = await setActiveTaxYearAction(id)
      if (result.error) setMutationError(result.error)
    })
  }

  const handleDeclarationType = (id: string, type: 'blue' | 'white') => {
    setMutationError('')
    startTransition(async () => {
      const result = await updateDeclarationTypeAction(id, type)
      if (result.error) setMutationError(result.error)
    })
  }

  return (
    <div className="space-y-5">
      {mutationError && (
        <div className="flex items-center gap-1.5 text-xs text-[#DC2626]">
          <AlertCircle size={13} />
          {mutationError}
        </div>
      )}

      {/* 年度一覧 */}
      {taxYears.length === 0 ? (
        <div className="flex items-center gap-2 py-4 text-sm text-[#C4B49A]">
          <CalendarDays size={16} />
          年度データがありません。下のフォームから追加してください。
        </div>
      ) : (
        <ul className="divide-y divide-[#F5F0E8]">
          {taxYears.map((ty) => (
            <li key={ty.id} className="py-4 space-y-3">
              {/* 年度ヘッダー */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-[#2D3B3B]">{ty.year}年度</span>
                  {ty.is_active && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[#E8884A] text-white px-2 py-0.5 rounded-full">
                      <Check size={10} />
                      アクティブ
                    </span>
                  )}
                </div>
                {!ty.is_active && (
                  <button
                    onClick={() => handleSetActive(ty.id)}
                    disabled={isPending}
                    className="text-xs text-[#C4B49A] hover:text-[#E8884A] border border-[#E8E0D5] hover:border-[#E8884A] px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                  >
                    切り替える
                  </button>
                )}
              </div>

              {/* 申告種別切替 */}
              <div className="flex gap-2">
                {(['blue', 'white'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => ty.declaration_type !== t && handleDeclarationType(ty.id, t)}
                    disabled={isPending}
                    className={[
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors disabled:opacity-50',
                      ty.declaration_type === t
                        ? 'bg-[#2D3B3B] text-white'
                        : 'bg-white border border-[#E8E0D5] text-[#C4B49A] hover:border-[#2D3B3B] hover:text-[#2D3B3B]',
                    ].join(' ')}
                  >
                    {DECLARATION_LABELS[t]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 年度追加 */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-1.5 text-sm text-[#C4B49A] hover:text-[#E8884A] transition-colors"
        >
          <PlusCircle size={15} />
          年度を追加
        </button>
      ) : (
        <div className={taxYears.length > 0 ? 'border-t border-[#E8E0D5] pt-4' : ''}>
          <p className="text-xs font-medium text-[#C4B49A] mb-3 uppercase tracking-wide">年度を追加</p>
          <form action={createAction} className="space-y-3">
            <div className="flex gap-3 flex-wrap">
              <div className="space-y-1.5">
                <label className="text-xs text-[#C4B49A]">年度</label>
                <input
                  name="year"
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  min={2020}
                  max={2030}
                  className="w-24 px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px] border border-[#E8E0D5] outline-none focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A] transition-colors"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[180px]">
                <label className="text-xs text-[#C4B49A]">申告種別</label>
                <select
                  name="declaration_type"
                  className="w-full px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px] border border-[#E8E0D5] outline-none focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A] transition-colors"
                >
                  <option value="blue">青色申告（65万円控除）</option>
                  <option value="white">白色申告</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-[#2D3B3B] cursor-pointer">
              <input
                type="checkbox"
                name="set_active"
                value="true"
                defaultChecked={taxYears.length === 0}
                className="accent-[#E8884A]"
              />
              この年度をアクティブにする
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center gap-1.5 bg-[#E8884A] text-white hover:bg-[#D4733A] disabled:opacity-50 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
              >
                <PlusCircle size={14} />
                {isCreating ? '作成中…' : '作成'}
              </button>
              {taxYears.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-[10px] text-sm font-medium text-[#C4B49A] hover:text-[#2D3B3B] border border-[#E8E0D5] hover:bg-[#FAF7F3] transition-colors"
                >
                  キャンセル
                </button>
              )}
            </div>

            {createState.success && (
              <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
                <CheckCircle2 size={13} />
                年度を作成しました
              </div>
            )}
            {createState.error && (
              <div className="flex items-center gap-1.5 text-xs text-[#DC2626]">
                <AlertCircle size={13} />
                {createState.error}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
}

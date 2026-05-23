'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createTransaction, updateTransaction } from '@/actions/transactions'
import type { TransactionFormState } from '@/actions/transactions'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
}

type InitialValues = {
  id: string
  type: 'income' | 'expense'
  date: string
  amount: number
  description: string
  category_id: string | null
  memo: string | null
}

const today = new Date().toISOString().split('T')[0]

export function TransactionForm({
  categories,
  initial,
}: {
  categories: Category[]
  initial?: InitialValues
}) {
  const [txType, setTxType] = useState<'income' | 'expense'>(initial?.type ?? 'expense')

  const boundAction = initial
    ? updateTransaction.bind(null, initial.id)
    : createTransaction

  const [state, formAction, isPending] = useActionState<TransactionFormState, FormData>(
    boundAction,
    {}
  )

  const filteredCategories = categories.filter((c) => c.type === txType)

  return (
    <form action={formAction} className="space-y-5">
      {/* エラーバナー */}
      {state.error && (
        <div className="bg-[#FEF2F2] border border-[#DC2626] text-[#DC2626] text-sm px-4 py-3 rounded-[10px]">
          {state.error}
        </div>
      )}

      {/* 種別ラジオ */}
      <div>
        <p className="text-sm font-medium text-[#2D3B3B] mb-2">
          種別 <span className="text-[#DC2626]">*</span>
        </p>
        <div className="flex gap-4">
          {(['expense', 'income'] as const).map((t) => (
            <label
              key={t}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
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
        {state.fieldErrors?.type && (
          <p className="text-xs text-[#DC2626] mt-1">{state.fieldErrors.type}</p>
        )}
      </div>

      {/* 日付 */}
      <Input
        label="日付"
        name="date"
        type="date"
        required
        defaultValue={initial?.date ?? today}
        error={state.fieldErrors?.date}
      />

      {/* 金額 */}
      <Input
        label="金額（円）"
        name="amount"
        type="number"
        min="1"
        step="1"
        required
        defaultValue={initial?.amount != null ? String(initial.amount) : ''}
        placeholder="0"
        error={state.fieldErrors?.amount}
      />

      {/* 摘要 */}
      <Input
        label="摘要"
        name="description"
        type="text"
        required
        defaultValue={initial?.description ?? ''}
        placeholder="例：電車代、売上入金"
        error={state.fieldErrors?.description}
      />

      {/* 勘定科目 */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-[#2D3B3B]">
          勘定科目{' '}
          <span className="text-[#C4B49A] font-normal text-xs">（任意）</span>
        </label>
        <select
          name="category_id"
          defaultValue={initial?.category_id ?? ''}
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
          rows={3}
          defaultValue={initial?.memo ?? ''}
          placeholder="備考・メモを入力..."
          className="w-full px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px] border border-[#E8E0D5] outline-none focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A] placeholder:text-[#C4B49A] resize-none transition-colors"
        />
      </div>

      {/* アクションボタン */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending}>
          {initial ? '更新する' : '登録する'}
        </Button>
        <Link href="/transactions">
          <Button type="button" variant="secondary">
            キャンセル
          </Button>
        </Link>
      </div>
    </form>
  )
}

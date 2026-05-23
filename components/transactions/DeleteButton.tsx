'use client'

import { useTransition } from 'react'
import { deleteTransaction } from '@/actions/transactions'

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!window.confirm('この収支データを削除しますか？')) return
    startTransition(async () => {
      await deleteTransaction(id)
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-[#DC2626] hover:text-[#B91C1C] disabled:opacity-50 transition-colors"
    >
      {isPending ? '削除中…' : '削除'}
    </button>
  )
}

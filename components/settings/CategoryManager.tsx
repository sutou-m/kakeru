'use client'

import { useState, useTransition } from 'react'
import { Pencil, Check, X, PlusCircle, Tag } from 'lucide-react'
import { createCategory, updateCategoryName } from '@/actions/categories'

type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
  is_default: boolean
}

type TabType = 'income' | 'expense'

const TAB_LABELS: Record<TabType, string> = {
  income: '収入カテゴリ',
  expense: '支出カテゴリ',
}

export function CategoryManager({
  incomeCategories,
  expenseCategories,
}: {
  incomeCategories: Category[]
  expenseCategories: Category[]
}) {
  const [activeTab, setActiveTab] = useState<TabType>('expense')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState('')
  const [addName, setAddName] = useState('')
  const [addError, setAddError] = useState('')
  const [isPending, startTransition] = useTransition()

  const categories = activeTab === 'income' ? incomeCategories : expenseCategories

  /* ── 編集開始 ── */
  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditError('')
  }

  /* ── 編集保存 ── */
  const handleSave = () => {
    if (!editingId) return
    startTransition(async () => {
      const result = await updateCategoryName(editingId, editName)
      if (result.error) {
        setEditError(result.error)
      } else {
        setEditingId(null)
        setEditError('')
      }
    })
  }

  /* ── 追加 ── */
  const handleAdd = () => {
    if (!addName.trim()) {
      setAddError('名前を入力してください')
      return
    }
    startTransition(async () => {
      const result = await createCategory(addName, activeTab)
      if (result.error) {
        setAddError(result.error)
      } else {
        setAddName('')
        setAddError('')
      }
    })
  }

  return (
    <div>
      {/* タブ */}
      <div className="flex gap-2 mb-5">
        {(['expense', 'income'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              setEditingId(null)
              setAddName('')
              setAddError('')
            }}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeTab === tab
                ? 'bg-[#E8884A] text-white'
                : 'bg-white border border-[#E8E0D5] text-[#C4B49A] hover:text-[#2D3B3B] hover:border-[#2D3B3B]',
            ].join(' ')}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* カテゴリリスト */}
      {categories.length === 0 ? (
        <div className="flex items-center gap-2 py-6 text-sm text-[#C4B49A]">
          <Tag size={16} />
          カテゴリがありません。下のフォームから追加してください。
        </div>
      ) : (
        <ul className="divide-y divide-[#F5F0E8] mb-4">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-3 py-3">
              {/* カラードット */}
              <span
                className={[
                  'w-2 h-2 rounded-full shrink-0',
                  activeTab === 'income' ? 'bg-[#E8884A]' : 'bg-[#2D3B3B]',
                ].join(' ')}
              />

              {editingId === cat.id ? (
                /* 編集モード */
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave()
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    autoFocus
                    className="flex-1 px-2 py-1 text-sm text-[#2D3B3B] border border-[#E8884A] rounded-[8px] outline-none focus:ring-1 focus:ring-[#E8884A]"
                  />
                  {editError && (
                    <span className="text-xs text-[#DC2626]">{editError}</span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="p-1 text-[#16A34A] hover:text-[#15803D] disabled:opacity-50 transition-colors"
                    title="保存"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => { setEditingId(null); setEditError('') }}
                    className="p-1 text-[#C4B49A] hover:text-[#2D3B3B] transition-colors"
                    title="キャンセル"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                /* 表示モード */
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-[#2D3B3B]">
                    {cat.name}
                    {cat.is_default && (
                      <span className="ml-2 text-[10px] text-[#C4B49A] border border-[#E8E0D5] rounded-full px-1.5 py-0.5">
                        デフォルト
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1.5 text-[#C4B49A] hover:text-[#2D3B3B] transition-colors rounded-[6px] hover:bg-[#FAF7F3]"
                    title="編集"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 追加フォーム */}
      <div className="border-t border-[#E8E0D5] pt-4">
        <p className="text-xs font-medium text-[#C4B49A] mb-2 uppercase tracking-wide">
          {TAB_LABELS[activeTab]}を追加
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={addName}
            onChange={(e) => { setAddName(e.target.value); setAddError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            placeholder="カテゴリ名を入力"
            className="flex-1 px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px] border border-[#E8E0D5] outline-none focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A] placeholder:text-[#C4B49A] transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-[#E8884A] text-white hover:bg-[#D4733A] disabled:opacity-50 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors whitespace-nowrap"
          >
            <PlusCircle size={15} />
            追加
          </button>
        </div>
        {addError && <p className="text-xs text-[#DC2626] mt-1">{addError}</p>}
      </div>
    </div>
  )
}

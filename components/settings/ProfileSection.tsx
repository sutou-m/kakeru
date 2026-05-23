'use client'

import { useActionState } from 'react'
import { CheckCircle2, AlertCircle, User } from 'lucide-react'
import { updateProfileAction } from '@/actions/settings'
import type { ProfileState } from '@/actions/settings'

export function ProfileSection({ name, email }: { name: string; email: string }) {
  const [state, action, isPending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {}
  )

  return (
    <div className="space-y-5">
      {/* メールアドレス（読み取り専用） */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-[#2D3B3B]">メールアドレス</p>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F3] border border-[#E8E0D5] rounded-[10px] text-sm text-[#C4B49A]">
          <User size={15} className="shrink-0" />
          {email}
        </div>
        <p className="text-xs text-[#C4B49A]">メールアドレスは変更できません</p>
      </div>

      {/* 表示名 */}
      <form action={action} className="space-y-1.5">
        <label htmlFor="profile-name" className="text-sm font-medium text-[#2D3B3B]">
          表示名
        </label>
        <div className="flex gap-2">
          <input
            id="profile-name"
            name="name"
            type="text"
            defaultValue={name}
            placeholder="名前を入力"
            className="flex-1 px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px] border border-[#E8E0D5] outline-none focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A] placeholder:text-[#C4B49A] transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#E8884A] text-white hover:bg-[#D4733A] disabled:opacity-50 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors whitespace-nowrap"
          >
            {isPending ? '保存中…' : '保存'}
          </button>
        </div>
        {state.success && (
          <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
            <CheckCircle2 size={13} />
            保存しました
          </div>
        )}
        {state.error && (
          <div className="flex items-center gap-1.5 text-xs text-[#DC2626]">
            <AlertCircle size={13} />
            {state.error}
          </div>
        )}
      </form>
    </div>
  )
}

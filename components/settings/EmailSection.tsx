'use client'

import { useActionState } from 'react'
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { sendTestEmailAction, sendReminderEmailAction } from '@/actions/email'
import type { EmailState } from '@/actions/email'

export function EmailSection({ adminEmail }: { adminEmail: string }) {
  const [testState, testAction, isTestPending] = useActionState<EmailState, FormData>(
    sendTestEmailAction,
    {}
  )
  const [reminderState, reminderAction, isReminderPending] = useActionState<EmailState, FormData>(
    sendReminderEmailAction,
    {}
  )

  return (
    <div className="space-y-5">
      {/* 送信先 */}
      <div className="flex items-center gap-2 text-sm text-[#C4B49A] bg-[#FAF7F3] border border-[#E8E0D5] rounded-[10px] px-4 py-3">
        <Mail size={15} className="shrink-0" />
        <span>
          送信先（開発環境）：<span className="font-medium text-[#2D3B3B]">{adminEmail}</span>
        </span>
      </div>

      {/* テストメール */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#2D3B3B]">テストメール</p>
        <p className="text-xs text-[#C4B49A]">
          Resendのメール送信が正常に動作しているか確認できます。
        </p>
        <form action={testAction}>
          <button
            type="submit"
            disabled={isTestPending}
            className="inline-flex items-center gap-2 bg-[#E8884A] text-white hover:bg-[#D4733A] disabled:opacity-50 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
          >
            <Send size={14} />
            {isTestPending ? '送信中…' : 'テストメールを送信'}
          </button>
        </form>
        <StatusBadge state={testState} />
      </div>

      <div className="border-t border-[#E8E0D5]" />

      {/* リマインダー手動送信 */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#2D3B3B]">申告期限リマインダー（手動送信）</p>
        <p className="text-xs text-[#C4B49A]">
          申告期限まであと N 日のリマインダーメールを今すぐ送信します。
        </p>
        <form action={reminderAction}>
          <button
            type="submit"
            disabled={isReminderPending}
            className="inline-flex items-center gap-2 bg-white text-[#2D3B3B] border border-[#E8E0D5] hover:bg-[#FAF7F3] disabled:opacity-50 px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
          >
            <Mail size={14} />
            {isReminderPending ? '送信中…' : 'リマインダーを送信'}
          </button>
        </form>
        <StatusBadge state={reminderState} />
      </div>
    </div>
  )
}

function StatusBadge({ state }: { state: EmailState }) {
  if (state.success) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#16A34A]">
        <CheckCircle2 size={13} />
        送信しました
      </div>
    )
  }
  if (state.error) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#DC2626]">
        <AlertCircle size={13} />
        {state.error}
      </div>
    )
  }
  return null
}

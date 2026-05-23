'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTestEmail, sendReminderEmail } from '@/lib/email'

export type EmailState = {
  success?: boolean
  error?: string
}

/* ── テストメール送信 ── */
export async function sendTestEmailAction(
  _prevState: EmailState,
  _formData: FormData
): Promise<EmailState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const to = process.env.ADMIN_EMAIL
  if (!to) return { error: 'ADMIN_EMAIL が設定されていません' }

  try {
    await sendTestEmail(to)
    await logNotification(session.user.id, 'test', 'sent')
    return { success: true }
  } catch (err) {
    await logNotification(session.user.id, 'test', 'failed')
    return { error: err instanceof Error ? err.message : 'メール送信に失敗しました' }
  }
}

/* ── 申告期限リマインダー送信 ── */
export async function sendReminderEmailAction(
  _prevState: EmailState,
  _formData: FormData
): Promise<EmailState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const to = process.env.ADMIN_EMAIL
  if (!to) return { error: 'ADMIN_EMAIL が設定されていません' }

  const daysLeft = daysUntilFiling()

  try {
    await sendReminderEmail(to, daysLeft)
    await logNotification(session.user.id, 'reminder', 'sent')
    return { success: true }
  } catch (err) {
    await logNotification(session.user.id, 'reminder', 'failed')
    return { error: err instanceof Error ? err.message : 'リマインダー送信に失敗しました' }
  }
}

/* ── ヘルパー ── */
async function logNotification(
  userId: string,
  type: string,
  status: 'sent' | 'failed'
) {
  await supabaseAdmin.from('kak_notifications').insert({
    user_id: userId,
    type,
    status,
  })
}

function daysUntilFiling(): number {
  const now = new Date()
  const deadline = new Date(now.getFullYear() + 1, 2, 15)
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000))
}

'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type TransactionFormState = {
  error?: string
  fieldErrors?: Record<string, string>
}

/* ── バリデーション共通 ── */
function validate(
  type: string,
  date: string,
  amountRaw: string,
  description: string
): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!['income', 'expense'].includes(type)) errors.type = '種別を選択してください'
  if (!date) errors.date = '日付を入力してください'
  const amount = Number(amountRaw)
  if (!amountRaw || amount <= 0 || !Number.isFinite(amount))
    errors.amount = '正しい金額を入力してください'
  if (!description.trim()) errors.description = '摘要を入力してください'
  return errors
}

export async function createTransaction(
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
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

  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const amountRaw = formData.get('amount') as string
  const description = formData.get('description') as string
  const categoryId = (formData.get('category_id') as string) || null
  const memo = (formData.get('memo') as string) || null

  const fieldErrors = validate(type, date, amountRaw, description)
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const { error } = await supabaseAdmin.from('kak_transactions').insert({
    user_id: userId,
    tax_year_id: taxYear.id,
    type: type as 'income' | 'expense',
    date,
    amount: Number(amountRaw),
    description: description.trim(),
    category_id: categoryId,
    memo: memo?.trim() || null,
  })

  if (error) return { error: `保存に失敗しました: ${error.message}` }

  redirect('/transactions')
}

export async function updateTransaction(
  id: string,
  _prevState: TransactionFormState,
  formData: FormData
): Promise<TransactionFormState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const type = formData.get('type') as string
  const date = formData.get('date') as string
  const amountRaw = formData.get('amount') as string
  const description = formData.get('description') as string
  const categoryId = (formData.get('category_id') as string) || null
  const memo = (formData.get('memo') as string) || null

  const fieldErrors = validate(type, date, amountRaw, description)
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const { error } = await supabaseAdmin
    .from('kak_transactions')
    .update({
      type: type as 'income' | 'expense',
      date,
      amount: Number(amountRaw),
      description: description.trim(),
      category_id: categoryId,
      memo: memo?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { error: `更新に失敗しました: ${error.message}` }

  redirect('/transactions')
}

export async function deleteTransaction(id: string): Promise<void> {
  const session = await auth()
  if (!session?.user) return

  await supabaseAdmin
    .from('kak_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id)

  revalidatePath('/transactions')
  redirect('/transactions')
}

'use server'

import { auth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export type ProfileState = { success?: boolean; error?: string }
export type TaxYearState = { success?: boolean; error?: string }

/* ── プロフィール更新 ── */
export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: '名前を入力してください' }

  const { error } = await supabaseAdmin
    .from('kak_users')
    .update({ name })
    .eq('id', session.user.id)

  if (error) return { error: 'プロフィールの更新に失敗しました' }

  revalidatePath('/settings')
  return { success: true }
}

/* ── 年度作成 ── */
export async function createTaxYearAction(
  _prevState: TaxYearState,
  formData: FormData
): Promise<TaxYearState> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const yearStr = formData.get('year') as string
  const declarationType = formData.get('declaration_type') as 'blue' | 'white'
  const setActive = formData.get('set_active') === 'true'

  const year = parseInt(yearStr, 10)
  if (isNaN(year) || year < 2020 || year > 2030) return { error: '有効な年度を入力してください（2020〜2030）' }
  if (!['blue', 'white'].includes(declarationType)) return { error: '申告種別を選択してください' }

  const userId = session.user.id

  const { data: existing } = await supabaseAdmin
    .from('kak_tax_years')
    .select('id')
    .eq('user_id', userId)
    .eq('year', year)
    .maybeSingle()

  if (existing) return { error: `${year}年度はすでに登録されています` }

  if (setActive) {
    await supabaseAdmin
      .from('kak_tax_years')
      .update({ is_active: false })
      .eq('user_id', userId)
  }

  const { error } = await supabaseAdmin
    .from('kak_tax_years')
    .insert({ user_id: userId, year, declaration_type: declarationType, is_active: setActive })

  if (error) return { error: '年度の作成に失敗しました' }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true }
}

/* ── アクティブ年度切替 ── */
export async function setActiveTaxYearAction(id: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const userId = session.user.id

  await supabaseAdmin
    .from('kak_tax_years')
    .update({ is_active: false })
    .eq('user_id', userId)

  const { error } = await supabaseAdmin
    .from('kak_tax_years')
    .update({ is_active: true })
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: 'アクティブ年度の切替に失敗しました' }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return {}
}

/* ── 申告種別更新 ── */
export async function updateDeclarationTypeAction(
  id: string,
  declarationType: 'blue' | 'white'
): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user) return { error: '認証が必要です' }

  const { error } = await supabaseAdmin
    .from('kak_tax_years')
    .update({ declaration_type: declarationType })
    .eq('id', id)
    .eq('user_id', session.user.id)

  if (error) return { error: '申告種別の更新に失敗しました' }

  revalidatePath('/settings')
  return {}
}

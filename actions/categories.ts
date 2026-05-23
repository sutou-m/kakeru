'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createCategory(
  name: string,
  type: 'income' | 'expense'
): Promise<{ error?: string }> {
  if (!name.trim()) return { error: '名前を入力してください' }

  /* 同じタイプの最大 sort_order + 1 を計算 */
  const { data: existing } = await supabaseAdmin
    .from('kak_categories')
    .select('sort_order')
    .eq('type', type)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (existing?.sort_order ?? 0) + 1

  const { error } = await supabaseAdmin.from('kak_categories').insert({
    name: name.trim(),
    type,
    sort_order: nextOrder,
    is_default: false,
  })

  if (error) return { error: `追加に失敗しました: ${error.message}` }

  revalidatePath('/settings')
  return {}
}

export async function updateCategoryName(
  id: string,
  name: string
): Promise<{ error?: string }> {
  if (!name.trim()) return { error: '名前を入力してください' }

  const { error } = await supabaseAdmin
    .from('kak_categories')
    .update({ name: name.trim() })
    .eq('id', id)

  if (error) return { error: `更新に失敗しました: ${error.message}` }

  revalidatePath('/settings')
  return {}
}

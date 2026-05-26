'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { signIn } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function loginAction(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  try {
    await signIn('credentials', {
      email: (formData.get('email') as string).trim(),
      password: (formData.get('password') as string).trim(),
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return 'メールアドレスまたはパスワードが正しくありません'
    }
    throw error // redirect は re-throw してNext.jsに処理させる
  }
  return null
}

export async function registerUser(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    return 'すべての項目を入力してください'
  }
  if (password.length < 8) {
    return 'パスワードは8文字以上で入力してください'
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const { error } = await supabaseAdmin
    .from('kak_users')
    .insert({ email, name, auth_password: hashedPassword })

  if (error) {
    if (error.code === '23505') return 'このメールアドレスは既に登録されています'
    return '登録に失敗しました'
  }

  redirect('/login')
}

export async function logoutAction() {
  const { signOut } = await import('@/lib/auth')
  await signOut({ redirectTo: '/auth/login' })
}

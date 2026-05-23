'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerUser } from '@/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function RegisterPage() {
  const [error, action, pending] = useActionState(registerUser, null)

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2D3B3B]">Kakeru</h1>
          <p className="mt-1 text-sm text-[#C4B49A]">フリーランスの確定申告を、かんたんに。</p>
        </div>
        <Card>
          <h2 className="text-xl font-bold text-[#2D3B3B] mb-6">新規登録</h2>
          <form action={action} className="space-y-4">
            <Input
              type="text"
              name="name"
              label="お名前"
              placeholder="山田 太郎"
              required
              autoComplete="name"
            />
            <Input
              type="email"
              name="email"
              label="メールアドレス"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            <Input
              type="password"
              name="password"
              label="パスワード"
              placeholder="8文字以上"
              required
              autoComplete="new-password"
              hint="8文字以上で入力してください"
            />
            {error && (
              <p className="text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-[6px]">
                {error}
              </p>
            )}
            <Button type="submit" loading={pending} className="w-full mt-2">
              アカウントを作成
            </Button>
          </form>
          <p className="mt-4 text-sm text-[#C4B49A] text-center">
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-[#E8884A] hover:underline font-medium">
              ログイン
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

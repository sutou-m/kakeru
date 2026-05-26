'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { loginAction } from '@/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const [error, action, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2D3B3B]">Kakeru</h1>
          <p className="mt-1 text-sm text-[#C4B49A]">フリーランスの確定申告を、かんたんに。</p>
        </div>
        <Card>
          <h2 className="text-xl font-bold text-[#2D3B3B] mb-6">ログイン</h2>
          <form action={action} className="space-y-4">
            <Input
              type="email"
              name="email"
              label="メールアドレス"
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="email"
            />
            <Input
              type="password"
              name="password"
              label="パスワード"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
            />
            {error && (
              <p className="text-sm text-[#DC2626] bg-red-50 px-3 py-2 rounded-[6px]">
                {error}
              </p>
            )}
            <Button type="submit" loading={pending} className="w-full mt-2">
              ログイン
            </Button>
          </form>
          <p className="mt-4 text-sm text-[#C4B49A] text-center">
            アカウントをお持ちでない方は{' '}
            <Link href="/register" className="text-[#E8884A] hover:underline font-medium">
              新規登録
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}

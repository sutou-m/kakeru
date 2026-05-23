import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { CategoryManager } from '@/components/settings/CategoryManager'
import { EmailSection } from '@/components/settings/EmailSection'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: categories } = await supabaseAdmin
    .from('kak_categories')
    .select('id, name, type, is_default')
    .order('sort_order', { ascending: true })

  const all = categories ?? []
  const incomeCategories = all.filter((c) => c.type === 'income')
  const expenseCategories = all.filter((c) => c.type === 'expense')

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="設定" description="アカウント・アプリの設定を変更します" />

      {/* カテゴリ管理 */}
      <Card>
        <h2 className="text-base font-semibold text-[#2D3B3B] mb-5">カテゴリ管理</h2>
        <CategoryManager
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />
      </Card>

      {/* メール通知 */}
      <Card>
        <h2 className="text-base font-semibold text-[#2D3B3B] mb-5">メール通知</h2>
        <EmailSection adminEmail={process.env.ADMIN_EMAIL ?? ''} />
      </Card>
    </div>
  )
}

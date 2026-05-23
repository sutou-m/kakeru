import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { CategoryManager } from '@/components/settings/CategoryManager'
import { EmailSection } from '@/components/settings/EmailSection'
import { ProfileSection } from '@/components/settings/ProfileSection'
import { TaxYearSection } from '@/components/settings/TaxYearSection'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id

  const [{ data: userRow }, { data: categories }, { data: taxYears }] = await Promise.all([
    supabaseAdmin
      .from('kak_users')
      .select('name, email')
      .eq('id', userId)
      .maybeSingle(),
    supabaseAdmin
      .from('kak_categories')
      .select('id, name, type, is_default')
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('kak_tax_years')
      .select('id, year, declaration_type, is_active')
      .eq('user_id', userId)
      .order('year', { ascending: false }),
  ])

  const all = categories ?? []
  const incomeCategories = all.filter((c) => c.type === 'income')
  const expenseCategories = all.filter((c) => c.type === 'expense')
  const allTaxYears = taxYears ?? []

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="設定" description="アカウント・アプリの設定を変更します" />

      <Card>
        <SettingsTabs
          defaultTab="profile"
          tabs={[
            {
              id: 'profile',
              label: 'プロフィール',
              content: (
                <ProfileSection
                  name={userRow?.name ?? ''}
                  email={userRow?.email ?? session.user.email ?? ''}
                />
              ),
            },
            {
              id: 'tax-year',
              label: '年度設定',
              content: <TaxYearSection taxYears={allTaxYears} />,
            },
            {
              id: 'categories',
              label: 'カテゴリ管理',
              content: (
                <CategoryManager
                  incomeCategories={incomeCategories}
                  expenseCategories={expenseCategories}
                />
              ),
            },
            {
              id: 'email',
              label: 'メール通知',
              content: <EmailSection adminEmail={process.env.ADMIN_EMAIL ?? ''} />,
            },
          ]}
        />
      </Card>
    </div>
  )
}

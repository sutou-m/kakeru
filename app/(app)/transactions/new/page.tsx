import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { TransactionForm } from '@/components/transactions/TransactionForm'

export default async function NewTransactionPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: categories } = await supabaseAdmin
    .from('kak_categories')
    .select('id, name, type')
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="収支を追加" description="新しい収入・支出を記録します" />
      <Card>
        <TransactionForm categories={categories ?? []} />
      </Card>
    </div>
  )
}

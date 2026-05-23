import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { TransactionForm } from '@/components/transactions/TransactionForm'

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const [{ data: transaction }, { data: categories }] = await Promise.all([
    supabaseAdmin
      .from('kak_transactions')
      .select('id, type, amount, date, description, category_id, memo')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single(),
    supabaseAdmin
      .from('kak_categories')
      .select('id, name, type')
      .order('sort_order', { ascending: true }),
  ])

  if (!transaction) notFound()

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="収支を編集" description="記録を修正します" />
      <Card>
        <TransactionForm
          categories={categories ?? []}
          initial={{
            id: transaction.id,
            type: transaction.type,
            date: transaction.date,
            amount: transaction.amount,
            description: transaction.description ?? '',
            category_id: transaction.category_id,
            memo: transaction.memo,
          }}
        />
      </Card>
    </div>
  )
}

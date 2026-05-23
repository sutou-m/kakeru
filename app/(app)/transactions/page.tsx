import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DeleteButton } from '@/components/transactions/DeleteButton'
import { PlusCircle, ReceiptText, Pencil } from 'lucide-react'
import Link from 'next/link'

type FilterType = 'income' | 'expense' | 'all'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { type: typeParam } = await searchParams
  const filter: FilterType =
    typeParam === 'income' || typeParam === 'expense' ? typeParam : 'all'

  const userId = session.user.id

  /* アクティブな課税年度 */
  const { data: taxYear } = await supabaseAdmin
    .from('kak_tax_years')
    .select('id, year')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  /* 取引一覧取得 */
  let query = supabaseAdmin
    .from('kak_transactions')
    .select('id, type, amount, date, description, kak_categories(name)')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (taxYear) query = query.eq('tax_year_id', taxYear.id)
  if (filter !== 'all') query = query.eq('type', filter)

  const { data: transactions } = await query
  const rows = transactions ?? []

  /* 合計 */
  const totalIncome = rows
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = rows
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)

  const filterTabs: { label: string; value: FilterType; href: string }[] = [
    { label: '全件', value: 'all', href: '/transactions' },
    { label: '収入', value: 'income', href: '/transactions?type=income' },
    { label: '支出', value: 'expense', href: '/transactions?type=expense' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="収支一覧"
        description={taxYear ? `${taxYear.year}年の記録` : '収入・支出の記録を管理します'}
        action={
          <Link href="/transactions/new">
            <Button size="sm">
              <PlusCircle size={14} />
              新規登録
            </Button>
          </Link>
        }
      />

      {/* フィルタタブ */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.href}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === tab.value
                ? 'bg-[#E8884A] text-white'
                : 'bg-white border border-[#E8E0D5] text-[#C4B49A] hover:text-[#2D3B3B] hover:border-[#2D3B3B]',
            ].join(' ')}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <>
          {/* テーブル */}
          <Card padding="sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E0D5]">
                    <th className="text-left py-3 px-3 text-xs font-medium text-[#C4B49A]">日付</th>
                    <th className="text-left py-3 px-3 text-xs font-medium text-[#C4B49A]">摘要</th>
                    <th className="hidden md:table-cell text-left py-3 px-3 text-xs font-medium text-[#C4B49A]">
                      勘定科目
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-[#C4B49A]">金額</th>
                    <th className="text-right py-3 px-3 text-xs font-medium text-[#C4B49A]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-[#F5F0E8] last:border-0 hover:bg-[#FAF7F3] transition-colors"
                    >
                      <td className="py-3 px-3 text-[#C4B49A] whitespace-nowrap">
                        {formatDate(t.date)}
                      </td>
                      <td className="py-3 px-3 text-[#2D3B3B] max-w-[180px] truncate">
                        {t.description ?? '-'}
                      </td>
                      <td className="hidden md:table-cell py-3 px-3 text-[#C4B49A]">
                        {t.kak_categories?.name ?? '-'}
                      </td>
                      <td
                        className={[
                          'py-3 px-3 text-right font-medium tabular-nums whitespace-nowrap',
                          t.type === 'income' ? 'text-[#E8884A]' : 'text-[#2D3B3B]',
                        ].join(' ')}
                      >
                        {t.type === 'income' ? '+' : '-'}¥
                        {t.amount.toLocaleString('ja-JP')}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/transactions/${t.id}/edit`}
                            className="text-xs text-[#C4B49A] hover:text-[#2D3B3B] transition-colors inline-flex items-center gap-1"
                          >
                            <Pencil size={12} />
                            編集
                          </Link>
                          <DeleteButton id={t.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 合計行 */}
          {filter !== 'all' ? (
            <div className="flex justify-end">
              <p className="text-sm text-[#C4B49A]">
                合計:{' '}
                <span className="font-bold text-[#2D3B3B] tabular-nums">
                  ¥{(filter === 'income' ? totalIncome : totalExpense).toLocaleString('ja-JP')}
                </span>
              </p>
            </div>
          ) : (
            <div className="flex justify-end gap-6 text-sm">
              <p className="text-[#C4B49A]">
                収入合計:{' '}
                <span className="font-bold text-[#E8884A] tabular-nums">
                  ¥{totalIncome.toLocaleString('ja-JP')}
                </span>
              </p>
              <p className="text-[#C4B49A]">
                支出合計:{' '}
                <span className="font-bold text-[#2D3B3B] tabular-nums">
                  ¥{totalExpense.toLocaleString('ja-JP')}
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* YYYY-MM-DD → M/D */
function formatDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${Number(m)}/${Number(d)}`
}

const EMPTY_MESSAGES: Record<FilterType, string> = {
  all: '収支データがありません',
  income: '収入データがありません',
  expense: '支出データがありません',
}

function EmptyState({ filter }: { filter: FilterType }) {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-14 h-14 bg-[#F5E6D8] rounded-full flex items-center justify-center mb-4">
          <ReceiptText size={28} className="text-[#E8884A]" />
        </div>
        <h3 className="text-base font-semibold text-[#2D3B3B] mb-2">
          {EMPTY_MESSAGES[filter]}
        </h3>
        <p className="text-sm text-[#C4B49A] mb-6 max-w-xs leading-relaxed">
          {filter === 'all'
            ? '「新規登録」から収入・支出を記録するか、領収書をアップロードしてください。'
            : '他のタブに切り替えるか、「新規登録」からデータを追加してください。'}
        </p>
        <Link
          href="/transactions/new"
          className="inline-flex items-center gap-2 bg-[#E8884A] text-white hover:bg-[#D4733A] px-5 py-2.5 rounded-[10px] text-sm font-medium transition-colors"
        >
          <PlusCircle size={15} />
          新規登録する
        </Link>
      </div>
    </Card>
  )
}

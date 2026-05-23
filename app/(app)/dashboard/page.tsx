import type { ReactNode } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import type { MonthlyData } from '@/components/dashboard/MonthlyBarChart'
import type { CategoryData } from '@/components/dashboard/CategoryPieChart'
import { TrendingUp, TrendingDown, Minus, CalendarClock, ReceiptText } from 'lucide-react'
import Link from 'next/link'

/* 翌年3月15日（申告期限）までの残り日数 */
function daysUntilFiling(): number {
  const now = new Date()
  const deadline = new Date(now.getFullYear() + 1, 2, 15)
  return Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000))
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id
  const currentYear = new Date().getFullYear()

  /* アクティブな課税年度を取得 */
  const { data: taxYear } = await supabaseAdmin
    .from('kak_tax_years')
    .select('id, year')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  /* 取引一覧を取得（カテゴリ結合） */
  const { data: rawTx } = taxYear
    ? await supabaseAdmin
        .from('kak_transactions')
        .select('id, type, amount, date, kak_categories(name)')
        .eq('user_id', userId)
        .eq('tax_year_id', taxYear.id)
    : { data: null }

  const transactions = rawTx ?? []

  /* ── サマリ計算 ── */
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const profit = totalIncome - totalExpense
  const days = daysUntilFiling()
  const displayYear = taxYear?.year ?? currentYear

  /* ── 月次グラフデータ ── */
  const MONTHS = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const monthlyData: MonthlyData[] = MONTHS.map((month, i) => {
    const prefix = `${displayYear}-${String(i + 1).padStart(2, '0')}`
    const slice = transactions.filter((t) => t.date.startsWith(prefix))
    return {
      month,
      income: slice.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: slice.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    }
  })

  /* ── カテゴリ別支出データ ── */
  const catMap = new Map<string, number>()
  for (const t of transactions.filter((t) => t.type === 'expense')) {
    const name = t.kak_categories?.name ?? '未分類'
    catMap.set(name, (catMap.get(name) ?? 0) + t.amount)
  }
  const categoryData: CategoryData[] = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const isEmpty = transactions.length === 0

  /* ── 金額フォーマット ── */
  const fmt = (n: number) =>
    `${n < 0 ? '-' : ''}¥${Math.abs(n).toLocaleString('ja-JP')}`

  return (
    <div className="space-y-6">
      <PageHeader
        title="ダッシュボード"
        description={`${displayYear}年の収支状況`}
      />

      {/* サマリカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="今年の収入"
          value={fmt(totalIncome)}
          icon={<TrendingUp size={18} className="text-[#E8884A]" />}
          valueClass="text-[#E8884A]"
        />
        <SummaryCard
          label="今年の支出"
          value={fmt(totalExpense)}
          icon={<TrendingDown size={18} className="text-[#C4B49A]" />}
          valueClass="text-[#2D3B3B]"
        />
        <SummaryCard
          label="差引利益"
          value={fmt(profit)}
          icon={
            <Minus
              size={18}
              className={profit >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}
            />
          }
          valueClass={profit >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}
        />
        <SummaryCard
          label="申告期限まで"
          value={`${days}日`}
          icon={<CalendarClock size={18} className="text-[#2563EB]" />}
          valueClass="text-[#2D3B3B]"
        />
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-sm font-semibold text-[#2D3B3B] mb-4">月次収支推移</h2>
            <MonthlyBarChart data={monthlyData} />
          </Card>
          {categoryData.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-[#2D3B3B] mb-4">カテゴリ別支出</h2>
              <CategoryPieChart data={categoryData} />
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

/* ── ヘルパーコンポーネント ── */

function SummaryCard({
  label,
  value,
  icon,
  valueClass,
}: {
  label: string
  value: string
  icon: ReactNode
  valueClass: string
}) {
  return (
    <Card padding="sm">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#C4B49A]">{label}</p>
        {icon}
      </div>
      <p className={`text-xl font-bold ${valueClass} tabular-nums`}>{value}</p>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-14 h-14 bg-[#F5E6D8] rounded-full flex items-center justify-center mb-4">
          <ReceiptText size={28} className="text-[#E8884A]" />
        </div>
        <h3 className="text-base font-semibold text-[#2D3B3B] mb-2">
          まだデータがありません
        </h3>
        <p className="text-sm text-[#C4B49A] mb-6 max-w-sm leading-relaxed">
          収支データを入力するか、領収書をアップロードすることでグラフが表示されます。
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/transactions/new"
            className="bg-[#E8884A] text-white hover:bg-[#D4733A] px-5 py-2.5 rounded-[10px] text-sm font-medium transition-colors"
          >
            収支を入力する
          </Link>
          <Link
            href="/receipts/upload"
            className="bg-white text-[#2D3B3B] border border-[#E8E0D5] hover:bg-[#FAF7F3] px-5 py-2.5 rounded-[10px] text-sm font-medium transition-colors"
          >
            領収書をアップロード
          </Link>
        </div>
      </div>
    </Card>
  )
}

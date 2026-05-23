import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PrintButton } from '@/components/ui/PrintButton'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/* ── ヘルパー ── */
const fmt = (n: number) =>
  `${n < 0 ? '-' : ''}¥${Math.abs(n).toLocaleString('ja-JP')}`

const DECLARATION_LABEL: Record<string, string> = {
  blue: '青色申告（65万円控除）',
  white: '白色申告',
}

export default async function TaxReportPrintPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id

  const { data: taxYear } = await supabaseAdmin
    .from('kak_tax_years')
    .select('id, year, declaration_type')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle()

  const txResult = taxYear
    ? await supabaseAdmin
        .from('kak_transactions')
        .select('type, amount, kak_categories(name)')
        .eq('user_id', userId)
        .eq('tax_year_id', taxYear.id)
    : { data: null }

  const transactions = txResult.data ?? []

  type Row = { name: string; amount: number }

  const sumByCategory = (type: 'income' | 'expense'): Row[] => {
    const map = new Map<string, number>()
    for (const t of transactions.filter((t) => t.type === type)) {
      const name = t.kak_categories?.name ?? (type === 'income' ? 'その他収入' : 'その他経費')
      map.set(name, (map.get(name) ?? 0) + t.amount)
    }
    return Array.from(map.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
  }

  const incomeRows = sumByCategory('income')
  const expenseRows = sumByCategory('expense')
  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0)
  const totalExpense = expenseRows.reduce((s, r) => s + r.amount, 0)
  const netIncome = totalIncome - totalExpense

  const userName = session.user.name ?? session.user.email ?? '−'
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div>
      {/* ── ブラウザ表示専用ツールバー（印刷時は非表示） ── */}
      <div className="no-print flex items-center justify-between mb-6">
        <Link
          href="/tax-report"
          className="inline-flex items-center gap-1.5 text-sm text-[#C4B49A] hover:text-[#2D3B3B] transition-colors"
        >
          <ArrowLeft size={14} />
          申告書プレビューに戻る
        </Link>
        <PrintButton label="PDF・印刷" />
      </div>

      {/* ── 印刷ドキュメント本体 ── */}
      <div className="bg-white rounded-[16px] border border-[#E8E0D5] shadow-sm overflow-hidden print:shadow-none print:border-none print:rounded-none">

        {/* ドキュメントヘッダー */}
        <div className="bg-[#2D3B3B] px-8 py-6 print:bg-white print:border-b-2 print:border-black">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#C4B49A] tracking-widest mb-1 print:text-black">
                KAKERU — 収支内訳書
              </p>
              <h1 className="text-2xl font-bold text-white print:text-black">
                {taxYear?.year ?? new Date().getFullYear()}年度　確定申告
              </h1>
            </div>
            <span className="text-sm font-medium bg-white/10 text-white px-3 py-1 rounded-full print:bg-transparent print:border print:border-black print:text-black">
              {taxYear ? (DECLARATION_LABEL[taxYear.declaration_type] ?? taxYear.declaration_type) : '−'}
            </span>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[#C4B49A] print:text-black">
            <span>氏名：{userName}</span>
            <span>作成日：{today}</span>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">

          {/* ── 収入の部 ── */}
          <section>
            <SectionTitle label="収入の部" />
            <ReportTable
              rows={incomeRows}
              total={totalIncome}
              totalLabel="収入合計"
              emptyMessage="収入データがありません"
              amountClass="text-[#E8884A] print:text-black"
              totalAmountClass="font-bold text-[#E8884A] print:text-black"
            />
          </section>

          {/* ── 支出の部 ── */}
          <section>
            <SectionTitle label="支出の部（経費）" />
            <ReportTable
              rows={expenseRows}
              total={totalExpense}
              totalLabel="経費合計"
              emptyMessage="経費データがありません"
              amountClass="text-[#2D3B3B]"
              totalAmountClass="font-bold text-[#2D3B3B]"
            />
          </section>

          {/* ── 差引所得金額 ── */}
          <section className="border-t-2 border-[#2D3B3B] pt-6">
            <div className="space-y-2 mb-4">
              <SummaryLine label="収入合計" value={fmt(totalIncome)} />
              <SummaryLine label="経費合計" value={`− ${fmt(totalExpense)}`} />
            </div>
            <div className="flex items-center justify-between border-t border-[#2D3B3B] pt-4">
              <span className="text-base font-bold text-[#2D3B3B]">差引所得金額</span>
              <span
                className={[
                  'text-3xl font-bold tabular-nums',
                  netIncome >= 0 ? 'text-[#16A34A] print:text-black' : 'text-[#DC2626] print:text-black',
                ].join(' ')}
              >
                {fmt(netIncome)}
              </span>
            </div>
          </section>

          {/* フッター（印刷時のみ表示） */}
          <p className="hidden print:block text-[10px] text-center text-gray-400 pt-4 border-t border-gray-200">
            本書類はKakeru（確定申告支援アプリ）により自動生成されたものです。
            実際の申告には税理士等に相談の上、正式な申告書類をご使用ください。
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── ヘルパーコンポーネント ── */

function SectionTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-sm font-bold text-[#2D3B3B] border-b-2 border-[#E8884A] pb-0.5">
        {label}
      </span>
    </div>
  )
}

function ReportTable({
  rows,
  total,
  totalLabel,
  emptyMessage,
  amountClass,
  totalAmountClass,
}: {
  rows: { name: string; amount: number }[]
  total: number
  totalLabel: string
  emptyMessage: string
  amountClass: string
  totalAmountClass: string
}) {
  return (
    <table className="w-full text-sm border-collapse">
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={2}
              className="py-3 text-[#C4B49A] text-center border border-[#E8E0D5] print:border-gray-300"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((r) => (
            <tr key={r.name} className="border-b border-[#F5F0E8] print:border-gray-200">
              <td className="py-2 pr-4 text-[#2D3B3B]">{r.name}</td>
              <td className={`py-2 text-right tabular-nums ${amountClass}`}>
                {fmt(r.amount)}
              </td>
            </tr>
          ))
        )}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-[#E8E0D5] print:border-gray-400">
          <td className="py-2.5 pr-4 text-xs font-semibold text-[#2D3B3B]">{totalLabel}</td>
          <td className={`py-2.5 text-right tabular-nums ${totalAmountClass}`}>
            {fmt(total)}
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#C4B49A]">{label}</span>
      <span className="font-medium text-[#2D3B3B] tabular-nums">{value}</span>
    </div>
  )
}

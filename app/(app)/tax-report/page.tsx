import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { FileDown, ReceiptText, AlertCircle } from 'lucide-react'
import Link from 'next/link'

/* ── ヘルパー ── */
const fmt = (n: number) =>
  `${n < 0 ? '-' : ''}¥${Math.abs(n).toLocaleString('ja-JP')}`

const DECLARATION_LABEL: Record<string, string> = {
  blue: '青色申告',
  white: '白色申告',
}

export default async function TaxReportPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id

  /* ── データ取得 ── */
  const [{ data: taxYear }, { data: transactions }] = await Promise.all([
    supabaseAdmin
      .from('kak_tax_years')
      .select('id, year, declaration_type')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle(),

    supabaseAdmin
      .from('kak_transactions')
      .select('type, amount, kak_categories(name)')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .then(async (res) => {
        // tax_year_id でフィルタするため tax year が必要なので after fetch
        return res
      }),
  ])

  /* tax_year_id フィルタ */
  let filteredTx = transactions ?? []
  if (taxYear) {
    const { data: txWithYear } = await supabaseAdmin
      .from('kak_transactions')
      .select('type, amount, kak_categories(name)')
      .eq('user_id', userId)
      .eq('tax_year_id', taxYear.id)
    filteredTx = txWithYear ?? []
  }

  /* ── 科目別集計 ── */
  type Row = { name: string; amount: number }

  const sumByCategory = (type: 'income' | 'expense'): Row[] => {
    const map = new Map<string, number>()
    for (const t of filteredTx.filter((t) => t.type === type)) {
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

  const hasData = filteredTx.length > 0

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="確定申告"
        description="収支内訳書プレビュー"
        action={
          <Link
            href="/tax-report/print"
            className="inline-flex items-center gap-2 bg-[#2D3B3B] text-white hover:bg-[#1E2A2A] px-4 py-2 rounded-[10px] text-sm font-medium transition-colors"
          >
            <FileDown size={15} />
            PDF出力
          </Link>
        }
      />

      {/* 課税年度未設定 */}
      {!taxYear && (
        <Card>
          <div className="flex items-start gap-3 py-4">
            <AlertCircle size={20} className="text-[#D97706] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#2D3B3B]">課税年度が設定されていません</p>
              <p className="text-xs text-[#C4B49A] mt-1">
                設定画面から課税年度を設定するか、管理画面で kak_tax_years にデータを追加してください。
              </p>
            </div>
          </div>
        </Card>
      )}

      {taxYear && (
        <>
          {/* ── ドキュメントヘッダー ── */}
          <div className="bg-[#2D3B3B] rounded-[16px] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-white">
                  {taxYear.year}年度 確定申告
                </h2>
                <span
                  className={[
                    'text-xs font-medium px-2.5 py-1 rounded-full',
                    taxYear.declaration_type === 'blue'
                      ? 'bg-[#E8884A] text-white'
                      : 'bg-[#FAF7F3] text-[#2D3B3B]',
                  ].join(' ')}
                >
                  {DECLARATION_LABEL[taxYear.declaration_type] ?? taxYear.declaration_type}
                </span>
              </div>
              <p className="text-sm text-[#C4B49A]">氏名：{userName}</p>
            </div>
            <p className="text-xs text-[#C4B49A] sm:text-right">
              作成日：{today}
            </p>
          </div>

          {!hasData ? (
            /* データなし */
            <Card>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 bg-[#F5E6D8] rounded-full flex items-center justify-center mb-3">
                  <ReceiptText size={22} className="text-[#E8884A]" />
                </div>
                <p className="text-sm font-medium text-[#2D3B3B] mb-1">収支データがありません</p>
                <p className="text-xs text-[#C4B49A]">
                  収支一覧からデータを入力すると申告書が表示されます。
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* ── 収入・支出テーブル（2カラム） ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 収入の部 */}
                <Card padding="sm">
                  <SectionHeader label="収入の部" color="income" />
                  <table className="w-full text-sm mt-3">
                    <tbody>
                      {incomeRows.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-3 text-xs text-[#C4B49A] text-center">
                            収入データなし
                          </td>
                        </tr>
                      ) : (
                        incomeRows.map((r) => (
                          <tr key={r.name} className="border-b border-[#F5F0E8] last:border-0">
                            <td className="py-2.5 px-3 text-[#2D3B3B]">{r.name}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-[#E8884A] tabular-nums">
                              {fmt(r.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#E8E0D5]">
                        <td className="py-3 px-3 text-xs font-semibold text-[#2D3B3B]">
                          収入合計
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#E8884A] tabular-nums">
                          {fmt(totalIncome)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </Card>

                {/* 支出の部 */}
                <Card padding="sm">
                  <SectionHeader label="支出の部（経費）" color="expense" />
                  <table className="w-full text-sm mt-3">
                    <tbody>
                      {expenseRows.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-3 text-xs text-[#C4B49A] text-center">
                            経費データなし
                          </td>
                        </tr>
                      ) : (
                        expenseRows.map((r) => (
                          <tr key={r.name} className="border-b border-[#F5F0E8] last:border-0">
                            <td className="py-2.5 px-3 text-[#2D3B3B]">{r.name}</td>
                            <td className="py-2.5 px-3 text-right font-medium text-[#2D3B3B] tabular-nums">
                              {fmt(r.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#E8E0D5]">
                        <td className="py-3 px-3 text-xs font-semibold text-[#2D3B3B]">
                          経費合計
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#2D3B3B] tabular-nums">
                          {fmt(totalExpense)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </Card>
              </div>

              {/* ── 差引所得 サマリー ── */}
              <Card padding="sm">
                <div className="px-3 py-1 space-y-3">
                  {/* 収入・経費行 */}
                  <SummaryRow
                    label="収入合計"
                    value={fmt(totalIncome)}
                    valueClass="text-[#E8884A]"
                  />
                  <SummaryRow
                    label="経費合計"
                    value={`- ${fmt(totalExpense)}`}
                    valueClass="text-[#2D3B3B]"
                  />

                  {/* 区切り */}
                  <div className="border-t-2 border-[#2D3B3B] pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2D3B3B]">差引所得金額</span>
                    <div className="flex items-center gap-4">
                      <span
                        className={[
                          'text-2xl font-bold tabular-nums',
                          netIncome >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]',
                        ].join(' ')}
                      >
                        {fmt(netIncome)}
                      </span>
                      <Link
                        href="/tax-report/print"
                        className="inline-flex items-center gap-2 bg-[#E8884A] text-white hover:bg-[#D4733A] px-4 py-2 rounded-[10px] text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        <FileDown size={14} />
                        PDF出力
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  )
}

/* ── ヘルパーコンポーネント ── */

function SectionHeader({ label, color }: { label: string; color: 'income' | 'expense' }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-1">
      <span
        className={[
          'w-1 h-4 rounded-full',
          color === 'income' ? 'bg-[#E8884A]' : 'bg-[#2D3B3B]',
        ].join(' ')}
      />
      <h3 className="text-sm font-semibold text-[#2D3B3B]">{label}</h3>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[#C4B49A]">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  )
}

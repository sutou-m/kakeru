import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function TaxReportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="確定申告"
        description="申告書のプレビューと印刷ができます"
        action={
          <Link href="/tax-report/print">
            <Button variant="secondary">印刷プレビュー</Button>
          </Link>
        }
      />
      <Card>
        <p className="text-sm text-[#C4B49A]">確定申告レポート機能を実装予定です。</p>
      </Card>
    </div>
  )
}

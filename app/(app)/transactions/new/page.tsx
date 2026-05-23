import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export default function NewTransactionPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="収支を追加" description="新しい収入・支出を記録します" />
      <Card>
        <p className="text-sm text-[#C4B49A]">収支入力フォームを実装予定です。</p>
      </Card>
    </div>
  )
}

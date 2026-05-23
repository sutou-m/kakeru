import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="収支一覧"
        description="収入・支出の記録を管理します"
        action={
          <Link href="/transactions/new">
            <Button>＋ 新規追加</Button>
          </Link>
        }
      />
      <Card>
        <p className="text-sm text-[#C4B49A]">収支データがありません。新規追加から入力してください。</p>
      </Card>
    </div>
  )
}

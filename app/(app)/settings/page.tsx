import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="設定" description="アカウント・アプリの設定を変更します" />
      <Card>
        <p className="text-sm text-[#C4B49A]">設定機能を実装予定です。</p>
      </Card>
    </div>
  )
}

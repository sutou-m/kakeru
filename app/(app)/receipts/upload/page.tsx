import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export default function ReceiptsUploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="領収書OCR" description="領収書を撮影・アップロードして自動読み取りします" />
      <Card>
        <p className="text-sm text-[#C4B49A]">領収書アップロード機能を実装予定です。</p>
      </Card>
    </div>
  )
}

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { UploadForm } from '@/components/receipts/UploadForm'

export default async function ReceiptsUploadPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { data: categories } = await supabaseAdmin
    .from('kak_categories')
    .select('id, name, type')
    .order('sort_order', { ascending: true })

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader
        title="領収書OCR"
        description="領収書をアップロードすると日付・金額・科目をAIが自動入力します"
      />
      <Card>
        <UploadForm categories={categories ?? []} />
      </Card>
    </div>
  )
}

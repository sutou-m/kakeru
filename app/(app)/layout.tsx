import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <Sidebar />
      {/* デスクトップ: ml-60 でサイドバー分オフセット / モバイル: mt-14 でヘッダー分オフセット */}
      <main className="md:ml-60 mt-14 md:mt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

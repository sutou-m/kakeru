import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* 印刷時は非表示 */}
      <div className="no-print">
        <Sidebar />
      </div>
      {/* デスクトップ: ml-60 でサイドバー分オフセット / モバイル: mt-14 でヘッダー分オフセット */}
      <main className="md:ml-60 mt-14 md:mt-0 min-h-screen print:ml-0 print:mt-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 print:p-0 print:max-w-none">
          {children}
        </div>
      </main>
    </div>
  )
}

import Link from 'next/link'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="border-b border-[#E8E0D5] bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-[#E8884A]">Kakeru</span>
          <Link
            href="/login"
            className="bg-white text-[#2D3B3B] border border-[#E8E0D5] hover:bg-[#FAF7F3] px-4 py-2 text-sm font-medium rounded-[10px] transition-colors"
          >
            ログイン
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}

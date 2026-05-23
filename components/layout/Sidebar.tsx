'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  ArrowLeftRight,
  ScanLine,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { logoutAction } from '@/actions/auth'

const navItems = [
  { href: '/dashboard',       label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/transactions',    label: '収支一覧',       icon: ArrowLeftRight },
  { href: '/receipts/upload', label: '領収書OCR',      icon: ScanLine },
  { href: '/tax-report',      label: '確定申告',       icon: FileText },
]

function NavLink({ href, label, icon: Icon, active }: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors',
        active
          ? 'bg-[#F5E6D8] text-[#E8884A] font-medium'
          : 'text-[#C4B49A] hover:text-[#2D3B3B] hover:bg-[#FAF7F3]',
      ].join(' ')}
    >
      <Icon size={18} />
      {label}
    </Link>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* ロゴ */}
      <div className="px-6 py-5 border-b border-[#E8E0D5] flex items-center justify-between">
        <span className="text-xl font-bold text-[#E8884A]">Kakeru</span>
        {onClose && (
          <button onClick={onClose} className="text-[#C4B49A] hover:text-[#2D3B3B]">
            <X size={20} />
          </button>
        )}
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={pathname === href || (href !== '/dashboard' && pathname.startsWith(href))}
          />
        ))}
      </nav>

      {/* 下部メニュー */}
      <div className="px-3 py-4 border-t border-[#E8E0D5] space-y-1">
        <NavLink
          href="/settings"
          label="設定"
          icon={Settings}
          active={pathname === '/settings'}
        />
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm transition-colors text-[#C4B49A] hover:text-[#DC2626] hover:bg-red-50"
          >
            <LogOut size={18} />
            ログアウト
          </button>
        </form>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* デスクトップサイドバー */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 bg-white border-r border-[#E8E0D5] flex-col z-30">
        <SidebarContent />
      </aside>

      {/* モバイルヘッダー */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E8E0D5] flex items-center px-4 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-[#2D3B3B] p-1"
          aria-label="メニューを開く"
        >
          <Menu size={22} />
        </button>
        <span className="ml-3 text-lg font-bold text-[#E8884A]">Kakeru</span>
      </header>

      {/* モバイルドロワー */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/40 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 h-screen w-72 bg-white z-50 shadow-xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}

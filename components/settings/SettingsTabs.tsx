'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

type Tab = {
  id: string
  label: string
  content: ReactNode
}

export function SettingsTabs({ tabs, defaultTab }: { tabs: Tab[]; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const current = tabs.find((t) => t.id === activeTab) ?? tabs[0]

  return (
    <div className="space-y-6">
      {/* タブバー */}
      <div className="flex gap-1 bg-[#FAF7F3] border border-[#E8E0D5] rounded-[12px] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 px-2 py-2 rounded-[10px] text-xs sm:text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-[#2D3B3B] shadow-sm'
                : 'text-[#C4B49A] hover:text-[#2D3B3B]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div>{current.content}</div>
    </div>
  )
}

'use client'

import { Printer } from 'lucide-react'

export function PrintButton({ label = 'PDF出力' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-[#E8884A] text-white hover:bg-[#D4733A] px-5 py-2.5 rounded-[10px] text-sm font-medium transition-colors"
    >
      <Printer size={15} />
      {label}
    </button>
  )
}

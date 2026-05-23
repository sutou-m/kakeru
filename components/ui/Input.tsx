'use client'

import React from 'react'

type InputProps = {
  label?: string
  error?: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#2D3B3B]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full px-3 py-2 text-sm text-[#2D3B3B] bg-white rounded-[10px]',
          'border outline-none transition-colors',
          'placeholder:text-[#C4B49A]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]'
            : 'border-[#E8E0D5] focus:border-[#E8884A] focus:ring-1 focus:ring-[#E8884A]',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#C4B49A]">{hint}</p>}
    </div>
  )
}

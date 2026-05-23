'use client'

import React from 'react'

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'bg-[#E8884A] text-white hover:bg-[#D4733A]',
  secondary: 'bg-white text-[#2D3B3B] border border-[#E8E0D5] hover:bg-[#FAF7F3]',
  danger:    'bg-[#DC2626] text-white hover:bg-[#B91C1C]',
  ghost:     'bg-transparent text-[#E8884A] hover:bg-[#F5E6D8]',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

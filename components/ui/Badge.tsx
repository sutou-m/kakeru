import React from 'react'

type BadgeProps = {
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral'
  children: React.ReactNode
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-[#F5E6D8] text-[#E8884A]',
  success: 'bg-green-50 text-green-700',
  danger:  'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  neutral: 'bg-[#FAF7F3] text-[#C4B49A]',
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
      ].join(' ')}
    >
      {children}
    </span>
  )
}

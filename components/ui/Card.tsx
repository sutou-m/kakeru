import React from 'react'

type CardProps = {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const paddingClasses: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-[16px] border border-[#E8E0D5] shadow-sm',
        paddingClasses[padding],
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}

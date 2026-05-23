import React from 'react'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="読み込み中"
      className={[
        'inline-block rounded-full border-[#E8884A] border-t-transparent animate-spin',
        sizeClasses[size],
        className,
      ].filter(Boolean).join(' ')}
    />
  )
}

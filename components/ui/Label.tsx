import React from 'react'

type LabelProps = {
  required?: boolean
  children: React.ReactNode
} & React.LabelHTMLAttributes<HTMLLabelElement>

export function Label({ required, children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={[
        'text-sm font-medium text-[#2D3B3B]',
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-[#DC2626]">*</span>}
    </label>
  )
}

import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className = '', ...rest }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.12] bg-[#11141a] p-8 shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_22px_56px_-28px_rgba(0,0,0,0.78)] sm:p-10 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

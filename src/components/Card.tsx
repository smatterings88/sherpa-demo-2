import type { HTMLAttributes, ReactNode } from 'react'

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className = '', ...rest }: Props) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#11141a] p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_18px_50px_-24px_rgba(0,0,0,0.75)] sm:p-8 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

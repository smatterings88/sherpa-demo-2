import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b400] disabled:pointer-events-none disabled:opacity-40'

const variants: Record<Variant, string> = {
  primary:
    'bg-[#f5b400] px-7 py-3.5 text-sm text-black shadow-[0_0_0_1px_rgba(245,180,0,0.4),0_10px_36px_-8px_rgba(245,180,0,0.35)] hover:bg-[#ffc933] hover:shadow-[0_0_0_1px_rgba(255,201,51,0.45),0_12px_40px_-6px_rgba(245,180,0,0.42)] uppercase tracking-[0.1em]',
  secondary:
    'border border-white/[0.14] bg-white/[0.05] px-5 py-3 text-sm text-white hover:bg-white/[0.09]',
  ghost:
    'px-2 py-2 text-sm text-[#f5b400] underline-offset-4 hover:text-[#ffc933] hover:underline',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

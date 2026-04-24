import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type Props = {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  children?: ReactNode
  className?: string
  narrow?: boolean
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
  narrow = false,
}: Props) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`mx-auto w-full max-w-[1100px] px-5 py-24 sm:py-28 md:py-32 ${className}`}
    >
      <div className={narrow ? 'mx-auto max-w-[760px]' : ''}>
        {eyebrow ? (
          <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af] sm:text-[11px]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-balance text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.08]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-relaxed text-[#9ca3af] sm:text-lg">
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="mt-14">{children}</div> : null}
      </div>
    </motion.section>
  )
}

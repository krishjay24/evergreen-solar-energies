import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const tones = {
  gold: 'border-gold/30 bg-gold/[0.08] text-gold-accent',
  neutral: 'border-line-strong bg-warm-white/[0.04] text-warm-white/85',
  blue: 'border-solar-blue/40 bg-solar-blue/10 text-warm-white/90',
} as const

const dots = {
  gold: 'bg-gold',
  neutral: 'bg-warm-white/70',
  blue: 'bg-solar-blue',
} as const

interface EyebrowLabelProps {
  children: ReactNode
  tone?: keyof typeof tones
  className?: string
}

export function EyebrowLabel({ children, tone = 'gold', className }: EyebrowLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-eyebrow font-semibold uppercase',
        tones[tone],
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', dots[tone])} aria-hidden="true" />
      {children}
    </span>
  )
}

import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { EyebrowLabel } from './EyebrowLabel'

const titleSizes = {
  xl: 'text-display-xl',
  lg: 'text-display-lg',
  md: 'text-display-md',
} as const

interface SectionHeadingProps {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: 'left' | 'center'
  size?: keyof typeof titleSizes
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}

export function SectionHeading({
  title,
  eyebrow,
  description,
  actions,
  align = 'left',
  size = 'md',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  const centered = align === 'center'
  return (
    <div className={cn('flex flex-col gap-5', centered ? 'mx-auto max-w-3xl items-center text-center' : 'max-w-3xl items-start', className)}>
      {eyebrow && <EyebrowLabel>{eyebrow}</EyebrowLabel>}
      <Heading className={cn(titleSizes[size], 'font-semibold')}>{title}</Heading>
      {description && <p className="max-w-2xl text-lead text-muted">{description}</p>}
      {actions && <div className={cn('mt-3 flex flex-wrap gap-3', centered && 'justify-center')}>{actions}</div>}
    </div>
  )
}

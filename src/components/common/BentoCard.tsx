import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const tones = {
  default: 'surface-card',
  evergreen: 'surface-card border-gold/15 bg-evergreen',
  gold: 'rounded-card border border-gold bg-gold text-canvas',
  outline: 'rounded-card border border-line-strong bg-transparent',
} as const

const paddings = {
  md: 'p-6 md:p-7',
  lg: 'p-7 md:p-10',
} as const

interface BentoCardProps {
  as?: 'div' | 'article' | 'li'
  tone?: keyof typeof tones
  padding?: keyof typeof paddings
  interactive?: boolean
  icon?: LucideIcon
  title?: ReactNode
  description?: ReactNode
  className?: string
  children?: ReactNode
}

export function BentoCard({
  as: Component = 'div',
  tone = 'default',
  padding = 'md',
  interactive = false,
  icon: Icon,
  title,
  description,
  className,
  children,
}: BentoCardProps) {
  const onGold = tone === 'gold'
  return (
    <Component
      className={cn(
        'relative flex flex-col gap-4 overflow-hidden',
        tones[tone],
        paddings[padding],
        interactive && 'transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-gold/40',
        className,
      )}
    >
      {Icon && (
        <span
          className={cn(
            'grid size-12 place-items-center rounded-2xl',
            onGold ? 'bg-canvas text-gold-accent' : 'border border-gold/25 bg-gold/10 text-gold-accent',
          )}
        >
          <Icon className="icon-lg" aria-hidden="true" />
        </span>
      )}
      {title && <h3 className={cn('text-title font-semibold', onGold && 'text-canvas')}>{title}</h3>}
      {description && <p className={onGold ? 'text-canvas/80' : 'text-muted'}>{description}</p>}
      {children}
    </Component>
  )
}

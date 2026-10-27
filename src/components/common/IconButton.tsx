import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Action, type ActionPropsWithout } from './Action'

const variants = {
  solid: 'bg-gold text-canvas hover:bg-gold-accent',
  outline: 'border border-line-strong text-warm-white hover:border-gold/60 hover:text-gold-accent',
  ghost: 'text-muted hover:bg-warm-white/[0.06] hover:text-warm-white',
} as const

const sizes = {
  sm: { box: 'size-9', icon: 'icon-sm' },
  md: { box: 'size-11', icon: 'icon-md' },
  lg: { box: 'size-14', icon: 'icon-lg' },
} as const

export type IconButtonProps = ActionPropsWithout<'children'> & {
  icon: LucideIcon
  label: string
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function IconButton({ icon: Icon, label, variant = 'outline', size = 'md', className, ...props }: IconButtonProps) {
  return (
    <Action aria-label={label} title={label} className={cn('btn-icon', sizes[size].box, variants[variant], className)} {...props}>
      <Icon className={sizes[size].icon} aria-hidden="true" />
    </Action>
  )
}

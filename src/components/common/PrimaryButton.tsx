import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Action } from './Action'
import { buttonSizes, type ButtonProps } from './buttonSizes'

export type { ButtonProps, ButtonSize } from './buttonSizes'

export function PrimaryButton({ size = 'md', icon: Icon = ArrowUpRight, className, children, ...props }: ButtonProps) {
  const s = buttonSizes[size]
  return (
    <Action className={cn('btn-primary group', s.button, Icon && s.iconPad, className)} {...props}>
      <span>{children}</span>
      {Icon && (
        <span
          className={cn(
            'grid place-items-center rounded-full bg-canvas text-gold-accent transition-transform duration-300 ease-out-expo group-hover:rotate-45',
            s.iconWrap,
          )}
        >
          <Icon className="icon-sm" aria-hidden="true" />
        </span>
      )}
    </Action>
  )
}

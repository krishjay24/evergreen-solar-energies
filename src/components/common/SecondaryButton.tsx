import { cn } from '@/lib/cn'
import { Action } from './Action'
import { buttonSizes, type ButtonProps } from './buttonSizes'

export function SecondaryButton({ size = 'md', icon: Icon, className, children, ...props }: ButtonProps) {
  return (
    <Action className={cn('btn-secondary group', buttonSizes[size].button, className)} {...props}>
      <span>{children}</span>
      {Icon && (
        <Icon
          className="icon-sm text-gold transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </Action>
  )
}

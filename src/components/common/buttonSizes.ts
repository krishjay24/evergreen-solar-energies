import type { LucideIcon } from 'lucide-react'
import type { ActionProps } from './Action'

export const buttonSizes = {
  sm: { button: 'btn-sm', iconWrap: 'size-7', iconPad: 'pr-1.5' },
  md: { button: '', iconWrap: 'size-8', iconPad: 'pr-2' },
  lg: { button: 'btn-lg', iconWrap: 'size-10', iconPad: 'pr-2' },
} as const

export type ButtonSize = keyof typeof buttonSizes

export type ButtonProps = ActionProps & {
  size?: ButtonSize
  icon?: LucideIcon | null
}

import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { cn } from '@/lib/cn'

const sizes = {
  narrow: 'container-narrow',
  default: 'container-site',
  wide: 'container-wide',
} as const

type ContainerProps<T extends ElementType> = {
  as?: T
  size?: keyof typeof sizes
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function Container<T extends ElementType = 'div'>({ as, size = 'default', className, ...props }: ContainerProps<T>) {
  const Component: ElementType = as ?? 'div'
  return <Component className={cn(sizes[size], className as string | undefined)} {...props} />
}

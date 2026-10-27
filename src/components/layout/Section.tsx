import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Container } from './Container'

const tones = {
  default: 'bg-canvas',
  alt: 'bg-canvas-alt',
  evergreen: 'bg-evergreen',
  transparent: '',
} as const

const spacings = {
  default: 'section-y',
  compact: 'section-y-compact',
  none: '',
} as const

interface SectionProps extends Omit<ComponentPropsWithoutRef<'section'>, 'children'> {
  tone?: keyof typeof tones
  spacing?: keyof typeof spacings
  container?: 'narrow' | 'default' | 'wide' | false
  containerClassName?: string
  children: ReactNode
}

export function Section({
  tone = 'default',
  spacing = 'default',
  container = 'default',
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('relative', tones[tone], spacings[spacing], className)} {...props}>
      {container ? (
        <Container size={container} className={containerClassName}>
          {children}
        </Container>
      ) : (
        children
      )}
    </section>
  )
}

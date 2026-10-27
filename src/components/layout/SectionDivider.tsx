import { cn } from '@/lib/cn'
import { Container } from './Container'

interface SectionDividerProps {
  className?: string
}

export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <Container className={cn('flex items-center gap-4', className)} aria-hidden="true">
      <span className="h-px flex-1 bg-linear-to-r from-transparent to-line-strong" />
      <span className="size-1.5 rounded-full bg-gold shadow-[0_0_12px_2px] shadow-gold/50" />
      <span className="h-px flex-1 bg-linear-to-l from-transparent to-line-strong" />
    </Container>
  )
}

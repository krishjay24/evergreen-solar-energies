import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className="inline-flex items-center">
      <LoaderCircle className={cn('icon-lg animate-spin text-gold', className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}

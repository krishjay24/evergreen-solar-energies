import { RotateCw, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { PrimaryButton } from './PrimaryButton'

interface ErrorStateProps {
  title: string
  message: string
  status?: number
  onRetry?: () => void
  actions?: ReactNode
}

export function ErrorState({ title, message, status, onRetry, actions }: ErrorStateProps) {
  return (
    <div role="alert" className="container-narrow flex flex-1 flex-col items-center justify-center gap-5 py-24 text-center">
      <TriangleAlert className="size-10 text-gold" aria-hidden="true" />
      {status !== undefined && <p className="text-display-lg font-semibold text-gradient-gold">{status}</p>}
      <h1 className="text-display-md">{title}</h1>
      <p className="max-w-prose text-lead text-muted">{message}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <PrimaryButton onClick={onRetry} icon={RotateCw}>
            Try again
          </PrimaryButton>
        )}
        {actions}
      </div>
    </div>
  )
}

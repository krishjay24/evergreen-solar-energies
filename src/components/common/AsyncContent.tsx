import type { ReactNode } from 'react'
import type { AsyncState } from '@/types'
import { ErrorState } from './ErrorState'
import { Spinner } from './Spinner'

interface AsyncContentProps<T> {
  state: AsyncState<T>
  children: (data: T) => ReactNode
  onRetry?: () => void
  loading?: ReactNode
  errorTitle?: string
}

export function AsyncContent<T>({ state, children, onRetry, loading, errorTitle = 'Unable to load content' }: AsyncContentProps<T>) {
  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return loading ?? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )
    case 'error':
      return <ErrorState title={errorTitle} message={state.error.message} {...(onRetry ? { onRetry } : {})} />
    case 'success':
      return children(state.data)
  }
}

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportError } from '@/lib/errors'
import { ErrorState } from './ErrorState'

interface AppErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError({ error, componentStack: info.componentStack }, 'app')
  }

  override render(): ReactNode {
    if (!this.state.hasError) return this.props.children
    return (
      this.props.fallback ?? (
        <div className="flex min-h-svh flex-col">
          <ErrorState
            title="Something went wrong"
            message="An unexpected error occurred. Please reload the page."
            onRetry={() => window.location.reload()}
          />
        </div>
      )
    )
  }
}

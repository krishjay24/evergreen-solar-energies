import { useRouteError } from 'react-router'
import { ROUTES } from '@/config/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getErrorDetails, reportError } from '@/lib/errors'
import { ErrorState } from './ErrorState'
import { SecondaryButton } from './SecondaryButton'

export function RouteErrorBoundary() {
  const error = useRouteError()
  const details = getErrorDetails(error)
  useDocumentTitle(details.title)

  if (details.status !== 404) reportError(error, 'route')

  return (
    <div className="flex min-h-svh flex-col">
      <ErrorState
        {...details}
        {...(details.status === 404 ? {} : { onRetry: () => window.location.reload() })}
        actions={<SecondaryButton to={ROUTES.home}>Back to home</SecondaryButton>}
      />
    </div>
  )
}

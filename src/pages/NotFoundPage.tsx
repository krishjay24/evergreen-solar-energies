import { ErrorState } from '@/components/common/ErrorState'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { ROUTES } from '@/config/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <ErrorState
      status={404}
      title="Page not found"
      message="The page you are looking for does not exist or has moved."
      actions={<PrimaryButton to={ROUTES.home}>Back to home</PrimaryButton>}
    />
  )
}

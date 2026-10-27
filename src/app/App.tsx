import { MotionConfig } from 'motion/react'
import { useSyncExternalStore } from 'react'
import { RouterProvider } from 'react-router/dom'
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary'
import { PageLoader } from '@/components/common/PageLoader'
import { router } from './router'

export function App() {
  const ready = useSyncExternalStore(router.subscribe, () => router.state.initialized, () => false)
  return (
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <PageLoader ready={ready} />
        <RouterProvider router={router} />
      </MotionConfig>
    </AppErrorBoundary>
  )
}

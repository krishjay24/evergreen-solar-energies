import { renderToString } from 'react-dom/server'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { MotionConfig } from 'motion/react'
import { appRoutes } from './routes'
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary'

/** Render the same route components at build time; no headless browser or live service. */
export async function renderPage(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  try {
    if (!router.state.initialized) await new Promise<void>(resolve => {
      const unsubscribe = router.subscribe(state => { if (state.initialized) { unsubscribe(); resolve() } })
    })
    if (router.state.errors) throw new Error(`Cannot prerender ${path}: ${JSON.stringify(router.state.errors)}`)
    return renderToString(<AppErrorBoundary><MotionConfig reducedMotion="user"><RouterProvider router={router} /></MotionConfig></AppErrorBoundary>)
  } finally { router.dispose() }
}

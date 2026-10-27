import { Outlet } from 'react-router'
import { RouteProgress } from '@/components/common/RouteProgress'
import { ScrollManager } from './ScrollManager'
import { FloatingActions } from './FloatingActions'
import { RouteMetadata } from './RouteMetadata'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export function RootLayout() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn-primary">
        Skip to content
      </a>
      <RouteProgress />
      <RouteMetadata />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingActions />
      <ScrollManager />
    </>
  )
}

import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { seoHead } from '@/lib/seo'
import { trackEvent } from '@/lib/analytics'

export function RouteMetadata() {
  const { pathname } = useLocation()
  const lastPageView = useRef('')
  useEffect(() => {
    document.head.querySelectorAll('[data-seo], title, meta[name="description"], meta[name="robots"], meta[property^="og:"], meta[name^="twitter:"], link[rel="canonical"], script[data-local-business]').forEach(node => node.remove())
    const template = document.createElement('template')
    template.innerHTML = seoHead(pathname)
    document.head.append(template.content)
    if (lastPageView.current !== pathname) {
      trackEvent('page_view')
      lastPageView.current = pathname
    }
  }, [pathname])
  return null
}

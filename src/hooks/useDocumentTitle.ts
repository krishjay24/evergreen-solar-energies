import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { getPageSeo } from '@/lib/seo'

export function useDocumentTitle(title?: string): void {
  const { pathname } = useLocation()
  // Keep legacy page callers in sync with the central metadata owner.
  void title
  useEffect(() => {
    document.title = getPageSeo(pathname).title
  }, [pathname])
}

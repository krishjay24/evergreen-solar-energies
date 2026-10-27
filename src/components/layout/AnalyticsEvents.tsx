import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

/** Event-only integration; no third-party scripts, cookies or network calls. */
export function AnalyticsEvents() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null
      const href = link?.getAttribute('href') ?? ''
      if (href.startsWith('tel:')) trackEvent('phone_click')
      else if (href.startsWith('mailto:')) trackEvent('email_click')
      else if (/^https:\/\/wa\.me\//.test(href)) trackEvent('whatsapp_click')
    }
    document.addEventListener('click', click)
    return () => document.removeEventListener('click', click)
  }, [])
  return null
}

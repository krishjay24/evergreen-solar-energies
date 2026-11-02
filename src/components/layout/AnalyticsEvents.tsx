import { useEffect } from 'react'
import { ROUTES } from '@/config/routes'
import { trackEvent } from '@/lib/analytics'
import { consentEvents, getAnalyticsConsent, sendGa4Event, setAnalyticsConsent, type AnalyticsDetail } from '@/lib/ga4'
import { AnalyticsConsent } from './AnalyticsConsent'

/** One GA4 adapter for the existing sanitized event bridge. */
export function AnalyticsEvents() {
  useEffect(() => {
    const click = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a') : null
      const href = link?.getAttribute('href') ?? ''
      if (href.startsWith('tel:')) trackEvent('phone_click')
      else if (href.startsWith('mailto:')) trackEvent('email_click')
      else if (/^https:\/\/wa\.me\//.test(href)) trackEvent('whatsapp_click')
      if (link?.textContent?.trim() === 'Get a Quotation') trackEvent('quotation_click')
      if (href === ROUTES.siteVisit) trackEvent('site_visit_click')
    }
    const forward = (event: Event) => {
      const detail = (event as CustomEvent<AnalyticsDetail>).detail
      if (detail) sendGa4Event(detail)
    }
    const choice = () => {
      if (getAnalyticsConsent() === 'granted') sendGa4Event({ name: 'page_view', path: window.location.pathname })
    }
    const storage = (event: StorageEvent) => {
      if (event.key !== 'evergreen:ga4-consent') return
      setAnalyticsConsent(event.newValue === 'granted' ? 'granted' : 'denied')
    }
    document.addEventListener('click', click)
    window.addEventListener('evergreen:analytics', forward)
    window.addEventListener(consentEvents.choice, choice)
    window.addEventListener('storage', storage)
    choice()
    return () => {
      document.removeEventListener('click', click)
      window.removeEventListener('evergreen:analytics', forward)
      window.removeEventListener(consentEvents.choice, choice)
      window.removeEventListener('storage', storage)
    }
  }, [])
  return <AnalyticsConsent />
}

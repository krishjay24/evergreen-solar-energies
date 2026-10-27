import { getPageSeo } from '@/lib/seo'

export type SiteEvent = 'page_view' | 'phone_click' | 'email_click' | 'whatsapp_click' | 'site_visit_click' | 'solar_fit_open' | 'enquiry_confirmed'

/** Provider hook only: no personal form values are included or sent without configured analytics. */
export function trackEvent(name: SiteEvent, channel?: 'contact' | 'solar_fit'): void {
  if (typeof window === 'undefined' || import.meta.env.VITE_ANALYTICS_ENABLED !== 'true' || navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return
  const page = getPageSeo(window.location.pathname)
  // Never forward search/hash strings, phone numbers, wa.me URLs, form values or receipt IDs.
  window.dispatchEvent(new CustomEvent('evergreen:analytics', { detail: { name, path: page.found ? page.path : '/404', ...(channel ? { channel } : {}) } }))
}

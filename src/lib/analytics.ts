export type SiteEvent = 'phone_click' | 'email_click' | 'whatsapp_click' | 'site_visit_click' | 'solar_fit_open'

/** Provider hook only: no personal form values are included or sent without configured analytics. */
export function trackEvent(name: SiteEvent): void {
  window.dispatchEvent(new CustomEvent('evergreen:analytics', { detail: { name } }))
}

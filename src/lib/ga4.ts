import { getPageSeo } from '@/lib/seo'
import type { SiteEvent } from './analytics'

export const GA4_ID = 'G-9JE3R1SM3F'
const HOST = 'evergreen-solar-energies.netlify.app'
const CONSENT_KEY = 'evergreen:ga4-consent'
const CHOICE_EVENT = 'evergreen:ga4-choice'
const OPEN_EVENT = 'evergreen:ga4-open'
const EVENT_NAMES: readonly SiteEvent[] = [
  'page_view', 'phone_click', 'email_click', 'whatsapp_click', 'site_visit_click',
  'quotation_click', 'solar_fit_open', 'enquiry_confirmed',
]

export type ConsentChoice = 'granted' | 'denied' | null
export interface AnalyticsDetail {
  name: SiteEvent
  path: string
  channel?: 'contact' | 'solar_fit'
}

declare global {
  interface Window {
    dataLayer?: unknown[][]
    gtag?: (...args: unknown[]) => void
  }
}

let configured = false
let lastPagePath = ''

export function ga4Allowed(): boolean {
  return typeof window !== 'undefined'
    && import.meta.env.PROD
    && import.meta.env.VITE_ANALYTICS_ENABLED === 'true'
    && window.location.hostname === HOST
    && navigator.doNotTrack !== '1'
    && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
}

export function getAnalyticsConsent(): ConsentChoice {
  try {
    const choice = window.localStorage.getItem(CONSENT_KEY)
    return choice === 'granted' || choice === 'denied' ? choice : null
  } catch {
    return null
  }
}

const pageContext = (rawPath: string) => {
  const page = getPageSeo(rawPath)
  const path = page.found ? page.path : '/404'
  return {
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: page.title,
    page_referrer: '',
  }
}

function configureTag(): void {
  if (!ga4Allowed() || getAnalyticsConsent() !== 'granted') return
  Reflect.set(window, `ga-disable-${GA4_ID}`, false)
  if (!window.gtag) {
    window.dataLayer = window.dataLayer ?? []
    window.gtag = (...args: unknown[]) => { window.dataLayer!.push(args) }
  }
  if (!configured) {
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    })
    window.gtag('js', new Date())
    window.gtag('config', GA4_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...pageContext(window.location.pathname),
    })
    if (!document.querySelector(`script[src^="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"]`)) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
      document.head.appendChild(script)
    }
    configured = true
  }
  window.gtag('consent', 'update', { analytics_storage: 'granted' })
}

export function setAnalyticsConsent(choice: Exclude<ConsentChoice, null>): void {
  try { window.localStorage.setItem(CONSENT_KEY, choice) } catch { /* Private browsing may block storage. */ }
  if (choice === 'denied') {
    lastPagePath = ''
    Reflect.set(window, `ga-disable-${GA4_ID}`, true)
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
    // Remove GA's first-party cookies after a preference is withdrawn.
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0] ?? ''
      if (name === '_ga' || name.startsWith('_ga_')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; SameSite=Lax`
      }
    }
  } else {
    configureTag()
  }
  window.dispatchEvent(new Event(CHOICE_EVENT))
}

export function sendGa4Event(detail: AnalyticsDetail): void {
  if (!EVENT_NAMES.includes(detail.name) || !ga4Allowed() || getAnalyticsConsent() !== 'granted') return
  configureTag()
  if (!window.gtag) return
  const context = pageContext(detail.path)
  if (detail.name === 'page_view') {
    if (lastPagePath === context.page_path) return
    lastPagePath = context.page_path
    window.gtag('event', 'page_view', context)
  } else if (detail.name === 'enquiry_confirmed') {
    if (detail.channel !== 'contact' && detail.channel !== 'solar_fit') return
    window.gtag('event', 'generate_lead', { ...context, lead_source: detail.channel })
  } else {
    window.gtag('event', detail.name, context)
  }
}

export const consentEvents = { choice: CHOICE_EVENT, open: OPEN_EVENT } as const
export function openAnalyticsPreferences(): void {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

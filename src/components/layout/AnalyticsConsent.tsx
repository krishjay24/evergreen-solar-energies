import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ROUTES } from '@/config/routes'
import {
  consentEvents, ga4Allowed, getAnalyticsConsent, setAnalyticsConsent,
} from '@/lib/ga4'

/** Non-modal preference card; GA4 is never loaded until Allow is chosen. */
export function AnalyticsConsent() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(ga4Allowed() && getAnalyticsConsent() === null))
    const show = () => setOpen(true)
    const sync = () => setOpen(ga4Allowed() && getAnalyticsConsent() === null)
    window.addEventListener(consentEvents.open, show)
    window.addEventListener('storage', sync)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener(consentEvents.open, show)
      window.removeEventListener('storage', sync)
    }
  }, [])

  if (!open) return null
  const choose = (choice: 'granted' | 'denied') => {
    setAnalyticsConsent(choice)
    setOpen(false)
  }
  return (
    <aside
      aria-label="Analytics preferences"
      className="fixed bottom-4 left-4 z-50 w-[calc(100vw-6.5rem)] max-w-[26rem] rounded-card-sm border border-line-strong bg-card p-5 shadow-2xl sm:w-[26rem]"
    >
      <h2 className="text-base font-semibold">Your privacy, your choice.</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Allow Google Analytics to measure page views and selected interactions. No form details are sent. Analytics stays off until you choose.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose('granted')} className="btn-primary h-10 px-4 text-xs">Allow analytics</button>
        <button type="button" onClick={() => choose('denied')} className="btn-secondary h-10 px-4 text-xs">Decline</button>
      </div>
      <Link to={ROUTES.privacy} className="mt-3 inline-block text-xs text-gold-accent underline">Read our privacy policy</Link>
    </aside>
  )
}

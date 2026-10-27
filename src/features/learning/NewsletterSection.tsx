import { Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { Section } from '@/components/layout/Section'
import { siteConfig } from '@/config/site'

const endpoint = import.meta.env.VITE_NEWSLETTER_ENDPOINT?.startsWith('/') ? import.meta.env.VITE_NEWSLETTER_ENDPOINT : null
const unsubscribeUrl = import.meta.env.VITE_NEWSLETTER_UNSUBSCRIBE_URL
const ready = Boolean(endpoint && unsubscribeUrl)

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'subscribed'>('idle')
  const [error, setError] = useState('')
  const subscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ready || state === 'sending') return
    if (!z.email().safeParse(email).success || !consent) {
      setError('Enter a valid email address and confirm consent.')
      return
    }
    setState('sending')
    setError('')
    try {
      const response = await fetch(endpoint!, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent }),
      })
      if (response.status === 409) {
        setError('This address is already subscribed.')
        setState('idle')
        return
      }
      const receipt: unknown = await response.json()
      if (!response.ok || !receipt || typeof receipt !== 'object' || !('subscribed' in receipt) || receipt.subscribed !== true) throw new Error()
      setState('subscribed')
    } catch {
      setError('Subscription was not confirmed. Please try again later.')
      setState('idle')
    }
  }
  return (
    <Section tone="evergreen" containerClassName="grid gap-9 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div>
        <p className="text-xs font-bold tracking-widest text-gold-accent uppercase">Solar updates</p>
        <h2 className="mt-5 max-w-3xl text-display-md">Fresh Solar Updates to Help You Build a Greener Tomorrow.</h2>
        <p className="mt-4 text-sm leading-7 text-warm-white/75">Learn about solar fundamentals and preparation without unverified subsidy or savings claims.</p>
      </div>
      {ready ? (
        state === 'subscribed' ? <p role="status" className="surface-card p-6">The subscription service confirmed your email address. <a href={unsubscribeUrl} className="text-gold-accent underline">Unsubscribe</a></p> : (
          <form onSubmit={(event) => void subscribe(event)} className="surface-card p-6">
            <label className="text-sm font-semibold" htmlFor="newsletter-email">Email address</label>
            <input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-3 w-full rounded-xl border border-line-strong bg-canvas px-4 py-3" />
            <label className="mt-4 flex items-start gap-3 text-xs text-muted"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-0.5 accent-gold" />I agree to receive solar updates. I can unsubscribe at any time.</label>
            {error && <p role="alert" className="mt-3 text-sm text-gold-accent">{error}</p>}
            <button type="submit" disabled={state === 'sending'} className="btn-primary mt-5">{state === 'sending' ? 'Subscribing…' : 'Subscribe'}</button>
            <a href={unsubscribeUrl} className="mt-3 block text-xs text-muted underline">Unsubscribe</a>
          </form>
        )
      ) : (
        <div className="surface-card flex items-start gap-4 p-6">
          <Mail className="icon-lg shrink-0 text-gold" aria-hidden="true" />
          <div><p className="font-semibold">Email updates are coming soon.</p><p className="mt-2 text-sm leading-6 text-muted">Subscriptions are not open yet. Explore the learning hub or email <a href={`mailto:${siteConfig.contact.email}`} className="text-gold-accent underline">Evergreen</a> with a question.</p></div>
        </div>
      )}
    </Section>
  )
}

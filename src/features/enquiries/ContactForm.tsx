import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { siteConfig } from '@/config/site'
import { contactEnquiryWhatsAppHref, whatsappHref } from '@/lib/contact'
import { useWhatsAppEnquiry } from '@/hooks/useWhatsAppEnquiry'
import { trackEvent } from '@/lib/analytics'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(100),
  phone: z.string().trim().refine((value) => /^(?:\+?91)?[6-9]\d{9}$/.test(value.replace(/[\s-]/g, '')), 'Enter a valid Indian mobile number'),
  email: z.union([z.email(), z.literal('')]),
  project: z.enum(['residential', 'commercial', 'agricultural', 'other']),
  location: z.string().trim().min(2, 'Enter your location').max(150),
  message: z.string().trim().min(10, 'Tell us a little more about your enquiry').max(2000),
  consent: z.boolean().refine(Boolean, 'Consent is required'),
})

type Fields = z.infer<typeof schema>
const endpoint = import.meta.env.VITE_CONTACT_ENDPOINT?.startsWith('/') ? import.meta.env.VITE_CONTACT_ENDPOINT : null
const input = 'mt-2 w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-warm-white placeholder:text-muted/60 focus:border-gold focus:outline-none'

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'received'>('idle')
  const [error, setError] = useState('')
  const whatsapp = useWhatsAppEnquiry()
  const whatsappAvailable = whatsappHref('general') !== null
  const { register, handleSubmit, getValues, trigger, clearErrors, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', project: 'residential', consent: false },
  })
  const sendWhatsApp = () => {
    if (state !== 'idle' || isSubmitting || whatsapp.busy) return
    const result = schema.safeParse(getValues())
    if (!result.success) { whatsapp.clearFeedback(); void trigger(undefined, { shouldFocus: true }); return }
    clearErrors()
    setError('')
    whatsapp.openWhatsApp(contactEnquiryWhatsAppHref(result.data))
  }
  const submit = async (data: Fields) => {
    if (!endpoint || state !== 'idle' || whatsapp.busy) return
    whatsapp.clearFeedback()
    setState('sending')
    setError('')
    try {
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const receipt: unknown = await response.json()
      if (!response.ok || !receipt || typeof receipt !== 'object' || !('received' in receipt) || receipt.received !== true || !('id' in receipt) || typeof receipt.id !== 'string') throw new Error()
      setState('received')
      trackEvent('enquiry_confirmed', 'contact')
    } catch {
      setState('idle')
      setError('Submission was not confirmed. Please call or email us instead.')
    }
  }
  if (state === 'received') return <p role="status" className="surface-card p-8 text-warm-white">Your message was received and confirmed by the submission service. We will review the details; no response time is promised.</p>
  return (
    <form onSubmit={handleSubmit(submit)} onChange={whatsapp.clearFeedback} noValidate className="surface-card grid gap-5 p-6 sm:grid-cols-2 md:p-9">
      <h2 className="text-title sm:col-span-2">Send an enquiry</h2>
      <label className="text-sm font-semibold">Name <input {...register('name')} autoComplete="name" className={input} aria-invalid={!!errors.name} />{errors.name && <span role="alert" className="mt-1 block text-gold-accent">{errors.name.message}</span>}</label>
      <label className="text-sm font-semibold">Phone <input {...register('phone')} type="tel" inputMode="tel" autoComplete="tel" className={input} aria-invalid={!!errors.phone} />{errors.phone && <span role="alert" className="mt-1 block text-gold-accent">{errors.phone.message}</span>}</label>
      <label className="text-sm font-semibold">Email (optional) <input {...register('email')} type="email" autoComplete="email" className={input} aria-invalid={!!errors.email} />{errors.email && <span role="alert" className="mt-1 block text-gold-accent">{errors.email.message}</span>}</label>
      <label className="text-sm font-semibold">Project type <select {...register('project')} className={input}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="agricultural">Agricultural / Ground-Mounted</option><option value="other">Other</option></select></label>
      <label className="text-sm font-semibold sm:col-span-2">Location <input {...register('location')} className={input} aria-invalid={!!errors.location} />{errors.location && <span role="alert" className="mt-1 block text-gold-accent">{errors.location.message}</span>}</label>
      <label className="text-sm font-semibold sm:col-span-2">Message <textarea {...register('message')} rows={4} className={input} aria-invalid={!!errors.message} />{errors.message && <span role="alert" className="mt-1 block text-gold-accent">{errors.message.message}</span>}</label>
      <label className="flex items-start gap-3 text-sm sm:col-span-2"><input {...register('consent')} type="checkbox" className="mt-1 accent-gold" />I consent to sharing these enquiry details with Evergreen through my chosen channel and being contacted.</label>
      {errors.consent && <p role="alert" className="text-sm text-gold-accent sm:col-span-2">{errors.consent.message}</p>}
      {error && <p role="alert" className="text-sm text-gold-accent sm:col-span-2">{error}</p>}
      {whatsapp.error && <p role="alert" className="text-sm text-gold-accent sm:col-span-2">{whatsapp.error}</p>}
      {whatsapp.notice && <p role="status" className="text-sm leading-6 text-warm-white sm:col-span-2">{whatsapp.notice}</p>}
      <div className="flex min-w-0 flex-col gap-3 max-md:pr-14 sm:col-span-2 sm:flex-row sm:flex-wrap">
        {whatsappAvailable && <button type="button" onClick={sendWhatsApp} disabled={state === 'sending' || isSubmitting || whatsapp.busy} className="btn-secondary h-auto min-h-12 w-full px-4 py-3 text-center whitespace-normal sm:w-auto">Send Enquiry via WhatsApp</button>}
        {endpoint && <button type="submit" disabled={state === 'sending' || isSubmitting || whatsapp.busy} className="btn-primary h-auto min-h-12 w-full px-4 py-3 text-center whitespace-normal sm:w-auto">{state === 'sending' ? 'Sending…' : 'Submit Enquiry Online'}</button>}
      </div>
      {whatsappAvailable ? <p className="text-xs leading-6 text-muted sm:col-span-2">WhatsApp opens with your details. You must press Send there to send your enquiry.</p> : <p className="text-xs leading-6 text-muted sm:col-span-2">WhatsApp is unavailable. Please submit online or contact us by phone or email.</p>}
      {!endpoint && (
        <p role="status" className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-muted sm:col-span-2">
          Online submission is not connected yet. {whatsappAvailable ? 'Use WhatsApp above, or contact us at ' : 'Please contact us at '}<a className="text-gold-accent underline" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a> or call us.
        </p>
      )}
    </form>
  )
}

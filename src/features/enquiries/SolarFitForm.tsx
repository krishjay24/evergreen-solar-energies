import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useForm, useWatch, type FieldPath } from 'react-hook-form'
import { useLocation, useSearchParams } from 'react-router'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { siteConfig } from '@/config/site'
import { phoneHref, solarAssessmentWhatsAppHref, whatsappHref } from '@/lib/contact'
import { useWhatsAppEnquiry } from '@/hooks/useWhatsAppEnquiry'
import { trackEvent } from '@/lib/analytics'
import { solarFitSchema, solarFitEntrySchema, type SolarFitFields as Fields } from './solarFitSchema'

const titles = ['About You', 'Your Project', 'Your Site', 'Your Usage', 'Next Step'] as const
const stepFields: FieldPath<Fields>[][] = [
  ['name', 'phone', 'preferredContact'],
  ['project'],
  ['location', 'space', 'photos'],
  ['usage', 'phaseLoad', 'information'],
  ['consent'],
]
const inputClass = 'mt-2 w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-warm-white placeholder:text-muted/60 focus:border-gold focus:outline-none'
const labelClass = 'block text-sm font-semibold text-warm-white'
const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT?.startsWith('/') ? import.meta.env.VITE_ENQUIRY_ENDPOINT : null

export function SolarFitForm() {
  const [params] = useSearchParams()
  const location = useLocation()
  const draft = solarFitEntrySchema.safeParse((location.state as { solarFitDraft?: unknown } | null)?.solarFitDraft)
  const requested = params.get('project')
  const initial = requested === 'residential' || requested === 'commercial' || requested === 'agricultural' ? requested : undefined
  const [step, setStep] = useState(draft.success ? 2 : 0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'received'>('idle')
  const [submitError, setSubmitError] = useState('')
  const whatsapp = useWhatsAppEnquiry()
  const whatsappAvailable = whatsappHref('general') !== null
  const { register, handleSubmit, getValues, trigger, clearErrors, control, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(solarFitSchema),
    defaultValues: { ...(draft.success ? draft.data : { project: initial }), preferredContact: 'phone', requestSiteVisit: true, consent: false },
    shouldUnregister: false,
    mode: 'onTouched',
  })
  const details = useWatch({ control })
  const next = async () => {
    if (await trigger(stepFields[step]!, { shouldFocus: true })) setStep((value) => Math.min(4, value + 1))
  }
  const sendWhatsApp = () => {
    if (step !== 4 || status !== 'idle' || isSubmitting || whatsapp.busy) return
    const result = solarFitSchema.safeParse(getValues())
    if (!result.success) { whatsapp.clearFeedback(); void trigger(undefined, { shouldFocus: true }); return }
    clearErrors()
    setSubmitError('')
    whatsapp.openWhatsApp(solarAssessmentWhatsAppHref(result.data))
  }
  const submit = async (data: Fields) => {
    if (!endpoint || status !== 'idle' || whatsapp.busy) return
    whatsapp.clearFeedback()
    setStatus('sending')
    setSubmitError('')
    try {
      const body = new FormData()
      body.append('details', JSON.stringify({ ...data, photos: undefined, phone: data.phone.replace(/[\s-]/g, '') }))
      Array.from(data.photos ?? []).forEach((file) => body.append('photos', file))
      const response = await fetch(endpoint, { method: 'POST', body, credentials: 'same-origin' })
      const receipt: unknown = await response.json()
      if (!response.ok || !receipt || typeof receipt !== 'object' || !('received' in receipt) || receipt.received !== true || !('id' in receipt) || typeof receipt.id !== 'string') {
        throw new Error('The request was not confirmed. Please try again or contact us directly.')
      }
      setStatus('received')
      trackEvent('enquiry_confirmed', 'solar_fit')
    } catch {
      setStatus('idle')
      setSubmitError('Your request was not confirmed. No success has been recorded. Please try again or contact us directly.')
    }
  }

  if (status === 'received') return (
    <div role="status" className="surface-card p-8 text-center">
      <CheckCircle2 className="mx-auto size-12 text-gold" aria-hidden="true" />
      <h2 className="mt-5 text-display-md">Request received.</h2>
      <p className="mx-auto mt-4 max-w-xl text-muted">The submission service confirmed your enquiry. The next step is a review of your project details and site requirements; no response time is promised.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(submit)} onChange={whatsapp.clearFeedback} noValidate className="surface-card p-5 sm:p-8 md:p-10">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold tracking-widest text-gold-accent uppercase">Solar Fit Assessment</span>
        <span className="text-sm text-muted">Step {step + 1} of {titles.length}</span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-line-strong" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1} aria-label="Assessment progress">
        <motion.div className="h-full rounded-full bg-gold" animate={{ width: `${((step + 1) / 5) * 100}%` }} transition={{ duration: 0.35 }} />
      </div>
      {!endpoint && <p role="status" className="mt-6 rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm leading-6 text-muted">
        Online submission is not connected yet. {whatsappAvailable ? 'You can complete the assessment and send it via WhatsApp, or call or email us.' : 'Call or email us to make an enquiry.'}
      </p>}
      <h2 className="mt-8 text-display-md">{titles[step]}</h2>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.24 }} className="mt-7 space-y-5">
          {step === 0 && <>
            <label className={labelClass}>Full name <input {...register('name')} autoComplete="name" className={inputClass} placeholder="Your full name" aria-invalid={!!errors.name} /></label>
            {errors.name && <p role="alert" className="text-sm text-gold-accent">{errors.name.message}</p>}
            <label className={labelClass}>Phone / WhatsApp number <input {...register('phone')} autoComplete="tel" type="tel" inputMode="tel" className={inputClass} placeholder="Indian mobile number" aria-invalid={!!errors.phone} /></label>
            {errors.phone && <p role="alert" className="text-sm text-gold-accent">{errors.phone.message}</p>}
            <label className={labelClass}>Preferred contact method <select {...register('preferredContact')} className={inputClass}><option value="phone">Phone call</option>{whatsappHref('general') && <option value="whatsapp">WhatsApp</option>}</select></label>
          </>}
          {step === 1 && <fieldset>
            <legend className="text-sm font-semibold">What kind of project are you considering?</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                ['residential', 'Residential'],
                ['commercial', 'Commercial'],
                ['agricultural', 'Agricultural / Ground-Mounted'],
                ['other', 'Other'],
              ] as const).map(([value, label]) => (
                <label key={value} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm ${details.project === value ? 'border-gold bg-gold/10' : 'border-line-strong'}`}>
                  <input type="radio" value={value} {...register('project')} className="accent-gold" />{label}
                </label>
              ))}
            </div>
            {errors.project && <p role="alert" className="mt-3 text-sm text-gold-accent">{errors.project.message}</p>}
          </fieldset>}
          {step === 2 && <>
            <label className={labelClass}>Project location <input {...register('location')} autoComplete="address-level2" className={inputClass} placeholder="Town or area" aria-invalid={!!errors.location} /></label>
            {errors.location && <p role="alert" className="text-sm text-gold-accent">{errors.location.message}</p>}
            <label className={labelClass}>Approximate roof or land space (optional) <input {...register('space')} className={inputClass} placeholder="For example, 500 sq ft (if known)" /></label>
            <label className={labelClass}>Site photographs (optional; up to 3, JPG/PNG/WebP, 3 MB combined) <input {...register('photos')} type="file" multiple accept="image/jpeg,image/png,image/webp" className={`${inputClass} file:mr-4 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-2 file:text-canvas`} /></label>
            {errors.photos && <p role="alert" className="text-sm text-gold-accent">{errors.photos.message}</p>}
          </>}
          {step === 3 && <>
            <label className={labelClass}>Monthly bill or consumption (optional) <input {...register('usage')} className={inputClass} placeholder="Approximate bill amount or monthly units" /></label>
            <label className={labelClass}>Electrical phase / load (optional) <input {...register('phaseLoad')} className={inputClass} placeholder="If known" /></label>
            <label className={labelClass}>Anything else we should know? <textarea {...register('information')} rows={4} className={inputClass} placeholder="Project goals, access or site details" /></label>
          </>}
          {step === 4 && <>
            <dl className="grid gap-3 rounded-card-sm border border-line bg-canvas p-5 text-sm sm:grid-cols-2">
              {([['Name', details.name], ['Phone', details.phone], ['Contact method', details.preferredContact], ['Project', details.project], ['Location', details.location], ['Space', details.space || 'Not provided'], ['Usage', details.usage || 'Not provided'], ['Phase / load', details.phaseLoad || 'Not provided']] as const).map(([label, value]) => (
                <div key={label}><dt className="text-muted">{label}</dt><dd className="mt-1 font-semibold break-words">{value || 'Not provided'}</dd></div>
              ))}
            </dl>
            <label className="flex items-start gap-3 text-sm text-warm-white"><input {...register('requestSiteVisit')} type="checkbox" className="mt-1 accent-gold" />Request a site visit as the next step</label>
            <label className="flex items-start gap-3 text-sm text-warm-white"><input {...register('consent')} type="checkbox" className="mt-1 accent-gold" />I consent to sharing these enquiry details with Evergreen through my chosen channel and being contacted.</label>
            {errors.consent && <p role="alert" className="text-sm text-gold-accent">{errors.consent.message}</p>}
            <p className="text-sm font-semibold text-gold-accent">Price based on site inspection and quotation.</p>
            <p className="text-xs leading-6 text-muted">Final pricing depends on site conditions, system capacity, equipment selection and applicable requirements. Approvals, net-metering requirements, subsidy eligibility and documents may vary by project, scheme and local DISCOM. Subsidy approval, generation, payback and savings are not guaranteed.</p>
            {whatsappAvailable && <p className="text-xs leading-6 text-muted">For WhatsApp, attach site photographs manually after it opens. Website-selected photos are not attached automatically; they are uploaded only with Submit Enquiry Online.</p>}
            {!whatsappAvailable && <p className="text-xs leading-6 text-muted">WhatsApp is unavailable. Please submit online or contact us by phone or email.</p>}
            {!endpoint && <p role="status" className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-warm-white">Online submission is not configured yet. Your details have not been sent. {whatsappAvailable ? 'You can choose WhatsApp below, or contact us by phone or email.' : 'Please contact us by phone or email.'}</p>}
          </>}
        </motion.div>
      </AnimatePresence>
      {submitError && <p role="alert" className="mt-5 text-sm text-gold-accent">{submitError}</p>}
      {whatsapp.error && <p role="alert" className="mt-5 text-sm text-gold-accent">{whatsapp.error}</p>}
      {whatsapp.notice && <p role="status" className="mt-5 text-sm leading-6 text-warm-white">{whatsapp.notice}</p>}
      <div className="mt-9 flex flex-wrap items-center gap-3 max-md:pr-14">
        {step > 0 && <button type="button" onClick={() => setStep((value) => value - 1)} disabled={status === 'sending' || isSubmitting || whatsapp.busy} className="btn-secondary"><ArrowLeft className="icon-sm" aria-hidden="true" />Back</button>}
        {step < 4 ? <button type="button" onClick={() => void next()} className="btn-primary">Next <ArrowRight className="icon-sm" aria-hidden="true" /></button> : (
          <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:max-w-full sm:flex-row sm:flex-wrap">
            {whatsappAvailable && <button type="button" onClick={sendWhatsApp} disabled={status === 'sending' || isSubmitting || whatsapp.busy} className="btn-secondary h-auto min-h-12 w-full px-4 py-3 text-center whitespace-normal sm:w-auto">Send Solar Assessment via WhatsApp</button>}
            {endpoint ? <PrimaryButton type="submit" disabled={status === 'sending' || isSubmitting || whatsapp.busy} icon={null} className="h-auto min-h-12 w-full px-4 py-3 text-center whitespace-normal sm:w-auto">{status === 'sending' ? 'Sending…' : 'Submit Enquiry Online'}</PrimaryButton> : <>
              <a href={phoneHref(siteConfig.contact.phone)} className="btn-primary">Call Evergreen</a>
              <a href={`mailto:${siteConfig.contact.email}`} className="btn-secondary"><Mail className="icon-sm" aria-hidden="true" />Email us</a>
            </>}
          </div>
        )}
      </div>
    </form>
  )
}

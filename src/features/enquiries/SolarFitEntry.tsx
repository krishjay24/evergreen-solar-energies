import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Section } from '@/components/layout/Section'
import { ROUTES } from '@/config/routes'
import { trackEvent } from '@/lib/analytics'
import { solarFitEntrySchema, type SolarFitEntryFields } from './solarFitSchema'

const inputClass = 'mt-2 w-full rounded-xl border border-line-strong bg-canvas px-4 py-3 text-warm-white placeholder:text-muted/60 focus:border-gold focus:outline-none'

/** A first step into the existing assessment, with no submission or extra backend. */
export function SolarFitEntry() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<SolarFitEntryFields>({
    resolver: zodResolver(solarFitEntrySchema),
    mode: 'onTouched',
  })
  const continueAssessment = (data: SolarFitEntryFields) => {
    trackEvent('solar_fit_open')
    // Keep personal details out of URLs, analytics and local/session storage.
    navigate(ROUTES.quote, { state: { solarFitDraft: data } })
  }
  return (
    <Section id="quick-enquiry" spacing="none" className="py-6 md:py-8" aria-labelledby="quick-enquiry-heading">
      <div className="surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="quick-enquiry-heading" className="text-title">Start your Solar Fit enquiry.</h2>
          <p className="text-xs leading-6 text-muted">Continue to your site details. Nothing is sent until you submit the full assessment.</p>
        </div>
        <form onSubmit={handleSubmit(continueAssessment)} noValidate className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.1fr_auto]">
          <div>
            <label htmlFor="quick-enquiry-name" className="text-sm font-semibold">Full name</label>
            <input id="quick-enquiry-name" {...register('name')} autoComplete="name" placeholder="Your full name" className={inputClass} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'quick-name-error' : undefined} />
            {errors.name && <p id="quick-name-error" role="alert" className="mt-2 text-xs text-gold-accent">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="quick-enquiry-phone" className="text-sm font-semibold">Phone / WhatsApp number</label>
            <input id="quick-enquiry-phone" {...register('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="Indian mobile number" className={inputClass} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'quick-phone-error' : undefined} />
            {errors.phone && <p id="quick-phone-error" role="alert" className="mt-2 text-xs text-gold-accent">{errors.phone.message}</p>}
          </div>
          <div>
            <label htmlFor="quick-enquiry-project" className="text-sm font-semibold">Project type</label>
            <select id="quick-enquiry-project" {...register('project')} defaultValue="" className={inputClass} aria-invalid={!!errors.project} aria-describedby={errors.project ? 'quick-project-error' : undefined}>
              <option value="" disabled>Select your project</option>
              <option value="residential">Residential Rooftop</option>
              <option value="commercial">Commercial Solar</option>
              <option value="agricultural">Agricultural / Ground-Mounted</option>
              <option value="other">Other</option>
            </select>
            {errors.project && <p id="quick-project-error" role="alert" className="mt-2 text-xs text-gold-accent">{errors.project.message}</p>}
          </div>
          <PrimaryButton type="submit" icon={null} className="mr-14 justify-center self-start sm:mt-8 md:mr-0">Continue assessment</PrimaryButton>
        </form>
      </div>
    </Section>
  )
}

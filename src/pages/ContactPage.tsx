import { Mail, MapPin, Phone } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { siteConfig, serviceAreaNames } from '@/config/site'
import { ContactForm } from '@/features/enquiries/ContactForm'
import { mapsEmbedHref, mapsHref, phoneHref, whatsappHref } from '@/lib/contact'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SolarPhoto } from '@/components/solar/SolarPhoto'

export default function ContactPage() {
  useDocumentTitle('Contact')
  const whatsapp = whatsappHref('general')
  const businessVerified = import.meta.env.VITE_BUSINESS_DETAILS_VERIFIED === 'true'
  return (
    <>
      <Section tone="alt">
        <SectionHeading as="h1" size="lg" eyebrow="Contact" title="Let's talk about your site." description={`Evergreen Solar Energies welcomes enquiries across ${serviceAreaNames.join(', ')}.${businessVerified ? '' : ' Business contact details require final verification before publication.'}`} />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {siteConfig.contact.phones.map((phone) => <a key={phone} href={phoneHref(phone)} className="surface-card flex min-h-32 flex-col justify-between p-6 transition-colors hover:border-gold/50"><Phone className="icon-lg text-gold" aria-hidden="true" /><span className="mt-4 text-sm">{phone}</span></a>)}
          <a href={`mailto:${siteConfig.contact.email}`} className="surface-card flex min-h-32 flex-col justify-between break-all p-6 transition-colors hover:border-gold/50"><Mail className="icon-lg text-gold" aria-hidden="true" /><span className="mt-4 text-sm">{siteConfig.contact.email}</span></a>
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="surface-card flex min-h-32 flex-col justify-between p-6 transition-colors hover:border-gold/50"><MapPin className="icon-lg text-gold" aria-hidden="true" /><span className="mt-4 text-sm">Get directions · Kadapa</span></a>
        </div>
        <address className="mt-6 text-sm not-italic text-muted">{siteConfig.contact.address}</address>
        {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block text-sm font-semibold text-gold-accent">Message us on WhatsApp</a>}
        <figure className="mt-8 overflow-hidden rounded-card border border-line bg-card">
          <iframe
            title="Evergreen Solar Energies address in Kadapa on Google Maps"
            src={mapsEmbedHref}
            width="1200"
            height="400"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="block h-80 w-full border-0 md:h-96"
          />
          <figcaption className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm sm:px-6">
            <span className="inline-flex items-center gap-2 text-warm-white"><MapPin className="icon-sm text-gold" aria-hidden="true" />Find us in Kadapa</span>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-gold-accent transition-colors hover:text-warm-white">Open in Google Maps</a>
          </figcaption>
        </figure>
      </Section>
      <Section id="site-visit" containerClassName="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow="Site visits & enquiries" title="Tell us what you have in mind." description="A site review informs system suitability and any quotation. No savings or subsidy is guaranteed." />
          <figure className="mt-8 overflow-hidden rounded-card border border-line">
            <SolarPhoto photo="contact-assessment" className="aspect-[4/3] w-full" sizes="(min-width: 1024px) 40vw, 100vw" />
            <figcaption className="bg-card px-5 py-3 text-xs text-muted">Reference photography · Not the Evergreen team.</figcaption>
          </figure>
        </div>
        <ContactForm />
      </Section>
    </>
  )
}

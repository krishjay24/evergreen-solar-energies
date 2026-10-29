import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { SolarPhoto } from '@/components/solar/SolarPhoto'
import { ROUTES } from '@/config/routes'
import { services } from '@/data/services'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { whatsappHref } from '@/lib/contact'
import { SecondaryButton } from '@/components/common/SecondaryButton'

export default function SolarSolutionsPage() {
  useDocumentTitle('Solar Solutions')
  return (
    <>
      <Section tone="alt">
        <SectionHeading as="h1" size="lg" eyebrow="Solar solutions" title="Considered solar, designed for your site." description="Explore residential, commercial, agricultural solar and solar-powered electric fencing enquiries. Each proposal depends on site requirements and applicable approvals." />
      </Section>
      {services.map((service, index) => {
        const whatsapp = whatsappHref(service.id)
        return (
        <Section key={service.id} id={service.id} tone={index % 2 ? 'alt' : 'default'}>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <figure className={`relative aspect-[4/3] overflow-hidden rounded-card border border-line ${index % 2 ? 'lg:order-2' : ''}`}>
              <SolarPhoto photo={`solutions-${service.id}`} className="size-full object-cover" />
              <figcaption className="absolute bottom-4 left-4 rounded-full bg-canvas/80 px-3 py-1.5 text-xs text-warm-white">{service.id === 'fencing' ? 'AI-generated illustration' : 'Reference photo: not an Evergreen project'}</figcaption>
            </figure>
            <div>
              <SectionHeading eyebrow={`0${index + 1} / 0${services.length} · Solar solutions`} title={service.title} description={service.short} />
              {service.highlights && <ul className="mt-6 space-y-2 text-sm text-gold-accent">{service.highlights.map(item => <li key={item}>{item}</li>)}</ul>}
              <dl className="mt-7 divide-y divide-line border-y border-line">
                {[
                  ['Who it suits', service.suitable],
                  ['Typical site requirements', service.site],
                  ['How it works', service.process],
                  ['Assessment considerations', service.assessment],
                ].map(([label, detail]) => (
                  <div key={label} className="py-4">
                    <dt className="text-sm font-semibold text-gold-accent">{label}</dt>
                    <dd className="mt-1 text-sm leading-7 text-muted">{detail}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 rounded-card-sm border border-line p-5">
                <h3 className="font-semibold">{service.faq[0]!.question}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{service.faq[0]!.answer}</p>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                {service.id !== 'fencing' && <PrimaryButton to={`${ROUTES.quote}?project=${service.id}`}>Request consultation</PrimaryButton>}
                {whatsapp && <SecondaryButton href={whatsapp} target="_blank" rel="noopener noreferrer">{service.id === 'fencing' ? 'Enquire About Solar Fencing' : 'Discuss on WhatsApp'}</SecondaryButton>}
              </div>
            </div>
          </div>
        </Section>
        )
      })}
    </>
  )
}

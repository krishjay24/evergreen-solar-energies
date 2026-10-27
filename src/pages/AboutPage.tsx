import { Compass, Handshake, MapPin, PanelsTopLeft, ScanSearch, Sun } from 'lucide-react'
import { BentoCard } from '@/components/common/BentoCard'
import { CTASection } from '@/components/common/CTASection'
import { EyebrowLabel } from '@/components/common/EyebrowLabel'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { ROUTES } from '@/config/routes'
import { serviceAreaNames, siteConfig } from '@/config/site'
import { aboutCopy } from '@/features/home/about/aboutContent'
import { AboutVisual } from '@/features/home/about/AboutVisual'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const values = [
  {
    icon: ScanSearch,
    title: 'Understand the site',
    description: 'Review available space, shading and electricity usage before recommending a system.',
  },
  {
    icon: PanelsTopLeft,
    title: 'Plan for the property',
    description: 'Consider equipment and layout in the context of the site, rather than a generic package.',
  },
  {
    icon: Handshake,
    title: 'Explain the approach',
    description: 'Make the proposed scope and installation steps clear before a quotation is prepared.',
  },
] as const

const approach = [
  {
    number: '01',
    title: 'Site assessment',
    detail: 'Learn about the property, roof or land, shading, electricity use and project requirements.',
  },
  {
    number: '02',
    title: 'System planning',
    detail: 'Explore a suitable solar layout and system approach based on the reviewed site.',
  },
  {
    number: '03',
    title: 'Equipment coordination',
    detail: 'Discuss equipment options and scope in the context of the proposed system.',
  },
  {
    number: '04',
    title: 'Installation support',
    detail: 'Coordinate the next steps for installation according to the agreed project requirements.',
  },
] as const

export default function AboutPage() {
  useDocumentTitle('About Evergreen')

  return (
    <>
      <Section tone="alt" containerClassName="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20">
        <div>
          <SectionHeading
            as="h1"
            size="lg"
            eyebrow="About Evergreen"
            title={aboutCopy.heading}
            description={aboutCopy.description[0]}
          />
          <div className="mt-7 max-w-xl space-y-3 text-base leading-7 text-muted">
            <p>{aboutCopy.description[1]}</p>
            <p>{aboutCopy.description[2]}</p>
          </div>
          <p className="mt-9 border-l-2 border-gold pl-5 font-display text-lg text-warm-white">
            {siteConfig.tagline}
          </p>
        </div>
        <AboutVisual page />
      </Section>

      <Section containerClassName="grid gap-8 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-16">
        <SectionHeading
          eyebrow="Our direction"
          title="A practical path to cleaner power."
          description="Solar works best when the system is considered in the context of the property it will serve."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <BentoCard icon={Compass} title="Our mission" padding="lg">
            <p className="text-sm leading-7 text-muted">
              Help customers explore site-appropriate solar through assessment, planning and clear installation support.
            </p>
          </BentoCard>
          <BentoCard icon={Sun} title="Our vision" padding="lg">
            <p className="text-sm leading-7 text-muted">
              Make considered solar energy choices easier for homes and businesses in the communities we serve.
            </p>
          </BentoCard>
        </div>
      </Section>

      <Section tone="alt">
        <SectionHeading eyebrow="What guides us" title="Thoughtful at every step." />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <BentoCard key={value.title} icon={value.icon} title={value.title} description={value.description} padding="lg" />
          ))}
        </div>
      </Section>

      <Section containerClassName="grid gap-12 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Local presence"
            title="Close to the communities we serve."
            description="Evergreen Solar Energies welcomes enquiries across Kadapa, Mydukur and Proddatur. Project suitability is reviewed individually."
          />
          <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Service areas">
            {serviceAreaNames.map((name) => (
              <li key={name} className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm text-warm-white">
                <MapPin className="icon-sm text-gold" aria-hidden="true" />
                {name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <EyebrowLabel>Installation support</EyebrowLabel>
          <ol className="mt-8 divide-y divide-line border-t border-line">
            {approach.map((step) => (
              <li key={step.number} className="grid grid-cols-[2.5rem_1fr] gap-5 py-5 md:gap-8">
                <span className="pt-1 font-mono text-sm text-gold-accent">{step.number}</span>
                <div>
                  <h3 className="text-title">{step.title}</h3>
                  <p className="mt-2 max-w-prose text-sm leading-7 text-muted">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-muted">
            A quotation is prepared after the site requirements have been reviewed.
          </p>
        </div>
      </Section>

      <CTASection
        eyebrow="Start a conversation"
        title="Let's look at what solar could mean for your property."
        description="Tell us about your site so we can discuss the appropriate next steps."
        primaryAction={{ label: 'Request a Site Visit', to: ROUTES.siteVisit }}
        secondaryAction={{ label: 'Explore Solar Solutions', to: ROUTES.solarSolutions }}
      />
    </>
  )
}

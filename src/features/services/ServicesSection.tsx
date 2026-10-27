import { ArrowRight, ScanSearch } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { BentoCard } from '@/components/common/BentoCard'
import { EyebrowLabel } from '@/components/common/EyebrowLabel'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { SolarPhoto } from '@/components/solar/SolarPhoto'
import { ROUTES } from '@/config/routes'
import { services, type ServiceId } from '@/data/services'
import { whatsappHref } from '@/lib/contact'

export function ServicesSection() {
  const [selected, setSelected] = useState<ServiceId>('residential')
  const service = services.find((item) => item.id === selected) ?? services[0]!
  const next = services[(services.findIndex((item) => item.id === selected) + 1) % services.length]!
  const whatsapp = whatsappHref(service.id)

  return (
    <Section id="services" tone="default">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Solar solutions"
          title={<>Every site has <span className="text-gradient-gold">its own potential.</span></>}
          description="Explore site-specific solar options. Suitability is confirmed through assessment, not a standard package."
        />
        <SecondaryButton to={ROUTES.solarSolutions} icon={ArrowRight}>All solutions</SecondaryButton>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative aspect-[5/4] overflow-hidden rounded-card border border-line bg-card md:aspect-[4/3] lg:aspect-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38 }}
              className="absolute inset-0"
            >
              <SolarPhoto photo={`home-${service.id}`} className="size-full object-cover" />
            </motion.div>
          </AnimatePresence>
          <span className="absolute bottom-5 left-5 rounded-full border border-line-strong bg-canvas/75 px-3 py-1.5 text-xs text-warm-white backdrop-blur-md">
            Reference photo · Not an Evergreen project
          </span>
        </div>
        <div className="surface-card flex flex-col p-6 md:p-9">
          <EyebrowLabel tone="neutral">Explore by project type</EyebrowLabel>
          <div className="mt-7 flex flex-wrap gap-2" aria-label="Solar service categories">
            {services.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected === item.id}
                onClick={() => setSelected(item.id)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
                  selected === item.id
                    ? 'border-gold bg-gold text-canvas'
                    : 'border-line-strong text-muted hover:border-gold/70 hover:text-warm-white'
                }`}
              >
                {item.id === 'agricultural' ? 'Agricultural' : item.id === 'residential' ? 'Residential' : 'Commercial'}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={service.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className="mt-10 flex flex-1 flex-col">
              <span className="font-mono text-xs text-gold">0{services.indexOf(service) + 1} / 03</span>
              <h3 className="mt-4 text-display-md">{service.title}</h3>
              <p className="mt-5 max-w-prose text-base leading-7 text-muted">{service.short}</p>
              <p className="mt-4 max-w-prose text-sm leading-7 text-muted">{service.assessment}</p>
              <div className="mt-auto flex flex-wrap gap-3 pt-9">
                <PrimaryButton to={`${ROUTES.quote}?project=${service.id}`} size="sm">Request consultation</PrimaryButton>
                <SecondaryButton to={`${ROUTES.solarSolutions}#${service.id}`} size="sm" icon={ArrowRight}>Explore details</SecondaryButton>
                {whatsapp && <SecondaryButton href={whatsapp} target="_blank" rel="noopener noreferrer" size="sm">Discuss on WhatsApp</SecondaryButton>}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <div className="surface-card flex min-h-44 items-center gap-5 overflow-hidden p-5">
            <div className="size-28 shrink-0 overflow-hidden rounded-card-sm">
              <SolarPhoto photo={`home-${next.id}`} className="size-full object-cover" sizes="112px" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest text-gold-accent uppercase">Also explore</p>
              <h3 className="mt-2 text-title">{next.title}</h3>
              <button type="button" onClick={() => setSelected(next.id)} className="mt-3 text-sm font-semibold text-gold-accent hover:text-warm-white">
                View category <ArrowRight className="ml-1 inline size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <BentoCard icon={ScanSearch} title="Site-first planning" description="Space, shade, electricity use and project requirements shape the discussion before a quotation." />
        </div>
      </div>
    </Section>
  )
}

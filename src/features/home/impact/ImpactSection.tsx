import { ArrowLeft, ArrowRight, ClipboardCheck, FileSearch, MapPin, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { BentoCard } from '@/components/common/BentoCard'
import { IconButton } from '@/components/common/IconButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { SolarPhoto } from '@/components/solar/SolarPhoto'

const benefits = [
  { label: 'Clean Energy', title: 'Turn daylight into useful power.', text: 'Solar generates electricity without burning fuel at the point of generation. Equipment manufacturing and end-of-life impacts should also be considered.', visual: 'impact-clean' },
  { label: 'Bill Reduction Potential', title: 'Use the energy you generate.', text: 'Solar may offset electricity purchased from the grid. Any bill change depends on generation, daytime use, tariff and fixed charges; no reduction is guaranteed.', visual: 'impact-bills' },
  { label: 'Energy Independence', title: 'Know where some of your power comes from.', text: 'On-site solar can reduce reliance on grid energy while generating. Standard grid-tied systems do not automatically provide backup during an outage.', visual: 'impact-independence' },
  { label: 'Long-Term Value', title: 'Plan for the property, not just today.', text: 'The suitability and long-term value of a system depend on site conditions, equipment, use and upkeep; a review is needed before making projections.', visual: 'impact-value' },
  { label: 'Sustainable Future', title: 'A considered step forward.', text: 'A suitably planned solar system can contribute to cleaner energy use. Outcomes vary, and any project-specific environmental estimate needs verified inputs.', visual: 'impact-future' },
] as const

const trust = [
  { icon: FileSearch, title: 'Transparent process', description: 'Site requirements are reviewed before a quotation is prepared.' },
  { icon: ClipboardCheck, title: 'Equipment clarity', description: 'Discuss the proposed equipment and scope as part of system planning.' },
  { icon: ShieldCheck, title: 'Real project proof', description: 'Only customer-approved installation details belong in the public gallery.' },
  { icon: MapPin, title: 'Local support', description: 'Enquiries are welcomed across Kadapa, Mydukur and Proddatur.' },
] as const

export function ImpactSection() {
  const [index, setIndex] = useState(0)
  const touch = useRef<number | null>(null)
  const benefit = benefits[index]!
  const previous = () => setIndex((value) => Math.max(0, value - 1))
  const next = () => setIndex((value) => Math.min(benefits.length - 1, value + 1))
  return (
    <Section id="why-solar">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow="Why solar" title="A more thoughtful way to power what matters." description="The potential of solar is real. The result for your property still needs a site and usage assessment." />
        <div className="flex gap-2">
          <IconButton icon={ArrowLeft} label="Previous benefit" onClick={previous} disabled={index === 0} />
          <IconButton icon={ArrowRight} label="Next benefit" onClick={next} disabled={index === benefits.length - 1} />
        </div>
      </div>
      <div
        className="mt-10 grid overflow-hidden rounded-card border border-line bg-card lg:grid-cols-2"
        onTouchStart={(event) => { touch.current = event.touches[0]?.clientX ?? null }}
        onTouchEnd={(event) => {
          if (touch.current === null) return
          const delta = (event.changedTouches[0]?.clientX ?? touch.current) - touch.current
          if (Math.abs(delta) > 50) (delta < 0 ? next : previous)()
          touch.current = null
        }}
        aria-roledescription="carousel"
        aria-label="Why solar"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
              <SolarPhoto photo={benefit.visual} className="size-full object-cover" />
            </motion.div>
          </AnimatePresence>
          <span className="absolute bottom-4 left-4 rounded-full bg-canvas/80 px-3 py-1.5 text-xs text-warm-white">Reference photo</span>
        </div>
        <div className="flex flex-col justify-center p-7 md:p-12" aria-live="polite">
          <p className="text-xs font-semibold tracking-widest text-gold-accent uppercase">{benefit.label} · 0{index + 1}/0{benefits.length}</p>
          <h3 className="mt-5 text-display-md">{benefit.title}</h3>
          <p className="mt-5 max-w-prose text-base leading-8 text-muted">{benefit.text}</p>
          <div className="mt-9 flex gap-2" aria-label="Benefit position">
            {benefits.map((item, itemIndex) => (
              <span key={item.label} className={`h-1.5 rounded-full transition-all ${itemIndex === index ? 'w-8 bg-gold' : 'w-1.5 bg-muted/40'}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-16">
        <SectionHeading eyebrow="How we work" title="Trust begins with clarity." />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map((item) => <BentoCard key={item.title} {...item} />)}
        </div>
      </div>
    </Section>
  )
}

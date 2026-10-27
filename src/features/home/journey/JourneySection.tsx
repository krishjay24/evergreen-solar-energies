import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import { EyebrowLabel } from '@/components/common/EyebrowLabel'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { SolarPhoto } from '@/components/solar/SolarPhoto'
import { ROUTES } from '@/config/routes'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

const journey = [
  { title: 'Discover', text: 'Find out where solar might fit your property and electricity use.', visual: 'journey-discover', pageVisual: 'process-discover' },
  { title: 'Understand', text: 'Learn about solar equipment, site conditions and the questions worth asking.', visual: 'journey-understand', pageVisual: 'process-understand' },
  { title: 'Assess', text: 'Review your site before choosing a system approach or preparing a quotation.', visual: 'journey-assess', pageVisual: 'process-assess' },
  { title: 'Connect', text: 'Discuss a suitable next step with the Evergreen team.', visual: 'journey-connect', pageVisual: 'process-connect' },
] as const

const installation = [
  { title: 'Enquiry', detail: 'Tell us about your project and property.', photo: 'installation-enquiry' },
  { title: 'Site Review', detail: 'Assess space, shading, electrical needs and access.', photo: 'installation-review' },
  { title: 'System Proposal', detail: 'Discuss a site-specific approach and quotation.', photo: 'installation-proposal' },
  { title: 'Applicable Approvals', detail: 'Identify requirements that apply to the proposed project.', photo: 'installation-work' },
  { title: 'Installation and Commissioning', detail: 'Plan work and checks for the agreed installation.', photo: 'installation-commissioning' },
] as const

export function JourneySection({ page = false }: { page?: boolean }) {
  const timelineRef = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(() => {
    const timeline = timelineRef.current
    if (!timeline) return
    const steps = gsap.utils.toArray<HTMLElement>('[data-journey-step]', timeline)
    steps.forEach((step, index) => {
      ScrollTrigger.create({
        trigger: step, start: 'top 65%', end: 'bottom 35%',
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index),
      })
    })
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('[data-journey-progress]', { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: timeline, start: 'top 75%', end: 'bottom 55%', scrub: 0.5 },
      })
      steps.forEach((step) => {
        gsap.fromTo(step, { y: 24, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.55,
          scrollTrigger: { trigger: step, start: 'top 85%', once: true },
        })
      })
    })
    return () => media.revert()
  }, { scope: timelineRef })

  return (
    <Section id="how-it-works" tone="alt">
      <SectionHeading as={page ? 'h1' : 'h2'} eyebrow="Your solar journey" title="A clearer path, one step at a time." description="No scroll-jacking and no one-size-fits-all promise. Just an informed route from first question to site-specific discussion." />
      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <ol ref={timelineRef} className="relative space-y-8 border-l border-line-strong pl-8 md:pl-12">
          <span data-journey-progress className="absolute top-0 bottom-0 left-[-1px] w-0.5 origin-top bg-gold" aria-hidden="true" />
          {journey.map((step, index) => (
            <li key={step.title} data-journey-step className="relative min-h-32">
              <span className={`absolute top-1 -left-[2.55rem] grid size-5 place-items-center rounded-full border text-[0.5rem] md:-left-[3.55rem] ${active === index ? 'border-gold bg-gold text-canvas' : 'border-line-strong bg-canvas-alt text-muted'}`} aria-hidden="true">{index + 1}</span>
              <span className="font-mono text-xs text-gold">0{index + 1} / 04</span>
              <h3 className="mt-2 text-title">{step.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-7 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <figure className="relative aspect-[4/3] self-start overflow-hidden rounded-card border border-line lg:sticky lg:top-24">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
              <SolarPhoto photo={page ? journey[active]!.pageVisual : journey[active]!.visual} className="size-full object-cover" />
            </motion.div>
          </AnimatePresence>
          <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-canvas to-transparent px-6 pt-16 pb-6 text-sm text-warm-white">
            Reference photo · {journey[active]!.title}
          </figcaption>
        </figure>
      </div>
      <div className="mt-12 rounded-card border border-line bg-card p-6 md:p-10">
        <EyebrowLabel>Installation stages</EyebrowLabel>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {installation.map((step, index) => (
            <li key={step.title} className="border-t border-gold/40 pt-4">
              {page && <SolarPhoto photo={step.photo} className="mb-4 aspect-[4/3] w-full rounded-card-sm" sizes="(min-width: 1024px) 18vw, (min-width: 640px) 45vw, 90vw" />}
              <span className="font-mono text-xs text-gold-accent">0{index + 1}</span>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
      <PrimaryButton to={ROUTES.quote} className="mt-9">Start your assessment</PrimaryButton>
    </Section>
  )
}

import { useRef } from 'react'
import { EyebrowLabel } from '@/components/common/EyebrowLabel'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { Section } from '@/components/layout/Section'
import { ROUTES } from '@/config/routes'
import { gsap, useGSAP } from '@/lib/gsap'
import { AboutAccordion } from './AboutAccordion'
import { aboutCopy } from './aboutContent'
import { AboutVisual } from './AboutVisual'

export function AboutSection() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-about-line]',
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.9,
            stagger: 0.14,
            ease: 'power4.out',
            scrollTrigger: { trigger: '[data-about-heading]', start: 'top 85%', once: true },
          },
        )
        gsap.fromTo(
          '[data-about-reveal]',
          { y: 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.12,
            scrollTrigger: { trigger: scope.current, start: 'top 75%', once: true },
          },
        )
        gsap.fromTo(
          '[data-about-image]',
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.1,
            stagger: 0.16,
            ease: 'power3.inOut',
            scrollTrigger: { trigger: '[data-about-images]', start: 'top 80%', once: true },
          },
        )
      })
      return () => media.revert()
    },
    { scope },
  )

  return (
    <Section id="about-evergreen" tone="alt" containerClassName="relative">
      <div ref={scope}>
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
          <div data-about-reveal className="flex items-center gap-4 lg:pt-2">
            <EyebrowLabel>About Us</EyebrowLabel>
            <span className="h-px w-14 bg-gold/40" aria-hidden="true" />
            <span className="font-mono text-xs text-muted">01 / 04</span>
          </div>
          <div className="max-w-3xl">
            <h2
              data-about-heading
              aria-label={aboutCopy.heading}
              className="text-display-md leading-[1.08] font-medium tracking-[-0.04em] lg:text-display-lg"
            >
              {aboutCopy.lines.map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.1em]" aria-hidden="true">
                  <span data-about-line className={index === 2 ? 'inline-block text-gold-accent' : 'inline-block'}>
                    {line}
                  </span>
                </span>
              ))}
            </h2>
            <div className="mt-7 space-y-3 text-base leading-7 text-muted md:mt-9 md:text-[1.0625rem]">
              {aboutCopy.description.map((paragraph) => (
                <p data-about-reveal key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div data-about-reveal className="mt-8">
              <PrimaryButton to={ROUTES.about}>Learn More</PrimaryButton>
            </div>
          </div>
        </div>

        <div className="mt-16 grid items-start gap-12 md:mt-20 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
          <div data-about-reveal className="lg:pt-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="size-1.5 rounded-full bg-gold" aria-hidden="true" />
              <p className="text-eyebrow font-semibold text-gold-accent uppercase">What matters to us</p>
            </div>
            <AboutAccordion />
          </div>
          <div data-about-images>
            <AboutVisual />
          </div>
        </div>
      </div>
    </Section>
  )
}

// TEMPORARY internal design-system preview. Registered only in development (see app/router.tsx).
import { ArrowRight, BatteryCharging, Leaf, Menu, Phone, Sun, X, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { BentoCard } from '@/components/common/BentoCard'
import { CTASection } from '@/components/common/CTASection'
import { EyebrowLabel } from '@/components/common/EyebrowLabel'
import { IconButton } from '@/components/common/IconButton'
import { ImageCard } from '@/components/common/ImageCard'
import { Logo } from '@/components/common/Logo'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { SectionDivider } from '@/components/layout/SectionDivider'
import { brandColors, brandLogo } from '@/config/brand'
import { ROUTES } from '@/config/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const swatches = [
  ['Primary Background', 'canvas', 'bg-canvas'],
  ['Secondary Background', 'canvasAlt', 'bg-canvas-alt'],
  ['Card Background', 'card', 'bg-card'],
  ['Evergreen Green', 'evergreen', 'bg-evergreen'],
  ['Solar Gold', 'gold', 'bg-gold'],
  ['Accent Gold', 'goldAccent', 'bg-gold-accent'],
  ['Warm White', 'warmWhite', 'bg-warm-white'],
  ['Muted Text', 'muted', 'bg-muted'],
  ['Solar Blue', 'solarBlue', 'bg-solar-blue'],
] as const satisfies readonly (readonly [string, keyof typeof brandColors, string])[]

const typeScale = [
  ['text-display-xl', 'Display XL'],
  ['text-display-lg', 'Display LG'],
  ['text-display-md', 'Display MD'],
  ['text-title', 'Title'],
  ['text-lead', 'Lead paragraph'],
  ['text-base', 'Body text'],
] as const

const sampleImage = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${brandColors.solarBlue}"/><stop offset="0.6" stop-color="${brandColors.evergreen}"/><stop offset="1" stop-color="${brandColors.canvas}"/></linearGradient></defs><rect width="800" height="1000" fill="url(#g)"/><circle cx="560" cy="260" r="110" fill="${brandColors.goldAccent}" opacity="0.85"/></svg>`,
)}`

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-eyebrow font-semibold text-muted uppercase">{title}</h2>
      {children}
    </div>
  )
}

export default function StyleGuidePage() {
  useDocumentTitle('Style guide (internal)')

  return (
    <>
      <Section spacing="compact" containerClassName="flex flex-col gap-20">
        <SectionHeading
          as="h1"
          size="lg"
          eyebrow="Internal · Temporary"
          title={
            <>
              Evergreen <span className="text-gradient-gold">design system</span>
            </>
          }
          description="Colours, typography, buttons, cards and logo usage. Development-only preview; not included in production builds."
        />

        <Block title="Logo">
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="surface-card grid place-items-center p-10">
              <Logo size="xl" priority />
            </div>
            <div className="grid gap-6">
              <div className="surface-card flex items-center justify-center gap-6 p-8">
                <Logo size="sm" />
                <Logo size="md" />
              </div>
              <div className="surface-card flex flex-col gap-3 p-6 text-sm text-muted">
                <p className="font-semibold text-warm-white">Supplied logo artwork</p>
                <img
                  src={brandLogo.original}
                  alt={brandLogo.alt}
                  width={brandLogo.width}
                  height={brandLogo.height}
                  className="h-auto w-full"
                />
                <p>Use the supplied artwork as-is. Responsive WebP copies preserve its colours, lettering and background without additional masks or effects.</p>
              </div>
            </div>
          </div>
        </Block>

        <Block title="Colours">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {swatches.map(([name, key, className]) => (
              <li key={key} className="surface-card overflow-hidden">
                <div className={`h-24 border-b border-line ${className}`} />
                <div className="p-4">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="font-mono text-xs text-muted">{brandColors[key]}</p>
                </div>
              </li>
            ))}
          </ul>
        </Block>

        <Block title="Typography · Manrope">
          <div className="flex flex-col divide-y divide-line">
            {typeScale.map(([className, label]) => (
              <div key={className} className="grid gap-2 py-6 md:grid-cols-[10rem_1fr] md:items-baseline">
                <code className="text-xs text-muted">{className}</code>
                <p className={`${className} ${className.startsWith('text-display') || className === 'text-title' ? 'font-semibold' : 'text-muted'}`}>
                  {className.startsWith('text-display') ? 'Powered by the Sun.' : `${label} — clean solar energy for homes across Kadapa, Mydukur and Proddatur.`}
                </p>
              </div>
            ))}
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton to={ROUTES.home}>Get a free quote</PrimaryButton>
            <PrimaryButton size="lg" to={ROUTES.home}>
              Book site survey
            </PrimaryButton>
            <PrimaryButton icon={null}>No icon</PrimaryButton>
            <SecondaryButton icon={ArrowRight}>Explore projects</SecondaryButton>
            <SecondaryButton size="lg" icon={Phone} href="tel:+910000000000">
              Call us
            </SecondaryButton>
            <PrimaryButton disabled>Disabled</PrimaryButton>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <IconButton icon={Menu} label="Open menu" variant="outline" />
            <IconButton icon={X} label="Close" variant="ghost" />
            <IconButton icon={ArrowRight} label="Next" variant="solid" />
            <IconButton icon={Sun} label="Small" size="sm" />
            <IconButton icon={Sun} label="Large" size="lg" />
          </div>
        </Block>

        <Block title="Labels">
          <div className="flex flex-wrap gap-3">
            <EyebrowLabel>Solar installation</EyebrowLabel>
            <EyebrowLabel tone="neutral">Kadapa · Mydukur · Proddatur</EyebrowLabel>
            <EyebrowLabel tone="blue">Grid-tied systems</EyebrowLabel>
          </div>
        </Block>

        <Block title="Bento cards">
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            <BentoCard
              padding="lg"
              tone="evergreen"
              icon={Sun}
              title="Rooftop solar for homes"
              description="Design, supply and installation tailored to your roof and consumption."
              className="md:col-span-2"
              interactive
            />
            <BentoCard tone="gold" icon={Zap} title="Gold card" description="Sample copy for a highlighted feature." />
            <BentoCard icon={BatteryCharging} title="Battery backup" description="Hybrid systems for uninterrupted power." interactive />
            <BentoCard tone="outline" icon={Leaf} title="Lower carbon" description="Cleaner energy, rooted in nature." interactive />
            <BentoCard className="justify-end">
              <p className="text-display-md font-semibold text-gradient-gold">00+</p>
              <p className="text-muted">Sample metric card</p>
            </BentoCard>
          </div>
        </Block>

        <Block title="Image cards">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ImageCard src={sampleImage} alt="Sample gradient" eyebrow="Kadapa" title="5 kW residential rooftop" caption="Grid-tied · 2025" />
            <ImageCard src={sampleImage} alt="Sample gradient" aspect="square" title="Commercial array" />
            <ImageCard src={sampleImage} alt="Sample gradient" aspect="video" className="sm:col-span-2 lg:col-span-1" />
          </div>
        </Block>
      </Section>

      <SectionDivider />

      <CTASection
        eyebrow="Start today"
        title="Ready to harness the sun?"
        description="Get a free site assessment and a tailored solar proposal."
        primaryAction={{ label: 'Get a free quote', to: ROUTES.home }}
        secondaryAction={{ label: 'Call us', href: 'tel:+910000000000' }}
      />
    </>
  )
}

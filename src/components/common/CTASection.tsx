import type { ReactNode } from 'react'
import { Section } from '@/components/layout/Section'
import type { ActionProps } from './Action'
import { PrimaryButton } from './PrimaryButton'
import { SecondaryButton } from './SecondaryButton'
import { SectionHeading } from './SectionHeading'

type CTAAction = { label: string } & ({ to: string; href?: never } | { href: string; to?: never })

interface CTASectionProps {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  primaryAction: CTAAction
  secondaryAction?: CTAAction
  id?: string
}

const actionProps = ({ to, href }: CTAAction): ActionProps => (to !== undefined ? { to } : { href })

export function CTASection({ title, eyebrow, description, primaryAction, secondaryAction, id }: CTASectionProps) {
  return (
    <Section {...(id ? { id } : {})}>
      <div className="relative isolate overflow-hidden rounded-[2rem] border border-gold/20 bg-evergreen px-6 py-16 md:px-16 md:py-24">
        <div
          className="absolute -top-1/2 left-1/2 -z-10 aspect-square w-[70rem] max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(217_182_91/0.22),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-transparent to-canvas/60" aria-hidden="true" />
        <SectionHeading
          align="center"
          size="lg"
          title={title}
          {...(eyebrow ? { eyebrow } : {})}
          {...(description ? { description } : {})}
          actions={
            <>
              <PrimaryButton size="lg" {...actionProps(primaryAction)}>
                {primaryAction.label}
              </PrimaryButton>
              {secondaryAction && (
                <SecondaryButton size="lg" {...actionProps(secondaryAction)}>
                  {secondaryAction.label}
                </SecondaryButton>
              )}
            </>
          }
        />
      </div>
    </Section>
  )
}

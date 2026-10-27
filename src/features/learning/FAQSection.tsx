import { Plus } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useState } from 'react'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { ROUTES } from '@/config/routes'
import { faqs } from '@/data/faqs'

export function FAQSection({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(0)
  const prefix = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  return (
    <Section id="faq" tone="alt" containerClassName="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
      <div>
        <SectionHeading eyebrow="FAQs" title="Good questions deserve clear answers." description="General information is a starting point. Your site and the applicable rules determine the details." />
        <PrimaryButton to={ROUTES.contact} className="mt-8">Ask a question</PrimaryButton>
      </div>
      <div className="divide-y divide-line border-y border-line">
        {faqs.slice(0, compact ? 5 : undefined).map((faq, index) => {
          const expanded = open === index
          const trigger = `${prefix}-question-${index}`
          const panel = `${prefix}-answer-${index}`
          return (
            <div key={faq.question}>
              <h3>
                <button id={trigger} type="button" aria-controls={panel} aria-expanded={expanded} onClick={() => setOpen(expanded ? null : index)} className="flex min-h-17 w-full items-center gap-4 py-4 text-left text-base font-semibold text-warm-white hover:text-gold-accent">
                  <span className="flex-1">{faq.question}</span>
                  <Plus className={`icon-md shrink-0 transition-transform duration-300 ${expanded ? 'rotate-45 text-gold' : 'text-muted'}`} aria-hidden="true" />
                </button>
              </h3>
              <motion.div id={panel} role="region" aria-labelledby={trigger} aria-hidden={!expanded} inert={!expanded} initial={false} animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }} transition={reduce ? { duration: 0 } : { duration: 0.35 }} className="overflow-hidden">
                <p className="max-w-prose pb-5 text-sm leading-7 text-muted">{faq.answer}</p>
              </motion.div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

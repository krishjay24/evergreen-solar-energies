import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { SolarFitForm } from '@/features/enquiries/SolarFitForm'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function QuotePage() {
  useDocumentTitle('Solar Fit Assessment')
  return (
    <Section tone="alt" container="narrow">
      <SectionHeading as="h1" size="lg" eyebrow="Request a quote" title="Let's find the right solar fit." description="Share what you know about the property. A site review is needed before a quotation can be prepared." />
      <div className="mt-10"><SolarFitForm /></div>
      <aside className="surface-card mt-6 p-5 sm:p-8" aria-labelledby="solar-fit-checklist">
        <h2 id="solar-fit-checklist" className="text-title">Prepare for your site review</h2>
        <p className="mt-3 text-sm leading-7 text-muted">Have these ready if available. They help the discussion and are not all required to submit an enquiry.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted">
          <li>Recent electricity bill.</li>
          <li>Project address or location.</li>
          <li>Roof or land photographs.</li>
          <li>Approximate available space.</li>
          <li>Ownership or permission information.</li>
          <li>Major electrical loads, if known.</li>
        </ul>
      </aside>
    </Section>
  )
}

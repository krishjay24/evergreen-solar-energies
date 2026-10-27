import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function TermsPage() {
  useDocumentTitle('Terms')
  return (
    <Section container="narrow">
      <SectionHeading as="h1" eyebrow="Terms" title="Website Terms" description="General information, not an engineering assessment or a quotation." />
      <div className="mt-10 space-y-8 text-sm leading-8 text-muted">
        <section><h2 className="text-title">Educational information</h2><p className="mt-2">Website content describes general solar concepts. It is not project-specific electrical, structural, legal or financial advice.</p></section>
        <section><h2 className="text-title">Project suitability</h2><p className="mt-2">Price based on site inspection and quotation. System size, pricing, approvals, subsidies, generation and savings depend on the actual site assessment and applicable requirements. No outcome is guaranteed by a website enquiry.</p></section>
        <section><h2 className="text-title">Illustrations and projects</h2><p className="mt-2">Concept illustrations show possible solar applications, not completed Evergreen installations. The project gallery publishes only verified installations approved by the customer.</p></section>
        <section><h2 className="text-title">Availability</h2><p className="mt-2">Features requiring external services may be unavailable until those services are configured. Do not assume an enquiry was received unless the website displays a confirmation from the submission destination.</p></section>
      </div>
    </Section>
  )
}

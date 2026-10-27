import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { siteConfig } from '@/config/site'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function PrivacyPage() {
  useDocumentTitle('Privacy Policy')
  return (
    <Section container="narrow">
      <SectionHeading as="h1" eyebrow="Privacy" title="Privacy Policy" description="A plain-language description of the information requested by this website." />
      <div className="mt-10 space-y-8 text-sm leading-8 text-muted">
        <section><h2 className="text-title">Information you choose to share</h2><p className="mt-2">Contact and Solar Fit forms may request your name, phone number, project details, site location and optional site photos. Do not submit financial identity documents or information unnecessary for a site discussion.</p></section>
        <section><h2 className="text-title">Enquiry submission</h2><p className="mt-2">Online submissions are unavailable unless a secure server-side destination is configured. When unavailable, form details are not sent to Evergreen. When enabled, the form must display a confirmed receipt from its destination before showing success. Please ask us directly for information on the service provider, retention period and removal process before sharing sensitive material.</p></section>
        <section><h2 className="text-title">External links</h2><p className="mt-2">Telephone, email, maps and any configured WhatsApp links open services governed by their respective privacy policies. External services may collect information independently.</p></section>
        <section><h2 className="text-title">Website measurement</h2><p className="mt-2">Analytics is disabled by default. An optional integration can receive page views, call and WhatsApp clicks, and online enquiries confirmed by the submission service. These events contain only a known website route, event name and enquiry channel. Form values, photograph contents, contact details, receipt identifiers and URL query strings are excluded. Opening WhatsApp is not recorded as a delivered enquiry. The integration respects Do Not Track and Global Privacy Control. Any external analytics provider and its retention terms must be reviewed and disclosed before it is enabled.</p></section>
        <section><h2 className="text-title">Your questions</h2><p className="mt-2">For access, correction or removal questions, contact <a className="text-gold-accent underline" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>. A fuller policy must be reviewed with the final hosting and submission providers before publication.</p></section>
      </div>
    </Section>
  )
}

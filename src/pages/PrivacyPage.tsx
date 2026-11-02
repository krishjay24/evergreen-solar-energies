import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { siteConfig } from '@/config/site'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { openAnalyticsPreferences } from '@/lib/ga4'

export default function PrivacyPage() {
  useDocumentTitle('Privacy Policy')
  return (
    <Section container="narrow">
      <SectionHeading as="h1" eyebrow="Privacy" title="Privacy Policy" description="A plain-language description of the information requested by this website." />
      <div className="mt-10 space-y-8 text-sm leading-8 text-muted">
        <section><h2 className="text-title">Information you choose to share</h2><p className="mt-2">Contact and Solar Fit forms may request your name, phone number, project details, site location and optional site photos. Do not submit financial identity documents or information unnecessary for a site discussion.</p></section>
        <section><h2 className="text-title">Enquiry submission</h2><p className="mt-2">Online submissions are unavailable unless a secure server-side destination is configured. When unavailable, form details are not sent to Evergreen. When enabled, the form must display a confirmed receipt from its destination before showing success. Please ask us directly for information on the service provider, retention period and removal process before sharing sensitive material.</p></section>
        <section><h2 className="text-title">External links</h2><p className="mt-2">Telephone, email, maps and any configured WhatsApp links open services governed by their respective privacy policies. External services may collect information independently.</p></section>
        <section>
          <h2 className="text-title">Optional Google Analytics 4</h2>
          <p className="mt-2">We use Google Analytics 4 (measurement ID G-9JE3R1SM3F) on the production website only if you choose to allow analytics. Until then, the Google tag is not loaded. Google may set first-party analytics cookies such as _ga and process device, browser and network information under its own privacy terms. We send page views and selected link clicks (WhatsApp, telephone, site-visit and quotation requests). A lead event is sent only when an online enquiry service confirms receipt; clicking a button or opening WhatsApp does not count as a submitted enquiry.</p>
          <p className="mt-2">Our analytics events contain a known page path, event type and, for a confirmed enquiry, whether it came from the contact or Solar Fit form. We do not send names, phone numbers, email addresses, messages, photos, receipt IDs or URL query strings to GA4. We respect browser Do Not Track and Global Privacy Control signals. You can decline or withdraw consent at any time; withdrawing disables tracking and removes GA cookies set on this site. Google may already have processed data sent while consent was active. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold-accent underline">Google's privacy policy</a> for Google's practices.</p>
          <button type="button" onClick={openAnalyticsPreferences} className="btn-secondary mt-4">Manage analytics preferences</button>
        </section>
        <section><h2 className="text-title">Your questions</h2><p className="mt-2">For access, correction or removal questions, contact <a className="text-gold-accent underline" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>. A fuller policy must be reviewed with the final hosting and submission providers before publication.</p></section>
      </div>
    </Section>
  )
}

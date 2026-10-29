import { siteConfig } from '@/config/site'
import { contactEnquiryMessage, solarAssessmentMessage, whatsappMessageUrl, type ContactWhatsAppDetails, type SolarWhatsAppDetails } from './whatsappEnquiries'

export const phoneHref = (phone: string) => `tel:+91${phone.replace(/\D/g, '').replace(/^91/, '')}`
export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.contact.mapsQuery)}`
export const mapsEmbedHref = `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.contact.mapsQuery)}&output=embed`

export type WhatsAppTopic = 'general' | 'residential' | 'commercial' | 'agricultural' | 'siteVisit' | 'quotation' | 'fencing' | 'heroQuotation'

const messages: Record<WhatsAppTopic, string> = {
  heroQuotation: "Hello Evergreen Solar Energies! \u2600\ufe0f\n\nI'm interested in installing a solar system for my home/business.\n\nPlease share the available solar options, approximate pricing, and applicable government subsidy information.\n\nI'd like to request a quotation and arrange a site assessment.\n\nThank you! \ud83c\udf3f",
  fencing: 'Hello Evergreen Solar Energies! I am interested in solar-powered electric fencing for my farmland. Please share fencing options and arrange a site inspection and customized quotation based on my farm boundaries and applicable safety requirements.',
  general: 'Hello Evergreen Solar Energies, I would like to know more about your solar installation services.',
  residential: 'Hello Evergreen Solar Energies, I would like to discuss residential rooftop solar.',
  commercial: 'Hello Evergreen Solar Energies, I would like to discuss commercial solar.',
  agricultural: 'Hello Evergreen Solar Energies, I have an agricultural or ground-mounted solar enquiry.',
  siteVisit: 'Hello Evergreen Solar Energies, I would like to request a site visit.',
  quotation: 'Hello Evergreen Solar Energies, I would like to request a quotation after a site review.',
}

/** Use the confirmed company number; reject invalid configuration overrides. */
export function whatsappHref(topic: WhatsAppTopic): string | null {
  return whatsappMessageUrl(siteConfig.contact.whatsapp, messages[topic])
}

export function contactEnquiryWhatsAppHref(data: ContactWhatsAppDetails): string | null {
  return data.consent === true ? whatsappMessageUrl(siteConfig.contact.whatsapp, contactEnquiryMessage(siteConfig.name, data)) : null
}

export function solarAssessmentWhatsAppHref(data: SolarWhatsAppDetails): string | null {
  return data.consent === true ? whatsappMessageUrl(siteConfig.contact.whatsapp, solarAssessmentMessage(siteConfig.name, data)) : null
}

import { siteConfig } from '@/config/site'
import { contactEnquiryMessage, solarAssessmentMessage, whatsappMessageUrl, type ContactWhatsAppDetails, type SolarWhatsAppDetails } from './whatsappEnquiries'

export const phoneHref = (phone: string) => `tel:+91${phone.replace(/\D/g, '').replace(/^91/, '')}`
export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.contact.mapsQuery)}`
export const mapsEmbedHref = `https://www.google.com/maps?q=${encodeURIComponent(siteConfig.contact.mapsQuery)}&output=embed`

export type WhatsAppTopic = 'general' | 'residential' | 'commercial' | 'agricultural' | 'siteVisit' | 'quotation'

const messages: Record<WhatsAppTopic, string> = {
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

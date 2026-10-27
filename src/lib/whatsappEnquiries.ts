type Project = 'residential' | 'commercial' | 'agricultural' | 'other'

interface CustomerDetails {
  name: string
  phone: string
  project: Project
  location: string
  consent: boolean
}

export interface ContactWhatsAppDetails extends CustomerDetails {
  email?: string
  message: string
}

export interface SolarWhatsAppDetails extends CustomerDetails {
  preferredContact: 'phone' | 'whatsapp'
  space?: string
  usage?: string
  phaseLoad?: string
  information?: string
  requestSiteVisit: boolean
}

const projects: Record<Project, string> = {
  residential: 'Residential Rooftop',
  commercial: 'Commercial Solar',
  agricultural: 'Agricultural / Ground-Mounted',
  other: 'Other',
}

/** Universal click-to-chat URL; no data is sent until the user confirms in WhatsApp. */
export function whatsappMessageUrl(number: string, message: string): string | null {
  const digits = number.replace(/\D/g, '')
  const international = /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : digits
  if (!/^91[6-9]\d{9}$/.test(international)) return null
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`
}

export function contactEnquiryMessage(company: string, data: ContactWhatsAppDetails): string {
  return [
    `*${company}*`,
    '*Contact Enquiry*',
    '',
    `Customer name: ${data.name.trim()}`,
    `Phone number: ${data.phone.trim()}`,
    ...(data.email?.trim() ? [`Email: ${data.email.trim()}`] : []),
    `Project / service: ${projects[data.project]}`,
    `Location: ${data.location.trim()}`,
    '',
    '*Customer message*',
    data.message.trim(),
    '',
    'Source: Website Contact Form',
  ].join('\n')
}

export function solarAssessmentMessage(company: string, data: SolarWhatsAppDetails): string {
  const site = data.space?.trim() ? [`Available roof / land area: ${data.space.trim()}`] : []
  const usage = [
    ...(data.usage?.trim() ? [`Monthly bill / units: ${data.usage.trim()}`] : []),
    ...(data.phaseLoad?.trim() ? [`Phase / load: ${data.phaseLoad.trim()}`] : []),
  ]
  return [
    `*${company}*`,
    '*Solar Fit Assessment*',
    '',
    '*Customer Details*',
    `Name: ${data.name.trim()}`,
    `Phone / WhatsApp: ${data.phone.trim()}`,
    `Preferred contact method: ${data.preferredContact === 'whatsapp' ? 'WhatsApp' : 'Phone call'}`,
    '',
    '*Project Details*',
    projects[data.project],
    '',
    '*Site Details*',
    `Project location: ${data.location.trim()}`,
    ...site,
    ...(usage.length ? ['', '*Electricity Usage*', ...usage] : []),
    ...(data.information?.trim() ? ['', '*Additional information*', data.information.trim()] : []),
    '',
    '*Next Step*',
    `Site visit requested: ${data.requestSiteVisit ? 'Yes' : 'No'}`,
    'Please contact me regarding a solar site assessment.',
    '',
    'Source: Website Solar Fit Assessment',
  ].join('\n')
}

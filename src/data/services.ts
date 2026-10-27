export type ServiceId = 'residential' | 'commercial' | 'agricultural'

export interface SolarService {
  id: ServiceId
  title: string
  short: string
  suitable: string
  site: string
  process: string
  assessment: string
  faq: readonly { question: string; answer: string }[]
}

export const services: readonly SolarService[] = [
  {
    id: 'residential',
    title: 'Residential Rooftop Solar',
    short: 'Explore a rooftop system planned around your home, roof and electricity use.',
    suitable: 'For homeowners exploring a solar installation on an available rooftop.',
    site: 'Roof condition, usable area, orientation, shading and electrical connection need review.',
    process: 'Enquire, review the site and usage, receive a system proposal, check applicable approvals, then plan installation and commissioning.',
    assessment: 'The design and quotation depend on actual roof and electricity requirements, not a standard package.',
    faq: [{ question: 'Will every roof work?', answer: 'Not necessarily. Structure, available space, shading and electrical needs must be checked on site.' }],
  },
  {
    id: 'commercial',
    title: 'Commercial Solar',
    short: 'Assess solar opportunities for your business premises and operating load.',
    suitable: 'For businesses with suitable roof or site space and a demand profile to review.',
    site: 'Available area, structural suitability, operating hours, electrical load and site access matter.',
    process: 'A site and usage review informs the proposal, equipment coordination and installation plan.',
    assessment: 'The proposed system and any approvals depend on the property and applicable requirements.',
    faq: [{ question: 'Can a business receive a quotation without a site review?', answer: 'An accurate quotation needs the property, load and installation requirements to be reviewed.' }],
  },
  {
    id: 'agricultural',
    title: 'Agricultural / Ground-Mounted Enquiries',
    short: 'Discuss site-specific solar possibilities for agricultural or open-land settings.',
    suitable: 'For enquiries involving agricultural sites or potential ground-mounted installations.',
    site: 'Land availability, shading, access, load, connection and applicable rules require assessment.',
    process: 'Begin with an enquiry, then review site constraints, the proposed use and the relevant approval pathway.',
    assessment: 'Feasibility is not assumed; suitability and project scope must be confirmed before quotation.',
    faq: [{ question: 'Is any open plot suitable?', answer: 'No. Site conditions, connection options and applicable requirements must first be evaluated.' }],
  },
]

export const getService = (id: string) => services.find((service) => service.id === id)

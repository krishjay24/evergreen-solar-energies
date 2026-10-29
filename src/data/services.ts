export type ServiceId = 'residential' | 'commercial' | 'agricultural' | 'fencing'

export interface SolarService {
  id: ServiceId
  title: string
  short: string
  suitable: string
  site: string
  process: string
  assessment: string
  highlights?: readonly string[]
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
  {
    id: 'fencing',
    title: 'Agricultre fencing',
    short: 'Help protect your farmland and crops with solar-powered electric fencing designed to deter animal intrusion. Our solutions are planned according to farm boundaries, site conditions and applicable electrical safety requirements. Contact Evergreen Solar Energies for a site assessment and customized quotation.',
    suitable: 'Farm and crop boundary applications requiring an animal-intrusion deterrent.',
    site: 'Farm boundaries, terrain, vegetation, access, public paths, nearby electrical infrastructure and earthing conditions need assessment.',
    process: 'A solar panel supplies a fence energizer, with a battery where applicable. The energizer delivers controlled electrical pulses through fence wires mounted on insulators and fence posts, with an appropriate earthing system.',
    assessment: 'Site-specific planning and installation include equipment selection, safety signage and maintenance guidance. Energizers must meet applicable BIS IS 302-2-76 requirements; local electrical safety and any forest or wildlife permissions must be checked before installation.',
    highlights: ['Solar-powered fence energizer', 'Controlled pulsed electric deterrent', 'Farm and crop boundary applications', 'Site-specific planning and installation', 'Safety signage and maintenance guidance'],
    faq: [{ question: 'What safety precautions are needed?', answer: 'Electric fencing can cause injury and requires professional planning, suitable equipment, warning signs and regular maintenance. Never connect fence wires directly to mains electricity. Deterrence is not guaranteed, and subsidy eligibility is not assumed.' }],
  },
]

export const getService = (id: string) => services.find((service) => service.id === id)

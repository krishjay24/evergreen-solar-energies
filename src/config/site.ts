import type { SiteConfig } from '@/types'
import { ROUTES } from './routes'

const env = import.meta.env

export const siteConfig = {
  name: 'EVERGREEN SOLAR ENERGIES',
  shortName: 'Evergreen Solar',
  tagline: 'Rooted in Nature. Powered by the Sun.',
  description:
    'Evergreen Solar Energies helps customers explore solar through site assessment, system planning, equipment coordination and installation support across Kadapa, Mydukur and Proddatur.',
  url: env.VITE_SITE_URL ?? '',
  locale: 'en-IN',
  serviceAreas: [
    { name: 'Kadapa', district: 'YSR Kadapa', state: 'Andhra Pradesh' },
    { name: 'Mydukur', district: 'YSR Kadapa', state: 'Andhra Pradesh' },
    { name: 'Proddatur', district: 'YSR Kadapa', state: 'Andhra Pradesh' },
  ],
  contact: {
    phone: '6300182036',
    phones: ['6300182036', '9703864664'],
    email: 'evergreensolarenergies@gmail.com',
    whatsapp: env.VITE_CONTACT_WHATSAPP || '916300182036',
    address: '45/134-1-1-1, Balaji Nagar, Opposite Ganga Bhavani School, Behind Mahesh Smart, Kadapa.',
    mapsQuery: '45/134-1-1-1, Balaji Nagar, Opposite Ganga Bhavani School, Behind Mahesh Smart, Kadapa, Andhra Pradesh',
  },
  navigation: [
    { label: 'Home', to: ROUTES.home },
    { label: 'Solar Solutions', to: ROUTES.solarSolutions },
    { label: 'How It Works', to: ROUTES.howItWorks },
    { label: 'Projects', to: ROUTES.projects },
    { label: 'About', to: ROUTES.about },
    { label: 'Contact', to: ROUTES.contact },
  ],
  primaryCta: { label: 'Request a Site Visit', to: ROUTES.siteVisit },
} as const satisfies SiteConfig

export const serviceAreaNames = siteConfig.serviceAreas.map((area) => area.name)

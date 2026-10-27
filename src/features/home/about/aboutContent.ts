import { CircleHelp, PanelsTopLeft, ScanSearch } from 'lucide-react'

export const aboutCopy = {
  heading: 'A Brighter Future Begins with Smarter Energy.',
  lines: ['A Brighter Future', 'Begins with', 'Smarter Energy.'],
  description: [
    'Evergreen Solar Energies helps customers explore solar power through site assessment, system planning, equipment coordination and installation support.',
    'The company serves enquiries across Kadapa, Mydukur and Proddatur.',
    'Each project is reviewed according to site requirements before a quotation is prepared.',
  ],
} as const

export const aboutTopics = [
  {
    title: 'The Challenge',
    icon: CircleHelp,
    description:
      'Every property has its own space, shading and electricity needs. A useful solar recommendation starts by understanding the site rather than applying a one-size-fits-all package.',
  },
  {
    title: 'Our Approach',
    icon: ScanSearch,
    description:
      'We review the property and usage, plan a suitable system, coordinate equipment and support installation. Site requirements are considered before a quotation is prepared.',
  },
  {
    title: 'Solar Technology',
    icon: PanelsTopLeft,
    description:
      'Solar panels convert daylight into DC electricity. An inverter converts it to usable AC power; the right layout and equipment depend on the property and its electrical needs.',
  },
] as const

export const ROUTES = {
  home: '/',
  solarSolutions: '/solar-solutions',
  howItWorks: '/#how-it-works',
  journey: '/how-it-works',
  projects: '/projects',
  learning: '/learning-hub',
  about: '/about',
  contact: '/contact',
  siteVisit: '/contact#site-visit',
  quote: '/request-quote',
  privacy: '/privacy-policy',
  terms: '/terms',
  /** Development-only internal design-system preview. */
  styleGuide: '/__styleguide',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

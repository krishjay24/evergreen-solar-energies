import { siteConfig } from '@/config/site'
import { ROUTES } from '@/config/routes'
import { articles, getArticle } from '@/data/learning'
import { publishedProjects } from '@/data/projects'
import { services } from '@/data/services'
import { articlePhotos } from '@/data/photography'

const pages: Record<string, { title: string; description: string; label: string; photo: string }> = {
  [ROUTES.home]: { title: 'Solar Services in Kadapa, Mydukur & Proddatur | Evergreen Solar Energies', description: siteConfig.description, label: 'Make the Sun Work for You.', photo: 'home-residential' },
  [ROUTES.about]: { title: 'About Evergreen Solar Energies | Solar Planning in Kadapa', description: 'Meet Evergreen Solar Energies: site assessment, system planning, equipment coordination and installation support in Kadapa, Mydukur and Proddatur, Andhra Pradesh.', label: 'About Evergreen', photo: 'home-about-team' },
  [ROUTES.solarSolutions]: { title: 'Residential, Commercial & Ground-Mounted Solar | Evergreen', description: 'Explore residential rooftop, commercial and agricultural / ground-mounted solar enquiries in Kadapa, Mydukur and Proddatur. Suitability starts with a site review.', label: 'Solar Solutions', photo: 'solutions-commercial' },
  [ROUTES.journey]: { title: 'Solar Site Review & Installation Process | Evergreen Solar', description: 'Discover, understand, assess and connect. Learn how enquiry, site review, proposal, applicable approvals and installation guide a considered solar project.', label: 'How It Works', photo: 'journey-assess' },
  [ROUTES.projects]: { title: 'Approved Solar Project Stories | Evergreen Solar Energies', description: 'Evergreen Solar Energies publishes only genuine, customer-approved project stories. Verified installation photographs and details are awaiting approval.', label: 'Project Stories', photo: 'impact-clean' },
  [ROUTES.learning]: { title: 'Solar Learning Hub | Rooftop Solar Guides from Evergreen', description: 'Simple guides to rooftop solar, site preparation, equipment, electricity bills and maintenance. Confirm current requirements for your project and local DISCOM.', label: 'Solar Learning Hub', photo: 'learn-basics' },
  [ROUTES.contact]: { title: 'Contact Evergreen Solar Energies | Kadapa Site Visit Enquiries', description: 'Request a solar site visit in Kadapa, Mydukur or Proddatur. Contact Evergreen Solar Energies to discuss your property, electricity usage and project needs.', label: 'Contact Evergreen', photo: 'contact-assessment' },
  [ROUTES.quote]: { title: 'Solar Fit Assessment | Site-Specific Enquiry | Evergreen', description: 'Complete the five-step Solar Fit Assessment for your residential, commercial or agricultural site. Price based on site inspection and quotation.', label: 'Solar Fit Assessment', photo: 'journey-assess' },
  [ROUTES.privacy]: { title: 'Privacy Policy | Evergreen Solar Energies', description: 'How Evergreen Solar Energies treats enquiry details, optional site photographs, external services and privacy-conscious website measurement.', label: 'Privacy Policy', photo: 'home-residential' },
  [ROUTES.terms]: { title: 'Website Terms & Quotation Policy | Evergreen Solar Energies', description: 'Read the Evergreen Solar Energies website terms, educational guidance and site-specific quotation policy. Project requirements and eligibility vary.', label: 'Website Terms', photo: 'home-residential' },
}

export function productionOrigin(value = siteConfig.url): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/' || /^(localhost|127\.|0\.|\[::1\])/.test(url.hostname)) return null
    return url.origin
  } catch { return null }
}

export const publicPaths = [...Object.keys(pages), ...articles.map(article => `${ROUTES.learning}/${article.slug}`), ...publishedProjects.map(project => `${ROUTES.projects}/${project.id}`)]
export const socialImagePath = (path: string) => `/images/social/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}.jpg`
export const normalizePath = (path: string) => path === '/' ? path : path.replace(/\/+$/, '')

export function getPageSeo(rawPath: string) {
  const path = normalizePath(rawPath)
  const article = path.startsWith(`${ROUTES.learning}/`) ? getArticle(path.slice(ROUTES.learning.length + 1)) : undefined
  const project = path.startsWith(`${ROUTES.projects}/`) ? publishedProjects.find(item => item.id === path.slice(ROUTES.projects.length + 1)) : undefined
  const page = article ? { title: `${article.title} | Evergreen Solar Energies`, description: article.summary, label: article.title, photo: articlePhotos[article.slug]! }
    : project ? { title: `${project.title} | Evergreen Solar Energies`, description: project.summary, label: project.title, photo: 'impact-clean' }
    : pages[path]
  const found = !!page
  const meta = page ?? { title: 'Page Not Found | Evergreen Solar Energies', description: 'This page is not available. Explore Evergreen Solar Energies services or contact us about a site assessment.', label: 'Page Not Found', photo: 'home-residential' }
  const origin = productionOrigin()
  const published = !!origin && import.meta.env.VITE_BUSINESS_DETAILS_VERIFIED === 'true'
    && (!import.meta.env.CONTEXT || import.meta.env.CONTEXT === 'production')
  const canonical = found && origin ? `${origin}${path}` : undefined
  const image = found ? socialImagePath(path) : socialImagePath('/')
  const schema: Record<string, unknown>[] = []
  if (published && origin) {
    const business = `${origin}/#business`
    schema.push({ '@type': ['Organization', 'LocalBusiness'], '@id': business, name: siteConfig.name, url: origin,
      description: siteConfig.description, logo: `${origin}/images/logo/evergreen-logo-supplied-960.webp`,
      telephone: `+91${siteConfig.contact.phone}`, email: siteConfig.contact.email,
      address: { '@type': 'PostalAddress', streetAddress: siteConfig.contact.address, addressLocality: 'Kadapa', addressRegion: 'Andhra Pradesh', addressCountry: 'IN' },
      areaServed: siteConfig.serviceAreas.map(area => ({ '@type': 'City', name: area.name, containedInPlace: { '@type': 'State', name: 'Andhra Pradesh' } })),
    }, { '@type': 'WebSite', '@id': `${origin}/#website`, url: origin, name: siteConfig.name, inLanguage: 'en-IN', publisher: { '@id': business } })
    if (found && path !== '/') {
      const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` }]
      if (article) crumbs.push({ '@type': 'ListItem', position: 2, name: 'Learning Hub', item: `${origin}${ROUTES.learning}` })
      if (project) crumbs.push({ '@type': 'ListItem', position: 2, name: 'Projects', item: `${origin}${ROUTES.projects}` })
      if (path !== '/') crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: meta.label, item: canonical! })
      schema.push({ '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumbs`, itemListElement: crumbs })
    }
    if (path === ROUTES.solarSolutions) schema.push(...services.map(service => ({ '@type': 'Service', '@id': `${canonical}#${service.id}`, name: service.title, description: service.short, provider: { '@id': business }, areaServed: siteConfig.serviceAreas.map(area => area.name), url: `${canonical}#${service.id}` })))
    if (article) schema.push({ '@type': 'Article', '@id': `${canonical}#article`, headline: article.title, description: article.summary, articleSection: article.category, inLanguage: 'en-IN', mainEntityOfPage: canonical, image: [`${origin}${image}`], publisher: { '@id': business } })
  }
  return { ...meta, path, found, canonical, image, origin, published, robots: published && found ? 'index,follow' : 'noindex,follow', schema }
}

export const escapeHtml = (text: string) => text.replace(/[&<>"']/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[value]!)
export const schemaJson = (schema: Record<string, unknown>[]) => JSON.stringify({ '@context': 'https://schema.org', '@graph': schema }).replaceAll('<', '\\u003c')

/** One metadata source for initial static HTML and client-side navigation. */
export function seoHead(path: string) {
  const meta = getPageSeo(path)
  const e = escapeHtml
  const imageUrl = meta.origin ? `${meta.origin}${meta.image}` : undefined
  const tag = (key: string, value: string, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${e(value)}" data-seo>`
  return [
    `<title>${e(meta.title)}</title>`, tag('description', meta.description), tag('robots', meta.robots),
    ...(meta.canonical ? [`<link rel="canonical" href="${e(meta.canonical)}" data-seo>`, tag('og:url', meta.canonical, true)] : []),
    tag('og:type', path.startsWith(`${ROUTES.learning}/`) && meta.found ? 'article' : 'website', true),
    tag('og:site_name', siteConfig.name, true), tag('og:locale', 'en_IN', true), tag('og:title', meta.title, true), tag('og:description', meta.description, true),
    tag('twitter:card', 'summary_large_image'), tag('twitter:title', meta.title), tag('twitter:description', meta.description),
    ...(imageUrl ? [tag('og:image', imageUrl, true), tag('og:image:type', 'image/jpeg', true), tag('og:image:width', '1200', true), tag('og:image:height', '630', true), tag('og:image:alt', `${meta.label} — Evergreen Solar Energies. Reference solar photography.`, true), tag('twitter:image', imageUrl), tag('twitter:image:alt', `${meta.label} — Evergreen Solar Energies`)] : []),
    ...(meta.schema.length ? [`<script type="application/ld+json" data-seo>${schemaJson(meta.schema)}</script>`] : []),
  ].join('\n')
}

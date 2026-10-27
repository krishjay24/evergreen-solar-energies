import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { ROUTES } from '@/config/routes'
import { brandLogo } from '@/config/brand'
import { siteConfig } from '@/config/site'
import { getArticle } from '@/data/learning'
import { publishedProjects } from '@/data/projects'

const pages: Record<string, { title: string; description: string }> = {
  [ROUTES.home]: { title: `${siteConfig.name} | ${siteConfig.tagline}`, description: siteConfig.description },
  [ROUTES.about]: { title: 'About Evergreen | Evergreen Solar', description: 'Learn how Evergreen Solar Energies approaches site assessment, system planning and installation support across Kadapa, Mydukur and Proddatur.' },
  [ROUTES.solarSolutions]: { title: 'Solar Solutions | Evergreen Solar', description: 'Explore residential rooftop, commercial and agricultural solar enquiries across Kadapa, Mydukur and Proddatur.' },
  [ROUTES.journey]: { title: 'How It Works | Evergreen Solar', description: 'Discover the site review, proposal, applicable approvals and installation stages of a considered solar project.' },
  [ROUTES.projects]: { title: 'Projects | Evergreen Solar', description: 'View genuine customer-approved Evergreen Solar Energies installations when they are available.' },
  [ROUTES.learning]: { title: 'Solar Learning Hub | Evergreen Solar', description: 'Understand solar panels, rooftop suitability, installation preparation, maintenance and electricity bills.' },
  [ROUTES.contact]: { title: 'Contact | Evergreen Solar', description: 'Contact Evergreen Solar Energies about site-specific solar enquiries in Kadapa, Mydukur and Proddatur.' },
  [ROUTES.quote]: { title: 'Solar Fit Assessment | Evergreen Solar', description: 'Share your site, project and electricity-use details to discuss a site-specific solar proposal.' },
  [ROUTES.privacy]: { title: 'Privacy Policy | Evergreen Solar', description: 'How the Evergreen Solar Energies website treats enquiry details and external links.' },
  [ROUTES.terms]: { title: 'Website Terms | Evergreen Solar', description: 'General educational and project assessment terms for the Evergreen Solar Energies website.' },
}

const upsert = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }
  tag.content = content
}

export function RouteMetadata() {
  const { pathname } = useLocation()
  useEffect(() => {
    const article = pathname.startsWith(`${ROUTES.learning}/`) ? getArticle(pathname.slice(ROUTES.learning.length + 1)) : undefined
    const project = pathname.startsWith(`${ROUTES.projects}/`) ? publishedProjects.find((item) => item.id === pathname.slice(ROUTES.projects.length + 1)) : undefined
    const meta = article
      ? { title: `${article.title} | Evergreen Solar`, description: article.summary }
      : project
        ? { title: `${project.title} | Evergreen Solar`, description: project.summary }
      : pages[pathname] ?? { title: 'Page not found | Evergreen Solar', description: 'This Evergreen Solar Energies page is not available.' }
    document.title = meta.title
    upsert('meta[name="description"]', 'name', 'description', meta.description)
    upsert('meta[property="og:title"]', 'property', 'og:title', meta.title)
    upsert('meta[property="og:description"]', 'property', 'og:description', meta.description)
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const verified = import.meta.env.VITE_BUSINESS_DETAILS_VERIFIED === 'true' && /^https:\/\//.test(siteConfig.url)
    if (verified) {
      const url = new URL(pathname, siteConfig.url).href
      const link = canonical ?? document.createElement('link')
      link.rel = 'canonical'
      link.href = url
      if (!canonical) document.head.appendChild(link)
      upsert('meta[property="og:url"]', 'property', 'og:url', url)
      upsert('meta[property="og:image"]', 'property', 'og:image', new URL(brandLogo.original, siteConfig.url).href)
      upsert('meta[name="robots"]', 'name', 'robots', 'index,follow')
      let schema = document.head.querySelector<HTMLScriptElement>('script[data-local-business]')
      if (!schema) {
        schema = document.createElement('script')
        schema.type = 'application/ld+json'
        schema.dataset['localBusiness'] = ''
        document.head.appendChild(schema)
      }
      schema.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        telephone: siteConfig.contact.phones.map((phone) => `+91${phone}`),
        email: siteConfig.contact.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: siteConfig.contact.address,
          addressLocality: 'Kadapa',
          addressRegion: 'Andhra Pradesh',
          addressCountry: 'IN',
        },
        areaServed: siteConfig.serviceAreas.map((area) => area.name),
      })
    } else {
      canonical?.remove()
      document.head.querySelector('meta[property="og:url"]')?.remove()
      document.head.querySelector('script[data-local-business]')?.remove()
      upsert('meta[name="robots"]', 'name', 'robots', 'noindex,nofollow')
    }
  }, [pathname])
  return null
}

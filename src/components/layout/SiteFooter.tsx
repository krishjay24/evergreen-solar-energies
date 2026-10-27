import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/components/common/Logo'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { ROUTES } from '@/config/routes'
import { serviceAreaNames, siteConfig } from '@/config/site'
import { services } from '@/data/services'
import { mapsHref, phoneHref } from '@/lib/contact'
import { trackEvent } from '@/lib/analytics'
import { Container } from './Container'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-canvas-alt pb-12 md:pb-0">
      <Container className="pt-16 pb-6 md:pt-20 md:pb-8">
        <div className="flex flex-wrap items-end justify-between gap-8 border-b border-line pb-14">
          <div>
            <span className="text-xs font-bold tracking-widest text-gold-accent uppercase">Let's connect</span>
            <h2 className="mt-4 max-w-3xl text-display-lg">Your next step starts with a conversation.</h2>
          </div>
          <PrimaryButton to={ROUTES.quote} onClick={() => trackEvent('solar_fit_open')} size="lg">Discuss your project</PrimaryButton>
        </div>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.3fr]">
          <div>
            <Logo size="md" />
            <p className="mt-5 max-w-xs text-sm leading-7 text-muted">{siteConfig.description}</p>
          </div>
          <nav aria-label="Footer quick links">
            <h3 className="text-sm font-semibold text-warm-white">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {([
                ['Home', ROUTES.home], ['About', ROUTES.about], ['How it works', ROUTES.journey],
                ['Projects', ROUTES.projects], ['Learning Hub', ROUTES.learning], ['Contact', ROUTES.contact],
              ] as const).map(([label, to]) => <li key={to}><Link to={to} className="transition-colors hover:text-gold-accent">{label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Footer solar solutions">
            <h3 className="text-sm font-semibold text-warm-white">Solar solutions</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {services.map((service) => <li key={service.id}><Link to={`${ROUTES.solarSolutions}#${service.id}`} className="transition-colors hover:text-gold-accent">{service.title}</Link></li>)}
            </ul>
          </nav>
          <div>
            <h3 className="text-sm font-semibold text-warm-white">Contact</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {siteConfig.contact.phones.map((phone) => <li key={phone}><a className="inline-flex items-center gap-2 hover:text-gold-accent" href={phoneHref(phone)}><Phone className="icon-sm text-gold" aria-hidden="true" />{phone}</a></li>)}
              <li><a className="inline-flex items-center gap-2 break-all hover:text-gold-accent" href={`mailto:${siteConfig.contact.email}`}><Mail className="icon-sm shrink-0 text-gold" aria-hidden="true" />{siteConfig.contact.email}</a></li>
              <li><a className="inline-flex items-start gap-2 hover:text-gold-accent" href={mapsHref} target="_blank" rel="noopener noreferrer"><MapPin className="icon-sm mt-1 shrink-0 text-gold" aria-hidden="true" />{siteConfig.contact.address}<ArrowUpRight className="icon-sm shrink-0" aria-hidden="true" /></a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 pr-16 text-xs text-muted md:pr-0">
          <p>&copy; {new Date().getFullYear()} KJ Tech Solutions. All rights reserved.</p>
          <p>Serving {serviceAreaNames.join(' · ')}</p>
          <div className="flex flex-wrap gap-5"><Link to={ROUTES.privacy} className="hover:text-gold-accent">Privacy Policy</Link><Link to={ROUTES.terms} className="hover:text-gold-accent">Terms</Link><a href="/images/solar/credits.html" className="hover:text-gold-accent">Photo credits</a></div>
        </div>
      </Container>
    </footer>
  )
}


import { MapPin } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import type { Ref } from 'react'
import { Link, useLocation } from 'react-router'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { whatsappHref } from '@/lib/contact'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { serviceAreaNames, siteConfig } from '@/config/site'
import { cn } from '@/lib/cn'
import { easeOutExpo } from '@/lib/motion'
import { isNavItemActive } from '@/lib/navigation'

const panel: Variants = {
  closed: { opacity: 0, y: -12, transition: { duration: 0.25, ease: easeOutExpo } },
  open: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutExpo, staggerChildren: 0.04, delayChildren: 0.08 } },
}

const item: Variants = {
  closed: { opacity: 0, y: 12 },
  open: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutExpo } },
}

interface MobileMenuProps {
  id: string
  onNavigate: () => void
  ref?: Ref<HTMLDivElement>
}

export function MobileMenu({ id, onNavigate, ref }: MobileMenuProps) {
  const quotation = whatsappHref('heroQuotation')
  const location = useLocation()
  const items = siteConfig.navigation

  return (
    <motion.div
      ref={ref}
      id={id}
      variants={panel}
      initial="closed"
      animate="open"
      exit="closed"
      className="fixed inset-x-0 top-(--header-height) bottom-0 overflow-y-auto border-t border-line bg-canvas/95 backdrop-blur-xl xl:hidden"
    >
      <nav aria-label="Mobile" className="container-site flex min-h-full flex-col gap-10 py-8">
        <ul className="flex flex-col">
          {items.map((navItem) => {
            const active = isNavItemActive(navItem, location, items)
            return (
              <motion.li key={navItem.to} variants={item} className="border-b border-line">
                <Link
                  to={navItem.to}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between py-4 text-2xl font-semibold tracking-tight transition-colors duration-300',
                    active ? 'text-gold-accent' : 'text-warm-white hover:text-gold-accent',
                  )}
                >
                  {navItem.label}
                  <span className={cn('size-1.5 rounded-full', active ? 'bg-gold' : 'bg-transparent')} aria-hidden="true" />
                </Link>
              </motion.li>
            )
          })}
        </ul>
        <motion.div variants={item} className="mt-auto flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-2 md:hidden">
          <PrimaryButton to={siteConfig.primaryCta.to} onClick={onNavigate} size="sm" icon={null} className="w-full px-2">
            {siteConfig.primaryCta.label}
          </PrimaryButton>
          {quotation && <SecondaryButton href={quotation} target="_blank" rel="noopener noreferrer" onClick={onNavigate} size="sm" className="w-full px-2">Get a Quotation</SecondaryButton>}
          </div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="icon-sm text-gold" aria-hidden="true" />
            Serving {serviceAreaNames.join(' · ')}
          </p>
        </motion.div>
      </nav>
    </motion.div>
  )
}

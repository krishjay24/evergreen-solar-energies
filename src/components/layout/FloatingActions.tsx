import { ArrowUp, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useScrolled } from '@/hooks/useScrolled'
import { phoneHref, whatsappHref } from '@/lib/contact'
import { siteConfig } from '@/config/site'
import { prefersReducedMotion } from '@/lib/motion'

export function FloatingActions() {
  const scrolled = useScrolled(500)
  const whatsapp = whatsappHref('general')
  return (
    <div className="pointer-events-none fixed right-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex flex-col items-end gap-3 sm:right-6">
      <a href={phoneHref(siteConfig.contact.phone)} aria-label="Call Evergreen Solar Energies" className="pointer-events-auto grid size-12 place-items-center rounded-full border border-gold/40 bg-evergreen text-warm-white shadow-lg transition-colors hover:bg-gold hover:text-canvas md:hidden">
        <Phone className="icon-md" aria-hidden="true" />
      </a>
      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Evergreen Solar Energies on WhatsApp"
          className="pointer-events-auto grid size-12 place-items-center rounded-full border border-white/20 bg-[#25d366] text-white shadow-lg transition-colors hover:bg-[#1fba59] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <svg className="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
          </svg>
        </a>
      )}
          <motion.button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth' })}
            aria-hidden={!scrolled}
            disabled={!scrolled}
            tabIndex={scrolled ? 0 : -1}
            initial={false}
            animate={scrolled ? { opacity: 1, visibility: 'visible' } : { opacity: 0, transitionEnd: { visibility: 'hidden' } }}
            transition={{ duration: prefersReducedMotion() ? 0 : 0.2 }}
            style={{ pointerEvents: scrolled ? 'auto' : 'none' }}
            className="pointer-events-auto grid size-12 place-items-center rounded-full border border-line-strong bg-card text-gold-accent shadow-lg transition-colors hover:border-gold"
          >
            <ArrowUp className="icon-md" aria-hidden="true" />
          </motion.button>
    </div>
  )
}

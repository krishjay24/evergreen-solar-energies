import { Menu, X } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { IconButton } from '@/components/common/IconButton'
import { Logo } from '@/components/common/Logo'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { whatsappHref } from '@/lib/contact'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { ROUTES } from '@/config/routes'
import { siteConfig } from '@/config/site'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useInertSiblings } from '@/hooks/useInertSiblings'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/cn'
import { Container } from './Container'
import { DesktopNav } from './DesktopNav'
import { MobileMenu } from './MobileMenu'

const MOBILE_MENU_ID = 'mobile-menu'
const DESKTOP_QUERY = '(min-width: 80rem)'

export function SiteHeader() {
  const quotation = whatsappHref('heroQuotation')
  const scrolled = useScrolled()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [locationKey, setLocationKey] = useState(location.key)
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Close the menu whenever the route changes (including back/forward).
  if (locationKey !== location.key) {
    setLocationKey(location.key)
    setMenuOpen(false)
  }

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useBodyScrollLock(menuOpen)
  useInertSiblings(headerRef, menuOpen)
  useFocusTrap(headerRef, menuOpen, { onEscape: closeMenu, returnFocusTo: toggleRef, initialFocusWithin: menuRef })

  useEffect(() => {
    if (!menuOpen) return
    const desktop = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => desktop.matches && setMenuOpen(false)
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
  }, [menuOpen])

  const solid = scrolled || menuOpen

  return (
    <header ref={headerRef} className="sticky top-0 z-40 isolate">
      <div
        className={cn(
          'absolute inset-0 -z-10 border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 ease-out-expo',
          solid
            ? 'border-line bg-canvas/85 shadow-[0_12px_32px_-20px_rgb(0_0_0/0.7)]'
            : 'border-transparent bg-canvas/40',
        )}
        aria-hidden="true"
      />
      <Container className="flex h-(--header-height) items-center justify-between gap-4 xl:grid xl:grid-cols-[auto_1fr_auto]">
        <Logo size="header" to={ROUTES.home} priority className="justify-self-start" />

        <DesktopNav className="hidden xl:block xl:justify-self-center" />

        <div className="flex items-center gap-2 justify-self-end">
          <PrimaryButton to={siteConfig.primaryCta.to} size="sm" icon={null} className="hidden md:inline-flex">
            {siteConfig.primaryCta.label}
          </PrimaryButton>
          {quotation && <SecondaryButton href={quotation} target="_blank" rel="noopener noreferrer" size="sm" className="hidden md:inline-flex">Get a Quotation</SecondaryButton>}
          <IconButton
            ref={toggleRef}
            icon={menuOpen ? X : Menu}
            label={menuOpen ? 'Close menu' : 'Open menu'}
            variant="outline"
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setMenuOpen((open) => !open)}
            className="xl:hidden"
          />
        </div>
      </Container>

      <AnimatePresence>{menuOpen && <MobileMenu ref={menuRef} id={MOBILE_MENU_ID} onNavigate={closeMenu} />}</AnimatePresence>
    </header>
  )
}

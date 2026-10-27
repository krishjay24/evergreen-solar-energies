import { motion } from 'motion/react'
import { Link, useLocation } from 'react-router'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/cn'
import { isNavItemActive } from '@/lib/navigation'

export function DesktopNav({ className }: { className?: string }) {
  const location = useLocation()
  const items = siteConfig.navigation

  return (
    <nav aria-label="Primary" className={className}>
      <ul className="flex items-center gap-0.5 rounded-full border border-line bg-warm-white/[0.03] p-1 backdrop-blur-md">
        {items.map((item) => {
          const active = isNavItemActive(item, location, items)
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative isolate block rounded-full px-4 py-2 text-[0.8125rem] font-medium whitespace-nowrap transition-colors duration-300',
                  active ? 'text-gold-accent' : 'text-muted hover:bg-warm-white/[0.05] hover:text-warm-white',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    className="absolute inset-0 -z-10 rounded-full border border-gold/25 bg-warm-white/[0.07]"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                    aria-hidden="true"
                  />
                )}
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

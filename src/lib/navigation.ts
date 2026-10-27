import type { NavItem } from '@/types'

interface LocationLike {
  readonly pathname: string
  readonly hash: string
}

export function splitTo(to: string): { pathname: string; hash: string } {
  const [pathname = '/', hash] = to.split('#')
  return { pathname: pathname || '/', hash: hash ? `#${hash}` : '' }
}

/**
 * Route items are active on their path (and nested paths); anchor items (`/#section`)
 * are active when their hash is current, which then takes precedence over the plain route.
 */
export function isNavItemActive(item: NavItem, location: LocationLike, items: readonly NavItem[]): boolean {
  const target = splitTo(item.to)
  if (target.hash) return location.pathname === target.pathname && location.hash === target.hash

  const anchorActive = items.some((other) => {
    const o = splitTo(other.to)
    return o.hash !== '' && o.pathname === location.pathname && o.hash === location.hash
  })
  if (anchorActive) return false
  if (target.pathname === '/') return location.pathname === '/'
  return location.pathname === target.pathname || location.pathname.startsWith(`${target.pathname}/`)
}

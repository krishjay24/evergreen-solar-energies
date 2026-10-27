import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { prefersReducedMotion } from '@/lib/motion'

const STORAGE_KEY = 'evergreen:scroll-positions'

const readPositions = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, number>
  } catch {
    return {}
  }
}

const behavior = (smooth: boolean): ScrollBehavior => (smooth && !prefersReducedMotion() ? 'smooth' : 'instant')

const scrollToHash = (hash: string, smooth: boolean): boolean => {
  let target: HTMLElement | null
  try {
    target = document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return false
  }
  if (!target) return false
  target.scrollIntoView({ behavior: behavior(smooth), block: 'start' })
  return true
}

/**
 * Scroll behaviour for client-side navigation:
 * - back/forward restores the previous position for that history entry,
 * - in-page anchor links scroll smoothly,
 * - new pages start at the top.
 */
export function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const scrollKey = `${location.key}:${location.pathname}${location.search}${location.hash}`
  const positions = useRef<Record<string, number>>(readPositions())
  const previousPathname = useRef<string | null>(null)

  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const persist = () => sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions.current))
    window.addEventListener('pagehide', persist)
    return () => {
      persist()
      window.removeEventListener('pagehide', persist)
    }
  }, [])

  useEffect(() => {
    let frame = 0
    const save = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        positions.current[scrollKey] = window.scrollY
      })
    }
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', save)
    }
  }, [scrollKey])

  useLayoutEffect(() => {
    const samePage = previousPathname.current === location.pathname
    previousPathname.current = location.pathname

    const saved = positions.current[scrollKey]
    if (navigationType === 'POP' && saved !== undefined) {
      window.scrollTo({ top: saved, behavior: 'instant' })
      return
    }
    if (location.hash && scrollToHash(location.hash, samePage)) return
    if (!samePage || navigationType !== 'POP') window.scrollTo({ top: 0, behavior: behavior(samePage) })
  }, [scrollKey, location.pathname, location.hash, navigationType])

  return null
}

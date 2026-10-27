import { useEffect, type RefObject } from 'react'

/** Makes every sibling of `element` inert (unfocusable, hidden from assistive tech) while `active`. */
export function useInertSiblings(element: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    const self = element.current
    if (!active || !self?.parentElement) return
    const siblings = Array.from(self.parentElement.children).filter(
      (child): child is HTMLElement => child !== self && child instanceof HTMLElement && !child.inert,
    )
    siblings.forEach((child) => (child.inert = true))
    return () => siblings.forEach((child) => (child.inert = false))
  }, [element, active])
}

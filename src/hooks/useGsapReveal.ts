import { useRef } from 'react'
import { gsap, REDUCED_MOTION_QUERY, useGSAP } from '@/lib/gsap'

interface GsapRevealOptions {
  selector?: string
  y?: number
  stagger?: number
}

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>({
  selector = '[data-reveal]',
  y = 32,
  stagger = 0.1,
}: GsapRevealOptions = {}) {
  const scope = useRef<T>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(`not ${REDUCED_MOTION_QUERY}`, () => {
        gsap.from(selector, {
          y,
          autoAlpha: 0,
          stagger,
          scrollTrigger: { trigger: scope.current, start: 'top 80%' },
        })
      })
      return () => mm.revert()
    },
    { scope },
  )

  return scope
}

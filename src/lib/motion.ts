import type { Transition, Variants } from 'motion/react'

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = (): boolean => window.matchMedia(REDUCED_MOTION_QUERY).matches

export const easeOutExpo = [0.16, 1, 0.3, 1] as const

export const defaultTransition: Transition = { duration: 0.6, ease: easeOutExpo }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: defaultTransition },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
}

export const staggerChildren = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
})

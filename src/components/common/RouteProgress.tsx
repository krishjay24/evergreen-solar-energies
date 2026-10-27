import { useLayoutEffect } from 'react'
import { motion, useScroll } from 'motion/react'
import { useLocation } from 'react-router'

/** The single page-progress line tracks scroll position, including restored routes. */
export function RouteProgress() {
  const { key } = useLocation()
  const { scrollYProgress } = useScroll({ trackContentSize: true })

  useLayoutEffect(() => {
    scrollYProgress.set(0)
    const frame = requestAnimationFrame(() => {
      const distance = document.documentElement.scrollHeight - window.innerHeight
      scrollYProgress.set(distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [key, scrollYProgress])

  return <motion.div data-scroll-progress className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[4px] origin-left bg-gold" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
}

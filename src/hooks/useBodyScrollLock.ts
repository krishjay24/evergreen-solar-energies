import { useEffect } from 'react'

/** Prevents page scrolling while `locked`, compensating for the scrollbar width to avoid layout shift. */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return
    const { documentElement: html, body } = document
    const scrollbarWidth = window.innerWidth - html.clientWidth
    const previous = { overflow: html.style.overflow, paddingRight: body.style.paddingRight }
    html.style.overflow = 'hidden'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      html.style.overflow = previous.overflow
      body.style.paddingRight = previous.paddingRight
    }
  }, [locked])
}

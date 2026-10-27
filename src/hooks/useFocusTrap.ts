import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface FocusTrapOptions {
  onEscape?: () => void
  /** Element to focus when the trap is released (defaults to the previously focused element). */
  returnFocusTo?: RefObject<HTMLElement | null>
  /** Region whose first focusable element receives focus on activation (defaults to the container). */
  initialFocusWithin?: RefObject<HTMLElement | null>
}

const getFocusables = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0)

/** Keeps keyboard focus inside `container` while active, closes on Escape and restores focus afterwards. */
export function useFocusTrap(
  container: RefObject<HTMLElement | null>,
  active: boolean,
  { onEscape, returnFocusTo, initialFocusWithin }: FocusTrapOptions = {},
) {
  useEffect(() => {
    const root = container.current
    if (!active || !root) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const returnTarget = returnFocusTo?.current ?? previouslyFocused
    const focusables = () => getFocusables(root)

    getFocusables(initialFocusWithin?.current ?? root)[0]?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onEscape?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      returnTarget?.focus({ preventScroll: true })
    }
  }, [active, container, onEscape, returnFocusTo, initialFocusWithin])
}

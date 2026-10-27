import { useEffect, useRef } from 'react'

const CURSOR_MEDIA = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) and (forced-colors: none)'
const NATIVE_TARGET = 'input, textarea, select, option, iframe, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [data-native-cursor], :disabled, [aria-disabled="true"]'
const INTERACTIVE = 'a, button, summary, [role="button"], [tabindex]:not([tabindex="-1"]), [data-cursor="interactive"]'
const TEXT_TARGET = 'p, h1, h2, h3, h4, h5, h6, label, li, blockquote, pre, code'

/** One DOM update per animation frame; no React renders on pointer movement. */
export function SolarCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return
    const media = window.matchMedia(CURSOR_MEDIA)
    let frame = 0, x = 0, y = 0, hasMouse = false
    const hide = () => {
      cursor.dataset['visible'] = 'false'
      document.documentElement.removeAttribute('data-solar-cursor')
    }
    const draw = () => {
      frame = 0
      const target = document.elementFromPoint(x, y)
      const interactive = target?.closest(INTERACTIVE)
      if (!media.matches || !hasMouse || document.hidden || document.fullscreenElement || x < 0 || x >= document.documentElement.clientWidth || y < 0 || y >= innerHeight || !target || target.closest(NATIVE_TARGET) || (!interactive && target.closest(TEXT_TARGET)) || !window.getSelection()?.isCollapsed) { hide(); return }
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`
      cursor.dataset['interactive'] = interactive ? 'true' : 'false'
      cursor.dataset['primary'] = interactive?.classList.contains('btn-primary') ? 'true' : 'false'
      cursor.dataset['visible'] = 'true'
      document.documentElement.setAttribute('data-solar-cursor', 'active')
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw) }
    const move = (event: PointerEvent) => {
      hasMouse = event.pointerType === 'mouse'
      if (!hasMouse || !media.matches) { hide(); return }
      x = event.clientX; y = event.clientY; schedule()
    }
    const leave = () => { hasMouse = false; hide() }
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    document.addEventListener('visibilitychange', leave)
    document.addEventListener('selectionchange', schedule)
    document.addEventListener('focusin', schedule)
    document.addEventListener('fullscreenchange', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    media.addEventListener('change', schedule)
    return () => {
      cancelAnimationFrame(frame); hide()
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      document.removeEventListener('visibilitychange', leave)
      document.removeEventListener('selectionchange', schedule)
      document.removeEventListener('focusin', schedule)
      document.removeEventListener('fullscreenchange', schedule)
      window.removeEventListener('scroll', schedule)
      media.removeEventListener('change', schedule)
    }
  }, [])

  return <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true"><div ref={cursorRef} data-custom-cursor className="solar-cursor"><span className="solar-cursor-ring" /><span className="solar-cursor-dot" /></div></div>
}

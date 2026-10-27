import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { siteConfig } from '@/config/site'
import { gsap, useGSAP } from '@/lib/gsap'
import { Logo } from './Logo'

const point = (column: number, row: number) => `${296 + column * 66 + row * 39},${273 - column * 18 + row * 28}`
const modules = Array.from({ length: 6 }, (_, index) => ({ column: index % 3, row: Math.floor(index / 3) }))
const sunlightPaths = ['M349 204 Q358 232 397 268', 'M371 205 Q410 218 463 250', 'M390 194 Q469 198 526 258']

/** Code-native layered artwork: no videos, image downloads or changes to the approved logo. */
function NatureSolarSequence() {
  const root = useRef<HTMLDivElement>(null)
  const id = `loading-solar-${useId().replace(/:/g, '')}`

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('[data-loader-art]', { autoAlpha: 0 })
      gsap.set('[data-loader-brand], [data-loader-tagline]', { autoAlpha: 1, y: 0 })
    })
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
      timeline.set('[data-loader-art]', { autoAlpha: 1 })
        .set('[data-loader-brand], [data-loader-tagline]', { autoAlpha: 0, y: 10 })
        .fromTo('[data-loader-leaf]', { scale: 0.03, rotation: -16, autoAlpha: 0, svgOrigin: '303 330' }, { scale: 1, rotation: 0, autoAlpha: 1, stagger: 0.18, duration: 0.9 }, 0)
        .fromTo('[data-loader-sun]', { y: 75, scale: 0.7, autoAlpha: 0, transformOrigin: '50% 50%' }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.15 }, 0.4)
        .fromTo('[data-loader-halo]', { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' }, { autoAlpha: 1, scale: 1, duration: 1.3 }, 0.55)
        .fromTo('[data-loader-rays]', { autoAlpha: 0 }, { autoAlpha: 0.65, duration: 0.85 }, 0.8)
        .fromTo('[data-loader-frame]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.15)
        .fromTo('[data-loader-module]', { autoAlpha: 0, x: -8, y: 22 }, { autoAlpha: 1, x: 0, y: 0, stagger: 0.1, duration: 0.7 }, 1.35)
        .fromTo('[data-loader-beam]', { autoAlpha: 0 }, { autoAlpha: 0.45, duration: 0.5 }, 2.25)
        .fromTo('[data-loader-glint]', { autoAlpha: 0 }, { autoAlpha: 0.8, duration: 0.3, stagger: 0.08 }, 2.9)
        .to('[data-loader-glint]', { autoAlpha: 0, duration: 0.4 }, 3.25)
        .to('[data-loader-art]', { autoAlpha: 0, scale: 0.94, y: -8, duration: 0.65 }, 3.65)
        .to('[data-loader-brand]', { autoAlpha: 1, y: 0, duration: 0.65 }, 3.85)
        .to('[data-loader-tagline]', { autoAlpha: 1, y: 0, duration: 0.5 }, 4.05)

      sunlightPaths.forEach((_, index) => {
        const path = root.current?.querySelector<SVGPathElement>(`[data-loader-beam="${index}"]`)
        const photon = root.current?.querySelector<SVGGElement>(`[data-loader-photon="${index}"]`)
        if (!path || !photon) return
        timeline.add(gsap.timeline()
          .fromTo(photon, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.12 })
          .to(photon, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: 0.95, ease: 'none' }, 0)
          .to(photon, { autoAlpha: 0, duration: 0.15 }, 0.8), 2.3 + index * 0.14)
      })
    })
    return () => media.revert()
  }, { scope: root })

  return (
    <div ref={root} className="relative flex w-full max-w-xl flex-col items-center text-center">
      <div className="relative aspect-[32/21] w-full">
        <svg data-loader-art viewBox="0 0 640 420" className="absolute inset-0 size-full" style={{ opacity: 0 }} aria-hidden="true">
          <defs>
            <radialGradient id={`${id}-atmosphere`}><stop stopColor="#d9b65b" stopOpacity="0.22" /><stop offset="1" stopColor="#d9b65b" stopOpacity="0" /></radialGradient>
            <radialGradient id={`${id}-sun`} cx="35%" cy="28%"><stop stopColor="#fff9c3" /><stop offset="0.42" stopColor="#f6d96b" /><stop offset="0.8" stopColor="#dca72d" /><stop offset="1" stopColor="#a86b13" /></radialGradient>
            <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b7d95b" /><stop offset="0.3" stopColor="#5caa43" /><stop offset="0.7" stopColor="#17663d" /><stop offset="1" stopColor="#0b3828" /></linearGradient>
            <linearGradient id={`${id}-small-leaf`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a9cf59" /><stop offset="0.5" stopColor="#378849" /><stop offset="1" stopColor="#12482f" /></linearGradient>
            <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="0.8" y2="1"><stop stopColor="#5fbbf0" /><stop offset="0.3" stopColor="#2774b8" /><stop offset="0.8" stopColor="#134a86" /><stop offset="1" stopColor="#0c2f55" /></linearGradient>
            <linearGradient id={`${id}-steel`}><stop stopColor="#354e59" /><stop offset="0.5" stopColor="#94adb2" /><stop offset="1" stopColor="#2c4349" /></linearGradient>
            <radialGradient id={`${id}-ground`}><stop stopColor="#4c8358" stopOpacity="0.25" /><stop offset="1" stopColor="#123e30" stopOpacity="0" /></radialGradient>
            <radialGradient id={`${id}-photon`}><stop stopColor="#fffbe0" /><stop offset="0.3" stopColor="#f0d77c" /><stop offset="1" stopColor="#f0d77c" stopOpacity="0" /></radialGradient>
          </defs>
          <ellipse cx="365" cy="358" rx="230" ry="43" fill={`url(#${id}-ground)`} />
          <g data-loader-halo><circle cx="350" cy="157" r="158" fill={`url(#${id}-atmosphere)`} /><path d="M350 152 184 350 582 350Z" fill={`url(#${id}-atmosphere)`} /></g>
          <g data-loader-sun><circle cx="350" cy="155" r="68" fill={`url(#${id}-sun)`} /><path d="M306 115A57 57 0 0 1 392 117" fill="none" stroke="#fffad1" strokeWidth="2" strokeOpacity="0.5" /></g>
          <g data-loader-rays stroke="#d9b65b" strokeWidth="1.5" strokeLinecap="round">
            {Array.from({ length: 9 }, (_, index) => {
              const angle = (index * 25 + 165) * Math.PI / 180
              return <path key={index} d={`M${350 + Math.cos(angle) * 83} ${155 + Math.sin(angle) * 83}L${350 + Math.cos(angle) * 101} ${155 + Math.sin(angle) * 101}`} />
            })}
          </g>
          <g data-loader-frame>
            <ellipse cx="430" cy="351" rx="153" ry="18" fill="#030e0c" opacity="0.5" />
            <path d="M374 329 572 275v10l-198 54Z" fill={`url(#${id}-steel)`} /><path d="M296 273 374 329v10l-78-56Z" fill="#203941" />
            <path d="M374 339v24m190-77v29M310 285v28" stroke="#536a6c" strokeWidth="5" />
            <path d="M296 273 494 219 572 275 374 329Z" fill="#112c3e" stroke="#8bb3c4" strokeWidth="2" />
          </g>
          {modules.map(({ column, row }) => (
            <g data-loader-module key={`${column}-${row}`}>
              <polygon points={[point(column + 0.025, row + 0.035), point(column + 0.975, row + 0.035), point(column + 0.975, row + 0.965), point(column + 0.025, row + 0.965)].join(' ')} fill={`url(#${id}-panel)`} stroke="#a6cfe3" strokeWidth="1" />
              <g stroke="#aad9ef" strokeWidth="0.65" strokeOpacity="0.45">
                {[1, 2].map(line => <path key={`c${line}`} d={`M${point(column + line / 3, row + 0.04)}L${point(column + line / 3, row + 0.96)}`} />)}
                {[1, 2, 3].map(line => <path key={`r${line}`} d={`M${point(column + 0.03, row + line / 4)}L${point(column + 0.97, row + line / 4)}`} />)}
              </g>
              <path data-loader-glint d={`M${point(column + 0.05, row + 0.08)}L${point(column + 0.94, row + 0.08)}`} stroke="#fff9d4" strokeWidth="1.5" style={{ opacity: 0 }} />
            </g>
          ))}
          <g data-loader-leaf>
            <path d="M303 330C215 331 152 272 159 187C244 187 313 235 303 330Z" fill={`url(#${id}-leaf)`} stroke="#81b85a" strokeOpacity="0.5" />
            <path d="M300 327C260 277 212 230 161 190" fill="none" stroke="#cee68a" strokeWidth="1.7" strokeOpacity="0.75" />
            <path d="m280 302-62-17m45-2-17-58m-4 37-58-18m37-2-12-42" fill="none" stroke="#bad67c" strokeOpacity="0.3" />
            <path d="M163 191C217 195 263 223 289 270C253 225 206 205 163 191Z" fill="#e1f3a4" opacity="0.2" />
            <path d="m303 328 5 20" stroke="#4b9053" strokeWidth="4" strokeLinecap="round" />
          </g>
          <g data-loader-leaf>
            <path d="M303 330C302 264 343 225 395 225C394 281 358 325 303 330Z" fill={`url(#${id}-small-leaf)`} stroke="#83b25f" strokeOpacity="0.5" />
            <path d="M305 328C333 296 360 261 391 229m-54 62 24-3m-9-22-3-25" fill="none" stroke="#d4e599" strokeWidth="1.1" strokeOpacity="0.6" />
          </g>
          {sunlightPaths.map((path, index) => (
            <g key={path}>
              <path data-loader-beam={index} d={path} fill="none" stroke="#f0d77c" strokeWidth="1" style={{ opacity: 0 }} />
              <g data-loader-photon={index} style={{ opacity: 0 }}><circle r="9" fill={`url(#${id}-photon)`} /><circle r="2" fill="#fff6ce" /></g>
            </g>
          ))}
        </svg>
        <div data-loader-brand className="absolute inset-0 grid place-items-center"><Logo size="xl" priority /></div>
      </div>
      <p data-loader-tagline className="mt-4 text-sm leading-7 tracking-wide text-warm-white/85 md:text-base">{siteConfig.tagline}</p>
    </div>
  )
}

/** Delayed reveal avoids a flash; readiness never waits for the animation to finish. */
export function PageLoader({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(false)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (ready) return
    const timer = setTimeout(() => setVisible(true), 150)
    return () => clearTimeout(timer)
  }, [ready])

  return (
    <AnimatePresence>
      {!ready && visible && (
        <motion.div data-initial-loader role="status" aria-live="polite" className="pointer-events-none fixed inset-0 z-[70] grid place-items-center bg-canvas px-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
          <div className="flex w-full max-w-xl flex-col items-center text-center">
            <NatureSolarSequence />
            <div className="mt-6 h-px w-32 overflow-hidden bg-gold/15" aria-hidden="true">
              <motion.span className="block h-full w-12 bg-gold" animate={reduced ? { x: 40 } : { x: [-48, 128] }} transition={{ duration: reduced ? 0 : 2.2, ease: 'easeInOut', repeat: reduced ? 0 : Infinity }} />
            </div>
            <span className="sr-only">Loading {siteConfig.shortName}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { useEffect, useRef, useState, type RefObject } from 'react'
import { SOLAR_HOUSE_ANCHORS, SOLAR_HOUSE_VIEWBOX, type SolarHouseAnchor } from '@/components/solar/solarHouseGeometry'
import { gsap, useGSAP } from '@/lib/gsap'

interface Line {
  id: SolarHouseAnchor
  d: string
  start: { x: number; y: number }
  end: { x: number; y: number }
}

interface Geometry {
  width: number
  height: number
  lines: Line[]
}

/** Layout offset of `el` within `ancestor`, ignoring CSS transforms (intro and parallax animations). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0
  let y = 0
  let node: HTMLElement | null = el
  while (node && node !== ancestor) {
    x += node.offsetLeft
    y += node.offsetTop
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null
  }
  return node === ancestor ? { x, y } : null
}

function measure(scene: HTMLElement): Geometry | null {
  const house = scene.querySelector<HTMLElement>('[data-hero-house]')
  if (!house) return null
  const houseOffset = offsetWithin(house, scene)
  if (!houseOffset) return null
  const sx = house.offsetWidth / SOLAR_HOUSE_VIEWBOX.width
  const sy = house.offsetHeight / SOLAR_HOUSE_VIEWBOX.height

  const lines: Line[] = []
  scene.querySelectorAll<HTMLElement>('[data-connector]').forEach((connector) => {
    if (connector.getClientRects().length === 0) return
    const id = connector.dataset['connector'] as SolarHouseAnchor
    const anchor = SOLAR_HOUSE_ANCHORS[id]
    const offset = offsetWithin(connector, scene)
    if (!offset) return
    const start = { x: houseOffset.x + anchor.cx * sx, y: houseOffset.y + anchor.cy * sy }
    const end = { x: offset.x + connector.offsetWidth / 2, y: offset.y + connector.offsetHeight / 2 }
    const direction = Math.sign(start.x - end.x) || 1
    const elbowX = end.x + direction * Math.min(56, Math.abs(start.x - end.x) * 0.35)
    const r = (n: number) => n.toFixed(1)
    lines.push({ id, start, end, d: `M${r(start.x)} ${r(start.y)} L${r(elbowX)} ${r(end.y)} L${r(end.x)} ${r(end.y)}` })
  })
  return { width: scene.offsetWidth, height: scene.offsetHeight, lines }
}

interface HeroConnectionsProps {
  sceneRef: RefObject<HTMLElement | null>
  /** Lines become visible (drawn) once true. */
  drawn: boolean
  /** Animate the line drawing; otherwise lines appear immediately. */
  animateDraw: boolean
  /** Run the continuous particle animation (only while the hero is visible). */
  live: boolean
}

export function HeroConnections({ sceneRef, drawn, animateDraw, live }: HeroConnectionsProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [geometry, setGeometry] = useState<Geometry | null>(null)
  const [drawComplete, setDrawComplete] = useState(!animateDraw)

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    let frame = 0
    let active = true
    const update = () => {
      if (!active) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (active) setGeometry(measure(scene))
      })
    }
    const observer = new ResizeObserver(update)
    observer.observe(scene)
    scene.querySelectorAll('[data-hero-widget]').forEach((widget) => observer.observe(widget))
    void document.fonts.ready.then(update)
    return () => {
      active = false
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [sceneRef])

  // Draw the lines from the house out to each widget.
  useGSAP(
    () => {
      if (!geometry?.lines.length || !drawn || drawComplete || !animateDraw) return
      gsap
        .timeline({ onComplete: () => setDrawComplete(true) })
        .fromTo('[data-line]', { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7, ease: 'power2.inOut', stagger: 0.05 })
        .fromTo('[data-line-start]', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.05 }, 0)
    },
    { scope: svgRef, dependencies: [geometry === null, drawn, animateDraw], revertOnUpdate: true },
  )

  // Energy particles travelling along each line, plus the flow dots inside widgets.
  useGSAP(
    () => {
      const svg = svgRef.current
      const linesReady = geometry !== null && (!animateDraw || drawComplete || geometry.lines.length === 0)
      if (!geometry || !live || !linesReady) return
      geometry.lines.forEach((line, i) => {
        const path = svg?.querySelector<SVGPathElement>(`[data-line="${line.id}"]`)
        const particle = svg?.querySelector<SVGGElement>(`[data-particle="${line.id}"]`)
        if (!path || !particle) return
        gsap
          .timeline({ repeat: -1, delay: i * 0.45, repeatDelay: 0.8 + (i % 3) * 0.5 })
          .fromTo(particle, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
          // Every callout particle follows the same inward direction as Sun Power.
          .to(particle, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 1, end: 0 }, duration: 2.2, ease: 'none' }, 0)
          .to(particle, { autoAlpha: 0, duration: 0.3 }, 1.9)
      })
      const hero = sceneRef.current?.closest('[data-hero]') ?? undefined
      const flowDots = gsap.utils.toArray<HTMLElement>('[data-flow-dot]', hero).filter((dot) => dot.getClientRects().length > 0)
      if (!flowDots.length) return
      gsap.fromTo(
        flowDots,
        { x: -16, autoAlpha: 0 },
        {
          x: (_: number, el: HTMLElement) => el.parentElement?.offsetWidth ?? 0,
          autoAlpha: 1,
          duration: 1.4,
          ease: 'none',
          stagger: { each: 0.5, repeat: -1, repeatDelay: 0.4 },
        },
      )
    },
    { dependencies: [geometry, live, drawComplete, animateDraw], revertOnUpdate: true },
  )

  if (!geometry) return null

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="hero-particle">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="0.35" stopColor="#f0d77c" />
          <stop offset="1" stopColor="#f0d77c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {geometry.lines.map((line) => (
        <g key={line.id}>
          <path
            data-line={line.id}
            d={line.d}
            fill="none"
            stroke="rgb(247 247 240 / 0.38)"
            strokeWidth="1"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={drawn && (!animateDraw || drawComplete) ? 0 : 1}
            vectorEffect="non-scaling-stroke"
          />
          <g data-line-start style={{ opacity: drawn ? undefined : 0 }}>
            <circle cx={line.start.x} cy={line.start.y} r="7" fill="#f0d77c" opacity="0.18" />
            <circle cx={line.start.x} cy={line.start.y} r="3" fill="#f0d77c" />
          </g>
          <g data-particle={line.id} style={{ opacity: 0 }}>
            <circle r="7" fill="url(#hero-particle)" />
          </g>
        </g>
      ))}
    </svg>
  )
}

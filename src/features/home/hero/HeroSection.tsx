import { ArrowRight } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { EyebrowLabel } from '@/components/common/EyebrowLabel'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SecondaryButton } from '@/components/common/SecondaryButton'
import { Container } from '@/components/layout/Container'
import { SolarHouse } from '@/components/solar/SolarHouse'
import { ROUTES } from '@/config/routes'
import { gsap, useGSAP } from '@/lib/gsap'
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from '@/lib/motion'
import { HeroBackground } from './HeroBackground'
import { HeroConnections } from './HeroConnections'
import { heroCopy, heroWidgets } from './heroContent'
import { HeroCompactWidget, HeroStageWidget } from './HeroWidget'

type Phase = 'intro' | 'lines' | 'live' | 'static'

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)'
const PANEL_LIT_OPACITY = 0.45

/** The header intro only plays on the very first page load of a session. */
let headerIntroPlayed = false

const words = heroCopy.heading.split(' ')
const stageWidgets = heroWidgets
const tabletCards = heroWidgets.filter((w) => w.variant === 'card')

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const [motionPreference, setMotionPreference] = useState(() => {
    const reduced = prefersReducedMotion()
    return { reduced, introSkipped: reduced }
  })
  const [phase, setPhase] = useState<Phase>('intro')
  const [inView, setInView] = useState(true)
  const animateHeader = location.key === 'default' && !headerIntroPlayed

  useEffect(() => {
    const preference = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = () => setMotionPreference((current) => ({
      reduced: preference.matches,
      introSkipped: current.introSkipped || preference.matches,
    }))
    preference.addEventListener('change', onChange)
    return () => preference.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => setInView((entry?.intersectionRatio ?? 0) >= 0.2), { threshold: 0.2 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  // Coordinated intro sequence.
  useGSAP(
    () => {
      if (motionPreference.introSkipped) {
        headerIntroPlayed = true
        gsap.set('[data-panel-cell]', { opacity: PANEL_LIT_OPACITY })
        return
      }
      const header = animateHeader ? document.querySelector('header') : null
      headerIntroPlayed = true

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.fromTo('[data-hero-bg]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'power1.out' }, 0)
      if (header) tl.fromTo(header, { y: -24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, clearProps: 'transform,opacity,visibility' }, 0.15)
      // Let each focal element settle before revealing the next part of the composition.
      tl.fromTo('[data-hero-eyebrow]', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.3)
        .fromTo('[data-hero-word]', { yPercent: 110 }, { yPercent: 0, duration: 0.85, stagger: 0.06, ease: 'power4.out' }, 0.45)
        .fromTo('[data-hero-desc]', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 1.55)
        .fromTo(
          '[data-hero-house]',
          { scale: 0.9, y: 36, autoAlpha: 0, transformOrigin: '50% 80%' },
          { scale: 1, y: 0, autoAlpha: 1, duration: 1.2, clearProps: 'transform' },
          1.95,
        )
        .fromTo('[data-panel-cell]', { opacity: 0 }, { opacity: PANEL_LIT_OPACITY, duration: 0.45, stagger: 0.011, ease: 'power1.out' }, 2.65)
        .fromTo('[data-panel-glint]', { x: -80, opacity: 0 }, { x: 640, opacity: 1, duration: 1.1, ease: 'power2.inOut' }, 2.75)
        .to('[data-panel-glint]', { opacity: 0, duration: 0.3 }, 3.6)
        .call(() => setPhase('lines'), [], 3.3)
        .call(() => setPhase('live'), [], 4.15)
        .fromTo(
          '[data-hero-widget]',
          { y: 18, autoAlpha: 0, scale: 0.96 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.07, clearProps: 'transform' },
          4.25,
        )
        .fromTo('[data-hero-cta] > *', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.1, clearProps: 'transform' }, 4.85)
    },
    { scope: rootRef, dependencies: [motionPreference.introSkipped], revertOnUpdate: true },
  )

  // Subtle depth parallax for fine pointers only.
  useGSAP(
    () => {
      const root = rootRef.current
      const scene = sceneRef.current
      if (motionPreference.reduced || !root || !scene || !window.matchMedia(FINE_POINTER_QUERY).matches) return
      const glow = root.querySelector('[data-hero-glow]')
      gsap.set(scene, { transformPerspective: 1600 })
      const to = (target: Element | null, prop: string) => (target ? gsap.quickTo(target, prop, { duration: 1.1, ease: 'power3.out' }) : () => undefined)
      const sceneX = to(scene, 'x')
      const sceneY = to(scene, 'y')
      const sceneRotY = to(scene, 'rotationY')
      const sceneRotX = to(scene, 'rotationX')
      const glowX = to(glow, 'x')
      const glowY = to(glow, 'y')

      const move = (nx: number, ny: number) => {
        sceneX(nx * 14)
        sceneY(ny * 8)
        sceneRotY(nx * 1.6)
        sceneRotX(-ny * 1.2)
        glowX(-nx * 28)
        glowY(-ny * 18)
      }
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return
        const rect = root.getBoundingClientRect()
        move((event.clientX - rect.left) / rect.width - 0.5, (event.clientY - rect.top) / rect.height - 0.5)
      }
      const onPointerLeave = () => move(0, 0)
      root.addEventListener('pointermove', onPointerMove)
      root.addEventListener('pointerleave', onPointerLeave)
      return () => {
        root.removeEventListener('pointermove', onPointerMove)
        root.removeEventListener('pointerleave', onPointerLeave)
      }
    },
    { scope: rootRef, dependencies: [motionPreference.reduced], revertOnUpdate: true },
  )

  return (
    <section
      ref={rootRef}
      data-hero
      aria-labelledby="hero-heading"
      className="relative isolate -mt-(--header-height) overflow-hidden pt-(--header-height)"
    >
      <HeroBackground />

      <Container className="relative flex flex-col items-center pt-8 pb-14 md:pt-12 xl:pb-8">
        <div className="relative z-10 flex flex-col items-center gap-5 text-center md:gap-6">
          <span data-hero-eyebrow>
            <EyebrowLabel>{heroCopy.eyebrow}</EyebrowLabel>
          </span>
          <h1 id="hero-heading" className="max-w-5xl text-display-lg font-medium tracking-[-0.04em] text-warm-white">
            {words.map((word, i) => (
              <Fragment key={i}>
                <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top">
                  <span data-hero-word className="inline-block">
                    {word}
                  </span>
                </span>
                {i < words.length - 1 && ' '}
              </Fragment>
            ))}
          </h1>
        </div>

        <div className="relative z-20 mt-6 flex w-full max-w-md flex-col items-center gap-6 text-center md:mt-7 xl:absolute xl:bottom-10 xl:left-8 xl:mt-0 xl:max-w-[18.5rem] xl:items-start xl:gap-5 xl:text-left">
          <p data-hero-desc className="text-lead text-muted xl:text-base">
            {heroCopy.description}
          </p>
          <div data-hero-cta className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center xl:w-full xl:flex-col xl:items-stretch">
            <PrimaryButton to={heroCopy.primaryCta.to} size="lg" className="justify-center xl:justify-between xl:pl-7">
              {heroCopy.primaryCta.label}
            </PrimaryButton>
            <SecondaryButton to={heroCopy.secondaryCta.to} size="lg" icon={ArrowRight} className="justify-center xl:justify-between xl:px-7">
              {heroCopy.secondaryCta.label}
            </SecondaryButton>
          </div>
        </div>

        <div className="relative mt-8 aspect-[10/9] w-full sm:aspect-[4/3] md:mt-10 md:aspect-[16/11] xl:mt-0 xl:aspect-[120/55]">
          <div ref={sceneRef} data-hero-scene className="absolute inset-0">
            <div
              data-hero-house
              className="absolute bottom-0 left-0 aspect-[780/670] w-full sm:left-[7%] sm:w-[86%] md:left-[19%] md:w-[62%] xl:left-[28%] xl:w-[44%]"
            >
              <SolarHouse className="size-full" />
            </div>
            <HeroConnections
              sceneRef={sceneRef}
              drawn={motionPreference.introSkipped || phase !== 'intro'}
              animateDraw={!motionPreference.introSkipped}
              live={!motionPreference.reduced && (motionPreference.introSkipped || phase === 'live') && inView}
            />
            {stageWidgets.map((widget) => (
              <HeroStageWidget key={widget.id} widget={widget} />
            ))}
          </div>
        </div>

        <ul className="mt-4 grid w-full grid-cols-2 gap-2.5 md:hidden" aria-label="How solar works">
          {heroWidgets.map((widget) => (
            <HeroCompactWidget key={widget.id} widget={widget} minimal />
          ))}
        </ul>
        <ul className="mt-4 hidden w-full grid-cols-3 gap-4 md:grid xl:hidden" aria-label="How solar works">
          {tabletCards.map((widget) => (
            <HeroCompactWidget key={widget.id} widget={widget} />
          ))}
        </ul>
        <p className="relative z-10 mt-6 text-center text-sm leading-6 text-muted">
          Have a site in mind?{' '}
          <Link to={ROUTES.quote} className="font-semibold text-warm-white underline decoration-gold/60 underline-offset-4 transition-colors hover:text-gold-accent">Start your Solar Fit enquiry <span aria-hidden="true">→</span></Link>
        </p>
      </Container>
    </section>
  )
}

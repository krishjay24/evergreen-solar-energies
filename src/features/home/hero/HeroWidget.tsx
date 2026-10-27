import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useId } from 'react'
import { cn } from '@/lib/cn'
import { energyFlowSteps, siteAssessmentChecks, type HeroWidgetConfig } from './heroContent'

const hover = { y: -3, transition: { type: 'spring', stiffness: 320, damping: 22 } } as const

function Connector({ id, side }: { id: string; side: 'left' | 'right' }) {
  // Positioned with offsets (not transforms) so the hero can measure it reliably.
  return (
    <span
      data-connector={id}
      aria-hidden="true"
      className={cn(
        'absolute top-[calc(50%-5px)] size-2.5 rounded-full border-2 border-canvas bg-gold-accent shadow-[0_0_0_4px_rgb(217_182_91/0.18)]',
        side === 'left' ? '-left-[5px]' : '-right-[5px]',
      )}
    />
  )
}

function IconBadge({ widget, size = 'md' }: { widget: HeroWidgetConfig; size?: 'sm' | 'md' }) {
  const Icon = widget.icon
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/10 text-gold-accent',
        size === 'sm' ? 'size-8' : 'size-9',
      )}
    >
      <Icon className="icon-sm" aria-hidden="true" />
    </span>
  )
}

function RingVisual({ widget }: { widget: HeroWidgetConfig }) {
  const gradientId = `${useId().replace(/:/g, '')}-ring`
  const Icon = widget.icon
  return (
    <div className="relative grid size-14 shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-full" aria-hidden="true">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgb(247 247 240 / 0.08)" strokeWidth="3" />
        <circle data-ring cx="32" cy="32" r="28" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeDasharray="4 6" />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0d77c" />
            <stop offset="1" stopColor="#4fae6c" />
          </linearGradient>
        </defs>
      </svg>
      <span className="grid size-9 place-items-center rounded-full bg-gold/10 text-gold-accent">
        <Icon className="icon-md" aria-hidden="true" />
      </span>
    </div>
  )
}

function FlowVisual() {
  return (
    <div className="mt-1 flex items-center gap-2">
      {energyFlowSteps.map((step, i) => (
        <div key={step} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className="rounded-full border border-line-strong bg-warm-white/[0.04] px-2.5 py-1 text-[0.6875rem] font-semibold text-warm-white/90">
            {step}
          </span>
          {i < energyFlowSteps.length - 1 && (
            <span className="relative h-px flex-1 overflow-hidden bg-line-strong" aria-hidden="true">
              <span data-flow-dot className="absolute top-[-1.5px] left-0 h-1 w-4 -translate-x-4 rounded-full bg-linear-to-r from-transparent via-gold-accent to-transparent" />
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function ChecklistVisual() {
  return (
    <ul className="mt-1 flex flex-col gap-1.5">
      {siteAssessmentChecks.map((item) => (
        <li key={item} className="flex items-center gap-2 text-xs text-warm-white/85">
          <span className="grid size-4 place-items-center rounded-full bg-gold/15 text-gold-accent">
            <Check className="size-2.5" strokeWidth={3} aria-hidden="true" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

/** Widget placed on the hero stage, with a connector dot for the energy line. */
export function HeroStageWidget({ widget }: { widget: HeroWidgetConfig }) {
  const chip = widget.variant === 'chip'
  return (
    <div
      data-hero-widget
      className={cn('absolute', chip ? 'hidden md:block' : 'hidden xl:block', widget.placement)}
    >
      <motion.div
        whileHover={hover}
        className={cn(
          'relative border border-line-strong bg-canvas/55 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.8)] backdrop-blur-xl',
          chip ? 'flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5' : 'flex w-60 flex-col gap-3 rounded-card-sm p-4 xl:w-64',
        )}
      >
        {chip ? (
          <>
            <IconBadge widget={widget} size="sm" />
            <span className="text-sm font-semibold whitespace-nowrap text-warm-white">{widget.title}</span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              {widget.visual === 'ring' ? <RingVisual widget={widget} /> : <IconBadge widget={widget} />}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-warm-white">{widget.title}</p>
                {widget.visual === 'ring' && <p className="text-xs leading-snug text-muted">{widget.description}</p>}
              </div>
            </div>
            {widget.visual !== 'ring' && <p className="text-xs leading-snug text-muted">{widget.description}</p>}
            {widget.visual === 'flow' && <FlowVisual />}
            {widget.visual === 'checklist' && <ChecklistVisual />}
          </>
        )}
      </motion.div>
      <Connector id={widget.id} side={widget.connectorSide} />
    </div>
  )
}

/** Widget used in the grid below the illustration: `minimal` (mobile) shows icon + title only. */
export function HeroCompactWidget({ widget, minimal = false }: { widget: HeroWidgetConfig; minimal?: boolean }) {
  return (
    <li data-hero-widget className="flex">
      <motion.div
        whileHover={hover}
        className={cn(
          'flex w-full border border-line bg-card/60 backdrop-blur-md',
          minimal ? 'items-center gap-2.5 rounded-full py-1.5 pr-3 pl-1.5' : 'flex-col gap-2.5 rounded-card-sm p-4',
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <IconBadge widget={widget} size="sm" />
          <p className="text-[0.8125rem] leading-tight font-semibold text-warm-white">{widget.title}</p>
        </div>
        <p className={minimal ? 'sr-only' : 'text-xs leading-snug text-muted'}>{widget.description}</p>
        {!minimal && widget.visual === 'flow' && <FlowVisual />}
      </motion.div>
    </li>
  )
}

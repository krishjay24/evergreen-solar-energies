import { ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'
import { aboutTopics } from './aboutContent'

export function AboutAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion()

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const count = aboutTopics.length
    const next = {
      ArrowDown: (index + 1) % count,
      ArrowUp: (index - 1 + count) % count,
      Home: 0,
      End: count - 1,
    }[event.key]
    if (next === undefined) return
    event.preventDefault()
    buttons.current[next]?.focus()
  }

  return (
    <div className="divide-y divide-line border-y border-line" aria-label="About Evergreen topics">
      {aboutTopics.map((topic, index) => {
        const expanded = openIndex === index
        const Icon = topic.icon
        const triggerId = `${baseId}-trigger-${index}`
        const panelId = `${baseId}-panel-${index}`
        return (
          <div key={topic.title} className="py-1">
            <h3>
              <button
                ref={(node) => { buttons.current[index] = node }}
                type="button"
                id={triggerId}
                aria-controls={panelId}
                aria-expanded={expanded}
                onClick={() => setOpenIndex(expanded ? null : index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className="group flex min-h-17 w-full items-center gap-4 rounded-lg py-3 text-left"
              >
                <span
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full border transition-[color,background-color,border-color] duration-300',
                    expanded
                      ? 'border-gold bg-gold text-canvas'
                      : 'border-gold/30 bg-gold/10 text-gold-accent group-hover:border-gold/70',
                  )}
                >
                  <Icon className="icon-md" aria-hidden="true" />
                </span>
                <span className={cn('flex-1 text-[1.0625rem] font-semibold transition-colors duration-300', expanded ? 'text-gold-accent' : 'text-warm-white group-hover:text-gold-accent')}>
                  {topic.title}
                </span>
                <ChevronDown
                  className={cn('icon-md transition-transform duration-300', expanded ? 'rotate-180 text-gold-accent' : 'text-muted')}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!expanded}
              inert={!expanded}
              initial={false}
              animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <p className="pb-5 pl-14 text-sm leading-7 text-muted">{topic.description}</p>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

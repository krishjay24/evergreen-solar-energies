import { ClipboardCheck, House, Leaf, PanelsTopLeft, Sun, Zap, type LucideIcon } from 'lucide-react'
import type { SolarHouseAnchor } from '@/components/solar/solarHouseGeometry'
import { ROUTES } from '@/config/routes'

export const heroCopy = {
  eyebrow: 'Solar Solutions, Simplified',
  heading: 'MAKE THE SUN WORK FOR YOU.',
  highlightWord: 'SUN',
  description: 'Solar solutions planned around your property, electricity usage and project needs.',
  primaryCta: { label: 'Request a Site Visit', to: ROUTES.siteVisit },
  secondaryCta: { label: 'Explore Solar Solutions', to: ROUTES.solarSolutions },
} as const

export type HeroWidgetVariant = 'chip' | 'card'

export interface HeroWidgetConfig {
  id: SolarHouseAnchor
  title: string
  description: string
  icon: LucideIcon
  variant: HeroWidgetVariant
  /** Which side of the widget the connection line attaches to (facing the house). */
  connectorSide: 'left' | 'right'
  /** Stage placement classes; chips appear at `md`, cards at `xl`. */
  placement: string
  visual?: 'ring' | 'flow' | 'checklist'
}

/**
 * Explanatory widgets – they describe how solar works and what Evergreen does.
 * They deliberately contain no savings figures or power readings.
 */
export const heroWidgets: readonly HeroWidgetConfig[] = [
  {
    id: 'sun-power',
    title: 'Sun Power',
    description: 'Sunlight is a free, renewable fuel that reaches your roof every day.',
    icon: Sun,
    variant: 'chip',
    connectorSide: 'right',
    placement: 'md:left-[3%] md:top-[6%] xl:left-[14%] xl:top-[12%]',
  },
  {
    id: 'rooftop-solar',
    title: 'Rooftop Solar',
    description: 'Unused roof space becomes your own small power station.',
    icon: House,
    variant: 'chip',
    connectorSide: 'left',
    placement: 'md:left-[40%] md:-top-[2%] xl:left-[61%] xl:top-[6%]',
  },
  {
    id: 'solar-panels',
    title: 'Solar Panels',
    description: 'Photovoltaic cells convert sunlight into electricity.',
    icon: PanelsTopLeft,
    variant: 'chip',
    connectorSide: 'left',
    placement: 'md:right-[3%] md:top-[18%] xl:right-[11%] xl:top-[20%]',
  },
  {
    id: 'clean-energy',
    title: 'Clean Energy',
    description: 'No fuel is burned and no emissions are released while panels generate.',
    icon: Leaf,
    variant: 'card',
    connectorSide: 'right',
    placement: 'xl:left-0 xl:top-[30%]',
    visual: 'ring',
  },
  {
    id: 'energy-flow',
    title: 'Energy Flow',
    description: 'Panels produce DC power; an inverter converts it to AC for your home.',
    icon: Zap,
    variant: 'card',
    connectorSide: 'left',
    placement: 'xl:right-0 xl:top-[34%]',
    visual: 'flow',
  },
  {
    id: 'site-assessment',
    title: 'Solar Site Assessment',
    description: 'Every system starts with a survey of your property.',
    icon: ClipboardCheck,
    variant: 'card',
    connectorSide: 'left',
    placement: 'xl:right-0 xl:bottom-[2%]',
    visual: 'checklist',
  },
] as const

export const siteAssessmentChecks = ['Roof structure & space', 'Shading & orientation', 'Electricity usage'] as const
export const energyFlowSteps = ['Panels', 'Inverter', 'Home'] as const

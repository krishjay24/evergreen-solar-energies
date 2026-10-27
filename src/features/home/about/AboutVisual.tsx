import { ArrowUpRight, Sun } from 'lucide-react'
import { SolarPhoto } from '@/components/solar/SolarPhoto'

export function AboutVisual({ page = false }: { page?: boolean }) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] items-end gap-3 sm:gap-4">
      <figure data-about-image className="relative aspect-[4/5] min-w-0 overflow-hidden rounded-card border border-line bg-[#142520]">
        <SolarPhoto photo={page ? 'about-engineers' : 'home-about-team'} className="absolute inset-0 size-full" sizes="(min-width: 1024px) 30vw, 60vw" />
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-linear-to-t from-canvas via-canvas/80 to-transparent px-5 pt-20 pb-5 sm:px-7 sm:pb-7">
          <span className="text-[0.625rem] font-bold tracking-[0.18em] text-gold-accent uppercase">Reference photography</span>
          <span className="text-sm font-semibold text-warm-white sm:text-base">Solar begins with the site.</span>
        </figcaption>
      </figure>
      <figure data-about-image className="relative mb-5 aspect-[3/4] min-w-0 overflow-hidden rounded-card border border-line bg-card sm:mb-8">
        <SolarPhoto photo={page ? 'about-planning' : 'home-about-technology'} className="absolute inset-0 size-full" sizes="(min-width: 1024px) 22vw, 40vw" />
        <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-canvas via-canvas/90 to-transparent px-4 pt-16 pb-4 sm:px-5 sm:pb-5">
          <span className="min-w-0">
            <span className="block text-[0.625rem] font-bold tracking-[0.18em] text-gold-accent uppercase">Reference photography</span>
            <span className="block text-xs font-semibold text-warm-white sm:text-sm">{page ? 'Technical coordination' : 'Solar technology'}</span>
          </span>
          <Sun className="icon-md shrink-0 text-gold" aria-hidden="true" />
        </figcaption>
      </figure>
      <div className="col-span-2 flex items-center justify-end gap-2.5 text-[0.6875rem] tracking-[0.13em] text-muted uppercase">
        <span>Site first. System second.</span>
        <ArrowUpRight className="icon-sm text-gold" aria-hidden="true" />
      </div>
    </div>
  )
}
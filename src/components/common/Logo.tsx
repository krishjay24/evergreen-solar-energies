import { Link } from 'react-router'
import { brandLogo } from '@/config/brand'
import { cn } from '@/lib/cn'

const sizes = {
  header: { image: 'h-28', sizes: '168px' },
  sm: { image: 'h-16', sizes: '96px' },
  md: { image: 'h-28', sizes: '168px' },
  lg: { image: 'h-36', sizes: '216px' },
  xl: { image: 'h-56 md:h-72', sizes: '(min-width: 768px) 432px, 336px' },
} as const

interface LogoProps {
  size?: keyof typeof sizes
  /** Links the logo to the given route (e.g. home). */
  to?: string
  /** Load eagerly, e.g. above the fold in the header. */
  priority?: boolean
  className?: string
}

/** Supplied logo artwork, displayed without masks, filters or added backgrounds. */
export function Logo({ size = 'md', to, priority = false, className }: LogoProps) {
  const s = sizes[size]
  const image = (
    <span className={cn('inline-flex w-fit shrink-0', !to && className)}>
      <img
        src={brandLogo.sources[0].src}
        srcSet={brandLogo.sources.map((source) => `${source.src} ${source.width}w`).join(', ')}
        sizes={s.sizes}
        width={brandLogo.width}
        height={brandLogo.height}
        alt={brandLogo.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
        className={cn('w-auto select-none', s.image)}
        draggable={false}
      />
    </span>
  )

  if (!to) return image
  return (
    <Link to={to} className={cn('inline-flex w-fit shrink-0 rounded-xl', className)}>
      {image}
    </Link>
  )
}

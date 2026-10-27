import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const aspects = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[4/5]',
  wide: 'aspect-[21/9]',
} as const

interface ImageCardProps {
  src: string
  alt: string
  srcSet?: string
  sizes?: string
  aspect?: keyof typeof aspects
  eyebrow?: ReactNode
  title?: ReactNode
  caption?: ReactNode
  priority?: boolean
  className?: string
}

export function ImageCard({ src, alt, srcSet, sizes, aspect = 'portrait', eyebrow, title, caption, priority = false, className }: ImageCardProps) {
  const hasOverlay = Boolean(eyebrow ?? title ?? caption)
  return (
    <figure className={cn('group relative isolate overflow-hidden rounded-card border border-line bg-card', aspects[aspect], className)}>
      <img
        src={src}
        alt={alt}
        {...(srcSet ? { srcSet } : {})}
        {...(sizes ? { sizes } : {})}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
      />
      {hasOverlay && (
        <figcaption className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-linear-to-t from-canvas/95 via-canvas/60 to-transparent p-6 pt-20 md:p-7 md:pt-24">
          {eyebrow && <span className="text-eyebrow font-semibold text-gold-accent uppercase">{eyebrow}</span>}
          {title && <span className="text-title font-semibold text-warm-white">{title}</span>}
          {caption && <span className="text-sm text-muted">{caption}</span>}
        </figcaption>
      )}
    </figure>
  )
}

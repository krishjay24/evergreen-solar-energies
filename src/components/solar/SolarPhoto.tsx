import { photography, type PhotoId } from '@/data/photography'
import { cn } from '@/lib/cn'

interface SolarPhotoProps {
  photo: PhotoId
  className?: string
  sizes?: string
}

/** Licensed reference photography; never a claim of an Evergreen installation. */
export function SolarPhoto({ photo, className, sizes = '(min-width: 1024px) 50vw, 100vw' }: SolarPhotoProps) {
  const asset = photography[photo]
  return (
    <span data-photo={photo} className={cn('relative block overflow-hidden', className)} title="Reference photograph — not an Evergreen installation. Photo credits are linked in the footer.">
      <img
        src={`/images/solar/${photo}-960.webp`}
        srcSet={[480, 960, 1280].map(width => `/images/solar/${photo}-${width}.webp ${width}w`).join(', ')}
        sizes={sizes}
        width={asset.width}
        height={asset.height}
        alt={asset.alt}
        loading="lazy"
        decoding="async"
        className="size-full object-cover"
        style={{ objectPosition: asset.position }}
      />
    </span>
  )
}

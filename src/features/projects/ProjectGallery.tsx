import { ArrowLeft, ArrowRight, Camera, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { IconButton } from '@/components/common/IconButton'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { ROUTES } from '@/config/routes'
import { galleryPhotos } from '@/data/galleryPhotos'
import { publishedProjects, type PublishedProject } from '@/data/projects'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useFocusTrap } from '@/hooks/useFocusTrap'

type GalleryCategory = 'all' | PublishedProject['category']

export function ProjectGallery({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState<GalleryCategory>('all')
  const [selected, setSelected] = useState<{ project: PublishedProject; image: number } | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const categories: GalleryCategory[] = ['all', ...new Set(publishedProjects.map((project) => project.category))]
  const visible = publishedProjects.filter((project) => filter === 'all' || project.category === filter)
  const close = useCallback(() => { setSelected(null); setSelectedPhoto(null) }, [])
  const open = selected !== null || selectedPhoto !== null
  const images = selected?.project.images ?? galleryPhotos
  const imageIndex = selected?.image ?? selectedPhoto ?? 0
  const title = selected?.project.title ?? 'Solar site photos'
  const moveImage = (direction: number) => {
    if (selected) setSelected({ ...selected, image: (selected.image + direction + images.length) % images.length })
    else setSelectedPhoto((current) => current === null ? null : (current + direction + images.length) % images.length)
  }

  useBodyScrollLock(open)
  useFocusTrap(dialog, open, { onEscape: close, returnFocusTo: opener })
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      setSelected((current) => current && {
        ...current,
        image: (current.image + (event.key === 'ArrowRight' ? 1 : -1) + current.project.images.length) % current.project.images.length,
      })
      setSelectedPhoto((current) => current === null ? null : (current + (event.key === 'ArrowRight' ? 1 : -1) + galleryPhotos.length) % galleryPhotos.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <Section tone={compact ? 'alt' : 'default'}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            as={compact ? 'h2' : 'h1'}
            eyebrow={compact ? 'Solar gallery' : 'Photo gallery'}
            title={compact ? 'Solar, up close.' : 'See solar from a closer perspective.'}
            description="Explore solar site photographs shared for this gallery. Project ownership and customer approval have not been verified, so these photos are not presented as Evergreen installations."
          />
          {compact && <PrimaryButton to={ROUTES.projects}>View all photos</PrimaryButton>}
        </div>
        <div className={`mt-9 grid gap-4 ${compact ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`} aria-label="Solar site photos">
          {galleryPhotos.slice(0, compact ? 3 : undefined).map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              onClick={(event) => { opener.current = event.currentTarget; setSelectedPhoto(index) }}
              className="group surface-card relative block aspect-[4/3] overflow-hidden bg-card text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              aria-label={`View photo ${index + 1} of ${galleryPhotos.length}: ${photo.alt}`}
            >
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" className="size-full object-contain" />
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-canvas/85 to-transparent px-5 pb-4 pt-10 text-sm font-semibold text-warm-white">
                Photo {String(index + 1).padStart(2, '0')} <span className="text-gold-accent">/ {galleryPhotos.length}</span>
              </span>
            </button>
          ))}
        </div>
        {!compact && <p className="mt-5 text-sm leading-6 text-muted">Images are shared as solar site photography. Installation attribution, project details and permission to identify customers remain pending verification.</p>}
        {!compact && publishedProjects.length > 0 && <h2 className="mt-16 text-title">Approved project stories</h2>}
        {!compact && categories.length > 1 && (
          <div className="mt-9 flex flex-wrap gap-2" aria-label="Filter projects">
            {categories.map((category) => (
              <button key={category} type="button" aria-pressed={filter === category} onClick={() => setFilter(category)} className={`rounded-full border px-5 py-2 text-sm font-semibold capitalize transition-colors ${filter === category ? 'border-gold bg-gold text-canvas' : 'border-line-strong text-muted hover:text-warm-white'}`}>
                {category === 'all' ? 'All Projects' : category}
              </button>
            ))}
          </div>
        )}
        {!compact && visible.length === 0 ? (
          <p className="mt-10 rounded-card border border-line bg-card px-6 py-5 text-sm text-muted">
            <Camera className="mr-2 inline size-5 text-gold" aria-hidden="true" />
            No customer-approved Evergreen project stories published yet. We will add project details after verification and permission to publish.
          </p>
        ) : visible.length > 0 && (
          <div className={`mt-9 grid gap-4 ${compact ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
            {visible.slice(0, compact ? 3 : undefined).map((project, index) => (
              <article key={project.id} className={`group surface-card overflow-hidden ${compact && index === 0 ? 'md:row-span-2' : ''}`}>
                <button
                  type="button"
                  ref={(element) => { if (selected?.project.id === project.id) opener.current = element }}
                  onClick={(event) => { opener.current = event.currentTarget; setSelected({ project, image: 0 }) }}
                  className="relative block aspect-[4/3] w-full overflow-hidden text-left"
                  aria-label={`Open images for ${project.title}`}
                >
                  <img src={project.images[0]!.src} alt={project.images[0]!.alt} width={project.images[0]!.width} height={project.images[0]!.height} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </button>
                <div className="p-6">
                  <p className="text-xs font-semibold text-gold-accent capitalize">{project.category} · {project.location}</p>
                  <h3 className="mt-2 text-title">{project.title}</h3>
                  {project.capacityVerified && project.capacity && <p className="mt-2 text-sm text-gold-accent">Verified system capacity: {project.capacity}</p>}
                  <p className="mt-2 text-sm text-muted">{project.summary}</p>
                  {project.challenge && <p className="mt-3 text-sm text-muted"><span className="font-semibold text-warm-white">Challenge: </span>{project.challenge}</p>}
                  {project.solution && <p className="mt-3 text-sm text-muted"><span className="font-semibold text-warm-white">Solution: </span>{project.solution}</p>}
                  <Link className="mt-5 inline-block text-sm font-semibold text-gold-accent" to={`${ROUTES.projects}/${project.id}`}>Project details</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-canvas/95 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
            <div ref={dialog} role="dialog" aria-modal="true" aria-label={`${title} gallery`} className="w-full max-w-5xl">
              <div className="mb-4 flex items-center justify-between gap-4 text-sm text-warm-white">
                <span>{title} · {imageIndex + 1} / {images.length}</span>
                <IconButton icon={X} label="Close gallery" onClick={close} />
              </div>
              <img
                key={images[imageIndex]!.src}
                src={images[imageIndex]!.src}
                alt={images[imageIndex]!.alt}
                width={images[imageIndex]!.width}
                height={images[imageIndex]!.height}
                className="max-h-[70dvh] w-full rounded-card object-contain"
              />
              <div className="mt-4 flex justify-end gap-2">
                <IconButton icon={ArrowLeft} label="Previous image" disabled={images.length < 2} onClick={() => moveImage(-1)} />
                <IconButton icon={ArrowRight} label="Next image" disabled={images.length < 2} onClick={() => moveImage(1)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

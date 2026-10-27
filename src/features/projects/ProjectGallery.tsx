import { ArrowLeft, ArrowRight, Camera, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { IconButton } from '@/components/common/IconButton'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { ROUTES } from '@/config/routes'
import { publishedProjects, type PublishedProject } from '@/data/projects'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useFocusTrap } from '@/hooks/useFocusTrap'

type GalleryCategory = 'all' | PublishedProject['category']

export function ProjectGallery({ compact = false }: { compact?: boolean }) {
  const [filter, setFilter] = useState<GalleryCategory>('all')
  const [selected, setSelected] = useState<{ project: PublishedProject; image: number } | null>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const categories: GalleryCategory[] = ['all', ...new Set(publishedProjects.map((project) => project.category))]
  const visible = publishedProjects.filter((project) => filter === 'all' || project.category === filter)
  const close = () => setSelected(null)

  useBodyScrollLock(selected !== null)
  useFocusTrap(dialog, selected !== null, { onEscape: close, returnFocusTo: opener })
  useEffect(() => {
    if (!selected) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      setSelected((current) => current && {
        ...current,
        image: (current.image + (event.key === 'ArrowRight' ? 1 : -1) + current.project.images.length) % current.project.images.length,
      })
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <>
      <Section tone={compact ? 'alt' : 'default'}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            as={compact ? 'h2' : 'h1'}
            eyebrow={compact ? 'Our projects' : 'Project gallery'}
            title={compact ? 'Real installations. Real permission.' : 'Projects worth sharing, with permission.'}
            description="Only documented, customer-approved Evergreen installations will appear here."
          />
          {compact && <PrimaryButton to={ROUTES.projects}>View all projects</PrimaryButton>}
        </div>
        {!compact && categories.length > 1 && (
          <div className="mt-9 flex flex-wrap gap-2" aria-label="Filter projects">
            {categories.map((category) => (
              <button key={category} type="button" aria-pressed={filter === category} onClick={() => setFilter(category)} className={`rounded-full border px-5 py-2 text-sm font-semibold capitalize transition-colors ${filter === category ? 'border-gold bg-gold text-canvas' : 'border-line-strong text-muted hover:text-warm-white'}`}>
                {category === 'all' ? 'All Projects' : category}
              </button>
            ))}
          </div>
        )}
        {visible.length === 0 ? (
          <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-card border border-line bg-card px-6 py-12 text-center">
            <Camera className="size-10 text-gold" aria-hidden="true" />
            <h3 className="mt-5 text-title">No customer-approved projects published yet.</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              We will add genuine installation details and images here when they have been verified and approved for publication. Stock imagery is not shown as our work.
            </p>
            {compact && <Link to={ROUTES.projects} className="mt-5 text-sm font-semibold text-gold-accent hover:text-warm-white">Visit the project gallery</Link>}
          </div>
        ) : (
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
        {selected && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-canvas/95 p-4 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
            <div ref={dialog} role="dialog" aria-modal="true" aria-label={`${selected.project.title} images`} className="w-full max-w-5xl">
              <div className="mb-4 flex items-center justify-between gap-4 text-sm text-warm-white">
                <span>{selected.project.title} · {selected.image + 1} / {selected.project.images.length}</span>
                <IconButton icon={X} label="Close gallery" onClick={close} />
              </div>
              <img
                key={selected.project.images[selected.image]!.src}
                src={selected.project.images[selected.image]!.src}
                alt={selected.project.images[selected.image]!.alt}
                width={selected.project.images[selected.image]!.width}
                height={selected.project.images[selected.image]!.height}
                className="max-h-[70dvh] w-full rounded-card object-contain"
              />
              <div className="mt-4 flex justify-end gap-2">
                <IconButton icon={ArrowLeft} label="Previous image" disabled={selected.project.images.length < 2} onClick={() => setSelected({ ...selected, image: (selected.image - 1 + selected.project.images.length) % selected.project.images.length })} />
                <IconButton icon={ArrowRight} label="Next image" disabled={selected.project.images.length < 2} onClick={() => setSelected({ ...selected, image: (selected.image + 1) % selected.project.images.length })} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

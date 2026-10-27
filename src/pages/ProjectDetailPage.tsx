import { useParams } from 'react-router'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { publishedProjects } from '@/data/projects'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const project = publishedProjects.find((item) => item.id === id)
  useDocumentTitle(project?.title ?? 'Project not found')
  if (!project) return <ErrorState title="Project not available" message="No approved installation is published at this address." status={404} />
  return (
    <Section>
      <SectionHeading as="h1" eyebrow={`${project.category} · ${project.location}`} title={project.title} description={project.summary} />
      {project.capacityVerified && project.capacity && <p className="mt-6 text-sm text-gold-accent">Verified system capacity: {project.capacity}</p>}
      {(project.challenge || project.solution) && <div className="mt-8 grid gap-6 md:grid-cols-2">
        {project.challenge && <div className="surface-card p-6"><h2 className="text-title">Project challenge</h2><p className="mt-3 text-sm leading-7 text-muted">{project.challenge}</p></div>}
        {project.solution && <div className="surface-card p-6"><h2 className="text-title">Solution</h2><p className="mt-3 text-sm leading-7 text-muted">{project.solution}</p></div>}
      </div>}
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {project.images.map((image) => <img key={image.src} {...image} loading="lazy" className="w-full rounded-card object-contain" />)}
      </div>
    </Section>
  )
}

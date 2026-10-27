import { ProjectGallery } from '@/features/projects/ProjectGallery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ProjectsPage() {
  useDocumentTitle('Projects')
  return <ProjectGallery />
}

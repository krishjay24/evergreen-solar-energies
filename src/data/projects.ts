import type { ServiceId } from './services'

export interface PublishedProject {
  id: string
  title: string
  category: ServiceId
  location: string
  summary: string
  images: readonly { src: string; alt: string; width: number; height: number }[]
  capacity?: string
  capacityVerified?: boolean
  challenge?: string
  solution?: string
  date?: string
  customerApproved: boolean
  featured: boolean
}

// Add only documented installations with the customer's permission to publish.
export const projects: readonly PublishedProject[] = []
export const publishedProjects = projects.filter((project) => project.customerApproved && project.images.length > 0)

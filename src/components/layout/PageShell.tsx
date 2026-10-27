import type { ReactNode } from 'react'
import { Reveal } from '@/components/animations/Reveal'
import { SectionHeading } from '@/components/common/SectionHeading'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Section } from './Section'

interface PageShellProps {
  title: string
  eyebrow: string
  description: ReactNode
  children?: ReactNode
}

/** Standard page intro used by interior pages until their full content is implemented. */
export function PageShell({ title, eyebrow, description, children }: PageShellProps) {
  useDocumentTitle(title)

  return (
    <>
      <Section>
        <Reveal>
          <SectionHeading as="h1" size="lg" eyebrow={eyebrow} title={title} description={description} />
        </Reveal>
      </Section>
      {children}
    </>
  )
}

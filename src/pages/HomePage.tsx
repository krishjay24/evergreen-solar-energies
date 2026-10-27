import { CTASection } from '@/components/common/CTASection'
import { AboutSection } from '@/features/home/about/AboutSection'
import { HeroSection } from '@/features/home/hero/HeroSection'
import { ImpactSection } from '@/features/home/impact/ImpactSection'
import { JourneySection } from '@/features/home/journey/JourneySection'
import { ServicesSection } from '@/features/services/ServicesSection'
import { ProjectGallery } from '@/features/projects/ProjectGallery'
import { FAQSection } from '@/features/learning/FAQSection'
import { LearningSection } from '@/features/learning/LearningSection'
import { NewsletterSection } from '@/features/learning/NewsletterSection'
import { ROUTES } from '@/config/routes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function HomePage() {
  useDocumentTitle()

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <ImpactSection />
      <JourneySection />
      <ProjectGallery compact />
      <CTASection eyebrow="Solar Fit Assessment" title="Plan from the property outward." description="Share your project details before discussing a site-specific solar proposal." primaryAction={{ label: 'Explore Solar Fit', to: ROUTES.quote }} secondaryAction={{ label: 'Contact us', to: ROUTES.contact }} />
      <FAQSection compact />
      <LearningSection compact />
      <NewsletterSection />
      <CTASection eyebrow="Let's connect" title="Rooted in Nature. Powered by the Sun." description="Discuss what could work for your site in Kadapa, Mydukur or Proddatur." primaryAction={{ label: 'Request a Site Visit', to: ROUTES.siteVisit }} secondaryAction={{ label: 'Email Evergreen', href: 'mailto:evergreensolarenergies@gmail.com' }} />
    </>
  )
}

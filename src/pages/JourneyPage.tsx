import { JourneySection } from '@/features/home/journey/JourneySection'
import { FAQSection } from '@/features/learning/FAQSection'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function JourneyPage() {
  useDocumentTitle('How It Works')
  return <><JourneySection page /><FAQSection compact /></>
}

import { FAQSection } from '@/features/learning/FAQSection'
import { LearningSection } from '@/features/learning/LearningSection'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function LearningPage() {
  useDocumentTitle('Solar Learning Hub')
  return <><LearningSection /><FAQSection /></>
}

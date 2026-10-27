import { Link, useParams } from 'react-router'
import { ErrorState } from '@/components/common/ErrorState'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { ROUTES } from '@/config/routes'
import { articles, getArticle } from '@/data/learning'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { SolarPhoto } from '@/components/solar/SolarPhoto'
import { articlePhotos } from '@/data/photography'

export default function ArticlePage() {
  const { slug } = useParams()
  const article = getArticle(slug ?? '')
  useDocumentTitle(article?.title ?? 'Article not found')
  if (!article) return <ErrorState status={404} title="Article not found" message="This article is not available." actions={<Link to={ROUTES.learning} className="btn-primary">All articles</Link>} />
  const related = articles.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 2)
  return (
    <>
      <Section tone="alt" container="narrow">
        <SectionHeading as="h1" size="lg" eyebrow={article.category} title={article.title} description={article.summary} />
        <p className="mt-5 text-sm text-muted">General education · Confirm current rules and project details before making decisions.</p>
        <figure className="mt-8 overflow-hidden rounded-card border border-line">
          <SolarPhoto photo={articlePhotos[article.slug]!} className="aspect-[16/9] w-full" sizes="(min-width: 1024px) 800px, 100vw" />
          <figcaption className="bg-card px-5 py-3 text-xs text-muted">Reference photography · Not an Evergreen installation.</figcaption>
        </figure>
      </Section>
      <Section container="narrow">
        <article className="space-y-6">
          {article.paragraphs.map((paragraph) => <p key={paragraph} className="text-lead leading-9 text-warm-white/85">{paragraph}</p>)}
        </article>
        {related.length > 0 && (
          <div className="mt-16 border-t border-line pt-8">
            <h2 className="text-title">Related reading</h2>
            <ul className="mt-5 space-y-3">
              {related.map((item) => <li key={item.slug}><Link to={`${ROUTES.learning}/${item.slug}`} className="text-gold-accent hover:text-warm-white">{item.title}</Link></li>)}
            </ul>
          </div>
        )}
      </Section>
    </>
  )
}

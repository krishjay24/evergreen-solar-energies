import { ArrowRight, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { PrimaryButton } from '@/components/common/PrimaryButton'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Section } from '@/components/layout/Section'
import { SolarPhoto } from '@/components/solar/SolarPhoto'
import { ROUTES } from '@/config/routes'
import { articleCategories, articles } from '@/data/learning'
import { articlePhotos } from '@/data/photography'

export function LearningSection({ compact = false }: { compact?: boolean }) {
  const ArticleHeading = compact ? 'h3' : 'h2'
  const [category, setCategory] = useState<string>('All')
  const visible = articles.filter((article) => category === 'All' || article.category === category)
  return (
    <Section id="learning" tone="default">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading as={compact ? 'h2' : 'h1'} eyebrow="Solar learning" title="Understand the energy behind the decision." description="Educational guides to help you ask better questions before a site assessment." />
        {compact && <PrimaryButton to={ROUTES.learning}>Explore the learning hub</PrimaryButton>}
      </div>
      {!compact && (
        <div className="mt-8 flex flex-wrap gap-2" aria-label="Filter articles">
          {articleCategories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${category === item ? 'border-gold bg-gold text-canvas' : 'border-line-strong text-muted hover:text-warm-white'}`}>
              {item}
            </button>
          ))}
        </div>
      )}
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.slice(0, compact ? 3 : undefined).map((article) => (
          <article key={article.slug} className="group surface-card overflow-hidden">
            <Link to={`${ROUTES.learning}/${article.slug}`} className="block" aria-label={`Read ${article.title}`}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <SolarPhoto photo={articlePhotos[article.slug]!} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" />
                <span className="absolute bottom-3 left-3 rounded-full bg-canvas/80 px-3 py-1 text-xs">Reference photo</span>
              </div>
              <div className="p-6">
                <span className="flex items-center gap-2 text-xs font-semibold tracking-widest text-gold-accent uppercase"><BookOpen className="icon-sm" aria-hidden="true" />{article.category}</span>
                <ArticleHeading className="mt-4 text-title group-hover:text-gold-accent">{article.title}</ArticleHeading>
                <p className="mt-3 text-sm leading-7 text-muted">{article.summary}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold-accent">Read more <ArrowRight className="icon-sm" aria-hidden="true" /></span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </Section>
  )
}

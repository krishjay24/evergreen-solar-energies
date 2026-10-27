export interface Article {
  slug: string
  title: string
  category: 'Solar Basics' | 'Installation' | 'Maintenance' | 'Energy Savings' | 'Guides'
  summary: string
  paragraphs: readonly string[]
}

export const articles: readonly Article[] = [
  {
    slug: 'how-rooftop-solar-works',
    title: 'How does rooftop solar work?',
    category: 'Solar Basics',
    summary: 'A straightforward look at panels, inverters and the electricity your property uses.',
    paragraphs: [
      'Photovoltaic cells in solar panels convert daylight into direct-current (DC) electricity. An inverter converts it into alternating-current (AC) electricity suitable for the property.',
      'System suitability depends on usable roof area, shading, structural condition and electricity use. The output varies with weather, orientation, equipment and maintenance.',
      'How excess electricity is treated depends on the connection arrangement and rules applicable to the site. A site assessment is the starting point for a tailored proposal.',
    ],
  },
  {
    slug: 'preparing-for-a-solar-site-review',
    title: 'Preparing for a solar site review',
    category: 'Installation',
    summary: 'What to know about your roof or land before discussing a proposed system.',
    paragraphs: [
      'A site review considers available area, orientation, shade from nearby structures or trees, roof condition and safe installation access.',
      'If available, recent electricity bills and information about the electrical connection help explain how the property uses power. You do not need to share private documents before you are comfortable doing so.',
      'The findings inform a system proposal; a quotation should reflect the actual scope and any applicable approvals.',
    ],
  },
  {
    slug: 'on-grid-and-hybrid-solar',
    title: 'On-grid and hybrid solar: the basics',
    category: 'Solar Basics',
    summary: 'Learn how grid-connected systems differ from systems that include storage.',
    paragraphs: [
      'An on-grid solar system operates alongside the electricity grid. Its inverter and connection are designed for the approved arrangement at that property.',
      'A hybrid system may include batteries or other storage and different control equipment. Storage suitability and costs require a separate technical and commercial assessment.',
      'This article is general education, not a statement that Evergreen supplies a particular battery or hybrid product. Ask about the options relevant to your site.',
    ],
  },
  {
    slug: 'solar-panel-care',
    title: 'What does a solar system need over time?',
    category: 'Maintenance',
    summary: 'Keeping panels clear and knowing when to call a qualified professional.',
    paragraphs: [
      'Dust, debris and shade can affect a solar array. Visual checks and appropriate cleaning depend on access, equipment guidance and site safety.',
      'Do not access a rooftop or electrical equipment without suitable training and safety precautions. Contact a qualified professional if a fault or damage is suspected.',
      'Follow the documentation supplied for the actual system. Maintenance needs differ by site and equipment.',
    ],
  },
  {
    slug: 'understanding-solar-and-your-bill',
    title: 'Solar and your electricity bill',
    category: 'Energy Savings',
    summary: 'Why bill reduction is possible but cannot be guaranteed from a generic estimate.',
    paragraphs: [
      'Solar can offset a portion of electricity drawn from the grid, particularly when generation and daytime use overlap.',
      'Actual bill changes depend on consumption patterns, system size, generation, tariffs, fixed charges and applicable connection arrangements. A past bill alone cannot guarantee a saving.',
      'A site and usage assessment is necessary before making project-specific projections. Treat any general example as educational, not a quotation.',
    ],
  },
  {
    slug: 'roof-suitability-checklist',
    title: 'Is your roof suitable for solar?',
    category: 'Guides',
    summary: 'A practical checklist for space, shade, condition and access.',
    paragraphs: [
      'Start with an approximate idea of usable roof area. Water tanks, equipment and setback requirements may reduce the space available for panels.',
      'Observe shade at different times of day, but remember that seasonal conditions can change. Roof age and structural condition also matter.',
      'A qualified site review is needed to determine suitability and the appropriate mounting approach.',
    ],
  },
  {
    slug: 'government-schemes-and-approvals',
    title: 'How to check current solar schemes and approvals',
    category: 'Guides',
    summary: 'Where to verify rules without relying on outdated subsidy claims.',
    paragraphs: [
      'Subsidies, eligibility, net-metering rules and approval processes can change. They also vary by project type and location.',
      'Check the current official government and electricity-distribution-company sources for your property before relying on an incentive or application process.',
      'Evergreen can discuss applicable project requirements during a site review; this guide does not guarantee eligibility, a subsidy or approval.',
    ],
  },
]

export const articleCategories = ['All', ...new Set(articles.map((article) => article.category))] as const
export const getArticle = (slug: string) => articles.find((article) => article.slug === slug)

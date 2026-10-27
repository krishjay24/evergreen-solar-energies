import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router'
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary'
import { RootLayout } from '@/components/layout/RootLayout'
import { ROUTES } from '@/config/routes'

const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default })

export const appRoutes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    hydrateFallbackElement: null,
    children: [
      { index: true, lazy: page(() => import('@/pages/HomePage')) },
      { path: ROUTES.solarSolutions, lazy: page(() => import('@/pages/SolarSolutionsPage')) },
      { path: ROUTES.journey, lazy: page(() => import('@/pages/JourneyPage')) },
      { path: ROUTES.projects, lazy: page(() => import('@/pages/ProjectsPage')) },
      { path: `${ROUTES.projects}/:id`, lazy: page(() => import('@/pages/ProjectDetailPage')) },
      { path: ROUTES.learning, lazy: page(() => import('@/pages/LearningPage')) },
      { path: `${ROUTES.learning}/:slug`, lazy: page(() => import('@/pages/ArticlePage')) },
      { path: ROUTES.about, lazy: page(() => import('@/pages/AboutPage')) },
      { path: ROUTES.contact, lazy: page(() => import('@/pages/ContactPage')) },
      { path: ROUTES.quote, lazy: page(() => import('@/pages/QuotePage')) },
      { path: ROUTES.privacy, lazy: page(() => import('@/pages/PrivacyPage')) },
      { path: ROUTES.terms, lazy: page(() => import('@/pages/TermsPage')) },
      ...(import.meta.env.DEV ? [{ path: ROUTES.styleGuide, lazy: page(() => import('@/pages/StyleGuidePage')) }] : []),
      { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
    ],
  },
]


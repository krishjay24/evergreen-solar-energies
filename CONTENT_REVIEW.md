# Evergreen requirements review

Reviewed against the requirements and exact content pasted in chat. The original five-page PDF and SolarBloom screenshot were not available locally; page-by-page PDF and visual-reference comparison remain unverified. No business verification flag was enabled.

| Requirement | Status | Relevant file | Correction / remaining action |
| --- | --- | --- | --- |
| Exact hero heading, description and CTAs | Complete | `src/features/home/hero/heroContent.ts` | Matches supplied wording; existing CTAs preserved. |
| Three service categories | Complete | `src/data/services.ts` | Residential rooftop, commercial and agricultural/ground-mounted enquiries present. |
| Company introduction | Complete | `src/features/home/about/aboutContent.ts` | Covers assessment, planning, equipment coordination and installation support. |
| Four trust elements | Complete | `src/features/home/impact/ImpactSection.tsx` | Transparent process, equipment clarity, real project proof and local support present. |
| Discover → Understand → Assess → Connect | Complete | `src/features/home/journey/JourneySection.tsx` | Separate customer journey retained. |
| Five installation stages | Complete | `src/features/home/journey/JourneySection.tsx` | Corrected final label to “Installation and Commissioning”. |
| Five Solar Fit stages | Complete | `src/features/enquiries/SolarFitForm.tsx` | About You, Your Project, Your Site, Your Usage, Next Step. |
| Optional photos and validation | Complete | `src/features/enquiries/SolarFitForm.tsx`, `netlify/lib/enquiries.mjs` | Photos optional; max 3 JPG/PNG/WebP, 3 MB combined; server checks file signatures. |
| Six preparation checklist items | Complete | `src/pages/QuotePage.tsx` | Added bill, address, photos, space, ownership/permission and major loads; no new mandatory fields. |
| Quotation statement | Complete | `src/features/enquiries/SolarFitForm.tsx`, `src/pages/TermsPage.tsx` | Exact supplied sentence retained. |
| Pricing factors and compliance variation | Complete | `src/features/enquiries/SolarFitForm.tsx` | Added capacity/equipment factors and project/scheme/local DISCOM variation; explicitly excludes guarantees. |
| Project story support | Complete | `src/data/projects.ts`, `src/features/projects/ProjectGallery.tsx`, `src/pages/ProjectDetailPage.tsx` | Added optional challenge/solution and verified-capacity display. Location and approved images already supported. |
| Genuine project content | Needs Client Data | `src/data/projects.ts` | Supply verified facts and customer-approved photos; empty state preserved. |
| Business name, tagline, areas, email, address | Complete | `src/config/site.ts` | Matches pasted content; Kadapa, Mydukur and Proddatur consistent. |
| Business verification | Needs Client Data | `.env.example`, `src/components/layout/RouteMetadata.tsx` | Client must confirm all details before enabling verification/indexing. |
| WhatsApp 6300182036 | Complete | `src/config/site.ts`, `src/lib/contact.ts` | Confirmed default targets `916300182036`; existing local override targets the same number. |
| Sticky mobile Call/WhatsApp; Back to Top | Complete | `src/components/layout/FloatingActions.tsx` | Added Call from existing phone config; shared vertical stack and safe-area offset. |
| Short enquiry near homepage top | Partial | `src/features/home/hero/HeroSection.tsx`, `src/pages/HomePage.tsx` | Client requested removal of the compact homepage card. The hero link to the existing full Solar Fit workflow remains; no inline homepage form is rendered. |
| Full Contact form and site-visit CTA | Complete | `src/features/enquiries/ContactForm.tsx`, `src/pages/ContactPage.tsx`, `src/config/routes.ts` | Existing `/contact#site-visit` route and form retained. |
| Success only after confirmed submission | Partial | `src/features/enquiries/ContactForm.tsx`, `src/features/enquiries/SolarFitForm.tsx`, `netlify/lib/enquiries.mjs` | Source requires successful receipt; offline tests pass. Actual delivery requires configured Netlify/Resend and live testing. |
| Required page coverage | Partial | `src/app/router.tsx` | Home, About, Solutions, Journey, Projects, Learning, Contact and Solar Fit exist, plus policy/terms. Original PDF needed to confirm its exact seven-page grouping. |
| Trustworthy content | Complete | `src/data/`, `src/features/home/` | No fabricated published projects/testimonials, brands or guaranteed outcomes found in reviewed content. |
| Hero direction and presentation | Partial | `src/features/home/hero/HeroConnections.tsx`, `HeroSection.tsx` | Sun particle reversed toward roof; informational connector particles removed; white heading retained. Exact SolarBloom screenshot comparison unavailable. |
| SEO and production URL | Needs Client Data | `scripts/generate-sitemap.mjs`, `src/components/layout/RouteMetadata.tsx` | Confirm HTTPS domain and business details; build intentionally keeps sitemap/indexing gated until configured. |
| Analytics | Partial | `src/lib/analytics.ts` | Event hook only; provider/consent configuration and live validation outstanding. |
| Admin/content management | Missing | `CONTENT_MANAGEMENT.md` | Typed source content only; no authenticated admin/CMS exists. Provision separately if required. |
| Privacy policy | Partial | `src/pages/PrivacyPage.tsx` | Existing draft needs final provider, retention and removal details approved before launch. |
| Security/backend launch checks | Partial | `netlify.toml`, `netlify/lib/enquiries.mjs` | Offline tests pass; no private-key/API-key patterns found in inspected frontend source/build. Hosted secrets, rate limiting and delivery need live verification. |
| Newsletter | Partial | `src/features/learning/NewsletterSection.tsx` | Requires endpoint and unsubscribe URL; not represented as connected. |

Production checklist:

- **Ready:** Netlify build/publish, SPA fallback, both Function entry points, offline validation, WhatsApp link target, responsive logo derivatives and SVG illustrations.
- **Requires configuration:** Functions-scoped `RESEND_API_KEY`, `ENQUIRY_EMAIL_FROM`, `ENQUIRY_ALLOWED_ORIGIN`; newsletter endpoint/unsubscribe URL; analytics provider; authenticated CMS/admin if required.
- **Requires client content:** verified production URL/business details, approved project facts/photos, final privacy provider/retention/removal details, original PDF/reference for exact comparison.
- **Requires live testing:** deployed Function routing, sender-domain setup, email delivery/attachments, rate limiting, phone/WhatsApp app handoffs, production sitemap/SEO, subscriptions and analytics.

Changed files: `src/features/home/hero/HeroConnections.tsx`, `HeroSection.tsx`; `src/components/layout/FloatingActions.tsx`; `src/config/site.ts`; `src/lib/contact.ts`; `.env.example`; `src/features/home/journey/JourneySection.tsx`; `src/pages/QuotePage.tsx`; `src/features/enquiries/SolarFitForm.tsx`; `src/data/projects.ts`; `src/features/projects/ProjectGallery.tsx`; `src/pages/ProjectDetailPage.tsx`; `scripts/verify-site.mjs`; `CONTENT_MANAGEMENT.md`; this report. Generated `dist/` and ignored local browser screenshots/results were refreshed.

Validation: lint and production build passed after code corrections; all 13 offline enquiry tests passed. Chrome passed homepage layout/floating-action checks at 360, 390, 430, 768, 1024 and 1440px; internal-route overflow checks passed except one initial 1440px Solar Fit navigation timeout. Subsequent Solar Fit visits, all five form steps, photo-size validation and its desktop screenshot succeeded. Mobile navigation, FAQ, service interactions, carousel, journey, gallery empty state, Contact validation, WhatsApp targets, sunlight direction, off-screen animation pausing and reduced motion passed. No browser runtime exceptions were reported. The browser suite therefore exited with one recorded timeout rather than a clean pass; see `browser-review.local/results.json`.

Not tested: exact PDF/SolarBloom reference comparison, native phone/WhatsApp handoffs, populated project gallery/lightbox with approved client content, actual Netlify/Resend delivery, live subscriptions/analytics and authenticated admin access. Standalone hero/About test runs were interrupted; the combined browser review above completed. No customer emails sent, deployment or GitHub push performed.

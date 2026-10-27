# Evergreen Solar Energies — SEO implementation

Reviewed 28 October 2026. Local work only; no deployment, GitHub push or production credentials added.

## Completed

- One metadata resolver, `src/lib/seo.ts`, supplies initial HTML and client navigation: unique titles/descriptions, canonical URLs, robots, Open Graph, Twitter large-image cards and JSON-LD. Existing title callers use the same resolver.
- The existing sitemap build step now prerenders the **actual existing React components** for 10 main pages, 7 Learning Hub articles and a separate 404. Route definitions are shared with the browser router; no parallel content templates or browser dependency. Existing client mounting/animations remain in place, with static HTML retained until the lazy route is ready.
- The sitemap is generated from current public page/article/approved-project data on each build, rather than regex-extracting article source. No invented update dates. Future approved projects enter automatically; the current gallery remains empty.
- Netlify publishes `dist`; generated `_redirects` serves unknown routes with **404**, while existing route files take precedence. No catch-all SPA 200 rewrite. Generated `_headers` cache hashed assets immutably and images for one hour; HTML retains Netlify's default revalidation.
- Each public route gets a **1200×630 JPEG** sharing image, generated with existing Sharp, the approved logo and licensed site photography. Images are about **65–128 KB** each and label the photography as reference material. No installation claims or invented projects.
- Verified publication enables Organization/LocalBusiness, WebSite, BreadcrumbList, three Service records and applicable Article markup. One Kadapa business address; Mydukur and Proddatur are service areas, not invented offices. No reviews, ratings, opening hours, coordinates, certifications, bylines or publication dates were fabricated.
- Existing responsive images, alt text and intrinsic dimensions are retained. The article lead image now loads eagerly with high priority instead of lazy loading. Learning Hub article headings follow its H1 at H2; homepage cards retain H3. No-JavaScript reveal fallback exposes text without changing client animations.
- Optional anonymous event bridge covers `page_view`, `phone_click`, `email_click`, `whatsapp_click`, and `enquiry_confirmed` after a valid online receipt. Contact/assessment confirmation channels are distinct. WhatsApp opening never counts as a confirmed enquiry. Existing service/assessment event hooks remain available.
- Events include only `{ name, path, channel? }`. Only known routes are included; unknown paths become `/404`. No query/hash strings, form values, photos, phone numbers, WhatsApp URLs or receipt identifiers. Analytics is off by default and respects Do Not Track and Global Privacy Control. No analytics scripts, cookies, storage or network provider were added; privacy wording explains the integration.

## Publication/configuration required

1. Set **`VITE_SITE_URL`** to the client's actual HTTPS production origin, with no path, query, credentials or fragment. No example domain is embedded in production. Rebuild after changes.
2. Verify the central company name, address, primary/secondary phone, email and service areas with the client before setting **`VITE_BUSINESS_DETAILS_VERIFIED=true`**. Until then, indexing stays disabled and business schema is omitted. Without a production origin, absolute canonical/social URLs are intentionally omitted.
3. Netlify deploy previews/branch deploys remain noindex even when production business details are verified. The published production context enables the sitemap, robots access and indexing metadata. With incomplete configuration, builds still contain full page content but emit blocking robots/noindex headers and omit the sitemap.
4. Confirm the Netlify primary domain and HTTPS redirects; redirect aliases to that primary domain in hosting settings. Check live nested pages, 404 statuses, response headers and image URLs after an authorized deployment. The local static-host tests model these rules; they do not prove Netlify's live behavior.
5. **Existing backend blocker:** `netlify/functions/` and `netlify/lib/enquiries.mjs` were absent at review start. The SEO work does not recreate them. Restore the approved backend source and its server-only configuration before relying on online submissions. Never put Resend credentials into `VITE_` variables.

## Google and analytics setup

- In [Google Search Console](https://support.google.com/webmasters/answer/9008080), add the real domain property and complete Google's DNS ownership verification. Keep the verification record. No Google account actions were performed.
- After the verified production build is live, submit **`sitemap.xml`** using the [Sitemaps report](https://support.google.com/webmasters/answer/7451001). Use [URL Inspection](https://support.google.com/webmasters/answer/9012289) on Home, Services, Contact and a nested article to check the fetched HTML, canonical and indexing status. Request indexing after checks pass; indexing/ranking is not guaranteed.
- Claim/create the real Google Business Profile only if eligible. Use the real business name and primary contact; confirm category, hours and address with the owner. List only Kadapa, Mydukur and Proddatur as actual service areas. Do not create city-specific fake offices. If customers are not served at the business address, follow [Google's service-area guidance](https://support.google.com/business/answer/3038177) for hiding the address.
- Before enabling analytics, select and approve a privacy-conscious provider, retention terms and any required consent controls, then update the privacy policy. Register a listener for `evergreen:analytics` **before the application entry runs**, forwarding only the three allowed event fields through the provider's reviewed adapter. Disable automatic URL/form capture, identity tracking and session replay. Set `VITE_ANALYTICS_ENABLED=true` only when that reviewed adapter is ready. No provider delivery is claimed or tested here.
- Run Google's Rich Results Test/schema validation, PageSpeed Insights and social sharing debugger/preview checks against the real public URLs. WhatsApp/Facebook/LinkedIn/X may cache previews; refresh their caches after deployment. Field LCP/INP/CLS require real traffic; no field Core Web Vitals pass is claimed.

## Validation

| Check | Result |
| --- | --- |
| ESLint and TypeScript/production build | Passed; 17 route HTML files, 404 and sharing assets generated |
| `npm run test:seo` | 4 suites passed: initial content/headings/internal links; image dimensions/size; gating/404; publication fixture canonical/schema/sitemap/preview/encoding/privacy events |
| `npm run test:seo:browser` | Passed against built assets: raw HTTP content, images, unknown/nested/asset 404s, no-JavaScript Home/article, client navigation, metadata cleanup, mobile menus, article priority and no runtime errors |
| Responsive widths | 360, 390, 430, 768, 1024 and 1440 px: no horizontal overflow; approved mobile logo dimensions retained |
| `npm run test:hero`, `npm run test:about` | Passed, including animation/reduced-motion behavior, responsive layout and accordion/navigation |
| `npm run test:whatsapp`, `npm run test:whatsapp:browser` | 8 message tests and all mocked form/browser checks passed; five-step navigation/photos and online/WhatsApp separation preserved; no real emails/messages sent |
| Browser-bundle credential-pattern scan | 44 JS bundles checked; no server-secret names or Resend-key indicators found; not an exhaustive security audit |
| `npm run test:enquiries` | **Blocked:** existing test imports the missing `netlify/lib/enquiries.mjs`; no backend-service pass claimed |
| Live Google/Netlify/social/provider tests | Require authorized deployment, actual URL/accounts and applicable verified client data |

Local unthrottled Chrome observations: desktop normal-motion Home LCP approximately **0.88 s**, CLS **0**; reduced-motion six-width observations LCP **0.35–0.59 s**, CLS **0–0.0033**. These are local lab observations, not production/field guarantees or INP measurements. External services were blocked in the production-browser test. Screenshots/results: `browser-review.local/seo/` (local artifacts).

Implementation references: [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Netlify file shadowing/rewrites](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/), [Netlify headers](https://docs.netlify.com/manage/routing/headers/).

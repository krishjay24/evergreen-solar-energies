# Publishing and integrations

The Contact and Solar Fit Netlify Functions are present again; live email delivery has not been verified. No CMS or newsletter provider is configured. GA4 has a consent-gated browser adapter, but live property data and enquiry delivery remain unverified. The public website reads centralized, typed content from `src/data/` and `src/config/site.ts`; this is not an admin panel.

Smallest safe content workflow: keep the existing typed files in `src/data/` and `src/config/site.ts`, with authorized repository maintainers reviewing content and approved local images through pull requests. Run the existing validation before publishing through the existing build pipeline; deployment requires separate authorization. This needs no new runtime API, CMS or website login. If the company needs browser-based editing, add a Git-backed editor with real provider authentication and repository permissions, draft branches/review, and server-side validation of the existing data types and upload constraints. Keep the current page components and public content read-only. An external identity/provider account and editor permissions are still required; never implement a client-side password gate or expose write tokens in Vite variables.

Enquiry endpoints: `netlify/lib/enquiries.mjs` handles both `netlify/functions/` entry points. The frontend POSTs to the paths in `netlify.toml`. The handler validates consent, fields, photo signatures/count/size and origin, and returns `{ "received": true, "id": "..." }` only after the email provider accepts the request with a receipt ID. Configure Functions-scoped `RESEND_API_KEY`, `ENQUIRY_EMAIL_FROM` (a sender on a Resend-verified domain), and `ENQUIRY_ALLOWED_ORIGIN=https://evergreen-solar-energies.netlify.app` in Netlify. Do not prefix secrets with `VITE_`. Offline tests mock provider acceptance; they do not prove real delivery.

Newsletter: requires a real same-origin endpoint, duplicate detection, consent handling and a working unsubscribe URL. Until both endpoint and unsubscribe URL are configured, no Subscribe button appears.

WhatsApp: defaults to the confirmed `916300182036`; `VITE_CONTACT_WHATSAPP` can override it. Local browser checks verify link targets, without sending messages. The mobile Call action uses the existing company telephone `6300182036`.

Production publication gate: `https://evergreen-solar-energies.netlify.app` is configured in `.env.production` and `netlify.toml`; no custom domain is required. Verify the business name, phone numbers, email, address and service areas before setting `VITE_BUSINESS_DETAILS_VERIFIED=true` in the production build environment and rebuilding. Every build emits `robots.txt` and valid `sitemap.xml`. Unverified builds block crawling and contain an empty sitemap; approved production builds allow crawling and list public routes. Canonical/OG URLs use the configured origin; business schema and indexing remain gated. Previews stay noindex. Check for conflicting hosting environment overrides. Set the production branch to `main` in Netlify's Git settings and supply backend secrets there, never via `VITE_` variables.

Analytics: `src/lib/analytics.ts` dispatches sanitized allowlisted events. `src/lib/ga4.ts` now loads Google Analytics 4 (G-9JE3R1SM3F) only on the production Netlify hostname after explicit opt-in; localhost and development are blocked. Router page views are manual and GA automatic page views are disabled in the tag configuration. The website sends `generate_lead` only after a form endpoint confirms receipt; the absent backend means real lead delivery cannot yet be verified. Configure the GA4 property's Enhanced Measurement page-change and form-interaction tracking off to prevent duplicate automatic events, and verify events in GA4 DebugView after approved deployment.

Client content still required: confirm all business/address details and the production domain, approve the privacy policy against actual providers and retention/removal practices, and supply customer-approved installation photos and project facts. Preserve the gallery empty state until these are approved. Existing logo derivatives use responsive WebP sources; the solar illustrations are SVG. No deployment or GitHub push is authorized by this document.

## Homepage enquiry continuation

The compact homepage enquiry card was removed at the client's request. The hero retains its link to `/request-quote`, where the existing five-step assessment remains available. Shared validation and validated draft-state compatibility are retained; no additional homepage form is rendered.

## WhatsApp enquiry channel

Contact and the final Solar Fit step offer distinct WhatsApp and online actions. Both validate all existing required fields and consent before preparing a message. `src/lib/contact.ts` uses the configured business number and the allowlisted plain-text formatters in `whatsappEnquiries.ts`; filenames, image contents and secrets are excluded. Opening WhatsApp is not delivery: the user must press Send. Popup failures have visible feedback, and duplicate clicks are briefly locked. Website-selected photos remain available to the original online multipart upload; WhatsApp attachments must be added manually. No personal enquiry URLs are logged or passed to analytics. Real mobile app handoff and desktop WhatsApp login/sending require manual device checks. Backend delivery still requires the existing Netlify/Resend configuration.

## Gallery publication review

`src/data/projects.ts` remains empty. Its story type supports location, summary, optional capacity/verification flag, challenge, solution, date, images with alt/dimensions, customer approval and featuring. `publishedProjects` excludes entries without customer approval or photos. Gallery cards and detail pages show capacity only when both its value and verification flag exist. The same approved dataset supplies both views, and reference photography is not imported into it. Client-provided photographs, permission and verified project facts remain necessary; no examples were inserted. An editor must validate stable unique IDs, required fields, photo authenticity and capacity evidence before approval/publishing.

## Netlify rate-limit review

Both Function entry points export per-IP/domain rules (5 submissions per 60 seconds). The unit test checks exported configuration only; Netlify must accept and enforce the rules after deployment.

Rate limiting is enforced by Netlify's hosted request layer, not the offline handler. Confirm deployment acceptance, HTTP 429/recovery and that throttled requests do not reach Resend. Independently verify an authorized Contact and Solar Fit test reaches the business inbox (including optional photos), with no success event for provider failures. Never treat the mocked browser tests as proof of live delivery.

# Evergreen Solar Energies

React 19 + TypeScript (strict) + Vite 8 + Tailwind CSS v4 + React Router 8 + GSAP + Motion + Lucide.

## Commands
- `npm run dev` – dev server (port 5173 may be taken locally; use `npm run dev -- --port 5180`)
- `npm run build` – type-check (`tsc -b`) + production build to `dist/`
- `npm run lint` – ESLint
- `npm run test:hero` – starts Vite and checks the hero in headless Chrome/Edge (`CHROME_PATH` overrides browser discovery)
- `npm run test:about` – starts Vite and checks the About section/page, accordion and responsive layout in headless Chrome/Edge

Verify changes with `npm run lint && npm run build`.

## Conventions
- Import alias `@/` → `src/`.
- Tailwind v4 is CSS-first: tokens and custom utilities live in `src/styles/globals.css` (`@theme`, `@utility`). No `tailwind.config.js`.
- Site-wide content (name, tagline, service areas, contact, navigation) lives in `src/config/site.ts`; route paths in `src/config/routes.ts`.
- Pages are lazy-loaded via the route `lazy` property in `src/app/router.tsx`.
- Register GSAP plugins only through `src/lib/gsap.ts`; respect reduced motion (`gsap.matchMedia`, `useReducedMotion`).
- Deployment: Netlify (`netlify.toml`, SPA fallback to `index.html`).

## Design system
- Brand tokens (Tailwind classes): `canvas`, `canvas-alt`, `card`, `evergreen`, `gold`, `gold-accent`, `warm-white`, `muted`, `solar-blue`, `line`, `line-strong`. Mirrored in `src/config/brand.ts`.
- Type scale: `text-display-xl|lg|md`, `text-title`, `text-lead`, `text-eyebrow`. Font: Manrope (self-hosted via `@fontsource-variable/manrope`).
- Utilities: `container-site|narrow|wide`, `section-y`, `section-y-compact`, `surface-card`, `icon-sm|md|lg`, `text-gradient-gold`, `btn-*`.
- Use the shared components (`Section`, `SectionHeading`, `PrimaryButton`, `BentoCard`, …) instead of re-styling.
- Logo: never redraw/recolour. Source `public/images/logo/evergreen-logo.png`; derived assets via `node scripts/process-logo.mjs`. `<Logo>` shows it on a warm-white plate (the artwork has dark-green lettering).
- Dev-only style preview: `/__styleguide` (not in production builds).
- Headless Chrome screenshots have a 500px minimum width; use 500+ for "mobile" checks (or drive Chrome via CDP `Emulation.setDeviceMetricsOverride` for true 390px).

## Navigation
- Nav items and the header CTA live in `siteConfig.navigation` / `siteConfig.primaryCta`; paths in `ROUTES`. Anchor items use `/#id` form; active state logic is in `src/lib/navigation.ts`.
- Scrolling is handled by `components/layout/ScrollManager.tsx` (replaces React Router's `ScrollRestoration`): back/forward restores, same-page anchors scroll smoothly, new pages start at top. Do not re-add CSS `scroll-behavior: smooth`.
- Sections targeted by anchors get `scroll-margin-top` automatically (`[id]` rule, based on `--header-height`).

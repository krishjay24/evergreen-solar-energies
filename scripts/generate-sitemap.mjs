import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { loadEnv } from 'vite'

// Match the production mode used by npm run build, including Vite's env precedence.
const env = loadEnv('production', process.cwd())
const domain = env.VITE_SITE_URL?.replace(/\/$/, '')
if (env.VITE_BUSINESS_DETAILS_VERIFIED !== 'true' || !domain || !/^https:\/\//.test(domain)) {
  console.log('SEO publication gated: verify business details and configure VITE_SITE_URL to generate sitemap.')
  process.exit(0)
}

const articleSource = await readFile(join(process.cwd(), 'src/data/learning.ts'), 'utf8')
const slugs = [...articleSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1])
const routes = ['/', '/about', '/solar-solutions', '/how-it-works', '/projects', '/learning-hub', '/contact', '/request-quote', '/privacy-policy', '/terms', ...slugs.map((slug) => `/learning-hub/${slug}`)]
const urls = routes.map((route) => `  <url><loc>${new URL(route, domain).href}</loc></url>`).join('\n')
const dist = join(process.cwd(), 'dist')
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`)
const index = join(dist, 'index.html')
await writeFile(index, (await readFile(index, 'utf8')).replace('content="noindex,nofollow"', 'content="index,follow"'))
console.log(`Generated sitemap for ${domain}`)

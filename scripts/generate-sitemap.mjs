import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { createServer } from 'vite'
import { createSocialImage } from './social-images.mjs'
import { discoveryFiles } from './seo-discovery.mjs'

// One build-time pass renders the existing route components and their metadata.
// No browser binary, live API calls, credentials or new runtime service is required.
const dist = join(process.cwd(), 'dist')
const server = await createServer({ mode: 'production', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } })
try {
  const { renderPage } = await server.ssrLoadModule('/src/app/prerender.tsx')
  const { publicPaths, getPageSeo, seoHead, escapeHtml } = await server.ssrLoadModule('/src/lib/seo.ts')
  const template = (await readFile(join(dist, 'index.html'), 'utf8'))
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/<meta\s+(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[\s\S]*?>/g, '')
  const home = getPageSeo('/')
  const entries = []
  for (const path of [...publicPaths, '/404']) {
    const meta = getPageSeo(path)
    const html = await renderPage(path)
    if (!/<h1[\s>]/.test(html) || !html.includes('<main')) throw new Error(`Missing page content: ${path}`)
    const output = template.replace('</head>', `${seoHead(path)}\n</head>`)
      .replace('<div id="root"></div>', `<div id="root" data-prerender="${escapeHtml(path)}">${html}</div>`)
    const file = path === '/404' ? join(dist, '404.html') : join(dist, path === '/' ? 'index.html' : `${path.slice(1)}/index.html`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, output)
    if (meta.found) {
      await createSocialImage(meta, dist)
      entries.push({ path, file: path === '/' ? 'index.html' : `${path.slice(1)}/index.html`, image: meta.image, title: meta.title, canonical: meta.canonical ?? null })
    }
  }
  // Custom 404 response keeps invalid nested article/project URLs out of the index.
  // Existing static files shadow this rule on Netlify; Functions use Netlify's reserved path.
  await writeFile(join(dist, '_redirects'), '/* /404.html 404\n')
  // HTML retains Netlify's default revalidation. Avoid an overlapping global
  // Cache-Control rule, whose values could concatenate with asset directives.
  await writeFile(join(dist, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n${home.published ? '' : '  X-Robots-Tag: noindex, nofollow\n'}/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/images/*\n  Cache-Control: public, max-age=3600\n`)
  const discovery = discoveryFiles(home, entries)
  if (discovery.sitemap) await writeFile(join(dist, 'sitemap.xml'), discovery.sitemap)
  else await rm(join(dist, 'sitemap.xml'), { force: true })
  await writeFile(join(dist, 'robots.txt'), discovery.robots)
  await writeFile(join(dist, 'seo-manifest.json'), JSON.stringify({ published: home.published, origin: home.origin, routes: entries }, null, 2))
  console.log(`Prerendered ${entries.length} routes + 404 with branded social images. Indexing ${home.published ? 'enabled' : 'gated: configure VITE_SITE_URL and verify business details; previews stay noindex'}.`)
} finally { await server.close() }

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createServer } from 'vite'
import sharp from 'sharp'
import { discoveryFiles } from './seo-discovery.mjs'

const read = path => readFile(join('dist', path), 'utf8')
const manifest = JSON.parse(await read('seo-manifest.json'))
const contents = new Map(await Promise.all(manifest.routes.map(async route => [route.path, await read(route.file)])))
const head = html => html.split('</head>')[0]

test('all public routes have initial HTML, one H1, unique metadata and internal links', () => {
  const titles = new Set(), descriptions = new Set()
  for (const [path, html] of contents) {
    assert.match(html, /<main[\s>]/, path)
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${path}: one semantic H1`)
    assert.ok(html.length > 4000, `${path}: actual page content`)
    const tags = head(html)
    assert.equal((tags.match(/<title>/g) ?? []).length, 1, path)
    assert.equal((tags.match(/name="description"/g) ?? []).length, 1, path)
    const title = tags.match(/<title>(.*?)<\/title>/)[1]
    const description = tags.match(/name="description" content="([^"]+)"/)[1]
    assert.ok(!titles.has(title), `duplicate title ${path}`); titles.add(title)
    assert.ok(!descriptions.has(description), `duplicate description ${path}`); descriptions.add(description)
    assert.match(tags, /name="twitter:card" content="summary_large_image"/)
    assert.match(tags, /property="og:locale" content="en_IN"/)
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="(\/[^"#?]*)/g)) {
      if (href.startsWith('//') || /\.[a-z]+$/i.test(href)) continue
      assert.ok(contents.has(href.replace(/\/$/, '') || '/'), `${path}: unresolved link ${href}`)
    }
    assert.match(tags, new RegExp(`name="robots" content="${manifest.published ? 'index' : 'noindex'},follow"`))
  }
  assert.equal((contents.get('/learning-hub').match(/<h2 class="mt-4 text-title/g) ?? []).length, 7, 'Learning Hub article headings follow its H1 without skipping a level')
})

test('all social images exist at 1200×630, use JPEG and stay compact', async () => {
  for (const route of manifest.routes) {
    const bytes = await readFile(join('dist', route.image.slice(1)))
    const image = await sharp(bytes).metadata()
    assert.equal(image.width, 1200); assert.equal(image.height, 630); assert.equal(image.format, 'jpeg')
    assert.ok(bytes.length < 350_000, `${route.path}: image too large`)
    const html = head(contents.get(route.path))
    if (manifest.origin) {
      assert.ok(html.includes(`${manifest.origin}${route.image}`))
      assert.ok(html.includes(`rel="canonical" href="${manifest.origin}${route.path}"`))
    } else assert.ok(!html.includes('rel="canonical"'))
  }
})

test('404 response and indexing rules exclude invalid routes and gated builds', async () => {
  const html = await read('404.html')
  assert.match(head(html), /name="robots" content="noindex,follow"/)
  assert.ok(!head(html).includes('rel="canonical"'))
  assert.match(html, /<h1[^>]*>Page not found/i)
  assert.equal(await read('_redirects'), '/* /404.html 404\n')
  const robots = await read('robots.txt')
  if (manifest.published) {
    assert.ok(robots.includes(`Sitemap: ${manifest.origin}/sitemap.xml`))
    const sitemap = await read('sitemap.xml')
    assert.equal((sitemap.match(/<url>/g) ?? []).length, manifest.routes.length)
    for (const route of manifest.routes) assert.ok(sitemap.includes(`<loc>${route.canonical}</loc>`))
    assert.ok(!sitemap.includes('/404') && !sitemap.includes('__styleguide'))
  } else {
    assert.match(robots, /Disallow: \//)
    assert.match(await read('_headers'), /X-Robots-Tag: noindex, nofollow/)
    await assert.rejects(read('sitemap.xml'), { code: 'ENOENT' })
  }
})

test('publication fixture: canonical normalization, full schema, encoding, previews and safe analytics', async () => {
  // Synthetic origin used only in isolated tests, never written into production output.
  const origin = 'https://seo-fixture.invalid'
  const server = await createServer({ configFile: false, mode: 'production', appType: 'custom', server: { middlewareMode: true },
    resolve: { alias: { '@': join(process.cwd(), 'src') } },
    define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(origin), 'import.meta.env.VITE_BUSINESS_DETAILS_VERIFIED': '"true"', 'import.meta.env.CONTEXT': '"production"', 'import.meta.env.VITE_ANALYTICS_ENABLED': '"true"' },
  })
  try {
    const seo = await server.ssrLoadModule('/src/lib/seo.ts')
    // siteConfig reads the whole env object, so set the fixture on the config object only.
    const { siteConfig } = await server.ssrLoadModule('/src/config/site.ts')
    siteConfig.url = origin
    assert.equal(seo.getPageSeo('/about/').canonical, `${origin}/about`)
    assert.equal(seo.getPageSeo('/about').robots, 'index,follow')
    for (const value of ['http://localhost:5173', 'https://localhost', 'https://user:secret@host.invalid', `${origin}/subpath`, `${origin}?private=value`]) assert.equal(seo.productionOrigin(value), null)
    for (const path of seo.publicPaths) {
      const meta = seo.getPageSeo(path)
      const graph = JSON.parse(seo.schemaJson(meta.schema))['@graph']
      assert.ok(graph.some(item => Array.isArray(item['@type']) && item['@type'].includes('LocalBusiness')))
      assert.ok(graph.some(item => item['@type'] === 'WebSite'))
      if (path !== '/') {
        const breadcrumbs = graph.find(item => item['@type'] === 'BreadcrumbList')
        assert.ok(breadcrumbs && breadcrumbs.itemListElement.length >= 2)
      } else assert.ok(!graph.some(item => item['@type'] === 'BreadcrumbList'))
      if (path === '/solar-solutions') assert.equal(graph.filter(item => item['@type'] === 'Service').length, 3)
      if (path.startsWith('/learning-hub/')) assert.ok(graph.some(item => item['@type'] === 'Article' && item.headline === meta.label))
      assert.ok(!seo.seoHead(path).includes('undefined'))
      assert.match(seo.seoHead(path), /property="og:image:width" content="1200"/)
    }
    for (const path of ['/learning-hub/missing', '/projects/missing', '/missing', '/__styleguide']) {
      const meta = seo.getPageSeo(path)
      assert.equal(meta.found, false); assert.equal(meta.robots, 'noindex,follow'); assert.equal(meta.canonical, undefined)
    }
    assert.ok(!seo.schemaJson([{ text: '</script><script>alert(1)</script>' }]).includes('<'))
    assert.equal(seo.escapeHtml('a&"<'), 'a&amp;&quot;&lt;')
    const publishedFiles = discoveryFiles(seo.getPageSeo('/'), seo.publicPaths.map(path => seo.getPageSeo(path)))
    assert.equal((publishedFiles.sitemap.match(/<loc>/g) ?? []).length, seo.publicPaths.length)
    for (const path of seo.publicPaths) assert.ok(publishedFiles.sitemap.includes(`<loc>${origin}${path}</loc>`))
    assert.equal(publishedFiles.robots, `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
    assert.ok(!publishedFiles.sitemap.includes('/404') && !publishedFiles.sitemap.includes('__styleguide'))
    assert.throws(() => discoveryFiles({ published: true, origin }, [{ canonical: 'https://different.invalid/' }]))

    const { trackEvent } = await server.ssrLoadModule('/src/lib/analytics.ts')
    const events = []
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')
    const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { pathname: '/contact', search: '?name=Private', hash: '#private' }, dispatchEvent: event => events.push(event.detail) } })
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { doNotTrack: '0', globalPrivacyControl: false } })
    try {
      trackEvent('page_view'); trackEvent('phone_click'); trackEvent('whatsapp_click'); trackEvent('enquiry_confirmed', 'contact')
      assert.equal(events.length, 4)
      assert.deepEqual(events[3], { name: 'enquiry_confirmed', path: '/contact', channel: 'contact' })
      assert.ok(!JSON.stringify(events).includes('Private'))
      navigator.globalPrivacyControl = true; trackEvent('page_view'); assert.equal(events.length, 4)
      navigator.globalPrivacyControl = false; navigator.doNotTrack = '1'; trackEvent('page_view'); assert.equal(events.length, 4)
    } finally {
      if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow); else delete globalThis.window
      if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator)
    }
  } finally { await server.close() }
  const preview = await createServer({ configFile: false, appType: 'custom', server: { middlewareMode: true }, resolve: { alias: { '@': join(process.cwd(), 'src') } },
    define: { 'import.meta.env.VITE_BUSINESS_DETAILS_VERIFIED': '"true"', 'import.meta.env.CONTEXT': '"deploy-preview"' } })
  try {
    const { siteConfig } = await preview.ssrLoadModule('/src/config/site.ts'); siteConfig.url = origin
    const { getPageSeo } = await preview.ssrLoadModule('/src/lib/seo.ts')
    assert.equal(getPageSeo('/').published, false); assert.equal(getPageSeo('/').schema.length, 0)
  } finally { await preview.close() }
})

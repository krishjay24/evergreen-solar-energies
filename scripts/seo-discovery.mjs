const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')

export function discoveryFiles({ published, origin }, entries) {
  if (!published) return { sitemap: null, robots: 'User-agent: *\nDisallow: /\n' }
  if (!origin || entries.some(entry => !entry.canonical?.startsWith(`${origin}/`))) throw new Error('Sitemap URLs must use the configured production origin')
  return {
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(entry => `  <url><loc>${xml(entry.canonical)}</loc></url>`).join('\n')}\n</urlset>\n`,
    robots: `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
  }
}

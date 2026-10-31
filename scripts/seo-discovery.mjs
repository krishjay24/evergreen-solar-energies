const xml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;')

export function discoveryFiles({ published, origin }, entries) {
  // Keep the endpoint valid even before approval; gated pages are not indexable.
  const indexable = published ? entries : []
  if (published && (!origin || indexable.some(entry => !entry.canonical?.startsWith(`${origin}/`)))) throw new Error('Sitemap URLs must use the configured production origin')
  return {
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(entry => `  <url><loc>${xml(entry.canonical)}</loc></url>`).join('\n')}\n</urlset>\n`,
    robots: published ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n',
  }
}

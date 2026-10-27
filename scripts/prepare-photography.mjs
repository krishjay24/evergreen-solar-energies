// Optimize the reviewed local downloads and publish their attribution records.
// Source downloads/metadata are intentionally kept in ignored local review storage.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import sharp from 'sharp'

const selections = JSON.parse(await readFile('browser-review.local/photo-selections.json', 'utf8'))
const records = JSON.parse(await readFile('browser-review.local/photo-records.json', 'utf8'))
const widths = [480, 960, 1280]
const destination = 'public/images/solar'
await mkdir(destination, { recursive: true })
const manifest = [], runtime = {}
const hashes = new Set()
const positions = {
  'home-residential': '70% 65%', 'home-agricultural': '50% 60%',
  'home-about-team': '50% 40%', 'about-engineers': '55% 35%',
  'about-planning': '50% 35%', 'journey-assess': '60% 45%',
  'process-understand': '50% 45%', 'learn-hybrid': '50% 45%',
}
for (const [id, title, usage, alt] of selections) {
  const record = records.find(photo => photo.id === id && photo.title === title)
  if (!record) throw new Error(`Missing reviewed source: ${id}`)
  if (hashes.has(record.sourceSha1)) throw new Error(`Duplicate source photograph: ${id}`)
  hashes.add(record.sourceSha1)
  const source = `browser-review.local/photo-sources/${id}.jpg`
  const metadata = await sharp(source).metadata()
  // Remove empty sky so the actual Indian residential installation remains visible.
  const crop = id === 'home-residential' ? { left: 0, top: Math.round(metadata.height * 0.43), width: metadata.width, height: metadata.height - Math.round(metadata.height * 0.43) } : null
  const sourceWidth = crop?.width ?? metadata.width, sourceHeight = crop?.height ?? metadata.height
  if (sourceWidth < 1280) throw new Error(`Cannot produce a genuine 1280px source: ${id}`)
  const files = []
  for (const width of widths) {
    const path = `${destination}/${id}-${width}.webp`
    const pipeline = sharp(source).rotate()
    if (crop) pipeline.extract(crop)
    const bytes = await pipeline.resize({ width, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer()
    await writeFile(path, bytes)
    files.push({ filename: path.replace('public/', '/'), width, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
  }
  runtime[id] = { width: sourceWidth, height: sourceHeight, alt, position: positions[id] ?? '50% 50%' }
  const licenseUrl = record.licenseUrl || record.sourcePage + '#Licensing'
  manifest.push({ id, title, usage, alt, author: record.author, authorOriginal: record.metadata.Artist?.value, attribution: record.attribution, sourcePage: record.sourcePage, originalUrl: record.originalUrl, license: record.license, licenseUrl, derivativeLicense: record.license, retrieved: record.retrieved, originalWidth: record.originalWidth, originalHeight: record.originalHeight, sourceSha1: record.sourceSha1, downloadSha256: record.downloadedSha256, changes: crop ? 'Empty sky cropped; resized and encoded as responsive WebP. No generative alterations.' : 'Resized and encoded as responsive WebP; CSS object-fit cropping varies by viewport. No generative alterations.', files })
}
const articlePhotos = {
  'how-rooftop-solar-works': 'learn-basics',
  'preparing-for-a-solar-site-review': 'learn-site-review',
  'on-grid-and-hybrid-solar': 'learn-hybrid',
  'solar-panel-care': 'learn-maintenance',
  'understanding-solar-and-your-bill': 'learn-bills',
  'roof-suitability-checklist': 'learn-roof',
  'government-schemes-and-approvals': 'learn-schemes',
}
await writeFile('src/data/photography.ts', `// Reviewed image records. Full attribution: /images/solar/credits.html\nexport const photography = ${JSON.stringify(runtime, null, 2)} as const\n\nexport type PhotoId = keyof typeof photography\n\nexport const articlePhotos: Record<string, PhotoId> = ${JSON.stringify(articlePhotos, null, 2)}\n`)
await writeFile(`${destination}/manifest.json`, JSON.stringify({ referenceOnly: true, notice: 'These photographs do not depict Evergreen projects or employees and imply no endorsement.', photos: manifest }, null, 2))
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const list = manifest.map(photo => `<article id="${photo.id}"><img src="${photo.id}-480.webp" width="480" height="${Math.round(480 * runtime[photo.id].height / runtime[photo.id].width)}" loading="lazy" alt="${escape(photo.alt)}"><div><h2>${escape(photo.title)}</h2><p>Photo: ${escape(photo.author)}. ${escape(photo.attribution)}</p><p><a href="${escape(photo.sourcePage)}">Original source and full file history</a> · <a href="${escape(photo.licenseUrl)}">${escape(photo.license)}</a></p><p>Used in: ${escape(photo.usage)}.</p><p>${escape(photo.changes)} Derivatives retain ${escape(photo.derivativeLicense)}.</p></div></article>`).join('\n')
await writeFile(`${destination}/credits.html`, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Photography credits | Evergreen Solar Energies</title><style>body{margin:0;background:#091d18;color:#f7f7f0;font:16px/1.65 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:40px 24px}a{color:#f0d77c}h1{font-size:clamp(2rem,5vw,3rem)}h2{font-size:1.05rem;overflow-wrap:anywhere}p{color:#a8b1ab}article{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:24px;border-top:1px solid #ffffff26;padding:28px 0}img{max-width:100%;height:auto;border-radius:12px}article div{min-width:0}@media(max-width:600px){article{grid-template-columns:1fr}}</style></head><body><main><a href="/">← Evergreen Solar Energies</a><h1>Photography credits</h1><p>Licensed reference photography. These images are not Evergreen installations or employees, and do not imply endorsement by the depicted people, organizations or photographers. Actual Evergreen projects are published only with verified facts and customer permission.</p><p>Responsive derivatives are distributed under their stated source licenses. Cropping and compression are noted per image. Public-domain works retain their public-domain status.</p><p><a href="manifest.json">Machine-readable source, license and file manifest</a></p>${list}</main></body></html>`)
console.log(`Prepared ${manifest.length} distinct source photographs / ${manifest.length * widths.length} local WebP assets.`)

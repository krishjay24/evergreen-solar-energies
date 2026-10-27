import { readFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const escape = text => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character])
const wrap = text => {
  const lines = ['']
  for (const word of text.split(' ')) {
    if ((lines.at(-1) + word).length > 29) lines.push('')
    lines[lines.length - 1] += `${word} `
  }
  return lines.map(line => line.trim())
}

/** Reuses licensed site photography and approved logo, without changing the artwork. */
export async function createSocialImage(meta, dist) {
  const background = await sharp(join('public/images/solar', `${meta.photo}-1280.webp`))
    .resize(1200, 630, { fit: 'cover' }).toBuffer()
  const logo = await sharp(await readFile('public/images/logo/evergreen-logo-supplied-960.webp'))
    .resize(210, 140).png().toBuffer()
  const lines = wrap(meta.label)
  const overlay = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="shade"><stop offset="0" stop-color="#091d18"/><stop offset=".46" stop-color="#091d18" stop-opacity=".96"/><stop offset="1" stop-color="#091d18" stop-opacity=".2"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#shade)"/>
    <path d="M64 209H128" stroke="#d9b65b" stroke-width="3"/>
    <g fill="#f7f7f0" font-family="Arial, sans-serif" font-size="48" font-weight="700">${lines.map((line, index) => `<text x="64" y="${274 + index * 58}">${escape(line)}</text>`).join('')}</g>
    <text x="64" y="516" fill="#f0d77c" font-family="Arial, sans-serif" font-size="21">Kadapa · Mydukur · Proddatur</text>
    <text x="64" y="552" fill="#d5ded7" font-family="Arial, sans-serif" font-size="20">Rooted in Nature. Powered by the Sun.</text>
    <text x="1136" y="600" text-anchor="end" fill="#f7f7f0" font-family="Arial, sans-serif" font-size="14">Reference solar photography</text>
    <rect x="0" y="624" width="1200" height="6" fill="#d9b65b"/>
  </svg>`)
  const target = join(dist, meta.image.slice(1))
  await mkdir(join(dist, 'images/social'), { recursive: true })
  await sharp(background).composite([{ input: overlay }, { input: logo, left: 64, top: 36 }])
    .jpeg({ quality: 88, mozjpeg: true }).toFile(target)
}

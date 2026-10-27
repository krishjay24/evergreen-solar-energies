// Derives web assets from the approved logo without altering its artwork colours.
// Usage: node scripts/process-logo.mjs [source.png]
import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(root, process.argv[2] ?? 'public/images/logo/evergreen-logo.png')
const outDir = resolve(root, 'public/images/logo')

const BG_MIN_CHANNEL = 244
const BG_MAX_SATURATION = 12
const PADDING = 24
const WIDTHS = [480, 960]

await mkdir(outDir, { recursive: true })
const original = resolve(outDir, 'evergreen-logo.png')
if (source !== original) await copyFile(source, original)

const { data, info } = await sharp(original).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const px = W * H
const channel = (i, c) => data[i * 3 + c]

const isBackgroundColour = (i) => {
  const r = channel(i, 0), g = channel(i, 1), b = channel(i, 2)
  const min = Math.min(r, g, b)
  return min >= BG_MIN_CHANNEL && Math.max(r, g, b) - min <= BG_MAX_SATURATION
}

const neighbours = (i) => {
  const x = i % W
  return [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W].filter((n) => n >= 0 && n < px)
}

// Flood fill from the image border so enclosed light areas of the artwork are never removed.
const background = new Uint8Array(px)
const stack = []
for (let x = 0; x < W; x++) stack.push(x, (H - 1) * W + x)
for (let y = 0; y < H; y++) stack.push(y * W, y * W + W - 1)
while (stack.length) {
  const i = stack.pop()
  if (background[i] || !isBackgroundColour(i)) continue
  background[i] = 1
  stack.push(...neighbours(i))
}

const rgba = Buffer.alloc(px * 4)
let minX = W, minY = H, maxX = 0, maxY = 0
for (let i = 0; i < px; i++) {
  let r = channel(i, 0), g = channel(i, 1), b = channel(i, 2), a = 255
  if (background[i]) a = 0
  else if (neighbours(i).some((n) => background[n])) {
    // Anti-aliased edge pixel: un-blend from the white background (colour-to-alpha).
    const alpha = Math.max(255 - r, 255 - g, 255 - b) / 255
    if (alpha > 0) {
      r = Math.round(255 - (255 - r) / alpha)
      g = Math.round(255 - (255 - g) / alpha)
      b = Math.round(255 - (255 - b) / alpha)
    }
    a = Math.round(alpha * 255)
  }
  rgba.set([r, g, b, a], i * 4)
  if (a > 8) {
    const x = i % W, y = (i - x) / W
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
}

const left = Math.max(0, minX - PADDING), top = Math.max(0, minY - PADDING)
const crop = { left, top, width: Math.min(W, maxX + PADDING + 1) - left, height: Math.min(H, maxY + PADDING + 1) - top }
const master = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).extract(crop).png({ compressionLevel: 9 }).toBuffer()

await sharp(master).toFile(resolve(outDir, 'evergreen-logo-transparent.png'))
for (const w of WIDTHS) {
  await sharp(master).resize({ width: w }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(resolve(outDir, `evergreen-logo-${w}.webp`))
}

console.log(`source ${W}x${H}, alpha channel: ${info.channels === 4 ? 'yes' : 'no'} -> transparent ${crop.width}x${crop.height}`)

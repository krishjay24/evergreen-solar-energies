import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const root = new URL('../public/', import.meta.url)
const source = fileURLToPath(new URL('images/logo/evergreen-logo-supplied-960.webp', root))
// Keep the approved artwork unchanged; omit lettering that is illegible at tab sizes.
const mark = await sharp(source)
  .extract({ left: 160, top: 0, width: 620, height: 385 })
  .png()
  .toBuffer()

for (const [name, size] of [['favicon-32.png', 32], ['favicon-48.png', 48], ['favicon-192.png', 192], ['favicon-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await sharp(mark)
    .resize(size, size, { fit: 'contain', background: '#091d18', kernel: 'lanczos3' })
    .flatten({ background: '#091d18' })
    .png({ compressionLevel: 9 })
    .toFile(fileURLToPath(new URL(name, root)))
}

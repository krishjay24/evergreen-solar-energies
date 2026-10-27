import { createHash } from 'node:crypto'
import { z } from 'zod'
import uploadLimits from '../../src/config/uploads.json' with { type: 'json' }

const common = {
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(30).transform(value => value.replace(/[\s-]/g, ''))
    .pipe(z.string().regex(/^(?:\+?91)?[6-9]\d{9}$/)),
  project: z.enum(['residential', 'commercial', 'agricultural', 'other']),
  location: z.string().trim().min(2).max(150),
  consent: z.literal(true),
}
const schemas = {
  contact: z.strictObject({
    ...common,
    email: z.union([z.email().max(254), z.literal('')]),
    message: z.string().trim().min(10).max(2000),
  }),
  'solar-fit': z.strictObject({
    ...common,
    preferredContact: z.enum(['phone', 'whatsapp']),
    space: z.string().max(100).optional(),
    usage: z.string().max(120).optional(),
    phaseLoad: z.string().max(120).optional(),
    information: z.string().max(1500).optional(),
    requestSiteVisit: z.boolean(),
  }),
}
const recipient = 'evergreensolarenergies@gmail.com'
// Leave room for Netlify's binary/base64 overhead and request metadata.
const maxBodyBytes = uploadLimits.maxRequestBytes
const json = (status, body, headers = {}) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', ...headers },
})
class RequestError extends Error {
  constructor(status, message) { super(message); this.status = status }
}

async function readBody(request, limit) {
  if (Number(request.headers.get('content-length')) > limit) throw new RequestError(413, 'Request too large.')
  if (!request.body) throw new RequestError(400, 'Request body required.')
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) {
        await reader.cancel()
        throw new RequestError(413, 'Request too large. Please use smaller photos or contact us directly.')
      }
      chunks.push(Buffer.from(value))
    }
  } finally { reader.releaseLock() }
  return Buffer.concat(chunks)
}

async function parseSubmission(request, kind) {
  const type = request.headers.get('content-type') ?? ''
  const expected = kind === 'contact' ? 'application/json' : 'multipart/form-data'
  if (type.split(';')[0].trim().toLowerCase() !== expected) throw new RequestError(415, 'Unsupported content type.')
  const body = await readBody(request, kind === 'contact' ? 16_000 : maxBodyBytes)
  let details
  const attachments = []
  try {
    if (kind === 'contact') {
      details = JSON.parse(body.toString('utf8'))
    } else {
      const form = await new Response(body, { headers: { 'Content-Type': type } }).formData()
      if ([...form.keys()].some(key => key !== 'details' && key !== 'photos') || form.getAll('details').length !== 1 || typeof form.get('details') !== 'string') {
        throw new RequestError(400, 'Invalid form fields.')
      }
      details = JSON.parse(form.get('details'))
      const photos = form.getAll('photos')
      if (photos.length > uploadLimits.maxPhotos) throw new RequestError(400, 'Choose up to three photos.')
      if (photos.some(photo => typeof photo === 'string' || !photo.size)) throw new RequestError(400, 'Invalid photo.')
      if (photos.reduce((total, photo) => total + photo.size, 0) > uploadLimits.maxCombinedPhotoBytes) {
        throw new RequestError(413, uploadLimits.combinedSizeMessage)
      }
      for (const [index, photo] of photos.entries()) {
        const bytes = Buffer.from(await photo.arrayBuffer())
        const extensions = {
          'image/jpeg': bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) ? 'jpg' : null,
          'image/png': bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'png' : null,
          'image/webp': bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : null,
        }
        const extension = Object.hasOwn(extensions, photo.type) && extensions[photo.type]
        if (!extension) throw new RequestError(400, 'Use JPG, PNG or WebP photos with matching file contents.')
        attachments.push({ filename: `site-photo-${index + 1}.${extension}`, content: bytes.toString('base64') })
      }
    }
  } catch (error) {
    if (error instanceof RequestError) throw error
    throw new RequestError(400, 'Malformed request.')
  }
  const parsed = schemas[kind].safeParse(details)
  if (!parsed.success) throw new RequestError(400, 'Invalid enquiry details or missing consent.')
  return { details: parsed.data, attachments }
}

// Dependency injection keeps tests offline; deployed handlers use real server env/fetch.
export function createEnquiryHandler(kind, { env = process.env, fetchImpl = fetch } = {}) {
  if (!Object.hasOwn(schemas, kind)) throw new Error('Unknown enquiry type')
  return async request => {
    if (request.method !== 'POST') return json(405, { error: 'POST required.' }, { Allow: 'POST' })
    const { RESEND_API_KEY: key, ENQUIRY_EMAIL_FROM: from, ENQUIRY_ALLOWED_ORIGIN: origin } = env
    let allowedOrigin
    try {
      const url = new URL(origin)
      if (url.origin !== origin || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error()
      allowedOrigin = url.origin
    } catch { return json(503, { error: 'Submission service is not configured.' }) }
    if (!key || !z.email().safeParse(from).success) return json(503, { error: 'Submission service is not configured.' })
    // Browser cross-site protection; not a substitute for Netlify's per-IP rate limit.
    if (request.headers.get('origin') !== allowedOrigin || request.headers.get('sec-fetch-site') === 'cross-site') {
      return json(403, { error: 'Submission origin not allowed.' })
    }
    let submission
    try { submission = await parseSubmission(request, kind) } catch (error) {
      return json(error instanceof RequestError ? error.status : 400, { error: error instanceof RequestError ? error.message : 'Invalid request.' })
    }
    const { details, attachments } = submission
    const email = {
      from, to: [recipient],
      subject: kind === 'contact' ? 'Evergreen contact enquiry' : 'Evergreen Solar Fit enquiry',
      text: Object.entries(details).map(([field, value]) => `${field}: ${value}`).join('\n'),
      ...(details.email ? { reply_to: details.email } : {}),
      ...(attachments.length ? { attachments } : {}),
    }
    const body = JSON.stringify(email)
    // Stable across retries and function instances; Resend deduplicates for 24 hours.
    const idempotencyKey = `evergreen-${kind}-${createHash('sha256').update(body).digest('hex')}`
    try {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body, signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) return json(502, { error: 'Delivery service did not accept the enquiry. Please retry or contact us directly.' })
      const receipt = await response.json()
      if (!receipt || typeof receipt.id !== 'string' || !receipt.id.trim()) throw new Error('Missing receipt')
      return json(200, { received: true, id: receipt.id })
    } catch {
      // Never expose provider responses, credentials or customer data in errors/logs.
      return json(502, { error: 'Delivery was not confirmed. Please retry or contact us directly.' })
    }
  }
}

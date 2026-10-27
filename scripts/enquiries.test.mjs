import assert from 'node:assert/strict'
import test from 'node:test'
import { createEnquiryHandler } from '../netlify/lib/enquiries.mjs'
import { config as contactConfig } from '../netlify/functions/contact.mjs'
import { config as solarConfig } from '../netlify/functions/solar-fit.mjs'
import uploadLimits from '../src/config/uploads.json' with { type: 'json' }

const env = {
  RESEND_API_KEY: 'test-only-not-a-real-key',
  ENQUIRY_EMAIL_FROM: 'sender@example.test',
  ENQUIRY_ALLOWED_ORIGIN: 'https://site.example.test',
}
const contact = { name: 'Test Customer', phone: '6300182036', project: 'residential', location: 'Kadapa', consent: true, email: 'customer@example.test', message: 'Please discuss rooftop solar.' }
const solar = { name: 'Test Customer', phone: '6300182036', project: 'residential', location: 'Kadapa', consent: true, preferredContact: 'phone', requestSiteVisit: true }
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aE1sAAAAASUVORK5CYII=', 'base64')
function request(kind, details = kind === 'contact' ? contact : solar, photos = []) {
  const headers = { Origin: env.ENQUIRY_ALLOWED_ORIGIN }
  let body
  if (kind === 'contact') {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(details)
  } else {
    body = new FormData()
    body.append('details', JSON.stringify(details))
    for (const photo of photos) body.append('photos', photo, 'customer-name.png')
  }
  return new Request(`${env.ENQUIRY_ALLOWED_ORIGIN}/.netlify/functions/${kind}`, { method: 'POST', headers, body })
}
const noDelivery = () => { assert.fail('Invalid requests must not call the provider') }

for (const kind of ['contact', 'solar-fit']) {
  test(`${kind}: valid request requires provider acceptance and returns its receipt`, async () => {
    const handler = createEnquiryHandler(kind, { env, fetchImpl: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails')
      assert.equal(options.headers.Authorization, `Bearer ${env.RESEND_API_KEY}`)
      assert.match(options.headers['Idempotency-Key'], /^evergreen-/)
      const email = JSON.parse(options.body)
      assert.deepEqual(email.to, ['evergreensolarenergies@gmail.com'])
      assert.equal(email.from, env.ENQUIRY_EMAIL_FROM)
      assert.ok(email.text.includes('consent: true'))
      if (kind === 'contact') assert.equal(email.reply_to, contact.email)
      else {
        assert.equal(email.attachments[0].filename, 'site-photo-1.png')
        assert.equal(email.attachments[0].content, png.toString('base64'))
      }
      return Response.json({ id: 'provider-test-receipt' })
    } })
    const response = await handler(request(kind, undefined, kind === 'solar-fit' ? [new Blob([png], { type: 'image/png' })] : []))
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { received: true, id: 'provider-test-receipt' })
  })

  test(`${kind}: invalid fields, consent and unexpected fields are rejected`, async () => {
    const handler = createEnquiryHandler(kind, { env, fetchImpl: noDelivery })
    const base = kind === 'contact' ? contact : solar
    for (const change of [{ consent: false }, { phone: '123' }, { name: '' }, { location: 'x'.repeat(151) }, { to: 'attacker@example.test' }]) {
      assert.equal((await handler(request(kind, { ...base, ...change }))).status, 400)
    }
  })

  test(`${kind}: identical retries use the same provider idempotency key`, async () => {
    const keys = []
    const handler = createEnquiryHandler(kind, { env, fetchImpl: async (_, options) => {
      keys.push(options.headers['Idempotency-Key'])
      return Response.json({ id: 'same-receipt' })
    } })
    await handler(request(kind))
    await handler(request(kind))
    await handler(request(kind, { ...(kind === 'contact' ? contact : solar), location: 'Mydukur' }))
    assert.equal(keys[0], keys[1])
    assert.notEqual(keys[0], keys[2])
  })

  test(`${kind}: provider rejection, timeout, malformed receipt never report success`, async () => {
    for (const fetchImpl of [
      async () => Response.json({ message: 'private provider error' }, { status: 429 }),
      async () => Response.json({ message: 'private provider error' }, { status: 500 }),
      async () => { throw new DOMException('Timeout', 'TimeoutError') },
      async () => Response.json({}),
      async () => new Response('invalid JSON'),
    ]) {
      const response = await createEnquiryHandler(kind, { env, fetchImpl })(request(kind))
      assert.equal(response.status, 502)
      const result = await response.json()
      assert.equal(result.received, undefined)
      assert.ok(!JSON.stringify(result).includes('private provider error'))
    }
  })
}

test('missing secrets fail closed; bad origins, methods and content types are rejected', async () => {
  assert.equal((await createEnquiryHandler('contact', { env: {}, fetchImpl: noDelivery })(request('contact'))).status, 503)
  const handler = createEnquiryHandler('contact', { env, fetchImpl: noDelivery })
  for (const origin of [null, 'https://other.example.test']) {
    const req = request('contact')
    if (origin) req.headers.set('Origin', origin)
    else req.headers.delete('Origin')
    assert.equal((await handler(req)).status, 403)
  }
  assert.equal((await handler(new Request(env.ENQUIRY_ALLOWED_ORIGIN))).status, 405)
  const wrongType = request('contact')
  wrongType.headers.set('Content-Type', 'text/plain')
  assert.equal((await handler(wrongType)).status, 415)
  assert.equal((await handler(new Request(env.ENQUIRY_ALLOWED_ORIGIN, { method: 'POST', headers: { Origin: env.ENQUIRY_ALLOWED_ORIGIN, 'Content-Type': 'application/json' }, body: '{' }))).status, 400)
})

test('photo signature, count and aggregate size limits are enforced', async () => {
  const handler = createEnquiryHandler('solar-fit', { env, fetchImpl: noDelivery })
  assert.equal((await handler(request('solar-fit', solar, [new Blob(['not an image'], { type: 'image/png' })]))).status, 400)
  assert.equal((await handler(request('solar-fit', solar, Array.from({ length: 4 }, () => new Blob([png], { type: 'image/png' }))))).status, 400)
  const oversized = request('solar-fit', solar, [new Blob([Buffer.alloc(4_000_001)], { type: 'image/png' })])
  assert.equal((await handler(oversized)).status, 413)
})

test('both deployed entry points configure platform per-IP rate limiting', () => {
  for (const config of [contactConfig, solarConfig]) {
    assert.deepEqual(config.rateLimit, { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'], action: 'rate_limit' })
  }
})

test('Solar Fit accepts optional photos and exactly the combined byte limit', async () => {
  const handler = createEnquiryHandler('solar-fit', { env, fetchImpl: async () => Response.json({ id: 'upload-boundary-receipt' }) })
  const photo = size => {
    const bytes = Buffer.alloc(size)
    png.copy(bytes)
    return new Blob([bytes], { type: 'image/png' })
  }
  const max = uploadLimits.maxCombinedPhotoBytes
  const photos = [photo(1_000_000), photo(1_000_000), photo(max - 2_000_000)]
  const atLimit = request('solar-fit', solar, photos)
  assert.ok((await atLimit.clone().arrayBuffer()).byteLength < uploadLimits.maxRequestBytes)
  assert.equal((await handler(atLimit)).status, 200)
  assert.equal((await handler(request('solar-fit', solar))).status, 200)
})

test('Solar Fit rejects one byte over the combined limit for single and multiple files', async () => {
  const handler = createEnquiryHandler('solar-fit', { env, fetchImpl: noDelivery })
  const photo = size => {
    const bytes = Buffer.alloc(size)
    png.copy(bytes)
    return new Blob([bytes], { type: 'image/png' })
  }
  const max = uploadLimits.maxCombinedPhotoBytes
  for (const photos of [[photo(max + 1)], [photo(1_500_000), photo(max - 1_500_000 + 1)]]) {
    const response = await handler(request('solar-fit', solar, photos))
    assert.equal(response.status, 413)
    assert.deepEqual(await response.json(), { error: uploadLimits.combinedSizeMessage })
  }
})

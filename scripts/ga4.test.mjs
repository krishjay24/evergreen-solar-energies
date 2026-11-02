import assert from 'node:assert/strict'
import { test } from 'node:test'
import { join } from 'node:path'
import { createServer } from 'vite'

test('GA4 is consent-gated, sanitized, and manually counts Router page views once', async () => {
  const server = await createServer({
    configFile: false,
    mode: 'production',
    appType: 'custom',
    server: { middlewareMode: true },
    resolve: { alias: { '@': join(process.cwd(), 'src') } },
    define: {
      'import.meta.env.PROD': 'true',
      'import.meta.env.VITE_ANALYTICS_ENABLED': '"true"',
    },
  })
  const saved = Object.fromEntries(['window', 'document', 'navigator'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]))
  const values = new Map()
  const scripts = []
  const cookieWrites = []
  const mockWindow = {
    location: { hostname: 'evergreen-solar-energies.netlify.app', origin: 'https://evergreen-solar-energies.netlify.app', pathname: '/contact', search: '?email=private@example.com', hash: '#secret' },
    localStorage: { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
    dispatchEvent: () => {},
  }
  const mockDocument = {
    querySelector: () => scripts[0] ?? null,
    head: {
      querySelector: () => scripts[0] ?? null,
      appendChild: (node) => scripts.push(node),
    },
    createElement: () => ({ async: false, src: '' }),
    get cookie() { return '_ga=test; _ga_9JE3R1SM3F=test' },
    set cookie(value) { cookieWrites.push(value) },
  }
  try {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: mockWindow })
    Object.defineProperty(globalThis, 'document', { configurable: true, value: mockDocument })
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { doNotTrack: '0', globalPrivacyControl: false } })
    const ga = await server.ssrLoadModule('/src/lib/ga4.ts')
    assert.equal(ga.GA4_ID, 'G-9JE3R1SM3F')
    assert.equal(ga.ga4Allowed(), true)
    const contact = { name: 'page_view', path: '/contact?email=private@example.com' }
    ga.sendGa4Event(contact)
    assert.equal(scripts.length, 0, 'Never load the Google tag before opt-in')
    ga.setAnalyticsConsent('denied')
    ga.sendGa4Event(contact)
    assert.equal(scripts.length, 0, 'Rejection remains script-free')

    ga.setAnalyticsConsent('granted')
    assert.equal(scripts.length, 1)
    assert.equal(scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-9JE3R1SM3F')
    ga.setAnalyticsConsent('granted')
    assert.equal(scripts.length, 1, 'Repeated consent cannot inject duplicate scripts')
    const calls = mockWindow.dataLayer
    assert.equal(calls.find((call) => call[0] === 'config')[2].send_page_view, false)
    assert.equal(calls.find((call) => call[0] === 'consent' && call[1] === 'default')[2].analytics_storage, 'denied')
    assert.equal(calls.find((call) => call[0] === 'consent' && call[1] === 'update')[2].analytics_storage, 'granted')
    ga.sendGa4Event({ name: 'page_view', path: '/contact' })
    ga.sendGa4Event({ name: 'page_view', path: '/contact' })
    assert.equal(calls.filter((call) => call[1] === 'page_view').length, 1)
    ga.sendGa4Event({ name: 'page_view', path: '/about' })
    ga.sendGa4Event({ name: 'page_view', path: '/contact' })
    assert.equal(calls.filter((call) => call[1] === 'page_view').length, 3, 'Back navigation counts as a new view')
    for (const name of ['phone_click', 'whatsapp_click', 'site_visit_click', 'quotation_click']) ga.sendGa4Event({ name, path: '/contact' })
    ga.sendGa4Event({ name: 'enquiry_confirmed', path: '/contact' })
    assert.equal(calls.filter((call) => call[1] === 'generate_lead').length, 0, 'No lead without confirmed channel')
    ga.sendGa4Event({ name: 'enquiry_confirmed', channel: 'contact', path: '/contact' })
    assert.equal(calls.filter((call) => call[1] === 'generate_lead').length, 1)
    assert.equal(calls.find((call) => call[1] === 'generate_lead')[2].lead_source, 'contact')
    assert.ok(!JSON.stringify(calls).includes('private@example.com'))
    assert.ok(!JSON.stringify(calls).includes('#secret'))
    assert.ok(calls.filter((call) => call[0] === 'event').every((call) => call[2].page_location === `https://evergreen-solar-energies.netlify.app${call[2].page_path}`))

    const count = calls.length
    ga.setAnalyticsConsent('denied')
    ga.sendGa4Event({ name: 'phone_click', path: '/contact' })
    assert.equal(calls.length, count + 1, 'Only the consent update is queued on withdrawal')
    assert.ok(cookieWrites.some((cookie) => cookie.startsWith('_ga=')))
    assert.equal(Reflect.get(mockWindow, `ga-disable-${ga.GA4_ID}`), true)

    ga.setAnalyticsConsent('granted')
    Object.assign(mockWindow.location, { hostname: 'localhost', origin: 'http://localhost:5173' })
    const afterRegrant = calls.length
    ga.sendGa4Event({ name: 'page_view', path: '/contact' })
    assert.equal(calls.length, afterRegrant, 'Localhost cannot send to production GA4')
    Object.assign(mockWindow.location, { hostname: 'evergreen-solar-energies.netlify.app', origin: 'https://evergreen-solar-energies.netlify.app' })
    navigator.globalPrivacyControl = true
    ga.sendGa4Event({ name: 'page_view', path: '/contact' })
    assert.equal(calls.length, afterRegrant, 'GPC blocks GA4 even with stored consent')
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
    await server.close()
  }
})

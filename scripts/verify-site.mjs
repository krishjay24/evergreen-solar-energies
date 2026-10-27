// Local browser review using installed Chrome/Edge; no real email or WhatsApp sends.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { runWhatsAppChecks } from './whatsapp-browser-checks.mjs'
import { runUiPolishChecks } from './ui-polish-browser-checks.mjs'

const origin = process.env.REVIEW_ORIGIN || 'http://localhost:5187'
const output = resolve('browser-review.local')
mkdirSync(output, { recursive: true })
const profile = mkdtempSync(join(tmpdir(), 'evergreen-review-'))
const executable = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => p && existsSync(p))
assert.ok(executable, 'Installed Chrome or Edge required')
const browser = spawn(executable, ['--headless=new', '--remote-debugging-pipe', '--no-first-run', '--disable-gpu', `--user-data-dir=${profile}`], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] })
let nextId = 0, buffer = '', sessionId
const pending = new Map(), errors = [], failures = []
const pausedRequests = []
browser.stdio[4].on('data', chunk => {
  buffer += chunk.toString()
  let end
  while ((end = buffer.indexOf('\0')) >= 0) {
    const message = JSON.parse(buffer.slice(0, end)); buffer = buffer.slice(end + 1)
    if (pending.has(message.id)) {
      const task = pending.get(message.id); pending.delete(message.id); clearTimeout(task.timer)
      if (message.error) task.reject(new Error(message.error.message)); else task.resolve(message.result)
    } else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text)
    else if (message.method === 'Fetch.requestPaused') pausedRequests.push(message.params)
  }
})
function send(method, params = {}, session = sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++nextId
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)) }, 15000)
    pending.set(id, { resolve, reject, timer })
    browser.stdio[3].write(JSON.stringify({ id, method, params, ...(session ? { sessionId: session } : {}) }) + '\0')
  })
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
async function evaluate(fn, ...args) {
  const expression = typeof fn === 'string' ? fn : `(${fn.toString()})(...${JSON.stringify(args)})`
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
  return result.result.value
}
async function until(fn) {
  for (let n = 0; n < 100; n++) { if (await evaluate(fn)) return; await pause(100) }
  throw new Error(`Condition timed out: ${fn}`)
}
async function navigate(path) {
  await send('Page.navigate', { url: origin + path })
  await until(`location.pathname === ${JSON.stringify(path.split('?')[0])} && document.readyState === 'complete' && !!document.querySelector('main h1')`)
  await pause(200)
}
async function viewport(width) { await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 }) }
async function screenshot(name, full = false) {
  const options = { format: 'png', captureBeyondViewport: full }
  if (full) { const size = await send('Page.getLayoutMetrics'); options.clip = { x: 0, y: 0, width: size.cssContentSize.width, height: size.cssContentSize.height, scale: 1 } }
  const shot = await send('Page.captureScreenshot', options)
  writeFileSync(join(output, `${name}.png`), Buffer.from(shot.data, 'base64'))
}
async function check(name, run) {
  try { await run(); console.log(`PASS: ${name}`) } catch (error) { failures.push({ name, error: error.message }); console.log(`FAIL: ${name}: ${error.message}`) }
}
async function clickText(text) { await evaluate(text => { const el = [...document.querySelectorAll('button,a')].find(el => el.textContent.trim() === text && el.getClientRects().length); if (!el) throw new Error(`Missing control: ${text}`); el.click() }, text); await pause(350) }
async function fill(name, value) { await evaluate((name, value) => { const el = document.querySelector(`[name="${name}"]`); const prototype = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype, 'value').set.call(el, value); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.blur() }, name, value) }

try {
  const target = await send('Target.createTarget', { url: 'about:blank' })
  sessionId = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId
  await send('Page.enable'); await send('Runtime.enable')
  await viewport(1440)
  if (process.argv.includes('--ui-only')) {
    await runUiPolishChecks({ check, navigate, evaluate, until, pause, viewport, screenshot, send, origin, takePausedRequests: () => pausedRequests.splice(0) })
  } else if (process.argv.includes('--whatsapp-only')) {
    await runWhatsAppChecks({ check, navigate, evaluate, clickText, fill, until, pause, viewport, screenshot })
  } else {
  if (!process.env.REVIEW_ANIMATIONS_ONLY) {
  await check('Homepage loads; hero entrance and energy paths', async () => {
    await navigate('/')
    await pause(6000)
    assert.match(await evaluate(() => document.querySelector('h1').textContent), /MAKE THE SUN/)
    assert.equal(await evaluate(() => document.querySelectorAll('[data-line]').length), 6)
    assert.equal(await evaluate(() => [...document.querySelectorAll('[data-hero-cta] a')].every(el => +getComputedStyle(el).opacity === 1)), true)
    await screenshot('hero-1440')
  })
  await check('Homepage retains Solar Fit link without the removed quick-enquiry card', async () => {
    await navigate('/')
    assert.equal(await evaluate(() => !!document.querySelector('#quick-enquiry')), false)
    assert.ok(await evaluate(() => !!document.querySelector('[data-hero] a[href="/request-quote"]')))
  })

  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await viewport(width)
    await check(`Homepage layout ${width}px`, async () => {
      await navigate('/'); await pause(5500)
      await evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      assert.equal(await evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow')
      const headerOverlap = await evaluate(() => {
        const rects = [...document.querySelectorAll('header a, header button')].filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden').map(el => ({ text: el.getAttribute('aria-label') || el.textContent.trim(), r: el.getBoundingClientRect() }))
        return rects.flatMap((a, i) => rects.slice(i + 1).filter(b => Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left) > 2 && Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top) > 2).map(b => [a.text, b.text]))
      })
      assert.deepEqual(headerOverlap, [], 'Header controls overlap')
      await screenshot(`hero-${width}`)
      await evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)) } })
      await pause(700)
      assert.equal(await evaluate(() => [...document.images].every(img => img.complete && img.naturalWidth > 0)), true, 'Broken image')
      if ([390, 1440].includes(width)) await screenshot(`home-full-${width}`, true)
      const floats = await evaluate(() => { const call = document.querySelector('a[aria-label="Call Evergreen Solar Energies"]'); const a = document.querySelector('a[aria-label*="on WhatsApp"]').getBoundingClientRect(); if (innerWidth < 768 && (call.getBoundingClientRect().bottom > a.top || call.getAttribute('href') !== 'tel:+916300182036')) return false; const b = document.querySelector('button[aria-label="Back to top"]').getBoundingClientRect(); return a.bottom <= b.top && a.left >= 0 && a.right <= innerWidth && b.bottom <= innerHeight })
      assert.equal(floats, true, 'Floating controls overlap or leave viewport')
      await evaluate(() => document.querySelector('button[aria-label="Back to top"]').click())
      await until(() => scrollY === 0)
    })
  }
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await viewport(width)
    for (const path of ['/about', '/solar-solutions', '/how-it-works', '/projects', '/learning-hub', '/learning-hub/how-rooftop-solar-works', '/contact', '/request-quote', '/privacy-policy', '/terms', '/not-a-page']) {
      await check(`${path} at ${width}px`, async () => {
        await navigate(path)
        assert.equal(await evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Horizontal overflow')
        assert.ok(await evaluate(() => document.querySelector('a[href^="https://wa.me/916300182036"]') !== null))
      })
    }
  }
  await viewport(390)
  await check('Mobile navigation opens, navigates and closes', async () => {
    await navigate('/')
    await evaluate(() => document.querySelector('header button[aria-controls="mobile-menu"]').click()); await pause(400)
    assert.equal(await evaluate(() => !!document.querySelector('#mobile-menu')), true)
    await evaluate(() => document.querySelector('#mobile-menu a[href="/contact"]').click()); await pause(500)
    assert.equal(await evaluate(() => location.pathname), '/contact')
    assert.equal(await evaluate(() => !!document.querySelector('#mobile-menu')), false)
    await evaluate(() => document.querySelector('header button[aria-controls="mobile-menu"]').click()); await pause(300)
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await pause(400)
    assert.equal(await evaluate(() => !!document.querySelector('#mobile-menu')), false)
  })
  await viewport(1440)
  await check('Desktop active navigation and FAQ controls', async () => {
    await navigate('/contact')
    assert.equal(await evaluate(() => document.querySelector('nav[aria-label="Primary"] a[aria-current="page"]').getAttribute('href')), '/contact')
    await evaluate(() => document.querySelector('nav[aria-label="Primary"] a[href="/"]').click())
    await until(() => !!document.querySelector('#faq button[aria-expanded]'))
    await evaluate(() => document.querySelectorAll('#faq button[aria-expanded]')[1].click()); await pause(400)
    assert.equal(await evaluate(() => document.querySelectorAll('#faq button[aria-expanded]')[1].getAttribute('aria-expanded')), 'true')
  })
  await check('Learning filters and gallery empty state', async () => {
    await navigate('/learning-hub')
    const before = await evaluate(() => document.querySelectorAll('#learning article').length)
    await evaluate(() => document.querySelectorAll('[aria-label="Filter articles"] button')[1].click()); await pause(200)
    assert.ok(await evaluate(() => document.querySelectorAll('#learning article').length) < before)
    await navigate('/projects')
    assert.match(await evaluate(() => document.querySelector('main').textContent), /No customer-approved projects/)
  })
  await check('Service categories, consultation CTA, carousel and journey', async () => {
    await navigate('/')
    await evaluate(() => document.querySelectorAll('[aria-label="Solar service categories"] button')[1].click()); await pause(800)
    assert.equal(await evaluate(() => document.querySelectorAll('[aria-label="Solar service categories"] button')[1].getAttribute('aria-pressed')), 'true')
    await evaluate(() => document.querySelector('#services a[href="/request-quote?project=commercial"]').click())
    await until(() => !!document.querySelector('form [name="phone"]'))
    await fill('name', 'Local Test'); await fill('phone', '6300182036'); await clickText('Next')
    assert.equal(await evaluate(() => document.querySelector('input[value="commercial"]').checked), true)
    await navigate('/')
    const before = await evaluate(() => document.querySelector('#why-solar h3').textContent)
    await evaluate(() => document.querySelector('button[aria-label="Next benefit"]').click()); await pause(500)
    assert.notEqual(await evaluate(() => document.querySelector('#why-solar h3').textContent), before)
    await evaluate(() => document.querySelector('button[aria-label="Previous benefit"]').click()); await pause(500)
    assert.equal(await evaluate(() => document.querySelector('#why-solar h3').textContent), before)
    await evaluate(() => document.querySelectorAll('[data-journey-step]')[3].scrollIntoView({ block: 'center' })); await pause(700)
    assert.match(await evaluate(() => document.querySelector('#how-it-works figcaption').textContent), /Connect/)
  })
  for (const width of [390, 1440]) {
    await viewport(width); await navigate('/')
    for (const selector of ['#about-evergreen', '#services', '#why-solar', '#how-it-works', '#faq', '#learning', 'footer']) {
      await evaluate(selector => document.querySelector(selector).scrollIntoView({ block: 'start' }), selector); await pause(500)
      await screenshot(`${selector.replace('#', '')}-${width}`)
    }
  }
  await check('Contact invalid submission and unavailable local API error', async () => {
    await navigate('/contact'); await clickText('Submit Enquiry Online')
    assert.ok(await evaluate(() => document.querySelectorAll('form [role="alert"]').length) >= 4)
    await fill('name', 'Local Test'); await fill('phone', '6300182036'); await fill('location', 'Kadapa'); await fill('message', 'Local browser validation only.')
    await evaluate(() => document.querySelector('[name="consent"]').click())
    await clickText('Submit Enquiry Online')
    await until(() => document.querySelector('form').textContent.includes('Submission was not confirmed'))
  })
  await check('Solar Fit five steps, photo validation, back navigation and API error', async () => {
    await navigate('/request-quote'); await clickText('Next')
    assert.ok(await evaluate(() => document.querySelectorAll('form [role="alert"]').length) >= 2)
    await fill('name', 'Local Test'); await fill('phone', '6300182036'); await clickText('Next')
    await clickText('Next'); assert.match(await evaluate(() => document.querySelector('form').textContent), /Choose a project type/)
    await evaluate(() => document.querySelector('input[value="residential"]').click()); await clickText('Next')
    await fill('location', 'Kadapa')
    await evaluate(() => { const dt = new DataTransfer(); dt.items.add(new File([new Uint8Array(3000001)], 'large.png', { type: 'image/png' })); const input = document.querySelector('input[type="file"]'); input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true })) })
    await clickText('Next'); assert.match(await evaluate(() => document.querySelector('form').textContent), /Photos must total 3 MB or less/)
    await evaluate(() => { const input = document.querySelector('input[type="file"]'); input.value = ''; input.dispatchEvent(new Event('change', { bubbles: true })) })
    await clickText('Next'); await clickText('Next')
    assert.match(await evaluate(() => document.querySelector('form').textContent), /Step 5 of 5/)
    await clickText('Back'); await clickText('Next'); await clickText('Submit Enquiry Online')
    assert.match(await evaluate(() => document.querySelector('form').textContent), /Consent is required/)
    await evaluate(() => document.querySelector('[name="consent"]').click()); await clickText('Submit Enquiry Online')
    await until(() => document.querySelector('form').textContent.includes('Your request was not confirmed'))
  })
  await check('Reduced-motion hero is visible and particles stop', async () => {
    await navigate('/')
    assert.equal(await evaluate(() => [...document.querySelectorAll('[data-hero-word]')].every(el => getComputedStyle(el).transform === 'none')), true)
    assert.equal(await evaluate(() => [...document.querySelectorAll('[data-particle]')].some(el => +getComputedStyle(el).opacity > 0)), false)
  })
  }
  await viewport(1440)
  await check('Energy flow animates, pauses off-screen and respects live reduced-motion changes', async () => {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
    await navigate('/'); await evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await pause(5500)
    await until(() => [...document.querySelectorAll('[data-particle]')].some(el => +getComputedStyle(el).opacity > 0))
    const before = await evaluate(() => [...document.querySelectorAll('[data-particle]')].map(el => el.getAttribute('style')))
    await pause(500)
    assert.notDeepEqual(await evaluate(() => [...document.querySelectorAll('[data-particle]')].map(el => el.getAttribute('style'))), before)
    const direction = await evaluate(async () => {
      const path = document.querySelector('[data-line="sun-power"]')
      const particle = document.querySelector('[data-particle="sun-power"]')
      const length = path.getTotalLength()
      let previous = null
      for (let i = 0; i < 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 50))
        if (+getComputedStyle(particle).opacity < 0.9) { previous = null; continue }
        const matrix = particle.transform.baseVal.consolidate().matrix
        let nearest = 0, distance = Infinity
        for (let step = 0; step <= 100; step++) {
          const point = path.getPointAtLength(length * step / 100)
          const next = Math.hypot(point.x - matrix.e, point.y - matrix.f)
          if (next < distance) { nearest = step; distance = next }
        }
        if (previous !== null && nearest < previous) return true
        previous = nearest
      }
      return false
    })
    assert.equal(direction, true, 'Sunlight must travel from the Sun Power card toward the rooftop')
    await evaluate(() => document.querySelector('#services').scrollIntoView())
    await until(() => [...document.querySelectorAll('[data-particle]')].every(el => +getComputedStyle(el).opacity === 0))
    await evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await until(() => [...document.querySelectorAll('[data-particle]')].some(el => +getComputedStyle(el).opacity > 0))
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    await until(() => [...document.querySelectorAll('[data-particle]')].every(el => +getComputedStyle(el).opacity === 0))
  })
  await check('Contextual WhatsApp URLs, button hover and Learning card hover', async () => {
    const links = await evaluate(async () => { const { whatsappHref } = await import('/src/lib/contact.ts'); return ['general', 'residential', 'commercial', 'agricultural', 'siteVisit', 'quotation'].map(whatsappHref) })
    assert.ok(links.every(url => url.startsWith('https://wa.me/916300182036?text=')))
    assert.equal(new Set(links).size, 6)
    await evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    const selector = '[data-hero-cta] a'
    const base = await evaluate(selector => getComputedStyle(document.querySelector(selector)).backgroundColor, selector)
    const point = await evaluate(selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } }, selector)
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point }); await pause(500)
    assert.notEqual(await evaluate(selector => getComputedStyle(document.querySelector(selector)).backgroundColor, selector), base)
    await evaluate(() => document.querySelector('#learning article').scrollIntoView({ block: 'center' }))
    const card = await evaluate(() => { const r = document.querySelector('#learning article').getBoundingClientRect(); return { x: r.x + 50, y: r.y + 50 } })
    const color = await evaluate(() => getComputedStyle(document.querySelector('#learning article h3')).color)
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...card }); await pause(800)
    assert.notEqual(await evaluate(() => getComputedStyle(document.querySelector('#learning article h3')).color), color)
  })
  for (const width of [390, 1440]) {
    await viewport(width)
    for (const path of ['/contact', '/request-quote']) {
      await navigate(path); await evaluate(() => document.querySelector('form').scrollIntoView({ block: 'start' })); await pause(400)
      await screenshot(`${path.slice(1)}-${width}`)
    }
  }
  }
  assert.deepEqual(errors, [], 'Browser runtime exceptions')
} finally {
  writeFileSync(join(output, 'results.json'), JSON.stringify({ failures, errors }, null, 2))
  await send('Browser.close', {}, undefined).catch(() => browser.kill())
  for (const task of pending.values()) clearTimeout(task.timer)
  await pause(500)
  if (dirname(profile) === resolve(tmpdir()) && profile.startsWith(join(tmpdir(), 'evergreen-review-'))) await rm(profile, { recursive: true, force: true, maxRetries: 3 }).catch(() => {})
}
if (failures.length) process.exitCode = 1

// Browser smoke test for the hero. Requires Chrome/Edge; override with CHROME_PATH.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'vite'

const browserPaths = [
  process.env.CHROME_PATH,
  process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
  process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]
const browserPath = browserPaths.find((path) => path && existsSync(path))
if (!browserPath) throw new Error('Chrome/Edge not found. Set CHROME_PATH to its executable.')

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const server = await createServer({ server: { port: 0 }, logLevel: 'error' })
let browser
let socket
let profile

try {
  await server.listen()
  const port = server.httpServer.address().port
  const origin = `http://localhost:${port}`
  profile = mkdtempSync(join(tmpdir(), 'evergreen-hero-'))
  browser = spawn(browserPath, [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ], { stdio: 'ignore' })

  let debugPort
  for (let attempt = 0; attempt < 100; attempt++) {
    if (browser.exitCode !== null) throw new Error('Browser exited before opening its debug port.')
    if (existsSync(join(profile, 'DevToolsActivePort'))) {
      debugPort = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]
      break
    }
    await pause(100)
  }
  assert.ok(debugPort, 'Browser did not open its debug port.')

  const pages = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
  const page = pages.find((entry) => entry.type === 'page')
  assert.ok(page, 'No browser page available.')
  socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }))

  let nextId = 0
  const pending = new Map()
  const errors = []
  socket.addEventListener('message', ({ data }) => {
    const event = JSON.parse(data)
    if (event.id && pending.has(event.id)) {
      const { resolve, reject } = pending.get(event.id)
      pending.delete(event.id)
      event.error ? reject(new Error(event.error.message)) : resolve(event.result)
    } else if (event.method === 'Runtime.exceptionThrown') {
      errors.push(event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text)
    } else if (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error') {
      errors.push(event.params.args.map((arg) => arg.value ?? arg.description).join(' '))
    }
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }
  const until = async (expression, ms = 10000) => {
    const deadline = Date.now() + ms
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return
      await pause(80)
    }
    throw new Error(`Timed out waiting for: ${expression}`)
  }
  const navigate = async (path) => {
    let markLoaded
    const loaded = new Promise((resolve) => { markLoaded = resolve })
    const onLoad = ({ data }) => {
      if (JSON.parse(data).method === 'Page.loadEventFired') markLoaded()
    }
    socket.addEventListener('message', onLoad)
    await send('Page.navigate', { url: `${origin}${path}` })
    await Promise.race([
      loaded,
      pause(10000).then(() => { throw new Error('Browser page did not finish loading.') }),
    ])
    socket.removeEventListener('message', onLoad)
    await until('!!document.querySelector("[data-hero]")')
  }
  const media = (value) => send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value }],
  })
  const viewport = (width, height, mobile = false) => send('Emulation.setDeviceMetricsOverride', {
    width, height, mobile, deviceScaleFactor: 1,
  })
  await send('Page.enable')
  await send('Runtime.enable')

  await viewport(1440, 900)
  await navigate('/')
  await until(`[...document.querySelectorAll('[data-hero-cta] > *')].every(el => getComputedStyle(el).opacity === '1')`)
  const desktop = await evaluate(`({
    heading: document.querySelector('#hero-heading').textContent.replace(/\\s+/g, ' ').trim(),
    houseLabel: document.querySelector('[data-hero-house] svg').getAttribute('aria-label'),
    paths: document.querySelectorAll('[data-line]').length,
    links: [...document.querySelectorAll('[data-hero-cta] a')].map(a => a.getAttribute('href')),
    overflow: document.documentElement.scrollWidth > innerWidth
  })`)
  assert.equal(desktop.heading, 'MAKE THE SUN WORK FOR YOU.')
  assert.match(desktop.houseLabel, /Illustration/)
  assert.equal(desktop.paths, 6)
  assert.deepEqual(desktop.links, ['/contact#site-visit', '/solar-solutions'])
  assert.equal(desktop.overflow, false)
  console.log('Desktop: heading, original illustration, six paths and CTA destinations OK')

  await viewport(390, 844, true)
  await navigate('/')
  await until(`[...document.querySelectorAll('[data-hero-cta] > *')].every(el => getComputedStyle(el).opacity === '1')`)
  const mobile = await evaluate(`({
    overflow: document.documentElement.scrollWidth > innerWidth,
    cards: [...document.querySelectorAll('[data-hero] li[data-hero-widget]')].filter(el => el.getClientRects().length).length,
    lines: document.querySelectorAll('[data-line]').length
  })`)
  assert.equal(mobile.overflow, false)
  assert.equal(mobile.cards, 6)
  assert.equal(mobile.lines, 0)
  console.log('Mobile: six compact widgets and no overflow OK')

  for (const [width, height] of [[360, 740], [430, 932], [768, 1024], [1024, 768], [1920, 1080]]) {
    await viewport(width, height, width < 1024)
    await pause(200)
    const overflow = await evaluate('document.documentElement.scrollWidth > innerWidth')
    assert.equal(overflow, false, `Horizontal overflow at ${width}px`)
  }
  console.log('Intermediate widths: 360, 430, 768, 1024 and 1920px have no overflow')

  await viewport(1440, 900)
  await media('no-preference')
  await navigate('/')
  await until(`!!document.querySelector('[data-hero-word][style*="transform"]')`)
  await media('reduce')
  await until(`getComputedStyle(document.querySelector('[data-hero-cta] > *')).opacity === '1' &&
    [...document.querySelectorAll('[data-hero-word]')].every(el => getComputedStyle(el).transform === 'none') &&
    [...document.querySelectorAll('[data-line]')].every(el => el.getAttribute('stroke-dashoffset') === '0')`)
  const reduced = await evaluate(`({
    wordsStillMoving: [...document.querySelectorAll('[data-hero-word]')].some(el => getComputedStyle(el).transform !== 'none'),
    houseVisible: getComputedStyle(document.querySelector('[data-hero-house]')).opacity === '1',
    particlesVisible: [...document.querySelectorAll('[data-particle]')].some(el => +getComputedStyle(el).opacity > 0)
  })`)
  assert.deepEqual(reduced, { wordsStillMoving: false, houseVisible: true, particlesVisible: false })
  await pause(1100)
  assert.equal(await evaluate(`[...document.querySelectorAll('[data-particle]')].some(el => +getComputedStyle(el).opacity > 0)`), false)
  console.log('Changing to reduced motion mid-intro finishes the hero and stops particles')

  await media('no-preference')
  await until(`[...document.querySelectorAll('[data-particle]')].some(el => +getComputedStyle(el).opacity > 0)`, 9000)
  assert.equal(await evaluate(`[...document.querySelectorAll('[data-hero-word]')].some(el => getComputedStyle(el).transform !== 'none')`), false)
  console.log('Returning to normal motion resumes particles without replaying the intro')

  await evaluate('window.scrollTo(0, document.querySelector("[data-hero]").offsetHeight + 400)')
  await until(`[...document.querySelectorAll('[data-particle]')].every(el => +getComputedStyle(el).opacity === 0)`)
  await evaluate('window.scrollTo(0, 0)')
  await until(`[...document.querySelectorAll('[data-particle]')].some(el => +getComputedStyle(el).opacity > 0)`, 9000)
  console.log('Particles stop off-screen and resume when visible')

  await evaluate(`document.querySelector('[data-hero-cta] a[href="/solar-solutions"]').click()`)
  await until('location.pathname === "/solar-solutions"')
  await evaluate('document.querySelector(\'nav[aria-label="Primary"] a[href="/"]\').click()')
  await until('!!document.querySelector("[data-hero-cta]")')
  await evaluate(`document.querySelector('[data-hero-cta] a[href="/contact#site-visit"]').click()`)
  await until('location.pathname === "/contact" && location.hash === "#site-visit"')
  console.log('Both CTAs navigate to their configured destinations')
  assert.deepEqual(errors, [])
  console.log('Hero browser smoke test passed')
} finally {
  socket?.close()
  if (browser) {
    const exited = new Promise((resolve) => browser.once('exit', resolve))
    browser.kill()
    await Promise.race([exited, pause(2000)])
  }
  await server.close()
  if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
}

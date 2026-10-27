// Browser smoke test for the About section and page. Requires Chrome/Edge.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'vite'

const browserPath = [
  process.env.CHROME_PATH,
  process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
  process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => path && existsSync(path))
if (!browserPath) throw new Error('Chrome/Edge not found. Set CHROME_PATH to its executable.')

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const server = await createServer({ server: { port: 0 }, logLevel: 'error' })
let browser
let socket
let profile

try {
  await server.listen()
  const origin = `http://localhost:${server.httpServer.address().port}`
  profile = mkdtempSync(join(tmpdir(), 'evergreen-about-'))
  browser = spawn(browserPath, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore' })

  let port
  for (let attempt = 0; attempt < 100; attempt++) {
    if (browser.exitCode !== null) throw new Error('Browser exited before opening its debug port.')
    if (existsSync(join(profile, 'DevToolsActivePort'))) {
      port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]
      break
    }
    await pause(100)
  }
  assert.ok(port, 'Browser did not open its debug port.')
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  socket = new WebSocket(pages.find((page) => page.type === 'page').webSocketDebuggerUrl)
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
  const until = async (expression, ms = 12000) => {
    const deadline = Date.now() + ms
    while (Date.now() < deadline) {
      if (await evaluate(expression)) return
      await pause(80)
    }
    throw new Error(`Timed out waiting for: ${expression}`)
  }
  const navigate = async (path, target) => {
    let done
    const loaded = new Promise((resolve) => { done = resolve })
    const onLoad = ({ data }) => {
      if (JSON.parse(data).method === 'Page.loadEventFired') done()
    }
    socket.addEventListener('message', onLoad)
    await send('Page.navigate', { url: `${origin}${path}` })
    await Promise.race([loaded, pause(12000).then(() => { throw new Error('Page load timed out.') })])
    socket.removeEventListener('message', onLoad)
    await until(`!!document.querySelector('${target}')`)
  }
  const viewport = (width, height, mobile = false) =>
    send('Emulation.setDeviceMetricsOverride', { width, height, mobile, deviceScaleFactor: 1 })
  const key = async (name, code, keyCode) => {
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: name, code, windowsVirtualKeyCode: keyCode })
    if (name === 'Enter') await send('Input.dispatchKeyEvent', { type: 'char', key: name, text: '\r' })
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code, windowsVirtualKeyCode: keyCode })
  }
  await send('Page.enable')
  await send('Runtime.enable')

  await viewport(1440, 900)
  await navigate('/', '#about-evergreen')
  const intro = await evaluate(`({
    heading: document.querySelector('#about-evergreen h2').getAttribute('aria-label'),
    paragraphs: [...document.querySelectorAll('#about-evergreen [data-about-reveal] p, #about-evergreen p[data-about-reveal]')].map(p => p.textContent.trim()),
    topics: [...document.querySelectorAll('#about-evergreen button[aria-expanded]')].map(b => b.textContent.trim()),
    artwork: [...document.querySelectorAll('#about-evergreen figure')].map(f => f.textContent.trim())
  })`)
  assert.equal(intro.heading, 'A Brighter Future Begins with Smarter Energy.')
  assert.equal(intro.topics.join('|'), 'The Challenge|Our Approach|Solar Technology')
  assert.equal(intro.artwork.length, 2)
  assert.ok(intro.artwork.every((caption) => /reference photography/i.test(caption)))
  const triggers = '#about-evergreen button[aria-expanded]'
  const panels = '#about-evergreen [role="region"]'
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('${triggers}')].map(b => b.getAttribute('aria-expanded'))`), ['true', 'false', 'false'])
  assert.equal(await evaluate(`[...document.querySelectorAll('${triggers}')].every(b => document.getElementById(b.getAttribute('aria-controls'))?.getAttribute('aria-labelledby') === b.id)`), true)
  console.log('About section: required copy, two labelled reference photographs and ARIA connections OK')

  await evaluate(`document.querySelector('#about-evergreen').scrollIntoView()`)
  await until(`[...document.querySelectorAll('[data-about-line]')].every(el => Math.abs(new DOMMatrix(getComputedStyle(el).transform).m42) < 1)`)
  await evaluate(`document.querySelector('[data-about-images]').scrollIntoView({ block: 'center' })`)
  await until(`[...document.querySelectorAll('#about-evergreen figure')].every(el => {
    const right = getComputedStyle(el).clipPath.match(/inset\\([^ ]+ ([\\d.]+)/)?.[1]
    return right !== undefined && Number(right) < 0.5
  })`)
  console.log('Scroll-triggered heading and image mask reveals settle correctly')

  await evaluate(`document.querySelectorAll('${triggers}')[0].focus()`)
  await key('ArrowDown', 'ArrowDown', 40)
  assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Our Approach')
  await key('Enter', 'Enter', 13)
  await until(`document.querySelectorAll('${triggers}')[1].getAttribute('aria-expanded') === 'true'`)
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('${panels}')].map(p => [p.getAttribute('aria-hidden'), p.inert])`), [
    ['true', true], ['false', false], ['true', true],
  ])
  await key('End', 'End', 35)
  assert.equal(await evaluate('document.activeElement.textContent.trim()'), 'Solar Technology')
  await key('Enter', 'Enter', 13)
  await until(`document.querySelectorAll('${triggers}')[2].getAttribute('aria-expanded') === 'true'`)
  await key('Enter', 'Enter', 13)
  await until(`[...document.querySelectorAll('${triggers}')].every(b => b.getAttribute('aria-expanded') === 'false')`)
  console.log('Accordion: ArrowDown, End, Enter, expand/collapse and hidden-panel state OK')

  for (const [width, height] of [[360, 740], [390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900]]) {
    await viewport(width, height, width < 1024)
    await pause(200)
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false, `Overflow at ${width}px`)
  }
  console.log('Responsive section: 360–1440px without horizontal overflow')

  await evaluate(`document.querySelector('#about-evergreen a[href="/about"]').click()`)
  await until('location.pathname === "/about" && !!document.querySelector("main h1")')
  await until('document.title.startsWith("About Evergreen")')
  assert.match(await evaluate('document.title'), /^About Evergreen/)
  const aboutPage = await evaluate(`({
    headings: [...document.querySelectorAll('main h2, main h3')].map(h => h.textContent.trim()),
    places: document.querySelector('main').textContent,
    link: document.querySelector('main a[href="/contact#site-visit"]')?.getAttribute('href'),
    overflow: document.documentElement.scrollWidth > innerWidth
  })`)
  for (const title of ['Our mission', 'Our vision', 'Site assessment', 'System planning', 'Equipment coordination', 'Installation support']) {
    assert.ok(aboutPage.headings.includes(title), `Missing About page heading: ${title}`)
  }
  for (const place of ['Kadapa', 'Mydukur', 'Proddatur']) assert.ok(aboutPage.places.includes(place))
  assert.equal(aboutPage.link, '/contact#site-visit')
  assert.equal(aboutPage.overflow, false)
  console.log('Learn More: About page, local presence, mission, vision and support stages OK')

  await navigate('/', '#about-evergreen')
  await evaluate(`window.scrollTo(0, document.querySelector('#about-evergreen').offsetTop + 400)`)
  await until('scrollY > 400')
  await navigate('/about', 'main h1')
  assert.equal(await evaluate('scrollY'), 0, 'Directly loading About must not restore Home scroll position')
  console.log('Direct /about load starts at top after scrolling on Home')

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await navigate('/', '#about-evergreen')
  await evaluate(`document.querySelector('#about-evergreen').scrollIntoView()`)
  await pause(250)
  assert.equal(await evaluate(`[...document.querySelectorAll('[data-about-line]')].every(el => getComputedStyle(el).transform === 'none')`), true)
  assert.equal(await evaluate(`[...document.querySelectorAll('#about-evergreen figure')].every(el => getComputedStyle(el).clipPath === 'none')`), true)
  console.log('Reduced motion: heading and imagery remain visible without reveals')
  assert.deepEqual(errors, [])
  console.log('About browser smoke test passed')
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

import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { extname, join, resolve, sep } from 'node:path'
import { createServer } from 'node:http'

const browserPath = [process.env.CHROME_PATH,
  process.env.PROGRAMFILES && join(process.env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
  process.env['PROGRAMFILES(X86)'] && join(process.env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(path => path && existsSync(path))
if (!browserPath) throw new Error('Chrome/Edge not found; set CHROME_PATH.')

const dist = resolve('dist'), output = resolve('browser-review.local/seo')
const manifest = JSON.parse(await readFile(join(dist, 'seo-manifest.json'), 'utf8'))
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' }
// Local static-host equivalent of Netlify file shadowing + the generated 404 rule.
const server = createServer(async (request, response) => {
  try {
    if (request.method !== 'GET' && request.method !== 'HEAD') { response.writeHead(405).end(); return }
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    let file = resolve(dist, `.${path}`)
    if (file !== dist && !file.startsWith(`${dist}${sep}`)) { response.writeHead(400).end(); return }
    if (!extname(file)) file = join(file, 'index.html')
    let status = 200, body
    try { body = await readFile(file) } catch { file = join(dist, '404.html'); status = 404; body = await readFile(file) }
    response.writeHead(status, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' })
    response.end(request.method === 'HEAD' ? undefined : body)
  } catch { response.writeHead(500).end() }
})
let browser, socket, profile
try {
  await mkdir(output, { recursive: true })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`
  for (const route of manifest.routes) {
    const response = await fetch(origin + route.path)
    assert.equal(response.status, 200); assert.match(await response.text(), /<main[\s>]/)
    assert.equal((await fetch(origin + route.image)).status, 200)
  }
  for (const path of ['/not-a-page', '/learning-hub/missing', '/projects/missing', '/assets/missing.js']) assert.equal((await fetch(origin + path)).status, 404)
  console.log('PASS HTTP: 17 route bodies, social images and unknown/nested/asset 404 responses')

  profile = mkdtempSync(join(tmpdir(), 'evergreen-seo-'))
  browser = spawn(browserPath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' })
  let port
  for (let attempt = 0; attempt < 100; attempt++) {
    if (browser.exitCode !== null) throw new Error('Browser exited before opening a debug port')
    if (existsSync(join(profile, 'DevToolsActivePort'))) {
      try {
        port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0]
        if (port) break
      } catch (error) {
        if (!['EBUSY', 'ENOENT'].includes(error.code)) throw error
      }
    }
    await pause(100)
  }
  assert.ok(port)
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl)
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }))
  const pending = new Map(), errors = [], metrics = []
  let id = 0
  socket.addEventListener('message', ({ data }) => {
    const event = JSON.parse(data)
    if (event.id && pending.has(event.id)) {
      const promise = pending.get(event.id); pending.delete(event.id)
      if (event.error) promise.reject(new Error(event.error.message)); else promise.resolve(event.result)
    } else if (event.method === 'Runtime.exceptionThrown') errors.push(event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text)
    else if (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error') errors.push(event.params.args.map(arg => arg.value ?? arg.description).join(' '))
  })
  const send = (method, params = {}) => new Promise((resolve, reject) => { const next = ++id; pending.set(next, { resolve, reject }); socket.send(JSON.stringify({ id: next, method, params })) })
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
    return result.result.value
  }
  const until = async expression => {
    const deadline = Date.now() + 15_000
    while (Date.now() < deadline) { if (await evaluate(expression)) return; await pause(80) }
    throw new Error(`Timed out: ${expression}`)
  }
  const navigate = async path => {
    await send('Page.navigate', { url: origin + path })
    await until(`location.pathname === ${JSON.stringify(path)} && document.readyState === 'complete' && !!document.querySelector('main h1')`)
  }
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable')
  await send('Network.setBlockedURLs', { urls: ['https://*'] }) // Maps/external services are outside this local review.
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__seoMetrics={cls:0,lcp:0};new PerformanceObserver(list=>list.getEntries().forEach(e=>{if(!e.hadRecentInput)window.__seoMetrics.cls+=e.value})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{window.__seoMetrics.lcp=list.getEntries().at(-1)?.startTime??0}).observe({type:'largest-contentful-paint',buffered:true});` })
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, mobile: false, deviceScaleFactor: 1 })
  await send('Emulation.setScriptExecutionDisabled', { value: true })
  await navigate('/learning-hub/how-rooftop-solar-works')
  assert.match(await evaluate('document.querySelector("main").textContent'), /Photovoltaic cells/)
  assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1)
  assert.equal(await evaluate('getComputedStyle(document.querySelector("main h1")).visibility'), 'visible')
  await navigate('/')
  assert.match(await evaluate('document.querySelector("h1").textContent'), /MAKE THE SUN WORK FOR YOU/i)
  console.log('PASS No-JavaScript browser: original home content and full Learning Hub article visible')
  await send('Emulation.setScriptExecutionDisabled', { value: false })
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await navigate('/')
  await pause(6200)
  const normalMotion = await evaluate('window.__seoMetrics')
  assert.equal(await evaluate('getComputedStyle(document.querySelector("h1")).visibility'), 'visible')
  assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false)
  const normalScreenshot = await send('Page.captureScreenshot', { format: 'png' })
  await writeFile(join(output, 'home-normal-motion.png'), Buffer.from(normalScreenshot.data, 'base64'))
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, mobile: width < 768, deviceScaleFactor: 1 })
    await navigate('/')
    await pause(600)
    assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false, `${width}: overflow`)
    assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1)
    assert.equal(await evaluate('!!document.querySelector("[data-initial-loader]")'), false)
    assert.equal(await evaluate('[...document.querySelectorAll("img")].every(img=>img.hasAttribute("alt")&&img.hasAttribute("width")&&img.hasAttribute("height"))'), true)
    if (width < 768) {
      assert.deepEqual(await evaluate('(()=>{const r=document.querySelector("header img").getBoundingClientRect();return [r.width,r.height]})()'), [96, 64])
      await evaluate('document.querySelector("button[aria-controls=mobile-menu]").click()')
      await until('document.querySelector("button[aria-controls=mobile-menu]").getAttribute("aria-expanded")==="true"')
      await evaluate('document.querySelector("button[aria-controls=mobile-menu]").click()')
    }
    metrics.push({ width, ...await evaluate('window.__seoMetrics') })
    const screenshot = await send('Page.captureScreenshot', { format: 'png' })
    await writeFile(join(output, `home-${width}.png`), Buffer.from(screenshot.data, 'base64'))
  }
  await evaluate(`document.querySelector('footer a[href="/about"]').click()`)
  await until('location.pathname === "/about" && document.title.startsWith("About Evergreen Solar Energies")')
  assert.equal(await evaluate('document.querySelectorAll("head title").length'), 1)
  assert.equal(await evaluate('document.querySelectorAll("meta[name=description]").length'), 1)
  assert.equal(await evaluate(`document.querySelectorAll('meta[property="og:title"]').length`), 1)
  await navigate('/learning-hub/roof-suitability-checklist')
  assert.match(await evaluate('document.title'), /Is your roof suitable for solar/)
  assert.equal(await evaluate(`document.querySelector('meta[property="og:type"]').content`), 'article')
  assert.equal(await evaluate('document.querySelector("main figure img").loading'), 'eager')
  await navigate('/contact')
  assert.equal(await evaluate('!!document.querySelector("form input[name=name]")'), true)
  await navigate('/learning-hub/missing')
  assert.match(await evaluate('document.querySelector("meta[name=robots]").content'), /^noindex/)
  assert.equal(await evaluate('!!document.querySelector("link[rel=canonical]")'), false)
  assert.deepEqual(errors, [])
  await writeFile(join(output, 'results.json'), JSON.stringify({ errors, normalMotion, metrics, note: 'Local unthrottled lab observations; six widths use reduced motion. Not field Core Web Vitals. External services blocked.' }, null, 2))
  console.log('PASS Production JS mounting/navigation, metadata cleanup, six widths, mobile menus, article image priority, forms and no runtime errors')
  console.log('Local lab observations:', JSON.stringify({ normalMotion, reducedMotion: metrics }))
} finally {
  socket?.close()
  if (browser) { const exited = new Promise(resolve => browser.once('exit', resolve)); browser.kill(); await Promise.race([exited, pause(2000)]) }
  await new Promise(resolve => server.close(resolve))
  if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
}

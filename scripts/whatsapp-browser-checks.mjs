import assert from 'node:assert/strict'

/** Browser-only fixtures: no WhatsApp navigation, messages or customer emails are sent. */
export async function runWhatsAppChecks({ check, navigate, evaluate, clickText, fill, until, pause, viewport, screenshot }) {
  const installMocks = async () => evaluate(() => {
    window.__wa = { links: [], opens: 0, posts: [], blocked: false, failOnline: false, openerCleared: false }
    window.open = () => {
      window.__wa.opens++
      if (window.__wa.blocked) return null
      return {
        set opener(value) { window.__wa.openerCleared = value === null },
        document: { createElement: tag => document.createElement(tag), head: { append() {} } },
        location: { replace: href => window.__wa.links.push(href) },
        close() {},
      }
    }
    window.fetch = async (url, options) => {
      if (options?.method !== 'POST' || !['/.netlify/functions/contact', '/.netlify/functions/solar-fit'].includes(url)) throw new Error('Unexpected browser-test request')
      const multipart = options.body instanceof FormData
      const details = multipart ? JSON.parse(options.body.get('details')) : JSON.parse(options.body)
      const photos = multipart ? options.body.getAll('photos').map(file => ({ name: file.name, size: file.size, type: file.type })) : []
      window.__wa.posts.push({ url, details, photos })
      if (window.__wa.failOnline) return Response.json({ error: 'offline test rejection' }, { status: 503 })
      return Response.json({ received: true, id: 'offline-whatsapp-browser-receipt' })
    }
  })
  const message = async () => evaluate(() => new URL(window.__wa.links.at(-1)).searchParams.get('text'))
  const ready = async () => until(() => [...document.querySelectorAll('form button')].every(button => !button.disabled))
  const select = async (name, value) => evaluate((name, value) => { const input = document.querySelector(`[name="${name}"]`); input.value = value; input.dispatchEvent(new Event('change', { bubbles: true })) }, name, value)

  await viewport(1440)
  await check('Contact: validation, consent, formatting, duplicate guard, popup feedback and separate online channel', async () => {
    await navigate('/contact'); await installMocks()
    await clickText('Send Enquiry via WhatsApp')
    assert.equal(await evaluate(() => window.__wa.opens), 0)
    assert.ok(await evaluate(() => document.querySelectorAll('form [role="alert"]').length) >= 4)
    await fill('name', 'WhatsApp Browser Review'); await fill('phone', '9898765432')
    await fill('location', 'Kadapa & Mydukur'); await fill('message', 'Please review my roof.\nBill: ₹2500 + questions? 🙂')
    await clickText('Send Enquiry via WhatsApp')
    assert.equal(await evaluate(() => window.__wa.opens), 0, 'Consent must be required')
    await evaluate(() => document.querySelector('[name="consent"]').click())
    await evaluate(() => { const button = [...document.querySelectorAll('form button')].find(el => el.textContent === 'Send Enquiry via WhatsApp'); button.click(); button.click() })
    assert.equal(await evaluate(() => window.__wa.links.length), 1)
    assert.equal(await evaluate(() => window.__wa.posts.length), 0)
    assert.equal(await evaluate(() => window.__wa.openerCleared), true)
    const text = await message()
    for (const value of ['EVERGREEN SOLAR ENERGIES', 'Contact Enquiry', 'WhatsApp Browser Review', '9898765432', 'Kadapa & Mydukur', '₹2500 + questions? 🙂', 'Source: Website Contact Form']) assert.ok(text.includes(value))
    assert.equal(text.includes('Email:'), false)
    assert.equal(await evaluate(() => new URL(window.__wa.links[0]).pathname), '/916300182036')
    assert.match(await evaluate(() => document.querySelector('form').textContent), /Please press Send/)
    assert.equal(await evaluate(() => !!document.querySelector('form [name="name"]')), true)
    await ready()
    await evaluate(() => { window.__wa.blocked = true })
    await clickText('Send Enquiry via WhatsApp')
    assert.match(await evaluate(() => document.querySelector('form').textContent), /browser blocked WhatsApp/)
    assert.equal(await evaluate(() => window.__wa.links.length), 1)
    await ready()
    await clickText('Submit Enquiry Online')
    await until(() => document.querySelector('main').textContent.includes('received and confirmed'))
    assert.equal(await evaluate(() => window.__wa.posts.length), 1)
    assert.equal(await evaluate(() => window.__wa.links.length), 1)
  })

  await viewport(360)
  await check('Solar Fit: all five steps, optional photos, consent, actual WhatsApp details and preserved online upload', async () => {
    await navigate('/request-quote'); await installMocks()
    await clickText('Next')
    assert.ok(await evaluate(() => document.querySelectorAll('form [role="alert"]').length) >= 2)
    await fill('name', 'Solar WhatsApp Review'); await fill('phone', '9898765432')
    await select('preferredContact', 'whatsapp'); await clickText('Next')
    await evaluate(() => document.querySelector('input[value="agricultural"]').click()); await clickText('Next')
    await fill('location', 'Proddatur'); await fill('space', '800 sq ft')
    await evaluate(() => {
      const files = new DataTransfer()
      files.items.add(new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'site-review.png', { type: 'image/png' }))
      const input = document.querySelector('input[type="file"]'); input.files = files.files; input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await clickText('Next'); await fill('usage', '₹3500 / 450 units'); await fill('phaseLoad', 'Three phase'); await fill('information', 'Access through south gate.')
    await clickText('Next'); await clickText('Back')
    assert.equal(await evaluate(() => document.querySelector('[name="usage"]').value), '₹3500 / 450 units')
    await clickText('Back')
    assert.equal(await evaluate(() => document.querySelector('[name="space"]').value), '800 sq ft')
    await clickText('Next'); await clickText('Next')
    await clickText('Send Solar Assessment via WhatsApp')
    assert.equal(await evaluate(() => window.__wa.opens), 0)
    assert.match(await evaluate(() => document.querySelector('form').textContent), /Consent is required/)
    await evaluate(() => { document.querySelector('[name="consent"]').click(); document.querySelector('[name="requestSiteVisit"]').click() })
    await clickText('Send Solar Assessment via WhatsApp')
    assert.equal(await evaluate(() => window.__wa.links.length), 1)
    assert.equal(await evaluate(() => window.__wa.posts.length), 0)
    const text = await message()
    for (const value of ['Solar Fit Assessment', 'Solar WhatsApp Review', 'WhatsApp', 'Agricultural / Ground-Mounted', 'Proddatur', '800 sq ft', '₹3500 / 450 units', 'Three phase', 'Access through south gate.', 'Site visit requested: No', 'Please contact me regarding a solar site assessment.']) assert.ok(text.includes(value))
    assert.equal(/site-review.png|base64|137,80/.test(text), false)
    assert.match(await evaluate(() => document.querySelector('form').textContent), /attach site photographs manually/)
    await ready()
    await evaluate(() => { window.__wa.failOnline = true })
    await clickText('Submit Enquiry Online')
    await until(() => document.querySelector('form')?.textContent.includes('Your request was not confirmed'))
    assert.deepEqual(await evaluate(() => window.__wa.posts[0].photos), [{ name: 'site-review.png', size: 8, type: 'image/png' }])
    assert.equal(await evaluate(() => window.__wa.links.length), 1)
    await evaluate(() => { window.__wa.failOnline = false })
    await clickText('Submit Enquiry Online')
    await until(() => document.querySelector('main').textContent.includes('Request received.'))
    assert.equal(await evaluate(() => window.__wa.posts.length), 2)
    assert.equal(await evaluate(() => window.__wa.links.length), 1)
  })

  await check('General and service links remain distinct from personal enquiry messages', async () => {
    await navigate('/solar-solutions')
    const links = await evaluate(() => [...document.querySelectorAll('main a[href^="https://wa.me/"]')].map(a => a.href))
    assert.equal(links.length, 3)
    assert.equal(new Set(links).size, 3)
    for (const url of links) assert.ok(url.startsWith('https://wa.me/916300182036?text='))
    const general = await evaluate(() => new URL(document.querySelector('a[aria-label*="on WhatsApp"]').href).searchParams.get('text'))
    assert.equal(general, 'Hello Evergreen Solar Energies, I would like to know more about your solar installation services.')
    assert.ok(links.every(url => !new URL(url).searchParams.get('text').includes('Contact Enquiry')))
  })

  await check('Unconfigured WhatsApp hides personal enquiry actions with guidance', async () => {
    await navigate('/contact'); await installMocks()
    await evaluate(async () => {
      const { siteConfig } = await import('/src/config/site.ts')
      window.__savedWhatsAppNumber = siteConfig.contact.whatsapp
      siteConfig.contact.whatsapp = 'invalid'
    })
    await fill('name', 'Unavailable Channel Review'); await fill('phone', '9898765432')
    await fill('location', 'Kadapa'); await fill('message', 'Local unavailable-channel validation only.')
    await evaluate(() => document.querySelector('[name="consent"]').click())
    await clickText('Send Enquiry via WhatsApp')
    assert.equal(await evaluate(() => [...document.querySelectorAll('form button')].some(button => button.textContent === 'Send Enquiry via WhatsApp')), false)
    assert.match(await evaluate(() => document.querySelector('form').textContent), /WhatsApp is unavailable/)
    assert.equal(await evaluate(() => window.__wa.links.length), 0)
    await evaluate(async () => { const { siteConfig } = await import('/src/config/site.ts'); siteConfig.contact.whatsapp = window.__savedWhatsAppNumber })
  })

  for (const width of [360, 390, 430, 768, 1024, 1440]) {
    await viewport(width)
    await check(`Contact WhatsApp / online controls at ${width}px`, async () => {
      await navigate('/contact')
      await evaluate(() => document.querySelector('form button').scrollIntoView({ block: 'center' }))
      await pause(350)
      assert.equal(await evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      const overlap = await evaluate(() => {
        const buttons = [...document.querySelectorAll('form button')].map(el => el.getBoundingClientRect())
        const floats = [...document.querySelectorAll('.fixed a, .fixed button')].filter(el => el.getClientRects().length).map(el => el.getBoundingClientRect())
        const overlaps = (a, b) => Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)
        return buttons.some((a, i) => buttons.slice(i + 1).some(b => overlaps(a, b)) || floats.some(b => overlaps(a, b)))
      })
      assert.equal(overlap, false)
      if ([390, 1440].includes(width)) await screenshot(`whatsapp-contact-${width}`)
    })
  }
}

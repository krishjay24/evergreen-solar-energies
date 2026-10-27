import assert from 'node:assert/strict'
import test from 'node:test'
import { contactEnquiryMessage, solarAssessmentMessage, whatsappMessageUrl } from '../src/lib/whatsappEnquiries.ts'

const company = 'EVERGREEN SOLAR ENERGIES'
const customer = { name: 'దేవి & Ravi', phone: '+91 9898765432', project: 'residential', location: 'Kadapa / Mydukur', consent: true }

test('Contact message includes actual fields, optional email, type and source', () => {
  const message = contactEnquiryMessage(company, { ...customer, email: 'review@example.test', message: 'Roof & shade?\nPlease call after 5 + thanks 🙂' })
  for (const text of [company, '*Contact Enquiry*', customer.name, customer.phone, customer.location, 'review@example.test', 'Residential Rooftop', 'Roof & shade?\nPlease call after 5 + thanks 🙂', 'Source: Website Contact Form']) assert.ok(message.includes(text))
})

test('Contact omits absent or blank optional email', () => {
  for (const email of [undefined, '', '   ']) {
    const message = contactEnquiryMessage(company, { ...customer, email, message: 'Please review this rooftop.' })
    assert.equal(message.includes('Email:'), false)
    assert.equal(/undefined|null/.test(message), false)
  }
})

test('Solar message has all sections, optional information and site-visit choice', () => {
  const message = solarAssessmentMessage(company, { ...customer, project: 'agricultural', preferredContact: 'whatsapp', space: '500 sq ft', usage: '₹2500 / 300 units', phaseLoad: 'Three phase / 5 kW', information: 'Access from the east gate.', requestSiteVisit: true })
  for (const text of [company, '*Solar Fit Assessment*', '*Customer Details*', '*Project Details*', '*Site Details*', '*Electricity Usage*', '*Next Step*', 'WhatsApp', 'Agricultural / Ground-Mounted', '500 sq ft', '₹2500 / 300 units', 'Three phase / 5 kW', 'Access from the east gate.', 'Site visit requested: Yes', 'Please contact me regarding a solar site assessment.']) assert.ok(message.includes(text))
})

test('Solar omits empty optional fields and reflects phone contact and no site visit', () => {
  const message = solarAssessmentMessage(company, { ...customer, preferredContact: 'phone', space: ' ', usage: '', phaseLoad: undefined, information: '', requestSiteVisit: false })
  for (const text of ['Available roof', '*Electricity Usage*', 'Phase / load:', '*Additional information*', 'undefined', 'Not provided']) assert.equal(message.includes(text), false)
  assert.ok(message.includes('Preferred contact method: Phone call'))
  assert.ok(message.includes('Site visit requested: No'))
})

test('Every project category gets a readable label', () => {
  for (const [project, label] of Object.entries({ residential: 'Residential Rooftop', commercial: 'Commercial Solar', agricultural: 'Agricultural / Ground-Mounted', other: 'Other' })) {
    assert.ok(contactEnquiryMessage(company, { ...customer, project, message: 'A test enquiry.' }).includes(label))
  }
})

test('URLs target the official international number and encode newlines/Unicode exactly once', () => {
  const message = 'Hello దేవి & Ravi!\n₹2500 + 5% #solar? 🙂'
  for (const number of ['6300182036', '916300182036', '+91 6300182036']) {
    const url = whatsappMessageUrl(number, message)
    assert.equal(url, `https://wa.me/916300182036?text=${encodeURIComponent(message)}`)
    assert.equal(new URL(url).searchParams.get('text'), message)
    assert.ok(url.includes('%0A'))
  }
})

test('Missing or invalid WhatsApp configuration produces no link', () => {
  for (const number of ['', 'not-configured', '12345', '910000000000']) assert.equal(whatsappMessageUrl(number, 'Test'), null)
})

test('Photo contents, filenames and unrelated properties cannot enter a message', () => {
  const data = { ...customer, preferredContact: 'phone', requestSiteVisit: true, photos: [{ name: 'private-roof.png', contents: 'data:image/png;base64,PRIVATE_BYTES' }], secret: 'private-provider-secret' }
  const message = solarAssessmentMessage(company, data)
  for (const value of ['private-roof.png', 'base64', 'PRIVATE_BYTES', 'private-provider-secret']) assert.equal(message.includes(value), false)
})

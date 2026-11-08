import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { QR_OFFERS, QR_VARIANTS, REQUEST_BANNERS, pickBanner, pickQrVariant, qrForSheet, qrOffer, qrUrl, qrShortUrl, qrVariant } from '../src/data/printMessages.js'
import { qrNumber } from '../src/utils/qrLanding.js'
import { scanKind } from '../src/utils/qrVariants.js'
import { makeTest, makeWorksheet, topicsFor } from '../src/math/registry.js'
import { countsAsScan, onRequest, scanRecord, shortTarget } from '../functions/p/[[path]].js'

test('QR variants have unique ids the database accepts, and short printable text', () => {
  const ids = QR_VARIANTS.map(v => v.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const v of QR_VARIANTS) {
    assert.match(v.id, /^[a-z][0-9]{1,2}$/, v.id) // same check as record_qr_variant
    assert.ok(['page', 'request', 'channel'].includes(v.to), v.id)
    assert.ok(v.title.length <= 45 && v.line.length <= 50, `${v.id} is too long for the badge`)
    assert.ok(!/פתרונ/.test(v.title + v.line), 'no "scan for answers" promise')
  }
  // Retired ids never come back with new wording: old prints keep counting under their own message.
  for (const id of ['g1', 'g2', 'g3', 'g4', 'r1', 'r2', 'r3', 'w1', 'w2']) assert.ok(qrVariant(id) && !ids.includes(id), id)
})

test('QR links carry the variant and lead to the page or to the request form', () => {
  const page = QR_VARIANTS.find(v => v.to === 'page'), req = qrVariant('r1')
  assert.equal(qrUrl('https://ugabuga.co.il', '/printables/hebrew-letters', page), `https://ugabuga.co.il/printables/hebrew-letters?utm_source=qr&utm_medium=print&utm_content=${page.id}`)
  const r = new URL(qrUrl('https://ugabuga.co.il', '/learn/reading/grade-3', req))
  assert.equal(r.pathname, '/request')
  assert.equal(r.searchParams.get('from'), '/learn/reading/grade-3')
  assert.equal(r.searchParams.get('utm_source'), 'qr')
  assert.equal(r.searchParams.get('utm_content'), req.id)
})

test('the printed QR holds a short link that redirects to the tagged page', () => {
  const o = 'https://ugabuga.co.il'
  for (const v of QR_VARIANTS) {
    const short = qrShortUrl(o, '/printables/mazes', v)
    assert.ok(short.length <= 50, short)
    const parts = new URL(short).pathname.split('/').slice(2)
    assert.equal(shortTarget(o, parts), qrUrl(o, '/printables/mazes', v, 'qr-link'))
  }
  assert.equal(qrShortUrl(o, '/', QR_VARIANTS[0]), `${o}/p/${QR_VARIANTS[0].id}`)
  assert.equal(shortTarget(o, ['r2', 'learn', 'reading']), qrUrl(o, '/learn/reading', qrVariant('r2'), 'qr-link'))
  // Junk never breaks the redirect: unknown ids and odd paths land on a tagged page.
  assert.equal(shortTarget(o, ['zz', 'a b']), qrUrl(o, '/', qrVariant('g1'), 'qr-link'))
})

test('channel QR variants lead to the WhatsApp landing page', () => {
  const w = qrVariant('w1')
  assert.ok(w, 'the channel message still resolves for sheets already printed')
  const u = new URL(qrUrl('https://ugabuga.co.il', '/printables/mazes', w))
  assert.equal(u.pathname, '/whatsapp')
  assert.equal(u.searchParams.get('utm_content'), w.id)
  assert.match(readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8'), /path="\/whatsapp" element=\{<WhatsAppChannel \/>\}/)
})

test('every variant and banner can be picked', () => {
  assert.deepEqual(QR_VARIANTS.map((_, i) => pickQrVariant((i + 0.5) / QR_VARIANTS.length).id), QR_VARIANTS.map(v => v.id))
  assert.deepEqual(REQUEST_BANNERS.map((_, i) => pickBanner((i + 0.5) / REQUEST_BANNERS.length)), REQUEST_BANNERS)
  assert.ok(pickQrVariant(0.999999) && pickBanner(0.999999))
})

test('the request page is routed, in the sitemap and in the site search', () => {
  assert.match(readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8'), /path="\/request" element=\{<RequestPage \/>\}/)
  assert.ok(readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8').includes('https://ugabuga.co.il/request</loc>'))
  assert.ok(readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8').includes("to: '/request'"))
})

test('home experiment: three versions, stable within a day, a different one every day', async () => {
  const { HOME_EXPERIMENT, HOME_VARIANTS, homeVariant } = await import('../src/utils/experiments.js')
  assert.match(HOME_EXPERIMENT, /^[a-z][a-z0-9-]{1,30}$/)
  assert.equal(HOME_VARIANTS.length, 3)
  for (const v of HOME_VARIANTS) assert.match(v, /^[a-z][a-z0-9-]{0,20}$/)
  const store = new Map()
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) }
  const day = 86400000, noon = Date.UTC(2026, 10, 3, 10)
  const today = homeVariant('', 0.9, noon)
  assert.equal(homeVariant('', 0.0, noon + 3600000), today, 'same visitor, same day: same version')
  const week = [0, 1, 2].map(d => homeVariant('', 0.0, noon + d * day))
  assert.deepEqual([...new Set(week)].sort(), [...HOME_VARIANTS].sort(), 'three days in a row show all three versions')
  assert.equal(homeVariant('?exp=ai', 0.0, noon), 'ai', 'the owner can preview a version')
  // On one day, the three starting points cover all three versions (balanced across visitors).
  const visitors = [0, 1, 2].map(o => { store.clear(); return homeVariant('', o / 3 + 0.01, noon) })
  assert.deepEqual([...new Set(visitors)].sort(), [...HOME_VARIANTS].sort())
  delete globalThis.localStorage
})

test('every offer pairs a real promise with the old line, and ids never collide', () => {
  const ids = [...QR_VARIANTS.map(v => v.id), ...Object.values(QR_OFFERS).flatMap(o => [o.fresh.id, o.control.id])]
  assert.equal(new Set(ids).size, ids.length)
  for (const o of Object.values(QR_OFFERS)) {
    for (const v of [o.fresh, o.control]) {
      assert.match(v.id, /^[a-z][0-9]{1,2}$/)
      assert.ok(v.title.length <= 45 && v.line.length <= 50, v.id)
      assert.equal(qrVariant(v.id), v)
    }
    assert.equal(o.control.title, qrVariant('g8').title) // the control is the line it is measured against
    assert.ok(!o.control.show && !o.control.carry)
  }
  assert.ok(!QR_VARIANTS.some(v => v.show), 'only marked sheets may promise answers')
})

test('half the prints link to the sheet itself, the other half stay as they were', () => {
  const o = 'https://ugabuga.co.il', sheet = { qrOffer: 'math', qrPath: '/math/grade-1/add', qrQuery: 'l=2&s=123' }
  const on = qrForSheet(sheet, 'fresh', QR_VARIANTS[0], o, '/math/grade-1')
  assert.equal(on.variant.id, 'a3')
  assert.equal(on.url, `${o}/p/a3/math/grade-1/add?l=2&s=123`)
  const off = qrForSheet(sheet, 'control', QR_VARIANTS[0], o, '/math/grade-1')
  assert.equal(off.variant.id, 'c3')
  assert.equal(off.url, `${o}/p/c3/math/grade-1`)
  // a sheet without an offer (an answer key, any other page) keeps the rotating message
  const plain = qrForSheet({}, 'fresh', QR_VARIANTS[0], o, '/printables/mazes')
  assert.equal(plain.variant, QR_VARIANTS[0])
  assert.equal(plain.url, `${o}/p/${QR_VARIANTS[0].id}/printables/mazes`)
  assert.deepEqual(qrOffer('reading', '/learn/reading/x'), { 'data-qr-offer': 'reading', 'data-qr-path': '/learn/reading/x', 'data-qr-query': undefined })
})

test('the short link opens the answers of that very sheet and drops anything else', () => {
  const o = 'https://ugabuga.co.il', parts = ['a3', 'math', 'grade-1', 'add']
  const to = new URL(shortTarget(o, parts, '?l=2&s=123'))
  assert.equal(to.pathname, '/math/grade-1/add')
  assert.equal(to.searchParams.get('show'), 'answers')
  assert.equal(to.searchParams.get('s'), '123')
  assert.equal(to.searchParams.get('utm_medium'), 'qr-link')
  assert.equal(new URL(shortTarget(o, parts, '?x=<script>')).searchParams.get('x'), null)
  // the control and the plain messages never pass a query along
  assert.equal(new URL(shortTarget(o, ['c3', 'math'], '?s=1')).searchParams.get('s'), null)
  assert.equal(new URL(shortTarget(o, ['a5', 'holidays', 'sigd', 'coloring'], '?next=orit')).searchParams.get('show'), null)
  assert.equal(new URL(shortTarget(o, ['a5', 'holidays', 'sigd', 'coloring'], '?next=orit')).searchParams.get('next'), 'orit')
})

test('the same seed rebuilds the same math sheet, so the answers match the paper', () => {
  const topic = topicsFor(1)[0], key = list => JSON.stringify(list.map(ex => [ex.q, ex.expr, ex.answer]))
  assert.equal(key(makeWorksheet(topic, 2, 20, 123456)), key(makeWorksheet(topic, 2, 20, 123456)))
  assert.notEqual(key(makeWorksheet(topic, 2, 20, 123456)), key(makeWorksheet(topic, 2, 20, 654321)))
  assert.equal(key(makeTest(1, 10, 777, 0)), key(makeTest(1, 10, 777, 0)))
})

const req = (ua, extra = {}, method = 'GET') => ({ method, headers: new Headers({ 'user-agent': ua, ...extra }) })
const PHONE = 'Mozilla/5.0 (Linux; Android 14; CUBOT X) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'

test('a scan is counted on the server, once, and only for people', () => {
  assert.ok(countsAsScan(req(PHONE)))
  for (const ua of ['WhatsApp/2.24', 'facebookexternalhit/1.1', 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'TelegramBot', '']) assert.ok(!countsAsScan(req(ua)), ua)
  assert.ok(!countsAsScan(req(PHONE, { 'sec-purpose': 'prefetch' })))
  assert.ok(!countsAsScan(req(PHONE, {}, 'HEAD')))
  // The owner's own phone is left out; other cookies are not mistaken for it.
  assert.ok(!countsAsScan(req(PHONE, { cookie: 'x=1; buga-owner=1' })))
  assert.ok(countsAsScan(req(PHONE, { cookie: 'not-buga-owner=1; buga-owner=0' })))
  assert.deepEqual(scanRecord(['a1', 'learn', 'reading', 'x']), { p_variant: 'a1', p_kind: 'scanned', p_path: '/learn/reading/x' })
  assert.equal(scanRecord(['zz', 'x']), null)
  assert.equal(scanKind('qr-link'), 'opened') // the page does not count it a second time
  assert.equal(scanKind('print'), 'scanned') // old sheets with the long link
})

test('the redirect records the scan without waiting for it, and survives a failed count', async () => {
  const calls = [], waits = [], realFetch = globalThis.fetch
  globalThis.fetch = (url, init) => { calls.push([url, init]); return Promise.reject(new Error('down')) }
  try {
    const res = onRequest({ request: new Request('https://ugabuga.co.il/p/a1/learn/reading/x', { headers: { 'user-agent': PHONE } }), params: { path: ['a1', 'learn', 'reading', 'x'] }, waitUntil: p => waits.push(p) })
    assert.equal(res.status, 302)
    assert.ok(res.headers.get('location').includes('show=answers'))
    assert.equal(calls.length, 1)
    assert.match(calls[0][0], /record_qr_variant$/)
    assert.deepEqual(JSON.parse(calls[0][1].body), { p_variant: 'a1', p_kind: 'scanned', p_path: '/learn/reading/x' })
    assert.ok(!('keepalive' in calls[0][1]))
    await Promise.all(waits)
  } finally { globalThis.fetch = realFetch }
})

test('numbers from the QR address are checked', () => {
  const q = new URLSearchParams('s=123&l=9&x=abc')
  assert.equal(qrNumber(q, 's', 1, 1000), 123)
  assert.equal(qrNumber(q, 'l', 1, 3), null)
  assert.equal(qrNumber(q, 'x', 0, 9), null)
  assert.equal(qrNumber(null, 's', 1, 9), null)
})
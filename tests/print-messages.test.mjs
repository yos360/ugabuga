import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { QR_VARIANTS, REQUEST_BANNERS, pickBanner, pickQrVariant, qrUrl } from '../src/data/printMessages.js'

test('QR variants have unique ids the database accepts, and short printable text', () => {
  const ids = QR_VARIANTS.map(v => v.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const v of QR_VARIANTS) {
    assert.match(v.id, /^[a-z][0-9]{1,2}$/, v.id) // same check as record_qr_variant
    assert.ok(['page', 'request'].includes(v.to), v.id)
    assert.ok(v.title.length <= 45 && v.line.length <= 50, `${v.id} is too long for the badge`)
    assert.ok(!/פתרונ/.test(v.title + v.line), 'no "scan for answers" promise')
  }
  assert.ok(QR_VARIANTS.some(v => v.to === 'request'), 'some prints invite a page request')
})

test('QR links carry the variant and lead to the page or to the request form', () => {
  const page = QR_VARIANTS.find(v => v.to === 'page'), req = QR_VARIANTS.find(v => v.to === 'request')
  assert.equal(qrUrl('https://ugabuga.co.il', '/printables/hebrew-letters', page), `https://ugabuga.co.il/printables/hebrew-letters?utm_source=qr&utm_medium=print&utm_content=${page.id}`)
  const r = new URL(qrUrl('https://ugabuga.co.il', '/learn/reading/grade-3', req))
  assert.equal(r.pathname, '/request')
  assert.equal(r.searchParams.get('from'), '/learn/reading/grade-3')
  assert.equal(r.searchParams.get('utm_source'), 'qr')
  assert.equal(r.searchParams.get('utm_content'), req.id)
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

test('home experiment variants match the database checks and assignment is sticky', async () => {
  const { HOME_EXPERIMENT, HOME_VARIANTS, homeVariant } = await import('../src/utils/experiments.js')
  assert.match(HOME_EXPERIMENT, /^[a-z][a-z0-9-]{1,30}$/)
  for (const v of HOME_VARIANTS) assert.match(v, /^[a-z][a-z0-9-]{0,20}$/)
  const store = new Map()
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) }
  const first = homeVariant('', 0.9)
  assert.equal(first, HOME_VARIANTS.at(-1))
  assert.equal(homeVariant('', 0.0), first, 'a returning visitor keeps the variant')
  assert.equal(homeVariant('?exp=live', 0.0), 'live', 'the owner can preview a variant')
  delete globalThis.localStorage
})

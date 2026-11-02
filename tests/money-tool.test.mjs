// /tools/currency + /tools/vat: pure logic (parsing, rates, conversion, search, VAT rounding)
import { test } from 'node:test'
import assert from 'node:assert/strict'
const L = await import('../src/office/money/moneyLogic.js')
const F = await import('../functions/api/rates.js')

const ER_API = { result: 'success', base_code: 'ILS', time_last_update_unix: 1793577751, time_last_update_utc: 'Mon, 02 Nov 2026 00:02:31 +0000', rates: { ILS: 1, USD: 0.318423, EUR: 0.285418, THB: 10.753975, GEL: 0.83276, XAU: 0.0001, BTC: 0.000003 } }
const FAWAZ = { date: '2026-11-01', ils: { usd: 0.32119879, eur: 0.2861, thb: 10.83445088, gel: 0.83351949, btc: 0.0000031 } }

test('currency list: unique codes, Hebrew names, flags, Thailand & Georgia near the top', () => {
  assert.equal(new Set(L.CODES).size, L.CODES.length)
  for (const c of L.CURRENCIES) {
    assert.match(c.code, /^[A-Z]{3}$/)
    assert.match(c.name, /[א-ת]/)
    assert.ok(c.flag && c.symbol, c.code)
  }
  for (const code of ['ILS', 'USD', 'EUR', 'GBP', 'THB', 'GEL', 'TRY', 'AED', 'EGP', 'JOD', 'CHF', 'JPY', 'CAD', 'AUD', 'RUB', 'UAH', 'CZK', 'HUF', 'PLN', 'BGN', 'RON', 'CNY', 'INR', 'VND', 'MXN', 'BRL', 'ZAR', 'SEK', 'NOK', 'DKK']) assert.ok(L.BY_CODE[code], code)
  assert.ok(L.CODES.indexOf('THB') < L.POPULAR_COUNT && L.CODES.indexOf('GEL') < L.POPULAR_COUNT)
  for (const code of L.QUICK_PAIRS) assert.ok(L.BY_CODE[code])
  // the built-in fallback covers every listed currency
  for (const code of L.CODES) assert.ok(L.BUILTIN_RATES.rates[code] > 0, code)
  assert.ok(L.validateRates(L.BUILTIN_RATES))
})

test('parseAmount: commas, spaces, currency signs, junk', () => {
  assert.equal(L.parseAmount('100'), 100)
  assert.equal(L.parseAmount('1,234.50'), 1234.5)
  assert.equal(L.parseAmount('12,5'), 12.5)
  assert.equal(L.parseAmount('1 000'), 1000)
  assert.equal(L.parseAmount('₪ 99.90'), 99.9)
  assert.equal(L.parseAmount('$20'), 20)
  assert.equal(L.parseAmount('.5'), 0.5)
  assert.equal(L.parseAmount(''), null)
  assert.equal(L.parseAmount('abc'), null)
  assert.equal(L.parseAmount('1.2.3'), null)
})

test('round: half-up and float-safe', () => {
  assert.equal(L.round(1.005, 2), 1.01)
  assert.equal(L.round(2.675, 2), 2.68)
  assert.equal(L.round(-1.005, 2), -1.01)
  assert.equal(L.round(0.125, 2), 0.13)
  assert.equal(L.round(1e20, 2), 1e20)
})

test('parseUpstream: open.er-api.com', () => {
  const d = L.parseUpstream(ER_API)
  assert.equal(d.base, 'ILS')
  assert.equal(d.date, '2026-11-02')
  assert.equal(d.rates.ILS, 1)
  assert.equal(d.rates.THB, 10.753975)
  assert.equal(d.rates.GEL, 0.83276)
  assert.equal(d.rates.XAU, undefined) // only our currencies
  assert.equal(d.rates.BTC, undefined)
})

test('parseUpstream: fawazahmed0 currency-api (lowercase keys)', () => {
  const d = L.parseUpstream(FAWAZ)
  assert.equal(d.date, '2026-11-01')
  assert.equal(d.rates.USD, 0.32119879)
  assert.equal(d.rates.GEL, 0.83351949)
  assert.equal(d.rates.ILS, 1)
})

test('parseUpstream: rebases a USD-based table to ILS', () => {
  const d = L.parseUpstream({ result: 'success', base_code: 'USD', time_last_update_unix: 1793577751, rates: { USD: 1, ILS: 3.2, EUR: 0.9, THB: 32 } })
  assert.equal(d.rates.ILS, 1)
  assert.ok(Math.abs(d.rates.USD - 1 / 3.2) < 1e-12)
  assert.ok(Math.abs(d.rates.THB - 10) < 1e-12)
})

test('parseUpstream / validateRates reject garbage', () => {
  assert.equal(L.parseUpstream(null), null)
  assert.equal(L.parseUpstream('x'), null)
  assert.equal(L.parseUpstream({ result: 'error', 'error-type': 'unsupported-code' }), null)
  assert.equal(L.parseUpstream({ result: 'success', base_code: 'ILS', time_last_update_unix: 1793577751, rates: { EUR: 0.28 } }), null) // no USD
  assert.equal(L.parseUpstream({ result: 'success', base_code: 'ILS', time_last_update_unix: 1793577751, rates: { USD: 50, EUR: 0.28 } }), null) // absurd
  assert.equal(L.parseUpstream({ result: 'success', base_code: 'ILS', time_last_update_unix: 1793577751, rates: { USD: -1, EUR: 0.28 } }), null)
  assert.equal(L.validateRates({ base: 'USD', date: '2026-11-01', rates: { USD: 1 } }), null)
  assert.equal(L.validateRates({ base: 'ILS', date: 'yesterday', rates: { USD: 0.3, EUR: 0.28 } }), null)
  assert.equal(L.validateRates('{"base":"ILS"}'), null)
  const ok = L.validateRates({ base: 'ILS', date: '2026-11-01', rates: { USD: 0.3, EUR: 0.28, THB: 'NaN', GEL: 0 } })
  assert.ok(ok)
  assert.equal(ok.rates.THB, undefined)
  assert.equal(ok.rates.GEL, undefined)
})

test('convert: both directions, cross rates, missing rates', () => {
  const r = L.parseUpstream(ER_API).rates
  assert.ok(Math.abs(L.convert(100, 'ILS', 'USD', r) - 31.8423) < 1e-9)
  assert.ok(Math.abs(L.convert(31.8423, 'USD', 'ILS', r) - 100) < 1e-9)
  assert.ok(Math.abs(L.convert(1000, 'THB', 'ILS', r) - 1000 / 10.753975) < 1e-9)
  assert.ok(Math.abs(L.convert(1, 'USD', 'EUR', r) - 0.285418 / 0.318423) < 1e-12)
  assert.equal(L.convert(5, 'USD', 'USD', r), 5)
  assert.equal(L.convert(5, 'USD', 'JPY', r), null) // not in this table
  assert.equal(L.convert(NaN, 'USD', 'ILS', r), null)
  assert.equal(L.convert(5, 'USD', 'ILS', null), null)
})

test('travel table: round amounts worth at least a few shekels, ₪ on the other side', () => {
  const r = L.BUILTIN_RATES.rates
  assert.deepEqual(L.travelAmounts('USD', r), [10, 50, 100, 500])
  assert.deepEqual(L.travelAmounts('THB', r), [100, 500, 1000, 5000])
  assert.deepEqual(L.travelAmounts('GEL', r), [10, 50, 100, 500])
  assert.deepEqual(L.travelAmounts('VND', r), [100000, 500000, 1000000, 5000000])
  const t = L.travelTable('ILS', 'THB', r)
  assert.equal(t.foreign, 'THB')
  assert.equal(t.other, 'ILS')
  assert.ok(Math.abs(t.rows[0].result - 100 / r.THB) < 1e-9)
  assert.equal(L.travelTable('ILS', 'ILS', r), null)
  assert.equal(L.travelTable('USD', 'EUR', r).other, 'EUR')
})

test('formatting: decimals by size and currency', () => {
  assert.equal(L.formatMoney(314.05, 'ILS'), '314.05')
  assert.equal(L.formatMoney(314, 'ILS'), '314')
  assert.equal(L.formatMoney(3.5, 'USD'), '3.50')
  assert.equal(L.formatMoney(1234.5, 'ILS'), '1,234.50')
  assert.equal(L.formatMoney(150372.6, 'JPY'), '150,373')
  assert.equal(L.formatMoney(0.0931, 'ILS'), '0.0931')
  assert.equal(L.formatMoney(0, 'ILS'), '0')
  assert.equal(L.plainMoney(1234.567, 'ILS'), '1234.57')
  assert.equal(L.plainMoney(150372.6, 'JPY'), '150373')
  assert.equal(L.formatDate('2026-11-02'), '02.11.2026')
  assert.equal(L.formatDate('bad'), '')
  assert.equal(L.daysOld('2026-11-01', '2026-11-04'), 3)
})

test('search: Hebrew, partial, English, destination, code', () => {
  const first = q => L.searchCurrencies(q)[0]?.code
  assert.equal(first('תאי'), 'THB')
  assert.equal(first('baht'), 'THB')
  assert.equal(first('BAHT'), 'THB')
  assert.equal(first('גאורגיה'), 'GEL')
  assert.equal(first('גרוזיה'), 'GEL')
  assert.equal(first('לארי'), 'GEL')
  assert.equal(first('lari'), 'GEL')
  assert.equal(first('קפריסין'), 'EUR')
  assert.equal(first('יוון'), 'EUR')
  assert.equal(first('gel'), 'GEL')
  assert.equal(first('usd'), 'USD')
  assert.equal(first('דובאי'), 'AED')
  assert.equal(first("צ'כ"), 'CZK')
  assert.equal(first('שקל'), 'ILS')
  assert.ok(L.searchCurrencies('דולר').some(c => c.code === 'CAD'))
  assert.equal(L.searchCurrencies('דולר')[0].code, 'USD') // popular first
  assert.equal(L.searchCurrencies('').length, L.CURRENCIES.length)
  assert.deepEqual(L.searchCurrencies('zzzzqq'), [])
})

test('client: fetchLiveRates never throws; pickRates falls back live → saved → built-in', async () => {
  const good = { base: 'ILS', date: '2026-11-03', rates: { ILS: 1, USD: 0.31, EUR: 0.28 } }
  const okFetch = async () => ({ ok: true, json: async () => good })
  assert.equal((await L.fetchLiveRates(okFetch)).date, '2026-11-03')
  assert.equal(await L.fetchLiveRates(async () => ({ ok: false, status: 404 })), null)
  assert.equal(await L.fetchLiveRates(async () => { throw new Error('offline') }), null)
  assert.equal(await L.fetchLiveRates(async () => ({ ok: true, json: async () => { throw new SyntaxError('html') } })), null) // vite dev serves index.html
  assert.equal(await L.fetchLiveRates(async () => ({ ok: true, json: async () => ({ error: 'upstream' }) })), null)
  assert.equal(L.pickRates(good, null).source, 'live')
  assert.equal(L.pickRates(null, good).source, 'saved')
  assert.equal(L.pickRates(null, { ...good, date: '2020-01-01' }).source, 'builtin') // older than the built-in snapshot
  assert.equal(L.pickRates(null, 'junk').source, 'builtin')
  assert.equal(L.pickRates(null, null).data, L.BUILTIN_RATES)
})

test('rates function: tries the backup source and returns compact data', async () => {
  const calls = []
  const fetcher = async url => {
    calls.push(url)
    if (url.includes('er-api')) return { ok: false, status: 503 }
    return { ok: true, json: async () => FAWAZ }
  }
  const d = await F.fetchRates(fetcher)
  assert.equal(calls.length, 2)
  assert.equal(d.date, '2026-11-01')
  assert.equal(d.rates.THB, 10.83445088)
  assert.equal(await F.fetchRates(async () => { throw new Error('down') }), null)
  assert.equal((await F.fetchRates(async () => ({ ok: true, json: async () => ER_API }))).rates.GEL, 0.83276)
})

test('rates function: 405 for POST, 502 when all upstreams fail (no cache in node)', async () => {
  const post = await F.onRequest({ request: new Request('https://x.test/api/rates', { method: 'POST' }) })
  assert.equal(post.status, 405)
  const orig = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('offline') }
  try {
    const res = await F.onRequest({ request: new Request('https://x.test/api/rates') })
    assert.equal(res.status, 502)
    assert.equal(res.headers.get('Cache-Control'), 'no-store')
  } finally { globalThis.fetch = orig }
  globalThis.fetch = async () => ({ ok: true, json: async () => ER_API })
  try {
    const res = await F.onRequest({ request: new Request('https://x.test/api/rates?x=1') })
    assert.equal(res.status, 200)
    assert.match(res.headers.get('Cache-Control'), /s-maxage=21600/)
    const body = await res.json()
    assert.equal(body.base, 'ILS')
    assert.equal(body.rates.THB, 10.753975)
  } finally { globalThis.fetch = orig }
})

test('VAT 18%: add VAT, exact agorot', () => {
  assert.equal(L.VAT_RATE, 18)
  assert.deepEqual(L.addVat(100), { net: 100, vat: 18, gross: 118 })
  assert.deepEqual(L.addVat(250), { net: 250, vat: 45, gross: 295 })
  assert.deepEqual(L.addVat(1), { net: 1, vat: 0.18, gross: 1.18 })
  assert.deepEqual(L.addVat(99.99), { net: 99.99, vat: 18, gross: 117.99 }) // 17.9982 → 18.00
  assert.deepEqual(L.addVat(0.25), { net: 0.25, vat: 0.05, gross: 0.3 }) // 0.045 → 0.05 (half up)
  assert.deepEqual(L.addVat(0.05), { net: 0.05, vat: 0.01, gross: 0.06 }) // 0.009 → 0.01
  assert.deepEqual(L.addVat(0.02), { net: 0.02, vat: 0, gross: 0.02 }) // 0.0036 → 0
  assert.deepEqual(L.addVat(1234.56), { net: 1234.56, vat: 222.22, gross: 1456.78 }) // 222.2208
  assert.deepEqual(L.addVat(10.555), { net: 10.56, vat: 1.9, gross: 12.46 }) // net rounded to agorot first
  assert.deepEqual(L.addVat(0), { net: 0, vat: 0, gross: 0 })
  assert.deepEqual(L.addVat(-100), { net: -100, vat: -18, gross: -118 }) // credit note
})

test('VAT 18%: extract VAT from a gross price, parts always add up', () => {
  assert.deepEqual(L.extractVat(118), { net: 100, vat: 18, gross: 118 })
  assert.deepEqual(L.extractVat(590), { net: 500, vat: 90, gross: 590 })
  assert.deepEqual(L.extractVat(100), { net: 84.75, vat: 15.25, gross: 100 }) // 84.745… → 84.75
  assert.deepEqual(L.extractVat(1), { net: 0.85, vat: 0.15, gross: 1 })
  assert.deepEqual(L.extractVat(1180), { net: 1000, vat: 180, gross: 1180 })
  assert.deepEqual(L.extractVat(99.9), { net: 84.66, vat: 15.24, gross: 99.9 })
  for (let c = 0; c <= 5000; c += 7) {
    const g = c / 100
    const x = L.extractVat(g)
    assert.equal(Math.round(x.net * 100) + Math.round(x.vat * 100), c, `sum ${g}`)
    assert.ok(Math.abs(x.net * 1.18 - g) <= 0.006 + 1e-9, `net ${g}`)
    const a = L.addVat(g)
    assert.equal(Math.round(a.net * 100) + Math.round(a.vat * 100), Math.round(a.gross * 100))
  }
})

test('VAT: other rates (Eilat 0%, 17%), guards', () => {
  assert.deepEqual(L.addVat(100, 0), { net: 100, vat: 0, gross: 100 })
  assert.deepEqual(L.extractVat(100, 0), { net: 100, vat: 0, gross: 100 })
  assert.deepEqual(L.addVat(100, 17), { net: 100, vat: 17, gross: 117 })
  assert.deepEqual(L.extractVat(117, 17), { net: 100, vat: 17, gross: 117 })
  assert.equal(L.vatFactor(18), 1.18)
  assert.equal(L.vatFactor(0), 1)
  assert.equal(L.addVat(NaN), null)
  assert.equal(L.addVat(100, -1), null)
  assert.equal(L.extractVat(1e13), null)
  assert.equal(L.formatShekel(1234.5), '1,234.50')
})

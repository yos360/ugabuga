// Pure logic for /tools/currency and /tools/vat. No DOM, no network — shared by the pages,
// by functions/api/rates.js (upstream parsing) and by tests/money-tool.test.mjs.

// ---------------------------------------------------------------- currencies
// Ordered by how often Israelis need them (travel + shopping). `places` lets people search by
// destination ("קפריסין" finds the euro). `en` holds English names / slang for latin search.
export const CURRENCIES = [
  { code: 'ILS', flag: '🇮🇱', name: 'שקל חדש', country: 'ישראל', symbol: '₪', en: 'shekel nis israel', places: 'שח ש״ח שקלים' },
  { code: 'USD', flag: '🇺🇸', name: 'דולר אמריקאי', country: 'ארצות הברית', symbol: '$', en: 'us dollar usa america', places: 'אמריקה ארה״ב ניו יורק דולרים' },
  { code: 'EUR', flag: '🇪🇺', name: 'אירו', country: 'גוש האירו', symbol: '€', en: 'euro europe greece cyprus italy spain france germany', places: 'יורו אירופה יוון קפריסין איטליה ספרד צרפת גרמניה פורטוגל הולנד אוסטריה בלגיה קרואטיה מונטנגרו מלטה אירלנד פינלנד סלובקיה סלובניה' },
  { code: 'THB', flag: '🇹🇭', name: 'באט תאילנדי', country: 'תאילנד', symbol: '฿', en: 'thai baht thailand bangkok', places: 'בהט בנגקוק קוסמוי פוקט' },
  { code: 'GEL', flag: '🇬🇪', name: 'לארי גאורגי', country: 'גאורגיה', symbol: '₾', en: 'georgian lari georgia tbilisi batumi', places: 'גרוזיה לרי טביליסי בטומי' },
  { code: 'GBP', flag: '🇬🇧', name: 'לירה שטרלינג', country: 'בריטניה', symbol: '£', en: 'british pound sterling uk england london', places: 'פאונד אנגליה לונדון סקוטלנד' },
  { code: 'TRY', flag: '🇹🇷', name: 'לירה טורקית', country: 'טורקיה', symbol: '₺', en: 'turkish lira turkey istanbul', places: 'איסטנבול אנטליה' },
  { code: 'AED', flag: '🇦🇪', name: 'דירהם אמירתי', country: 'איחוד האמירויות', symbol: 'د.إ', en: 'uae dirham emirates dubai abu dhabi', places: 'דובאי אבו דאבי אמירויות' },
  { code: 'EGP', flag: '🇪🇬', name: 'לירה מצרית', country: 'מצרים', symbol: 'E£', en: 'egyptian pound egypt sinai', places: 'סיני שארם' },
  { code: 'JOD', flag: '🇯🇴', name: 'דינר ירדני', country: 'ירדן', symbol: 'JD', en: 'jordanian dinar jordan petra', places: 'פטרה עקבה' },
  { code: 'HUF', flag: '🇭🇺', name: 'פורינט הונגרי', country: 'הונגריה', symbol: 'Ft', en: 'hungarian forint hungary budapest', places: 'בודפשט' },
  { code: 'CZK', flag: '🇨🇿', name: 'קורונה צ׳כית', country: 'צ׳כיה', symbol: 'Kč', en: 'czech koruna crown prague', places: 'פראג כתר' },
  { code: 'PLN', flag: '🇵🇱', name: 'זלוטי פולני', country: 'פולין', symbol: 'zł', en: 'polish zloty poland warsaw krakow', places: 'ורשה קרקוב' },
  { code: 'BGN', flag: '🇧🇬', name: 'לב בולגרי', country: 'בולגריה', symbol: 'лв', en: 'bulgarian lev bulgaria sofia', places: 'סופיה בנסקו' },
  { code: 'RON', flag: '🇷🇴', name: 'לאו רומני', country: 'רומניה', symbol: 'lei', en: 'romanian leu lei romania bucharest', places: 'בוקרשט' },
  { code: 'RSD', flag: '🇷🇸', name: 'דינר סרבי', country: 'סרביה', symbol: 'дин', en: 'serbian dinar serbia belgrade', places: 'בלגרד' },
  { code: 'ALL', flag: '🇦🇱', name: 'לק אלבני', country: 'אלבניה', symbol: 'L', en: 'albanian lek albania tirana', places: 'טירנה' },
  { code: 'MAD', flag: '🇲🇦', name: 'דירהם מרוקאי', country: 'מרוקו', symbol: 'DH', en: 'moroccan dirham morocco marrakesh', places: 'מרקש' },
  { code: 'CHF', flag: '🇨🇭', name: 'פרנק שווייצרי', country: 'שווייץ', symbol: 'Fr', en: 'swiss franc switzerland', places: 'שוויץ ציריך' },
  { code: 'JPY', flag: '🇯🇵', name: 'ין יפני', country: 'יפן', symbol: '¥', en: 'japanese yen japan tokyo', places: 'טוקיו' },
  { code: 'CNY', flag: '🇨🇳', name: 'יואן סיני', country: 'סין', symbol: '¥', en: 'chinese yuan renminbi china', places: 'רנמינבי' },
  { code: 'INR', flag: '🇮🇳', name: 'רופי הודי', country: 'הודו', symbol: '₹', en: 'indian rupee india goa', places: 'רופי גואה' },
  { code: 'VND', flag: '🇻🇳', name: 'דונג וייטנאמי', country: 'וייטנאם', symbol: '₫', en: 'vietnamese dong vietnam', places: 'ויאטנם האנוי' },
  { code: 'LKR', flag: '🇱🇰', name: 'רופי סרי לנקי', country: 'סרי לנקה', symbol: 'Rs', en: 'sri lankan rupee sri lanka', places: 'ציילון' },
  { code: 'NPR', flag: '🇳🇵', name: 'רופי נפאלי', country: 'נפאל', symbol: 'Rs', en: 'nepalese rupee nepal kathmandu', places: 'קטמנדו' },
  { code: 'IDR', flag: '🇮🇩', name: 'רופיה אינדונזית', country: 'אינדונזיה', symbol: 'Rp', en: 'indonesian rupiah indonesia bali', places: 'באלי' },
  { code: 'PHP', flag: '🇵🇭', name: 'פסו פיליפיני', country: 'הפיליפינים', symbol: '₱', en: 'philippine peso philippines', places: 'פיליפינים' },
  { code: 'KRW', flag: '🇰🇷', name: 'וון דרום קוריאני', country: 'דרום קוריאה', symbol: '₩', en: 'south korean won korea seoul', places: 'קוריאה סיאול' },
  { code: 'SGD', flag: '🇸🇬', name: 'דולר סינגפורי', country: 'סינגפור', symbol: 'S$', en: 'singapore dollar', places: '' },
  { code: 'HKD', flag: '🇭🇰', name: 'דולר הונג קונגי', country: 'הונג קונג', symbol: 'HK$', en: 'hong kong dollar', places: '' },
  { code: 'CAD', flag: '🇨🇦', name: 'דולר קנדי', country: 'קנדה', symbol: 'C$', en: 'canadian dollar canada', places: 'טורונטו' },
  { code: 'AUD', flag: '🇦🇺', name: 'דולר אוסטרלי', country: 'אוסטרליה', symbol: 'A$', en: 'australian dollar australia', places: 'סידני' },
  { code: 'NZD', flag: '🇳🇿', name: 'דולר ניו זילנדי', country: 'ניו זילנד', symbol: 'NZ$', en: 'new zealand dollar', places: '' },
  { code: 'MXN', flag: '🇲🇽', name: 'פסו מקסיקני', country: 'מקסיקו', symbol: 'Mex$', en: 'mexican peso mexico cancun', places: 'קנקון' },
  { code: 'BRL', flag: '🇧🇷', name: 'ריאל ברזילאי', country: 'ברזיל', symbol: 'R$', en: 'brazilian real brazil rio', places: 'ריו' },
  { code: 'PEN', flag: '🇵🇪', name: 'סול פרואני', country: 'פרו', symbol: 'S/', en: 'peruvian sol peru', places: 'קוסקו' },
  { code: 'ARS', flag: '🇦🇷', name: 'פסו ארגנטינאי', country: 'ארגנטינה', symbol: 'AR$', en: 'argentine peso argentina', places: 'בואנוס איירס' },
  { code: 'COP', flag: '🇨🇴', name: 'פסו קולומביאני', country: 'קולומביה', symbol: 'COL$', en: 'colombian peso colombia', places: 'בוגוטה' },
  { code: 'ZAR', flag: '🇿🇦', name: 'ראנד דרום אפריקאי', country: 'דרום אפריקה', symbol: 'R', en: 'south african rand', places: 'קייפטאון' },
  { code: 'RUB', flag: '🇷🇺', name: 'רובל רוסי', country: 'רוסיה', symbol: '₽', en: 'russian ruble rouble russia', places: 'מוסקבה' },
  { code: 'UAH', flag: '🇺🇦', name: 'הריבניה אוקראינית', country: 'אוקראינה', symbol: '₴', en: 'ukrainian hryvnia ukraine uman', places: 'אומן קייב גריבנה' },
  { code: 'KZT', flag: '🇰🇿', name: 'טנגה קזחסטני', country: 'קזחסטן', symbol: '₸', en: 'kazakhstani tenge kazakhstan', places: 'אלמטי' },
  { code: 'UZS', flag: '🇺🇿', name: 'סום אוזבקי', country: 'אוזבקיסטן', symbol: 'soʻm', en: 'uzbek som uzbekistan', places: 'טשקנט סמרקנד' },
  { code: 'SEK', flag: '🇸🇪', name: 'קרונה שוודית', country: 'שוודיה', symbol: 'kr', en: 'swedish krona sweden', places: 'סטוקהולם' },
  { code: 'NOK', flag: '🇳🇴', name: 'קרונה נורווגית', country: 'נורווגיה', symbol: 'kr', en: 'norwegian krone norway', places: 'אוסלו' },
  { code: 'DKK', flag: '🇩🇰', name: 'קרונה דנית', country: 'דנמרק', symbol: 'kr', en: 'danish krone denmark', places: 'קופנהגן' },
  { code: 'ISK', flag: '🇮🇸', name: 'קרונה איסלנדית', country: 'איסלנד', symbol: 'kr', en: 'icelandic krona iceland', places: 'רייקיאוויק' },
]
export const CODES = CURRENCIES.map(c => c.code)
export const BY_CODE = Object.fromEntries(CURRENCIES.map(c => [c.code, c]))
export const POPULAR_COUNT = 10 // the first ten are shown under "הכי מבוקשים"
// One-tap pairs on the page.
export const QUICK_PAIRS = ['USD', 'EUR', 'THB', 'GEL', 'GBP', 'TRY']
// Currencies with no everyday minor unit (shown without agorot-style decimals once large).
const WHOLE = new Set(['JPY', 'KRW', 'VND', 'IDR', 'HUF', 'ISK', 'COP', 'UZS', 'KZT', 'ARS', 'LKR', 'NPR', 'RSD', 'ALL', 'INR', 'RUB', 'EGP', 'PHP', 'THB', 'TRY', 'CZK', 'UAH'])

// Last known rates (1 ₪ = X), used only when the live rates can't be loaded and nothing is saved.
export const BUILTIN_RATES = {
  base: 'ILS', date: '2026-11-02', builtin: true,
  rates: { ILS: 1, USD: 0.318423, EUR: 0.285418, THB: 10.753975, GEL: 0.83276, GBP: 0.237875, TRY: 15.912489, AED: 1.169403, EGP: 17.795357, JOD: 0.225761, HUF: 104.772557, CZK: 6.950398, PLN: 1.258959, BGN: 0.558164, RON: 1.530232, RSD: 33.615918, ALL: 26.034202, MAD: 3.143503, CHF: 0.262578, JPY: 50.178418, CNY: 2.131359, INR: 30.286168, VND: 8215.882378, LKR: 103.653583, NPR: 48.525079, IDR: 5782.559668, PHP: 20.285385, KRW: 424.696515, SGD: 0.407131, HKD: 2.498214, CAD: 0.444937, AUD: 0.453315, NZD: 0.56608, MXN: 5.990784, BRL: 1.731459, PEN: 1.108914, ARS: 489.524752, COP: 1018.152865, ZAR: 5.318829, RUB: 25.677571, UAH: 14.545465, KZT: 144.509057, UZS: 3850.023116, SEK: 3.128693, NOK: 2.936787, DKK: 2.139011, ISK: 38.931654 },
}

// ---------------------------------------------------------------- numbers
// Accepts "1,234.5", "12,5", "1 000", "₪100", "$ 20" and a trailing/leading currency sign.
export function parseAmount(value) {
  let s = String(value ?? '').trim().replace(/[\s  '’]/g, '').replace(/[₪$€£¥฿₾₺₹₽₴₩₫]/g, '')
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replaceAll(',', '')
  else if (/^[+-]?\d+,\d+$/.test(s)) s = s.replace(',', '.')
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

// Half-up rounding to `d` decimals that survives binary floats (1.005 → 1.01).
export function round(n, d = 2) {
  if (!Number.isFinite(n) || Math.abs(n) >= 1e15) return n
  const sign = n < 0 ? -1 : 1
  const r = Math.round(Number(`${Math.abs(n)}e${d}`)) // exponent shift avoids 1.005*100 = 100.4999…
  return sign * Number(`${r}e-${d}`) || 0
}

// Digits worth showing for a converted amount.
export function decimalsFor(n, code) {
  const a = Math.abs(n)
  if (a === 0) return 0
  if (WHOLE.has(code) && a >= 100) return 0
  if (a >= 1) return 2
  if (a >= 0.01) return 4
  return 6
}

export function formatMoney(n, code) {
  if (!Number.isFinite(n)) return '—'
  const d = decimalsFor(n, code)
  const v = round(n, d)
  // Money with cents shows both digits (3.50, not 3.5); whole amounts stay clean (100).
  const min = d === 2 && v % 1 !== 0 ? 2 : 0
  return new Intl.NumberFormat('he-IL', { minimumFractionDigits: min, maximumFractionDigits: d }).format(Object.is(v, -0) ? 0 : v)
}
// Plain value for the clipboard (no thousands separators — pastes cleanly into Excel/calculators).
export function plainMoney(n, code) {
  if (!Number.isFinite(n)) return ''
  return String(round(n, decimalsFor(n, code)))
}
// Rate line like "1 USD = 3.1405 ₪" — 4 significant-ish decimals.
export function formatRate(n) {
  if (!Number.isFinite(n)) return '—'
  const a = Math.abs(n)
  const d = a >= 100 ? 2 : a >= 1 ? 4 : a >= 0.01 ? 5 : 7
  return new Intl.NumberFormat('he-IL', { maximumFractionDigits: d }).format(n)
}

// ---------------------------------------------------------------- rates
const isPos = n => typeof n === 'number' && Number.isFinite(n) && n > 0
const isoDate = d => d instanceof Date && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : null

// Normalise a rate table to "1 ₪ = X", keep only our currencies, reject anything implausible.
export function normalizeRates(rawRates, base = 'ILS', date = null) {
  if (!rawRates || typeof rawRates !== 'object') return null
  const up = {}
  for (const [k, v] of Object.entries(rawRates)) up[String(k).toUpperCase()] = Number(v)
  const B = String(base).toUpperCase()
  if (B !== 'ILS') {
    if (!isPos(up.ILS)) return null
    up[B] = 1
    const ils = up.ILS
    for (const k of Object.keys(up)) up[k] = up[k] / ils
  }
  up.ILS = 1
  const rates = {}
  for (const code of CODES) if (isPos(up[code])) rates[code] = up[code]
  // Sanity: the main currencies must be there and roughly where they've been for decades.
  if (!rates.USD || !rates.EUR) return null
  if (rates.USD < 0.05 || rates.USD > 2) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) return null
  return { base: 'ILS', date, rates }
}

// Parse either upstream we use: open.er-api.com (primary) or the fawazahmed0 currency-api (backup).
export function parseUpstream(json) {
  if (!json || typeof json !== 'object') return null
  // open.er-api.com: { result: 'success', base_code, time_last_update_unix, rates: { USD: … } }
  if (json.result === 'success' && json.rates && json.base_code) {
    const date = json.time_last_update_unix ? isoDate(new Date(json.time_last_update_unix * 1000)) : isoDate(new Date(json.time_last_update_utc))
    return normalizeRates(json.rates, json.base_code, date)
  }
  // fawazahmed0: { date: '2026-11-01', ils: { usd: … } }
  if (typeof json.date === 'string') {
    const baseKey = Object.keys(json).find(k => k !== 'date' && json[k] && typeof json[k] === 'object')
    if (baseKey) return normalizeRates(json[baseKey], baseKey, json.date)
  }
  return null
}

// Validate what our own /api/rates (or localStorage) gives back.
export function validateRates(data) {
  if (!data || typeof data !== 'object' || data.base !== 'ILS') return null
  const out = normalizeRates(data.rates, 'ILS', data.date)
  return out
}

// Client side: ask our own /api/rates. Resolves to validated data or null — never throws.
export async function fetchLiveRates(fetcher = globalThis.fetch, url = '/api/rates', timeoutMs = 8000) {
  try {
    const opts = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? { signal: AbortSignal.timeout(timeoutMs) } : {}
    const res = await fetcher(url, { ...opts, headers: { Accept: 'application/json' } })
    if (!res || !res.ok) return null
    return validateRates(await res.json())
  } catch { return null }
}
// What to show: live rates, else the last ones saved on this device, else the built-in snapshot.
export function pickRates(live, saved) {
  const l = validateRates(live)
  if (l) return { data: l, source: 'live' }
  const s = validateRates(saved)
  if (s && s.date >= BUILTIN_RATES.date) return { data: s, source: 'saved' }
  return { data: BUILTIN_RATES, source: 'builtin' }
}

// ---------------------------------------------------------------- conversion
// rates: 1 ₪ = rates[X] X
export function convert(amount, from, to, rates) {
  if (!Number.isFinite(amount) || !rates) return null
  const rf = from === 'ILS' ? 1 : rates[from]
  const rt = to === 'ILS' ? 1 : rates[to]
  if (!isPos(rf) || !isPos(rt)) return null
  const out = amount / rf * rt
  return Number.isFinite(out) ? out : null
}
export const unitRate = (from, to, rates) => convert(1, from, to, rates)

// Round "travel" amounts: the smallest power of ten worth at least ~8 ₪, then ×5, ×10, ×50.
export function travelAmounts(code, rates) {
  const v = convert(1, code, 'ILS', rates)
  if (!isPos(v)) return [10, 50, 100, 500]
  let b = 1
  while (b * v < 8 && b < 1e9) b *= 10
  return [b, b * 5, b * 10, b * 50]
}
// Table for travellers: amounts of the foreign side → the other side (₪ when one side is ₪).
export function travelTable(from, to, rates) {
  const foreign = from === 'ILS' ? to : from
  const other = foreign === from ? to : from
  if (foreign === other) return null
  return { foreign, other, rows: travelAmounts(foreign, rates).map(amount => ({ amount, result: convert(amount, foreign, other, rates) })) }
}

// ---------------------------------------------------------------- search
const clean = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[֑-ׇ]/g, '').replace(/[״"'׳`.\-_]/g, '').replace(/\s+/g, ' ').trim()
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const unfinal = s => s.replace(/[ךםןףץ]/g, ch => FINAL[ch])
const hay = c => unfinal(clean(`${c.code} ${c.name} ${c.country} ${c.en} ${c.places} ${c.symbol}`))

export function searchCurrencies(query, list = CURRENCIES) {
  const q = unfinal(clean(query))
  if (!q) return list
  const scored = []
  for (const c of list) {
    const code = c.code.toLowerCase()
    const words = hay(c).split(' ')
    let score = -1
    if (code === q) score = 0
    else if (unfinal(clean(c.name)).startsWith(q) || unfinal(clean(c.country)).startsWith(q)) score = 1
    else if (words.some(w => w.startsWith(q))) score = 2
    else if (hay(c).includes(q)) score = 3
    if (score >= 0) scored.push([score, c])
  }
  // Stable: keeps the popular order inside each score band.
  return scored.sort((a, b) => a[0] - b[0]).map(x => x[1])
}

export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''))
  return m ? `${m[3]}.${m[2]}.${m[1]}` : ''
}
// Days between a rates date and "today" (both YYYY-MM-DD) — to say how stale a fallback is.
export function daysOld(iso, today) {
  const a = Date.parse(`${iso}T00:00:00Z`), b = Date.parse(`${today}T00:00:00Z`)
  return Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, Math.round((b - a) / 86400000)) : null
}

// ---------------------------------------------------------------- VAT
export const VAT_RATE = 18 // Israel, since 1.1.2025
export const VAT_PRESETS = [
  { rate: 18, label: '18%', hint: 'השיעור הרגיל בישראל' },
  { rate: 0, label: '0%', hint: 'אילת (בעסקאות הפטורות)' },
  { rate: 17, label: '17%', hint: 'עד סוף 2024' },
]
const cents = n => Math.round(Number(`${round(n, 2)}e2`))
export const VAT_MAX = 1e12 // beyond this agorot stop being exact in floating point

// Price before VAT → VAT and total. The VAT is rounded to agorot and the parts always add up.
export function addVat(net, rate = VAT_RATE) {
  if (!Number.isFinite(net) || Math.abs(net) > VAT_MAX || !Number.isFinite(rate) || rate < 0) return null
  const n = cents(net)
  // |n|·rate/100 is exact for whole rates, so x.5 agorot really rounds up.
  const v = Math.round(round(Math.abs(n) * rate, 6) / 100) * Math.sign(n || 1)
  return { net: n / 100, vat: v / 100, gross: (n + v) / 100 }
}
// Price including VAT → price before VAT and the VAT inside it.
export function extractVat(gross, rate = VAT_RATE) {
  if (!Number.isFinite(gross) || Math.abs(gross) > VAT_MAX || !Number.isFinite(rate) || rate < 0) return null
  const g = cents(gross)
  const n = Math.round(Math.abs(g) * 100 / (100 + rate)) * Math.sign(g || 1)
  return { net: n / 100, vat: (g - n) / 100, gross: g / 100 }
}
export const vatFactor = rate => round(1 + rate / 100, 4)
export function formatShekel(n) {
  return Number.isFinite(n) ? new Intl.NumberFormat('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Object.is(n, -0) ? 0 : n) : '—'
}

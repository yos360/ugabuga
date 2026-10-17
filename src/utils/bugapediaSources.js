// Extra trusted sources for BugaPedia, all free, keyless and callable from the browser:
// • Wikidata (structured facts with Hebrew labels, CC0) — capitals, populations, dates, authors…
// • Sefaria (Jewish texts and topics in Hebrew) — for תנ״ך and מורשת questions
// • Hebcal (Jewish calendar, CC BY 4.0) — "מתי חנוכה?"
// • English Wikipedia — only as a fallback when Hebrew sources have nothing
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'
const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql'
const SEFARIA = 'https://www.sefaria.org/api'
const HEBCAL = 'https://www.hebcal.com/hebcal'
const ENGLISH_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/'

const clean = value => String(value || '').replace(/[?!.؟]+$/u, '').replace(/\s+/g, ' ').trim()
const strip = value => clean(value).replace(/^(?:את|של)\s+/u, '').replace(/^["'״׳]+|["'״׳]+$/gu, '').trim()

async function getJson(url, signal) {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('network')
  return response.json()
}

// ── Wikidata facts ───────────────────────────────────────────
// kind decides how the value is written in the answer.
const FACT_PATTERNS = [
  { re: /(?:^|\s)(?:מה\s+)?(?:היא\s+)?(?:ה)?בירה\s+של\s+(.+)$/u, prop: 'P36', kind: 'item', say: (x, v) => `הבירה של ${x} היא ${v}` },
  { re: /(?:^|\s)בירת\s+(.+)$/u, prop: 'P36', kind: 'item', say: (x, v) => `הבירה של ${x} היא ${v}` },
  { re: /^כמה\s+(?:תושבים|אנשים|אזרחים)\s+(?:יש|גרים|חיים)\s+ב(?:־|-)?(.+)$/u, prop: 'P1082', kind: 'number', say: (x, v) => `ב${x} חיים כ־${v} תושבים` },
  { re: /^מתי\s+(?:נולד|נולדה)\s+(.+)$/u, prop: 'P569', kind: 'date', say: (x, v) => `תאריך הלידה של ${x}: ${v}` },
  { re: /^מתי\s+(?:מת|מתה|נפטר|נפטרה)\s+(.+)$/u, prop: 'P570', kind: 'date', say: (x, v) => `תאריך הפטירה של ${x}: ${v}` },
  { re: /^מתי\s+(?:הוקם|הוקמה|נוסד|נוסדה|נבנה|נבנתה)\s+(.+)$/u, prop: 'P571', kind: 'date', say: (x, v) => `תאריך ההקמה של ${x}: ${v}` },
  { re: /^(?:מה\s+)?(?:הגובה\s+של|כמה\s+גבוה|כמה\s+גבוהה)\s+(.+)$/u, prop: 'P2044', fallback: 'P2048', kind: 'number', say: (x, v) => `הגובה של ${x} הוא ${v}` },
  { re: /^(?:מה\s+)?(?:השטח\s+של|כמה\s+גדול|כמה\s+גדולה)\s+(.+)$/u, prop: 'P2046', kind: 'number', say: (x, v) => `השטח של ${x} הוא ${v}` },
  { re: /^(?:מה\s+)?(?:האורך\s+של|כמה\s+ארוך|כמה\s+ארוכה)\s+(.+)$/u, prop: 'P2043', kind: 'number', say: (x, v) => `האורך של ${x} הוא ${v}` },
  { re: /^מי\s+כתב(?:ה)?\s+(.+)$/u, prop: 'P50', kind: 'item', say: (x, v) => `${x} נכתב על ידי ${v}` },
  { re: /^מי\s+צייר(?:ה)?\s+(.+)$/u, prop: 'P170', kind: 'item', say: (x, v) => `${x} נוצר על ידי ${v}` },
  { re: /^מי\s+(?:המציא|המציאה|גילה|גילתה)\s+(.+)$/u, prop: 'P61', kind: 'item', say: (x, v) => `${x} — הממציא או המגלה: ${v}` },
  { re: /^(?:מה|מהו)\s+(?:ה)?מטבע\s+(?:של|ב)\s*(.+)$/u, prop: 'P38', kind: 'item', say: (x, v) => `המטבע של ${x}: ${v}` },
  { re: /^(?:מה|מהי|מהן)\s+(?:ה)?שפ(?:ה|ות)\s+(?:ה)?(?:רשמית|רשמיות)?\s*(?:של|ב)\s*(.+)$/u, prop: 'P37', kind: 'item', say: (x, v) => `השפה הרשמית של ${x}: ${v}` },
  { re: /^(?:באיזו|באיזה)\s+יבשת\s+(?:נמצאת|נמצא|נמצאות)?\s*(.+)$/u, prop: 'P30', kind: 'item', say: (x, v) => `${x} נמצאת ב${v}` },
  { re: /^(?:מה|מהי)\s+(?:ה)?נוסחה\s+(?:ה)?(?:כימית\s+)?של\s+(.+)$/u, prop: 'P274', kind: 'text', say: (x, v) => `הנוסחה הכימית של ${x} היא ${v}` },
]

export function parseFactQuestion(question) {
  const value = clean(question)
  for (const pattern of FACT_PATTERNS) {
    const match = value.match(pattern.re)
    const subject = match && strip(match[1])
    if (subject && subject.length >= 2 && subject.split(' ').length <= 6) return { ...pattern, subject }
  }
  return null
}

const HEBREW_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
// Wikidata times look like "+1879-03-14T00:00:00Z" with a precision (11 = day, 10 = month, 9 = year).
export function formatWikidataTime(value, precision = 11) {
  const match = String(value || '').match(/^([+-]?)(\d+)-(\d{2})-(\d{2})/)
  if (!match) return ''
  const year = Number(match[2])
  const era = match[1] === '-' ? ' לפני הספירה' : ''
  if (Number(precision) <= 9) return `שנת ${year}${era}`
  const month = HEBREW_MONTHS[Number(match[3]) - 1]
  if (Number(precision) === 10) return `${month} ${year}${era}`
  return `${Number(match[4])} ב${month} ${year}${era}`
}

const formatAmount = value => new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 }).format(Number(value))

// Wikidata's Hebrew labels are usually bare names: "אוורסט", "מונה ליזה", "נילוס".
const DESCRIPTOR = /^(?:הר|נהר|ימת|העיר|עיר|מדינת|ארץ|האי|אי|מדבר|הציור|הספר|ספר|הסופר|הצייר)\s+/u
export function nameVariants(term) {
  const name = clean(term)
  const variants = [name, name.replace(DESCRIPTOR, ''), name.replace(/^ה(?=[א-ת]{3,})/u, ''), name.replace(DESCRIPTOR, '').replace(/^ה(?=[א-ת]{3,})/u, '')]
  return [...new Set(variants.filter(value => value.length >= 2))]
}

async function searchEntities(term, signal) {
  const params = new URLSearchParams({ action: 'wbsearchentities', search: term, language: 'he', uselang: 'he', type: 'item', limit: '5', origin: '*', format: 'json' })
  const payload = await getJson(`${WIKIDATA_API}?${params}`, signal)
  return (payload?.search || [])
    .filter(item => !/פירושונים/u.test(item.description || ''))
    .map(item => ({ id: item.id, label: item.label, description: item.description || '' }))
}

async function wikidataCandidates(term, signal) {
  const variants = nameVariants(term)
  const lists = await Promise.all(variants.map(variant => searchEntities(variant, signal)))
  const seen = new Set()
  const unique = lists.flat().filter(item => !seen.has(item.id) && seen.add(item.id))
  // An item named exactly like the question ("נילוס") beats one that only starts with it ("הנילוס הכחול").
  const isExact = item => variants.includes(clean(item.label))
  return [...unique.filter(isExact), ...unique.filter(item => !isExact(item))].slice(0, 12)
}

async function wikidataValues(ids, prop, signal) {
  const values = ids.map((id, i) => `(wd:${id} ${i})`).join(' ')
  const query = `SELECT ?item ?rank ?v ?vLabel ?unitLabel ?prec ?time ?best WHERE {
  VALUES (?item ?rank) { ${values} }
  ?item p:${prop} ?st . ?st ps:${prop} ?v ; wikibase:rank ?r . FILTER(?r != wikibase:DeprecatedRank)
  FILTER NOT EXISTS { ?st pq:P582 ?ended }
  BIND(IF(?r = wikibase:PreferredRank, 1, 0) AS ?best)
  OPTIONAL { ?st psv:${prop}/wikibase:quantityUnit ?unit }
  OPTIONAL { ?st psv:${prop}/wikibase:timePrecision ?prec }
  OPTIONAL { ?st pq:P585 ?time }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "he,en". }
} ORDER BY ?rank DESC(?best) DESC(?time) LIMIT 40`
  const payload = await getJson(`${WIKIDATA_SPARQL}?format=json&query=${encodeURIComponent(query)}`, signal)
  return payload?.results?.bindings || []
}

function describeValue(row, kind) {
  if (kind === 'date') return formatWikidataTime(row.v?.value, row.prec?.value)
  if (kind === 'number') {
    const unit = row.unitLabel?.value
    const hasUnit = unit && !/^Q\d+$/.test(unit) && !/^1$/.test(unit)
    return `${formatAmount(row.v?.value)}${hasUnit ? ` ${unit}` : ''}`
  }
  if (kind === 'text') return row.v?.value || ''
  const label = row.vLabel?.value || ''
  return /^Q\d+$/.test(label) ? '' : label
}

export async function findFactAnswer(question, signal) {
  const parsed = parseFactQuestion(question)
  if (!parsed) return null
  const candidates = await wikidataCandidates(parsed.subject, signal)
  if (!candidates.length) return null
  const ids = candidates.map(item => item.id)
  let rows = await wikidataValues(ids, parsed.prop, signal)
  if (!rows.length && parsed.fallback) rows = await wikidataValues(ids, parsed.fallback, signal)
  if (!rows.length) return null
  const topId = rows[0].item.value.split('/').pop()
  const item = candidates.find(entry => entry.id === topId) || candidates[0]
  const itemRows = rows.filter(row => row.item.value.endsWith(`/${topId}`))
  // When Wikidata marks a preferred value (the current capital, the latest census), use only that.
  const preferred = itemRows.filter(row => row.best?.value === '1')
  const answers = [...new Set((preferred.length ? preferred : itemRows).map(row => describeValue(row, parsed.kind)).filter(Boolean))]
  // Numbers and dates: only the newest/preferred value. Names: up to four (e.g. several official languages).
  const shown = parsed.kind === 'item' ? answers.slice(0, 4).join(', ') : answers[0]
  if (!shown) return null
  const name = item.label || parsed.subject
  return {
    id: `wikidata-fact-${topId}-${parsed.prop}`,
    title: parsed.say(name, shown),
    extract: `${name}${item.description ? ` — ${item.description}` : ''}. העובדה נשלפה מוויקינתונים, מאגר הנתונים הפתוח של ויקיפדיה שמשמש מוזיאונים, ספריות ואוניברסיטאות בכל העולם.`,
    url: `https://www.wikidata.org/wiki/${topId}`,
    image: '',
    score: 100,
    exact: true,
    fact: true,
    source: 'wikidata',
    sourceLabel: 'עובדה מוויקינתונים',
    linkLabel: 'לבדיקת העובדה בוויקינתונים ↗',
  }
}

// ── Hebcal: Jewish holidays ──────────────────────────────────
const HOLIDAYS = [
  { re: /חנוכה/u, en: /^Chanukah/ },
  { re: /פורים/u, en: /^Purim$/ },
  { re: /פסח/u, en: /^Pesach I$/ },
  { re: /ראש\s+השנה/u, en: /^Rosh Hashana \d/ },
  { re: /יום\s+(?:ה)?כיפור/u, en: /^Yom Kippur$/ },
  { re: /שמחת\s+תורה/u, en: /^Simchat Torah$/ },
  { re: /סוכות/u, en: /^Sukkot I$/ },
  { re: /שבועות/u, en: /^Shavuot$/ },
  { re: /ט["״]?ו\s+בשבט/u, en: /^Tu BiShvat$/ },
  { re: /ל["״]?ג\s+בעומר/u, en: /^Lag BaOmer$/ },
  { re: /יום\s+העצמאות/u, en: /^Yom HaAtzma/ },
  { re: /יום\s+הזיכרון/u, en: /^Yom HaZikaron$/ },
  { re: /יום\s+השואה/u, en: /^Yom HaShoah$/ },
  { re: /תשעה\s+באב|ט["״]?\s*באב/u, en: /^Tish/ },
]

export function parseHolidayQuestion(question) {
  const value = clean(question)
  if (!/^(?:מתי|באיזה\s+(?:יום|תאריך))/u.test(value)) return null
  return HOLIDAYS.find(holiday => holiday.re.test(value)) || null
}

export async function findHolidayAnswer(question, signal, now = new Date()) {
  const holiday = parseHolidayQuestion(question)
  if (!holiday) return null
  const start = now.toISOString().slice(0, 10)
  const end = new Date(now.getTime() + 400 * 864e5).toISOString().slice(0, 10)
  const params = new URLSearchParams({ v: '1', cfg: 'json', maj: 'on', min: 'on', mod: 'on', i: 'on', lg: 'en', start, end })
  const payload = await getJson(`${HEBCAL}?${params}`, signal)
  const item = (payload?.items || []).find(entry => holiday.en.test(entry.title || ''))
  if (!item) return null
  const date = new Date(`${item.date.slice(0, 10)}T12:00:00`)
  const shown = new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
  const name = item.hebrew || item.title
  return {
    id: `hebcal-${item.date}-${item.title}`,
    title: `${name}: ${shown}`,
    extract: `${name} יחול ב${shown}${item.hdate ? ` (${item.hdate})` : ''}. חגים שמתחילים בערב נכנסים בערב שלפני התאריך הזה. התאריך לפי לוח השנה העברי בישראל.`,
    url: item.link || 'https://www.hebcal.com/holidays/',
    image: '',
    score: 100,
    exact: true,
    fact: true,
    source: 'hebcal',
    sourceLabel: 'לוח השנה העברי · Hebcal',
    linkLabel: 'ללוח השנה המלא ↗',
  }
}

// ── Sefaria: Jewish texts and topics ─────────────────────────
export async function searchSefaria(term, signal) {
  const name = clean(term)
  if (!name) return []
  const lookup = await getJson(`${SEFARIA}/name/${encodeURIComponent(name)}?limit=8`, signal)
  const topic = (lookup?.completion_objects || []).find(entry => /Topic$/.test(entry.type || '') && entry.key)
  if (!topic) return []
  const data = await getJson(`${SEFARIA}/v2/topics/${encodeURIComponent(topic.key)}`, signal)
  const extract = clean(data?.description?.he || '')
  const title = data?.primaryTitle?.he || topic.title
  if (!extract || !title) return []
  const exact = title.replace(/[֑-ׇ]/g, '').trim() === name.replace(/[֑-ׇ]/g, '').trim()
  return [{
    id: `sefaria-${topic.key}`,
    title,
    extract,
    url: `https://www.sefaria.org.il/topics/${encodeURIComponent(topic.key)}`,
    image: '',
    score: exact ? 24 : 6,
    exact,
    sefaria: true,
    source: 'sefaria',
    sourceLabel: 'ספריא · ספרייה דיגיטלית של מקורות יהודיים',
    linkLabel: 'לנושא המלא בספריא ↗',
  }]
}

// ── English Wikipedia fallback (through the Wikidata item's English article) ──
export async function englishFallback(term, signal) {
  const candidates = await wikidataCandidates(term, signal)
  if (!candidates.length) return []
  const params = new URLSearchParams({ action: 'wbgetentities', ids: candidates.slice(0, 3).map(item => item.id).join('|'), props: 'sitelinks', sitefilter: 'enwiki', origin: '*', format: 'json' })
  const payload = await getJson(`${WIKIDATA_API}?${params}`, signal)
  const ids = candidates.slice(0, 3).map(item => item.id)
  const id = ids.find(entry => payload?.entities?.[entry]?.sitelinks?.enwiki?.title)
  if (!id) return []
  const title = payload.entities[id].sitelinks.enwiki.title
  const page = await getJson(`${ENGLISH_SUMMARY}${encodeURIComponent(title.replace(/ /g, '_'))}`, signal)
  if (!page?.extract || page.type === 'disambiguation') return []
  const hebrew = candidates.find(item => item.id === id)
  return [{
    id: `en-summary-${id}`,
    title: hebrew?.label ? `${hebrew.label} (${page.title})` : page.title,
    extract: page.extract,
    url: page.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    image: page.thumbnail?.source || '',
    score: 4,
    source: 'en-wikipedia',
    sourceLabel: 'ויקיפדיה באנגלית — אין עדיין ערך בעברית',
    linkLabel: 'לערך המלא ב־Wikipedia ↗',
  }]
}

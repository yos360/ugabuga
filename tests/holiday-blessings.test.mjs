// Holiday blessings & readings (/holidays/blessings): data integrity, references and links.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const {
  HOLIDAY_BLESSINGS, SOURCES, SEASONS, BOOKS, heNum, parseRef, heRef, sefariaUrl, speakText, blessingsHref,
} = await import('../src/data/holidayBlessings.js')
const { BLESSINGS: HANUKKAH_BLESSINGS } = await import('../src/data/hanukkahSongs.js')

const NIKKUD = /[ְ-ׇּׁׂ]/
const nonEmpty = (v, what) => assert.ok(typeof v === 'string' && v.trim().length > 0, `empty ${what}`)
const SEFARIA = /^https:\/\/www\.sefaria\.org\.il\/[A-Za-z_]+\.\d+\.\d+(-(\d+\.)?\d+)?\?lang=he$/

test('every holiday is covered once, with unique slugs', () => {
  const slugs = HOLIDAY_BLESSINGS.map(h => h.slug)
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug')
  for (const s of ['rosh-hashana', 'yom-kippur', 'sukkot', 'simchat-torah', 'hanukkah', 'tu-bishvat', 'purim', 'pesach', 'omer', 'yom-haatzmaut', 'lag-baomer', 'shavuot', 'tisha-bav', 'rosh-chodesh', 'shabbat', 'yom-hazikaron']) assert.ok(slugs.includes(s), s)
  for (const h of HOLIDAY_BLESSINGS) {
    assert.match(h.slug, /^[a-z]+(-[a-z]+)*$/, h.slug)
    assert.equal(blessingsHref(h.slug), `/holidays/blessings/${h.slug}`)
    assert.ok(SEASONS.some(s => s.id === h.season), `${h.slug} season`)
  }
})

test('every holiday has blessings or readings, and no empty text anywhere', () => {
  for (const h of HOLIDAY_BLESSINGS) {
    for (const f of ['name', 'emoji', 'when', 'intro']) nonEmpty(h[f], `${h.slug}.${f}`)
    for (const f of ['blessings', 'siddur', 'tanakh', 'faq', 'sources']) assert.ok(Array.isArray(h[f]), `${h.slug}.${f} is an array`)
    assert.ok(h.blessings.length + h.siddur.length + h.tanakh.length > 0, `${h.slug} has nothing`)
    assert.ok(h.faq.length > 0, `${h.slug} faq`)
    const ids = h.blessings.map(b => b.id)
    assert.equal(new Set(ids).size, ids.length, `${h.slug} duplicate blessing id`)
    for (const b of h.blessings) {
      for (const f of ['id', 'title', 'when', 'text']) nonEmpty(b[f], `${h.slug}/${b.id}.${f}`)
      if (!b.plain) assert.ok(NIKKUD.test(b.text), `${h.slug}/${b.id} has niqqud`)
      for (const f of ['note', 'why']) if (b[f] !== undefined) nonEmpty(b[f], `${h.slug}/${b.id}.${f}`)
    }
    for (const s of h.siddur) { nonEmpty(s.name, `${h.slug} siddur name`); nonEmpty(s.desc, `${h.slug}/${s.name} desc`); if (s.text !== undefined) nonEmpty(s.text, `${h.slug}/${s.name} text`) }
    for (const r of h.tanakh) {
      nonEmpty(r.title, `${h.slug} reading title`); nonEmpty(r.about, `${h.slug}/${r.title} about`)
      assert.ok(['torah', 'maftir', 'haftarah', 'megillah'].includes(r.kind), `${h.slug}/${r.title} kind`)
      assert.ok(r.refs.length > 0, `${h.slug}/${r.title} refs`)
    }
    for (const q of h.faq) { nonEmpty(q.q, `${h.slug} faq q`); nonEmpty(q.a, `${h.slug} faq a`) }
    for (const k of h.sources) assert.ok(SOURCES[k], `${h.slug}: unknown source ${k}`)
    assert.ok(h.sources.length >= 2, `${h.slug}: at least two sources`)
  }
})

test('blessings start with the standard opening (except quoted lines and the seder note)', () => {
  const open = 'בָּרוּךְ אַתָּה ה׳ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם'
  for (const h of HOLIDAY_BLESSINGS) for (const b of h.blessings) {
    if (b.plain || ['banim', 'omer-week', 'omer-33'].includes(b.id) || (h.slug === 'shabbat' && b.id === 'kiddush')) continue
    assert.ok(b.text.startsWith(open), `${h.slug}/${b.id}`)
  }
})

test('Hanukkah reuses the candle blessings of the Hanukkah songs page', () => {
  const h = HOLIDAY_BLESSINGS.find(x => x.slug === 'hanukkah')
  assert.deepEqual(h.blessings.map(b => b.text), HANUKKAH_BLESSINGS.map(b => b.text))
})

test('Hebrew numerals', () => {
  assert.deepEqual([1, 9, 10, 15, 16, 21, 34, 66, 118].map(heNum), ['א׳', 'ט׳', 'י׳', 'ט״ו', 'ט״ז', 'כ״א', 'ל״ד', 'ס״ו', 'קי״ח'])
})

test('references parse, render in Hebrew without dashes between numbers, and link to Sefaria', () => {
  assert.equal(heRef('Genesis 21:1-34'), 'בראשית כ״א, א׳ עד ל״ד')
  assert.equal(heRef('Leviticus 22:26-23:44'), 'ויקרא כ״ב, כ״ו עד כ״ג, מ״ד')
  assert.equal(heRef('Ezekiel 3:12'), 'יחזקאל ג׳, י״ב')
  assert.equal(sefariaUrl('I Samuel 1:1-2:10'), 'https://www.sefaria.org.il/I_Samuel.1.1-2.10?lang=he')
  assert.equal(sefariaUrl('Genesis 21:1-34'), 'https://www.sefaria.org.il/Genesis.21.1-34?lang=he')
  assert.throws(() => parseRef('Genesis 21'))
  const refs = HOLIDAY_BLESSINGS.flatMap(h => [...h.tanakh.flatMap(r => r.refs), ...(h.verse ? [h.verse.ref] : [])])
  assert.ok(refs.length > 40, `${refs.length} refs`)
  for (const ref of refs) {
    const { book, from, to } = parseRef(ref)
    assert.ok(BOOKS[book], ref)
    assert.ok(to[0] > from[0] || (to[0] === from[0] && to[1] >= from[1]), `${ref} runs backwards`)
    assert.match(sefariaUrl(ref), SEFARIA, ref)
    assert.doesNotMatch(heRef(ref), /\d|[-–—]/, `${ref} → ${heRef(ref)}`)
  }
})

test('key readings for Israel are the ones in the sources', () => {
  const get = (slug, title) => HOLIDAY_BLESSINGS.find(h => h.slug === slug).tanakh.find(r => r.title.includes(title)).refs
  assert.deepEqual(get('rosh-hashana', 'יום א׳'), ['Genesis 21:1-34'])
  assert.deepEqual(get('yom-kippur', 'שחרית'), ['Leviticus 16:1-34'])
  assert.deepEqual(get('simchat-torah', 'וזאת הברכה'), ['Deuteronomy 33:1-34:12'])
  assert.deepEqual(get('purim', 'שחרית'), ['Exodus 17:8-16'])
  assert.deepEqual(get('shavuot', 'קריאת התורה'), ['Exodus 19:1-20:23'])
  assert.deepEqual(get('tisha-bav', 'שחרית'), ['Deuteronomy 4:25-40'])
  assert.deepEqual(get('rosh-chodesh', 'קריאת התורה'), ['Numbers 28:1-15'])
})

test('read-aloud text has no niqqud and does not read the Name', () => {
  for (const h of HOLIDAY_BLESSINGS) for (const b of h.blessings) {
    const t = speakText(b.text)
    assert.ok(t.length > 0)
    assert.ok(!/[֑-ׇ]/.test(t), `${h.slug}/${b.id} still has niqqud`)
    assert.ok(!t.includes('ה׳'), `${h.slug}/${b.id}`)
  }
})

test('source links are external https links', () => {
  for (const [k, s] of Object.entries(SOURCES)) { nonEmpty(s.label, k); if (s.url) assert.match(s.url, /^https:\/\//, k) }
})

test('wiring: routes, sitemap and search', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const hub = app.indexOf('path="/holidays/blessings"'), page = app.indexOf('path="/holidays/blessings/:slug"'), param = app.indexOf('path="/holidays/:slug"')
  assert.ok(hub > 0 && page > 0 && hub < param && page < param, 'blessings routes come before /holidays/:slug')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.ok(sitemap.includes('<loc>https://ugabuga.co.il/holidays/blessings</loc>'))
  for (const h of HOLIDAY_BLESSINGS) assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il/holidays/blessings/${h.slug}</loc>`), h.slug)
})

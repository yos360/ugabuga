// Baby names (/baby-names): data integrity, filters, final letters and the page list for the sitemap.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const {
  BABY_NAMES, LETTERS, LETTER_SLUGS, ORIGINS, TAGS, GENDERS, LETTER_PAGE_MIN,
  normalizeHebrew, firstLetter, filterNames, letterFromSlug, lettersWithNames, babyNamePaths, namePath, nameBySlug,
  similarNames, nameDescription, nameTitle, nameFaq, favoritesShareText, matchesGender,
} = await import('../src/data/babyNames.js')

test('a few hundred names, no duplicate name+gender, unique slugs', () => {
  assert.ok(BABY_NAMES.length >= 240, `${BABY_NAMES.length} names`)
  const keys = BABY_NAMES.map(n => `${n.name}|${n.gender}`)
  assert.equal(new Set(keys).size, keys.length, 'duplicate name+gender')
  const names = BABY_NAMES.map(n => n.name)
  assert.equal(new Set(names).size, names.length, 'same name listed twice (use gender "u" instead)')
  const slugs = BABY_NAMES.map(n => n.slug)
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug')
  for (const s of slugs) assert.match(s, /^[a-z]+(-[a-z]+)*$/, s)
  for (const g of ['f', 'm', 'u']) assert.ok(BABY_NAMES.filter(n => n.gender === g).length >= (g === 'u' ? 35 : 95), g)
})

test('every name has all fields', () => {
  for (const n of BABY_NAMES) {
    assert.match(n.name, /^[א-ת]+$/, `${n.name}: Hebrew letters only`)
    assert.match(n.en, /^[A-Z][a-z]+$/, `${n.name}: transliteration`)
    assert.ok(['f', 'm', 'u'].includes(n.gender), `${n.name} gender`)
    assert.ok(ORIGINS.includes(n.origin), `${n.name} origin`)
    assert.ok(n.meaning.trim().length >= 4, `${n.name} meaning`)
    assert.equal(typeof n.source, 'string')
    assert.ok(Array.isArray(n.tags) && n.tags.every(t => TAGS.includes(t)), `${n.name} tags`)
    assert.ok(LETTERS.includes(n.letter), `${n.name} letter`)
    if (n.origin === 'תנ"כי') { assert.ok(n.tags.includes('תנ"כי')); assert.ok(n.source, `${n.name}: biblical names cite a source`) }
    assert.equal(n.tags.includes('קצר'), normalizeHebrew(n.name).length <= 3, `${n.name} short tag`)
  }
})

test('popular tag matches the verified CBS 2024 top-10 lists only', () => {
  const pop = BABY_NAMES.filter(n => n.tags.includes('פופולרי')).map(n => n.name).sort()
  const expected = ['אביגיל', 'איילה', 'שרה', 'תמר', 'מאיה', 'אסתר', 'יעל', 'נועה', 'ליבי', 'חנה',
    'דוד', 'לביא', 'אריאל', 'רפאל', 'אורי', 'יוסף', 'ארי', 'משה', 'יהודה', 'אברהם'].sort()
  assert.deepEqual(pop, expected)
})

test('final letters and niqqud are normalized', () => {
  assert.equal(normalizeHebrew('ךםןףץ'), 'כמנפצ')
  assert.equal(normalizeHebrew('נֹעַה'), 'נעה')
  assert.equal(normalizeHebrew('ג׳ ו"ל'), 'גול')
  assert.equal(firstLetter('ךלב'), 'כ')
  assert.equal(firstLetter('ם'), 'מ')
  assert.equal(firstLetter('abc'), '')
  // a final-letter chip/query finds the same names as the regular letter
  for (const [fin, reg] of [['ך', 'כ'], ['ם', 'מ'], ['ן', 'נ'], ['ף', 'פ'], ['ץ', 'צ']]) {
    assert.deepEqual(filterNames(BABY_NAMES, { letter: fin }), filterNames(BABY_NAMES, { letter: reg }))
  }
  // search ignores final-letter form: "דן" ends with ן, searching "דנ" still finds it
  assert.ok(filterNames(BABY_NAMES, { q: 'דנ' }).some(n => n.name === 'דן'))
  assert.ok(filterNames(BABY_NAMES, { q: 'אליהו' }).some(n => n.name === 'אליהו'))
  assert.ok(filterNames(BABY_NAMES, { q: 'noa' }).some(n => n.name === 'נועה'))
})

test('every letter filter returns exactly the names that start with it', () => {
  let total = 0
  for (const l of LETTERS) {
    const got = filterNames(BABY_NAMES, { letter: l })
    assert.ok(got.every(n => normalizeHebrew(n.name)[0] === l), l)
    assert.equal(got.length, BABY_NAMES.filter(n => n.name[0] === l).length, l)
    total += got.length
  }
  assert.equal(total, BABY_NAMES.length)
  assert.ok(LETTERS.filter(l => filterNames(BABY_NAMES, { letter: l }).length).length >= 18)
})

test('gender, origin and tag filters', () => {
  const girls = filterNames(BABY_NAMES, { gender: 'f' })
  assert.ok(girls.every(n => n.gender === 'f' || n.gender === 'u'))
  assert.ok(girls.some(n => n.gender === 'u'))
  assert.ok(filterNames(BABY_NAMES, { gender: 'u' }).every(n => n.gender === 'u'))
  assert.ok(!matchesGender({ gender: 'm' }, 'f'))
  const heb = filterNames(BABY_NAMES, { origin: 'hebrew' }), foreign = filterNames(BABY_NAMES, { origin: 'foreign' })
  assert.equal(heb.length + foreign.length, BABY_NAMES.length)
  assert.ok(foreign.length > 5 && foreign.every(n => n.origin === 'לועזי' || n.origin === 'יידיש'))
  for (const t of TAGS) assert.ok(filterNames(BABY_NAMES, { tag: t }).length >= 5, t)
  const combo = filterNames(BABY_NAMES, { gender: 'm', letter: 'י', tag: 'תנ"כי' })
  assert.ok(combo.length > 3 && combo.every(n => n.letter === 'י' && n.origin === 'תנ"כי' && n.gender !== 'f'))
})

test('letter slugs round-trip, letter pages need enough names', () => {
  for (const l of LETTERS) assert.equal(letterFromSlug(LETTER_SLUGS[l]), l)
  assert.equal(letterFromSlug('nope'), '')
  for (const g of ['f', 'm']) {
    const ls = lettersWithNames(g, LETTER_PAGE_MIN)
    assert.ok(ls.length >= 10, g)
    for (const l of ls) assert.ok(filterNames(BABY_NAMES, { gender: g, letter: l }).length >= LETTER_PAGE_MIN)
  }
})

test('page paths for the sitemap', () => {
  const paths = babyNamePaths()
  assert.equal(new Set(paths).size, paths.length, 'duplicate path')
  for (const p of ['/baby-names', GENDERS.f.path, GENDERS.m.path, GENDERS.u.path, '/baby-names/girls/letter/alef', '/baby-names/boys/letter/yod', '/baby-names/name/noa', '/baby-names/name/david']) assert.ok(paths.includes(p), p)
  for (const p of paths) assert.match(p, /^\/baby-names(\/(girls|boys|unisex)(\/letter\/[a-z]+)?|\/name\/[a-z-]+)?$/, p)
  assert.equal(paths.filter(p => p.startsWith('/baby-names/name/')).length, BABY_NAMES.length)
  for (const n of BABY_NAMES) assert.equal(nameBySlug(n.slug), n)
  assert.equal(namePath(nameBySlug('noa')), '/baby-names/name/noa')
})

test('name pages: title, 120–160 char description, FAQ, 6 similar names', () => {
  for (const n of BABY_NAMES) {
    const d = nameDescription(n)
    assert.ok(d.length >= 120 && d.length <= 160, `${n.name}: description ${d.length}`)
    assert.ok(d.includes(n.name))
    assert.ok(nameTitle(n).startsWith(`משמעות השם ${n.name}`))
    const faq = nameFaq(n)
    assert.ok(faq.length >= 2 && faq.length <= 3 && faq.every(f => f.q && f.a))
    const sim = similarNames(n)
    assert.equal(sim.length, 6)
    assert.ok(!sim.includes(n))
    assert.ok(sim.every(s => n.gender === 'u' || s.gender === 'u' || s.gender === n.gender), `${n.name}: similar names keep gender`)
  }
})

test('favourites share text lists the names and the link', () => {
  const t = favoritesShareText([nameBySlug('noa'), nameBySlug('david')], 'https://ugabuga.co.il/baby-names')
  assert.ok(t.includes('נועה') && t.includes('דוד') && t.endsWith('https://ugabuga.co.il/baby-names'))
})

// Hanukkah landing pages by grade (/holidays/hanukkah/grade/<slug>): routed, in the sitemap and search,
// linking only to real pages, with grade-level content that adds up.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { HANUKKAH_GRADE_LIST, HANUKKAH_GRADE_PATHS, hanukkahGradePath } from '../src/data/hanukkahGradeList.js'
import { HANUKKAH_GRADES, hanukkahGrade, HANUKKAH_TIMELINE } from '../src/data/hanukkahGrades.js'
import { hanukkahProblems, kindergartenNumbers, MATH_LEVEL, HANUKKAH_MATH_LEVELS } from '../src/data/hanukkahGradeMath.js'
import { wordSearch } from '../src/utils/wordSearchGrid.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const app = read('src/App.jsx')
const sitemap = new Set([...read('public/sitemap-static.xml').matchAll(/<loc>https:\/\/ugabuga\.co\.il([^<]*)<\/loc>/g)].map(m => m[1] || '/'))
const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1]).filter(r => !r.includes('*'))
const staticRoutes = new Set(routes.filter(r => !r.includes(':')))
// A link is real when the sitemap lists it or a route without parameters serves exactly that path —
// a parameter route alone (/riddles/:slug) would accept any typo, so it doesn't count.
const real = p => sitemap.has(p) || staticRoutes.has(p)

test('one page per audience: גן, א׳–ו׳ and חטיבת ביניים', () => {
  assert.deepEqual(HANUKKAH_GRADE_LIST.map(g => g.slug), ['kindergarten', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6', 'middle-school'])
  assert.equal(HANUKKAH_GRADES.length, 8)
  for (const g of HANUKKAH_GRADES) assert.equal(hanukkahGrade(g.slug), g)
  assert.equal(hanukkahGrade('grade-9'), null)
})

test('every grade page is routed (lazy), in the sitemap and in site search', () => {
  assert.match(app, /const HanukkahGrade = lazy\(\(\) => import\('\.\/pages\/holidays\/HanukkahGrade'\)\)/)
  assert.ok(routes.includes('/holidays/hanukkah/grade/:gradeSlug'))
  const search = read('src/data/searchStatic.js')
  for (const p of HANUKKAH_GRADE_PATHS) {
    assert.ok(routes.some(r => new RegExp('^' + r.replace(/:[^/]+/g, '[^/]+') + '$').test(p)), `${p} routed`)
    assert.ok(sitemap.has(p), `${p} in sitemap-static.xml`)
    assert.ok(search.includes(`to: '${p}'`), `${p} in searchStatic.js`)
  }
  // the Hanukkah hub shows the chooser, and the chooser links every grade
  assert.match(read('src/pages/holidays/HanukkahHub.jsx'), /<HanukkahGradeChooser \/>/)
  assert.match(read('src/components/hanukkah/HanukkahGradeChooser.jsx'), /HANUKKAH_GRADE_LIST\.map/)
})

test('grade pages link only to existing pages', () => {
  const page = read('src/pages/holidays/HanukkahGrade.jsx')
  const fixed = [...page.matchAll(/href: '([^']+)'/g)].map(m => m[1])
  assert.ok(fixed.length >= 3)
  const bad = []
  for (const g of HANUKKAH_GRADES) {
    assert.ok(g.links.length >= 6, `${g.slug}: ${g.links.length} links`)
    assert.equal(new Set(g.links.map(l => l.href)).size, g.links.length, `${g.slug}: duplicate link`)
    for (const href of [...g.links.map(l => l.href), ...fixed, ...HANUKKAH_GRADE_PATHS]) if (!real(href)) bad.push(`${g.slug} → ${href}`)
  }
  assert.deepEqual(bad, [])
  // the existing Hanukkah material the brief asks for is linked from at least one grade
  const all = new Set(HANUKKAH_GRADES.flatMap(g => g.links.map(l => l.href)))
  for (const p of ['/treasure-hunt/hanukkah', '/tools/escape-rooms/hanukkah-oil-jar', '/learn/english-reading/hanukkah-lights', '/guides/hanukkah-activities-kindergarten', '/booklets/hanukkah', '/booklets/hanukkah-grade5']) assert.ok(all.has(p), p)
})

const words = s => s.split(/\s+/).filter(Boolean).length
test('SEO copy: keyword titles, descriptions within limits, 3 FAQ, enough original text', () => {
  const titles = new Set(), descs = new Set()
  for (const g of HANUKKAH_GRADES) {
    const kw = g.slug === 'kindergarten' ? 'פעילות לחנוכה לגן' : `דפי עבודה לחנוכה ${g.forLabel}`
    assert.ok(g.seoTitle.startsWith(kw), `${g.slug}: title "${g.seoTitle}"`)
    assert.ok(g.seoTitle.length <= 65, `${g.slug}: title ${g.seoTitle.length} chars`)
    assert.ok(g.h1.includes(kw), `${g.slug}: h1`)
    assert.ok(g.seoDesc.length >= 110 && g.seoDesc.length <= 165, `${g.slug}: description ${g.seoDesc.length} chars`)
    assert.ok(g.seoDesc.includes(kw), `${g.slug}: keyword in description`)
    titles.add(g.seoTitle); descs.add(g.seoDesc)
    assert.equal(g.faq.length, 3, g.slug)
    for (const f of g.faq) assert.ok(f.q.endsWith('?') && f.a.length > 60, `${g.slug}: ${f.q}`)
    // growth plan: at least 150 original words per landing page (Hebrew counts fewer words than English)
    const n = [...g.intro, ...g.reading.text, ...g.activities.map(a => a.d), ...g.faq.map(f => f.a)].reduce((s, t) => s + words(t), 0)
    assert.ok(words(g.intro.join(' ')) >= 90 && n >= 250, `${g.slug}: ${n} words`)
    assert.ok(g.activities.length >= 4, g.slug)
  }
  assert.equal(titles.size, 8); assert.equal(descs.size, 8)
})

test('reading passages grow with the grade; questions have 4 distinct options and one answer', () => {
  let prev = 0
  const positions = new Set()
  for (const g of HANUKKAH_GRADES) {
    const r = g.reading, w = words(r.text.join(' '))
    if (g.slug !== 'kindergarten' && g.slug !== 'grade-1') assert.ok(w > prev, `${g.slug}: ${w} words, previous ${prev}`)
    prev = w
    assert.ok(!/[a-zA-Z]/.test(r.text.join(' ')), `${g.slug}: Hebrew only`)
    if (g.slug === 'kindergarten') assert.equal(r.q.length, 0)
    else assert.equal(r.q.length, 4, g.slug)
    for (const [q, opts, c] of r.q) {
      assert.equal(opts.length, 4, q); assert.equal(new Set(opts).size, 4, q)
      assert.ok(Number.isInteger(c) && c >= 0 && c < 4, q)
      positions.add(c)
    }
    for (const [q, a] of r.open) assert.ok(q.length > 10 && a.length > 5, `${g.slug}: ${q}`)
  }
  assert.ok(positions.size >= 3, 'correct answers are not always in the same slot')
})

test('word searches fit their grid; printable sets are what each age needs', () => {
  for (const g of HANUKKAH_GRADES) {
    if (g.slug === 'kindergarten') { assert.ok(!g.wordSearch && !g.sheets.includes('problems')); continue }
    const { words: list, size, seed } = g.wordSearch
    for (const w of list) assert.ok([...w].length <= size && !/\s/.test(w), `${g.slug}: ${w}`)
    const { placed } = wordSearch(list, size, seed)
    assert.equal(placed.length, list.length, g.slug)
    for (const id of ['problems', 'reading', 'wordsearch']) assert.ok(g.sheets.includes(id), `${g.slug}: ${id}`)
    if (g.sheets.includes('think')) assert.ok(g.think.length >= 3, g.slug)
  }
  for (const id of ['count-candles', 'donut-math', 'reading']) assert.ok(hanukkahGrade('kindergarten').sheets.includes(id))
})

test('Hanukkah word problems: every school grade, reproducible, new sets on a new seed, grade-level numbers', () => {
  for (const g of HANUKKAH_GRADES.filter(x => x.slug !== 'kindergarten')) assert.ok(HANUKKAH_MATH_LEVELS.includes(MATH_LEVEL[g.slug]), g.slug)
  for (const level of HANUKKAH_MATH_LEVELS) {
    for (let seed = 1; seed <= 40; seed++) {
      const a = hanukkahProblems(level, seed, 8)
      assert.equal(a.length, 8, `level ${level} seed ${seed}`)
      assert.equal(new Set(a.map(p => p.q)).size, 8)
      assert.deepEqual(hanukkahProblems(level, seed, 8), a)
      for (const p of a) {
        assert.ok(p.q.length > 20 && p.answer !== '' && !/NaN|undefined|Infinity/.test(p.q + p.answer), p.q)
        if (/^-?\d+(\.\d+)?$/.test(p.answer)) {
          const v = Number(p.answer)
          assert.ok(v >= 0, p.q)
          if (level === 1) assert.ok(Number.isInteger(v) && v <= 20, `${p.q} = ${v}`)
          if (level === 2) assert.ok(Number.isInteger(v) && v <= 100, `${p.q} = ${v}`)
          if (level <= 4) assert.ok(Number.isInteger(v), `${p.q} = ${v}`)
        }
      }
    }
    assert.notDeepEqual(hanukkahProblems(level, 1).map(p => p.q), hanukkahProblems(level, 2).map(p => p.q))
  }
  // a couple of answers checked by hand
  const years = hanukkahProblems(7, 3, 8).concat(hanukkahProblems(7, 4, 8)).filter(p => p.q.includes('164 לפני הספירה'))
  for (const p of years) assert.equal(Number(p.answer), 164 + Number(p.q.match(/עד שנת (\d{4})/)[1]) - 1)
  for (let seed = 1; seed <= 20; seed++) {
    const { nights, items } = kindergartenNumbers(seed)
    assert.equal(new Set(nights).size, 6)
    for (const n of nights) assert.ok(n >= 1 && n <= 8)
    for (const [a, b] of items) assert.ok(a >= 1 && b >= 1 && a + b <= 8)
  }
})

test('facts: candle totals, timeline order and the paths helper', () => {
  assert.equal(Array.from({ length: 8 }, (_, i) => i + 1).reduce((s, n) => s + n, 0), 36)
  for (const g of HANUKKAH_GRADES) for (const f of g.faq) {
    if (/36/.test(f.a)) assert.match(f.a, /44/)
  }
  for (let i = 1; i < HANUKKAH_TIMELINE.length; i++) assert.ok(HANUKKAH_TIMELINE[i].year <= HANUKKAH_TIMELINE[i - 1].year, 'BCE years go down')
  assert.equal(HANUKKAH_TIMELINE.find(e => e.text.includes('חנוכת')).year - HANUKKAH_TIMELINE.at(-1).year, 101)
  assert.equal(hanukkahGradePath('grade-3'), '/holidays/hanukkah/grade/grade-3')
})

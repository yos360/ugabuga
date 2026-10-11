// SEO audit (birthday / family / seasonal area): search titles, descriptions and owner links.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'
import fs from 'node:fs'

// The data files use Vite-style extensionless imports; resolve them like Vite does.
const hooks = `
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
export async function resolve(spec, ctx, next) {
  if ((spec.startsWith('.') || spec.startsWith('/')) && !/\\.(m?js|jsx|json)$/.test(spec)) {
    for (const ext of ['.js', '/index.js']) {
      if (existsSync(fileURLToPath(new URL(spec + ext, ctx.parentURL)))) return next(spec + ext, ctx)
    }
  }
  return next(spec, ctx)
}`
register('data:text/javascript,' + encodeURIComponent(hooks), import.meta.url)

const { metaWithLead } = await import('../src/utils/seoText.js')
const { IDEA_SEO } = await import('../src/data/ideaSeo.js')
const { IDEA_ARTICLES } = await import('../src/data/ideaArticlesExpanded.js')
const { GUIDES } = await import('../src/data/guides.js')
const { AGE_GIFTS, GIFT_AGES } = await import('../src/data/gifts.js')
const { HOLIDAYS, HUB_COPY } = await import('../src/data/schoolHolidays.js')

const SITEMAP = fs.readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const BRAND = ' | UGABUGA'

test('metaWithLead keeps the lead, stays within the limit and cuts on a word boundary', () => {
  const lead = 'מתנות לגיל 7 ליום הולדת — רעיונות לפי תקציב. '
  const long = 'בגיל שבע ילדים כבר קוראים לבד, אוהבים אתגרים ומשחקי קופסה עם חוקים, ובונים אוספים של כל דבר שאפשר לאסוף ולהחליף עם חברים בהפסקה.'
  const out = metaWithLead(lead, long)
  assert.ok(out.startsWith(lead))
  assert.ok(out.length <= 155, `${out.length} chars`)
  assert.ok(out.endsWith('…'))
  const lastWord = out.slice(lead.length, -1).split(' ').pop()
  assert.ok(long.split(/[\s,]+/).includes(lastWord.replace(/[,]$/, '')), `cut mid-word: "${lastWord}"`)
  assert.equal(metaWithLead(lead, 'קצר.'), lead + 'קצר.')
})

test('gift age pages get a keyword-first description of a sensible length', () => {
  for (const age of GIFT_AGES) {
    const d = metaWithLead(`מתנות לגיל ${age} ליום הולדת — רעיונות לפי תקציב. `, AGE_GIFTS[age].intro)
    assert.ok(d.startsWith(`מתנות לגיל ${age} `))
    assert.ok(d.length >= 100 && d.length <= 155, `age ${age}: ${d.length}`)
  }
})

test('every idea SEO override points at a real article, with a fitting title and description', () => {
  const titles = new Set()
  for (const [slug, o] of Object.entries(IDEA_SEO)) {
    assert.ok(IDEA_ARTICLES[slug], `unknown idea slug ${slug}`)
    assert.ok((o.title + BRAND).length <= 66, `${slug} title too long: ${o.title.length}`)
    assert.ok(o.description.length >= 110 && o.description.length <= 165, `${slug} description ${o.description.length}`)
    assert.ok(!titles.has(o.title), `duplicate title ${o.title}`)
    titles.add(o.title)
    for (const [label, href] of o.see || []) {
      assert.ok(label.length > 2 && href.startsWith('/'), `${slug}: bad link ${label}`)
      assert.ok(SITEMAP.includes(`https://ugabuga.co.il${href}</loc>`), `${slug}: ${href} is not a listed page`)
    }
  }
})

test('cannibalising guides got their own angle (no guide repeats an idea page title)', () => {
  const ideaTitles = new Set(Object.entries(IDEA_ARTICLES).map(([s, a]) => IDEA_SEO[s]?.title || a.title))
  for (const g of GUIDES) assert.ok(!ideaTitles.has(g.title), `guide "${g.title}" duplicates an idea page`)
  const byslug = Object.fromEntries(GUIDES.map(g => [g.slug, g.title]))
  assert.notEqual(byslug['birthday-without-entertainer'], IDEA_ARTICLES['without-entertainer'].title)
})

test('school-holiday pages target the "משרד החינוך" searches', () => {
  assert.ok(HUB_COPY.seoTitle.startsWith('לוח חופשות משרד החינוך'))
  assert.ok(HUB_COPY.h1.includes('לוח חופשות משרד החינוך'))
  for (const slug of ['hanukkah', 'pesach', 'purim', 'shavuot']) {
    const h = HOLIDAYS.find(x => x.slug === slug)
    assert.ok(h.seoTitle.includes('משרד החינוך'), slug)
    assert.ok((h.seoTitle + BRAND).length <= 66, `${slug} title ${h.seoTitle.length}`)
  }
})

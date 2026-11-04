// /courses: every course in the catalog loads, and every lesson is complete and listed in the sitemap
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { COURSES, LOAD } = await import('../src/courses/catalog.js')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')

const own = COURSES.filter(c => !c.href)

test('every course without its own page has a loader, and every loader is listed', () => {
  for (const c of own) assert.ok(LOAD[c.slug], c.slug)
  for (const slug of Object.keys(LOAD)) assert.ok(own.some(c => c.slug === slug), slug)
})

for (const meta of own) {
  test(`course ${meta.slug}: lessons are complete, unique and in the sitemap`, async () => {
    const c = (await LOAD[meta.slug]()).default
    assert.equal(c.slug, meta.slug)
    assert.ok(c.seoTitle.length <= 70 && c.description && c.faq.length && c.about.length)
    assert.ok(sitemap.includes(`https://ugabuga.co.il/courses/${c.slug}<`), 'course home in sitemap')
    const slugs = new Set()
    for (const l of c.lessons) {
      assert.ok(!slugs.has(l.slug), `duplicate ${l.slug}`); slugs.add(l.slug)
      assert.ok(l.title && l.short && l.seo && l.emoji, l.slug)
      assert.ok(l.body.length >= 3 && l.practice.length >= 2, l.slug)
      assert.ok(l.quiz.length >= 3, l.slug)
      for (const [q, opts, ok, why] of l.quiz) {
        assert.ok(q && why && opts.length >= 2 && new Set(opts).size === opts.length, q)
        assert.ok(Number.isInteger(ok) && ok >= 0 && ok < opts.length, q)
      }
      assert.ok(sitemap.includes(`https://ugabuga.co.il/courses/${c.slug}/${l.slug}<`), `${l.slug} in sitemap`)
    }
  })
}

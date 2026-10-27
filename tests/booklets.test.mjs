import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { BOOKLETS } from '../src/booklets/registry.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('every booklet is complete and has a unique slug and title', () => {
  const slugs = new Set(), titles = new Set()
  for (const b of BOOKLETS) {
    assert.match(b.slug, /^[a-z0-9-]+$/, b.slug)
    assert.ok(!slugs.has(b.slug) && !titles.has(b.title), `duplicate ${b.slug}`)
    slugs.add(b.slug); titles.add(b.title)
    for (const k of ['emoji', 'title', 'seoTitle', 'description', 'intro', 'audience', 'subject', 'added']) assert.ok(b[k], `${b.slug}: missing ${k}`)
    assert.ok(b.pages.length >= 10, `${b.slug}: a booklet has at least 10 pages`)
    assert.equal(new Set(b.pages).size, b.pages.length, `${b.slug}: page titles repeat`)
    assert.ok(b.paragraphs.length >= 2 && b.faq.length >= 2 && b.related.length >= 2, `${b.slug}: page copy`)
    assert.ok(b.description.length >= 80 && b.description.length <= 220, `${b.slug}: description length ${b.description.length}`)
    assert.equal(typeof b.load, 'function')
  }
})

test('every booklet is in the sitemap and the site search', () => {
  const sitemap = read('public/sitemap-static.xml'), search = read('src/data/searchStatic.js')
  for (const path of ['/booklets', ...BOOKLETS.map(b => `/booklets/${b.slug}`)]) {
    assert.ok(sitemap.includes(`https://ugabuga.co.il${path}</loc>`), `sitemap: ${path}`)
    assert.ok(search.includes(`to: '${path}'`), `search: ${path}`)
  }
})

test('every booklet module exists and reads its page list from the registry', () => {
  const registry = read('src/booklets/registry.js')
  for (const m of registry.matchAll(/import\('\.\/([\w-]+\.jsx)'\)/g)) {
    assert.ok(existsSync(new URL(`../src/booklets/${m[1]}`, import.meta.url)), m[1])
    assert.match(read(`src/booklets/${m[1]}`), /bookletBySlug\('[a-z0-9-]+'\)\.pages/, `${m[1]} uses the registry page list`)
  }
  assert.equal([...registry.matchAll(/load: \(\) => import/g)].length, BOOKLETS.length)
})

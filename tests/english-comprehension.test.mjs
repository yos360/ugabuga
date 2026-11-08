import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { UNSEEN_INDEX } from '../src/data/unseen/index.js'
import { RC_META } from '../src/en/comprehension/meta.js'
import { RC_LEVELS } from '../src/en/comprehension/levels.js'

const dir = new URL('../src/en/comprehension/i18n/', import.meta.url)
const HEBREW = /[֐-׿]/

test('every English unseen test has an English card and a level', () => {
  const en = UNSEEN_INDEX.filter(t => t.lang === 'en')
  assert.equal(RC_META.length, en.length)
  for (const t of RC_META) assert.ok(RC_LEVELS.some(l => l.id === t.level), t.slug)
})

test('each overlay matches its test: same questions, same glossary words, no Hebrew left', async () => {
  for (const f of readdirSync(dir).filter(x => x.endsWith('.js'))) {
    const { EN } = await import(new URL(f, dir))
    const { TESTS } = await import(new URL(`../src/data/unseen/${f}`, import.meta.url))
    assert.ok(!HEBREW.test(readFileSync(new URL(f, dir), 'utf8')), `${f} has Hebrew`)
    for (const t of TESTS) {
      const o = EN[t.slug]
      assert.ok(o?.summary && o.genre, `${t.slug}: summary and genre`)
      assert.equal(o.questions.length, t.questions.length, `${t.slug}: question count`)
      o.questions.forEach((q, i) => assert.ok(q.explain, `${t.slug} q${i + 1}: explain`))
      assert.deepEqual((o.glossary || []).map(g => g[0]), (t.glossary || []).map(g => g[0]), `${t.slug}: glossary words`)
      // What the English page shows from the source must be English (or replaced by the overlay).
      t.questions.forEach((q, i) => {
        const shown = { ...q, ...o.questions[i] }
        assert.ok(!HEBREW.test(shown.q) && !HEBREW.test(JSON.stringify(shown.options || [])) && !HEBREW.test(String(shown.answer)), `${t.slug} q${i + 1} shows Hebrew`)
      })
    }
  }
})

test('the section is routed and listed in the sitemap', () => {
  const routes = readFileSync(new URL('../src/en/EnglishExtra.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemaps/english.xml', import.meta.url), 'utf8')
  assert.match(routes, /COMPREHENSION_ROUTES/)
  assert.match(sitemap, /\/en\/reading-comprehension<\/loc>/)
  assert.match(sitemap, new RegExp(`/en/reading-comprehension/${RC_META[0].slug}<`))
})

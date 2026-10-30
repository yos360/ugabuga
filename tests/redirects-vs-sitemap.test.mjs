import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// A page listed in the sitemap must not be the source of a redirect: the redirect wins and the page
// is unreachable (it happened to /printables/bookmarks, built after an older redirect took its URL).
test('no sitemap page is hidden behind a redirect rule', () => {
  const read = f => readFileSync(new URL(`../public/${f}`, import.meta.url), 'utf8')
  const sitemap = read('sitemap-static.xml') + read('sitemap.xml')
  const sources = read('_redirects').split(/\r?\n/).filter(l => /^\/\S+\s+\S+\s+30[1278]\b/.test(l)).map(l => l.split(/\s+/)[0])
  assert.deepEqual(sources.filter(s => !s.includes('*') && sitemap.includes(`https://ugabuga.co.il${s}</loc>`)), [])
})

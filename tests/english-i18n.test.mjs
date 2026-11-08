import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ENGLISH_PAGES, ENGLISH_SECTIONS, englishCounterpart, isEnglishPath } from '../src/en/englishRoutes.js'
const src = readFileSync(new URL('../src/components/ui/SEO.jsx', import.meta.url), 'utf8')
const block = src.slice(src.indexOf('export const TITLE_MAX'), src.indexOf('export default function SEO'))
const { seoTitle, languageAlternates } = await import('data:text/javascript,' + encodeURIComponent(block))
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)

test('every English page has English metadata and an explicit reciprocal counterpart where one exists', () => {
  assert.equal(new Set(ENGLISH_PAGES.map(p => p.path)).size, ENGLISH_PAGES.length)
  assert.equal(new Set(ENGLISH_PAGES.filter(p => p.counterpart).map(p => p.counterpart)).size, ENGLISH_PAGES.filter(p => p.counterpart).length)
  for (const p of ENGLISH_PAGES) {
    assert.ok(isEnglishPath(p.path))
    assert.match(p.title, /[A-Za-z]/)
    assert.doesNotMatch(p.title, /[\u0590-\u05ff]/)
    assert.equal(paths.filter(x => x === p.path).length, 1, p.path)
    if (p.counterpart) {
      assert.ok(paths.includes(p.counterpart), p.counterpart)
      assert.equal(englishCounterpart(p.counterpart), p.path)
      assert.deepEqual(languageAlternates(p.path, p.counterpart, 'en'), languageAlternates(p.counterpart, p.path, 'he'))
      assert.equal(languageAlternates(p.path, p.counterpart, 'en')[2].href, 'https://ugabuga.co.il' + p.counterpart)
    } else assert.ok(p.unpairedReason)
  }
  for (const s of ENGLISH_SECTIONS) assert.ok(ENGLISH_PAGES.some(p => p.path === s.path))
  assert.equal(paths.filter(isEnglishPath).length, ENGLISH_PAGES.length)
})
test('English is separate from English lessons, and unknown equivalents do not get invented', () => {
  assert.equal(isEnglishPath('/english'), false)
  assert.equal(isEnglishPath('/enough'), false)
  assert.deepEqual(languageAlternates('/english', undefined, 'he'), [])
  assert.equal(englishCounterpart('/english'), undefined)
  assert.equal(seoTitle('Learn Hebrew', 'en'), 'Learn Hebrew | Ugabuga')
  assert.equal(seoTitle('אותיות'), 'אותיות | עוגה בוגה')
  assert.match(src, /htmlAttributes=\{\{ lang, dir: en \? 'ltr' : 'rtl' \}\}/)
})

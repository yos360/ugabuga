import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { BRAIN_PAGES } from '../src/data/brainPages.js'
import { BRAIN_GAMES } from '../src/arcade/brainRegistry.js'

test('brain guides have distinct visible content and link to canonical arcade games', () => {
  const pages = Object.values(BRAIN_PAGES)
  assert.equal(pages.length, 6)
  assert.equal(new Set(pages.map(p => p.title)).size, 6)
  assert.equal(new Set(pages.map(p => p.intro)).size, 6)
  const slugs = new Set(BRAIN_GAMES.map(g => g.slug))
  for (const page of pages) {
    assert.ok(page.sections.length >= 3 && page.faq.length >= 2)
    assert.ok(page.games.every(slug => slugs.has(slug)))
  }
})
test('all guides and canonical game URLs are in the curated prerender sitemap', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  for (const page of Object.values(BRAIN_PAGES)) {
    assert.ok(app.includes(`path="${page.path}"`))
    assert.equal(sitemap.split(`https://ugabuga.co.il${page.path}</loc>`).length - 1, 1)
  }
  for (const game of BRAIN_GAMES) assert.equal(sitemap.split(`https://ugabuga.co.il/online-games/${game.slug}</loc>`).length - 1, 1)
})

// "מילה אחת" (/riddles/one-word): every level is complete, the page is routed, listed and in the sitemaps.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ONE_WORD_LEVELS, ONE_WORD_PATH } from '../src/data/oneWordRiddle.js'
import { DAILY_RIDDLES } from '../src/data/dailyRiddles.js'
import { RIDDLE_PAGES } from '../src/data/content/riddles.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('five levels, each with a visible word and a meaning', () => {
  assert.equal(ONE_WORD_LEVELS.length, 5)
  for (const l of ONE_WORD_LEVELS) {
    assert.ok(l.words.length >= 5, l.label)
    assert.ok(l.words[l.shown], `${l.label}: shown word`)
    assert.ok(l.meaning.trim(), `${l.label}: meaning`)
  }
})

test('level 5 is the proverb the reel leaves open', () => {
  assert.equal(ONE_WORD_LEVELS[4].words.join(' '), 'לא הביישן למד ולא הקפדן מלמד')
  assert.equal(ONE_WORD_LEVELS[4].words[ONE_WORD_LEVELS[4].shown], 'הקפדן')
})

test('the slug is free, and the page is routed, linked and in the sitemaps', () => {
  const slug = ONE_WORD_PATH.split('/').pop()
  assert.ok(!RIDDLE_PAGES.some(p => p.slug === slug))
  assert.ok(!DAILY_RIDDLES.some(r => r.id === slug))
  assert.ok(read('src/App.jsx').includes(`path="${ONE_WORD_PATH}"`))
  assert.ok(read('src/pages/tools/Riddles.jsx').includes(`to="${ONE_WORD_PATH}"`))
  for (const f of ['public/sitemap-static.xml', 'public/sitemap-full.xml', 'public/sitemaps/pages.xml']) assert.ok(read(f).includes(`<loc>https://ugabuga.co.il${ONE_WORD_PATH}</loc>`), f)
})

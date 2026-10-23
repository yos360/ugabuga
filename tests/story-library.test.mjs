// The added bedtime stories (src/data/stories/batch-*.js): same rules as the original 30, and the light
// index, site search and sitemap stay in sync with them (rebuild with scripts/build-story-index.mjs).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const { BEDTIME_STORIES, storyWords } = await import('../src/data/bedtimeStories.js')
const { STORY_INDEX } = await import('../src/data/storyIndex.js')
const { STORY_SEARCH } = await import('../src/data/storySearch.js')
const dir = new URL('../src/data/stories/', import.meta.url)
const added = []
for (const f of readdirSync(dir).filter(f => /^batch-\d+\.js$/.test(f)).sort()) for (const s of (await import(new URL(f, dir).href)).STORIES) added.push({ s, src: f.replace(/\.js$/, '') })

test('every added story passes the story checker (length, genders, tokens, pictures, uniqueness)', () => {
  execFileSync(process.execPath, [new URL('../scripts/check-stories.mjs', import.meta.url).pathname], { stdio: 'pipe' })
})

test('the index lists exactly the original and added stories, in order, with their source file and word count', () => {
  const expected = [...BEDTIME_STORIES.map(s => ({ s, src: 'core' })), ...added]
  assert.deepEqual(STORY_INDEX.map(m => `${m.slug}@${m.src}`), expected.map(({ s, src }) => `${s.slug}@${src}`))
  for (const { s } of expected) assert.equal(STORY_INDEX.find(m => m.slug === s.slug).words, storyWords(s), s.slug)
})

test('every added story is in site search and in the sitemap', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const { s } of added) {
    assert.ok(STORY_SEARCH.some(e => e.to === `/stories/${s.slug}`), `search ${s.slug}`)
    assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il/stories/${s.slug}</loc>`), `sitemap ${s.slug}`)
  }
})

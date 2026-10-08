// Bedtime stories library (/stories): 30 original stories, personalizable names + gender tokens.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const {
  BEDTIME_STORIES, STORY_AGES, STORY_THEMES, renderStory, fillText, storyWords, storyMinutes, readingMinutes,
  WORDS_PER_MINUTE, relatedStories, cleanName, MAX_NAME,
} = await import('../src/data/bedtimeStories.js')

const tokensIn = s => [s.title, s.summary, s.moral, ...s.body].join(' ').match(/\{[^{}]*\}/g) || []
const castFor = (s, g, name) => Object.fromEntries(Object.keys(s.chars).map(k => [k, { g, ...(name ? { name } : {}) }]))

test('exactly 30 stories with unique slugs and titles, and complete metadata', () => {
  assert.equal(BEDTIME_STORIES.length, 30)
  assert.equal(new Set(BEDTIME_STORIES.map(s => s.slug)).size, 30)
  assert.equal(new Set(BEDTIME_STORIES.map(s => renderStory(s).title)).size, 30)
  const ages = STORY_AGES.map(a => a.id), themes = STORY_THEMES.map(t => t.id)
  for (const s of BEDTIME_STORIES) {
    assert.match(s.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, s.slug)
    assert.ok(ages.includes(s.age), `${s.slug} age`)
    assert.ok(themes.includes(s.theme), `${s.slug} theme`)
    for (const f of ['title', 'summary', 'moral', 'emoji']) assert.ok(typeof s[f] === 'string' && s[f].trim().length > 0, `${s.slug} ${f}`)
    assert.ok(s.body.length >= 6, `${s.slug} paragraphs`)
    assert.ok(s.chars.hero, `${s.slug} has a hero`)
  }
  // every age and every theme is represented
  for (const a of ages) assert.ok(BEDTIME_STORIES.some(s => s.age === a), a)
  for (const t of themes) assert.ok(BEDTIME_STORIES.some(s => s.theme === t), t)
})

test('every token is defined for its story, with a default name', () => {
  for (const s of BEDTIME_STORIES) {
    for (const [k, c] of Object.entries(s.chars)) {
      assert.ok(c.name && c.name.length <= MAX_NAME, `${s.slug}.${k} default name`)
      assert.ok(c.g === 'm' || c.g === 'f', `${s.slug}.${k} default gender`)
      assert.ok(c.role, `${s.slug}.${k} role label`)
    }
    for (const t of tokensIn(s)) {
      const m = t.match(/^\{(\w+)(?::([^{}|]*)\|([^{}]*))?\}$/)
      assert.ok(m, `${s.slug}: malformed token ${t}`)
      const key = m[1]
      if (key === 'both') { assert.ok(m[2] !== undefined, `${s.slug}: {both} needs two forms`); continue }
      assert.ok(s.chars[key], `${s.slug}: token ${t} has no character "${key}"`)
      if (m[2] !== undefined) assert.ok(s.chars[key].gendered, `${s.slug}: gendered token ${t} for a fixed-gender character`)
    }
  }
})

test('rendering with every character male or female leaves no unresolved tokens', () => {
  for (const s of BEDTIME_STORIES) for (const g of ['m', 'f']) for (const name of [undefined, 'נועה']) {
    const r = renderStory(s, castFor(s, g, name))
    const text = [r.title, r.summary, r.moral, ...r.body].join('\n')
    assert.ok(!/[{}|]/.test(text), `${s.slug} (${g}) has leftovers: ${text.match(/.{0,15}[{}|].{0,15}/)?.[0]}`)
    if (name) assert.ok(r.body.join(' ').includes(name), `${s.slug}: custom hero name shows up`)
  }
})

test('the default render uses the default gendered forms and names', () => {
  const s = BEDTIME_STORIES.find(x => x.slug === 'the-first-rain')
  assert.ok(renderStory(s).body.join(' ').includes(s.chars.hero.name))
  assert.equal(fillText('{hero} {hero:הלך|הלכה}', s), `${s.chars.hero.name} ${s.chars.hero.g === 'f' ? 'הלכה' : 'הלך'}`)
  assert.equal(fillText('{hero:הלך|הלכה}', s, { hero: { g: 'm' } }), 'הלך')
  assert.equal(fillText('{both:הם|הן}', s, { hero: { g: 'f' } }), 'הן')
})

test('word counts are 350–600 (default cast and both genders) and reading time follows the word count', () => {
  for (const s of BEDTIME_STORIES) {
    const w = storyWords(s)
    assert.ok(w >= 350 && w <= 600, `${s.slug}: ${w} words`)
    for (const g of ['m', 'f']) { const wg = storyWords(s, castFor(s, g)); assert.ok(wg >= 340 && wg <= 610, `${s.slug} (${g}): ${wg} words`) }
    assert.equal(storyMinutes(s), readingMinutes(w))
    assert.equal(storyMinutes(s), Math.max(1, Math.round(w / WORDS_PER_MINUTE)))
    assert.ok(storyMinutes(s) >= 3 && storyMinutes(s) <= 6, `${s.slug}: ${storyMinutes(s)} min`)
  }
})

test('pics: one slot per paragraph, 2–3 single emojis, never adjacent, always on the last paragraph', () => {
  const EMOJI = /^\p{Extended_Pictographic}\uFE0F?$/u
  for (const s of BEDTIME_STORIES) {
    assert.ok(Array.isArray(s.pics), `${s.slug} pics`)
    assert.equal(s.pics.length, s.body.length, `${s.slug} pics length`)
    for (const p of s.pics) assert.ok(p === null || (typeof p === 'string' && EMOJI.test(p)), `${s.slug}: bad pic ${p}`)
    const on = s.pics.map((p, i) => p ? i : -1).filter(i => i >= 0)
    assert.ok(on.length >= 2 && on.length <= (s.body.length <= 6 ? 2 : 3), `${s.slug}: ${on.length} pics`)
    assert.ok(on.every((i, k) => k === 0 || i - on[k - 1] > 1), `${s.slug}: adjacent pics`)
    assert.ok(s.pics.at(-1), `${s.slug}: last paragraph has a pic`)
  }
})

test('names are cleaned and capped, and related stories are 3 other stories', () => {
  assert.equal(cleanName('  <b>{hero}</b>  '), 'bhero/b')
  assert.equal(cleanName('א'.repeat(40)).length, MAX_NAME)
  for (const s of BEDTIME_STORIES) {
    const rel = relatedStories(s)
    assert.equal(rel.length, 3)
    assert.ok(rel.every(x => x.slug !== s.slug))
    assert.equal(new Set(rel.map(x => x.slug)).size, 3)
  }
})

test('hub and every story page are in the sitemap and in site search', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
  for (const path of ['/stories', ...BEDTIME_STORIES.map(s => `/stories/${s.slug}`)]) {
    assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${path}</loc><lastmod>2026-10-08</lastmod>`), `sitemap ${path}`)
    assert.ok(search.includes(`to: '${path}'`), `search ${path}`)
  }
})

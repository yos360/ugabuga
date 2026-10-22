// Checks new bedtime-story batches (src/data/stories/batch-*.js) with the same rules the 30 original
// stories pass in tests/bedtime-stories.test.mjs, plus uniqueness across the whole library.
// Usage: node scripts/check-stories.mjs [file ...]   (no args = every batch)
import { readdirSync } from 'node:fs'
import { BEDTIME_STORIES, STORY_AGES, STORY_THEMES, MAX_NAME, renderStory, storyWords, storyMinutes } from '../src/data/bedtimeStories.js'

const dir = new URL('../src/data/stories/', import.meta.url)
const files = process.argv.slice(2).length ? process.argv.slice(2).map(f => new URL(f, `file://${process.cwd()}/`)) : readdirSync(dir).filter(f => /^batch-\d+\.js$/.test(f)).sort().map(f => new URL(f, dir))
const ages = STORY_AGES.map(a => a.id), themes = STORY_THEMES.map(t => t.id)
const EMOJI = /^\p{Extended_Pictographic}️?$/u
const TOKEN = /\{(\w+)(?::([^{}|]*)\|([^{}]*))?\}/g
const errors = []
const err = (s, m) => errors.push(`${s?.slug || '?'}: ${m}`)
const castFor = (s, g) => Object.fromEntries(Object.entries(s.chars).filter(([, c]) => c.gendered).map(([k]) => [k, { g }]))

const seenSlug = new Set(BEDTIME_STORIES.map(s => s.slug)), seenTitle = new Set(BEDTIME_STORIES.map(s => renderStory(s).title))
let total = 0
for (const f of files) {
  const { STORIES } = await import(f.href)
  for (const s of STORIES) {
    total++
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug)) err(s, 'bad slug')
    if (seenSlug.has(s.slug)) err(s, 'duplicate slug'); seenSlug.add(s.slug)
    if (!ages.includes(s.age)) err(s, `bad age ${s.age}`)
    if (!themes.includes(s.theme)) err(s, `bad theme ${s.theme}`)
    for (const k of ['title', 'summary', 'moral', 'emoji']) if (typeof s[k] !== 'string' || !s[k].trim()) err(s, `missing ${k}`)
    if (!Array.isArray(s.body) || s.body.length < 6) { err(s, 'needs 6+ paragraphs'); continue }
    if (!s.chars?.hero) { err(s, 'no hero'); continue }
    for (const [k, c] of Object.entries(s.chars)) {
      if (!c.name || c.name.length > MAX_NAME) err(s, `${k} default name`)
      if (c.g !== 'm' && c.g !== 'f') err(s, `${k} default gender`)
      if (!c.role) err(s, `${k} role`)
    }
    for (const text of [s.title, s.summary, s.moral, ...s.body]) for (const m of text.matchAll(TOKEN)) {
      const key = m[1]
      if (key === 'both') { if (m[2] === undefined) err(s, `{both} needs two forms: ${m[0]}`); continue }
      if (!s.chars[key]) err(s, `token ${m[0]} has no character`)
      else if (m[2] !== undefined && !s.chars[key].gendered) err(s, `gendered token ${m[0]} on fixed character`)
    }
    const title = renderStory(s).title
    if (seenTitle.has(title)) err(s, `duplicate title ${title}`); seenTitle.add(title)
    for (const g of ['m', 'f']) {
      const r = renderStory(s, castFor(s, g))
      const text = [r.title, r.summary, r.moral, ...r.body].join(' ')
      if (/[{}|]/.test(text)) err(s, `(${g}) leftover token near: ${text.match(/.{0,15}[{}|].{0,15}/)?.[0]}`)
      const w = storyWords(s, castFor(s, g)); if (w < 340 || w > 610) err(s, `(${g}) ${w} words`)
    }
    const w = storyWords(s); if (w < 350 || w > 600) err(s, `${w} words (350–600)`)
    const min = storyMinutes(s); if (min < 3 || min > 6) err(s, `${min} min`)
    if (!Array.isArray(s.pics) || s.pics.length !== s.body.length) { err(s, 'pics must have one slot per paragraph'); continue }
    for (const p of s.pics) if (!(p === null || (typeof p === 'string' && EMOJI.test(p)))) err(s, `bad pic ${p}`)
    const on = s.pics.map((p, i) => p ? i : -1).filter(i => i >= 0)
    if (on.length < 2 || on.length > (s.body.length <= 6 ? 2 : 3)) err(s, `${on.length} pics`)
    if (!on.every((i, k) => k === 0 || i - on[k - 1] > 1)) err(s, 'adjacent pics')
    if (!s.pics.at(-1)) err(s, 'last paragraph needs a pic')
  }
}
console.log(`${total} stories checked in ${files.length} file(s): ${errors.length ? errors.length + ' problem(s)' : 'all OK'}`)
for (const e of errors) console.log(' - ' + e)
process.exit(errors.length ? 1 : 0)

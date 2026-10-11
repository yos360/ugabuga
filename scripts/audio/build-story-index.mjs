// Writes public/audio/stories/index.json: { slug: fileCount } for every story whose recording is
// complete (title + one file per paragraph + goodnight, numbered 0..n+1 with no gaps).
// Run after adding story recordings: node scripts/audio/build-story-index.mjs
import { readdirSync, existsSync, writeFileSync } from 'node:fs'
import { BEDTIME_STORIES, renderStory } from '../../src/data/bedtimeStories.js'
const root = new URL('../../public/audio/stories/', import.meta.url)
const index = {}
for (const s of BEDTIME_STORIES) {
  const want = renderStory(s).body.length + 2
  const dir = new URL(s.slug + '/', root)
  if (!existsSync(dir)) continue
  const have = new Set(readdirSync(dir))
  if (Array.from({ length: want }, (_, k) => `${k}.mp3`).every(f => have.has(f))) index[s.slug] = want
}
writeFileSync(new URL('index.json', root), JSON.stringify(index))
console.log(`stories recorded: ${Object.keys(index).length}/${BEDTIME_STORIES.length}`)

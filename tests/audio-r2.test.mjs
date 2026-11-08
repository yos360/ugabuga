import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

// The live site plays clips from audio.ugabuga.co.il, not from the deploy (scripts/strip-audio.mjs).
// Every clip in public/audio must therefore be uploaded first: node scripts/upload-audio.mjs
test('every recorded clip is uploaded to the audio bucket', () => {
  const root = fileURLToPath(new URL('../public/audio/', import.meta.url))
  const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])
  const uploaded = new Set(readFileSync(new URL('../scripts/audio/r2-uploaded.txt', import.meta.url), 'utf8').split('\n').filter(Boolean))
  const missing = walk(root).filter(f => f.endsWith('.mp3')).map(f => 'audio/' + relative(root, f).replaceAll('\\', '/')).filter(k => !uploaded.has(k))
  assert.deepEqual(missing.slice(0, 20), [], `${missing.length} clips are not uploaded — run: node scripts/upload-audio.mjs`)
})

test('the production build strips clips and the code reads them through audioUrl', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  assert.match(pkg.scripts.build, /strip-audio\.mjs$/)
  for (const f of ['src/utils/speak.js', 'src/travel/storyCatalog.js', 'src/en/travel/storyData.js', 'src/pages/stories/storyReading.js', 'src/pages/unseen/Unseen.jsx', 'src/en/comprehension/Comprehension.jsx']) {
    const s = readFileSync(new URL('../' + f, import.meta.url), 'utf8')
    assert.match(s, /audioUrl\(`\/audio\//, f)
  }
})

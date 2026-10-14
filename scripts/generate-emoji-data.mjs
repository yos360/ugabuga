// Inputs are the official emoji-test.txt and CLDR Hebrew annotations / annotationsDerived JSON.
// See docs/emoji-sources.md for pinned URLs, package versions and regeneration instructions.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const [emojiPath, annotationsPath, derivedPath] = process.argv.slice(2)
if (!derivedPath) throw new Error('Usage: node scripts/generate-emoji-data.mjs emoji-test.txt annotations.json annotationsDerived.json')
const sources = await Promise.all([emojiPath, annotationsPath, derivedPath].map(p => readFile(p, 'utf8')))
if (!sources[0].includes('# Version: 17.0')) throw new Error('Expected Emoji 17.0; review compatibility before upgrading.')
const normalize = s => s.replaceAll('\uFE0F', '')
const annotations = new Map(Object.entries({ ...JSON.parse(sources[1]).annotations.annotations, ...JSON.parse(sources[2]).annotationsDerived.annotations }).map(([k, v]) => [normalize(k), v]))
const categories = { 'Smileys & Emotion':'faces', 'People & Body':'people', Component:'people', 'Animals & Nature':'animals', 'Food & Drink':'food', 'Travel & Places':'travel', Activities:'activities', Objects:'objects', Symbols:'symbols', Flags:'flags' }
const entries = []
let group, subgroup
for (const line of sources[0].split(/\r?\n/)) {
  if (line.startsWith('# group: ')) group = line.slice(9)
  if (line.startsWith('# subgroup: ')) subgroup = line.slice(12)
  const m = line.match(/^([A-F0-9 ]+)\s*;\s*(fully-qualified|component)\s*#\s*\S+\s+E([\d.]+)/)
  if (!m) continue
  const emoji = String.fromCodePoint(...m[1].trim().split(/\s+/).map(x => parseInt(x, 16)))
  const annotation = annotations.get(normalize(emoji))
  if (!annotation?.tts?.[0]) throw new Error(`Missing Hebrew annotation for ${emoji}`)
  // CLDR's Hebrew DVD tts is "dvd". Keep it, adding its exact Hebrew keyword.
  const name = /[\u0590-\u05FF]/.test(annotation.tts[0]) ? annotation.tts[0] : `${annotation.tts[0]} — ${annotation.default.find(k => /[\u0590-\u05FF]/.test(k))}`
  if (!/[\u0590-\u05FF]/.test(name)) throw new Error(`Missing Hebrew name for ${emoji}`)
  entries.push({ emoji, name, tts: annotation.tts[0], keywords: annotation.default || [], category: subgroup === 'heart' ? 'hearts' : categories[group], version: m[3], component: m[2] === 'component' })
}
if (entries.length !== 3953 || entries.some(e => !e.category)) throw new Error('Unexpected emoji coverage')
const data = { unicodeVersion:'17.0', cldrVersion:'48.2.0', license:'Unicode-3.0', sourceSha256:sources.map(s => createHash('sha256').update(s).digest('hex')), entries }
await mkdir(new URL('../public/data/', import.meta.url), { recursive:true })
await writeFile(new URL('../public/data/emoji-he-17.json', import.meta.url), JSON.stringify(data))
console.log(`${entries.length} Hebrew emoji entries written (3944 fully-qualified + 9 components).`)

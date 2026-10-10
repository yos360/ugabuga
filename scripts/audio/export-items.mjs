// Writes a clip list for the generator: node scripts/audio/export-items.mjs <out.json> [group,group...]
import { writeFileSync } from 'node:fs'
import { siteItems } from './siteItems.mjs'
import { audioKey } from '../../src/utils/audioKey.js'
const [out, groups] = process.argv.slice(2)
const want = groups ? new Set(groups.split(',')) : null
const items = siteItems().filter(i => !want || want.has(i.group)).map(i => ({ ...i, file: `public/audio/${i.lang}/${audioKey(i.key)}.mp3` }))
writeFileSync(out, JSON.stringify(items))
console.log(`${items.length} items, ${items.reduce((s, i) => s + i.text.length, 0)} chars → ${out}`)

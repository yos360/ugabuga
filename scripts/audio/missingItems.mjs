// Every text the site can read aloud that has no recorded clip yet (public/audio/<lang>/index.json).
// Covers the lists in heItems / otherItems / mulItems / siteItems plus pages added later (kids zone,
// holiday blessings, letters game prompts, first-grade reading, dictation, graded reading).
// Hebrew is recorded as plain full-spelling text (see plainHe.mjs), never with niqqud.
//   node scripts/audio/missingItems.mjs [out.json]   → summary per group (+ the clip list)
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { siteItems } from './siteItems.mjs'
import { otherItems } from './otherItems.mjs'
import { plainHeItems, spoken } from './plainHe.mjs'
import { audioKey } from '../../src/utils/audioKey.js'

const src = p => import(new URL('../../src/' + p, import.meta.url))
const { KIDS_TILES } = await src('data/kidsZone.js')
const { HOLIDAY_BLESSINGS, speakText } = await src('data/holidayBlessings.js')
const { HEBREW } = await src('data/letterLearning.js')
const { DICTATION } = await src('learn/learnData.js')
const { GRADED_READING } = await src('learn/readingGrades.js')

const KIDS_TITLE = 'מה בא לך לעשות?' // KidsZone SAY_TITLE
const CLASS_ONE_WORDS = ['חתול', 'כלב', 'בית', 'שמש', 'ספר', 'פרח'] // ClassOnePrep WORDS

// Every { text } inside the blessings data that the page reads aloud (not the `plain: true` notes).
function blessingTexts(node, out = []) {
  if (Array.isArray(node)) node.forEach(n => blessingTexts(n, out))
  else if (node && typeof node === 'object') {
    if (typeof node.text === 'string' && node.title && !node.plain) out.push(speakText(node.text))
    for (const v of Object.values(node)) if (v && typeof v === 'object') blessingTexts(v, out)
  }
  return out
}

export function allItems() {
  const out = new Map()
  const add = (lang, key, text, group) => {
    if (!key) return
    const id = lang + '\0' + audioKey(key)
    if (!out.has(id)) out.set(id, { lang, key, text, group, file: `public/audio/${lang}/${audioKey(key)}.mp3` })
  }
  for (const i of plainHeItems()) add('he', i.key, i.text, i.group)
  for (const i of siteItems()) if (i.lang === 'he' && ['animals', 'riddles'].includes(i.group)) add('he', i.key, spoken(i.key), i.group)
  for (const i of siteItems()) if (i.lang !== 'he') add(i.lang, i.key, i.text, i.group)
  for (const i of otherItems()) add(i.lang.slice(0, 2), i.key, i.text, i.group || 'other')
  add('he', KIDS_TITLE, KIDS_TITLE, 'kids')
  for (const t of KIDS_TILES) add('he', t.label, t.label, 'kids')
  for (const t of blessingTexts(HOLIDAY_BLESSINGS)) add('he', t, t, 'blessings')
  add('he', 'איך קוראים לאות הזאת?', 'איך קוראים לאות הזאת?', 'letters-game')
  for (const h of HEBREW) {
    add('he', `לחצו על האות ${h.name}`, spoken(`לחצו על האות ${h.name}`), 'letters-game')
    for (const w of h.words) add('he', w[2] || w[0], spoken(w[2] || w[0]), 'letters-game')
  }
  for (const w of CLASS_ONE_WORDS) add('he', `מצאו את המילה ${w}`, `מצאו את המילה ${w}`, 'class1')
  for (const d of DICTATION) for (const w of d.words) add('he', w, spoken(w), 'dictation')
  for (const r of GRADED_READING) { for (const t of r.text) add('he', t, spoken(t), 'graded-reading'); for (const [q] of r.q) add('he', q, spoken(q), 'graded-reading') }
  return [...out.values()]
}

const indexes = {}
const recorded = (lang, key) => (indexes[lang] ??= new Set(JSON.parse(readFileSync(new URL(`../../public/audio/${lang}/index.json`, import.meta.url))))).has(audioKey(key))
export const missingItems = () => allItems().filter(i => !recorded(i.lang, i.key))

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const all = allItems(), miss = missingItems(), sum = {}
  for (const i of miss) { const s = (sum[`${i.lang}:${i.group}`] ??= { n: 0, chars: 0 }); s.n++; s.chars += i.text.length }
  for (const [g, s] of Object.entries(sum)) console.log(g.padEnd(22), String(s.n).padStart(5), 'clips', String(s.chars).padStart(7), 'chars')
  console.log(`missing ${miss.length} of ${all.length}, ${miss.reduce((s, i) => s + i.text.length, 0)} chars`)
  if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(miss, null, 1))
}

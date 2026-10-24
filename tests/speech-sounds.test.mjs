// Speech-sound practice data (/speech/sounds/*): every sound in the registry has a data file with the
// agreed schema, lists without duplicates, and the target sound really sits where its list says
// (judged by letters — the authors check pronunciation by ear; see src/data/speech/sounds.js).
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SOUNDS, PLANNED_SOUNDS, letterUnits, unitMatches, plainHebrew, itemsFor, wordsFor } from '../src/data/speech/sounds.js'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const all = await Promise.all(SOUNDS.map(async s => ({ meta: s, data: (await s.load()).default })))

const hasTarget = (units, letters, at) => letters.some(l => unitMatches(units[at] || '', l))
const words = n => plainHebrew(n).split(/\s+/).filter(w => /[א-ת]/.test(w)).length

test('the registry lists each sound once, routed and in the sitemap', () => {
  assert.equal(new Set(SOUNDS.map(s => s.id)).size, SOUNDS.length)
  assert.equal(new Set(PLANNED_SOUNDS.map(s => s.id)).size, PLANNED_SOUNDS.length)
  for (const s of SOUNDS) {
    assert.ok(PLANNED_SOUNDS.some(p => p.id === s.id), `${s.id} is not in PLANNED_SOUNDS`)
    assert.equal(s.path, `/speech/sounds/${s.id}`)
    assert.ok(app.includes(`path="${s.path}"`), `route ${s.path}`)
    assert.ok(sitemap.includes(`https://ugabuga.co.il${s.path}<`), `sitemap ${s.path}`)
  }
  for (const p of ['/speech', '/speech/card-maker']) {
    assert.ok(app.includes(`path="${p}"`), `route ${p}`)
    assert.ok(sitemap.includes(`https://ugabuga.co.il${p}<`), `sitemap ${p}`)
  }
})

for (const { meta, data } of all) {
  test(`sound ${meta.id}: schema`, () => {
    assert.equal(data.id, meta.id)
    assert.equal(data.sound, meta.sound)
    assert.ok(Array.isArray(data.letters) && data.letters.length)
    assert.ok(data.about.length >= 1 && data.acquisition.range && data.acquisition.note && data.acquisition.source.href.startsWith('https://'))
    for (const k of ['initial', 'medial']) assert.ok(data.words[k].length >= 12 && data.words[k].length <= 20, `${k}: ${data.words[k].length}`)
    assert.ok(data.words.final.length >= 8 && data.words.final.length <= 20, `final: ${data.words.final.length}`)
    assert.ok(data.clusters.length >= 6)
    for (const k of ['initial', 'medial', 'final']) assert.ok(data.syllables[k].length >= 3, `syllables ${k}`)
    assert.ok(data.phrases.length >= 8)
    assert.ok(data.sentences.length >= 8 && data.sentences.length <= 12)
    const n = words(data.story.text)
    assert.ok(n >= 80 && n <= 150, `story has ${n} words`)
    assert.ok(data.games.length >= 2 && data.games.every(g => g.title && g.text))
    assert.ok(data.faq.length >= 4)
    for (const k of ['title', 'description', 'h1', 'sub', 'quickQ', 'quickA', 'keys']) assert.ok(data.seo[k], `seo.${k}`)
    for (const w of wordsFor(data)) {
      assert.equal(typeof w.w, 'string')
      assert.ok(!/[ְ-ׇֻ]/.test(w.w), `${w.w}: write words without vowels`)
      if (w.e) assert.ok(!/[א-ת]/.test(w.e), `${w.w}: emoji field`)
    }
    assert.ok(itemsFor(data, 'words', 'all').length > 40)
  })

  test(`sound ${meta.id}: no duplicate words, phrases or sentences; one picture per word`, () => {
    const list = wordsFor(data).map(w => plainHebrew(w.w))
    assert.deepEqual(list.filter((w, i) => list.indexOf(w) !== i), [])
    for (const k of ['phrases', 'sentences']) {
      const t = data[k].map(x => x.t)
      assert.deepEqual(t.filter((w, i) => t.indexOf(w) !== i), [], k)
    }
    const emoji = wordsFor(data).filter(w => w.e).map(w => w.e)
    assert.deepEqual(emoji.filter((e, i) => emoji.indexOf(e) !== i), [], 'the same picture on two words')
  })

  test(`sound ${meta.id}: the target sound is where each list says`, () => {
    const L = data.letters
    for (const { w } of data.words.initial) assert.ok(hasTarget(letterUnits(w), L, 0), `initial: ${w}`)
    for (const { w } of data.words.final) { const u = letterUnits(w); assert.ok(hasTarget(u, L, u.length - 1), `final: ${w}`) }
    for (const { w } of data.words.medial) {
      const u = letterUnits(w)
      assert.ok(u.slice(1, -1).some(x => L.some(l => unitMatches(x, l))), `medial: ${w}`)
      assert.ok(!hasTarget(u, L, 0), `medial word starts with the sound: ${w}`)
    }
    for (const { w } of data.clusters) { const u = letterUnits(w); assert.ok(hasTarget(u, L, 0) || hasTarget(u, L, 1), `cluster: ${w}`) }
    for (const k of ['initial', 'medial', 'final']) for (const s of data.syllables[k]) assert.ok(letterUnits(s).some(x => L.some(l => unitMatches(x, l))), `syllable ${s}`)
    for (const k of ['phrases', 'sentences']) for (const { t } of data[k]) assert.ok(letterUnits(t).some(x => L.some(l => unitMatches(x, l))), `${k}: ${t}`)
  })

  if (data.avoid) test(`sound ${meta.id}: practice items avoid the competing sounds ${data.avoid.join(' ')}`, () => {
    const texts = [...wordsFor(data).map(w => w.w), ...data.phrases.map(p => p.t), ...data.sentences.map(s => s.t), data.story.text]
    const bad = texts.filter(t => letterUnits(t).some(u => data.avoid.some(a => unitMatches(u, a))))
    assert.deepEqual(bad, [])
  })
}

test('letter units keep the marks that decide a sound', () => {
  assert.deepEqual(letterUnits('שִׂמְלָה'), ['שׂ', 'מ', 'ל', 'ה'])
  assert.ok(unitMatches('שׂ', 'שׂ') && !unitMatches('שׂ', 'ש') && unitMatches('שׁ', 'ש') && !unitMatches('כ', 'כּ') && unitMatches('כּ', 'כ'))
})

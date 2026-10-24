// /speech/tools/practice-sheets: gendered wording, auto-filled words from the sound registry,
// the percent helper, the 21-circle chart path, registration — and that the page never stores the name.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SOUNDS } from '../src/data/speech/sounds.js'
import {
  PATH, gw, defaultWords, defaultSentences, letterIntro, practiceSteps, praiseTips, certificateText, percent, chartPath,
  CHART_CIRCLES, CERT_TYPES, itemsFromText, emojiLookup,
} from '../src/data/speech/practiceSheets.js'

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')
const all = await Promise.all(SOUNDS.map(async s => ({ meta: s, data: (await s.load()).default })))

test('wording follows the chosen gender; only the general form has a slash', () => {
  assert.equal(gw('m', 'אלוף', 'אלופת'), 'אלוף')
  assert.equal(gw('f', 'אלוף', 'אלופת'), 'אלופת')
  assert.equal(gw('n', 'אלוף', 'אלופת'), 'אלוף/אלופת')
  for (const g of ['m', 'f']) {
    const texts = [letterIntro({ gender: g, soundLabel: 'ר׳', posLabel: 'בתחילת המילה' }), ...practiceSteps({ gender: g }), ...praiseTips({ gender: g }),
      ...CERT_TYPES.flatMap(([k]) => { const c = certificateText(k, { gender: g, soundLabel: 'ר׳' }); return [c.title, ...c.lines] })]
    for (const t of texts) assert.ok(!/[א-ת]\/[א-ת]/.test(t), `${g}: ${t}`)
  }
  assert.match(certificateText('champ', { gender: 'f', soundLabel: 'ס׳' }).title, /אלופת/)
  assert.match(certificateText('finish', { gender: 'm' }).lines[0], /^סיים /)
  assert.match(letterIntro({ name: 'נועם', gender: 'm', goal: 'ר׳ במילים.' }), /נועם.*המטרה שלנו כרגע: ר׳ במילים\./)
})

test('every sound fills words and sentences, pictured words first', () => {
  for (const { meta, data } of all) {
    for (const pos of ['initial', 'medial', 'final', 'all']) {
      const w = defaultWords(data, pos, 10)
      assert.ok(w.length >= 5 && w.length <= 10, `${meta.id} ${pos}`)
      const firstPlain = w.findIndex(x => !x.e)
      if (firstPlain >= 0) assert.ok(w.slice(firstPlain).every(x => !x.e), `${meta.id} ${pos} order`)
    }
    assert.ok(defaultSentences(data, 4).length >= 3, meta.id)
    const items = itemsFromText(defaultWords(data, 'initial', 3).map(x => x.t).join('\n') + '\nמילה שלי', emojiLookup(data))
    assert.ok(items[0].e && !items[items.length - 1].e)
  }
})

test('percent and chart path', () => {
  assert.equal(percent(7, 10), 70)
  assert.equal(percent(2, 3), 67)
  assert.equal(percent('', ''), '')
  assert.equal(percent(5, 0), '')
  assert.equal(percent(11, 10), '')
  const pts = chartPath()
  assert.equal(pts.length, CHART_CIRCLES)
  assert.equal(CHART_CIRCLES, 21)
  for (const p of pts) assert.ok(p.x >= 15 && p.x <= 185 && p.y > 50 && p.y < 230)
  for (let i = 1; i < pts.length; i++) assert.ok(Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) >= 21, `circles ${i} overlap`)
})

test('registered, and the child name is never stored or sent', () => {
  assert.ok(read('../src/App.jsx').includes(`path="${PATH}"`))
  assert.ok(read('../public/sitemap-static.xml').includes(`https://ugabuga.co.il${PATH}<`))
  assert.ok(read('../src/data/searchStatic.js').includes(`to: '${PATH}'`))
  assert.ok(read('../src/data/siteMenu.js').includes(`to: '${PATH}'`))
  assert.ok(read('../src/pages/speech/SpeechHub.jsx').includes(PATH))
  const page = read('../src/pages/speech/PracticeSheets.jsx')
  assert.ok(!/localStorage|sessionStorage|indexedDB|fetch\(/.test(page))
  assert.ok(!read('../src/utils/creations.js').includes(PATH), 'print text must not be recorded for this page')
})

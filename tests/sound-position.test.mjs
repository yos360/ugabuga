import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { SOUND_QUESTIONS, SOUND_WORDS, soundUnits, pickSoundQuestions } from '../src/data/soundPosition.js'
import { emojiFile } from '../src/data/englishWords.js'
import { makeRng } from '../src/motor/rng.js'

const pos = (word, show) => SOUND_QUESTIONS.find(q => q.word === word.normalize('NFC') && q.show === show.normalize('NFC'))?.pos

test('positions follow what a child hears', () => {
  assert.equal(pos('דָּג', 'ד'), 'start')
  assert.equal(pos('דָּג', 'ג'), 'end')
  assert.equal(pos('גָּמָל', 'מ'), 'middle')
  assert.equal(pos('יָרֵחַ', 'ח'), 'end', 'patach under a final ח is said before it')
  assert.equal(pos('יוֹנָה', 'נ'), 'middle', 'a vowel follows — not the end')
  assert.equal(pos('אַגָּס', 'ג'), 'middle', 'a silent first א does not make ג the start')
})

test('silent letters and doubtful words are never asked about', () => {
  assert.equal(soundUnits('יוֹנָה').find(u => u.letter === 'ו').key, null, 'וֹ is a vowel')
  assert.equal(soundUnits('בֵּיצָה').find(u => u.letter === 'י').key, null, 'י after tsere is silent')
  assert.equal(pos('טַבַּעַת', 'ת'), undefined, 'ט and ת sound the same')
  assert.equal(pos('כּוֹכָב', 'כּ'), undefined, 'the letter is written twice')
  for (const q of SOUND_QUESTIONS) assert.ok(!'אעה'.includes(q.letter), `${q.word}: ${q.letter}`)
})

test('enough questions for many different sheets, every picture on disk', () => {
  const by = p => SOUND_QUESTIONS.filter(q => q.pos === p).length
  assert.ok(by('start') >= 60 && by('middle') >= 60 && by('end') >= 60, `${by('start')}/${by('middle')}/${by('end')}`)
  for (const w of SOUND_WORDS) assert.ok(existsSync(new URL(`../public/print-art/words/${emojiFile(w.emoji)}.svg`, import.meta.url)), `no art for ${w.word} ${w.emoji}`)
  const rng = makeRng(7), used = new Set()
  for (let p = 0; p < 5; p++) {
    const qs = pickSoundQuestions(rng, { used })
    assert.equal(qs.length, 12)
    assert.equal(new Set(qs.map(q => q.emoji)).size, 12)
    for (const q of qs) { assert.ok(!used.has(q.emoji)); used.add(q.emoji) }
    for (const id of ['start', 'middle', 'end']) assert.equal(qs.filter(q => q.pos === id).length, 4)
  }
})

test('the page is routed, in the sitemap and in the site search', () => {
  assert.match(readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8'), /path="\/printables\/sound-position" element=\{<SoundPosition \/>\}/)
  assert.ok(readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8').includes('https://ugabuga.co.il/printables/sound-position</loc>'))
  assert.ok(readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8').includes("to: '/printables/sound-position'"))
})

// "עולם ותחביבים" reading passages (src/learn/subjects/readings/<key>.js for the enrichment subjects): one or
// more per grade of the subject, well-formed questions, and a small dictionary (words) whose every word
// really appears in the passage (with or without a one- or two-letter Hebrew prefix).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'

const { SUBJECT_BY_KEY } = await import('../src/learn/subjects/subjects.js')
const WORLD = ['ai', 'computers', 'coding', 'photography', 'video', 'zodiac', 'communities', 'how-its-made', 'dinosaurs', 'ancient-worlds', 'sports', 'what-is',
  'space', 'earth-science', 'inventors', 'world-wonders', 'peoples', 'animals', 'fruits-vegetables', 'botany', 'birds', 'pets-breeds', 'arts', 'dj-music']
const fileOf = key => new URL(`../src/learn/subjects/readings/${key}.js`, import.meta.url)
const present = WORLD.filter(k => existsSync(fileOf(k)))
const words = s => s.split(/\s+/).filter(Boolean).length
const WORDS = { 2: [70, 150], 3: [90, 190], 4: [120, 240], 5: [150, 290], 6: [180, 340], 7: [210, 390], 8: [240, 430], 9: [270, 470] }

for (const key of present) {
  test(`world readings — ${key}: a passage for every grade, valid questions and dictionary`, async () => {
    const { READINGS } = await import(fileOf(key))
    const s = SUBJECT_BY_KEY[key]
    assert.ok(Array.isArray(READINGS) && READINGS.length, key)
    const files = [...new Set(s.files)]
    const topics = new Set((await Promise.all(files.map(f => import(`../src/learn/subjects/data/${f}.js`)))).flatMap(m => m.TOPICS || []).map(t => t.slug))
    for (const g of s.gradeList) assert.ok(READINGS.some(r => r.grade === g), `${key}: no passage for grade ${g}`)
    const slugs = new Set()
    for (const r of READINGS) {
      assert.match(r.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, r.slug)
      assert.ok(!slugs.has(r.slug), `duplicate ${r.slug}`); slugs.add(r.slug)
      assert.ok(s.gradeList.includes(r.grade), `${r.slug}: grade ${r.grade}`)
      for (const k of ['title', 'emoji', 'kind']) assert.ok(typeof r[k] === 'string' && r[k].trim(), `${r.slug}.${k}`)
      assert.ok(r.topic === null || topics.has(r.topic), `${r.slug}: unknown topic ${r.topic}`)
      const text = r.text.join(' '), n = words(text), [lo, hi] = WORDS[r.grade]
      assert.ok(n >= lo && n <= hi, `${r.slug}: ${n} words (grade ${r.grade} expects ${lo}–${hi})`)
      assert.ok(r.q.length >= 4 && r.q.length <= 5, `${r.slug}: ${r.q.length} questions`)
      for (const [q, options, ans] of r.q) {
        assert.ok(q.trim() && options.length === 4 && new Set(options).size === 4, `${r.slug}: ${q}`)
        assert.ok(Number.isInteger(ans) && ans >= 0 && ans < 4, `${r.slug}: answer in "${q}"`)
      }
      assert.ok(r.open?.length >= 1 && r.open.every(([q, a]) => q.trim() && a.trim().length > 20), `${r.slug}: open question`)
      assert.ok(Array.isArray(r.words) && r.words.length >= 3 && r.words.length <= 8, `${r.slug}: 3–8 dictionary words`)
      for (const [w, m] of r.words) {
        assert.ok(w.trim() && m.trim(), `${r.slug}: dictionary entry`)
        assert.ok(new RegExp(`(^|[^\\u0590-\\u05FFA-Za-z])[והבלמשכ]{0,2}${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[^\\u0590-\\u05FFA-Za-z]|$)`).test(text), `${r.slug}: "${w}" is not in the text`)
      }
    }
    const pos = READINGS.flatMap(r => r.q.map(x => x[2]))
    for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `${key}: answer position ${p} is rare`)
  })
}

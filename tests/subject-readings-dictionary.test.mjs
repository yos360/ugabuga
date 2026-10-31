// School-subject reading passages carry a small dictionary (words: [[word, meaning]]) shown under the
// passage and printed with it: 3–8 entries, each found in the passage as a whole word (with or without
// a one- or two-letter Hebrew prefix), so LearnPages can mark it in the text.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const SCHOOL = ['civics', 'geography', 'history', 'lashon', 'science', 'tanakh']
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

for (const key of SCHOOL) {
  test(`school readings — ${key}: every passage has a dictionary of words from its text`, async () => {
    const { READINGS } = await import(`../src/learn/subjects/readings/${key}.js`)
    for (const r of READINGS) {
      const text = r.text.join(' ')
      assert.ok(Array.isArray(r.words) && r.words.length >= 3 && r.words.length <= 8, `${r.slug}: 3–8 dictionary words`)
      assert.equal(new Set(r.words.map(([w]) => w)).size, r.words.length, `${r.slug}: duplicate dictionary word`)
      for (const [w, m] of r.words) {
        assert.ok(w.trim() && m.trim(), `${r.slug}: dictionary entry`)
        assert.ok(new RegExp(`(^|[^\\u0590-\\u05FFA-Za-z])[והבלמשכ]{0,2}${escape(w)}(?=[^\\u0590-\\u05FFA-Za-z]|$)`).test(text), `${r.slug}: "${w}" is not in the text`)
      }
    }
  })
}

// Dumps every language-learning word on the site to JSON for verify.py.
// Usage: node scripts/lang-verify/extract.mjs > words.json
import { ENGLISH_TOPICS } from '../../src/data/englishWords.js'
import { ABC_LETTERS } from '../../src/data/content/abcLetters.js'

const rows = []
for (const t of ENGLISH_TOPICS) {
  for (const x of t.words) rows.push({ lang: 'en', source: `english/${t.slug}`, word: x.en, he: x.he, say: x.say, emoji: x.emoji || null, number: !!x.text })
}
for (const L of ABC_LETTERS) {
  for (const x of L.words) rows.push({ lang: 'en', source: `abc/${L.slug}`, word: x.en, he: x.he, say: null, emoji: x.emoji || null })
  rows.push({ lang: 'en', source: `abc/${L.slug}`, kind: 'letter-name', word: L.letter, he: null, say: L.name, emoji: null })
}
process.stdout.write(JSON.stringify(rows, null, 1))

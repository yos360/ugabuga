// Language pages (/languages): every picture has its drawing, every word its pronunciation.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { TOPICS, WORDS } from '../src/data/languages/vocab.js'
import { SAY } from '../src/data/languages/say.generated.js'

const fileOf = e => [...e].map(c => c.codePointAt(0).toString(16)).filter(h => h !== 'fe0f').join('-')

test('every topic picture has its drawing in public/print-art/words', () => {
  for (const t of TOPICS) for (const [key, , pic] of t.items) {
    if (/^\d+$/.test(pic)) continue
    assert.ok(existsSync(new URL(`../public/print-art/words/${fileOf(pic)}.svg`, import.meta.url)), `${t.slug}/${key} ${pic}: missing drawing`)
  }
})

test('every word has a key in the topics and a generated pronunciation', () => {
  const keys = new Set(TOPICS.flatMap(t => t.items.map(([k]) => k)))
  for (const [lang, words] of Object.entries(WORDS)) for (const key of Object.keys(words)) {
    assert.ok(keys.has(key), `${lang}/${key}: no such topic word`)
    assert.ok(SAY[lang]?.[key], `${lang}/${key}: no pronunciation — run scripts/lang-verify/vocab.py --write`)
  }
})

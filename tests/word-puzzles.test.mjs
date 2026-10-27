import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { ENGLISH_TOPICS, emojiFile } from '../src/data/englishWords.js'

// Mirrors the page's rule: one Hebrew word, 2–6 letters, with an emoji.
const TOPICS = ['animals', 'fruits', 'food', 'body', 'family', 'clothes', 'transport', 'home', 'classroom', 'birthday', 'weather']
const usable = w => w.emoji && !/\s/.test(w.he) && [...w.he].length >= 2 && [...w.he].length <= 6

test('every word-puzzle topic has at least 6 words, each with print art on disk', () => {
  for (const slug of TOPICS) {
    const words = ENGLISH_TOPICS.find(t => t.slug === slug).words.filter(usable)
    assert.ok(words.length >= 6, `${slug}: ${words.length} words`)
    for (const w of words) assert.ok(existsSync(new URL(`../public/print-art/words/${emojiFile(w.emoji)}.svg`, import.meta.url)), `${slug}: no art for ${w.he} ${w.emoji}`)
  }
})

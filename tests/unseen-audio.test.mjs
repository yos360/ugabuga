import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, statSync } from 'node:fs'
import { UNSEEN_AUDIO } from '../src/data/unseen/audio.js'

test('every unseen recording in the list exists and is not empty', () => {
  for (const [slug, ids] of Object.entries(UNSEEN_AUDIO)) {
    assert.ok(ids.length > 0, slug)
    for (const id of ids) {
      const file = new URL(`../public/audio/unseen/${id}.mp3`, import.meta.url)
      assert.ok(existsSync(file) && statSync(file).size > 10000, `${slug} ${id}`)
    }
  }
})
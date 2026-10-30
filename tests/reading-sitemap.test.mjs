import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GRADED_READING } from '../src/learn/readingGrades.js'

// Every graded reading passage is listed in the sitemap (so it is indexed and prerendered).
test('every Hebrew reading passage is in sitemap-static.xml', () => {
  const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const missing = GRADED_READING.filter(r => !xml.includes(`/learn/reading/${r.slug}</loc>`)).map(r => r.slug)
  assert.deepEqual(missing, [])
})

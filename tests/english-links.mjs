import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ENGLISH_PAGES, ENGLISH_SECTIONS as original } from '../src/en/englishRoutes.js'
import { ENGLISH_SECTIONS, englishCounterpart } from '../src/en/englishLinks.js'

test('lightweight navigation preserves every English counterpart and section', () => {
  assert.deepEqual(ENGLISH_SECTIONS, original)
  for (const page of ENGLISH_PAGES) if (page.counterpart) {
    assert.equal(englishCounterpart(page.counterpart), ENGLISH_PAGES.find(p => p.counterpart === page.counterpart).path)
  }
  assert.equal(englishCounterpart('/not-a-page'), undefined)
})

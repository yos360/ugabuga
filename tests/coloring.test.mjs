// Every coloring subject has its drawing files, unique slugs, and real alt text
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, statSync } from 'node:fs'
const { COLORING_SUBJECTS } = await import('../src/data/coloringSubjects.js')
test('coloring subjects point to existing SVG and WebP files', () => {
  assert.equal(new Set(COLORING_SUBJECTS.map(s => s.slug)).size, COLORING_SUBJECTS.length)
  for (const s of COLORING_SUBJECTS) {
    assert.ok(s.items.length >= 3, s.slug)
    s.items.forEach((alt, i) => {
      for (const ext of ['svg', 'webp']) {
        const f = new URL(`../public/coloring/${s.slug}/${s.slug}-${i + 1}.${ext}`, import.meta.url)
        assert.ok(existsSync(f) && statSync(f).size > 1000, `${s.slug}-${i + 1}.${ext}`)
      }
      assert.ok(alt.length > 3, s.slug)
    })
  }
})

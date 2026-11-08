// IndexNow sends Bing only what Google gets: no held-back template pages and no noindex pages.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { submittable } from '../scripts/indexnow-submit.mjs'
import { NOINDEX_PATHS } from '../scripts/noindex-paths.mjs'

test('held-back and noindex pages are not submitted to IndexNow', () => {
  const noindex = [...NOINDEX_PATHS][0]
  assert.ok(!submittable(`https://ugabuga.co.il${noindex}`), noindex)
  assert.ok(!submittable('https://ugabuga.co.il/baby-names/name/noam'))
  assert.ok(submittable('https://ugabuga.co.il/tools/dice'))
  assert.ok(submittable('https://ugabuga.co.il/'))
  assert.ok(!submittable('not a url'))
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import PREVIEWS from '../src/data/printPreviews.js'
import PATHS from '../src/data/printPreviewPaths.js'

test('the preview page list matches the preview alt texts', () => {
  assert.deepEqual([...PATHS].sort(), Object.keys(PREVIEWS).sort())
})

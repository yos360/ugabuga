import test from 'node:test'
import assert from 'node:assert/strict'
import { countPath, printLabel } from '../src/utils/printCounts.js'

test('page paths match the analytics log format', () => {
  assert.equal(countPath('/Printables/Mazes/?x=1'), '/printables/mazes')
  assert.equal(countPath('/'), '/')
})
test('the badge appears only for popular pages', () => {
  assert.equal(printLabel(7), '')
  assert.equal(printLabel(undefined), '')
  assert.match(printLabel(1245), /^הודפס 1,245 פעמים$/)
})

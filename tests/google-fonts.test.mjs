import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GOOGLE_FONTS, googleFont, fontStack, fontHref } from '../src/office/fonts/googleFonts.js'
import { sanitizeState } from '../src/office/resume/resumeLogic.js'

test('google fonts: unique safe ids, mostly Hebrew', () => {
  const ids = GOOGLE_FONTS.map(f => f.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const f of GOOGLE_FONTS) {
    assert.match(f.id, /^[a-z0-9-]{1,40}$/)
    assert.ok(['sans', 'serif', 'display', 'hand'].includes(f.kind), f.id)
    assert.match(f.family, /^[A-Za-z ]+$/)
  }
  assert.ok(GOOGLE_FONTS.filter(f => f.he).length >= 15)
})

test('fontStack / fontHref', () => {
  assert.equal(fontStack('nope'), '')
  assert.match(fontStack('rubik'), /^'Rubik', /)
  assert.equal(googleFont('rubik').family, 'Rubik')
  assert.match(fontHref(googleFont('open-sans')), /family=Open\+Sans:wght@/)
})

test('resume state keeps a valid font and drops a bad one', () => {
  assert.equal(sanitizeState({ design: { font: 'rubik' } }).design.font, 'rubik')
  assert.equal(sanitizeState({ design: { font: 'x"; url(evil)' } }).design.font, '')
  assert.equal(sanitizeState({}).design.font, '')
})

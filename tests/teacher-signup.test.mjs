import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidEmail, isToken, CONSENT_TEXT } from '../src/utils/teacherSignup.js'

test('email validation', () => {
  for (const ok of ['a@b.co', 'teacher.name+x@school.org.il']) assert.equal(isValidEmail(ok), true, ok)
  for (const bad of ['', 'a@b', 'a b@c.com', '@x.com', 'a@@x.com', 'x'.repeat(130) + '@a.com', null]) assert.equal(isValidEmail(bad), false, String(bad))
})
test('unsubscribe token must be a uuid', () => {
  assert.equal(isToken('123e4567-e89b-12d3-a456-426614174000'), true)
  for (const bad of ['', 'abc', "1' or 1=1", null]) assert.equal(isToken(bad), false)
})
test('consent text names purpose and removal', () => {
  assert.match(CONSENT_TEXT, /עדכונים במייל/)
  assert.match(CONSENT_TEXT, /להסיר/)
})

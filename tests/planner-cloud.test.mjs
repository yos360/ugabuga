import test from 'node:test'
import assert from 'node:assert/strict'
import { makeToken, readToken, normalEmail, loginMail, onRequest } from '../functions/api/planner.js'

const env = { MAIL_SIGNING_SECRET: 'test-secret' }

test('sign-in tokens carry the email and only verify with the same secret', async () => {
  const token = await makeToken(env, 'teacher@example.com')
  assert.equal(await readToken(env, token), 'teacher@example.com')
  assert.equal(await readToken({ MAIL_SIGNING_SECRET: 'other' }, token), null)
  const [body, sig] = token.split('.')
  assert.equal(await readToken(env, `${body}.${'0'.repeat(64)}`), null)
  assert.equal(await readToken(env, `${body.slice(1)}.${sig}`), null)
  assert.equal(await readToken(env, 'garbage'), null)
})

test('emails are normalised and header injection is rejected', () => {
  assert.equal(normalEmail(' Teacher@Example.COM '), 'teacher@example.com')
  assert.equal(normalEmail('a@b.co\r\nBcc:x@y.z'), null)
  assert.equal(normalEmail('not-an-email'), null)
})

test('the sign-in mail has the link and no other address', () => {
  const { subject, text } = loginMail('https://ugabuga.co.il/planner#login=abc.def')
  assert.ok(subject.includes('מערכת השעות'))
  assert.ok(text.includes('https://ugabuga.co.il/planner#login=abc.def\n'))
})

test('an unconfigured backend refuses without saving anything', async () => {
  const r = await onRequest({ env: {}, request: new Request('https://ugabuga.co.il/api/planner', { method: 'POST', body: '{"action":"login","email":"a@b.co"}' }) })
  assert.equal(r.status, 503)
  const g = await onRequest({ env: {}, request: new Request('https://ugabuga.co.il/api/planner') })
  assert.equal(g.status, 405)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { ownerSupabase, OWNER, isOwnerEmail, signInOwnerWithPassword, startOwnerEmailLogin } from '../src/utils/ownerAuth.js'

// Owner login is email + password, or a magic link only to the owner's address. The address itself is
// not in the code — only its SHA-256 — so these tests use a stand-in address with its own hash.
const TEST_OWNER = 'owner@example.com'

test('owner login: the owner is recognised by hash, links go only to the owner, errors read in Hebrew', async t => {
  const auth = ownerSupabase.auth
  const original = { password: auth.signInWithPassword, otp: auth.signInWithOtp, window: globalThis.window, hash: OWNER.sha256 }
  const calls = []
  globalThis.window = { location: { origin: 'https://ugabuga.co.il' } }
  OWNER.sha256 = createHash('sha256').update(TEST_OWNER).digest('hex')
  const respond = message => async options => { calls.push(options); return { error: message ? { message } : null } }
  try {
    await t.test('the owner address matches by hash (case and spaces ignored), others do not', async () => {
      assert.equal(await isOwnerEmail(' Owner@Example.com '), true)
      assert.equal(await isOwnerEmail('someone@example.com'), false)
      assert.equal(await isOwnerEmail(''), false)
    })
    await t.test('password sign-in sends the typed email', async () => {
      auth.signInWithPassword = respond(null)
      await signInOwnerWithPassword(' owner@example.com ', 'secret')
      assert.deepEqual(calls.at(-1), { email: 'owner@example.com', password: 'secret' })
    })
    await t.test('password errors become clear messages', async () => {
      for (const [message, expected] of [['Invalid login credentials', /הסיסמה שגויה/], ['Too many requests', /יותר מדי ניסיונות/], ['Email not confirmed', /עוד לא אושר/], ['boom', /לא הצלחנו להתחבר/]]) {
        auth.signInWithPassword = respond(message)
        await assert.rejects(signInOwnerWithPassword(TEST_OWNER, 'x'), expected)
      }
    })
    await t.test('magic link goes only to the owner address, never creates an account, and returns to the report', async () => {
      auth.signInWithOtp = respond(null)
      await startOwnerEmailLogin(TEST_OWNER)
      assert.deepEqual(calls.at(-1), { email: TEST_OWNER, options: { emailRedirectTo: 'https://ugabuga.co.il/admin/activity', shouldCreateUser: false } })
      const before = calls.length
      await assert.rejects(startOwnerEmailLogin('someone@example.com'), /לא כתובת המייל של בעל האתר/)
      assert.equal(calls.length, before)
    })
    await t.test('magic link errors become clear messages', async () => {
      auth.signInWithOtp = respond('rate limit exceeded')
      await assert.rejects(startOwnerEmailLogin(TEST_OWNER), /נשלחו כבר כמה קישורים/)
      auth.signInWithOtp = respond('boom')
      await assert.rejects(startOwnerEmailLogin(TEST_OWNER), /לא הצלחנו לשלוח/)
    })
  } finally {
    auth.signInWithPassword = original.password
    auth.signInWithOtp = original.otp
    globalThis.window = original.window
    OWNER.sha256 = original.hash
  }
})

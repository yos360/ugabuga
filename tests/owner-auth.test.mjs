import test from 'node:test'
import assert from 'node:assert/strict'
import { ownerSupabase, OWNER_EMAIL, signInOwnerWithPassword, startOwnerEmailLogin } from '../src/utils/ownerAuth.js'

// Owner login is password + magic link to the one fixed owner address (no Google sign-in).
test('owner login signs in only the owner address and maps errors to Hebrew messages', async t => {
  const auth = ownerSupabase.auth
  const original = { password: auth.signInWithPassword, otp: auth.signInWithOtp, window: globalThis.window }
  const calls = []
  globalThis.window = { location: { origin: 'https://ugabuga.co.il' } }
  const respond = message => async options => { calls.push(options); return { error: message ? { message } : null } }
  try {
    await t.test('password sign-in uses the fixed owner email', async () => {
      auth.signInWithPassword = respond(null)
      await signInOwnerWithPassword('secret')
      assert.deepEqual(calls.at(-1), { email: OWNER_EMAIL, password: 'secret' })
    })
    await t.test('password errors become clear messages', async () => {
      for (const [message, expected] of [['Invalid login credentials', /הסיסמה שגויה/], ['Too many requests', /יותר מדי ניסיונות/], ['Email not confirmed', /עוד לא אושר/], ['boom', /לא הצלחנו להתחבר/]]) {
        auth.signInWithPassword = respond(message)
        await assert.rejects(signInOwnerWithPassword('x'), expected)
      }
    })
    await t.test('magic link goes to the owner address and back to the report', async () => {
      auth.signInWithOtp = respond(null)
      await startOwnerEmailLogin()
      assert.deepEqual(calls.at(-1), { email: OWNER_EMAIL, options: { emailRedirectTo: 'https://ugabuga.co.il/admin/activity' } })
    })
    await t.test('magic link errors become clear messages', async () => {
      auth.signInWithOtp = respond('rate limit exceeded')
      await assert.rejects(startOwnerEmailLogin(), /נשלחו כבר כמה קישורים/)
      auth.signInWithOtp = respond('boom')
      await assert.rejects(startOwnerEmailLogin(), /לא הצלחנו לשלוח/)
    })
  } finally {
    auth.signInWithPassword = original.password
    auth.signInWithOtp = original.otp
    globalThis.window = original.window
  }
})

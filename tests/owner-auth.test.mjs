import test from 'node:test'
import assert from 'node:assert/strict'
import { ownerSupabase, OWNER_EMAIL, startOwnerGoogleLogin } from '../src/utils/ownerAuth.js'

test('owner Google login handles configuration, errors and the exact callback', async t => {
  const originalFetch = globalThis.fetch
  const originalWindow = globalThis.window
  const originalOAuth = ownerSupabase.auth.signInWithOAuth
  let calls = []
  globalThis.window = { location: { origin: 'https://ugabuga.co.il' } }
  ownerSupabase.auth.signInWithOAuth = async options => {
    calls.push(options)
    return { error: null }
  }
  try {
    await t.test('disabled Google stays on the login page', async () => {
      globalThis.fetch = async () => ({ ok: true, json: async () => ({ external: { google: false } }) })
      await assert.rejects(startOwnerGoogleLogin, /ממתין להשלמת/)
      assert.equal(calls.length, 0)
    })
    await t.test('failed settings lookup does not redirect', async () => {
      globalThis.fetch = async () => ({ ok: false })
      await assert.rejects(startOwnerGoogleLogin, /לא הצלחנו/)
      assert.equal(calls.length, 0)
    })
    await t.test('network failure can be retried', async () => {
      globalThis.fetch = async () => { throw new TypeError('Offline') }
      await assert.rejects(startOwnerGoogleLogin, TypeError)
      assert.equal(calls.length, 0)
    })
    await t.test('Google receives only the owner hint and fixed report callback', async () => {
      globalThis.fetch = async (url, options) => {
        assert.equal(url, 'https://efhgyispuwxcplvzipcy.supabase.co/auth/v1/settings')
        assert.ok(options.headers.apikey.startsWith('sb_publishable_'))
        assert.ok(options.signal instanceof AbortSignal)
        return { ok: true, json: async () => ({ external: { google: true } }) }
      }
      await startOwnerGoogleLogin()
      assert.deepEqual(calls, [{
        provider: 'google',
        options: {
          redirectTo: 'https://ugabuga.co.il/admin/activity',
          queryParams: { login_hint: OWNER_EMAIL, prompt: 'select_account' },
        },
      }])
    })
    await t.test('OAuth errors become a clear Hebrew message', async () => {
      ownerSupabase.auth.signInWithOAuth = async () => ({ error: new Error('internal details') })
      await assert.rejects(startOwnerGoogleLogin, /לא הצלחנו לפתוח/)
    })
  } finally {
    globalThis.fetch = originalFetch
    if (originalWindow === undefined) delete globalThis.window
    else globalThis.window = originalWindow
    ownerSupabase.auth.signInWithOAuth = originalOAuth
  }
})

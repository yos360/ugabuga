import test from 'node:test'
import assert from 'node:assert/strict'
import { generateKeyPairSync, createVerify } from 'node:crypto'
import { serviceJwt, windows, opportunities, compare } from '../scripts/search-console.mjs'

test('the service-account token request is a valid signed JWT', () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const jwt = serviceJwt({ client_email: 'x@y.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) }, 1000)
  const [h, c, s] = jwt.split('.')
  assert.ok(createVerify('RSA-SHA256').update(`${h}.${c}`).verify(publicKey, s, 'base64url'))
  const claim = JSON.parse(Buffer.from(c, 'base64url'))
  assert.equal(claim.scope, 'https://www.googleapis.com/auth/webmasters.readonly')
  assert.equal(claim.exp - claim.iat, 3600)
})
test('date windows end 3 days ago and do not overlap', () => {
  const w = windows(new Date('2026-10-28T12:00:00Z'))
  assert.deepEqual(w.cur, ['2026-09-28', '2026-10-25'])
  assert.deepEqual(w.prev, ['2026-08-31', '2026-09-27'])
})
test('opportunities are page 1–2 queries with demand; compare shows the move', () => {
  const rows = [{ keys: ['a'], impressions: 50, position: 8 }, { keys: ['b'], impressions: 5, position: 8 }, { keys: ['c'], impressions: 90, position: 2 }, { keys: ['d'], impressions: 30, position: 12 }]
  assert.deepEqual(opportunities(rows).map(r => r.keys[0]), ['a', 'd'])
  const c = compare([{ keys: ['a'], position: 6, clicks: 3 }, { keys: ['z'], position: 9, clicks: 1 }], [{ keys: ['a'], position: 10, clicks: 1 }])
  assert.equal(c[0].move, -4)
  assert.equal(c[1].move, null)
})

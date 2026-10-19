import test from 'node:test'
import assert from 'node:assert/strict'
import { supplierContent, supplierShell } from '../server/supplier-shell.js'
import { dailyText, dailyShell } from '../server/daily-shell.js'

test('supplier HTML treats public profile fields as text, never executable markup', () => {
  const result = supplierContent({ name: '<img src=x onerror=alert(1)>', about: '</p><script>bad()</script>', tagline: '" & <', slug: 'sample' }, '/suppliers/sample')
  assert.doesNotMatch(result.body, /<script>|<img/)
  assert.match(result.body, /&lt;script&gt;/)
  assert.match(result.head, /https:\/\/ugabuga.co.il\/suppliers\/sample/)
})

test('supplier endpoint uses read-only GET and never caches withdrawn cards or failures', async t => {
  const previous = globalThis.HTMLRewriter
  globalThis.HTMLRewriter = class { on() { return this } transform(response) { return response } }
  t.after(() => { globalThis.HTMLRewriter = previous })
  const cases = [
    [{ name: 'ספק בדיקה', slug: 'sample' }, 200],
    [null, 404],
    [{ name: 'ספק אחר', slug: 'other' }, 503],
    ['failure', 503],
  ]
  for (const [data, expected] of cases) {
    let calls = 0
    const response = await supplierShell(new Response('<html></html>'), new URL('https://ugabuga.co.il/suppliers/sample'), {}, async (url, init) => {
      calls++
      assert.equal(init.method, 'GET')
      assert.equal(url.pathname, '/rest/v1/rpc/supplier_public_get')
      assert.equal(url.searchParams.get('p_slug'), 'sample')
      assert.equal(init.cache, 'no-store')
      if (data === 'failure') throw new Error('Offline')
      return Response.json(data)
    })
    assert.equal(calls, 1)
    assert.equal(response.status, expected)
    assert.equal(response.headers.get('Cache-Control'), 'no-store')
    if (expected !== 200) assert.equal(response.headers.get('X-Robots-Tag'), 'noindex')
  }
})

test('daily static HTML is refreshed across Israeli midnight without a rebuild', t => {
  const previous = globalThis.HTMLRewriter
  let replacements = {}
  globalThis.HTMLRewriter = class {
    on(selector, handler) { handler.element({ setInnerContent: text => { replacements[selector] = text } }); return this }
    transform(response) { return response }
  }
  t.after(() => { globalThis.HTMLRewriter = previous })
  const before = Date.parse('2026-10-18T20:59:59Z'), after = Date.parse('2026-10-18T21:00:01Z')
  assert.equal(dailyText(before).daily.slug, 'sliding-puzzle')
  assert.equal(dailyText(after).daily.slug, 'whack-a-mole')
  for (const now of [before, after]) {
    replacements = {}
    const res = dailyShell(new Response('snapshot', { headers: { ETag: 'old' } }), '/online-games/today', now)
    assert.equal(res.headers.get('Cache-Control'), 'no-store')
    assert.equal(res.headers.get('ETag'), null)
    assert.equal(replacements['.dl-game'], dailyText(now).daily.name)
    assert.equal(replacements['.dl-goal'], dailyText(now).daily.goal)
    assert.equal(Object.keys(replacements).filter(k => k.startsWith('.dl-week')).length, 7)
    dailyShell(new Response('snapshot'), '/online-games', now)
    assert.ok(replacements['a[href="/online-games/today"] b'].includes(dailyText(now).daily.name))
  }
})

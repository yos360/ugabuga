import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { SPONSORS, sponsorForPath, matchesPlacement } from '../src/data/sponsors.js'

test('every sponsor entry has the expected shape', () => {
  const ids = new Set()
  for (const s of SPONSORS) {
    for (const key of ['id', 'name', 'title', 'text', 'cta', 'url']) assert.equal(typeof s[key], 'string', `${s.id}.${key}`)
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`); ids.add(s.id)
    assert.equal(typeof s.active, 'boolean', `${s.id}.active`)
    if (s.image) {
      assert.match(s.image.src, /^\/sponsors\//, `${s.id}.image.src`)
      assert.ok(existsSync(new URL(`../public${s.image.src}`, import.meta.url)), `${s.id} image file exists`)
      assert.ok(s.image.width > 0 && s.image.height > 0 && s.image.alt, `${s.id}.image size and alt`)
    }
    assert.ok(Array.isArray(s.placements) && s.placements.length, `${s.id}.placements`)
    for (const p of s.placements) assert.match(p, /^\//, `${s.id} placement ${p}`)
    assert.ok(!s.placements.some(p => /^\/kids(\/|$)/.test(p)), `${s.id} must not target the kids zone`)
  }
})

test('every active sponsor links over https and carries an ad label', () => {
  for (const s of SPONSORS.filter(x => x.active)) {
    assert.equal(new URL(s.url).protocol, 'https:', s.id)
    assert.match(s.label || '', /פרסומת|בשיתוף/, `${s.id} must be marked as an ad`)
  }
})

test('placements match by path prefix; "/" is the home page only', () => {
  assert.ok(matchesPlacement('/', '/'))
  assert.ok(!matchesPlacement('/', '/games'))
  assert.ok(matchesPlacement('/speech', '/speech/sounds/r'))
  assert.ok(matchesPlacement('/speech', '/speech/'))
  assert.ok(!matchesPlacement('/speech', '/speechless'))
  assert.equal(sponsorForPath('/speech/sounds/r')?.id, 'eureka')
  assert.equal(sponsorForPath('/games/birthday'), null)
  assert.equal(sponsorForPath('/speech', [{ ...SPONSORS[0], active: false }]), null)
})

test('the Eureka entry keeps the exact series URL', () => {
  const e = SPONSORS.find(s => s.id === 'eureka')
  assert.equal(e.url, 'https://eureka2010.co.il/catalog.asp?Action=Search&SW=%D7%97%D7%9B%D7%9D%20%D7%A2%D7%9C%20%D7%A7%D7%98%D7%A0%D7%99%D7%9D')
})

test('sponsor clicks go to the owner log under a valid category, read by an owner-only RPC', async () => {
  const { sponsorCategory } = await import('../src/utils/liveActivity.js')
  for (const s of SPONSORS) {
    const c = sponsorCategory(s.id)
    assert.match(c, /^sponsor:[a-z0-9_-]+$/)
    assert.ok(c.length <= 60, 'record_site_event_v3 drops categories over 60 characters')
  }
  assert.equal(sponsorCategory('Eu reka!'), 'sponsor:eureka')
  assert.equal(sponsorCategory(''), null)
  const sql = readFileSync(new URL('../supabase/migrations/202610240002_owner_sponsor_clicks.sql', import.meta.url), 'utf8')
  assert.match(sql, /security definer set search_path = ''/)
  assert.match(sql, /raise exception 'not_owner'/)
  assert.match(sql, /revoke all on function public\.owner_sponsor_clicks\(timestamptz, timestamptz\) from public, anon, authenticated/)
  assert.match(sql, /action = 'use' and category like 'sponsor:%'/)
})

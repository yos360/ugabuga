// Every function the analytics RPC calls must be created by a migration that ran — the 19.10 bug was a
// call to site_event_allowed(), defined only in a migration that never reached the live database.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

test('record_site_event_v3 dependencies are created by a later-or-equal migration', () => {
  const dir = new URL('../supabase/migrations/', import.meta.url)
  const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort()
  const latestV3 = files.filter(f => /create or replace function public\.record_site_event_v3/.test(readFileSync(new URL(f, dir), 'utf8'))).at(-1)
  const definers = files.filter(f => /create or replace function public\.site_event_allowed/.test(readFileSync(new URL(f, dir), 'utf8')))
  assert.ok(definers.some(f => f >= latestV3), `site_event_allowed must be (re)created in or after ${latestV3}`)
})

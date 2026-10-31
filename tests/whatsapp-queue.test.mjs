import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const sql = readFileSync(new URL('../supabase/migrations/20261031150000_page_request_whatsapp_queue.sql', import.meta.url), 'utf8')

test('WhatsApp channel queue is owner-only, live pages only, spaced and in daytime', () => {
  assert.match(sql, /auth\.jwt\(\) ->> 'email'/)
  assert.match(sql, /grant execute on function public\.page_request_whatsapp_owner\(text, bigint\) to authenticated;/)
  assert.doesNotMatch(sql, /to anon/)
  assert.match(sql, /live_at is not null and whatsapp_at is null/)
  assert.match(sql, /interval '30 minutes'/)
  assert.match(sql, /hour_il < 8 or hour_il >= 21/)
  assert.match(sql, /add column if not exists whatsapp_at/)
})

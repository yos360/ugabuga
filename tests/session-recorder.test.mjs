import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { recordingDecision, recordablePath, maskTyped, chunkPath, SAMPLE_RATE } from '../src/utils/sessionRecorder.js'
import { packEvents, unpackEvents, unpackSession } from '../src/utils/recordingCodec.js'

const base = { path: '/online-games/solitaire', random: 0, ownerDevice: false, webdriver: false, privacySignal: false, force: false }

test('only a sampled share of ordinary visits is recorded', () => {
  assert.equal(recordingDecision(base), true)
  assert.equal(recordingDecision({ ...base, random: SAMPLE_RATE }), false)
  assert.equal(recordingDecision({ ...base, ownerDevice: true }), false)
  assert.equal(recordingDecision({ ...base, privacySignal: true }), false)
  assert.equal(recordingDecision({ ...base, webdriver: true, force: true }), false, 'never inside the prerender browser')
  assert.equal(recordingDecision({ ...base, random: 0.99, ownerDevice: true, force: true }), true, '?rec=1 lets the owner test')
})

test('pages that show other people\'s names are never recorded', () => {
  for (const path of ['/admin/recordings', '/live', '/live/ABCD/host', '/play/ABCD', '/en/play/X', '/q/x1', '/hw/abc',
    '/teachers/homework/abc', '/classroom/quiz/abc', '/meet', '/party-album', '/g/x', '/__test/admin-suppliers']) {
    assert.equal(recordablePath(path), false, path)
    assert.equal(recordingDecision({ ...base, path, force: true }), false, path)
  }
  for (const path of ['/', '/learn/space', '/tools/eretz-ir', '/printables', '/games/quiz-x', '/liveable']) assert.equal(recordablePath(path), true, path)
})

test('anything the visitor typed is starred out wherever it appears', () => {
  const typed = new Set(['נועה', 'Cohen'])
  assert.equal(maskTyped('דף עבודה של נועה Cohen', typed), 'דף עבודה של **** *****')
  assert.equal(maskTyped('בלי שמות', typed), 'בלי שמות')
})

test('chunk paths stay within what the database accepts', () => {
  assert.equal(chunkPath('/learn/space'), '/learn/space')
  assert.equal(chunkPath('/%D7%90'), '/%D7%90')
  assert.equal(chunkPath('/bad path?x=1'), '/')
})

test('chunks survive the gzip + base64 round trip and reassemble in time order', async () => {
  const a = [{ type: 4, timestamp: 1 }, { type: 2, timestamp: 2, data: { text: 'שלום'.repeat(500) } }]
  const b = [{ type: 3, timestamp: 3 }]
  const packed = await packEvents(a)
  assert.ok(packed.length < JSON.stringify(a).length / 3)
  assert.deepEqual(await unpackEvents(packed), a)
  assert.deepEqual((await unpackSession([await packEvents(b), packed, 'not-base64!'])).map(e => e.timestamp), [1, 2, 3])
})

test('the database keeps recordings bounded and owner-only', () => {
  const sql = readFileSync(new URL('../supabase/migrations/20261031090000_session_recordings.sql', import.meta.url), 'utf8')
  assert.match(sql, /interval '30 days'/)
  assert.match(sql, /limit 150\) q\) >= 150/)
  assert.match(sql, /sum\(bytes\)/)
  assert.match(sql, /revoke all on table public\.session_recordings from anon, authenticated/)
  assert.match(sql, /grant execute on function public\.session_recordings_owner\(timestamptz,timestamptz\) to authenticated;/)
  assert.doesNotMatch(sql, /session_recordings_owner[^;]*to anon/)
})

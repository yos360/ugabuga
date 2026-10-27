import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { migrationSql } from '../scripts/requests-inbox.mjs'

test('request migrations only move requests forward and escape titles', () => {
  const sql = migrationSql({ done: [{ id: 7, title: "דפי צביעה של כלב'ים", path: '/printables/coloring/seal' }], planned: [5], declined: [9] })
  assert.match(sql, /public_title = 'דפי צביעה של כלב''ים'/)
  assert.match(sql, /where id = 7 and status in \('new', 'planned'\)/)
  assert.match(sql, /status = 'declined' where id in \(9\)/)
  assert.match(sql, /status = 'planned' where id in \(5\) and status = 'new'/)
  assert.throws(() => migrationSql({ done: [{ id: 1, title: 'x', path: 'https://evil.example' }] }))
  assert.throws(() => migrationSql({ declined: ['1; drop table x'] }))
})

test('the inbox workflow prints only ciphertext and a count', () => {
  const wf = readFileSync(new URL('../.github/workflows/requests-inbox.yml', import.meta.url), 'utf8')
  assert.match(wf, /branches: \['requests-inbox-\*'\]/)
  assert.match(wf, /rm -f rows\.json inbox\.json/)
  for (const line of wf.split('\n').filter(l => l.includes('::notice'))) assert.match(line, /inbox-(count|key|data-\$n|parts)::/)
  assert.doesNotMatch(wf, /cat inbox\.json|echo .*\$\(jq .*request/)
  assert.doesNotMatch(wf.split('select id')[1].split('from public')[0], /email/, 'the inbox never reads visitors\' emails')
})

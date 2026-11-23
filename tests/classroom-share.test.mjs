import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { classroomShareUrl } from '../src/utils/share.js'

test('Classroom share link points to classroom.google.com/share with a tagged page link', () => {
  const url = new URL(classroomShareUrl('/booklets/hanukkah-grade-9?x=1', 'חוברת חנוכה'))
  assert.equal(url.origin + url.pathname, 'https://classroom.google.com/share')
  const page = new URL(url.searchParams.get('url'))
  assert.equal(page.href, 'https://ugabuga.co.il/booklets/hanukkah-grade-9?utm_source=google_classroom&utm_medium=share&utm_campaign=classroom')
  assert.equal(url.searchParams.get('title'), 'חוברת חנוכה')
})

test('visits from Classroom are their own source, not Google search', () => {
  const src = readFileSync(new URL('../src/utils/liveActivity.js', import.meta.url), 'utf8')
  const classroom = src.indexOf("return 'classroom'"), google = src.indexOf("return 'google'")
  assert.ok(classroom > 0 && classroom < google, 'classroom must be checked before google')
  const sql = readFileSync(new URL('../supabase/migrations/20261123210001_classroom_site_event.sql', import.meta.url), 'utf8')
  assert.match(sql, /'other','classroom'\)\) then p_source := null|'other','classroom'\) then p_source := null/)
  assert.match(sql, /'native_done','classroom'\)/)
})

test('the Classroom migrations have balanced $$ function bodies', () => {
  for (const f of ['20261123210001_classroom_site_event.sql', '20261123210002_classroom_report.sql']) {
    const sql = readFileSync(new URL(`../supabase/migrations/${f}`, import.meta.url), 'utf8')
    assert.equal((sql.match(/\$\$/g) || []).length % 2, 0, f)
    assert.doesNotMatch(sql, /(^|[^$])\$;/m, f)
    for (const body of sql.split('$$').filter((_, i) => i % 2 === 1)) {
      assert.equal((body.match(/\(/g) || []).length, (body.match(/\)/g) || []).length, `${f}: unbalanced parentheses`)
    }
  }
})

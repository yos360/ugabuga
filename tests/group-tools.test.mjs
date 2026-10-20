// Group tools (RSVP, גמד וענק, קיר ברכות): the draw, RSVP totals and input validation.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  drawPairs, isValidDraw, canDraw, parseNames, validateDrawNames, validateRsvpAnswer, validateWallNote,
  rsvpTotals, missingInvitees, rsvpReminderText, rsvpInviteText, cleanText, hasLink, formatDate, bookletPages, heList, STICKERS,
} from '../src/utils/groupTools.js'

// Small seeded PRNG so failures are reproducible.
const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32 }

test('draw: nobody gets themselves, everyone gets exactly one, for 3..60 names', () => {
  for (let n = 3; n <= 60; n++) {
    for (let s = 0; s < 25; s++) {
      const t = drawPairs(n, [], rng(n * 1000 + s))
      assert.ok(t, `n=${n}`)
      assert.ok(isValidDraw(t), `n=${n} seed=${s}: ${t}`)
      assert.equal(new Set(t).size, n)
    }
  }
})

test('draw: exclusions (siblings) are never paired, in either direction', () => {
  for (let n = 4; n <= 60; n++) {
    // pair up neighbours 0-1, 2-3, ... plus one long-range exclusion
    const ex = []
    for (let i = 0; i + 1 < n; i += 2) ex.push([i, i + 1])
    ex.push([0, n - 1])
    for (let s = 0; s < 10; s++) {
      const t = drawPairs(n, ex, rng(n * 7 + s))
      assert.ok(t, `n=${n} should be drawable`)
      assert.ok(isValidDraw(t, ex), `n=${n}`)
      for (const [a, b] of ex) { assert.notEqual(t[a], b); assert.notEqual(t[b], a) }
    }
  }
})

test('draw: prefers one big circle (no A↔B swaps) when there are no exclusions', () => {
  for (let n = 3; n <= 40; n++) {
    const t = drawPairs(n, [], rng(n))
    let seen = 0, at = 0
    do { at = t[at]; seen++ } while (at !== 0 && seen <= n)
    assert.equal(seen, n, `n=${n} is a single cycle`)
  }
})

test('draw: impossible exclusions are detected, never a bad draw', () => {
  // 3 people, A and B excluded: both must give to C → impossible.
  assert.equal(canDraw(3, [[0, 1]]), false)
  assert.equal(drawPairs(3, [[0, 1]], rng(1)), null)
  // Person 0 excluded from everyone else.
  const ex = [[0, 1], [0, 2], [0, 3], [0, 4]]
  assert.equal(canDraw(5, ex), false)
  assert.equal(drawPairs(5, ex, rng(2)), null)
  // Heavy but possible: a 6-person set where each can only give to one other — still found by search.
  const heavy = []
  for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) if (!((b === (a + 1) % 6) || (a === (b + 1) % 6))) heavy.push([a, b])
  assert.equal(canDraw(6, heavy), true)
  const t = drawPairs(6, heavy, rng(3))
  assert.ok(t && isValidDraw(t, heavy))
  // Invalid exclusion entries are ignored.
  assert.ok(isValidDraw(drawPairs(4, [[0, 0], [9, 1], ['x', 2]], rng(4)), []))
})

test('names: parsing and validation', () => {
  assert.deepEqual(parseNames('נועה\n יואב \n\nנועה\n1. אורי, מיכל'), ['נועה', 'יואב', 'אורי', 'מיכל'])
  assert.equal(parseNames(Array.from({ length: 80 }, (_, i) => `ילד ${i}`).join('\n')).length, 61)
  assert.equal(validateDrawNames(['א', 'ב']).ok, false)
  assert.equal(validateDrawNames(['א', 'ב', 'ג']).ok, true)
  assert.equal(validateDrawNames(Array.from({ length: 61 }, (_, i) => `n${i}`)).ok, false)
  assert.equal(validateDrawNames(['נועה', 'יואב', 'www.spam.com']).ok, false)
  assert.equal(cleanText('  שלום\u0007   עולם  ', 30), 'שלום עולם')
  assert.equal(cleanText('א\n\n\n\nב', 30, true), 'א\n\nב')
  assert.equal(cleanText('x'.repeat(50), 30).length, 30)
  assert.equal(hasLink('בקרו ב-https://x.y'), true)
  assert.equal(hasLink('example.co.il'), true)
  assert.equal(hasLink('תודה רבה! נתראה ב-17.00'), false)
})

test('rsvp: answer validation', () => {
  assert.equal(validateRsvpAnswer({ name: 'דני', status: 'yes', kids: 1, adults: 0 }).ok, true)
  assert.equal(validateRsvpAnswer({ name: '', status: 'yes', kids: 1 }).ok, false)
  assert.equal(validateRsvpAnswer({ name: 'דני', status: 'sure', kids: 1 }).ok, false)
  assert.equal(validateRsvpAnswer({ name: 'דני', status: 'yes', kids: 0, adults: 0 }).ok, false)
  assert.equal(validateRsvpAnswer({ name: 'דני', status: 'no', kids: 0, adults: 0 }).ok, true)
  assert.equal(validateRsvpAnswer({ name: 'דני', status: 'yes', kids: 21 }).ok, false)
  assert.equal(validateRsvpAnswer({ name: 'דני', status: 'yes', kids: 1.5 }).ok, false)
  assert.equal(validateRsvpAnswer({ name: 'דני', status: 'yes', kids: 1, note: 'http://x.com' }).ok, false)
})

test('rsvp: totals count only "yes" people, track maybe separately, collect allergies', () => {
  const t = rsvpTotals([
    { name: 'דני', status: 'yes', kids: 2, adults: 1, allergies: 'בוטנים' },
    { name: 'יעל', status: 'yes', kids: 1, adults: 0 },
    { name: 'רון', status: 'maybe', kids: 1, adults: 1, allergies: 'גלוטן' },
    { name: 'גיל', status: 'no', kids: 3, adults: 2, allergies: 'חלב' },
    { name: 'שגוי', status: 'whatever', kids: 9 },
    null,
  ])
  assert.deepEqual({ yes: t.yes, no: t.no, maybe: t.maybe, answered: t.answered, kids: t.kids, adults: t.adults, people: t.people, maybeKids: t.maybeKids, maybeAdults: t.maybeAdults },
    { yes: 2, no: 1, maybe: 1, answered: 4, kids: 3, adults: 1, people: 4, maybeKids: 1, maybeAdults: 1 })
  assert.deepEqual(t.allergies.map(a => a.name), ['דני', 'רון'])
  assert.equal(rsvpTotals([]).people, 0)
})

test('rsvp: who has not answered yet', () => {
  const invitees = ['נועה', 'יואב', 'אורי', 'מיכל']
  const answers = [{ name: 'נועה' }, { name: 'יואב כהן' }, { name: 'משפחת לוי' }]
  assert.deepEqual(missingInvitees(invitees, answers), ['אורי', 'מיכל'])
  assert.deepEqual(missingInvitees([], answers), [])
  const text = rsvpReminderText({ title: 'יום ההולדת של נועה', deadline: '2026-11-10' }, ['אורי', 'מיכל'], 'https://ugabuga.co.il/r/abc')
  assert.match(text, /אורי ומיכל/)
  assert.match(text, /https:\/\/ugabuga\.co\.il\/r\/abc$/)
  assert.equal(heList(['א']), 'א')
  assert.equal(heList(['א', 'ב', 'ג']), 'א, ב וג')
  assert.match(rsvpInviteText({ title: 'מסיבה', date: '2026-11-14', time: '17:00' }, 'L'), /יום שבת 14\.11/)
  assert.equal(formatDate('nope'), '')
})

test('wall: note validation, stickers match the database allow-list, booklet pages', () => {
  assert.equal(validateWallNote({ child: 'יואב', message: 'תודה רבה!' }).ok, true)
  assert.equal(validateWallNote({ child: '', message: 'תודה' }).ok, false)
  assert.equal(validateWallNote({ child: 'יואב', message: ' ' }).ok, false)
  assert.equal(validateWallNote({ child: 'יואב', message: 'see www.x.com' }).ok, false)
  const sql = readFileSync(new URL('../supabase/migrations/202610110001_group_tools.sql', import.meta.url), 'utf8')
  for (const s of STICKERS) assert.ok(sql.includes(`'${s}'`), `sticker ${s} missing in SQL`)
  const notes = Array.from({ length: 14 }, (_, i) => ({ id: i, message: i === 3 ? 'x'.repeat(300) : 'קצר' }))
  const pages = bookletPages(notes)
  assert.equal(pages.flat().length, 14)
  assert.ok(pages.every(p => p.reduce((w, n) => w + (n.message.length > 220 ? 2 : 1), 0) <= 6))
})

test('sql: no direct table access, every public RPC granted to anon', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202610110001_group_tools.sql', import.meta.url), 'utf8')
  for (const t of ['gt_rate', 'rsvp_events', 'rsvp_responses', 'secret_draws', 'secret_people', 'wall_boards', 'wall_notes']) {
    assert.match(sql, new RegExp(`alter table public\\.${t} enable row level security`))
    assert.match(sql, new RegExp(`revoke all on public\\.${t} from anon, authenticated`))
  }
  const db = readFileSync(new URL('../src/utils/groupDb.js', import.meta.url), 'utf8')
  const called = [...db.matchAll(/(?:call|compatibleRsvpCall)\('([a-z0-9_]+)'/g)].map(m => m[1])
  assert.ok(called.length >= 20)
  const grantBlock = sql.slice(sql.lastIndexOf('do $$'))
  const rollout = readFileSync(new URL('../supabase/manual/download_counts_rsvp_v2.sql', import.meta.url), 'utf8')
  const pin = readFileSync(new URL('../supabase/migrations/202610190001_rsvp_organizer_pin.sql', import.meta.url), 'utf8')
  const extras = readFileSync(new URL('../supabase/migrations/202610200002_rsvp_extras.sql', import.meta.url), 'utf8')
  for (const t of ['rsvp_extras', 'rsvp_marks']) assert.ok(extras.includes(`alter table public.${t} enable row level security`))
  const extraGrants = [rollout, pin, extras].flatMap(text => text.match(/grant execute on function [\s\S]*? to anon, authenticated;/g) || []).join('\n')
  for (const fn of called) assert.ok(grantBlock.includes(`'${fn}'`) || extraGrants.includes(`public.${fn}(`), `${fn} is not granted`)
  for (const t of ['pdf_download_totals', 'pdf_download_receipts', 'rsvp_presentations']) assert.ok(rollout.includes(`alter table public.${t} enable row level security`))
})

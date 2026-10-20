// RSVP event-type pages, guest translations and their reachability.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { RSVP_TYPES, VAAD_TYPES } = await import('../src/utils/rsvpTypes.js')
const { RSVP_LANGS, RSVP_STRINGS, t, translateError, formatDateIn } = await import('../src/utils/rsvpI18n.js')
const { validateRsvpAnswer } = await import('../src/utils/groupTools.js')

test('every event type is complete, unique, and in the sitemap and search', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
  const slugs = new Set()
  for (const x of RSVP_TYPES) {
    assert.match(x.slug, /^[a-z0-9-]+$/); assert.ok(!slugs.has(x.slug), x.slug); slugs.add(x.slug)
    assert.ok(['kids', 'general'].includes(x.kind), x.slug)
    assert.ok(['party', 'garden', 'sky', 'elegant'].includes(x.theme), x.slug)
    assert.ok(x.title.includes('___'), `${x.slug}: title has a blank to fill`)
    assert.ok(x.intro.length > 100 && x.tips.length === 3 && x.faq.length === 3, x.slug)
    assert.ok(sitemap.includes(`/rsvp/${x.slug}</loc>`) && search.includes(`'/rsvp/${x.slug}'`), x.slug)
  }
  assert.ok(VAAD_TYPES.length >= 4)
  assert.ok(sitemap.includes('/vaad</loc>'))
})

test('guest strings exist in every language, and validation errors translate', () => {
  for (const [key, row] of Object.entries(RSVP_STRINGS)) for (const l of RSVP_LANGS) assert.ok(row[l.id]?.trim(), `${key}.${l.id}`)
  for (const answer of [{ name: '', status: 'yes' }, { name: 'נועה', status: '' }, { name: 'נועה', status: 'yes', kids: 0, adults: 0 }]) {
    const he = validateRsvpAnswer(answer).error
    assert.ok(he)
    assert.notEqual(translateError('en', he), he, `untranslated: ${he}`)
  }
  assert.equal(t('en', 'fee', { p: 50 }), 'Contribution: ₪50')
  assert.ok(formatDateIn('ru', '2026-11-03').length > 3)
})

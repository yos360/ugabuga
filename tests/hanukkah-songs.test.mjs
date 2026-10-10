// Hanukkah songs page (/holidays/hanukkah/songs): song data, public-domain texts and the guessing game.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const {
  HANUKKAH_SONGS, SONG_AGES, BLESSINGS, HANEIROT_HALALU, MAOZ_TZUR,
  youtubeSearchUrl, songsForAge, creditLine, makeGame, shuffle, rng,
} = await import('../src/data/hanukkahSongs.js')

const NIKKUD = /[ְ-ׇ]/g
const plain = s => s.replace(NIKKUD, '')

test('15–20 songs with unique slugs/titles and complete metadata', () => {
  assert.ok(HANUKKAH_SONGS.length >= 15 && HANUKKAH_SONGS.length <= 20, `${HANUKKAH_SONGS.length} songs`)
  assert.equal(new Set(HANUKKAH_SONGS.map(s => s.slug)).size, HANUKKAH_SONGS.length)
  assert.equal(new Set(HANUKKAH_SONGS.map(s => s.title)).size, HANUKKAH_SONGS.length)
  const ages = SONG_AGES.map(a => a.id)
  for (const s of HANUKKAH_SONGS) {
    assert.match(s.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, s.slug)
    assert.ok(ages.includes(s.age), `${s.slug} age`)
    for (const f of ['title', 'emoji', 'lyricist', 'composer', 'desc', 'clue', 'hint']) assert.ok(typeof s[f] === 'string' && s[f].trim(), `${s.slug} ${f}`)
    assert.ok(s.desc.length >= 60 && s.desc.length <= 320, `${s.slug} desc length ${s.desc.length}`)
  }
  for (const a of ['gan', 'school']) assert.ok(HANUKKAH_SONGS.some(s => s.age === a), a)
})

test('only public-domain songs are marked as having full text', () => {
  assert.deepEqual(HANUKKAH_SONGS.filter(s => s.pd).map(s => s.slug).sort(), ['haneirot-halalu', 'maoz-tzur'])
  // no lyric fields sneak into the data for copyrighted songs
  for (const s of HANUKKAH_SONGS) assert.ok(!('lyrics' in s) && !('lines' in s), s.slug)
})

test('YouTube links are search links, never specific videos', () => {
  for (const s of HANUKKAH_SONGS) {
    const url = youtubeSearchUrl(s)
    assert.ok(url.startsWith('https://www.youtube.com/results?search_query='), url)
    assert.ok(!/watch\?v=|youtu\.be/.test(url))
    assert.ok(decodeURIComponent(url.split('=')[1]).includes(s.title))
  }
})

test('blessings: two every night, שהחיינו only on the first night', () => {
  assert.equal(BLESSINGS.length, 3)
  const first = BLESSINGS.filter(b => b.firstNightOnly)
  assert.equal(first.length, 1)
  assert.ok(plain(first[0].text).includes('שהחינו') || plain(first[0].text).includes('שהחיינו'))
  assert.ok(plain(BLESSINGS[0].text).includes('להדליק נר חנכה'))
  assert.ok(plain(BLESSINGS[1].text).includes('שעשה נסים לאבותינו'))
  for (const b of BLESSINGS) assert.ok(plain(b.text).startsWith('ברוך אתה ה׳ אלהינו מלך העולם'))
})

test('public-domain texts are present and vocalized', () => {
  assert.ok(plain(HANEIROT_HALALU).startsWith('הנרות הללו'))
  assert.ok(plain(HANEIROT_HALALU).includes('לראותם בלבד'))
  assert.equal(MAOZ_TZUR.length, 2)
  for (const st of MAOZ_TZUR) assert.equal(st.lines.length, 4, st.label)
  assert.ok(plain(MAOZ_TZUR[0].lines[0]).startsWith('מעוז צור ישועתי'))
  assert.ok(plain(MAOZ_TZUR[1].lines[0]).startsWith('יונים נקבצו עלי'))
  for (const t of [HANEIROT_HALALU, ...MAOZ_TZUR.flatMap(s => s.lines), ...BLESSINGS.map(b => b.text)]) assert.ok((t.match(NIKKUD) || []).length > 5, t)
})

test('age filter keeps "all ages" songs in every list', () => {
  assert.equal(songsForAge('').length, HANUKKAH_SONGS.length)
  for (const a of ['gan', 'school']) {
    const l = songsForAge(a)
    assert.ok(l.every(s => s.age === a || s.age === 'all'))
    assert.ok(l.some(s => s.slug === 'maoz-tzur'))
  }
})

test('credit line merges identical lyricist and composer', () => {
  assert.equal(creditLine({ lyricist: 'א', composer: 'א' }), 'מילים ולחן: א')
  assert.equal(creditLine({ lyricist: 'א', composer: 'ב' }), 'מילים: א · לחן: ב')
})

test('guess game: every song once, 4 distinct options including the answer, reproducible', () => {
  const g = makeGame(7)
  assert.equal(g.length, HANUKKAH_SONGS.length)
  assert.equal(new Set(g.map(q => q.slug)).size, HANUKKAH_SONGS.length)
  for (const q of g) {
    assert.equal(q.options.length, 4)
    assert.equal(new Set(q.options).size, 4)
    assert.ok(q.options.includes(q.answer))
  }
  assert.deepEqual(makeGame(7), g)
  assert.notDeepEqual(makeGame(8).map(q => q.slug), g.map(q => q.slug))
  // the correct answer isn't always in the same slot
  assert.ok(new Set(makeGame(1).map(q => q.options.indexOf(q.answer))).size > 1)
})

test('shuffle keeps all items', () => {
  const a = [1, 2, 3, 4, 5, 6]
  assert.deepEqual(shuffle(a, rng(3)).sort(), a)
})

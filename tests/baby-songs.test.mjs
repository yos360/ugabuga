import test from 'node:test'
import assert from 'node:assert/strict'
import { BABY_SONGS, BABY_GROUPS, BABY_ORIGINAL, babySong } from '../src/music/babySongs.js'

test('baby songs: unique slugs per group and valid groups', () => {
  const seen = new Set()
  for (const s of BABY_SONGS) {
    assert.ok(BABY_GROUPS[s.group], s.slug)
    const k = s.group + '/' + s.slug
    assert.ok(!seen.has(k), k)
    seen.add(k)
    assert.ok(babySong(s.group, s.slug))
  }
})

test('baby songs: every song has lyrics, moves, age, source and calm tips', () => {
  for (const s of BABY_SONGS) {
    assert.ok(s.lyrics.length > 0 && s.moves.length > 0 && s.age && s.source && s.calm, s.slug)
    assert.ok(['pd', 'original'].includes(s.kind), s.slug)
  }
})

test('baby songs: original songs are marked, public-domain songs state their source', () => {
  for (const s of BABY_SONGS) {
    if (s.kind === 'original') assert.equal(s.source, BABY_ORIGINAL)
    else assert.match(s.source, /נחלת הכלל/)
    if (s.lang !== 'he') assert.ok(s.gist, s.slug + ' needs a Hebrew gist')
  }
})

test('baby songs: both groups have at least 6 songs', () => {
  for (const g of Object.keys(BABY_GROUPS)) assert.ok(BABY_SONGS.filter(s => s.group === g).length >= 6, g)
})

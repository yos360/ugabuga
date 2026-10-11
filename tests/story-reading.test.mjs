import { test } from 'node:test'
import assert from 'node:assert/strict'

const { BEDTIME_STORIES, renderStory } = await import('../src/data/bedtimeStories.js')
const { splitSentences, VOICES } = await import('../src/pages/stories/storyReading.js')

test('read-aloud sentences cover every paragraph exactly (highlighting stays in step with the voice)', () => {
  for (const s of BEDTIME_STORIES) {
    for (const casting of [undefined, { hero: { name: 'נועה', g: 'f' } }, { hero: { name: 'איתי', g: 'm' } }]) {
      for (const p of renderStory(s, casting).body) {
        const parts = splitSentences(p)
        assert.ok(parts.length >= 1, `${s.slug}: empty paragraph`)
        assert.equal(parts.join(' '), p.trim().replace(/\s+/g, ' '), `${s.slug}: text lost when splitting`)
        for (const t of parts) assert.ok(t.length <= 400, `${s.slug}: sentence too long to read in one go`)
      }
    }
  }
})

test('voice presets stay gentle', () => {
  for (const v of Object.values(VOICES)) {
    assert.ok(v.pitch >= 0.8 && v.pitch <= 1.5)
    assert.ok(v.rate >= 0.6 && v.rate <= 1)
  }
})

const { recordedPlaylist, parseRecordedIndex, playlistLabel } = await import('../src/pages/stories/storyReading.js')

test('recorded playlist: title, every paragraph in order, goodnight', () => {
  for (const s of BEDTIME_STORIES) {
    const n = renderStory(s).body.length
    const list = recordedPlaylist(s.slug, n + 2, n)
    assert.equal(list.length, n + 2)
    assert.deepEqual(list[0], { src: `/audio/stories/${s.slug}/0.mp3`, p: -1 })
    assert.deepEqual(list.at(-1), { src: `/audio/stories/${s.slug}/${n + 1}.mp3`, p: -2 })
    list.slice(1, -1).forEach((it, i) => assert.deepEqual(it, { src: `/audio/stories/${s.slug}/${i + 1}.mp3`, p: i }))
    // A recording that doesn't match the text is never played.
    assert.equal(recordedPlaylist(s.slug, n + 1, n), null)
    assert.equal(recordedPlaylist(s.slug, n + 3, n), null)
  }
  assert.equal(recordedPlaylist('', 5, 3), null)
  assert.equal(recordedPlaylist('x', 0, 3), null)
})

test('recorded index parsing survives HTML fallbacks and junk', () => {
  assert.deepEqual(parseRecordedIndex('{}'), {})
  assert.deepEqual(parseRecordedIndex('<!doctype html><html></html>'), {})
  assert.deepEqual(parseRecordedIndex('[1,2]'), {})
  assert.deepEqual(parseRecordedIndex(null), {})
  assert.deepEqual(parseRecordedIndex('{"snail-and-sparrow": 11, "bad slug": 3, "x": 0, "y": "4", "z": 2.5}'), { 'snail-and-sparrow': 11 })
})

test('recorded progress label', () => {
  assert.equal(playlistLabel({ p: 2 }, 9), 'פסקה 3 מתוך 9')
  assert.equal(playlistLabel({ p: -1 }, 9), 'שם הסיפור')
  assert.equal(playlistLabel({ p: -2 }, 9), 'לילה טוב')
  assert.equal(playlistLabel(undefined, 9), '')
})

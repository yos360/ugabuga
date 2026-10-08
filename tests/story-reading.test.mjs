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

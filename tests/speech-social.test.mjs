// /speech/language/social: feelings, scenarios, perspective scenes, starters and the registrations.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EMOTIONS, emotionById, feelWord, FEEL_SCENES, SAY_SCENES, THINK_SCENES, SECTIONS, STARTER_GROUPS, DEFAULT_STARTERS, STORY_PARTS } from '../src/data/speech/social.js'
import { LANGUAGE_PAGES } from '../src/data/speech/language.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const NIKUD = /[֑-ׇ]/
const PATH = '/speech/language/social'

test('route, sitemap, search, menu and the language list', () => {
  assert.ok(read('src/App.jsx').includes(`path="${PATH}"`))
  assert.ok(read('public/sitemap-static.xml').includes(`https://ugabuga.co.il${PATH}<`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${PATH}'`))
  assert.ok(read('src/data/siteMenu.js').includes(`to: '${PATH}'`))
  assert.ok(LANGUAGE_PAGES.some(p => p.id === 'social' && p.path === PATH))
})

test('eight feelings with both forms', () => {
  assert.deepEqual(EMOTIONS.map(e => e.id), ['happy', 'sad', 'angry', 'scared', 'surprised', 'embarrassed', 'frustrated', 'proud'])
  for (const e of EMOTIONS) assert.ok(e.m && e.f && e.cue && !NIKUD.test(e.m + e.f), e.id)
  assert.equal(feelWord('sad', 'f'), 'עצובה')
})

test('feeling scenes: valid feelings, enough distractors, a "because" answer', () => {
  for (const s of FEEL_SCENES) {
    assert.ok(emotionById[s.feel], s.id)
    assert.ok(s.also.length >= 1 && s.also.every(a => emotionById[a] && a !== s.feel), s.id)
    assert.ok(EMOTIONS.length - 1 - s.also.length >= 1, `${s.id}: no distractor left`)
    assert.ok(['m', 'f'].includes(s.g) && s.name && /[.!”]$/.test(s.text), s.id)
    assert.ok(s.why.startsWith('כי'), s.id)
  }
  assert.equal(new Set(FEEL_SCENES.map(s => s.id)).size, FEEL_SCENES.length)
})

test('scenarios: three different options, at least one that fits, a kind note for each', () => {
  const all = [...SAY_SCENES, ...THINK_SCENES]
  assert.equal(new Set(all.map(s => s.id)).size, all.length)
  for (const s of SAY_SCENES) assert.ok(SECTIONS.some(x => x.id === s.sec), s.id)
  for (const s of all) {
    assert.equal(s.opts.length, 3, s.id)
    assert.equal(new Set(s.opts.map(o => o.t)).size, 3, s.id)
    assert.ok(s.opts.some(o => o.fit), `${s.id}: nothing fits`)
    assert.ok(s.opts.some(o => !o.fit), `${s.id}: nothing to talk about`)
    for (const o of s.opts) {
      assert.ok(o.note && o.note.length > 15, `${s.id}: ${o.t}`)
      assert.ok(!/טעית|זו טעות|לא נכון|אסור|שגוי/.test(o.note), `${s.id}: shaming wording in "${o.note}"`)
    }
    assert.ok(s.q.endsWith('?'), s.id)
  }
  assert.ok(SAY_SCENES.filter(s => s.sec === 'ask').length >= 6 && SAY_SCENES.filter(s => s.sec === 'talk').length >= 6)
  assert.ok(THINK_SCENES.length >= 6)
})

test('starters and story template', () => {
  const items = STARTER_GROUPS.flatMap(g => g.items)
  assert.equal(new Set(items).size, items.length)
  assert.ok(DEFAULT_STARTERS.length <= 8 && DEFAULT_STARTERS.every(t => items.includes(t)))
  assert.ok(STORY_PARTS.length === 6 && STORY_PARTS.every(p => !/חייב|אסור/.test(p.starter)))
})

test('the page names Carol Gray and does not claim the trademark', () => {
  const page = read('src/pages/speech/language/Social.jsx')
  assert.ok(page.includes('קרול גריי'))
  assert.ok(!page.includes('™'))
})

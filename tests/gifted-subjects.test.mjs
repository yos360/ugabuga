// /learn/gifted-test subjects: 5 subjects × 30 questions; structure checks, and every math answer is
// recomputed from the arithmetic stored with the question.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { SUBJECTS, SUBJECT_MATH } = await import('../src/learn/gifted/giftedSubjects.js')
const { TYPES } = await import('../src/learn/gifted/giftedData.js')

test('30 questions per subject, unique ids and slugs, 4 distinct options, one answer, an explanation', () => {
  const ids = new Set(TYPES.flatMap(t => t.items.map(i => i.id)))
  const slugs = new Set(TYPES.map(t => t.slug))
  for (const s of SUBJECTS) {
    assert.ok(!slugs.has(s.slug), `duplicate slug ${s.slug}`); slugs.add(s.slug)
    assert.equal(s.items.length, 30, s.key)
    for (const it of s.items) {
      assert.ok(!ids.has(it.id), `duplicate id ${it.id}`); ids.add(it.id)
      assert.equal(it.options.length, 4, it.id)
      assert.equal(new Set(it.options.map(o => String(o).trim())).size, 4, `${it.id}: options must be distinct`)
      for (const o of it.options) assert.ok(String(o).trim(), it.id)
      assert.ok(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 4, it.id)
      assert.ok([1, 2, 3].includes(it.level), it.id)
      assert.ok(it.q && it.q.length > 8, it.id)
      assert.ok(it.exp && it.exp.length > 20, `${it.id} needs an explanation`)
    }
    for (const l of [1, 2, 3]) assert.ok(s.items.filter(i => i.level === l).length >= 8, `${s.key} level ${l}`)
    assert.ok(new Set(s.items.map(i => i.answer)).size >= 3, `${s.key}: answers spread over positions`)
  }
})

test('math: the marked option equals the stored arithmetic, and only that option does', () => {
  for (const it of SUBJECT_MATH) {
    assert.ok(it.calc, `${it.id} needs its arithmetic`)
    const value = new Function(`return (${it.calc})`)()
    assert.ok(Number.isInteger(value), `${it.id}: ${value}`)
    assert.equal(Number(it.options[it.answer]), value, `${it.id}: marked answer must be ${value}`)
    assert.equal(it.options.filter(o => Number(o) === value).length, 1, it.id)
  }
})

test('every subject page is in the sitemap and in site search', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
  for (const s of SUBJECTS) {
    assert.ok(sitemap.includes(`/learn/gifted-test/${s.slug}</loc>`), s.slug)
    assert.ok(search.includes(`'/learn/gifted-test/${s.slug}'`), s.slug)
  }
})

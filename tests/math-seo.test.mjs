import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GRADES, topicsFor } from '../src/math/registry.js'
import { gradeSeo, testSeo, topicSeoTitle, topicH1, gradeKeyword, testKeyword } from '../src/math/seo.js'

const all = GRADES.flatMap(g => topicsFor(g.n).map(t => ({ t, g })))

test('grade pages: elementary targets "תרגילי חשבון", upper grades "מתמטיקה", keyword in title/h1/description', () => {
  for (const g of GRADES) {
    const s = gradeSeo(g, topicsFor(g.n).length)
    const kw = gradeKeyword(g)
    assert.ok(kw.startsWith(g.n <= 6 ? 'תרגילי חשבון לכיתה' : 'מתמטיקה לכיתה'), kw)
    assert.ok(s.title.startsWith(kw) && s.h1 === kw && s.description.startsWith(kw), g.path)
    assert.ok(s.title.length <= 60, `${g.path} title ${s.title.length}`)
    assert.ok(s.description.length >= 110 && s.description.length <= 165, `${g.path} description ${s.description.length}`)
  }
})

test('test pages: "מבחן בחשבון" for grades 1–6, "מבחן במתמטיקה" from grade 7', () => {
  for (const g of GRADES) {
    const s = testSeo(g)
    assert.equal(s.h1, testKeyword(g))
    assert.ok(s.h1.startsWith(g.n <= 6 ? 'מבחן בחשבון' : 'מבחן במתמטיקה'), s.h1)
    assert.ok(s.title.length <= 60, `${g.testPath} title ${s.title.length}`)
    assert.ok(s.description.length <= 165, `${g.testPath} description ${s.description.length}`)
  }
})

test('topic titles are unique, name the grade once and stay near 60 characters', () => {
  const titles = all.map(({ t, g }) => topicSeoTitle(t, g))
  assert.equal(new Set(titles).size, titles.length, 'duplicate topic titles')
  for (const [i, { t, g }] of all.entries()) {
    const title = titles[i]
    assert.ok(title.includes(`כיתה ${g.label}`), title)
    assert.equal(title.split(`כיתה ${g.label}`).length - 1, 1, `grade named twice: ${title}`)
    assert.ok(title.length <= 64, `${t.slug}: ${title.length} ${title}`)
    assert.ok(!/יח״ל.*לכיתה/.test(title), `units left before grade: ${title}`)
    const h1 = topicH1(t, g)
    assert.equal(h1.split(`כיתה ${g.label}`).length - 1, 1, `grade named twice in h1: ${h1}`)
  }
})

test('"לוח הכפל" alone is left to /learn/multiplication-table', () => {
  for (const { t, g } of all) {
    const title = topicSeoTitle(t, g)
    assert.ok(!/^לוח הכפל עד/.test(title), `math topic competes with the multiplication-table pages: ${title}`)
    if (/לוח הכפל/.test(t.title)) assert.ok((t.related || []).some(r => r.href === '/learn/multiplication-table'), `${t.slug} should link to the owner page`)
  }
})

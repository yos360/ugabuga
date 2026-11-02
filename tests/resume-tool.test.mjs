// /tools/resume: data model, sanitising, list helpers, in-place edit paths, undo, templates
import { test } from 'node:test'
import assert from 'node:assert/strict'
const L = await import('../src/office/resume/resumeLogic.js')
const { TEMPLATES, TEMPLATE_IDS, templateById, buildLayout } = await import('../src/office/resume/templates.js')

test('empty state is valid and survives a sanitise round-trip', () => {
  const s = L.emptyState()
  assert.equal(s.cv.experience.length, 1)
  assert.equal(s.cv.military.length, 0)
  assert.ok(L.isEmptyCv(s.cv))
  const again = L.sanitizeState(JSON.parse(JSON.stringify(s)), TEMPLATE_IDS)
  assert.deepEqual(again, s)
})

test('sanitising drops junk, bad photos, unknown templates and clamps sizes', () => {
  const s = L.sanitizeState({
    cv: { personal: { name: 'x'.repeat(500), photo: 'javascript:alert(1)', email: 42 }, experience: [{ id: 'a', title: 'A' }, { id: 'a', title: 'B' }, null, 'str'], languages: 'nope', labels: { skills: 'יכולות', evil: 'x' }, order: ['skills'] },
    design: { template: 'nope', accent: 'red' },
    extras: [{ kind: 'text', x: -50, y: 10, text: 'hi' }, { kind: 'script' }, { kind: 'line', x: 999, w: 1 }],
  }, TEMPLATE_IDS)
  assert.equal(s.cv.personal.name.length, 120)
  assert.equal(s.cv.personal.photo, '')
  assert.equal(s.cv.personal.email, '42')
  assert.equal(s.cv.experience.length, 2)
  assert.notEqual(s.cv.experience[0].id, s.cv.experience[1].id)
  assert.deepEqual(s.cv.languages, [])
  assert.deepEqual(s.cv.labels, { skills: 'יכולות' })
  assert.equal(s.cv.order, null)
  assert.equal(s.design.template, TEMPLATE_IDS[0])
  assert.equal(s.design.accent, '')
  assert.equal(s.extras.length, 2)
  assert.equal(s.extras[0].x, 0)
  assert.equal(s.extras[1].w, 8)
  assert.ok(s.extras[1].x <= L.PAGE_W_MM)
  assert.equal(L.safePhoto('data:image/jpeg;base64,AAAA'), 'data:image/jpeg;base64,AAAA')
  assert.equal(L.safePhoto('data:image/svg+xml;base64,AAAA'), '')
})

test('load/save never throw', () => {
  const broken = { getItem() { throw new Error('denied') }, setItem() { throw new Error('quota') } }
  assert.equal(L.loadState(broken, TEMPLATE_IDS), null)
  assert.equal(L.saveState(broken, L.emptyState()), false)
  const mem = new Map()
  const ok = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v) }
  assert.equal(L.loadState(ok, TEMPLATE_IDS), null)
  mem.set(L.STORE_KEY, '{not json')
  assert.equal(L.loadState(ok, TEMPLATE_IDS), null)
  const s = { ...L.emptyState(), cv: L.sampleCv() }
  assert.ok(L.saveState(ok, s))
  assert.equal(L.loadState(ok, TEMPLATE_IDS).cv.personal.name, 'נועה לוי')
})

test('add, move, remove items and sections', () => {
  let list = L.addItem([], 'experience')
  list = L.addItem(list, 'experience')
  const [a, b] = list.map(x => x.id)
  assert.notEqual(a, b)
  assert.deepEqual(L.moveItem(list, b, -1).map(x => x.id), [b, a])
  assert.equal(L.moveItem(list, a, -1), list)
  assert.deepEqual(L.removeItem(list, a).map(x => x.id), [b])
  assert.equal(L.updateItem(list, a, { title: 'מוכר' })[0].title, 'מוכר')
  const order = L.moveSection(null, 'education', -1)
  assert.ok(order.indexOf('education') < order.indexOf('military'))
  assert.equal(order.length, L.SECTIONS.length)
  assert.deepEqual(L.moveSection(order, order[0], -1), order)
})

test('in-place edits write back to the right field and line', () => {
  let cv = L.sampleCv()
  cv = L.setPath(cv, ['personal', 'name'], '  דני  ')
  assert.equal(cv.personal.name, 'דני')
  cv = L.setPath(cv, ['experience', 'se1', 'text', 1], 'שורה חדשה')
  assert.equal(L.lines(cv.experience[0].text)[1], 'שורה חדשה')
  const before = L.lines(cv.experience[0].text).length
  cv = L.setPath(cv, ['experience', 'se1', 'text', 0], '')
  assert.equal(L.lines(cv.experience[0].text).length, before - 1)
  assert.equal(L.lines(cv.experience[0].text)[0], 'שורה חדשה')
  cv = L.setPath(cv, ['experience', 'se1', 'text', 99], 'א\nב')
  assert.deepEqual(L.lines(cv.experience[0].text).slice(-2), ['א', 'ב'])
  cv = L.setPath(cv, ['skills', 0], 'Word')
  assert.equal(L.lines(cv.skills)[0], 'Word')
  cv = L.setPath(cv, ['labels', 'skills'], 'יכולות')
  assert.equal(L.label(cv, 'skills'), 'יכולות')
  cv = L.setPath(cv, ['languages', 'sl1', 'level'], 'מצוינת')
  assert.equal(cv.languages[0].level, 'מצוינת')
  assert.equal(L.setPath(cv, ['experience', 'missing', 'title'], 'x'), cv)
  assert.equal(L.setPath(cv, ['personal', 'photo'], 'x'), cv)
  assert.deepEqual(L.lines('- אחת\n\n• שתיים\n  '), ['אחת', 'שתיים'])
})

test('undo history merges quick typing in one field and is capped', () => {
  let h = L.pushHistory([], 's0', 'p.name', 0)
  h = L.pushHistory(h, 's1', 'p.name', 500)
  assert.equal(h.length, 1)
  assert.equal(h[0].s, 's0')
  h = L.pushHistory(h, 's2', 'p.title', 600)
  h = L.pushHistory(h, 's3', 'p.title', 5000)
  assert.equal(h.length, 3)
  for (let i = 0; i < 200; i++) h = L.pushHistory(h, i, null, i)
  assert.equal(h.length, L.HISTORY_MAX)
})

test('page estimate and file name', () => {
  assert.equal(L.estimatePages(L.emptyCv()), 1)
  assert.equal(L.estimatePages(L.sampleCv()), 1)
  const long = L.sampleCv()
  long.experience = Array.from({ length: 12 }, (_, i) => ({ id: 'e' + i, title: 'תפקיד', place: 'מקום', years: '2020', text: 'שורה ארוכה '.repeat(12) + '\nעוד שורה\nועוד אחת' }))
  assert.ok(L.estimatePages(long) >= 2)
  assert.equal(L.fileTitle(L.sampleCv()), 'קורות חיים - נועה לוי')
  assert.equal(L.fileTitle(L.emptyCv()), 'קורות חיים')
  assert.equal(L.fileTitle({ personal: { name: 'a/b:c' } }), 'קורות חיים - abc')
})

test('at least 20 templates with unique ids and valid options', () => {
  assert.ok(TEMPLATES.length >= 20, `only ${TEMPLATES.length} templates`)
  assert.equal(new Set(TEMPLATE_IDS).size, TEMPLATES.length)
  assert.equal(new Set(TEMPLATES.map(t => t.name)).size, TEMPLATES.length)
  const opts = {
    layout: ['single', 'side-right', 'side-left', 'split'], header: ['plain', 'center', 'band', 'line', 'split', 'boxed', 'initials', 'side', 'main'],
    side: ['fill', 'tint', 'gray', 'line'], heads: ['line', 'bar', 'pill', 'under', 'caps', 'box', 'dot', 'serif'], font: ['heebo', 'serif', 'assistant', 'rubik'],
    density: ['normal', 'compact', 'airy'], photo: ['none', 'circle', 'square', 'rounded'], skills: ['list', 'chips', 'inline'],
  }
  for (const t of TEMPLATES) {
    for (const [k, allowed] of Object.entries(opts)) assert.ok(allowed.includes(t[k]), `${t.id}.${k} = ${t[k]}`)
    assert.match(t.accent, /^#[0-9a-f]{6}$/i)
    if (t.order) assert.deepEqual([...t.order].sort(), [...L.SECTIONS].sort(), `${t.id} order must list every section once`)
    if (['side', 'main'].includes(t.header)) assert.notEqual(t.layout, 'single', `${t.id}: header ${t.header} needs a column`)
  }
  assert.ok(TEMPLATES.filter(t => t.photo !== 'none').length >= 4)
  assert.ok(TEMPLATES.filter(t => t.layout !== 'single').length >= 6)
  assert.equal(templateById('nope'), TEMPLATES[0])
})

test('every template lays out the same sample: each filled section exactly once', () => {
  const cv = L.sampleCv()
  cv.personal.photo = 'data:image/jpeg;base64,AAAA'
  const filled = L.SECTIONS.filter(s => L.hasContent(cv, s))
  assert.equal(filled.length, L.SECTIONS.length)
  for (const t of TEMPLATES) {
    for (const edit of [false, true]) {
      const lay = buildLayout(cv, t, { edit })
      const all = [...lay.main, ...lay.side].filter(s => s !== 'contact')
      assert.deepEqual([...all].sort(), [...filled].sort(), `${t.id} edit=${edit}`)
      assert.ok(lay.cls.includes('rs-cv') && lay.cls.includes(`L-${t.layout}`))
      assert.equal(lay.photo, t.photo === 'none' ? '' : t.photo)
      assert.ok(lay.contactInHead || lay.side.includes('contact'), `${t.id}: contact details are missing`)
      if (!lay.twoCol) assert.deepEqual(lay.side, [])
    }
  }
})

test('print layout hides empty and optional sections; edit layout keeps required ones', () => {
  const cv = L.emptyCv()
  for (const t of TEMPLATES) {
    const print = buildLayout(cv, t)
    assert.deepEqual([...print.main, ...print.side], [], t.id)
    const edit = buildLayout(cv, t, { edit: true })
    const shown = [...edit.main, ...edit.side]
    for (const s of L.OPTIONAL_SECTIONS) assert.ok(!shown.includes(s), `${t.id} shows empty ${s}`)
    assert.ok(shown.includes('experience') && shown.includes('summary'))
  }
  const own = { ...L.sampleCv(), order: [...L.SECTIONS].reverse() }
  assert.equal(buildLayout(own, templateById('classic')).main[0], 'hobbies')
  assert.ok(buildLayout(L.sampleCv(), templateById('classic'), { compact: true }).cls.includes('D-compact'))
  assert.equal(buildLayout(L.sampleCv(), templateById('classic'), { accent: '#123456' }).accent, '#123456')
})

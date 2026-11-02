import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

// The grade-by-grade subject booklets are data: page copy in src/booklets/meta/<slug>.js, pages in
// src/booklets/content/<slug>.js, drawn by subjectKit.jsx and listed in registry-subjects.js.
// These checks keep every content file printable and its answer key right.
const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
// BOOKLETS=slug,slug limits the run to some booklets while writing them.
const only = process.env.BOOKLETS ? process.env.BOOKLETS.split(',') : null
const slugs = readdirSync(new URL('../src/booklets/content/', import.meta.url)).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3)).filter(s => !only || only.includes(s))
const TYPES = new Set(['read', 'choice', 'truefalse', 'match', 'fill', 'order', 'problems', 'words', 'search', 'open'])
const words = t => t.trim().split(/\s+/).length
const load = async (dir, slug) => (await import(`../src/booklets/${dir}/${slug}.js`)).default

// "1,204 × 3" -> a number, or null when the text is not plain arithmetic.
function calc(expr) {
  const js = expr.replace(/(\d),(?=\d{3})/g, '$1').replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/:/g, '/').replace(/\^/g, '**').trim()
  if (!/^[\d\s+\-*/().]+$/.test(js) || !/\d/.test(js)) return null
  try { const v = Function(`return (${js})`)(); return Number.isFinite(v) ? v : null } catch { return null }
}
const close = (a, b) => Math.abs(a - b) < 1e-9

test('every subject booklet is registered with its own meta file', async () => {
  const registry = read('src/booklets/registry-subjects.js')
  assert.ok(slugs.length > 0)
  for (const slug of slugs) {
    assert.ok(registry.includes(`import('./content/${slug}.js')`) && registry.includes(`from './meta/${slug}.js'`), `${slug} is not in registry-subjects.js`)
  }
})

test('subject booklet page copy is complete', async () => {
  for (const slug of slugs) {
    const m = await load('meta', slug)
    assert.equal(m.slug, slug)
    for (const k of ['emoji', 'title', 'seoTitle', 'description', 'intro', 'audience', 'subject', 'stage', 'added']) assert.ok(m[k], `${slug}: meta.${k}`)
    assert.ok(['גן', 'יסודי', 'חטיבת ביניים', 'תיכון'].includes(m.stage), `${slug}: stage ${m.stage}`)
    assert.ok(m.description.length >= 80 && m.description.length <= 220, `${slug}: description length ${m.description.length}`)
    assert.ok(m.paragraphs.length >= 3 && m.faq.length >= 3 && m.related.length >= 3, `${slug}: 3 paragraphs, 3 FAQ, 3 related links`)
    m.related.forEach(r => assert.match(r.href, /^\/[a-z0-9\-/]*$/, `${slug}: related ${r.href}`))
    assert.equal(new Set(m.pages).size, m.pages.length, `${slug}: page titles repeat`)
  }
})

test('subject booklet content fits the layout and its answers are right', async () => {
  for (const slug of slugs) {
    const c = await load('content', slug), b = await load('meta', slug), at = i => `${slug} page ${i + 2} (${b.pages[i + 1]})`
    assert.equal(c.slug, slug)
    for (const k of ['emoji', 'title', 'subtitle', 'note', 'done', 'cheer']) assert.ok(c[k], `${slug}: ${k}`)
    assert.equal(c.title, b.title, `${slug}: cover title = meta title`)
    assert.equal(b.pages.length, c.sections.length + 3, `${slug}: pages = cover + sections + key + certificate`)
    assert.ok(b.pages.length >= 12 && b.pages.length <= 18, `${slug}: ${b.pages.length} pages`)
    assert.match(b.pages.at(-2), /תשובות/, `${slug}: answer key page`)
    assert.match(b.pages.at(-1), /תעודת סיום/, `${slug}: certificate page`)
    c.sections.forEach((s, i) => {
      assert.ok(TYPES.has(s.type), `${at(i)}: type ${s.type}`)
      const items = s.items || s.pairs || s.questions || s.prompts || s.words
      assert.ok(Array.isArray(items) && items.length >= 3, `${at(i)}: at least 3 items`)
      if (s.type === 'read') {
        assert.ok(words(s.text.join(' ')) <= 200, `${at(i)}: passage of ${words(s.text.join(' '))} words (max 200)`)
        assert.ok(s.questions.length <= 6, `${at(i)}: up to 6 questions`)
        s.questions.forEach(q => assert.ok(q.length === 2 && q[1], `${at(i)}: question + answer`))
      }
      if (s.type === 'choice') {
        assert.ok(s.items.length <= 10, `${at(i)}: up to 10 questions`)
        s.items.forEach(([q, right, wrong]) => {
          assert.ok(Array.isArray(wrong) && wrong.length >= 2 && wrong.length <= 3, `${at(i)}: 2–3 wrong options — ${q}`)
          assert.equal(new Set([right, ...wrong]).size, wrong.length + 1, `${at(i)}: options repeat — ${q}`)
        })
      }
      if (s.type === 'truefalse') {
        assert.ok(s.items.length <= 12, `${at(i)}: up to 12 statements`)
        s.items.forEach(([t, v]) => assert.equal(typeof v, 'boolean', `${at(i)}: ${t}`))
        assert.ok(s.items.some(x => x[1]) && s.items.some(x => !x[1]), `${at(i)}: both true and false statements`)
      }
      if (s.type === 'match') {
        assert.ok(s.pairs.length <= 10, `${at(i)}: up to 10 pairs`)
        assert.equal(new Set(s.pairs.map(p => p[0])).size, s.pairs.length, `${at(i)}: terms repeat`)
      }
      if (s.type === 'fill') {
        assert.ok(s.items.length <= 10, `${at(i)}: up to 10 sentences`)
        s.items.forEach(([t, w]) => assert.equal(t.split('___').length, 2, `${at(i)}: one ___ in — ${t} (${w})`))
        assert.equal(new Set(s.items.map(x => x[1])).size, s.items.length, `${at(i)}: the word bank repeats a word`)
      }
      if (s.type === 'order') assert.ok(s.items.length <= 10, `${at(i)}: up to 10 events`)
      if (s.type === 'words') assert.ok(s.items.length <= 7, `${at(i)}: up to 7 word problems`)
      if (s.type === 'open') assert.ok(s.prompts.length <= 6, `${at(i)}: up to 6 prompts`)
      if (s.type === 'search') {
        assert.ok(s.words.length <= 12, `${at(i)}: up to 12 words`)
        s.words.forEach(w => assert.ok(/^[א-ת]+$/.test(w) && w.length <= (s.size || 10), `${at(i)}: search word ${w}`))
      }
      if (s.type === 'problems') {
        assert.ok(s.items.length <= ((s.cols || 2) === 1 ? 10 : 20), `${at(i)}: too many exercises`)
        for (const [text, ans] of s.items) {
          // Every exercise that is plain arithmetic is checked: "a op b" against the answer, or "x = y" with the blank filled.
          if (text.includes('___')) {
            const [l, r] = text.replace('___', `(${String(ans)})`).split('=')
            const a = calc(l ?? ''), z = calc(r ?? '')
            if (a !== null && z !== null) assert.ok(close(a, z), `${at(i)}: ${text} → ${ans}`)
          } else {
            const v = calc(text), want = calc(String(ans))
            if (v !== null && want !== null) assert.ok(close(v, want), `${at(i)}: ${text} = ${ans}, not ${v}`)
          }
        }
      }
      if (s.type === 'words') for (const [q, ans] of s.items) {
        const [expr, result] = String(ans).split('=')
        const v = calc(expr), want = result === undefined ? null : calc(result.replace(/[^\d.,\s]/g, '').trim())
        if (v !== null && want !== null) assert.ok(close(v, want), `${at(i)}: ${q} → ${ans}`)
      }
    })
  }
})

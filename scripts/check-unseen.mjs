// Checks unseen tests: node scripts/check-unseen.mjs [files…] (default: every src/data/unseen/tests-*.js)
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { SKILLS, levelOf } from '../src/data/unseen/levels.js'

const dir = new URL('../src/data/unseen/', import.meta.url)
const files = process.argv.slice(2).length ? process.argv.slice(2).map(f => pathToFileURL(f)) : readdirSync(dir).filter(f => /^tests-.*\.js$/.test(f)).map(f => new URL(f, dir))
const words = s => String(s).trim().split(/\s+/).filter(w => /[\p{L}\d]/u.test(w)).length
const problems = [], slugs = new Set()
let count = 0
export function checkTest(t) {
  const out = [], bad = m => out.push(`${t.slug || '?'}: ${m}`)
  if (!/^[a-z0-9-]+$/.test(t.slug || '')) bad('slug must be kebab-case')
  const L = levelOf(t.lang, t.level)
  if (!L) { bad(`unknown level ${t.lang}/${t.level}`); return out }
  for (const k of ['title', 'genre', 'topic', 'summary']) if (!t[k]) bad(`missing ${k}`)
  if (!Array.isArray(t.texts) || !t.texts.length) { bad('no texts'); return out }
  const nTexts = t.texts.length, [tmin, tmax] = Array.isArray(L.texts) ? L.texts : [L.texts || 1, L.texts || 1]
  if (nTexts < tmin || nTexts > tmax) bad(`${nTexts} texts, level wants ${tmin}–${tmax}`)
  const prose = t.texts.map(x => (x.paragraphs || []).join(' '))
  const total = prose.reduce((s, p) => s + words(p), 0)
  if (L.id === 'mod-a') prose.forEach((p, i) => { const w = words(p); if (w < L.words[0] || w > L.words[1]) bad(`text ${i + 1}: ${w} words, want ${L.words.join('–')}`) })
  else if (total < L.words[0] || total > L.words[1]) bad(`${total} words, want ${L.words.join('–')}`)
  if (t.lang === 'he' && !t.texts.some(x => x.table)) bad('Hebrew tests need one non-continuous text (table)')
  const hay = t.texts.map((x, i) => [prose[i], x.title || '', x.table ? [x.table.caption, ...x.table.head, ...x.table.rows.flat()].join(' ') : ''].join(' '))
  const qs = t.questions || [], [qmin, qmax] = L.questions
  if (qs.length < qmin || qs.length > qmax) bad(`${qs.length} questions, want ${qmin}–${qmax}`)
  if (!qs.some(q => q.type === 'open')) bad('needs at least one open question')
  if (qs.filter(q => q.type === 'mc').length < Math.ceil(qs.length / 3)) bad('too few multiple-choice questions')
  qs.forEach((q, i) => {
    const n = `Q${i + 1}`
    if (!SKILLS[q.skill]) bad(`${n}: unknown skill ${q.skill}`)
    if (!q.q || !q.explain) bad(`${n}: missing q/explain`)
    if (q.text != null && !(q.text >= 0 && q.text < nTexts)) bad(`${n}: bad text index`)
    if (q.type === 'mc') {
      if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4) bad(`${n}: needs 4 different options`)
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) bad(`${n}: answer must be 0–3`)
    } else if (q.type === 'open') { if (typeof q.answer !== 'string' || !q.answer) bad(`${n}: open answer must be a model answer`) }
    else bad(`${n}: type must be mc/open`)
    if (q.skill !== 'compare' && q.skill !== 'main-idea') {
      if (!q.evidence) bad(`${n}: missing evidence`)
      else if (!hay.some(h => h.includes(q.evidence))) bad(`${n}: evidence not found word-for-word: "${q.evidence}"`)
    }
  })
  const answers = qs.filter(q => q.type === 'mc').map(q => q.answer)
  if (answers.length >= 6 && new Set(answers).size < 3) bad('correct answers bunch on the same letters')
  if (t.lang === 'en') {
    if (!Array.isArray(t.glossary) || t.glossary.length < 4) bad('English tests need a glossary of 4+ words')
    else for (const [w] of t.glossary) if (!prose.join(' ').toLowerCase().includes(w.toLowerCase())) bad(`glossary word not in text: ${w}`)
  }
  if ((L.id === 'mod-c' || L.id === 'mod-g' || L.id === 'bagrut') && !t.writing) bad('this level needs a writing task')
  return out
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  for (const f of files) {
    const { TESTS } = await import(f)
    for (const t of TESTS) { count++; if (slugs.has(t.slug)) problems.push(`${t.slug}: duplicate slug`); slugs.add(t.slug); problems.push(...checkTest(t)) }
  }
  if (problems.length) { console.log(problems.join('\n')); console.log(`${problems.length} problem(s) in ${count} tests`); process.exit(1) }
  console.log(`${count} unseen tests checked in ${files.length} file(s): all OK`)
}

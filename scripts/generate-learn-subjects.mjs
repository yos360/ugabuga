import { readFile, writeFile } from 'node:fs/promises'

// Writes the school-subject pages (/learn/<subject>/...) into public/sitemap-static.xml and
// src/data/searchStatic.js, between "learn-subjects" markers: subject hubs, lessons, grade pages
// with their sample exams, and the concept glossary. Run after adding lessons or concepts:
//   node scripts/generate-learn-subjects.mjs
// tests/learn-subjects.test.mjs fails when the files are out of date.
import { SUBJECTS, loadTopics, loadConcepts, topicsForGrade, gradeSlug, GRADE_LETTERS } from '../src/learn/subjects/subjects.js'

const MIN_GRADE_TOPICS = 4 // same as SubjectPages.jsx
const today = new Date().toISOString().slice(0, 10)
const q = s => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const urls = [], rows = []
const add = (path, prio, row) => { urls.push(`  <url><loc>https://ugabuga.co.il${path}</loc><lastmod>${today}</lastmod><priority>${prio}</priority></url>`); if (row) rows.push(`  { to: '${path}', ${row} },`) }

for (const s of SUBJECTS) {
  const topics = await loadTopics(s.key), concepts = await loadConcepts(s.key)
  add(`/learn/${s.key}`, '0.8', `title: '${q(s.title)}', emoji: '${s.emoji}', kind: 'page', desc: '${q(s.desc)}', keys: '${q(s.title)} ${q(s.short)} שיעורים לימוד'`)
  for (const t of s.tools || []) add(t.to, '0.8', `title: '${q(t.label)}', emoji: '${t.emoji}', kind: 'tool', desc: '${q(t.desc)}', keys: '${q(t.label)} ${q(s.short)} משחק'`)
  for (const t of topics) add(`/learn/${s.key}/${t.slug}`, '0.7', `title: '${q(t.title)}', emoji: '${t.emoji}', kind: 'page', desc: '${q(s.short)} · שיעור, חידון ודף עבודה', keys: '${q(t.title)} ${q(s.short)} ${q(t.seoTitle.replace(/[—|·–-]/g, ' '))}'`)
  for (const g of s.gradeList.filter(g => topicsForGrade(topics, g).length >= MIN_GRADE_TOPICS)) {
    const name = `${s.short} לכיתה ${GRADE_LETTERS[g]}`
    add(`/learn/${s.key}/${gradeSlug(g)}`, '0.7', `title: '${q(name)}', emoji: '${s.emoji}', kind: 'page', desc: 'שיעורים, חוברת להדפסה ומבחן לדוגמה', keys: '${q(name)} חוברת ${q(s.short)} כיתה ${GRADE_LETTERS[g]}'`)
    add(`/learn/${s.key}/${gradeSlug(g)}/exam`, '0.7', `title: 'מבחן ${q(name)}', emoji: '📝', kind: 'page', desc: 'מבחן סוף שנה לדוגמה עם תשובות', keys: 'מבחן ${q(name)} מבחן סוף שנה ${q(s.short)} כיתה ${GRADE_LETTERS[g]}'`)
  }
  if (concepts.length) {
    add(`/learn/${s.key}/concepts`, '0.6', `title: 'מילון מושגים ב${q(s.short)}', emoji: '📘', kind: 'page', desc: '${concepts.length} מושגים בהסבר פשוט', keys: 'מושגים ${q(s.short)} מילון הגדרות'`)
    for (const c of concepts) add(`/learn/${s.key}/concepts/${c.slug}`, '0.6', `title: '${q(c.term)} (מושג ב${q(s.short)})', emoji: '📘', kind: 'page', low: true, desc: '${q(s.short)} · מושג בהסבר פשוט', keys: 'מה זה ${q(c.term)} ${q(c.term)} ${q(s.short)}'`)
  }
}

async function patch(file, start, end, body, anchorBefore) {
  const url = new URL(`../${file}`, import.meta.url)
  let text = await readFile(url, 'utf8')
  const block = `${start}\n${body}\n${end}\n`
  if (text.includes(start)) text = text.slice(0, text.indexOf(start)) + block + text.slice(text.indexOf(end) + end.length + 1)
  else { const i = text.indexOf(anchorBefore); if (i < 0) throw new Error(`${file}: anchor not found`); text = text.slice(0, i) + block + text.slice(i) }
  await writeFile(url, text)
}
await patch('public/sitemap-static.xml', '  <!-- learn-subjects:start (scripts/generate-learn-subjects.mjs) -->', '  <!-- learn-subjects:end -->', urls.join('\n'), '  <url><loc>https://ugabuga.co.il/learn/psychometric-kids</loc>')
await patch('src/data/searchStatic.js', '  // learn-subjects:start (scripts/generate-learn-subjects.mjs)', '  // learn-subjects:end', rows.join('\n'), "  { to: '/learn/gifted-test/practice'")
console.log(`generate-learn-subjects: ${urls.length} URLs`)

import { useEffect, useState } from 'react'

// Worksheets for the planner, built from what each lesson step links to: math topics (the topic's own
// three levels), school-subject and Tanakh lessons (their quiz), English grammar (its quiz) and English
// vocabulary (a word quiz). Three levels: 'easy' (fewer questions, three options), 'regular', 'advanced'
// (all questions plus open thinking questions). A unit's last lesson can print a unit quiz instead,
// built from every step of the unit. Sources are loaded only when a sheet is opened.
export const LEVELS = [['easy', '🌱 מותאם'], ['regular', '📄 רגיל'], ['advanced', '🚀 מתקדם']]
const LETTERS = ['א', 'ב', 'ג', 'ד']
const MATH_LEVEL = { easy: 1, regular: 2, advanced: 3 }

// Deterministic choice so the same lesson prints the same sheet.
const seedOf = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
const pick = (list, n, seed) => list.map((x, i) => [x, (seed * (i + 7)) % 997]).sort((a, b) => a[1] - b[1]).slice(0, n).map(x => x[0])

// Multiple-choice items { q, options, answer } adjusted to the level.
function leveled(items, level, seed) {
  if (level === 'easy') return pick(items, 4, seed).map(it => {
    const wrong = it.options.filter((_, j) => j !== it.answer).slice(0, 2)
    const options = [...wrong]; options.splice(seed % 3, 0, it.options[it.answer])
    return { ...it, options, answer: seed % 3 }
  })
  return level === 'regular' ? pick(items, 8, seed) : items
}

async function itemsFor(link, grade, level) {
  const seed = seedOf(`${link.type}:${link.slug}`)
  if (link.type === 'math-topic') {
    const m = await import('../../math/registry')
    const topic = m.findTopic(grade, link.slug)
    if (!topic) return null
    return { kind: 'math', title: topic.title, items: m.makeWorksheet(topic, MATH_LEVEL[level], level === 'easy' ? 6 : 10, seed) }
  }
  if (link.type === 'lesson' || link.type === 'tanakh-topic') {
    const [key, slug] = link.type === 'lesson' ? link.slug.split('/') : ['tanakh', link.slug]
    const s = await import('../../learn/subjects/subjects')
    const t = (await s.loadTopics(key)).find(x => x.slug === slug)
    if (!t) return null
    const mc = s.placeQuiz(t.slug, t.quiz).map(q => ({ q: q.q, options: q.options, answer: q.answer }))
    return { kind: 'mc', title: t.title, items: leveled(mc, level, seed), open: level === 'advanced' ? t.think : [] }
  }
  if (link.type === 'grammar') {
    const g = await import('../../data/englishGrammar')
    const t = g.grammarBySlug(link.slug)
    if (!t) return null
    const mc = t.quiz.map(q => ({ q: [q.p, q.s].filter(Boolean).join(' — '), options: q.options, answer: q.answer, ltr: true }))
    return { kind: 'mc', title: `${t.title} — ${t.en}`, items: leveled(mc, level, seed) }
  }
  if (link.type === 'vocab') {
    const v = await import('../../data/englishVocab')
    const [g, unitSlug] = link.slug.split('/')
    const unit = v.vocabUnit(Number(g.replace('grade-', '')), unitSlug)
    if (!unit) return null
    const words = unit.words
    const mc = words.map(([en, he], i) => {
      const others = words.filter((_, j) => j !== i).map(w => w[1])
      const wrong = pick(others, 3, seed + i)
      const answer = (seed + i) % 4, options = [...wrong]; options.splice(answer, 0, he)
      return { q: `What does "${en}" mean?`, options, answer, ltr: true }
    })
    return { kind: 'mc', title: `${unit.title} — ${unit.en}`, items: leveled(mc, level, seed) }
  }
  return null
}

// The sheet(s) for one lesson (or, with `unitQuiz`, for the whole unit).
export function useLessonSheet(lesson, grade, level, unitQuiz = false) {
  const [sheet, setSheet] = useState(null)
  const links = !lesson ? [] : unitQuiz ? lesson.unit.steps.flatMap(s => s.links || []) : lesson.step.links || []
  const key = `${grade}|${level}|${unitQuiz}|${links.map(l => `${l.type}:${l.slug}`).join(',')}`
  useEffect(() => {
    let live = true
    const usable = [...new Map(links.filter(l => ['math-topic', 'lesson', 'tanakh-topic', 'grammar', 'vocab'].includes(l.type)).map(l => [`${l.type}:${l.slug}`, l])).values()]
    Promise.all(usable.slice(0, unitQuiz ? 4 : 1).map(l => itemsFor(l, grade, unitQuiz && level === 'easy' ? 'regular' : level).catch(() => null)))
      .then(parts => { if (live) setSheet(parts.filter(Boolean)) })
    return () => { live = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return sheet
}

export function SheetPages({ parts, title, sub, MathText }) {
  if (!parts?.length) return null
  const all = parts.flatMap(p => p.items.map(it => ({ ...it, kind: p.kind })))
  const T = MathText || (({ children }) => <>{children}</>)
  return <>
    <article className="buga-flow buga-a4" dir="rtl" style={{ padding: '10mm 12mm' }}>
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="flex justify-between text-sm"><span>שם: ______________</span><span>תאריך: ________</span><span>ציון: ____ / {all.length}</span></p>
      {sub && <p className="mt-1 font-bold">{sub}</p>}
      <ol className="mt-3 list-decimal space-y-3 pr-6">{all.map((it, i) => <li key={i}>
        {it.kind === 'math' ? <><T>{it.q}</T>{it.expr && <p dir="ltr" className="font-bold">{it.expr}</p>}
          {it.type === 'choice' ? <p className="flex flex-wrap gap-4">{it.choices.map(c => <span key={c}>◯ <T>{c}</T></span>)}</p> : <p>תשובה: ____________ {it.unit || ''}</p>}</>
          : <><p className="font-bold" dir={it.ltr ? 'ltr' : undefined} style={it.ltr ? { textAlign: 'right' } : undefined}>{it.q}</p>
            <p className="flex flex-wrap gap-x-6 gap-y-1">{it.options.map((o, j) => <span key={j} dir={it.ltr ? 'ltr' : undefined}>{LETTERS[j]}. {o}</span>)}</p></>}
      </li>)}</ol>
      {parts.some(p => p.open?.length) && <><h3 className="mt-4 text-lg font-black">חושבים ועונים</h3>
        <ol className="list-decimal pr-6">{parts.flatMap(p => p.open || []).map((q, i) => <li key={i} className="mt-2">{q}<div className="mt-3 border-b border-slate-400" /><div className="mt-4 border-b border-slate-400" /></li>)}</ol></>}
    </article>
    <article className="buga-flow buga-a4" dir="rtl" style={{ padding: '10mm 12mm' }}>
      <h2 className="text-xl font-black">תשובות — {title}</h2>
      <ol className="mt-2 list-decimal pr-6">{all.map((it, i) => <li key={i} dir="ltr" style={{ textAlign: 'right' }}>{it.kind === 'math' ? <MathAnswer ex={it} /> : `${LETTERS[it.answer]}. ${it.options[it.answer]}`}</li>)}</ol>
    </article>
  </>
}
function MathAnswer({ ex }) {
  const [fmt, setFmt] = useState(null)
  useEffect(() => { import('../../math/check').then(m => setFmt(() => m.formatAnswer)) }, [])
  return <>{fmt ? fmt(ex) : ''}{ex.unit ? ` ${ex.unit}` : ''}</>
}

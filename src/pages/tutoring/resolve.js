// What a step of a tutoring plan points to: the page to practise on, and the material for its printed sheet.
// Reading texts, vocabulary units and unseen tests are chosen by the child's grade and the session, so a month of
// sessions doesn't keep landing on the same text. Sources are loaded only when a plan is open.
import { linkHref, LINK_LABELS } from '../../data/planner/engine'
import { exerciseCount } from '../../data/tutoring/plan'

const easier = (o, top) => Math.min(top, Math.max(1, o.base ? o.grade - 1 : o.grade))

export async function resolveLink(link, session, o) {
  const i = session.index
  switch (link.type) {
    case 'reading': {
      const { GRADED_READING } = await import('../../learn/readingGrades')
      const list = GRADED_READING.filter(x => x.level === easier(o, 8))
      const text = list[i % list.length]
      return { to: `/learn/reading/${text.slug}`, label: `📖 ${text.title}`, text }
    }
    case 'vocab-auto': {
      const v = await import('../../data/englishVocab')
      const n = easier(o, 9), units = v.vocabGrade(n).units, unit = units[i % units.length]
      return { to: v.vocabHref(n, unit.slug), label: `🔤 ${unit.title}`, sheetLink: { type: 'vocab', slug: `grade-${n}/${unit.slug}` } }
    }
    case 'unseen-auto': {
      const u = await import('../../data/unseen/library')
      const level = `g${Math.min(9, Math.max(3, easier(o, 9)))}`
      const list = u.testsOf('en', level), meta = list[i % list.length]
      return { to: u.unseenHref(meta), label: `📰 ${meta.title}`, meta, load: () => u.loadUnseen(meta.slug) }
    }
    case 'dictation': return { to: '/learn/dictation', label: '🎧 הכתבה באתר' }
    case 'math-topic': return { to: `/math/grade-${link.grade}/${link.slug}`, label: LINK_LABELS['math-topic'], sheetLink: link, sheetGrade: link.grade }
    case 'lesson': return { to: linkHref(link, o.grade), label: '🎓 שיעור באתר', sheetLink: link }
    case 'grammar': return { to: linkHref(link, o.grade), label: LINK_LABELS.grammar, sheetLink: link }
    case 'booklet': return { to: linkHref(link, o.grade), label: `📒 ${link.label}` }
    default: return { to: link.slug, label: `🔗 ${link.label}` }
  }
}

// The printable material of one session: exercises, a reading text, a dictation, an unseen, or a task page when the
// practice lives in a game or a booklet. Never empty, so printing a week never skips a day.
export async function loadSheet(session, o) {
  const parts = []
  for (const { skill, step } of session.sources) {
    const r = await resolveLink(step.link, session, o)
    if (r.text) parts.push({ kind: 'reading', text: r.text, step, skill })
    else if (r.load) parts.push({ kind: 'unseen', test: await r.load(), step, skill })
    else if (step.link.type === 'dictation') {
      const { DICTATION, plainWord } = await import('../../learn/learnData')
      const set = DICTATION.find(x => x.id === step.link.set)
      parts.push({ kind: 'dictation', title: set.title, words: set.words.map(plainWord), step, skill })
    } else if (r.sheetLink) {
      const { itemsFor } = await import('../planner/LessonSheets')
      const made = await itemsFor(r.sheetLink, r.sheetGrade || o.grade, session.level, `#${session.index}`).catch(() => null)
      const Sheets = made?.kind === 'math' ? (await import('../../math/MathPages')).PrintSheets : null
      if (made) parts.push({ ...made, Math: Sheets, items: made.items.slice(0, exerciseCount(o.minutes, session.level)), open: (made.open || []).slice(0, 1), step, skill })
      else parts.push({ kind: 'task', to: r.to, label: r.label, step, skill })
    } else parts.push({ kind: 'task', to: r.to, label: r.label, step, skill })
  }
  return parts
}

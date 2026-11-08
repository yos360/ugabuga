// English pages of this area: pure data, read by englishRoutes.js, the sitemap scripts and the hubs.
import { RC_ROOT, RC_LEVELS, rcLevel, rcLevelHref, rcHref } from './levels.js'
import { RC_META } from './meta.js'

const levels = RC_LEVELS.map(L => {
  const n = RC_META.filter(t => t.level === L.id).length
  return {
    path: rcLevelHref(L),
    title: `${L.name} reading comprehension passages with questions and answers`,
    description: `${n} free ${L.name} reading comprehension passages (${L.cefr}): ${L.about} Answers explained, exam timer and printable worksheets.`,
    emoji: '📝',
    counterpart: `/unseen/english/${L.path}`,
  }
})

const tests = RC_META.map(t => {
  const L = rcLevel(t.level)
  return {
    path: rcHref(t),
    title: `${t.title} - ${L.name} reading comprehension with answers`,
    description: `${t.summary} ${t.words} words, ${t.questions} questions with an explanation for every answer, an exam mode with a timer and a printable worksheet.`,
    emoji: '📝',
    // The same test lives at /unseen/english/<slug>; pairing all of them would add a few KB to the
    // entry bundle (englishLinks.js), so only the hub and the level pages are paired.
    unpairedReason: 'Test pages are paired through their level page to keep englishLinks.js small.',
  }
})

export const COMPREHENSION_PAGES = [
  {
    path: RC_ROOT,
    title: 'Free reading comprehension passages with questions and answers',
    description: `${RC_META.length} original reading comprehension passages from Grade 3 to Bagrut Module G, with multiple-choice and open questions, an explanation for every answer, read-aloud, an exam timer and printable worksheets.`,
    emoji: '📝',
    counterpart: '/unseen/english',
  },
  ...levels,
  ...tests,
]

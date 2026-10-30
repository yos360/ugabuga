// English grammar lessons (/learn/english-grammar), grouped by grade band.
//
// Topic shape (each band file in ./englishGrammar/):
//   slug, band, emoji, title (Hebrew), en (English name), rule (one-line summary)
//   seoTitle, seoDesc, intro
//   blocks:   [{ h, p?: [text], table?: { head: [..], rows: [[..]] }, ex?: [[english, hebrew]] }]
//   mistakes: [[wrong, right, why]]
//   quiz:     [[sentence, [correct, wrong, wrong, wrong], explanation, hebrewPrompt?]]
//             (sentence may be '' when the options are whole sentences)
//   drill:    [[sentence with ___, answer]]  — the worksheet's fill-in part
//   faq:      [{ q, a }]
// The exported topics turn the quiz into { s, p, options, answer, exp } with the correct option moved
// to a fixed (per question) position, so the page, the worksheet and its answer key always agree.
import { G34 } from './englishGrammar/g34.js'
import { G56 } from './englishGrammar/g56.js'
import { G79 } from './englishGrammar/g79.js'
import { G1012 } from './englishGrammar/g1012.js'

export const GRAMMAR_PATH = '/learn/english-grammar'

export const GRAMMAR_BANDS = [
  { id: 'g3-4', label: 'כיתות ג׳–ד׳', short: 'ג׳–ד׳', emoji: '🌱', desc: 'הצעדים הראשונים: a/an, רבים, am/is/are, have got, can ומילות יחס.' },
  { id: 'g5-6', label: 'כיתות ה׳–ו׳', short: 'ה׳–ו׳', emoji: '🌿', desc: 'הזמנים הבסיסיים, שאלות, השוואות ו-much/many.' },
  { id: 'g7-9', label: 'כיתות ז׳–ט׳', short: 'ז׳–ט׳', emoji: '🌳', desc: 'עבר מתמשך, עתיד, Present Perfect, מודאלים, סביל ומשפטי תנאי.' },
  { id: 'g10-12', label: 'כיתות י׳–י״ב ובגרות', short: 'י׳–י״ב', emoji: '🎓', desc: 'דיבור עקיף, משפטי זיקה, מילות קישור לכתיבה ו-ing או to.' },
]

export function placeGrammarQuiz(slug, quiz) {
  return quiz.map(([s, opts, exp, p], i) => {
    const pos = [...`${slug}-${i}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 4
    const options = opts.slice(1)
    options.splice(pos, 0, opts[0])
    return { s, p: p || '', options, answer: pos, exp }
  })
}

const RAW = [...G34, ...G56, ...G79, ...G1012]
export const GRAMMAR_TOPICS = RAW.map(t => ({ ...t, quiz: placeGrammarQuiz(t.slug, t.quiz) }))
export const grammarBySlug = slug => GRAMMAR_TOPICS.find(t => t.slug === slug)
export const grammarHref = t => `${GRAMMAR_PATH}/${t.slug}`
export const bandOf = t => GRAMMAR_BANDS.find(b => b.id === t.band)
export const topicsInBand = id => GRAMMAR_TOPICS.filter(t => t.band === id)

const BOOKS = { Genesis: 'בראשית', Exodus: 'שמות', Leviticus: 'ויקרא', Numbers: 'במדבר', Deuteronomy: 'דברים' }
export const QUIZ_MODES = [
  ['students', 'לתלמידים — שאלות בלבד'],
  ['pack', 'דפי תלמידים + דף מורה אחד'],
  ['upside', 'תשובות הפוכות בתחתית'],
  ['inline', 'שאלות ותשובות רגילות'],
  ['teacher', 'רק דף תשובות למורה / להורה'],
]
export const sourceHref = ref => `https://www.sefaria.org/${ref.replaceAll(' ', '.').replaceAll(':', '.')}?lang=he`
export const sourceLabel = ref => ref.replace(/^[A-Za-z]+/, book => BOOKS[book] || book)

export function buildParashaQuiz(portions, short = false) {
  if (!portions?.length) return null
  // A doubled portion gets a balanced ten-question sheet, not twenty cramped questions.
  const count = portions.length > 1 ? (short ? 3 : 5) : (short ? 5 : 10)
  return {
    title: portions.map(p => p.name).join(' – '),
    portions,
    questions: portions.flatMap(p => p.quizQuestions.slice(0, count).map((q, i) => ({ ...q, portion: p.name, challenge: portions.length === 1 && i >= 5 }))),
    discussions: portions.map(p => p.discussion),
  }
}

export function quizPrintPlan(mode, copies) {
  const count = Math.max(1, Math.min(40, Math.floor(Number(copies) || 1)))
  if (mode === 'teacher') return [{ kind: 'teacher', key: 'teacher' }]
  const kind = mode === 'pack' ? 'students' : mode
  const sheets = Array.from({ length: count }, (_, i) => ({ kind, key: `student-${i}` }))
  return mode === 'pack' ? [...sheets, { kind: 'teacher', key: 'teacher' }] : sheets
}

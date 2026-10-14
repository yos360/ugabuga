import { TRAFFIC_SIGNS } from './signsData.js'

export const AGE_GROUPS = [
  { id: '6-9', label: 'גילאי 6–9', count: 8, kind: 'identify', intro: 'מזהים צורות וסמלים יחד עם מבוגר. שמונה שאלות קצרות, בלי הגבלת זמן.', numbers: ['135','136','137','144','150','226','227','301','302','306','402','412','413'] },
  { id: '10-12', label: 'גילאי 10–12', count: 10, kind: 'scenario', intro: 'עשר שאלות על הליכה בטוחה, שבילים והבדלים בין תמרורים.', numbers: ['109','121','122','135','136','137','144','145','150','226','227','301','302','306','402','412','413','623'] },
  { id: '13-15', label: 'גילאי 13–15', count: 15, kind: 'scenario', intro: 'חמש עשרה שאלות על רכיבה, כיווני נסיעה וזכות קדימה. קבוצת הגיל אינה אישור לרכוב על כלי רכב שמוגבל בחוק.', numbers: ['102','103','109','114','117','121','122','135','137','144','145','150','203','204','205','213','214','215','226','227','301','302','303','306','307','308','401','402','412','413','618','623'] },
  { id: '16-plus', label: 'גיל 16 ומעלה', count: 20, kind: 'scenario', intro: 'עשרים שאלות תרגול בתמרורים, כולל הגבלות, זכות קדימה ונהיגה. זהו תרגול ממוקד, ולא מבחן התיאוריה הרשמי המלא.', numbers: TRAFFIC_SIGNS.map(s => s.number) },
]
export function shuffle(items, random = Math.random) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]] }
  return result
}
export function makeQuestions(pool, count, kind = 'identify', random = Math.random) {
  return shuffle(pool, random).slice(0, count).map(sign => {
    const raw = kind === 'identify'
      ? [{ text: sign.name, correct: true }, ...shuffle(TRAFFIC_SIGNS.filter(s => s.number !== sign.number), random).slice(0, 2).map(s => ({ text: s.name, correct: false }))]
      : sign.question.options.map((text, index) => ({ text, correct: index === sign.question.answer }))
    const options = shuffle(raw, random)
    return { sign, prompt: kind === 'identify' ? 'איזה תמרור מופיע בתמונה?' : sign.question.prompt, options: options.map(o => o.text), answer: options.findIndex(o => o.correct), explanation: kind === 'identify' ? sign.meaning : sign.question.explanation }
  })
}
export function makeAgeExam(id, random = Math.random) {
  const age = AGE_GROUPS.find(a => a.id === id)
  if (!age) return []
  return makeQuestions(TRAFFIC_SIGNS.filter(s => age.numbers.includes(s.number)), age.count, age.kind, random)
}
// Sequential sets cover a category without repeats until every included sign has been used.
export function flashcardSet(pool, index, size = 6) {
  if (!pool.length) return []
  const offset = (index * size) % pool.length
  return Array.from({ length: Math.min(size, pool.length) }, (_, i) => pool[(offset + i) % pool.length])
}

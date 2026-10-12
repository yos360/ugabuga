// Pure helpers for the calculator pages (src/pages/calc).

export function ageParts(birth, today) {
  let y = today.getFullYear() - birth.getFullYear(), m = today.getMonth() - birth.getMonth(), d = today.getDate() - birth.getDate()
  if (d < 0) { m--; d += new Date(today.getFullYear(), today.getMonth(), 0).getDate() }
  if (m < 0) { y--; m += 12 }
  const days = Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(birth.getFullYear(), birth.getMonth(), birth.getDate())) / 86400000)
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < new Date(today.getFullYear(), today.getMonth(), today.getDate())) next = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate())
  const toNext = Math.round((Date.UTC(next.getFullYear(), next.getMonth(), next.getDate()) - Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000)
  return { y, m, d, days, toNext, nextAge: next.getFullYear() - birth.getFullYear() }
}

// Gematria: standard values; final letters count like regular ones.
const VAL = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90, ק: 100, ר: 200, ש: 300, ת: 400 }
export function gematriaOf(text) {
  const letters = [...String(text).normalize('NFC').replace(/[֑-ׇ]/g, '')].filter(c => VAL[c])
  return { letters: letters.map(c => [c, VAL[c]]), total: letters.reduce((s, c) => s + VAL[c], 0) }
}

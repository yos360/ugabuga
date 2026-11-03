// Grades א׳–ט׳ a booklet fits, read from its `audience`: "כיתה ה׳", "כיתות א׳–ג׳", "גן עד כיתה ב׳".
export const GRADES = 'אבגדהוזחט'
const g = letter => GRADES.indexOf(letter) + 1
export function gradesOf(audience = '') {
  const span = audience.match(/([א-ט])׳\s*[–-]\s*([א-ט])׳/), upTo = audience.match(/עד כיתה ([א-ט])׳/)
  if (span) return Array.from({ length: g(span[2]) - g(span[1]) + 1 }, (_, i) => g(span[1]) + i)
  if (upTo) return Array.from({ length: g(upTo[1]) }, (_, i) => i + 1)
  return [...audience.matchAll(/(?:^|[^א-ת])([א-ט])׳/g)].map(m => g(m[1]))
}

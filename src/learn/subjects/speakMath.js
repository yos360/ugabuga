// Turns numbers and exercises into natural, speakable Hebrew for the adapted exams' read-aloud:
// "7 + 5" → "שבע ועוד חמש", "12 − 4" → "שתים עשרה פחות ארבע", "6 × 3" → "שש כפול שלוש", "8 : 2" → "שמונה לחלק לשתיים".
// Counting numbers use the feminine form (the one used for arithmetic); thousands use the masculine one.

const F = ['אפס', 'אחת', 'שתיים', 'שלוש', 'ארבע', 'חמש', 'שש', 'שבע', 'שמונה', 'תשע', 'עשר']
const M = ['אפס', 'אחד', 'שניים', 'שלושה', 'ארבעה', 'חמישה', 'שישה', 'שבעה', 'שמונה', 'תשעה', 'עשרה']
const TEENS_F = ['', 'אחת עשרה', 'שתים עשרה', 'שלוש עשרה', 'ארבע עשרה', 'חמש עשרה', 'שש עשרה', 'שבע עשרה', 'שמונה עשרה', 'תשע עשרה']
const TEENS_M = ['', 'אחד עשר', 'שנים עשר', 'שלושה עשר', 'ארבעה עשר', 'חמישה עשר', 'שישה עשר', 'שבעה עשר', 'שמונה עשר', 'תשעה עשר']
const TENS = ['', '', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים', 'שבעים', 'שמונים', 'תשעים']
const HUNDREDS = ['', 'מאה', 'מאתיים', 'שלוש מאות', 'ארבע מאות', 'חמש מאות', 'שש מאות', 'שבע מאות', 'שמונה מאות', 'תשע מאות']
const THOUSANDS = ['', 'אלף', 'אלפיים', 'שלושת אלפים', 'ארבעת אלפים', 'חמשת אלפים', 'ששת אלפים', 'שבעת אלפים', 'שמונת אלפים', 'תשעת אלפים', 'עשרת אלפים']

const UNITS = { 'סמ״ר': 'סנטימטרים רבועים', 'ס״מ': 'סנטימטרים', 'מ״מ': 'מילימטרים', 'מ״ל': 'מיליליטרים', 'ק״ג': 'קילוגרמים', 'ק״מ': 'קילומטרים', 'מ׳': 'מטרים' }

const joinAnd =parts => parts.filter(Boolean).map((p, i) => (i === 0 ? p : `ו${p}`)).join(' ')

// 0–99 as words. masc = masculine forms.
function under100(n, masc) {
  const ones = masc ? M : F
  if (n <= 10) return ones[n]
  if (n < 20) return (masc ? TEENS_M : TEENS_F)[n - 10]
  const t = Math.floor(n / 10), o = n % 10
  return o ? `${TENS[t]} ו${ones[o]}` : TENS[t]
}
function under1000(n, masc) {
  const h = Math.floor(n / 100), rest = n % 100
  return joinAnd([HUNDREDS[h], rest ? under100(rest, masc) : ''])
}

// A whole number as Hebrew words (up to 999,999,999; longer ones are read digit by digit).
export function numberToHebrew(n, { masc = false } = {}) {
  n = Math.trunc(Number(n))
  if (!Number.isFinite(n)) return ''
  if (n < 0) return `מינוס ${numberToHebrew(-n, { masc })}`
  if (n >= 1e9) return String(n).split('').map(d => F[Number(d)]).join(' ')
  if (n < 100) return under100(n, masc)
  if (n < 1000) return under1000(n, masc)
  const parts = []
  const m = Math.floor(n / 1e6), th = Math.floor((n % 1e6) / 1000), rest = n % 1000
  if (m) parts.push(m === 1 ? 'מיליון' : m === 2 ? 'שני מיליון' : `${under1000(m, true)} מיליון`)
  if (th) parts.push(th <= 10 ? THOUSANDS[th] : `${under1000(th, true)} אלף`)
  if (rest) parts.push(under1000(rest, masc))
  return joinAnd(parts)
}

// "73.8" → "שבעים ושלוש נקודה שמונה"
export function decimalToHebrew(str, opts) {
  const [i, d] = String(str).split('.')
  const whole = numberToHebrew(Number(i), opts)
  return d === undefined ? whole : `${whole} נקודה ${d.split('').map(c => F[Number(c)]).join(' ')}`
}

// Any text with digits and arithmetic signs → speakable Hebrew.
export function speakMath(text) {
  let s = String(text ?? '')
  const ratio = s.includes('יחס')
  s = s.replace(/[‎‏⁦-⁩]/g, '')
  s = s.replace(/([א-ת])-(?=\d)/g, '$1') // "ל-3" → "ל3" → "לשלוש" once the number is spoken
  s = s.replace(/(\d),(\d{3})(?!\d)/g, '$1$2')
  s = s.replace(/(\d+(?:\.\d+)?)\s*₪/g, (_m, n) => (n === '1' ? 'שקל אחד' : n === '2' ? 'שני שקלים' : `${n} שקלים`))
  s = s.replace(/(?<![א-ת])(סמ״ר|ס״מ|מ״מ|מ״ל|ק״ג|ק״מ|מ׳)(?![א-ת])/g, m => UNITS[m])
  s = s.replace(/(\d)\s*:\s*(?=\d)/g, ratio ? '$1 ל' : '$1 לחלק ל') // 8:2, or a ratio 7:1 ("7 ל-1")
  s = s.replace(/(\d|\))\s*[−–-]\s*(?=\d|\()/g, '$1 פחות ')
  s = s.replace(/(^|[=(+×÷:,\s])[−–-]\s*(?=\d)/g, '$1מינוס ')
  // a "?" that stands for the missing number: after an operator/equals, before one, or at the end of a list
  s = s.replace(/\?/g, (m, off, str) => {
    const before = str.slice(0, off).trimEnd().slice(-1), after = str.slice(off + 1).trimStart().charAt(0)
    if (before === ',') return 'ומה בא אחר כך'
    if ((before && '+−×÷:=-('.includes(before)) || (after && '+−×÷:='.includes(after))) return 'כמה'
    return m
  })
  s = s.replace(/(\d+)(?:\.(\d+))?/g, (_m, a, b) => decimalToHebrew(b === undefined ? a : `${a}.${b}`))
  s = s.replace(/\+/g, ' ועוד ').replace(/[×⋅·]/g, ' כפול ').replace(/\s*÷\s*/g, ' לחלק ל')
  s = s.replace(/=/g, ' שווה ').replace(/%/g, ' אחוז').replace(/[()]/g, ', ')
  return s.replace(/\s+/g, ' ').replace(/\s+([,.:!?])/g, '$1').replace(/^[,\s]+/, '').trim()
}

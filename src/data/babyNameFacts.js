// Computed, per-name facts for /baby-names pages (SEO thin-content pass, 2026-11).
// Everything here is derived from babyNames.js / babyNameThemes.js: letters, gematria, endings,
// names hidden inside other names, the biblical book cited in the data, and meaning themes.
// No new claims about meanings or origins are made here. Pure JS (no JSX) so node tests can import it.
// Imported only by the lazy /baby-names page chunk.
import { BABY_NAMES, GENDERS, LETTER_NAMES, normalizeHebrew, matchesGender, nameLength, similarNames, filterNames } from './babyNames.js'
import { NAME_THEMES } from './babyNameThemes.js'

// ── letters & gematria (standard values; final letters count like the regular form) ──
export const GEMATRIA = { א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, כ: 20, ל: 30, מ: 40, נ: 50, ס: 60, ע: 70, פ: 80, צ: 90, ק: 100, ר: 200, ש: 300, ת: 400 }
const FIN = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const FINAL_LABEL = { ך: 'כ"ף סופית', ם: 'מ"ם סופית', ן: 'נו"ן סופית', ף: 'פ"א סופית', ץ: 'צד"י סופית' }

export const letterValue = c => GEMATRIA[FIN[c] || c] || 0
export const letterLabel = c => FINAL_LABEL[c] || LETTER_NAMES[c] || c
export const nameChars = name => [...String(name)].filter(c => letterValue(c))
export const gematria = name => nameChars(name).reduce((s, c) => s + letterValue(c), 0)
export const gematriaBreakdown = name => nameChars(name).map(c => `${c} (${letterValue(c)})`).join(' + ')

const list = (arr, max = arr.length) => {
  const a = arr.slice(0, max)
  const lastOne = String(a[a.length - 1])
  return a.length <= 1 ? a.join('') : `${a.slice(0, -1).join(', ')} ו${/^[א-ת]/.test(lastOne) ? '' : '־'}${lastOne}`
}
const names = arr => arr.map(o => o.name)
const byHe = (a, b) => a.name.localeCompare(b.name, 'he')
// Other names that suit the same child: a girl's page offers girls' + unisex names, unisex pages offer everything.
const fits = (n, o) => o !== n && (n.gender === 'u' || matchesGender(o, n.gender))

// Letters that appear more than once, e.g. [['י', 2]].
export function repeatedLetters(name) {
  const counts = new Map()
  for (const c of nameChars(name)) { const k = FIN[c] || c; counts.set(k, (counts.get(k) || 0) + 1) }
  return [...counts].filter(([, v]) => v > 1)
}
export const finalLetters = name => nameChars(name).filter(c => FIN[c])

export const sameGematria = n => BABY_NAMES.filter(o => o !== n && gematria(o.name) === gematria(n.name)).sort(byHe)

// Names whose letters appear, in order and in a row, inside this name (and the reverse).
export const hiddenNames = n => BABY_NAMES.filter(o => o !== n && normalizeHebrew(n.name).includes(normalizeHebrew(o.name))).sort((a, b) => nameLength(b.name) - nameLength(a.name) || byHe(a, b))
export const containingNames = n => BABY_NAMES.filter(o => o !== n && normalizeHebrew(o.name).includes(normalizeHebrew(n.name))).sort(byHe)

export const nameEnding = n => n.name.slice(-2)
export const sameEnding = n => BABY_NAMES.filter(o => fits(n, o) && nameLength(o.name) > 2 && nameLength(n.name) > 2 && normalizeHebrew(o.name).slice(-2) === normalizeHebrew(n.name).slice(-2)).sort(byHe)
export const sameStart = n => BABY_NAMES.filter(o => fits(n, o) && normalizeHebrew(o.name).slice(0, 2) === normalizeHebrew(n.name).slice(0, 2)).sort(byHe)

// Feminine/masculine pair, only where the meaning text in the data says so ("צורת נקבה של X").
const FEM_OF = /צורת (?:ה)?נקבה של (?:השם )?([א-ת]+)/
export function counterpart(n) {
  if (n.gender === 'f') {
    const m = n.meaning.match(FEM_OF)
    return m ? BABY_NAMES.find(o => o.name === m[1] && o.gender !== 'f') || null : null
  }
  if (n.gender === 'm') return BABY_NAMES.find(o => o.gender === 'f' && (o.meaning.match(FEM_OF) || [])[1] === n.name) || null
  return null
}

// ── Tanakh book from the data's source note ──
const BOOKS = [
  ['בראשית', 'תורה'], ['שמות', 'תורה'], ['ויקרא', 'תורה'], ['במדבר', 'תורה'], ['דברים', 'תורה'],
  ['יהושע', 'נביאים'], ['שופטים', 'נביאים'], ['שמואל', 'נביאים'], ['מלכים', 'נביאים'], ['ישעיהו', 'נביאים'], ['ירמיהו', 'נביאים'], ['יחזקאל', 'נביאים'],
  ['הושע', 'נביאים'], ['יואל', 'נביאים'], ['עמוס', 'נביאים'], ['עובדיה', 'נביאים'], ['יונה', 'נביאים'], ['מיכה', 'נביאים'], ['נחום', 'נביאים'],
  ['חבקוק', 'נביאים'], ['צפניה', 'נביאים'], ['חגי', 'נביאים'], ['זכריה', 'נביאים'], ['מלאכי', 'נביאים'],
  ['תהילים', 'כתובים'], ['משלי', 'כתובים'], ['איוב', 'כתובים'], ['שיר השירים', 'כתובים'], ['רות', 'כתובים'], ['איכה', 'כתובים'], ['קהלת', 'כתובים'],
  ['אסתר', 'כתובים'], ['דניאל', 'כתובים'], ['עזרא', 'כתובים'], ['נחמיה', 'כתובים'], ['דברי הימים', 'כתובים'],
]
const MEGILLOT = ['שיר השירים', 'רות', 'איכה', 'קהלת', 'אסתר']
export function bibleBook(source) {
  const s = String(source || '').replace(/^(ספר|מגילת)\s+/, '').trim()
  const hit = BOOKS.find(([b]) => s === b || s.startsWith(b + ' '))
  if (!hit) return null
  const [book, part] = hit
  return { book, part, label: `${MEGILLOT.includes(book) ? 'מגילת' : 'ספר'} ${book}` }
}
export function sameBook(n) {
  const b = n.origin === 'תנ"כי' && bibleBook(n.source)
  if (!b) return []
  return BABY_NAMES.filter(o => fits(n, o) && o.origin === 'תנ"כי' && bibleBook(o.source)?.book === b.book).sort(byHe)
}

export const nameThemes = n => NAME_THEMES.filter(t => t.names.includes(n.slug)).map(t => ({ slug: t.slug, label: t.h1 || t.title, emoji: t.emoji }))

const ORIGIN_PHRASE = { 'עברי': 'שם עברי', 'תנ"כי': 'שם מקראי', 'ארמי': 'שם ממקור ארמי', 'לועזי': 'שם ממקור לועזי', 'יידיש': 'שם ממקור יידיש' }
const genderShort = g => g === 'f' ? 'לבנות' : g === 'm' ? 'לבנים' : 'לבנים ולבנות'

// ── page text ──
// One paragraph built only from computed facts; it differs for every name.
export function nameIntro(n) {
  const chars = nameChars(n.name)
  const g = gematria(n.name)
  const rep = repeatedLetters(n.name)
  const fin = finalLetters(n.name)
  const sameLetter = filterNames(BABY_NAMES, { gender: n.gender === 'u' ? '' : n.gender, letter: n.letter }).length
  const parts = [
    `${n.name} (באנגלית ${n.en}) הוא ${ORIGIN_PHRASE[n.origin] || 'שם'} ${genderShort(n.gender)}.`,
    `יש בו ${chars.length} אותיות — ${list(chars.map(letterLabel))} — והערך שלו בגימטריה הוא ${g}.`,
    rep.length === 1 ? `האות ${rep[0][0]} מופיעה בשם ${rep[0][1] === 2 ? 'פעמיים' : `${rep[0][1]} פעמים`}.`
      : rep.length ? `האותיות ${list(rep.map(([c]) => c))} מופיעות בשם יותר מפעם אחת.` : `כל אות בשם מופיעה בו פעם אחת בלבד.`,
    fin.length ? `בסוף השם יש אות סופית — ${letterLabel(fin[fin.length - 1])} — וזו הזדמנות טובה לתרגל עם הילד את צורת האות המיוחדת.` : '',
    `ברשימה שלנו יש ${sameLetter} ${n.gender === 'u' ? 'שמות' : GENDERS[n.gender].title} שמתחילים באות ${LETTER_NAMES[n.letter]}, והשם ${n.name} הוא אחד מהם.`,
  ]
  return parts.filter(Boolean).join(' ')
}

// Tips that depend on the name's own properties (length, ending, origin, gender, spelling).
export function nameTips(n) {
  const len = nameLength(n.name)
  const last = nameChars(n.name).at(-1)
  const tips = []
  if (len <= 3) tips.push(`${n.name} הוא שם קצר של ${len} אותיות. שם קצר קל במיוחד לילד צעיר לכתוב בעצמו, והוא משתלב היטב עם שם משפחה ארוך או עם שם שני.`)
  else if (len >= 6) tips.push(`${n.name} הוא שם ארוך — ${len} אותיות. משמות ארוכים נוצרים לא פעם כינויי חיבה קצרים, ולכן כדאי לחשוב מראש איזה קיצור עשוי להיווצר ואם הוא מוצא חן בעיניכם.`)
  else tips.push(`עם ${len} אותיות, ${n.name} הוא שם באורך בינוני — לא קצר במיוחד ולא ארוך במיוחד לכתיבה בכתב יד של ילד שרק לומד לכתוב.`)
  tips.push(`השם מסתיים באות ${letterLabel(last)}. אם שם המשפחה שלכם מתחיל באותו צליל, שני השמות עלולים להיבלע זה בזה — אמרו "${n.name}" ואחריו את שם המשפחה כמה פעמים ברצף, ושמעו איך זה נשמע.`)
  tips.push(`ראשי התיבות יתחילו באות ${LETTER_NAMES[n.letter]}. כתבו את האות ${n.letter} לצד האות הראשונה של שם המשפחה (ושל שם שני, אם יש) ובדקו שלא נוצרה מילה שלא הייתם רוצים.`)
  if (n.origin === 'תנ"כי' && n.source) tips.push(`${n.name} הוא שם מקראי (${n.source}). כשהילד או הילדה יגדלו, אפשר לקרוא יחד את הפסוקים שבהם השם מופיע ולספר להם מאיפה הגיע השם שלהם.`)
  else if (n.origin === 'לועזי' || n.origin === 'יידיש') tips.push(`${n.name} הוא ${ORIGIN_PHRASE[n.origin]}. כדאי לבדוק איך הוא נשמע גם בפי דוברי עברית וגם בפי בני משפחה שמדברים שפות אחרות, ולהחליט על כתיב עברי אחד.`)
  if (n.gender === 'u') tips.push(`${n.name} ניתן גם לבנים וגם לבנות, ולכן בטפסים ובהזמנות לא תמיד יידעו מראש אם מדובר בבן או בבת. יש הורים שזה בדיוק מה שהם אוהבים בשם.`)
  if (n.tags.includes('פופולרי')) tips.push(`לפי נתוני הלמ"ס על ילידי 2024, ${n.name} היה בין עשרת השמות הנפוצים בקרב תינוקות יהודים. אם חשוב לכם שם ייחודי, צפו לפגוש עוד ילדים בשם הזה בגן ובכיתה.`)
  const en = n.en.toLowerCase()
  const spell = []
  if (en.includes('ch')) spell.push('הצירוף ch מייצג כאן את הצליל ח, ודוברי אנגלית לא תמיד יקראו אותו כך')
  if (en.includes('tz')) spell.push('הצירוף tz מייצג את האות צ')
  if (en.includes('sh')) spell.push('הצירוף sh מייצג את הצליל ש')
  tips.push(`באנגלית כותבים ${n.en} — ${n.en.length} אותיות לטיניות${spell.length ? `; ${list(spell)}` : ''}. בחרו כתיב אחד והקפידו עליו בדרכון, בתעודות ובמסמכים.`)
  return tips
}

// FAQ for the name page: the data FAQ (meaning, gender, spelling/Tanakh) plus computed questions.
export function nameExtraFaq(n) {
  const g = gematria(n.name)
  const same = sameGematria(n)
  const chars = nameChars(n.name)
  const sim = similarNames(n, 6)
  const end = sameEnding(n)
  return [
    { q: `מה הגימטריה של השם ${n.name}?`, a: `בספירה הרגילה, שבה לאות סופית יש אותו ערך כמו לאות הרגילה, הגימטריה של ${n.name} היא ${g}: ${gematriaBreakdown(n.name)}.${same.length ? ` גם ל${list(names(same), 4)} יש ברשימה שלנו אותה גימטריה.` : ''}` },
    { q: `כמה אותיות יש בשם ${n.name}?`, a: `בשם ${n.name} יש ${chars.length} אותיות: ${list(chars.map(letterLabel))}. בכתיב האנגלי ${n.en} יש ${n.en.length} אותיות.` },
    { q: `אילו שמות דומים לשם ${n.name}?`, a: `שמות קרובים ל${n.name} — לפי מין, מקור ואופי — הם ${list(names(sim))}.${end.length ? ` שמות נוספים שמסתיימים כמו ${n.name} ב־"${nameEnding(n)}": ${list(names(end), 5)}.` : ''}` },
  ]
}

// ── letter pages ──
const ORIGIN_COUNT = { 'עברי': ['שם עברי אחד', 'שמות עבריים'], 'תנ"כי': ['שם מקראי אחד', 'שמות מקראיים'], 'ארמי': ['שם ארמי אחד', 'שמות ממקור ארמי'], 'לועזי': ['שם לועזי אחד', 'שמות לועזיים'], 'יידיש': ['שם אחד ביידיש', 'שמות ממקור יידיש'] }
export function letterFacts(gender, letter, items) {
  const byOrigin = Object.keys(ORIGIN_COUNT).map(o => [o, items.filter(n => n.origin === o).length]).filter(([, c]) => c)
  const lens = items.map(n => nameLength(n.name))
  const min = Math.min(...lens), max = Math.max(...lens)
  const shortest = items.filter(n => nameLength(n.name) === min).map(n => n.name)
  const longest = items.filter(n => nameLength(n.name) === max).map(n => n.name)
  const uni = items.filter(n => n.gender === 'u').map(n => n.name)
  const withFinal = items.filter(n => finalLetters(n.name).length).map(n => n.name)
  const avg = (lens.reduce((a, b) => a + b, 0) / lens.length).toFixed(1).replace(/\.0$/, '')
  const title = GENDERS[gender].title
  const text = [
    `מתוך ${items.length} ${title} באות ${letter}: ${list(byOrigin.map(([o, c]) => c === 1 ? ORIGIN_COUNT[o][0] : `${c} ${ORIGIN_COUNT[o][1]}`))}.`,
    `${shortest.length > 1 ? 'הקצרים ביותר הם' : 'הקצר ביותר הוא'} ${list(shortest, 5)} (${min} אותיות), ו${longest.length > 1 ? 'הארוכים ביותר הם' : 'הארוך ביותר הוא'} ${list(longest, 5)} (${max} אותיות); בממוצע יש בכל שם ${avg} אותיות.`,
    uni.length ? `${uni.length === 1 ? `השם ${uni[0]} מתאים` : `${uni.length} מהשמות — ${list(uni, 6)} — מתאימים`} גם לבנים וגם לבנות.` : `באות ${letter} אין ברשימה שמות יוניסקס.`,
    `ערך האות ${letter} בגימטריה הוא ${GEMATRIA[letter]}${withFinal.length ? `, ו${withFinal.length === 1 ? `בשם ${withFinal[0]} יש` : `בשמות ${list(withFinal, 6)} יש`} גם אות סופית` : ''}.`,
  ]
  const faq = { q: `מה השם הקצר ביותר ומה הארוך ביותר ב${title} באות ${letter}?`, a: `הקצר ביותר ברשימה: ${list(shortest, 5)} (${min} אותיות). הארוך ביותר: ${list(longest, 5)} (${max} אותיות).` }
  return { text: text.join(' '), faq }
}

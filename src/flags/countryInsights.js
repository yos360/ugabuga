// Per-country facts computed from the sourced data already in the site
// (countryDetails.js descriptions/neighbors, flagsData.js names/capitals/continents).
// Nothing here adds a new claim: colours and symbols are read from the Hebrew
// Factbook summary of each flag, counts and lists are computed from the country list.
import { WORLD_COUNTRIES, COUNTRY_BY_CODE, CONTINENT_BY_SLUG, FAMOUS_FLAGS, FLAG_NOTES, countriesOf, byHebrewName } from './flagsData.js'
import { COUNTRY_DETAILS } from './countryDetails.js'

// Hebrew prefixes (ו, ב, ל, ה, ש, מ) may stick to a colour word; maqaf/space/punctuation separate words.
// (ש/מ are left out: they create false hits such as "למעלה" → "עלה" or "מוצלבים" → "צלב").
const B = '(?:^|[\\s,.:;״"(־-])[ובלה]{0,2}'
const E = '(?=$|[\\s,.:;״")־-])'
const COLOR_WORDS = [
  ['red', 'אדום', 'אדו(?:ם|מים|מה|מות)'],
  ['white', 'לבן', 'לב(?:ן|נים|נה|נות)'],
  ['blue', 'כחול', 'כחו(?:ל|לים|לה|לות)'],
  ['lightblue', 'תכלת', 'תכלת'],
  ['green', 'ירוק', 'ירו(?:ק|קים|קה|קות)'],
  ['yellow', 'צהוב', 'צהו(?:ב|בים|בה|בות)'],
  ['black', 'שחור', 'שחו(?:ר|רים|רה|רות)'],
  ['orange', 'כתום', 'כת(?:ום|ומה|ומים|ומות)'],
  ['gold', 'זהב', 'זה(?:ב|וב|ובים|ובה|ובות)'],
  ['maroon', 'בורדו', 'בורדו'],
  ['saffron', 'זעפרן', 'זעפרן'],
  ['turquoise', 'טורקיז', 'טורקיז'],
  ['copper', 'נחושת', 'נחושת'],
]
const COLOR_RE = COLOR_WORDS.map(([key, , root]) => [key, new RegExp(B + '(?:' + root + ')' + E)])
export const COLOR_NAME = Object.fromEntries(COLOR_WORDS.map(([key, he]) => [key, he]))

const SYMBOL_WORDS = [
  ['star', 'כוכב', 'כוכב(?:ים)?'],
  ['crescent', 'סהר', 'סהר'],
  ['sun', 'שמש', 'שמש'],
  ['moon', 'ירח', 'ירח'],
  ['cross', 'צלב', 'צלב(?:ים)?'],
  ['bird', 'ציפור או עוף', 'עיט|ציפור|תוכי|עגור|פריגטה|קצאל'],
  ['triangle', 'משולש', 'משולש(?:ים)?'],
  ['circle', 'עיגול', 'עיגול|כדור|מעגל'],
  ['map', 'מפה', 'מפ(?:ה|ת)'],
  ['plant', 'צמח', 'ארז|עלה|ענף|ענפי|עץ|זית|שרך'],
  ['weapon', 'כלי נשק', 'חרב|חניתות|חנית|רובה|מצ׳טה'],
  ['writing', 'כתובת', 'כתובת|כתובות'],
  ['emblem', 'סמל או מגן', 'סמל|מגן'],
]
const SYMBOL_RE = SYMBOL_WORDS.map(([key, , root]) => [key, new RegExp(B + '(?:' + root + ')' + E)])
export const SYMBOL_NAME = Object.fromEntries(SYMBOL_WORDS.map(([key, he]) => [key, he]))

const cache = new Map()
export function flagFeatures(code) {
  if (cache.has(code)) return cache.get(code)
  const text = COUNTRY_DETAILS[code].description
  const unionJack = text.includes('דגל בריטניה')
  const colors = COLOR_RE.filter(([, re]) => re.test(text)).map(([k]) => k)
  // The Union Jack in the canton is red, white and blue even when the summary does not list them.
  if (unionJack) for (const k of ['red', 'white', 'blue']) if (!colors.includes(k)) colors.push(k)
  // "צלב הדרום" (the Southern Cross) is a group of stars, not a cross shape.
  const symbolText = text.replaceAll('צלב הדרום', 'קבוצת הכוכבים')
  const symbols = SYMBOL_RE.filter(([, re]) => re.test(symbolText)).map(([k]) => k)
  const stripes = /פס|פסים/.test(text) ? (/אופקי/.test(text) ? 'h' : /אנכי/.test(text) ? 'v' : 'any') : null
  const f = { colors, symbols, stripes, unionJack }
  cache.set(code, f)
  return f
}

export const heList = items => items.length < 2 ? (items[0] || '') : `${items.slice(0, -1).join(', ')} ו${items.at(-1)}`
export const colorNames = code => flagFeatures(code).colors.map(k => COLOR_NAME[k])

// Flags whose main colours overlap most (Jaccard), same continent first on ties.
export function similarColorFlags(c, limit = 6) {
  const mine = new Set(flagFeatures(c.code).colors)
  if (mine.size === 0) return []
  return WORLD_COUNTRIES.filter(p => p.code !== c.code).map(p => {
    const other = flagFeatures(p.code).colors
    const inter = other.filter(k => mine.has(k)).length
    return { p, score: inter / new Set([...mine, ...other]).size }
  }).filter(x => x.score >= 0.6)
    .sort((a, b) => b.score - a.score || (b.p.continent === c.continent) - (a.p.continent === c.continent) || byHebrewName(a.p, b.p))
    .slice(0, limit).map(x => ({ ...x.p, same: x.score === 1 }))
}

// Other flags in the same continent that share a symbol (e.g. a star or a crescent).
export function sameSymbolInContinent(c, symbol) {
  return countriesOf(c.continent).filter(p => p.code !== c.code && flagFeatures(p.code).symbols.includes(symbol))
}

// Countries (and capitals) that start with the same Hebrew letter — for "ארץ עיר".
export function letterFacts(c) {
  const letter = c.name[0]
  const countries = WORLD_COUNTRIES.filter(p => p.name[0] === letter).sort(byHebrewName)
  const capitals = [...new Set(WORLD_COUNTRIES.filter(p => p.capital[0] === letter).map(p => p.capital))].sort((a, b) => a.localeCompare(b, 'he'))
  return { letter, countries, capitals, capitalLetter: c.capital[0] }
}

const SYMBOL_TIPS = {
  star: n => `יש בדגל ${n} כוכב — סימן היכר מצוין. מסתכלים בתמונה ובודקים כמה כוכבים יש ובאיזו פינה הם נמצאים.`,
  crescent: n => `הסהר הוא סימן ההיכר של דגל ${n}. סהר מופיע בכמה דגלים, ולכן כדאי לזכור גם את צבע הרקע ואת מה שמופיע לידו.`,
  sun: n => `בדגל ${n} יש שמש. מציירים עיגול עם קרניים בצבע הנכון — וכבר זוכרים חצי דגל.`,
  moon: n => `בדגל ${n} מופיע ירח. שימו לב איפה הוא נמצא ביחס לשאר הסמלים.`,
  cross: n => `בדגל ${n} יש צלב. בודקים אם הוא ישר או אלכסוני, באיזה צבע הוא ואם הוא באמצע או זז לצד אחד.`,
  bird: n => `בדגל ${n} מופיע בעל כנף. נסו לתאר במילים מה הוא עושה ואיפה הוא עומד.`,
  triangle: n => `בדגל ${n} יש משולש. זוכרים באיזה צד הוא נמצא, באיזה צבע הוא ומה יש בתוכו.`,
  map: n => `על דגל ${n} מצוירת מפה — דבר נדיר מאוד בדגלים, ולכן קל לזכור אותו.`,
  plant: n => `בדגל ${n} יש צמח, עץ או ענף. זה פרט שקל לצייר ולזכור.`,
  writing: n => `בדגל ${n} יש כתובת. לא צריך לקרוא אותה כדי לזהות את הדגל — מספיק לזכור איפה היא ובאיזה צבע.`,
  circle: n => `בדגל ${n} יש צורה עגולה. בודקים באיזה צבע היא ואם היא בדיוק באמצע או זזה מעט הצידה.`,
  emblem: n => `בדגל ${n} יש סמל או מגן. לא צריך לזכור כל פרט בו — מספיק לזכור באיזה חלק של הדגל הוא נמצא ומה הצבע סביבו.`,
}

// "How to remember this flag" tips that depend on what is actually in the flag.
export function rememberTips(c) {
  const f = flagFeatures(c.code), tips = []
  const names = colorNames(c.code)
  if (names.length) tips.push(`הצבעים שבולטים בדגל ${c.name}: ${heList(names)}. ${names.length <= 3 ? 'רק ' + (names.length === 1 ? 'צבע אחד' : names.length === 2 ? 'שני צבעים' : 'שלושה צבעים') + ' — קל לומר אותם בעל פה.' : `${names.length} צבעים — כדאי לזכור קודם את הרקע ואחר כך את הפרטים.`}`)
  if (f.stripes === 'h') tips.push('הפסים אופקיים, כלומר שוכבים. אומרים את הצבעים מלמעלה למטה.')
  else if (f.stripes === 'v') tips.push('הפסים אנכיים, כלומר עומדים. אומרים את הצבעים מצד התורן (משמאל) לצד השני.')
  else if (f.stripes) tips.push('בדגל יש פסים. סופרים כמה פסים יש בתמונה ובודקים אם הם שוכבים, עומדים או אלכסוניים.')
  if (f.unionJack) {
    const others = WORLD_COUNTRIES.filter(p => p.code !== c.code && flagFeatures(p.code).unionJack).map(p => p.name)
    tips.push(`בפינת הדגל מופיע דגל בריטניה${others.length ? `, כמו בדגלים של ${heList(others)}` : ''}. כדי להבדיל ביניהם מסתכלים על מה שיש מחוץ לפינה.`)
  }
  for (const s of f.symbols) if (SYMBOL_TIPS[s] && tips.length < 5) tips.push(SYMBOL_TIPS[s](c.name))
  if (!f.symbols.length && f.stripes) tips.push(`בדגל ${c.name} אין סמל — רק פסים. לכן כל מה שצריך לזכור הוא סדר הצבעים.`)
  if (tips.length < 2) tips.push(`מסתכלים על דגל ${c.name} חצי דקה, מכסים את התמונה ומנסים לצייר אותו מהזיכרון. אחר כך משווים ומתקנים.`)
  return tips
}

// A lead paragraph built from this country's own data.
export function countryLead(c) {
  const continent = CONTINENT_BY_SLUG[c.continent], all = countriesOf(c.continent)
  const n = COUNTRY_DETAILS[c.code].neighbors.length
  const capitalWord = c.code === 'za' ? 'בירת הממשלה' : 'הבירה'
  const parts = [c.code === 'nr'
    ? `נאורו היא אחת מ־${all.length} המדינות של ${continent.name} ברשימת הדגלים באתר. אין לה בירה רשמית, ומשרדי הממשלה נמצאים ב${c.capital}.`
    : `${c.name} היא אחת מ־${all.length} המדינות של ${continent.name} ברשימת הדגלים באתר, ו${capitalWord} שלה ${c.capital === c.name ? `נקראת בדיוק כמו המדינה — ${c.capital}` : `היא ${c.capital}`}.`]
  parts.push(n === 0 ? `ברשימה שלנו אין ל${c.name} גבול יבשתי עם מדינה אחרת ב${continent.name}.` : n === 1 ? `יש לה גבול יבשתי עם מדינה אחת ב${continent.name}: ${COUNTRY_BY_CODE[COUNTRY_DETAILS[c.code].neighbors[0]].name}.` : `יש לה גבול יבשתי עם ${n} מדינות ב${continent.name} שברשימה.`)
  parts.push(FAMOUS_FLAGS.includes(c.code) ? 'הדגל שלה נמצא ברשימת הדגלים המוכרים של הרמה הקלה בחידון הדגלים, כי ילדים רבים כבר מכירים אותו.' : 'הדגל שלה פחות מוכר לילדים, ולכן כדאי לתרגל אותו ברמה הבינונית או בחידון לפי יבשת.')
  return parts.join(' ')
}

export function letterParagraph(c) {
  const { letter, countries, capitals } = letterFacts(c)
  const others = countries.filter(p => p.code !== c.code).map(p => p.name)
  const caps = capitals.filter(x => x !== c.capital).slice(0, 8)
  return `משחקים ארץ עיר? ${c.name} מתחילה באות ${letter}. ${others.length ? `ברשימת המדינות באתר יש עוד ${others.length === 1 ? 'מדינה אחת' : `${others.length} מדינות`} שמתחילות באות הזאת: ${heList(others.slice(0, 10))}${others.length > 10 ? ' ועוד' : ''}.` : 'זו המדינה היחידה ברשימה שמתחילה באות הזאת — שווה לזכור אותה!'} ${caps.length ? `בירות שמתחילות ב־${letter}: ${heList(caps)}.` : `אין ברשימה בירה שמתחילה ב־${letter}.`}`
}

export function extraFaq(c) {
  const continent = CONTINENT_BY_SLUG[c.continent], names = colorNames(c.code)
  const neighbors = COUNTRY_DETAILS[c.code].neighbors.map(k => COUNTRY_BY_CODE[k].name)
  const similar = similarColorFlags(c, 4)
  const faq = [{ q: `באיזו יבשת נמצאת ${c.name}?`, a: `באתר ${c.name} מסווגת ב${continent.name}, יחד עם עוד ${countriesOf(c.continent).length - 1} מדינות.${['ru', 'tr', 'eg', 'kz'].includes(c.code) ? ' חלק משטחה נמצא ביבשת נוספת, אבל ברשימה כל מדינה מופיעה ביבשת אחת.' : ''}` }]
  if (names.length) faq.push({ q: `אילו צבעים יש בדגל ${c.name}?`, a: `הצבעים הבולטים הם ${heList(names)}. ${COUNTRY_DETAILS[c.code].description}` })
  if (neighbors.length) faq.push({ q: `עם אילו מדינות גובלת ${c.name}?`, a: `מבין המדינות של ${continent.name} שברשימה, ל${c.name} יש גבול יבשתי עם ${heList(neighbors)}.` })
  if (similar.length) faq.push({ q: `אילו דגלים דומים לדגל ${c.name}?`, a: `דגלים עם צבעים בולטים ${similar.some(s => s.same) ? 'זהים או ' : ''}דומים: ${heList(similar.map(s => s.name))}. ${FLAG_NOTES[c.code] && /זהה|דומה/.test(FLAG_NOTES[c.code]) ? FLAG_NOTES[c.code] : 'כדי להבדיל ביניהם משווים את סדר הצבעים ואת הסמלים.'}` })
  return faq
}

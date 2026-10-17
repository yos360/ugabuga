// Conservative kid-safety filter for BugaPedia queries and live results.
// Words are matched as whole tokens; Hebrew tokens are also matched after stripping
// up to two one-letter prefixes (ו/ה/ב/ל/מ/ש/כ), except for short/ambiguous terms
// listed in EXACT_ONLY that would collide with ordinary words.

const PREFIX = /^[והבלמשכ]/u
const EXACT_ONLY = new Set(['זין', 'זונה', 'זונות', 'אנס'])

// Blocked everywhere: query, result title and result extract.
const HARD_TERMS = [
  'סקס', 'סקסי', 'סקסית', 'פורנו', 'פורנוגרפיה', 'פורנוגרפי', 'פורנוגרפית', 'פורנוגרפיים', 'אוננות', 'לאונן', 'אורגזמה',
  'חשפנות', 'חשפנית', 'חשפניות', 'ארוטי', 'ארוטית', 'ארוטיקה', 'פדופיל', 'פדופיליה', 'פדופילים',
  'זין', 'כוסאמק', 'כוסעמק', 'שרמוטה', 'שרמוטות', 'מניאק', 'מניאקים', 'תזדיין', 'תזדייני',
  'מרוטש', 'מרוטשת', 'מרוטשים', 'מרוטשות', 'מסטול', 'מסטולה', 'מסטולים', 'להסתמם',
  'porn', 'porno', 'pornography', 'pornographic', 'xxx', 'hentai', 'nsfw', 'onlyfans', 'erotic', 'erotica', 'orgasm', 'masturbation', 'masturbate',
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bullshit', 'bitch', 'bitches', 'cunt', 'asshole', 'whore', 'slut', 'pedophile', 'pedophilia',
]

// Blocked in the query and in result titles (extracts of history/biology articles
// legitimately mention some of these, so they are not checked there).
const SOFT_TERMS = [
  'עירום', 'עירומה', 'עירומים', 'עירומות', 'זנות', 'זונה', 'זונות', 'אונס', 'אנס', 'נאנס', 'נאנסה', 'נאנסו', 'לאנוס', 'אנסו',
  'עינויים', 'עינוי', 'עריפה', 'ביתור', 'גופות', 'סמים', 'קוקאין', 'הרואין', 'מריחואנה', 'קנאביס', 'חשיש', 'אקסטזי', 'מתאמפטמין',
  'הימורים', 'להמר', 'קזינו',
  'sex', 'sexy', 'sexual', 'nude', 'nudes', 'nudity', 'rape', 'raped', 'rapist', 'torture', 'tortured', 'behead', 'beheading', 'beheaded', 'gore',
  'cocaine', 'heroin', 'meth', 'methamphetamine', 'marijuana', 'cannabis', 'lsd', 'gambling', 'casino', 'prostitute', 'prostitution',
]

// Murder vocabulary: blocked unless the query is clearly about a historical topic
// taught in school (e.g. "רצח רבין", the Holocaust).
const CONTEXT_TERMS = ['רצח', 'רוצח', 'רוצחת', 'רוצחים', 'נרצח', 'נרצחה', 'נרצחו', 'לרצוח', 'רציחה', 'רציחות', 'murder', 'murdered', 'murderer', 'killing']
const HISTORY_CONTEXT = ['רבין', 'שואה', 'השואה', 'היסטוריה', 'מלחמה', 'מלחמת', 'holocaust', 'history', 'war']

const HARD_PHRASES = ['כוס אמק', 'כוס אמא שלך', 'כוס אמאשך', 'בן זונה', 'בת זונה', 'לך תזדיין', 'יחסי מין', 'קיום יחסים', 'מין אוראלי', 'סרטון כחול', 'סרטים כחולים', 'son of a bitch', 'oral sex', 'blow job']
const SOFT_PHRASES = ['התעללות מינית', 'פגיעה מינית', 'עריפת ראש', 'כריתת ראש', 'הוצאה להורג', 'תמונות של גופות', 'תמונות גופות', 'פיגוע מזוויע', 'execution video', 'dead bodies']

// Self-harm / suicide: the query gets a warm help message instead of results.
const SELF_HARM_TERMS = ['התאבדות', 'להתאבד', 'התאבד', 'התאבדה', 'מתאבד', 'מתאבדת', 'אתאבד', 'suicide', 'suicidal']
const SELF_HARM_PHRASES = [
  'לפגוע בעצמי', 'לפגוע בעצמך', 'לפגוע בעצמו', 'לפגוע בעצמה', 'פגיעה עצמית', 'פוגע בעצמי', 'פוגעת בעצמי', 'לחתוך את עצמי', 'חותך את עצמי', 'חותכת את עצמי',
  'להרוג את עצמי', 'להרוג את עצמך', 'לא רוצה לחיות', 'לא רוצה יותר לחיות', 'רוצה למות', 'בא לי למות', 'איך למות', 'אין לי בשביל מה לחיות', 'לשים סוף לחיים',
  'kill myself', 'self harm', 'want to die', 'cut myself', 'end my life',
]

const HARD = new Set(HARD_TERMS)
const SOFT = new Set(SOFT_TERMS)
const CONTEXT = new Set(CONTEXT_TERMS)
const SELF_HARM = new Set(SELF_HARM_TERMS)
const HISTORY = new Set(HISTORY_CONTEXT)

export function normalizeForSafety(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase('he-IL')
    .replace(/[֑-ׇ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

// Every token plus its prefix-stripped Hebrew forms.
function tokenForms(text) {
  const forms = new Set()
  for (const word of text.split(' ')) {
    if (!word) continue
    forms.add(word)
    let rest = word
    for (let i = 0; i < 2 && PREFIX.test(rest) && rest.length > 3; i++) {
      rest = rest.slice(1)
      if (!EXACT_ONLY.has(rest)) forms.add(rest)
    }
  }
  return forms
}

const hasPhrase = (text, phrases) => phrases.some(phrase => new RegExp(`(^| )[והבלמשכ]{0,2}${phrase}( |$)`, 'u').test(text))
const hasTerm = (forms, set) => [...forms].some(form => set.has(form))

function analyse(value) {
  const text = normalizeForSafety(value)
  return { text, forms: tokenForms(text) }
}

export function isSelfHarmQuery(query) {
  const { text, forms } = analyse(query)
  return hasTerm(forms, SELF_HARM) || hasPhrase(text, SELF_HARM_PHRASES)
}

const isHistoryContext = forms => hasTerm(forms, HISTORY)

// Returns null when the query is fine, otherwise 'selfharm' or 'blocked'.
export function checkBugaPediaQuery(query) {
  if (isSelfHarmQuery(query)) return 'selfharm'
  const { text, forms } = analyse(query)
  if (hasTerm(forms, HARD) || hasTerm(forms, SOFT) || hasPhrase(text, HARD_PHRASES) || hasPhrase(text, SOFT_PHRASES)) return 'blocked'
  if (hasTerm(forms, CONTEXT) && !isHistoryContext(forms)) return 'blocked'
  return null
}

export function isSafeBugaPediaResult(result, query = '') {
  const title = analyse(result?.title)
  const extract = analyse(result?.extract)
  const allowMurderTopic = isHistoryContext(analyse(query).forms)
  if (hasTerm(title.forms, HARD) || hasTerm(title.forms, SOFT) || hasTerm(title.forms, SELF_HARM)) return false
  if (hasPhrase(title.text, HARD_PHRASES) || hasPhrase(title.text, SOFT_PHRASES) || hasPhrase(title.text, SELF_HARM_PHRASES)) return false
  if (!allowMurderTopic && hasTerm(title.forms, CONTEXT)) return false
  if (hasTerm(extract.forms, HARD) || hasPhrase(extract.text, HARD_PHRASES)) return false
  return true
}

export const filterSafeResults = (results, query) => results.filter(result => isSafeBugaPediaResult(result, query))

// Strip contact details / ID numbers before a question is stored for analytics.
export function redactBugaPediaQuery(value) {
  return String(value || '')
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[הוסר]')
    .replace(/(?:\+972[\s-]?|\b0)\d{1,2}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[הוסר]')
    .replace(/\d{7,}/g, '[הוסר]')
}

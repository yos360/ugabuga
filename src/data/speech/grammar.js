// Data for /speech/language/grammar — preschool grammar in standard Hebrew: singular/plural,
// masculine/feminine agreement, past/present/future, possessives and longer sentences with ו / כי /
// אבל. Every form here was checked by hand; niqqud only where it disambiguates (שֶׁלְּךָ / שֶׁלָּךְ).
// Gap sentences use "_" for the missing word; a connector "ו" attaches to the next word ("_בננות").

// ── Singular / plural ───────────────────────────────────────────────────────
// s: singular, p: plural, g: grammatical gender, e: emoji (or i: line icon), n: how many pictures
// show "many" (2 for pairs such as eyes and hands).
export const PLURAL_KINDS = [
  { id: 'im', name: 'זכר — מוסיפים ־ים', short: '־ים', e: '🐕', tip: 'רוב המילים בזכר: כלב — כלבים, בלון — בלונים.' },
  { id: 'ot', name: 'נקבה — מוסיפים ־ות', short: '־ות', e: '🐄', tip: 'רוב המילים בנקבה: פרה — פרות, מכונית — מכוניות.' },
  { id: 'mOt', name: 'זכר, אבל ברבים ־ות', short: 'זכר + ־ות', e: '✏️', tip: 'מילים בזכר שמקבלות ־ות: עיפרון — עפרונות, שולחן — שולחנות.' },
  { id: 'fIm', name: 'נקבה, אבל ברבים ־ים', short: 'נקבה + ־ים', e: '🥚', tip: 'מילים בנקבה שמקבלות ־ים: ביצה — ביצים, ציפור — ציפורים.' },
  { id: 'pair', name: 'זוגות — ־יים', short: '־יים', e: '👁️', tip: 'איברים ודברים שבאים בזוג: עין — עיניים, נעל — נעליים.' },
  { id: 'odd', name: 'מילים שמשתנות לגמרי', short: 'משתנות', e: '🏠', tip: 'צריך פשוט להכיר: אישה — נשים, איש — אנשים, בית — בתים.' },
]
export const TRICKY_KINDS = ['mOt', 'fIm', 'pair', 'odd']

const P = (kind, g, s, p, pic, n = 3) => ({ kind, g, s, p, ...(pic.length > 2 && /^[a-z]/.test(pic) ? { i: pic } : { e: pic }), n })

export const PLURALS = [
  P('im', 'm', 'כלב', 'כלבים', '🐕'),
  P('im', 'm', 'חתול', 'חתולים', '🐈'),
  P('im', 'm', 'דג', 'דגים', '🐟'),
  P('im', 'm', 'בלון', 'בלונים', '🎈'),
  P('im', 'm', 'פרח', 'פרחים', '🌸'),
  P('im', 'm', 'ילד', 'ילדים', '👦'),
  P('im', 'm', 'ספר', 'ספרים', '📕'),
  P('im', 'm', 'תפוח', 'תפוחים', '🍎'),
  P('im', 'm', 'פרפר', 'פרפרים', '🦋'),
  P('im', 'm', 'מטוס', 'מטוסים', '✈️'),
  P('im', 'm', 'עכבר', 'עכברים', '🐭'),
  P('im', 'm', 'עץ', 'עצים', '🌳'),
  P('im', 'm', 'כדור', 'כדורים', '⚽'),
  P('im', 'm', 'ענן', 'עננים', '☁️'),
  P('im', 'm', 'תות', 'תותים', '🍓'),
  P('ot', 'f', 'פרה', 'פרות', '🐄'),
  P('ot', 'f', 'עוגה', 'עוגות', '🎂'),
  P('ot', 'f', 'מכונית', 'מכוניות', '🚗'),
  P('ot', 'f', 'חולצה', 'חולצות', '👕'),
  P('ot', 'f', 'בננה', 'בננות', '🍌'),
  P('ot', 'f', 'סירה', 'סירות', '⛵'),
  P('ot', 'f', 'שמלה', 'שמלות', '👗'),
  P('ot', 'f', 'משאית', 'משאיות', '🚚'),
  P('ot', 'f', 'כפית', 'כפיות', '🥄'),
  P('ot', 'f', 'גלידה', 'גלידות', '🍦'),
  P('ot', 'f', 'רכבת', 'רכבות', '🚆'),
  P('ot', 'f', 'ילדה', 'ילדות', '👧'),
  P('ot', 'f', 'דלת', 'דלתות', '🚪'),
  P('ot', 'f', 'תרנגולת', 'תרנגולות', '🐔'),
  P('mOt', 'm', 'עיפרון', 'עפרונות', '✏️'),
  P('mOt', 'm', 'שולחן', 'שולחנות', 'table'),
  P('mOt', 'm', 'חלון', 'חלונות', '🪟'),
  P('mOt', 'm', 'תינוק', 'תינוקות', '👶'),
  P('mOt', 'm', 'מפתח', 'מפתחות', '🔑'),
  P('mOt', 'm', 'כיסא', 'כיסאות', '🪑'),
  P('mOt', 'm', 'אריה', 'אריות', '🦁'),
  P('mOt', 'm', 'ארון', 'ארונות', 'closet'),
  P('fIm', 'f', 'ביצה', 'ביצים', '🥚'),
  P('fIm', 'f', 'ציפור', 'ציפורים', '🐦'),
  P('fIm', 'f', 'נמלה', 'נמלים', '🐜'),
  P('fIm', 'f', 'דבורה', 'דבורים', '🐝'),
  P('fIm', 'f', 'יונה', 'יונים', '🕊️'),
  P('fIm', 'f', 'צפרדע', 'צפרדעים', '🐸'),
  P('fIm', 'f', 'אבן', 'אבנים', '🪨'),
  P('fIm', 'f', 'עיר', 'ערים', '🏙️'),
  P('pair', 'f', 'עין', 'עיניים', '👁️', 2),
  P('pair', 'f', 'אוזן', 'אוזניים', '👂', 2),
  P('pair', 'f', 'יד', 'ידיים', '✋', 2),
  P('pair', 'f', 'רגל', 'רגליים', '🦵', 2),
  P('pair', 'f', 'נעל', 'נעליים', '👟', 2),
  P('pair', 'f', 'שן', 'שיניים', '🦷'),
  P('odd', 'f', 'אישה', 'נשים', '👩'),
  P('odd', 'm', 'איש', 'אנשים', '👨'),
  P('odd', 'm', 'בית', 'בתים', '🏠'),
]

export const pluralsOf = level => level === 'regular' ? PLURALS.filter(x => x.kind === 'im' || x.kind === 'ot')
  : level === 'tricky' ? PLURALS.filter(x => TRICKY_KINDS.includes(x.kind)) : PLURALS
export const one = x => x.g === 'm' ? 'אחד' : 'אחת'

// ── Masculine / feminine ────────────────────────────────────────────────────
// Present-tense verbs in four forms: boy, girl, boys (or a mixed group), girls.
export const GENDER_VERBS = [
  { m: 'רץ', f: 'רצה', mp: 'רצים', fp: 'רצות', rest: 'מהר', e: '🏃' },
  { m: 'אוכל', f: 'אוכלת', mp: 'אוכלים', fp: 'אוכלות', rest: 'תפוח', e: '🍎' },
  { m: 'ישן', f: 'ישנה', mp: 'ישנים', fp: 'ישנות', rest: 'במיטה', e: '😴' },
  { m: 'צוחק', f: 'צוחקת', mp: 'צוחקים', fp: 'צוחקות', rest: 'בקול', e: '😂' },
  { m: 'שר', f: 'שרה', mp: 'שרים', fp: 'שרות', rest: 'שיר', e: '🎤' },
  { m: 'מצייר', f: 'מציירת', mp: 'מציירים', fp: 'מציירות', rest: 'פרח', e: '🎨' },
  { m: 'יושב', f: 'יושבת', mp: 'יושבים', fp: 'יושבות', rest: 'על הכיסא', e: '🪑' },
  { m: 'הולך', f: 'הולכת', mp: 'הולכים', fp: 'הולכות', rest: 'לגן', e: '🚶' },
  { m: 'קורא', f: 'קוראת', mp: 'קוראים', fp: 'קוראות', rest: 'ספר', e: '📖' },
  { m: 'רוכב', f: 'רוכבת', mp: 'רוכבים', fp: 'רוכבות', rest: 'על אופניים', e: '🚲' },
  { m: 'משחק', f: 'משחקת', mp: 'משחקים', fp: 'משחקות', rest: 'בכדור', e: '⚽' },
]
export const SUBJECTS = [
  { id: 'm', t: 'הילד', pics: ['👦'] },
  { id: 'f', t: 'הילדה', pics: ['👧'] },
  { id: 'mp', t: 'הילדים', pics: ['👦', '👧'], note: 'בנים ובנות ביחד — אומרים בלשון זכר: הילדים' },
  { id: 'fp', t: 'הילדות', pics: ['👧', '👧'] },
]

// Adjectives and colours: the noun decides the form. n: noun with article, g: its gender.
const A = (n, g, m, f, e) => ({ n, g, m, f, e })
export const ADJECTIVES = [
  A('הבלון', 'm', 'גדול', 'גדולה', '🎈'),
  A('העכבר', 'm', 'קטן', 'קטנה', '🐭'),
  A('התה', 'm', 'חם', 'חמה', '☕'),
  A('הנחש', 'm', 'ארוך', 'ארוכה', '🐍'),
  A('הילד', 'm', 'עצוב', 'עצובה', '😢'),
  A('העוגה', 'f', 'טעים', 'טעימה', '🎂'),
  A('הגלידה', 'f', 'קר', 'קרה', '🍦'),
  A('הפרה', 'f', 'גדול', 'גדולה', '🐄'),
  A('הנמלה', 'f', 'קטן', 'קטנה', '🐜'),
  A('הילדה', 'f', 'שמח', 'שמחה', '😀'),
]
export const COLORS = [
  A('הלימון', 'm', 'צהוב', 'צהובה', '🍋'),
  A('העלה', 'm', 'ירוק', 'ירוקה', '🍃'),
  A('התות', 'm', 'אדום', 'אדומה', '🍓'),
  A('הענן', 'm', 'לבן', 'לבנה', '☁️'),
  A('הגזר', 'm', 'כתום', 'כתומה', '🥕'),
  A('הדוב', 'm', 'חום', 'חומה', '🐻'),
  A('הבננה', 'f', 'צהוב', 'צהובה', '🍌'),
  A('הצפרדע', 'f', 'ירוק', 'ירוקה', '🐸'),
  A('המכונית', 'f', 'אדום', 'אדומה', '🚗'),
  A('הביצה', 'f', 'לבן', 'לבנה', '🥚'),
  A('הדלעת', 'f', 'כתום', 'כתומה', '🎃'),
  A('החולצה', 'f', 'כחול', 'כחולה', '👕'),
]
// Colour words in four forms, for the table on the page.
export const COLOR_FORMS = [
  ['אדום', 'אדומה', 'אדומים', 'אדומות', '#dc2626'],
  ['כחול', 'כחולה', 'כחולים', 'כחולות', '#2563eb'],
  ['צהוב', 'צהובה', 'צהובים', 'צהובות', '#eab308'],
  ['ירוק', 'ירוקה', 'ירוקים', 'ירוקות', '#16a34a'],
  ['לבן', 'לבנה', 'לבנים', 'לבנות', '#ffffff'],
  ['שחור', 'שחורה', 'שחורים', 'שחורות', '#111827'],
  ['כתום', 'כתומה', 'כתומים', 'כתומות', '#f97316'],
  ['ורוד', 'ורודה', 'ורודים', 'ורודות', '#f472b6'],
  ['סגול', 'סגולה', 'סגולים', 'סגולות', '#9333ea'],
  ['חום', 'חומה', 'חומים', 'חומות', '#92400e'],
]

// ── Past / present / future ─────────────────────────────────────────────────
export const TIMES = [
  { id: 'past', word: 'אתמול', label: 'לפני', sub: 'כבר היה', mark: '✔' },
  { id: 'now', word: 'עכשיו', label: 'עכשיו', sub: 'קורה עכשיו', mark: '▶' },
  { id: 'future', word: 'מחר', label: 'אחר כך', sub: 'עוד יהיה', mark: '⏳' },
]
export const NAMES = { m: 'איתי', f: 'נועה' }
// past / present / future for a boy (m) and a girl (f), and the rest of the sentence.
export const TENSE_VERBS = [
  { id: 'eat', m: ['אכל', 'אוכל', 'יאכל'], f: ['אכלה', 'אוכלת', 'תאכל'], obj: 'גלידה', e: '🍦' },
  { id: 'drink', m: ['שתה', 'שותה', 'ישתה'], f: ['שתתה', 'שותה', 'תשתה'], obj: 'חלב', e: '🥛' },
  { id: 'draw', m: ['צייר', 'מצייר', 'יצייר'], f: ['ציירה', 'מציירת', 'תצייר'], obj: 'פרח', e: '🎨' },
  { id: 'build', m: ['בנה', 'בונה', 'יבנה'], f: ['בנתה', 'בונה', 'תבנה'], obj: 'מגדל', e: '🧱' },
  { id: 'play', m: ['שיחק', 'משחק', 'ישחק'], f: ['שיחקה', 'משחקת', 'תשחק'], obj: 'בכדור', e: '⚽' },
  { id: 'walk', m: ['הלך', 'הולך', 'ילך'], f: ['הלכה', 'הולכת', 'תלך'], obj: 'לגן', e: '🚶' },
  { id: 'wear', m: ['לבש', 'לובש', 'ילבש'], f: ['לבשה', 'לובשת', 'תלבש'], obj: 'מעיל', e: '🧥' },
  { id: 'bake', m: ['אפה', 'אופה', 'יאפה'], f: ['אפתה', 'אופה', 'תאפה'], obj: 'עוגה', e: '🎂' },
  { id: 'read', m: ['קרא', 'קורא', 'יקרא'], f: ['קראה', 'קוראת', 'תקרא'], obj: 'ספר', e: '📖' },
  { id: 'ride', m: ['רכב', 'רוכב', 'ירכב'], f: ['רכבה', 'רוכבת', 'תרכב'], obj: 'על אופניים', e: '🚲' },
  { id: 'plant', m: ['שתל', 'שותל', 'ישתול'], f: ['שתלה', 'שותלת', 'תשתול'], obj: 'פרח', e: '🌱' },
]
export const tenseSentence = (v, g, ti) => `${TIMES[ti].word} ${NAMES[g]} ${v[g][ti]} ${v.obj}.`

// ── Possessives ─────────────────────────────────────────────────────────────
export const POSSESSIVES = [
  ['אני', 'שלי', '👆'], ['אתה', 'שֶׁלְּךָ', '👦'], ['את', 'שֶׁלָּךְ', '👧'], ['הוא', 'שלו', '👦'], ['היא', 'שלה', '👧'],
  ['אנחנו', 'שלנו', '👨‍👩‍👧'], ['אתם', 'שלכם', '👦👧'], ['אתן', 'שלכן', '👧👧'], ['הם', 'שלהם', '👦👦'], ['הן', 'שלהן', '👧👧'],
]
const MINE = ['שלי', 'שלו', 'שלה', 'שלהם']
const YOURS = ['שֶׁלְּךָ', 'שֶׁלָּךְ']
export const POSSESSIVE_GAPS = [
  { text: 'לאיתי יש כדור. זה הכדור _.', pics: ['👦', '⚽'], opts: ['שלו', 'שלה'], ans: 'שלו' },
  { text: 'לנועה יש כובע. זה הכובע _.', pics: ['👧', '👒'], opts: ['שלו', 'שלה'], ans: 'שלה' },
  { text: 'לנועה יש כלב. זה הכלב _.', pics: ['👧', '🐕'], opts: ['שלו', 'שלה'], ans: 'שלה' },
  { text: 'לאיתי יש חתול. זה החתול _.', pics: ['👦', '🐈'], opts: ['שלו', 'שלה'], ans: 'שלו' },
  { text: 'לאיתי יש מעיל. זה המעיל _.', pics: ['👦', '🧥'], opts: ['שלו', 'שלה'], ans: 'שלו' },
  { text: 'לנועה יש אופניים. אלה האופניים _.', pics: ['👧', '🚲'], opts: ['שלו', 'שלה'], ans: 'שלה' },
  { text: 'הדובי הזה שייך לי. זה הדובי _.', pics: ['👆', '🧸'], opts: ['שלי', 'שלו'], ans: 'שלי' },
  { text: 'לאיתי ולנועה יש בית. זה הבית _.', pics: ['👦', '👧', '🏠'], opts: ['שלו', 'שלהם'], ans: 'שלהם' },
  { text: 'אמא אומרת לאיתי: „זה התיק _”.', pics: ['👩', '👦', '🎒'], opts: YOURS, ans: 'שֶׁלְּךָ' },
  { text: 'אבא אומר לנועה: „זאת המטרייה _”.', pics: ['👨', '👧', '☂️'], opts: YOURS, ans: 'שֶׁלָּךְ' },
]
export const POSSESSIVE_WORDS = [...MINE, ...YOURS]

// ── Longer sentences: ו, כי, אבל ────────────────────────────────────────────
export const CONNECTORS = [
  { id: 'ו', label: 'ו־', e: '➕', what: 'מוסיפים עוד משהו', ex: 'קנינו תפוחים ובננות.' },
  { id: 'כי', label: 'כי', e: '❓', what: 'מסבירים למה', ex: 'איתי לבש מעיל כי קר בחוץ.' },
  { id: 'אבל', label: 'אבל', e: '↩️', what: 'משהו לא הסתדר / הפוך ממה שציפינו', ex: 'נועה רצתה לשחק בחצר, אבל ירד גשם.' },
]
const C = (text, ans, pics) => ({ text, ans, pics, opts: ['ו', 'כי', 'אבל'] })
export const CONNECTOR_GAPS = [
  C('איתי לבש מעיל _ קר בחוץ.', 'כי', ['🧥', '🥶']),
  C('נועה רצתה לשחק בחצר, _ ירד גשם.', 'אבל', ['⚽', '🌧️']),
  C('קנינו תפוחים _בננות.', 'ו', ['🍎', '🍌']),
  C('התינוק בוכה _ הוא רעב.', 'כי', ['👶', '🍼']),
  C('רציתי עוד גלידה, _ היא נגמרה.', 'אבל', ['🍦']),
  C('אבא הכין סלט _אמא אפתה עוגה.', 'ו', ['🥗', '🎂']),
  C('שתיתי מים _ היה חם.', 'כי', ['💧', '☀️']),
  C('הכלב רוצה לצאת, _ הדלת סגורה.', 'אבל', ['🐕', '🚪']),
  C('בגן ציירנו _שרנו שירים.', 'ו', ['🎨', '🎵']),
  C('הפרח נבל _ שכחנו להשקות אותו.', 'כי', ['🥀']),
  C('החתול רצה לתפוס את הציפור, _ היא עפה.', 'אבל', ['🐈', '🐦']),
  C('לקחנו מטרייה _ ירד גשם.', 'כי', ['☂️', '🌧️']),
]

// Sentence ladders: from one word to a long sentence, one step at a time.
export const LADDER_STEPS = ['מילה אחת', '+ מה קורה?', '+ איזה? / איך?', '+ איפה? / מי עוד?', '+ ו / כי / אבל']
export const LADDERS = [
  { e: '🐕', steps: ['כלב.', 'הכלב רץ.', 'הכלב הגדול רץ.', 'הכלב הגדול רץ בגינה.', 'הכלב הגדול רץ בגינה, כי הוא רוצה לשחק.'] },
  { e: '⚽', steps: ['כדור.', 'איתי זורק כדור.', 'איתי זורק כדור אדום.', 'איתי ונועה זורקים כדור אדום בחצר.', 'איתי ונועה זורקים כדור אדום בחצר, אבל הכדור נתקע בעץ.'] },
  { e: '☂️', steps: ['מטרייה.', 'נועה לוקחת מטרייה.', 'נועה לוקחת מטרייה כחולה.', 'נועה לוקחת מטרייה כחולה ומגפיים.', 'נועה לוקחת מטרייה כחולה ומגפיים, כי יורד גשם.'] },
  { e: '🎂', steps: ['עוגה.', 'סבתא אופה עוגה.', 'סבתא אופה עוגת שוקולד.', 'סבתא אופה עוגת שוקולד במטבח.', 'סבתא אופה עוגת שוקולד במטבח, ואנחנו מחכים לטעום.'] },
]

// ── Gap-sentence rounds for the game and the printed sheets ─────────────────
// Every item: { sec, text (with "_"), opts, ans, pics: [emoji…] }.
export const GAP_SECTIONS = [
  ['plural', '👥 יחיד ורבים'], ['gender', '👦👧 זכר ונקבה'], ['tense', '⏳ עבר, הווה, עתיד'], ['possessive', '🤲 של מי?'], ['connectors', '🔗 ו, כי, אבל'], ['mix', '🔀 הכול'],
]
const repeat = (e, n) => Array.from({ length: n }, () => e)

export function pluralGaps() {
  return PLURALS.filter(x => x.e).flatMap(x => [
    { sec: 'plural', text: `יש כאן _ ${one(x)}.`, opts: [x.s, x.p], ans: x.s, pics: [x.e], one: true },
    { sec: 'plural', text: 'יש כאן הרבה _.', opts: [x.s, x.p], ans: x.p, pics: repeat(x.e, x.n), many: true },
  ])
}
export function genderGaps() {
  const verbs = GENDER_VERBS.flatMap(v => SUBJECTS.map(s => ({
    sec: 'gender', text: `${s.t} _ ${v.rest}.`, ans: v[s.id], pics: [...s.pics, v.e],
    opts: s.id === 'm' || s.id === 'f' ? [v.m, v.f] : [v.mp, v.fp], note: s.note,
  })))
  const adj = [...ADJECTIVES, ...COLORS].map(a => ({ sec: 'gender', text: `${a.n} _.`, opts: [a.m, a.f], ans: a[a.g], pics: [a.e] }))
  // Skip pairs whose two options are spelled the same (e.g. בונה for a boy and a girl).
  return [...verbs, ...adj].filter(x => x.opts[0] !== x.opts[1])
}
export function tenseGaps() {
  return TENSE_VERBS.flatMap(v => ['m', 'f'].flatMap(g => TIMES.map((t, ti) => ({
    sec: 'tense', text: `${t.word} ${NAMES[g]} _ ${v.obj}.`, opts: v[g], ans: v[g][ti], pics: [g === 'm' ? '👦' : '👧', v.e], time: t.id,
  })))).filter(x => new Set(x.opts).size === 3)
}
export const possessiveGaps = () => POSSESSIVE_GAPS.map(x => ({ sec: 'possessive', ...x }))
export const connectorGaps = () => CONNECTOR_GAPS.map(x => ({ sec: 'connectors', ...x }))

export function gapsFor(sec) {
  if (sec === 'plural') return pluralGaps()
  if (sec === 'gender') return genderGaps()
  if (sec === 'tense') return tenseGaps()
  if (sec === 'possessive') return possessiveGaps()
  if (sec === 'connectors') return connectorGaps()
  return [...pluralGaps(), ...genderGaps(), ...tenseGaps(), ...possessiveGaps(), ...connectorGaps()]
}

// The finished sentence. "ו" joins the next word; everything else is a separate word.
export const fill = (text, word) => text.replace('_', word)
// The sentence as shown before answering, and as read aloud with a pause for the gap.
export const gapShown = text => text.replace(/_([א-ת]?)/, (_, c) => c ? `___ ${c}` : '___')
export const gapSpoken = text => text.replace(/ ?_ ?/, ' ... ')

// Sources for the guidance on recasting and typical errors.
export const GRAMMAR_SOURCES = [
  { title: 'Cleave, Becker, Curran, Owen Van Horne & Fey (2015). The efficacy of recasts in language intervention: a systematic review and meta-analysis. American Journal of Speech-Language Pathology 24(2) — סקירה שמצאה ש„החזרה מתוקנת” (recast) מועילה בתרגול דקדוק אצל ילדים עם קשיי שפה' },
  { title: 'משרד החינוך — התפתחות שפה מגיל 3 עד 6', url: 'https://pop.education.gov.il/kindergarten/magar-ganey-yeladim/language-development-from-age-four-to-three-to-age-six/' },
  { title: 'האגודה הישראלית של קלינאי תקשורת — דפי מידע להורים', url: 'https://ishla.org.il/' },
  { title: 'The Hanen Centre — עקרונות לשיחה עם ילדים (OWL, הרחבה)', url: 'https://www.hanen.org/' },
  { title: 'Berman, R. A. (1985). The acquisition of Hebrew. In D. I. Slobin (Ed.), The Crosslinguistic Study of Language Acquisition, vol. 1 — רכישת הדקדוק בעברית, כולל הכללת יתר בצורות רבים ופעלים' },
]

// Semantic categories for /speech/language/categories: picturable, child-familiar words grouped by
// category, plus naming-fluency prompts ("אמרו 3 דברים ש…") and opposite pairs.
// Every item has a picture: an emoji (e) or, where no fitting emoji exists, a simple line icon (i)
// drawn from ICONS below. No misleading pictures — if neither fits, the word is not on the list.

// Line icons on a 24×24 grid (stroke only), for words that have no fitting emoji.
export const ICONS = {
  table: 'M2 8h20v3H2z M4 11v9 M20 11v9 M7 11v5 M17 11v5',
  closet: 'M5 2.5h14v18H5z M12 2.5v18 M10 10v2.5 M14 10v2.5 M6 20.5v1.5 M18 20.5v1.5',
  lamp: 'M8 3h8l3.5 8h-15z M12 11v8.5 M8 21h8',
  shelf: 'M3 6h18 M3 12h18 M3 18h18 M4 6v14 M20 6v14 M7 6V3.5h2V6 M10 6V4h2v2 M8 12V9.5h2V12 M14 12V10h3v2',
  flute: 'M1.5 10.5h21v3h-21z M7 12h.01 M10 12h.01 M13 12h.01 M16 12h.01 M19 12h.01',
}

export const CATEGORIES = [
  {
    id: 'animals', name: 'חיות', one: 'חיה', e: '🐾',
    items: [['כלב', '🐕'], ['חתול', '🐈'], ['פרה', '🐄'], ['סוס', '🐎'], ['אריה', '🦁'], ['פיל', '🐘'], ['קוף', '🐒'], ['ג׳ירפה', '🦒'], ['ארנב', '🐇'], ['תרנגול', '🐓'], ['דג', '🐟'], ['צב', '🐢']],
  },
  {
    id: 'fruits', name: 'פירות', one: 'פרי', e: '🍑',
    items: [['תפוח', '🍎'], ['בננה', '🍌'], ['ענבים', '🍇'], ['תפוז', '🍊'], ['אבטיח', '🍉'], ['תות', '🍓'], ['אגס', '🍐'], ['אננס', '🍍'], ['דובדבן', '🍒'], ['לימון', '🍋'], ['מנגו', '🥭'], ['קיווי', '🥝']],
  },
  {
    id: 'vegetables', name: 'ירקות', one: 'ירק', e: '🥗',
    items: [['עגבנייה', '🍅'], ['מלפפון', '🥒'], ['גזר', '🥕'], ['תירס', '🌽'], ['חסה', '🥬'], ['פלפל', '🫑'], ['ברוקולי', '🥦'], ['תפוח אדמה', '🥔'], ['בצל', '🧅'], ['שום', '🧄'], ['חציל', '🍆']],
  },
  {
    id: 'foods', name: 'מאכלים', one: 'מאכל', e: '🥪',
    items: [['פיצה', '🍕'], ['לחם', '🍞'], ['גבינה', '🧀'], ['ביצה', '🥚'], ['ספגטי', '🍝'], ['עוגה', '🍰'], ['גלידה', '🍦'], ['המבורגר', '🍔'], ['פלאפל', '🧆'], ['אורז', '🍚'], ['מרק', '🍲'], ['עוגייה', '🍪']],
  },
  {
    id: 'vehicles', name: 'כלי תחבורה', one: 'כלי תחבורה', e: '🚦',
    items: [['מכונית', '🚗'], ['אוטובוס', '🚌'], ['רכבת', '🚆'], ['מטוס', '✈️'], ['אופניים', '🚲'], ['אונייה', '🚢'], ['מסוק', '🚁'], ['משאית', '🚚'], ['אופנוע', '🏍️'], ['סירה', '⛵'], ['טרקטור', '🚜'], ['קורקינט', '🛴']],
  },
  {
    id: 'clothes', name: 'בגדים', one: 'בגד', e: '👔',
    items: [['חולצה', '👕'], ['מכנסיים', '👖'], ['שמלה', '👗'], ['גרביים', '🧦'], ['נעליים', '👟'], ['כובע', '🧢'], ['מעיל', '🧥'], ['צעיף', '🧣'], ['כפפות', '🧤'], ['בגד ים', '🩱']],
  },
  {
    id: 'kitchen', name: 'כלי מטבח', one: 'כלי מטבח', e: '🍴',
    items: [['מחבת', '🍳'], ['כפית', '🥄'], ['סכין', '🔪'], ['קערה', '🥣'], ['צלחת', '🍽️'], ['ספל', '☕'], ['קומקום', '🫖'], ['מלחייה', '🧂'], ['צנצנת', '🫙']],
  },
  {
    id: 'furniture', name: 'רהיטים', one: 'רהיט', e: '🏠',
    items: [['כיסא', '🪑'], ['מיטה', '🛏️'], ['ספה', '🛋️'], ['שולחן', null, 'table'], ['ארון', null, 'closet'], ['מראה', '🪞'], ['מנורה', null, 'lamp'], ['מדף', null, 'shelf']],
  },
  {
    id: 'colors', name: 'צבעים', one: 'צבע', e: '🎨',
    items: [['אדום', '🔴'], ['כתום', '🟠'], ['צהוב', '🟡'], ['ירוק', '🟢'], ['כחול', '🔵'], ['סגול', '🟣'], ['חום', '🟤'], ['שחור', '⚫'], ['לבן', '⚪']],
  },
  {
    id: 'instruments', name: 'כלי נגינה', one: 'כלי נגינה', e: '🎵',
    items: [['גיטרה', '🎸'], ['תוף', '🥁'], ['פסנתר', '🎹'], ['חצוצרה', '🎺'], ['כינור', '🎻'], ['סקסופון', '🎷'], ['אקורדיון', '🪗'], ['חליל', null, 'flute']],
  },
  {
    id: 'professions', name: 'מקצועות', one: 'מקצוע', e: '🧑‍💼',
    items: [['רופאה', '👩‍⚕️'], ['כבאי', '👨‍🚒'], ['שוטרת', '👮‍♀️'], ['טבח', '👨‍🍳'], ['מורה', '🧑‍🏫'], ['חקלאית', '👩‍🌾'], ['פועל בניין', '👷'], ['טייס', '🧑‍✈️'], ['מכונאית', '👩‍🔧'], ['צייר', '🧑‍🎨'], ['אסטרונאוטית', '👩‍🚀']],
  },
  {
    id: 'school', name: 'חפצים בגן ובכיתה', one: 'חפץ מהגן ומהכיתה', e: '🏫',
    items: [['מספריים', '✂️'], ['צבע פסטל', '🖍️'], ['מכחול', '🖌️'], ['ספר', '📖'], ['עיפרון', '✏️'], ['תיק', '🎒'], ['מחברת', '📒'], ['סרגל', '📏'], ['עט', '🖊️']],
  },
  {
    id: 'toys', name: 'צעצועים', one: 'צעצוע', e: '🪆',
    items: [['דובי', '🧸'], ['כדור', '⚽'], ['בלון', '🎈'], ['עפיפון', '🪁'], ['פאזל', '🧩'], ['יו־יו', '🪀'], ['קובייה', '🎲'], ['רובוט', '🤖']],
  },
  {
    id: 'body', name: 'חלקי גוף', one: 'חלק בגוף', e: '🧍',
    items: [['עין', '👁️'], ['אוזן', '👂'], ['אף', '👃'], ['פה', '👄'], ['יד', '✋'], ['רגל', '🦵'], ['כף רגל', '🦶'], ['שן', '🦷'], ['לשון', '👅']],
  },
  {
    id: 'nature', name: 'דברים בטבע', one: 'דבר שיש בטבע', e: '🏞️',
    items: [['עץ', '🌳'], ['פרח', '🌻'], ['עלה', '🍃'], ['שמש', '☀️'], ['ירח', '🌙'], ['ענן', '☁️'], ['קשת', '🌈'], ['הר', '⛰️'], ['גל', '🌊'], ['אבן', '🪨'], ['כוכב', '⭐']],
  },
].map(c => ({ ...c, items: c.items.map(([t, e, i]) => (i ? { t, e: null, i } : { t, e })) }))

export const categoryById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]))

// Category pairs that overlap in meaning (an apple is also food), so they never meet in
// "what doesn't belong", sorting or as a wrong answer to "name the group".
export const OVERLAPS = [['foods', 'fruits'], ['foods', 'vegetables']]
// Pairs that are close in meaning — the "challenging" level of "what doesn't belong".
export const NEAR = [['fruits', 'vegetables'], ['school', 'toys'], ['kitchen', 'furniture'], ['clothes', 'body']]

const hasPair = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a))
export const overlaps = (a, b) => a === b || hasPair(OVERLAPS, a, b)
export const isNear = (a, b) => hasPair(NEAR, a, b)

export function shuffleWith(list, rand = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const pick = (list, rand) => list[Math.floor(rand() * list.length)]

// One "what doesn't belong" round: three items from one category and one from another.
// level 'easy' uses categories far apart; 'hard' uses close ones (fruit/vegetable, toy/school item…).
export function oddRound(level = 'easy', rand = Math.random) {
  const pairs = []
  for (const a of CATEGORIES) for (const b of CATEGORIES) {
    if (overlaps(a.id, b.id)) continue
    if ((level === 'hard') !== isNear(a.id, b.id)) continue
    pairs.push([a, b])
  }
  const [main, odd] = pick(pairs, rand)
  const three = shuffleWith(main.items, rand).slice(0, 3)
  const extra = pick(odd.items, rand)
  const items = shuffleWith([...three, extra], rand)
  return { main, odd, items, oddIndex: items.indexOf(extra) }
}

// Sorting: n items from each of two categories, mixed.
export function sortRound(aId, bId, n = 4, rand = Math.random) {
  const a = categoryById[aId], b = categoryById[bId]
  const items = shuffleWith([
    ...shuffleWith(a.items, rand).slice(0, n).map(item => ({ ...item, cat: a.id })),
    ...shuffleWith(b.items, rand).slice(0, n).map(item => ({ ...item, cat: b.id })),
  ], rand)
  return { a, b, items }
}

// "Name the group": four items of one category and three names to choose from.
export function nameRound(rand = Math.random, prevId) {
  const pool = CATEGORIES.filter(c => c.id !== prevId)
  const cat = pick(pool, rand)
  const wrong = shuffleWith(CATEGORIES.filter(c => !overlaps(c.id, cat.id)), rand).slice(0, 2)
  return { cat, items: shuffleWith(cat.items, rand).slice(0, 4), options: shuffleWith([cat, ...wrong], rand) }
}

// A good starting set of pairs for sorting (far apart → close).
export const SORT_PAIRS = [
  ['animals', 'vehicles'], ['clothes', 'foods'], ['fruits', 'vegetables'], ['instruments', 'kitchen'],
  ['toys', 'school'], ['body', 'clothes'], ['furniture', 'nature'], ['professions', 'animals'],
]

// Naming fluency ("אמרו 3 דברים ש…"): a prompt and some ideas for the adult, in case the child gets stuck.
export const FLUENCY = [
  { t: 'אמרו 3 חיות שחיות בים', e: '🌊', ideas: ['דג', 'דולפין', 'לווייתן', 'תמנון', 'כריש', 'סרטן'] },
  { t: 'אמרו 3 דברים שאוכלים בארוחת בוקר', e: '🥣', ideas: ['לחם', 'ביצה', 'גבינה', 'דייסה', 'ירקות', 'יוגורט'] },
  { t: 'אמרו 3 דברים צהובים', e: '💛', ideas: ['בננה', 'שמש', 'לימון', 'אפרוח', 'תירס', 'חלמון'] },
  { t: 'אמרו 3 דברים שיש בחדר האמבטיה', e: '🛁', ideas: ['סבון', 'מגבת', 'מברשת שיניים', 'כיור', 'מקלחת', 'שמפו'] },
  { t: 'אמרו 3 דברים שעפים', e: '🕊️', ideas: ['ציפור', 'מטוס', 'פרפר', 'מסוק', 'בלון', 'עפיפון'] },
  { t: 'אמרו 3 דברים שלובשים כשקר', e: '❄️', ideas: ['מעיל', 'כובע', 'צעיף', 'כפפות', 'מגפיים', 'סוודר'] },
  { t: 'אמרו 3 חיות שיש להן ארבע רגליים', e: '🐾', ideas: ['כלב', 'חתול', 'סוס', 'פרה', 'פיל', 'אריה'] },
  { t: 'אמרו 3 דברים שיש במטבח', e: '🍳', ideas: ['מקרר', 'תנור', 'כיור', 'צלחת', 'כוס', 'סיר'] },
  { t: 'אמרו 3 דברים שנוסעים על גלגלים', e: '🚗', ideas: ['מכונית', 'אופניים', 'אוטובוס', 'עגלה', 'קורקינט', 'רכבת'] },
  { t: 'אמרו 3 דברים קרים', e: '🧊', ideas: ['גלידה', 'קרח', 'שלג', 'ארטיק', 'מים מהמקרר'] },
  { t: 'אמרו 3 דברים שעושים בגן', e: '🎨', ideas: ['מציירים', 'שרים', 'משחקים בחצר', 'שומעים סיפור', 'אוכלים ארוחת עשר'] },
  { t: 'אמרו 3 דברים שעושים לפני השינה', e: '🌙', ideas: ['מצחצחים שיניים', 'לובשים פיג׳מה', 'קוראים ספר', 'מתקלחים', 'אומרים לילה טוב'] },
  { t: 'אמרו 3 דברים רכים', e: '🧸', ideas: ['כרית', 'דובי', 'שמיכה', 'חתלתול', 'צמר גפן'] },
  { t: 'אמרו 3 דברים עגולים', e: '⚽', ideas: ['כדור', 'גלגל', 'שעון', 'צלחת', 'עוגייה', 'בלון'] },
  { t: 'אמרו 3 דברים שאפשר לשתות', e: '🥤', ideas: ['מים', 'חלב', 'מיץ', 'שוקו', 'תה', 'מרק'] },
  { t: 'אמרו 3 דברים שיש בגן השעשועים', e: '🌳', ideas: ['מגלשה', 'נדנדה', 'ארגז חול', 'סולם', 'קרוסלה', 'ספסל'] },
]

// Opposites: [word, emoji, opposite, emoji].
export const OPPOSITES = [
  ['גדול', '🐘', 'קטן', '🐭'],
  ['חם', '🔥', 'קר', '❄️'],
  ['יום', '🌞', 'לילה', '🌙'],
  ['שמח', '😄', 'עצוב', '😢'],
  ['מהיר', '🐆', 'איטי', '🐢'],
  ['ער', '😃', 'ישן', '😴'],
  ['פתוח', '🔓', 'סגור', '🔒'],
  ['למעלה', '⬆️', 'למטה', '⬇️'],
  ['גבוה', '🏢', 'נמוך', '🏠'],
  ['רועש', '📢', 'שקט', '🤫'],
  ['רך', '🧸', 'קשה', '🪨'],
  ['כבד', '🏋️', 'קל', '🪶'],
].map(([a, ea, b, eb]) => ({ a: { t: a, e: ea }, b: { t: b, e: eb } }))

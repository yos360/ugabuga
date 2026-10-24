// "יחיד ורבים והטיית פעלים" — a graded workbook for grades ג׳–ד׳ (/printables/singular-plural-verbs-workbook).
// Pure data, shared by the printed sheets, the answer keys and the on-screen practice.
//
// Every sheet has: id, level, title, instr (instruction), example (an item of the same kind, shown solved)
// and one `kind`:
//   pick  — items { q, e?, options, a }: circle the right option (a = index)
//   write — items { q, e?, a }: write the answer next to the word (optional word bank)
//   sentence — items { q (with ___), hint, a }: fill the blank with the right form of the hint
//   match — pairs [[singular, plural, emoji?]], printed in two columns (the right-hand order is `order`)
//   table — head: column titles, rows: arrays of cells; a string cell is printed, { a } is a blank;
//           exampleNote explains which cells are the example, note is printed under the table
// `a` may be an array: the first form is shown, the others are also accepted on screen.
// Summary sheets add `rubric` (self-check lines with three faces).
// Every verb and plural form was checked by hand against standard Hebrew (Academy full spelling).

export const LEVELS = [
  { id: 'easy', label: 'קל', icon: '🌱', grade: 'מתאים לתחילת כיתה ג׳ ולחינוך המיוחד', desc: 'תמונות, מילים קצרות ומחסן מילים' },
  { id: 'regular', label: 'רגיל', icon: '✏️', grade: 'כיתה ג׳', desc: 'יוצאי דופן, שם תואר והווה' },
  { id: 'challenge', label: 'מאתגר', icon: '🚀', grade: 'כיתה ד׳', desc: 'עבר, עתיד והתאמה מתקדמת' },
]

const KID = { boy: '👦', girl: '👧', boys: '👦👦', girls: '👧👧' }

export const SHEETS = [
  // ───────────── קל ─────────────
  {
    id: 'one-or-many', level: 'easy', kind: 'pick', title: 'אחד או הרבה?',
    instr: 'הסתכלו בתמונה. יש אחד? הקיפו את המילה ביחיד. יש הרבה? הקיפו את המילה ברבים.',
    example: { e: '🍎🍎🍎', q: '', options: ['תפוח', 'תפוחים'], a: 1 },
    items: [
      { e: '🐶', q: '', options: ['כלב', 'כלבים'], a: 0 },
      { e: '🐟🐟🐟', q: '', options: ['דג', 'דגים'], a: 1 },
      { e: '🌸🌸', q: '', options: ['פרח', 'פרחים'], a: 1 },
      { e: '⭐', q: '', options: ['כוכב', 'כוכבים'], a: 0 },
      { e: '🎈🎈🎈', q: '', options: ['בלון', 'בלונים'], a: 1 },
      { e: '🚗', q: '', options: ['מכונית', 'מכוניות'], a: 0 },
      { e: '🎂🎂', q: '', options: ['עוגה', 'עוגות'], a: 1 },
      { e: '🐱', q: '', options: ['חתול', 'חתולים'], a: 0 },
    ],
  },
  {
    id: 'add-im', level: 'easy', kind: 'write', title: 'מוסיפים ־ים',
    instr: 'כתבו כל מילה ברבים: מוסיפים בסוף ־ים. אפשר להיעזר במחסן המילים.',
    example: { e: '🐴', q: 'סוס', a: 'סוסים' },
    bank: true,
    items: [
      { e: '🐶', q: 'כלב', a: 'כלבים' },
      { e: '🐟', q: 'דג', a: 'דגים' },
      { e: '🌸', q: 'פרח', a: 'פרחים' },
      { e: '⚽', q: 'כדור', a: 'כדורים' },
      { e: '🎈', q: 'בלון', a: 'בלונים' },
      { e: '🐱', q: 'חתול', a: 'חתולים' },
      { e: '🐘', q: 'פיל', a: 'פילים' },
      { e: '⭐', q: 'כוכב', a: 'כוכבים' },
    ],
  },
  {
    id: 'add-ot', level: 'easy', kind: 'write', title: 'מוסיפים ־ות',
    instr: 'כתבו כל מילה ברבים: מורידים את ה־ה או את ה־ת שבסוף, ומוסיפים ־ות.',
    example: { e: '👧', q: 'ילדה', a: 'ילדות' },
    bank: true,
    items: [
      { e: '🪆', q: 'בובה', a: 'בובות' },
      { e: '🐄', q: 'פרה', a: 'פרות' },
      { e: '🎂', q: 'עוגה', a: 'עוגות' },
      { e: '⛵', q: 'סירה', a: 'סירות' },
      { e: '👗', q: 'שמלה', a: 'שמלות' },
      { e: '🚗', q: 'מכונית', a: 'מכוניות' },
      { e: '☂️', q: 'מטרייה', a: ['מטריות'] },
      { e: '🥄', q: 'כפית', a: 'כפיות' },
    ],
  },
  {
    id: 'pairs-ayim', level: 'easy', kind: 'write', title: 'זוגות: ־יים',
    instr: 'דברים שבאים בזוג מקבלים בסוף ־יים. כתבו כל מילה בצורת הזוג.',
    example: { e: '👀', q: 'עין', a: 'עיניים' },
    bank: true,
    items: [
      { e: '✋', q: 'יד', a: 'ידיים' },
      { e: '🦵', q: 'רגל', a: 'רגליים' },
      { e: '👂', q: 'אוזן', a: 'אוזניים' },
      { e: '👟', q: 'נעל', a: 'נעליים' },
      { e: '🧦', q: 'גרב', a: 'גרביים' },
      { e: '🦷', q: 'שן', a: 'שיניים' },
      { e: '🦋', q: 'כנף', a: 'כנפיים' },
      { e: '🥾', q: 'מגף', a: 'מגפיים' },
    ],
  },
  {
    id: 'match-easy', level: 'easy', kind: 'match', title: 'מתאימים יחיד לרבים',
    instr: 'מתחו קו מכל מילה ביחיד אל אותה מילה ברבים.',
    example: { pair: ['ספר', 'ספרים', '📕'] },
    pairs: [['דג', 'דגים', '🐟'], ['פרח', 'פרחים', '🌸'], ['בלון', 'בלונים', '🎈'], ['מכונית', 'מכוניות', '🚗'], ['עוגה', 'עוגות', '🎂'], ['נעל', 'נעליים', '👟']],
    order: [3, 5, 0, 4, 1, 2],
  },
  {
    id: 'who-does', level: 'easy', kind: 'pick', title: 'מי עושה?',
    instr: 'הסתכלו מי עושה את הפעולה: ילד, ילדה, ילדים או ילדות. הקיפו את המילה המתאימה.',
    example: { e: KID.boy, q: 'הילד', options: ['אוכל', 'אוכלת'], a: 0 },
    items: [
      { e: KID.girl, q: 'הילדה', options: ['רץ', 'רצה'], a: 1 },
      { e: KID.boys, q: 'הילדים', options: ['שרים', 'שרות'], a: 0 },
      { e: KID.girls, q: 'הילדות', options: ['קופצות', 'קופצים'], a: 0 },
      { e: KID.boy, q: 'הילד', options: ['כותב', 'כותבת'], a: 0 },
      { e: KID.girl, q: 'הילדה', options: ['קוראת', 'קורא'], a: 0 },
      { e: KID.boys, q: 'הילדים', options: ['ישנות', 'ישנים'], a: 1 },
      { e: KID.girls, q: 'הילדות', options: ['צוחקים', 'צוחקות'], a: 1 },
      { e: KID.boy, q: 'הילד', options: ['מציירת', 'מצייר'], a: 1 },
    ],
  },
  {
    id: 'summary-easy', level: 'easy', kind: 'pick', title: 'סיכום: מה למדתי?', summary: true,
    instr: 'הקיפו את המילה המתאימה. בסוף סמנו איך הלך לכם.',
    example: { e: '🐴🐴', q: '', options: ['סוס', 'סוסים'], a: 1 },
    items: [
      { e: '🐶🐶', q: '', options: ['כלב', 'כלבים'], a: 1 },
      { e: '👀', q: '', options: ['עין', 'עיניים'], a: 1 },
      { e: '🎈', q: 'בלון', options: ['גדול', 'גדולה'], a: 0 },
      { e: '🌸🌸', q: 'פרחים', options: ['יפה', 'יפים'], a: 1 },
      { e: KID.girl, q: 'הילדה', options: ['שרה', 'שר'], a: 0 },
      { e: KID.girls, q: 'הילדות', options: ['אוכלים', 'אוכלות'], a: 1 },
    ],
    rubric: ['אני יודע/ת מתי זה יחיד ומתי רבים', 'אני יודע/ת להוסיף ־ים ו־ות', 'אני מכיר/ה מילים בזוג עם ־יים', 'אני יודע/ת לבחור פועל לילד, לילדה, לילדים ולילדות'],
  },

  // ───────────── רגיל ─────────────
  {
    id: 'plural-write', level: 'regular', kind: 'write', title: 'מיחיד לרבים',
    instr: 'כתבו כל מילה ברבים. בזכר מוסיפים בדרך כלל ־ים, ובנקבה בדרך כלל ־ות.',
    example: { q: 'ספר', a: 'ספרים' },
    items: [
      { q: 'תלמיד', a: 'תלמידים' },
      { q: 'מחברת', a: 'מחברות' },
      { q: 'מטוס', a: 'מטוסים' },
      { q: 'חולצה', a: 'חולצות' },
      { q: 'שיר', a: 'שירים' },
      { q: 'גינה', a: 'גינות' },
      { q: 'עגבנייה', a: 'עגבניות' },
      { q: 'מחשב', a: 'מחשבים' },
    ],
  },
  {
    id: 'which-ending', level: 'regular', kind: 'pick', title: 'איזו סיומת?',
    instr: 'הקיפו את צורת הרבים הנכונה. שימו לב: יש מילים שלא הולכות לפי הכלל!',
    example: { q: 'חלון', options: ['חלונים', 'חלונות'], a: 1 },
    items: [
      { q: 'שולחן', options: ['שולחנים', 'שולחנות'], a: 1 },
      { q: 'נמלה', options: ['נמלות', 'נמלים'], a: 1 },
      { q: 'אוזן', options: ['אוזנות', 'אוזניים'], a: 1 },
      { q: 'לילה', options: ['לילות', 'לילים'], a: 0 },
      { q: 'חלום', options: ['חלומים', 'חלומות'], a: 1 },
      { q: 'אבן', options: ['אבנים', 'אבנות'], a: 0 },
      { q: 'מקום', options: ['מקומים', 'מקומות'], a: 1 },
      { q: 'יונה', options: ['יונים', 'יונות'], a: 0 },
    ],
  },
  {
    id: 'irregular-match', level: 'regular', kind: 'match', title: 'מילים שמשתנות',
    instr: 'יש מילים שמשתנות כשהן עוברות לרבים. מתחו קו מהיחיד אל הרבים.',
    example: { pair: ['בן', 'בנים', '👦'] },
    pairs: [['איש', 'אנשים', '🧔'], ['אישה', 'נשים', '👩'], ['עיר', 'ערים', '🏙️'], ['בית', 'בתים', '🏠'], ['יום', 'ימים', '📅'], ['בת', 'בנות', '👧']],
    order: [2, 0, 4, 1, 5, 3],
  },
  {
    id: 'adjectives', level: 'regular', kind: 'pick', title: 'שם התואר מתאים',
    instr: 'שם התואר מתאים לשם העצם: זכר או נקבה, יחיד או רבים. הקיפו את המילה המתאימה.',
    example: { q: 'ילדות', options: ['גבוהים', 'גבוהות', 'גבוהה'], a: 1 },
    items: [
      { q: 'ילד', options: ['גבוה', 'גבוהה', 'גבוהים'], a: 0 },
      { q: 'ילדה', options: ['שמח', 'שמחה', 'שמחות'], a: 1 },
      { q: 'חתולים', options: ['קטנים', 'קטנות', 'קטן'], a: 0 },
      { q: 'עוגות', options: ['טעימים', 'טעימה', 'טעימות'], a: 2 },
      { q: 'כדורים', options: ['אדומות', 'אדומים', 'אדום'], a: 1 },
      { q: 'מכוניות', options: ['חדשים', 'חדשות', 'חדשה'], a: 1 },
      { q: 'ספר', options: ['מעניין', 'מעניינת', 'מעניינים'], a: 0 },
      { q: 'פרחים', options: ['יפים', 'יפות', 'יפה'], a: 0 },
    ],
  },
  {
    id: 'present-table', level: 'regular', kind: 'table', title: 'הפועל בהווה',
    instr: 'השלימו את הטבלה. בהווה הפועל משתנה לפי מי שעושה: זכר או נקבה, יחיד או רבים.',
    exampleNote: 'דוגמה: השורה הראשונה כבר מלאה.',
    head: ['הוא (גם: אני, אתה)', 'היא (גם: אני, את)', 'הם (גם: אנחנו, אתם)', 'הן (גם: אנחנו, אתן)'],
    exampleRow: ['כותב', 'כותבת', 'כותבים', 'כותבות'],
    rows: [
      ['קורא', { a: 'קוראת' }, { a: 'קוראים' }, { a: 'קוראות' }],
      ['לומד', { a: 'לומדת' }, { a: 'לומדים' }, { a: 'לומדות' }],
      ['הולך', { a: 'הולכת' }, { a: 'הולכים' }, { a: 'הולכות' }],
      ['שומע', { a: 'שומעת' }, { a: 'שומעים' }, { a: 'שומעות' }],
      ['רוקד', { a: 'רוקדת' }, { a: 'רוקדים' }, { a: 'רוקדות' }],
      ['משחק', { a: 'משחקת' }, { a: 'משחקים' }, { a: 'משחקות' }],
    ],
  },
  {
    id: 'present-sentences', level: 'regular', kind: 'sentence', title: 'משלימים משפטים בהווה',
    instr: 'כתבו את הפועל שבסוגריים בצורה המתאימה למשפט.',
    example: { q: 'מיכל ___ ספר.', hint: 'קורא', a: 'קוראת' },
    items: [
      { q: 'נועה ___ מכתב לסבתא.', hint: 'כותב', a: 'כותבת' },
      { q: 'יונתן ומאיה ___ בכדור.', hint: 'משחק', a: 'משחקים' },
      { q: 'הבנות ___ בהפסקה.', hint: 'רוקד', a: 'רוקדות' },
      { q: 'אתה ___ את המוזיקה?', hint: 'שומע', a: 'שומע' },
      { q: 'את ___ ארוחת בוקר.', hint: 'אוכל', a: 'אוכלת' },
      { q: 'אנחנו, הבנים, ___ לים.', hint: 'הולך', a: 'הולכים' },
      { q: 'דני ואני ___ במקהלה.', hint: 'שר', a: 'שרים' },
      { q: 'התלמידות ___ ציור גדול.', hint: 'מצייר', a: 'מציירות' },
    ],
  },
  {
    id: 'summary-regular', level: 'regular', kind: 'pick', title: 'סיכום ובדיקה עצמית', summary: true,
    instr: 'הקיפו את התשובה הנכונה. בסוף סמנו איך הלך לכם.',
    example: { q: 'ספר', options: ['ספרים', 'ספריים'], a: 0 },
    items: [
      { q: 'שולחן', options: ['שולחנות', 'שולחנים'], a: 0 },
      { q: 'עיר', options: ['עירים', 'ערים'], a: 1 },
      { q: 'בית', options: ['ביתים', 'בתים'], a: 1 },
      { q: 'החלונות ___', options: ['פתוחות', 'פתוחים'], a: 1 },
      { q: 'הילדות ___ בחצר', options: ['משחקות', 'משחקים'], a: 0 },
      { q: 'אתה ___ שיר', options: ['כותבת', 'כותב'], a: 1 },
    ],
    rubric: ['אני יודע/ת להפוך מילה מיחיד לרבים', 'אני מכיר/ה מילים שמשתנות: אנשים, נשים, ערים, בתים', 'אני מתאים/ה שם תואר לשם העצם', 'אני יודע/ת להטות פועל בהווה'],
  },

  // ───────────── מאתגר ─────────────
  {
    id: 'irregular-write', level: 'challenge', kind: 'write', title: 'יוצאי דופן ברבים',
    instr: 'כתבו את צורת הרבים. זהירות: כל המילים בדף לא הולכות לפי הכלל!',
    example: { q: 'חלון', a: 'חלונות' },
    items: [
      { q: 'שולחן', a: 'שולחנות' },
      { q: 'לילה', a: 'לילות' },
      { q: 'מקום', a: 'מקומות' },
      { q: 'חלום', a: 'חלומות' },
      { q: 'מילה', a: 'מילים' },
      { q: 'שנה', a: 'שנים' },
      { q: 'ביצה', a: 'ביצים' },
      { q: 'אבן', a: 'אבנים' },
    ],
  },
  {
    id: 'plural-to-singular', level: 'challenge', kind: 'write', title: 'מרבים ליחיד',
    instr: 'עכשיו הפוך: כתבו כל מילה ביחיד.',
    example: { q: 'ימים', a: 'יום' },
    items: [
      { q: 'אנשים', a: 'איש' },
      { q: 'נשים', a: 'אישה' },
      { q: 'ערים', a: 'עיר' },
      { q: 'בתים', a: 'בית' },
      { q: 'בנות', a: 'בת' },
      { q: 'שמות', a: 'שם' },
      { q: 'אבות', a: 'אב' },
      { q: 'עיניים', a: 'עין' },
    ],
  },
  {
    id: 'tricky-agreement', level: 'challenge', kind: 'pick', title: 'התאמה עם יוצאי דופן',
    instr: 'שם התואר הולך לפי המין של המילה ולא לפי הסיומת שלה. הקיפו את המילה המתאימה.',
    example: { q: 'שולחנות', options: ['גדולים', 'גדולות'], a: 0 },
    items: [
      { q: 'שנים', options: ['רבים', 'רבות'], a: 1 },
      { q: 'חלונות', options: ['פתוחים', 'פתוחות'], a: 0 },
      { q: 'מילים', options: ['חדשים', 'חדשות'], a: 1 },
      { q: 'ביצים', options: ['טריים', 'טריות'], a: 1 },
      { q: 'לילות', options: ['קרים', 'קרות'], a: 0 },
      { q: 'ערים', options: ['גדולים', 'גדולות'], a: 1 },
      { q: 'אבנים', options: ['כבדים', 'כבדות'], a: 1 },
      { q: 'חלומות', options: ['יפים', 'יפות'], a: 0 },
    ],
  },
  {
    id: 'past-table', level: 'challenge', kind: 'table', title: 'הפועל בעבר',
    instr: 'השלימו את הטבלה בזמן עבר. שימו לב לסוף המילה: ־תי, ־ת, ־ה, ־נו, ־ו.',
    exampleNote: 'דוגמה: הטור של ״לכתוב״ כבר מלא, וגם השורה של ״הוא״.',
    head: ['', 'לכתוב', 'ללמוד', 'לסגור'],
    rowHead: true,
    rows: [
      ['אני', 'כתבתי', { a: 'למדתי' }, { a: 'סגרתי' }],
      ['אתה', 'כתבת', { a: 'למדת' }, { a: 'סגרת' }],
      ['את', 'כתבת', { a: 'למדת' }, { a: 'סגרת' }],
      ['הוא', 'כתב', 'למד', 'סגר'],
      ['היא', 'כתבה', { a: 'למדה' }, { a: 'סגרה' }],
      ['אנחנו', 'כתבנו', { a: 'למדנו' }, { a: 'סגרנו' }],
      ['הם', 'כתבו', { a: 'למדו' }, { a: 'סגרו' }],
      ['הן', 'כתבו', { a: 'למדו' }, { a: 'סגרו' }],
    ],
  },
  {
    id: 'future-table', level: 'challenge', kind: 'table', title: 'הפועל בעתיד',
    instr: 'השלימו את הטבלה בזמן עתיד. בעתיד משתנה האות שבהתחלה: א, ת, י או נ.',
    exampleNote: 'דוגמה: הטור של ״לכתוב״ כבר מלא.',
    note: 'בעברית של היום אומרים ״הן יכתבו״, כמו ״הם יכתבו״. בלשון ספרותית אומרים גם ״הן תכתובנה״.',
    head: ['', 'לכתוב', 'לסגור', 'לשמור'],
    rowHead: true,
    rows: [
      ['אני', 'אכתוב', { a: 'אסגור' }, { a: 'אשמור' }],
      ['אתה', 'תכתוב', { a: 'תסגור' }, { a: 'תשמור' }],
      ['את', 'תכתבי', { a: 'תסגרי' }, { a: 'תשמרי' }],
      ['הוא', 'יכתוב', { a: 'יסגור' }, { a: 'ישמור' }],
      ['היא', 'תכתוב', { a: 'תסגור' }, { a: 'תשמור' }],
      ['אנחנו', 'נכתוב', { a: 'נסגור' }, { a: 'נשמור' }],
      ['הם', 'יכתבו', { a: 'יסגרו' }, { a: 'ישמרו' }],
      ['הן', 'יכתבו', { a: ['יסגרו', 'תסגורנה'] }, { a: ['ישמרו', 'תשמורנה'] }],
    ],
  },
  {
    id: 'tenses-sentences', level: 'challenge', kind: 'sentence', title: 'עבר, הווה ועתיד',
    instr: 'קראו את כל המשפט: מתי זה קרה? כתבו את הפועל שבסוגריים בזמן ובצורה המתאימים.',
    example: { q: 'אתמול דני ___ את הדלת.', hint: 'לסגור', a: 'סגר' },
    items: [
      { q: 'אתמול נועה ___ מכתב לסבתא.', hint: 'לכתוב', a: 'כתבה' },
      { q: 'מחר אנחנו ___ את החלונות לפני הגשם.', hint: 'לסגור', a: 'נסגור' },
      { q: 'בשבוע שעבר הם ___ שיר חדש.', hint: 'ללמוד', a: 'למדו' },
      { q: 'מחר את ___ לי מקום בתור?', hint: 'לשמור', a: 'תשמרי' },
      { q: 'בכל יום שלישי הבנות ___ בחוג.', hint: 'לרקוד', a: 'רוקדות' },
      { q: 'אתמול אני ___ סיפור מצחיק.', hint: 'לשמוע', a: 'שמעתי' },
      { q: 'מחר הוא ___ את התשובה על הלוח.', hint: 'לכתוב', a: 'יכתוב' },
      { q: 'עכשיו אתה ___ חשבון.', hint: 'ללמוד', a: 'לומד' },
    ],
  },
  {
    id: 'summary-challenge', level: 'challenge', kind: 'pick', title: 'סיכום ובדיקה עצמית', summary: true,
    instr: 'הקיפו את התשובה הנכונה. בסוף סמנו איך הלך לכם.',
    example: { q: 'אתמול הוא ___ ספר', options: ['קרא', 'יקרא'], a: 0 },
    items: [
      { q: 'לילה, ברבים:', options: ['לילים', 'לילות'], a: 1 },
      { q: 'שנים ___', options: ['טובות', 'טובים'], a: 0 },
      { q: 'אתמול הן ___ שיר', options: ['כתבנו', 'כתבו'], a: 1 },
      { q: 'מחר אני ___ מכתב', options: ['אכתוב', 'יכתוב'], a: 0 },
      { q: 'מחר את ___ את הדלת', options: ['תסגור', 'תסגרי'], a: 1 },
      { q: 'אתמול אנחנו ___ סיפור', options: ['שמענו', 'שמעו'], a: 0 },
    ],
    rubric: ['אני מכיר/ה מילים יוצאות דופן ברבים', 'אני מתאים/ה שם תואר גם כשהסיומת מטעה', 'אני יודע/ת להטות פועל בעבר', 'אני יודע/ת להטות פועל בעתיד'],
  },
]

export const sheetsOf = level => level === 'all' ? SHEETS : SHEETS.filter(s => s.level === level)
export const levelOf = id => LEVELS.find(l => l.id === id)

// All accepted forms of an answer, and the one printed in the key.
export const answers = a => (Array.isArray(a) ? a : [a])
export const shown = a => answers(a)[0]

// Compare a typed answer: niqqud, punctuation and spaces don't matter.
export const normalize = s => String(s || '').replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '')
export const isCorrect = (typed, a) => !!normalize(typed) && answers(a).some(x => normalize(x) === normalize(typed))

// Everything a child answers on one sheet, as a flat list ({ key, kind: 'pick'|'write', options?, a }).
export function questionsOf(sheet) {
  if (sheet.kind === 'pick') return sheet.items.map((it, i) => ({ key: `${sheet.id}-${i}`, kind: 'pick', options: it.options, a: it.a }))
  if (sheet.kind === 'write' || sheet.kind === 'sentence') return sheet.items.map((it, i) => ({ key: `${sheet.id}-${i}`, kind: 'write', a: it.a }))
  if (sheet.kind === 'match') return sheet.pairs.map((p, i) => ({ key: `${sheet.id}-${i}`, kind: 'pick', options: sheet.order.map(j => sheet.pairs[j][1]), a: sheet.order.indexOf(i) }))
  return sheet.rows.flatMap((row, r) => row.map((c, j) => (c && typeof c === 'object' ? { key: `${sheet.id}-${r}-${j}`, kind: 'write', a: c.a } : null)).filter(Boolean))
}

// Strings that get niqqud when "instructions with niqqud" is on.
export const instructionStrings = list => list.flatMap(s => [s.instr, s.exampleNote, s.note].filter(Boolean))

// One source of truth for section names and the grouped tools menu.
// Navbar, Footer and the /tools index all read from here, so a section is
// called the same thing everywhere.
export const SECTION = {
  games: 'משחקים',
  birthday: 'יום הולדת',
  classroom: 'לכיתה',
  create: 'יוצרים',
  ideas: 'השראה',
  printables: 'דפים להדפסה',
  tools: 'כלים',
  suppliers: 'ספקים',
  gifts: 'מתנות',
  guides: 'מדריכים',
}

export const MENU_GROUPS = [
  {
    title: '🎂 ליום הולדת ולמסיבה', to: '/birthday',
    items: [
      { to: '/calculator', label: 'מחשבון מסיבה', icon: '🧮' },
      { to: '/invitation', label: 'מחולל הזמנות', icon: '📨' },
      { to: '/greeting', label: 'מחולל ברכות', icon: '💌' },
      { to: '/tools/bring-list', label: 'רשימת "מי מביא מה"', icon: '📋' },
      { to: '/tools/birthday-famous', label: 'מי נולד ביום שלי?', icon: '⭐' },
      { to: '/gifts', label: 'רעיונות למתנות', icon: '🎁' },
      { to: '/suppliers', label: 'ספקים לימי הולדת', icon: '🎪' },
    ],
  },
  {
    title: '🏫 לכיתה ולגן', to: '/classroom',
    items: [
      { to: '/classroom/quiz', label: 'מבחן אמריקאי אונליין', icon: '📝' },
      { to: '/classroom/first-grade', label: 'הכנה לכיתה א׳', icon: '✏️' },
      { to: '/tools/trivia-quiz', label: 'טריוויה לכיתה', icon: '🎯' },
      { to: '/tools/eretz-ir', label: 'ארץ עיר', icon: '🌍' },
      { to: '/tools/experiment-maker', label: 'מחולל ניסויים', icon: '🧪' },
      { to: '/printables/hebrew-letters', label: 'אותיות בעברית לכתיבה', icon: '✏️' },
      { to: '/printables/abc-letters', label: 'אותיות באנגלית לכתיבה', icon: '🔤' },
      { to: '/printables/roots-project', label: 'עבודת שורשים', icon: '🌳' },
      { to: '/games/kindergarten', label: 'משחקים לגן', icon: '🧸' },
    ],
  },
  {
    title: '🖨️ יוצרים ומדפיסים', to: '/create',
    items: [
      { to: '/printables', label: 'דפים להדפסה', icon: '🖨️' },
      { to: '/printables/coloring', label: 'דפי צביעה', icon: '🖍️' },
      { to: '/printables/mandalas', label: 'מנדלות', icon: '🌀' },
      { to: '/tools/crossword-maker', label: 'מחולל תשבצים', icon: '✏️' },
      { to: '/tools/word-search-maker', label: 'מחולל תפזורת', icon: '🔎' },
      { to: '/tools/bingo-maker', label: 'מחולל בינגו', icon: '🎟️' },
      { to: '/tools/scavenger-hunt-maker', label: 'חפש את המטמון', icon: '🗺️' },
      { to: '/tools/escape-rooms', label: 'חדרי בריחה', icon: '🔐' },
      { to: '/tools/emoji-studio', label: 'אימוג׳י סטודיו', icon: '😀' },
    ],
  },
  {
    title: '🎲 כלים למשחק', to: '/tools',
    items: [
      { to: '/tools/team-generator', label: 'מחלק קבוצות', icon: '👥' },
      { to: '/tools/random-picker', label: 'גלגל שמות', icon: '🎡' },
      { to: '/tools/countdown-timer', label: 'טיימר', icon: '⏱️' },
      { to: '/tools/scoreboard', label: 'לוח ניקוד', icon: '📊' },
      { to: '/tools/dice', label: 'קוביה', icon: '🎲' },
      { to: '/tools/coin-flip', label: 'הטלת מטבע', icon: '🪙' },
      { to: '/tools/truth-or-buga', label: 'אמת או בוגה', icon: '🎭' },
      { to: '/tools/spin-the-bottle', label: 'סובב את הבקבוק', icon: '🍾' },
      { to: '/tools/drawing-prompt', label: 'מה לצייר?', icon: '🎨' },
      { to: '/tools/riddles', label: 'חידות', icon: '🧩' },
      { to: '/tools/joke', label: 'בדיחה של בוגה', icon: '😂' },
      { to: '/tools/buga-town', label: 'בוגה טאון', icon: '🏙️' },
    ],
  },
]

export const MENU_ACTIVE_PREFIXES = ['/tools', '/calculator', '/greeting', '/invitation', '/printables', '/gifts']

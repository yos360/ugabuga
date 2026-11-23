// "This week's sheet" feeds (/calendar/weekly-<key>.ics): per grade, the pages the calendar rotates through, one a week.
// Every path must be a real page: tests/calendar-feeds.test.mjs checks them against the routes.
const LETTERS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']
const GAMES = ['kita-a', 'kita-b', 'kita-g', 'kita-d', 'kita-h', 'kita-v']

export const WEEKLY_GRADES = [
  { key: 'gan', name: 'גן', short: 'גן', hub: '/gan', links: [
    ['איפה שומעים את הצליל?', '/printables/sound-position'], ['צביעה לפי מספרים', '/printables/color-by-number'], ['כרטיסיות אותיות', '/printables/letter-flashcards'],
    ['מבוכים', '/printables/mazes'], ['חוברת עבודה לגן חובה', '/booklets/kindergarten'], ['דפי צביעה', '/printables/coloring'],
    ['מספרים למעבר בעיפרון', '/printables/numbers'], ['פאזל מילה', '/printables/word-puzzles'],
  ] },
  ...LETTERS.map((letter, i) => {
    const n = i + 1
    return { key: `grade-${n}`, name: `כיתה ${letter}`, short: `כיתה ${letter}`, hub: `/classroom/by-grade#grade-${n}`, links: [
      [`חשבון לכיתה ${letter}`, `/math/grade-${n}`],
      [`הבנת הנקרא לכיתה ${letter}`, `/learn/reading/grade-${n}`],
      ...(n <= 4 ? [['הכתבה', '/learn/dictation']] : []),
      ...(n >= 3 ? [['אנגלית לפי כיתה', '/learn/english/by-grade']] : []),
      ...(n >= 5 ? [[`אנסין באנגלית לכיתה ${letter}`, `/unseen/english/grade-${n}`]] : []),
      ['דפי עבודה בחשבון', '/printables/math-worksheets'],
      [`משחקים לכיתה ${letter}`, `/games/${GAMES[i]}`],
    ] }
  }),
]
export const weeklyGrade = key => WEEKLY_GRADES.find(g => g.key === key)

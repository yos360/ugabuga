// Four kinds of home page (experiment "home-kind", src/utils/experiments.js). Instead of one page whose
// cards rotate every few seconds, each visitor gets one kind and keeps it: its own headline, its own
// order of the four doors, and a fixed set of cards (the same tools that used to rotate, grouped by who
// needs them). The default — what search engines and the first paint see — is 'print'.
// picks: a path from homeCards.js's pool (ITEMS/STARS) or a full card [emoji, title, desc, to, tag].
export const KIND_DEFAULT = 'print'

export const KINDS = {
  print: {
    h1: 'דפי צביעה, דפי עבודה וחוברות להדפסה — בחינם, בלי הרשמה',
    lead: 'בוחרים כיתה או נושא, מדפיסים ומתחילים. לחוברות יש דף תשובות, והכול בלי הרשמה ובלי תשלום.',
    doors: ['print', 'class', 'gan', 'play'],
    cardsTitle: 'עוד כלים להדפסה ולשיעורי בית',
    picks: [
      ['🖍️', 'דפי צביעה להדפסה', 'מאות ציורים לפי נושא וחג, קווים עבים וברורים', '/printables/coloring', 'להדפסה'],
      ['📒', 'חוברות עבודה לפי כיתה', 'PDF עם דף תשובות — מהגן ועד חטיבת הביניים', '/booklets', 'להדפסה'],
      '/tools/crossword-maker', '/tools/word-search-maker', '/tools/fraction-calculator', '/tools/grade-average', '/tools/qr-code', '/tools/pdf', '/typing',
    ],
    spotlight: ['/learn/dictation', '/dictionary', '/tools/pdf', '/tools/qr-code'],
  },
  class: {
    h1: 'חומר מוכן לכיתה: דפי עבודה, חימום לפני השיעור וחידון חי — בחינם',
    lead: 'מקרינים על הלוח, מדפיסים לתלמידים או פותחים חידון שכולם עונים עליו מהטלפון. בלי הרשמה.',
    doors: ['class', 'print', 'gan', 'play'],
    cardsTitle: 'עוד כלים לשיעור',
    picks: [
      ['🏃', 'חימום לפני השיעור', '3 דקות של תנועה על המקרן, עם טיימר', '/classroom/warm-up', 'לכיתה'],
      '/live', '/planner', '/tools/team-generator', '/tools/scoreboard', '/tools/bingo-maker', '/tools/experiment-maker', '/tools/nakdan',
      ['🎒', 'כל החומר לפי כיתה', 'חשבון, קריאה ואנגלית לכל כיתה מא׳ עד ח׳', '/classroom/by-grade', 'לכיתה'],
    ],
    spotlight: ['/classroom/quiz', '/learn/dictation', '/dictionary', '/tools/nakdan'],
  },
  gan: {
    h1: 'הכול לגן: דפים להדפסה, יצירה ומשחקים — בחינם, בלי הרשמה',
    lead: 'נושאי החודש, דפי צביעה וחוברות לגן חובה, כרטיסי רגשות ותרגול דיבור — מוכן להדפסה.',
    doors: ['gan', 'print', 'class', 'play'],
    cardsTitle: 'עוד לגן ולצוות החינוכי',
    picks: [
      ['🧸', 'לגננת — נושאי החודש', 'דפים, יצירה ומשחקים לפי חודשי השנה', '/gan', 'לגן'],
      ['📘', 'חוברת עבודה לגן חובה', 'ספירה, אותיות והכנה לכיתה א׳ להדפסה', '/booklets/kindergarten', 'לגן'],
      '/printables/emotion-cards', '/printables/sensory-communication-cards', '/speech/language', '/speech/minimal-pairs', '/speech', '/speech/aac', '/tools/bring-list',
    ],
    spotlight: ['/dictionary', '/learn/dictation'],
  },
  play: {
    h1: 'משחקים וחידות לילדים — מתחילים לשחק בלחיצה',
    lead: 'משחקים, חידות וכלים מצחיקים, ישר בדפדפן. בחינם ובלי להירשם.',
    doors: ['play', 'print', 'class', 'gan'],
    cardsTitle: 'עוד לשחק ולגלות',
    picks: [
      ['🎮', 'אזור ילדים', 'משחקים, צביעה במסך וסיפורים — הכול לבד', '/kids', 'לשחק'],
      '/live', '/tools/eretz-ir', '/typing', '/tools/emoji', '/tools/gematria', '/tools/hebrew-birthday', '/tools/birthday-famous', '/tools/experiment-maker',
    ],
    spotlight: ['/rubiks-cube', '/flags/quiz', '/music/piano', '/learn/ai/teach-the-robot'],
  },
}

// Resolve a kind's picks against a pool of cards (homeCards.js ITEMS + STARS).
export function kindCards(kindId, pool) {
  const kind = KINDS[kindId] || KINDS[KIND_DEFAULT]
  const byTo = new Map(pool.map(card => [card[3], card]))
  return kind.picks.map(p => (typeof p === 'string' ? byTo.get(p) : p)).filter(Boolean)
}

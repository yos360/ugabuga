// Topic chips of /printables (each sheet can sit under more than one topic). Shared with the
// print recommendations, so a sheet's topics are defined once.
// Holiday sheets live under /holidays — shown here only under the "חגים" chip.
export const HOLIDAY_SHEETS = [
  ['rosh-hashana', 'דפי צביעה לראש השנה', '🍎'], ['sukkot', 'דפי צביעה לסוכות', '🌿'], ['hanukkah', 'דפי צביעה לחנוכה', '🕎'],
  ['tu-bishvat', 'דפי צביעה לט״ו בשבט', '🌳'], ['pesach', 'דפי צביעה לפסח', '🫓'], ['yom-haatzmaut', 'דפי צביעה ליום העצמאות', '🎆'],
  ['lag-baomer', 'דפי צביעה לל״ג בעומר', '🔥'], ['shavuot', 'דפי צביעה לשבועות', '🌾'],
].map(([slug, title, emoji]) => ({ slug: 'holiday-' + slug, href: `/holidays/${slug}/coloring`, title, emoji, count: 'חגים', desc: 'דפי צביעה לחג, מוכנים להדפסה.' }))
  .concat({ slug: 'holiday-hanukkah-worksheets', href: '/holidays/hanukkah/worksheets', title: 'דפי עבודה לחנוכה', emoji: '✏️', count: 'חגים', desc: 'דפי עבודה לגן ולכיתה א׳ בנושא חנוכה.' })
  .concat({ slug: 'holiday-purim-masks', href: '/printables/purim-masks', title: 'מסכות לפורים לגזירה', emoji: '🎭', count: 'חגים', desc: '9 מסכות — בצבע או לצביעה.' })

// Topic chips. Each sheet can sit under more than one topic.
export const TOPICS = [
  { id: 'birthday', label: '🎂 ליום הולדת', slugs: ['birthday-crown', 'gift-box', 'fortune-teller', 'birthday-newspaper', 'birthday-checklist', 'birthday-signs', 'certificates', 'name-tags', 'thank-you', 'photo-props', 'board-game', 'coloring'] },
  { id: 'math', label: '🔢 חשבון', slugs: ['math-worksheets', 'clock-worksheets', 'fractions-worksheets', 'dominoes', 'numbers', 'sudoku', 'count-and-write', 'color-by-number', 'color-by-answer', 'dot-to-dot'] },
  { id: 'letters', label: '🔤 אותיות ומילים', slugs: ['letters', 'hebrew-letters', 'abc-letters', 'letter-flashcards', 'letter-strip', 'word-tracing', 'match-word', 'opposites', 'synonyms', 'color-by-letter'] },
  { id: 'coloring', label: '🖍️ צביעה ויצירה', slugs: ['coloring', 'mandalas', 'symmetry', 'color-by-number', 'color-by-answer', 'color-by-letter', 'dot-to-dot', 'photo-props'] },
  { id: 'motor', label: '✂️ מוטוריקה וחשיבה', slugs: ['fine-motor', 'mazes', 'find-differences', 'complete-pattern', 'silhouette-match', 'cut-and-order', 'hidden-object', 'missing-picture', 'mixed-activities', 'symmetry', 'dot-to-dot'] },
  { id: 'holidays', label: '🕎 חגים', extra: HOLIDAY_SHEETS },
  { id: 'home', label: '🏠 לבית ולארגון', slugs: ['name-labels', 'allergy-signs', 'lunchbox-notes', 'home-charts', 'chore-chart', 'reward-chart', 'toothbrushing-chart', 'potty-chart', 'class-schedule', 'calendar-2027', 'calendar-5787', 'lined-paper'] },
  { id: 'crafts', label: '✂️ משחקים ויצירה מנייר', slugs: ['memory-game', 'tic-tac-toe', 'dominoes', 'fortune-teller', 'gift-box', 'purim-masks', 'birthday-crown', 'board-game', 'photo-props'] },
  { id: 'school', label: '🏫 לכיתה ולגן', slugs: ['name-labels', 'allergy-signs', 'class-schedule', 'calendar-5787', 'clock-worksheets', 'fractions-worksheets', 'lined-paper', 'roots-project', 'math-worksheets', 'letters', 'hebrew-letters', 'letter-flashcards', 'fine-motor', 'numbers', 'mixed-activities'] },
]

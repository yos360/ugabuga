// One source of truth for the site navigation. Navbar (top bar, mega panels,
// mobile accordion), Footer, the /tools site map and the static search index
// all read from here, so a section is called the same thing everywhere.
//
// Information architecture (owner-approved, Oct 2026): six domains, each page
// listed in exactly ONE domain, plus a separate "לכיתה" button for teachers.
// Items marked `shortcut: true` (only inside the classroom panel) are links to
// pages whose primary home is another domain.
export const SECTION = {
  games: 'משחקים',
  learn: 'לומדים',
  printables: 'להדפסה',
  birthday: 'יום הולדת',
  holidays: 'שבתות וחגים',
  family: 'משפחה',
  classroom: 'לכיתה',
  tools: 'כלים',
}

export const KIDS_ZONE = { to: '/kids', label: 'אזור ילדים — לשחק לבד', icon: '🧸' }

export const MENU_DOMAINS = [
  {
    id: 'games', label: SECTION.games, icon: '🎮', to: '/games',
    landingLabel: 'כל המשחקים',
    prefixes: ['/games', '/online-games', '/game-of-the-day', '/sudoku', '/chess', '/board-games', '/tools', '/trivia', '/riddles', '/jokes', '/joke', '/questions', '/dice-games', '/dice', '/time-tunnel', '/eretz-ir', '/kids', '/rubiks-cube', '/quiz', '/live', '/play', '/buga-town', '/bugatown', '/timer', '/countdown', '/scoreboard', '/team-generator', '/random-picker', '/wheel', '/coin-flip', '/truth-or-dare', '/truth-or-buga', '/emet-o-buga', '/spin-the-bottle', '/drawing-prompt'],
    groups: [
      {
        title: 'לשחק לבד', icon: '🧸',
        items: [{ ...KIDS_ZONE, highlight: true }],
      },
      {
        title: 'משחקי אונליין', icon: '🕹️', to: '/online-games',
        items: [
          { to: '/online-games/today', label: 'אתגר היום — מתחלף כל יום', icon: '🌟' },
          { to: '/online-games/marathon', label: 'מרתון משחקים — 8 ברצף', icon: '🏃' },
          { to: '/chess', label: 'שחמט אונליין — נגד המחשב או חבר', icon: '♟️' },
          { to: '/sudoku', label: 'סודוקו — אונליין, יומי והדפסה', icon: '🔢' },
          { to: '/online-games/battleship', label: 'צוללות', icon: '⚓' },
          { to: '/online-games/falling-blocks', label: 'בלוקים נופלים', icon: '🧱' },
          { to: '/online-games/whack-a-mole', label: 'הכה בחפרפרת', icon: '🔨' },
          { to: '/online-games/sliding-puzzle', label: 'פאזל הזזה', icon: '🧩' },
          { to: '/online-games/word-guess', label: 'ניחוש מילים — 5 אותיות', icon: '🟩' },
          { to: '/online-games/flying-cubes', label: 'קוביות מעופפות 3D', icon: '🧊' },
          { to: '/online-games/arrow-escape', label: 'חיצים בורחים — 300 שלבים', icon: '➡️' },
          { to: '/online-games/ball-sort', label: 'מיון כדורים', icon: '🧪' },
          { to: '/online-games/merge-2048', label: 'מכפילים עד 2048', icon: '🔢' },
          { to: '/online-games/block-puzzle', label: 'מסיבת בלוקים', icon: '🟨' },
          { to: '/online-games/traffic-jam', label: 'פקק תנועה', icon: '🚚' },
          { to: '/online-games/solitaire', label: 'סוליטר', icon: '🃏' },
          { to: '/online-games/spider-solitaire', label: 'סוליטר עכביש', icon: '🕷️' },
          { to: '/online-games/minesweeper', label: 'שולה מוקשים', icon: '💣' },
          { to: '/online-games/memory', label: 'משחק הזיכרון', icon: '🧠' },
          { to: '/online-games/snake', label: 'נחש', icon: '🐍' },
        ],
      },
      {
        title: 'משחקים לקבוצה, לכיתה ולגן', icon: '👫', to: '/games',
        items: [
          { to: '/live', label: 'בוגה לייב — חידון חי לעד 100 משתתפים', icon: '⚡' },
          { to: '/games/kindergarten', label: 'משחקים לגן', icon: '🧸' },
          { to: '/games/classroom', label: 'משחקים לכיתה', icon: '🏫' },
          { to: '/games/kita-a', label: 'משחקים לכיתה א׳', icon: '✏️' },
          { to: '/games/no-equipment', label: 'משחקים בלי ציוד', icon: '🙌' },
          { to: '/games/5-minutes', label: 'משחקים של 5 דקות', icon: '⏱️' },
          { to: '/games/icebreaker', label: 'משחקי שובר קרח', icon: '🧊' },
          { to: '/games/movement', label: 'משחקי תנועה', icon: '🏃' },
          { to: '/games/quiet', label: 'משחקים שקטים', icon: '🤫' },
          { to: '/game-of-the-day', label: 'משחק היום', icon: '📅' },
        ],
      },
      {
        title: 'כלים למשחק', icon: '🎲',
        items: [
          { to: '/tools/hours-calculator', label: 'מחשבון שעות', icon: '🕒' },
          { to: '/tools/date-calculator', label: 'מחשבון תאריכים', icon: '📅' },
          { to: '/tools/world-clock', label: 'שעון עולמי', icon: '🌍' },
          { to: '/tools/word-count', label: 'ספירת מילים', icon: '📝' },
          { to: '/tools/team-generator', label: 'מחלק קבוצות', icon: '👥' },
          { to: '/tools/random-picker', label: 'גלגל מזל', icon: '🎡' },
          { to: '/tools/countdown-timer', label: 'טיימר', icon: '⏱️' },
          { to: '/tools/stopwatch', label: 'סטופר עם הקפות', icon: '⏱️' },
          { to: '/tools/qr-code', label: 'יצירת קוד QR', icon: '🔳' },
          { to: '/tools/percent-calculator', label: 'מחשבון אחוזים', icon: '%' },
          { to: '/tools/scoreboard', label: 'לוח ניקוד', icon: '📊' },
          { to: '/tools/dice', label: 'קובייה', icon: '🎲' },
          { to: '/tools/coin-flip', label: 'הטלת מטבע', icon: '🪙' },
          { to: '/tools/bmi', label: 'מחשבון BMI', icon: '⚖️' },
          { to: '/tools/fraction-calculator', label: 'מחשבון שברים', icon: '➗' },
          { to: '/tools/quadratic-equation', label: 'משוואה ריבועית', icon: '📐' },
          { to: '/tools/grade-average', label: 'מחשבון ממוצע ציונים', icon: '🎓' },
          { to: '/tools/age-calculator', label: 'בן כמה אני?', icon: '🎂' },
          { to: '/emoji', label: 'אימוג׳י וסמיילים להעתקה', icon: '😀' },
          { to: '/tools/gematria', label: 'מחשבון גימטריה', icon: '🔢' },
          { to: '/tools/truth-or-buga', label: 'אמת או בוגה', icon: '🎭' },
          { to: '/tools/spin-the-bottle', label: 'סובב את הבקבוק', icon: '🔄' },
          { to: '/tools/drawing-prompt', label: 'מה לצייר?', icon: '🎨' },
          { to: '/music/metronome', label: 'מטרונום', icon: '🥁' },
          { to: '/music/tuner', label: 'טיונר לגיטרה', icon: '🎸' },
          { to: '/printables/name-labels', label: 'מדבקות שם', icon: '🏷️' },
          { to: '/rubiks-cube', label: 'פתרון קובייה הונגרית', icon: '🧊' },
          { to: '/tools/riddles', label: 'חידות', icon: '🧩' },
          { to: '/tools/joke', label: 'בדיחה של בוגה', icon: '😂' },
          { to: '/tools/buga-town', label: 'בוגה טאון', icon: '🏙️' },
        ],
      },
      {
        title: 'חידות, טריוויה ומשחקי שולחן', icon: '🧠', to: '/trivia/topics',
        items: [
          { to: '/trivia/topics', label: 'חידוני טריוויה לפי נושא', icon: '🎯' },
          { to: '/trivia/with-answers', label: 'שאלות טריוויה עם תשובות', icon: '🧠' },
          { to: '/riddles/topics', label: 'חידות לפי נושא וגיל', icon: '🧩' },
          { to: '/jokes/topics', label: 'בדיחות לילדים', icon: '😂' },
          { to: '/jokes/keresh', label: 'בדיחות קרש', icon: '🪵' },
          { to: '/questions', label: 'שאלות לשיחה ולמשחק', icon: '❓' },
          { to: '/tools/eretz-ir', label: 'ארץ עיר', icon: '🌍' },
          { to: '/board-games', label: 'משחקי לוח: דמקה, שחמט ועוד', icon: '♟️' },
          { to: '/dice-games', label: 'משחקי קוביות', icon: '🎲' },
          { to: '/time-tunnel', label: 'מנהרת הזמן', icon: '⏳' },
        ],
      },
    ],
  },
  {
    id: 'learn', label: SECTION.learn, icon: '📚', to: '/learn',
    landingLabel: 'לומדים — כל הנושאים',
    prefixes: ['/learn', '/math', '/letters', '/words', '/english', '/abc', '/languages', '/typing', '/music', '/discover', '/signs', '/flags', '/animals', '/logic-puzzles', '/classroom/first-grade', '/printables/math-worksheets', '/printables/hebrew-letters', '/printables/abc-letters', '/printables/roots-project'],
    groups: [
      {
        title: 'חשבון', icon: '🧮', to: '/math',
        items: [
          { to: '/math', label: 'מתמטיקה לפי כיתה (א׳–י״ב)', icon: '🧮' },
          { to: '/learn/multiplication-table', label: 'לוח הכפל', icon: '✖️' },
          { to: '/learn/times-tables', label: 'תרגול לוח הכפל', icon: '⏱️' },
          { to: '/printables/math-worksheets', label: 'דפי עבודה בחשבון', icon: '➕' },
          { to: '/logic-puzzles', label: 'תשבצי היגיון', icon: '🧠' },
          { to: '/learn/gifted-test', label: 'הכנה למבחן מחוננים', icon: '💡' },
          { to: '/learn/psychometric-kids', label: 'פסיכומטרי לילדים', icon: '🎓' },
        ],
      },
      {
        title: 'עברית וקריאה', icon: '🔤', to: '/letters',
        items: [
          { to: '/classroom/first-grade', label: 'הכנה לכיתה א׳', icon: '✏️' },
          { to: '/letters', label: 'לימוד אותיות בעברית', icon: '🔤' },
          { to: '/letters/game', label: 'משחק אותיות לגן', icon: '🎮' },
          { to: '/printables/hebrew-letters', label: 'אותיות בעברית לכתיבה', icon: '✏️' },
          { to: '/learn/dictation', label: 'הכתבה', icon: '✍️' },
          { to: '/tools/nakdan', label: 'נקדן אוטומטי', icon: '🪄' },
          { to: '/tools/nikud-keyboard', label: 'מקלדת ניקוד', icon: '🔡' },
          { to: '/learn/reading', label: 'הבנת הנקרא', icon: '📖' },
          { to: '/unseen', label: 'אנסין — אנגלית ועברית', icon: '📝' },
          { to: '/dictionary', label: 'מילון לתלמידים', icon: '📘' },
          { to: '/learn/flashcards', label: 'כרטיסיות לימוד', icon: '🃏' },
          { to: '/words/opposites', label: 'הפכים ומילים נרדפות', icon: '🔄' },
        ],
      },
      {
        title: 'מקצועות בית הספר', icon: '🏫', to: '/learn',
        items: [
          { to: '/learn/tanakh', label: 'תנ״ך לילדים', icon: '📜' },
          { to: '/learn/lashon', label: 'לשון עברית', icon: '✍️' },
          { to: '/learn/science', label: 'מדע וטכנולוגיה', icon: '🔬' },
          { to: '/learn/history', label: 'היסטוריה', icon: '🏺' },
          { to: '/learn/geography', label: 'גאוגרפיה ומולדת', icon: '🗺️' },
          { to: '/learn/civics', label: 'אזרחות וחברה', icon: '🏛️' },
          { to: '/learn/ai', label: 'אקדמיית ה־AI של בוגה', icon: '🤖' },
        ],
      },
      {
        title: 'אנגלית, שפות והקלדה', icon: '🇬🇧', to: '/english',
        items: [
          { to: '/english', label: 'אנגלית לילדים — מילים ומשחקים', icon: '🇬🇧' },
          { to: '/abc', label: 'אותיות באנגלית A–Z', icon: '🔤' },
          { to: '/learn/english/by-grade', label: 'אנגלית לפי כיתה', icon: '🇬🇧' },
          { to: '/printables/abc-letters', label: 'אותיות באנגלית לכתיבה', icon: '✏️' },
          { to: '/languages', label: 'שפות לילדים: צרפתית, ספרדית, רוסית, ערבית, אמהרית', icon: '🌍' },
          { to: '/typing', label: 'הקלדה עיוורת', icon: '⌨️' },
          { to: '/typing/test', label: 'מבחן מהירות הקלדה', icon: '⏱️' },
        ],
      },
      {
        title: 'מוזיקה', icon: '🎵', to: '/music',
        items: [
          { to: '/music/piano', label: 'פסנתר אונליין', icon: '🎹' },
          { to: '/music/songs', label: 'לומדים שירים בפסנתר', icon: '🎶' },
          { to: '/music/read-notes', label: 'משחק קריאת תווים', icon: '🎼' },
          { to: '/music/guitar-chords', label: 'אקורדים לגיטרה', icon: '🎸' },
          { to: '/music/concepts', label: 'מושגים במוזיקה', icon: '📖' },
          { to: '/music/styles', label: 'סגנונות מוזיקה', icon: '🎷' },
        ],
      },
      {
        title: 'עולם ומדע', icon: '🔭', to: '/discover',
        items: [
          { to: '/discover/israel-map', label: 'מפת ישראל — איפה העיר?', icon: '🗺️' },
          { to: '/signs', label: 'תמרורים ובטיחות בדרך', icon: '🚸' },
          { to: '/flags', label: 'דגלי מדינות', icon: '🏳️' },
          { to: '/flags/quiz', label: 'חידון דגלים', icon: '🎯' },
          { to: '/discover/capitals', label: 'בירות ודגלים', icon: '🌍' },
          { to: '/discover/solar-system', label: 'מערכת השמש', icon: '🪐' },
          { to: '/discover/human-body', label: 'גוף האדם', icon: '🫀' },
          { to: '/animals', label: 'עובדות על חיות', icon: '🦁' },
          { to: '/tools/experiment-maker', label: 'מחולל ניסויים', icon: '🧪' },
          { to: '/printables/roots-project', label: 'עבודת שורשים', icon: '🌳' },
        ],
      },
    ],
  },
  {
    id: 'printables', label: SECTION.printables, icon: '🖨️', to: '/printables',
    landingLabel: 'כל הדפים להדפסה',
    prefixes: ['/printables', '/create', '/origami', '/treasure-hunt', '/scavenger-hunt', '/tools/escape-rooms', '/escape-rooms', '/escape-room', '/tools/escape-room', '/tools/crossword-maker', '/crossword', '/tools/word-search-maker', '/tools/word-search', '/word-search', '/word-search-maker', '/tools/bingo-maker', '/tools/bingo', '/bingo', '/bingo-maker', '/tools/scavenger-hunt-maker', '/tools/scavenger-hunt', '/tools/emoji-studio'],
    groups: [
      {
        title: 'צביעה ויצירה', icon: '🖍️', to: '/printables',
        items: [
          { to: '/printables/coloring', label: 'דפי צביעה', icon: '🖍️' },
          { to: '/printables/name-coloring', label: 'דף צביעה עם השם', icon: '✍️' },
          { to: '/printables/winter', label: 'דפי חורף וגשם', icon: '🌧️' },
          { to: '/printables/color-by-number', label: 'צביעה לפי מספרים', icon: '🔢' },
          { to: '/printables/color-by-answer', label: 'צביעה לפי תשובה', icon: '➕' },
          { to: '/printables/color-by-letter', label: 'צביעה לפי אות', icon: '🔤' },
          { to: '/printables/mandalas', label: 'מנדלות', icon: '🌀' },
          { to: '/printables/mazes', label: 'מבוכים להדפסה', icon: '🌀' },
          { to: '/origami', label: 'אוריגמי לילדים — קיפולי נייר', icon: '🦢' },
          { to: '/tools/emoji-studio', label: 'אימוג׳י סטודיו', icon: '😀' },
        ],
      },
      {
        title: 'מחוללים', icon: '🛠️', to: '/create',
        items: [
          { to: '/tools/crossword-maker', label: 'מחולל תשבצים', icon: '✏️' },
          { to: '/tools/word-search-maker', label: 'מחולל תפזורת', icon: '🔎' },
          { to: '/tools/bingo-maker', label: 'מחולל בינגו', icon: '🎟️' },
        ],
      },
      {
        title: 'הרפתקאות להדפסה', icon: '🗺️',
        items: [
          { to: '/tools/scavenger-hunt-maker', label: 'חפש את המטמון', icon: '🗺️' },
          { to: '/treasure-hunt/ready', label: 'ציד אוצרות מוכן להדפסה', icon: '🧭' },
          { to: '/tools/escape-rooms', label: 'חדרי בריחה', icon: '🔐' },
        ],
      },
      {
        title: 'לגן ולבית הספר', icon: '🎒',
        items: [
          { to: '/printables/hebrew-letters#names', label: 'דף שם לכל ילד בכיתה', icon: '🧒' },
          { to: '/printables/allergy-signs', label: 'שלטי אלרגיה ומדבקות', icon: '🥜' },
          { to: '/printables/sensory-communication-cards', label: 'כרטיסיות ויסות, תקשורת וסדר יום', icon: '🧩' },
          { to: '/printables/lunchbox-notes', label: 'פתקים לקופסת האוכל', icon: '💌' },
          { to: '/printables/school-supplies-list', label: 'רשימת ציוד לבית הספר', icon: '📝' },
        ],
      },
    ],
  },
  {
    id: 'birthday', label: SECTION.birthday, icon: '🎂', to: '/birthday',
    landingLabel: 'כל מה שצריך ליום הולדת',
    prefixes: ['/birthday', '/ideas', '/calculator', '/party-calculator', '/birthday-cost', '/how-many-pizzas', '/how-many-drinks', '/invitation', '/invitations', '/greeting', '/greetings', '/birthday-greeting', '/birthday-greetings', '/rsvp', '/r', '/bring-list', '/l', '/cakes', '/gifts', '/suppliers', '/bar-mitzvah', '/bat-mitzvah', '/guides', '/compare', '/songs', '/birthday-songs', '/games/birthday', '/tools/birthday-famous', '/tools/bring-list', '/tools/birthday-calculator', '/tools/party-calculator', '/tools/how-many-pizzas', '/tools/how-many-drinks', '/tools/greeting-generator', '/tools/greetings', '/tools/invitation-generator', '/tools/invitations'],
    groups: [
      {
        title: 'מתכננים מסיבה', icon: '🧮',
        items: [
          { to: '/calculator', label: 'מחשבון מסיבה', icon: '🧮' },
          { to: '/invitation', label: 'מחולל הזמנות', icon: '📨' },
          { to: '/rsvp', label: 'אישור הגעה אונליין', icon: '✅' },
            { to: '/meet', label: 'מתי נפגשים?', icon: '🗓️' },
            { to: '/party-album', label: 'אלבום מסיבה משותף', icon: '📸' },
          { to: '/tools/bring-list', label: 'רשימת "מי מביא מה"', icon: '📋' },
          { to: '/greeting', label: 'מחולל ברכות', icon: '💌' },
          { to: '/birthday-greetings', label: 'ברכות ליום הולדת', icon: '🎈' },
          { to: '/tools/birthday-famous', label: 'מי נולד ביום שלי?', icon: '⭐' },
        ],
      },
      {
        title: 'רעיונות ומשחקים', icon: '💡', to: '/ideas',
        items: [
          { to: '/ideas/themes', label: 'מסיבות בנושא', icon: '🦖' },
          { to: '/ideas/at-home', label: 'יום הולדת בבית', icon: '🏠' },
          { to: '/ideas/on-budget', label: 'יום הולדת בתקציב נמוך', icon: '💰' },
          { to: '/ideas/without-entertainer', label: 'יום הולדת בלי מפעיל', icon: '🙋' },
          { to: '/ideas/last-minute', label: 'יום הולדת של הרגע האחרון', icon: '⏰' },
          { to: '/ideas/kindergarten-graduation', label: 'מסיבת סיום גן', icon: '🎓' },
          { to: '/games/birthday', label: 'משחקים ליום הולדת', icon: '🎉' },
        ],
      },
      {
        title: 'עוגות, מתנות וספקים', icon: '🎁',
        items: [
          { to: '/cakes', label: 'עוגות יום הולדת', icon: '🍰' },
          { to: '/gifts', label: 'רעיונות למתנות', icon: '🎁' },
          { to: '/suppliers', label: 'ספקים לימי הולדת', icon: '🎪' },
          { to: '/bar-mitzvah', label: 'בר ובת מצווה — מדריך וכלים', icon: '📜' },
        ],
      },
    ],
  },
  {
    id: 'holidays', label: SECTION.holidays, icon: '🕎', to: '/holidays',
    landingLabel: 'כל השבתות והחגים',
    prefixes: ['/holidays', '/parasha', '/shabbat-times', '/school-holidays', '/hanukkah', '/sevivon', '/purim', '/tu-bishvat', '/games/shabbat', '/tools/hebrew-birthday', '/days-until', '/hebrew-calendar', '/omer'],
    groups: [
      {
        title: 'חגי ישראל', icon: '📅', to: '/holidays',
        items: [
          { to: '/holidays/rosh-hashana', label: 'ראש השנה', icon: '🍎' },
          { to: '/holidays/yom-kippur', label: 'יום כיפור', icon: '🕊️' },
          { to: '/holidays/sukkot', label: 'סוכות', icon: '🌿' },
          { to: '/holidays/hanukkah', label: 'חנוכה', icon: '🕎' },
          { to: '/holidays/tu-bishvat', label: 'ט״ו בשבט', icon: '🌳' },
          { to: '/holidays/purim', label: 'פורים', icon: '🎭' },
          { to: '/holidays/pesach', label: 'פסח', icon: '🫓' },
          { to: '/holidays/yom-haatzmaut', label: 'יום העצמאות', icon: '🎆' },
          { to: '/holidays/lag-baomer', label: 'ל״ג בעומר', icon: '🔥' },
          { to: '/holidays/shavuot', label: 'שבועות', icon: '🌾' },
        ],
      },
      {
        title: 'שבת, ברכות ולוח שנה', icon: '🕯️',
        items: [
          { to: '/holidays/shabbat-parents', label: 'אבא ואמא של שבת — עם תמונה', icon: '🖼️' },
          { to: '/parasha', label: 'פרשת השבוע וחידון להדפסה', icon: '📖' },
          { to: '/shabbat-activities', label: 'חבילת פעילויות לשבת', icon: '🕯️' },
          { to: '/shabbat-times', label: 'כניסת שבת וצאת השבת', icon: '🕯️' },
          { to: '/holidays/blessings', label: 'ברכות וקריאות לחגים', icon: '🙏' },
          { to: '/games/shabbat', label: 'משחקים לשבת', icon: '🕯️' },
          { to: '/school-holidays', label: 'לוח חופשות 2026–2027', icon: '📅' },
          { to: '/hebrew-calendar', label: 'לוח שנה עברי לועזי', icon: '📅' },
          { to: '/tools/hebrew-birthday', label: 'יום הולדת עברי', icon: '✡️' },
          { to: '/omer', label: 'ספירת העומר היום', icon: '🌾' },
          { to: '/days-until', label: 'כמה ימים עד החג?', icon: '⏳' },
        ],
      },
    ],
  },
  {
    id: 'family', label: SECTION.family, icon: '🏡', to: '/family',
    landingLabel: 'בבית עם הילדים — הכול',
    prefixes: ['/family', '/stories', '/toddlers', '/baby-names', '/food', '/blog', '/ma-hayom', '/ideas/what-to-do-weekend'],
    groups: [
      {
        title: 'לפני השינה', icon: '🌙',
        items: [
          { to: '/stories', label: 'סיפורים לפני השינה', icon: '📚' },
          { to: '/family/bedtime-story', label: 'סיפור עם השם של הילד', icon: '🌙' },
        ],
      },
      {
        title: 'תינוקות ופעוטות', icon: '👶',
        items: [
          { to: '/baby-names', label: 'שמות לתינוקות', icon: '👶' },
          { to: '/toddlers', label: 'פעוטות — גיל 1–3', icon: '🧸' },
        ],
      },
      {
        title: 'אוכל לילדים', icon: '🍎', to: '/food',
        items: [
          { to: '/food/school-lunch', label: 'מה שמים בכריך? ארוחת עשר', icon: '🥪' },
          { to: '/food/lunch-planner', label: 'תכנון ארוחת עשר לשבוע', icon: '🗓️' },
          { to: '/recipes/shabbat', label: 'מתכונים לשבת ולהדפסה', icon: '🍞' },
          { to: '/food/kids-recipes', label: 'מתכונים שילדים מכינים', icon: '👩‍🍳' },
          { to: '/food/kitchen-science', label: 'ניסויים במטבח', icon: '🧪' },
        ],
      },
      {
        title: 'פנאי למבוגרים', icon: '☕', to: '/adults',
        items: [
          { to: '/adults', label: 'פנאי למבוגרים — הכול בגדול', icon: '☕' },
          { to: '/adults/crosswords', label: 'תשחצים להדפסה', icon: '✏️' },
          { to: '/adults/mandalas', label: 'מחולל מנדלות לצביעה', icon: '🌸' },
          { to: '/adults/memory', label: 'משחק זיכרון בקלפים גדולים', icon: '🧠' },
          { to: '/trick-questions', label: 'שאלות מכשילות', icon: '🤔' },
          { to: '/adults/grandparents', label: 'סבא וסבתא עם הנכדים', icon: '👵' },
          { to: '/adults/grandparents/interview', label: 'ראיון סיפור חיים', icon: '📖' },
        ],
      },
      {
        title: 'ביום-יום', icon: '🏠',
        items: [
          { to: '/family/what-to-do', label: 'מה עושים היום?', icon: '🎲' },
          { to: '/family-help', label: 'לוח עזרה למשפחה', icon: '💛' },
          { to: '/family/morning-routine', label: 'שגרת בוקר עם טיימר', icon: '⏰' },
          { to: '/family/car-games', label: 'משחקים לנסיעה', icon: '🚗' },
          { to: '/family/move', label: 'אתגר תנועה', icon: '🤸' },
          { to: '/family/pocket-money', label: 'דמי כיס וחיסכון', icon: '🐷' },
          { to: '/ideas/what-to-do-weekend', label: 'פעילות לסוף שבוע', icon: '☀️' },
          { to: '/movies-for-kids', label: 'סרטים לילדים לפי גיל', icon: '🎬' },
          { to: '/crafts', label: 'יצירה מחומרים בבית', icon: '✂️' },
          { to: '/family/baby-development', label: 'התפתחות תינוק', icon: '👶' },
          { to: '/blog', label: 'הבלוג', icon: '📰' },
        ],
      },
    ],
  },
]

// The teachers' hub is a single button in the top bar with a small panel.
export const CLASSROOM_MENU = {
  id: 'classroom', label: SECTION.classroom, icon: '🏫', to: '/classroom',
  landingLabel: 'כל הכלים לכיתה ולגן',
  prefixes: ['/classroom', '/teachers', '/hw', '/secret-friend', '/thank-you-wall', '/q', '/g', '/w'],
  items: [
    { to: '/live', label: 'בוגה לייב — משחק חידון לכיתה', icon: '⚡', shortcut: true },
    { to: '/teachers', label: 'שיעורי בית אינטראקטיביים', icon: '📚' },
    { to: '/classroom/quiz', label: 'מבחן אמריקאי אונליין', icon: '📝' },
      { to: '/parent-meetings', label: 'הרשמה לאספות הורים', icon: '🗓️' },
    { to: '/secret-friend', label: 'גמד וענק — הגרלת שמות', icon: '🧙' },
    { to: '/thank-you-wall', label: 'קיר ברכות לגננת ולמורה', icon: '💌' },
    { to: '/printables/star-of-the-week', label: 'כוכב/ת השבוע — תעודה להדפסה', icon: '⭐' },
    { to: '/printables/math-worksheets', label: 'דפי עבודה בחשבון', icon: '➕', shortcut: true },
    { to: '/tools/escape-rooms', label: 'חדרי בריחה', icon: '🔐', shortcut: true },
    { to: '/games/classroom', label: 'משחקים לכיתה', icon: '🏫', shortcut: true },
  ],
}

export const SITE_MAP_LINK = { to: '/tools', label: 'כל האתר במקום אחד' }

const matches = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)

// Every path that marks a domain as "active": its landing page, group hubs,
// its own items and the extra prefixes above (aliases and sub-pages).
export const MENU_ACTIVE_PREFIXES = Object.fromEntries([...MENU_DOMAINS, CLASSROOM_MENU].map(d => {
  const items = d.groups ? d.groups.flatMap(g => [g.to, ...g.items.map(i => i.to)]) : d.items.filter(i => !i.shortcut).map(i => i.to)
  // Anchor links (e.g. /printables/hebrew-letters#names) point into another
  // domain's page, so they don't claim that page for this domain.
  return [d.id, [...new Set([d.to, ...d.prefixes, ...items].filter(to => to && !to.includes('#')))]]
}))

// The domain whose prefix matches the path most specifically (so /games/shabbat
// belongs to holidays, /tools/bring-list to birthday, /tools/dice to games).
export function activeDomainFor(pathname) {
  let best = null, bestLen = 0
  for (const [id, prefixes] of Object.entries(MENU_ACTIVE_PREFIXES)) {
    for (const p of prefixes) if (matches(pathname, p) && p.length > bestLen) { best = id; bestLen = p.length }
  }
  return best
}

// Flat list of groups (with their domain) for the /tools site map and the search index.
export const MENU_GROUPS = [
  ...MENU_DOMAINS.flatMap(d => d.groups.map(g => ({ domain: d.id, title: `${g.icon} ${g.title}`, to: g.to || d.to, items: g.items }))),
  { domain: 'classroom', title: `${CLASSROOM_MENU.icon} ${CLASSROOM_MENU.label}`, to: CLASSROOM_MENU.to, items: CLASSROOM_MENU.items.filter(i => !i.shortcut) },
]

// Footer columns follow the same domains. Every link here must live in the same
// domain in the menu above (or be an extra page of that domain).
export const FOOTER_COLUMNS = [
  {
    domain: 'games', title: '🎮 משחקים',
    links: [
      ['/kids', 'אזור ילדים'],
      ['/games', 'כל המשחקים'],
      ['/online-games', 'משחקי אונליין'],
      ['/live', 'בוגה לייב — חידון חי'],
      ['/online-games#two-players', 'משחקים לשניים'],
      ['/games/kindergarten', 'משחקים לגן'],
      ['/games/kita-a', 'משחקים לכיתה א׳'],
      ['/games/no-equipment', 'בלי ציוד'],
      ['/games/icebreaker', 'שובר קרח'],
      ['/games/5-minutes', '5 דקות'],
      ['/games/movement', 'תנועה'],
      ['/games/quiet', 'שקטים'],
      ['/game-of-the-day', 'משחק היום'],
      ['/sudoku', 'סודוקו אונליין'],
      ['/chess', 'שחמט אונליין'],
      ['/trivia/topics', 'טריוויה לפי נושא'],
      ['/riddles/topics', 'חידות לפי נושא'],
      ['/jokes/topics', 'בדיחות לילדים'],
      ['/jokes/keresh', 'בדיחות קרש'],
      ['/trivia/with-answers', 'שאלות טריוויה עם תשובות'],
      ['/questions', 'שאלות לילדים'],
      ['/time-tunnel', 'מנהרת הזמן'],
    ],
  },
  {
    domain: 'learn', title: '📚 לומדים',
    links: [
      ['/learn', 'לומדים — כל הנושאים'],
      ['/math', 'מתמטיקה לפי כיתה'],
      ['/learn/multiplication-table', 'לוח הכפל'],
      ['/learn/times-tables', 'תרגול לוח הכפל'],
      ['/logic-puzzles', 'תשבצי היגיון'],
      ['/printables/math-worksheets', 'דפי עבודה בחשבון'],
      ['/classroom/first-grade', 'הכנה לכיתה א׳'],
      ['/letters', 'אותיות בעברית'],
      ['/printables/hebrew-letters', 'אותיות בעברית להדפסה'],
      ['/learn/dictation', 'הכתבה אונליין'],
      ['/learn/reading', 'הבנת הנקרא'],
      ['/learn/tanakh', 'תנ״ך לילדים'],
      ['/learn/lashon', 'לשון עברית'],
      ['/learn/science', 'מדע וטכנולוגיה'],
      ['/learn/history', 'היסטוריה'],
      ['/learn/geography', 'גאוגרפיה ומולדת'],
      ['/learn/civics', 'אזרחות וחברה'],
      ['/learn/ai', 'אקדמיית ה־AI של בוגה'],
      ['/english', 'אנגלית לילדים'],
      ['/abc', 'לומדים אותיות באנגלית'],
      ['/typing', 'הקלדה עיוורת'],
      ['/music', 'לומדים מוזיקה ופסנתר'],
      ['/discover', 'עולם ומדע'],
      ['/discover/israel-map', 'מפת ישראל לילדים'],
      ['/flags', 'דגלי מדינות'],
      ['/animals', 'עולם החיות'],
      ['/learn/gifted-test', 'הכנה למבחן מחוננים'],
      ['/printables/roots-project', 'עבודת שורשים'],
    ],
  },
  {
    domain: 'printables', title: '🖨️ להדפסה',
    links: [
      ['/printables', 'דפים להדפסה'],
      ['/printables/coloring', 'דפי צביעה'],
      ['/printables/color-by-number', 'צביעה לפי מספרים'],
      ['/printables/mandalas', 'מנדלות'],
      ['/origami', 'אוריגמי לילדים'],
      ['/create', 'כל המחוללים'],
      ['/tools/crossword-maker', 'מחולל תשבצים'],
      ['/tools/scavenger-hunt-maker', 'חפש את המטמון'],
      ['/treasure-hunt/ready', 'ציד אוצר מוכן'],
      ['/tools/escape-rooms', 'חדרי בריחה'],
      ['/printables/allergy-signs', 'שלטי אלרגיה לגן'],
      ['/printables/school-supplies-list', 'רשימת ציוד לבית הספר'],
    ],
  },
  {
    domain: 'birthday', title: '🎂 יום הולדת',
    links: [
      ['/birthday', 'כל מה שצריך ליום הולדת'],
      ['/calculator', 'מחשבון מסיבה'],
      ['/invitation', 'מחולל הזמנות'],
      ['/rsvp', 'אישור הגעה אונליין'],
      ['/greeting', 'מחולל ברכות'],
      ['/birthday-greetings', 'ברכות ליום הולדת'],
      ['/games/birthday', 'משחקים ליום הולדת'],
      ['/ideas', 'רעיונות והשראה'],
      ['/ideas/at-home', 'יום הולדת בבית'],
      ['/ideas/kindergarten-graduation', 'מסיבת סיום גן'],
      ['/cakes', 'עוגות יום הולדת'],
      ['/gifts', 'רעיונות למתנות'],
      ['/gifts/gananet', 'מתנה לגננת'],
      ['/suppliers', 'ספקים לימי הולדת'],
      ['/bar-mitzvah', 'בר ובת מצווה'],
      ['/guides/how-to-plan-birthday', 'איך מתכננים יום הולדת'],
      ['/compare/home-vs-venue', 'בית או אולם'],
    ],
  },
  {
    domain: 'holidays', title: '🕯️ שבתות וחגים',
    links: [
      ['/holidays', 'כל השבתות והחגים'],
      ['/holidays/shabbat-parents', 'אבא ואמא של שבת'],
      ['/shabbat-times', 'זמני שבת ולוח עם תמונה'],
      ['/parasha', 'חידון פרשת השבוע'],
      ['/holidays/hanukkah', 'חנוכה'],
      ['/holidays/tu-bishvat', 'ט״ו בשבט'],
      ['/holidays/purim', 'פורים'],
      ['/holidays/pesach', 'פסח'],
      ['/holidays/blessings', 'ברכות וקריאות לחגים'],
      ['/school-holidays', 'לוח חופשות משרד החינוך'],
      ['/games/shabbat', 'משחקים לשבת'],
      ['/days-until', 'כמה ימים עד החג?'],
      ['/tools/hebrew-birthday', 'יום הולדת עברי'],
    ],
  },
  {
    domain: 'family', title: '🏡 משפחה',
    links: [
      ['/family', 'בבית עם הילדים'],
      ['/adults', 'פנאי למבוגרים'],
      ['/adults/grandparents', 'סבא וסבתא עם הנכדים'],
      ['/stories', 'סיפורים לפני השינה'],
      ['/family/bedtime-story', 'סיפור עם השם של הילד'],
      ['/toddlers', 'פעילויות לפעוטות'],
      ['/baby-names', 'שמות לתינוקות'],
      ['/food', 'אוכל לילדים וארוחת עשר'],
      ['/family/what-to-do', 'מה עושים היום?'],
      ['/family/car-games', 'משחקים לנסיעה'],
      ['/ideas/what-to-do-weekend', 'פעילות לסוף שבוע'],
      ['/blog', 'הבלוג שלנו'],
    ],
  },
  {
    domain: 'classroom', title: '🏫 לכיתה',
    links: [
      ['/classroom', 'כל הכלים לכיתה ולגן'],
      ['/teachers', 'שיעורי בית אינטראקטיביים'],
      ['/classroom/quiz', 'מבחן אמריקאי אונליין'],
      ['/secret-friend', 'גמד וענק'],
      ['/thank-you-wall', 'קיר ברכות לגננת'],
    ],
  },
  {
    domain: null, title: 'אודות',
    links: [
      ['/new', '✨ חדש באתר'],
      ['/embed', '🧩 כלים להטמעה באתר'],
      ['/about', 'אודות עוגה בוגה'],
      ['/faq', 'שאלות נפוצות'],
      ['/guides', 'כל המדריכים'],
      ['/tools', 'מפת האתר'],
      ['/terms', 'תנאי שימוש'],
      ['/privacy', 'מדיניות פרטיות'],
    ],
  },
]

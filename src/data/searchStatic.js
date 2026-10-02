// Full static search catalog — every linkable page on the site. This pulls in
// many content-data modules, so it lives in its own lazily-loaded chunk:
// SiteSearchBox imports it with import() on first interaction.
// Site-wide search: one list of everything a visitor can open (pages, tools, printables, ideas,
// guides, game categories). Games themselves come from the games database at search time.
import { MENU_GROUPS } from './siteMenu'
import { CATEGORIES, CLASS_PAGES } from './gameCategories'
import { IDEA_ARTICLES, PARTY_KITS } from './ideaArticlesExpanded'
import { GUIDES } from './guides'
import { GIFT_AGES } from './gifts'
import { categories as PRINTABLES } from '../pages/printables/PrintablesIndex'
import { printableHref } from '../components/ui/PrintableCard'
import { BOARD_GAMES } from '../boardgames/registry'
import { ENGLISH_TOPICS } from './englishWords'
import { LANGS, LANG_CODES, languageTopics } from './languages'
import { TRIVIA_TOPICS, ANIMALS, GREETING_PAGES, QUESTION_PAGES, RIDDLE_PAGES, JOKE_PAGES, HUNT_PAGES, ABC_LETTERS } from './content'
import { DICE_GAMES } from './diceGames'
import { BLOG_POSTS } from './blogPosts'
import { FAQ_TOPICS } from './faqTopics'
import { ESCAPE_ROOMS } from './escapeRoomsExpanded'


// Hubs and pages that are not in the tools menu, with the words people search for.
const PAGES = [
  { to: '/', title: 'דף הבית', emoji: '🏠', kind: 'page', keys: 'ראשי בית' },
  { to: '/games', title: 'כל המשחקים', emoji: '🎮', kind: 'page', desc: 'יותר מ-100 משחקים לילדים לפי גיל, זמן ומקום.', keys: 'משחק משחקים חיפוש' },
  { to: '/birthday', title: 'יום הולדת', emoji: '🎂', kind: 'page', desc: 'כל מה שצריך ליום הולדת: משחקים, הזמנות, מחשבון וספקים.', keys: 'מסיבה יומולדת' },
  { to: '/classroom', title: 'לכיתה ולגן', emoji: '🏫', kind: 'page', desc: 'פעילויות, משחקים ודפי עבודה למורות ולגננות.', keys: 'מורה גננת גן בית ספר' },
  { to: '/create', title: 'יוצרים ומדפיסים', emoji: '🖨️', kind: 'page', desc: 'מחוללים ודפים להדפסה.', keys: 'יצירה' },
  { to: '/ideas', title: 'רעיונות ליום הולדת', emoji: '💡', kind: 'page', desc: 'רעיונות למסיבות לפי גיל ונושא.', keys: 'השראה נושא' },
  { to: '/ideas/themes', title: 'מסיבות לפי נושא', emoji: '🎨', kind: 'page', keys: 'נושא תמה' },
  { to: '/printables', title: 'דפים להדפסה', emoji: '🖨️', kind: 'page', desc: 'ספרייה של דפי פעילות, צביעה וכתיבה.', keys: 'הדפסה דף עבודה' },
  { to: '/tools', title: 'כל הכלים', emoji: '🛠️', kind: 'page', keys: 'כלי כלים' },
  { to: '/suppliers', title: 'ספקים לימי הולדת', emoji: '🎪', kind: 'page', desc: 'מפעילים, קוסמים, עוגות וצילום.', keys: 'ספק מפעיל קוסם עוגה צלם הפעלה' },
  { to: '/suppliers/me', title: 'הצטרפות כספק', emoji: '🤝', kind: 'page', keys: 'ספק הרשמה כרטיס פרימיום' },
  { to: '/gifts', title: 'רעיונות למתנות', emoji: '🎁', kind: 'idea', desc: 'מתנות לפי גיל ותקציב.', keys: 'מתנה מתנות' },
  { to: '/guides', title: 'מדריכים', emoji: '📚', kind: 'page', keys: 'מדריך' },
  { to: '/time-tunnel', title: 'מנהרת הזמן של בוגה – משחק יומי', emoji: '⏳', kind: 'tool', desc: 'כל יום דברים שקרו בדיוק בתאריך הזה – מגלים בעזרת רמזים.', keys: 'מה היום חידון יומי היסטוריה תאריך יום מיוחד רמזים מנהרה זמן' },
  { to: '/words/opposites', title: 'הפכים לילדים – משחקים ודפי עבודה', emoji: '🔄', kind: 'tool', desc: 'משחק זיכרון, בחירת ההפך וחיבור זוגות, ודפי עבודה להדפסה.', keys: 'הפכים הפך מילים הפוכות אוצר מילים עברית לשון' },
  { to: '/words/synonyms', title: 'מילים נרדפות לילדים – משחקים ודפי עבודה', emoji: '🟰', kind: 'tool', desc: 'משחקים ודפי עבודה של מילים נרדפות לפי גיל.', keys: 'נרדפות נרדפת מילים דומות אוצר מילים עברית לשון' },
  { to: '/holidays/purim', title: 'פורים לילדים', emoji: '🎭', kind: 'page', desc: 'תחפושות, משלוח מנות, חידון ודפי צביעה.', keys: 'פורים תחפושות מגילה אסתר רעשן אוזני המן' },
  { to: '/holidays/purim/costumes', title: 'רעיונות לתחפושות לפורים', emoji: '👑', kind: 'idea', keys: 'תחפושות תחפושת ביתית פורים' },
  { to: '/holidays/purim/mishloach-manot', title: 'רעיונות למשלוח מנות', emoji: '🎁', kind: 'idea', keys: 'משלוח מנות משלוחי מנות פורים' },
  { to: '/holidays/tu-bishvat', title: 'ט״ו בשבט לילדים', emoji: '🌳', kind: 'page', desc: 'שבעת המינים, חידון, דפי צביעה ופעילויות.', keys: 'ט״ו בשבט טו בשבט עצים שתילה נטיעות חג האילנות' },
  { to: '/holidays/tu-bishvat/seven-species', title: 'שבעת המינים לילדים', emoji: '🍇', kind: 'tool', desc: 'הסבר ומשחק זיכרון.', keys: 'שבעת המינים חיטה שעורה גפן תאנה רימון זית תמר' },
  { to: '/holidays/tu-bishvat/coloring', title: 'דפי צביעה לט״ו בשבט', emoji: '🖍️', kind: 'tool', keys: 'צביעה ט״ו בשבט עץ שקדייה רימון' },
  { to: '/holidays/sukkot', title: 'סוכות ושמחת תורה לילדים', emoji: '🌿', kind: 'page', desc: 'קישוטים לסוכה, ארבעת המינים, חידון ודפי צביעה.', keys: 'סוכות סוכה שמחת תורה ארבעת המינים לולב אתרוג הדס ערבה חול המועד' },
  { to: '/holidays/sukkot/sukkah', title: 'קישוטים לסוכה', emoji: '⛓️', kind: 'idea', desc: '15 קישוטים שהילדים מכינים בעצמם.', keys: 'קישוטים לסוכה קישוט סוכה שרשראות יצירה' },
  { to: '/holidays/sukkot/coloring', title: 'דפי צביעה לסוכות', emoji: '🖍️', kind: 'tool', keys: 'צביעה סוכות סוכה אתרוג לולב שמחת תורה' },
  { to: '/holidays/sukkot/what-to-do', title: 'מה עושים בחופשת סוכות', emoji: '💡', kind: 'idea', keys: 'חופשת סוכות חול המועד טיולים פעילויות' },
  { to: '/holidays/rosh-hashana', title: 'ראש השנה לילדים', emoji: '🍎', kind: 'page', desc: 'ברכות, חידון, דפי צביעה ופעילויות.', keys: 'ראש השנה שנה טובה תפוח בדבש שופר רימון סימנים' },
  { to: '/holidays/rosh-hashana/greetings', title: 'ברכות לשנה טובה לילדים', emoji: '💌', kind: 'idea', keys: 'ברכות ברכה שנה טובה כרטיס ברכה ראש השנה' },
  { to: '/holidays/rosh-hashana/coloring', title: 'דפי צביעה לראש השנה', emoji: '🖍️', kind: 'tool', keys: 'צביעה ראש השנה תפוח רימון שופר' },
  { to: '/holidays/yom-kippur', title: 'יום כיפור לילדים', emoji: '🕊️', kind: 'page', desc: 'איך מבקשים סליחה, חידון ודפי צביעה.', keys: 'יום כיפור כיפור סליחה צום אופניים יונה' },
  { to: '/holidays/yom-kippur/sorry', title: 'איך מבקשים סליחה – לילדים', emoji: '🤝', kind: 'idea', keys: 'סליחה לבקש סליחה לסלוח יום כיפור' },
  { to: '/holidays/pesach', title: 'פסח לילדים', emoji: '🫓', kind: 'page', desc: 'ליל הסדר, חידון, דפי צביעה ורעיונות לחופשה.', keys: 'פסח מצה מצות הגדה סדר אפיקומן יציאת מצרים' },
  { to: '/holidays/pesach/seder', title: 'ליל הסדר לילדים', emoji: '🍷', kind: 'idea', keys: 'ליל הסדר סימני הסדר קערת הסדר הגדה' },
  { to: '/holidays/pesach/coloring', title: 'דפי צביעה לפסח', emoji: '🖍️', kind: 'tool', keys: 'צביעה פסח קערת הסדר מצה צפרדע' },
  { to: '/holidays/pesach/what-to-do', title: 'מה עושים בחופשת פסח', emoji: '💡', kind: 'idea', keys: 'חופשת פסח חול המועד פעילויות' },
  { to: '/holidays/yom-haatzmaut', title: 'יום העצמאות לילדים', emoji: '🎆', kind: 'page', desc: 'סמלי המדינה, חידון ודפי צביעה.', keys: 'יום העצמאות עצמאות דגל ישראל מדינה זיקוקים' },
  { to: '/holidays/yom-haatzmaut/symbols', title: 'סמלי המדינה לילדים', emoji: '✡️', kind: 'idea', keys: 'סמלי המדינה דגל סמל המדינה התקווה מנורה' },
  { to: '/holidays/yom-haatzmaut/coloring', title: 'דפי צביעה ליום העצמאות', emoji: '🖍️', kind: 'tool', keys: 'צביעה יום העצמאות דגל זיקוקים' },
  { to: '/holidays/lag-baomer', title: 'ל״ג בעומר לילדים', emoji: '🔥', kind: 'page', desc: 'בטיחות במדורה, חידון ודפי צביעה.', keys: 'ל״ג בעומר לג בעומר מדורה קשת חץ' },
  { to: '/holidays/lag-baomer/coloring', title: 'דפי צביעה לל״ג בעומר', emoji: '🖍️', kind: 'tool', keys: 'צביעה ל״ג בעומר מדורה' },
  { to: '/holidays/shavuot', title: 'שבועות לילדים', emoji: '🌾', kind: 'page', desc: 'ביכורים, חידון ודפי צביעה.', keys: 'שבועות ביכורים חג מתן תורה גבינה חלב' },
  { to: '/holidays/shavuot/coloring', title: 'דפי צביעה לשבועות', emoji: '🖍️', kind: 'tool', keys: 'צביעה שבועות ביכורים לוחות הברית' },
  { to: '/holidays', title: 'חגים עם ילדים', emoji: '🎉', kind: 'page', keys: 'חגים חג פעילויות לחגים' },
  { to: '/holidays/hanukkah', title: 'חנוכה לילדים', emoji: '🕎', kind: 'page', desc: 'סביבון, חידון, דפי צביעה ורעיונות לחופשה.', keys: 'חנוכה חנוכיה חנוכייה נרות סופגניות חג' },
  { to: '/holidays/hanukkah/sevivon', title: 'סביבון וירטואלי', emoji: '🕎', kind: 'tool', desc: 'מסובבים סביבון בלחיצה ומשחקים עם ניקוד.', keys: 'סביבון וירטואלי אונליין חנוכה משחק' },
  { to: '/holidays/hanukkah/quiz', title: 'חידון חנוכה לילדים', emoji: '❓', kind: 'tool', desc: '3 רמות, גם להדפסה.', keys: 'חידון חנוכה שאלות טריוויה' },
  { to: '/holidays/hanukkah/coloring', title: 'דפי צביעה לחנוכה', emoji: '🖍️', kind: 'tool', keys: 'צביעה חנוכה חנוכייה סביבון סופגניה' },
  { to: '/holidays/hanukkah/worksheets', title: 'דפי עבודה לחנוכה', emoji: '✏️', kind: 'tool', keys: 'דפי עבודה חנוכה גן כיתה א' },
  { to: '/rubiks-cube', title: 'פתרון קובייה הונגרית למתחילים', emoji: '🧊', kind: 'tool', desc: '7 שלבים עם הדגמה חיה ואלגוריתמים שנבדקו במחשב.', keys: 'קובייה הונגרית קוביה הונגרית רוביק פתרון אלגוריתם rubik' },
  { to: '/letters', title: 'לימוד אותיות בעברית', emoji: '🔤', kind: 'tool', desc: 'עמוד לכל אות: איך כותבים, מילים, משחק ודף תרגול.', keys: 'אותיות אות עברית לימוד כתיבה דפוס כיתה א גן אלף בית' },
  { to: '/letters/game', title: 'משחק אותיות לגן', emoji: '🎮', kind: 'tool', desc: 'מצאו את האות, באיזו אות זה מתחיל ואיך קוראים לאות.', keys: 'משחק אותיות גן לימוד אותיות עברית חינם' },
  { to: '/abc/game', title: 'חזרה על אותיות באנגלית', emoji: '🔤', kind: 'tool', desc: 'משחק ABC: מצאו את האות, גדולה וקטנה, אות ראשונה.', keys: 'אנגלית אותיות abc חזרה משחק english letters' },
  { to: '/printables/letter-flashcards', title: 'כרטיסיות אותיות להדפסה', emoji: '🃏', kind: 'tool', desc: 'א–ת ו־A–Z עם תמונה ומילה, 8 בדף.', keys: 'כרטיסיות אותיות הדפסה חינם קלפים' },
  { to: '/printables/math-worksheets', title: 'דפי עבודה בחשבון לכיתה א׳', emoji: '➕', kind: 'tool', desc: 'חיבור וחיסור עד 10 ועד 20, מספר חסר, במאונך ושבילים.', keys: 'חשבון דפי עבודה חיבור חיסור עד 10 עד 20 כיתה א תרגילים' },
  // math worksheet pages people search by name ("לוח הכפל", "כפל", "חילוק", "דפי עבודה כיתה ב")
  { to: '/printables/math-worksheets/multiplication', title: 'לוח הכפל — כל הלוחות', emoji: '✖️', kind: 'printable', desc: 'כל לוחות הכפל מ-2 עד 10, דף חדש בכל לחיצה ועם פתרונות.', keys: 'כפל לוח הכפל תרגילי כפל חשבון דפי עבודה כיתה ב כיתה ג כיתה ד' },
  ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => ({ to: `/printables/math-worksheets/multiplication-table-${t}`, title: `לוח הכפל של ${t} — דפי עבודה`, emoji: '✖️', kind: 'printable', desc: `תרגילי כפל ב-${t} להדפסה, עם פתרונות.`, keys: 'כפל לוח הכפל תרגילי כפל חשבון דפי עבודה כיתה ב כיתה ג' })),
  { to: '/printables/math-worksheets/division', title: 'חילוק — תרגילי חילוק להדפסה', emoji: '➗', kind: 'printable', desc: 'חילוק בכל הלוחות, דף חדש בכל לחיצה ועם פתרונות.', keys: 'חילוק תרגילי חילוק לוח הכפל חשבון דפי עבודה כיתה ב כיתה ג כיתה ד' },
  { to: '/printables/math-worksheets/up-to-100', title: 'חיבור וחיסור עד 100 — דפי עבודה לכיתה ב׳', emoji: '🔢', kind: 'printable', desc: '20 תרגילים בדף, דף חדש בכל לחיצה ועם פתרונות.', keys: 'חשבון חיבור חיסור עד 100 דפי עבודה כיתה ב תרגילים' },
  { to: '/printables/math-worksheets/addition-up-to-100', title: 'חיבור עד 100 — דפי עבודה לכיתה ב׳', emoji: '➕', kind: 'printable', keys: 'חשבון חיבור עד 100 דפי עבודה כיתה ב תרגילים' },
  { to: '/printables/math-worksheets/subtraction-up-to-100', title: 'חיסור עד 100 — דפי עבודה לכיתה ב׳', emoji: '➖', kind: 'printable', keys: 'חשבון חיסור עד 100 דפי עבודה כיתה ב תרגילים' },
  // one page per age (/games/age/N, see GamesIndex)
  ...[4, 5, 6, 7, 8, 9, 10].map(a => ({ to: `/games/age/${a}`, title: `משחקים לגיל ${a}`, emoji: '🎲', kind: 'page', desc: `כל המשחקים שמתאימים לילדים בני ${a}.`, keys: `משחקים גיל ${a} בני ${a}`, ages: [a, a] })),
  { to: '/printables/math-paths', title: 'שבילים בחשבון לכיתה א׳', emoji: '🛤️', kind: 'tool', desc: 'משלימים מספרים ופעולות לאורך השביל.', keys: 'שבילים חשבון כיתה א דפי עבודה' },
  { to: '/printables/fine-motor', title: 'מוטוריקה עדינה – מחולל דפי תרגול', emoji: '✏️', kind: 'tool', desc: 'מבוכים, עקיבה אחרי קווים והמשך דפוסים לפי גיל.', keys: 'מבוך מבוכים עקיבה קווים דפוס מוטוריקה גן' },
  { to: '/game-of-the-day', title: 'משחק היום', emoji: '⭐', kind: 'page', keys: 'יומי' },
  { to: '/songs/birthday-songs', title: 'שירי יום הולדת', emoji: '🎵', kind: 'idea', keys: 'שיר שירים' },
  { to: '/compare/home-vs-venue', title: 'יום הולדת בבית או באולם?', emoji: '⚖️', kind: 'idea', keys: 'השוואה אולם בית' },
  { to: '/compare/entertainer-vs-diy', title: 'מפעיל או לבד?', emoji: '⚖️', kind: 'idea', keys: 'השוואה מפעיל' },
  { to: '/calculator/how-many-pizzas', title: 'כמה פיצות להזמין', emoji: '🍕', kind: 'tool', keys: 'פיצה פיצות מחשבון' },
  { to: '/calculator/how-many-drinks', title: 'כמה שתייה צריך', emoji: '🥤', kind: 'tool', keys: 'שתייה מחשבון' },
  { to: '/calculator/birthday-cost', title: 'כמה עולה יום הולדת', emoji: '💰', kind: 'tool', keys: 'עלות תקציב מחשבון' },
  { to: '/classroom/quiz', title: 'מבחן אמריקאי אונליין לכיתה', emoji: '📝', kind: 'tool', keys: 'חידון מבחן בוחן מורה' },
  { to: '/faq', title: 'שאלות נפוצות', emoji: '❓', kind: 'page', keys: 'עזרה' },
  { to: '/about', title: 'אודות עוגה בוגה', emoji: '🎂', kind: 'page', keys: 'קשר מי אנחנו' },
]

const TOOL_DESC = {
  '/tools/trivia-quiz': 'טריוויה עם מצבי משחק, ניקוד ותחרות.', '/tools/truth-or-buga': 'משחק אמת/שקר עם קושי, קבוצות וניקוד.',
  '/tools/buga-town': 'משחק עיר ונכסים עם שאלות וקוביות.', '/tools/escape-rooms': 'חדרים דיגיטליים וקיטים להנחיה.',
  '/tools/riddles': 'מאגר חידות לפי נושא, גיל וקושי.', '/tools/emoji-studio': 'מנחשים שירים וסרטים באימוג׳ים.',
  '/tools/bingo-maker': 'כרטיסיות בינגו מוכנות או מותאמות אישית.', '/tools/word-search-maker': 'צרו תפזורות לפי מילים ונושאים.',
  '/tools/crossword-maker': 'מכניסים מילים ומקבלים תשבץ להדפסה.', '/tools/scavenger-hunt-maker': 'רמזים ומשימות מוכנים להפעלה.',
  '/calculator': 'כמה פיצות, שתייה וחטיפים צריך למסיבה.', '/invitation': 'הזמנה אישית ליום הולדת.', '/greeting': 'ברכה אישית ליום הולדת.',
  '/tools/bring-list': 'רשימה שיתופית: כל הורה תופס פריט בקישור אחד.', '/tools/birthday-famous': 'אילו מפורסמים נולדו באותו תאריך.',
  '/classroom/first-grade': 'כתיבה, שעון, חשבון וקריאה בתרגול משחקי.', '/tools/eretz-ir': 'ארץ עיר עם אותיות, טיימר וניקוד.',
  '/tools/experiment-maker': 'בוחרים ניסוי, ממלאים דף חקר ומדפיסים.',
}
const TOOL_KEYS = {
  '/tools/random-picker': 'גלגל מזל הגרלה', '/tools/team-generator': 'קבוצות חלוקה', '/tools/countdown-timer': 'שעון עצר',
  '/tools/crossword-maker': 'תשבץ', '/tools/word-search-maker': 'תפזורת', '/invitation': 'הזמנה הזמנות', '/greeting': 'ברכה ברכות',
  '/calculator': 'פיצה שתייה עלות', '/tools/escape-rooms': 'חדר בריחה אסקייפ', '/tools/scavenger-hunt-maker': 'מטמון ציד אוצר',
  '/tools/trivia-quiz': 'טריוויה חידון שאלות', '/tools/riddles': 'חידות חידה', '/board-games': 'משחק לוח', '/classroom/first-grade': 'כיתה א הכנה',
}

// Extra words for the game category pages (/games/<slug>).
const CATEGORY_KEYS = {
  quiet: 'שקט רכב אוטו נסיעה חדר שינה',
  'no-equipment': 'בלי ציוד רכב אוטו נסיעה',
  family: 'משפחה ערב משפחה',
  'kita-b': 'כיתה ב',
}

// "Best bets": what people mean by a word that the page itself doesn't use much. A match here
// puts the page at the top (see `best` in searchIndex.js).
const SOLO = 'לבד משועמם משועממת משעמם שעמום'
const CAR = 'אוטו רכב נסיעה נסיעות מכונית'
const BEST = {
  '/letters/game': SOLO, '/board-games': SOLO, '/tools/riddles': SOLO, '/tools/trivia-quiz': SOLO, '/tools/escape-rooms': SOLO,
  '/questions/road-trip': CAR, '/games/quiet': CAR, '/games/no-equipment': CAR,
  '/printables/math-worksheets/multiplication': 'כפל לוח הכפל', '/printables/math-worksheets/division': 'חילוק',
}

const clean = to => to.split('#')[0]
function buildStatic() {
  const out = [...PAGES]
  for (const group of MENU_GROUPS) for (const it of group.items) {
    const to = it.to
    const kind = to.startsWith('/printables') ? 'printable' : to.startsWith('/games') ? 'page' : to.startsWith('/gifts') || to.startsWith('/suppliers') ? 'page' : 'tool'
    out.push({ to, title: it.label, emoji: it.icon, kind, desc: TOOL_DESC[clean(to)] || '', keys: TOOL_KEYS[clean(to)] || '' })
  }
  for (const c of PRINTABLES) out.push({ to: printableHref(c), title: c.title, emoji: c.emoji, kind: 'printable', desc: c.desc })
  for (const [slug, c] of Object.entries({ ...CATEGORIES, ...CLASS_PAGES })) out.push({ to: `/games/${slug}`, title: c.title.split(' — ')[0], emoji: '🎲', kind: 'page', desc: c.desc, keys: CATEGORY_KEYS[slug] || '' })
  for (const [slug, a] of Object.entries(IDEA_ARTICLES)) out.push({ to: `/ideas/${slug}`, title: a.title, emoji: a.emoji, kind: 'idea', desc: a.description })
  for (const [slug, k] of Object.entries(PARTY_KITS)) out.push({ to: `/ideas/themes/${slug}`, title: k.name, emoji: k.emoji, kind: 'idea', desc: k.desc })
  for (const g of GUIDES) out.push({ to: `/guides/${g.slug}`, title: g.title, emoji: g.emoji, kind: 'idea', desc: g.description })
  for (const age of GIFT_AGES) out.push({ to: `/gifts/age-${age}`, title: `מתנות לגיל ${age}`, emoji: '🎁', kind: 'idea', keys: `מתנה גיל ${age}`, ages: [age, age] })
  // new content worlds (Sep 2026): trivia, animals, greetings, questions, riddles, jokes, hunts, ABC
  for (const t of TRIVIA_TOPICS) out.push({ to: `/trivia/${t.slug}`, title: t.title, emoji: t.emoji, kind: 'page', desc: t.description, keys: 'טריוויה חידון שאלות' })
  for (const a of ANIMALS) out.push({ to: `/animals/${a.slug}`, title: a.title, emoji: a.emoji, kind: 'page', desc: a.description, keys: `חיות חיה ${a.name} עובדות` })
  for (const g of GREETING_PAGES) {
    const age = /^age-(\d+)$/.exec(g.slug)?.[1]
    out.push({ to: `/greetings/${g.slug}`, title: g.title, emoji: g.emoji, kind: 'idea', desc: g.description, keys: 'ברכה ברכות יום הולדת', ...(age ? { ages: [Number(age), Number(age)] } : {}) })
  }
  for (const q of QUESTION_PAGES) out.push({ to: `/questions/${q.slug}`, title: q.title, emoji: q.emoji, kind: 'page', desc: q.description, keys: 'שאלות שאלה שיחה היכרות' })
  for (const r of RIDDLE_PAGES) out.push({ to: `/riddles/${r.slug}`, title: r.title, emoji: r.emoji, kind: 'page', desc: r.description, keys: 'חידות חידה תשובות' })
  for (const j of JOKE_PAGES) out.push({ to: `/jokes/${j.slug}`, title: j.title, emoji: j.emoji, kind: 'page', desc: j.description, keys: 'בדיחות בדיחה מצחיק' })
  for (const h of HUNT_PAGES) out.push({ to: `/treasure-hunt/${h.slug}`, title: h.title, emoji: h.emoji, kind: 'page', desc: h.description, keys: 'חפש את המטמון ציד אוצרות רמזים' })
  out.push({ to: '/english', title: 'אנגלית לילדים — מילים ראשונות ומשחקים', emoji: '🇬🇧', kind: 'page', desc: 'מילים באנגלית לפי נושאים, עם תמונה, קול, משחק וכרטיסיות להדפסה.', keys: 'אנגלית english מילים באנגלית כרטיסיות' })
  for (const e of ENGLISH_TOPICS) out.push({ to: `/english/${e.slug}`, title: `${e.title} באנגלית`, emoji: e.emoji, kind: 'page', desc: e.intro, keys: `אנגלית english ${e.title} ${e.words.map(w => w.en + ' ' + w.he).join(' ')}` })
  out.push({ to: '/languages', title: 'שפות לילדים — צרפתית, ספרדית, רוסית, ערבית ואמהרית', emoji: '🌍', kind: 'page', desc: 'מילים ראשונות בשש שפות עם תמונה, קול והגייה בעברית.', keys: 'שפות שפה זרה צרפתית ספרדית רוסית ערבית אמהרית לימוד שפות' })
  for (const code of LANG_CODES) {
    const L = LANGS[code]
    out.push({ to: `/languages/${code}`, title: `${L.name} לילדים`, emoji: L.emoji, kind: 'page', desc: `מילים ראשונות ${L.adj} עם תמונה והגייה.`, keys: `${L.name} שפות לימוד ${L.name}` })
    for (const t of languageTopics(code)) out.push({ to: `/languages/${code}/${t.slug}`, title: `${t.title} ${L.adj}`, emoji: t.emoji, kind: 'page', desc: `${t.title} ${L.adj} לילדים, עם תמונה והגייה.`, keys: `${L.name} ${t.title} ${t.words.map(w => w.he).join(' ')}` })
  }
  for (const l of ABC_LETTERS) out.push({ to: `/abc/${l.slug}`, title: `האות ${l.letter} באנגלית`, emoji: '🔤', kind: 'page', desc: l.description, keys: `אנגלית אותיות abc ${l.letter} ${l.name}` })
  for (const d of DICE_GAMES) out.push({ to: `/dice-games/${d.slug}`, title: d.title, emoji: d.emoji, kind: 'game', desc: d.description, keys: 'משחק קוביות קוביה חוקים' })
  for (const b of BLOG_POSTS) out.push({ to: `/blog/${b.slug}`, title: b.title, emoji: b.emoji, kind: 'idea', desc: b.description, keys: 'בלוג כתבה' })
  for (const [key, f] of Object.entries(FAQ_TOPICS)) out.push({ to: `/faq/${key}`, title: f.title, emoji: f.emoji, kind: 'page', desc: f.description, keys: 'שאלות נפוצות שאלות ותשובות' })
  for (const room of ESCAPE_ROOMS) out.push({ to: `/tools/escape-rooms/${room.id}`, title: room.title, emoji: room.emoji, kind: 'game', desc: room.description, keys: 'חדר בריחה אסקייפ' })
  out.push({ to: '/tools/trivia-quiz', title: 'טריוויה לכיתה ולמשפחה', emoji: '🎯', kind: 'tool', desc: TOOL_DESC['/tools/trivia-quiz'], keys: TOOL_KEYS['/tools/trivia-quiz'] })
  out.push({ to: '/board-games', title: 'משחקי לוח קלאסיים – לשחק וללמוד', emoji: '♟️', kind: 'game', desc: 'דמקה ועוד – נגד המחשב, נגד חבר ושיעורים.', keys: 'משחק לוח לוח קלאסי' })
  for (const g of BOARD_GAMES) out.push({ to: `/board-games/${g.slug}`, title: `${g.name} – לשחק, ללמוד וחוקים`, emoji: g.emoji, kind: 'game', desc: g.tagline, keys: `משחק לוח ${g.name} חוקי ${g.name} ללמוד ${g.name} אונליין` })
  // every date page of the time tunnel ("מה קרה ב-14 במרץ?")
  const HM = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
  ;[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].forEach((len, m) => { for (let d = 1; d <= len; d++) out.push({ to: `/time-tunnel/${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, title: `מה קרה ב-${d} ב${HM[m]}?`, emoji: '⏳', kind: 'page', desc: 'ימים מיוחדים, אירועים ומי נולד בתאריך הזה', keys: `מנהרת הזמן תאריך ${d} ${HM[m]}`, low: true }) })
  const seen = new Set() // one entry per link
  return out.filter(x => { if (seen.has(x.to)) return false; seen.add(x.to); return true })
    .map(x => BEST[x.to] ? { ...x, best: BEST[x.to] } : x)
}
export const STATIC_ITEMS = buildStatic()

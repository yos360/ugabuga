// Full static search catalog — every linkable page on the site. This pulls in
// many content-data modules, so it lives in its own lazily-loaded chunk:
// SiteSearchBox imports it with import() on first interaction.
// Site-wide search: one list of everything a visitor can open (pages, tools, printables, ideas,
// guides, game categories). Games themselves come from the games database at search time.
import { MENU_GROUPS } from './siteMenu'
import { BEDTIME_STORY_COUNT } from './bedtimeStoryCount.js'
import { CATEGORIES, CLASS_PAGES } from './gameCategories'
import { IDEA_ARTICLES, PARTY_KITS } from './ideaArticlesExpanded'
import { GUIDES } from './guides'
import { GIFT_AGES } from './gifts'
import { categories as PRINTABLES } from '../pages/printables/PrintablesIndex'
import { printableHref } from '../components/ui/PrintableCard'
import { BOARD_GAMES } from '../boardgames/registry'
import { ARCADE } from '../arcade/registry'
import { ENGLISH_TOPICS } from './englishWords'
import { LANGS, LANG_CODES, languageTopics } from './languages'
import { TRIVIA_TOPICS, ANIMALS, GREETING_PAGES, QUESTION_PAGES, RIDDLE_PAGES, JOKE_PAGES, HUNT_PAGES, ABC_LETTERS } from './content'
import { DICE_GAMES } from './diceGames'
import { BLOG_POSTS } from './blogPosts'
import { FAQ_TOPICS } from './faqTopics'
import { ESCAPE_ROOMS } from './escapeRoomsExpanded'
import { CBN_PICTURES, CBN_MATH_KINDS, cbnLevel } from './colorByNumber'
import { SUPPLIER_CATEGORY_PAGES, categoryPagePath } from './supplierCategoryPages'
import { HOLIDAY_BLESSINGS, blessingsHref } from './holidayBlessings'


// Hubs and pages that are not in the tools menu, with the words people search for.
const PAGES = [
  {"to": "/printables/name-labels", "title": "מדבקות שם", "emoji": "🛠️", "kind": "tool", "keys": "מדבקות שם מדבקות שם לגן לבית ספר תוויות להדפסה"},
  {"to": "/music/tuner", "title": "טיונר לגיטרה", "emoji": "🛠️", "kind": "tool", "keys": "טיונר לגיטרה טיונר אונליין כיוון גיטרה"},
  {"to": "/music/metronome", "title": "מטרונום", "emoji": "🛠️", "kind": "tool", "keys": "מטרונום קצב BPM טאפ טמפו"},
  { to: '/', title: 'דף הבית', emoji: '🏠', kind: 'page', keys: 'ראשי בית' },
  { to: '/games', title: 'משחקים לילדים — כל המשחקים', emoji: '🎮', kind: 'page', desc: 'יותר מ-100 משחקים לילדים לפי גיל, זמן ומקום.', keys: 'משחק משחקים חיפוש משחקים לילדים משחקים לילדים בחינם' },
  { to: '/birthday', title: 'יום הולדת לילדים', emoji: '🎂', kind: 'page', desc: 'כל מה שצריך ליום הולדת: משחקים, הזמנות, מחשבון וספקים.', keys: 'מסיבה יומולדת יום הולדת לילדים מסיבת יום הולדת מתחם' },
  { to: '/birthday-greetings', title: 'ברכה ליום הולדת', emoji: '💌', kind: 'page', desc: 'ברכות מקוריות לכל גיל ולכל אחד — להעתקה ולוואטסאפ.', keys: 'ברכה ליום הולדת ברכות ליום הולדת ברכת יום הולדת איחולים' },
  { to: '/classroom', title: 'לכיתה ולגן', emoji: '🏫', kind: 'page', desc: 'פעילויות, משחקים ודפי עבודה למורות ולגננות.', keys: 'מורה גננת גן בית ספר' },
  { to: '/create', title: 'יוצרים ומדפיסים', emoji: '🖨️', kind: 'page', desc: 'מחוללים ודפים להדפסה.', keys: 'יצירה' },
  { to: '/ideas', title: 'רעיונות ליום הולדת', emoji: '💡', kind: 'page', desc: 'רעיונות למסיבות לפי גיל ונושא.', keys: 'השראה נושא רעיונות ליום הולדת רעיון למסיבה יום הולדת בבית' },
  { to: '/ideas/themes', title: 'מסיבות לפי נושא', emoji: '🎨', kind: 'page', keys: 'נושא תמה' },
  { to: '/printables', title: 'דפים להדפסה', emoji: '🖨️', kind: 'page', desc: 'ספרייה של דפי פעילות, צביעה וכתיבה.', keys: 'הדפסה דף עבודה' },
  { to: '/tools', title: 'כל הכלים', emoji: '🛠️', kind: 'page', keys: 'כלי כלים' },
  { to: '/suppliers', title: 'ספקים לימי הולדת', emoji: '🎪', kind: 'page', desc: 'מפעילים, קוסמים, עוגות וצילום.', keys: 'ספק מפעיל קוסם עוגה צלם הפעלה' },
  { to: '/suppliers/me', title: 'הצטרפות כספק', emoji: '🤝', kind: 'page', keys: 'ספק הרשמה כרטיס פרימיום' },
  { to: '/gifts', title: 'מתנות לילדים ליום הולדת', emoji: '🎁', kind: 'idea', desc: 'מתנות לפי גיל ותקציב.', keys: 'מתנה מתנות מתנות לילדים מתנה ליום הולדת מתנות לגיל' },
  { to: '/guides', title: 'מדריכים', emoji: '📚', kind: 'page', keys: 'מדריך' },
  { to: '/time-tunnel', title: 'היום בהיסטוריה – מנהרת הזמן', emoji: '⏳', kind: 'tool', desc: 'כל יום דברים שקרו בדיוק בתאריך הזה – מגלים בעזרת רמזים.', keys: 'מה היום חידון יומי היסטוריה תאריך יום מיוחד רמזים מנהרה זמן היום בהיסטוריה מה קרה היום ימים מיוחדים' },
  { to: '/words/opposites', title: 'הפכים לילדים – משחקים ודפי עבודה', emoji: '🔄', kind: 'tool', desc: 'משחק זיכרון, בחירת ההפך וחיבור זוגות, ודפי עבודה להדפסה.', keys: 'הפכים הפך מילים הפוכות אוצר מילים עברית לשון' },
  { to: '/words/synonyms', title: 'מילים נרדפות לילדים – משחקים ודפי עבודה', emoji: '🟰', kind: 'tool', desc: 'משחקים ודפי עבודה של מילים נרדפות לפי גיל.', keys: 'נרדפות נרדפת מילים דומות אוצר מילים עברית לשון' },
  { to: '/holidays/purim', title: 'פורים לילדים', emoji: '🎭', kind: 'page', desc: 'תחפושות, משלוח מנות, חידון ודפי צביעה.', keys: 'פורים תחפושות מגילה אסתר רעשן אוזני המן' },
  { to: '/holidays/purim/costumes', title: 'תחפושות לפורים — רעיונות ביתיים', emoji: '👑', kind: 'idea', keys: 'תחפושות לפורים תחפושת ביתית רעיונות לתחפושות פורים תחפושות לילדים' },
  { to: '/holidays/purim/mishloach-manot', title: 'רעיונות למשלוח מנות', emoji: '🎁', kind: 'idea', keys: 'משלוח מנות משלוחי מנות פורים' },
  { to: '/holidays/tu-bishvat', title: 'ט״ו בשבט לילדים', emoji: '🌳', kind: 'page', desc: 'שבעת המינים, חידון, דפי צביעה ופעילויות.', keys: 'ט״ו בשבט טו בשבט עצים שתילה נטיעות חג האילנות' },
  { to: '/holidays/tu-bishvat/seven-species', title: 'שבעת המינים לילדים', emoji: '🍇', kind: 'tool', desc: 'הסבר ומשחק זיכרון.', keys: 'שבעת המינים חיטה שעורה גפן תאנה רימון זית תמר' },
  { to: '/holidays/tu-bishvat/coloring', title: 'דפי צביעה לט״ו בשבט', emoji: '🖍️', kind: 'tool', keys: 'צביעה ט״ו בשבט עץ שקדייה רימון' },
  { to: '/holidays/sukkot', title: 'סוכות ושמחת תורה לילדים', emoji: '🌿', kind: 'page', desc: 'קישוטים לסוכה, ארבעת המינים, חידון ודפי צביעה.', keys: 'סוכות סוכה שמחת תורה ארבעת המינים לולב אתרוג הדס ערבה חול המועד' },
  { to: '/holidays/sukkot/sukkah', title: 'קישוטים לסוכה', emoji: '⛓️', kind: 'idea', desc: '15 קישוטים שהילדים מכינים בעצמם.', keys: 'קישוטים לסוכה קישוט סוכה שרשראות יצירה' },
  { to: '/holidays/sukkot/coloring', title: 'דפי צביעה לסוכות', emoji: '🖍️', kind: 'tool', keys: 'צביעה סוכות סוכה אתרוג לולב שמחת תורה' },
  { to: '/holidays/sukkot/what-to-do', title: 'מה עושים בחופשת סוכות', emoji: '💡', kind: 'idea', keys: 'חופשת סוכות חול המועד טיולים פעילויות' },
  { to: '/holidays/rosh-hashana', title: 'ראש השנה לילדים', emoji: '🍎', kind: 'page', desc: 'ברכות, חידון, דפי צביעה ופעילויות.', keys: 'ראש השנה שנה טובה תפוח בדבש שופר רימון סימנים' },
  { to: '/holidays/rosh-hashana/greetings', title: 'ברכות לראש השנה לילדים', emoji: '💌', kind: 'idea', keys: 'ברכות ברכה שנה טובה כרטיס ברכה ראש השנה' },
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
  { to: '/rubiks-cube', title: 'פתרון קובייה הונגרית למתחילים', emoji: '🧊', kind: 'tool', desc: '7 שלבים עם הדגמה חיה ואלגוריתמים שנבדקו במחשב.', keys: 'קובייה הונגרית קובייה הונגרית רוביק פתרון אלגוריתם rubik' },
  { to: '/letters', title: 'לימוד אותיות בעברית', emoji: '🔤', kind: 'tool', desc: 'עמוד לכל אות: איך כותבים, מילים, משחק ודף תרגול.', keys: 'אותיות אות עברית לימוד כתיבה דפוס כיתה א גן אלף בית' },
  { to: '/letters/song', title: 'שיר האותיות', emoji: '🎵', kind: 'tool', desc: 'שרים את האלף בית: כל אות נדלקת ונשמעת, עם דף מילים.', keys: 'שיר האותיות שיר אלף בית שיר אותיות א ב שירים לילדים' },
  { to: '/abc/song', title: 'שיר ה-ABC באנגלית', emoji: '🔠', kind: 'tool', desc: 'A עד Z על המנגינה המוכרת, עם הגייה בעברית.', keys: 'שיר abc שיר האותיות באנגלית איי בי סי אנגלית שיר' },
  { to: '/letters/cursive', title: 'אותיות בכתב יד', emoji: '✍️', kind: 'tool', desc: 'כל אות בדפוס ובכתב, מדפוס לכתב ודפי תרגול להדפסה.', keys: 'כתב יד אותיות כתב מדפוס לכתב תרגול כתיבה כתב רהוט סתם סת״ם' },
  { to: '/letters/sounds', title: 'צליל פותח וצליל סוגר', emoji: '👂', kind: 'tool', desc: 'משחק ודפי עבודה: באיזו אות מתחילה המילה?', keys: 'צליל פותח צליל סוגר צלילים מודעות פונולוגית הכנה לכיתה א' },
  { to: '/letters/nikud', title: 'קמץ ופתח — קריאה בניקוד', emoji: '🔡', kind: 'tool', desc: 'הברות, מילים ראשונות ודפי עבודה לכיתה א׳.', keys: 'ניקוד קמץ פתח הברות קריאה ראשונה כיתה א' },
  { to: '/letters/final', title: 'אותיות סופיות', emoji: '🔚', kind: 'tool', desc: 'ך ם ן ף ץ — משחק השלמה ודף עבודה.', keys: 'אותיות סופיות כמנפץ ך ם ן ף ץ' },
  { to: '/printables/letter-strip', title: 'סרגל אותיות להדפסה', emoji: '📏', kind: 'tool', desc: 'א׳–ת׳ בדפוס ובכתב לשולחן, עם סופיות ותמונות.', keys: 'סרגל אותיות להדפסה דפוס וכתב לוח אותיות' },
  { to: '/letters/game', title: 'משחק אותיות לגן', emoji: '🎮', kind: 'tool', desc: 'מצאו את האות, באיזו אות זה מתחיל ואיך קוראים לאות.', keys: 'משחק אותיות גן לימוד אותיות עברית חינם' },
  { to: '/abc/game', title: 'חזרה על אותיות באנגלית', emoji: '🔤', kind: 'tool', desc: 'משחק ABC: מצאו את האות, גדולה וקטנה, אות ראשונה.', keys: 'אנגלית אותיות abc חזרה משחק english letters' },
  { to: '/printables/letter-flashcards', title: 'כרטיסיות אותיות להדפסה', emoji: '🃏', kind: 'tool', desc: 'א–ת ו־A–Z עם תמונה ומילה, 8 בדף.', keys: 'כרטיסיות אותיות הדפסה חינם קלפים' },
  { to: '/printables/math-worksheets', title: 'דפי עבודה בחשבון לכיתה א׳', emoji: '➕', kind: 'tool', desc: 'חיבור וחיסור עד 10 ועד 20, מספר חסר, במאונך ושבילים.', keys: 'חשבון דפי עבודה חיבור חיסור עד 10 עד 20 כיתה א תרגילים' },
  { to: '/printables/coloring', title: 'דפי צביעה', emoji: '🎨', kind: 'printable', desc: 'מעל 300 ציורים מקוריים לצביעה, לפי נושא.', keys: 'דפי צביעה דף צביעה ציורים להדפסה ציור לצביעה דפים לצביעה דפי צביעה לילדים צביעה' },
  // coloring pages by subject
  { to: '/printables/coloring/unicorn', title: 'דף צביעה חד קרן להדפסה', emoji: '🦄', kind: 'printable', desc: 'דפי צביעה של חד קרן להדפסה בחינם.', keys: 'צביעה דף צביעה חד קרן לצביעה' },
  { to: '/printables/coloring/cat', title: 'דפי צביעה חתולים להדפסה', emoji: '🐱', kind: 'printable', desc: 'דפי צביעה של חתולים להדפסה בחינם.', keys: 'צביעה דף צביעה חתולים לצביעה' },
  { to: '/printables/coloring/flowers', title: 'פרחים להדפסה וצביעה', emoji: '🌸', kind: 'printable', desc: 'דפי צביעה של פרחים להדפסה בחינם.', keys: 'צביעה דף צביעה פרחים לצביעה' },
  { to: '/printables/coloring/hearts', title: 'לב לצביעה — דפי צביעה לבבות להדפסה', emoji: '❤️', kind: 'printable', desc: 'דפי צביעה של לבבות להדפסה בחינם.', keys: 'צביעה דף צביעה לבבות לצביעה' },
  { to: '/printables/coloring/seal', title: 'כלב ים לצביעה — דפי צביעה להדפסה', emoji: '🦭', kind: 'printable', desc: 'דפי צביעה של כלבי ים להדפסה בחינם.', keys: 'צביעה דף צביעה כלבי ים לצביעה' },
  { to: '/printables/coloring/bunny', title: 'ארנב להדפסה וצביעה', emoji: '🐰', kind: 'printable', desc: 'דפי צביעה של ארנבים להדפסה בחינם.', keys: 'צביעה דף צביעה ארנבים לצביעה' },
  { to: '/printables/coloring/dog', title: 'דפי צביעה כלבים להדפסה', emoji: '🐶', kind: 'printable', desc: 'דפי צביעה של כלבים להדפסה בחינם.', keys: 'צביעה דף צביעה כלבים לצביעה' },
  { to: '/printables/coloring/food', title: 'דפי צביעה אוכל חמוד להדפסה', emoji: '🍕', kind: 'printable', desc: 'דפי צביעה של אוכל חמוד להדפסה בחינם.', keys: 'צביעה דף צביעה אוכל חמוד לצביעה' },
  { to: '/printables/coloring/dinosaur', title: 'דף צביעה דינוזאורים להדפסה', emoji: '🦕', kind: 'printable', desc: 'דפי צביעה של דינוזאורים להדפסה בחינם.', keys: 'צביעה דף צביעה דינוזאורים לצביעה' },
  { to: '/printables/coloring/vehicles', title: 'דפי צביעה מכוניות להדפסה', emoji: '🚗', kind: 'printable', desc: 'דפי צביעה של מכוניות וכלי רכב להדפסה בחינם.', keys: 'צביעה דף צביעה מכוניות וכלי רכב לצביעה' },
  { to: '/printables/coloring/ice-cream', title: 'גלידה לצביעה — דפי צביעה להדפסה', emoji: '🍦', kind: 'printable', desc: 'דפי צביעה של גלידה להדפסה בחינם.', keys: 'צביעה דף צביעה גלידה לצביעה' },
  { to: '/printables/coloring/teddy-bear', title: 'דובי לצביעה — דפי צביעה להדפסה', emoji: '🧸', kind: 'printable', desc: 'דפי צביעה של דובי להדפסה בחינם.', keys: 'צביעה דף צביעה דובי לצביעה' },
  { to: '/printables/coloring/soccer', title: 'דף צביעה כדורגל להדפסה', emoji: '⚽', kind: 'printable', desc: 'דפי צביעה של כדורגל להדפסה בחינם.', keys: 'צביעה דף צביעה כדורגל לצביעה' },
  { to: '/printables/coloring/seahorse', title: 'סוס ים לצביעה — דפי צביעה להדפסה', emoji: '🐠', kind: 'printable', desc: 'דפי צביעה של סוסי ים להדפסה בחינם.', keys: 'צביעה דף צביעה סוסי ים לצביעה' },
  { to: '/printables/coloring/dragon', title: 'דרקון לצביעה — דפי צביעה להדפסה', emoji: '🐉', kind: 'printable', desc: 'דפי צביעה של דרקונים להדפסה בחינם.', keys: 'צביעה דף צביעה דרקונים לצביעה' },
  { to: '/printables/coloring/elephant', title: 'פיל לצביעה — דפי צביעה להדפסה', emoji: '🐘', kind: 'printable', desc: 'דפי צביעה של פילים להדפסה בחינם.', keys: 'צביעה דף צביעה פילים לצביעה' },
  { to: '/printables/coloring/clown', title: 'ליצן להדפסה וצביעה', emoji: '🤡', kind: 'printable', desc: 'דפי צביעה של ליצנים וקרקס להדפסה בחינם.', keys: 'צביעה דף צביעה ליצנים וקרקס לצביעה' },
  { to: '/printables/coloring/butterfly', title: 'פרפר לצביעה והדפסה', emoji: '🦋', kind: 'printable', desc: 'דפי צביעה של פרפרים להדפסה בחינם.', keys: 'צביעה דף צביעה פרפרים לצביעה' },
  { to: '/printables/coloring/dolphin', title: 'דולפין לצביעה — דפי צביעה להדפסה', emoji: '🐬', kind: 'printable', desc: 'דפי צביעה של דולפינים להדפסה בחינם.', keys: 'צביעה דף צביעה דולפינים לצביעה' },
  { to: '/printables/coloring/princess', title: 'דפי צביעה נסיכות להדפסה', emoji: '👸', kind: 'printable', desc: 'דפי צביעה של נסיכות להדפסה בחינם.', keys: 'צביעה דף צביעה נסיכות לצביעה' },
  { to: '/printables/coloring/lion', title: 'אריה לצביעה — דפי צביעה להדפסה', emoji: '🦁', kind: 'printable', desc: 'דפי צביעה של אריות להדפסה בחינם.', keys: 'צביעה דף צביעה אריות לצביעה' },
  { to: '/printables/coloring/fish', title: 'דג לצביעה — דפי צביעה להדפסה', emoji: '🐟', kind: 'printable', desc: 'דפי צביעה של דגים להדפסה בחינם.', keys: 'צביעה דף צביעה דגים לצביעה' },
  { to: '/printables/coloring/superhero', title: 'גיבור על לצביעה — דפי צביעה להדפסה', emoji: '🦸', kind: 'printable', desc: 'דפי צביעה של גיבורי על להדפסה בחינם.', keys: 'צביעה דף צביעה גיבורי על לצביעה' },
  { to: '/printables/coloring/cake', title: 'עוגה לצביעה — דפי צביעה להדפסה', emoji: '🎂', kind: 'printable', desc: 'דפי צביעה של עוגות להדפסה בחינם.', keys: 'צביעה דף צביעה עוגות לצביעה' },
  { to: '/printables/coloring/airplane', title: 'מטוס לצביעה — דפי צביעה להדפסה', emoji: '✈️', kind: 'printable', desc: 'דפי צביעה של מטוסים להדפסה בחינם.', keys: 'צביעה דף צביעה מטוסים לצביעה' },
  { to: '/printables/coloring/balloons', title: 'בלונים לצביעה — דפי צביעה להדפסה', emoji: '🎈', kind: 'printable', desc: 'דפי צביעה של בלונים להדפסה בחינם.', keys: 'צביעה דף צביעה בלונים לצביעה' },
  { to: '/printables/coloring/starfish', title: 'כוכב ים לצביעה — דפי צביעה להדפסה', emoji: '⭐', kind: 'printable', desc: 'דפי צביעה של כוכבי ים להדפסה בחינם.', keys: 'צביעה דף צביעה כוכבי ים לצביעה' },
  { to: '/printables/coloring/sufganiyah', title: 'סופגנייה לצביעה — דפי צביעה לחנוכה', emoji: '🍩', kind: 'printable', desc: 'דפי צביעה של סופגניות להדפסה בחינם.', keys: 'צביעה דף צביעה סופגניות לצביעה' },
  { to: '/printables/coloring/horse', title: 'דף צביעה סוסים להדפסה', emoji: '🐴', kind: 'printable', desc: 'דפי צביעה של סוסים להדפסה בחינם.', keys: 'צביעה דף צביעה סוסים לצביעה' },
  { to: '/printables/coloring/umbrella', title: 'מטריה לצביעה — דפי צביעה של גשם להדפסה', emoji: '☂️', kind: 'printable', desc: 'דפי צביעה של מטריות וגשם להדפסה בחינם.', keys: 'צביעה דף צביעה מטריות וגשם לצביעה' },
  { to: '/printables/coloring/cow', title: 'פרה לצביעה — דפי צביעה להדפסה', emoji: '🐄', kind: 'printable', desc: 'דפי צביעה של פרות וחווה להדפסה בחינם.', keys: 'צביעה דף צביעה פרות וחווה לצביעה' },
  { to: '/printables/coloring/birds', title: 'ציפור לצביעה — דפי צביעה להדפסה', emoji: '🐦', kind: 'printable', desc: 'דפי צביעה של ציפורים להדפסה בחינם.', keys: 'צביעה דף צביעה ציפורים לצביעה' },
  { to: '/printables/coloring/dreidel', title: 'סביבון לצביעה והדפסה — דפי צביעה לחנוכה', emoji: '🌀', kind: 'printable', desc: 'דפי צביעה של סביבונים להדפסה בחינם.', keys: 'צביעה דף צביעה סביבונים לצביעה' },
  { to: '/printables/coloring/hanukkiah', title: 'חנוכייה לצביעה והדפסה', emoji: '🕎', kind: 'printable', desc: 'דפי צביעה של חנוכייה להדפסה בחינם.', keys: 'צביעה דף צביעה חנוכייה לצביעה' },
  { to: '/printables/coloring/tiger', title: 'נמר לצביעה — דפי צביעה להדפסה', emoji: '🐯', kind: 'printable', desc: 'דפי צביעה של נמרים להדפסה בחינם.', keys: 'צביעה דף צביעה נמרים לצביעה' },
  { to: '/printables/coloring/penguin', title: 'פינגווין לצביעה — דפי צביעה להדפסה', emoji: '🐧', kind: 'printable', desc: 'דפי צביעה של פינגווינים להדפסה בחינם.', keys: 'צביעה דף צביעה פינגווינים לצביעה' },
  { to: '/printables/coloring/monkey', title: 'קוף לצביעה — דפי צביעה להדפסה', emoji: '🐵', kind: 'printable', desc: 'דפי צביעה של קופים להדפסה בחינם.', keys: 'צביעה דף צביעה קופים לצביעה' },
  { to: '/printables/coloring/rainbow-sun', title: 'קשת בענן לצביעה — שמש ועננים להדפסה', emoji: '🌈', kind: 'printable', desc: 'דפי צביעה של קשת, שמש ועננים להדפסה בחינם.', keys: 'צביעה דף צביעה קשת, שמש ועננים לצביעה' },
  { to: '/printables/coloring/bee', title: 'דבורה לצביעה — דפי צביעה להדפסה', emoji: '🐝', kind: 'printable', desc: 'דפי צביעה של דבורים להדפסה בחינם.', keys: 'צביעה דף צביעה דבורים לצביעה' },
  { to: '/printables/coloring/turtle', title: 'צב לצביעה — דפי צביעה להדפסה', emoji: '🐢', kind: 'printable', desc: 'דפי צביעה של צבים להדפסה בחינם.', keys: 'צביעה דף צביעה צבים לצביעה' },
  { to: '/printables/coloring/mandala-kids', title: 'מנדלות לילדים — מנדלות פשוטות להדפסה וצביעה', emoji: '🌼', kind: 'printable', desc: 'מנדלות פשוטות לילדים להדפסה וצביעה בחינם.', keys: 'מנדלה מנדלות פשוטות לילדים להדפסה צביעה' },
  { to: '/printables/coloring/mandala-adults', title: 'מנדלות להדפסה למבוגרים — מנדלות מפורטות לצביעה', emoji: '🪷', kind: 'printable', desc: 'מנדלות מפורטות להדפסה למבוגרים בחינם.', keys: 'מנדלה מנדלות למבוגרים להדפסה צביעה מפורטות' },
  { to: '/printables/coloring/mandala-animals', title: 'מנדלה חיות להדפסה — חיות מנדלה לצביעה', emoji: '🦉', kind: 'printable', desc: 'מנדלות של חיות להדפסה בחינם.', keys: 'מנדלה חיות מנדלות להדפסה צביעה' },
  { to: '/printables/coloring/older-kids', title: 'דפי צביעה לילדים גדולים להדפסה', emoji: '🏰', kind: 'printable', desc: 'דפי צביעה מפורטים לילדים גדולים.', keys: 'צביעה דפי צביעה לילדים גדולים מפורטים' },
  { to: '/printables/coloring/tu-bishvat', title: 'דפי צביעה לט״ו בשבט להדפסה', emoji: '🌳', kind: 'printable', desc: 'דפי צביעה לט״ו בשבט להדפסה בחינם.', keys: 'ט"ו בשבט טו בשבט צביעה דף צביעה עץ שבעת המינים' },
  { to: '/printables/coloring/purim-masks', title: 'מסכות לפורים לצביעה והדפסה', emoji: '🎭', kind: 'printable', desc: 'מסכות לפורים להדפסה וצביעה בחינם.', keys: 'פורים מסכות מסכה לצביעה להדפסה' },
  { to: '/printables/coloring/sweets', title: 'ממתקים לצביעה — דפי צביעה להדפסה', emoji: '🍭', kind: 'printable', desc: 'דפי צביעה של ממתקים להדפסה בחינם.', keys: 'צביעה ממתקים סוכרייה ארטיק' },
  { to: '/printables/coloring/fruits', title: 'פירות לצביעה — אבטיח ואננס להדפסה', emoji: '🍉', kind: 'printable', desc: 'דפי צביעה של פירות להדפסה בחינם.', keys: 'צביעה פירות אבטיח אננס' },
  // world & science (/discover/*)
  { to: '/discover', title: 'עולם ומדע', emoji: '🔭', kind: 'tool', desc: 'מפות, חלל וגוף האדם.', keys: 'מדע גאוגרפיה' },
  { to: '/discover/israel-map', title: 'מפת ישראל — חידון ערים', emoji: '🗺️', kind: 'tool', desc: 'איפה נמצאת העיר? משחק ודף להדפסה.', keys: 'מפה מפת ישראל ערים גאוגרפיה מולדת' },
  { to: '/flags', title: 'דגלי מדינות — כל דגלי העולם', emoji: '🏳️', kind: 'tool', desc: '195 דגלים עם שמות, בירות ויבשות.', keys: 'דגל דגלים דגלי מדינות דגל של מדינות דגלי העולם דגלי עולם מדינות העולם בירות' },
  { to: '/flags/quiz', title: 'חידון דגלים', emoji: '🎯', kind: 'tool', desc: 'מזהים דגל מתוך 4 תשובות, לפי רמה ויבשת.', keys: 'חידון דגלים משחק דגלים ניחוש דגל זיהוי דגלים טריוויה דגלים' },
  { to: '/flags/print', title: 'דגלים להדפסה', emoji: '🖨️', kind: 'printable', desc: 'כרטיסיות דגלים ודגלים לצביעה.', keys: 'דגלים להדפסה דגלים לצביעה כרטיסיות דגלים דף צביעה דגל' },
  { to: '/flags/continents/europe', title: 'דגלי אירופה', emoji: '🏳️', kind: 'tool', desc: 'כל הדגלים של אירופה עם בירות.', keys: 'דגלים דגל אירופה מדינות אירופה דגלי מדינות' },
  { to: '/flags/continents/asia', title: 'דגלי אסיה', emoji: '🏳️', kind: 'tool', desc: 'כל הדגלים של אסיה עם בירות.', keys: 'דגלים דגל אסיה מדינות אסיה דגלי מדינות' },
  { to: '/flags/continents/africa', title: 'דגלי אפריקה', emoji: '🏳️', kind: 'tool', desc: 'כל הדגלים של אפריקה עם בירות.', keys: 'דגלים דגל אפריקה מדינות אפריקה דגלי מדינות' },
  { to: '/flags/continents/north-america', title: 'דגלי אמריקה הצפונית', emoji: '🏳️', kind: 'tool', desc: 'כל הדגלים של אמריקה הצפונית עם בירות.', keys: 'דגלים דגל אמריקה הצפונית מדינות אמריקה הצפונית דגלי מדינות' },
  { to: '/flags/continents/south-america', title: 'דגלי אמריקה הדרומית', emoji: '🏳️', kind: 'tool', desc: 'כל הדגלים של אמריקה הדרומית עם בירות.', keys: 'דגלים דגל אמריקה הדרומית מדינות אמריקה הדרומית דגלי מדינות' },
  { to: '/flags/continents/oceania', title: 'דגלי אוקיאניה', emoji: '🏳️', kind: 'tool', desc: 'כל הדגלים של אוקיאניה עם בירות.', keys: 'דגלים דגל אוקיאניה מדינות אוקיאניה דגלי מדינות' },
  { to: '/discover/capitals', title: 'בירות ודגלים', emoji: '🌍', kind: 'tool', desc: 'חידון דגלים ובירות של העולם.', keys: 'דגל דגלים בירה בירות מדינות עולם' },
  { to: '/discover/solar-system', title: 'מערכת השמש', emoji: '🪐', kind: 'tool', desc: 'כוכבי הלכת, עובדות וחידון.', keys: 'חלל כוכבי לכת שמש ירח כוכבים' },
  { to: '/discover/human-body', title: 'גוף האדם', emoji: '🫀', kind: 'tool', desc: 'לוחצים על איבר ולומדים.', keys: 'גוף איברים לב מוח עצמות שלד' },
  // family tools (/family/*)
  { to: '/kids', title: 'אזור ילדים — משחקים, צביעה וסיפורים', emoji: '🧸', kind: 'page', desc: 'אריחים גדולים עם קול לילדים שגולשים לבד.', keys: 'אזור ילדים ילדים לבד משחקים לילדים קטנים צביעה אונליין סיפורים מוקלטים אותיות מספרים פסנתר' },
  { to: '/family', title: 'בבית עם הילדים', emoji: '🏡', kind: 'tool', desc: 'כלים קטנים להורים לכל היום.', keys: 'הורים בית' },
  { to: '/family/what-to-do', title: 'מה עושים היום?', emoji: '🎲', kind: 'tool', desc: 'רעיון לפעילות לפי מקום, זמן וגיל.', keys: 'משעמם שעמום פעילות רעיונות מה לעשות' },
  { to: '/family/morning-routine', title: 'שגרת בוקר עם טיימר', emoji: '⏰', kind: 'tool', desc: 'משימה אחרי משימה, ויוצאים בזמן.', keys: 'שגרה בוקר ערב התארגנות' },
  { to: '/family/bedtime-story', title: 'סיפור לפני השינה עם שם', emoji: '🌙', kind: 'tool', desc: 'הילד הוא הגיבור של הסיפור.', keys: 'סיפור סיפורים שינה לילה טוב' },
  { to: '/family/car-games', title: 'משחקים לנסיעה', emoji: '🚗', kind: 'tool', desc: 'בלי מסכים, ובינגו נסיעה להדפסה.', keys: 'נסיעה אוטו רכב טיול בינגו' },
  { to: '/family/move', title: 'אתגר תנועה לילדים', emoji: '🤸', kind: 'tool', desc: 'תרגילים מצחיקים עם טיימר.', keys: 'תנועה ספורט קפיצות התעמלות' },
  { to: '/family/pocket-money', title: 'דמי כיס וחיסכון', emoji: '🐷', kind: 'tool', desc: 'מחשבון חיסכון ושלוש קופות.', keys: 'דמי כיס חיסכון כסף קופה' },
  { to: '/holidays/blessings', title: 'ברכות וקריאות לחגים', emoji: '🙏', kind: 'page', desc: 'הברכות לכל חג עם ניקוד, מה אומרים בסידור ומה קוראים בתורה.', keys: 'ברכות לחגים ברכות החג ברכה הדלקת נרות קידוש שהחיינו קריאת התורה הפטרה מגילה סידור תפילות החגים' },
  { to: '/holidays/hanukkah/songs', title: 'שירי חנוכה לילדים', emoji: '🎵', kind: 'tool', desc: 'רשימת שירים לגן, מעוז צור וברכות ההדלקה.', keys: 'שירי חנוכה שירים לחנוכה מעוז צור הנרות הללו ברכות חנוכה סביבון כד קטן באנו חושך לגרש' },
  // new sections (Oct 2026)
  { to: '/tools/hebrew-birthday', title: 'יום הולדת עברי ומחשבון בר/בת מצווה', emoji: '✡️', kind: 'tool', desc: 'תאריך עברי לפי תאריך לועזי, ומועד בר/בת מצווה עם הפרשה.', keys: 'יום הולדת עברי תאריך עברי המרת תאריך לועזי לעברי מחשבון בר מצווה בת מצווה פרשה פרשת בר מצווה' },
  { to: '/ideas/bat-mitzvah-ideas', title: 'רעיונות לבת מצווה', emoji: '👑', kind: 'idea', desc: 'סוגי חגיגה, פרויקט, עיצוב, נאום, תקציב וצ׳ק ליסט.', keys: 'בת מצווה רעיונות לבת מצווה פרויקט בת מצווה ערב נשים מסיבת בת מצווה נאום' },
  { to: '/bar-mitzvah', title: 'בר מצווה ובת מצווה — מדריך וכלים', emoji: '📜', kind: 'page', desc: 'לוח זמנים לבני מצווה, תפילין, ומכל הכלים: תאריך, צ׳קליסט, נאום, חידון ומזכרות.', keys: 'בר מצווה בת מצווה בני מצווה בר מצוה בת מצוה תכנון בר מצווה לוח זמנים תפילין לבר מצווה' },
  { to: '/bar-mitzvah/date', title: 'מתי הבר מצווה? מחשבון תאריך ופרשה', emoji: '📅', kind: 'tool', desc: 'תאריך בר או בת מצווה לפי תאריך הלידה, השבת והפרשה לעלייה לתורה.', keys: 'מתי הבר מצווה מתי הבת מצווה תאריך בר מצווה מחשבון בר מצווה פרשת בר מצווה עלייה לתורה הנחת תפילין אדר' },
  { to: '/bar-mitzvah/checklist', title: 'צ׳קליסט לבר מצווה ובת מצווה', emoji: '✅', kind: 'tool', desc: 'מה עושים ומתי — משנה לפני ועד היום עצמו, לסימון ולהדפסה.', keys: 'צקליסט צ׳קליסט צ\'קליסט רשימת משימות בר מצווה בת מצווה הכנות לבר מצווה תכנון' },
  { to: '/bar-mitzvah/speech', title: 'דרשה לבר מצווה ונאום לבת מצווה', emoji: '🎤', kind: 'tool', desc: 'עונים על שאלות ומקבלים טיוטה אישית לנאום, עם רעיון מהפרשה.', keys: 'דרשה לבר מצווה נאום לבת מצווה נאום בר מצווה דבר תורה דרשת בר מצווה פרשה' },
  { to: '/bar-mitzvah/quiz', title: 'חידון לבר מצווה על החוגג', emoji: '❓', kind: 'tool', desc: 'חידון לאורחים על החוגג או החוגגת — על המסך, בטלפונים או מודפס.', keys: 'חידון לבר מצווה חידון לבת מצווה חידון על החוגג שאלות על החתן משחק לאורחים' },
  { to: '/bar-mitzvah/souvenir', title: 'מזכרת לבת מצווה ולבר מצווה', emoji: '💌', kind: 'printable', desc: 'רעיונות למזכרות, כרטיסי ברכה לאורחים וקפסולת זמן להדפסה.', keys: 'מזכרת לבת מצווה מזכרת לבר מצווה מזכרות לאורחים כרטיסי ברכה קפסולת זמן מכתב' },
  { to: '/toddlers', title: 'פעילויות ומשחקים לפעוטות', emoji: '🧸', kind: 'tool', desc: 'רעיונות לגיל שנה, שנתיים ו־3 עם ציוד מהבית.', keys: 'פעוט פעוטות תינוק גיל שנה שנתיים 3 משחקים לפעוטות פעילות' },
  { to: '/toddlers/age-1', title: 'משחקים ופעילויות לגיל שנה', emoji: '🧸', kind: 'tool', desc: 'פעילויות לגיל שנה.', keys: 'גיל שנה בן שנה בת שנה פעוט משחקים' },
  { to: '/toddlers/age-2', title: 'משחקים ופעילויות לגיל שנתיים', emoji: '🚂', kind: 'tool', desc: 'בצק, מסלול מכשולים, מיון צבעים ועוד.', keys: 'גיל שנתיים בן שנתיים פעוט משחקים' },
  { to: '/toddlers/age-3', title: 'משחקים ופעילויות לגיל 3', emoji: '🎨', kind: 'tool', desc: 'רעיונות לגיל 3 לבית ולגן.', keys: 'גיל 3 גיל שלוש בן שלוש משחקים' },
  { to: '/toddlers/birthday-age-1', title: 'יום הולדת שנה — רעיונות', emoji: '🎂', kind: 'tool', desc: 'מסיבה קצרה, עוגת סמאש, משחקים ובטיחות.', keys: 'יום הולדת שנה יומולדת ראשון עוגת סמאש' },
  { to: '/toddlers/birthday-age-2', title: 'יום הולדת שנתיים — רעיונות', emoji: '🎈', kind: 'tool', desc: 'מסיבה קצרה עם משחקים לפעוטות.', keys: 'יום הולדת שנתיים יומולדת 2' },
  { to: '/toddlers/birthday-age-3', title: 'יום הולדת 3 — רעיונות', emoji: '🥳', kind: 'tool', desc: 'משחקים, עוגה וסדר יום ליום הולדת 3.', keys: 'יום הולדת 3 שלוש יומולדת 3' },
  { to: '/games/shabbat', title: 'משחקים לשבת', emoji: '🕯️', kind: 'tool', desc: '28 משחקים בלי חשמל, כתיבה או ציוד מיוחד.', keys: 'שבת משחקי שבת פעילויות לשבת בלי חשמל שולחן שבת' },
  { to: '/gifts/teacher-end-of-year', title: 'מתנה למורה לסוף השנה', emoji: '🍎', kind: 'tool', desc: 'רעיונות לפי תקציב, מחשבון חלוקה לוועד וכרטיס תודה.', keys: 'מתנה למורה סוף שנה יום המורה מחנכת סייעת ועד הורים מתנה כיתתית כרטיס תודה' },
  { to: '/gifts/gananet', title: 'מתנה לגננת ולסייעת', emoji: '🌼', kind: 'tool', desc: 'מה קונים לגננת, לסייעת ולצהרון, ומחשבון חלוקה.', keys: 'מתנה לגננת סייעת צהרון סוף שנה גן ועד הורים' },
  { to: '/ideas/kindergarten-graduation', title: 'מסיבת סיום גן', emoji: '🎓', kind: 'idea', desc: 'תוכנית, תפקידים לוועד, צ׳קליסט ותעודת סיום גן.', keys: 'מסיבת סיום גן חובה טקס תעודת סיום גן ועד הורים' },
  { to: '/ideas/6th-grade-graduation', title: 'מסיבת סיום כיתה ו׳', emoji: '🎓', kind: 'idea', desc: 'סדר טקס, מסיבה, ספר מחזור וצ׳קליסט.', keys: 'סיום כיתה ו טקס סיום מסיבת סיום ספר מחזור' },
  { to: '/printables/school-supplies-list', title: 'רשימת ציוד לבית הספר ולגן', emoji: '🎒', kind: 'tool', desc: 'צ׳קליסט ציוד לגן, לכיתה א׳ ולכיתות ב׳–ו׳.', keys: 'רשימת ציוד כיתה א גן ציוד לבית הספר קלמר מחברות חזרה ללימודים' },
  { to: '/guides/birthday-in-kindergarten', title: 'יום הולדת בגן', emoji: '👑', kind: 'idea', desc: 'מה מביאים, כתר וכיסא, אלרגיות ושאלות לגננת.', keys: 'יום הולדת בגן מה מביאים כתר כיבוד אלרגיות גננת' },
  ...SUPPLIER_CATEGORY_PAGES.map(p => ({ to: categoryPagePath(p.slug), title: p.h1, emoji: p.emoji, kind: 'page', desc: p.short, keys: [p.name, ...(p.keywords || [])].join(' ') + ' ספק ספקים' })),
  { to: '/math', title: 'תרגילי חשבון ומתמטיקה מכיתה א׳ עד י״ב', emoji: '🧮', kind: 'tool', desc: 'תרגול אינסופי, מבחנים ודפי עבודה לפי כיתה ונושא.', keys: 'תרגילי חשבון תרגילים בחשבון מתמטיקה חשבון גאומטריה אלגברה תרגול מתמטיקה דפי עבודה מבחן במתמטיקה שיעורי בית בגרות' },
  ...[['א׳', '🍎'], ['ב׳', '🧮'], ['ג׳', '✖️'], ['ד׳', '➗'], ['ה׳', '🔢'], ['ו׳', '📐'], ['ז׳', '➖'], ['ח׳', '📈'], ['ט׳', '🧩'], ['י׳', '📊'], ['י״א', '∑'], ['י״ב', '∫']].map(([l, e], i) => ({ to: `/math/grade-${i + 1}`, title: i < 6 ? `תרגילי חשבון לכיתה ${l}` : `מתמטיקה לכיתה ${l}`, emoji: e, kind: 'tool', desc: `נושאים, תרגול, מבחן מסכם ודפי עבודה לכיתה ${l}.`, keys: `מתמטיקה חשבון תרגילי חשבון דפי עבודה בחשבון כיתה ${l} כיתה ${l.replace(/[׳״]/g, '')} מבחן בחשבון מבחן במתמטיקה תרגול` })),
  { to: '/jokes/keresh', title: 'בדיחות קרש לילדים – 100 בדיחות עם תשובות', emoji: '🪵', kind: 'tool', desc: '100 בדיחות קרש נקיות בעברית, בדיחה אקראית והדפסה.', keys: 'בדיחות קרש בדיחת קרש לילדים משחקי מילים מה אמר שאלות מצחיקות בדיחות קצרות הומור' },
  { to: '/trivia/with-answers', title: 'שאלות טריוויה עם תשובות', emoji: '🧠', kind: 'tool', desc: '160 שאלות עם תשובות והסבר, גם להדפסה.', keys: 'שאלות טריוויה טריוויה עם תשובות טריוויה לילדים שאלות ידע כללי חידון' },
  { to: '/trivia/with-answers/kids-easy', title: 'שאלות טריוויה לילדים עם תשובות', emoji: '🧸', kind: 'tool', desc: 'שאלות קלות לגיל 6–9.', keys: 'טריוויה לילדים שאלות לילדים חידון לילדים' },
  { to: '/trivia/with-answers/general', title: 'שאלות ידע כללי עם תשובות', emoji: '🧠', kind: 'tool', desc: '20 שאלות ידע כללי.', keys: 'ידע כללי שאלות ידע כללי' },
  { to: '/trivia/with-answers/israel', title: 'שאלות טריוויה על ישראל', emoji: '🇮🇱', kind: 'tool', desc: 'נופים, סמלים, אישים ועברית.', keys: 'טריוויה ישראל חידון יום העצמאות' },
  { to: '/trivia/with-answers/family', title: 'שאלות טריוויה למשפחה', emoji: '👨‍👩‍👧', kind: 'tool', desc: 'שאלות לכל הגילים לערב משפחתי.', keys: 'טריוויה למשפחה חידון משפחתי' },
  { to: '/learn/multiplication-table', title: 'לוח הכפל', emoji: '✖️', kind: 'tool', desc: 'לוח הכפל הצבעוני, עם הסתרת תשובות והדפסה.', keys: 'לוח הכפל לוח כפל טבלת הכפל לוח הכפל להדפסה לוח כפל ריק כפל' },
  { to: '/learn/multiplication-table/100', title: 'לוח הכפל עד 100', emoji: '💯', kind: 'tool', desc: 'טבלת 10×10 ודפים להדפסה.', keys: 'לוח הכפל עד 100 לוח כפל 10x10' },
  { to: '/learn/multiplication-table/1000', title: 'לוח הכפל עד 1000', emoji: '🔢', kind: 'tool', desc: 'כפל בעשרות ובמאות ודפי תרגול.', keys: 'לוח הכפל עד 1000 כפל בעשרות כפל במאות' },
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => ({ to: `/learn/multiplication-table/of/${n}`, title: `לוח הכפל של ${n}`, emoji: '✖️', kind: 'tool', desc: `כל התרגילים של ${n}, טריק לזכירה ובוחן.`, keys: `לוח הכפל של ${n} כפולות של ${n} כפול ${n}` })),
  { to: '/cakes', title: 'עוגת יום הולדת — מתכונים', emoji: '🎂', kind: 'tool', desc: 'עוגת שוקולד, קרם, קאפקייקס, עוגת מספר, ללא גלוטן ופרווה.', keys: 'עוגה עוגות עוגת יום הולדת מתכון אפייה שוקולד קרם קאפקייקס ביסקוויטים ללא גלוטן פרווה טבעונית מספר' },
  { to: '/cakes/chocolate-birthday-cake', title: 'עוגת יום הולדת שוקולד', emoji: '🍫', kind: 'tool', desc: 'עוגת שוקולד עסיסית בתבנית.', keys: 'עוגת שוקולד יום הולדת תבנית בחושה' },
  { to: '/cakes/number-cake', title: 'עוגת מספר — שרטוט חיתוך לכל ספרה', emoji: '🔢', kind: 'tool', desc: 'חותכים ספרה מעוגה בתבנית, עם שרטוט להדפסה.', keys: 'עוגת מספר מספרים ספרה גיל נאמבר קייק' },
  { to: '/cakes/gluten-free-chocolate-cake', title: 'עוגת יום הולדת ללא גלוטן', emoji: '🌾', kind: 'tool', desc: 'עוגת שוקולד בלי קמח.', keys: 'ללא גלוטן צליאקיה בלי קמח עוגה' },
  { to: '/cakes/parve-marble-cake', title: 'עוגת יום הולדת פרווה', emoji: '🥄', kind: 'tool', desc: 'עוגת שיש עם מיץ תפוזים, בלי חלב.', keys: 'פרווה עוגת שיש בלי חלב' },
  { to: '/cakes/biscuit-cake', title: 'עוגת ביסקוויטים בלי אפייה', emoji: '❄️', kind: 'tool', desc: 'ביסקוויטים, קרם וניל ושוקולד — בלי תנור.', keys: 'עוגת ביסקוויטים בלי אפייה פודינג' },
  { to: '/cakes/cupcakes', title: 'קאפקייקס ליום הולדת', emoji: '🧁', kind: 'tool', desc: '12 קאפקייקס וניל עם קרם חמאה.', keys: 'קאפקייקס מאפינס יום הולדת כיתה גן' },
  { to: '/cakes/decorating-ideas', title: 'רעיונות לקישוט עוגת יום הולדת', emoji: '🎨', kind: 'tool', desc: 'חד־קרן, כדורגל, נסיכה, דינוזאורים ועוד.', keys: 'קישוט עוגה רעיונות חד קרן כדורגל נסיכה דינוזאור קשת' },
  { to: '/baby-names', title: 'שמות לתינוקות', emoji: '👶', kind: 'tool', desc: 'מאגר שמות לבנים ולבנות עם משמעות ומקור.', keys: 'שמות לתינוקות שם לתינוק משמעות השם שמות עבריים שמות תנכיים' },
  { to: '/baby-names/girls', title: 'שמות לבנות', emoji: '👧', kind: 'tool', desc: 'שמות יפים לבנות עם משמעות.', keys: 'שמות לבנות שם לבת שמות לתינוקת' },
  { to: '/baby-names/boys', title: 'שמות לבנים', emoji: '👦', kind: 'tool', desc: 'שמות יפים לבנים עם משמעות.', keys: 'שמות לבנים שם לבן שמות לתינוק' },
  { to: '/baby-names/unisex', title: 'שמות יוניסקס', emoji: '🧒', kind: 'tool', desc: 'שמות שמתאימים לבנים ולבנות.', keys: 'שמות יוניסקס שם לבן ולבת' },
  // school holidays calendar (/school-holidays/*)
  { to: '/school-holidays', title: 'לוח חופשות 2026–2027 משרד החינוך', emoji: '📅', kind: 'tool', desc: 'כל החופשות של תשפ״ז, ספירה לאחור, הדפסה ויומן.', keys: 'לוח חופשות חופשות משרד החינוך תשפז חופש ספירה לאחור מתי החופש לוח חופשים' },
  { to: '/school-holidays/hanukkah', title: 'חופשת חנוכה 2026', emoji: '🕎', kind: 'tool', desc: '6.12–12.12.2026, ומה עושים בחופש.', keys: 'חופשת חנוכה חופש חנוכה תאריכים' },
  { to: '/school-holidays/purim', title: 'חופשת פורים 2027', emoji: '🎭', kind: 'tool', desc: '23–24.3.2027.', keys: 'חופשת פורים חופש פורים שושן פורים' },
  { to: '/school-holidays/pesach', title: 'חופשת פסח 2027', emoji: '🫓', kind: 'tool', desc: '13.4–28.4.2027, ומה עושים בחופש.', keys: 'חופשת פסח חופש פסח ליל הסדר' },
  { to: '/school-holidays/yom-haatzmaut', title: 'יום העצמאות 2027 — יום חופש', emoji: '🇮🇱', kind: 'tool', desc: '12.5.2027.', keys: 'יום העצמאות חופש' },
  { to: '/school-holidays/lag-baomer', title: 'ל״ג בעומר 2027 — יש לימודים?', emoji: '🔥', kind: 'tool', desc: '25.5.2027 — לפי הלוח, יום לימודים.', keys: 'לג בעומר חופש לימודים' },
  { to: '/school-holidays/shavuot', title: 'חופשת שבועות 2027', emoji: '🌾', kind: 'tool', desc: '10–11.6.2027.', keys: 'חופשת שבועות חופש שבועות' },
  { to: '/school-holidays/summer', title: 'החופש הגדול 2027 — מתי מתחיל?', emoji: '☀️', kind: 'tool', desc: 'גן ויסודי מ־1.7, חט״ב ותיכון מ־21.6.2027.', keys: 'החופש הגדול סוף שנת הלימודים קיץ מתי נגמרת השנה' },
  // bedtime stories (/stories/*)
  { to: '/stories', title: 'סיפורים לפני השינה לילדים', emoji: '📚', kind: 'tool', desc: `${BEDTIME_STORY_COUNT} סיפורים קצרים לפי גיל ונושא, גם עם שם הילד.`, keys: 'סיפור סיפורים סיפורים לילדים סיפור ילדים לפני השינה לילה טוב סיפור אישי עם שם' },
  { to: '/stories/snail-and-sparrow', title: 'השבלול והדרורית — סיפור לפני השינה', emoji: '🐌', kind: 'tool', desc: 'גילאי 3–5 · חברות', keys: 'סיפור לפני השינה סיפור ילדים חברות' },
  { to: '/stories/new-kid-in-kindergarten', title: 'הילדה החדשה בגן — סיפור לפני השינה', emoji: '🪣', kind: 'tool', desc: 'גילאי 5–7 · חברות', keys: 'סיפור לפני השינה סיפור ילדים חברות' },
  { to: '/stories/two-towers-and-a-bridge', title: 'שני מגדלים וגשר אחד — סיפור לפני השינה', emoji: '🧱', kind: 'tool', desc: 'גילאי 5–7 · חברות', keys: 'סיפור לפני השינה סיפור ילדים חברות' },
  { to: '/stories/letters-to-a-faraway-friend', title: 'מכתבים לחבר רחוק — סיפור לפני השינה', emoji: '✉️', kind: 'tool', desc: 'גילאי 7–9 · חברות', keys: 'סיפור לפני השינה סיפור ילדים חברות' },
  { to: '/stories/bear-cub-winter-sleep', title: 'הדובון שלא רצה לישון — סיפור לפני השינה', emoji: '🐻', kind: 'tool', desc: 'גילאי 3–5 · חיות', keys: 'סיפור לפני השינה סיפור ילדים חיות' },
  { to: '/stories/owl-awake-in-the-day', title: 'הינשופה שהתעוררה ביום — סיפור לפני השינה', emoji: '🦉', kind: 'tool', desc: 'גילאי 5–7 · חיות', keys: 'סיפור לפני השינה סיפור ילדים חיות' },
  { to: '/stories/little-fish-and-the-moon', title: 'הדג הקטן והירח — סיפור לפני השינה', emoji: '🐟', kind: 'tool', desc: 'גילאי 3–5 · חיות', keys: 'סיפור לפני השינה סיפור ילדים חיות' },
  { to: '/stories/old-horse-on-the-farm', title: 'הסוס הזקן מהחווה — סיפור לפני השינה', emoji: '🐴', kind: 'tool', desc: 'גילאי 7–9 · חיות', keys: 'סיפור לפני השינה סיפור ילדים חיות' },
  { to: '/stories/the-seed-that-waited', title: 'הזרע שחיכה — סיפור לפני השינה', emoji: '🌱', kind: 'tool', desc: 'גילאי 3–5 · טבע', keys: 'סיפור לפני השינה סיפור ילדים טבע' },
  { to: '/stories/cloud-that-changed-shapes', title: 'הענן שהחליף צורות — סיפור לפני השינה', emoji: '☁️', kind: 'tool', desc: 'גילאי 5–7 · טבע', keys: 'סיפור לפני השינה סיפור ילדים טבע' },
  { to: '/stories/the-neighborhood-olive-tree', title: 'עץ הזית של השכונה — סיפור לפני השינה', emoji: '🫒', kind: 'tool', desc: 'גילאי 7–9 · טבע', keys: 'סיפור לפני השינה סיפור ילדים טבע' },
  { to: '/stories/the-night-the-lights-went-out', title: 'הלילה שבו כבה החשמל — סיפור לפני השינה', emoji: '🔦', kind: 'tool', desc: 'גילאי 7–9 · משפחה', keys: 'סיפור לפני השינה סיפור ילדים משפחה' },
  { to: '/stories/a-new-baby-sister', title: 'אחות קטנה חדשה — סיפור לפני השינה', emoji: '👶', kind: 'tool', desc: 'גילאי 3–5 · משפחה', keys: 'סיפור לפני השינה סיפור ילדים משפחה' },
  { to: '/stories/grandmas-patchwork-quilt', title: 'השמיכה של סבתא — סיפור לפני השינה', emoji: '🧵', kind: 'tool', desc: 'גילאי 5–7 · משפחה', keys: 'סיפור לפני השינה סיפור ילדים משפחה' },
  { to: '/stories/a-new-room-in-a-new-home', title: 'חדר חדש בבית חדש — סיפור לפני השינה', emoji: '📦', kind: 'tool', desc: 'גילאי 7–9 · משפחה', keys: 'סיפור לפני השינה סיפור ילדים משפחה' },
  { to: '/stories/the-little-flashlight', title: 'הפנס הקטן של רון — סיפור לפני השינה', emoji: '🔦', kind: 'tool', desc: 'גילאי 3–5 · אומץ ופחדים', keys: 'סיפור לפני השינה סיפור ילדים אומץ ופחדים' },
  { to: '/stories/the-tall-slide', title: 'נוגה והמגלשה הגבוהה — סיפור לפני השינה', emoji: '🛝', kind: 'tool', desc: 'גילאי 3–5 · אומץ ופחדים', keys: 'סיפור לפני השינה סיפור ילדים אומץ ופחדים' },
  { to: '/stories/counting-to-the-thunder', title: 'סופרים עד הרעם — סיפור לפני השינה', emoji: '⛈️', kind: 'tool', desc: 'גילאי 5–7 · אומץ ופחדים', keys: 'סיפור לפני השינה סיפור ילדים אומץ ופחדים' },
  { to: '/stories/three-minutes-in-front-of-the-class', title: 'שלוש דקות מול הכיתה — סיפור לפני השינה', emoji: '🐝', kind: 'tool', desc: 'גילאי 7–9 · אומץ ופחדים', keys: 'סיפור לפני השינה סיפור ילדים אומץ ופחדים' },
  { to: '/stories/night-of-shooting-stars', title: 'לילה של כוכבים נופלים — סיפור לפני השינה', emoji: '🌠', kind: 'tool', desc: 'גילאי 7–9 · טבע', keys: 'סיפור לפני השינה סיפור ילדים טבע' },
  { to: '/stories/the-red-ball', title: 'הכדור האדום — סיפור לפני השינה', emoji: '🔴', kind: 'tool', desc: 'גילאי 3–5 · שיתוף ונתינה', keys: 'סיפור לפני השינה סיפור ילדים שיתוף ונתינה' },
  { to: '/stories/the-big-yellow-umbrella', title: 'המטרייה הצהובה הגדולה — סיפור לפני השינה', emoji: '☂️', kind: 'tool', desc: 'גילאי 5–7 · שיתוף ונתינה', keys: 'סיפור לפני השינה סיפור ילדים שיתוף ונתינה' },
  { to: '/stories/rachels-garden', title: 'הגינה של רחל — סיפור לפני השינה', emoji: '🍋', kind: 'tool', desc: 'גילאי 7–9 · שיתוף ונתינה', keys: 'סיפור לפני השינה סיפור ילדים שיתוף ונתינה' },
  { to: '/stories/the-new-box-of-markers', title: 'קופסת הטושים החדשה — סיפור לפני השינה', emoji: '🖍️', kind: 'tool', desc: 'גילאי 5–7 · שיתוף ונתינה', keys: 'סיפור לפני השינה סיפור ילדים שיתוף ונתינה' },
  { to: '/stories/the-bed-that-became-a-ship', title: 'המיטה שהפכה לספינה — סיפור לפני השינה', emoji: '⛵', kind: 'tool', desc: 'גילאי 3–5 · דמיון', keys: 'סיפור לפני השינה סיפור ילדים דמיון' },
  { to: '/stories/the-big-cardboard-box', title: 'ארגז הקרטון הגדול — סיפור לפני השינה', emoji: '📦', kind: 'tool', desc: 'גילאי 5–7 · דמיון', keys: 'סיפור לפני השינה סיפור ילדים דמיון' },
  { to: '/stories/a-sea-without-blue', title: 'ים בלי צבע כחול — סיפור לפני השינה', emoji: '🎨', kind: 'tool', desc: 'גילאי 7–9 · דמיון', keys: 'סיפור לפני השינה סיפור ילדים דמיון' },
  { to: '/stories/a-night-in-the-sukkah', title: 'לילה בסוכה — סיפור לפני השינה', emoji: '🌿', kind: 'tool', desc: 'גילאי 5–7 · חגים ועונות', keys: 'סיפור לפני השינה סיפור ילדים חגים ועונות' },
  { to: '/stories/the-little-shamash', title: 'הַשַּׁמָּשׁ הקטן — סיפור לפני השינה', emoji: '🕎', kind: 'tool', desc: 'גילאי 7–9 · חגים ועונות', keys: 'סיפור לפני השינה סיפור ילדים חגים ועונות' },
  { to: '/stories/the-first-rain', title: 'הגשם הראשון — סיפור לפני השינה', emoji: '🌧️', kind: 'tool', desc: 'גילאי 3–5 · חגים ועונות', keys: 'סיפור לפני השינה סיפור ילדים חגים ועונות' },
  // learning at home (/learn/*)
  { to: '/learn', title: 'לומדים — חשבון, עברית, אנגלית ומדע', emoji: '📚', kind: 'tool', desc: 'חשבון לפי כיתה, אותיות וקריאה, הכתבה, אנגלית ושפות, מוזיקה ומדע.', keys: 'תרגול לימודים שיעורי בית לומדים בבית למידה' },
  { to: '/typing', title: 'הקלדה עיוורת בעברית', emoji: '⌨️', kind: 'tool', desc: 'קורס חינם: 25 שיעורים, מקלדת צבעונית ומילים לדקה.', keys: 'הקלדה עיוורת הקלדה עיוורת בעברית כתיבה עיוורת שיטה עיוורת לימוד הקלדה קורס הקלדה הקלדה בעשר אצבעות מקלדת תרגול הקלדה' },
  { to: '/typing/test', title: 'מבחן מהירות הקלדה', emoji: '⏱️', kind: 'tool', desc: 'כמה מילים לדקה אתם מקלידים? דקה, שתיים או שלוש.', keys: 'מבחן מהירות הקלדה מהירות הקלדה מילים לדקה בדיקת מהירות הקלדה מבחן הקלדה' },
  { to: '/typing/english', title: 'הקלדה עיוורת באנגלית', emoji: '🇬🇧', kind: 'tool', desc: 'שיעורי הקלדה על המקלדת האנגלית, הסברים בעברית.', keys: 'הקלדה עיוורת באנגלית הקלדה באנגלית כתיבה עיוורת באנגלית typing' },
  { to: '/typing/game', title: 'משחק הקלדה לילדים', emoji: '🎮', kind: 'tool', desc: 'מילים נופלות — מקלידים לפני שהן נוחתות.', keys: 'משחק הקלדה משחקי הקלדה לילדים משחק מקלדת הקלדה לילדים' },
  { to: '/learn/dictation', title: 'הכתבה אונליין', emoji: '✍️', kind: 'tool', desc: 'הורה מקריא או הקראה קולית, עם בדיקה.', keys: 'הכתבה כתיב איות מילים' },
  { to: '/learn/reading', title: 'הבנת הנקרא', emoji: '📖', kind: 'tool', desc: 'קטעים עם שאלות לכיתות ב׳–ו׳, אונליין ולהדפסה.', keys: 'הבנת הנקרא קריאה קטע שאלות קטעי קריאה' },
  { to: '/learn/reading/grade-2', title: 'הבנת הנקרא כיתה ב׳', emoji: '📖', kind: 'tool', desc: '8 קטעים עם שאלות ודף תשובות לכיתה ב׳.', keys: 'הבנת הנקרא כיתה ב׳ הבנת הנקרא כיתה ב הבנת הנקרא לכיתה ב קטעי קריאה כיתה ב דפי עבודה הבנת הנקרא' },
  { to: '/learn/reading/grade-3', title: 'הבנת הנקרא כיתה ג׳', emoji: '📖', kind: 'tool', desc: '8 קטעים עם שאלות ודף תשובות לכיתה ג׳.', keys: 'הבנת הנקרא כיתה ג׳ הבנת הנקרא כיתה ג הבנת הנקרא לכיתה ג קטעי קריאה כיתה ג דפי עבודה הבנת הנקרא' },
  { to: '/learn/reading/grade-4', title: 'הבנת הנקרא כיתה ד׳', emoji: '📖', kind: 'tool', desc: '8 קטעים עם שאלות ודף תשובות לכיתה ד׳.', keys: 'הבנת הנקרא כיתה ד׳ הבנת הנקרא כיתה ד הבנת הנקרא לכיתה ד קטעי קריאה כיתה ד דפי עבודה הבנת הנקרא' },
  { to: '/learn/reading/grade-5', title: 'הבנת הנקרא כיתה ה׳', emoji: '📖', kind: 'tool', desc: '8 קטעים עם שאלות ודף תשובות לכיתה ה׳.', keys: 'הבנת הנקרא כיתה ה׳ הבנת הנקרא כיתה ה הבנת הנקרא לכיתה ה קטעי קריאה כיתה ה דפי עבודה הבנת הנקרא' },
  { to: '/learn/reading/grade-6', title: 'הבנת הנקרא כיתה ו׳', emoji: '📖', kind: 'tool', desc: '8 קטעים עם שאלות ודף תשובות לכיתה ו׳.', keys: 'הבנת הנקרא כיתה ו׳ הבנת הנקרא כיתה ו הבנת הנקרא לכיתה ו קטעי קריאה כיתה ו דפי עבודה הבנת הנקרא' },
  { to: '/learn/times-tables', title: 'תרגול לוח הכפל', emoji: '✖️', kind: 'tool', desc: 'אתגר הדקה: כמה תרגילים בלוח הכפל תספיקו?', keys: 'תרגול לוח הכפל משחק לוח הכפל לוח הכפל תרגול כפל תרגילי כפל' },
  { to: '/learn/flashcards', title: 'כרטיסיות לימוד', emoji: '🃏', kind: 'tool', desc: 'אנגלית, הפכים, לוח הכפל או כרטיסיות משלכם.', keys: 'כרטיסיות שינון מילים באנגלית' },
  { to: '/learn/gifted-test', title: 'הכנה למבחן מחוננים', emoji: '🧠', kind: 'tool', desc: '120 שאלות תרגול לשלב א׳ ושלב ב׳, עם הסברים.', keys: 'מבחן מחוננים מחוננים שלב א שלב ב איתור מצטיינים הכנה' },
  { to: '/learn/gifted-test/verbal-analogies', title: 'אנלוגיות מילוליות', emoji: '🔤', kind: 'tool', desc: '30 שאלות אנלוגיה לתרגול מבחן מחוננים.', keys: 'אנלוגיות אנלוגיה מילולית מבחן מחוננים' },
  { to: '/learn/gifted-test/number-series', title: 'סדרות מספרים', emoji: '🔢', kind: 'tool', desc: '30 סדרות — מה המספר הבא?', keys: 'סדרות מספרים חוקיות מספר הבא מבחן מחוננים' },
  { to: '/learn/gifted-test/shape-matrices', title: 'מטריצות צורות', emoji: '🔷', kind: 'tool', desc: '30 מטריצות 3×3 לחשיבה צורנית.', keys: 'מטריצות צורות חשיבה צורנית מבחן מחוננים' },
  { to: '/learn/gifted-test/logic-problems', title: 'חשיבה לוגית ובעיות מילוליות', emoji: '🧩', kind: 'tool', desc: '30 שאלות היגיון ובעיות מילוליות עם פתרונות.', keys: 'חשיבה לוגית בעיות מילוליות היגיון מבחן מחוננים' },
  { to: '/learn/gifted-test/grade-2', title: 'מבחני מחוננים כיתה ב׳', emoji: '🌱', kind: 'tool', desc: 'הסבר על המבחן ו-86 שאלות תרגול ברמה קלה ובינונית.', keys: 'מבחני מחוננים כיתה ב מבחן מחוננים כיתה ב מחוננים כיתה ב תרגול מבחן מחוננים לכיתה ב' },
  { to: '/learn/gifted-test/grade-3', title: 'מבחני מחוננים כיתה ג׳', emoji: '🌿', kind: 'tool', desc: '83 שאלות תרגול ברמה בינונית ומאתגרת.', keys: 'מבחני מחוננים כיתה ג מבחן מחוננים כיתה ג מחוננים כיתה ג' },
  { to: '/learn/gifted-test/grade-6', title: 'מבחן מחוננים כיתה ו׳', emoji: '🌳', kind: 'tool', desc: '68 שאלות חשיבה ברמה מאתגרת ומתקדמת.', keys: 'מבחן מחוננים כיתה ו מבחני מחוננים כיתה ו מחוננים כיתה ו חשיבה מתקדמת' },
  { to: '/learn/gifted-test/practice', title: 'תרגול למבחן מחוננים — שאלות חדשות בכל סבב', emoji: '♾️', kind: 'tool', desc: 'תרגול חשיבה בלי סוף לפי כיתה: מילולי, כמותי וצורני.', keys: 'תרגול מבחן מחוננים אונליין שאלות חשיבה חשיבה כמותית חשיבה מילולית חשיבה צורנית מטריצות סדרות' },
  { to: '/learn/gifted-test/simulation', title: 'מבחן מחוננים לדוגמה — סימולציה עם שעון', emoji: '⏱️', kind: 'tool', desc: 'שלושה פרקים עם זמן וציון לכל פרק.', keys: 'מבחן מחוננים לדוגמה סימולציה מבחן מחוננים מבחן לדוגמה עם שעון' },
  { to: '/learn/psychometric-kids', title: 'פסיכומטרי לילדים — חשיבה לפי גיל', emoji: '🎓', kind: 'tool', desc: 'חשיבה מילולית, כמותית וצורנית מהגן ועד כיתה ט׳.', keys: 'פסיכומטרי לילדים פסיכוטכני מבחן חשיבה לילדים חשיבה כמותית מילולית צורנית' },
  { to: '/learn/gifted-test/stage-b', title: 'מבחן מחוננים שלב ב׳', emoji: '🎯', kind: 'tool', desc: 'מה זה שלב ב׳, ו-34 שאלות תרגול ברמה מאתגרת.', keys: 'מבחן מחוננים שלב ב מבחני מחוננים שלב ב שלב ב מחוננים שלב שני' },
  // food for kids (/food/*)
  { to: '/food', title: 'אוכל לילדים', emoji: '🍎', kind: 'tool', desc: 'ארוחת עשר, מתכונים וניסויים.', keys: 'אוכל ילדים מטבח' },
  { to: '/food/school-lunch', title: 'מה שמים בכריך? ארוחת עשר', emoji: '🥪', kind: 'tool', desc: 'מחולל ו-50 רעיונות לכריכים.', keys: 'כריך כריכים סנדוויץ סנדוויצ׳ים ארוחת עשר בית ספר גן מה לשים בכריך' },
  { to: '/food/lunch-planner', title: 'תכנון ארוחת עשר לשבוע', emoji: '🗓️', kind: 'tool', desc: 'עם רשימת קניות להדפסה.', keys: 'תכנון שבועי ארוחת עשר רשימת קניות' },
  { to: '/printables/lunchbox-notes', title: 'פתקים לקופסת האוכל', emoji: '💌', kind: 'printable', desc: 'פתקים קטנים להדפסה — מוכנים או בעיצוב אישי.', keys: 'פתקים פתק קופסת אוכל פתקים אישיים פתק עם שם להכין פתקים' },
  { to: '/printables/allergy-signs', title: 'שלטי אלרגיה ומדבקות', emoji: '🥜', kind: 'printable', desc: 'אצלנו בגן לא אוכלים בוטנים.', keys: 'אלרגיה אלרגיות בוטנים מדבקות גן אגוזים שומשום' },
  { to: '/food/kids-recipes', title: 'מתכונים לילדים', emoji: '👩‍🍳', kind: 'tool', desc: 'מתכונים קלים שילדים מכינים.', keys: 'מתכונים מתכון ילדים בישול אפייה' },
  { to: '/food/kitchen-science', title: 'ניסויים מדעיים לילדים בבית', emoji: '🧪', kind: 'tool', desc: 'מדע עם מה שיש בבית.', keys: 'ניסויים ניסוי ניסויים מדעיים ניסויים לילדים בבית מדע הר געש סודה חומץ' },
  // music area (/music/*)
  { to: '/music', title: 'לומדים מוזיקה', emoji: '🎵', kind: 'tool', desc: 'פסנתר, שירים, תווים ואקורדים.', keys: 'מוזיקה נגינה ללמוד לנגן' },
  { to: '/music/piano', title: 'פסנתר אונליין', emoji: '🎹', kind: 'tool', desc: 'מנגנים בלחיצה, במגע או מהמקלדת.', keys: 'פסנתר אונליין לנגן פסנתר קלידים אורגנית' },
  { to: '/music/songs', title: 'לומדים שירים בפסנתר', emoji: '🎶', kind: 'tool', desc: 'קלידים שנדלקים — לוחצים ומנגנים.', keys: 'שירים לפסנתר ללמוד לנגן שיר תווים לשירים' },
  { to: '/music/read-notes', title: 'משחק קריאת תווים', emoji: '🎼', kind: 'tool', desc: 'איזה תו זה? מהחמשה לפסנתר.', keys: 'קריאת תווים תווים חמשה מפתח סול' },
  { to: '/music/guitar-chords', title: 'אקורדים לגיטרה', emoji: '🎸', kind: 'tool', desc: 'דיאגרמות ושמיעה למתחילים.', keys: 'אקורדים גיטרה אקורד מינור מז׳ור' },
  { to: '/music/concepts', title: 'מושגים במוזיקה', emoji: '📖', kind: 'tool', desc: 'סולם, אקורד, טמפו ועוד — עם הדגמה.', keys: 'מושגים מוזיקה סולם אוקטבה מז׳ור מינור' },
  { to: '/music/styles', title: 'סגנונות מוזיקה', emoji: '🎷', kind: 'tool', desc: 'בלוז, ג׳אז, קלאסי, רוק, פופ ומזרחי.', keys: 'סגנונות מוזיקה בלוז ג׳אז רוק פופ מזרחי קלאסי' },
  // home charts, calendars, paper, games and crafts to print (/printables/*)
  { to: '/printables/home-charts', title: 'לוחות לבית להדפסה', emoji: '🏠', kind: 'printable', desc: 'מטלות, מדבקות, צחצוח שיניים, גמילה ומערכת שעות.', keys: 'לוח לוחות בית הורים ארגון' },
  { to: '/printables/chore-chart', title: 'טבלת מטלות לילדים', emoji: '📋', kind: 'printable', desc: 'משימות לכל יום בשבוע, עם שם הילד.', keys: 'טבלת מטלות משימות תורנות אחריות ילדים בית' },
  { to: '/printables/reward-chart', title: 'לוח מדבקות לחיזוק', emoji: '⭐', kind: 'printable', desc: 'מטרה, דרך של מדבקות ופרס.', keys: 'לוח מדבקות חיזוקים חיזוק חיובי פרס התנהגות' },
  { to: '/printables/toothbrushing-chart', title: 'לוח צחצוח שיניים', emoji: '🦷', kind: 'printable', desc: 'בוקר וערב, לשבוע או לחודש.', keys: 'צחצוח שיניים שיניים מברשת לוח' },
  { to: '/printables/potty-chart', title: 'לוח גמילה מחיתולים', emoji: '🚽', kind: 'printable', desc: 'מדבקה על כל הצלחה.', keys: 'גמילה חיתולים סיר שירותים לוח מדבקות' },
  { to: '/printables/class-schedule', title: 'מערכת שעות להדפסה', emoji: '🗓️', kind: 'printable', desc: 'מערכת שעות ריקה או עם שם וכיתה.', keys: 'מערכת שעות בית ספר שיעורים' },
  { to: '/printables/calendar-2027', title: 'לוח שנה 2027 להדפסה', emoji: '📅', kind: 'printable', desc: 'עברי ולועזי עם חגים.', keys: 'לוח שנה 2027 לוח שנה עברי חגים תאריך עברי' },
  { to: '/printables/calendar-5787', title: 'לוח שנה תשפ״ז', emoji: '🎒', kind: 'printable', desc: 'שנת הלימודים עם כל החגים.', keys: 'לוח שנה תשפז תשפ"ז שנת לימודים 2026 חגים' },
  { to: '/printables/clock-worksheets', title: 'דפי עבודה בשעון', emoji: '🕒', kind: 'printable', desc: 'מה השעה וציירו מחוגים, עם פתרונות.', keys: 'שעון קריאת שעון מחוגים מה השעה דפי עבודה' },
  { to: '/printables/fractions-worksheets', title: 'דפי עבודה בשברים', emoji: '🍕', kind: 'printable', desc: 'איזה חלק צבוע, צבעו והשוו.', keys: 'שברים שבר חצי רבע שליש דפי עבודה' },
  { to: '/printables/lined-paper', title: 'דף שורות להדפסה', emoji: '📝', kind: 'printable', desc: 'נייר כתיבה עם שורות.', keys: 'דף שורות נייר כתיבה מחברת' },
  { to: '/printables/grid-paper', title: 'דף משבצות להדפסה', emoji: '🔲', kind: 'printable', desc: 'משבצות 5 מ״מ או 1 ס״מ.', keys: 'דף משבצות משבצות חשבון מחברת' },
  { to: '/printables/graph-paper', title: 'נייר מילימטרי להדפסה', emoji: '📐', kind: 'printable', desc: 'רשת מילימטרים לגרפים.', keys: 'נייר מילימטרי מילימטרי גרף שרטוט' },
  { to: '/printables/dot-paper', title: 'דף נקודות להדפסה', emoji: '⚬', kind: 'printable', desc: 'רשת נקודות לציור ולמשחק ריבועים.', keys: 'דף נקודות dot grid משחק ריבועים' },
  { to: '/printables/english-lines', title: 'דף שורות לאנגלית', emoji: '🔤', kind: 'printable', desc: 'שורות כתב יד עם קו אמצע.', keys: 'שורות אנגלית כתב יד אנגלית מחברת אנגלית' },
  { to: '/printables/music-paper', title: 'דף תווים ריק', emoji: '🎼', kind: 'printable', desc: 'חמשות לכתיבת תווים.', keys: 'דף תווים חמשות תווים מוזיקה' },
  { to: '/printables/purim-masks', title: 'מסכות לפורים להדפסה', emoji: '🎭', kind: 'printable', desc: '9 מסכות לגזירה ולצביעה.', keys: 'מסכות מסכה פורים תחפושת גזירה' },
  { to: '/printables/birthday-crown', title: 'כתר יום הולדת להדפסה', emoji: '👑', kind: 'printable', desc: 'כתר עם שם וגיל.', keys: 'כתר יום הולדת גן חוגג' },
  { to: '/sudoku', title: 'סודוקו אונליין בחינם — כל הרמות', emoji: '🔢', kind: 'game', desc: 'משחקים ישר בעמוד: קל, בינוני, קשה וקשה מאוד, עם טיוטה ושעון.', keys: 'סודוקו סודוקו אונליין סודוקו חינם סודוקו בחינם סודוקו בעברית לשחק סודוקו sudoku' },
  { to: '/sudoku/easy', title: 'סודוקו קל למתחילים', emoji: '🙂', kind: 'game', desc: 'לוחות 9×9 שנפתרים בצעדים פשוטים, בלי לנחש.', keys: 'סודוקו קל סודוקו קל למתחילים סודוקו למתחילים סודוקו פשוט' },
  { to: '/sudoku/medium', title: 'סודוקו בינוני', emoji: '🤔', kind: 'game', desc: 'פחות מספרים נתונים, יותר סריקה.', keys: 'סודוקו בינוני סודוקו רמה בינונית' },
  { to: '/sudoku/hard', title: 'סודוקו קשה', emoji: '😤', kind: 'game', desc: 'לוחות שדורשים טיוטה, זוגות ונעילות — בחינם, אונליין או להדפסה.', keys: 'סודוקו קשה סודוקו קשה בחינם סודוקו קשה אונליין סודוקו מאתגר' },
  { to: '/sudoku/very-hard', title: 'סודוקו קשה מאוד', emoji: '🔥', kind: 'game', desc: 'הרמה הגבוהה ביותר — גם הטכניקות המתקדמות לא מספיקות.', keys: 'סודוקו קשה מאוד סודוקו קשה במיוחד סודוקו לאלופים סודוקו מומחים' },
  { to: '/sudoku/kids', title: 'סודוקו לילדים — 4×4 ו־6×6', emoji: '🧒', kind: 'game', desc: 'לוחות קטנים לשחק בטלפון או במחשב, ולהדפיס.', keys: 'סודוקו לילדים סודוקו לגן סודוקו 4x4 סודוקו 6x6 סודוקו קטן' },
  { to: '/sudoku/daily', title: 'סודוקו יומי', emoji: '📅', kind: 'game', desc: 'לוח אחד לכולם, מתחלף בחצות.', keys: 'סודוקו יומי סודוקו של היום סודוקו היום' },
  { to: '/sudoku/print', title: 'סודוקו להדפסה — 1 עד 6 לוחות בדף', emoji: '🖨️', kind: 'printable', desc: 'בכל הרמות, עם דפי פתרונות ואפשרות להוריד PDF.', keys: 'סודוקו להדפסה סודוקו להורדה סודוקו להורדה בחינם סודוקו קשה להדפסה סודוקו PDF דפי סודוקו' },
  { to: '/sudoku/solver', title: 'פותר סודוקו', emoji: '🧮', kind: 'tool', desc: 'מקלידים לוח ומקבלים פתרון ורמת קושי.', keys: 'פותר סודוקו פתרון סודוקו לפתור סודוקו פתרונות סודוקו' },
  { to: '/logic-puzzles', title: 'תשבצי היגיון — לפתור אונליין', emoji: '🧠', kind: 'tool', desc: 'תשבץ יומי, 4 רמות, רמז שמסביר את הצעד הבא ופתרון מלא.', keys: 'תשבצי היגיון תשבץ היגיון חידת איינשטיין חידות זברה מי מה לוגיקה טבלת היגיון' },
  { to: '/logic-puzzles/kids', title: 'תשבץ היגיון לילדים', emoji: '🧒', kind: 'tool', desc: '3 ילדים, 3 קטגוריות ורמזים פשוטים.', keys: 'תשבץ היגיון לילדים תשבצי היגיון לילדים קל חידות מי מה' },
  { to: '/logic-puzzles/easy', title: 'תשבצי היגיון קלים', emoji: '🙂', kind: 'tool', desc: 'טבלאות 3×4 עם רמזים מגוונים.', keys: 'תשבץ היגיון קל תשבצי היגיון קלים מתחילים' },
  { to: '/logic-puzzles/hard', title: 'תשבצי היגיון קשים', emoji: '🔥', kind: 'tool', desc: '4 קטגוריות, 4×4 ו־4×5, למבוגרים ולנוער.', keys: 'תשבץ היגיון קשה תשבצי היגיון קשים מבוגרים חידת איינשטיין' },
  { to: '/logic-puzzles/print', title: 'תשבצי היגיון להדפסה', emoji: '🖨️', kind: 'printable', desc: 'דף לכל תשבץ, עם דף פתרון.', keys: 'תשבצי היגיון להדפסה תשבץ היגיון להדפסה עם פתרונות pdf' },
  { to: '/logic-puzzles/solutions', title: 'פתרון תשבץ היגיון — איך פותרים', emoji: '🔎', kind: 'tool', desc: 'השיטה ודוגמה פתורה שלב אחר שלב.', keys: 'פתרון תשבץ היגיון פתרונות תשבצי היגיון איך פותרים תשבץ היגיון' },
  { to: '/printables/mazes', title: 'מבוכים להדפסה — 30 מבוכים ב-5 רמות', emoji: '🌀', kind: 'printable', desc: 'מבוכים מגן ועד מבוגרים, עם פתרון ומבוך חדש בכל לחיצה.', keys: 'מבוך מבוכים להדפסה לילדים קשה קל' },
  { to: '/printables/color-by-number', title: `צביעה לפי מספרים להדפסה — ${CBN_PICTURES.length} ציורים`, emoji: '🎨', kind: 'printable', desc: 'דפי צביעה לפי מספרים לגן, לכיתות א–ב ולמבוגרים, גם עם תרגילי חשבון ועם פתרון.', keys: 'צביעה לפי מספרים דף צביעה לפי מספרים צבעו לפי מספר מספרים למבוגרים פיקסלים תרגילים חיבור כפל בעלי חיים חגים' },
  ...CBN_PICTURES.map(p => ({ to: `/printables/color-by-number/${p.slug}`, title: `צביעה לפי מספרים: ${p.name}`, emoji: p.emoji, kind: 'printable', desc: p.blurb, keys: `צביעה לפי מספרים ${p.name} דף צביעה ${cbnLevel(p.level).label} ${cbnLevel(p.level).mathLabel}` })),
  { to: '/printables/color-by-answer', title: 'צביעה לפי תשובות — דפי צביעה עם תרגילי חשבון', emoji: '🧮', kind: 'printable', desc: 'פותרים את התרגיל וצובעים לפי התשובה: חיבור, חיסור, כפל וחילוק.', keys: 'צביעה לפי תשובות צביעה לפי תרגילים צבעו לפי התשובה דף צביעה חשבון חיבור חיסור כפל חילוק' },
  ...CBN_MATH_KINDS.map(k => ({ to: `/printables/color-by-answer/${k.slug}`, title: `צביעה לפי תשובות: ${k.label}`, emoji: k.emoji, kind: 'printable', desc: `דפי צביעה עם תרגילי ${k.label} — כל תשובה היא צבע. ל${k.grade}.`, keys: `צביעה לפי תשובות ${k.label} צביעה לפי תרגילים דף צביעה ${k.short} ${k.id === 'mult' ? 'לוח הכפל כפל' : ''}` })),
  { to: '/printables/color-by-letter', title: 'צביעה לפי אותיות — דפי צביעה עם אותיות בעברית', emoji: '🔤', kind: 'printable', desc: 'בכל משבצת אות: אותיות שונות, אותיות דומות ואותיות סופיות.', keys: 'צביעה לפי אותיות צבעו לפי אות אותיות דומות אותיות סופיות דף צביעה אותיות א ב' },
  { to: '/printables/color-by-letter/english', title: 'צביעה לפי אותיות באנגלית — Color by Letter', emoji: '🔠', kind: 'printable', desc: 'אותיות גדולות, קטנות (b/d/p/q) והתאמה בין גדולה לקטנה.', keys: 'צביעה לפי אותיות באנגלית color by letter אנגלית ABC אותיות גדולות קטנות' },
  { to: '/printables/activity/color-by-number', title: 'פסיפס לצביעה לפי מספר — דף חדש בכל לחיצה', emoji: '🎨', kind: 'printable', desc: 'פסיפס צבעוני לצביעה לפי מספר, בשלוש רמות גיל.', keys: 'צבעו לפי מספר פסיפס צביעה' },
  { to: '/printables/memory-game', title: 'משחק זיכרון להדפסה', emoji: '🃏', kind: 'printable', desc: '10 זוגות עם תמונות ומילים.', keys: 'משחק זיכרון זוגות קלפים' },
  { to: '/printables/tic-tac-toe', title: 'לוחות איקס עיגול להדפסה', emoji: '❌', kind: 'printable', desc: '6 לוחות 3×3 בדף, לוחות 4×4 ואיקס עיגול כפול.', keys: 'איקס עיגול להדפסה לוח איקס עיגול איקס מיקס דריקס דף משחק לשניים tic tac toe' },
  { to: '/printables/dominoes', title: 'דומינו להדפסה', emoji: '🁫', kind: 'printable', desc: 'קלאסי, מספרים, חיבור ומילים.', keys: 'דומינו' },
  { to: '/printables/fortune-teller', title: 'קוטי פוטי להדפסה', emoji: '🌸', kind: 'printable', desc: 'תבנית קיפול עם משפטים.', keys: 'קוטי פוטי קיפול נייר אוריגמי' },
  { to: '/origami', title: 'אוריגמי לילדים – 15 קיפולי נייר', emoji: '🦢', kind: 'page', desc: 'קיפולי נייר קלים עם ציור לכל שלב והוראות להדפסה.', keys: 'אוריגמי אוריגמים אוריגמי לילדים קיפולי נייר קיפול נייר אוריגמי קל origami' },
  { to: '/origami/paper-cup', title: 'איך מקפלים כוס מנייר', emoji: '🥤', kind: 'page', desc: 'אוריגמי: 6 שלבים מצוירים, עם הוראות להדפסה.', keys: 'כוס נייר כוס מנייר קיפול כוס אוריגמי' },
  { to: '/origami/paper-hat', title: 'איך מקפלים כובע מנייר', emoji: '👒', kind: 'page', desc: 'אוריגמי: 7 שלבים מצוירים, עם הוראות להדפסה.', keys: 'כובע נייר כובע מנייר כובע מעיתון קיפול כובע אוריגמי' },
  { to: '/origami/paper-airplane', title: 'איך מקפלים מטוס נייר', emoji: '✈️', kind: 'page', desc: 'אוריגמי: 9 שלבים מצוירים, עם הוראות להדפסה.', keys: 'מטוס נייר מטוסי נייר איך מקפלים מטוס נייר מטוס מנייר קיפול מטוס אוריגמי' },
  { to: '/origami/paper-glider', title: 'מטוס נייר שעף רחוק', emoji: '🛩️', kind: 'page', desc: 'אוריגמי: 11 שלבים מצוירים, עם הוראות להדפסה.', keys: 'מטוס נייר שעף רחוק מטוס נייר טוב רחפן נייר מטוס נקמורה אוריגמי' },
  { to: '/origami/heart', title: 'איך מקפלים לב מנייר', emoji: '❤️', kind: 'page', desc: 'אוריגמי: 7 שלבים מצוירים, עם הוראות להדפסה.', keys: 'לב מנייר לב אוריגמי קיפול לב אוריגמי' },
  { to: '/origami/dog', title: 'איך מקפלים כלב מנייר', emoji: '🐶', kind: 'page', desc: 'אוריגמי: 6 שלבים מצוירים, עם הוראות להדפסה.', keys: 'כלב מנייר כלב אוריגמי אוריגמי' },
  { to: '/origami/cat', title: 'איך מקפלים חתול מנייר', emoji: '🐱', kind: 'page', desc: 'אוריגמי: 6 שלבים מצוירים, עם הוראות להדפסה.', keys: 'חתול מנייר חתול אוריגמי אוריגמי' },
  { to: '/origami/fox', title: 'איך מקפלים שועל מנייר', emoji: '🦊', kind: 'page', desc: 'אוריגמי: 5 שלבים מצוירים, עם הוראות להדפסה.', keys: 'שועל מנייר שועל אוריגמי אוריגמי' },
  { to: '/origami/tulip', title: 'איך מקפלים צבעוני — פרח מנייר', emoji: '🌷', kind: 'page', desc: 'אוריגמי: 5 שלבים מצוירים, עם הוראות להדפסה.', keys: 'פרח מנייר צבעוני מנייר פרח אוריגמי אוריגמי' },
  { to: '/origami/fortune-teller', title: 'איך מקפלים קוטי פוטי', emoji: '🌸', kind: 'page', desc: 'אוריגמי: 7 שלבים מצוירים, עם הוראות להדפסה.', keys: 'קוטי פוטי איך מקפלים קוטי פוטי ניחושון אוריגמי' },
  { to: '/origami/masu-box', title: 'איך מקפלים קופסה מנייר', emoji: '📦', kind: 'page', desc: 'אוריגמי: 8 שלבים מצוירים, עם הוראות להדפסה.', keys: 'קופסה מנייר קופסת אוריגמי קופסת מסו אוריגמי' },
  { to: '/origami/envelope', title: 'איך מקפלים מעטפה מנייר', emoji: '✉️', kind: 'page', desc: 'אוריגמי: 4 שלבים מצוירים, עם הוראות להדפסה.', keys: 'מעטפה מנייר איך מקפלים מעטפה אוריגמי' },
  { to: '/origami/bookmark', title: 'איך מקפלים סימניה מנייר', emoji: '🔖', kind: 'page', desc: 'אוריגמי: 5 שלבים מצוירים, עם הוראות להדפסה.', keys: 'סימניה מנייר סימניה פינתית סימניה מקופלת אוריגמי' },
  { to: '/origami/samurai-helmet', title: 'איך מקפלים כובע סמוראי מנייר', emoji: '⛑️', kind: 'page', desc: 'אוריגמי: 8 שלבים מצוירים, עם הוראות להדפסה.', keys: 'כובע סמוראי קבוטו קסדה מנייר אוריגמי' },
  { to: '/origami/fan', title: 'איך מכינים מניפה מנייר', emoji: '🪭', kind: 'page', desc: 'אוריגמי: 4 שלבים מצוירים, עם הוראות להדפסה.', keys: 'מניפה מנייר מניפה מקופלת אקורדיון אוריגמי' },
  { to: '/printables/gift-box', title: 'קופסת מתנה לקיפול', emoji: '🎁', kind: 'printable', desc: 'קופסה עם מכסה לגזירה.', keys: 'קופסה קופסת מתנה אריזה קיפול' },
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
  { to: '/music/songs/happy-birthday', title: 'שירי יום הולדת', emoji: '🎵', kind: 'idea', keys: 'שיר שירים' },
  { to: '/compare/home-vs-venue', title: 'יום הולדת בבית או באולם?', emoji: '⚖️', kind: 'idea', keys: 'השוואה אולם בית' },
  { to: '/compare/entertainer-vs-diy', title: 'מפעיל או לבד?', emoji: '⚖️', kind: 'idea', keys: 'השוואה מפעיל' },
  { to: '/calculator', title: 'מחשבון מסיבה — כמה אוכל, שתייה ותקציב', emoji: '🍕', kind: 'tool', keys: 'פיצה פיצות כמה פיצות להזמין שתייה כמה שתייה צריך עלות תקציב כמה עולה יום הולדת מחשבון' }, // one page: the old per-calculator URLs redirect here
  { to: '/classroom/quiz', title: 'מבחן אמריקאי אונליין לכיתה', emoji: '📝', kind: 'tool', keys: 'חידון מבחן בוחן מורה' },
  { to: '/rsvp', title: 'אישור הגעה אונליין בחינם', emoji: '✅', kind: 'tool', desc: 'קישור אחד בוואטסאפ: מי מגיע, כמה ילדים ומבוגרים, אלרגיות ומי עוד לא ענה.', keys: 'אישור הגעה אישורי הגעה אישור הגעה לאירוע אישור הגעה לאירוע חינם אישור הגעה ליום הולדת rsvp מגיעים לא מגיעים הזמנה לאירוע רשימת מוזמנים' },
  { to: '/secret-friend', title: 'גמד וענק — הגרלת שמות אונליין', emoji: '🧙', kind: 'tool', desc: 'כל משתתף מקבל קישור אישי ורק הוא רואה את מי הגריל. גם למשלוח מנות ולחנוכה.', keys: 'גמד וענק גמד ענק הגרלת שמות הגרלה אונליין הגרלה סודית משלוח מנות פורים הגרלת משלוח מנות מתנות חנוכה החלפת מתנות סיקרט סנטה פתקים' },
  { to: '/thank-you-wall', title: 'קיר ברכות לגננת ולמורה', emoji: '💌', kind: 'tool', desc: 'כל הורה מוסיף ברכה בשם הילד, ובסוף מדפיסים חוברת מתנה.', keys: 'ברכות לגננת ברכה לגננת לסוף שנה ברכה לגננת מכתב תודה לגננת ברכה למורה ברכות למורה סוף שנה מתנה לגננת מתנות למורות לסוף שנה תודה לגננת חוברת ברכות' },
  { to: '/chess', title: 'שחמט אונליין – נגד המחשב או חבר', emoji: '♟️', kind: 'game', desc: 'משחק שחמט מלא בחינם: נגד המחשב בשלוש רמות או שני שחקנים על אותו מסך.', keys: 'שחמט שח מט שחמט אונליין משחק שחמט שחמט משחק משחקי שחמט לשחק שחמט שחמט נגד המחשב שחמט לשניים chess' },
  { to: '/chess/puzzles', title: 'חידות שחמט – מט בצעד אחד ובשניים', emoji: '🧩', kind: 'game', desc: '36 חידות מט בשלוש רמות, פותרים על הלוח.', keys: 'חידות שחמט חידת שחמט מט בצעד אחד מט בשני צעדים תרגילי שחמט שחמט' },
  { to: '/chess/how-to-play', title: 'איך משחקים שחמט – כלי השחמט', emoji: '📘', kind: 'page', desc: 'איך זז כל כלי, עם לוח קטן לתרגול וטיפים לילדים.', keys: 'איך משחקים שחמט כלי שחמט איך זז פרש רץ צריח מלכה מלך רגלי לימוד שחמט חוקי שחמט' },
  { to: '/chess/printable-board', title: 'לוח שחמט להדפסה + כלים לגזירה', emoji: '🖨️', kind: 'printable', desc: 'לוח A4, כלים לגזירה ודף עזר.', keys: 'לוח שחמט להדפסה לוח שחמט כלי שחמט להדפסה שחמט להדפסה' },
  { to: '/faq', title: 'שאלות נפוצות', emoji: '❓', kind: 'page', keys: 'עזרה' },
  { to: '/about', title: 'אודות עוגה בוגה', emoji: '🎂', kind: 'page', keys: 'קשר מי אנחנו' },
]

const TOOL_DESC = {
  '/tools/trivia-quiz': 'טריוויה עם מצבי משחק, ניקוד ותחרות.', '/tools/truth-or-buga': 'משחק אמת/שקר עם נושאים, קבוצות וניקוד.',
  '/tools/buga-town': 'משחק לוח של עיר ונכסים עם קוביות, ל-2–4 שחקנים.', '/tools/escape-rooms': 'חדרים דיגיטליים וקיטים להנחיה.',
  '/tools/riddles': 'מאגר חידות לפי נושא, גיל וקושי.', '/tools/emoji-studio': 'מנחשים שירים וסרטים באימוג׳ים.',
  '/tools/bingo-maker': 'כרטיסיות בינגו מוכנות או מותאמות אישית.', '/tools/word-search-maker': 'צרו תפזורות לפי מילים ונושאים.',
  '/tools/crossword-maker': 'מכניסים מילים ומקבלים תשבץ להדפסה.', '/tools/scavenger-hunt-maker': 'רמזים ומשימות מוכנים להפעלה.',
  '/calculator': 'כמה פיצות, שתייה וחטיפים צריך למסיבה.', '/invitation': 'הזמנה אישית ליום הולדת.', '/greeting': 'ברכה אישית ליום הולדת.',
  '/tools/bring-list': 'רשימה שיתופית: כל הורה תופס פריט בקישור אחד.', '/rsvp': 'קישור אחד בוואטסאפ: מי מגיע, כמה ילדים ומי עוד לא ענה.', '/tools/birthday-famous': 'אילו מפורסמים נולדו באותו תאריך.',
  '/classroom/first-grade': 'חוברת הכנה להדפסה (PDF), משחקים, כתיבה, חשבון וקריאה ראשונה.', '/tools/eretz-ir': 'ארץ עיר עם אותיות, טיימר וניקוד.',
  '/tools/experiment-maker': 'בוחרים ניסוי, ממלאים דף חקר ומדפיסים.',
}
const TOOL_KEYS = {
  '/tools/random-picker': 'גלגל מזל גלגל שמות הגרלה הגרלת שמות בוחר אקראי', '/tools/team-generator': 'קבוצות חלוקה', '/tools/countdown-timer': 'שעון עצר',
  '/tools/crossword-maker': 'תשבץ', '/tools/word-search-maker': 'תפזורת תפזורות תפזורת לילדים תפזורת להדפסה', '/invitation': 'הזמנה הזמנות', '/greeting': 'ברכה ברכות',
  '/calculator': 'פיצה שתייה עלות', '/tools/escape-rooms': 'חדר בריחה אסקייפ', '/tools/scavenger-hunt-maker': 'מטמון ציד אוצר',
  '/tools/trivia-quiz': 'טריוויה חידון שאלות', '/tools/riddles': 'חידות חידה', '/board-games': 'משחק לוח', '/classroom/first-grade': 'כיתה א הכנה הכנה לכיתה א חוברת הכנה לכיתה א pdf הכנה לקריאה כיתה א משחקים לקראת כיתה א',
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
  for (const h of HOLIDAY_BLESSINGS) out.push({ to: blessingsHref(h.slug), title: `ברכות וקריאות ל${h.name}`, emoji: h.emoji, kind: 'page', desc: h.intro, keys: `ברכות ${h.name} ברכה ל${h.name} תפילה סידור ${h.tanakh.length ? 'קריאת התורה הפטרה ' : ''}${[...h.blessings.map(b => b.title), ...h.siddur.map(x => x.name)].join(' ')}` })
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
  for (const d of DICE_GAMES) out.push({ to: `/dice-games/${d.slug}`, title: d.title, emoji: d.emoji, kind: 'game', desc: d.description, keys: 'משחק קוביות קובייה חוקים' })
  for (const b of BLOG_POSTS) out.push({ to: `/blog/${b.slug}`, title: b.title, emoji: b.emoji, kind: 'idea', desc: b.description, keys: 'בלוג כתבה' })
  for (const [key, f] of Object.entries(FAQ_TOPICS)) out.push({ to: `/faq/${key}`, title: f.title, emoji: f.emoji, kind: 'page', desc: f.description, keys: 'שאלות נפוצות שאלות ותשובות' })
  for (const room of ESCAPE_ROOMS) out.push({ to: `/tools/escape-rooms/${room.id}`, title: room.title, emoji: room.emoji, kind: 'game', desc: room.description, keys: 'חדר בריחה אסקייפ' })
  out.push({ to: '/tools/trivia-quiz', title: 'טריוויה לכיתה ולמשפחה', emoji: '🎯', kind: 'tool', desc: TOOL_DESC['/tools/trivia-quiz'], keys: TOOL_KEYS['/tools/trivia-quiz'] })
  out.push({ to: '/board-games', title: 'משחקי לוח קלאסיים – לשחק וללמוד', emoji: '♟️', kind: 'game', desc: 'דמקה ועוד – נגד המחשב, נגד חבר ושיעורים.', keys: 'משחק לוח לוח קלאסי' })
  out.push({ to: '/online-games/today', title: 'אתגר היום – משחק אונליין חדש כל יום', emoji: '🌟', kind: 'game', desc: 'אותו אתגר לכולם, מתחלף בחצות. משחקים ומשתפים.', keys: 'אתגר יומי משחק יומי משחק היום אתגר היום סודוקו יומי' })
  out.push({ to: '/online-games/marathon', title: 'מרתון משחקים – 8 משחקים ברצף נגד השעון', emoji: '🏃', kind: 'game', desc: 'כל שלב ממשחק אחר. משימה קצרה, שעון אחד, משתפים את התוצאה.', keys: 'מרתון משחקים מולטי ריבוי משחקים אתגר שלבים' })
  out.push({ to: '/online-games', title: 'משחקי אונליין – סוליטר, סודוקו, נחש ועוד', emoji: '🕹️', kind: 'game', desc: 'משחקי חשיבה קלאסיים על כל המסך, בחינם ובלי הרשמה.', keys: 'משחקי אונליין משחקים במחשב משחקים בטלפון סוליטר סודוקו נחש 2048 שולה מוקשים זיכרון משחקים לשניים ארבע בשורה איקס עיגול' })
  for (const g of ARCADE) out.push({ to: `/online-games/${g.slug}`, title: g.twoPlayer ? `${g.name} לשניים` : g.name, emoji: g.emoji, kind: 'game', desc: g.tagline, keys: `משחק אונליין ${g.name} לשחק ${g.name} בחינם ${g.seoTitle}${g.searchKeys ? ' ' + g.searchKeys : ''}${g.twoPlayer ? ' משחקים לשניים משחק לשני שחקנים שני שחקנים על אותו מסך נגד המחשב' : ''}` })
  for (const g of BOARD_GAMES) out.push({ to: `/board-games/${g.slug}`, title: `${g.name} – לשחק, ללמוד וחוקים`, emoji: g.emoji, kind: 'game', desc: g.tagline, keys: `משחק לוח ${g.name} חוקי ${g.name} ללמוד ${g.name} אונליין` })
  // every date page of the time tunnel ("מה קרה ב-14 במרץ?")
  const HM = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
  ;[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].forEach((len, m) => { for (let d = 1; d <= len; d++) out.push({ to: `/time-tunnel/${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, title: `מה קרה ב-${d} ב${HM[m]}?`, emoji: '⏳', kind: 'page', desc: 'ימים מיוחדים, אירועים ומי נולד בתאריך הזה', keys: `מנהרת הזמן תאריך ${d} ${HM[m]}`, low: true }) })
  const seen = new Set() // one entry per link
  return out.filter(x => { if (seen.has(x.to)) return false; seen.add(x.to); return true })
    .map(x => BEST[x.to] ? { ...x, best: BEST[x.to] } : x)
}
export const STATIC_ITEMS = buildStatic()

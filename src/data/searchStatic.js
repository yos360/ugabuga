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
import { ARCADE } from '../arcade/registry'
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
  { to: '/games', title: 'כל המשחקים', emoji: '🎮', kind: 'page', desc: '100 משחקים לילדים לפי גיל, זמן ומקום.', keys: 'משחק משחקים חיפוש' },
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
  { to: '/rubiks-cube', title: 'פתרון קובייה הונגרית למתחילים', emoji: '🧊', kind: 'tool', desc: '7 שלבים עם הדגמה חיה ואלגוריתמים שנבדקו במחשב.', keys: 'קובייה הונגרית קובייה הונגרית רוביק פתרון אלגוריתם rubik' },
  { to: '/letters', title: 'לימוד אותיות בעברית', emoji: '🔤', kind: 'tool', desc: 'עמוד לכל אות: איך כותבים, מילים, משחק ודף תרגול.', keys: 'אותיות אות עברית לימוד כתיבה דפוס כיתה א גן אלף בית' },
  { to: '/letters/game', title: 'משחק אותיות לגן', emoji: '🎮', kind: 'tool', desc: 'מצאו את האות, באיזו אות זה מתחיל ואיך קוראים לאות.', keys: 'משחק אותיות גן לימוד אותיות עברית חינם' },
  { to: '/abc/game', title: 'חזרה על אותיות באנגלית', emoji: '🔤', kind: 'tool', desc: 'משחק ABC: מצאו את האות, גדולה וקטנה, אות ראשונה.', keys: 'אנגלית אותיות abc חזרה משחק english letters' },
  { to: '/printables/letter-flashcards', title: 'כרטיסיות אותיות להדפסה', emoji: '🃏', kind: 'tool', desc: 'א–ת ו־A–Z עם תמונה ומילה, 8 בדף.', keys: 'כרטיסיות אותיות הדפסה חינם קלפים' },
  { to: '/printables/math-worksheets', title: 'דפי עבודה בחשבון לכיתה א׳', emoji: '➕', kind: 'tool', desc: 'חיבור וחיסור עד 10 ועד 20, מספר חסר, במאונך ושבילים.', keys: 'חשבון דפי עבודה חיבור חיסור עד 10 עד 20 כיתה א תרגילים' },
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
  { to: '/discover/capitals', title: 'בירות ודגלים', emoji: '🌍', kind: 'tool', desc: 'חידון דגלים ובירות של העולם.', keys: 'דגל דגלים בירה בירות מדינות עולם' },
  { to: '/discover/solar-system', title: 'מערכת השמש', emoji: '🪐', kind: 'tool', desc: 'כוכבי הלכת, עובדות וחידון.', keys: 'חלל כוכבי לכת שמש ירח כוכבים' },
  { to: '/discover/human-body', title: 'גוף האדם', emoji: '🫀', kind: 'tool', desc: 'לוחצים על איבר ולומדים.', keys: 'גוף איברים לב מוח עצמות שלד' },
  // family tools (/family/*)
  { to: '/family', title: 'בבית עם הילדים', emoji: '🏡', kind: 'tool', desc: 'כלים קטנים להורים לכל היום.', keys: 'הורים בית' },
  { to: '/family/what-to-do', title: 'מה עושים היום?', emoji: '🎲', kind: 'tool', desc: 'רעיון לפעילות לפי מקום, זמן וגיל.', keys: 'משעמם שעמום פעילות רעיונות מה לעשות' },
  { to: '/family/morning-routine', title: 'שגרת בוקר עם טיימר', emoji: '⏰', kind: 'tool', desc: 'משימה אחרי משימה, ויוצאים בזמן.', keys: 'שגרה בוקר ערב התארגנות' },
  { to: '/family/bedtime-story', title: 'סיפור לפני השינה עם שם', emoji: '🌙', kind: 'tool', desc: 'הילד הוא הגיבור של הסיפור.', keys: 'סיפור סיפורים שינה לילה טוב' },
  { to: '/family/car-games', title: 'משחקים לנסיעה', emoji: '🚗', kind: 'tool', desc: 'בלי מסכים, ובינגו נסיעה להדפסה.', keys: 'נסיעה אוטו רכב טיול בינגו' },
  { to: '/family/move', title: 'אתגר תנועה לילדים', emoji: '🤸', kind: 'tool', desc: 'תרגילים מצחיקים עם טיימר.', keys: 'תנועה ספורט קפיצות התעמלות' },
  { to: '/family/pocket-money', title: 'דמי כיס וחיסכון', emoji: '🐷', kind: 'tool', desc: 'מחשבון חיסכון ושלוש קופות.', keys: 'דמי כיס חיסכון כסף קופה' },
  // learning at home (/learn/*)
  { to: '/learn', title: 'לומדים בבית', emoji: '🎒', kind: 'tool', desc: 'הכתבה, הבנת הנקרא, לוח הכפל וכרטיסיות.', keys: 'תרגול לימודים שיעורי בית' },
  { to: '/learn/dictation', title: 'הכתבה אונליין', emoji: '✍️', kind: 'tool', desc: 'הורה מקריא או הקראה קולית, עם בדיקה.', keys: 'הכתבה כתיב איות מילים' },
  { to: '/learn/reading', title: 'הבנת הנקרא', emoji: '📖', kind: 'tool', desc: 'קטעים קצרים עם שאלות, להדפסה.', keys: 'הבנת הנקרא קריאה קטע שאלות' },
  { to: '/learn/times-tables', title: 'אתגר לוח הכפל', emoji: '✖️', kind: 'tool', desc: 'כמה תרגילים בדקה? ולוח הכפל להדפסה.', keys: 'לוח הכפל כפל תרגילי כפל' },
  { to: '/learn/flashcards', title: 'כרטיסיות לימוד', emoji: '🃏', kind: 'tool', desc: 'אנגלית, הפכים, לוח הכפל או כרטיסיות משלכם.', keys: 'כרטיסיות שינון מילים באנגלית' },
  // food for kids (/food/*)
  { to: '/food', title: 'אוכל לילדים', emoji: '🍎', kind: 'tool', desc: 'ארוחת עשר, מתכונים וניסויים.', keys: 'אוכל ילדים מטבח' },
  { to: '/food/school-lunch', title: 'מה שמים בכריך? ארוחת עשר', emoji: '🥪', kind: 'tool', desc: 'מחולל ו-50 רעיונות לכריכים.', keys: 'כריך כריכים סנדוויץ סנדוויצ׳ים ארוחת עשר בית ספר גן מה לשים בכריך' },
  { to: '/food/lunch-planner', title: 'תכנון ארוחת עשר לשבוע', emoji: '🗓️', kind: 'tool', desc: 'עם רשימת קניות להדפסה.', keys: 'תכנון שבועי ארוחת עשר רשימת קניות' },
  { to: '/printables/lunchbox-notes', title: 'פתקים לקופסת האוכל', emoji: '💌', kind: 'printable', desc: 'פתקים קטנים להדפסה.', keys: 'פתקים פתק קופסת אוכל' },
  { to: '/printables/allergy-signs', title: 'שלטי אלרגיה ומדבקות', emoji: '🥜', kind: 'printable', desc: 'אצלנו בגן לא אוכלים בוטנים.', keys: 'אלרגיה אלרגיות בוטנים מדבקות גן אגוזים שומשום' },
  { to: '/food/kids-recipes', title: 'מתכונים לילדים', emoji: '👩‍🍳', kind: 'tool', desc: 'מתכונים קלים שילדים מכינים.', keys: 'מתכונים מתכון ילדים בישול אפייה' },
  { to: '/food/kitchen-science', title: 'ניסויים לילדים במטבח', emoji: '🧪', kind: 'tool', desc: 'מדע עם מה שיש בבית.', keys: 'ניסויים ניסוי מדע הר געש סודה חומץ' },
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
  { to: '/printables/mazes', title: 'מבוכים להדפסה — 30 מבוכים ב-5 רמות', emoji: '🌀', kind: 'printable', desc: 'מבוכים מגן ועד מבוגרים, עם פתרון ומבוך חדש בכל לחיצה.', keys: 'מבוך מבוכים להדפסה לילדים קשה קל' },
  { to: '/printables/memory-game', title: 'משחק זיכרון להדפסה', emoji: '🃏', kind: 'printable', desc: '10 זוגות עם תמונות ומילים.', keys: 'משחק זיכרון זוגות קלפים' },
  { to: '/printables/dominoes', title: 'דומינו להדפסה', emoji: '🁫', kind: 'printable', desc: 'קלאסי, מספרים, חיבור ומילים.', keys: 'דומינו' },
  { to: '/printables/fortune-teller', title: 'קוטי פוטי להדפסה', emoji: '🌸', kind: 'printable', desc: 'תבנית קיפול עם משפטים.', keys: 'קוטי פוטי קיפול נייר אוריגמי' },
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
  { to: '/calculator/how-many-pizzas', title: 'כמה פיצות להזמין', emoji: '🍕', kind: 'tool', keys: 'פיצה פיצות מחשבון' },
  { to: '/calculator/how-many-drinks', title: 'כמה שתייה צריך', emoji: '🥤', kind: 'tool', keys: 'שתייה מחשבון' },
  { to: '/calculator/birthday-cost', title: 'כמה עולה יום הולדת', emoji: '💰', kind: 'tool', keys: 'עלות תקציב מחשבון' },
  { to: '/classroom/quiz', title: 'מבחן אמריקאי אונליין לכיתה', emoji: '📝', kind: 'tool', keys: 'חידון מבחן בוחן מורה' },
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
  for (const d of DICE_GAMES) out.push({ to: `/dice-games/${d.slug}`, title: d.title, emoji: d.emoji, kind: 'game', desc: d.description, keys: 'משחק קוביות קובייה חוקים' })
  for (const b of BLOG_POSTS) out.push({ to: `/blog/${b.slug}`, title: b.title, emoji: b.emoji, kind: 'idea', desc: b.description, keys: 'בלוג כתבה' })
  for (const [key, f] of Object.entries(FAQ_TOPICS)) out.push({ to: `/faq/${key}`, title: f.title, emoji: f.emoji, kind: 'page', desc: f.description, keys: 'שאלות נפוצות שאלות ותשובות' })
  for (const room of ESCAPE_ROOMS) out.push({ to: `/tools/escape-rooms/${room.id}`, title: room.title, emoji: room.emoji, kind: 'game', desc: room.description, keys: 'חדר בריחה אסקייפ' })
  out.push({ to: '/tools/trivia-quiz', title: 'טריוויה לכיתה ולמשפחה', emoji: '🎯', kind: 'tool', desc: TOOL_DESC['/tools/trivia-quiz'], keys: TOOL_KEYS['/tools/trivia-quiz'] })
  out.push({ to: '/board-games', title: 'משחקי לוח קלאסיים – לשחק וללמוד', emoji: '♟️', kind: 'game', desc: 'דמקה ועוד – נגד המחשב, נגד חבר ושיעורים.', keys: 'משחק לוח לוח קלאסי' })
  out.push({ to: '/online-games/today', title: 'אתגר היום – משחק אונליין חדש כל יום', emoji: '🌟', kind: 'game', desc: 'אותו אתגר לכולם, מתחלף בחצות. משחקים ומשתפים.', keys: 'אתגר יומי משחק יומי משחק היום אתגר היום סודוקו יומי' })
  out.push({ to: '/online-games/marathon', title: 'מרתון משחקים – 8 משחקים ברצף נגד השעון', emoji: '🏃', kind: 'game', desc: 'כל שלב ממשחק אחר. משימה קצרה, שעון אחד, משתפים את התוצאה.', keys: 'מרתון משחקים מולטי ריבוי משחקים אתגר שלבים' })
  out.push({ to: '/online-games', title: 'משחקי אונליין – סוליטר, סודוקו, נחש ועוד', emoji: '🕹️', kind: 'game', desc: 'משחקי חשיבה קלאסיים על כל המסך, בחינם ובלי הרשמה.', keys: 'משחקי אונליין משחקים במחשב משחקים בטלפון סוליטר סודוקו נחש 2048 שולה מוקשים זיכרון משחקים לשניים ארבע בשורה איקס עיגול' })
  for (const g of ARCADE) out.push({ to: `/online-games/${g.slug}`, title: g.twoPlayer ? `${g.name} לשניים` : g.name, emoji: g.emoji, kind: 'game', desc: g.tagline, keys: `משחק אונליין ${g.name} לשחק ${g.name} בחינם ${g.seoTitle}${g.twoPlayer ? ' משחקים לשניים משחק לשני שחקנים שני שחקנים על אותו מסך נגד המחשב' : ''}` })
  for (const g of BOARD_GAMES) out.push({ to: `/board-games/${g.slug}`, title: `${g.name} – לשחק, ללמוד וחוקים`, emoji: g.emoji, kind: 'game', desc: g.tagline, keys: `משחק לוח ${g.name} חוקי ${g.name} ללמוד ${g.name} אונליין` })
  // every date page of the time tunnel ("מה קרה ב-14 במרץ?")
  const HM = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
  ;[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].forEach((len, m) => { for (let d = 1; d <= len; d++) out.push({ to: `/time-tunnel/${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, title: `מה קרה ב-${d} ב${HM[m]}?`, emoji: '⏳', kind: 'page', desc: 'ימים מיוחדים, אירועים ומי נולד בתאריך הזה', keys: `מנהרת הזמן תאריך ${d} ${HM[m]}`, low: true }) })
  const seen = new Set() // one entry per link
  return out.filter(x => { if (seen.has(x.to)) return false; seen.add(x.to); return true })
    .map(x => BEST[x.to] ? { ...x, best: BEST[x.to] } : x)
}
export const STATIC_ITEMS = buildStatic()

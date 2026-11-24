import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import { wrapLines } from '../../data/hanukkahLighting'

// /school-holidays/hanukkah/home-camp: a ready day-by-day "home camp" for the Hanukkah school break
// (Sunday 6.12 - Saturday 12.12.2026) for parents of kids 4-10. Seven themed days, each with a
// morning activity, a craft, a game and a calm activity, links to pages that already exist on the site,
// a printable A4 schedule (day x morning/noon/afternoon) and a camp "passport" with a stamp per day.
// A tick box for "two kids of different ages" adds adaptation tips. Nothing typed leaves the browser.
const PATH = '/school-holidays/hanukkah/home-camp'

const DAYS = [
  {
    id: 'sevivon', day: 'ראשון', date: '6.12', theme: 'יום הסביבון', emoji: '🌀', candles: 3,
    blurb: 'פותחים את הקייטנה בסביבונים: מכינים, מסובבים ומנצחים. יום שיש בו הרבה צחוק ואפס הכנה.',
    need: 'קרטון, עיפרון, צבעים, חופן אגוזים או כפתורים לקופה, דף ועט לניקוד.',
    morning: { t: 'אליפות סביבונים', d: 'כל ילד מקבל עשרה אגוזים או כפתורים. מסובבים בתור: נ׳ כלום, ג׳ לוקחים את כל הקופה, ה׳ לוקחים חצי, פ׳ מניחים אחד. מי שנגמר לו יוצא, והמנצח מקבל את כתר האליפות מנייר.' },
    craft: { t: 'סביבון מקרטון ועיפרון', d: 'חותכים ריבוע קרטון של 8×8 ס״מ, מותחים שני אלכסונים, כותבים בכל משולש אחת מהאותיות נ ג ה פ, צובעים ותוקעים עיפרון קצר במרכז.' },
    game: { t: 'סביבון אונליין', d: 'כשמתחשק משחק אחר, מסובבים סביבון על המסך ושומרים ניקוד, גם כשהסביבון האמיתי נפל מהשולחן.' },
    calm: { t: 'צביעת סביבונים', d: 'דפי צביעה עם הסביבון בקצב שלכם, ליד שולחן ועם מוזיקה שקטה.' },
    links: [{ href: '/holidays/hanukkah/sevivon', label: 'סביבון וירטואלי' }, { href: '/printables/coloring/dreidel', label: 'סביבון לצביעה' }, { href: '/holidays/hanukkah/songs', label: 'שירי חנוכה' }],
    small: 'ילד בן 4–5 לא חייב לחכות לתור: נותנים לו להסתכל באיזו אות נפל הסביבון ולהכריז "גדול!" או "קטן!". את האגוזים סופרים יחד.',
    big: 'ילד בן 8–10 מחשב סיכויים: כמה פעמים מתוך 20 סיבובים נפל על כל אות? רושמים טבלה ובודקים אם הסביבון הוגן.',
    short: { m: 'אליפות סביבונים עם אגוזים', n: 'ארוחה קלה וסיפור קצר', a: 'סביבון מקרטון וצביעה' },
    mission: 'מכינים סביבון ומנצחים סיבוב אחד',
  },
  {
    id: 'kitchen', day: 'שני', date: '7.12', theme: 'יום המטבח', emoji: '🥞', candles: 4,
    blurb: 'יום של אוכל חם וריח של חג. הילדים מכינים, המבוגר אחראי על האש והשמן.',
    need: 'תפוחי אדמה, ביצה, קמח, מלח, שמן, מרית, צלחות נייר. לסופגניות מקושטות: עוגיות עגולות, ממרח, סוכריות.',
    morning: { t: 'מכינים לביבות', d: 'הילדים מגררים (ילדים בוגרים בפומפייה, הקטנים מערבבים), מוסיפים ביצה, קמח ומלח וממלאים את הקערה. את הטיגון עושה מבוגר בלבד, והילדים ממתינים במרחק.' },
    craft: { t: 'סופגניות מקושטות', d: 'עוגיות עגולות או עיגולי קרטון הופכים לסופגניות: ממרח, אבקת סוכר מנייר או סוכריות. מי שלא רוצה לאכול מקשט לתלייה.' },
    game: { t: 'מסעדת חנוכה', d: 'ילד אחד מלצר, אחד לקוח, ואחד שף. מזמינים בקול לביבה אחת ושתי סופגניות, וסופרים כסף מדומה מקרטון.' },
    calm: { t: 'סופגנייה לצביעה', d: 'אחרי האוכל יושבים עם דפי צביעה של סופגניות ושל פך שמן.' },
    links: [{ href: '/food', label: 'אוכל לילדים' }, { href: '/printables/coloring/sufganiyah', label: 'סופגנייה לצביעה' }, { href: '/holidays/hanukkah/host-home', label: 'יצירות בית מארח' }],
    small: 'ילד בן 4–5 מערבב, מוזג ומקשט סופגניות. השמן והאש הם תחום של מבוגר בלבד, והוא מקבל תפקיד "פקח טעימות".',
    big: 'ילד בן 8–10 קורא את המתכון בקול, מודד כמויות ומחלק את הלביבות שווה בשווה בין כולם: כמה לכל אחד?',
    short: { m: 'מכינים לביבות (מבוגר מטגן)', n: 'אוכלים את התוצר', a: 'מסעדת חנוכה וצביעה' },
    mission: 'מכינים משהו לאכול ומגישים בלי להתבלבל',
    safety: 'שמן חם: רק מבוגר ליד הסיר, ילדים במרחק של מטר לפחות, ידית הסיר פונה פנימה, ולא משאירים אותו לרגע.',
  },
  {
    id: 'maccabees', day: 'שלישי', date: '8.12', theme: 'יום המכבים', emoji: '🛡️', candles: 5,
    blurb: 'יום של כוח, אומץ ואנרגיה. פותחים בתנועה, ובצהריים נרגעים עם סיפור.',
    need: 'קרטון לשריון, נייר כסף, סרט הדבקה, פנס, כריות או כיסאות למסלול מכשולים.',
    morning: { t: 'מסלול מכשולים של המכבים', d: 'בונים מסלול: זוחלים מתחת לשולחן, קופצים מעל כרית, מאזנים ספר על הראש. בסוף מגיעים ל"בית המקדש" (פינה בסלון) ומדליקים פנס חשמלי.' },
    craft: { t: 'מגן ושריון מקרטון', d: 'גוזרים מגן מקרטון, מכסים בנייר כסף וכותבים עליו סמל שהילד בחר: אריה, כוכב או האות שלו.' },
    game: { t: 'מרוץ הלפיד', d: 'מעבירים פנס כבוי בין חברי המשפחה לאורך הסלון, כמו מרוץ שליחים. הפנס לא נדלק עד שמגיעים לקו הסיום. בשום אופן לא אש אמיתית.' },
    calm: { t: 'מכבים לצביעה וסיפור', d: 'צובעים את המכבים ומספרים בקול את הסיפור: מי אתם הייתם בצבא של יהודה?' },
    links: [{ href: '/printables/coloring/maccabees', label: 'מכבים לצביעה' }, { href: '/games/movement', label: 'משחקי תנועה' }, { href: '/holidays/hanukkah/learn', label: 'חנוכה: לומדים' }],
    small: 'ילד בן 4–5 עובר מסלול קצר יותר עם מכשולים רכים, ובמקום מרוץ לפי זמן מקבל מדבקה על כל שלב שסיים.',
    big: 'ילד בן 8–10 מתכנן את המסלול לאחרים, מודד זמן בסטופר ומנסה לשבור שיא אישי מסיבוב לסיבוב.',
    short: { m: 'מסלול מכשולים של המכבים', n: 'ארוחה וסיפור המכבים', a: 'מגן מקרטון ומרוץ פנס' },
    mission: 'עוברים את מסלול המכשולים עד הסוף',
  },
  {
    id: 'science', day: 'רביעי', date: '9.12', theme: 'יום המדע', emoji: '🔬', candles: 6,
    blurb: 'ניסויים בטוחים מהמטבח: שמן ומים, צל ואור. שואלים, מנחשים ובודקים.',
    need: 'צנצנת שקופה, מים, שמן, צבע מאכל, פנס, כמה חפצים שונים, דף לרישום.',
    morning: { t: 'שמן ומים בצנצנת', d: 'ממלאים חצי צנצנת מים בצבע מאכל ומוזגים עליה שמן. הילדים מנחשים מה יקרה, מסתכלים כיצד השמן צף, ומנערים בעדינות. אחרי כמה דקות הוא נפרד שוב.' },
    craft: { t: 'מנורת בקבוק (בלי אש)', d: 'ממלאים בקבוק שקוף מים ושמן ובצבע, סוגרים חזק ומניחים מעל פנס. יוצא "פך שמן" שקורן. לקישוט בלבד.' },
    game: { t: 'ציד צללים', d: 'בחדר חשוך עם פנס: יוצרים צללים של חיות מהידיים, מנחשים מי הצל ומשנים את גודלו כשמרחיקים את הפנס.' },
    calm: { t: 'ניסוי צף או שוקע', d: 'אוספים עשרה חפצים קטנים, מנחשים אם יצופו או ישקעו, ובודקים בקערת מים. רושמים טבלה.' },
    links: [{ href: '/food/kitchen-science', label: 'ניסויים מדעיים בבית' }, { href: '/learn/science/light-and-shadow', label: 'אור וצל' }, { href: '/learn/science', label: 'מדע וטכנולוגיה' }],
    small: 'ילד בן 4–5 מנחש ומצביע ("צף או שוקע?") ומקבל ללכת עם הכפית. המבוגר מזהה מה קורה ומתאר במילים פשוטות.',
    big: 'ילד בן 8–10 כותב השערה לפני כל ניסוי, מבצע ומסכם בשורה: מה קרה ולמה לדעתו. אפשר להוסיף משתנה: מים חמים מול קרים.',
    short: { m: 'ניסוי שמן ומים בצנצנת', n: 'ארוחה ושאלות מדע', a: 'ציד צללים וצף או שוקע' },
    mission: 'מנחשים, בודקים ומסכמים ניסוי אחד',
    safety: 'מדליקים רק פנס חשמלי ולא נרות. לא טועמים את התערובות של הניסויים, ומנגבים מיד שמן שנשפך.',
  },
  {
    id: 'light', day: 'חמישי', date: '10.12', theme: 'יום האור', emoji: '🕯️', candles: 7,
    blurb: 'כל היום סובב סביב האור: מחפשים אותו בחוץ, יוצרים ממנו ומסיימים בסיור חנוכיות בערב.',
    need: 'צנצנת זכוכית נקייה, נר לד קטן, נייר צבעוני דק, דבק, פנס.',
    morning: { t: 'ציידי אור', d: 'יוצאים לחצי שעה לשכונה או לגינה ומחפשים מקורות אור: שמש, השתקפות בחלון, פנס רחוב. כל ילד מצלם או מצייר שלושה.' },
    craft: { t: 'פנס מצנצנת', d: 'מדביקים נייר צבעוני דק על צנצנת, ובתוכה מניחים נר לד. תאורת חג לחלון, בלי להדליק שום להבה.' },
    game: { t: 'אור או חושך?', d: 'מכבים את האור וממציאים חידות: "יש לי להבה ואני לא נשרף, מה אני?" הילדים מנחשים בעזרת פנס שעובר מיד ליד.' },
    calm: { t: 'שירי חנוכה בחושך', d: 'יושבים על הרצפה עם פנס קטן, שרים ומדברים על מה הכי מאיר אותם בימים האלה.' },
    links: [{ href: '/holidays/hanukkah/hanukkiah-tour', label: 'סיור חנוכיות בשכונה' }, { href: '/holidays/hanukkah/candle-times', label: 'זמני הדלקה' }, { href: '/holidays/hanukkah/songs', label: 'שירי חנוכה' }],
    small: 'ילד בן 4–5 מחפש ומצביע, ומקבל לצבוע חלקים מהצנצנת. אפשר לתת לו להחזיק את הפנס וללוות את הסיור.',
    big: 'ילד בן 8–10 מנהל את הסיור: סופר חנוכיות בטבלה, שם לב לכמה נרות דולקים בכל חלון ומחשב את הסך הכול.',
    short: { m: 'ציידי אור בחוץ', n: 'ארוחה ומנוחה', a: 'פנס מצנצנת וסיור חנוכיות' },
    mission: 'מוצאים שלושה אורות ומכינים פנס',
    safety: 'בפנסים ובקישוטים משתמשים בנרות לד בלבד. להבה אמיתית היא רק של המבוגרים ורק בחנוכייה.',
  },
  {
    id: 'surprise', day: 'שישי', date: '11.12', theme: 'יום ההפתעות', emoji: '🎁', candles: 8,
    blurb: 'היום הלפני אחרון הוא יום של סודות: חדר בריחה, כרטיסי ברכה והכנות לשבת. מדליקים נרות חנוכה לפני כניסת השבת.',
    need: 'נייר ועטים, מעטפות, חפץ קטן להפתעה לכל ילד, דפים להדפסה של חדר הבריחה.',
    morning: { t: 'חדר בריחה לחנוכה', d: 'הילדים פותרים חידות כדי לפתוח את המנעול ולמצוא את פך השמן. עובדים כצוות, וההורה רק מרמז כשצריך.' },
    craft: { t: 'כרטיס ברכה לסבא וסבתא', d: 'כל ילד מכין כרטיס עם ציור ושורת ברכה, ובוחר למי לשלוח או לתת. אפשר להשתמש בברכות המוכנות.' },
    game: { t: 'בינגו חנוכה', d: 'מכינים כרטיסי בינגו עם סמלי חג (סביבון, נר, סופגנייה, פך), ומי שסימן שורה צועק "חנוכה!".' },
    calm: { t: 'סיפור חנוכה לפני השבת', d: 'בוחרים סיפור קצר ומקריאים אותו ביחד, בישיבה על הספה וליד האור הרך.' },
    links: [{ href: '/holidays/hanukkah/escape-room', label: 'חדר בריחה לחנוכה' }, { href: '/holidays/hanukkah/greetings', label: 'ברכות לחנוכה' }, { href: '/games/bingo', label: 'מחולל בינגו' }, { href: '/stories/the-little-shamash', label: 'הַשַּׁמָּשׁ הקטן' }],
    small: 'ילד בן 4–5 מחפש את החידות המצוירות ומקבל לפתוח את המנעול כשהמבוגר אומר את הקוד. בכרטיס מציירים בלבד.',
    big: 'ילד בן 8–10 מנהל את קבוצת הפתרון, כותב לכל סבא וסבתא ברכה אישית בכתב יד ובודק שכל כרטיס נחתם.',
    short: { m: 'חדר בריחה לחנוכה', n: 'ארוחה והכנות לשבת', a: 'ברכות, בינגו והדלקה לפני שבת' },
    mission: 'פותרים חידה אחת ומכינים כרטיס ברכה',
    safety: 'ביום שישי מדליקים נרות חנוכה לפני נרות שבת ולפני כניסתה. בודקים בזמני ההדלקה של היישוב שלכם.',
  },
  {
    id: 'outdoors', day: 'שבת', date: '12.12', theme: 'יום יציאה והרפיה', emoji: '🌳', candles: 0,
    blurb: 'סוגרים את הקייטנה ביום רגוע: טיול, משחקים בלי מסך ובלי הכנה. לשומרי שבת הכול כאן בלי כתיבה, גזירה או חשמל.',
    need: 'נעליים נוחות, מים, כריך לדרך, קלפים או משחק קופסה. אין צורך בציוד אחר.',
    morning: { t: 'טיול בלי יעד', d: 'יוצאים לעשרים דקות הליכה ושואלים כל כמה צעדים "מה אתם רואים בצבע ירוק?". כל מי שמצא משהו מקבל נקודה.' },
    craft: { t: 'בניית עיר מקוביות או כריות', d: 'במקום יצירה עם נייר ומספריים, בונים מה שיש: קוביות, כריות, ספרים. כל ילד בונה "בניין של חנוכה" ומראה לשאר.' },
    game: { t: 'משחקי שבת בלי ציוד', d: 'יש כאן משחקי חשיבה, חידות ותנועה שלא דורשים חשמל, כתיבה או הכנות, ומתאימים לכל גיל.' },
    calm: { t: 'סיפור וזכרונות מסבתא', d: 'מקריאים סיפור או מבקשים מסבא או סבתא לספר איך חגגו חנוכה כשהיו ילדים.' },
    links: [{ href: '/games/shabbat', label: 'משחקים לשבת' }, { href: '/games/no-equipment', label: 'משחקים בלי ציוד' }, { href: '/winter/evening-games', label: 'משחקים לערב חורף' }],
    small: 'ילד בן 4–5 אוסף בדרך עלה, אבן ומקל כדי להכין בבית "מוזיאון טבע". ההליכה קצרה יותר ועם הפסקה באמצע.',
    big: 'ילד בן 8–10 מנווט: מוביל את הדרך ומסביר איך חוזרים הביתה, ובונה למשפחה חידון קצר על מה שהיה השבוע.',
    short: { m: 'טיול בלי יעד', n: 'סעודה משפחתית', a: 'משחקי שבת בלי ציוד ומקוביות' },
    mission: 'יוצאים לטיול ומוצאים שלושה דברים ירוקים',
    stamp: 'החותמת מקבלים גם במוצאי שבת, אם שמרתם שבת',
  },
]

const SAFETY = [
  { h: 'שמן חם', t: 'מטגנים רק כשמבוגר ליד הסיר ולא משאירים אותו אפילו לרגע. הילדים במרחק של מטר, ידית הסיר פונה פנימה, ואם נשפך שמן לא מנסים לכבות באמצעות מים.' },
  { h: 'נרות והדלקה', t: 'את נרות החנוכייה מדליקים מבוגרים בלבד, על משטח יציב, רחוק מווילונות, נייר ובדים. לא משאירים נר דולק בלי השגחה. לפעילויות עם ילדים השתמשו בנרות לד ובפנסים.' },
  { h: 'יצירה', t: 'דבק חם ומספריים חדים הם עבודה של מבוגר או של ילד גדול בהשגחה. לקטנים נותנים מספריים עגולי קצה ודבק סטיק.' },
  { h: 'אלרגיות ואוכל', t: 'לפני שמכינים אוכל שואלים על אלרגיות של כל הילדים, כולל חברים שמגיעים לבקר. מניחים את הניסויים המדעיים הרחק מהאוכל ולא טועמים אותם.' },
  { h: 'בחוץ', t: 'בטיול קובעים מראש גבולות: אף ילד לא מתרחק מהמבוגר. בערב חורפי לובשים שכבות וסוחבים פנס.' },
]

const TIPS_MIX = [
  'תנו לכל ילד תפקיד אחר באותה פעילות: הגדול מנהל והקטן מבצע, או להפך. כך כל אחד מרגיש חשוב ולא "קטן מדי" או "גדול מדי".',
  'בכל יצירה הכינו שתי רמות: הקטן מדביק וצובע, הגדול גוזר וכותב. אותו מוצר סופי, שני מסלולים.',
  'במשחקי תחרות תנו יתרון לקטן (עוד סיבוב, התחלה מוקדמת) או הפכו לתחרות משותפת נגד הזמן.',
  'כשהגדול מתייאש מהקטן, תנו לו משימת "מורה": להסביר את המשחק ולבדוק שהכללים נשמרים.',
  'אחרי הצהריים הקטן ישן או נח, והגדול מקבל שעה שקטה משלו עם פעילות מאתגרת: חידות, חוברת או ספר.',
]

const FAQ = [
  { q: 'מה עושים עם הילדים בחופשת חנוכה בלי להוציא כסף?', a: 'החבילה כאן בנויה מחומרים שיש בבית: קרטון, צנצנות, פנס, אגוזים ודפים. כל יום מציע פעילות בוקר, יצירה, משחק ופעילות שקטה, והרוב לא דורש קנייה. הדפים להדפסה והמשחקים בקישורים חינמיים.' },
  { q: 'מתי חופשת חנוכה 2026?', a: 'לפי לוח החופשות של משרד החינוך, החופשה היא מיום ראשון 6.12.2026 עד שבת 12.12.2026, וחוזרים ללימודים ביום ראשון 13.12. הקייטנה כאן מכסה את כל שבעת הימים. הפרטים בדף חופשת חנוכה.' },
  { q: 'לאיזה גילים הקייטנה מתאימה?', a: 'לילדים בני 4 עד 10. כל יום כולל הסבר על התאמה לקטנים ולגדולים, ואם יש לכם שני ילדים בגילים שונים, סמנו "שני ילדים בגילים שונים" כדי לראות טיפים להפעלה משותפת.' },
  { q: 'איך מדפיסים את הלוח היומי ואת הדרכון?', a: 'לוחצים על הכפתור "הדפסה או PDF" באזור ההדפסה, בוחרים מה להדפיס (לוח, דרכון או שניהם) וממשיכים לחלון ההדפסה של הדפדפן. הלוח הוא דף A4 אחד, והדרכון גם הוא דף אחד שאפשר לחתום בכל ערב.' },
  { q: 'האם כל הפעילויות בטוחות בשביל ילדים?', a: 'התכנון הוא בטוח, אבל ההשגחה היא של המבוגר. שמן חם, נרות ודבק חם הם רק בידי מבוגרים, ובפעילויות עם ילדים משתמשים בנרות לד ובפנסים. הכללים מרוכזים בקטע הבטיחות למטה.' },
  { q: 'מה עושים ביום שבת?', a: 'יום שבת בנוי כך שלא תצטרכו כתיבה, גזירה או חשמל: טיול, בנייה מקוביות, משחקי שבת בלי ציוד וסיפורים. מי שלא שומר שבת יכול לבחור פעילות מכל יום אחר.' },
]

// ---------- printable sheets (200 x 270) ----------
const THEMES = {
  color: { ink: '#1e3a8a', gold: '#b7791f', bg: '#f4f7ff', band: '#dbe7ff', text: '#172554' },
  ink: { ink: '#222', gold: '#555', bg: '#fff', band: '#eee', text: '#111' },
}

function ScheduleSheet({ c, family }) {
  const left = 6, right = 194, dayW = 35, colW = 51, top = 40, headH = 11, rowH = 29
  const cols = [['בוקר', right - dayW - colW, 'm'], ['צהריים', right - dayW - 2 * colW, 'n'], ['אחה״צ', right - dayW - 3 * colW, 'a']]
  return <Sheet label="לוח יומי לקייטנת חנוכה בבית">
    <T x="100" y="17" size="12" weight="800" fill={c.ink}>קייטנת חנוכה בבית</T>
    <T x="100" y="26" size="5" fill={c.text}>{family ? `הלוח של ${family}` : 'הלוח של המשפחה'} · 6–12 בדצמבר 2026</T>
    <path d="M30 31 H170" stroke={c.gold} strokeWidth="0.4" strokeDasharray="2 1.4" />
    <rect x={left} y={top} width={right - left} height={headH} fill={c.band} stroke={c.ink} strokeWidth="0.4" />
    <T x={right - dayW / 2} y={top + 7.2} size="4.6" weight="800" fill={c.ink}>יום</T>
    {cols.map(([label, x]) => <T key={label} x={x + colW / 2} y={top + 7.2} size="4.6" weight="800" fill={c.ink}>{label}</T>)}
    {DAYS.map((d, i) => {
      const y = top + headH + i * rowH
      return <g key={d.id}>
        <rect x={left} y={y} width={right - left} height={rowH} fill={i % 2 ? c.bg : '#fff'} stroke={c.ink} strokeWidth="0.3" />
        <T x={right - dayW / 2} y={y + 10} size="4.6" weight="800" fill={c.ink}>{`${d.day} ${d.date}`}</T>
        {wrapLines(d.theme, 14).map((l, k) => <T key={k} x={right - dayW / 2} y={y + 17 + k * 4.6} size="3.8" weight="700" fill={c.gold}>{l}</T>)}
        {cols.map(([, x, key]) => <g key={key}>
          <path d={`M${x} ${y} V${y + rowH}`} stroke={c.ink} strokeWidth="0.25" />
          {wrapLines(d.short[key], 22).slice(0, 3).map((l, k) => <T key={k} x={x + colW / 2} y={y + 10 + k * 5} size="3.7" fill={c.text}>{l}</T>)}
        </g>)}
      </g>
    })}
    <T x="100" y="260" size="3.6" fill={c.text}>מדליקים נרות חנוכה רק מבוגרים · פירוט מלא ב־ugabuga.co.il</T>
  </Sheet>
}

function PassportSheet({ c, kid }) {
  const boxW = 90, boxH = 47, xs = [102, 8], y0 = 49, gap = 5
  const cells = [...DAYS.map(d => ({ key: d.id, title: d.theme, sub: `${d.day} ${d.date}`, text: d.mission })), { key: 'prize', title: 'הפרס שלנו', sub: 'בסוף הקייטנה', text: 'כשיש שבע חותמות, בוחרים פרס:' }]
  return <Sheet label="דרכון קייטנת חנוכה בבית">
    <rect x="3" y="3" width="194" height="264" rx="6" fill="none" stroke={c.ink} strokeWidth="0.8" />
    <rect x="6" y="6" width="188" height="258" rx="4.5" fill="none" stroke={c.gold} strokeWidth="0.35" strokeDasharray="2 1.4" />
    <T x="100" y="20" size="12.5" weight="800" fill={c.ink}>דרכון קייטנת חנוכה</T>
    <T x="100" y="28.5" size="5" fill={c.text}>שבעה ימים, שבע חותמות</T>
    <T x="188" y="40" size="4.8" weight="700" anchor="start" fill={c.text}>{`שם הקייטנ/ית: ${kid || '________________________'}`}</T>
    {cells.map((cell, i) => {
      const x = xs[i % 2], y = y0 + Math.floor(i / 2) * (boxH + gap)
      return <g key={cell.key}>
        <rect x={x} y={y} width={boxW} height={boxH} rx="3.5" fill={c.bg} stroke={c.ink} strokeWidth="0.5" />
        <T x={x + boxW - 4} y={y + 8} size="4" anchor="start" weight="600" fill={c.gold}>{cell.sub}</T>
        <T x={x + boxW - 4} y={y + 15.5} size="5.6" anchor="start" weight="800" fill={c.ink}>{cell.title}</T>
        {wrapLines(cell.text, 20).slice(0, 3).map((l, k) => <T key={k} x={x + boxW - 4} y={y + 23.5 + k * 5} size="3.7" anchor="start" fill={c.text}>{l}</T>)}
        <circle cx={x + 17} cy={y + boxH / 2 + 1} r="14" fill="#fff" stroke={c.ink} strokeWidth="0.5" strokeDasharray="2.2 1.6" />
        <T x={x + 17} y={y + boxH / 2 + 2} size="3.4" fill={c.gold}>{cell.key === 'prize' ? '____' : 'חותמת'}</T>
      </g>
    })}
    <T x="100" y="259" size="3.6" fill={c.text}>ugabuga.co.il · קייטנת חנוכה בבית</T>
  </Sheet>
}

// ---------- page ----------
const ROW_LABELS = [['morning', '☀️', 'פעילות בוקר'], ['craft', '✂️', 'יצירה'], ['game', '🎲', 'משחק'], ['calm', '🌙', 'פעילות שקטה']]

function DayCard({ d, mixed }) {
  return <article id={`day-${d.id}`} className="scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-4 sm:p-5 sketch-shadow-sm" aria-labelledby={`h-${d.id}`}>
    <header className="mb-3">
      <p className="text-sm font-bold text-[var(--muted-foreground)]">יום {d.day} · {d.date}.2026{d.candles ? ` · בערב מדליקים ${d.candles} נרות ושמש` : ' · היום האחרון של החג'}</p>
      <h3 id={`h-${d.id}`} className="text-2xl font-bold sm:text-3xl"><span aria-hidden="true">{d.emoji} </span>{d.theme}</h3>
      <p className="mt-1 text-lg leading-relaxed">{d.blurb}</p>
    </header>
    <ul className="space-y-3">
      {ROW_LABELS.map(([key, icon, label]) => <li key={key} className="rounded-2xl bg-[var(--postit)] p-3">
        <p className="font-bold"><span aria-hidden="true">{icon} </span>{label}: {d[key].t}</p>
        <p className="leading-relaxed">{d[key].d}</p>
      </li>)}
    </ul>
    <p className="mt-3 text-base"><b>להכין מראש:</b> {d.need}</p>
    {d.stamp && <p className="mt-2 text-base"><b>חותמת:</b> {d.stamp}.</p>}
    {d.safety && <p className="mt-3 rounded-xl border-2 border-red-300 bg-red-50 p-3 text-base"><b>⚠️ בטיחות:</b> {d.safety}</p>}
    {mixed && <div className="mt-3 grid gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-blue-50 p-3 sm:grid-cols-2">
      <p><b>🧒 לקטן (4–5):</b> {d.small}</p>
      <p><b>🧑 לגדול (8–10):</b> {d.big}</p>
    </div>}
    <p className="mt-3 flex flex-wrap items-center gap-2 text-base"><b>בקישורים:</b>
      {d.links.map(l => <Link key={l.href} to={l.href} className="inline-flex min-h-[44px] items-center rounded-full border-2 border-[var(--border)] bg-white px-3 font-bold underline">{l.label}</Link>)}
    </p>
  </article>
}

export default function HanukkahHomeCamp() {
  const [mixed, setMixed] = useState(false)
  const [print, setPrint] = useState(false)
  const [what, setWhat] = useState('both')
  const [kid, setKid] = useState('')
  const [family, setFamily] = useState('')
  const [theme, setTheme] = useState('color')
  const c = THEMES[theme]
  const schedule = <ScheduleSheet c={c} family={family.trim()} />
  const passport = <PassportSheet c={c} kid={kid.trim()} />
  const previewSheet = what === 'passport' ? passport : schedule
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="קייטנת חנוכה בבית — תוכנית ליום ויום לחופשת חנוכה 2026" description="קייטנה בבית לחופשת חנוכה 6–12.12.2026 לילדים בני 4–10: שבעה ימים עם נושא, פעילות בוקר, יצירה, משחק ופעילות שקטה. לוח יומי להדפסה, דרכון עם חותמות וטיפים לשני ילדים בגילים שונים. בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חופשות', href: '/school-holidays' }, { label: 'חופשת חנוכה', href: '/school-holidays/hanukkah' }, { label: 'קייטנת חנוכה בבית' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🕎 </span>קייטנת חנוכה בבית</h1>
    <p className="mx-auto mb-3 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">תוכנית מוכנה לשבעת ימי <Link className="font-bold underline" to="/school-holidays/hanukkah">חופשת חנוכה</Link> (6–12.12.2026) לילדים בני 4–10. בכל יום נושא, פעילות בוקר, יצירה, משחק ופעילות שקטה, בלי להוציא כסף ובלי כל כך הרבה הכנה.</p>
    <p className="mx-auto mb-6 max-w-2xl text-center text-base">בסוף הדף: <a className="font-bold underline" href="#print">לוח יומי ודרכון קייטנה להדפסה</a> · <a className="font-bold underline" href="#safety">כללי בטיחות</a></p>

    <div className="mx-auto mb-6 max-w-2xl rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-4">
      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-lg font-bold">
        <input type="checkbox" checked={mixed} onChange={e => setMixed(e.target.checked)} className="h-6 w-6" />
        יש לי שני ילדים בגילים שונים (קטן וגדול)
      </label>
      <p className="mt-1 text-base">מסמנים, ובכל יום מופיעה התאמה לקטן (4–5) ולגדול (8–10), יחד עם טיפים כלליים.</p>
    </div>

    {mixed && <section className="mb-6 rounded-3xl border-2 border-dashed border-[var(--border)] bg-blue-50 p-5" aria-labelledby="mix-h">
      <h2 id="mix-h" className="mb-2 text-2xl font-bold">👫 שני ילדים בגילים שונים: איך מפעילים ביחד</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">{TIPS_MIX.map(t => <li key={t}>{t}</li>)}</ul>
    </section>}

    <nav aria-label="ימי הקייטנה" className="mb-6 flex flex-wrap justify-center gap-2">
      {DAYS.map(d => <a key={d.id} href={`#day-${d.id}`} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold"><span aria-hidden="true">{d.emoji} </span>{d.day} · {d.theme}</a>)}
    </nav>

    <div className="space-y-6">{DAYS.map(d => <DayCard key={d.id} d={d} mixed={mixed} />)}</div>

    <section id="safety" className="mt-10 scroll-mt-24 rounded-3xl border-2 border-red-300 bg-red-50 p-5" aria-labelledby="safety-h">
      <h2 id="safety-h" className="mb-3 text-2xl font-bold">⚠️ כללי בטיחות: שמן, נרות ויצירה</h2>
      <ul className="space-y-2 text-lg">{SAFETY.map(s => <li key={s.h}><b>{s.h}:</b> {s.t}</li>)}</ul>
    </section>

    <section id="print" className="mt-10 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-1 text-2xl font-bold">🖨️ לוח יומי ודרכון קייטנה להדפסה</h2>
      <p className="mb-4 text-lg">לוח A4 עם שבעת הימים (בוקר, צהריים ואחה״צ) לתלייה על המקרר, ודרכון עם תיבת חותמת לכל יום. בסוף כל יום מחתימים, והמעבר מיום ליום הופך לטקס קטן.</p>
      <div className="grid items-start gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Choice label="מה להדפיס" value={what} onChange={setWhat} options={[['both', 'לוח ודרכון'], ['schedule', 'לוח בלבד'], ['passport', 'דרכון בלבד']]} />
          <Field label="שם המשפחה בלוח (לא חובה)" value={family} onChange={setFamily} maxLength={24} placeholder="למשל: משפחת כהן" />
          <Field label="שם הילד/ה בדרכון (לא חובה)" value={kid} onChange={setKid} maxLength={22} placeholder="למשל: נועה" />
          <Choice label="עיצוב" value={theme} onChange={setTheme} options={[['color', 'צבעוני'], ['ink', 'חסכוני בדיו']]} />
          <div className="text-center"><button data-print-main type="button" onClick={() => setPrint(true)} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white">🖨️ הדפסה או PDF</button></div>
          <p className="text-center text-sm text-[var(--muted-foreground)]">מה שכותבים נשאר בדפדפן שלכם. שני ילדים? מדפיסים את הדרכון פעמיים עם שם אחר בכל פעם.</p>
        </div>
        <button type="button" onClick={() => setPrint(true)} aria-label="הדפסת הלוח והדרכון" className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm">{previewSheet}</button>
      </div>
    </section>

    {print && <PrintPreview title="קייטנת חנוכה בבית" onClose={() => setPrint(false)}>
      {what !== 'passport' && <article className="buga-a4"><div className="print-art">{schedule}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>}
      {what !== 'schedule' && <article className="buga-a4"><div className="print-art">{passport}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחופשה: <Link className="font-bold underline" to="/school-holidays/hanukkah">חופשת חנוכה 2026</Link> · <Link className="font-bold underline" to="/holidays/hanukkah">חנוכה לילדים</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/what-to-do">מה עושים בחנוכה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'חופשת חנוכה נמשכת שבוע שלם, ובשבוע הזה ההורים מחפשים רעיונות שיעבדו בלי קייטנה בתשלום, בלי הכנה ארוכה ובלי מסכים כל היום. הדף הזה מארגן את החופשה ליום ויום, עם נושא קבוע: סביבון, מטבח, מכבים, מדע, אור, הפתעות ויציאה החוצה.',
      'כל יום בנוי באותה צורה, כדי שלא תצטרכו להחליט מחדש בכל בוקר: פעילות בוקר שמוציאה אנרגיה, יצירה מחומרים שיש בבית, משחק, ופעילות שקטה לצהריים. את הלוח היומי תולים על המקרר, ובדרכון הילדים מקבלים חותמת בסוף כל יום. התאמות לקטנים ולגדולים והמלצות לשני ילדים בגילים שונים כלולות.',
      'הכול כאן מתאים להורה שעובד ולהורה שבבית, וגם לסבא וסבתא ששומרים על הילדים. אפשר לעשות את כל השבוע, ואפשר לבחור יום אחד. ובכל מקרה, שמן ואש נשארים ביד מבוגרים בלבד.',
    ]} faq={FAQ} related={[{ label: 'חופשת חנוכה 2026', href: '/school-holidays/hanukkah' }, { label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'מה עושים בחנוכה', href: '/holidays/hanukkah/what-to-do' }, { label: 'חדר בריחה לחנוכה', href: '/holidays/hanukkah/escape-room' }]} /></div>
  </div>
}

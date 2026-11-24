import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { FONT } from '../../components/holidays/printKit'

// /birthday/pajama-party: a home pajama birthday for ages 6–12 — five stations, a cheap equipment list,
// two evening schedules (a "late-over" that ends at 21:30, or a full sleepover), safety and allergy notes,
// tips for talking to other parents, and three A4 sheets (invitations, station signs, certificates).
const PATH = '/birthday/pajama-party'

const T = ({ x, y, size = 16, weight = 700, fill = '#111', children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} direction="rtl">{children}</text>

const TINTS = ['#c7d2fe', '#fde68a', '#fbcfe8', '#bbf7d0', '#bfdbfe', '#fed7aa']

const STATIONS = [
  {
    id: 'cinema', emoji: '🍿', name: 'פינת קולנוע ופופקורן',
    materials: ['מסך, טלוויזיה או סדין לבן על הקיר', 'כריות ושמיכות על הרצפה', 'פופקורן מגרעינים (או מוכן) וקערות קטנות', 'סרט קצר שמתאים לכל הגילאים'],
    steps: ['מכינים את הפופקורן לפני שהילדים מגיעים, ומחלקים קערה לכל ילד.', 'מסדרים כריות בשורות ומעמעמים את האור.', 'מקרינים סרט קצר או שני פרקים של סדרה שהחוגג/ת בחר/ה מראש.', 'בסוף מצביעים בהרמת יד: "מי נותן לסרט ארבעה כוכבים?"'],
    young: 'סרט של שעה לכל היותר, עם הפסקת שירותים באמצע. לילדים קטנים קל להירדם בפינה הזו, וזה בסדר גמור.',
    older: 'נותנים לילדים להצביע בין שני סרטים, ומכינים "כרטיסי כניסה" ביתיים שקורעים בדלת.',
    safety: 'אוכלים פופקורן בישיבה ולא בריצה. בודקים אלרגיות לפני שמוסיפים מלח, סוכר או שוקולד.',
  },
  {
    id: 'fort', emoji: '🏰', name: 'בניית מבצר כריות',
    materials: ['כריות, שמיכות וסדינים', 'כיסאות וספה כעוגנים', 'אטבי כביסה או מהדקים גדולים', 'שרשרת אורות לד על סוללות'],
    steps: ['מסבירים את האתגר: מבצר שיש בו מקום לכולם ופתח אחד.', 'מחלקים לקבוצות של שלושה או ארבעה ילדים, כל קבוצה עם כיסאות וסדינים.', 'פורסים סדין על הכיסאות ומקבעים אותו באטבים.', 'נותנים 15 דקות, ואז כל קבוצה מציגה את המבצר ומספרת מה שמו.'],
    young: 'מבוגר מייצב את הכיסאות, והילדים אחראים על הקישוט והכריות בפנים.',
    older: 'מוסיפים תנאי: במבצר צריכים להיות חדר שינה וחדר סודות, והוא צריך לעמוד בלי שמחזיקים אותו.',
    safety: 'לא בונים על שולחנות ולא מטפסים על הספה. מבוגר בודק שהכיסאות יציבים ולא יתהפכו.',
  },
  {
    id: 'flashlight', emoji: '🔦', name: 'משחקי פנסים בחושך',
    materials: ['פנס לכל ילד', 'חדר שאפשר לעמעם', 'חפצים קטנים להחבאה', 'סדין לבן או קיר חלק לצלליות'],
    steps: ['משחק א׳, "מנחשים צללית": מישהו יוצר בידיים צללית על הקיר והאחרים מנחשים איזו חיה זו.', 'משחק ב׳, "מטמון": מחביאים חפצים קטנים בחדר והילדים מחפשים אותם רק באור הפנס.', 'משחק ג׳, "קפוא": מי שהפנס מאיר עליו קופא במקום, ומי שזז יוצא מהסיבוב.', 'מסיימים ברגיעה: חמש דקות של פנסים דולקים בשקט, לפני המעבר לעמדה הרגועה.'],
    young: 'צלליות ומטמון בלבד, בלי ריצה בחושך. מבוגר עומד ליד מתג האור.',
    older: 'מוסיפים "סיפור צללים": כל קבוצה מכינה ארבע צלליות שמספרות סיפור קצר.',
    safety: 'לא מאירים לעיניים של חבר. מעמעמים את החדר ולא מחשיכים לגמרי, ומפנים את הרצפה מחפצים.',
  },
  {
    id: 'craft', emoji: '😴', name: 'יצירה: ציפית או מסכת שינה',
    materials: ['ציפית לבנה פשוטה לכל ילד (מבקשים מראש) או חתיכת בד לבן', 'טושי בד', 'קרטון להניח בתוך הציפית', 'לילדים צעירים: מסכות שינה מקרטון עם גומי'],
    steps: ['מניחים קרטון בתוך הציפית כדי שהצבע לא יעבור לצד השני.', 'מציירים בטושי בד: כוכבים, ירח, חיה אהובה או השם.', 'משאירים להתייבש לפחות שעה. את הקיבוע (גיהוץ) עושים בבית לפי הוראות היצרן.', 'מי שמעדיף מכין מסכת שינה: חותך צורה מקרטון או מבד, מקשט ומוסיף גומי.'],
    young: 'מסכת שינה מקרטון — מהירה, קלה ובלי חשש מלכלוך.',
    older: 'ציפית אישית, ובפינה כותבים ברכה לחוגג/ת. אפשר להכין גם תבנית סטנסיל פשוטה מנייר.',
    safety: 'בוחרים טושים שכתוב עליהם "לא רעיל", לובשים חולצה ישנה ומפזרים עיתון על השולחן.',
  },
  {
    id: 'story', emoji: '📖', name: 'מעגל סיפור לפני השינה',
    materials: ['שמיכה גדולה או כריות במעגל', 'אור עמום, פנס אחד באמצע או שרשרת אורות', 'ספר ילדים או סיפור קצר שמבוגר מספר', 'כוס מים או חלב פושר'],
    steps: ['יושבים במעגל על הרצפה בפיג׳מות ומורידים את הקול.', 'מבוגר מקריא או מספר סיפור קצר — כעשר דקות.', 'משחק "סיפור בשרשרת": כל ילד מוסיף משפט אחד, והפנס עובר למי שמדבר.', 'מסיימים בשלוש נשימות עמוקות, ואז מי שרוצה הולך לישון.'],
    young: 'סיפור קצר ומוכר, ואפשר גם לשיר בשקט שיר ערש שהילדים מכירים.',
    older: 'בנוסף לסיפור, כל ילד מספר "מה קרה לי פעם" — הם אוהבים לספר.',
    safety: 'בלי נרות ובלי אש פתוחה. פנס או שרשרת אורות על סוללות מספיקים.',
  },
]

const SCHEDULE = {
  lateover: {
    title: 'ערב עד 21:30 (בלי לינה)',
    note: 'מתאים כשההורים מעדיפים שהילדים יחזרו לישון בבית. הילדים מגיעים כבר בפיג׳מה, ובסוף ההורים אוספים.',
    rows: [
      ['17:30', 'מגיעים, מניחים כריות ודובים ומקבלים כרטיס עמדות.'],
      ['17:45', 'עמדה 1: בניית מבצר כריות.'],
      ['18:15', 'ארוחה קלה — פיצה, ירקות ופירות. בודקים אלרגיות.'],
      ['18:45', 'עמדה 2: משחקי פנסים.'],
      ['19:15', 'עמדה 3: יצירה — ציפית או מסכת שינה.'],
      ['19:50', 'עוגה ושירים. החוגג/ת מקבל/ת תעודת אלוף/ת הפיג׳מות.'],
      ['20:15', 'עמדה 4: פינת קולנוע ופופקורן.'],
      ['21:00', 'עמדה 5: מעגל סיפור רגוע.'],
      ['21:30', 'הורים אוספים — הילדים עייפים ומוכנים לישון בבית.'],
    ],
  },
  sleepover: {
    title: 'עם לינה',
    note: 'מתאים לילדים בני 8 ומעלה שרגילים לישון מחוץ לבית. מומלץ להתחיל בקבוצה קטנה של 3–5 ילדים.',
    rows: [
      ['18:00', 'מגיעים, מחליפים לפיג׳מה ומסדרים שקי שינה.'],
      ['18:20', 'עמדה 1: בניית מבצר כריות.'],
      ['19:00', 'ארוחת ערב קלה.'],
      ['19:40', 'עמדה 2: משחקי פנסים.'],
      ['20:15', 'עוגה, שירים ותעודות.'],
      ['20:45', 'עמדה 3: יצירה — ציפית או מסכת שינה.'],
      ['21:30', 'עמדה 4: פינת קולנוע ופופקורן.'],
      ['22:30', 'צחצוח שיניים, שירותים ועמדה 5: מעגל סיפור.'],
      ['23:00', 'מכבים אור. מבוגר נשאר ער בסביבה עד שכולם ישנים.'],
      ['בבוקר', 'ארוחת בוקר פשוטה, איסוף הציוד וחזרה הביתה.'],
    ],
  },
}

const EQUIPMENT = [
  ['כבר יש בבית', ['כריות, שמיכות וסדינים', 'כיסאות לבניית מבצר', 'פנסים (אפשר לבקש מכל ילד להביא אחד)', 'קערות לפופקורן', 'סדינים או עיתון להגנה על השולחן']],
  ['קונים בכמה שקלים', ['גרעיני פופקורן', 'אטבי כביסה', 'טושי בד', 'ציפיות לבנות פשוטות', 'שרשרת אורות לד על סוללות']],
  ['מבקשים מההורים', ['כרית, שק שינה ופיג׳מה לכל ילד', 'דובי אהוב', 'מברשת שיניים (אם יש לינה)', 'תרופות קבועות עם הוראות כתובות']],
]

const SAFETY = [
  'שואלים את ההורים מראש על אלרגיות וצרכים מיוחדים: מזון, תרופות קבועות, פחדים. מי שאלרגי מקבל חלופה ולא "רק קצת".',
  'חטיפים לא נאכלים בריצה. כדאי להימנע לגמרי מאגוזים ובוטנים, אלא אם בדקתם עם כל ההורים.',
  'במבצר, הכיסאות יציבים ולא בונים גבוה מגובה הילדים.',
  'במשחקי החושך לא מאירים לעיניים, מבוגר נמצא בחדר, והאור קרוב לשליטה.',
  'בלי נרות ובלי אש פתוחה, גם לא בשביל האווירה. בשביל זה יש פנסים ושרשרות אורות על סוללות.',
  'בלינה: מבוגר נשאר ער, יש בידיכם מספרי טלפון של כל ההורים, ומי שרוצה לחזור הביתה באמצע הלילה — מתקשרים להורים, וזה לגמרי בסדר.',
  'קובעים מראש כללים: איפה ישנים, מתי מכבים אור ומה לא עושים (למשל סרטים מפחידים).',
  'מצלמים ומעלים תמונות רק אם ההורים הסכימו.',
]

const PARENTS = [
  ['מזמינים גם בהודעה, לא רק בגיליון', 'כותבים: שעות, מה להביא, איפה ישנים ומתי אוספים. כך כל הורה יודע בדיוק מה מצפה לילד.'],
  ['שואלים על אלרגיות ותרופות', '"יש משהו שחשוב שנדע — אלרגיה, תרופה, פחד?" היא שאלה שהורים מעריכים.'],
  ['אומרים בפשטות שאפשר לחזור הביתה', '"אם הוא ירצה לחזור באמצע הלילה — נתקשר ותבואו לקחת, בלי שום בעיה." זה מרגיע גם הורים וגם ילדים.'],
  ['מציעים אפשרות late-over', 'לא כל משפחה מוכנה ללינה. ערב שנגמר ב־21:30 מאפשר לכל הילדים להשתתף.'],
  ['ילד שלא ישן מחוץ לבית', 'אפשר להציע לו לבוא לערב ולחזור לישון בבית. בלי לחץ ובלי להפוך את זה לעניין.'],
  ['מספרים מה יהיה בצפייה', 'כתבו איזה סרט מתוכנן. הורים רוצים לדעת שהוא מתאים לגיל.'],
]

const FAQ = [
  { q: 'איך עושים מסיבת פיג׳מה ליום הולדת בבית?', a: 'מחלקים את הערב לחמש עמדות: פינת קולנוע עם פופקורן, בניית מבצר כריות, משחקי פנסים, יצירה (ציפית או מסכת שינה) ומעגל סיפור רגוע. כל עמדה לוקחת 20–30 דקות, ויש גם ארוחה קלה ועוגה. בעמוד יש שני לוחות זמנים — ערב עד 21:30 או לילה מלא — וגם הזמנה, שלטים ותעודה להדפסה.' },
  { q: 'לאיזה גיל מתאימה מסיבת פיג׳מה?', a: 'לגילאי 6–12. לגילאי 6–7 מומלץ ערב בלי לינה (late-over) שנגמר בסביבות 21:30, וילדים בני 8 ומעלה שרגילים לישון מחוץ לבית יכולים להישאר ללינה. כדאי להתחיל בקבוצה קטנה של 3–5 ילדים.' },
  { q: 'מה זה late-over?', a: 'ערב פיג׳מה בלי לינה. הילדים מגיעים בפיג׳מה, עוברים את כל העמדות — כולל סרט וסיפור — וההורים אוספים בסביבות 21:30, כשהילדים עייפים ומוכנים לישון בבית. זו דרך טובה לכל משפחה שלא רוצה לינה.' },
  { q: 'כמה ילדים מזמינים למסיבת פיג׳מה?', a: 'ללינה 3 עד 5 ילדים מספיקים, במיוחד בבית קטן. לערב בלי לינה אפשר להזמין יותר, ומומלץ שיהיה מבוגר אחד לכל חמישה ילדים בערך.' },
  { q: 'מה עושים אם ילד רוצה לחזור הביתה באמצע הלילה?', a: 'מתקשרים להורים בלי לחץ ובלי לגרום לו להרגיש רע. הכינו מראש מספרי טלפון של כולם, ואמרו להורים בהזמנה שזה בסדר גמור. בהרבה מסיבות לינה יש מי שרוצה לחזור הביתה, וזה טבעי.' },
  { q: 'איך מתמודדים עם אלרגיות במסיבת פיג׳מה?', a: 'שואלים כל הורה מראש, רושמים מה מוגש ובודקים תוויות. ילד אלרגי מקבל חטיף שההורים הביאו או אישרו. כדאי להימנע מאגוזים ובוטנים לגמרי.' },
]

function Moon({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M12 -30 A32 32 0 1 0 12 30 A24 24 0 1 1 12 -30 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
  </g>
}

function Star({ x, y, r = 12, fill }) {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}` }).join(' ')
  return <polygon points={pts} fill={fill} stroke="#111" strokeWidth="2" strokeLinejoin="round" />
}

function Pillow({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 -22 Q0 -30 34 -22 Q40 0 34 22 Q0 30 -34 22 Q-40 0 -34 -22 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M-20 -8 Q0 -2 20 -8" fill="none" stroke="#111" strokeWidth="1.5" />
  </g>
}

function Popcorn({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    {[[-14, -26], [0, -32], [14, -26], [-7, -18], [8, -18]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r="9" fill="#fef9c3" stroke="#111" strokeWidth="2" />)}
    <path d="M-24 -14 H24 L18 28 H-18 Z" fill={fill} stroke="#111" strokeWidth="2.5" />
    <path d="M-8 -14 L-6 28 M8 -14 L6 28" stroke="#111" strokeWidth="1.5" />
  </g>
}

function Flashlight({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s}) rotate(-30)`} strokeLinejoin="round">
    <path d="M-14 -34 H14 L10 -14 H-10 Z" fill={fill} stroke="#111" strokeWidth="2.5" />
    <rect x="-10" y="-14" width="20" height="40" rx="4" fill="#475569" stroke="#111" strokeWidth="2.5" />
    <path d="M-16 -40 L-30 -64 M0 -42 V-70 M16 -40 L30 -64" stroke="#111" strokeWidth="2" strokeLinecap="round" />
  </g>
}

function Fort({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <path d="M-36 24 V-8 L0 -30 L36 -8 V24 Z" fill={fill} stroke="#111" strokeWidth="2.5" />
    <path d="M-10 24 V6 Q0 -4 10 6 V24" fill="white" stroke="#111" strokeWidth="2" />
    <path d="M0 -30 V-46 L14 -40 L0 -34" fill="#f472b6" stroke="#111" strokeWidth="2" />
  </g>
}

function Book({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <path d="M-36 -22 Q-18 -30 0 -20 Q18 -30 36 -22 V22 Q18 14 0 24 Q-18 14 -36 22 Z" fill={fill} stroke="#111" strokeWidth="2.5" />
    <path d="M0 -20 V24" stroke="#111" strokeWidth="2" />
  </g>
}

function Mask({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-36 -10 Q0 -22 36 -10 Q36 14 20 14 Q10 14 0 6 Q-10 14 -20 14 Q-36 14 -36 -10 Z" fill={fill} stroke="#111" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M-24 0 Q-16 -4 -8 0 M8 0 Q16 -4 24 0" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" />
  </g>
}

const ICONS = {
  cinema: (x, y, c) => <Popcorn x={x} y={y + 8} fill={c ? '#fda4af' : 'white'} />,
  fort: (x, y, c) => <Fort x={x} y={y + 10} fill={c ? '#a5b4fc' : 'white'} />,
  flashlight: (x, y, c) => <Flashlight x={x} y={y + 22} fill={c ? '#fde047' : 'white'} />,
  craft: (x, y, c) => <><Pillow x={x - 26} y={y + 8} s={0.8} fill={c ? '#bbf7d0' : 'white'} /><Mask x={x + 38} y={y + 8} s={0.75} fill={c ? '#c4b5fd' : 'white'} /></>,
  story: (x, y, c) => <Book x={x} y={y + 8} fill={c ? '#bfdbfe' : 'white'} />,
}

// Two invitations per sheet, with blank lines the family fills in by hand.
function InvitesPage({ color }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label="הזמנה למסיבת פיג׳מה ליום הולדת" style={{ width: '100%', height: '100%', background: 'white' }}>
    {[0, 1].map(i => {
      const y = 20 + i * 400
      return <g key={i}>
        <rect x="20" y={y} width="560" height="380" rx="24" fill={color ? '#eef2ff' : 'white'} stroke="#111" strokeWidth="2" strokeDasharray="8 6" />
        <Moon x={100} y={y + 66} s={1} fill={color ? '#fde047' : 'white'} />
        <Star x={500} y={y + 48} r={16} fill={color ? '#fde047' : 'white'} />
        <Star x={460} y={y + 90} r={10} fill={color ? '#f9a8d4' : 'white'} />
        <Pillow x={300} y={y + 52} s={0.8} fill={color ? '#c7d2fe' : 'white'} />
        <T x={300} y={y + 128} size={38} weight={900} fill={color ? '#4338ca' : '#111'}>מוזמנים למסיבת פיג׳מה!</T>
        <T x={300} y={y + 166} size={20}>חוגגים יום הולדת ל: _______________</T>
        <T x={300} y={y + 204} size={18} weight={400}>ביום: __________  בשעה: __________</T>
        <T x={300} y={y + 238} size={18} weight={400}>איפה (כתובת): __________________</T>
        <T x={300} y={y + 272} size={18} weight={400}>איסוף ב: __________</T>
        <T x={300} y={y + 306} size={15} weight={700}>מביאים: פיג׳מה, כרית, דובי ופנס · יש אלרגיה? ספרו לנו מראש</T>
        <T x={300} y={y + 340} size={14} weight={400}>אישור הגעה בטלפון: _______________</T>
      </g>
    })}
  </svg>
}

// A welcome sign plus one sign for each station, six per sheet.
function SignsPage({ color }) {
  const cells = [{ id: 'welcome', name: 'ברוכים הבאים למסיבת הפיג׳מה', sub: 'מורידים נעליים ונרגעים' }, ...STATIONS.map((s, i) => ({ id: s.id, name: s.name, sub: `עמדה ${i + 1}` }))]
  return <svg viewBox="0 0 600 820" role="img" aria-label="שלטים לעמדות מסיבת הפיג׳מה" style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={36} size={22} weight={800}>שלטים לעמדות — גוזרים ומדביקים ליד כל עמדה</T>
    {cells.map((c, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 305 - col * 285, y = 56 + row * 252
      return <g key={c.id}>
        <rect x={x} y={y} width="275" height="240" rx="18" fill={color ? TINTS[i % TINTS.length] : 'white'} stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <rect x={x + 12} y={y + 12} width="251" height="216" rx="12" fill="white" stroke="#111" strokeWidth="2" />
        {ICONS[c.id] ? ICONS[c.id](x + 137, y + 78, color) : <><Moon x={x + 110} y={y + 76} s={1} fill={color ? '#fde047' : 'white'} /><Star x={x + 190} y={y + 56} r={14} fill={color ? '#f9a8d4' : 'white'} /><Star x={x + 210} y={y + 98} r={9} fill={color ? '#fde047' : 'white'} /></>}
        <T x={x + 137} y={y + 160} size={c.name.length > 22 ? 17 : c.name.length > 14 ? 21 : 26} weight={900}>{c.name}</T>
        <T x={x + 137} y={y + 196} size={15} weight={400}>{c.sub}</T>
      </g>
    })}
  </svg>
}

// Two certificates per sheet.
function CertsPage({ color }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label="תעודת אלוף/ת הפיג׳מות להדפסה" style={{ width: '100%', height: '100%', background: 'white' }}>
    {[0, 1].map(i => {
      const y = 20 + i * 400
      return <g key={i}>
        <rect x="20" y={y} width="560" height="380" rx="20" fill={color ? '#fefce8' : 'white'} stroke="#111" strokeWidth="2" strokeDasharray="8 6" />
        <rect x="36" y={y + 16} width="528" height="348" rx="14" fill="none" stroke={color ? '#4338ca' : '#111'} strokeWidth="4" />
        <Star x={72} y={y + 58} r={16} fill={color ? '#fde047' : 'white'} />
        <Star x={528} y={y + 58} r={16} fill={color ? '#fde047' : 'white'} />
        <T x={300} y={y + 78} size={34} weight={900} fill={color ? '#3730a3' : '#111'}>תעודת אלוף/ת הפיג׳מות</T>
        <T x={300} y={y + 128} size={18} weight={400}>התעודה מוענקת ל:</T>
        <path d={`M150 ${y + 168} H450`} stroke="#111" strokeWidth="2" />
        <T x={300} y={y + 206} size={17} weight={400}>שבנה/תה מבצר, האיר/ה בפנס, צפה/תה בסרט ושמע/ה סיפור</T>
        <T x={300} y={y + 232} size={17} weight={400}>ובעיקר — עזר/ה לכולם ליהנות ולישון טוב.</T>
        <Moon x={140} y={y + 296} s={0.75} fill={color ? '#fde047' : 'white'} />
        <Pillow x={460} y={y + 296} s={0.75} fill={color ? '#c7d2fe' : 'white'} />
        <T x={300} y={y + 300} size={15} weight={400}>תאריך: __________</T>
        <T x={300} y={y + 336} size={15} weight={400}>חתימת בעל/ת השמחה: __________</T>
      </g>
    })}
  </svg>
}

const PAGES = [
  { id: 'invites', name: 'דף 1: 2 הזמנות למילוי', C: InvitesPage },
  { id: 'signs', name: 'דף 2: 6 שלטים לעמדות', C: SignsPage },
  { id: 'certs', name: 'דף 3: 2 תעודות אלוף/ת הפיג׳מות', C: CertsPage },
]

const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-indigo-200' : 'border-[var(--border)] bg-white'}`

export default function PajamaParty() {
  const [color, setColor] = useState(true), [print, setPrint] = useState(null)
  const [open, setOpen] = useState('cinema'), [age, setAge] = useState('young'), [mode, setMode] = useState('lateover')
  const sch = SCHEDULE[mode]

  return <div className="mx-auto max-w-5xl px-4 py-8">
    <SEO title="מסיבת פיג׳מה ליום הולדת בבית — עמדות, לו״ז, ציוד והזמנה להדפסה" description="איך עושים מסיבת פיג׳מה ליום הולדת בבית לגילאי 6–12: חמש עמדות (פינת קולנוע, מבצר כריות, משחקי פנסים, יצירת ציפית וסיפור לפני השינה), לוח זמנים עם לינה או ערב עד 21:30, ציוד זול, בטיחות ואלרגיות, והזמנה, שלטים ותעודה להדפסה בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'יום הולדת', href: '/birthday' }, { label: 'מסיבת פיג׳מה' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🌙 מסיבת פיג׳מה ליום הולדת בבית</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">חמש עמדות לערב נעים בפיג׳מות — עם לינה או בלי — ציוד שיש בבית, לוח זמנים, טיפים לשיחה עם ההורים, והזמנה, שלטים ותעודות להדפסה. לגילאי ⁦6–12⁩.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2 text-lg" aria-label="בעמוד הזה">
      {[['#stations', '🏰 העמדות'], ['#equipment', '🎒 ציוד'], ['#schedule', '⏱️ לוח זמנים'], ['#safety', '🦺 בטיחות'], ['#parents', '📞 שיחה עם הורים'], ['#print', '🖨️ להדפסה']].map(([h, l]) => <a key={h} href={h} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">{l}</a>)}
    </nav>

    <section id="stations" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby="st-h">
      <h2 id="st-h" className="mb-3 text-2xl font-bold">🏰 חמש עמדות הפיג׳מה</h2>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="גיל החוגגים">
        <button type="button" aria-pressed={age === 'young'} onClick={() => setAge('young')} className={chip(age === 'young')}>🎈 גילאי ⁦6–8⁩</button>
        <button type="button" aria-pressed={age === 'older'} onClick={() => setAge('older')} className={chip(age === 'older')}>✨ גילאי ⁦9–12⁩</button>
      </div>
      <div className="space-y-3">
        {STATIONS.map((s, i) => {
          const isOpen = open === s.id
          return <div key={s.id} className="rounded-2xl border-2 border-[var(--border)]">
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)} className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-right text-xl font-bold">
              <span>{s.emoji} עמדה {i + 1}: {s.name}</span><span aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="grid gap-4 border-t-2 border-dashed border-[var(--border)] p-4 sm:grid-cols-[1fr_2fr]">
              <div>
                <h3 className="mb-1 font-bold">מה צריך</h3>
                <ul className="list-disc space-y-1 pr-5">{s.materials.map(m => <li key={m}>{m}</li>)}</ul>
              </div>
              <div>
                <h3 className="mb-1 font-bold">איך עושים</h3>
                <ol className="list-decimal space-y-1 pr-5">{s.steps.map(t => <li key={t}>{t}</li>)}</ol>
                <p className="mt-3 rounded-xl bg-[var(--postit)] p-3">💡 {age === 'young' ? s.young : s.older}</p>
                <p className="mt-2 rounded-xl bg-rose-50 p-3">🦺 {s.safety}</p>
              </div>
            </div>}
          </div>
        })}
      </div>
    </section>

    <section id="equipment" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="eq-h">
      <h2 id="eq-h" className="mb-3 text-2xl font-bold">🎒 ציוד זול — כמעט הכול כבר בבית</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {EQUIPMENT.map(([t, items]) => <div key={t} className="rounded-2xl bg-indigo-50 p-4">
          <h3 className="mb-2 font-bold">{t}</h3>
          <ul className="list-disc space-y-1 pr-5">{items.map(x => <li key={x}>{x}</li>)}</ul>
        </div>)}
      </div>
      <p className="mt-3 text-[var(--muted-foreground)]">אין צורך ברכישות מיוחדות. אפשר גם לבקש מכל ילד להביא פנס וכרית מהבית.</p>
    </section>

    <section id="schedule" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-indigo-50 p-5" aria-labelledby="sc-h">
      <h2 id="sc-h" className="mb-3 text-2xl font-bold">⏱️ לוח זמנים לערב</h2>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="סוג הערב">
        <button type="button" aria-pressed={mode === 'lateover'} onClick={() => setMode('lateover')} className={chip(mode === 'lateover')}>🌆 ערב עד 21:30</button>
        <button type="button" aria-pressed={mode === 'sleepover'} onClick={() => setMode('sleepover')} className={chip(mode === 'sleepover')}>🛏️ עם לינה</button>
      </div>
      <h3 className="mb-1 text-xl font-bold">{sch.title}</h3>
      <p className="mb-3">{sch.note}</p>
      <ol className="space-y-2">
        {sch.rows.map(([t, txt]) => <li key={t + txt} className="flex gap-3 rounded-xl bg-white p-3">
          <span className="w-16 shrink-0 font-bold">{t}</span>
          <span>{txt}</span>
        </li>)}
      </ol>
      <p className="mt-3 text-[var(--muted-foreground)]">אפשר להזיז שעות לפי הילדים — העיקר שהעמדות הרגועות (סרט וסיפור) יהיו בסוף הערב.</p>
    </section>

    <section id="safety" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="sa-h">
      <h2 id="sa-h" className="mb-3 text-2xl font-bold">🦺 בטיחות ואלרגיות</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">{SAFETY.map(s => <li key={s}>{s}</li>)}</ul>
    </section>

    <section id="parents" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5" aria-labelledby="pa-h">
      <h2 id="pa-h" className="mb-3 text-2xl font-bold">📞 איך מדברים עם ההורים של האורחים</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {PARENTS.map(([t, d]) => <div key={t} className="rounded-2xl bg-white p-4"><h3 className="mb-1 font-bold">{t}</h3><p>{d}</p></div>)}
      </div>
    </section>

    <section id="print" className="mb-8" aria-labelledby="pr-h">
      <h2 id="pr-h" className="mb-2 text-center text-2xl font-bold">🖨️ הזמנה, שלטים ותעודות להדפסה</h2>
      <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="גרסה">
        <button type="button" aria-pressed={color} onClick={() => setColor(true)} className={chip(color)}>🎨 צבעונית</button>
        <button type="button" aria-pressed={!color} onClick={() => setColor(false)} className={chip(!color)}>🖍️ לצביעה</button>
        <button data-print-main type="button" onClick={() => setPrint({ color, pages: PAGES })} className="min-h-[44px] rounded-full bg-indigo-600 px-5 font-bold text-white">🖨️ הדפסת שלושת הדפים</button>
      </div>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {PAGES.map(p => <button key={p.id} type="button" onClick={() => setPrint({ color, pages: [p] })} aria-label={`הדפסה: ${p.name}`}
          className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
          <div className="aspect-[600/820]"><p.C color={color} /></div>
          <p className="mt-1 font-bold">{p.name}</p>
        </button>)}
      </div>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
      <h2 className="mb-3 text-2xl font-bold">💡 טיפים שעושים את הערב</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li>כולם בפיג׳מה, כולל המבוגרים — זה משנה את האווירה מהרגע הראשון.</li>
        <li>שרשרת אורות על סוללות ושמיכות על הרצפה יוצרות ערב קסום בלי הרבה כסף.</li>
        <li>משאירים את העמדות הרגועות לסוף. אחרי פנסים ובניית מבצר ילדים צריכים זמן להירגע.</li>
        <li>מכינים "פינת שקט" לילד שמתעייף או מתגעגע להורים — כרית, שמיכה ובובה.</li>
        <li>אם יש לינה, מתכננים ארוחת בוקר פשוטה: לחם, גבינה, ירקות ופירות.</li>
      </ul>
    </section>

    <p className="mt-8 text-center text-lg">עוד ליום ההולדת: <Link className="font-bold underline" to="/birthday">יום הולדת לילדים</Link> · <Link className="font-bold underline" to="/birthday/spa-party">מסיבת ספא</Link> · <Link className="font-bold underline" to="/birthday/party-bags">שקיות הפתעה</Link> · <Link className="font-bold underline" to="/games/birthday">משחקים ליום הולדת</Link> · <Link className="font-bold underline" to="/rsvp">אישור הגעה אונליין</Link></p>

    {print && <PrintPreview title="מסיבת פיג׳מה — דפים להדפסה" onClose={() => setPrint(null)}>
      {print.pages.map(p => <article className="buga-a4" key={p.id}><div className="print-art"><p.C color={print.color} /></div></article>)}
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'מסיבת פיג׳מה היא אחד הרעיונות הנוחים ליום הולדת בבית לגילאי ⁦6–12⁩: אין צורך במפעילה, בציוד יקר או באולם. כולם מגיעים בפיג׳מה, והבית הופך לקולנוע, למבצר ולפינת סיפורים.',
      'בעמוד הזה יש חמש עמדות עם ציוד, שלבי עבודה וטיפ לפי גיל: פינת קולנוע עם פופקורן, בניית מבצר כריות, משחקי פנסים, יצירת ציפית או מסכת שינה ומעגל סיפור רגוע. יש שני לוחות זמנים — ערב עד 21:30 בלי לינה, או לילה מלא — רשימת ציוד זול, כללי בטיחות ואלרגיות וטיפים לשיחה עם ההורים של האורחים.',
      'להדפסה: הזמנה עם שדות לשם, תאריך, שעה וכתובת, שלטים לכל עמדה ותעודת "אלוף/ת הפיג׳מות", בצבע או לצביעה.',
    ]} faq={FAQ} related={[{ label: 'יום הולדת לילדים', href: '/birthday' }, { label: 'מסיבת ספא', href: '/birthday/spa-party' }, { label: 'שקיות הפתעה', href: '/birthday/party-bags' }]} /></div>
  </div>
}

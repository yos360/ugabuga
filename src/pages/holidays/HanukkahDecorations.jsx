import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import MiniHanukkiah from '../../components/hanukkah/MiniHanukkiah'
import { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// /holidays/hanukkah/decorations: printable Hanukkah decorations for a kindergarten, a classroom or
// a home. Five kinds (bunting flags, a garland of dreidels, window pieces, a banner across several
// A4 pages, a "Hanukkah corner" sign), each drawn as SVG A4 sheets in two versions: colour, or an
// outline version that children colour themselves. Nothing typed leaves the browser.
const PATH = '/holidays/hanukkah/decorations'

const BLUE = '#1d4ed8', DEEP = '#1e3a8a', LIGHT = '#bfdbfe', GOLD = '#f6c453', SAND = '#f2b05e'

// Paint kit: in colour mode the real colours, in outline mode white fills and dark lines.
function kit(m) {
  const c = m === 'color'
  return { c, f: col => (c ? col : '#fff'), s: c ? DEEP : '#222', w: c ? 1 : 1.5 }
}

function starPts(R, r = R / Math.sqrt(3)) {
  return Array.from({ length: 12 }, (_, i) => {
    const a = (-90 + i * 30) * Math.PI / 180, d = i % 2 ? r : R
    return `${(d * Math.cos(a)).toFixed(1)},${(d * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

// ---- small pictures, all centred on (0, 0) and about 50 units wide ----

function Star({ m, R = 26, tone = BLUE, inner = true }) {
  const k = kit(m)
  return <g>
    <polygon points={starPts(R)} fill={k.f(tone)} stroke={k.s} strokeWidth={k.w} strokeLinejoin="round" />
    {inner && <polygon points={starPts(R * 0.52)} fill={k.f('#fff')} stroke={k.s} strokeWidth={k.w * 0.7} strokeLinejoin="round" />}
  </g>
}

function Sevivon({ m, letter, tone = '#60a5fa', letterSize = 26 }) {
  const k = kit(m)
  return <g>
    <rect x="-4" y="-42" width="8" height="15" rx="1.5" fill={k.f(GOLD)} stroke={k.s} strokeWidth={k.w} />
    <path d="M-22 -28 H22 V0 L0 38 L-22 0 Z" fill={k.f(tone)} stroke={k.s} strokeWidth={k.w} strokeLinejoin="round" />
    <path d="M-22 0 H22" stroke={k.s} strokeWidth={k.w * 0.8} />
    {letter && <T x="0" y={-5} size={letterSize} weight="900" fill={k.c ? DEEP : '#fff'} stroke={k.c ? 'none' : '#222'} strokeWidth="0.9">{letter}</T>}
  </g>
}

function Sufganiyah({ m }) {
  const k = kit(m)
  return <g>
    <ellipse cx="0" cy="5" rx="25" ry="16" fill={k.f(SAND)} stroke={k.s} strokeWidth={k.w} />
    <path d="M-19 0 Q-13 -13 0 -12 Q13 -13 19 0 Q10 6 0 4 Q-10 6 -19 0 Z" fill={k.f('#fff7ed')} stroke={k.s} strokeWidth={k.w * 0.8} strokeLinejoin="round" />
    <circle cx="0" cy="-4" r="4.5" fill={k.f('#e11d48')} stroke={k.s} strokeWidth={k.w * 0.8} />
    {[[-12, 11], [-4, 15], [6, 14], [14, 10]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.3" fill={k.c ? '#fff' : '#222'} />)}
  </g>
}

function Jar({ m }) {
  const k = kit(m)
  return <g>
    <path d="M-20 -3 Q-34 -4 -31 10 Q-29 17 -21 15 M20 -3 Q34 -4 31 10 Q29 17 21 15" fill="none" stroke={k.s} strokeWidth={k.w * 1.4} strokeLinecap="round" />
    <path d="M-8 -22 H8 V-15 Q22 -10 22 6 Q22 24 0 26 Q-22 24 -22 6 Q-22 -10 -8 -15 Z" fill={k.f('#d6a74a')} stroke={k.s} strokeWidth={k.w} strokeLinejoin="round" />
    <rect x="-11" y="-27" width="22" height="6" rx="2" fill={k.f(GOLD)} stroke={k.s} strokeWidth={k.w} />
    <path d="M-12 8 Q0 15 12 8" fill="none" stroke={k.s} strokeWidth={k.w * 0.8} strokeLinecap="round" />
  </g>
}

function Hanukkiah({ m, scale = 0.26 }) {
  return <g transform={`scale(${scale})`}><MiniHanukkiah x={-80} y={-10} w={160} lit={8} color={m === 'color'} /></g>
}

const PICS = [
  { id: 'sevivon', draw: m => <Sevivon m={m} letter="נ" /> },
  { id: 'hanukkiah', draw: m => <g transform="translate(0 7)"><Hanukkiah m={m} scale={0.3} /></g> },
  { id: 'sufganiyah', draw: m => <Sufganiyah m={m} /> },
  { id: 'jar', draw: m => <Jar m={m} /> },
]

// ---- 1. Bunting: 12 flags on 3 sheets, the letters of the greeting across them ----

const GREETINGS = {
  ora: { label: 'חג אורים שמח', slots: ['ח', 'ג', null, 'א', 'ו', 'ר', 'י', 'ם', null, 'ש', 'מ', 'ח'] },
  hanukkah: { label: 'חנוכה שמח', slots: ['ח', 'נ', 'ו', 'כ', 'ה', null, 'ש', 'מ', 'ח', null, null, null] },
}
const FLAG_BG = [LIGHT, '#fef3c7', '#e0e7ff']

function Flag({ m, x, y, n, letter, pic, bg }) {
  const k = kit(m)
  return <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 H88 V72 L44 122 L0 72 Z" fill={k.f(bg)} stroke={k.s} strokeWidth="0.9" strokeLinejoin="round" />
    <path d="M0 10 H88" stroke="#666" strokeWidth="0.4" strokeDasharray="2 1.5" />
    <T x="44" y="7" size="4.6" fill="#555">{`דגלון ${n} · מקפלים כאן`}</T>
    <g transform="translate(44 40) scale(0.86)">{letter ? pic.draw(m) : <Star m={m} R={25} tone="#3b82f6" />}</g>
    {letter
      ? <T x="44" y="108" size="33" weight="900" fill={k.c ? DEEP : '#fff'} stroke={k.c ? 'none' : '#222'} strokeWidth="1.1" strokeLinejoin="round">{letter}</T>
      : <g transform="translate(44 94) scale(0.5)"><Star m={m} R={25} tone={GOLD} inner={false} /></g>}
  </g>
}

function buntingPages(m, gid) {
  const list = GREETINGS[gid].slots, total = list.length
  const spots = [[102, 10], [10, 10], [102, 142], [10, 142]]
  return Array.from({ length: total / 4 }, (_, p) => ({
    key: `bunting-${p}`,
    svg: <Sheet label={`דגלונים לחנוכה, דף ${p + 1} מתוך ${total / 4}`}>
      {spots.map(([x, y], j) => {
        const i = p * 4 + j
        return <Flag key={i} m={m} x={x} y={y} n={i + 1} letter={list[i]} pic={PICS[i % PICS.length]} bg={FLAG_BG[i % FLAG_BG.length]} />
      })}
    </Sheet>,
  }))
}

// ---- 2. Garland of dreidels: 12 to cut, 6 per sheet ----

const DREIDEL_LETTERS = ['נ', 'ג', 'ה', 'פ']
const DREIDEL_TONES = ['#60a5fa', '#fbbf24', '#a5b4fc']

function garlandPages(m) {
  const spots = [[148, 52], [52, 52], [148, 140], [52, 140], [148, 228], [52, 228]]
  return [0, 1].map(p => ({
    key: `garland-${p}`,
    svg: <Sheet label={`שרשרת סביבונים לגזירה, דף ${p + 1} מתוך 2`}>
      {spots.map(([x, y], j) => {
        const i = p * 6 + j, k = kit(m)
        return <g key={i} transform={`translate(${x} ${y}) scale(1.05)`}>
          <Sevivon m={m} letter={DREIDEL_LETTERS[i % 4]} tone={DREIDEL_TONES[i % 3]} />
          <circle cx="0" cy="-35" r="1.6" fill="#fff" stroke={k.s} strokeWidth="0.6" />
          <circle cx="0" cy="31" r="1.6" fill="#fff" stroke={k.s} strokeWidth="0.6" />
        </g>
      })}
      <T x="100" y="8" size="4.6" fill="#666">גוזרים לאורך הקו, מנקבים את שתי הנקודות הלבנות ומשחילים על חוט</T>
    </Sheet>,
  }))
}

// ---- 3. Window pieces: a big star with a window, a big hanukkiah, and six small ones ----

function windowPages(m) {
  const k = kit(m)
  return [
    {
      key: 'window-0',
      svg: <Sheet label="כוכב גדול לחלון">
        <g transform="translate(100 118)">
          <polygon points={starPts(104)} fill={k.f(BLUE)} stroke={k.s} strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points={starPts(54)} fill="#fff" stroke={k.s} strokeWidth="1" strokeDasharray="3 2" strokeLinejoin="round" />
        </g>
        <T x="100" y="118" size="6" fill="#555">חלון לנייר משי</T>
        <T x="100" y="247" size="5.5" fill="#555">גוזרים את הכוכב. את הכוכב הפנימי מוציאים (בעזרת מבוגר)</T>
        <T x="100" y="256" size="5.5" fill="#555">ומדביקים מאחור נייר משי צבעוני.</T>
      </Sheet>,
    },
    {
      key: 'window-1',
      svg: <Sheet label="חנוכייה גדולה לחלון">
        <g transform="translate(8 150) scale(1.15)"><MiniHanukkiah x={0} y={0} w={160} lit={8} color={k.c} /></g>
        <g transform="translate(100 40)"><Star m={m} R={26} tone={GOLD} /></g>
        <T x="100" y="250" size="5.5" fill="#555">חנוכייה לחלון. מקשטים בנייר צבעוני, גוזרים ותולים בחוט דיג.</T>
      </Sheet>,
    },
    {
      key: 'window-2',
      svg: <Sheet label="שישה קישוטים קטנים לחלון">
        {[[52, 50, 'star'], [148, 50, 'sevivon'], [52, 140, 'sufganiyah'], [148, 140, 'star2'], [52, 228, 'jar'], [148, 228, 'sevivon2']].map(([x, y, id]) => <g key={id} transform={`translate(${x} ${y}) scale(1.35)`}>
          {id === 'star' && <Star m={m} R={28} tone="#3b82f6" />}
          {id === 'star2' && <Star m={m} R={28} tone={GOLD} />}
          {id === 'sevivon' && <Sevivon m={m} letter="ג" />}
          {id === 'sevivon2' && <Sevivon m={m} letter="ה" tone="#fbbf24" />}
          {id === 'sufganiyah' && <Sufganiyah m={m} />}
          {id === 'jar' && <Jar m={m} />}
        </g>)}
        <T x="100" y="8" size="4.6" fill="#666">שישה קישוטים קטנים: גוזרים ותולים בחלון או על דלת הכיתה</T>
      </Sheet>,
    },
  ]
}

// ---- 4. Banner: two slots per sheet, taped side by side, right to left ----

const BANNERS = {
  ora: { label: 'חג אורים שמח', slots: ['ח', 'ג', null, 'א', 'ו', 'ר', 'י', 'ם', null, 'ש', 'מ', 'ח'] },
  hanukkah: { label: 'חנוכה שמח', slots: ['ח', 'נ', 'ו', 'כ', 'ה', null, 'ש', 'מ', 'ח', null] },
}

function bannerPages(m, gid) {
  const { slots } = BANNERS[gid], k = kit(m), count = slots.length / 2
  return Array.from({ length: count }, (_, p) => ({
    key: `banner-${p}`,
    svg: <Sheet label={`כרזה, דף ${p + 1} מתוך ${count}`}>
      <rect x="3" y="48" width="194" height="170" fill={k.c ? '#eff6ff' : '#fff'} stroke={k.s} strokeWidth="0.9" strokeDasharray="4 2" />
      {[150, 50].map((cx, j) => {
        const letter = slots[p * 2 + j]
        return letter
          ? <T key={cx} x={cx} y="177" size="150" weight="900" fill={k.c ? BLUE : '#fff'} stroke={k.c ? DEEP : '#222'} strokeWidth={k.c ? 1.5 : 2.4} strokeLinejoin="round">{letter}</T>
          : <g key={cx} transform={`translate(${cx} 133)`}><Star m={m} R={40} tone={GOLD} /></g>
      })}
      {k.c && [[20, 62], [180, 205], [100, 62], [100, 207]].map(([x, y]) => <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}><Star m={m} R={6} tone={GOLD} inner={false} /></g>)}
      <T x="100" y="30" size="5.5" fill="#555">{`דף ${p + 1} מתוך ${count} · מצמידים זה לצד זה, מימין לשמאל`}</T>
      <T x="100" y="245" size="5" fill="#666">גוזרים סביב המסגרת המקווקוות ומדביקים מאחור בנייר דבק</T>
    </Sheet>,
  }))
}

// ---- 5. "Hanukkah corner" sign ----

const SUBS = {
  create: 'כאן יוצרים, קוראים ומשחקים',
  light: 'נרות, סביבונים וסופגניות',
  story: 'פינת הסיפורים והאור',
}

function signPages(m, subId, place) {
  const k = kit(m)
  return [{
    key: 'sign',
    svg: <Sheet label="שלט פינת חנוכה">
      <rect x="6" y="6" width="188" height="258" rx="10" fill={k.c ? '#f4f7ff' : '#fff'} stroke={k.s} strokeWidth="1.6" />
      <rect x="12" y="12" width="176" height="246" rx="7" fill="none" stroke={k.c ? '#b7791f' : '#555'} strokeWidth="0.8" strokeDasharray="3 2" />
      {[32, 66, 100, 134, 168].map((x, i) => <g key={x} transform={`translate(${x} 30)`}><Star m={m} R={10} tone={i % 2 ? GOLD : '#3b82f6'} inner={false} /></g>)}
      <T x="100" y="88" size="33" weight="900" fill={k.c ? DEEP : '#fff'} stroke={k.c ? 'none' : '#222'} strokeWidth="1.1" strokeLinejoin="round">פינת חנוכה</T>
      <T x="100" y="106" size="9" weight="500" fill="#334155">{SUBS[subId]}</T>
      <g transform="translate(20 185)"><MiniHanukkiah x={0} y={0} w={160} lit={8} color={k.c} /></g>
      <g transform="translate(28 234) scale(0.55)"><Sevivon m={m} letter="נ" /></g>
      <g transform="translate(58 238) scale(0.6)"><Sufganiyah m={m} /></g>
      <g transform="translate(142 237) scale(0.58)"><Jar m={m} /></g>
      <g transform="translate(172 234) scale(0.55)"><Sevivon m={m} letter="ג" tone="#fbbf24" /></g>
      <T x="100" y="122" size="7" fill="#334155">{place ? place : '____________________'}</T>
    </Sheet>,
  }]
}

// ---- Page content ----

const KINDS = [
  {
    id: 'bunting', emoji: '🚩', title: 'דגלונים לחנוכה (גרלנד)',
    lead: 'שרשרת של 12 דגלונים בשלושה דפי A4: כל דגלון נושא ציור חג — סביבון, חנוכייה, סופגנייה או פך שמן — ואות אחת מהברכה, כך שהאותיות יחד כותבות את הברכה לאורך הקיר.',
    need: 'נייר A4 (אפשר עבה יותר), מספריים, חוט או סרט באורך שלושה מטרים בערך, נייר דבק או דבק סטיק.',
    steps: ['מדפיסים את שלושת הדפים. בגרסת הצביעה, הילדים צובעים את הציורים ואת האותיות לפני הגזירה.', 'גוזרים כל דגלון לאורך הקו החיצוני, כולל הלשונית העליונה.', 'מקפלים את הלשונית אחורה על הקו המקווקו, מניחים את החוט בקפל ומדביקים.', 'מסדרים לפי המספרים. הברכה נקראת מימין לשמאל, ולכן דגלון 1 נתלה בצד הימני.'],
  },
  {
    id: 'garland', emoji: '🪀', title: 'שרשרת סביבונים לגזירה',
    lead: 'שנים־עשר סביבונים בשני דפי A4, עם האותיות נ, ג, ה, פ. גוזרים, מנקבים שתי נקודות ומשחילים על חוט — שרשרת שמתאימה לחלון, לקשת של דלת או לשולחן החגיגה.',
    need: 'נייר A4, מספריים, מנקב או סיכה (בעזרת מבוגר), חוט דק או חוט שזור, חרוזים לא חובה.',
    steps: ['מדפיסים את שני הדפים. כדאי להדפיס על נייר עבה יותר כדי שהסביבונים לא יתקפלו.', 'גוזרים כל סביבון לאורך הקו.', 'מנקבים את הנקודות הלבנות בראש הסביבון ובקצה התחתון.', 'משחילים הכול על חוט ארוך — כל סביבון תלוי בנפרד, או כולם בשורה אחת מלמעלה למטה.'],
  },
  {
    id: 'window', emoji: '🪟', title: 'קישוטים לחלון: כוכב, חנוכייה ועוד',
    lead: 'שלושה דפים: כוכב גדול עם "חלון" לנייר משי, חנוכייה גדולה, ושישה קישוטים קטנים. אפשר לצבוע, לגזור ולתלות על זכוכית או על דלת.',
    need: 'נייר A4, מספריים, נייר משי צבעוני, דבק, חוט דיג או נייר דבק דביק לתלייה.',
    steps: ['מדפיסים. את הכוכב הגדול כדאי להדפיס על נייר עבה.', 'גוזרים את הצורה החיצונית. את הכוכב הפנימי המקווקו גוזרים בזהירות (בעזרת מבוגר) ומוציאים.', 'מדביקים מאחור פיסת נייר משי צבעוני — האור מהחלון יעבור דרכה.', 'תולים בחוט דיג או מצמידים בנייר דבק דו־צדדי. תלו הרחק מהחנוכייה האמיתית ומכל להבה.'],
  },
  {
    id: 'banner', emoji: '🎏', title: 'כרזה: אותיות גדולות על כמה דפים',
    lead: 'ברכה גדולה על פני כמה דפי A4: כל דף נושא שתי אותיות עצומות. מצמידים את הדפים זה לצד זה וכך נוצר פס שמתאים לקיר הכיתה, לשער הגן או לגב הכיסאות.',
    need: 'נייר A4, מספריים, נייר דבק, ובגרסת הצביעה צבעי עפרונות, טושים או גואש.',
    steps: ['בוחרים נוסח ומדפיסים את כל הדפים (5 או 6, לפי הנוסח).', 'גוזרים סביב המסגרת המקווקוות של כל דף.', 'מסדרים על שולחן או על הרצפה מימין לשמאל: דף 1 הוא הימני ביותר.', 'מצמידים את הדפים ומדביקים אותם מאחור בנייר דבק. אפשר לתלות את הפס בנייר דבק על הקיר.'],
  },
  {
    id: 'sign', emoji: '🪧', title: 'שלט "פינת חנוכה"',
    lead: 'שלט גדול לפינה בכיתה או בגן: "פינת חנוכה", עם חנוכייה, סביבונים וסופגנייה. אפשר להוסיף שם של הכיתה או הגן ולבחור שורה מתחת לכותרת.',
    need: 'נייר A4 (עדיף נייר עבה), מספריים, דבק או נייר דבק, ואולי לוח קרטון להקשחה.',
    steps: ['כותבים את שם הכיתה או הגן בשדה למעלה ובוחרים שורת משנה.', 'מדפיסים, ובגרסת הצביעה מזמינים ילדים לצבוע.', 'גוזרים לאורך המסגרת או משאירים את הדף שלם.', 'מדביקים על לוח קרטון ומציבים בפינה — או תולים מעל שולחן הפעילות.'],
  },
]

const FAQ = [
  { q: 'אילו קישוטי חנוכה אפשר להדפיס כאן?', a: 'חמישה סוגים: דגלונים (גרלנד) עם אותיות הברכה, שרשרת סביבונים לגזירה, קישוטים לחלון (כוכב, חנוכייה ועוד), כרזה בכמה דפים עם הברכה "חג אורים שמח" או "חנוכה שמח", ושלט "פינת חנוכה". לכל אחד יש גרסה צבעונית וגרסת צביעה.' },
  { q: 'מה ההבדל בין הגרסה הצבעונית לגרסת הצביעה?', a: 'הגרסה הצבעונית מוכנה לגזירה ולתלייה מיד. בגרסת הצביעה הציורים והאותיות מופיעים כקווי מתאר בלבד: הילדים צובעים אותם בעצמם לפני הגזירה, וכך הקישוטים הם גם פעילות יצירה. גרסת הצביעה חוסכת גם דיו.' },
  { q: 'כמה דפים צריך להדפיס?', a: 'דגלונים — שלושה דפים (12 דגלונים). שרשרת סביבונים — שני דפים (12 סביבונים). קישוטים לחלון — שלושה דפים. כרזה — חמישה או שישה דפים לפי הנוסח. שלט — דף אחד. כל סוג נפתח בחלון הדפסה משלו, ואפשר להדפיס רק את מה שצריך.' },
  { q: 'איזה נייר מתאים?', a: 'נייר מדפסת רגיל מספיק לדגלונים ולכרזה. לשרשרת הסביבונים, לכוכב לחלון ולשלט כדאי נייר עבה יותר, שמחזיק צורה ונשאר ישר. אם המדפסת לא מקבלת נייר עבה, אפשר להדביק את הדף הרגיל על קרטון דק.' },
  { q: 'איך תולים את הכרזה כך שהאותיות יהיו בסדר הנכון?', a: 'העברית נקראת מימין לשמאל, ולכן דף 1 נתלה בצד הימני של הקיר והדפים הבאים משמאלו. בראש כל דף כתוב המספר שלו, כדי שלא להתבלבל.' },
  { q: 'האם בטוח לתלות קישוטי נייר ליד החנוכייה?', a: 'לא. נייר נדלק בקלות, ולכן מרחיקים את כל הקישוטים מהחנוכייה האמיתית ומכל להבה, ולא תולים אותם מעליה. כשמדליקים נרות, מוודאים שהקישוטים רחוקים והחנוכייה על משטח יציב, בנוכחות מבוגר.' },
  { q: 'אפשר לעשות את זה עם כל הכיתה?', a: 'כן. מדפיסים עותק אחד של גרסת הצביעה לכל ילד או ילדה — או דף אחד לכל קבוצה — כל אחד צובע דגלון או סביבון אחד, ובסוף מרכיבים את כל העבודות יחד לגרלנד אחת. כך הקישוט מציג את עבודת כולם.' },
]

function Kind({ kind, mode, onPrint, extra, pages }) {
  return <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby={`k-${kind.id}`}>
    <h2 id={`k-${kind.id}`} className="mb-2 text-2xl font-bold">{kind.emoji} {kind.title}</h2>
    <p className="mb-4 text-lg leading-relaxed">{kind.lead}</p>
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
      <div>
        {extra}
        <h3 className="mb-1 mt-4 font-bold">מה צריך</h3>
        <p className="mb-3 leading-relaxed">{kind.need}</p>
        <h3 className="mb-1 font-bold">איך מכינים ותולים</h3>
        <ol className="mb-4 list-decimal space-y-1 pr-6 leading-relaxed">{kind.steps.map(s => <li key={s}>{s}</li>)}</ol>
        <button type="button" data-print-main onClick={onPrint} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-lg font-bold text-white">
          🖨️ הדפסה או PDF · {pages.length === 1 ? 'דף אחד' : `${pages.length} דפים`} · {mode === 'color' ? 'צבעוני' : 'לצביעה'}
        </button>
      </div>
      <button type="button" onClick={onPrint} aria-label={`הדפסה: ${kind.title}`} className="mx-auto w-full max-w-[280px] rounded-2xl border-2 border-[var(--border)] bg-white p-2 sketch-shadow-sm">{pages[0].svg}</button>
    </div>
  </section>
}

export default function HanukkahDecorations() {
  const [mode, setMode] = useState('color'), [greet, setGreet] = useState('ora'), [banner, setBanner] = useState('ora')
  const [sub, setSub] = useState('create'), [place, setPlace] = useState(''), [print, setPrint] = useState(null)
  const built = {
    bunting: buntingPages(mode, greet),
    garland: garlandPages(mode),
    window: windowPages(mode),
    banner: bannerPages(mode, banner),
    sign: signPages(mode, sub, place.trim()),
  }
  const greetOptions = Object.entries(GREETINGS).map(([id, g]) => [id, g.label])
  const extras = {
    bunting: <Choice label="נוסח הברכה על הדגלונים" value={greet} onChange={setGreet} options={greetOptions} />,
    banner: <Choice label="נוסח הכרזה" value={banner} onChange={setBanner} options={Object.entries(BANNERS).map(([id, g]) => [id, g.label])} />,
    sign: <div className="space-y-3">
      <Field label="שם הכיתה או הגן (לא חובה)" value={place} onChange={setPlace} maxLength={26} placeholder="למשל: גן תפוח" />
      <Choice label="שורה מתחת לכותרת" value={sub} onChange={setSub} options={Object.entries(SUBS).map(([id, t]) => [id, t])} />
    </div>,
  }
  return <HanukkahShell crumb="קישוטי חנוכה">
    <SEO title="קישוטי חנוכה להדפסה — דגלונים, שרשרת סביבונים, כרזה ושלט לגן ולכיתה" description="קישוטי חנוכה להדפסה בחינם: גרלנד דגלונים עם אותיות הברכה, שרשרת סביבונים לגזירה, קישוטים לחלון, כרזה 'חג אורים שמח' על כמה דפי A4 ושלט 'פינת חנוכה'. בגרסה צבעונית או בגרסת צביעה, עם הוראות גזירה ותלייה." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🕎 קישוטי חנוכה להדפסה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">דגלונים, שרשרת סביבונים, קישוטים לחלון, כרזה ושלט לפינת חנוכה — לגן, לכיתה ולבית. כל קישוט מגיע בגרסה צבעונית, או בגרסת צביעה שהילדים משלימים בעצמם.</p>

    <div className="mx-auto mb-8 max-w-2xl rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-4">
      <p className="mb-3 text-center font-bold">איזו גרסה להדפיס?</p>
      <Choice label="גרסה" value={mode} onChange={setMode} options={[['color', '🎨 צבעוני, מוכן לגזירה'], ['outline', '🖍️ לצביעה — קווי מתאר']]} />
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">גרסת הצביעה היא גם פעילות: הילדים צובעים, ואחר כך גוזרים ותולים. היא גם חוסכת דיו.</p>
    </div>

    {KINDS.map(kind => <Kind key={kind.id} kind={kind} mode={mode} pages={built[kind.id]} extra={extras[kind.id]} onPrint={() => setPrint(kind.id)} />)}

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="mb-3 text-2xl font-bold">💡 טיפים להדפסה ולתלייה</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li>בחלון ההדפסה מבקשים קנה מידה של 100% או "התאמה לעמוד", כדי שהצורות לא ייחתכו בשוליים.</li>
        <li>לגרלנד של כל הכיתה: כל ילד צובע דגלון אחד מגרסת הצביעה, ובסוף תולים את כולם יחד.</li>
        <li>תולים את הקישוטים הרחק מהחנוכייה האמיתית ומכל להבה, ולא מעליה.</li>
        <li>את השלט והכרזה כדאי להכין לפני החג, כדי שהפינה תהיה מוכנה לימים שבהם מדליקים נרות.</li>
      </ul>
    </section>

    {print && <PrintPreview title={KINDS.find(k => k.id === print).title} onClose={() => setPrint(null)}>
      {built[print].map(p => <article className="buga-a4" key={p.key}><div className="print-art">{p.svg}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחנוכה: <Link className="font-bold underline" to="/holidays/hanukkah/coloring">דפי צביעה לחנוכה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/cut-out-hanukkiah">חנוכייה לגזירה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/greetings">ברכות לחנוכה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'קישוטי חנוכה להדפסה הם דרך קלה להפוך כיתה, גן או סלון לחגיגיים: בלי קניות ובלי הכנה ארוכה, רק מדפסת, מספריים וחוט. הדפים כאן מכסים את הצרכים הנפוצים לפני החג: שרשרת דגלונים לקיר, סביבונים לחלון, כרזה גדולה ושלט לפינת הפעילות.',
      'כל קישוט מגיע בשתי גרסאות. הצבעונית מוכנה לגזירה, ואילו גרסת הצביעה משאירה לילדים את העבודה: הם צובעים את הסביבונים, החנוכיות והסופגניות, ורק אחר כך גוזרים ותולים. כך הקישוט הוא גם יצירה של הכיתה כולה.',
      'גם הכרזה בנויה לעבודה משותפת: כל דף נושא שתי אותיות גדולות, ואפשר לחלק את הדפים בין קבוצות, לצבוע במקביל ולהרכיב את הכרזה יחד. הוראות הגזירה והתלייה מופיעות ליד כל קישוט, כולל הערה חשובה לגבי מרחק מנרות אמיתיים.',
    ]} faq={FAQ} related={[{ label: 'דפי צביעה לחנוכה', href: '/holidays/hanukkah/coloring' }, { label: 'חנוכייה לגזירה', href: '/holidays/hanukkah/cut-out-hanukkiah' }, { label: 'סביבון', href: '/holidays/hanukkah/sevivon' }, { label: 'חנוכה לילדים', href: '/holidays/hanukkah' }]} /></div>
  </HanukkahShell>
}

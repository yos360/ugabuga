import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import { HEB_DAYS } from '../../utils/hebrewCalendar'

// Home charts for parents: chores, reward stickers, tooth brushing, potty training and a school timetable.
// Each one is a generator — child's name, own list and colour — printed as one A4.

const THEMES = {
  sun: { label: '☀️ צהוב', main: '#ffd23f', soft: '#fff6cf' },
  pink: { label: '🌸 ורוד', main: '#ff8fab', soft: '#ffe8ee' },
  blue: { label: '🌊 כחול', main: '#6cb8ff', soft: '#e3f1ff' },
  green: { label: '🌿 ירוק', main: '#7dd87a', soft: '#e6f8e4' },
  bw: { label: '🖍️ שחור-לבן', main: '#fff', soft: '#fff' },
}

const star = (cx, cy, r, props = {}) => {
  const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}` })
  const { key, ...rest } = props
  return <polygon key={key} points={pts.join(' ')} fill="none" stroke="#111" strokeWidth={0.5} strokeLinejoin="round" {...rest} />
}
const tooth = (cx, cy, s, { key, ...props } = {}) => (
  <path key={key} d={`M${cx - s} ${cy - s * 0.6} C${cx - s} ${cy - s * 1.3} ${cx - s * 0.3} ${cy - s * 1.1} ${cx} ${cy - s * 0.8} C${cx + s * 0.3} ${cy - s * 1.1} ${cx + s} ${cy - s * 1.3} ${cx + s} ${cy - s * 0.6} C${cx + s} ${cy} ${cx + s * 0.6} ${cy + s * 0.4} ${cx + s * 0.5} ${cy + s * 1.1} C${cx + s * 0.4} ${cy + s * 1.4} ${cx + s * 0.15} ${cy + s * 1.3} ${cx + s * 0.1} ${cy + s * 0.7} C${cx} ${cy + s * 0.4} ${cx - s * 0.1} ${cy + s * 0.7} ${cx - s * 0.1} ${cy + s * 0.7} C${cx - s * 0.15} ${cy + s * 1.3} ${cx - s * 0.4} ${cy + s * 1.4} ${cx - s * 0.5} ${cy + s * 1.1} C${cx - s * 0.6} ${cy + s * 0.4} ${cx - s} ${cy} ${cx - s} ${cy - s * 0.6} Z`} fill="#fff" stroke="#111" strokeWidth={0.5} {...props} />
)
const lines = text => text.split('\n').map(s => s.trim()).filter(Boolean)

function Header({ title, name, theme, sub }) {
  return <g>
    <rect x={8} y={8} width={184} height={36} rx={8} fill={theme.main} stroke="#111" strokeWidth={0.8} />
    <T x={100} y={25} size={13} weight={800}>{title}</T>
    <T x={100} y={37} size={6.5}>{name ? `של ${name}` : (sub || 'השם שלי: ____________________')}</T>
  </g>
}

function ChoreSheet({ name, tasks, reward, theme }) {
  const L = 8, W = 184, taskW = 58, cw = (W - taskW) / 7, top = 54, rh = Math.min(22, 170 / Math.max(tasks.length, 1))
  return <Sheet label="טבלת מטלות">
    <Header title="טבלת המטלות שלי" name={name} theme={theme} />
    <rect x={L} y={top} width={W} height={10} fill={theme.soft} stroke="#111" strokeWidth={0.6} />
    <T x={L + W - 3} y={top + 7} size={5} anchor="start" weight={700}>המשימה</T>
    {HEB_DAYS.map((d, i) => <T key={d} x={L + (6 - i) * cw + cw / 2} y={top + 7} size={4.4} weight={700}>{d}</T>)}
    {tasks.map((t, r) => { const y = top + 10 + r * rh; return <g key={r}>
      <rect x={L} y={y} width={W} height={rh} fill={r % 2 ? theme.soft : '#fff'} stroke="#111" strokeWidth={0.5} />
      <T x={L + W - 3} y={y + rh / 2 + 2} size={t.length > 16 ? 4.2 : 5} anchor="start">{t}</T>
      {HEB_DAYS.map((d, i) => star(L + (6 - i) * cw + cw / 2, y + rh / 2, Math.min(5, rh / 3), { key: d, stroke: '#999' }))}
    </g> })}
    {Array.from({ length: 8 }, (_, c) => <line key={c} x1={L + c * cw} x2={L + c * cw} y1={top} y2={top + 10 + tasks.length * rh} stroke="#111" strokeWidth={0.5} />)}
    <g transform={`translate(0 ${top + 18 + tasks.length * rh})`}>
      <rect x={L} y={0} width={W} height={26} rx={6} fill="#fff" stroke="#111" strokeWidth={0.6} strokeDasharray="2 1.5" />
      <T x={100} y={10} size={6} weight={700}>כל משימה שעשיתי = מצייר/ת כוכב או מדביק/ה מדבקה</T>
      <T x={100} y={20} size={5.5}>{reward ? `כשמגיעים ל-____ כוכבים מקבלים: ${reward}` : 'כשמגיעים ל-____ כוכבים מקבלים: ____________________'}</T>
    </g>
  </Sheet>
}

// A winding path of numbered circles, filled with a sticker each time.
function PathSheet({ title, name, goal, reward, count, theme, icon }) {
  const cols = count <= 10 ? 4 : 5, rows = Math.ceil(count / cols), gx = 170 / (cols - 1 || 1), top = 92, gy = Math.min(32, 150 / Math.max(rows - 1, 1)), r = Math.min(11, gy / 2.6)
  const pts = Array.from({ length: count }, (_, i) => { const row = Math.floor(i / cols), k = i % cols, col = row % 2 ? k : cols - 1 - k; return [15 + col * gx, top + row * gy] })
  return <Sheet label={title}>
    <Header title={title} name={name} theme={theme} />
    <rect x={8} y={50} width={184} height={26} rx={6} fill={theme.soft} stroke="#111" strokeWidth={0.6} />
    <T x={100} y={60} size={5.5} weight={700}>המטרה שלי:</T>
    <T x={100} y={70} size={6}>{goal || '________________________________'}</T>
    <polyline points={pts.map(p => p.join(',')).join(' ')} fill="none" stroke="#bbb" strokeWidth={2.2} strokeDasharray="3 2" />
    {pts.map(([x, y], i) => <g key={i}>
      {icon === 'tooth' ? tooth(x, y, r * 0.8) : <circle cx={x} cy={y} r={r} fill="#fff" stroke="#111" strokeWidth={0.6} />}
      <T x={x} y={y + (icon === 'tooth' ? 1.5 : 2)} size={r * 0.55} fill="#bbb" weight={700}>{i + 1}</T>
    </g>)}
    {(() => { const [x, y] = pts[pts.length - 1]; return <g>{star(x, y + r + 12, 9, { fill: theme.main === '#fff' ? '#fff' : theme.main })}</g> })()}
    <rect x={8} y={236} width={184} height={22} rx={6} fill="#fff" stroke="#111" strokeWidth={0.6} strokeDasharray="2 1.5" />
    <T x={100} y={249.5} size={6} weight={700}>{reward ? `בסוף הדרך מחכה לי: ${reward}` : 'בסוף הדרך מחכה לי: ____________________'}</T>
  </Sheet>
}

function ToothSheet({ name, theme, weeks }) {
  const L = 8, W = 184, dayW = 28, cw = (W - dayW) / weeks / 2, top = 56, rh = 24
  return <Sheet label="לוח צחצוח שיניים">
    <Header title="לוח צחצוח שיניים" name={name} theme={theme} />
    <T x={100} y={51} size={5}>בוקר וערב, שתי דקות — כל צחצוח = צובעים שן</T>
    <rect x={L} y={top} width={W} height={16} fill={theme.soft} stroke="#111" strokeWidth={0.6} />
    {Array.from({ length: weeks }, (_, w) => { const x = L + W - dayW - (w + 1) * cw * 2; return <g key={w}>
      <T x={x + cw} y={top + 6.5} size={4.6} weight={700}>שבוע {w + 1}</T>
      <T x={x + cw * 1.5} y={top + 13} size={3.8}>בוקר</T><T x={x + cw * 0.5} y={top + 13} size={3.8}>ערב</T>
      <line x1={x} x2={x} y1={top} y2={top + 16 + 7 * rh} stroke="#111" strokeWidth={0.8} />
      <line x1={x + cw} x2={x + cw} y1={top + 8} y2={top + 16 + 7 * rh} stroke="#111" strokeWidth={0.3} />
    </g> })}
    {HEB_DAYS.map((d, i) => { const y = top + 16 + i * rh; return <g key={d}>
      <rect x={L} y={y} width={W} height={rh} fill="none" stroke="#111" strokeWidth={0.5} />
      <T x={L + W - 3} y={y + rh / 2 + 2} size={5.5} anchor="start" weight={700}>{d}</T>
      {Array.from({ length: weeks * 2 }, (_, k) => tooth(L + W - dayW - k * cw - cw / 2, y + rh / 2 - 1, Math.min(6, cw / 3.2), { key: k }))}
    </g> })}
    <line x1={L + W - dayW} x2={L + W - dayW} y1={top} y2={top + 16 + 7 * rh} stroke="#111" strokeWidth={0.8} />
    <T x={100} y={top + 16 + 7 * rh + 12} size={5.5}>טיפ: מצחצחים כל שן מכל הצדדים, וגם את הלשון — ולא שוטפים מיד את המשחה.</T>
  </Sheet>
}

function ScheduleSheet({ name, cls, theme, periods, sixDays }) {
  const days = sixDays ? HEB_DAYS.slice(0, 6) : HEB_DAYS.slice(0, 5), L = 8, W = 184, hourW = 26, cw = (W - hourW) / days.length, top = 52, rh = Math.min(24, 190 / periods.length)
  return <Sheet label="מערכת שעות">
    <Header title="מערכת השעות שלי" name={[name, cls].filter(Boolean).join(' · ')} theme={theme} sub="שם: ____________  כיתה: ______" />
    <rect x={L} y={top} width={W} height={10} fill={theme.main === '#fff' ? '#fff' : '#1d2233'} stroke="#111" strokeWidth={0.6} />
    <T x={L + W - hourW / 2} y={top + 7} size={4.6} weight={700} fill={theme.main === '#fff' ? '#111' : '#fff'}>שעה</T>
    {days.map((d, i) => <T key={d} x={L + W - hourW - i * cw - cw / 2} y={top + 7} size={4.8} weight={700} fill={theme.main === '#fff' ? '#111' : '#fff'}>{d}</T>)}
    {periods.map((p, r) => { const y = top + 10 + r * rh; return <g key={r}>
      <rect x={L} y={y} width={W} height={rh} fill={r % 2 ? theme.soft : '#fff'} stroke="#111" strokeWidth={0.5} />
      <T x={L + W - hourW / 2} y={y + rh / 2 - 0.5} size={6} weight={800}>{r + 1}</T>
      <T x={L + W - hourW / 2} y={y + rh / 2 + 5} size={3.4} fill="#555" direction="ltr">{p}</T>
    </g> })}
    {Array.from({ length: days.length + 1 }, (_, c) => <line key={c} x1={L + c * cw} x2={L + c * cw} y1={top} y2={top + 10 + periods.length * rh} stroke="#111" strokeWidth={0.5} />)}
    <T x={100} y={top + 10 + periods.length * rh + 12} size={5}>לא לשכוח: ________________________________________</T>
  </Sheet>
}

const DEFAULT_CHORES = 'לסדר את המיטה\nלצחצח שיניים בבוקר ובערב\nלהתלבש לבד\nלסדר את הצעצועים\nלהכין את התיק\nלעזור לערוך את השולחן\nלקרוא 15 דקות'
const DEFAULT_PERIODS = '8:00–8:45\n8:45–9:30\n9:50–10:35\n10:35–11:20\n11:40–12:25\n12:25–13:10\n13:20–14:05\n14:05–14:50'

const HUB_ITEMS = [
  ['/printables/chore-chart', '📋', 'טבלת מטלות לילדים', 'משימות יומיות לכל יום בשבוע, עם כוכב על כל משימה'],
  ['/printables/reward-chart', '⭐', 'לוח מדבקות וחיזוקים', 'מטרה אחת, דרך של 10–30 מדבקות ופרס בסוף'],
  ['/printables/toothbrushing-chart', '🦷', 'לוח צחצוח שיניים', 'בוקר וערב, לשבוע אחד או לחודש שלם'],
  ['/printables/potty-chart', '🚽', 'לוח גמילה מחיתולים', 'דרך מדבקות לכל הצלחה בשירותים'],
  ['/printables/class-schedule', '🗓️', 'מערכת שעות', 'מערכת שעות אישית לבית הספר, 5 או 6 ימים'],
  ['/printables/calendar-2027', '📅', 'לוח שנה 2027', 'עברי ולועזי, עם חגים — חודשי או שנתי'],
]
export const HOME_CHARTS = HUB_ITEMS
const SIBLINGS = HUB_ITEMS.slice(0, 5).map(([href, emoji, label]) => ({ href, label: `${emoji} ${label}` }))
const CRUMBS = [{ label: 'לוחות לבית', href: '/printables/home-charts' }]

const PRESETS = {
  'chore-chart': {
    h1: 'טבלת מטלות לילדים להדפסה', emoji: '📋', seoTitle: 'טבלת מטלות לילדים להדפסה — עם שם ומשימות משלכם',
    description: 'טבלת מטלות לילדים להדפסה בחינם: כותבים את שם הילד ואת המשימות שלו, ומקבלים לוח שבועי עם כוכב לכל משימה ופרס בסוף השבוע. בצבע או לצביעה.',
    sub: 'כותבים שם ומשימות — ומקבלים לוח שבועי עם כוכבים',
    paragraphs: ['טבלת מטלות עוזרת לילדים לקחת אחריות בלי ויכוחים: המשימות כתובות, כל יום ממלאים כוכב, ובסוף השבוע רואים כמה הצליחו. כשהמשימות מול העיניים, ההורים מפסיקים להזכיר והילד מתחיל לבדוק בעצמו מה נשאר.', 'כדאי להתחיל בקטן — 4 עד 6 משימות שהילד באמת מסוגל לעשות לבד, כמו לסדר את המיטה, להכין תיק או לעזור לערוך שולחן. אפשר לנסח את המשימות יחד איתו, וכך הוא מרגיש שזו הטבלה שלו.', 'את הלוח תולים בגובה העיניים של הילד, ליד המקרר או בחדר. מומלץ לבחור פרס קטן ולא חומרי מדי, כמו זמן משחק עם הורה, בחירת ארוחת שישי או טיול לגינה.'],
    faq: [{ q: 'כמה משימות לשים בטבלת מטלות?', a: 'לגיל הגן 3–4 משימות, לכיתות א׳–ג׳ עד 6–7. יותר מזה מתיש ומוריד את המוטיבציה.' }, { q: 'מאיזה גיל מתאימה טבלת מטלות?', a: 'כבר מגיל 3–4, עם משימות פשוטות. בגיל הגן כדאי להוסיף ציור קטן ליד כל משימה כדי שהילד יזהה אותה גם בלי לקרוא.' }, { q: 'אפשר לשנות את המשימות?', a: 'כן. כותבים משימה בכל שורה בתיבה למעלה, והטבלה מתעדכנת מיד לפני ההדפסה.' }],
  },
  'reward-chart': {
    h1: 'לוח מדבקות לחיזוק חיובי להדפסה', emoji: '⭐', seoTitle: 'לוח מדבקות להדפסה — לוח חיזוקים לילדים',
    description: 'לוח מדבקות וחיזוקים לילדים להדפסה: כותבים מטרה ופרס, בוחרים 10, 20 או 30 מדבקות ומקבלים דרך צבעונית למילוי. חינם, עם שם הילד.',
    sub: 'מטרה אחת, דרך של מדבקות ופרס בסוף',
    paragraphs: ['לוח מדבקות הוא הכלי הכי פשוט לחיזוק חיובי: בוחרים התנהגות אחת שרוצים לחזק, ובכל פעם שהיא קורית מדביקים מדבקה. הילד רואה את הדרך מתקדמת ומבין שהמאמץ שלו מוביל למשהו.', 'הסוד הוא מטרה אחת וברורה — "הולכים לישון בלי ויכוח", "מתלבשים לבד בבוקר", "אוכלים ירק בארוחת ערב". לגיל הרך מתאימה דרך קצרה של 10 מדבקות, ולילדים גדולים יותר אפשר 20 או 30.', 'כדאי לתת מדבקה מיד אחרי ההתנהגות ולתאר במילים מה היה טוב. כשהלוח מתמלא, חוגגים, ואפשר להתחיל לוח חדש עם מטרה אחרת.'],
    faq: [{ q: 'כמה מדבקות לשים בלוח?', a: 'לגיל 3–4 עדיף 10, כדי שהפרס לא ירגיש רחוק. לגיל 5 ומעלה אפשר 20 או 30.' }, { q: 'מה עושים אם הילד מאבד עניין?', a: 'מקצרים את הדרך, מחליפים מטרה, או נותנים פרס ביניים באמצע. גם החלפת צבע הלוח עוזרת להתחיל מחדש.' }, { q: 'האם כדאי להוריד מדבקות על התנהגות לא טובה?', a: 'לרוב לא. לוח חיזוקים עובד הכי טוב כשהוא רק מוסיף, ולא מעניש.' }],
  },
  'toothbrushing-chart': {
    h1: 'לוח צחצוח שיניים להדפסה', emoji: '🦷', seoTitle: 'לוח צחצוח שיניים לילדים להדפסה',
    description: 'לוח צחצוח שיניים לילדים להדפסה: בוקר וערב לכל יום, לשבוע אחד או ל-4 שבועות. כל צחצוח צובעים שן. עם שם הילד, בחינם.',
    sub: 'בוקר וערב — כל צחצוח צובעים שן',
    paragraphs: ['לוח צחצוח שיניים הופך הרגל משעמם למשחק: אחרי כל צחצוח הילד צובע שן או מדביק מדבקה. אחרי שבוע רואים בבירור אם היו ימים שדילגו, וזה פותח שיחה טובה בלי להטיף.', 'רופאי שיניים ממליצים לצחצח פעמיים ביום במשך כשתי דקות, עם משחה שמתאימה לגיל. אפשר להפעיל שיר של שתי דקות או טיימר כדי שהילד ידע מתי לסיים.', 'בוחרים לוח לשבוע אחד לגיל הרך, או לוח ל-4 שבועות שמספיק לחודש שלם על המקרר.'],
    faq: [{ q: 'כמה זמן צריך לצחצח שיניים?', a: 'ההמלצה המקובלת היא כשתי דקות, פעמיים ביום — בבוקר ולפני השינה.' }, { q: 'מאיזה גיל הילד יכול לצחצח לבד?', a: 'עד גיל 6–7 בערך מומלץ שהורה יעזור או יעבור אחרי הילד, כי המוטוריקה עדיין לא מספיק מדויקת.' }],
  },
  'potty-chart': {
    h1: 'לוח גמילה מחיתולים להדפסה', emoji: '🚽', seoTitle: 'לוח גמילה מחיתולים להדפסה — לוח מדבקות לגמילה',
    description: 'לוח גמילה מחיתולים להדפסה: דרך של מדבקות לכל הצלחה בשירותים, עם שם הילד ופרס בסוף. 10, 20 או 30 מדבקות, בחינם.',
    sub: 'כל הצלחה בשירותים — מדבקה בדרך',
    paragraphs: ['לוח גמילה עוזר לילד לראות את ההתקדמות שלו: כל פעם שהצליח בסיר או בשירותים, הוא מדביק מדבקה בעצמו. הרגע הזה של ההדבקה הוא חלק גדול מהכיף, ולכן כדאי לתת לו לבחור מדבקות שהוא אוהב.', 'בגמילה כדאי לשמור על אווירה רגועה: לא כועסים על פספוסים, ומחזקים כל ניסיון. בתחילת הדרך אפשר לתת מדבקה גם על ישיבה בסיר, ובהמשך רק על הצלחה.', 'דרך של 10 מדבקות מתאימה לימים הראשונים, ואחר כך עוברים ל-20 או 30.'],
    faq: [{ q: 'מתי מתחילים גמילה?', a: 'רוב הילדים מוכנים בין גיל שנתיים לשלוש. סימנים טובים: חיתול יבש לכמה שעות, עניין בשירותים ויכולת להגיד שצריך.' }, { q: 'מה הפרס בסוף הלוח?', a: 'פרס קטן ומיידי עובד הכי טוב — ספר, משחק בגינה או בחירה של ארוחה. הכי חשוב זו החגיגה עצמה.' }],
  },
  'class-schedule': {
    h1: 'מערכת שעות להדפסה', emoji: '🗓️', seoTitle: 'מערכת שעות להדפסה — ריקה או עם שם וכיתה',
    description: 'מערכת שעות לבית הספר להדפסה בחינם: 5 או 6 ימים, עם שעות השיעורים ושם וכיתה. ריקה למילוי ביד, בצבע או בשחור-לבן.',
    sub: 'מערכת שעות אישית — ממלאים ביד ותולים ליד השולחן',
    paragraphs: ['מערכת שעות מודפסת עוזרת לילדים לארגן את התיק לבד: מסתכלים על היום של מחר ובודקים אילו ספרים ומחברות צריך. כשהמערכת תלויה ליד השולחן, ההורים לא צריכים לזכור את כל השיעורים.', 'אפשר לבחור 5 ימים (ראשון עד חמישי) או 6 ימים (עד שישי), ולכתוב את שעות השיעורים של בית הספר שלכם — שעה בכל שורה. אם משאירים את התיבה כמו שהיא, מקבלים 8 שעות עם זמנים נפוצים.', 'מורות יכולות להדפיס מערכת ריקה לכל הכיתה בתחילת השנה, ולתת לתלמידים להעתיק ולצבוע לפי מקצועות.'],
    faq: [{ q: 'איך משנים את שעות השיעורים?', a: 'בתיבת "שעות השיעורים" כותבים זמן אחד בכל שורה. מספר השורות קובע כמה שיעורים יהיו במערכת.' }, { q: 'אפשר מערכת שעות ריקה בלי שם?', a: 'כן. משאירים את השדות ריקים ומקבלים שורה למילוי שם וכיתה ביד.' }],
  },
}

export default function HomeChart({ preset }) {
  const p = PRESETS[preset]
  const [name, setName] = useState('')
  const [themeId, setTheme] = useState('sun')
  const [tasks, setTasks] = useState(DEFAULT_CHORES)
  const [goal, setGoal] = useState(preset === 'potty-chart' ? 'עושה פיפי וקקי בשירותים' : '')
  const [reward, setReward] = useState('')
  const [count, setCount] = useState('20')
  const [weeks, setWeeks] = useState('1')
  const [cls, setCls] = useState('')
  const [periods, setPeriods] = useState(DEFAULT_PERIODS)
  const [six, setSix] = useState('5')
  const theme = THEMES[themeId]
  const path = `/printables/${preset}`

  let svg, controls
  const common = <>
    <Choice label="צבע" value={themeId} onChange={setTheme} options={Object.entries(THEMES).map(([k, v]) => [k, v.label])} />
    <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
      <Field label="שם הילד/ה (לא חובה)" value={name} onChange={setName} placeholder="למשל: נועה" maxLength={20} />
      {preset === 'class-schedule'
        ? <Field label="כיתה (לא חובה)" value={cls} onChange={setCls} placeholder="למשל: ג׳2" maxLength={10} />
        : <Field label="הפרס (לא חובה)" value={reward} onChange={setReward} placeholder="למשל: גלידה עם אבא" maxLength={28} />}
    </div>
  </>
  if (preset === 'chore-chart') {
    const list = lines(tasks).slice(0, 10)
    svg = <ChoreSheet name={name} tasks={list.length ? list : ['']} reward={reward} theme={theme} />
    controls = <>{common}<label className="mx-auto block max-w-2xl text-center font-bold">המשימות — אחת בכל שורה (עד 10)
      <textarea rows={6} value={tasks} onChange={e => setTasks(e.target.value)} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" /></label></>
  } else if (preset === 'reward-chart' || preset === 'potty-chart') {
    svg = <PathSheet title={preset === 'potty-chart' ? 'לוח הגמילה שלי' : 'לוח המדבקות שלי'} name={name} goal={goal} reward={reward} count={+count} theme={theme} />
    controls = <>{common}
      <div className="mx-auto max-w-2xl"><Field label="המטרה" value={goal} onChange={setGoal} placeholder="למשל: הולך/ת לישון בלי ויכוח" maxLength={36} /></div>
      <Choice label="כמה מדבקות" value={count} onChange={setCount} options={[['10', '10 מדבקות'], ['20', '20 מדבקות'], ['30', '30 מדבקות']]} />
    </>
  } else if (preset === 'toothbrushing-chart') {
    svg = <ToothSheet name={name} theme={theme} weeks={+weeks} />
    controls = <>{common}<Choice label="אורך" value={weeks} onChange={setWeeks} options={[['1', 'שבוע אחד'], ['2', 'שבועיים'], ['4', 'חודש (4 שבועות)']]} /></>
  } else {
    const list = lines(periods).slice(0, 10)
    svg = <ScheduleSheet name={name} cls={cls} theme={theme} periods={list.length ? list : ['']} sixDays={six === '6'} />
    controls = <>{common}<Choice label="ימים" value={six} onChange={setSix} options={[['5', 'ראשון–חמישי'], ['6', 'ראשון–שישי']]} />
      <label className="mx-auto block max-w-2xl text-center font-bold">שעות השיעורים — אחת בכל שורה
        <textarea rows={5} value={periods} onChange={e => setPeriods(e.target.value)} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" /></label></>
  }

  return <PrintableShell path={path} seoTitle={p.seoTitle} description={p.description} emoji={p.emoji} h1={p.h1} sub={p.sub}
    crumbs={CRUMBS} siblings={SIBLINGS} controls={controls} pages={[{ key: preset, svg }]}
    paragraphs={p.paragraphs} faq={p.faq}
    related={[{ label: 'כל הלוחות לבית', href: '/printables/home-charts' }, { label: 'לוח שנה 2027', href: '/printables/calendar-2027' }, { label: 'תעודות הצטיינות', href: '/printables/certificates' }]} />
}

// /printables/home-charts — the family of home charts in one place.
export function HomeChartsHub() {
  const faq = [
    { q: 'הלוחות באמת חינמיים?', a: 'כן. כל הלוחות חינמיים, בלי הרשמה, ואפשר להדפיס כמה פעמים שרוצים.' },
    { q: 'אפשר לשים את שם הילד?', a: 'כן. בכל לוח יש שדה לשם, ובחלק מהם גם למטרה, למשימות ולפרס.' },
  ]
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="לוחות לבית להדפסה — מטלות, מדבקות, צחצוח שיניים ומערכת שעות" description="לוחות להדפסה להורים: טבלת מטלות, לוח מדבקות לחיזוק, לוח צחצוח שיניים, לוח גמילה, מערכת שעות ולוח שנה 2027. עם שם הילד, חינם." path="/printables/home-charts" structuredData={faqSchema(faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'לוחות לבית' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🏠 </span>לוחות לבית להדפסה</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">מטלות, מדבקות, צחצוח שיניים, גמילה ומערכת שעות — עם השם של הילד</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {HUB_ITEMS.map(([href, emoji, title, desc]) => (
          <Link key={href} to={href} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-5 text-right">
            <div className="text-4xl mb-2" aria-hidden="true">{emoji}</div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-[var(--muted-foreground)]">{desc}</p>
          </Link>
        ))}
      </div>
      <div className="mt-12">
        <SeoBody paragraphs={['לוחות לבית הם הדרך הכי פשוטה להכניס סדר לשגרה של הילדים בלי להזכיר כל הזמן. משימה כתובה על המקרר עובדת יותר טוב ממשימה שאומרים בעל פה, וכוכב או מדבקה נותנים לילד תחושת הצלחה מיידית.', 'כל הלוחות כאן הם מחוללים: כותבים את שם הילד, בוחרים צבע, מוסיפים משימות או מטרה — ומדפיסים דף A4 מוכן. אפשר גם להדפיס בשחור-לבן ולתת לילד לצבוע את הלוח בעצמו, כך הוא מרגיש שזה שלו.']} faq={faq}
          related={[{ label: 'תעודות הצטיינות', href: '/printables/certificates' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'דפי צביעה', href: '/printables/coloring' }]} />
      </div>
    </div>
  )
}

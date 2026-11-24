import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// "לוח שגרת בוקר וערב": a printable routine chart. Pick morning / evening / both, choose and reorder the steps,
// then print a vertical checklist (with optional day-of-week tick boxes) or a velcro board + cards to cut out.
const PATH = '/printables/routine-chart'
const MAX_STEPS = 12
const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
const FILLS = ['#fef3c7', '#dbeafe', '#fce7f3', '#dcfce7', '#ede9fe', '#ffedd5']

const STEPS = [
  { id: 'wake', e: '🌞', l: 'לקום' },
  { id: 'toilet', e: '🚽', l: 'לשירותים' },
  { id: 'face', e: '💦', l: 'לשטוף פנים' },
  { id: 'teeth', e: '🪥', l: 'לצחצח שיניים' },
  { id: 'dress', e: '👕', l: 'להתלבש' },
  { id: 'hair', e: '💇', l: 'לסרק שיער' },
  { id: 'breakfast', e: '🥣', l: 'ארוחת בוקר' },
  { id: 'shoes', e: '👟', l: 'לנעול נעליים' },
  { id: 'bag', e: '🎒', l: 'לקחת תיק' },
  { id: 'tidy', e: '🧸', l: 'לסדר צעצועים' },
  { id: 'dinner', e: '🍽️', l: 'ארוחת ערב' },
  { id: 'bath', e: '🛁', l: 'אמבטיה' },
  { id: 'pajamas', e: '👚', l: 'פיג׳מה' },
  { id: 'clothes', e: '👖', l: 'להכין בגדים למחר' },
  { id: 'water', e: '🥛', l: 'לשתות מים' },
  { id: 'story', e: '📖', l: 'סיפור לפני השינה' },
  { id: 'hug', e: '🤗', l: 'חיבוק' },
  { id: 'sleep', e: '😴', l: 'לילה טוב' },
]
const BY_ID = Object.fromEntries(STEPS.map(s => [s.id, s]))
const DEFAULTS = {
  morning: ['wake', 'toilet', 'teeth', 'dress', 'breakfast', 'shoes', 'bag'],
  evening: ['dinner', 'bath', 'pajamas', 'teeth', 'story', 'sleep'],
}
const TITLES = { morning: 'שגרת בוקר', evening: 'שגרת ערב' }
const ICONS = { morning: '🌞', evening: '🌙' }

// Move the item at index i by dir (-1 / +1) without leaving the array.
function moveStep(list, i, dir) {
  const j = i + dir
  if (j < 0 || j >= list.length) return list
  const next = [...list]
  const tmp = next[i]
  next[i] = next[j]
  next[j] = tmp
  return next
}

function Checklist({ part, ids, name, days, color }) {
  const n = ids.length
  const top = 38, bottom = 252
  const rowH = Math.min(24, (bottom - top) / Math.max(n, 1))
  const dayW = 10.5, dayX0 = 8
  return <g>
    <rect x={5} y={5} width={190} height={260} rx={5} fill="none" stroke="#334155" strokeWidth=".6" />
    <rect x={5} y={5} width={190} height={24} rx={5} fill={color ? '#fde68a' : '#fff'} stroke="#334155" strokeWidth=".6" />
    <T x={100} y={18} size={10} weight={800}>{ICONS[part]} {TITLES[part]}{name ? ` של ${name}` : ''}</T>
    <T x={100} y={25.5} size={3.8} fill="#555">מסמנים ✓ אחרי כל משימה</T>
    {days && DAYS.map((d, k) => <T key={d} x={dayX0 + dayW / 2 + (6 - k) * (dayW + 1)} y={35} size={4} weight={700} fill="#555">{d}</T>)}
    {ids.map((id, i) => {
      const s = BY_ID[id], y = top + i * rowH, mid = y + rowH / 2
      return <g key={id + i}>
        <rect x={7} y={y} width={186} height={rowH - 1.5} rx={3} fill={color ? FILLS[i % FILLS.length] : '#fff'} stroke="#94a3b8" strokeWidth=".35" />
        <circle cx={186} cy={mid} r={4} fill="#fff" stroke="#334155" strokeWidth=".4" />
        <T x={186} y={mid + 1.7} size={5} weight={800}>{i + 1}</T>
        <text x={172} y={mid + 3.6} fontSize={Math.min(11, rowH * 0.5)} textAnchor="middle">{s.e}</text>
        <T x={days ? 140 : 108} y={mid + 2.4} size={Math.min(8, rowH * 0.36)} weight={700}>{s.l}</T>
        {days
          ? DAYS.map((d, k) => <rect key={d} x={dayX0 + (6 - k) * (dayW + 1)} y={mid - 5} width={dayW} height={10} rx={2} fill="#fff" stroke="#334155" strokeWidth=".4" />)
          : <rect x={14} y={mid - 6} width={12} height={12} rx={2.5} fill="#fff" stroke="#334155" strokeWidth=".5" />}
      </g>
    })}
    {n === 0 && <T x={100} y={130} size={6} fill="#888">בחרו משימות למעלה</T>}
    <T x={100} y={261} size={3.5} fill="#888">עוגה בוגה · ugabuga.co.il</T>
  </g>
}

// Velcro board: numbered empty slots the child fills with cards.
function Board({ part, ids, name, color }) {
  const n = ids.length
  const top = 38, bottom = 250, rowH = Math.min(26, (bottom - top) / Math.max(n, 1))
  return <g>
    <rect x={5} y={5} width={190} height={260} rx={5} fill="none" stroke="#334155" strokeWidth=".6" />
    <rect x={5} y={5} width={190} height={24} rx={5} fill={color ? '#bfdbfe' : '#fff'} stroke="#334155" strokeWidth=".6" />
    <T x={100} y={18} size={10} weight={800}>{ICONS[part]} לוח {TITLES[part]}{name ? ` של ${name}` : ''}</T>
    <T x={100} y={25.5} size={3.8} fill="#555">מדביקים פס סקוץ׳ בכל משבצת ובגב הכרטיסים</T>
    {ids.map((id, i) => {
      const y = top + i * rowH
      return <g key={id + i}>
        <rect x={25} y={y} width={150} height={rowH - 2} rx={3} fill="#fff" stroke="#334155" strokeWidth=".45" strokeDasharray="2 1.5" />
        <circle cx={186} cy={y + rowH / 2 - 1} r={5} fill={color ? FILLS[i % FILLS.length] : '#fff'} stroke="#334155" strokeWidth=".45" />
        <T x={186} y={y + rowH / 2 + 1} size={6} weight={800}>{i + 1}</T>
        <circle cx={100} cy={y + rowH / 2 - 1} r={1.6} fill="#94a3b8" />
      </g>
    })}
    <T x={100} y={261} size={3.5} fill="#888">עוגה בוגה · ugabuga.co.il</T>
  </g>
}

// Cards to cut: up to 12, 3 columns x 4 rows, 60 x 58 mm.
function Cards({ part, ids, color }) {
  const cw = 60, ch = 58, gx = (200 - 3 * cw) / 4
  return <g>
    <T x={100} y={13} size={7} weight={800}>{ICONS[part]} כרטיסי {TITLES[part]} — גוזרים</T>
    {ids.map((id, i) => {
      const s = BY_ID[id], r = Math.floor(i / 3), c = i % 3
      const x = 200 - gx - cw - c * (cw + gx), y = 20 + r * (ch + 4)
      return <g key={id + i}>
        <rect x={x} y={y} width={cw} height={ch} rx={5} fill={color ? FILLS[i % FILLS.length] : '#fff'} stroke="#334155" strokeWidth=".5" strokeDasharray="3 2" />
        <text x={x + cw / 2} y={y + 33} fontSize={26} textAnchor="middle">{s.e}</text>
        <T x={x + cw / 2} y={y + 50} size={6.2} weight={800}>{s.l}</T>
        <circle cx={x + cw - 6} cy={y + 6} r={2} fill="none" stroke="#94a3b8" strokeWidth=".35" />
      </g>
    })}
    <T x={100} y={262} size={3.5} fill="#888">✂️ גוזרים לאורך הקו המקווקו · העיגול הקטן בפינה = מקום לפס סקוץ׳</T>
  </g>
}

export default function RoutineChart() {
  const [mode, setMode] = useState('morning') // morning | evening | both
  const [editing, setEditing] = useState('morning')
  const [lists, setLists] = useState(DEFAULTS)
  const [name, setName] = useState('')
  const [layout, setLayout] = useState('list') // list | cards
  const [color, setColor] = useState('yes')
  const [days, setDays] = useState('no')

  const parts = mode === 'both' ? ['morning', 'evening'] : [mode]
  const cur = parts.includes(editing) ? editing : parts[0]
  const list = lists[cur]
  const setList = next => setLists(prev => ({ ...prev, [cur]: next }))
  const toggle = id => {
    if (list.includes(id)) setList(list.filter(x => x !== id))
    else if (list.length < MAX_STEPS) setList([...list, id])
  }
  const remove = i => setList(list.filter((_, k) => k !== i))
  const clean = name.trim()
  const isColor = color === 'yes'

  const pages = parts.flatMap(p => {
    const ids = lists[p]
    if (layout === 'list') return [{ key: p, svg: <Sheet label={`לוח ${TITLES[p]}`}><Checklist part={p} ids={ids} name={clean} days={days === 'yes'} color={isColor} /></Sheet> }]
    return [
      { key: p + '-board', svg: <Sheet label={`לוח ${TITLES[p]} עם משבצות`}><Board part={p} ids={ids} name={clean} color={isColor} /></Sheet> },
      { key: p + '-cards', svg: <Sheet label={`כרטיסי ${TITLES[p]}`}><Cards part={p} ids={ids} color={isColor} /></Sheet> },
    ]
  })

  return <PrintableShell path={PATH} emoji="⏰" h1="לוח שגרת בוקר וערב לילדים להדפסה"
    seoTitle="לוח שגרת בוקר וערב לילדים להדפסה — עם תמונות, רשימה או כרטיסים (חינם)"
    description="לוח שגרת בוקר וערב לילדים בני 3–8 להדפסה בחינם: בוחרים משימות (לצחצח שיניים, להתלבש, ארוחת בוקר, אמבטיה, סיפור…), מסדרים בסדר שמתאים לכם, מוסיפים שם, ומדפיסים רשימה עם תיבות סימון או כרטיסים לגזירה והדבקה."
    sub="בוחרים משימות, מסדרים בסדר שלכם ומדפיסים — לוח עם תמונות שגם ילד שעדיין לא קורא מבין"
    crumbs={[{ label: 'לוחות לבית', href: '/printables/home-charts' }]}
    controls={<div className="space-y-4">
      <p className="m-0 text-center font-bold">איזה לוח?</p>
      <Choice label="סוג הלוח" value={mode} onChange={v => { setMode(v); if (v !== 'both') setEditing(v) }} options={[['morning', '🌞 בוקר'], ['evening', '🌙 ערב'], ['both', 'שניהם (שני דפים)']]} />
      <Field label="שם הילד או הילדה (לא חובה)" value={name} onChange={setName} placeholder="למשל: נועם" maxLength={16} />
      {mode === 'both' && <>
        <p className="m-0 text-center font-bold">עורכים עכשיו</p>
        <Choice label="איזה לוח לערוך" value={cur} onChange={setEditing} options={[['morning', 'שגרת בוקר'], ['evening', 'שגרת ערב']]} />
      </>}
      <p className="m-0 text-center font-bold">משימות ב{TITLES[cur]} ({list.length}/{MAX_STEPS})</p>
      <div role="group" aria-label="בחירת משימות" className="flex flex-wrap justify-center gap-2">
        {STEPS.map(s => {
          const on = list.includes(s.id)
          return <button key={s.id} type="button" aria-pressed={on} onClick={() => toggle(s.id)} disabled={!on && list.length >= MAX_STEPS}
            className={`min-h-[44px] wobbly-sm border-2 border-[var(--border)] px-3 py-2 font-bold disabled:opacity-40 ${on ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>{s.e} {s.l}</button>
        })}
      </div>
      {list.length > 0 && <div>
        <p className="mb-2 text-center font-bold">הסדר בלוח (אפשר להזיז)</p>
        <ol className="mx-auto max-w-md space-y-2 p-0 list-none">
          {list.map((id, i) => <li key={id + i} className="flex items-center gap-2 rounded-xl border-2 border-[var(--border)] bg-white px-3 py-1.5">
            <span className="w-6 text-center font-black">{i + 1}</span>
            <span className="flex-1 font-bold">{BY_ID[id].e} {BY_ID[id].l}</span>
            <button type="button" onClick={() => setList(moveStep(list, i, -1))} disabled={i === 0} aria-label={`הזיזו את ${BY_ID[id].l} למעלה`} className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-[var(--border)] font-bold disabled:opacity-30">▲</button>
            <button type="button" onClick={() => setList(moveStep(list, i, 1))} disabled={i === list.length - 1} aria-label={`הזיזו את ${BY_ID[id].l} למטה`} className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-[var(--border)] font-bold disabled:opacity-30">▼</button>
            <button type="button" onClick={() => remove(i)} aria-label={`הסירו את ${BY_ID[id].l}`} className="min-h-[44px] min-w-[44px] rounded-lg border-2 border-[var(--border)] font-bold">✕</button>
          </li>)}
        </ol>
      </div>}
      <Choice label="עיצוב הלוח" value={layout} onChange={setLayout} options={[['list', 'רשימה עם תיבות סימון'], ['cards', 'לוח וכרטיסים לגזירה']]} />
      {layout === 'list' && <Choice label="ימי השבוע" value={days} onChange={setDays} options={[['no', 'תיבה אחת לכל משימה'], ['yes', 'עמודה לכל יום בשבוע']]} />}
      <Choice label="צבע" value={color} onChange={setColor} options={[['yes', 'צבעוני'], ['no', 'חסכוני בדיו']]} />
    </div>}
    pages={pages} printTitle="לוח שגרת בוקר וערב"
    lead={<p className="mx-auto mb-6 max-w-2xl text-center text-sm">מחפשים משהו שרץ על המסך, עם טיימר? יש גם <Link to="/family/morning-routine" className="font-bold underline">שגרת בוקר עם טיימר</Link>.</p>}
    paragraphs={[
      'שגרה קבועה עוזרת לילדים לדעת מה קורה עכשיו ומה בא אחר כך, ומורידה הרבה מהצעקות של "יאללה, מהר!". לוח עם תמונות מחליף את ההזכרות החוזרות: במקום שאתם תגידו שוב ושוב "לצחצח שיניים", הילד מסתכל על הלוח ובודק לבד מה השלב הבא.',
      'בעמוד הזה בונים לוח משלכם. בוחרים בוקר, ערב או שניהם, מסמנים את המשימות שמתאימות לבית שלכם מתוך רשימה של 18 משימות נפוצות, מסדרים אותן בחצים ומוסיפים את שם הילד. אפשר להדפיס רשימה אנכית עם תיבת סימון לכל משימה, להוסיף עמודה לכל יום בשבוע כדי לעקוב לאורך שבוע שלם, או להדפיס לוח עם משבצות ממוספרות וכרטיסים לגזירה שמצמידים בסקוץ׳. הלוח כאן מסדר את הרצף של הבוקר והערב; לטבלת מטלות, צחצוח שיניים ולוח מדבקות יש את דפי הלוחות לבית.',
      'הלוח מיועד לגילאי 3 עד 8. לילדים צעירים עדיף לוח עם כרטיסים: הם מזיזים בעצמם כרטיס אחרי כרטיס, וזו פעולה פיזית שמחזיקה את תשומת הלב. לילדים בגיל בית הספר מתאימה רשימה עם תיבות סימון או עם עמודות לימי השבוע.',
      'טיפים להורים: התחילו במעט משימות. לילדים בני 3–4 מספיקות שלוש או ארבע, ולילדים גדולים יותר אפשר להגיע לשבע או שמונה. הוסיפו משימה חדשה רק כשהקודמות כבר זורמות. תלו את הלוח בגובה העיניים של הילד, ליד המקום שבו הוא מתארגן. כדאי לבנות אותו יחד עם הילד, כדי שירגיש שהוא שותף ולא שמישהו מפעיל אותו.',
      'לא חייבים פרסים. סימון ✓ אחרי כל משימה הוא כבר סיפוק קטן, ומילה טובה בסוף מספיקה. אם בכל זאת רוצים תגמול על שבוע טוב, אפשר להוסיף לוח נפרד של פרסים. ואם משימה מסוימת תקועה שבועיים, אל תכעסו על הילד: בדקו אם היא מובנת, אם היא באה בזמן הנכון ואם אפשר לפצל אותה לשני שלבים קטנים.',
    ]}
    faq={[
      { q: 'כמה משימות כדאי לשים בלוח?', a: 'לילדים בני 3–4 שלוש עד ארבע משימות, לבני 5–6 ארבע עד שש, ולילדים בכיתות א׳–ב׳ עד שמונה. בלוח אפשר לשים עד 12 משימות, אבל פחות זה בדרך כלל יותר.' },
      { q: 'הילד שלי עדיין לא יודע לקרוא. זה מתאים?', a: 'כן. ליד כל משימה יש תמונה גדולה, והלוח בנוי כך שאפשר להבין אותו בלי לקרוא. מומלץ לעבור על הלוח יחד בפעם הראשונה ולהסביר כל תמונה.' },
      { q: 'מה ההבדל בין רשימה לכרטיסים?', a: 'ברשימה מסמנים ✓ בעט או בטוש בתיבה ליד כל משימה, ואפשר להוסיף עמודה לכל יום בשבוע. בגרסת הכרטיסים מקבלים לוח עם משבצות ממוספרות וכרטיסים לגזירה, מדביקים פס סקוץ׳ ומזיזים כרטיס אחרי כרטיס. לילדים קטנים זה נוח יותר.' },
      { q: 'אפשר להדפיס גם בוקר וגם ערב?', a: 'כן. בוחרים "שניהם" ומקבלים דף לבוקר ודף לערב, ואפשר לערוך את המשימות של כל אחד מהם בנפרד.' },
      { q: 'איך מחזיקים את הלוח לאורך זמן?', a: 'מכסים בנייר דבק שקוף או במלמינציה, ומסמנים במרקר מחיק. אפשר גם להדפיס כל שבוע דף חדש, ויש אפשרות להדפיס בחיסכון בדיו.' },
      { q: 'מה אם הילד מסרב להשתמש בלוח?', a: 'נסו לבנות אותו יחד: שיבחר את הצבע, יסדר את המשימות ויוסיף מדבקה אחרי כל משימה. אם עדיין קשה, צמצמו את מספר המשימות והתחילו מהקל ביותר.' },
    ]}
    related={[{ label: 'לוחות לבית: מטלות וצחצוח שיניים', href: '/printables/home-charts' }, { label: 'שגרת בוקר עם טיימר', href: '/family/morning-routine' }, { label: 'לוח תגמולים', href: '/printables/reward-chart' }, { label: 'דמי כיס וחיסכון', href: '/family/pocket-money' }, { label: 'דפים להדפסה', href: '/printables' }]}
  />
}

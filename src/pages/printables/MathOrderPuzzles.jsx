import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import PrintableShell, { Choice, Field } from '../../components/printables/PrintableShell'
import QuickAnswer from '../../components/ui/QuickAnswer'
import OrderPuzzleSheet from '../../components/math/OrderPuzzleSheet'
import { THEMES, THEME_KEYS } from '../../components/math/orderPuzzleThemes'
import { orderSheet, opsFor, OPS, RANGES, COUNTS } from '../../utils/orderPuzzles'
import { newSeed } from '../../utils/mathSheets'

// "פותרים ומסדרים": solve the exercises, then write the results in order on a picture
// (train wagons, stairs, a caterpillar, bubbles, a rocket, stepping stones, a flower or a tower).
// One generator, five indexable pages that only differ in their starting settings and copy.
// The child's name is typed on screen only — it lives in React state and is never stored or sent.

const BASE = '/printables/math-order-puzzles'
const L = t => <bdi dir="ltr">{t}</bdi> // maths inside Hebrew text

const PRESETS = {
  hub: {
    path: BASE, range: 20, op: 'mix', count: 8,
    seoTitle: 'דפי עבודה בחשבון להדפסה: פותרים ומסדרים מהקטן לגדול',
    h1: 'פותרים ומסדרים — דפי עבודה בחשבון',
    sub: 'פותרים תרגילים, ואז כותבים את התוצאות לפי הסדר על ציור — רכבת, מדרגות, זחל, טיל ועוד',
    desc: 'דפי עבודה בחשבון להדפסה בחינם: פותרים חיבור, חיסור או כפל ומסדרים את התוצאות מהקטן לגדול על ציור לצביעה. 8 נושאים, עד 10, עד 20, עד 100 ולוח הכפל — דף חדש בכל לחיצה, עם מקום לשם ודף פתרונות.',
    crumb: 'פותרים ומסדרים', grade: 'גן חובה – כיתה ג׳',
    q: 'מה זה דף "פותרים ומסדרים"?',
    a: 'דף עבודה בשני שלבים: קודם הילד פותר 6–10 תרגילים, ואחר כך כותב את התוצאות לפי הסדר — מהקטן לגדול או מהגדול לקטן — בתוך ציור: קרונות של רכבת, מדרגות, בועות או עלי כותרת. כל התוצאות בדף שונות, ולכן יש רק סדר נכון אחד.',
  },
  'up-to-10': {
    path: `${BASE}/up-to-10`, range: 10, op: '+', count: 6,
    seoTitle: 'חיבור עד 10 — מסדרים מהקטן לגדול | דף עבודה לגן חובה וכיתה א׳',
    h1: 'חיבור וחיסור עד 10 — פותרים ומסדרים',
    sub: 'לגן חובה ולתחילת כיתה א׳ · 6 עד 10 תרגילים · מסדרים את התוצאות על ציור',
    desc: 'דף עבודה בחשבון לגן חובה ולכיתה א׳: חיבור וחיסור עד 10, ואז מסדרים את התוצאות מהקטן לגדול בקרונות, במדרגות או על הזחל. להדפסה בחינם, עם מקום לשם ודף פתרונות.',
    crumb: 'עד 10', grade: 'גן חובה – כיתה א׳',
    q: 'איך עובד דף "פותרים ומסדרים" עד 10?',
    a: <>הילד פותר תרגילים קצרים כמו {L('3 + 4')} או {L('9 − 5')}, ואז מסדר את התוצאות מהקטן לגדול על הציור. מתחילים ב-6 תרגילים בחיבור בלבד, ועוברים ל-8 ו-10 תרגילים ולחיסור כשהילד בטוח.</>,
  },
  'up-to-20': {
    path: `${BASE}/up-to-20`, range: 20, op: 'mix', count: 10,
    seoTitle: 'חיבור וחיסור עד 20 – מסדרים מהקטן לגדול | דפי עבודה לכיתה א׳',
    h1: 'חיבור וחיסור עד 20 — מסדרים מהקטן לגדול',
    sub: 'דפי עבודה לכיתה א׳ · מעבר עשרת · 10 תרגילים ותוצאות לסידור על ציור',
    desc: 'דפי עבודה חיבור וחיסור עד 20 לכיתה א׳ להדפסה: פותרים 10 תרגילים (רובם עם מעבר עשרת) ומסדרים את התוצאות מהקטן לגדול על רכבת, מדרגות או פרח. דף חדש בכל לחיצה, מילה סודית לבדיקה עצמית ודף פתרונות.',
    crumb: 'חיבור וחיסור עד 20', grade: 'כיתה א׳',
    q: 'מה מתרגלים בדף חיבור וחיסור עד 20 עם סידור?',
    a: <>שני דברים בבת אחת: חישוב עם מעבר עשרת (כמו {L('8 + 5')} או {L('14 − 6')}) והשוואת מספרים עד 20. אחרי הפתרון הילד מחפש את התוצאה הכי קטנה, אחריה את הבאה, וכך הלאה — וזו כבר חשיבה על סדר המספרים.</>,
  },
  'up-to-100': {
    path: `${BASE}/up-to-100`, range: 100, op: 'mix', count: 10,
    seoTitle: 'חיבור וחיסור עד 100 — פותרים ומסדרים | דף עבודה לכיתה ב׳',
    h1: 'חיבור וחיסור עד 100 — פותרים ומסדרים',
    sub: 'לכיתה ב׳ · מספרים דו-ספרתיים · מסדרים מהקטן לגדול או מהגדול לקטן',
    desc: 'דפי עבודה בחשבון לכיתה ב׳: חיבור וחיסור עד 100 ואז סידור התוצאות מהקטן לגדול או מהגדול לקטן על ציור — טיל, מגדל, אבנים בנחל ועוד. להדפסה בחינם, עם פתרונות.',
    crumb: 'חיבור וחיסור עד 100', grade: 'כיתה ב׳',
    q: 'למה לסדר תוצאות עד 100?',
    a: <>בכיתה ב׳ הילדים לומדים להשוות מספרים דו-ספרתיים לפי העשרות ואז לפי האחדות. כשהתוצאות הן, למשל, {L('47')}, {L('74')} ו-{L('41')}, הסידור מכריח להסתכל על שתי הספרות — בדיוק המיומנות שצריך.</>,
  },
  multiplication: {
    path: `${BASE}/multiplication`, range: 'mul', op: 'x', count: 10,
    seoTitle: 'לוח הכפל — פותרים ומסדרים מהקטן לגדול | דף עבודה לכיתה ג׳',
    h1: 'כפל וחילוק — פותרים ומסדרים',
    sub: 'לכיתות ב׳–ג׳ · לוח הכפל עד 100 · כפל, חילוק בלי שארית או שניהם',
    desc: 'דפי עבודה בלוח הכפל לכיתה ג׳ להדפסה: פותרים 10 תרגילי כפל או חילוק ומסדרים את התוצאות לפי הסדר על ציור — רכבת, זחל, טיל או מגדל. דף חדש בכל לחיצה ודף פתרונות.',
    crumb: 'כפל וחילוק', grade: 'כיתות ב׳–ג׳',
    q: 'איך מתרגלים את לוח הכפל בדף "פותרים ומסדרים"?',
    a: <>פותרים 10 תרגילים כמו {L('7 × 8')} או {L('42 ÷ 6')}, ואז מסדרים את התוצאות. הסידור הוא בדיקה טבעית: אם יצא {L('7 × 8 = 54')}, הילד ישים לב שהמספר "לא מסתדר" בין השכנים שלו.</>,
  },
}
const SIBLINGS = [
  { href: BASE, label: '🧩 כל הדפים' },
  { href: `${BASE}/up-to-10`, label: 'עד 10' },
  { href: `${BASE}/up-to-20`, label: 'עד 20' },
  { href: `${BASE}/up-to-100`, label: 'עד 100' },
  { href: `${BASE}/multiplication`, label: '✖️ כפל וחילוק' },
]


const FAQ = [
  { q: 'לאיזה גיל מתאימים הדפים?', a: 'עד 10 — לגן חובה ולתחילת כיתה א׳; עד 20 — לכיתה א׳; עד 100 — לכיתה ב׳; לוח הכפל — לכיתות ב׳–ג׳. אפשר גם לבחור 6 תרגילים בלבד לילדים שצריכים דף קצר יותר, כולל בחינוך המיוחד.' },
  { q: 'מה עושים אם שתי תוצאות יוצאות זהות?', a: 'זה לא יכול לקרות: המחולל בוחר תרגילים שכל התוצאות שלהם שונות זו מזו, כך שיש סדר נכון אחד בלבד. אם לילד יצאו שתי תוצאות שוות — כנראה שאחד התרגילים לא נפתר נכון, וזו הזדמנות טובה לבדוק.' },
  { q: 'מה זו "המילה הסודית"?', a: 'ליד כל תרגיל מופיעה אות. כשהילד מעתיק את האותיות לפי סדר התוצאות בציור, נוצרת מילה או צירוף כמו "חשבון זה כיף". אם יצאה מילה אמיתית — הסידור נכון. זו בדיקה עצמית שהילד עושה לבד, בלי מבוגר.' },
  { q: 'אפשר לכתוב את שם הילד על הדף?', a: 'כן. כותבים את השם בתיבה ליד ההגדרות והוא מודפס על הקו של "שם". השם נשאר רק במחשב או בטלפון שלכם — הוא לא נשמר ולא נשלח לשום מקום. אפשר גם להשאיר ריק ולכתוב ביד.' },
  { q: 'איך מדפיסים חבילה של כמה דפים?', a: 'בוחרים "כמה דפים" (3, 5 או 10). כל דף בחבילה מקבל תרגילים אחרים, ואם בוחרים "ערבוב" — גם ציור אחר. דפי הפתרונות מודפסים בסוף החבילה, כך שקל להוציא אותם לפני שמחלקים לילדים.' },
  { q: 'יש דף פתרונות?', a: 'כן. בהגדרה "פתרונות" בוחרים "עם דף פתרונות", ובסוף ההדפסה מופיע דף עם כל התשובות בצבע: התוצאות, הסדר בציור והמילה הסודית.' },
]

const PARAGRAPHS = [
  'דפי "פותרים ומסדרים" משלבים שתי מיומנויות של שיעורי חשבון בבית הספר היסודי: חישוב, והשוואה וסידור של מספרים. קודם הילד פותר את התרגילים בראש הדף, ואז מחפש את התוצאה הכי קטנה, אחריה את הבאה, וכותב אותן לפי הסדר במשבצות שבציור. הציור נותן לסדר משמעות: הקרון הראשון אחרי הקטר, המדרגה התחתונה, הבועה שליד הדג.',
  'למורות ולגננות: אפשר להדפיס חבילה של 3, 5 או 10 דפים שונים בבת אחת — מתאים לעבודה בתחנות, לשיעורי בית או לילד שסיים מוקדם. בבחירת "ערבוב" כל דף מקבל ציור אחר, כך ששני ילדים שיושבים זה ליד זה לא פותרים את אותו דף. דפי הפתרונות מודפסים בסוף.',
  'להורים: דף אחד ביום מספיק. אם הילד מתקשה בסידור, הדליקו את "רמזים בציור" — ליד המשבצת הראשונה והאחרונה ייכתב "הכי קטן" ו"הכי גדול". אפשר גם להתחיל בסידור בלבד: לפתור יחד את התרגילים, ולתת לילד לסדר לבד.',
  'כל הציורים הם קווים פשוטים בשחור-לבן, כך שהדף נראה טוב גם במדפסת ביתית בלי צבע, ואחרי שמסיימים אפשר לצבוע אותו. המספרים בתרגילים כתובים משמאל לימין, כמו במחברת החשבון.',
]

const RELATED = [
  { label: 'דפי עבודה בחשבון — חיבור, חיסור ולוח הכפל', href: '/printables/math-worksheets' },
  { label: 'שבילים בחשבון', href: '/printables/math-paths' },
  { label: 'צביעה לפי תשובות', href: '/printables/color-by-answer' },
  { label: 'סרגל מספרים לשולחן', href: '/printables/number-strip' },
  { label: 'סרגלי כפולות', href: '/printables/multiplication-strips' },
  { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' },
]

const DIRS = [['asc', 'מהקטן לגדול'], ['desc', 'מהגדול לקטן']]
const TWISTS = [['word', '🔤 מילה סודית'], ['edges', '➕ ראשון + אחרון'], ['none', 'בלי']]
const PACKS = [1, 3, 5, 10]

function Label({ children }) { return <p className="text-center font-bold">{children}</p> }

export default function MathOrderPuzzles() {
  const { slug } = useParams()
  const key = slug || 'hub'
  const p = PRESETS[key]
  const [range, setRange] = useState(p?.range ?? 20)
  const [op, setOp] = useState(p?.op ?? 'mix')
  const [count, setCount] = useState(p?.count ?? 8)
  const [dir, setDir] = useState('asc')
  const [theme, setTheme] = useState('train')
  const [clues, setClues] = useState(true)
  const [twist, setTwist] = useState('word')
  const [answers, setAnswers] = useState(true)
  const [pack, setPack] = useState(1)
  const [name, setName] = useState('')
  const [seed, setSeed] = useState(() => newSeed())
  // Moving between the preset pages (same component): start from that page's settings.
  const [shown, setShown] = useState(key)
  if (shown !== key && p) { setShown(key); setRange(p.range); setOp(p.op); setCount(p.count); setSeed(newSeed()) }

  const pickRange = r => { setRange(r); if (!opsFor(r).includes(op)) setOp(opsFor(r)[0]); setSeed(newSeed()) }
  const fresh = fn => v => { fn(v); setSeed(newSeed()) }

  const pages = useMemo(() => {
    const qs = [], keys = []
    for (let i = 0; i < pack; i++) {
      const s = seed + i * 7919
      const th = theme === 'mix' ? THEME_KEYS[(seed + i) % THEME_KEYS.length] : theme
      const sheet = orderSheet({ range, op, count, dir, seed: s })
      const props = { sheet, theme: th, dir, clues, twist, name: name.trim() }
      qs.push({ key: `q${i}`, svg: <OrderPuzzleSheet {...props} /> })
      if (answers) keys.push({ key: `a${i}`, svg: <OrderPuzzleSheet {...props} answers /> })
    }
    return [...qs, ...keys]
  }, [range, op, count, dir, theme, clues, twist, answers, pack, name, seed])

  if (!p) return <Navigate to={BASE} replace />

  return <PrintableShell path={p.path} emoji="🧩" h1={p.h1} seoTitle={p.seoTitle} description={p.desc} sub={p.sub}
    crumbs={[{ label: 'חשבון', href: '/printables?topic=math' }, ...(key === 'hub' ? [] : [{ label: 'פותרים ומסדרים', href: BASE }])]}
    siblings={SIBLINGS}
    lead={<QuickAnswer q={p.q} a={p.a} updated="2026-10-24" rows={[['גיל', p.grade], ['בכל דף', '6, 8 או 10 תרגילים + ציור לסידור'], ['נושאים', Object.values(THEMES).map(t => t.name).join(', ')], ['מחיר', 'חינם, בלי הרשמה, עם דף פתרונות']]} />}
    controls={<>
      <Label>ציור</Label>
      <Choice label="ציור" value={theme} onChange={setTheme} options={[...THEME_KEYS.map(k => [k, `${THEMES[k].emoji} ${THEMES[k].name}`]), ['mix', '🔀 ערבוב']]} />
      <Label>תחום ופעולה</Label>
      <Choice label="תחום" value={range} onChange={pickRange} options={Object.entries(RANGES).map(([k, l]) => [k === 'mul' ? 'mul' : Number(k), l])} />
      <Choice label="פעולה" value={op} onChange={fresh(setOp)} options={opsFor(range).map(o => [o, OPS[o]])} />
      <Label>כמה תרגילים ובאיזה סדר</Label>
      <Choice label="מספר תרגילים" value={count} onChange={fresh(setCount)} options={COUNTS.map(c => [c, `${c} תרגילים`])} />
      <Choice label="סדר" value={dir} onChange={setDir} options={DIRS} />
      <Label>עזרה ובדיקה עצמית</Label>
      <Choice label="רמזים בציור" value={clues ? 'on' : 'off'} onChange={v => setClues(v === 'on')} options={[['on', 'עם רמזים (הכי קטן / הכי גדול)'], ['off', 'בלי רמזים']]} />
      <Choice label="בדיקה עצמית" value={twist} onChange={setTwist} options={TWISTS} />
      <Field label="שם הילד/ה (לא חובה — נשאר רק אצלכם)" value={name} onChange={setName} placeholder="למשל: נועה" maxLength={22} />
      <Label>הדפסה</Label>
      <Choice label="כמה דפים" value={pack} onChange={setPack} options={PACKS.map(n => [n, n === 1 ? 'דף אחד' : `${n} דפים שונים`])} />
      <Choice label="פתרונות" value={answers ? 'yes' : 'no'} onChange={v => setAnswers(v === 'yes')} options={[['yes', 'עם דף פתרונות'], ['no', 'בלי פתרונות']]} />
      <div className="text-center"><button type="button" onClick={() => setSeed(newSeed())} className="min-h-[44px] wobbly-sm border-2 border-[var(--border)] bg-white px-5 py-2 font-bold">🎲 דף חדש</button></div>
    </>}
    pages={pages} copies={false} printTitle={`פותרים ומסדרים — ${p.crumb}`} onRefresh={() => setSeed(newSeed())}
    paragraphs={PARAGRAPHS} faq={FAQ} related={RELATED} />
}

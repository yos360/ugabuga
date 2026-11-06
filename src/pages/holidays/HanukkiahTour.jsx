import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HanukkahShell from '../../components/hanukkah/HanukkahShell'
import MiniHanukkiah from '../../components/hanukkah/MiniHanukkiah'
import { Page, FONT } from '../../components/holidays/printKit'
import { TOUR_NIGHTS, TOUR_MISSIONS, flamesOnNight, formatNightDate } from '../../data/hanukkiahTour'

// /holidays/hanukkah/hanukkiah-tour: a family game for the evenings of Hanukkah — walk the
// neighbourhood, count the hanukkiot in the windows, tick off spotting missions, and finish with a
// scout certificate. Three A4 pages (missions, a tally table for all eight nights, certificate)
// plus an on-screen counter that remembers the count per night in this browser only.
const PATH = '/holidays/hanukkah/hanukkiah-tour'
const STORE = 'ugabuga-hanukkiah-tour'

const T = ({ x, y, size = 16, weight = 700, fill = '#111', children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} direction="rtl">{children}</text>

// Split a mission into short lines so it fits inside its square.
const wrap = (text, max = 13) => text.split(' ').reduce((lines, w) => {
  const last = lines[lines.length - 1]
  if (last && (last + ' ' + w).length <= max) lines[lines.length - 1] = last + ' ' + w
  else lines.push(w)
  return lines
}, [])

function MissionsPage({ color }) {
  const fills = ['#dbeafe', '#fef3c7', '#fce7f3']
  return <Page title="סיור חנוכיות — משימות הסייר" sub="מוצאים בסיור, ומסמנים ✓ בריבוע הקטן">
    {TOUR_MISSIONS.map((m, i) => {
      const col = i % 3, row = Math.floor(i / 3)
      const x = 405 - col * 175, y = 130 + row * 175, lines = wrap(m.text)
      return <g key={m.id}>
        <rect x={x} y={y} width="160" height="160" rx="16" fill={color ? fills[(i + row) % 3] : 'white'} stroke="#111" strokeWidth="3" />
        <rect x={x + 122} y={y + 10} width="28" height="28" rx="5" fill="white" stroke="#111" strokeWidth="2.5" />
        <text x={x + 34} y={y + 48} textAnchor="middle" fontSize="34">{m.emoji}</text>
        {lines.map((l, j) => <T key={j} x={x + 80} y={y + 92 + j * 22 - (lines.length - 1) * 6} size={17} weight={800}>{l}</T>)}
      </g>
    })}
    <T x={300} y={680} size={17} weight={800}>כמה משימות מצאתם? ______ מתוך 9</T>
    <T x={300} y={716} size={15} weight={400}>מסתכלים מהמדרכה בלבד: לא נכנסים לחצרות, לא נוגעים בחנוכיות</T>
    <T x={300} y={740} size={15} weight={400}>ולא מצלמים אנשים בתוך הבתים. יוצאים תמיד עם מבוגר.</T>
  </Page>
}

// The tally table runs right to left: night, date, candles tonight, hanukkiot counted, the special one.
const COLS = [{ x: 575, w: 60, h: 'ערב' }, { x: 515, w: 70, h: 'תאריך' }, { x: 445, w: 110, h: 'נרות בכל חנוכייה' }, { x: 335, w: 120, h: 'כמה חנוכיות ספרנו?' }, { x: 215, w: 190, h: 'החנוכייה הכי מיוחדת' }]
function TallyPage({ color }) {
  const top = 128, rowH = 58
  return <Page title="סיור חנוכיות — טבלת הספירה" sub="בכל ערב סופרים את החנוכיות בחלונות וכותבים בטבלה">
    {COLS.map((c, i) => <g key={c.h}>
      <rect x={c.x - c.w} y={top} width={c.w} height="44" fill={color ? '#bfdbfe' : 'white'} stroke="#111" strokeWidth="2" />
      <T x={c.x - c.w / 2} y={top + 28} size={i === 2 || i === 3 ? 12.5 : 14} weight={800}>{c.h}</T>
    </g>)}
    {TOUR_NIGHTS.map((night, r) => {
      const y = top + 44 + r * rowH
      return <g key={night.n}>
        {COLS.map((c, i) => <rect key={i} x={c.x - c.w} y={y} width={c.w} height={rowH} fill={color && r % 2 ? '#f8fafc' : 'white'} stroke="#111" strokeWidth="2" />)}
        <T x={545} y={y + 37} size={26} weight={900}>{night.n}</T>
        <T x={480} y={y + 28} size={15} weight={800}>{formatNightDate(night.date)}</T>
        <T x={480} y={y + 46} size={11} weight={400}>{night.day}</T>
        <T x={390} y={y + 26} size={15} weight={800}>{night.n === 1 ? 'נר אחד' : `${night.n} נרות`}</T>
        <T x={390} y={y + 46} size={13} weight={400}>{`+ שמש = ${flamesOnNight(night.n)} להבות`}</T>
      </g>
    })}
    <T x={300} y={top + 44 + 8 * rowH + 36} size={17} weight={800}>בכל ערבי החג ספרנו בסך הכול: ________ חנוכיות</T>
    <T x={300} y={top + 44 + 8 * rowH + 72} size={15} weight={400}>אתגר: בערב ה־___ ספרנו ___ חנוכיות, ובכל אחת דלקו ___ להבות.</T>
    <T x={300} y={top + 44 + 8 * rowH + 98} size={15} weight={400}>כמה להבות ראינו באותו ערב? ________</T>
  </Page>
}

function CertificatePage({ color }) {
  return <Page>
    <rect x="30" y="30" width="540" height="760" rx="24" fill={color ? '#eff6ff' : 'white'} stroke="#111" strokeWidth="5" />
    <rect x="48" y="48" width="504" height="724" rx="16" fill="none" stroke={color ? '#f6c453' : '#111'} strokeWidth="3" strokeDasharray="10 7" />
    {[[90, 100], [510, 100], [90, 720], [510, 720]].map(([x, y]) => <text key={x + '' + y} x={x} y={y} textAnchor="middle" fontSize="30">⭐</text>)}
    <T x={300} y={150} size={44} weight={900}>תעודת סייר חנוכיות</T>
    <T x={300} y={192} size={18} weight={400}>חנוכה תשפ״ז</T>
    <MiniHanukkiah x={180} y={330} w={240} lit={8} color={color} />
    <T x={300} y={440} size={22} weight={700}>התעודה מוענקת ל:</T>
    <path d="M140 500 H460" stroke="#111" strokeWidth="2" />
    <T x={300} y={560} size={20} weight={400}>שיצאו לסיור חנוכיות בשכונה,</T>
    <T x={300} y={598} size={20} weight={400}>סיירו ב־______ ערבים</T>
    <T x={300} y={636} size={20} weight={400}>וספרו ______ חנוכיות!</T>
    <T x={300} y={700} size={24} weight={900}>חנוכה שמח 🕎</T>
  </Page>
}

const PAGES = [
  { id: 'missions', name: 'דף 1: משימות הסייר', C: MissionsPage },
  { id: 'tally', name: 'דף 2: טבלת ספירה ל־8 ערבים', C: TallyPage },
  { id: 'certificate', name: 'דף 3: תעודת סייר', C: CertificatePage },
]

const load = () => {
  try { const v = JSON.parse(localStorage.getItem(STORE)); if (v && typeof v === 'object') return v } catch { /* storage blocked */ }
  return {}
}

// On-screen counter for the walk itself: pick tonight's night, tap +1 for every hanukkiah.
function TourCounter() {
  const [state, setState] = useState(() => ({ night: 1, counts: {}, done: [], ...load() }))
  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(state)) } catch { /* storage blocked */ } }, [state])
  const count = state.counts[state.night] || 0
  const total = Object.values(state.counts).reduce((a, b) => a + b, 0)
  const flames = flamesOnNight(state.night)
  const add = d => setState(s => ({ ...s, counts: { ...s.counts, [s.night]: Math.max(0, (s.counts[s.night] || 0) + d) } }))
  const toggle = id => setState(s => ({ ...s, done: s.done.includes(id) ? s.done.filter(x => x !== id) : [...s.done, id] }))
  const chip = on => `min-h-[44px] min-w-[44px] rounded-full border-2 px-3 font-bold ${on ? 'border-slate-800 bg-blue-200' : 'border-[var(--border)] bg-white'}`
  return <section className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby="counter-h">
    <h2 id="counter-h" className="mb-1 text-2xl font-bold">📱 סופרים בטלפון תוך כדי הסיור</h2>
    <p className="mb-4 text-[var(--muted-foreground)]">בוחרים את הערב, ולוחצים +1 על כל חנוכייה שרואים. הספירה נשמרת רק בדפדפן הזה.</p>
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="איזה ערב של חנוכה">
      {TOUR_NIGHTS.map(n => <button key={n.n} type="button" aria-pressed={state.night === n.n} onClick={() => setState(s => ({ ...s, night: n.n }))} className={chip(state.night === n.n)}>
        ערב {n.n} <span className="text-sm font-normal">({formatNightDate(n.date)})</span>
      </button>)}
    </div>
    <div className="mb-3 flex items-center justify-center gap-4">
      <button type="button" onClick={() => add(-1)} aria-label="להוריד חנוכייה אחת" className="min-h-[56px] min-w-[56px] rounded-2xl border-2 border-slate-800 bg-white text-2xl font-bold">−</button>
      <p className="min-w-[8rem] text-center" aria-live="polite"><span className="block text-6xl font-black tabular-nums">{count}</span><span className="font-bold">חנוכיות הערב</span></p>
      <button type="button" onClick={() => add(1)} aria-label="ראינו עוד חנוכייה" className="min-h-[56px] min-w-[72px] rounded-2xl bg-blue-700 px-4 text-2xl font-bold text-white">+1</button>
    </div>
    <p className="mb-1 text-center text-lg">בערב {state.night} דולקים בכל חנוכייה {state.night === 1 ? 'נר אחד' : `${state.night} נרות`} ועוד השמש — {flames} להבות.</p>
    <p className="mb-4 text-center text-lg font-bold">{count > 0 ? `${count} חנוכיות × ${flames} להבות = ${count * flames} להבות ראיתם הערב!` : 'עוד לא ספרתם חנוכיות הערב.'}</p>
    <p className="mb-4 text-center">בכל ערבי החג עד עכשיו: <b>{total}</b> חנוכיות</p>
    <h3 className="mb-2 text-xl font-bold">✓ משימות הסייר ({state.done.length} מתוך {TOUR_MISSIONS.length})</h3>
    <ul className="grid gap-2 sm:grid-cols-2">
      {TOUR_MISSIONS.map(m => <li key={m.id}>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border-2 border-[var(--border)] px-3 py-2">
          <input type="checkbox" className="h-5 w-5" checked={state.done.includes(m.id)} onChange={() => toggle(m.id)} />
          <span>{m.emoji} {m.text}</span>
        </label>
      </li>)}
    </ul>
    {state.done.length === TOUR_MISSIONS.length && <p className="mt-4 rounded-xl bg-yellow-100 p-3 text-center text-lg font-bold">🏅 כל המשימות הושלמו! הגיע הזמן להדפיס את תעודת הסייר.</p>}
  </section>
}

const FAQ = [
  { q: 'מה זה סיור חנוכיות?', a: 'יוצאים בערב של חנוכה, אחרי שמדליקים את הנרות בבית, ומטיילים ברגל בשכונה. מסתכלים על החנוכיות שדולקות בחלונות ובכניסות לבתים, סופרים אותן ומחפשים חנוכיות מיוחדות. זה מנהג יפה כי מניחים את החנוכייה בחלון או ליד הפתח שפונה לרחוב — כדי לפרסם את נס החנוכה לכל מי שעובר.' },
  { q: 'מתי כדאי לצאת לסיור?', a: 'מיד אחרי ההדלקה בבית, כשהנרות בכל הבתים כבר דולקים. הנרות דולקים לפחות חצי שעה, אז זה הזמן הכי טוב. בשנת 2026 הנר הראשון נדלק ביום שישי, 4 בדצמבר, והנר השמיני ב־11 בדצמבר. בערבי שישי מדליקים לפני כניסת השבת, ובמוצאי שבת — אחרי צאת השבת.' },
  { q: 'לאיזה גיל מתאים הסיור, ואיך שומרים על בטיחות?', a: 'לכל המשפחה, מגיל גן ועד כיתה ו׳. ילדי גן סופרים ומסמנים משימות, וילדים גדולים יותר פותרים גם את אתגר הלהבות (חנוכיות כפול להבות). תמיד יוצאים עם מבוגר, הולכים על המדרכה עם פנס, מסתכלים מרחוק בלבד — לא נכנסים לחצרות, לא נוגעים בחנוכיות ולא מצלמים אנשים בתוך הבתים.' },
]

export default function HanukkiahTour() {
  const [color, setColor] = useState(true), [print, setPrint] = useState(null)
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-blue-200' : 'border-[var(--border)] bg-white'}`
  return <HanukkahShell crumb="סיור חנוכיות">
    <SEO title="סיור חנוכיות בשכונה עם ילדים — משחק, טבלת ספירה ותעודה להדפסה" description="סיור חנוכיות בשכונה לכל המשפחה: דף משימות לסייר, טבלת ספירה לשמונת ערבי חנוכה 2026, תעודת סייר חנוכיות להדפסה, ומונה בטלפון שסופר חנוכיות ולהבות. בחינם, גם בגרסה לצביעה." path={PATH} structuredData={faqSchema(FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🔦 סיור חנוכיות בשכונה</h1>
    <p className="mx-auto mb-5 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">משחק משפחתי לערבי חנוכה: יוצאים לטיול קצר אחרי ההדלקה, סופרים חנוכיות בחלונות, מחפשים את המשימות — ובסוף מקבלים תעודת סייר.</p>
    <div className="mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="גרסה">
      <button type="button" aria-pressed={color} onClick={() => setColor(true)} className={chip(color)}>🎨 צבעונית</button>
      <button type="button" aria-pressed={!color} onClick={() => setColor(false)} className={chip(!color)}>🖍️ לצביעה (קווים בלבד)</button>
    </div>
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      <button data-print-main type="button" onClick={() => setPrint({ color, pages: PAGES })} className="min-h-[52px] rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white">🖨️ הדפסת 3 הדפים</button>
    </div>
    <div className="mx-auto mb-10 grid max-w-4xl gap-4 sm:grid-cols-3">
      {PAGES.map(p => <button key={p.id} type="button" onClick={() => setPrint({ color, pages: [p] })} aria-label={`הדפסה: ${p.name}`}
        className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
        <div className="aspect-[600/820]"><p.C color={color} /></div>
        <p className="mt-1 font-bold">{p.name}</p>
      </button>)}
    </div>

    <TourCounter />

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-blue-50 p-5">
      <h2 className="mb-3 text-2xl font-bold">🗺️ איך יוצאים לסיור</h2>
      <ol className="list-decimal space-y-2 pr-6 text-lg">
        <li>מדפיסים את דף המשימות ואת טבלת הספירה, ומצמידים אותם ללוח כתיבה או לקרטון עם עיפרון.</li>
        <li>מדליקים נרות בבית, ויוצאים מיד אחרי ההדלקה — אז החנוכיות דולקות בכל השכונה.</li>
        <li>הולכים מסלול קצר של רבע שעה עד חצי שעה. כל ילד סופר חנוכיות בצד אחר של הרחוב.</li>
        <li>בבית כותבים בטבלה כמה חנוכיות ספרתם, ובוחרים את החנוכייה הכי מיוחדת של הערב.</li>
        <li>אחרי הערב האחרון סוכמים את כל הערבים וממלאים את תעודת הסייר.</li>
      </ol>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="mb-3 text-2xl font-bold">🧮 אתגר הלהבות לגדולים</h2>
      <p className="mb-2 text-lg">בכל ערב דולקים בכל חנוכייה מספר הנרות של הערב ועוד השמש. בערב השלישי, למשל, דולקים 3 נרות ועוד שמש — 4 להבות.</p>
      <p className="text-lg">אם ספרתם 6 חנוכיות בערב השלישי, ראיתם 6 × 4 = 24 להבות. כמה להבות תראו בערב השמיני, כשבכל חנוכייה דולקות 9?</p>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
      <h2 className="mb-3 text-2xl font-bold">🦺 בטיחות בסיור</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li>יוצאים תמיד עם מבוגר, הולכים על המדרכה וחוצים רק במעבר חצייה.</li>
        <li>לוקחים פנס או בגד זוהר, כי בחורף מחשיך מוקדם.</li>
        <li>מסתכלים מרחוק: לא נכנסים לחצרות, לא נוגעים בחנוכיות ולא מצלמים אנשים בתוך הבתים.</li>
      </ul>
    </section>

    {print && <PrintPreview title="סיור חנוכיות" onClose={() => setPrint(null)}>
      {print.pages.map(p => <article className="buga-a4" key={p.id}><div className="print-art"><p.C color={print.color} /></div></article>)}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לחנוכה: <Link className="font-bold underline" to="/holidays/hanukkah/cut-out-hanukkiah">חנוכייה לגזירה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/candle-times">זמני הדלקת נרות</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/what-to-do">מה עושים בחנוכה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'סיור חנוכיות בשכונה הוא אחת הפעילויות הכי פשוטות ויפות לערבי חנוכה: אחרי ההדלקה בבית יוצאים לטיול קצר ברגל, מסתכלים על החנוכיות שדולקות בחלונות ובכניסות לבתים, וסופרים אותן. מניחים את החנוכייה בחלון או ליד הפתח שפונה לרחוב כדי לפרסם את נס החנוכה — ולכן בערבי החג השכונה כולה מוארת.',
      'בעמוד יש שלושה דפים להדפסה: דף משימות עם תשעה דברים שמחפשים בדרך, טבלת ספירה לכל שמונת הערבים עם התאריכים של חנוכה 2026 ומספר הנרות בכל ערב, ותעודת סייר חנוכיות לסיום החג. בזמן הסיור אפשר לספור גם בטלפון — המונה מחשב כמה להבות ראיתם, וכך הסיור הופך גם לתרגול כפל קטן.',
    ]} faq={FAQ} related={[{ label: 'חנוכה לילדים', href: '/holidays/hanukkah' }, { label: 'חנוכייה להדפסה וגזירה', href: '/holidays/hanukkah/cut-out-hanukkiah' }, { label: 'מה עושים בחנוכה', href: '/holidays/hanukkah/what-to-do' }]} /></div>
  </HanukkahShell>
}

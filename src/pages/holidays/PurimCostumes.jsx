import { useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HolidayShell from '../../components/holidays/HolidayShell'
import { PURIM_H } from '../../holidays/purim'
import { COSTUME_FILTERS, PURIM_COSTUME_IDEAS, filterCostumes } from '../../data/purimCostumes'

// /holidays/purim/costumes — a filterable bank of homemade Purim costume ideas.
// Filters live in the query string (?ages=kinder&time=quick) so a filtered view can be shared;
// the prerendered page (no query) shows every idea.
const base = PURIM_H.base
const TOTAL = PURIM_COSTUME_IDEAS.length
const label = (key, id) => COSTUME_FILTERS.find(f => f.key === key).options.find(o => o.id === id)
const n = (key, id) => filterCostumes({ [key]: id }).length
const TYPE_TITLES = {
  solo: '🙋 תחפושות ליחיד',
  pair: '👫 תחפושות זוגיות ולאחים',
  family: '👨‍👩‍👧 תחפושות משפחתיות',
  group: '🏫 תחפושות קבוצתיות לגן ולכיתה',
}

const FAQ = [
  { q: 'איך מכינים תחפושת לפורים בבית?', a: 'מתחילים מהבגדים שיש בארון ומוסיפים פריט אחד שמסמן את הדמות — כתר, אוזניים, כובע, כנפיים או שלט. לכל רעיון כאן יש רשימת חומרים ו־3 עד 5 שלבים, ואפשר לסנן רק תחפושות שמכינים ממה שיש בבית.' },
  { q: 'מה התחפושת הכי מהירה לרגע האחרון?', a: `בסינון "רגע אחרון" יש ${n('time', 'quick')} רעיונות שמוכנים בכרבע שעה: חתול, פיראט, תייר, ליצן, מומיה, בלש, גיבור־על, פינגווין ועוד. רובם רק בגדים מהבית ופריט אחד מקרטון.` },
  { q: 'איזו תחפושת מתאימה לפעוט?', a: 'לפעוטות כדאי לבחור תחפושת רכה ונוחה: בגדים בצבע אחד עם קשת אוזניים או כובע — חתול, פרת משה רבנו, אבטיח, פינגווין או דבורה. בלי מסכה שמכסה את הפנים, בלי חלקים קטנים שאפשר לבלוע ובלי חוטים סביב הצוואר.' },
  { q: 'מה עושים כשכל הגן או הכיתה רוצים להתחפש יחד?', a: `יש ${n('type', 'group')} רעיונות קבוצתיים — סל פירות שהגננת היא הסל, קופסת צבעים, גן חיות, מערכת השמש, מתחת לים ואותיות שיוצרות "פורים שמח". שולחים להורים מראש מי מתחפש למה וכמה פשוט להכין, כדי שאף ילד לא יישאר בחוץ.` },
  { q: 'איך מתחפשים כמשפחה בלי להוציא הרבה כסף?', a: 'בוחרים נושא אחד שמחבר את כולם — מזג האוויר, חפיסת קלפים, חוות חיות או כל דמויות המגילה — וכל אחד מכין פריט אחד מקרטון ומבגדים שכבר יש. בסינון "רק ממה שיש בבית" יש את הרעיונות שלא דורשים שום קנייה.' },
  { q: 'למה מתחפשים בפורים?', a: 'אחד ההסברים הוא "ונהפוך הוא" — בסיפור המגילה הכול התהפך מצרה לשמחה, ובתחפושת גם אנחנו "מתהפכים" והופכים למישהו אחר. הסבר נוסף: הנס במגילה היה מוסתר, כמו פנים מאחורי מסכה.' },
]

function Chip({ active, onClick, children, count }) {
  return <button type="button" aria-pressed={active} onClick={onClick}
    className={`min-h-[44px] shrink-0 rounded-full border-2 px-3 text-base font-bold ${active ? 'border-slate-800 bg-purple-200' : 'border-[var(--border)] bg-white'} ${count === 0 && !active ? 'opacity-50' : ''}`}>
    {children}{count !== undefined && <span className="mr-1 text-sm font-normal text-[var(--muted-foreground)]">({count})</span>}
  </button>
}

function Card({ it }) {
  const time = label('time', it.time), budget = label('budget', it.budget)
  return <article className="wobbly-sm flex flex-col border-2 border-[var(--border)] bg-white p-4">
    <h3 className="mb-1 text-xl font-bold"><span aria-hidden="true" className="text-2xl">{it.emoji} </span>{it.name}</h3>
    <p className="text-[var(--muted-foreground)]">{it.desc}</p>
    <p className="mt-2 flex flex-wrap gap-1 text-xs font-bold">
      <span className="rounded-full bg-purple-50 px-2 py-0.5">{time.emoji} {time.label}</span>
      <span className="rounded-full bg-amber-50 px-2 py-0.5">{budget.emoji} {budget.label}</span>
      <span className="rounded-full bg-sky-50 px-2 py-0.5">{it.ages.map(a => label('ages', a).label).join(' · ')}</span>
    </p>
    <details className="mt-3 rounded-xl bg-[var(--postit)] px-3">
      <summary className="flex min-h-[44px] cursor-pointer items-center font-bold">✂️ מה צריך ואיך מכינים</summary>
      <p className="mt-1 font-bold">צריך:</p>
      <ul className="list-disc pr-5">{it.materials.map(m => <li key={m}>{m}</li>)}</ul>
      <p className="mt-2 font-bold">שלבים:</p>
      <ol className="list-decimal pb-3 pr-5">{it.steps.map(s => <li key={s}>{s}</li>)}</ol>
    </details>
  </article>
}

export default function PurimCostumes() {
  const [params, setParams] = useSearchParams()
  const sel = Object.fromEntries(COSTUME_FILTERS.map(f => {
    const v = params.get(f.key)
    return [f.key, f.options.some(o => o.id === v) ? v : null]
  }))
  const active = Object.values(sel).some(Boolean)
  const results = filterCostumes(sel)
  const set = (key, id) => {
    const next = new URLSearchParams(params)
    if (!id || sel[key] === id) next.delete(key); else next.set(key, id)
    setParams(next, { replace: true, preventScrollReset: true })
  }
  const groups = Object.keys(TYPE_TITLES).map(t => [t, results.filter(i => i.type === t)]).filter(([, items]) => items.length)

  return (
    <HolidayShell h={PURIM_H} crumb="תחפושות">
      <SEO title={`תחפושות לפורים — ${TOTAL} רעיונות ביתיים לילדים ולמשפחה`}
        description={`${TOTAL} רעיונות לתחפושות לפורים עם חומרים ושלבים: ${n('time', 'quick')} לרגע האחרון, ${n('budget', 'home')} רק ממה שיש בבית, תחפושות לפעוטות, לגן, לזוגות, למשפחה ולכל הכיתה.`}
        path={`${base}/costumes`} structuredData={faqSchema(FAQ)} />
      <h1 className="mb-2 text-center text-4xl sm:text-5xl">👑 תחפושות לפורים — {TOTAL} רעיונות ביתיים</h1>
      <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">לכל רעיון: מה צריך ואיך מכינים · סננו לפי גיל, זמן, תקציב ולמי</p>

      <section aria-label="סינון תחפושות" className="mb-6 rounded-3xl border-2 border-[var(--border)] bg-purple-50 p-4">
        {COSTUME_FILTERS.map(f => <div key={f.key} className="mb-3 last:mb-0">
          <p className="mb-1 font-bold">{f.label}:</p>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap" role="group" aria-label={f.label}>
            <Chip active={!sel[f.key]} onClick={() => set(f.key, null)}>הכול</Chip>
            {f.options.map(o => <Chip key={o.id} active={sel[f.key] === o.id} onClick={() => set(f.key, o.id)}
              count={filterCostumes({ ...sel, [f.key]: o.id }).length}>{o.emoji} {o.label}</Chip>)}
          </div>
        </div>)}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t-2 border-dashed border-[var(--border)] pt-3">
          <p className="text-lg font-bold" role="status">{active ? `נמצאו ${results.length} רעיונות` : `כל ${TOTAL} הרעיונות`}</p>
          {active && <button type="button" onClick={() => setParams(new URLSearchParams(), { replace: true, preventScrollReset: true })}
            className="min-h-[44px] rounded-full border-2 border-slate-800 bg-white px-4 font-bold">✖ לנקות סינון</button>}
        </div>
      </section>

      {!active && <p className="mb-8 text-center text-lg">
        <button type="button" onClick={() => set('time', 'quick')} className="min-h-[44px] rounded-full bg-purple-700 px-5 font-bold text-white">⏱️ פורים מחר? {n('time', 'quick')} תחפושות של רבע שעה</button>
      </p>}

      {groups.length === 0 && <p className="mb-8 rounded-2xl border-2 border-dashed border-[var(--border)] bg-white p-6 text-center text-lg">
        אין רעיון שמתאים לכל הסינונים יחד. נסו להוריד סינון אחד — למשל את התקציב או את זמן ההכנה.
      </p>}

      {groups.map(([t, items]) => <section key={t} className="mb-8">
        <h2 className="mb-3 text-3xl font-bold">{TYPE_TITLES[t]} <span className="text-lg font-normal text-[var(--muted-foreground)]">({items.length})</span></h2>
        <div className="grid gap-3 sm:grid-cols-2">{items.map(it => <Card key={it.id} it={it} />)}</div>
      </section>)}

      <p className="mb-8 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4 text-lg">💡 טיפ: תנו לילדים לבחור ולהכין חלק מהתחפושת בעצמם — גם אם יוצא פחות מושלם, הם הרבה יותר גאים בה.</p>
      <SeoBody paragraphs={[
        'לא צריך לקנות תחפושת יקרה לפורים: עם קופסת קרטון, נייר כסף, קצת צבע ובגדים שיש בבית אפשר להכין תחפושות מקוריות — וההכנה עצמה היא חלק מהכיף של החג. ריכזנו כאן מאגר של רעיונות לתחפושות ביתיות, וכל רעיון כולל רשימת חומרים קצרה ושלבי הכנה.',
        `אפשר לסנן לפי גיל (פעוטות, גן, בית ספר וגם מבוגרים), לפי זמן ההכנה — מתחפושת של רבע שעה ועד פרויקט לסוף שבוע — לפי תקציב, ולפי מי מתחפש: לבד, בזוג או עם אחים, כל המשפחה או כל הגן והכיתה. יש ${n('type', 'pair')} רעיונות לזוגות ואחים, ${n('type', 'family')} למשפחות ו־${n('type', 'group')} לקבוצות.`,
        'לפעוטות ולילדי הגן כדאי לבחור תחפושת שנוח לזוז ולשחק בה כל היום: בלי מסכה צמודה, בלי חלקים קטנים ובלי שובל ארוך שאפשר למעוד עליו.',
      ]} faq={FAQ} related={[
        { label: 'דף "התחפושת שלי" להדפסה', href: base + '/worksheets' },
        { label: 'מסכות לפורים להדפסה', href: '/printables/purim-masks' },
        { label: 'רעיונות למשלוח מנות', href: base + '/mishloach-manot' },
        { label: 'מסיבת פורים', href: '/ideas/purim-party' },
      ]} />
    </HolidayShell>
  )
}

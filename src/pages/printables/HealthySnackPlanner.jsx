import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import {
  PATH, GROUPS, EFFORT, SNACKS, BOX_PRAISE, DAYS, BALANCE, PICKY, NUT_FREE, TIPS, FAQ,
} from '../../data/healthySnack'

// /printables/healthy-snack-planner: balanced snack ideas, a "build a box" game, a weekly box generator
// and printables. General tips only, no medical claims. Nothing is stored or sent anywhere.

const pool = (group, nutOnly) => SNACKS.filter(s => s.group === group && (!nutOnly || s.nutFree))
const pickOne = (list, avoid = []) => {
  const fresh = list.filter(s => !avoid.includes(s.id))
  const src = fresh.length ? fresh : list
  return src[Math.floor(Math.random() * src.length)]
}
const makeBox = (nutOnly, avoid = []) => Object.fromEntries(GROUPS.map(g => [g.id, pickOne(pool(g.id, nutOnly), avoid)]))
const makeWeek = nutOnly => {
  const used = []
  return DAYS.map(() => { const b = makeBox(nutOnly, used); Object.values(b).forEach(s => used.push(s.id)); return b })
}

function BuildBox() {
  const [nutOnly, setNutOnly] = useState(false)
  const [chosen, setChosen] = useState({})
  const [praiseIdx, setPraiseIdx] = useState(0)
  const full = GROUPS.every(g => chosen[g.id])
  const choose = (g, s) => {
    const next = { ...chosen, [g]: chosen[g]?.id === s.id ? undefined : s }
    setChosen(next)
    if (GROUPS.every(x => next[x.id])) setPraiseIdx(i => (i + 1) % BOX_PRAISE.length)
  }
  return <div>
    <label className="mb-4 flex min-h-[44px] items-center gap-2 text-lg"><input type="checkbox" className="h-5 w-5" checked={nutOnly}
      onChange={e => { setNutOnly(e.target.checked); setChosen(c => Object.fromEntries(Object.entries(c).filter(([, s]) => s && (!e.target.checked || s.nutFree)))) }} /> רק מאכלים ללא אגוזים ובוטנים</label>
    {GROUPS.map(g => <div key={g.id} className="mb-4">
      <h3 className="mb-2 text-2xl font-black"><span aria-hidden="true">{g.emoji}</span> בוחרים אחד: {g.label}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label={`בחירת ${g.label}`}>{pool(g.id, nutOnly).map(s => {
        const on = chosen[g.id]?.id === s.id
        return <button key={s.id} type="button" aria-pressed={on} onClick={() => choose(g.id, s)}
          className={`min-h-[96px] rounded-2xl border-2 p-2 text-center ${on ? 'border-slate-800 ring-2 ring-slate-800' : 'border-[var(--border)]'}`} style={{ background: g.color }}>
          <span className="block text-5xl" aria-hidden="true">{s.emoji}</span>
          <span className="mt-1 block text-base font-bold leading-tight">{s.name}</span>
        </button>
      })}</div>
    </div>)}
    <div role="status" aria-live="polite" className="rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center">
      {full
        ? <><p className="text-4xl" aria-hidden="true">{GROUPS.map(g => chosen[g.id].emoji).join(' ')}</p>
          <p className="mt-2 text-2xl font-black">✅ {BOX_PRAISE[praiseIdx]}</p>
          <p className="mt-1 text-lg">{GROUPS.map(g => chosen[g.id].name).join(' · ')}</p></>
        : <p className="text-lg">בוחרים פריט אחד מכל קבוצה ומקבלים קופסה מאוזנת. חסרות עוד {GROUPS.filter(g => !chosen[g.id]).length} קבוצות.</p>}
    </div>
    <button type="button" className="ln-btn alt mt-3" onClick={() => setChosen({})}>מתחילים מחדש</button>
  </div>
}

function Week({ onPrint }) {
  const [nutOnly, setNutOnly] = useState(false)
  const [week, setWeek] = useState(() => makeWeek(false))
  const reshuffleDay = i => setWeek(w => w.map((b, k) => k === i ? makeBox(nutOnly, w.flatMap((x, j) => j === i ? [] : Object.values(x).map(s => s.id))) : b))
  return <div>
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <label className="flex min-h-[44px] items-center gap-2 text-lg"><input type="checkbox" className="h-5 w-5" checked={nutOnly}
        onChange={e => { setNutOnly(e.target.checked); setWeek(makeWeek(e.target.checked)) }} /> ללא אגוזים ובוטנים בלבד</label>
      <button type="button" className="ln-btn alt" onClick={() => setWeek(makeWeek(nutOnly))}>🎲 תפריט חדש לכל השבוע</button>
      <button type="button" className="ln-btn go" onClick={() => onPrint({ id: 'week', week })}>🖨️ מדפיסים את התפריט</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite">{week.map((b, i) => <div key={DAYS[i]} className="rounded-3xl border-2 border-[var(--border)] bg-white p-4">
      <div className="flex items-center justify-between"><h3 className="text-2xl font-black">יום {DAYS[i]}</h3>
        <button type="button" className="ln-btn alt" aria-label={`מערבבים מחדש את יום ${DAYS[i]}`} onClick={() => reshuffleDay(i)}>🔄</button></div>
      <ul className="mt-2 space-y-1">{GROUPS.map(g => <li key={g.id} className="flex items-center gap-2 rounded-xl px-2 py-1 text-lg" style={{ background: g.color }}>
        <span className="text-2xl" aria-hidden="true">{b[g.id].emoji}</span><span><b>{g.label}:</b> {b[g.id].name}</span></li>)}</ul>
    </div>)}</div>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 שום דבר לא נשמר ולא נשלח. ההצעות הן רעיונות כלליים, ואפשר להחליף כל פריט במה שהילד אוהב.</p>
  </div>
}

// ---- printable sheets ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>

function WeekSheet({ week }) {
  return <article className="buga-a4" style={page}>
    <h2>🍱 ארוחת העשר שלי השבוע</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>שם: ______________ · השבוע של: ____________</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5mm', minHeight: 0 }}>
      {week.map((b, i) => <div key={DAYS[i]} style={{ flex: 1, minHeight: 0, display: 'flex', gap: 5, border: '1.5px solid #555', borderRadius: 10, padding: 4 }}>
        <div style={{ width: 46, fontWeight: 900, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef3c7', borderRadius: 8 }}>יום {DAYS[i]}</div>
        {GROUPS.map(g => <div key={g.id} style={{ flex: 1, background: g.color, borderRadius: 8, textAlign: 'center', padding: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <div style={{ fontSize: 24 }}>{b[g.id].emoji}</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.2 }}>{b[g.id].name}</div>
        </div>)}
      </div>)}
    </div>
    <p style={{ fontSize: 12, margin: '3px 0 0' }}>ירק או פרי + דגנים + חלבון, וגם בקבוק מים 💧</p>
    {foot('תפריט ארוחת עשר שבועי')}
  </article>
}

function BlankSheet() {
  return <article className="buga-a4" style={page}>
    <h2>✏️ מתכננים את ארוחת העשר שלי</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>שם: ______________ · בכל יום מציירים או כותבים מה בקופסה</p>
    <div style={{ width: '100%', display: 'flex', gap: 5, fontSize: 13, fontWeight: 800, textAlign: 'center' }}>
      <div style={{ width: 46 }} />
      {GROUPS.map(g => <div key={g.id} style={{ flex: 1, background: g.color, borderRadius: 8, padding: 2 }}>{g.emoji} {g.label}</div>)}
    </div>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5mm', minHeight: 0, marginTop: 3 }}>
      {DAYS.map(d => <div key={d} style={{ flex: 1, minHeight: 0, display: 'flex', gap: 5 }}>
        <div style={{ width: 46, fontWeight: 900, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef3c7', borderRadius: 8 }}>יום {d}</div>
        {GROUPS.map(g => <div key={g.id} style={{ flex: 1, border: '1.5px dashed #888', borderRadius: 8 }} />)}
      </div>)}
    </div>
    <p style={{ fontSize: 12, margin: '3px 0 0' }}>הכלל שלי: לפחות דבר אחד מכל קבוצה 💪</p>
    {foot('מתכנן שבועי ריק')}
  </article>
}

function FavoritesSheet() {
  return <article className="buga-a4" style={page}>
    <h2>⭐ האוכל האהוב עליי לארוחת עשר</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>שם: ______________ · צובעים כוכב ליד מה שאני אוהב/ת, ומוסיפים משלי</p>
    <div style={{ flex: 1, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, minHeight: 0 }}>
      {GROUPS.map(g => <div key={g.id} style={{ background: g.color, border: '2px solid #444', borderRadius: 12, padding: 5, minHeight: 0, overflow: 'hidden' }}>
        <div style={{ fontSize: 17, fontWeight: 900, textAlign: 'center' }}>{g.emoji} {g.label}</div>
        {SNACKS.filter(s => s.group === g.id).slice(0, 8).map(s => <div key={s.id} style={{ fontSize: 12, lineHeight: 1.65 }}>☆ {s.emoji} {s.name}</div>)}
        <div style={{ fontSize: 12, lineHeight: 1.9 }}>☆ ____________</div>
        <div style={{ fontSize: 12, lineHeight: 1.9 }}>☆ ____________</div>
      </div>)}
    </div>
    <div style={{ width: '100%', height: '28%', border: '2px dashed #888', borderRadius: 12, marginTop: 6, padding: 6, fontSize: 14 }}>מציירים את הקופסה המושלמת שלי:</div>
    {foot('האוכל האהוב עליי')}
  </article>
}

const SHEETS = [
  { id: 'blank', emoji: '✏️', label: 'מתכנן שבועי ריק למילוי וציור', C: BlankSheet },
  { id: 'fav', emoji: '⭐', label: 'האוכל האהוב עליי (צביעה)', C: FavoritesSheet },
]

export default function HealthySnackPlanner() {
  const [print, setPrint] = useState(null)
  const sheet = SHEETS.find(s => s.id === print?.id)
  const nutCount = SNACKS.filter(s => s.nutFree).length

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="ארוחת עשר בריאה: רעיונות ותכנון שבועי להדפסה"
      description="40 רעיונות לארוחת עשר בריאה ומאוזנת, גם לגן נקי מבוטנים: בניית קופסה על המסך, תפריט שבועי אקראי, מתכנן ריק ודף מאכלים אהובים להדפסה."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפי הדפסה', href: '/printables' }, { label: 'ארוחת עשר בריאה' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🍱 ארוחת עשר בריאה: רעיונות ותכנון שבועי להדפסה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מה שמים בקופסה כדי שתהיה טעימה, צבעונית ומאוזנת? {SNACKS.length} רעיונות מחולקים לארבע קבוצות, משחק בניית קופסה לילדים, תפריט שבועי אקראי (גם ללא אגוזים ובוטנים) ודפים להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['balance', 'מה זה מאוזן'], ['build', 'בונים קופסה'], ['week', 'תפריט שבועי'], ['print', 'דפים להדפסה'], ['tips', 'טיפים'], ['nuts', 'גן נקי מבוטנים']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="balance" className="mb-8 scroll-mt-24" aria-labelledby="balance-h">
      <h2 id="balance-h" className="mb-3 text-3xl font-black">⚖️ מה הופך ארוחת עשר למאוזנת?</h2>
      <p className="mb-4 text-lg leading-relaxed">אין צורך בקופסה מושלמת. כלל פשוט שקל לזכור: דבר אחד מכל קבוצה, ומים לשתייה. כך יש בקופסה צבע, אנרגיה ושובע.</p>
      <ul className="grid gap-3 sm:grid-cols-2">{BALANCE.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
      <p className="mt-4 text-lg">להרחבה על תזונה לילדים: <Link to="/learn/nutrition" className="font-bold underline">למידה על תזונה</Link>. וכל שאר הרעיונות לשבוע: <Link to="/printables/routine-chart" className="font-bold underline">לוח שגרה</Link>.</p>
      <h3 className="mt-6 text-2xl font-black">📋 כל הרעיונות לפי קבוצה</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">{GROUPS.map(g => <div key={g.id} className="rounded-3xl border-2 border-[var(--border)] p-4" style={{ background: g.color }}>
        <h4 className="text-xl font-black">{g.emoji} {g.label}</h4>
        <ul className="mt-2 space-y-1">{SNACKS.filter(s => s.group === g.id).map(s => <li key={s.id} className="text-base">
          <span aria-hidden="true">{s.emoji}</span> {s.name} <span className="text-sm text-[var(--muted-foreground)]">· {EFFORT[s.effort]}{s.nutFree ? '' : ' · 🥜 מכיל אגוזים או בוטנים'}</span></li>)}</ul>
      </div>)}</div>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">{nutCount} מתוך {SNACKS.length} הרעיונות ללא אגוזים ובוטנים כמרכיב, אבל תמיד קראו את התווית של המוצר.</p>
    </section>

    <section id="build" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="build-h">
      <h2 id="build-h" className="mb-3 text-3xl font-black">🧺 בונים קופסה מאוזנת</h2>
      <p className="mb-4 text-lg">לוחצים על אריח אחד בכל קבוצה. כשהקופסה מלאה, מקבלים חיזוק!</p>
      <BuildBox />
    </section>

    <section id="week" className="mb-8 scroll-mt-24" aria-labelledby="week-h">
      <h2 id="week-h" className="mb-3 text-3xl font-black">🎲 תפריט ארוחות עשר לשבוע</h2>
      <p className="mb-4 text-lg leading-relaxed">התפריט נוצר באקראי, מיום א׳ עד יום ו׳, עם ירק, פרי, דגנים וחלבון בכל יום. לא אהבתם יום מסוים? לוחצים 🔄 ומחליפים רק אותו.</p>
      <Week onPrint={setPrint} />
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg leading-relaxed">התפריט השבועי שיצרתם מודפס מהכפתור שבחלק הקודם. לילדים אפשר להדפיס מתכנן ריק לציור ולמילוי, ודף של מאכלים אהובים.</p>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint({ id: s.id })}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
    </section>

    <section id="tips" className="mb-8 grid scroll-mt-24 gap-4 md:grid-cols-2" aria-labelledby="tips-h">
      <h2 id="tips-h" className="sr-only">טיפים לארוחת עשר</h2>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">🥦 ילדים בררנים</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{PICKY.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
      <div className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black">🎒 טיפים לבוקר רגוע</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{TIPS.map(t => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>

    <section id="nuts" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-rose-50 p-5" aria-labelledby="nuts-h">
      <h2 id="nuts-h" className="mb-3 text-3xl font-black">🥜 גן נקי מבוטנים ואגוזים</h2>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{NUT_FREE.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="mt-3 leading-relaxed">הדף כללי ואינו מחליף הנחיות של רופא/ה או של צוות הגן. אם יש חשש לתגובה אלרגית, פנו מיד לרופא או למד״א 101.</p>
    </section>

    {print && (print.id === 'week'
      ? <PrintPreview title="ארוחת עשר: תפריט שבועי" onClose={() => setPrint(null)}><WeekSheet week={print.week} /></PrintPreview>
      : sheet && <PrintPreview title={`ארוחת עשר — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C /></PrintPreview>)}

    <p className="mt-8 text-center text-lg">עוד: <Link className="font-bold underline" to="/learn/nutrition">למידה על תזונה</Link> · <Link className="font-bold underline" to="/printables/routine-chart">לוח שגרה</Link> · <Link className="font-bold underline" to="/printables">כל דפי ההדפסה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'ארוחת עשר טובה לא חייבת להיות מסובכת. קופסה מאוזנת כוללת ירק או פרי, משהו מדגנים וחלבון, ולצדה מים. בדף הזה תמצאו ארבעים רעיונות מחולקים לארבע קבוצות, עם סימון למאכלים ללא אגוזים ובוטנים, חשוב לגנים ולכיתות שמבקשים להימנע מהם, וכן רמת מאמץ בהכנה.',
      'הילדים יכולים לבנות קופסה על המסך ולקבל חיזוק כשבחרו מכל קבוצה, וההורים יכולים ליצור תפריט שבועי אקראי מיום א׳ עד יום ו׳ ולהדפיס אותו. בנוסף יש מתכנן ריק לציור ודף ״האוכל האהוב עליי״. התוכן כללי ואינו ייעוץ רפואי או תזונתי, ושום מידע לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'למידה על תזונה', href: '/learn/nutrition' }, { label: 'לוח שגרה להדפסה', href: '/printables/routine-chart' }, { label: 'כל דפי ההדפסה', href: '/printables' }]} /></div>
  </div>
}

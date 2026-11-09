import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import InvitationStudio from '../../components/invitations/InvitationStudio'
import PrintPreview from '../../components/ui/PrintPreview'
import { WEDDING_TASKS, GUEST_GROUPS, SUPPLIERS, DEFAULT_CHUPPAH, daysUntil, tasksByStage, expectedGuests, weddingBudget, daySchedule, scheduleText, planToLink, planFromHash, syncLink, syncFromHash } from './weddingPlan'
import { useWeddingSync, syncedCode } from './useWeddingSync'

const STORE = 'buga-wedding-plan'
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {} } catch { return {} } }
const save = v => { try { localStorage.setItem(STORE, JSON.stringify(v)) } catch { /* private mode: plan just isn't kept */ } }

const STEPS = [
  { n: 1, emoji: '💌', title: 'הזמנה לחתונה', text: 'עיצוב אלגנטי עם השמות שלכם, תמונה ותאריך — לוואטסאפ, לסטורי ולהדפסה.', to: '/invitation/wedding', cta: 'לעיצוב ההזמנה' },
  { n: 2, emoji: '✅', title: 'אישורי הגעה', text: 'קישור אחד שהאורחים פותחים מהוואטסאפ ועונים בלחיצה. אתם רואים מי מגיע, כמה מנות ורגישויות במזון — ושולחים תזכורת אישית לכל מי שלא ענה.', to: '/rsvp/wedding', cta: 'לפתיחת אישורי הגעה' },
  { n: 3, emoji: '🪑', title: 'סידור הושבה', text: 'בדף הניהול של אישורי ההגעה קובעים כמה שולחנות ומקומות יש, ובלחיצה אחת הכול מסתדר: משפחות יחד וקבוצות זו ליד זו. משנים ידנית מה שרוצים ומדפיסים לעמדת הכניסה.', to: '/rsvp/wedding', cta: 'לסידור ההושבה' },
  { n: 4, emoji: '🗓️', title: 'מה עושים ומתי', text: 'רשימת משימות לפי תאריך החתונה שלכם, מהשנה שלפני ועד הבוקר של היום הגדול. מסמנים מה כבר נעשה.', to: '#plan', cta: 'לרשימת המשימות' },
  { n: 5, emoji: '📖', title: 'אלבום החתונה', text: 'אחרי החתונה מעלים את התמונות, והאלבום מסתדר לבד לפי שעת הצילום. מעצבים בסגנון שאוהבים ומורידים PDF להדפסה ב־30×30.', to: '/tools/album/wedding', cta: 'לעיצוב האלבום' },
]

const FAQ = [
  { q: 'המתכנן באמת חינמי?', a: 'כן. ההזמנה, אישורי ההגעה, סידור ההושבה ורשימת המשימות חינמיים לגמרי, בלי הרשמה. אפשר לרשום עד 400 שמות ברשימת המוזמנים ולקבל עד 1,000 תשובות.' },
  { q: 'מה נשמר איפה?', a: 'המשימות, התקציב ולוח הזמנים נשמרים רק בדפדפן שבו מילאתם אותם, אלא אם הפעלתם עריכה משותפת: אז הם נשמרים גם אצלנו, נפתחים רק בקישור הסודי, ונמחקים אחרי 400 ימים בלי שינוי או בלחיצה על מחיקה מהשרת. הטלפונים של האורחים תמיד נשארים רק במכשיר שלכם. פרטי האירוע, שמות המוזמנים והתשובות נשמרים אצלנו בשרת כדי שהאורחים יוכלו לענות, ונמחקים חודשיים אחרי האירוע, לכן כדאי להוריד אותם לאקסל לפני כן.' },
  { q: 'כמה עולה חתונה בישראל?', a: 'תלוי בעיקר במספר האורחים ובמחיר המנה. במחשבון התקציב מכניסים את ההצעות שקיבלתם, ורואים את סך הכול, את העלות לאורח ואם המתנות הצפויות יכסו את ההוצאה.' },
  { q: 'איך עובד הסידור האוטומטי של ההושבה?', a: 'קובעים כמה שולחנות יש וכמה מקומות בכל שולחן, ואם רוצים נותנים לכל תשובה קבוצה, כמו משפחת החתן או חברים של הכלה. הסידור משאיר משפחות יחד, מושיב קבוצה ליד קבוצה ולא מזיז את מי שכבר שובץ. אפשר לבטל בלחיצה ולשנות כל שולחן ידנית.' },
  { q: 'מה הלו"ז של ערב החתונה?', a: 'לוח הזמנים נבנה מהשעה של החופה: קבלת פנים נפתחת בדרך כלל כשעה וחצי לפניה, וארוחה וריקודים אחריה. כותבים את שעת החופה, משנים כל שורה, ושולחים לכל ספק רק את מה שנוגע אליו.' },
  { q: 'כמה זמן לפני החתונה שולחים הזמנות?', a: 'בדרך כלל ארבעה עד שישה שבועות לפני. שבוע־שבועיים לפני שולחים תזכורת רק למי שעוד לא אישר הגעה.' },
  { q: 'אפשר לנהל גם חינה או שבת חתן?', a: 'כן. פותחים אירוע נפרד באישורי ההגעה לכל אחד מהם, וכל אירוע מקבל קישור וסיכום משלו.' },
]

function Countdown({ date, setDate }) {
  const days = daysUntil(date)
  return <div className="mx-auto mt-6 max-w-xl rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center sketch-shadow">
    <label className="font-bold">📅 מתי החתונה?{' '}
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mr-2 rounded-xl border-2 border-[var(--border)] px-3 py-1" dir="ltr" />
    </label>
    {date && days !== null && <p className="mt-3 mb-0 text-2xl font-bold" role="status">
      {days > 1 ? <>עוד <span className="text-4xl text-rose-600">{days}</span> ימים לחתונה 💍</> : days === 1 ? 'החתונה מחר! 🎉' : days === 0 ? 'מזל טוב! היום מתחתנים 💍' : 'מזל טוב לזוג הטרי! 🥂'}
    </p>}
  </div>
}

// What paid wedding services charge for, and what it costs here.
const EXTRAS = [
  ['📲', 'תזכורת אישית בוואטסאפ', 'הודעה עם השם של כל מי שלא ענה', 'אחרים גובים 69–449 ₪'],
  ['🪑', 'הושבה אוטומטית ורשימה לכניסה', 'לחיצה אחת, משפחות יחד, בדיקת מקום בכל שולחן', 'בדרך כלל בתוך חבילה בתשלום'],
  ['⏰', 'לוח זמנים ליום החתונה', 'נבנה משעת החופה, ולכל ספק נשלח רק מה שנוגע אליו', ''],
  ['🤝', 'עריכה משותפת לשניכם', 'קישור סודי, בלי הרשמה, ושינויים מתמזגים לבד', ''],
  ['👥', 'כמה יגיעו באמת?', 'הערכה לפי סוגי האורחים, לפני שסוגרים מנות', 'לא מצאנו את זה אצל אחרים'],
  ['💰', 'מחשבון תקציב ומתנות', 'כמה החתונה תעלה, כמה שילמתם, ואם המתנות יכסו', 'באפליקציות אחרות — אחרי הרשמה'],
  ['🔒', 'בלי הרשמה ובלי למסור טלפונים', 'הטלפונים של האורחים נשארים אצלכם', ''],
]

function Extras() {
  return <section className="mt-10 rounded-3xl border-2 border-[var(--border)] bg-emerald-50 p-5" aria-labelledby="extras-title">
    <h2 id="extras-title" className="m-0 text-center text-2xl font-bold">🎁 מה שאחרים מוכרים — אצלנו בחינם</h2>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{EXTRAS.map(([e, t, d, price]) => <div key={t} className="rounded-2xl bg-white p-4">
      <h3 className="m-0 text-lg font-bold">{e} {t}</h3><p className="m-0 mt-1 text-[var(--muted-foreground)]">{d}</p>
      {price && <p className="m-0 mt-2 text-sm"><s className="text-slate-400">{price}</s> <b className="text-emerald-700">אצלנו: 0 ₪</b></p>}
    </div>)}</div>
  </section>
}

function GuestEstimate({ counts, day, set }) {
  const r = expectedGuests(counts, day)
  return <section id="guests" className="mt-12 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow" aria-labelledby="guests-title">
    <h2 id="guests-title" className="m-0 text-center text-3xl font-bold">👥 כמה יגיעו באמת?</h2>
    <p className="text-center text-[var(--muted-foreground)]">לא כל מי שמוזמן מגיע. כתבו כמה הזמנתם מכל סוג, ותדעו כמה מנות לסגור עם האולם.</p>
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {GUEST_GROUPS.map(g => <label key={g.id} className="font-bold">{g.label}
        <input type="number" min="0" inputMode="numeric" value={counts[g.id] || ''} placeholder="0" onChange={e => set({ counts: { ...counts, [g.id]: e.target.value } })} className="mt-1 block w-full rounded-xl border-2 border-[var(--border)] px-3 py-2" />
      </label>)}
      <label className="font-bold">יום החתונה
        <select value={day} onChange={e => set({ day: e.target.value })} className="mt-1 block w-full rounded-xl border-2 border-[var(--border)] px-3 py-2">
          <option value="weekday">אמצע השבוע</option><option value="friday">יום שישי</option><option value="holiday">ערב חג או חול המועד</option>
        </select>
      </label>
    </div>
    {r.invited > 0 && <div className="mt-5 rounded-2xl bg-rose-50 p-4 text-center" role="status">
      <p className="m-0 text-lg">מתוך <b>{r.invited}</b> מוזמנים צפויים להגיע בערך</p>
      <p className="m-0 text-5xl font-bold text-rose-600">{r.expected}</p>
      <p className="m-0 mt-1">({r.rate}% הגעה · בין {r.low} ל־{r.high})</p>
      <p className="m-0 mt-3 font-bold">💡 מינימום מנות מול האולם: בסביבות {r.low}. את השאר מעדכנים לפי אישורי ההגעה.</p>
    </div>}
    <p className="mt-3 mb-0 text-center text-xs text-[var(--muted-foreground)]">הערכה גסה בלבד: האחוזים הם הנחת התחלה שלנו ולא נתון מחקרי. המספר המדויק מגיע מאישורי ההגעה.</p>
  </section>
}

const shekel = n => `${Math.round(n).toLocaleString('he-IL')} ₪`
const money = 'mt-1 block w-full rounded-xl border-2 border-[var(--border)] px-3 py-2'

function Budget({ plan, set }) {
  const b = plan.budget || {}
  const items = b.items || {}
  const expected = expectedGuests(plan.counts, plan.day).expected
  const guests = b.guests ?? (expected || '')
  const r = weddingBudget({ guests, perPlate: b.perPlate ?? 320, gift: b.gift ?? 400, items })
  const put = patch => set({ budget: { ...b, ...patch } })
  const putItem = (id, patch) => put({ items: { ...items, [id]: { ...items[id], ...patch } } })
  const share = 'https://wa.me/?text=' + encodeURIComponent('מתחתנים? יש מחשבון חינמי שמראה כמה החתונה תעלה ואם המתנות יכסו אותה 💍\nhttps://ugabuga.co.il/wedding#budget')
  return <section id="budget" className="mt-12 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow" aria-labelledby="budget-title">
    <h2 id="budget-title" className="m-0 text-center text-3xl font-bold">💰 כמה החתונה תעלה?</h2>
    <p className="text-center text-[var(--muted-foreground)]">המחירים שמולאו מראש הם נקודת התחלה בלבד — שנו כל שורה לפי ההצעות שקיבלתם, וסמנו כמה כבר שילמתם. אם סיכמתם מינימום מנות עם האולם, כתבו אותו ב"כמה אורחים".</p>
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <label className="font-bold">כמה אורחים{expected > 0 && b.guests === undefined && <span className="font-normal text-sm"> (מהמחשבון למעלה)</span>}
        <input type="number" min="0" inputMode="numeric" value={guests} placeholder="0" onChange={e => put({ guests: e.target.value })} className={money} /></label>
      <label className="font-bold">מחיר למנה באולם (₪)
        <input type="number" min="0" inputMode="numeric" value={b.perPlate ?? 320} onChange={e => put({ perPlate: e.target.value })} className={money} /></label>
      <label className="font-bold">מתנה ממוצעת לאורח (₪)
        <input type="number" min="0" inputMode="numeric" value={b.gift ?? 400} onChange={e => put({ gift: e.target.value })} className={money} /></label>
    </div>
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-right">
        <thead><tr className="border-b-2 border-[var(--border)]"><th className="py-2">ספק</th><th className="py-2">מחיר (₪)</th><th className="py-2">שולם (₪)</th></tr></thead>
        <tbody>
          <tr className="border-b border-[var(--border)]"><td className="py-2 font-bold">אולם ואוכל</td><td className="py-2" colSpan="2">{shekel(r.food)} <span className="text-sm text-[var(--muted-foreground)]">({Number(guests) || 0} × {shekel(Number(b.perPlate ?? 320) || 0)})</span></td></tr>
          {r.lines.map(l => <tr key={l.id} className="border-b border-[var(--border)]">
            <td className="py-2 font-bold">{l.label}</td>
            <td className="py-1 pl-2"><input type="number" min="0" inputMode="numeric" aria-label={`מחיר: ${l.label}`} value={items[l.id]?.cost ?? l.typical} onChange={e => putItem(l.id, { cost: e.target.value })} className="w-full rounded-lg border-2 border-[var(--border)] px-2 py-1" /></td>
            <td className="py-1"><input type="number" min="0" inputMode="numeric" aria-label={`שולם: ${l.label}`} value={items[l.id]?.paid ?? ''} placeholder="0" onChange={e => putItem(l.id, { paid: e.target.value })} className="w-full rounded-lg border-2 border-[var(--border)] px-2 py-1" /></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {!(Number(guests) > 0) && <p className="mt-5 rounded-2xl bg-amber-50 p-3 text-center font-bold">✍️ כתבו כמה אורחים — או מלאו את "כמה יגיעו באמת" למעלה — ותראו את סך הכול ואת המתנות הצפויות.</p>}
    {Number(guests) > 0 && <div className="mt-5 grid gap-3 text-center sm:grid-cols-3" role="status">
      <div className="rounded-2xl bg-rose-50 p-4"><p className="m-0">סך הכול</p><p className="m-0 text-3xl font-bold text-rose-600">{shekel(r.total)}</p>{r.perGuest > 0 && <p className="m-0 text-sm">{shekel(r.perGuest)} לאורח</p>}</div>
      <div className={`rounded-2xl p-4 ${r.balance >= 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}><p className="m-0">המתנות, אם המשוער יתקיים</p><p className="m-0 text-3xl font-bold">{shekel(r.gifts)}</p>
        <p className="m-0 text-sm font-bold">{r.gifts === 0 ? '' : r.balance >= 0 ? `נשאר בערך ${shekel(r.balance)} 🎉` : `חסר בערך ${shekel(-r.balance)}`}</p></div>
      <div className="rounded-2xl bg-sky-50 p-4"><p className="m-0">שולם עד עכשיו</p><p className="m-0 text-3xl font-bold">{shekel(r.paid)}</p><p className="m-0 text-sm">נשאר לשלם {shekel(r.left)}</p></div>
    </div>}
    <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">הערכה בלבד. המספרים נשמרים רק אצלכם בדפדפן.</p>
    <p className="mt-2 mb-0 text-center"><a href={share} target="_blank" rel="noopener noreferrer" className="inline-block rounded-xl bg-[#25D366] px-4 py-2 font-bold text-white">💬 שלחו לחברים שמתחתנים</a></p>
  </section>
}

function DaySchedule({ plan, set }) {
  const [supplier, setSupplier] = useState('')
  const [printing, setPrinting] = useState(false)
  const s = plan.schedule || {}
  const times = s.times || {}
  const chuppah = s.chuppah || DEFAULT_CHUPPAH
  const rows = daySchedule(chuppah, times)
  const put = patch => set({ schedule: { ...s, ...patch } })
  const updated = new Date().toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
  const wa = 'https://wa.me/?text=' + encodeURIComponent(scheduleText(rows, supplier, updated))
  return <section id="schedule" className="mt-12 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow" aria-labelledby="schedule-title">
    <h2 id="schedule-title" className="m-0 text-center text-3xl font-bold">⏰ לוח הזמנים של היום הגדול</h2>
    <p className="text-center text-[var(--muted-foreground)]">כתבו מתי החופה, וכל היום יסתדר סביבה. אפשר לשנות כל שעה לפי מה שסיכמתם עם האולם.</p>
    <p className="text-center"><label className="font-bold">💍 שעת החופה{' '}
      <input type="time" value={chuppah} onChange={e => e.target.value && put({ chuppah: e.target.value })} className="mr-2 rounded-xl border-2 border-[var(--border)] px-3 py-1" dir="ltr" />
    </label></p>
    <ol className="m-0 mt-4 list-none space-y-1 p-0">
      {rows.map(r => <li key={r.id} className={`flex items-center gap-3 rounded-xl px-3 py-1.5 ${r.id === 'chuppah' ? 'bg-rose-50 font-bold' : ''}`}>
        {r.id === 'chuppah' ? <span className="w-[6.5rem] shrink-0 text-center" dir="ltr">{r.time}</span>
          : <input type="time" aria-label={`שעה: ${r.label}`} value={r.time} onChange={e => put({ times: { ...times, [r.id]: e.target.value } })} className="w-[6.5rem] shrink-0 rounded-lg border-2 border-[var(--border)] px-1 py-0.5" dir="ltr" />}
        <span>{r.label}</span>
      </li>)}
    </ol>
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <label className="font-bold">לשלוח{' '}<select value={supplier} onChange={e => setSupplier(e.target.value)} className="rounded-xl border-2 border-[var(--border)] px-2 py-2">{SUPPLIERS.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
      <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-4 py-2 font-bold text-white">💬 שליחה בוואטסאפ</a>
      <button type="button" onClick={() => setPrinting(true)} className="rounded-xl border-2 border-[var(--border)] px-4 py-2 font-bold">🖨️ הדפסה</button>
      {Object.keys(times).length > 0 && <button type="button" onClick={() => put({ times: {} })} className="text-sm font-bold underline">לחזור לשעות המומלצות</button>}
    </div>
    <p className="mt-3 mb-0 text-center text-xs text-[var(--muted-foreground)]">השעות הן נקודת התחלה מקובלת. הסדר משתנה מאולם לאולם.</p>
    {printing && <PrintPreview lang="he" title="לוח הזמנים של החתונה" onClose={() => setPrinting(false)}>
      <div className="buga-flow" dir="rtl">
        <h2 style={{ fontSize: 26, margin: 0 }}>💍 לוח הזמנים של החתונה</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, marginTop: 8 }}>
          <tbody>{rows.map(r => <tr key={r.id}><td style={{ borderBottom: '1px solid #ddd', padding: 6, fontWeight: 800, width: 70 }}>{r.time}</td><td style={{ borderBottom: '1px solid #ddd', padding: 6 }}>{r.label}</td></tr>)}</tbody>
        </table>
      </div>
    </PrintPreview>}
  </section>
}

const SYNC_STATUS = {
  saving: '⏳ שומרים…',
  saved: '✓ הכול שמור ומשותף',
  offline: '📶 אין חיבור כרגע. השינויים נשמרו כאן ויעלו כשהחיבור יחזור.',
}

// Both partners on one plan: saved on the server only after they turn this on.
function SharePlan({ sync }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const act = fn => async () => { setError(''); try { await fn() } catch (e) { setError(e.code === 'rate_limited' ? 'יותר מדי פעולות ברשת הזו. נסו שוב בעוד כמה דקות.' : 'לא הצלחנו. בדקו את החיבור ונסו שוב.') } }
  const link = sync.share && syncLink(sync.share, 'https://ugabuga.co.il')
  const wa = link && 'https://wa.me/?text=' + encodeURIComponent('התכנון של החתונה שלנו 💍 פותחים פעם אחת מהטלפון, ומאז עובדים עליו יחד:\n' + link)
  const copy = () => navigator.clipboard?.writeText(link).then(() => setCopied(true), () => {})
  return <section id="together" className="mt-10 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-sky-50 p-5 text-center" aria-labelledby="together-title">
    <h2 id="together-title" className="m-0 text-2xl font-bold">🤝 עובדים על זה יחד</h2>
    {!link ? <>
      <p className="mt-1 text-[var(--muted-foreground)]">שניכם רואים ומעדכנים את אותו תכנון מכל טלפון, ושינויים מתמזגים לבד. התכנון יישמר אצלנו בשרת, ורק מי שיש לו את הקישור הסודי יוכל לפתוח אותו. בלי הרשמה.</p>
      {sync.status === 'gone' && <p className="font-bold text-rose-700" role="status">השיתוף הזה נמחק. התכנון נשאר בדפדפן הזה, ואפשר לפתוח שיתוף חדש.</p>}
      <button type="button" onClick={act(sync.start)} className="rounded-xl bg-sky-600 px-5 py-2 font-bold text-white">להפעיל עריכה משותפת</button>
    </> : <>
      <p className="mt-1 font-bold" role="status">{SYNC_STATUS[sync.status] || SYNC_STATUS.saved}</p>
      <p className="mt-1 text-[var(--muted-foreground)]">שלחו את הקישור לבן או לבת הזוג. כל מי שיש לו את הקישור יכול לראות ולשנות את התכנון, כולל התקציב, אז אל תשתפו אותו בקבוצות.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-4 py-2 font-bold text-white">💬 שליחה בוואטסאפ</a>
        <button type="button" onClick={copy} className="rounded-xl border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">{copied ? '✓ הועתק' : '🔗 העתקת קישור'}</button>
      </div>
      <p className="mt-3 mb-0 text-sm">
        <button type="button" onClick={() => window.confirm('להפסיק לשתף במכשיר הזה? התכנון יישאר כאן, ובן או בת הזוג ימשיכו בקישור.') && sync.leave()} className="font-bold underline">עצירה במכשיר הזה</button>
        {' · '}
        <button type="button" onClick={() => window.confirm('למחוק את התכנון המשותף מהשרת? הקישור יפסיק לעבוד לשניכם, והעותק בדפדפן הזה יישאר.') && act(sync.destroy)()} className="font-bold underline">מחיקה מהשרת</button>
      </p>
    </>}
    {error && <p className="mt-2 mb-0 font-bold text-rose-700" role="alert">{error}</p>}
  </section>
}

// A copy of the plan in a link, for a backup or another phone without sharing. No server involved.
function MovePlan({ plan }) {
  const [copied, setCopied] = useState(false)
  const link = planToLink(plan, 'https://ugabuga.co.il')
  const wa = 'https://wa.me/?text=' + encodeURIComponent('התכנון של החתונה שלנו 💍 (פותחים ומקבלים את כל הסימונים והתקציב):\n' + link)
  const copy = () => navigator.clipboard?.writeText(link).then(() => setCopied(true), () => {})
  if (!Object.keys(plan).length) return null
  return <section className="mt-10 rounded-3xl border-2 border-dashed border-[var(--border)] p-5 text-center" aria-labelledby="move-title">
    <h2 id="move-title" className="m-0 text-xl font-bold">💾 גיבוי בקישור</h2>
    <p className="mt-1 text-[var(--muted-foreground)]">בלי עריכה משותפת, התכנון נשמר רק בדפדפן הזה, וניקוי הדפדפן ימחק אותו. הקישור כאן הוא עותק של מה שיש כרגע, ואינו נשמר אצלנו: שינויים אחר כך לא עוברים אליו. הוא כולל את התקציב, אז שלחו אותו רק למי שאתם רוצים.</p>
    <div className="flex flex-wrap justify-center gap-2">
      <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-4 py-2 font-bold text-white">💬 שליחה בוואטסאפ</a>
      <button type="button" onClick={copy} className="rounded-xl border-2 border-[var(--border)] px-4 py-2 font-bold">{copied ? '✓ הועתק' : '🔗 העתקת קישור'}</button>
    </div>
  </section>
}

function Plan({ date, done, toggle }) {
  const stages = tasksByStage(date)
  const total = WEDDING_TASKS.length, count = WEDDING_TASKS.filter(t => done[t.id]).length
  return <section id="plan" className="mt-12 scroll-mt-24" aria-labelledby="plan-title">
    <h2 id="plan-title" className="text-center text-3xl font-bold">🗓️ מה עושים ומתי</h2>
    <p className="text-center text-[var(--muted-foreground)]">{date ? 'המשימות מסודרות לפי התאריך שלכם. מה שדחוף עכשיו מסומן בצהוב.' : 'בחרו תאריך למעלה, והמשימות יסתדרו לפי הזמן שנשאר.'} סימנתם {count} מתוך {total}.</p>
    <div className="mx-auto mt-2 h-3 max-w-md overflow-hidden rounded-full bg-[var(--muted)]"><div className="h-full bg-rose-400 transition-all" style={{ width: `${Math.round(count / total * 100)}%` }} /></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {stages.map(s => <div key={s.id} className={`rounded-3xl border-2 border-[var(--border)] p-5 ${s.now ? 'bg-[var(--yellow)]/40' : 'bg-white'}`}>
        <h3 className="m-0 text-xl font-bold">{s.title}{s.now && <span className="mr-2 rounded-full bg-[var(--yellow)] px-2 py-0.5 text-sm">עכשיו</span>}{s.late && <span className="mr-2 rounded-full bg-rose-100 px-2 py-0.5 text-sm">כבר עבר</span>}</h3>
        <ul className="mt-3 list-none space-y-2 p-0">
          {s.tasks.map(t => <li key={t.id}><label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" checked={!!done[t.id]} onChange={() => toggle(t.id)} className="mt-1.5 h-5 w-5 shrink-0" />
            <span className={done[t.id] ? 'text-[var(--muted-foreground)] line-through' : ''}>{t.text}{t.to && <> · {t.to.startsWith('#') ? <a href={t.to} className="font-bold underline">{t.link}</a> : <Link to={t.to} className="font-bold underline">{t.link}</Link>}</>}</span>
          </label></li>)}
        </ul>
      </div>)}
    </div>
  </section>
}

export function WeddingHub() {
  const [plan, setPlan] = useState({})
  const replace = useCallback(next => { save(next); setPlan(next) }, [])
  const [ready, setReady] = useState(false)
  const sync = useWeddingSync(plan, replace, ready)
  const join = useRef(sync.join)
  useEffect(() => {
    const invite = syncFromHash(window.location.hash)
    const shared = planFromHash(window.location.hash)
    const mine = load()
    setReady(true)
    if (invite) {
      setPlan(mine)
      // Opening your own link again changes nothing.
      if (invite.code !== syncedCode() && (!Object.keys(mine).length || window.confirm('להצטרף לתכנון המשותף? הוא יחליף את מה שנשמר בדפדפן הזה.'))) join.current(invite).catch(() => window.alert('הקישור לא עובד. ייתכן שהתכנון נמחק או שאין חיבור.'))
      window.history.replaceState(null, '', window.location.pathname)
    } else if (shared && (!Object.keys(mine).length || window.confirm('לפתוח את התכנון מהקישור? הוא יחליף את כל מה שנשמר בדפדפן הזה, כולל שינויים שעשיתם כאן אחרי ששלחו אותו.'))) {
      save(shared); setPlan(shared)
      window.history.replaceState(null, '', window.location.pathname)
    } else setPlan(mine)
  }, [])
  const update = patch => setPlan(p => { const next = { ...p, ...patch }; save(next); return next })
  const done = plan.done || {}
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מתכנן חתונה חינמי — הזמנה, אישורי הגעה וסידור הושבה" description="בוגה מתחתנים: מתכנן חתונה חינמי בעברית. עיצוב הזמנה לחתונה, אישורי הגעה בוואטסאפ, סידור הושבה לשולחנות ורשימת משימות לפי תאריך החתונה — בלי הרשמה." path="/wedding" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בוגה מתחתנים' }]} />
    <img src="/images/home-mascot-family.webp" alt="בוגה מחזיק ציור של לב" width="420" height="384" className="mx-auto h-36 w-auto" />
    <h1 className="text-center text-4xl sm:text-5xl">💍 בוגה מתחתנים</h1>
    <p className="mx-auto max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מתכנן חתונה חינמי: מההזמנה, דרך אישורי ההגעה וסידור ההושבה, ועד רשימת המשימות של הבוקר לפני. הכול בעברית, בלי הרשמה.</p>
    <Countdown date={plan.date || ''} setDate={date => update({ date })} />

    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {STEPS.map(s => {
        const inner = <><span className="text-sm font-bold text-rose-600">שלב {s.n}</span><h2 className="m-0 mt-1 text-2xl font-bold">{s.emoji} {s.title}</h2><p className="mt-2 mb-3 text-[var(--muted-foreground)]">{s.text}</p><span className="font-bold underline">{s.cta} ←</span></>
        const cls = 'block rounded-3xl border-2 border-[var(--border)] bg-white p-5 transition-transform hover:-translate-y-1 sketch-shadow'
        return s.to.startsWith('#') ? <a key={s.n} href={s.to} className={cls}>{inner}</a> : <Link key={s.n} to={s.to} className={cls}>{inner}</Link>
      })}
    </div>

    <Extras />

    <GuestEstimate counts={plan.counts || {}} day={plan.day || 'weekday'} set={update} />

    <Budget plan={plan} set={update} />

    <DaySchedule plan={plan} set={update} />

    <Plan date={plan.date || ''} done={done} toggle={id => update({ done: { ...done, [id]: !done[id] } })} />

    <SharePlan sync={sync} />

    <MovePlan plan={plan} />

    <div className="mt-12"><SeoBody paragraphs={['בוגה מתחתנים מרכז את כל מה שזוג צריך כדי לתכנן חתונה בלי טבלאות מבולגנות: מעצבים הזמנה, שולחים קישור לאישור הגעה, רואים כמה מנות להזמין, מושיבים את האורחים בשולחנות, ומסמנים משימות לפי הזמן שנשאר עד החתונה.']} faq={FAQ} related={[{ label: 'הזמנה לחתונה', href: '/invitation/wedding' }, { label: 'אישור הגעה לחתונה', href: '/rsvp/wedding' }, { label: 'ברכות', href: '/greeting' }]} /></div>
  </div>
}

const INVITE_FAQ = [
  { q: 'מה כותבים בהזמנה לחתונה?', a: 'שמות בני הזוג, משפט הזמנה, תאריך עם יום בשבוע, שעת קבלת הפנים ושעת החופה, שם האולם וכתובת, ודרך לאשר הגעה. אפשר להוסיף שורה על חנייה או הסעות.' },
  { q: 'אפשר לצרף להזמנה אישור הגעה?', a: 'כן. יוצרים אירוע באישורי ההגעה לחתונה, מעתיקים את קישור האורחים, והוא מתווסף להזמנה ולהודעת הוואטסאפ.' },
  { q: 'ההזמנה מתאימה גם להדפסה?', a: 'כן. "הדפסה / שמירה כ־PDF" מכין דף A4 חד בעיצוב שבחרתם.' },
]

export function WeddingInvitation() {
  return <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8" dir="rtl">
    <SEO title="הזמנה לחתונה — עיצוב חינמי עם תמונה ושמות" description="עיצוב הזמנה לחתונה בחינם: סגנונות אלגנטיים, שמות בני הזוג, תמונה, תאריך ומקום. משתפים בוואטסאפ, בסטורי או מדפיסים, עם קישור לאישור הגעה." path="/invitation/wedding" structuredData={faqSchema(INVITE_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בוגה מתחתנים', href: '/wedding' }, { label: 'הזמנה לחתונה' }]} />
    <h1 className="mb-3 text-center text-3xl sm:text-5xl">💌 הזמנה לחתונה</h1>
    <p className="mx-auto max-w-3xl text-center text-base text-slate-600 sm:text-lg">כותבים את השמות, התאריך והאולם, מוסיפים תמונה משותפת אם רוצים — וההזמנה מוכנה לוואטסאפ או להדפסה.</p>
    <InvitationStudio occasion="wedding" />
    <div className="mx-auto mt-10 max-w-3xl"><SeoBody faq={INVITE_FAQ} related={[{ label: 'בוגה מתחתנים — מתכנן החתונה', href: '/wedding' }, { label: 'אישור הגעה לחתונה', href: '/rsvp/wedding' }, { label: 'הזמנה לבר מצווה', href: '/invitation/bar-mitzvah' }]} /></div>
  </div>
}

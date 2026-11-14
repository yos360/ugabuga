import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import SiteInvite from '../../../components/ui/SiteInvite'
import { logEvent, logInviteCta } from '../../../utils/liveActivity'
import { hanukkiahDb, hanukkiahErrorText, hkMemory, newToken, ownerTokenFromHash, hkShareUrl, hkOrganizerUrl } from '../../../utils/hanukkiahDb'
import { HK_KINDS, HK_LIMITS, HK_PATH, NIGHTS, candleSlots, candlesLabel, hanukkahPhase, nightDateLabel, nightName, shabbatNote, shareText, validateCandle, validateTitle, waLink } from '../../../utils/sharedHanukkiah'
import './group.css'
import './shared-hanukkiah.css'
import { card, input, btn, btnMain, btnWa, useToast, copyText, openWhatsApp, ConfirmDialog, Field } from './GroupUi'

const POLL_MS = 20000
const CANDLE_COLORS = ['#7cc4ff', '#ff9ab8', '#ffe27a', '#9be3a4', '#c9a7ff', '#ffb36b', '#8fe0e0', '#ff8f8f']
// Short original wishes for the "idea" button (kid-friendly, no names).
const WISHES = ['שיהיה לכולנו חג מלא אור 🕎', 'בריאות לכל המשפחה', 'שנצליח בלימודים השנה', 'הרבה סופגניות ושמחה!', 'שיהיה שקט ושלום בארץ', 'שכל החברים יהיו שמחים', 'שנמשיך להאיר אחד לשני', 'נס קטן לכל אחד ואחת ✨']

// ── the SVG hanukkiah ─────────────────────────────────────────
// Cups from right to left (night 1's candle stands on the far right), the shamash raised in the middle.
const CUPS_RTL = [362, 326, 290, 254, 146, 110, 74, 38]
const CUP_Y = 128
function Flame({ x, top, i, big }) {
  const h = big ? 24 : 20, w = big ? 8 : 7
  return <g aria-hidden="true">
    <circle cx={x} cy={top - h / 2} r={big ? 20 : 17} fill="url(#hk-glow)" />
    <path className={`hk-flame d${i % 4}`} d={`M${x} ${top - h} C${x + w} ${top - h * 0.55} ${x + w * 0.85} ${top - 2} ${x} ${top} C${x - w * 0.85} ${top - 2} ${x - w} ${top - h * 0.55} ${x} ${top - h}Z`} fill="url(#hk-flame)" />
    <path d={`M${x} ${top - h * 0.5} C${x + 3} ${top - h * 0.3} ${x + 2.5} ${top - 2} ${x} ${top - 1} C${x - 2.5} ${top - 2} ${x - 3} ${top - h * 0.3} ${x} ${top - h * 0.5}Z`} fill="#fff7d6" />
  </g>
}
function HanukkiahSvg({ night, candles = [], label }) {
  const { slots, lit, extra } = candleSlots(night, candles.length)
  // Tonight's slots, left to right: the newest candle (leftmost) is lit first, as with real candles.
  const active = CUPS_RTL.slice(0, slots).sort((a, b) => a - b)
  return <svg className="hk-svg" viewBox="0 0 400 300" role="img" aria-label={label}>
    <defs>
      <radialGradient id="hk-glow"><stop offset="0" stopColor="#ffd56b" stopOpacity=".75" /><stop offset="1" stopColor="#ffd56b" stopOpacity="0" /></radialGradient>
      <linearGradient id="hk-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe066" /><stop offset=".6" stopColor="#ffa31a" /><stop offset="1" stopColor="#ff6a00" /></linearGradient>
      <linearGradient id="hk-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset="1" stopColor="#d99a1e" /></linearGradient>
    </defs>
    {/* arms */}
    {[54, 90, 126, 162].map(d => <path key={d} d={`M${200 - d} ${CUP_Y + 8} Q200 ${CUP_Y + 8 + d * 0.95} ${200 + d} ${CUP_Y + 8}`} fill="none" stroke="url(#hk-gold)" strokeWidth="7" strokeLinecap="round" />)}
    <rect x="195" y="96" width="10" height="160" rx="4" fill="url(#hk-gold)" />
    <path d="M150 268 Q200 238 250 268 Z" fill="url(#hk-gold)" />
    <rect x="140" y="266" width="120" height="12" rx="6" fill="url(#hk-gold)" />
    {/* cups */}
    {CUPS_RTL.map(x => <rect key={x} x={x - 13} y={CUP_Y} width="26" height="11" rx="4" fill="url(#hk-gold)" />)}
    <rect x="187" y="92" width="26" height="11" rx="4" fill="url(#hk-gold)" />
    {/* shamash: always lit — it is the one that lights the others */}
    <rect x="193" y="46" width="14" height="47" rx="3" fill="#fff3d1" />
    <Flame x={200} top={44} i={0} big />
    {/* tonight's candles */}
    {active.map((x, i) => {
      const c = i < lit ? candles[i] : null
      return <g key={x} className={c ? 'hk-new' : undefined}>
        {c && <title>{c.name}</title>}
        <rect x={x - 6} y="82" width="12" height="46" rx="3" fill={CANDLE_COLORS[i % CANDLE_COLORS.length]} opacity={c ? 1 : 0.35} />
        {c ? <Flame x={x} top={80} i={i + 1} /> : <line x1={x} y1="82" x2={x} y2="76" stroke="#fff8e6" strokeOpacity=".5" strokeWidth="1.5" />}
      </g>
    })}
    {extra > 0 && <g>
      <circle cx="36" cy="30" r="22" fill="#f6c35a" />
      <text x="36" y="37" textAnchor="middle" fontSize="19" fontWeight="900" fill="#1b2a66" direction="ltr">+{extra}</text>
    </g>}
  </svg>
}

// ── light a candle ────────────────────────────────────────────
function LightForm({ code, onLit, show, disabled }) {
  const [name, setName] = useState(() => hkMemory.get('name', ''))
  const [wish, setWish] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const idea = useRef(0)
  const submit = async e => {
    e.preventDefault()
    const v = validateCandle({ name, wish })
    if (!v.ok) { setErr(v.error); return }
    setErr(''); setBusy(true)
    try {
      const c = await hanukkiahDb.light(code, hkMemory.deviceToken(), { name: v.name, wish: v.wish })
      hkMemory.set('name', v.name)
      setWish(''); onLit(c)
    } catch (e2) { if (e2.code === 'already_lit') onLit(null); show(hanukkiahErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="space-y-3">
    <Field label="השם שלכם" hint="(שם פרטי או כינוי)"><input className={input} value={name} maxLength={HK_LIMITS.name} onChange={e => setName(e.target.value)} placeholder="למשל: נועה" autoComplete="given-name" disabled={disabled} /></Field>
    <Field label="משאלה קטנה" hint="(לא חובה)">
      <input className={input} value={wish} maxLength={HK_LIMITS.wish} onChange={e => setWish(e.target.value)} placeholder="למשל: שיהיה לכולנו חג מלא אור" disabled={disabled} />
      <span className="mt-1 flex items-center justify-between text-sm font-normal text-slate-500">
        <button type="button" disabled={disabled} onClick={() => { setWish(WISHES[idea.current % WISHES.length]); idea.current++ }} className="min-h-[44px] font-bold text-slate-700 underline">💡 רעיון למשאלה</button>
        <span>{wish.length}/{HK_LIMITS.wish}</span>
      </span>
    </Field>
    {err && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">{err}</p>}
    <button disabled={busy || disabled} className={`${btnMain} w-full`}>{busy ? 'מדליקים…' : '🕯️ הדלקת נר הערב'}</button>
    <p className="text-sm text-slate-500">שם פרטי בלבד, בלי שם משפחה ובלי פרטים אישיים. נר אחד לכל טלפון בכל ערב.</p>
  </form>
}

// ── the shared hanukkiah page ─────────────────────────────────
function HanukkiahView({ code, token, show, onDeleted, fresh }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [owner, setOwner] = useState(Boolean(token))
  const [viewNight, setViewNight] = useState(null) // null = tonight
  const [confirm, setConfirm] = useState(null)
  const [editing, setEditing] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const load = useCallback(async () => {
    try {
      const dev = hkMemory.deviceToken()
      let row = null
      if (owner) { try { row = await hanukkiahDb.owner(code, token, dev, viewNight) } catch (e) { if (e.code !== 'not_owner') throw e; setOwner(false) } }
      if (!row) row = await hanukkiahDb.get(code, dev, viewNight)
      setData(row); setError(''); setNow(Date.now())
      if (row.owner) hkMemory.rememberOwned(code, token, row.title)
    } catch (e) { setError(e.code || 'network') }
  }, [code, token, owner, viewNight])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') load() }, POLL_MS)
    return () => clearInterval(t)
  }, [load])

  if (error) return <div className="mx-auto max-w-lg py-10 text-center">
    <p className="text-5xl" aria-hidden="true">{error === 'not_installed' ? '🛠️' : '🔍'}</p>
    <p className="mt-3 text-xl font-bold">{hanukkiahErrorText(error)}</p>
    <Link to={HK_PATH} className={`${btn} mt-6`}>פתיחת חנוכייה משותפת חדשה</Link>
  </div>
  if (!data) return <p className="py-16 text-center text-lg">טוענים…</p>

  const { phase, night: tonight, days } = hanukkahPhase(now)
  const kind = HK_KINDS[data.kind] || HK_KINDS.family
  const shown = data.shown || 1
  const isTonight = phase === 'during' && shown === tonight
  const candles = data.candles || []
  const link = hkShareUrl(code)
  const share = () => { logEvent('share', HK_PATH, null, 'whatsapp'); openWhatsApp(shareText({ title: data.title, link, time: Date.now(), lit: phase === 'during' ? (data.nights?.[tonight - 1] || 0) : 0 })) }
  const lastNight = phase === 'during' ? tonight : phase === 'after' ? NIGHTS : 0
  const lit = c => {
    setViewNight(null)
    if (c) setData(d => ({ ...d, lit_tonight: true, total: d.total + 1, candles: d.shown === tonight ? [...d.candles, c] : d.candles, nights: d.nights?.map((x, i) => i === tonight - 1 ? x + 1 : x) }))
    else setData(d => ({ ...d, lit_tonight: true }))
    if (c) show(`✓ הנר שלך דולק! ${nightName(tonight)} — חג שמח 🕎`)
    load()
  }
  const remove = async c => {
    setConfirm(null)
    try {
      if (c.mine) await hanukkiahDb.unlight(code, hkMemory.deviceToken(), c.id); else await hanukkiahDb.ownerRemove(code, token, c.id)
      setData(d => ({ ...d, total: Math.max(0, d.total - 1), lit_tonight: c.mine && c.night === tonight ? false : d.lit_tonight, candles: d.candles.filter(x => x.id !== c.id), nights: d.nights?.map((x, i) => i === c.night - 1 ? Math.max(0, x - 1) : x) }))
      show('הנר הוסר')
    } catch (e) { show(hanukkiahErrorText(e.code), 'err') }
  }
  const note = isTonight ? shabbatNote(tonight) : ''
  const svgLabel = phase === 'before'
    ? `חנוכייה ריקה — הנר הראשון ביום שישי 4.12 בערב`
    : `חנוכייה של ${nightName(shown)}: ${Math.min(candles.length, shown)} מתוך ${shown} נרות דולקים${candles.length > shown ? `, ועוד ${candles.length - shown}` : ''}`

  return <div className="space-y-6">
    {fresh && owner && <section className="rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center">
      <p className="text-2xl font-black">🎉 החנוכייה מוכנה!</p>
      <p className="mt-1 text-lg">עכשיו שולחים את הקישור לקבוצה בוואטסאפ — וכל ערב כל אחד מדליק נר.</p>
      <button onClick={share} className={`${btnWa} mt-3 w-full sm:w-auto`}>📱 שליחה לקבוצה בוואטסאפ</button>
    </section>}

    <section className="hk-sky px-4 pb-6 pt-7 text-center sm:px-8">
      <p className="text-sm font-bold opacity-80">{kind.emoji} {kind.label} · חנוכה {'תשפ״ז'}</p>
      <h1 className="mt-1 text-3xl font-black sm:text-5xl">{data.title}</h1>
      <p className="mt-2 text-lg font-bold">
        {phase === 'before' && (days > 1 ? `⏳ עוד ${days} ימים לנר הראשון` : days === 1 ? '⏳ הנר הראשון מחר בערב!' : '⏳ הנר הראשון הערב!')}
        {phase === 'during' && (isTonight ? `✨ הערב: ${nightName(tonight)} · ${nightDateLabel(tonight)}` : `📖 ${nightName(shown)} · ${nightDateLabel(shown)}`)}
        {phase === 'after' && `🕎 חנוכה הסתיים — ${nightName(shown)}`}
      </p>
      <div className="mt-3"><HanukkiahSvg night={phase === 'before' ? 1 : shown} candles={phase === 'before' ? [] : candles} label={svgLabel} /></div>
      <p className="mt-2 text-xl font-black">🕯️ {data.total > 0 ? `${candlesLabel(data.total)} הודלקו בקבוצה בחנוכה הזה` : 'עוד לא הודלקו נרות'}</p>
      {data.people > 1 && <p className="text-sm opacity-80">מ־{data.people} טלפונים שונים</p>}
      {lastNight > 1 && <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="בחירת ערב">
        {Array.from({ length: lastNight }, (_, i) => i + 1).map(n => <button key={n} type="button" className="hk-chip" aria-pressed={shown === n} onClick={() => setViewNight(phase === 'during' && n === tonight ? null : n)}
          aria-label={`${nightName(n)}: ${candlesLabel(data.nights?.[n - 1] || 0)}`}>{n}</button>)}
      </div>}
    </section>

    {note && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-center text-[17px]">{note}</p>}

    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-labelledby="hk-who">
        <h2 id="hk-who" className="mb-3 text-2xl font-bold">{phase === 'before' ? 'מי ידליק?' : isTonight ? 'מי הדליק הערב' : `מי הדליק ב${nightName(shown)}`}{candles.length > 0 && ` (${candles.length})`}</h2>
        {phase === 'before'
          ? <p className="rounded-2xl border-2 border-dashed border-slate-300 px-4 py-8 text-center text-lg text-slate-600">ההדלקה נפתחת ביום שישי 4.12 בערב. בינתיים — שלחו את הקישור לקבוצה, כדי שכולם יהיו מוכנים לנר הראשון 🕎</p>
          : candles.length === 0
            ? <p className="rounded-2xl border-2 border-dashed border-slate-300 py-8 text-center text-lg text-slate-500">{isTonight ? 'עוד אין נרות הערב. מי מדליק ראשון? 🕯️' : 'בערב הזה לא הודלקו נרות.'}</p>
            : <ul className="hk-list grid gap-2 sm:grid-cols-2">{candles.map((c, i) => <li key={c.id} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-6 w-2.5 shrink-0 rounded-sm" style={{ background: CANDLE_COLORS[i % CANDLE_COLORS.length] }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <b className="block text-lg">{c.name}{c.mine && <span className="ms-1 text-sm font-normal text-slate-500">(אני)</span>}</b>
                {c.wish && <span className="block break-words leading-relaxed text-slate-700">{c.wish}</span>}
              </span>
              {(c.mine || owner) && <button type="button" onClick={() => setConfirm(c)} className="min-h-[44px] shrink-0 px-1 text-sm text-rose-700 underline" aria-label={`הסרת הנר של ${c.name}`}>הסרה</button>}
            </li>)}</ul>}
      </section>

      <aside className="space-y-4">
        <section className={card}>
          {phase === 'during' && !data.lit_tonight && <>
            <h2 className="mb-3 text-2xl font-bold">מדליקים נר ל{nightName(tonight)}</h2>
            <LightForm code={code} onLit={lit} show={show} />
          </>}
          {phase === 'during' && data.lit_tonight && <div className="text-center">
            <p className="text-4xl" aria-hidden="true">🕯️</p>
            <h2 className="mt-1 text-2xl font-bold">הנר שלכם דולק הערב</h2>
            <p className="mt-1 text-slate-600">{tonight < NIGHTS ? `נתראה מחר בערב ב${nightName(tonight + 1)}!` : 'זה היה הנר האחרון של חנוכה. חג שמח!'}</p>
          </div>}
          {phase === 'before' && <div className="text-center">
            <h2 className="text-2xl font-bold">ההדלקה מתחילה בנר הראשון</h2>
            <p className="mt-1 text-slate-600">יום שישי 4.12.2026 בערב. בכל ערב של חנוכה כל אחד מדליק כאן נר — עם השם שלו ומשאלה קטנה.</p>
          </div>}
          {phase === 'after' && <div className="text-center">
            <h2 className="text-2xl font-bold">תודה שהדלקתם יחד! 🕎</h2>
            <p className="mt-1 text-slate-600">{candlesLabel(data.total)} הודלקו בקבוצה בשמונת ערבי החג.</p>
          </div>}
          <button onClick={share} className={`${btnWa} mt-4 w-full`}>📱 {phase === 'during' ? 'הזמנת כולם להדליק בוואטסאפ' : 'שליחה לקבוצה בוואטסאפ'}</button>
          <button onClick={() => copyText(waLink(link), show, 'הקישור הועתק ✓')} className={`${btn} mt-2 w-full`}>🔗 העתקת קישור</button>
        </section>

        {owner && <section className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
          <h2 className="font-display text-2xl font-bold">למארגנים</h2>
          {editing
            ? <EditForm data={data} code={code} token={token} show={show} onSaved={row => { setData(d => ({ ...d, ...row })); hkMemory.rememberOwned(code, token, row.title); setEditing(false); show('✓ נשמר') }} onCancel={() => setEditing(false)} />
            : <button onClick={() => setEditing(true)} className={`${btn} mt-3 w-full`}>✏️ שינוי השם</button>}
          <p className="mt-3 text-sm text-slate-700">רואים שם או משאלה שלא מתאימים? לחצו „הסרה” ליד הנר.</p>
          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <p>פותחים מטלפון אחר? <button onClick={() => copyText(hkOrganizerUrl(code, token), show, 'קישור הניהול הועתק ✓ שמרו אותו לעצמכם בלבד')} className="min-h-[44px] font-bold underline">🔑 העתקת קישור ניהול</button> — שמרו אותו לעצמכם בלבד.</p>
            <button onClick={() => setConfirm('all')} className="min-h-[44px] text-rose-700 underline">🗑️ מחיקת החנוכייה</button>
          </div>
        </section>}

        {!owner && <Link to={HK_PATH} onClick={() => logInviteCta('hanukkiah', HK_PATH)} className="block rounded-2xl bg-violet-600 p-4 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-700">
          <span className="block text-lg font-black">🕎 רוצים חנוכייה כזאת למשפחה או לכיתה?</span>
          <span className="block text-white/90">פותחים בחינם בחצי דקה, בלי הרשמה</span>
        </Link>}
      </aside>
    </div>
    {!owner && <SiteInvite context="kids" />}

    {confirm === 'all' && <ConfirmDialog title="למחוק את החנוכייה?" text="כל הנרות והמשאלות יימחקו, והקישור יפסיק לעבוד." yes="כן, למחוק" onClose={() => setConfirm(null)}
      onYes={async () => { setConfirm(null); try { await hanukkiahDb.remove(code, token); hkMemory.forgetOwned(code); onDeleted() } catch (e) { show(hanukkiahErrorText(e.code), 'err') } }} />}
    {confirm && confirm !== 'all' && <ConfirmDialog title={confirm.mine ? 'להסיר את הנר שלך?' : `להסיר את הנר של ${confirm.name}?`} text={confirm.mine ? 'אפשר להדליק שוב הערב אחרי ההסרה.' : 'השם והמשאלה יוסרו מהחנוכייה.'} yes="הסרה" onClose={() => setConfirm(null)} onYes={() => remove(confirm)} />}
  </div>
}

function KindPicker({ value, onChange }) {
  return <fieldset><legend className="font-bold">של מי החנוכייה?</legend>
    <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(HK_KINDS).map(([k, o]) => <button type="button" key={k} onClick={() => onChange(k)} aria-pressed={value === k}
      className={`min-h-[48px] rounded-xl border-2 px-2 font-bold ${value === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>{o.emoji} {o.label}</button>)}</div>
  </fieldset>
}

function EditForm({ data, code, token, show, onSaved, onCancel }) {
  const [title, setTitle] = useState(data.title)
  const [kind, setKind] = useState(data.kind)
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    const v = validateTitle(title)
    if (!v.ok) { show(v.error, 'err'); return }
    setBusy(true)
    try { onSaved(await hanukkiahDb.update(code, token, { title: v.title, kind })) } catch (e2) { show(hanukkiahErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="mt-3 space-y-3">
    <Field label="שם החנוכייה"><input className={input} value={title} maxLength={HK_LIMITS.title} onChange={e => setTitle(e.target.value)} /></Field>
    <KindPicker value={kind} onChange={setKind} />
    <div className="flex gap-2"><button disabled={busy} className={`${btnMain} flex-1`}>{busy ? 'שומרים…' : 'שמירה'}</button>
      <button type="button" onClick={onCancel} className="min-h-[44px] px-2 text-slate-500 underline">ביטול</button></div>
  </form>
}

function CreateForm({ show, onCreated }) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('family')
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    const v = validateTitle(title)
    if (!v.ok) { show(v.error, 'err'); return }
    setBusy(true)
    try {
      const t = newToken()
      const row = await hanukkiahDb.create(t, { title: v.title, kind })
      hkMemory.rememberOwned(row.code, t, row.title)
      onCreated(row, t)
    } catch (e2) { show(hanukkiahErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="space-y-4">
    <KindPicker value={kind} onChange={setKind} />
    <Field label="שם החנוכייה"><input className={input} value={title} maxLength={HK_LIMITS.title} onChange={e => setTitle(e.target.value)} placeholder={`למשל: ${HK_KINDS[kind].example}`} /></Field>
    <button disabled={busy} className={`${btnMain} w-full`}>{busy ? 'רגע…' : '🕎 פתיחת חנוכייה משותפת'}</button>
    <p className="text-sm text-slate-500">בחינם, בלי הרשמה. מקבלים קישור לשליחה בקבוצה, וקישור ניהול שנשאר אצלכם.</p>
  </form>
}

const FAQ = [
  { q: 'מה זו חנוכייה משותפת?', a: 'חנוכייה אחת לכל הקבוצה — משפחה, כיתה, גן או חברים. שולחים קישור לקבוצה בוואטסאפ, ובכל ערב של חנוכה כל אחד נכנס, כותב את השם שלו ומדליק נר. ככל שיותר אנשים מדליקים — החנוכייה מאירה יותר.' },
  { q: 'כמה נרות יש בחנוכייה בכל ערב?', a: 'כמו בחנוכייה אמיתית: בערב הראשון מקום לנר אחד ועוד השמש, ובכל ערב מתווסף מקום לנר נוסף, עד שמונה נרות בערב האחרון. אם מדליקים יותר אנשים מהמקומות, רואים „+” עם המספר, וכל השמות מופיעים ברשימה.' },
  { q: 'מתי אפשר להדליק?', a: 'בחנוכה תשפ״ז הנר הראשון ביום שישי 4.12.2026 בערב והנר השמיני ביום שישי 11.12. כל ערב נפתחת חנוכייה חדשה בשעה 14:00 (שעון ישראל) — כדי שגם ביום שישי, שבו מדליקים לפני כניסת השבת, אפשר יהיה להדליק בזמן — והיא פתוחה עד 14:00 למחרת. אפשר לפתוח חנוכייה ולשלוח את הקישור כבר עכשיו.' },
  { q: 'צריך להירשם או להוריד אפליקציה?', a: 'לא. פותחים את הקישור בטלפון, כותבים שם פרטי ולוחצים „הדלקת נר”. בלי הרשמה, בלי סיסמה ובלי אפליקציה.' },
  { q: 'זה בטוח לילדים?', a: 'כן. כותבים שם פרטי או כינוי בלבד ומשאלה קצרה, בלי תמונות, בלי קישורים ובלי מספרי טלפון. מסנן מילים חוסם תוכן לא מתאים, ומי שפתח את החנוכייה יכול להסיר כל שם או משאלה. החנוכייה נמחקת אוטומטית כמה חודשים אחרי החג.' },
  { q: 'אפשר להשתמש בזה בכיתה או בגן?', a: 'בהחלט. המורה או הגננת פותחים חנוכייה לכיתה, שולחים לקבוצת ההורים, וכל ערב הילדים מדליקים נר מהבית. אפשר גם להקרין את החנוכייה על הלוח בבוקר ולספור יחד כמה נרות הודלקו.' },
]

function Guide() {
  return <section className="mx-auto mt-14 max-w-4xl">
    <h2 className="mb-2 text-3xl font-bold">רעיונות לחנוכייה משותפת</h2>
    <div className="mb-10 grid gap-3 sm:grid-cols-2">
      {[['🏫', 'חנוכייה כיתתית', 'המורה פותחת חנוכייה לכיתה ושולחת לקבוצת ההורים. בבוקר מקרינים על הלוח: מי הדליק אתמול? כמה נרות הודלקו כבר?'],
        ['👵', 'סבא וסבתא מרחוק', 'כל הנכדים מדליקים בחנוכייה של המשפחה, גם אם גרים בערים שונות — וסבא וסבתא רואים את כל השמות והמשאלות.'],
        ['🧸', 'הגן מדליק יחד', 'הגננת פותחת חנוכייה לגן. ההורים מדליקים עם הילדים בבית, ובגן מספרים מה ביקשו במשאלה.'],
        ['🤗', 'חברים ושכנים', 'קבוצת החבר׳ה, הבניין או חוג הכדורגל — חנוכייה אחת שמחברת את כולם בכל ערב של החג.'],
      ].map(([e, t, d]) => <div key={t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4">
        <span className="text-3xl" aria-hidden="true">{e}</span><h3 className="mt-1 text-lg font-bold">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></div>)}
    </div>
    <SeoBody paragraphs={[
      'חנוכייה משותפת היא דרך פשוטה להדליק נרות יחד גם כשלא נמצאים באותו בית. פותחים חנוכייה לכיתה, לגן או למשפחה, שולחים את הקישור בקבוצת הוואטסאפ — ובכל ערב של חנוכה כל אחד מוסיף נר עם השם שלו ומשאלה קטנה. החנוכייה מתמלאת לאט לאט, ממש כמו חנוכייה אמיתית: בערב הראשון נר אחד ושמש, ובערב השמיני שמונה נרות.',
      'הכלי חינמי לגמרי ולא דורש הרשמה. הוא מתאים במיוחד למורות ולגננות שרוצות פעילות חנוכה כיתתית שממשיכה לאורך כל החג, למשפחות מורחבות שגרות רחוק אחת מהשנייה, ולכל קבוצה שרוצה להרגיש ביחד בחג האורים. אחרי ההדלקה אפשר להמשיך לשירי חנוכה, לברכות ההדלקה ולזמני הדלקת הנרות בעיר שלכם.',
    ]} faq={FAQ} related={[
      { label: 'זמני הדלקת נרות חנוכה', href: '/holidays/hanukkah/candle-times' },
      { label: 'ברכות הדלקת נרות חנוכה', href: '/holidays/hanukkah/candle-lighting' },
      { label: 'שירי חנוכה', href: '/holidays/hanukkah/songs' },
      { label: 'ברכות לחנוכה', href: '/holidays/hanukkah/greetings' },
      { label: 'קיר ברכות לגננת ולמורה', href: '/thank-you-wall' },
      { label: 'כל מה שצריך לחנוכה', href: '/holidays/hanukkah' },
    ]} />
  </section>
}

export default function SharedHanukkiah() {
  const { code: pathCode } = useParams()
  const [code, setCode] = useState(pathCode || null)
  const [token, setToken] = useState(() => pathCode ? ownerTokenFromHash(pathCode) || hkMemory.ownerToken(pathCode) : null)
  const [fresh, setFresh] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [toast, show] = useToast()
  const mine = useMemo(() => hkMemory.owned().slice(0, 5), [])
  const demo = useMemo(() => [{ id: 'a', name: 'נועה' }, { id: 'b', name: 'יואב' }, { id: 'c', name: 'סבתא רותי' }], [])

  let body
  if (deleted) body = <div className="py-10 text-center"><p className="text-xl font-bold">🗑️ החנוכייה נמחקה</p><a href={HK_PATH} className={`${btn} mt-6`}>פתיחת חנוכייה חדשה</a></div>
  else if (code) body = <HanukkiahView key={code} code={code} token={token} show={show} fresh={fresh} onDeleted={() => setDeleted(true)} />
  else body = <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
    <section className={card}><h2 className="mb-4 text-2xl font-bold">פותחים חנוכייה משותפת</h2><CreateForm show={show} onCreated={(row, t) => {
      window.history.replaceState(window.history.state, '', `${HK_PATH}/${row.code}`)
      setToken(t); setCode(row.code); setFresh(true); window.scrollTo({ top: 0, behavior: 'smooth' })
    }} /></section>
    <aside className="space-y-4">
      <div className="hk-sky p-4 text-center"><HanukkiahSvg night={4} candles={demo} label="דוגמה: חנוכייה של הנר הרביעי, שלושה נרות דולקים" />
        <p className="mt-1 font-bold">הנר הרביעי · 3 מתוך 4 דולקים</p></div>
      <div className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
        <h2 className="font-display text-2xl font-bold">איך זה עובד?</h2>
        <ol className="mt-3 list-decimal space-y-2 pr-5"><li>פותחים חנוכייה ונותנים לה שם.</li><li>שולחים את הקישור לקבוצה בוואטסאפ.</li><li>בכל ערב של חנוכה כל אחד מדליק נר עם השם שלו.</li><li>רואים את החנוכייה מתמלאת — ערב אחרי ערב.</li></ol>
        {mine.length > 0 && <p className="mt-4 text-sm"><b>החנוכיות שלי:</b> {mine.map((l, n) => <span key={l.code}>{n > 0 && ' · '}<a className="underline" href={`${HK_PATH}/${l.code}`}>{l.title || l.code}</a></span>)}</p>}
      </div>
    </aside>
  </div>

  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
    <SEO title="חנוכייה משותפת לכיתה ולמשפחה — מדליקים נר יחד בוואטסאפ" description="חנוכייה משותפת בחינם: פותחים חנוכייה לכיתה, לגן או למשפחה, שולחים קישור לקבוצת הוואטסאפ, ובכל ערב של חנוכה כל אחד מדליק נר עם השם שלו ומשאלה קטנה. בלי הרשמה." path={HK_PATH} noindex={Boolean(pathCode)} structuredData={code ? null : faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חנוכה', href: '/holidays/hanukkah' }, { label: 'החנוכייה המשותפת', href: code ? HK_PATH : undefined }]} />
    {!code && <header className="mb-7 text-center">
      <h1 className="text-4xl sm:text-5xl">🕎 החנוכייה המשותפת</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">חנוכייה אחת לכל הכיתה, הגן או המשפחה: שולחים קישור לקבוצה בוואטסאפ, ובכל ערב של חנוכה כל אחד מדליק נר עם השם שלו ומשאלה קטנה. בחינם ובלי הרשמה.</p>
    </header>}
    {body}
    {!code && <Guide />}
    {toast}
  </div>
}

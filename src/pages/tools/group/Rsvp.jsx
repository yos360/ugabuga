import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import PrintPreview from '../../../components/ui/PrintPreview'
import { rsvpDb, groupMemory, groupErrorText, newToken, tokenFromHash, shareUrl, organizerUrl } from '../../../utils/groupDb'
import { LIMITS, cleanText, parseNames, validateRsvpAnswer, rsvpTotals, missingInvitees, rsvpInviteText, rsvpReminderText, formatDate, peopleLabel, countLabel } from '../../../utils/groupTools'
import { card, input, btn, btnMain, btnWa, useToast, copyText, openWhatsApp, ConfirmDialog, ErrorPanel, Stepper, Field, OrganizerTools } from './GroupUi'
import { isRsvpV2, RESPONSE_FILTERS, filterResponses, responseCsv } from '../../../utils/rsvpExperience'
import { InvitationCard, ThemePicker, RsvpCreateExperience, RsvpGuestExperience, EventActions } from './RsvpExperience'
import SiteInvite from '../../../components/ui/SiteInvite'
import NotFound from '../../NotFound'
import { RSVP_TYPES, rsvpType } from '../../../utils/rsvpTypes'
import { RSVP_LANGS, t, translateError } from '../../../utils/rsvpI18n'

const KIND = 'rsvp'
const POLL_MS = 15000
const STATUS = {
  yes: { label: 'מגיעים', emoji: '🎉', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  maybe: { label: 'אולי', emoji: '🤔', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  no: { label: 'לא מגיעים', emoji: '😢', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
}
const emptyEvent = (params, preset) => ({
  kind: preset ? preset.kind : params.get('kind') === 'general' ? 'general' : 'kids',
  title: cleanText(params.get('title'), LIMITS.title) || preset?.title || 'יום ההולדת של ___',
  date: /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : '',
  time: cleanText(params.get('time'), 20), place: cleanText(params.get('place'), LIMITS.place),
  deadline: '', note: '', invitees: '', theme: preset?.theme || 'party',
  extras: preset ? { type: preset.slug } : {},
})
const toForm = ev => ({ extras: { ...(ev.extras || {}) }, kind: ev.kind, title: ev.title, date: ev.date || '', time: ev.time || '', place: ev.place || '', deadline: ev.deadline || '', note: ev.note || '', invitees: (ev.invitees || []).join('\n') })
// The extras the organizer filled in (empty values are dropped by the database too).
const extrasOf = f => {
  const x = f.extras || {}
  return { type: x.type, lang: x.lang && x.lang !== 'he' ? x.lang : undefined, parking: cleanText(x.parking, 300) || undefined,
    price: Number(x.price) > 0 ? Number(x.price) : undefined, pay_link: /^https:\/\//.test(x.pay_link || '') ? x.pay_link.trim() : undefined,
    tables: Number(x.tables) > 0 ? Math.min(200, Math.floor(Number(x.tables))) : undefined, show_table: Boolean(x.show_table) || undefined }
}
const hasExtras = x => Object.values(x).some(v => v !== undefined)
const fromForm = f => ({ kind: f.kind, title: cleanText(f.title, LIMITS.title), date: f.date || null, time: cleanText(f.time, 20), place: cleanText(f.place, LIMITS.place), deadline: f.deadline || null, note: cleanText(f.note, LIMITS.note, true), invitees: parseNames(f.invitees, LIMITS.maxInvitees).slice(0, LIMITS.maxInvitees) })

// ── organizer: event details form (create + edit) ─────────────
const pinOk = pin => /^\d{4}$/.test(pin || '')
function PinInput({ value, onChange, label = 'הקוד' }) {
  return <input className={`${input} max-w-[9rem] text-center text-2xl tracking-[0.4em]`} dir="ltr" inputMode="numeric" autoComplete="off" maxLength={4} aria-label={label}
    value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
}

function EventForm({ value, onChange, onSubmit, busy, submitLabel, withPin = false }) {
  const set = (k, v) => onChange({ ...value, [k]: v })
  const inviteeCount = parseNames(value.invitees, LIMITS.maxInvitees).length
  return <form onSubmit={e => { e.preventDefault(); onSubmit() }} className="space-y-4">
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="סוג האירוע">
      {[['kids', '🎈 מסיבת ילדים'], ['general', '🥂 אירוע אחר']].map(([k, l]) => <button type="button" key={k} onClick={() => set('kind', k)} aria-pressed={value.kind === k}
        className={`min-h-[48px] rounded-xl border-2 font-bold ${value.kind === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>{l}</button>)}
    </div>
    <Field label="שם האירוע"><input className={input} value={value.title} maxLength={LIMITS.title} required onChange={e => set('title', e.target.value)}
      onFocus={e => { const at = e.target.value.indexOf('___'); if (at >= 0) e.target.setSelectionRange(at, at + 3) }} placeholder="למשל: יום ההולדת של נועה" /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label="תאריך"><input type="date" className={input} value={value.date} onChange={e => set('date', e.target.value)} /></Field>
      <Field label="שעה"><input className={input} dir="ltr" value={value.time} maxLength={20} onChange={e => set('time', e.target.value)} placeholder="17:00–19:00" /></Field>
    </div>
    <Field label="מקום"><input className={input} value={value.place} maxLength={LIMITS.place} onChange={e => set('place', e.target.value)} placeholder="כתובת, שם הגן או הפארק" /></Field>
    <Field label="לאשר עד" hint="(לא חובה)"><input type="date" className={input} value={value.deadline} onChange={e => set('deadline', e.target.value)} /></Field>
    <Field label="הערה לאורחים" hint="(לא חובה)"><textarea className={`${input} min-h-[72px]`} value={value.note} maxLength={LIMITS.note} onChange={e => set('note', e.target.value)} placeholder="למשל: להביא בגד ים, בלי מתנות" /></Field>
    <Field label="רשימת מוזמנים" hint="(לא חובה — שם בכל שורה, כדי לראות מי עוד לא ענה)">
      <textarea className={`${input} min-h-[96px]`} value={value.invitees} onChange={e => set('invitees', e.target.value)} placeholder={'נועה\nיואב\nאורי'} />
      {inviteeCount > 0 && <span className="mt-1 block text-sm font-normal text-slate-500">{inviteeCount} מוזמנים{inviteeCount >= LIMITS.maxInvitees ? ` (עד ${LIMITS.maxInvitees})` : ''}</span>}
    </Field>
    <ExtrasFields value={value.extras || {}} onChange={x => set('extras', x)} open={Boolean(rsvpType(value.extras?.type)?.vaad)} />
    {withPin && <div className="rounded-xl bg-amber-50 p-3">
      <Field label="🔑 קוד מארגן — 4 ספרות שתזכרו"><PinInput value={value.pin || ''} onChange={v => set('pin', v)} label="קוד מארגן" /></Field>
      <p className="mt-1 text-sm text-slate-600">כדי לראות את התשובות מכל טלפון: פותחים את הקישור ששלחתם לאורחים, לוחצים „אני המארגן/ת” ומקלידים את הקוד.</p>
    </div>}
    <p className="text-sm text-slate-500">שמות פרטיים בלבד. הדף נמחק אוטומטית חודשיים אחרי האירוע.</p>
    <button disabled={busy || !cleanText(value.title, LIMITS.title) || (withPin && !pinOk(value.pin))} className={`${btnMain} w-full`}>{busy ? 'רגע…' : submitLabel}</button>
  </form>
}

// Optional extras, folded away so the basic form stays short.
function ExtrasFields({ value, onChange, open }) {
  const set = (k, v) => onChange({ ...value, [k]: v })
  const used = Boolean(value.lang && value.lang !== 'he') || value.parking || Number(value.price) > 0 || Number(value.tables) > 0
  return <details className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3" open={open || used || undefined}>
    <summary className="cursor-pointer font-bold">⚙️ אפשרויות נוספות <span className="font-normal text-slate-500">(לא חובה)</span></summary>
    <div className="mt-3 space-y-4">
      <Field label="🌍 שפת הטופס לאורחים" hint="(כל אורח יכול גם להחליף בעצמו)">
        <select className={input} value={value.lang || 'he'} onChange={e => set('lang', e.target.value)}>{RSVP_LANGS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
      </Field>
      <Field label="🅿️ חנייה והגעה" hint="(מופיע לאורחים ליד כפתורי Waze ו-Google Maps)"><input className={input} value={value.parking || ''} maxLength={300} onChange={e => set('parking', e.target.value)} placeholder="למשל: חניה חינם ברחוב הסמוך, כניסה מהשער האחורי" /></Field>
      <div className="grid grid-cols-[8rem_1fr] gap-3">
        <Field label="💳 דמי השתתפות"><input className={input} type="number" inputMode="decimal" min="0" max="10000" value={value.price || ''} onChange={e => set('price', e.target.value)} placeholder="₪" /></Field>
        <Field label="קישור לתשלום" hint="(ביט, פייבוקס)"><input className={input} dir="ltr" value={value.pay_link || ''} maxLength={300} onChange={e => set('pay_link', e.target.value)} placeholder="https://" /></Field>
      </div>
      <div className="grid grid-cols-[8rem_1fr] items-end gap-3">
        <Field label="🪑 מספר שולחנות"><input className={input} type="number" inputMode="numeric" min="0" max="200" value={value.tables || ''} onChange={e => set('tables', e.target.value)} placeholder="0" /></Field>
        {Number(value.tables) > 0 && <label className="flex min-h-[48px] items-center gap-2 font-bold"><input type="checkbox" className="h-5 w-5" checked={Boolean(value.show_table)} onChange={e => set('show_table', e.target.checked)} /> להציג לכל אורח את השולחן שלו</label>}
      </div>
      <p className="text-sm text-slate-500">דמי השתתפות: האתר לא גובה כסף — רק מציג לאורחים את הסכום והקישור, ובדף הניהול מסמנים מי שילם.</p>
    </div>
  </details>
}

// ── guest: answer form ────────────────────────────────────────
function AnswerForm({ ev, mine, onSaved, show, lang = 'he' }) {
  const L = (key, vars) => t(lang, key, vars)
  const kids = ev.kind === 'kids'
  const [a, setA] = useState(() => mine ? { ...mine, allergies: mine.allergies || '', pickup: mine.pickup || '', note: mine.note || '' }
    : { name: groupMemory.get('rsvp-name', ''), status: '', kids: kids ? 1 : 0, adults: kids ? 0 : 1, allergies: '', pickup: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setA(x => ({ ...x, [k]: v }))
  const submit = async e => {
    e.preventDefault()
    const v = validateRsvpAnswer(a)
    if (!v.ok) { setErr(translateError(lang, v.error)); return }
    setErr(''); setBusy(true)
    try {
      const saved = await rsvpDb.answer(ev.code, groupMemory.deviceToken(KIND), { ...a, name: cleanText(a.name, LIMITS.guestName) })
      groupMemory.set('rsvp-name', saved.name)
      onSaved(saved)
    } catch (e2) { show(groupErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  const coming = a.status && a.status !== 'no'
  return <form onSubmit={submit} className="space-y-4">
    <Field label={L(kids ? 'childName' : 'yourName')}>
      <input className={input} value={a.name} maxLength={LIMITS.guestName} onChange={e => set('name', e.target.value)} placeholder={L(kids ? 'phChild' : 'phName')} autoComplete="given-name" />
    </Field>
    {ev.invitees?.length > 0 && !a.name && <div className="flex flex-wrap gap-2" aria-label="בחירה מהרשימה">
      {ev.invitees.map(n => <button type="button" key={n} onClick={() => set('name', n)} className="min-h-[40px] rounded-full border-2 border-slate-200 bg-white px-3 font-bold">{n}</button>)}
    </div>}
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="תשובה">
      {Object.entries(STATUS).map(([k, s]) => <button type="button" key={k} onClick={() => set('status', k)} aria-pressed={a.status === k}
        className={`min-h-[72px] rounded-2xl border-2 px-1 font-bold leading-tight ${a.status === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
        <span className="block text-2xl" aria-hidden="true">{s.emoji}</span>{L(k)}</button>)}
    </div>
    {coming && <div className="space-y-2">
      {kids ? <><Stepper label={L('kids')} value={Number(a.kids)} onChange={v => set('kids', v)} /><Stepper label={L('adultsStay')} value={Number(a.adults)} onChange={v => set('adults', v)} /></>
        : <><Stepper label={L('adults')} value={Number(a.adults)} onChange={v => set('adults', v)} /><Stepper label={L('kids')} value={Number(a.kids)} onChange={v => set('kids', v)} /></>}
      <Field label={L('allergies')} hint={L('optional')}><input className={input} value={a.allergies} maxLength={LIMITS.allergies} onChange={e => set('allergies', e.target.value)} placeholder={L('phAllergies')} /></Field>
      {kids && <Field label={L('pickup')} hint={L('optional')}><input className={input} value={a.pickup} maxLength={LIMITS.pickup} onChange={e => set('pickup', e.target.value)} placeholder={L('phPickup')} /></Field>}
    </div>}
    {a.status && <Field label={L('note')} hint={L('optional')}><input className={input} value={a.note} maxLength={200} onChange={e => set('note', e.target.value)} placeholder={L(a.status === 'no' ? 'phNoteNo' : 'phNoteYes')} /></Field>}
    {err && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">{err}</p>}
    <button disabled={busy || !a.status} className={`${btnMain} w-full`}>{L(busy ? 'sending' : mine ? 'update' : 'send')}</button>
    <p className="text-center text-sm text-slate-500">{L('privacy')}</p>
  </form>
}

function icsFile(ev) {
  const d = (ev.date || '').replace(/-/g, '')
  const t = /(\d{1,2}):(\d{2})/.exec(ev.time || '')
  const start = t ? `${d}T${t[1].padStart(2, '0')}${t[2]}00` : d
  const esc = s => String(s || '').replace(/[\\;,]/g, m => `\\${m}`).replace(/\n/g, '\\n')
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ugabuga//rsvp//HE', 'BEGIN:VEVENT', `UID:${ev.code}@ugabuga.co.il`,
    t ? `DTSTART:${start}` : `DTSTART;VALUE=DATE:${d}`, `SUMMARY:${esc(ev.title)}`, ev.place ? `LOCATION:${esc(ev.place)}` : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n')
}
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function EventHeader({ ev }) {
  return <div className="text-center">
    <h1 className="text-3xl font-black sm:text-4xl">{ev.title}</h1>
    <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-lg">
      {ev.date && <span>📅 {formatDate(ev.date)}</span>}{ev.time && <span>🕐 <bdi dir="ltr">{ev.time}</bdi></span>}{ev.place && <span>📍 {ev.place}</span>}
    </p>
    {ev.note && <p className="mx-auto mt-3 max-w-md whitespace-pre-line rounded-xl bg-[var(--postit)] px-3 py-2">{ev.note}</p>}
    {ev.deadline && <p className="mt-2 text-sm text-slate-600">נשמח לתשובה עד {formatDate(ev.deadline)}</p>}
  </div>
}

function GuestView({ ev, onAnswer, show }) {
  const [editing, setEditing] = useState(!ev.mine)
  const mine = ev.mine
  return <div className="mx-auto max-w-xl space-y-5">
    <section className={card}>
      <EventHeader ev={ev} />
      {ev.yes_count > 1 && <p className="mt-3 text-center font-bold text-emerald-700">🎉 כבר {ev.yes_count} אישרו הגעה</p>}
    </section>
    <section className={card}>
      {editing || !mine
        ? <><h2 className="mb-3 text-2xl font-bold">אישור הגעה</h2><AnswerForm ev={ev} mine={mine} show={show} onSaved={r => { onAnswer(r); setEditing(false); show('✓ התשובה נשלחה. תודה!') }} /></>
        : <div className="text-center">
          <p className="text-4xl" aria-hidden="true">{STATUS[mine.status].emoji}</p>
          <p className="mt-2 text-2xl font-black">{mine.status === 'yes' ? 'נתראה שם!' : mine.status === 'maybe' ? 'רשמנו "אולי"' : 'חבל, נתגעגע!'}</p>
          <p className="mt-1 text-lg">{mine.name} · {STATUS[mine.status].label}{mine.status !== 'no' && ` · ${peopleLabel(mine.kids, mine.adults)}`}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button onClick={() => setEditing(true)} className={btn}>✏️ שינוי התשובה</button>
            {ev.date && mine.status !== 'no' && <button onClick={() => download('event.ics', icsFile(ev), 'text/calendar')} className={btn}>🗓️ הוספה ליומן</button>}
          </div>
        </div>}
    </section>
    <SiteInvite context={ev.kind === 'kids' ? 'party' : 'event'} />
  </div>
}

function Stat({ n, label, tone = 'bg-white' }) {
  return <div className={`rounded-2xl border-2 border-[var(--border)] p-3 text-center ${tone}`}><div className="text-3xl font-black">{n}</div><div className="text-sm font-bold text-slate-600">{label}</div></div>
}

// Guests' page: the organizer types the 4-digit code and gets the management view on this phone too.
function OrganizerLogin({ code, onIn }) {
  const [open, setOpen] = useState(false), [pin, setPin] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const submit = async e => {
    e.preventDefault()
    if (!pinOk(pin)) return
    setBusy(true); setErr('')
    try { const t = await rsvpDb.pinLogin(code, pin); if (t) onIn(t); else { setErr('הקוד לא נכון. נסו שוב.'); setPin('') } }
    catch (e2) { setErr(groupErrorText(e2.code)) } finally { setBusy(false) }
  }
  if (!open) return <p className="mt-8 text-center"><button onClick={() => setOpen(true)} className="text-sm font-bold text-slate-600 underline">🔑 אני המארגן/ת</button></p>
  return <form onSubmit={submit} className={`${card} mx-auto mt-8 max-w-sm text-center`}>
    <h2 className="text-xl font-bold">🔑 כניסה למארגנים</h2>
    <p className="mt-1 text-sm text-slate-600">הקלידו את קוד המארגן (4 ספרות) שבחרתם כשיצרתם את האירוע.</p>
    <div className="mt-3 flex justify-center"><PinInput value={pin} onChange={setPin} label="קוד מארגן" /></div>
    {err && <p className="mt-2 font-bold text-rose-700" role="alert">{err}</p>}
    <button disabled={busy || !pinOk(pin)} className={`${btnMain} mt-3 w-full`}>{busy ? 'רגע…' : 'כניסה'}</button>
  </form>
}

// Host view: the organizer code — set one (older events) or change it.
function OrganizerPin({ code, token, show }) {
  const [has, setHas] = useState(null), [editing, setEditing] = useState(false), [pin, setPin] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { let live = true; rsvpDb.hasPin(code, token).then(v => { if (live) setHas(Boolean(v)) }).catch(() => { if (live) setHas('off') }); return () => { live = false } }, [code, token])
  if (has === null || has === 'off') return null
  const save = async e => {
    e.preventDefault()
    setBusy(true)
    try { await rsvpDb.setPin(code, token, pin); setHas(true); setEditing(false); setPin(''); show('✓ קוד המארגן נשמר') } catch (e2) { show(groupErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  if (has && !editing) return <p className="mt-4 text-sm text-slate-600">🔑 יש קוד מארגן: פותחים את הקישור מכל טלפון ולוחצים „אני המארגן/ת”. <button onClick={() => setEditing(true)} className="font-bold underline">שינוי הקוד</button></p>
  return <form onSubmit={save} className="mt-4 rounded-xl bg-amber-50 p-3">
    <p className="font-bold">🔑 {has ? 'קוד מארגן חדש' : 'בחרו קוד מארגן (4 ספרות)'}</p>
    <p className="text-sm text-slate-600">כדי לראות את התשובות גם מטלפון אחר: פותחים את הקישור, לוחצים „אני המארגן/ת” ומקלידים את הקוד.</p>
    <div className="mt-2 flex items-center gap-2"><PinInput value={pin} onChange={setPin} label="קוד מארגן" /><button disabled={busy || !pinOk(pin)} className={btn}>{busy ? 'רגע…' : 'שמירה'}</button></div>
  </form>
}

function HostView({ ev, setEv, token, show, reload, onDeleted }) {
  const enhanced = isRsvpV2(ev)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => toForm(ev))
  const [busy, setBusy] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const responses = useMemo(() => ev.responses || [], [ev.responses])
  const totals = useMemo(() => rsvpTotals(responses), [responses])
  const missing = useMemo(() => missingInvitees(ev.invitees || [], responses), [ev.invitees, responses])
  const link = shareUrl(KIND, ev.code)
  const x = ev.extras || {}, marks = ev.marks || {}
  const mark = async (r, patch) => {
    const before = marks[r.id] || {}
    setEv(e => ({ ...e, marks: { ...e.marks, [r.id]: { ...before, ...patch } } }))
    try { const m = await rsvpDb.mark(ev.code, token, r.id, patch); setEv(e => ({ ...e, marks: { ...e.marks, [r.id]: m } })) }
    catch (e) { setEv(ev2 => ({ ...ev2, marks: { ...ev2.marks, [r.id]: before } })); show(groupErrorText(e.code), 'err') }
  }
  const coming = responses.filter(r => r.status !== 'no')
  const paidCount = coming.filter(r => marks[r.id]?.paid).length
  const [seating, setSeating] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      const row = enhanced ? await rsvpDb.updateV2(ev.code, token, { ...fromForm(form), theme: form.theme || ev.theme }) : await rsvpDb.update(ev.code, token, fromForm(form))
      const extras = await rsvpDb.extrasSet(ev.code, token, { ...extrasOf(form), type: ev.extras?.type }).catch(() => ev.extras)
      setEv(e => ({ ...e, ...row, extras: extras || {} })); setEditing(false); show('✓ הפרטים עודכנו')
    }
    catch (e) { show(groupErrorText(e.code), 'err') } finally { setBusy(false) }
  }
  const csv = () => {
    if (enhanced) { download(`אישורי הגעה - ${ev.title}.csv`, responseCsv(sorted, STATUS), 'text/csv;charset=utf-8'); return }
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [['שם', 'תשובה', 'ילדים', 'מבוגרים', 'אלרגיות', 'מי אוסף', 'הערה'], ...responses.map(r => [r.name, STATUS[r.status].label, r.kids, r.adults, r.allergies, r.pickup, r.note])]
    download(`אישורי הגעה - ${ev.title}.csv`, '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8')
  }
  const sorted = enhanced ? filterResponses(responses, filter, search) : ['yes', 'maybe', 'no'].flatMap(s => responses.filter(r => r.status === s))
  return <div className={`${enhanced ? 'rsvp-v2' : ''} grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]`}>
    <div className="space-y-5">
      <section className={card}>
        {editing
          ? <><h2 className="mb-3 text-2xl font-bold">עריכת פרטי האירוע</h2>{enhanced && <ThemePicker value={form.theme || ev.theme} onChange={theme => setForm(f => ({ ...f, theme }))} />}<EventForm value={form} onChange={setForm} onSubmit={save} busy={busy} submitLabel="שמירה" /><button onClick={() => setEditing(false)} className="mt-2 w-full py-2 text-slate-500 underline">ביטול</button></>
          : <>{enhanced ? <InvitationCard ev={ev} /> : <EventHeader ev={ev} />}<div className="mt-3 text-center"><button onClick={() => { setForm({ ...toForm(ev), ...(enhanced ? { theme: ev.theme } : {}) }); setEditing(true) }} className="text-sm font-bold underline">✏️ עריכת פרטים</button></div></>}
        {enhanced && !editing && <div className="mt-4"><EventActions ev={ev} download={download} /></div>}
      </section>

      <section className={card} aria-label="סיכום">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat n={enhanced ? totals.people : totals.yes} label={enhanced ? 'אנשים מגיעים' : 'מגיעים'} tone="bg-emerald-50" />
          <Stat n={totals.kids} label="ילדים" />
          <Stat n={totals.adults} label="מבוגרים" />
          <Stat n={totals.maybe} label={enhanced ? 'תשובות אולי' : 'אולי'} tone="bg-amber-50" />
          <Stat n={totals.no} label={enhanced ? 'תשובות לא' : 'לא מגיעים'} />
          <Stat n={ev.invitees?.length ? missing.length : '—'} label="טרם ענו" tone="bg-rose-50" />
        </div>
        {enhanced && <p className="mt-3 text-center text-sm">{totals.yes} תשובות „מגיעים” · {responses.length} תשובות בסך הכול{ev.invitees?.length > 0 && ` · ${ev.invitees.length - missing.length} מתוך ${ev.invitees.length} שמות ברשימת המוזמנים ענו`}</p>}
        {totals.maybe > 0 && <p className="mt-2 text-center text-sm text-slate-600">ועוד „אולי”: {peopleLabel(totals.maybeKids, totals.maybeAdults) || 'בלי מספר'}</p>}
        {totals.allergies.length > 0 && <div className="mt-4 rounded-xl border-2 border-rose-200 bg-rose-50 p-3">
          <h3 className="font-bold">⚠️ אלרגיות ורגישויות</h3>
          <ul className="mt-1 space-y-0.5">{totals.allergies.map((a, i) => <li key={i}><b>{a.name}:</b> {a.text}</li>)}</ul>
        </div>}
        {x.price > 0 && <p className="mt-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center font-bold">💳 שילמו {paidCount} מתוך {coming.length} · נאסף {(paidCount * x.price).toLocaleString('he-IL')} ₪ <span className="font-normal text-slate-600">(לפי {x.price} ₪ לכל תשובה)</span></p>}
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold">התשובות ({responses.length})</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={reload} className="min-h-[44px] rounded-xl border-2 border-slate-200 px-3 font-bold" aria-label="רענון">🔄</button>
            <button onClick={() => setPrinting(true)} disabled={enhanced ? !sorted.length : !responses.length} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold disabled:opacity-40">🖨️ הדפסה</button>
            <button onClick={csv} disabled={enhanced ? !sorted.length : !responses.length} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold disabled:opacity-40">⬇️ אקסל</button>
          </div>
        </div>
        {enhanced && <><Field label="חיפוש לפי שם"><input className={input} type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="שם הילד או המשפחה" /></Field><div className="rsvp-filter-bar" role="group" aria-label="סינון תשובות">{RESPONSE_FILTERS.map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div><p className="text-sm text-slate-600" aria-live="polite">מוצגות {sorted.length} מתוך {responses.length} תשובות. ההדפסה והייצוא כוללים את הרשימה המוצגת.</p></>}
        {enhanced && responses.length > 0 && !sorted.length && <p className="py-6 text-center">אין תשובות שמתאימות לחיפוש. <button className="underline" onClick={() => { setSearch(''); setFilter('all') }}>הצגת הכול</button></p>}
        {!responses.length && <p className="py-6 text-center text-slate-500">עוד אין תשובות. שלחו את הקישור לקבוצה 👇 — התשובות יופיעו כאן מעצמן.</p>}
        <ul className="mt-3 space-y-2">{sorted.map(r => <li key={r.id} className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
          <div className={`flex items-start gap-2 ${enhanced ? 'rsvp-response-top' : ''}`}>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-sm font-bold ${STATUS[r.status].cls}`}>{STATUS[r.status].emoji} {STATUS[r.status].label}</span>
            <b className={`min-w-0 flex-1 text-lg ${enhanced ? 'rsvp-response-name' : ''}`}>{r.name}</b>
            {r.status !== 'no' && <span className="shrink-0 text-sm text-slate-600">{peopleLabel(r.kids, r.adults)}</span>}
            <button onClick={() => setConfirm(r)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`מחיקת התשובה של ${r.name}`}>✕</button>
          </div>
          {(r.allergies || r.pickup || r.note) && <p className="mt-1 text-sm text-slate-700">{[r.allergies && `⚠️ ${r.allergies}`, r.pickup && `🚗 ${r.pickup}`, r.note && `💬 ${r.note}`].filter(Boolean).join(' · ')}</p>}
          {r.status !== 'no' && (x.price > 0 || x.tables > 0) && <div className="mt-2 flex flex-wrap items-center gap-2">
            {x.price > 0 && <button type="button" onClick={() => mark(r, { paid: !marks[r.id]?.paid })} aria-pressed={Boolean(marks[r.id]?.paid)}
              className={`min-h-[40px] rounded-xl border-2 px-3 text-sm font-bold ${marks[r.id]?.paid ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>{marks[r.id]?.paid ? '✓ שילם/ה' : '💳 לא שילם/ה'}</button>}
            {x.tables > 0 && <select aria-label={`שולחן של ${r.name}`} value={marks[r.id]?.table || ''} onChange={e => mark(r, { table: e.target.value ? Number(e.target.value) : null })} className="min-h-[40px] rounded-xl border-2 border-slate-200 bg-white px-2 text-sm font-bold">
              <option value="">🪑 בלי שולחן</option>{Array.from({ length: x.tables }, (_, i) => <option key={i + 1} value={i + 1}>שולחן {i + 1}</option>)}
            </select>}
          </div>}
        </li>)}</ul>
      </section>
      {x.tables > 0 && <SeatingSection ev={ev} coming={coming} marks={marks} onPrint={() => setSeating(true)} />}
    </div>

    <aside className="space-y-4 lg:sticky lg:top-4">
      <section className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
        <h2 className="font-display text-2xl font-bold">שולחים לאורחים</h2>
        <button onClick={() => openWhatsApp(rsvpInviteText(ev, link))} className={`${btnWa} mt-3 w-full`}>📱 שליחה בוואטסאפ</button>
        <button onClick={() => copyText(link, show, 'הקישור הועתק ✓ הדביקו אותו בוואטסאפ')} className={`${btn} mt-2 w-full`}>🔗 העתקת קישור</button>
        <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-center text-sm">הקישור: <bdi dir="ltr" className="font-bold">{link.replace(/^https?:\/\//, '')}</bdi></p>
        <Link to={`/invitation?rsvp=${ev.code}`} className={`${btn} mt-3 w-full`}>📨 הזמנה מעוצבת עם הקישור</Link>
        <Link to="/tools/bring-list?for=birthday" className={`${btn} mt-2 w-full`}>🧺 רשימת מי מביא מה</Link>
      </section>
      <section className={card}>
        <h2 className="text-xl font-bold">⏰ תזכורת למי שלא ענה</h2>
        {ev.invitees?.length > 0
          ? missing.length ? <p className="mt-1">{missing.join(' · ')}</p> : <p className="mt-1 font-bold text-emerald-700">כל המוזמנים ענו 🎉</p>
          : <p className="mt-1 text-sm text-slate-600">רוצים לראות בדיוק מי לא ענה? הוסיפו רשימת מוזמנים ב„עריכת פרטים”.</p>}
        <button onClick={() => openWhatsApp(rsvpReminderText(ev, missing, link))} disabled={ev.invitees?.length > 0 && !missing.length} className={`${btn} mt-3 w-full`}>💬 העתקת תזכורת לוואטסאפ</button>
        {enhanced && <button onClick={() => copyText(rsvpReminderText(ev, missing, link), show, 'התזכורת הועתקה')} disabled={ev.invitees?.length > 0 && !missing.length} className={`${btn} mt-2 w-full`}>📋 העתקת נוסח התזכורת</button>}
        <a href={`/r/${ev.code}?guest=1`} target="_blank" rel="noopener" className="mt-3 block text-center text-sm font-bold underline">👀 איך זה נראה לאורחים</a>
        <OrganizerPin code={ev.code} token={token} show={show} />
        <OrganizerTools what="האירוע" onCopyOrganizer={() => copyText(organizerUrl(KIND, ev.code, token), show, 'קישור הניהול הועתק ✓ שמרו אותו לעצמכם בלבד')} onDelete={() => setConfirm('event')} />
      </section>
    </aside>

    {confirm === 'event' && <ConfirmDialog title="למחוק את האירוע?" text="כל התשובות יימחקו, והקישור יפסיק לעבוד לכולם. אי אפשר לשחזר." yes="כן, למחוק" onClose={() => setConfirm(null)}
      onYes={async () => { try { await rsvpDb.remove(ev.code, token); groupMemory.forgetOwned(KIND, ev.code); onDeleted() } catch (e) { show(groupErrorText(e.code), 'err') } setConfirm(null) }} />}
    {confirm && confirm !== 'event' && <ConfirmDialog title={`למחוק את התשובה של ${confirm.name}?`} text="מתאים לתשובה כפולה או שגויה. מי שענה יוכל לענות שוב." yes="מחיקה" onClose={() => setConfirm(null)}
      onYes={async () => { const r = confirm; setConfirm(null); try { await rsvpDb.removeResponse(ev.code, token, r.id); setEv(e => ({ ...e, responses: e.responses.filter(x => x.id !== r.id) })) } catch (e) { show(groupErrorText(e.code), 'err') } }} />}
    {seating && <PrintPreview title={`סידורי הושבה — ${ev.title}`} onClose={() => setSeating(false)}><SeatingPrint ev={ev} coming={coming} marks={marks} /></PrintPreview>}
    {printing && <PrintPreview title={`אישורי הגעה — ${ev.title}`} onClose={() => setPrinting(false)}>
      <div className="buga-flow" dir="rtl">
        <h2 style={{ fontSize: 26, margin: 0 }}>{ev.title}</h2>
        <p>{[ev.date && formatDate(ev.date), ev.time, ev.place].filter(Boolean).join(' · ')}</p>
        <p><b>{enhanced ? `סיכום האירוע — אנשים מגיעים: ${totals.people}` : `מגיעים: ${totals.yes}`}</b> ({countLabel(totals.kids, 'ילד אחד', 'ילדים')}, {countLabel(totals.adults, 'מבוגר אחד', 'מבוגרים')}) · אולי: {totals.maybe} · לא מגיעים: {totals.no}{ev.invitees?.length ? ` · טרם ענו: ${missing.length}` : ''}</p>
        {enhanced && <p>הרשימה המודפסת: {RESPONSE_FILTERS.find(([id]) => id === filter)?.[1]}{search && ` · חיפוש: ${search}`} · {sorted.length} תשובות</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
          <thead><tr>{['שם', 'תשובה', 'ילדים', 'מבוגרים', 'אלרגיות', 'מי אוסף', 'הערה'].map(h => <th key={h} style={{ borderBottom: '2px solid #333', textAlign: 'right', padding: 4 }}>{h}</th>)}</tr></thead>
          <tbody>{sorted.map(r => <tr key={r.id}>{[r.name, STATUS[r.status].label, r.kids || '', r.adults || '', r.allergies, r.pickup, r.note].map((c, i) => <td key={i} style={{ borderBottom: '1px solid #ddd', padding: 4 }}>{c}</td>)}</tr>)}</tbody>
        </table>
        {missing.length > 0 && <p style={{ marginTop: 10 }}><b>טרם ענו:</b> {missing.join(', ')}</p>}
      </div>
    </PrintPreview>}
  </div>
}

// ── seating: who sits at each table, and an alphabetical list for the entrance ──
const headcount = r => (Number(r.kids) || 0) + (Number(r.adults) || 0)
function SeatingSection({ ev, coming, marks, onPrint }) {
  const tables = Array.from({ length: ev.extras.tables }, (_, i) => i + 1)
  const at = n => coming.filter(r => marks[r.id]?.table === n)
  const free = coming.filter(r => !marks[r.id]?.table)
  return <section className={card}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold">🪑 סידורי הושבה</h2><button onClick={onPrint} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold">🖨️ רשימה לכניסה</button></div>
    <p className="mt-1 text-sm text-slate-600">בוחרים שולחן לכל תשובה ברשימה למעלה. {ev.extras.show_table ? 'כל אורח רואה את השולחן שלו כשהוא פותח את הקישור.' : 'האורחים לא רואים את השולחנות.'}</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{tables.map(n => { const list = at(n); return <div key={n} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-3">
      <b>שולחן {n}</b> <span className="text-sm text-slate-600">· {list.reduce((s, r) => s + headcount(r), 0)} מקומות</span>
      <p className="text-sm">{list.map(r => r.name).join(' · ') || <span className="text-slate-400">ריק</span>}</p>
    </div> })}</div>
    {free.length > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm"><b>עוד בלי שולחן ({free.length}):</b> {free.map(r => r.name).join(' · ')}</p>}
  </section>
}
function SeatingPrint({ ev, coming, marks }) {
  const list = [...coming].sort((a, b) => a.name.localeCompare(b.name, 'he'))
  return <div className="buga-flow" dir="rtl">
    <h2 style={{ fontSize: 26, margin: 0 }}>סידורי הושבה — {ev.title}</h2>
    <p>{[ev.date && formatDate(ev.date), ev.time, ev.place].filter(Boolean).join(' · ')}</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, marginTop: 8 }}>
      <thead><tr>{['שם', 'שולחן', 'מקומות'].map(h => <th key={h} style={{ borderBottom: '2px solid #333', textAlign: 'right', padding: 6 }}>{h}</th>)}</tr></thead>
      <tbody>{list.map(r => <tr key={r.id}>{[r.name, marks[r.id]?.table || '—', headcount(r)].map((c, i) => <td key={i} style={{ borderBottom: '1px solid #ddd', padding: 6, fontWeight: i === 1 ? 800 : 400 }}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

// ── SEO body for /rsvp ────────────────────────────────────────
const FAQ = [
  { q: 'האם אישור ההגעה באמת בחינם?', a: 'כן. יוצרים אירוע, שולחים קישור בוואטסאפ ורואים את כל התשובות — בלי תשלום, בלי הרשמה ובלי להוריד אפליקציה. גם האורחים עונים בלחיצה, בלי להשאיר טלפון או מייל.' },
  { q: 'מי רואה את התשובות של האורחים?', a: 'רק מי שיצר את האירוע, מהמכשיר שבו יצר אותו או דרך קישור הניהול האישי. אורחים רואים רק את פרטי האירוע ואת התשובה שלהם עצמם, וכמה אישרו הגעה בסך הכול.' },
  { q: 'אפשר לשנות תשובה אחרי ששלחתי?', a: 'כן. פותחים שוב את אותו קישור מאותו טלפון ולוחצים „שינוי התשובה”. המארגנים רואים את התשובה המעודכנת מיד.' },
  { q: 'איך יודעים מי עוד לא אישר הגעה?', a: 'מוסיפים לאירוע רשימת מוזמנים (שם פרטי בכל שורה). הדף משווה אותה לתשובות, מציג מי עוד לא ענה ומכין הודעת תזכורת מנומסת שמדביקים בקבוצה.' },
  { q: 'כמה זמן הדף נשמר?', a: 'עד חודשיים אחרי מועד האירוע, ואז הוא נמחק אוטומטית יחד עם כל התשובות. אפשר גם למחוק אותו בעצמכם בכל רגע מכפתור „מחיקת האירוע”.' },
]
function RsvpGuide() {
  return <section className="mx-auto mt-14 max-w-3xl">
    <h2 className="mb-3 text-3xl font-bold">איך עושים אישור הגעה בוואטסאפ, בלי בלגן בקבוצה?</h2>
    <ol className="mb-8 grid gap-3 sm:grid-cols-3">
      {[['1', 'יוצרים אירוע', 'שם, תאריך, שעה ומקום. אפשר להוסיף תאריך אחרון לאישור ורשימת מוזמנים.'],
        ['2', 'שולחים קישור אחד', 'לקבוצת ההורים או לכל מוזמן בפרטי. כל אחד עונה מגיעים, לא מגיעים או אולי.'],
        ['3', 'רואים הכול במקום אחד', 'כמה ילדים וכמה מבוגרים, אלרגיות, מי אוסף — ומי עוד לא ענה.']].map(([n, t, d]) =>
        <li key={n} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><span className="text-2xl font-black text-[var(--accent)]">{n}</span><h3 className="text-lg font-bold">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></li>)}
    </ol>
    <SeoBody paragraphs={[
      'אישור הגעה אונליין חוסך את השרשור הארוך של "מגיעים 👍" בקבוצת הכיתה, שבו אף אחד כבר לא יודע מי ענה ומי לא. במקום לספור הודעות, כל הורה עונה פעם אחת בטופס קצר, והמארגנים רואים טבלה מסודרת שמתעדכנת מעצמה.',
      'למסיבת ילדים הטופס שואל כמה ילדים מגיעים, אם מבוגר נשאר, על אלרגיות במזון ומי אוסף בסוף. כך יודעים כמה פיצות להזמין, אם צריך עוגה בלי אגוזים ולמי להתקשר אם מישהו לא נאסף בזמן. לאירוע של מבוגרים — ארוחה משפחתית, מפגש מחזור או ברית — בוחרים „אירוע אחר” והטופס סופר קודם מבוגרים.',
      'טיפ: שלחו את הקישור יחד עם ההזמנה, וקבעו תאריך אחרון לאישור כשלושה ימים לפני האירוע. יום אחרי התאריך, כפתור התזכורת מכין הודעה עם השמות של מי שעוד לא ענה — מנומסת, קצרה ובלי לבייש אף אחד.',
    ]} faq={FAQ} related={[{ label: 'הזמנה ליום הולדת', href: '/invitation' }, { label: 'רשימת מי מביא מה', href: '/tools/bring-list' }, { label: 'מחשבון מסיבה', href: '/calculator' }, { label: 'כל מה שצריך ליום הולדת', href: '/birthday' }]} />
  </section>
}

// /rsvp/<type>: the same page, started with that event type's defaults and advice.
export function RsvpTypePage() {
  const { type } = useParams()
  const preset = rsvpType(type)
  return preset ? <Rsvp key={type} preset={preset} /> : <NotFound />
}

function TypeGuide({ preset }) {
  return <section className="mx-auto mt-14 max-w-3xl">
    <h2 className="mb-3 text-3xl font-bold">טיפים: {preset.h1}</h2>
    <ul className="mb-8 grid gap-3">{preset.tips.map((tip, i) => <li key={i} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4 text-lg">💡 {tip}</li>)}</ul>
    <SeoBody paragraphs={[preset.intro, 'כל מה שצריך נמצא בדף אחד: האורחים עונים בלחיצה בלי הרשמה, ואתם רואים כמה מבוגרים וילדים מגיעים, אלרגיות ומי עוד לא ענה. אפשר להוריד לאקסל, להדפיס, ולשלוח תזכורת מנומסת למי שלא ענה.']}
      faq={preset.faq} related={[{ label: 'אישור הגעה — כל סוגי האירועים', href: '/rsvp' }, ...(preset.vaad ? [{ label: 'כל הכלים לוועד הורים', href: '/vaad' }] : []), { label: 'הזמנה מעוצבת', href: '/invitation' }, { label: 'רשימת מי מביא מה', href: '/tools/bring-list' }]} />
  </section>
}
export function RsvpTypeLinks({ current, list = RSVP_TYPES, title = 'אישור הגעה לפי סוג אירוע' }) {
  return <section className="mx-auto mt-10 max-w-3xl">
    <h2 className="mb-3 text-2xl font-bold">{title}</h2>
    <div className="flex flex-wrap gap-2">{list.filter(x => x.slug !== current).map(x => <Link key={x.slug} to={`/rsvp/${x.slug}`} className="rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 font-bold hover:border-slate-800">{x.emoji} {x.name}</Link>)}</div>
  </section>
}

export default function Rsvp({ preset = null }) {
  const { code: pathCode } = useParams()
  const [params] = useSearchParams()
  const [code, setCode] = useState(pathCode || null)
  const [token, setToken] = useState(() => pathCode && params.get('guest') !== '1' ? tokenFromHash(KIND, pathCode) || groupMemory.ownerToken(KIND, pathCode) : null)
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(pathCode))
  const [form, setForm] = useState(() => emptyEvent(params, preset))
  const [busy, setBusy] = useState(false)
  const [newExperience, setNewExperience] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [toast, show] = useToast()
  const host = Boolean(token && ev?.responses)
  const loadSeq = useRef(0)
  useEffect(() => {
    if (pathCode) return
    let alive = true
    void rsvpDb.version().then(version => { if (alive) setNewExperience(version === 2) })
    return () => { alive = false }
  }, [pathCode])

  const load = useCallback(async () => {
    if (!code) return
    const seq = ++loadSeq.current
    try {
      let row
      if (token) {
        try { row = await rsvpDb.host(code, token) } catch (e) { if (e.code !== 'not_owner') throw e; setToken(null) }
      }
      if (!row) row = await rsvpDb.get(code, groupMemory.deviceToken(KIND))
      const more = await rsvpDb.extrasGet(code, groupMemory.deviceToken(KIND), row.responses ? token : null)
      row = { ...row, extras: more?.extras || {}, marks: more?.marks || {}, my_table: more?.my_table || null }
      if (seq === loadSeq.current) { setEv(row); setError('') }
    } catch (e) { if (seq === loadSeq.current) setError(e.code || 'network') } finally { setLoading(false) }
  }, [code, token])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!code || !host) return
    const t = setInterval(() => { if (document.visibilityState === 'visible') load() }, POLL_MS)
    return () => clearInterval(t)
  }, [code, host, load])

  const create = async () => {
    setBusy(true)
    try {
      const t = newToken()
      const row = newExperience ? await rsvpDb.createV2(t, { ...fromForm(form), theme: form.theme }) : await rsvpDb.create(t, fromForm(form))
      groupMemory.rememberOwned(KIND, row.code, t, row.title)
      if (pinOk(form.pin)) await rsvpDb.setPin(row.code, t, form.pin).catch(() => {})
      const wanted = extrasOf(form)
      const extras = hasExtras(wanted) ? await rsvpDb.extrasSet(row.code, t, wanted).catch(() => ({})) : {}
      window.history.replaceState(window.history.state, '', `/r/${row.code}`)
      setToken(t); setEv({ ...row, responses: [], extras: extras || {}, marks: {} }); setCode(row.code)
      show('✓ האירוע נוצר! עכשיו שולחים את הקישור')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) { show(groupErrorText(e.code), 'err') } finally { setBusy(false) }
  }

  const organizerIn = t => { groupMemory.rememberOwned(KIND, code, t, ev.title); setToken(t); show('✓ נכנסת לניהול האירוע') }
  const mine = groupMemory.owned(KIND).filter(x => x.code !== code).slice(0, 5)
  let body
  if (deleted) body = <div className="py-10 text-center"><p className="text-xl font-bold">🗑️ האירוע נמחק</p><a href="/rsvp" className={`${btn} mt-6`}>יצירת אירוע חדש</a></div>
  else if (code && error) body = <ErrorPanel code={error} home="/rsvp" homeLabel="יצירת אישור הגעה חדש" />
  else if (code && (loading || !ev)) body = <p className="py-16 text-center text-lg">טוענים…</p>
  else if (code && host) body = <HostView ev={ev} setEv={setEv} token={token} show={show} reload={load} onDeleted={() => setDeleted(true)} />
  else if (code && isRsvpV2(ev)) body = <RsvpGuestExperience ev={ev} show={show} onAnswer={r => setEv(e => ({ ...e, mine: r }))} AnswerForm={AnswerForm} download={download} statuses={STATUS} />
  else if (code) body = <GuestView ev={ev} show={show} onAnswer={r => setEv(e => ({ ...e, mine: r }))} />
  else body = newExperience ? <RsvpCreateExperience form={form} onChange={setForm} mine={mine}><EventForm value={form} onChange={setForm} onSubmit={create} busy={busy} submitLabel="✅ יצירת קישור לאישור הגעה" withPin /></RsvpCreateExperience>
    : <section className={`${card} mx-auto max-w-xl`}><h2 className="mb-4 text-2xl font-bold">פרטי האירוע</h2><EventForm value={form} onChange={setForm} onSubmit={create} busy={busy} submitLabel="✅ יצירת קישור לאישור הגעה" withPin />{mine.length > 0 && <p className="mt-4">האירועים שלי: {mine.map(e => <a key={e.code} className="underline mx-2" href={`/r/${e.code}`}>{e.title || e.code}</a>)}</p>}</section>
  const titleText = ev?.title ? `אישור הגעה — ${ev.title}` : 'אישור הגעה אונליין בחינם — לאירוע וליום הולדת'
  const pageTitle = preset ? `${preset.h1} — אונליין בחינם, בוואטסאפ` : 'אישור הגעה אונליין בחינם — לאירוע וליום הולדת'
  const pageDesc = preset ? preset.intro.slice(0, 158).replace(/\s\S*$/, '') + '…' : 'אישור הגעה לאירוע בחינם: יוצרים קישור, שולחים בוואטסאפ, והאורחים עונים מגיעים, לא מגיעים או אולי. רואים כמה ילדים ומבוגרים, אלרגיות ומי עוד לא ענה.'
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
    <SEO title={code ? titleText : pageTitle} description={pageDesc} path={preset ? `/rsvp/${preset.slug}` : '/rsvp'} noindex={Boolean(pathCode)} structuredData={code ? null : faqSchema(preset ? preset.faq : FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, preset?.vaad ? { label: 'ועד הורים', href: '/vaad' } : { label: 'כלים', href: '/tools' }, { label: 'אישור הגעה', href: code || preset ? '/rsvp' : undefined }, ...(preset && !code ? [{ label: preset.name }] : [])]} />
    {!code && <header className="mb-7 text-center">
      <h1 className="text-4xl sm:text-5xl">{preset ? `${preset.emoji} ${preset.h1}` : '✅ אישור הגעה אונליין'}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">{preset ? preset.intro : 'אישור הגעה לאירוע בחינם: יוצרים קישור, שולחים לקבוצה בוואטסאפ, וכל אורח עונה בלחיצה — מגיעים, לא מגיעים או אולי. אתם רואים כמה ילדים ומבוגרים מגיעים, מי אלרגי למה ומי עוד לא ענה.'}</p>
    </header>}
    {body}
    {code && ev && !host && !error && !deleted && <OrganizerLogin code={code} onIn={organizerIn} />}
    {!code && (preset ? <TypeGuide preset={preset} /> : <RsvpGuide />)}
    {!code && <RsvpTypeLinks current={preset?.slug} />}
    {toast}
  </div>
}

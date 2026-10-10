import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import PrintPreview from '../../../components/ui/PrintPreview'
import { rsvpDb, groupMemory, groupErrorText, newToken, tokenFromHash, shareUrl, organizerUrl } from '../../../utils/groupDb'
import { LIMITS, cleanText, parseNames, validateRsvpAnswer, rsvpTotals, missingInvitees, rsvpInviteText, rsvpReminderText, formatDate, peopleLabel, countLabel } from '../../../utils/groupTools'
import { card, input, btn, btnMain, btnWa, useToast, copyText, openWhatsApp, ConfirmDialog, ErrorPanel, Stepper, Field, OrganizerTools } from './GroupUi'

const KIND = 'rsvp'
const POLL_MS = 15000
const STATUS = {
  yes: { label: 'מגיעים', emoji: '🎉', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  maybe: { label: 'אולי', emoji: '🤔', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  no: { label: 'לא מגיעים', emoji: '😢', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
}
const emptyEvent = params => ({
  kind: params.get('kind') === 'general' ? 'general' : 'kids',
  title: cleanText(params.get('title'), LIMITS.title) || 'יום ההולדת של ___',
  date: /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : '',
  time: cleanText(params.get('time'), 20), place: cleanText(params.get('place'), LIMITS.place),
  deadline: '', note: '', invitees: '',
})
const toForm = ev => ({ kind: ev.kind, title: ev.title, date: ev.date || '', time: ev.time || '', place: ev.place || '', deadline: ev.deadline || '', note: ev.note || '', invitees: (ev.invitees || []).join('\n') })
const fromForm = f => ({ kind: f.kind, title: cleanText(f.title, LIMITS.title), date: f.date || null, time: cleanText(f.time, 20), place: cleanText(f.place, LIMITS.place), deadline: f.deadline || null, note: cleanText(f.note, LIMITS.note, true), invitees: parseNames(f.invitees, LIMITS.maxInvitees).slice(0, LIMITS.maxInvitees) })

// ── organizer: event details form (create + edit) ─────────────
function EventForm({ value, onChange, onSubmit, busy, submitLabel }) {
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
    <p className="text-sm text-slate-500">שמות פרטיים בלבד. הדף נמחק אוטומטית חודשיים אחרי האירוע.</p>
    <button disabled={busy || !cleanText(value.title, LIMITS.title)} className={`${btnMain} w-full`}>{busy ? 'רגע…' : submitLabel}</button>
  </form>
}

// ── guest: answer form ────────────────────────────────────────
function AnswerForm({ ev, mine, onSaved, show }) {
  const kids = ev.kind === 'kids'
  const [a, setA] = useState(() => mine ? { ...mine, allergies: mine.allergies || '', pickup: mine.pickup || '', note: mine.note || '' }
    : { name: groupMemory.get('rsvp-name', ''), status: '', kids: kids ? 1 : 0, adults: kids ? 0 : 1, allergies: '', pickup: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setA(x => ({ ...x, [k]: v }))
  const submit = async e => {
    e.preventDefault()
    const v = validateRsvpAnswer(a)
    if (!v.ok) { setErr(v.error); return }
    setErr(''); setBusy(true)
    try {
      const saved = await rsvpDb.answer(ev.code, groupMemory.deviceToken(KIND), { ...a, name: cleanText(a.name, LIMITS.guestName) })
      groupMemory.set('rsvp-name', saved.name)
      onSaved(saved)
    } catch (e2) { show(groupErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  const coming = a.status && a.status !== 'no'
  return <form onSubmit={submit} className="space-y-4">
    <Field label={kids ? 'שם הילד/ה' : 'השם שלכם'}>
      <input className={input} value={a.name} maxLength={LIMITS.guestName} onChange={e => set('name', e.target.value)} placeholder={kids ? 'למשל: יואב' : 'למשל: משפחת לוי'} autoComplete="given-name" />
    </Field>
    {ev.invitees?.length > 0 && !a.name && <div className="flex flex-wrap gap-2" aria-label="בחירה מהרשימה">
      {ev.invitees.map(n => <button type="button" key={n} onClick={() => set('name', n)} className="min-h-[40px] rounded-full border-2 border-slate-200 bg-white px-3 font-bold">{n}</button>)}
    </div>}
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="תשובה">
      {Object.entries(STATUS).map(([k, s]) => <button type="button" key={k} onClick={() => set('status', k)} aria-pressed={a.status === k}
        className={`min-h-[72px] rounded-2xl border-2 px-1 font-bold leading-tight ${a.status === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
        <span className="block text-2xl" aria-hidden="true">{s.emoji}</span>{s.label}</button>)}
    </div>
    {coming && <div className="space-y-2">
      {kids ? <><Stepper label="ילדים" value={Number(a.kids)} onChange={v => set('kids', v)} /><Stepper label="מבוגרים שנשארים" value={Number(a.adults)} onChange={v => set('adults', v)} /></>
        : <><Stepper label="מבוגרים" value={Number(a.adults)} onChange={v => set('adults', v)} /><Stepper label="ילדים" value={Number(a.kids)} onChange={v => set('kids', v)} /></>}
      <Field label="אלרגיות או רגישויות במזון" hint="(לא חובה)"><input className={input} value={a.allergies} maxLength={LIMITS.allergies} onChange={e => set('allergies', e.target.value)} placeholder="למשל: בוטנים, צמחוני" /></Field>
      {kids && <Field label="מי אוסף בסוף?" hint="(לא חובה)"><input className={input} value={a.pickup} maxLength={LIMITS.pickup} onChange={e => set('pickup', e.target.value)} placeholder="למשל: אמא, ב-19:00" /></Field>}
    </div>}
    {a.status && <Field label="הערה למארגנים" hint="(לא חובה)"><input className={input} value={a.note} maxLength={200} onChange={e => set('note', e.target.value)} placeholder={a.status === 'no' ? 'למשל: מצטערים, נהיה בחו״ל' : 'למשל: נגיע קצת באיחור'} /></Field>}
    {err && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">{err}</p>}
    <button disabled={busy || !a.status} className={`${btnMain} w-full`}>{busy ? 'שולחים…' : mine ? 'עדכון התשובה' : 'שליחת אישור'}</button>
    <p className="text-center text-sm text-slate-500">רק המארגנים רואים את התשובה. אפשר לשנות אותה מהמכשיר הזה בכל רגע.</p>
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
    <p className="text-center text-sm text-slate-600">מארגנים משהו בעצמכם? <Link to="/rsvp" className="font-bold underline">צרו אישור הגעה משלכם</Link> · <Link to="/tools/bring-list" className="font-bold underline">רשימת מי מביא מה</Link></p>
  </div>
}

function Stat({ n, label, tone = 'bg-white' }) {
  return <div className={`rounded-2xl border-2 border-[var(--border)] p-3 text-center ${tone}`}><div className="text-3xl font-black">{n}</div><div className="text-sm font-bold text-slate-600">{label}</div></div>
}

function HostView({ ev, setEv, token, show, reload, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => toForm(ev))
  const [busy, setBusy] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const responses = useMemo(() => ev.responses || [], [ev.responses])
  const totals = useMemo(() => rsvpTotals(responses), [responses])
  const missing = useMemo(() => missingInvitees(ev.invitees || [], responses), [ev.invitees, responses])
  const link = shareUrl(KIND, ev.code)
  const save = async () => {
    setBusy(true)
    try { const row = await rsvpDb.update(ev.code, token, fromForm(form)); setEv(e => ({ ...e, ...row })); setEditing(false); show('✓ הפרטים עודכנו') }
    catch (e) { show(groupErrorText(e.code), 'err') } finally { setBusy(false) }
  }
  const csv = () => {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [['שם', 'תשובה', 'ילדים', 'מבוגרים', 'אלרגיות', 'מי אוסף', 'הערה'], ...responses.map(r => [r.name, STATUS[r.status].label, r.kids, r.adults, r.allergies, r.pickup, r.note])]
    download(`אישורי הגעה - ${ev.title}.csv`, '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8')
  }
  const sorted = ['yes', 'maybe', 'no'].flatMap(s => responses.filter(r => r.status === s))
  return <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="space-y-5">
      <section className={card}>
        {editing
          ? <><h2 className="mb-3 text-2xl font-bold">עריכת פרטי האירוע</h2><EventForm value={form} onChange={setForm} onSubmit={save} busy={busy} submitLabel="שמירה" /><button onClick={() => setEditing(false)} className="mt-2 w-full py-2 text-slate-500 underline">ביטול</button></>
          : <><EventHeader ev={ev} /><div className="mt-3 text-center"><button onClick={() => { setForm(toForm(ev)); setEditing(true) }} className="text-sm font-bold underline">✏️ עריכת פרטים</button></div></>}
      </section>

      <section className={card} aria-label="סיכום">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat n={totals.yes} label="מגיעים" tone="bg-emerald-50" />
          <Stat n={totals.kids} label="ילדים" />
          <Stat n={totals.adults} label="מבוגרים" />
          <Stat n={totals.maybe} label="אולי" tone="bg-amber-50" />
          <Stat n={totals.no} label="לא מגיעים" />
          <Stat n={ev.invitees?.length ? missing.length : '—'} label="טרם ענו" tone="bg-rose-50" />
        </div>
        {totals.maybe > 0 && <p className="mt-2 text-center text-sm text-slate-600">ועוד „אולי”: {peopleLabel(totals.maybeKids, totals.maybeAdults) || 'בלי מספר'}</p>}
        {totals.allergies.length > 0 && <div className="mt-4 rounded-xl border-2 border-rose-200 bg-rose-50 p-3">
          <h3 className="font-bold">⚠️ אלרגיות ורגישויות</h3>
          <ul className="mt-1 space-y-0.5">{totals.allergies.map((x, i) => <li key={i}><b>{x.name}:</b> {x.text}</li>)}</ul>
        </div>}
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold">התשובות ({responses.length})</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={reload} className="min-h-[44px] rounded-xl border-2 border-slate-200 px-3 font-bold" aria-label="רענון">🔄</button>
            <button onClick={() => setPrinting(true)} disabled={!responses.length} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold disabled:opacity-40">🖨️ הדפסה</button>
            <button onClick={csv} disabled={!responses.length} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold disabled:opacity-40">⬇️ אקסל</button>
          </div>
        </div>
        {!responses.length && <p className="py-6 text-center text-slate-500">עוד אין תשובות. שלחו את הקישור לקבוצה 👇 — התשובות יופיעו כאן מעצמן.</p>}
        <ul className="mt-3 space-y-2">{sorted.map(r => <li key={r.id} className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
          <div className="flex items-start gap-2">
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-sm font-bold ${STATUS[r.status].cls}`}>{STATUS[r.status].emoji} {STATUS[r.status].label}</span>
            <b className="min-w-0 flex-1 text-lg">{r.name}</b>
            {r.status !== 'no' && <span className="shrink-0 text-sm text-slate-600">{peopleLabel(r.kids, r.adults)}</span>}
            <button onClick={() => setConfirm(r)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`מחיקת התשובה של ${r.name}`}>✕</button>
          </div>
          {(r.allergies || r.pickup || r.note) && <p className="mt-1 text-sm text-slate-700">{[r.allergies && `⚠️ ${r.allergies}`, r.pickup && `🚗 ${r.pickup}`, r.note && `💬 ${r.note}`].filter(Boolean).join(' · ')}</p>}
        </li>)}</ul>
      </section>
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
        <a href={`/r/${ev.code}?guest=1`} target="_blank" rel="noopener" className="mt-3 block text-center text-sm font-bold underline">👀 איך זה נראה לאורחים</a>
        <OrganizerTools what="האירוע" onCopyOrganizer={() => copyText(organizerUrl(KIND, ev.code, token), show, 'קישור הניהול הועתק ✓ שמרו אותו לעצמכם בלבד')} onDelete={() => setConfirm('event')} />
      </section>
    </aside>

    {confirm === 'event' && <ConfirmDialog title="למחוק את האירוע?" text="כל התשובות יימחקו, והקישור יפסיק לעבוד לכולם. אי אפשר לשחזר." yes="כן, למחוק" onClose={() => setConfirm(null)}
      onYes={async () => { try { await rsvpDb.remove(ev.code, token); groupMemory.forgetOwned(KIND, ev.code); onDeleted() } catch (e) { show(groupErrorText(e.code), 'err') } setConfirm(null) }} />}
    {confirm && confirm !== 'event' && <ConfirmDialog title={`למחוק את התשובה של ${confirm.name}?`} text="מתאים לתשובה כפולה או שגויה. מי שענה יוכל לענות שוב." yes="מחיקה" onClose={() => setConfirm(null)}
      onYes={async () => { const r = confirm; setConfirm(null); try { await rsvpDb.removeResponse(ev.code, token, r.id); setEv(e => ({ ...e, responses: e.responses.filter(x => x.id !== r.id) })) } catch (e) { show(groupErrorText(e.code), 'err') } }} />}
    {printing && <PrintPreview title={`אישורי הגעה — ${ev.title}`} onClose={() => setPrinting(false)}>
      <div className="buga-flow" dir="rtl">
        <h2 style={{ fontSize: 26, margin: 0 }}>{ev.title}</h2>
        <p>{[ev.date && formatDate(ev.date), ev.time, ev.place].filter(Boolean).join(' · ')}</p>
        <p><b>מגיעים: {totals.yes}</b> ({countLabel(totals.kids, 'ילד אחד', 'ילדים')}, {countLabel(totals.adults, 'מבוגר אחד', 'מבוגרים')}) · אולי: {totals.maybe} · לא מגיעים: {totals.no}{ev.invitees?.length ? ` · טרם ענו: ${missing.length}` : ''}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
          <thead><tr>{['שם', 'תשובה', 'ילדים', 'מבוגרים', 'אלרגיות', 'מי אוסף', 'הערה'].map(h => <th key={h} style={{ borderBottom: '2px solid #333', textAlign: 'right', padding: 4 }}>{h}</th>)}</tr></thead>
          <tbody>{sorted.map(r => <tr key={r.id}>{[r.name, STATUS[r.status].label, r.kids || '', r.adults || '', r.allergies, r.pickup, r.note].map((c, i) => <td key={i} style={{ borderBottom: '1px solid #ddd', padding: 4 }}>{c}</td>)}</tr>)}</tbody>
        </table>
        {missing.length > 0 && <p style={{ marginTop: 10 }}><b>טרם ענו:</b> {missing.join(', ')}</p>}
      </div>
    </PrintPreview>}
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

export default function Rsvp() {
  const { code: pathCode } = useParams()
  const [params] = useSearchParams()
  const [code, setCode] = useState(pathCode || null)
  const [token, setToken] = useState(() => pathCode && params.get('guest') !== '1' ? tokenFromHash(KIND, pathCode) || groupMemory.ownerToken(KIND, pathCode) : null)
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(pathCode))
  const [form, setForm] = useState(() => emptyEvent(params))
  const [busy, setBusy] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [toast, show] = useToast()
  const host = Boolean(token && ev?.responses)
  const loadSeq = useRef(0)

  const load = useCallback(async () => {
    if (!code) return
    const seq = ++loadSeq.current
    try {
      let row
      if (token) {
        try { row = await rsvpDb.host(code, token) } catch (e) { if (e.code !== 'not_owner') throw e; setToken(null) }
      }
      if (!row) row = await rsvpDb.get(code, groupMemory.deviceToken(KIND))
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
      const row = await rsvpDb.create(t, fromForm(form))
      groupMemory.rememberOwned(KIND, row.code, t, row.title)
      window.history.replaceState(window.history.state, '', `/r/${row.code}`)
      setToken(t); setEv({ ...row, responses: [] }); setCode(row.code)
      show('✓ האירוע נוצר! עכשיו שולחים את הקישור')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) { show(groupErrorText(e.code), 'err') } finally { setBusy(false) }
  }

  const mine = groupMemory.owned(KIND).filter(x => x.code !== code).slice(0, 5)
  let body
  if (deleted) body = <div className="py-10 text-center"><p className="text-xl font-bold">🗑️ האירוע נמחק</p><a href="/rsvp" className={`${btn} mt-6`}>יצירת אירוע חדש</a></div>
  else if (code && error) body = <ErrorPanel code={error} home="/rsvp" homeLabel="יצירת אישור הגעה חדש" />
  else if (code && (loading || !ev)) body = <p className="py-16 text-center text-lg">טוענים…</p>
  else if (code && host) body = <HostView ev={ev} setEv={setEv} token={token} show={show} reload={load} onDeleted={() => setDeleted(true)} />
  else if (code) body = <GuestView ev={ev} show={show} onAnswer={r => setEv(e => ({ ...e, mine: r }))} />
  else body = <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <section className={card}><h2 className="mb-4 text-2xl font-bold">פרטי האירוע</h2><EventForm value={form} onChange={setForm} onSubmit={create} busy={busy} submitLabel="✅ יצירת קישור לאישור הגעה" /></section>
    <aside className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="font-display text-2xl font-bold">מה מקבלים?</h2>
      <ul className="mt-3 space-y-2">
        <li>📱 קישור אחד לשלוח בוואטסאפ</li><li>🎉 מגיעים / לא מגיעים / אולי</li><li>🧒 כמה ילדים וכמה מבוגרים</li><li>⚠️ אלרגיות ומי אוסף</li><li>⏰ תזכורת למי שלא ענה</li><li>🖨️ הדפסה וייצוא לאקסל</li>
      </ul>
      <p className="mt-4 text-sm text-slate-600">בחינם, בלי הרשמה. האורחים לא צריכים להתקין כלום.</p>
      {mine.length > 0 && <p className="mt-4 text-sm"><b>האירועים שלי:</b> {mine.map((l, n) => <span key={l.code}>{n > 0 && ' · '}<a className="underline" href={`/r/${l.code}`}>{l.title || l.code}</a></span>)}</p>}
    </aside>
  </div>

  const titleText = ev?.title ? `אישור הגעה — ${ev.title}` : 'אישור הגעה אונליין בחינם — לאירוע וליום הולדת'
  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
    <SEO title={code ? titleText : 'אישור הגעה אונליין בחינם — לאירוע וליום הולדת'} description="אישור הגעה לאירוע בחינם: יוצרים קישור, שולחים בוואטסאפ, והאורחים עונים מגיעים, לא מגיעים או אולי. רואים כמה ילדים ומבוגרים, אלרגיות ומי עוד לא ענה." path="/rsvp" noindex={Boolean(pathCode)} structuredData={code ? null : faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'אישור הגעה', href: code ? '/rsvp' : undefined }]} />
    {!code && <header className="mb-7 text-center">
      <h1 className="text-4xl sm:text-5xl">✅ אישור הגעה אונליין</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">אישור הגעה לאירוע בחינם: יוצרים קישור, שולחים לקבוצה בוואטסאפ, וכל אורח עונה בלחיצה — מגיעים, לא מגיעים או אולי. אתם רואים כמה ילדים ומבוגרים מגיעים, מי אלרגי למה ומי עוד לא ענה.</p>
    </header>}
    {body}
    {!code && <RsvpGuide />}
    {toast}
  </div>
}

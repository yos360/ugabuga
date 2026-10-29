import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import PrintPreview from '../../../components/ui/PrintPreview'
import { rsvpDb, groupMemory, groupErrorText, newToken, tokenFromHash } from '../../../utils/groupDb'
import { LIMITS, cleanText, parseNames, validateRsvpAnswer, rsvpTotals, missingInvitees } from '../../../utils/groupTools'
import { card, input, btn, btnMain, btnWa, useToast, copyText, openWhatsApp, ConfirmDialog, ErrorPanel, Stepper, Field, OrganizerTools } from './GroupUi'
import { isRsvpV2, RESPONSE_FILTERS, filterResponses, responseCsv } from '../../../utils/rsvpExperience'
import { InvitationCard, ThemePicker, RsvpCreateExperience, RsvpGuestExperience, EventActions } from './RsvpExperience'
import SiteInvite from '../../../components/ui/SiteInvite'
import NotFound from '../../NotFound'
import { RSVP_TYPES, rsvpType } from '../../../utils/rsvpTypes'
import { RSVP_TYPES_EN, rsvpTypeEn } from '../../../utils/rsvpTypesEn'
import { RSVP_LANGS, t, translateError } from '../../../utils/rsvpI18n'
import { rsvpUi, money, CURRENCIES, PAY_LINK } from '../../../utils/rsvpUi'
import { RSVP_PAGE_COPY as PAGE } from '../../../utils/rsvpPageCopy'

// One tool, two sites: Hebrew (/rsvp, /r/<code>) and English (/en/rsvp, /en/r/<code>).
// Same database calls; only the text, links and a few defaults differ (utils/rsvpUi.js).
const SiteLang = createContext('he')
const useSite = () => { const site = useContext(SiteLang); return [site, rsvpUi(site)] }
const errText = (site, code) => site === 'en' ? rsvpUi('en').error(code) : groupErrorText(code)
const typesFor = site => site === 'en' ? RSVP_TYPES_EN : RSVP_TYPES
const typeOf = (site, slug) => site === 'en' ? rsvpTypeEn(slug) : rsvpType(slug)
const guestLink = (site, code) => `${location.origin}${rsvpUi(site).base}/r/${code}`

const KIND = 'rsvp'
const POLL_MS = 15000
const STATUS_STYLE = {
  yes: { emoji: '🎉', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  maybe: { emoji: '🤔', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
  no: { emoji: '😢', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
}
const statusesFor = site => Object.fromEntries(Object.entries(STATUS_STYLE).map(([k, s]) => [k, { ...s, label: rsvpUi(site).status[k] }]))
const emptyEvent = (params, preset, site) => ({
  kind: preset ? preset.kind : params.get('kind') === 'general' ? 'general' : 'kids',
  title: cleanText(params.get('title'), LIMITS.title) || preset?.title || rsvpUi(site).defaultTitle,
  date: /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : '',
  time: cleanText(params.get('time'), 20), place: cleanText(params.get('place'), LIMITS.place),
  deadline: '', note: '', invitees: '', theme: preset?.theme || 'party',
  // English events keep their guests' language ('en'), so their link opens in English everywhere.
  extras: { ...(preset ? { type: preset.slug } : {}), ...(site === 'en' ? { lang: 'en' } : {}) },
})
const toForm = ev => ({ extras: { ...(ev.extras || {}) }, kind: ev.kind, title: ev.title, date: ev.date || '', time: ev.time || '', place: ev.place || '', deadline: ev.deadline || '', note: ev.note || '', invitees: (ev.invitees || []).join('\n') })
// The extras the organizer filled in (empty values are dropped by the database too). A payment link the
// database would refuse is left out here, so it can't take the event's other extras down with it.
const extrasOf = (f, site = 'he') => {
  const x = f.extras || {}
  // The English site has no participation fee.
  const price = site !== 'en' && Number(x.price) > 0 ? Number(x.price) : undefined
  return { type: x.type, lang: site === 'en' ? x.lang || 'en' : x.lang && x.lang !== 'he' ? x.lang : undefined, parking: cleanText(x.parking, 300) || undefined,
    price, currency: price && CURRENCIES.includes(x.currency) ? x.currency : undefined, pay_link: price && PAY_LINK.test((x.pay_link || '').trim()) ? x.pay_link.trim() : undefined,
    tables: Number(x.tables) > 0 ? Math.min(200, Math.floor(Number(x.tables))) : undefined, show_table: Boolean(x.show_table) || undefined }
}
const hasExtras = x => Object.values(x).some(v => v !== undefined)
const fromForm = f => ({ kind: f.kind, title: cleanText(f.title, LIMITS.title), date: f.date || null, time: cleanText(f.time, 20), place: cleanText(f.place, LIMITS.place), deadline: f.deadline || null, note: cleanText(f.note, LIMITS.note, true), invitees: parseNames(f.invitees, LIMITS.maxInvitees).slice(0, LIMITS.maxInvitees) })

// ── organizer: event details form (create + edit) ─────────────
const pinOk = pin => /^\d{4}$/.test(pin || '')
function PinInput({ value, onChange, label }) {
  return <input className={`${input} max-w-[9rem] text-center text-2xl tracking-[0.4em]`} dir="ltr" inputMode="numeric" autoComplete="off" maxLength={4} aria-label={label}
    value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="••••" />
}

function EventForm({ value, onChange, onSubmit, busy, submitLabel, withPin = false }) {
  const [site, S] = useSite()
  const set = (k, v) => onChange({ ...value, [k]: v })
  const inviteeCount = parseNames(value.invitees, LIMITS.maxInvitees).length
  return <form onSubmit={e => { e.preventDefault(); onSubmit() }} className="space-y-4">
    <div className="grid grid-cols-2 gap-2" role="group" aria-label={S.kindGroup}>
      {['kids', 'general'].map(k => <button type="button" key={k} onClick={() => set('kind', k)} aria-pressed={value.kind === k}
        className={`min-h-[48px] rounded-xl border-2 font-bold ${value.kind === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>{S.kinds[k]}</button>)}
    </div>
    <Field label={S.eventName}><input className={input} value={value.title} maxLength={LIMITS.title} required onChange={e => set('title', e.target.value)}
      onFocus={e => { const at = e.target.value.indexOf('___'); if (at >= 0) e.target.setSelectionRange(at, at + 3) }} placeholder={S.eventNamePh} /></Field>
    <div className="grid grid-cols-2 gap-3">
      <Field label={S.dateLabel}><input type="date" className={input} value={value.date} onChange={e => set('date', e.target.value)} /></Field>
      <Field label={S.timeLabel}><input className={input} dir="ltr" value={value.time} maxLength={20} onChange={e => set('time', e.target.value)} placeholder={S.timePh} /></Field>
    </div>
    <Field label={S.place}><input className={input} value={value.place} maxLength={LIMITS.place} onChange={e => set('place', e.target.value)} placeholder={S.placePh} /></Field>
    <Field label={S.deadline} hint={S.optional}><input type="date" className={input} value={value.deadline} onChange={e => set('deadline', e.target.value)} /></Field>
    <Field label={S.guestNote} hint={S.optional}><textarea className={`${input} min-h-[72px]`} value={value.note} maxLength={LIMITS.note} onChange={e => set('note', e.target.value)} placeholder={S.guestNotePh} /></Field>
    <Field label={S.invitees} hint={S.inviteesHint}>
      <textarea className={`${input} min-h-[96px]`} value={value.invitees} onChange={e => set('invitees', e.target.value)} placeholder={S.inviteesPh} />
      {inviteeCount > 0 && <span className="mt-1 block text-sm font-normal text-slate-500">{S.inviteeCount(inviteeCount, LIMITS.maxInvitees)}</span>}
    </Field>
    <ExtrasFields value={value.extras || {}} onChange={x => set('extras', x)} open={Boolean(typeOf(site, value.extras?.type)?.vaad)} />
    {withPin && <div className="rounded-xl bg-amber-50 p-3">
      <Field label={S.pinLabel}><PinInput value={value.pin || ''} onChange={v => set('pin', v)} label={S.pinAria} /></Field>
      <p className="mt-1 text-sm text-slate-600">{S.pinHelp}</p>
    </div>}
    <p className="text-sm text-slate-500">{S.privacyNote}</p>
    <button disabled={busy || !cleanText(value.title, LIMITS.title) || (withPin && !pinOk(value.pin))} className={`${btnMain} w-full`}>{busy ? S.wait : submitLabel}</button>
  </form>
}

// Optional extras, folded away so the basic form stays short.
function ExtrasFields({ value, onChange, open }) {
  const [site, S] = useSite()
  const set = (k, v) => onChange({ ...value, [k]: v })
  const defaultLang = site === 'en' ? 'en' : 'he'
  const used = Boolean(value.lang && value.lang !== defaultLang) || value.parking || Number(value.price) > 0 || Number(value.tables) > 0
  const badLink = Boolean((value.pay_link || '').trim()) && !PAY_LINK.test(value.pay_link.trim())
  return <details className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3" open={open || used || undefined}>
    <summary className="cursor-pointer font-bold">{S.extrasTitle} <span className="font-normal text-slate-500">{S.optional}</span></summary>
    <div className="mt-3 space-y-4">
      <Field label={S.guestLang} hint={S.guestLangHint}>
        <select className={input} value={value.lang || defaultLang} onChange={e => set('lang', e.target.value)}>{RSVP_LANGS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select>
      </Field>
      <Field label={S.parking} hint={S.parkingHint}><input className={input} value={value.parking || ''} maxLength={300} onChange={e => set('parking', e.target.value)} placeholder={S.parkingPh} /></Field>
      {site !== 'en' && <>
      <div className={`grid gap-3 ${S.currency ? 'grid-cols-2 sm:grid-cols-[minmax(0,9rem)_minmax(0,7rem)_minmax(0,1fr)]' : 'grid-cols-[8rem_1fr]'}`}>
        <Field label={S.fee}><input className={input} type="number" inputMode="decimal" min="0" max="10000" step="any" value={value.price || ''} onChange={e => set('price', e.target.value)} placeholder={S.feePh} /></Field>
        {S.currency && <Field label={S.currency}><select className={input} aria-label={S.currencyAria} value={CURRENCIES.includes(value.currency) ? value.currency : 'USD'} onChange={e => set('currency', e.target.value)}>{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></Field>}
        <div className={S.currency ? 'col-span-2 sm:col-span-1' : ''}><Field label={S.payLink} hint={S.payHint}><input className={input} dir="ltr" value={value.pay_link || ''} maxLength={300} onChange={e => set('pay_link', e.target.value)} placeholder="https://" /></Field></div>
      </div>
      {badLink && <p className="text-sm font-bold text-amber-800" role="status">{S.payLinkBad}</p>}
      </>}
      <div className="grid grid-cols-[8rem_1fr] items-end gap-3">
        <Field label={S.tables}><input className={input} type="number" inputMode="numeric" min="0" max="200" value={value.tables || ''} onChange={e => set('tables', e.target.value)} placeholder="0" /></Field>
        {Number(value.tables) > 0 && <label className="flex min-h-[48px] items-center gap-2 font-bold"><input type="checkbox" className="h-5 w-5" checked={Boolean(value.show_table)} onChange={e => set('show_table', e.target.checked)} /> {S.showTable}</label>}
      </div>
      {site !== 'en' && <p className="text-sm text-slate-500">{S.feeNote}</p>}
    </div>
  </details>
}

// ── guest: answer form ────────────────────────────────────────
function AnswerForm({ ev, mine, onSaved, show, lang = 'he' }) {
  const [site, S] = useSite()
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
    } catch (e2) { show(errText(site, e2.code), 'err') } finally { setBusy(false) }
  }
  const coming = a.status && a.status !== 'no'
  const stepLang = lang === 'he' ? 'he' : 'en'
  return <form onSubmit={submit} className="space-y-4">
    <Field label={L(kids ? 'childName' : 'yourName')}>
      <input className={input} value={a.name} maxLength={LIMITS.guestName} onChange={e => set('name', e.target.value)} placeholder={L(kids ? 'phChild' : 'phName')} autoComplete="given-name" />
    </Field>
    {ev.invitees?.length > 0 && !a.name && <div className="flex flex-wrap gap-2" aria-label={S.pickFromList}>
      {ev.invitees.map(n => <button type="button" key={n} onClick={() => set('name', n)} className="min-h-[40px] rounded-full border-2 border-slate-200 bg-white px-3 font-bold">{n}</button>)}
    </div>}
    <div className="grid grid-cols-3 gap-2" role="group" aria-label={S.answerGroup}>
      {Object.entries(STATUS_STYLE).map(([k, s]) => <button type="button" key={k} onClick={() => set('status', k)} aria-pressed={a.status === k}
        className={`min-h-[72px] rounded-2xl border-2 px-1 font-bold leading-tight ${a.status === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
        <span className="block text-2xl" aria-hidden="true">{s.emoji}</span>{L(k)}</button>)}
    </div>
    {coming && <div className="space-y-2">
      {kids ? <><Stepper lang={stepLang} label={L('kids')} value={Number(a.kids)} onChange={v => set('kids', v)} /><Stepper lang={stepLang} label={L('adultsStay')} value={Number(a.adults)} onChange={v => set('adults', v)} /></>
        : <><Stepper lang={stepLang} label={L('adults')} value={Number(a.adults)} onChange={v => set('adults', v)} /><Stepper lang={stepLang} label={L('kids')} value={Number(a.kids)} onChange={v => set('kids', v)} /></>}
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
  const [, S] = useSite()
  return <div className="text-center">
    <h1 className="text-3xl font-black sm:text-4xl">{ev.title}</h1>
    <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-lg">
      {ev.date && <span>📅 {S.date(ev.date)}</span>}{ev.time && <span>🕐 <bdi dir="ltr">{ev.time}</bdi></span>}{ev.place && <span>📍 {ev.place}</span>}
    </p>
    {ev.note && <p className="mx-auto mt-3 max-w-md whitespace-pre-line rounded-xl bg-[var(--postit)] px-3 py-2">{ev.note}</p>}
    {ev.deadline && <p className="mt-2 text-sm text-slate-600">{S.replyBy(S.date(ev.deadline))}</p>}
  </div>
}

function GuestView({ ev, onAnswer, show }) {
  const [site, S] = useSite()
  const STATUS = statusesFor(site)
  const [editing, setEditing] = useState(!ev.mine)
  const mine = ev.mine
  return <div className="mx-auto max-w-xl space-y-5">
    <section className={card}>
      <EventHeader ev={ev} />
      {ev.yes_count > 1 && <p className="mt-3 text-center font-bold text-emerald-700">{S.yesSoFar(ev.yes_count)}</p>}
    </section>
    <section className={card}>
      {editing || !mine
        ? <><h2 className="mb-3 text-2xl font-bold">{S.rsvpHeading}</h2><AnswerForm ev={ev} mine={mine} show={show} lang={site} onSaved={r => { onAnswer(r); setEditing(false); show(S.sentThanks) }} /></>
        : <div className="text-center">
          <p className="text-4xl" aria-hidden="true">{STATUS[mine.status].emoji}</p>
          <p className="mt-2 text-2xl font-black">{S.guestDone[mine.status]}</p>
          <p className="mt-1 text-lg">{mine.name} · {STATUS[mine.status].label}{mine.status !== 'no' && ` · ${S.people(mine.kids, mine.adults)}`}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button onClick={() => setEditing(true)} className={btn}>{S.changeReply}</button>
            {ev.date && mine.status !== 'no' && <button onClick={() => download('event.ics', icsFile(ev), 'text/calendar')} className={btn}>{S.addCalendar}</button>}
          </div>
          <SiteInvite compact context={ev.kind === 'kids' ? 'party' : 'event'} lang={site} />
        </div>}
    </section>
    {(editing || !mine) && <SiteInvite context={ev.kind === 'kids' ? 'party' : 'event'} lang={site} />}
  </div>
}

function Stat({ n, label, tone = 'bg-white' }) {
  return <div className={`rounded-2xl border-2 border-[var(--border)] p-3 text-center ${tone}`}><div className="text-3xl font-black">{n}</div><div className="text-sm font-bold text-slate-600">{label}</div></div>
}

// Guests' page: the organizer types the 4-digit code and gets the management view on this phone too.
function OrganizerLogin({ code, onIn }) {
  const [site, S] = useSite()
  const [open, setOpen] = useState(false), [pin, setPin] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const submit = async e => {
    e.preventDefault()
    if (!pinOk(pin)) return
    setBusy(true); setErr('')
    try { const t = await rsvpDb.pinLogin(code, pin); if (t) onIn(t); else { setErr(S.pinWrong); setPin('') } }
    catch (e2) { setErr(errText(site, e2.code)) } finally { setBusy(false) }
  }
  if (!open) return <p className="mt-8 text-center"><button onClick={() => setOpen(true)} className="text-sm font-bold text-slate-600 underline">{S.imHost}</button></p>
  return <form onSubmit={submit} className={`${card} mx-auto mt-8 max-w-sm text-center`}>
    <h2 className="text-xl font-bold">{S.hostLogin}</h2>
    <p className="mt-1 text-sm text-slate-600">{S.hostLoginHelp}</p>
    <div className="mt-3 flex justify-center"><PinInput value={pin} onChange={setPin} label={S.pinAria} /></div>
    {err && <p className="mt-2 font-bold text-rose-700" role="alert">{err}</p>}
    <button disabled={busy || !pinOk(pin)} className={`${btnMain} mt-3 w-full`}>{busy ? S.wait : S.enter}</button>
  </form>
}

// Host view: the organizer code — set one (older events) or change it.
function OrganizerPin({ code, token, show }) {
  const [site, S] = useSite()
  const [has, setHas] = useState(null), [editing, setEditing] = useState(false), [pin, setPin] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { let live = true; rsvpDb.hasPin(code, token).then(v => { if (live) setHas(Boolean(v)) }).catch(() => { if (live) setHas('off') }); return () => { live = false } }, [code, token])
  if (has === null || has === 'off') return null
  const save = async e => {
    e.preventDefault()
    setBusy(true)
    try { await rsvpDb.setPin(code, token, pin); setHas(true); setEditing(false); setPin(''); show(S.pinSaved) } catch (e2) { show(errText(site, e2.code), 'err') } finally { setBusy(false) }
  }
  if (has && !editing) return <p className="mt-4 text-sm text-slate-600">{S.hasPin} <button onClick={() => setEditing(true)} className="font-bold underline">{S.changePin}</button></p>
  return <form onSubmit={save} className="mt-4 rounded-xl bg-amber-50 p-3">
    <p className="font-bold">🔑 {has ? S.newPin : S.choosePin}</p>
    <p className="text-sm text-slate-600">{S.pinHelp2}</p>
    <div className="mt-2 flex items-center gap-2"><PinInput value={pin} onChange={setPin} label={S.pinAria} /><button disabled={busy || !pinOk(pin)} className={btn}>{busy ? S.wait : S.save}</button></div>
  </form>
}

// English share box: a QR code of the guests' link, for printed invitations.
function LinkQr({ link }) {
  const [, S] = useSite()
  const [svg, setSvg] = useState('')
  const [open, setOpen] = useState(false)
  useEffect(() => { if (!open) return; let live = true; import('qrcode').then(({ default: Q }) => Q.toString(link, { type: 'svg', margin: 1, width: 240, color: { dark: '#111633', light: '#ffffff' } })).then(s => { if (live) setSvg(s) }).catch(() => {}); return () => { live = false } }, [link, open])
  return <details className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-sm" onToggle={e => setOpen(e.currentTarget.open)}>
    <summary className="cursor-pointer font-bold">{S.qr}</summary>
    {svg && <><div className="mx-auto mt-2 w-44 [&_svg]:h-auto [&_svg]:w-full" role="img" aria-label={S.qr} dangerouslySetInnerHTML={{ __html: svg }} />
      <button type="button" onClick={() => download('rsvp-qr.svg', svg, 'image/svg+xml')} className={`${btn} mt-2 w-full`}>{S.qrDownload}</button></>}
  </details>
}

function HostView({ ev, setEv, token, show, reload, onDeleted }) {
  const [site, S] = useSite()
  const STATUS = statusesFor(site)
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
  const link = guestLink(site, ev.code)
  // Texts and copied links carry "?wa" so arrivals from shared links are counted; the shown link, QR and organizer link stay clean.
  const sharedLink = `${link}?wa`
  const x = site === 'en' ? { ...(ev.extras || {}), price: 0 } : ev.extras || {}, marks = ev.marks || {}
  const mark = async (r, patch) => {
    const before = marks[r.id] || {}
    setEv(e => ({ ...e, marks: { ...e.marks, [r.id]: { ...before, ...patch } } }))
    try { const m = await rsvpDb.mark(ev.code, token, r.id, patch); setEv(e => ({ ...e, marks: { ...e.marks, [r.id]: m } })) }
    catch (e) { setEv(ev2 => ({ ...ev2, marks: { ...ev2.marks, [r.id]: before } })); show(errText(site, e.code), 'err') }
  }
  const coming = responses.filter(r => r.status !== 'no')
  const paidCount = coming.filter(r => marks[r.id]?.paid).length
  const [seating, setSeating] = useState(false)
  const save = async () => {
    setBusy(true)
    try {
      const row = enhanced ? await rsvpDb.updateV2(ev.code, token, { ...fromForm(form), theme: form.theme || ev.theme }) : await rsvpDb.update(ev.code, token, fromForm(form))
      const extras = await rsvpDb.extrasSet(ev.code, token, { ...extrasOf(form, site), type: ev.extras?.type }).catch(() => ev.extras)
      setEv(e => ({ ...e, ...row, extras: extras || {} })); setEditing(false); show(S.updated)
    }
    catch (e) { show(errText(site, e.code), 'err') } finally { setBusy(false) }
  }
  const csv = () => {
    if (enhanced) { download(S.csvName(ev.title), responseCsv(sorted, STATUS, S.csvHeaders), 'text/csv;charset=utf-8'); return }
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [S.csvHeaders, ...responses.map(r => [r.name, STATUS[r.status].label, r.kids, r.adults, r.allergies, r.pickup, r.note])]
    download(S.csvName(ev.title), '﻿' + rows.map(r => r.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8')
  }
  const sorted = enhanced ? filterResponses(responses, filter, search) : ['yes', 'maybe', 'no'].flatMap(s => responses.filter(r => r.status === s))
  const dir = site === 'en' ? 'ltr' : 'rtl', align = site === 'en' ? 'left' : 'right'
  const invitation = S.invitation(ev.code)
  return <div className={`${enhanced ? 'rsvp-v2' : ''} grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]`}>
    <div className="space-y-5">
      <section className={card}>
        {editing
          ? <><h2 className="mb-3 text-2xl font-bold">{S.editTitle}</h2>{enhanced && <ThemePicker value={form.theme || ev.theme} onChange={theme => setForm(f => ({ ...f, theme }))} site={site} />}<EventForm value={form} onChange={setForm} onSubmit={save} busy={busy} submitLabel={S.save} /><button onClick={() => setEditing(false)} className="mt-2 w-full py-2 text-slate-500 underline">{S.cancel}</button></>
          : <>{enhanced ? <InvitationCard ev={ev} lang={site} site={site} /> : <EventHeader ev={ev} />}<div className="mt-3 text-center"><button onClick={() => { setForm({ ...toForm(ev), ...(enhanced ? { theme: ev.theme } : {}) }); setEditing(true) }} className="text-sm font-bold underline">{S.editDetails}</button></div></>}
        {enhanced && !editing && <div className="mt-4"><EventActions ev={ev} download={download} lang={site} site={site} /></div>}
      </section>

      <section className={card} aria-label={S.summaryAria}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Stat n={enhanced ? totals.people : totals.yes} label={enhanced ? S.statPeople : S.statYes} tone="bg-emerald-50" />
          <Stat n={totals.kids} label={S.statKids} />
          <Stat n={totals.adults} label={S.statAdults} />
          <Stat n={totals.maybe} label={enhanced ? S.statMaybeV2 : S.statMaybe} tone="bg-amber-50" />
          <Stat n={totals.no} label={enhanced ? S.statNoV2 : S.statNo} />
          <Stat n={ev.invitees?.length ? missing.length : '—'} label={S.statMissing} tone="bg-rose-50" />
        </div>
        {enhanced && <p className="mt-3 text-center text-sm">{S.summaryLine(totals.yes, responses.length, (ev.invitees?.length || 0) - missing.length, ev.invitees?.length || 0)}</p>}
        {totals.maybe > 0 && <p className="mt-2 text-center text-sm text-slate-600">{S.maybeMore(S.people(totals.maybeKids, totals.maybeAdults))}</p>}
        {totals.allergies.length > 0 && <div className="mt-4 rounded-xl border-2 border-rose-200 bg-rose-50 p-3">
          <h3 className="font-bold">{S.allergiesTitle}</h3>
          <ul className="mt-1 space-y-0.5">{totals.allergies.map((a, i) => <li key={i}><b>{a.name}:</b> {a.text}</li>)}</ul>
        </div>}
        {x.price > 0 && <p className="mt-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center font-bold">{S.paidMain(paidCount, coming.length, money(site, paidCount * x.price, x.currency))} <span className="font-normal text-slate-600">{S.paidPer(money(site, x.price, x.currency))}</span></p>}
      </section>

      <section className={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold">{S.replies(responses.length)}</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={reload} className="min-h-[44px] rounded-xl border-2 border-slate-200 px-3 font-bold" aria-label={S.refresh}>🔄</button>
            <button onClick={() => setPrinting(true)} disabled={enhanced ? !sorted.length : !responses.length} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold disabled:opacity-40">{S.print}</button>
            <button onClick={csv} disabled={enhanced ? !sorted.length : !responses.length} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold disabled:opacity-40">{S.excel}</button>
          </div>
        </div>
        {enhanced && <><Field label={S.searchLabel}><input className={input} type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder={S.searchPh} /></Field><div className="rsvp-filter-bar" role="group" aria-label={S.filterAria}>{RESPONSE_FILTERS.map(([id, label]) => <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>{S.filters[id] || label}</button>)}</div><p className="text-sm text-slate-600" aria-live="polite">{S.showing(sorted.length, responses.length)}</p></>}
        {enhanced && responses.length > 0 && !sorted.length && <p className="py-6 text-center">{S.noMatch} <button className="underline" onClick={() => { setSearch(''); setFilter('all') }}>{S.showAll}</button></p>}
        {!responses.length && <p className="py-6 text-center text-slate-500">{S.noReplies}</p>}
        <ul className="mt-3 space-y-2">{sorted.map(r => <li key={r.id} className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-3">
          <div className={`flex items-start gap-2 ${enhanced ? 'rsvp-response-top' : ''}`}>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-sm font-bold ${STATUS[r.status].cls}`}>{STATUS[r.status].emoji} {STATUS[r.status].label}</span>
            <b className={`min-w-0 flex-1 text-lg ${enhanced ? 'rsvp-response-name' : ''}`}>{r.name}</b>
            {r.status !== 'no' && <span className="shrink-0 text-sm text-slate-600">{S.people(r.kids, r.adults)}</span>}
            <button onClick={() => setConfirm(r)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={S.deleteReplyAria(r.name)}>✕</button>
          </div>
          {(r.allergies || r.pickup || r.note) && <p className="mt-1 text-sm text-slate-700">{[r.allergies && `⚠️ ${r.allergies}`, r.pickup && `🚗 ${r.pickup}`, r.note && `💬 ${r.note}`].filter(Boolean).join(' · ')}</p>}
          {r.status !== 'no' && (x.price > 0 || x.tables > 0) && <div className="mt-2 flex flex-wrap items-center gap-2">
            {x.price > 0 && <button type="button" onClick={() => mark(r, { paid: !marks[r.id]?.paid })} aria-pressed={Boolean(marks[r.id]?.paid)}
              className={`min-h-[40px] rounded-xl border-2 px-3 text-sm font-bold ${marks[r.id]?.paid ? 'border-emerald-500 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>{marks[r.id]?.paid ? S.paid : S.notPaid}</button>}
            {x.tables > 0 && <select aria-label={S.tableOf(r.name)} value={marks[r.id]?.table || ''} onChange={e => mark(r, { table: e.target.value ? Number(e.target.value) : null })} className="min-h-[40px] rounded-xl border-2 border-slate-200 bg-white px-2 text-sm font-bold">
              <option value="">{S.noTable}</option>{Array.from({ length: x.tables }, (_, i) => <option key={i + 1} value={i + 1}>{S.tableN(i + 1)}</option>)}
            </select>}
          </div>}
        </li>)}</ul>
      </section>
      {x.tables > 0 && <SeatingSection ev={ev} coming={coming} marks={marks} onPrint={() => setSeating(true)} />}
    </div>

    <aside className="space-y-4 lg:sticky lg:top-4">
      <section className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
        <h2 className="font-display text-2xl font-bold">{S.sendTitle}</h2>
        <button onClick={() => openWhatsApp(S.inviteText(ev, sharedLink))} className={`${btnWa} mt-3 w-full`}>{S.sendWa}</button>
        <button onClick={() => copyText(sharedLink, show, S.linkCopied)} className={`${btn} mt-2 w-full`}>{S.copyLink}</button>
        <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-center text-sm">{S.linkLabel} <bdi dir="ltr" className="font-bold">{link.replace(/^https?:\/\//, '')}</bdi></p>
        {S.qr && <LinkQr link={link} />}
        <Link to={invitation.to} className={`${btn} mt-3 w-full`}>{invitation.label}</Link>
        {S.bringList && <Link to={S.bringList.to} className={`${btn} mt-2 w-full`}>{S.bringList.label}</Link>}
      </section>
      <section className={card}>
        <h2 className="text-xl font-bold">{S.reminderTitle}</h2>
        {ev.invitees?.length > 0
          ? missing.length ? <p className="mt-1">{missing.join(' · ')}</p> : <p className="mt-1 font-bold text-emerald-700">{S.allAnswered}</p>
          : <p className="mt-1 text-sm text-slate-600">{S.addListHint}</p>}
        <button onClick={() => openWhatsApp(S.reminderText(ev, missing, sharedLink))} disabled={ev.invitees?.length > 0 && !missing.length} className={`${btn} mt-3 w-full`}>{S.reminderWa}</button>
        {enhanced && <button onClick={() => copyText(S.reminderText(ev, missing, sharedLink), show, S.reminderCopied)} disabled={ev.invitees?.length > 0 && !missing.length} className={`${btn} mt-2 w-full`}>{S.reminderCopy}</button>}
        <a href={`${S.base}/r/${ev.code}?guest=1`} target="_blank" rel="noopener" className="mt-3 block text-center text-sm font-bold underline">{S.guestPreview}</a>
        <OrganizerPin code={ev.code} token={token} show={show} />
        <OrganizerTools what="האירוע" labels={site === 'he' ? undefined : S.organizerTools} onCopyOrganizer={() => copyText(`${link}#k=${token}`, show, S.organizerCopied)} onDelete={() => setConfirm('event')} />
      </section>
    </aside>

    {confirm === 'event' && <ConfirmDialog title={S.deleteEvent.title} text={S.deleteEvent.text} yes={S.deleteEvent.yes} cancel={S.cancel} onClose={() => setConfirm(null)}
      onYes={async () => { try { await rsvpDb.remove(ev.code, token); groupMemory.forgetOwned(KIND, ev.code); onDeleted() } catch (e) { show(errText(site, e.code), 'err') } setConfirm(null) }} />}
    {confirm && confirm !== 'event' && <ConfirmDialog title={S.deleteReply.title(confirm.name)} text={S.deleteReply.text} yes={S.deleteReply.yes} cancel={S.cancel} onClose={() => setConfirm(null)}
      onYes={async () => { const r = confirm; setConfirm(null); try { await rsvpDb.removeResponse(ev.code, token, r.id); setEv(e => ({ ...e, responses: e.responses.filter(x => x.id !== r.id) })) } catch (e) { show(errText(site, e.code), 'err') } }} />}
    {seating && <PrintPreview lang={site} title={S.seatingPrintTitle(ev.title)} onClose={() => setSeating(false)}><SeatingPrint ev={ev} coming={coming} marks={marks} /></PrintPreview>}
    {printing && <PrintPreview lang={site} title={S.printTitle(ev.title)} onClose={() => setPrinting(false)}>
      <div className="buga-flow" dir={dir}>
        <h2 style={{ fontSize: 26, margin: 0 }}>{ev.title}</h2>
        <p>{[ev.date && S.date(ev.date), ev.time, ev.place].filter(Boolean).join(' · ')}</p>
        <p><b>{S.printHead(enhanced, totals)}</b>{S.printRest(totals, ev.invitees?.length ? missing.length : null)}</p>
        {enhanced && <p>{S.printList(S.filters[filter] || RESPONSE_FILTERS.find(([id]) => id === filter)?.[1], search, sorted.length)}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
          <thead><tr>{S.csvHeaders.map(h => <th key={h} style={{ borderBottom: '2px solid #333', textAlign: align, padding: 4 }}>{h}</th>)}</tr></thead>
          <tbody>{sorted.map(r => <tr key={r.id}>{[r.name, STATUS[r.status].label, r.kids || '', r.adults || '', r.allergies, r.pickup, r.note].map((c, i) => <td key={i} style={{ borderBottom: '1px solid #ddd', padding: 4 }}>{c}</td>)}</tr>)}</tbody>
        </table>
        {missing.length > 0 && <p style={{ marginTop: 10 }}><b>{S.missingPrint}</b> {missing.join(S.listJoin)}</p>}
      </div>
    </PrintPreview>}
  </div>
}

// ── seating: who sits at each table, and an alphabetical list for the entrance ──
const headcount = r => (Number(r.kids) || 0) + (Number(r.adults) || 0)
function SeatingSection({ ev, coming, marks, onPrint }) {
  const [, S] = useSite()
  const tables = Array.from({ length: ev.extras.tables }, (_, i) => i + 1)
  const at = n => coming.filter(r => marks[r.id]?.table === n)
  const free = coming.filter(r => !marks[r.id]?.table)
  return <section className={card}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold">{S.seatingTitle}</h2><button onClick={onPrint} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold">{S.entranceList}</button></div>
    <p className="mt-1 text-sm text-slate-600">{S.seatingHelp(ev.extras.show_table)}</p>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">{tables.map(n => { const list = at(n); return <div key={n} className="rounded-xl border-2 border-slate-100 bg-slate-50 p-3">
      <b>{S.tableN(n)}</b> <span className="text-sm text-slate-600">{S.seats(list.reduce((s, r) => s + headcount(r), 0))}</span>
      <p className="text-sm">{list.map(r => r.name).join(' · ') || <span className="text-slate-400">{S.empty}</span>}</p>
    </div> })}</div>
    {free.length > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm"><b>{S.unseated(free.length)}</b> {free.map(r => r.name).join(' · ')}</p>}
  </section>
}
function SeatingPrint({ ev, coming, marks }) {
  const [site, S] = useSite()
  const list = [...coming].sort((a, b) => a.name.localeCompare(b.name, site))
  return <div className="buga-flow" dir={site === 'en' ? 'ltr' : 'rtl'}>
    <h2 style={{ fontSize: 26, margin: 0 }}>{S.seatingPrintTitle(ev.title)}</h2>
    <p>{[ev.date && S.date(ev.date), ev.time, ev.place].filter(Boolean).join(' · ')}</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16, marginTop: 8 }}>
      <thead><tr>{S.seatHeaders.map(h => <th key={h} style={{ borderBottom: '2px solid #333', textAlign: site === 'en' ? 'left' : 'right', padding: 6 }}>{h}</th>)}</tr></thead>
      <tbody>{list.map(r => <tr key={r.id}>{[r.name, marks[r.id]?.table || '—', headcount(r)].map((c, i) => <td key={i} style={{ borderBottom: '1px solid #ddd', padding: 6, fontWeight: i === 1 ? 800 : 400 }}>{c}</td>)}</tr>)}</tbody>
    </table>
  </div>
}

// ── SEO body for /rsvp and /en/rsvp (page copy in utils/rsvpPageCopy.js) ──
function RsvpGuide() {
  const [site] = useSite(), P = PAGE[site]
  return <section className="mx-auto mt-14 max-w-3xl">
    <h2 className="mb-3 text-3xl font-bold">{P.guideTitle}</h2>
    <ol className="mb-8 grid gap-3 sm:grid-cols-3">
      {P.steps.map(([n, t, d]) =>
        <li key={n} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><span className="text-2xl font-black text-[var(--accent)]">{n}</span><h3 className="text-lg font-bold">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></li>)}
    </ol>
    <SeoBody lang={site} paragraphs={P.paragraphs} faq={P.faq} related={P.related} />
  </section>
}

// /rsvp/<type>: the same page, started with that event type's defaults and advice.
export function RsvpTypePage({ site = 'he' }) {
  const { type } = useParams()
  const preset = typeOf(site, type)
  return preset ? <Rsvp key={type} preset={preset} site={site} /> : site === 'en' ? <EnglishTypeMissing /> : <NotFound />
}
function EnglishTypeMissing() {
  return <div className="mx-auto max-w-xl px-4 py-16 text-center"><SEO lang="en" title="RSVP page not found" description="This RSVP page is not available. Create a free online RSVP for any event." noindex /><h1 className="text-3xl font-black">We couldn’t find that page</h1><p className="mt-3">The address may be incomplete.</p><Link to="/en/rsvp" className={`${btn} mt-6`}>Create a free RSVP</Link></div>
}

function TypeGuide({ preset }) {
  const [site, S] = useSite(), P = PAGE[site]
  return <section className="mx-auto mt-14 max-w-3xl">
    <h2 className="mb-3 text-3xl font-bold">{S.tipsTitle(preset.h1)}</h2>
    <ul className="mb-8 grid gap-3">{preset.tips.map((tip, i) => <li key={i} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4 text-lg">💡 {tip}</li>)}</ul>
    <SeoBody lang={site} paragraphs={[preset.intro, P.typeParagraph]} faq={preset.faq} related={P.typeRelated(preset)} />
  </section>
}
export function RsvpTypeLinks({ current, list, title, site = 'he' }) {
  const S = rsvpUi(site)
  return <section className="mx-auto mt-10 max-w-3xl">
    <h2 className="mb-3 text-2xl font-bold">{title || S.typeLinksTitle}</h2>
    <div className="flex flex-wrap gap-2">{(list || typesFor(site)).filter(x => x.slug !== current).map(x => <Link key={x.slug} to={`${S.base}/rsvp/${x.slug}`} className="rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 font-bold hover:border-slate-800">{x.emoji} {x.name}</Link>)}</div>
  </section>
}

// The English site's pages: the same tool inside the English layout.
export const EnglishRsvp = () => <Rsvp site="en" />
export const EnglishRsvpType = () => <RsvpTypePage site="en" />

export default function Rsvp({ preset = null, site = 'he' }) {
  return <SiteLang.Provider value={site === 'en' ? 'en' : 'he'}><RsvpPage preset={preset} /></SiteLang.Provider>
}
function RsvpPage({ preset }) {
  const [site, S] = useSite(), P = PAGE[site], en = site === 'en'
  const { code: pathCode } = useParams()
  const [params] = useSearchParams()
  const [code, setCode] = useState(pathCode || null)
  const [token, setToken] = useState(() => pathCode && params.get('guest') !== '1' ? tokenFromHash(KIND, pathCode) || groupMemory.ownerToken(KIND, pathCode) : null)
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(pathCode))
  const [form, setForm] = useState(() => emptyEvent(params, preset, site))
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
      const wanted = extrasOf(form, site)
      const extras = hasExtras(wanted) ? await rsvpDb.extrasSet(row.code, t, wanted).catch(() => ({})) : {}
      window.history.replaceState(window.history.state, '', `${S.base}/r/${row.code}`)
      setToken(t); setEv({ ...row, responses: [], extras: extras || {}, marks: {} }); setCode(row.code)
      show(S.created)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) { show(errText(site, e.code), 'err') } finally { setBusy(false) }
  }

  const organizerIn = t => { groupMemory.rememberOwned(KIND, code, t, ev.title); setToken(t); show(S.hostIn) }
  const mine = groupMemory.owned(KIND).filter(x => x.code !== code).slice(0, 5)
  let body
  if (deleted) body = <div className="py-10 text-center"><p className="text-xl font-bold">{S.deleted}</p><a href={`${S.base}/rsvp`} className={`${btn} mt-6`}>{S.newEvent}</a></div>
  else if (code && error) body = <ErrorPanel code={error} text={en ? errText(site, error) : undefined} home={`${S.base}/rsvp`} homeLabel={S.newRsvp} />
  else if (code && (loading || !ev)) body = <p className="py-16 text-center text-lg">{S.loading}</p>
  else if (code && host) body = <HostView ev={ev} setEv={setEv} token={token} show={show} reload={load} onDeleted={() => setDeleted(true)} />
  else if (code && isRsvpV2(ev)) body = <RsvpGuestExperience ev={ev} show={show} onAnswer={r => setEv(e => ({ ...e, mine: r }))} AnswerForm={AnswerForm} download={download} statuses={statusesFor(site)} site={site} />
  else if (code) body = <GuestView ev={ev} show={show} onAnswer={r => setEv(e => ({ ...e, mine: r }))} />
  else body = newExperience ? <RsvpCreateExperience form={form} onChange={setForm} mine={mine} site={site}><EventForm value={form} onChange={setForm} onSubmit={create} busy={busy} submitLabel={S.createBtn} withPin /></RsvpCreateExperience>
    : <section className={`${card} mx-auto max-w-xl`}><h2 className="mb-4 text-2xl font-bold">{S.detailsTitle}</h2><EventForm value={form} onChange={setForm} onSubmit={create} busy={busy} submitLabel={S.createBtn} withPin />{mine.length > 0 && <p className="mt-4">{S.myEvents} {mine.map(e => <a key={e.code} className="underline mx-2" href={`${S.base}/r/${e.code}`}>{e.title || e.code}</a>)}</p>}</section>
  const titleText = ev?.title ? S.eventTitle(ev.title) : P.title
  const pageTitle = preset ? P.typeTitle(preset) : P.title
  const pageDesc = preset ? P.typeDesc(preset) : P.desc
  const pagePath = preset ? `${S.base}/rsvp/${preset.slug}` : `${S.base}/rsvp`
  const crumbs = en
    ? [{ label: S.crumbs.home, href: '/en' }, { label: S.crumbs.rsvp, href: code || preset ? '/en/rsvp' : undefined }, ...(preset && !code ? [{ label: preset.name }] : [])]
    : [{ label: S.crumbs.home, href: '/' }, preset?.vaad ? { label: S.crumbs.vaad, href: '/vaad' } : { label: S.crumbs.tools, href: '/tools' }, { label: S.crumbs.rsvp, href: code || preset ? '/rsvp' : undefined }, ...(preset && !code ? [{ label: preset.name }] : [])]
  return <div className={`mx-auto max-w-6xl px-4 py-8 buga-fade-in ${en ? 'en-rsvp' : ''}`}>
    <SEO lang={site} title={code ? titleText : pageTitle} description={pageDesc} path={pagePath} noindex={Boolean(pathCode)} structuredData={code ? null : faqSchema(preset ? preset.faq : P.faq)}
      counterpartPath={en && !pathCode ? (preset ? `/rsvp/${preset.slug}` : '/rsvp') : undefined} />
    <Breadcrumbs lang={site} items={crumbs} />
    {!code && <header className="mb-7 text-center">
      <h1 className="text-4xl sm:text-5xl">{preset ? `${preset.emoji} ${preset.h1}` : P.h1}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">{preset ? preset.intro : P.lead}</p>
    </header>}
    {!code && !preset && <QuickAnswer lang={site} q={P.quick.q} a={P.quick.a} rows={P.quick.rows} updated={P.quick.updated} />}
    {body}
    {code && ev && !host && !error && !deleted && <OrganizerLogin code={code} onIn={organizerIn} />}
    {!code && (preset ? <TypeGuide preset={preset} /> : <RsvpGuide />)}
    {!code && <RsvpTypeLinks current={preset?.slug} site={site} />}
    {toast}
  </div>
}

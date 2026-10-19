import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import PrintPreview from '../../../components/ui/PrintPreview'
import { secretDb, groupMemory, groupErrorText, newToken, tokenFromHash, shareUrl, organizerUrl } from '../../../utils/groupDb'
import { LIMITS, cleanText, parseNames, validateDrawNames, drawPairs, canDraw, DRAW_MODES } from '../../../utils/groupTools'
import './group.css'
import { card, input, btn, btnMain, useToast, copyText, openWhatsApp, ConfirmDialog, ErrorPanel, Field, OrganizerTools } from './GroupUi'
import SiteInvite from '../../../components/ui/SiteInvite'

const KIND = 'secret'
const DEFAULT_TITLE = { gamad: 'גמד וענק', purim: 'משלוח מנות לפורים', hanukkah: 'מתנות לחנוכה' }
const personalLink = (code, token) => `${shareUrl(KIND, code)}#p=${token}`
const personalText = (d, p) => `${DRAW_MODES[d.mode].emoji} ${p.name}, זה הקישור האישי שלך ל„${d.title}”.\nרק את/ה תראו בו את מי הגרלת — לא להעביר לאחרים 🤫\n${personalLink(d.code, p.token)}`
const groupText = d => `${DRAW_MODES[d.mode].emoji} ההגרלה ל„${d.title}” בוצעה!${d.budget ? `\n💰 תקציב: ${d.budget}` : ''}${d.note ? `\n📝 ${d.note}` : ''}\nכל אחד/ת יקבל/תקבל ממני קישור אישי בהודעה פרטית — שם מגלים את מי הגרלתם. שומרים על סוד! 🤫`
const participantKey = code => `secret-p-${code}`

// ── create form ───────────────────────────────────────────────
function CreateForm({ show, onCreated, onPrint }) {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(() => DRAW_MODES[params.get('mode')] ? params.get('mode') : 'gamad')
  const [title, setTitle] = useState(DEFAULT_TITLE[mode])
  const [namesText, setNamesText] = useState('')
  const [budget, setBudget] = useState('')
  const [note, setNote] = useState('')
  const [exclusions, setExclusions] = useState([]) // [[nameA, nameB]] by name, so editing the list keeps them
  const [pick, setPick] = useState(['', ''])
  const [busy, setBusy] = useState(false)
  const names = useMemo(() => parseNames(namesText), [namesText])
  const check = validateDrawNames(names)
  const exIdx = exclusions.map(([a, b]) => [names.indexOf(a), names.indexOf(b)]).filter(([a, b]) => a >= 0 && b >= 0)
  const possible = !check.ok || canDraw(names.length, exIdx)
  const chooseMode = m => { if (title === DEFAULT_TITLE[mode]) setTitle(DEFAULT_TITLE[m]); setMode(m) }
  const addExclusion = () => {
    const [a, b] = pick
    if (!a || !b || a === b || exclusions.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) return
    setExclusions([...exclusions, [a, b]]); setPick(['', ''])
  }
  const createOnline = async () => {
    if (!check.ok || !possible) return
    setBusy(true)
    try {
      const t = newToken()
      const row = await secretDb.create(t, { title: cleanText(title, 60) || DEFAULT_TITLE[mode], mode, note: cleanText(note, LIMITS.note, true), budget: cleanText(budget, 30), names, exclusions: exIdx })
      groupMemory.rememberOwned(KIND, row.code, t, row.title)
      onCreated(row, t)
    } catch (e) { show(groupErrorText(e.code), 'err') } finally { setBusy(false) }
  }
  const printSlips = drawn => {
    if (!check.ok || !possible) return
    const targets = drawn ? drawPairs(names.length, exIdx) : null
    if (drawn && !targets) { show(groupErrorText('draw_impossible'), 'err'); return }
    onPrint({ mode, title: cleanText(title, 60) || DEFAULT_TITLE[mode], budget: cleanText(budget, 30), note: cleanText(note, LIMITS.note, true), names, targets })
  }
  return <div className="space-y-5">
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="סוג ההגרלה">
      {Object.entries(DRAW_MODES).map(([k, m]) => <button key={k} type="button" onClick={() => chooseMode(k)} aria-pressed={mode === k}
        className={`min-h-[84px] rounded-2xl border-2 px-1 font-bold leading-tight ${mode === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>
        <span className="block text-3xl" aria-hidden="true">{m.emoji}</span>{m.label}</button>)}
    </div>
    <Field label="שם ההגרלה"><input className={input} value={title} maxLength={60} onChange={e => setTitle(e.target.value)} placeholder="למשל: גמד וענק — כיתה ג׳2" /></Field>
    <Field label="המשתתפים" hint="(שם בכל שורה, 3–60)">
      <textarea className={`${input} min-h-[160px]`} value={namesText} onChange={e => setNamesText(e.target.value)} placeholder={'נועה\nיואב\nאורי\nמיכל'} />
      <span className={`mt-1 block text-sm font-normal ${names.length && !check.ok ? 'text-rose-700' : 'text-slate-500'}`}>{names.length} משתתפים{names.length > 0 && !check.ok ? ` · ${check.error}` : ''}</span>
    </Field>
    {names.length >= 3 && <div className="rounded-2xl border-2 border-dashed border-slate-300 p-3">
      <p className="font-bold">מי לא יגרילו זה את זה? <span className="text-sm font-normal text-slate-500">(אחים, בני זוג — לא חובה)</span></p>
      <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
        {[0, 1].map(i => <select key={i} aria-label={i ? 'שם שני' : 'שם ראשון'} value={pick[i]} onChange={e => setPick(p => i ? [p[0], e.target.value] : [e.target.value, p[1]])} className="min-h-[44px] min-w-0 rounded-xl border-2 border-slate-200 bg-white px-2">
          <option value="">בחרו…</option>{names.map(n => <option key={n} value={n}>{n}</option>)}</select>)}
        <button type="button" onClick={addExclusion} disabled={!pick[0] || !pick[1] || pick[0] === pick[1]} className="min-h-[44px] rounded-xl border-2 border-slate-800 px-3 font-bold disabled:opacity-40">הוספה</button>
      </div>
      {exclusions.length > 0 && <ul className="mt-2 flex flex-wrap gap-2">{exclusions.map(([a, b], i) => <li key={`${a}-${b}`} className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">
        {a} ✕ {b}<button type="button" onClick={() => setExclusions(exclusions.filter((_, j) => j !== i))} aria-label={`הסרת ההחרגה ${a} ו${b}`} className="px-1 text-slate-500">×</button></li>)}</ul>}
      {!possible && <p role="alert" className="mt-2 font-bold text-rose-700">{groupErrorText('draw_impossible')}</p>}
    </div>}
    <div className="grid grid-cols-2 gap-3">
      <Field label="תקציב" hint="(לא חובה)"><input className={input} value={budget} maxLength={30} onChange={e => setBudget(e.target.value)} placeholder="עד 30 ש״ח" /></Field>
      <Field label="מתי מגלים?" hint="(לא חובה)"><input className={input} value={note} maxLength={120} onChange={e => setNote(e.target.value)} placeholder="ביום חמישי בכיתה" /></Field>
    </div>
    <button onClick={createOnline} disabled={busy || !check.ok || !possible} className={`${btnMain} w-full`}>{busy ? 'מגרילים…' : '🎲 הגרלה עם קישור אישי לכל אחד'}</button>
    <div className="grid gap-2 sm:grid-cols-2">
      <button onClick={() => printSlips(true)} disabled={!check.ok || !possible} className={btn}>🖨️ פתקים מוגרלים להדפסה</button>
      <button onClick={() => printSlips(false)} disabled={!check.ok} className={btn}>✂️ פתקי שמות לשליפה מכובע</button>
    </div>
    <p className="text-sm text-slate-500">בהגרלה עם קישורים ההגרלה נעשית בשרת, ואתם לא רואים מי הגריל את מי. הפתקים המוגרלים מתאימים לכיתה בלי טלפונים: ההגרלה נעשית במכשיר שלכם, מדפיסים, גוזרים, ומקפלים את החלק התחתון של כל פתק כלפי מעלה כשהכתב פנימה — השם נשאר גלוי, והסוד מוסתר.</p>
  </div>
}

// ── printable slips ───────────────────────────────────────────
function Slips({ data, onClose }) {
  const m = DRAW_MODES[data.mode]
  const per = 8
  const pages = []
  for (let i = 0; i < data.names.length; i += per) pages.push(data.names.slice(i, i + per).map((n, k) => ({ name: n, target: data.targets ? data.names[data.targets[i + k]] : null })))
  return <PrintPreview title={data.targets ? `${data.title} — פתקים מוגרלים` : `${data.title} — פתקי שמות`} onClose={onClose}>
    {pages.map((page, pi) => <div key={pi} className="buga-a4 gt-slips" dir="rtl">
      <h2>{m.emoji} {data.title}{data.budget ? ` · תקציב: ${data.budget}` : ''}</h2>
      <div className="gt-slip-grid">{page.map(s => <div key={s.name} className="gt-slip">
        {s.target
          ? <><div className="gt-slip-out">לכבוד: <b>{s.name}</b><small>לא לפתוח עד שהמורה אומרת 🤫</small></div>
            <div className="gt-slip-fold">- - - מקפלים כאן למעלה, הכתב פנימה - - -</div>
            <div className="gt-slip-in">{m.verb}:<b>{s.target}</b>{data.note && <small>{data.note}</small>}</div></>
          : <div className="gt-slip-name"><b>{s.name}</b></div>}
      </div>)}</div>
    </div>)}
  </PrintPreview>
}

// ── organizer dashboard ───────────────────────────────────────
function OrganizerView({ d, setD, token, show, onDeleted }) {
  const [confirm, setConfirm] = useState(null)
  const [pairs, setPairs] = useState(null)
  const m = DRAW_MODES[d.mode]
  const opened = d.people.filter(p => p.opened).length
  const sent = groupMemory.get(`secret-sent-${d.code}`, {})
  const markSent = p => { groupMemory.set(`secret-sent-${d.code}`, { ...sent, [p.idx]: true }); setD(x => ({ ...x })) }
  return <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <section className={card}>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-dashed pb-3">
        <div><p className="text-sm font-bold text-slate-500">{m.emoji} {m.label}</p><h1 className="text-2xl font-black">{d.title}</h1>
          {(d.budget || d.note) && <p className="text-slate-600">{[d.budget && `💰 ${d.budget}`, d.note && `📝 ${d.note}`].filter(Boolean).join(' · ')}</p>}</div>
        <span className="rounded-full bg-emerald-100 px-3 py-2 font-bold text-emerald-800">{opened}/{d.people.length} גילו</span>
      </div>
      <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2">🤫 ההגרלה בוצעה. <b>אתם לא רואים מי הגריל את מי.</b> שלחו לכל משתתף את הקישור האישי שלו בהודעה פרטית — „שליחה” פותח וואטסאפ עם הודעה מוכנה, ובוחרים את איש הקשר.</p>
      <ul className="mt-4 space-y-2">{d.people.map(p => <li key={p.idx} className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50 p-2.5">
        <b className="min-w-0 flex-1 text-lg">{p.name}</b>
        {p.opened ? <span className="text-sm font-bold text-emerald-700">✓ גילה/תה</span> : sent[p.idx] ? <span className="text-sm text-slate-500">נשלח</span> : null}
        <button onClick={() => { openWhatsApp(personalText(d, p)); markSent(p) }} className="min-h-[44px] rounded-xl bg-[#25D366] px-3 font-bold text-white">📱 שליחה</button>
        <button onClick={() => { copyText(personalLink(d.code, p.token), show, `הקישור של ${p.name} הועתק ✓`); markSent(p) }} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-3 font-bold" aria-label={`העתקת הקישור של ${p.name}`}>🔗</button>
      </li>)}</ul>
      {pairs && <div className="mt-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3">
        <h3 className="font-bold">כל ההגרלה</h3>
        <ul className="mt-1 grid gap-1 sm:grid-cols-2">{pairs.map(x => <li key={x.name}>{x.name} ← {x.target}</li>)}</ul>
      </div>}
    </section>
    <aside className="space-y-4">
      <section className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
        <h2 className="font-display text-2xl font-bold">הודעה לקבוצה</h2>
        <p className="mt-1 text-sm">מודיעים לכולם שההגרלה בוצעה ושהקישורים מגיעים בפרטי.</p>
        <button onClick={() => openWhatsApp(groupText(d))} className="mt-3 w-full rounded-xl bg-[#25D366] px-4 py-3 text-lg font-bold text-white">📱 הודעה לקבוצה</button>
      </section>
      <section className={card}>
        <h2 className="text-xl font-bold">מארגנים בלבד</h2>
        {!pairs && <button onClick={() => setConfirm('all')} className={`${btn} mt-3 w-full`}>👀 הצגת כל ההגרלה</button>}
        <p className="mt-2 text-sm text-slate-600">אם תציגו את כל ההגרלה, המשתתפים יראו בקישור שלהם שהמארגנים צפו ברשימה.</p>
        <OrganizerTools what="ההגרלה" onCopyOrganizer={() => copyText(organizerUrl(KIND, d.code, token), show, 'קישור הניהול הועתק ✓ שמרו אותו לעצמכם בלבד')} onDelete={() => setConfirm('delete')} />
      </section>
    </aside>
    {confirm === 'all' && <ConfirmDialog danger={false} title="להציג את כל ההגרלה?" text="תראו מי הגריל את מי. המשתתפים יראו בדף שלהם שהמארגנים צפו ברשימה המלאה." yes="כן, להציג" onClose={() => setConfirm(null)}
      onYes={async () => { setConfirm(null); try { setPairs(await secretDb.showAll(d.code, token)) } catch (e) { show(groupErrorText(e.code), 'err') } }} />}
    {confirm === 'delete' && <ConfirmDialog title="למחוק את ההגרלה?" text="כל הקישורים האישיים יפסיקו לעבוד. אי אפשר לשחזר." yes="כן, למחוק" onClose={() => setConfirm(null)}
      onYes={async () => { setConfirm(null); try { await secretDb.remove(d.code, token); groupMemory.forgetOwned(KIND, d.code); onDeleted() } catch (e) { show(groupErrorText(e.code), 'err') } }} />}
  </div>
}

// ── participant: personal link ────────────────────────────────
function ParticipantView({ code, ptoken, organizerHere, show }) {
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { secretDb.whoami(code, ptoken).then(setMe).catch(e => setError(e.code || 'network')) }, [code, ptoken])
  if (error) return <ErrorPanel code={error} home="/secret-friend" homeLabel="יצירת הגרלה חדשה" />
  if (!me) return <p className="py-16 text-center text-lg">טוענים…</p>
  const m = DRAW_MODES[me.mode]
  const reveal = async () => {
    setBusy(true)
    try { setResult(await secretDb.reveal(code, ptoken)) } catch (e) { show(groupErrorText(e.code), 'err') } finally { setBusy(false) }
  }
  return <div className="mx-auto max-w-md space-y-4 text-center">
    <section className={card}>
      <p className="text-5xl" aria-hidden="true">{m.emoji}</p>
      <p className="mt-2 font-bold text-slate-500">{me.title}</p>
      <h1 className="mt-1 text-3xl font-black">שלום {me.name}!</h1>
      {!result ? <>
        {organizerHere && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm">שימו לב: זה הקישור האישי של <b>{me.name}</b>. אם אתם המארגנים ופתחתם אותו בטעות — אל תלחצו, כדי לא לגלות את הסוד.</p>}
        <p className="mt-3 text-lg">ההגרלה מחכה לך. רק את/ה רואים את התוצאה.</p>
        <button onClick={reveal} disabled={busy} className="mt-5 min-h-[64px] w-full rounded-2xl bg-[var(--accent)] text-xl font-black text-white shadow-lg disabled:opacity-60">{busy ? 'פותחים…' : '🎁 גלו את מי הגרלתם'}</button>
      </> : <div className="gt-reveal mt-4">
        <p className="text-lg">{m.verb}:</p>
        <p className="my-2 text-5xl font-black text-[var(--accent)]">{result.target}</p>
        <p className="mt-3 text-right text-[var(--foreground)]/80">{m.task}</p>
        {(me.budget || me.note) && <p className="mt-3 rounded-xl bg-[var(--postit)] px-3 py-2">{[me.budget && `💰 תקציב: ${me.budget}`, me.note && `📝 ${me.note}`].filter(Boolean).join(' · ')}</p>}
        <p className="mt-4 text-sm text-slate-500">🤫 שומרים בסוד! אפשר לחזור לקישור הזה בכל זמן כדי להיזכר.</p>
      </div>}
      {me.shown_all && <p className="mt-4 text-xs text-slate-500">המארגנים בחרו לצפות ברשימת ההגרלה המלאה.</p>}
    </section>
    {result && m === DRAW_MODES.gamad && <p className="text-sm">צריכים רעיונות? <Link to="/gifts" className="font-bold underline">רעיונות למתנות קטנות</Link></p>}
    {result && m === DRAW_MODES.purim && <p className="text-sm">צריכים רעיונות? <Link to="/holidays" className="font-bold underline">פעילויות לחגים</Link></p>}
    {result && <SiteInvite context="gift" />}
  </div>
}

// ── SEO body ──────────────────────────────────────────────────
const FAQ = [
  { q: 'איך עושים הגרלת גמד וענק?', a: 'כותבים את שמות כל המשתתפים, לוחצים „הגרלה”, ושולחים לכל אחד את הקישור האישי שלו בוואטסאפ. כל משתתף פותח את הקישור ורואה רק את מי הוא הגריל — ואף אחד לא מגריל את עצמו.' },
  { q: 'המארגן יכול לראות מי הגריל את מי?', a: 'לא, אלא אם בחר בכוונה „הצגת כל ההגרלה”. ההגרלה נעשית בשרת, והמארגן רואה רק את רשימת השמות, הקישורים ומי כבר גילה. אם בחר להציג הכול, המשתתפים יראו על כך הודעה בדף שלהם.' },
  { q: 'אפשר למנוע שאחים יגרילו זה את זה?', a: 'כן. בחלק „מי לא יגרילו זה את זה” בוחרים זוגות — אחים, בני זוג או חברים צמודים — וההגרלה תדלג עליהם. אם אין דרך לסדר את כולם עם ההחרגות שבחרתם, תופיע הודעה עוד לפני ההגרלה.' },
  { q: 'מה עושים בכיתה שבה לילדים אין טלפון?', a: 'בוחרים „פתקים מוגרלים להדפסה”: בכל פתק כתוב בחוץ שם הילד ובפנים, מתחת לקו הקיפול, את מי הגריל. מדפיסים, גוזרים, מקפלים ומחלקים. אפשר גם להדפיס פתקי שמות רגילים לשליפה מכובע.' },
  { q: 'זה מתאים גם למשלוח מנות בפורים ולמתנות בחנוכה?', a: 'כן. בוחרים את סוג ההגרלה, והדף של כל משתתף יכתוב בהתאם: „אתם מכינים משלוח מנות ל…” או „אתם קונים מתנת חנוכה ל…”, עם התקציב ותאריך החלוקה.' },
]
function SecretGuide() {
  return <section className="mx-auto mt-14 max-w-3xl">
    <h2 className="mb-3 text-3xl font-bold">גמד וענק: איך משחקים?</h2>
    <p className="mb-4 text-lg leading-relaxed">כל משתתף מגריל שם של משתתף אחר. במשך כמה ימים הוא „הגמד” של מי שהגריל: מפנק אותו בסוד בפתק נחמד, בממתק או בציור, בלי לגלות את עצמו. ביום האחרון מגלים מי היה הגמד של מי, ובדרך כלל גם מחליפים מתנה קטנה.</p>
    <div className="mb-8 grid gap-3 sm:grid-cols-3">
      {[['🧙', 'גמד וענק בכיתה', 'שבוע של מחוות קטנות: פתק על השולחן, ציור, עזרה בסידור התיק. תקציב קטן או בלי בכלל.'],
        ['🎭', 'משלוח מנות לפורים', 'כל ילד מכין משלוח מנות למי שהגריל. ההגרלה מבטיחה שכל ילד מקבל אחד — ואף אחד לא נשאר בלי.'],
        ['🕎', 'מתנות לחנוכה', 'מתנה אחת לכל אחד במקום מתנה לכולם: חוסך כסף ומשאיר הפתעה. מתאים גם למשרד ולמשפחה המורחבת.']].map(([e, t, d]) =>
        <div key={t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><span className="text-3xl">{e}</span><h3 className="text-lg font-bold">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></div>)}
    </div>
    <SeoBody paragraphs={[
      'הגרלת שמות אונליין פותרת את שתי הבעיות של הגרלה בפתקים: אף אחד לא שולף את השם של עצמו, ואין צורך לאסוף את כולם באותו חדר. כל משתתף מקבל קישור פרטי, ורק הוא רואה את התוצאה.',
      'כדאי לקבוע מראש תקציב (למשל עד 20–30 ש״ח), תאריך לגילוי ומה עושים עם מי שחסר באותו יום. בכיתות צעירות עדיף שהמחוות יהיו בלי כסף בכלל: פתק, ציור, שיר או עזרה קטנה — זה החלק שהילדים זוכרים.',
      'אפשר להשתמש באותו כלי גם בצהרון, בתנועת הנוער, בחוג, בצוות העבודה או במשפחה המורחבת לפני החג. הדף נשמר כארבעה חודשים, ואז נמחק אוטומטית.',
    ]} faq={FAQ} related={[{ label: 'גלגל שמות להגרלה', href: '/tools/random-picker' }, { label: 'מחלק קבוצות', href: '/tools/team-generator' }, { label: 'משחקי היכרות לכיתה', href: '/games/icebreaker' }, { label: 'כל הכלים לכיתה', href: '/classroom' }]} />
  </section>
}

export default function SecretFriend() {
  const { code: pathCode } = useParams()
  const [code, setCode] = useState(pathCode || null)
  // Personal link (#p=) wins; then organizer rights (#k= or this device); then a personal link opened here before.
  const [init] = useState(() => {
    if (!pathCode) return {}
    const p = tokenFromHash(KIND, pathCode, 'p')
    if (p) { groupMemory.set(participantKey(pathCode), p); return { p } }
    const k = tokenFromHash(KIND, pathCode) || groupMemory.ownerToken(KIND, pathCode)
    return k ? { k } : { p: groupMemory.get(participantKey(pathCode), null) }
  })
  const ptoken = init.p || null
  const [token, setToken] = useState(init.k || null)
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [printing, setPrinting] = useState(null)
  const [deleted, setDeleted] = useState(false)
  const [toast, show] = useToast()

  const load = useCallback(() => {
    if (!code || !token || ptoken) return
    secretDb.organizer(code, token).then(setD).catch(e => setError(e.code || 'network'))
  }, [code, token, ptoken])
  useEffect(() => { if (!d) load() }, [load, d])
  useEffect(() => {
    if (!d) return
    const t = setInterval(() => { if (document.visibilityState === 'visible') load() }, 20000)
    return () => clearInterval(t)
  }, [d, load])

  let body
  if (deleted) body = <div className="py-10 text-center"><p className="text-xl font-bold">🗑️ ההגרלה נמחקה</p><a href="/secret-friend" className={`${btn} mt-6`}>הגרלה חדשה</a></div>
  else if (code && ptoken) body = <ParticipantView code={code} ptoken={ptoken} organizerHere={Boolean(groupMemory.ownerToken(KIND, code))} show={show} />
  else if (code && !token) body = <div className="mx-auto max-w-md py-10 text-center"><p className="text-5xl">🤫</p><p className="mt-3 text-xl font-bold">כדי לגלות את מי הגרלתם צריך את הקישור האישי שקיבלתם בהודעה פרטית.</p><p className="mt-2 text-slate-600">לא קיבלתם? בקשו מהמארגנים לשלוח אותו שוב.</p><Link to="/secret-friend" className={`${btn} mt-6`}>יצירת הגרלה משלכם</Link></div>
  else if (code && error) body = <ErrorPanel code={error} home="/secret-friend" homeLabel="יצירת הגרלה חדשה" />
  else if (code && !d) body = <p className="py-16 text-center text-lg">טוענים…</p>
  else if (code) body = <OrganizerView d={d} setD={setD} token={token} show={show} onDeleted={() => setDeleted(true)} />
  else body = <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <section className={card}><CreateForm show={show} onPrint={setPrinting} onCreated={(row, t) => {
      window.history.replaceState(window.history.state, '', `/g/${row.code}`)
      setToken(t); setD(row); setCode(row.code); show('✓ ההגרלה בוצעה! עכשיו שולחים לכל אחד את הקישור שלו'); window.scrollTo({ top: 0, behavior: 'smooth' })
    }} /></section>
    <aside className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="font-display text-2xl font-bold">איך זה עובד?</h2>
      <ol className="mt-3 list-decimal space-y-2 pr-5"><li>כותבים את שמות המשתתפים.</li><li>מסמנים מי לא יגרילו זה את זה (לא חובה).</li><li>מגרילים — ומקבלים קישור אישי לכל אחד.</li><li>שולחים לכל אחד בפרטי. רק הוא רואה את מי הגריל.</li></ol>
      <p className="mt-4 text-sm text-slate-600">אף אחד לא מגריל את עצמו. בחינם, בלי הרשמה, שמות פרטיים בלבד.</p>
      {groupMemory.owned(KIND).length > 0 && <p className="mt-4 text-sm"><b>ההגרלות שלי:</b> {groupMemory.owned(KIND).slice(0, 5).map((l, n) => <span key={l.code}>{n > 0 && ' · '}<a className="underline" href={`/g/${l.code}`}>{l.title || l.code}</a></span>)}</p>}
    </aside>
  </div>

  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
    <SEO title="גמד וענק — הגרלת שמות אונליין לכיתה, למשלוח מנות ולחנוכה" description="הגרלת גמד וענק אונליין בחינם: כותבים שמות, מגרילים, וכל משתתף מקבל קישור אישי בוואטסאפ שבו רק הוא רואה את מי הגריל. גם למשלוח מנות לפורים ולמתנות בחנוכה, עם פתקים להדפסה." path="/secret-friend" noindex={Boolean(pathCode)} structuredData={code ? null : faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'גמד וענק', href: code ? '/secret-friend' : undefined }]} />
    {!code && <header className="mb-7 text-center">
      <h1 className="text-4xl sm:text-5xl">🧙 הגרלת גמד וענק אונליין</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">גמד וענק בלי פתקים ובלי טעויות: כותבים את שמות המשתתפים, מגרילים, וכל אחד מקבל קישור אישי בוואטסאפ שבו רק הוא רואה את מי הגריל. מתאים גם להגרלת שמות למשלוח מנות בפורים ולמתנות בחנוכה.</p>
    </header>}
    {body}
    {!code && <SecretGuide />}
    {printing && <Slips data={printing} onClose={() => setPrinting(null)} />}
    {toast}
  </div>
}

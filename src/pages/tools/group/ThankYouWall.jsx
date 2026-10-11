import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import PrintPreview from '../../../components/ui/PrintPreview'
import { wallDb, groupMemory, groupErrorText, newToken, tokenFromHash, shareUrl, organizerUrl } from '../../../utils/groupDb'
import { LIMITS, cleanName, cleanText, validateWallNote, OCCASIONS, STICKERS, bookletPages } from '../../../utils/groupTools'
import './group.css'
import { card, input, btn, btnMain, btnWa, useToast, copyText, openWhatsApp, ConfirmDialog, ErrorPanel, Field, OrganizerTools } from './GroupUi'

const KIND = 'wall'
const POLL_MS = 20000

// Original blessing examples, by occasion (also shown on /thank-you-wall as inspiration).
const EXAMPLES = {
  'end-of-year': [
    'גננת יקרה, תודה על כל בוקר שבו קיבלת אותנו בחיוך. בזכותך הגן היה בית שני, ואנחנו יוצאים ממנו עם המון אהבה וזיכרונות טובים.',
    'תודה על הסבלנות האינסופית, על השירים, על הפלסטלינה שנדבקה לכל מקום ועל הלב הגדול. היה לנו כבוד להיות חלק מהגן שלך.',
    'למורה שלנו: תודה שראית כל ילד וילדה, גם בימים הקשים. לימדת אותנו לא רק לקרוא ולכתוב, אלא גם להאמין בעצמנו.',
    'השנה עברה מהר מדי! תודה על ההשקעה, על הפעילויות המיוחדות ועל ההודעות המרגיעות בקבוצה. מאחלים לך חופש שקט ומפנק.',
    'תודה שהפכת את הגן למקום שרוצים לחזור אליו כל בוקר. לקחנו מכאן חברים, ביטחון והרבה שמחה.',
    'בזכותך הצעד הגדול לכיתה א׳ מרגיש פחות מפחיד. תודה על הכנה מלאה באהבה — עוד נבוא לבקר!',
    'תודה לך ולכל הצוות על שנה של צמיחה. ראינו איך הילד שלנו פורח, ואנחנו יודעים שיש לך חלק גדול בזה.',
    'מורה יקר, תודה על ההומור, על הסבלנות ועל זה שתמיד היה לך זמן לעוד שאלה. שיהיה לך קיץ נהדר!',
  ],
  hanukkah: [
    'חג אורים שמח! תודה שאת מוסיפה אור לגן בכל יום, לא רק בחנוכה.',
    'שיהיו לך ימים מתוקים כמו סופגנייה ומוארים כמו חנוכייה בנר השמיני. חג שמח!',
    'תודה על הסבלנות, על היצירות ועל השירים. מאחלים לך חג מלא אור, משפחה ושמחה.',
  ],
  'rosh-hashana': [
    'שנה טובה ומתוקה! תודה על ההתחלה החמה של השנה — מחכים לשנה מלאה בצחוק, ביצירה ובלמידה.',
    'מאחלים לך שנה של בריאות, נחת וסבלנות בלי סוף (את תצטרכי אותה 😉). שנה טובה!',
    'כמו תפוח בדבש — שתהיה לך שנה מתוקה, רגועה ומלאה ברגעים קטנים של אושר.',
  ],
  birthday: [
    'יום הולדת שמח לגננת הכי אהובה! מאחלים לך שנה של שמחה, בריאות והרבה רגעים מתוקים כמו אלה שאת נותנת לילדים.',
    'מזל טוב! שתמיד יהיו סביבך אנשים שאוהבים אותך כמו שהילדים אוהבים אותך.',
    'יום הולדת שמח! תודה שאת יודעת להפוך כל יום רגיל לחגיגה קטנה. הגיע הזמן שגם יחגגו לך.',
  ],
  other: [
    'סתם ככה, באמצע השבוע: תודה. רואים כמה את משקיעה, וזה עושה את כל ההבדל.',
    'תודה שאת שם בשביל הילדים — בימים השמחים וגם בימים פחות. מעריכים אותך מאוד.',
  ],
}
const GIFT_IDEAS = [
  ['🌱', 'עציץ עם פתק', 'צמח קטן ופתק „תודה שעזרת לנו לצמוח”. זול, יפה, ונשאר הרבה אחרי סוף השנה.'],
  ['📖', 'ספר עם הקדשות', 'ספר אחד מכל הגן או הכיתה, וכל ילד כותב או מצייר הקדשה קטנה בעמודים הראשונים.'],
  ['🎨', 'טביעות ידיים', 'סינר, תיק בד או בד מתוח על מסגרת עם טביעת יד וחתימה של כל ילד.'],
  ['🎁', 'שובר מתנה כיתתי', 'שובר לחנות ספרים, לבית קפה או לטיפוח. מתנה שימושית שאוספים עבורה יחד.'],
  ['🎧', 'הקלטה של הילדים', 'סרטון קצר או הקלטה שבה כל ילד אומר משפט תודה. מרגש במיוחד בסוף גן.'],
  ['💌', 'חוברת הברכות מהקיר', 'הקיר הזה מדפיס חוברת: עמוד שער וכרטיס צבעוני לכל ברכה. מצרפים ציור מכל ילד וכורכים.'],
]

function Note({ n, onEdit, onRemove }) {
  return <li className="gt-note">
    {n.sticker && <span className="text-3xl leading-none" aria-hidden="true">{n.sticker}</span>}
    <p className="mt-1 whitespace-pre-line text-[17px] leading-relaxed">{n.message}</p>
    <div className="mt-2 flex items-center gap-2">
      <b className="flex-1 text-left">— {n.child}</b>
      {onEdit && <button onClick={onEdit} className="text-sm underline">עריכה</button>}
      {onRemove && <button onClick={onRemove} className="text-sm text-rose-700 underline" aria-label={`מחיקת הברכה של ${n.child}`}>מחיקה</button>}
    </div>
  </li>
}

function NoteForm({ board, editing, onSaved, onCancel, show }) {
  const [child, setChild] = useState(editing?.child || groupMemory.get('wall-child', ''))
  const [message, setMessage] = useState(editing?.message || '')
  const [sticker, setSticker] = useState(editing?.sticker || '🌸')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const idea = useRef(0)
  const ideas = EXAMPLES[board.occasion] || EXAMPLES.other
  const submit = async e => {
    e.preventDefault()
    const v = validateWallNote({ child, message })
    if (!v.ok) { setErr(v.error); return }
    setErr(''); setBusy(true)
    try {
      const payload = { child: cleanName(child), message: cleanText(message, LIMITS.message, true), sticker }
      const dev = groupMemory.deviceToken(KIND)
      const saved = editing ? await wallDb.edit(board.code, dev, editing.id, payload) : await wallDb.add(board.code, dev, payload)
      groupMemory.set('wall-child', payload.child)
      onSaved(saved, Boolean(editing)); if (!editing) setMessage('')
    } catch (e2) { show(groupErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="space-y-3">
    <Field label="שם הילד/ה"><input className={input} value={child} maxLength={LIMITS.name} onChange={e => setChild(e.target.value)} placeholder="שם פרטי, למשל: יואב" /></Field>
    <Field label="הברכה">
      <textarea className={`${input} min-h-[120px]`} value={message} maxLength={LIMITS.message} onChange={e => setMessage(e.target.value)} placeholder={`ברכה קצרה ל${board.teacher}…`} />
      <span className="mt-1 flex items-center justify-between text-sm font-normal text-slate-500">
        <button type="button" onClick={() => { setMessage(ideas[idea.current % ideas.length]); idea.current++ }} className="font-bold text-slate-700 underline">💡 רעיון לברכה</button>
        <span>{message.length}/{LIMITS.message}</span>
      </span>
    </Field>
    <fieldset><legend className="font-bold">מדבקה</legend>
      <div className="mt-1 flex flex-wrap gap-1.5">{STICKERS.map(s => <button type="button" key={s} onClick={() => setSticker(s)} aria-pressed={sticker === s} aria-label={`מדבקה ${s}`}
        className={`grid h-11 w-11 place-items-center rounded-xl border-2 text-2xl ${sticker === s ? 'border-slate-900 bg-[var(--postit)]' : 'border-slate-200 bg-white'}`}>{s}</button>)}</div>
    </fieldset>
    {err && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 font-bold text-rose-700">{err}</p>}
    <div className="flex gap-2">
      <button disabled={busy} className={`${btnMain} flex-1`}>{busy ? 'שומרים…' : editing ? 'שמירת השינוי' : '💌 הוספת הברכה לקיר'}</button>
      {editing && <button type="button" onClick={onCancel} className="px-2 text-slate-500 underline">ביטול</button>}
    </div>
    <p className="text-sm text-slate-500">שם פרטי בלבד, בלי תמונות. אפשר לערוך או למחוק את הברכה מהמכשיר הזה.</p>
  </form>
}

function Booklet({ board, notes, onClose }) {
  const occ = OCCASIONS[board.occasion] || OCCASIONS.other
  const pages = bookletPages(notes)
  return <PrintPreview title={`חוברת ברכות ל${board.teacher}`} onClose={onClose}>
    <div className="buga-a4 gt-book gt-cover" dir="rtl">
      <div className="gt-cover-emoji" aria-hidden="true">{occ.emoji}</div>
      <h2>{occ.title}, {board.teacher}!</h2>
      {board.place && <p>{board.place}</p>}
      <p>{notes.length} ברכות באהבה מהילדים ומההורים 💖</p>
    </div>
    {pages.map((page, pi) => <div key={pi} className="buga-a4 gt-book" dir="rtl">
      <div className="gt-cards">{page.map((n, i) => <div key={n.id} className={`gt-card gt-c${(pi * 6 + i) % 6}${n.message.length > 220 ? ' wide' : ''}`}>
        {n.sticker && <span className="gt-st">{n.sticker}</span>}<p>{n.message}</p><b>— {n.child}</b>
      </div>)}</div>
      {pi === pages.length - 1 && <div className="gt-credit">נאסף בקיר הברכות של עוגה בוגה · ugabuga.co.il</div>}
    </div>)}
  </PrintPreview>
}

function WallView({ code, token, show, onDeleted }) {
  const [board, setBoard] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [printing, setPrinting] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [owner, setOwner] = useState(Boolean(token))
  const formRef = useRef()
  const load = useCallback(async () => {
    try {
      let row = null
      if (owner) { try { row = await wallDb.owner(code, token) } catch (e) { if (e.code !== 'not_owner') throw e; setOwner(false) } }
      if (!row) row = await wallDb.get(code, groupMemory.deviceToken(KIND))
      if (row && owner) {
        // The owner view doesn't mark "mine"; fetch it from the parent view so the organizer can edit their own notes too.
        const mine = await wallDb.get(code, groupMemory.deviceToken(KIND)).then(r => new Set(r.notes.filter(n => n.mine).map(n => n.id))).catch(() => new Set())
        row = { ...row, notes: row.notes.map(n => ({ ...n, mine: mine.has(n.id) })) }
      }
      setBoard(row); setError('')
    } catch (e) { setError(e.code || 'network') }
  }, [code, token, owner])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible' && !editing) load() }, POLL_MS)
    return () => clearInterval(t)
  }, [load, editing])
  if (error) return <ErrorPanel code={error} home="/thank-you-wall" homeLabel="יצירת קיר ברכות חדש" />
  if (!board) return <p className="py-16 text-center text-lg">טוענים…</p>
  const occ = OCCASIONS[board.occasion] || OCCASIONS.other
  const link = shareUrl(KIND, code)
  const notes = board.notes || []
  const myCount = notes.filter(n => n.mine).length
  const saved = (n, wasEdit) => {
    setBoard(b => ({ ...b, count: wasEdit ? b.count : b.count + 1, notes: wasEdit ? b.notes.map(x => x.id === n.id ? { ...x, ...n } : x) : [...b.notes, n] }))
    setEditing(null); show(wasEdit ? '✓ הברכה עודכנה' : '✓ הברכה נוספה לקיר. תודה!')
  }
  const remove = async n => {
    setConfirm(null)
    try {
      if (n.mine) await wallDb.removeMine(code, groupMemory.deviceToken(KIND), n.id); else await wallDb.ownerRemove(code, token, n.id)
      setBoard(b => ({ ...b, count: b.count - 1, notes: b.notes.filter(x => x.id !== n.id) }))
    } catch (e) { show(groupErrorText(e.code), 'err') }
  }
  const toggleHidden = async () => {
    try { const row = await wallDb.update(code, token, { hide_notes: !board.hide_notes }); setBoard(b => ({ ...b, ...row })) } catch (e) { show(groupErrorText(e.code), 'err') }
  }
  const invite = `💌 כותבים ברכה ל${board.teacher}${board.place ? ` (${board.place})` : ''} ל${occ.label}!\nכל הורה מוסיף ברכה קצרה בשם הילד/ה — בלחיצה, בלי הרשמה 👇\n${link}\nבסוף נדפיס מכל הברכות חוברת מתנה 🎁`
  return <div className="space-y-6">
    <header className="text-center">
      <p className="text-6xl" aria-hidden="true">{occ.emoji}</p>
      <h1 className="mt-2 text-3xl font-black sm:text-5xl">{occ.title}, {board.teacher}!</h1>
      {board.place && <p className="mt-1 text-xl text-[var(--muted-foreground)]">{board.place}</p>}
      <p className="mt-2 font-bold">💌 {board.count} ברכות על הקיר</p>
    </header>

    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section>
        {board.hide_notes && !owner && <p className="mb-4 rounded-2xl bg-sky-50 px-4 py-3 text-center">🎁 זה קיר הפתעה: הברכות של ההורים האחרים מוסתרות עד שהחוברת תודפס. אתם רואים רק את מה שכתבתם.</p>}
        {notes.length === 0
          ? <p className="rounded-2xl border-2 border-dashed border-slate-300 py-10 text-center text-lg text-slate-500">עוד אין ברכות על הקיר. כתבו את הראשונה! 💌</p>
          : <ul className="gt-wall">{notes.map(n => <Note key={n.id} n={n}
            onEdit={n.mine ? () => { setEditing(n); formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } : null}
            onRemove={n.mine || owner ? () => setConfirm(n) : null} />)}</ul>}
      </section>
      <aside className="space-y-4">
        <section className={card} ref={formRef}>
          <h2 className="mb-3 text-2xl font-bold">{editing ? 'עריכת הברכה' : myCount ? 'עוד ברכה?' : 'כתבו ברכה'}</h2>
          <NoteForm key={editing?.id || 'new'} board={board} editing={editing} onSaved={saved} onCancel={() => setEditing(null)} show={show} />
        </section>
        {owner && <section className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
          <h2 className="font-display text-2xl font-bold">למארגנים</h2>
          <button onClick={() => openWhatsApp(invite)} className={`${btnWa} mt-3 w-full`}>📱 שליחה לקבוצת ההורים</button>
          <button onClick={() => copyText(link, show, 'הקישור הועתק ✓')} className={`${btn} mt-2 w-full`}>🔗 העתקת קישור</button>
          <button onClick={() => setPrinting(true)} disabled={!notes.length} className={`${btn} mt-2 w-full`}>📕 חוברת להדפסה / PDF</button>
          <label className="mt-4 flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 h-5 w-5" checked={board.hide_notes} onChange={toggleHidden} />
            <span><b>קיר הפתעה</b> — כל הורה רואה רק את הברכה שלו (מומלץ אם הגננת בקבוצה).</span></label>
          <OrganizerTools what="הקיר" onCopyOrganizer={() => copyText(organizerUrl(KIND, code, token), show, 'קישור הניהול הועתק ✓ שמרו אותו לעצמכם בלבד')} onDelete={() => setConfirm('wall')} />
        </section>}
        {!owner && <p className="text-center text-sm text-slate-600">רוצים קיר כזה לגננת או למורה שלכם? <Link to="/thank-you-wall" className="font-bold underline">פתחו קיר ברכות</Link></p>}
      </aside>
    </div>
    {confirm === 'wall' && <ConfirmDialog title="למחוק את הקיר?" text="כל הברכות יימחקו, והקישור יפסיק לעבוד. כדאי להוריד קודם את החוברת כ-PDF." yes="כן, למחוק" onClose={() => setConfirm(null)}
      onYes={async () => { setConfirm(null); try { await wallDb.remove(code, token); groupMemory.forgetOwned(KIND, code); onDeleted() } catch (e) { show(groupErrorText(e.code), 'err') } }} />}
    {confirm && confirm !== 'wall' && <ConfirmDialog title={`למחוק את הברכה של ${confirm.child}?`} text="הברכה תוסר מהקיר ומהחוברת." yes="מחיקה" onClose={() => setConfirm(null)} onYes={() => remove(confirm)} />}
    {printing && <Booklet board={board} notes={notes} onClose={() => setPrinting(false)} />}
  </div>
}

function CreateForm({ show, onCreated }) {
  const [teacher, setTeacher] = useState('')
  const [place, setPlace] = useState('')
  const [occasion, setOccasion] = useState('end-of-year')
  const [hide, setHide] = useState(false)
  const [busy, setBusy] = useState(false)
  const submit = async e => {
    e.preventDefault()
    if (!cleanName(teacher, LIMITS.teacher)) { show('כתבו את שם הגננת או המורה', 'err'); return }
    setBusy(true)
    try {
      const t = newToken()
      const row = await wallDb.create(t, { teacher: cleanName(teacher, LIMITS.teacher), place: cleanName(place, 60), occasion, hide_notes: hide })
      groupMemory.rememberOwned(KIND, row.code, t, `${row.teacher}${row.place ? ` · ${row.place}` : ''}`)
      onCreated(row, t)
    } catch (e2) { show(groupErrorText(e2.code), 'err') } finally { setBusy(false) }
  }
  return <form onSubmit={submit} className="space-y-4">
    <Field label="למי הקיר?"><input className={input} value={teacher} maxLength={LIMITS.teacher} onChange={e => setTeacher(e.target.value)} placeholder="למשל: הגננת מירב / המורה דני" /></Field>
    <Field label="גן או כיתה" hint="(לא חובה)"><input className={input} value={place} maxLength={60} onChange={e => setPlace(e.target.value)} placeholder="למשל: גן חצב / כיתה ב׳3" /></Field>
    <fieldset><legend className="font-bold">לכבוד</legend>
      <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">{Object.entries(OCCASIONS).map(([k, o]) => <button type="button" key={k} onClick={() => setOccasion(k)} aria-pressed={occasion === k}
        className={`min-h-[48px] rounded-xl border-2 px-2 font-bold ${occasion === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>{o.emoji} {o.label}</button>)}</div>
    </fieldset>
    <label className="flex items-start gap-2"><input type="checkbox" className="mt-1 h-5 w-5" checked={hide} onChange={e => setHide(e.target.checked)} />
      <span><b>קיר הפתעה</b> — כל הורה רואה רק את הברכה שלו. מומלץ אם הגננת או המורה נמצאים בקבוצת ההורים.</span></label>
    <button disabled={busy} className={`${btnMain} w-full`}>{busy ? 'רגע…' : '💌 פתיחת קיר ברכות'}</button>
  </form>
}

const FAQ = [
  { q: 'איך עובד קיר הברכות?', a: 'פותחים קיר עם שם הגננת או המורה, ושולחים קישור לקבוצת ההורים. כל הורה כותב ברכה קצרה בשם הילד, בלי הרשמה. בסוף מדפיסים חוברת צבעונית — עמוד שער וכרטיס לכל ברכה — או שומרים אותה כ-PDF ושולחים.' },
  { q: 'מה כותבים בברכה לגננת לסוף שנה?', a: 'משפט או שניים על משהו אמיתי: רגע שהילד זוכר, דבר שהגננת לימדה, או איך הגן הרגיש בשבילכם. ברכה אישית קצרה מרגשת יותר מנוסח ארוך וכללי. בדף יש דוגמאות לברכות, ובטופס עצמו כפתור „רעיון לברכה”.' },
  { q: 'הגננת נמצאת בקבוצת ההורים. היא תראה את הברכות לפני הזמן?', a: 'סמנו „קיר הפתעה”: כל הורה יראה רק את הברכה שכתב, ורק מי שפתח את הקיר יראה את כולן וידפיס את החוברת.' },
  { q: 'אפשר להעלות תמונות?', a: 'לא, ובכוונה: כדי לשמור על פרטיות הילדים הקיר מקבל רק שם פרטי, טקסט ומדבקה. ציורים של הילדים אפשר להוסיף לחוברת המודפסת בעבודת יד.' },
  { q: 'כמה זמן הקיר נשמר?', a: 'כחצי שנה, ואז הוא נמחק אוטומטית. מי שפתח את הקיר יכול למחוק אותו בכל רגע — כדאי להוריד קודם את החוברת כ-PDF.' },
]
function WallGuide({ show }) {
  const [occ, setOcc] = useState('end-of-year')
  return <section className="mx-auto mt-14 max-w-4xl">
    <h2 className="mb-2 text-3xl font-bold">דוגמאות לברכה לגננת לסוף שנה (ולמורה)</h2>
    <p className="mb-4 text-lg leading-relaxed">ברכות מקוריות שאפשר להעתיק, לקצר או להוסיף להן משפט אישי. הכי מרגש: פרט קטן ואמיתי שרק אתם יודעים.</p>
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="סוג הברכה">{Object.entries(EXAMPLES).map(([k]) => <button key={k} onClick={() => setOcc(k)} aria-pressed={occ === k}
      className={`min-h-[44px] rounded-full border-2 px-4 font-bold ${occ === k ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white'}`}>{OCCASIONS[k].emoji} {OCCASIONS[k].label}</button>)}</div>
    <ul className="mb-10 grid gap-3 sm:grid-cols-2">{EXAMPLES[occ].map(t => <li key={t} className="wobbly-sm flex flex-col border-2 border-[var(--border)] bg-white p-4">
      <p className="flex-1 leading-relaxed">{t}</p>
      <button onClick={() => copyText(t, show, 'הברכה הועתקה ✓')} className="mt-2 self-start text-sm font-bold underline">📋 העתקה</button>
    </li>)}</ul>

    <h2 className="mb-2 text-3xl font-bold">רעיונות למתנה לגננת ולמורה</h2>
    <p className="mb-4 text-lg leading-relaxed">המתנה שנשארת היא בדרך כלל זו שיש בה משהו מהילדים עצמם. כמה רעיונות שעובדים בכל תקציב:</p>
    <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{GIFT_IDEAS.map(([e, t, d]) => <div key={t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4">
      <span className="text-3xl" aria-hidden="true">{e}</span><h3 className="mt-1 text-lg font-bold">{t}</h3><p className="text-[var(--foreground)]/80">{d}</p></div>)}</div>
    <p className="mb-10 text-lg">רוצים עוד? יש לנו מדריך מלא עם תקציבים ומחשבון חלוקה לוועד: <Link to="/gifts/gananet" className="font-bold underline">מתנה לגננת ולסייעת</Link> ו<Link to="/gifts/teacher-end-of-year" className="font-bold underline">מתנה למורה לסוף השנה</Link>.</p>

    <SeoBody paragraphs={[
      'קיר ברכות הוא הדרך הכי פשוטה לאסוף ברכה לגננת לסוף שנה מכל ההורים, בלי לרדוף אחרי פתקים ובלי שרשור ארוך בוואטסאפ. כל הורה כותב בזמן שנוח לו, והמארגנים מקבלים בסוף חוברת מסודרת ויפה, מוכנה להדפסה.',
      'הקיר מתאים לגן, לכיתה, לצהרון ולחוג, וגם לחנוכה, לראש השנה וליום הולדת של הגננת או המורה. מדפיסים את החוברת על נייר עבה, מוסיפים ציור מכל ילד וכורכים בסרט — וזו כבר מתנה בפני עצמה, גם לצד מתנה כיתתית.',
    ]} faq={FAQ} related={[{ label: 'ברכה ליום הולדת לגננת', href: '/greetings/kindergarten-teacher' }, { label: 'מסיבת סיום גן', href: '/ideas/kindergarten-graduation' }, { label: 'מסיבת סוף שנה לכיתה', href: '/ideas/end-of-year-party' }, { label: 'כל הכלים לכיתה', href: '/classroom' }]} />
  </section>
}

export default function ThankYouWall() {
  const { code: pathCode } = useParams()
  const [code, setCode] = useState(pathCode || null)
  const [token, setToken] = useState(() => pathCode ? tokenFromHash(KIND, pathCode) || groupMemory.ownerToken(KIND, pathCode) : null)
  const [deleted, setDeleted] = useState(false)
  const [toast, show] = useToast()
  const mine = useMemo(() => groupMemory.owned(KIND).slice(0, 5), [])

  let body
  if (deleted) body = <div className="py-10 text-center"><p className="text-xl font-bold">🗑️ הקיר נמחק</p><a href="/thank-you-wall" className={`${btn} mt-6`}>פתיחת קיר חדש</a></div>
  else if (code) body = <WallView key={code} code={code} token={token} show={show} onDeleted={() => setDeleted(true)} />
  else body = <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <section className={card}><h2 className="mb-4 text-2xl font-bold">פותחים קיר ברכות</h2><CreateForm show={show} onCreated={(row, t) => {
      window.history.replaceState(window.history.state, '', `/w/${row.code}`)
      setToken(t); setCode(row.code); show('✓ הקיר מוכן! שלחו את הקישור לקבוצת ההורים'); window.scrollTo({ top: 0, behavior: 'smooth' })
    }} /></section>
    <aside className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="font-display text-2xl font-bold">איך זה עובד?</h2>
      <ol className="mt-3 list-decimal space-y-2 pr-5"><li>פותחים קיר עם שם הגננת או המורה.</li><li>שולחים קישור לקבוצת ההורים.</li><li>כל הורה מוסיף ברכה קצרה בשם הילד.</li><li>מדפיסים חוברת צבעונית או שומרים PDF.</li></ol>
      <p className="mt-4 text-sm text-slate-600">בחינם, בלי הרשמה ובלי תמונות — רק שם פרטי וברכה.</p>
      {mine.length > 0 && <p className="mt-4 text-sm"><b>הקירות שלי:</b> {mine.map((l, n) => <span key={l.code}>{n > 0 && ' · '}<a className="underline" href={`/w/${l.code}`}>{l.title || l.code}</a></span>)}</p>}
    </aside>
  </div>

  return <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
    <SEO title="קיר ברכות לגננת ולמורה — ברכה לגננת לסוף שנה מכל ההורים" description="ברכה לגננת לסוף שנה מכל הגן: פותחים קיר ברכות, שולחים קישור לקבוצת ההורים, וכל הורה מוסיף ברכה בשם הילד. בסוף מדפיסים חוברת מתנה. כולל דוגמאות לברכות ורעיונות למתנה לגננת." path="/thank-you-wall" noindex={Boolean(pathCode)} structuredData={code ? null : faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה ולגן', href: '/classroom' }, { label: 'קיר ברכות לגננת', href: code ? '/thank-you-wall' : undefined }]} />
    {!code && <header className="mb-7 text-center">
      <h1 className="text-4xl sm:text-5xl">💌 קיר ברכות לגננת ולמורה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">ברכה לגננת לסוף שנה מכל ההורים, במקום אחד: פותחים קיר, שולחים קישור לקבוצה, וכל הורה מוסיף ברכה קצרה בשם הילד. בסוף מקבלים חוברת צבעונית להדפסה — מתנה מרגשת שכולם השתתפו בה.</p>
    </header>}
    {body}
    {!code && <WallGuide show={show} />}
    {toast}
  </div>
}

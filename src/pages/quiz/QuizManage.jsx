import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import QuizEditor, { toPayload, MathText } from '../../components/quiz/QuizEditor'
import { quizDb, quizMemory, quizErrorText, quizLink, manageLink } from '../../utils/quizDb'

const LETTERS = ['א', 'ב', 'ג', 'ד']
const pct = (a, b) => b ? Math.round(a / b * 100) : 0
const fmtTime = iso => new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })

function useQr(text) {
  const [svg, setSvg] = useState('')
  useEffect(() => { import('qrcode').then(({ default: Q }) => Q.toString(text, { type: 'svg', margin: 1 })).then(setSvg).catch(() => {}) }, [text])
  return svg
}

// Printable version of the same quiz (paper for kids without a device), optionally with an answer key.
export function QuizSheet({ quiz, answers = false }) {
  return <article className="buga-flow" dir={quiz.settings.dir}>
    <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, margin: 0 }}>{quiz.title}{answers ? ' — דף תשובות' : ''}</h2>
    {!answers && <p style={{ textAlign: 'center', margin: '6px 0 14px' }} dir="rtl">שם: ______________ &nbsp;&nbsp; כיתה: ______ &nbsp;&nbsp; תאריך: ______________</p>}
    <ol style={{ paddingInlineStart: 22, margin: 0 }}>{quiz.questions.map((q, i) => <li key={q.id} style={{ breakInside: 'avoid', marginBottom: 14, fontSize: 17 }}>
      <div style={{ fontWeight: 700, whiteSpace: 'pre-line' }}><MathText>{q.q}</MathText></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '4px 18px', marginTop: 6 }}>{q.options.map((o, m) => <span key={m} style={{ fontWeight: answers && m === q.correct ? 900 : 400 }}>
        {answers && m === q.correct ? '●' : '◯'} {LETTERS[m]}. <MathText>{o}</MathText></span>)}</div>
    </li>)}</ol>
  </article>
}

export default function QuizManage() {
  const { code } = useParams()
  const nav = useNavigate()
  const [token] = useState(() => {
    const fromHash = /[#&]k=([\w-]+)/.exec(location.hash)?.[1]
    if (fromHash) { quizMemory.remember(code, fromHash, 'מבחן'); history.replaceState(null, '', location.pathname) }
    return fromHash || quizMemory.token(code)
  })
  const [data, setData] = useState(null), [err, setErr] = useState('')
  const [editing, setEditing] = useState(false), [busy, setBusy] = useState(false)
  const [projector, setProjector] = useState(false), [print, setPrint] = useState(null)
  const [confirm, setConfirm] = useState(null), [copied, setCopied] = useState('')
  const link = quizLink(code), qr = useQr(link)

  const load = useCallback(() => token && quizDb.results(code, token).then(d => { setData(d); setErr(''); quizMemory.remember(code, token, d.title) }).catch(e => setErr(quizErrorText(e.code))), [code, token])
  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(() => { if (document.visibilityState === 'visible' && !editing) load() }, 6000); return () => clearInterval(t) }, [load, editing])

  const subs = useMemo(() => data?.submissions || [], [data])
  const perQ = useMemo(() => (data?.questions || []).map(q => {
    const counts = q.options.map((_, m) => subs.filter(s => s.answers[q.id] === m).length)
    const right = counts[q.correct] || 0
    const wrongIdx = counts.map((c, m) => [c, m]).filter(([, m]) => m !== q.correct).sort((a, b) => b[0] - a[0])[0]
    return { q, right, pct: pct(right, subs.length), commonWrong: wrongIdx && wrongIdx[0] > 0 ? q.options[wrongIdx[1]] : null }
  }), [data, subs])
  const avg = subs.length ? Math.round(subs.reduce((a, s) => a + pct(s.score, s.total), 0) / subs.length) : 0
  const missing = (data?.names || []).filter(n => !subs.some(s => s.name.trim().toLowerCase() === n.trim().toLowerCase()))

  const copy = (text, what) => navigator.clipboard?.writeText(text).then(() => { setCopied(what); setTimeout(() => setCopied(''), 1800) }).catch(() => {})
  const act = async fn => { setBusy(true); try { await fn(); await load() } catch (e) { setErr(quizErrorText(e.code)) } finally { setBusy(false); setConfirm(null) } }
  const csv = () => {
    const qs = data.questions
    const rows = [['שם', 'ציון', 'מתוך', 'אחוז', 'שעה', ...qs.map((_, i) => `שאלה ${i + 1}`)],
      ...subs.map(s => [s.name, s.score, s.total, pct(s.score, s.total) + '%', fmtTime(s.at), ...qs.map(q => s.answers[q.id] == null ? '' : s.answers[q.id] === q.correct ? '✓' : '✗ ' + LETTERS[s.answers[q.id]])])]
    const text = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); a.download = `${data.title}.csv`; a.click()
  }

  if (!token) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><SEO title="ניהול מבחן" path={`/classroom/quiz/${code}`} noindex />
    <p className="text-lg font-bold">את התוצאות רואים רק מהמכשיר שיצר את המבחן, או דרך קישור הניהול.</p>
    <p className="mt-2 text-slate-600">תלמידים? <Link className="font-bold underline" to={`/q/${code}`}>לכניסה למבחן ←</Link></p></div>
  if (err && !data) return <div className="mx-auto max-w-xl px-4 py-16 text-center"><SEO title="ניהול מבחן" path={`/classroom/quiz/${code}`} noindex /><p className="rounded-2xl bg-amber-50 p-6 text-lg font-bold">{err}</p><Link to="/classroom/quiz" className="mt-4 inline-block font-bold underline">למבחנים שלי</Link></div>
  if (!data) return <p className="py-20 text-center text-lg">טוענים…</p>

  const open = data.status === 'open'
  const shareText = `📝 ${data.title}\nנכנסים ועונים מהטלפון או מהמחשב 👇\n${link}`

  return <div className="mx-auto max-w-4xl px-4 py-8">
    <SEO title={`ניהול: ${data.title}`} path={`/classroom/quiz/${code}`} noindex />
    <Breadcrumbs items={[{ label: 'כיתה', href: '/classroom' }, { label: 'מבחן אמריקאי', href: '/classroom/quiz' }, { label: data.title }]} />
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-black sm:text-4xl">{data.title}</h1>
        <p className="mt-1 text-slate-600">{data.questions.length} שאלות · <span className={`rounded-full px-2 py-0.5 text-sm font-bold ${open ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200'}`}>{open ? '🟢 פתוח להגשות' : '🔒 סגור'}</span></p></div>
      <button onClick={() => act(() => quizDb.setStatus(code, token, open ? 'closed' : 'open'))} disabled={busy} className={`rounded-2xl px-5 py-3 font-bold ${open ? 'border-2 border-slate-800 bg-white' : 'bg-emerald-600 text-white'}`}>{open ? '🔒 סגירת המבחן' : '🟢 פתיחה מחדש'}</button>
    </header>
    {err && <p role="alert" className="mb-4 rounded-2xl bg-rose-50 p-3 font-bold text-rose-800">{err}</p>}

    <section className="grid grid-cols-1 gap-4 rounded-3xl border-2 border-violet-200 bg-violet-50 p-4 sm:grid-cols-[minmax(0,1fr)_170px] sm:p-5">
      <div className="min-w-0">
        <h2 className="text-lg font-black">📲 שולחים לתלמידים</h2>
        <p className="mt-1 text-sm text-slate-600">קוד המבחן: <b className="text-2xl tracking-widest" dir="ltr">{code}</b></p>
        <p className="mt-1 truncate rounded-xl bg-white px-3 py-2 text-sm" dir="ltr">{link}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => copy(link, 'link')} className="rounded-xl bg-white px-3 py-2 font-bold shadow-sm">{copied === 'link' ? '✓ הועתק' : '📋 העתקת קישור'}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener" className="rounded-xl bg-[#25D366] px-3 py-2 font-bold text-white">💬 וואטסאפ</a>
          <button onClick={() => setProjector(true)} className="rounded-xl bg-[var(--ink)] px-3 py-2 font-bold text-white">📽️ הקרנה על הלוח</button>
        </div>
        <p className="mt-3 text-xs text-slate-600">💾 כדי לראות תוצאות גם ממכשיר אחר: <a href={`https://wa.me/?text=${encodeURIComponent(`קישור הניהול למבחן „${data.title}” (לא לשלוח לתלמידים):\n${manageLink(code, token)}`)}`} target="_blank" rel="noopener" className="font-bold underline">שלחו לעצמכם את קישור הניהול</a></p>
      </div>
      {qr && <div className="mx-auto w-40 rounded-2xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} aria-label="קוד סרוק למבחן" role="img" />}
    </section>

    <section className="mt-6 grid grid-cols-3 gap-3 text-center">
      <div className="rounded-2xl bg-white p-4 shadow-sm"><b className="block text-3xl">{subs.length}</b><span className="text-sm text-slate-600">הגישו{data.names.length ? ` מתוך ${data.names.length}` : ''}</span></div>
      <div className="rounded-2xl bg-white p-4 shadow-sm"><b className="block text-3xl">{subs.length ? avg + '%' : '—'}</b><span className="text-sm text-slate-600">ממוצע</span></div>
      <div className="rounded-2xl bg-white p-4 shadow-sm"><b className="block text-3xl">{subs.length ? Math.max(...subs.map(s => pct(s.score, s.total))) + '%' : '—'}</b><span className="text-sm text-slate-600">הגבוה ביותר</span></div>
    </section>
    {missing.length > 0 && subs.length > 0 && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm"><b>עוד לא הגישו:</b> {missing.join(', ')}</p>}

    <section className="mt-6">
      <h2 className="mb-2 text-xl font-black">👧 תלמידים</h2>
      {!subs.length ? <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-600">עוד אין הגשות. הדף מתעדכן לבד כל כמה שניות.</p>
        : <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white"><table className="w-full text-right">
          <thead className="bg-slate-50 text-sm"><tr><th className="p-3">שם</th><th className="p-3">ציון</th><th className="p-3">שעה</th><th className="p-3"><span className="sr-only">פעולות</span></th></tr></thead>
          <tbody>{[...subs].sort((a, b) => a.name.localeCompare(b.name, 'he')).map(s => <tr key={s.id} className="border-t border-slate-100">
            <td className="p-3 font-bold">{s.name}</td>
            <td className="p-3"><span className={`rounded-full px-2 py-0.5 font-bold ${pct(s.score, s.total) >= 80 ? 'bg-emerald-100 text-emerald-800' : pct(s.score, s.total) >= 55 ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'}`}>{pct(s.score, s.total)}%</span> <span className="text-sm text-slate-500">({s.score}/{s.total})</span></td>
            <td className="p-3 text-sm text-slate-500">{fmtTime(s.at)}</td>
            <td className="p-3 text-left"><button onClick={() => setConfirm({ kind: 'sub', id: s.id, name: s.name })} className="text-sm text-slate-400 hover:text-rose-700">מחיקה</button></td>
          </tr>)}</tbody></table></div>}
    </section>

    {subs.length > 0 && <section className="mt-6">
      <h2 className="mb-2 text-xl font-black">❓ איך הלך בכל שאלה</h2>
      <div className="space-y-2">{perQ.map(({ q, pct: p, commonWrong }, i) => <div key={q.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3">
        <div className="flex items-start justify-between gap-3"><span className="font-bold" dir={data.settings.dir}>{i + 1}. <MathText>{q.q}</MathText></span><b className={p >= 70 ? 'text-emerald-700' : p >= 45 ? 'text-amber-700' : 'text-rose-700'}>{p}%</b></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full ${p >= 70 ? 'bg-emerald-500' : p >= 45 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${p}%` }} /></div>
        {commonWrong && p < 70 && <p className="mt-1 text-sm text-slate-600">הטעות הנפוצה: „<MathText>{commonWrong}</MathText>”</p>}
      </div>)}</div>
    </section>}

    <section className="mt-8 flex flex-wrap gap-2">
      {subs.length > 0 && <button onClick={csv} className="rounded-2xl border-2 border-slate-800 bg-white px-4 py-3 font-bold">📥 הורדה לאקסל</button>}
      <button onClick={() => setPrint('quiz')} className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold">🖨️ גרסה להדפסה</button>
      <button onClick={() => setPrint('key')} className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold">🔑 דף תשובות</button>
      <button onClick={() => setEditing(e => !e)} className="rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 font-bold">✏️ עריכה</button>
      <button onClick={() => setConfirm({ kind: 'quiz' })} className="rounded-2xl px-4 py-3 font-bold text-rose-700">🗑️ מחיקת המבחן</button>
    </section>
    <p className="mt-3 text-xs text-slate-500">🔒 המבחן וכל התשובות נמחקים אוטומטית ב-{new Date(data.expires_at).toLocaleDateString('he-IL')}.</p>

    {editing && <section className="mt-6"><h2 className="mb-3 text-2xl font-black">✏️ עריכת המבחן</h2>
      <QuizEditor lockQuestions={subs.length > 0} busy={busy} submitLabel="💾 שמירת שינויים"
        initial={{ title: data.title, settings: data.settings, names: data.names, questions: data.questions.map(q => ({ ...q, options: [...q.options] })) }}
        onSubmit={quiz => act(async () => { await quizDb.update(code, token, { title: quiz.title, settings: quiz.settings, names: quiz.names.map(n => n.trim()).filter(Boolean), questions: subs.length ? null : toPayload(quiz) }); quizMemory.remember(code, token, quiz.title); setEditing(false) })} />
    </section>}

    {projector && createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-white p-6 text-center" dir="rtl" onClick={() => setProjector(false)} role="dialog" aria-label="הקרנת קוד המבחן">
      <div><h2 className="text-4xl font-black sm:text-6xl">{data.title}</h2>
        {qr && <div className="mx-auto mt-6 w-[min(60vh,80vw)]" dangerouslySetInnerHTML={{ __html: qr }} />}
        <p className="mt-4 text-2xl">או נכנסים ל-<b dir="ltr">{location.host}/q/{code}</b></p>
        <p className="mt-2 text-sm text-slate-400">לחיצה לסגירה</p></div>
    </div>, document.body)}

    {print && <PrintPreview title={print === 'key' ? `דף תשובות — ${data.title}` : data.title} onClose={() => setPrint(null)}><QuizSheet quiz={data} answers={print === 'key'} /></PrintPreview>}

    {confirm && createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center" dir="rtl">
        <p className="text-lg font-bold">{confirm.kind === 'quiz' ? 'למחוק את המבחן וכל התשובות? אי אפשר לשחזר.' : `למחוק את ההגשה של ${confirm.name}? התלמיד/ה יוכל/תוכל להגיש שוב.`}</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => setConfirm(null)} className="flex-1 rounded-2xl border-2 border-slate-200 py-3 font-bold">ביטול</button>
          <button disabled={busy} onClick={() => confirm.kind === 'quiz'
            ? act(async () => { await quizDb.remove(code, token); quizMemory.forget(code); nav('/classroom/quiz') })
            : act(() => quizDb.deleteSubmission(code, token, confirm.id))} className="flex-1 rounded-2xl bg-rose-600 py-3 font-bold text-white">מחיקה</button>
        </div>
      </div>
    </div>, document.body)}
  </div>
}

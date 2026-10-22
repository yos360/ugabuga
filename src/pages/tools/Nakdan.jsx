import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

// Automatic nakdan: the text goes to Dicta's free public Nakdan through our /api/nakdan proxy; every
// word comes back with its likely vocalizations, and a tap on a word swaps between them or edits it.
const MAX = 3000
const FONT = { fontFamily: '"Noto Sans Hebrew", "Arial Hebrew", Arial, sans-serif' }
const strip = s => s.replace(/[֑-ׇ]/g, m => (m === '־' ? m : ''))

export default function Nakdan() {
  const [input, setInput] = useState('')
  const [words, setWords] = useState(null) // [{ t, o?, s?, pick, custom? }]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(-1)
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const shown = w => w.custom ?? (w.o?.length ? w.o[w.pick] : w.t)
  const result = words ? words.map(shown).join('') : ''

  const run = async () => {
    setBusy(true); setError(''); setOpen(-1); setCopied(false)
    try {
      const res = await fetch('/api/nakdan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: strip(input).slice(0, MAX) }) })
      const data = await res.json()
      if (!res.ok || !Array.isArray(data.words)) throw new Error()
      setWords(data.words.map(w => ({ ...w, pick: 0 })))
    } catch { setError('שירות הניקוד לא ענה כרגע. נסו שוב בעוד רגע.') }
    setBusy(false)
  }
  const update = (i, patch) => { setWords(ws => ws.map((w, j) => (j === i ? { ...w, ...patch } : w))); setCopied(false) }
  const copy = async () => { try { await navigator.clipboard.writeText(result); setCopied(true) } catch { /* clipboard blocked */ } }

  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="נקדן אוטומטי — ניקוד טקסט אונליין בחינם, עם אפשרות לתקן כל מילה" description="נקדן אוטומטי בחינם: מדביקים טקסט בעברית ומקבלים אותו מנוקד. לוחצים על מילה כדי לבחור ניקוד אחר או לתקן ידנית, ומעתיקים. הניקוד באדיבות מפעל דיקטה." path="/tools/nakdan" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'נקדן אוטומטי' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl">🪄 נקדן אוטומטי</h1>
    <p className="mx-auto mb-5 mt-2 max-w-2xl text-center text-lg text-slate-600">מדביקים טקסט, לוחצים ״נקדו לי״ — ומקבלים אותו מנוקד. לא מתאים ניקוד של מילה? לוחצים עליה ובוחרים אחר.</p>
    <textarea value={input} onChange={e => setInput(e.target.value)} maxLength={MAX} dir="rtl" lang="he" rows={5} placeholder="הדביקו כאן טקסט בעברית, למשל: הילדים שיחקו בגן עד הערב" aria-label="הטקסט לניקוד" className="w-full rounded-2xl border-[3px] border-slate-800 bg-white p-4 text-2xl leading-relaxed" style={FONT} />
    <div className="mt-1 text-left text-sm text-slate-500">{input.length}/{MAX}</div>
    <div className="mt-2 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={run} disabled={busy || !/[א-ת]/.test(input)} className="min-h-12 rounded-xl bg-violet-700 px-8 text-xl font-black text-white disabled:opacity-50">{busy ? 'מנקד…' : '🪄 נקדו לי'}</button>
      <button type="button" onClick={() => { setInput(''); setWords(null); setError('') }} disabled={!input && !words} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 font-bold">ניקוי</button>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-center font-bold text-red-700">{error}</p>}

    {words && <section className="mt-6 rounded-2xl border-[3px] border-violet-300 bg-violet-50/40 p-4">
      <h2 className="mb-1 text-xl font-black">הטקסט המנוקד</h2>
      <p className="mb-3 text-sm text-slate-600">לחיצה על מילה פותחת את אפשרויות הניקוד שלה. כדאי לעבור על הטקסט — במיוחד על שמות ועל מילים שאפשר לקרוא בכמה דרכים.</p>
      <div className="whitespace-pre-wrap text-3xl leading-[2.2]" style={FONT} lang="he">
        {words.map((w, i) => !w.o?.length ? <span key={i}>{w.t}</span> : <span key={i}>
          <button type="button" onClick={() => { setOpen(open === i ? -1 : i); setDraft(shown(w)) }} aria-expanded={open === i} className={`rounded-md px-0.5 hover:bg-violet-200 ${open === i ? 'ring-2 ring-violet-600' : ''}`}>{shown(w)}</button>
        </span>)}
      </div>
      {open >= 0 && words[open]?.o && (() => { const w = words[open], i = open; return <div className="mt-3 rounded-xl border-2 border-violet-400 bg-white p-3">
        <div className="mb-2 flex items-center justify-between"><b>הניקוד של ״{w.t}״</b><button type="button" onClick={() => setOpen(-1)} aria-label="סגירה" className="rounded-lg px-2 text-xl">✕</button></div>
        <div className="flex flex-wrap gap-2" style={FONT}>
          {w.o.map((o, k) => <button key={k} type="button" onClick={() => { update(i, { pick: k, custom: undefined }); setOpen(-1) }} className={`rounded-lg border-2 px-3 py-1 text-2xl hover:bg-violet-100 ${w.custom == null && w.pick === k ? 'border-violet-600 bg-violet-100 font-bold' : 'border-slate-200'}`}>{o}</button>)}
          <button type="button" onClick={() => { update(i, { custom: w.t }); setOpen(-1) }} className="rounded-lg border-2 border-slate-200 px-3 py-1 text-base hover:bg-slate-100">בלי ניקוד</button>
        </div>
        <div className="mt-2 flex gap-2"><input value={draft} onChange={e => setDraft(e.target.value)} aria-label="תיקון ידני" dir="rtl" lang="he" className="min-w-0 flex-1 rounded-lg border-2 border-slate-300 px-2 text-2xl" style={FONT} /><button type="button" onClick={() => { update(i, { custom: draft }); setOpen(-1) }} className="rounded-lg bg-violet-700 px-4 font-bold text-white">שמירת תיקון</button></div>
      </div> })()}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={copy} className="min-h-12 rounded-xl bg-violet-700 px-6 font-bold text-white">{copied ? '✅ הועתק' : '📋 העתקת הטקסט המנוקד'}</button>
        <Link to="/tools/nikud-keyboard" className="flex min-h-12 items-center rounded-xl border-2 border-slate-300 bg-white px-5 font-bold">✍️ תיקון סימן בודד — מקלדת ניקוד</Link>
      </div>
    </section>}
    <p className="mt-4 text-center text-sm text-slate-500">הניקוד האוטומטי באדיבות <a href="https://dicta.org.il" target="_blank" rel="noopener noreferrer" className="underline">מפעל דיקטה</a>. הטקסט נשלח לשירות שלהם לצורך הניקוד בלבד — אל תדביקו פרטים אישיים.</p>

    <div className="mt-10"><SeoBody paragraphs={['נקדן אוטומטי מוסיף לטקסט עברי את סימני הניקוד בלי שתצטרכו לנקד אות אחרי אות. מדביקים טקסט — שיר, ברכה, סיפור לילדים או דף עבודה — והנקדן מחזיר אותו מנוקד תוך שניות. הניקוד נעשה במנוע של מפעל דיקטה, שמבין את ההקשר של המשפט ובוחר לכל מילה את הניקוד המתאים ביותר.', 'למה אפשר לתקן? בעברית יש מילים שנכתבות אותו דבר ונקראות אחרת: ספר (סֵפֶר, סָפַר, סִפֵּר), שיחקו (שִׂחֲקוּ, שִׁחֲקוּ). לפעמים המנוע בוחר אחרת ממה שהתכוונתם, ולכן לחיצה על כל מילה פותחת את האפשרויות שלה, ואפשר גם לכתוב ניקוד משלכם. לתיקון של סימן בודד יש באתר מקלדת ניקוד.']} faq={FAQ} related={[{ label: 'מקלדת ניקוד', href: '/tools/nikud-keyboard' }, { label: 'לימוד ניקוד לילדים', href: '/letters/nikud' }, { label: 'מונה מילים', href: '/tools/word-count' }]} /></div>
  </div>
}
const FAQ = [
  { q: 'הנקדן חינמי?', a: 'כן, לגמרי ובלי הרשמה. הניקוד נעשה בשירות החינמי של מפעל דיקטה, ואנחנו מוסיפים מעליו את האפשרות לבחור ולתקן כל מילה ולהעתיק.' },
  { q: 'כמה טקסט אפשר לנקד בבת אחת?', a: `עד ${MAX.toLocaleString('he-IL')} תווים בכל פעם — בערך עמוד וחצי. לטקסט ארוך יותר מנקדים בחלקים.` },
  { q: 'הניקוד מדויק?', a: 'ברוב המילים כן, אבל לא תמיד — יש מילים שנכתבות אותו דבר ונקראות אחרת. כדאי לעבור על הטקסט, במיוחד בשמות ובמילים נדירות, ולתקן בלחיצה.' },
  { q: 'מה קורה לטקסט שאני מדביק?', a: 'הוא נשלח לשירות הניקוד של דיקטה רק כדי לנקד אותו, ואנחנו לא שומרים אותו. בכל זאת, לא מומלץ להדביק פרטים אישיים.' },
  { q: 'הטקסט כבר מנוקד בחלקו — זה בעיה?', a: 'לא. לפני הניקוד מסירים את הניקוד הקיים ומנקדים מחדש. אם רציתם ניקוד מסוים במילה, מתקנים אותה אחר כך בלחיצה.' },
]

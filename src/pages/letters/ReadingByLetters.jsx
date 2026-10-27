import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { speak } from '../../utils/speak'
import { makeRng, newSeed } from '../../motor/rng'
import { LETTERS, SENTENCES, SOUNDS, WORDS, readable, syllable } from '../../data/readingByLetters'
import './reading-practice.css'

// /letters/reading-practice — "קוראים רק מה שלמדנו": pick the letters and vowel sounds the child already
// knows and get a reading sheet (syllables, words, sentences, a line to copy) made only of those.
// The choice is remembered on this device; "new sheet" reshuffles. Same sheet on screen and in print.
const PATH = '/letters/reading-practice'
const KEY = 'buga-reading-known'
const FIRST = { letters: [...'אבגדהלמסרת'], sounds: ['a'] }
const load = () => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v?.letters?.length && v?.sounds?.length) return v } catch { /* ignore */ } return FIRST }
const chip = on => `min-h-[48px] min-w-[48px] rounded-xl border-2 px-3 text-2xl font-bold transition-colors ${on ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white text-slate-400'}`

export function buildSheet(letters, sounds, seed) {
  const rng = makeRng(seed)
  const words = rng.shuffle(WORDS.filter(w => readable(w, letters, sounds)))
  const sentences = rng.shuffle(SENTENCES.filter(s => readable(s, letters, sounds)))
  const grid = rng.shuffle(letters).slice(0, 5).map(l => sounds.map(s => syllable(l, s)))
  return { grid, words: words.slice(0, 12), sentences: sentences.slice(0, 5), copy: words.slice(0, 3), total: words.length + sentences.length }
}

function Sheet({ sheet, letters, sounds, onSay }) {
  const say = t => onSay?.(t)
  const big = { fontFamily: '"Frank Ruhl Libre", "David Libre", Heebo, serif', lineHeight: 1.5 }
  return <article className="buga-a4" style={{ alignItems: 'stretch', gap: 10 }} dir="rtl">
    <h2 style={{ fontSize: '24pt', textAlign: 'center', margin: 0 }}>📖 תִּרְגּוּל קְרִיאָה</h2>
    <p style={{ textAlign: 'center', margin: 0, fontSize: '11.5pt' }}>שם: ____________ · אותיות: {letters.join(' ')} · צלילים: {SOUNDS.filter(s => sounds.includes(s.id)).map(s => s.label).join(' ')}</p>
    <section><h3 style={{ margin: '6px 0', fontSize: '14pt' }}>1. קוֹרְאִים הֲבָרוֹת</h3>
      <table style={{ borderCollapse: 'collapse', margin: '0 auto', ...big }}><tbody>{sheet.grid.map((row, i) => <tr key={i}>{row.map(s => <td key={s} onClick={() => say(s)} style={{ border: '2px solid #111', width: '22mm', height: '15mm', textAlign: 'center', fontSize: '26pt', cursor: onSay ? 'pointer' : 'default' }}>{s}</td>)}</tr>)}</tbody></table>
    </section>
    {sheet.words.length > 0 && <section><h3 style={{ margin: '6px 0', fontSize: '14pt' }}>2. קוֹרְאִים מִלִּים</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2mm 4mm', textAlign: 'center', fontSize: '22pt', ...big }}>{sheet.words.map(w => <span key={w} onClick={() => say(w)} style={{ cursor: onSay ? 'pointer' : 'default' }}>{w}</span>)}</div>
    </section>}
    {sheet.sentences.length > 0 && <section><h3 style={{ margin: '6px 0', fontSize: '14pt' }}>3. קוֹרְאִים מִשְׁפָּטִים בְּקוֹל</h3>
      <ul style={{ margin: 0, paddingInlineStart: '8mm', fontSize: '21pt', ...big }}>{sheet.sentences.map(s => <li key={s} onClick={() => say(s)} style={{ cursor: onSay ? 'pointer' : 'default' }}>{s}</li>)}</ul>
    </section>}
    {sheet.copy.length > 0 && <section><h3 style={{ margin: '6px 0', fontSize: '14pt' }}>4. מַעְתִּיקִים מִלָּה</h3>
      {sheet.copy.map(w => <div key={w} style={{ display: 'flex', alignItems: 'flex-end', gap: '6mm', margin: '3mm 0', fontSize: '20pt', ...big }}><span style={{ minWidth: '30mm' }}>{w}</span><span style={{ flex: 1, borderBottom: '1.5px solid #111', height: '10mm' }} /></div>)}
    </section>}
    <p style={{ textAlign: 'center', fontSize: '18pt', margin: 'auto 0 0' }}>⭐ כָּל הַכָּבוֹד! ⭐</p>
  </article>
}

const FAQ = [
  { q: 'למה כדאי לתרגל רק עם האותיות שהילד כבר למד?', a: 'כשכל מילה בדף בנויה מאותיות וצלילים מוכרים, הילד מצליח לקרוא לבד. ההצלחה הזאת חשובה יותר מכמות המילים: היא בונה ביטחון ורצון להמשיך. מילה עם אות שעוד לא נלמדה גורמת לניחוש במקום לקריאה.' },
  { q: 'באיזה סדר לומדים את האותיות בכיתה א׳?', a: 'אין סדר אחד — כל תוכנית לימוד וכל מורה בוחרים סדר משלהם. לכן כאן בוחרים את האותיות בעצמכם, לפי מה שהילד כבר למד בכיתה. כדאי לשאול את המחנכת אילו אותיות נלמדו השבוע.' },
  { q: 'מה עושים אם יוצאות מעט מילים?', a: 'בהתחלה, עם מעט אותיות וצליל אחד, יש פחות מילים — וזה בסדר. הוסיפו את האותיות שנלמדו בשבוע האחרון, או לחצו על "דף חדש" כדי לקבל מילים אחרות מאותה בחירה.' },
]

export default function ReadingByLetters() {
  const [known, setKnown] = useState(load)
  const [seed, setSeed] = useState(1)
  const [printing, setPrinting] = useState(false)
  useEffect(() => { setSeed(newSeed()) }, [])
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(known)) } catch { /* ignore */ } }, [known])
  const sheet = useMemo(() => buildSheet(known.letters, known.sounds, seed), [known, seed])
  const toggle = (kind, v) => setKnown(k => { const has = k[kind].includes(v); const next = has ? k[kind].filter(x => x !== v) : [...k[kind], v]; return next.length ? { ...k, [kind]: kind === 'letters' ? LETTERS.filter(l => next.includes(l)) : SOUNDS.map(s => s.id).filter(s => next.includes(s)) } : k })
  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title="תרגול קריאה לכיתה א׳ — רק עם האותיות שלמדנו (דף להדפסה)" description="מחולל דפי תרגול קריאה לכיתה א׳: בוחרים את האותיות והניקוד שהילד כבר למד, ומקבלים דף עם הברות, מילים ומשפטים מנוקדים רק מהן. דף חדש בכל לחיצה, להדפסה בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'תרגול קריאה לפי מה שלמדנו' }]} />
    <h1 className="text-center text-4xl sm:text-5xl">📖 קוראים רק מה שלמדנו</h1>
    <p className="mx-auto mb-6 mt-3 max-w-2xl text-center text-lg">סמנו אילו אותיות וצלילים הילד כבר מכיר, ותקבלו דף קריאה שאפשר לקרוא לבד מההתחלה ועד הסוף — בלי אף אות שעוד לא נלמדה.</p>
    <section className="rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-black">1. אילו אותיות כבר למדנו?</h2>
        <div className="flex gap-2"><button type="button" className="rounded-xl border-2 border-slate-300 px-3 py-1 font-bold" onClick={() => setKnown(k => ({ ...k, letters: LETTERS }))}>כל האותיות</button><button type="button" className="rounded-xl border-2 border-slate-300 px-3 py-1 font-bold" onClick={() => setKnown(k => ({ ...k, letters: ['א', 'ב'] }))}>להתחיל מחדש</button></div></div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="אותיות שנלמדו">{LETTERS.map(l => <button key={l} type="button" aria-pressed={known.letters.includes(l)} className={chip(known.letters.includes(l))} onClick={() => toggle('letters', l)}>{l}</button>)}</div>
      <h2 className="mt-5 text-xl font-black">2. אילו צלילים (ניקוד)?</h2>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="צלילים שנלמדו">{SOUNDS.map(s => <button key={s.id} type="button" aria-pressed={known.sounds.includes(s.id)} className={chip(known.sounds.includes(s.id))} onClick={() => toggle('sounds', s.id)}>{s.label} <small className="text-sm font-normal">{s.name}</small></button>)}</div>
      <div className="mt-5 flex flex-wrap items-center gap-2"><button type="button" onClick={() => setPrinting(true)} className="min-h-[48px] rounded-2xl bg-violet-700 px-5 font-bold text-white">🖨️ הדפסת הדף</button><button type="button" onClick={() => setSeed(newSeed())} className="min-h-[48px] rounded-2xl border-2 border-violet-300 bg-white px-5 font-bold">🎲 דף חדש</button>
        <span className="text-sm text-[var(--muted-foreground)]">{sheet.total ? `${sheet.words.length} מילים ו־${sheet.sentences.length} משפטים בדף` : 'עוד אין מילים מהבחירה הזאת — הוסיפו אותיות'}</span></div>
    </section>
    <p className="mt-4 text-center text-sm">💡 לחיצה על הברה, מילה או משפט בדף שלמטה — משמיעה אותם.</p>
    <div className="reading-sheet-preview mx-auto mt-3 max-w-[210mm] overflow-hidden rounded-xl border-2 border-[var(--border)] bg-white"><Sheet sheet={sheet} letters={known.letters} sounds={known.sounds} onSay={t => speak(t)} /></div>
    {printing && <PrintPreview title="תרגול קריאה — רק מה שלמדנו" onClose={() => setPrinting(false)} onRefresh={() => setSeed(newSeed())}><Sheet sheet={sheet} letters={known.letters} sounds={known.sounds} /></PrintPreview>}
    <div className="mt-10"><SeoBody paragraphs={[
      'הדרך הכי טובה לתרגל קריאה בכיתה א׳ היא לקרוא טקסט שבנוי רק ממה שהילד כבר למד. כך כל מילה היא הצלחה קטנה, והילד לא נתקע באות שעוד לא פגש. כאן בוחרים את האותיות ואת הצלילים — קמץ ופתח, סגול וצירה, חיריק, חולם, שורוק ושווא — ומקבלים דף שמתאים בדיוק לשבוע הזה.',
      'בכל דף יש ארבעה חלקים: טבלת הברות, מילים, משפטים קצרים וקריאה בקול, ושורה להעתקת מילה. הבחירה נשמרת במכשיר, אז בשבוע הבא רק מוסיפים את האותיות החדשות. כל לחיצה על "דף חדש" מערבבת את המילים והמשפטים.',
    ]} faq={FAQ} related={[{ label: 'קמץ ופתח — משחק ודפי עבודה', href: '/letters/nikud' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'הבנת הנקרא כיתה א׳', href: '/learn/reading/grade-1' }]} /></div>
  </div>
}

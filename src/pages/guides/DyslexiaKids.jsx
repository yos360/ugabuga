import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import {
  PATH, TINTS, SAMPLE_TEXT, WHAT, SIGNS, ADAPTATIONS, ASSESSMENT, HOME_TIPS, CONSULT,
  PASSAGES, OBSERVE, FAQ,
} from '../../data/dyslexiaKids'

// /guides/dyslexia-kids: a plain-language guide, a reading-friendly text maker with a reading ruler,
// and printables. Nothing typed or chosen here is stored or sent anywhere.

const DEFAULTS = { size: 28, letter: 1, word: 6, line: 2, tint: 'cream' }

function Slider({ id, label, min, max, step, value, onChange, unit }) {
  return <div>
    <label htmlFor={id} className="block font-bold">{label}: <span dir="ltr">{value}{unit}</span></label>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="mt-1 w-full" />
  </div>
}

const textStyle = (s, tint) => ({
  fontSize: s.size, letterSpacing: `${s.letter}px`, wordSpacing: `${s.word}px`, lineHeight: s.line,
  background: tint.bg, color: tint.fg, fontFamily: 'Heebo, Arial, sans-serif',
})

function TextMaker({ onPrint, settings, setSettings, text, setText }) {
  const s = settings
  const set = k => v => setSettings(o => ({ ...o, [k]: v }))
  const tint = TINTS.find(t => t.id === s.tint) || TINTS[1]
  const [ruler, setRuler] = useState(false)
  const [idx, setIdx] = useState(0)
  const [lines, setLines] = useState(1)
  const ref = useRef(null)
  const lh = s.size * s.line

  // Count how many lines the text wraps to, so the ruler stays inside it.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const n = Math.max(1, Math.round(el.scrollHeight / lh))
    setLines(n)
    setIdx(i => Math.min(i, n - 1))
  }, [text, s.size, s.letter, s.word, s.line, lh])

  return <div>
    <label htmlFor="rt-text" className="block text-lg font-bold">📋 מדביקים כאן טקסט בעברית</label>
    <textarea id="rt-text" rows={5} value={text} onChange={e => setText(e.target.value)} maxLength={3000}
      className="mt-1 w-full rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-lg" />
    <div className="mt-2 flex flex-wrap gap-2">
      <button type="button" className="ln-btn alt" onClick={() => setText(SAMPLE_TEXT)}>טקסט לדוגמה</button>
      <button type="button" className="ln-btn alt" onClick={() => setText('')}>מנקים</button>
    </div>

    <div className="mt-4 grid gap-4 rounded-3xl bg-sky-50 p-4 sm:grid-cols-2">
      <Slider id="rt-size" label="גודל אותיות" min={18} max={56} step={2} value={s.size} onChange={set('size')} unit=" px" />
      <Slider id="rt-letter" label="מרווח בין אותיות" min={0} max={6} step={0.5} value={s.letter} onChange={set('letter')} unit=" px" />
      <Slider id="rt-word" label="מרווח בין מילים" min={0} max={30} step={2} value={s.word} onChange={set('word')} unit=" px" />
      <Slider id="rt-line" label="מרווח בין שורות" min={1.2} max={3} step={0.1} value={Number(s.line.toFixed(1))} onChange={set('line')} unit="×" />
      <div className="sm:col-span-2" role="group" aria-label="צבע רקע">
        <p className="mb-1 font-bold">🎨 צבע רקע</p>
        <div className="flex flex-wrap gap-2">{TINTS.map(t => <button key={t.id} type="button" aria-pressed={s.tint === t.id} onClick={() => set('tint')(t.id)}
          className={`min-h-[44px] rounded-2xl border-2 px-4 font-bold ${s.tint === t.id ? 'border-slate-800 ring-2 ring-slate-800' : 'border-[var(--border)]'}`} style={{ background: t.bg }}>{t.label}</button>)}
        </div>
      </div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
        <button type="button" className={ruler ? 'ln-btn go' : 'ln-btn alt'} aria-pressed={ruler} onClick={() => setRuler(r => !r)}>📏 סרגל קריאה: {ruler ? 'פעיל' : 'כבוי'}</button>
        {ruler && <>
          <button type="button" className="ln-btn alt" disabled={idx <= 0} onClick={() => setIdx(i => Math.max(0, i - 1))} aria-label="שורה קודמת">↑ שורה קודמת</button>
          <button type="button" className="ln-btn alt" disabled={idx >= lines - 1} onClick={() => setIdx(i => Math.min(lines - 1, i + 1))} aria-label="שורה הבאה">↓ שורה הבאה</button>
          <span className="text-sm" role="status" aria-live="polite">שורה {idx + 1} מתוך {lines}</span>
        </>}
        <button type="button" className="ln-btn alt" onClick={() => setSettings(DEFAULTS)}>איפוס הגדרות</button>
      </div>
    </div>

    <div className="relative mt-4 overflow-hidden rounded-3xl border-2 border-[var(--border)]" style={{ background: tint.bg }}>
      <div ref={ref} dir="rtl" className="whitespace-pre-wrap break-words p-4" style={textStyle(s, tint)} aria-label="הטקסט המותאם לקריאה" tabIndex={0}>{text || 'הטקסט יופיע כאן.'}</div>
      {ruler && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bg-yellow-300/50 motion-reduce:transition-none"
        style={{ top: 16 + idx * lh, height: lh, transition: 'top .2s', mixBlendMode: 'multiply' }} />}
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <button type="button" className="ln-btn go" onClick={onPrint} disabled={!text.trim()}>🖨️ הדפסה</button>
    </div>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">🔒 הטקסט שהודבק נשאר רק על המסך שלכם ולא נשמר ולא נשלח.</p>
  </div>
}

// ---- printable sheets (A4 pages inside PrintPreview) ----
const page = { fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }
const smallh = { width: '100%', margin: '2mm 0 1mm', fontSize: 15 }
const foot = txt => <footer>ugabuga.co.il{PATH} · {txt}</footer>

function MakerSheet({ text, settings }) {
  const tint = TINTS.find(t => t.id === settings.tint) || TINTS[1]
  return <article className="buga-a4" style={{ ...page, background: tint.bg }}>
    <div dir="rtl" style={{ ...textStyle(settings, tint), width: '100%', whiteSpace: 'pre-wrap', overflow: 'hidden', flex: 1, minHeight: 0 }}>{text}</div>
    {foot('טקסט מותאם לקריאה')}
  </article>
}

function RulerSheet() {
  const cut = { border: '2px dashed #555', borderRadius: 10, position: 'relative' }
  return <article className="buga-a4" style={page}>
    <h2>📏 סרגל קריאה וסימניה</h2>
    <p style={{ fontSize: 13, margin: '0 0 6px', textAlign: 'center' }}>גוזרים לאורך הקו המקווקו. בסרגל גוזרים גם את החלון האמצעי, ומניחים על שורה אחת בספר.</p>
    <div style={{ ...cut, width: '100%', height: '60mm', background: '#fef9c3', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '90%', height: '14mm', border: '3px solid #b45309', background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#92400e' }}>✂️ חלון: גוזרים כאן ומשאירים רק את המסגרת</div>
      <p style={{ margin: '6px 0 0', fontSize: 16, fontWeight: 800 }}>📏 סרגל קריאה: קוראים שורה אחת בכל פעם</p>
    </div>
    <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 10, flex: 1, minHeight: 0 }}>
      {[['#dbeafe', '📖 קוראים בנחת'], ['#dcfce7', '⭐ שורה אחרי שורה'], ['#fce7f3', '💪 כל הכבוד על המאמץ']].map(([c, t]) => <div key={t} style={{ ...cut, flex: 1, background: c, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '8px 4px', textAlign: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 900 }}>סימניה</span>
        <span style={{ fontSize: 44 }}>{t.slice(0, 2)}</span>
        <span style={{ fontSize: 14, fontWeight: 800, writingMode: 'horizontal-tb' }}>{t.slice(3)}</span>
        <span style={{ fontSize: 12 }}>שם: ________</span>
      </div>)}
    </div>
    {foot('סרגל קריאה וסימניה')}
  </article>
}

function PracticeSheet() {
  return <article className="buga-a4" style={page}>
    <h2>📖 דף קריאה ברווחים גדולים</h2>
    <p style={{ fontSize: 13, margin: '0 0 4px', width: '100%' }}>שם: ______________ · קוראים לאט, שורה אחת בכל פעם. אפשר להשתמש בסרגל קריאה.</p>
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', gap: '3mm', minHeight: 0 }}>
      {PASSAGES.map((p, i) => <div key={p.title} style={{ flex: 1, minHeight: 0, border: '2px solid #666', borderRadius: 12, padding: '6px 12px', background: '#fffdf5', overflow: 'hidden' }}>
        <div style={{ fontSize: 17, fontWeight: 900 }}>{i + 1}. {p.title}</div>
        <div style={{ fontSize: 21, letterSpacing: '1px', wordSpacing: '7px', lineHeight: 2.1 }}>{p.text}</div>
        <div style={{ fontSize: 12, marginTop: 2 }}>קראתי: ☐ לבד ☐ עם הורה ☐ פעמיים</div>
      </div>)}
    </div>
    {foot('דף קריאה ברווחים גדולים')}
  </article>
}

function ObserveSheet() {
  return <article className="buga-a4" style={page}>
    <h2>📝 דף תצפית להורים: להביא לאיש המקצוע</h2>
    <p style={{ fontSize: 12.5, margin: '0 0 2px', width: '100%' }}>שם הילד/ה: ______________ · גיל/כיתה: ________ · תאריך: ________</p>
    <p style={{ fontSize: 12, margin: '0 0 4px', width: '100%' }}>מסמנים מה שרואים בבית לאורך זמן, ומוסיפים דוגמה. זה דף עזר לשיחה, ולא אבחון.</p>
    <div style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {OBSERVE.map(([h, items]) => <div key={h} style={{ border: '1.5px solid #555', borderRadius: 10, padding: '3px 8px' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 900 }}>{h}</h3>
        {items.map(t => <div key={t} style={{ fontSize: 12.5, lineHeight: 1.45 }}>☐ {t} <span style={{ color: '#888' }}>(מתי: ______)</span></div>)}
      </div>)}
      <h3 style={smallh}>מה הילד/ה אוהב/ת ומצליח/ה בו?</h3>
      <div style={{ borderBottom: '1px solid #999', height: 18 }} /><div style={{ borderBottom: '1px solid #999', height: 18 }} />
      <h3 style={smallh}>דוגמאות מהקריאה והכתיבה (אפשר לצרף מחברת)</h3>
      <div style={{ borderBottom: '1px solid #999', height: 18 }} /><div style={{ borderBottom: '1px solid #999', height: 18 }} />
      <h3 style={smallh}>שאלות לשאול את איש המקצוע</h3>
      <div style={{ borderBottom: '1px solid #999', height: 18 }} /><div style={{ borderBottom: '1px solid #999', height: 18 }} />
    </div>
    {foot('דף תצפית להורים')}
  </article>
}

const SHEETS = [
  { id: 'ruler', emoji: '📏', label: 'סרגל קריאה וסימניות לגזירה', C: RulerSheet },
  { id: 'practice', emoji: '📖', label: 'דף קריאה ברווחים גדולים', C: PracticeSheet },
  { id: 'observe', emoji: '📝', label: 'דף תצפית להורים לשיחה עם איש מקצוע', C: ObserveSheet },
]

export default function DyslexiaKids() {
  const [print, setPrint] = useState(null)
  const [text, setText] = useState(SAMPLE_TEXT)
  const [settings, setSettings] = useState(DEFAULTS)
  const sheet = SHEETS.find(s => s.id === print)

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="דיסלקציה אצל ילדים: סימנים, אבחון ודרכים לעזור"
      description="דיסלקציה אצל ילדים: מה זה, סימנים לפי גיל, התאמות בבית הספר, טיפים לקריאה בבית, יוצר טקסט נוח לקריאה, סרגל קריאה ודפי הדפסה בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מדריכים', href: '/guides' }, { label: 'דיסלקציה אצל ילדים' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">📖 דיסלקציה אצל ילדים: סימנים, אבחון ודרכים לעזור</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מה זו דיסלקציה, אילו סימנים אפשר לזהות בגן ובבית הספר, אילו התאמות קיימות ואיך עוזרים בבית. עם יוצר טקסט נוח לקריאה וסרגל קריאה על המסך, ודפים להדפסה.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="ניווט בעמוד">
      {[['what', 'מה זו דיסלקציה'], ['signs', 'סימנים לפי גיל'], ['adapt', 'אבחון והתאמות'], ['maker', 'יוצר טקסט לקריאה'], ['home', 'קריאה בבית'], ['print', 'דפים להדפסה']].map(([h, t]) => <a key={h} href={`#${h}`} className="ln-btn alt">{t}</a>)}
    </nav>

    <section id="what" className="mb-8 scroll-mt-24" aria-labelledby="what-h">
      <h2 id="what-h" className="mb-3 text-3xl font-black">🧩 מה זו דיסלקציה?</h2>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{WHAT.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-lg leading-relaxed">⚠️ <b>מדריך כללי, לא אבחון.</b> לא ניתן לאבחן דיסלקציה מדף באינטרנט. הרבה ילדים מבלבלים אותיות בתחילת הדרך, וזה לא אומר דבר בפני עצמו. אם יש חשש, פנו למורה, ליועצת או לרופא/ת הילדים.</p>
    </section>

    <section id="signs" className="mb-8 scroll-mt-24" aria-labelledby="signs-h">
      <h2 id="signs-h" className="mb-3 text-3xl font-black">👀 סימנים לפי גיל</h2>
      <div className="grid gap-4 md:grid-cols-3">{SIGNS.map(s => <div key={s.age} className="rounded-3xl border-2 border-[var(--border)] bg-white p-5">
        <h3 className="text-2xl font-black"><span aria-hidden="true">{s.emoji}</span> {s.age}</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 leading-relaxed">{s.items.map(t => <li key={t}>{t}</li>)}</ul>
      </div>)}</div>
    </section>

    <section id="adapt" className="mb-8 scroll-mt-24" aria-labelledby="adapt-h">
      <h2 id="adapt-h" className="mb-3 text-3xl font-black">🏫 אבחון והתאמות בבית הספר: תמונה כללית</h2>
      <ol className="mb-5 list-decimal space-y-2 pr-5 text-lg leading-relaxed">{ASSESSMENT.map(t => <li key={t}>{t}</li>)}</ol>
      <h3 className="mb-3 text-2xl font-black">התאמות נפוצות</h3>
      <ul className="grid gap-3 sm:grid-cols-2">{ADAPTATIONS.map(([e, t, d]) => <li key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}
      </ul>
      <p className="mt-4 text-lg leading-relaxed">לדוגמאות של דפי מבחן מותאמים אפשר לעיין באתר: <Link to="/learn/adapted-tests" className="font-bold underline">מבחנים מותאמים לילדים</Link>.</p>
      <div className="mt-4 rounded-3xl border-2 border-[var(--border)] bg-rose-50 p-5">
        <h3 className="text-2xl font-black">🤝 מתי כדאי לפנות לעזרה</h3>
        <ul className="mt-2 list-disc space-y-2 pr-5 text-lg leading-relaxed">{CONSULT.map(c => <li key={c}>{c}</li>)}</ul>
        <p className="mt-3 leading-relaxed">העמוד הזה הוא כלי חינוכי כללי. הוא לא מאבחן ולא מחליף הערכה של איש מקצוע.</p>
      </div>
    </section>

    <section id="maker" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-yellow-50 p-5" aria-labelledby="maker-h">
      <h2 id="maker-h" className="mb-3 text-3xl font-black">✨ יוצר טקסט נוח לקריאה</h2>
      <p className="mb-4 text-lg leading-relaxed">מדביקים טקסט, ומתאימים גודל אותיות, מרווחים וצבע רקע. סרגל הקריאה מסמן שורה אחת, ואפשר להזיז אותו בכפתורים. מה נוח לקריאה שונה מילד לילד, ולכן כדאי לנסות יחד איתו.</p>
      <TextMaker text={text} setText={setText} settings={settings} setSettings={setSettings} onPrint={() => setPrint('maker')} />
    </section>

    <section id="home" className="mb-8 scroll-mt-24 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="home-h">
      <h2 id="home-h" className="mb-3 text-3xl font-black">🏠 טיפים לקריאה בבית</h2>
      <ul className="list-disc space-y-2 pr-5 text-lg leading-relaxed">{HOME_TIPS.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="mt-3 text-lg">עוד תרגול: <Link to="/printables/reading-log" className="font-bold underline">יומן קריאה</Link> ו<Link to="/learn/reading" className="font-bold underline">משחקי קריאה</Link>.</p>
    </section>

    <section id="print" className="mb-8 scroll-mt-24" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-3 text-3xl font-black">🖨️ דפים להדפסה</h2>
      <p className="mb-4 text-lg leading-relaxed">סרגל קריאה לגזירה, דף קריאה ברווחים גדולים, ודף תצפית להורים להבאה לשיחה עם איש מקצוע. הטקסט שיצרתם למעלה גם אפשר להדפיס.</p>
      <div className="grid gap-3 sm:grid-cols-2">{SHEETS.map(s => <button key={s.id} type="button" onClick={() => setPrint(s.id)}
        className="ln-box card-lift min-h-[64px] text-right text-xl font-bold"><span aria-hidden="true">{s.emoji}</span> {s.label} · הדפסה ←</button>)}
      </div>
    </section>

    {sheet && <PrintPreview title={`דיסלקציה — ${sheet.label}`} onClose={() => setPrint(null)}><sheet.C /></PrintPreview>}
    {print === 'maker' && <PrintPreview title="טקסט מותאם לקריאה" onClose={() => setPrint(null)}><MakerSheet text={text} settings={settings} /></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד באתר: <Link className="font-bold underline" to="/guides/adhd-kids">קשב וריכוז אצל ילדים</Link> · <Link className="font-bold underline" to="/learn/adapted-tests">מבחנים מותאמים</Link> · <Link className="font-bold underline" to="/printables/reading-log">יומן קריאה</Link> · <Link className="font-bold underline" to="/guides">כל המדריכים</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'דיסלקציה היא קושי בלמידת קריאה וכתיבה, והיא נפוצה יותר ממה שחושבים. ילדים עם דיסלקציה חכמים ויצירתיים, ובעזרת זיהוי מוקדם, הוראה מותאמת והתאמות בבית הספר הם יכולים להצליח ללמוד ולהאמין בעצמם. המדריך הזה מסביר מה זו דיסלקציה, אילו סימנים אפשר לשים לב אליהם בגן, בכיתות א׳–ב׳ ומכיתה ג׳, ואיך נראה תהליך אבחון והתאמות בישראל, בכלליות ובלי להחליף איש מקצוע.',
      'בדף יש יוצר טקסט נוח לקריאה: מדביקים טקסט ומתאימים גודל אותיות, מרווחים בין אותיות, מילים ושורות, צבע רקע וסרגל קריאה שמדגיש שורה אחת. אפשר להדפיס את התוצאה, וגם שלושה דפים מוכנים: סרגל קריאה וסימניות, דף קריאה ברווחים גדולים ודף תצפית להורים. שום דבר לא נשמר ולא נשלח.',
    ]} faq={FAQ} related={[{ label: 'קשב וריכוז אצל ילדים', href: '/guides/adhd-kids' }, { label: 'מבחנים מותאמים', href: '/learn/adapted-tests' }, { label: 'יומן קריאה להדפסה', href: '/printables/reading-log' }]} /></div>
  </div>
}

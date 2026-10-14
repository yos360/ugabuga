import { englishCounterpart } from '../../en/englishRoutes'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { speak } from '../../utils/speak'
import { HEBREW } from '../../data/letterLearning'
import { FINAL_NAMES } from '../../data/letterSkills'

// Hebrew cursive (כתב יד) next to print (דפוס), with printable practice sheets.
// The cursive glyphs come from the Ktav Yad CLM font (Culmus, GPL) — loaded as 'KtavYad' in index.css.
// The STAM section uses Stam Sefarad CLM ('Stam').

const LETTERS = HEBREW.flatMap(x => [{ l: x.l, name: x.name, slug: x.slug }, ...(x.final ? [{ l: x.final, name: FINAL_NAMES[x.final], final: true }] : [])])
const KTAV = 'KtavYad, Heebo, sans-serif'
const WORDS = [...new Set(HEBREW.flatMap(x => x.words.map(w => w[0])))].filter(w => w.length <= 6)
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }

// Handwriting lines: top (dashed) and baseline, like a first-grade notebook.
const Lines = ({ y, h = 16, x1 = 12, x2 = 188 }) => <g>
  <line x1={x1} x2={x2} y1={y} y2={y} stroke="#bfdbfe" strokeWidth=".5" strokeDasharray="2 1.5" />
  <line x1={x1} x2={x2} y1={y + h} y2={y + h} stroke="#60a5fa" strokeWidth=".7" />
</g>
const K = ({ x, y, size, fill = '#111', children }) => <text x={x} y={y} fontSize={size} fontFamily={KTAV} fill={fill} textAnchor="middle" direction="rtl">{children}</text>

function ChartSheet({ title = 'אותיות בכתב יד — דפוס וכתב' }) {
  return <Sheet label={title}>
    <T x={100} y={16} size={9} weight={900}>{title}</T>
    {LETTERS.map((x, i) => {
      const c = i % 6, r = Math.floor(i / 6), cx = 177 - c * 30.8, cy = 26 + r * 47
      return <g key={x.l}>
        <rect x={cx - 14} y={cy} width={28} height={43} rx={3} fill={x.final ? '#fdf4ff' : '#fff'} stroke="#cbd5e1" strokeWidth=".5" />
        <T x={cx + 9} y={cy + 9} size={7} weight={700} fill="#64748b">{x.l}</T>
        <K x={cx - 1} y={cy + 28} size={19}>{x.l}</K>
      </g>
    })}
    <T x={100} y={268} size={4} fill="#666">בפינה — האות בדפוס · באמצע — אותה אות בכתב יד · בסגול: אותיות סופיות</T>
  </Sheet>
}

// One letter per band: a model, then grey copies to trace, then an empty line.
function PracticeSheet({ letters }) {
  return <Sheet label={`תרגול כתב: ${letters.map(x => x.l).join(' ')}`}>
    <T x={100} y={14} size={8} weight={900}>תרגול כתיבה בכתב יד</T>
    <T x={190} y={14} size={4} anchor="start" fill="#666">שם: ____________</T>
    {letters.map((x, i) => {
      const y = 24 + i * 61
      return <g key={x.l}>
        <rect x={168} y={y} width={22} height={22} rx={3} fill="#fef9c3" />
        <T x={179} y={y + 9} size={8} weight={700}>{x.l}</T>
        <K x={179} y={y + 20} size={11} fill="#7548b3">{x.l}</K>
        <Lines y={y + 2} h={16} x2={164} />
        {Array.from({ length: 7 }, (_, k) => <K key={k} x={154 - k * 21} y={y + 18} size={20} fill={k === 0 ? '#111' : '#cbd5e1'}>{x.l}</K>)}
        <Lines y={y + 27} h={16} x2={188} />
        <Lines y={y + 49} h={0} x2={188} />
      </g>
    })}
  </Sheet>
}

function WordsSheet({ list, help }) {
  return <Sheet label="מדפוס לכתב">
    <T x={100} y={14} size={8} weight={900}>מדפוס לכתב: כתבו כל מילה בכתב יד</T>
    <T x={190} y={14} size={4} anchor="start" fill="#666">שם: ____________</T>
    {list.map((w, i) => {
      const y = 26 + i * 30
      return <g key={w + i}>
        <T x={188} y={y + 13} size={11} weight={700} anchor="start">{w}</T>
        <Lines y={y} h={16} x1={12} x2={140} />
        {help && <K x={76} y={y + 15} size={19} fill="#d4d4d8">{w}</K>}
      </g>
    })}
  </Sheet>
}

function StamSheet() {
  return <Sheet label="אותיות סת״ם">
    <T x={100} y={16} size={9} weight={900}>אותיות סת״ם (ספר תורה, תפילין, מזוזה)</T>
    {LETTERS.map((x, i) => {
      const c = i % 6, r = Math.floor(i / 6), cx = 177 - c * 30.8, cy = 26 + r * 47
      return <g key={x.l}>
        <rect x={cx - 14} y={cy} width={28} height={43} rx={3} fill="#fff" stroke="#cbd5e1" strokeWidth=".5" />
        <T x={cx + 9} y={cy + 9} size={7} weight={700} fill="#64748b">{x.l}</T>
        <text x={cx} y={cy + 34} fontSize={22} fontFamily="Stam, serif" textAnchor="middle" direction="rtl">{x.l}</text>
      </g>
    })}
  </Sheet>
}

const groups = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n))
const a4 = (key, svg) => <article className="buga-a4" key={key}><div className="print-art">{svg}</div></article>

export default function CursiveLetters() {
  const [text, setText] = useState('שלום כיתה א')
  const [pick, setPick] = useState(LETTERS[0])
  const [print, setPrint] = useState(null)
  const [which, setWhich] = useState('all')
  const [help, setHelp] = useState('yes')
  const [wordSet, setWordSet] = useState(() => shuffle(WORDS).slice(0, 8))
  const practice = which === 'all' ? LETTERS : LETTERS.filter(x => x.l === which)
  const faq = [
    { q: 'מתי לומדים כתב יד בכיתה א׳?', a: 'ברוב בתי הספר לומדים קודם לקרוא ולכתוב בדפוס, ובסביבות אמצע כיתה א׳ (לפעמים בתחילת כיתה ב׳) עוברים לכתב יד. כדאי לשאול את המורה — ולא למהר לפני שהדפוס יושב טוב.' },
    { q: 'איך עוברים מדפוס לכתב?', a: 'מתחילים מאותיות שדומות בשתי הצורות (ו, ז, ט, ס, ן) וממשיכים לאותיות שמשתנות הרבה (א, ג, ה, ע, ק). בכל יום מתרגלים 2–3 אותיות: קודם מעבירים עיפרון על הדוגמה האפורה, ואחר כך כותבים לבד על השורה. בסוף כותבים מילים שלמות.' },
    { q: 'מה ההבדל בין כתב יד לכתב רהוט?', a: 'בעברית "כתב יד" ו"כתב" הם השמות הנפוצים לאותיות הכתובות שלומדים בבית הספר. בניגוד לאנגלית, בעברית האותיות בכתב יד לא מחוברות זו לזו — כל אות נכתבת לבד.' },
    { q: 'מה זה כתב סת״ם?', a: 'סת״ם הם ראשי התיבות של ספרי תורה, תפילין ומזוזות — הכתב המסורתי שבו הסופר כותב אותם בדיו על קלף. האותיות מרובעות ויש להן "תגים" קטנים למעלה. לומדים להכיר אותו בעיקר לקראת בר ובת מצווה.' },
  ]
  const btn = 'min-h-[48px] rounded-xl px-5 font-bold'
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO counterpartPath={englishCounterpart('/letters/cursive')} title="אותיות בכתב יד — טבלת דפוס וכתב ודפי תרגול להדפסה" description="אותיות בכתב יד בעברית: כל האותיות בדפוס ובכתב זו ליד זו, כולל סופיות, המרת מילים מדפוס לכתב, דפי תרגול כתיבה להדפסה לכיתה א׳–ב׳ וטבלת אותיות סת״ם. חינם." path="/letters/cursive" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'אותיות בכתב יד' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl mb-2">✍️ אותיות בכתב יד — מדפוס לכתב</h1>
      <p className="mx-auto max-w-2xl font-hand text-xl text-[var(--muted-foreground)]">כל אות בדפוס ובכתב, דפי תרגול להדפסה, ומכונה שהופכת כל מילה לכתב יד.</p>
    </header>

    <section className="grid items-center gap-6 rounded-3xl border-[3px] border-slate-800 bg-white p-5 sketch-shadow md:grid-cols-[1fr_1.4fr]">
      <div className="text-center">
        <div className="flex items-end justify-center gap-6">
          <div><span className="block text-8xl font-bold leading-[1.4]">{pick.l}</span><p className="m-0 text-sm text-[var(--muted-foreground)]">דפוס</p></div>
          <span className="text-4xl text-[var(--muted-foreground)]">←</span>
          <div><span className="font-ktav block text-8xl leading-[1.4] text-[var(--accent)]">{pick.l}</span><p className="m-0 text-sm text-[var(--muted-foreground)]">כתב</p></div>
        </div>
        <p className="mt-3 text-2xl font-bold">{pick.name} <button type="button" onClick={() => speak(pick.name)} className="min-h-[40px] rounded-full border-2 border-[var(--border)] bg-white px-3" aria-label={`השמעת ${pick.name}`}>🔊</button></p>
        {pick.slug && <Link to={`/letters/${pick.slug}`} className="underline">כל מה שצריך לדעת על האות {pick.l} ←</Link>}
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
        {LETTERS.map(x => <button key={x.l} type="button" onClick={() => setPick(x)} aria-pressed={pick.l === x.l} aria-label={`${x.name} בכתב`}
          className={`flex flex-col items-center rounded-xl border-2 p-1 ${pick.l === x.l ? 'border-[var(--accent)] bg-[var(--postit)]' : 'border-slate-300 bg-white'} ${x.final ? 'bg-fuchsia-50' : ''}`}>
          <span className="text-sm text-[var(--muted-foreground)]">{x.l}</span><span className="font-ktav text-4xl leading-tight">{x.l}</span>
        </button>)}
      </div>
    </section>

    <section className="mt-8 rounded-3xl border-2 border-dashed border-[var(--border)] bg-white p-5 text-center">
      <h2 className="mb-2 text-2xl font-bold">🪄 מדפוס לכתב: כתבו מילה וראו אותה בכתב יד</h2>
      <input value={text} onChange={e => setText(e.target.value.slice(0, 40))} className="w-full max-w-md rounded-xl border-2 border-[var(--border)] px-4 py-2 text-2xl text-center" aria-label="מילה או משפט בדפוס" />
      <p className="font-ktav mt-3 mb-0 min-h-[1.3em] text-6xl leading-snug text-[var(--accent)]" aria-live="polite">{text || ' '}</p>
    </section>

    <section className="mt-8 text-center">
      <h2 className="mb-3 text-3xl font-bold">🖨️ דפים להדפסה</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border-2 border-[var(--border)] bg-yellow-50 p-4">
          <h3 className="text-xl font-bold">טבלת אותיות דפוס וכתב</h3>
          <p className="text-sm">כל 27 האותיות בדף אחד — לתלות ליד שולחן העבודה.</p>
          <button type="button" data-print-main onClick={() => setPrint('chart')} className={`${btn} bg-red-500 text-white`}>🖨️ להדפסה</button>
        </div>
        <div className="rounded-2xl border-2 border-[var(--border)] bg-cyan-50 p-4">
          <h3 className="text-xl font-bold">תרגול כתיבת אותיות בכתב</h3>
          <select value={which} onChange={e => setWhich(e.target.value)} className="mb-2 min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3 font-bold" aria-label="איזו אות לתרגל">
            <option value="all">כל האותיות (7 דפים)</option>
            {LETTERS.map(x => <option key={x.l} value={x.l}>האות {x.l}</option>)}
          </select>
          <div><button type="button" onClick={() => setPrint('practice')} className={`${btn} bg-red-500 text-white`}>🖨️ להדפסה</button></div>
        </div>
        <div className="rounded-2xl border-2 border-[var(--border)] bg-pink-50 p-4">
          <h3 className="text-xl font-bold">מדפוס לכתב — מילים</h3>
          <p className="text-sm">8 מילים בדפוס, ושורה לכתוב אותן בכתב.</p>
          <Choice value={help} onChange={setHelp} label="עזרה" options={[['yes', 'עם עזרה אפורה'], ['no', 'בלי עזרה']]} />
          <button type="button" onClick={() => setPrint('words')} className={`${btn} mt-2 bg-red-500 text-white`}>🖨️ להדפסה</button>
        </div>
      </div>
    </section>

    <section className="mt-10 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5">
      <h2 className="mb-2 text-2xl font-bold">📜 ומה זה כתב סת״ם?</h2>
      <p>סת״ם = <b>ס</b>פרי תורה, <b>ת</b>פילין ו<b>מ</b>זוזות. זה הכתב שבו כותב הסופר בדיו על קלף. האותיות מרובעות ועל חלק מהן יש "תגים" — קווים קטנים למעלה.</p>
      <p className="font-stam text-center text-5xl leading-relaxed" dir="rtl">{HEBREW.map(x => x.l).join(' ')}</p>
      <div className="text-center"><button type="button" onClick={() => setPrint('stam')} className={`${btn} border-2 border-slate-800 bg-white`}>🖨️ טבלת אותיות סת״ם להדפסה</button></div>
    </section>

    {print === 'chart' && <PrintPreview title="אותיות דפוס וכתב" onClose={() => setPrint(null)}>{a4('c', <ChartSheet />)}</PrintPreview>}
    {print === 'practice' && <PrintPreview title="תרגול כתב יד" onClose={() => setPrint(null)}>{groups(practice, 4).map((g, i) => a4(i, <PracticeSheet letters={g} />))}</PrintPreview>}
    {print === 'words' && <PrintPreview title="מדפוס לכתב" onClose={() => setPrint(null)} onRefresh={() => setWordSet(shuffle(WORDS).slice(0, 8))}
      variant={i => a4(`w${i}`, <WordsSheet list={shuffle(WORDS).slice(0, 8)} help={help === 'yes'} />)}>{a4('w', <WordsSheet list={wordSet} help={help === 'yes'} />)}</PrintPreview>}
    {print === 'stam' && <PrintPreview title="אותיות סת״ם" onClose={() => setPrint(null)}>{a4('s', <StamSheet />)}</PrintPreview>}

    <div className="mt-12"><SeoBody paragraphs={[
      'בכיתה א׳ לומדים קודם לקרוא ולכתוב בכתב דפוס, ובהמשך עוברים לכתב יד — האותיות שכותבים במחברת. חלק מהאותיות כמעט לא משתנות (ו, ז, ס), וחלק נראות אחרת לגמרי (א, ג, ה, ע, ק). לכן כדאי לראות את שתי הצורות זו ליד זו, ולתרגל אות אחרי אות.',
      'בעמוד הזה יש טבלה של כל האותיות בדפוס ובכתב — כולל חמש האותיות הסופיות ך ם ן ף ץ. לחיצה על אות מגדילה אותה ומשמיעה את שמה. במכונת "מדפוס לכתב" מקלידים כל מילה, למשל את השם של הילד, ורואים איך כותבים אותה בכתב יד.',
      'דפי התרגול להדפסה בנויים כמו מחברת של כיתה א׳: אות לדוגמה, אותיות אפורות להעביר עליהן עיפרון, ושורה ריקה לכתוב לבד. בדף "מדפוס לכתב" יש מילים בדפוס ושורה להעתיק אותן בכתב — עם עזרה אפורה או בלעדיה, וכל הדפסה מביאה מילים אחרות.',
    ]} faq={faq} related={[{ label: 'לימוד אותיות בדפוס', href: '/letters' }, { label: 'סרגל אותיות להדפסה', href: '/printables/letter-strip' }, { label: 'אותיות סופיות', href: '/letters/final' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }]} /></div>
  </div>
}

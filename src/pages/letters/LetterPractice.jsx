import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet, T } from '../../components/printables/PrintableShell'
import { speak } from '../../utils/speak'
import { HEBREW } from '../../data/letterLearning'
import { KAMATZ, PATACH, SYL_LETTERS, syl, NIKUD_WORDS } from '../../data/letterSkills'

// Three first-grade reading skills, each a short game + printable worksheet:
// /letters/sounds (opening / closing sound), /letters/nikud (kamatz & patach), /letters/final (ך ם ן ף ץ).

const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
const BASE = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const ALL = [...'אבגדהוזחטיכלמנסעפצקרשת']
const a4 = (key, svg) => <article className="buga-a4" key={key}><div className="print-art">{svg}</div></article>
const page = 'mx-auto max-w-5xl px-4 py-8 buga-fade-in'
const card = 'rounded-3xl border-[3px] border-slate-800 bg-white p-5 sketch-shadow'
const choiceBtn = 'min-h-[64px] min-w-[72px] rounded-2xl border-[3px] px-4 text-4xl font-bold transition-transform hover:-translate-y-0.5'

function useRound(make) {
  const [q, setQ] = useState(make)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState({ ok: 0, all: 0 })
  const answer = v => { if (picked) return; setPicked(v); setScore(s => ({ ok: s.ok + (v === q.answer ? 1 : 0), all: s.all + 1 })) }
  const next = () => { setPicked(null); setQ(make()) }
  return { q, picked, score, answer, next, reset: fresh => { setScore({ ok: 0, all: 0 }); setPicked(null); setQ(fresh) } }
}
function Feedback({ r, children }) {
  if (!r.picked) return <p className="mt-3 mb-0 text-center text-[var(--muted-foreground)]">{r.score.all ? `${r.score.ok} מתוך ${r.score.all}` : ' '}</p>
  const ok = r.picked === r.q.answer
  return <div className="mt-4 text-center">
    <p className={`m-0 text-2xl font-bold ${ok ? 'text-green-700' : 'text-red-600'}`}>{ok ? '👏 נכון!' : '🙈 כמעט…'} {children}</p>
    <button type="button" onClick={r.next} className="mt-2 min-h-[48px] rounded-xl bg-[var(--accent)] px-6 font-bold text-white">הבא ←</button>
    <p className="mt-1 mb-0 text-sm text-[var(--muted-foreground)]">{r.score.ok} מתוך {r.score.all}</p>
  </div>
}
const optClass = (r, v) => r.picked ? (v === r.q.answer ? 'border-green-600 bg-green-100' : v === r.picked ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white opacity-60') : 'border-slate-800 bg-white'

// ── Opening / closing sound ──────────────────────────────────────────────────
const WORDS = HEBREW.flatMap(x => x.words.map(([w, e, v]) => ({ w, e, v: v || w })))
const firstOf = w => w[0]
const lastOf = w => BASE[w.at(-1)] || w.at(-1)
const CLOSING = WORDS.filter(x => !'האוי'.includes(lastOf(x.w)))
function soundQ(mode) {
  const pool = mode === 'open' ? WORDS : CLOSING
  const item = pool[Math.floor(Math.random() * pool.length)]
  const answer = mode === 'open' ? firstOf(item.w) : lastOf(item.w)
  return { item, answer, opts: shuffle([answer, ...shuffle(ALL.filter(l => l !== answer && l !== 'א' && l !== 'ה')).slice(0, 2)]) }
}
function SoundsSheet({ mode, items }) {
  return <Sheet label="צליל פותח">
    <T x={100} y={15} size={8.5} weight={900}>{mode === 'open' ? 'צליל פותח: הקיפו את האות שבה מתחילה המילה' : 'צליל סוגר: הקיפו את האות שבה נגמרת המילה'}</T>
    <T x={190} y={24} size={4} anchor="start" fill="#666">שם: ____________</T>
    {items.map((q, i) => {
      const c = i % 2, r = Math.floor(i / 2), x = 150 - c * 100, y = 34 + r * 46
      return <g key={i}>
        <rect x={x - 44} y={y} width={88} height={41} rx={5} fill="#fff" stroke="#cbd5e1" strokeWidth=".6" />
        <text x={x + 26} y={y + 27} fontSize={22} textAnchor="middle">{q.item.e}</text>
        {q.opts.map((l, k) => <g key={l}><circle cx={x - 26 + k * 17} cy={y + 20} r={7} fill="none" stroke="#e2e8f0" strokeWidth=".5" /><T x={x - 26 + k * 17} y={y + 24} size={10} weight={700}>{l}</T></g>)}
      </g>
    })}
  </Sheet>
}
const soundSet = mode => Array.from({ length: 10 }, () => soundQ(mode))

export function OpeningSounds() {
  const [mode, setMode] = useState('open')
  const r = useRound(() => soundQ(mode))
  const [print, setPrint] = useState(null)
  const switchMode = m => { setMode(m); r.reset(soundQ(m)) }
  const faq = [
    { q: 'מה זה צליל פותח?', a: 'הצליל הראשון ששומעים במילה. במילה "דג" הצליל הפותח הוא ד׳. זיהוי צליל פותח הוא אחד הדברים הראשונים שבודקים במוכנות לכיתה א׳ — הוא מראה שהילד מתחיל "לשמוע" את האותיות בתוך המילים.' },
    { q: 'ומה זה צליל סוגר?', a: 'הצליל האחרון במילה: ב"שולחן" הצליל הסוגר הוא נ׳ (שנכתבת כאן כ־ן סופית). צליל סוגר קשה יותר מצליל פותח, ולכן מתרגלים אותו אחרי שהצליל הפותח כבר קל.' },
    { q: 'איך מתרגלים צלילים בבית?', a: 'משחק "אני מרגל": "אני רואה משהו שמתחיל בצליל מְ…". או משחק שרשרת: כל אחד אומר מילה שמתחילה בצליל שבו נגמרה המילה הקודמת. חשוב להגיד את הצליל (מְ) ולא את שם האות (מֵם).' },
  ]
  return <div className={page} dir="rtl">
    <SEO title="צליל פותח וצליל סוגר — משחק ודפי עבודה להכנה לכיתה א׳" description="משחק צליל פותח וצליל סוגר בעברית: שומעים מילה, רואים תמונה ובוחרים באיזו אות היא מתחילה או נגמרת. עם דפי עבודה להדפסה שמתחלפים בכל פעם — לגן חובה ולכיתה א׳." path="/letters/sounds" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'צליל פותח וסוגר' }]} />
    <header className="mb-5 text-center">
      <h1 className="text-4xl sm:text-5xl mb-2">👂 צליל פותח וצליל סוגר</h1>
      <p className="mx-auto max-w-2xl font-hand text-xl text-[var(--muted-foreground)]">מקשיבים למילה ובוחרים: באיזו אות היא {mode === 'open' ? 'מתחילה' : 'נגמרת'}?</p>
    </header>
    <div className="mb-4 flex justify-center gap-2">
      {[['open', '🔜 צליל פותח'], ['close', '🔚 צליל סוגר']].map(([m, l]) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => switchMode(m)} className={`min-h-[48px] rounded-xl border-2 border-[var(--border)] px-5 font-bold ${mode === m ? 'bg-[var(--yellow)]' : 'bg-white'}`}>{l}</button>)}
    </div>
    <section className={`${card} text-center`}>
      <button type="button" onClick={() => speak(r.q.item.v)} className="mx-auto block text-8xl leading-none" aria-label="השמעת המילה">{r.q.item.e}</button>
      <button type="button" onClick={() => speak(r.q.item.v)} className="mt-2 min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-4 font-bold">🔊 שמעו את המילה</button>
      <div className="mt-4 flex justify-center gap-3">{r.q.opts.map(l => <button key={l} type="button" onClick={() => { r.answer(l); speak(r.q.item.v, 'he-IL', { user: false }) }} className={`${choiceBtn} ${optClass(r, l)}`}>{l}</button>)}</div>
      <Feedback r={r}><span className="text-3xl">{r.q.item.w}</span></Feedback>
    </section>
    <div className="mt-5 flex flex-wrap justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrint(soundSet(mode))} className="min-h-[48px] rounded-xl bg-red-500 px-6 font-bold text-white">🖨️ דף עבודה {mode === 'open' ? 'צליל פותח' : 'צליל סוגר'}</button>
      <Link to="/letters/game" className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-slate-800 bg-cyan-100 px-5 font-bold">🎮 עוד משחקי אותיות ←</Link>
    </div>
    {print && <PrintPreview title={mode === 'open' ? 'צליל פותח' : 'צליל סוגר'} onClose={() => setPrint(null)} onRefresh={() => setPrint(soundSet(mode))}
      variant={i => a4(`s${i}`, <SoundsSheet mode={mode} items={soundSet(mode)} />)}>{a4('s', <SoundsSheet mode={mode} items={print} />)}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={[
      'מודעות פונולוגית — היכולת לשמוע את הצלילים שבתוך מילה — היא הבסיס לקריאה. ילד ששומע ש"דג" מתחיל בצליל דְ, מוכן לחבר בין הצליל לאות ד׳ ולקרוא. לכן צליל פותח וצליל סוגר הם חלק קבוע בהכנה לכיתה א׳ ובחודשים הראשונים של כיתה א׳.',
      'במשחק כאן רואים תמונה, שומעים את המילה ובוחרים אחת משלוש אותיות. במצב "צליל סוגר" בוחרים את האות שבה המילה נגמרת. דפי העבודה להדפסה מתחלפים בכל לחיצה: עשר תמונות, ובכל אחת מקיפים את האות הנכונה.',
    ]} faq={faq} related={[{ label: 'לימוד אותיות', href: '/letters' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'קמץ ופתח', href: '/letters/nikud' }, { label: 'שיר האותיות', href: '/letters/song' }]} /></div>
  </div>
}

// ── Kamatz & patach ──────────────────────────────────────────────────────────
function nikudQ() {
  const [w, e] = NIKUD_WORDS[Math.floor(Math.random() * NIKUD_WORDS.length)]
  return { w, answer: e, opts: shuffle([e, ...shuffle(NIKUD_WORDS.filter(x => x[1] !== e)).slice(0, 2).map(x => x[1])]) }
}
function SyllablesSheet() {
  return <Sheet label="קמץ ופתח — הברות">
    <T x={100} y={15} size={8.5} weight={900}>קוראים הברות: קָמָץ ופַתָּח</T>
    <T x={100} y={23} size={4.5} fill="#555">קָמָץ ( ָ ) ופַתָּח ( ַ ) נשמעים אותו דבר: "אַ"</T>
    {SYL_LETTERS.map((l, i) => {
      const c = i % 4, r = Math.floor(i / 4), x = 172 - c * 48, y = 32 + r * 38
      return <g key={l}><rect x={x - 22} y={y} width={44} height={33} rx={4} fill={i % 2 ? '#fef9c3' : '#e0f2fe'} />
        <T x={x + 10} y={y + 22} size={15} weight={700}>{syl(l, KAMATZ)}</T><T x={x - 10} y={y + 22} size={15} weight={700} fill="#7548b3">{syl(l, PATACH)}</T></g>
    })}
  </Sheet>
}
function MatchSheet({ words }) {
  const pics = shuffle(words)
  return <Sheet label="קוראים ומחברים">
    <T x={100} y={15} size={8.5} weight={900}>קוראים את המילה ומחברים בקו לתמונה</T>
    <T x={190} y={24} size={4} anchor="start" fill="#666">שם: ____________</T>
    {words.map(([w], i) => <g key={w}><T x={170} y={48 + i * 27} size={14} weight={700}>{w}</T><circle cx={146} cy={44 + i * 27} r={1.6} fill="#111" /></g>)}
    {pics.map(([, e], i) => <g key={e}><circle cx={64} cy={44 + i * 27} r={1.6} fill="#111" /><text x={40} y={52 + i * 27} fontSize={18} textAnchor="middle">{e}</text></g>)}
  </Sheet>
}
const matchSet = () => shuffle(NIKUD_WORDS).slice(0, 8)

export function NikudKamatzPatach() {
  const r = useRound(nikudQ)
  const [mark, setMark] = useState(KAMATZ)
  const [print, setPrint] = useState(null)
  const faq = [
    { q: 'מה ההבדל בין קמץ לפתח?', a: 'בעברית של היום אין הבדל בהגייה — שניהם נשמעים "אַ". ההבדל הוא רק בצורה: פתח הוא קו קטן מתחת לאות ( ַ ), וקמץ הוא קו עם "רגל" קטנה באמצע ( ָ ). לכן מלמדים אותם יחד, ככה שהילד לומד לזהות את שתי הצורות.' },
    { q: 'למה מתחילים ללמוד ניקוד מקמץ ופתח?', a: 'כי "אַ" הוא הצליל הפשוט והנפוץ ביותר, ואפשר כבר לקרוא איתו מילים אמיתיות: דָּג, יָם, גַּן, אַבָּא. אחרי קמץ ופתח בדרך כלל ממשיכים לחיריק ( ִ ), לסגול וצירה, לחולם ולשורוק וקובוץ.' },
    { q: 'איך מתרגלים קריאת הברות?', a: 'מצביעים על הברה ואומרים אותה יחד: בָּ, גָּ, דָּ. אחר כך מחברים שתי הברות למילה: גָּ+מָל = גָּמָל. עשר דקות ביום מספיקות — עדיף מעט וכל יום.' },
  ]
  return <div className={page} dir="rtl">
    <SEO title="קמץ ופתח — קריאה ראשונה בניקוד לכיתה א׳ (משחק ודפי עבודה)" description="לומדים לקרוא עם קמץ ופתח: טבלת הברות עם השמעה, משחק קריאת מילים עם תמונות (דָּג, יָם, גָּמָל, בָּנָנָה) ודפי עבודה להדפסה. ניקוד לכיתה א׳ ולהכנה לכיתה א׳, בחינם." path="/letters/nikud" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'קמץ ופתח' }]} />
    <header className="mb-5 text-center">
      <h1 className="text-4xl sm:text-5xl mb-2">🔡 קמץ ופתח — קוראים עם ניקוד</h1>
      <p className="mx-auto max-w-2xl font-hand text-xl text-[var(--muted-foreground)]">קָמָץ ( ָ ) ופַתָּח ( ַ ) — שני סימנים, צליל אחד: "אַ"</p>
    </header>
    <section className={card}>
      <h2 className="mb-3 text-center text-2xl font-bold">1. הברות: לוחצים ושומעים</h2>
      <div className="mb-3 flex justify-center gap-2">
        <button type="button" aria-pressed={mark === KAMATZ} onClick={() => setMark(KAMATZ)} className={`min-h-[44px] rounded-xl border-2 border-[var(--border)] px-4 font-bold ${mark === KAMATZ ? 'bg-[var(--yellow)]' : 'bg-white'}`}>קָמָץ  ָ</button>
        <button type="button" aria-pressed={mark === PATACH} onClick={() => setMark(PATACH)} className={`min-h-[44px] rounded-xl border-2 border-[var(--border)] px-4 font-bold ${mark === PATACH ? 'bg-[var(--yellow)]' : 'bg-white'}`}>פַּתָּח  ַ</button>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
        {SYL_LETTERS.map(l => <button key={l} type="button" onClick={() => speak(syl(l, mark))} className="min-h-[64px] rounded-xl border-2 border-slate-300 bg-white text-4xl font-bold hover:bg-[var(--postit)]">{syl(l, mark)}</button>)}
      </div>
    </section>
    <section className={`${card} mt-6 text-center`}>
      <h2 className="mb-2 text-2xl font-bold">2. קוראים מילה — ובוחרים תמונה</h2>
      <p className="m-0 text-7xl font-bold">{r.q.w}</p>
      <button type="button" onClick={() => speak(r.q.w)} className="mt-2 min-h-[40px] rounded-xl border-2 border-[var(--border)] bg-white px-3 text-sm font-bold">🔊 עזרה: שמעו את המילה</button>
      <div className="mt-4 flex justify-center gap-3">{r.q.opts.map(e => <button key={e} type="button" onClick={() => r.answer(e)} className={`${choiceBtn} text-5xl ${optClass(r, e)}`}>{e}</button>)}</div>
      <Feedback r={r} />
    </section>
    <div className="mt-5 flex flex-wrap justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrint({ kind: 'syl' })} className="min-h-[48px] rounded-xl bg-red-500 px-6 font-bold text-white">🖨️ טבלת הברות</button>
      <button type="button" onClick={() => setPrint({ kind: 'match', words: matchSet() })} className="min-h-[48px] rounded-xl bg-red-500 px-6 font-bold text-white">🖨️ דף "קוראים ומחברים"</button>
    </div>
    {print?.kind === 'syl' && <PrintPreview title="קמץ ופתח — הברות" onClose={() => setPrint(null)}>{a4('y', <SyllablesSheet />)}</PrintPreview>}
    {print?.kind === 'match' && <PrintPreview title="קוראים ומחברים" onClose={() => setPrint(null)} onRefresh={() => setPrint({ kind: 'match', words: matchSet() })}
      variant={i => a4(`m${i}`, <MatchSheet words={matchSet()} />)}>{a4('m', <MatchSheet words={print.words} />)}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={[
      'קמץ ופתח הם סימני הניקוד הראשונים שלומדים בכיתה א׳. שניהם נשמעים "אַ", ולכן הם מאפשרים כבר בשבועות הראשונים לקרוא מילים שלמות: דָּג, יָם, גַּן, חָלָב, בָּנָנָה. ההצלחה הראשונה בקריאת מילה אמיתית היא רגע גדול — וכדאי להגיע אליו מהר.',
      'בעמוד הזה יש טבלת הברות: כל אות עם קמץ או עם פתח, ולחיצה משמיעה אותה. אחר כך משחק קריאה: מופיעה מילה מנוקדת, קוראים אותה ובוחרים את התמונה המתאימה. להדפסה יש טבלת הברות ודף "קוראים ומחברים" שמתחלף בכל פעם.',
    ]} faq={faq} related={[{ label: 'צליל פותח וסוגר', href: '/letters/sounds' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'הבנת הנקרא', href: '/learn/reading' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }]} /></div>
  </div>
}

// ── Final letters ────────────────────────────────────────────────────────────
const PAIRS = [['כ', 'ך'], ['מ', 'ם'], ['נ', 'ן'], ['פ', 'ף'], ['צ', 'ץ']]
const FINAL_WORDS = ['מלך', 'דרך', 'חושך', 'שלום', 'ים', 'לחם', 'גשם', 'גן', 'בלון', 'לימון', 'שולחן', 'כף', 'עוף', 'ינשוף', 'חורף', 'עץ', 'קיץ', 'ארץ', 'מיץ', 'כלב', 'כדור', 'מכונית', 'נחש', 'נמר', 'פרפר', 'פיל', 'צב', 'צפרדע', 'ממתק', 'מכנסיים', 'תפוח', 'שמש', 'ספר', 'אמא', 'גמל', 'חנות']
const pairOf = l => PAIRS.find(p => p.includes(l))
function finalQ() {
  for (;;) {
    const w = FINAL_WORDS[Math.floor(Math.random() * FINAL_WORDS.length)]
    const idx = shuffle([...w].map((c, i) => (pairOf(c) ? i : -1)).filter(i => i >= 0))[0]
    if (idx == null) continue
    const pair = pairOf(w[idx])
    return { w, idx, answer: w[idx], opts: pair }
  }
}
function FinalSheet({ items }) {
  return <Sheet label="אותיות סופיות">
    <T x={100} y={15} size={8.5} weight={900}>אות רגילה או סופית? השלימו את המילה</T>
    <T x={100} y={23} size={4.5} fill="#555">כ–ך · מ–ם · נ–ן · פ–ף · צ–ץ — האות הסופית באה רק בסוף המילה</T>
    {items.map((q, i) => {
      const c = i % 2, r = Math.floor(i / 2), x = 150 - c * 100, y = 34 + r * 37
      const shown = [...q.w].map((ch, k) => (k === q.idx ? '_' : ch)).join('')
      return <g key={i}><rect x={x - 44} y={y} width={88} height={32} rx={5} fill="#fff" stroke="#cbd5e1" strokeWidth=".6" />
        <T x={x + 14} y={y + 21} size={14} weight={700}>{shown}</T>
        <T x={x - 30} y={y + 20} size={8} fill="#64748b">{q.opts.join('  /  ')}</T></g>
    })}
  </Sheet>
}
const finalSet = () => Array.from({ length: 12 }, finalQ)

export function FinalLetters() {
  const r = useRound(finalQ)
  const [print, setPrint] = useState(null)
  const faq = [
    { q: 'מהן האותיות הסופיות?', a: 'חמש אותיות שנכתבות אחרת כשהן בסוף מילה: כ–ך, מ–ם, נ–ן, פ–ף, צ–ץ. סימן לזכור: "כמנפ״ץ". הצליל לא משתנה — רק הצורה.' },
    { q: 'איך זוכרים מתי כותבים אות סופית?', a: 'הכלל פשוט: אות סופית באה רק בסוף מילה, ואף פעם לא בהתחלה או באמצע. במילה "מים" יש מ׳ רגילה בהתחלה ו־ם סופית בסוף. ך, ן, ף ו־ץ יורדות מתחת לשורה, ו־ם סגורה מכל הצדדים.' },
    { q: 'מתי לומדים אותיות סופיות?', a: 'בכיתה א׳, בדרך כלל אחרי שמכירים את רוב האותיות הרגילות. הן מופיעות כבר במילים הראשונות שהילדים כותבים — שלום, גן, ים — ולכן כדאי להכיר אותן מוקדם.' },
  ]
  const shown = [...r.q.w].map((ch, k) => (k === r.q.idx ? (r.picked ? r.q.answer : '_') : ch)).join('')
  return <div className={page} dir="rtl">
    <SEO title="אותיות סופיות — ך ם ן ף ץ: משחק ודפי עבודה לכיתה א׳" description="אותיות סופיות בעברית (כמנפ״ץ): מה הן, מתי כותבים אותן, משחק השלמת מילים — אות רגילה או סופית? — ודפי עבודה להדפסה שמתחלפים. לכיתה א׳ ולהכנה לכיתה א׳." path="/letters/final" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'אותיות סופיות' }]} />
    <header className="mb-5 text-center">
      <h1 className="text-4xl sm:text-5xl mb-2">🔚 אותיות סופיות — ך ם ן ף ץ</h1>
      <p className="mx-auto max-w-2xl font-hand text-xl text-[var(--muted-foreground)]">חמש אותיות שמחליפות צורה בסוף המילה. זוכרים: כמנפ״ץ!</p>
    </header>
    <div className="mb-6 grid grid-cols-5 gap-2">
      {PAIRS.map(([a, b]) => <div key={a} className="rounded-2xl border-2 border-slate-800 bg-white p-2 text-center sketch-shadow-sm"><span className="text-4xl font-bold">{a}</span><span className="mx-1 text-xl text-[var(--muted-foreground)]">←</span><span className="text-4xl font-bold text-[var(--accent)]">{b}</span></div>)}
    </div>
    <section className={`${card} text-center`}>
      <h2 className="mb-2 text-2xl font-bold">איזו אות חסרה — רגילה או סופית?</h2>
      <p className="m-0 text-7xl font-bold tracking-wide">{shown}</p>
      <div className="mt-4 flex justify-center gap-3">{r.q.opts.map(l => <button key={l} type="button" onClick={() => r.answer(l)} className={`${choiceBtn} ${optClass(r, l)}`}>{l}</button>)}</div>
      <Feedback r={r}>{r.q.answer === r.q.opts[1] ? 'בסוף מילה — אות סופית' : 'לא בסוף המילה — אות רגילה'}</Feedback>
    </section>
    <div className="mt-5 flex flex-wrap justify-center gap-3">
      <button type="button" data-print-main onClick={() => setPrint(finalSet())} className="min-h-[48px] rounded-xl bg-red-500 px-6 font-bold text-white">🖨️ דף עבודה: אותיות סופיות</button>
      <Link to="/letters/cursive" className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-slate-800 bg-cyan-100 px-5 font-bold">✍️ סופיות בכתב יד ←</Link>
    </div>
    {print && <PrintPreview title="אותיות סופיות" onClose={() => setPrint(null)} onRefresh={() => setPrint(finalSet())}
      variant={i => a4(`f${i}`, <FinalSheet items={finalSet()} />)}>{a4('f', <FinalSheet items={print} />)}</PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={[
      'בעברית יש חמש אותיות שמשנות צורה כשהן בסוף מילה: כ, מ, נ, פ ו־צ. את הסופיות זוכרים בעזרת המילה "כמנפ״ץ". הצליל נשאר אותו צליל — רק הצורה משתנה: ך, ן, ף ו־ץ יורדות מתחת לשורה, ו־ם סגורה כמו קופסה.',
      'במשחק כאן מופיעה מילה עם אות חסרה, ובוחרים אם להשלים אות רגילה או סופית. לפעמים האות החסרה בהתחלה או באמצע (ואז היא רגילה), ולפעמים בסוף (ואז סופית). בדף העבודה להדפסה יש 12 מילים להשלמה, ובכל הדפסה — מילים אחרות.',
    ]} faq={faq} related={[{ label: 'לימוד אותיות', href: '/letters' }, { label: 'אותיות בכתב יד', href: '/letters/cursive' }, { label: 'סרגל אותיות', href: '/printables/letter-strip' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }]} /></div>
  </div>
}

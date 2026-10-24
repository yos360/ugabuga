import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { Sheet } from '../../components/printables/PrintableShell'
import { speak } from '../../utils/speak'
import SpeechNote from './SpeechNote'
import { SheetsPreview, TextBox } from './speechSheets'
import { CutLines, EMOJI, Guide, LanguageNav, Li, Pills, SheetHeader, Txt, rng } from './languageShared'
import { ANY_BOOK, LEVELS, SCENES, sceneById, whById } from '../../data/speech/whQuestions'
import { shuffleWith } from '../../data/speech/categories'

// /speech/language/wh-questions — "מי, מה, איפה, מתי, למה, איך" on picture scenes drawn here
// (simple shapes + emoji). Questions are graded (who/what → where → when → why/how); the child taps
// an answer (or answers freely in "open question" mode), and every answer comes with a model
// sentence for the adult to expand on. Printables: scene + question cards, general book cards and
// a question die to fold. No scoring.

const PATH = '/speech/language/wh-questions'
const UPDATED = '2026-10-24'
const say = (text, user = true) => speak(text.replace(/[„”]/g, ''), 'he-IL', { rate: 0.85, user })

// ── Scene drawing ───────────────────────────────────────────────────────────

function SceneArt({ scene }) {
  return <g>
    {scene.shapes.map((s, i) => {
      if (s.k === 'rect') return <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.f} stroke={s.s || 'none'} strokeWidth={s.s ? 0.8 : 0} />
      if (s.k === 'ellipse') return <ellipse key={i} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={s.f} stroke={s.s || 'none'} strokeWidth={s.s ? 0.6 : 0} />
      return <path key={i} d={s.d} fill={s.f} stroke={s.s} strokeWidth={s.sw} strokeLinecap="round" strokeLinejoin="round" />
    })}
    {scene.items.map((it, i) => <text key={'e' + i} x={it.x} y={it.y} textAnchor="middle" dominantBaseline="central" fontSize={it.s} fontFamily={EMOJI}>{it.e}</text>)}
  </g>
}

function SceneSvg({ scene, className = '' }) {
  return <svg viewBox="0 0 200 120" role="img" aria-label={`${scene.title}: ${scene.alt}`} className={`block w-full rounded-2xl border-2 border-slate-800 bg-white ${className}`}>
    <SceneArt scene={scene} />
  </svg>
}

const WhBadge = ({ w, big = false }) => {
  const q = whById[w]
  return <span className={`inline-flex items-center gap-1 rounded-full border-2 font-black ${big ? 'px-4 py-1 text-xl' : 'px-2.5 text-sm'}`} style={{ borderColor: q.color[0], background: q.color[1], color: q.color[0] }}>
    <span aria-hidden="true">{q.e}</span>{q.word}
  </span>
}

// ── Interactive ─────────────────────────────────────────────────────────────

function QuestionPlay() {
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const [levels, setLevels] = useState([1, 2])
  const [mode, setMode] = useState('choices')
  const [qi, setQi] = useState(0)
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(false)
  const [showOpts, setShowOpts] = useState(false)
  const [msg, setMsg] = useState('')
  const scene = sceneById[sceneId]
  const questions = scene.questions.filter(q => levels.includes(whById[q.w].level))
  const q = questions[qi % Math.max(1, questions.length)]
  const order = useMemo(() => q ? shuffleWith(q.opts.map((_, i) => i), rng(q.q.length * 31 + qi)) : [], [q, qi])
  const reset = () => { setTried([]); setDone(false); setShowOpts(false); setMsg('') }
  const goScene = id => { setSceneId(id); setQi(0); reset() }
  const toggleLevel = id => { setLevels(l => l.includes(id) ? (l.length > 1 ? l.filter(x => x !== id) : l) : [...l, id].sort()); setQi(0); reset() }
  const next = () => {
    if (qi + 1 < questions.length) { setQi(qi + 1); reset(); return }
    const i = SCENES.findIndex(s => s.id === sceneId)
    goScene(SCENES[(i + 1) % SCENES.length].id)
  }
  const choose = i => {
    if (done) return
    if (i === 0) { setDone(true); setMsg(q.more); say(`${q.opts[0].t}. ${q.more}`) }
    else { setTried(t => [...t, i]); const text = `${q.opts[i].t}? בואו נסתכל שוב בתמונה.`; setMsg(text); say(text) }
  }
  const optsVisible = mode === 'choices' || showOpts || done
  return <div className="space-y-4">
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="בחירת תמונה">
      {SCENES.map(s => <button key={s.id} type="button" aria-pressed={s.id === sceneId} onClick={() => goScene(s.id)}
        className={`min-h-[44px] rounded-full border-2 px-3 font-bold ${s.id === sceneId ? 'border-violet-500 bg-violet-600 text-white' : 'border-[var(--border)] bg-white'}`}>
        <span aria-hidden="true">{s.e} </span>{s.title}</button>)}
    </div>
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="שלבים">
      {LEVELS.map(l => <button key={l.id} type="button" aria-pressed={levels.includes(l.id)} onClick={() => toggleLevel(l.id)}
        className={`min-h-[44px] rounded-full border-2 px-3 text-sm font-bold ${levels.includes(l.id) ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white text-slate-500'}`}>{l.label}</button>)}
    </div>
    <Pills label="איך עונים" value={mode} onChange={v => { setMode(v); reset() }} tone="soft"
      options={[['choices', '👆 בוחרים תשובה מתוך 3'], ['open', '🗣️ שאלה פתוחה (אפשרויות רק כרמז)']]} />
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <SceneSvg scene={scene} />
      {q && <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm">
        <p className="mb-2 text-sm font-bold text-[var(--muted-foreground)]">שאלה {qi + 1} מתוך {questions.length} · {scene.title}</p>
        <WhBadge w={q.w} big />
        <h3 className="mt-2 text-2xl font-black leading-snug">{q.q}</h3>
        <button type="button" onClick={() => say(q.q)} className="mt-2 min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">🔊 הקראת השאלה</button>
        {optsVisible
          ? <div className="mt-3 grid gap-2">
            {order.map(i => {
              const o = q.opts[i]
              const st = done && i === 0 ? 'border-emerald-500 bg-emerald-50' : tried.includes(i) ? 'border-slate-300 bg-slate-50 opacity-60' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'
              return <button key={i} type="button" onClick={() => choose(i)} className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border-2 px-3 text-lg font-bold ${st}`}>
                {o.e && <span aria-hidden="true" className="text-3xl">{o.e}</span>}{o.t}</button>
            })}
          </div>
          : <div className="mt-3 space-y-2">
            <p className="text-[var(--muted-foreground)]">הילד/ה עונה במילים שלו/ה, בהצבעה על התמונה או בתנועה. המבוגר מרחיב את התשובה.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => setShowOpts(true)} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-[var(--postit)] px-4 font-bold">💡 רמז: 3 אפשרויות</button>
              <button type="button" onClick={() => { setDone(true); setMsg(q.more) }} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">👀 תשובה לדוגמה</button>
            </div>
          </div>}
        <p className="mt-3 min-h-[3rem] font-bold leading-relaxed" aria-live="polite">{msg}</p>
        <button type="button" onClick={next} className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>
          {qi + 1 < questions.length ? (done ? 'לשאלה הבאה ←' : 'דילוג ←') : 'לתמונה הבאה ←'}</button>
      </div>}
    </div>
  </div>
}

// ── Printables ──────────────────────────────────────────────────────────────

// A question card: coloured question-word badge (with its emoji, so it reads in black-and-white too) and the question.
function QCard({ x, y, w, h, wh, text }) {
  const q = whById[wh]
  return <g>
    <rect x={x + 1.5} y={y + 1.5} width={w - 3} height={h - 3} rx={3} fill="#fff" stroke={q.color[0]} strokeWidth=".7" />
    <rect x={x + w - 31} y={y + 4} width={27} height={9} rx={4.5} fill={q.color[1]} stroke={q.color[0]} strokeWidth=".5" />
    <text x={x + w - 8.5} y={y + 8.6} textAnchor="middle" dominantBaseline="central" fontSize={5} fontFamily={EMOJI}>{q.e}</text>
    <Txt x={x + w - 20.5} y={y + 10.3} size={4.4} weight={900} fill={q.color[0]}>{q.word}</Txt>
    <TextBox x={x + 4} y={y + 13} w={w - 8} h={h - 16} text={text} max={5.2} maxLines={3} />
  </g>
}

function sceneSheet(scene) {
  const qs = scene.questions.slice(0, 8)
  const cw = 94, ch = 29.5
  const cells = qs.map((q, i) => ({ q, x: 6 + 188 - ((i % 2) + 1) * cw, y: 146 + Math.floor(i / 2) * ch, w: cw, h: ch }))
  return {
    key: `scene-${scene.id}`,
    svg: <Sheet label={`תמונה ושאלות: ${scene.title}`}>
      <SheetHeader title={`${scene.title} — מסתכלים, שואלים ועונים`} note="מתחילים בשאלות מי ומה, ומתקדמים לאיפה, מתי, למה ואיך" />
      <rect x={10} y={20} width={180} height={108} rx={4} fill="#fff" stroke="#111" strokeWidth=".8" />
      <svg x={10.5} y={20.5} width={179} height={107} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet"><SceneArt scene={scene} /></svg>
      <Txt x={100} y={140} size={3.4} weight={700} fill="#374151">✂ כרטיסי שאלות לגזירה</Txt>
      <CutLines cells={cells} />
      {cells.map((c, i) => <QCard key={i} x={c.x} y={c.y} w={c.w} h={c.h} wh={c.q.w} text={c.q.q} />)}
    </Sheet>,
  }
}

function bookCardsSheet() {
  const cw = 94, ch = 39
  const cells = ANY_BOOK.map((c, i) => ({ c, x: 6 + 188 - ((i % 2) + 1) * cw, y: 22 + Math.floor(i / 2) * ch, w: cw, h: ch }))
  return {
    key: 'book-cards',
    svg: <Sheet label="כרטיסי שאלות לכל ספר ותמונה">
      <SheetHeader title="כרטיסי שאלות לכל ספר ותמונה" note="✂ גוזרים, שולפים כרטיס בזמן קריאת ספר או הסתכלות בתמונה — ושואלים" />
      <CutLines cells={cells} />
      {cells.map((x, i) => <QCard key={i} x={x.x} y={x.y} w={x.w} h={x.h} wh={x.c.w} text={x.c.t} />)}
    </Sheet>,
  }
}

// A cube net (cross shape) with the six question words and glue tabs.
function diceSheet() {
  const s = 48, cx = 76
  const faces = [
    ['what', cx, 26], ['who', cx, 26 + s], ['where', cx, 26 + 2 * s], ['when', cx, 26 + 3 * s],
    ['why', cx - s, 26 + s], ['how', cx + s, 26 + s],
  ]
  const tab = (x1, y1, x2, y2, nx, ny, d = 7) => {
    const tx = (x2 - x1) / Math.hypot(x2 - x1, y2 - y1), ty = (y2 - y1) / Math.hypot(x2 - x1, y2 - y1)
    const pts = [[x1, y1], [x1 + nx * d + tx * d, y1 + ny * d + ty * d], [x2 + nx * d - tx * d, y2 + ny * d - ty * d], [x2, y2]]
    return <polygon points={pts.map(p => p.map(v => v.toFixed(2)).join(',')).join(' ')} fill="#f3f4f6" stroke="#111" strokeWidth=".5" />
  }
  const A = 26, C = 26 + 2 * s, D = 26 + 3 * s
  return {
    key: 'dice',
    svg: <Sheet label="קוביית שאלות לגזירה ולקיפול">
      <SheetHeader title="קוביית השאלות" note="גוזרים לאורך הקו החיצוני, מקפלים בכל הקווים ומדביקים את הלשוניות האפורות" />
      {tab(cx, A, cx + s, A, 0, -1)}{tab(cx, A, cx, A + s, -1, 0)}{tab(cx + s, A, cx + s, A + s, 1, 0)}
      {tab(cx, C, cx, C + s, -1, 0)}{tab(cx + s, C, cx + s, C + s, 1, 0)}
      {tab(cx, D, cx, D + s, -1, 0)}{tab(cx + s, D, cx + s, D + s, 1, 0)}
      {faces.map(([w, x, y]) => {
        const q = whById[w]
        return <g key={w}>
          <rect x={x} y={y} width={s} height={s} fill={q.color[1]} stroke="#111" strokeWidth=".7" />
          <text x={x + s / 2} y={y + s * 0.38} textAnchor="middle" dominantBaseline="central" fontSize={15} fontFamily={EMOJI}>{q.e}</text>
          <Txt x={x + s / 2} y={y + s * 0.82} size={9} weight={900}>{q.word}</Txt>
        </g>
      })}
      <rect x={10} y={D + s + 6} width={180} height={270 - (D + s + 6) - 6} rx={3} fill="#fffbea" stroke="#9ca3af" strokeWidth=".4" />
      <TextBox x={14} y={D + s + 8} w={172} h={270 - (D + s + 6) - 10}
        text="איך משחקים: זורקים את הקובייה ושואלים שאלה מהסוג שיצא — על תמונה, על ספר או על מה שקרה היום. אחר כך מחליפים תפקידים: הילד/ה שואל/ת והמבוגר עונה. כל תשובה מתקבלת, והמבוגר מרחיב אותה במשפט מלא."
        max={5} weight={500} maxLines={6} />
    </Sheet>,
  }
}

const PRINTS = [['scene', '🖼️ תמונה + כרטיסי שאלות'], ['book', '📚 שאלות לכל ספר'], ['dice', '🎲 קוביית שאלות']]

function Printables() {
  const [type, setType] = useState('scene')
  const [scene, setScene] = useState('all')
  const pages = useMemo(() => {
    if (type === 'book') return [bookCardsSheet()]
    if (type === 'dice') return [diceSheet()]
    return scene === 'all' ? SCENES.map(sceneSheet) : [sceneSheet(sceneById[scene])]
  }, [type, scene])
  return <section aria-labelledby="wh-print" className="mb-10 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h2 id="wh-print" className="mb-2 text-center text-2xl font-bold">🖨️ דפים להדפסה</h2>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">A4. לכל מילת שאלה צבע וסמל משלה — כך הכרטיסים ברורים גם בשחור־לבן.</p>
    <div className="mb-4"><Pills label="מה להדפיס" value={type} onChange={setType} options={PRINTS} tone="soft" /></div>
    {type === 'scene' && <div className="mb-4"><Pills label="איזו תמונה" value={scene} onChange={setScene} tone="soft"
      options={[['all', `כל ${SCENES.length} התמונות`], ...SCENES.map(s => [s.id, `${s.e} ${s.title}`])]} /></div>}
    <SheetsPreview pages={pages} title={PRINTS.find(p => p[0] === type)[1].replace(/^\S+\s/, '')} />
  </section>
}

// ── Page ─────────────────────────────────────────────────────────────────────

const faq = [
  { q: 'באיזה סדר ילדים מבינים שאלות?', a: 'בדרך כלל שאלות „מה?” ו„איפה?” מובנות ראשונות, כי התשובה נמצאת מול העיניים. אחריהן „מי?”, ובהמשך „למה?”, „איך?” ו„מתי?” — שדורשות הבנה של סיבה, דרך וזמן. יש שונות גדולה בין ילדים, ולכן כדאי להתקדם לפי הילד/ה ולא לפי גיל.' },
  { q: 'מה עושים כשהילד לא עונה?', a: 'מחכים כמה שניות בשקט — לפעמים צריך זמן. אחר כך אפשר להצביע על התמונה, לתת בחירה בין שתי תשובות („הוא אוכל גלידה או פיצה?”), או לענות בעצמכם ולשאול שוב בהמשך. לא חוזרים על אותה שאלה שוב ושוב.' },
  { q: 'מה זה „להרחיב תשובה”?', a: 'כשהילד עונה במילה אחת — „גלידה” — המבוגר חוזר על התשובה ומוסיף לה מילה או שתיים: „כן, הילד אוכל גלידה קרה”. הילד שומע משפט קצת יותר ארוך משלו, בלי שמבקשים ממנו לחזור. בכל שאלה בעמוד יש משפט לדוגמה כזה.' },
  { q: 'למה שאלות „למה” קשות לילדים צעירים?', a: 'כי התשובה לא מופיעה בתמונה. צריך להסיק סיבה, לחבר בין דברים ולנסח משפט עם „כי…”. כדאי להדגים הרבה: „הילד לוקח מטרייה, כי יורד גשם”, ורק אחר כך לשאול.' },
  { q: 'כמה שאלות לשאול?', a: 'מעט. שיחה טובה עם ילד היא בעיקר תיאור והערות, עם שאלה פה ושם. אם כל משפט הוא שאלה, זה מרגיש כמו מבחן. בתמונה אחת מספיקות שתיים־שלוש שאלות, והשאר — לספר ביחד מה רואים.' },
  { q: 'מה זה מצב „שאלה פתוחה”?', a: 'במצב הזה לא מוצגות תשובות לבחירה, והילד עונה במילים שלו. אם קשה, לוחצים על „רמז” ומקבלים שלוש אפשרויות. כך אפשר להתחיל ברמה קלה (בחירה) ולעבור בהדרגה לתשובה עצמאית.' },
  { q: 'יש כאן מבחן או ציון?', a: 'לא. אין ניקוד, אין שעון ואין הקלטה. העמוד נועד לתרגול משותף. אם יש דאגה לגבי ההבנה או הדיבור של הילד/ה, כדאי לפנות לקלינאי/ת תקשורת להערכה.' },
]

const related = [
  { label: 'שפה — כל העמודים', href: '/speech/language' },
  { label: 'קטגוריות ושיום', href: '/speech/language/categories' },
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'סיפורים לילדים', href: '/stories' },
  { label: 'משחקים לגן', href: '/games/kindergarten' },
]

export default function LanguageWhQuestions() {
  const total = SCENES.reduce((n, s) => n + s.questions.length, 0)
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="שאלות מי, מה, איפה, מתי, למה — תרגול לילדים עם תמונות"
      description="תרגול הבנת שאלות לגן: תמונות מצב עם שאלות מי, מה, איפה, מתי, למה ואיך, בשלבים. תשובות לבחירה עם שמע, משפט להרחבה, כרטיסי שאלות וקוביית שאלות להדפסה. חינם."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'שאלות מי, מה, איפה' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">❓ </span>שאלות מי, מה, איפה, מתי, למה</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{SCENES.length} תמונות מצב ו־{total} שאלות בארבעה שלבים · עם שמע, משפטים להרחבה ודפים להדפסה</p>
    <div className="mx-auto max-w-4xl">
      <QuickAnswer q="איך מתרגלים עם ילד שאלות מי, מה, איפה, מתי ולמה?"
        a="מסתכלים יחד על תמונה ושואלים שאלה אחת בכל פעם — קודם מי ומה (התשובה בתמונה), אחר כך איפה, ורק אז מתי, למה ואיך. מחכים לתשובה, נותנים בחירה כשקשה, ומרחיבים כל תשובה למשפט קצת יותר ארוך. כאן יש תמונות עם שאלות מדורגות, תשובות לבחירה ושמע, וכרטיסים להדפסה."
        rows={[['שלבים', LEVELS.map(l => l.short).join(' ← ')], ['גיל', 'גן (בערך 3–6), כיתה א׳ וחינוך מיוחד'], ['להדפסה', 'תמונה + כרטיסי שאלות, שאלות לכל ספר, קוביית שאלות'], ['מחיר', 'חינם, בלי הרשמה']]}
        updated={UPDATED} />
      <SpeechNote />
      <LanguageNav current="wh-questions" />
    </div>

    <section aria-labelledby="wh-play" className="mb-10">
      <h2 id="wh-play" className="mb-3 text-center text-2xl font-bold">מסתכלים ושואלים</h2>
      <QuestionPlay />
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">אין ציון ואין שעון. גם הצבעה על התמונה היא תשובה.</p>
    </section>

    <div className="mx-auto max-w-4xl">
      <Printables />

      <section aria-labelledby="wh-words" className="mb-10">
        <h2 id="wh-words" className="mb-3 text-center text-2xl font-bold">מה כל שאלה מבקשת?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['who', 'אדם או חיה', '„מי אוכל?” — „הילד”.'],
            ['what', 'חפץ או פעולה', '„מה הוא מחזיק?” — „ספר”. „מה הוא עושה?” — „קורא”.'],
            ['where', 'מקום: על, מתחת, בתוך, ליד', '„איפה החתול?” — „מתחת לשולחן”.'],
            ['when', 'זמן: בוקר, לילה, בחורף, אחרי…', '„מתי ישנים?” — „בלילה”.'],
            ['why', 'סיבה — תשובה עם „כי…”', '„למה הוא לוקח מטרייה?” — „כי יורד גשם”.'],
            ['how', 'דרך או הרגשה', '„איך מכבים נרות?” — „נושפים”.'],
          ].map(([w, kind, ex]) => <div key={w} className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <WhBadge w={w} big />
            <p className="mt-2 font-bold">התשובה: {kind}</p>
            <p className="text-[var(--muted-foreground)]">{ex}</p>
          </div>)}
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-5">
        <Guide title="להורים: איך שואלים — ואיך מרחיבים תשובה">
          <ul className="space-y-1.5">
            <Li><b>קודם מספרים, אחר כך שואלים.</b> „וואו, הכלב רץ מהר!” — ורק אחרי כמה הערות כאלה, שאלה אחת.</Li>
            <Li><b>מחכים.</b> ספרו בלב עד חמש לפני שעוזרים. השקט הזה נותן לילד/ה זמן לחשוב ולמצוא מילים.</Li>
            <Li><b>כשקשה — בחירה.</b> „הילדה אוכלת גלידה או פיצה?” קל יותר מ„מה היא אוכלת?”.</Li>
            <Li><b>מרחיבים במילה או שתיים.</b> הילד/ה: „גשם”. המבוגר: „כן, יורד גשם חזק!” — בלי לבקש לחזור על המשפט.</Li>
            <Li><b>„למה” — מדגימים קודם.</b> „היא פתחה מטרייה כי יורד גשם”. אחרי כמה דוגמאות כאלה, הילד/ה יתחיל/תתחיל לענות עם „כי”.</Li>
            <Li><b>שאלות אמיתיות בחיים.</b> „איפה הנעליים שלך?”, „מי בא לאסוף אותך?” — הן התרגול הכי טוב, יותר מכל דף.</Li>
          </ul>
        </Guide>
        <Guide title="לקלינאיות ולגננות: עבודה בשלבים">
          <ul className="space-y-1.5">
            <Li>בוחרים שלבים לפי הילד/ה: מתחילים ב„מי/מה” עם בחירה מתוך שלוש, ועוברים ל„שאלה פתוחה” כשהבחירה כבר קלה.</Li>
            <Li>הצבע והסמל של כל מילת שאלה (בכרטיסים ובקובייה) עוזרים ללמד <b>איזה סוג תשובה</b> כל שאלה מבקשת — מי → אדם, איפה → מקום, למה → „כי…”.</Li>
            <Li>ילדים שמערבבים בין שאלות (עונים „בבית” על „מתי?”) נעזרים במיון: מניחים את כרטיסי התשובות מתחת למילת השאלה המתאימה.</Li>
            <Li>קוביית השאלות מתאימה לקבוצה ולהיפוך תפקידים — הילד/ה שואל/ת. ניסוח שאלה הוא מיומנות נפרדת וחשובה.</Li>
            <Li>בתשובות ל„למה” ול„איך” יש יותר מתשובה נכונה אחת. ההסבר של הילד/ה חשוב יותר מהבחירה.</Li>
          </ul>
        </Guide>
      </div>

      <div className="mt-12">
        <SeoBody paragraphs={[
          'הבנת שאלות היא חלק מרכזי בהבנת השפה. ילד שמבין מה שואלים אותו יכול להשתתף בשיחה בגן, לענות על שאלות על סיפור ולספר מה קרה לו. כל מילת שאלה מבקשת סוג אחר של תשובה: מי — אדם או חיה, איפה — מקום, מתי — זמן, למה — סיבה. ההבחנה הזאת נבנית לאט, ובעיקר מתוך שיחה.',
          'בעמוד יש תמונות מצב שציירנו במיוחד — גן שעשועים, מטבח, ים, יום הולדת, יום גשום, סופר, ביקור אצל הרופאה ולפני השינה — ולכל תמונה שאלות בכל השלבים. לכל שאלה יש משפט לדוגמה שעוזר למבוגר להרחיב את התשובה של הילד.',
          'החומרים מתאימים לבית, לגן ולקליניקה, וגם לחינוך המיוחד. אפשר להדפיס כל תמונה עם כרטיסי שאלות, כרטיסים כלליים שמתאימים לכל ספר, וקוביית שאלות לגזירה ולקיפול.',
        ]} faq={faq} related={related} />
      </div>
    </div>
  </div>
}

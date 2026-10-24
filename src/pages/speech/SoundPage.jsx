import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import SpeakButton from '../../components/ui/SpeakButton'
import { Choice } from '../../components/printables/PrintableShell'
import { speak } from '../../utils/speak'
import { loadSound, soundMeta, itemsFor, plainHebrew, POSITIONS, LEVELS } from '../../data/speech/sounds'
import SpeechNote from './SpeechNote'
import { buildSheets, SheetsPreview, OUTPUTS, CARD_COUNTS } from './speechSheets'

// One page per speech sound (/speech/sounds/<id>), drawn entirely from its data file
// (src/data/speech/sound-<id>.js): about the sound, words by position and level with audio,
// a one-card-at-a-time practice mode with a repetition counter, a story, game ideas and printables.

const say = t => speak(plainHebrew(t), 'he-IL', { rate: 0.8 })
const Section = ({ title, children, id }) => <section id={id} className="mx-auto mt-10 max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm" dir="rtl">
  <h2 className="mb-3 text-2xl font-bold">{title}</h2>
  <div className="space-y-3 leading-relaxed text-[var(--foreground)]/85">{children}</div>
</section>
const Li = ({ children }) => <li className="mr-5 list-disc">{children}</li>

// Big card, one item at a time. The counter counts tries — it never judges the child's speech.
function PracticeMode({ items, onClose, label }) {
  const [i, setI] = useState(0)
  const [count, setCount] = useState(0)
  const [goal, setGoal] = useState(5)
  const [total, setTotal] = useState(0)
  const item = items[i % items.length]
  const go = d => { setI(n => (n + d + items.length) % items.length); setCount(0) }
  const tap = () => { setCount(c => c + 1); setTotal(t => t + 1) }
  useEffect(() => {
    const key = e => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowLeft') go(1); if (e.key === 'ArrowRight') go(-1) }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="dialog" aria-modal="true" aria-label={`מצב תרגול — ${label}`} dir="rtl">
    <div className="w-full max-w-lg rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center shadow-xl">
      <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
        <span>כרטיס {i % items.length + 1} מתוך {items.length}</span>
        <button type="button" onClick={onClose} className="min-h-[40px] rounded-full border-2 border-[var(--border)] px-3 font-bold text-[var(--foreground)]">✕ סגירה</button>
      </div>
      <button type="button" onClick={() => say(item.t)} className="mt-3 block w-full rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-label={`השמעה: ${plainHebrew(item.t)}`}>
        {item.e && <span className="block text-8xl leading-tight" aria-hidden="true">{item.e}</span>}
        <span className="mt-2 block text-4xl font-black sm:text-5xl">{item.t}</span>
        <span className="mt-2 block text-sm text-[var(--muted-foreground)]">🔊 לוחצים לשמיעה</span>
      </button>
      <p className="mt-4 font-bold">חזרות על הכרטיס הזה</p>
      <div className="mt-1 flex flex-wrap justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: Math.max(goal, count) }, (_, k) => <span key={k} className={`inline-block h-6 w-6 rounded-full border-2 border-slate-400 ${k < count ? 'bg-amber-300' : 'bg-white'}`} />)}
      </div>
      <button type="button" onClick={tap} className="mt-3 min-h-[56px] w-full rounded-2xl bg-emerald-600 px-6 py-3 text-xl font-black text-white">+1 עוד חזרה ({count})</button>
      {count >= goal && <p className="mt-2 font-bold text-emerald-700" role="status">כל הכבוד על ההתמדה! אפשר לעבור לכרטיס הבא 🌟</p>}
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => go(-1)} className="min-h-[48px] flex-1 rounded-xl border-2 border-[var(--border)] font-bold">→ הקודם</button>
        <button type="button" onClick={() => go(1)} className="min-h-[48px] flex-1 rounded-xl border-2 border-[var(--border)] bg-[var(--yellow)] font-bold">הבא ←</button>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm">
        <span>יעד חזרות לכרטיס:</span>
        {[3, 5, 10].map(n => <button key={n} type="button" aria-pressed={goal === n} onClick={() => setGoal(n)} className={`min-h-[36px] rounded-full border-2 border-[var(--border)] px-3 font-bold ${goal === n ? 'bg-[var(--yellow)]' : 'bg-white'}`}>{n}</button>)}
        <span className="text-[var(--muted-foreground)]">· סה״כ היום: {total}</span>
      </div>
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">המונה סופר ניסיונות ולא בודק את ההגייה. אין כאן הקלטה.</p>
    </div>
  </div>
}

export default function SoundPage({ id }) {
  const meta = soundMeta(id)
  const [data, setData] = useState(null)
  const [position, setPosition] = useState('initial')
  const [level, setLevel] = useState('words')
  const [practice, setPractice] = useState(false)
  const [out, setOut] = useState('cards')
  const [per, setPer] = useState(12)
  const [bingo, setBingo] = useState(3)
  const [pictures, setPictures] = useState(true)
  const [seed, setSeed] = useState(1)
  useEffect(() => { let alive = true; loadSound(id).then(d => { if (alive) setData(d) }); return () => { alive = false } }, [id])

  const byPosition = level === 'words' || level === 'syllables'
  const items = useMemo(() => (data ? itemsFor(data, level, byPosition ? position : 'all') : []), [data, level, position, byPosition])
  const label = meta ? `הצליל ${meta.label}` : ''
  const posLabel = byPosition ? (POSITIONS.find(p => p[0] === position) || ['all', 'כל המיקומים'])[1] : ''
  const levelLabel = LEVELS.find(l => l[0] === level)[1]
  const printTitle = `${label} — ${levelLabel}${posLabel ? ` ${posLabel}` : ''}`
  const pages = useMemo(() => buildSheets(out, items, { per, size: bingo, boards: 6, seed, pictures, title: out === 'bingo' ? `בינגו ${meta?.label}` : out === 'lotto' ? `לוטו ${meta?.label}` : out === 'memory' ? `זיכרון ${meta?.label}` : out === 'log' ? 'טבלת תרגול בבית' : printTitle, soundLabel: label }), [out, items, per, bingo, seed, pictures, printTitle, label, meta])

  if (!meta || !data) return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-[var(--muted-foreground)]" aria-busy="true">טוען…</div>
  const path = meta.path
  const faq = data.faq

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={data.seo.title} description={data.seo.description} path={path} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: `הצליל ${meta.label}` }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">{meta.emoji} </span>{data.seo.h1}</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{data.seo.sub}</p>
    <QuickAnswer q={data.seo.quickQ} a={data.seo.quickA}
      rows={[['גיל רכישה (טווח)', data.acquisition.range], ['מה יש כאן', 'מילים בתחילה, באמצע ובסוף, צירופים, הברות, משפטים, סיפור ומשחקים'], ['להדפסה', 'כרטיסיות עם תמונות, בינגו, לוטו, זיכרון וטבלת תרגול בבית'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated="2026-10-24" />
    <SpeechNote />

    <section aria-label="תרגול" className="mx-auto mt-8 max-w-3xl space-y-4 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm">
      <h2 className="text-center text-2xl font-bold">בוחרים ומתרגלים</h2>
      <Choice label="רמה" value={level} onChange={setLevel} options={LEVELS} />
      {byPosition
        ? <Choice label="מיקום הצליל" value={position} onChange={setPosition} options={[...(level === 'syllables' ? POSITIONS.filter(p => p[0] !== 'clusters') : POSITIONS), ['all', 'הכול']]} />
        : <p className="text-center text-sm text-[var(--muted-foreground)]">בצירופים ובמשפטים הצליל מופיע בכמה מקומות — כל הרשימה מוצגת.</p>}
      <div className="text-center">
        <button type="button" onClick={() => setPractice(true)} className="min-h-[52px] rounded-2xl bg-emerald-600 px-6 py-3 text-lg font-black text-white">▶ מצב תרגול — כרטיס גדול ומונה חזרות</button>
      </div>
    </section>

    <div className={`mx-auto mt-5 grid max-w-3xl gap-2 ${level === 'sentences' ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`} aria-label={`${levelLabel} לתרגול — לוחצים לשמיעה`}>
      {items.map((it, k) => <button key={it.t + k} type="button" onClick={() => say(it.t)}
        className="flex min-h-[64px] items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-right hover:border-slate-500" aria-label={`השמעה: ${plainHebrew(it.t)}`}>
        {it.e && <span className="text-3xl" aria-hidden="true">{it.e}</span>}
        <span className="flex-1 text-xl font-bold">{it.t}</span>
        <span className="text-sm text-[var(--muted-foreground)]" aria-hidden="true">🔊</span>
      </button>)}
    </div>
    <p className="mx-auto mt-2 max-w-3xl text-center text-sm text-[var(--muted-foreground)]">לוחצים על מילה כדי לשמוע אותה. אם אין שמע — כדאי לבדוק שיש במכשיר קול בעברית.</p>
    {practice && items.length > 0 && <PracticeMode items={items} label={printTitle} onClose={() => setPractice(false)} />}

    <Section title={`על הצליל ${meta.label}`}>
      {data.about.map((p, k) => <p key={k}>{p}</p>)}
      {data.variation && <p className="rounded-xl bg-emerald-50 p-3"><b>חשוב לדעת: </b>{data.variation}</p>}
      <p><b>מתי ילדים רוכשים את הצליל? </b>{data.acquisition.range}. {data.acquisition.note} <span className="text-sm">(מקור: <a href={data.acquisition.source.href} target="_blank" rel="noopener noreferrer" className="underline">{data.acquisition.source.label}</a>; עוד ב<Link to="/speech/parents/sound-acquisition" className="font-bold underline">גיל רכישת הצלילים</Link>)</span></p>
    </Section>

    <Section title={`סיפור קצר: ${data.story.title}`}>
      <div className="flex items-start gap-3">
        <SpeakButton text={plainHebrew(data.story.text)} label="השמעת הסיפור" />
        <p className="text-lg leading-loose">{data.story.text}</p>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">קוראים יחד לאט. אפשר לעצור בכל מילה עם {meta.label} ולבקש מהילד/ה לחזור עליה, או לשאול שאלות: מי? מה? לאן?</p>
    </Section>

    <section aria-label="להדפסה" className="mx-auto mt-10 max-w-3xl" dir="rtl">
      <h2 className="mb-2 text-center text-3xl font-bold">🖨️ להדפסה: {printTitle}</h2>
      <p className="mb-4 text-center text-[var(--muted-foreground)]">ההדפסה משתמשת ברמה ובמיקום שבחרתם למעלה. לשילוב כמה צלילים — <Link to="/speech/card-maker" className="font-bold underline">מחולל הכרטיסיות</Link>.</p>
      <div className="mb-6 space-y-3 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4">
        <Choice label="מה מדפיסים" value={out} onChange={setOut} options={OUTPUTS} />
        {out === 'cards' && <Choice label="כמה כרטיסים בדף" value={per} onChange={setPer} options={CARD_COUNTS} />}
        {out === 'bingo' && <Choice label="גודל לוח בינגו" value={bingo} onChange={setBingo} options={[[3, '3×3'], [4, '4×4']]} />}
        <Choice label="תמונות" value={pictures ? 'y' : 'n'} onChange={v => setPictures(v === 'y')} options={[['y', 'עם תמונות'], ['n', 'מילים בלבד']]} />
      </div>
      <SheetsPreview pages={pages} title={printTitle} onRefresh={out === 'bingo' || out === 'lotto' || out === 'memory' ? () => setSeed(s => s + 1) : null} />
    </section>

    <Section title="רעיונות למשחקי תרגול">
      {data.games.map(g => <div key={g.title}><h3 className="text-xl font-bold">{g.title}</h3><p>{g.text}</p></div>)}
      <div><h3 className="text-xl font-bold">בינגו ולוטו</h3><p>מדפיסים לוחות (כל לוח שונה) וכרטיסי קריאה. מי ששולף כרטיס אומר את המילה, וכולם מחפשים אותה בלוח. בקבוצה בגן או בקליניקה, כל ילד אומר את המילה כשהוא מכסה משבצת.</p></div>
    </Section>

    <Section title="איך משתמשים — לקלינאיות ולהורים">
      <ul className="space-y-1.5">
        <Li><b>קלינאיות:</b> בוחרים מיקום ורמה לפי מטרת הטיפול, מדפיסים כרטיסיות או משחק לפגישה, ושולחים הביתה את טבלת התרגול עם המילים של השבוע.</Li>
        <Li><b>הורים:</b> מתרגלים את מה שהקלינאית המליצה — באותו מיקום ובאותה רמה. אם אין הנחיה, מתחילים במילים קלות ומוכרות, ומשחקים.</Li>
        <Li>מתקדמים בהדרגה: הברה ← מילה ← צירוף ← משפט ← סיפור ושיחה. אם קשה — חוזרים שלב אחד אחורה.</Li>
        {(data.tips || []).map(t => <Li key={t}>{t}</Li>)}
        <Li>אין כאן הקלטה של הילד ואין "ציון הגייה" — המבוגר שמקשיב הוא זה שנותן משוב, בעדינות.</Li>
      </ul>
    </Section>

    <div className="mx-auto mt-12 max-w-3xl">
      <SeoBody faq={faq} related={[
        { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
        { label: 'מחולל כרטיסיות היגוי', href: '/speech/card-maker' },
        { label: 'זוגות מינימליים', href: '/speech/minimal-pairs' },
        { label: 'צליל פותח וצליל סוגר', href: '/letters/sounds' },
        { label: 'חרוזים והברות להדפסה', href: '/printables/rhymes-syllables' },
        { label: 'כרטיסיות תקשורת וסדר יום', href: '/printables/sensory-communication-cards' },
      ]} />
    </div>
  </div>
}

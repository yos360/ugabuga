import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import { speak } from '../../../utils/speak'
import SpeechNote from '../SpeechNote'
import { SheetsPreview } from '../speechSheets'
import { Guide, LanguageNav, Li, Pic, Pills } from '../languageShared'
import { gapSheets, pluralCardSheets, tenseCardSheets } from './GrammarSheets'
import {
  COLOR_FORMS, CONNECTORS, GAP_SECTIONS, GENDER_VERBS, GRAMMAR_SOURCES, LADDERS, LADDER_STEPS, NAMES, PLURALS, PLURAL_KINDS,
  POSSESSIVES, SUBJECTS, TIMES, TENSE_VERBS, fill, gapShown, gapSpoken, gapsFor, one, pluralsOf, tenseSentence,
} from '../../../data/speech/grammar'

// /speech/language/grammar — preschool grammar: singular/plural (with irregular plurals), masculine/
// feminine agreement, past/present/future, possessives and longer sentences (ו, כי, אבל). Games give
// a modelled sentence as feedback (recast), never a score; printables: plural cards, gap sheets with
// an answer key, tense sequence cards.

const PATH = '/speech/language/grammar'
const WORKBOOK = '/printables/singular-plural-verbs-workbook'
const UPDATED = '2026-10-24'
const say = (text, user = true) => speak(text.replace(/[„”]/g, ''), 'he-IL', { rate: 0.85, user })
const shuffle = list => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const pick = (list, not) => { const pool = list.length > 1 ? list.filter(x => x !== not) : list; return pool[Math.floor(Math.random() * pool.length)] }

// One picture, or several copies of it ("many").
function Many({ x, n, className = 'text-5xl', size = 48 }) {
  return <span className="inline-flex flex-wrap items-center justify-center gap-0.5" aria-hidden="true">
    {Array.from({ length: n }, (_, i) => <Pic key={i} item={x} className={className} size={size} />)}
  </span>
}

const Card = ({ children, className = '' }) => <div className={`rounded-2xl border border-[var(--border)] bg-white p-4 text-center shadow-sm sm:p-6 ${className}`}>{children}</div>
const NextBtn = ({ done, onClick, label = 'לשאלה הבאה ←' }) => <button type="button" onClick={onClick}
  className={`min-h-[48px] rounded-xl px-6 font-bold ${done ? 'bg-emerald-600 text-white' : 'border-2 border-[var(--border)] bg-white text-sm'}`}>{done ? label : 'דילוג'}</button>
const SecTitle = ({ id, n, children, sub }) => <div className="mb-4 text-center">
  <h2 id={id} className="text-3xl font-black"><span className="ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--yellow)] align-middle text-xl">{n}</span>{children}</h2>
  {sub && <p className="mx-auto mt-1 max-w-2xl text-[var(--muted-foreground)]">{sub}</p>}
</div>

// ── 1. Singular / plural ────────────────────────────────────────────────────

function OneOrMany() {
  const [level, setLevel] = useState('regular')
  const [mode, setMode] = useState('listen')
  const [round, setRound] = useState(() => ({ x: pick(pluralsOf('regular')), many: Math.random() < 0.5 }))
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const next = (lv = level) => { setRound(r => ({ x: pick(pluralsOf(lv), r.x), many: Math.random() < 0.5 })); setTried([]); setDone(false); setMsg('') }
  const { x, many } = round
  const word = many ? x.p : x.s
  const answer = choice => {
    if (done) return
    if (choice === many) {
      const text = many ? `נכון! ${x.p} — הרבה ${x.p}.` : `נכון! ${x.s} — ${x.s} ${one(x)}.`
      setDone(true); setMsg(text); say(text)
    } else {
      setTried(t => [...t, choice])
      const text = choice ? `כאן יש הרבה — ${x.p}. ${x.s} זה ${one(x)}.` : `כאן יש ${x.s} ${one(x)}. ${x.p} — זה הרבה.`
      setMsg(text); say(text)
    }
  }
  const ring = c => done && c === many ? 'border-emerald-500 bg-emerald-50' : tried.includes(c) ? 'border-slate-300 bg-slate-50 opacity-60' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'
  return <div className="space-y-3">
    <Pills label="מילים" value={level} onChange={v => { setLevel(v); next(v) }} tone="soft"
      options={[['regular', '🙂 רגילות (־ים / ־ות)'], ['tricky', '🤔 מיוחדות'], ['all', '🔀 הכול']]} />
    <Pills label="סוג המשחק" value={mode} onChange={v => { setMode(v); next() }} tone="soft"
      options={[['listen', '👂 שומעים מילה ובוחרים תמונה'], ['look', '👀 רואים תמונה ובוחרים מילה']]} />
    <Card>
      <h3 className="mb-1 text-2xl font-bold">אחד או הרבה?</h3>
      {mode === 'listen' ? <>
        <p className="mb-3 text-[var(--muted-foreground)]">מקשיבים למילה — ובוחרים: אחד, או הרבה?</p>
        <button type="button" onClick={() => say(word)} className="mb-4 min-h-[52px] rounded-full bg-violet-600 px-6 text-lg font-bold text-white">🔊 {done ? word : 'שמעו את המילה'}</button>
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-3">
          {[false, true].map(c => <button key={String(c)} type="button" onClick={() => answer(c)} aria-label={c ? 'הרבה' : 'אחד'}
            className={`flex min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 shadow-sm transition ${ring(c)}`}>
            <Many x={x} n={c ? x.n : 1} className={c ? 'text-4xl sm:text-5xl' : 'text-6xl'} size={c ? 40 : 60} />
            <span className="text-lg font-bold">{c ? 'הרבה' : 'אחד'}</span>
          </button>)}
        </div>
      </> : <>
        <p className="mb-3 text-[var(--muted-foreground)]">מה רואים בתמונה? בוחרים את המילה (המבוגר מקריא).</p>
        <div className="mx-auto mb-4 flex min-h-[120px] max-w-sm items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-[var(--postit)]/40 p-3">
          <Many x={x} n={many ? x.n : 1} className="text-6xl" size={60} />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[false, true].map(c => <button key={String(c)} type="button" onClick={() => answer(c)}
            className={`min-h-[60px] min-w-[120px] rounded-2xl border-2 px-5 text-2xl font-black ${ring(c)}`}>{c ? x.p : x.s}</button>)}
        </div>
      </>}
      <p className="mx-auto mt-4 min-h-[3rem] max-w-xl text-lg font-bold" aria-live="polite">{msg}</p>
      <NextBtn done={done} onClick={() => next()} />
    </Card>
  </div>
}

function PluralTable() {
  return <div className="grid gap-3 sm:grid-cols-2">
    {PLURAL_KINDS.map(k => <div key={k.id} className="rounded-2xl border border-[var(--border)] bg-white p-3 shadow-sm">
      <h3 className="text-lg font-bold"><span aria-hidden="true">{k.e} </span>{k.name}</h3>
      <p className="mb-2 text-sm text-[var(--muted-foreground)]">{k.tip}</p>
      <ul className="flex flex-wrap gap-1.5">
        {PLURALS.filter(x => x.kind === k.id).map(x => <li key={x.s}><button type="button" onClick={() => say(`${x.s}, ${x.p}`)} aria-label={`השמעה: ${x.s} — ${x.p}`}
          className="flex min-h-[38px] items-center gap-1 rounded-full border border-[var(--border)] bg-slate-50 px-2.5 font-bold hover:bg-[var(--postit)]">
          <Pic item={x} className="text-lg" size={18} />{x.s} <span className="text-[var(--muted-foreground)]" aria-hidden="true">←</span> {x.p}</button></li>)}
      </ul>
    </div>)}
  </div>
}

// ── 2. Masculine / feminine ─────────────────────────────────────────────────

function GenderTable() {
  const [vi, setVi] = useState(0)
  const v = GENDER_VERBS[vi]
  return <Card>
    <h3 className="mb-1 text-2xl font-bold">ילד, ילדה, ילדים, ילדות</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">אותה פעולה — ארבע צורות. בוחרים פעולה ולוחצים על משפט כדי לשמוע.</p>
    <div className="mb-4 flex flex-wrap justify-center gap-1.5" role="group" aria-label="פעולה">
      {GENDER_VERBS.map((g, i) => <button key={g.m} type="button" aria-pressed={vi === i} onClick={() => setVi(i)}
        className={`min-h-[44px] rounded-full border-2 px-3 font-bold ${vi === i ? 'border-violet-400 bg-violet-50 text-violet-900' : 'border-[var(--border)] bg-white'}`}><span aria-hidden="true">{g.e} </span>{g.m}</button>)}
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SUBJECTS.map(s => {
        const text = `${s.t} ${v[s.id]} ${v.rest}.`
        return <button key={s.id} type="button" onClick={() => say(text)} className="flex min-h-[132px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[var(--border)] bg-white p-2 shadow-sm hover:bg-[var(--postit)]/50">
          <span className="text-4xl leading-none" aria-hidden="true">{s.pics.join('')}{v.e}</span>
          <span className="text-lg font-bold">{s.t} <span className="text-violet-700">{v[s.id]}</span> {v.rest}</span>
        </button>
      })}
    </div>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">כשיש בקבוצה גם בנים וגם בנות — בעברית התקנית אומרים בלשון זכר: <b>„הילדים רצים”</b>.</p>
  </Card>
}

function ColorTable() {
  return <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white shadow-sm">
    <table className="w-full min-w-[340px] text-center">
      <caption className="p-3 text-right text-lg font-bold">צבעים משתנים לפי מה שמתארים</caption>
      <thead><tr className="bg-slate-50 text-sm"><th className="p-2">כדור (זכר)</th><th className="p-2">בובה (נקבה)</th><th className="p-2">כדורים</th><th className="p-2">בובות</th></tr></thead>
      <tbody>
        {COLOR_FORMS.map(([m, f, mp, fp, hex]) => <tr key={m} className="border-t border-[var(--border)]">
          {[m, f, mp, fp].map(w => <td key={w} className="p-1"><button type="button" onClick={() => say(w)} className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-2 font-bold hover:bg-[var(--postit)]">
            <span aria-hidden="true" className="inline-block h-3.5 w-3.5 rounded-full border border-slate-400" style={{ background: hex }} />{w}</button></td>)}
        </tr>)}
      </tbody>
    </table>
  </div>
}

// ── 3. Past / present / future ──────────────────────────────────────────────

function TenseStrip() {
  const [vi, setVi] = useState(0)
  const [g, setG] = useState('m')
  const v = TENSE_VERBS[vi]
  return <Card>
    <h3 className="mb-1 text-2xl font-bold">לפני, עכשיו, אחר כך</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">בוחרים פעולה. לוחצים על כל תמונה ושומעים: מה {NAMES[g]} עשה אתמול, עושה עכשיו ויעשה מחר.</p>
    <div className="mb-3"><Pills label="מי" value={g} onChange={setG} tone="soft" options={[['m', `👦 ${NAMES.m}`], ['f', `👧 ${NAMES.f}`]]} /></div>
    <div className="mb-4 flex flex-wrap justify-center gap-1.5" role="group" aria-label="פעולה">
      {TENSE_VERBS.map((t, i) => <button key={t.id} type="button" aria-pressed={vi === i} onClick={() => setVi(i)} aria-label={t[g][1]}
        className={`min-h-[44px] min-w-[44px] rounded-full border-2 px-2 text-2xl ${vi === i ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>{t.e}</button>)}
    </div>
    <ol className="grid grid-cols-3 gap-2 sm:gap-3">
      {TIMES.map((t, ti) => {
        const text = tenseSentence(v, g, ti)
        return <li key={t.id}><button type="button" onClick={() => say(text)} aria-label={text}
          className={`relative flex min-h-[170px] w-full flex-col items-center justify-start gap-1 rounded-2xl border-2 p-2 shadow-sm ${t.id === 'now' ? 'border-violet-500 bg-violet-50' : t.id === 'future' ? 'border-dashed border-slate-400 bg-white' : 'border-slate-400 bg-white'}`}>
          <span className="w-full rounded-lg bg-slate-100 px-1 py-0.5 text-sm font-black sm:text-base">{t.label === t.word ? t.label : `${t.label} · ${t.word}`}</span>
          <span className={`mt-1 text-4xl leading-none sm:text-6xl ${t.id === 'future' ? 'opacity-40' : ''}`} aria-hidden="true">{g === 'm' ? '👦' : '👧'}{v.e}</span>
          {t.id === 'past' && <span className="absolute left-2 top-9 rounded-full bg-emerald-600 px-1.5 text-sm font-bold text-white" aria-hidden="true">✔</span>}
          {t.id === 'future' && <span className="absolute left-2 top-9 text-lg" aria-hidden="true">⏳</span>}
          <span className="text-base font-bold leading-snug sm:text-lg">{NAMES[g]} <span className="text-violet-700">{v[g][ti]}</span> {v.obj}</span>
        </button></li>
      })}
    </ol>
    <p className="mt-3 text-sm text-[var(--muted-foreground)]">ואז שואלים: „מה {NAMES[g]} {g === 'm' ? 'יעשה' : 'תעשה'} מחר?” — ומחכים לתשובה. בגוף ראשון: „אני <b>אוכל</b>”, „אני <b>אוכלת</b>”, „מחר אני <b>אלך</b>”.</p>
  </Card>
}

// ── 5. Sentence ladder ──────────────────────────────────────────────────────

function Ladder() {
  const [li, setLi] = useState(0)
  const [step, setStep] = useState(0)
  const l = LADDERS[li]
  const go = n => { setStep(n); say(l.steps[n]) }
  return <Card>
    <h3 className="mb-1 text-2xl font-bold">בונים משפט ארוך</h3>
    <p className="mb-3 text-[var(--muted-foreground)]">מתחילים ממילה אחת ומוסיפים בכל פעם עוד חלק — בדיוק כמו שמרחיבים בשיחה עם הילד/ה.</p>
    <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="משפט">
      {LADDERS.map((x, i) => <button key={x.e} type="button" aria-pressed={li === i} onClick={() => { setLi(i); setStep(0) }}
        className={`min-h-[48px] min-w-[48px] rounded-full border-2 text-2xl ${li === i ? 'border-violet-400 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>{x.e}</button>)}
    </div>
    <ol className="mx-auto max-w-xl space-y-2 text-right">
      {l.steps.slice(0, step + 1).map((s, i) => <li key={i} style={{ marginRight: `${i * 6}%` }}>
        <button type="button" onClick={() => say(s)} className={`w-full rounded-xl border-2 p-2.5 text-right shadow-sm ${i === step ? 'border-violet-500 bg-violet-50' : 'border-[var(--border)] bg-white'}`}>
          <span className="block text-xs font-bold text-[var(--muted-foreground)]">{LADDER_STEPS[i]}</span>
          <span className="text-lg font-bold">{s}</span>
        </button>
      </li>)}
    </ol>
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {step < l.steps.length - 1
        ? <button type="button" onClick={() => go(step + 1)} className="min-h-[48px] rounded-xl bg-violet-600 px-6 font-bold text-white">➕ עוד חלק למשפט</button>
        : <button type="button" onClick={() => { setStep(0); say(l.steps[0]) }} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">↺ מההתחלה</button>}
      <button type="button" onClick={() => say(l.steps[step])} className="min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-white px-5 font-bold">🔊 הקראה</button>
    </div>
  </Card>
}

// ── Complete-the-sentence game (all sections) ───────────────────────────────

function GapGame() {
  const [sec, setSec] = useState('mix')
  const [order, setOrder] = useState(() => shuffle(gapsFor('mix')))
  const [i, setI] = useState(0)
  const [tried, setTried] = useState([])
  const [done, setDone] = useState(false)
  const [msg, setMsg] = useState('')
  const item = order[i % order.length]
  const opts = useMemo(() => shuffle(item.opts), [item])
  const reset = () => { setTried([]); setDone(false); setMsg('') }
  const start = s => { setSec(s); setOrder(shuffle(gapsFor(s))); setI(0); reset() }
  const full = fill(item.text, item.ans)
  const choose = o => {
    if (done) return
    if (o === item.ans) {
      setDone(true); setMsg(`${full}${item.note ? ` (${item.note})` : ''}`); say(full)
    } else {
      setTried(t => [...t, o]); setMsg(`אומרים: „${full}”`); say(full)
    }
  }
  return <div className="space-y-3">
    <Pills label="נושא" value={sec} onChange={start} tone="soft" options={GAP_SECTIONS} />
    <Card>
      <h3 className="mb-1 text-2xl font-bold">השלימו את המשפט</h3>
      <p className="mb-3 text-[var(--muted-foreground)]">שומעים משפט עם „חור” — ובוחרים את המילה שמתאימה.</p>
      <div className="mb-2 text-5xl leading-none sm:text-6xl" aria-hidden="true">{item.pics.join('')}</div>
      <p className="mb-3 text-2xl font-black leading-relaxed sm:text-3xl">{done ? full : gapShown(item.text)}</p>
      <button type="button" onClick={() => say(done ? full : gapSpoken(item.text))} className="mb-4 min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 font-bold">🔊 הקראת המשפט</button>
      <div className="flex flex-wrap justify-center gap-3">
        {opts.map(o => <button key={o} type="button" onClick={() => choose(o)}
          className={`min-h-[60px] min-w-[96px] rounded-2xl border-2 px-5 text-2xl font-black ${done && o === item.ans ? 'border-emerald-500 bg-emerald-50' : tried.includes(o) ? 'border-slate-300 bg-slate-50 opacity-60' : 'border-[var(--border)] bg-white hover:bg-[var(--postit)]/50'}`}>{o === 'ו' ? 'ו־' : o}</button>)}
      </div>
      <p className="mx-auto mt-4 min-h-[3rem] max-w-xl text-lg font-bold" aria-live="polite">{msg}</p>
      {!done && tried.length > 0 && <p className="mx-auto mb-2 max-w-xl text-sm text-[var(--muted-foreground)]">המשפט הנכון הוקרא — אפשר לבחור שוב, בלי לחץ.</p>}
      <NextBtn done={done} onClick={() => { setI(n => n + 1); reset() }} />
    </Card>
  </div>
}

// ── Printables ──────────────────────────────────────────────────────────────

const PRINTS = [['plural', '👥 כרטיסי יחיד ורבים'], ['gap', '✏️ השלימו את המשפט + תשובות'], ['tense', '⏳ כרטיסי רצף זמנים']]

function Printables() {
  const [type, setType] = useState('plural')
  const [level, setLevel] = useState('regular')
  const [words, setWords] = useState(true)
  const [sec, setSec] = useState('mix')
  const [answers, setAnswers] = useState(true)
  const [g, setG] = useState('m')
  const [seed, setSeed] = useState(5)
  const pages = useMemo(() => type === 'plural' ? pluralCardSheets(level, words, seed)
    : type === 'gap' ? gapSheets(sec, seed, answers) : tenseCardSheets(g, words), [type, level, words, sec, answers, g, seed])
  const title = PRINTS.find(p => p[0] === type)[1].replace(/^\S+\s/, '')
  return <section id="print" aria-labelledby="gr-print" className="mb-10 scroll-mt-24 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
    <h2 id="gr-print" className="mb-2 text-center text-2xl font-bold">🖨️ דפים להדפסה</h2>
    <p className="mb-4 text-center text-[var(--muted-foreground)]">A4, עם קווי גזירה. עובד גם בשחור־לבן.</p>
    <div className="mb-4"><Pills label="מה להדפיס" value={type} onChange={setType} options={PRINTS} tone="soft" /></div>
    <div className="mb-4 space-y-2">
      {type === 'plural' && <Pills label="מילים" value={level} onChange={setLevel} tone="soft" options={[['regular', '🙂 רגילות'], ['tricky', '🤔 מיוחדות'], ['all', '🔀 הכול']]} />}
      {type === 'gap' && <>
        <Pills label="נושא" value={sec} onChange={setSec} tone="soft" options={GAP_SECTIONS} />
        <Pills label="דף תשובות" value={answers} onChange={setAnswers} tone="soft" options={[[true, '✅ עם דף תשובות'], [false, 'בלי תשובות']]} />
      </>}
      {type === 'tense' && <Pills label="מי" value={g} onChange={setG} tone="soft" options={[['m', `👦 ${NAMES.m}`], ['f', `👧 ${NAMES.f}`]]} />}
      {type !== 'gap' && <Pills label="מילים בכרטיס" value={words} onChange={setWords} tone="soft" options={[[true, '🔤 עם מילים'], [false, '🖼️ תמונות בלבד']]} />}
    </div>
    <SheetsPreview pages={pages} title={title} onRefresh={type === 'tense' ? undefined : () => setSeed(s => s + 1)} />
  </section>
}

// ── Page ─────────────────────────────────────────────────────────────────────

const TOC = [['plural', '👥 יחיד ורבים'], ['gender', '👦👧 זכר ונקבה'], ['tense', '⏳ עבר, הווה, עתיד'], ['possessive', '🤲 שלי, שלך, שלו, שלה'], ['sentences', '🔗 משפטים ארוכים'], ['game', '🎧 השלימו את המשפט'], ['print', '🖨️ להדפסה'], ['parents', '💡 להורים']]

const faq = [
  { q: 'איך מלמדים ילד בגן יחיד ורבים?', a: 'דרך תמונות ומשחק: כלב אחד מול הרבה כלבים, ביצה אחת מול הרבה ביצים. מתחילים מהמילים הרגילות (־ים בזכר, ־ות בנקבה), ורק אחר כך עוברים למילים המיוחדות כמו עפרונות, ביצים ונשים. הכי חשוב — לשמוע את הצורה הנכונה הרבה פעמים בשיחה, לא לשנן כללים.' },
  { q: 'הילד שלי אומר "שולחנים" ו"ביצות". זה תקין?', a: 'בגיל הגן — לרוב כן. זו "הכללת יתר": הילד למד את הכלל (זכר + ־ים) ומחיל אותו גם על מילים יוצאות דופן. זה סימן שהוא לומד את השפה, לא שהוא טועה "סתם". צורות כאלה נשמעות אצל ילדים רבים עד גיל 5 בערך ואף אחריו, ונעלמות בהדרגה כשהם שומעים את הצורה הנכונה שוב ושוב.' },
  { q: 'הילד אומר "אני ילך" במקום "אני אלך". צריך לתקן?', a: 'לא לתקן באופן ישיר. "אני ילך" היא טעות התפתחותית מוכרת בעברית — הילד משתמש בצורה שהוא שומע הכי הרבה. עונים בטבעיות עם הצורה הנכונה: "אה, אתה תלך לגן? גם אני אלך איתך!". אם בגיל 5–6 יש עדיין הרבה טעויות כאלה, או שהמשפטים קצרים מאוד — כדאי להתייעץ עם קלינאי/ת תקשורת.' },
  { q: 'מה זה "הרחבה" ו"החזרה מתוקנת"?', a: 'שתי טכניקות פשוטות שקלינאיות תקשורת ממליצות עליהן. החזרה מתוקנת: הילד אומר "הילדה רץ", ואתם עונים "כן! הילדה רצה מהר" — עם הצורה הנכונה, בלי "לא נכון" ובלי "תגיד שוב". הרחבה: הילד אומר "כלב", ואתם מוסיפים "כלב גדול! הכלב רץ". המחקר מראה שהחזרה כזו עוזרת ללמוד דקדוק.' },
  { q: 'כשיש בקבוצה בנים ובנות — אומרים ילדים או ילדות?', a: 'בעברית התקנית, כשהקבוצה מעורבת אומרים בלשון זכר: "הילדים רצים", "הבית שלהם". "ילדות" משמש רק כשכל הקבוצה בנות. ילדים צעירים מתבלבלים בזה לפעמים — וזה בסדר; עונים בטבעיות עם הצורה התקנית.' },
  { q: 'לאיזה גיל מתאים העמוד?', a: 'בעיקר לגן (בערך 3–6) ולכיתה א׳, וגם לחינוך המיוחד ולילדים שלומדים עברית כשפה נוספת. לכיתות ג׳–ד׳ יש באתר חוברת נפרדת של יחיד ורבים והטיית פעלים.' },
  { q: 'העמוד בודק את הילד או נותן ציון?', a: 'לא. אין ציון, אין שעון ואין הקלטה. בכל תשובה העמוד משמיע את המשפט הנכון — כמו שמבוגר היה עונה בשיחה. אם יש דאגה לגבי השפה של הילד/ה, כדאי לפנות לקלינאי/ת תקשורת.' },
  { q: 'אפשר להדפיס בחינם?', a: 'כן, הכול חינם ובלי הרשמה: כרטיסי יחיד ורבים (גם בלי מילים, לילדים שעוד לא קוראים), דפי "השלימו את המשפט" עם דף תשובות, וכרטיסי רצף לפני–עכשיו–אחר כך.' },
]

const related = [
  { label: 'חוברת יחיד ורבים והטיית פעלים (כיתות ג׳–ד׳)', href: WORKBOOK },
  { label: 'יחיד ורבים — שיעור לשון', href: '/learn/lashon/singular-plural' },
  { label: 'שפה — כל העמודים', href: '/speech/language' },
  { label: 'סיפור ברצף — כרטיסי רצף', href: '/speech/language/sequencing' },
  { label: 'קטגוריות ושיום', href: '/speech/language/categories' },
  { label: 'התפתחות שפה לפי גיל', href: '/speech/parents/language-milestones' },
  { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
]

export default function LanguageGrammar() {
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="יחיד ורבים לגן, זכר ונקבה, עבר הווה עתיד — דקדוק לילדים"
      description="תרגול דקדוק לגן עם תמונות ושמע: יחיד ורבים (גם עפרונות, ביצים ונשים), זכר ונקבה, עבר הווה ועתיד, שלי־שלך־שלו־שלה ומשפטים עם ו, כי, אבל. דפים להדפסה עם תשובות, חינם."
      structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'שפה', href: '/speech/language' }, { label: 'דקדוק לגן' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🧱 </span>דקדוק לגן: יחיד ורבים, זכר ונקבה, עבר הווה עתיד</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">{PLURALS.length} זוגות יחיד־רבים, {TENSE_VERBS.length} פעלים בשלושה זמנים · משחקים עם שמע ודפים להדפסה</p>
    <QuickAnswer q="איך מתרגלים דקדוק עם ילדים בגן?"
      a="בעיקר בשיחה ובמשחק: מראים תמונה של אחד מול הרבה, משחקים ב„מי עושה מה?” (הילד רץ / הילדה רצה), מספרים מה היה אתמול ומה יהיה מחר. כשהילד/ה טועה — לא מתקנים ולא מבקשים „תגיד שוב”, אלא עונים עם הצורה הנכונה ומרחיבים. כאן יש משחקים עם שמע לכל נושא ודפים להדפסה."
      rows={[['נושאים', 'יחיד ורבים, זכר ונקבה, עבר־הווה־עתיד, שלי־שלך, ו / כי / אבל'], ['גיל', 'גן (בערך 3–6), כיתה א׳, חינוך מיוחד'], ['להדפסה', 'כרטיסי יחיד ורבים, השלימו את המשפט + תשובות, כרטיסי רצף זמנים'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated={UPDATED} />
    <SpeechNote />
    <LanguageNav current="grammar" />

    <nav aria-label="בעמוד הזה" className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--postit)]/50 p-3">
      <p className="mb-2 text-center text-sm font-bold">בעמוד הזה</p>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {TOC.map(([id, l]) => <li key={id}><a href={`#${id}`} className="inline-flex min-h-[40px] items-center rounded-full border border-[var(--border)] bg-white px-3 text-sm font-bold hover:bg-[var(--muted)]/30">{l}</a></li>)}
      </ul>
    </nav>

    <section id="plural" aria-labelledby="gr-plural" className="mb-12 scroll-mt-24">
      <SecTitle id="gr-plural" n="1" sub="רוב המילים בזכר מקבלות ־ים ורוב המילים בנקבה ־ות — אבל יש לא מעט מילים מיוחדות שפשוט צריך לשמוע הרבה.">יחיד ורבים</SecTitle>
      <OneOrMany />
      <h3 className="mb-2 mt-6 text-xl font-bold">כל הזוגות — לחיצה משמיעה יחיד ורבים</h3>
      <PluralTable />
      <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed">לילדים גדולים יותר (כיתות ג׳–ד׳): <Link to={WORKBOOK} className="font-bold underline">חוברת יחיד ורבים והטיית פעלים</Link> — 21 דפי עבודה בשלוש רמות, עם תשובות.</p>
    </section>

    <section id="gender" aria-labelledby="gr-gender" className="mb-12 scroll-mt-24">
      <SecTitle id="gr-gender" n="2" sub="בעברית גם הפעולה והתיאור משתנים לפי מי שמדברים עליו: הילד רץ, הילדה רצה; כדור גדול, בובה גדולה.">זכר ונקבה</SecTitle>
      <GenderTable />
      <div className="mt-4"><ColorTable /></div>
    </section>

    <section id="tense" aria-labelledby="gr-tense" className="mb-12 scroll-mt-24">
      <SecTitle id="gr-tense" n="3" sub="עבר (מה כבר היה), הווה (מה קורה עכשיו) ועתיד (מה עוד יהיה). מילות הזמן — אתמול, עכשיו, מחר — עוזרות לילד/ה לבחור את הצורה.">עבר, הווה ועתיד</SecTitle>
      <TenseStrip />
    </section>

    <section id="possessive" aria-labelledby="gr-pos" className="mb-12 scroll-mt-24">
      <SecTitle id="gr-pos" n="4" sub="של מי זה? משחקים עם חפצים אמיתיים: „זה הכובע שלי, זה הכובע שלך”. בתרגול „השלימו את המשפט” יש גם שאלות של מי.">שלי, שלך, שלו, שלה</SecTitle>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {POSSESSIVES.map(([who, w, e], i) => <button key={who} type="button" onClick={() => say(`${who} — ${w}`)}
          className={`flex min-h-[96px] flex-col items-center justify-center gap-0.5 rounded-2xl border-2 bg-white p-2 shadow-sm hover:bg-[var(--postit)]/50 ${i < 5 ? 'border-violet-300' : 'border-[var(--border)]'}`}>
          <span className="text-3xl leading-none" aria-hidden="true">{e}</span>
          <span className="text-sm text-[var(--muted-foreground)]">{who}</span>
          <span className="text-xl font-black">{w}</span>
        </button>)}
      </div>
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">ניקוד רק כדי להבדיל: <b>שֶׁלְּךָ</b> (לבן) ו<b>שֶׁלָּךְ</b> (לבת). מתחילים מארבע הראשונות — שלי, שלך, שלו, שלה.</p>
    </section>

    <section id="sentences" aria-labelledby="gr-sent" className="mb-12 scroll-mt-24">
      <SecTitle id="gr-sent" n="5" sub="מחברים שני רעיונות למשפט אחד: ו (מוסיפים), כי (מסבירים למה), אבל (משהו לא הסתדר).">משפטים ארוכים: ו, כי, אבל</SecTitle>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {CONNECTORS.map(c => <button key={c.id} type="button" onClick={() => say(c.ex)} className="rounded-2xl border-2 border-[var(--border)] bg-white p-3 text-center shadow-sm hover:bg-[var(--postit)]/50">
          <span className="block text-3xl font-black">{c.label}</span>
          <span className="block text-sm text-[var(--muted-foreground)]">{c.what}</span>
          <span className="mt-1 block font-bold">{c.ex}</span>
        </button>)}
      </div>
      <Ladder />
    </section>

    <section id="game" aria-labelledby="gr-game" className="mb-12 scroll-mt-24">
      <h2 id="gr-game" className="mb-3 text-center text-3xl font-black">🎧 השלימו את המשפט</h2>
      <GapGame />
      <p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">אין ציון ואין שעון. בכל בחירה העמוד משמיע את המשפט הנכון — כמו מבוגר שעונה בשיחה.</p>
    </section>

    <Printables />

    <div className="mx-auto max-w-3xl space-y-5">
      <Guide id="parents" title="להורים: איך עוזרים בלי לתקן">
        <ul className="space-y-1.5">
          <Li><b>החזרה מתוקנת:</b> הילד/ה אומר/ת „הילדה רץ” — עונים בשמחה „כן, הילדה רצה מהר!”. שומעים את הצורה הנכונה, בלי „לא נכון”.</Li>
          <Li><b>הרחבה:</b> הילד/ה אומר/ת „כלבים” — מוסיפים: „הרבה כלבים! הכלבים רצים בגינה”. כל פעם עוד קצת, לא הרבה יותר.</Li>
          <Li><b>לא מבקשים „תגיד שוב”.</b> בקשה לחזור יוצרת לחץ ומלמדת שהדיבור „נבדק”. מספיק שהילד/ה ישמע/תשמע את הצורה הנכונה, שוב ושוב, בשיחה.</Li>
          <Li><b>מדגישים קצת:</b> אפשר לומר את הצורה הנכונה מעט לאט וברור — „שלוש <b>ביצים</b>” — ולהמשיך הלאה.</Li>
          <Li><b>מדברים על אתמול ועל מחר:</b> „מה עשית היום בגן?”, „מה נעשה מחר?” — שם בדיוק מתרגלים זמנים.</Li>
          <Li><b>משחקי „של מי?”</b> בזמן סידור הכביסה: „זאת החולצה של אבא — היא שלו. וזאת? שלך!”.</Li>
        </ul>
      </Guide>
      <Guide title="טעויות שנשמעות בגן — ומתי להתייעץ">
        <p>ילדים לומדים דקדוק בהדרגה, וטעויות רבות הן חלק רגיל מהדרך. בגיל הגן נשמעות אצל ילדים רבים, למשל:</p>
        <ul className="space-y-1.5">
          <Li><b>„שולחנים”, „ביצות”, „עפרונים”</b> — הילד/ה מחיל/ה את הכלל הרגיל גם על מילים מיוחדות.</Li>
          <Li><b>„אני ילך”, „אני יאכל”</b> במקום „אני אלך”, „אני אוכַל” — צורת העתיד בגוף ראשון מתייצבת מאוחר יחסית.</Li>
          <Li><b>„הילדות”</b> לקבוצה של בנים ובנות, או בלבול בין „שלו” ל„שלה”.</Li>
        </ul>
        <p>הטווח רחב: אצל רוב הילדים טעויות כאלה הולכות ופוחתות בין גיל 4 ל־6 בערך, ואצל חלק נשארות עוד קצת בצורות הנדירות. מה שחשוב יותר מטעות בודדת הוא התמונה הכללית.</p>
        <p><b>כדאי להתייעץ עם קלינאי/ת תקשורת</b> אם בגיל 4–5 המשפטים עדיין קצרים מאוד (2–3 מילים), אם הילד/ה כמעט לא משתמש/ת בעבר או בעתיד, אם קשה לו/לה להבין משפטים פשוטים, או אם יש לכם תחושה שמשהו לא מתקדם. ראו גם <Link to="/speech/parents/language-milestones" className="font-bold underline">התפתחות שפה לפי גיל</Link>.</p>
      </Guide>
      <Guide title="לקלינאיות ולגננות: רעיונות לעבודה">
        <ul className="space-y-1.5">
          <Li><b>הבנה לפני הבעה:</b> קודם „הראה לי הרבה כלבים” (בחירה בין תמונות), ורק אחר כך „מה יש כאן?”.</Li>
          <Li><b>מטרה אחת בכל פעם:</b> למשל רבים בנקבה, או עבר בגוף שלישי — עם הרבה דוגמאות של אותה תבנית.</Li>
          <Li><b>כרטיסי יחיד ורבים בלי מילים</b> מתאימים למשחק זיכרון, ל„דג” (בקשת קלף: „יש לך ביצים?”) ולמיון ל„אחד” ו„הרבה”.</Li>
          <Li><b>כרטיסי הזמנים:</b> מסדרים שורה לפי הסדר, ואז מספרים — „אתמול נועה אפתה עוגה, עכשיו…”. אפשר להחליף בין איתי לנועה כדי לתרגל גם זכר ונקבה.</Li>
          <Li><b>דפי „השלימו את המשפט”:</b> המבוגר קורא, הילד/ה בוחר/ת. בקבוצה — כל ילד/ה בתורו/ה, וכולם אומרים את המשפט המלא ביחד.</Li>
          <Li><b>תקשורת תומכת חליפית:</b> אפשר להצביע על התמונה או על כרטיס במקום לומר.</Li>
        </ul>
      </Guide>
      <section aria-labelledby="gr-src" className="rounded-2xl border border-[var(--border)] bg-white p-5 text-sm shadow-sm">
        <h2 id="gr-src" className="mb-2 text-lg font-bold">מקורות</h2>
        <ul className="space-y-1 leading-relaxed text-[var(--foreground)]/80">
          {GRAMMAR_SOURCES.map(s => <li key={s.title} className="mr-5 list-disc">{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.title}</a> : s.title}</li>)}
        </ul>
        <p className="mt-2 text-[var(--muted-foreground)]">הטווחים בעמוד הם כלליים ומנוסחים בזהירות; יש שונות גדולה בין ילדים, וגם בין ילדים דו־לשוניים לחד־לשוניים.</p>
      </section>
    </div>

    <div className="mt-12">
      <SeoBody paragraphs={[
        'דקדוק בגן הוא לא שינון כללים — זו היכולת לומר „שתי ביצים” ולא „שתי ביצות”, „הילדה רצה” ולא „הילדה רץ”, „מחר אני אלך” ולא „מחר אני ילך”. ילדים לומדים את זה בעיקר משמיעה: כשהם שומעים את הצורה הנכונה שוב ושוב, בשיחה ובמשחק, בהקשר שמעניין אותם.',
        'בעמוד ריכזנו את חמשת הנושאים שקלינאיות תקשורת וגננות עובדות עליהם הכי הרבה בגיל הגן: יחיד ורבים לגן (כולל רבים יוצאי דופן כמו עפרונות, ביצים, נשים וערים), זכר ונקבה לילדים (פעלים, תארים וצבעים), עבר הווה עתיד לגן עם תמונות של לפני, עכשיו ואחר כך, מילות שייכות (שלי, שלך, שלו, שלה) ובניית משפטים ארוכים עם ו, כי ואבל.',
        'כל המשחקים נבנו לשימוש ביחד — מבוגר וילד, או קבוצה קטנה בגן. אפשר להשתמש בהם כתרגול דקדוק לקלינאית תקשורת בטיפול, כפעילות בגן, או כמשחק קצר בבית. הדפים להדפסה עובדים גם בשחור־לבן.',
      ]} faq={faq} related={related} />
    </div>
  </div>
}

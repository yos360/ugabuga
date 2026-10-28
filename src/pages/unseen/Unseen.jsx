import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import QuickAnswer from '../../components/ui/QuickAnswer'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { SKILLS } from '../../data/unseen/levels.js'
import { UNSEEN_INDEX, UNSEEN_LEVELS, PATH_LANG, LANG_PATH, unseenHref, levelHref, testsOf, levelsOf, loadUnseen } from '../../data/unseen/library.js'
import { HUB_PARAGRAPHS, HUB_TIPS, HUB_FAQ, LANG_COPY, LEVEL_COPY } from './copy.js'
import '../../learn/learn.css'
import './unseen.css'

const HUB = { label: 'אנסין', href: '/unseen' }
const LANG_NAME = { en: 'באנגלית', he: 'בעברית' }
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>

// ── progress (this device only) ──
const KEY = 'buga-unseen'
const readProgress = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
function saveResult(slug, score, total, bySkill) {
  try {
    const p = readProgress(), skills = p.skills || {}
    for (const [s, [r, t]] of Object.entries(bySkill)) { const cur = skills[s] || [0, 0]; skills[s] = [cur[0] + r, cur[1] + t] }
    localStorage.setItem(KEY, JSON.stringify({ ...p, skills, done: { ...(p.done || {}), [slug]: [score, total] } }))
  } catch { /* private mode */ }
}
function useProgress() {
  const [p, setP] = useState({})
  useEffect(() => { setP(readProgress()) }, [])
  return p
}

function SkillSummary() {
  const p = useProgress()
  const rows = Object.entries(p.skills || {}).filter(([s, [, t]]) => SKILLS[s] && t > 0)
  if (!rows.length) return null
  return <section className="ln-box mb-8" aria-label="ההתקדמות שלי">
    <h2 className="mb-2 text-2xl font-black">📊 ההתקדמות שלי</h2>
    <p className="mb-3 text-sm text-[var(--muted-foreground)]">{Object.keys(p.done || {}).length} מבחנים הושלמו במכשיר הזה. כך הצלחתם בכל סוג שאלה:</p>
    <ul className="us-skills">{rows.sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([s, [r, t]]) => { const pct = Math.round((r / t) * 100)
      return <li key={s}><span>{SKILLS[s]}</span><span className="us-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span><b>{pct}%</b></li> })}</ul>
  </section>
}

function RandomTest() {
  const [pick, setPick] = useState(null)
  useEffect(() => { const done = readProgress().done || {}, fresh = UNSEEN_INDEX.filter(t => !done[t.slug]); const list = fresh.length ? fresh : UNSEEN_INDEX; setPick(list[Math.floor(Math.random() * list.length)] || null) }, [])
  if (!pick) return null
  return <p className="mb-6 text-center"><Link to={unseenHref(pick)} className="ln-btn go inline-block">🎲 אנסין אקראי — להתחיל עכשיו</Link></p>
}
function TestCard({ t }) {
  const p = useProgress(), done = p.done?.[t.slug]
  return <Link to={unseenHref(t)} className="ln-box card-lift us-card">
    <span className="us-card-meta">{t.genre} · {t.words} מילים · {t.questions} שאלות</span>
    <b className="us-card-title" dir={t.lang === 'en' ? 'ltr' : 'rtl'}>{t.title}</b>
    <span className="us-card-sum">{t.summary}</span>
    {done && <span className="us-done">✓ {done[0]}/{done[1]}</span>}
  </Link>
}
function LevelCards({ lang }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{levelsOf(lang).map(L => <Link key={L.id} to={levelHref(L)} className="ln-box card-lift us-level">
    <b>{L.name}</b><span>{L.words[0]}–{L.words[1]} מילים · {testsOf(lang, L.id).length} מבחנים</span></Link>)}</div>
}

// ── /unseen ──
export function UnseenHub() {
  return <Page>
    <SEO title="אנסין — תרגול Unseen באנגלית ובעברית לכיתות ה׳–י״ב ולבגרות" description={`${UNSEEN_INDEX.length} אנסינים מקוריים לתרגול: אנגלית לכיתות ה׳–ט׳ ולרמות 3, 4 ו־5 יחידות, ועברית לכיתות ז׳–ט׳ ולבגרות בלשון. שאלות אמריקאיות ופתוחות, הסבר לכל תשובה, טיימר והדפסה. בחינם.`} path="/unseen" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: HUB.label }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📝 </span>אנסין — תרגול באנגלית ובעברית</h1>
    <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">קטעי Unseen מקוריים לכיתות ה׳–י״ב ולבגרות, עם הסבר לכל תשובה</p>
    <QuickAnswer q="איפה אפשר לתרגל אנסין בחינם?" a={<>כאן: {UNSEEN_INDEX.length} אנסינים מקוריים — באנגלית לכיתות ה׳–ט׳ ולרמות 3, 4 ו־5 יחידות, ובעברית לכיתות ז׳–ט׳ ולבגרות בלשון. עם שאלות אמריקאיות ופתוחות, הסבר וסימון בטקסט לכל תשובה, טיימר למצב מבחן והדפסה עם דף תשובות.</>} />
    <div className="us-hero">
      <Link to="/unseen/english" className="us-hero-card is-en"><span aria-hidden="true">🇬🇧</span><b>אנסין באנגלית</b><small>ז׳ · ח׳ · ט׳ · 3, 4 ו־5 יחידות</small></Link>
      <Link to="/unseen/hebrew" className="us-hero-card is-he"><span aria-hidden="true">📖</span><b>אנסין בעברית</b><small>ט׳ · בגרות בלשון</small></Link>
    </div>
    <RandomTest />
    <SkillSummary />
    <h2 className="mb-3 mt-6 text-3xl font-black">🇬🇧 אנסין באנגלית</h2>
    <LevelCards lang="en" />
    <p className="mt-2"><Link to="/unseen/english" className="font-bold underline">כל האנסינים באנגלית ←</Link></p>
    <h2 className="mb-3 mt-8 text-3xl font-black">📖 אנסין בעברית</h2>
    <LevelCards lang="he" />
    <p className="mt-2"><Link to="/unseen/hebrew" className="font-bold underline">כל האנסינים בעברית ←</Link> · לכיתות ז׳–ח׳: <Link to="/learn/reading/grade-7" className="underline">הבנת הנקרא ז׳</Link>, <Link to="/learn/reading/grade-8" className="underline">ח׳</Link></p>
    <h2 className="mb-3 mt-10 text-3xl font-black">איך עובדים עם האנסינים כאן</h2>
    <div className="space-y-4 text-lg leading-relaxed">{HUB_PARAGRAPHS.map(p => <p key={p}>{p}</p>)}</div>
    <h2 className="mb-3 mt-10 text-3xl font-black">6 טיפים לאנסין מוצלח</h2>
    <ol className="us-tips">{HUB_TIPS.map(([h, t]) => <li key={h}><b>{h}.</b> {t}</li>)}</ol>
    <h2 className="mb-3 mt-10 text-3xl font-black">הרמות בקצרה</h2>
    <div className="overflow-x-auto"><table className="us-table"><thead><tr><th>רמה</th><th>אורך הטקסט</th><th>שאלות</th><th>זמן מוצע</th></tr></thead>
      <tbody>{UNSEEN_LEVELS.map(L => <tr key={L.lang + L.id}><td><Link to={levelHref(L)} className="underline">{LANG_NAME[L.lang]} · {L.name}</Link></td><td>{L.words[0]}–{L.words[1]} מילים{L.texts ? ` (${Array.isArray(L.texts) ? L.texts.join('–') : L.texts} טקסטים)` : ''}</td><td>{L.questions[0]}–{L.questions[1]}</td><td>{L.minutes} דק׳</td></tr>)}</tbody></table></div>
    <div className="mt-10"><SeoBody faq={HUB_FAQ} related={[{ href: '/learn/reading', label: 'הבנת הנקרא לכיתות א׳–ח׳' }, { href: '/english', label: 'אנגלית לילדים' }, { href: '/learn', label: 'לומדים — כל המקצועות' }]} /></div>
  </Page>
}

// ── /unseen/english, /unseen/hebrew ──
function UnseenLangPage({ lang }) {
  const C = LANG_COPY[lang], path = `/unseen/${LANG_PATH[lang]}`
  return <Page>
    <SEO title={C.seoTitle} description={C.seoDesc} path={path} structuredData={faqSchema(C.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: C.h1 }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📝 </span>{C.h1}</h1>
    <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">{C.sub}</p>
    <LevelCards lang={lang} />
    {levelsOf(lang).map(L => <section key={L.id} className="mt-8">
      <h2 className="mb-1 text-2xl font-black"><Link to={levelHref(L)} className="underline">{C.h1} — {L.name}</Link></h2>
      <p className="mb-3 text-[var(--muted-foreground)]">{L.about}</p>
      <div className="grid gap-3 sm:grid-cols-2">{testsOf(lang, L.id).map(t => <TestCard key={t.slug} t={t} />)}</div>
    </section>)}
    <div className="mt-10 space-y-4 text-lg leading-relaxed">{C.paragraphs.map(p => <p key={p}>{p}</p>)}</div>
    <div className="mt-8"><SeoBody faq={C.faq} related={[{ href: '/unseen', label: 'כל האנסינים' }, { href: lang === 'en' ? '/unseen/hebrew' : '/unseen/english', label: lang === 'en' ? 'אנסין בעברית' : 'אנסין באנגלית' }]} /></div>
  </Page>
}

// ── /unseen/<lang>/<level> ──
function UnseenLevelPage({ L }) {
  const C = LEVEL_COPY[`${L.lang}:${L.id}`] || { tips: [], faq: [] }
  const list = testsOf(L.lang, L.id)
  const name = `אנסין ${LANG_NAME[L.lang]} — ${L.name}`
  return <Page>
    <SEO title={`${name}: ${list.length} מבחנים עם שאלות ותשובות`} description={`${L.about} ${list.length} אנסינים מקוריים עם הסבר לכל תשובה, טיימר והדפסה. בחינם.`} path={levelHref(L)} structuredData={faqSchema(C.faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: LANG_COPY[L.lang].h1, href: `/unseen/${LANG_PATH[L.lang]}` }, { label: L.name }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📝 </span>{name}</h1>
    <p className="mb-6 text-center font-hand text-lg text-[var(--muted-foreground)]">{L.about}</p>
    <div className="us-facts"><span>📏 {L.words[0]}–{L.words[1]} מילים</span><span>❓ {L.questions[0]}–{L.questions[1]} שאלות</span><span>⏱️ כ־{L.minutes} דקות</span>{L.texts && <span>📚 {Array.isArray(L.texts) ? L.texts.join('–') : L.texts} טקסטים</span>}</div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">{list.map(t => <TestCard key={t.slug} t={t} />)}</div>
    {C.tips.length > 0 && <><h2 className="mb-3 mt-10 text-2xl font-black">איך להצליח ברמה הזאת</h2><ul className="us-tips">{C.tips.map(t => <li key={t}>{t}</li>)}</ul></>}
    <h2 className="mb-3 mt-10 text-2xl font-black">רמות נוספות</h2>
    <LevelCards lang={L.lang} />
    <div className="mt-8"><SeoBody faq={C.faq} related={[{ href: '/unseen', label: 'כל האנסינים' }, { href: `/unseen/${LANG_PATH[L.lang]}`, label: LANG_COPY[L.lang].h1 }]} /></div>
  </Page>
}

// ── one test ──
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// A paragraph with the highlighted evidence (if it is here). In English every word can be tapped for its
// meaning; the glossary words are marked, like in the exam.
function Para({ text, mark, gloss, en, he }) {
  const parts = []
  if (mark && text.includes(mark)) { const i = text.indexOf(mark); parts.push([text.slice(0, i)], [mark, true], [text.slice(i + mark.length)]) }
  else parts.push([text])
  const glossSet = new Set(gloss.map(([w]) => w.toLowerCase()))
  if (he) return parts.map(([s, isMark], i) => { const w = s.split(/([\u05D0-\u05EA][\u05D0-\u05EA״׳"']*[\u05D0-\u05EA])/).map((x, j) => (j % 2 ? <span key={j} className="us-w" data-word={x}>{x}</span> : x)); return isMark ? <mark key={i} className="us-mark" id="us-mark">{w}</mark> : <Fragment key={i}>{w}</Fragment> })
  const words = s => !en ? s : s.split(/([A-Za-z]+(?:['’][A-Za-z]+)?)/).map((x, i) => i % 2
    ? glossSet.has(x.toLowerCase()) ? <button key={i} type="button" className="us-gl" data-word={x}>{x}</button> : <span key={i} className="us-w" data-word={x}>{x}</span>
    : x)
  return parts.map(([s, isMark], i) => isMark ? <mark key={i} className="us-mark" id="us-mark">{words(s)}</mark> : <Fragment key={i}>{words(s)}</Fragment>)
}
const sentenceWith = (para, word) => (para.match(/[^.!?]+[.!?]*/g) || [para]).find(s => (/[a-z]/i.test(word) ? new RegExp(`\\b${esc(word)}\\b`, 'i').test(s) : s.includes(word)))?.trim() || ''
function TableText({ table }) {
  return <div className="overflow-x-auto"><table className="us-table"><caption>{table.caption}</caption><thead><tr>{table.head.map(h => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
}
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function UnseenTest({ t, L }) {
  const en = t.lang === 'en', dir = en ? 'ltr' : 'rtl'
  const [mode, setMode] = useState('practice')
  const [picks, setPicks] = useState({}) // mc: index; open: true/false after self-marking
  const [revealed, setRevealed] = useState({}) // open: model answer shown
  const [submitted, setSubmitted] = useState(false)
  const [mark, setMark] = useState(null)
  const [gloss, setGloss] = useState(null)
  const [left, setLeft] = useState(L.minutes * 60)
  const [printing, setPrinting] = useState(false)
  const [withAnswers, setWithAnswers] = useState(true)
  const [essay, setEssay] = useState('')
  const saved = useRef(false)
  const exam = mode === 'exam'
  const showResult = i => (exam ? submitted : picks[i] !== undefined)
  useEffect(() => {
    if (!exam || submitted) return
    const id = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [exam, submitted])
  useEffect(() => {
    if (!gloss) return
    const opened = Date.now(), y = window.scrollY
    const close = () => { if (Date.now() - opened > 400 && Math.abs(window.scrollY - y) > 40) setGloss(null) }
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [gloss])
  const qs = t.questions
  const answered = qs.filter((q, i) => picks[i] !== undefined).length
  const right = qs.filter((q, i) => (q.type === 'mc' ? picks[i] === q.answer : picks[i] === true)).length
  const finished = exam ? submitted : answered === qs.length
  useEffect(() => {
    if (!finished || saved.current) return
    saved.current = true
    const by = {}
    qs.forEach((q, i) => { const b = (by[q.skill] ||= [0, 0]); b[1]++; if (q.type === 'mc' ? picks[i] === q.answer : picks[i] === true) b[0]++ })
    saveResult(t.slug, right, qs.length, by)
  }, [finished]) // eslint-disable-line react-hooks/exhaustive-deps
  const reset = m => { setMode(m); setPicks({}); setRevealed({}); setSubmitted(false); setMark(null); setLeft(L.minutes * 60); saved.current = false }
  const show = ev => { setMark(ev); requestAnimationFrame(() => document.getElementById('us-mark')?.scrollIntoView({ behavior: 'smooth', block: 'center' })) }
  // Tapping a word: the glossary's meaning, else the built-in dictionary, else a meaning for this sentence.
  const onWord = e => {
    const el = e.target.closest('[data-word]')
    if (!el) { setGloss(null); return }
    const word = el.dataset.word, r = el.getBoundingClientRect(), at = { w: word, x: r.left + r.width / 2, y: r.bottom }
    const g = glossary.find(([w]) => w.toLowerCase() === word.toLowerCase())
    if (g) { setGloss({ ...at, he: g[1], src: 'glossary' }); return }
    setGloss({ ...at, he: null })
    const sentence = sentenceWith(el.closest('.us-p')?.textContent || '', word)
    void import('../../utils/wordMeaning').then(m => (en ? m.meaningOf(word, sentence, 'en') : m.meaningOf(word, sentence, 'he', 'he'))).then(res => setGloss(cur => (cur?.w === word ? { ...cur, he: res?.meaning || '', src: res?.source, other: res?.other } : cur)))
  }
  const say = word => void import('../../utils/wordMeaning').then(m => m.pronounce(word, en ? 'en' : 'he'))
  const glossary = t.glossary || []
  const essayWords = essay.trim() ? essay.trim().split(/\s+/).length : 0
  const scoreText = `${right} מתוך ${qs.length}`

  return <>
    <div className="us-modes" role="group" aria-label="מצב">
      <button type="button" className="ln-chip" aria-pressed={!exam} onClick={() => reset('practice')}>✏️ תרגול — משוב מיידי</button>
      <button type="button" className="ln-chip" aria-pressed={exam} onClick={() => reset('exam')}>⏱️ מבחן — {L.minutes} דקות</button>
      <button type="button" className="ln-chip" onClick={() => setPrinting(true)}>🖨️ להדפסה</button>
    </div>
    {exam && !submitted && <p className={`us-timer ${left === 0 ? 'is-over' : ''}`} role="timer" aria-live="off">⏱️ {fmt(left)}{left === 0 ? ' — הזמן נגמר, אפשר לסיים ולהגיש' : ''}</p>}
    <p className="mb-2 text-center text-sm text-[var(--muted-foreground)]">{en ? 'נגעו בכל מילה לתרגום ולהשמעה · מילים עם קו מקווקו — ברשימת המילים המוסברות' : 'מילה קשה? נגעו בה וקבלו הסבר קצר'}</p>

    <div className="us-passage" onClick={onWord}>
      {t.texts.map((x, ti) => <section key={ti} className="ln-box us-text" dir={dir} lang={t.lang}>
        {t.texts.length > 1 && <p className="us-text-label" dir="rtl">טקסט {ti + 1}</p>}
        {x.title && <h2 className="us-text-title">{x.title}</h2>}
        {(x.paragraphs || []).map((p, pi) => <p key={pi} className="us-p"><span className="us-pn" aria-label={`פסקה ${pi + 1}`}>{pi + 1}</span><Para text={p} mark={mark} gloss={glossary} en={en} he={!en} /></p>)}
        {x.table && <TableText table={x.table} />}
      </section>)}
      {gloss && <span className="us-pop" role="status" style={{ left: Math.min(Math.max(gloss.x, 120), window.innerWidth - 120), top: gloss.y + 6 }}>
        <button type="button" className="us-pop-say" onClick={e => { e.stopPropagation(); say(gloss.w) }} aria-label={`השמעת ${gloss.w}`}>🔊</button>
        <b dir={en ? 'ltr' : 'rtl'}>{gloss.w}</b> {en ? '=' : '—'} {gloss.he === null ? 'מחפשים…' : gloss.he || 'לא נמצא פירוש'}
        {gloss.other?.length > 0 && <small> ({gloss.other.join(', ')})</small>}
        {gloss.src === 'ai' && <small className="us-pop-note">{en ? 'תרגום אוטומטי לפי המשפט' : 'הסבר אוטומטי לפי המשפט'}</small>}</span>}
    </div>

    {en && glossary.length > 0 && <details className="ln-box mt-4"><summary className="cursor-pointer font-bold">📘 Glossary — מילים מוסברות</summary>
      <ul className="us-glossary">{glossary.map(([w, h]) => <li key={w}><b dir="ltr">{w}</b> — {h}</li>)}</ul></details>}

    <h2 className="mb-3 mt-8 text-2xl font-black">{en ? 'Questions' : 'שאלות'}</h2>
    <ol className="space-y-3">{qs.map((q, i) => {
      const done = showResult(i), ok = q.type === 'mc' ? picks[i] === q.answer : picks[i] === true
      return <li key={i} className="ln-q us-q">
        <p className="us-q-head"><span className="us-skill">{SKILLS[q.skill]}{t.texts.length > 1 && q.text != null ? ` · טקסט ${q.text + 1}` : ''}</span></p>
        <b className="block" dir={dir}>{i + 1}. {q.q}</b>
        {q.type === 'mc'
          ? <div dir={dir}>{q.options.map((o, j) => <button key={j} type="button" aria-pressed={picks[i] === j} disabled={done}
              onClick={() => setPicks(p => ({ ...p, [i]: j }))}
              className={`ln-opt ${en ? 'us-ltr' : ''} ${done && j === q.answer ? 'is-right' : ''} ${done && picks[i] === j && j !== q.answer ? 'is-wrong' : ''}`}>{'abcd'[j]}. {o}</button>)}</div>
          : <><textarea className="ln-ta mt-2" dir={dir} aria-label={`תשובה לשאלה ${i + 1}`} placeholder={en ? 'Write your answer here' : 'כתבו כאן את התשובה'} disabled={exam && submitted} />
            {(!exam || submitted) && (revealed[i]
              ? <div className="us-model"><p><b>תשובה לדוגמה:</b> <span dir={dir}>{q.answer}</span></p>
                  {picks[i] === undefined && <p className="mt-2 flex flex-wrap gap-2"><span>עניתם נכון?</span><button type="button" className="ln-chip" onClick={() => setPicks(p => ({ ...p, [i]: true }))}>✓ כן</button><button type="button" className="ln-chip" onClick={() => setPicks(p => ({ ...p, [i]: false }))}>✗ לא</button></p>}</div>
              : <button type="button" className="ln-chip mt-2" onClick={() => setRevealed(r => ({ ...r, [i]: true }))}>💡 תשובה לדוגמה</button>)}</>}
        {done && (q.type === 'mc' || picks[i] !== undefined) && <div className={`us-explain ${ok ? 'is-ok' : 'is-bad'}`}>
          <p><b>{ok ? '✓ נכון!' : '✗ לא בדיוק.'}</b> {q.explain}</p>
          {q.evidence && <button type="button" className="ln-chip mt-2" onClick={() => show(q.evidence)}>📍 הראו לי בטקסט</button>}
        </div>}
      </li>
    })}</ol>

    {t.writing && <section className="ln-box mt-6"><h2 className="mb-2 text-xl font-black">✍️ {en ? 'Writing task' : 'מטלת כתיבה'}</h2>
      <p dir={dir}>{t.writing.prompt}</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t.writing.words[0]}–{t.writing.words[1]} מילים</p>
      <textarea className="ln-ta mt-2 min-h-[180px]" dir={dir} value={essay} onChange={e => setEssay(e.target.value)} aria-label="מטלת הכתיבה" />
      <p className={`text-sm ${essayWords >= t.writing.words[0] && essayWords <= t.writing.words[1] ? 'text-green-700' : 'text-[var(--muted-foreground)]'}`}>{essayWords} מילים</p></section>}

    <div className="mt-6 text-center">
      {exam && !submitted && <button type="button" className="ln-btn go" onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>✓ סיום והגשה</button>}
      {finished && <Results t={t} L={L} picks={picks} right={right} />}
      {exam && submitted && qs.some(q => q.type === 'open') && <p className="text-sm text-[var(--muted-foreground)]">בשאלות הפתוחות — פתחו את התשובה לדוגמה וסמנו אם עניתם נכון, והציון יתעדכן.</p>}
      {!exam && !finished && <p className="text-sm text-[var(--muted-foreground)]">ענו על כל השאלות כדי לקבל ציון ({answered}/{qs.length})</p>}
      {(finished || submitted) && <button type="button" className="ln-btn alt mt-3" onClick={() => reset(mode)}>🔁 לנסות שוב</button>}
    </div>

    {printing && <PrintPreview title={t.title} onClose={() => setPrinting(false)}>
      <div className="no-print mb-3 text-center"><button type="button" className="ln-chip" aria-pressed={withAnswers} onClick={() => setWithAnswers(!withAnswers)}>✅ עם דף תשובות</button></div>
      <article className="buga-flow us-print" dir={dir} lang={t.lang}>
        <h2>{t.title}</h2>
        <p className="meta" dir="rtl">שם: ________________ · תאריך: __________ · אנסין {LANG_NAME[t.lang]} · {L.name}</p>
        {t.texts.map((x, ti) => <section key={ti}>{t.texts.length > 1 && <h3 dir="rtl">טקסט {ti + 1}{x.title ? `: ${x.title}` : ''}</h3>}{t.texts.length === 1 && x.title && <h3>{x.title}</h3>}
          {(x.paragraphs || []).map((p, pi) => <p key={pi}><b>({pi + 1})</b> {p}</p>)}{x.table && <TableText table={x.table} />}</section>)}
        {en && glossary.length > 0 && <p className="gloss"><b>Glossary:</b> {glossary.map(([w, h]) => `${w} – ${h}`).join(' · ')}</p>}
        <h3>{en ? 'Questions' : 'שאלות'}</h3>
        <ol>{qs.map((q, i) => <li key={i}><b>{q.q}</b>{q.type === 'mc' ? <ol type="a">{q.options.map(o => <li key={o}>{o}</li>)}</ol> : <><div className="write" /><div className="write" /></>}</li>)}</ol>
        {t.writing && <><h3>{en ? 'Writing task' : 'מטלת כתיבה'}</h3><p>{t.writing.prompt} ({t.writing.words[0]}–{t.writing.words[1]})</p></>}
      </article>
      {withAnswers && <article className="buga-flow us-print" dir="rtl"><h2>תשובות — {t.title}</h2>
        <ol>{qs.map((q, i) => <li key={i}><b dir={dir}>{q.type === 'mc' ? `${'abcd'[q.answer]}. ${q.options[q.answer]}` : q.answer}</b><br />{q.explain}</li>)}</ol></article>}
    </PrintPreview>}
  </>
}

// The score, how this test went per question type, and where to go next.
function Results({ t, L, picks, right }) {
  const qs = t.questions, pct = Math.round((right / qs.length) * 100)
  const by = {}
  qs.forEach((q, i) => { const b = (by[q.skill] ||= [0, 0]); b[1]++; if (q.type === 'mc' ? picks[i] === q.answer : picks[i] === true) b[0]++ })
  const weak = Object.entries(by).filter(([, [r, n]]) => r < n).map(([s]) => SKILLS[s])
  const levels = levelsOf(t.lang), li = levels.findIndex(l => l.id === L.id)
  const next = pct >= 85 && levels[li + 1] ? levels[li + 1] : pct < 50 && li > 0 ? levels[li - 1] : null
  const more = testsOf(t.lang, L.id).filter(x => x.slug !== t.slug && !readProgress().done?.[x.slug])
  const msg = pct === 100 ? 'מושלם! 🌟' : pct >= 85 ? 'מצוין! 🎉' : pct >= 70 ? 'יפה מאוד 👏' : pct >= 50 ? 'בדרך הנכונה 💪' : 'כדאי לתרגל עוד — זה בדיוק בשביל זה כאן 🌱'
  return <section className="us-results" role="status">
    <div className="us-ring" style={{ '--p': pct }}><b>{pct}%</b><span>{right}/{qs.length}</span></div>
    <p className="text-2xl font-black">{msg}</p>
    <ul className="us-res-skills">{Object.entries(by).map(([s, [r, n]]) => <li key={s} className={r === n ? 'ok' : 'bad'}>{r === n ? '✓' : '•'} {SKILLS[s]} <b>{r}/{n}</b></li>)}</ul>
    {weak.length > 0 && <p className="text-sm">כדאי לחזור על: {weak.join(', ')}. לחצו על "הראו לי בטקסט" בשאלות שטעיתם בהן.</p>}
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {more[0] && <Link to={unseenHref(more[0])} className="ln-btn go">האנסין הבא ←</Link>}
      {next && <Link to={levelHref(next)} className="ln-btn alt">{pct >= 85 ? `לעלות רמה: ${next.name}` : `לנסות רמה קלה יותר: ${next.name}`}</Link>}
    </div>
  </section>
}

function UnseenTestPage({ slug, lang }) {
  const meta = UNSEEN_INDEX.find(x => x.slug === slug && x.lang === lang)
  const [t, setT] = useState(null)
  useEffect(() => { let on = true; setT(null); if (meta) loadUnseen(slug).then(x => { if (on) setT(x) }); return () => { on = false } }, [slug, meta])
  const L = meta && UNSEEN_LEVELS.find(l => l.lang === lang && l.id === meta.level)
  const others = useMemo(() => (meta ? testsOf(lang, meta.level).filter(x => x.slug !== slug) : []), [meta, lang, slug])
  if (!meta || !L) return <NotFound />
  const kind = `אנסין ${LANG_NAME[lang]} ${L.name}`
  return <Page>
    <SEO title={`${meta.title} — ${kind} עם שאלות ותשובות`} description={`${meta.summary} ${meta.words} מילים, ${meta.questions} שאלות עם הסבר לכל תשובה, מצב מבחן עם טיימר והדפסה.`} path={unseenHref(meta)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, HUB, { label: LANG_COPY[lang].h1, href: `/unseen/${LANG_PATH[lang]}` }, { label: L.name, href: levelHref(L) }, { label: meta.title }]} />
    <p className="text-center text-sm font-bold text-[var(--muted-foreground)]">{kind} · {meta.genre}</p>
    <h1 className="mb-2 text-center text-3xl sm:text-4xl" dir={lang === 'en' ? 'ltr' : 'rtl'}>{meta.title}</h1>
    <p className="mb-5 text-center text-[var(--muted-foreground)]">{meta.summary}</p>
    {t ? <UnseenTest key={slug} t={t} L={L} /> : <p className="ln-box text-center" role="status">טוענים את האנסין…</p>}
    {others.length > 0 && <><h2 className="mb-3 mt-10 text-2xl font-black">עוד אנסינים ברמה הזאת</h2><div className="grid gap-3 sm:grid-cols-2">{others.map(x => <TestCard key={x.slug} t={x} />)}</div></>}
    <p className="mt-6"><Link to={levelHref(L)} className="font-bold underline">← {kind}: כל המבחנים</Link> · <Link to="/unseen" className="underline">כל האנסינים</Link></p>
  </Page>
}

// /unseen/:lang and /unseen/:lang/:x (x = a level path or a test slug)
export function UnseenRoute() {
  const { lang: lp, x } = useParams()
  const lang = PATH_LANG[lp]
  if (!lang) return <NotFound />
  if (!x) return <UnseenLangPage lang={lang} />
  const L = levelsOf(lang).find(l => l.path === x)
  if (L) return <UnseenLevelPage L={L} />
  return <UnseenTestPage slug={x} lang={lang} />
}

import { useEffect, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import './eretz-ir.css'

// Eretz-Ir (ארץ עיר) as a step-by-step flow a child can follow on a phone:
// 1 setup (pack, time, how we play) → 2 draw a letter → 3 write (sticky letter + timer) → 4 score → next round / summary.

const eretzIrFaq = [
  { q: 'איך משחקים ארץ עיר?', a: 'מגרילים אות, ובזמן קצוב כל שחקן כותב מילה שמתחילה באות הזו לכל קטגוריה – שם, עיר, ארץ, חיה, צומח, דומם ועוד. בסוף משווים: תשובה שרק לכם יש שווה 10 נקודות, תשובה שגם למישהו אחר יש שווה 5, ותשובה ריקה או לא נכונה – 0.' },
  { q: 'אפשר לשחק כמה ילדים על מכשיר אחד?', a: 'כן. בוחרים "כותבים על דף": המסך מגריל אות ומודד זמן, כל אחד כותב על דף משלו, ובסוף מוסיפים לכל שחקן נקודות בלחיצה. יש גם דף ארץ עיר מוכן להדפסה.' },
  { q: 'מתאים גם לילדים צעירים?', a: 'כן. בחבילה "קל" יש רק 5 קטגוריות פשוטות ואותיות נוחות, ואפשר לבחור זמן ארוך או משחק בלי טיימר.' },
]
const eretzIrBody = [
  'ארץ-עיר הוא אחד המשחקים הכי ותיקים שיש. הגרסה כאן שומרת על החוויה המוכרת ופותרת את הבעיות הקבועות: הגרלת אות הוגנת (בלי לחזור על אות שכבר יצאה), טיימר שכולם רואים, וספירת נקודות פשוטה בסוף כל סיבוב.',
  'ארץ-עיר מתאים במיוחד לשולחן שבת, לנסיעה ארוכה או כהפסקה בכיתה. לילדים שאוהבים גם שאלות ידע, טריוויה BUGA היא המשך טבעי.',
]
const eretzIrRelated = [{ label: 'טריוויה BUGA', href: '/tools/trivia-quiz' }, { label: 'הפכים ומילים נרדפות', href: '/words/opposites' }, { label: 'מתחם לכיתה', href: '/classroom' }]

const PACKS = {
  easy: { label: 'קל', emoji: '🟢', hint: 'לקטנים', categories: ['שם', 'חיה', 'מאכל', 'צבע', 'עיר'], letters: 'אבגדהולמנסקרשת' },
  classic: { label: 'קלאסי', emoji: '🌍', hint: 'כמו פעם', categories: ['ארץ', 'עיר', 'חי', 'צומח', 'דומם', 'שם', 'מקצוע', 'מאכל'], letters: 'אבגדהוזחטיכלמנסעפצקרשת' },
  party: { label: 'מסיבה', emoji: '🎉', hint: 'ליום הולדת', categories: ['שיר', 'מאכל', 'מתנה', 'משחק', 'סרט', 'חפץ בבית', 'בגד', 'ממתק'], letters: 'אבגדהולמנסקרשת' },
  funny: { label: 'מצחיק', emoji: '😂', hint: 'לצחוק', categories: ['תירוץ', 'כוח על', 'שם ללהקה', 'שם לחיית מחמד', 'מקצוע מומצא', 'חוק חדש'], letters: 'אבגדהולמנסקרשת' },
  custom: { label: 'שלי', emoji: '✏️', hint: 'בוחרים לבד', categories: ['שם', 'עיר', 'חיה'], letters: 'אבגדהוזחטיכלמנסעפצקרשת' },
}
const EMOJI = { שם: '🧒', עיר: '🏙️', ארץ: '🌍', מדינה: '🌍', חיה: '🐾', חי: '🐾', צומח: '🌱', דומם: '🪨', מקצוע: '👩‍🚒', מאכל: '🍕', צבע: '🎨', שיר: '🎵', מתנה: '🎁', משחק: '🎲', סרט: '🎬', 'חפץ בבית': '🛋️', בגד: '👕', ממתק: '🍬', תירוץ: '🙊', 'כוח על': '🦸', 'שם ללהקה': '🎸', 'שם לחיית מחמד': '🐶', 'מקצוע מומצא': '🤖', 'חוק חדש': '📜' }
const emo = c => EMOJI[c] || '✏️'
const TIMES = [{ s: 60, label: 'דקה' }, { s: 90, label: 'דקה וחצי' }, { s: 120, label: '2 דקות' }, { s: 180, label: '3 דקות' }, { s: 0, label: 'בלי טיימר' }]
const FINALS = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const startsWith = (word, letter) => { const w = word.trim().replace(/^[^א-ת]+/, ''); const f = w[0]; return !!f && (FINALS[f] || f) === letter }
const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function beep(freq = 880, ms = 180) {
  try { const a = new (window.AudioContext || window.webkitAudioContext)(); const o = a.createOscillator(), g = a.createGain(); o.frequency.value = freq; o.connect(g); g.connect(a.destination); g.gain.value = 0.08; o.start(); setTimeout(() => { o.stop(); a.close() }, ms) } catch { /* no audio */ }
}

function PrintSheet({ categories }) {
  return (
    <article className="buga-a4 ei-print">
      <h2>🗺️ ארץ עיר</h2>
      <p className="ei-print-sub"><span>שם: ______________</span><span>10 = רק לי · 5 = גם למישהו · 0 = ריק</span></p>
      <table>
        <thead><tr><th>אות</th>{categories.map(c => <th key={c}>{c}</th>)}<th>נק׳</th></tr></thead>
        <tbody>{Array.from({ length: 10 }, (_, i) => <tr key={i}><td />{categories.map(c => <td key={c} />)}<td /></tr>)}</tbody>
      </table>
      <footer>עוגה בוגה · ארץ עיר · ugabuga.co.il</footer>
    </article>
  )
}

export default function EretzIr() {
  const [phase, setPhase] = useState('setup') // setup | draw | write | score | summary
  const [pack, setPack] = useState('classic')
  const [custom, setCustom] = useState(PACKS.custom.categories)
  const [newCat, setNewCat] = useState('')
  const [time, setTime] = useState(90)
  const [mode, setMode] = useState('screen') // screen = one player types here, paper = everyone writes on paper
  const [players, setPlayers] = useState(['שחקן 1', 'שחקן 2'])
  const [letter, setLetter] = useState('')
  const [spin, setSpin] = useState('')
  const [used, setUsed] = useState([])
  const [left, setLeft] = useState(0)
  const [answers, setAnswers] = useState({})
  const [marks, setMarks] = useState({}) // screen mode: category -> 10/5/0
  const [totals, setTotals] = useState({}) // player -> total
  const [roundPts, setRoundPts] = useState({}) // paper mode: player -> points this round
  const [round, setRound] = useState(0)
  const [printing, setPrinting] = useState(false)
  const box = useRef(null)
  const inputs = useRef([])
  const categories = pack === 'custom' ? custom : PACKS[pack].categories
  const me = mode === 'screen' ? ['אני'] : players

  const top = () => setTimeout(() => box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  useEffect(() => { if (phase !== 'setup') top() }, [phase])

  // timer
  useEffect(() => {
    if (phase !== 'write' || !time) return
    if (left <= 0) { beep(440, 500); navigator.vibrate?.(300); setPhase('score'); return }
    if (left <= 5) beep(988, 90)
    const t = setTimeout(() => setLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, left, time])

  const draw = () => {
    const pool = [...PACKS[pack].letters].filter(l => !used.includes(l))
    const letters = pool.length ? pool : [...PACKS[pack].letters]
    const pick = letters[Math.floor(Math.random() * letters.length)]
    setPhase('draw'); setLetter('')
    let n = 0
    const iv = setInterval(() => {
      setSpin(letters[Math.floor(Math.random() * letters.length)])
      if (++n > 14) { clearInterval(iv); setSpin(''); setLetter(pick); setUsed(u => (pool.length ? [...u, pick] : [pick])); beep(660, 150) }
    }, 90)
  }
  const startWriting = () => {
    setAnswers({}); setMarks({}); setRoundPts({}); setLeft(time); setRound(r => r + 1); setPhase('write')
    setTimeout(() => inputs.current[0]?.focus(), 350)
  }
  const stop = () => { beep(523, 250); setPhase('score') }
  const autoMark = c => (answers[c] && startsWith(answers[c], letter) ? 10 : 0)
  const markOf = c => marks[c] ?? autoMark(c)
  const screenTotal = categories.reduce((s, c) => s + markOf(c), 0)
  const saveRound = () => {
    setTotals(t => {
      const n = { ...t }
      if (mode === 'screen') n['אני'] = (n['אני'] || 0) + screenTotal
      else for (const p of players) n[p] = (n[p] || 0) + (roundPts[p] || 0)
      return n
    })
  }
  const nextRound = () => { saveRound(); draw() }
  const endGame = () => { saveRound(); setPhase('summary') }
  const newGame = () => { setTotals({}); setUsed([]); setRound(0); setPhase('setup'); top() }
  const addPts = (p, d) => setRoundPts(r => ({ ...r, [p]: Math.max(0, (r[p] || 0) + d) }))
  const ranking = me.map(p => ({ p, pts: totals[p] || 0 })).sort((a, b) => b.pts - a.pts)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 ei" dir="rtl">
      <SEO title="ארץ עיר אונליין – משחק לכל המשפחה, עם טיימר, ניקוד ודף להדפסה" description="ארץ־עיר לילדים ולמשפחה: הגרלת אות, קטגוריות לפי גיל, טיימר, ספירת נקודות פשוטה ודף ארץ עיר להדפסה. משחקים בטלפון או על דף." path="/tools/eretz-ir" structuredData={faqSchema(eretzIrFaq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'ארץ־עיר' }]} />
      <h1 className="ei-title">🗺️ ארץ עיר</h1>

      <section ref={box} className="ei-box" aria-live="polite">
        {phase === 'setup' && <>
          <ol className="ei-how">
            <li><b>1</b><span>🎲 מגרילים אות</span></li>
            <li><b>2</b><span>✍️ כותבים מילה לכל נושא</span></li>
            <li><b>3</b><span>⭐ סופרים נקודות</span></li>
          </ol>

          <h2 className="ei-step">איזה ארץ עיר משחקים?</h2>
          <div className="ei-packs">
            {Object.entries(PACKS).map(([id, p]) => (
              <button key={id} type="button" className={pack === id ? 'is-on' : ''} aria-pressed={pack === id} onClick={() => setPack(id)}>
                <span className="ei-pack-emoji">{p.emoji}</span><b>{p.label}</b><small>{p.hint}</small>
              </button>
            ))}
          </div>
          <div className="ei-chips" aria-label="הנושאים">
            {categories.map(c => <span key={c}>{emo(c)} {c}{pack === 'custom' && categories.length > 1 && <button type="button" aria-label={`להסיר ${c}`} onClick={() => setCustom(x => x.filter(y => y !== c))}>✕</button>}</span>)}
          </div>
          {pack === 'custom' && <form className="ei-add" onSubmit={e => { e.preventDefault(); const v = newCat.trim(); if (v && !custom.includes(v) && custom.length < 12) setCustom(x => [...x, v]); setNewCat('') }}>
            <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="נושא חדש, למשל: ספורט" /><button type="submit">➕ הוספה</button>
          </form>}

          <h2 className="ei-step">כמה זמן לכל סיבוב?</h2>
          <div className="ei-row">{TIMES.map(t => <button key={t.s} type="button" className={time === t.s ? 'is-on' : ''} aria-pressed={time === t.s} onClick={() => setTime(t.s)}>{t.s ? '⏱️ ' : '♾️ '}{t.label}</button>)}</div>

          <h2 className="ei-step">איפה כותבים?</h2>
          <div className="ei-row ei-modes">
            <button type="button" className={mode === 'screen' ? 'is-on' : ''} aria-pressed={mode === 'screen'} onClick={() => setMode('screen')}>📱 <b>כאן במסך</b><small>משחקים לבד או כל אחד בטלפון שלו</small></button>
            <button type="button" className={mode === 'paper' ? 'is-on' : ''} aria-pressed={mode === 'paper'} onClick={() => setMode('paper')}>📝 <b>על דף</b><small>כמה ילדים ביחד, המסך מגריל ומודד זמן</small></button>
          </div>
          {mode === 'paper' && <div className="ei-players">
            {players.map((p, i) => <span key={i}><input value={p} aria-label={`שם שחקן ${i + 1}`} onChange={e => setPlayers(x => x.map((y, k) => k === i ? e.target.value : y))} />{players.length > 1 && <button type="button" aria-label="הסרת שחקן" onClick={() => setPlayers(x => x.filter((_, k) => k !== i))}>✕</button>}</span>)}
            {players.length < 8 && <button type="button" className="ei-addp" onClick={() => setPlayers(x => [...x, `שחקן ${x.length + 1}`])}>➕ שחקן</button>}
          </div>}

          <button type="button" className="ei-go" onClick={draw}>🎲 מתחילים!</button>
          <button type="button" className="ei-link" onClick={() => setPrinting(true)}>🖨️ דף ארץ עיר להדפסה</button>
        </>}

        {phase === 'draw' && <div className="ei-draw">
          <p className="ei-round">סיבוב {round + 1}</p>
          <p>{letter ? 'האות שיצאה:' : 'מגרילים אות…'}</p>
          <div className={`ei-letter${letter ? ' is-final' : ''}`}>{letter || spin}</div>
          {letter && <>
            <p className="ei-say">כל המילים צריכות להתחיל ב־<b>{letter}</b></p>
            <button type="button" className="ei-go" onClick={startWriting}>✍️ יאללה, כותבים!{time ? ` (${fmt(time)})` : ''}</button>
            <button type="button" className="ei-link" onClick={draw}>🔁 אות אחרת</button>
          </>}
        </div>}

        {phase === 'write' && <div className="ei-write">
          <div className="ei-bar">
            <span className="ei-bar-letter">{letter}</span>
            <span className="ei-bar-text">מילים ב־{letter}</span>
            {time > 0 && <span className={`ei-bar-time${left <= 10 ? ' is-low' : ''}`}>⏱️ {fmt(left)}</span>}
            {time > 0 && <span className="ei-bar-progress" style={{ width: `${(left / time) * 100}%` }} />}
          </div>
          {mode === 'screen' ? (
            <div className="ei-fields">
              {categories.map((c, i) => {
                const v = answers[c] || '', bad = v.trim() && !startsWith(v, letter)
                return <label key={c} className={v.trim() ? (bad ? 'is-bad' : 'is-ok') : ''}>
                  <span>{emo(c)} {c}</span>
                  <input ref={el => { inputs.current[i] = el }} value={v} enterKeyHint={i + 1 < categories.length ? 'next' : 'done'}
                    onChange={e => setAnswers(a => ({ ...a, [c]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); inputs.current[i + 1] ? inputs.current[i + 1].focus() : e.currentTarget.blur() } }}
                    placeholder={`${c} ב־${letter}…`} autoComplete="off" />
                  {bad && <small>⚠️ המילה צריכה להתחיל ב־{letter}</small>}
                </label>
              })}
            </div>
          ) : (
            <ul className="ei-paper-cats">{categories.map(c => <li key={c}>{emo(c)} {c} ב־{letter}</li>)}</ul>
          )}
          <button type="button" className="ei-stop" onClick={stop}>✋ עצור! סיימנו</button>
        </div>}

        {phase === 'score' && <div className="ei-score">
          <h2>⭐ סופרים נקודות – אות {letter}</h2>
          <p className="ei-rule">✅ 10 = רק לי · 🤝 5 = גם למישהו אחר · ❌ 0 = ריק או לא נכון</p>
          {mode === 'screen' ? <>
            <ul className="ei-marks">
              {categories.map(c => {
                const m = markOf(c)
                return <li key={c}>
                  <span className="ei-mark-q">{emo(c)} {c}: <b>{answers[c]?.trim() || '—'}</b></span>
                  <span className="ei-mark-btns">{[10, 5, 0].map(v => <button key={v} type="button" className={m === v ? 'is-on' : ''} aria-pressed={m === v} onClick={() => setMarks(x => ({ ...x, [c]: v }))}>{v === 10 ? '✅ 10' : v === 5 ? '🤝 5' : '❌ 0'}</button>)}</span>
                </li>
              })}
            </ul>
            <p className="ei-total">בסיבוב הזה: <b>{screenTotal}</b> נקודות</p>
          </> : <ul className="ei-marks">
            {players.map(p => <li key={p}>
              <span className="ei-mark-q">🧒 <b>{p}</b>: {roundPts[p] || 0} נק׳</span>
              <span className="ei-mark-btns"><button type="button" onClick={() => addPts(p, 10)}>+10</button><button type="button" onClick={() => addPts(p, 5)}>+5</button><button type="button" onClick={() => addPts(p, -5)}>−5</button></span>
            </li>)}
          </ul>}
          <div className="ei-actions">
            <button type="button" className="ei-go" onClick={nextRound}>🎲 סיבוב הבא</button>
            <button type="button" className="ei-link" onClick={endGame}>🏁 סיום המשחק</button>
          </div>
        </div>}

        {phase === 'summary' && <div className="ei-summary">
          <h2>🏆 סוף המשחק!</h2>
          <p>שיחקתם {round} סיבובים</p>
          <ol>{ranking.map((r, i) => <li key={r.p}><span>{['🥇', '🥈', '🥉'][i] || '⭐'} {r.p === 'אני' ? 'הניקוד שלי' : r.p}</span><b>{r.pts}</b></li>)}</ol>
          <button type="button" className="ei-go" onClick={newGame}>🔄 משחק חדש</button>
        </div>}

        {phase !== 'setup' && phase !== 'summary' && Object.keys(totals).length > 0 && <p className="ei-running">ניקוד עד עכשיו: {me.map(p => `${p === 'אני' ? 'אני' : p} ${totals[p] || 0}`).join(' · ')}</p>}
      </section>

      <div className="mt-10"><SeoBody paragraphs={eretzIrBody} faq={eretzIrFaq} related={eretzIrRelated} /></div>
      {printing && <PrintPreview title="דף ארץ עיר" onClose={() => setPrinting(false)}><PrintSheet categories={categories} /></PrintPreview>}
    </div>
  )
}

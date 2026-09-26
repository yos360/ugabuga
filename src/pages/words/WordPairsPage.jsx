import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { WORD_SETS, LEVELS, answersFor, distinctPairs, shuffle } from '../../data/wordPairs'
import './words.css'

// /words/opposites and /words/synonyms: three on-screen games (choose, memory, match) and
// printable worksheets that are generated fresh on every click, for three age levels.

const GAMES = [
  { id: 'choose', label: 'בחרו את התשובה', emoji: '✅' },
  { id: 'memory', label: 'משחק זיכרון', emoji: '🧠' },
  { id: 'match', label: 'חברו זוגות', emoji: '🔗' },
]

const Word = ({ w, e, level }) => <>{level === 1 && e && <span className="wp-emoji" aria-hidden="true">{e}</span>}<span>{w}</span></>

function makeQuestions(set, level, n = 10) {
  const pool = set.pairs.filter(p => p.level === level)
  return shuffle([...pool]).slice(0, n).map(p => {
    const flip = Math.random() < 0.5
    const word = flip ? p.b : p.a, answer = flip ? p.a : p.b
    const ew = flip ? p.eb : p.ea, ea = flip ? p.ea : p.eb
    const bad = answersFor(set, word); bad.add(word)
    const others = shuffle(pool.flatMap(q => [{ w: q.a, e: q.ea }, { w: q.b, e: q.eb }]).filter(o => !bad.has(o.w)))
    const opts = []
    for (const o of others) { if (opts.length === 3) break; if (!opts.some(x => x.w === o.w)) opts.push(o) }
    return { word, ew, answer, options: shuffle([{ w: answer, e: ea }, ...opts]) }
  })
}

function ChooseGame({ set, level }) {
  const [round, setRound] = useState(0)
  const qs = useMemo(() => makeQuestions(set, level), [set, level, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0), [picked, setPicked] = useState(null), [score, setScore] = useState(0)
  useEffect(() => { setI(0); setPicked(null); setScore(0) }, [qs])
  if (i >= qs.length) return (
    <div className="wp-done"><p className="wp-big">🎉 {score} מתוך {qs.length}</p><p>{score === qs.length ? 'מושלם! אלופים!' : score >= qs.length * 0.7 ? 'כל הכבוד!' : 'יפה! עוד סיבוב ותהיו אלופים'}</p>
      <button type="button" className="wp-primary" onClick={() => setRound(r => r + 1)}>🔁 סיבוב חדש</button></div>
  )
  const q = qs[i]
  const pick = o => { if (picked) return; setPicked(o.w); if (o.w === q.answer) setScore(s => s + 1) }
  return (
    <div className="wp-choose">
      <p className="wp-progress">שאלה {i + 1} מתוך {qs.length} · ⭐ {score}</p>
      <p className="wp-q">{level === 1 && q.ew && <span className="wp-emoji-big" aria-hidden="true">{q.ew}</span>}{set.question(q.word)}</p>
      <div className="wp-opts">
        {q.options.map(o => (
          <button key={o.w} type="button" disabled={!!picked}
            className={picked ? (o.w === q.answer ? 'is-right' : o.w === picked ? 'is-wrong' : '') : ''} onClick={() => pick(o)}>
            <Word w={o.w} e={o.e} level={level} />
          </button>
        ))}
      </div>
      {picked && <div className="wp-feedback" role="status">
        <p>{picked === q.answer ? '✔️ נכון!' : `✖️ לא בדיוק – ${set.rel}„${q.word}” הוא „${q.answer}”`}</p>
        <button type="button" className="wp-primary" onClick={() => { setI(i + 1); setPicked(null) }}>{i + 1 < qs.length ? 'לשאלה הבאה ←' : 'לתוצאה ←'}</button>
      </div>}
    </div>
  )
}

function MemoryGame({ set, level }) {
  const [round, setRound] = useState(0)
  const n = level === 1 ? 6 : 8
  const cards = useMemo(() => shuffle(distinctPairs(set.pairs.filter(p => p.level === level), Math.random, n)
    .flatMap((p, k) => [{ id: k + 'a', pair: k, w: p.a, e: p.ea }, { id: k + 'b', pair: k, w: p.b, e: p.eb }])), [set, level, round, n]) // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState([]), [found, setFound] = useState([]), [tries, setTries] = useState(0)
  useEffect(() => { setOpen([]); setFound([]); setTries(0) }, [cards])
  const flip = c => {
    if (open.length === 2 || open.includes(c.id) || found.includes(c.pair)) return
    const next = [...open, c.id]; setOpen(next)
    if (next.length === 2) {
      setTries(t => t + 1)
      const [x, y] = next.map(id => cards.find(k => k.id === id))
      setTimeout(() => { if (x.pair === y.pair) setFound(f => [...f, x.pair]); setOpen([]) }, x.pair === y.pair ? 350 : 900)
    }
  }
  const done = found.length === n
  return (
    <div>
      <p className="wp-progress">{done ? `🎉 מצאתם את כל ${n} הזוגות ב-${tries} ניסיונות!` : `הפכו שני קלפים ומצאו זוג של ${set.label} · זוגות: ${found.length}/${n}`}</p>
      <div className={`wp-memory n${n}`}>
        {cards.map(c => {
          const up = open.includes(c.id) || found.includes(c.pair)
          return <button key={c.id} type="button" className={`wp-card${up ? ' is-up' : ''}${found.includes(c.pair) ? ' is-found' : ''}`} onClick={() => flip(c)} aria-label={up ? c.w : 'קלף הפוך'}>
            {up ? <Word w={c.w} e={c.e} level={level} /> : <span aria-hidden="true">❓</span>}
          </button>
        })}
      </div>
      {done && <button type="button" className="wp-primary" onClick={() => setRound(r => r + 1)}>🔁 משחק חדש</button>}
    </div>
  )
}

function MatchGame({ set, level }) {
  const [round, setRound] = useState(0)
  const pairs = useMemo(() => distinctPairs(set.pairs.filter(p => p.level === level), Math.random, 5), [set, level, round]) // eslint-disable-line react-hooks/exhaustive-deps
  const right = useMemo(() => shuffle(pairs.map((p, k) => ({ k, w: p.b, e: p.eb }))), [pairs])
  const [sel, setSel] = useState(null), [done, setDone] = useState([]), [wrong, setWrong] = useState(null)
  useEffect(() => { setSel(null); setDone([]); setWrong(null) }, [pairs])
  const tryMatch = r => {
    if (sel === null || done.includes(r.k)) return
    if (r.k === sel) { setDone(d => [...d, sel]); setSel(null) } else { setWrong(r.k); setTimeout(() => setWrong(null), 600) }
  }
  const all = done.length === pairs.length
  return (
    <div>
      <p className="wp-progress">{all ? '🎉 כל הזוגות מחוברים!' : 'לחצו על מילה מימין ואז על בת הזוג שלה משמאל'}</p>
      <div className="wp-match">
        <div>{pairs.map((p, k) => <button key={k} type="button" disabled={done.includes(k)} className={`${sel === k ? 'is-sel' : ''}${done.includes(k) ? ' is-right' : ''}`} onClick={() => setSel(k)}><Word w={p.a} e={p.ea} level={level} /></button>)}</div>
        <div>{right.map(r => <button key={r.k} type="button" disabled={done.includes(r.k)} className={`${done.includes(r.k) ? 'is-right' : ''}${wrong === r.k ? ' is-wrong' : ''}`} onClick={() => tryMatch(r)}><Word w={r.w} e={r.e} level={level} /></button>)}</div>
      </div>
      {all && <button type="button" className="wp-primary" onClick={() => setRound(r => r + 1)}>🔁 זוגות חדשים</button>}
    </div>
  )
}

// ---- printable worksheets -------------------------------------------------------------
const SHEETS = [
  { id: 'lines', label: 'חברו בקו' },
  { id: 'write', label: 'כתבו את המילה' },
  { id: 'circle', label: 'הקיפו את התשובה' },
]
function buildSheet(set, level, kind) {
  const pool = set.pairs.filter(p => p.level === level)
  if (kind === 'lines') { const ps = distinctPairs(pool, Math.random, 8); return { kind, pairs: ps, right: shuffle(ps.map(p => p.b)) } }
  if (kind === 'write') return { kind, pairs: distinctPairs(pool, Math.random, 12).map(p => Math.random() < 0.5 ? p : { ...p, a: p.b, b: p.a, ea: p.eb, eb: p.ea }) }
  return { kind, qs: makeQuestions(set, level, level === 1 ? 8 : 10) }
}
function Sheet({ set, level, sheet, answers }) {
  const lvl = LEVELS.find(l => l.id === level).label
  const title = { lines: `${set.label}: חברו בקו`, write: `${set.label}: כתבו את המילה`, circle: `${set.label}: הקיפו את התשובה` }[sheet.kind]
  const instr = { lines: set.id === 'opposites' ? 'חברו בקו כל מילה להפך שלה.' : 'חברו בקו כל מילה למילה הנרדפת לה.', write: set.id === 'opposites' ? 'כתבו ליד כל מילה את ההפך שלה.' : 'כתבו ליד כל מילה מילה נרדפת.', circle: set.id === 'opposites' ? 'הקיפו את ההפך של כל מילה.' : 'הקיפו את המילה הנרדפת לכל מילה.' }[sheet.kind]
  return (
    <article className="buga-a4 wp-sheet">
      <h2>{answers ? `פתרון – ${title}` : title}</h2>
      <p className="wp-sheet-sub"><span>{instr} ({lvl})</span><span>שם: ______________</span></p>
      {sheet.kind === 'lines' && <div className="wp-s-lines">
        <ol>{sheet.pairs.map(p => <li key={p.a}><Word w={p.a} e={p.ea} level={level} /> <i>●</i>{answers && <b> ← {p.b}</b>}</li>)}</ol>
        <ul>{sheet.right.map(w => { const p = sheet.pairs.find(x => x.b === w); return <li key={w}><i>●</i> <Word w={w} e={p.eb} level={level} /></li> })}</ul>
      </div>}
      {sheet.kind === 'write' && <ol className="wp-s-write">{sheet.pairs.map(p => <li key={p.a}><span><Word w={p.a} e={p.ea} level={level} /></span><span className="wp-line">{answers ? p.b : ''}</span></li>)}</ol>}
      {sheet.kind === 'circle' && <ol className="wp-s-circle">{sheet.qs.map(q => <li key={q.word}><b>{level === 1 && q.ew && <span className="wp-emoji">{q.ew} </span>}{q.word}</b><span className="wp-copts">{q.options.map(o => <em key={o.w} className={answers && o.w === q.answer ? 'is-ans' : ''}>{o.w}</em>)}</span></li>)}</ol>}
      <footer>עוגה בוגה · {set.title} · ugabuga.co.il</footer>
    </article>
  )
}

export default function WordPairsPage({ setId }) {
  const set = WORD_SETS[setId]
  const other = WORD_SETS[setId === 'opposites' ? 'synonyms' : 'opposites']
  const [level, setLevel] = useState(1)
  const [game, setGame] = useState('choose')
  const [sheetKind, setSheetKind] = useState('lines')
  const [sheetSeed, setSheetSeed] = useState(0)
  const [withAnswers, setWithAnswers] = useState(true)
  const [printing, setPrinting] = useState(false)
  const sheet = useMemo(() => buildSheet(set, level, sheetKind), [set, level, sheetKind, sheetSeed])
  const isOpp = setId === 'opposites'
  const count = set.pairs.length

  const seo = isOpp ? {
    title: 'הפכים לילדים – משחקים, תרגול ודפי עבודה להדפסה',
    description: `${count} זוגות של הפכים לילדים לפי גיל: גן, כיתות א–ב וכיתות ג–ד. משחק זיכרון, בחירת ההפך וחיבור זוגות על המסך, ודפי עבודה להדפסה שנוצרים מחדש בכל לחיצה.`,
    h1: '🔄 הפכים לילדים – משחקים ודפי עבודה',
    intro: 'גדול–קטן, חם–קר, מותר–אסור: מתרגלים הפכים במשחק על המסך, או מדפיסים דף עבודה חדש בכל פעם. בוחרים שכבת גיל ומתחילים.',
  } : {
    title: 'מילים נרדפות לילדים – משחקים, תרגול ודפי עבודה להדפסה',
    description: `${count} זוגות של מילים נרדפות לילדים לפי גיל: גן, כיתות א–ב וכיתות ג–ד. משחקים על המסך ודפי עבודה להדפסה שנוצרים מחדש בכל לחיצה.`,
    h1: '🟰 מילים נרדפות לילדים – משחקים ודפי עבודה',
    intro: 'שמח–עליז, לחכות–להמתין, שמש–חמה: מילים שונות עם אותה משמעות. מתרגלים במשחק על המסך או מדפיסים דף עבודה חדש בכל פעם.',
  }
  const faq = isOpp ? [
    { q: 'מה זה הפכים?', a: 'הפכים הם זוג מילים שהמשמעות שלהן הפוכה, כמו גדול–קטן, יום–לילה או להדליק–לכבות. תרגול הפכים מרחיב אוצר מילים ועוזר לילדים להבין מילים חדשות דרך מילים שהם כבר מכירים.' },
    { q: 'מאיזה גיל אפשר לתרגל הפכים?', a: 'כבר בגן, עם זוגות פשוטים ותמונות (רמת "גן" באתר). בכיתות א–ב מוסיפים פעלים ומילים מופשטות יותר, ובכיתות ג–ד זוגות כמו זמני–קבוע ויתרון–חיסרון.' },
    { q: 'האם דפי העבודה בחינם?', a: 'כן. כל דף נוצר בדפדפן ברגע הלחיצה, ואפשר להדפיס או לשמור כ-PDF, כולל דף פתרונות.' },
  ] : [
    { q: 'מה זה מילים נרדפות?', a: 'מילים נרדפות הן מילים שונות עם משמעות זהה או קרובה מאוד, כמו שמח–עליז, לעזור–לסייע או שמש–חמה.' },
    { q: 'למה חשוב לתרגל מילים נרדפות?', a: 'היכרות עם מילים נרדפות מעשירה את השפה, עוזרת להבין טקסטים ולכתוב חיבורים מגוונים יותר בלי לחזור על אותה מילה.' },
    { q: 'האם דפי העבודה בחינם?', a: 'כן. כל דף נוצר בדפדפן ברגע הלחיצה, ואפשר להדפיס או לשמור כ-PDF, כולל דף פתרונות.' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 wp" dir="rtl">
      <SEO title={seo.title} description={seo.description} path={set.path} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: set.label }]} />
      <header className="wp-head"><h1>{seo.h1}</h1><p>{seo.intro}</p></header>

      <div className="wp-levels" role="radiogroup" aria-label="שכבת גיל">
        {LEVELS.map(l => <button key={l.id} type="button" role="radio" aria-checked={level === l.id} className={level === l.id ? 'is-on' : ''} onClick={() => setLevel(l.id)}>{l.label}{l.desc && <small> · {l.desc}</small>}</button>)}
      </div>

      <section className="wp-box" aria-label="משחקים">
        <div className="wp-tabs" role="tablist">
          {GAMES.map(g => <button key={g.id} type="button" role="tab" aria-selected={game === g.id} className={game === g.id ? 'is-on' : ''} onClick={() => setGame(g.id)}><span aria-hidden="true">{g.emoji}</span> {g.label}</button>)}
        </div>
        <div className="wp-stage" key={game + level}>
          {game === 'choose' && <ChooseGame set={set} level={level} />}
          {game === 'memory' && <MemoryGame set={set} level={level} />}
          {game === 'match' && <MatchGame set={set} level={level} />}
        </div>
      </section>

      <section className="wp-box" aria-label="דפי עבודה להדפסה">
        <h2>🖨️ דף עבודה להדפסה</h2>
        <div className="wp-tabs">
          {SHEETS.map(s => <button key={s.id} type="button" className={sheetKind === s.id ? 'is-on' : ''} onClick={() => setSheetKind(s.id)}>{s.label}</button>)}
        </div>
        <div className="wp-print-bar">
          <button type="button" className="wp-primary" onClick={() => setSheetSeed(s => s + 1)}>✨ דף חדש</button>
          <button type="button" onClick={() => setPrinting(true)}>🖨️ הדפסה / PDF</button>
          <label><input type="checkbox" checked={withAnswers} onChange={e => setWithAnswers(e.target.checked)} /> כולל דף פתרונות</label>
        </div>
        <div className="wp-paper"><Sheet set={set} level={level} sheet={sheet} /></div>
      </section>

      <section className="wp-box wp-list">
        <h2>📋 רשימת {set.label} לפי גיל</h2>
        {LEVELS.map(l => (
          <div key={l.id}>
            <h3>{set.label} ל{l.id === 1 ? 'גן' : l.label}</h3>
            <ul>{set.pairs.filter(p => p.level === l.id).map(p => <li key={p.a + p.b}>{p.a} <span>{set.joiner}</span> {p.b}</li>)}</ul>
          </div>
        ))}
      </section>

      <SeoBody faq={faq} />
      <p className="wp-more">אהבתם? נסו גם <Link to={other.path}>{other.emoji} {other.title}</Link>, <Link to="/printables/fine-motor">✏️ מוטוריקה עדינה</Link> ו<Link to="/printables/hebrew-letters">🔤 אותיות להדפסה</Link>.</p>

      {printing && <PrintPreview title={`${set.label} – דף עבודה`} onClose={() => setPrinting(false)}>
        {[<Sheet key="s" set={set} level={level} sheet={sheet} />, ...(withAnswers ? [<Sheet key="a" set={set} level={level} sheet={sheet} answers />] : [])]}
      </PrintPreview>}
    </div>
  )
}

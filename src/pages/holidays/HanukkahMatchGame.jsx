import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PATH, DECKS, MODES, GAMES, TEACH, FAQ, deckCards, common, layout } from '../../data/hanukkahMatchGame'

// /holidays/hanukkah/match-game: a spot-it style "find the match" Hanukkah card game —
// small deck (13 cards) and big deck (31 cards), pictures / picture+word / words only,
// played on screen or printed as round cards to cut out.

function Sevivon({ size }) {
  return <svg viewBox="0 0 40 52" style={{ width: size, height: size, display: 'block' }} aria-hidden="true">
    <rect x="17" y="1" width="6" height="11" rx="2" fill="#8a5a2b" />
    <path d="M6 12h28v20L20 50 6 32z" fill="#2f6fd6" stroke="#173b7a" strokeWidth="2" strokeLinejoin="round" />
    <path d="M6 32h28" stroke="#173b7a" strokeWidth="1.5" />
    <text x="20" y="27" textAnchor="middle" fontSize="15" fontWeight="900" fill="#ffd23f" fontFamily="Heebo, Arial, sans-serif">נ</text>
  </svg>
}

function Symbol({ s, mode, size, onPick, state }) {
  const pic = s.art === 'sevivon' ? <Sevivon size={`${size}em`} /> : <span style={{ fontSize: `${size}em`, lineHeight: 1 }} aria-hidden="true">{s.e}</span>
  const body = mode === 'words'
    ? <span style={{ fontSize: `${Math.max(0.55, size * 0.36)}em`, fontWeight: 900, whiteSpace: 'nowrap', lineHeight: 1.1 }}>{s.w}</span>
    : <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{pic}{mode === 'both' && <span style={{ fontSize: '0.5em', fontWeight: 800, whiteSpace: 'nowrap', marginTop: '0.1em' }}>{s.w}</span>}</span>
  if (!onPick) return body
  return <button type="button" onClick={() => onPick(s)} aria-label={s.w}
    className={`rounded-full p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-4 ${state === 'right' ? 'bg-emerald-200' : state === 'wrong' ? 'bg-rose-200' : ''}`}>{body}</button>
}

// A round card. unit is the font-size base that all symbol sizes scale from.
function Card({ syms, seed, mode, unit, diameter, onPick, marks = {} }) {
  const pos = layout(syms.length, seed)
  const base = syms.length > 4 ? 2.1 : 2.6
  return <div style={{ position: 'relative', width: diameter, height: diameter, borderRadius: '50%', border: '2px solid #6a4bb3', background: '#fffdf5', fontSize: unit, flex: 'none' }}>
    {syms.map((s, i) => {
      const p = pos[i]
      return <div key={s.id} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: `translate(-50%,-50%) rotate(${mode === 'pics' ? p.rot : Math.round(p.rot / 3)}deg)` }}>
        <Symbol s={s} mode={mode} size={base * p.scale} onPick={onPick} state={marks[s.id]} />
      </div>
    })}
  </div>
}

const ROUND = 10
const shuffle = (arr, r = Math.random) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }

function pickPair(len, prev) {
  for (;;) {
    const a = Math.floor(Math.random() * len)
    let b = Math.floor(Math.random() * (len - 1)); if (b >= a) b++
    if (!prev || prev[0] !== a || prev[1] !== b) return [a, b]
  }
}

function Play({ cards, mode }) {
  const [pair, setPair] = useState(() => pickPair(cards.length))
  const [found, setFound] = useState(0)
  const [marks, setMarks] = useState({})
  const [msg, setMsg] = useState('')
  const [start, setStart] = useState(() => Date.now())
  const [secs, setSecs] = useState(null)
  const [seeds, setSeeds] = useState(() => [Math.random() * 1e9, Math.random() * 1e9])
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const a = cards[pair[0]], b = cards[pair[1]]
  const shownA = useMemo(() => shuffle(a), [a])
  const shownB = useMemo(() => shuffle(b), [b])
  const match = common(a, b)[0]
  const done = secs !== null
  const pick = s => {
    if (done || marks[match.id] === 'right') return
    if (s.id === match.id) {
      setMarks({ [s.id]: 'right' })
      setMsg(`✔️ נכון! ${s.w}`)
      const n = found + 1
      setFound(n)
      timer.current = setTimeout(() => {
        if (n >= ROUND) { setSecs(Math.round((Date.now() - start) / 1000)); return }
        setPair(p => pickPair(cards.length, p)); setSeeds([Math.random() * 1e9, Math.random() * 1e9]); setMarks({}); setMsg('')
      }, 800)
    } else {
      setMarks(m => ({ ...m, [s.id]: 'wrong' }))
      setMsg(`${s.w} מופיע רק בקלף אחד — חפשו עוד`)
    }
  }
  const again = () => { setFound(0); setSecs(null); setMarks({}); setMsg(''); setStart(Date.now()); setPair(p => pickPair(cards.length, p)); setSeeds([Math.random() * 1e9, Math.random() * 1e9]) }
  const d = 'min(42vw, 300px)'
  return <div className="rounded-3xl border-2 border-[var(--border)] bg-indigo-50 p-4">
    <p className="mb-3 text-center text-lg font-bold">מצאו את התמונה שמופיעה בשני הקלפים, ולחצו עליה · {found} מתוך {ROUND}</p>
    {done
      ? <div className="rounded-2xl bg-amber-100 p-6 text-center text-2xl font-black" role="status">🎉 מצאתם {ROUND} זוגות ב־{secs} שניות!
          <div className="mt-3"><button type="button" onClick={again} className="ln-btn go">🔁 עוד סבב</button></div></div>
      : <div className="flex flex-wrap items-center justify-center gap-4">
          <Card syms={shownA} seed={seeds[0]} mode={mode} unit={`calc(${d} / 13)`} diameter={d} onPick={pick} marks={marks} />
          <Card syms={shownB} seed={seeds[1]} mode={mode} unit={`calc(${d} / 13)`} diameter={d} onPick={pick} marks={marks} />
        </div>}
    <p className="mt-3 min-h-[1.75rem] text-center text-lg font-bold" role="status" aria-live="polite">{msg}</p>
  </div>
}

function PrintCards({ cards, mode, deck }) {
  const pages = []
  for (let i = 0; i < cards.length; i += 6) pages.push(cards.slice(i, i + 6))
  const modeLabel = MODES.find(m => m.id === mode).label.replace(/^\S+\s/, '')
  return <>
    {pages.map((pg, k) => <article key={k} className="buga-a4" style={{ fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start' }}>
      <h2>🕎 מצא את הזהה — חנוכה · {deck.label} · {modeLabel} · עמוד {k + 1} מתוך {pages.length}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '3mm', justifyItems: 'center', width: '100%' }}>
        {pg.map((c, j) => <Card key={j} syms={c} seed={(k * 6 + j + 1) * 7919} mode={mode} unit="5.6mm" diameter="72mm" />)}
      </div>
    </article>)}
    <article className="buga-a4" style={{ fontFamily: 'Heebo, Arial, sans-serif', justifyContent: 'flex-start', textAlign: 'right' }}>
      <h2>🕎 מצא את הזהה — איך משחקים</h2>
      <p style={{ fontSize: 15, margin: '0 0 4mm', width: '100%' }}>בכל שני קלפים יש תמונה אחת בדיוק שמופיעה בשניהם. מי שמוצא אותה ראשון אומר את שמה בקול. גוזרים לפי העיגול; כדאי להדביק על קרטון.</p>
      {GAMES.map(g => <div key={g.title} style={{ border: '1px solid #ccc', borderRadius: 8, padding: '3mm', width: '100%', marginBottom: '3mm', fontSize: 14, lineHeight: 1.6 }}>
        <b style={{ fontSize: 16 }}>{g.emoji} {g.title}</b><br />{g.text}
      </div>)}
    </article>
  </>
}

export default function HanukkahMatchGame() {
  const [deckId, setDeckId] = useState('small')
  const [mode, setMode] = useState('both')
  const [print, setPrint] = useState(false)
  const deck = DECKS.find(d => d.id === deckId)
  const cards = useMemo(() => deckCards(deckId), [deckId])
  const chip = on => `min-h-[48px] rounded-full border-2 px-5 text-lg font-bold ${on ? 'border-slate-800 bg-amber-200' : 'border-[var(--border)] bg-white'}`
  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="משחק מצא את הזהה לחנוכה (בסגנון דאבל) — להדפסה ועל המסך"
      description="משחק קלפים לחנוכה שבו בכל שני קלפים יש תמונה אחת משותפת: חפיסה קטנה לגן (13 קלפים) וחפיסה גדולה (31 קלפים), בתמונות, בתמונה ומילה או במילים לתרגול קריאה. לשחק על המסך או להדפיס ולגזור, בחינם."
      path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חנוכה', href: '/holidays/hanukkah' }, { label: 'מצא את הזהה' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🕎 מצא את הזהה: משחק קלפים לחנוכה</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">בכל שני קלפים יש תמונה אחת בדיוק שמופיעה בשניהם — סביבון, סופגנייה, פך שמן ועוד. משחקים על המסך, או מדפיסים חפיסה שלמה לגזירה, עם מילים בעברית לתרגול קריאה.</p>

    <nav className="mb-3 flex flex-wrap justify-center gap-2" aria-label="בחירת חפיסה">
      {DECKS.map(d => <button key={d.id} type="button" aria-pressed={d.id === deckId} onClick={() => setDeckId(d.id)} className={chip(d.id === deckId)}>{d.emoji} {d.label}</button>)}
    </nav>
    <p className="mb-3 text-center text-[var(--muted-foreground)]">{deck.desc}</p>
    <nav className="mb-6 flex flex-wrap justify-center gap-2" aria-label="מה מופיע על הקלפים">
      {MODES.map(m => <button key={m.id} type="button" aria-pressed={m.id === mode} onClick={() => setMode(m.id)} className={chip(m.id === mode)}>{m.label}</button>)}
    </nav>

    <section className="mb-6" aria-labelledby="play-h">
      <h2 id="play-h" className="mb-3 text-3xl font-black">🎮 משחקים על המסך</h2>
      <Play key={deckId} cards={cards} mode={mode} />
    </section>

    <div className="mb-8 flex flex-wrap justify-center gap-3">
      <button type="button" onClick={() => setPrint(true)} className="ln-btn go">🖨️ הדפסת הקלפים ({cards.length} קלפים, {Math.ceil(cards.length / 6)} עמודים + כללים)</button>
    </div>

    <section className="mb-8" aria-labelledby="games-h">
      <h2 id="games-h" className="mb-3 text-3xl font-black">🃏 ארבע דרכים לשחק</h2>
      <ol className="grid gap-3 sm:grid-cols-2">
        {GAMES.map(g => <li key={g.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <p className="text-xl font-bold"><span aria-hidden="true">{g.emoji}</span> {g.title}</p>
          <p className="mt-1 leading-relaxed">{g.text}</p>
        </li>)}
      </ol>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5" aria-labelledby="teach-h">
      <h2 id="teach-h" className="mb-3 text-2xl font-black">🍎 לגננת ולמורה</h2>
      <ul className="grid gap-3 sm:grid-cols-2">{TEACH.map(([e, t, d]) => <li key={t} className="rounded-2xl bg-white p-4"><p className="text-xl font-bold"><span aria-hidden="true">{e}</span> {t}</p><p className="mt-1 leading-relaxed">{d}</p></li>)}</ul>
    </section>

    <section className="mb-8" aria-labelledby="why-h">
      <h2 id="why-h" className="mb-2 text-2xl font-black">🔍 למה תמיד יש בדיוק תמונה אחת משותפת?</h2>
      <p className="text-lg leading-relaxed">הקלפים בנויים לפי מבנה מתמטי שנקרא "מישור פרויקטיבי": כל קלף הוא כמו קו, וכל תמונה היא כמו נקודה. בכל שני קווים יש נקודה משותפת אחת בדיוק. בחפיסה הקטנה יש 13 תמונות, וכל אחת מופיעה ב־4 קלפים; בגדולה יש 31 תמונות, וכל אחת מופיעה ב־6 קלפים. ילדים גדולים יכולים לבדוק את זה בעצמם — שאלה יפה לשיעור חשבון.</p>
    </section>

    {print && <PrintPreview title={`מצא את הזהה לחנוכה — ${deck.label}`} onClose={() => setPrint(false)}><PrintCards cards={cards} mode={mode} deck={deck} /></PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד משחקים לחנוכה: <Link className="font-bold underline" to="/holidays/hanukkah/sevivon">סביבון וירטואלי</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/escape-room">חדר בריחה</Link> · <Link className="font-bold underline" to="/holidays/hanukkah/quiz">חידון חנוכה</Link> · <Link className="font-bold underline" to="/printables/activity/find-differences/hanukkah">מצאו את ההבדלים</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'משחק "מצא את הזהה" הוא משחק מהירות והתבוננות: מניחים שני קלפים עגולים, ומחפשים את התמונה היחידה שמופיעה בשניהם. כאן הוא מגיע בגרסת חנוכה — חנוכייה, סביבון, סופגנייה, לביבה, פך שמן, מטבעות של דמי חנוכה, הפיל של צבא היוונים, ועוד סמלים של החורף כמו מטרייה, צעיף ופתית שלג.',
      'יש שתי חפיסות: חפיסה קטנה של 13 קלפים עם 4 תמונות בכל קלף, שמתאימה לגן ולמשחק של כולם ביחד, וחפיסה גדולה של 31 קלפים עם 6 תמונות, לכיתות ולמשפחה. אפשר לבחור תמונות בלבד, תמונה עם מילה מתחת, או מילים בלבד — וכך המשחק הופך לתרגול קריאה לכיתות א׳–ב׳. משחקים על המסך בסבבים של 10 זוגות, או מדפיסים 6 קלפים בעמוד, גוזרים ומשחקים במסיבת החנוכה, בגן ובבית.',
    ]} faq={FAQ} related={[{ label: 'הכול על חנוכה', href: '/holidays/hanukkah' }, { label: 'סיפורי חנוכה לגן', href: '/holidays/hanukkah/kindergarten-stories' }, { label: 'חשבון של חנוכה', href: '/holidays/hanukkah/math' }, { label: 'התאמת מילה לתמונה — חנוכה', href: '/printables/activity/match-word/hanukkah' }]} /></div>
  </div>
}

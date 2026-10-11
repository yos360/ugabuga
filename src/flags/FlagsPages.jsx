import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import NotFound from '../pages/NotFound'
import { shareLink, shareOnWhatsApp } from '../utils/share'
import { WORLD_COUNTRIES, CONTINENTS, CONTINENT_BY_SLUG, COUNTRY_BY_CODE, FLAG_NOTES, byHebrewName, countriesOf, flagSrc } from './flagsData'
import { LEVELS, buildRound, resultText, shuffle } from './flagQuiz'
import { COLORING_FLAGS, PAINT, flagRegions } from './coloringFlags'
import { CONTINENT_COPY, HUB_FAQ, HUB_PARAGRAPHS, QUIZ_FAQ, QUIZ_PARAGRAPHS, PRINT_FAQ, PRINT_PARAGRAPHS } from './flagsCopy'
import '../learn/learn.css'

const HOME = { label: 'ראשי', href: '/' }
const DISCOVER = { label: 'עולם ומדע', href: '/discover' }
const HUB = { label: 'דגלי מדינות', href: '/flags' }
const Page = ({ children }) => <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>
const Head = ({ emoji, h1, lead }) => <>
  <h1 className="text-4xl sm:text-5xl text-center mb-3"><span aria-hidden="true">{emoji} </span>{h1}</h1>
  <p className="mx-auto mb-6 max-w-3xl text-center text-lg leading-relaxed">{lead}</p>
</>

export function FlagImg({ code, className = '', eager = false, alt }) {
  const c = COUNTRY_BY_CODE[code]
  return <img src={flagSrc(code)} alt={alt ?? (c ? `הדגל של ${c.name}` : '')} width="64" height="48" loading={eager ? 'eager' : 'lazy'} decoding="async"
    className={`block rounded-[4px] border border-[#c9ccd6] bg-white object-cover ${className}`} />
}

const norm = s => String(s || '').replace(/[׳'`"״\-־]/g, '').replace(/\s+/g, ' ').trim()

function FlagCard({ c, showContinent }) {
  return <div className="ln-q flex items-center gap-3">
    <FlagImg code={c.code} className="h-12 w-16 shrink-0" />
    <div className="min-w-0">
      <b className="block leading-tight">{c.name}</b>
      <div className="text-sm">בירה: <b>{c.capital}</b></div>
      {showContinent && <div className="text-xs text-[var(--muted-foreground)]">{CONTINENT_BY_SLUG[c.continent].name}</div>}
    </div>
  </div>
}

function FlagGrid({ list, showContinent }) {
  return <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-label="רשימת מדינות ודגלים">
    {list.map(c => <li key={c.code}><FlagCard c={c} showContinent={showContinent} /></li>)}
  </ul>
}

const MoreLinks = ({ current }) => <nav aria-label="עוד באזור הדגלים" className="mt-8 flex flex-wrap justify-center gap-2">
  {[['/flags', '🌍 כל דגלי המדינות'], ['/flags/quiz', '🎯 חידון דגלים'], ['/flags/print', '🖨️ דגלים להדפסה'], ['/discover/capitals', '🏛️ חידון בירות'], ['/trivia/countries-flags', '❓ טריוויה על דגלים']]
    .filter(([to]) => to !== current).map(([to, l]) => <Link key={to} to={to} className="ln-chip">{l}</Link>)}
</nav>

// ── /flags (hub) ─────────────────────────────
const SHOWCASE = { europe: ['fr', 'it', 'gb', 'de'], asia: ['il', 'jp', 'in', 'kr'], africa: ['za', 'eg', 'ke', 'ng'], 'north-america': ['us', 'ca', 'mx', 'jm'], 'south-america': ['br', 'ar', 'co', 'cl'], oceania: ['au', 'nz', 'fj', 'pg'] }
export function FlagsHub() {
  const [q, setQ] = useState('')
  const [cont, setCont] = useState('all')
  const [sort, setSort] = useState('az')
  const list = useMemo(() => {
    const nq = norm(q)
    const l = WORLD_COUNTRIES.filter(c => (cont === 'all' || c.continent === cont) && (!nq || norm(c.name).includes(nq) || norm(c.capital).includes(nq)))
    const sorted = [...l].sort(byHebrewName)
    if (sort === 'za') sorted.reverse()
    if (sort === 'continent') sorted.sort((a, b) => CONTINENTS.findIndex(x => x.slug === a.continent) - CONTINENTS.findIndex(x => x.slug === b.continent))
    return sorted
  }, [q, cont, sort])
  return <Page>
    <SEO title="דגלי מדינות — כל דגלי העולם עם שמות ובירות" description={`דגלי מדינות: כל ${WORLD_COUNTRIES.length} דגלי העולם עם שם המדינה בעברית, הבירה והיבשת. חיפוש דגל של מדינות, סינון לפי יבשת, חידון דגלים ודגלים להדפסה.`} path="/flags" structuredData={faqSchema(HUB_FAQ)} />
    <Breadcrumbs items={[HOME, DISCOVER, { label: 'דגלי מדינות' }]} />
    <Head emoji="🌍" h1="דגלי מדינות" lead={`כל דגלי המדינות במקום אחד: ${WORLD_COUNTRIES.length} דגלי העולם, עם שם המדינה בעברית, הבירה והיבשת. מחפשים דגל של מדינה מסוימת? כתבו את השם בתיבת החיפוש, או סננו לפי יבשת.`} />

    <div className="ln-box mb-4 space-y-3">
      <label className="block font-bold">חיפוש מדינה או בירה
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="למשל: יפן, פריז, ברזיל…" className="mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 text-lg font-normal" />
      </label>
      <div role="group" aria-label="סינון לפי יבשת" className="flex flex-wrap gap-2">
        <Chip on={cont === 'all'} onClick={() => setCont('all')}>כל העולם</Chip>
        {CONTINENTS.map(c => <Chip key={c.slug} on={cont === c.slug} onClick={() => setCont(c.slug)}>{c.name}</Chip>)}
      </div>
      <div className="flex flex-wrap items-center gap-2"><span className="font-bold">מיון:</span>
        <Chip on={sort === 'az'} onClick={() => setSort('az')}>א–ת</Chip>
        <Chip on={sort === 'za'} onClick={() => setSort('za')}>ת–א</Chip>
        <Chip on={sort === 'continent'} onClick={() => setSort('continent')}>לפי יבשת</Chip>
      </div>
    </div>
    <p className="mb-3 font-bold" aria-live="polite">{list.length ? (list.length === 1 ? 'נמצאה מדינה אחת' : `מוצגות ${list.length} מדינות`) : 'לא מצאנו מדינה בשם הזה. נסו לכתוב חלק מהשם.'}</p>
    <FlagGrid list={list} showContinent={cont === 'all'} />

    <h2 className="mt-12 mb-3 text-3xl font-black text-center">דגלי העולם לפי יבשות</h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {CONTINENTS.map(c => { const l = countriesOf(c.slug); return <Link key={c.slug} to={`/flags/continents/${c.slug}`} className="ln-box card-lift block">
        <div className="mb-2 flex gap-1">{SHOWCASE[c.slug].map(code => COUNTRY_BY_CODE[code]).map(x => <FlagImg key={x.code} code={x.code} className="h-7 w-9" alt="" />)}</div>
        <h3 className="text-xl font-black">דגלי {c.name}</h3><p className="m-0 text-sm text-[var(--muted-foreground)]">{l.length} מדינות</p></Link> })}
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      <Link to="/flags/quiz" className="ln-box card-lift block"><h3 className="text-xl font-black">🎯 חידון דגלים</h3><p className="m-0">רואים דגל ובוחרים את המדינה מתוך ארבע אפשרויות — שלוש רמות קושי ורצף תשובות נכונות.</p></Link>
      <Link to="/flags/print" className="ln-box card-lift block"><h3 className="text-xl font-black">🖨️ דגלים להדפסה</h3><p className="m-0">כרטיסיות דגלים צבעוניות ודגלים לצביעה עם מקרא צבעים — לכיתה ולבית.</p></Link>
    </div>
    <MoreLinks current="/flags" />
    <div className="mt-12"><SeoBody paragraphs={HUB_PARAGRAPHS} faq={HUB_FAQ} related={[{ label: 'חידון בירות העולם', href: '/discover/capitals' }, { label: 'טריוויה על דגלים', href: '/trivia/countries-flags' }, { label: 'עולם ומדע', href: '/discover' }]} /></div>
    <p className="mt-6 text-xs text-[var(--muted-foreground)]">איורי הדגלים: flag-icons (רישיון MIT). כל הדגלים מוצגים במסגרת אחידה של 4:3 כדי שיהיה נוח להשוות ביניהם.</p>
  </Page>
}

// ── /flags/continents/:continent ─────────────────
export function FlagsContinent() {
  const { continent } = useParams()
  const c = CONTINENT_BY_SLUG[continent]
  if (!c) return <NotFound />
  const list = countriesOf(c.slug)
  const copy = CONTINENT_COPY[c.slug]
  return <Page>
    <SEO title={`דגלי ${c.name} — ${list.length} דגלים עם שמות ובירות`} description={`דגלי ${c.name}: כל ${list.length} הדגלים של מדינות ${c.name} עם שם המדינה והבירה. ${copy.meta}`} path={`/flags/continents/${c.slug}`} structuredData={faqSchema(copy.faq)} />
    <Breadcrumbs items={[HOME, DISCOVER, HUB, { label: `דגלי ${c.name}` }]} />
    <Head emoji={c.emoji} h1={`דגלי ${c.name}`} lead={copy.lead} />
    <div className="mb-6 flex flex-wrap justify-center gap-2">
      <Link to={`/flags/quiz?continent=${c.slug}`} className="ln-btn go">🎯 חידון דגלי {c.name}</Link>
      <Link to={`/flags/print?continent=${c.slug}`} className="ln-btn alt">🖨️ כרטיסיות להדפסה</Link>
    </div>
    <FlagGrid list={list} />
    {copy.tips && <div className="ln-box mt-8"><h2 className="text-2xl font-black">איך מבדילים בין דגלים דומים</h2><ul className="mt-2 list-disc space-y-1 pr-5">{copy.tips.map(t => <li key={t}>{t}</li>)}</ul></div>}
    <h2 className="mt-10 mb-3 text-2xl font-black text-center">דגלים של יבשות אחרות</h2>
    <nav aria-label="יבשות אחרות" className="flex flex-wrap justify-center gap-2">{CONTINENTS.filter(x => x.slug !== c.slug).map(x => <Link key={x.slug} to={`/flags/continents/${x.slug}`} className="ln-chip">{x.emoji} דגלי {x.name}</Link>)}</nav>
    <MoreLinks current="" />
    <div className="mt-12"><SeoBody paragraphs={copy.paragraphs} faq={copy.faq} related={[{ label: 'כל דגלי המדינות', href: '/flags' }, { label: 'חידון דגלים', href: '/flags/quiz' }, { label: 'חידון בירות', href: '/discover/capitals' }]} /></div>
  </Page>
}

// ── /flags/quiz ─────────────────────────────
const BEST_KEY = 'ugabuga-flags-best-streak'
const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 } }
const saveBest = n => { try { localStorage.setItem(BEST_KEY, String(n)) } catch { /* private mode */ } }

export function FlagsQuiz() {
  const [params] = useSearchParams()
  const initialCont = CONTINENT_BY_SLUG[params.get('continent')] ? params.get('continent') : 'all'
  const initialLevel = LEVELS.some(l => l.id === params.get('level')) ? params.get('level') : 'easy'
  const [level, setLevel] = useState(initialLevel)
  const [cont, setCont] = useState(initialCont)
  const [round, setRound] = useState(null) // { qs, i, pick, score, streak, bestStreak, wrong: [] }
  const [best, setBest] = useState(readBest)
  const start = () => setRound({ qs: buildRound({ level, continent: cont }), i: 0, pick: null, score: 0, streak: 0, bestStreak: 0, wrong: [] })
  const q = round && round.i < round.qs.length ? round.qs[round.i] : null
  // warm up the next flag so it appears instantly
  useEffect(() => { const next = round?.qs[round.i + 1]; if (next) { const im = new Image(); im.src = flagSrc(next.answer) } }, [round])
  const choose = code => {
    if (!q || round.pick) return
    const ok = code === q.answer
    const streak = ok ? round.streak + 1 : 0
    const bestStreak = Math.max(round.bestStreak, streak)
    if (bestStreak > best) { setBest(bestStreak); saveBest(bestStreak) }
    setRound({ ...round, pick: code, score: round.score + (ok ? 1 : 0), streak, bestStreak, wrong: ok ? round.wrong : [...round.wrong, { answer: q.answer, picked: code }] })
  }
  const next = () => setRound({ ...round, i: round.i + 1, pick: null })
  const levelName = LEVELS.find(l => l.id === level).name
  const contName = cont === 'all' ? '' : CONTINENT_BY_SLUG[cont].name
  const share = () => shareOnWhatsApp(`${resultText({ score: round.score, total: round.qs.length, bestStreak: round.bestStreak, levelName, continentName: contName })}\n${shareLink('/flags/quiz', 'flags_quiz')}`)

  return <Page>
    <SEO title="חידון דגלים — מזהים את דגלי העולם (4 תשובות לבחירה)" description="חידון דגלים לילדים ולכל המשפחה: רואים דגל ובוחרים את המדינה מתוך 4 תשובות. שלוש רמות קושי, חידון לפי יבשת, רצף תשובות נכונות ושיתוף התוצאה בוואטסאפ." path="/flags/quiz" structuredData={faqSchema(QUIZ_FAQ)} />
    <Breadcrumbs items={[HOME, DISCOVER, HUB, { label: 'חידון דגלים' }]} />
    <Head emoji="🎯" h1="חידון דגלים" lead="חידון דגלים בעברית: מופיע דגל, ובוחרים לאיזו מדינה הוא שייך מתוך ארבע תשובות. בוחרים רמה ויבשת, צוברים רצף של תשובות נכונות — ובסוף שולחים את התוצאה לחברים." />

    {!round && <div className="ln-box mx-auto max-w-2xl space-y-4">
      <div><h2 className="mb-2 text-xl font-black">רמת קושי</h2>
        <div role="group" aria-label="רמת קושי" className="grid gap-2 sm:grid-cols-3">{LEVELS.map(l => <button key={l.id} type="button" aria-pressed={level === l.id} onClick={() => setLevel(l.id)} className="ln-opt !mt-0 !text-center"><b className="block text-lg">{l.name}</b><span className="text-sm">{l.desc}</span></button>)}</div></div>
      <div><h2 className="mb-2 text-xl font-black">יבשת</h2>
        <div role="group" aria-label="יבשת" className="flex flex-wrap gap-2"><Chip on={cont === 'all'} onClick={() => setCont('all')}>כל העולם</Chip>{CONTINENTS.map(c => <Chip key={c.slug} on={cont === c.slug} onClick={() => setCont(c.slug)}>{c.name}</Chip>)}</div></div>
      <div className="text-center"><button type="button" className="ln-btn go" onClick={start}>▶ מתחילים — 10 דגלים</button></div>
      {best > 0 && <p className="m-0 text-center text-sm">🔥 השיא שלכם: רצף של {best} תשובות נכונות</p>}
    </div>}

    {q && <div className="ln-box mx-auto max-w-2xl space-y-4">
      <div className="flex justify-between font-bold"><span>דגל {round.i + 1} מתוך {round.qs.length}</span><span aria-live="polite">✅ {round.score} · 🔥 רצף {round.streak}</span></div>
      <FlagImg code={q.answer} eager alt="איזה דגל זה?" className="mx-auto h-auto w-full max-w-[320px] shadow-md" />
      <p className="m-0 text-center text-xl font-black">של איזו מדינה הדגל הזה?</p>
      <div className="grid gap-2 sm:grid-cols-2">{q.choices.map(code => { const right = round.pick && code === q.answer, wrong = round.pick === code && code !== q.answer
        return <button key={code} type="button" onClick={() => choose(code)} disabled={!!round.pick && !right && !wrong} className={`ln-opt !mt-0 !text-center !text-lg font-bold ${right ? 'is-right' : ''} ${wrong ? 'is-wrong' : ''}`}>{COUNTRY_BY_CODE[code].name}</button> })}</div>
      {round.pick && <div className="space-y-2 text-center">
        <p className="m-0 text-lg">{round.pick === q.answer ? (round.streak >= 3 ? `🔥 כל הכבוד! רצף של ${round.streak}` : '👏 נכון!') : <>לא נורא — זה הדגל של <b>{COUNTRY_BY_CODE[q.answer].name}</b>.</>} הבירה: {COUNTRY_BY_CODE[q.answer].capital}.</p>
        {FLAG_NOTES[q.answer] && <p className="m-0 text-sm">💡 {FLAG_NOTES[q.answer]}</p>}
        <button type="button" className="ln-btn" onClick={next}>{round.i + 1 < round.qs.length ? 'הדגל הבא ◀' : 'לתוצאה'}</button>
      </div>}
    </div>}

    {round && !q && <div className="ln-box mx-auto max-w-2xl space-y-4 text-center">
      <h2 className="text-4xl font-black">{round.score} מתוך {round.qs.length} {round.score === round.qs.length ? '🏆' : round.score >= round.qs.length * 0.7 ? '🌟' : ''}</h2>
      <p className="m-0">רמה: {levelName}{contName && ` · ${contName}`} · הרצף הכי ארוך: {round.bestStreak} 🔥</p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-btn go" onClick={share}>💬 שליחת התוצאה בוואטסאפ</button>
        <button type="button" className="ln-btn" onClick={start}>🔁 עוד סיבוב</button>
        <button type="button" className="ln-btn alt" onClick={() => setRound(null)}>⚙️ רמה אחרת</button>
      </div>
      {round.wrong.length > 0 && <div className="text-right"><h3 className="text-xl font-black">כדאי לחזור על הדגלים האלה</h3>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">{round.wrong.map(w => <li key={w.answer}><FlagCard c={COUNTRY_BY_CODE[w.answer]} /></li>)}</ul></div>}
    </div>}

    <h2 className="mt-10 mb-3 text-2xl font-black text-center">חידון לפי יבשת</h2>
    <nav aria-label="חידון לפי יבשת" className="flex flex-wrap justify-center gap-2">{CONTINENTS.map(c => <Link key={c.slug} to={`/flags/continents/${c.slug}`} className="ln-chip">{c.emoji} דגלי {c.name}</Link>)}</nav>
    <MoreLinks current="/flags/quiz" />
    <div className="mt-12"><SeoBody paragraphs={QUIZ_PARAGRAPHS} faq={QUIZ_FAQ} related={[{ label: 'כל דגלי המדינות', href: '/flags' }, { label: 'חידון בירות', href: '/discover/capitals' }, { label: 'טריוויה על דגלים', href: '/trivia/countries-flags' }]} /></div>
  </Page>
}

// ── /flags/print ─────────────────────────────
const A4 = ({ children }) => <article className="buga-a4"><div className="print-art">{children}</div><footer>עוגה בוגה · ugabuga.co.il</footer></article>
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))

function CardsSheet({ list, names, title }) {
  return <Sheet label={title}>
    <T x={100} y={12} size={7.5} weight={900}>{title}</T>
    {list.map((c, i) => { const col = i % 3, row = Math.floor(i / 3), x = 134 - col * 62, y = 18 + row * 61
      return <g key={c.code}><rect x={x} y={y} width="58" height="57" rx="3" fill="#fff" stroke="#999" strokeWidth=".4" strokeDasharray="2 1.5" />
        <image href={flagSrc(c.code)} x={x + 6} y={y + 4} width="46" height="34.5" preserveAspectRatio="xMidYMid meet" />
        <rect x={x + 6} y={y + 4} width="46" height="34.5" fill="none" stroke="#c9ccd6" strokeWidth=".3" />
        {names ? <><T x={x + 29} y={y + 45} size={c.name.length > 16 ? 3.6 : 4.8} weight={800}>{c.name}</T><T x={x + 29} y={y + 52} size={c.capital.length > 16 ? 3 : 3.8} fill="#444">בירה: {c.capital}</T></>
          : <line x1={x + 8} y1={y + 50} x2={x + 50} y2={y + 50} stroke="#999" strokeWidth=".4" />}</g> })}
    <T x={100} y={266} size={4} fill="#555">גוזרים לאורך הקו המקווקו · {names ? 'אפשר להדפיס פעמיים ולשחק במשחק זיכרון' : 'כותבים את שם המדינה מתחת לכל דגל'}</T>
  </Sheet>
}

function ColoringFlag({ f, x, y, w, h, filled }) {
  const regions = flagRegions(f, w, h)
  const used = [...new Set(f.colors)]
  return <g transform={`translate(${x} ${y})`}>
    {regions.map((r, i) => <path key={i} d={r.d} fill={filled ? PAINT[r.color][1] : '#fff'} stroke="#222" strokeWidth=".6" strokeLinejoin="round" />)}
    {!filled && regions.map((r, i) => <text key={i} x={r.label[0]} y={r.label[1] + 2 * (r.label[2] || 1)} fontSize={6 * (r.label[2] || 1)} textAnchor="middle" fontWeight="800" fill="#888">{used.indexOf(r.color) + 1}</text>)}
  </g>
}

function ColoringSheet({ flags, filled }) {
  const W = 88, H = 58.7
  return <Sheet label="דגלים לצביעה">
    <T x={100} y={12} size={7.5} weight={900}>{filled ? 'דגלים לצביעה — הדגלים בצבעים' : 'דגלים לצביעה'}</T>
    {!filled && <T x={100} y={19} size={4} fill="#555">צובעים כל חלק לפי המספר שבתוכו — המקרא מתחת לכל דגל</T>}
    {flags.map((f, i) => { const col = i % 2, row = Math.floor(i / 2), x = 106 - col * 96 + (96 - W) / 2 - 4, y = 26 + row * 118, c = COUNTRY_BY_CODE[f.code], used = [...new Set(f.colors)]
      return <g key={f.code}>
        <ColoringFlag f={f} x={x} y={y} w={W} h={H} filled={filled} />
        <T x={x + W / 2} y={y + H + 9} size={6} weight={900}>{c.name}</T>
        {used.map((col2, k) => { const lx = x + W - 4 - (k % 3) * 29, ly = y + H + 17 + Math.floor(k / 3) * 9
          return <g key={col2}><rect x={lx - 5} y={ly - 4} width="5" height="5" fill={PAINT[col2][1]} stroke="#222" strokeWidth=".3" /><T x={lx - 7} y={ly} size={4.4} anchor="start">{`${k + 1} = ${PAINT[col2][0]}`}</T></g> })}
      </g> })}
  </Sheet>
}

export function FlagsPrint() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState('cards')
  const [cont, setCont] = useState(CONTINENT_BY_SLUG[params.get('continent')] ? params.get('continent') : 'europe')
  const [names, setNames] = useState(true)
  const [picked, setPicked] = useState(['fr', 'it', 'de', 'jp', 'se', 'ch', 'ua', 'nl'])
  const [printing, setPrinting] = useState(false)
  const [seed, setSeed] = useState(0)
  const cards = useMemo(() => (cont === 'famous' ? shuffle(WORLD_COUNTRIES.filter(c => ['il', 'us', 'gb', 'fr', 'de', 'it', 'es', 'jp', 'cn', 'ca', 'br', 'ar'].includes(c.code))) : countriesOf(cont)), [cont, seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const toggle = code => setPicked(p => (p.includes(code) ? p.filter(x => x !== code) : [...p, code]))
  const colorFlags = COLORING_FLAGS.filter(f => picked.includes(f.code))
  const contName = cont === 'famous' ? 'דגלים מוכרים' : `דגלי ${CONTINENT_BY_SLUG[cont].name}`
  const pages = mode === 'cards'
    ? chunk(cards, 12).map((l, i, all) => <A4 key={i}><CardsSheet list={l} names={names} title={`${contName}${all.length > 1 ? ` (${i + 1}/${all.length})` : ''}`} /></A4>)
    : [...chunk(colorFlags, 4).map((l, i) => <A4 key={`c${i}`}><ColoringSheet flags={l} /></A4>), ...chunk(colorFlags, 4).map((l, i) => <A4 key={`f${i}`}><ColoringSheet flags={l} filled /></A4>)]
  return <Page>
    <SEO title="דגלים להדפסה — כרטיסיות דגלי מדינות ודגלים לצביעה" description="דגלים להדפסה בחינם: כרטיסיות דגלי מדינות בצבע לפי יבשת (עם שם ובירה או בלי), ודגלים לצביעה עם מספרים ומקרא צבעים. מוכן להדפסה על A4 או לשמירה כ-PDF." path="/flags/print" structuredData={faqSchema(PRINT_FAQ)} />
    <Breadcrumbs items={[HOME, DISCOVER, HUB, { label: 'דגלים להדפסה' }]} />
    <Head emoji="🖨️" h1="דגלים להדפסה" lead="דגלים להדפסה לכיתה, לגן ולבית: כרטיסיות צבעוניות של דגלי מדינות לפי יבשת — לתלייה, למשחק זיכרון או לחידון — ודגלים לצביעה עם מספרים ומקרא צבעים." />
    <div className="ln-box mx-auto max-w-3xl space-y-4">
      <div role="group" aria-label="סוג הדף" className="grid gap-2 sm:grid-cols-2">
        <button type="button" aria-pressed={mode === 'cards'} onClick={() => setMode('cards')} className="ln-opt !mt-0 !text-center"><b className="block text-lg">🏳️ כרטיסיות דגלים</b><span className="text-sm">דגלים בצבע, 12 בדף</span></button>
        <button type="button" aria-pressed={mode === 'color'} onClick={() => setMode('color')} className="ln-opt !mt-0 !text-center"><b className="block text-lg">🖍️ דגלים לצביעה</b><span className="text-sm">קווי מתאר, מספרים ומקרא</span></button>
      </div>
      {mode === 'cards' ? <>
        <div><h2 className="mb-2 text-lg font-black">אילו דגלים?</h2><div className="flex flex-wrap gap-2"><Chip on={cont === 'famous'} onClick={() => setCont('famous')}>⭐ 12 מוכרים</Chip>{CONTINENTS.map(c => <Chip key={c.slug} on={cont === c.slug} onClick={() => setCont(c.slug)}>{c.name} ({countriesOf(c.slug).length})</Chip>)}</div></div>
        <div className="flex flex-wrap gap-2"><Chip on={names} onClick={() => setNames(true)}>עם שם ובירה</Chip><Chip on={!names} onClick={() => setNames(false)}>בלי שמות (חידון)</Chip></div>
        <p className="m-0 text-sm">{cards.length} דגלים · {Math.ceil(cards.length / 12)} דפים</p>
      </> : <>
        <div><h2 className="mb-2 text-lg font-black">בוחרים דגלים לצביעה ({picked.length})</h2>
          <div className="flex flex-wrap gap-2">{COLORING_FLAGS.map(f => <button key={f.code} type="button" aria-pressed={picked.includes(f.code)} onClick={() => toggle(f.code)} className="ln-chip !min-h-[40px] !px-3 !py-1 text-sm"><FlagImg code={f.code} className="h-4 w-5" alt="" />{COUNTRY_BY_CODE[f.code].name}</button>)}</div></div>
        <div className="flex flex-wrap gap-2"><button type="button" className="ln-chip" onClick={() => setPicked(COLORING_FLAGS.map(f => f.code))}>בחירת הכול</button><button type="button" className="ln-chip" onClick={() => setPicked([])}>ניקוי</button></div>
        <p className="m-0 text-sm">4 דגלים בכל דף, ובסוף דף תשובות בצבע.</p>
      </>}
      <div className="text-center"><button type="button" className="ln-btn go" disabled={!pages.length} onClick={() => setPrinting(true)}>🖨️ תצוגה והדפסה</button></div>
    </div>
    {pages.length > 0 && <div className="mx-auto mt-6 max-w-sm"><p className="mb-2 text-center text-sm font-bold">הצצה לדף הראשון</p><div className="shadow-md">{pages[0]}</div></div>}
    {printing && <PrintPreview title={mode === 'cards' ? `כרטיסיות — ${contName}` : 'דגלים לצביעה'} onClose={() => setPrinting(false)} onRefresh={mode === 'cards' && cont === 'famous' ? () => setSeed(s => s + 1) : undefined}>{pages}</PrintPreview>}
    <p className="mt-6 text-center">רוצים דף עבודה "של מי הדגל?" עם דף תשובות? יש כזה ב<Link to="/discover/capitals" className="font-bold underline">עמוד הבירות והדגלים</Link>.</p>
    <MoreLinks current="/flags/print" />
    <div className="mt-12"><SeoBody paragraphs={PRINT_PARAGRAPHS} faq={PRINT_FAQ} related={[{ label: 'כל דגלי המדינות', href: '/flags' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'חידון דגלים', href: '/flags/quiz' }]} /></div>
  </Page>
}

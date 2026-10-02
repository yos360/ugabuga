import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import NotFound from '../NotFound'
import { ANIMALS, ANIMAL_GROUPS, RIDDLE_PAGES, JOKE_PAGES, HUNT_PAGES, ABC_LETTERS } from '../../data/content'

const Chip = ({ to, children, hl }) => <Link to={to} className={`wobbly-sm border-2 border-[var(--border)] ${hl ? 'bg-[var(--postit)]' : 'bg-white'} px-3 py-2 font-bold`}>{children}</Link>
const Header = ({ emoji, title, intro }) => (
  <header className="text-center mb-6"><div className="text-6xl mb-2">{emoji}</div><h1 className="text-4xl md:text-5xl font-hand font-bold mb-2">{title}</h1>{intro && <p className="text-lg">{intro}</p>}</header>
)
function Hub({ seo, crumbs, emoji, title, intro, items, base, sub }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO {...seo} />
      <Breadcrumbs items={crumbs} />
      <Header emoji={emoji} title={title} intro={intro} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(p => <Link key={p.slug} to={base + p.slug} className="block"><WobblyCard hover padding="p-4" className="h-full"><div className="text-3xl">{p.emoji}</div><h2 className="font-hand font-bold text-xl">{p.title}</h2>{sub && <p className="text-sm text-[var(--muted-foreground)]">{sub(p)}</p>}</WobblyCard></Link>)}
      </div>
    </div>
  )
}
function More({ items, base, current, all, allLabel }) {
  return (
    <section className="mt-10"><h2 className="text-2xl font-hand font-bold mb-3">עוד</h2>
      <div className="flex flex-wrap gap-2">{items.filter(x => x.slug !== current).slice(0, 12).map(o => <Chip key={o.slug} to={base + o.slug}>{o.emoji} {o.title || o.name}</Chip>)}<Chip to={all} hl>{allLabel} ←</Chip></div>
    </section>
  )
}

// ---------- Animals ----------
export function AnimalsHub() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="עובדות על חיות לילדים — 50 חיות עם חידון" description="עובדות מדויקות על 50 חיות לילדים: איפה הן חיות, מה הן אוכלות, כמה הן גדולות — ועובדות מפתיעות וחידון קצר בכל דף." path="/animals" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'עובדות על חיות' }]} />
      <Header emoji="🦁" title="עובדות על חיות לילדים" intro="בחרו חיה — ובכל דף תמצאו פרופיל קצר, 8 עובדות וחידון." />
      {ANIMAL_GROUPS.map(g => (
        <section key={g.title} className="mb-8"><h2 className="text-2xl font-bold mb-3">{g.title}</h2>
          <div className="flex flex-wrap gap-2">{g.items.map(a => <Chip key={a.slug} to={'/animals/' + a.slug}>{a.emoji} {a.name}</Chip>)}</div>
        </section>
      ))}
    </div>
  )
}
export function AnimalPage() {
  const { slug } = useParams()
  const a = ANIMALS.find(x => x.slug === slug)
  const [picked, setPicked] = useState({})
  if (!a) return <NotFound />
  const P = [['סוג', a.profile.class], ['איפה חי', a.profile.habitat], ['מה אוכל', a.profile.food], ['גודל', a.profile.size], ['תוחלת חיים', a.profile.lifespan]]
  return (
    <article className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={a.title} description={a.description} path={'/animals/' + slug} type="article" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'עובדות על חיות', href: '/animals' }, { label: a.name }]} />
      <Header emoji={a.emoji} title={a.title} intro={a.intro} />
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]">
        <h2 className="text-2xl font-bold mb-2">כרטיס זיהוי</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2">{P.map(([k, v]) => <div key={k}><dt className="font-bold">{k}</dt><dd>{v}</dd></div>)}</dl>
      </WobblyCard>
      <h2 className="text-2xl font-bold mb-3">8 עובדות מעניינות</h2>
      <ol className="space-y-2 mb-8">{a.facts.map((f, i) => <li key={i} className="wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-3 text-lg"><b>{i + 1}.</b> {f}</li>)}</ol>
      <h2 className="text-2xl font-bold mb-3">🧠 חידון קצר</h2>
      <div className="space-y-4">
        {a.quiz.map((q, i) => { const p = picked[i]; return (
          <WobblyCard key={i} hover={false} padding="p-4">
            <h3 className="font-bold text-lg mb-2">{i + 1}. {q.q}</h3>
            <div className="grid sm:grid-cols-2 gap-2">{q.options.map((o, j) => <button key={j} disabled={p !== undefined} onClick={() => setPicked(s => ({ ...s, [i]: j }))} className={`text-right wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 ${p === undefined ? '' : j === q.answer ? 'bg-green-100 border-green-600' : j === p ? 'bg-red-100 border-red-500' : 'opacity-60'}`}>{o}</button>)}</div>
            {p !== undefined && <p className="mt-2" role="status">{p === q.answer ? '✅ נכון! ' : '❌ לא הפעם. '}{q.explain}</p>}
          </WobblyCard>) })}
      </div>
      <More items={ANIMALS.map(x => ({ ...x, title: x.name }))} base="/animals/" current={slug} all="/animals" allLabel="כל החיות" />
    </article>
  )
}

// ---------- Riddles ----------
export const RiddlesHub = () => <Hub seo={{ title: 'חידות עם תשובות — לפי נושא וגיל', description: `${RIDDLE_PAGES.length} דפי חידות עם תשובות: חידות לילדים, לגן, היגיון, חשבון, "מה אני?", חגים ונוער — כל תשובה מוסתרת עד שלוחצים.`, path: '/riddles/topics' }} crumbs={[{ label: 'ראשי', href: '/' }, { label: 'חידות', href: '/tools/riddles' }, { label: 'לפי נושא' }]} emoji="🤔" title="חידות לפי נושא" intro="כל דף: 12 חידות, רמז ותשובה." items={RIDDLE_PAGES} base="/riddles/" />
function Riddle({ r, n }) {
  const [hint, setHint] = useState(false), [ans, setAns] = useState(false)
  return (
    <WobblyCard hover={false} padding="p-4">
      <h2 className="font-bold text-lg whitespace-pre-line">{n}. {r.q}</h2>
      <div className="mt-2 flex flex-wrap gap-2">
        {!hint && !ans && <button className="btn-secondary text-sm" onClick={() => setHint(true)}>💡 רמז</button>}
        {!ans && <button className="btn-secondary text-sm" onClick={() => setAns(true)}>👀 תשובה</button>}
      </div>
      {hint && !ans && <p className="mt-2">💡 {r.hint}</p>}
      {ans && <p className="mt-2 font-bold text-green-800">✅ {r.a}</p>}
    </WobblyCard>
  )
}
export function RiddlePage() {
  const { slug } = useParams(); const p = RIDDLE_PAGES.find(x => x.slug === slug)
  if (!p) return <NotFound />
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title} description={p.description} path={'/riddles/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חידות לפי נושא', href: '/riddles/topics' }, { label: p.title }]} />
      <Header emoji={p.emoji} title={p.title} intro={p.intro} />
      <div className="space-y-3">{p.riddles.map((r, i) => <Riddle key={i} r={r} n={i + 1} />)}</div>
      <details className="mt-8 wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4"><summary className="font-bold cursor-pointer">📋 כל התשובות</summary><ol className="list-decimal pr-6 mt-2">{p.riddles.map((r, i) => <li key={i}>{r.a}</li>)}</ol></details>
      <More items={RIDDLE_PAGES} base="/riddles/" current={slug} all="/riddles/topics" allLabel="כל החידות" />
    </div>
  )
}

// ---------- Jokes ----------
export const JokesHub = () => <Hub seo={{ title: 'בדיחות לילדים — לפי נושא', description: `${JOKE_PAGES.length} דפים של בדיחות נקיות ומצחיקות לילדים: בית ספר, חיות, אוכל, חלל, משחקי מילים ועוד — מתאים לכל המשפחה.`, path: '/jokes/topics' }} crumbs={[{ label: 'ראשי', href: '/' }, { label: 'בדיחות', href: '/tools/joke' }, { label: 'לפי נושא' }]} emoji="😂" title="בדיחות לפי נושא" intro="בדיחות נקיות לכל המשפחה." items={JOKE_PAGES} base="/jokes/" />
function Joke({ j }) {
  const [open, setOpen] = useState(false)
  return <WobblyCard hover={false} padding="p-4"><p className="text-lg font-bold">{j.setup}</p>{open ? <p className="mt-2 text-lg">😂 {j.punchline}</p> : <button className="btn-secondary text-sm mt-2" onClick={() => setOpen(true)}>לפאנץ׳ ←</button>}</WobblyCard>
}
export function JokePage() {
  const { slug } = useParams(); const p = JOKE_PAGES.find(x => x.slug === slug)
  if (!p) return <NotFound />
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title} description={p.description} path={'/jokes/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בדיחות לפי נושא', href: '/jokes/topics' }, { label: p.title }]} />
      <Header emoji={p.emoji} title={p.title} intro={p.intro} />
      <div className="space-y-3">{p.jokes.map((j, i) => <Joke key={i} j={j} />)}</div>
      <More items={JOKE_PAGES} base="/jokes/" current={slug} all="/jokes/topics" allLabel="כל הבדיחות" />
    </div>
  )
}

// ---------- Ready treasure hunts ----------
export const HuntsHub = () => <Hub seo={{ title: 'חפש את המטמון — רמזים מוכנים להדפסה', description: `${HUNT_PAGES.length} משחקי חפש את המטמון מוכנים: 8 רמזים מחורזים בכל אחד — לבית, לחצר, לפארק, לכיתה, ליום הולדת ולחגים.`, path: '/treasure-hunt/ready' }} crumbs={[{ label: 'ראשי', href: '/' }, { label: 'חפש את המטמון', href: '/tools/scavenger-hunt-maker' }, { label: 'מוכנים' }]} emoji="🗺️" title="חפש את המטמון — מוכן להדפסה" intro="בוחרים מקום, מדפיסים, מחביאים — ומתחילים." items={HUNT_PAGES} base="/treasure-hunt/" />
export function HuntPage() {
  const { slug } = useParams(); const p = HUNT_PAGES.find(x => x.slug === slug)
  if (!p) return <NotFound />
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title} description={p.description} path={'/treasure-hunt/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חפש את המטמון מוכן', href: '/treasure-hunt/ready' }, { label: p.title }]} />
      <Header emoji={p.emoji} title={p.title} intro={p.intro} />
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]"><h2 className="text-xl font-bold mb-2">הכנה</h2><ul className="list-disc pr-5 space-y-1">{p.setup.map(t => <li key={t}>{t}</li>)}</ul><p className="mt-2"><b>פרס בסוף:</b> {p.prize}</p></WobblyCard>
      <h2 className="text-2xl font-bold mb-3">הרמזים (לגזור ולהחביא)</h2>
      <ol className="grid sm:grid-cols-2 gap-3">{p.clues.map((c, i) => <li key={i} className="border-2 border-dashed border-[var(--border)] bg-white p-4"><b>רמז {i + 1}</b><p className="whitespace-pre-line text-lg mt-1">{c.clue}</p></li>)}</ol>
      <details className="mt-6 wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4"><summary className="font-bold cursor-pointer">🔑 איפה מחביאים כל רמז (למבוגר)</summary><p className="text-sm mt-2">רמז 1 נותנים ביד. כל רמז מחביאים במקום שהרמז הקודם מוביל אליו:</p><ol className="list-decimal pr-6 mt-2">{p.clues.map((c, i) => <li key={i}>רמז {i + 1} מוביל אל: <b>{c.answer}</b>{i < p.clues.length - 1 ? ` — שם מחביאים את רמז ${i + 2}` : ' — שם מחכה הפרס!'}</li>)}</ol></details>
      <div className="text-center my-6"><button onClick={() => window.print()} className="btn-secondary">🖨️ הדפסה</button> <Link to="/tools/scavenger-hunt-maker" className="btn-secondary">✏️ ליצור ציד משלכם</Link></div>
      <More items={HUNT_PAGES} base="/treasure-hunt/" current={slug} all="/treasure-hunt/ready" allLabel="כל הצידים" />
    </div>
  )
}

// ---------- English letters ----------
export function AbcHub() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="אותיות באנגלית לילדים — A עד Z עם מילים ותמונות" description="לומדים את האותיות באנגלית: לכל אות מ-A עד Z — שם האות, הצליל, 6 מילים עם תמונה ותרגום, משפט לתרגול וטיפ לכתיבה." path="/abc" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אותיות באנגלית' }]} />
      <Header emoji="🔤" title="אותיות באנגלית A–Z" intro="בחרו אות — ובדף שלה תמצאו מילים, צליל, משפט וטיפ." />
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3" dir="ltr">{ABC_LETTERS.map(l => <Link key={l.slug} to={'/abc/' + l.slug} className="wobbly border-[3px] border-[var(--border)] bg-[var(--card)] py-4 text-center text-4xl font-bold sketch-shadow-sm">{l.letter}{l.lower}</Link>)}</div>
      <div className="text-center mt-6"><Chip to="/abc/game" hl>🎮 משחק האותיות</Chip></div>
      <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--postit)] p-5 text-center">
        <h2 className="text-xl font-bold mb-3">ממשיכים ללמוד ולשחק</h2>
        <div className="flex flex-wrap justify-center gap-2">
          <Chip to="/trivia/topics">🧠 טריוויה לילדים</Chip>
          <Chip to="/animals">🐘 עולם החיות</Chip>
          <Chip to="/games">🎲 כל המשחקים</Chip>
        </div>
      </div>
    </div>
  )
}
export function AbcLetterPage() {
  const { letter } = useParams(); const i = ABC_LETTERS.findIndex(x => x.slug === letter)
  if (i < 0) return <NotFound />
  const l = ABC_LETTERS[i], prev = ABC_LETTERS[i - 1], next = ABC_LETTERS[i + 1]
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={`האות ${l.letter} באנגלית — מילים, צליל ותרגול לילדים`} description={l.description} path={'/abc/' + l.slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אותיות באנגלית', href: '/abc' }, { label: l.letter }]} />
      <header className="text-center mb-6"><div className="text-8xl font-bold" dir="ltr">{l.letter} {l.lower}</div><h1 className="text-3xl md:text-4xl font-hand font-bold mt-2">האות {l.letter} באנגלית</h1><p className="text-lg mt-1">שם האות: <b>{l.name}</b></p></header>
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]"><h2 className="text-xl font-bold mb-1">🔊 איך היא נשמעת</h2><p className="text-lg">{l.sound}</p></WobblyCard>
      <h2 className="text-2xl font-bold mb-3">מילים שמתחילות ב-{l.letter}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">{l.words.map(w => <div key={w.en} className="wobbly-sm border-2 border-[var(--border)] bg-white p-3 text-center"><div className="text-4xl">{w.emoji}</div><div className="text-xl font-bold" dir="ltr">{w.en}</div><div>{w.he}</div></div>)}</div>
      <WobblyCard hover={false} padding="p-5" className="mb-4"><h2 className="text-xl font-bold mb-1">משפט לתרגול</h2><p className="text-xl" dir="ltr">{l.sentence.en}</p><p>{l.sentence.he}</p></WobblyCard>
      <p className="text-lg mb-6">✏️ {l.tip}</p>
      <nav className="flex justify-between" dir="ltr">{prev ? <Chip to={'/abc/' + prev.slug}>← {prev.letter}</Chip> : <span />}<Chip to="/abc" hl>A–Z</Chip>{next ? <Chip to={'/abc/' + next.slug}>{next.letter} →</Chip> : <span />}</nav>
      <p className="text-center mt-6"><Link to="/printables/abc-letters" className="underline font-bold">דפי מעבר בעיפרון לאותיות באנגלית להדפסה</Link></p>
    </div>
  )
}

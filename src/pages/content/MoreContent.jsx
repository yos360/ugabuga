import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import NotFound from '../NotFound'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { RIDDLE_PAGES } from '../../data/content/riddles'
import { JOKE_PAGES } from '../../data/content/jokes'
import { HUNT_PAGES } from '../../data/content/hunts'
import { ABC_LETTERS } from '../../data/content/abcLetters'
import { ABC_MORE, ABC_HUB, ENGLISH_TOPICS } from '../../data/content/abcLettersMore'
import { Chip, Header, Hub, More } from './contentUi'

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
// Optional page-specific copy shared by the riddle / joke / hunt pages:
// p.lead (opening paragraph), p.uses ({ title, items: [{ t, d }] }), p.about (paragraphs), p.faq, p.related.
const Lead = ({ p }) => p.lead ? <p className="mb-6 text-lg leading-relaxed text-[var(--foreground)]/85">{p.lead}</p> : null
function Uses({ p }) {
  if (!p.uses) return null
  return (
    <section className="mt-10"><h2 className="text-2xl font-bold mb-3">{p.uses.title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">{p.uses.items.map(it => <div key={it.t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4"><h3 className="text-lg font-bold mb-1">{it.t}</h3><p className="text-[var(--foreground)]/80">{it.d}</p></div>)}</div>
    </section>
  )
}
const Extras = ({ p }) => <><Uses p={p} />{(p.about || p.faq || p.related) && <div className="mt-10"><SeoBody paragraphs={p.about} faq={p.faq} related={p.related} /></div>}</>

export function RiddlePage() {
  const { slug } = useParams(); const p = RIDDLE_PAGES.find(x => x.slug === slug)
  if (!p) return <NotFound />
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title} description={p.description} path={'/riddles/' + slug} structuredData={faqSchema(p.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חידות לפי נושא', href: '/riddles/topics' }, { label: p.title }]} />
      <Header emoji={p.emoji} title={p.title} intro={p.intro} />
      <Lead p={p} />
      <div className="space-y-3">{p.riddles.map((r, i) => <Riddle key={i} r={r} n={i + 1} />)}</div>
      <details className="mt-8 wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4"><summary className="font-bold cursor-pointer">📋 כל התשובות</summary><ol className="list-decimal pr-6 mt-2">{p.riddles.map((r, i) => <li key={i}>{r.a}</li>)}</ol></details>
      {p.bonus && <section className="mt-10"><h2 className="text-2xl font-bold mb-3">{p.bonusTitle}</h2><div className="space-y-3">{p.bonus.map((r, i) => <Riddle key={i} r={r} n={p.riddles.length + i + 1} />)}</div></section>}
      <Extras p={p} />
      <More items={RIDDLE_PAGES} base="/riddles/" current={slug} all="/riddles/topics" allLabel="כל החידות" />
    </div>
  )
}

// ---------- Jokes ----------
export const JokesHub = () => <Hub seo={{ title: 'בדיחות לילדים — לפי נושא', description: `${JOKE_PAGES.length} דפים של בדיחות נקיות ומצחיקות לילדים: בית ספר, חיות, אוכל, חלל, משחקי מילים ועוד — מתאים לכל המשפחה.`, path: '/jokes/topics' }} crumbs={[{ label: 'ראשי', href: '/' }, { label: 'בדיחות', href: '/tools/joke' }, { label: 'לפי נושא' }]} emoji="😂" title="בדיחות לפי נושא" intro="בדיחות נקיות לכל המשפחה." items={[{ slug: 'keresh', emoji: '🪵', title: '100 בדיחות קרש לילדים' }, ...JOKE_PAGES]} base="/jokes/" />
function Joke({ j }) {
  const [open, setOpen] = useState(false)
  return <WobblyCard hover={false} padding="p-4"><p className="text-lg font-bold">{j.setup}</p>{open ? <p className="mt-2 text-lg">😂 {j.punchline}</p> : <button className="btn-secondary text-sm mt-2" onClick={() => setOpen(true)}>לפאנץ׳ ←</button>}</WobblyCard>
}
export function JokePage() {
  const { slug } = useParams(); const p = JOKE_PAGES.find(x => x.slug === slug)
  if (!p) return <NotFound />
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title} description={p.description} path={'/jokes/' + slug} structuredData={faqSchema(p.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בדיחות לפי נושא', href: '/jokes/topics' }, { label: p.title }]} />
      <Header emoji={p.emoji} title={p.title} intro={p.intro} />
      <Lead p={p} />
      <div className="space-y-3">{p.jokes.map((j, i) => <Joke key={i} j={j} />)}</div>
      {p.bonus && <section className="mt-10"><h2 className="text-2xl font-bold mb-3">{p.bonusTitle}</h2><div className="space-y-3">{p.bonus.map((j, i) => <Joke key={i} j={j} />)}</div></section>}
      <Extras p={p} />
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
    <div className="hunt-sheet max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={p.title} description={p.description} path={'/treasure-hunt/' + slug} structuredData={faqSchema(p.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חפש את המטמון מוכן', href: '/treasure-hunt/ready' }, { label: p.title }]} />
      <Header emoji={p.emoji} title={p.title} intro={p.intro} />
      <div className="no-print"><Lead p={p} /></div>
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]"><h2 className="text-xl font-bold mb-2">הכנה</h2><ul className="list-disc pr-5 space-y-1">{p.setup.map(t => <li key={t}>{t}</li>)}</ul><p className="mt-2"><b>פרס בסוף:</b> {p.prize}</p></WobblyCard>
      <h2 className="text-2xl font-bold mb-3">הרמזים (לגזור ולהחביא)</h2>
      <ol className="grid sm:grid-cols-2 gap-3">{p.clues.map((c, i) => <li key={i} className="break-inside-avoid border-2 border-dashed border-[var(--border)] bg-white p-4"><b>רמז {i + 1}</b><p className="whitespace-pre-line text-lg mt-1">{c.clue}</p></li>)}</ol>
      <details className="no-print mt-6 wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4"><summary className="font-bold cursor-pointer">🔑 איפה מחביאים כל רמז (למבוגר)</summary><p className="text-sm mt-2">רמז 1 נותנים ביד. כל רמז מחביאים במקום שהרמז הקודם מוביל אליו:</p><ol className="list-decimal pr-6 mt-2">{p.clues.map((c, i) => <li key={i}>רמז {i + 1} מוביל אל: <b>{c.answer}</b>{i < p.clues.length - 1 ? ` — שם מחביאים את רמז ${i + 2}` : ' — שם מחכה הפרס!'}</li>)}</ol></details>
      <div className="no-print text-center my-6"><button onClick={() => window.print()} className="btn-secondary">🖨️ הדפסה</button> <Link to="/tools/scavenger-hunt-maker" className="btn-secondary">✏️ ליצור ציד משלכם</Link></div>
      <div className="no-print"><Extras p={p} /></div>
      <div className="no-print"><More items={HUNT_PAGES} base="/treasure-hunt/" current={slug} all="/treasure-hunt/ready" allLabel="כל הצידים" /></div>
    </div>
  )
}

// ---------- English letters ----------
const AbcStrip = ({ current }) => (
  <nav aria-label="כל האותיות" className="flex flex-wrap justify-center gap-1 mt-8" dir="ltr">
    {ABC_LETTERS.map(l => l.slug === current
      ? <span key={l.slug} className="w-9 h-9 flex items-center justify-center rounded-lg bg-[var(--postit)] border-2 border-[var(--border)] font-bold">{l.letter}</span>
      : <Link key={l.slug} to={'/abc/' + l.slug} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] bg-white font-bold" aria-label={`האות ${l.letter}`}>{l.letter}</Link>)}
  </nav>
)
export function AbcHub() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="אותיות באנגלית לילדים — A עד Z עם מילים ותמונות" description="לומדים את האותיות באנגלית: לכל אות מ-A עד Z — שם, צליל וטיפים לדוברי עברית, 12 מילים עם תרגום, משפט לתרגול, טיפ לכתיבה ופעילויות." path="/abc" structuredData={faqSchema(ABC_HUB.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אותיות באנגלית' }]} />
      <Header emoji="🔤" title="אותיות באנגלית A–Z" intro="בחרו אות — ובדף שלה תמצאו מילים, צליל, משפט וטיפ." />
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3" dir="ltr">{ABC_LETTERS.map(l => <Link key={l.slug} to={'/abc/' + l.slug} className="wobbly border-[3px] border-[var(--border)] bg-[var(--card)] py-4 text-center text-4xl font-bold sketch-shadow-sm">{l.letter}{l.lower}</Link>)}</div>
      <div className="text-center mt-6"><Chip to="/abc/game" hl>🎮 משחק האותיות</Chip></div>
      <section className="mt-10 mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold mb-3">איך לומדים את האותיות באנגלית</h2>
        <SeoBody paragraphs={ABC_HUB.paragraphs} faq={ABC_HUB.faq} />
      </section>
      <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--postit)] p-5 text-center">
        <h2 className="text-xl font-bold mb-3">ממשיכים ללמוד ולשחק</h2>
        <div className="flex flex-wrap justify-center gap-2">
          <Chip to="/english">🇬🇧 מילים באנגלית לפי נושא</Chip>
          <Chip to="/printables/abc-letters">✏️ דפי מעבר A–Z</Chip>
          <Chip to="/trivia/english-beginners">🧠 טריוויה באנגלית למתחילים</Chip>
          <Chip to="/letters">א־ב אותיות בעברית</Chip>
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
  const l = ABC_LETTERS[i], prev = ABC_LETTERS[i - 1], next = ABC_LETTERS[i + 1], x = ABC_MORE[l.slug] || {}
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={`האות ${l.letter} באנגלית — מילים, צליל ותרגול לילדים`} description={l.description} path={'/abc/' + l.slug} structuredData={faqSchema(x.faq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אותיות באנגלית', href: '/abc' }, { label: l.letter }]} />
      <header className="text-center mb-6"><div className="text-8xl font-bold" dir="ltr">{l.letter} {l.lower}</div><h1 className="text-3xl md:text-4xl font-hand font-bold mt-2">האות {l.letter} באנגלית</h1><p className="text-lg mt-1">שם האות: <b>{l.name}</b></p></header>
      {x.intro && <p className="text-lg leading-relaxed mb-6">{x.intro}</p>}
      <WobblyCard hover={false} padding="p-5" className="mb-6 bg-[var(--postit)]">
        <h2 className="text-xl font-bold mb-1">🔊 איך היא נשמעת</h2><p className="text-lg">{l.sound}</p>
        {x.hebrew && <><h3 className="font-bold mt-3">🇮🇱 שימו לב, דוברי עברית</h3><p>{x.hebrew}</p></>}
      </WobblyCard>
      <h2 className="text-2xl font-bold mb-3">מילים שמתחילות ב-{l.letter}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">{l.words.map(w => <div key={w.en} className="wobbly-sm border-2 border-[var(--border)] bg-white p-3 text-center"><div className="text-4xl">{w.emoji}</div><div className="text-xl font-bold" dir="ltr">{w.en}</div><div>{w.he}</div></div>)}</div>
      {x.more && <><h3 className="text-xl font-bold mb-2">עוד מילים עם {l.letter}</h3>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-1 mb-6">{x.more.map(([en, he]) => <li key={en} className="border-b border-dashed border-[var(--border)] py-1"><b dir="ltr">{en}</b> – {he}</li>)}</ul></>}
      <WobblyCard hover={false} padding="p-5" className="mb-4"><h2 className="text-xl font-bold mb-1">משפט לתרגול</h2><p className="text-xl" dir="ltr">{l.sentence.en}</p><p>{l.sentence.he}</p></WobblyCard>
      <p className="text-lg mb-6">✏️ {l.tip}</p>
      {x.acts && <section className="mb-6"><h2 className="text-2xl font-bold mb-2">שני רעיונות לפעילות עם {l.letter}</h2>
        <ol className="list-decimal pr-6 space-y-2">{x.acts.map(t => <li key={t}>{t}</li>)}</ol></section>}
      {x.faq && <SeoBody faq={x.faq} />}
      <nav className="flex justify-between" dir="ltr">{prev ? <Chip to={'/abc/' + prev.slug}>← {prev.letter}</Chip> : <span />}<Chip to="/abc" hl>A–Z</Chip>{next ? <Chip to={'/abc/' + next.slug}>{next.letter} →</Chip> : <span />}</nav>
      <AbcStrip current={l.slug} />
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {(x.topics || []).map(t => <Chip key={t} to={'/english/' + t}>{ENGLISH_TOPICS[t]}</Chip>)}
        <Chip to="/abc/game">🎮 משחק האותיות</Chip>
      </div>
      <p className="text-center mt-6"><Link to="/printables/abc-letters" className="underline font-bold">דפי מעבר בעיפרון לאותיות באנגלית להדפסה</Link></p>
    </div>
  )
}

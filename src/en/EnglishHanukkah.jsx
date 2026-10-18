// Three English Hanukkah guides for families abroad — the questions they search for most:
// how to play dreidel, how to light the candles (with the blessings), and what to do with kids.
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import PrintPreview from '../components/ui/PrintPreview'
import Dreidel from '../components/hanukkah/Dreidel'
import { EnglishNotFound } from './EnglishLayout'
import { HOLIDAY_ROOT as ROOT } from './holidayData'
import { holidayDates } from './holidayDates'
import { HANUKKAH_ROOT, HANUKKAH_GUIDES, LETTERS, playDreidel, newDreidelGame } from './hanukkahGuides'
import { drawingsFor, drawingPath } from './holidayColoringData'
import { HOLIDAY_BLESSINGS } from '../data/holidayBlessings.js'

const related = here => [{ label: 'Hanukkah for kids', href: HANUKKAH_ROOT }, ...HANUKKAH_GUIDES.filter(g => g.slug !== here).map(g => ({ label: g.short, href: `${HANUKKAH_ROOT}/${g.slug}` })), { label: 'Learn the Hebrew alphabet', href: '/en/hebrew-alphabet' }]

function Page({ guide, faq, children, description }) {
  const path = `${HANUKKAH_ROOT}/${guide.slug}`
  return <div className="en-page">
    <SEO lang="en" path={path} counterpartPath={guide.counterpart} title={guide.title} description={description} structuredData={faqSchema(faq)} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Jewish holidays', href: ROOT }, { label: 'Hanukkah', href: HANUKKAH_ROOT }, { label: guide.short }]} />
    <p className="en-eyebrow">Hanukkah with kids</p>
    <h1>{guide.emoji} {guide.short}</h1>
    {children}
    <SeoBody lang="en" faq={faq} related={related(guide.slug)} />
  </div>
}

// ── How to play dreidel ───────────────────────────────────────
function DreidelGame() {
  const [israel, setIsrael] = useState(false)
  const faces = ['nun', 'gimel', 'hey', israel ? 'pe' : 'shin']
  const [face, setFace] = useState('nun'), [spinning, setSpinning] = useState(false)
  const [count, setCount] = useState(2), [game, setGame] = useState(null)
  const spin = () => {
    if (spinning || game?.winner != null) return
    setSpinning(true)
    const result = faces[Math.floor(Math.random() * 4)]
    setTimeout(() => { setFace(result); setSpinning(false); if (game) setGame(g => playDreidel(g, result)) }, 1300)
  }
  const start = () => setGame(newDreidelGame(Array.from({ length: count }, (_, i) => `Player ${i + 1}`)))
  return <section className="en-help" aria-label="Virtual dreidel">
    <h2>Spin the dreidel</h2>
    <label>Dreidel letters <select value={israel ? 'israel' : 'diaspora'} onChange={e => setIsrael(e.target.value === 'israel')}>
      <option value="diaspora">Outside Israel: nun, gimel, hey, shin</option><option value="israel">Israel: nun, gimel, hey, pe</option>
    </select></label>
    <div style={{ display: 'grid', placeItems: 'center', margin: '16px 0' }}><Dreidel letter={LETTERS[face].he} spinning={spinning} size={170} label={`The dreidel landed on ${LETTERS[face].name}`} /></div>
    <p aria-live="polite" style={{ textAlign: 'center', fontSize: '1.2rem' }}>{spinning ? 'Spinning…' : <><b>{LETTERS[face].name}</b> — {LETTERS[face].rule}</>}</p>
    <p style={{ textAlign: 'center' }}><button onClick={spin} disabled={spinning || game?.winner != null}>🎲 Spin</button></p>
    {!game ? <p style={{ textAlign: 'center' }}>Keep score for <select value={count} onChange={e => setCount(Number(e.target.value))} aria-label="Number of players">{[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} players</option>)}</select> <button onClick={start}>Start a game</button></p>
      : <div>
        <p><b>Pot:</b> {game.pot} · {game.winner != null ? <b>🎉 {game.names[game.winner]} wins!</b> : <>Turn: <b>{game.names[game.turn]}</b></>}</p>
        <div className="en-word-pairs">{game.names.map((n, i) => <p key={n}><strong>{n}</strong>: {game.coins[i]} tokens</p>)}</div>
        <ul style={{ listStyle: 'disc', paddingLeft: 24 }}>{game.log.map((l, i) => <li key={i}>{l}</li>)}</ul>
        <button onClick={() => setGame(null)}>New game</button>
      </div>}
  </section>
}

function RulesSheet() {
  return <article className="buga-a4 en-print-sheet" dir="ltr" style={{ padding: '14mm', fontSize: '13pt' }}>
    <h2 style={{ textAlign: 'center', fontSize: '24pt' }}>🎲 How to play dreidel</h2>
    <p><b>You need:</b> a dreidel, 2–6 players and 10 tokens each (chocolate coins, raisins or buttons).</p>
    <p><b>Start:</b> everyone puts one token into the pot. Take turns spinning.</p>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{['nun', 'gimel', 'hey', 'shin'].map(k => <tr key={k}>
      <td style={{ fontSize: '30pt', width: '18mm', textAlign: 'center' }} lang="he">{LETTERS[k].he}</td>
      <td style={{ borderBottom: '1px solid #ccc', padding: '3mm' }}><b>{LETTERS[k].name}</b> — {LETTERS[k].rule}</td></tr>)}</tbody></table>
    <p>In Israel the fourth letter is <b>Pe (פ)</b> instead of Shin, with the same rule.</p>
    <p><b>When the pot is empty or has one token left,</b> everyone adds one. A player with no tokens left is out. The last player with tokens wins.</p>
    <p style={{ textAlign: 'center', marginTop: '8mm' }}>Nes gadol hayah sham — “a great miracle happened there.”<br /><small>ugabuga.co.il/en</small></p>
  </article>
}

function DreidelGuide({ guide }) {
  const [printing, setPrinting] = useState(false)
  const faq = [
    { q: 'What do the letters on a dreidel mean?', a: 'Nun, gimel, hey and shin stand for “Nes gadol hayah sham” — a great miracle happened there. Dreidels made in Israel have pe instead of shin: “Nes gadol hayah po” — a great miracle happened here.' },
    { q: 'What do you play dreidel with?', a: 'Any small tokens: chocolate coins (gelt), raisins, nuts, pennies or buttons. Agree before you start how many each player gets — ten is a good number for a game of about 15 minutes.' },
    { q: 'What happens when you land on hey and the pot is odd?', a: 'Families play it differently. A common rule is to take half and round up, so with 5 tokens in the pot the player takes 3. Agree on a house rule before you start.' },
    { q: 'Why do people play dreidel on Hanukkah?', a: 'It is a long-standing folk tradition. A popular story says that when Torah study was forbidden, students kept a spinning top nearby to pretend they were only playing. It is a well-loved legend rather than a documented historical fact.' },
    { q: 'Is the virtual dreidel fair?', a: 'Yes. Each of the four letters has exactly the same chance — one in four — on every spin.' },
  ]
  return <Page guide={guide} faq={faq} description="How to play dreidel with kids: what the four Hebrew letters mean, the simple rules, a printable rules sheet and a virtual dreidel to spin.">
    <p className="en-lead">Dreidel is the classic Hanukkah spinning-top game. It takes a minute to learn and works for ages 4 and up — all you need is a dreidel and a handful of small tokens.</p>
    <h2>The four letters and what they mean</h2>
    <div className="en-cards">{['nun', 'gimel', 'hey', 'shin'].map(k => <div className="en-card" key={k}><p lang="he" style={{ fontSize: '2.6rem', margin: 0 }}>{LETTERS[k].he}</p><h3>{LETTERS[k].name} · {LETTERS[k].word}</h3><p>{LETTERS[k].rule}</p></div>)}</div>
    <p>Together the letters stand for <b>“Nes gadol hayah sham”</b> — a great miracle happened there. In Israel the dreidel has <b>pe</b> (פ) instead of shin, for <b>“po”</b> — here.</p>
    <h2>The rules, step by step</h2>
    <ol style={{ listStyle: 'decimal', paddingLeft: 24 }}>
      <li>Give every player the same number of tokens — 10 each works well.</li>
      <li>Everyone puts one token into the middle. This is the pot.</li>
      <li>Take turns spinning the dreidel and follow the letter it lands on: nun — nothing; gimel — take the pot; hey — take half; shin (or pe) — put one in.</li>
      <li>Whenever the pot is empty or down to one token, everyone adds one more.</li>
      <li>A player who runs out of tokens is out. The last player with tokens wins — or stop when you like and count who has the most.</li>
    </ol>
    <p><button onClick={() => setPrinting(true)} data-print-main>🖨️ Print the rules sheet</button></p>
    {printing && <PrintPreview lang="en" title="How to play dreidel" onClose={() => setPrinting(false)}><RulesSheet /></PrintPreview>}
    <DreidelGame />
    <h2>Tips for playing with young children</h2>
    <ul style={{ listStyle: 'disc', paddingLeft: 24 }}>
      <li>Use raisins or cereal instead of chocolate if you would rather avoid a sugar rush.</li>
      <li>For the youngest players, skip the score and simply say the letter and its word on every spin.</li>
      <li>Spin on a hard, flat surface such as a tray or table — a dreidel will not spin well on a carpet.</li>
    </ul>
    <p>Want to decorate your own? <Link to={HANUKKAH_ROOT}>Print a dreidel coloring page</Link> from the Hanukkah page.</p>
  </Page>
}

// ── Candle lighting ──────────────────────────────────────────
const OPEN = 'Barukh atah Adonai, Eloheinu melekh ha-olam, '
const OPEN_EN = 'Blessed are You, Lord our God, ruler of the universe, '
const BLESSINGS = [
  { id: 'ner', title: 'Lighting the Hanukkah lights', when: 'Every night', say: 'asher kideshanu bemitzvotav vetsivanu lehadlik ner Hanukkah.', meaning: 'who made us holy through Your commandments and commanded us to light the Hanukkah lights.', note: 'Many Ashkenazi prayer books say “lehadlik ner shel Hanukkah”; Sephardi communities say “lehadlik ner Hanukkah”.' },
  { id: 'nissim', title: 'For the miracles', when: 'Every night', say: 'she-asah nisim la-avoteinu bayamim hahem bazman hazeh.', meaning: 'who performed miracles for our ancestors in those days, at this season.' },
  { id: 'shehecheyanu', title: 'Shehecheyanu', when: 'First night only', say: 'shehecheyanu vekiyemanu vehigianu lazman hazeh.', meaning: 'who has kept us alive, sustained us and brought us to this time.' },
]
const hebrewOf = id => HOLIDAY_BLESSINGS.find(h => h.slug === 'hanukkah')?.blessings.find(b => b.id === id)?.text || ''
const nightDate = (start, n) => { const d = new Date(start); d.setUTCDate(d.getUTCDate() + n); return d }
const weekday = d => d.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
const longDate = d => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const shortDate = d => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })

function NightTable({ start }) {
  return <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <thead><tr>{['Night', 'Evening of', 'Candles', ''].map(h => <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid #1d2233', padding: 6 }}>{h}</th>)}</tr></thead>
    <tbody>{Array.from({ length: 8 }, (_, i) => {
      const d = nightDate(start, i), day = weekday(d)
      return <tr key={i}><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{i + 1}</td><td style={{ padding: 6, borderBottom: '1px solid #ddd' }}>{shortDate(d)}</td>
        <td style={{ padding: 6, borderBottom: '1px solid #ddd' }} aria-label={`${i + 1} candles and the shamash`}>{'🕯️'.repeat(i + 1)} + shamash</td>
        <td style={{ padding: 6, borderBottom: '1px solid #ddd', fontSize: '.9rem' }}>{day === 'Friday' ? 'Light before the Shabbat candles' : day === 'Saturday' ? 'Light after Shabbat ends (after Havdalah)' : ''}</td></tr>
    })}</tbody>
  </table>
}

function CandleSheet({ start }) {
  return <article className="buga-a4 en-print-sheet" dir="ltr" style={{ padding: '12mm', fontSize: '11.5pt' }}>
    <h2 style={{ textAlign: 'center', fontSize: '22pt' }}>🕎 Hanukkah candle lighting</h2>
    {BLESSINGS.map(b => <div key={b.id} style={{ marginBottom: '4mm' }}>
      <b>{b.title}</b> <small>({b.when.toLowerCase()})</small>
      <p lang="he" dir="rtl" style={{ fontSize: '15pt', margin: '1mm 0' }}>{hebrewOf(b.id)}</p>
      <p style={{ margin: 0 }}><i>{OPEN}{b.say}</i></p>
    </div>)}
    {start && <NightTable start={start} />}
    <p><small>Place candles from right to left; light the newest candle (on the left) first. ugabuga.co.il/en</small></p>
  </article>
}

function CandleGuide({ guide }) {
  const [printing, setPrinting] = useState(false)
  const now = new Date(), year = now.getUTCFullYear()
  const next = [year, year + 1].map(y => holidayDates('hanukkah', y, false)).find(d => d && d.end >= now) || holidayDates('hanukkah', year + 1, false)
  const faq = [
    { q: 'How many candles do you need for Hanukkah?', a: '44 in total: 36 festival candles (1 + 2 + … + 8) plus one shamash (helper candle) for each of the eight nights.' },
    { q: 'Which direction do you place and light the candles?', a: 'Place the candles from right to left, adding one new candle on the left each night. Light the newest candle — the one on the left — first, then move to the right, using the shamash.' },
    { q: 'What blessings are said when lighting Hanukkah candles?', a: 'Two blessings every night — for lighting the Hanukkah lights and for the miracles — and on the first night a third blessing, Shehecheyanu.' },
    { q: 'How long should Hanukkah candles burn?', a: 'Traditionally the lights should burn for at least half an hour after nightfall. On Friday, use longer candles, because they are lit before the Shabbat candles.' },
    { q: 'When is Hanukkah this year?', a: next ? `Hanukkah ${next.start.getUTCFullYear()} begins on the evening of ${longDate(next.start)}, and the last candles are lit on the evening of ${longDate(nightDate(next.start, 7))}.` : 'Hanukkah begins on the 25th of the Hebrew month of Kislev, usually in late November or December.' },
  ]
  return <Page guide={guide} faq={faq} description="How to light the Hanukkah candles with kids: the three blessings in Hebrew, transliteration and English, how many candles each night, and a printable guide.">
    <p className="en-lead">Each night of Hanukkah, one more light is added to the hanukkiah. Here is everything a family needs: the order, the blessings with transliteration, and a night-by-night chart you can print.</p>
    {next && <section className="en-dates"><h2>Hanukkah {next.start.getUTCFullYear()}</h2><p>The first candle is lit on the evening of <b>{longDate(next.start)}</b>. The eighth and last night is <b>{longDate(nightDate(next.start, 7))}</b>.</p><NightTable start={next.start} /></section>}
    <h2>How to light, step by step</h2>
    <ol style={{ listStyle: 'decimal', paddingLeft: 24 }}>
      <li>Place the candles in the hanukkiah from <b>right to left</b>: one on the first night, and one more each night. The shamash goes in its own, separate place.</li>
      <li>Light the shamash first, then say the blessings below.</li>
      <li>With the shamash, light the candles starting with the <b>newest one on the left</b>, moving to the right.</li>
      <li>Put the shamash back in its place. Many families then sing “Maoz Tzur” or “Hanerot Halalu”.</li>
    </ol>
    <p className="en-help"><b>Safety first:</b> an adult lights the candles. Stand the hanukkiah on a stable, non-flammable tray away from curtains and paper, keep children at arm’s length, and never leave burning candles alone.</p>
    <h2>The Hanukkah blessings</h2>
    {BLESSINGS.map(b => <section key={b.id}>
      <h3>{b.title} <small style={{ fontWeight: 400 }}>· {b.when}</small></h3>
      <p className="en-blessing" lang="he" dir="rtl">{hebrewOf(b.id)}</p>
      <h4>Transliteration</h4><p>{OPEN}{b.say}</p>
      <h4>Meaning in English</h4><p>{OPEN_EN}{b.meaning}</p>
      {b.note && <p><small>{b.note}</small></p>}
    </section>)}
    <p><button onClick={() => setPrinting(true)} data-print-main>🖨️ Print the blessings and night chart</button></p>
    {printing && <PrintPreview lang="en" title="Hanukkah candle lighting" onClose={() => setPrinting(false)}><CandleSheet start={next?.start} /></PrintPreview>}
    <p><small>The Hebrew text comes from the site’s checked collection of holiday blessings. Customs differ between communities; follow your family or community practice.</small></p>
  </Page>
}

// ── Activities ───────────────────────────────────────────────
function KindnessSheet() {
  return <article className="buga-a4 en-print-sheet" dir="ltr" style={{ padding: '14mm', fontSize: '13pt' }}>
    <h2 style={{ textAlign: 'center', fontSize: '24pt' }}>✨ Eight nights of kindness</h2>
    <p style={{ textAlign: 'center' }}>Each night, add one light — and one kind thing you did today.</p>
    {Array.from({ length: 8 }, (_, i) => <div key={i} style={{ display: 'flex', gap: '4mm', alignItems: 'center', borderBottom: '1px dashed #999', padding: '5mm 0' }}>
      <b style={{ width: '22mm' }}>Night {i + 1}</b><span style={{ fontSize: '16pt' }}>{'🕯️'.repeat(i + 1)}</span><span style={{ flex: 1, borderBottom: '1px solid #333', height: '7mm' }} />
    </div>)}
  </article>
}

function ActivitiesGuide({ guide }) {
  const [printing, setPrinting] = useState(false)
  const drawings = drawingsFor('hanukkah').slice(0, 4)
  const ideas = [
    ['🎲', 'Play dreidel', <>Learn the four letters and play with chocolate coins or raisins. <Link to={`${HANUKKAH_ROOT}/how-to-play-dreidel`}>Rules and a virtual dreidel</Link>.</>],
    ['🕎', 'Light the candles together', <>Let children count the candles and place them right to left. <Link to={`${HANUKKAH_ROOT}/candle-lighting`}>Blessings and night chart</Link>.</>],
    ['🖍️', 'Color a Hanukkah picture', <>A hanukkiah, a dreidel or a plate of doughnuts — print one each night. <Link to={HANUKKAH_ROOT}>Hanukkah coloring pages</Link>.</>],
    ['✨', 'Eight nights of kindness', <>Each night, everyone shares one kind thing they did. Print the chart below and fill in a line every evening.</>],
    ['🔢', 'Candle math', <>How many candles over all eight nights? (36, plus 8 shamashes makes 44.) Younger children can count each night’s candles on the chart.</>],
    ['🥔', 'Make latkes together', <>Children can wash potatoes, crack eggs and mix; an adult grates and fries. Talk about why foods cooked in oil are eaten on Hanukkah.</>],
    ['🍩', 'Sufganiyot taste test', <>Try jelly doughnuts with different fillings and vote for the family favorite.</>],
    ['📖', 'Tell the story in your own words', <>Retell the story of the Maccabees and the small jug of oil, then ask your child to tell it back using three pictures.</>],
    ['🔤', 'Learn four Hebrew words', <>Candle — ner (נר), oil — shemen (שמן), dreidel — sevivon (סביבון), light — or (אור). The Hanukkah page has a printable word match.</>],
    ['🎵', 'Sing Hanukkah songs', <>“Maoz Tzur”, “I Have a Little Dreidel” or the Hebrew “Sevivon, sov sov sov” — sing one after the candles each night.</>],
    ['✂️', 'Make a paper hanukkiah', <>Glue eight paper candles and a taller shamash onto card, and add one paper flame each night.</>],
    ['⚡', 'Run a Hanukkah quiz', <>Families and classes can play a live quiz from their phones. <Link to="/en/live">Create a Buga Live quiz</Link>.</>],
  ]
  const faq = [
    { q: 'What can kids do for Hanukkah at home?', a: 'Light the candles together, play dreidel, make latkes, color Hanukkah pictures and keep an eight-nights-of-kindness chart. Each idea on this page takes 10–30 minutes.' },
    { q: 'What are good Hanukkah activities for a classroom?', a: 'Dreidel in small groups, candle math, a Hebrew word match and a live Hanukkah quiz all work well and need very little preparation.' },
    { q: 'Are these activities free?', a: 'Yes. All the printables, coloring pages and games linked here are free, with no sign-up.' },
  ]
  return <Page guide={guide} faq={faq} description="12 easy Hanukkah activities for kids at home or in class: dreidel, candle math, latkes, coloring pages, a kindness chart and more — free printables included.">
    <p className="en-lead">Eight nights, twelve ideas. Pick one or two each evening — most take less than half an hour and need nothing more than paper, crayons and a dreidel.</p>
    <div className="en-cards">{ideas.map(([emoji, title, text]) => <div className="en-card" key={title}><h2 style={{ fontSize: '1.3rem', marginTop: 0 }}>{emoji} {title}</h2><p>{text}</p></div>)}</div>
    <p><button onClick={() => setPrinting(true)} data-print-main>🖨️ Print the kindness chart</button></p>
    {printing && <PrintPreview lang="en" title="Eight nights of kindness" onClose={() => setPrinting(false)}><KindnessSheet /></PrintPreview>}
    {drawings.length > 0 && <><h2>Hanukkah coloring pages</h2><div className="en-cards">{drawings.map(d => <Link className="en-card" to={drawingPath(d)} key={drawingPath(d)}><h3>{d.name}</h3><span>Open and print →</span></Link>)}</div></>}
  </Page>
}

const PAGES = { 'how-to-play-dreidel': DreidelGuide, 'candle-lighting': CandleGuide, activities: ActivitiesGuide }
export default function EnglishHanukkah() {
  const { guide: slug } = useParams()
  const guide = HANUKKAH_GUIDES.find(g => g.slug === slug), Guide = PAGES[slug]
  return guide && Guide ? <Guide key={slug} guide={guide} /> : <EnglishNotFound />
}

// Links from the main Hanukkah page to the three guides.
export function HanukkahGuideCards() {
  return <section><h2>Hanukkah guides for families</h2><div className="en-cards">{HANUKKAH_GUIDES.map(g => <Link className="en-card" key={g.slug} to={`${HANUKKAH_ROOT}/${g.slug}`}><h3>{g.emoji} {g.short}</h3><p>{g.blurb}</p><span>Read more →</span></Link>)}</div></section>
}

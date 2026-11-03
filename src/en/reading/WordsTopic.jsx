import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { EnglishNotFound } from '../EnglishLayout'
import { ENGLISH_TOPICS } from '../../data/englishWords'
import { speak, stopSpeaking } from '../../utils/speak'
import { shuffle } from '../../utils/shuffle'
import { WORD_TOPICS, ABC_ROOT, topicMeta } from './abcMeta'
import Pic from './Pic'
import './reading.css'

const sayIt = word => void speak(word.en, 'en-US')
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

function CardsPages({ topic, m }) {
  return chunk(topic.words, 6).map((part, i) => <article className="buga-a4" key={i}>
    <h2>{m.title} · {m.emoji}</h2>
    <div className="grid w-full flex-1 grid-cols-2 grid-rows-3 gap-0 border-2 border-dashed border-slate-400">
      {part.map(word => <div key={word.en} className="flex flex-col items-center justify-center gap-2 border border-dashed border-slate-400 p-2 text-center">
        <Pic word={word} size={110} eager />
        <b style={{ fontSize: 34 }}>{word.en}</b>
      </div>)}
    </div>
    <footer>Cut along the dashed lines · Ugabuga · ugabuga.co.il</footer>
  </article>)
}

function MemoryPages({ topic, m }) {
  return chunk(topic.words, 6).map((part, i) => <article className="buga-a4" key={i}>
    <h2>Memory game: {m.title}</h2>
    <div className="grid w-full flex-1 grid-cols-3 grid-rows-4 border-2 border-dashed border-slate-400">
      {part.flatMap(word => [
        <div key={word.en + '-p'} className="flex items-center justify-center border border-dashed border-slate-400 p-2"><Pic word={word} size={92} eager /></div>,
        <div key={word.en + '-w'} className="flex items-center justify-center border border-dashed border-slate-400 p-2 text-center"><b style={{ fontSize: 30 }}>{word.en}</b></div>,
      ])}
    </div>
    <footer>Cut out, turn face down and find the pairs: picture + word · Ugabuga · ugabuga.co.il</footer>
  </article>)
}

function MatchPages({ topic, m }) {
  return chunk(topic.words, 6).map((part, i) => {
    // Fixed order (not random): the preview and the printed copy render separately and must match.
    const words = part.length > 2 ? [...part.slice(2), ...part.slice(0, 2)] : [...part].reverse()
    return <article className="buga-a4" key={i}>
      <h2>Draw a line from each picture to its word: {m.title}</h2>
      <p style={{ margin: '0 0 10px' }}>Name: ____________________</p>
      <div className="grid w-full flex-1 grid-cols-2 items-center gap-x-24" style={{ gridTemplateRows: `repeat(${part.length}, 1fr)` }}>
        {part.map((word, k) => [
          <div key={'p' + k} className="flex items-center justify-start gap-4" style={{ gridColumn: 1, gridRow: k + 1 }}><Pic word={word} size={78} eager /><span className="text-3xl">●</span></div>,
          <div key={'w' + k} className="flex items-center justify-end gap-4" style={{ gridColumn: 2, gridRow: k + 1 }}><span className="text-3xl">●</span><b style={{ fontSize: 30 }}>{words[k].en}</b></div>,
        ])}
      </div>
      <footer>Ugabuga · ugabuga.co.il</footer>
    </article>
  })
}

const ROUNDS = 10
function PictureGame({ topic }) {
  const makeRound = () => {
    const answer = topic.words[Math.floor(Math.random() * topic.words.length)]
    const others = shuffle(topic.words.filter(x => x !== answer)).slice(0, 3)
    return { answer, options: shuffle([answer, ...others]) }
  }
  const [round, setRound] = useState(makeRound)
  const [n, setN] = useState(0), [score, setScore] = useState(0), [picked, setPicked] = useState(null)
  if (n >= ROUNDS) return <div className="enr-center">
    <p style={{ fontSize: 56, margin: 0 }}>{score >= 8 ? '🏆' : score >= 5 ? '🌟' : '👍'}</p>
    <p className="enr-score">{score} out of {ROUNDS}</p>
    <p>{score >= 8 ? 'Excellent!' : score >= 5 ? 'Very good!' : 'Good try! Play again?'}</p>
    <button type="button" className="enr-btn" onClick={() => { setScore(0); setN(0); setPicked(null); setRound(makeRound()) }}>🔄 New game</button>
  </div>
  const choose = opt => { if (picked) return; setPicked(opt); if (opt === round.answer) setScore(s => s + 1) }
  const next = () => { setPicked(null); setN(x => x + 1); const r = makeRound(); setRound(r); sayIt(r.answer) }
  return <div className="enr-center">
    <p className="enr-meta">Question {n + 1} of {ROUNDS} · ⭐ {score}</p>
    <p>Which picture is…</p>
    <button type="button" className="enr-chip" style={{ fontSize: 30, fontWeight: 800 }} onClick={() => sayIt(round.answer)} aria-label={`Hear the word ${round.answer.en}`}>{round.answer.en} <span aria-hidden="true">🔊</span></button>
    <div className="enr-game-pics">{round.options.map(opt => <button key={opt.en} type="button" aria-label={`Picture: ${opt.en}`} disabled={!!picked} onClick={() => choose(opt)}
      className={`enr-pic ${picked && opt === round.answer ? 'is-right' : ''} ${picked === opt && opt !== round.answer ? 'is-wrong' : ''}`}><Pic word={opt} size={84} /></button>)}</div>
    {picked && <div role="status">
      <p className="enr-fb">{picked === round.answer ? '✅ Correct!' : `❌ That is ${round.answer.en}.`}</p>
      <button type="button" className="enr-btn" onClick={next}>{n + 1 >= ROUNDS ? 'See my score 🏁' : 'Next →'}</button>
    </div>}
  </div>
}

export default function WordsTopic({ params }) {
  const m = topicMeta(params?.topic), topic = m && ENGLISH_TOPICS.find(t => t.slug === m.slug)
  return topic ? <Topic key={m.slug} m={m} topic={topic} /> : <EnglishNotFound />
}

function Topic({ m, topic }) {
  const [printing, setPrinting] = useState(null)
  useEffect(() => () => stopSpeaking(), [])
  const others = useMemo(() => WORD_TOPICS.filter(x => x.slug !== m.slug), [m.slug])
  const examples = topic.words.slice(0, 4).map(x => x.en).join(', ')
  const faq = [
    { q: `What words are in "${m.title}"?`, a: `${topic.words.map(x => x.en).join(', ')}. All ${topic.words.length} words have a picture and sound.` },
    { q: 'How do I hear a word?', a: 'Tap or click a card and your device says the word aloud.' },
    { q: 'What can I print?', a: 'Word cards with a picture and a word, a memory game of picture and word pairs, and a "draw a line" matching sheet.' },
  ]
  return <div className="enr-page">
    <SEO lang="en" path={m.path} counterpartPath={`/english/${m.slug}`}
      title={`${m.title} - picture words for kids`}
      description={`${m.title} in English with pictures and sound: ${examples} and more. Play a picture game and print word cards, a memory game or a matching sheet.`}
      structuredData={faqSchema(faq)} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'First words', href: '/en/words' }, { label: m.title }]} />
    <h1><span aria-hidden="true">{m.emoji} </span>{m.title}</h1>
    <p className="enr-lead">{m.intro}</p>

    <p className="enr-meta">👆 Tap a card to hear the word</p>
    <div className="enr-words" style={{ marginBottom: 28 }}>{topic.words.map(word => <button key={word.en} type="button" className="enr-word" onClick={() => sayIt(word)} aria-label={`${word.en}. Tap to hear it`}>
      <Pic word={word} size={72} /><b>{word.en} <span aria-hidden="true" style={{ fontSize: 16 }}>🔊</span></b>
    </button>)}</div>

    <section className="enr-box sun" aria-labelledby="game-h">
      <h2 id="game-h" className="enr-center">🎮 Game: find the picture</h2>
      <PictureGame key={m.slug} topic={topic} />
    </section>

    <section className="enr-center" aria-labelledby="print-h">
      <h2 id="print-h">🖨️ Print</h2>
      <div className="enr-chips">
        <button data-print-main type="button" className="enr-btn" onClick={() => setPrinting('cards')}>🃏 Picture and word cards</button>
        <button type="button" className="enr-btn alt" onClick={() => setPrinting('memory')}>🧠 Memory game</button>
        <button type="button" className="enr-btn alt" onClick={() => setPrinting('match')}>✏️ Matching sheet</button>
      </div>
    </section>

    <nav aria-label="More topics" className="mt-8">
      <h2 className="enr-center">More topics</h2>
      <div className="enr-chips">
        {others.map(x => <Link key={x.slug} to={x.path} className="enr-chip">{x.emoji} {x.title}</Link>)}
        <Link to={ABC_ROOT} className="enr-chip">🔤 Letters A-Z</Link>
      </div>
    </nav>

    <div className="mt-8"><SeoBody lang="en" faq={faq} related={[{ label: 'All picture-word topics', href: '/en/words' }, { label: 'Learn the ABC', href: ABC_ROOT }, { label: 'Reading practice', href: '/en/reading' }]} /></div>

    {printing && <PrintPreview lang="en" title={m.title} onClose={() => setPrinting(null)}>
      {printing === 'cards' ? <CardsPages topic={topic} m={m} /> : printing === 'memory' ? <MemoryPages topic={topic} m={m} /> : <MatchPages topic={topic} m={m} />}
    </PrintPreview>}
  </div>
}

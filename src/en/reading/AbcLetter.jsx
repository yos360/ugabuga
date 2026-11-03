import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { LetterSheet } from '../../components/ui/HebrewTracing'
import { EnglishNotFound } from '../EnglishLayout'
import { ABC_LETTERS } from '../../data/content/abcLetters'
import { ABC_MORE } from '../../data/content/abcLettersMore'
import { speak, stopSpeaking } from '../../utils/speak'
import { ABC_ROOT, LETTER_INFO, LETTER_SLUGS } from './abcMeta'
import './reading.css'

const say = (text, rate) => void speak(text, 'en-US', rate ? { rate } : undefined)

export default function AbcLetter({ params }) {
  const i = ABC_LETTERS.findIndex(x => x.slug === params?.letter)
  return i < 0 ? <EnglishNotFound /> : <LetterPage key={ABC_LETTERS[i].slug} i={i} />
}

function LetterPage({ i }) {
  const l = ABC_LETTERS[i], L = l.letter, info = LETTER_INFO[L], more = ABC_MORE[l.slug]?.more || []
  const prev = ABC_LETTERS[i - 1], next = ABC_LETTERS[i + 1]
  const [printing, setPrinting] = useState(false)
  useEffect(() => () => stopSpeaking(), [])
  const path = `${ABC_ROOT}/${l.slug}`
  const first = l.words.slice(0, 3).map(w => w.en).join(', ')
  const faq = [
    { q: `What is the name of the letter ${L}?`, a: `The letter ${L} is called "${info.name}". Its small form is ${l.lower}.` },
    { q: `What sound does ${L} make?`, a: info.sound },
    { q: `Which words begin with ${L}?`, a: `${l.words.map(w => w.en).join(', ')}, and more: ${more.map(m => m[0]).join(', ')}.` },
  ]
  return <div className="enr-page">
    <SEO lang="en" path={path} counterpartPath={`/abc/${l.slug}`}
      title={`Letter ${L}${l.lower} - sound, words and tracing sheet`}
      description={`Learn the letter ${L}: its name, its sound, picture words such as ${first}, a practice sentence and a free tracing sheet to print.`}
      structuredData={faqSchema(faq)} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'ABC', href: ABC_ROOT }, { label: `Letter ${L}` }]} />
    <div className="enr-letter-hero">
      <div className="big" aria-hidden="true">{L}{l.lower}</div>
      <button type="button" className="enr-btn" onClick={() => say(L)}>🔊 Hear the letter name</button>
    </div>
    <h1>The letter {L}{l.lower}</h1>
    <p className="enr-lead">The letter {L} is called “{info.name}”. It is letter {i + 1} of the 26 letters of the English alphabet.</p>

    <section className="enr-box sun">
      <h2>🔊 How it sounds</h2>
      <p>{info.sound}</p>
    </section>

    <h2>Words that start with {L}</h2>
    <p className="enr-meta">👆 Tap a picture to hear the word</p>
    <div className="enr-words">{l.words.map(w => <button key={w.en} type="button" className="enr-word" onClick={() => say(w.en)} aria-label={`Hear the word ${w.en}`}>
      <span className="em" aria-hidden="true">{w.emoji}</span><b>{w.en}</b>
    </button>)}</div>

    {more.length > 0 && <>
      <h3 className="mt-6">More {L} words</h3>
      <ul className="enr-more">{more.map(([en]) => <li key={en}><button type="button" className="enr-w" onClick={() => say(en)} aria-label={`Hear the word ${en}`}>🔊 <b>{en}</b></button></li>)}</ul>
    </>}

    <section className="enr-box">
      <h2>A sentence to practice</h2>
      <p style={{ fontSize: 22 }}>{l.sentence.en}</p>
      <div className="enr-tools" style={{ justifyContent: 'flex-start' }}>
        <button type="button" className="enr-chip" onClick={() => say(l.sentence.en)}>🔊 Hear it</button>
        <button type="button" className="enr-chip" onClick={() => say(l.sentence.en, 0.55)}>🐢 Hear it slowly</button>
      </div>
      <p>How many words in the sentence start with {L}? Say them out loud.</p>
    </section>

    <section className="enr-box sky">
      <h2>✏️ Two things to try</h2>
      <ol>
        <li>Go on a letter hunt. Find three things around you whose names start with {L}, and say each one out loud.</li>
        <li>Say each picture word above slowly and listen for the first sound. Then clap once for every part of the word.</li>
      </ol>
    </section>

    <section className="enr-box enr-center">
      <h2>Free tracing sheet for {L}{l.lower}</h2>
      <div className="enr-sheet-preview" aria-hidden="true"><LetterSheet letter={L} lang="en" /></div>
      <p><button type="button" data-print-main className="enr-btn" onClick={() => setPrinting(true)}>🖨️ Print or download PDF</button></p>
      <p className="enr-meta">One A4 page: a big letter to trace, capital and small letters on handwriting lines, and a letter to color.</p>
    </section>
    {printing && <PrintPreview lang="en" title={`Trace the letter ${L}${l.lower}`} onClose={() => setPrinting(false)}>
      <article className="buga-a4"><div className="print-art"><LetterSheet letter={L} lang="en" /></div><footer>Ugabuga · ugabuga.co.il</footer></article>
    </PrintPreview>}

    <nav className="enr-nav" aria-label="Previous and next letter">
      {prev ? <Link to={`${ABC_ROOT}/${prev.slug}`} className="enr-chip">← {prev.letter}{prev.lower}</Link> : <span />}
      <Link to={ABC_ROOT} className="enr-chip">A-Z</Link>
      {next ? <Link to={`${ABC_ROOT}/${next.slug}`} className="enr-chip">{next.letter}{next.lower} →</Link> : <span />}
    </nav>
    <nav className="enr-strip" aria-label="All letters">{LETTER_SLUGS.map(s => s === l.slug
      ? <span key={s} aria-current="page">{s.toUpperCase()}</span>
      : <Link key={s} to={`${ABC_ROOT}/${s}`} aria-label={`Letter ${s.toUpperCase()}`}>{s.toUpperCase()}</Link>)}</nav>
    <div className="mt-8"><SeoBody lang="en" faq={faq} related={[{ label: 'All letters A-Z', href: ABC_ROOT }, { label: 'Letter tracing sheets', href: `${ABC_ROOT}/tracing` }, { label: 'Letter flashcards', href: `${ABC_ROOT}/flashcards` }, { label: 'First words with pictures', href: '/en/words' }]} /></div>
  </div>
}

import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { READING_BANDS, READING_STORY_META } from './readingMeta'
import { ABC_ROOT, WORD_TOPICS } from './abcMeta'
import { READING_PAGES } from './catalog'
import './reading.css'

const FAQ = [
  { q: 'How do the stories work?', a: 'Read the text, and tap any word to hear it said aloud. Use the listen button to hear the whole text read slowly. At the end there are comprehension questions with instant feedback.' },
  { q: 'Which level should my child start with?', a: 'Level 1 has very short texts of 40 to 80 words in simple present-tense sentences. If a child reads it easily and answers every question, move up one level. If they stumble on many words, go back one level.' },
  { q: 'Can I print the texts?', a: 'Yes. Every text has a print button that makes a sheet with the text and the questions, and a separate answer key for the adult.' },
  { q: 'Are the texts free?', a: 'Yes. All the texts, questions and printable sheets are free, with no sign-up.' },
]

const GUIDES = READING_PAGES.filter(p => [ABC_ROOT, '/en/words'].includes(p.path))

export default function ReadingHub() {
  const total = READING_STORY_META.length
  return <div className="enr-page">
    <SEO lang="en" path="/en/reading" title="Free reading practice for kids - stories, fables and fact texts" counterpartPath="/learn/english-reading"
      description={`${total} short texts in five levels: stories, fables, diaries, letters and fact texts. Tap any word to hear it, answer the questions and print.`}
      structuredData={[{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Reading practice for kids', itemListElement: READING_STORY_META.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: `https://ugabuga.co.il${s.path}` })) }, faqSchema(FAQ)]} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Reading' }]} />
    <h1><span aria-hidden="true">📖 </span>Reading practice for kids</h1>
    <p className="enr-lead">{total} short texts in five levels, from five-line stories to long articles. Tap any word to hear it, listen to the whole text, then answer the questions. Every text can be printed.</p>

    <section className="enr-box sun" aria-labelledby="start-h">
      <h2 id="start-h">Just starting out?</h2>
      <p>Begin with the letters and first words, then move on to the stories.</p>
      <ul className="enr-grid">
        {GUIDES.map(g => <li key={g.path}><Link to={g.path} className="enr-card"><span className="ico" aria-hidden="true">{g.emoji}</span><span><b>{g.path === ABC_ROOT ? 'Learn the ABC' : 'First words with pictures'}</b><small>{g.path === ABC_ROOT ? '26 letters with sounds, picture words and tracing sheets to print.' : `${WORD_TOPICS.length} topics: colors, numbers, animals, food and more.`}</small></span></Link></li>)}
        <li><Link to={`${ABC_ROOT}/flashcards`} className="enr-card"><span className="ico" aria-hidden="true">🃏</span><span><b>Letter flashcards</b><small>Print eight picture cards to an A4 page.</small></span></Link></li>
        <li><Link to={`${ABC_ROOT}/handwriting-lines`} className="enr-card"><span className="ico" aria-hidden="true">📝</span><span><b>Handwriting lines</b><small>Guide lines for neat capital and small letters.</small></span></Link></li>
      </ul>
    </section>

    <nav className="enr-chips" aria-label="Jump to a level">{READING_BANDS.map(b => <a key={b.id} href={`#${b.id}`} className="enr-chip">{b.emoji} {b.label}</a>)}</nav>
    {READING_BANDS.map(b => <section key={b.id} id={b.id} aria-labelledby={`${b.id}-h`}>
      <div className="enr-band-head"><h2 id={`${b.id}-h`}><span aria-hidden="true">{b.emoji} </span>{b.label}</h2><span>{b.words[0]}-{b.words[1]} words · {b.ages} · {b.desc}</span></div>
      <ul className="enr-grid">{READING_STORY_META.filter(s => s.band === b.id).map(s => <li key={s.slug}><Link to={s.path} className="enr-card">
        <span className="ico" aria-hidden="true">{s.emoji}</span>
        <span><b>{s.title}</b><small>{s.genre}</small><small>{s.summary}</small></span>
      </Link></li>)}</ul>
    </section>)}

    <div className="mt-12"><SeoBody lang="en" paragraphs={[
      'Reading gets easier with practice, and practice is more fun when the text is interesting. These texts cover animals, space, holidays, travel, history and everyday life, so there is something for every reader.',
      'Each level builds on the one before it. Level 1 uses short sentences and common words. By Level 5 the texts have longer paragraphs, opinions and ideas that ask the reader to think. Word counts are shown for every level so you can see how the texts grow.',
      'How to use them: pick a level, read the text once without help, tap any word you do not know to hear it, and then answer the questions. Later, listen to the whole text read aloud and read along. Adults can print the text and the answer key.',
    ]} faq={FAQ} related={[{ label: 'Learn the ABC', href: ABC_ROOT }, { label: 'First words with pictures', href: '/en/words' }, { label: 'English home', href: '/en' }]} /></div>
  </div>
}

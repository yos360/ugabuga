import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { ENGLISH_TOPICS } from '../../data/englishWords'
import { ABC_ROOT, WORD_TOPICS } from './abcMeta'
import Pic from './Pic'
import './reading.css'

const FAQ = [
  { q: 'How do I teach first words?', a: 'A few words at a time, with a picture and a sound. Tap a card to hear the word, play the picture game, then print the cards for a memory game. Short and often works better than long and rarely.' },
  { q: 'What can I print?', a: 'In every topic: picture and word cards (six to a page), a memory game of picture and word pairs, and a "draw a line" matching sheet.' },
  { q: 'What age is this for?', a: 'Ages 3 and up. Younger children use the pictures and sound. Older children can read the words, play the game and use the printed sheets.' },
  { q: 'Is it free?', a: 'Yes. All topics, games and printable sheets are free, with no sign-up.' },
]

export default function WordsHub() {
  const total = ENGLISH_TOPICS.reduce((n, t) => n + t.words.length, 0)
  return <div className="enr-page">
    <SEO lang="en" path="/en/words" title="First English words by topic - picture words for kids"
      description={`${total} first words in ${WORD_TOPICS.length} topics with pictures and sound: colors, numbers, animals, feelings, food and more. Play, then print word cards and games.`}
      structuredData={faqSchema(FAQ)} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'First words' }]} />
    <h1><span aria-hidden="true">🖼️ </span>First words with pictures</h1>
    <p className="enr-lead">{total} first words in {WORD_TOPICS.length} topics. Tap a picture to hear the word, play a short picture game, and print cards and games for home or class.</p>
    <ul className="enr-grid">
      {WORD_TOPICS.map(t => {
        const topic = ENGLISH_TOPICS.find(x => x.slug === t.slug)
        return <li key={t.slug}><Link to={t.path} className="enr-card">
          <span className="ico" aria-hidden="true">{topic.slug === 'days' ? '📅' : <Pic word={topic.words.find(w => w.emoji) || topic.words[0]} size={44} />}</span>
          <span><b>{t.title}</b><small>{topic.words.slice(0, 3).map(w => w.en).join(' · ')}</small></span>
        </Link></li>
      })}
    </ul>
    <div className="enr-chips mt-8">
      <Link to={ABC_ROOT} className="enr-chip">🔤 Learn the ABC</Link>
      <Link to="/en/reading" className="enr-chip">📖 Reading practice</Link>
    </div>
    <div className="mt-12"><SeoBody lang="en" paragraphs={[
      'Children learn words best through pictures, sound and play. In each topic you can tap a card to hear a word, play a short game that matches words and pictures, and print three kinds of sheets.',
      'A simple plan: one topic a week and ten minutes a day. Start with colors, numbers and animals. Then move on to feelings, clothes, food and the things around your home and classroom.',
      'For the youngest children, print the cards and name each picture together. For beginning readers, use the memory game and matching sheet to link the written word to its picture.',
    ]} faq={FAQ} related={[{ label: 'Learn the ABC', href: ABC_ROOT }, { label: 'Reading practice', href: '/en/reading' }, { label: 'English home', href: '/en' }]} /></div>
  </div>
}

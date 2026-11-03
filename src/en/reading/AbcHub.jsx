import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { ABC_ROOT, LETTER_SLUGS } from './abcMeta'
import './reading.css'

const FAQ = [
  { q: 'How many letters are in the English alphabet?', a: 'There are 26 letters, from A to Z. Each letter has a capital form (A) and a small form (a). Five of them, A, E, I, O and U, are vowels.' },
  { q: 'Should children learn letter names or letter sounds first?', a: 'Both help. Letter names are useful for the alphabet song and for spelling. Letter sounds are what children use to read words, so practice them together: "A, ay, says /a/ as in apple".' },
  { q: 'What age is this for?', a: 'The letter pages suit ages 3 to 7. Younger children can tap pictures and listen. Older children can trace the letters and read the practice sentences.' },
  { q: 'Can I print the letters?', a: 'Yes. Every letter has a tracing sheet, and there are flashcards and handwriting lines to print. All free, with no sign-up.' },
]

export default function AbcHub() {
  return <div className="enr-page">
    <SEO lang="en" path={ABC_ROOT} counterpartPath="/abc" title="Learn the ABC - letters A to Z with sounds and picture words"
      description="Learn the English alphabet: letter names, sounds, picture words to hear, a practice sentence and a free printable tracing sheet for every letter."
      structuredData={faqSchema(FAQ)} />
    <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'ABC' }]} />
    <h1><span aria-hidden="true">🔤 </span>Learn the ABC</h1>
    <p className="enr-lead">Pick a letter to hear its name and sound, meet six picture words and print a tracing sheet. Twenty-six letters, one at a time.</p>
    <div className="enr-letter-grid">{LETTER_SLUGS.map(s => <Link key={s} to={`${ABC_ROOT}/${s}`} className="enr-letter-tile" aria-label={`Letter ${s.toUpperCase()}`}>{s.toUpperCase()}{s}</Link>)}</div>

    <section className="enr-box sun">
      <h2>Print and practice</h2>
      <ul className="enr-grid">
        <li><Link to={`${ABC_ROOT}/tracing`} className="enr-card"><span className="ico" aria-hidden="true">✏️</span><span><b>Letter tracing sheets</b><small>One A4 page for each letter, A to Z.</small></span></Link></li>
        <li><Link to={`${ABC_ROOT}/flashcards`} className="enr-card"><span className="ico" aria-hidden="true">🃏</span><span><b>Letter flashcards</b><small>Capital and small letter with a picture and a word.</small></span></Link></li>
        <li><Link to={`${ABC_ROOT}/handwriting-lines`} className="enr-card"><span className="ico" aria-hidden="true">📝</span><span><b>Handwriting lines</b><small>Guide lines for capital and small letters.</small></span></Link></li>
      </ul>
    </section>
    <section className="enr-box sky">
      <h2>Keep going</h2>
      <ul className="enr-grid">
        <li><Link to="/en/words" className="enr-card"><span className="ico" aria-hidden="true">🖼️</span><span><b>First words with pictures</b><small>Colors, animals, food and more, with sound.</small></span></Link></li>
        <li><Link to="/en/reading" className="enr-card"><span className="ico" aria-hidden="true">📖</span><span><b>Reading practice</b><small>Short texts in five levels, with questions.</small></span></Link></li>
      </ul>
    </section>

    <div className="mt-12"><SeoBody lang="en" paragraphs={[
      'Learning the alphabet is the first step to reading. This page gives each of the 26 letters its own page, with the letter name, what it sounds like, six picture words and a sentence to practice.',
      'A good routine is one letter a day. Say the name, say the sound, tap each picture to hear the word, then trace the letter with a pencil. Hunt for the letter on signs, books and food packages around you.',
      'Some letters have more than one sound. C can say /k/ as in cat or /s/ as in city, and G can say /g/ as in goat or /j/ as in giant. The letter pages explain these, so children meet them in small steps.',
    ]} faq={FAQ} related={[{ label: 'Letter tracing sheets', href: `${ABC_ROOT}/tracing` }, { label: 'Letter flashcards', href: `${ABC_ROOT}/flashcards` }, { label: 'First words with pictures', href: '/en/words' }, { label: 'Reading practice', href: '/en/reading' }]} /></div>
  </div>
}

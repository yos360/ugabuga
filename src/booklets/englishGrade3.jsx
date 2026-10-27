import { ENGLISH_TOPICS } from '../data/englishWords'
import { AnswerKey, Certificate, ChoicePage, Cover, FillPage, MatchPage, TracePage, WordSearchPage, WritePage, rngFor } from './kit'
import { bookletBySlug } from './registry'

// "חוברת אנגלית לכיתה ג׳" — the first year of English in Israeli schools: the ABC (capital and small),
// first sounds, and first words (colours, numbers, animals, fruit, classroom, feelings). Pictures come
// from the English word bank's print art, so every word has a picture the child already met on the site.
const topic = slug => ENGLISH_TOPICS.find(t => t.slug === slug).words
const pick = (slug, list) => list.map(en => topic(slug).find(w => w.en === en))
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const PAGES = bookletBySlug('english-grade-3').pages

const SOUND_WORDS = pick('animals', ['dog', 'cat', 'fish', 'lion', 'monkey', 'bird', 'rabbit', 'horse'])
const ANIMALS = pick('animals', ['cow', 'sheep', 'pig', 'duck', 'elephant', 'frog', 'bear', 'chicken'])
const FRUITS = pick('fruits', ['apple', 'banana', 'lemon', 'pear', 'grapes', 'mango', 'peach', 'cherry'])
const CLASS = pick('classroom', ['book', 'pencil', 'chair', 'door', 'ruler', 'bag', 'clock', 'computer'])
const FEELINGS = pick('feelings', ['happy', 'sad', 'angry', 'scared', 'surprised', 'tired', 'calm', 'excited'])
const COLORS = [['red', '#e53935'], ['blue', '#1e88e5'], ['green', '#43a047'], ['yellow', '#fdd835'], ['orange', '#fb8c00'], ['purple', '#8e24aa'], ['brown', '#795548'], ['black', '#212121']]
const NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const SEARCH = pick('animals', ['dog', 'cat', 'cow', 'pig', 'lion', 'fish', 'duck', 'bear'])

// Three options: the right one first in the data, shuffled on the page with a fixed seed.
const options = (rng, answer, pool) => rng.shuffle([answer, ...rng.shuffle(pool.filter(x => x !== answer)).slice(0, 2)])

export function englishGrade3Data(seed) {
  const r = rngFor(seed, 3)
  const missing = Array.from({ length: 8 }, (_, i) => {
    // lowercase l looks like capital I in most fonts, so a run with L stays in capitals.
    const start = r.int(0, 21), run = ABC.slice(start, start + 5).split(''), small = i % 2 === 1 && !run.includes('L')
    const holes = r.shuffle([0, 1, 2, 3, 4]).slice(0, 2).sort()
    const shown = run.map((ch, k) => holes.includes(k) ? '__' : small ? ch.toLowerCase() : ch)
    return { line: shown.join('  '), answer: holes.map(k => small ? run[k].toLowerCase() : run[k]).join(', ') }
  })
  const firstLetter = SOUND_WORDS.map(w => ({ w, opts: options(r, w.en[0].toUpperCase(), ABC.split('')) }))
  const animalWords = ANIMALS.map(w => ({ w, opts: options(r, w.en, ANIMALS.map(a => a.en)) }))
  const classWords = CLASS.map(w => ({ w, opts: options(r, w.en, CLASS.map(a => a.en)) }))
  const caps = r.shuffle(ABC.split('')).slice(0, 8)
  return { missing, firstLetter, animalWords, classWords, caps }
}

export default function EnglishGrade3Booklet({ seed }) {
  const d = englishGrade3Data(seed)
  return <>
    <Cover emoji="🇬🇧✏️📘" title="חוברת אנגלית לכיתה ג׳" subtitle="15 עמודים: ה־ABC, צלילים ראשונים ומילים ראשונות באנגלית" pages={PAGES}
      note="עמוד אחד ביום מספיק. קראו יחד בקול כל מילה באנגלית. בעמוד האנגלית באתר אפשר לשמוע איך אומרים כל מילה." />
    <TracePage n={2} title="אותיות A–M" instruction="עוברים בעיפרון על האות הגדולה ועל האות הקטנה, משמאל לימין" rows={ABC.slice(0, 13).split('').map(c => c + c.toLowerCase())} />
    <TracePage n={3} title="אותיות N–Z" instruction="עוברים בעיפרון על האות הגדולה ועל האות הקטנה, משמאל לימין" rows={ABC.slice(13).split('').map(c => c + c.toLowerCase())} />
    <MatchPage n={4} seed={seed} title="אות גדולה ואות קטנה" instruction="מותחים קו מכל אות גדולה לאות הקטנה שלה" sub="Match the big letter to the small letter"
      pairs={d.caps.map(c => [{ text: c, ltr: true }, { text: c.toLowerCase(), ltr: true }])} />
    <FillPage n={5} title="אותיות חסרות" instruction="כותבים את האותיות החסרות לפי סדר ה־ABC" sub="Write the missing letters" ltr lines={d.missing.map(m => m.line)} />
    <ChoicePage n={6} title="באיזו אות מתחילה המילה?" instruction="אומרים את שם החיה באנגלית ומקיפים את האות הראשונה" sub="Circle the first letter" ltr
      items={d.firstLetter.map(({ w, opts }) => ({ pic: { art: w.emoji }, options: opts }))} />
    <MatchPage n={7} seed={seed} title="צבעים — Colors" instruction="מותחים קו מכל צבע למילה שלו באנגלית" sub="Match the color to the word"
      pairs={COLORS.map(([en, color]) => [{ color }, { text: en, ltr: true }])} />
    <MatchPage n={8} seed={seed} title="מספרים — Numbers" instruction="מותחים קו מכל מספר למילה שלו באנגלית" sub="Match the number to the word"
      pairs={NUMBERS.map((en, i) => [{ text: String(i + 1) }, { text: en, ltr: true }])} />
    <ChoicePage n={9} title="חיות — Animals" instruction="מקיפים את השם הנכון של החיה" sub="Circle the right word" ltr
      items={d.animalWords.map(({ w, opts }) => ({ pic: { art: w.emoji }, options: opts }))} />
    <WritePage n={10} title="פירות — Fruits" instruction="עוברים על המילה בעיפרון וכותבים אותה שוב על הקו" sub="Trace and write"
      items={FRUITS.map(w => ({ pic: { art: w.emoji }, word: w.en }))} />
    <ChoicePage n={11} title="בכיתה — This is a…" instruction="קוראים את המשפט ומקיפים את המילה שמתאימה לתמונה" sub="Read and circle" ltr
      items={d.classWords.map(({ w, opts }) => ({ pic: { art: w.emoji }, prompt: 'This is a', options: opts }))} />
    <MatchPage n={12} seed={seed} title="רגשות — Feelings" instruction="מותחים קו מכל פרצוף למילה שמתארת אותו" sub="How do they feel?"
      pairs={FEELINGS.map(w => [{ art: w.emoji }, { text: w.en, ltr: true }])} />
    <WordSearchPage n={13} seed={seed} title="תפזורת חיות" instruction="מוצאים את שמות החיות — משמאל לימין ומלמעלה למטה"
      words={SEARCH.map(w => ({ word: w.en, pic: { art: w.emoji } }))} />
    <AnswerKey n={14} sections={[
      { title: 'עמוד 5 — אותיות חסרות', answers: d.missing.map(m => m.answer) },
      { title: 'עמוד 6 — האות הראשונה', answers: SOUND_WORDS.map(w => `${w.en} — ${w.en[0].toUpperCase()}`) },
      { title: 'עמוד 9 — חיות', answers: ANIMALS.map(w => `${w.he} — ${w.en}`) },
      { title: 'עמוד 11 — This is a…', answers: CLASS.map(w => `${w.he} — ${w.en}`) },
      { title: 'עמוד 12 — רגשות', answers: FEELINGS.map(w => `${w.he} — ${w.en}`) },
    ]} />
    <Certificate booklet="חוברת האנגלית לכיתה ג׳" done="כתבתי את כל ה־ABC, מצאתי צלילים וקראתי מילים ראשונות באנגלית." cheer="Great job! I can read English!" />
  </>
}

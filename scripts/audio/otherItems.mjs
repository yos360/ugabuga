// Every non-Hebrew text the site reads aloud with speak(), per language: { lang, key, text }.
// `key` is exactly what the page passes to speak(); `text` is what we send to the TTS voice.
import { ENGLISH } from '../../src/data/letterLearning.js'
import { ENGLISH_TOPICS } from '../../src/data/englishWords.js'
import { DECKS } from '../../src/learn/learnData.js'
import { languageTopics } from '../../src/data/languages/index.js'

const CLASS_ONE_EN = ['CAT', 'DOG', 'HOUSE', 'SUN', 'BOOK', 'BALL', 'APPLE', 'STAR'] // ClassOnePrep ENGLISH_WORDS
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function otherItems() {
  const out = new Map()
  const add = (lang, key, text = key) => { if (key && !out.has(lang + '\0' + key)) out.set(lang + '\0' + key, { lang, key, text }) }
  // English: letters (LettersGame, ClassOnePrep) are spoken as the letter name.
  for (const l of LETTERS) add('en', l, `${l}.`)
  for (const e of ENGLISH) add('en', e.word)
  for (const t of ENGLISH_TOPICS) for (const w of t.words) add('en', w.en)
  for (const d of DECKS || []) if (d.ltrFront && !d.id.startsWith('tt-')) for (const [front] of d.cards) add('en', front)
  for (const w of CLASS_ONE_EN) add('en', w, w.toLowerCase())
  for (const lang of ['fr', 'es', 'ru', 'ar']) for (const t of languageTopics(lang)) for (const w of t.words) add(lang, w.word)
  return [...out.values()]
}

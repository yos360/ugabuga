// English pages of this area: pure data (path, title, counterpart or unpairedReason, emoji, description).
// Read by englishRoutes.js, the sitemap scripts and the English hubs. Imports only small data files.
import { READING_STORY_META, kindNoun } from './readingMeta.js'
import { ABC_ROOT, LETTER_SLUGS, LETTER_INFO, WORD_TOPICS } from './abcMeta.js'

const stories = READING_STORY_META.map(s => ({
  path: s.path,
  title: `${s.title} - ${kindNoun(s.kind)} to read`,
  description: `${s.summary} Read it, tap any word to hear it, answer the questions and print it.`,
  emoji: s.emoji,
  counterpart: `/learn/english-reading/${s.slug}`,
}))

const letters = LETTER_SLUGS.map(slug => {
  const L = slug.toUpperCase()
  return {
    path: `${ABC_ROOT}/${slug}`,
    title: `Letter ${L}${slug} - sound, words and tracing sheet`,
    description: `Learn the letter ${L}: its name, its sound, picture words to hear, a practice sentence and a free tracing sheet to print. ${LETTER_INFO[L].sound}`,
    emoji: '🔤',
    counterpart: `/abc/${slug}`,
  }
})

const topics = WORD_TOPICS.map(t => ({
  path: t.path,
  title: `${t.title} - picture words for kids`,
  description: `${t.intro} Tap a picture to hear the word, play a picture game and print word cards, a memory game or a matching sheet.`,
  emoji: t.emoji,
  counterpart: `/english/${t.slug}`,
}))

export const READING_PAGES = [
  {
    path: '/en/reading',
    title: 'Free reading practice for kids - stories, fables and fact texts',
    description: 'Thirty short texts in five levels: stories, fables, diaries, letters and fact texts. Tap any word to hear it, answer the questions and print.',
    emoji: '📖',
    counterpart: '/learn/english-reading',
  },
  ...stories,
  {
    path: ABC_ROOT,
    title: 'Learn the ABC - letters A to Z with sounds and picture words',
    description: 'Learn the English alphabet with letter names, sounds, picture words to hear, a practice sentence and free printable tracing sheets for every letter.',
    emoji: '🔤',
    counterpart: '/abc',
  },
  ...letters,
  {
    path: `${ABC_ROOT}/tracing`,
    title: 'Printable ABC letter tracing sheets A to Z',
    description: 'Free printable tracing sheets for every letter A-Z: a big letter to trace, capital and small letters on handwriting lines, and a letter to color.',
    emoji: '✏️',
    counterpart: '/printables/abc-letters',
  },
  {
    path: `${ABC_ROOT}/flashcards`,
    title: 'Printable ABC letter flashcards with pictures',
    description: 'Free printable alphabet flashcards: capital and small letters with a picture and a word, eight cards to an A4 page, in color or black and white.',
    emoji: '🃏',
    counterpart: '/printables/letter-flashcards',
  },
  {
    path: `${ABC_ROOT}/handwriting-lines`,
    title: 'Printable handwriting lines for English',
    description: 'Free printable handwriting paper with four guide lines and a dashed middle line, in wide or regular size, for practicing capital and small letters.',
    emoji: '📝',
    counterpart: '/printables/english-lines',
  },
  {
    path: '/en/words',
    title: 'First English words by topic - picture words for kids',
    description: 'Eighteen topics of first words with pictures and sound: colors, numbers, animals, feelings, food and more. Play, then print word cards and matching games.',
    emoji: '🖼️',
    unpairedReason: 'The Hebrew /english hub is a lesson hub for Hebrew speakers learning English and is kept apart from the English section; only its topic pages are paired.',
  },
  ...topics,
]

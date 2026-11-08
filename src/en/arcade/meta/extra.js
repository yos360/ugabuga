// English page copy for games whose English component lives in src/en/arcade/games (see EN_COMPONENTS in EnglishArcade.jsx).
// Pure data. Key = the Hebrew slug (/online-games/<slug>).
export const EXTRA = {
  'find-differences': {
    emoji: '🔍', name: 'Find the Differences',
    tagline: 'Two almost identical pictures. Tap everything that changed. 18 levels',
    title: 'Find the Differences - free online game for kids, 18 levels',
    description: 'Spot the difference online: two pictures of animals, space, the sea and more, each with a few changes. 18 levels, 3 to 7 differences, hints and stars.',
    ages: '4+',
    how: ['Pick a level. Two pictures appear that look almost the same.', 'Find something that is different and tap it, in either picture.', 'Every difference you find gets a red circle in both pictures.', 'Stuck for a while? The hint button circles an area with a difference in orange.'],
    tips: ['Scan the pictures row by row instead of jumping around.', 'Look for four kinds of change: something missing, something swapped, something bigger or smaller, and something extra.', 'Fewer misses and no hints earn three stars.'],
    skills: ['Visual attention and focus', 'Comparing details', 'Patience and careful looking'],
  },
  'word-guess': {
    emoji: '🟩', name: 'Five-Letter Word',
    tagline: 'A new word every day, endless practice by topic, and a word marathon',
    title: 'Five-Letter Word - free word guessing game for kids online',
    h1: 'Five-Letter Word - guess the word in six tries',
    description: 'A kid-friendly word guessing game: six tries to find a five-letter word, with colored letters after every guess. Word of the day, practice by topic and hints.',
    ages: '7+',
    how: ['Type a five-letter word and press Enter.', 'Green means the letter is in the word and in the right spot. Yellow means it is in the word but somewhere else. Gray means it is not in the word.', 'Use the colors to make a better guess. You have six tries.', 'The first hint shows the topic, the second shows one letter in its place.'],
    tips: ['Start with a word that has common letters, like a, e, r, s and t.', 'Do not reuse gray letters.', 'A yellow letter must move to a different spot in your next guess.'],
    skills: ['Spelling and vocabulary', 'Logical deduction', 'Planning the next guess'],
    faq: [
      { q: 'Is there a new word every day?', a: 'Yes. Word of the day is the same for everyone and changes at midnight. After it, you can keep playing in endless practice or try the marathon.' },
      { q: 'Do my guesses have to be real words?', a: 'No. Any five letters count as a guess, so younger players are never stuck. Real words still give the most useful clues.' },
    ],
  },
}

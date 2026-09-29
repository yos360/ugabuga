// Some legacy /games/{slug} URLs 301 to a dedicated /tools/* page (see public/_redirects).
// Link straight to the final URL so crawlers and visitors never hit a redirect hop.
const GAME_REDIRECTS = {
  'bingo': '/tools/bingo-maker',
  'buga-bingo': '/tools/bingo-maker',
  'buga-trivia': '/tools/trivia-quiz',
  'buga-town': '/tools/buga-town',
  'escape-room': '/tools/escape-rooms',
  'escape-rooms': '/tools/escape-rooms',
  'truth-or-dare': '/tools/truth-or-buga',
  'truth-or-buga': '/tools/truth-or-buga',
  'emet-o-buga': '/tools/truth-or-buga',
  'timer': '/tools/countdown-timer',
  'wheel': '/tools/random-picker',
  'riddles': '/tools/riddles',
  'word-search': '/tools/word-search-maker',
  'scavenger-hunt': '/tools/scavenger-hunt-maker',
  'treasure-hunt': '/tools/scavenger-hunt-maker',
  'eretz-ir-buga': '/tools/eretz-ir',
}
export const gameHref = slug => GAME_REDIRECTS[slug] || '/games/' + slug

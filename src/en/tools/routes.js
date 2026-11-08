// { path, Component: lazy(() => import('./Page')), props? } for each English page of this area,
// rendered by src/en/EnglishExtra.jsx (the component receives the route params as "params").
import { lazy } from 'react'

const pick = (load, name) => lazy(() => load().then(m => ({ default: m[name] })))
const random = name => pick(() => import('./EnglishRandomTools'), name)
const timers = name => pick(() => import('./EnglishTimerTools'), name)
const timeText = name => pick(() => import('./EnglishTimeText'), name)
const calc = name => pick(() => import('./EnglishCalcTools'), name)
const hebrew = name => pick(() => import('./EnglishHebrewTools'), name)
const party = name => pick(() => import('./EnglishPartyGames'), name)
const makers = name => pick(() => import('./EnglishMakers'), name)
const Dice = random('Dice')
const PdfAction = lazy(() => import('./EnglishPdfAction'))
const Image = lazy(() => import('./EnglishImage'))

export const TOOLS_ROUTES = [
  { path: '/en/tools', Component: lazy(() => import('./EnglishToolsHub')) },
  { path: '/en/tools/calculator', Component: lazy(() => import('./EnglishCalculator')) },
  { path: '/en/tools/hebrew-keyboard', Component: lazy(() => import('./EnglishHebrewKeyboard')) },
  { path: '/en/tools/pdf', Component: lazy(() => import('./EnglishPdf')) },
  { path: '/en/tools/qr-code', Component: lazy(() => import('./EnglishQr')) },
  { path: '/en/typing', Component: lazy(() => import('./EnglishTyping')) },
  // games and random tools
  { path: '/en/tools/dice', Component: Dice },
  { path: '/en/tools/dice/dnd', Component: Dice, props: { preset: 'dnd' } },
  { path: '/en/tools/dice/polyhedral', Component: Dice, props: { preset: 'polyhedral' } },
  { path: '/en/tools/dice/backgammon', Component: Dice, props: { preset: 'backgammon' } },
  { path: '/en/tools/dice/monopoly', Component: Dice, props: { preset: 'monopoly' } },
  { path: '/en/tools/dice/story-dice', Component: Dice, props: { preset: 'story' } },
  { path: '/en/tools/dice/emotions', Component: Dice, props: { preset: 'emotions' } },
  { path: '/en/tools/random-number', Component: random('RandomNumber') },
  { path: '/en/tools/coin-flip', Component: random('CoinFlip') },
  { path: '/en/tools/random-picker', Component: random('RandomPicker') },
  { path: '/en/tools/team-generator', Component: random('TeamGenerator') },
  { path: '/en/tools/spin-the-bottle', Component: random('SpinBottle') },
  { path: '/en/tools/true-or-false', Component: party('TrueOrFalse') },
  { path: '/en/tools/riddles', Component: party('Riddles') },
  { path: '/en/tools/joke', Component: party('Joke') },
  { path: '/en/tools/drawing-prompt', Component: party('DrawingPrompt') },
  { path: '/en/tools/secret-codes', Component: party('SecretCodes') },
  { path: '/en/tools/name-place-animal-thing', Component: party('NamePlaceAnimal') },
  // timers
  { path: '/en/tools/countdown-timer', Component: timers('CountdownTimer') },
  { path: '/en/tools/stopwatch', Component: timers('Stopwatch') },
  { path: '/en/tools/scoreboard', Component: timers('Scoreboard') },
  // printable makers
  { path: '/en/tools/word-search-maker', Component: makers('WordSearchMaker') },
  { path: '/en/tools/bingo-maker', Component: makers('BingoMaker') },
  { path: '/en/tools/crossword-maker', Component: makers('CrosswordMaker') },
  { path: '/en/tools/worksheet-maker', Component: makers('WorksheetMaker') },
  { path: '/en/tools/scavenger-hunt-maker', Component: makers('ScavengerHuntMaker') },
  // calculators
  { path: '/en/tools/percent-calculator', Component: calc('PercentCalculator') },
  { path: '/en/tools/fraction-calculator', Component: calc('FractionCalculator') },
  { path: '/en/tools/quadratic-equation', Component: calc('QuadraticSolver') },
  { path: '/en/tools/grade-average', Component: calc('GradeAverage') },
  { path: '/en/tools/bmi', Component: calc('BmiCalculator') },
  { path: '/en/tools/tip-calculator', Component: calc('TipCalculator') },
  { path: '/en/tools/vat', Component: calc('VatCalculator') },
  { path: '/en/tools/currency', Component: calc('CurrencyConverter') },
  // time and text
  { path: '/en/tools/hours-calculator', Component: timeText('HoursCalculator') },
  { path: '/en/tools/date-calculator', Component: timeText('DateCalculator') },
  { path: '/en/tools/world-clock', Component: timeText('WorldClock') },
  { path: '/en/tools/age-calculator', Component: timeText('AgeCalculator') },
  { path: '/en/tools/word-count', Component: timeText('WordCount') },
  // Hebrew tools
  { path: '/en/tools/add-niqqud', Component: hebrew('AddNiqqud') },
  { path: '/en/tools/keyboard-fix', Component: hebrew('KeyboardFix') },
  { path: '/en/tools/gematria', Component: hebrew('Gematria') },
  { path: '/en/tools/hebrew-birthday', Component: hebrew('HebrewBirthday') },
  // PDF and photos
  ...['merge', 'split', 'compress', 'images-to-pdf', 'pdf-to-images', 'sign', 'edit', 'to-word', 'from-word'].map(action => ({ path: `/en/tools/pdf/${action}`, Component: PdfAction, props: { action } })),
  { path: '/en/tools/image', Component: Image },
  ...['compress', 'crop', 'collage', 'blur', 'text', 'heic', 'remove-bg'].map(action => ({ path: `/en/tools/image/${action}`, Component: Image, props: { action } })),
]

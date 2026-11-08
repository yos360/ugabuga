// Paths of the English party-game area and their Hebrew counterparts. Pure data.
export const PARTY_ROOT_PATH = '/en/party-games'
export const partyGamePath = slug => `${PARTY_ROOT_PATH}/${slug}`
export const partyHubPath = key => `${PARTY_ROOT_PATH}/${key}`
export const partyAgePath = age => `${PARTY_ROOT_PATH}/age/${age}`

// English hub key -> Hebrew /games/<key>, with a short label for the chips.
export const HUB_KEYS = {
  '5-minutes': ['5-minutes', '5 minutes'],
  '10-minutes': ['10-minutes', '10 minutes'],
  '15-minutes': ['15-minutes', '15 minutes'],
  'after-school': ['afterschool', 'After school'],
  birthday: ['birthday', 'Birthday'],
  classroom: ['classroom', 'Classroom'],
  calm: ['calm', 'Calm down'],
  cooperative: ['cooperation', 'Cooperative'],
  creative: ['creative', 'Creative'],
  drawing: ['drawing', 'Drawing'],
  energy: ['energy', 'Burn energy'],
  family: ['family', 'Family'],
  'game-night': ['friends-evening', 'Game night'],
  icebreakers: ['icebreaker', 'Icebreakers'],
  improv: ['improvisation', 'Improv'],
  preschool: ['kindergarten', 'Preschool'],
  'large-group': ['large-group', 'Large groups'],
  active: ['movement', 'Active'],
  'no-equipment': ['no-equipment', 'No equipment'],
  'no-prep': ['no-prep', 'No prep'],
  quiet: ['quiet', 'Quiet'],
  trivia: ['trivia', 'Trivia'],
  'word-games': ['words', 'Word games'],
}
export const GRADE_KEYS = {
  'grade-1': ['kita-a', '1st grade'],
  'grade-2': ['kita-b', '2nd grade'],
  'grade-3': ['kita-g', '3rd grade'],
  'grade-4': ['kita-d', '4th grade'],
  'grade-5': ['kita-h', '5th grade'],
  'grade-6': ['kita-v', '6th grade'],
}
export const AGES = [4, 5, 6, 7, 8, 9, 10]
export const SHABBAT_PATH = `${PARTY_ROOT_PATH}/shabbat`

// "4-8", "8+" (no max) and "Ages 6-8" / "Ages 6+" for the [min, max] pairs in games.js.
export const range = ([a, b], unit = '') => (!b || a === b ? `${a}${b ? '' : '+'}` : `${a}-${b}`) + unit
export const ageText = ([a, b]) => (b && b < 99 ? `Ages ${a}-${b}` : `Ages ${a}+`)
export const fitsAge =(g, age) => g.ages[0] <= age && (!g.ages[1] || g.ages[1] >= age)

// Slugs of the other sections: [English slug, Hebrew slug].
export const CARD_SLUGS = [['war', 'milchama'], ['go-fish', 'dag'], ['yaniv', 'yaniv'], ['rummy', 'rami'], ['speed', 'speed'], ['donkey', 'chamor'], ['taki', 'taki'], ['crazy-eights', 'crazy-eights'], ['solitaire', 'solitaire'], ['concentration', 'zikaron'], ['quartets', 'reviot'], ['cheat', 'shakran'], ['spoons', 'kapiot'], ['slapjack', 'slapjack']]
export const DICE_SLUGS = ['pig', 'ship-captain-crew', 'going-to-boston', 'beetle', 'twenty-one', 'math-dice-race']
// Checkers and backgammon are not here: /board-games/checkers and /board-games/backgammon are already paired
// with /en/checkers and /en/backgammon (src/en/arcade).
export const BOARD_SLUGS = ['chess', 'connect-four', 'tic-tac-toe', 'reversi', 'mancala', 'dots-and-boxes', 'nim', 'snakes-and-ladders']
export const HUNT_SLUGS = [['home', 'home'], ['backyard', 'yard'], ['park', 'park'], ['classroom', 'classroom'], ['birthday', 'birthday'], ['preschool', 'kindergarten'], ['teens', 'teens'], ['hanukkah', 'hanukkah'], ['purim', 'purim'], ['passover', 'pesach'], ['summer', 'summer'], ['rainy-day', 'winter-rainy'], ['nature', 'outdoors-nature'], ['shabbat', 'shabbat-family']]

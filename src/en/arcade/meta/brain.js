// English page copy for the games of this group. Pure data (no imports of React or the games).
// Key = the Hebrew slug (/online-games/<slug>). Add a game here ONLY once its component is fully translated.
// { emoji, name, tagline, title, description (<=160 chars), how:[], tips:[], skills:[], faq?:[{q,a}] }
const COMMON_SKILLS = ['Logical deduction', 'Planning and testing guesses', 'Persistence and problem solving']
const COMMON_TIPS = ['Read the rules before your first move.', 'Stuck? A hint shows a legal step on the way to a solution.', 'You can go back to any level from the level map and try to earn three stars.']
export const BRAIN = {
  'matchsticks': {
    emoji: '🔥', name: 'Matchstick Puzzles',
    tagline: '200 levels · hints · stars · progress saved',
    title: 'Matchstick Puzzles - free brain game for kids',
    description: '200 matchstick puzzles: move or remove exactly 1-3 matches to fix an equation. Every puzzle is checked by a solver. An original Ugabuga game, free on any device.',
    how: ['Pick a digit in the equation to edit it.', 'To move: choose a match, then an empty place, even in another digit. To remove: tap a match.', 'Make exactly the number of moves asked for. The math signs never change.'],
    skills: COMMON_SKILLS, tips: COMMON_TIPS,
  },
  'water-jugs': {
    emoji: '💧', name: 'Water Jugs',
    tagline: '100 levels · hints · stars · progress saved',
    title: 'Water Jugs - free measuring puzzle game online',
    description: '100 measuring puzzles with water jugs: fill, empty and pour until you reach the exact amount. Every level has a verified shortest route, hints and stars.',
    how: ['Read the target amount and the size of each jug.', 'Fill or empty a jug, or choose a source and a target for pouring.', 'A pour stops when the source is empty or the target is full. The target amount can end up in any of the jugs.'],
    skills: COMMON_SKILLS, tips: COMMON_TIPS,
  },
  'river-crossing': {
    emoji: '🚣', name: 'River Crossing',
    tagline: '100 levels · hints · stars · progress saved',
    title: 'River Crossing - free logic puzzle game online',
    description: '100 river crossing puzzles with changing rules: who goes in the boat, who stays on the bank and which pairs need supervision? Every level is solvable and checked.',
    how: ['Read which pairs cannot be left alone without the adult.', 'Choose passengers on the bank where the boat is, then press cross.', 'The adult always rows, can return alone, and does not use up a passenger seat. Get everyone to the other bank.'],
    skills: COMMON_SKILLS, tips: COMMON_TIPS,
  },
  'cut-the-wire': {
    emoji: '✂️', name: 'Which Wire to Cut?',
    tagline: '150 levels · hints · stars · progress saved',
    title: 'Which Wire to Cut? - free logic puzzles online',
    description: '150 wire logic puzzles: work out the secret order from clues and choose the right wire. Every puzzle has a single answer, with no guessing or luck needed.',
    how: ['The wires are in a secret order. The numbers show places in that order.', 'Combine clues such as before, next to and not in a certain place.', 'Choose which wire is in the place you are asked about. Color, name and symbol identify each wire.'],
    skills: COMMON_SKILLS, tips: COMMON_TIPS,
  },
  'lights-out': {
    emoji: '💡', name: 'Lights Out',
    tagline: '220 levels · hints · stars · progress saved',
    title: 'Lights Out - free online puzzle game, 220 boards',
    description: '220 solvable Lights Out boards, from 3x3 to 6x6. Each press toggles a light and its neighbors. Think a few steps ahead and switch off the whole board.',
    how: ['A press toggles the light and its four neighbors above, below and to the sides.', 'Diagonals are not affected. Pressing again undoes the change.', 'The goal is to turn every light off. Fewer presses and fewer hints earn more stars.'],
    skills: COMMON_SKILLS, tips: COMMON_TIPS,
  },
  'one-move': {
    emoji: '☝️', name: 'Just One Move',
    tagline: '200 levels · hints · stars · progress saved',
    title: 'Just One Move - free brain challenges online',
    description: '200 challenges to solve with a single move: matches, water, lights and lasers. Think it through, then make one action. Every start position is different and pre-checked.',
    how: ['Read the goal of the puzzle. Every level has a different mechanic.', 'Plan one action that solves the whole puzzle.', 'If the move was not enough, start over and try another idea.'],
    skills: COMMON_SKILLS, tips: COMMON_TIPS,
  },
  'buga-iq': {
    emoji: '🧠', name: 'Buga IQ',
    tagline: '500 levels · hints · stars · progress saved',
    title: 'Buga IQ - 500 free brain challenges online',
    description: '500 brain challenges in ten worlds: matches, water, river, codes, scales, magic squares, frogs, lasers, who is lying and one move. Daily puzzle, test, clock and streak.',
    how: ['Pick a world and a level, or a game mode: daily, a 10-puzzle test, five minutes, or a streak until the first mistake.', 'The age level sets the starting point and the test difficulty. The daily puzzle is the same for everyone.', 'Each world has 50 puzzles and a boss challenge every ten. Solving efficiently with no hints earns three stars.', 'Stars and your current game are saved in the browser on this device.'],
    skills: COMMON_SKILLS, tips: COMMON_TIPS,
    faq: [{ q: 'Is the Buga score an IQ test?', a: 'No. The Buga score is a game score for fun and practice. It is not an IQ score and not a diagnosis.' }],
  },
}
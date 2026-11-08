// English twin of src/data/escapeAdventure.js: three difficulty levels. The room's own story steps open and
// close the adventure; between them come extra self-contained locks whose numbers change with each replay.

export const EN_ESCAPE_LEVELS = [
  { id: 'easy', label: 'Easy', detail: '6 stages · short sums and gentle hints', count: 6 },
  { id: 'medium', label: 'Medium', detail: '8 stages · multi-step sums and codes', count: 8 },
  { id: 'hard', label: 'Hard', detail: '10 stages · combined puzzles and logic', count: 10 },
]

// Rooms for ages 4–6 only get counting, colour and shape locks: no multiplication, no symbol algebra.
export const isYoungRoom = room => Boolean(room?.tags?.ages?.includes('4-6'))

function nudgeFor(step) {
  return /^\d+$/.test(String(step.answer).trim())
    ? 'This is a number lock. Read the story again: which numbers appear in it, and which operation fits them?'
    : 'The answer is a word. Read the story again slowly and look for the word or idea hiding in it.'
}

// Hints never solve the lock on the first click. On medium and hard a nudge comes first, and a last
// hint that simply states the answer is dropped.
export function hintsFor(step, rank) {
  let hints = (step.hints || []).filter(Boolean)
  if (!hints.length) return [nudgeFor(step)]
  if (rank === 0) return hints
  const answerRe = new RegExp(`(^|[^\\d])${String(step.answer).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\d]|$)`, 'i')
  if (hints.length >= 2 && answerRe.test(hints.at(-1))) hints = hints.slice(0, -1)
  return [nudgeFor(step), ...hints]
}

const puzzle = (title, story, question, answer, hints, visual, accept) => ({ title, story, question, answer: String(answer), hints, visual, accept })

function youngAdditions(room, rank, n) {
  const a = Math.min(n, 4) + rank // 2..6
  const b = 1 + (n % 3) // 1..3
  const stars = Math.min(a + 2, 9)
  const colours = [
    ['the grass', 'green', [], '🌿'],
    ['the sun in a drawing', 'yellow', [], '🌞'],
    ['a tomato', 'red', [], '🍅'],
    ['the sky on a sunny day', 'blue', ['light blue', 'sky blue'], '☁️'],
  ]
  const [thing, colour, colourAccept, colourEmoji] = colours[(n + rank) % colours.length]
  const shapes = [
    ['three corners', 'triangle', '🔺'],
    ['four corners and four equal sides', 'square', '🟥'],
    ['one smooth round line and no corners at all', 'circle', '⚪'],
  ]
  const [shapeClue, shape, shapeEmoji] = shapes[(n + rank) % shapes.length]
  return [
    puzzle('Counting the stars', `Stars are painted on the door of “${room.title}”. How many stars are there?`, 'How many stars are on the door?', stars,
      ['Point at each star and say a number out loud.', 'Start at 1 and keep going to the last star.'], '⭐'.repeat(stars)),
    puzzle('The colour lock', `This lock opens only when you say its colour. The lock is the colour of ${thing}.`, 'What colour is the lock?', colour,
      [`Think of ${thing}. What colour is it?`, colourEmoji], colourEmoji, colourAccept),
    puzzle('Keys in the baskets', `One basket has ${a} keys, and the other basket has ${b} more keys.`, 'How many keys are there altogether?', a + b,
      ['Count all the keys in the picture, one by one.', `Start at ${a} and count on ${b} more.`], `${'🔑'.repeat(a)}  ${'🔑'.repeat(b)}`),
    puzzle('The secret shape', `A shape is drawn on the box. The shape has ${shapeClue}.`, 'Which shape is on the box?', shape,
      ['Draw the shape in the air with your finger.', shapeEmoji], '🔺 🟥 ⚪', [`a ${shape}`]),
    puzzle('The balloons', `There are ${a + 1} balloons in the room. One balloon floats up and away!`, 'How many balloons are left?', a,
      ['Count the balloons in the picture.', 'One balloon flew away, so fold down one finger.'], '🎈'.repeat(a + 1) + ' → 🎈 gone'),
    puzzle('Bears in a row', 'Bears stand in a row: 🐻 big, 🧸 small, 🐻 big, 🧸 small, 🐻 big…', 'What comes next: big or small?', 'small',
      ['Say the row out loud: big, small, big…', 'After big always comes…'], '🐻 🧸 🐻 🧸 🐻 ?'),
  ]
}

function standardAdditions(room, rank, n) {
  const icon = room.emoji || '🔑'
  const drawers = n + rank + 2
  const perDrawer = rank + 2
  return [
    puzzle('The symbols on the lock', `On the way to the last clue of “${room.title}” you find another corridor of locks. Every ${icon} is worth ${n}. ${rank === 0 ? 'Add two symbols.' : rank === 1 ? 'Add three symbols, then add 4.' : 'Multiply two symbols together, then add one more symbol.'}`, 'Which number opens the lock?', rank === 0 ? n * 2 : rank === 1 ? n * 3 + 4 : n * n + n,
      rank === 0 ? ['Every symbol is a number. What is one symbol worth?', `Add: ${n} plus ${n}.`]
        : rank === 1 ? ['Every symbol is a number. Write the number in place of each symbol.', 'Add the three symbols first, and only then add 4.']
          : ['Every symbol is a number. Write the number in place of each symbol.', 'Remember: multiply before you add.'],
      rank === 0 ? `${icon} + ${icon} = ?` : rank === 1 ? `${icon} + ${icon} + ${icon} + 4 = ?` : `${icon} × ${icon} + ${icon} = ?`),
    puzzle('The number board', rank === 0 ? 'Each step to the right adds 2.' : rank === 1 ? 'Each step to the right doubles the number.' : 'Every jump in the sequence is bigger than the one before.', 'What is the next number in the sequence?', rank === 0 ? n + 8 : rank === 1 ? n * 16 : n + 24,
      rank === 0 ? ['Look at the last number in the sequence.', 'Add 2 to it.'] : rank === 1 ? ['Compare each number with the one before it.', 'Multiply the last number by 2.'] : ['Work out how much each jump adds: 3, then…', 'The jumps are 3, 5, 7, so the next jump is 9.'],
      (rank === 0 ? [n, n + 2, n + 4, n + 6] : rank === 1 ? [n, n * 2, n * 4, n * 8] : [n, n + 3, n + 8, n + 15]).join(' → ') + ' → ?'),
    rank === 0
      ? puzzle('The key cabinet', `The cabinet has ${drawers} drawers. Each drawer holds 2 keys.`, 'How many keys are in the cabinet?', drawers * 2,
        ['Count the keys in all the drawers.', 'Count in twos: 2, 4, 6…'], Array.from({ length: drawers }, () => '🔑🔑').join(' | '))
      : puzzle('The key cabinet', `The cabinet has ${drawers} drawers. Each drawer holds ${perDrawer} keys. You took out ${n} keys in total.`, 'How many keys are left in the cabinet?', drawers * perDrawer - n,
        ['First find how many keys were in the cabinet at the start.', 'Drawers times keys per drawer, then take away the keys you removed.'], `🗄️ ${drawers} × 🔑 ${perDrawer} − ${n}`),
    puzzle('The shape safe', `The safe’s key: circle = ${n}, triangle = ${n + 1}, square = ${n + 2}. ${rank === 2 ? 'The code is the SUM of the shape values, not the digits side by side.' : 'Type the shape values in a row from left to right, with no spaces.'}`, 'What is the safe code?', rank === 2 ? n * 3 + 3 : `${n + 2}${n}${n + 1}`,
      rank === 2 ? ['Find the value of each shape in the key.', 'Add the three values.'] : ['Find the value of each shape in the key.', 'Square first, then circle, then triangle.'], '■ ● ▲'),
    puzzle('The three cells', `There are three cells numbered 1, 2 and 3. The key is in only one of them. ${rank === 2 ? 'Exactly ONE statement is true: “The key is in cell 1”; “The key is not in cell 2”; “The key is not in cell 1”.' : 'The note says: the key is not in cell 1 and not in cell 3.'}`, 'Which cell holds the key?', 2,
      rank === 2 ? ['Suppose the key is in cell 1 and count how many statements are true.', 'Cells 1 and 3 both give two true statements, so only one cell is left.'] : ['Which cells does the note rule out?', 'Cross out the two cells the note mentions.'], '🗃️ 1     🗃️ 2     🗃️ 3'),
    puzzle('The backwards clock', `The clock shows ${n + 2}:00. Move it ${rank + 2} hours forward, then one hour back. Use a 12-hour clock.`, 'What time will it show? Write the hour only.', n + rank + 3,
      ['Follow the instructions in order.', `First ${rank + 2} hours forward, then back one hour.`], `🕒 ${n + 2}:00 → +${rank + 2} → −1`),
    rank === 0
      ? puzzle('The pass stamp', `The stamp shows the number ${n + 3}. Add 2, then take away 1. That is the pass code to the last clue in the story.`, 'What is the pass code?', n + 4,
        ['Start with the number on the stamp.', `${n + 3} plus 2, then minus 1.`], `${n + 3} + 2 − 1 = ?`)
      : puzzle('The pass stamp', `The stamp shows the number ${n + 3}. Multiply it by 3, add 6 and divide the result by 3. That is the pass code to the last clue in the story.`, 'What is the pass code?', n + 5,
        ['Do the operations in order, one after another.', 'You divide the WHOLE total by 3, not just the 6.'], `(${n + 3} × 3 + 6) ÷ 3 = ?`),
  ]
}

const ROUTE_NAMES = ['Warm-up route', 'Code-breaker route', 'Expert route']
const DURATIONS = ['15–25 minutes', '25–35 minutes', '35–45 minutes']

export function buildEnglishAdventure(room, levelId, seed = 0) {
  const level = EN_ESCAPE_LEVELS.find(l => l.id === levelId) || EN_ESCAPE_LEVELS[0]
  const rank = EN_ESCAPE_LEVELS.indexOf(level)
  const n = 2 + (Math.abs(seed) % 5)
  const additions = isYoungRoom(room) ? youngAdditions(room, rank, n) : standardAdditions(room, rank, n)
  const rotate = (items, by) => items.map((_, i) => items[(i + by) % items.length])
  const extra = rotate(additions, (rank * 2 + Math.abs(seed)) % additions.length).map(item => ({ ...item, title: `${ROUTE_NAMES[rank]} · ${item.title}`, extra: true }))
  const story = room.steps.map(step => ({ ...step, hints: hintsFor(step, rank) }))
  const extraCount = Math.max(0, level.count - story.length)
  return { ...room, difficulty: level.label, duration: DURATIONS[rank], steps: [...story.slice(0, -1), ...extra.slice(0, extraCount), story.at(-1)] }
}

// Answer matching: case, punctuation, a leading "a/an/the" and number words never decide a match.
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 }
function wordToNumber(text) {
  const i = NUMBER_WORDS.indexOf(text)
  if (i >= 0) return String(i)
  const [t, u] = text.split(' ')
  if (TENS[t] !== undefined && (!u || NUMBER_WORDS.indexOf(u) > 0 && NUMBER_WORDS.indexOf(u) < 10)) return String(TENS[t] + (u ? NUMBER_WORDS.indexOf(u) : 0))
  return null
}
export function normalizeAnswer(value) {
  const text = String(value).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[’'"`“”.,!?:;()]/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/^(a|an|the) /, '')
  return wordToNumber(text) ?? text
}
export const isCorrect = (step, value) => [step.answer, ...(step.accept || [])].map(normalizeAnswer).includes(normalizeAnswer(value))

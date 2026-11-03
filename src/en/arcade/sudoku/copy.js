// English copy for the /en/sudoku pages (pure data).
export const HUB = '/en/sudoku'

export const LEVELS = {
  easy: { name: 'Easy', long: 'Easy sudoku', stars: '★', path: '/en/sudoku/easy' },
  medium: { name: 'Medium', long: 'Medium sudoku', stars: '★★', path: '/en/sudoku/medium' },
  hard: { name: 'Hard', long: 'Hard sudoku', stars: '★★★', path: '/en/sudoku/hard' },
  'very-hard': { name: 'Very hard', long: 'Very hard sudoku', stars: '★★★★', path: '/en/sudoku/very-hard' },
  kids4: { name: 'Kids 4×4', long: 'Kids sudoku 4×4', stars: '🐣', path: '/en/sudoku/kids' },
  kids6: { name: 'Kids 6×6', long: 'Kids sudoku 6×6', stars: '🐥', path: '/en/sudoku/kids' },
}

export const TECHNIQUE_NAMES = {
  lockedCandidates: 'locked candidates', nakedPair: 'naked pair', hiddenPair: 'hidden pair',
  nakedTriple: 'naked triple', hiddenTriple: 'hidden triple', xWing: 'X-wing', swordfish: 'swordfish',
}

export const SPOKES = [
  { to: '/en/sudoku/easy', label: 'Easy sudoku', sub: 'For beginners - simple logic only', emoji: '🙂' },
  { to: '/en/sudoku/medium', label: 'Medium sudoku', sub: 'Fewer clues, more scanning', emoji: '🤔' },
  { to: '/en/sudoku/hard', label: 'Hard sudoku', sub: 'You will need notes and pairs', emoji: '😤' },
  { to: '/en/sudoku/very-hard', label: 'Very hard sudoku', sub: 'For champions only', emoji: '🔥' },
  { to: '/en/sudoku/kids', label: 'Kids sudoku', sub: '4×4 and 6×6 boards', emoji: '🧒' },
  { to: '/en/sudoku/daily', label: 'Daily sudoku', sub: 'One board for everyone, new every midnight', emoji: '📅' },
  { to: '/en/sudoku/solver', label: 'Sudoku solver', sub: 'Type in a board and get the solution', emoji: '🧮' },
]

export const HOW_TO = [
  'The board has 9 rows, 9 columns and 9 boxes of 3×3. Some cells are already filled in.',
  'Fill every empty cell with a number from 1 to 9.',
  'The only rule: each number appears exactly once in every row, every column and every bold box.',
  'No math and no guessing. Every board here has exactly one solution, and you can reach it with logic.',
]

export const STRATEGY = [
  { t: 'Scanning', d: 'Pick a number, say 5, and check each box for where it can still go. If only one cell is left, that is its place.' },
  { t: 'What is missing in a line', d: 'Start with a row, column or box that is missing only one or two numbers. Work out which number is missing and where it is allowed.' },
  { t: 'Notes (✏️)', d: 'On the harder levels, write the possible numbers in each cell. When you place a number, it is erased automatically from the notes of its row, column and box.' },
  { t: 'Pairs', d: 'If two cells in a row can only hold the same two numbers, those numbers belong to them. Remove them from the rest of the row.' },
  { t: 'Locked in a box', d: 'If a number can go only in one row inside a box, it cannot appear in that row in the other boxes.' },
  { t: 'Do not guess', d: 'If there is no safe move, look at another number or another area. A wrong guess early on only shows up many moves later.' },
]

export const LEVEL_PAGES = {
  easy: {
    keyword: 'easy sudoku',
    seoTitle: 'Easy sudoku for beginners - play online for free',
    h1: 'Easy sudoku for beginners',
    description: 'Easy sudoku for beginners: 9×9 boards with 36 or more clues, solved with simple logic and no guessing. Play free online, get a new board in one tap, or print.',
    intro: 'Easy sudoku is the right place to start. Every board has at least 36 clues, and the rest can be filled with two basic steps: find a cell that has only one possible number, or a number that has only one place left in a row, column or box. No notes and no guessing are needed.',
    tips: [
      'Start with the number that appears most often on the board. It has the fewest places left.',
      'Tap a number on the board and every copy of it lights up, so you can see which boxes still need it.',
      'Keep "Check mistakes" on at first. It is the fastest way to learn what does not work.',
      'When this gets too easy, move on to medium sudoku.',
    ],
    faq: [
      { q: 'What is the difference between easy and medium sudoku?', a: 'Both are solved with the same simple steps, but an easy board starts with 36 or more clues, so there are always a few obvious moves. A medium board has fewer clues and you search longer for the next move.' },
      { q: 'How long does an easy sudoku take?', a: 'Beginners usually need 10 to 20 minutes. Experienced players solve an easy board in under 5 minutes. The timer at the top keeps your personal best for every level.' },
      { q: 'Is easy sudoku good for kids?', a: 'Children from about third or fourth grade usually manage an easy 9×9 board. For younger children there are small 4×4 and 6×6 boards on the kids sudoku page.' },
    ],
    related: [{ label: 'Medium sudoku', href: '/en/sudoku/medium' }, { label: 'Kids sudoku', href: '/en/sudoku/kids' }, { label: 'the sudoku solver', href: '/en/sudoku/solver' }],
  },
  medium: {
    keyword: 'medium sudoku',
    seoTitle: 'Medium sudoku - free online, a new board every tap',
    h1: 'Medium sudoku',
    description: 'Medium sudoku online for free: 9×9 boards with 27 to 35 clues. Still no guessing, but you have to search. With notes, undo, a timer and a personal best.',
    intro: 'Medium sudoku sits between "this is easy" and "I need notes". The boards are solved with the same basic steps as easy sudoku, but they have only 27 to 35 clues, so the next move does not always jump out. You have to scan rows, columns and boxes systematically.',
    tips: [
      'Scan number by number, from 1 to 9, and check every box for each one.',
      'When you get stuck, switch from scanning by number to checking by cell: what is missing in its row, column and box?',
      'Notes (✏️) help here too, but try without them first.',
    ],
    faq: [
      { q: 'Do I need notes in medium sudoku?', a: 'You do not have to. Every medium board here is solved using only moves where one cell can take one number, or a number can go in one place. Notes just help you remember what you already checked.' },
      { q: 'How do I know it is time for hard sudoku?', a: 'When you solve a medium board with no mistakes in under 15 minutes. In hard sudoku there are moments with no simple move at all, and that is where pairs and locked candidates come in.' },
      { q: 'Will the board I got appear again?', a: 'Every board has a number. The same number always makes the same board, so you can share the link with a friend and race on the same puzzle.' },
    ],
    related: [{ label: 'Easy sudoku', href: '/en/sudoku/easy' }, { label: 'Hard sudoku', href: '/en/sudoku/hard' }, { label: 'the daily sudoku', href: '/en/sudoku/daily' }],
  },
  hard: {
    keyword: 'hard sudoku',
    seoTitle: 'Hard sudoku - play online for free',
    h1: 'Hard sudoku',
    description: 'Hard sudoku for free: 9×9 boards you cannot solve without notes. Pairs, locked candidates and X-wings, but no guessing. Play online with undo and a timer.',
    intro: 'Hard sudoku starts exactly where the simple steps run out. Every board here has at least one moment with no cell that has a certain number, so you have to write notes and use techniques such as naked pairs, hidden pairs or locked candidates. Even so, it is all solved with logic, with no guessing, and there is only one solution.',
    tips: [
      'Fill in full notes before you get stuck. Pairs and locked candidates then reveal themselves.',
      'Look for two cells in the same row, column or box with exactly the same two numbers. That is a pair: remove those numbers from the rest.',
      'In each box, check whether a number is limited to one row or one column. That is locked candidates, and it removes the number from the rest of the line.',
      'After every note you erase, go back and look for simple moves. Usually one is waiting.',
    ],
    faq: [
      { q: 'What makes a sudoku hard?', a: 'Not the number of empty cells, but the kind of thinking it needs. A board is marked hard here only if our solver, which works like a person, has to use note-based techniques: pairs, locked candidates, triples or X-wings.' },
      { q: 'Where can I get hard sudoku for free?', a: 'Right here. Every board is free, with no sign-up and no pop-up ads in the middle of a game. Every tap on "New sudoku" gives you a different board.' },
      { q: 'What is the difference between hard and very hard?', a: 'A hard sudoku can be solved entirely with logic, using the well-known techniques. In a very hard sudoku those are not enough, and at some point you must test a hypothesis ("if this is a 4, what happens?") until you reach a contradiction.' },
    ],
    related: [{ label: 'Very hard sudoku', href: '/en/sudoku/very-hard' }, { label: 'Medium sudoku', href: '/en/sudoku/medium' }, { label: 'the sudoku solver', href: '/en/sudoku/solver' }],
  },
  'very-hard': {
    keyword: 'very hard sudoku',
    seoTitle: 'Very hard sudoku - the big challenge, free online',
    h1: 'Very hard sudoku',
    description: 'Very hard sudoku for champions: boards that pairs, triples and X-wings cannot crack. Play free online with notes and undo.',
    intro: 'Very hard sudoku is the top level on the site. These boards were checked one by one: our logic solver knows every technique of hard sudoku and still gets stuck. To go on you need chains of deductions or a tested hypothesis that leads to a contradiction. Every board still has exactly one solution.',
    tips: [
      'Spend time on full, accurate notes. One small mistake in them shows up too late.',
      'Look for a cell with only two options and test where each leads. If one hits a contradiction, the other is right.',
      'Use the ↩️ Undo button to go back from a hypothesis that failed.',
      'Turn mistake checking off if you want the full challenge.',
    ],
    faq: [
      { q: 'Does very hard sudoku need guessing?', a: 'Not blind guessing, but testing a hypothesis: pick a cell with two options, place one and carry on with logic. If you reach a contradiction, the other option is correct. This is a legitimate part of the solution at this level.' },
      { q: 'Can a very hard sudoku have more than one solution?', a: 'No. Every board on the site is checked by a computer that makes sure it has exactly one solution, even at the hardest level.' },
      { q: 'How long does it take?', a: 'Even experienced players usually need half an hour to an hour. The timer stops when you pause or switch to another tab.' },
    ],
    related: [{ label: 'Hard sudoku', href: '/en/sudoku/hard' }, { label: 'the sudoku solver', href: '/en/sudoku/solver' }],
  },
}

export const KIDS_PAGE = {
  keyword: 'kids sudoku',
  seoTitle: 'Kids sudoku - 4×4 and 6×6 boards to play online',
  h1: 'Kids sudoku',
  description: 'Kids sudoku: small 4×4 and 6×6 boards solved with simple logic. Play online on a phone or computer, get a new board in one tap. Free.',
  intro: 'Kids sudoku starts with a small board. A 4×4 board has only the numbers 1 to 4 and four small boxes, which is enough to learn the rule: every number once in each row, column and box. When that feels easy, move on to a 6×6 board with 2×3 rectangles, and from there to an easy 9×9 sudoku.',
  tips: [
    'Start together: point to a row and count which numbers are already there and which are missing.',
    'On a 4×4 board, look for a row or box that is missing only one number.',
    'Keep "Check mistakes" on, so a mistake turns red right away and does not snowball.',
    'For children who do not know numbers yet, print a board and draw shapes or colors instead of numbers.',
  ],
  faq: [
    { q: 'What age can children start sudoku?', a: 'A 4×4 board suits ages 5 to 6, when a child knows the numbers 1 to 4 and understands rows and columns. A 6×6 board usually suits first and second grade, and an easy 9×9 sudoku from about third grade.' },
    { q: 'What does sudoku teach children?', a: 'Logical thinking and drawing conclusions, focus and patience, and familiarity with numbers, all without calculating. Children learn to test a guess, make mistakes and fix them.' },
    { q: 'Is it free?', a: 'Yes. Every board is free, with no sign-up and no ads inside the game.' },
  ],
  related: [{ label: 'Easy sudoku for beginners', href: '/en/sudoku/easy' }, { label: 'the daily sudoku', href: '/en/sudoku/daily' }, { label: 'all online games', href: '/en/online-games' }],
}

export const HUB_FAQ = [
  { q: 'What are the rules of sudoku?', a: 'Fill a 9×9 board with the numbers 1 to 9 so that each number appears exactly once in every row, every column and each of the nine 3×3 boxes. That is the only rule. There is nothing to add up or calculate.' },
  { q: 'Is the sudoku here really free?', a: 'Yes, everything is free with no sign-up: online sudoku, the daily sudoku and the sudoku solver.' },
  { q: 'How is the difficulty set?', a: 'Every board is checked by a computer solver that works like a person. Easy and medium are solved with simple steps only (easy has more clues). Hard needs note-based techniques such as pairs and locked candidates. Very hard needs testing hypotheses, because those techniques are not enough.' },
  { q: 'Does every sudoku have one solution?', a: 'Yes. The computer checks each board before it reaches you and makes sure it has exactly one solution, so you can always get there with logic.' },
  { q: 'Can I play sudoku on a phone?', a: 'Yes. The board is made for touch screens: tap a cell, then a number from the row below. On a computer you can type numbers, move with the arrow keys, press N for notes and Ctrl+Z to undo.' },
]

export const DAILY_FAQ = [
  { q: 'When does the daily sudoku change?', a: 'Every day at midnight, Israel time. Everyone who plays that day gets exactly the same board, so you can race friends and family to see who solves it faster.' },
  { q: 'Are there daily sudokus at different levels?', a: 'Yes. The default is medium, and you can also choose easy, hard and very hard. Every level has its own daily board.' },
  { q: 'I solved it. What now?', a: 'Share your time on WhatsApp, try the daily board at another level, or head to the level pages and solve as many boards as you like.' },
]

export const SOLVER_FAQ = [
  { q: 'How do I use the sudoku solver?', a: 'Type the numbers from your board into the cells (leave an empty cell empty) and press "Solve". You can also paste the whole board as a line of 81 characters, with 0 or a dot for an empty cell.' },
  { q: 'What happens if the board has no solution?', a: 'The solver says there is no solution. If a number repeats in the same row, column or box, it is marked in red, and it is usually a typing mistake.' },
  { q: 'Why does it say there is more than one solution?', a: 'A valid sudoku has exactly one solution. If numbers are missing from the board (or were typed wrong), there are several ways to fill it. The solver shows one of them and explains that it is not the only one.' },
  { q: 'Can I get just a hint instead of the whole solution?', a: '"One cell" reveals a single correct number, so you can carry on by yourself.' },
]

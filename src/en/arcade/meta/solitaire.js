// English page copy for the games of this group. Pure data (no imports of React or the games).
// Key = the Hebrew slug (/online-games/<slug>). Add a game here ONLY once its component is fully translated.
// { emoji, name, tagline, title, description (<=160 chars), how:[], tips:[], skills:[], faq?:[{q,a}] }
export const SOLITAIRE = {
  solitaire: {
    emoji: '🃏',
    name: 'Solitaire',
    tagline: 'The classic card game for one: arrange all the cards from ace to king',
    title: 'Solitaire - free classic Klondike card game online',
    description: 'Classic Klondike Solitaire: build four suit piles from ace to king. One tap sends a card to its best spot, or drag it. Undo, hints and auto-finish. Free, no sign-up.',
    how: [
      'The goal: move every card to the four piles at the top, one suit per pile, from ace (A) up to king (K).',
      'In the seven columns, arrange cards in descending order with alternating colors: a black 7 on a red 8, a red 6 on a black 7...',
      'Tap a card and it jumps to the best place for it. You can also drag it wherever you like.',
      'Tap the deck to turn over a new card. Out of cards? Tap ↻ to bring the deck back.',
      'Only a king (K) can go into an empty column. Once every card is face up, the game can finish itself.',
    ],
    skills: ['Order and counting backwards', 'Recognizing colors and suits', 'Planning and patience'],
    tips: [
      'Uncover the face-down cards in the columns first. The important cards hide there.',
      'Do not rush to empty a column if you have no king to put in it.',
      'Stuck? 💡 shows a useful move, and ↩ undoes mistakes.',
    ],
  },
  'spider-solitaire': {
    emoji: '🕷️',
    name: 'Spider Solitaire',
    tagline: 'Build runs from king down to ace, with one suit, two or four',
    title: 'Spider Solitaire - free online card game, 1, 2 or 4 suits',
    description: 'Spider Solitaire in three levels: one suit for beginners, then two and four. Build a full run from king to ace and it flies off the table. Hints and undo. Free.',
    how: [
      'There are 10 columns on the table. You can place any card on a card one higher (a 5 on a 6, a queen on a king).',
      'You can move several cards together only if they form an ordered run of the same suit.',
      'A full run of one suit, from king (K) to ace (A), flies off the table.',
      'No moves left? Tap the deck at the top to deal a new card to every column (only when no column is empty).',
      'Clear 8 runs and you win! Start at the Easy level and work your way up.',
    ],
    skills: ['Descending order and counting', 'Planning several steps ahead', 'Perseverance'],
    tips: [
      'Place a card on one of the same suit when you can, so the run can move together.',
      'An empty column is a treasure. Save it for the right moment.',
      'Before dealing a new row, try to uncover as many face-down cards as you can.',
    ],
    faq: [
      { q: 'What is the difference between the levels?', a: 'On the easy level every card is the same suit. The medium level has two suits, and the hard level uses all four. You can only move a run when it is built from a single suit.' },
      { q: 'When can I deal a new row?', a: 'Only when every one of the ten columns has at least one card. Each deal adds one face-up card to every column.' },
      { q: 'Is my game saved?', a: 'Yes. The current game, the difficulty level and your undo moves are saved in this browser, so you can carry on after refreshing.' },
      { q: 'How does the hint work?', a: 'The hint prefers a move that uncovers a face-down card, then joining cards of the same suit and clearing a column. If there is no useful move, it suggests dealing a row.' },
    ],
  },
  freecell: {
    emoji: '🂡',
    name: 'FreeCell',
    tagline: 'Arrange all 52 cards with the help of four free cells',
    title: 'FreeCell - free online card game, numbered deals',
    description: 'Full FreeCell with 52 cards, eight columns, four free cells and four foundations. Numbered deals, legal run dragging, hints, undo, auto-finish and saved games.',
    how: [
      'The goal is to move every card to the four foundations, each suit from ace up to king.',
      'In the eight columns, build descending runs in alternating colors: red on black and black on red.',
      'The four free cells each hold one card and help you clear the way.',
      'You can move an ordered run only when there are enough free cells and empty columns to carry it.',
      'Type a deal number to play exactly the same game again.',
    ],
    skills: ['Planning several moves ahead', 'Order and alternating colors', 'Problem solving'],
    tips: [
      'Try to keep at least one free cell open.',
      'Send aces and low cards to the foundations early.',
      'An empty column greatly increases how many cards you can move together.',
    ],
    faq: [
      { q: 'What is the difference between FreeCell and Solitaire?', a: 'In FreeCell every card is face up from the start and there is no draw pile. You use four free cells to organize the board and uncover moves.' },
      { q: 'How many cards can I move together?', a: 'It depends on the free cells and empty columns. The game works out the exact limit for each target and does not allow a move that could not be made one card at a time.' },
      { q: 'What is a numbered deal?', a: 'Each number always produces the same deal. You can share a number with friends and try to solve the same board.' },
      { q: 'Is my game saved?', a: 'Yes. The board, the time and your moves are saved in the browser, so you can continue after reloading the page.' },
    ],
  },
}

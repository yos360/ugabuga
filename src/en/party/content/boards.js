// Classic board games (English): rules, FAQ and SEO text for rules + printable rules pages.
// Checkers and backgammon are not here: they already have English pages.

export const BOARD_HUB = {
  title: 'Classic Board Games for Kids: Rules and Printable Guides',
  description: 'Easy rules for classic board games: chess, connect four, tic-tac-toe, reversi, mancala, dots and boxes, nim and snakes and ladders. Free to read and print.',
  h1: 'Classic board games: rules for kids',
  intro: [
    'Games everyone knows, explained simply. Each page covers what you need, how to set up, how a turn works and how to win, with a printable rules sheet for the table.',
    'Classic board games teach kids to think ahead, plan and lose gracefully, and they get passed down from generation to generation. Most need nothing more than a board, a few pieces, or even just paper and a pencil.',
  ],
  faq: [
    { q: 'Can I print the rules?', a: 'Yes. Every game page has a print button that gives you a clean one-page rules sheet to keep with the game box.' },
    { q: 'Which board game is best for young kids?', a: 'Tic-tac-toe and snakes and ladders work from about age 4. Connect four and dots and boxes are great next steps, and chess, reversi and mancala suit ages 6 to 7 and up.' },
    { q: 'Do I have to sign up or pay?', a: 'No. Everything is free, with no sign-up and nothing to download.' },
  ],
}

export const BOARD_GAMES_EN = [
  {
    slug: 'chess', he: 'chess', name: 'Chess', emoji: '♟️', tagline: 'The king of games, learned one piece at a time',
    players: '2 players', ages: '6+', time: '20-60 minutes',
    title: 'Chess Rules for Kids: How Every Piece Moves, Printable Rules',
    description: 'Chess rules for kids and beginners: how each piece moves, check, checkmate, stalemate, castling, promotion and en passant. Free printable rules sheet.',
    intro: 'Chess is an ancient thinking game that builds focus, planning and patience. Here you will find how every piece moves, how to set up the board and how to win, explained in plain words and ready to print.',
    rules: [
      { h: 'What you need', p: ['An 8x8 board and 16 pieces for each player: a king, a queen, 2 rooks, 2 bishops, 2 knights and 8 pawns.'] },
      { h: 'Setting up the board', p: ['Place the board so each player has a light square in the bottom right corner.', 'On the back row: rook, knight, bishop, queen, king, bishop, knight, rook. The queen starts on her own color (the white queen on a light square). The 8 pawns go on the row in front.'] },
      { h: 'Who goes first', p: ['White moves first, then players take turns, moving one piece per turn.'] },
      { h: 'How each piece moves', p: ['King: one square in any direction.', 'Queen: any number of squares in a straight line or diagonally.', 'Rook: any number of squares in a straight line (up, down, left or right).', 'Bishop: any number of squares diagonally.', 'Knight: jumps in an L shape, two squares one way and one square to the side. The knight is the only piece that can jump over others.', 'Pawn: one square forward (two on its very first move), and captures one square diagonally forward.'] },
      { h: 'Capturing', p: ['Move onto a square with an opponent\'s piece and that piece is removed from the board. You can never land on one of your own pieces.'] },
      { h: 'Check, checkmate and stalemate', p: ['"Check" means the king is under attack. You must get out of check right away: move the king, block the attack or capture the attacker. You may never make a move that leaves your own king in check.', '"Checkmate" is a check with no way out. Whoever delivers checkmate wins.', '"Stalemate" happens when the player to move has no legal move but is not in check. The game is a draw.'] },
      { h: 'Special moves', p: ['Castling: if the king and a rook have not moved yet, the squares between them are empty, and the king is not in check and does not pass through or land on an attacked square, the king moves two squares toward the rook and the rook hops to the king\'s other side.', 'Promotion: a pawn that reaches the far row becomes a queen, rook, bishop or knight (almost always a queen).', 'En passant: if an opponent\'s pawn moves two squares and lands right beside your pawn, you may capture it diagonally as if it had moved only one square. You can do this only on the very next turn.'] },
    ],
    faq: [
      { q: 'What age can kids learn chess?', a: 'Many kids learn how the pieces move by age 5 or 6. Start with one piece at a time and play mini games with just pawns before moving on to a full game.' },
      { q: 'What is the difference between checkmate and stalemate?', a: 'In checkmate the king is in check with no escape, and that is a win. In stalemate the king is not in check, but the player has no legal move, and that is a draw.' },
      { q: 'What is castling?', a: 'A special move where the king moves two squares toward a rook and the rook jumps to the king\'s other side. It is allowed only if neither piece has moved, the squares between them are empty, and the king is not in check and does not pass through or land on an attacked square.' },
    ],
    play: { href: '/en/chess', label: 'Play chess online' },
  },
  {
    slug: 'connect-four', he: 'connect-four', name: 'Connect Four', emoji: '🔴', tagline: 'Drop your discs and line up four in a row',
    players: '2 players', ages: '5+', time: '5-10 minutes',
    title: 'Connect Four Rules for Kids: How to Play, Printable Rules',
    description: 'Connect four rules for kids: drop discs into the grid and get four in a row across, up and down or diagonally. Winning tips and a printable rules sheet.',
    intro: 'A fast, addictive game: take turns dropping discs into an upright grid and try to line up four in a row before your opponent does.',
    rules: [
      { h: 'What you need', p: ['An upright grid with 7 columns and 6 rows, and 21 discs for each player in two colors.'] },
      { h: 'How to play', p: ['Players take turns dropping one disc into any column. The disc falls to the lowest empty space in that column.'] },
      { h: 'How to win', p: ['The first player to line up four discs of their color in a row, across, up and down or diagonally, wins.', 'If the grid fills up with no four in a row, the game is a draw.'] },
      { h: 'Tips for winning', p: ['Start in the middle column: it is part of the most possible lines of four.', 'Before every move, check whether your opponent has three in a row that you need to block.', 'Try to build two threats at once. Your opponent can only block one of them.'] },
    ],
    faq: [
      { q: 'Which column is best to start in?', a: 'The middle column. More lines of four pass through it than through any other column.' },
      { q: 'Does the first player always win?', a: 'With perfect play from both sides, the first player can force a win. In real games, though, that is very hard to pull off, which is why the game stays fun at any age.' },
    ],
    play: { href: '/en/online-games/four-in-a-row', label: 'Play four in a row online' },
  },
  {
    slug: 'tic-tac-toe', he: 'tic-tac-toe', name: 'Tic-Tac-Toe', emoji: '❌', tagline: 'Every kid\'s first game: three in a row',
    players: '2 players', ages: '4+', time: '1-3 minutes',
    title: 'Tic-Tac-Toe Rules and Strategy for Kids, Printable Rules',
    description: 'Tic-tac-toe rules for kids: take turns placing X and O and get three in a row to win. Simple strategy tips and a printable rules sheet for paper games.',
    intro: 'Tic-tac-toe is a quick classic for two: the first player to get three marks in a row wins. All you need is paper and a pencil.',
    rules: [
      { h: 'What you need', p: ['A 3x3 grid, which you can draw on any piece of paper. One player is X and the other is O.'] },
      { h: 'How to play', p: ['Players take turns writing their mark in an empty square. X usually goes first.'] },
      { h: 'How to win', p: ['The first player to get three marks in a row, across, down or diagonally, wins. If all nine squares fill up with no row of three, it is a draw (often called a "cat\'s game").'] },
      { h: 'Simple strategy', p: ['Take the center if it is free. If not, grab a corner.', 'If you have two in a row, finish the line. If your opponent has two in a row, block them.', 'Look for a move that makes two lines of two at once, so your opponent can\'t block both.'] },
    ],
    faq: [
      { q: 'Can you always win at tic-tac-toe?', a: 'No. When both players make no mistakes, every game ends in a draw. You win only when your opponent slips up.' },
      { q: 'What is the best first move?', a: 'The center or a corner. Both give you the most ways to make three in a row.' },
    ],
    play: { href: '/en/online-games/tic-tac-toe', label: 'Play tic-tac-toe online' },
  },
  {
    slug: 'reversi', he: 'reversi', name: 'Reversi', emoji: '⚫', tagline: 'Flip your opponent\'s discs to your color',
    players: '2 players', ages: '7+', time: '15-25 minutes',
    title: 'Reversi (Othello) Rules for Kids: How to Play, Printable Rules',
    description: 'Reversi rules for kids: trap your opponent\'s discs between yours and flip them to your color. Setup, turns, how to win, strategy tips and printable rules.',
    intro: 'Reversi is a strategy game on an 8x8 board: place a disc, trap your opponent\'s discs, and watch them flip over to your color.',
    rules: [
      { h: 'What you need', p: ['An 8x8 board and 64 discs that are black on one side and white on the other.'] },
      { h: 'Setting up', p: ['Place 4 discs in the middle of the board: two white and two black, set diagonally. Black moves first.'] },
      { h: 'How to play', p: ['Place a disc so that a straight or diagonal line of your opponent\'s discs is trapped between your new disc and another one of yours. All the trapped discs flip over to your color.', 'You may only place a disc where it flips at least one of your opponent\'s discs. If you have no such move, you pass your turn.'] },
      { h: 'How to win', p: ['When neither player can move, count the discs. The player with more discs showing their color wins.'] },
    ],
    faq: [
      { q: 'What is the difference between reversi and Othello?', a: 'Othello is a brand name for a modern version of reversi with almost identical rules. We use the general name, reversi.' },
      { q: 'What is the strongest spot on the board?', a: 'The corners. A disc in a corner can never be flipped.' },
    ],
    play: null,
  },
  {
    slug: 'mancala', he: 'mancala', name: 'Mancala', emoji: '🟤', tagline: 'Sow stones in the pits and collect them in your store',
    players: '2 players', ages: '6+', time: '10-15 minutes',
    title: 'Mancala Rules for Kids: How to Play, Printable Rules',
    description: 'Mancala rules for kids (Kalah version): sow stones around the board, earn extra turns and capture your opponent\'s stones. Clear steps and printable rules.',
    intro: 'Mancala is one of the oldest board games in the world, from the family of "sowing games." These are the most common rules, known as Kalah.',
    rules: [
      { h: 'What you need', p: ['A board with 6 small pits on each side and a large store at each end, plus 48 small stones (4 in each pit to start). No board? An egg carton and two bowls work great.'] },
      { h: 'Sowing', p: ['On your turn, pick one of the pits on your side, scoop up all its stones and drop them one by one into the following pits, counterclockwise. Drop one in your own store as you pass it, but skip your opponent\'s store.'] },
      { h: 'Extra turns and captures', p: ['If your last stone lands in your own store, you get another turn.', 'If your last stone lands in an empty pit on your side, and the pit directly across has stones in it, you capture all of them, plus your own stone, and put them in your store.'] },
      { h: 'End of the game', p: ['When all the pits on one side are empty, each player moves the stones left on their own side into their store. The player with more stones wins.'] },
    ],
    faq: [
      { q: 'Where does mancala come from?', a: 'Sowing games have been played for hundreds of years across Africa and the Middle East, in many versions. Kalah, the version here, is one of the most popular in the West.' },
      { q: 'Can I make my own mancala board?', a: 'Yes. Use an egg carton for the 12 pits and two small bowls for the stores, with beans, buttons or pebbles as stones.' },
    ],
    play: null,
  },
  {
    slug: 'dots-and-boxes', he: 'dots-and-boxes', name: 'Dots and Boxes', emoji: '⬜', tagline: 'Draw lines and close the boxes',
    players: '2 players', ages: '6+', time: '5-15 minutes',
    title: 'Dots and Boxes Rules for Kids: How to Play on Paper',
    description: 'Dots and boxes rules for kids: draw a line between two dots, complete a box and take another turn. Simple paper and pencil game with a printable rules sheet.',
    intro: 'A classic pencil and paper game: players take turns drawing a line between two dots, and whoever closes a box claims it.',
    rules: [
      { h: 'What you need', p: ['A sheet of paper with a grid of dots (for example 4x4 dots) and pens in two colors.'] },
      { h: 'How to play', p: ['Players take turns drawing one line between two neighboring dots, across or up and down.', 'Whoever draws the fourth side of a box closes it, writes their initial inside, and takes another turn.'] },
      { h: 'How to win', p: ['When every box is closed, the player who closed the most boxes wins.'] },
    ],
    faq: [
      { q: 'What is the most important tip?', a: 'Avoid drawing the third side of a box, because your opponent will simply close it. Whoever can avoid that the longest usually wins.' },
      { q: 'What size grid should we use?', a: 'A 4x4 grid of dots is quick and good for beginners. Older kids can play on 6x6 or larger for a longer, trickier game.' },
    ],
    play: null,
  },
  {
    slug: 'nim', he: 'nim', name: 'Nim', emoji: '🥢', tagline: 'A math game with matchsticks: who takes the last one?',
    players: '2 players', ages: '7+', time: '3-5 minutes',
    title: 'Nim Rules for Kids: The Matchstick Math Game, Printable Rules',
    description: 'Nim rules for kids: take sticks from one row at a time, and whoever takes the last one wins. Includes the misere version and the math secret to winning.',
    intro: 'Nim is an ancient and simple math game: a few piles of sticks, and on each turn you take from one pile. It hides a mathematical secret you can learn.',
    rules: [
      { h: 'What you need', p: ['A few piles or rows of matchsticks, toothpicks, coins or pebbles, for example rows of 1, 3, 5 and 7.'] },
      { h: 'How to play', p: ['Players take turns choosing one row and taking as many items from it as they like: at least one, and up to the whole row.'] },
      { h: 'How to win', p: ['Whoever takes the very last item wins. In the reverse version, called misere, whoever takes the last item loses.'] },
    ],
    faq: [
      { q: 'Is there a sure way to win at nim?', a: 'Yes. Write the size of each row in binary and combine them with XOR (add each column of digits without carrying). If the result is zero after your turn, you are on track to win. It is one of the most famous results in game theory.' },
      { q: 'What can kids learn from nim?', a: 'Counting, planning ahead and spotting patterns. Older kids can use it as a fun first taste of binary numbers.' },
    ],
    play: null,
  },
  {
    slug: 'snakes-and-ladders', he: 'snakes-and-ladders', name: 'Snakes and Ladders', emoji: '🐍', tagline: 'Roll the die, climb the ladders, slide down the snakes',
    players: '2-4 players', ages: '4+', time: '15-20 minutes',
    title: 'Snakes and Ladders Rules for Kids: How to Play, Printable Rules',
    description: 'Snakes and ladders rules for kids: roll the die, climb the ladders, slide down the snakes and race to square 100. Easy rules for ages 4 and up, ready to print.',
    intro: 'Snakes and ladders (also called chutes and ladders) is an ancient dice game that even preschoolers can play: roll, count, climb and slide, all the way to square 100.',
    rules: [
      { h: 'What you need', p: ['A board with 100 squares plus snakes and ladders, one die, and a game piece for each player.'] },
      { h: 'How to play', p: ['Everyone starts off the board. Take turns rolling the die and moving forward that many squares.', 'Land at the bottom of a ladder and you climb up it. Land on a snake\'s head and you slide down to its tail.', 'Roll a 6 and you get another turn (a common house rule you can skip).'] },
      { h: 'How to win', p: ['The first player to land exactly on square 100 wins. If your roll is too high, move up to 100 and count back the rest.'] },
    ],
    faq: [
      { q: 'What do kids learn from snakes and ladders?', a: 'Counting, recognizing numbers up to 100, waiting their turn, and handling a loss, since everything depends on the roll of the die.' },
      { q: 'Do you need to land exactly on 100?', a: 'In the classic rules, yes: an overshoot bounces you back. For very young players you can drop that rule and let any roll that reaches 100 win.' },
    ],
    play: null,
  },
]

// English card-game rules for /en card games hub and pages.
// Adapted from src/data/cardGames.js (he = Hebrew slug).

export const CARD_HUB = {
  title: 'Card Games for Kids and Families: Rules for 14 Classic Games',
  description: "Easy rules for 14 family card games: War, Go Fish, Rummy, Speed, Old Maid, Crazy Eights, Spoons and more. Players, ages, time and how to win.",
  h1: 'Card Games for Kids and Families: The Rules',
  intro: [
    "One deck, endless games. Card games are one of the simplest ways to spend time together: the same deck covers easy games for four-year-olds and real strategy games for grown-ups. Along the way kids practice counting, remembering, waiting their turn and losing gracefully, all around one table.",
    "Every game here lists how many players you need, the starting age, how long a round takes and the rules step by step, plus tips and variations. Most of them need nothing more than a standard 52-card deck.",
  ],
  faq: [
    {
      q: 'Which card games are best for young children?',
      a: "For ages 4 to 6, try War, Concentration, Go Fish and Donkey (Old Maid). The rules are simple, nobody needs to read, and kids practice recognizing numbers and remembering where things are. You can start with part of the deck and add cards as they get the hang of it.",
    },
    {
      q: 'What do I need to play?',
      a: "For most of these games a standard 52-card deck is enough. Yaniv adds two jokers, Spoons needs a few spoons, and Taki and Quartets are usually played with their own special decks (Quartets also works with a normal deck).",
    },
    {
      q: 'Is it OK to change the rules?',
      a: "Absolutely. Card games travel from family to family and every home has its own version. Just agree on the rules before you start so nobody argues halfway through.",
    },
    {
      q: 'How can I help a child who gets upset about losing?',
      a: "Pick short games, play several rounds in a row, and praise good moves rather than only wins. Solitaire and solo Concentration also let kids compete against themselves, so nobody loses.",
    },
  ],
}

export const CARD_GAMES_EN = [
  {
    slug: 'war', he: 'milchama', name: 'War', emoji: '⚔️', players: '2', ages: '4+',
    deck: 'A standard 52-card deck', time: '15-30 minutes',
    title: 'War Card Game Rules for Kids: How to Play War',
    description: "How to play War, the easiest card game for kids: flip, compare, and the high card wins. Setup, what happens in a tie, tips and fun variations.",
    intro: "War is the first card game many kids ever learn. There are no decisions to make, just flip and compare, which makes it perfect for little ones who are learning which numbers are bigger.",
    goal: 'Win every card in the deck.',
    setup: [
      'Shuffle and deal out the whole deck between the two players.',
      'Each player keeps their pile face down without looking at the cards.',
    ],
    play: [
      'Both players flip the top card of their pile at the same time.',
      'The higher card wins, and its owner puts both cards at the bottom of their pile.',
      'Cards rank from low to high: 2 through 10, Jack, Queen, King, Ace (Ace is highest).',
      "If the two cards match, it's War! Each player lays three cards face down and one more face up.",
      'The higher face-up card wins every card on the table. If it ties again, go to War again.',
      'A player who runs out of cards in the middle of a War loses that War.',
    ],
    win: "Whoever collects all the cards wins. Games can run long, so you can also set a timer and see who holds the most cards when it rings.",
    tips: [
      'Great for young kids learning to compare numbers. You can take out the Jacks, Queens and Kings at first.',
      'Agree on a time limit before you start, because a full game can go on for a long time.',
    ],
    variants: [
      'Three-player War: deal to three players, and the highest of the three cards takes them all.',
      'Addition War: each player flips two cards and adds them up. The bigger total wins.',
    ],
    faq: [
      { q: 'What age can kids play War?', a: "From about age 4. Kids only need to tell which number is bigger, and you can remove the face cards to keep it simple." },
      { q: 'How long does a game of War take?', a: "Anywhere from 15 minutes to well over an hour. Setting a timer and counting cards at the end keeps it short." },
      { q: 'Is the Ace high or low in War?', a: 'Ace is the highest card in War, above the King.' },
    ],
  },
  {
    slug: 'go-fish', he: 'dag', name: 'Go Fish', emoji: '🐟', players: '2-5', ages: '5+',
    deck: 'A standard 52-card deck', time: 'About 15 minutes',
    title: 'Go Fish Rules for Kids: How to Play the Classic Card Game',
    description: "How to play Go Fish with a regular deck: ask for cards, go fishing, and collect sets of four. Easy rules for kids, plus tips and a simpler pairs version.",
    intro: "Go Fish is a gentle, chatty game where kids ask each other for cards. It's a lovely way to practice numbers, memory and taking turns.",
    goal: 'Collect as many sets of four matching cards (four of the same number) as you can.',
    setup: [
      'Shuffle and deal 7 cards each for two or three players, or 5 cards each for four or more.',
      "Spread the rest of the cards face down in the middle of the table. That's the pond.",
    ],
    play: [
      "On your turn, ask one player for a number you already hold at least one of, for example: 'Do you have any sevens?'",
      'If they have any cards of that number, they hand them all over and you ask again.',
      "If they don't, they say 'Go fish!' and you take one card from the pond.",
      'If you fish up exactly the number you asked for, show it and take another turn. Otherwise the turn passes on.',
      'Lay every set of four you complete face up in front of you.',
      "If you run out of cards, take one from the pond. If the pond is empty, you're out of the game.",
    ],
    win: 'Once all 13 sets are on the table, the player with the most sets wins.',
    tips: [
      "Listen to what other players ask for. It tells you what's in their hands.",
      'With little kids, play for pairs instead of sets of four so the game moves faster.',
    ],
    variants: [
      'Pairs Go Fish: collect matching pairs instead of sets of four.',
    ],
    faq: [
      { q: 'How many cards do you deal in Go Fish?', a: 'Seven cards each for two or three players, and five each for four or more players.' },
      { q: 'What happens when you run out of cards in Go Fish?', a: "Take a card from the pond and keep playing. If the pond is empty too, you're out and wait for the others to finish." },
    ],
  },
  {
    slug: 'yaniv', he: 'yaniv', name: 'Yaniv', emoji: '🃏', players: '2-5', ages: '8+',
    deck: 'A standard 52-card deck plus 2 jokers', time: 'About 30 minutes',
    title: "Yaniv Card Game Rules: How to Play Israel's Favorite Card Game",
    description: "How to play Yaniv, the Israeli card game: card values, legal discards, calling Yaniv, the Assaf penalty and scoring. Clear rules with tips and variations.",
    intro: "Yaniv is the card game you'll find on every Israeli beach, army base and backpacker hostel. The idea is simple: get the total of your hand as low as possible, then call 'Yaniv!' at just the right moment.",
    goal: "Lower the total value of your hand and call 'Yaniv' at the right time, without piling up too many points over the game.",
    setup: [
      'Deal 5 cards to each player.',
      'Turn one card face up to start the discard pile. The rest of the deck is the draw pile.',
      'Card values: Ace is 1, 2 to 10 are worth their number, Jack, Queen and King are 10, and a joker is 0.',
    ],
    play: [
      'On your turn, discard one card or a legal combination: several cards of the same number, or a run of three or more cards in the same suit.',
      'After discarding, take one card, either from the draw pile or from the cards the previous player just discarded (from a run you may only take the first or last card).',
      'A joker can fill in for any card in a run.',
      "When your hand adds up to 7 or less, you can call 'Yaniv!' at the start of your turn instead of playing.",
      'Everyone shows their hand. If the caller has the lowest total, they score 0 and everyone else scores the total of their own hand.',
      "If anyone has an equal or lower total, it's an 'Assaf': the caller gets a 30-point penalty plus their own hand total, and the player who called Assaf scores 0.",
    ],
    win: 'A player who reaches 200 points (or whatever limit you agree on) is out. The last player left wins.',
    tips: [
      'Pick up low cards or cards that complete a pair from the discard pile. It brings your total down fast.',
      "Keep an eye on how many cards your opponents hold. A player with just one card is a real Assaf threat.",
    ],
    variants: [
      'Round-number bonus: a player who lands exactly on 100 points drops to 50 (some families knock off 50 points at every multiple of 50).',
      'Quick Yaniv: you can call from a total of 5 or less, and the game ends at 100 points.',
    ],
    faq: [
      { q: 'When can you call Yaniv?', a: 'At the start of your turn, when the cards in your hand add up to 7 or less.' },
      { q: 'What is an Assaf in Yaniv?', a: "When someone calls Yaniv but another player has an equal or lower total. The caller takes a 30-point penalty plus their hand, and the other player scores 0." },
      { q: 'How much is a joker worth in Yaniv?', a: 'A joker is worth 0 points, and it can also stand in for any card in a run.' },
    ],
  },
  {
    slug: 'rummy', he: 'rami', name: 'Rummy', emoji: '🂡', players: '2-4', ages: '8+',
    deck: 'A standard 52-card deck', time: '20-30 minutes',
    title: 'Rummy Rules for Families: How to Play Rummy with a Normal Deck',
    description: "How to play Rummy with a standard deck: draw, lay down sets and runs, add to other players' melds and discard. Simple family rules with tips and jokers.",
    intro: "Rummy is a classic game of collecting and arranging. Kids love the moment they finally lay down a set, and it quietly teaches patterns, sequences and planning ahead.",
    goal: 'Get rid of every card in your hand by laying down sets and runs on the table.',
    setup: [
      'With two players, deal 10 cards each. With three or four players, deal 7 cards each.',
      'The rest of the deck is the draw pile. Turn its top card face up to start the discard pile.',
    ],
    play: [
      'Start your turn by taking one card, either from the draw pile or the top card of the discard pile.',
      'You can lay down combinations: a set (3 or 4 cards of the same number) or a run (3 or more cards of the same suit in a row).',
      "You may also add cards to combinations already on the table, including other players' combinations.",
      'End every turn by discarding one card onto the discard pile.',
      'If the draw pile runs out, turn over the discard pile (except its top card) to make a new draw pile.',
    ],
    win: "The first player to get rid of all their cards wins the round. Everyone else counts the cards left in their hand, so you can play several rounds and keep score.",
    tips: [
      "Don't rush to throw away cards that are close to a run. Sometimes the missing card turns up.",
      "Watch what your opponents pick up from the discard pile so you don't hand them a card they need.",
    ],
    variants: [
      'Rummy with jokers: add two jokers that can stand in for any card in a combination.',
    ],
    faq: [
      { q: 'How many cards do you deal in Rummy?', a: 'Ten cards each for two players, and seven each for three or four players.' },
      { q: "Can you add cards to another player's run in Rummy?", a: "Yes. In this version you can add to any combination on the table, including your opponents'." },
    ],
  },
  {
    slug: 'speed', he: 'speed', name: 'Speed', emoji: '⚡', players: '2', ages: '7+',
    deck: 'A standard 52-card deck', time: '5-10 minutes',
    title: 'Speed Card Game Rules: How to Play Speed with Kids',
    description: "How to play Speed, the fast two-player card game with no turns: setup, playing one up or one down, what to do when you're stuck, plus tips and an easy version.",
    intro: "Speed is pure, noisy fun. There are no turns: both players slap down cards as fast as they can, and a whole game is over in minutes.",
    goal: 'Be the first to get rid of all your cards. There are no turns, so everyone plays as fast as they can.',
    setup: [
      'Each player gets 5 cards in hand and a face-down personal pile of 15 cards.',
      'Off to the side, make two face-down piles of 5 cards each. These are the spare piles.',
      'The last two cards go face down in the middle, side by side.',
    ],
    play: [
      'Both players flip the two middle cards at the same moment, and the game begins.',
      'Play a card on either middle pile if it is one higher or one lower, whatever the suit (on a 7 you can play a 6 or an 8).',
      'The Ace connects to both the King and the 2, so the sequence wraps around.',
      'After each card you play, refill from your personal pile, so you never hold more than 5 cards.',
      'When both players are stuck, each flips a card from a spare pile into the middle at the same time and play continues.',
      'If the spare piles run out, shuffle the middle cards and use them to make new spare piles.',
    ],
    win: 'The first player to get rid of every card in their hand and personal pile wins.',
    tips: [
      'Look at both middle piles together. You can often play several cards in a row.',
      "Play on a steady table and remind everyone that no one grabs cards out of anyone's hand.",
    ],
    variants: [
      "Speed for beginners: play slowly and take turns until everyone is comfortable with the 'one up or one down' rule.",
    ],
    faq: [
      { q: 'Do you take turns in Speed?', a: 'No. Both players play at the same time, as fast as they can.' },
      { q: 'Can you play a King on an Ace in Speed?', a: 'Yes. The Ace connects to both the King and the 2, so the numbers wrap around.' },
    ],
  },
  {
    slug: 'donkey', he: 'chamor', name: 'Donkey', emoji: '🫏', players: '3-6', ages: '5+',
    deck: 'A standard 52-card deck with one Queen removed (51 cards)', time: '10-15 minutes',
    title: 'Donkey Card Game (Old Maid) Rules: How to Play with a Normal Deck',
    description: "How to play Donkey, also known as Old Maid, with a regular deck: remove one Queen, match pairs and don't get stuck with the odd card. Easy rules for kids.",
    intro: "Donkey is the Israeli name for the game most English speakers know as Old Maid. You pass cards, match pairs and try your hardest not to be left holding the lonely Queen.",
    goal: 'Get rid of all your cards in pairs and avoid being left with the single Queen.',
    setup: [
      "Remove one Queen from the deck and set it aside without showing anyone. Now one Queen has no partner.",
      "Deal out all the cards. It's fine if some players have one card more.",
      'Everyone lays down all the pairs in their hand (two cards of the same number).',
    ],
    play: [
      "On your turn, draw one card from the hand of the player on your left without seeing it.",
      'If it makes a pair with a card in your hand, put the pair down on the table.',
      'Then the turn passes to the next player, who draws from their neighbor.',
      'A player who runs out of cards happily drops out of the game.',
      'Keep going until every pair is down and only one card is left: the lonely Queen.',
    ],
    win: "Everyone wins except the player left holding the single Queen. They're the Donkey for that round.",
    tips: [
      "Try to keep a straight face when the Queen is in your hand. That's the whole magic of the game.",
      "Shuffle your hand after someone draws from you so nobody remembers where the Queen is.",
    ],
    variants: [
      "Take out a Jack instead of a Queen. All that matters is that one card is left without a partner.",
    ],
    faq: [
      { q: 'Is Donkey the same as Old Maid?', a: "Yes, it's the same idea. You match pairs and the player stuck with the one unmatched card loses. In Israel the game is called Donkey." },
      { q: 'Can you play Old Maid with a regular deck?', a: 'Yes. Just remove one Queen before dealing so a single Queen has no match.' },
    ],
  },
  {
    slug: 'taki', he: 'taki', name: 'Taki', emoji: '🌈', players: '2-8', ages: '6+',
    deck: 'A Taki deck (a store-bought game with colored number cards and action cards)', time: '15-20 minutes',
    title: 'Taki Card Game Rules: How to Play the Israeli Game Like Uno',
    description: "How to play Taki, Israel's favorite color-matching card game, a lot like Uno: dealing, matching, action cards like Stop and Plus 2, and the Taki card.",
    intro: "Taki is an Israeli classic that plays a lot like Uno: match the color, number or symbol and race to empty your hand. Its signature twist is the Taki card, which lets you dump a whole color at once.",
    goal: 'Be the first to get rid of every card in your hand.',
    setup: [
      'Deal 8 cards to each player.',
      'The rest of the cards form the draw pile. Turn the top card face up to start the play pile.',
    ],
    play: [
      'On your turn, play a card that matches the top card by color, number or symbol.',
      "If you can't match, take one card from the draw pile and the turn passes on.",
      "Action cards: Stop skips the next player, Change Direction reverses the order of play, and Plus lets you play another card.",
      "Plus 2 makes the next player take two cards, unless they play a Plus 2 of their own and pass the bigger penalty along.",
      'Change Color can go on any card, and the player who puts it down picks the next color.',
      'The Taki card lets you play all the cards of that color in your hand in one go.',
      'When you are down to one card, you must announce it before the turn passes.',
    ],
    win: 'The first player to get rid of all their cards wins.',
    tips: [
      "Save a Change Color card for the moment you have nothing else that matches.",
      "These are the basic rules only. The deck has a few more special cards and the rules vary a little between editions, so when in doubt, follow the booklet in the box.",
    ],
    variants: [
      'For little kids: play with only number cards and Change Color cards, then add the other action cards one at a time.',
    ],
    faq: [
      { q: 'Is Taki the same as Uno?', a: "They're very similar: both are color-matching games where you race to empty your hand. Taki has its own action cards, including the Taki card that lets you play a whole color at once." },
      { q: 'How many cards do you deal in Taki?', a: 'Each player starts with 8 cards.' },
    ],
  },
  {
    slug: 'crazy-eights', he: 'crazy-eights', name: 'Crazy Eights', emoji: '🎱', players: '2-5', ages: '6+',
    deck: 'A standard 52-card deck', time: 'About 15 minutes',
    title: 'Crazy Eights Rules for Kids: How to Play with a Standard Deck',
    description: "How to play Crazy Eights: match the suit or number, play an 8 to change the suit, and be first to empty your hand. Kid-friendly rules plus penalty cards.",
    intro: "Crazy Eights is the original 'match the card' game that Uno grew out of, and all you need is a normal deck. Every 8 is wild, so there's always a twist coming.",
    goal: 'Be the first to get rid of all your cards. Every 8 is wild and changes the suit.',
    setup: [
      'With two players, deal 7 cards each. With three or more, deal 5 cards each.',
      'The rest of the deck is the draw pile. Turn the top card face up.',
    ],
    play: [
      'On your turn, play a card of the same suit (hearts, diamonds, clubs or spades) or the same number as the top card.',
      'You can play an 8 at any time, and whoever plays it chooses the next suit.',
      "If you can't play, draw from the pile until you get a card you can play (or until the pile runs out).",
      'When the draw pile runs out, shuffle the play pile (except its top card) to make a new one.',
    ],
    win: "The first player to empty their hand wins. You can also score points for the cards left in everyone else's hands.",
    tips: [
      'Hold on to your 8s until the end, when nothing else in your hand matches.',
      'After playing an 8, choose the suit you have the most of.',
    ],
    variants: [
      'Penalty cards: a 2 makes the next player draw two cards, and a Jack skips the next player.',
    ],
    faq: [
      { q: 'What does an 8 do in Crazy Eights?', a: 'An 8 can be played on anything, and the person who plays it picks the next suit.' },
      { q: 'What if you have no card to play in Crazy Eights?', a: 'Keep drawing from the pile until you get a card you can play, or until the pile runs out.' },
    ],
  },
  {
    slug: 'solitaire', he: 'solitaire', name: 'Solitaire (Klondike)', emoji: '🧩', players: '1', ages: '8+',
    deck: 'A standard 52-card deck', time: '10-20 minutes',
    title: 'Solitaire (Klondike) Rules: How to Play Solitaire with Real Cards',
    description: "How to play Klondike Solitaire with a real deck: the seven-column setup, building down in alternating colors and sorting each suit from Ace to King.",
    intro: "Klondike is the solitaire most of us grew up with on the computer, and it's just as satisfying with real cards. It's a calm, screen-free puzzle a child can play alone.",
    goal: 'Sort every card into four piles by suit, from Ace up to King.',
    setup: [
      'Lay out 7 columns: one card in the first, two in the second, and so on up to 7 cards in the last.',
      'In each column only the top card is face up. The rest are face down.',
      "The remaining cards are the stock. Leave room above the columns for four foundation piles.",
    ],
    play: [
      'Every Ace you uncover goes to its own foundation pile, and you build up the same suit on it in order: 2, 3 and on to the King.',
      'In the columns, build down in alternating colors, for example a black 6 on a red 7.',
      'You can move a group of ordered face-up cards from one column to another.',
      'When you move the last face-up card off a column, flip the card underneath it.',
      'Only a King (or a group starting with a King) can move into an empty column.',
      'When you get stuck, turn over a card from the stock and try to use it.',
    ],
    win: 'You win when all 52 cards are sorted into the four foundation piles.',
    tips: [
      'Favor moves that uncover face-down cards in the longest columns.',
      "Don't rush to empty a column unless you have a King ready to move in.",
    ],
    variants: [
      'Easy version: turn over one card at a time from the stock. Harder version: turn over three and only use the top one.',
    ],
    faq: [
      { q: 'How many cards go in each column in Klondike?', a: 'Seven columns with 1 to 7 cards, and only the top card of each column face up.' },
      { q: 'What can go in an empty column in Solitaire?', a: 'Only a King, or a group of cards that starts with a King.' },
    ],
  },
  {
    slug: 'concentration', he: 'zikaron', name: 'Concentration (Memory)', emoji: '🧠', players: '1-6', ages: '4+',
    deck: 'A standard 52-card deck (or part of one)', time: '10-20 minutes',
    title: 'Concentration Card Game Rules: How to Play Memory with Cards',
    description: "How to play Concentration, the memory card game, with a regular deck: lay the cards face down, flip two at a time and find matching pairs. Great from age 4.",
    intro: "Concentration, also called Memory or Pairs, needs nothing but a deck and a table. Little kids are often better at it than grown-ups, which makes it a favorite with everyone.",
    goal: 'Find as many matching pairs as you can.',
    setup: [
      'Decide how many pairs to use: 8 to 12 pairs for little ones, the whole deck for older kids.',
      'A pair is two cards with the same number and the same color, for example the 5 of hearts and the 5 of diamonds.',
      'Shuffle and lay the cards face down in neat rows.',
    ],
    play: [
      'On your turn, flip two cards so everyone can see them.',
      'If they match, keep them and take another turn.',
      'If not, turn them back face down in exactly the same spots, and the turn passes on.',
      'Everyone tries to remember where they saw each card.',
    ],
    win: "When all the pairs are found, the player with the most pairs wins. Playing alone? Try to finish in as few tries as possible.",
    tips: [
      'Say out loud what you flipped and where. It helps you remember (and for little ones, it practices words and numbers too).',
      'Start with a few cards and add more over time so the game stays fun, not frustrating.',
    ],
    variants: [
      'Hard mode: a pair must be the same number and the exact same suit. You need two decks for this.',
    ],
    faq: [
      { q: 'How do you play Memory with a regular deck of cards?', a: 'Pick pairs of the same number and color, lay them face down in rows, and take turns flipping two cards to find matches.' },
      { q: 'How many cards should young kids use in Concentration?', a: 'Around 8 to 12 pairs is plenty for ages 4 to 6. Add more as they get better.' },
    ],
  },
  {
    slug: 'quartets', he: 'reviot', name: 'Quartets (Happy Families)', emoji: '🗂️', players: '3-6', ages: '5+',
    deck: 'A Quartets deck (themed cards in groups of four), or a standard deck', time: '15-20 minutes',
    title: 'Quartets Card Game Rules (Happy Families): How to Play',
    description: "How to play Quartets, also called Happy Families: ask other players for cards and collect complete groups of four. Rules, tips and how to play with a normal deck.",
    intro: "Quartets, known in the UK as Happy Families, is a favorite in Israeli homes and kindergartens. Each set of four cards shares a theme, and the fun is in asking for exactly the card you need.",
    goal: 'Collect as many complete quartets (four cards from the same group) as you can.',
    setup: [
      'Shuffle and deal out all the cards.',
      'Each player sorts their hand into groups without showing anyone.',
      'Anyone who already holds a complete quartet lays it on the table right away.',
    ],
    play: [
      "On your turn, ask another player for a specific card from a group you already hold at least one card of, for example: 'From the fruit group, do you have the apple?'",
      'If they have it, they must hand it over, and you ask again.',
      "If they don't, the turn passes to the player you asked.",
      'Lay each completed quartet face up in front of you.',
      'A player who runs out of cards is out, and the others keep going.',
    ],
    win: 'Once every quartet is on the table, the player with the most quartets wins.',
    tips: [
      "Remember who asked for what. If someone asked about a group, they hold at least one card from it.",
      'No Quartets deck at home? Use a normal deck: each number is a group, and each suit is one card in that group.',
    ],
    variants: [
      "Mystery Quartets: ask only for a group, not a specific card, and the other player hands over any card from that group they choose.",
    ],
    faq: [
      { q: 'Is Quartets the same as Happy Families?', a: "Yes, they're the same kind of game: collect themed groups of four by asking other players for cards." },
      { q: 'Can you play Quartets with a regular deck?', a: 'Yes. Treat each number as a group and each of the four suits as a card in it.' },
    ],
  },
  {
    slug: 'cheat', he: 'shakran', name: 'Cheat (I Doubt It)', emoji: '🤥', players: '3-6', ages: '7+',
    deck: 'A standard 52-card deck', time: 'About 15 minutes',
    title: 'Cheat Card Game Rules (I Doubt It): How to Play the Bluffing Game',
    description: "How to play Cheat, also called I Doubt It or BS: play cards face down, bluff when you must and call 'Cheat!' on liars. Rules, tips and a flexible version.",
    intro: "Cheat is the bluffing game that has the whole table giggling. You play cards face down and say what they are, and sometimes, well, you fib.",
    goal: 'Be the first to get rid of all your cards, even if you have to bluff a little.',
    setup: [
      'Shuffle and deal out all the cards.',
      'Agree on the order: start from Ace, then 2, 3 and up to King, then back to Ace.',
    ],
    play: [
      "The first player puts one or more cards face down in the middle and announces them, for example: 'Two Aces.'",
      "The next player must announce the next number in order (here, '2s'), even if they don't have any, and put cards face down.",
      "After any play, anyone at the table can call 'Cheat!'",
      'Turn over the cards just played. If they don\'t match the announcement, the player who put them down takes the whole pile.',
      "If the announcement was true, the player who called 'Cheat!' takes the whole pile.",
      'After a challenge, play continues with the next player and the next number in order.',
    ],
    win: "The first player to get rid of all their cards (without being caught on their last play) wins.",
    tips: [
      "It's easier to bluff with a single card. It draws less suspicion.",
      "A great game for practicing a poker face and laughing together. Remind everyone it's only pretend.",
    ],
    variants: [
      'Flexible Cheat: you may announce the current number, one higher or one lower.',
    ],
    faq: [
      { q: 'What is Cheat also called?', a: "It's also known as I Doubt It and, among older kids, BS. The rules are the same." },
      { q: 'What happens if you call Cheat and you are wrong?', a: "If the cards really matched what was announced, you take the whole pile yourself." },
    ],
  },
  {
    slug: 'spoons', he: 'kapiot', name: 'Spoons', emoji: '🥄', players: '3-8', ages: '7+',
    deck: 'A standard 52-card deck and spoons (one fewer than the number of players)', time: 'About 15 minutes',
    title: 'Spoons Card Game Rules: How to Play Spoons with Kids',
    description: "How to play Spoons: pass cards fast, collect four of a kind and grab a spoon before they run out. Setup, rules, the S-P-O-O-N letters and safety tips.",
    intro: "Spoons is the card game that turns a quiet table into a scramble. Cards fly around the circle, then suddenly someone grabs a spoon and everyone dives for one.",
    goal: 'Collect four cards of the same number and grab a spoon before they are all gone.',
    setup: [
      'Put the spoons in the middle of the table where everyone can reach them.',
      'Deal 4 cards to each player. The rest of the deck stays next to the dealer.',
    ],
    play: [
      "The dealer takes a card from the deck, picks one card they don't need and passes it face down to the player on their left.",
      'Every player does the same with the card they receive: pick it up, choose, and pass one card on. You always hold 4 cards.',
      'The last player in the circle puts the card they give up on a discard pile to the side.',
      'Whoever gets four of the same number takes a spoon. You can do it quietly, without a fuss.',
      'As soon as anyone takes a spoon, everyone is allowed to grab one.',
      'When the deck runs out, the dealer shuffles the discard pile and keeps going.',
      "The player left without a spoon gets a letter: S, then P, then O, O and N.",
    ],
    win: "A player who spells the whole word SPOON is out. The last player left wins.",
    tips: [
      "Agree before you start: grab gently, and never pull a spoon out of someone else's hand.",
      'Watch the spoons, not just your cards. Sometimes someone takes one very quietly.',
    ],
    variants: [
      'No spoons? Use bottle caps, pencils or any small, safe object.',
    ],
    faq: [
      { q: 'How many spoons do you need for Spoons?', a: 'One fewer than the number of players, so with 5 players you need 4 spoons.' },
      { q: 'When can you grab a spoon?', a: 'When you have four of a kind, or as soon as you see anyone else take a spoon.' },
    ],
  },
  {
    slug: 'slapjack', he: 'slapjack', name: 'Slapjack', emoji: '✋', players: '2-6', ages: '5+',
    deck: 'A standard 52-card deck', time: 'About 10 minutes',
    title: 'Slapjack Rules for Kids: How to Play the Fast Card Game',
    description: "How to play Slapjack: flip cards into the middle and be first to put your hand on every Jack. Simple rules for kids, gentle-slap tips and a harder version.",
    intro: "Slapjack is all about quick eyes and quick hands. Kids who can't read yet can still beat grown-ups, as long as they spot the Jack first.",
    goal: 'Win all the cards by being first to put your hand on every Jack that turns up.',
    setup: [
      'Deal out all the cards between the players.',
      'Each player keeps their pile face down without looking.',
    ],
    play: [
      'In order, each player flips the top card of their pile and puts it face up on a shared pile in the middle.',
      'Flip the card away from yourself in one quick motion, so you don\'t see it before everyone else.',
      'When a Jack appears, everyone rushes to put a hand on it.',
      'The first hand on the Jack wins the whole middle pile and puts it at the bottom of their own pile.',
      'If you put your hand on a card that is not a Jack, give one card to the player who played it.',
      "A player who runs out of cards gets one chance to get back in by winning the next Jack. If they miss it, they're out.",
    ],
    win: 'Whoever collects all the cards wins.',
    tips: [
      'Agree beforehand: hands go down gently, no hitting, so nobody gets hurt.',
      "For very young kids, choose a different target card that's easy to spot, like all the 7s.",
    ],
    variants: [
      'Challenge mode: also slap when two matching cards turn up one after the other.',
    ],
    faq: [
      { q: 'What happens if you slap the wrong card in Slapjack?', a: 'You give one of your cards to the player who just played that card.' },
      { q: 'Can you come back in Slapjack after running out of cards?', a: "Yes, you get one chance: win the next Jack and you're back in. Miss it and you're out." },
    ],
  },
]

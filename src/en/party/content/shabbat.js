// English /games/shabbat: games families play on Shabbat with no screens or electricity.
// Adapted from src/data/shabbatGames.js. No halachic rulings: families follow their own custom or rabbi.

export const SHABBAT_EN = {
  title: 'Shabbat Games for Kids and Families: 28 Screen-Free Ideas',
  description: "28 Shabbat games for the whole family with no electricity, writing or special equipment: word games, memory games, active games and printables to prepare ahead.",
  h1: 'Shabbat Games for the Whole Family',
  intro: [
    "Shabbat is a wonderful time for family games. There are no screens competing for attention, everyone is home, and there are long, slow hours after the meal. Here you'll find games for the table, the living room and the yard. Most need no equipment at all, and the rest you print and set up before Shabbat begins.",
    "The games are sorted into four groups: word and conversation games, thinking and memory games, active games, and games you print ahead of time. Each one lists the right age, how many players you need and how to play.",
    "A note before you start: this is not a halachic guide. Families have different customs, for example about board games, cards, puzzles or keeping score, so follow your family's practice or ask your rabbi whenever you're unsure.",
  ],
  kinds: [
    { id: 'words', label: 'Words and conversation', emoji: '💬' },
    { id: 'thinking', label: 'Thinking and memory', emoji: '🧠' },
    { id: 'movement', label: 'Active games', emoji: '🏃' },
    { id: 'printed', label: 'Print before Shabbat', emoji: '🖨️' },
  ],
  games: [
    {
      slug: 'twenty-questions', kind: 'words', emoji: '❓', name: '20 Questions', ages: '6+', players: '2+',
      rules: [
        'One player thinks of something and says only whether it is an animal, a plant or an object.',
        "Everyone else asks questions that can be answered 'yes' or 'no'.",
        'Whoever guesses it before the 20 questions run out thinks of the next thing.',
      ],
      tip: 'For little ones, stick to animals and give hints when they get stuck.',
    },
    {
      slug: 'i-see', kind: 'words', emoji: '👀', name: 'I Spy', ages: '4+', players: '2+',
      rules: [
        'One player quietly chooses something in the room.',
        "They say: 'I spy with my little eye something...' and add a clue: a color, a shape or the letter it starts with.",
        'Everyone guesses. Whoever gets it right chooses the next thing.',
      ],
      tip: '',
    },
    {
      slug: 'broken-phone', kind: 'words', emoji: '📞', name: 'Telephone', ages: '5+', players: '5+',
      rules: [
        'Sit in a row or a circle.',
        "The first player whispers a sentence into the next person's ear, just once.",
        'Each player passes on what they heard, and the last one says it out loud. Compare it with the original.',
      ],
      tip: "Tongue twisters work best, like 'Six silly snakes sang songs on Sunday.'",
    },
    {
      slug: 'word-chain', kind: 'words', emoji: '🔗', name: 'Word Chain', ages: '7+', players: '2+',
      rules: [
        "The first player says a word, for example 'table'.",
        "The next player says a word that starts with the last letter of the previous word: 'egg', then 'giraffe'...",
        "No repeating a word that's already been said. Whoever gets stuck starts a new chain.",
      ],
      tip: 'For an easier version, stick to one topic: only animals, or only food.',
    },
    {
      slug: 'trip-memory', kind: 'thinking', emoji: '🎒', name: 'I Packed My Bag', ages: '6+', players: '2+',
      rules: [
        "The first player says: 'I packed my bag and in it I put...' and adds an item.",
        'The next player repeats everything said so far and adds an item of their own.',
        'If someone forgets, help them out and keep going. How many items can you remember together?',
      ],
      tip: 'Harder version: items go in alphabetical order, like apple, ball, crayons...',
    },
    {
      slug: 'who-am-i', kind: 'words', emoji: '🎭', name: 'Who Am I?', ages: '7+', players: '3+',
      rules: [
        'One player leaves the room, and the others choose a familiar character for them: an animal, a storybook character or a job.',
        "The player comes back and asks yes-or-no questions: 'Am I an animal?', 'Do I live in the sea?'",
        'Once they guess it, someone else goes out.',
      ],
      tip: '',
    },
    {
      slug: 'two-truths', kind: 'words', emoji: '🤥', name: 'Two Truths and a Lie', ages: '8+', players: '3+',
      rules: [
        'On their turn, each player tells three things about themselves: two true and one made up.',
        'Everyone else guesses which one is the lie.',
        'After the guess, tell the story behind the surprising truth.',
      ],
      tip: "Perfect for a table with guests. You'll learn new things even about your own family.",
    },
    {
      slug: 'story-chain', kind: 'words', emoji: '📖', name: 'Pass-Along Story', ages: '5+', players: '2+',
      rules: [
        "The first player starts a story with one sentence: 'Once, in a little village, there lived a cat who couldn't fall asleep...'",
        'Each player adds just one sentence on their turn.',
        'After a round or two, wrap it up, and let someone retell the whole story from the beginning.',
      ],
      tip: '',
    },
    {
      slug: 'categories', kind: 'words', emoji: '📋', name: 'Categories', ages: '6+', players: '2+',
      rules: [
        'Pick a topic: fruit, cities, animals that live in water.',
        "Go around the circle. Each player names one thing from the topic without repeating what's been said.",
        "Whoever can't think of an answer within a few seconds picks the next topic.",
      ],
      tip: "It's like Scattergories out loud: you can also choose a letter, and every answer has to start with it.",
    },
    {
      slug: 'seven-boom', kind: 'thinking', emoji: '💥', name: 'Buzz (Seven Boom)', ages: '7+', players: '3+',
      rules: [
        'Count around the circle, one number each: 1, 2, 3...',
        "Instead of any number that is a multiple of 7 or has a 7 in it, say 'Buzz!'",
        'If someone slips up, start again from 1. How far can you get?',
      ],
      tip: "In Israel this game is called Seven Boom, and kids shout 'Boom!' instead of 'Buzz!'",
    },
    {
      slug: 'no-yes-no', kind: 'words', emoji: '🤐', name: 'The Yes/No Game', ages: '6+', players: '2+',
      rules: [
        'One player is the questioner and fires quick questions at everyone.',
        "Nobody may answer 'yes' or 'no'. Answer with something else instead ('Absolutely', 'Not at all').",
        "Whoever says 'yes' or 'no' becomes the new questioner.",
      ],
      tip: '',
    },
    {
      slug: 'whats-missing', kind: 'thinking', emoji: '🫣', name: "What's Missing?", ages: '4+', players: '2+',
      rules: [
        'Set out 6 to 10 objects that are already in the room on the table.',
        'Everyone looks for half a minute, then closes their eyes.',
        "Someone takes one object away. Open your eyes: what's missing?",
      ],
      tip: 'For little ones, use only 4 objects. For older kids, add more objects or swap their places.',
    },
    {
      slug: 'what-changed', kind: 'thinking', emoji: '🕵️', name: 'What Changed?', ages: '5+', players: '2+',
      rules: [
        'Everyone takes a good look at one player.',
        'That player leaves the room and changes one thing about how they look: rolls up a sleeve, takes off a watch, moves a hair clip to the other side.',
        'They come back, and whoever spots the change goes out next.',
      ],
      tip: '',
    },
    {
      slug: 'hot-cold', kind: 'movement', emoji: '🔥', name: 'Hot and Cold', ages: '3+', players: '2+',
      rules: [
        'One player leaves the room while the others hide a small object.',
        "The player comes back and searches while everyone guides them: 'Cold', 'Warm', 'Boiling hot!'",
        'Once it is found, someone else goes out.',
      ],
      tip: '',
    },
    {
      slug: 'salty-fish', kind: 'movement', emoji: '🐟', name: "Grandmother's Footsteps", ages: '4+', players: '3+',
      rules: [
        'One player stands by a wall with their back to everyone else.',
        "They call out 'One, two, three, Grandmother's footsteps!' while the others creep toward them.",
        "At the end of the call they spin around, and anyone they catch moving goes back to the start. The first to touch them takes their place.",
      ],
      tip: "Also known as Red Light, Green Light. In Israel it's called Salty Fish.",
    },
    {
      slug: 'simon-says', kind: 'movement', emoji: '🙋', name: 'Simon Says', ages: '4+', players: '3+',
      rules: [
        "The leader gives instructions: 'Simon says, hands on your head.'",
        "Only follow instructions that start with 'Simon says'.",
        "Anyone who follows an instruction without 'Simon says' becomes the leader's helper for the next round (instead of being out).",
      ],
      tip: '',
    },
    {
      slug: 'charades', kind: 'movement', emoji: '🤹', name: 'Charades', ages: '6+', players: '4+',
      rules: [
        'Split into two teams.',
        'One player gets a whispered word from the other team: an animal, a job or a movie title.',
        'They act it out with no words and no sounds while their team guesses.',
      ],
      tip: 'Print a list of charades ideas before Shabbat and pick from it out loud.',
    },
    {
      slug: 'hide-seek', kind: 'movement', emoji: '🙈', name: 'Hide and Seek', ages: '4+', players: '3+',
      rules: [
        'One player counts out loud with eyes closed while everyone else hides.',
        'The seeker searches, and the first one found counts in the next round.',
        'Agree in advance where hiding is allowed and where it is not (for example, no closed closets and no balcony).',
      ],
      tip: '',
    },
    {
      slug: 'statues', kind: 'movement', emoji: '🗿', name: 'Statues', ages: '4+', players: '3+',
      rules: [
        'Everyone wanders around the room, and one player is the artist.',
        "When the artist calls 'Statues!', everyone freezes in place.",
        'The artist tries to make the statues laugh without touching them. Anyone who moves or laughs joins the artist.',
      ],
      tip: '',
    },
    {
      slug: 'riddles-printed', kind: 'printed', emoji: '🧩', name: 'Printed Riddles', ages: '5+', players: '2+',
      rules: [
        'Before Shabbat, print a page of riddles (with the answers on the side or on a separate page).',
        'Read a riddle out loud and everyone guesses.',
        'Whoever solves it reads the next riddle.',
      ],
      tip: '',
    },
    {
      slug: 'trivia-printed', kind: 'printed', emoji: '🏆', name: 'Family Trivia', ages: '7+', players: '2+',
      rules: [
        'Print trivia questions with answers ahead of time.',
        'Split into pairs or teams, with one reader asking the questions.',
        'Switch readers every round, and each team remembers how many answers it got right.',
      ],
      tip: '',
    },
    {
      slug: 'jokes', kind: 'printed', emoji: '😂', name: 'Who Laughs First?', ages: '6+', players: '2+',
      rules: [
        'Print a list of silly jokes ahead of time.',
        'Take turns reading a joke and trying to make everyone else laugh.',
        'Whoever keeps a straight face the longest wins.',
      ],
      tip: '',
    },
    {
      slug: 'table-questions', kind: 'printed', emoji: '🕯️', name: 'Shabbat Table Questions', ages: '5+', players: 'The whole family',
      rules: [
        'Print a page of conversation questions ahead of time and put it by the plates.',
        'Take turns choosing a question and answering it, then everyone can chime in.',
        "There are no right answers. The point is to listen to each other.",
      ],
      tip: '',
    },
    {
      slug: 'would-you-rather', kind: 'printed', emoji: '🤔', name: 'Would You Rather?', ages: '6+', players: '2+',
      rules: [
        "Read out a 'would you rather' question: would you rather fly or be invisible?",
        'Everyone chooses and explains why.',
        'Whoever convinces someone to change their mind reads the next question.',
      ],
      tip: '',
    },
    {
      slug: 'memory-cards', kind: 'printed', emoji: '🃏', name: 'Memory Game', ages: '4+', players: '2-4',
      rules: [
        'Before Shabbat, print, cut out and prepare the cards.',
        'Spread them face down on the table.',
        'Take turns flipping two cards. Whoever finds a pair keeps it and goes again.',
      ],
      tip: '',
    },
    {
      slug: 'dominoes', kind: 'printed', emoji: '🁫', name: 'Dominoes', ages: '5+', players: '2-4',
      rules: [
        'Print and cut out the dominoes ahead of time (or use a store-bought set).',
        'Everyone gets a few tiles, and one tile goes in the middle.',
        'On your turn, add a tile whose end matches an open end. The first to run out of tiles wins.',
      ],
      tip: '',
    },
    {
      slug: 'board-game', kind: 'printed', emoji: '🎲', name: 'Printed Board Game', ages: '4+', players: '2-4',
      rules: [
        'Print the board ahead of time and fold a paper die.',
        'Each player picks a game piece (a bottle cap, a toy coin, a big button).',
        'Roll the die, move forward and do whatever the square says.',
      ],
      tip: '',
    },
    {
      slug: 'shabbat-hunt', kind: 'printed', emoji: '🗺️', name: 'Family Treasure Hunt', ages: '4+', players: 'The whole family',
      rules: [
        'Before Shabbat, print clues and hide them around the house.',
        'The kids find a clue, read it (or have a grown-up read it to them) and follow it to the next one.',
        'A small surprise waits at the end: a treat, a book or a game.',
      ],
      tip: '',
    },
  ],
  faq: [
    {
      q: 'What games can you play on Shabbat without electricity?',
      a: "Word games like 20 Questions, Word Chain and I Spy; memory games like What's Missing? and I Packed My Bag; active games like Grandmother's Footsteps and Hide and Seek; and games you print before Shabbat, such as riddles, trivia and a memory game.",
    },
    {
      q: 'Are all of these games permitted on Shabbat?',
      a: "This page doesn't give halachic rulings. We chose games that don't need electricity, writing or special equipment, but families have different customs, for example about board games, cards, puzzles or keeping score. Whenever you're unsure, follow your family's practice or ask your rabbi.",
    },
    {
      q: 'What can we prepare before Shabbat?',
      a: 'Print riddle and trivia pages with answers, jokes and table questions; cut out and prepare cards for a memory game or dominoes; and hide the clues for a treasure hunt in advance.',
    },
    {
      q: 'Which games work well at the Shabbat table?',
      a: "Quiet games you can play sitting down: table questions, Would You Rather?, Two Truths and a Lie, Pass-Along Story, riddles and trivia.",
    },
    {
      q: 'Which games suit young children?',
      a: "Hot and Cold, What's Missing? with just a few objects, I Spy, Simon Says, Grandmother's Footsteps and Hide and Seek.",
    },
  ],
}

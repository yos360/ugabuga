// English dice-game rules for /en dice games hub and pages.
// Adapted from src/data/diceGames.js (he = Hebrew slug, same as slug).

export const DICE_HUB = {
  title: 'Dice Games for Kids and Families: Rules for 6 Easy Games',
  description: "Six easy dice games for families and classrooms: Pig, Ship Captain and Crew, Going to Boston, Beetle, Twenty-One and a math race. Clear rules and tips.",
  h1: 'Dice Games for Kids and Families',
  intro: [
    "All you need for these games is a die or two, and maybe a pencil and paper. They're quick to learn, easy to pack for a trip and sneakily good for practicing addition, multiplication and a little bit of probability.",
    "Each game below lists how many dice you need, the number of players, the right age and how long a round takes, followed by the rules step by step and a few tips.",
  ],
  faq: [
    {
      q: 'What is the easiest dice game for young kids?',
      a: "Beetle is perfect from about age 4: every number on the die lets you draw part of a bug, and the first to finish their beetle wins. Going to Boston is a great next step for kids who are starting to add.",
    },
    {
      q: 'Which dice games help kids practice math?',
      a: "Going to Boston and Twenty-One are great for adding, Pig builds mental math and decision making, and the Math Dice Race lets you switch from sums to products or differences as kids get stronger.",
    },
    {
      q: 'How many dice do I need?',
      a: "Pig, Beetle and Twenty-One need just one die, the Math Dice Race uses two, Going to Boston uses three and Ship, Captain and Crew needs five.",
    },
  ],
}

export const DICE_GAMES_EN = [
  {
    slug: 'pig', he: 'pig', name: 'Pig', emoji: '🐷', dice: 1, players: '2+', ages: '6+', time: '15-20 minutes',
    title: 'Pig Dice Game Rules: How to Play the Push-Your-Luck Game',
    description: "How to play Pig, the classic one-die game: keep rolling to build your score, but a 1 wipes out your turn. Simple rules, strategy tips and a shorter version for kids.",
    intro: "Pig is one of the simplest and most addictive dice games around. You need one die, a pencil and paper, and the only real decision is when to stop.",
    rules: [
      'On your turn, roll one die again and again, adding each roll to your turn total.',
      'At any point you can choose to stop. Your turn total is added to your saved score and the turn passes on.',
      'If you roll a 1, you lose your whole turn total and the turn passes immediately to the next player.',
      'The first player to reach 100 points wins.',
    ],
    tips: [
      'A popular strategy: stop once your turn total reaches about 20.',
      'For younger kids, play to 50 instead of 100.',
      'Let kids keep score themselves. It is great mental math practice.',
    ],
    faq: [
      { q: 'What happens if you roll a 1 in Pig?', a: 'You lose all the points you built up that turn, and play passes to the next player. Points you already saved are safe.' },
      { q: 'What is the best strategy in Pig?', a: 'A simple and strong rule of thumb is to stop when your turn total reaches about 20, and to take more risks when you are far behind.' },
    ],
  },
  {
    slug: 'ship-captain-crew', he: 'ship-captain-crew', name: 'Ship, Captain and Crew', emoji: '🚢', dice: 5, players: '2+', ages: '7+', time: '10-15 minutes',
    title: 'Ship, Captain and Crew Dice Game Rules: How to Play',
    description: "How to play Ship, Captain and Crew: five dice, three rolls, and you need a 6, 5 and 4 in order before the last two dice count as your cargo. A quick classic.",
    intro: "A classic dice game said to have been played by sailors at sea. First you need a ship (6), then a captain (5), then a crew (4), and only then do you count your cargo.",
    rules: [
      'Each player gets up to three rolls per turn, using five dice.',
      'You need to set aside a 6 (the ship), then a 5 (the captain), then a 4 (the crew), in that order only. A 5 rolled before you have a 6 set aside does not count.',
      'You may set aside more than one in the same roll as long as the order holds (for example a 6 and a 5 together).',
      'Once you have 6, 5 and 4, the two remaining dice are your cargo, and their total is your score. If you have rolls left, you may reroll them to try to do better.',
      'Anyone who did not complete ship, captain and crew scores 0. The highest score in the round wins.',
    ],
    tips: [
      'The best possible score is 12 (two 6s as cargo).',
      'Decide carefully whether to reroll your cargo: a total of 8 or more is usually worth keeping.',
    ],
    faq: [
      { q: 'What is the highest score in Ship, Captain and Crew?', a: 'Twelve, when both cargo dice show a 6.' },
      { q: 'Do you have to get the 6, 5 and 4 in order?', a: 'Yes. A 5 only counts once a 6 is set aside, and a 4 only counts once you have both the 6 and the 5.' },
    ],
  },
  {
    slug: 'going-to-boston', he: 'going-to-boston', name: 'Going to Boston', emoji: '🗽', dice: 3, players: '2+', ages: '6+', time: '10 minutes',
    title: 'Going to Boston Dice Game Rules: An Easy Game for Kids',
    description: "How to play Going to Boston: roll three dice, keep the highest each time and add them up. A fast, simple dice game full of luck and addition practice for kids.",
    intro: "A short game with three dice that works even for kids who are just learning to add.",
    rules: [
      'Roll three dice and set aside the highest one.',
      'Roll the other two dice again and set aside the higher of the two.',
      'Roll the last die.',
      'Add up the three dice you kept. That is your score for the round, and the highest score wins the round.',
      'Play an agreed number of rounds (say 5). Whoever wins the most rounds wins the game.',
    ],
    tips: [
      'The highest possible score is 18.',
      'For multiplication practice, multiply the three dice instead of adding them.',
    ],
    faq: [
      { q: 'How many dice do you need for Going to Boston?', a: 'Three dice. You keep one after each roll, so every player rolls three times in a turn.' },
      { q: 'What is the highest score in Going to Boston?', a: 'Eighteen, when all three dice you keep are 6s.' },
    ],
  },
  {
    slug: 'beetle', he: 'beetle', name: 'Beetle', emoji: '🪲', dice: 1, players: '2-6', ages: '4+', time: '15 minutes',
    title: 'Beetle Dice Game Rules: The Roll and Draw Game for Kids',
    description: "How to play Beetle, a roll-and-draw dice game: each number lets you draw a different part of a bug, and the first to finish a whole beetle wins. Ideal for preschool.",
    intro: "A dice and drawing game for little ones: every child draws a beetle, one part at a time, depending on the number they roll.",
    rules: [
      'Each player gets paper and a pencil. Take turns rolling one die.',
      'In the most common version: 6 = body, 5 = head, 4 = leg (you need six), 3 = eye (you need two), 2 = antenna (you need two), 1 = tail.',
      'You must start with the body (6). The head, legs and tail can only be drawn once you have a body, and the eyes and antennae only once you have a head.',
      "If you roll a part you've already finished or can't draw yet, pass the die on.",
      "The first player to finish a whole beetle (body, head, 6 legs, 2 eyes, 2 antennae and a tail) shouts 'Beetle!' and wins.",
    ],
    tips: [
      'There are lots of versions of which number draws which part. Just agree before you start.',
      'Swap the beetle for any creature you like: a fish, a robot or a monster.',
    ],
    faq: [
      { q: 'What number do you need to start in Beetle?', a: 'In the common version you need a 6 to draw the body before you can add anything else.' },
      { q: 'What age is the Beetle dice game for?', a: 'From about age 4. Kids only need to recognize the numbers 1 to 6 and draw simple shapes.' },
    ],
  },
  {
    slug: 'twenty-one', he: 'twenty-one', name: 'Twenty-One', emoji: '🎯', dice: 1, players: '2+', ages: '6+', time: '10 minutes',
    title: 'Twenty-One Dice Game Rules: How to Play 21 with One Die',
    description: "How to play Twenty-One with dice: roll and add, and try to get as close to 21 as you can without going over. Quick adding practice and a lesson in risk.",
    intro: "A simple dice version of 21 where everyone decides how much to risk.",
    rules: [
      'On your turn, roll one die again and again, adding up the results.',
      'You can stop at any point and keep your total.',
      'If you go over 21, you bust and lose the round.',
      'Once everyone has played, the player closest to 21 without going over wins. If there is a tie, the tied players play another round.',
    ],
    tips: [
      'A great question for kids: if you have 17, what are the chances of going over 21 on the next roll? (2 out of 6, only a 5 or a 6.)',
      'Older kids can play to 31 with two dice.',
    ],
    faq: [
      { q: 'What happens if you go over 21?', a: 'You bust and lose that round, no matter what the other players roll.' },
      { q: 'When should you stop rolling in Twenty-One?', a: 'Many players stop at 17 or above, because from there two of the six numbers will make them bust.' },
    ],
  },
  {
    slug: 'math-dice-race', he: 'math-dice-race', name: 'Math Dice Race', emoji: '➕', dice: 2, players: '2+ or a whole class', ages: '6-10', time: '10 minutes',
    title: 'Math Dice Race: A Classroom Dice Game for Addition and Times Tables',
    description: "A dice game for practicing math at home or in class: roll two dice, and the first to call out the sum (or the product) wins a point. Great for grades 1 to 4.",
    intro: "The most fun way to practice addition and multiplication: two dice, lots of 'I know!' shouts, and no worksheets.",
    rules: [
      'The leader rolls two dice where everyone can see them (big foam dice work well in a classroom).',
      'The first player to call out the correct sum scores a point.',
      'After 10 rounds, move up a level: the product instead of the sum, or the smaller number taken away from the bigger one.',
      'Whoever has the most points wins. In class, play in teams, with one player from each team answering in turn.',
    ],
    tips: [
      'With two regular dice the sum is between 2 and 12, and the product between 1 and 36.',
      'For a bigger challenge, use 10-sided or 12-sided dice.',
    ],
    faq: [
      { q: 'What grade is the Math Dice Race for?', a: 'It suits roughly grades 1 to 4. Start with sums, then move on to differences and products.' },
      { q: 'How do you play the Math Dice Race with a whole class?', a: 'Split the class into teams and have one player from each team answer in turn, so everyone gets a chance.' },
    ],
  },
]

// English escape-room topic pages (/en/tools/escape-rooms/topic/:slug): which rooms belong, the intro,
// running tips, a "which room when" guide and a short FAQ. Title, emoji and description live in catalog.js.
const byAge = age => room => room.tags?.ages?.includes(age)
const bySetting = s => room => room.tags?.settings?.includes(s)

export const EN_ESCAPE_COLLECTIONS = {
  'kids-4-6': {
    filter: byAge('4-6'),
    intro: 'For preschoolers an escape room should be short, colourful and silly. In these rooms every answer is a small number, a colour, a shape or one simple word, and a grown-up reads the clues aloud.',
    tips: ['Read every clue aloud and let the children answer together.', 'Hide the printed clues at the children’s eye level.', 'Fifteen minutes is plenty; finish while everyone is still having fun.'],
    choose: [['lost-cake', 'the shortest room, about 10 minutes, ideal for a first try'], ['pirate-treasure', 'for a pirate party with chocolate coins in the chest'], ['dinosaur-egg', 'for dinosaur fans, with footprints to walk on'], ['candy-factory', 'the sweetest finish, with real candies to count']],
    faq: [
      { q: 'Can children who can’t read yet play?', a: 'Yes. A grown-up reads each station aloud, and every answer is a number, a colour, a shape or a single word the children can say out loud.' },
      { q: 'How long does a room for 4–6 year olds take?', a: 'About 10–20 minutes. Choose the easy level online, or print the kit and run only the story stations.' },
    ],
  },
  'kids-7-9': {
    filter: byAge('7-9'),
    intro: 'At 7–9 children read on their own and love cracking codes. These rooms mix adding and taking away, patterns, simple ciphers and a story that keeps them going until the last code.',
    tips: ['Split into teams of 3–4 children.', 'Give each team one “hint card” they can cash in.', 'A small prize in a locked box at the end adds to the excitement.'],
    choose: [['superhero-hq', 'for a superhero birthday, with a backwards word to read'], ['jungle-safari', 'for animal lovers'], ['hanukkah-oil-jar', 'for Hanukkah at home or in class'], ['math-olympics', 'for practising times tables without noticing']],
    faq: [
      { q: 'Which escape room suits an 8-year-old’s birthday?', a: 'Superhero HQ, Jungle Safari and The Unicorn’s Rainbow were written for this age: short stories, easy sums and a code that opens the prize.' },
      { q: 'Do the kids need to know their times tables?', a: 'Not on the easy level. The medium and hard levels add a few multiplication locks, and every lock has graded hints.' },
    ],
  },
  'kids-10-12': {
    filter: byAge('10-12'),
    intro: 'Ten to twelve year olds want a real challenge. These rooms include ciphers with a key, multi-step sums, deduction and a final code that ties every station together.',
    tips: ['Set a 30-minute limit; a stopwatch adds tension.', 'Two teams can race each other through the same room.', 'Keep the hints for the end; they are there for teams that get stuck.'],
    choose: [['geometry-temple', 'for a geometry review in class'], ['purim-megillah-mixup', 'for a Purim party or lesson'], ['museum-heist', 'for young detectives who like a suspect table'], ['gaming-server', 'for gamers']],
    faq: [
      { q: 'Are these rooms hard enough for 12-year-olds?', a: 'Yes, especially on the hard level, which adds ten stages with combined puzzles and logic. Most groups need 30–45 minutes.' },
      { q: 'Can I use them as a lesson?', a: 'Several rooms are built around a school topic: geometry, history, geography and science. Each comes with a printable kit and a facilitator sheet.' },
    ],
  },
  teens: {
    filter: byAge('13+'),
    intro: 'Teens need a room that feels real: suspects who lie, ciphers to crack and a lock that opens only when everything fits. Even adults get stuck in these.',
    tips: ['Let the teens run the room on their own, with no adult in the room.', 'Take a photo of the team with the final code.', 'They also work for a bar or bat mitzvah or a sleepover party.'],
    choose: [['cyber-hacker', 'the hardest room on the site: binary, Caesar and Mastermind'], ['haunted-house-comedy', 'the funniest, with an Atbash cipher'], ['escape-the-classroom-exam', 'a school mystery with a logic grid'], ['egypt-tomb', 'for history and archaeology fans']],
    faq: [
      { q: 'Which room is the hardest?', a: 'The Hacker Who Locked the Server: binary numbers, a Caesar cipher, a Mastermind-style code and a final binary conversion.' },
      { q: 'Can teens play on their phones?', a: 'Yes. Every room plays in the browser with an answer box and graded hints, so a team can play on one phone or print the kit.' },
    ],
  },
  adults: {
    filter: byAge('adults'),
    intro: 'A home escape room is a great team activity: everyone works together, everyone contributes something different, and there is plenty of laughter. These rooms suit a night with friends, a family event or a work team.',
    tips: ['Groups of 4–6 players work best.', 'Print the clues and spread them around the room; it feels much more real.', 'Afterwards, do a short round: what worked for us as a team?'],
    choose: [['office-team-building', 'for a work team, with the coffee machine as the prize'], ['lost-wedding-ring', 'for a family evening or a wedding party'], ['comedy-bank-heist', 'the funniest ending'], ['detective-case', 'short and sharp, about 20 minutes']],
    faq: [
      { q: 'Is a printable escape room good for team building?', a: 'Yes. The rooms make everyone share information and test ideas together. Office Team Building was written for exactly that, with a debrief question at the end.' },
      { q: 'How many people can play one room?', a: 'Four to six per team is ideal. With more people, print a kit for each team and race on the clock.' },
    ],
  },
  classroom: {
    filter: bySetting('classroom'),
    intro: 'An escape room is a great way to review material without it feeling like a test. Each room here is built around a learning topic, with accurate answers and a kit for running it in class.',
    tips: ['Project the room on the board and solve it together, or print one kit per team.', 'Works for a double lesson or the end of a unit.', 'Give each team roles: reader, writer, checker.'],
    choose: [['english-secret-agent', 'spelling and vocabulary'], ['geometry-temple', 'perimeter, area and angles'], ['time-machine', 'history and timelines'], ['ocean-submarine', 'science: sea creatures']],
    faq: [
      { q: 'How long does a classroom escape room take?', a: 'Most take 20–30 minutes on the easy level, so one lesson is enough, including the explanation at the start.' },
      { q: 'Can the whole class play one room?', a: 'Yes. Project it and let teams take turns answering, or print a kit per team and run the room in parallel.' },
    ],
  },
  holidays: {
    filter: bySetting('holiday'),
    intro: 'A holiday escape room is an activity children look forward to, and they learn the customs along the way. Every room is based on accurate holiday facts, with riddles, ciphers and a final code.',
    tips: ['Works in preschool, in class and at the family holiday table.', 'Run the Passover room during the Seder instead of the usual afikoman hunt.', 'Add a prize that fits the holiday: a dreidel, a gragger or a decorated matzah.'],
    choose: [['hanukkah-oil-jar', 'Hanukkah, for kids 7–9'], ['purim-megillah-mixup', 'Purim, for kids 10–12'], ['pesach-afikoman-heist', 'Passover, for the whole family at the Seder'], ['rosh-hashana-shofar', 'Rosh Hashanah, with apple and honey at the end']],
    faq: [
      { q: 'Do you need to know Hebrew to play the holiday rooms?', a: 'No. Every Hebrew word is explained in English, and any Hebrew letter value you need is written on the clue card.' },
      { q: 'Are the holiday facts accurate?', a: 'Yes. Every room was checked: the order of the plagues, the number of Hanukkah candles, the dates in Tishrei and the seven species.' },
    ],
  },
  birthday: {
    filter: bySetting('birthday'),
    intro: 'An escape room turns a home party into an experience. Choose a room that fits the age, print the clues, hide them around the house, and the final code opens the box of surprises.',
    tips: ['Put the party bags inside the “safe”; that’s the prize.', 'One 20-minute room is enough as the main game.', 'With lots of children, run the same room with two teams side by side.'],
    choose: [['lost-cake', 'ages 4–6, and the cake is the prize'], ['superhero-hq', 'ages 6–9, with capes and certificates'], ['movie-premiere', 'ages 7–12, ending with a movie'], ['haunted-house-comedy', 'teens and adults, all laughs']],
    faq: [
      { q: 'How do I run an escape room at a birthday party?', a: 'Print the kit, hide the station cards around the house so each answer leads to the next, read the opening story and start a timer. The last code opens the prize.' },
      { q: 'What do I need besides a printer?', a: 'Usually just scissors and an envelope or a small box for the prize. Each room lists its props.' },
    ],
  },
}

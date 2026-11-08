// English escape-room pages: pure data (path, title, emoji, counterpart, description).
// Read by englishRoutes.js, the sitemap scripts and the English hubs. No JSX or React imports here.
// The Hebrew slugs are English words, so every English path is '/en' + the Hebrew path.

export const ESCAPE_BASE = '/en/tools/escape-rooms'

// [id, title, emoji, description]: one per Hebrew room (/tools/escape-rooms/<id>).
export const ESCAPE_ROOM_META = [
  ['lost-cake', 'The Missing Birthday Cake: escape room for young kids', '🎂', 'A gentle birthday escape room for kids 4–8: a colour clue, a balloon count and a riddle lead to the missing cake. Play online or print the free kit.'],
  ['school-lab', 'Professor Buga’s Lab: classroom escape room, ages 10+', '🧪', 'A classroom escape room: finish a number pattern, crack a letter sequence and combine both into the exit code. Free to play online or print.'],
  ['detective-case', 'The Secret Detective File: escape room for adults', '🕵️', 'A short detective escape room for teens and adults: a classic riddle, three suspects (one always lies) and a safe that opens to pure logic.'],
  ['football-locker-room', 'Football escape room: the locker room before the final', '⚽', 'A football escape room for kids 7–12: crack the shirt numbers, count the coach’s formation and open the locker room before the whistle.'],
  ['gaming-server', 'The Locked Game Server: gaming escape room for tweens', '🎮', 'A gaming escape room for ages 10 and up: work out health points, find the level that opens the gate and bring the tournament server back.'],
  ['space-station', 'The Stranded Space Station: space escape room for kids', '🚀', 'A space escape room for kids and classes: answer accurate questions about the Sun and the planets and restart the station’s navigation.'],
  ['music-studio', 'The Locked Recording Studio: music escape room', '🎵', 'A music escape room for teens and adults: count metronome beats, name an instrument from a clue and unlock the studio before recording.'],
  ['movie-premiere', 'The Secret Movie Premiere: film escape room for kids', '🎬', 'A movie escape room for kids 7–12: find out who runs the set, count the popcorn bags and open the projection safe in time for the show.'],
  ['science-lab-safe', 'The Science Lab Safe: printable science escape room', '🔬', 'A science escape room for class or home: riddles about the states of water, a thermometer reading and a code that opens the results safe.'],
  ['adult-party-mystery', 'The Party with the Secret Code: adult escape room', '🎈', 'A light escape room for adult parties: count the cups, crack a music clue and unlock the box with the night’s playlist. Plenty of laughs.'],
  ['math-vault', 'The Number Vault: math escape room for kids', '🔢', 'A math escape room for class and home: four stations of addition, sharing into pairs and number patterns build a four-digit vault code.'],
  ['library-mystery', 'The Locked Library: word and cipher escape room', '📚', 'A word escape room for the whole family: ABC order, a book on the shelf, a hidden word and a letter-shift cipher. Free to play or print.'],
  ['travel-map', 'The Lost Travel Map: compass and map escape room', '🗺️', 'A map escape room for teens and adults: use compass directions, follow steps on a grid and find the end of the journey. Free printable kit.'],
  ['team-challenge', 'The Secret Team Challenge: team-building escape room', '🤝', 'A team-building escape room for classes and teams: share the clues, find who tells the truth, order the colours and open the box together.'],
  ['pirate-treasure', 'Pirate treasure escape room for kids 4–8', '🏴‍☠️', 'A pirate escape room for kids 4–8: count palm trees, guess a colour and a shape, and open a chest of chocolate coins. Great for birthdays.'],
  ['dinosaur-egg', 'The Dinosaur Egg: escape room for kids 4–8', '🦕', 'A dinosaur escape room for kids 4–8: count footprints, find a colour and a sound pattern, and help a giant egg hatch. For parties and families.'],
  ['magic-toy-shop', 'The Magic Toy Shop: escape room for kids 4–8', '🧸', 'The toys woke up at midnight! Kids 4–8 count teddies, spot shapes and colours, and open the toy shop door. A sweet birthday escape room.'],
  ['candy-factory', 'The Candy Factory: sweet escape room for kids 4–8', '🍭', 'A sweet escape room for kids 4–8: count candies, guess flavours and colours, and get the candy machine running again. Perfect for a party.'],
  ['jungle-safari', 'Jungle Safari escape room for kids 6–9', '🐘', 'A safari escape room for kids 6–9: count the monkeys’ bananas, guess an animal, add up elephant legs and find the code to the jeep.'],
  ['superhero-hq', 'Superhero HQ: escape room for kids 6–9', '🦸', 'A superhero escape room for kids 6–9: mix colours, add up a workout, read a backwards word and open the secret door. A birthday favourite.'],
  ['rainbow-unicorn', 'The Unicorn’s Rainbow: escape room for kids 6–9', '🦄', 'A colourful unicorn escape room for kids 6–9: bring the colours back to the rainbow with patterns, riddles and a magic code. Free kit.'],
  ['hanukkah-oil-jar', 'The Lost Jar of Oil: Hanukkah escape room for kids', '🕎', 'A Hanukkah escape room for kids 7–9: riddles about candles, the dreidel and the miracle of the oil open the chest. For families and classes.'],
  ['purim-megillah-mixup', 'The Mixed-Up Megillah: Purim escape room', '🎭', 'A Purim escape room for kids 10–12: put the story of Esther in order, crack a number cipher and count the mishloach manot. Free to print.'],
  ['pesach-afikoman-heist', 'Operation Afikoman: Passover escape room for families', '🍷', 'A Passover escape room for kids 7–12: find the afikoman with riddles about the Four Questions, the ten plagues and the four cups.'],
  ['rosh-hashana-shofar', 'The Silent Shofar: Rosh Hashanah escape room', '📯', 'A Rosh Hashanah escape room for kids 10–12: a letter cipher, shofar blasts and dates in Tishrei open the shofar’s case. For class and home.'],
  ['sukkot-sukkah-storm', 'The Sukkah and the Wind: Sukkot escape room', '🌿', 'A Sukkot escape room for kids 7–9 and families: gather the four species, sort the decorations and count the meals in the sukkah.'],
  ['tu-bishvat-seeds', 'The Tu BiShvat Seeds: holiday escape room for kids', '🌱', 'A Tu BiShvat escape room for kids 7–9: discover the seven species, count seedlings and spot a doubling pattern to open the seed safe.'],
  ['independence-day-flag', 'The Independence Day Flag: Israel escape room', '🇮🇱', 'An Israel Independence Day escape room for kids 10–12: crack a letter cipher, work out years and find the secrets hidden in the flag.'],
  ['english-secret-agent', 'Secret Agent Word Mission: spelling escape room', '🕵️', 'A spelling escape room for grades 3–5: secret-agent stations with animals, colours, scrambled letters and number words spell the code.'],
  ['geometry-temple', 'The Temple of Shapes: geometry escape room', '🔺', 'A geometry escape room for grades 4–6: polygon sides, perimeter and area of a rectangle and triangle angles open an ancient temple gate.'],
  ['israel-map-quest', 'The Journey Across the Map of Israel: escape room', '🗺️', 'A geography escape room for grades 3–6: Jerusalem, the Dead Sea, Eilat and the Sea of Galilee. Map riddles, directions and a final code.'],
  ['time-machine', 'The Time Machine: history escape room for grades 4–6', '⏳', 'A history escape room for grades 4–6: put inventions on a timeline, count the years from the first flight to the Moon and get home.'],
  ['ocean-submarine', 'The Deep-Sea Submarine: ocean science escape room', '🐙', 'An ocean escape room for grades 3–6: octopuses with three hearts, whales that are mammals and starfish. Solve the puzzles to surface.'],
  ['museum-heist', 'The Museum Mystery: detective escape room for class', '🖼️', 'A detective escape room for grades 4–6: a painting has vanished! Decode a number note, count the visitors and use a suspect table.'],
  ['math-olympics', 'The Math Olympics: math escape room for grades 3–5', '🏅', 'A math escape room for grades 3–5: times tables, a doubling pattern, word problems and a mystery number win the Math Olympics gold.'],
  ['haunted-house-comedy', 'The “Haunted” House: funny escape room for teens', '👻', 'A comedy escape room for teens and adults: strange noises, footprints in flour and an Atbash cipher. Find the real “ghost”, no scares.'],
  ['cyber-hacker', 'The Hacker Who Locked the Server: cyber escape room', '💻', 'A cyber escape room for teens and adults: decode binary, a Caesar cipher and a Mastermind code to free a locked server. A real brain test.'],
  ['egypt-tomb', 'The Pharaoh’s Tomb: Ancient Egypt escape room', '🏺', 'An Ancient Egypt escape room for teens and adults: decode hieroglyphs, solve a number pyramid and find which coffin hides the treasure.'],
  ['comedy-bank-heist', 'The Most Embarrassing Bank Robbery: escape room', '🏦', 'A comedy escape room for teens and adults: three robbers locked themselves in the vault. Logic, digits and a balance scale get them out.'],
  ['office-team-building', 'Office team-building escape room for adults', '🗂️', 'An office team-building escape room: seating logic, a letter-value code, a lateral riddle and an email chain unlock the coffee machine.'],
  ['lost-wedding-ring', 'The Ring That Vanished at the Wedding: escape room', '💍', 'A detective escape room for adults and teens: the ring vanished just before the ceremony. Weigh the testimony, find the liar and the ring.'],
  ['escape-the-classroom-exam', 'The Missing Exam: escape room for teens', '📝', 'An escape room for teens: the exam papers vanished! A number sequence, a cipher, a clock angle and a logic grid reveal who took them.'],
]

// [slug, title, emoji, description]: one per Hebrew topic page (/tools/escape-rooms/topic/<slug>).
export const ESCAPE_TOPIC_META = [
  ['kids-4-6', 'Escape rooms for preschoolers and kids 4–6', '🧸', 'Easy printable escape rooms for little kids: counting, colours, shapes and simple riddles a grown-up reads aloud. Perfect for birthdays.'],
  ['kids-7-9', 'Escape rooms for kids 7–9', '🔍', 'Escape rooms for kids aged 7–9: easy math, ciphers with a key, logic riddles and funny stories. Play online or print for a party, free.'],
  ['kids-10-12', 'Escape rooms for kids 10–12', '🧩', 'Challenging escape rooms for ages 10–12: letter ciphers, multi-step logic puzzles and clever stories for the classroom, a club or a party.'],
  ['teens', 'Escape rooms for teens', '🕶️', 'Escape rooms for teens 13 and up: logic puzzles, binary code, ciphers, mysteries with suspects and lots of humour. Free to play or print.'],
  ['adults', 'Escape rooms for adults and team building', '🥂', 'Escape rooms for adults: team building, parties or a night with friends. Mysteries with suspects, ciphers and logic puzzles, all free.'],
  ['classroom', 'Classroom escape rooms', '🏫', 'Educational escape rooms for the classroom: spelling, geometry, geography, history, science and math. A review activity every pupil joins.'],
  ['holidays', 'Jewish holiday escape rooms', '🕎', 'Escape rooms for the Jewish holidays: Hanukkah, Purim, Passover, Rosh Hashanah, Sukkot, Tu BiShvat and Israel’s Independence Day.'],
  ['birthday', 'Birthday party escape rooms', '🎂', 'Escape rooms for a birthday at home: funny stories, printable clues and a final code that opens the cake or the party bags. All ages, free.'],
]

export const ESCAPE_PAGES = [
  { path: ESCAPE_BASE, title: 'Printable escape rooms for kids, teens and adults', emoji: '🔐', counterpart: '/tools/escape-rooms', description: '42 free escape rooms for preschool, kids, teens, adults, the classroom and the holidays. Play online or print a full kit with hints and answers.' },
  ...ESCAPE_TOPIC_META.map(([slug, title, emoji, description]) => ({ path: `${ESCAPE_BASE}/topic/${slug}`, title, emoji, counterpart: `/tools/escape-rooms/topic/${slug}`, description })),
  ...ESCAPE_ROOM_META.map(([id, title, emoji, description]) => ({ path: `${ESCAPE_BASE}/${id}`, title, emoji, counterpart: `/tools/escape-rooms/${id}`, description })),
]

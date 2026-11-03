// Pure data for the English reading pages (no imports, so Node scripts and the entry bundle can read it).
// Slugs, bands and word counts match src/data/englishReading.js; titles, genres and summaries are English.

export const READING_BANDS = [
  { id: 'g3-4', label: 'Level 1', ages: 'about ages 8-10', emoji: '🌱', words: [40, 80], desc: 'Very short texts in simple present-tense sentences, about everyday things.' },
  { id: 'g5-6', label: 'Level 2', ages: 'about ages 10-12', emoji: '🌿', words: [90, 150], desc: 'Stories, fables, letters and short fact texts, now with the past tense.' },
  { id: 'g7-8', label: 'Level 3', ages: 'about ages 12-14', emoji: '🌳', words: [150, 220], desc: 'Medium-length texts about nature, space and travel, plus diaries and emails.' },
  { id: 'g9', label: 'Level 4', ages: 'about ages 14-15', emoji: '🍀', words: [220, 300], desc: 'Longer fact texts, a fable, a diary and a letter for confident readers.' },
  { id: 'g10-12', label: 'Level 5', ages: 'about ages 15-18', emoji: '🎓', words: [300, 400], desc: 'Long articles, an opinion essay and short stories with more complex ideas.' },
]

export const GENRES = { story: 'Story', fable: 'Fable', facts: 'Fact text', diary: 'Diary', letter: 'Letter', opinion: 'Opinion essay' }
const KIND_NOUN = { story: 'short story', fable: 'fable', facts: 'reading passage', diary: 'diary entry', letter: 'letter', opinion: 'opinion essay' }
export const kindNoun = genre => KIND_NOUN[genre]

// [slug, band, genre, emoji, title, summary]
const ROWS = [
  ['my-cat-mitzi', 'g3-4', 'story', '🐱', 'My Cat Mitzi', 'A child describes the family cat, Mitzi: what she looks like and what she does every day.'],
  ['the-lion-and-the-mouse', 'g3-4', 'fable', '🦁', 'The Lion and the Mouse', 'A tiny mouse wakes a big lion, and later turns out to be the one who can save him.'],
  ['a-day-at-the-beach', 'g3-4', 'story', '🏖️', 'A Day at the Beach', 'A family spends a hot day at the beach with a sand castle, watermelon and a sunset.'],
  ['camels-in-the-negev', 'g3-4', 'facts', '🐪', 'Camels', 'A short fact text about camels: where they live, what is in a hump and why they are called ships of the desert.'],
  ['hanukkah-lights', 'g3-4', 'story', '🕎', 'Hanukkah Lights', 'A child tells how a family celebrates Hanukkah with candles, a spinning top and doughnuts.'],
  ['my-birthday-diary', 'g3-4', 'diary', '🎂', 'My Birthday', 'Yoni writes a diary entry about his ninth birthday: a crown at school, a park party and a gift from a friend.'],
  ['the-ant-and-the-grasshopper', 'g5-6', 'fable', '🐜', 'The Ant and the Grasshopper', 'A busy ant prepares for winter while a grasshopper only sings and dances. What happens when the cold arrives?'],
  ['the-moon', 'g5-6', 'facts', '🌙', 'Our Neighbor, the Moon', 'Why the Moon seems to change shape, why nothing lives there and who has walked on it.'],
  ['a-letter-from-the-kibbutz', 'g5-6', 'letter', '✉️', 'A Letter from the Kibbutz', 'Grandma Rina writes to her granddaughter Tamar about the first rain, picking avocados and a new chicken coop.'],
  ['the-hoopoe', 'g5-6', 'facts', '🐦', "The Hoopoe: Israel's National Bird", 'How the hoopoe was chosen as a national bird, what it looks like and what it eats.'],
  ['lost-in-the-market', 'g5-6', 'story', '🍉', 'Lost in the Market', 'Ella gets lost in a busy market in Jerusalem and remembers exactly what to do.'],
  ['my-new-bike', 'g5-6', 'diary', '🚲', 'Dear Diary: My New Bike', 'A girl writes about the bike she got for her birthday and her first ride with her brother.'],
  ['the-dead-sea', 'g7-8', 'facts', '🌊', 'The Dead Sea', 'The lowest place on land: why people float in it, why it is called dead and why it is shrinking.'],
  ['the-boy-who-cried-wolf', 'g7-8', 'fable', '🐺', 'The Boy Who Cried Wolf', 'The well-known fable of a young shepherd who shouted "Wolf!" as a joke until a real wolf came.'],
  ['sunrise-at-masada', 'g7-8', 'diary', '🌄', 'Sunrise at Masada', 'A diary from a school trip: climbing the Snake Path in the dark and watching the sun rise over the Dead Sea.'],
  ['sea-turtles', 'g7-8', 'facts', '🐢', "Sea Turtles on Israel's Beaches", 'Large sea turtles lay their eggs on quiet beaches. Learn about the danger of city lights and the people who protect the nests.'],
  ['the-red-planet', 'g7-8', 'facts', '🔴', 'Mars, the Red Planet', 'Why Mars is red, how cold it gets, the biggest volcano in the solar system and the robots that explore it.'],
  ['email-from-haifa', 'g7-8', 'letter', '📧', 'An Email from Haifa', 'Shira writes to a pen pal in Canada about her city: the mountain, the tiny underground train and the Baha’i Gardens.'],
  ['how-volcanoes-work', 'g9', 'facts', '🌋', 'How Volcanoes Work', 'What magma and lava are, where most volcanoes are found and what is left of volcanoes in the Golan Heights.'],
  ['the-north-wind-and-the-sun', 'g9', 'fable', '☀️', 'The North Wind and the Sun', 'A contest between the North Wind and the Sun: who can make a traveler take off his coat?'],
  ['holiday-boxes', 'g9', 'diary', '📦', 'Four Hundred Boxes', 'A teenager writes about volunteering at a food bank for the first time and packing holiday food boxes.'],
  ['the-space-station', 'g9', 'facts', '🛰️', 'A Home in Orbit', 'How fast the International Space Station travels, what life is like without gravity and the second Israeli in space.'],
  ['ein-gedi', 'g9', 'facts', '🐐', 'Ein Gedi: An Oasis in the Desert', 'Where the springs come from, which animals live there and what ancient finds tell us about the oasis.'],
  ['letter-to-my-future-self', 'g9', 'letter', '💌', 'A Letter to My Future Self', 'A fourteen-year-old writes to herself ten years from now about her life, her dreams and her questions.'],
  ['the-sharks-of-hadera', 'g10-12', 'facts', '🦈', 'The Sharks of Hadera', 'Why dozens of sharks gather every winter near a power station, what researchers learn and why you should keep your distance.'],
  ['reviving-hebrew', 'g10-12', 'facts', '📜', 'The Language That Came Back to Life', 'How Hebrew became an everyday language again: Eliezer Ben-Yehuda, the words he invented and the people who helped.'],
  ['the-last-bus', 'g10-12', 'story', '🚌', 'The Last Bus', 'Noam misses the last bus home and meets an old man on the bench who has a story of his own.'],
  ['where-did-the-stars-go', 'g10-12', 'facts', '🌌', 'Where Did the Stars Go?', 'Light pollution: why most people can no longer see the Milky Way, how it harms animals and people, and how to fix it.'],
  ['should-homework-be-banned', 'g10-12', 'opinion', '📝', 'Should Homework Be Banned?', 'A student argues about homework, with points for and against, and suggests another way.'],
  ['grandpas-watch', 'g10-12', 'story', '⌚', "Grandpa's Watch", 'Yael inherits an old pocket watch and discovers her grandfather\'s story of coming to a new country.'],
]

export const READING_STORY_META = ROWS.map(([slug, band, kind, emoji, title, summary]) => ({
  slug, band, kind, genre: GENRES[kind], emoji, title, summary, path: `/en/reading/${slug}`,
}))
export const storyMetaBySlug = slug => READING_STORY_META.find(s => s.slug === slug)

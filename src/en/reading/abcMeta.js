// Pure data for the English ABC and picture-word pages (no imports).
// Letter pictures, words and sentences come from src/data/content/abcLetters.js; picture-word lists from src/data/englishWords.js.

export const ABC_ROOT = '/en/abc'
export const LETTER_SLUGS = [...'abcdefghijklmnopqrstuvwxyz']

// name = how the letter is said; sound = what it does in words.
export const LETTER_INFO = {
  A: { name: 'ay', sound: 'Short A says /a/ as in apple. Long A says its own name, as in cake.' },
  B: { name: 'bee', sound: 'B says /b/ as in ball. Press your lips together, then let a small puff of air pop out.' },
  C: { name: 'see', sound: 'Hard C says /k/ as in cat. Soft C says /s/ as in city, usually before e, i or y.' },
  D: { name: 'dee', sound: 'D says /d/ as in dog. The tip of your tongue taps behind your top teeth.' },
  E: { name: 'ee', sound: 'Short E says /e/ as in egg. Long E says its own name, as in tree.' },
  F: { name: 'eff', sound: 'F says /f/ as in fish. Your top teeth touch your bottom lip as you blow.' },
  G: { name: 'jee', sound: 'Hard G says /g/ as in goat. Soft G sounds like J, as in giant, usually before e, i or y.' },
  H: { name: 'aitch', sound: 'H says /h/ as in hat. It is just a breath of air with no voice.' },
  I: { name: 'eye', sound: 'Short I says /i/ as in igloo. Long I says its own name, as in ice.' },
  J: { name: 'jay', sound: 'J says /j/ as in jam.' },
  K: { name: 'kay', sound: 'K says /k/ as in kite. In words like knee, the K is silent.' },
  L: { name: 'el', sound: 'L says /l/ as in lion. The tip of your tongue touches the roof of your mouth.' },
  M: { name: 'em', sound: 'M says /m/ as in moon. Close your lips and hum.' },
  N: { name: 'en', sound: 'N says /n/ as in nose. The tip of your tongue touches the roof of your mouth and the sound comes through your nose.' },
  O: { name: 'oh', sound: 'Short O says /o/ as in octopus. Long O says its own name, as in boat.' },
  P: { name: 'pee', sound: 'P says /p/ as in pig. Press your lips together and let out a puff of air.' },
  Q: { name: 'cue', sound: 'Q almost always comes with U, and together they say /kw/, as in queen.' },
  R: { name: 'ar', sound: 'R says /r/ as in rabbit. Your tongue pulls back and does not touch the roof of your mouth.' },
  S: { name: 'ess', sound: 'S says /s/ as in sun. At the end of a word it can say /z/, as in dogs.' },
  T: { name: 'tee', sound: 'T says /t/ as in tree. The tip of your tongue taps behind your top teeth.' },
  U: { name: 'you', sound: 'Short U says /u/ as in umbrella. Long U says its own name, as in unicorn.' },
  V: { name: 'vee', sound: 'V says /v/ as in violin. Your top teeth touch your bottom lip, and your voice buzzes.' },
  W: { name: 'double-u', sound: 'W says /w/ as in whale. Round your lips, then open them.' },
  X: { name: 'ex', sound: 'At the end of a word, X says /ks/, as in box and fox. Very few words begin with X.' },
  Y: { name: 'why', sound: 'At the start of a word, Y says /y/ as in yo-yo. At the end it can sound like ee or eye, as in happy and fly.' },
  Z: { name: 'zee (or zed)', sound: 'Z says /z/ as in zebra. Make a buzzing sound, like a bee.' },
}

// slug, title, emoji, intro (the picture-word topics of /english, in English)
export const WORD_TOPICS = [
  ['colors', 'Colors', '🎨', 'Ten first colors. A good game for home: call out a color and everyone runs to touch something of that color.'],
  ['numbers', 'Numbers 1-20', '🔢', 'The numbers from one to twenty. Notice that 13 to 19 all end in -teen.'],
  ['animals', 'Animals', '🐾', 'Sixteen animals that children meet early on, from pets to farm animals and wild animals.'],
  ['body', 'Parts of the Body', '👂', 'Twelve body words. Point to each part as you say it.'],
  ['feelings', 'Feelings', '😊', 'Ten words for how we feel. Make a face to match each one.'],
  ['magic-words', 'Magic Words and Manners', '✨', 'Polite words that make everyone smile: please, thank you, sorry and more.'],
  ['days', 'Days of the Week', '📅', 'The seven days of the week, from Sunday to Saturday.'],
  ['months', 'Months of the Year', '🗓️', 'The twelve months, in order. Each one starts with a capital letter.'],
  ['classroom', 'In the Classroom', '🏫', 'Twelve things you can find in a classroom. Go on a hunt and name what you see.'],
  ['birthday', 'Birthday', '🎂', 'Twelve party words, from cake and candles to balloons and presents.'],
  ['fruits', 'Fruit', '🍎', 'Twelve fruits with pictures. Which ones have you tasted?'],
  ['food', 'Food', '🍕', 'Twelve everyday foods. Say what you like and what you do not like.'],
  ['family', 'Family', '👪', 'Eight words for the people in a family.'],
  ['clothes', 'Clothes', '👕', 'Ten things to wear. Name what you have on today.'],
  ['weather', 'Weather', '🌦️', 'Ten weather words. Look out of the window and say what you see.'],
  ['transport', 'Vehicles and Transport', '🚗', 'Twelve ways to travel, on land, on water and in the air.'],
  ['shapes', 'Shapes', '🔺', 'Six basic shapes. Find them around the room.'],
  ['home', 'In the House', '🏠', 'Twelve things you can find at home.'],
].map(([slug, title, emoji, intro]) => ({ slug, title, emoji, intro, path: `/en/words/${slug}` }))
export const topicMeta = slug => WORD_TOPICS.find(t => t.slug === slug)

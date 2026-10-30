// Data for the vowel-points booklet (/booklets/nikud): one page per vowel, six letters each, with a picture
// of a word that starts with that letter and vowel. Each word: [word with points, emoji].
export const VOWELS = [
  { key: 'patach', name: 'פַּתָח', mark: 'ַ', sound: 'אַ', words: [['אַרְיֵה', '🦁'], ['בַּיִת', '🏠'], ['גַּמָּל', '🐪'], ['דַּג', '🐟'], ['כַּדּוּר', '⚽'], ['מַפְתֵּחַ', '🔑']] },
  { key: 'kamatz', name: 'קָמָץ', mark: 'ָ', sound: 'אָ', words: [['בָּלוֹן', '🎈'], ['גָּזָר', '🥕'], ['מָטוֹס', '✈️'], ['פָּרָה', '🐄'], ['שָׁעוֹן', '⌚'], ['חָתוּל', '🐈']] },
  { key: 'tzere', name: 'צֵירֶה', mark: 'ֵ', sound: 'אֵ', words: [['בֵּיצָה', '🥚'], ['לֵב', '❤️'], ['סֵפֶר', '📚'], ['פֵּרוֹת', '🍎'], ['שֵׁן', '🦷'], ['עֵץ', '🌳']] },
  { key: 'segol', name: 'סֶגּוֹל', mark: 'ֶ', sound: 'אֶ', words: [['גֶּשֶׁר', '🌉'], ['דֶּלֶת', '🚪'], ['יֶלֶד', '👦'], ['כֶּלֶב', '🐕'], ['שֶׁמֶשׁ', '☀️'], ['אֶצְבַּע', '☝️']] },
  { key: 'chirik', name: 'חִירִיק', mark: 'ִ', sound: 'אִ', words: [['דִּינוֹזָאוּר', '🦖'], ['תִּינוֹק', '👶'], ['פִּיל', '🐘'], ['עִפָּרוֹן', '✏️'], ['קִפּוֹד', '🦔'], ['מִטְרִיָּה', '☂️']] },
  { key: 'cholam', name: 'חוֹלָם', mark: 'ֹ', sound: 'אוֹ', vav: true, words: [['סוֹס', '🐴'], ['כּוֹבַע', '🧢'], ['שׁוֹקוֹלָד', '🍫'], ['רוֹבּוֹט', '🤖'], ['דּוֹב', '🐻'], ['נוֹצָה', '🪶']] },
  { key: 'shuruk', name: 'שׁוּרוּק', mark: 'וּ', sound: 'אוּ', vav: true, words: [['עוּגָה', '🍰'], ['שׁוּם', '🧄'], ['חוּט', '🧵'], ['בּוּבָּה', '🪆'], ['יוּנָה', '🕊️'], ['תּוּת', '🍓']] },
]

// The opening syllable of a word: its first letter with its points, plus the vav for ô and û.
export function syllable(word, vav = false) {
  const marks = /[֑-ׇ]/
  const chars = [...word]
  let i = 1
  while (i < chars.length && marks.test(chars[i])) i++
  if (vav && chars[i] === 'ו') { i++; while (i < chars.length && marks.test(chars[i])) i++ }
  return chars.slice(0, i).join('')
}

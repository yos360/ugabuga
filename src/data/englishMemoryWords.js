// First English words as memory-game pairs: a Hebrew card and an English card (with how it sounds in
// Hebrew letters). The 52-word list a parent asked for, grouped so a game can focus on one topic.
// Pronunciations follow the conventions of englishWords.js. `color` paints a swatch instead of an emoji.
const w = (en, he, say, emoji, color) => ({ en, he, say, emoji, color })

export const MEMORY_WORD_GROUPS = [
  {
    slug: 'colors', title: 'צבעים', emoji: '🎨',
    words: [
      w('red', 'אדום', 'רֶד', '', '#e53935'), w('yellow', 'צהוב', 'יֶלוֹ', '', '#fdd835'), w('blue', 'כחול', 'בְּלוּ', '', '#1e88e5'),
      w('green', 'ירוק', 'גְרִין', '', '#43a047'), w('brown', 'חום', 'בְּרָאוּן', '', '#795548'), w('white', 'לבן', 'וַויְט', '', '#ffffff'),
      w('black', 'שחור', 'בְּלֶק', '', '#212121'), w('orange', 'כתום', 'אוֹרֶנְג׳', '', '#fb8c00'),
    ],
  },
  {
    slug: 'numbers', title: 'מספרים 1–10', emoji: '🔢',
    words: [
      w('one', 'אחת', 'וָואן', '1'), w('two', 'שתיים', 'טוּ', '2'), w('three', 'שלוש', 'תְ׳רִי', '3'), w('four', 'ארבע', 'פוֹר', '4'),
      w('five', 'חמש', 'פַייב', '5'), w('six', 'שש', 'סִיקְס', '6'), w('seven', 'שבע', 'סֶבֶן', '7'), w('eight', 'שמונה', 'אֵייט', '8'),
      w('nine', 'תשע', 'נַיין', '9'), w('ten', 'עשר', 'טֶן', '10'),
    ],
  },
  {
    slug: 'family', title: 'משפחה', emoji: '👪',
    words: [
      w('boy', 'ילד', 'בּוֹי', '👦'), w('girl', 'ילדה', 'גֶרְל', '👧'), w('father', 'אבא', 'פָאדֶ׳ר', '👨'), w('mother', 'אמא', 'מַאדֶ׳ר', '👩'),
      w('sister', 'אחות', 'סִיסְטֶר', '👭'), w('brother', 'אח', 'בְּרַאדֶ׳ר', '👬'), w('baby', 'תינוק', 'בֵּייבִּי', '👶'),
      w('grandfather', 'סבא', 'גְרֶנְד־פָאדֶ׳ר', '👴'), w('grandmother', 'סבתא', 'גְרֶנְד־מַאדֶ׳ר', '👵'), w('family', 'משפחה', 'פֶמִילִי', '👪'),
    ],
  },
  {
    slug: 'class', title: 'בכיתה ובגן', emoji: '🏫',
    words: [
      w('stand up', 'לעמוד', 'סְטֶנְד אַפּ', '🧍'), w('sit down', 'לשבת', 'סִיט דָאוּן', '🪑'), w('listen', 'להקשיב', 'לִיסֶן', '👂'),
      w('quiet', 'שקט', 'קְוַואיֶט', '🤫'), w('my name is…', 'השם שלי הוא…', 'מַיי נֵיים אִיז', '📛'), w('book', 'ספר', 'בּוּק', '📚'),
    ],
  },
  {
    slug: 'actions', title: 'פעולות', emoji: '🏃',
    words: [
      w('walk', 'ללכת', 'ווֹק', '🚶'), w('run', 'לרוץ', 'רַאן', '🏃'), w('jump', 'לקפוץ', 'גְ׳אמְפּ', '🤸'),
      w('swim', 'לשחות', 'סְוִוים', '🏊'), w('fall', 'ליפול', 'פוֹל', '⬇️'), w('leave', 'לעזוב', 'לִיב', '👋'),
    ],
  },
  {
    slug: 'nature', title: 'טבע ועולם', emoji: '🌍',
    words: [
      w('sun', 'שמש', 'סַאן', '☀️'), w('sky', 'שמיים', 'סְקַאי', '☁️'), w('water', 'מים', 'ווֹטֶר', '💧'),
      w('frog', 'צפרדע', 'פְרוֹג', '🐸'), w('world', 'עולם', 'ווֹרְלְד', '🌍'),
    ],
  },
  {
    slug: 'more', title: 'עוד מילים', emoji: '🎈',
    words: [
      w('happy', 'שמח', 'הֶפִּי', '😀'), w('sad', 'עצוב', 'סֶד', '😢'), w('big', 'גדול', 'בִּיג', '🐘'), w('beautiful', 'יפה', 'בְּיוּטִיפוּל', '🌸'),
      w('balloon', 'בלון', 'בַּלוּן', '🎈'), w('clown', 'ליצן', 'קְלָאוּן', '🤡'), w('legs', 'רגליים', 'לֶגְס', '🦵'),
    ],
  },
]

export const MEMORY_WORDS = MEMORY_WORD_GROUPS.flatMap(g => g.words.map(word => ({ ...word, group: g.slug })))

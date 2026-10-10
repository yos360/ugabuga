// Hanukkah songs (/holidays/hanukkah/songs).
// Copyright: only public-domain texts are printed in full (the medieval piyyut "מעוז צור",
// the liturgical "הנרות הללו" and the candle blessings). Every other song is listed with its
// credits, a short description written for this site and a YouTube *search* link — never lyrics.
// Credits were checked against 2+ sources (Zemereshet, the National Library of Israel,
// Hebrew Wikipedia, Shironet, Tav Israeli); songs with conflicting credits were left out.

export const SONG_AGES = [
  { id: 'gan', label: 'לגן ולפעוטות', emoji: '🧸' },
  { id: 'school', label: 'לבית הספר', emoji: '🎒' },
  { id: 'all', label: 'לכל המשפחה', emoji: '👨‍👩‍👧' },
]

// clue = an emoji riddle for the "guess the song" game, hint = a short helper line.
// Both are written for this site and hint at the title only, never at the lyrics.
export const HANUKKAH_SONGS = [
  {
    slug: 'sevivon', title: 'סביבון סוב סוב סוב', emoji: '🌀', age: 'gan',
    lyricist: 'לוין קיפניס', composer: 'לחן עממי',
    desc: 'שיר הסביבון המוכר מכולם, משנות העשרים של המאה הקודמת. שיר קצר וקליט שמתאים לשיר תוך כדי סיבוב הסביבון על הרצפה.',
    clue: '🔄 🔄 🔄 🎲', hint: 'משהו שמסתובב שוב ושוב — ויש עליו ארבע אותיות',
  },
  {
    slug: 'banu-choshech', title: 'באנו חושך לגרש', emoji: '🔦', age: 'gan',
    lyricist: 'שרה לוי־תנאי', composer: 'עמנואל עמירן',
    desc: 'אחד משירי החנוכה המושרים ביותר בגנים. נכתב בשנות הארבעים, כששרה לוי־תנאי עבדה כגננת בקיבוץ רמת הכובש, והוא מתאים במיוחד לתהלוכת אור עם פנסים או נרות.',
    clue: '🌑 ➡️ 🚪 💡', hint: 'מגרשים את החושך מהבית',
  },
  {
    slug: 'kad-katan', title: 'כד קטן', emoji: '🏺', age: 'gan',
    lyricist: 'אהרן אשמן', composer: 'יואל ולבה',
    desc: 'שיר על פך השמן הקטן שהספיק לשמונה ימים. פורסם לראשונה בסוף שנות הארבעים והפך לאחד מסמלי החג בגני הילדים.',
    clue: '🏺 🤏 🛢️ 8️⃣', hint: 'כלי קטן עם שמן, שהספיק להרבה יותר משחשבו',
  },
  {
    slug: 'chag-yafe', title: 'חנוכה, חנוכה, חג יפה כל כך', emoji: '✨', age: 'gan',
    lyricist: 'לוין קיפניס', composer: 'לחן עממי',
    desc: 'שיר שמח ופשוט מתחילת שנות העשרים, שקיפניס התאים ללחן עממי. מתאים לריקוד במעגל ולפתיחת מסיבת חנוכה.',
    clue: '🕎 😍 ✨ 🎉', hint: 'שם החג פעמיים — ומחמאה גדולה לחג',
  },
  {
    slug: 'chanukiya-li-yesh', title: 'חנוכייה לי יש', emoji: '🙋', age: 'gan',
    lyricist: 'שרה גלוזמן', composer: 'ניסן כהן־מלמד',
    desc: 'שיר שילד שר בגאווה על החנוכייה שלו ועל ההדלקה בכל ערב. פורסם לראשונה בעיתון "דבר לילדים", והולחן אחר כך בידי ניסן כהן־מלמד.',
    clue: '🙋 🕎 🏠', hint: 'מישהו מספר בגאווה מה יש לו בבית',
  },
  {
    slug: 'chanukiya-yefefiya', title: 'חנוכייה יפהפייה', emoji: '🕎', age: 'gan',
    lyricist: 'לוין קיפניס', composer: 'לחן עממי',
    desc: 'שיר ספירה: בכל בית מוסיפים עוד נר, עד שמונה. מעולה ללמד ילדים קטנים לספור ולהבין למה החנוכייה מתמלאת מערב לערב.',
    clue: '🕎 💖 1️⃣ ➡️ 8️⃣', hint: 'סופרים נרות — וכלי החג הוא ממש יפה',
  },
  {
    slug: 'levivot', title: 'לביבות', emoji: '🥔', age: 'gan',
    lyricist: 'לוין קיפניס', composer: 'נחום נרדי',
    desc: 'שיר משנות השלושים על הכנת לביבות לחג. נכתב לחיזיון "נשף לביבות" של קיפניס, וכיף לשלב בו תנועות של לישה וטיגון.',
    clue: '🥔 🍳 🔥 😋', hint: 'מאכל מטוגן של החג (לא סופגנייה)',
  },
  {
    slug: 'ner-li', title: 'נר לי', emoji: '🕯️', age: 'gan',
    lyricist: 'לוין קיפניס', composer: 'דניאל סמבורסקי',
    desc: 'שיר קצרצר על נר קטן שמדליקים בחנוכה, מאמצע שנות השלושים. בזכות המשפטים הקצרים והחזרות הוא מתאים גם לפעוטות.',
    clue: '🕯️ 🤏 🙋', hint: 'נר קטן — והוא שלי',
  },
  {
    slug: 'hava-narima', title: 'הבה נרימה', emoji: '🙌', age: 'all',
    lyricist: 'לוין קיפניס', composer: 'גאורג פרידריך הנדל',
    desc: 'שיר ניצחון למכבים, שקיפניס כתב ב־1936 ללחן מתוך האורטוריה "יהודה המכבי" של הנדל. שיר חגיגי ומלא גאווה, ששרים בקול גדול.',
    clue: '🙌 ⬆️ 🎶 🏆', hint: 'מזמינים את כולם להרים',
  },
  {
    slug: 'yemei-hachanuka', title: 'ימי החנוכה', emoji: '📅', age: 'all',
    lyricist: 'אברהם אברונין (על פי שיר ביידיש של מרדכי ריבסמן)', composer: 'לחן עממי',
    desc: 'הגרסה העברית לשיר היידי "חנוכה, אוי חנוכה". שיר שמח על שמונת ימי החג, ששרים אותו בבתים כבר יותר ממאה שנה.',
    clue: '📅 8️⃣ 🕎 🎉', hint: 'שמונה הימים של החג, כולם יחד',
  },
  {
    slug: 'mi-yemalel', title: 'מי ימלל', emoji: '💪', age: 'school',
    lyricist: 'מנשה רבינא', composer: 'לחן עממי',
    desc: 'שיר על גבורת המכבים ועל גיבורי ישראל בכל הדורות. נוהגים לשיר אותו בקאנון — שתי קבוצות, אחת אחרי השנייה — וזה אתגר נהדר לכיתה.',
    clue: '❓ 🗣️ 💪 🛡️', hint: 'שאלה: מי יספר על הגבורות?',
  },
  {
    slug: 'anu-nosim-lapidim', title: 'אנו נושאים לפידים', emoji: '🔥', age: 'school',
    lyricist: 'אהרן זאב', composer: 'מרדכי זעירא',
    desc: 'שיר לכת ציוני משנות השלושים, שנכתב לתהלוכת חנוכה. השיר מחבר את אור החג לעבודת החלוצים בארץ, ומתאים לילדים גדולים יותר.',
    clue: '🔥 🔥 🚶 🌙', hint: 'צועדים בלילה ומחזיקים אש ביד',
  },
  {
    slug: 'mi-yadlik', title: 'מי ידליק', emoji: '💡', age: 'school',
    lyricist: 'נעמי שמר', composer: 'נעמי שמר',
    desc: 'שיר של נעמי שמר על אור שמנצח את החושך, בהשראת הפסוק מספר ישעיהו "הָעָם הַהֹלְכִים בַּחֹשֶׁךְ רָאוּ אוֹר גָּדוֹל". הוא רגוע ומרגש, ומתאים לרגע שקט ליד החנוכייה עם ילדים בוגרים יותר.',
    clue: '❓ 🔥 🕯️ 🌑', hint: 'שאלה: מי ידליק את האור?',
  },
  {
    slug: 'maoz-tzur', title: 'מעוז צור', emoji: '🪨', age: 'all', pd: true,
    lyricist: 'פיוט מימי הביניים (המחבר חתום בשם "מרדכי")', composer: 'לחן אשכנזי מסורתי',
    desc: 'הפיוט הקלאסי של חנוכה, שנכתב באשכנז בימי הביניים. רוב הבתים מספרים על הצלה אחרת של עם ישראל, והבית החמישי מוקדש לנס חנוכה. המילים מופיעות כאן במלואן — הפיוט נחלת הכלל.',
    clue: '🪨 🛡️ 🙏 🎶', hint: 'סלע חזק ומגן — פיוט עתיק',
  },
  {
    slug: 'haneirot-halalu', title: 'הנרות הללו', emoji: '👉', age: 'all', pd: true,
    lyricist: 'נוסח מסורתי (מקורו במסכת סופרים)', composer: 'כמה לחנים מוכרים',
    desc: 'הקטע שאומרים או שרים מיד אחרי ההדלקה: הנרות נועדו להסתכל עליהם ולהודות על הנסים, ולא לשימוש. המילים מופיעות כאן במלואן — זהו נוסח מסורתי שהוא נחלת הכלל.',
    clue: '🕯️ 👉 👀', hint: 'מצביעים על הנרות שהדלקנו עכשיו',
  },
]

// ── Public-domain texts ─────────────────────────────
export const BLESSINGS = [
  { text: 'בָּרוּךְ אַתָּה ה׳ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, אֲשֶׁר קִדְּשָׁנוּ בְּמִצְוֹתָיו וְצִוָּנוּ לְהַדְלִיק נֵר חֲנֻכָּה.', when: 'בכל ערב' },
  { text: 'בָּרוּךְ אַתָּה ה׳ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁעָשָׂה נִסִּים לַאֲבוֹתֵינוּ בַּיָּמִים הָהֵם בַּזְּמַן הַזֶּה.', when: 'בכל ערב' },
  { text: 'בָּרוּךְ אַתָּה ה׳ אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם, שֶׁהֶחֱיָנוּ וְקִיְּמָנוּ וְהִגִּיעָנוּ לַזְּמַן הַזֶּה.', when: 'רק בערב הראשון', firstNightOnly: true },
]

// Ashkenazi version, as printed in common siddurim (other communities word it slightly differently).
export const HANEIROT_HALALU = 'הַנֵּרוֹת הַלָּלוּ אָנוּ מַדְלִיקִין עַל הַנִּסִּים וְעַל הַנִּפְלָאוֹת וְעַל הַתְּשׁוּעוֹת וְעַל הַמִּלְחָמוֹת, שֶׁעָשִׂיתָ לַאֲבוֹתֵינוּ בַּיָּמִים הָהֵם בַּזְּמַן הַזֶּה, עַל יְדֵי כֹּהֲנֶיךָ הַקְּדוֹשִׁים. וְכָל שְׁמוֹנַת יְמֵי חֲנֻכָּה הַנֵּרוֹת הַלָּלוּ קֹדֶשׁ הֵם, וְאֵין לָנוּ רְשׁוּת לְהִשְׁתַּמֵּשׁ בָּהֶם אֶלָּא לִרְאוֹתָם בִּלְבָד, כְּדֵי לְהוֹדוֹת וּלְהַלֵּל לְשִׁמְךָ הַגָּדוֹל עַל נִסֶּיךָ וְעַל נִפְלְאוֹתֶיךָ וְעַל יְשׁוּעָתֶךָ.'

// The first stanza (sung in most homes) and the fifth — the Hanukkah stanza.
export const MAOZ_TZUR = [
  {
    label: 'הבית הראשון',
    lines: [
      'מָעוֹז צוּר יְשׁוּעָתִי, לְךָ נָאֶה לְשַׁבֵּחַ,',
      'תִּכּוֹן בֵּית תְּפִלָּתִי, וְשָׁם תּוֹדָה נְזַבֵּחַ.',
      'לְעֵת תָּכִין מַטְבֵּחַ מִצָּר הַמְנַבֵּחַ,',
      'אָז אֶגְמֹר בְּשִׁיר מִזְמוֹר חֲנֻכַּת הַמִּזְבֵּחַ.',
    ],
  },
  {
    label: 'הבית החמישי — בית החנוכה',
    lines: [
      'יְוָנִים נִקְבְּצוּ עָלַי, אֲזַי בִּימֵי חַשְׁמַנִּים,',
      'וּפָרְצוּ חוֹמוֹת מִגְדָּלַי, וְטִמְּאוּ כָּל הַשְּׁמָנִים,',
      'וּמִנּוֹתַר קַנְקַנִּים נַעֲשָׂה נֵס לַשּׁוֹשַׁנִּים,',
      'בְּנֵי בִינָה יְמֵי שְׁמוֹנָה קָבְעוּ שִׁיר וּרְנָנִים.',
    ],
  },
]

// ── Helpers ─────────────────────────────
export const youtubeSearchUrl = song =>
  'https://www.youtube.com/results?search_query=' + encodeURIComponent(`${song.title} שיר חנוכה`)

export const ageOf = id => SONG_AGES.find(a => a.id === id)

export const songsForAge = age => (age ? HANUKKAH_SONGS.filter(s => s.age === age || s.age === 'all') : HANUKKAH_SONGS)

export const creditLine = s => s.lyricist === s.composer ? `מילים ולחן: ${s.lyricist}` : `מילים: ${s.lyricist} · לחן: ${s.composer}`

// Small seeded PRNG so the game is reproducible in tests and identical in the prerendered snapshot.
export function rng(seed = 1) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

export function shuffle(list, rand = Math.random) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}

// One round of "guess the song": every song once, each with the right title + (n-1) other titles.
export function makeGame(seed = 1, n = 4, songs = HANUKKAH_SONGS) {
  const rand = rng(seed)
  return shuffle(songs, rand).map(song => {
    const others = shuffle(songs.filter(s => s.slug !== song.slug), rand).slice(0, n - 1)
    return { slug: song.slug, clue: song.clue, hint: song.hint, answer: song.title, options: shuffle([song, ...others], rand).map(s => s.title) }
  })
}

// English reading with a tap-to-translate dictionary: /learn/english-reading.
// 30 original graded texts, 6 per grade band. Every word on the page can be tapped: the story's own
// glossary first, then the site's built-in dictionary (src/data/dictionary through utils/wordMeaning).
// Each text: slug, band, title, emoji, genre (Hebrew), summary (Hebrew), paragraphs (English),
// glossary [[english as it appears in the text, Hebrew]], questions [{ q, options, answer, explain }].
// tests/english-reading.test.mjs checks word counts per band, glossary words in the text and answers.

export const READING_PATH = '/learn/english-reading'

export const READING_BANDS = [
  { id: 'g3-4', label: 'כיתות ג׳–ד׳', short: 'ג׳–ד׳', emoji: '🌱', words: [40, 80], desc: 'טקסטים קצרצרים במשפטים פשוטים, בזמן הווה, עם מילים מהיום־יום.' },
  { id: 'g5-6', label: 'כיתות ה׳–ו׳', short: 'ה׳–ו׳', emoji: '🌿', words: [90, 150], desc: 'סיפורים, משלים, מכתבים וטקסטי מידע קצרים — גם בזמן עבר.' },
  { id: 'g7-8', label: 'כיתות ז׳–ח׳', short: 'ז׳–ח׳', emoji: '🌳', words: [150, 220], desc: 'טקסטים באורך בינוני על טבע, חלל וישראל, יומנים ומיילים.' },
  { id: 'g9', label: 'כיתה ט׳', short: 'ט׳', emoji: '🍀', words: [220, 300], desc: 'ברמת סוף חטיבת הביניים: טקסטי מידע, משל, יומן ומכתב.' },
  { id: 'g10-12', label: 'כיתות י׳–י״ב', short: 'י׳–י״ב', emoji: '🎓', words: [300, 400], desc: 'טקסטים ארוכים לקראת הבגרות: מאמרי מידע, מאמר דעה וסיפורים קצרים.' },
]

const RAW = [
  // ── ג׳–ד׳ ──
  {
    slug: 'my-cat-mitzi', band: 'g3-4', title: 'My Cat Mitzi', emoji: '🐱', genre: 'סיפור',
    summary: 'ילד מספר על החתולה שלו, מיצי: איך היא נראית ומה היא עושה כל יום.',
    paragraphs: [
      'I have a cat. Her name is Mitzi. Mitzi is small and gray. She has green eyes and a long tail.',
      'Every morning, Mitzi sits on my bed. She wants her breakfast! I give her fish and water. Then she plays with a red ball.',
      'At night, Mitzi sleeps next to me. I love my cat, and my cat loves me.',
    ],
    glossary: [['cat', 'חתול, חתולה'], ['small', 'קטנה'], ['gray', 'אפורה'], ['eyes', 'עיניים'], ['tail', 'זנב'], ['morning', 'בוקר'], ['breakfast', 'ארוחת בוקר'], ['plays', 'משחקת'], ['ball', 'כדור'], ['sleeps', 'ישנה'], ['next to', 'ליד']],
    questions: [
      { q: 'What color is Mitzi?', options: ['black', 'gray', 'white', 'orange'], answer: 1, explain: 'כתוב: "Mitzi is small and gray" — מיצי קטנה ואפורה.' },
      { q: 'Where does Mitzi sit every morning?', options: ['on the table', 'in the garden', 'on my bed', 'on the sofa'], answer: 2, explain: 'כתוב: "Every morning, Mitzi sits on my bed" — על המיטה.' },
      { q: 'What does Mitzi play with?', options: ['a red ball', 'a box', 'a pencil', 'a green hat'], answer: 0, explain: 'כתוב: "she plays with a red ball" — כדור אדום.' },
    ],
  },
  {
    slug: 'the-lion-and-the-mouse', band: 'g3-4', title: 'The Lion and the Mouse', emoji: '🦁', genre: 'משל',
    summary: 'משל קצר: עכבר קטן מעיר אריה גדול — ואחר כך דווקא הוא מציל אותו.',
    paragraphs: [
      'A big lion is sleeping under a tree. A little mouse runs on his nose. The lion wakes up. He is angry!',
      '"Please don\'t eat me," says the mouse. "One day I can help you." The lion laughs, but he lets the mouse go.',
      'The next week, the lion is in a net. He can\'t get out. The little mouse comes and cuts the net with her teeth. The lion is free. Small friends can be great friends!',
    ],
    glossary: [['lion', 'אריה'], ['sleeping', 'ישן'], ['under', 'מתחת ל־'], ['mouse', 'עכבר'], ['nose', 'אף'], ['wakes up', 'מתעורר'], ['angry', 'כועס'], ['laughs', 'צוחק'], ['lets', 'נותן ל־, מרשה'], ['net', 'רשת'], ['cuts', 'חותכת'], ['teeth', 'שיניים'], ['free', 'חופשי']],
    questions: [
      { q: 'Why is the lion angry?', options: ['He is hungry.', 'The mouse runs on his nose.', 'It is raining.', 'He is in a net.'], answer: 1, explain: 'העכבר רץ על האף של האריה והעיר אותו — לכן הוא כועס.' },
      { q: 'How does the mouse help the lion?', options: ['She brings him food.', 'She calls his friends.', 'She cuts the net with her teeth.', 'She sings to him.'], answer: 2, explain: 'כתוב: "cuts the net with her teeth" — היא חותכת את הרשת בשיניים.' },
      { q: 'What is the lesson of the story?', options: ['Small friends can be great friends.', 'Lions are always angry.', 'Mice like to sleep.', 'Never go outside.'], answer: 0, explain: 'המשפט האחרון הוא המוסר: גם חבר קטן יכול להיות חבר גדול.' },
    ],
  },
  {
    slug: 'a-day-at-the-beach', band: 'g3-4', title: 'A Day at the Beach', emoji: '🏖️', genre: 'סיפור',
    summary: 'משפחה יוצאת ליום כיף בחוף בתל אביב: ארמון חול, אבטיח ושקיעה בים.',
    paragraphs: [
      'Today is hot, so we go to the beach in Tel Aviv. The sand is yellow and the sea is blue.',
      'My brother and I build a big sand castle. Dad swims in the sea, and Mom reads a book under an umbrella. We eat watermelon and drink cold water.',
      'In the evening, the sun goes down into the sea. The sky is orange and pink. What a beautiful day!',
    ],
    glossary: [['hot', 'חם'], ['beach', 'חוף ים'], ['sand', 'חול'], ['sea', 'ים'], ['brother', 'אח'], ['build', 'בונים'], ['castle', 'ארמון, טירה'], ['swims', 'שוחה'], ['umbrella', 'שמשייה, מטרייה'], ['watermelon', 'אבטיח'], ['evening', 'ערב'], ['sky', 'שמיים'], ['beautiful', 'יפה'], ['Tel Aviv', 'תל אביב']],
    questions: [
      { q: 'Why does the family go to the beach?', options: ['It is cold.', 'It is raining.', 'It is a birthday.', 'It is hot.'], answer: 3, explain: 'כתוב: "Today is hot, so we go to the beach" — כי חם היום.' },
      { q: 'What does Mom do?', options: ['She swims.', 'She reads a book.', 'She builds a castle.', 'She sleeps.'], answer: 1, explain: 'כתוב: "Mom reads a book under an umbrella" — אמא קוראת ספר.' },
      { q: 'What color is the sky in the evening?', options: ['orange and pink', 'blue and white', 'black', 'green'], answer: 0, explain: 'כתוב: "The sky is orange and pink" — כתום וורוד.' },
    ],
  },
  {
    slug: 'camels-in-the-negev', band: 'g3-4', title: 'Camels', emoji: '🐪', genre: 'טקסט מידע',
    summary: 'טקסט מידע קצר על גמלים: איפה הם חיים, מה יש בדבשת ולמה קוראים להם ספינת המדבר.',
    paragraphs: [
      'Camels live in the desert. In Israel, you can see camels in the Negev.',
      'A camel is a big animal with long legs. Some camels have one hump, and some have two. The hump is full of fat, not water. The fat helps the camel live when there is no food.',
      'Camels can walk for days without water. People call the camel "the ship of the desert."',
    ],
    glossary: [['camels', 'גמלים'], ['desert', 'מדבר'], ['animal', 'בעל חיים'], ['legs', 'רגליים'], ['hump', 'דבשת'], ['full of', 'מלא ב־'], ['fat', 'שומן'], ['helps', 'עוזר'], ['food', 'אוכל'], ['without', 'בלי'], ['ship', 'ספינה'], ['Negev', 'הנגב'], ['Israel', 'ישראל']],
    questions: [
      { q: 'Where can you see camels in Israel?', options: ['in Tel Aviv', 'in the Negev', 'in the sea', 'in the snow'], answer: 1, explain: 'כתוב: "you can see camels in the Negev" — בנגב.' },
      { q: 'What is in the hump?', options: ['water', 'milk', 'fat', 'sand'], answer: 2, explain: 'כתוב: "The hump is full of fat, not water" — שומן ולא מים. זו טעות נפוצה!' },
      { q: 'What do people call the camel?', options: ['the king of the desert', 'the ship of the desert', 'the car of the desert', 'the star of the desert'], answer: 1, explain: 'קוראים לגמל "ספינת המדבר" — the ship of the desert.' },
    ],
  },
  {
    slug: 'hanukkah-lights', band: 'g3-4', title: 'Hanukkah Lights', emoji: '🕎', genre: 'סיפור',
    summary: 'ילד מספר על חנוכה בבית: מדליקים נרות בחנוכייה, משחקים בסביבון ואוכלים סופגניות.',
    paragraphs: [
      'It is Hanukkah! Hanukkah is eight days long. Every night, we light candles in the hanukkiah.',
      'On the first night, we light one candle. On the second night, we light two candles. On the last night, there are eight candles, and the window is full of light.',
      'We sing songs and play with a dreidel. Grandma makes hot sufganiyot. I love the sweet jam inside!',
    ],
    glossary: [['eight', 'שמונה'], ['days', 'ימים'], ['light', 'מדליקים; אור'], ['candles', 'נרות'], ['hanukkiah', 'חנוכייה'], ['first', 'ראשון'], ['second', 'שני'], ['last', 'אחרון'], ['window', 'חלון'], ['dreidel', 'סביבון'], ['sufganiyot', 'סופגניות'], ['sweet', 'מתוקה'], ['jam', 'ריבה'], ['inside', 'בפנים'], ['Hanukkah', 'חנוכה']],
    questions: [
      { q: 'How many days is Hanukkah?', options: ['two', 'seven', 'eight', 'ten'], answer: 2, explain: 'כתוב: "Hanukkah is eight days long" — שמונה ימים.' },
      { q: 'How many candles do we light on the second night?', options: ['one', 'two', 'three', 'eight'], answer: 1, explain: 'כתוב: "On the second night, we light two candles" — שני נרות (בלי השמש).' },
      { q: 'What does Grandma make?', options: ['a cake', 'sufganiyot', 'pizza', 'soup'], answer: 1, explain: 'כתוב: "Grandma makes hot sufganiyot" — סבתא מכינה סופגניות חמות.' },
    ],
  },
  {
    slug: 'my-birthday-diary', band: 'g3-4', title: 'My Birthday', emoji: '🎂', genre: 'יומן',
    summary: 'יוני כותב ביומן על יום ההולדת התשיעי שלו: כתר בכיתה, מסיבה בפארק ומתנה מחברה.',
    paragraphs: [
      'Dear Diary,',
      'Today is my birthday. I am nine years old! In the morning, my friends sing to me at school. My teacher gives me a crown.',
      'After school, we have a party in the park. We play games and eat chocolate cake. My best friend, Noa, gives me a book about dinosaurs.',
      'Now I am in bed. I am tired, but I am very happy. Good night, Diary! Love, Yoni',
    ],
    glossary: [['diary', 'יומן'], ['birthday', 'יום הולדת'], ['nine', 'תשע'], ['years old', 'בן ... (שנים)'], ['friends', 'חברים'], ['sing', 'שרים'], ['teacher', 'מורה'], ['crown', 'כתר'], ['party', 'מסיבה'], ['games', 'משחקים'], ['cake', 'עוגה'], ['best friend', 'החבר/ה הכי טוב/ה'], ['dinosaurs', 'דינוזאורים'], ['tired', 'עייף']],
    questions: [
      { q: 'How old is Yoni today?', options: ['eight', 'nine', 'ten', 'seven'], answer: 1, explain: 'כתוב: "I am nine years old" — הוא בן תשע.' },
      { q: 'Where is the party?', options: ['in the park', 'at school', 'at the beach', 'at Noa\'s house'], answer: 0, explain: 'כתוב: "we have a party in the park" — המסיבה בפארק.' },
      { q: 'What does Noa give Yoni?', options: ['a crown', 'a cake', 'a book about dinosaurs', 'a ball'], answer: 2, explain: 'כתוב: "gives me a book about dinosaurs" — ספר על דינוזאורים. את הכתר נותנת המורה.' },
      { q: 'How does Yoni feel at night?', options: ['sad and angry', 'tired but happy', 'hungry', 'afraid'], answer: 1, explain: 'כתוב: "I am tired, but I am very happy" — עייף אבל שמח מאוד.' },
    ],
  },

  // ── ה׳–ו׳ ──
  {
    slug: 'the-ant-and-the-grasshopper', band: 'g5-6', title: 'The Ant and the Grasshopper', emoji: '🐜', genre: 'משל',
    summary: 'משל על נמלה חרוצה שמתכוננת לחורף וחגב שרק שר ורוקד — ומה קורה כשהחורף מגיע.',
    paragraphs: [
      'It was a hot summer day. A grasshopper sat in the green field and played music all day. He sang and danced in the sun.',
      'Near him, a small ant worked very hard. She carried seeds and grains of wheat to her home under the ground.',
      '"Why are you working so hard?" asked the grasshopper. "Come and sing with me!" "I am getting ready for winter," said the ant. "You should do the same." The grasshopper only laughed. "Winter is far away," he said.',
      'Then winter came. The field was cold and wet, and there was no food. The hungry grasshopper knocked on the ant\'s door. The ant gave him some food, and the grasshopper learned an important lesson: get ready today for tomorrow.',
    ],
    glossary: [['grasshopper', 'חגב'], ['field', 'שדה'], ['danced', 'רקד'], ['ant', 'נמלה'], ['worked', 'עבדה'], ['carried', 'נשאה, סחבה'], ['seeds', 'זרעים'], ['grains', 'גרגירים'], ['wheat', 'חיטה'], ['ground', 'אדמה'], ['getting ready', 'מתכוננת'], ['winter', 'חורף'], ['far away', 'רחוק'], ['hungry', 'רעב'], ['knocked', 'דפק (על הדלת)'], ['lesson', 'לקח, שיעור']],
    questions: [
      { q: 'What did the grasshopper do in the summer?', options: ['He worked hard.', 'He played music, sang and danced.', 'He built a house.', 'He slept all day.'], answer: 1, explain: 'החגב "played music all day. He sang and danced" — ניגן, שר ורקד.' },
      { q: 'Where did the ant carry the seeds?', options: ['to her home under the ground', 'to the river', 'to the grasshopper', 'to the market'], answer: 0, explain: 'כתוב: "to her home under the ground" — לבית שלה מתחת לאדמה.' },
      { q: 'Why did the grasshopper knock on the ant\'s door?', options: ['He wanted to sing.', 'He was hungry and had no food.', 'He was lost.', 'It was his birthday.'], answer: 1, explain: 'בחורף לא היה אוכל בשדה, והחגב היה רעב — "The hungry grasshopper knocked".' },
      { q: 'What is the lesson of the story?', options: ['Music is bad.', 'Ants are stronger than grasshoppers.', 'Get ready today for tomorrow.', 'Winter is far away.'], answer: 2, explain: 'המוסר כתוב בסוף: "get ready today for tomorrow" — להתכונן היום למחר.' },
    ],
  },
  {
    slug: 'the-moon', band: 'g5-6', title: 'Our Neighbor, the Moon', emoji: '🌙', genre: 'טקסט מידע',
    summary: 'טקסט מידע על הירח: למה הוא "משנה צורה", למה אין עליו חיים ומי הלך עליו.',
    paragraphs: [
      'Look up at the night sky. The brightest thing you can see there is usually the Moon. The Moon is Earth\'s neighbor in space. It travels around the Earth, and one trip takes about 27 days.',
      'The Moon does not make its own light. It is like a big mirror: the light of the Sun shines on it, and we see that light. That is why the Moon seems to change its shape. Sometimes we see a full circle, sometimes half, and sometimes only a thin line.',
      'There is no air and no water on the Moon, so nothing can live there. In 1969, two American astronauts, Neil Armstrong and Buzz Aldrin, walked on the Moon. Their footprints are still there, because there is no wind to blow them away.',
    ],
    glossary: [['brightest', 'הכי בהיר, המאיר ביותר'], ['usually', 'בדרך כלל'], ['neighbor', 'שכן'], ['space', 'חלל'], ['travels', 'נע, מטייל'], ['trip', 'מסע, סיבוב'], ['own', 'משלו'], ['mirror', 'מראה'], ['shines', 'זורח, מאיר'], ['seems', 'נראה כאילו'], ['shape', 'צורה'], ['circle', 'עיגול'], ['thin', 'דק'], ['astronauts', 'אסטרונאוטים'], ['footprints', 'עקבות, טביעות רגליים'], ['blow', 'לנשוף, להעיף ברוח'], ['Moon', 'הירח'], ['Earth', 'כדור הארץ']],
    questions: [
      { q: 'How long does one trip of the Moon around the Earth take?', options: ['one day', 'about 7 days', 'about 27 days', 'one year'], answer: 2, explain: 'כתוב: "one trip takes about 27 days" — בערך 27 יום.' },
      { q: 'Why do we see the Moon at night?', options: ['It makes its own light.', 'The light of the Sun shines on it.', 'It is on fire.', 'The stars light it.'], answer: 1, explain: 'לירח אין אור משלו. הוא כמו מראה — אור השמש פוגע בו ואנחנו רואים אותו.' },
      { q: 'Why can\'t anything live on the Moon?', options: ['It is too small.', 'There is no air and no water.', 'It is too far.', 'It is too dark.'], answer: 1, explain: 'כתוב: "There is no air and no water on the Moon, so nothing can live there".' },
      { q: 'Why are the astronauts\' footprints still on the Moon?', options: ['There is no wind.', 'They are made of stone.', 'People clean them.', 'It always rains there.'], answer: 0, explain: 'כתוב: "because there is no wind to blow them away" — אין רוח שתמחק אותן.' },
    ],
  },
  {
    slug: 'a-letter-from-the-kibbutz', band: 'g5-6', title: 'A Letter from the Kibbutz', emoji: '✉️', genre: 'מכתב',
    summary: 'סבתא רינה כותבת לנכדה תמר מהקיבוץ: על הגשם הראשון, קטיף אבוקדו ולול חדש.',
    paragraphs: [
      'Dear Tamar,',
      'How are you? I miss you very much. Here on the kibbutz, autumn has started. The mornings are cool, and the first rain fell last night. The air smells clean and fresh.',
      'This week I worked in the avocado orchard. The trees are full of green fruit, and we picked boxes and boxes of avocados. In the evening, I was so tired that I fell asleep on the sofa before the news!',
      'Your grandfather is building a new chicken coop. He says the chickens need a bigger house. I think he talks to them more than he talks to me.',
      'When you come to visit at Hanukkah, we can make latkes together. Write back soon!',
      'Love and hugs, Grandma Rina',
    ],
    glossary: [['miss', 'מתגעגעת'], ['kibbutz', 'קיבוץ'], ['autumn', 'סתיו'], ['cool', 'קריר'], ['rain', 'גשם'], ['fell', 'ירד, נפל'], ['smells', 'מריח'], ['fresh', 'רענן'], ['avocado', 'אבוקדו'], ['orchard', 'מטע, פרדס'], ['picked', 'קטפנו'], ['fell asleep', 'נרדמתי'], ['grandfather', 'סבא'], ['chicken coop', 'לול'], ['latkes', 'לביבות'], ['hugs', 'חיבוקים'], ['Hanukkah', 'חנוכה']],
    questions: [
      { q: 'What season is it on the kibbutz?', options: ['summer', 'autumn', 'spring', 'winter'], answer: 1, explain: 'כתוב: "autumn has started" — הסתיו התחיל.' },
      { q: 'Why did Grandma fall asleep on the sofa?', options: ['She was sick.', 'She was very tired after work.', 'The news was boring.', 'She was cold.'], answer: 1, explain: 'היא עבדה במטע ו"was so tired that I fell asleep" — הייתה עייפה מאוד.' },
      { q: 'What is Grandpa building?', options: ['a new house for the family', 'a chicken coop', 'a sofa', 'a boat'], answer: 1, explain: 'כתוב: "Your grandfather is building a new chicken coop" — לול חדש.' },
      { q: 'What can Tamar and Grandma do at Hanukkah?', options: ['pick avocados', 'make latkes', 'go to the beach', 'watch the news'], answer: 1, explain: 'כתוב: "we can make latkes together" — להכין יחד לביבות.' },
    ],
  },
  {
    slug: 'the-hoopoe', band: 'g5-6', title: 'The Hoopoe: Israel\'s National Bird', emoji: '🐦', genre: 'טקסט מידע',
    summary: 'טקסט מידע על הדוכיפת: איך נבחרה לציפור הלאומית, איך היא נראית ומה היא אוכלת.',
    paragraphs: [
      'In 2008, Israel chose a national bird. Thousands of people voted, and the winner was the hoopoe. In Hebrew, its name is duchifat.',
      'The hoopoe is easy to recognize. It has orange-brown feathers, black and white stripes on its wings, and a long, thin beak. On its head, it has a crown of feathers. When the bird is excited or afraid, the crown opens like a fan.',
      'Hoopoes live in fields, parks and gardens all over Israel. They walk on the ground and use their long beaks to look for insects and worms in the soil. Their call sounds like "oop-oop-oop," and that is how the bird got its English name.',
    ],
    glossary: [['chose', 'בחרה'], ['national', 'לאומי'], ['thousands', 'אלפים'], ['voted', 'הצביעו'], ['winner', 'המנצח/ת'], ['hoopoe', 'דוכיפת'], ['recognize', 'לזהות'], ['feathers', 'נוצות'], ['stripes', 'פסים'], ['wings', 'כנפיים'], ['beak', 'מקור'], ['excited', 'נרגש'], ['afraid', 'מפחד'], ['fan', 'מניפה'], ['insects', 'חרקים'], ['worms', 'תולעים'], ['soil', 'אדמה'], ['call', 'קריאה (של ציפור)'], ['oop', 'קול הקריאה של הדוכיפת'], ['duchifat', 'דוכיפת (השם בעברית)']],
    questions: [
      { q: 'How did the hoopoe become Israel\'s national bird?', options: ['The king chose it.', 'Thousands of people voted for it.', 'It was the biggest bird.', 'It lives only in Israel.'], answer: 1, explain: 'כתוב: "Thousands of people voted, and the winner was the hoopoe" — אלפי אנשים הצביעו.' },
      { q: 'What happens when the hoopoe is afraid?', options: ['It sings loudly.', 'Its crown opens like a fan.', 'It changes color.', 'It flies to the sea.'], answer: 1, explain: 'כתוב: "the crown opens like a fan" — הכתר נפתח כמו מניפה.' },
      { q: 'What does the hoopoe eat?', options: ['fish', 'insects and worms', 'fruit', 'seeds only'], answer: 1, explain: 'הדוכיפת מחפשת באדמה "insects and worms" — חרקים ותולעים.' },
      { q: 'Where does the English name "hoopoe" come from?', options: ['from its call', 'from its colors', 'from a king', 'from Hebrew'], answer: 0, explain: 'הקריאה שלה נשמעת "oop-oop-oop", ומכאן השם האנגלי.' },
    ],
  },
  {
    slug: 'lost-in-the-market', band: 'g5-6', title: 'Lost in the Market', emoji: '🍉', genre: 'סיפור',
    summary: 'אלה הולכת לאיבוד בשוק מחנה יהודה — וזוכרת בדיוק מה צריך לעשות.',
    paragraphs: [
      'On Friday morning, Ella went to the Machane Yehuda market in Jerusalem with her father. The market was full of people, noise and wonderful smells. There were piles of red tomatoes, yellow lemons and sweet dates.',
      'Ella stopped to look at a man who was making fresh pita bread. When she turned around, her father was gone! Her heart started to beat fast. Where was he?',
      'Ella remembered what her parents always told her: "If you get lost, stay in one place and ask a seller for help." She went to the woman at the spice stall and told her what happened. The woman gave her some water and called out loudly.',
      'A minute later, Ella\'s father ran to them. He hugged her. "You did exactly the right thing," he said. Then they bought some cinnamon from the kind woman to say thank you.',
    ],
    glossary: [['market', 'שוק'], ['noise', 'רעש'], ['wonderful', 'נפלאים'], ['smells', 'ריחות'], ['piles', 'ערימות'], ['tomatoes', 'עגבניות'], ['lemons', 'לימונים'], ['dates', 'תמרים'], ['turned around', 'הסתובבה'], ['gone', 'נעלם, איננו'], ['heart', 'לב'], ['beat', 'לפעום, להלום'], ['lost', 'אבוד, הולך לאיבוד'], ['seller', 'מוכר'], ['spice', 'תבלין'], ['stall', 'דוכן'], ['loudly', 'בקול רם'], ['hugged', 'חיבק'], ['exactly', 'בדיוק'], ['cinnamon', 'קינמון'], ['kind', 'נחמדה, טובת לב'], ['Machane Yehuda', 'מחנה יהודה'], ['Jerusalem', 'ירושלים']],
    questions: [
      { q: 'Why did Ella stop?', options: ['She was tired.', 'She wanted to look at a man making pita bread.', 'She wanted to buy dates.', 'She saw a friend.'], answer: 1, explain: 'כתוב: "Ella stopped to look at a man who was making fresh pita bread".' },
      { q: 'What did Ella\'s parents tell her to do if she gets lost?', options: ['Run home.', 'Call the police.', 'Stay in one place and ask a seller for help.', 'Look for a taxi.'], answer: 2, explain: 'ההורים אמרו: "stay in one place and ask a seller for help" — לעמוד במקום ולבקש עזרה ממוכר.' },
      { q: 'How did Ella and her father thank the woman?', options: ['They gave her flowers.', 'They bought cinnamon from her.', 'They wrote her a letter.', 'They gave her money.'], answer: 1, explain: 'כתוב: "they bought some cinnamon from the kind woman to say thank you".' },
      { q: 'What does "her heart started to beat fast" show?', options: ['She was happy.', 'She was afraid.', 'She was bored.', 'She was hungry.'], answer: 1, explain: 'הלב דופק מהר כשמפחדים — אלה נבהלה כשאבא נעלם.' },
    ],
  },
  {
    slug: 'my-new-bike', band: 'g5-6', title: 'Dear Diary: My New Bike', emoji: '🚲', genre: 'יומן',
    summary: 'ילדה כותבת ביומן על האופניים החדשים שקיבלה ליום ההולדת ועל הרכיבה הראשונה עם אחיה.',
    paragraphs: [
      'Dear Diary,',
      'Today was the best day of the year. For my eleventh birthday, my parents gave me a new bike! It is blue and silver, and it has seven gears. I wanted it for a very long time.',
      'After lunch, my brother Omer and I rode to the park near our house. At first I was a little nervous, because the new bike is bigger than my old one. I almost fell when I turned a corner. But after ten minutes, I felt like a professional rider.',
      'Omer showed me how to use the gears on the hill. Going up was hard, but going down was amazing. The wind was in my face, and I laughed all the way.',
      'Tomorrow I want to ride to school. Mom says I must always wear my helmet, and she is right. Good night!',
    ],
    glossary: [['eleventh', 'האחד־עשר'], ['parents', 'הורים'], ['bike', 'אופניים'], ['silver', 'כסוף'], ['gears', 'הילוכים'], ['lunch', 'ארוחת צהריים'], ['rode', 'רכבנו'], ['at first', 'בהתחלה'], ['nervous', 'לחוצה, מתוחה'], ['almost', 'כמעט'], ['corner', 'פינה'], ['professional', 'מקצועי/ת'], ['rider', 'רוכב/ת'], ['hill', 'גבעה'], ['amazing', 'מדהים'], ['wind', 'רוח'], ['helmet', 'קסדה']],
    questions: [
      { q: 'Why did the writer get a new bike?', options: ['for Hanukkah', 'for her eleventh birthday', 'because her old bike broke', 'for good grades'], answer: 1, explain: 'כתוב: "For my eleventh birthday, my parents gave me a new bike".' },
      { q: 'Why was she nervous at first?', options: ['The new bike is bigger than her old one.', 'It was raining.', 'Omer was angry.', 'She had no helmet.'], answer: 0, explain: 'כתוב: "because the new bike is bigger than my old one".' },
      { q: 'What did Omer teach her?', options: ['how to fix a bike', 'how to use the gears on the hill', 'how to ride without hands', 'the way to school'], answer: 1, explain: 'כתוב: "Omer showed me how to use the gears on the hill".' },
      { q: 'What does Mom say?', options: ['Don\'t ride to school.', 'Always wear your helmet.', 'Ride only in the park.', 'Go to bed early.'], answer: 1, explain: 'כתוב: "Mom says I must always wear my helmet" — תמיד לחבוש קסדה.' },
    ],
  },

  // ── ז׳–ח׳ ──
  {
    slug: 'the-dead-sea', band: 'g7-8', title: 'The Dead Sea', emoji: '🌊', genre: 'טקסט מידע',
    summary: 'טקסט מידע על ים המלח: המקום הנמוך ביבשה, למה צפים בו, למה הוא "מת" ולמה הוא מתייבש.',
    paragraphs: [
      'The Dead Sea is one of the most unusual places on Earth. It lies on the border between Israel and Jordan, and its shore is the lowest place on land — more than 430 meters below sea level.',
      'The water of the Dead Sea is about ten times saltier than the water of the ocean. Because of all this salt, the water is very heavy, and people do not sink in it. Visitors simply lie on their backs and float, and many of them take a funny photo while they read a newspaper on the water.',
      'The sea got its name because fish and plants cannot live in such salty water. However, it is not completely dead: scientists have found tiny bacteria that live there.',
      'Sadly, the Dead Sea is getting smaller. Its water level drops by about one meter every year, mostly because people use the water of the Jordan River before it reaches the sea. Scientists and governments are looking for ways to save this special place.',
    ],
    glossary: [['unusual', 'יוצא דופן, מיוחד'], ['lies', 'שוכן, נמצא'], ['border', 'גבול'], ['shore', 'חוף'], ['lowest', 'הנמוך ביותר'], ['below sea level', 'מתחת לפני הים'], ['saltier', 'מלוח יותר'], ['ocean', 'אוקיינוס'], ['heavy', 'כבד'], ['sink', 'לשקוע'], ['float', 'לצוף'], ['salty', 'מלוח'], ['completely', 'לגמרי'], ['tiny', 'זעירים'], ['bacteria', 'חיידקים'], ['level', 'מפלס'], ['drops', 'יורד'], ['reaches', 'מגיע ל־'], ['governments', 'ממשלות'], ['Jordan', 'ירדן'], ['Jordan River', 'נהר הירדן']],
    questions: [
      { q: 'What is special about the shore of the Dead Sea?', options: ['It is the hottest place in the world.', 'It is the lowest place on land.', 'It has the biggest waves.', 'It is covered with snow.'], answer: 1, explain: 'כתוב: "its shore is the lowest place on land" — המקום הנמוך ביותר ביבשה.' },
      { q: 'Why don\'t people sink in the Dead Sea?', options: ['The water is very cold.', 'The salt makes the water very heavy.', 'The water is not deep.', 'People wear special clothes.'], answer: 1, explain: 'המלח הרב הופך את המים לכבדים — "Because of all this salt, the water is very heavy".' },
      { q: 'Why is the sea called "dead"?', options: ['Fish and plants cannot live in it.', 'Nobody visits it.', 'It has no water.', 'It is very old.'], answer: 0, explain: 'כתוב: "fish and plants cannot live in such salty water".' },
      { q: 'What does "However, it is not completely dead" tell us?', options: ['Some fish live there.', 'Tiny bacteria live there.', 'The sea is getting bigger.', 'People live in the water.'], answer: 1, explain: 'המשפט ממשיך: "scientists have found tiny bacteria that live there" — יש בו חיידקים זעירים.' },
      { q: 'What is the main reason the Dead Sea is getting smaller?', options: ['Too many tourists swim in it.', 'People use the Jordan River water before it reaches the sea.', 'It does not rain in Jordan.', 'The salt drinks the water.'], answer: 1, explain: 'כתוב: "mostly because people use the water of the Jordan River before it reaches the sea".' },
    ],
  },
  {
    slug: 'the-boy-who-cried-wolf', band: 'g7-8', title: 'The Boy Who Cried Wolf', emoji: '🐺', genre: 'משל',
    summary: 'המשל הידוע על הרועה הצעיר שצעק "זאב!" בצחוק — עד שהזאב באמת הגיע.',
    paragraphs: [
      'Long ago, in a small village on a hill, there lived a young shepherd. Every day he took the village sheep up to the fields and watched them while they ate grass. The work was quiet and boring, and the boy often wished for some excitement.',
      'One afternoon he had an idea. He ran down the hill and shouted, "Wolf! Wolf! A wolf is attacking the sheep!" The villagers dropped their tools and hurried up the hill to help. But when they arrived, there was no wolf. The boy laughed at their angry faces.',
      'A few days later, he did the same thing again, and again the villagers came running. Again there was no wolf, and again the boy laughed. This time the villagers were really angry. "Nobody will believe you next time," said an old woman.',
      'Then, one evening, a real wolf came out of the forest. The terrified boy shouted, "Wolf! Wolf! Please help!" But the villagers thought it was another trick, and nobody came. The wolf scattered the sheep, and the boy learned a hard lesson: a liar is not believed, even when he tells the truth.',
    ],
    glossary: [['village', 'כפר'], ['shepherd', 'רועה צאן'], ['sheep', 'כבשים'], ['watched', 'שמר, השגיח'], ['grass', 'עשב, דשא'], ['boring', 'משעמם'], ['wished', 'ייחל, רצה'], ['excitement', 'התרגשות, ריגוש'], ['wolf', 'זאב'], ['attacking', 'תוקף'], ['villagers', 'אנשי הכפר'], ['tools', 'כלי עבודה'], ['hurried', 'מיהרו'], ['believe', 'להאמין'], ['forest', 'יער'], ['terrified', 'מבוהל, מפוחד מאוד'], ['trick', 'תעלול, תרגיל'], ['scattered', 'פיזר'], ['liar', 'שקרן'], ['truth', 'אמת']],
    questions: [
      { q: 'Why did the boy shout "Wolf!" the first time?', options: ['He saw a wolf.', 'He was bored and wanted some excitement.', 'He was hungry.', 'He lost a sheep.'], answer: 1, explain: 'העבודה הייתה "quiet and boring" והוא "wished for some excitement" — הוא השתעמם.' },
      { q: 'What did the villagers do the first time?', options: ['They laughed.', 'They stayed at home.', 'They dropped their tools and ran up the hill.', 'They called the police.'], answer: 2, explain: 'כתוב: "The villagers dropped their tools and hurried up the hill to help".' },
      { q: 'Why did nobody come when the real wolf came?', options: ['They were asleep.', 'They thought it was another trick.', 'They were afraid of wolves.', 'They did not hear him.'], answer: 1, explain: 'כתוב: "the villagers thought it was another trick" — הם חשבו שזה שוב תעלול.' },
      { q: 'What is the lesson of the story?', options: ['Wolves are dangerous.', 'A liar is not believed, even when he tells the truth.', 'Shepherds must work hard.', 'Villages need a fence.'], answer: 1, explain: 'המוסר כתוב בסוף: מי שמשקר — לא מאמינים לו גם כשהוא אומר אמת.' },
    ],
  },
  {
    slug: 'sunrise-at-masada', band: 'g7-8', title: 'Sunrise at Masada', emoji: '🌄', genre: 'יומן',
    summary: 'יומן מטיול שנתי: טיפוס בשביל הנחש בחושך, זריחה מעל ים המלח וארמון הורדוס.',
    paragraphs: [
      'Dear Diary,',
      'I am writing this on the bus back home from our class trip, and my legs still hurt! Our alarm clocks rang at 3:30 this morning, because we wanted to climb Masada before sunrise.',
      'We started up the Snake Path in the dark, with flashlights in our hands. The path is long and steep, and it winds back and forth up the side of the mountain. Some kids complained, but our guide, Avi, kept telling jokes to make us laugh. It took us almost an hour to reach the top.',
      'Then it happened. The sky over the mountains of Jordan turned pink, then orange, and suddenly the sun appeared. Below us, the Dead Sea shone like silver. Everybody went quiet. Even Daniel, who never stops talking, didn\'t say a word.',
      'Later, Avi showed us the ruins of the palace that King Herod built on the edge of the cliff, more than two thousand years ago. I can\'t believe people built such a place in the middle of the desert. It was the hardest and the best morning of my life.',
    ],
    glossary: [['hurt', 'כואבות'], ['alarm clocks', 'שעונים מעוררים'], ['rang', 'צלצלו'], ['climb', 'לטפס'], ['sunrise', 'זריחה'], ['Snake Path', 'שביל הנחש'], ['flashlights', 'פנסים'], ['steep', 'תלול'], ['winds', 'מתפתל'], ['back and forth', 'הלוך ושוב'], ['complained', 'התלוננו'], ['guide', 'מדריך'], ['jokes', 'בדיחות'], ['appeared', 'הופיעה'], ['shone', 'נצץ, הבהיק'], ['quiet', 'שקט'], ['ruins', 'שרידים, חורבות'], ['palace', 'ארמון'], ['edge', 'קצה'], ['cliff', 'צוק'], ['Masada', 'מצדה'], ['King Herod', 'המלך הורדוס'], ['Jordan', 'ירדן']],
    questions: [
      { q: 'Why did the class wake up at 3:30?', options: ['to catch an early bus home', 'to climb Masada before sunrise', 'to swim in the Dead Sea', 'to eat breakfast'], answer: 1, explain: 'כתוב: "because we wanted to climb Masada before sunrise".' },
      { q: 'How did Avi help the kids on the way up?', options: ['He carried their bags.', 'He told jokes to make them laugh.', 'He gave them flashlights.', 'He drove them to the top.'], answer: 1, explain: 'כתוב: "our guide, Avi, kept telling jokes to make us laugh".' },
      { q: 'What does "Even Daniel ... didn\'t say a word" show about the sunrise?', options: ['It was boring.', 'It was so beautiful that everyone was silent.', 'Daniel was sick.', 'Daniel was angry.'], answer: 1, explain: 'אפילו דניאל, שאף פעם לא מפסיק לדבר, שתק — הזריחה הייתה מרשימה מאוד.' },
      { q: 'Who built the palace on the edge of the cliff?', options: ['Avi', 'King David', 'King Herod', 'the kids'], answer: 2, explain: 'כתוב: "the palace that King Herod built on the edge of the cliff".' },
    ],
  },
  {
    slug: 'sea-turtles', band: 'g7-8', title: 'Sea Turtles on Israel\'s Beaches', emoji: '🐢', genre: 'טקסט מידע',
    summary: 'טקסט מידע על צבי הים שמטילים ביצים בחופי ישראל, הסכנה שבאורות העיר ומי שומר עליהם.',
    paragraphs: [
      'Every summer, on quiet nights, something special happens on the beaches of Israel. Large sea turtles come out of the Mediterranean Sea, crawl slowly up the sand, and dig a deep hole with their back flippers. In this nest, a mother turtle lays about one hundred eggs, covers them with sand, and returns to the sea. She never sees her babies.',
      'About fifty days later, the baby turtles hatch. They are as small as a cookie. They climb out of the sand at night and run toward the brightest light they can see. In nature, that is the light of the moon and stars on the water. Today, however, the lights of cities and hotels can confuse them, and they crawl the wrong way.',
      'Two kinds of sea turtles nest in Israel: the loggerhead turtle and the green turtle. Both are endangered. Volunteers and workers of the Israel Nature and Parks Authority walk along the beaches, find the nests and protect them. At the Sea Turtle Rescue Center in Michmoret, injured turtles get treatment and are later returned to the sea.',
    ],
    glossary: [['turtles', 'צבים'], ['Mediterranean', 'הים התיכון'], ['crawl', 'זוחלים'], ['dig', 'חופרים'], ['deep', 'עמוק'], ['hole', 'בור, חור'], ['flippers', 'סנפירים'], ['nest', 'קן'], ['lays', 'מטילה'], ['eggs', 'ביצים'], ['covers', 'מכסה'], ['returns', 'חוזרת'], ['hatch', 'בוקעים (מהביצה)'], ['toward', 'לעבר'], ['confuse', 'לבלבל'], ['loggerhead', 'צב ים חום (קרטה)'], ['endangered', 'בסכנת הכחדה'], ['volunteers', 'מתנדבים'], ['protect', 'מגנים על'], ['rescue', 'הצלה'], ['injured', 'פצועים'], ['treatment', 'טיפול'], ['Michmoret', 'מכמורת'], ['Nature and Parks Authority', 'רשות הטבע והגנים']],
    questions: [
      { q: 'What does the mother turtle do after she lays her eggs?', options: ['She stays with them.', 'She covers them with sand and returns to the sea.', 'She carries them to the sea.', 'She waits fifty days.'], answer: 1, explain: 'כתוב: "covers them with sand, and returns to the sea. She never sees her babies".' },
      { q: 'Why can city lights be dangerous for baby turtles?', options: ['They are too hot.', 'They wake up the mother.', 'They confuse the babies, so they crawl the wrong way.', 'They scare away the birds.'], answer: 2, explain: 'הצבים הקטנים הולכים לעבר האור הבהיר ביותר, ואורות העיר "can confuse them, and they crawl the wrong way".' },
      { q: 'Which two kinds of sea turtles nest in Israel?', options: ['the loggerhead turtle and the green turtle', 'the green turtle and the desert turtle', 'the leatherback and the loggerhead', 'only the green turtle'], answer: 0, explain: 'כתוב: "the loggerhead turtle and the green turtle".' },
      { q: 'What happens at the center in Michmoret?', options: ['Turtles are sold.', 'Injured turtles get treatment and go back to the sea.', 'Tourists swim with turtles.', 'Scientists build new beaches.'], answer: 1, explain: 'כתוב: "injured turtles get treatment and are later returned to the sea".' },
    ],
  },
  {
    slug: 'the-red-planet', band: 'g7-8', title: 'Mars, the Red Planet', emoji: '🔴', genre: 'טקסט מידע',
    summary: 'טקסט מידע על מאדים: למה הוא אדום, כמה קר שם, הר הגעש הגדול במערכת השמש והרובוטים שחוקרים אותו.',
    paragraphs: [
      'Mars is the fourth planet from the Sun, and it is our neighbor in the solar system. People call it "the Red Planet" because its ground is full of iron dust that has rusted, like an old bicycle left in the rain.',
      'Mars is much smaller than Earth, and it is also much colder. On a summer day near its equator, the temperature can reach about 20 degrees Celsius, but at night it can drop to minus 70 or even lower. The air on Mars is very thin, and people cannot breathe it.',
      'Mars is home to Olympus Mons, the biggest volcano in the solar system. It is about two and a half times taller than Mount Everest. Mars also has two small moons, called Phobos and Deimos.',
      'Since the 1960s, many spacecraft have visited Mars. Robots on wheels, called rovers, drive across its surface, take photos and study the rocks. Scientists want to know whether there was ever water — and maybe life — on the Red Planet. One day, perhaps, the first human will walk there.',
    ],
    glossary: [['fourth', 'הרביעי'], ['planet', 'כוכב לכת'], ['solar system', 'מערכת השמש'], ['iron', 'ברזל'], ['dust', 'אבק'], ['rusted', 'החליד'], ['equator', 'קו המשווה'], ['temperature', 'טמפרטורה'], ['degrees', 'מעלות'], ['Celsius', 'צלזיוס'], ['minus', 'מינוס'], ['breathe', 'לנשום'], ['volcano', 'הר געש'], ['taller', 'גבוה יותר'], ['spacecraft', 'חלליות'], ['wheels', 'גלגלים'], ['rovers', 'רכבי שטח רובוטיים'], ['surface', 'פני השטח'], ['rocks', 'סלעים'], ['whether', 'האם'], ['perhaps', 'אולי'], ['human', 'בן אדם'], ['Mars', 'מאדים'], ['Olympus Mons', 'אולימפוס מונס (הר געש במאדים)'], ['Mount Everest', 'הר האוורסט']],
    questions: [
      { q: 'Why is Mars red?', options: ['It is very hot.', 'Its ground is full of rusted iron dust.', 'It is covered with red plants.', 'The Sun paints it red.'], answer: 1, explain: 'כתוב: "its ground is full of iron dust that has rusted" — אבק ברזל חלוד.' },
      { q: 'Why can\'t people breathe on Mars?', options: ['The air is very thin.', 'It is too hot.', 'There is too much water.', 'It is too dark.'], answer: 0, explain: 'כתוב: "The air on Mars is very thin, and people cannot breathe it".' },
      { q: 'What is Olympus Mons?', options: ['a moon of Mars', 'a rover', 'the biggest volcano in the solar system', 'a mountain on Earth'], answer: 2, explain: 'כתוב: "Olympus Mons, the biggest volcano in the solar system".' },
      { q: 'What do scientists want to find out about Mars?', options: ['how many moons it has', 'whether there was ever water and life there', 'how to paint it', 'why it is cold'], answer: 1, explain: 'כתוב: "Scientists want to know whether there was ever water — and maybe life".' },
    ],
  },
  {
    slug: 'email-from-haifa', band: 'g7-8', title: 'An Email from Haifa', emoji: '📧', genre: 'מכתב',
    summary: 'שירה כותבת לחבר לעט מקנדה על העיר שלה, חיפה: הכרמל, הכרמלית והגנים הבהאיים.',
    paragraphs: [
      'Hi Lucas,',
      'Thanks for your long email and the photos of the snow in Toronto! It looks so beautiful. Here in Haifa it almost never snows. In winter it rains, but most days are sunny and warm enough to walk around in a sweater.',
      'You asked me about my city, so here are some facts. Haifa is built on the side of Mount Carmel, right above the sea. Because of the mountain, many streets are very steep, and there are even public staircases instead of roads. Haifa also has the Carmelit, a short underground train that climbs the mountain. It is one of the smallest subway systems in the world!',
      'My favorite place is the Baha\'i Gardens. They go down the mountain in nineteen terraces, with flowers, fountains and a golden dome in the middle. From the top, you can see the whole port.',
      'What do you do after school in Canada? Do you play ice hockey? Write soon! Your friend, Shira',
    ],
    glossary: [['snow', 'שלג'], ['almost never', 'כמעט אף פעם לא'], ['sunny', 'שמשי'], ['warm enough', 'חם מספיק'], ['sweater', 'סוודר'], ['facts', 'עובדות'], ['side', 'צלע, צד'], ['steep', 'תלולים'], ['public', 'ציבוריות'], ['staircases', 'גרמי מדרגות'], ['instead of', 'במקום'], ['underground', 'תת־קרקעית'], ['subway', 'רכבת תחתית'], ['favorite', 'אהוב, מועדף'], ['terraces', 'טרסות, מדרגות'], ['fountains', 'מזרקות'], ['golden', 'מוזהבת'], ['dome', 'כיפה'], ['port', 'נמל'], ['ice hockey', 'הוקי קרח'], ['Haifa', 'חיפה'], ['Mount Carmel', 'הר הכרמל'], ['Carmelit', 'הכרמלית'], ['Baha\'i Gardens', 'הגנים הבהאיים'], ['Toronto', 'טורונטו'], ['Canada', 'קנדה']],
    questions: [
      { q: 'What is the weather like in Haifa in winter?', options: ['It snows every day.', 'It rains, but most days are sunny.', 'It is very hot.', 'It is always cloudy.'], answer: 1, explain: 'כתוב: "In winter it rains, but most days are sunny and warm".' },
      { q: 'Why are there public staircases in Haifa?', options: ['Because the city is on a steep mountain.', 'Because there are no cars.', 'Because of the snow.', 'Because of the port.'], answer: 0, explain: 'בגלל ההר — "Because of the mountain, many streets are very steep" — יש מדרגות במקום כבישים.' },
      { q: 'What is the Carmelit?', options: ['a garden', 'a short underground train', 'a beach', 'a school'], answer: 1, explain: 'כתוב: "the Carmelit, a short underground train that climbs the mountain".' },
      { q: 'What can you see from the top of the gardens?', options: ['Toronto', 'the whole port', 'the desert', 'Mount Everest'], answer: 1, explain: 'כתוב: "From the top, you can see the whole port".' },
    ],
  },

  // ── ט׳ ──
  {
    slug: 'how-volcanoes-work', band: 'g9', title: 'How Volcanoes Work', emoji: '🌋', genre: 'טקסט מידע',
    summary: 'טקסט מידע על הרי געש: מה זה מאגמה ולבה, איפה יש הרבה הרי געש, ומה נשאר מהם ברמת הגולן.',
    paragraphs: [
      'Deep under our feet, the Earth is extremely hot. Tens of kilometers below the surface, the heat can be strong enough to melt rock. This melted rock is called magma. Because magma is lighter than the solid rock around it, it slowly rises, and sometimes it collects in a large underground chamber.',
      'When the pressure in the chamber becomes too great, the magma pushes its way up through cracks in the ground. When it reaches the surface, it is called lava. An eruption can be gentle, with rivers of glowing lava, or it can be violent, sending ash and gas many kilometers into the sky. The ash can cover whole towns and even stop airplanes from flying.',
      'Most volcanoes are found where the giant plates of the Earth\'s crust meet. Around the Pacific Ocean there are so many volcanoes that the area is called the Ring of Fire. Japan, Indonesia and Chile all lie on this ring.',
      'Israel has no active volcanoes today, but it has many old ones. Large parts of the Golan Heights are covered with dark basalt rock, which formed from lava that cooled down. Hills such as Mount Avital and Mount Bental are actually ancient volcanoes.',
      'Volcanoes are dangerous, but they are also useful. Volcanic soil is very rich, so farmers often grow fruit and vegetables on the slopes of volcanoes. In some countries, such as Iceland, the heat under the ground is even used to produce electricity and to warm homes.',
    ],
    glossary: [['extremely', 'מאוד, ביותר'], ['tens of', 'עשרות'], ['melt', 'להמיס'], ['melted', 'מותך'], ['magma', 'מאגמה (סלע מותך מתחת לאדמה)'], ['lighter', 'קל יותר'], ['solid', 'מוצק'], ['rises', 'עולה'], ['collects', 'מצטבר'], ['chamber', 'חדר, תא'], ['pressure', 'לחץ'], ['cracks', 'סדקים'], ['lava', 'לבה'], ['eruption', 'התפרצות'], ['gentle', 'עדין, רגוע'], ['glowing', 'זוהרת'], ['violent', 'אלים, עז'], ['ash', 'אפר'], ['plates', 'לוחות'], ['crust', 'קרום (כדור הארץ)'], ['active', 'פעיל'], ['basalt', 'בזלת'], ['ancient', 'עתיק'], ['volcanic', 'געשי'], ['slopes', 'מדרונות'], ['produce', 'לייצר'], ['electricity', 'חשמל'], ['airplanes', 'מטוסים'], ['Ring of Fire', 'טבעת האש'], ['Pacific Ocean', 'האוקיינוס השקט'], ['Golan Heights', 'רמת הגולן'], ['Iceland', 'איסלנד'], ['Japan', 'יפן'], ['Indonesia', 'אינדונזיה'], ['Chile', 'צ׳ילה'], ['Mount Avital', 'הר אביטל'], ['Mount Bental', 'הר בנטל']],
    questions: [
      { q: 'What is the difference between magma and lava?', options: ['Magma is cold and lava is hot.', 'Magma is under the ground; lava is magma that reaches the surface.', 'Lava is made of ash.', 'There is no difference.'], answer: 1, explain: 'מאגמה היא סלע מותך מתחת לאדמה, וכשהיא מגיעה לפני השטח — "it is called lava".' },
      { q: 'Why does magma rise?', options: ['It is lighter than the solid rock around it.', 'The wind pushes it.', 'It is pulled by the Moon.', 'People dig it out.'], answer: 0, explain: 'כתוב: "Because magma is lighter than the solid rock around it, it slowly rises".' },
      { q: 'Why is the area around the Pacific Ocean called the Ring of Fire?', options: ['It is very hot there.', 'There are many volcanoes there.', 'There are many forest fires.', 'The sun sets there.'], answer: 1, explain: 'כתוב: "there are so many volcanoes that the area is called the Ring of Fire".' },
      { q: 'What does the text say about volcanoes in Israel?', options: ['There are many active volcanoes.', 'There are no active volcanoes, but there are old ones in the Golan.', 'There were never volcanoes in Israel.', 'Mount Carmel is an active volcano.'], answer: 1, explain: 'כתוב: "Israel has no active volcanoes today, but it has many old ones" — למשל הר אביטל והר בנטל.' },
      { q: 'Why do farmers grow food on the slopes of volcanoes?', options: ['It is warm there.', 'Volcanic soil is very rich.', 'There is a lot of rain.', 'Nobody else lives there.'], answer: 1, explain: 'כתוב: "Volcanic soil is very rich" — האדמה הגעשית פורייה מאוד.' },
    ],
  },
  {
    slug: 'the-north-wind-and-the-sun', band: 'g9', title: 'The North Wind and the Sun', emoji: '☀️', genre: 'משל',
    summary: 'משל על תחרות בין רוח הצפון לשמש: מי יצליח לגרום לעובר אורח להוריד את המעיל?',
    paragraphs: [
      'One cold morning, the North Wind and the Sun were arguing about which of them was stronger. "I can knock down trees and push ships across the sea," boasted the Wind. "Nobody is as powerful as I am." The Sun only smiled. "Strength is not always about force," it said quietly.',
      'Just then, a traveler came walking along the road, wrapped in a warm coat. "Let\'s have a contest," said the Sun. "Whoever makes that man take off his coat is the stronger one." The Wind agreed at once. It was sure it would win.',
      'The Wind went first. It blew hard and cold, and leaves flew through the air. But the harder the Wind blew, the tighter the traveler held his coat around him. The Wind blew until it was exhausted, but the coat stayed on.',
      'Then it was the Sun\'s turn. It came out from behind a cloud and shone gently on the road. The air grew warm and pleasant. The traveler opened the buttons of his coat. The Sun shone a little more, and soon the man took off his coat completely and sat down to rest in the shade of a tree.',
      'The Wind had to admit that it had lost. Kindness and patience, the story tells us, often succeed where force and anger fail. Next time you want to change someone\'s mind, think about the Sun, not the Wind.',
    ],
    glossary: [['arguing', 'מתווכחים'], ['stronger', 'חזק יותר'], ['knock down', 'להפיל'], ['boasted', 'התרברבה'], ['powerful', 'חזק, רב עוצמה'], ['strength', 'כוח'], ['force', 'כוח, כפייה'], ['quietly', 'בשקט'], ['traveler', 'עובר אורח, נוסע'], ['wrapped', 'עטוף'], ['contest', 'תחרות'], ['whoever', 'מי ש־'], ['take off', 'להוריד, לפשוט'], ['agreed', 'הסכימה'], ['at once', 'מיד'], ['blew', 'נשבה'], ['leaves', 'עלים'], ['tighter', 'חזק יותר, הדוק יותר'], ['exhausted', 'מותשת'], ['turn', 'תור'], ['pleasant', 'נעים'], ['buttons', 'כפתורים'], ['shade', 'צל'], ['admit', 'להודות'], ['kindness', 'טוב לב'], ['patience', 'סבלנות'], ['succeed', 'מצליחים'], ['fail', 'נכשלים'], ['mind', 'דעה, מחשבה'], ['North Wind', 'רוח הצפון']],
    questions: [
      { q: 'What were the Wind and the Sun arguing about?', options: ['who was older', 'who was stronger', 'who was warmer', 'who was faster'], answer: 1, explain: 'כתוב: "arguing about which of them was stronger" — מי חזק יותר.' },
      { q: 'What happened when the Wind blew harder?', options: ['The man took off his coat.', 'The man held his coat tighter.', 'The man ran home.', 'The man fell asleep.'], answer: 1, explain: 'כתוב: "the harder the Wind blew, the tighter the traveler held his coat around him".' },
      { q: 'How did the Sun win the contest?', options: ['It blew very hard.', 'It shone gently until the man felt warm.', 'It asked the man nicely.', 'It hid behind a cloud.'], answer: 1, explain: 'השמש "shone gently", האוויר התחמם, והאיש הוריד את המעיל בעצמו.' },
      { q: 'What does the word "exhausted" mean in the story?', options: ['very angry', 'very tired', 'very happy', 'very cold'], answer: 1, explain: 'הרוח נשבה עד שהייתה exhausted — מותשת, עייפה מאוד.' },
      { q: 'What is the moral of the story?', options: ['Wind is stronger than the Sun.', 'Kindness and patience often succeed where force fails.', 'Always wear a coat.', 'Never argue with friends.'], answer: 1, explain: 'כתוב: "Kindness and patience ... often succeed where force and anger fail".' },
    ],
  },
  {
    slug: 'holiday-boxes', band: 'g9', title: 'Four Hundred Boxes', emoji: '📦', genre: 'יומן',
    summary: 'נער כותב ביומן על הפעם הראשונה שהתנדב בבנק מזון וארז סלי מזון לראש השנה.',
    paragraphs: [
      'Dear Diary,',
      'Today I did something I have never done before: I volunteered at a food bank. My youth group goes there every year before Rosh Hashanah, and this year I was finally old enough to join.',
      'The food bank is a huge warehouse at the edge of the city. When we arrived, I couldn\'t believe how much food there was. There were mountains of rice, oil, pasta, canned tomatoes, honey and tea, all donated by supermarkets, companies and ordinary families.',
      'Our job was to pack holiday boxes for families who cannot afford to buy enough food. Each box had to contain exactly the same things, so we worked like a factory. I stood at the end of the line and checked every box before it was closed. If something was missing, I had to shout, and the whole line stopped. At first it was a bit embarrassing, but after an hour I didn\'t care anymore.',
      'By the afternoon, we had packed more than four hundred boxes. The manager told us that each one would reach a family in time for the holiday. I was tired, my hands were sticky from a broken jar of honey, and my back hurt. But on the way home, I felt prouder than after any test I\'ve ever passed. I\'ve already decided: next year I\'m coming back, and I\'m bringing my little brother.',
    ],
    glossary: [['volunteered', 'התנדבתי'], ['food bank', 'בנק מזון'], ['youth group', 'תנועת נוער, קבוצת נוער'], ['finally', 'סוף סוף'], ['join', 'להצטרף'], ['huge', 'ענק'], ['warehouse', 'מחסן'], ['canned', 'משומרות, בקופסה'], ['donated', 'נתרמו'], ['ordinary', 'רגילות'], ['pack', 'לארוז'], ['afford', 'להרשות לעצמם (כלכלית)'], ['contain', 'להכיל'], ['factory', 'מפעל'], ['checked', 'בדקתי'], ['missing', 'חסר'], ['embarrassing', 'מביך'], ['anymore', 'יותר, כבר לא'], ['manager', 'מנהל'], ['in time', 'בזמן'], ['sticky', 'דביקות'], ['jar', 'צנצנת'], ['prouder', 'גאה יותר'], ['passed', 'עברתי (בהצלחה)'], ['decided', 'החלטתי'], ['Rosh Hashanah', 'ראש השנה']],
    questions: [
      { q: 'Why didn\'t the writer volunteer at the food bank before?', options: ['He was not old enough.', 'He did not want to.', 'He lived far away.', 'He was sick.'], answer: 0, explain: 'כתוב: "this year I was finally old enough to join" — רק השנה הוא היה מבוגר מספיק.' },
      { q: 'Who gave the food to the food bank?', options: ['only the government', 'supermarkets, companies and ordinary families', 'the youth group', 'farmers from the Negev'], answer: 1, explain: 'כתוב: "all donated by supermarkets, companies and ordinary families".' },
      { q: 'What was the writer\'s job?', options: ['to drive the boxes to families', 'to check every box at the end of the line', 'to buy the food', 'to cook for the volunteers'], answer: 1, explain: 'כתוב: "I stood at the end of the line and checked every box before it was closed".' },
      { q: 'Why were his hands sticky?', options: ['He ate candy.', 'A jar of honey broke.', 'He painted the boxes.', 'It rained.'], answer: 1, explain: 'כתוב: "my hands were sticky from a broken jar of honey".' },
      { q: 'How did the writer feel at the end of the day?', options: ['bored', 'very proud', 'angry', 'embarrassed'], answer: 1, explain: 'כתוב: "I felt prouder than after any test I\'ve ever passed" — גאה מאוד.' },
    ],
  },
  {
    slug: 'the-space-station', band: 'g9', title: 'A Home in Orbit', emoji: '🛰️', genre: 'טקסט מידע',
    summary: 'טקסט מידע על תחנת החלל הבין־לאומית: כמה מהר היא טסה, איך חיים בלי כוח משיכה והאסטרונאוט הישראלי השני.',
    paragraphs: [
      'Look up at the sky on a clear evening and you might see a bright dot moving quickly between the stars, without blinking. It is not a plane. It is the International Space Station, the largest object that humans have ever built in space.',
      'The station, often called the ISS, orbits the Earth about 400 kilometers above our heads. It moves at about 28,000 kilometers per hour, so it goes around the planet in roughly 90 minutes. This means that the astronauts on board see about sixteen sunrises every day.',
      'The ISS was built piece by piece, starting in 1998, by space agencies from the United States, Russia, Europe, Japan and Canada. People have lived on it without a break since the year 2000, and each astronaut usually stays for around six months.',
      'Life without gravity is strange. Astronauts sleep in sleeping bags tied to the wall, so they do not float around. Water forms round balls in the air, so they drink from bags with straws. In space, muscles and bones become weak, so the crew must exercise for about two hours every day.',
      'Most importantly, the ISS is a laboratory. Scientists use it to study how plants, animals and the human body behave in space. In 2022, Eytan Stibbe became the second Israeli in space when he spent more than two weeks on the station, carrying out experiments by Israeli scientists.',
    ],
    glossary: [['clear', 'בהיר, נקי מעננים'], ['dot', 'נקודה'], ['blinking', 'מהבהב'], ['International', 'בין־לאומית'], ['station', 'תחנה'], ['largest', 'הגדול ביותר'], ['object', 'עצם, חפץ'], ['orbits', 'מקיף, חג סביב'], ['per hour', 'לשעה'], ['roughly', 'בערך'], ['on board', 'על הסיפון'], ['sunrises', 'זריחות'], ['piece by piece', 'חלק אחר חלק'], ['agencies', 'סוכנויות'], ['without a break', 'בלי הפסקה'], ['gravity', 'כוח משיכה'], ['tied', 'קשורים'], ['straws', 'קשים'], ['muscles', 'שרירים'], ['bones', 'עצמות'], ['crew', 'צוות'], ['exercise', 'להתעמל'], ['importantly', 'חשוב מכך'], ['laboratory', 'מעבדה'], ['behave', 'מתנהגים'], ['carrying out', 'מבצע'], ['experiments', 'ניסויים'], ['ISS', 'תחנת החלל הבין־לאומית'], ['Russia', 'רוסיה'], ['Europe', 'אירופה'], ['Japan', 'יפן'], ['Canada', 'קנדה']],
    questions: [
      { q: 'How can you tell the ISS from a star in the sky?', options: ['It is red.', 'It moves quickly and does not blink.', 'It is very big.', 'It makes a noise.'], answer: 1, explain: 'כתוב: "a bright dot moving quickly between the stars, without blinking".' },
      { q: 'Why do the astronauts see about sixteen sunrises a day?', options: ['The station goes around the Earth every 90 minutes or so.', 'They sleep very little.', 'The Sun moves fast.', 'They have many windows.'], answer: 0, explain: 'התחנה מקיפה את כדור הארץ בערך ב־90 דקות, ולכן ביממה יש כ־16 סיבובים — וזריחות.' },
      { q: 'Why do astronauts sleep in bags tied to the wall?', options: ['It is cold.', 'So they don\'t float around.', 'There are no beds.', 'To hide from the light.'], answer: 1, explain: 'כתוב: "tied to the wall, so they do not float around" — בלי כוח משיכה הם היו מרחפים.' },
      { q: 'Why must the crew exercise every day?', options: ['to win a race', 'because muscles and bones become weak in space', 'because they eat too much', 'to keep warm'], answer: 1, explain: 'כתוב: "muscles and bones become weak, so the crew must exercise".' },
      { q: 'Who was Eytan Stibbe?', options: ['the first person on the ISS', 'the second Israeli in space', 'a Russian scientist', 'the builder of the ISS'], answer: 1, explain: 'כתוב: "Eytan Stibbe became the second Israeli in space" (הראשון היה אילן רמון).' },
    ],
  },
  {
    slug: 'ein-gedi', band: 'g9', title: 'Ein Gedi: An Oasis in the Desert', emoji: '🐐', genre: 'טקסט מידע',
    summary: 'טקסט מידע על שמורת עין גדי: מאיפה מגיעים המעיינות, יעלים ושפנים, וממצאים עתיקים.',
    paragraphs: [
      'On the western shore of the Dead Sea, surrounded by dry yellow cliffs, there is a surprise: a green valley full of trees, birds and running water. This is Ein Gedi, one of the most famous nature reserves in Israel.',
      'The secret of Ein Gedi is its springs. Rain that falls on the mountains of Judea sinks deep into the rock. It travels underground for a long time, and finally comes out as fresh springs at the edge of the desert. The water flows down two streams, Nahal David and Nahal Arugot, and creates waterfalls and pools.',
      'Thanks to the water, many animals live in the reserve. The most famous are the Nubian ibex, wild goats with long, curved horns. They climb the steep cliffs easily, and they are not afraid of people, so you can often see them very close to the path. Another common animal is the rock hyrax, a small furry animal that looks a bit like a big guinea pig. Surprisingly, elephants are among its closest living relatives!',
      'People have lived at Ein Gedi for thousands of years. Archaeologists found the remains of an ancient synagogue there, with a beautiful mosaic floor.',
      'If you visit, come early in the morning, bring plenty of water and wear a hat. And please remember: it is forbidden to feed the animals.',
    ],
    glossary: [['western', 'מערבי'], ['surrounded', 'מוקף'], ['dry', 'יבשים'], ['surprise', 'הפתעה'], ['valley', 'עמק'], ['nature reserves', 'שמורות טבע'], ['secret', 'סוד'], ['springs', 'מעיינות'], ['sinks', 'מחלחל, שוקע'], ['flows', 'זורמים'], ['streams', 'נחלים'], ['waterfalls', 'מפלים'], ['pools', 'בריכות'], ['thanks to', 'בזכות'], ['ibex', 'יעל'], ['goats', 'עיזים'], ['curved', 'מעוקלות'], ['horns', 'קרניים'], ['common', 'נפוץ'], ['hyrax', 'שפן סלע'], ['furry', 'פרוותי'], ['guinea pig', 'שרקן (חזיר ים)'], ['surprisingly', 'באופן מפתיע'], ['relatives', 'קרובי משפחה'], ['archaeologists', 'ארכאולוגים'], ['remains', 'שרידים'], ['synagogue', 'בית כנסת'], ['mosaic', 'פסיפס'], ['plenty of', 'הרבה'], ['forbidden', 'אסור'], ['feed', 'להאכיל'], ['Judea', 'יהודה'], ['Ein Gedi', 'עין גדי'], ['Nahal', 'נחל'], ['Nubian', 'נובי'], ['Nahal David', 'נחל דוד'], ['Nahal Arugot', 'נחל ערוגות']],
    questions: [
      { q: 'Where does the water of Ein Gedi\'s springs come from?', options: ['from the Dead Sea', 'from rain that falls on the mountains of Judea', 'from a big lake under the desert', 'from pipes'], answer: 1, explain: 'כתוב: "Rain that falls on the mountains of Judea sinks deep into the rock" ויוצא במעיינות.' },
      { q: 'Why can visitors often see the ibex close to the path?', options: ['They are fed by the guards.', 'They are not afraid of people.', 'They cannot climb.', 'They live in cages.'], answer: 1, explain: 'כתוב: "they are not afraid of people, so you can often see them very close to the path".' },
      { q: 'What is surprising about the rock hyrax?', options: ['It can swim.', 'It is very big.', 'Elephants are among its closest relatives.', 'It eats fish.'], answer: 2, explain: 'כתוב: "Surprisingly, elephants are among its closest living relatives".' },
      { q: 'What did archaeologists find at Ein Gedi?', options: ['a palace', 'an ancient synagogue with a mosaic floor', 'a ship', 'gold coins'], answer: 1, explain: 'כתוב: "the remains of an ancient synagogue there, with a beautiful mosaic floor".' },
      { q: 'Which of these is NOT advice for visitors?', options: ['Come early in the morning.', 'Bring plenty of water.', 'Feed the animals.', 'Wear a hat.'], answer: 2, explain: 'דווקא אסור להאכיל את בעלי החיים — "it is forbidden to feed the animals".' },
    ],
  },
  {
    slug: 'letter-to-my-future-self', band: 'g9', title: 'A Letter to My Future Self', emoji: '💌', genre: 'מכתב',
    summary: 'נערה בת 14 כותבת מכתב לעצמה בעוד עשר שנים: על החיים בבאר שבע, החלומות והשאלות שלה.',
    paragraphs: [
      'Dear Future Me,',
      'Our English teacher asked us to write a letter to ourselves, and she promised to mail it to us in ten years. So hello! I am fourteen and a half, and you are probably twenty-four or twenty-five now. I wonder if you still remember me.',
      'Let me remind you what my life is like. I live in Be\'er Sheva with Mom, Dad, our dog Pita and my annoying little sister, Hila. I am in ninth grade, and my favorite subjects are biology and art. I spend too much time on my phone, I am learning to play the guitar, and I am a little afraid of next year, because I\'m moving to a new high school.',
      'Right now, I want to be a veterinarian. I love animals more than almost anything, and every time Pita is sick, I want to understand exactly what is wrong. But Dad says that people change their dreams many times, so maybe you are an artist, a scientist or something I can\'t even imagine.',
      'I have a few questions for you. Did you travel to Japan, like I have always wanted? Are you still friends with Maya? Did you ever learn to cook something more than pasta? And are you kind to people? That is the most important question.',
      'Whatever you are doing, I hope you are happy, and I hope you are proud of where you came from. Don\'t forget the girl who wrote this letter. Love, Me',
    ],
    glossary: [['future', 'עתיד'], ['ourselves', 'לעצמנו'], ['promised', 'הבטיחה'], ['mail', 'לשלוח בדואר'], ['probably', 'כנראה'], ['wonder', 'תוהה, שואלת את עצמי'], ['remind', 'להזכיר'], ['annoying', 'מעצבנת'], ['ninth grade', 'כיתה ט׳'], ['subjects', 'מקצועות'], ['biology', 'ביולוגיה'], ['guitar', 'גיטרה'], ['high school', 'תיכון'], ['veterinarian', 'וטרינר/ית'], ['understand', 'להבין'], ['dreams', 'חלומות'], ['artist', 'אמן/ית'], ['scientist', 'מדען/ית'], ['imagine', 'לדמיין'], ['travel', 'לנסוע, לטייל'], ['whatever', 'מה ש־, לא משנה מה'], ['proud', 'גאה'], ['forget', 'לשכוח'], ['Be\'er Sheva', 'באר שבע'], ['Japan', 'יפן']],
    questions: [
      { q: 'Why is the writer writing this letter?', options: ['Her teacher asked the class to write to their future selves.', 'She is moving to Japan.', 'She wants to win a prize.', 'Her friend Maya asked her.'], answer: 0, explain: 'כתוב: "Our English teacher asked us to write a letter to ourselves".' },
      { q: 'Why is she a little afraid of next year?', options: ['She is moving to a new high school.', 'Her dog is sick.', 'She has a big test.', 'Her family is moving to Japan.'], answer: 0, explain: 'כתוב: "because I\'m moving to a new high school".' },
      { q: 'Why does she want to be a veterinarian?', options: ['It pays well.', 'She loves animals and wants to understand what is wrong when Pita is sick.', 'Her father is a vet.', 'She likes art.'], answer: 1, explain: 'כתוב: "I love animals more than almost anything, and every time Pita is sick, I want to understand exactly what is wrong".' },
      { q: 'Which question does she think is the most important?', options: ['Did you travel to Japan?', 'Are you still friends with Maya?', 'Are you kind to people?', 'Can you cook?'], answer: 2, explain: 'אחרי "are you kind to people?" היא כותבת: "That is the most important question".' },
    ],
  },

  // ── י׳–י״ב ──
  {
    slug: 'the-sharks-of-hadera', band: 'g10-12', title: 'The Sharks of Hadera', emoji: '🦈', genre: 'טקסט מידע',
    summary: 'מאמר מידע על הכרישים שמתאספים כל חורף ליד תחנת הכוח בחדרה: למה הם שם, מה חוקרים לומדים ולמה אסור להתקרב.',
    paragraphs: [
      'Every winter, a strange crowd gathers in the sea near the city of Hadera. Dozens of large sharks swim slowly in the shallow water, only a few meters from the shore. For years, local fishermen and swimmers knew about them, but only recently have scientists begun to study this unusual phenomenon seriously.',
      'The sharks are mostly dusky sharks and sandbar sharks, two species that can grow to around three meters long. They appear from late autumn until spring, and they choose a very specific spot: the warm water that flows out of the Orot Rabin power station. The power station uses seawater to cool its machines and then returns it to the sea several degrees warmer. In winter, when the Mediterranean is cold, this warm water seems to attract the sharks.',
      'Researchers from the University of Haifa have been tagging some of the sharks with small electronic transmitters. These devices allow them to follow the animals\' movements. The results suggest that many of the sharks return to Hadera year after year, and that they travel long distances when they leave.',
      'The sharks have become a tourist attraction. On calm days, crowds of people stand on the beach and watch the fins cutting through the water. Some visitors even enter the sea to swim near them. Experts warn that this is a dangerous idea. Although these sharks are not known for attacking humans, they are wild animals, and in 2023 a man who swam close to them was killed. Swimming near the sharks is now prohibited.',
      'The story of the Hadera sharks also raises bigger questions. Both species are considered endangered, partly because of overfishing. Some scientists worry that the sharks have become dependent on an artificial heat source, which could disappear if the power station changes the way it works. Others see the site as a rare natural laboratory where we can learn how to protect these misunderstood animals.',
    ],
    glossary: [['crowd', 'קהל, המון'], ['gathers', 'מתאסף'], ['dozens', 'עשרות'], ['sharks', 'כרישים'], ['shallow', 'רדודים'], ['local', 'מקומיים'], ['fishermen', 'דייגים'], ['recently', 'לאחרונה'], ['phenomenon', 'תופעה'], ['seriously', 'ברצינות'], ['dusky', 'כהה (כריש כהה)'], ['sandbar', 'שרטון (כריש שרטונים)'], ['species', 'מינים'], ['specific', 'מסוים, מוגדר'], ['spot', 'מקום, נקודה'], ['power station', 'תחנת כוח'], ['seawater', 'מי ים'], ['several', 'כמה'], ['attract', 'למשוך'], ['researchers', 'חוקרים'], ['tagging', 'מסמנים בתג'], ['electronic', 'אלקטרוניים'], ['transmitters', 'משדרים'], ['devices', 'מכשירים'], ['allow', 'מאפשרים'], ['movements', 'תנועות'], ['suggest', 'מרמזים, מצביעים על'], ['distances', 'מרחקים'], ['attraction', 'אטרקציה'], ['calm', 'רגועים'], ['fins', 'סנפירים'], ['experts', 'מומחים'], ['warn', 'מזהירים'], ['although', 'למרות ש־'], ['prohibited', 'אסור'], ['raises', 'מעלה'], ['considered', 'נחשבים'], ['partly', 'בחלקו'], ['overfishing', 'דיג יתר'], ['dependent', 'תלויים'], ['artificial', 'מלאכותי'], ['source', 'מקור'], ['disappear', 'להיעלם'], ['site', 'אתר'], ['rare', 'נדיר'], ['misunderstood', 'שלא מבינים אותם, שנשפטים לא נכון'], ['Hadera', 'חדרה'], ['Orot Rabin', 'אורות רבין'], ['Haifa', 'חיפה'], ['Mediterranean', 'הים התיכון']],
    questions: [
      { q: 'Why do the sharks gather near Hadera in winter?', options: ['Fishermen feed them there.', 'The warm water from the power station seems to attract them.', 'The water there is deeper.', 'They lay eggs on the beach.'], answer: 1, explain: 'תחנת הכוח מחזירה לים מים חמים יותר, ו"this warm water seems to attract the sharks".' },
      { q: 'What does the power station do with seawater?', options: ['It drinks it.', 'It uses it to cool its machines and returns it warmer.', 'It turns it into salt.', 'It sells it.'], answer: 1, explain: 'כתוב: "uses seawater to cool its machines and then returns it to the sea several degrees warmer".' },
      { q: 'What have the tags taught researchers?', options: ['Sharks never leave Hadera.', 'Many sharks return year after year and travel far when they leave.', 'The sharks are not endangered.', 'Sharks like people.'], answer: 1, explain: 'כתוב: "many of the sharks return to Hadera year after year, and ... they travel long distances when they leave".' },
      { q: 'What is the writer\'s attitude to swimming near the sharks?', options: ['It is a good way to learn about them.', 'It is dangerous and should not be done.', 'It is safe because they never attack.', 'It is only dangerous in summer.'], answer: 1, explain: 'הכותב מביא את דברי המומחים: "this is a dangerous idea", ומציין שהשחייה ליד הכרישים נאסרה.' },
      { q: 'Why do some scientists worry about the sharks\' future?', options: ['They depend on an artificial heat source that could disappear.', 'There are too many sharks.', 'Tourists feed them bad food.', 'The water is getting too cold.'], answer: 0, explain: 'כתוב: "the sharks have become dependent on an artificial heat source, which could disappear".' },
    ],
  },
  {
    slug: 'reviving-hebrew', band: 'g10-12', title: 'The Language That Came Back to Life', emoji: '📜', genre: 'טקסט מידע',
    summary: 'מאמר על תחיית השפה העברית: אליעזר בן־יהודה, המילים שהמציא ומי עוד עזר להפוך את העברית לשפת יום־יום.',
    paragraphs: [
      'Today, millions of people use Hebrew every day — to buy bread, send messages, write songs and argue about football. It is hard to believe that about 150 years ago, almost nobody spoke Hebrew at home. For centuries, Hebrew had been the language of prayer, holy books and scholarship, but not of everyday life. Jews in different countries spoke Yiddish, Ladino, Arabic and many other languages.',
      'The person most connected with the revival of spoken Hebrew is Eliezer Ben-Yehuda. He was born in 1858 in a small town in the Russian Empire, and as a young man he became convinced that the Jewish people needed both a homeland and a shared, living language. In 1881 he moved to Jerusalem with his wife, Devora, and made a bold decision: in their home, they would speak only Hebrew. Their son, Ben-Zion, is often described as the first child in modern times to grow up with Hebrew as his mother tongue.',
      'There was a big practical problem. Ancient Hebrew had no words for many modern things. Ben-Yehuda created hundreds of new words, often based on old Hebrew roots, and he started a huge dictionary of the language. Some of his words, like "milon" (dictionary) and "glida" (ice cream), are used by everyone today. Others never caught on.',
      'Not everyone liked his ideas. Some religious Jews felt that using a holy language for ordinary conversation was disrespectful, and many people simply found it easier to keep speaking the languages they already knew. Ben-Yehuda was not alone, either. Teachers in the new schools played a huge role, because children who learned in Hebrew brought the language home to their parents.',
      'By the time Ben-Yehuda died in 1922, Hebrew had become one of the official languages of the land. Its revival is considered a rare event in history: a language that had not been spoken in daily life for centuries became the native language of a whole nation.',
    ],
    glossary: [['millions', 'מיליונים'], ['messages', 'הודעות'], ['argue', 'להתווכח'], ['centuries', 'מאות שנים'], ['prayer', 'תפילה'], ['holy', 'קדושים'], ['scholarship', 'לימוד, למדנות'], ['everyday', 'יום־יומי'], ['connected', 'קשור'], ['revival', 'תחייה'], ['spoken', 'מדוברת'], ['empire', 'אימפריה'], ['convinced', 'משוכנע'], ['homeland', 'מולדת'], ['shared', 'משותפת'], ['bold', 'נועזת'], ['decision', 'החלטה'], ['described', 'מתואר'], ['modern', 'מודרני'], ['mother tongue', 'שפת אם'], ['practical', 'מעשית'], ['created', 'יצר'], ['hundreds', 'מאות'], ['based on', 'מבוססות על'], ['roots', 'שורשים'], ['caught on', 'נקלטו, תפסו'], ['religious', 'דתיים'], ['ordinary', 'רגילה'], ['conversation', 'שיחה'], ['disrespectful', 'לא מכבד, חוסר כבוד'], ['simply', 'פשוט'], ['either', 'גם (בשלילה)'], ['role', 'תפקיד'], ['official', 'רשמיות'], ['considered', 'נחשבת'], ['native', 'שפת אם, מולד'], ['nation', 'אומה'], ['Yiddish', 'יידיש'], ['Ladino', 'לדינו'], ['milon', 'מילון'], ['glida', 'גלידה'], ['Jews', 'יהודים'], ['Russian Empire', 'האימפריה הרוסית'], ['Jerusalem', 'ירושלים'], ['Ben-Yehuda', 'בן־יהודה']],
    questions: [
      { q: 'What was Hebrew used for before its revival?', options: ['only for business', 'prayer, holy books and scholarship', 'everyday conversation in every home', 'nothing at all'], answer: 1, explain: 'כתוב: "Hebrew had been the language of prayer, holy books and scholarship, but not of everyday life".' },
      { q: 'What bold decision did Ben-Yehuda and his wife make?', options: ['to move to Russia', 'to speak only Hebrew at home', 'to open a school', 'to write a newspaper in Yiddish'], answer: 1, explain: 'כתוב: "in their home, they would speak only Hebrew".' },
      { q: 'Why did Ben-Yehuda need to create new words?', options: ['Ancient Hebrew had no words for many modern things.', 'He did not like old words.', 'The government asked him.', 'Children could not read.'], answer: 0, explain: 'כתוב: "Ancient Hebrew had no words for many modern things".' },
      { q: 'Why did some religious Jews object to his ideas?', options: ['They felt using a holy language for ordinary talk was disrespectful.', 'They did not know Hebrew.', 'They preferred English.', 'They lived far away.'], answer: 0, explain: 'כתוב: "using a holy language for ordinary conversation was disrespectful".' },
      { q: 'According to the text, how did teachers help the revival?', options: ['They wrote the dictionary.', 'Children who learned in Hebrew brought it home to their parents.', 'They banned other languages.', 'They moved to Jerusalem.'], answer: 1, explain: 'כתוב: "children who learned in Hebrew brought the language home to their parents".' },
    ],
  },
  {
    slug: 'the-last-bus', band: 'g10-12', title: 'The Last Bus', emoji: '🚌', genre: 'סיפור',
    summary: 'סיפור קצר: נועם מפספס את האוטובוס האחרון הביתה, ופוגש על הספסל איש זקן עם סיפור משלו.',
    paragraphs: [
      'Noam checked his phone for the third time. The last bus home was supposed to leave seven minutes ago, and the bus stop was empty. The cold wind from the sea had grown stronger, and his phone battery showed four percent. "Great," he muttered. "Just great."',
      'He had stayed too long at Daniel\'s birthday party. The music had been loud, everyone had been dancing, and he had promised himself he would leave at ten. Now he was alone in a part of Haifa he hardly knew, and his parents thought he was already on his way home.',
      'He was about to call his mother when an old man with a walking stick sat down on the bench beside him. "Missed the last one, didn\'t you?" the man said with a smile. Noam nodded, embarrassed. "Happens to the best of us," said the man. "Once I missed the last bus from Tel Aviv on the night before my wedding. I walked for hours."',
      'Despite himself, Noam laughed. "Did you make it to the wedding?" "Just in time," the man answered. "My wife never let me forget it. Fifty years, and she still tells the story at every family dinner."',
      'They talked for a few minutes, about buses, weddings and the strange way that bad nights become good stories. Then the man pointed to a small sign that Noam hadn\'t noticed: on weekends, a night line left from the next street every hour. "Five minutes\' walk," he said. "You\'ll make it if you hurry."',
      'Noam thanked him, called his mother quickly with the last of his battery, and ran. He caught the night bus just as its doors were closing. As it pulled away, he looked back at the bench. It was empty. Noam realized that he had never even asked the old man\'s name. Still, he had a feeling that one day, he too would tell this story at a family dinner.',
    ],
    glossary: [['checked', 'בדק'], ['supposed to', 'היה אמור'], ['bus stop', 'תחנת אוטובוס'], ['empty', 'ריקה'], ['battery', 'סוללה'], ['percent', 'אחוז'], ['muttered', 'מלמל'], ['promised himself', 'הבטיח לעצמו'], ['hardly', 'בקושי'], ['walking stick', 'מקל הליכה'], ['bench', 'ספסל'], ['beside', 'לצד'], ['missed', 'פספסת'], ['nodded', 'הנהן'], ['embarrassed', 'נבוך'], ['wedding', 'חתונה'], ['despite himself', 'בעל כורחו'], ['make it', 'להספיק, להגיע'], ['just in time', 'ממש בזמן'], ['pointed', 'הצביע'], ['sign', 'שלט'], ['noticed', 'שם לב'], ['hurry', 'ממהר'], ['caught', 'תפס, הספיק לעלות'], ['pulled away', 'התרחק, יצא לדרך'], ['realized', 'הבין'], ['feeling', 'הרגשה'], ['Haifa', 'חיפה'], ['Tel Aviv', 'תל אביב']],
    questions: [
      { q: 'Why did Noam miss the last bus?', options: ['He fell asleep.', 'He stayed too long at a birthday party.', 'The bus did not come.', 'He went to the wrong stop.'], answer: 1, explain: 'כתוב: "He had stayed too long at Daniel\'s birthday party".' },
      { q: 'Why was Noam\'s situation worse than just missing a bus?', options: ['His phone battery was almost empty and he didn\'t know the area.', 'It was raining heavily.', 'He had no money.', 'He lost his keys.'], answer: 0, explain: 'הסוללה הייתה על 4 אחוז, והוא היה "in a part of Haifa he hardly knew".' },
      { q: 'Why did the old man tell Noam about his wedding?', options: ['to make Noam feel that it can happen to anyone', 'to invite him to a wedding', 'to complain about buses', 'to ask for money'], answer: 0, explain: 'הוא אומר "Happens to the best of us" ומספר שגם לו זה קרה — כדי להרגיע את נועם.' },
      { q: 'How did the old man help Noam?', options: ['He drove him home.', 'He showed him a sign about a night bus.', 'He lent him his phone.', 'He called a taxi.'], answer: 1, explain: 'הוא הצביע על שלט: "a night line left from the next street every hour".' },
      { q: 'What does the ending suggest?', options: ['Noam will never take a bus again.', 'This bad night will become a good story Noam tells one day.', 'The old man was Noam\'s grandfather.', 'Noam was punished by his parents.'], answer: 1, explain: 'בסוף נועם מרגיש ש"he too would tell this story at a family dinner" — בדיוק כמו האיש הזקן.' },
    ],
  },
  {
    slug: 'where-did-the-stars-go', band: 'g10-12', title: 'Where Did the Stars Go?', emoji: '🌌', genre: 'טקסט מידע',
    summary: 'מאמר על זיהום אור: למה רוב האנשים כבר לא רואים את שביל החלב, איך זה פוגע בבעלי חיים ובנו, ואיך מתקנים.',
    paragraphs: [
      'For most of human history, the night sky was full of stars. On a clear night, anyone could look up and see thousands of them, along with the soft, cloudy band of the Milky Way. Today, more than a third of the world\'s population can no longer see the Milky Way from where they live. The reason is light pollution.',
      'Light pollution is the extra artificial light that cities produce: streetlights, illuminated advertisements, parking lots, sports stadiums and millions of windows. Much of this light is wasted, because it shines upward or sideways instead of down onto the ground where it is needed. It scatters in the atmosphere and creates a glowing dome over cities that hides all but the brightest stars.',
      'The problem is not only that we lose a beautiful view. Many animals depend on darkness. Migrating birds use the stars to navigate, and brightly lit buildings can confuse them. Newly hatched sea turtles find the sea by moving toward the brighter horizon, but city lights can lead them in the wrong direction. Even humans are affected: artificial light at night can disturb our natural sleep cycle.',
      'In Israel, one of the best places to escape light pollution is Mitzpe Ramon, a small town on the edge of the Ramon Crater in the Negev. Despite its name, the crater was not made by a meteorite; it was shaped by millions of years of erosion. Far from big cities, on a moonless night, visitors can see the Milky Way stretching across the sky.',
      'The good news is that light pollution is one of the easiest kinds of pollution to fix. Unlike plastic in the ocean, it disappears the moment we switch off the lights. Shielded streetlights that point downward, warmer colors, timers and motion sensors can reduce it dramatically, and they save energy and money as well. Getting the stars back may be simpler than we think.',
    ],
    glossary: [['history', 'היסטוריה'], ['along with', 'יחד עם'], ['band', 'רצועה, פס'], ['Milky Way', 'שביל החלב'], ['third', 'שליש'], ['population', 'אוכלוסייה'], ['no longer', 'כבר לא'], ['pollution', 'זיהום'], ['artificial', 'מלאכותי'], ['streetlights', 'פנסי רחוב'], ['illuminated', 'מוארים'], ['advertisements', 'פרסומות, שלטי פרסום'], ['parking lots', 'חניונים'], ['stadiums', 'אצטדיונים'], ['wasted', 'מבוזבז'], ['upward', 'כלפי מעלה'], ['sideways', 'הצידה'], ['scatters', 'מתפזר'], ['atmosphere', 'אטמוספרה'], ['dome', 'כיפה'], ['depend on', 'תלויים ב־'], ['darkness', 'חושך'], ['migrating', 'נודדות'], ['navigate', 'לנווט'], ['newly', 'זה עתה'], ['hatched', 'שבקעו'], ['horizon', 'אופק'], ['direction', 'כיוון'], ['affected', 'מושפעים'], ['disturb', 'להפריע, לשבש'], ['cycle', 'מחזור'], ['escape', 'לברוח, להימלט'], ['crater', 'מכתש'], ['despite', 'למרות'], ['meteorite', 'מטאוריט'], ['erosion', 'סחיפה, בלייה'], ['moonless', 'בלי ירח'], ['stretching', 'נמתח, משתרע'], ['unlike', 'בניגוד ל־'], ['shielded', 'מוגנים, עם מגן'], ['timers', 'שעוני שבת, טיימרים'], ['motion sensors', 'חיישני תנועה'], ['dramatically', 'באופן דרמטי, מאוד'], ['energy', 'אנרגיה'], ['simpler', 'פשוט יותר'], ['downward', 'כלפי מטה'], ['Mitzpe Ramon', 'מצפה רמון'], ['Ramon Crater', 'מכתש רמון'], ['Negev', 'הנגב']],
    questions: [
      { q: 'What is light pollution, according to the text?', options: ['smoke from factories', 'extra artificial light produced by cities', 'light from the Moon', 'dirty water in the sea'], answer: 1, explain: 'כתוב: "Light pollution is the extra artificial light that cities produce".' },
      { q: 'Why is much of the light in cities "wasted"?', options: ['It shines upward or sideways instead of down.', 'It is too weak.', 'People sleep at night.', 'It is too expensive.'], answer: 0, explain: 'כתוב: "it shines upward or sideways instead of down onto the ground where it is needed".' },
      { q: 'How does light pollution affect sea turtles?', options: ['It makes them grow faster.', 'City lights can lead newly hatched turtles in the wrong direction.', 'It keeps them warm.', 'It helps them find food.'], answer: 1, explain: 'הצבים הקטנים זזים לעבר האופק הבהיר, ו"city lights can lead them in the wrong direction".' },
      { q: 'What does the text say about the Ramon Crater?', options: ['A meteorite made it.', 'It was shaped by erosion over millions of years.', 'It is a volcano.', 'It is full of lights.'], answer: 1, explain: 'כתוב: "the crater was not made by a meteorite; it was shaped by millions of years of erosion".' },
      { q: 'Why does the writer say light pollution is easy to fix?', options: ['It disappears as soon as we switch off the lights.', 'It is not dangerous.', 'Only a few cities have it.', 'The government already fixed it.'], answer: 0, explain: 'כתוב: "Unlike plastic in the ocean, it disappears the moment we switch off the lights".' },
    ],
  },
  {
    slug: 'should-homework-be-banned', band: 'g10-12', title: 'Should Homework Be Banned?', emoji: '📝', genre: 'מאמר דעה',
    summary: 'מאמר דעה של תלמיד: האם לבטל שיעורי בית? טיעונים בעד ונגד, והצעה לדרך אחרת.',
    paragraphs: [
      'Ask any student what they would change about school, and there is a good chance the answer will be: "Less homework!" In recent years, some schools around the world have reduced homework or even stopped giving it to younger children. Should schools in Israel do the same? In my opinion, homework should not be banned, but it should be changed.',
      'Supporters of a ban make some strong points. Many teenagers spend long hours at school and then several more hours on homework, which leaves little time for sport, hobbies, family and sleep. Homework can also be unfair. A student whose parents can help, or who has a quiet room and a computer, has a clear advantage over a student who shares a small apartment with four brothers and sisters. In addition, research suggests that for young children, homework does not improve achievement very much.',
      'However, banning homework completely would be a mistake. Some skills, such as reading, writing and solving math problems, simply require practice, and there is not enough time in class for all of it. Homework also teaches responsibility and time management — skills we will need at university and at work, where nobody reminds us of every deadline.',
      'The real problem is not homework itself, but bad homework: long lists of repetitive exercises that nobody checks. A better approach would be short, meaningful tasks, such as reading a chapter of a book we chose ourselves, interviewing a grandparent for a history project or trying a simple experiment at home. Teachers of different subjects could also coordinate, so that students do not get five tasks on the same evening.',
      'In conclusion, homework is like medicine: the right amount helps, but too much can be harmful. Instead of arguing about whether to ban it, we should be talking about how to make it worth doing.',
    ],
    glossary: [['chance', 'סיכוי'], ['recent', 'אחרונות'], ['reduced', 'צמצמו'], ['opinion', 'דעה'], ['banned', 'לאסור, לבטל'], ['supporters', 'תומכים'], ['ban', 'איסור, ביטול'], ['points', 'טיעונים, נקודות'], ['teenagers', 'בני נוער'], ['leaves', 'משאיר'], ['hobbies', 'תחביבים'], ['unfair', 'לא הוגן'], ['advantage', 'יתרון'], ['apartment', 'דירה'], ['in addition', 'בנוסף'], ['research', 'מחקר'], ['improve', 'לשפר'], ['achievement', 'הישגים'], ['mistake', 'טעות'], ['skills', 'מיומנויות'], ['solving', 'פתרון'], ['require', 'דורשות'], ['practice', 'תרגול'], ['responsibility', 'אחריות'], ['management', 'ניהול'], ['university', 'אוניברסיטה'], ['deadline', 'מועד אחרון להגשה'], ['itself', 'עצמו'], ['repetitive', 'חוזרים על עצמם'], ['approach', 'גישה'], ['meaningful', 'משמעותיות'], ['tasks', 'משימות'], ['chapter', 'פרק'], ['interviewing', 'לראיין'], ['project', 'פרויקט, עבודה'], ['coordinate', 'לתאם'], ['in conclusion', 'לסיכום'], ['medicine', 'תרופה'], ['amount', 'כמות'], ['harmful', 'מזיק'], ['worth doing', 'שווה לעשות']],
    questions: [
      { q: 'What is the writer\'s main opinion?', options: ['Homework should be banned.', 'Homework should not be banned, but it should be changed.', 'There should be more homework.', 'Only young children need homework.'], answer: 1, explain: 'כתוב בסוף הפסקה הראשונה: "homework should not be banned, but it should be changed".' },
      { q: 'Why can homework be unfair, according to supporters of a ban?', options: ['Some students have more help and better conditions at home.', 'Teachers give different grades.', 'Some subjects are harder.', 'Homework is too short.'], answer: 0, explain: 'תלמיד שההורים עוזרים לו ויש לו חדר שקט ומחשב "has a clear advantage".' },
      { q: 'Which argument does the writer give FOR homework?', options: ['It keeps children busy.', 'It teaches responsibility and time management.', 'Parents like it.', 'It makes school longer.'], answer: 1, explain: 'כתוב: "Homework also teaches responsibility and time management".' },
      { q: 'What does the writer mean by "bad homework"?', options: ['homework that is too short', 'long repetitive exercises that nobody checks', 'homework about history', 'reading books'], answer: 1, explain: 'כתוב: "bad homework: long lists of repetitive exercises that nobody checks".' },
      { q: 'Why does the writer compare homework to medicine?', options: ['Both taste bad.', 'The right amount helps, but too much can be harmful.', 'Both are given by doctors.', 'Both are expensive.'], answer: 1, explain: 'כתוב: "the right amount helps, but too much can be harmful".' },
    ],
  },
  {
    slug: 'grandpas-watch', band: 'g10-12', title: 'Grandpa\'s Watch', emoji: '⌚', genre: 'סיפור',
    summary: 'סיפור קצר: יעל מקבלת בירושה שעון כיס ישן, ומגלה דרכו את סיפור העלייה של סבא שלה.',
    paragraphs: [
      'The watch arrived in a small cardboard box, three weeks after Grandpa Shmuel\'s funeral. Inside, wrapped in an old handkerchief, was a silver pocket watch with cracked glass, and a note in Grandpa\'s shaky handwriting: "For Yael. Ask your mother about the train."',
      'Yael had never seen the watch before. It had stopped at twenty past four, and on the back there were some words engraved in a language she couldn\'t read. That evening she showed it to her mother, who sat down slowly at the kitchen table.',
      '"Your grandfather was nine years old when he came to Israel," her mother began. "His family left Morocco with almost nothing. In Marseille, in France, they had to change trains, and in the crowd, Grandpa got separated from his parents. He was alone on the platform with a suitcase that wasn\'t even his."',
      '"An old railway worker found him crying. The man didn\'t speak Arabic or Hebrew, and Grandpa didn\'t speak French, but the man sat with him for hours, sharing his bread and showing him how his watch worked, to keep him calm. When Grandpa\'s father finally came running down the platform, the stranger pressed the watch into the boy\'s hand and walked away before anyone could thank him."',
      'Yael looked at the watch again. "So the words on the back are French?" Her mother nodded. They searched online together and translated them: "Time always brings us home."',
      'The next day, Yael took the watch to a small repair shop on the corner. The watchmaker opened it carefully, cleaned it and replaced the broken glass. When he handed it back, it was ticking. Yael held it to her ear for a long time. She decided that one day she would travel to Marseille, stand on that platform and say the thank-you that her grandfather had never been able to say.',
    ],
    glossary: [['watch', 'שעון (יד/כיס)'], ['arrived', 'הגיע'], ['cardboard', 'קרטון'], ['funeral', 'הלוויה'], ['wrapped', 'עטוף'], ['handkerchief', 'ממחטה'], ['pocket watch', 'שעון כיס'], ['cracked', 'סדוקה'], ['note', 'פתק'], ['shaky', 'רועד'], ['handwriting', 'כתב יד'], ['twenty past four', 'ארבע ועשרים'], ['engraved', 'חרוטות'], ['Morocco', 'מרוקו'], ['crowd', 'המון, קהל'], ['separated', 'נפרד, הופרד'], ['platform', 'רציף'], ['suitcase', 'מזוודה'], ['railway', 'רכבת, מסילת ברזל'], ['sharing', 'חלק איתו'], ['calm', 'רגוע'], ['stranger', 'אדם זר'], ['pressed', 'לחץ, תחב'], ['nodded', 'הנהנה'], ['searched', 'חיפשו'], ['online', 'ברשת'], ['translated', 'תרגמו'], ['repair shop', 'חנות תיקונים'], ['watchmaker', 'שען'], ['carefully', 'בזהירות'], ['replaced', 'החליף'], ['handed', 'מסר, נתן ביד'], ['ticking', 'מתקתק'], ['ear', 'אוזן'], ['Marseille', 'מרסיי'], ['France', 'צרפת'], ['French', 'צרפתית']],
    questions: [
      { q: 'What did Grandpa\'s note ask Yael to do?', options: ['to fix the watch', 'to ask her mother about the train', 'to travel to France', 'to learn French'], answer: 1, explain: 'בפתק כתוב: "Ask your mother about the train".' },
      { q: 'What happened to Grandpa in Marseille?', options: ['He lost his watch.', 'He got separated from his parents in the crowd.', 'He missed his flight.', 'He found a job at the railway.'], answer: 1, explain: 'כתוב: "in the crowd, Grandpa got separated from his parents".' },
      { q: 'How did the railway worker keep the boy calm without a shared language?', options: ['He sang songs.', 'He shared his bread and showed him how his watch worked.', 'He called the police.', 'He bought him a toy.'], answer: 1, explain: 'כתוב: "sharing his bread and showing him how his watch worked, to keep him calm".' },
      { q: 'Why does the story say Grandpa "had never been able to say" thank you?', options: ['He did not want to.', 'The stranger walked away before anyone could thank him.', 'He forgot.', 'He was angry at the man.'], answer: 1, explain: 'כתוב: "walked away before anyone could thank him".' },
      { q: 'What is the meaning of the words engraved on the watch?', options: ['Time always brings us home.', 'Never be late.', 'For my son.', 'Made in France.'], answer: 0, explain: 'יעל ואמא תרגמו את המילים: "Time always brings us home".' },
    ],
  },
]

// The right option moves to a fixed position per question (a hash of slug and number), so answers are
// spread over a–d and the page, the printout and its answer key always agree.
function placeAnswers(slug, questions) {
  return questions.map((q, i) => {
    const pos = [...`${slug}-${i}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % q.options.length
    const options = q.options.filter((o, j) => j !== q.answer)
    options.splice(pos, 0, q.options[q.answer])
    return { ...q, options, answer: pos }
  })
}
export const READING_STORIES = RAW.map(s => ({ ...s, questions: placeAnswers(s.slug, s.questions) }))

export const readingBySlug = slug => READING_STORIES.find(s => s.slug === slug)
export const readingHref = s => `${READING_PATH}/${s.slug}`
export const bandOfStory = s => READING_BANDS.find(b => b.id === s.band)
export const storiesInBand = id => READING_STORIES.filter(s => s.band === id)
// Words as the page and the tests count them ("don't" is one word, "3:30" two numbers).
export const WORD_RE = /[A-Za-z0-9]+(?:['’][A-Za-z]+)?/g
export const wordCount = s => s.paragraphs.join(' ').match(WORD_RE)?.length || 0

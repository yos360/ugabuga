// More data for /learn/hebrew-for-olim: extra word topics (translations of the shared words come from
// vocab.js through translate() in hebrewForOlim.js), hand-written phrase topics, the alphabet,
// the classroom board, the 4-week plan and the education-system glossary for parents.
// Hebrew items: key -> [Hebrew, Hebrew with niqqud (or ''), Latin transliteration, emoji].

export const H_MORE = {
  // animals
  dog: ['כלב', 'כֶּלֶב', 'kelev', '🐶'], cat: ['חתול', 'חָתוּל', 'chatul', '🐱'], horse: ['סוס', 'סוּס', 'sus', '🐴'],
  cow: ['פרה', 'פָּרָה', 'para', '🐄'], sheep: ['כבשה', 'כִּבְשָׂה', 'kivsa', '🐑'], chicken: ['תרנגולת', 'תַּרְנְגֹלֶת', 'tarnegolet', '🐔'],
  fish: ['דג', 'דָּג', 'dag', '🐟'], bird: ['ציפור', 'צִפּוֹר', 'tsipor', '🐦'], lion: ['אריה', 'אַרְיֵה', 'aryeh', '🦁'],
  elephant: ['פיל', 'פִּיל', 'pil', '🐘'], monkey: ['קוף', 'קוֹף', 'kof', '🐵'], rabbit: ['ארנב', 'אַרְנָב', 'arnav', '🐰'],
  frog: ['צפרדע', 'צְפַרְדֵּעַ', 'tsfardea', '🐸'], bear: ['דוב', 'דֹּב', 'dov', '🐻'],
  giraffe: ['ג׳ירפה', '', 'jirafa', '🦒'], turtle: ['צב', 'צָב', 'tsav', '🐢'], snake: ['נחש', 'נָחָשׁ', 'nachash', '🐍'],
  butterfly: ['פרפר', 'פַּרְפַּר', 'parpar', '🦋'], bee: ['דבורה', 'דְּבוֹרָה', 'dvora', '🐝'], mouse: ['עכבר', 'עַכְבָּר', 'achbar', '🐭'],
  penguin: ['פינגווין', '', 'pingvin', '🐧'], fox: ['שועל', 'שׁוּעָל', 'shual', '🦊'], duck: ['ברווז', 'בַּרְוָז', 'barvaz', '🦆'],
  // things at home and in the street
  house: ['בית', 'בַּיִת', 'bayit', '🏠'], ball: ['כדור', 'כַּדּוּר', 'kadur', '⚽'], key: ['מפתח', 'מַפְתֵּחַ', 'maftei’ach', '🔑'],
  car: ['מכונית', 'מְכוֹנִית', 'mechonit', '🚗'], bus: ['אוטובוס', 'אוֹטוֹבּוּס', 'otobus', '🚌'], bicycle: ['אופניים', 'אוֹפַנַּיִם', 'ofanayim', '🚲'],
  airplane: ['מטוס', 'מָטוֹס', 'matos', '✈️'],
  // nature and weather
  sun: ['שמש', 'שֶׁמֶשׁ', 'shemesh', '☀️'], moon: ['ירח', 'יָרֵחַ', 'yare’ach', '🌙'], star: ['כוכב', 'כּוֹכָב', 'kochav', '⭐'],
  tree: ['עץ', 'עֵץ', 'ets', '🌳'], flower: ['פרח', 'פֶּרַח', 'perach', '🌼'], rain: ['גשם', 'גֶּשֶׁם', 'geshem', '🌧️'],
  snow: ['שלג', 'שֶׁלֶג', 'sheleg', '❄️'], sea: ['ים', 'יָם', 'yam', '🌊'], cloud: ['ענן', 'עָנָן', 'anan', '☁️'],
  rainbow: ['קשת בענן', 'קֶשֶׁת בֶּעָנָן', 'keshet be’anan', '🌈'], mountain: ['הר', 'הַר', 'har', '⛰️'],
  // clothes
  shirt: ['חולצה', 'חֻלְצָה', 'chultsa', '👕'], pants: ['מכנסיים', 'מִכְנָסַיִם', 'michnasayim', '👖'], dress: ['שמלה', 'שִׂמְלָה', 'simla', '👗'],
  sneakers: ['נעל ספורט', 'נַעַל סְפּוֹרְט', 'na’al sport', '👟'], socks: ['גרביים', 'גַּרְבַּיִם', 'garbayim', '🧦'], coat: ['מעיל', 'מְעִיל', 'me’il', '🧥'],
  glasses: ['משקפיים', 'מִשְׁקָפַיִם', 'mishkafayim', '👓'], gloves: ['כפפות', 'כְּפָפוֹת', 'kfafot', '🧤'], scarf: ['צעיף', 'צָעִיף', 'tsa’if', '🧣'],
  cap: ['כובע', 'כּוֹבַע', 'kova', '🧢'],
  // people
  boy: ['ילד', 'יֶלֶד', 'yeled', '👦'], girl: ['ילדה', 'יַלְדָּה', 'yalda', '👧'], woman: ['אישה', 'אִשָּׁה', 'isha', '👩'], man: ['איש', 'אִישׁ', 'ish', '👨'],
  // vegetables and sweets
  carrot: ['גזר', 'גֶּזֶר', 'gezer', '🥕'], tomato: ['עגבנייה', 'עַגְבָּנִיָּה', 'agvania', '🍅'], corn: ['תירס', 'תִּירָס', 'tiras', '🌽'],
  mushroom: ['פטרייה', 'פִּטְרִיָּה', 'pitriya', '🍄'], pear: ['אגס', 'אֲגַס', 'agas', '🍐'], cherries: ['דובדבנים', 'דֻּבְדְּבָנִים', 'duvdevanim', '🍒'],
  pizza: ['פיצה', 'פִּיצָה', 'pitsa', '🍕'], icecream: ['גלידה', 'גְּלִידָה', 'glida', '🍦'], chocolate: ['שוקולד', 'שׁוֹקוֹלָד', 'shokolad', '🍫'],
  // toys
  balloon: ['בלון', 'בָּלוֹן', 'balon', '🎈'], teddy: ['דובי', 'דֻּבִּי', 'dubi', '🧸'], gift: ['מתנה', 'מַתָּנָה', 'matana', '🎁'],
  kite: ['עפיפון', 'עֲפִיפוֹן', 'afifon', '🪁'], drum: ['תוף', 'תֹּף', 'tof', '🥁'], guitar: ['גיטרה', 'גִּיטָרָה', 'gitara', '🎸'],

  // phrases in class (plain spelling)
  c_ask: ['אפשר לשאול שאלה?', '', 'efshar lish’ol she’ela?', '🙋'],
  c_done: ['סיימתי', '', 'siyamti', '✔️'],
  c_nohear: ['לא שמעתי', '', 'lo shamati', '👂'],
  c_again: ['אפשר עוד פעם?', '', 'efshar od pa’am?', '🔁'],
  c_slow: ['אפשר לדבר לאט יותר?', '', 'efshar ledaber le’at yoter?', '🐢'],
  c_where: ['איפה…?', '', 'eifo…?', '📍'],
  c_dontknow: ['אני לא יודע/ת', '', 'ani lo yode’a / yoda’at', '🤔'],
  c_out: ['אפשר לצאת?', '', 'efshar latset?', '🚪'],
  c_howsay: ['איך אומרים בעברית…?', '', 'eich omrim be’ivrit…?', '💬'],
  // feelings
  f_happy: ['אני שמח/ה', '', 'ani same’ach / smecha', '😊'],
  f_sad: ['אני עצוב/ה', '', 'ani atsuv / atsuva', '😢'],
  f_scared: ['אני פוחד/ת', '', 'ani pochad / pochedet', '😨'],
  f_tired: ['אני עייף/ה', '', 'ani ayef / ayefa', '😴'],
  f_angry: ['אני כועס/ת', '', 'ani koes / koeset', '😠'],
  f_miss: ['אני מתגעגע/ת', '', 'ani mitga’age’a / mitga’aga’at', '💔'],
  f_cold: ['קר לי', '', 'kar li', '🥶'],
  f_hot: ['חם לי', '', 'cham li', '🥵'],
  f_ok: ['אני בסדר', '', 'ani beseder', '🙂'],
  // yard and play
  p_join: ['אפשר לשחק איתכם?', '', 'efshar lesachek itchem?', '🤸'],
  p_myturn: ['תורי', '', 'tori', '🙋'],
  p_yourturn: ['תורך', '', 'torcha / torech', '👉'],
  p_lets: ['בוא/י נשחק', '', 'bo / bo’i nesachek', '🎲'],
  p_mine: ['זה שלי', '', 'ze sheli', '🙌'],
  p_sorry: ['סליחה', '', 'slicha', '🙇'],
  p_stop: ['די, זה לא נעים לי', '', 'dai, ze lo na’im li', '✋'],
  p_friends: ['בוא/י נהיה חברים', '', 'bo / bo’i nihiye chaverim', '🤝'],
}

export const EN_MORE = {
  dog: 'dog', cat: 'cat', horse: 'horse', cow: 'cow', sheep: 'sheep', chicken: 'chicken', fish: 'fish', bird: 'bird', lion: 'lion', elephant: 'elephant',
  monkey: 'monkey', rabbit: 'rabbit', frog: 'frog', bear: 'bear', giraffe: 'giraffe', turtle: 'turtle', snake: 'snake', butterfly: 'butterfly', bee: 'bee',
  mouse: 'mouse', penguin: 'penguin', fox: 'fox', duck: 'duck',
  house: 'house', ball: 'ball', key: 'key', car: 'car', bus: 'bus', bicycle: 'bicycle', airplane: 'airplane',
  sun: 'sun', moon: 'moon', star: 'star', tree: 'tree', flower: 'flower', rain: 'rain', snow: 'snow', sea: 'sea', cloud: 'cloud', rainbow: 'rainbow', mountain: 'mountain',
  shirt: 'shirt', pants: 'pants', dress: 'dress', sneakers: 'sneaker', socks: 'socks', coat: 'coat', glasses: 'glasses', gloves: 'gloves', scarf: 'scarf', cap: 'cap',
  boy: 'boy', girl: 'girl', woman: 'woman', man: 'man',
  carrot: 'carrot', tomato: 'tomato', corn: 'corn', mushroom: 'mushroom', pear: 'pear', cherries: 'cherries', pizza: 'pizza', icecream: 'ice cream', chocolate: 'chocolate',
  balloon: 'balloon', teddy: 'teddy bear', gift: 'gift', kite: 'kite', drum: 'drum', guitar: 'guitar',
  c_ask: 'Can I ask a question?', c_done: 'I’m finished.', c_nohear: 'I didn’t hear.', c_again: 'Can you say it again?', c_slow: 'Can you speak more slowly?',
  c_where: 'Where is…?', c_dontknow: 'I don’t know.', c_out: 'Can I go out?', c_howsay: 'How do you say … in Hebrew?',
  f_happy: 'I’m happy.', f_sad: 'I’m sad.', f_scared: 'I’m scared.', f_tired: 'I’m tired.', f_angry: 'I’m angry.', f_miss: 'I miss someone.',
  f_cold: 'I’m cold.', f_hot: 'I’m hot.', f_ok: 'I’m okay.',
  p_join: 'Can I play with you?', p_myturn: 'It’s my turn.', p_yourturn: 'It’s your turn.', p_lets: 'Let’s play!', p_mine: 'This is mine.',
  p_sorry: 'Sorry.', p_stop: 'Stop, I don’t like it.', p_friends: 'Let’s be friends!',
}

// Phrases written by hand (plain, everyday, neutral forms). Amharic is written only where we are
// sure of it; a phrase without Amharic is simply left out of the Amharic cards.
export const EXTRA_MORE = {
  ru: {
    c_ask: 'Можно задать вопрос?', c_done: 'Я закончил(а).', c_nohear: 'Я не расслышал(а).', c_again: 'Можно ещё раз?', c_slow: 'Можно говорить помедленнее?',
    c_where: 'Где…?', c_dontknow: 'Я не знаю.', c_out: 'Можно выйти?', c_howsay: 'Как сказать на иврите…?',
    f_happy: 'Я рад(а).', f_sad: 'Мне грустно.', f_scared: 'Мне страшно.', f_tired: 'Я устал(а).', f_angry: 'Я злюсь.', f_miss: 'Я скучаю.',
    f_cold: 'Мне холодно.', f_hot: 'Мне жарко.', f_ok: 'Я в порядке.',
    p_join: 'Можно с вами поиграть?', p_myturn: 'Теперь моя очередь.', p_yourturn: 'Теперь твоя очередь.', p_lets: 'Давай поиграем!', p_mine: 'Это моё.',
    p_sorry: 'Извини.', p_stop: 'Хватит, мне это неприятно.', p_friends: 'Давай дружить!',
  },
  fr: {
    c_ask: 'Je peux poser une question ?', c_done: 'J’ai fini.', c_nohear: 'Je n’ai pas entendu.', c_again: 'Encore une fois, s’il vous plaît.', c_slow: 'Vous pouvez parler plus lentement ?',
    c_where: 'Où est… ?', c_dontknow: 'Je ne sais pas.', c_out: 'Je peux sortir ?', c_howsay: 'Comment dit-on en hébreu… ?',
    f_happy: 'Je suis content(e).', f_sad: 'Je suis triste.', f_scared: 'J’ai peur.', f_tired: 'Je suis fatigué(e).', f_angry: 'Je suis en colère.', f_miss: 'Quelqu’un me manque.',
    f_cold: 'J’ai froid.', f_hot: 'J’ai chaud.', f_ok: 'Ça va.',
    p_join: 'Je peux jouer avec vous ?', p_myturn: 'C’est mon tour.', p_yourturn: 'C’est ton tour.', p_lets: 'On joue ?', p_mine: 'C’est à moi.',
    p_sorry: 'Pardon.', p_stop: 'Arrête, ça ne me plaît pas.', p_friends: 'Devenons amis !',
  },
  ar: {
    c_ask: 'هل يمكنني أن أسأل سؤالًا؟', c_done: 'انتهيت.', c_nohear: 'لم أسمع.', c_again: 'من فضلك، مرّة أخرى.', c_slow: 'هل يمكنك أن تتكلّم ببطء أكثر؟',
    c_where: 'أين…؟', c_dontknow: 'لا أعرف.', c_out: 'هل يمكنني الخروج؟', c_howsay: 'كيف نقول بالعبرية…؟',
    f_happy: 'أنا سعيد / سعيدة.', f_sad: 'أنا حزين / حزينة.', f_scared: 'أنا خائف / خائفة.', f_tired: 'أنا متعب / متعبة.', f_angry: 'أنا غاضب / غاضبة.', f_miss: 'أنا مشتاق / مشتاقة.',
    f_cold: 'أشعر بالبرد.', f_hot: 'أشعر بالحرّ.', f_ok: 'أنا بخير.',
    p_join: 'هل يمكنني أن ألعب معكم؟', p_myturn: 'دوري.', p_yourturn: 'دورك.', p_lets: 'هيا نلعب!', p_mine: 'هذا لي.',
    p_sorry: 'آسف / آسفة.', p_stop: 'كفى، هذا لا يعجبني.', p_friends: 'هيا نصبح أصدقاء!',
  },
  // Amharic: only phrases we are highly confident about.
  am: {
    c_ask: 'ጥያቄ መጠየቅ እችላለሁ?', c_done: 'ጨርሻለሁ።', c_nohear: 'አልሰማሁም።', c_where: '… የት ነው?', c_dontknow: 'አላውቅም።', c_out: 'መውጣት እችላለሁ?',
    f_happy: 'ደስተኛ ነኝ።', f_sad: 'አዝኛለሁ።', f_scared: 'ፈርቻለሁ።', f_tired: 'ደክሞኛል።', f_ok: 'ደህና ነኝ።',
    p_join: 'ከእናንተ ጋር መጫወት እችላለሁ?', p_myturn: 'የኔ ተራ ነው።', p_lets: 'እንጫወት!', p_mine: 'ይህ የኔ ነው።', p_sorry: 'ይቅርታ።',
  },
}

// New topics (added to the topic list by hebrewForOlim.js).
export const PHRASE_TOPICS = [
  { id: 'classphr', emoji: '🙋', title: 'בכיתה – משפטים', pics: false,
    keys: ['c_ask', 'c_done', 'c_nohear', 'c_again', 'c_slow', 'c_where', 'c_dontknow', 'c_out', 'c_howsay'] },
  { id: 'feelings', emoji: '💛', title: 'רגשות', pics: false,
    keys: ['f_happy', 'f_sad', 'f_scared', 'f_tired', 'f_angry', 'f_miss', 'f_cold', 'f_hot', 'f_ok'] },
  { id: 'play', emoji: '⚽', title: 'בחצר ובמשחק', pics: false,
    keys: ['p_join', 'p_lets', 'p_myturn', 'p_yourturn', 'p_mine', 'p_sorry', 'p_stop', 'p_friends'] },
]

export const PIC_TOPICS = [
  { id: 'veggies', emoji: '🥕', title: 'ירקות ומתוקים', pics: true, keys: ['carrot', 'tomato', 'corn', 'mushroom', 'pear', 'cherries', 'pizza', 'icecream', 'chocolate'] },
  { id: 'animals', emoji: '🐾', title: 'חיות', pics: true, keys: ['dog', 'cat', 'horse', 'cow', 'sheep', 'chicken', 'fish', 'bird', 'lion', 'elephant', 'monkey', 'rabbit', 'frog', 'bear',
    'giraffe', 'turtle', 'snake', 'butterfly', 'bee', 'mouse', 'penguin', 'fox', 'duck'] },
  { id: 'things', emoji: '🏠', title: 'בבית וברחוב', pics: true, keys: ['house', 'chair', 'book', 'ball', 'key', 'car', 'bus', 'bicycle', 'airplane'] },
  { id: 'nature', emoji: '🌳', title: 'טבע ומזג אוויר', pics: true, keys: ['sun', 'moon', 'star', 'tree', 'flower', 'rain', 'snow', 'sea', 'cloud', 'rainbow', 'mountain'] },
  { id: 'clothes', emoji: '👕', title: 'בגדים', pics: true, keys: ['shirt', 'pants', 'dress', 'sneakers', 'socks', 'coat', 'glasses', 'gloves', 'scarf', 'cap'] },
  { id: 'toys', emoji: '🎈', title: 'משחקים וכיף', pics: true, keys: ['balloon', 'teddy', 'gift', 'kite', 'drum', 'guitar'] },
]

// The classroom communication board: 12 cells.
export const BOARD_KEYS = ['toilet', 'drink', 'hungry', 'hurts', 'help', 'understand', 'yes', 'no', 'f_tired', 'f_cold', 'c_done', 'c_out']

// The 4-week plan: 15 items a week (3 a day, 5 days). Needs first.
export const PLAN_WEEKS = [
  { title: 'שבוע 1: להסתדר בכיתה', keys: ['hello', 'thanks', 'please', 'yes', 'no', 'understand', 'toilet', 'drink', 'hungry', 'hurts', 'help', 'what', 'name', 'speak', 'c_out'] },
  { title: 'שבוע 2: כיתה וציוד', keys: ['teacher', 'friend', 'school', 'chair', 'book', 'recess', 'pencil', 'pen', 'notebook', 'ruler', 'scissors', 'schoolbag', 'books', 'c_ask', 'c_done'] },
  { title: 'שבוע 3: גוף ומשפחה', keys: ['eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'tooth', 'mom', 'dad', 'grandma', 'grandpa', 'brother', 'sister', 'baby', 'f_ok'] },
  { title: 'שבוע 4: אוכל וצבעים', keys: ['water', 'milk', 'bread', 'egg', 'cheese', 'apple', 'banana', 'cake', 'red', 'blue', 'green', 'yellow', 'orange', 'white', 'black'] },
]

// The Hebrew alphabet. sound: Latin transliteration of the sound. word/tr/emoji: an example word.
export const ALPHABET = [
  { l: 'א', name: 'אלף', sound: 'a (silent)', word: 'ארנב', tr: 'arnav', emoji: '🐰', note: 'האות עצמה כמעט לא נשמעת. הניקוד קובע את התנועה.' },
  { l: 'ב', name: 'בית', sound: 'b / v', word: 'בננה', tr: 'banana', emoji: '🍌', note: 'עם נקודה (בּ) נשמע b, בלי נקודה נשמע v.' },
  { l: 'ג', name: 'גימל', sound: 'g', word: 'גמל', tr: 'gamal', emoji: '🐪' },
  { l: 'ד', name: 'דלת', sound: 'd', word: 'דג', tr: 'dag', emoji: '🐟' },
  { l: 'ה', name: 'הא', sound: 'h', word: 'הר', tr: 'har', emoji: '⛰️', note: 'בסוף מילה היא לפעמים שקטה.' },
  { l: 'ו', name: 'וו', sound: 'v', word: 'ורד', tr: 'vered', emoji: '🌹', note: 'לפעמים משמשת גם לצליל o או u.' },
  { l: 'ז', name: 'זין', sound: 'z', word: 'זברה', tr: 'zebra', emoji: '🦓' },
  { l: 'ח', name: 'חית', sound: 'ch (כמו ב-Bach)', word: 'חתול', tr: 'chatul', emoji: '🐱', note: 'צליל חזק מהגרון.' },
  { l: 'ט', name: 'טית', sound: 't', word: 'טלפון', tr: 'telefon', emoji: '📞' },
  { l: 'י', name: 'יוד', sound: 'y', word: 'יד', tr: 'yad', emoji: '✋', note: 'לפעמים משמשת גם לצליל i.' },
  { l: 'כ', name: 'כף', sound: 'k / ch', word: 'כלב', tr: 'kelev', emoji: '🐶', note: 'עם נקודה (כּ) נשמע k, בלי נקודה נשמע ch.' },
  { l: 'ל', name: 'למד', sound: 'l', word: 'לימון', tr: 'limon', emoji: '🍋' },
  { l: 'מ', name: 'מם', sound: 'm', word: 'מים', tr: 'mayim', emoji: '💧' },
  { l: 'נ', name: 'נון', sound: 'n', word: 'נעל', tr: 'na’al', emoji: '👟' },
  { l: 'ס', name: 'סמך', sound: 's', word: 'סוס', tr: 'sus', emoji: '🐴' },
  { l: 'ע', name: 'עין', sound: 'a (silent)', word: 'עין', tr: 'ayin', emoji: '👁️', note: 'כמו א, כמעט לא נשמעת. אצל חלק מהדוברים צליל קצר מהגרון.' },
  { l: 'פ', name: 'פא', sound: 'p / f', word: 'פיל', tr: 'pil', emoji: '🐘', note: 'עם נקודה (פּ) נשמע p, בלי נקודה נשמע f.' },
  { l: 'צ', name: 'צדי', sound: 'ts', word: 'צפרדע', tr: 'tsfardea', emoji: '🐸' },
  { l: 'ק', name: 'קוף', sound: 'k', word: 'קוף', tr: 'kof', emoji: '🐵', note: 'נשמעת כמו כּ.' },
  { l: 'ר', name: 'ריש', sound: 'r', word: 'רכבת', tr: 'rakevet', emoji: '🚆', note: 'נאמרת בדרך כלל מהגרון.' },
  { l: 'ש', name: 'שין', sound: 'sh / s', word: 'שמש', tr: 'shemesh', emoji: '☀️', note: 'נקודה מימין (שׁ) נשמע sh, נקודה משמאל (שׂ) נשמע s.' },
  { l: 'ת', name: 'תיו', sound: 't', word: 'תפוח', tr: 'tapuach', emoji: '🍎', note: 'נשמעת כמו ט.' },
  { l: 'ך', name: 'כף סופית', sound: 'ch', word: 'מלך', tr: 'melech', emoji: '👑', final: true },
  { l: 'ם', name: 'מם סופית', sound: 'm', word: 'ים', tr: 'yam', emoji: '🌊', final: true },
  { l: 'ן', name: 'נון סופית', sound: 'n', word: 'לימון', tr: 'limon', emoji: '🍋', final: true },
  { l: 'ף', name: 'פא סופית', sound: 'f', word: 'אף', tr: 'af', emoji: '👃', final: true },
  { l: 'ץ', name: 'צדי סופית', sound: 'ts', word: 'עץ', tr: 'ets', emoji: '🌳', final: true },
]

// Glossary for olim parents: [term, plain-Hebrew explanation, English gloss].
export const GLOSSARY = [
  ['גן חובה', 'גן הילדים של השנה האחרונה לפני כיתה א׳, בגיל חמש עד שש בערך. כדאי לברר מול הרשות המקומית איך ומתי נרשמים.', 'Kindergarten (the year before 1st grade)'],
  ['צהרון', 'מסגרת אחרי שעות הלימודים, עם השגחה, אוכל ופעילות. לא בכל גן ובית ספר יש צהרון וההרשמה בדרך כלל נפרדת. כדאי לברר בבית הספר או ברשות המקומית.', 'After-school care program'],
  ['אסיפת הורים', 'מפגש של המחנך/ת עם ההורים כדי לעדכן על הכיתה ועל הנעשה בה. אפשר להגיע עם מי שעוזר בעברית ולשאול שאלות.', 'Parent meeting (class-wide)'],
  ['מחנך/ת', 'המורה הראשי/ת של הכיתה. מלמד/ת, מכיר/ה את הילדים ואת ההורים, והכתובת הראשונה לשאלות.', 'Homeroom teacher'],
  ['יועצת', 'איש או אשת צוות בבית הספר שמלווה ילדים בעניינים של רגש, חברים והתאקלמות. אפשר לפנות אליה בכל דבר שמדאיג.', 'School counselor'],
  ['ועד הורים', 'הורים מהכיתה שמתנדבים לארגן דברים משותפים כמו אירועים ומתנות. כדאי לשאול איך מצטרפים ומה מבקשים מההורים.', 'Parents’ committee'],
  ['תעודה', 'דף שמסכם איך הילד מתקדם בלימודים וביחסים עם חברים. אם משהו לא ברור, שואלים את המחנך/ת.', 'Report card'],
  ['טיול שנתי', 'טיול של הכיתה או השכבה, ליום אחד או יותר. בדרך כלל צריך אישור כתוב מההורים. כדאי לשאול מה לארוז ומה העלות.', 'Annual school trip'],
  ['מערכת שעות', 'לוח השיעורים השבועי: אילו מקצועות לומדים ומתי. כדאי לתלות אותה בבית ולהכין את הילקוט בערב.', 'Class timetable'],
  ['חופש גדול', 'חופשת הקיץ הארוכה, בין סוף שנת הלימודים לתחילת הבאה. ברשות המקומית ובמקומות נוספים יש קייטנות ופעילויות. כדאי לברר מוקדם.', 'Summer vacation'],
  ['ימי חופשה', 'ימים שבהם אין לימודים בגלל חגים וחופשות. התאריכים מתפרסמים בלוח השנה של משרד החינוך ובהודעות בית הספר.', 'School days off / holidays'],
  ['תגבור', 'שעות לימוד נוספות, לרוב בקבוצה קטנה, כדי לחזק מקצוע כמו עברית. כדאי לשאול את בית הספר מה קיים ואם הילד יכול להשתתף.', 'Extra support lessons'],
  ['אולפן', 'מקום ללימוד עברית מרוכז, בדרך כלל למבוגרים. כדאי לברר ברשות המקומית או אצל הגורם שמלווה עולים איפה ומתי נפתחים קורסים.', 'Ulpan (intensive Hebrew course)'],
  ['שיעורי בית', 'משימות שהילד עושה בבית. בכיתות הקטנות הן בדרך כלל קצרות. אם לא מבינים את ההוראות, אפשר לשאול את המורה.', 'Homework'],
  ['יום הורים', 'יום שבו ההורים באים לשיחה אישית עם המורים על הילד, בדרך כלל בשעה שקבעו מראש.', 'Parent-teacher conferences (individual)'],
  ['מורה מקצועית', 'מורה שמלמדת מקצוע אחד, כמו אנגלית, ספורט או מוזיקה, ולא נמצאת עם הכיתה כל היום, בשונה מהמחנכת.', 'Subject teacher'],
  ['קבוצת וואטסאפ של ההורים', 'קבוצה שבה מעבירים הודעות על הכיתה: שינויים, טיולים ואירועים. אפשר להשתמש בתרגום אוטומטי, ואם משהו לא ברור, לשאול את המחנכת ישירות.', 'Class parents’ WhatsApp group'],
  ['ארוחת עשר', 'אוכל קטן שהילד מביא מהבית לאכול בהפסקה, בדרך כלל באמצע הבוקר. בגנים ובבתי ספר רבים מבקשים אוכל בריא. כדאי לשאול אם יש הנחיות.', 'Mid-morning snack brought from home'],
  ['כיתת אם', 'הכיתה הקבועה של הילד, שבה הוא לומד את רוב היום עם המחנך/ת שלו.', 'Home class / homeroom'],
  ['שכבה', 'כל הכיתות של אותו גיל, למשל כל הכיתות הג׳ בבית הספר.', 'Grade level (all classes of one age)'],
  ['רשות מקומית / מחלקת חינוך', 'העירייה או המועצה האזורית שבה גרים. מחלקת החינוך שלה עוסקת בהרשמה לגנים ולבתי ספר ובעוד עניינים. בשאלות על הרשמה ושיבוץ כדאי לפנות אליה.', 'Local authority / education department'],
]

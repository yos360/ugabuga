// Data for /learn/hebrew-for-olim: first Hebrew words and survival phrases for a child who just
// made aliyah (or an Arabic-speaking child), with tips for teachers and parents.
// Reuse: translations of the shared words come from src/data/languages/vocab.js (verified by
// scripts/lang-verify). Only words that file lacks are written here, and only ones we are sure of.
import { WORDS } from './languages/vocab'

export const PATH = '/learn/hebrew-for-olim'

// The child's language options. `dir` decides how the child's words are laid out.
export const KID_LANGS = [
  { id: 'ru', name: 'רוסית', emoji: '🪆', code: 'ru', dir: 'ltr' },
  { id: 'en', name: 'אנגלית', emoji: '🗽', code: 'en', dir: 'ltr' },
  { id: 'fr', name: 'צרפתית', emoji: '🥐', code: 'fr', dir: 'ltr' },
  { id: 'am', name: 'אמהרית', emoji: '☕', code: 'am', dir: 'ltr' },
  { id: 'ar', name: 'ערבית', emoji: '📖', code: 'ar', dir: 'rtl' },
]

// Hebrew items: key -> [Hebrew, Hebrew with niqqud (or ''), Latin transliteration, emoji].
// Keys shared with vocab.js keep the same key so their translations are reused.
const H = {
  // greetings
  hello: ['שלום', 'שָׁלוֹם', 'shalom', '👋'], thanks: ['תודה', 'תּוֹדָה', 'toda', '🙏'],
  please: ['בבקשה', 'בְּבַקָּשָׁה', 'bevakasha', '🤲'], goodbye: ['להתראות', 'לְהִתְרָאוֹת', 'lehitraot', '👋'],
  // colors
  red: ['אדום', 'אָדֹם', 'adom', '🔴'], blue: ['כחול', 'כָּחֹל', 'kachol', '🔵'], green: ['ירוק', 'יָרֹק', 'yarok', '🟢'],
  yellow: ['צהוב', 'צָהֹב', 'tsahov', '🟡'], orange: ['כתום', 'כָּתֹם', 'katom', '🟠'], purple: ['סגול', 'סָגֹל', 'sagol', '🟣'],
  brown: ['חום', 'חוּם', 'chum', '🟤'], black: ['שחור', 'שָׁחֹר', 'shachor', '⚫'], white: ['לבן', 'לָבָן', 'lavan', '⚪'],
  pink: ['ורוד', 'וָרֹד', 'varod', '🩷'],
  // numbers (counting forms)
  1: ['אחת', 'אַחַת', 'achat', '1️⃣'], 2: ['שתיים', 'שְׁתַּיִם', 'shta’im', '2️⃣'], 3: ['שלוש', 'שָׁלֹשׁ', 'shalosh', '3️⃣'],
  4: ['ארבע', 'אַרְבַּע', 'arba', '4️⃣'], 5: ['חמש', 'חָמֵשׁ', 'chamesh', '5️⃣'], 6: ['שש', 'שֵׁשׁ', 'shesh', '6️⃣'],
  7: ['שבע', 'שֶׁבַע', 'sheva', '7️⃣'], 8: ['שמונה', 'שְׁמוֹנֶה', 'shmone', '8️⃣'], 9: ['תשע', 'תֵּשַׁע', 'tesha', '9️⃣'],
  10: ['עשר', 'עֶשֶׂר', 'eser', '🔟'],
  // food
  apple: ['תפוח', 'תַּפּוּחַ', 'tapuach', '🍎'], banana: ['בננה', 'בָּנָנָה', 'banana', '🍌'], grapes: ['ענבים', 'עֲנָבִים', 'anavim', '🍇'],
  watermelon: ['אבטיח', 'אֲבַטִּיחַ', 'avatiach', '🍉'], lemon: ['לימון', 'לִימוֹן', 'limon', '🍋'], strawberry: ['תות', 'תּוּת', 'tut', '🍓'],
  bread: ['לחם', 'לֶחֶם', 'lechem', '🍞'], milk: ['חלב', 'חָלָב', 'chalav', '🥛'], egg: ['ביצה', 'בֵּיצָה', 'beitsa', '🥚'],
  cheese: ['גבינה', 'גְּבִינָה', 'gvina', '🧀'], cake: ['עוגה', 'עוּגָה', 'uga', '🍰'], water: ['מים', 'מַיִם', 'mayim', '💧'],
  // body
  eye: ['עין', 'עַיִן', 'ayin', '👁️'], ear: ['אוזן', 'אֹזֶן', 'ozen', '👂'], nose: ['אף', 'אַף', 'af', '👃'], mouth: ['פה', 'פֶּה', 'pe', '👄'],
  hand: ['יד', 'יָד', 'yad', '✋'], foot: ['רגל', 'רֶגֶל', 'regel', '🦶'], tooth: ['שן', 'שֵׁן', 'shen', '🦷'], tongue: ['לשון', 'לָשׁוֹן', 'lashon', '👅'],
  // school supplies
  pencil: ['עיפרון', 'עִפָּרוֹן', 'iparon', '✏️'], books: ['ספרים', 'סְפָרִים', 'sfarim', '📚'], scissors: ['מספריים', 'מִסְפָּרַיִם', 'misparayim', '✂️'],
  schoolbag: ['ילקוט', 'יַלְקוּט', 'yalkut', '🎒'], ruler: ['סרגל', 'סַרְגֵּל', 'sargel', '📏'],
  pen: ['עט', 'עֵט', 'et', '🖊️'], notebook: ['מחברת', 'מַחְבֶּרֶת', 'machberet', '📓'],
  // class and kindergarten
  teacher: ['מורה', 'מוֹרָה', 'mora', '🧑‍🏫'], friend: ['חבר', 'חָבֵר', 'chaver', '🧑‍🤝‍🧑'], chair: ['כיסא', 'כִּסֵּא', 'kise', '🪑'],
  book: ['ספר', 'סֵפֶר', 'sefer', '📖'], school: ['בית ספר', 'בֵּית סֵפֶר', 'beit sefer', '🏫'], recess: ['הפסקה', 'הַפְסָקָה', 'hafsaka', '🤸'],
  // family
  mom: ['אמא', 'אִמָּא', 'ima', '👩'], dad: ['אבא', 'אַבָּא', 'aba', '👨'], grandma: ['סבתא', 'סַבְתָּא', 'savta', '👵'],
  grandpa: ['סבא', 'סַבָּא', 'saba', '👴'], brother: ['אח', 'אָח', 'ach', '👦'], sister: ['אחות', 'אָחוֹת', 'achot', '👧'], baby: ['תינוק', 'תִּינוֹק', 'tinok', '👶'],
  // phrases (no niqqud: long phrases read better plain)
  yes: ['כן', '', 'ken', '✅'], no: ['לא', '', 'lo', '❌'],
  understand: ['אני לא מבין/ה', '', 'ani lo mevin / mevina', '🤷'],
  toilet: ['אני צריך/ה לשירותים', '', 'ani tsarich / tsricha leshirutim', '🚻'],
  drink: ['אפשר לשתות?', '', 'efshar lishtot?', '🚰'],
  hungry: ['אני רעב/ה', '', 'ani ra’ev / ra’eva', '🍽️'],
  hurts: ['כואב לי', '', 'koev li', '🤕'],
  help: ['אני צריך/ה עזרה', '', 'ani tsarich / tsricha ezra', '🆘'],
  what: ['מה זה?', '', 'ma ze?', '❓'],
  name: ['קוראים לי…', '', 'korim li…', '🏷️'],
  speak: ['אני מדבר/ת…', '', 'ani medaber / medaberet…', '🗣️'],
}

// English (all keys), written by hand: plain everyday words.
const EN = {
  hello: 'hello', thanks: 'thank you', please: 'please', goodbye: 'goodbye',
  red: 'red', blue: 'blue', green: 'green', yellow: 'yellow', orange: 'orange', purple: 'purple', brown: 'brown', black: 'black', white: 'white', pink: 'pink',
  1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten',
  apple: 'apple', banana: 'banana', grapes: 'grapes', watermelon: 'watermelon', lemon: 'lemon', strawberry: 'strawberry', bread: 'bread', milk: 'milk', egg: 'egg', cheese: 'cheese', cake: 'cake', water: 'water',
  eye: 'eye', ear: 'ear', nose: 'nose', mouth: 'mouth', hand: 'hand', foot: 'foot', tooth: 'tooth', tongue: 'tongue',
  pencil: 'pencil', books: 'books', scissors: 'scissors', schoolbag: 'school bag', ruler: 'ruler', pen: 'pen', notebook: 'notebook',
  teacher: 'teacher', friend: 'friend', chair: 'chair', book: 'book', school: 'school', recess: 'break',
  mom: 'mom', dad: 'dad', grandma: 'grandma', grandpa: 'grandpa', brother: 'brother', sister: 'sister', baby: 'baby',
  yes: 'yes', no: 'no', understand: 'I don’t understand.', toilet: 'I need to use the toilet.', drink: 'Can I have a drink?',
  hungry: 'I’m hungry.', hurts: 'It hurts.', help: 'I need help.', what: 'What is this?', name: 'My name is…', speak: 'I speak…',
}

// Words that vocab.js does not have (or has differently), per language. Phrases are written by hand
// in plain, simple, everyday forms; where a language has gendered forms we use a neutral one.
const EXTRA = {
  ru: {
    pen: 'ручка', notebook: 'тетрадь', teacher: 'учитель', friend: 'друг', school: 'школа', recess: 'перемена',
    mom: 'мама', dad: 'папа', grandma: 'бабушка', grandpa: 'дедушка', brother: 'брат', sister: 'сестра',
    yes: 'да', no: 'нет', understand: 'Я не понимаю.', toilet: 'Мне нужно в туалет.', drink: 'Можно попить?',
    hungry: 'Я хочу есть.', hurts: 'Мне больно.', help: 'Мне нужна помощь.', what: 'Что это?', name: 'Меня зовут…', speak: 'Я говорю на…',
  },
  fr: {
    pen: 'stylo', notebook: 'cahier', teacher: 'enseignant(e)', friend: 'ami(e)', school: 'école', recess: 'récréation',
    mom: 'maman', dad: 'papa', grandma: 'mamie', grandpa: 'papi', brother: 'frère', sister: 'sœur',
    yes: 'oui', no: 'non', understand: 'Je ne comprends pas.', toilet: 'Je dois aller aux toilettes.', drink: 'Je peux boire ?',
    hungry: 'J’ai faim.', hurts: 'J’ai mal.', help: 'J’ai besoin d’aide.', what: 'Qu’est-ce que c’est ?', name: 'Je m’appelle…', speak: 'Je parle…',
  },
  ar: {
    please: 'من فضلك', pen: 'قلم', notebook: 'دفتر', teacher: 'معلّم', friend: 'صديق', school: 'مدرسة', recess: 'استراحة',
    mom: 'ماما', dad: 'بابا', grandma: 'جدّة', grandpa: 'جدّ', brother: 'أخ', sister: 'أخت',
    yes: 'نعم', no: 'لا', understand: 'لا أفهم.', toilet: 'أحتاج إلى الحمّام.', drink: 'هل يمكنني أن أشرب؟',
    hungry: 'أنا جائع.', hurts: 'أشعر بألم.', help: 'أحتاج إلى مساعدة.', what: 'ما هذا؟', name: 'اسمي…', speak: 'أتكلّم…',
  },
  am: {
    thanks: 'አመሰግናለሁ', please: 'እባክዎ', cheese: 'አይብ',
    pen: 'እስክሪብቶ', notebook: 'ደብተር', teacher: 'መምህር', friend: 'ጓደኛ', school: 'ትምህርት ቤት', recess: 'እረፍት',
    mom: 'እናት', dad: 'አባት', grandma: 'አያት', grandpa: 'አያት', brother: 'ወንድም', sister: 'እህት',
    yes: 'አዎ', no: 'አይ', understand: 'አልገባኝም።', toilet: 'ሽንት ቤት መሄድ እፈልጋለሁ።', drink: 'ውሃ መጠጣት እችላለሁ?',
    hungry: 'ርቦኛል።', hurts: 'ያመኛል።', help: 'እርዳታ እፈልጋለሁ።', what: 'ይህ ምንድን ነው?', name: 'ስሜ … ነው።', speak: '… እናገራለሁ።',
  },
}

// A vocab.js entry may be a string, [word, vocalized] (Arabic) or { w, he }.
function plain(v) {
  if (v == null) return null
  const w = typeof v === 'object' && !Array.isArray(v) ? v.w : v
  return Array.isArray(w) ? w[0] : w
}

// The word or phrase in the child's language, or null when we have no verified translation.
export function translate(lang, key) {
  if (lang === 'en') return EN[key] ?? null
  return plain(EXTRA[lang]?.[key]) ?? plain(WORDS[lang]?.[key])
}

// A card: the Hebrew word and the child's word. `he` is the plain spelling (used for speech),
// `nk` the spelling with niqqud when we have it.
function card(lang, key) {
  const h = H[key]
  const tx = translate(lang, key)
  if (!h || !tx) return null
  return { key, he: h[0], nk: h[1] || h[0], tr: h[2], emoji: h[3], tx }
}

// Topics shown on the page. `keys` are the item keys; `pics: false` marks phrases (no picture game).
export const TOPICS = [
  { id: 'needs', emoji: '🆘', title: 'משפטים להישרדות', pics: false,
    keys: ['hello', 'thanks', 'please', 'yes', 'no', 'understand', 'toilet', 'drink', 'hungry', 'hurts', 'help', 'what'] },
  { id: 'class', emoji: '🏫', title: 'בכיתה ובגן', pics: true, keys: ['teacher', 'friend', 'school', 'chair', 'book', 'recess'] },
  { id: 'supplies', emoji: '🎒', title: 'ציוד לימודים', pics: true, keys: ['pencil', 'pen', 'notebook', 'ruler', 'scissors', 'schoolbag', 'books'] },
  { id: 'body', emoji: '🙋', title: 'הגוף שלי', pics: true, keys: ['eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'tooth', 'tongue'] },
  { id: 'food', emoji: '🍎', title: 'אוכל ושתייה', pics: true, keys: ['water', 'milk', 'bread', 'egg', 'cheese', 'apple', 'banana', 'grapes', 'watermelon', 'lemon', 'strawberry', 'cake'] },
  { id: 'family', emoji: '👪', title: 'משפחה', pics: true, keys: ['mom', 'dad', 'grandma', 'grandpa', 'brother', 'sister', 'baby'] },
  { id: 'colors', emoji: '🎨', title: 'צבעים', pics: true, keys: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown', 'black', 'white', 'pink'] },
  { id: 'numbers', emoji: '🔢', title: 'מספרים 1–10', pics: true, keys: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
]

// Cards of one topic in one language (words we have no translation for are left out).
export function topicCards(lang, topicId) {
  const t = TOPICS.find(x => x.id === topicId)
  return t ? t.keys.map(k => card(lang, k)).filter(Boolean) : []
}

// All picture words of every topic with a picture (for the mixed matching game).
export function pictureCards(lang) {
  return TOPICS.filter(t => t.pics).flatMap(t => topicCards(lang, t.id))
}

// The twelve survival phrases on the printable cards.
export function phraseCards(lang) { return topicCards(lang, 'needs') }

// "My name is… / I speak…" lines for the desk name card.
export function deskLines(lang) { return { name: card(lang, 'name'), speak: card(lang, 'speak'), hello: card(lang, 'hello') } }

// Short welcome paragraph for parents, in their language. Amharic is offered through the word cards only.
export const PARENT_WELCOME = [
  { id: 'ru', lang: 'ru', dir: 'ltr', title: 'Русский',
    text: 'Добро пожаловать! Ваш ребёнок только что пришёл в новую группу или класс, и первые недели могут быть непростыми. Это нормально: дети быстрее осваивают иврит, когда чувствуют себя в безопасности. Продолжайте говорить дома на родном языке — это помогает ивриту, а не мешает. Расскажите воспитателю или учителю, какие слова ребёнок уже знает и как он просит в туалет или воды. На этой странице есть карточки с первыми ивритскими словами и полезные фразы, которые можно учить вместе и распечатать.' },
  { id: 'en', lang: 'en', dir: 'ltr', title: 'English',
    text: 'Welcome! Your child has just joined a new class, and the first weeks can feel big. That is completely normal, and children usually pick up Hebrew faster when they feel safe and welcome. Keep speaking your home language at home: it helps your child’s Hebrew rather than slowing it down. Tell the teacher which words your child already knows and how they ask for the toilet or for water. This page has first-word cards and survival phrases you can practise together and print.' },
  { id: 'fr', lang: 'fr', dir: 'ltr', title: 'Français',
    text: 'Bienvenue ! Votre enfant vient d’arriver dans une nouvelle classe et les premières semaines peuvent être difficiles. C’est tout à fait normal : les enfants apprennent l’hébreu plus vite quand ils se sentent en sécurité. Continuez à parler votre langue à la maison : cela aide l’hébreu au lieu de le freiner. Dites à l’enseignante quels mots votre enfant connaît déjà et comment il demande à aller aux toilettes ou à boire. Cette page propose des cartes de premiers mots et des phrases utiles à pratiquer ensemble et à imprimer.' },
  { id: 'ar', lang: 'ar', dir: 'rtl', title: 'العربية',
    text: 'أهلًا وسهلًا! انضمّ طفلكم للتوّ إلى صفّ جديد، وقد تكون الأسابيع الأولى صعبة. هذا طبيعي تمامًا، فالأطفال يتعلّمون العبرية أسرع عندما يشعرون بالأمان. استمرّوا في التحدّث بلغتكم في البيت، فهذا يساعد العبرية ولا يعيقها. أخبروا المعلّمة أيّ كلمات يعرفها طفلكم وكيف يطلب الذهاب إلى الحمّام أو الماء. تجدون في هذه الصفحة بطاقات كلمات أولى وجُملًا مفيدة للتدرّب عليها معًا وللطباعة.' },
]

export const WELCOME_STEPS = [
  ['👋', 'מקבלים בחום ובפשטות', 'מספיק חיוך, שם וידיים פתוחות. אפשר להציג את הילד בקצרה לכיתה (בלי להפוך אותו לנושא השיחה), ולומר: ״הוא מדבר רוסית, ונלמד ממנו כמה מילים.״'],
  ['🤝', 'ממנים חבר מלווה', 'ילד או ילדה סבלניים ישבו לידו, יסבירו בהפסקה וילוו אותו לשירותים ולחדר האוכל. מחליפים את המלווה מדי כמה ימים, כדי שלא יהיה עומס.'],
  ['🗣️', 'מדברים לאט, בפשטות ובתנועות', 'משפט קצר, מילה ברורה, הצבעה ותמונה. לא צריך לצעוק ולא צריך לדבר ״בעברית של תינוקות״: עברית פשוטה, טבעית ואיטית.'],
  ['🖼️', 'תמונה לפני מילה', 'לוח תמונות קטן על השולחן: שירותים, מים, אוכל, עזרה, כואב לי. הילד מצביע, ואתם מוסיפים את המילה בעברית.'],
  ['🌱', 'מכבדים את שפת הבית', 'מעודדים את הילד להמשיך לדבר בשפתו בבית, ואם הוא רוצה, ללמד את הכיתה כמה מילים. שפה שנייה נבנית על גבי שפה ראשונה חזקה.'],
  ['🔇', 'סבלנות לשלב השקט', 'ילדים רבים שותקים שבועות ולעיתים חודשים לפני שהם מדברים. זה שלב רגיל, והם מבינים הרבה יותר ממה שהם אומרים.'],
]

export const FIRST_WEEK = [
  'יום ראשון: מראים לילד את המקומות החשובים (שירותים, חצר, שולחן שלו, ארון) ותולים שם תמונה ומילה בעברית.',
  'מוודאים שהוא יודע דבר אחד: איך מבקשים עזרה. אפשר כרטיס ״עזרה״ שמניחים על השולחן.',
  'לומדים את השם שלו כמו שהוא נהגה בבית. אם הוא רוצה, אפשר לשאול איך הוא מעדיף שיקראו לו.',
  'מבקשים מההורים רשימת מילים חשובות בשפת הבית: שירותים, מים, כואב לי, פחד, אמא. כך מבינים אותו גם בלי מילים.',
  'כל יום שלוש מילים חדשות עם תמונה, ושוב ושוב לאורך היום: בבוקר, בארוחה ובסוף היום. מעט וקבוע עדיף על הרבה ולא זכור.',
  'משתפים אותו בפעילויות שלא תלויות בשפה: ציור, משחק כדור, ריקוד, בנייה, שירים עם תנועות.',
  'לא מתקנים כל טעות. חוזרים על המשפט הנכון בטבעיות (״אני רוצה מים?״ ״כן, אתה רוצה מים.״).',
  'בסוף השבוע אומרים לו מה הלך טוב, ושולחים להורים הודעה קצרה ומעודדת.',
]

export const TEACHER_TIPS = [
  'לא מכריחים ילד לדבר. מזמינים, ממתינים ומחזקים כל ניסיון.',
  'בהתחלה כדאי לשבץ ליד הילד חבר שמדבר את שפתו, אם יש כזה, אבל במידה. אחר כך מעודדים גם קשרים בעברית.',
  'מחלקים תפקידים: מי עוזר בהפסקה, מי בקריאה ומי בחשבון. חשבון הוא לרוב התחום שבו הילד מצליח מהר ומקבל ביטחון.',
  'מתאימים משימות: ניסוח פשוט, ציור או התאמה של תמונה למילה, ולא מוותרים על ההשתתפות.',
  'מבררים מול ההנהלה והרשות המקומית אילו שעות הוראה או תגבור עברית מגיעים לתלמידים עולים. ההסדרים משתנים משנה לשנה.',
  'שומרים על קשר עם ההורים. לעיתים ההורים עצמם חדשים בארץ ולא מכירים את מערכת החינוך, ההודעות, החגים והנהלים.',
]

export const PARENT_TIPS = [
  'ממשיכים לדבר בשפת הבית. שפה ראשונה חזקה עוזרת ללמוד עברית, ואין צורך לעבור לעברית בבית.',
  'קוראים סיפורים בשפת הבית ובעברית, ומסתכלים ביחד על תמונות. לא חייבים להבין כל מילה.',
  'לומדים עם הילד שלוש־ארבע מילים ביום מהכרטיסים בדף, בלי מבחנים ובלי לחץ.',
  'מספרים לגננת או למורה על הילד: מה הוא אוהב, ממה הוא מפחד ואיך הוא מבקש דברים.',
  'מעודדים חברויות: מזמינים ילד מהכיתה למשחק קצר בבית או בפארק. המשחק הוא בית הספר הכי טוב לעברית.',
  'מדברים על הרגשות: געגוע לחברים ולמקום הקודם הוא טבעי. נותנים לו מקום לעצב.',
  'לא משווים לאחים או לילדים אחרים. כל ילד לומד בקצב שלו.',
]

export const CONSULT = [
  'הילד סגור מאוד או בוכה בקביעות ולא מרגיש טוב בגן או בבית הספר אחרי כמה שבועות',
  'יש שינוי חד בשינה, באכילה, בהתנהגות או כאבי בטן ובחילות חוזרים בלי סיבה רפואית',
  'נראה שהילד מתקשה גם בשפת הבית, למשל מדבר מעט מאוד או שקשה להבין אותו גם בשפתו',
  'חברים מציקים לו או מוציאים אותו מהמשחק בגלל השפה או המוצא',
]

export const FAQ = [
  { q: 'כמה זמן לוקח לילד עולה ללמוד עברית?', a: 'ילדים רבים מתחילים להבין עברית יומיומית ולהשתתף בשיחות תוך כמה חודשים עד שנה, בעיקר בגיל הגן ובכיתות הנמוכות. עברית לימודית, כמו קריאת טקסטים וכתיבה בנושאים שונים, לוקחת בדרך כלל כמה שנים. הקצב משתנה מילד לילד, ונתמך מאוד בתחושת ביטחון ובחברים.' },
  { q: 'הילד שותק בכיתה. האם זה בסדר?', a: 'לרוב כן. הרבה ילדים עוברים ״שלב שקט״ שבו הם קולטים ולא מדברים, ושקט של שבועות ואף חודשים אינו חריג. עוזרים להם כשמזמינים בלי ללחוץ, נותנים מילים עם תמונות ומחזקים כל ניסיון. אם השקט מלווה בעצב גדול, חרדה או שהילד שותק גם בבית ובשפתו, כדאי לשוחח עם יועצת בית הספר או עם הרופא של הילד.' },
  { q: 'האם כדאי להפסיק לדבר בשפת הבית כדי שילמד עברית מהר יותר?', a: 'לא. מחקרים וגורמי חינוך ממליצים להמשיך לדבר בשפת הבית. היא מחזקת את הקשר המשפחתי ואת החשיבה של הילד, ומסייעת ללמוד שפה נוספת. עברית הילד ילמד בגן, בבית הספר ובין חברים.' },
  { q: 'איך הילד מבקש לצאת לשירותים אם הוא לא יודע עברית?', a: 'זה הדבר הראשון שכדאי להכין. מלמדים את המשפט ״אני צריך/ה לשירותים״ ומוסיפים כרטיס עם תמונה. הדף הזה מכיל את המשפט בחמש שפות ואפשר להדפיס אותו. הגננת או המורה צריכות גם לדעת מה אומרים בשפת הבית.' },
  { q: 'האם התרגומים והשמע בדף מדויקים?', a: 'התרגומים למילים הבסיסיות נבדקו מול מאגר המילים של האתר (בעמוד השפות) ואיתם נוספו משפטים פשוטים ויומיומיים. ההשמעה היא של עברית, בקול המכשיר שלכם. אם בקול של המכשיר אין עברית, ההגייה כתובה באותיות לטיניות. אם יש לכם הצעה לתיקון, כתבו לנו בעמוד יצירת הקשר.' },
  { q: 'לאילו גילאים הדף מתאים?', a: 'לגילאי הגן ועד כיתה ו׳. ילדים קטנים יעדיפו לראות ולהשמיע את התמונות. ילדים גדולים יותר יכולים לבדוק בעצמם את המילים ולשחק במשחק ההתאמה.' },
  { q: 'האם מה שבוחרים בדף נשמר או נשלח?', a: 'לא. בחירת השפה והנושא, תוצאות המשחק והשם שנכתב בדפי ההדפסה לא נשמרים ולא נשלחים לשום מקום. הכול קורה רק במכשיר שלכם, ונעלם עם סגירת הדף.' },
]

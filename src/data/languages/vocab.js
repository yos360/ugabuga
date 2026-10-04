// First words in five languages, by topic. Every word is checked by scripts/lang-verify:
// it must appear in the Unicode CLDR name of its picture in that language (names written by
// native speakers), or in CLDR's official number spell-out for numbers. The Hebrew-letter
// pronunciation (say.generated.js) is produced from the eSpeak NG phonetic engine, not typed by hand.
// Arabic words carry a vocalized form (with harakat) used for the pronunciation.

export const LANGS = {
  fr: { name: 'צרפתית', adj: 'בצרפתית', speech: 'fr-FR', dir: 'ltr', emoji: '🥐', hello: 'bonjour' },
  es: { name: 'ספרדית', adj: 'בספרדית', speech: 'es-MX', dir: 'ltr', emoji: '💃', hello: 'hola' },
  ru: { name: 'רוסית', adj: 'ברוסית', speech: 'ru-RU', dir: 'ltr', emoji: '🪆', hello: 'привет' },
  ar: { name: 'ערבית', adj: 'בערבית', speech: 'ar-SA', dir: 'rtl', emoji: '📖', hello: 'مرحبا', note: 'המילים כאן בערבית ספרותית (הכתובה). בערבית המדוברת חלק מהמילים נשמעות אחרת.' },
  am: { name: 'אמהרית', adj: 'באמהרית', speech: 'am-ET', dir: 'ltr', emoji: '☕', hello: 'ሰላም' },
}

// key, Hebrew meaning, picture (emoji or a digit for numbers)
export const TOPICS = [
  { slug: 'greetings', title: 'מילות נימוס', emoji: '👋', items: [
    ['hello', 'שלום', '👋'], ['thanks', 'תודה', '🙏'], ['please', 'בבקשה', '🙏'], ['goodbye', 'להתראות', '👋'],
  ] },
  { slug: 'colors', title: 'צבעים', emoji: '🎨', items: [
    ['red', 'אדום', '🔴'], ['blue', 'כחול', '🔵'], ['green', 'ירוק', '🟢'], ['yellow', 'צהוב', '🟡'], ['orange', 'כתום', '🟠'],
    ['purple', 'סגול', '🟣'], ['brown', 'חום', '🟤'], ['black', 'שחור', '⚫'], ['white', 'לבן', '⚪'], ['pink', 'ורוד', '🩷'],
  ] },
  { slug: 'numbers', title: 'מספרים 1–10', emoji: '🔢', items: [
    ['1', 'אחת', '1'], ['2', 'שתיים', '2'], ['3', 'שלוש', '3'], ['4', 'ארבע', '4'], ['5', 'חמש', '5'],
    ['6', 'שש', '6'], ['7', 'שבע', '7'], ['8', 'שמונה', '8'], ['9', 'תשע', '9'], ['10', 'עשר', '10'],
  ] },
  { slug: 'animals', title: 'חיות', emoji: '🐾', items: [
    ['dog', 'כלב', '🐶'], ['cat', 'חתול', '🐱'], ['horse', 'סוס', '🐴'], ['cow', 'פרה', '🐄'], ['sheep', 'כבשה', '🐑'],
    ['chicken', 'תרנגולת', '🐔'], ['fish', 'דג', '🐟'], ['bird', 'ציפור', '🐦'], ['lion', 'אריה', '🦁'], ['elephant', 'פיל', '🐘'],
    ['monkey', 'קוף', '🐵'], ['rabbit', 'ארנב', '🐰'], ['frog', 'צפרדע', '🐸'], ['bear', 'דוב', '🐻'],
  ] },
  { slug: 'food', title: 'אוכל ופירות', emoji: '🍎', items: [
    ['apple', 'תפוח', '🍎'], ['banana', 'בננה', '🍌'], ['grapes', 'ענבים', '🍇'], ['watermelon', 'אבטיח', '🍉'], ['lemon', 'לימון', '🍋'],
    ['strawberry', 'תות', '🍓'], ['bread', 'לחם', '🍞'], ['milk', 'חלב', '🥛'], ['egg', 'ביצה', '🥚'], ['cheese', 'גבינה', '🧀'],
    ['cake', 'עוגה', '🍰'], ['water', 'מים', '💧'],
  ] },
  { slug: 'body', title: 'הגוף שלי', emoji: '🙋', items: [
    ['eye', 'עין', '👁️'], ['ear', 'אוזן', '👂'], ['nose', 'אף', '👃'], ['mouth', 'פה', '👄'], ['hand', 'יד', '✋'],
    ['foot', 'רגל', '🦶'], ['tooth', 'שן', '🦷'], ['tongue', 'לשון', '👅'],
  ] },
  { slug: 'things', title: 'בבית וברחוב', emoji: '🏠', items: [
    ['house', 'בית', '🏠'], ['book', 'ספר', '📖'], ['ball', 'כדור', '⚽'], ['key', 'מפתח', '🔑'], ['chair', 'כיסא', '🪑'],
    ['car', 'מכונית', '🚗'], ['bus', 'אוטובוס', '🚌'], ['bicycle', 'אופניים', '🚲'], ['airplane', 'מטוס', '✈️'],
  ] },
  { slug: 'nature', title: 'טבע ומזג אוויר', emoji: '🌳', items: [
    ['sun', 'שמש', '☀️'], ['moon', 'ירח', '🌙'], ['star', 'כוכב', '⭐'], ['tree', 'עץ', '🌳'], ['flower', 'פרח', '🌼'],
    ['rain', 'גשם', '🌧️'], ['snow', 'שלג', '❄️'], ['sea', 'ים', '🌊'], ['cloud', 'ענן', '☁️'], ['rainbow', 'קשת בענן', '🌈'], ['mountain', 'הר', '⛰️'],
  ] },
  { slug: 'clothes', title: 'בגדים', emoji: '👕', items: [
    ['shirt', 'חולצה', '👕'], ['pants', 'מכנסיים', '👖'], ['dress', 'שמלה', '👗'], ['sneakers', 'נעל ספורט', '👟'], ['socks', 'גרביים', '🧦'],
    ['coat', 'מעיל', '🧥'], ['glasses', 'משקפיים', '👓'], ['gloves', 'כפפות', '🧤'], ['scarf', 'צעיף', '🧣'], ['cap', 'כובע', '🧢'],
  ] },
  { slug: 'people', title: 'אנשים', emoji: '👪', items: [
    ['baby', 'תינוק', '👶'], ['boy', 'ילד', '👦'], ['girl', 'ילדה', '👧'], ['woman', 'אישה', '👩'], ['man', 'איש', '👨'],
  ] },
  { slug: 'school', title: 'בית ספר', emoji: '🎒', items: [
    ['pencil', 'עיפרון', '✏️'], ['books', 'ספרים', '📚'], ['scissors', 'מספריים', '✂️'], ['schoolbag', 'ילקוט', '🎒'], ['crayon', 'צבע פנדה', '🖍️'], ['ruler', 'סרגל', '📏'],
  ] },
  { slug: 'more-animals', title: 'עוד חיות', emoji: '🦒', items: [
    ['giraffe', 'ג׳ירפה', '🦒'], ['turtle', 'צב', '🐢'], ['snake', 'נחש', '🐍'], ['butterfly', 'פרפר', '🦋'], ['bee', 'דבורה', '🐝'],
    ['mouse', 'עכבר', '🐭'], ['penguin', 'פינגווין', '🐧'], ['fox', 'שועל', '🦊'], ['pig', 'חזיר', '🐷'], ['duck', 'ברווז', '🦆'],
  ] },
  { slug: 'veggies-sweets', title: 'ירקות ומתוקים', emoji: '🥕', items: [
    ['carrot', 'גזר', '🥕'], ['tomato', 'עגבנייה', '🍅'], ['corn', 'תירס', '🌽'], ['mushroom', 'פטרייה', '🍄'], ['pear', 'אגס', '🍐'],
    ['cherries', 'דובדבנים', '🍒'], ['pizza', 'פיצה', '🍕'], ['icecream', 'גלידה', '🍦'], ['chocolate', 'שוקולד', '🍫'],
  ] },
  { slug: 'toys', title: 'משחקים וכיף', emoji: '🎈', items: [
    ['balloon', 'בלון', '🎈'], ['teddy', 'דובי', '🧸'], ['gift', 'מתנה', '🎁'], ['kite', 'עפיפון', '🪁'], ['drum', 'תוף', '🥁'], ['guitar', 'גיטרה', '🎸'],
  ] },
]

// Words per language. A string, or [word, vocalized] for Arabic, or { w, he } when the
// Hebrew meaning differs slightly. Missing keys = no verified word for that language.
export const WORDS = {
  fr: {
    hello: 'bonjour', thanks: 'merci', please: 's’il te plaît', goodbye: 'au revoir',
    red: 'rouge', blue: 'bleu', green: 'vert', yellow: 'jaune', orange: 'orange', purple: 'violet', brown: 'marron', black: 'noir', white: 'blanc', pink: 'rose',
    1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept', 8: 'huit', 9: 'neuf', 10: 'dix',
    dog: 'chien', cat: 'chat', horse: 'cheval', cow: 'vache', sheep: 'mouton', chicken: 'poule', fish: 'poisson', bird: 'oiseau', lion: 'lion', elephant: 'éléphant', monkey: 'singe', rabbit: 'lapin', frog: 'grenouille', bear: 'ours',
    apple: 'pomme', banana: 'banane', grapes: { w: 'raisin', he: 'ענבים' }, watermelon: 'pastèque', lemon: 'citron', strawberry: 'fraise', bread: 'pain', milk: 'lait', egg: 'œuf', cheese: 'fromage', cake: 'gâteau', water: 'eau',
    eye: 'œil', ear: 'oreille', nose: 'nez', mouth: 'bouche', hand: 'main', foot: 'pied', tooth: 'dent', tongue: 'langue',
    house: 'maison', book: 'livre', ball: 'ballon', key: 'clé', chair: 'chaise', car: 'voiture', bus: 'bus', bicycle: 'vélo', airplane: 'avion',
    sun: 'soleil', moon: 'lune', star: 'étoile', tree: 'arbre', flower: 'fleur', rain: 'pluie', snow: 'neige', sea: 'mer',
    shirt: 'chemise', pants: { w: 'jean', he: 'ג׳ינס' }, dress: 'robe', sneakers: 'basket', socks: 'chaussettes', coat: 'manteau', glasses: 'lunettes', gloves: 'gants', scarf: 'écharpe', cap: 'casquette',
    baby: 'bébé', boy: 'garçon', girl: 'fille', woman: 'femme', man: 'homme',
    pencil: 'crayon', books: 'livres', scissors: 'ciseaux', schoolbag: 'cartable', crayon: 'crayon pastel', ruler: 'règle',
    giraffe: 'girafe', turtle: 'tortue', snake: 'serpent', butterfly: 'papillon', bee: 'abeille', mouse: 'souris', penguin: 'pingouin', fox: 'renard', pig: 'cochon', duck: 'canard',
    carrot: 'carotte', tomato: 'tomate', corn: 'maïs', mushroom: 'champignon', pear: 'poire', cherries: 'cerises', pizza: 'pizza', icecream: 'glace', chocolate: 'chocolat',
    balloon: 'ballon de baudruche', teddy: 'nounours', gift: 'cadeau', kite: 'cerf-volant', guitar: 'guitare',
    cloud: 'nuage', rainbow: 'arc-en-ciel', mountain: 'montagne',
  },
  es: {
    hello: 'hola', thanks: 'gracias', please: 'por favor', goodbye: 'adiós',
    red: 'rojo', blue: 'azul', green: 'verde', yellow: 'amarillo', orange: 'naranja', purple: 'morado', brown: 'marrón', black: 'negro', white: 'blanco', pink: 'rosa',
    1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
    dog: 'perro', cat: 'gato', horse: 'caballo', cow: 'vaca', sheep: 'oveja', chicken: 'gallina', fish: 'pez', bird: 'pájaro', lion: 'león', elephant: 'elefante', monkey: 'mono', rabbit: 'conejo', frog: 'rana', bear: 'oso',
    apple: 'manzana', banana: 'plátano', grapes: 'uvas', watermelon: 'sandía', lemon: 'limón', strawberry: 'fresa', bread: 'pan', milk: 'leche', egg: 'huevo', cheese: 'queso', cake: 'pastel', water: 'agua',
    eye: 'ojo', ear: 'oreja', nose: 'nariz', mouth: 'boca', hand: 'mano', foot: 'pie', tooth: 'diente', tongue: 'lengua',
    house: 'casa', book: 'libro', ball: 'pelota', key: 'llave', chair: 'silla', car: 'carro', bus: 'autobús', bicycle: 'bicicleta', airplane: 'avión',
    sun: 'sol', moon: 'luna', star: 'estrella', tree: 'árbol', flower: 'flor', rain: 'lluvia', snow: 'nieve', sea: 'mar',
    shirt: 'camiseta', pants: 'pantalones', dress: 'vestido', sneakers: 'zapatilla', socks: 'calcetines', coat: 'abrigo', glasses: 'gafas', gloves: 'guantes', scarf: 'bufanda', cap: 'gorra',
    baby: 'bebé', boy: 'niño', girl: 'niña', woman: 'mujer', man: 'hombre',
    pencil: 'lápiz', books: 'libros', scissors: 'tijeras', schoolbag: 'mochila', crayon: 'lápiz de cera', ruler: 'regla',
    giraffe: 'jirafa', turtle: 'tortuga', snake: 'serpiente', butterfly: 'mariposa', bee: 'abeja', mouse: 'ratón', penguin: 'pingüino', fox: 'zorro', pig: 'cerdo', duck: 'pato',
    carrot: 'zanahoria', tomato: 'tomate', corn: 'maíz', mushroom: 'hongo', pear: 'pera', cherries: 'cerezas', pizza: 'pizza', icecream: 'helado', chocolate: 'chocolate',
    balloon: 'globo', teddy: 'osito de peluche', gift: 'regalo', kite: 'cometa', drum: 'tambor', guitar: 'guitarra',
    cloud: 'nube', rainbow: 'arcoíris', mountain: 'montaña',
  },
  ru: {
    hello: 'привет', thanks: 'спасибо', please: 'пожалуйста', goodbye: 'пока',
    red: 'красный', blue: 'синий', green: 'зелёный', yellow: 'жёлтый', orange: 'оранжевый', purple: 'фиолетовый', brown: 'коричневый', black: 'чёрный', white: 'белый', pink: 'розовый',
    1: 'один', 2: 'два', 3: 'три', 4: 'четыре', 5: 'пять', 6: 'шесть', 7: 'семь', 8: 'восемь', 9: 'девять', 10: 'десять',
    dog: 'собака', cat: 'кошка', horse: 'лошадь', cow: 'корова', sheep: 'овца', chicken: 'курица', fish: 'рыба', bird: 'птица', lion: 'лев', elephant: 'слон', monkey: 'обезьяна', rabbit: 'кролик', frog: 'лягушка', bear: 'медведь',
    apple: 'яблоко', banana: 'банан', grapes: 'виноград', watermelon: 'арбуз', lemon: 'лимон', strawberry: 'клубника', bread: 'хлеб', milk: 'молоко', egg: 'яйцо', cheese: 'сыр', cake: 'торт', water: 'вода',
    eye: 'глаз', ear: 'ухо', nose: 'нос', mouth: 'рот', hand: 'рука', foot: 'нога', tooth: 'зуб', tongue: 'язык',
    house: 'дом', book: 'книга', ball: 'мяч', key: 'ключ', chair: 'стул', car: 'машина', bus: 'автобус', bicycle: 'велосипед', airplane: 'самолёт',
    sun: 'солнце', moon: 'луна', star: 'звезда', tree: 'дерево', flower: 'цветок', rain: 'дождь', snow: 'снег', sea: 'море',
    shirt: 'футболка', pants: 'штаны', dress: 'платье', sneakers: 'кроссовки', socks: 'носки', coat: 'куртка', glasses: 'очки', gloves: 'перчатки', scarf: 'шарф', cap: 'кепка',
    baby: 'младенец', boy: 'мальчик', girl: 'девочка', woman: 'женщина', man: 'мужчина',
    pencil: 'карандаш', books: 'книги', scissors: 'ножницы', schoolbag: 'рюкзак', crayon: 'мелок', ruler: 'линейка',
    giraffe: 'жираф', turtle: 'черепаха', snake: 'змея', butterfly: 'бабочка', bee: 'пчела', penguin: 'пингвин', fox: 'лиса', duck: 'утка',
    carrot: 'морковь', tomato: 'помидор', corn: 'кукуруза', mushroom: 'гриб', pear: 'груша', cherries: 'вишня', pizza: 'пицца', icecream: 'мороженое', chocolate: 'шоколад',
    balloon: 'шарик', teddy: 'мишка', gift: 'подарок', kite: 'воздушный змей', drum: 'барабан', guitar: 'гитара',
    cloud: 'облако', rainbow: 'радуга', mountain: 'гора',
  },
  ar: {
    hello: ['مرحبا', 'مَرْحَبًا'], thanks: ['شكرا', 'شُكْرًا'], goodbye: ['إلى اللقاء', 'إِلَى اللِّقَاء'],
    red: ['أحمر', 'أَحْمَر'], blue: ['أزرق', 'أَزْرَق'], green: ['أخضر', 'أَخْضَر'], yellow: ['أصفر', 'أَصْفَر'], orange: ['برتقالي', 'بُرْتُقَالِيّ'],
    purple: ['بنفسجي', 'بَنَفْسَجِيّ'], brown: ['بني', 'بُنِّيّ'], black: ['أسود', 'أَسْوَد'], white: ['أبيض', 'أَبْيَض'], pink: ['وردي', 'وَرْدِيّ'],
    1: ['واحد', 'وَاحِد'], 2: ['اثنان', 'اِثْنَان'], 3: ['ثلاثة', 'ثَلَاثَة'], 4: ['أربعة', 'أَرْبَعَة'], 5: ['خمسة', 'خَمْسَة'],
    6: ['ستة', 'سِتَّة'], 7: ['سبعة', 'سَبْعَة'], 8: ['ثمانية', 'ثَمَانِيَة'], 9: ['تسعة', 'تِسْعَة'], 10: ['عشرة', 'عَشَرَة'],
    dog: ['كلب', 'كَلْب'], cat: ['قطة', 'قِطَّة'], horse: ['حصان', 'حِصَان'], cow: ['بقرة', 'بَقَرَة'], sheep: { w: ['خروف', 'خَرُوف'], he: 'כבש' },
    chicken: ['دجاجة', 'دَجَاجَة'], fish: ['سمكة', 'سَمَكَة'], bird: ['عصفور', 'عُصْفُور'], lion: ['أسد', 'أَسَد'], elephant: ['فيل', 'فِيل'],
    monkey: ['قرد', 'قِرْد'], rabbit: ['أرنب', 'أَرْنَب'], frog: ['ضفدع', 'ضِفْدَع'], bear: ['دب', 'دُبّ'],
    apple: ['تفاحة', 'تُفَّاحَة'], banana: ['موز', 'مَوْز'], grapes: ['عنب', 'عِنَب'], watermelon: ['بطيخ', 'بَطِّيخ'], lemon: ['ليمون', 'لَيْمُون'],
    strawberry: ['فراولة', 'فَرَاوِلَة'], bread: ['خبز', 'خُبْز'], milk: ['حليب', 'حَلِيب'], egg: ['بيضة', 'بَيْضَة'], cheese: ['جبن', 'جُبْن'],
    cake: ['كعكة', 'كَعْكَة'], water: ['ماء', 'مَاء'],
    eye: ['عين', 'عَيْن'], ear: ['أذن', 'أُذُن'], nose: ['أنف', 'أَنْف'], mouth: ['فم', 'فَم'], hand: ['يد', 'يَد'], foot: ['قدم', 'قَدَم'],
    tooth: ['سن', 'سِنّ'], tongue: ['لسان', 'لِسَان'],
    house: ['بيت', 'بَيْت'], book: ['كتاب', 'كِتَاب'], ball: ['كرة', 'كُرَة'], key: ['مفتاح', 'مِفْتَاح'], chair: ['كرسي', 'كُرْسِيّ'],
    car: ['سيارة', 'سَيَّارَة'], bus: ['حافلة', 'حَافِلَة'], bicycle: ['دراجة', 'دَرَّاجَة'], airplane: ['طائرة', 'طَائِرَة'],
    sun: ['شمس', 'شَمْس'], moon: ['قمر', 'قَمَر'], star: ['نجمة', 'نَجْمَة'], tree: ['شجرة', 'شَجَرَة'], flower: ['زهرة', 'زَهْرَة'],
    rain: ['مطر', 'مَطَر'], snow: ['ثلج', 'ثَلْج'], sea: ['بحر', 'بَحْر'],
    shirt: ['تي شيرت', 'تِي شِيرْت'], pants: ['بنطال', 'بِنْطَال'], dress: ['فستان', 'فُسْتَان'], sneakers: ['حذاء رياضي', 'حِذَاء رِيَاضِيّ'], socks: ['جوارب', 'جَوَارِب'],
    coat: ['معطف', 'مِعْطَف'], glasses: ['نظارة', 'نَظَّارَة'], gloves: ['قفازان', 'قُفَّازَان'], scarf: ['وشاح', 'وِشَاح'], cap: ['قبعة', 'قُبَّعَة'],
    baby: ['رضيع', 'رَضِيع'], boy: ['صبي', 'صَبِيّ'], girl: ['بنت', 'بِنْت'], woman: ['سيدة', 'سَيِّدَة'], man: ['رجل', 'رَجُل'],
    pencil: ['قلم رصاص', 'قَلَم رَصَاص'], books: ['كتب', 'كُتُب'], scissors: ['مقص', 'مِقَصّ'], schoolbag: ['حقيبة مدرسة', 'حَقِيبَة مَدْرَسَة'], crayon: ['قلم ألوان', 'قَلَم أَلْوَان'], ruler: ['مسطرة', 'مِسْطَرَة'],
    giraffe: ['زرافة', 'زَرَافَة'], turtle: ['سلحفاة', 'سُلَحْفَاة'], snake: ['ثعبان', 'ثُعْبَان'], butterfly: ['فراشة', 'فَرَاشَة'], bee: ['نحلة', 'نَحْلَة'],
    mouse: ['فأر', 'فَأْر'], penguin: ['بطريق', 'بِطْرِيق'], fox: ['ثعلب', 'ثَعْلَب'], pig: ['خنزير', 'خِنْزِير'], duck: ['بطة', 'بَطَّة'],
    carrot: ['جزر', 'جَزَر'], tomato: ['طماطم', 'طَمَاطِم'], corn: ['ذرة', 'ذُرَة'], pear: ['كمثرى', 'كُمَّثْرَى'], cherries: ['كرز', 'كَرَز'],
    pizza: ['بيتزا', 'بِيتْزَا'], chocolate: ['شوكولاتة', 'شُوكُولَاتَة'],
    balloon: ['بالون', 'بَالُون'], gift: ['هدية', 'هَدِيَّة'], kite: ['طائرة ورقية', 'طَائِرَة وَرَقِيَّة'], drum: ['طبلة', 'طَبْلَة'], guitar: ['غيتار', 'غِيتَار'],
    cloud: ['سحابة', 'سَحَابَة'], mountain: ['جبل', 'جَبَل'],
  },
  am: {
    hello: 'ሰላም',
    red: 'ቀይ', blue: 'ሰማያዊ', green: 'አረንጓዴ', yellow: 'ቢጫ', orange: 'ብርቱካናማ', purple: 'ሐምራዊ', brown: 'ቡናማ', black: 'ጥቁር', white: 'ነጭ', pink: 'ሮዝ',
    1: 'አንድ', 2: 'ሁለት', 3: 'ሦስት', 4: 'አራት', 5: 'አምስት', 6: 'ስድስት', 7: 'ሰባት', 8: 'ስምንት', 9: 'ዘጠኝ', 10: 'አስር',
    dog: 'ውሻ', cat: 'ድመት', horse: 'ፈረስ', cow: 'ላም', sheep: 'በግ', chicken: 'ዶሮ', fish: 'ዓሣ', bird: 'ወፍ', lion: 'አንበሳ', elephant: 'ዝሆን', monkey: 'ጦጣ', rabbit: 'ጥንቸል', frog: 'እንቁራሪት', bear: 'ድብ',
    apple: 'ፖም', banana: 'ሙዝ', grapes: { w: 'ወይን', he: 'ענבים' }, watermelon: 'ሐብሐብ', lemon: 'ሎሚ', strawberry: 'እንጆሪ', bread: 'ዳቦ', milk: 'ወተት', egg: 'እንቁላል', cake: 'ኬክ', water: 'ውሃ',
    eye: 'ዓይን', ear: 'ጆሮ', nose: 'አፍንጫ', mouth: 'አፍ', hand: 'እጅ', foot: 'እግር', tooth: 'ጥርስ', tongue: 'ምላስ',
    house: 'ቤት', book: 'መጽሐፍ', ball: 'ኳስ', key: 'ቁልፍ', chair: 'ወንበር', car: 'መኪና', bus: 'አውቶቡስ', bicycle: 'ብስክሌት', airplane: 'አውሮፕላን',
    sun: 'ፀሐይ', moon: 'ጨረቃ', star: 'ኮከብ', tree: 'ዛፍ', flower: 'አበባ', rain: 'ዝናብ', snow: 'በረዶ',
    shirt: 'ሸሚዝ', pants: 'ሱሪ', dress: 'ቀሚስ', sneakers: { w: 'ጫማ', he: 'נעל' }, socks: 'ካልሲ', coat: 'ኮት', glasses: 'መነጽር', gloves: 'ጓንት', cap: 'ኮፍያ',
    baby: 'ሕጻን', boy: 'ወንድ ልጅ', girl: 'ሴት ልጅ', woman: 'ሴት', man: 'ወንድ',
    pencil: 'እርሳስ', books: 'መጽሐፍት', scissors: 'መቀስ', schoolbag: 'ቦርሳ', ruler: 'ማስመሪያ',
    giraffe: 'ቀጭኔ', turtle: 'ኤሊ', snake: 'እባብ', butterfly: 'ቢራቢሮ', bee: 'ንብ', mouse: 'አይጥ', penguin: 'ፔንግዊን', fox: 'ቀበሮ', pig: 'ዓሣማ', duck: 'ዳክዬ',
    carrot: 'ካሮት', tomato: 'ቲማቲም', corn: 'በቆሎ', mushroom: 'እንጉዳይ', cherries: 'ቼሪ', pizza: 'ፒዛ', icecream: 'አይስክሬም', chocolate: 'ቸኮላታ',
    balloon: 'አፉፋ', teddy: 'ቴዲ ቢር', gift: 'ስጦታ', drum: 'ከበሮ', guitar: 'ጊታር',
    cloud: 'ደመና', rainbow: 'ቀስተ ደመና', mountain: 'ተራራ',
  },
}

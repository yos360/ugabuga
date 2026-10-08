// Color by number (/printables/color-by-number): 20 original pixel pictures drawn as data.
// Each row is a string; every character is one cell. '.' = blank (left white, no number);
// any other character is a color from CBN_COLORS. A picture's `colors` string sets the order of
// its legend — the first color is number 1, the second is number 2 and so on.
// Every picture also has a math version: each cell shows an exercise whose answer is the color's
// "answer number". Exercises come from a seeded generator, so screen and print always match.

export const CBN_COLORS = {
  R: { name: 'אדום', hex: '#e53935' },
  M: { name: 'בורדו', hex: '#8e1b3f' },
  O: { name: 'כתום', hex: '#fb8c00' },
  Y: { name: 'צהוב', hex: '#fdd835' },
  y: { name: 'צהוב בהיר', hex: '#fff59d' },
  U: { name: 'צהוב כהה', hex: '#d9a400' },
  G: { name: 'ירוק', hex: '#43a047' },
  g: { name: 'ירוק בהיר', hex: '#a5d66f' },
  D: { name: 'ירוק כהה', hex: '#2e6b30' },
  B: { name: 'כחול', hex: '#1e78d6' },
  b: { name: 'תכלת', hex: '#9fd8f5' },
  N: { name: 'כחול כהה', hex: '#1f2a6b' },
  P: { name: 'סגול', hex: '#8e44ad' },
  p: { name: 'ורוד', hex: '#f6a5c0' },
  W: { name: 'חום', hex: '#8d5a3b' },
  Z: { name: 'חום כהה', hex: '#55331f' },
  w: { name: 'בז׳', hex: '#e8c99b' },
  K: { name: 'שחור', hex: '#222222' },
  A: { name: 'אפור', hex: '#9e9e9e' },
  E: { name: 'לבן', hex: '#ffffff' },
}

// math: the kind of exercise in the math version of the level's pictures
export const CBN_LEVELS = [
  { id: 'gan', label: 'גן', long: 'לגן (גיל 4–6)', math: 'add10', mathLabel: 'חיבור עד 10', badge: 'bg-green-100' },
  { id: 'grades-1-2', label: 'כיתות א–ב', long: 'לכיתות א׳–ב׳', math: 'add20', mathLabel: 'חיבור עד 20', badge: 'bg-amber-100' },
  { id: 'adults', label: 'ילדים גדולים ומבוגרים', long: 'לילדים גדולים ולמבוגרים', math: 'mult', mathLabel: 'לוח הכפל', badge: 'bg-violet-100' },
]

export const CBN_PICTURES = [
  // ── גן: 12–16 משבצות, 3–5 צבעים ──
  {
    slug: 'apple', name: 'תפוח', emoji: '🍎', level: 'gan', colors: 'RWGE',
    blurb: 'תפוח אדום ועגול עם עלה ירוק וזנב קטן — הדף הראשון המושלם למי שרק מתחיל לזהות מספרים.',
    rows: [
      '......W.....',
      '.....W.GGG..',
      '.....W.GGGG.',
      '..RRRRWRRR..',
      '.RRERRRRRRR.',
      'RRERRRRRRRRR',
      'RREERRRRRRRR',
      'RRRRRRRRRRRR',
      'RRRRRRRRRRRR',
      '.RRRRRRRRRR.',
      '..RRRRRRRR..',
      '...RR..RR...',
    ],
  },
  {
    slug: 'fish', name: 'דג', emoji: '🐟', level: 'gan', colors: 'OYKE',
    blurb: 'דג כתום עם סנפירים וזנב צהובים ופס צהוב באמצע הגוף — שוחה לו שמאלה עם עין גדולה.',
    rows: [
      '......YYYY......',
      '.....YYYYY......',
      '...OOOOOOOOO..YY',
      '..OOOOOOOOOOOYYY',
      '.OOEKOOOYOOOOYYY',
      'OOOEKOOOYOOOOYY.',
      '.OOOOOOOYOOOOYYY',
      '..OOOOOOOOOOOYYY',
      '...OOOOOOOOO..YY',
      '.....YYY........',
    ],
  },
  {
    slug: 'ladybug', name: 'פרת משה רבנו', emoji: '🐞', level: 'gan', colors: 'RKE',
    blurb: 'פרת משה רבנו אדומה עם נקודות שחורות, מחושים ועיניים לבנות — רק שלושה צבעים.',
    rows: [
      '...K......K...',
      '....K....K....',
      '.....KKKK.....',
      '....KEKKEK....',
      '...RRRKKRRR...',
      '..RRRRKKRRRR..',
      '.RKKRRKKRRKKR.',
      '.RKKRRKKRRKKR.',
      '.RRRRRKKRRRRR.',
      '.RRKKRKKRKKRR.',
      '..RKKRKKRKKR..',
      '...RRRKKRRR...',
      '....RRKKRR....',
    ],
  },
  {
    slug: 'flower', name: 'פרח', emoji: '🌸', level: 'gan', colors: 'pYG',
    blurb: 'פרח ורוד עם לב צהוב, גבעול ארוך ושני עלים — דף רגוע עם שלושה צבעים בלבד.',
    rows: [
      '...pp..pp...',
      '..pppppppp..',
      '..ppYYYYpp..',
      '.pppYYYYppp.',
      '..ppYYYYpp..',
      '..pppppppp..',
      '...pp..pp...',
      '.....GG.....',
      '.GG..GG.....',
      '.GGG.GG..GG.',
      '..GGGGG.GGG.',
      '.....GGGGG..',
      '.....GG.....',
      '.....GG.....',
    ],
  },
  {
    slug: 'cat', name: 'חתול', emoji: '🐱', level: 'gan', colors: 'OpKE',
    blurb: 'פרצוף של חתול כתום עם אוזניים ורודות, עיניים שחורות, שפם ואף קטן.',
    rows: [
      '.OO........OO.',
      '.OpO......OpO.',
      '.OppOOOOOOppO.',
      '.OOOOOOOOOOOO.',
      'OOOOOOOOOOOOOO',
      'OOOKKOOOOKKOOO',
      'OOOKKOOOOKKOOO',
      'OOOOOOOOOOOOOO',
      'KKOOOEppEOOOKK',
      'OOOOEEEEEEOOOO',
      'KKOOEEKKEEOOKK',
      '.OOOOEEEEOOOO.',
      '..OOOOOOOOOO..',
      '....OOOOOO....',
    ],
  },
  {
    slug: 'watermelon', name: 'אבטיח', emoji: '🍉', level: 'gan', colors: 'RKgD',
    blurb: 'פרוסת אבטיח אדומה עם גרעינים שחורים וקליפה בשני גוונים של ירוק — טעם של קיץ.',
    rows: [
      'DgRRRRRRRRRRRRRRgD',
      'DgRRRKRRRRRKRRRRgD',
      '.DgRRRRRKRRRRRRgD.',
      '.DgRRKRRRRRRKRRgD.',
      '..DgRRRRKRRRRRgD..',
      '...DgRRKRRRKRgD...',
      '....DgRRRRRRgD....',
      '.....DggggggD.....',
      '......DDDDDD......',
    ],
  },
  {
    slug: 'penguin', name: 'פינגווין', emoji: '🐧', level: 'gan', colors: 'KEO',
    blurb: 'פינגווין שחור־לבן עם מקור ורגליים כתומים — שלושה צבעים, ותוצאה שתמיד יוצאת יפה.',
    rows: [
      '....KKKKKK....',
      '...KKKKKKKK...',
      '..KKEEKKEEKK..',
      '..KKEKKKKEKK..',
      '..KKKKOOKKKK..',
      '.KKKKEOOEKKKK.',
      '.KKKEEEEEEKKK.',
      'KKKEEEEEEEEKKK',
      'KKKEEEEEEEEKKK',
      'KKKEEEEEEEEKKK',
      '.KKEEEEEEEEKK.',
      '.KKEEEEEEEEKK.',
      '..KEEEEEEEEK..',
      '..KKEEEEEEKK..',
      '...KKKKKKKK...',
      '..OOOO..OOOO..',
    ],
  },
  // ── כיתות א–ב: 14–18 משבצות, 4–8 צבעים ──
  {
    slug: 'ice-cream', name: 'גלידה', emoji: '🍦', level: 'grades-1-2', colors: 'pRwWE',
    blurb: 'גביע גלידה עם כדור ורוד ודובדבן אדום למעלה, ודוגמת משבצות על הגביע.',
    rows: [
      '.....RR.....',
      '....pRRp....',
      '..pppppppp..',
      '.pppppppppp.',
      'pppEpppppppp',
      'ppEppppppppp',
      'pppppppppppp',
      '.pppppppppp.',
      '.wwwwwwwwww.',
      '..wWwwWwwW..',
      '..wwWwwWww..',
      '...wwwwww...',
      '...wWwwWw...',
      '....wwww....',
      '....wWWw....',
      '.....ww.....',
    ],
  },
  {
    slug: 'house', name: 'בית', emoji: '🏠', level: 'grades-1-2', colors: 'RYWbG',
    blurb: 'בית עם גג אדום, ארובה, שני חלונות ודלת חומה, על פס של דשא ירוק.',
    rows: [
      '.........WW...',
      '......RR.WW...',
      '.....RRRRWW...',
      '....RRRRRRW...',
      '...RRRRRRRR...',
      '..RRRRRRRRRR..',
      '.RRRRRRRRRRRR.',
      '..YYYYYYYYYY..',
      '..YbbYYYYbbY..',
      '..YbbYWWYbbY..',
      '..YYYYWWYYYY..',
      '..YYYYWWYYYY..',
      '..YYYYWWYYYY..',
      'GGGGGGGGGGGGGG',
    ],
  },
  {
    slug: 'car', name: 'מכונית', emoji: '🚗', level: 'grades-1-2', colors: 'RbKAY',
    blurb: 'מכונית אדומה עם חלונות תכולים, פנס צהוב וגלגלים שחורים, נוסעת על כביש אפור.',
    rows: [
      '.....RRRRRRR......',
      '....RbbbRbbbR.....',
      '...RbbbbRbbbbR....',
      '..RRRRRRRRRRRRRR..',
      '.RRRRRRRRRRRRRRRYY',
      'RRRRRRRRRRRRRRRRRR',
      '.RRKKKKRRRRKKKKRR.',
      '...KAAK....KAAK...',
      '....KK......KK....',
      'AAAAAAAAAAAAAAAAAA',
    ],
  },
  {
    slug: 'sailboat', name: 'סירת מפרש', emoji: '⛵', level: 'grades-1-2', colors: 'bEKRYWBN',
    blurb: 'סירת מפרש עם מפרש לבן ומפרש אדום, שמש צהובה בשמיים וגלים כחולים בים.',
    rows: [
      'bbbbbbbbbbbbbbbb',
      'bbbbbbbKbbbbYYYb',
      'bbbbbbEKbbbbYYYb',
      'bbbbbEEKRbbbYYYb',
      'bbbbEEEKRRbbbbbb',
      'bbbEEEEKRRRbbbbb',
      'bbEEEEEKRRRRbbbb',
      'bEEEEEEKRRRRRbbb',
      'EEEEEEEKRRRRRRbb',
      'bbbbbbbKbbbbbbbb',
      'bWWWWWWWWWWWWWWb',
      'bbWWWWWWWWWWWWbb',
      'BBBWWWWWWWWWWBBB',
      'BBBBBBBBBBBBBBBB',
      'BBNBBBBBNBBBBNBB',
      'BBBBBBBBBBBBBBBB',
    ],
  },
  {
    slug: 'rocket', name: 'טיל', emoji: '🚀', level: 'grades-1-2', colors: 'NRYEbO',
    blurb: 'טיל לבן עם חרטום וכנפיים אדומים, חלון עגול ולהבות כתומות — טס בין הכוכבים.',
    rows: [
      'NNNNNNRRNNNNNN',
      'NYNNNRRRRNNNNN',
      'NNNNRRRRRRNNYN',
      'NNNNEEEEEENNNN',
      'NNNNEEEEEENNNN',
      'NNNNEbbbbENNNN',
      'NNNNEbbbbENNNN',
      'NNNNEEEEEENNNN',
      'NYNNEEEEEENNNN',
      'NNNNRRRRRRNNNN',
      'NNNNEEEEEENNNN',
      'NNNREEEEEERNNN',
      'NNRREEEEEERRNN',
      'NRRREEEEEERRRN',
      'NNNNOYYYYONNNN',
      'NNNNOOYYOONNNN',
      'NNYNNOOOONNNNN',
      'NNNNNNOONNNNYN',
    ],
  },
  {
    slug: 'butterfly', name: 'פרפר', emoji: '🦋', level: 'grades-1-2', colors: 'KPYp',
    blurb: 'פרפר סימטרי עם כנפיים סגולות וורודות ונקודות צהובות — מה שצובעים בצד אחד צובעים גם בשני.',
    rows: [
      '......K....K......',
      '.......K..K.......',
      '.PPPP...KK...PPPP.',
      'PPPPPP..KK..PPPPPP',
      'PPYYPPP.KK.PPPYYPP',
      'PYYYYPPPKKPPPYYYYP',
      'PPYYPPPPKKPPPPYYPP',
      'PPPPPPPPKKPPPPPPPP',
      '.PPPPPPPKKPPPPPPP.',
      '...PPPPPKKPPPPP...',
      '..ppppppKKpppppp..',
      '.ppYYpppKKpppYYpp.',
      '.ppYYpppKKpppYYpp.',
      '.pppppp.KK.pppppp.',
      '..pppp..KK..pppp..',
      '........KK........',
    ],
  },
  {
    slug: 'dreidel', name: 'סביבון', emoji: '🌀', level: 'grades-1-2', colors: 'RBNY',
    blurb: 'סביבון כחול לחנוכה עם ידית אדומה והאות נ׳ בצהוב — דף צביעה מושלם לגן ולכיתה בחנוכה.',
    rows: [
      '......RR......',
      '......RR......',
      '......RR......',
      '..BBBBBBBBNN..',
      '..BBBBBBBBNN..',
      '..BBBYYBBBNN..',
      '..BBBBYBBBNN..',
      '..BBBBYBBBNN..',
      '..BBBBYBBBNN..',
      '..BBBBYBBBNN..',
      '..BBYYYBBBNN..',
      '..BBBBBBBBNN..',
      '...BBBBBBNN...',
      '....BBBBNN....',
      '.....BBBN.....',
      '......BN......',
      '......RR......',
    ],
  },
  {
    slug: 'owl', name: 'ינשוף', emoji: '🦉', level: 'grades-1-2', colors: 'WwEKOZ',
    blurb: 'ינשוף חום עם בטן בהירה, עיניים גדולות ומקור כתום, יושב על ענף.',
    rows: [
      '.WW..........WW.',
      '.WWW........WWW.',
      '.WWWWWWWWWWWWWW.',
      'WWEEEEWWWWEEEEWW',
      'WEEEEEEWWEEEEEEW',
      'WEEKKEEWWEEKKEEW',
      'WEEKKEEOOEEKKEEW',
      'WWEEEEWOOWEEEEWW',
      'WWWWWWWWWWWWWWWW',
      'WWWwwwwwwwwwwWWW',
      'WWwwwWwwwwWwwwWW',
      'WWwwwwwwwwwwwwWW',
      'WWwwwWwwwwWwwwWW',
      '.WWwwwwwwwwwwWW.',
      '..WWWWWWWWWWWW..',
      'ZZZZOOZZZZOOZZZZ',
      'ZZZZZZZZZZZZZZZZ',
    ],
  },
  // ── ילדים גדולים ומבוגרים: 18–24 משבצות, 6–9 צבעים ──
  {
    slug: 'hot-air-balloon', name: 'כדור פורח', emoji: '🎈', level: 'adults', colors: 'bRYBEKZWgG',
    blurb: 'כדור פורח בפסים של אדום, צהוב וכחול, מרחף בין עננים מעל גבעות ירוקות.',
    rows: [
      'bbbbbbbBBRRBBbbbbbbb',
      'bbbbbYYBBRRBBYYbbEEb',
      'EEbbRYYBBRRBBYYRbEEE',
      'EEEbRYYBBRRBBYYRbbEE',
      'bbbRRYYBBRRBBYYRRbbb',
      'bbbRRYYBBRRBBYYRRbbb',
      'bbbRRYYBBRRBBYYRRbbb',
      'bbbRRYYBBRRBBYYRRbbb',
      'bbbRRYYBBRRBBYYRRbbb',
      'bbbbRYYBBRRBBYYRbbEE',
      'EEbbRYYBBRRBBYYRbEEE',
      'EEEbbYYBBRRBBYYbbbbb',
      'bbbbbbYBBRRBBYbbbbbb',
      'bbbbbbbBBRRBBbbbbbbb',
      'bbbbbbbBBRRBBbbbbbbb',
      'bbbbbbbbBRRBbbbbbbbb',
      'bbbbbbbbKbbKbbbbbbbb',
      'bbbbbbbbKbbKbbbbbbbb',
      'bbbbbbbbZZZZbbbbbbbb',
      'bbbbbbbbWWWWbbbbbbbb',
      'bggggbbbWWWWbbbggggb',
      'ggggggbbbbbbbbgggggg',
      'gggggggggggggggggggg',
      'GGGGGGGGGGGGGGGGGGGG',
    ],
  },
  {
    slug: 'lighthouse', name: 'מגדלור', emoji: '🗼', level: 'adults', colors: 'NYEKyRWBAb',
    blurb: 'מגדלור בפסים אדומים ולבנים בלילה, עם אלומות אור, ירח, כוכבים וגלים סביב הסלעים.',
    rows: [
      'NNYNNEENNNNNNYNNNNNN',
      'NNNNENNNNKKNNNNNNYNN',
      'NNNNENNNRRRRNNNNNNNN',
      'yNNNNEERRRRRRNNNNNNy',
      'yyyyNNNKKKKKKNNNyyyy',
      'yyyyyyyKYYYYKyyyyyyy',
      'yyyyyyyKYYYYKyyyyyyy',
      'yyyyNNKKKKKKKKNNyyyy',
      'yNNNNNNNRRRRNNNNNNNy',
      'NNNNNNNNRRRRNNNNNNNN',
      'NNNNNNNNRKKRNNNNNNYN',
      'NYNNNNNNEEEENNNNNNNN',
      'NNNNNNNNEEEENNNNNNNN',
      'NNNYNNNEEEEEENNNNNNN',
      'NNNNNNNRRKKRRNNNYNNN',
      'NNNNNNNRRRRRRNNNNNNN',
      'NNNNNNNRRRRRRNNNNNNN',
      'NNNNNNNEEWWEENNNNNNN',
      'BBBBABEEEWWEEEBABBBB',
      'bbBBAAEEEWWEEEAABBbb',
      'BBBAAAAAAAAAAAAAABBB',
      'BBAAAAAAAAAAAAAAAABB',
      'BBbbBBAAAAAAAABBbbBB',
      'BBBBBBBBBbbBBBbbBBBB',
    ],
  },
  {
    slug: 'parrot', name: 'תוכי', emoji: '🦜', level: 'adults', colors: 'bREKYBWG',
    blurb: 'תוכי אדום עם מקור צהוב, כנף כחולה וזנב ארוך, יושב על ענף.',
    rows: [
      'bbbbbbRRRRbbbbbbbb',
      'bbbbbRRRRRRbbbbbbb',
      'bbbbRRREKRRRbbbbbb',
      'bbbbRRRKKRRRYYbbbb',
      'bbbbRRRRRRRYYYKbbb',
      'bbbbRRRRRRRYYKbbbb',
      'bbbRRRRRRRRRKbbbbb',
      'bbbRRRRRRRRRbbbbbb',
      'bbbRRBBBRRRRbbbbbb',
      'bbRRBBBBBRRRbbbbbb',
      'bbRRBBBYYBRRbbbbbb',
      'bbRRBBYYBBRRbbbbbb',
      'bbRRBBYBBBRRbbbbbb',
      'bbbRBBBBBBRbbbbbbb',
      'WWWWWBBBBWWWWWWGGb',
      'WWWWWWBBBWWWWWWWGG',
      'bbbbbBBYBbbbbbGGbb',
      'bbbbbBBYBbbbbbbbbb',
      'bbbbbbBYBbbbbbbbbb',
      'bbbbbbBBYbbbbbbbbb',
      'bbbbbbbBBbbbbbbbbb',
      'bbbbbbbBbbbbbbbbbb',
    ],
  },
  {
    slug: 'hanukkiah', name: 'חנוכייה', emoji: '🕎', level: 'adults', colors: 'NYObUW',
    blurb: 'חנוכייה עם שמונה נרות ושמש גבוה באמצע, להבות דולקות ושמיים כהים של ליל חנוכה.',
    rows: [
      'NNNYNNNNNNNYYNNNNNNYNNNN',
      'NNNNNNNNYNNOONNYNNNNNNNN',
      'NYNYNYNYNNNbbNNNYNYNYNYN',
      'NONONONONNNbbNNNONONONON',
      'NbNbNbNbNNNbbNNNbNbNbNbN',
      'NbNbNbNbNNNbbNNNbNbNbNbN',
      'NbNbNbNbNNNbbNNNbNbNbNbN',
      'NbNbNbNbNNUUUUNNbNbNbNbN',
      'NbNbNbNbNNNUUNNNbNbNbNbN',
      'UUUUUUUUUNNUUNNUUUUUUUUU',
      'NUUUUUUUUUUUUUUUUUUUUUUN',
      'NNNUUUUUUUUUUUUUUUUUUNNN',
      'NNNNNNNYNNNUUNNNNNNNNNNN',
      'NNYNNNNNNNNUUNNNYNNNNNNN',
      'NNNNNNNNNNNUUNNNNNNNYNNN',
      'NNNNNNNNNNNUUNNNNNNNNNNN',
      'NNNNNNNNNUUUUUUNNNNNNNNN',
      'NNNNNNNUUUUUUUUUUNNNNNNN',
      'WWWWWWWWWWWWWWWWWWWWWWWW',
      'WWWWWWWWWWWWWWWWWWWWWWWW',
    ],
  },
  {
    slug: 'turtle', name: 'צב', emoji: '🐢', level: 'adults', colors: 'bYDGgKwA',
    blurb: 'צב עם שריון מעוטר בשני גוונים של ירוק, הולך לאט על החול מתחת לשמש.',
    rows: [
      'bYYbbbbbbbbbbbbbbbbbbbbb',
      'YYYYbbbbbbbbbbbbbbbbbbbb',
      'bYYbbbbbbbbbbbbbbbbbbbbb',
      'bbbbbbbbDDDDDDDDbbbbbbbb',
      'bbbbbbDDDGGGGGDDDDbbbbbb',
      'bbbbbGDDDGDDDGDDDGDbbbbb',
      'bbbbGDGDDGDDDGDDGDGbbggb',
      'bbbbDGDDDGGGGGDDDGDDggKg',
      'bbbbDDDDDDDDDDDDDDDDbggg',
      'bbbDDDDGGGDDDDGGGDDDDggb',
      'bbgYYYYYYYYYYYYYYYYYYbbb',
      'bggbgggbbbbbbbbbgggbbbbb',
      'wwwwgggwwwwwwwwwgggwwwww',
      'wwwwwwwwwwwwwwwwwwwwAwww',
      'wwwAwwwwwwwwwwwAwwwwwwww',
      'wwwwwwwwwwAwwwwwwwwwwwAw',
    ],
  },
]

// ── helpers ──
export const cbnBySlug = slug => CBN_PICTURES.find(p => p.slug === slug)
export const cbnLevel = id => CBN_LEVELS.find(l => l.id === id)
export const cbnSize = p => ({ cols: p.rows[0].length, rows: p.rows.length })

// legend: [{ num, ch, name, hex }]
export function cbnLegend(p) {
  return [...p.colors].map((ch, i) => ({ num: i + 1, ch, ...CBN_COLORS[ch] }))
}

// 2D grid of color numbers (0 = blank cell)
export function cbnGrid(p) {
  const idx = Object.fromEntries([...p.colors].map((ch, i) => [ch, i + 1]))
  return p.rows.map(row => [...row].map(ch => (ch === '.' ? 0 : idx[ch] ?? -1)))
}

// small, deterministic PRNG (mulberry32) seeded from the slug
function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const pick = (r, list) => list[Math.floor(r() * list.length)]

// Answer pools per math kind. Every answer can be reached by several different exercises, so a
// big area of one color doesn't repeat the same exercise over and over. Multiplication answers all
// have at least two factor pairs inside the 2–10 tables.
const ANSWER_POOLS = {
  add10: [6, 7, 8, 9, 10],
  add20: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  mult: [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 45, 48, 54, 56, 63, 72],
}
export const cbnMathKind = p => cbnLevel(p.level).math
const multPairs = v => { const out = []; for (let a = 2; a <= 10; a++) if (v % a === 0 && v / a >= 2 && v / a <= 10) out.push([a, v / a]); return out }
const variety = (kind, v) => (kind === 'mult' ? multPairs(v).length : v - 1)

// answer for each legend number: { [num]: answer } — distinct answers; the colors with the most
// cells get the answers with the most different exercises.
export function cbnAnswers(p) {
  const kind = cbnMathKind(p), r = rng(hashStr(p.slug + ':answers'))
  const pool = ANSWER_POOLS[kind].map(v => ({ v, t: r() }))
  const n = p.colors.length
  const chosen = kind === 'mult'
    ? pool.sort((a, b) => variety(kind, b.v) - variety(kind, a.v) || a.t - b.t).slice(0, n).map(x => x.v)
    : pool.sort((a, b) => a.t - b.t).slice(0, n).map(x => x.v).sort((a, b) => b - a)
  const counts = [...p.colors].map((ch, i) => ({ num: i + 1, count: p.rows.join('').split(ch).length - 1 }))
  counts.sort((a, b) => b.count - a.count || a.num - b.num)
  return Object.fromEntries(counts.map((c, i) => [c.num, chosen[i]]))
}

function exerciseFor(kind, answer, r) {
  if (kind === 'mult') {
    const [a, b] = pick(r, multPairs(answer))
    return { a, b, op: '×', text: `${a}×${b}` }
  }
  // addition: both addends at least 1 (and at most 10 for the up-to-10 sheets, which is automatic)
  const a = 1 + Math.floor(r() * (answer - 1))
  return { a, b: answer - a, op: '+', text: `${a}+${answer - a}` }
}
export const cbnEval = ex => (ex.op === '×' ? ex.a * ex.b : ex.a + ex.b)

// 2D grid of exercises (null for blank cells), seeded by the slug — identical on every render
export function cbnMathGrid(p) {
  const kind = cbnMathKind(p), answers = cbnAnswers(p), r = rng(hashStr(p.slug + ':cells'))
  return cbnGrid(p).map(row => row.map(n => (n > 0 ? exerciseFor(kind, answers[n], r) : null)))
}

export const cbnPath = p => `/printables/color-by-number/${p.slug}`

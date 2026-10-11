// Origami models: traditional, public-domain folds. Every step is a geometric operation (see
// engine.js) and the diagrams are computed from them, so the paper stays consistent.
// Coordinates: a square sheet is 100×100, an A4 sheet is 100×141.42 (portrait), y grows down.
import { rectPaper } from './engine.js'

const R2 = Math.SQRT2
const A4H = 100 * R2 // 141.42
const diamond = (coloredUp = false) => [{ pts: [[50, 0], [100, 50], [50, 100], [0, 50]], c: coloredUp, cr: [], tag: '' }]

// ── Cup ──────────────────────────────
// Triangle with the fold at the bottom: A(0,50) B(100,50) apex C(50,0). The corner flap's top
// edge is level when B lands on AC at P = (p, 50 − p) with p = 100 / (2 + √2).
const cupP = 100 / (2 + R2) // 29.29
const cup = {
  slug: 'paper-cup', title: 'כוס מנייר', emoji: '🥤', level: 1, color: '#60a5fa',
  paper: diamond(false),
  steps: [
    { op: 'fold', from: [50, 100], to: [50, 0], text: 'מניחים ריבוע נייר כמו יהלום, הצד הלבן למעלה. מקפלים את הפינה התחתונה אל הפינה העליונה — מתקבל משולש.' },
    { op: 'fold', from: [100, 50], to: [cupP, 50 - cupP], text: 'מקפלים את הפינה הימנית אל הצלע השמאלית, כך שהקצה העליון של הדש יהיה ישר ומאוזן.' },
    { op: 'fold', from: [0, 50], to: [100 - cupP, 50 - cupP], text: 'מקפלים באותה דרך את הפינה השמאלית אל הצד הימני.' },
    { op: 'fold', from: [50, 0], to: [50, 2 * (50 - cupP)], sel: { top: 1 }, text: 'מקפלים את השכבה העליונה של המשולש למטה, לכיוונכם. אפשר להכניס אותה לכיס של הדש.' },
    { op: 'fold', from: [50, 0], to: [50, 2 * (50 - cupP)], sel: { bottom: 1 }, mountain: true, text: 'מקפלים את השכבה האחורית למטה, אל מאחור (קיפול הר).' },
    { op: 'done', text: 'לוחצים קלות על הצדדים כדי לפתוח את הכוס — והיא מוכנה! אפשר לשים בה פופקורן או ממתקים.' },
  ],
}

// ── Hat ──────────────────────────────
const hat = {
  slug: 'paper-hat', title: 'כובע מנייר', emoji: '👒', level: 1, color: '#f87171',
  paper: rectPaper(100, A4H, false),
  steps: [
    { op: 'fold', from: [50, 0], to: [50, A4H], text: 'דף A4 לאורך. מקפלים את החצי העליון למטה, קצה אל קצה. הקיפול נמצא עכשיו למעלה.' },
    { op: 'crease', from: [0, 110], to: [100, 110], text: 'מקפלים לחצי מימין לשמאל ופותחים בחזרה — רק כדי לסמן קו אמצע.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, A4H / 2], to: [50, A4H / 2 + 50] }, { op: 'fold', from: [100, A4H / 2], to: [50, A4H / 2 + 50], bend: -1 }], text: 'מקפלים את שתי הפינות העליונות אל קו האמצע, כך שייפגשו באמצע. למטה נשאר פס.' },
    { op: 'fold', from: [50, A4H], to: [50, 100], sel: { top: 1 }, text: 'מקפלים את השכבה העליונה של הפס התחתון למעלה, מעל המשולשים.' },
    { op: 'turn', text: 'הופכים את הכובע לצד השני.' },
    { op: 'fold', from: [50, A4H], to: [50, 100], sel: { top: 1 }, text: 'מקפלים גם את הפס שבצד הזה למעלה.' },
    { op: 'done', text: 'פותחים את הכובע מלמטה וחובשים. כובע מדף עיתון יוצא גדול מספיק גם למבוגרים.' },
  ],
}

// ── Classic dart plane ──────────────────────────────
// After the two corner folds the outer edge runs from the nose (50,0) to (100,120.71).
// Folded in half and turned on its side, the nose is at (4.29,95.71) and the keel is y = 95.71.
const dartWing = Math.hypot(120.71, 50) // 130.66
const dart = {
  slug: 'paper-airplane', title: 'מטוס נייר', emoji: '✈️', level: 2, color: '#38bdf8',
  paper: rectPaper(100, A4H, false),
  steps: [
    { op: 'crease', from: [0, 75], to: [100, 75], text: 'דף A4 לאורך. מקפלים לחצי לאורך ופותחים — יש לנו קו אמצע.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 0], to: [50, 50] }, { op: 'fold', from: [100, 0], to: [50, 50], bend: -1 }], text: 'מקפלים את שתי הפינות העליונות אל קו האמצע.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [50, 50 * R2] }, { op: 'fold', from: [100, 50], to: [50, 50 * R2], bend: -1 }], text: 'מקפלים שוב את השוליים המשופעים אל קו האמצע. החרטום נעשה חד.' },
    { op: 'fold', from: [25, 110], to: [75, 110], mountain: true, tag: 'back', text: 'מקפלים את המטוס לחצי לאורך קו האמצע, כשהקיפולים נשארים בחוץ.' },
    { op: 'rotate', deg: -90, text: 'מסובבים את המטוס על הצד: החרטום שמאלה והקיפול (הגחון) למטה.' },
    { op: 'fold', from: [125, 45.71], to: [4.29 + dartWing, 95.71], sel: { notTag: 'back' }, arrow: [[76.7, 65.7], [82.7, 95.71]], text: 'מקפלים את הכנף הקדמית למטה: השפה העליונה יורדת עד הגחון.' },
    { op: 'turn', text: 'הופכים את המטוס.' },
    { op: 'fold', from: [25, 45.71], to: [145.71 - dartWing, 95.71], sel: { tag: 'back' }, arrow: [[73.3, 65.7], [67.3, 95.71]], text: 'מקפלים גם את הכנף השנייה בדיוק באותה דרך.' },
    { op: 'set', faces: [
      { pts: [[50, 0], [50, 128], [6, 128]], c: true },
      { pts: [[50, 0], [94, 128], [50, 128]], c: true },
    ], deco: [{ t: 'path', d: 'M50 4 L50 128', w: 2.4 }], text: 'פותחים את הכנפיים כך שיהיו ישרות ומאוזנות — והמטוס מוכן להמראה!' },
  ],
}


// ── Glider (the "Nakamura lock" plane) ──────────────────────────────
const glider = {
  slug: 'paper-glider', title: 'מטוס נייר שעף רחוק', emoji: '🛩️', level: 2, color: '#a78bfa',
  paper: rectPaper(100, A4H, false),
  steps: [
    { op: 'crease', from: [0, 75], to: [100, 75], text: 'דף A4 לאורך. מקפלים לחצי לאורך ופותחים.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 0], to: [50, 50] }, { op: 'fold', from: [100, 0], to: [50, 50], bend: -1 }], text: 'מקפלים את שתי הפינות העליונות אל קו האמצע.' },
    { op: 'fold', from: [50, 0], to: [50, 100], tag: 'tip', text: 'מקפלים את כל המשולש העליון למטה, לאורך הקו שבתחתית המשולשים. החוד מגיע בערך לשני שלישים מהדף.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [50, 86], tag: 'flap' }, { op: 'fold', from: [100, 50], to: [50, 86], tag: 'flap', bend: -1 }], text: 'מקפלים את שתי הפינות העליונות החדשות אל קו האמצע, כך שייפגשו קצת מעל החוד — החוד הקטן צריך להציץ מתחתן.' },
    { op: 'fold', from: [50, 100], to: [50, 80], sel: { tag: 'tip' }, tag: 'lock', text: 'מקפלים את החוד הקטן למעלה, מעל שתי הפינות. הוא "נועל" אותן כך שלא ייפתחו בזמן הטיסה.' },
    { op: 'fold', from: [25, 110], to: [75, 110], mountain: true, tag: 'back', text: 'מקפלים את המטוס לחצי לאורך קו האמצע, כשהקיפולים בחוץ.' },
    { op: 'rotate', deg: -90, text: 'מסובבים את המטוס על הצד: החרטום שמאלה והגחון למטה.' },
    { op: 'fold', line: [[0, 104], [200, 104]], from: [95, 72], to: [95, 136], sel: { notTag: 'back' }, text: 'מקפלים את הכנף הקדמית למטה, בקו ישר שמקביל לגחון, בערך 3 ס״מ מעליו.' },
    { op: 'turn', text: 'הופכים את המטוס.' },
    { op: 'fold', line: [[0, 104], [200, 104]], from: [55, 72], to: [55, 136], sel: { tag: 'back' }, text: 'מקפלים את הכנף השנייה באותו קו בדיוק, כך ששתי הכנפיים יהיו שוות.' },
    { op: 'set', faces: [
      { pts: [[44, 0], [50, 0], [50, 112], [4, 112]], c: true },
      { pts: [[50, 0], [56, 0], [96, 112], [50, 112]], c: true },
    ], deco: [{ t: 'path', d: 'M50 2 L50 112', w: 2.4 }], text: 'פותחים את הכנפיים כך שיהיו ישרות. החרטום השטוח והכבד עוזר למטוס לגלוש רחוק ויציב.' },
  ],
}

// ── Heart ──────────────────────────────
const heart = {
  slug: 'heart', title: 'לב מנייר', emoji: '❤️', level: 2, color: '#f43f5e',
  paper: rectPaper(100, 100, false),
  steps: [
    { op: 'multi', ops: [{ op: 'crease', from: [0, 50], to: [100, 50] }, { op: 'crease', from: [50, 0], to: [50, 100], bend: -1 }], text: 'ריבוע נייר, הצד הלבן למעלה. מקפלים לחצי פעם לאורך ופעם לרוחב, ופותחים — יש לנו קו אמצע אנכי ואופקי.' },
    { op: 'fold', from: [50, 0], to: [50, 50], text: 'מקפלים את השפה העליונה למטה, עד קו האמצע האופקי.' },
    { op: 'fold', from: [50, 100], to: [50, 25], text: 'מקפלים את השפה התחתונה למעלה, עד השפה העליונה.' },
    { op: 'multi', ops: [{ op: 'fold', from: [100, 62.5], to: [50, 12.5], tag: 'R', bend: -1 }, { op: 'fold', from: [0, 62.5], to: [50, 12.5], tag: 'L' }], text: 'מקפלים את החצי הימני של השפה התחתונה למעלה, כך שהשפה תהיה צמודה לקו האמצע. עושים אותו דבר בצד שמאל — מתקבלת צורת V.' },
    { op: 'turn', text: 'הופכים את הדף.' },
    { op: 'multi', ops: [
      { op: 'fold', from: [12.5, 12.5], to: [20, 20], mountain: true, sel: { tag: 'R' } },
      { op: 'fold', from: [87.5, 12.5], to: [80, 20], mountain: true, sel: { tag: 'L' }, bend: -1 },
      { op: 'fold', from: [50, 12.5], to: [43.5, 19], mountain: true, sel: { tag: 'R' }, bend: -1 },
      { op: 'fold', from: [50, 12.5], to: [56.5, 19], mountain: true, sel: { tag: 'L' } },
    ], text: 'מקפלים לאחור את ארבע הפינות העליונות — שתיים בצדדים ושתיים באמצע — כדי לעגל את הלב.' },
    { op: 'done', text: 'הופכים — והלב מוכן! אפשר לכתוב עליו ברכה ולצרף לכרטיס.' },
  ],
}

// ── Faces from a triangle (dog, cat, fox) ──────────────────────────────
// Triangle with the fold on top: A(0,50) B(100,50), point C(50,100).
const triangleDown = text => ({ op: 'fold', from: [50, 0], to: [50, 100], text })
const dog = {
  slug: 'dog', title: 'כלב מנייר', emoji: '🐶', level: 1, color: '#d6a46b',
  paper: diamond(false),
  steps: [
    triangleDown('ריבוע נייר כמו יהלום, הצד הלבן למעלה. מקפלים את הפינה העליונה אל התחתונה — משולש שהחוד שלו למטה.'),
    { op: 'crease', from: [25, 60], to: [75, 60], text: 'מקפלים לחצי מימין לשמאל ופותחים, כדי לסמן את האמצע.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [15, 80] }, { op: 'fold', from: [100, 50], to: [85, 80], bend: -1 }], text: 'מקפלים את שתי הפינות למטה, באלכסון — אלה האוזניים. הקצוות שלהן בולטים קצת החוצה.' },
    { op: 'fold', from: [50, 100], to: [50, 86], mountain: true, text: 'מקפלים את החוד התחתון קצת לאחור — זה האף.' },
    { op: 'fold', from: [50, 50], to: [50, 57], mountain: true, sel: { top: 2 }, line: [[40, 53.5], [60, 53.5]], text: 'מקפלים פס דק מהשפה העליונה לאחור, כדי שהראש יהיה מעוגל.' },
    { op: 'done', deco: [
      { t: 'circle', c: [40, 64], r: 2.6 }, { t: 'circle', c: [60, 64], r: 2.6 },
      { t: 'path', d: 'M45.5 81 Q50 77 54.5 81 Q50 86 45.5 81 Z', fill: '#26324a' },
      { t: 'path', d: 'M50 84 L50 87 M50 87 Q46 89.5 43 87 M50 87 Q54 89.5 57 87' },
    ], text: 'מציירים עיניים, אף ופה — והכלבלב מוכן!' },
  ],
}

const earsSteps = (tipL, tipR) => [
  triangleDown('ריבוע נייר כמו יהלום, הצד הלבן למעלה. מקפלים את הפינה העליונה אל התחתונה — משולש שהחוד שלו למטה.'),
  { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [50, 100], tag: 'L' }, { op: 'fold', from: [100, 50], to: [50, 100], tag: 'R', bend: -1 }], text: 'מקפלים את הפינה השמאלית ואת הימנית למטה, אל החוד התחתון. מתקבל ריבוע עומד.' },
  { op: 'multi', ops: [{ op: 'fold', from: [50, 100], to: tipL, sel: { tag: 'L' }, tag: 'earL' }, { op: 'fold', from: [50, 100], to: tipR, sel: { tag: 'R' }, tag: 'earR', bend: -1 }], text: 'מקפלים את שני הדשים בחזרה למעלה, באלכסון החוצה, כך שהקצוות שלהם בולטים מעל הראש — אלה האוזניים.' },
]
const cat = {
  slug: 'cat', title: 'חתול מנייר', emoji: '🐱', level: 1, color: '#9ca3af',
  paper: diamond(false),
  steps: [
    ...earsSteps([26, 40], [74, 40]),
    { op: 'fold', from: [50, 50], to: [50, 62], mountain: true, sel: { tags: ['', 'L', 'R'] }, text: 'מקפלים את החוד העליון של הראש לאחור, בין האוזניים, כדי שהראש יהיה שטוח.' },
    { op: 'fold', from: [50, 100], to: [50, 84], mountain: true, text: 'מקפלים את החוד התחתון לאחור, כדי שהסנטר יהיה קצר ועגול.' },
    { op: 'done', deco: [
      { t: 'path', d: 'M37 66 Q40 63 43 66 Q40 69 37 66 Z', fill: '#26324a' }, { t: 'path', d: 'M57 66 Q60 63 63 66 Q60 69 57 66 Z', fill: '#26324a' },
      { t: 'path', d: 'M47.5 73 L52.5 73 L50 76 Z', fill: '#f9a8d4' },
      { t: 'path', d: 'M50 76 Q47 79 44.5 77.5 M50 76 Q53 79 55.5 77.5 M42 74 L30 72 M42 76 L31 78 M58 74 L70 72 M58 76 L69 78', w: 1.2 },
    ], text: 'מציירים עיניים, אף ושפם — והחתול מוכן!' },
  ],
}

const fox = {
  slug: 'fox', title: 'שועל מנייר', emoji: '🦊', level: 1, color: '#f97316',
  paper: diamond(false),
  steps: [
    ...earsSteps([12, 38], [88, 38]),
    { op: 'turn', text: 'הופכים את הדף.' },
    { op: 'done', deco: [
      { t: 'path', d: 'M36 62 Q40 59 44 62', w: 2 }, { t: 'path', d: 'M56 62 Q60 59 64 62', w: 2 },
      { t: 'path', d: 'M46.5 92 Q50 89 53.5 92 Q50 96 46.5 92 Z', fill: '#26324a' },
    ], text: 'מציירים עיניים ואף בקצה החוד — והשועל מוכן! אפשר לצבוע את הסנטר בלבן.' },
  ],
}

// ── Tulip ──────────────────────────────
const tulip = {
  slug: 'tulip', title: 'צבעוני מנייר', emoji: '🌷', level: 1, color: '#ec4899',
  paper: diamond(false),
  steps: [
    triangleDown('ריבוע נייר כמו יהלום, הצד הלבן למעלה. מקפלים את הפינה העליונה אל התחתונה — משולש שהחוד שלו למטה.'),
    { op: 'crease', from: [25, 60], to: [75, 60], text: 'מקפלים לחצי ופותחים, כדי לסמן את האמצע.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [40, 30] }, { op: 'fold', from: [100, 50], to: [60, 30], bend: -1 }], text: 'מקפלים את הפינה השמאלית למעלה, מהחוד התחתון, כך שהקצה שלה יבלוט מעל השפה העליונה. עושים אותו דבר עם הפינה הימנית. שני הדשים הם עלי הכותרת של הפרח.' },
    { op: 'multi', ops: [{ op: 'fold', from: [25, 50], to: [31, 50.5], mountain: true }, { op: 'fold', from: [75, 50], to: [69, 50.5], mountain: true, bend: -1 }], text: 'מקפלים לאחור את שתי הפינות הקטנות שבצדדים, כדי שהפרח יהיה מעוגל.' },
    { op: 'done', deco: [
      { t: 'path', d: 'M50 98 L50 150', stroke: '#15803d', w: 4 },
      { t: 'poly', pts: [[50, 140], [30, 112], [36, 110], [50, 128]], fill: '#22c55e' },
      { t: 'poly', pts: [[50, 132], [68, 108], [62, 106], [50, 120]], fill: '#22c55e' },
    ], text: 'מדביקים את הפרח על מקל או מציירים לו גבעול ועלים. כמה צבעונים בצבעים שונים הם זר יפה למתנה.' },
  ],
}

// ── Fortune teller (קוטי פוטי) ──────────────────────────────
const blintz = (pts, text) => ({ op: 'multi', ops: pts.map((p, i) => ({ op: 'fold', from: p, to: [50, 50], bend: i % 2 ? -1 : 1 })), text })
const fortuneTeller = {
  slug: 'fortune-teller', title: 'קוטי פוטי', emoji: '🌸', level: 2, color: '#fbbf24',
  paper: rectPaper(100, 100, false),
  steps: [
    { op: 'multi', ops: [{ op: 'crease', from: [0, 0], to: [100, 100] }, { op: 'crease', from: [100, 0], to: [0, 100], bend: -1 }], text: 'ריבוע נייר, הצד הצבעוני למטה. מקפלים לחצי באלכסון ופותחים, ואז באלכסון השני — שני קווים שנפגשים במרכז.' },
    blintz([[0, 0], [100, 0], [100, 100], [0, 100]], 'מקפלים את ארבע הפינות אל המרכז.'),
    { op: 'turn', text: 'הופכים את הדף.' },
    blintz([[50, 0], [100, 50], [50, 100], [0, 50]], 'שוב מקפלים את ארבע הפינות החדשות אל המרכז. על המשולשים כותבים מספרים, ומתחת לדשים — משפטים או משימות.'),
    { op: 'multi', ops: [{ op: 'crease', from: [30, 30], to: [70, 30] }, { op: 'crease', from: [30, 30], to: [30, 70], bend: -1 }], text: 'מקפלים לחצי ופותחים, פעם לאורך ופעם לרוחב.' },
    { op: 'turn', text: 'הופכים: בצד הזה יש ארבעה ריבועים — צובעים כל אחד בצבע אחר.' },
    { op: 'set', faces: [
      { pts: [[25, 25], [49, 25], [49, 49], [25, 49]], c: true }, { pts: [[51, 25], [75, 25], [75, 49], [51, 49]], c: true },
      { pts: [[25, 51], [49, 51], [49, 75], [25, 75]], c: true }, { pts: [[51, 51], [75, 51], [75, 75], [51, 75]], c: true },
    ], deco: [
      { t: 'path', d: 'M25 25 L49 49 M75 25 L51 49 M25 75 L49 51 M75 75 L51 51', w: 1 },
    ], text: 'מכניסים אגודל ואצבע של כל יד מתחת לארבעת הריבועים, ודוחפים אותם אל המרכז עד שהם נפגשים בחוד — והקוטי פוטי מוכן למשחק!' },
  ],
}

// ── Masu box ──────────────────────────────
// After the four corners are folded to the centre and the square is turned 45°, it spans
// lo…hi (14.64…85.36); its quarter lines are q1 and q3 (32.32 and 67.68).
const lo = 50 - 50 / R2, hi = 50 + 50 / R2, q1 = (lo + 50) / 2, q3 = (hi + 50) / 2
const xl = 2 * lo - q1, xr = 2 * hi - q3 // the quarter lines mirrored onto the unfolded flaps
const iso = (x, y, z) => [50 + (x - y) * 0.866, 40 + (x + y) * 0.5 - z]
const isoFace = (pts3, fill) => ({ t: 'poly', pts: pts3.map(p => iso(...p)), fill })
const masuOpen = [
  { pts: [[lo, lo], [hi, lo], [2 * hi - 50, 50], [hi, hi], [lo, hi], [2 * lo - 50, 50]], c: false, cr: [
    [[xl, q1], [xr, q1]], [[xl, q3], [xr, q3]], [[q1, lo], [q1, hi]], [[q3, lo], [q3, hi]],
    [[xl, q1], [xl, q3]], [[xr, q1], [xr, q3]], [[lo, lo], [lo, hi]], [[hi, lo], [hi, hi]], [[2 * lo - 50, 50], [2 * hi - 50, 50]],
  ] },
  { pts: [[lo, lo], [hi, lo], [50, 50]], c: true, cr: [[[q1, q1], [q3, q1]]] },
  { pts: [[hi, hi], [lo, hi], [50, 50]], c: true, cr: [[[q1, q3], [q3, q3]]] },
]
const boxBody = [
  isoFace([[0, 0, 0], [40, 0, 0], [40, 0, 20], [0, 0, 20]], '#a7f3d0'),
  isoFace([[0, 0, 0], [40, 0, 0], [40, 40, 0], [0, 40, 0]], '#d1fae5'),
  isoFace([[0, 0, 0], [0, 40, 0], [0, 40, 20], [0, 0, 20]], '#a7f3d0'),
  isoFace([[40, 0, 0], [40, 40, 0], [40, 40, 20], [40, 0, 20]], 'paper'),
  isoFace([[0, 40, 0], [40, 40, 0], [40, 40, 20], [0, 40, 20]], 'paper'),
]
const masu = {
  slug: 'masu-box', title: 'קופסה מנייר', emoji: '📦', level: 3, color: '#34d399',
  paper: rectPaper(100, 100, false),
  steps: [
    { op: 'multi', ops: [{ op: 'crease', from: [0, 0], to: [100, 100] }, { op: 'crease', from: [100, 0], to: [0, 100], bend: -1 }], text: 'ריבוע נייר, הצד הצבעוני למטה. מקפלים לחצי בשני האלכסונים ופותחים.' },
    blintz([[0, 0], [100, 0], [100, 100], [0, 100]], 'מקפלים את ארבע הפינות אל המרכז, בדיוק על נקודת המפגש של הקווים.'),
    { op: 'rotate', deg: 45, center: [50, 50], text: 'מסובבים את הריבוע כך שאחת השפות תהיה למעלה.' },
    { op: 'multi', ops: [{ op: 'crease', from: [50, lo], to: [50, 50] }, { op: 'crease', from: [50, hi], to: [50, 50], bend: -1 }], text: 'מקפלים את השפה העליונה אל המרכז ופותחים. עושים אותו דבר עם השפה התחתונה.' },
    { op: 'multi', ops: [{ op: 'crease', from: [lo, 50], to: [50, 50] }, { op: 'crease', from: [hi, 50], to: [50, 50], bend: -1 }], text: 'עכשיו מקפלים את השפה השמאלית ואת הימנית אל המרכז, ופותחים.' },
    { op: 'set', faces: masuOpen, marks: [{ t: 'fold', kind: 'valley', p: [q1, q1], q: [q3, q1] }, { t: 'fold', kind: 'valley', p: [q1, q3], q: [q3, q3] }], text: 'פותחים את שני המשולשים שבצד ימין ובצד שמאל. מרימים את שתי הדפנות הארוכות (למעלה ולמטה) כך שיעמדו ישר, לאורך הקווים המסומנים.' },
    { op: 'set', faces: [], deco: [
      ...boxBody.slice(0, 4),
      isoFace([[0, 40, 0], [40, 40, 0], [40, 40, 20], [0, 40, 20]], '#ffffff'),
      isoFace([[0, 40, 20], [40, 40, 20], [40, 58, 32], [0, 58, 32]], '#ffffff'),
      { t: 'path', d: `M${iso(20, 58, 32).join(' ')} Q${iso(20, 52, 62).join(' ')} ${iso(20, 26, 6).join(' ')}` },
      { t: 'poly', pts: [iso(20, 26, 6), iso(18.5, 30, 12), iso(22, 29, 10)], fill: '#26324a' },
    ], text: 'בכל קצה, הדופן הקצרה מתרוממת והפינות נדחפות פנימה לאורך הקפלים האלכסוניים. מקפלים את הדש שנשאר מעל הדופן ואל תוך הקופסה, עד שהוא נוגע ברצפה. חוזרים על זה בצד השני.' },
    { op: 'set', faces: [], deco: [
      ...boxBody,
      { t: 'path', d: `M${iso(20, 0, 0).join(' ')} L${iso(20, 40, 0).join(' ')}`, w: 1, stroke: '#047857' },
    ], text: 'הקופסה מוכנה! מריבוע גדול ב-5 מילימטרים מקבלים מכסה שנכנס עליה בדיוק.' },
  ],
}

// ── Envelope ──────────────────────────────
const envelope = {
  slug: 'envelope', title: 'מעטפה מנייר', emoji: '✉️', level: 1, color: '#facc15',
  paper: diamond(false),
  steps: [
    { op: 'fold', from: [50, 100], to: [50, 50], text: 'ריבוע נייר כמו יהלום, הצד הלבן למעלה. מקפלים את הפינה התחתונה אל המרכז.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [55, 50] }, { op: 'fold', from: [100, 50], to: [45, 50], bend: -1 }], text: 'מקפלים את הפינה השמאלית ואת הימנית פנימה, כך שהן עוברות קצת את קו האמצע וחופפות זו את זו.' },
    { op: 'fold', from: [50, 0], to: [50, 55], text: 'מקפלים את הפינה העליונה למטה — זה הדש של המעטפה.' },
    { op: 'done', deco: [{ t: 'path', d: 'M50 47 C47 43 42 47 50 53 C58 47 53 43 50 47 Z', fill: '#e11d48', stroke: '#e11d48' }], text: 'המעטפה מוכנה. שמים בפנים מכתב או כרטיס, וסוגרים את הדש עם מדבקה.' },
  ],
}

// ── Corner bookmark ──────────────────────────────
const bookmark = {
  slug: 'bookmark', title: 'סימניה מנייר', emoji: '🔖', level: 2, color: '#22d3ee',
  paper: diamond(false),
  steps: [
    { op: 'fold', from: [50, 100], to: [50, 0], text: 'ריבוע נייר כמו יהלום, הצד הלבן למעלה. מקפלים את הפינה התחתונה אל העליונה — משולש שהחוד שלו למעלה.' },
    { op: 'fold', from: [50, 0], to: [50, 50], sel: { top: 1 }, tag: 'pocket', text: 'מקפלים רק את השכבה העליונה של החוד למטה, עד אמצע השפה התחתונה.' },
    { op: 'multi', ops: [{ op: 'crease', from: [0, 50], to: [50, 0] }, { op: 'crease', from: [100, 50], to: [50, 0], bend: -1 }], text: 'מקפלים את הפינה השמאלית ואת הימנית למעלה, אל החוד, ופותחים אותן בחזרה.' },
    { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [50, 0], under: 'pocket' }, { op: 'fold', from: [100, 50], to: [50, 0], under: 'pocket', bend: -1 }], text: 'מקפלים אותן שוב, אבל הפעם מכניסים כל פינה לתוך הכיס — מתחת לדש שקיפלנו בשלב 2.' },
    { op: 'done', deco: [
      { t: 'circle', c: [42, 34], r: 3.6, fill: '#fff', stroke: '#26324a' }, { t: 'circle', c: [58, 34], r: 3.6, fill: '#fff', stroke: '#26324a' },
      { t: 'circle', c: [42, 34.5], r: 1.6 }, { t: 'circle', c: [58, 34.5], r: 1.6 },
    ], text: 'הסימניה מוכנה! מלבישים אותה על פינת הדף. אפשר לצייר עליה פרצוף של מפלצת, שועל או לב.' },
  ],
}

// ── Samurai helmet (kabuto) ──────────────────────────────
const helmet = {
  slug: 'samurai-helmet', title: 'כובע סמוראי מנייר', emoji: '⛑️', level: 2, color: '#6366f1',
  paper: diamond(false),
  steps: [
    triangleDown('ריבוע נייר כמו יהלום, הצד הלבן למעלה. מקפלים את הפינה העליונה אל התחתונה — משולש שהחוד שלו למטה.'),
    { op: 'multi', ops: [{ op: 'fold', from: [0, 50], to: [50, 100], tag: 'L' }, { op: 'fold', from: [100, 50], to: [50, 100], tag: 'R', bend: -1 }], text: 'מקפלים את שתי הפינות של הצדדים אל החוד התחתון. מתקבל ריבוע עומד.' },
    { op: 'multi', ops: [{ op: 'fold', from: [50, 100], to: [50, 50], sel: { tag: 'L' }, tag: 'L2' }, { op: 'fold', from: [50, 100], to: [50, 50], sel: { tag: 'R' }, tag: 'R2', bend: -1 }], text: 'מקפלים את שני הדשים העליונים בחזרה למעלה, אל החוד העליון.' },
    { op: 'multi', ops: [{ op: 'fold', from: [50, 50], to: [34, 42], sel: { tag: 'L2' } }, { op: 'fold', from: [50, 50], to: [66, 42], sel: { tag: 'R2' }, bend: -1 }], text: 'מקפלים את הקצוות של שני הדשים החוצה ולמעלה, באלכסון — אלה הקרניים של הכובע.' },
    { op: 'fold', from: [50, 100], to: [50, 64], sel: { top: 1 }, tag: 'brim', text: 'מקפלים את השכבה הקדמית של החוד התחתון למעלה, קצת מתחת לקרניים.' },
    { op: 'fold', from: [50, 82], to: [50, 68], sel: { top: 2 }, text: 'מקפלים את הפס הזה שוב למעלה, לאורך השפה של הריבוע — זו המצחייה.' },
    { op: 'fold', from: [50, 100], to: [50, 50], mountain: true, sel: { bottom: 1 }, text: 'את החוד האחורי שנשאר מקפלים פנימה, אל תוך הכובע (קיפול הר).' },
    { op: 'done', text: 'פותחים את הכובע מלמטה — וכובע הסמוראי מוכן. מנייר עיתון גדול יוצא כובע שאפשר לחבוש!' },
  ],
}

// ── Fan ──────────────────────────────
const pleats = 10, pw = A4H / pleats
const fan = {
  slug: 'fan', title: 'מניפה מנייר', emoji: '🪭', level: 1, color: '#f472b6',
  paper: rectPaper(A4H, 100, true),
  steps: [
    { op: 'set', faces: [{ pts: [[0, 0], [A4H, 0], [A4H, 100], [0, 100]], c: true }],
      marks: Array.from({ length: pleats - 1 }, (_, i) => ({ t: 'fold', kind: i % 2 ? 'mountain' : 'valley', p: [pw * (i + 1), -4], q: [pw * (i + 1), 104] })),
      text: 'דף A4 לרוחב. מקפלים אותו כמו אקורדיון: פס ברוחב 2–3 ס״מ, הופכים, עוד פס באותו רוחב, וחוזר חלילה — לסירוגין קיפול עמק וקיפול הר.' },
    { op: 'set', faces: [{ pts: [[0, 0], [pw, 0], [pw, 100], [0, 100]], c: true }],
      deco: [{ t: 'path', d: `M${pw * 0.33} 0 L${pw * 0.33} 100 M${pw * 0.66} 0 L${pw * 0.66} 100`, w: 0.8, stroke: '#9d174d' }],
      marks: [{ t: 'fold', kind: 'valley', p: [-4, 50], q: [pw + 4, 50] }, { t: 'arrow', kind: 'valley', p: [pw, 12], q: [pw, 88], bend: -1 }],
      text: 'מתקבל פס צר ועבה. מקפלים אותו לחצי, בדיוק באמצע.' },
    { op: 'set', faces: [{ pts: [[0, 50], [pw, 50], [pw, 100], [0, 100]], c: true }],
      deco: [{ t: 'poly', pts: [[-3, 88], [pw + 3, 88], [pw + 3, 95], [-3, 95]], fill: '#fde68a' }],
      text: 'מלפפים סלוטייפ סביב התחתית, ומדביקים זה לזה את שני הקפלים הפנימיים שנפגשים באמצע.' },
    { op: 'set', faces: Array.from({ length: 9 }, (_, i) => {
      const a0 = Math.PI * (1 + i / 9), a1 = Math.PI * (1 + (i + 1) / 9), R = 60, cx = 70, cy = 80
      return { pts: [[cx, cy], [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], [cx + R * Math.cos(a1), cy + R * Math.sin(a1)]], c: i % 2 === 0 }
    }), deco: [{ t: 'poly', pts: [[66, 74], [74, 74], [74, 92], [66, 92]], fill: '#fde68a' }], text: 'פותחים את החלק העליון לחצי עיגול — והמניפה מוכנה. אפשר לקשט את הדף בטושים לפני הקיפול.' },
  ],
}

export const MODELS = [cup, hat, dart, glider, heart, dog, cat, fox, tulip, fortuneTeller, masu, envelope, bookmark, helmet, fan]
export const modelBySlug = slug => MODELS.find(m => m.slug === slug)

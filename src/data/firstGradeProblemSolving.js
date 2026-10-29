// מוכנות לכיתה א׳ — פתרון בעיות: social problem cards, picture word-problems up to 10,
// sorting activities (colour / shape / use) and parents' vocabulary tips. Pure data, used by
// src/pages/classroom/FirstGradeProblemSolving.jsx and checked in tests/first-grade-problem-solving.test.mjs.

// Social problem cards: a situation, 3 good ideas to talk about, and one question for the child.
export const SOCIAL_CARDS = [
  { id: 'toy', emoji: '🧸', title: 'שני ילדים רוצים את אותו צעצוע', ideas: ['משחקים בתורות — כל אחד כמה דקות', 'ממציאים משחק שבו משחקים בו יחד', 'בוחרים צעצוע אחר עכשיו, ומבקשים אחר כך'], ask: 'איזה רעיון הכי הוגן לשניכם?' },
  { id: 'join', emoji: '⚽', title: 'אני רוצה להצטרף למשחק של ילדים אחרים', ideas: ['שואלים בנימוס: "אפשר לשחק איתכם?"', 'מציעים תפקיד: "אני יכול להיות השוער"', 'אם לא מסתדר — מזמינים ילד אחר לשחק'], ask: 'מה אפשר להגיד כדי להצטרף?' },
  { id: 'spill', emoji: '🥤', title: 'נשפכה לי שתייה על השולחן', ideas: ['נושמים — זה קורה לכולם', 'לוקחים מגבת או נייר ומנגבים', 'מבקשים עזרה ממבוגר אם נשפך הרבה'], ask: 'מה עושים קודם?' },
  { id: 'first', emoji: '🥇', title: 'שנינו רוצים להתחיל ראשונים', ideas: ['משחקים אבן, נייר ומספריים', 'מי שהתחיל בפעם הקודמת — מחכה הפעם', 'מגרילים: מטבע או פתק בכובע'], ask: 'איך מחליטים בלי לריב?' },
  { id: 'crying', emoji: '😢', title: 'חבר בוכה בהפסקה', ideas: ['ניגשים ושואלים: "מה קרה?"', 'מציעים לשבת יחד או לשחק', 'קוראים למורה או למבוגר אחר'], ask: 'מה היה עוזר לך אם היית עצוב?' },
  { id: 'question', emoji: '🙋', title: 'לא הבנתי מה המורה ביקשה', ideas: ['מרימים יד ושואלים', 'מקשיבים שוב כשהמורה מסבירה', 'שואלים בשקט את הילד שיושב לידי'], ask: 'למה זה בסדר לשאול?' },
  { id: 'broke', emoji: '🧩', title: 'שברתי בטעות משהו של חבר', ideas: ['אומרים "סליחה, זה היה בטעות"', 'מנסים לתקן יחד', 'מספרים למבוגר ומחפשים פתרון'], ask: 'איך החבר מרגיש עכשיו?' },
  { id: 'line', emoji: '🚶', title: 'מישהו נדחף לפניי בתור', ideas: ['אומרים בקול רגוע: "אני עמדתי כאן"', 'מזכירים שיש תור לכולם', 'אם זה חוזר — מספרים למבוגר'], ask: 'איך אומרים את זה בלי לצעוק?' },
  { id: 'hard', emoji: '🥫', title: 'לא מצליח לפתוח את הקופסה', ideas: ['מנסים שוב, לאט ובסבלנות', 'שואלים: "תוכל לעזור לי, בבקשה?"', 'מחפשים דרך אחרת — אולי ללחוץ במקום אחר'], ask: 'מה עוד אפשר לנסות?' },
  { id: 'words', emoji: '💬', title: 'חבר אמר לי מילה שפגעה בי', ideas: ['אומרים: "זה לא נעים לי, תפסיק בבקשה"', 'מתרחקים והולכים לשחק במקום אחר', 'מספרים למבוגר שסומכים עליו'], ask: 'מה אפשר להגיד במילים שלך?' },
]

// Picture word-problems: count (b = 0) or add, always up to 10. `shape` is drawn by ProblemSolvingArt.
export const WORD_PROBLEMS = [
  { id: 'p1', shape: 'star', a: 6, b: 0, text: 'כמה כוכבים יש בשמיים?' },
  { id: 'p2', shape: 'fish', a: 8, b: 0, text: 'כמה דגים שוחים באקווריום?' },
  { id: 'p3', shape: 'apple', a: 3, b: 2, text: 'לנועה יש 3 תפוחים. סבתא נתנה לה עוד 2. כמה תפוחים יש לנועה עכשיו?' },
  { id: 'p4', shape: 'balloon', a: 4, b: 1, text: 'ביום ההולדת של איתי היו 4 בלונים. אמא ניפחה עוד בלון אחד. כמה בלונים יש עכשיו?' },
  { id: 'p5', shape: 'ball', a: 2, b: 3, text: 'בארגז יש 2 כדורים. יואב הביא עוד 3. כמה כדורים יש בארגז?' },
  { id: 'p6', shape: 'flower', a: 5, b: 2, text: 'בגינה פרחו 5 פרחים. למחרת פרחו עוד 2. כמה פרחים יש בגינה?' },
  { id: 'p7', shape: 'fish', a: 3, b: 3, text: 'בבריכה שחו 3 דגים. הגיעו עוד 3 דגים. כמה דגים יש בבריכה?' },
  { id: 'p8', shape: 'apple', a: 4, b: 4, text: 'על העץ 4 תפוחים אדומים ו-4 תפוחים ירוקים. כמה תפוחים יש על העץ?', fillB: '#84cc16' },
  { id: 'p9', shape: 'star', a: 6, b: 4, text: 'מאיה הדביקה 6 מדבקות של כוכב, ואחר כך עוד 4. כמה מדבקות הדביקה?' },
  { id: 'p10', shape: 'flower', a: 1, b: 6, text: 'לדניאל יש פרח אחד בעציץ. הוא שתל עוד 6. כמה פרחים יש לו עכשיו?' },
]
export const answerOf = p => p.a + p.b
// Three choices around the answer, in an order that changes from problem to problem (stable across renders).
export function choicesOf(p, i) {
  const n = answerOf(p)
  const near = n >= 10 ? [n, n - 1, n - 2] : n <= 1 ? [n, n + 1, n + 2] : [n, n - 1, n + 1]
  const k = i % 3
  return [...near.slice(k), ...near.slice(0, k)]
}

const COLORS = { red: '#ef4444', blue: '#3b82f6', yellow: '#facc15' }
// Sorting activities. Every item names the bin it belongs to; `shape` items are drawn, `emoji` items are emoji.
export const SORTS = [
  {
    id: 'color', emoji: '🎨', title: 'מיון לפי צבע', ask: 'לאיזה צבע זה שייך?', note: 'כדאי להדפיס את הדף הזה בצבע.',
    bins: [{ id: 'red', label: 'אדום', fill: COLORS.red }, { id: 'blue', label: 'כחול', fill: COLORS.blue }, { id: 'yellow', label: 'צהוב', fill: COLORS.yellow }],
    items: [['apple', 'red', 'תפוח'], ['fish', 'blue', 'דג'], ['star', 'yellow', 'כוכב'], ['balloon', 'blue', 'בלון'], ['flower', 'red', 'פרח'], ['ball', 'yellow', 'כדור'], ['ball', 'red', 'כדור'], ['star', 'blue', 'כוכב'], ['balloon', 'yellow', 'בלון']]
      .map(([shape, bin, name], i) => ({ id: `c${i}`, shape, bin, name, fill: COLORS[bin] })),
  },
  {
    id: 'shape', emoji: '🔺', title: 'מיון לפי צורה', ask: 'איזו צורה זו?',
    bins: [{ id: 'circle', label: 'עיגול', shape: 'circle' }, { id: 'triangle', label: 'משולש', shape: 'triangle' }, { id: 'square', label: 'ריבוע', shape: 'square' }],
    items: [['circle', 1, 0], ['triangle', 1, 0], ['square', 0.7, 0], ['circle', 0.6, 0], ['square', 1, 20], ['triangle', 0.7, 180], ['triangle', 0.9, 90], ['circle', 0.85, 0], ['square', 0.8, 45]]
      .map(([shape, scale, rot], i) => ({ id: `s${i}`, shape, bin: shape, scale, rot, name: { circle: 'עיגול', triangle: 'משולש', square: 'ריבוע' }[shape] })),
  },
  {
    id: 'use', emoji: '🎒', title: 'מיון לפי שימוש', ask: 'מה עושים עם זה?',
    bins: [{ id: 'eat', label: 'אוכלים', emoji: '🍽️' }, { id: 'wear', label: 'לובשים', emoji: '👕' }, { id: 'school', label: 'לומדים בכיתה', emoji: '🏫' }],
    items: [['🍌', 'eat', 'בננה'], ['🧦', 'wear', 'גרביים'], ['✏️', 'school', 'עיפרון'], ['🥒', 'eat', 'מלפפון'], ['🧢', 'wear', 'כובע'], ['📚', 'school', 'ספרים'], ['🧀', 'eat', 'גבינה'], ['👟', 'wear', 'נעליים'], ['✂️', 'school', 'מספריים']]
      .map(([emoji, bin, name], i) => ({ id: `u${i}`, emoji, bin, name })),
  },
]

// Everyday vocabulary tips for parents — general, playful, no clinical claims.
export const VOCAB_TIPS = [
  { emoji: '🔁', title: 'חוזרים על המשפט ומוסיפים לו', text: 'הילד אומר "כלב גדול!" — עונים "כן, כלב גדול ושעיר, והוא מכשכש בזנב". לא מתקנים ולא מבקשים לחזור; פשוט נותנים לו לשמוע משפט עשיר יותר.' },
  { emoji: '🎯', title: 'מילה מדויקת במקום "הדבר הזה"', text: 'במקום "תביא את הדבר הזה" אומרים "תביא את המסננת". מילים כמו "מסננת", "מגהץ" או "שקית ניילון" נלמדות בדיוק כך — כשהן חלק מהשיחה.' },
  { emoji: '🗣️', title: 'מספרים בקול מה עושים', text: 'בזמן בישול, קניות או סידור הבית מתארים: "אני חותך את העגבנייה לקוביות קטנות, ועכשיו מערבב". הילד שומע פעלים ותיאורים בהקשר מוחשי.' },
  { emoji: '❓', title: 'שאלות פתוחות — ומחכים לתשובה', text: '"מה היה קורה אם...?", "איך ידעת?", "מה הכי הצחיק אותך היום?". נותנים כמה שניות לחשוב לפני שעוזרים.' },
  { emoji: '💛', title: 'מילים לרגשות', text: 'נותנים שם למה שהילד מרגיש: "נראה לי שאתה מאוכזב שהמשחק נגמר". מילים לרגשות עוזרות גם בפתרון בעיות עם חברים.' },
  { emoji: '📚', title: 'קוראים יחד ועוצרים על מילה', text: 'כשמופיעה בספר מילה חדשה — עוצרים רגע, מסבירים במילים פשוטות ומחפשים אותה בציור. אחר כך מנסים להשתמש בה במהלך היום.' },
  { emoji: '🚗', title: 'משחקי מילים בדרך', text: '"אני רואה משהו ש...", הפכים (גבוה–נמוך), מילים שמתחילות באותו צליל, או "תגיד לי שלוש מילים על השמיים". משחק קצר בנסיעה מספיק.' },
]

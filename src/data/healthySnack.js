// Data for /printables/healthy-snack-planner: balanced school-snack ideas, a "build a box" game and a weekly
// generator with printable sheets. General nutrition tips only, no medical claims. Nothing is saved or sent.
export const PATH = '/printables/healthy-snack-planner'

export const GROUPS = [
  { id: 'veg', label: 'ירקות', emoji: '🥕', color: '#bbf7d0' },
  { id: 'fruit', label: 'פירות', emoji: '🍎', color: '#fecaca' },
  { id: 'grain', label: 'דגנים', emoji: '🍞', color: '#fde68a' },
  { id: 'protein', label: 'חלבון', emoji: '🥚', color: '#bfdbfe' },
]

export const EFFORT = { 1: 'מהיר', 2: 'קצת הכנה', 3: 'הכנה מראש' }

// nutFree: true = no nuts or peanuts as an ingredient (still check labels: "may contain traces")
export const SNACKS = [
  // vegetables
  { id: 'v1', emoji: '🥕', name: 'מקלות גזר', group: 'veg', nutFree: true, effort: 1 },
  { id: 'v2', emoji: '🥒', name: 'פרוסות מלפפון', group: 'veg', nutFree: true, effort: 1 },
  { id: 'v3', emoji: '🍅', name: 'עגבניות שרי', group: 'veg', nutFree: true, effort: 1 },
  { id: 'v4', emoji: '🫑', name: 'רצועות פלפל צבעוני', group: 'veg', nutFree: true, effort: 1 },
  { id: 'v5', emoji: '🥬', name: 'עלי חסה לגלגול', group: 'veg', nutFree: true, effort: 2 },
  { id: 'v6', emoji: '🥦', name: 'ברוקולי מאודה קר', group: 'veg', nutFree: true, effort: 3 },
  { id: 'v7', emoji: '🌽', name: 'גרעיני תירס מבושלים', group: 'veg', nutFree: true, effort: 2 },
  { id: 'v8', emoji: '🥗', name: 'סלט קטן של ירקות חתוכים', group: 'veg', nutFree: true, effort: 2 },
  { id: 'v9', emoji: '🥕', name: 'פרוסות קולרבי', group: 'veg', nutFree: true, effort: 2 },
  { id: 'v10', emoji: '🍠', name: 'צ׳יפס בטטה אפוי', group: 'veg', nutFree: true, effort: 3 },
  // fruit
  { id: 'f1', emoji: '🍎', name: 'תפוח פרוס', group: 'fruit', nutFree: true, effort: 1 },
  { id: 'f2', emoji: '🍌', name: 'בננה', group: 'fruit', nutFree: true, effort: 1 },
  { id: 'f3', emoji: '🍇', name: 'ענבים', group: 'fruit', nutFree: true, effort: 1 },
  { id: 'f4', emoji: '🍊', name: 'מנדרינה', group: 'fruit', nutFree: true, effort: 1 },
  { id: 'f5', emoji: '🍓', name: 'תותים', group: 'fruit', nutFree: true, effort: 1 },
  { id: 'f6', emoji: '🍐', name: 'אגס', group: 'fruit', nutFree: true, effort: 1 },
  { id: 'f7', emoji: '🍉', name: 'קוביות אבטיח', group: 'fruit', nutFree: true, effort: 2 },
  { id: 'f8', emoji: '🥭', name: 'מנגו חתוך', group: 'fruit', nutFree: true, effort: 2 },
  { id: 'f9', emoji: '🍑', name: 'אפרסק או נקטרינה', group: 'fruit', nutFree: true, effort: 1 },
  { id: 'f10', emoji: '🍇', name: 'שיפוד פירות', group: 'fruit', nutFree: true, effort: 3 },
  // grains
  { id: 'g1', emoji: '🥪', name: 'כריך מלחם מלא', group: 'grain', nutFree: true, effort: 2 },
  { id: 'g2', emoji: '🥯', name: 'בייגל קטן', group: 'grain', nutFree: true, effort: 1 },
  { id: 'g3', emoji: '🫓', name: 'פיתה קטנה או טורטייה מגולגלת', group: 'grain', nutFree: true, effort: 2 },
  { id: 'g4', emoji: '🍪', name: 'קרקרים מקמח מלא', group: 'grain', nutFree: true, effort: 1 },
  { id: 'g5', emoji: '🍿', name: 'פופקורן ביתי (לגדולים)', group: 'grain', nutFree: true, effort: 2 },
  { id: 'g6', emoji: '🥣', name: 'דגני בוקר ללא סוכר מוסף', group: 'grain', nutFree: true, effort: 1 },
  { id: 'g7', emoji: '🧇', name: 'מאפינס שיבולת שועל ופירות', group: 'grain', nutFree: true, effort: 3 },
  { id: 'g8', emoji: '🍝', name: 'פסטה קרה עם ירקות', group: 'grain', nutFree: true, effort: 3 },
  { id: 'g9', emoji: '🌾', name: 'עוגיות שיבולת שועל עם אגוזים', group: 'grain', nutFree: false, effort: 3 },
  { id: 'g10', emoji: '🍞', name: 'טוסט עם ממרח בוטנים', group: 'grain', nutFree: false, effort: 2 },
  // protein
  { id: 'p1', emoji: '🥚', name: 'ביצה קשה', group: 'protein', nutFree: true, effort: 2 },
  { id: 'p2', emoji: '🧀', name: 'גבינה צהובה בקוביות', group: 'protein', nutFree: true, effort: 1 },
  { id: 'p3', emoji: '🥛', name: 'יוגורט טבעי', group: 'protein', nutFree: true, effort: 1 },
  { id: 'p4', emoji: '🧈', name: 'גבינת שמנת או קוטג׳ עם ירק', group: 'protein', nutFree: true, effort: 1 },
  { id: 'p5', emoji: '🫘', name: 'חומוס עם מקלות ירק', group: 'protein', nutFree: true, effort: 2 },
  { id: 'p6', emoji: '🍗', name: 'פרוסות חזה עוף בגלגול', group: 'protein', nutFree: true, effort: 2 },
  { id: 'p7', emoji: '🥜', name: 'חופן שקדים (רק בכיתה ללא אגוזים)', group: 'protein', nutFree: false, effort: 1 },
  { id: 'p8', emoji: '🧆', name: 'קציצות קטנות של קטניות', group: 'protein', nutFree: true, effort: 3 },
  { id: 'p9', emoji: '🥜', name: 'ממרח אגוזים בפרוסת לחם', group: 'protein', nutFree: false, effort: 1 },
  { id: 'p10', emoji: '🐟', name: 'טונה בגלגול', group: 'protein', nutFree: true, effort: 2 },
]

export const BOX_PRAISE = [
  'קופסה מאוזנת! 🎉 יש בה צבעים, כוח ושמחה.',
  'וואו, איזו קופסה! 🌈 כל הקבוצות כאן.',
  'מושלם! 🌟 הקופסה הזאת תהיה נהדרת לבית הספר.',
]

export const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']

export const BALANCE = [
  ['🥕', 'ירק או פרי', 'צבע, מים ומרקם פריך. אפשר גם שניהם. פירות וירקות חתוכים נאכלים יותר.'],
  ['🍞', 'דגנים', 'לחם, קרקר, בייגל או פסטה. עדיף מקמח מלא כשאפשר, כי הם משביעים לאורך זמן.'],
  ['🥚', 'חלבון', 'ביצה, גבינה, יוגורט, חומוס או עוף. הוא עוזר להרגיש שבעים עד הארוחה הבאה.'],
  ['💧', 'מים', 'בקבוק מים לכל ילד. מים הם המשקה הראשי לבית הספר, ואפשר להוסיף פרוסת לימון או עלי נענע.'],
]

export const PICKY = [
  'מציעים בלי ללחוץ: מניחים בקופסה קטנה כמות של דבר חדש לצד דברים מוכרים. ילדים צריכים לפעמים לראות מאכל כמה פעמים לפני שמנסים אותו.',
  'נותנים בחירה מוגבלת: ״גזר או מלפפון?״. כשהילד בוחר, הוא שותף.',
  'משתפים בהכנה: ילדים אוכלים בשמחה את מה שהכינו בעצמם, גם אם רק חתכו בסכין בטוחה או סידרו בקופסה.',
  'חותכים בצורות, מסדרים בצבעים או מכינים שיפוד. נראות משפיעה מאוד.',
  'שומרים על שגרה רגועה ולא מתווכחים. שום פרס או עונש על אוכל. ההורה מחליט מה מציעים, והילד מחליט כמה אוכל.',
  'אם הבררנות קיצונית, הילד אוכל מעט מאוד סוגי מזון, או יש חשש לירידה במשקל, כדאי להתייעץ עם רופא/ת הילדים או עם דיאטנית/ית ילדים.',
]

export const NUT_FREE = [
  'הרבה גנים ובתי ספר מבקשים ״ללא בוטנים ואגוזים״ כי יש ילדים עם אלרגיה חמורה. קראו את הנוהל המקומי ושאלו את הגננת או המורה.',
  'קראו תוויות: ״עלול להכיל עקבות של בוטנים או אגוזים״ חשוב לאלרגיות חמורות, ולכן בגן עם ילד אלרגי מעדיפים מוצרים שאינם נושאים אזהרה כזו.',
  'ממרחים כמו שוקולד או חמאת בוטנים הם הנפוצים ביותר לבעיה. חומוס, גבינה, ביצה וממרח אבוקדו הם חלופות שכיחות.',
  'שוטפים ידיים אחרי האוכל. תזכרו שהוראות רופא של ילד אלרגי מחייבות יותר מכל רשימה כללית.',
  'כל ילד מביא ארוחה משלו ולא מחליפים אוכל עם חברים.',
]

export const TIPS = [
  'מכינים בערב: חותכים ירקות ושוטפים פירות כדי שהבוקר יהיה רגוע.',
  'קופסה עם תאים עוזרת: כל קבוצה במקום משלה, ונראה יותר מזמין.',
  'כמות קטנה מכל קבוצה עדיפה על הרבה מקבוצה אחת.',
  'אפשר להקפיא בקבוק מים קטן שישמור על האוכל קריר בקיץ.',
  'משאירים יום אחד בשבוע ״יום הפתעה״ שבו הילד בוחר.',
  'ביום חם, מוציאים מהקופסה מאכלי חלב אם אין קירור, ובוחרים פרי או ירק, ביצה קשה או לחם.',
]

export const FAQ = [
  { q: 'מה צריך להיות בארוחת עשר מאוזנת?', a: 'מומלץ שיהיה בה ירק או פרי, משהו מדגנים (למשל לחם מלא או קרקרים) וחלבון (ביצה, גבינה, יוגורט, חומוס). וגם בקבוק מים. זו הצעה כללית ולא ייעוץ תזונתי אישי.' },
  { q: 'מה מכינים לגן נקי מבוטנים?', a: 'בוחרים מאכלים ללא בוטנים ואגוזים וקוראים תוויות. בדף הזה אפשר לסמן ״ללא אגוזים בלבד״ ולקבל רק רעיונות מתאימים. אם יש בגן ילד אלרגי, עקבו אחרי הנחיות הצוות וההורים.' },
  { q: 'איך מעודדים ילד בררן לאכול?', a: 'בלי לחץ. מציעים מגוון קטן, נותנים בחירה, משתפים בהכנה ונותנים לילד זמן. אם יש דאגה מהמשקל או מעט מאוד מאכלים, מתייעצים עם רופא/ת הילדים.' },
  { q: 'כמה אוכל לשים בקופסה?', a: 'כמות קטנה מכל קבוצה, כזו שהילד באמת יכול לאכול בהפסקה. הכמות המתאימה משתנה בין ילדים לפי גיל ותיאבון, ואפשר לשאול את רופא/ת הילדים.' },
  { q: 'מה עם משקאות מתוקים?', a: 'מים הם הבחירה הטובה ביותר בבית הספר. אם הילד אוהב טעם, אפשר להוסיף פרוסות פרי או עלי נענע למים.' },
  { q: 'האם האתר מחליף ייעוץ של תזונאית?', a: 'לא. זה מדריך כללי ופרקטי להורים ולמורים ולא ייעוץ רפואי או תזונתי. לילדים עם מחלות, אלרגיות או צרכים מיוחדים יש להתייעץ עם איש מקצוע.' },
  { q: 'האם הבחירות שלי נשמרות?', a: 'לא. הקופסה והתפריט השבועי נוצרים רק במכשיר שלכם. שום דבר לא נשמר ולא נשלח.' },
]

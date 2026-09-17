export const BUGA_TOWN_PROPERTIES = [
  { id: 'cake-street', name: 'שכונה העוגה', emoji: '🎂', price: 60, rent: 12, question: 'אם קונים נכס ב-60 מטבעות ונשארים עם 140, כמה היו לפני הקנייה?', answer: '200', options: ['200', '180', '120', '60'] },
  { id: 'balloon-park', name: 'פארק הבלונים', emoji: '🎈', price: 70, rent: 14, question: 'איזה דבר חשוב יותר לפני קנייה במשחק: לבדוק שיש מספיק מטבעות או לקנות מיד?', answer: 'לבדוק שיש מספיק מטבעות', options: ['לבדוק שיש מספיק מטבעות', 'לקנות מיד', 'לדלג על התור', 'לזרוק שוב'] },
  { id: 'riddle-library', name: 'ספריית החידות', emoji: '📚', price: 80, rent: 16, question: 'מה עוזר לפתור חידה: לקרוא את כל המשפט או לנחש אחרי המילה הראשונה?', answer: 'לקרוא את כל המשפט', options: ['לקרוא את כל המשפט', 'לנחש אחרי המילה הראשונה', 'להתעלם מהרמז', 'לשאול את הקובייה'] },
  { id: 'dice-square', name: 'כיכר הקוביות', emoji: '🎲', price: 90, rent: 18, question: 'בקובייה רגילה, מה המספר הכי גבוה שאפשר לקבל?', answer: '6', options: ['6', '5', '8', '10'] },
  { id: 'trivia-tower', name: 'מגדל הטריוויה', emoji: '🧠', price: 100, rent: 20, question: 'מה עדיף בטריוויה: תשובה מדויקת או תשובה מצחיקה אבל שגויה?', answer: 'תשובה מדויקת', options: ['תשובה מדויקת', 'תשובה מצחיקה אבל שגויה', 'לא לענות', 'להחליף שאלה בלי לקרוא'] },
  { id: 'music-studio', name: 'אולפן המוזיקה', emoji: '🎵', price: 110, rent: 22, question: 'מה מודד קצב במוזיקה?', answer: 'מהירות הפעימות', options: ['מהירות הפעימות', 'צבע הצליל', 'שם הזמר', 'אורך הכבל'] },
  { id: 'space-gate', name: 'שער החלל', emoji: '🚀', price: 120, rent: 24, question: 'איזה כוכב לכת קרוב יותר לשמש: כדור הארץ או מאדים?', answer: 'כדור הארץ', options: ['כדור הארץ', 'מאדים', 'שניהם באותו מרחק', 'הירח'] },
  { id: 'team-hall', name: 'אולם הקבוצות', emoji: '🤝', price: 130, rent: 26, question: 'מה עוזר לקבוצה לנצח: שיתוף פעולה או שכל אחד מסתיר מידע?', answer: 'שיתוף פעולה', options: ['שיתוף פעולה', 'להסתיר מידע', 'לא להקשיב', 'לשחק לבד'] },
]

export const BUGA_TOWN_BOARD = [
  { type: 'start', label: 'התחלה', emoji: '🏁', text: 'עברתם התחלה? קבלו 30 מטבעות.' },
  { type: 'property', propertyId: 'cake-street' },
  { type: 'chance', label: 'קלף מזל', emoji: '🎴' },
  { type: 'property', propertyId: 'balloon-park' },
  { type: 'bonus', label: 'בונוס', emoji: '⭐', amount: 20 },
  { type: 'property', propertyId: 'riddle-library' },
  { type: 'question', label: 'שאלת דרך', emoji: '❓' },
  { type: 'property', propertyId: 'dice-square' },
  { type: 'freeRoll', label: 'זריקה חופשית', emoji: '🎲' },
  { type: 'property', propertyId: 'trivia-tower' },
  { type: 'pay', label: 'תיקון גשר', emoji: '🛠️', amount: 15 },
  { type: 'property', propertyId: 'music-studio' },
  { type: 'center', label: 'מרכז בוגהטאון', emoji: '🏙️' },
  { type: 'property', propertyId: 'space-gate' },
  { type: 'chance', label: 'קלף אסטרטגיה', emoji: '🃏' },
  { type: 'property', propertyId: 'team-hall' },
  { type: 'bonus', label: 'מצאתם קופה', emoji: '💰', amount: 25 },
  { type: 'question', label: 'שאלת חכמה', emoji: '💡' },
  { type: 'pay', label: 'מס עירוני', emoji: '🏦', amount: 20 },
  { type: 'chance', label: 'הפתעה', emoji: '🎁' },
  { type: 'bonus', label: 'מחיאות כפיים', emoji: '👏', amount: 15 },
  { type: 'question', label: 'אתגר קבוצתי', emoji: '🤔' },
  { type: 'pay', label: 'תחזוקה', emoji: '🧹', amount: 10 },
  { type: 'center', label: 'שער למרכז', emoji: '🔑' },
]

export const BUGA_TOWN_CHANCE_CARDS = [
  { title: 'יום מכירות מוצלח', text: 'קיבלתם 25 מטבעות מהעירייה.', coins: 25 },
  { title: 'שיפוץ קטן', text: 'שלמו 15 מטבעות על תיקון נכס.', coins: -15 },
  { title: 'קיצור דרך', text: 'התקדמו 2 משבצות.', move: 2 },
  { title: 'פקק בעיר', text: 'חזרו משבצת אחת אחורה.', move: -1 },
  { title: 'מחיאות כפיים', text: 'קבלו בונוס אחד.', bonus: 1 },
  { title: 'עזרה מחבר', text: 'קבלו 10 מטבעות ועוד תור רגיל ממשיך.', coins: 10 },
]

export const BUGA_TOWN_QUESTIONS = [
  { question: 'כמה משבצות יש בלוח בוגהטאון?', answer: '24', options: ['24', '40', '12', '8'] },
  { question: 'מה צריך כדי לקנות נכס?', answer: 'מספיק מטבעות ותשובה נכונה', options: ['מספיק מטבעות ותשובה נכונה', 'רק מזל', 'רק שם יפה', 'להיות ראשון בתור'] },
  { question: 'מה קורה כשנוחתים על נכס של שחקן אחר?', answer: 'משלמים שכירות', options: ['משלמים שכירות', 'מקבלים אותו בחינם', 'המשחק נגמר', 'מחליפים שם'] },
  { question: 'איזו פעולה טובה לפני תור חשוב?', answer: 'לבדוק כסף ונכסים', options: ['לבדוק כסף ונכסים', 'ללחוץ מהר בלי לחשוב', 'למחוק שחקן', 'להסתיר את הלוח'] },
]

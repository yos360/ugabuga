export const CLASSROOM_SUBJECTS = [
  { id: 'math', icon: '➗', name: 'מתמטיקה', color: '#6d48e5', examples: ['איך מחשבים אחוזים?', 'מהו משפט פיתגורס?', 'איך מחברים שברים?'], href: '/math' },
  { id: 'hebrew', icon: 'א', name: 'עברית ולשון', color: '#d84d73', examples: ['מהו שם תואר?', 'מה ההבדל בין שורש למשקל?', 'מהי מילה נרדפת?'], href: '/learn' },
  { id: 'english', icon: 'A', name: 'אנגלית', color: '#2466cb', examples: ['מה ההבדל בין is ל־are?', 'איך משתמשים ב־Past Simple?', 'מה פירוש because?'], href: '/english' },
  { id: 'bible', icon: '📜', name: 'תנ״ך', color: '#9a6b18', examples: ['מי היה אברהם?', 'מהם עשרת הדיברות?', 'מה קרה ביציאת מצרים?'] },
  { id: 'geography', icon: '🌍', name: 'גאוגרפיה', color: '#0f8c91', examples: ['מהי היבשת הגדולה בעולם?', 'איך נוצרים הרים?', 'איפה עובר קו המשווה?'], href: '/discover' },
  { id: 'history', icon: '🏺', name: 'היסטוריה', color: '#a05b39', examples: ['מהי תקופת הרנסנס?', 'מתי הוקמה מדינת ישראל?', 'מי היו הרומאים?'] },
  { id: 'science', icon: '🔬', name: 'מדעים', color: '#176fbd', examples: ['מהי פוטוסינתזה?', 'למה יש עונות שנה?', 'מהם מצבי הצבירה?'], href: '/discover/solar-system' },
  { id: 'biology', icon: '🧬', name: 'ביולוגיה', color: '#23875a', examples: ['מהו תא?', 'איך פועלת מערכת הנשימה?', 'מהי שרשרת מזון?'], href: '/discover/human-body' },
  { id: 'chemistry', icon: '⚗️', name: 'כימיה', color: '#7f55ba', examples: ['מהו אטום?', 'מהו ה־pH?', 'מה ההבדל בין יסוד לתרכובת?'] },
  { id: 'physics', icon: '⚛️', name: 'פיזיקה', color: '#4059ad', examples: ['מהי כבידה?', 'איך נוצר חשמל?', 'מהי מהירות האור?'] },
  { id: 'civics', icon: '🏛️', name: 'אזרחות', color: '#355070', examples: ['מהי דמוקרטיה?', 'מה תפקיד הכנסת?', 'מהן זכויות אדם?'] },
  { id: 'literature', icon: '📚', name: 'ספרות', color: '#b44c7d', examples: ['מהו משל?', 'מהי מטאפורה?', 'מה ההבדל בין סיפור לשיר?'] },
  { id: 'computers', icon: '💻', name: 'מחשבים וטכנולוגיה', color: '#117864', examples: ['מהו אלגוריתם?', 'איך האינטרנט עובד?', 'מהו קוד בינארי?'], href: '/typing' },
  { id: 'music', icon: '🎵', name: 'מוזיקה', color: '#9b4dca', examples: ['מהם תווים?', 'מהו קצב?', 'איך פועל פסנתר?'], href: '/music' },
  { id: 'art', icon: '🎨', name: 'אמנות', color: '#e06046', examples: ['מהם צבעי יסוד?', 'מהו ציור מופשט?', 'מי היה ואן גוך?'], href: '/printables/coloring' },
  { id: 'environment', icon: '🌱', name: 'סביבה וקיימות', color: '#2c8b57', examples: ['מהו מיחזור?', 'מהו שינוי אקלים?', 'איך חוסכים במים?'] },
  { id: 'economics', icon: '💰', name: 'כלכלה', color: '#a67614', examples: ['מהו תקציב?', 'מהי אינפלציה?', 'מה ההבדל בין צורך לרצון?'] },
  { id: 'society', icon: '🤝', name: 'חברה וכישורי חיים', color: '#d05c78', examples: ['איך פותרים ריב?', 'מהי הקשבה פעילה?', 'איך עובדים בצוות?'] },
  { id: 'sports', icon: '🏃', name: 'חינוך גופני', color: '#d0671d', examples: ['למה חשוב להתחמם?', 'איך השרירים פועלים?', 'מהם כללי משחק הוגן?'] },
  { id: 'heritage', icon: '🕎', name: 'מורשת ותרבות ישראל', color: '#3567b7', examples: ['מהם סמלי המדינה?', 'מהו לוח השנה העברי?', 'מהי מגילת העצמאות?'] },
]

export const subjectById = id => CLASSROOM_SUBJECTS.find(subject => subject.id === id)

export const bugaPediaUrl = (question, subject) => {
  const params = new URLSearchParams()
  if (question) params.set('q', question)
  if (subject) params.set('subject', subject)
  return `/bugapedia${params.size ? `?${params}` : ''}`
}

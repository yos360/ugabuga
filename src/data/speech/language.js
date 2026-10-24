// The language section of /speech (/speech/language/*): one list used by the section hub and the
// main /speech hub. Paths are fixed in advance — some pages are built in parallel by other work.
export const LANGUAGE_HUB = '/speech/language'

export const LANGUAGE_PAGES = [
  {
    id: 'categories', path: '/speech/language/categories', emoji: '🧺',
    title: 'קטגוריות ושיום',
    desc: 'מה לא שייך, מיון לשתי קבוצות, תנו שם לקבוצה, „אמרו 3 דברים ש…” וניגודים — עם בינגו קטגוריות ודפי מיון להדפסה.',
  },
  {
    id: 'wh-questions', path: '/speech/language/wh-questions', emoji: '❓',
    title: 'שאלות מי, מה, איפה, מתי, למה',
    desc: 'תמונות מצב עם שאלות מדורגות, תשובות לבחירה עם שמע, כרטיסי שאלות וקוביית שאלות להדפסה.',
  },
  {
    id: 'directions', path: '/speech/language/directions', emoji: '👣',
    title: 'הבנת הוראות',
    desc: 'הוראות בשלב אחד, בשניים ובשלושה — משחקי הקשבה ודפים להדפסה.',
  },
  {
    id: 'sequencing', path: '/speech/language/sequencing', emoji: '🎞️',
    title: 'רצף וסיפור בתמונות',
    desc: 'סיפורים בתמונות לסידור לפי הסדר, „מה קרה קודם ומה אחר כך” וסיפור מחדש.',
  },
  {
    id: 'grammar', path: '/speech/language/grammar', emoji: '🧱',
    title: 'דקדוק לגן',
    desc: 'יחיד ורבים (גם עפרונות, ביצים ונשים), זכר ונקבה, עבר הווה ועתיד, שלי־שלך־שלו־שלה ומשפטים עם ו, כי, אבל — משחקים עם שמע ודפים להדפסה.',
  },
  {
    id: 'prepositions', path: '/speech/language/prepositions', emoji: '📦',
    title: 'מילות יחס ומושגים מרחביים',
    desc: 'על, מתחת, בתוך, ליד, לפני, מאחורי, בין — „איפה החתול?”, „שימו את…”, גזור והדבק ובינגו מילות יחס להדפסה.',
  },
  {
    id: 'describing', path: '/speech/language/describing', emoji: '⭐',
    title: 'תיאור חפצים ואוצר מילים',
    desc: 'כוכב התיאור, חידות „מי אני?”, בונים תיאור ו„מה דומה, מה שונה?” — עם לוח כוכב, כרטיסי חידות, מפת מילה ומשחק „נחשו מי אני” להדפסה.',
    id: 'social', path: '/speech/language/social', emoji: '🤝',
    title: 'שפה חברתית',
    desc: 'רגשות מפנים וממצבים, בקשות ומילות נימוס, פתיחת שיחה ותורות, „מה הוא חושב?” — עם בינגו רגשות, כרטיסי מצב ותבנית לסיפור חברתי.',
  },
]

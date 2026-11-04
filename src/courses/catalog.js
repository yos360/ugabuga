// /courses: every free course on the site. Courses built on the shared lesson player load their
// data lazily (one chunk per course); Excel and touch typing have their own interactive pages.
export const COURSES_BASE = '/courses'

export const COURSES = [
  { slug: 'word', emoji: '📝', title: 'קורס וורד למתחילים', short: 'מסמך מסודר, טבלה, תמונות ועבודה להגשה', who: 'לתלמידים מכיתה ד׳, להורים ולמחפשי עבודה' },
  { slug: 'slides', emoji: '📊', title: 'קורס מצגות', short: 'פאוורפוינט וגוגל מצגות: עיצוב, תמונות, גרפים והצגה בכיתה', who: 'לתלמידים מכיתה ד׳, למורים ולמתחילים' },
  { slug: 'google', emoji: '☁️', title: 'קורס גוגל לתלמידים', short: 'דרייב, Docs, Sheets, טפסים וקלאסרום', who: 'לתלמידים מכיתה ד׳ ולהורים' },
  { slug: 'excel', href: '/excel', emoji: '📗', title: 'קורס אקסל', short: '10 שיעורים עם גיליון חי שבודק כל משימה', who: 'למתחילים מאפס' },
  { slug: 'typing', href: '/typing', emoji: '⌨️', title: 'הקלדה עיוורת', short: '25 שיעורים, מקלדת צבעונית ומילים לדקה', who: 'לילדים ולמבוגרים' },
]

export const LOAD = {
  word: () => import('./data/word.js'),
  slides: () => import('./data/slides.js'),
  google: () => import('./data/google.js'),
}

export const courseMeta = slug => COURSES.find(c => c.slug === slug && !c.href)

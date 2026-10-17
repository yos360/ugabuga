const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('he-IL')
  .replace(/[?!.،,:;"'׳״()-]/g, ' ').replace(/(^|\s)(למה|מדוע|איך|כיצד|מה|מי|מתי|איפה|היכן|האם|זה|זאת|הם|הן)(?=\s|$)/g, '$1')
  .replace(/רטיה/g, 'רטייה').replace(/פיראטים/g, 'שודדי ים').replace(/פיראט/g, 'שודד ים').replace(/\s+/g, ' ').trim()
const KNOWLEDGE = [{
  matches: ['שודדי ים רטייה', 'שודד ים רטייה', 'שודדי ים שמים רטייה', 'שודד ים שם רטייה'],
  answer: { id: 'verified-pirate-eye-patch', title: 'למה מציירים שודדי ים עם רטייה?', extract: 'לא ידוע ששודדי ים נהגו באופן קבוע לשים רטייה כדי לשפר ראיית לילה. רטייה יכלה לכסות עין פצועה או חסרה, אבל הדמות המוכרת של שודד הים עם רטייה התחזקה בעיקר בספרים, באיורים ובסרטים. הרעיון שהרטייה שמרה עין אחת מותאמת לחושך הוא הסבר פופולרי ומעניין, אך אין לו הוכחה היסטורית טובה.', url: 'https://he.wikipedia.org/wiki/%D7%A9%D7%95%D7%93%D7%93_%D7%99%D7%9D', image: '', verified: true, sourceLabel: 'תשובה בדוקה + קריאה נוספת בוויקיפדיה' },
}, {
  matches: ['because'],
  answer: {
    id: 'verified-translation-because',
    title: 'because — כי, מפני ש־, משום ש־',
    extract: 'המילה because מחברת בין תוצאה לסיבה. לדוגמה: I stayed home because it rained — נשארתי בבית כי ירד גשם. כשאחריה בא שם עצם ולא משפט, משתמשים בדרך כלל בצירוף because of, שפירושו בגלל.',
    url: 'https://he.wiktionary.org/wiki/%D7%91%D7%92%D7%9C%D7%9C',
    image: '',
    verified: true,
    sourceLabel: 'תרגום בדוק · ויקימילון',
    linkLabel: 'לבדיקה בוויקימילון ↗',
  },
}]
// Whole-word match: every word of a pattern must be a word of the question (a leading ה/ו/ב/ל prefix is allowed).
const questionWords = value => new Set(value.split(' ').flatMap(word => /^[והבל][א-ת]{3,}$/u.test(word) ? [word, word.slice(1)] : [word]))
export function findBugaPediaKnowledge(question) { const words = questionWords(normalize(question)); const item = KNOWLEDGE.find(entry => entry.matches.some(match => normalize(match).split(' ').every(word => words.has(word)))); return item ? { ...item.answer } : null }
export function bugaPediaSearchTerms(question) { return normalize(question).split(' ').filter(word => word.length > 1).slice(0, 10) }

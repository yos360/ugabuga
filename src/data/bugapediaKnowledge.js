const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase('he-IL')
  .replace(/[?!.،,:;"'׳״()-]/g, ' ').replace(/(^|\s)(למה|מדוע|איך|כיצד|מה|מי|מתי|איפה|היכן|האם|זה|זאת|הם|הן)(?=\s|$)/g, '$1')
  .replace(/רטיה/g, 'רטייה').replace(/פיראטים/g, 'שודדי ים').replace(/פיראט/g, 'שודד ים').replace(/\s+/g, ' ').trim()
const KNOWLEDGE = [{
  matches: ['שודדי ים רטייה', 'שודד ים רטייה', 'שודדי ים שמים רטייה', 'שודד ים שם רטייה'],
  answer: { id: 'verified-pirate-eye-patch', title: 'למה מציירים שודדי ים עם רטייה?', extract: 'לא ידוע ששודדי ים נהגו באופן קבוע לשים רטייה כדי לשפר ראיית לילה. רטייה יכלה לכסות עין פצועה או חסרה, אבל הדמות המוכרת של שודד הים עם רטייה התחזקה בעיקר בספרים, באיורים ובסרטים. הרעיון שהרטייה שמרה עין אחת מותאמת לחושך הוא הסבר פופולרי ומעניין, אך אין לו הוכחה היסטורית טובה.', url: 'https://he.wikipedia.org/wiki/%D7%A9%D7%95%D7%93%D7%93_%D7%99%D7%9D', image: '', verified: true, sourceLabel: 'תשובה בדוקה + קריאה נוספת בוויקיפדיה' },
}]
export function findBugaPediaKnowledge(question) { const value = normalize(question); const item = KNOWLEDGE.find(entry => entry.matches.some(match => normalize(match).split(' ').every(word => value.includes(word)))); return item ? { ...item.answer } : null }
export function bugaPediaSearchTerms(question) { return normalize(question).split(' ').filter(word => word.length > 1).slice(0, 10) }

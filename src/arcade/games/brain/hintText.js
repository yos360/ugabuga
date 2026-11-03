import { PEOPLE_EN, FRIENDS_EN, NAMES_EN } from '../../logic/brain/en.js'
export const PEOPLE = ['אור', 'גל', 'טל', 'רון', 'שחר']
export const FRIENDS = ['🦊 שועל', '🐔 תרנגולת', '🌽 תירס', '🐐 עז', '🥬 כרוב']
export const NAMES = ['אדום ●', 'כחול ◆', 'ירוק ▲', 'כתום ■', 'סגול ★', 'תכלת ♥']
export const tables = lang => lang === 'en' ? { PEOPLE: PEOPLE_EN, FRIENDS: FRIENDS_EN, NAMES: NAMES_EN } : { PEOPLE, FRIENDS, NAMES }

function hintEn(p, action) {
  if (!action) return 'There is no solution from this position. Try undoing a move or starting over.'
  if ('answer' in action) {
    if (p.kind === 'wires') return `Going by all the clues: ${NAMES_EN[action.answer]}.`
    if (p.kind === 'liars') return `Check this possibility: ${PEOPLE_EN[action.answer]}.`
    return `The answer that fits every condition: ${p.kind === 'scales' ? action.answer + 1 : action.answer}.`
  }
  if (p.kind === 'matches') return `Match ${action.from + 1}${'to' in action ? ` to place ${action.to + 1}` : ' to remove'}. Match numbers: 1-7 in the first digit, 8-14 in the second, 15-21 in the third.`
  if (p.kind === 'water') return 'fill' in action ? `Fill jug ${action.fill + 1}.` : 'empty' in action ? `Empty jug ${action.empty + 1}.` : `Pour from jug ${action.from + 1} into jug ${action.to + 1}.`
  if (p.kind === 'river') return action.riders.length ? `Take across with the adult: ${action.riders.map(i => FRIENDS_EN[i]).join(', ')}.` : 'The adult crosses alone.'
  if (p.kind === 'frogs') return `Move the frog on square ${action.from + 1}.`
  return `Press cell ${action.cell + 1} (counting starts at the top left).`
}

export function hintText(p, action, lang = 'he') {
  if (lang === 'en') return hintEn(p, action)
  if (!action) return 'אין פתרון מהמצב הזה. נסו לבטל מהלך או להתחיל מחדש.'
  if ('answer' in action) {
    if (p.kind === 'wires') return `לפי כל הרמזים: ${NAMES[action.answer]}.`
    if (p.kind === 'liars') return `בדקו את האפשרות: ${PEOPLE[action.answer]}.`
    return `התשובה המתאימה לכל התנאים: ${p.kind === 'scales' ? action.answer + 1 : action.answer}.`
  }
  if (p.kind === 'matches') return `גפרור ${action.from + 1}${'to' in action ? ` אל מקום ${action.to + 1}` : ' להסרה'}. מספרי הגפרורים: 1–7 בספרה הראשונה, 8–14 בשנייה, 15–21 בשלישית.`
  if (p.kind === 'water') return 'fill' in action ? `מלאו כלי ${action.fill + 1}.` : 'empty' in action ? `רוקנו כלי ${action.empty + 1}.` : `מזגו מכלי ${action.from + 1} לכלי ${action.to + 1}.`
  if (p.kind === 'river') return action.riders.length ? `העבירו עם המבוגר: ${action.riders.map(i => FRIENDS[i]).join(', ')}.` : 'המבוגר חוצה לבדו.'
  if (p.kind === 'frogs') return `הזיזו את הצפרדע במשבצת ${action.from + 1}.`
  return `לחצו על תא ${action.cell + 1} (הספירה מתחילה משמאל למעלה).`
}

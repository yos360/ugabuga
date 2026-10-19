export const PEOPLE = ['אור', 'גל', 'טל', 'רון', 'שחר']
export const FRIENDS = ['🦊 שועל', '🐔 תרנגולת', '🌽 תירס', '🐐 עז', '🥬 כרוב']
export const NAMES = ['אדום ●', 'כחול ◆', 'ירוק ▲', 'כתום ■', 'סגול ★', 'תכלת ♥']

export function hintText(p, action) {
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

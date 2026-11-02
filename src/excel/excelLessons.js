// /excel: the course. Every lesson is practice only — a sheet, short steps, live checks.
// task.sheet missing → the task continues from the previous task's sheet.
// task.solution is what "show me" applies, and what the tests use to prove every task is solvable.

const grid = (rows) => {
  const cells = {}
  rows.forEach((row, r) => row.forEach((v, c) => { if (v !== '' && v != null) cells[String.fromCharCode(65 + c) + (r + 1)] = String(v) }))
  return cells
}

export const LESSONS = [
  {
    slug: 'basics', emoji: '✍️', title: 'מקלידים בתאים', short: 'תאים, הקלדה, תיקון ומחיקה',
    seo: 'שיעור ראשון באקסל: מה זה תא, איך מקלידים טקסט ומספרים, מתקנים ומוחקים',
    tasks: [
      {
        title: 'רשימת קניות',
        sheet: { cols: 3, rows: 7, widths: { A: 130 }, cells: grid([['מוצר', 'כמות'], [], [], ['ביצים', 30], ['גבינה', 2], ['למחוק אותי']]) },
        steps: ['לחצו על התא A2, הקלידו חלב ולחצו Enter', 'לחצו על B2 והקלידו 2', 'בשורה 3: לחם, כמות 1'],
        checks: [
          { t: 'val', ref: 'A2', v: 'חלב', label: 'A2 = חלב' },
          { t: 'val', ref: 'B2', v: 2, label: 'B2 = 2' },
          { t: 'val', ref: 'A3', v: 'לחם', label: 'A3 = לחם' },
          { t: 'val', ref: 'B3', v: 1, label: 'B3 = 1' },
        ],
        solution: { cells: { A2: 'חלב', B2: '2', A3: 'לחם', B3: '1' } },
        tip: 'Enter יורד תא אחד למטה, Tab עובר לעמודה הבאה.',
      },
      {
        title: 'מתקנים ומוחקים',
        steps: ['30 ביצים זו טעות: לחצו על B4 והקלידו 12 (ההקלדה מחליפה את מה שהיה)', 'לחצו על A6 ולחצו Delete'],
        checks: [
          { t: 'val', ref: 'B4', v: 12, label: 'B4 = 12' },
          { t: 'empty', ref: 'A6', label: 'A6 ריק' },
        ],
        solution: { cells: { B4: '12', A6: '' } },
        tip: 'F2 או לחיצה כפולה פותחים את התא לעריכה בלי למחוק את מה שבתוכו.',
      },
    ],
  },
  {
    slug: 'formatting', emoji: '🎨', title: 'מעצבים טבלה', short: 'סימון טווח, הדגשה ועיצוב ש״ח',
    seo: 'עיצוב טבלה באקסל: סימון טווח תאים, הדגשה (Bold) ועיצוב מספרים כש״ח',
    tasks: [
      {
        title: 'כותרת מודגשת',
        sheet: { cols: 3, rows: 6, widths: { A: 120 }, cells: grid([['מוצר', 'מחיר', 'כמות'], ['חולצה', 49.9, 2], ['מכנסיים', 89, 1], ['גרביים', 15, 4], ['כובע', 35, 1]]) },
        steps: ['גררו עם העכבר מ-A1 עד C1 (או לחצו על A1 ואז Shift+קליק על C1)', 'לחצו על B בסרגל הכלים, או Ctrl+B'],
        checks: [{ t: 'bold', range: 'A1:C1', label: 'A1:C1 מודגשים' }],
        solution: { ops: [['bold', 'A1:C1']] },
        tip: 'Shift+חיצים מרחיבים את הסימון בלי עכבר.',
      },
      {
        title: 'מחירים בש״ח',
        steps: ['סמנו את B2 עד B5', 'לחצו על ₪'],
        checks: [{ t: 'cur', range: 'B2:B5', label: 'B2:B5 בש״ח' }],
        solution: { ops: [['cur', 'B2:B5']] },
        tip: 'העיצוב משנה רק איך המספר נראה. הערך בתא נשאר 49.9.',
      },
    ],
  },
  {
    slug: 'formulas', emoji: '🧮', title: 'נוסחה ראשונה', short: 'כפל, חיבור וחיסור בין תאים',
    seo: 'איך כותבים נוסחה באקסל: סימן =, הפניה לתאים, כפל, חיבור וחיסור',
    tasks: [
      {
        title: 'כמה עולים הבלונים?',
        sheet: {
          cols: 4, rows: 9, widths: { A: 110 },
          cells: grid([['מה קונים', 'מחיר', 'כמות', 'סה״כ'], ['בלונים', 2, 30], ['צלחות', 0.5, 40], ['פיצה', 45, 4], ['מיץ', 8, 6], ['הכול ביחד'], [], ['תקציב', '', '', 400], ['נשאר']]),
          fmt: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } },
        },
        steps: ['לחצו על D2', 'הקלידו ‎=B2*C2 ולחצו Enter'],
        checks: [{ t: 'fx', ref: 'D2', v: 60, label: 'D2 = 60, עם נוסחה' }],
        solution: { cells: { D2: '=B2*C2' } },
        tip: 'אפשר להקליד = ואז ללחוץ על B2 עם העכבר במקום להקליד אותו.',
      },
      {
        title: 'כל השורות',
        steps: ['D3: ‎=B3*C3', 'D4: ‎=B4*C4', 'D5: ‎=B5*C5'],
        checks: [
          { t: 'fx', ref: 'D3', v: 20, label: 'D3 = 20' },
          { t: 'fx', ref: 'D4', v: 180, label: 'D4 = 180' },
          { t: 'fx', ref: 'D5', v: 48, label: 'D5 = 48' },
        ],
        solution: { cells: { D3: '=B3*C3', D4: '=B4*C4', D5: '=B5*C5' } },
        tip: 'בשיעור 5 נלמד למלא שורות כאלה בגרירה אחת.',
      },
      {
        title: 'הכול ביחד, וכמה נשאר',
        steps: ['D6: ‎=D2+D3+D4+D5', 'D9: ‎=D8-D6'],
        checks: [
          { t: 'fx', ref: 'D6', v: 308, label: 'D6 = 308' },
          { t: 'fx', ref: 'D9', v: 92, label: 'D9 = 92' },
        ],
        solution: { cells: { D6: '=D2+D3+D4+D5', D9: '=D8-D6' } },
        tip: 'שנו את הכמות של הפיצה ל-5: כל הסכומים יתעדכנו לבד.',
      },
    ],
  },
  {
    slug: 'sum-average', emoji: '➕', title: 'SUM ו-AVERAGE', short: 'סכום וממוצע של עמודה',
    seo: 'פונקציית SUM ופונקציית AVERAGE באקסל: סכום וממוצע של טווח תאים',
    tasks: [
      {
        title: 'סכום הציונים',
        sheet: {
          cols: 2, rows: 9, widths: { A: 110 },
          cells: grid([['תלמיד/ה', 'ציון'], ['נועה', 85], ['איתי', 92], ['מאיה', 78], ['יונתן', 64], ['שירה', 95], ['עומר', 70], ['סכום'], ['ממוצע']]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['B8: הקלידו ‎=SUM(', 'גררו על B2 עד B7, סגרו ) ולחצו Enter'],
        checks: [{ t: 'fx', ref: 'B8', fn: 'SUM', v: 484, label: 'B8 = 484, עם SUM' }],
        solution: { cells: { B8: '=SUM(B2:B7)' } },
        tip: 'B2:B7 פירושו "מ-B2 עד B7".',
      },
      {
        title: 'ממוצע',
        steps: ['B9: ‎=AVERAGE(B2:B7)'],
        checks: [{ t: 'fx', ref: 'B9', fn: 'AVERAGE', v: 484 / 6, label: 'B9 = 80.67, עם AVERAGE' }],
        solution: { cells: { B9: '=AVERAGE(B2:B7)' } },
        tip: 'AVERAGE מתעלם מתאים ריקים, כך שתלמיד שלא נבחן לא מוריד את הממוצע.',
      },
      {
        title: 'הכול מתעדכן',
        steps: ['מאיה ערערה וקיבלה 90: שנו את B4 ל-90', 'הסתכלו איך הסכום והממוצע משתנים לבד'],
        checks: [
          { t: 'val', ref: 'B4', v: 90, label: 'B4 = 90' },
          { t: 'fx', ref: 'B9', fn: 'AVERAGE', v: 496 / 6, label: 'הממוצע עלה ל-82.67' },
        ],
        solution: { cells: { B4: '90' } },
        tip: 'זה כל הכוח של אקסל: משנים נתון אחד, והכול מחושב מחדש.',
      },
    ],
  },
  {
    slug: 'autofill', emoji: '⬇️', title: 'גרירה ומילוי', short: 'ידית המילוי ו-$ שמקבע תא',
    seo: 'מילוי אוטומטי באקסל: גרירת נוסחה עם ידית המילוי, והפניה מוחלטת עם סימן $',
    tasks: [
      {
        title: 'נוסחה אחת, שש שורות',
        sheet: {
          cols: 4, rows: 7, widths: { A: 100 },
          cells: grid([['מוצר', 'מחיר', 'כמות', 'סה״כ'], ['מחברת', 6, 5], ['עט', 3, 10], ['תיק', 120, 1], ['סרגל', 4, 2], ['מחק', 2, 3], ['צבעים', 25, 1]]),
          fmt: { A1: { b: true }, B1: { b: true }, C1: { b: true }, D1: { b: true } },
        },
        steps: ['D2: ‎=B2*C2', 'לחצו על D2 וגררו את הריבוע הקטן בפינה שלו עד D7', 'בטלפון: סמנו D2 עד D7 ולחצו "מילוי ⬇"'],
        checks: [{ t: 'fxRange', range: 'D2:D7', vs: [30, 30, 120, 8, 6, 25], label: 'D2 עד D7 מחושבים בנוסחה' }],
        solution: { cells: { D2: '=B2*C2' }, ops: [['fill', 'D2', 'D2:D7']] },
        tip: 'Ctrl+D ממלא למטה את מה שבשורה הראשונה של הסימון.',
      },
      {
        title: 'לוח הכפל עם $',
        sheet: {
          cols: 2, rows: 12, widths: { A: 110 },
          cells: grid([['לוח הכפל של', 7], [], [1], [2], [3], [4], [5], [6], [7], [8], [9], [10]]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['B3: ‎=A3*$B$1', 'גררו את B3 עד B12', 'ה-$ שומר על B1 קבוע בכל השורות'],
        checks: [
          { t: 'fxRange', range: 'B3:B12', vs: [7, 14, 21, 28, 35, 42, 49, 56, 63, 70], label: 'B3 עד B12: 7 עד 70' },
          { t: 'fx', ref: 'B12', has: '$B$1', label: 'B12 עדיין מצביע על ‎$B$1' },
        ],
        solution: { cells: { B3: '=A3*$B$1' }, ops: [['fill', 'B3', 'B3:B12']] },
        tip: 'F4 בזמן הקלדת נוסחה מוסיף את ה-$ לבד.',
      },
      {
        title: 'לוח של 9',
        steps: ['שנו את B1 ל-9'],
        checks: [
          { t: 'val', ref: 'B1', v: 9, label: 'B1 = 9' },
          { t: 'fx', ref: 'B12', v: 90, label: 'B12 = 90' },
        ],
        solution: { cells: { B1: '9' } },
        tip: 'בלי ה-$ הגרירה הייתה מזיזה את B1 ל-B2, B3… והתוצאות היו שגויות.',
      },
    ],
  },
  {
    slug: 'min-max-count', emoji: '🔢', title: 'MAX, MIN ו-COUNT', short: 'הכי הרבה, הכי מעט וכמה מילאו',
    seo: 'פונקציות MAX, MIN, COUNT ו-COUNTBLANK באקסל עם דוגמה של גבייה לטיול שנתי',
    tasks: [
      {
        title: 'גבייה לטיול',
        sheet: {
          cols: 2, rows: 14, widths: { A: 130 },
          cells: grid([['שם', 'שילם (₪)'], ['דניאל', 50], ['תמר', ''], ['אורי', 50], ['ליה', 30], ['נדב', ''], ['הדר', 50], ['רון', 20], ['עדי', 50], [], ['הכי הרבה'], ['הכי מעט'], ['כמה שילמו'], ['כמה לא שילמו']]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['B11: ‎=MAX(B2:B9)', 'B12: ‎=MIN(B2:B9)'],
        checks: [
          { t: 'fx', ref: 'B11', fn: 'MAX', v: 50, label: 'B11 = 50, עם MAX' },
          { t: 'fx', ref: 'B12', fn: 'MIN', v: 20, label: 'B12 = 20, עם MIN' },
        ],
        solution: { cells: { B11: '=MAX(B2:B9)', B12: '=MIN(B2:B9)' } },
        tip: 'MIN מתעלם מתאים ריקים, ולכן הוא לא מחזיר 0.',
      },
      {
        title: 'מי עוד לא שילם?',
        steps: ['B13: ‎=COUNT(B2:B9) סופר תאים עם מספר', 'B14: ‎=COUNTBLANK(B2:B9) סופר תאים ריקים'],
        checks: [
          { t: 'fx', ref: 'B13', fn: 'COUNT', v: 6, label: 'B13 = 6, עם COUNT' },
          { t: 'fx', ref: 'B14', v: 2, label: 'B14 = 2, בנוסחה' },
        ],
        solution: { cells: { B13: '=COUNT(B2:B9)', B14: '=COUNTBLANK(B2:B9)' } },
        tip: 'COUNTA סופר כל תא שאינו ריק, גם טקסט.',
      },
    ],
  },
  {
    slug: 'if', emoji: '🔀', title: 'IF: אם… אז…', short: 'עבר או לא עבר, ו-COUNTIF',
    seo: 'פונקציית IF באקסל עם דוגמה של ציון עובר, ופונקציית COUNTIF לספירה לפי תנאי',
    tasks: [
      {
        title: 'עבר או לא עבר',
        sheet: {
          cols: 3, rows: 9, widths: { A: 110, C: 100 },
          cells: grid([['תלמיד/ה', 'ציון', 'תוצאה'], ['נועה', 85], ['איתי', 48], ['מאיה', 72], ['יונתן', 54], ['שירה', 95], ['עומר', 55], [], ['כמה עברו']]),
          fmt: { A1: { b: true }, B1: { b: true }, C1: { b: true } },
        },
        steps: ['C2: ‎=IF(B2>=55,"עבר","לא עבר")', 'גררו את C2 עד C7'],
        checks: [{ t: 'fxRange', range: 'C2:C7', fn: 'IF', vs: ['עבר', 'לא עבר', 'עבר', 'לא עבר', 'עבר', 'עבר'], label: 'C2 עד C7 עם IF' }],
        solution: { cells: { C2: '=IF(B2>=55,"עבר","לא עבר")' }, ops: [['fill', 'C2', 'C2:C7']] },
        tip: 'IF(תנאי, מה אם כן, מה אם לא). טקסט תמיד בתוך מירכאות.',
      },
      {
        title: 'כמה עברו?',
        steps: ['B9: ‎=COUNTIF(C2:C7,"עבר")'],
        checks: [{ t: 'fx', ref: 'B9', fn: 'COUNTIF', v: 4, label: 'B9 = 4, עם COUNTIF' }],
        solution: { cells: { B9: '=COUNTIF(C2:C7,"עבר")' } },
        tip: 'גם ‎=COUNTIF(B2:B7,">=55") נותן 4, ישר מהציונים.',
      },
    ],
  },
  {
    slug: 'sort', emoji: '↕️', title: 'מיון טבלה', short: 'מהגדול לקטן ולפי א״ב',
    seo: 'איך ממיינים טבלה באקסל מהגדול לקטן ולפי סדר האלף־בית, בלי לערבב שורות',
    tasks: [
      {
        title: 'טבלת המובילים',
        sheet: {
          cols: 2, rows: 7, widths: { A: 120 },
          cells: grid([['שחקן/ית', 'נקודות'], ['אביב', 12], ['גלי', 30], ['דור', 7], ['הילה', 21], ['זיו', 18], ['יעל', 25]]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['לחצו על תא כלשהו בעמודת הנקודות', 'לחצו "מהגדול לקטן"'],
        checks: [{ t: 'sorted', range: 'A2:B7', col: 'B', dir: 'desc', label: 'ממוין לפי נקודות, מהגדול לקטן, וכל שם נשאר עם הנקודות שלו' }],
        solution: { ops: [['sort', 'A2:B7', 'B', 'desc']] },
        tip: 'אקסל ממיין את כל הטבלה יחד, כך שהשמות זזים עם הנקודות.',
      },
      {
        title: 'לפי א״ב',
        steps: ['לחצו על תא בעמודת השמות', 'לחצו "מהקטן לגדול / א→ת"'],
        checks: [{ t: 'sorted', range: 'A2:B7', col: 'A', dir: 'asc', label: 'ממוין לפי שם, א→ת' }],
        solution: { ops: [['sort', 'A2:B7', 'A', 'asc']] },
        tip: 'שורת הכותרת לא זזה במיון.',
      },
    ],
  },
  {
    slug: 'charts', emoji: '📊', title: 'גרף ראשון', short: 'גרף עמודות וגרף עוגה',
    seo: 'איך יוצרים גרף באקסל: גרף עמודות וגרף עוגה מטבלת הוצאות',
    tasks: [
      {
        title: 'גרף עמודות',
        sheet: {
          cols: 2, rows: 6, widths: { A: 120 },
          cells: grid([['הוצאה', 'סכום'], ['אוכל', 2400], ['חשמל', 450], ['דלק', 800], ['חוגים', 600], ['בילויים', 350]]),
          fmt: { A1: { b: true }, B1: { b: true } },
        },
        steps: ['סמנו את A1 עד B6', 'לחצו "📊 עמודות"'],
        checks: [{ t: 'chart', range: 'A2:B6', kind: 'bar', label: 'גרף עמודות על A2:B6' }],
        solution: { ops: [['chart', 'A1:B6', 'bar']] },
        tip: 'שנו את הסכום של החוגים: העמודה בגרף זזה מיד.',
      },
      {
        title: 'גרף עוגה',
        steps: ['אותו סימון, הפעם "🥧 עוגה"'],
        checks: [{ t: 'chart', range: 'A2:B6', kind: 'pie', label: 'גרף עוגה על A2:B6' }],
        solution: { ops: [['chart', 'A1:B6', 'pie']] },
        tip: 'עוגה מראה חלקים מתוך שלם. עמודות טובות להשוואה.',
      },
    ],
  },
  {
    slug: 'family-budget', emoji: '🏠', title: 'פרויקט: תקציב משפחתי', short: 'כל מה שלמדנו בגיליון אחד',
    seo: 'תקציב משפחתי באקסל: הכנסות, הוצאות, מאזן, IF, עיצוב ש״ח וגרף',
    tasks: [
      {
        title: 'סכומים',
        sheet: {
          cols: 2, rows: 16, widths: { A: 140, B: 100 },
          cells: grid([['הכנסות', 'סכום'], ['משכורת 1', 9000], ['משכורת 2', 7500], ['קצבת ילדים', 300], ['סה״כ הכנסות'], [], ['הוצאות', 'סכום'], ['שכר דירה', 5200], ['סופר', 3200], ['חשמל ומים', 700], ['רכב', 1500], ['חוגים', 900], ['סה״כ הוצאות'], [], ['מאזן'], ['מצב']]),
        },
        steps: ['B5: סכום ההכנסות', 'B13: סכום ההוצאות'],
        checks: [
          { t: 'fx', ref: 'B5', fn: 'SUM', v: 16800, label: 'B5 = 16,800' },
          { t: 'fx', ref: 'B13', fn: 'SUM', v: 11500, label: 'B13 = 11,500' },
        ],
        solution: { cells: { B5: '=SUM(B2:B4)', B13: '=SUM(B8:B12)' } },
        tip: 'Alt+= כותב SUM לבד באקסל האמיתי.',
      },
      {
        title: 'מאזן',
        steps: ['B15: הכנסות פחות הוצאות', 'B16: IF שכותב "חיסכון" אם המאזן 0 ומעלה, אחרת "גירעון"'],
        checks: [
          { t: 'fx', ref: 'B15', v: 5300, label: 'B15 = 5,300' },
          { t: 'fx', ref: 'B16', fn: 'IF', v: 'חיסכון', label: 'B16 = חיסכון, עם IF' },
        ],
        solution: { cells: { B15: '=B5-B13', B16: '=IF(B15>=0,"חיסכון","גירעון")' } },
        tip: 'נסו להעלות את שכר הדירה ל-11,000 ותראו את B16 מתחלף.',
      },
      {
        title: 'עיצוב',
        steps: ['הדגישו את A1:B1 ואת A7:B7', 'סמנו B2 עד B15 ולחצו ₪'],
        checks: [
          { t: 'bold', range: 'A1:B1', label: 'A1:B1 מודגשים' },
          { t: 'bold', range: 'A7:B7', label: 'A7:B7 מודגשים' },
          { t: 'cur', range: 'B2:B15', label: 'כל הסכומים בש״ח' },
        ],
        solution: { ops: [['bold', 'A1:B1'], ['bold', 'A7:B7'], ['cur', 'B2:B15']] },
        tip: 'אחרי שסימנתם טווח, Ctrl+B מדגיש את כולו.',
      },
      {
        title: 'לאן הולך הכסף?',
        steps: ['סמנו A7 עד B12', 'לחצו "🥧 עוגה"'],
        checks: [{ t: 'chart', range: 'A8:B12', kind: 'pie', label: 'גרף עוגה של ההוצאות' }],
        solution: { ops: [['chart', 'A7:B12', 'pie']] },
        tip: 'סיימתם את הקורס! עכשיו נסו לבנות את התקציב של הבית שלכם.',
      },
    ],
  },
]

export const lessonBySlug = slug => LESSONS.find(l => l.slug === slug)

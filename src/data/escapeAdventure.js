export const ESCAPE_LEVELS = [
  { id: 'easy', label: 'קל', detail: '6 שלבים · חישוב קצר ורמזים גלויים', count: 6 },
  { id: 'medium', label: 'בינוני', detail: '8 שלבים · מספר פעולות ופענוח קודים', count: 8 },
  { id: 'hard', label: 'קשה', detail: '10 שלבים · חידות משולבות והסקת מסקנות', count: 10 },
]

// The original story clues remain the introduction and finale. Between them,
// generate a second chapter with self-contained, solvable locks.
export function buildEscapeAdventure(room, levelId, seed = 0) {
  const level = ESCAPE_LEVELS.find(item => item.id === levelId) || ESCAPE_LEVELS[0]
  const rank = ESCAPE_LEVELS.indexOf(level)
  const n = 2 + (Math.abs(seed) % 5)
  const icon = room.emoji || '🔑'
  const puzzle = (title, story, question, answer, hint, visual) => ({title, story, question, answer: String(answer), hint, visual})
  const additions = [
    puzzle('הסמלים שעל המנעול', `בדרך אל הרמז האחרון של “${room.title}” מתגלה מסדרון מנעולים נוסף. כל ${icon} שווה ${n}. ${rank === 0 ? 'חברו שני סמלים.' : rank === 1 ? 'חברו שלושה סמלים ואז הוסיפו 4.' : 'כפלו שני סמלים זה בזה ואז הוסיפו סמל נוסף.'}`, 'איזה מספר פותח את המנעול?', rank === 0 ? n*2 : rank === 1 ? n*3+4 : n*n+n, `מציבים ${n} במקום כל סמל. ${rank === 2 ? 'מבצעים כפל לפני חיבור.' : 'מחברים את הערכים.'}`, rank === 0 ? `${icon} + ${icon} = ?` : rank === 1 ? `${icon} + ${icon} + ${icon} + 4 = ?` : `${icon} × ${icon} + ${icon} = ?`),
    puzzle('לוח המספרים', rank === 0 ? 'בכל מעבר ימינה מוסיפים 2.' : rank === 1 ? 'בכל מעבר ימינה מכפילים ב־2.' : 'מוסיפים בכל פעם מספר אי־זוגי עוקב: 3, ואז 5, ואז 7, ואז 9.', 'מה המספר הבא ברצף?', rank === 0 ? n+8 : rank === 1 ? n*16 : n+24, rank === 0 ? 'הוסיפו 2 למספר האחרון.' : rank === 1 ? 'כפלו את המספר האחרון ב־2.' : 'ההפרש הבא הוא 9.', (rank===0?[n,n+2,n+4,n+6]:rank===1?[n,n*2,n*4,n*8]:[n,n+3,n+8,n+15]).join(' → ')+' → ?'),
    puzzle('ארון המפתחות', `בארון ${n+rank+2} מגירות. בכל מגירה ${rank+2} מפתחות.${rank ? ` הוצאתם ${n} מפתחות בסך הכול.` : ''}`, 'כמה מפתחות נשארו בארון?', (n+rank+2)*(rank+2)-(rank?n:0), 'חשבו מספר מגירות כפול מספר מפתחות למגירה, ואז הפחיתו רק את המפתחות שהוצאו.', `🗄️ ${n+rank+2} × 🔑 ${rank+2}${rank?` − ${n}`:''}`),
    puzzle('הכספת עם הצורות', `מקרא הכספת: עיגול = ${n}, משולש = ${n+1}, ריבוע = ${n+2}. ${rank===2?'הקוד הוא סכום ערכי הצורות, לא מספר צמוד.':'הקלידו את ערכי הצורות ברצף משמאל לימין, ללא רווחים.'}`, 'מה קוד הכספת?', rank===2?n*3+3:`${n+2}${n}${n+1}`, rank===2?'חברו את שלושת הערכים לפי המקרא.':'ריבוע ראשון, אחריו עיגול ואז משולש.', '■ ● ▲'),
    puzzle('שלושת התאים', `יש שלושה תאים ממוספרים 1, 2, 3. רק בתא אחד נמצא המפתח. ${rank===2?'בדיוק טענה אחת נכונה: “המפתח בתא 1”; “המפתח אינו בתא 2”; “המפתח אינו בתא 1”.':'על הפתק כתוב: המפתח אינו בתא 1 ואינו בתא 3.'}`, 'מה מספר התא עם המפתח?', 2, rank===2?'בדקו כל תא: בתא 1 שתי טענות נכונות, בתא 3 שתי טענות נכונות.':'פסלו את שני התאים שהוזכרו בפתק.', '🗃️ 1     🗃️ 2     🗃️ 3'),
    puzzle('השעון ההפוך', `השעון מראה ${n+2}:00. צריך להזיז אותו ${rank+2} שעות קדימה, ואז שעה אחת אחורה. משתמשים בשעון של 12 שעות.`, 'איזו שעה תופיע? כתבו את מספר השעה בלבד.', n+rank+3, 'מתקדמים לפי ההוראות לפי הסדר, ואז חוזרים שעה אחת.', `🕒 ${n+2}:00 → +${rank+2} → −1`),
    puzzle('חותמת המעבר', `על החותמת המספר ${n+3}. מכפילים אותו ב־3, מוסיפים 6 ומחלקים את התוצאה ב־3. זה קוד המעבר אל הרמז האחרון בסיפור.`, 'מה קוד המעבר?', n+5, 'בצעו את הפעולות משמאל לימין. החילוק מתבצע על כל הסכום.', `(${n+3} × 3 + 6) ÷ 3 = ?`),
  ]
  // The original room clues are kept as the story opening, but every level
  // now gets a different ordering and wording for the added locks. This makes
  // switching difficulty visibly change the actual questions, not only the
  // number of steps.
  const difficultyNames = ['מסלול חימום', 'מסלול פענוח', 'מסלול מומחים']
  const rotate = (items, amount) => items.map((_, index) => items[(index + amount) % items.length])
  const levelAdditions = rotate(additions, (rank * 2 + Math.abs(seed)) % additions.length)
    .map((item, index) => ({
      ...item,
      title: `${difficultyNames[rank]} · ${item.title}`,
      question: rank === 0
        ? `${item.question} אפשר להיעזר ברמז.`
        : rank === 1
          ? `${item.question} איזה שלב בחישוב עשיתם קודם?`
          : `${item.question} הסבירו לעצמכם את ההיגיון לפני הזנת הקוד.`,
      order: index,
    }))
  const originals = room.steps
  const extraCount = Math.max(0,level.count-originals.length)
  return {...room, difficulty:level.label, duration:rank===0?'15–25 דקות':rank===1?'25–35 דקות':'35–45 דקות', intro:room.intro.replace(/שלושה רמזים/g,'את רמזי הסיפור ומנעולי המסדרון'), steps:[...originals.slice(0,-1),...levelAdditions.slice(0,extraCount),originals.at(-1)]}
}

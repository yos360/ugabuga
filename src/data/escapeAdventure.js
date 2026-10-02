export const ESCAPE_LEVELS = [
  { id: 'easy', label: 'קל', detail: '6 שלבים · חישוב קצר ורמזים בהדרגה', count: 6 },
  { id: 'medium', label: 'בינוני', detail: '8 שלבים · מספר פעולות ופענוח קודים', count: 8 },
  { id: 'hard', label: 'קשה', detail: '10 שלבים · חידות משולבות והסקת מסקנות', count: 10 },
]

// Rooms whose audience includes ages 4–6 get only counting / colors / shapes
// locks — no multiplication and no "replace every symbol with a number" algebra.
export const isYoungRoom = room => Boolean(room?.tags?.ages?.includes('4-6'))

// Graduated hints: a gentle nudge first, then the room's own hint split into
// steps, so the first click never hands over the full answer.
function splitHint(hint) {
  const text = String(hint || '').trim()
  if (!text) return []
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean)
  if (sentences.length > 1) return sentences
  const clauses = text.split(/,\s+(?=ועוד|פחות|ואז|כפול|ו)/)
  return clauses.length > 1 ? clauses.map((c, i) => (i < clauses.length - 1 ? c + '…' : c)) : [text]
}

function nudgeFor(step) {
  const numeric = /^\d+$/.test(String(step.answer).trim())
  return numeric
    ? 'זה מנעול של מספרים. קראו שוב את הסיפור: אילו מספרים מופיעים בו, ואיזו פעולה מתאימה להם?'
    : 'התשובה היא מילה. קראו שוב את הסיפור לאט וחפשו את המילה או הרעיון שמסתתרים בו.'
}

export function hintsFor(step, rank) {
  if (Array.isArray(step.hints) && step.hints.length) return step.hints
  let parts = splitHint(step.hint)
  // Medium/hard: when the room hint ends by spelling out the answer ("…ועוד 5 הם 25"), keep only the
  // partial steps so the hints guide without solving.
  const answerRe = new RegExp(`(^|[^\\d])${String(step.answer).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\d]|$)`)
  if (rank >= 1 && parts.length >= 2 && answerRe.test(parts.at(-1))) parts = parts.slice(0, -1)
  // Easy & medium: the room hint is already gentle enough to start with; hard
  // levels always open with a nudge so the first hint never solves the lock.
  return rank >= 1 ? [nudgeFor(step), ...parts] : parts.length ? parts : [nudgeFor(step)]
}

function youngAdditions(room, rank, n) {
  const puzzle = (title, story, question, answer, hints, visual, accept) => ({ title, story, question, answer: String(answer), hint: hints.join(' '), hints, visual, accept })
  const a = Math.min(n, 4) + rank // 2..6
  const b = 1 + (n % 3) // 1..3
  const stars = Math.min(a + 2, 9)
  const colorSets = [
    ['הדשא', 'ירוק', ['ירוקה'], '🌿'],
    ['השמש בציור', 'צהוב', ['צהובה'], '🌞'],
    ['העגבנייה', 'אדום', ['אדומה'], '🍅'],
    ['השמיים ביום בהיר', 'כחול', ['כחולה', 'תכלת'], '☁️'],
  ]
  const [thing, color, colorAccept, colorEmoji] = colorSets[(n + rank) % colorSets.length]
  const shapes = [
    ['שלוש פינות', 'משולש', '🔺'],
    ['ארבע פינות וארבע צלעות שוות', 'ריבוע', '🟥'],
    ['אין לה פינות בכלל, היא עגולה', 'עיגול', '⚪'],
  ]
  const [shapeClue, shape, shapeEmoji] = shapes[(n + rank) % shapes.length]
  return [
    puzzle('ספירת הכוכבים', `על הדלת של “${room.title}” מצוירים כוכבים. כמה כוכבים יש?`, 'כמה כוכבים על הדלת?', stars,
      ['הצביעו על כל כוכב ותגידו מספר בקול.', 'מתחילים מ־1 וממשיכים עד הכוכב האחרון.'], '⭐'.repeat(stars)),
    puzzle('המנעול הצבעוני', `המנעול נפתח רק כשאומרים את הצבע שלו. המנעול בצבע של ${thing}.`, 'באיזה צבע המנעול?', color,
      [`חשבו על ${thing}. איזה צבע הוא?`, colorEmoji], colorEmoji, colorAccept),
    puzzle('המפתחות בסל', `בסל אחד יש ${a} מפתחות, ובסל השני עוד ${b} מפתחות.`, 'כמה מפתחות יש ביחד?', a + b,
      ['ספרו את כל המפתחות בציור, אחד אחרי השני.', `מתחילים מ־${a} וממשיכים לספור עוד ${b}.`], `${'🔑'.repeat(a)}  ${'🔑'.repeat(b)}`),
    puzzle('הצורה הסודית', `על הקופסה מצוירת צורה. לצורה יש ${shapeClue}.`, 'איזו צורה על הקופסה?', shape,
      ['ציירו את הצורה באוויר עם האצבע.', shapeEmoji], '🔺 🟥 ⚪'),
    puzzle('הבלונים', `בחדר ${a + 1} בלונים. בלון אחד עף למעלה ונעלם!`, 'כמה בלונים נשארו?', a,
      ['ספרו את הבלונים בציור.', 'בלון אחד עף — מורידים אצבע אחת.'], '🎈'.repeat(a + 1) + ' ← 🎈 עף'),
    puzzle('הדובים בשורה', 'בשורה עומדים דובים: 🐻 גדול, 🧸 קטן, 🐻 גדול, 🧸 קטן, 🐻 גדול…', 'מה בא אחר כך — גדול או קטן?', 'קטן',
      ['אמרו את השורה בקול: גדול, קטן, גדול…', 'אחרי גדול תמיד בא…'], '🐻 🧸 🐻 🧸 🐻 ?'),
  ]
}

// The original story clues remain the introduction and finale. Between them,
// generate a second chapter with self-contained, solvable locks.
export function buildEscapeAdventure(room, levelId, seed = 0) {
  const level = ESCAPE_LEVELS.find(item => item.id === levelId) || ESCAPE_LEVELS[0]
  const rank = ESCAPE_LEVELS.indexOf(level)
  const n = 2 + (Math.abs(seed) % 5)
  const icon = room.emoji || '🔑'
  const puzzle = (title, story, question, answer, hints, visual) => ({title, story, question, answer: String(answer), hint: hints.join(' '), hints, visual})
  const drawers = n + rank + 2
  const perDrawer = rank + 2
  const additions = isYoungRoom(room) ? youngAdditions(room, rank, n) : [
    puzzle('הסמלים שעל המנעול', `בדרך אל הרמז האחרון של “${room.title}” מתגלה מסדרון מנעולים נוסף. כל ${icon} שווה ${n}. ${rank === 0 ? 'חברו שני סמלים.' : rank === 1 ? 'חברו שלושה סמלים ואז הוסיפו 4.' : 'כפלו שני סמלים זה בזה ואז הוסיפו סמל נוסף.'}`, 'איזה מספר פותח את המנעול?', rank === 0 ? n*2 : rank === 1 ? n*3+4 : n*n+n,
      rank === 0 ? ['כל סמל הוא מספר. כמה שווה סמל אחד?', `מחברים: ${n} ועוד ${n}.`]
        : rank === 1 ? ['כל סמל הוא מספר. כתבו את המספר במקום כל סמל.', 'קודם מחברים את שלושת הסמלים, ורק בסוף מוסיפים 4.']
          : ['כל סמל הוא מספר. כתבו את המספר במקום כל סמל.', 'זכרו: כפל לפני חיבור.'],
      rank === 0 ? `${icon} + ${icon} = ?` : rank === 1 ? `${icon} + ${icon} + ${icon} + 4 = ?` : `${icon} × ${icon} + ${icon} = ?`),
    puzzle('לוח המספרים', rank === 0 ? 'בכל מעבר ימינה מוסיפים 2.' : rank === 1 ? 'בכל מעבר ימינה מכפילים ב־2.' : 'כל קפיצה ברצף גדולה מהקודמת שלה.', 'מה המספר הבא ברצף?', rank === 0 ? n+8 : rank === 1 ? n*16 : n+24,
      rank === 0 ? ['מסתכלים על המספר האחרון ברצף.', 'מוסיפים לו 2.'] : rank === 1 ? ['השוו כל מספר למספר שלפניו.', 'כפלו את המספר האחרון ב־2.'] : ['חשבו כמה מוסיפים בכל קפיצה: 3, ואז…', 'הקפיצות הן 3, 5, 7 — הקפיצה הבאה היא 9.'],
      (rank===0?[n,n+2,n+4,n+6]:rank===1?[n,n*2,n*4,n*8]:[n,n+3,n+8,n+15]).join(' → ')+' → ?'),
    rank === 0
      ? puzzle('ארון המפתחות', `בארון ${drawers} מגירות. בכל מגירה 2 מפתחות.`, 'כמה מפתחות יש בארון?', drawers*2,
        ['ספרו את המפתחות בכל המגירות.', 'סופרים בקפיצות של 2: 2, 4, 6…'], Array.from({length: drawers}, () => '🔑🔑').join(' | '))
      : puzzle('ארון המפתחות', `בארון ${drawers} מגירות. בכל מגירה ${perDrawer} מפתחות. הוצאתם ${n} מפתחות בסך הכול.`, 'כמה מפתחות נשארו בארון?', drawers*perDrawer-n,
        ['קודם מוצאים כמה מפתחות היו בארון בהתחלה.', 'מספר מגירות כפול מפתחות בכל מגירה — ואז מורידים את המפתחות שהוצאו.'], `🗄️ ${drawers} × 🔑 ${perDrawer} − ${n}`),
    puzzle('הכספת עם הצורות', `מקרא הכספת: עיגול = ${n}, משולש = ${n+1}, ריבוע = ${n+2}. ${rank===2?'הקוד הוא סכום ערכי הצורות, לא מספר צמוד.':'הקלידו את ערכי הצורות ברצף משמאל לימין, ללא רווחים.'}`, 'מה קוד הכספת?', rank===2?n*3+3:`${n+2}${n}${n+1}`,
      rank===2 ? ['מוצאים במקרא את הערך של כל צורה.', 'מחברים את שלושת הערכים.'] : ['מוצאים במקרא את הערך של כל צורה.', 'ריבוע ראשון, אחריו עיגול ואז משולש.'], '■ ● ▲'),
    puzzle('שלושת התאים', `יש שלושה תאים ממוספרים 1, 2, 3. רק בתא אחד נמצא המפתח. ${rank===2?'בדיוק טענה אחת נכונה: “המפתח בתא 1”; “המפתח אינו בתא 2”; “המפתח אינו בתא 1”.':'על הפתק כתוב: המפתח אינו בתא 1 ואינו בתא 3.'}`, 'מה מספר התא עם המפתח?', 2,
      rank===2 ? ['נסו להניח שהמפתח בתא 1 וספרו כמה טענות נכונות.', 'בתא 1 ובתא 3 יוצאות שתי טענות נכונות — אז נשאר רק תא אחד.'] : ['אילו תאים הפתק פוסל?', 'פסלו את שני התאים שהוזכרו בפתק.'], '🗃️ 1     🗃️ 2     🗃️ 3'),
    puzzle('השעון ההפוך', `השעון מראה ${n+2}:00. צריך להזיז אותו ${rank+2} שעות קדימה, ואז שעה אחת אחורה. משתמשים בשעון של 12 שעות.`, 'איזו שעה תופיע? כתבו את מספר השעה בלבד.', n+rank+3,
      ['מתקדמים לפי ההוראות לפי הסדר.', `קודם ${rank+2} שעות קדימה, ואז חוזרים שעה אחת.`], `🕒 ${n+2}:00 → +${rank+2} → −1`),
    rank === 0
      ? puzzle('חותמת המעבר', `על החותמת המספר ${n+3}. מוסיפים לו 2 ואז מורידים 1. זה קוד המעבר אל הרמז האחרון בסיפור.`, 'מה קוד המעבר?', n+4,
        ['מתחילים מהמספר שעל החותמת.', `${n+3} ועוד 2, ואז פחות 1.`], `${n+3} + 2 − 1 = ?`)
      : puzzle('חותמת המעבר', `על החותמת המספר ${n+3}. מכפילים אותו ב־3, מוסיפים 6 ומחלקים את התוצאה ב־3. זה קוד המעבר אל הרמז האחרון בסיפור.`, 'מה קוד המעבר?', n+5,
        ['בצעו את הפעולות לפי הסדר, אחת אחרי השנייה.', 'החילוק ב־3 מתבצע על כל הסכום, לא רק על ה־6.'], `(${n+3} × 3 + 6) ÷ 3 = ?`),
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
      order: index,
    }))
  const originals = room.steps.map(step => ({ ...step, hints: hintsFor(step, rank) }))
  const extraCount = Math.max(0,level.count-originals.length)
  return {...room, difficulty:level.label, duration:rank===0?'15–25 דקות':rank===1?'25–35 דקות':'35–45 דקות', intro:room.intro.replace(/שלושה רמזים/g,'את רמזי הסיפור ומנעולי המסדרון'), steps:[...originals.slice(0,-1),...levelAdditions.slice(0,extraCount),originals.at(-1)]}
}

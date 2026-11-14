// "חימום לפני השיעור" (/classroom/warm-up): a 2–5 minute movement break for the projector.
// Pure logic only — the moves, the themes and building a routine. Every move is safe to do
// standing next to the desk: no running around the room, no partners, no equipment.

export const THEMES = [
  { id: 'sport', label: 'חימום ספורטיבי', emoji: '🏃', hint: 'להתעורר לפני השיעור' },
  { id: 'hanukkah', label: 'חימום חנוכה', emoji: '🕎', hint: 'סביבון, נרות ומכבים' },
  { id: 'math', label: 'חשבון בתנועה', emoji: '🔢', hint: 'פותרים בגוף' },
  { id: 'english', label: 'Simon says באנגלית', emoji: '🇬🇧', hint: 'הוראות באנגלית' },
  { id: 'calm', label: 'נרגעים אחרי הפסקה', emoji: '🫧', hint: 'נשימות ומתיחות' },
]

export const LENGTHS = [
  { minutes: 2, seconds: 20 },
  { minutes: 3, seconds: 30 },
  { minutes: 5, seconds: 30 },
]

export const BANDS = [
  { id: 'low', label: 'א׳–ב׳' },
  { id: 'mid', label: 'ג׳–ד׳' },
  { id: 'high', label: 'ה׳–ח׳' },
]

// [emoji, title, instruction]
const SPORT = [
  ['🏃', 'ריצה במקום', 'רצים במקום ומרימים ברכיים גבוה. מהר יותר… ועוד יותר מהר!'],
  ['⭐', 'קפיצות כוכב', 'קופצים ופותחים ידיים ורגליים כמו כוכב, וחוזרים לעמידה. קפיצות קטנות, ליד השולחן.'],
  ['🙆', 'נוגעים בתקרה', 'עומדים על קצות האצבעות ומותחים ידיים למעלה, כאילו רוצים לגעת בתקרה.'],
  ['🔄', 'סיבובי כתפיים', '10 סיבובים של הכתפיים קדימה, ו־10 אחורה. לאט ובגדול.'],
  ['🦩', 'פלמינגו', 'עומדים על רגל אחת בלי ליפול. באמצע הזמן מחליפים רגל.'],
  ['🥊', 'אגרופים לאוויר', 'אגרופים מהירים קדימה, יד ימין ויד שמאל, כמו מתאגרפים.'],
  ['🪑', 'כיסא דמיוני', 'מתכופפים כאילו יושבים על כיסא שלא קיים, ומחזיקים. הגב ישר!'],
  ['🤸', 'נוגעים בבהונות', 'מתכופפים לאט ונוגעים בבהונות (או בברכיים), ועולים חזרה. 8 פעמים.'],
  ['❎', 'ברך למרפק', 'מרימים ברך ימין ונוגעים בה במרפק שמאל, ואז להפך. עוזר לשני חצאי המוח לעבוד יחד.'],
  ['🌀', 'מדחפים', 'מסובבים את הידיים בעיגולים גדולים קדימה, ואז אחורה.'],
  ['👏', 'מחיאות למעלה ולמטה', 'מוחאים כף מעל הראש, ואז מאחורי הגב. שוב ושוב, בקצב.'],
  ['🧊', 'פסל קפוא', 'זזים ורוקדים במקום. כשהמורה אומר/ת "קפאו!" — כולם פסלים. מי זז?'],
]

const HANUKKAH = [
  ['🌀', 'סביבון', 'מסתובבים לאט במקום כמו סביבון: 3 סיבובים לימין, ו־3 לשמאל.'],
  ['🕯️', 'הנר הגבוה', 'עומדים זקוף, מצמידים כפות ידיים מעל הראש כמו להבה, ומתנדנדים לאט מצד לצד.'],
  ['🍩', 'סופגנייה תופחת', 'מתכווצים קטן קטן כמו בצק, ותופחים לאט עד שקופצים למעלה! שוב ושוב.'],
  ['🛡️', 'המכבים', 'מרימים מגן ביד אחת, וצועדים במקום בצעדי לוחם — שמאל, ימין, שמאל, ימין.'],
  ['🫒', 'פך השמן', 'מתכופפים ומרימים מהרצפה פך שמן דמיוני, ומניפים אותו גבוה מעל הראש. 8 פעמים.'],
  ['🕎', 'שמונה נרות', 'סופרים יחד בקול מ־1 עד 8, ובכל מספר מרימים עוד אצבע וקופצים קפיצה אחת.'],
  ['🎲', 'נ־ג־ה־פ', 'המורה קורא/ת אות: נ — עומדים בשקט. ג — קופצים. ה — מתכופפים. פ — מסתובבים.'],
  ['🔥', 'להבה בקופסה', 'מתחילים כפופים קטן, ועולים לאט לאט כמו להבה שגדלה — עד מתיחה גבוהה על קצות האצבעות.'],
  ['🥔', 'מגררים לביבות', 'מחזיקים ידיים קדימה ו"מגררים" תפוחי אדמה מהר מהר — למעלה ולמטה.'],
  ['🎉', 'נס גדול היה פה', 'על כל מילה תנועה: נס — מחיאה, גדול — ידיים לצדדים, היה — קפיצה, פה — מצביעים על הרצפה.'],
]

const CALM = [
  ['🎈', 'נשימת בלון', 'שואפים באף לאט וממלאים את הבטן כמו בלון (4 שניות), ונושפים לאט מהפה (4 שניות).'],
  ['🕯️', 'נושפים על נר', 'מרימים אצבע כמו נר, ונושפים עליה לאט לאט כדי שהלהבה רק תזוז — לא תכבה.'],
  ['🐱', 'מתיחת חתול', 'שלובים ידיים קדימה ומעגלים את הגב כמו חתול שמתמתח, ואז נעמדים ישר.'],
  ['✊', 'לוחצים ומשחררים', 'קופצים אגרופים חזק חזק… וסופרים 5. עכשיו משחררים ומרגישים איך הידיים רכות.'],
  ['🌳', 'עץ', 'עומדים יציב, ידיים למעלה כמו ענפים, ומתנדנדים לאט ברוח.'],
  ['🔢', 'ספירה לאחור', 'עוצמים עיניים וסופרים בלב לאט מ־10 עד 1. כשמגיעים ל־1 — פותחים עיניים ומחייכים.'],
  ['🐢', 'צב איטי', 'מורידים את הראש לאט לאט לחזה, ומרימים לאט. ואז לאט לימין ולשמאל.'],
  ['🤲', 'ידיים חמות', 'משפשפים כפות ידיים מהר עד שהן חמות, ומניחים אותן על העיניים הסגורות.'],
  ['🦋', 'חיבוק פרפר', 'משלבים ידיים על החזה, כפות על הכתפיים, ומקישים לאט ימין־שמאל כמו כנפי פרפר.'],
  ['👀', 'חמישה דברים', 'בשקט, בלי לדבר: מוצאים בעיניים 5 דברים כחולים בכיתה. מי מצא את כולם — מרים אגודל.'],
]

// [English instruction, Hebrew hint, emoji]
const ENGLISH = [
  ['Touch your nose!', 'געו באף', '👃'],
  ['Jump three times!', 'קפצו שלוש פעמים', '🦘'],
  ['Clap your hands!', 'מחאו כפיים', '👏'],
  ['Turn around!', 'הסתובבו', '🔄'],
  ['Stand on one leg!', 'עמדו על רגל אחת', '🦩'],
  ['Touch your toes!', 'געו בבהונות', '🦶'],
  ['Hands up!', 'ידיים למעלה', '🙌'],
  ['Touch your head, shoulders, knees and toes!', 'ראש, כתפיים, ברכיים ובהונות', '🙆'],
  ['Stamp your feet!', 'רקעו ברגליים', '🥁'],
  ['Wave goodbye!', 'נופפו לשלום', '👋'],
  ['Run in place!', 'רוצו במקום', '🏃'],
  ['Sit down… and stand up!', 'שבו… וקומו', '🪑'],
]

const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
const shuffle = (list, rand) => {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// Math in motion: the class answers with the body. Even answer → jump, odd → touch shoulders.
export function mathExercise(band, rand) {
  let a, b, op, answer
  const kind = rand()
  if (band === 'low') {
    if (kind < 0.5) { a = int(rand, 2, 12); b = int(rand, 1, 8); op = '+'; answer = a + b }
    else { answer = int(rand, 1, 10); b = int(rand, 1, 9); a = answer + b; op = '−' }
  } else if (band === 'mid') {
    if (kind < 0.6) { a = int(rand, 2, 10); b = int(rand, 2, 10); op = '×'; answer = a * b }
    else { a = int(rand, 20, 90); b = int(rand, 10, 60); op = '+'; answer = a + b }
  } else if (kind < 0.5) { a = int(rand, 11, 19); b = int(rand, 3, 9); op = '×'; answer = a * b }
  else { b = int(rand, 3, 12); answer = int(rand, 4, 15); a = b * answer; op = '÷' }
  return { text: `${a} ${op} ${b}`, answer, even: answer % 2 === 0 }
}

export const MATH_RULE = 'תשובה זוגית — קופצים 🦘 · תשובה אי־זוגית — נוגעים בכתפיים 🙆'

export function buildRoutine({ theme = 'sport', minutes = 3, band = 'mid' } = {}, rand = Math.random) {
  const len = LENGTHS.find(l => l.minutes === minutes) || LENGTHS[1]
  const count = Math.round((len.minutes * 60) / len.seconds)
  const seconds = len.seconds
  if (theme === 'math') {
    const seen = new Set(), steps = []
    for (let t = 0; steps.length < count && t < 200; t++) {
      const ex = mathExercise(band, rand)
      if (seen.has(ex.text)) continue
      seen.add(ex.text)
      steps.push({ kind: 'math', emoji: '🔢', title: ex.text + ' = ?', text: MATH_RULE, answer: ex.answer, even: ex.even, seconds })
    }
    return steps
  }
  if (theme === 'english') {
    return shuffle(ENGLISH, rand).slice(0, count).map(([en, he, emoji]) => ({ kind: 'english', emoji, title: en, text: he, seconds, ltr: true }))
  }
  const pool = theme === 'hanukkah' ? HANUKKAH : theme === 'calm' ? CALM : SPORT
  // Always end a sport/hanukkah routine with a calming breath so the class is ready to learn.
  const ending = theme === 'calm' ? null : CALM[0]
  const body = shuffle(pool, rand).slice(0, ending ? count - 1 : count)
  const steps = body.map(([emoji, title, text]) => ({ kind: 'move', emoji, title, text, seconds }))
  if (ending) steps.push({ kind: 'move', emoji: ending[0], title: 'ונרגעים: ' + ending[1], text: ending[2], seconds })
  return steps
}

// Same routine for everyone on the same day ("החימום של היום") — a stable seed from the date.
export function daySeed(date = new Date()) {
  const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate()
  return y * 10000 + m * 100 + d
}

export function seededRand(seed) {
  let s = seed >>> 0 || 1
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

// Hanukkah 2026: 25 Kislev = evening of Friday 4.12.2026, last day 12.12. The Hanukkah theme is
// suggested first from three weeks before until the end of the holiday.
export function suggestedTheme(date = new Date()) {
  const t = date.getTime()
  const from = new Date(2026, 10, 13).getTime(), to = new Date(2026, 11, 13).getTime()
  return t >= from && t < to ? 'hanukkah' : 'sport'
}

export const POOLS = { sport: SPORT, hanukkah: HANUKKAH, calm: CALM, english: ENGLISH }

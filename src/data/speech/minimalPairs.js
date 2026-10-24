// Hebrew minimal pairs for /speech/minimal-pairs — grouped by the sound contrast and the
// phonological process it is used for. Every word is a real, everyday Modern Hebrew word, and every
// pair differs by ONE SOUND as it is pronounced today (not by spelling): א/ע are both silent here
// (אָסוּר/עָצוּר), שׂ is /s/ (שֶׂה/תֵּה), ט = ת, כּ = ק and כ/ך = ח.
//
// Word: { w: plain text (no niqqud — it is also the audio key), e: emoji or null, say: niqqud for the
// device voice when the plain spelling is ambiguous, hint: a short meaning for the adult }.
// An emoji is given only when it clearly shows this meaning; a pair "has pictures" when both words do.
// In each pair, `a` has the first sound of the contrast's `sides`, `b` the second one.
// For the deletion processes, `a` is the full word and `b` the word without the sound/syllable.

export const PROCESSES = [
  { id: 'fronting', label: 'קדמה והסגה', short: 'קדמה',
    desc: 'צליל שנוצר מאחור בפה (ק, ג) מוחלף בצליל שנוצר מקדימה (ת, ד) — "תוף" במקום "קוף". ההחלפה ההפוכה (ת←ק) נקראת הסגה, ומתרגלים אותה עם אותם זוגות.' },
  { id: 'stopping', label: 'סתימה', short: 'סתימה',
    desc: 'צליל ממושך, שאפשר "למתוח" (ס, ש, צ, ח), מוחלף בצליל קצר ונעצר (ת, ט, ק) — "תוף" במקום "סוף", "קוף" במקום "חוף".' },
  { id: 'sibilants', label: 'החלפות בין ס, ש ו־צ', short: 'ס/ש/צ',
    desc: 'השורקים נרכשים אחרונים, ולכן החלפות ביניהם נפוצות — "סיר" במקום "שיר", "סבע" במקום "צבע".' },
  { id: 'liquids', label: 'ר ו־ל', short: 'ר/ל',
    desc: 'ר׳ מוחלפת לעיתים בל׳ או בי׳ — "חול" במקום "חור", "ים" במקום "רם". ר׳ ענבלית (מאחור בגרון) היא ההגייה הרגילה בעברית, ור׳ מתגלגלת היא מבטא לגיטימי — לא טעות.' },
  { id: 'voicing', label: 'קוליות (קולי / אטום)', short: 'קוליות',
    desc: 'צליל קולי (ג, ד, ב, ז — מיתרי הקול רוטטים) מוחלף בבן־הזוג האטום שלו (ק, ת, פ, ס) או להפך — "קול" במקום "גול".' },
  { id: 'final', label: 'השמטת עיצור סופי', short: 'עיצור סופי',
    desc: 'העיצור שבסוף המילה נבלע — "מי" במקום "מיץ", "חלה" במקום "חלב".' },
  { id: 'syllable', label: 'השמטת הברה', short: 'הברה',
    desc: 'הברה לא מוטעמת, בדרך כלל בתחילת המילה, נשמטת — "בא" במקום "אבא", "מים" במקום "שמים".' },
  { id: 'cluster', label: 'צמצום צרור עיצורים', short: 'צרור',
    desc: 'שני עיצורים צמודים בתחילת המילה הופכים לאחד — "לידה" במקום "גלידה", "לי" במקום "דלי".' },
]

// letters: the spellings each side's sound may have (checked by the data test).
export const CONTRASTS = [
  { id: 'k-t', process: 'fronting', label: 'ק / ת', sides: ['ק', 'ת'], letters: ['קכ', 'תט'] },
  { id: 'g-d', process: 'fronting', label: 'ג / ד', sides: ['ג', 'ד'], letters: ['ג', 'ד'] },
  { id: 's-t', process: 'stopping', label: 'ס / ת', sides: ['ס', 'ת'], letters: ['סש', 'תט'], note: 'גם ט׳ נשמעת כמו ת׳, ושׂ (שין שמאלית) נשמעת כמו ס׳.' },
  { id: 'sh-t', process: 'stopping', label: 'ש / ת', sides: ['ש', 'ת'], letters: ['ש', 'תט'] },
  { id: 'ts-t', process: 'stopping', label: 'צ / ת', sides: ['צ', 'ת'], letters: ['צץ', 'תט'], note: 'ט׳ נשמעת כמו ת׳.' },
  { id: 'x-k', process: 'stopping', label: 'ח / ק', sides: ['ח', 'ק'], letters: ['חכך', 'קכ'], note: 'כ׳ בלי דגש (ך) נשמעת כמו ח׳, וכּ׳ עם דגש — כמו ק׳.' },
  { id: 's-sh', process: 'sibilants', label: 'ס / ש', sides: ['ס', 'ש'], letters: ['ס', 'ש'] },
  { id: 'sh-ts', process: 'sibilants', label: 'ש / צ', sides: ['ש', 'צ'], letters: ['ש', 'צץ'] },
  { id: 's-ts', process: 'sibilants', label: 'ס / צ', sides: ['ס', 'צ'], letters: ['ס', 'צץ'] },
  { id: 'r-l', process: 'liquids', label: 'ר / ל', sides: ['ר', 'ל'], letters: ['ר', 'ל'] },
  { id: 'r-y', process: 'liquids', label: 'ר / י', sides: ['ר', 'י'], letters: ['ר', 'י'] },
  { id: 'g-k', process: 'voicing', label: 'ג / ק', sides: ['ג', 'ק'], letters: ['ג', 'קכ'] },
  { id: 'd-t', process: 'voicing', label: 'ד / ת', sides: ['ד', 'ת'], letters: ['ד', 'תט'] },
  { id: 'b-p', process: 'voicing', label: 'ב / פ', sides: ['ב', 'פ'], letters: ['ב', 'פף'], note: 'גם ב׳ רפה (v) מול פ׳ רפה (f), כמו צב / צף.' },
  { id: 'z-s', process: 'voicing', label: 'ז / ס', sides: ['ז', 'ס'], letters: ['ז', 'ס'] },
  { id: 'final', process: 'final', label: 'עיצור בסוף המילה', sides: ['עם צליל בסוף', 'בלי צליל בסוף'] },
  { id: 'syllable', process: 'syllable', label: 'הברה בתחילת המילה', sides: ['מילה ארוכה', 'מילה קצרה'] },
  { id: 'cluster', process: 'cluster', label: 'שני עיצורים בהתחלה', sides: ['שני צלילים בהתחלה', 'צליל אחד בהתחלה'] },
]

const w = (word, e = null, extra = {}) => ({ w: word, e, ...extra })
const P = (contrast, a, b) => ({ contrast, a, b })

const LIST = [
  // ק / ת — fronting (and backing the other way)
  P('k-t', w('קוף', '🐒'), w('תוף', '🥁')),
  P('k-t', w('כן'), w('תן', null, { hint: 'תן לי' })),
  P('k-t', w('קור', '🥶'), w('תור', null, { hint: 'עומדים בתור' })),
  // ג / ד
  P('g-d', w('גג', null, { hint: 'של בית' }), w('דג', '🐟')),
  P('g-d', w('גם'), w('דם', '🩸')),
  P('g-d', w('חג'), w('חד', null, { hint: 'כמו סכין' })),
  P('g-d', w('גיר', null, { hint: 'כותבים בו על לוח' }), w('דיר', null, { hint: 'מקום לכבשים' })),
  // ס / ת — stopping
  P('s-t', w('סוף'), w('תוף', '🥁')),
  P('s-t', w('סוס', '🐴'), w('טוס', null, { hint: 'כמו מטוס' })),
  P('s-t', w('סל', '🧺'), w('טל', null, { hint: 'טיפות בבוקר' })),
  P('s-t', w('שה', '🐑', { say: 'שֶׂה' }), w('תה', '🍵')),
  // ש / ת
  P('sh-t', w('שן', '🦷'), w('תן', null, { hint: 'תן לי' })),
  P('sh-t', w('שור', '🐂', { say: 'שׁוֹר' }), w('תור', null, { hint: 'עומדים בתור' })),
  // צ / ת
  P('ts-t', w('פיצה', '🍕'), w('פיתה', '🫓')),
  P('ts-t', w('עץ', '🌳'), w('עט', '🖊️', { say: 'עֵט' })),
  P('ts-t', w('צל', null, { hint: 'מתחת לעץ' }), w('תל', null, { hint: 'גבעה' })),
  // ח / ק
  P('x-k', w('חוף', '🏖️'), w('קוף', '🐒')),
  P('x-k', w('חור', '🕳️'), w('קור', '🥶')),
  P('x-k', w('חול'), w('קול', '🔊')),
  P('x-k', w('חם', '🥵'), w('קם')),
  P('x-k', w('רך', null, { say: 'רַךְ' }), w('רק')),
  P('x-k', w('חלה', null, { say: 'חַלָּה', hint: 'של שבת' }), w('כלה', '👰', { say: 'כַּלָּה' })),
  // ס / ש
  P('s-sh', w('סיר', '🍲'), w('שיר', '🎵')),
  P('s-sh', w('סער', '⛈️', { hint: 'סערה' }), w('שער', '🥅', { say: 'שַׁעַר', hint: 'של כדורגל' })),
  P('s-sh', w('סיפור', '📖'), w('שיפור')),
  P('s-sh', w('טוס', null, { hint: 'כמו מטוס' }), w('טוש', null, { hint: 'לציור' })),
  P('s-sh', w('אסיר'), w('עשיר')),
  P('s-sh', w('חסה', '🥬', { say: 'חַסָּה' }), w('חשה', null, { say: 'חָשָׁה', hint: 'הרגישה' })),
  P('s-sh', w('סקר'), w('שקר')),
  // ש / צ
  P('sh-ts', w('שבע', '7️⃣', { say: 'שֶׁבַע' }), w('צבע', '🎨')),
  P('sh-ts', w('שוק', null, { say: 'שׁוּק' }), w('צוק', null, { hint: 'סלע גבוה' })),
  // ס / צ
  P('s-ts', w('אסור', '🚫'), w('עצור', '🛑')),
  P('s-ts', w('מסע'), w('מצה')),
  P('s-ts', w('סער', '⛈️', { hint: 'סערה' }), w('צער', null, { hint: 'עצב' })),
  // ר / ל
  P('r-l', w('חור', '🕳️'), w('חול')),
  P('r-l', w('רוח', '🌬️'), w('לוח', null, { hint: 'בכיתה' })),
  P('r-l', w('קר', '🥶'), w('קל')),
  P('r-l', w('גר'), w('גל', '🌊')),
  P('r-l', w('רק'), w('לק', '💅')),
  P('r-l', w('פרח', '🌸'), w('פלח', null, { hint: 'של תפוז' })),
  // ר / י
  P('r-y', w('רם', null, { hint: 'בקול רם' }), w('ים')),
  P('r-y', w('אור', '💡'), w('אוי')),
  // ג / ק — voicing
  P('g-k', w('גול', '⚽'), w('קול', '🔊')),
  P('g-k', w('גמל', '🐪'), w('קמל', '🥀', { hint: 'הפרח קמל' })),
  P('g-k', w('גיר', null, { hint: 'כותבים בו על לוח' }), w('קיר', '🧱')),
  P('g-k', w('גל', '🌊'), w('קל')),
  P('g-k', w('דג', '🐟'), w('דק')),
  P('g-k', w('גר'), w('קר', '🥶')),
  // ד / ת
  P('d-t', w('דג', '🐟'), w('תג', '🏷️')),
  P('d-t', w('בד'), w('בת')),
  // ב / פ
  P('b-p', w('בנים'), w('פנים', '🙂')),
  P('b-p', w('בת'), w('פת', null, { hint: 'פת לחם' })),
  P('b-p', w('צב', '🐢'), w('צף', null, { hint: 'על המים' })),
  // ז / ס
  P('z-s', w('זוג'), w('סוג')),
  P('z-s', w('זבל'), w('סבל', null, { say: 'סֵבֶל' })),
  // final consonant deletion: full word → word without the last sound
  P('final', w('חלב', '🥛'), w('חלה', null, { say: 'חַלָּה', hint: 'של שבת' })),
  P('final', w('סוכר'), w('סוכה')),
  P('final', w('מיץ', '🧃'), w('מי')),
  P('final', w('כיס'), w('כי')),
  P('final', w('בוץ'), w('בוא')),
  P('final', w('תן'), w('תה', '🍵')),
  P('final', w('זר', '💐'), w('זה')),
  // weak syllable deletion
  P('syllable', w('שמים'), w('מים', '💧')),
  P('syllable', w('אבא'), w('בא')),
  P('syllable', w('אגם'), w('גם')),
  P('syllable', w('אדום', '🔴'), w('דום', null, { hint: 'עומדים דום' })),
  // cluster reduction
  P('cluster', w('גלידה', '🍦'), w('לידה', null, { hint: 'של תינוק' })),
  P('cluster', w('דלי', '🪣'), w('לי')),
  P('cluster', w('בלי'), w('לי')),
  P('cluster', w('שמונה', '8️⃣'), w('מונה', null, { hint: 'סופר' })),
]

export const PAIRS = LIST.map((p, i) => ({ ...p, id: `${p.contrast}-${i + 1}`, pictured: !!(p.a.e && p.b.e) }))

export const contrastById = Object.fromEntries(CONTRASTS.map(c => [c.id, c]))
export const processById = Object.fromEntries(PROCESSES.map(p => [p.id, p]))
export const pairsFor = ids => PAIRS.filter(p => ids.includes(p.contrast))

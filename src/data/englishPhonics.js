// Data for /learn/english-phonics — learning to read English from zero (phonics) for grades 2–5,
// with Hebrew instructions. Six stages: letter sounds, short vowels, blending CVC words,
// letter teams (digraphs), sight words and first sentences. Every stage has an on-screen practice
// (built by `practiceFor`) and a printable worksheet with answers (built by `worksheetFor`).

export const PHONICS_PATH = '/learn/english-phonics'

// One key word per letter. `he` is a Hebrew hint for the sound (not the letter name).
export const LETTERS = [
  { l: 'a', word: 'apple', emoji: '🍎', he: 'אֶ פתוחה, בין אֶ לאַ', heWord: 'תפוח' },
  { l: 'b', word: 'bus', emoji: '🚌', he: 'בּ', heWord: 'אוטובוס' },
  { l: 'c', word: 'cat', emoji: '🐱', he: 'ק (לפני e, i, y — ס)', heWord: 'חתול' },
  { l: 'd', word: 'dog', emoji: '🐶', he: 'ד', heWord: 'כלב' },
  { l: 'e', word: 'egg', emoji: '🥚', he: 'אֶ', heWord: 'ביצה' },
  { l: 'f', word: 'fish', emoji: '🐟', he: 'פ (רפה)', heWord: 'דג' },
  { l: 'g', word: 'goat', emoji: '🐐', he: 'ג', heWord: 'עז' },
  { l: 'h', word: 'hat', emoji: '🎩', he: 'ה, נשיפה קלה', heWord: 'כובע' },
  { l: 'i', word: 'insect', emoji: '🐞', he: 'אִ קצרה', heWord: 'חרק' },
  { l: 'j', word: 'juice', emoji: '🧃', he: 'ג׳', heWord: 'מיץ' },
  { l: 'k', word: 'key', emoji: '🔑', he: 'ק', heWord: 'מפתח' },
  { l: 'l', word: 'lion', emoji: '🦁', he: 'ל', heWord: 'אריה' },
  { l: 'm', word: 'moon', emoji: '🌙', he: 'מ', heWord: 'ירח' },
  { l: 'n', word: 'nose', emoji: '👃', he: 'נ', heWord: 'אף' },
  { l: 'o', word: 'octopus', emoji: '🐙', he: 'אוֹ קצרה ופתוחה, קרובה לאָ', heWord: 'תמנון' },
  { l: 'p', word: 'pig', emoji: '🐷', he: 'פּ', heWord: 'חזיר' },
  { l: 'q', word: 'queen', emoji: '👸', he: 'קוו (כמעט תמיד qu)', heWord: 'מלכה' },
  { l: 'r', word: 'rabbit', emoji: '🐰', he: 'ר אנגלית: הלשון לא נוגעת', heWord: 'ארנב' },
  { l: 's', word: 'sun', emoji: '☀️', he: 'ס', heWord: 'שמש' },
  { l: 't', word: 'tent', emoji: '⛺', he: 'ט / ת', heWord: 'אוהל' },
  { l: 'u', word: 'umbrella', emoji: '☂️', he: 'אַ קצרה', heWord: 'מטרייה' },
  { l: 'v', word: 'van', emoji: '🚐', he: 'ו, כמו בווילון', heWord: 'טנדר' },
  { l: 'w', word: 'watermelon', emoji: '🍉', he: 'וו, בשפתיים עגולות', heWord: 'אבטיח' },
  { l: 'x', word: 'fox', emoji: '🦊', he: 'קס (בדרך כלל בסוף מילה)', heWord: 'שועל' },
  { l: 'y', word: 'yo-yo', emoji: '🪀', he: 'י', heWord: 'יו־יו' },
  { l: 'z', word: 'zebra', emoji: '🦓', he: 'ז', heWord: 'זברה' },
]

export const VOWELS = [
  { v: 'a', he: 'אֶ פתוחה', example: 'cat' },
  { v: 'e', he: 'אֶ', example: 'bed' },
  { v: 'i', he: 'אִ קצרה', example: 'pig' },
  { v: 'o', he: 'אוֹ קצרה', example: 'dog' },
  { v: 'u', he: 'אַ קצרה', example: 'sun' },
]

// Short-vowel words (consonant–vowel–consonant), five per vowel.
export const CVC = [
  { word: 'cat', emoji: '🐱', he: 'חתול' }, { word: 'hat', emoji: '🎩', he: 'כובע' }, { word: 'map', emoji: '🗺️', he: 'מפה' }, { word: 'bag', emoji: '👜', he: 'תיק' }, { word: 'van', emoji: '🚐', he: 'טנדר' },
  { word: 'bed', emoji: '🛏️', he: 'מיטה' }, { word: 'hen', emoji: '🐔', he: 'תרנגולת' }, { word: 'pen', emoji: '🖊️', he: 'עט' }, { word: 'net', emoji: '🥅', he: 'רשת' }, { word: 'leg', emoji: '🦵', he: 'רגל' },
  { word: 'pig', emoji: '🐷', he: 'חזיר' }, { word: 'six', emoji: '6️⃣', he: 'שש' }, { word: 'pin', emoji: '📌', he: 'נעץ' }, { word: 'lip', emoji: '👄', he: 'שפה' }, { word: 'bin', emoji: '🗑️', he: 'פח' },
  { word: 'dog', emoji: '🐶', he: 'כלב' }, { word: 'fox', emoji: '🦊', he: 'שועל' }, { word: 'box', emoji: '📦', he: 'קופסה' }, { word: 'pot', emoji: '🍲', he: 'סיר' }, { word: 'log', emoji: '🪵', he: 'בול עץ' },
  { word: 'sun', emoji: '☀️', he: 'שמש' }, { word: 'bus', emoji: '🚌', he: 'אוטובוס' }, { word: 'cup', emoji: '☕', he: 'כוס' }, { word: 'bug', emoji: '🐛', he: 'חרק' }, { word: 'nut', emoji: '🥜', he: 'אגוז' },
]
export const vowelOf = w => w.word[1]

// Letter teams: two letters, one sound.
export const DIGRAPHS = [
  { dg: 'sh', he: 'ש', words: [{ word: 'ship', emoji: '🚢', he: 'ספינה' }, { word: 'fish', emoji: '🐟', he: 'דג' }, { word: 'shell', emoji: '🐚', he: 'צדף' }] },
  { dg: 'ch', he: 'צ׳', words: [{ word: 'chick', emoji: '🐥', he: 'אפרוח' }, { word: 'chips', emoji: '🍟', he: 'צ׳יפס' }, { word: 'chess', emoji: '♟️', he: 'שחמט' }] },
  { dg: 'th', he: 'ת׳ — קצה הלשון בין השיניים', words: [{ word: 'bath', emoji: '🛁', he: 'אמבטיה' }, { word: 'three', emoji: '3️⃣', he: 'שלוש' }] },
  { dg: 'ck', he: 'ק (בסוף מילה קצרה)', words: [{ word: 'duck', emoji: '🦆', he: 'ברווז' }, { word: 'sock', emoji: '🧦', he: 'גרב' }, { word: 'rock', emoji: '🪨', he: 'סלע' }] },
  { dg: 'ng', he: 'נג באף, בלי ג׳ חזקה', words: [{ word: 'ring', emoji: '💍', he: 'טבעת' }, { word: 'king', emoji: '👑', he: 'מלך' }] },
  { dg: 'ee', he: 'אִי ארוכה', words: [{ word: 'bee', emoji: '🐝', he: 'דבורה' }, { word: 'tree', emoji: '🌳', he: 'עץ' }, { word: 'feet', emoji: '🦶', he: 'כפות רגליים' }, { word: 'sheep', emoji: '🐑', he: 'כבשה' }] },
]
// Where the team sits in the word, for "fill the gap" questions. `three` and `sheep` hold two teams;
// each question asks about one team only, so the gap is the first place it appears.
export const DIGRAPH_WORDS = DIGRAPHS.flatMap(d => d.words.map(w => ({ ...w, dg: d.dg })))
export const gapWord = w => { const i = w.word.indexOf(w.dg); return w.word.slice(0, i) + '__' + w.word.slice(i + w.dg.length) }

// High-frequency words. `tricky`: can't be sounded out letter by letter — learned by sight.
export const SIGHT_WORDS = [
  { w: 'I', he: 'אני', ex: 'I see a cat.' },
  { w: 'a', he: '(מילה לפני שם עצם אחד)', ex: 'a dog', noQuiz: true },
  { w: 'the', he: 'ה־ (הידיעה)', ex: 'the sun', tricky: true, noQuiz: true },
  { w: 'is', he: '(מחבר: זה/הוא/היא…)', ex: 'It is big.', noQuiz: true },
  { w: 'and', he: 'וְ־ / וגם', ex: 'a cat and a dog' },
  { w: 'in', he: 'בתוך', ex: 'in the box' },
  { w: 'on', he: 'על', ex: 'on the bed' },
  { w: 'it', he: 'זה / זאת', ex: 'It is red.' },
  { w: 'my', he: 'שלי', ex: 'my hat', tricky: true },
  { w: 'you', he: 'אתה / את / אתם', ex: 'I see you.', tricky: true },
  { w: 'he', he: 'הוא', ex: 'He is six.', tricky: true },
  { w: 'she', he: 'היא', ex: 'She has a pen.', tricky: true },
  { w: 'we', he: 'אנחנו', ex: 'We can run.', tricky: true },
  { w: 'they', he: 'הם / הן', ex: 'They are big.', tricky: true },
  { w: 'can', he: 'יכול / יכולה', ex: 'I can hop.' },
  { w: 'see', he: 'רואה', ex: 'I see the moon.' },
  { w: 'like', he: 'אוהב / אוהבת', ex: 'I like fish.' },
  { w: 'go', he: 'הולך / נוסע', ex: 'We go to the park.', tricky: true },
  { w: 'to', he: 'אל / ל־', ex: 'to the bus', tricky: true },
  { w: 'no', he: 'לא', ex: 'No, it is not.', tricky: true },
  { w: 'yes', he: 'כן', ex: 'Yes, it is!' },
  { w: 'look', he: 'תסתכלו', ex: 'Look at the duck!' },
  { w: 'big', he: 'גדול', ex: 'a big dog' },
  { w: 'said', he: 'אמר / אמרה', ex: '"Hi!" said Dan.', tricky: true },
  { w: 'was', he: 'היה / הייתה', ex: 'It was hot.', tricky: true },
  { w: 'have', he: 'יש לי / יש לנו', ex: 'I have a bag.', tricky: true },
]

// First sentences: only short-vowel words, letter teams and the sight words above.
// `pics[0]` is the right picture; the others differ in one detail.
export const SENTENCES = [
  { en: 'The cat is on the bed.', he: 'החתול על המיטה.', pics: ['🐱 🛏️', '🐶 🛏️', '🐱 📦'] },
  { en: 'A dog is in the box.', he: 'כלב בתוך הקופסה.', pics: ['🐶 📦', '🦊 📦', '🐶 🛏️'] },
  { en: 'I see a bus and the sun.', he: 'אני רואה אוטובוס ואת השמש.', pics: ['🚌 ☀️', '🚌 🌙', '🚐 ☀️'] },
  { en: 'The fox is in the log.', he: 'השועל בתוך בול העץ.', pics: ['🦊 🪵', '🐶 🪵', '🦊 📦'] },
  { en: 'A pig and a hen.', he: 'חזיר ותרנגולת.', pics: ['🐷 🐔', '🐷 🐶', '🐱 🐔'] },
  { en: 'I have a hat and a bag.', he: 'יש לי כובע ותיק.', pics: ['🎩 👜', '🎩 📦', '🧢 👜'] },
  { en: 'The bug is on the cup.', he: 'החרק על הכוס.', pics: ['🐛 ☕', '🐛 🥜', '🐝 ☕'] },
  { en: 'The fish is in the net.', he: 'הדג ברשת.', pics: ['🐟 🥅', '🐟 🛁', '🦆 🥅'] },
  { en: 'Look! A duck and a sheep.', he: 'תסתכלו! ברווז וכבשה.', pics: ['🦆 🐑', '🦆 🐐', '🐔 🐑'] },
  { en: 'A bee is on the tree.', he: 'דבורה על העץ.', pics: ['🐝 🌳', '🐛 🌳', '🐝 🚢'] },
  { en: 'My sock is in the bath.', he: 'הגרב שלי באמבטיה.', pics: ['🧦 🛁', '🧦 📦', '🦆 🛁'] },
  { en: 'The king has a big ring.', he: 'למלך יש טבעת גדולה.', pics: ['👑 💍', '👑 🐚', '👸 🔑'] },
]

export const STAGES = [
  { id: 'letters', n: 1, emoji: '🔤', title: 'צלילי האותיות', en: 'Letter sounds',
    goal: 'מכירים את הצליל של כל אות, לא רק את השם שלה: b אומרים "בּ", לא "בִּי".',
    how: 'עוברים על 3–4 אותיות ביום. אומרים את הצליל, את המילה ומחפשים בבית עוד דברים שמתחילים באותו צליל.' },
  { id: 'vowels', n: 2, emoji: '🅰️', title: 'חמש התנועות הקצרות', en: 'Short vowels',
    goal: 'מבחינים בין a, e, i, o, u באמצע מילה קצרה: cat, bed, pig, dog, sun.',
    how: 'זה השלב הכי קשה לדוברי עברית, כי ל־a ול־e צליל דומה באוזן שלנו. מגזימים בפה: a בפה פתוח ורחב, e בחיוך קטן.' },
  { id: 'blend', n: 3, emoji: '🧩', title: 'מחברים צלילים למילה', en: 'Blending CVC words',
    goal: 'קוראים מילה של שלוש אותיות: אומרים כל צליל ומחברים — c…a…t → cat.',
    how: 'מחליקים את האצבע מתחת למילה, משמאל לימין, ואומרים את הצלילים לאט ואז מהר יותר, עד שהם נדבקים.' },
  { id: 'teams', n: 4, emoji: '👯', title: 'צמדי אותיות', en: 'Letter teams',
    goal: 'מזהים שתי אותיות שיוצרות צליל אחד: sh, ch, th, ck, ng ו־ee.',
    how: 'מסמנים את הצמד בצבע לפני שקוראים. כך הילד רואה שזה "צליל אחד" ולא שניים.' },
  { id: 'sight', n: 5, emoji: '👀', title: 'מילים נפוצות', en: 'Sight words',
    goal: 'מזהים במבט את המילים שחוזרות בכל משפט: the, I, is, you, said…',
    how: 'חלק מהמילים לא נקראות לפי הכללים (said, was, the). אותן לומדים כמו תמונה: 3–5 מילים בשבוע, בכרטיסיות.' },
  { id: 'sentences', n: 6, emoji: '📗', title: 'משפטים ראשונים', en: 'First sentences',
    goal: 'קוראים משפט קצר שלם ומבינים אותו.',
    how: 'קוראים את המשפט פעמיים: פעם לפענח, פעם בקצב רגיל. אחר כך שואלים: מה ראית בראש?' },
]

export const FAQ = [
  { q: 'מה זה פוניקס?', a: 'פוניקס (Phonics) היא שיטה ללימוד קריאה שבה מלמדים את הצליל של כל אות ואיך מחברים צלילים למילה. במקום לזכור כל מילה בעל פה, הילד יכול לפענח מילה חדשה בעצמו. רוב השיטות לקריאה באנגלית בבתי הספר בארץ ובעולם בנויות על העיקרון הזה.' },
  { q: 'מאיזה גיל מתחילים ללמוד לקרוא באנגלית?', a: 'רצוי שהילד כבר קורא עברית בביטחון, בדרך כלל מכיתה ב׳. בבתי ספר רבים בארץ מתחילים קריאה באנגלית בכיתה ג׳, ויש ילדים שמגיעים לכיתות ד׳–ה׳ עדיין בלי בסיס. המסלול כאן מתאים לכל אחד מהם, כי הוא מתחיל מאפס.' },
  { q: 'כמה זמן ביום כדאי לתרגל?', a: '10–15 דקות ביום עדיפות על שעה פעם בשבוע. שלב אחד לוקח בדרך כלל שבוע עד שלושה שבועות, תלוי בילד. עוברים לשלב הבא כשהתרגול על המסך עובר בלי כמעט טעויות.' },
  { q: 'למה ללמד את הצליל ולא את שם האות?', a: 'שם האות (בִּי, סִי, דִי) לא עוזר לקרוא: אם מחברים "סי־איי־טי" לא מקבלים cat. מחברים צלילים — ק־אֶ־ט — ומקבלים את המילה. את השמות לומדים לצד זה, בשיר ה־ABC.' },
  { q: 'מה עושים עם מילים שלא נקראות לפי הכללים?', a: 'מילים כמו the, said, was ו־you נקראות "מילים נפוצות" (sight words) או "מילים מכשילות". לומדים אותן בהדרגה, כמה בשבוע, בעזרת כרטיסיות וקריאה חוזרת, עד שמזהים אותן במבט.' },
  { q: 'צריך שמע כדי להשתמש בדף?', a: 'לא חייבים. בכל תרגיל יש תמונה ורמז בעברית, כך שאפשר לתרגל גם בלי רמקול. עם רמקול לוחצים על 🔊 ושומעים את המילה באנגלית. בחלק מהמחשבים צריך להתקין קול באנגלית בהגדרות.' },
  { q: 'הכול בחינם?', a: 'כן. התרגול על המסך ודפי העבודה להדפסה בחינם ובלי הרשמה.' },
]

export const PARENT_TIPS = [
  { emoji: '⏱️', title: 'קצר וכל יום', text: '10–15 דקות, בשעה קבועה. עדיף לעצור כשעוד כיף, מאשר לגרור עד שנמאס.' },
  { emoji: '👄', title: 'הצליל, לא השם', text: 'כשמראים את b אומרים "בּ" קצר, בלי "אֶה" בסוף ("בְּ", לא "בֶּה"). צליל נקי מקל על החיבור.' },
  { emoji: '👉', title: 'אצבע משמאל לימין', text: 'באנגלית קוראים משמאל לימין, וזה חדש לילד שקורא עברית. אצבע מתחת למילה עוזרת לכיוון.' },
  { emoji: '🎯', title: 'ההבדל בין a ל־e', text: 'זו הטעות הכי נפוצה אצל ילדים ישראלים (bad מול bed). תרגלו זוגות: pan/pen, man/men, bag/beg.' },
  { emoji: '📚', title: 'קוראים יחד גם בלי לפענח', text: 'מעבר לתרגול, קראו לילד ספרים פשוטים באנגלית והצביעו על המילים. האוזן לומדת לפני העין.' },
  { emoji: '🌟', title: 'מחמיאים על המאמץ', text: '"ראיתי שחיברת את הצלילים לבד" שווה יותר מ"אתה חכם". טעויות הן חלק מהדרך.' },
]

// ---------- practice ----------
// A tiny seeded random generator, so the same seed gives the same set (handy for tests and print).
export function rng(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
export function shuffle(list, rand) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
// `n - 1` distinct wrong picks from `pool` (by key), plus the right one, shuffled.
function choices(right, pool, key, n, rand) {
  const wrong = shuffle(pool.filter(p => key(p) !== key(right)), rand)
  const seen = new Set([key(right)]), out = [right]
  for (const w of wrong) { if (out.length >= n) break; if (!seen.has(key(w))) { seen.add(key(w)); out.push(w) } }
  return shuffle(out, rand)
}

// A question: { prompt: { emoji?, big?, he?, say? }, options: [{ t, emoji? }], answer, explain }.
// `say` is the English text the 🔊 button reads.
export function practiceFor(stageId, seed = 1, count = 10) {
  const rand = rng(seed * 97 + stageId.length * 13)
  const pick = list => shuffle(list, rand).slice(0, count)
  const q = (prompt, opts, rightKey, explain) => ({ prompt, options: opts, answer: opts.findIndex(o => o.t === rightKey), explain })
  if (stageId === 'letters') return pick(LETTERS).map(x => {
    const opts = choices(x, LETTERS, y => y.l, 3, rand).map(y => ({ t: y.l }))
    return q({ emoji: x.emoji, he: `${x.heWord} — באיזו אות מתחילה המילה?`, say: x.word }, opts, x.l, `${x.word} מתחילה ב־${x.l}. הצליל: ${x.he}.`)
  })
  if (stageId === 'vowels') return pick(CVC).map(x => {
    const opts = VOWELS.map(v => ({ t: v.v }))
    return q({ emoji: x.emoji, big: `${x.word[0]} _ ${x.word[2]}`, he: `${x.he} — איזו תנועה חסרה?`, say: x.word }, opts, vowelOf(x), `${x.word}: התנועה ${vowelOf(x)} — ${VOWELS.find(v => v.v === vowelOf(x)).he}.`)
  })
  if (stageId === 'blend') return pick(CVC).map(x => {
    const opts = choices(x, CVC, y => y.word, 3, rand).map(y => ({ t: y.word, emoji: y.emoji }))
    return q({ big: x.word.split('').join(' · '), he: 'חברו את הצלילים. איזו תמונה זו?', say: x.word }, opts, x.word, `${x.word.split('').join('…')} → ${x.word} (${x.he}).`)
  })
  if (stageId === 'teams') return pick(DIGRAPH_WORDS).map(x => {
    const opts = choices({ dg: x.dg }, DIGRAPHS, y => y.dg, 3, rand).map(y => ({ t: y.dg }))
    return q({ emoji: x.emoji, big: gapWord(x), he: `${x.he} — איזה צמד חסר?`, say: x.word }, opts, x.dg, `${x.word}: הצמד ${x.dg} — ${DIGRAPHS.find(d => d.dg === x.dg).he}.`)
  })
  if (stageId === 'sight') {
    const quiz = SIGHT_WORDS.filter(s => !s.noQuiz)
    return pick(quiz).map(x => {
      const opts = choices(x, quiz, y => y.w, 3, rand).map(y => ({ t: y.w }))
      return q({ he: `איך כותבים באנגלית "${x.he}"?`, say: x.w }, opts, x.w, `${x.w} = ${x.he}. לדוגמה: ${x.ex}`)
    })
  }
  if (stageId === 'sentences') return pick(SENTENCES).map(x => {
    const opts = shuffle(x.pics, rand).map(p => ({ t: p, emoji: p }))
    return q({ big: x.en, he: 'קראו את המשפט. איזו תמונה מתאימה?', say: x.en }, opts, x.pics[0], `${x.en} = ${x.he}`)
  })
  return []
}

// ---------- printable worksheets ----------
// Fixed (seeded) content per stage: { items, bank? }; each item has `answer` for the answer page.
export function worksheetFor(stageId, set = 0) {
  const rand = rng(1000 + set * 31 + stageId.length)
  if (stageId === 'letters') return { items: shuffle(LETTERS, rand).slice(0, 12).map(x => ({ emoji: x.emoji, he: x.heWord, word: x.word, answer: x.l })) }
  if (stageId === 'vowels') return { bank: VOWELS.map(v => v.v), items: shuffle(CVC, rand).slice(0, 15).map(x => ({ emoji: x.emoji, gap: `${x.word[0]} __ ${x.word[2]}`, answer: vowelOf(x), word: x.word })) }
  if (stageId === 'blend') return { items: shuffle(CVC, rand).slice(0, 10).map(x => ({ emoji: x.emoji, options: choices(x, CVC, y => y.word, 3, rand).map(y => y.word), answer: x.word })) }
  if (stageId === 'teams') return { bank: DIGRAPHS.map(d => d.dg), items: shuffle(DIGRAPH_WORDS, rand).slice(0, 12).map(x => ({ emoji: x.emoji, gap: gapWord(x), answer: x.dg, word: x.word })) }
  if (stageId === 'sight') {
    const quiz = shuffle(SIGHT_WORDS.filter(s => !s.noQuiz), rand).slice(0, 8)
    return { read: SIGHT_WORDS.map(s => s.w), left: quiz.map(s => s.w), right: shuffle(quiz, rand).map(s => s.he), items: quiz.map(s => ({ answer: `${s.w} = ${s.he}` })) }
  }
  if (stageId === 'sentences') return { items: shuffle(SENTENCES, rand).slice(0, 8).map(x => ({ en: x.en, pics: shuffle(x.pics, rand), answer: x.pics[0], he: x.he })) }
  return { items: [] }
}

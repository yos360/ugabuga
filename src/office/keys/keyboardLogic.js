// /tools/keyboard-fix — text typed with the wrong keyboard layout (Israeli SI-1452 ⇄ US QWERTY).
// Pure logic: key maps, per-word language scoring and the auto / forced conversion.

// Key on a US keyboard → what the same key types in the Hebrew layout.
export const EN_TO_HE = {
  q: '/', w: "'", e: 'ק', r: 'ר', t: 'א', y: 'ט', u: 'ו', i: 'ן', o: 'ם', p: 'פ',
  a: 'ש', s: 'ד', d: 'ג', f: 'כ', g: 'ע', h: 'י', j: 'ח', k: 'ל', l: 'ך', ';': 'ף', "'": ',',
  z: 'ז', x: 'ס', c: 'ב', v: 'ה', b: 'נ', n: 'מ', m: 'צ', ',': 'ת', '.': 'ץ', '/': '.', '`': ';',
}
export const HE_TO_EN = Object.fromEntries(Object.entries(EN_TO_HE).map(([k, v]) => [v, k]))

const HE_LETTER = /[א-ת]/
const EN_LETTER = /[A-Za-z]/
const FINALS = 'ךםןףץ'
const NON_FINAL_OF = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }

/** Plain key-by-key mapping of a whole string (no smart rules). */
export function mapChars(str, dir) {
  let out = ''
  for (const ch of str) {
    if (dir === 'toHe') out += EN_TO_HE[ch.toLowerCase()] ?? ch
    else out += HE_TO_EN[ch] ?? ch
  }
  return out
}

// ── word lists (also used to train the small letter-pair models) ──
const HE_WORDS = `אני אתה את הוא היא אנחנו אתם אתן הם הן זה זאת זו אלה אלו של על עם אל מן מה מי איך למה מתי איפה כמה לא כן גם רק עוד כל כבר אבל או אם כי כמו יש אין היה הייתה היו יהיה להיות היום מחר אתמול עכשיו פה שם כאן טוב טובה רע רעה גדול גדולה קטן קטנה חדש חדשה ישן הרבה מעט יותר פחות מאוד שלום תודה בבקשה סליחה בוקר ערב לילה צהריים יום ימים שבוע חודש שנה שנים שעה דקה זמן בית ספר ילד ילדה ילדים אבא אמא אח אחות משפחה חבר חברה חברים אוכל מים לחם עבודה כסף דבר דברים אדם אנשים איש אישה נשים עולם ארץ ישראל עיר רחוב דרך מקום שאלה תשובה אחד אחת שתיים שניים שתי שני שלוש שלושה ארבע חמש שש שבע שמונה תשע עשר עשרה מאה אלף ראשון שלישי רוצה רוצים צריך צריכה צריכים יכול יכולה יכולים יודע יודעת אוהב אוהבת אוהבים חושב חושבת עושה עושים הולך הולכת הולכים בא באה אומר אומרת רואה שומע כותב כותבת קורא קוראת לומד לומדת לומדים מדבר מדברת אכל שתה הלך אמר עשה ראה נתן לקח שלח קיבל מבין מבינה תן תני בוא בואי לך לי לו לה לנו לכם להם אותי אותך אותו אותה אותנו שלי שלך שלו שלה שלנו שלכם שלהם בי בך בו בה בנו אצל עד אחרי לפני בין תחת מעל ליד בגלל בשביל כדי אז אולי בטח באמת ממש סתם נכון בסדר יפה חמוד מצחיק כיף חג שמח שמחה הולדת יומולדת מזל אהבה לב ראש יד רגל עין עיניים פנים שולחן כיסא דלת חלון מחשב טלפון הודעה הודעות מייל אתר מילה מילים משפט טקסט מקלדת עברית אנגלית שפה תיקון לחיצה הלחיצה מסתיר כתב כתבתי אמרתי הלכתי עשיתי ראיתי רציתי חשבתי נשמע קורה סבא סבתא מורה מורים כיתה שיעור מבחן משחק משחקים ספרים סיפור תמונה צבע אדום כחול ירוק צהוב לבן שחור כלב חתול ציפור מכונית אוטובוס רכבת ים שמש ירח כוכב גשם קר חם שבת יופי נהדר מעולה מצוין אחלה סבבה יאללה כנראה חייב חייבת אפשר אסור מותר יחד לבד שוב תמיד פעם לפעמים קצת בערך הכל הכול שום כלום משהו מישהו כולם מתמטיקה ללמוד לעשות לראות לדעת לכתוב לקרוא לשחק לאכול לבוא ללכת לתת לקחת לשלוח מספר מספרים תרגיל תרגילים שיעורי מחברת עט עיפרון גן גננת הורים אחים בן בת בנים בנות מלך מלכה יער פרח עץ עצים בבית בגן לבית הביתה מהבית ערוץ תוכנית סרט שיר שירים חדר מטבח אמבטיה בוקרטוב ערבטוב לילהטוב נו אוקיי רגע מחכה מחכים מגיע מגיעה מתי הבא הבאה אתמול שלומך שלומכם שלומי מצב ממש לגמרי בדיוק אחר אחרת ביחד חושבת הבנתי יודעים מכיר מכירה זוכר זוכרת שכחתי מצטער מצטערת תודהרבה רבה רבים רבות מספיק עדיין כבר אפילו בלי בתוך מחוץ למעלה למטה ימינה שמאלה קדימה אחורה שאני שאתה שהוא שהיא שזה ושל וגם`
const EN_WORDS = `the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were been has had did does said says made went got am being very much more many such here where why yes ok okay hello hi hey thanks thank please sorry love like dog cat home school friend friends family mother father mom dad baby kid kids boy girl man woman world life hand eye head house water food book books game games play phone email text word words name number again still never always every something nothing everything anything someone nobody right left little big small great old young long short high low best better last next same different few each both own should must may might need feel try ask tell call keep let put mean seem leave turn start show hear run move live believe bring happen write sit stand lose pay meet include continue set learn change lead understand watch follow stop create speak read allow add spend grow open walk win offer remember consider appear buy wait serve die send expect build stay fall cut reach kill remain jump quick brown fox lazy over today tomorrow yesterday morning night week month city country street car bus train sun moon star rain cold hot red blue green yellow white black happy birthday party cake fun nice cool yeah wow what's it's i'm don't can't won't didn't isn't that's you're let's keyboard hebrew english language fix help test check computer website page site link free online calculator math school class teacher lesson homework student students question answer problem easy hard true false yes`

function buildModel(text) {
  const bi = new Map(); const uni = new Map(); const chars = new Set()
  for (const w of text.split(/\s+/).filter(Boolean)) {
    let prev = '^'
    for (const ch of w + '$') {
      bi.set(prev + ch, (bi.get(prev + ch) || 0) + 1)
      uni.set(prev, (uni.get(prev) || 0) + 1)
      chars.add(ch); prev = ch
    }
  }
  return { bi, uni, V: chars.size + 1 }
}
const HE_MODEL = buildModel(HE_WORDS)
const EN_MODEL = buildModel(EN_WORDS.replace(/'/g, ''))
const HE_SET = new Set(HE_WORDS.split(/\s+/))
const EN_SET = new Set(EN_WORDS.split(/\s+/))

function lm(word, m) {
  let s = 0; let prev = '^'
  for (const ch of word + '$') {
    s += Math.log((m.bi.get(prev + ch) || 0) + 0.3) - Math.log((m.uni.get(prev) || 0) + 0.3 * m.V)
    prev = ch
  }
  return s / (word.length + 1)
}

const HE_PREFIXES = ['ו', 'ה', 'ב', 'ל', 'מ', 'ש', 'כ', 'וה', 'וב', 'ול', 'ומ', 'וש', 'שה', 'מה', 'כש', 'לה', 'בה', 'שב', 'של', 'וכ']
function heDict(w) {
  if (HE_SET.has(w)) return 3
  for (const p of HE_PREFIXES) if (w.length - p.length >= 2 && w.startsWith(p) && HE_SET.has(w.slice(p.length))) return 2.5
  return 0
}
function enDict(w) {
  if (EN_SET.has(w)) return 3
  for (const suf of ['s', 'es', 'ed', 'd', 'ing', 'ly', "'s", 'er', 'ers', 'y']) {
    const base = w.slice(0, -suf.length)
    if (w.endsWith(suf) && base.length >= 2 && (EN_SET.has(base) || EN_SET.has(base + 'e'))) return 2.5
  }
  return 0
}

// Trim non-letters at both ends; count the ones left inside.
function lettersOnly(w, isLetter) {
  let a = 0; let b = w.length
  while (a < b && !isLetter(w[a])) a++
  while (b > a && !isLetter(w[b - 1])) b--
  return w.slice(a, b)
}

/** How much a string looks like a Hebrew word (higher is better, roughly −8…+2). */
export function scoreHebrew(word) {
  const w = lettersOnly(word, c => HE_LETTER.test(c))
  if (!w) return -9
  let s = lm(w.replace(/[^א-ת]/g, ''), HE_MODEL)
  for (let i = 0; i < w.length; i++) {
    const c = w[i]
    if (FINALS.includes(c) && i < w.length - 1) s -= 3
    else if (!HE_LETTER.test(c) && !(c === "'" && 'גזצתץ'.includes(w[i - 1])) && c !== '"') s -= 2.5
  }
  const last = w[w.length - 1]
  if (w.length > 1 && Object.values(NON_FINAL_OF).includes(last)) s -= 1.5
  if (w.length === 1) s -= 1
  return s + heDict(w)
}

/** How much a string looks like an English word. */
export function scoreEnglish(word) {
  const w = lettersOnly(word.toLowerCase(), c => /[a-z]/.test(c))
  if (!w) return -9
  let s = lm(w.replace(/[^a-z]/g, ''), EN_MODEL)
  for (const c of w) if (!/[a-z]/.test(c) && c !== "'") s -= 3
  if (w.length >= 2 && !/[aeiouy]/.test(w)) s -= 2.5
  if (/[^aeiouy']{5}/.test(w)) s -= 1.5
  if (w.length === 1 && w !== 'a' && w !== 'i') s -= 1
  return s + enDict(w)
}

// Convert one whitespace-free token, with care for punctuation at its edges.
// toHe: ',' '.' ';' are letters in Hebrew (ת ץ ף); a trailing one is kept as punctuation
// when the Hebrew word would be impossible (after a final letter) or a known word gets worse.
export function convertToken(tok, dir) {
  const isSrc = dir === 'toHe' ? c => EN_LETTER.test(c) : c => HE_LETTER.test(c)
  let a = 0; let b = tok.length
  while (a < b && !isSrc(tok[a])) a++
  while (b > a && !isSrc(tok[b - 1])) b--
  if (a === b) return tok
  const lead = tok.slice(0, a); const core = tok.slice(a, b); const trail = tok.slice(b)
  const map = c => dir === 'toHe' ? (EN_TO_HE[c.toLowerCase()] ?? c) : (HE_TO_EN[c] ?? c)
  const coreOut = [...core].map(c => /\d/.test(c) ? c : map(c)).join('')

  let leadOut = ''
  for (const c of lead) {
    if (dir === 'toHe') leadOut += c === ',' ? 'ת' : c
    else leadOut += c === "'" || c === '/' ? map(c) : c
  }
  let trailOut
  if (dir === 'toHe') {
    const full = [...trail].map(map).join('')
    const keepLetters = [...trail].map(c => ',.;'.includes(c) ? c : map(c)).join('')
    const lastCore = coreOut[coreOut.length - 1]
    const letterTail = /[,.;]/.test(trail)
    let keep = false
    if (letterTail) {
      if (FINALS.includes(lastCore) || /[,.;]{2}/.test(trail) || /[,.;][^,.;]*[,.;]/.test(trail)) keep = true
      else {
        const withLetters = lettersOnly(leadOut + coreOut + full, c => HE_LETTER.test(c))
        if (heDict(coreOut) && !heDict(withLetters)) keep = true
      }
    }
    trailOut = keep ? keepLetters : full
  } else {
    trailOut = [...trail].map(c => c === "'" || c === '/' ? map(c) : c).join('')
  }
  let out = leadOut + coreOut + trailOut
  if (dir === 'toEn') out = out.replace(/^i(?=$|'|[^a-z])/, 'I')
  return out
}

const SKIP = /(^https?:|^www\.|@|\.(com|org|net|io|co|il|gov|edu)\b|#)/i

function analyze(tok, hasLower) {
  const he = HE_LETTER.test(tok); const en = EN_LETTER.test(tok)
  if (he === en || SKIP.test(tok) || (en && /\d/.test(tok))) return null
  const dir = en ? 'toHe' : 'toEn'
  const out = convertToken(tok, dir)
  if (out === tok) return null
  if (en && hasLower && tok.length >= 2 && tok === tok.toUpperCase() && !/[,.;]/.test(tok.slice(0, -1))) {
    return { dir, out, delta: -3 } // an acronym like USA in normal text
  }
  const delta = en ? scoreHebrew(out) - scoreEnglish(tok) : scoreEnglish(out) - scoreHebrew(tok)
  return { dir, out, delta }
}

/**
 * Fix text typed in the wrong layout.
 * mode: 'auto' (only words that look wrong), 'toHe' or 'toEn' (convert every word of that script).
 * Returns { text, segments: [{ text, changed }], changed, direction: 'toHe'|'toEn'|'mixed'|null }.
 */
export function fixText(text, mode = 'auto') {
  const parts = String(text ?? '').split(/(\s+)/)
  const hasLower = /[a-z]/.test(text)
  const info = parts.map((p, i) => (i % 2 || !p ? null : analyze(p, hasLower)))
  const convert = info.map(() => false)

  if (mode === 'toHe' || mode === 'toEn') {
    info.forEach((x, i) => { convert[i] = !!x && x.dir === mode })
  } else {
    const CONF = 1.5
    info.forEach((x, i) => { if (x && Math.abs(x.delta) >= CONF) convert[i] = x.delta > 0 })
    info.forEach((x, i) => {
      if (!x || Math.abs(x.delta) >= CONF) return
      const near = step => {
        for (let j = i + step; j >= 0 && j < info.length; j += step) {
          const y = info[j]
          if (y && y.dir === x.dir && Math.abs(y.delta) >= CONF) return y.delta > 0 ? 1 : -1
          // a word in the other script that is fine as typed also counts as context
          if (!y && j % 2 === 0 && parts[j] && (HE_LETTER.test(parts[j]) !== EN_LETTER.test(parts[j]))) {
            const same = x.dir === 'toHe' ? EN_LETTER.test(parts[j]) : HE_LETTER.test(parts[j])
            if (same) return -1
          }
        }
        return 0
      }
      const l = near(-1); const r = near(1)
      convert[i] = l === 1 || r === 1 ? x.delta > -CONF : (l === 0 && r === 0 ? x.delta > 0.5 : false)
    })
  }

  const segments = []
  let toHe = 0; let toEn = 0
  parts.forEach((p, i) => {
    if (!p) return
    const ch = convert[i]
    if (ch && info[i].dir === 'toHe') toHe++
    else if (ch) toEn++
    const t = ch ? info[i].out : p
    const last = segments[segments.length - 1]
    if (last && (last.changed === ch || /^\s+$/.test(t))) last.text += t
    else segments.push({ text: t, changed: ch })
  })
  return {
    text: segments.map(s => s.text).join(''),
    segments,
    changed: toHe + toEn,
    direction: toHe && toEn ? 'mixed' : toHe ? 'toHe' : toEn ? 'toEn' : null,
  }
}

/** Which forced direction makes sense for "convert all": the script with more letters. */
export function mainScript(text) {
  const he = (String(text).match(/[א-ת]/g) || []).length
  const en = (String(text).match(/[A-Za-z]/g) || []).length
  if (!he && !en) return null
  return en >= he ? 'toHe' : 'toEn'
}

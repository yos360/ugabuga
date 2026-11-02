// /tools/keyboard — the on-screen Hebrew/English keyboard. Pure logic, shared with tests:
// full key layouts (by physical key = KeyboardEvent.code), niqqud, caret editing, and turning
// a key pressed on an English-only computer into the Hebrew letter printed on that key.

// Each key: [code, base, shift]. Hebrew = the Israeli layout (SI-1452); Shift on a Hebrew
// letter keeps the letter, so a stray Shift never breaks a word.
const NUM = [['Backquote', ';', '~'], ['Digit1', '1', '!'], ['Digit2', '2', '@'], ['Digit3', '3', '#'], ['Digit4', '4', '$'], ['Digit5', '5', '%'], ['Digit6', '6', '^'], ['Digit7', '7', '&'], ['Digit8', '8', '*'], ['Digit9', '9', '('], ['Digit0', '0', ')'], ['Minus', '-', '_'], ['Equal', '=', '+']]
const HE = [
  NUM,
  [['KeyQ', '/'], ['KeyW', "'"], ['KeyE', 'ק'], ['KeyR', 'ר'], ['KeyT', 'א'], ['KeyY', 'ט'], ['KeyU', 'ו'], ['KeyI', 'ן'], ['KeyO', 'ם'], ['KeyP', 'פ'], ['BracketLeft', ']', '}'], ['BracketRight', '[', '{'], ['Backslash', '\\', '|']],
  [['KeyA', 'ש'], ['KeyS', 'ד'], ['KeyD', 'ג'], ['KeyF', 'כ'], ['KeyG', 'ע'], ['KeyH', 'י'], ['KeyJ', 'ח'], ['KeyK', 'ל'], ['KeyL', 'ך'], ['Semicolon', 'ף', ':'], ['Quote', ',', '"']],
  [['KeyZ', 'ז'], ['KeyX', 'ס'], ['KeyC', 'ב'], ['KeyV', 'ה'], ['KeyB', 'נ'], ['KeyN', 'מ'], ['KeyM', 'צ'], ['Comma', 'ת', '>'], ['Period', 'ץ', '<'], ['Slash', '.', '?']],
]
const EN = [
  [['Backquote', '`', '~'], ...NUM.slice(1)],
  [...'qwertyuiop'.split('').map(c => [`Key${c.toUpperCase()}`, c]), ['BracketLeft', '[', '{'], ['BracketRight', ']', '}'], ['Backslash', '\\', '|']],
  [...'asdfghjkl'.split('').map(c => [`Key${c.toUpperCase()}`, c]), ['Semicolon', ';', ':'], ['Quote', "'", '"']],
  [...'zxcvbnm'.split('').map(c => [`Key${c.toUpperCase()}`, c]), ['Comma', ',', '<'], ['Period', '.', '>'], ['Slash', '/', '?']],
]

function layout(id, rows, dir) {
  const byCode = {}
  for (const row of rows) for (const [code, base, shift] of row) {
    byCode[code] = { code, base, shift: shift ?? (/^[a-z]$/.test(base) ? base.toUpperCase() : base) }
  }
  return { id, dir, rows: rows.map(r => r.map(k => k[0])), byCode }
}
export const KB_LAYOUTS = { he: layout('he', HE, 'rtl'), en: layout('en', EN, 'ltr') }
export const LATIN_ON_KEY = Object.fromEntries(Object.values(KB_LAYOUTS.en.byCode).map(k => [k.code, k.base.toUpperCase()]))

/** The character a key types: Shift for symbols, Caps Lock for English capitals only. */
export function charFor(lang, code, { shift = false, caps = false } = {}) {
  const k = KB_LAYOUTS[lang]?.byCode[code]
  if (!k) return null
  const letter = /^[a-z]$/i.test(k.base)
  return (letter ? shift !== caps : shift) ? k.shift : k.base
}

/**
 * A key pressed on the real keyboard while the site keyboard is set to `lang`. When the
 * computer's own layout is the other language (the browser reports the other language's
 * character for that key), return the character of `lang` instead; otherwise null = let it type.
 */
export function remapPhysical(lang, { code, key, shiftKey = false, ctrlKey = false, metaKey = false, altKey = false }) {
  if (ctrlKey || metaKey || altKey || !key || key.length !== 1) return null
  const other = lang === 'he' ? 'en' : 'he'
  const mine = charFor(lang, code, { shift: shiftKey })
  if (mine == null || mine === key) return null
  const theirs = KB_LAYOUTS[other].byCode[code]
  if (!theirs || (key !== theirs.base && key !== theirs.shift)) return null
  // Caps Lock on an English computer sends capitals; in Hebrew they still mean the letter.
  return mine
}

// Niqqud as combining marks, written after the letter they belong to.
export const NIQQUD = [
  { mark: 'ָ', name: 'קָמָץ' }, { mark: 'ַ', name: 'פַּתָח' }, { mark: 'ֵ', name: 'צֵירֵי' }, { mark: 'ֶ', name: 'סֶגוֹל' },
  { mark: 'ְ', name: 'שְׁוָא' }, { mark: 'ִ', name: 'חִירִיק' }, { mark: 'ֹ', name: 'חוֹלָם' }, { mark: 'ֻ', name: 'קֻבּוּץ' },
  { mark: 'ּ', name: 'דָּגֵשׁ' }, { mark: 'ֲ', name: 'חֲטַף פַּתָח' }, { mark: 'ֱ', name: 'חֱטַף סֶגוֹל' }, { mark: 'ֳ', name: 'חֳטַף קָמָץ' },
  { mark: 'ׁ', name: 'שִׁי״ן ימנית' }, { mark: 'ׂ', name: 'שִׂי״ן שמאלית' },
]
export const VAV_VOWELS = [{ text: 'וּ', name: 'שׁוּרוּק' }, { text: 'וֹ', name: 'חוֹלָם מָלֵא' }]
export const SYMBOLS = ['₪', '״', '׳', '־', '–', '…', '€', '$', '%', '°', '×', '÷', '«', '»', '❤️', '🙂']

const NIQQUD_RE = /[֑-ׇֽֿׁׂׅׄ]/g
/** Strip niqqud and cantillation, keeping maqaf (־), geresh and gershayim. */
export const removeNiqqud = text => text.replace(NIQQUD_RE, '')

/** Insert `str` over the selection [start, end). Returns the new text and caret. */
export function insertAt(text, start, end, str) {
  return { text: text.slice(0, start) + str + text.slice(end), caret: start + str.length }
}

/** Backspace: the selection, else one character (a whole emoji, or just the last niqqud mark). */
export function backspaceAt(text, start, end) {
  if (start !== end) return { text: text.slice(0, start) + text.slice(end), caret: start }
  if (start === 0) return { text, caret: 0 }
  let i = start
  if (text[i - 1] === '️' && i > 1) i--
  const lo = text.charCodeAt(i - 1)
  i -= lo >= 0xDC00 && lo <= 0xDFFF && i > 1 ? 2 : 1
  return { text: text.slice(0, i) + text.slice(start), caret: i }
}

export function countText(text) {
  const t = text.trim()
  return { chars: [...text.replace(NIQQUD_RE, '')].length, words: t ? t.split(/\s+/).length : 0 }
}

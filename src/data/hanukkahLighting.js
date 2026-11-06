// Printable candle-lighting card (/holidays/hanukkah/candle-lighting). The liturgical texts are not
// retyped here: they come from hanukkahSongs.js, so the site has one vowelled source for them.
import { BLESSINGS, HANEIROT_HALALU, MAOZ_TZUR } from './hanukkahSongs.js'

export { HANEIROT_HALALU, MAOZ_TZUR }

export const NUSACH = {
  ner: { label: 'נֵר חֲנֻכָּה', hint: 'עדות המזרח' },
  shel: { label: 'נֵר שֶׁל חֲנֻכָּה', hint: 'אשכנז' },
}

// The first blessing differs by community; the other two are the same on the card.
export function lightingBlessings(nusach = 'ner') {
  return BLESSINGS.map((b, i) => (i === 0 && nusach === 'shel' ? { ...b, text: b.text.replace('נֵר חֲנֻכָּה', 'נֵר שֶׁל חֲנֻכָּה') } : b))
}

// Five short lines: the same text on the page and on the printed night chart.
export const LIGHTING_STEPS = [
  'מניחים נרות מימין לשמאל: בכל ערב מוסיפים נר אחד משמאל לנרות של אתמול.',
  'מדליקים את השמש ומברכים: שלוש ברכות בערב הראשון, ושתיים בשאר הערבים.',
  'בעזרת השמש מדליקים את הנרות. מתחילים בנר החדש, השמאלי, וממשיכים ימינה.',
  'אחרי הנר הראשון אומרים "הנרות הללו", ובסוף ההדלקה שרים "מעוז צור".',
  'מבוגר נשאר ליד הנרות עד שהם כבים, רחוק מווילונות ומנייר.',
]

// Vowel points and cantillation marks take no width of their own, so a line's length is its letters.
export const visibleLength = text => text.replace(/[֑-ׇ]/g, '').length

// Greedy word wrap for SVG text, which has no line breaks of its own. A blessing should not end on
// one stranded word, so the last line borrows a word from the line above it.
export function wrapLines(text, max) {
  const lines = text.split(' ').reduce((list, word) => {
    const last = list[list.length - 1]
    if (last !== undefined && visibleLength(`${last} ${word}`) <= max) list[list.length - 1] = `${last} ${word}`
    else list.push(word)
    return list
  }, [])
  const end = lines.length - 1
  if (end > 0 && !lines[end].includes(' ') && lines[end - 1].includes(' ')) {
    const words = lines[end - 1].split(' '), moved = words.pop()
    lines[end - 1] = words.join(' ')
    lines[end] = `${moved} ${lines[end]}`
  }
  return lines
}

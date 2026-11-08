import { englishCounterpart } from '../englishLinks'
import { cbnLegend } from '../../data/colorByNumber'
import { CBN_HUB, ANSWER_HUB, LETTER_PAGE } from './catalog'
import { COLOR_NAMES } from './cbnText'

// Small helpers shared by the English art pages (components live in cbnEn.jsx).

export const legendEn = p => cbnLegend(p).map(l => ({ ...l, name: COLOR_NAMES[l.ch] }))

// a link to the English page of a Hebrew page, if there is one (the shared links file knows every pair)
export const enLink = (hePath, label) => { const href = englishCounterpart(hePath); return href ? [{ label, href }] : [] }

const BADGES = { gan: 'bg-green-100', 'grades-1-2': 'bg-amber-100', adults: 'bg-violet-100' }
export const badge = level => BADGES[level]

export const PRINT_BTN = 'min-h-[52px] rounded-xl bg-red-500 px-5 py-3 text-lg font-bold text-white disabled:opacity-50'
export const PRINT_BTN_2 = 'min-h-[52px] rounded-xl bg-violet-600 px-5 py-3 text-lg font-bold text-white'
export const PRINT_NOTE = 'Sheets are A4. On US Letter paper, choose "Fit to page" in your print settings.'

// other ways to color the same pictures
export const MORE_WAYS = [
  { href: ANSWER_HUB, emoji: '🧮', title: 'Color by answer', desc: 'Addition, subtraction, times tables and division: every answer is a color' },
  { href: LETTER_PAGE, emoji: 'A', title: 'Color by letter', desc: 'Capital letters, lowercase letters and matching the two' },
  { href: CBN_HUB, emoji: '🎨', title: 'Color by number', desc: 'Every picture by number, with a math version and an answer key' },
]

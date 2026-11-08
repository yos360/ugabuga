// English pages of this area (how to draw, color by number / answer / letter): pure data, read by
// englishRoutes.js, the sitemap scripts and the pages themselves (titles and descriptions come only from here).
// The art, grids and exercises are the Hebrew site's own data; only the words are English.
import { HOW_TO_DRAW } from '../../data/howToDraw.js'
import { CBN_PICTURES, CBN_MATH_KINDS, cbnSize } from '../../data/colorByNumber.js'
import { HOW_TO_DRAW_EN } from './howToDrawText.js'
import { CBN_EN, LEVELS_EN, KINDS_EN } from './cbnText.js'

export const DRAW_HUB = '/en/how-to-draw'
export const CBN_HUB = '/en/printables/color-by-number'
export const CBN_MANDALAS = '/en/printables/color-by-number/mandalas'
export const ANSWER_HUB = '/en/printables/color-by-answer'
export const LETTER_PAGE = '/en/printables/color-by-letter'

export const drawPathEn = slug => `${DRAW_HUB}/${slug}`
export const cbnPathEn = p => `${CBN_HUB}/${p.slug}`
export const answerPathEn = kind => `${ANSWER_HUB}/${kind.slug}`

// "a cat" → "A cat", for headings that start with the phrase
const lower = s => s.charAt(0).toLowerCase() + s.slice(1)
export const drawEn = d => { const [name, what, steps, tip] = HOW_TO_DRAW_EN[d.slug]; return { name, what, steps, tip } }
export const cbnName = p => CBN_EN[p.slug][0]
export const cbnBlurb = p => CBN_EN[p.slug][1]
// the name inside a sentence ("the apple"); names that are proper nouns or acronyms keep their capitals
export const cbnLower = p => (/^(UFO|Saturn)$/.test(cbnName(p)) ? cbnName(p) : lower(cbnName(p)))

const mandalas = CBN_PICTURES.filter(p => p.theme === 'mandala').length

function cbnDescription(p) {
  const l = LEVELS_EN[p.level], { cols, rows } = cbnSize(p), n = p.colors.length
  const long = `Free ${cbnLower(p)} color by number ${l.long}: ${cols}×${rows} squares, ${n} colors, a math version (${lower(l.mathLabel)}), an answer key and online coloring.`
  return long.length <= 160 ? long : `Free ${cbnLower(p)} color by number, ${l.short}: ${cols}×${rows} squares, ${n} colors, a math version, an answer key and online coloring.`
}

export const ART_PAGES = [
  { path: DRAW_HUB, title: 'How to draw: easy step-by-step drawing for kids', emoji: '✏️', counterpart: '/how-to-draw', description: `How to draw a cat, a fish, a house and more: ${HOW_TO_DRAW.length} free printable step-by-step drawing sheets for kids, six simple steps on each one.` },
  ...HOW_TO_DRAW.map(d => {
    const e = drawEn(d)
    return { path: drawPathEn(d.slug), title: `How to draw ${e.what}: easy step-by-step for kids`, emoji: d.emoji, counterpart: `/how-to-draw/${d.slug}`, description: `Learn how to draw ${e.what} in six easy steps. A free printable step-by-step sheet for kids ages ${d.ages}. Print it or save it as a PDF.` }
  }),
  { path: CBN_HUB, title: `Color by number printables: ${CBN_PICTURES.length} free pages`, emoji: '🎨', counterpart: '/printables/color-by-number', description: `${CBN_PICTURES.length} free color by number printables in three levels, from preschool to adults. Each has a math version, an answer key and online coloring.` },
  { path: CBN_MANDALAS, title: `Mandala color by number: ${mandalas} free printables`, emoji: '🌀', counterpart: '/printables/color-by-number/mandalas', description: `${mandalas} free mandala color by number pages for preschool, grades 1–2 and adults. Color by the key to reveal a symmetrical pattern. With answer keys.` },
  ...CBN_PICTURES.map(p => ({ path: cbnPathEn(p), title: `${cbnName(p)} color by number: free printable with answer key`, emoji: p.emoji, counterpart: `/printables/color-by-number/${p.slug}`, description: cbnDescription(p) })),
  { path: ANSWER_HUB, title: 'Color by answer: math coloring pages to print', emoji: '🧮', counterpart: '/printables/color-by-answer', description: `Free color by code math printables: addition and subtraction to 10 and 20, times tables and division. Solve each square to reveal one of ${CBN_PICTURES.length} pictures.` },
  ...CBN_MATH_KINDS.map(k => ({ path: answerPathEn(k), title: `${KINDS_EN[k.id].label} color by answer: free math coloring pages`, emoji: k.emoji, counterpart: `/printables/color-by-answer/${k.slug}`, description: `Free ${lower(KINDS_EN[k.id].label)} color by answer pages for ${lower(KINDS_EN[k.id].grade)}: every square holds a problem like ${k.sample}, and every answer is a color. With answer keys.` })),
  { path: LETTER_PAGE, title: 'Color by letter: free ABC coloring pages to print', emoji: '🔤', counterpart: '/printables/color-by-letter/english', description: `Free color by letter printables: capital letters, lowercase letters that are easy to mix up (b/d/p/q) and capital-lowercase matching. ${CBN_PICTURES.length} pictures with keys.` },
]

export const artPage = path => ART_PAGES.find(p => p.path === path)

// English page copy computed from the per-sheet data of the shared coloring collection
// (suggested ages per drawing, subject groups, holiday drawings), so each subject page and each
// single holiday drawing says something of its own instead of repeating one template.
import { COLORING_DRAWINGS } from '../data/coloringDrawings.js'
import { EN_COLORING } from './activityCatalog.js'
import { HOLIDAY_DRAWINGS, drawingPath, drawingsFor } from './holidayColoringData.js'
import { HOLIDAYS, HOLIDAY_ROOT } from './holidayData.js'

// Editorial groups used only to pick genuinely related subjects.
const GROUPS = {
  pets: ['cat', 'dog', 'bunny', 'teddy-bear'],
  wild: ['elephant', 'lion', 'tiger', 'monkey', 'dinosaur'],
  farm: ['horse', 'cow', 'bunny', 'birds'],
  sea: ['seal', 'seahorse', 'dolphin', 'fish', 'starfish', 'turtle', 'penguin', 'mermaid'],
  bugs: ['butterfly', 'bee', 'flowers'],
  fantasy: ['unicorn', 'dragon', 'princess', 'superhero', 'mermaid'],
  party: ['cake', 'balloons', 'clown', 'ice-cream', 'sweets', 'hearts'],
  food: ['food', 'ice-cream', 'sweets', 'fruits', 'cake', 'sufganiyah'],
  nature: ['flowers', 'rainbow-sun', 'umbrella', 'winter', 'birds', 'tu-bishvat'],
  detailed: ['mandala-kids', 'mandala-animals', 'mandala-adults', 'older-kids'],
  moving: ['vehicles', 'airplane', 'soccer', 'superhero', 'space', 'professions'],
  hanukkah: ['sufganiyah', 'dreidel', 'hanukkiah', 'maccabees'],
  holidays: ['tu-bishvat', 'purim-masks', 'hanukkiah', 'dreidel'],
}

const list = items => items.length < 2 ? (items[0] || '') : items.length === 2 ? `${items[0]} and ${items[1]}` : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
const sheetsWord = ns => `${ns.length === 1 ? 'sheet' : 'sheets'} ${list(ns.map(String))}`

// "4–7" → [4, 7]; "12 ומעלה" (12 and up) → [12, null]
export function parseAges(text) {
  const s = String(text || '')
  const range = s.match(/(\d+)\s*[–-]\s*(\d+)/)
  if (range) return [Number(range[1]), Number(range[2])]
  const up = s.match(/(\d+)/)
  return up ? [Number(up[1]), null] : null
}
const agesLabel = ([min, max]) => max ? `${min}–${max}` : `${min}+`

export function subjectAges(slug, count) {
  const rows = (COLORING_DRAWINGS[slug] || []).slice(0, count)
  const sheets = rows.map((r, i) => ({ n: i + 1, ages: parseAges(r.ages) })).filter(s => s.ages)
  if (!sheets.length) return null
  const groups = new Map()
  for (const s of sheets) { const k = agesLabel(s.ages); groups.set(k, [...(groups.get(k) || []), s.n]) }
  const byStart = [...groups].sort((a, b) => parseAges(a[0])[0] - parseAges(b[0])[0] || a[0].localeCompare(b[0]))
  const min = Math.min(...sheets.map(s => s.ages[0]))
  const maxes = sheets.map(s => s.ages[1])
  const max = maxes.includes(null) ? null : Math.max(...maxes)
  return { min, max, groups: byStart, youngest: byStart[0], oldest: byStart.at(-1) }
}

export function relatedSubjects(slug, limit = 6) {
  const mine = Object.entries(GROUPS).filter(([, g]) => g.includes(slug)).map(([k]) => k)
  const score = s => mine.filter(k => GROUPS[k].includes(s)).length
  return EN_COLORING.filter(t => t.slug !== slug && score(t.slug) > 0)
    .sort((a, b) => score(b.slug) - score(a.slug) || EN_COLORING.indexOf(a) - EN_COLORING.indexOf(b)).slice(0, limit)
}

export function subjectCopy(topic) {
  const a = subjectAges(topic.slug, topic.count)
  const name = topic.name.toLowerCase()
  const paragraphs = []
  if (a) {
    const span = a.max ? `${a.min} to ${a.max}` : `${a.min} and up`
    const p = [`There are ${topic.count} sheets in the ${topic.name} collection, with suggested ages of ${span}.`]
    if (a.groups.length > 1) {
      p.push(`For the youngest colorists, start with ${sheetsWord(a.youngest[1])} (ages ${a.youngest[0]}).`)
      p.push(`${sheetsWord(a.oldest[1]).replace(/^s/, 'S')} ${a.oldest[1].length === 1 ? 'is' : 'are'} suggested for ages ${a.oldest[0]}, for children who enjoy smaller spaces and more detail.`)
    } else p.push(`Every sheet in this set carries the same age suggestion (${a.youngest[0]}), so you can choose by picture rather than by difficulty.`)
    if (a.min < 9) p.push('Ages are only a guide: a younger child can color the big shapes and leave the details for a grown-up helper.')
    else p.push('These sheets have many small spaces, so sharp colored pencils or fine markers work best.')
    paragraphs.push(p.join(' '))
  }
  const related = relatedSubjects(topic.slug)
  const holidays = HOLIDAY_DRAWINGS.filter(d => d.subject === topic.slug)
  const faq = [{ q: `How many ${name} coloring pages are there?`, a: `${topic.count}. Tick the ones you want, or press Select all, and they print together as one PDF on A4 paper.` }]
  if (a && a.groups.length > 1) {
    faq.push({ q: `Which ${name} coloring page is easiest?`, a: `${sheetsWord(a.youngest[1]).replace(/^s/, 'S')}, suggested for ages ${a.youngest[0]}. ${a.youngest[1].length === 1 ? 'It is' : 'They are'} a good first choice for preschoolers or for a short coloring break.` })
    faq.push({ q: `Is there a more detailed ${name} page for older kids?`, a: `Yes: ${sheetsWord(a.oldest[1])}, suggested for ages ${a.oldest[0]}.${related.some(r => GROUPS.detailed.includes(r.slug)) ? '' : ' For even finer work, try the detailed coloring or mandala collections.'}` })
  }
  if (holidays.length) {
    const h = HOLIDAYS.find(x => x.slug === holidays[0].holiday)
    faq.push({ q: `Are these ${name} pages connected to a holiday?`, a: `Yes, they belong to ${h.name}. Each drawing also has its own page with a short description and a holiday word to learn.` })
  }
  return { paragraphs, faq, related, ageGroups: a ? a.groups : [], holidays }
}

// Single holiday drawing (/en/coloring/:holiday/:n): nearby drawings, a rotating holiday fact and word.
export function drawingCopy(d) {
  const h = HOLIDAYS.find(x => x.slug === d.holiday)
  const all = drawingsFor(d.holiday)
  const siblings = all.filter(x => x !== d).sort((x, y) => Math.abs(x.n - d.n) - Math.abs(y.n - d.n) || x.n - y.n).slice(0, 6).sort((x, y) => x.n - y.n)
  const word = h.words[(d.n - 1) % h.words.length]
  const fact = h.paragraphs[(d.n - 1) % h.paragraphs.length]
  const ages = d.ages ? parseAges(d.ages) : null
  const paragraphs = [d.description, fact,
    `A holiday word to learn with this page: “${word[0]}” is ${word[1]} in Hebrew. Say it together, then look for something in the picture or in your home that goes with it.`]
  if (ages) paragraphs.push(ages[0] <= 4
    ? `The suggested ages are ${d.ages}. Younger children can fill the large shapes with crayons while an adult helps with the small details.`
    : `The suggested ages are ${d.ages}. Sharpened colored pencils help with the smaller details in this drawing.`)
  const faq = [
    { q: `How many ${h.name} coloring pages are there?`, a: `There are ${all.length} ${h.name} drawings in the collection; this is number ${d.n}. Each one has its own page and prints on a single A4 sheet.` },
  ]
  if (ages) faq.push({ q: `What age is “${d.name}” suitable for?`, a: `It is suggested for ages ${d.ages}. Ages are a guide only; let your child choose the pictures they like.` })
  faq.push({ q: `Which Hebrew word goes with this page?`, a: `“${word[0]}” — ${word[1]}. The ${h.name} page has the other holiday words and a printable word match.` })
  const related = siblings.map(x => ({ label: x.name, href: drawingPath(x) }))
  return { paragraphs, faq, related, holiday: h, holidayPath: `${HOLIDAY_ROOT}/${h.slug}` }
}

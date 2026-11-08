import { COLORING_SUBJECTS } from '../../data/coloringSubjects.js'
import { EN_DRAWING_NAMES } from './drawingNames.js'

// One English page per drawing of the shared coloring collection: /en/coloring-pages/<subject>/<n>,
// paired with the Hebrew /printables/coloring/<subject>/<n>. The artwork is shared, never copied.
// Drawings whose name is null already have an English page among the holiday drawings
// (/en/coloring/<holiday>/<n>), which stays their counterpart, so they get no second page here.
// Kept free of the large Hebrew per-drawing data so the catalog stays light wherever it is imported.

// How a subject reads inside a sentence ("one of 12 cat coloring pages").
const NOUN = {
  cat: 'cat', flowers: 'flower', hearts: 'heart', seal: 'seal', bunny: 'bunny', dog: 'dog', food: 'cute food', dinosaur: 'dinosaur',
  vehicles: 'vehicle', 'ice-cream': 'ice cream', 'teddy-bear': 'teddy bear', soccer: 'soccer', seahorse: 'seahorse', dragon: 'dragon',
  elephant: 'elephant', clown: 'circus', butterfly: 'butterfly', dolphin: 'dolphin', princess: 'princess', lion: 'lion', fish: 'fish',
  superhero: 'superhero', cake: 'cake', airplane: 'airplane', balloons: 'balloon', starfish: 'starfish', sufganiyah: 'Hanukkah doughnut',
  horse: 'horse', umbrella: 'rainy day', cow: 'farm', birds: 'bird', dreidel: 'dreidel', hanukkiah: 'Hanukkah menorah', maccabees: 'Maccabees',
  tiger: 'tiger', penguin: 'penguin', monkey: 'monkey', 'rainbow-sun': 'rainbow and sunshine', bee: 'bee', turtle: 'turtle',
  'mandala-kids': 'kids’ mandala', 'mandala-adults': 'detailed mandala', 'mandala-animals': 'animal mandala', 'older-kids': 'detailed',
  'tu-bishvat': 'Tu BiShvat', 'purim-masks': 'Purim mask', sweets: 'candy', fruits: 'fruit', mermaid: 'mermaid', space: 'space',
  professions: 'jobs and careers', winter: 'winter', unicorn: 'unicorn',
}

// Several openings so 561 descriptions do not read like one template; the first that fits 115–165 characters wins.
const DESCRIPTIONS = [
  (d, s) => `${d.name}: a free ${s.noun} coloring page to print on A4 or save as a PDF. Sheet ${d.n} of ${s.count} in the Ugabuga collection.`,
  (d, s) => `Print “${d.name}” for free. One of ${s.count} ${s.noun} coloring pages, ready as a single A4 sheet or a PDF for home or class.`,
  (d, s) => `Free printable coloring page: ${d.name}. Part of our ${s.count}-sheet ${s.noun} set, with a print preview and a quick PDF download.`,
  (d, s) => `${d.name}, ready to color. A free ${s.noun} printable on one A4 page (or US Letter with “fit to page”). Save it as a PDF anytime.`,
  (d, s) => `Grab your crayons for “${d.name}”, a free ${s.noun} coloring sheet. Preview it, print it at home or at school, or keep a PDF.`,
]
const SHORT = [
  (d, s) => `${d.name}: a free ${s.noun} coloring page. Print it on A4 or save a PDF.`,
  (d) => `${d.name}: a free coloring page to print or save as a PDF.`,
]
function describe(d, s, i) {
  for (let k = 0; k < DESCRIPTIONS.length; k++) {
    const text = DESCRIPTIONS[(i + k) % DESCRIPTIONS.length](d, s)
    if (text.length >= 115 && text.length <= 165) return text
  }
  return SHORT.map(f => f(d, s)).find(t => t.length <= 165)
}

export const coloringDrawingPathEn = (slug, n) => `/en/coloring-pages/${slug}/${n}`

export const EN_COLORING_DRAWINGS = COLORING_SUBJECTS.flatMap(subject => (EN_DRAWING_NAMES[subject.slug] || [])
  .map((name, i) => name && { slug: subject.slug, n: i + 1, name, count: subject.items.length, emoji: subject.emoji, noun: NOUN[subject.slug] })
  .filter(Boolean))
  .map((d, i) => ({ ...d, path: coloringDrawingPathEn(d.slug, d.n), counterpart: `/printables/coloring/${d.slug}/${d.n}`,
    title: `${d.name} coloring page`, description: describe(d, d, i) }))

export const EN_COLORING_DRAWING_PAGES = EN_COLORING_DRAWINGS.map(({ path, title, counterpart, description }) => ({ path, title, counterpart, description }))

export const findEnColoringDrawing = (slug, n) => /^[1-9]\d*$/.test(String(n))
  ? EN_COLORING_DRAWINGS.find(d => d.slug === slug && d.n === Number(n)) || null
  : null

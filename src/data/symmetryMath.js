// /math/symmetry — symmetry for grades 3–5: reflection (line) symmetry, axes of symmetry and
// rotational symmetry. Pure data and geometry (no JSX), so the node tests can verify every answer:
// the number of axes and the rotation order of each shape are not typed by hand for the page —
// they are computed from the shape's corners by findAxes / rotationOrder, and the test checks
// those computations against the known values below.

// Shapes drawn in a 100×100 box (y grows downwards, as in SVG).
const regular = (n, r, cx = 50, cy = 52, start = -90) => Array.from({ length: n }, (_, i) => {
  const a = (start + (360 / n) * i) * Math.PI / 180
  return [+(cx + r * Math.cos(a)).toFixed(3), +(cy + r * Math.sin(a)).toFixed(3)]
})
const star = (n, R, r, cx = 50, cy = 53) => Array.from({ length: n * 2 }, (_, i) => {
  const a = (-90 + (180 / n) * i) * Math.PI / 180, rr = i % 2 ? r : R
  return [+(cx + rr * Math.cos(a)).toFixed(3), +(cy + rr * Math.sin(a)).toFixed(3)]
})

// axes / rot are the known answers (Infinity for the circle); the test recomputes them from `pts`.
export const SHAPES = [
  { id: 'square', name: 'ריבוע', pts: [[20, 20], [80, 20], [80, 80], [20, 80]], axes: 4, rot: 4,
    why: 'שני צירים עוברים באמצע הצלעות, ושניים לאורך האלכסונים.' },
  { id: 'rectangle', name: 'מלבן', pts: [[10, 30], [90, 30], [90, 70], [10, 70]], axes: 2, rot: 2,
    why: 'הצירים עוברים באמצע הצלעות. האלכסון של מלבן אינו ציר סימטריה — מקפלים ובודקים!' },
  { id: 'equilateral', name: 'משולש שווה־צלעות', pts: regular(3, 40, 50, 58), axes: 3, rot: 3,
    why: 'מכל קודקוד יוצא ציר אל אמצע הצלע שמולו.' },
  { id: 'isosceles', name: 'משולש שווה־שוקיים', pts: [[50, 10], [80, 90], [20, 90]], axes: 1, rot: 1,
    why: 'ציר אחד: מהקודקוד שבין השוקיים אל אמצע הבסיס.' },
  { id: 'scalene', name: 'משולש שונה־צלעות', pts: [[15, 85], [90, 85], [35, 20]], axes: 0, rot: 1,
    why: 'כל הצלעות באורכים שונים, ולכן אין קיפול שבו החצאים מתלכדים.' },
  { id: 'rhombus', name: 'מעוין', pts: [[50, 10], [80, 50], [50, 90], [20, 50]], axes: 2, rot: 2,
    why: 'שני הצירים הם האלכסונים של המעוין.' },
  { id: 'parallelogram', name: 'מקבילית', pts: [[30, 30], [90, 30], [70, 70], [10, 70]], axes: 0, rot: 2,
    why: 'אין לה ציר סימטריה, אבל בסיבוב של חצי סיבוב היא חוזרת לעצמה.' },
  { id: 'kite', name: 'דלתון', pts: [[50, 10], [75, 40], [50, 90], [25, 40]], axes: 1, rot: 1,
    why: 'ציר אחד: האלכסון שמחבר את שני הקודקודים השונים.' },
  { id: 'trapezoid', name: 'טרפז שווה־שוקיים', pts: [[30, 25], [70, 25], [90, 75], [10, 75]], axes: 1, rot: 1,
    why: 'ציר אחד שעובר באמצע שני הבסיסים.' },
  { id: 'pentagon', name: 'מחומש משוכלל', pts: regular(5, 42), axes: 5, rot: 5,
    why: 'במצולע משוכלל מספר הצירים שווה למספר הצלעות.' },
  { id: 'hexagon', name: 'משושה משוכלל', pts: regular(6, 42, 50, 50, 0), axes: 6, rot: 6,
    why: 'שלושה צירים עוברים בין קודקודים נגדיים, ושלושה באמצע צלעות נגדיות.' },
  { id: 'star', name: 'כוכב בעל 5 קודקודים', pts: star(5, 44, 18), axes: 5, rot: 5,
    why: 'מכל קודקוד של הכוכב עובר ציר אל הפינה הפנימית שמולו.' },
  { id: 'plus', name: 'צורת פלוס', pts: [[38, 10], [62, 10], [62, 38], [90, 38], [90, 62], [62, 62], [62, 90], [38, 90], [38, 62], [10, 62], [10, 38], [38, 38]], axes: 4, rot: 4,
    why: 'שני צירים לאורך הזרועות ושניים באלכסון — בדיוק כמו בריבוע.' },
  { id: 'arrow', name: 'חץ', pts: [[50, 10], [85, 45], [62, 45], [62, 90], [38, 90], [38, 45], [15, 45]], axes: 1, rot: 1,
    why: 'ציר אחד לאורך החץ.' },
  { id: 'l-shape', name: 'צורת L', pts: [[25, 15], [45, 15], [45, 65], [80, 65], [80, 85], [25, 85]], axes: 0, rot: 1,
    why: 'הזרועות באורכים שונים, ולכן אין ציר סימטריה.' },
  { id: 'circle', name: 'עיגול', circle: true, axes: Infinity, rot: Infinity,
    why: 'כל קו שעובר במרכז העיגול הוא ציר סימטריה — יש אינסוף צירים.' },
]

export const shapeById = id => SHAPES.find(s => s.id === id)
export const axesLabel = n => (n === Infinity ? 'אינסוף' : String(n))

// ---- geometry: computed axes and rotation order for a polygon ----
const TOL = 0.05
const center = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
const sameSet = (a, b) => a.every(p => b.some(q => Math.abs(p[0] - q[0]) < TOL && Math.abs(p[1] - q[1]) < TOL))

// Any symmetry keeps the average of the corners in place, so every axis passes through it.
// Candidate axes are tried every half degree; the angle is in degrees from the x axis, in [0, 180).
export function findAxes(pts) {
  const [cx, cy] = center(pts), found = []
  for (let k = 0; k < 360; k++) {
    const t = (k / 2) * Math.PI / 180, c = Math.cos(2 * t), s = Math.sin(2 * t)
    const img = pts.map(([x, y]) => { const dx = x - cx, dy = y - cy; return [cx + dx * c + dy * s, cy + dx * s - dy * c] })
    if (sameSet(img, pts)) found.push(k / 2)
  }
  return { center: [cx, cy], angles: found }
}

// How many rotations (including the full turn) bring the shape back onto itself.
export function rotationOrder(pts) {
  const [cx, cy] = center(pts)
  let n = 0
  for (let k = 0; k < 720; k++) {
    const t = (k / 2) * Math.PI / 180, c = Math.cos(t), s = Math.sin(t)
    const img = pts.map(([x, y]) => { const dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c] })
    if (sameSet(img, pts)) n++
  }
  return n
}

// The axis as a segment across the 100×100 box, for drawing.
export function axisSegment([cx, cy], deg, len = 75) {
  const t = deg * Math.PI / 180, dx = Math.cos(t) * len, dy = Math.sin(t) * len
  return [cx - dx, cy - dy, cx + dx, cy + dy].map(v => +v.toFixed(2))
}

// ---- grid pictures for "complete the picture" ----
// Every design is symmetric around a vertical axis in the middle ('#' = colored square).
export const DESIGNS = [
  { id: 'heart6', name: 'לב', size: 6, rows: ['.#..#.', '######', '######', '.####.', '..##..', '......'] },
  { id: 'arrow6', name: 'חץ', size: 6, rows: ['..##..', '.####.', '######', '..##..', '..##..', '..##..'] },
  { id: 'cup6', name: 'גביע', size: 6, rows: ['#....#', '######', '######', '.####.', '..##..', '.####.'] },
  { id: 'flower6', name: 'פרח', size: 6, rows: ['.#..#.', '######', '.####.', '######', '.#..#.', '..##..'] },
  { id: 'heart', name: 'לב', size: 8, rows: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'] },
  { id: 'house', name: 'בית', size: 8, rows: ['...##...', '..####..', '.######.', '########', '.#....#.', '.#.##.#.', '.#.##.#.', '.######.'] },
  { id: 'tree', name: 'עץ', size: 8, rows: ['...##...', '..####..', '.######.', '..####..', '.######.', '########', '...##...', '...##...'] },
  { id: 'rocket', name: 'טיל', size: 8, rows: ['...##...', '..####..', '..#..#..', '..####..', '..####..', '.######.', '##.##.##', '#..##..#'] },
  { id: 'butterfly', name: 'פרפר', size: 8, rows: ['#......#', '##....##', '###..###', '.######.', '..####..', '.######.', '###..###', '##....##'] },
  { id: 'crown', name: 'כתר', size: 8, rows: ['#..##..#', '#..##..#', '##.##.##', '########', '########', '.######.', '........', '.######.'] },
  { id: 'robot', name: 'רובוט', size: 8, rows: ['.######.', '.#.##.#.', '.######.', '..#..#..', '########', '#.####.#', '..#..#..', '.##..##.'] },
]

export const LEVELS = [
  { id: 'easy', label: 'קל', note: 'רשת 6×6, ציר אנכי', size: 6, axis: 'v' },
  { id: 'mid', label: 'בינוני', note: 'רשת 8×8, ציר אנכי', size: 8, axis: 'v' },
  { id: 'hard', label: 'מאתגר', note: 'רשת 8×8, ציר אופקי', size: 8, axis: 'h' },
]

// The full picture as a grid of booleans; for a horizontal axis the design is turned on its side
// (rows ↔ columns), which makes it symmetric top-to-bottom.
export function fullGrid(design, axis = 'v') {
  const g = design.rows.map(r => [...r].map(ch => ch === '#'))
  return axis === 'h' ? g[0].map((_, c) => g.map(row => row[c])) : g
}

// Is cell (r, c) in the half that is given (drawn) or in the half the child completes?
// Vertical axis: the given half is on the right, where Hebrew reading starts.
export const isGiven = (r, c, size, axis) => (axis === 'v' ? c >= size / 2 : r < size / 2)
export const mirrorOf = (r, c, size, axis) => (axis === 'v' ? [r, size - 1 - c] : [size - 1 - r, c])

// Compare the child's cells (Set of "r,c" keys in the half to complete) to the mirror image.
export function checkMirror(design, axis, picked) {
  const g = fullGrid(design, axis), n = design.size, wrong = [], missing = []
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (isGiven(r, c, n, axis)) continue
    const want = g[r][c], has = picked.has(`${r},${c}`)
    if (has && !want) wrong.push(`${r},${c}`)
    if (!has && want) missing.push(`${r},${c}`)
  }
  return { ok: !wrong.length && !missing.length, wrong, missing }
}

export const designsFor = level => DESIGNS.filter(d => d.size === level.size)

// ---- teaching content ----
export const MISTAKES = [
  { title: 'מעתיקים במקום לשקף', text: 'הילד מצייר את החצי החסר כמו שהוא, באותו כיוון, במקום כמו בבואה במראה. בודקים משבצת אחת: אם היא צמודה לציר בצד אחד, היא חייבת להיות צמודה לציר גם בצד השני.' },
  { title: 'האלכסון של המלבן', text: 'רוב הילדים (וגם לא מעט מבוגרים) בטוחים שלמלבן יש 4 צירים. גוזרים מלבן מנייר ומקפלים לאורך האלכסון — החצאים לא מתלכדים, ושאלת "למה?" פותחת דיון מצוין.' },
  { title: 'סופרים מרחק בעין', text: 'בהשלמה על דף משבצות לא מעריכים "בערך". סופרים כמה משבצות יש מכל נקודה עד הציר, וסופרים אותו מספר בדיוק בצד השני.' },
  { title: 'מבלבלים בין סוגי הסימטריה', text: 'למקבילית אין אף ציר סימטריה, ובכל זאת היא חוזרת לעצמה בחצי סיבוב. זו סימטריה סיבובית ולא שיקופית, וכדאי להפריד בין שני הסוגים במפורש.' },
]

export const TEACH_STEPS = [
  { emoji: '📄', title: 'מקפלים וגוזרים', text: 'מקפלים דף לשניים, גוזרים צורה מהצד המקופל ופותחים. הקפל הוא ציר הסימטריה, ושני החצאים מתלכדים בדיוק. זו ההגדרה שילדים זוכרים.' },
  { emoji: '🪞', title: 'בודקים עם מראה', text: 'מעמידים מראה קטנה על הקו האמצעי של ציור. אם מה שרואים במראה משלים את הציור בדיוק — הקו הוא ציר סימטריה.' },
  { emoji: '🔢', title: 'סופרים משבצות', text: 'על דף משבצות משקפים כל נקודה בנפרד: נקודה שנמצאת 3 משבצות מימין לציר עוברת ל־3 משבצות משמאלו, באותה שורה בדיוק.' },
  { emoji: '🔍', title: 'מחפשים סביבנו', text: 'פרפר, עלה, פרצוף, דגל, חלון — הרבה דברים סביבנו כמעט סימטריים. מבקשים מהילדים להביא דוגמה ולמצוא בה את הציר.' },
]

export const FAQ = [
  { q: 'מה זה ציר סימטריה?', a: 'ציר סימטריה הוא קו שמחלק צורה לשני חלקים שהם בבואה זה של זה, כמו במראה. אם מקפלים את הצורה לאורך הציר, שני החלקים מתלכדים בדיוק.' },
  { q: 'כמה צירי סימטריה יש לריבוע ולמלבן?', a: 'לריבוע יש 4 צירי סימטריה: שניים שעוברים באמצע הצלעות ושניים לאורך האלכסונים. למלבן (שאינו ריבוע) יש רק 2 צירים, באמצע הצלעות — האלכסונים שלו אינם צירי סימטריה.' },
  { q: 'כמה צירי סימטריה יש למשולש?', a: 'למשולש שווה־צלעות יש 3 צירים, למשולש שווה־שוקיים שאינו שווה־צלעות יש ציר אחד, ולמשולש שונה־צלעות אין צירי סימטריה בכלל.' },
  { q: 'מה ההבדל בין סימטריה שיקופית לסימטריה סיבובית?', a: 'בסימטריה שיקופית הצורה מתלכדת עם עצמה כשמקפלים אותה לאורך ציר. בסימטריה סיבובית הצורה חוזרת לעצמה כשמסובבים אותה סביב המרכז בפחות מסיבוב שלם. למקבילית, למשל, יש סימטריה סיבובית בלי אף ציר סימטריה.' },
  { q: 'באיזו כיתה לומדים סימטריה?', a: 'בתוכנית הלימודים במתמטיקה של 2006 הסימטריה היא פרק קצר בכיתה ד׳ (כ־4 שעות): מזהים צורות סימטריות, מוצאים צירים ומשלימים צורה לפי ציר. ילדים פוגשים את הרעיון כבר בכיתות הנמוכות, והוא חוזר בגאומטריה של הכיתות הגבוהות.' },
  { q: 'כמה צירי סימטריה יש לעיגול?', a: 'אינסוף. כל קו שעובר דרך מרכז העיגול מחלק אותו לשני חצאים שמתלכדים.' },
]

export const MORE_LINKS = [
  { label: 'ציור סימטרי להשלמה (גן–ב׳)', href: '/printables/symmetry' },
  { label: 'מתמטיקה לכיתה ג׳', href: '/math/grade-3' },
  { label: 'מתמטיקה לכיתה ד׳', href: '/math/grade-4' },
  { label: 'מתמטיקה לכיתה ה׳', href: '/math/grade-5' },
  { label: 'נייר משבצות להדפסה', href: '/printables/grid-paper' },
  { label: 'מנדלות לצביעה', href: '/printables/mandalas' },
]

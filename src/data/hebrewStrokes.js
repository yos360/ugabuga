// Hand-drawn single-line Hebrew print letters for tracing sheets: one clean line
// per stroke, the way a teacher writes them. Box: x from 0 (left) to width,
// y 0 = letter top, 100 = baseline; descenders go to 145, ל rises to -35.
export const HEB_STROKES = {
  'א': [66, 'M4 0 L64 100 M62 0 L34 50 M24 33 L6 100'],
  'ב': [60, 'M2 0 H48 V100 M0 100 H58'],
  'ג': [36, 'M4 0 H30 V100 M30 56 L8 100'],
  'ד': [60, 'M0 0 H60 M44 0 V100'],
  'ה': [58, 'M0 0 H56 V100 M8 38 V100'],
  'ו': [14, 'M2 0 H10 V100'],
  'ז': [36, 'M0 0 H36 M18 0 V100'],
  'ח': [58, 'M4 100 V0 H56 V100'],
  'ט': [60, 'M4 0 V100 H56 V0 L32 44'],
  'י': [16, 'M2 0 H12 V40'],
  'כ': [54, 'M2 0 H52 V100 H2'],
  'ך': [48, 'M2 0 H46 V145'],
  'ל': [60, 'M4 -34 V0 H58 L36 100'],
  'מ': [62, 'M2 0 L12 14 V100 M24 100 H60 V0 H22 L12 14'],
  'ם': [60, 'M4 0 H56 V100 H4 Z'],
  'נ': [30, 'M2 0 H26 V100 H2'],
  'ן': [14, 'M2 0 H10 V145'],
  'ס': [62, 'M2 0 H60 L54 66 Q50 100 31 100 Q12 100 8 66 Z'],
  'ע': [60, 'M4 0 L40 86 M58 0 V100 H0'],
  'פ': [56, 'M2 0 H54 V100 H2 M12 0 V36 H28'],
  'ף': [50, 'M2 0 H48 V145 M12 0 V34 H26'],
  'צ': [62, 'M4 0 L52 100 H2 M60 0 L30 56'],
  'ץ': [56, 'M52 0 V145 M8 0 L52 62'],
  'ק': [56, 'M2 0 H54 V100 M10 38 V145'],
  'ר': [50, 'M2 0 H48 V100'],
  'ש': [66, 'M4 0 V100 H62 V0 M33 0 V100'],
  'ת': [58, 'M2 0 H56 V100 M16 0 V100 H4'],
}

const GAP = 18, SPACE = 36

// Lays a Hebrew word out right-to-left. Returns null if it holds anything we
// don't have strokes for (the caller then falls back to the font skeleton).
export function hebrewStrokeWord(text) {
  const chars = [...text.replace(/[֑-ׇ'"׳״]/g, '')]
  if (!chars.length || chars.some(c => c !== ' ' && !HEB_STROKES[c])) return null
  const parts = []
  let x = 0
  for (const c of chars) {
    if (c === ' ') { x += SPACE; continue }
    const [w, d] = HEB_STROKES[c]
    parts.push({ x, w, d }); x += w + GAP
  }
  const width = x - GAP
  // RTL: the first letter sits on the right.
  return { width, parts: parts.map(p => ({ dx: width - p.x - p.w, d: p.d })) }
}

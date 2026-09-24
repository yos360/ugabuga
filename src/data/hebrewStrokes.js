// Hand-drawn single-line Hebrew print letters for tracing sheets: one clean line
// per stroke, the way a teacher writes them. Box: x from 0 (left) to width,
// y 0 = letter top, 100 = baseline; descenders go to 145, ל rises to -35.
export const HEB_STROKES = {
  'א': [80, 'M12 0 L72 100 M66 0 V12 Q66 30 36 40 M48 63 Q24 70 22 100'],
  'ב': [72, 'M4 0 H48 Q62 0 62 14 V100 M0 100 H72'],
  'ג': [48, 'M6 0 H24 Q36 0 36 12 V100 M36 62 L10 100'],
  'ד': [70, 'M0 0 H70 M54 0 V100'],
  'ה': [70, 'M2 0 H52 Q66 0 66 14 V100 M8 38 V100'],
  'ו': [20, 'M2 0 H10 V100'],
  'ז': [44, 'M2 0 H42 M22 0 V100'],
  'ח': [70, 'M4 100 V0 H52 Q66 0 66 14 V100'],
  'ט': [72, 'M4 0 V76 Q4 100 28 100 H44 Q68 100 68 76 V26 Q68 4 48 4 Q34 4 34 22 V40'],
  'י': [24, 'M2 0 H10 Q18 0 18 10 V44'],
  'כ': [64, 'M4 0 H40 Q62 0 62 22 V78 Q62 100 40 100 H4'],
  'ך': [60, 'M2 0 H38 Q56 0 56 18 V145'],
  'ל': [62, 'M8 -35 V0 H44 Q58 0 58 14 V40 Q58 70 30 100'],
  'מ': [74, 'M4 -2 L14 12 V100 M26 100 H70 V14 Q70 0 56 0 H24 Q14 0 14 12'],
  'ם': [72, 'M6 0 H56 Q68 0 68 12 V100 H6 Z'],
  'נ': [44, 'M4 0 H22 Q38 0 38 14 V100 H2'],
  'ן': [20, 'M2 0 H10 V145'],
  'ס': [72, 'M4 0 H48 Q68 0 68 22 V60 Q68 100 36 100 Q4 100 4 60 Z'],
  'ע': [70, 'M6 0 Q10 60 44 84 M66 0 V64 Q66 100 30 100 H4'],
  'פ': [66, 'M4 0 H40 Q62 0 62 22 V78 Q62 100 40 100 H4 M10 0 V38 H26'],
  'ף': [62, 'M2 0 H38 Q56 0 56 18 V145 M10 0 V36 H24'],
  'צ': [66, 'M6 0 L48 88 Q52 100 38 100 H2 M62 0 V14 Q62 40 36 48'],
  'ץ': [62, 'M56 0 V145 M8 0 Q12 44 56 58'],
  'ק': [66, 'M4 0 H48 Q64 0 64 16 V100 M10 38 V145'],
  'ר': [60, 'M2 0 H40 Q58 0 58 18 V100'],
  'ש': [84, 'M80 0 V72 Q80 100 52 100 H8 Q4 100 4 94 V0 M42 0 V66'],
  'ת': [72, 'M2 0 H52 Q68 0 68 16 V100 M16 0 V92 Q16 100 8 100 H2'],
}

const GAP = 14, SPACE = 34

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

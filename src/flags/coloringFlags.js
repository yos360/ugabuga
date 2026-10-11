// Simple flags described as shapes, so they can be printed as outlines to colour in
// (numbered regions + colour legend). Only flags made of stripes, crosses or a disc.
export const PAINT = {
  red: ['אדום', '#D52B1E'], blue: ['כחול', '#0039A6'], lightblue: ['תכלת', '#6CB4EE'], white: ['לבן', '#FFFFFF'],
  green: ['ירוק', '#009246'], yellow: ['צהוב', '#FCD116'], black: ['שחור', '#111111'], orange: ['כתום', '#FF883E'],
}

// kind: h = horizontal stripes, v = vertical stripes (optional weights), nordic = cross, circle = disc, swiss = centred cross
export const COLORING_FLAGS = [
  { code: 'fr', kind: 'v', colors: ['blue', 'white', 'red'] },
  { code: 'it', kind: 'v', colors: ['green', 'white', 'red'] },
  { code: 'ie', kind: 'v', colors: ['green', 'white', 'orange'] },
  { code: 'be', kind: 'v', colors: ['black', 'yellow', 'red'] },
  { code: 'ro', kind: 'v', colors: ['blue', 'yellow', 'red'] },
  { code: 'ng', kind: 'v', colors: ['green', 'white', 'green'] },
  { code: 'ml', kind: 'v', colors: ['green', 'yellow', 'red'] },
  { code: 'gn', kind: 'v', colors: ['red', 'yellow', 'green'] },
  { code: 'ci', kind: 'v', colors: ['orange', 'white', 'green'] },
  { code: 'de', kind: 'h', colors: ['black', 'red', 'yellow'] },
  { code: 'nl', kind: 'h', colors: ['red', 'white', 'blue'] },
  { code: 'at', kind: 'h', colors: ['red', 'white', 'red'] },
  { code: 'pl', kind: 'h', colors: ['white', 'red'] },
  { code: 'ru', kind: 'h', colors: ['white', 'blue', 'red'] },
  { code: 'ua', kind: 'h', colors: ['blue', 'yellow'] },
  { code: 'hu', kind: 'h', colors: ['red', 'white', 'green'] },
  { code: 'bg', kind: 'h', colors: ['white', 'green', 'red'] },
  { code: 'ee', kind: 'h', colors: ['blue', 'black', 'white'] },
  { code: 'lt', kind: 'h', colors: ['yellow', 'green', 'red'] },
  { code: 'lu', kind: 'h', colors: ['red', 'white', 'lightblue'] },
  { code: 'id', kind: 'h', colors: ['red', 'white'] },
  { code: 'ye', kind: 'h', colors: ['red', 'white', 'black'] },
  { code: 'am', kind: 'h', colors: ['red', 'blue', 'orange'] },
  { code: 'ga', kind: 'h', colors: ['green', 'yellow', 'blue'] },
  { code: 'sl', kind: 'h', colors: ['green', 'white', 'blue'] },
  { code: 'co', kind: 'h', colors: ['yellow', 'blue', 'red'], weights: [2, 1, 1] },
  { code: 'th', kind: 'h', colors: ['red', 'white', 'blue', 'white', 'red'], weights: [1, 1, 2, 1, 1] },
  { code: 'jp', kind: 'circle', colors: ['white', 'red'] },
  { code: 'bd', kind: 'circle', colors: ['green', 'red'], cx: 0.45 },
  { code: 'ch', kind: 'swiss', colors: ['red', 'white'] },
  { code: 'se', kind: 'nordic', colors: ['blue', 'yellow'] },
  { code: 'dk', kind: 'nordic', colors: ['red', 'white'] },
  { code: 'fi', kind: 'nordic', colors: ['white', 'blue'] },
  { code: 'no', kind: 'nordic', colors: ['red', 'white', 'blue'] },
  { code: 'is', kind: 'nordic', colors: ['blue', 'white', 'red'] },
]

// Regions of a flag inside a w×h box: [{ d: svg path, color, label: [x, y] }]
export function flagRegions(f, w = 120, h = 80) {
  const r = (x, y, rw, rh) => `M${x},${y}h${rw}v${rh}h${-rw}z`
  if (f.kind === 'h' || f.kind === 'v') {
    const wt = f.weights || f.colors.map(() => 1), sum = wt.reduce((a, b) => a + b, 0)
    let at = 0
    return f.colors.map((color, i) => {
      const size = ((f.kind === 'h' ? h : w) * wt[i]) / sum, start = at
      at += size
      return f.kind === 'h' ? { d: r(0, start, w, size), color, label: [w / 2, start + size / 2] } : { d: r(start, 0, size, h), color, label: [start + size / 2, h / 2] }
    })
  }
  if (f.kind === 'circle') {
    const cx = w * (f.cx || 0.5), rad = h * 0.3
    return [{ d: r(0, 0, w, h), color: f.colors[0], label: [w * 0.12, h * 0.15] },
      { d: `M${cx - rad},${h / 2}a${rad},${rad} 0 1,0 ${2 * rad},0a${rad},${rad} 0 1,0 ${-2 * rad},0z`, color: f.colors[1], label: [cx, h / 2] }]
  }
  if (f.kind === 'swiss') {
    const s = h / 32, cx = w / 2
    const cross = `M${cx - 3 * s},${6 * s}h${6 * s}v${7 * s}h${7 * s}v${6 * s}h${-7 * s}v${7 * s}h${-6 * s}v${-7 * s}h${-7 * s}v${-6 * s}h${7 * s}z`
    return [{ d: r(0, 0, w, h), color: f.colors[0], label: [w * 0.12, h * 0.15] }, { d: cross, color: f.colors[1], label: [cx, h / 2] }]
  }
  // nordic: cross shifted toward the hoist (left in the real flag)
  const t = h * 0.22, x = w * 0.3, y = (h - t) / 2
  const crossPath = (tt, xx, yy) => `M${xx},0h${tt}v${yy}h${w - xx - tt}v${tt}h${-(w - xx - tt)}v${h - yy - tt}h${-tt}v${-(h - yy - tt)}h${-xx}v${-tt}h${xx}z`
  const regions = [{ d: r(0, 0, w, h), color: f.colors[0], label: [w * 0.13, h * 0.18] }, { d: crossPath(t, x, y), color: f.colors[1], label: [x + t / 2, h * 0.12] }]
  if (f.colors[2]) {
    const ti = t * 0.5, xi = x + (t - ti) / 2, yi = y + (t - ti) / 2
    regions[1].label = [x + (t - ti) / 4, h * 0.1, 0.6] // the white border is thin: smaller number on it
    regions.push({ d: crossPath(ti, xi, yi), color: f.colors[2], label: [w * 0.78, h / 2] })
  }
  return regions
}

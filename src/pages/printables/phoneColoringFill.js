// Pure helpers for PhoneColoring (tested in tests/phone-coloring.test.mjs).

// 1 where the drawing has a line (dark pixel), thickened by one pixel so tiny gaps don't leak.
export function buildLineMask(rgba, w, h, threshold = 170) {
  const dark = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const j = i * 4
    const lum = 0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2]
    // A transparent pixel is paper, whatever its colour.
    dark[i] = rgba[j + 3] > 40 && lum < threshold ? 1 : 0
  }
  const mask = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x
    mask[i] = dark[i] || (x > 0 && dark[i - 1]) || (x < w - 1 && dark[i + 1]) || (y > 0 && dark[i - w]) || (y < h - 1 && dark[i + w]) ? 1 : 0
  }
  return mask
}

// Fill the paper area around (x, y) with rgb. Returns false when the tap was on a line or the area
// already has that colour. The fill also creeps two pixels under the lines, so no white rim is left
// between the colour and the (multiplied) line art.
export function floodFill(rgba, mask, w, h, x, y, rgb) {
  if (x < 0 || y < 0 || x >= w || y >= h) return false
  let start = y * w + x
  if (mask[start]) {
    // A tap that lands on a line picks the nearest paper pixel next to it.
    start = -1
    for (let r = 1; r <= 3 && start < 0; r++) for (let dy = -r; dy <= r && start < 0; dy++) for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx, yy = y + dy
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && !mask[yy * w + xx]) { start = yy * w + xx; break }
    }
    if (start < 0) return false
  }
  const [r, g, b] = rgb
  const s4 = start * 4
  if (rgba[s4] === r && rgba[s4 + 1] === g && rgba[s4 + 2] === b) return false
  const seen = new Uint8Array(w * h)
  const stack = new Int32Array(w * h)
  let top = 0
  stack[top++] = start; seen[start] = 1
  const region = []
  while (top) {
    const i = stack[--top]
    region.push(i)
    const px = i % w
    if (px > 0) { const n = i - 1; if (!seen[n] && !mask[n]) { seen[n] = 1; stack[top++] = n } }
    if (px < w - 1) { const n = i + 1; if (!seen[n] && !mask[n]) { seen[n] = 1; stack[top++] = n } }
    if (i >= w) { const n = i - w; if (!seen[n] && !mask[n]) { seen[n] = 1; stack[top++] = n } }
    if (i < w * h - w) { const n = i + w; if (!seen[n] && !mask[n]) { seen[n] = 1; stack[top++] = n } }
  }
  // Two steps under the line pixels that border the area.
  let edge = region
  for (let step = 0; step < 2; step++) {
    const next = []
    for (const i of edge) {
      const px = i % w
      const ns = [px > 0 ? i - 1 : -1, px < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * h - w ? i + w : -1]
      for (const n of ns) if (n >= 0 && !seen[n] && mask[n]) { seen[n] = 1; next.push(n); region.push(n) }
    }
    edge = next
  }
  for (const i of region) { const j = i * 4; rgba[j] = r; rgba[j + 1] = g; rgba[j + 2] = b; rgba[j + 3] = 255 }
  return true
}

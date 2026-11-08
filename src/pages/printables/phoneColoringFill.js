// Pure helpers for PhoneColoring (tested in tests/phone-coloring.test.mjs).

// 1 where the drawing has a line. Grey anti-aliased edges count as line (threshold), and every line
// is thickened by `grow` pixels on each side, so small gaps in a drawn outline are closed and a
// fill stays inside it.
export function buildLineMask(rgba, w, h, threshold = 200, grow = 2) {
  let mask = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) {
    const j = i * 4
    const lum = 0.299 * rgba[j] + 0.587 * rgba[j + 1] + 0.114 * rgba[j + 2]
    // A transparent pixel is paper, whatever its colour.
    mask[i] = rgba[j + 3] > 40 && lum < threshold ? 1 : 0
  }
  // Square dilation, one row pass and one column pass.
  for (let pass = 0; pass < 2 && grow > 0; pass++) {
    const out = new Uint8Array(w * h)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (!mask[i]) continue
      for (let d = -grow; d <= grow; d++) {
        if (pass === 0) { const xx = x + d; if (xx >= 0 && xx < w) out[i + d] = 1 }
        else { const yy = y + d; if (yy >= 0 && yy < h) out[i + d * w] = 1 }
      }
    }
    mask = out
  }
  return mask
}

// Fill the paper area around (x, y) with rgb. Returns what the fill changed ({ idx, prev }, for
// undo), or null when the tap was on a line with no paper near it or the area already has that
// colour. The fill creeps `under` pixels under the lines, so no white rim is left between the
// colour and the (multiplied) line art.
export function floodFill(rgba, mask, w, h, x, y, rgb, under = 3) {
  if (x < 0 || y < 0 || x >= w || y >= h) return null
  let start = y * w + x
  if (mask[start]) {
    // A tap that lands on a line picks the nearest paper pixel next to it.
    start = -1
    for (let r = 1; r <= under + 3 && start < 0; r++) for (let dy = -r; dy <= r && start < 0; dy++) for (let dx = -r; dx <= r; dx++) {
      const xx = x + dx, yy = y + dy
      if (xx >= 0 && yy >= 0 && xx < w && yy < h && !mask[yy * w + xx]) { start = yy * w + xx; break }
    }
    if (start < 0) return null
  }
  const [r, g, b] = rgb
  const px = new Uint32Array(rgba.buffer, rgba.byteOffset, w * h)
  const probe = new Uint8ClampedArray([r, g, b, 255])
  const value = new Uint32Array(probe.buffer)[0]
  if (px[start] === value) return null
  const seen = new Uint8Array(w * h)
  const region = new Int32Array(w * h)
  let n = 0, top = 0
  const stack = new Int32Array(w * h)
  stack[top++] = start; seen[start] = 1
  while (top) {
    const i = stack[--top]
    region[n++] = i
    const cx = i % w
    if (cx > 0 && !seen[i - 1] && !mask[i - 1]) { seen[i - 1] = 1; stack[top++] = i - 1 }
    if (cx < w - 1 && !seen[i + 1] && !mask[i + 1]) { seen[i + 1] = 1; stack[top++] = i + 1 }
    if (i >= w && !seen[i - w] && !mask[i - w]) { seen[i - w] = 1; stack[top++] = i - w }
    if (i < w * h - w && !seen[i + w] && !mask[i + w]) { seen[i + w] = 1; stack[top++] = i + w }
  }
  // A few steps under the line pixels that border the area.
  let from = 0
  for (let step = 0; step < under; step++) {
    const to = n
    for (let k = from; k < to; k++) {
      const i = region[k], cx = i % w
      if (cx > 0 && !seen[i - 1] && mask[i - 1]) { seen[i - 1] = 1; region[n++] = i - 1 }
      if (cx < w - 1 && !seen[i + 1] && mask[i + 1]) { seen[i + 1] = 1; region[n++] = i + 1 }
      if (i >= w && !seen[i - w] && mask[i - w]) { seen[i - w] = 1; region[n++] = i - w }
      if (i < w * h - w && !seen[i + w] && mask[i + w]) { seen[i + w] = 1; region[n++] = i + w }
    }
    from = to
  }
  const idx = region.slice(0, n), prev = new Uint32Array(n)
  for (let k = 0; k < n; k++) { prev[k] = px[idx[k]]; px[idx[k]] = value }
  return { idx, prev }
}

// Put back what one fill changed.
export function undoFill(rgba, change) {
  if (change.full) { rgba.set(change.full); return }
  const px = new Uint32Array(rgba.buffer, rgba.byteOffset, rgba.length / 4)
  for (let k = 0; k < change.idx.length; k++) px[change.idx[k]] = change.prev[k]
}

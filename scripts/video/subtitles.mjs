// Subtitle lines for one narrated paragraph: split into short lines, each timed by its share of
// the text, then snapped to the nearest real pause in the recording (ffmpeg silencedetect).
import { spawnSync } from 'node:child_process'

export function splitLines(text, max = 70) {
  const sentences = text.match(/[^.!?…]+[.!?…]+["”]?|[^.!?…]+$/g).map(s => s.trim()).filter(Boolean)
  const out = []
  for (const s of sentences) {
    if (s.length <= max) { out.push(s); continue }
    // Long sentence: break after commas/colons/dashes, packing pieces up to `max`.
    let cur = ''
    for (const piece of s.split(/(?<=[,:—])\s+/)) {
      if (cur && (cur + ' ' + piece).length > max) { out.push(cur); cur = piece } else cur = cur ? cur + ' ' + piece : piece
    }
    if (cur) out.push(cur)
  }
  // Glue very short lines ("נכון," / "עוד כאן,") to the line before.
  return out.reduce((a, l) => { if (a.length && (l.length < 14 || a.at(-1).length < 14) && (a.at(-1) + ' ' + l).length <= max + 20) a[a.length - 1] += ' ' + l; else a.push(l); return a }, [])
}

export function pauses(file) {
  const p = spawnSync('ffmpeg', ['-nostdin', '-i', file, '-af', 'silencedetect=n=-32dB:d=0.18', '-f', 'null', '-'])
  const log = p.stderr.toString(), starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map(m => +m[1])
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1])
  return starts.map((s, i) => (s + (ends[i] ?? s)) / 2)
}

export function subtitleLines(text, file, d) {
  const lines = splitLines(text), total = lines.reduce((a, l) => a + l.length, 0)
  const marks = pauses(file).filter(m => m > 0.3 && m < d - 0.3)
  let acc = 0, prev = 0
  return lines.map((l, i) => {
    acc += l.length
    let to = i === lines.length - 1 ? d : (acc / total) * d
    if (i < lines.length - 1) {
      const near = marks.filter(m => m > prev + 0.6).sort((a, b) => Math.abs(a - to) - Math.abs(b - to))[0]
      if (near !== undefined && Math.abs(near - to) < 1.6) to = near
    }
    const line = { text: l, from: prev, to: i === lines.length - 1 ? d + 0.5 : to }
    prev = to
    return line
  })
}

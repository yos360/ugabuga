// Exact word timing: node ctc-unseen.mjs <slug> [textIndex] -> work/align/<slug>.json
// Forced alignment: a speech model scores every letter in every 20 ms of the recording, and because the text is known,
// the best path through those scores places each letter in time. Silences split the recording into sentences first.
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { AutoProcessor, AutoModelForCTC, AutoTokenizer } from '@huggingface/transformers'
import { say } from './say.mjs'

const REPO = 'C:/Users/pc/Documents/ugabuga'
const DATA = REPO + '/src/data/unseen/'
const FFMPEG = 'C:/Program Files/Photopia Director/ffmpeg.exe'
const OUT = 'C:/Users/pc/Documents/ugabuga-voice/work/align/'
mkdirSync(OUT, { recursive: true })
const [slug, xiArg = '0'] = process.argv.slice(2)
const xi = +xiArg

const SPEED = { g3: 0.92, g4: 0.92, g5: 0.92, g6: 0.92, g7: 0.93, g8: 0.93, g9: 0.93 }
let test
for (const f of readdirSync(DATA).filter(f => f.startsWith('tests-en'))) {
  const hit = (await import('file:///' + DATA + f)).TESTS.find(t => t.slug === slug)
  if (hit) test = hit
}
if (!test) throw new Error('no such test: ' + slug)
const x = test.texts[xi]
const pars = [...(x.title ? [x.title] : []), ...(x.paragraphs || [])]
const speed = SPEED[test.level] ?? 1
const mp3 = `${REPO}/public/audio/unseen/${createHash('sha1').update('even2af_heart' + speed + pars.map(say).join('\n')).digest('hex').slice(0, 8)}.mp3`
if (!existsSync(mp3)) throw new Error('no audio for ' + slug)

const raw = execFileSync(FFMPEG, ['-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 29 })
const audio = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4))
const dur = audio.length / 16000

const clean = s => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const cleanTts = s => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[—–]/g, ', ').replace(/•/g, '').replace(/\s+/g, ' ').trim()
function chunks(par) {
  const out = []
  for (const s of cleanTts(par).match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g) || []) {
    const t = s.trim()
    if (!t) continue
    if (t.length <= 220) { out.push(t); continue }
    let cur = ''
    for (const part of t.split(/(?<=[,;:])\s+/)) {
      if (cur && cur.length + part.length > 220) { out.push(cur); cur = part } else cur = cur ? cur + ' ' + part : part
    }
    if (cur) out.push(cur)
  }
  return out
}
const words = []
pars.forEach((p, pi) => clean(p).split(' ').forEach(w => words.push({ w, p: pi, title: !!x.title && pi === 0 })))

// sentences from the silences
const log = spawnSync(FFMPEG, ['-hide_banner', '-i', mp3, '-af', 'silencedetect=n=-40dB:d=0.28', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
const sil = [...log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => [+m[1], +m[2]])
const segs = []
let from = 0
for (const [s, e] of sil) { if (s > from + 0.05) segs.push({ t0: from, t1: s, gap: e - s }); from = e }
if (from < dur - 0.05) segs.push({ t0: from, t1: dur, gap: 0 })
// words per spoken block, counted by letters: the reader turned dashes into commas, so spaces do not line up
const lettersIn = s => s.replace(/[^A-Za-z0-9]/g, '').length
const blocks = []
{
  let w = 0
  for (const p of pars) for (const c of chunks(say(p))) {
    const need = lettersIn(c), start = w
    let got = 0
    while (w < words.length && got < need) got += lettersIn(say(words[w++].w))
    blocks.push(w - start)
  }
}
while (segs.length > blocks.length) {
  let at = 0
  for (let k = 0; k < segs.length - 1; k++) if (segs[k].gap < segs[at].gap) at = k
  segs[at] = { t0: segs[at].t0, t1: segs[at + 1].t1, gap: segs[at + 1].gap }
  segs.splice(at + 1, 1)
}
if (segs.length !== blocks.length) throw new Error(`speech blocks ${segs.length}, sentences ${blocks.length}`)

const ID = 'Xenova/wav2vec2-base-960h'
const proc = await AutoProcessor.from_pretrained(ID)
const tok = await AutoTokenizer.from_pretrained(ID)
const model = await AutoModelForCTC.from_pretrained(ID, { dtype: 'q8', device: 'cpu' })
const vocab = tok.model.tokens_to_ids
const SEP = vocab.get('|'), BLANK = 0
const lettersOf = (w) => w.toUpperCase().replace(/[^A-Z']/g, '')

async function alignBlock(part, s) {
  const pad = 0.12, a = Math.max(0, s.t0 - pad), z = Math.min(dur, s.t1 + pad)
  const slice = audio.slice(Math.floor(a * 16000), Math.ceil(z * 16000))
  const inputs = await proc(slice)
  const { logits } = await model(inputs)
  const [, T, V] = logits.dims, L = logits.data
  const lp = (t, c) => {
    let max = -Infinity, sum = 0
    const off = t * V
    for (let i = 0; i < V; i++) if (L[off + i] > max) max = L[off + i]
    for (let i = 0; i < V; i++) sum += Math.exp(L[off + i] - max)
    return L[off + c] - max - Math.log(sum)
  }
  // the tokens: letters of each word, a separator between words
  const toks = [], owner = []
  part.forEach((w, wi) => {
    const l = lettersOf(say(w.w))
    if (!l) return
    if (toks.length) { toks.push(SEP); owner.push(-1) }
    for (const c of l) { toks.push(vocab.get(c)); owner.push(wi) }
  })
  const J = toks.length
  const dp = Array.from({ length: T + 1 }, () => new Float64Array(J + 1).fill(-Infinity))
  const back = Array.from({ length: T + 1 }, () => new Uint8Array(J + 1))
  dp[0][0] = 0
  for (let t = 0; t < T; t++) {
    const blank = lp(t, BLANK)
    for (let j = 0; j <= J; j++) {
      if (dp[t][j] === -Infinity) continue
      // stay: silence, or the same letter going on
      const stay = j > 0 ? Math.max(blank, lp(t, toks[j - 1])) : blank
      if (dp[t][j] + stay > dp[t + 1][j]) { dp[t + 1][j] = dp[t][j] + stay; back[t + 1][j] = 0 }
      if (j < J) { const e = dp[t][j] + lp(t, toks[j]); if (e > dp[t + 1][j + 1]) { dp[t + 1][j + 1] = e; back[t + 1][j + 1] = 1 } }
    }
  }
  const frame = (z - a) / T, first = {}, last = {}
  for (let t = T, j = J; t > 0; t--) {
    if (back[t][j] === 1) {
      j--
      const o = owner[j]
      if (o >= 0) { first[o] = t - 1; if (last[o] === undefined) last[o] = t - 1 }
    } else if (j > 0 && owner[j - 1] >= 0 && lp(t - 1, toks[j - 1]) > lp(t - 1, BLANK) && last[owner[j - 1]] === undefined) last[owner[j - 1]] = t - 1
  }
  part.forEach((w, wi) => { if (first[wi] !== undefined) { w.t0 = a + first[wi] * frame; w.t1 = a + (last[wi] + 1) * frame } })
}

let w0 = 0
for (const [b, len] of blocks.entries()) { await alignBlock(words.slice(w0, w0 + len), segs[b]); w0 += len }
// a word with no letters (a number) takes the gap between its neighbours
for (let a = 0; a < words.length; a++) if (words[a].t0 === undefined) {
  let b = a
  while (b < words.length && words[b].t0 === undefined) b++
  const p = a ? words[a - 1].t1 : 0, q = b < words.length ? words[b].t0 : dur
  for (let c = a; c < b; c++) { words[c].t0 = p + (q - p) * (c - a) / (b - a); words[c].t1 = p + (q - p) * (c - a + 1) / (b - a) }
}

// proof: every short pause inside a sentence must fall between two words
const log2 = spawnSync(FFMPEG, ['-hide_banner', '-i', mp3, '-af', 'silencedetect=n=-30dB:d=0.07', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
const small = [...log2.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => [+m[1], +m[2]])
let inside = 0, cut = []
for (const [s, e] of small) {
  const mid = (s + e) / 2, w = words.find(q => mid > q.t0 + 0.03 && mid < q.t1 - 0.03)
  if (w) cut.push(`${w.w}@${mid.toFixed(2)}`); else inside++
}
// Only words a pupil at this level may not know get a translation: anything taught two grades earlier is easy.
const { VOCAB_GRADES } = await import('file:///' + REPO + '/src/data/englishVocab.js')
const gradeOf = (lv) => (/^g\d/.test(lv) ? +lv.slice(1) : 10)
const knownBy = gradeOf(test.level) - 2
const known = new Set(`old young new big small good bad happy sad afraid angry tired hungry late early first last family friend friends
  school teacher student children water sand beach pool face home day week year summer winter swim swam learn learned teach taught
  laugh laughed go went come came see saw look looked take took give gave make made find found think thought know knew`.split(/\s+/))
for (const g of VOCAB_GRADES) if (g.n <= knownBy) for (const u of g.units) for (const [en] of u.words) known.add(en.toLowerCase())
const bases = (w) => {
  const out = [w]
  for (const [end, add] of [['iest', 'y'], ['ier', 'y'], ['ies', 'y'], ['ied', 'y'], ['est', ''], ['est', 'e'], ['er', ''], ['er', 'e'], ['ing', ''], ['ing', 'e'], ['ed', ''], ['ed', 'e'], ['es', ''], ['s', ''], ['ly', '']]) {
    if (!w.endsWith(end)) continue
    const b = w.slice(0, -end.length) + add
    out.push(b)
    if (!add && /(.)\1$/.test(b)) out.push(b.slice(0, -1))
  }
  return out
}
const isEasy = (en) => en.toLowerCase().split(/\s+/).every(p => bases(p).some(b => known.has(b)))
const glossary = (test.glossary || []).filter(([en]) => !isEasy(en))
console.log('translated:', glossary.map(g => g[0]).join(', '), '| easy:', (test.glossary || []).filter(([en]) => isEasy(en)).map(g => g[0]).join(', '))
const { UNSEEN_LEVELS } = await import('file:///' + DATA + 'levels.js')
const levelName = UNSEEN_LEVELS.find(l => l.id === test.level && l.lang === 'en').name.replace(/\s*\(.*\)/, '')
writeFileSync(`${OUT}${slug}#${xi}.json`, JSON.stringify({ slug, xi, title: test.title, levelName, summary: test.summary, level: test.level, topic: test.topic, mp3, duration: dur, glossary, questions: test.questions, words }))
console.log(`aligned ${slug}: ${blocks.length} sentences, ${words.length} words, ${dur.toFixed(1)}s`)
console.log(`pauses between words: ${inside}/${small.length}`, cut.slice(0, 12).join(' '))
console.log(words.slice(0, 16).map(w => `${w.w}@${w.t0.toFixed(2)}-${w.t1.toFixed(2)}`).join(' '))

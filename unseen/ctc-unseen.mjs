// Exact word timing: node ctc-unseen.mjs <slug> [textIndex] -> work/align/<slug>.json
// Forced alignment: a speech model scores every letter in every 20 ms of the recording, and because the text is known,
// the best path through those scores places each letter in time. Silences split the recording into sentences first.
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { AutoProcessor, AutoModelForCTC, AutoTokenizer } from '@huggingface/transformers'
import { inTwo, say } from './say.mjs'

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
const name = createHash('sha1').update('even2af_heart' + speed + pars.map(say).join('\n')).digest('hex').slice(0, 8)
// A new recording that the site does not play yet (it waits for the audio bucket, see pending-audio/README.txt) comes first.
const PENDING = 'C:/Users/pc/Documents/ugabuga-voice/work/pending-audio/'
const mp3 = existsSync(PENDING + name + '.mp3') ? PENDING + name + '.mp3' : `${REPO}/public/audio/unseen/${name}.mp3`
if (!existsSync(mp3)) throw new Error('no audio for ' + slug)

const raw = execFileSync(FFMPEG, ['-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 29 })
const audio = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.length / 4))
const dur = audio.length / 16000

const clean = s => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
const cleanTts = s => s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[—–]/g, ', ').replace(/•/g, '').replace(/\s+/g, ' ').trim()
function chunks(par) {
  const out = []
  // the same sentences as gen-unseen.mjs: the dot inside a number (3.05) does not end one
  for (const s of cleanTts(par).match(/(?:[^.!?]|\.(?=\d))+[.!?]+["')]*\s*|(?:[^.!?]|\.(?=\d))+$/g) || []) {
    const t = s.trim()
    if (!t) continue
    if (t.length <= 220) { out.push(...inTwo(t)); continue }
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
// Digits carry no letters, so the narrator's words for them are spelled out here (the screen keeps the digits).
const ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(' ')
const TENS = ' ten twenty thirty forty fifty sixty seventy eighty ninety'.split(' ')
const int = (n) => n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
  : n < 1000 ? ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + int(n % 100) : '')
  : n < 1e6 ? int(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + int(n % 1000) : '')
  : int(Math.floor(n / 1e6)) + ' million' + (n % 1e6 ? ' ' + int(n % 1e6) : '')
const year = (n) => (n >= 1100 && n < 2000) || (n >= 2010 && n < 2100) ? int(Math.floor(n / 100)) + ' ' + (n % 100 ? (n % 100 < 10 ? 'oh ' : '') + int(n % 100) : 'hundred') : int(n)
const spell = (s) => s.replace(/(\d+(?:,\d{3})*)(?:([.:])(\d+))?(%|st|nd|rd|th|s)?/g, (m, a, sep, b, end) => {
  const n = +a.replace(/,/g, '')
  // a phone number is read digit by digit, but a leading zero before a short number is just "zero"
  if (!sep && !a.includes(',') && (a.length > 4 || /^0+$/.test(a))) return ' ' + [...a].map(d => ONES[+d]).join(' ') + ' '
  if (!sep && a.length > 1 && a[0] === '0') return ' zero ' + int(n) + ' '
  let out = !a.includes(',') && a.length === 4 && !sep ? year(n) : int(n)
  if (sep === '.') out += ' point ' + [...b].map(d => ONES[+d]).join(' ')
  if (sep === ':') out += +b ? ' ' + (+b < 10 ? 'oh ' : '') + int(+b) : " o'clock"
  if (end === '%') out += ' percent'
  else if (end === 's') out = out.replace(/y$/, 'ie') + 's'
  else if (end) out += 'th'
  return ' ' + out + ' '
})
// the spoken parts of one written word: "2,000" is TWO THOUSAND, "13-year-old" is THIRTEEN YEAR OLD; quotes around a word are not sounds
const piecesOf = (w) => spell(w).split(/[\s\-–—/]+/).map(p => p.toUpperCase().replace(/[^A-Z']/g, '').replace(/^'+|'+$/g, '')).filter(Boolean)

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
  // the tokens: letters of each word, a separator between words (and between the spoken parts of one word: owner -2 - word)
  const toks = [], owner = []
  part.forEach((w, wi) => piecesOf(say(w.w)).forEach((l, k) => {
    if (toks.length) { toks.push(SEP); owner.push(k ? -2 - wi : -1) }
    for (const c of l) { toks.push(vocab.get(c)); owner.push(wi) }
  }))
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
  // what the model hears on its own, without the text: a dropped or extra word shows up here
  let heard = '', prev = -1
  for (let t = 0; t < T; t++) {
    let best = 0
    for (let c = 1; c < V; c++) if (L[t * V + c] > L[t * V + best]) best = c
    if (best !== prev && best !== BLANK) heard += best === SEP ? ' ' : tok.model.vocab[best]
    prev = best
  }
  const frame = (z - a) / T, first = {}, last = {}, at = []
  for (let t = T, j = J; t > 0; t--) {
    if (back[t][j] === 1) {
      j--
      const o = owner[j]
      at[j] = a + (t - 1) * frame
      if (o >= 0) { first[o] = t - 1; if (last[o] === undefined) last[o] = t - 1 }
    } else if (j > 0 && owner[j - 1] >= 0 && lp(t - 1, toks[j - 1]) > lp(t - 1, BLANK) && last[owner[j - 1]] === undefined) last[owner[j - 1]] = t - 1
  }
  part.forEach((w, wi) => { if (first[wi] !== undefined) { w.t0 = a + first[wi] * frame; w.t1 = a + (last[wi] + 1) * frame } })
  // when each letter is heard (a space: the gap between two spoken parts of one word), for the pause check below
  part.forEach((w, wi) => { w.at = toks.flatMap((c, j) => owner[j] === wi || owner[j] === -2 - wi ? [[c === SEP ? ' ' : tok.model.vocab[c], at[j]]] : []) })
  return { want: toks.map(c => c === SEP ? ' ' : tok.model.vocab[c]).join(''), heard: heard.trim() }
}

let w0 = 0
const heard = []
for (const [b, len] of blocks.entries()) { heard.push(await alignBlock(words.slice(w0, w0 + len), segs[b])); w0 += len }
// a word with no letters (a number) takes the gap between its neighbours
for (let a = 0; a < words.length; a++) if (words[a].t0 === undefined) {
  let b = a
  while (b < words.length && words[b].t0 === undefined) b++
  const p = a ? words[a - 1].t1 : 0, q = b < words.length ? words[b].t0 : dur
  for (let c = a; c < b; c++) { words[c].t0 = p + (q - p) * (c - a) / (b - a); words[c].t1 = p + (q - p) * (c - a + 1) / (b - a) }
}

// proof 1: the narration says the text. The model also listens with no text at all, and what it hears is compared,
// letter by letter, with each sentence. Names and numbers come out a little different (TALIA for TALYA), so a sentence
// fails only when a real part of it is missing, extra or different: a cut, a skipped word, a recording of another text.
// edits between the text's letters p and the heard letters q, and the longest run of letters missing from (or added to)
// what was heard: a misheard name changes letters here and there, a skipped or extra word is a run of its own
const compare = (p, q) => {
  const d = Array.from({ length: p.length + 1 }, (_, i) => Int32Array.from({ length: q.length + 1 }, (_, j) => i + j))
  for (let i = 1; i <= p.length; i++) for (let j = 1; j <= q.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (p[i - 1] === q[j - 1] ? 0 : 1))
  let i = p.length, j = q.length, run = 0, gap = 0, kind = ''
  while (i > 0 || j > 0) {
    const k = i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (p[i - 1] === q[j - 1] ? 0 : 1) ? 'm' : i > 0 && d[i][j] === d[i - 1][j] + 1 ? 'del' : 'ins'
    run = k !== 'm' && k === kind ? run + 1 : k === 'm' ? 0 : 1
    kind = k
    gap = Math.max(gap, run)
    if (k !== 'ins') i--
    if (k !== 'del') j--
  }
  return { e: d[p.length][q.length], gap }
}
// a short line (a title, "Hanukkah Week") is mostly a name the model does not know, so only its runs count there
const MISHEARD = 0.4, GAP = 8, MIN_LETTERS = 20
const misheard = heard.map(h => ({ ...h, n: h.want.replace(/ /g, '').length, ...compare(h.want.replace(/ /g, ''), h.heard.replace(/ /g, '')) }))
const offText = misheard.filter(h => (h.n >= MIN_LETTERS && h.e / h.n > MISHEARD) || h.gap >= GAP)

// proof 2: every pause inside a sentence falls between two words. Inside a word, a stop consonant (the p of "kept", the
// k of "picked") or a quiet f, th or h is a short silence of its own, under a fifth of a second; a longer silence inside a
// word means the words are in the wrong place or the reading broke off. Between the spoken parts of one written word
// ("2,000", "13-year-old") a pause is fine, and a dash or other sign with no letters has no place of its own to check.
const CLOSURE = 0.2
const log2 = spawnSync(FFMPEG, ['-hide_banner', '-i', mp3, '-af', 'silencedetect=n=-30dB:d=0.07', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
const small = [...log2.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(m => [+m[1], +m[2]])
let inside = 0, closures = 0
const cut = []
for (const [s, e] of small) {
  const mid = (s + e) / 2, w = words.find(q => q.at?.length && mid > q.t0 + 0.03 && mid < q.t1 - 0.03)
  const k = w ? w.at.findIndex(([, t]) => t > mid) : -1
  if (!w || (k > 0 && (w.at[k - 1][0] === ' ' || w.at[k][0] === ' '))) inside++
  else if (e - s < CLOSURE) { inside++; closures++ } else cut.push(`${w.w}@${mid.toFixed(2)}(${(e - s).toFixed(2)}s)`)
}
if (process.env.DIAG) writeFileSync(process.env.DIAG, JSON.stringify({ slug, xi, cut, closures, misheard: misheard.map(({ want, heard, n, e, gap }) => ({ want, heard, n, e, gap })) }))
for (const w of words) delete w.at
const heardPct = 100 - 100 * misheard.reduce((s, h) => s + h.e, 0) / misheard.reduce((s, h) => s + h.n, 0)
console.log(`heard as written: ${heardPct.toFixed(1)}% of letters (${offText.length} sentences off); short stops inside words: ${closures}`)
if (offText.length) throw new Error(`narration does not match the text in ${offText.length} sentence(s): ` + offText.map(h => `"${h.want}" heard "${h.heard}"`).join(" | "))
// with stops and quiet consonants set aside, nothing is left over in a good recording, so one long pause inside a word is enough to fail
if (cut.length) throw new Error(`pauses between words: ${inside}/${small.length} — a long pause inside a word: ${cut.join(" ")}`)

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

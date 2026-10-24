// Registry of the speech-sound practice sets (/speech/sounds/<id>).
//
// ADDING A SOUND = 3 small steps:
//   1. a data file src/data/speech/sound-<id>.js (schema below — copy sound-r.js as a start);
//   2. one line in SOUNDS below (meta + lazy import);
//   3. one <Route path="/speech/sounds/<id>" element={<SoundPage id="<id>" />} /> in src/App.jsx
//      and one <url> in public/sitemap-static.xml (+ a searchStatic entry if you like).
// The hub (/speech), the card maker (/speech/card-maker) and tests/speech-sounds.test.mjs pick the
// new sound up from this list automatically.
//
// ---------------------------------------------------------------------------------------------
// DATA FILE SCHEMA (export default { ... }):
//   id          'r'                       — URL slug, same as the registry id
//   sound       'ר'                       — how the sound is shown in titles ("הצליל ר׳")
//   letters     ['ר']                     — letters that make this sound. Add a mark when the
//                                            sound depends on it: 'שׂ' (sin = /s/), 'כּ' (dagesh = /k/).
//                                            Bare 'ש' never matches שׂ.
//   ipa         'ʁ'
//   about       [string]                  — 2–4 short paragraphs: what the sound is and where it is
//                                            made, in plain words. No diagnosis, no medical promises.
//   variation   string                    — accents/variants that are NOT errors (optional)
//   acquisition { range, note, source: { label, href } } — a range, never an exact age
//   words       { initial: [W], medial: [W], final: [W] }  — 12–20 each where Hebrew allows.
//                 W = { w: 'רכבת', e: '🚂' }. `w` is written plainly (no vowels), keeping only a
//                 distinguishing mark (שׂ, כּ…) when it decides the sound. `e` is an emoji only when a
//                 fitting one exists — never a misleading one. Position is by PRONUNCIATION:
//                 initial = the word starts with the sound; final = it is the last sound;
//                 medial = anywhere in between (e.g. מורה: ר is followed by a vowel → medial).
//   clusters    [W]                       — the sound next to another consonant (פרי, ספוג, שׂמלה)
//   syllables   { initial: [s], medial: [s], final: [s] } — vocalised syllables (רָ, אָרָה, אַר)
//   phrases     [{ t, e }]                — 2–3 word phrases, rich in the sound
//   sentences   [{ t, e }]                — 8–12 short sentences
//   story       { title, text }           — original, 80–150 words, dense with the sound
//   games       [{ title, text }]         — 2+ practice game ideas (no scoring the child's speech)
//   tips        [string]                  — short tips for parents/clinicians (optional)
//   seo         { title, description, h1, sub, quickQ, quickA, keys }
//   faq         [{ q, a }]
// ---------------------------------------------------------------------------------------------

// Every sound the category plans to cover, in the hub's order. `ready` sounds have a data file.
export const PLANNED_SOUNDS = [
  { id: 'r', sound: 'ר', label: 'ר׳' },
  { id: 'l', sound: 'ל', label: 'ל׳' },
  { id: 's', sound: 'ס', label: 'ס׳ / שׂ', },
  { id: 'sh', sound: 'ש', label: 'ש׳' },
  { id: 'ts', sound: 'צ', label: 'צ׳' },
  { id: 'z', sound: 'ז', label: 'ז׳' },
  { id: 'k', sound: 'ק', label: 'ק׳ / כּ' },
  { id: 'g', sound: 'ג', label: 'ג׳' },
  { id: 'x', sound: 'ח', label: 'ח׳ / כ' },
]

// The sounds that exist. `load()` resolves to the data module (default export = the data object).
export const SOUNDS = [
  { id: 'r', sound: 'ר', label: 'ר׳', path: '/speech/sounds/r', emoji: '🚂', load: () => import('./sound-r.js') },
  { id: 's', sound: 'ס', label: 'ס׳ / שׂ', path: '/speech/sounds/s', emoji: '🐴', load: () => import('./sound-s.js') },
  { id: 'sh', sound: 'ש', label: 'ש׳', path: '/speech/sounds/sh', emoji: '☀️', load: () => import('./sound-sh.js') },
]

export const soundMeta = id => SOUNDS.find(s => s.id === id) || null
export const soundPath = id => `/speech/sounds/${id}`

const cache = new Map()
export function loadSound(id) {
  const meta = soundMeta(id)
  if (!meta) return Promise.reject(new Error(`unknown sound ${id}`))
  if (!cache.has(id)) cache.set(id, meta.load().then(m => m.default))
  return cache.get(id)
}

export const POSITIONS = [
  ['initial', 'בתחילת המילה'],
  ['medial', 'באמצע המילה'],
  ['final', 'בסוף המילה'],
  ['clusters', 'צירופי עיצורים'],
]
export const POSITION_SHORT = { initial: 'תחילה', medial: 'אמצע', final: 'סוף', clusters: 'צירופים', all: 'הכול' }

export const LEVELS = [
  ['syllables', 'הברות'],
  ['words', 'מילים'],
  ['phrases', 'צירופים קצרים'],
  ['sentences', 'משפטים'],
]

// Words of a sound for a position ('all' = every position + clusters), each tagged with its position.
export function wordsFor(data, position = 'all') {
  const keys = position === 'all' ? ['initial', 'medial', 'final', 'clusters'] : [position]
  return keys.flatMap(k => (k === 'clusters' ? data.clusters || [] : data.words[k] || []).map(w => ({ ...w, pos: k })))
}

// Items for a level: [{ t, e, pos? }]. Syllables follow the position (clusters → initial syllables).
export function itemsFor(data, level, position = 'all') {
  if (level === 'words') return wordsFor(data, position).map(w => ({ t: w.w, e: w.e, pos: w.pos }))
  if (level === 'syllables') {
    const keys = position === 'all' ? ['initial', 'medial', 'final'] : [position === 'clusters' ? 'initial' : position]
    return keys.flatMap(k => (data.syllables[k] || []).map(t => ({ t, pos: k })))
  }
  return (data[level] || []).map(x => ({ t: x.t, e: x.e }))
}

// Hebrew points except dagesh (U+05BC) and the shin/sin dots (U+05C1/U+05C2) — the marks that change a sound.
const VOWELS = /[֑-ֻֽ-׀׃-ׇ]/g
export const plainHebrew = s => String(s || '').replace(/[֑-ׇ]/g, '')
// A word as letter units: base letter + its sound-deciding marks ('שׂ', 'כּ', 'ר').
export const letterUnits = s => String(s || '').normalize('NFC').replace(VOWELS, '').match(/[א-ת][ּׁׂ]*/g) || []
export function unitMatches(unit, target) {
  if (unit[0] !== target[0]) return false
  if (target === 'ש' && unit.includes('ׂ')) return false // sin is /s/, not /ʃ/
  return [...target.slice(1)].every(m => unit.includes(m))
}

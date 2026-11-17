import { rpcInit, rpcUrl } from './qrVariants.js'

// Home-page experiment "home-day": three versions of the home page, each with its own look and its own
// opening block — the time tunnel, "what should we make for you?", or a question to Buga-pedia (AI).
// Every visitor gets a random starting point once (localStorage) and moves to the next version each
// day (Israel time), so a returning visitor sees something different daily and, on any given day, the
// three versions are shown to about the same number of people. Every count is sent at most once per
// browser tab, and only for tabs that saw the home page. The owner's browser is left out (it can preview
// a version with /?exp=ai). Kept tiny: PrintPreview imports it.
export const HOME_EXPERIMENT = 'home-day'
export const HOME_VARIANTS = ['tunnel', 'request', 'ai']
const KEY = `buga-exp-${HOME_EXPERIMENT}`, SEEN = `buga-exp-seen-${HOME_EXPERIMENT}`
const ownerDevice = () => { try { return localStorage.getItem('buga-owner-device') === '1' && localStorage.getItem('buga-track-self') !== '1' } catch { return false } }
// Days since 1970 on the Israeli calendar day (UTC+2 is close enough: the switch lands at 1–2 am).
export const israelDay = (now = Date.now()) => Math.floor((now + 2 * 3600000) / 86400000)

export function homeVariant(search = location.search, rand = Math.random(), now = Date.now()) {
  const forced = new URLSearchParams(search).get('exp')
  if (HOME_VARIANTS.includes(forced)) return forced
  const n = HOME_VARIANTS.length
  let offset
  try {
    offset = Number.parseInt(localStorage.getItem(KEY), 10)
    if (!(offset >= 0 && offset < n)) { offset = Math.floor(rand * n) % n; localStorage.setItem(KEY, String(offset)) }
  } catch { offset = Math.floor(rand * n) % n }
  return HOME_VARIANTS[(israelDay(now) + offset) % n]
}

// Second experiment, "home-kind" (17.11.2026): FOUR kinds of home page by who is visiting — printing
// parents, teachers, kindergarten, kids who want to play. Each kind has its own headline and its own fixed
// set of cards (src/data/homeKinds.js), instead of one page whose cards rotate. A visitor gets a kind
// once (localStorage) and keeps it, so the page does not change under them. /?kind=class previews one.
export const KIND_EXPERIMENT = 'home-kind'
export const HOME_KINDS = ['print', 'class', 'gan', 'play']
const KIND_KEY = `buga-exp-${KIND_EXPERIMENT}`, KIND_SEEN = `buga-exp-seen-${KIND_EXPERIMENT}`

export function homeKind(search = location.search, rand = Math.random()) {
  const forced = new URLSearchParams(search).get('kind')
  if (HOME_KINDS.includes(forced)) return forced
  try {
    const saved = localStorage.getItem(KIND_KEY)
    if (HOME_KINDS.includes(saved)) return saved
    const pick = HOME_KINDS[Math.floor(rand * HOME_KINDS.length) % HOME_KINDS.length]
    localStorage.setItem(KIND_KEY, pick)
    return pick
  } catch { return HOME_KINDS[Math.floor(rand * HOME_KINDS.length) % HOME_KINDS.length] }
}

const send = (experiment, variant, kind) => { void fetch(rpcUrl('record_experiment_event'), rpcInit({ p_experiment: experiment, p_variant: variant, p_kind: kind }, true)).catch(() => {}) }

// kind: 'shown' (call on the home page) | 'click' | 'print' | 'request'. Also counts the same event for
// the visitor's home kind, so every existing caller (print preview, request form…) feeds both reports.
export function recordHomeKind(kind, variant) {
  try {
    if (ownerDevice() || new URLSearchParams(location.search).has('kind')) return
    if (kind === 'shown') sessionStorage.setItem(KIND_SEEN, variant)
    const v = sessionStorage.getItem(KIND_SEEN)
    if (!v || sessionStorage.getItem(`${KIND_SEEN}:${kind}`)) return
    sessionStorage.setItem(`${KIND_SEEN}:${kind}`, '1')
    send(KIND_EXPERIMENT, v, kind)
  } catch { /* storage blocked: not counted */ }
}

export function recordExperiment(kind, variant) {
  if (kind !== 'shown') recordHomeKind(kind) // 'shown' for the kind is sent by the home page itself
  try {
    if (ownerDevice() || new URLSearchParams(location.search).has('exp')) return
    if (kind === 'shown') sessionStorage.setItem(SEEN, variant)
    const v = sessionStorage.getItem(SEEN)
    if (!v || sessionStorage.getItem(`${SEEN}:${kind}`)) return
    sessionStorage.setItem(`${SEEN}:${kind}`, '1')
    send(HOME_EXPERIMENT, v, kind)
  } catch { /* storage blocked: not counted */ }
}

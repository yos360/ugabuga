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

// kind: 'shown' (call on the home page) | 'click' | 'print' | 'request'
export function recordExperiment(kind, variant) {
  try {
    if (ownerDevice() || new URLSearchParams(location.search).has('exp')) return
    if (kind === 'shown') sessionStorage.setItem(SEEN, variant)
    const v = sessionStorage.getItem(SEEN)
    if (!v || sessionStorage.getItem(`${SEEN}:${kind}`)) return
    sessionStorage.setItem(`${SEEN}:${kind}`, '1')
    void fetch(rpcUrl('record_experiment_event'), rpcInit({ p_experiment: HOME_EXPERIMENT, p_variant: v, p_kind: kind }, true)).catch(() => {})
  } catch { /* storage blocked: not counted */ }
}

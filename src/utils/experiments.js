import { rpcInit, rpcUrl } from './qrVariants.js'

// Home-page experiment "home-top": which block a visitor sees first. A visitor is assigned once
// (localStorage) and keeps the variant; every count is sent at most once per browser tab, and only
// for tabs that saw the home page — so the report compares like with like. The owner's browser is left
// out (it can preview a variant with /?exp=live). Kept tiny: PrintPreview imports it.
export const HOME_EXPERIMENT = 'home-top'
export const HOME_VARIANTS = ['search', 'live', 'request', 'bring', 'rsvp']
const KEY = `buga-exp-${HOME_EXPERIMENT}`, SEEN = `buga-exp-seen-${HOME_EXPERIMENT}`
const ownerDevice = () => { try { return localStorage.getItem('buga-owner-device') === '1' && localStorage.getItem('buga-track-self') !== '1' } catch { return false } }

export function homeVariant(search = location.search, rand = Math.random()) {
  const forced = new URLSearchParams(search).get('exp')
  if (HOME_VARIANTS.includes(forced)) return forced
  try {
    const saved = localStorage.getItem(KEY)
    if (HOME_VARIANTS.includes(saved)) return saved
    const pick = HOME_VARIANTS[Math.floor(rand * HOME_VARIANTS.length) % HOME_VARIANTS.length]
    localStorage.setItem(KEY, pick)
    return pick
  } catch { return 'search' }
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

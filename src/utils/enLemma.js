// The dictionary forms to try for an English word as it appears in a text: "studied" → study,
// "running" → run, "children" → child (irregular forms come from en-irregular.js).
export function lemmaCandidates(word, irregular = {}) {
  const w = String(word).toLowerCase().replace(/[’']s$/, '').replace(/[’']/g, "'")
  const out = [w]
  const add = x => { if (x && x.length > 1 && !out.includes(x)) out.push(x) }
  if (irregular[w]) add(irregular[w])
  const undouble = s => (/([bcdfghjklmnpqrstvwxz])\1$/.test(s) ? s.slice(0, -1) : null)
  if (w.endsWith('ies')) add(w.slice(0, -3) + 'y')
  if (w.endsWith('es')) add(w.slice(0, -2))
  if (w.endsWith('s') && !w.endsWith('ss')) add(w.slice(0, -1))
  if (w.endsWith('ied')) add(w.slice(0, -3) + 'y')
  if (w.endsWith('ed')) { const s = w.slice(0, -2); add(s); add(s + 'e'); add(undouble(s)) }
  if (w.endsWith('d')) add(w.slice(0, -1))
  if (w.endsWith('ing')) { const s = w.slice(0, -3); add(s); add(s + 'e'); add(undouble(s)); if (s.endsWith('y')) add(s.slice(0, -1) + 'ie') }
  if (w.endsWith('ily')) add(w.slice(0, -3) + 'y')
  if (w.endsWith('ly')) { add(w.slice(0, -2)); add(w.slice(0, -2) + 'le') }
  if (w.endsWith('ier')) add(w.slice(0, -3) + 'y')
  if (w.endsWith('iest')) add(w.slice(0, -4) + 'y')
  if (w.endsWith('er')) { const s = w.slice(0, -2); add(s); add(s + 'e'); add(undouble(s)) }
  if (w.endsWith('est')) { const s = w.slice(0, -3); add(s); add(s + 'e'); add(undouble(s)) }
  return out
}

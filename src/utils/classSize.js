// "Print for the whole class": the teacher's class size, remembered on this device only.
const KEY = 'buga-class-size'
export const CLASS_MIN = 2, CLASS_MAX = 40, CLASS_DEFAULT = 30

export function clampClassSize(n) {
  const v = Math.round(Number(n))
  if (!Number.isFinite(v)) return CLASS_DEFAULT
  return Math.min(CLASS_MAX, Math.max(CLASS_MIN, v))
}
export function loadClassSize() {
  try { const v = localStorage.getItem(KEY); return v == null ? CLASS_DEFAULT : clampClassSize(v) } catch { return CLASS_DEFAULT }
}
export function saveClassSize(n) {
  try { localStorage.setItem(KEY, String(clampClassSize(n))) } catch { /* private mode */ }
}
// The count options shown in the print toolbar, with the class size added when it isn't one of them.
export function countOptions(base, extra) {
  return [...new Set([...base, extra])].filter(n => n >= 1).sort((a, b) => a - b)
}

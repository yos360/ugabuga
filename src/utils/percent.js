export const VAT_RATE = 18

// Accept decimal comma or dot, and grouped thousands (1,234.5 / 1,234).
export function parseNumber(value) {
  let s = String(value ?? '').trim().replace(/[\s\u00a0]/g, '')
  if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replaceAll(',', '')
  else if (/^[+-]?\d+,\d+$/.test(s)) s = s.replace(',', '.')
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export const formatNumber = n => new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 }).format(Object.is(n, -0) ? 0 : n)
const finite = n => Number.isFinite(n) ? n : null
export function percentOf(x, y) { return finite(x / 100 * y) }
export function whatPercent(x, y) { return y === 0 ? null : finite(x / y * 100) }
// Absolute baseline gives a signed increase/decrease even for negative starting values.
export function percentChange(a, b) { return a === 0 ? null : finite((b - a) / Math.abs(a) * 100) }
export function afterDiscount(price, rate) { return price < 0 || rate < 0 || rate > 100 ? null : finite(price * (1 - rate / 100)) }
export function beforeDiscount(price, rate) { return price < 0 || rate < 0 || rate >= 100 ? null : finite(price / (1 - rate / 100)) }
export function addVat(price) { return finite(price * (1 + VAT_RATE / 100)) }
export function removeVat(price) { return finite(price / (1 + VAT_RATE / 100)) }

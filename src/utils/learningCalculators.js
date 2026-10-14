export function adultBmi(weight, height, age) {
  if (![weight, height, age].every(Number.isFinite) || weight <= 0 || height <= 0 || age < 20) throw new Error('יש להזין גיל 20 ומעלה, משקל וגובה חיוביים.')
  const bmi = weight / (height / 100) ** 2
  if (!Number.isFinite(bmi)) throw new Error('יש לבדוק את הנתונים.')
  const category = bmi < 18.5 ? 'מתחת לטווח הייחוס (תת־משקל)' : bmi < 25 ? 'בטווח הייחוס' : bmi < 30 ? 'מעל טווח הייחוס (עודף משקל)' : 'בקטגוריית השמנה לפי המדד'
  return { bmi, category }
}

export function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1 }
export function fraction(n, d = 1) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || !d) throw new Error('השבר גדול מדי או שהמכנה אפס.')
  const g = gcd(n, d) * Math.sign(d)
  return { n: n / g, d: d / g }
}
export function parseFraction(text) {
  const s = String(text).trim().replaceAll('−', '-')
  let m = s.match(/^([+-]?)(\d+)\s+(\d+)\/(\d+)$/)
  if (m) { if (+m[3] >= +m[4]) throw new Error('בחלק השברי של מספר מעורב המונה קטן מהמכנה.'); return fraction((+m[2] * +m[4] + +m[3]) * (m[1] === '-' ? -1 : 1), +m[4]) }
  m = s.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/)
  if (m) return fraction(+m[1], +m[2])
  m = s.match(/^([+-]?\d+)(?:\.(\d{1,6}))?(%)?$/)
  if (!m) throw new Error('כתבו שבר (3/4), מספר מעורב (1 1/2), עשרוני או אחוז.')
  const scale = 10 ** (m[2]?.length || 0)
  return fraction(Number(m[1] + (m[2] || '')), scale * (m[3] ? 100 : 1))
}
export function calculateFractions(a, b, op) {
  let n, d, step
  const f = x => `${x.n}/${x.d}`
  if (op === '+' || op === '-') {
    d = a.d / gcd(a.d, b.d) * b.d
    const x = a.n * (d / a.d), y = b.n * (d / b.d)
    n = op === '+' ? x + y : x - y
    step = `מכנה משותף: ${d}. מרחיבים: ${x}/${d} ${op} ${y}/${d} = ${n}/${d}`
  } else if (op === '*') { n = a.n * b.n; d = a.d * b.d; step = `כופלים מונה במונה ומכנה במכנה: ${f(a)} × ${f(b)} = ${n}/${d}` }
  else if (op === '/') { if (!b.n) throw new Error('אי אפשר לחלק באפס.'); n = a.n * b.d; d = a.d * b.n; step = `כופלים בשבר ההופכי: ${f(a)} × ${b.d}/${b.n} = ${n}/${d}` }
  else throw new Error('בחרו פעולה.')
  const result = fraction(n, d), divisor = gcd(n, d)
  return { ...result, steps: [step, divisor > 1 ? `מצמצמים בחלוקה ב־${divisor}: ${f(result)}` : `השבר כבר מצומצם: ${f(result)}`] }
}
export function gradeAverage(rows, weighted) {
  const active = rows.filter(r => String(r.grade).trim() !== '')
  if (!active.length) return null
  let sum = 0, units = 0
  for (const r of active) {
    const grade = Number(r.grade), weight = weighted ? Number(r.units) : 1
    if (!Number.isFinite(grade) || grade < 0 || grade > 100 || !Number.isFinite(weight) || weight <= 0 || weight > 10) throw new Error('הציונים בין 0 ל־100 והיחידות גדולות מאפס ועד 10.')
    sum += grade * weight; units += weight
  }
  return { average: sum / units, count: active.length, units }
}
export function readGradeRows(value) {
  try { const rows = JSON.parse(value); if (Array.isArray(rows) && rows.length > 0 && rows.length <= 100 && rows.every(r => r && ['name', 'grade', 'units'].every(k => typeof r[k] === 'string'))) return rows } catch { /* local data may be unavailable */ }
  return [{ name: '', grade: '', units: '1' }]
}

// Practice questions in the style of the grade-5 entrance test for Bar-Ilan's math program for gifted youth:
// order of operations, invented operations, fractions, estimation, number puzzles and logic.
// Every question: { kind, q, f? (formula, shown left-to-right), options: [4 numbers/strings], answer, explain }.

export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296 }
}
const int = (r, a, b) => a + Math.floor(r() * (b - a + 1))
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]
const gcd = (a, b) => (b ? gcd(b, a % b) : a)
const lcm = (a, b) => (a * b) / gcd(a, b)
// Math inside a Hebrew sentence: a left-to-right isolate, so "25 + 64 − 4 = 85" isn't shown reversed.
export const m = s => `⁦${s}⁩`

// Four distinct options: the answer plus distractors (falling back to near values), in random order.
function withOptions(r, answer, wrong, item) {
  const seen = new Set([String(answer)])
  const opts = [answer]
  for (const w of [...wrong, answer + 1, answer - 1, answer + 2, answer * 2, answer + 10, answer - 2]) {
    if (opts.length === 4) break
    if (typeof w === 'number' && (!Number.isFinite(w) || w < 0)) continue
    if (seen.has(String(w))) continue
    seen.add(String(w)); opts.push(w)
  }
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[opts[i], opts[j]] = [opts[j], opts[i]] }
  return { ...item, options: opts, answer: opts.indexOf(answer) }
}

const KINDS = {
  order(r) {
    const e = int(r, 2, 6), d = e * int(r, 2, 9), b = int(r, 3, 9), c = int(r, 3, 9), a = int(r, 10, 60)
    const ans = a + b * c - d / e
    const leftToRight = ((a + b) * c - d) / e
    return withOptions(r, ans, [Number.isInteger(leftToRight) ? leftToRight : (a + b) * c - d / e, a + b * c - d, (a + b) * c - d / e], {
      kind: 'order', q: 'כמה זה?', f: `${a} + ${b} × ${c} − ${d} : ${e} = ?`,
      explain: `קודם כפל וחילוק: ${m(`${b} × ${c} = ${b * c}`)}, ${m(`${d} : ${e} = ${d / e}`)}. אחר כך חיבור וחיסור: ${m(`${a} + ${b * c} − ${d / e} = ${ans}`)}.`,
    })
  },
  invented(r) {
    const ops = [
      ['a ⊛ b = 2 × a + b', (a, b) => 2 * a + b, 'פעמיים המספר הראשון ועוד השני'],
      ['a ⊛ b = a × b − a', (a, b) => a * b - a, 'מכפלה פחות המספר הראשון'],
      ['a ⊛ b = a × a − b', (a, b) => a * a - b, 'הראשון בריבוע פחות השני'],
      ['a ⊛ b = (a + b) × 2', (a, b) => (a + b) * 2, 'הסכום כפול 2'],
    ]
    const [def, fn, words] = pick(r, ops)
    const x = int(r, 2, 5), y = int(r, 1, 4), z = int(r, 1, 3)
    const inner = fn(x, y), ans = fn(inner, z)
    if (inner < 1 || ans < 0) return KINDS.invented(r)
    return withOptions(r, ans, [fn(x, fn(y, z)), inner + z, fn(z, inner)], {
      kind: 'invented', q: `מגדירים פעולה חדשה (${words}): ${m(def)}. כמה זה?`, f: `(${x} ⊛ ${y}) ⊛ ${z} = ?`,
      explain: `מתחילים מהסוגריים: ${m(`${x} ⊛ ${y} = ${inner}`)}. אחר כך ${m(`${inner} ⊛ ${z} = ${ans}`)}.`,
    })
  },
  fractionOf(r) {
    const fr = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [5, 6]]
    const [p1, q1] = pick(r, fr), [p2, q2] = pick(r, fr)
    const n = q1 * q2 * int(r, 1, 4)
    const ans = (n * p1 * p2) / (q1 * q2)
    return withOptions(r, ans, [(n * p1) / q1, (n * p2) / q2, n - ans], {
      kind: 'fractions', q: `כמה הם ${p1}/${q1} מתוך ${p2}/${q2} של ${n}?`,
      explain: `${p2}/${q2} של ${n} הם ${(n * p2) / q2}. ו־${p1}/${q1} מזה הם ${ans}.`,
    })
  },
  fractionMax(r) {
    const pool = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 7], [5, 8], [5, 9], [7, 10], [2, 5], [4, 9], [5, 12], [7, 12]]
    const chosen = []
    while (chosen.length < 4) { const f = pick(r, pool); if (!chosen.some(c => c[0] * f[1] === f[0] * c[1])) chosen.push(f) }
    const best = chosen.reduce((m, f) => (f[0] / f[1] > m[0] / m[1] ? f : m))
    const label = f => `${f[0]}/${f[1]}`
    return withOptions(r, label(best), chosen.filter(f => f !== best).map(label), {
      kind: 'fractions', q: 'איזה שבר הכי גדול?',
      explain: `משווים כל שבר לחצי או מביאים למכנה משותף: ${m(`${label(best)} ≈ ${(best[0] / best[1]).toFixed(2)}`)}, וזה הגדול ביותר.`,
    })
  },
  estimate(r) {
    const a = pick(r, [49, 51, 98, 102, 199, 201, 299, 398, 402]), b = pick(r, [19, 21, 29, 31, 49, 51, 99, 101])
    const ra = Math.round(a / 10) * 10 >= 100 ? Math.round(a / 100) * 100 : Math.round(a / 10) * 10
    const rb = Math.round(b / 10) * 10
    const ans = ra * rb
    return withOptions(r, ans, [ans * 10, ans / 10, ans * 2, ra + rb], {
      kind: 'estimate', q: 'בלי לחשב בדיוק: לאיזה מספר הכי קרובה התוצאה?', f: `${a} × ${b}`,
      explain: `מעגלים: ${m(`${a} ≈ ${ra}`)}, ${m(`${b} ≈ ${rb}`)}. ${m(`${ra} × ${rb} = ${ans}`)}. התוצאה המדויקת היא ${a * b}.`,
    })
  },
  missing(r) {
    const k = int(r, 3, 9), x = int(r, 3, 12), s = int(r, 1, 9)
    const total = x * k - s
    return withOptions(r, x, [x + 1, x - 1, Math.round((total + s) / (k + 1))], {
      kind: 'puzzle', q: 'איזה מספר צריך לבוא במקום הריבוע?', f: `□ × ${k} − ${s} = ${total}`,
      explain: `מחזירים אחורה: ${m(`${total} + ${s} = ${total + s}`)}, ואז ${m(`${total + s} : ${k} = ${x}`)}.`,
    })
  },
  ages(r) {
    const son = int(r, 5, 12), dad = int(r, 30, 45), k = int(r, 3, 12), total = dad + son + 2 * k
    return withOptions(r, k, [2 * k, total - dad - son, k + 1], {
      kind: 'logic', q: `אבא בן ${dad} והבן שלו בן ${son}. בעוד כמה שנים סכום הגילים של שניהם יהיה ${total}?`,
      explain: `היום הסכום ${dad + son}. כל שנה שני הגילים עולים, אז הסכום גדל ב־2. צריך עוד ${total - dad - son}, כלומר ${m(`${total - dad - son} : 2 = ${k}`)} שנים.`,
    })
  },
  series(r) {
    const t = int(r, 0, 2)
    if (t === 0) { const a = int(r, 2, 9), d = int(r, 3, 12), s = [0, 1, 2, 3, 4].map(i => a + i * d), ans = a + 5 * d
      return withOptions(r, ans, [ans + d, ans - 1, s[4] + d + 1], { kind: 'series', q: 'מה המספר הבא בסדרה?', f: s.join(', ') + ', ?', explain: `בכל צעד מוסיפים ${d}: ${m(`${s[4]} + ${d} = ${ans}`)}.` }) }
    if (t === 1) { const a = int(r, 1, 4), x = int(r, 2, 3), s = [0, 1, 2, 3].map(i => a * x ** i), ans = s[3] * x
      return withOptions(r, ans, [s[3] + (s[3] - s[2]), ans + x, ans - x], { kind: 'series', q: 'מה המספר הבא בסדרה?', f: s.join(', ') + ', ?', explain: `בכל צעד כופלים ב־${x}: ${m(`${s[3]} × ${x} = ${ans}`)}.` }) }
    const a = int(r, 1, 6), s = [a]
    for (let i = 1; i < 6; i++) s.push(s[i - 1] + i)
    const ans = s[5] + 6
    return withOptions(r, ans, [s[5] + 5, s[5] + 7, ans + 2], { kind: 'series', q: 'מה המספר הבא בסדרה?', f: s.join(', ') + ', ?', explain: `ההפרשים גדלים: +1, +2, +3, +4, +5 — ועכשיו +6: ${m(`${s[5]} + 6 = ${ans}`)}.` })
  },
  sets(r) {
    const n = int(r, 24, 36), a = int(r, 10, 16), b = int(r, 8, 14), both = int(r, 3, 7)
    const none = n - (a + b - both)
    if (none < 1) return KINDS.sets(r)
    return withOptions(r, none, [n - a - b, n - (a + b), both, none + both].map(v => Math.max(0, v)), {
      kind: 'logic', q: `בכיתה ${n} תלמידים. ${a} אוהבים כדורגל, ${b} אוהבים כדורסל, ו־${both} מהם אוהבים את שניהם. כמה תלמידים לא אוהבים אף אחד מהשניים?`,
      explain: `מי שאוהב לפחות אחד: ${m(`${a} + ${b} − ${both} = ${a + b - both}`)} (את אלה שאוהבים את שניהם ספרנו פעמיים). לא אוהבים אף אחד: ${m(`${n} − ${a + b - both} = ${none}`)}.`,
    })
  },
  lcm(r) {
    const [a, b] = pick(r, [[4, 6], [6, 8], [6, 9], [4, 10], [8, 12], [9, 12], [10, 15], [6, 10], [12, 18]])
    const ans = lcm(a, b)
    return withOptions(r, ans, [a * b, ans * 2, a + b], {
      kind: 'puzzle', q: `מה המספר הקטן ביותר (גדול מ־0) שמתחלק גם ב־${a} וגם ב־${b} בלי שארית?`,
      explain: `עוברים על הכפולות של ${b}: ${b}, ${b * 2}, ${b * 3}… הראשונה שמתחלקת גם ב־${a} היא ${ans}.`,
    })
  },
  rectangle(r) {
    const w = int(r, 3, 9), h = int(r, w + 1, 14), p = 2 * (w + h)
    return withOptions(r, w * h, [p, w + h, (w + 1) * (h - 1)], {
      kind: 'geometry', q: `היקף של מלבן הוא ${p} ס״מ, ואחת הצלעות שלו ${w} ס״מ. מה השטח שלו בסמ״ר?`,
      explain: `חצי היקף: ${m(`${p} : 2 = ${w + h}`)}. הצלע השנייה: ${m(`${w + h} − ${w} = ${h}`)}. שטח: ${m(`${w} × ${h} = ${w * h}`)}.`,
    })
  },
}
export const KIND_LABELS = { order: 'סדר פעולות', invented: 'פעולה מומצאת', fractions: 'שברים', estimate: 'אומדן', puzzle: 'חידת מספרים', logic: 'היגיון', series: 'סדרות', geometry: 'גאומטריה' }
const ORDER = ['order', 'invented', 'fractionOf', 'estimate', 'missing', 'series', 'sets', 'fractionMax', 'ages', 'lcm', 'rectangle', 'invented']

export function makeTest(seed, count = 24) {
  const r = rng(seed)
  return Array.from({ length: count }, (_, i) => ({ id: `${seed}-${i}`, ...KINDS[ORDER[i % ORDER.length]](r) }))
}

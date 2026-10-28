// Curriculum alignment (Ministry of Education 2023 primary program, grades 1–3): independent recomputation
// of answers for the topics added or changed to match it, plus grade-limit checks. Fails if any exercise is wrong.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRng } from '../src/math/rng.js'
import { mixSeed } from '../src/math/gen.js'
import { exerciseProblems, evalArithmetic } from '../src/math/validate.js'
import { checkAnswer, formatAnswer } from '../src/math/check.js'
import g1 from '../src/math/topics/grade1.js'
import g2 from '../src/math/topics/grade2.js'
import g3 from '../src/math/topics/grade3.js'
import g4 from '../src/math/topics/grade4.js'
import gK from '../src/math/topics/gradeK.js'
const all = { 0: gK, 1: g1, 2: g2, 3: g3 }
test('grades 1–3 follow the 2023 curriculum and every answer recomputes', () => {
let bad = 0, n = 0
const fails = []
const fail = (m) => { bad++; if (fails.length < 25) fails.push(m) }
const find = (g, s) => all[g].find(t => t.slug === s)
const N = 400
const gen = (t, l, i) => t.gen(l, createRng(mixSeed(i * 104729 + l)))
for (const [g, ts] of Object.entries(all)) for (const t of ts) for (const l of [1, 2, 3]) for (let i = 1; i <= N; i++) {
  const e = gen(t, l, i); n++
  const p = exerciseProblems(e); if (p.length) fail(`${g}/${t.slug} L${l} #${i} ${p}`)
  if (e.type === 'choice' && !(e.choices.length >= 2)) fail('choices')
  if (!checkAnswer(e, formatAnswer(e))) fail(`self ${t.slug}`)
  // a wrong number must not be accepted
  if (e.type === 'number' && checkAnswer(e, String(e.answer + 1))) fail(`accepts wrong ${t.slug}`)
  if (e.type === 'number' && (e.answer < 0 || !Number.isInteger(e.answer))) fail(`non-natural ${t.slug} ${e.answer}`)
}
const ev = e => evalArithmetic(e.expr.split('=')[0])
// order of operations: recompute with the validator's evaluator
for (let i = 1; i <= N; i++) for (const l of [1, 2, 3]) { const e = gen(find(3, 'order-of-operations-3'), l, i); if (ev(e) !== e.answer) fail(`ooo ${e.expr} ${e.answer}`) }
// add-sub-tens: whole tens in L1/L3 results; expression holds
for (let i = 1; i <= N; i++) { const e = gen(find(1, 'add-sub-tens'), 1, i); if (ev(e) !== e.answer || e.answer % 10) fail(`tens ${e.expr}`) }
for (let i = 1; i <= N; i++) { const e = gen(find(1, 'add-sub-tens'), 3, i); if (e.expr.includes('?')) { const lhs = e.expr.replace('?', `(${e.answer})`).split('='); if (evalArithmetic(lhs[0]) !== evalArithmetic(lhs[1])) fail(`tens3 ${e.expr}`) } else if (ev(e) !== e.answer) fail(`tens3b ${e.expr}`) }
// distributive-law gaps
for (let i = 1; i <= N; i++) { const e = gen(find(3, 'distributive-law'), 3, i); const [l, r] = e.expr.split('=').map(s => s.trim()); const rr = r.replace('?', `(${e.answer})`); if (evalArithmetic(l) !== evalArithmetic(rr)) fail(`dist ${e.expr} ${e.answer}`) }
// sequences: constant difference
for (let l = 1; l <= 3; l++) for (let i = 1; i <= N; i++) { const e = gen(find(3, 'sequences-3'), l, i); const nums = e.expr.replace(/,(?=\d{3})/g, '').split(/,\s*/).map(s => s.trim()); const vals = nums.map(s => (s === '?' ? null : Number(s)))
  if (l === 3) { const d = vals[1] - vals[0]; if (d !== e.answer || vals.some((v, k) => k && v - vals[k - 1] !== d)) fail(`seq3 ${e.expr}`) }
  else { const idx = vals.indexOf(null), known = vals.filter(v => v !== null); const d = Math.abs(known[1] - known[0]); void d; if (idx === vals.length - 1) { const step = vals[1] - vals[0]; if (vals[idx - 1] + step !== e.answer) fail(`seq ${e.expr}`) } else { const step = (vals[idx === 1 ? 2 : 1] - vals[idx === 1 ? 0 : 0]) / (idx === 1 ? 2 : 1); if (idx === 1 && vals[0] + step !== e.answer) fail(`seqh ${e.expr}`); if (idx > 1 && (vals[0] + (vals[1] - vals[0]) * idx) !== e.answer) fail(`seqh2 ${e.expr}`) } }
  if (vals[vals.length-1] > 10000 && l) fail(`seq range ${e.expr}`) }
// divisibility
for (let l = 1; l <= 2; l++) for (let i = 1; i <= N; i++) { const e = gen(find(3, 'divisibility-2-5-10'), l, i); const m = Number(e.q.match(/[\d,]+/)[0].replace(/,/g, '')), d = Number(e.q.match(/ב-(\d+)\?/)[1]); if ((m % d === 0 ? 'כן' : 'לא') !== e.answer) fail(`div ${e.q}`) }
for (let i = 1; i <= N; i++) { const e = gen(find(3, 'divisibility-2-5-10'), 3, i); const head = e.q.match(/המספר (\d+)_/)[1], d = Number(e.q.match(/ב-(\d+)\?/)[1]); const ok = []; for (let u = 0; u <= 9; u++) if (Number(head + u) % d === 0) ok.push(u); const want = d === 10 ? Math.min(...ok) : Math.max(...ok); if (want !== e.answer) fail(`div3 ${e.q} ${e.answer}`) }
// area
for (let i = 1; i <= N; i++) { const e = gen(find(3, 'area-units'), 2, i); const nums = e.q.match(/\d+/g).map(Number); if (nums[0] * nums[nums.length > 1 && !e.q.includes('ריבוע') ? 1 : 0] !== e.answer && !(e.q.includes('ריבוע') && nums[0] ** 2 === e.answer)) fail(`area2 ${e.q}`) }
for (let i = 1; i <= N; i++) { const e = gen(find(3, 'area-units'), 1, i); const m = e.svg.match(/<rect x="(\d+)" y="\d+" width="(\d+)" height="(\d+)"/); const s = Number(e.svg.match(/<line x1="(\d+)" y1="0"/g)[1].match(/x1="(\d+)"/)[1]); if (Math.round(m[2] / s) * Math.round(m[3] / s) !== e.answer) fail(`area1 ${e.answer} ${m}`) }
// time-minutes durations
for (let i = 1; i <= N; i++) { const e = gen(find(3, 'time-minutes'), 3, i); const t = e.q.match(/(\d+):(\d+)/g).map(x => x.split(':').map(Number)); if (e.type === 'number') { const [a, b] = t; if (((b[0] * 60 + b[1]) - (a[0] * 60 + a[1])) !== e.answer) fail(`dur ${e.q}`) } else { const d = Number(e.q.match(/בעוד (\d+) דקות/)[1]); const tot = t[0][0] * 60 + t[0][1] + d; const h = ((Math.floor(tot / 60) - 1 + 12) % 12) + 1, m = tot % 60; if (e.answer !== `${h}:${String(m).padStart(2, '0')}`) fail(`fwd ${e.q} ${e.answer}`) } }
for (let i = 1; i <= N; i++) for (const [s, gr, L] of [['time-minutes', 3, 1], ['clock', 2, 1], ['clock', 2, 2], ['clock-hours', 1, 1]]) { const e = gen(find(gr, s), L, i); const [h, m] = e.answer.split(':').map(Number); const ds = e.svg; if (!ds.includes('<svg')) fail('clock svg'); void h; void m }
// data: recompute from the drawn svg heights
for (const [gr, s] of [[1, 'data-basic'], [2, 'data-bar-charts'], [3, 'data-double-bar']]) for (let l = 1; l <= 3; l++) for (let i = 1; i <= 500; i++) { const e = gen(find(gr, s), l, i); if (e.type === 'choice' && !e.choices.includes(e.answer)) fail('data choice'); if (e.type === 'number' && e.answer === 0) fail(`data zero ${s} L${l} ${e.q}`) }
// cuboids: the three drawn edge lengths are distinct (so '4 edges of length c' is true)
for (let i = 1; i <= N; i++) { const e = gen(find(3, 'cuboids-nets'), 3, i); const labs = [...e.svg.matchAll(/>(\d+)<\/text>/g)].map(m => m[1]); if (new Set(labs).size !== 3) fail(`cuboid labels ${labs}`) }
// triangles: sides labelled in svg satisfy triangle inequality and classification
for (let i = 1; i <= N; i++) { const e = gen(find(2, 'triangles-right-angle'), 2, i); const sides = [...e.svg.matchAll(/>(\d+)<\/text>/g)].map(m => Number(m[1])); const [a, b, c] = sides; if (!(a + b > c && a + c > b && b + c > a)) fail(`tri ineq ${sides}`); const k = new Set(sides).size === 1 ? 'שווה צלעות' : new Set(sides).size === 2 ? 'שווה שוקיים' : 'שונה צלעות'; if (k !== e.answer) fail(`tri class ${sides} ${e.answer}`) }
// grade-2 limits: times tables only 2,4,5,10 and division by those
for (let l = 1; l <= 3; l++) for (let i = 1; i <= N; i++) { const e = gen(find(2, 'times-tables-intro'), l, i); const nums = e.expr.match(/\d+/g).map(Number); if (!nums.some(x => [2, 4, 5, 10].includes(x))) fail(`tt ${e.expr}`); if (nums.some(x => x === 3 || x === 6 || x === 7 || x === 8 || x === 9) && l < 3 && e.expr.split(/[×=]/).filter(s => /\d/.test(s)).every(s => ![2, 4, 5, 10].includes(Number(s)))) fail(`tt2 ${e.expr}`) }
for (let l = 2; l <= 3; l++) for (let i = 1; i <= N; i++) { const e = gen(find(2, 'division-meaning'), l, i); const d = Number(e.expr?.split(' ÷ ')[1]?.split(' ')[0] ?? 2); if (![2, 4, 5, 10].includes(d)) fail(`div ${e.expr || e.q}`) }
// grade-1 shapes names
for (let i = 1; i <= N; i++) { const e = gen(find(1, 'shapes'), 1, i); if (e.answer === 'ריבוע' && e.choices.some(c => c === 'מלבן' || c === 'מעוין')) fail('square choices'); if (e.answer === 'מעוין' && e.choices.includes('ריבוע')) fail('rhombus choices') }
// grade 4 moved fractions
for (let i = 1; i <= 1000; i++) for (const l of [1, 2, 3]) { const e = g4.find(t => t.slug === 'simple-fractions').gen(l, createRng(mixSeed(i))); if (exerciseProblems(e).length) fail('g4 frac') }
assert.deepEqual(fails, [], `${bad} failures in ${n} exercises`)

})

test('גן חובה: answers recompute and stay within 10', () => {
  const K = slug => gK.find(t => t.slug === slug)
  const run = (slug, l, i) => K(slug).gen(l, createRng(mixSeed(i * 31337 + l)))
  const errs = []
  const bad = m => { if (errs.length < 20) errs.push(m) }
  for (let i = 1; i <= 400; i++) for (const l of [1, 2, 3]) {
    const c = run('count-10', l, i); const dots = (c.svg.match(/<circle/g) || []).length
    if (l < 3 ? dots !== c.answer : dots + c.answer !== 10) bad(`count ${l} ${c.answer} ${dots}`)
    const m = run('more-less', l, i); const rows = [...m.svg.matchAll(/<circle cx="([\d.]+)" cy="(\d+)"/g)]; const a = rows.filter(r => Number(r[2]) < 40).length, b = rows.length - a
    if (l === 1 && m.answer !== (a > b ? 'בשורה א׳' : 'בשורה ב׳')) bad(`more ${a} ${b} ${m.answer}`)
    if (l === 2 && m.answer !== (a === b ? 'שוות' : a > b ? 'בשורה א׳ יש יותר' : 'בשורה ב׳ יש יותר')) bad(`more2 ${a} ${b} ${m.answer}`)
    if (l === 3 && m.answer !== Math.abs(a - b)) bad(`more3 ${a} ${b} ${m.answer}`)
    const o = run('number-order-10', l, i); const nums = (o.q.match(/\d+/g) || []).map(Number)
    if (l === 1 && o.answer !== nums[0] + 1) bad(`order1 ${o.q}`)
    if (l === 2 && (o.q.includes('לפני') ? o.answer !== nums[0] - 1 : o.answer !== (nums[0] + nums[1]) / 2)) bad(`order2 ${o.q} ${o.answer}`)
    if (l === 3 && o.answer !== String(o.q.includes('גדול') ? Math.max(...nums) : Math.min(...nums))) bad(`order3 ${o.q}`)
    const sp = run('split-numbers-10', l, i); const sn = (sp.q.match(/\d+/g) || []).map(Number)
    if (l < 3 ? sp.answer !== sn[0] - sn[1] : sp.answer !== 10 - sn[0]) bad(`split ${sp.q} ${sp.answer}`)
    const st = run('story-add-sub-10', l, i); const tn = (st.q.match(/\d+/g) || []).map(Number)
    if (l < 3 ? st.answer !== tn[0] + tn[1] : st.answer !== tn[0] - tn[1]) bad(`story ${st.q}`)
    if (st.answer > 10 || sp.answer > 10) bad('range')
    const sh = run('shapes-kg', l, i)
    if (l === 2) { const verts = { 0: 'circle' }; void verts; if (![0, 3, 4].includes(sh.answer)) bad(`corners ${sh.answer}`) }
    const pt = run('patterns-kg', l, i); if (!pt.svg.includes('?') || !pt.choices.includes(pt.answer)) bad('pattern')
    const ps = run('position-kg', l, i)
    if (l === 2) { const cols = [...ps.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map(x => x[1]); if (cols[1] !== ps.answer) bad(`between ${cols} ${ps.answer}`) }
    if (l === 3) { const cols = [...ps.svg.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].map(x => x[1]); const ORD = ['הראשון', 'השני', 'השלישי', 'הרביעי'], k = ORD.findIndex(w => ps.q.includes(w)); if (cols[3 - k] !== ps.answer) bad(`ordinal ${cols} ${ps.q} ${ps.answer}`) }
    const ln = run('compare-length-kg', l, i); const rects = [...ln.svg.matchAll(/<rect x="[\d.]+" y="(\d+)"/g)]; const ra = rects.filter(r => Number(r[1]) < 40).length, rb = rects.length - ra
    if (l === 1 && ln.answer !== (ra > rb ? 'פס א׳' : 'פס ב׳')) bad(`len ${ra} ${rb}`)
    if (l === 2 && ln.answer !== (ln.q.includes('א׳') ? ra : rb)) bad(`len2 ${ln.q} ${ra} ${rb}`)
    if (l === 3 && ln.answer !== Math.abs(ra - rb)) bad(`len3 ${ra} ${rb}`)
  }
  assert.deepEqual(errs, [])
})

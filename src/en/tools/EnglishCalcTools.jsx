// English calculators: percentages, tips, VAT / sales tax, currency, BMI, fractions, grade average and
// quadratic equations. The math comes from the shared helpers (utils/percent, office/money,
// utils/learningCalculators); their messages are Hebrew, so every input is checked here in English first.
import { useEffect, useState } from 'react'
import ToolFrame from './ToolFrame'
import { Field, Panel, Result, Select, buttonClass, fmt } from './ui'
import { parseNumber, percentOf, whatPercent, percentChange, afterDiscount, beforeDiscount } from '../../utils/percent'
import { TIP_PRESETS, computeTip } from '../../office/money/tipLogic'
import { CURRENCIES, BY_CODE, addVat, extractVat, fetchLiveRates, pickRates, convert, round, decimalsFor } from '../../office/money/moneyLogic'
import { adultBmi, gcd, parseFraction } from '../../utils/learningCalculators'

const money = n => Number.isFinite(n) ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) : '—'
const num = v => parseNumber(v)

// ── percent ──
function PercentRow({ title, a, b, labels, calc, unit = '' }) {
  const [x, setX] = useState(a), [y, setY] = useState(b)
  const nx = num(x), ny = num(y), r = nx === null || ny === null ? null : calc(nx, ny)
  return <div className="rounded-xl border-2 border-[var(--border)] p-3">
    <h2 className="text-lg font-bold">{title}</h2>
    <div className="grid gap-3 sm:grid-cols-2"><Field label={labels[0]} inputMode="decimal" value={x} onChange={e => setX(e.target.value)} /><Field label={labels[1]} inputMode="decimal" value={y} onChange={e => setY(e.target.value)} /></div>
    <p className="mt-2 text-2xl font-black" aria-live="polite">{nx === null || ny === null ? 'Type two numbers.' : r === null ? 'Not possible with these numbers.' : `${fmt(r)}${unit}`}</p>
  </div>
}
export function PercentCalculator() {
  return <ToolFrame path="/en/tools/percent-calculator" h1="% Percentage calculator" intro="Work out a percentage of a number, what percent one number is of another, percentage increase or decrease, and discounts." width="max-w-3xl"
    faq={[
      { q: 'How do I calculate 15% of 80?', a: 'Multiply 80 by 15 and divide by 100: 12. In the first box type 15 and 80.' },
      { q: 'How do I work out a percentage increase?', a: 'Subtract the old value from the new one, divide by the old value and multiply by 100. From 50 to 60 is a 20% increase.' },
      { q: 'How do I find the price before a discount?', a: 'Divide the sale price by (1 − discount/100). A $75 item at 25% off was $100 before the sale.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/tip-calculator', label: 'tip calculator' }, { href: '/en/tools/vat', label: 'VAT calculator' }]}>
    <Panel label="Percentage calculators">
      <PercentRow title="What is X% of Y?" a="15" b="80" labels={['Percent (X)', 'Number (Y)']} calc={percentOf} />
      <PercentRow title="X is what percent of Y?" a="12" b="80" labels={['Part (X)', 'Whole (Y)']} calc={whatPercent} unit="%" />
      <PercentRow title="Percentage change from X to Y" a="50" b="60" labels={['From', 'To']} calc={percentChange} unit="%" />
      <PercentRow title="Price after a discount" a="100" b="25" labels={['Price', 'Discount %']} calc={afterDiscount} />
      <PercentRow title="Price before a discount" a="75" b="25" labels={['Sale price', 'Discount %']} calc={beforeDiscount} />
    </Panel>
  </ToolFrame>
}

// ── tip ──
export function TipCalculator() {
  const [bill, setBill] = useState('84.50'), [pct, setPct] = useState(15), [people, setPeople] = useState('2'), [roundUp, setRoundUp] = useState(false)
  const b = num(bill), r = b === null ? null : computeTip(b, Number(pct), Number(people), roundUp)
  return <ToolFrame path="/en/tools/tip-calculator" h1="💵 Tip calculator and bill splitter" intro="Work out the tip, the total and each person's share. Round each share up to a whole amount if you like." width="max-w-2xl"
    faq={[
      { q: 'How much should I tip?', a: 'It depends on the country. In the US 15–20% is usual in restaurants, in the UK and Israel 10–12.5% is common, and in some countries service is already included. Check the bill first.' },
      { q: 'How is the bill split?', a: 'The total with tip is divided by the number of people and rounded up to the cent, so nobody pays a cent short. The tip shown is the real tip after rounding.' },
      { q: 'What does "round each share up" do?', a: 'Every person pays a whole amount (no coins), and the extra goes to the tip.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/percent-calculator', label: 'percentage calculator' }, { href: '/en/tools/currency', label: 'currency converter' }]}>
    <Panel label="Tip calculator">
      <Field label="Bill amount" inputMode="decimal" value={bill} onChange={e => setBill(e.target.value)} />
      <div><p className="font-bold">Tip</p><div className="mt-1 flex flex-wrap gap-2">{TIP_PRESETS.map(p => <button key={p} className={buttonClass} aria-pressed={Number(pct) === p} style={Number(pct) === p ? { outline: '3px solid #182139' } : undefined} onClick={() => setPct(p)}>{p}%</button>)}<Field label="Other %" type="number" min="0" max="100" value={pct} onChange={e => setPct(e.target.value)} className="w-28" /></div></div>
      <Field label="Number of people" type="number" min="1" max="100" value={people} onChange={e => setPeople(e.target.value)} />
      <label className="flex items-center gap-2"><input type="checkbox" checked={roundUp} onChange={e => setRoundUp(e.target.checked)} /> Round each share up to a whole amount</label>
      <Result error={r ? null : 'Type a bill above zero, a tip from 0 to 100% and 1 to 100 people.'}>{r && <><p>Tip: {money(r.tip)} ({r.pct}%)</p><p>Total: {money(r.total)}</p>{r.people > 1 && <p className="text-3xl">Each person pays {money(r.share)}</p>}</>}</Result>
    </Panel>
  </ToolFrame>
}

// ── VAT ──
const VAT_PRESETS = [[18, 'Israel 18%'], [20, 'UK and France 20%'], [19, 'Germany 19%'], [21, 'Netherlands 21%'], [5, 'Canada GST 5%'], [10, 'Australia GST 10%'], [15, 'New Zealand GST 15%']]
export function VatCalculator() {
  const [amount, setAmount] = useState('100'), [rate, setRate] = useState('20'), [mode, setMode] = useState('add')
  const a = num(amount), r = Number(rate)
  const ok = a !== null && Number.isFinite(r) && r >= 0 && r <= 100
  const res = ok ? (mode === 'add' ? addVat(a, r) : extractVat(a, r)) : null
  return <ToolFrame path="/en/tools/vat" h1="🧾 VAT calculator: add or remove VAT" intro="Add VAT or sales tax to a net price, or take it out of a price that already includes it. Any rate, with presets for common countries." width="max-w-2xl"
    faq={[
      { q: 'How do I add 20% VAT to a price?', a: 'Multiply the net price by 1.2. A net price of 100 becomes 120, and the VAT is 20.' },
      { q: 'How do I remove VAT from a price?', a: 'Divide the gross price by (1 + rate/100). With 20% VAT, 120 ÷ 1.2 = 100 before VAT, so the VAT inside it is 20. Taking 20% off 120 would be wrong.' },
      { q: 'Does it work for US sales tax?', a: 'Yes. Type your state and local rate, for example 8.875, and choose "Add tax".' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/percent-calculator', label: 'percentage calculator' }, { href: '/en/tools/currency', label: 'currency converter' }]}>
    <Panel label="VAT calculator">
      <div className="flex flex-wrap gap-2"><button className={buttonClass} aria-pressed={mode === 'add'} style={mode === 'add' ? { outline: '3px solid #182139' } : undefined} onClick={() => setMode('add')}>Add tax</button><button className={buttonClass} aria-pressed={mode === 'remove'} style={mode === 'remove' ? { outline: '3px solid #182139' } : undefined} onClick={() => setMode('remove')}>Remove tax</button></div>
      <Field label={mode === 'add' ? 'Price before tax (net)' : 'Price including tax (gross)'} inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
      <Field label="Tax rate %" type="number" min="0" max="100" step="any" value={rate} onChange={e => setRate(e.target.value)} />
      <div className="flex flex-wrap gap-2">{VAT_PRESETS.map(([v, l]) => <button key={l} className="rounded-full border-2 border-[var(--border)] px-3 py-1 text-sm font-bold" onClick={() => setRate(String(v))}>{l}</button>)}</div>
      <Result error={res ? null : 'Type an amount and a rate between 0 and 100.'}>{res && <><p>Before tax: {money(res.net)}</p><p>Tax: {money(res.vat)}</p><p className="text-3xl">Total: {money(res.gross)}</p></>}</Result>
    </Panel>
  </ToolFrame>
}

// ── currency ──
let names = null
const currencyName = code => {
  try { names ||= new Intl.DisplayNames(['en'], { type: 'currency' }); return names.of(code) } catch { return code }
}
const moneyIn = (n, code) => Number.isFinite(n) ? new Intl.NumberFormat('en-US', { maximumFractionDigits: decimalsFor(n, code), minimumFractionDigits: decimalsFor(n, code) === 2 && round(n, 2) % 1 ? 2 : 0 }).format(round(n, decimalsFor(n, code))) : '—'
export function CurrencyConverter() {
  const [amount, setAmount] = useState('100'), [from, setFrom] = useState('USD'), [to, setTo] = useState('ILS'), [state, setState] = useState(() => pickRates(null, null))
  useEffect(() => {
    let saved = null
    // Same storage key as the Hebrew converter, so either page can fall back on the other's last rates.
    try { saved = JSON.parse(localStorage.getItem('ugabuga-currency-rates') || 'null') } catch { /* storage blocked */ }
    if (saved) setState(pickRates(null, saved))
    let live = true
    fetchLiveRates().then(data => {
      if (!live || !data) return
      setState(pickRates(data, saved))
      try { localStorage.setItem('ugabuga-currency-rates', JSON.stringify(data)) } catch { /* private mode */ }
    })
    return () => { live = false }
  }, [])
  const rates = state.data.rates, a = num(amount), out = a === null ? null : convert(a, from, to, rates)
  const options = [...CURRENCIES].sort((x, y) => currencyName(x.code).localeCompare(currencyName(y.code))).map(c => [c.code, `${c.flag} ${currencyName(c.code)} (${c.code})`])
  return <ToolFrame path="/en/tools/currency" h1="💱 Currency converter" intro={`Convert between ${CURRENCIES.length} currencies at today's exchange rate: dollars, euros, pounds, shekels and more.`} width="max-w-2xl"
    faq={[
      { q: 'Where do the exchange rates come from?', a: 'From a public daily reference rate, updated once a day. Banks, card companies and exchange offices add their own fee, so the rate you actually get is usually a little worse.' },
      { q: 'Does it work offline?', a: 'If the live rates cannot load, the converter uses the last rates it has and shows their date, so you can still get a good estimate when travelling.' },
      { q: 'How many shekels is a dollar?', a: 'Choose US Dollar and Israeli New Shekel, type 1, and the converter shows today\'s rate.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/tip-calculator', label: 'tip calculator' }, { href: '/en/tools/vat', label: 'VAT calculator' }]}>
    <Panel label="Currency converter">
      <Field label="Amount" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} />
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Select label="From" value={from} onChange={e => setFrom(e.target.value)} options={options} />
        <button className={buttonClass} aria-label="Swap currencies" onClick={() => { setFrom(to); setTo(from) }}>⇄</button>
        <Select label="To" value={to} onChange={e => setTo(e.target.value)} options={options} />
      </div>
      <Result error={out === null ? 'Type an amount, for example 100 or 25.50.' : null}>{out !== null && <><p className="text-3xl">{moneyIn(a, from)} {BY_CODE[from].symbol} = {moneyIn(out, to)} {BY_CODE[to].symbol}</p><p className="text-base font-normal">1 {from} = {moneyIn(convert(1, from, to, rates), to)} {to} · 1 {to} = {moneyIn(convert(1, to, from, rates), from)} {from}</p></>}</Result>
      <p className="text-sm">{state.source === 'live' ? `Rates of ${state.data.date}.` : `Live rates are not available right now. Showing the rates of ${state.data.date}.`} For information only; your bank's rate will differ.</p>
    </Panel>
  </ToolFrame>
}

// ── BMI ──
export function BmiCalculator() {
  const [unit, setUnit] = useState('metric'), [w, setW] = useState(''), [h, setH] = useState(''), [ft, setFt] = useState(''), [inch, setInch] = useState(''), [age, setAge] = useState('')
  const kg = unit === 'metric' ? num(w) : num(w) === null ? null : num(w) * 0.45359237
  const cm = unit === 'metric' ? num(h) : (num(ft) === null && num(inch) === null) ? null : ((num(ft) || 0) * 12 + (num(inch) || 0)) * 2.54
  const years = num(age)
  let error = null, value = null
  if (kg === null || cm === null || years === null) error = 'Fill in weight, height and age.'
  else if (years < 20) error = 'This calculator is for adults aged 20 and over. Children and teens need BMI-for-age charts, so ask your doctor or school nurse.'
  else if (kg <= 0 || cm <= 0 || kg > 700 || cm > 300) error = 'Check the weight and height.'
  else value = adultBmi(kg, cm, years).bmi
  const category = value === null ? '' : value < 18.5 ? 'below the healthy range (underweight)' : value < 25 ? 'in the healthy range' : value < 30 ? 'above the healthy range (overweight)' : 'in the obesity range'
  return <ToolFrame path="/en/tools/bmi" h1="⚖️ BMI calculator for adults" intro="Body mass index from your weight and height, in kilograms and centimetres or pounds, feet and inches." width="max-w-2xl"
    faq={[
      { q: 'How is BMI calculated?', a: 'Weight in kilograms divided by height in metres squared. 70 kg at 1.75 m gives a BMI of about 22.9.' },
      { q: 'What is a healthy BMI?', a: 'For adults, 18.5 to 24.9 is considered the healthy range, 25 to 29.9 overweight and 30 or more obesity.' },
      { q: 'Why not for children?', a: 'Children are still growing, so their BMI is compared with charts for their age and sex. A doctor or school nurse can do that properly.' },
      { q: 'Is BMI the whole story?', a: 'No. It does not tell muscle from fat and is only a screening number. Talk to a doctor about your health.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/age-calculator', label: 'age calculator' }, { href: '/en/tools/percent-calculator', label: 'percentage calculator' }]}>
    <Panel label="BMI calculator">
      <Select label="Units" value={unit} onChange={e => setUnit(e.target.value)} options={[['metric', 'Kilograms and centimetres'], ['imperial', 'Pounds, feet and inches']]} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={unit === 'metric' ? 'Weight (kg)' : 'Weight (lb)'} inputMode="decimal" value={w} onChange={e => setW(e.target.value)} />
        {unit === 'metric' ? <Field label="Height (cm)" inputMode="decimal" value={h} onChange={e => setH(e.target.value)} /> : <div className="grid grid-cols-2 gap-2"><Field label="Feet" inputMode="numeric" value={ft} onChange={e => setFt(e.target.value)} /><Field label="Inches" inputMode="decimal" value={inch} onChange={e => setInch(e.target.value)} /></div>}
        <Field label="Age" inputMode="numeric" value={age} onChange={e => setAge(e.target.value)} />
      </div>
      <Result error={error}>{value !== null && <><p className="text-4xl">BMI {value.toFixed(1)}</p><p>That is {category}.</p></>}</Result>
      <p className="text-sm">For information only. It is not medical advice.</p>
    </Panel>
  </ToolFrame>
}

// ── fractions ──
const fstr = f => f.d === 1 ? String(f.n) : `${f.n}/${f.d}`
const mixed = f => Math.abs(f.n) > f.d && f.d !== 1 ? `${f.n < 0 ? '−' : ''}${Math.floor(Math.abs(f.n) / f.d)} ${Math.abs(f.n) % f.d}/${f.d}` : null
function fractionSteps(a, b, op) {
  let n, d, step
  if (op === '+' || op === '-') {
    d = a.d / gcd(a.d, b.d) * b.d
    const x = a.n * (d / a.d), y = b.n * (d / b.d)
    n = op === '+' ? x + y : x - y
    step = `Common denominator: ${d}. ${x}/${d} ${op === '+' ? '+' : '−'} ${y}/${d} = ${n}/${d}`
  } else if (op === '*') { n = a.n * b.n; d = a.d * b.d; step = `Multiply the tops and the bottoms: ${fstr(a)} × ${fstr(b)} = ${n}/${d}` }
  else { n = a.n * b.d; d = a.d * b.n; step = `Multiply by the reciprocal: ${fstr(a)} × ${b.d}/${b.n} = ${n}/${d}` }
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d), result = { n: n / g, d: d / g }
  return { result, steps: [step, g > 1 ? `Simplify by dividing by ${g}: ${fstr(result)}` : `Already in its simplest form: ${fstr(result)}`] }
}
export function FractionCalculator() {
  const [a, setA] = useState('3/4'), [b, setB] = useState('1 1/2'), [op, setOp] = useState('+')
  let fa = null, fb = null
  try { fa = parseFraction(a) } catch { /* invalid */ }
  try { fb = parseFraction(b) } catch { /* invalid */ }
  const error = !fa || !fb ? 'Write a fraction (3/4), a mixed number (1 1/2), a decimal or a percentage.' : op === '/' && fb.n === 0 ? 'You cannot divide by zero.' : null
  const r = error ? null : fractionSteps(fa, fb, op)
  return <ToolFrame path="/en/tools/fraction-calculator" h1="➗ Fraction calculator with steps" intro="Add, subtract, multiply and divide fractions and mixed numbers, simplified, with every step explained." width="max-w-2xl"
    faq={[
      { q: 'How do I add fractions with different denominators?', a: 'Find a common denominator, rewrite both fractions with it, add the numerators and simplify. The calculator shows each step.' },
      { q: 'How do I divide fractions?', a: 'Multiply the first fraction by the reciprocal of the second (flip it upside down). 3/4 ÷ 1/2 = 3/4 × 2/1 = 6/4 = 3/2.' },
      { q: 'Can I type decimals or mixed numbers?', a: 'Yes: 0.25, 1 1/2 and 50% all work, and the answer is shown as a simplified fraction and a decimal.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/calculator', label: 'scientific calculator' }, { href: '/en/tools/percent-calculator', label: 'percentage calculator' }]}>
    <Panel label="Fraction calculator">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <Field label="First fraction" value={a} onChange={e => setA(e.target.value)} />
        <Select label="Operation" value={op} onChange={e => setOp(e.target.value)} options={[['+', '+'], ['-', '−'], ['*', '×'], ['/', '÷']]} />
        <Field label="Second fraction" value={b} onChange={e => setB(e.target.value)} />
      </div>
      <Result error={error}>{r && <><p className="text-4xl">= {fstr(r.result)}</p>{mixed(r.result) && <p>Mixed number: {mixed(r.result)}</p>}<p>Decimal: {fmt(r.result.n / r.result.d, 6)}</p><ol className="mt-2 list-decimal pl-5 text-base font-normal">{r.steps.map(s => <li key={s}>{s}</li>)}</ol></>}</Result>
    </Panel>
  </ToolFrame>
}

// ── grade average ──
export function GradeAverage() {
  const [rows, setRows] = useState([{ name: 'Math', grade: '92', units: '5' }, { name: 'English', grade: '85', units: '4' }, { name: '', grade: '', units: '1' }])
  const [weighted, setWeighted] = useState(true)
  const update = (i, k, v) => setRows(rows.map((r, j) => j === i ? { ...r, [k]: v } : r))
  const active = rows.filter(r => r.grade.trim() !== '')
  const bad = active.some(r => { const g = Number(r.grade), u = Number(r.units); return !Number.isFinite(g) || g < 0 || g > 100 || (weighted && (!Number.isFinite(u) || u <= 0 || u > 10)) })
  let sum = 0, units = 0
  if (!bad) for (const r of active) { const u = weighted ? Number(r.units) : 1; sum += Number(r.grade) * u; units += u }
  return <ToolFrame path="/en/tools/grade-average" h1="🎓 Grade average calculator" intro="Average your grades out of 100, simple or weighted by credits or study units." width="max-w-3xl"
    faq={[
      { q: 'What is a weighted average?', a: 'Each grade counts as many times as its weight (credits, hours or units). A 90 in a 5-unit subject pulls the average more than a 70 in a 2-unit subject.' },
      { q: 'How do I calculate a simple average?', a: 'Untick "Weighted". All grades count the same: add them up and divide by how many there are.' },
      { q: 'Does it work with letter grades or a GPA scale?', a: 'This calculator uses grades from 0 to 100. Convert letter grades to numbers first, using your school\'s scale.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/percent-calculator', label: 'percentage calculator' }, { href: '/en/tools/calculator', label: 'scientific calculator' }]}>
    <Panel label="Grades">
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={weighted} onChange={e => setWeighted(e.target.checked)} /> Weighted (by credits or units)</label>
      {rows.map((r, i) => <div key={i} className="grid grid-cols-[1fr_6rem_6rem_auto] items-end gap-2">
        <Field label={`Subject ${i + 1}`} value={r.name} onChange={e => update(i, 'name', e.target.value)} />
        <Field label="Grade" inputMode="decimal" value={r.grade} onChange={e => update(i, 'grade', e.target.value)} />
        <Field label="Weight" inputMode="decimal" value={r.units} disabled={!weighted} onChange={e => update(i, 'units', e.target.value)} />
        <button className={buttonClass} aria-label={`Remove subject ${i + 1}`} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))}>✕</button>
      </div>)}
      <button className={buttonClass} disabled={rows.length >= 100} onClick={() => setRows([...rows, { name: '', grade: '', units: '1' }])}>+ Add a subject</button>
      <Result error={bad ? 'Grades go from 0 to 100, and weights from above 0 up to 10.' : !active.length ? 'Type at least one grade.' : null}>{active.length > 0 && !bad && <><p className="text-4xl">Average: {fmt(sum / units)}</p><p className="text-base font-normal">{active.length} grades{weighted ? `, ${fmt(units)} units` : ''}</p></>}</Result>
    </Panel>
  </ToolFrame>
}

// ── quadratic ──
function solveQuadratic(a, b, c) {
  const D = b * b - 4 * a * c
  if (D > 0) { const s = Math.sqrt(D); return { D, roots: [(-b + s) / (2 * a), (-b - s) / (2 * a)] } }
  if (D === 0) return { D, roots: [-b / (2 * a)] }
  return { D, complex: [-b / (2 * a), Math.sqrt(-D) / (2 * Math.abs(a))] }
}
export function QuadraticSolver() {
  const [a, setA] = useState('1'), [b, setB] = useState('-5'), [c, setC] = useState('6')
  const na = num(a), nb = num(b), nc = num(c)
  const error = na === null || nb === null || nc === null ? 'Type the three coefficients a, b and c.' : na === 0 ? 'When a is 0 this is not a quadratic equation. Solve bx + c = 0 instead.' : null
  const r = error ? null : solveQuadratic(na, nb, nc)
  const vx = r ? -nb / (2 * na) : 0, vy = r ? na * vx * vx + nb * vx + nc : 0
  const sign = n => n < 0 ? `− ${fmt(-n, 6)}` : `+ ${fmt(n, 6)}`
  return <ToolFrame path="/en/tools/quadratic-equation" h1="📐 Quadratic equation solver" intro="Solve ax² + bx + c = 0 with the quadratic formula, step by step: the discriminant, the roots and the vertex." width="max-w-2xl"
    faq={[
      { q: 'What is the quadratic formula?', a: 'x = (−b ± √(b² − 4ac)) / 2a. The part under the square root, b² − 4ac, is called the discriminant.' },
      { q: 'What does the discriminant tell me?', a: 'If it is positive there are two real roots, if it is zero there is one (a double root), and if it is negative there are no real roots, only two complex ones.' },
      { q: 'What is the vertex?', a: 'The turning point of the parabola, at x = −b/2a. It is a minimum when a is positive and a maximum when a is negative.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/calculator', label: 'scientific calculator' }, { href: '/en/tools/fraction-calculator', label: 'fraction calculator' }]}>
    <Panel label="Quadratic equation">
      <p className="text-center text-2xl font-bold">{fmt(na ?? 0, 6)}x² {sign(nb ?? 0)}x {sign(nc ?? 0)} = 0</p>
      <div className="grid grid-cols-3 gap-3"><Field label="a" inputMode="decimal" value={a} onChange={e => setA(e.target.value)} /><Field label="b" inputMode="decimal" value={b} onChange={e => setB(e.target.value)} /><Field label="c" inputMode="decimal" value={c} onChange={e => setC(e.target.value)} /></div>
      <Result error={error}>{r && <div className="space-y-1">
        <p className="text-base font-normal">Discriminant: b² − 4ac = {fmt(nb * nb)} − {fmt(4 * na * nc)} = <b>{fmt(r.D, 6)}</b></p>
        {r.roots?.length === 2 && <p className="text-3xl">x₁ = {fmt(r.roots[0], 6)}, x₂ = {fmt(r.roots[1], 6)}</p>}
        {r.roots?.length === 1 && <p className="text-3xl">x = {fmt(r.roots[0], 6)} (double root)</p>}
        {r.complex && <><p>No real roots (the discriminant is negative).</p><p className="text-2xl">x = {fmt(r.complex[0], 6)} ± {fmt(r.complex[1], 6)}i</p></>}
        <p className="text-base font-normal">Vertex: ({fmt(vx, 6)}, {fmt(vy, 6)}), a {na > 0 ? 'minimum' : 'maximum'}</p>
      </div>}</Result>
      <p className="text-sm"><span className="font-bold">Formula:</span> x = (−b ± √(b² − 4ac)) / 2a</p>
    </Panel>
  </ToolFrame>
}

// /en/tools/calculator: the Hebrew site's scientific calculator with an English interface. The engine and the
// calculator component are shared with /tools/calculator; only the words differ (see calcStrings.js).
import { Suspense, lazy, useEffect, useState } from 'react'
import Calculator from '../../office/calc/Calculator'
import '../../office/calc/calc.css'
import ToolFrame from './ToolFrame'
import { tCalc } from './calcStrings'

const PATH = '/en/tools/calculator'
const loaders = {
  fractions: () => import('../../office/calc/tabs/FractionsTab'),
  solver: () => import('../../office/calc/tabs/SolverTab'),
  percent: () => import('../../office/calc/tabs/PercentTab'),
  stats: () => import('../../office/calc/tabs/StatsTab'),
  units: () => import('../../office/calc/tabs/UnitsTab'),
  graph: () => import('../../office/calc/tabs/GraphTab'),
}
const LAZY = Object.fromEntries(Object.entries(loaders).map(([k, f]) => [k, lazy(f)]))

const TABS = [
  { id: 'calc', icon: '🧮', label: 'Calculator' },
  { id: 'fractions', icon: '½', label: 'Fractions' },
  { id: 'solver', icon: 'x=', label: 'Equations' },
  { id: 'graph', icon: '📈', label: 'Graphs' },
  { id: 'stats', icon: '📊', label: 'Statistics' },
  { id: 'percent', icon: '%', label: 'Percent' },
  { id: 'units', icon: '📏', label: 'Units' },
]

const FAQ = [
  { q: 'How do I switch between degrees and radians?', a: 'Press the DEG/RAD switch at the top of the calculator. It starts in degrees, the way most schools teach, so sin(30) = 0.5. In radians, sin(π÷6) gives the same result.' },
  { q: 'Why is my answer shown as a fraction or with a root?', a: 'When the result is a simple fraction, a root or a multiple of π, the calculator shows it exactly, for example ¾ or 2√2, with the decimal value underneath. The S⇔D button switches between them, and a b/c shows a mixed number.' },
  { q: 'In what order does the calculator work?', a: 'By the order of operations: parentheses, powers and roots, multiplication and division from left to right, and finally addition and subtraction. Implied multiplication such as 2π binds more tightly than division, so 1÷2π means 1 divided by 2π. The "How did we get this?" button shows every step.' },
  { q: 'What do I do when an error message appears?', a: 'The message names the problem and marks the spot in red in your expression, for example "Division by zero" or "Square root of a negative number". Move the cursor with the arrows or tap the expression and fix it without retyping everything.' },
  { q: 'How do I solve a quadratic equation?', a: 'In the Equations tab choose Quadratic (ax² + bx + c = 0) and enter the coefficients. You get the discriminant, both solutions in exact form and as decimals, the vertex of the parabola, and a button to see it on a graph.' },
  { q: 'Are my history and memory saved?', a: 'Yes, but only in your own browser. Once the page has loaded, the calculator also works without an internet connection. There are no ads and no sign-up.' },
]

function readHash() {
  if (typeof window === 'undefined') return 'calc'
  const h = window.location.hash.replace('#', '')
  return TABS.some(t => t.id === h) ? h : 'calc'
}

export default function EnglishCalculator() {
  const [tab, setTab] = useState('calc')
  const [graphSeed, setGraphSeed] = useState(null)

  useEffect(() => {
    setTab(readHash())
    const onHash = () => setTab(readHash())
    window.addEventListener('hashchange', onHash)
    // fetch the other tabs in the background so they open instantly
    const idle = window.requestIdleCallback || (f => setTimeout(f, 2500))
    const id = idle(() => Object.values(loaders).forEach(f => f().catch(() => {})))
    return () => { window.removeEventListener('hashchange', onHash); (window.cancelIdleCallback || clearTimeout)(id) }
  }, [])

  const choose = id => {
    setTab(id)
    try { history.replaceState(null, '', id === 'calc' ? window.location.pathname + window.location.search : `#${id}`) } catch { /* ignore */ }
  }
  const openGraph = expr => { setGraphSeed({ expr, at: Date.now() }); choose('graph') }
  const Tab = tab !== 'calc' ? LAZY[tab] : null

  return <ToolFrame path={PATH} width="max-w-6xl" className="sc-page" h1="Scientific calculator online"
    intro="Like the calculator from school, only clearer: you see the expression the way you would write it in a notebook, get an exact answer and a decimal, and can ask for an explanation."
    bodyTitle="A scientific calculator for students: what is here?" faq={FAQ}
    paragraphs={[
      'The calculator is built like a high-school scientific calculator: the four operations, parentheses, powers and roots, sine, cosine and tangent and their inverses, base-10 and natural logarithms, factorials, permutations and combinations, absolute value, percent and memory. What is different is that the expression appears the way you write it in a notebook, with a real fraction and a root with a bar over it, and you can go back to any place in the expression and fix it.',
      'For example, type sin(60). The calculator shows √3/2 and, underneath, 0.8660254038. Another example: 0.1 + 0.2 gives exactly 0.3, without the odd leftovers some online calculators show. And for 2 + 3 × 4, the "How did we get this?" button shows that multiplication comes first and only then addition.',
      'The extra tabs hold tools that hide in menus on an ordinary calculator: calculating with fractions and mixed numbers, solving linear and quadratic equations and a system of two equations, drawing graphs with intersection points, the mean, median and standard deviation of a list of numbers, a unit converter and percent.',
    ]}
    related={[{ href: '/en/tools', label: 'all free tools' }, { href: '/en/tools/qr-code', label: 'the QR code maker' }]}>
    <nav className="sc-tabs" role="tablist" aria-label="Calculator modes">
      {TABS.map(t => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="sc-tab" onClick={() => choose(t.id)} onMouseEnter={() => loaders[t.id]?.()} onFocus={() => loaders[t.id]?.()}>
        <span className="sc-tab-icon" aria-hidden="true">{t.icon}</span><span>{t.label}</span>
      </button>)}
    </nav>
    <div role="tabpanel" aria-label={TABS.find(t => t.id === tab)?.label}>
      <div hidden={tab !== 'calc'}><Calculator active={tab === 'calc'} t={tCalc} /></div>
      {Tab && <Suspense fallback={<p className="sc-loading">Loading…</p>}><Tab openGraph={openGraph} seed={tab === 'graph' ? graphSeed : null} t={tCalc} /></Suspense>}
    </div>
  </ToolFrame>
}

import { useId } from 'react'

// A4 SVG sheets for the maths generator. Maths reads left-to-right, also on a
// Hebrew page; the numbering runs right-to-left like the rest of the sheet.

const W = 600, H = 820
const FONT = 'Heebo, Arial, sans-serif'
const PICS = ['🍎', '⭐', '🎈', '🐟', '🌸', '🚗', '🧁', '⚽']
const BLANK = '____'
const ANS = '#db2777'

function Header({ title, instruction, answers }) {
  return <g fontFamily={FONT} textAnchor="middle" fill="#111">
    <text x={W / 2} y="38" fontSize="24" fontWeight="700" direction="rtl">{answers ? 'פתרון: ' + title : title}</text>
    {!answers && <text x={W / 2} y="66" fontSize="15" direction="rtl">שם: ____________    תאריך: ____________</text>}
    <text x={W / 2} y="96" fontSize="17" fontWeight="700" direction="rtl">{instruction}</text>
  </g>
}

const Num = ({ x, y, n }) => <g><circle cx={x} cy={y - 6} r="11" fill="none" stroke="#bbb" /><text x={x} y={y - 1} fontSize="12" textAnchor="middle" fill="#888">{n}</text></g>

// Inline exercise: "7 + 5 = ____" with the hidden part as a blank.
function Inline({ e, x, y, answers, size = 30 }) {
  const part = k => e.hide === k ? (answers ? String(e[k]) : BLANK) : String(e[k])
  const color = k => e.hide === k && answers ? ANS : '#111'
  const op = e.o === '-' ? '−' : '+'
  return <text x={x} y={y} fontSize={size} fontFamily={FONT} textAnchor="middle" direction="ltr" fill="#111">
    <tspan fill={color('a')}>{part('a')}</tspan><tspan> {op} </tspan><tspan fill={color('b')}>{part('b')}</tspan><tspan> = </tspan><tspan fill={color('c')}>{part('c')}</tspan>
  </text>
}

function Vertical({ e, x, y, answers }) {
  const op = e.o === '-' ? '−' : '+', right = x + 40
  return <g fontFamily={FONT} fontSize="34" fill="#111">
    <text x={right} y={y} textAnchor="end">{e.a}</text>
    <text x={right} y={y + 40} textAnchor="end">{e.b}</text>
    <text x={x - 40} y={y + 40}>{op}</text>
    <path d={`M${x - 45} ${y + 54} H${right + 6}`} stroke="#111" strokeWidth="2.5" />
    {answers ? <text x={right} y={y + 96} textAnchor="end" fill={ANS}>{e.c}</text> : <rect x={x - 22} y={y + 64} width="64" height="42" rx="6" fill="none" stroke="#bbb" strokeDasharray="4 4" />}
  </g>
}

function Pictures({ e, x, y, answers, pic }) {
  const a = Array.from({ length: e.a }, () => pic).join('')
  const b = Array.from({ length: e.b }, () => pic).join('')
  return <g>
    <text x={x} y={y} fontSize="22" textAnchor="middle" direction="ltr">
      {e.o === '+'
        ? <><tspan>{a}</tspan><tspan fontFamily={FONT} fontSize="28" fontWeight="700" dx="8">+</tspan><tspan dx="8">{b}</tspan></>
        : <tspan>{a}</tspan>}
    </text>
    {e.o === '-' && <text x={x} y={y - 26} fontSize="15" fontFamily={FONT} textAnchor="middle" direction="rtl" fill="#555">מחקו {e.b} בקו — כמה נשארו?</text>}
    <Inline e={{ ...e, hide: 'c' }} x={x} y={y + 44} answers={answers} size={26} />
  </g>
}

const INSTRUCTIONS = {
  regular: 'פתרו את התרגילים וכתבו את התשובה על הקו',
  missing: 'איזה מספר חסר? כתבו אותו על הקו',
  vertical: 'פתרו את התרגילים במאונך',
  pictures: 'ספרו את הציורים ופתרו',
}

export function ExerciseSheet({ items, title, type, answers = false }) {
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
    <Header title={title} instruction={INSTRUCTIONS[type]} answers={answers} />
    {type === 'vertical'
      ? items.map((e, i) => { const col = i % 4, row = Math.floor(i / 4), x = 510 - col * 140, y = 150 + row * 134; return <g key={i}><Num x={x + 55} y={y - 24} n={i + 1} /><Vertical e={e} x={x} y={y} answers={answers} /></g> })
      : type === 'pictures'
        ? items.map((e, i) => { const col = i % 2, row = Math.floor(i / 2), x = 450 - col * 300, y = 170 + row * 160; return <g key={i}><Num x={x + 135} y={y - 34} n={i + 1} /><Pictures e={e} x={x} y={y} answers={answers} pic={PICS[i % PICS.length]} /></g> })
        : items.map((e, i) => { const col = Math.floor(i / 10), row = i % 10, x = 450 - col * 300, y = 150 + row * 64; return <g key={i}><Num x={x + 125} y={y} n={i + 1} /><Inline e={e} x={x} y={y} answers={answers} /></g> })}
  </svg>
}

// שבילים: circles joined by arrows, the step written above each arrow.
export function PathSheet({ items, title, answers = false }) {
  const xs = [58, 179, 300, 421, 542]
  // PrintPreview renders every page twice (dialog + print copy) — a fixed marker id would resolve to
  // the copy hidden in print and the arrowheads would vanish on paper.
  const arrowId = 'buga-arrow-' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} style={{ width: '100%', height: '100%', background: 'white' }}>
    <Header title={title} instruction="השלימו את השבילים — מה חסר בעיגול או על החץ?" answers={answers} />
    <defs><marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="#111" /></marker></defs>
    {items.map((p, i) => {
      const y = 170 + i * 90
      return <g key={i} fontFamily={FONT}>
        {p.ops.map((op, j) => {
          const hidden = p.hideOp[j]
          return <g key={'o' + j}>
            <path d={`M${xs[j] + 30} ${y} H${xs[j + 1] - 32}`} stroke="#111" strokeWidth="2.2" markerEnd={`url(#${arrowId})`} />
            {hidden && !answers
              ? <rect x={(xs[j] + xs[j + 1]) / 2 - 24} y={y - 42} width="48" height="30" rx="6" fill="white" stroke="#999" strokeDasharray="4 3" />
              : <text x={(xs[j] + xs[j + 1]) / 2} y={y - 16} fontSize="22" fontWeight="700" textAnchor="middle" direction="ltr" fill={hidden ? ANS : '#111'}>{op}</text>}
          </g>
        })}
        {p.nums.map((n, j) => <g key={'n' + j}>
          <circle cx={xs[j]} cy={y} r="28" fill={j === 0 ? '#FFF4CC' : 'white'} stroke="#111" strokeWidth="2.5" />
          {(!p.hideNum[j] || answers) && <text x={xs[j]} y={y + 10} fontSize="28" fontWeight="700" textAnchor="middle" fill={p.hideNum[j] ? ANS : '#111'}>{n}</text>}
        </g>)}
      </g>
    })}
  </svg>
}

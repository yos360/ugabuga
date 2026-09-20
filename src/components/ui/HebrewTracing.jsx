import { useState } from 'react'
import PrintPreview from './PrintPreview'

const LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת']

export function LetterSheet({letter, dotted = true}) {
  const dash = dotted ? '0.1 7' : '8 6'
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול האות ${letter} בקו ${dotted ? 'מנוקד' : 'מקווקו'}`} style={{width:'100%',height:'100%',background:'white'}}>
    <g fill="#111" fontFamily="Heebo, Arial, sans-serif" textAnchor="middle">
      <text x="300" y="40" fontSize="24">האות {letter} — עוברים בעיפרון</text>
      <text x="300" y="75" fontSize="15">שם: ____________    תאריך: ____________</text>
      <text x="300" y="385" fontSize="300" fontWeight="500" fill="none" stroke="#111" strokeWidth="2" strokeDasharray={dash} strokeLinecap="round">{letter}</text>
      <text x="300" y="425" fontSize="17">מתרגלים על הקווים, ואז כותבים לבד</text>
      {[495,590,685].map((y,row)=><g key={y}>
        <path d={`M35 ${y+14} H565 M35 ${y-48} H565`} fill="none" stroke="#aaa" strokeWidth="1"/>
        {[520,420,320,220,120].slice(0,5-row*2).map(x=><text key={x} x={x} y={y} fontSize="75" fontWeight="500" fill="none" stroke="#111" strokeWidth="1.3" strokeDasharray={dotted?'0.1 4':'4 4'} strokeLinecap="round">{letter}</text>)}
      </g>)}
      <path d="M35 785 H565 M35 725 H565" fill="none" stroke="#aaa" strokeWidth="1"/>
    </g>
  </svg>
}

export default function HebrewTracing(){
  const [dotted,setDotted]=useState(true),[selection,setSelection]=useState(null)
  return <section dir="rtl">
    <div className="mb-6 flex flex-wrap justify-center gap-3" aria-label="סגנון האות">
      {[[true,'אות בנקודות'],[false,'אות מקווקוות']].map(([value,label])=><button key={label} aria-pressed={dotted===value} onClick={()=>setDotted(value)} className={`min-h-[44px] rounded-xl border-2 px-5 py-3 font-bold ${dotted===value?'border-black bg-yellow-100':'bg-white'}`}>{label}</button>)}
      <button onClick={()=>setSelection(LETTERS)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white">הדפיסו את כל 22 האותיות</button>
    </div>
    <p className="mb-5 text-center">שחור־לבן בלבד · כל אות בדף A4 נפרד · האות הגדולה ושורות התרגול ניתנות למעבר בעיפרון</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{LETTERS.map(letter=><button key={letter} onClick={()=>setSelection([letter])} aria-label={`פתחו והדפיסו את האות ${letter}`} className="rounded-2xl border-2 bg-white p-3 shadow-sm focus-visible:outline-4 focus-visible:outline-cyan-500"><div className="aspect-[210/297]"><LetterSheet letter={letter} dotted={dotted}/></div><strong className="block py-2">אות {letter} · פתיחה והדפסה</strong></button>)}</div>
    {selection&&<PrintPreview title={selection.length===1?`תרגול האות ${selection[0]}`:'כל אותיות האלף־בית'} onClose={()=>setSelection(null)}>{selection.map(letter=><article className="buga-a4" key={letter}><div className="print-art"><LetterSheet letter={letter} dotted={dotted}/></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}</PrintPreview>}
  </section>
}

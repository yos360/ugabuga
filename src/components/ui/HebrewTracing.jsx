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

// One A4 sheet per name: the name big and traceable at the top, then practice rows
// (traceable copies that fade out, then empty lines). Hebrew and English are
// detected per name so a mixed class list works in one print run.
const isHebrew = s => /[֐-׿]/.test(s)
export function NameSheet({name, dotted = true}) {
  const heb = isHebrew(name), font = heb ? 'Heebo, Arial, sans-serif' : 'Arial, Helvetica, sans-serif'
  const big = Math.min(150, Math.floor(520 / Math.max(name.length, 1) * (heb ? 1.45 : 1.55)))
  const row = Math.min(70, Math.floor(big * 0.5))
  const dash = d => dotted ? `0.1 ${d}` : `${d} ${d}`
  const rows = [300, 400, 500, 600, 700]
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול כתיבת השם ${name}`} style={{width:'100%',height:'100%',background:'white'}} direction={heb?'rtl':'ltr'}>
    <g fill="#111" fontFamily={font} textAnchor="middle">
      <text x="300" y="40" fontSize="24">{heb ? 'כותבים את השם שלי' : 'I write my name'}</text>
      <text x="300" y="72" fontSize="15">{heb ? 'מתרגלים על הקווים, ואז כותבים לבד' : 'Trace the lines, then write it yourself'}</text>
      <path d="M35 232 H565" fill="none" stroke="#aaa" strokeWidth="1"/>
      <text x="300" y="215" fontSize={big} fontWeight="600" fill="none" stroke="#111" strokeWidth="2" strokeDasharray={dash(7)} strokeLinecap="round" direction={heb?'rtl':'ltr'}>{name}</text>
      {rows.map((y,i)=><g key={y}>
        <path d={`M35 ${y+12} H565 M35 ${y-row*0.72} H565`} fill="none" stroke="#aaa" strokeWidth="1"/>
        {i<3 && <text x="300" y={y} fontSize={row} fontWeight="500" fill="none" stroke={i===0?'#111':i===1?'#666':'#bbb'} strokeWidth="1.3" strokeDasharray={dash(4)} strokeLinecap="round" direction={heb?'rtl':'ltr'}>{name}</text>}
      </g>)}
      <path d="M35 790 H565 M35 745 H565" fill="none" stroke="#aaa" strokeWidth="1"/>
    </g>
  </svg>
}

function ClassNames({dotted}) {
  const [text,setText]=useState(''),[names,setNames]=useState(null)
  const list=text.split(/\n|,/).map(s=>s.trim()).filter(Boolean)
  return <div className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-sm">
    <h2 className="mb-2 text-2xl font-bold">📝 שמות לכל הכיתה או הגן — בהדפסה אחת</h2>
    <p className="mb-3">מדביקים את רשימת השמות (שם בכל שורה), בעברית או באנגלית. כל ילד מקבל דף A4 משלו עם השם שלו למעבר בעיפרון — מתאים גם לכל מי שחוגג יום הולדת החודש.</p>
    <textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder={'נועה\nאיתי\nDaniel\nמאיה'} className="mb-3 w-full rounded-xl border-2 border-[var(--border)] bg-white p-3 text-lg" aria-label="רשימת שמות, שם בכל שורה"/>
    <div className="flex flex-wrap items-center gap-3">
      <button disabled={!list.length} onClick={()=>setNames(list)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white disabled:opacity-50">🖨️ הדפיסו {list.length ? `${list.length} דפים` : 'לכל הילדים'}</button>
      {list.length>0 && <span className="text-sm">{list.length} שמות · דף לכל ילד · {dotted?'בנקודות':'מקווקו'}</span>}
    </div>
    {names&&<PrintPreview title={`כתיבת השם — ${names.length} ילדים`} onClose={()=>setNames(null)}>{names.map((n,i)=><article className="buga-a4" key={i}><div className="print-art"><NameSheet name={n} dotted={dotted}/></div></article>)}</PrintPreview>}
  </div>
}

export default function HebrewTracing(){
  const [dotted,setDotted]=useState(true),[selection,setSelection]=useState(null)
  return <section dir="rtl">
    <div className="mb-6 flex flex-wrap justify-center gap-3" aria-label="סגנון האות">
      {[[true,'אות בנקודות'],[false,'אות מקווקוות']].map(([value,label])=><button key={label} aria-pressed={dotted===value} onClick={()=>setDotted(value)} className={`min-h-[44px] rounded-xl border-2 px-5 py-3 font-bold ${dotted===value?'border-black bg-yellow-100':'bg-white'}`}>{label}</button>)}
      <button onClick={()=>setSelection(LETTERS)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white">הדפיסו את כל 22 האותיות</button>
    </div>
    <ClassNames dotted={dotted}/>
    <p className="mb-5 text-center">שחור־לבן בלבד · כל אות בדף A4 נפרד · האות הגדולה ושורות התרגול ניתנות למעבר בעיפרון</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{LETTERS.map(letter=><button key={letter} onClick={()=>setSelection([letter])} aria-label={`פתחו והדפיסו את האות ${letter}`} className="rounded-2xl border-2 bg-white p-3 shadow-sm focus-visible:outline-4 focus-visible:outline-cyan-500"><div className="aspect-[210/297]"><LetterSheet letter={letter} dotted={dotted}/></div><strong className="block py-2">אות {letter} · פתיחה והדפסה</strong></button>)}</div>
    {selection&&<PrintPreview title={selection.length===1?`תרגול האות ${selection[0]}`:'כל אותיות האלף־בית'} onClose={()=>setSelection(null)}>{selection.map(letter=><article className="buga-a4" key={letter}><div className="print-art"><LetterSheet letter={letter} dotted={dotted}/></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}</PrintPreview>}
  </section>
}

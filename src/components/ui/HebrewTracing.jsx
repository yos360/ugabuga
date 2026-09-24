import { useEffect, useState } from 'react'
import { skeleton, SK_SIZE } from '../../utils/letterSkeleton'
import { hebrewStrokeWord } from '../../data/hebrewStrokes'
import PrintPreview from './PrintPreview'

const LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת']

// One centre line per stroke (see utils/letterSkeleton). Falls back to light-grey
// letters until the line is ready, so a sheet is never blank.
function TraceText({ text, x, y, size, dotted, color = '#444', heb = true, font = 'Heebo' }) {
  const hand = heb ? hebrewStrokeWord(text) : null
  const [sk, setSk] = useState(null)
  useEffect(() => { if (hand) return; let on = true; skeleton(text, { font, rtl: heb }).then(r => on && setSk(r)).catch(() => {}); return () => { on = false } }, [text, heb, font, !hand])
  const dash = k => (dotted ? [0.1, 6.5] : [7, 4.5]).map(v => v / k).join(' ')
  const cap = dotted ? 'round' : 'butt'
  if (hand) {
    // Letter height = the font's cap height at this size, so rows line up the same.
    const k = size * 0.72 / 100
    return <g transform={`translate(${x - hand.width / 2 * k} ${y - 100 * k}) scale(${k})`} fill="none" stroke={color} strokeWidth={2.8 / k} strokeDasharray={dash(k)} strokeLinecap={cap} strokeLinejoin="miter">
      {hand.parts.map((p, i) => <path key={i} d={p.d} transform={`translate(${p.dx} 0)`} />)}
    </g>
  }
  if (!sk) return <text x={x} y={y} fontSize={size} fill="#ddd" fontWeight="400" direction={heb ? 'rtl' : 'ltr'}>{text}</text>
  const k = size / SK_SIZE
  return <g transform={`translate(${x - sk.w / 2 * k} ${y - sk.base * k}) scale(${k})`}>
    <path d={sk.d} fill="none" stroke={color} strokeWidth={2.8 / k} strokeDasharray={dash(k)} strokeLinecap={cap} strokeLinejoin="round" />
  </g>
}

// Hollow letters to colour in: the white fill is painted over the stroke, so only
// the outer contour shows — no overlapping inner lines.
const ColorText = ({ text, x, y, size, heb = true }) => <text x={x} y={y} fontSize={size} fontWeight="800" fill="white" stroke="#111" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" direction={heb ? 'rtl' : 'ltr'}>{text}</text>

const Heading = ({ y, children }) => <text x="300" y={y} fontSize="21" fontWeight="700">{children}</text>
const Lines = ({ y, size }) => <path d={`M35 ${y + size * 0.3} H565 M35 ${y - size * 0.72} H565`} fill="none" stroke="#bbb" strokeWidth="1" />

export function LetterSheet({letter, dotted = true}) {
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול האות ${letter}`} style={{width:'100%',height:'100%',background:'white'}}>
    <g fill="#111" fontFamily="Heebo, Arial, sans-serif" textAnchor="middle">
      <text x="300" y="36" fontSize="24" fontWeight="700">האות {letter}</text>
      <text x="300" y="66" fontSize="15">שם: ____________    תאריך: ____________</text>
      <Heading y={108}>עוברים על הקווים</Heading>
      <TraceText text={letter} x={300} y={335} size={190} dotted={dotted} />
      <Lines y={440} size={70} />
      {[500, 400, 300, 200, 100].map(x => <TraceText key={x} text={letter} x={x} y={440} size={70} dotted={dotted} />)}
      <Lines y={530} size={70} />
      <Heading y={610}>צובעים את האות</Heading>
      <ColorText text={letter} x={300} y={760} size={165} />
    </g>
  </svg>
}

// One A4 sheet per name: trace it on a single dashed line, practise, then colour
// it in. Hebrew and English are detected per name so a mixed class list works.
const isHebrew = s => /[\u0590-\u05FF]/.test(s)
export function NameSheet({name, dotted = true}) {
  const heb = isHebrew(name), font = heb ? 'Heebo' : 'Arial'
  const big = Math.min(130, Math.floor(520 / Math.max(name.length, 1) * (heb ? 1.45 : 1.55)))
  const row = Math.min(66, Math.floor(big * 0.5))
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול כתיבת השם ${name}`} style={{width:'100%',height:'100%',background:'white'}} direction={heb?'rtl':'ltr'}>
    <g fill="#111" fontFamily={`${font}, Arial, sans-serif`} textAnchor="middle">
      <text x="300" y="36" fontSize="24" fontWeight="700">{heb ? 'כותבים את השם שלי' : 'I write my name'}</text>
      <Heading y={82}>{heb ? 'עוברים על הקווים' : 'Trace the lines'}</Heading>
      <Lines y={240} size={big} />
      <TraceText text={name} x={300} y={240} size={big} dotted={dotted} heb={heb} font={font} />
      <Lines y={340} size={row} />
      <TraceText text={name} x={300} y={340} size={row} dotted={dotted} heb={heb} font={font} />
      <Lines y={425} size={row} />
      <TraceText text={name} x={300} y={425} size={row} dotted={dotted} heb={heb} font={font} color="#888" />
      <Lines y={510} size={row} />
      <Heading y={585}>{heb ? 'צובעים את השם' : 'Colour the name'}</Heading>
      <ColorText text={name} x={300} y={730} size={big} heb={heb} />
    </g>
  </svg>
}

// Saved class lists live on this device only (localStorage) — names never leave the browser.
const LISTS_KEY = 'buga-class-lists', DRAFT_KEY = 'buga-class-draft'
const readLists = () => { try { return JSON.parse(localStorage.getItem(LISTS_KEY)) || [] } catch { return [] } }
const writeLists = lists => { try { localStorage.setItem(LISTS_KEY, JSON.stringify(lists)) } catch { /* private mode */ } }

function ClassNames({dotted}) {
  const [text,setText]=useState(()=>{ try { return localStorage.getItem(DRAFT_KEY) || '' } catch { return '' } })
  const [names,setNames]=useState(null)
  const [lists,setLists]=useState(readLists)
  const [listName,setListName]=useState('')
  const [active,setActive]=useState('')
  const [confirmDel,setConfirmDel]=useState('')
  const [note,setNote]=useState('')
  const list=text.split(/\n|,/).map(s=>s.trim()).filter(Boolean)
  const flash=t=>{setNote(t);setTimeout(()=>setNote(''),2500)}
  const changeText=v=>{ setText(v); try { localStorage.setItem(DRAFT_KEY, v) } catch { /* ignore */ } }
  const save=()=>{
    const title=(listName||active).trim(); if(!title||!list.length) return
    const next=[{name:title,names:list,at:Date.now()},...lists.filter(l=>l.name!==title)].slice(0,20)
    setLists(next); writeLists(next); setActive(title); setListName(''); flash(`✓ הרשימה „${title}” נשמרה`)
  }
  const load=l=>{ changeText(l.names.join('\n')); setActive(l.name); setConfirmDel(''); flash(`✓ נטענה הרשימה „${l.name}”`) }
  const remove=title=>{ const next=lists.filter(l=>l.name!==title); setLists(next); writeLists(next); if(active===title) setActive(''); setConfirmDel('') }
  return <div className="mb-10 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-sm">
    <h2 className="mb-2 text-2xl font-bold">📝 שמות לכל הכיתה או הגן — בהדפסה אחת</h2>
    <p className="mb-3">מדביקים את רשימת השמות (שם בכל שורה), בעברית או באנגלית. כל ילד מקבל דף A4 משלו עם השם שלו למעבר בעיפרון — מתאים גם לכל מי שחוגג יום הולדת החודש.</p>

    {lists.length>0 && <div className="mb-3">
      <p className="mb-1.5 text-sm font-bold">📋 הרשימות השמורות שלי:</p>
      <div className="flex flex-wrap gap-2">{lists.map(l=><span key={l.name} className={`flex items-center rounded-full border-2 bg-white ${active===l.name?'border-slate-800':'border-[var(--border)]'}`}>
        <button onClick={()=>load(l)} className="py-1.5 pe-1 ps-3 text-sm font-bold">{l.name} <span className="font-normal text-slate-500">({l.names.length})</span></button>
        {confirmDel===l.name
          ? <><button onClick={()=>remove(l.name)} className="px-2 text-sm font-bold text-rose-700">למחוק?</button><button onClick={()=>setConfirmDel('')} className="pe-3 text-sm text-slate-500">לא</button></>
          : <button onClick={()=>setConfirmDel(l.name)} aria-label={`מחיקת הרשימה ${l.name}`} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:text-rose-600">✕</button>}
      </span>)}</div>
    </div>}

    <textarea value={text} onChange={e=>changeText(e.target.value)} rows={5} placeholder={'נועה\nאיתי\nDaniel\nמאיה'} className="mb-3 w-full rounded-xl border-2 border-[var(--border)] bg-white p-3 text-lg" aria-label="רשימת שמות, שם בכל שורה"/>
    <div className="flex flex-wrap items-center gap-3">
      <button disabled={!list.length} onClick={()=>setNames(list)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white disabled:opacity-50">🖨️ הדפיסו {list.length ? `${list.length} דפים` : 'לכל הילדים'}</button>
      {list.length>0 && <span className="text-sm">{list.length} שמות · דף לכל ילד · {dotted?'בנקודות':'מקווקו'}</span>}
    </div>

    {list.length>0 && <form onSubmit={e=>{e.preventDefault();save()}} className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-dashed border-[var(--border)] pt-4">
      <input value={listName} onChange={e=>setListName(e.target.value)} maxLength={40} placeholder={active?`שמירה בתור „${active}”, או שם חדש`:'שם לרשימה, למשל: גן רימון'} aria-label="שם הרשימה"
        className="w-full min-w-0 rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2.5 text-[17px] sm:w-auto sm:flex-1"/>
      <button disabled={!(listName.trim()||active)} className="min-h-[44px] w-full shrink-0 rounded-xl border-2 border-slate-800 bg-white px-4 font-bold disabled:opacity-50 sm:w-auto">💾 שמירת הרשימה</button>
      <span className="w-full text-xs text-slate-600">הרשימה נשמרת רק במכשיר הזה — בפעם הבאה בוחרים אותה בלחיצה.</span>
    </form>}
    {note && <p role="status" className="mt-2 font-bold text-emerald-700">{note}</p>}
    {names&&<PrintPreview title={`כתיבת השם — ${names.length} ילדים`} onClose={()=>setNames(null)}>{names.map((n,i)=><article className="buga-a4" key={i}><div className="print-art"><NameSheet name={n} dotted={dotted}/></div></article>)}</PrintPreview>}
  </div>
}

export default function HebrewTracing(){
  const [dotted,setDotted]=useState(false),[selection,setSelection]=useState(null)
  return <section dir="rtl">
    <div className="mb-6 flex flex-wrap justify-center gap-3" aria-label="סגנון האות">
      {[[false,'אות מקווקוות'],[true,'אות בנקודות']].map(([value,label])=><button key={label} aria-pressed={dotted===value} onClick={()=>setDotted(value)} className={`min-h-[44px] rounded-xl border-2 px-5 py-3 font-bold ${dotted===value?'border-black bg-yellow-100':'bg-white'}`}>{label}</button>)}
      <button onClick={()=>setSelection(LETTERS)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white">הדפיסו את כל 22 האותיות</button>
    </div>
    <ClassNames dotted={dotted}/>
    <p className="mb-5 text-center">שחור־לבן בלבד · כל אות בדף A4 נפרד · האות הגדולה ושורות התרגול ניתנות למעבר בעיפרון</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{LETTERS.map(letter=><button key={letter} onClick={()=>setSelection([letter])} aria-label={`פתחו והדפיסו את האות ${letter}`} className="rounded-2xl border-2 bg-white p-3 shadow-sm focus-visible:outline-4 focus-visible:outline-cyan-500"><div className="aspect-[210/297]"><LetterSheet letter={letter} dotted={dotted}/></div><strong className="block py-2">אות {letter} · פתיחה והדפסה</strong></button>)}</div>
    {selection&&<PrintPreview title={selection.length===1?`תרגול האות ${selection[0]}`:'כל אותיות האלף־בית'} onClose={()=>setSelection(null)}>{selection.map(letter=><article className="buga-a4" key={letter}><div className="print-art"><LetterSheet letter={letter} dotted={dotted}/></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}</PrintPreview>}
  </section>
}

import { useEffect, useState } from 'react'
import PrintPreview from './PrintPreview'
import { HERSHEY, HERSHEY_CAP, HERSHEY_BASE, HERSHEY_XH } from '../../data/hersheyLatin'

const LETTERS = [...'אבגדהוזחטיכלמנסעפצקרשת']
const isHebrew = s => /[\u0590-\u05FF]/.test(s)
const ABC = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']

// Hebrew: real single-line tracing font (BugaTracer, from Cousine-Tracer); its
// letters are 0.6em tall and 0.6em wide. English: Hershey single-stroke centre
// lines drawn dashed. Both are scaled to the row height and never overflow the page.
function TraceText({ text, x, y, size, color = '#444', heb = true }) {
  if (!heb) return <LatinTrace text={text} x={x} y={y} cap={letterH(text, size, false)} color={color} />
  const fs = tracerSize(text, size)
  return <text x={x} y={y} fontSize={fs} fontFamily="BugaTracer" fill={color} stroke={color} strokeWidth={fs * 0.012} direction="rtl" textAnchor="middle">{text}</text>
}

const SPACE = 8
const latinUnits = text => [...text].reduce((w, c) => w + 2 * (HERSHEY[c]?.[1] ?? SPACE), 0)
export function LatinTrace({ text, x, y, cap, color, solidOps = false }) {
  const k = cap / HERSHEY_CAP
  let cursor = x - latinUnits(text) * k / 2
  // Stroke and dash are set in glyph units (divided by k) so they scale with the
  // sheet: the same proportions on the A4 page and in the small preview cards.
  const sw = Math.max(cap * 0.045, 1.6) / k, dash = `${Math.max(cap * 0.09, 3) / k} ${Math.max(cap * 0.075, 2.6) / k}`
  return <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
    {[...text].map((c, i) => {
      const g = HERSHEY[c], left = cursor
      cursor += 2 * (g?.[1] ?? SPACE) * k
      // In arithmetic the short operator strokes read better solid and thin.
      const op = solidOps && '+-=x:()'.includes(c)
      return g ? <path key={i} d={g[0]} transform={`translate(${left} ${y - HERSHEY_BASE * k}) scale(${k})`} strokeWidth={op ? sw * 0.6 : sw} strokeDasharray={op ? undefined : dash} /> : null
    })}
  </g>
}

// Hollow letters to colour in: the white fill is painted over the stroke, so only
// the outer contour shows — no overlapping inner lines.
export const ColorText = ({ text, x, y, size, heb = true }) => <text x={x} y={y} fontSize={size} fontWeight="800" fill="white" stroke="#111" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke" direction={heb ? 'rtl' : 'ltr'}>{text}</text>

export const Heading = ({ y, children }) => <text x="300" y={y} fontSize="21" fontWeight="700">{children}</text>
// Writing lines: letters sit on the baseline and reach the top line (h = letter height).
// English sheets add the dashed middle line of school handwriting paper (x-height).
export const Lines = ({ y, h, mid = 0 }) => <g fill="none"><path d={`M35 ${y - h} H565`} stroke="#ccc" strokeWidth="1" strokeDasharray="5 4" />{mid > 0 && <path d={`M35 ${y - mid} H565`} stroke="#ddd" strokeWidth="1" strokeDasharray="2 5" />}<path d={`M35 ${y} H565`} stroke="#999" strokeWidth="1.2" /></g>
const tracerSize = (text, size) => Math.min(size * 1.2, 540 / Math.max([...text].length * 0.62, 1))
// Cap height of a row: Hebrew from the tracer font, English fitted to 540px wide.
export const letterH = (text, size, heb = true) => heb ? tracerSize(text, size) * 0.6
  : Math.min(tracerSize(text, size) * 0.66, 540 * HERSHEY_CAP / Math.max(latinUnits(text), 1))
export const xHeight = (text, size) => letterH(text, size, false) * HERSHEY_XH / HERSHEY_CAP

export function LetterSheet({letter}) {
  const heb = isHebrew(letter)
  if (!heb) return <EnglishLetterSheet letter={letter} />
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול האות ${letter}`} style={{width:'100%',height:'100%',background:'white'}}>
    <g fill="#111" fontFamily="Heebo, Arial, sans-serif" textAnchor="middle">
      <text x="300" y="36" fontSize="24" fontWeight="700">האות {letter}</text>
      <text x="300" y="66" fontSize="15">שם: ____________    תאריך: ____________</text>
      <Heading y={108}>עוברים על הקווים</Heading>
      <TraceText text={letter} x={300} y={335} size={190} />
      <Lines y={440} h={letterH(letter, 70)} />
      {[500, 400, 300, 200, 100].map(x => <TraceText key={x} text={letter} x={x} y={440} size={70} />)}
      <Lines y={530} h={letterH(letter, 70)} />
      <Heading y={610}>צובעים את האות</Heading>
      <ColorText text={letter} x={300} y={760} size={165} />
    </g>
  </svg>
}

// Capital + small letter on school handwriting lines (top, dashed middle, base).
function EnglishLetterSheet({letter}) {
  const big = letter + letter.toLowerCase(), cap = letterH('A', 64, false), mid = xHeight('A', 64)
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול האות ${big}`} style={{width:'100%',height:'100%',background:'white'}} direction="ltr">
    <g fill="#111" fontFamily="Heebo, Arial, sans-serif" textAnchor="middle">
      <text x="300" y="36" fontSize="24" fontWeight="700">Letter {letter} {letter.toLowerCase()}</text>
      <text x="300" y="66" fontSize="15">Name: ____________    Date: ____________</text>
      <Heading y={104}>Trace the lines</Heading>
      <Lines y={300} h={letterH(big, 150, false)} mid={xHeight(big, 150)} />
      <TraceText text={big} x={300} y={300} size={150} heb={false} />
      <Lines y={410} h={cap} mid={mid} />
      {[100, 200, 300, 400, 500].map(x => <TraceText key={x} text={letter} x={x} y={410} size={64} heb={false} />)}
      <Lines y={500} h={cap} mid={mid} />
      {[100, 200, 300, 400, 500].map(x => <TraceText key={x} text={letter.toLowerCase()} x={x} y={500} size={64} heb={false} />)}
      <Lines y={580} h={cap} mid={mid} />
      <Heading y={640}>Colour the letters</Heading>
      <ColorText text={big} x={300} y={775} size={150} heb={false} />
    </g>
  </svg>
}

// One A4 sheet per name: trace it on a single dashed line, practise, then colour
// it in. Hebrew and English are detected per name so a mixed class list works.
export function NameSheet({name, dotted = true}) {
  const heb = isHebrew(name), font = heb ? 'Heebo' : 'Arial'
  const big = Math.min(130, Math.floor(520 / Math.max(name.length, 1) * (heb ? 1.45 : 1.55)))
  const row = Math.min(66, Math.floor(big * 0.5))
  return <svg viewBox="0 0 600 820" role="img" aria-label={`תרגול כתיבת השם ${name}`} style={{width:'100%',height:'100%',background:'white'}} direction={heb?'rtl':'ltr'}>
    <g fill="#111" fontFamily={`${font}, Arial, sans-serif`} textAnchor="middle">
      <text x="300" y="36" fontSize="24" fontWeight="700">{heb ? 'כותבים את השם שלי' : 'I write my name'}</text>
      <Heading y={82}>{heb ? 'עוברים על הקווים' : 'Trace the lines'}</Heading>
      <Lines y={240} h={letterH(name, big, heb)} mid={heb ? 0 : xHeight(name, big)} />
      <TraceText text={name} x={300} y={240} size={big} heb={heb} />
      <Lines y={340} h={letterH(name, row, heb)} mid={heb ? 0 : xHeight(name, row)} />
      <TraceText text={name} x={300} y={340} size={row} heb={heb} />
      <Lines y={425} h={letterH(name, row, heb)} mid={heb ? 0 : xHeight(name, row)} />
      <TraceText text={name} x={300} y={425} size={row} heb={heb} color="#888" />
      <Lines y={510} h={letterH(name, row, heb)} mid={heb ? 0 : xHeight(name, row)} />
      <Heading y={585}>{heb ? 'צובעים את השם' : 'Colour the name'}</Heading>
      <ColorText text={name} x={300} y={730} size={big} heb={heb} />
    </g>
  </svg>
}

// Saved class lists live on this device only (localStorage) — names never leave the browser.
const LISTS_KEY = 'buga-class-lists', DRAFT_KEY = 'buga-class-draft'
const readLists = () => { try { return JSON.parse(localStorage.getItem(LISTS_KEY)) || [] } catch { return [] } }
const writeLists = lists => { try { localStorage.setItem(LISTS_KEY, JSON.stringify(lists)) } catch { /* private mode */ } }

export function ClassNames({dotted}) {
  const [text,setText]=useState(()=>{ try { return localStorage.getItem(DRAFT_KEY) || '' } catch { return '' } })
  const [names,setNames]=useState(null)
  const [lists,setLists]=useState(readLists)
  const [listName,setListName]=useState('')
  const [active,setActive]=useState('')
  const [confirmDel,setConfirmDel]=useState('')
  const [note,setNote]=useState('')
  const [cursor,setCursor]=useState(0)
  const list=text.split(/\n|,/).map(s=>s.trim()).filter(Boolean)
  // Live preview: the name on the line being typed (else the last name, else an example).
  const lineAtCursor=(text.slice(0,cursor).split(/\n|,/).length-1)
  const typed=(text.split(/\n|,/)[lineAtCursor]||'').trim()
  const previewName=typed||list[list.length-1]||''
  const trackCursor=e=>setCursor(e.target.selectionStart||0)
  const flash=t=>{setNote(t);setTimeout(()=>setNote(''),2500)}
  const changeText=v=>{ setText(v); try { localStorage.setItem(DRAFT_KEY, v) } catch { /* ignore */ } }
  const save=()=>{
    const title=(listName||active).trim(); if(!title||!list.length) return
    const next=[{name:title,names:list,at:Date.now()},...lists.filter(l=>l.name!==title)].slice(0,20)
    setLists(next); writeLists(next); setActive(title); setListName(''); flash(`✓ הרשימה „${title}” נשמרה`)
  }
  const load=l=>{ changeText(l.names.join('\n')); setActive(l.name); setConfirmDel(''); flash(`✓ נטענה הרשימה „${l.name}”`) }
  const remove=title=>{ const next=lists.filter(l=>l.name!==title); setLists(next); writeLists(next); if(active===title) setActive(''); setConfirmDel('') }
  // Linked from the classroom hub as …#names — bring the box into view.
  useEffect(() => { if (window.location.hash === '#names') setTimeout(() => document.getElementById('names')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300) }, [])
  return <div id="names" className="mb-10 scroll-mt-4 rounded-3xl border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-sm">
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

    <div className="mb-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
      <textarea value={text} onChange={e=>{changeText(e.target.value);trackCursor(e)}} onSelect={trackCursor} onKeyUp={trackCursor} onClick={trackCursor} rows={7} placeholder={'כתבו שם, למשל: יוסי\nנועה\nDaniel'} className="w-full rounded-xl border-2 border-[var(--border)] bg-white p-3 text-lg" aria-label="רשימת שמות, שם בכל שורה"/>
      <figure className="mx-auto w-full max-w-[220px]" aria-live="polite">
        <div className={`aspect-[210/297] overflow-hidden rounded-lg border-2 border-[var(--border)] bg-white shadow-sm ${previewName?'':'opacity-40'}`}><NameSheet name={previewName||'יוסי'} dotted={dotted}/></div>
        <figcaption className="mt-1 text-center text-sm">{previewName?<>תצוגה מקדימה: <b>{previewName}</b></>:'כתבו שם – והדף יופיע כאן מיד'}</figcaption>
        {previewName&&<button type="button" onClick={()=>setNames([previewName])} className="mt-1 w-full rounded-lg border-2 border-slate-800 bg-white py-1.5 text-sm font-bold">🖨️ הדפסת הדף הזה</button>}
      </figure>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <button disabled={!list.length} onClick={()=>setNames(list)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white disabled:opacity-50">🖨️ הדפיסו {list.length ? `${list.length} דפים` : 'לכל הילדים'}</button>
      {list.length>0 && <span className="text-sm">{list.length} שמות · דף לכל ילד</span>}
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

export default function HebrewTracing({ lang = 'he' }){
  const en=lang==='en', letters=en?ABC:LETTERS, dotted=false, [selection,setSelection]=useState(null)
  const label=l=>en?`${l}${l.toLowerCase()}`:l
  return <section dir="rtl">
    <div className="mb-6 flex flex-wrap justify-center gap-3" aria-label="הדפסה">
      <button onClick={()=>setSelection(letters)} className="min-h-[44px] rounded-xl bg-pink-600 px-5 py-3 font-bold text-white">הדפיסו את כל {letters.length} האותיות</button>
    </div>
    <ClassNames dotted={dotted}/>
    <p className="mb-5 text-center">שחור־לבן בלבד · כל אות בדף A4 נפרד{en?' · אות גדולה ואות קטנה על שורות כתיבה באנגלית':''} · האות הגדולה ושורות התרגול ניתנות למעבר בעיפרון</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{letters.map(letter=><button key={letter} onClick={()=>setSelection([letter])} aria-label={`פתחו והדפיסו את האות ${label(letter)}`} className="rounded-2xl border-2 bg-white p-3 shadow-sm focus-visible:outline-4 focus-visible:outline-cyan-500"><div className="aspect-[210/297]"><LetterSheet letter={letter}/></div><strong className="block py-2">אות <bdi dir="ltr">{label(letter)}</bdi> · פתיחה והדפסה</strong></button>)}</div>
    {selection&&<PrintPreview title={selection.length===1?`תרגול האות ${label(selection[0])}`:en?'כל אותיות ה-ABC':'כל אותיות האלף־בית'} onClose={()=>setSelection(null)}>{selection.map(letter=><article className="buga-a4" key={letter}><div className="print-art"><LetterSheet letter={letter}/></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)}</PrintPreview>}
  </section>
}

import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const START=[['עוגה','מאכל מתוק שחוגגים איתו'],['חברים','מי שמגיעים למסיבה'],['משחק','פעילות שעושים יחד'],['בלון','מקשטים איתו את החדר'],['שמחה','הרגשה טובה'],['מתנה','מה שמקבלים ביום הולדת']]
const SIZE=15
function makeCrossword(entries){
 const grid=Array.from({length:SIZE},()=>Array(SIZE).fill(''))
 const placed=[]
 const put=(word,row,col,dir)=>{for(let i=0;i<word.length;i++)grid[row+(dir==='v'?i:0)][col+(dir==='h'?i:0)]=word[i];placed.push({word,row,col,dir})}
 const first=entries[0]?.word||'עוגה'; put(first,Math.floor(SIZE/2),Math.max(0,Math.floor((SIZE-first.length)/2)),'h')
 entries.slice(1).forEach(({word})=>{
  let done=false
  for(const p of placed){
   for(let a=0;a<word.length&&!done;a++) for(let b=0;b<p.word.length&&!done;b++){
    if(word[a]!==p.word[b]) continue
    const dir=p.dir==='h'?'v':'h', row=dir==='v'?p.row+b-a:p.row+a, col=dir==='h'?p.col+b-a:p.col+a
    if(row<0||col<0||row+(dir==='v'?word.length-1:0)>=SIZE||col+(dir==='h'?word.length-1:0)>=SIZE) continue
    let ok=true
    for(let i=0;i<word.length;i++){const cell=grid[row+(dir==='v'?i:0)][col+(dir==='h'?i:0)];if(cell&&cell!==word[i])ok=false}
    if(ok){put(word,row,col,dir);done=true}
   }
  }
  if(!done&&word.length<=SIZE) put(word,Math.min(SIZE-1,placed.length+1),0,'h')
 })
 return {grid,placed}
}
export default function CrosswordMaker(){
 const [rows,setRows]=useState(START.map(([word,clue])=>({word,clue}))),[result,setResult]=useState(null),[title,setTitle]=useState('התשבץ שלי')
 const valid=rows.map(x=>({word:x.word.replace(/\s/g,''),clue:x.clue})).filter(x=>x.word.length>=2)
 const generate=()=>setResult(makeCrossword(valid))
 return <div className="mx-auto max-w-5xl px-4 py-8"><SEO title="יוצר תשבצים מותאם אישית" description="הזינו מילים ורמזים וצרו תשבץ אישי להדפסה." path="/tools/crossword-maker"/><Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'כלים'},{label:'יוצר תשבצים'}]}/><h1 className="text-4xl text-center mb-2">🧩 יוצר תשבצים</h1><p className="text-center text-lg text-[var(--muted-foreground)] mb-6">כותבים מילים ורמזים — ומקבלים תשבץ אישי.</p>
  <div className="grid lg:grid-cols-[330px_1fr] gap-5 items-start"><section className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-4"><label className="font-bold">כותרת התשבץ<input value={title} onChange={e=>setTitle(e.target.value)} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 w-full mt-1"/></label><div className="flex justify-between items-center mt-4"><b>מילים ורמזים</b><span className="text-sm">{valid.length} מילים</span></div>{rows.map((r,i)=><div key={i} className="grid grid-cols-[1fr_1.4fr] gap-2 mt-2"><input value={r.word} onChange={e=>setRows(x=>x.map((a,n)=>n===i?{...a,word:e.target.value}:a))} placeholder="מילה" className="wobbly-sm border-2 border-[var(--border)] bg-white px-2 py-2"/><input value={r.clue} onChange={e=>setRows(x=>x.map((a,n)=>n===i?{...a,clue:e.target.value}:a))} placeholder="רמז" className="wobbly-sm border-2 border-[var(--border)] bg-white px-2 py-2"/></div>)}<button onClick={()=>setRows(x=>[...x,{word:'',clue:''}])} className="wobbly-sm border-2 border-dashed border-[var(--border)] px-3 py-2 mt-3">＋ הוסיפו מילה</button><button onClick={generate} disabled={valid.length<2} className="wobbly-md sketch-press w-full mt-4 border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold py-3 disabled:opacity-50">🧩 צרו תשבץ</button></section>
   <section>{result?<article className="wobbly border-2 border-[var(--border)] bg-white p-5 sketch-shadow"><header className="text-center border-b-2 border-dashed pb-3"><small>BUGA PUZZLE STUDIO</small><h2 className="text-3xl font-bold">{title}</h2><p>פתרו את המילים לפי הרמזים</p></header><div className="flex flex-wrap gap-6 justify-center mt-5"><div className="crossword-grid" style={{gridTemplateColumns:`repeat(${SIZE}, 1fr)`}} dir="ltr">{result.grid.flatMap((row,r)=>row.map((cell,c)=><div key={`${r}-${c}`} className={cell?'crossword-cell filled':'crossword-cell'}>{cell&&' '}</div>))}</div><div className="clues"><h3 className="font-bold text-xl mb-2">רמזים</h3>{result.placed.map((p,i)=><p key={p.word}><b>{i+1}.</b> {valid.find(x=>x.word===p.word)?.clue||'רמז למילה'}</p>)}</div></div><div className="text-center mt-5"><button onClick={()=>window.print()} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--postit)] px-6 py-3 font-bold">🖨️ הדפיסו את התשבץ</button></div></article>:<div className="wobbly border-2 border-dashed border-[var(--border)] p-10 text-center text-lg">הוסיפו מילים ורמזים בצד, ואז לחצו “צרו תשבץ”<div className="text-6xl mt-5">🧩</div></div>}</section></div><style>{`.crossword-grid{display:grid;width:min(100%,520px);aspect-ratio:1;background:#172033;border:5px solid #172033}.crossword-cell{background:#172033;border:1px solid #dbe4ea;min-width:0}.crossword-cell.filled{background:#fff;position:relative}.crossword-cell.filled:after{content:'';position:absolute;inset:3px;border:1px solid #b8c8d2}.clues{min-width:220px;max-width:300px}.clues p{margin:7px 0;border-bottom:1px dashed #cbd5e1;padding-bottom:5px}@media print{.no-print,header.site-header,footer.site-footer{display:none!important}.crossword-grid{width:150mm}.clues{font-size:12pt}}`}</style></div>
}

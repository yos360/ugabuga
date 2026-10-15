import { Sheet, T } from './PrintableShell'

function wrap(text, max = 35) {
  const lines = ['']
  for (const word of String(text || '').split(/\s+/)) {
    const n = lines.length - 1
    if (lines[n] && `${lines[n]} ${word}`.length > max) lines.push(word)
    else lines[n] += (lines[n] ? ' ' : '') + word
  }
  return lines
}
function Lines({ text, x, y, size = 4.2, max = 35, gap = 5.4, weight }) {
  return wrap(text, max).map((line,n)=><T key={n} x={x} y={y+n*gap} size={size} weight={weight}>{line}</T>)
}
function CutBox({ x,y,w,h }) {
  return <rect x={x} y={y} width={w} height={h} rx="2" fill="white" stroke="#64748b" strokeWidth=".4" strokeDasharray="2 1.5" />
}
function Icon({ id, x=0, y=0, scale=1 }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} stroke="#172b40" strokeWidth="1.2" strokeLinejoin="round">
    {id==='sun'&&<><circle r="10" fill="#ffc83d"/>{Array.from({length:8},(_,i)=><path key={i} d="M0 -14 V-18" transform={`rotate(${i*45})`}/>)}</>}
    {id==='tree'&&<><path d="M-3 4H3V18H-3Z" fill="#a56b43"/><circle cy="-5" r="13" fill="#5abf78"/></>}
    {id==='house'&&<><path d="M-13 -2H13V17H-13Z" fill="#fff0cf"/><path d="M-17 -2L0 -18L17 -2Z" fill="#f78e87"/><path d="M-3 17V5H4V17" fill="#8dbbea"/></>}
    {id==='ball'&&<><circle r="16" fill="#8dd5ed"/><path d="M-15 -5Q0 8 15 -5M-8 -14Q8 0 -8 14M-12 11Q2 -8 12 -11" fill="none"/></>}
    {id==='flower'&&<><path d="M0 0V19M0 13Q12 4 9 15Z" fill="#77bd75"/>{Array.from({length:5},(_,i)=><ellipse key={i} cy="-10" rx="5" ry="8" fill="#e7a1cd" transform={`rotate(${i*72})`}/>)}<circle r="5" fill="#ffd56d"/></>}
    {id==='fish'&&<><path d="M8 0L20 -10V10Z" fill="#f7b168"/><ellipse rx="14" ry="9" fill="#f7b168"/><circle cx="-7" cy="-2" r="1" fill="#172b40"/></>}
    {id==='star'&&<path d="M0 -18L5 -6L18 -5L8 4L11 17L0 10L-11 17L-8 4L-18 -5L-5 -6Z" fill="#ffd763"/>}
    {id==='heart'&&<path d="M0 16C-30 -1 -12 -25 0 -11C12 -25 30 -1 0 16Z" fill="#f2919c"/>}
  </g>
}
function QuestionCards({ cards }) {
  return cards.map((c,n)=>{
    const x=n%2?104:4,y=36+Math.floor(n/2)*75,w=92,h=70
    return <g key={n}><CutBox x={x} y={y} w={w} h={h}/>
      {c.category&&<T x={x+w/2} y={y+7} size={3.3} fill="#475569">{c.category}</T>}
      {c.title&&<T x={x+w/2} y={y+16} size={6} weight={800}>{c.title}</T>}
      <Lines text={c.q} x={x+w/2} y={y+(c.title?27:18)} max={35} />
      {c.a&&<g transform={`rotate(180 ${x+w/2} ${y+58})`}><Lines text={c.a} x={x+w/2} y={y+58} size={3.5} max={43} gap={4.3}/></g>}
    </g>
  })
}
function Labels({ page }) {
  const cols=page.kind==='letters'||page.kind==='tokens'?4:3
  const rows=Math.ceil(page.cards.length/cols),w=192/cols,h=Math.min(62,220/rows)
  return page.cards.map((label,n)=>{
    const x=4+(n%cols)*w,y=36+Math.floor(n/cols)*h
    return <g key={n}><CutBox x={x} y={y} w={w-3} h={h-3}/>
      {page.kind==='tokens'?<><circle cx={x+(w-3)/2} cy={y+(h-3)/2} r="13" fill="#fff5c9" stroke="#334155" strokeDasharray="2 1"/><T x={x+(w-3)/2} y={y+(h-3)/2+3} size={9} weight={800}>{label}</T></>
        :<Lines text={label} x={x+(w-3)/2} y={y+(h-3)/2+3} size={page.kind==='letters'?14:6} weight={800} max={15}/>}</g>
  })
}
function MemoryCards({ cards }) {
  return cards.map((item,n)=>{const x=4+(n%4)*48,y=36+Math.floor(n/4)*55;return <g key={n}><CutBox x={x} y={y} w={45} h={51}/><Icon id={item.id} x={x+22.5} y={y+24} scale={.8}/><T x={x+22.5} y={y+45} size={4}>{item.label}</T></g>})
}
function MissingCards({ page }) {
  return [false,true].map((missing,n)=><g key={n}>
    <CutBox x={4} y={36+n*111} w={192} h={104}/>
    <T x={100} y={46+n*111} size={5} weight={800}>{missing?'איזה פריט נעלם?':'מתבוננים וזוכרים'}</T>
    {page.cards.map((item,i)=>(missing&&item.id===page.missing.id)?null:<g key={item.id}><Icon id={item.id} x={36+(i%3)*64} y={65+n*111+Math.floor(i/3)*34} scale={.65}/><T x={36+(i%3)*64} y={82+n*111+Math.floor(i/3)*34} size={3.5}>{item.label}</T></g>)}
    {missing&&<g transform="rotate(180 100 244)"><T x={100} y={244} size={3.5}>התשובה: {page.missing.label}</T></g>}
  </g>)
}
export function ShabbatActivitySvg({ page }) {
  return <Sheet label={page.title}>
    <T x={100} y={14} size={7} weight={800}>{page.title}</T>
    <Lines text={page.subtitle} x={100} y={23} size={3.4} max={75} gap={4}/>
    {page.kind==='cards'?<QuestionCards cards={page.cards}/>:page.kind==='memory'?<MemoryCards cards={page.cards}/>:page.kind==='missing'?<MissingCards page={page}/>:<Labels page={page}/>}
    <T x={100} y={268} size={3.2}>מכינים הכול לפני שבת · בשבת מדברים ומשחקים ללא מסך</T>
  </Sheet>
}
export const shabbatPrintablePages = pages => pages.map(page=>({key:page.key,svg:<ShabbatActivitySvg page={page}/>}))
export function ShabbatActivitySheets({ pages }) {
  return pages.map(page=><article className="buga-a4" key={page.key}><div className="print-art"><ShabbatActivitySvg page={page}/></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>)
}

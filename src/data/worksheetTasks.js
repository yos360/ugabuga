export function shuffled(values, seed=0) {
  const result=[...values]; let s=(seed+19)>>>0
  for(let i=result.length-1;i>0;i--){s=(Math.imul(s,1664525)+1013904223)>>>0;const j=s%(i+1);[result[i],result[j]]=[result[j],result[i]]}
  return result
}
export function missingRows(items, age, version) {
  const length=age==='3–4'?2:age==='5–6'?3:4
  return Array.from({length:age==='3–4'?4:6},(_,i)=>{
    const rule=Array.from({length},(_,j)=>items[(i+j)%items.length])
    const sequence=[...rule,...rule,...rule]
    const missing=length+(version+i)%length
    return {sequence,missing,answer:sequence[missing]}
  })
}
export function orderCards(age,version) {
  const count=age==='3–4'?4:age==='5–6'?6:8
  const start=age==='7–8'?2+version%4:1, step=age==='7–8'?2:1
  const ordered=Array.from({length:count},(_,i)=>start+i*step)
  let cards=shuffled(ordered,version)
  // Switching age must change the top of the page: the first card differs from the younger sheet's.
  const younger=AGE_ORDER.slice(0,Math.max(0,AGE_ORDER.indexOf(age))).map(a=>orderCards(a,version).cards[0])
  for(let i=0;i<count&&(cards.every((n,k)=>n===ordered[k])||younger.includes(cards[0]));i++)cards=[...cards.slice(1),cards[0]]
  return {cards,ordered,step}
}

const AGE_ORDER=['3–4','5–6','7–8']
const AGE_SIZE={'3–4':4,'5–6':6,'7–8':8}
// Picks a sheet's items by age: `difficulty` ranks them (e.g. word length), younger ages get the easier
// part of the list, and the FIRST row is always one that the younger sheet doesn't have — so switching
// age visibly changes the top of the page, with an item of that age's level.
export function ageItems(list, age, version, difficulty=()=>0) {
  const ai=Math.max(0,AGE_ORDER.indexOf(age)), size=Math.min(list.length,AGE_SIZE[AGE_ORDER[ai]]), prev=ai?Math.min(size,AGE_SIZE[AGE_ORDER[ai-1]]):0
  const ranked=list.map((x,i)=>({x,i})).sort((a,b)=>difficulty(a.x)-difficulty(b.x)||a.i-b.i).map(r=>r.x)
  const fresh=new Set(ranked.slice(prev,size))
  const out=shuffled(ranked.slice(0,size),version)
  const first=out.findIndex(x=>fresh.has(x))
  if(first>0)[out[0],out[first]]=[out[first],out[0]]
  return out
}
export function searchObjects(items,age,version){
  const targets=items.slice(0,age==='3–4'?2:age==='5–6'?3:4)
  const count=age==='3–4'?16:age==='5–6'?30:48
  const objects=shuffled(Array.from({length:count},(_,i)=>items[i%items.length]),version+11)
  return {objects,targets,answers:targets.map(target=>objects.filter(x=>x===target).length)}
}

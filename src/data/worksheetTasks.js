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
  if(cards.every((n,i)=>n===ordered[i]))cards=[...cards.slice(1),cards[0]]
  return {cards,ordered,step}
}
export function searchObjects(items,age,version){
  const targets=items.slice(0,age==='3–4'?2:age==='5–6'?3:4)
  const count=age==='3–4'?16:age==='5–6'?30:48
  const objects=shuffled(Array.from({length:count},(_,i)=>items[i%items.length]),version+11)
  return {objects,targets,answers:targets.map(target=>objects.filter(x=>x===target).length)}
}

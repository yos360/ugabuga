const PALETTE=[['#ee737a','אדום'],['#f1c75b','צהוב'],['#6eb5dc','כחול'],['#8cbf83','ירוק']]
export default function NumberColorSheet({age,version}){
  const size=age==='3–4'?4:age==='5–6'?6:8, colors=age==='3–4'?2:age==='5–6'?3:4
  const cell=400/size
  return <svg viewBox="0 0 480 550" role="img" aria-label={`פסיפס לצביעה: ${size} על ${size} משבצות, ${colors} צבעים`}>
    <rect width="480" height="550" fill="white"/>
    {Array.from({length:size*size},(_,i)=>{
      const row=Math.floor(i/size),col=i%size
      const value=version%3===0?(row+col+version)%colors:version%3===1?(Math.min(row,size-1-row)+Math.min(col,size-1-col)+version)%colors:(Math.floor(row/2)+col+version)%colors
      return <g key={i}><rect x={40+col*cell} y={20+row*cell} width={cell} height={cell} fill="white" stroke="#333"/><text x={40+(col+.5)*cell} y={20+(row+.58)*cell} textAnchor="middle" fontSize={size===8?19:25} fill="#555">{value+1}</text></g>
    })}
    {PALETTE.slice(0,colors).map(([color,label],i)=><g key={label}><rect x={55+i*100} y="450" width="45" height="35" rx="5" fill={color} stroke="#222"/><text x={77+i*100} y="475" textAnchor="middle" fontSize="22" fill="#111">{i+1}</text><text x={77+i*100} y="515" textAnchor="middle" fontSize="18" fill="#111">{label}</text></g>)}
  </svg>
}

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'

// Only anonymous, allow-listed activity. Never send names or worksheet contents.
const LABELS={mandalas:'מנדלות',coloring:'דף צביעה','hebrew-letters':'תרגול אותיות','photo-props':'אביזר צילום',mazes:'מבוך',sudoku:'סודוקו','birthday-signs':'שלט יום הולדת','abc-letters':'תרגול אותיות באנגלית',numbers:'תרגול מספרים',certificates:'תעודה',symmetry:'ציור סימטרי','name-tags':'תגי שם','thank-you':'כרטיס תודה','board-game':'לוח משחק'}
export function recordPrintPreview(){
  const slug=window.location.pathname.split('/').filter(Boolean).at(-1)
  if(!LABELS[slug]||import.meta.env.VITE_PUBLIC_ACTIVITY_ENABLED!=='true')return
  const key='buga-activity-'+slug
  try{if(Date.now()-Number(sessionStorage.getItem(key)||0)<300000)return;sessionStorage.setItem(key,String(Date.now()))}catch{return}
  void supabase.rpc('record_print_activity',{activity_category:slug}).then(()=>{},()=>{})
}

export default function RecentActivity(){
  const [event,setEvent]=useState(null)
  useEffect(()=>{
    if(import.meta.env.VITE_PUBLIC_ACTIVITY_ENABLED!=='true')return
    let cancelled=false
    async function refresh(){if(document.hidden)return;try{
      const {data,error}=await supabase.from('public_print_activity').select('category,created_at').gte('created_at',new Date(Date.now()-3600000).toISOString()).order('created_at',{ascending:false}).limit(1)
      if(!cancelled)setEvent(!error&&LABELS[data?.[0]?.category]?data[0]:null)
    }catch{if(!cancelled)setEvent(null)}}
    refresh();const timer=setInterval(refresh,60000)
    return()=>{cancelled=true;clearInterval(timer)}
  },[])
  if(!event)return null
  const minutes=Math.max(1,Math.floor((Date.now()-Date.parse(event.created_at))/60000))
  return <aside className="no-print" aria-label="פעילות אחרונה באתר" style={{padding:'6px 16px',textAlign:'center',fontSize:13,background:'#f0faf5',color:'#23563c',borderBottom:'1px solid #dcebe2'}} dir="rtl">🖨️ מישהו פתח {LABELS[event.category]} להדפסה · לפני {minutes===1?'פחות משתי דקות':`${minutes} דקות`}</aside>
}

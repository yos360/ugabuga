import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import CreativeArt from '../../components/ui/CreativeArt'
import { CREATIVE_CATEGORIES, CREATIVE_PAGES } from '../../data/creativePages'

export default function MandalaStudio(){
  const [mode,setMode]=useState('kids'),[selected,setSelected]=useState(null),[name,setName]=useState('')
  const pages=CREATIVE_PAGES.filter(page=>page.category===mode)
  const current=CREATIVE_CATEGORIES.find(item=>item[0]===mode)
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="מנדלות ודפי יצירה להדפסה" description="70 דפי יצירה: מנדלות לילדים ולגדולים, זנטנגל, סימטריה, קליידוסקופ, שם אישי וצביעת פיקסלים. כל איור בדף A4 נפרד." path="/printables/mandalas"/>
    <Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'דפים להדפסה',href:'/printables'},{label:'מנדלות ויצירה'}]}/>
    <header className="text-center"><h1 className="text-4xl font-black sm:text-5xl">🌈 סטודיו מנדלות ויצירה</h1><p className="mt-3 text-lg">70 דפים לבחירה — 10 בכל סגנון. פותחים איור שלם ומדפיסים על A4.</p></header>
    <nav aria-label="סוג דפי היצירה" className="my-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{CREATIVE_CATEGORIES.map(([id,emoji,title])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)} className={`min-h-[80px] rounded-2xl border-2 p-3 font-bold ${mode===id?'border-pink-500 bg-pink-100':'border-slate-200 bg-white'}`}><span aria-hidden="true">{emoji} </span>{title}<small className="block">10 דפים</small></button>)}</nav>
    {mode==='name'&&<label className="mx-auto mb-6 block max-w-sm text-center font-bold">השם שיופיע במנדלה<input maxLength={20} value={name} onChange={event=>setName(event.target.value)} placeholder="למשל: נועה" className="mt-2 w-full rounded-xl border-2 p-3"/></label>}
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">{current[2]}</h2><button onClick={()=>setSelected(pages)} className="min-h-[44px] rounded-xl bg-purple-700 px-5 py-3 font-bold text-white">🖨️ הדפיסו את כל 10 הדפים</button></div>
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{pages.map(page=><button key={page.id} onClick={()=>setSelected([page])} className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center shadow-[0_5px_0_#d9ddea] focus-visible:outline-4 focus-visible:outline-cyan-500"><div className="creative-thumbnail"><CreativeArt page={page} name={name} reference/></div><strong className="mt-3 block">{page.title}</strong><small className="block text-slate-600">גיל מומלץ {page.age} · פתיחה והדפסה</small></button>)}</section>
    {selected&&<PrintPreview title={selected.length===1?selected[0].title:current[2]} onClose={()=>setSelected(null)}>{selected.map(page=><article className="buga-a4" key={page.id}><h2>{page.title}</h2>{page.category==='symmetry'&&<p className="art-caption">השלימו את החצי החסר כמו במראה</p>}{page.category==='pixel'&&<p className="art-caption">צבעו כל משבצת לפי המספר והמקרא</p>}<div className="print-art"><CreativeArt page={page} name={name}/></div><footer>עוגה בוגה · ugabuga.co.il · יצירה והדפסה</footer></article>)}</PrintPreview>}
    <style>{`.creative-thumbnail{aspect-ratio:210/297;display:flex;align-items:center;justify-content:center;background:#fff;overflow:hidden}.creative-thumbnail img,.creative-thumbnail svg{display:block;width:100%;height:100%;object-fit:contain}`}</style>
  </div>
}

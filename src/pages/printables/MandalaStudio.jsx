import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import CreativeArt from '../../components/ui/CreativeArt'
import { CREATIVE_CATEGORIES, CREATIVE_PAGES } from '../../data/creativePages'
import { COLORING_SUBJECTS, coloringSrc } from '../../data/coloringSubjects'
const DRAWN = COLORING_SUBJECTS.filter(s => s.slug.startsWith('mandala-'))
const FAQ = [
  { q: 'איזו מנדלה מתאימה לילדים קטנים?', a: 'לגיל 4–7 כדאי לבחור מנדלה עם שטחים גדולים וקווים עבים — למשל המנדלות של לבבות, פרפרים או דינוזאורים בעמוד מנדלות לילדים. מגיל 9 בערך אפשר לעבור למנדלות מפורטות יותר.' },
  { q: 'יש גם מנדלות למבוגרים?', a: 'כן. בעמוד מנדלות למבוגרים יש מנדלות מפורטות בקווים דקים — עץ החיים, לוטוס, נוצות ועוד — שמתאימות לטושים דקים ולצבעי עיפרון מחודדים.' },
  { q: 'כמה עולה להדפיס?', a: 'כלום. כל המנדלות ודפי היצירה חינמיים, בלי הרשמה. כל איור נפתח על דף A4 משלו, ואפשר להדפיס את כל עשרת הדפים של סגנון בלחיצה אחת.' },
]

export default function MandalaStudio(){
  const [mode,setMode]=useState('kids'),[selected,setSelected]=useState(null),[name,setName]=useState('')
  const pages=CREATIVE_PAGES.filter(page=>page.category===mode)
  const current=CREATIVE_CATEGORIES.find(item=>item[0]===mode)
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="מנדלות לצביעה — מנדלות ודפי יצירה להדפסה בחינם" description="מנדלות לצביעה להדפסה בחינם: מנדלות לילדים ולמבוגרים, מנדלות חיות, זנטנגל, סימטריה, קליידוסקופ ומנדלה עם שם אישי. כל איור על דף A4 נפרד." path="/printables/mandalas" structuredData={faqSchema(FAQ)}/>
    <Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'דפים להדפסה',href:'/printables'},{label:'מנדלות לצביעה'}]}/>
    <header className="text-center"><h1 className="text-4xl font-black sm:text-5xl">🌈 מנדלות לצביעה ודפי יצירה</h1><p className="mt-3 text-lg">מנדלות לצביעה לילדים ולמבוגרים, ועוד 70 דפי יצירה — 10 בכל סגנון. פותחים איור שלם ומדפיסים על A4, בחינם.</p></header>
    <section aria-label="מנדלות מצוירות" className="no-print mt-6 grid grid-cols-3 gap-3">{DRAWN.map(m=><Link key={m.slug} to={`/printables/coloring/${m.slug}`} className="rounded-2xl border-2 border-slate-200 bg-white p-2 text-center hover:border-purple-400"><img src={coloringSrc(m.slug,1,'webp')} alt={m.h1} loading="lazy" width="267" height="400" className="mx-auto h-32 object-contain sm:h-44"/><b className="mt-1 block">{m.emoji} {m.name}</b><small className="text-slate-500">{m.items.length} מנדלות מצוירות</small></Link>)}</section>
    <nav aria-label="סוג דפי היצירה" className="my-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">{CREATIVE_CATEGORIES.map(([id,emoji,title])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)} className={`min-h-[80px] rounded-2xl border-2 p-3 font-bold ${mode===id?'border-pink-500 bg-pink-100':'border-slate-200 bg-white'}`}><span aria-hidden="true">{emoji} </span>{title}<small className="block">10 דפים</small></button>)}</nav>
    {mode==='name'&&<label className="mx-auto mb-6 block max-w-sm text-center font-bold">השם שיופיע במנדלה<input maxLength={20} value={name} onChange={event=>setName(event.target.value)} placeholder="למשל: נועה" className="mt-2 w-full rounded-xl border-2 p-3"/></label>}
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">{current[2]}</h2><button data-print-main onClick={()=>setSelected(pages)} className="min-h-[44px] rounded-xl bg-purple-700 px-5 py-3 font-bold text-white">🖨️ הדפיסו את כל 10 הדפים</button></div>
    <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{pages.map((page,index)=><button key={page.id} onClick={()=>setSelected([page])} className="group rounded-2xl border-2 border-slate-200 bg-white p-3 text-center shadow-[0_5px_0_#d9ddea] transition hover:-translate-y-1 hover:border-purple-400 focus-visible:outline-4 focus-visible:outline-cyan-500"><div className="creative-thumbnail relative"><CreativeArt page={page} name={name} reference/><span className="absolute bottom-2 left-2 rounded-full bg-slate-900/85 px-2 py-1 text-xs font-bold text-white">{index+1}/10</span></div><strong className="mt-3 block text-lg">{page.title}</strong><small className="block text-slate-600">גיל מומלץ {page.age}</small><span className="mt-2 inline-block font-bold text-purple-700">פתיחת איור מלא והדפסה ←</span></button>)}</section>
    {selected&&<PrintPreview title={selected.length===1?selected[0].title:current[2]} onClose={()=>setSelected(null)}>{selected.map(page=><article className="buga-a4" key={page.id}><h2>{page.title}</h2>{page.category==='symmetry'&&<p className="art-caption">השלימו את החצי החסר כמו במראה</p>}{page.category==='pixel'&&<p className="art-caption">צבעו כל משבצת לפי המספר והמקרא</p>}<div className="print-art"><CreativeArt page={page} name={name}/></div><footer>עוגה בוגה · ugabuga.co.il · יצירה והדפסה</footer></article>)}</PrintPreview>}
    <div className="no-print mx-auto mt-10"><SeoBody paragraphs={['מנדלה היא ציור עגול שחוזר על עצמו סביב מרכז, ולכן צביעה שלה מרגיעה ומרכזת: צובעים טבעת אחרי טבעת, בוחרים צבע לכל דוגמה וחוזרים עליה. בעמוד הזה יש מנדלות לצביעה בכמה רמות — מפשוטות לגן ועד מפורטות למבוגרים — לצד דפי יצירה אחרים: זנטנגל, ציור סימטרי, קליידוסקופ וצביעת פיקסלים.']} faq={FAQ} related={[{ label: 'מנדלות לילדים', href: '/printables/coloring/mandala-kids' }, { label: 'מנדלות למבוגרים', href: '/printables/coloring/mandala-adults' }, { label: 'מנדלות חיות', href: '/printables/coloring/mandala-animals' }, { label: 'כל דפי הצביעה', href: '/printables/coloring' }]}/></div>
    <style>{`.creative-thumbnail{aspect-ratio:210/297;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#fff,#faf8ff);overflow:hidden;border-radius:12px}.creative-thumbnail img,.creative-thumbnail svg{display:block;width:100%;height:100%;object-fit:contain}.creative-line-art{filter:contrast(1.08);background:#fff}@media print{.creative-line-art{filter:none}}`}</style>
  </div>
}

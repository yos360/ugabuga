import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

const PACKS = [
  ['birthday','🎂','יום הולדת צבעוני','#ffe1ec',['👑 כתר יום הולדת','🎂 עוגת ענק','🎈 בלון לב','🥳 כובע מסיבה','🎁 מתנה נוצצת','🍭 סוכרייה','🕶️ משקפי מסיבה','🎀 פפיון','🎉 חגיגה!','⭐ כוכב היום','💖 לב גדול','🎊 קונפטי']],
  ['funny','🤪','מצחיקים ומוגזמים','#e5dcff',['🥸 שפם ענק','🤓 משקפיים מצחיקים','👄 שפתיים אדומות','👃 אף ליצן','😮 פה מופתע','👂 אוזניים גדולות','🎭 מסכה','🧠 מוח גאוני','💬 וואו!','😂 חחח','😎 הכי קול','🤩 איזה כיף']],
  ['fantasy','🦄','קסם ופנטזיה','#dff8f3',['🦄 חד-קרן','🧚 כנפיים','✨ שרביט קסמים','🌈 קשת','🐉 דרקון קטן','🧜 זנב בת ים','🔮 כדור בדולח','🌟 כוכב קסם','👑 כתר מלכותי','🪄 אברקדברה','💜 לב סגול','☁️ ענן חלום']],
  ['adventure','🚀','חלל והרפתקה','#dceeff',['🚀 טיל','👨‍🚀 קסדת חלל','🪐 שבתאי','👽 חייזר ידידותי','⭐ כוכב','🌙 ירח','🗺️ מפת אוצר','🏴‍☠️ דגל פיראטים','🔭 טלסקופ','💎 יהלום','🦖 דינוזאור','🔥 אמיץ/ה']],
  ['school','🏆','כיתה וסיום שנה','#fff1be',['🏆 אלוף/ה','📚 קורא/ת-על','✏️ כותב/ת','🧠 חכם/ה','🎓 סיום שנה','🫶 צוות מנצח','🌟 הצטיינות','🖍️ יוצר/ת','🎯 מטרה','🔢 אלוף/ת החשבון','🦸 גיבור/ת הכיתה','👏 כל הכבוד!']],
]
function parts(text){const i=text.indexOf(' ');return i>0?[text.slice(0,i),text.slice(i+1)]:['✨',text]}

export default function PhotoProps(){
  const [id,setId]=useState('birthday'),[eventName,setEventName]=useState(''),[printMode,setPrintMode]=useState('color'),[selected,setSelected]=useState(null)
  const pack=useMemo(()=>PACKS.find(x=>x[0]===id),[id]);const [,,title,,props]=pack
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="אביזרי צילום גדולים להדפסה" description="אביזרי צילום להדפסה ליום הולדת: שפמים, משקפיים, כתרים ובלוני דיבור — כל אביזר בדף A4 נפרד, בצבע או בשחור-לבן. חינם." path="/printables/photo-props"/>
    <Breadcrumbs items={[{label:'ראשי',href:'/'},{label:'דפים להדפסה',href:'/printables'},{label:'אביזרי צילום'}]}/>
    <h1 className="text-center text-4xl">📸 אביזרי צילום להדפסה</h1>
    <p className="my-3 text-center text-lg">כל תמונה גדולה על דף A4 משלה. בחרו פריט אחד או הדפיסו חבילה של 12 דפים.</p>
    <nav className="my-6 flex flex-wrap justify-center gap-3">{PACKS.map(x=><button key={x[0]} aria-pressed={id===x[0]} onClick={()=>setId(x[0])} className={`rounded-xl border-2 px-4 py-3 font-bold ${id===x[0]?'border-purple-600 bg-purple-100':'bg-white'}`}>{x[1]} {x[2]}</button>)}</nav>
    <div className="my-5 flex flex-wrap justify-center gap-3">{[['color','🌈 צבעוני'],['bw','⚫ שחור־לבן']].map(([value,label])=><button key={value} aria-pressed={printMode===value} onClick={()=>setPrintMode(value)} className={`rounded-xl border-2 px-5 py-3 font-bold ${printMode===value?'border-black bg-yellow-100':'bg-white'}`}>{label}{printMode===value?' ✓':''}</button>)}</div>
    <label className="mx-auto block max-w-md text-center">כותרת אישית (לא חובה)<input maxLength={60} value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="למשל: יום ההולדת של נועה" className="mt-2 w-full rounded-xl border-2 p-3"/></label>
    <div className="my-5 text-center"><button onClick={()=>setSelected(props)} className="rounded-xl bg-pink-600 px-6 py-3 font-bold text-white">🖨️ הדפיסו חבילה — 12 דפי A4</button></div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{props.map(value=>{const [emoji,label]=parts(value);return <button key={value} onClick={()=>setSelected([value])} className="rounded-2xl border-2 bg-white p-4"><span aria-hidden="true" style={{filter:printMode==='bw'?'grayscale(1)':'none'}} className="block text-7xl">{emoji}</span><strong className="my-3 block">{label}</strong><span className="text-sm">פתיחה והדפסת פריט בודד</span></button>})}</div>
    {selected&&<PrintPreview title={selected.length===1?parts(selected[0])[1]:title} onClose={()=>setSelected(null)}>{selected.map(value=>{const [emoji,label]=parts(value);return <article className="buga-a4" key={value}>{eventName&&<h2>{eventName}</h2>}<div className="print-art"><svg viewBox="0 0 600 750" role="img" aria-label={label} style={{filter:printMode==='bw'?'grayscale(1)':'none'}}><rect x="12" y="12" width="576" height="726" rx="45" fill="white" stroke="#222" strokeWidth="2" strokeDasharray="8 8"/><text x="300" y="480" textAnchor="middle" fontSize="380" fontFamily="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">{emoji}</text><text x="300" y="610" textAnchor="middle" fontSize="30" fill="#111" fontFamily="Heebo, Arial">{label}</text><text x="300" y="670" textAnchor="middle" fontSize="18" fill="#333">גזרו מסביב למסגרת והדביקו למקל</text></svg></div><footer>עוגה בוגה · ugabuga.co.il</footer></article>})}</PrintPreview>}
  </div>
}

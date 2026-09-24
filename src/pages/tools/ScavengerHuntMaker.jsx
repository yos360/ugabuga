import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'

const scavengerFaq = [
  { q: 'כמה ילדים אפשר לשלב בציד אוצרות אחד?', a: 'עדיף לחלק לקבוצות קטנות של 2-4 ילדים לכל מסלול, כדי שכולם יהיו מעורבים בפתרון ולא רק ילד אחד שרץ קדימה.' },
  { q: 'כמה זמן לוקח להכין ציד אוצרות עם הכלי?', a: 'כמה דקות בלבד להזנת הפרטים, אבל כדאי להוסיף עוד כמה דקות לבדיקה עצמית של המסלול לפני האירוע.' },
]
const scavengerBody = [
  'ציד אוצרות הוא אחת הפעילויות שהכי קשה להכין לבד — צריך לחשוב על רמזים, לוודא שהם לא קלים מדי ולא קשים מדי. הכלי הזה עושה בדיוק את זה: בונה מסלול מוכן להדפסה, מותאם למקום ולגיל.',
  'היתרון הגדול הוא שהוא ממלא זמן ארוך יחסית (20-40 דקות) בלי שהמבוגר צריך להיות מעורב כל הזמן. זה הופך אותו לפעילות מצוינת ליום הולדת בבית.',
  'טיפ מעשי לפני שמתחילים: תעברו על כל הרמזים פעם אחת בעצמכם, בדיוק באותו מסלול שהילדים ילכו בו.',
]
const scavengerRelated = [ { label: 'חדרי בריחה להדפסה', href: '/tools/escape-rooms' }, { label: 'יום הולדת בבית', href: '/ideas/at-home' }, { label: 'מתחם יוצרים', href: '/create' } ]

const PACKS = {
  home: ['משהו אדום','משהו רך','משהו עגול','ספר','כפית','גרב','משהו שמתחיל באות מ','דבר שאתה אוהב'],
  outdoor: ['עלה ירוק','אבן','פרח','משהו צהוב','ענף','נמלה','משהו עגול','עשב'],
}

export default function ScavengerHuntMaker() {
  const [mode, setMode] = useState('home')
  const [title, setTitle] = useState('')
  const [items, setItems] = useState(Array(10).fill(''))
  const [list, setList] = useState(null)
  const [printing, setPrinting] = useState(false)

  const update = (i,v) => setItems(x => x.map((y,j)=>j===i?v:y))
  const addField = () => setItems(x => [...x,''])
  const validItems = items.map(x=>x.trim()).filter(Boolean)

  const generate = () => setList(mode === 'custom' ? validItems : PACKS[mode])

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="יוצר ציד אוצרות להדפסה" description="יוצר ציד אוצרות: בונים רשימת משימות ורמזים מוכנה להדפסה — לבית, לחצר, לגן ולכיתה. בוחרים רשימה מוכנה או כותבים בעצמכם, חינם." path="/tools/scavenger-hunt-maker" structuredData={faqSchema(scavengerFaq)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'ציד אוצרות' }]} />
      <h1 className="text-4xl text-center mb-6">🔎 יוצר ציד אוצרות</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[['home','🏠 בבית'],['outdoor','🌳 בחוץ'],['custom','✏️ מותאם אישית']].map(([k,l]) => (
          <button key={k} onClick={()=>{setMode(k);setList(null)}} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${mode===k?'bg-[var(--postit)]':'bg-white'}`}>{l}</button>
        ))}
      </div>

      {mode === 'custom' && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-4 mb-6">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="שם הצייד (אופציונלי)" className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 mb-3" />
          {items.map((v,i) => <input key={i} value={v} onChange={e=>update(i,e.target.value)} placeholder={`פריט ${i+1}...`} className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-3 py-2 mb-2" />)}
          <button onClick={addField} className="wobbly-sm sketch-press border-2 border-dashed border-[var(--border)] px-3 py-1 text-sm cursor-pointer">+ הוסיפו פריט</button>
        </div>
      )}

      <div className="text-center mb-6">
        <button disabled={mode==='custom'&&validItems.length===0} onClick={generate} className="wobbly-md sketch-press min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer px-8 disabled:opacity-50">צרו רשימה!</button>
      </div>

      {list && (
        <div className="wobbly border-2 border-[var(--border)] bg-white p-6 sketch-shadow buga-fade-in">
          <h3 className="text-center font-display text-xl font-bold mb-4">ציד האוצרות של {title || '___'}</h3>
          {list.map((item,i) => (
            <label key={i} className="flex items-center gap-2 mb-2 font-hand text-lg">
              <input type="checkbox" className="w-5 h-5" />{i+1}. {item}
            </label>
          ))}
        </div>
      )}
      {list && <div className="text-center mt-4"><button onClick={()=>setPrinting(true)} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-6 py-3 font-display font-bold cursor-pointer">🖨️ הדפיסו</button></div>}
      {printing&&list&&<PrintPreview title="ציד אוצרות" onClose={()=>setPrinting(false)}><article className="buga-flow"><h2 className="text-center text-3xl">{title||'ציד האוצרות שלי'}</h2><p className="my-4">שם: ____________________</p><p>מחפשים בהשגחת מבוגר, בלי לקטוף צמחים או לפגוע בבעלי חיים.</p>{list.map((item,i)=><p key={i} style={{padding:'12px 0',borderBottom:'1px solid #aaa',whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>□ {i+1}. {item}</p>)}<footer>עוגה בוגה · ugabuga.co.il</footer></article></PrintPreview>}

      <div className="mt-12">
        <SeoBody paragraphs={scavengerBody} faq={scavengerFaq} related={scavengerRelated} />
      </div>
    </div>
  )
}

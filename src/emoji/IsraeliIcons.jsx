import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmojiFrame } from './EmojiPages'
import SeoBody from '../components/ui/SeoBody'
import PrintPreview from '../components/ui/PrintPreview'
import { Sheet, T } from '../components/printables/PrintableShell'
import { ISRAELI_ICONS } from './israeliIconData'
import { iconBlob, downloadIcon, canShareIcons } from './iconExport'
import './emoji.css'

export const ICON_GROUPS = [['hanukkah','חנוכה'],['shabbat','שבת'],['tradition','מסורת'],['rosh-hashanah','ראש השנה'],['sukkot','סוכות'],['purim','פורים'],['pesach','פסח'],['shavuot','שבועות'],['lag-baomer','ל״ג בעומר'],['independence','יום העצמאות'],['food','אוכל ישראלי'],['summer','קיץ וים'],['nature','טבע'],['everyday','יום־יום']]
function IconCard({icon,outline=false}) {
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[shareFile,setShareFile]=useState(null)
  const [shareSupported,setShareSupported]=useState(false)
  useEffect(()=>setShareSupported(canShareIcons()),[])
  const src=outline?icon.outline:icon.src, filename=icon.slug+(outline?'-outline':'')
  async function save(type) {
    setBusy(true);setMessage('')
    try { const blob=await iconBlob(src,type);downloadIcon(blob,filename+(type==='image/png'?'.png':'.webp'));setMessage('הקובץ מוכן. בדקו את ההורדות.') } catch {setMessage('לא הצלחנו ליצור את הקובץ. נסו PNG או דפדפן מעודכן.')} finally {setBusy(false)}
  }
  async function prepareShare() {
    setBusy(true);setMessage('')
    try {const blob=await iconBlob(src);const file=new File([blob],filename+'.png',{type:'image/png'});if(!navigator.canShare?.({files:[file]}))throw new Error('unsupported');setShareFile(file);setMessage('מוכן! לחצו על שיתוף PNG.')} catch {setMessage('השיתוף אינו זמין. אפשר להוריד PNG ולצרף אותו להודעה.')} finally {setBusy(false)}
  }
  function share() {
    // A second explicit tap preserves transient activation on mobile Safari.
    navigator.share({files:[shareFile],title:icon.name}).catch(e=>{if(e.name!=='AbortError')setMessage('השיתוף לא הושלם. אפשר להוריד את הקובץ ולצרף אותו להודעה.')})
  }
  return <article className="israeli-card"><button className="israeli-art" disabled={busy} onClick={()=>save('image/png')} aria-label={`הורדת ${icon.name} כ־PNG`}><img src={src} alt={icon.name} width="160" height="160" loading="lazy" /></button><h3>{icon.name}</h3><div className="israeli-actions"><button disabled={busy} onClick={()=>save('image/png')}>PNG</button><button disabled={busy} onClick={()=>save('image/webp')}>WebP</button>{shareSupported && <button disabled={busy} onClick={shareFile?share:prepareShare}>{shareFile?'שיתוף PNG':'הכנת שיתוף'}</button>}</div><p role="status">{busy?'מכינים את התמונה…':message}</p><small>איור מקורי · CC0</small></article>
}
export function IsraeliOccasionIcons({slug}) {
  const icons=ISRAELI_ICONS.filter(i=>i.situations.includes(slug))
  if(!icons.length)return null
  return <section><h2>אייקונים מקוריים להודעת החג</h2><p>אלו תמונות עם רקע שקוף, שאפשר להוריד ולשלוח או להפוך למדבקה.</p><div className="israeli-grid">{icons.map(icon=><IconCard key={icon.slug} icon={icon}/>)}</div><Link className="underline" to="/emoji/israeli">כל האייקונים והוראות ליצירת מדבקה בוואטסאפ</Link></section>
}
const faq=[{q:'האם אלו אימוג׳ים שאפשר להדביק כטקסט?',a:'לא. אלה איורים מקוריים להורדה כתמונה. אפשר לשלוח אותם כתמונה או ליצור מהם מדבקה בוואטסאפ.'},{q:'מותר לשנות ולהדפיס את האייקונים?',a:'כן. כל 48 האיורים וגרסאות קווי המתאר נמסרים ברישיון CC0, לשימוש, שינוי והדפסה ללא צורך במתן קרדיט.'},{q:'האם כפתור השיתוף מתקין חבילת מדבקות?',a:'לא. הוא משתף קובץ PNG דרך אפשרויות המכשיר. כדי לקבל מדבקה צריך להשתמש בכלי יצירת המדבקות של האפליקציה.'}]
function IconSheets({outline}) {
  return [0,1,2].map(page=><article className="buga-a4" key={page}><div className="print-art"><Sheet label={`אייקונים ישראליים — דף ${page+1}`}><T x={100} y={13} size={7} weight={700}>{outline?'אייקונים ישראליים לצביעה':'מדבקות ואייקונים ישראליים'}</T><T x={100} y={23} size={3.5}>דף {page+1} מתוך 3 · גוזרים לאורך המסגרת המקווקוות</T>{ISRAELI_ICONS.slice(page*16,page*16+16).map((icon,i)=>{const x=5+(3-i%4)*49,y=31+Math.floor(i/4)*53;return <g key={icon.slug}><rect x={x} y={y} width={47} height={51} rx={3} fill="none" stroke="#bbb" strokeWidth={.3} strokeDasharray="1 1"/><image href={outline?icon.outline:icon.src} x={x+5.5} y={y+2} width={36} height={36}/><T x={x+23.5} y={y+45} size={3.4}>{icon.name}</T></g>})}<T x={100} y={254} size={3}>איורים מקוריים: עוגה בוגה · CC0 · ugabuga.co.il/emoji/israeli</T></Sheet></div></article>)
}
export default function IsraeliIcons() {
  const [group,setGroup]=useState(''),[outline,setOutline]=useState(false),[print,setPrint]=useState(null)
  const shown=ISRAELI_ICONS.filter(i=>!group||i.group===group)
  return <EmojiFrame title="אייקונים ישראליים ויהודיים להורדה — 48 איורים מקוריים" description="סביבון, חלה, סוכה, פלאפל ועוד: 48 אייקונים מקוריים ברישיון CC0, להורדת PNG או WebP שקופים בגודל 512×512, למדבקות ולהדפסה." path="/emoji/israeli" faq={faq}>
    <p>לחצו על איור להורדת PNG. זהו קובץ תמונה, שאפשר להפוך למדבקה — לא תו במקלדת.</p><div className="emoji-links" role="group" aria-label="נושא האייקונים"><button aria-pressed={!group} onClick={()=>setGroup('')}>הכול (48)</button>{ICON_GROUPS.map(([id,label])=><button aria-pressed={group===id} key={id} onClick={()=>setGroup(id)}>{label}</button>)}</div>
    <label><span><input type="checkbox" checked={outline} onChange={e=>setOutline(e.target.checked)}/> קווי מתאר לצביעה</span></label><p>{shown.length} איורים · 512×512 פיקסלים · רקע שקוף</p><div className="israeli-grid">{shown.map(icon=><IconCard key={icon.slug+outline} icon={icon} outline={outline}/>)}</div>
    <section><h2>דפי מדבקות וצביעה להדפסה</h2><p>כל 48 האיורים בשלושה דפי A4, 16 בכל דף. אפשר להדפיס על נייר מדבקות או על נייר רגיל. בגזירה עם ילדים נעזרים במבוגר.</p><div className="emoji-links"><button data-print-main onClick={()=>setPrint('color')}>הדפסת כל האייקונים בצבע / PDF</button><button onClick={()=>setPrint('outline')}>הדפסת קווי מתאר לצביעה / PDF</button></div></section>
    <section><h2>איך יוצרים מדבקה בוואטסאפ?</h2><ol className="list-decimal pr-6 space-y-2"><li>מורידים כאן את האיור כ־PNG ושומרים אותו במחשב.</li><li>פותחים שיחה ב־WhatsApp Web. פותחים את אזור המדבקות ובוחרים „יצירה” או „יצירת מדבקה”. בגרסת מחשב שתומכת בכך משתמשים באותה אפשרות.</li><li>מעלים את קובץ ה־PNG, בודקים את החיתוך ולוחצים על שליחה.</li><li>אם האפשרות אינה מופיעה באפליקציית המחשב, פותחים את WhatsApp Web בדפדפן מעודכן.</li></ol><p>כדי לשלוח כתמונה: פותחים את צירוף הקבצים בשיחה, בוחרים תמונות וסרטונים, מצרפים את ה־PNG ושולחים. בטלפון תומך אפשר להכין שיתוף ואז ללחוץ „שיתוף PNG”.</p><p>שמות הכפתורים משתנים לפי שפה וגרסה. <a className="underline" href="https://faq.whatsapp.com/1056840314992666/">המדריך הרשמי של WhatsApp ליצירת מדבקות</a>.</p></section>
    <SeoBody paragraphs={['האיורים צוירו במיוחד לעוגה בוגה מצורות וקווים מקוריים, בסגנון צבעוני ואחיד. הם כוללים חגים, מסורת, אוכל, טבע ופריטים יומיומיים שאין להם תמיד אימוג׳י ייעודי במקלדת.','כל קובץ נשאר עם רקע שקוף. גרסת הצביעה מכילה שטחים לבנים וקווי מתאר כהים. ההורדה נוצרת בדפדפן שלכם, וניתן להשתמש בקבצים גם בהזמנות, במצגות ובתוויות לילדים.']} faq={faq} related={[{href:'/emoji',label:'אימוג׳י להעתקה כטקסט'},{href:'/holidays',label:'פעילויות לחגים'}]}/><p className="emoji-source">יוצר: Ugabuga / Codex · <a href="/icons/israeli/LICENSE.txt">רישיון האיורים</a> · <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a></p>
    {print && <PrintPreview title={print==='outline'?'אייקונים ישראליים לצביעה':'אייקונים ישראליים להדפסה'} onClose={()=>setPrint(null)} copies={false}><IconSheets outline={print==='outline'}/></PrintPreview>}
  </EmojiFrame>
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TravelPage } from './TravelPage'
import { localKit } from './localKit'
import { offlineState, changeOffline } from './offlineClient'

export default function TravelOffline() {
  const [pdf,setPdf] = useState(null)
  useEffect(()=>{let url;localKit('get').then(blob=>{if(blob){url=URL.createObjectURL(blob);setPdf({url,size:blob.size})}}).catch(()=>{});return()=>{if(url)URL.revokeObjectURL(url)}},[])
  const [saved,setSaved] = useState(null), [busy,setBusy] = useState(false), [error,setError] = useState(''), [online,setOnline] = useState(()=>navigator.onLine)
  useEffect(()=>{offlineState().then(setSaved);const update=()=>setOnline(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update)}},[])
  const change = async type => {setBusy(true);setError('');try {const result=await changeOffline(type);if(type==='DELETE'){await localKit('delete');if(pdf)URL.revokeObjectURL(pdf.url);setPdf(null)}setSaved(type==='SAVE'?result:null)}catch(e){setError(e.message)}finally{setBusy(false)}}
  return <TravelPage title="תיק טיסה — שומרים לפני שיוצאים" path="/travel/offline" intro="שמרו במכשיר חבילת משחקי דרך: זיכרון, פאזל, צביעה, מבוך וסודוקו לילדים. השמירה מתחילה רק בלחיצה ונשארת בדפדפן הזה." faq={[{q:'האם כל האתר יורד לטלפון?',a:'לא. נשמרים מסך תיק הטיסה, מסך המשחקים והקבצים הדרושים להם בלבד. אין צורך בחשבון.'},{q:'האם השמירה נשארת לתמיד?',a:'הדפדפן יכול לפנות אחסון, למשל כשחסר מקום. לפני היציאה פתחו שוב את התיק ובדקו אותו במצב טיסה.'}]}>
    {!online && <p role="status" className="travel-card">אין אינטרנט — הנה מה ששמרתם</p>}
    <section className="travel-card"><h2>מה בתיק?</h2><p>🧠 זיכרון · 🧩 פאזל הזזה · 🎨 צביעה במסך · 🌀 מבוכים · 🔢 סודוקו 4×4</p><p>זו חבילת המשחקים שבחרתם לשמור. התוכן אינו נשלח לאף אחד.</p><div className="travel-controls"><button disabled={busy || !online} onClick={()=>change('SAVE')}>{busy?'שומרים… השאירו את המסך פתוח':'שמרו לטיסה'}</button>{(saved || pdf) && <button disabled={busy} onClick={()=>change('DELETE')}>מחיקת התיק</button>}</div>
    {saved && <><p role="status">✓ שמור לשימוש בלי אינטרנט</p><p>נפח הקבצים: {(saved.bytes/1048576).toFixed(1)} מ״ב. נתוני משחק מקומיים עשויים לתפוס מעט מקום נוסף.</p><Link className="travel-card" to="/travel/play">✈️ פותחים את מסך הטיסה</Link></>}{error && <p role="alert">{error}</p>}</section>
    {pdf && <section className="travel-card"><h2>הערכה האחרונה שלי</h2><p>PDF שנשמר במכשיר בלבד · {(pdf.size/1048576).toFixed(1)} מ״ב</p><a href={pdf.url} download="buga-travel-kit.pdf">פתיחת הערכה בלי אינטרנט</a></section>}
    <section className="travel-card"><h2>לפני הטיסה: פתחו פעם אחת עם אינטרנט</h2><p>אחרי השמירה, הפעילו מצב טיסה ופתחו כל משחק שתרצו. אם הוא נפתח — אתם מוכנים. שמרו את הכתובת הזו בסימניות.</p><h2>איך שומרים את האתר במסך הבית?</h2><p>באייפון: פתחו ב־Safari, לחצו על שיתוף ובחרו ״הוספה למסך הבית״. באנדרואיד: פתחו ב־Chrome, לחצו על תפריט שלוש הנקודות ובחרו ״הוספה למסך הבית״. שמות האפשרויות יכולים להשתנות בין גרסאות.</p></section>
  </TravelPage>
}

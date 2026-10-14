import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { contrastOnWhite, qrPayload } from '../../utils/qrPayload'

const FAQ = [
  { q: 'האם יצירת קוד QR היא בחינם?', a: 'כן. אפשר ליצור, להוריד ולהדפיס קודים ללא הרשמה. הקוד עצמו אינו פג תוקף; קישור שבתוכו צריך להישאר פעיל.' },
  { q: 'האם התוכן נשלח לשרת?', a: 'לא. הטקסט, הטלפון וסיסמת הרשת נשארים בדפדפן ואינם נשלחים לשרת או לניתוח שימוש. כל מי שסורק את הקוד יכול לקרוא את התוכן, לכן שתפו קוד Wi-Fi רק עם מי שצריך גישה.' },
  { q: 'למה הקוד לא נסרק?', a: 'נסו צבע כהה יותר והדפסה גדולה יותר, השאירו את השוליים הלבנים, ובדקו במצלמת הטלפון. קוד שמכיל הרבה טקסט דורש גודל גדול יותר.' },
  { q: 'איך יוצרים QR לוואטסאפ?', a: 'בוחרים וואטסאפ ומזינים מספר עם קידומת מדינה ללא האפס המקומי, למשל 972501234567. אפשר להוסיף הודעה מוכנה; הסריקה לא שולחת אותה אוטומטית.' },
]
const TYPES = [['link', 'קישור'], ['text', 'טקסט'], ['whatsapp', 'וואטסאפ'], ['wifi', 'Wi-Fi'], ['phone', 'טלפון'], ['email', 'אימייל']]
const inputClass = 'mt-1 w-full rounded-xl border-2 border-[var(--border)] bg-white text-[#182139] px-3 py-2 min-h-[44px]'
const buttonClass = 'min-h-[48px] rounded-xl border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-2 font-bold disabled:opacity-40'

export default function QrCodeMaker() {
  const [type, setType] = useState('link')
  const [fields, setFields] = useState({ link: 'https://ugabuga.co.il', text: '', phone: '', message: '', ssid: '', password: '', encryption: 'WPA', email: '', subject: '' })
  const [size, setSize] = useState(512), [color, setColor] = useState('#182139')
  const [generated, setGenerated] = useState(null), [generationError, setGenerationError] = useState(null)
  const [labels, setLabels] = useState(1), [caption, setCaption] = useState(''), [printing, setPrinting] = useState(false)
  let payload = '', validationError = ''
  try { payload = qrPayload(type, fields) } catch (e) { validationError = e.message }
  const key = JSON.stringify([payload, size, color])
  const ready = generated?.key === key && !validationError
  useEffect(() => {
    let cancelled = false
    if (!payload) return
    const timeout = setTimeout(async () => {
      try {
        const options = { width: size, margin: 4, errorCorrectionLevel: 'M', color: { dark: color, light: '#ffffff' } }
        const [png, svg] = await Promise.all([QRCode.toDataURL(payload, options), QRCode.toString(payload, { ...options, type: 'svg' })])
        if (!cancelled) setGenerated({ key, png, svg })
      } catch { if (!cancelled) { setGenerated(null); setGenerationError({ key, message: 'התוכן ארוך מדי לקוד QR. קצרו את הטקסט ונסו שוב.' }) } }
    }, 150)
    return () => { cancelled = true; clearTimeout(timeout) }
  }, [payload, size, color, key])
  function field(name, label, { multiline = false, ...props } = {}) {
    const common = { value: fields[name], onChange: e => setFields(old => ({ ...old, [name]: e.target.value })), className: inputClass, maxLength: 3000, ...props }
    return <label className="block font-bold">{label}{multiline ? <textarea {...common} rows={3} /> : <input {...common} />}</label>
  }
  function download(format) {
    if (!ready) return
    const url = format === 'svg' ? URL.createObjectURL(new Blob([generated.svg], { type: 'image/svg+xml' })) : generated.png
    const a = document.createElement('a'); a.href = url; a.download = `qr-code.${format}`; a.click()
    if (format === 'svg') setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="יצירת קוד QR בחינם — מחולל QR לקישור, טקסט ווואטסאפ" description="יוצרים קוד QR לקישור, טקסט, וואטסאפ, Wi-Fi, טלפון או אימייל. תצוגה חיה, הורדת PNG ו-SVG והדפסת מדבקות. התוכן נשאר בדפדפן." path="/tools/qr-code" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'יצירת קוד QR' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-3">יצירת קוד QR בחינם — לקישור, טקסט ווואטסאפ</h1>
    <p className="text-center mb-6">🔒 יצירת הקוד מתבצעת בדפדפן. שום תוכן שהזנתם לא נשלח לשרת או לניתוח שימוש.</p>
    <div className="grid gap-6 md:grid-cols-2">
      <section className="space-y-4 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-label="תוכן הקוד">
        <label className="block font-bold">סוג הקוד<select aria-label="סוג הקוד" value={type} onChange={e => setType(e.target.value)} className={inputClass}>{TYPES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label>
        {type === 'link' && field('link', 'כתובת קישור', { dir: 'ltr', inputMode: 'url' })}
        {type === 'text' && field('text', 'הטקסט שלכם', { multiline: true })}
        {['whatsapp', 'phone'].includes(type) && field('phone', type === 'whatsapp' ? 'טלפון עם קידומת מדינה (למשל 972501234567)' : 'מספר טלפון', { type: 'tel', dir: 'ltr' })}
        {['whatsapp', 'email'].includes(type) && field('message', 'הודעה (לא חובה)', { multiline: true })}
        {type === 'wifi' && <>{field('ssid', 'שם הרשת (SSID)', { autoComplete: 'off' })}<label className="block font-bold">הצפנה<select aria-label="הצפנה" value={fields.encryption} onChange={e => setFields(old => ({ ...old, encryption: e.target.value }))} className={inputClass}><option value="WPA">WPA / WPA2 / WPA3 (מצב תואם)</option><option value="WEP">WEP</option><option value="nopass">רשת פתוחה — ללא סיסמה</option></select></label>{fields.encryption !== 'nopass' && field('password', 'סיסמת הרשת', { type: 'password', autoComplete: 'new-password' })}<p className="text-sm">הקוד מכיל את פרטי הגישה. שתפו אותו רק עם אורחים מורשים; מומלץ לבדוק סריקה במכשיר שבו תשתמשו.</p></>}
        {type === 'email' && <>{field('email', 'כתובת אימייל', { type: 'email', dir: 'ltr' })}{field('subject', 'נושא (לא חובה)')}</>}
        <div className="grid grid-cols-2 gap-3"><label className="font-bold">גודל PNG<select aria-label="גודל PNG" value={size} onChange={e => setSize(Number(e.target.value))} className={inputClass}>{[256, 512, 1024].map(n => <option key={n} value={n}>{n} פיקסלים</option>)}</select></label><label className="font-bold">צבע הקוד<input type="color" value={color} onChange={e => setColor(e.target.value)} className={inputClass} /></label></div>
        {contrastOnWhite(color) < 4.5 && <p role="alert" className="rounded-xl bg-amber-100 text-amber-950 p-3">הצבע בהיר מדי ועלול להקשות על הסריקה. בחרו צבע כהה יותר.</p>}
      </section>
      <section className="flex flex-col items-center gap-4 min-w-0" aria-label="תצוגה מקדימה והורדה">
        <div className="w-full max-w-[320px] aspect-square rounded-2xl border-2 border-[var(--border)] bg-white flex items-center justify-center p-2">
          {ready ? <img src={generated.png} alt="תצוגה מקדימה של קוד QR" className="w-full h-full object-contain" /> : <p role="status" className="p-4 text-center text-[#182139]">{validationError || (generationError?.key === key && generationError.message) || 'מכינים קוד…'}</p>}
        </div>
        <p className="text-sm text-center">סרקו במצלמה ובדקו שהקוד עובד לפני שמדפיסים.</p>
        <div className="flex flex-wrap gap-2 justify-center"><button className={buttonClass} disabled={!ready} onClick={() => download('png')}>הורדת PNG</button><button className={buttonClass} disabled={!ready} onClick={() => download('svg')}>הורדת SVG</button></div>
        <label className="w-full font-bold">פריסה להדפסה<select aria-label="פריסה להדפסה" value={labels} onChange={e => setLabels(Number(e.target.value))} className={inputClass}><option value={1}>קוד אחד גדול</option><option value={6}>6 מדבקות בדף</option><option value={12}>12 מדבקות בדף</option></select></label>
        <label className="w-full font-bold">כיתוב למדבקה (לא חובה)<input className={inputClass} value={caption} maxLength={80} onChange={e => setCaption(e.target.value)} /></label>
        <button className={`${buttonClass} w-full`} disabled={!ready} onClick={() => setPrinting(true)}>תצוגה לפני הדפסה</button>
      </section>
    </div>
    {printing && ready && <PrintPreview title="קוד QR להדפסה" onClose={() => setPrinting(false)} copies={false}><article className="buga-a4"><div style={{ display: 'grid', gridTemplateColumns: `repeat(${labels === 1 ? 1 : labels === 6 ? 2 : 3}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${labels === 1 ? 1 : labels === 6 ? 3 : 4}, minmax(0, 1fr))`, gap: '3mm', width: '100%', flex: 1, minHeight: 0 }}>{Array.from({ length: labels }, (_, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0, padding: '2mm', border: labels > 1 ? '1px dashed #ccc' : undefined }}><div style={{ flex: 1, minHeight: 0, width: '100%' }}><img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(generated.svg)}`} alt="קוד QR" /></div>{caption && <p style={{ fontSize: labels === 1 ? '20px' : '12px', lineHeight: 1.3, textAlign: 'center', overflowWrap: 'anywhere', marginTop: '2mm' }}>{caption}</p>}</div>)}</div></article></PrintPreview>}
    <div className="mt-10 no-present"><h2 className="text-2xl mb-3">רעיונות למורים ולהורים</h2><SeoBody paragraphs={[
      'מחולל QR הופך קישור או טקסט לקוד לסריקה במצלמת הטלפון. אפשר להוסיף לדף עבודה קוד שמוביל לעמוד תשובות, כך שהתלמידים יבדקו את עצמם אחרי שסיימו לפתור.',
      'על הזמנה למסיבה אפשר להדפיס QR עם קישור למיקום, ועל דלת הכיתה קישור לטופס Google Forms. בחרו כיתוב שמסביר לאן מגיעים, למשל ״כאן נרשמים לפעילות״, ובדקו מראש שהקישור פתוח לקהל המתאים.',
      'הורדת PNG מתאימה למצגות ולמסמכים, ואילו SVG שומר על חדות בכל גודל. אפשר להדפיס קוד גדול לשלט או דף של 6 או 12 מדבקות. השאירו את המסגרת הלבנה סביב הקוד כדי להקל על הסריקה.',
    ]} faq={FAQ} /></div>
  </div>
}

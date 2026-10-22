import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

// Nikud keyboard: type (or tap) Hebrew, add vowel points after any letter, copy. Everything runs in
// the browser — nothing is sent anywhere.
const MARKS = [
  { c: 'ָ', name: 'קָמָץ', sound: 'a', ex: 'שָׁלוֹם' },
  { c: 'ַ', name: 'פַּתָּח', sound: 'a', ex: 'בַּיִת' },
  { c: 'ֵ', name: 'צֵירֵה', sound: 'e', ex: 'שֵׁם' },
  { c: 'ֶ', name: 'סֶגּוֹל', sound: 'e', ex: 'יֶלֶד' },
  { c: 'ִ', name: 'חִירִיק', sound: 'i', ex: 'אִמָּא' },
  { c: 'ֹ', name: 'חוֹלָם', sound: 'o', ex: 'בֹּקֶר' },
  { c: 'ֻ', name: 'קֻבּוּץ', sound: 'u', ex: 'סֻכָּה' },
  { c: 'ְ', name: 'שְׁוָא', sound: 'שקט או e קצרה', ex: 'שְׁמֹנֶה' },
  { c: 'ֲ', name: 'חֲטַף פַּתָּח', sound: 'a', ex: 'חֲתוּל' },
  { c: 'ֱ', name: 'חֲטַף סֶגּוֹל', sound: 'e', ex: 'אֱמֶת' },
  { c: 'ֳ', name: 'חֲטַף קָמָץ', sound: 'o', ex: 'צָהֳרַיִם' },
  { c: 'ּ', name: 'דָּגֵשׁ', sound: 'ב/כ/פ קשות', ex: 'כַּדּוּר' },
  { c: 'ׁ', name: 'שִׁי״ן יְמָנִית', sound: 'sh', ex: 'שֶׁמֶשׁ' },
  { c: 'ׂ', name: 'שִׂי״ן שְׂמָאלִית', sound: 's', ex: 'שָׂדֶה' },
]
const SPECIAL = [
  { t: 'וּ', label: 'שׁוּרוּק', name: 'שׁוּרוּק', sound: 'u', ex: 'שׁוּק' },
  { t: 'וֹ', label: 'חוֹלָם מָלֵא', name: 'חוֹלָם מָלֵא', sound: 'o', ex: 'שָׁלוֹם' },
  { t: '־', label: 'מַקָּף' }, { t: '״', label: 'גֵּרְשַׁיִם' }, { t: '׳', label: 'גֵּרֵשׁ' },
]
const LETTERS = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת'
const strip = s => s.replace(/[֑-ׇ]/g, m => (m === '־' ? m : ''))

export default function NikudKeyboard() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)
  const ta = useRef(null)
  const insert = s => {
    const el = ta.current
    const a = el ? el.selectionStart : text.length, b = el ? el.selectionEnd : text.length
    const next = text.slice(0, a) + s + text.slice(b)
    setText(next); setCopied(false)
    requestAnimationFrame(() => { if (el) { el.focus(); el.setSelectionRange(a + s.length, a + s.length) } })
  }
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true) } catch { ta.current?.select() } }
  return <div className="mx-auto max-w-4xl px-4 py-8" dir="rtl">
    <SEO title="מקלדת ניקוד אונליין — מוסיפים ניקוד לטקסט ומעתיקים" description="מקלדת ניקוד בחינם: כותבים בעברית, לוחצים על סימן הניקוד (קמץ, פתח, צירה, חיריק, חולם, שורוק, שווא, דגש) ומעתיקים. כולל טבלת סימני הניקוד עם דוגמאות." path="/tools/nikud-keyboard" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מקלדת ניקוד' }]} />
    <h1 className="text-center text-4xl font-black sm:text-5xl">✍️ מקלדת ניקוד אונליין</h1>
    <p className="mx-auto mb-5 mt-2 max-w-2xl text-center text-lg text-slate-600">כותבים אות, לוחצים על סימן הניקוד — והוא נכנס מתחת לאות. בסוף מעתיקים ומדביקים בכל מקום.</p>
    <textarea ref={ta} value={text} onChange={e => { setText(e.target.value); setCopied(false) }} dir="rtl" lang="he" rows={4} placeholder="כתבו כאן, למשל: שלום" aria-label="הטקסט לניקוד" className="w-full rounded-2xl border-[3px] border-slate-800 bg-white p-4 text-4xl leading-relaxed" style={{ fontFamily: '"Noto Sans Hebrew", "Arial Hebrew", Arial, sans-serif' }} />
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      <button type="button" onClick={copy} disabled={!text} className="min-h-12 rounded-xl bg-violet-700 px-5 font-bold text-white">{copied ? '✅ הועתק' : '📋 העתקת הטקסט'}</button>
      <button type="button" onClick={() => setText(strip(text))} disabled={!text} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 font-bold">🧽 הסרת הניקוד</button>
      <button type="button" onClick={() => insert(' ')} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 font-bold">␣ רווח</button>
      <button type="button" onClick={() => { const el = ta.current; const a = el?.selectionStart ?? text.length; if (a > 0) { setText(text.slice(0, a - 1) + text.slice(a)); requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(a - 1, a - 1) }) } }} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 font-bold">⌫ מחיקה</button>
      <button type="button" onClick={() => setText('')} disabled={!text} className="min-h-12 rounded-xl border-2 border-slate-300 bg-white px-5 font-bold">ניקוי</button>
    </div>
    <h2 className="mb-2 mt-6 text-2xl font-black">סימני הניקוד</h2>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
      {MARKS.map(m => <button key={m.c} type="button" onClick={() => insert(m.c)} title={`${m.name} — ${m.sound}`} className="flex min-h-[72px] flex-col items-center justify-center rounded-xl border-2 border-slate-300 bg-white p-1 hover:border-violet-500 hover:bg-violet-50"><span className="text-4xl leading-none">{(m.c === '\u05C1' || m.c === '\u05C2' ? 'ש' : 'ב') + m.c}</span><small className="font-bold">{m.name}</small></button>)}
      {SPECIAL.map(s => <button key={s.t} type="button" onClick={() => insert(s.t)} className="flex min-h-[72px] flex-col items-center justify-center rounded-xl border-2 border-slate-300 bg-white p-1 hover:border-violet-500 hover:bg-violet-50"><span className="text-4xl leading-none">{s.t}</span><small className="font-bold">{s.label}</small></button>)}
    </div>
    <h2 className="mb-2 mt-6 text-xl font-black">אותיות (למי שאין מקלדת עברית)</h2>
    <div className="flex flex-wrap justify-center gap-1.5" dir="rtl">{[...LETTERS].map(l => <button key={l} type="button" onClick={() => insert(l)} className="h-12 w-12 rounded-lg border-2 border-slate-300 bg-white text-2xl font-bold hover:bg-amber-50">{l}</button>)}</div>
    <h2 className="mb-3 mt-10 text-2xl font-black">טבלת סימני הניקוד</h2>
    <div className="overflow-x-auto"><table className="w-full text-right text-lg"><thead><tr className="border-b-2"><th className="p-2">הסימן</th><th className="p-2">שם</th><th className="p-2">צליל</th><th className="p-2">דוגמה</th></tr></thead>
      <tbody>{[...MARKS.filter(m => m.c !== 'ׁ' && m.c !== 'ׂ'), ...SPECIAL.filter(s => s.name)].map(m => <tr key={m.name} className="border-b"><td className="p-2 text-3xl">{m.c ? (m.c === 'ּ' ? 'בּ' : 'ב' + m.c) : m.t}</td><td className="p-2 font-bold">{m.name}</td><td className="p-2" dir="ltr">{m.sound}</td><td className="p-2 text-2xl">{m.ex}</td></tr>)}</tbody></table></div>
    <div className="mt-10"><SeoBody paragraphs={['ניקוד הוא סימנים קטנים מתחת לאותיות, מעליהן ובתוכן, שמראים איך הוגים את המילה. בעברית רגילה כותבים בלי ניקוד, אבל בספרי ילדים, בשירה, בתפילה ובלימוד קריאה הניקוד עוזר לקרוא נכון. במקלדת הזאת מוסיפים כל סימן בלחיצה, בלי להתקין שום דבר.', 'איך משתמשים: כותבים אות (במקלדת של המחשב או בכפתורי האותיות), ומיד אחריה לוחצים על סימן הניקוד. אפשר להוסיף לאות אחת כמה סימנים — למשל דגש וקמץ: בָּ. בסוף לוחצים ״העתקת הטקסט״ ומדביקים בוורד, בוואטסאפ או בכל מקום אחר. כדי ללמוד לקרוא בניקוד יש באתר עמוד לימוד הניקוד לילדים.']} faq={FAQ} related={[{ label: 'לימוד ניקוד לילדים', href: '/letters/nikud' }, { label: 'אותיות בעברית', href: '/letters' }, { label: 'הכתבה אונליין', href: '/learn/dictation' }]} /></div>
    <p className="mt-6 text-center"><Link to="/letters/nikud" className="underline">לומדים לקרוא בניקוד? לעמוד לימוד הניקוד ←</Link></p>
  </div>
}
const FAQ = [
  { q: 'איך מוסיפים ניקוד לטקסט?', a: 'כותבים אות ולוחצים מיד אחריה על סימן הניקוד הרצוי. הסימן מתחבר לאות שלפניו. אפשר להוסיף כמה סימנים לאותה אות, למשל דגש וקמץ.' },
  { q: 'יש כאן ניקוד אוטומטי?', a: 'לא — כאן מנקדים ידנית, וכך שולטים בכל סימן. לניקוד אוטומטי של טקסט שלם יש באתר נקדן אוטומטי (/tools/nakdan), ואחריו אפשר לתקן כאן סימן בודד.' },
  { q: 'איך מנקדים במקלדת של המחשב בלי האתר?', a: 'בווינדוס עם מקלדת עברית אפשר להקליד ניקוד בשילוב של Caps Lock ו־Shift עם מקשי המספרים, אבל זה תלוי במקלדת ובהגדרות המחשב וקשה לזכור. כאן פשוט לוחצים על הסימן.' },
  { q: 'הניקוד יישמר כשאעתיק?', a: 'כן. הניקוד הוא חלק מהטקסט (תווים של יוניקוד), ולכן הוא נשמר בהדבקה בוורד, במייל ובוואטסאפ — כל עוד הגופן תומך בניקוד, כמו רוב הגופנים בעברית.' },
]

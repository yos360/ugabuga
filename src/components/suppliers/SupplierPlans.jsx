import { Link } from 'react-router-dom'
import { waLink, OWNER_WHATSAPP } from '../../utils/suppliersDb'

// One place for the supplier offer: free card + בוגה פרימיום (coming soon).
export const PREMIUM = { name: 'בוגה פרימיום', month: '49.90', year: '500', soon: true }
export const PREMIUM_PITCH = 'בוגה פרימיום הוא לא עוד פרסום. זה עמוד מכירה מקצועי לספקים של ימי הולדת ואירועים לילדים: עמוד שאפשר לשלוח ללקוחות, לשים באינסטגרם או בוואטסאפ, ולהציג בו את העסק בצורה ברורה, יפה ומשכנעת.'

const FREE = ['כרטיס ספק באתר', 'שם העסק, תחום ואזור', 'תמונה ולוגו', 'תיאור קצר', 'פנייה ישירה בוואטסאפ', 'הופעה לפי קטגוריה ואזור']
const PREM = ['כל מה שיש בחינם', 'עמוד ספק מעוצב, עם קישור אישי', 'גלריית תמונות מורחבת', 'חבילות, שירותים ומחירים', 'המלצות מלקוחות', 'סרטונים, אינסטגרם ולינקים', 'כפתורי וואטסאפ וטלפון בולטים', 'נראות גבוהה יותר באתר', 'מתאים לשימוש גם מחוץ לבוגה']

export const premiumWa = (name, kind = 'want') => waLink(OWNER_WHATSAPP, kind === 'example'
  ? `היי! ${name ? `אני ${name}, ` : ''}אשמח לראות דוגמה לעמוד ${PREMIUM.name} 🙂`
  : `היי! ${name ? `אני ${name} מעוגה בוגה, ` : ''}אני רוצה עמוד ${PREMIUM.name} 🙂`)

export function PremiumPrice({ className = '' }) {
  return <div className={className}>
    <p><b className="text-4xl font-black">{PREMIUM.month} ₪</b> <span className="text-slate-600">לחודש</span></p>
    <p className="mt-0.5 text-slate-700">או <b>{PREMIUM.year} ₪ לשנה</b> <span className="text-sm text-emerald-700">(כמו חודשיים במתנה)</span></p>
  </div>
}

const Tick = ({ children }) => <li className="flex gap-2"><span aria-hidden="true" className="font-black text-emerald-600">✓</span><span>{children}</span></li>

export function PlansCompare({ freeCta = true, name = '' }) {
  return <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    <div className="wobbly flex flex-col border-2 border-[var(--border)] bg-white p-6 sketch-shadow">
      <p className="text-sm font-bold text-slate-500">מסלול חינם</p>
      <h3 className="mt-1 text-3xl font-black">כרטיס ספק</h3>
      <p className="mt-2"><b className="text-4xl font-black">0 ₪</b> <span className="text-slate-600">תמיד</span></p>
      <ul className="mt-4 flex-1 space-y-1.5 text-[17px]">{FREE.map(t => <Tick key={t}>{t}</Tick>)}</ul>
      {freeCta && <Link to="/suppliers/me" className="mt-5 rounded-2xl border-2 border-[var(--ink)] bg-white px-5 py-3 text-center text-lg font-bold">פתחו כרטיס חינם ←</Link>}
    </div>
    <div className="wobbly relative flex flex-col border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow">
      {PREMIUM.soon && <span className="absolute left-4 top-4 -rotate-3 rounded-full bg-[var(--ink)] px-3 py-1 text-sm font-bold text-white">🚀 בקרוב</span>}
      <p className="text-sm font-bold text-violet-700">⭐ המסלול המקצועי</p>
      <h3 className="mt-1 text-3xl font-black">{PREMIUM.name}</h3>
      <PremiumPrice className="mt-2" />
      <ul className="mt-4 flex-1 space-y-1.5 text-[17px]">{PREM.map(t => <Tick key={t}>{t}</Tick>)}</ul>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={premiumWa(name)} target="_blank" rel="noopener" className="flex-1 whitespace-nowrap rounded-2xl bg-[var(--ink)] px-5 py-3 text-center text-lg font-bold text-white">{PREMIUM.soon ? 'שמרו לי מקום ←' : 'שדרגו לבוגה פרימיום ←'}</a>
        <a href={premiumWa(name, 'example')} target="_blank" rel="noopener" className="whitespace-nowrap rounded-2xl border-2 border-[var(--ink)] bg-white px-4 py-3 text-center font-bold">שלחו לי דוגמה</a>
      </div>
      {PREMIUM.soon && <p className="mt-2 text-sm text-slate-700">הפרימיום נפתח בקרוב. משאירים הודעה ונעדכן אתכם ראשונים.</p>}
    </div>
  </div>
}

const FAQ = [
  ['האם חייבים לשלם כדי להופיע בבוגה?', 'לא. כרטיס ספק בסיסי בבוגה הוא בחינם.'],
  ['מה ההבדל בין כרטיס חינם לפרימיום?', 'הכרטיס החינמי נותן נוכחות בסיסית באתר. בוגה פרימיום נותן עמוד ספק מקצועי ומעוצב, עם גלריה, חבילות, המלצות וקישור אישי שאפשר לשלוח ללקוחות.'],
  ['האם אתם מבטיחים פניות?', 'לא. בוגה לא מבטיחה כמות פניות. המטרה של פרימיום היא לתת לספק עמוד מכירה מקצועי ונראות טובה יותר.'],
  ['אפשר להתחיל בחינם ולשדרג אחר כך?', 'כן. פותחים כרטיס חינם ומשדרגים לפרימיום בכל שלב.'],
  ['למי מתאים פרימיום?', 'לספקים שרוצים להיראות מקצועיים יותר, לשלוח ללקוחות עמוד מסודר עם תמונות, חבילות והמלצות, ולא להסתמך רק על וואטסאפ או אינסטגרם. במיוחד למי שאין לו אתר מסודר.'],
]

export function SupplierFAQ() {
  return <div className="space-y-2">{FAQ.map(([q, a]) => <details key={q} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
    <summary className="cursor-pointer text-lg font-bold">{q}</summary>
    <p className="mt-2 leading-relaxed text-slate-700">{a}</p>
  </details>)}</div>
}

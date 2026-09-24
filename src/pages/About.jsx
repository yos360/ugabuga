import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'

const WHAT = [
  ['🎮', 'משחקים', '100+ משחקים לפי גיל, זמן, ציוד ומקום — מתחילים לשחק ישר מהטלפון.', '/games', '#fff0ee'],
  ['🖨️', 'דפים להדפסה', 'דפי צביעה, מבוכים, אותיות ושמות לכל הכיתה — שחור־לבן ומוכנים ל-A4.', '/printables', '#eef8ff'],
  ['🛠️', 'כלים למנחים', 'טיימר, גלגל שמות, חלוקה לקבוצות, בינגו, אימוג׳י סטודיו ועוד.', '/tools', '#f1f9ec'],
  ['🎂', 'מתחם יום הולדת', 'משחקים, מי מביא מה, מחשבון אוכל, הזמנות וצ׳ק־ליסט — הכל במקום אחד.', '/birthday', '#fff4bb'],
  ['🎪', 'ספקים לימי הולדת', 'מפעילים, קוסמים, עוגות וצילום — פונים ישירות בוואטסאפ, בלי תיווך.', '/suppliers', '#f5eeff'],
  ['🏫', 'לכיתה ולגן', 'משחקים ופעילויות למורות, לגננות ולצהרונים — לשיעור, להפסקה ולמסיבת סוף שנה.', '/classroom', '#e9fbf6'],
]
const WHO = [
  ['👨‍👩‍👧', 'להורים', 'מתכננים מסיבה בערב אחד: משחקים, רשימת מי מביא מה, הזמנה וספקים — בלי 15 לשוניות פתוחות.'],
  ['👩‍🏫', 'למורות ולגננות', 'משחק לשיעור ב-10 שניות, דפי עבודה מוכנים להדפסה ושמות לכל הכיתה בהדפסה אחת.'],
  ['🎩', 'לספקים', 'כרטיס ספק בחינם, עם פנייה ישירה בוואטסאפ ומדידה של כל פנייה. ובקרוב ⭐ בוגה פרימיום: עמוד ספק מקצועי שאפשר לשלוח ללקוחות.'],
]

export default function About() {
  return <div className="mx-auto max-w-5xl px-4 py-8">
    <SEO title="אודות" description="עוגה בוגה — מאגר המשחקים והפעילויות בעברית: משחקים, דפים להדפסה, כלים למנחים, מתחם יום הולדת וספקים לימי הולדת. חינם, תמיד." path="/about" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אודות' }]} />

    <header className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#fff4bb] via-[#ffe7ef] to-[#e6f0ff] px-5 py-10 text-center sm:px-10 sm:py-14">
      {['🎈', '🎂', '🎲', '🖍️', '🎉', '⭐'].map((e, i) => <span key={i} aria-hidden="true" className="absolute select-none text-3xl opacity-60 sm:text-4xl" style={{ top: `${[6, 78, 10, 80, 42, 3][i]}%`, left: `${[4, 6, 88, 86, 92, 48][i]}%`, transform: `rotate(${[-12, 10, 14, -8, 6, 0][i]}deg)` }}>{e}</span>)}
      <p className="relative inline-block rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold">🎂 עוגה בוגה · UGABUGA</p>
      <h1 className="relative mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">כל מה שצריך כדי שיהיה כיף — במקום אחד</h1>
      <p className="relative mx-auto mt-4 max-w-2xl text-lg sm:text-xl">מאגר המשחקים והפעילויות בעברית: משחקים, דפים להדפסה, כלים למנחים, מתחם יום הולדת — ועכשיו גם ספקים לימי הולדת.</p>
      <div className="relative mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/games" className="rounded-2xl bg-[var(--ink)] px-6 py-3 text-lg font-bold text-white">🎮 למשחקים</Link>
        <Link to="/suppliers" className="rounded-2xl border-2 border-[var(--ink)] bg-white px-6 py-3 text-lg font-bold">🎪 לספקים</Link>
      </div>
    </header>

    <section className="mx-auto mt-10 grid max-w-4xl grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_260px]">
      <div className="wobbly border-2 border-[var(--border)] bg-white p-6 sketch-shadow sm:p-8">
        <h2 className="font-display text-3xl font-bold">איך זה התחיל?</h2>
        <p className="mt-3 text-lg leading-relaxed">בנינו את עוגה בוגה כי נמאס לנו לחפש בגוגל „משחקים ליום הולדת” ולקבל 10 אתרים עם אותם 5 רעיונות.</p>
        <p className="mt-3 text-lg leading-relaxed">רצינו מקום אחד שבו מורה תמצא משחק ב-10 שניות, הורה יתכנן מסיבה בלי 15 אתרים, וגננת תפתח את הטלפון ותתחיל לשחק — בלי מאמר של 2,000 מילה.</p>
      </div>
      <img src="/images/home-birthday-girl.webp" alt="" className="mx-auto w-52 sm:w-full" loading="lazy" />
    </section>

    <section className="mt-12">
      <h2 className="text-center text-3xl font-black sm:text-4xl">מה יש פה?</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{WHAT.map(([emoji, title, desc, href, bg]) =>
        <Link key={href} to={href} className="group rounded-3xl border-2 border-slate-200 p-5 shadow-[0_6px_0_rgba(20,30,60,.10)] transition hover:-translate-y-1" style={{ background: bg }}>
          <span className="text-4xl">{emoji}</span>
          <h3 className="mt-2 text-2xl font-black">{title}</h3>
          <p className="mt-1 text-[17px] leading-relaxed text-slate-700">{desc}</p>
          <span className="mt-3 inline-block font-bold underline decoration-dashed">נכנסים ←</span>
        </Link>)}</div>
    </section>

    <section className="mt-12">
      <h2 className="text-center text-3xl font-black sm:text-4xl">למי זה?</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">{WHO.map(([emoji, title, desc]) =>
        <div key={title} className="rounded-3xl bg-white p-6 text-center shadow-sm"><span className="text-5xl">{emoji}</span><h3 className="mt-2 text-2xl font-black">{title}</h3><p className="mt-2 leading-relaxed text-slate-700">{desc}</p></div>)}</div>
      <p className="mt-5 text-center"><Link to="/suppliers/me" className="inline-block rounded-2xl bg-[var(--ink)] px-6 py-3 font-bold text-white">ספקים? הצטרפו בחינם ←</Link></p>
    </section>

    <section className="mt-12 rounded-[32px] bg-[var(--ink)] p-8 text-center text-white sm:p-12">
      <p className="text-lg opacity-80">כמה זה עולה?</p>
      <p className="mt-2 text-5xl font-black sm:text-7xl">חינם. הכל. תמיד.</p>
      <p className="mx-auto mt-4 max-w-xl opacity-80">כל המשחקים, הדפים והכלים פתוחים לכולם, בלי הרשמה. גם כרטיס ספק בסיסי הוא בחינם.</p>
    </section>

    <section className="mt-12 grid gap-4 sm:grid-cols-2">
      <a href="https://wa.me/972507772930" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-3xl bg-[#25D366] p-6 text-white">
        <span className="text-4xl">💬</span><span><b className="block text-xl">כתבו לנו בוואטסאפ</b><span className="opacity-90">רעיון למשחק, תיקון או ספק שרוצה להצטרף</span></span>
      </a>
      <a href="mailto:hellohugabuga@gmail.com" className="flex items-center gap-4 rounded-3xl border-2 border-slate-200 bg-white p-6">
        <span className="text-4xl">📧</span><span className="min-w-0"><b className="block text-xl">או במייל</b><span className="block truncate text-slate-600" dir="ltr">hellohugabuga@gmail.com</span></span>
      </a>
    </section>
  </div>
}

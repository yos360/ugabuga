import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const PACKS = [
  { id: 'birthday', icon: '🎂', title: 'יום הולדת צבעוני', color: '#ffe1ec', props: ['👑 כתר יום הולדת', '🎂 עוגת ענק', '🎈 בלון לב', '🥳 כובע מסיבה', '🎁 מתנה נוצצת', '🍭 סוכרייה', '🕶️ משקפי מסיבה', '🎀 פפיון', '🎉 חגיגה!', '⭐ כוכב היום', '💖 לב גדול', '🎊 קונפטי'] },
  { id: 'funny', icon: '🤪', title: 'מצחיקים ומוגזמים', color: '#e5dcff', props: ['🥸 שפם ענק', '🤓 משקפיים מצחיקים', '👄 שפתיים אדומות', '👃 אף ליצן', '😮 פה מופתע', '👂 אוזניים גדולות', '🎭 מסכה', '🧠 מוח גאוני', '💬 וואו!', '😂 חחח', '😎 הכי קול', '🤩 איזה כיף'] },
  { id: 'fantasy', icon: '🦄', title: 'קסם ופנטזיה', color: '#dff8f3', props: ['🦄 חד-קרן', '🧚 כנפיים', '✨ שרביט קסמים', '🌈 קשת', '🐉 דרקון קטן', '🧜 זנב בת ים', '🔮 כדור בדולח', '🌟 כוכב קסם', '👑 כתר מלכותי', '🪄 אברקדברה', '💜 לב סגול', '☁️ ענן חלום'] },
  { id: 'adventure', icon: '🚀', title: 'חלל והרפתקה', color: '#dceeff', props: ['🚀 טיל', '👨‍🚀 קסדת חלל', '🪐 שבתאי', '👽 חייזר ידידותי', '⭐ כוכב', '🌙 ירח', '🗺️ מפת אוצר', '🏴‍☠️ דגל פיראטים', '🔭 טלסקופ', '💎 יהלום', '🦖 דינוזאור', '🔥 אמיץ/ה'] },
  { id: 'school', icon: '🏆', title: 'כיתה וסיום שנה', color: '#fff1be', props: ['🏆 אלוף/ה', '📚 קורא/ת-על', '✏️ כותב/ת', '🧠 חכם/ה', '🎓 סיום שנה', '🫶 צוות מנצח', '🌟 הצטיינות', '🖍️ יוצר/ת', '🎯 מטרה', '🔢 אלוף/ת החשבון', '🦸 גיבור/ת הכיתה', '👏 כל הכבוד!'] },
]

function propParts(value) { const space = value.indexOf(' '); return space > 0 ? [value.slice(0, space), value.slice(space + 1)] : ['✨', value] }

export default function PhotoProps() {
  const [packId, setPackId] = useState('birthday')
  const [eventName, setEventName] = useState('')
  const pack = useMemo(() => PACKS.find(item => item.id === packId), [packId])

  return <div className="mx-auto max-w-7xl px-4 py-8 buga-fade-in">
    <SEO title="אביזרי צילום להדפסה" description="חבילות גדולות של אביזרי צילום ליום הולדת, כיתה, חלל, חד-קרן ומסיבה — להדפסה חינם." path="/printables/photo-props" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'אביזרי צילום' }]} />

    <header className="text-center no-print">
      <h1 className="text-4xl sm:text-5xl">📸 אביזרי צילום גדולים להדפסה</h1>
      <p className="mx-auto mt-3 max-w-2xl text-lg text-[var(--muted-foreground)]">בחרו חבילה, כתבו שם לאירוע אם רוצים, הדפיסו — וגזרו. בכל חבילה יש 12 אביזרים גדולים וברורים.</p>
    </header>

    <section className="no-print mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {PACKS.map(item => <button key={item.id} onClick={() => setPackId(item.id)} className={`rounded-3xl border-2 p-5 text-right transition hover:-translate-y-1 ${item.id === packId ? 'border-[var(--ink)] ring-4 ring-black/10' : 'border-slate-200'}`} style={{ background: item.color }}>
        <span className="text-4xl">{item.icon}</span><b className="mt-3 block text-xl">{item.title}</b><small>12 אביזרים גדולים</small>
      </button>)}
    </section>

    <div className="no-print mx-auto mt-6 flex max-w-2xl flex-col gap-3 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sm:flex-row sm:items-end">
      <label className="flex-1 font-bold">כותרת אישית לחבילה (אופציונלי)<input value={eventName} onChange={event => setEventName(event.target.value)} placeholder="למשל: יום ההולדת של נועה" className="mt-1 w-full rounded-xl border-2 border-[var(--border)] px-3 py-2 font-normal" /></label>
      <button onClick={() => window.print()} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--accent)] px-6 py-3 text-xl font-bold text-white">🖨️ הדפיסו חבילה</button>
    </div>

    <article className="photo-props-sheet mt-8 bg-white p-5 sm:p-8" style={{ '--pack-color': pack.color }}>
      <header className="photo-props-heading"><span>{pack.icon}</span><div><small>עוגה בוגה · אביזרי צילום להדפסה</small><h2>{eventName || pack.title}</h2><p>גזרו מסביב לקו המקווקו והדביקו למקל</p></div></header>
      <div className="photo-props-grid">
        {pack.props.map((value, index) => { const [emoji, label] = propParts(value); return <div className="photo-prop" key={value}><div className="prop-stick" /><div className="prop-cut"><span>{emoji}</span><strong>{label}</strong><small>גזרו כאן ✂</small></div><i>{index + 1}</i></div> })}
      </div>
      <footer>ugabuga.co.il · הדפסה לשימוש אישי וחינוכי</footer>
    </article>

    <style>{`
      .photo-props-sheet{max-width:1120px;margin-inline:auto;border:3px solid #1d263b;border-radius:25px;box-shadow:0 8px 0 #1d263b}.photo-props-heading{display:flex;align-items:center;justify-content:center;gap:16px;text-align:center;border-bottom:3px dashed #1d263b;padding:0 0 18px}.photo-props-heading>span{font-size:54px}.photo-props-heading h2{font-size:clamp(28px,4vw,46px);margin:2px 0}.photo-props-heading p{margin:0;color:#526075}.photo-props-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:24px}.photo-prop{position:relative;min-height:205px;display:flex;justify-content:center}.prop-cut{position:relative;z-index:2;display:flex;min-height:155px;width:100%;flex-direction:column;align-items:center;justify-content:center;border:3px dashed #222;border-radius:28px;background:linear-gradient(145deg,var(--pack-color),white 75%);padding:15px;text-align:center}.prop-cut span{font-size:56px;line-height:1}.prop-cut strong{font-size:clamp(17px,2vw,24px);margin-top:7px}.prop-cut small{font-size:11px;margin-top:6px;color:#64748b}.prop-stick{position:absolute;z-index:1;bottom:0;width:13px;height:60px;border:2px solid #764d2c;border-radius:0 0 8px 8px;background:#e9b785}.photo-prop i{position:absolute;z-index:3;top:8px;right:10px;border-radius:50%;background:white;padding:2px 8px;font-size:11px;font-style:normal}.photo-props-sheet footer{margin-top:20px;text-align:center;font-size:12px;color:#64748b}@media(max-width:640px){.photo-props-grid{grid-template-columns:repeat(2,1fr);gap:10px}.photo-prop{min-height:175px}.prop-cut{min-height:130px;padding:8px}.prop-cut span{font-size:44px}.prop-stick{height:48px}.photo-props-heading>span{font-size:42px}}@media print{.no-print,header.site-header,footer:not(.photo-props-sheet footer){display:none!important}.photo-props-sheet{border:0!important;box-shadow:none!important;margin:0!important;padding:0!important}.photo-props-heading{padding-bottom:9px}.photo-props-grid{gap:10px;margin-top:10px}.photo-prop{min-height:155px}.prop-cut{min-height:120px}.prop-cut span{font-size:42px}.prop-stick{height:40px}.photo-props-sheet footer{display:block!important;margin-top:8px}}
    `}</style>
  </div>
}

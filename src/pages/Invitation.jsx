import { useState } from 'react'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'

const THEMES = [
  {id:'balloons', name:'בלונים', emoji:'🎈', bg:'#ffe0ec', pos:'0% 0%'},
  {id:'space', name:'חלל', emoji:'🚀', bg:'#e0f7fa', pos:'50% 0%'},
  {id:'dino', name:'דינוזאור', emoji:'🦖', bg:'#e8f5e9', pos:'100% 0%'},
  {id:'princess', name:'נסיכה', emoji:'👑', bg:'#f5e0ff', pos:'0% 100%'},
  {id:'football', name:'כדורגל', emoji:'⚽', bg:'#e8f5e9', pos:'50% 100%'},
  {id:'gaming', name:'גיימינג', emoji:'🎮', bg:'#e8d5f5', pos:'100% 100%'},
]

export default function Invitation() {
  const [theme, setTheme] = useState(THEMES[0])
  const [data, setData] = useState({ name:'', age:'', date:'', time:'', place:'', notes:'' })

  const update = (k,v) => setData(d => ({...d, [k]:v}))
  const share = () => {
    const text = `🎉 הוזמנתם למסיבת יום הולדת של ${data.name||'___'} ${data.age?`(גיל ${data.age})`:''}!\n📅 ${data.date||'___'} בשעה ${data.time||'___'}\n📍 ${data.place||'___'}\n${data.notes||''}`
    window.open('https://wa.me/?text='+encodeURIComponent(text), '_blank')
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8 buga-fade-in">
      <SEO title="מחולל הזמנות ליום הולדת — הזמנה מעוצבת לוואטסאפ" description="הזמנה ליום הולדת בדקה: בוחרים עיצוב (בלונים, חלל, דינוזאור, נסיכה, כדורגל או גיימינג), ממלאים תאריך, שעה ומקום ושולחים בוואטסאפ. חינם, בלי הרשמה." path="/invitation" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מחולל הזמנות' }]} />
      <h1 className="text-center text-3xl sm:text-5xl mb-3">📨 מחולל הזמנות</h1>
      <p className="mb-6 text-center text-sm text-[var(--muted-foreground)] sm:text-lg">בוחרים עיצוב, ממלאים פרטים ורואים את ההזמנה מתעדכנת מיד</p>

      <div className="grid grid-cols-3 gap-2 mb-6 sm:flex sm:flex-wrap sm:justify-center sm:gap-3">
        {THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t)} className={`wobbly-sm min-h-12 border-2 border-[var(--border)] px-2 py-2 text-sm font-bold cursor-pointer sm:px-5 sm:text-base ${theme.id===t.id?'bg-[var(--postit)] shadow-[0_3px_0_var(--border)]':'bg-white'}`}>{t.emoji} {t.name}</button>
        ))}
      </div>

      {/* Live invitation preview - editable */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:items-start">
      <div className="wobbly order-1 border-[3px] border-[var(--border)] p-4 text-center sketch-shadow-rich sm:p-8" style={{ backgroundColor: theme.bg }}>
        <img src="/images/invitation-party-hero.webp" alt="מסיבת יום הולדת צבעונית" className="mx-auto mb-4 h-40 w-full max-w-2xl rounded-2xl border-2 border-white/80 object-cover shadow-md sm:h-56" />
        <p className="font-hand text-lg mb-2">הוזמנתם למסיבת יום הולדת של</p>
        <input value={data.name} onChange={e=>update('name',e.target.value)} placeholder="שם החוגג/ת" className="bg-transparent text-center font-display text-3xl font-bold border-b-2 border-dashed border-[var(--border)] w-full mb-2 focus:outline-none" />
        <input value={data.age} onChange={e=>update('age',e.target.value)} placeholder="גיל" className="bg-transparent text-center font-hand text-xl border-b-2 border-dashed border-[var(--border)] mb-4 focus:outline-none" />
        <div className="grid grid-cols-2 gap-3 text-right">
          <div><label className="text-sm font-bold">📅 תאריך</label><input value={data.date} onChange={e=>update('date',e.target.value)} className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-2 py-1" /></div>
          <div><label className="text-sm font-bold">🕐 שעה</label><input value={data.time} onChange={e=>update('time',e.target.value)} className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-2 py-1" /></div>
        </div>
        <div className="mt-3 text-right"><label className="text-sm font-bold">📍 מקום</label><input value={data.place} onChange={e=>update('place',e.target.value)} className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-2 py-1" /></div>
        <div className="mt-3 text-right"><label className="text-sm font-bold">📝 הערות</label><input value={data.notes} onChange={e=>update('notes',e.target.value)} placeholder="אישור הגעה, ללא מתנות..." className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-2 py-1" /></div>
      </div>
      <aside className="order-2 rounded-3xl border-2 border-[var(--border)] bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-xl font-bold">📝 פרטי ההזמנה</h2>
        <p className="mb-4 text-sm text-[var(--muted-foreground)]">כל שינוי שתקלידו מופיע מיד בהזמנה.</p>
        <div className="rounded-2xl bg-[var(--postit)] p-4 text-sm leading-7">💡 טיפ: מלאו קודם את שם החוגג, התאריך והמקום — ואז שתפו בוואטסאפ.</div>
      </aside>
      </div>

      <button onClick={share} className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[#25d366] text-white font-display text-xl font-bold cursor-pointer">📱 שתפו בוואטסאפ</button>
    </div>
  )
}

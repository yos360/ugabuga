import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const DATA = {
  kids: {
    truth: ['מה הדבר הכי מצחיק שקרה לך בבית ספר?','מה החלום הכי מוזר שחלמת?','מה הדבר שאתה הכי מפחד ממנו?','אם היית יכול להיות חיה, מה היית?','מה האוכל שאתה הכי שונא?','מה הדבר שאתה הכי גאה בו?','מה הדבר שאתה עושה כשאף אחד לא רואה?','מה הבדיחה הכי גרועה ששמעת?','מה הדבר שגורם לך לצחוק?','מה התחביב שלך שאף אחד לא יודע עליו?'],
    dare: ['עשו ריקוד מצחיק של 15 שניות','חקו חיה עד שמנחשים','שירו שיר ילדים בקול אופרה','עשו 10 קפיצות על רגל אחת','עשו פרצוף מצחיק והחזיקו 15 שניות','ספרו בדיחה','הליכת סרטן מקצה לקצה','עשו כאילו אתם מציגים מזג אוויר','חקו את המורה','קפצו כמו צפרדע 30 שניות'],
  },
  teens: {
    truth: ['מה הדבר הכי מביך שקרה לך?','מי ההתאהבות הראשונה שלך?','מה הסוד שלך שאף אחד לא יודע?','מה הדבר שאתה הכי מתחרט עליו?','מי בחדר הזה הכי מתאים לך?','מה הדבר שהורים שלך לא יודעים?','מה הפעם האחרונה שבכית ולמה?','אם היית חייב לבלות עם מישהו מהחדר 24 שעות, מי?'],
    dare: ['שלחו הודעה מצחיקה לאיש קשר אקראי','עשו סלפי עם הפרצוף הכי מכוער שאפשר','דברו בקול של תינוק דקה שלמה','עשו ריקוד TikTok','אמרו מחמאה לכל אחד בחדר','עשו 20 כפיפות בטן','ספרו את הסיפור הכי מביך שלכם','דברו עם מבטא 3 דקות'],
  },
  adults: {
    truth: ['מה הדבר הכי מביך שעשית בעבודה?','מה הסוד הכי גדול שלך?','מה הדבר שאתה מתחרט עליו הכי הרבה?','מה הרגע הכי מוזר בדייט?','מה הדבר שאתה הכי מפחד ממנו?','מה הרגע הכי מביך עם ההורים?'],
    dare: ['התקשרו לפיצריה והזמינו פיצה עם אננס בדמעות','שלחו הודעה "אני חושב עליך" לאיש קשר אקראי','דברו כמו רובוט 5 דקות','ספרו בדיחה הכי גרועה שאתם יודעים','עשו stand-up של דקה','חקו מישהו מהחדר'],
  },
}

export default function TruthOrDare() {
  const [age, setAge] = useState('kids')
  const [current, setCurrent] = useState(null)

  const pick = (type) => {
    const pool = DATA[age][type]
    setCurrent({ type, text: pool[Math.floor(Math.random() * pool.length)] })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 buga-fade-in">
      <SEO title="אמת או חובה" description="גנרטור אמת או חובה — לכל גיל, מאות שאלות ומשימות." path="/tools/truth-or-dare" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'אמת או חובה' }]} />
      <h1 className="text-4xl text-center mb-6">🎭 אמת או חובה</h1>

      <div className="flex justify-center gap-2 mb-6">
        {[['kids','👶 ילדים'],['teens','🧑 נוער'],['adults','🧔 מבוגרים']].map(([k,l]) => (
          <button key={k} onClick={() => {setAge(k); setCurrent(null)}} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${age===k?'bg-[var(--postit)]':'bg-white'}`}>{l}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={() => pick('truth')} className="wobbly-md sketch-press min-h-[80px] border-[3px] border-[var(--border)] bg-[var(--pen)] text-white font-display text-2xl font-bold cursor-pointer">אמת 🤔</button>
        <button onClick={() => pick('dare')} className="wobbly-md sketch-press min-h-[80px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-2xl font-bold cursor-pointer">חובה 🔥</button>
      </div>

      {current && (
        <div className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-8 text-center sketch-shadow-rich buga-pop">
          <p className="text-sm font-bold text-[var(--muted-foreground)] mb-2">{current.type === 'truth' ? 'שאלת אמת' : 'משימת חובה'}</p>
          <p className="text-2xl font-bold">{current.text}</p>
          <button onClick={() => pick(current.type)} className="wobbly-sm sketch-press mt-4 border-2 border-[var(--border)] bg-white px-4 py-2 font-bold cursor-pointer">הבא ⏭</button>
        </div>
      )}
    </div>
  )
}

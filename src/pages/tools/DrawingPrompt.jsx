import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const PROMPTS = {
  easy: ['חתול','כלב','בית','שמש','פרח','עץ','דג','כוכב','לב','ענן','גלידה','פרפר','ארנב','שבלול','ציפור','כדור','מטרייה','ירח','הר','ספינה'],
  medium: ['חתול שאוכל ספגטי','דינוזאור עם כובע','בית על ענן','רובוט שמגדל פרחים','דג שרוכב על אופניים','ארנב שמנגן גיטרה','פיל שעף עם בלונים','עוגה בגודל של בית','חתול שהוא רופא','כלב שהוא אסטרונאוט'],
  hard: ['ציירו את הדבר הכי מצחיק שראיתם','ציירו מפלצת ידידותית','ציירו את הארוחה הכי מוזרה בעולם','ציירו עיר על הירח','ציירו חיה שלא קיימת','ציירו את עצמכם בעוד 50 שנה','ציירו את המורה שלכם כגיבור-על'],
}

const ANIMALS = ['פינגווין','ג׳ירפה','תמנון','דרקון','נמר','קוף']
const OBJECTS = ['מטרייה','גיטרה','שעון','משקפיים','כובע']
const PLACES = ['על הר געש','בחלל','באמצע האוקיינוס','בג׳ונגל','בעיר עתידנית']

export default function DrawingPrompt() {
  const [diff, setDiff] = useState('easy')
  const [current, setCurrent] = useState(null)

  const generate = () => {
    if (diff === 'combo') {
      const a = ANIMALS[Math.floor(Math.random()*ANIMALS.length)]
      const o = OBJECTS[Math.floor(Math.random()*OBJECTS.length)]
      const p = PLACES[Math.floor(Math.random()*PLACES.length)]
      setCurrent(`ציירו ${a} עם ${o} ${p}`)
    } else {
      const pool = PROMPTS[diff]
      setCurrent(pool[Math.floor(Math.random()*pool.length)])
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="מה לצייר?" description="גנרטור רעיונות לציור לילדים — קל, בינוני, אתגר, וקומבו מטורף." path="/tools/drawing-prompt" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מה לצייר' }]} />
      <h1 className="text-4xl text-center mb-6">🎨 מה לצייר?</h1>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[['easy','קל'],['medium','בינוני'],['hard','אתגר'],['combo','קומבו 🌀']].map(([k,l]) => (
          <button key={k} onClick={() => setDiff(k)} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${diff===k?'bg-[var(--postit)]':'bg-white'}`}>{l}</button>
        ))}
      </div>

      {current && (
        <div className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-8 text-center sketch-shadow-rich mb-6 buga-pop">
          <p className="text-2xl font-bold">{current}</p>
        </div>
      )}

      <button onClick={generate} className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer">
        🎨 {current ? 'עוד רעיון!' : 'מה אצייר?'}
      </button>
    </div>
  )
}

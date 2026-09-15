import { useState, useCallback } from 'react'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'

const templates = {
  happy: {
    short: [
      'יום הולדת שמח ל{name}! 🎂 {age} — איזה כיף! שיהיה יום מלא אהבה, שמחה, והפתעות. {from}',
      'ל{name} היקר/ה — יום הולדת שמח! 🎉 {age} שנים של אושר, וזה רק ההתחלה. {from}',
      '{name}, יום הולדת שמח! 🌟 גיל {age} הולך להיות מדהים. {from}',
      'מזל טוב ל{name}! 🥳 {age} שנים — ושנים רבות של אושר לפניך. {from}',
      '{name}, חוגג/ת {age}! 🎂 שכל החלומות שלך יתגשמו. {from}',
    ],
    long: [
      'ל{name} האהוב/ה,\n\nיום הולדת שמח! 🎂\n\nהיום את/ה בן/בת {age}, ואנחנו לא מפסיקים להתפלא כמה גדלת. {personal}\n\nשתמשיך/י להיות בדיוק מי שאת/ה — כי זה מושלם.\n\nאוהבים אותך עד הירח וחזרה. {from}',
      '{name} היקר/ה,\n\n{age} שנים! 🎉 איזה מסע מדהים.\n\nאנחנו כל כך גאים בך. {personal}\n\nשנת ה-{age} תהיה הכי טובה שלך — מלאה חברים, הרפתקאות, וצחוקים.\n\nיום הולדת שמח! {from}',
    ],
  },
  funny: {
    short: [
      '{name}, יום הולדת שמח! 🎂 גיל {age} — מעכשיו את/ה רשמית יותר קרוב/ה לקפה שחור מאשר לשוקו. {from}',
      'יום הולדת ל{name}! 🎉 {age} שנים, ועדיין {trait}. גאים בך. {from}',
      '{name} בן/בת {age}! 🥳 זה הגיל שבו מתחילים להבין שההורים צדקו. מזל טוב! {from}',
      'מזל טוב {name}! גיל {age} — שנה אחת יותר קרוב/ה לפנסיה 😂 {from}',
    ],
    long: [
      '{name},\n\nמזל טוב! גיל {age}! 🎂\n\n{age} שנים שאת/ה {trait}. אנחנו ממשיכים לאהוב אותך למרות זה.\n\n{personal}\n\nשיהיה לך יום מטורף, כי את/ה מגיע/ה! {from}',
    ],
  },
  warm: {
    short: [
      'ל{name}, ביום הולדתך ה-{age} — שתדע/י שאת/ה מיוחד/ת. {personal} אוהבים אותך. {from}',
      '{name}, {age} שנים של אושר. שכל יום יביא לך חיוך. ❤️ {from}',
    ],
    long: [
      'ל{name} היקר/ה שלנו,\n\nיום הולדת שמח! ❤️\n\n{age} שנים — ואת/ה עדיין הדבר הכי יפה שקרה לנו.\n\n{personal}\n\nשתמיד תדע/י שאנחנו כאן בשבילך, לא משנה מה.\n\nאוהבים ללא גבול. {from}',
    ],
  },
  rhyme: {
    short: [
      'יום הולדת שמח ל{name},\nגיל {age} — איזה פלא!\nשיהיו לך חלומות ענקיים,\nוחברים שתמיד שם בשבילך. 🎂\n{from}',
      '{name} חוגג/ת {age},\nהיום הכל מותר!\nעוגה, בלונים ומתנות —\nואהבה שלא תיגמר. 🎈\n{from}',
    ],
    long: [
      '{name} היקר/ה שלנו,\nהיום חגיגה גדולה!\nגיל {age} — איזה עניין,\nכבר ממש לא קטן/ה!\n\n{personal}\n\nשיהיו לך שנים של שמחה,\nחברים, הצלחה, ואהבה.\nיום הולדת שמח ומתוק,\nומכל הלב — ברכה! 🎂\n{from}',
    ],
  },
}

const funnyTraits = ['לא מסדר/ת את החדר', 'חולם/ת על פיצה', 'ישן/ה עם האור דלוק', 'שוכח/ת איפה שם/ה את הטלפון', 'אוכל/ת ממתקים בסתר', 'מדבר/ת עם עצמו/ה']

export default function Greeting() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [from, setFrom] = useState('')
  const [style, setStyle] = useState('happy')
  const [length, setLength] = useState('short')
  const [personal, setPersonal] = useState('')
  const [result, setResult] = useState(null)

  const generate = useCallback(() => {
    const pool = templates[style]?.[length] || templates.happy.short
    const tmpl = pool[Math.floor(Math.random() * pool.length)]
    const fromLine = from ? `באהבה, ${from}` : ''
    const trait = funnyTraits[Math.floor(Math.random() * funnyTraits.length)]
    const personalLine = personal ? `${personal} — וזה מה שעושה אותך מיוחד/ת.` : ''
    const text = tmpl
      .replace(/\{name\}/g, name || '___')
      .replace(/\{age\}/g, age || '___')
      .replace(/\{from\}/g, fromLine)
      .replace(/\{trait\}/g, trait)
      .replace(/\{personal\}/g, personalLine)
    setResult(text)
  }, [name, age, from, style, length, personal])

  const copy = () => { navigator.clipboard.writeText(result); alert('הועתק! 📋') }
  const share = () => { window.open('https://wa.me/?text=' + encodeURIComponent(result), '_blank') }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in">
      <SEO title="מחולל ברכות" description="צרו ברכה אישית ליום הולדת — שמח, מצחיק, חם, או בחרוזים. חינם, בלי הרשמה." path="/greeting" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'מחולל ברכות' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-3">💌 מחולל ברכות</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">ברכה אישית ליום הולדת בשנייה</p>

      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow mb-6">
        <div className="grid gap-4">
          <div>
            <label className="font-bold block mb-1">שם החוגג/ת *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="שם..." className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-4 py-3 text-lg" />
          </div>
          <div>
            <label className="font-bold block mb-1">גיל *</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="גיל" min="1" max="120" className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-4 py-3 text-lg" />
          </div>
          <div>
            <label className="font-bold block mb-1">מי מברך? (אופציונלי)</label>
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="מאמא ואבא, מהכיתה..." className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-4 py-3" />
          </div>
          <div>
            <label className="font-bold block mb-2">סגנון</label>
            <div className="flex flex-wrap gap-2">
              {[['happy','🎉 שמח'],['funny','😂 מצחיק'],['warm','❤️ חם'],['rhyme','🎤 חרוזים']].map(([k,l]) => (
                <button key={k} onClick={() => setStyle(k)} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${style === k ? 'bg-[var(--accent)] text-white' : 'bg-[var(--card)]'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-bold block mb-2">אורך</label>
            <div className="flex gap-2">
              {[['short','קצר'],['long','ארוך']].map(([k,l]) => (
                <button key={k} onClick={() => setLength(k)} className={`wobbly-sm border-2 border-[var(--border)] px-4 py-2 font-bold cursor-pointer ${length === k ? 'bg-[var(--postit)]' : 'bg-[var(--card)]'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="font-bold block mb-1">פרט אישי (אופציונלי)</label>
            <input value={personal} onChange={e => setPersonal(e.target.value)} placeholder="אוהב כדורגל, הכי חכמה בכיתה..." className="wobbly-sm w-full border-2 border-[var(--border)] bg-white px-4 py-3" />
          </div>
          <button onClick={generate} disabled={!name || !age}
            className="wobbly-md sketch-press w-full min-h-[48px] border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-3 font-display text-xl font-bold text-[var(--accent-foreground)] cursor-pointer disabled:opacity-50">
            ✨ צרו ברכה!
          </button>
        </div>
      </div>

      {result && (
        <div className="buga-fade-in">
          <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-8 sketch-shadow tape mb-4">
            <p className="text-xl leading-relaxed whitespace-pre-line font-hand">{result}</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={copy} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display font-bold cursor-pointer">📋 העתיקו</button>
            <button onClick={share} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[#25d366] text-white px-5 py-2 font-display font-bold cursor-pointer">📱 שתפו בוואטסאפ</button>
            <button onClick={generate} className="wobbly-md sketch-press border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display font-bold cursor-pointer">🔄 ברכה אחרת</button>
          </div>
        </div>
      )}
    </div>
  )
}

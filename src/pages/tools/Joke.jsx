import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'

const JOKES = [
  {q:'למה הכלב ישב בצל?',a:'כי לא רצה להיות נקניקייה חמה.'},
  {q:'מה אמר הדג כשנתקע בקיר?',a:'דם.'},
  {q:'למה הפיל לא משתמש במחשב?',a:'כי הוא מפחד מהעכבר.'},
  {q:'למה המחברת עצובה?',a:'כי יש לה הרבה בעיות.'},
  {q:'למה המספריים נכשלו במבחן?',a:'כי הם חתכו כל הזמן.'},
  {q:'למה העגבנייה הסמיקה?',a:'כי היא ראתה את הרוטב סלט.'},
  {q:'למה הבננה הלכה לרופא?',a:'כי לא הרגישה בקליפה.'},
  {q:'מה עושים כשרואים אדם ירוק?',a:'מחכים שייהפך לאדום.'},
  {q:'למה האריה לא אוהב פאזלים?',a:'כי הוא מתפרק מלחץ.'},
  {q:'למה השלג לבן?',a:'כי הוא לא מצא צבע אחר.'},
  {q:'מה עושה מחשב כשהוא רעב?',a:'אוכל בייטים.'},
  {q:'למה המחשב הלך לרופא?',a:'כי היה לו וירוס.'},
]

export default function Joke() {
  const [current, setCurrent] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const next = () => {
    setCurrent(JOKES[Math.floor(Math.random()*JOKES.length)])
    setRevealed(false)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8 buga-fade-in">
      <SEO title="בדיחה של BUGA" description="בדיחות לילדים בעברית — חדשה בכל לחיצה." path="/tools/joke" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'בדיחה' }]} />
      <h1 className="text-4xl text-center mb-6">😂 בדיחה של BUGA</h1>

      {current ? (
        <div className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-8 text-center sketch-shadow-rich mb-6">
          <p className="text-xl font-bold mb-4">{current.q}</p>
          {revealed ? (
            <p className="text-2xl font-bold text-[var(--accent)] buga-slide-down">{current.a}</p>
          ) : (
            <button onClick={() => setRevealed(true)} className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-bold cursor-pointer">גלו את התשובה 🤣</button>
          )}
        </div>
      ) : (
        <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">לחצו כדי לקבל בדיחה</p>
      )}

      <button onClick={next} className="wobbly-md sketch-press w-full min-h-[56px] border-[3px] border-[var(--border)] bg-[var(--accent)] text-white font-display text-xl font-bold cursor-pointer">
        😂 {current ? 'עוד בדיחה!' : 'תנו לי בדיחה'}
      </button>
    </div>
  )
}

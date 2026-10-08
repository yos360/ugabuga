import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import NotFound from '../NotFound'
import { ESCAPE_COLLECTIONS } from '../../data/escapeCollections'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import PrintPreview from '../../components/ui/PrintPreview'
import { ESCAPE_ROOMS } from '../../data/escapeRoomsExpanded'
import { buildEscapeAdventure, ESCAPE_LEVELS } from '../../data/escapeAdventure'
import { ESCAPE_ROOM_GUIDES } from '../../data/escapeRoomGuides'
import { nearby } from '../../utils/nearby'

const escapeRoomsFaq = [
  { q: 'איזה חדר בריחה מתאים ליום הולדת של ילד בן 8?', a: 'יש כמה חדרים שנבנו לגילאי 6–9 ו-7–9 — קהל היעד מופיע בכרטיס של כל חדר. לילדים צעירים יותר מתאים במיוחד תעלומת העוגה הנעלמת, חדר קליל של 10–15 דקות.' },
  { q: 'צריך ציוד מיוחד חוץ מהדפסה?', a: 'לרוב לא — רק מדפסת, מספריים, ולפעמים מעטפות או תיבה קטנה להסתרת רמזים, לפי ההוראות שמצורפות לכל חדר.' },
]
const escapeRoomsBody = [
  'חדר בריחה מודפס נותן למסיבה או ליום גיבוש תחושה של "אירוע אמיתי" בלי צורך לנסוע לשום מקום. יש כאן עשרות חדרים מוכנים — לגן, לילדים, לנוער, למבוגרים, לכיתה ולחגים. כל חדר מגיע עם ערכת רמזים, חידות ופתרון מוכן.',
  'את החדר בוחרים לפי גיל הקהל, לא רק לפי רמת הקושי: לקטנים יש חדרים של ספירה, צבעים וצורות; לגילאי בית הספר צפנים וחשבון; לנוער ולמבוגרים תעלומות עם חשודים וחידות היגיון אמיתיות.',
  'טיפ מעשי: תזמנו בין 15 ל-45 דקות לחדר, לפי המשך שמופיע בכרטיס שלו, ועוד כמה דקות להסבר בהתחלה. קבוצה גדולה מדי (מעל 6 משתתפים) נוטה ליצור "צופים" שלא ממש מעורבים — עדיף לחלק לשתי קבוצות מקבילות.',
]
const escapeRoomsHowTo = [
  'בוחרים חדר לפי הגיל והאירוע — הקהל, משך הזמן ורמת הקושי מופיעים בכרטיס של כל חדר.',
  'משחקים ישר על המסך, או פותחים את קיט ההפעלה ומדפיסים: דף מנחה עם הסיפור וכל התשובות, וכרטיס A4 לכל שלב.',
  'מחביאים את כרטיסי השלבים בחדר, כך שכל תשובה מובילה לכרטיס הבא, ומקריאים את סיפור הפתיחה.',
  'מפעילים טיימר. כשקבוצה נתקעת נותנים רמז אחד בכל פעם — הרמזים מדורגים, והראשון אף פעם לא מגלה את התשובה.',
  'הקוד האחרון פותח קופסה או מעטפה עם הפרס: שקיות הפתעה, העוגה, תעודה או כל מה שמתאים לאירוע.',
]
const SETTING_LABELS = { birthday: 'יום הולדת', classroom: 'כיתה', family: 'משפחה', team: 'גיבוש', holiday: 'חגים' }
const escapeRoomsRelated = [ { label: 'יוצר ציד אוצרות', href: '/tools/scavenger-hunt-maker' }, { label: 'יום הולדת בבית', href: '/ideas/at-home' }, { label: 'מתחם יוצרים', href: '/create' } ]

// Number answers also accept the Hebrew word ("ארבע" for 4), and niqqud / final letters never decide a match.
const HEBREW_NUMBERS = ['אפס', 'אחת|אחד', 'שתיים|שניים|שתים|שנים', 'שלוש|שלושה', 'ארבע|ארבעה', 'חמש|חמישה', 'שש|שישה', 'שבע|שבעה', 'שמונה', 'תשע|תשעה', 'עשר|עשרה',
  'אחת עשרה|אחד עשר', 'שתים עשרה|שנים עשר', 'שלוש עשרה|שלושה עשר', 'ארבע עשרה|ארבעה עשר', 'חמש עשרה|חמישה עשר', 'שש עשרה|שישה עשר', 'שבע עשרה|שבעה עשר', 'שמונה עשרה|שמונה עשר', 'תשע עשרה|תשעה עשר', 'עשרים']
const finals = text => text.replace(/[ךםןףץ]/g, c => ({ ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }[c]))
const NUMBER_WORDS = new Map(HEBREW_NUMBERS.flatMap((forms, n) => forms.split('|').map(w => [finals(w), String(n)])))
function normalizeAnswer(value) {
  const text = finals(String(value).normalize('NFKD').replace(/[\u0591-\u05C7]/g, '')).trim().toLowerCase().replace(/["'`׳״.,!?:;()\-־]/g, ' ').replace(/\s+/g, ' ').trim()
  return NUMBER_WORDS.get(text) ?? text
}

// Printable kit: page 1 is the facilitator sheet (setup + every answer), then one A4 card per stage
// for the players. Built from the same `room` object the screen shows, so preview and paper always match.
function EscapePrintKit({ room, base, levelLabel }) {
  const hintsOf = (item) => (item.hints?.length ? item.hints : [item.hint]).filter(Boolean)
  const setup = [
    ...(base.materials || []),
    `מדפיסים את ${room.steps.length} כרטיסי השלבים (מהעמוד הבא) ומסדרים אותם לפי המספר — או מחביאים כל כרטיס בחדר, וכל תשובה מובילה לכרטיס הבא.`,
    'מקריאים לקבוצה את סיפור הפתיחה ומפעילים טיימר.',
    'כשהקבוצה נתקעת — נותנים רמז מהטבלה, אחד בכל פעם.',
    ...(base.printableKit || []),
  ]
  return <>
    <article className="buga-flow escape-kit" style={{ fontFamily: 'Heebo, Arial, sans-serif' }}>
      <h2 style={{ fontSize: 26, margin: '0 0 4px' }}>{room.emoji} {room.title} — קיט הפעלה למנחה</h2>
      <p style={{ margin: '0 0 8px', fontSize: 14 }}>{[room.audience, room.duration, levelLabel && `רמה: ${levelLabel}`, `${room.steps.length} שלבים`].filter(Boolean).join(' · ')}</p>
      <p style={{ margin: '0 0 8px', fontSize: 14 }}><b>סיפור הפתיחה:</b> {room.intro}{base.story ? ` ${base.story}` : ''}</p>
      <h3 style={{ fontSize: 17, margin: '8px 0 2px' }}>הכנה</h3>
      <ol style={{ margin: '0 0 6px', paddingRight: 20, fontSize: 13.5, listStyle: 'decimal' }}>{setup.map((m) => <li key={m}>{m}</li>)}</ol>
      <h3 style={{ fontSize: 17, margin: '8px 0 4px' }}>תשובות ורמזים (למנחה בלבד)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr style={{ borderBottom: '2px solid #111' }}><th style={{ textAlign: 'right', padding: '4px' }}>שלב</th><th style={{ textAlign: 'right', padding: '4px' }}>תשובה / קוד</th><th style={{ textAlign: 'right', padding: '4px' }}>רמזים</th></tr></thead>
        <tbody>{room.steps.map((item, index) => <tr key={index} style={{ borderBottom: '1px solid #ccc', breakInside: 'avoid' }}>
          <td style={{ padding: '4px', verticalAlign: 'top', whiteSpace: 'nowrap' }}>{index + 1}. {item.title}</td>
          <td style={{ padding: '4px', verticalAlign: 'top', fontWeight: 800 }}><bdi>{item.answer}</bdi></td>
          <td style={{ padding: '4px', verticalAlign: 'top' }}>{hintsOf(item).join(' · ')}</td>
        </tr>)}</tbody>
      </table>
      {room.finalMessage && <p style={{ marginTop: 8, fontSize: 13.5 }}><b>בסיום מקריאים:</b> {room.finalMessage}</p>}
    </article>
    {room.steps.map((item, index) => (
      <article key={index} className="buga-a4 escape-card" style={{ alignItems: 'stretch', fontFamily: 'Heebo, Arial, sans-serif', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{room.emoji} {room.title} · שלב {index + 1} מתוך {room.steps.length}</p>
        <h2 style={{ fontSize: 40, margin: '14px 0 18px' }}>{item.title}</h2>
        <p style={{ fontSize: 26, lineHeight: 1.6, margin: '0 0 20px' }}>{item.story}</p>
        {item.visual && <div dir="ltr" style={{ fontSize: 46, lineHeight: 1.5, border: '2px dashed #999', borderRadius: 14, padding: '18px 10px', margin: '0 0 16px', overflowWrap: 'anywhere' }}>{item.visual}</div>}
        <p style={{ fontSize: 32, fontWeight: 800, margin: '0 0 14px' }}>{item.question || item.prompt}</p>
        <div style={{ flex: 1, minHeight: 60 }} />
        <div style={{ border: '3px solid #111', borderRadius: 16, padding: '12px 16px', textAlign: 'right' }}>
          <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800 }}>✍️ התשובה שלנו:</p>
          <div style={{ height: 110, borderBottom: '2px solid #777' }} />
        </div>
      </article>
    ))}
  </>
}

export default function EscapeRooms() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { roomId: pathRoomId } = useParams()
  const requestedRoomId = pathRoomId || searchParams.get('room')
  const roomId = ESCAPE_ROOMS.some((item) => item.id === requestedRoomId)
    ? requestedRoomId
    : ESCAPE_ROOMS[0]?.id
  const [stepIndex, setStepIndex] = useState(0)
  const [difficulty, setDifficulty] = useState('easy')
  const [roundSeed, setRoundSeed] = useState(0)
  const [answer, setAnswer] = useState('')
  const [hintCount, setHintCount] = useState(0)
  const [showPrintKit, setShowPrintKit] = useState(false)
  const [status, setStatus] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [printingKit, setPrintingKit] = useState(false)
  const roomPanelRef = useRef(null)
  const advanceTimerRef = useRef(null)

  const room = useMemo(() => buildEscapeAdventure(ESCAPE_ROOMS.find((item) => item.id === roomId), difficulty, roundSeed), [roomId, difficulty, roundSeed])
  const step = room?.steps[stepIndex]
  const stepQuestion = step?.question || step?.prompt || ''
  const solvedRoom = room && completedSteps.length === room.steps.length
  const stepHints = step?.hints?.length ? step.hints : step?.hint ? [step.hint] : []

  // Arriving from a shared link (?room=...) lands straight on the game, not the page header.
  useEffect(() => {
    if (!searchParams.get('room')) return
    const timer = setTimeout(() => roomPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setStepIndex(0)
    setAnswer('')
    setHintCount(0)
    setShowPrintKit(false)
    setStatus(null)
    setCompletedSteps([])
    return () => clearTimeout(advanceTimerRef.current)
  }, [roomId, difficulty, roundSeed])

  const chooseRoom = (id) => {
    clearTimeout(advanceTimerRef.current)
    navigate('/tools/escape-rooms/' + id, { preventScrollReset: true })
    setStepIndex(0)
    setAnswer('')
    setHintCount(0)
    setShowPrintKit(false)
    setStatus(null)
    setCompletedSteps([])
    requestAnimationFrame(() => roomPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const checkAnswer = () => {
    if (!step || status === 'correct' || !answer.trim()) return

    const userAnswer = normalizeAnswer(answer)
    const accepted = [step.answer, ...(step.accept || [])].map(normalizeAnswer)

    if (accepted.includes(userAnswer)) {
      const nextCompleted = [...new Set([...completedSteps, stepIndex])]
      setCompletedSteps(nextCompleted)
      setStatus('correct')
      setAnswer('')
      setHintCount(0)

    } else {
      setStatus('wrong')
    }
  }

  const resetRoom = () => {
    setRoundSeed((seed) => seed + 1)
    clearTimeout(advanceTimerRef.current)
    setStepIndex(0)
    setAnswer('')
    setHintCount(0)
    setStatus(null)
    setCompletedSteps([])
  }

  if (pathRoomId && !ESCAPE_ROOMS.some((item) => item.id === pathRoomId)) return <NotFound />
  if (!room || !step) return null
  const base = ESCAPE_ROOMS.find((item) => item.id === roomId)
  const isRoomPage = Boolean(pathRoomId)
  // Recommendations stay inside the same age group: a kids room never points to a teen/adult room.
  const baseAges = base.tags?.ages || []
  const grownUp = (item) => (item.tags?.ages || []).some((a) => a === '13+' || a === 'adults')
  const baseIsKids = !grownUp(base)
  const ageScore = (item) => (item.tags?.ages || []).filter((a) => baseAges.includes(a)).length + ((item.tags?.ages || [])[0] === baseAges[0] ? 2 : 0)
  const sameGroup = ESCAPE_ROOMS.filter((item) => item.id !== roomId && ageScore(item) > 0 && (!baseIsKids || !grownUp(item)))
  // Related rooms: same age group AND a shared setting, taken with nearby() so every room gets
  // roughly the same number of inbound links instead of the first rooms of the list getting all of them.
  const baseSettings = base.tags?.settings || []
  const sharedSettings = (item) => (item.tags?.settings || []).filter((s) => baseSettings.includes(s))
  const relatedPool = ESCAPE_ROOMS.filter((item) => item.id === roomId || (sameGroup.includes(item) && (baseIsKids || grownUp(item)) && sharedSettings(item).length > 0))
  let related = nearby(relatedPool, (item) => item.id === roomId, 6)
  if (related.length < 4) related = [...related, ...[...sameGroup].sort((a, b) => ageScore(b) - ageScore(a)).filter((item) => !related.includes(item))].slice(0, 6)
  const roomIndex = ESCAPE_ROOMS.findIndex((item) => item.id === roomId)
  const nextRoom = sameGroup.length
    ? [...sameGroup].sort((a, b) => ageScore(b) - ageScore(a) || ((ESCAPE_ROOMS.indexOf(a) - roomIndex + ESCAPE_ROOMS.length) % ESCAPE_ROOMS.length) - ((ESCAPE_ROOMS.indexOf(b) - roomIndex + ESCAPE_ROOMS.length) % ESCAPE_ROOMS.length))[0]
    : ESCAPE_ROOMS[(roomIndex + 1) % ESCAPE_ROOMS.length]
  const roomCollections = Object.entries(ESCAPE_COLLECTIONS).filter(([, c]) => c.filter(base))
  const guide = ESCAPE_ROOM_GUIDES[roomId] || {}
  const props = (base.materials || []).filter((m) => !/מודפס|דפי |טיוטה|עטים|עפרונות/.test(m))
  const groupSize = baseAges.includes('4-6')
    ? 'עד 6 ילדים עם מבוגר שמקריא את התחנות. כשיש יותר ילדים — שני מבוגרים ושתי קבוצות שמשחקות במקביל.'
    : !baseIsKids
      ? 'הכי טוב בקבוצות של 4–6 משתתפים. עם יותר אנשים מתחלקים לשתי קבוצות שמתחרות על הזמן, כל אחת עם קיט משלה.'
      : 'הכי טוב בקבוצות של 3–5 ילדים. בכיתה או במסיבה גדולה מדפיסים קיט לכל קבוצה ומריצים את החדר במקביל.'
  const roomFaq = isRoomPage ? [
    { q: `לאיזה גיל מתאים חדר הבריחה "${base.title}" וכמה זמן הוא לוקח?`, a: `החדר נבנה ל${base.audience}, ברמת קושי ${base.difficulty || 'בינונית'}, ולוקח בדרך כלל ${base.duration || '20 דקות'}. יש בו ${base.steps.length} תחנות בסיפור, ובגרסה שבאתר אפשר לבחור בין שלוש רמות קושי שמוסיפות מנעולים.` },
    ...(guide.faq || []).map(([q, a]) => ({ q, a })),
  ] : escapeRoomsFaq

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {isRoomPage ? (
        <SEO title={`${base.title} — חדר בריחה ל${base.audience}`} description={base.description} path={'/tools/escape-rooms/' + roomId} structuredData={faqSchema(roomFaq)} />
      ) : (
        <SEO
          title="חדר בריחה להדפסה לילדים ולנוער"
          description={`${ESCAPE_ROOMS.length} חדרי בריחה בחינם — לגן, לילדים, לנוער, למבוגרים, לכיתה ולחגים. לשחק באתר או להדפיס קיט מלא עם רמזים ופתרונות.`}
          path="/tools/escape-rooms"
          structuredData={faqSchema(escapeRoomsFaq)}
        />
      )}
      <Breadcrumbs items={isRoomPage ? [{ label: 'ראשי', href: '/' }, { label: 'חדרי בריחה', href: '/tools/escape-rooms' }, { label: base.title }] : [{ label: 'ראשי', href: '/' }, { label: 'כלים' }, { label: 'חדרי בריחה' }]} />

      {isRoomPage ? (
        <section className="mb-8 text-center">
          <div className="text-6xl mb-2">{base.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-hand font-bold mb-3">חדר בריחה: {base.title}</h1>
          <p className="text-lg max-w-3xl mx-auto mb-4">{base.description}</p>
          {guide.about && <p className="max-w-3xl mx-auto mb-4 leading-relaxed text-[var(--foreground)]/85">{guide.about}</p>}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge>{base.audience}</Badge>
            {base.difficulty && <Badge color="yellow">{base.difficulty}</Badge>}
            {base.duration && <Badge color="blue">{base.duration}</Badge>}
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-right max-w-4xl mx-auto">
            <WobblyCard hover={false} padding="p-5">
              <h2 className="text-2xl font-hand font-bold mb-2">הסיפור</h2>
              <p className="leading-relaxed">{base.intro}</p>
              {base.story && <p className="leading-relaxed mt-2">{base.story}</p>}
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">{base.steps.length} תחנות בסיפור · בגרסה הדיגיטלית אפשר לבחור רמת קושי שמוסיפה מנעולים.</p>
            </WobblyCard>
            <WobblyCard hover={false} padding="p-5">
              <h2 className="text-2xl font-hand font-bold mb-2">להפעלה בבית או בכיתה</h2>
              {base.materials?.length > 0 && <><h3 className="font-bold">מה מכינים</h3><ul className="list-disc pr-5 mb-2">{base.materials.map((m) => <li key={m}>{m}</li>)}</ul></>}
              {base.printableKit?.length > 0 && <><h3 className="font-bold">טיפים למנחה</h3><ul className="list-disc pr-5">{base.printableKit.map((m) => <li key={m}>{m}</li>)}</ul></>}
            </WobblyCard>
          </div>
        </section>
      ) : (
      <>
      <h1 className="text-4xl md:text-5xl font-hand font-bold text-center mb-2">🔐 חדרי בריחה BUGA</h1>
      <p className="text-center text-[var(--ink)]/70 mb-8 max-w-3xl mx-auto">
        משחק דיגיטלי בתוך האתר וגם קיט להפעלה בכיתה, בבית או במסיבת מבוגרים. כל חדר בנוי מרמזים מדויקים,
        תשובות ברורות והתקדמות שלב־אחרי־שלב.
      </p>
      <nav aria-label="חדרי בריחה לפי נושא" className="mb-8 flex flex-wrap justify-center gap-2">
        {Object.entries(ESCAPE_COLLECTIONS).map(([slug, c]) => <Link key={slug} to={'/tools/escape-rooms/topic/' + slug} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{c.emoji} {c.title}</Link>)}
      </nav>
      </>
      )}

      <section className="mb-6 rounded-3xl border border-[var(--border)] bg-white p-5" aria-label="בחירת רמת קושי">
        <h2 className="text-2xl font-bold mb-3">{isRoomPage ? `רמת הקושי של "${base.title}" באתר` : 'קודם בוחרים רמת קושי'}</h2>
        <div className="grid sm:grid-cols-3 gap-3">{ESCAPE_LEVELS.map(level => <button key={level.id} aria-pressed={difficulty === level.id} className={`text-right rounded-2xl border p-4 ${difficulty===level.id?'bg-purple-100 border-purple-500':'bg-white'}`} onClick={() => {if(level.id!==difficulty && (!completedSteps.length || window.confirm('החלפת רמה תתחיל את החדר מחדש. להמשיך?')))setDifficulty(level.id)}}><strong className="block text-xl">{level.label}</strong><span className="text-sm">{level.detail}</span></button>)}</div>
        {!isRoomPage && <p className="text-sm mt-3 text-[var(--muted-foreground)]">רמזי הפתיחה משותפים לכל הרמות. בהמשך המנעולים נעשים מורכבים יותר. בכל שלב אפשר לבקש רמז.</p>}
      </section>

      <div className="grid lg:grid-cols-[330px_1fr] gap-6 items-start">
        <aside className="order-2 space-y-4 lg:order-1 lg:sticky lg:top-4">
          <WobblyCard hover={false} padding="p-5">
            <h2 className="text-2xl font-hand font-bold mb-3">{isRoomPage ? 'בחרו חדר אחר' : 'בחרו חדר'}</h2>
            <div className="space-y-3 lg:max-h-[80vh] lg:overflow-y-auto lg:pl-1">
              {(showAllRooms ? ESCAPE_ROOMS : isRoomPage ? [] : ESCAPE_ROOMS.slice(0, 6).concat(ESCAPE_ROOMS.slice(6).filter((item) => item.id === roomId))).map((item) => (
                <Link
                  key={item.id}
                  to={'/tools/escape-rooms/' + item.id}
                  preventScrollReset
                  onClick={() => requestAnimationFrame(() => roomPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))}
                  className={`block w-full text-right border-2 border-[var(--ink)] p-4 wobbly-sm transition-colors ${roomId === item.id ? 'bg-[var(--yellow)]' : 'bg-white hover:bg-[var(--muted)]/20'}`}
                >
                  <div className="text-2xl mb-1">{item.emoji}</div>
                  <div className="font-hand font-bold text-xl">{item.title}</div>
                  {!isRoomPage && <p className="text-sm text-[var(--muted-foreground)] mt-1">{item.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge>{item.audience}</Badge>
                    {!isRoomPage && <Badge color="yellow">3 רמות קושי</Badge>}
                  </div>
                </Link>
              ))}
            </div>
            {!showAllRooms && ESCAPE_ROOMS.length > 6 && (
              <button type="button" onClick={() => setShowAllRooms(true)} className="mt-3 w-full min-h-[44px] border-2 border-[var(--ink)] bg-white wobbly-sm font-bold hover:bg-[var(--yellow)]/40">
                הצג הכול ({ESCAPE_ROOMS.length} חדרים)
              </button>
            )}
            {isRoomPage && <Link to="/tools/escape-rooms" className="mt-3 block text-center font-bold underline">לעמוד כל חדרי הבריחה</Link>}
          </WobblyCard>

          <WobblyCard hover={false} padding="p-5">
            <h2 className="text-xl font-hand font-bold mb-2">אפשר גם להפעיל פיזית</h2>
            {!isRoomPage && <p className="text-sm leading-relaxed text-[var(--muted-foreground)] mb-4">
              פתחו את קיט ההפעלה כדי לקבל מבנה למנחה: סיפור פתיחה, שלבים, תשובות ורמזים.
            </p>}
            <div className="flex flex-wrap gap-2">
              <WobblyButton onClick={() => setShowPrintKit((value) => !value)} variant="secondary">
                {showPrintKit ? 'הסתר קיט' : 'הצג קיט להפעלה'}
              </WobblyButton>
              <button data-print-main type="button" onClick={() => setPrintingKit(true)} className="min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 font-bold text-white">🖨️ הדפסת הקיט</button>
            </div>
          </WobblyCard>
        </aside>

        <div ref={roomPanelRef} className="order-1 space-y-6 scroll-mt-6 lg:order-2">
          <WobblyCard hover={false} padding="p-6" className="bg-[var(--postit)]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-3xl font-hand font-bold">{room.emoji} {room.title}</h2>
                <p className="text-[var(--muted-foreground)] mt-1">{room.intro}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{room.audience}</Badge>
                <Badge color="yellow">{room.difficulty}</Badge>
                <Badge color="blue">{room.duration}</Badge>
              </div>
            </div>

            <div className="h-3 rounded-full bg-white border border-[var(--border)] overflow-hidden">
              <div
                className="h-full bg-[#4caf50] transition-all"
                style={{ width: `${(completedSteps.length / room.steps.length) * 100}%` }}
              />
            </div>
            <p className="text-sm mt-2 text-[var(--muted-foreground)]">
              נפתרו {completedSteps.length} מתוך {room.steps.length} שלבים
            </p>
          </WobblyCard>

          {solvedRoom ? (
            <WobblyCard hover={false} padding="p-8" className="text-center">
              <div className="text-6xl mb-3">🎉</div>
              <h2 className="text-3xl font-hand font-bold mb-3">החדר נפתר!</h2>
              <p className="text-xl leading-relaxed mb-6">{room.finalMessage}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <WobblyButton onClick={resetRoom} variant="primary">שחקו שוב</WobblyButton>
                <WobblyButton onClick={() => chooseRoom(nextRoom.id)} variant="secondary">ממשיכים לחדר הבא: {nextRoom.emoji} {nextRoom.title} ←</WobblyButton>
                <WobblyButton onClick={() => setShowPrintKit(true)} variant="secondary">ראו קיט הפעלה</WobblyButton>
              </div>
            </WobblyCard>
          ) : (
            <WobblyCard hover={false} padding="p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-3xl font-hand font-bold">שלב {stepIndex + 1}: {step.title}</h2>
                <Badge color="yellow">{stepIndex + 1}/{room.steps.length}</Badge>
              </div>

              <p className="text-lg leading-relaxed mb-5">{step.story}</p>
              {step.visual && <div dir="ltr" className="text-center text-2xl sm:text-3xl bg-purple-50 rounded-2xl p-5 mb-5" aria-label="לוח הרמז">{step.visual}</div>}
              <label htmlFor="escape-answer" className="block font-hand text-xl font-bold mb-2">{stepQuestion}</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="escape-answer"
                  disabled={status === 'correct'}
                  value={answer}
                  onChange={(event) => { setAnswer(event.target.value); setStatus(null) }}
                  onKeyDown={(event) => { if (event.key === 'Enter') checkAnswer() }}
                  placeholder="כתבו תשובה..."
                  className="flex-1 border-2 border-[var(--ink)] bg-white px-4 py-3 text-lg wobbly-sm outline-none focus:bg-[var(--yellow)]/20"
                />
                <WobblyButton disabled={status === 'correct' || !answer.trim()} onClick={checkAnswer} variant="primary">בדקו תשובה</WobblyButton>
              </div>

              {status === 'wrong' && (
                <p className="mt-3 text-[var(--accent)] font-bold">עוד לא. נסו שוב או פתחו רמז.</p>
              )}
              {status === 'correct' && (
                <div className="mt-3 text-[#2e7d32] font-bold" role="status"><p>נכון! המנעול נפתח.</p><WobblyButton onClick={() => {setStepIndex(index => index+1);setStatus(null);setAnswer('');setHintCount(0)}}>ממשיכים לשלב הבא ←</WobblyButton></div>
              )}

              <div className="mt-5" aria-live="polite">
                {hintCount > 0 && (
                  <ol className="space-y-2 mb-2">
                    {stepHints.slice(0, hintCount).map((h, i) => (
                      <li key={i}><WobblyCard hover={false} padding="p-3" className="bg-[var(--yellow)] inline-block"><p className="text-sm">💡 רמז {i + 1}: {h}</p></WobblyCard></li>
                    ))}
                  </ol>
                )}
                {status !== 'correct' && hintCount < stepHints.length && (
                  <button type="button" onClick={() => setHintCount((c) => c + 1)} className="min-h-[44px] text-[var(--blue)] font-bold hover:underline">
                    {hintCount === 0 ? 'צריכים רמז? 💡' : 'עוד רמז 💡'}
                  </button>
                )}
              </div>
            </WobblyCard>
          )}

          {showPrintKit && (
            <WobblyCard hover={false} padding="p-6">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-hand font-bold">🖨️ קיט הפעלה למנחה</h2><button type="button" onClick={() => setPrintingKit(true)} className="min-h-[44px] rounded-xl bg-slate-900 px-4 py-2 font-bold text-white">🖨️ להדפסה: קיט + כרטיס לכל שלב</button></div>
              <p className="leading-relaxed mb-4">
                מתאים לכיתה, יום הולדת, פעילות משפחתית או מסיבת מבוגרים. מקריאים את הסיפור, נותנים לקבוצה לפתור,
                ומשתמשים ברמזים רק אם נתקעים.
              </p>
              <div className="space-y-4">
                {room.steps.map((item, index) => (
                  <div key={item.title} className="border-2 border-[var(--border)] bg-white p-4 wobbly-sm">
                    <h3 className="font-hand font-bold text-xl mb-1">{index + 1}. {item.title}</h3>
                    <p className="mb-2">{item.story}</p>
                    {item.visual && <p dir="ltr" className="text-center text-xl">{item.visual}</p>}
                    <p><strong>שאלה:</strong> {item.question || item.prompt}</p>
                    <p><strong>תשובה:</strong> {item.answer}</p>
                    <p><strong>רמז:</strong> {(item.hints?.length ? item.hints : [item.hint]).filter(Boolean).join(' · ')}</p>
                  </div>
                ))}
              </div>
            </WobblyCard>
          )}
        </div>
      </div>

      {printingKit && (
        <PrintPreview title={`קיט הפעלה: ${room.title}`} onClose={() => setPrintingKit(false)}>
          <EscapePrintKit room={room} base={base} levelLabel={ESCAPE_LEVELS.find((l) => l.id === difficulty)?.label} />
        </PrintPreview>
      )}

      {isRoomPage && (
        <section className="mt-12 space-y-8" aria-label={`מדריך הפעלה: ${base.title}`}>
          <h2 className="text-3xl font-hand font-bold">מדריך הפעלה: {base.emoji} {base.title}</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <WobblyCard hover={false} padding="p-5">
              <h3 className="text-xl font-bold mb-2">מה מתרגלים בחדר</h3>
              {guide.skills && <p className="leading-relaxed mb-3">{guide.skills}.</p>}
              <details>
                <summary className="cursor-pointer font-bold">מסלול {base.steps.length} התחנות (בלי התשובות)</summary>
                <ol className="list-decimal pr-5 mt-2 space-y-1">{base.steps.map((s, i) => <li key={i}><strong>{s.title}</strong> — {s.question || s.prompt}</li>)}</ol>
              </details>
            </WobblyCard>
            <WobblyCard hover={false} padding="p-5">
              <h3 className="text-xl font-bold mb-2">הכנה והדפסה</h3>
              <p className="leading-relaxed">ברמה {ESCAPE_LEVELS.find((l) => l.id === difficulty)?.label} הקיט המודפס כולל {room.steps.length + 1} עמודים: דף מנחה עם סיפור הפתיחה, רשימת ההכנה וכל התשובות, ועוד כרטיס A4 לכל אחד מ-{room.steps.length} השלבים.{props.length >= 2 ? ` מלבד ההדפסה כדאי להכין מראש את ${props[0]} ו${/^[\d"״]/.test(props.at(-1)) ? '-' : ''}${props.at(-1)}.` : ''}</p>
              {base.printableKit?.[0] && <p className="leading-relaxed mt-2"><strong>הכי חשוב בהכנה:</strong> {base.printableKit[0]}</p>}
            </WobblyCard>
            <WobblyCard hover={false} padding="p-5">
              <h3 className="text-xl font-bold mb-2">התאמה לגיל ולגודל הקבוצה</h3>
              {guide.adapt && <p className="leading-relaxed mb-2">{guide.adapt}</p>}
              <p className="leading-relaxed">{groupSize}</p>
            </WobblyCard>
            <WobblyCard hover={false} padding="p-5">
              <h3 className="text-xl font-bold mb-2">איך נותנים רמזים בחדר הזה</h3>
              {guide.hint && <p className="leading-relaxed mb-2">{guide.hint}</p>}
              <p className="leading-relaxed text-[var(--muted-foreground)]">באתר הרמזים נפתחים אחד-אחד; בקיט המודפס הם מופיעים בטבלת המנחה ליד כל תשובה.</p>
            </WobblyCard>
          </div>

          <div className="max-w-3xl">
            <h3 className="text-2xl font-bold mb-3">שאלות נפוצות על {base.title}</h3>
            <div className="space-y-4">{roomFaq.map((f) => <div key={f.q}><p className="font-bold">{f.q}</p><p className="leading-relaxed text-[var(--foreground)]/85">{f.a}</p></div>)}</div>
          </div>

          <div>
            <h3 className="text-2xl font-hand font-bold mb-4">חדרים קרובים ל{base.title}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => {
                const common = sharedSettings(item).map((s) => SETTING_LABELS[s]).filter(Boolean)
                return (
                  <Link key={item.id} to={'/tools/escape-rooms/' + item.id} className="block">
                    <WobblyCard hover padding="p-4" className="h-full">
                      <div className="text-3xl">{item.emoji}</div>
                      <h4 className="font-hand font-bold text-xl">{item.title}</h4>
                      <p className="text-sm">{ESCAPE_ROOM_GUIDES[item.id]?.hook}</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{item.audience}{common.length ? ` · גם הוא ל${common.join(', ')}` : ''}</p>
                    </WobblyCard>
                  </Link>
                )
              })}
            </div>
          </div>

          {(roomCollections.length > 0 || guide.links?.length > 0) && (
            <nav aria-label="עוד בנושא" className="flex flex-wrap gap-2">
              {roomCollections.map(([slug, c]) => <Link key={slug} to={'/tools/escape-rooms/topic/' + slug} className="btn-secondary">{c.emoji} {c.title}</Link>)}
              {(guide.links || []).map(([label, href]) => <Link key={href} to={href} className="btn-secondary">{label}</Link>)}
            </nav>
          )}
        </section>
      )}

      {!isRoomPage && (
        <div className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold mb-3">איך מפעילים חדר בריחה מודפס</h2>
          <ol className="list-decimal pr-5 space-y-1 leading-relaxed mb-8">{escapeRoomsHowTo.map((t) => <li key={t}>{t}</li>)}</ol>
          <SeoBody paragraphs={escapeRoomsBody} faq={escapeRoomsFaq} related={escapeRoomsRelated} />
          <h2 className="text-2xl font-bold mb-3 mt-8">כל {ESCAPE_ROOMS.length} חדרי הבריחה</h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1">{ESCAPE_ROOMS.map((item) => <li key={item.id}><Link to={'/tools/escape-rooms/' + item.id} className="underline">{item.emoji} {item.title}</Link> <span className="text-sm text-[var(--muted-foreground)]">· {item.audience}</span></li>)}</ul>
        </div>
      )}
    </div>
  )
}

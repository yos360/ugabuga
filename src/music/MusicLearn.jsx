import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import NotFound from '../pages/NotFound'
import Piano, { SOLFEGE, LETTER, WidePiano } from './Piano'
import { playPiano, playChord, strum, midi } from './audio'
import { MUSIC_CRUMB } from './MusicPages'
import './music.css'

// Plays a list of steps ({ notes: [midi…], d: beats }) and reports which keys are sounding,
// so the piano can light them up while the demo plays.
function useSequencer() {
  const [lit, setLit] = useState([])
  const [busy, setBusy] = useState(false)
  const timers = useRef([])
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; setLit([]); setBusy(false) }
  useEffect(() => stop, [])
  const play = (steps, bpm = 100) => {
    stop(); setBusy(true)
    const beat = 60 / bpm
    let t = 0
    for (const s of steps) {
      const at = t
      timers.current.push(setTimeout(() => { s.notes.forEach(n => playPiano(n, { duration: s.d * beat, velocity: s.v ?? 0.7 })); setLit(s.notes) }, at * 1000))
      t += s.d * beat
    }
    timers.current.push(setTimeout(() => { setLit([]); setBusy(false) }, t * 1000 + 200))
  }
  return { lit, busy, play, stop }
}
const N = (...names) => names.map(midi)
const seq = (text, d = 1) => text.trim().split(/\s+/).map(tok => { const [ns, dd] = tok.split('/'); return { notes: ns.split('+').map(midi), d: dd ? parseFloat(dd) : d } })
const marksOf = (lit, kind = 'chord') => Object.fromEntries(lit.map(n => [n, kind]))

// ── /music/read-notes ───────────────────────────────
// Treble staff: E4 sits on the bottom line. Diatonic step index from C4.
const NATURALS = [0, 2, 4, 5, 7, 9, 11]
const stepOf = n => Math.floor(n / 12) * 7 + NATURALS.indexOf(n % 12) - (5 * 7)
const LEVELS = {
  1: ['דו עד סול', N('C4', 'D4', 'E4', 'F4', 'G4')],
  2: ['אוקטבה שלמה', N('C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5')],
  3: ['כל החמשה', N('C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5')],
}
function Staff({ note, color = '#111' }) {
  const L = 10, gap = 10, bottom = 90, x = 170
  const y = note == null ? null : bottom - (stepOf(note) - 2) * gap / 2
  const ledgers = []
  if (note != null) {
    for (let s = 0; s >= stepOf(note); s -= 2) if (s < 2) ledgers.push(bottom - (s - 2) * gap / 2)
    for (let s = 12; s <= stepOf(note); s += 2) ledgers.push(bottom - (s - 2) * gap / 2)
  }
  return <svg viewBox="0 0 280 130" className="mx-auto w-full max-w-md" role="img" aria-label="חמשה עם תו">
    {[0, 1, 2, 3, 4].map(i => <line key={i} x1={L} x2={270} y1={bottom - i * gap} y2={bottom - i * gap} stroke="#333" strokeWidth={1.2} />)}
    {/* treble clef, drawn */}
    <path d="M52 112 C44 112 42 104 48 101 C54 99 57 106 52 108 M50 104 L60 26 C62 14 72 14 70 26 C68 40 40 52 40 72 C40 86 56 92 66 86 C76 79 72 64 60 64 C50 64 46 74 54 80" fill="none" stroke="#333" strokeWidth={2.4} strokeLinecap="round" />
    {ledgers.map(ly => <line key={ly} x1={x - 16} x2={x + 16} y1={ly} y2={ly} stroke="#333" strokeWidth={1.2} />)}
    {y != null && <g><ellipse cx={x} cy={y} rx={7.5} ry={5.5} transform={`rotate(-20 ${x} ${y})`} fill={color} />
      <line x1={stepOf(note) >= 6 ? x - 7 : x + 7} x2={stepOf(note) >= 6 ? x - 7 : x + 7} y1={y} y2={stepOf(note) >= 6 ? y + 32 : y - 32} stroke={color} strokeWidth={1.6} /></g>}
  </svg>
}

export function ReadNotes() {
  const [level, setLevel] = useState(1)
  const [note, setNote] = useState(null)
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 })
  const [fb, setFb] = useState(null)
  const pool = LEVELS[level][1]
  const nextNote = (prev) => { let n; do n = pool[Math.floor(Math.random() * pool.length)]; while (pool.length > 1 && n === prev); setNote(n); setFb(null) }
  // A new note whenever the level changes (and on first load).
  const [shownLevel, setShownLevel] = useState(null)
  if (shownLevel !== level) { setShownLevel(level); const p = LEVELS[level][1]; setNote(p[Math.floor(Math.random() * p.length)]); setFb(null) }
  const answer = pc => {
    if (note == null || fb?.ok) return
    const ok = pc === note % 12
    playPiano(note)
    setScore(s => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }))
    setFb({ ok, pc })
    if (ok) setTimeout(() => nextNote(note), 700)
  }
  const faq = [
    { q: 'איך זוכרים את התווים על החמשה?', a: 'על הקווים מלמטה למעלה: מי, סול, סי, רה, פה. ברווחים שבין הקווים: פה, לה, דו, מי. דו האמצעי יושב על קו עזר קטן מתחת לחמשה.' },
    { q: 'מה זה מפתח סול?', a: 'הסימן בתחילת החמשה. הוא מתחיל בקו השני מלמטה ואומר שעל הקו הזה נמצא התו סול. ככה יודעים איך לקרוא את כל שאר התווים.' },
  ]
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="קריאת תווים — משחק ללימוד תווים על החמשה" description="משחק קריאת תווים בחינם: תו מופיע על החמשה, ובוחרים את השם שלו או לוחצים על הקליד בפסנתר. 3 רמות, מדו האמצעי ועד כל החמשה, עם צליל לכל תשובה." path="/music/read-notes" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'קריאת תווים' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎼 </span>משחק קריאת תווים</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">איזה תו זה? לוחצים על השם או על הקליד בפסנתר</p>
    <div className="mb-4 flex flex-wrap justify-center gap-2">{Object.entries(LEVELS).map(([k, [l]]) => <button key={k} type="button" className="music-chip" aria-pressed={level === +k} onClick={() => { setLevel(+k); setScore({ right: 0, total: 0, streak: 0 }) }}>רמה {k}: {l}</button>)}</div>
    <div className="music-card text-center">
      <p className="mb-1 font-bold">✅ {score.right} מתוך {score.total}{score.streak >= 3 ? ` · 🔥 ${score.streak} ברצף!` : ''}</p>
      <Staff note={note} color={fb ? (fb.ok ? '#2e9e2b' : '#d33') : '#111'} />
      <p className="h-8 text-xl font-black" aria-live="polite">{fb ? (fb.ok ? `נכון! זה ${SOLFEGE[note % 12]} 🎉` : `לא בדיוק — זה לא ${SOLFEGE[fb.pc]}. נסו שוב`) : ' '}</p>
      <div className="my-3 flex flex-wrap justify-center gap-2" dir="rtl">{NATURALS.map(pc => <button key={pc} type="button" className="music-chip text-lg" onClick={() => answer(pc)}>{SOLFEGE[pc]} <small className="text-xs text-[var(--muted-foreground)]">{LETTER[pc]}</small></button>)}</div>
      <WidePiano from={60} to={84} fullscreen={false} labels="none" onPress={n => answer(n % 12)} marks={fb?.ok ? { [note]: 'right' } : {}} />
    </div>
    <div className="mt-10"><SeoBody paragraphs={['קריאת תווים היא כמו קריאת אותיות: בהתחלה מפענחים כל תו לאט, ועם התרגול מזהים אותו במבט. המשחק מראה תו אחד בכל פעם על החמשה, ועונים בלחיצה על השם שלו או ישר על הקליד בפסנתר — כך מתחבר הסימן על הדף למקום על הכלי.', 'מתחילים ברמה 1 עם חמשת התווים הראשונים, מדו האמצעי ועד סול — אלה התווים של רוב השירים הראשונים. ברמה 2 עוברים לאוקטבה שלמה, וברמה 3 לכל החמשה עם קווי עזר.']} faq={faq} related={[{ label: 'שירים לפסנתר', href: '/music/songs' }, { label: 'דף תווים ריק להדפסה', href: '/printables/music-paper' }, { label: 'מושגים במוזיקה', href: '/music/concepts' }]} /></div>
  </div>
}

// ── Guitar chords ───────────────────────────────
// frets low E → high e; 'x' = not played. Open strings: E2 A2 D3 G3 B3 E4.
const OPEN = [40, 45, 50, 55, 59, 64]
export const CHORDS = [
  ['c', 'C', 'דו מז׳ור', 'x32010'], ['d', 'D', 'רה מז׳ור', 'xx0232'], ['e', 'E', 'מי מז׳ור', '022100'], ['g', 'G', 'סול מז׳ור', '320003'],
  ['a', 'A', 'לה מז׳ור', 'x02220'], ['f', 'F', 'פה מז׳ור', '133211'], ['am', 'Am', 'לה מינור', 'x02210'], ['em', 'Em', 'מי מינור', '022000'],
  ['dm', 'Dm', 'רה מינור', 'xx0231'], ['bm', 'Bm', 'סי מינור', 'x24432'], ['e7', 'E7', 'מי 7', '020100'], ['a7', 'A7', 'לה 7', 'x02020'],
  ['d7', 'D7', 'רה 7', 'xx0212'], ['g7', 'G7', 'סול 7', '320001'], ['b7', 'B7', 'סי 7', 'x21202'], ['c7', 'C7', 'דו 7', 'x32310'],
]
const chordNotes = frets => [...frets].map((f, i) => (f === 'x' ? null : OPEN[i] + +f)).filter(n => n != null)
function ChordDiagram({ frets, name }) {
  const fs = [...frets].map(f => (f === 'x' ? null : +f)), played = fs.filter(f => f > 0)
  const minF = played.length ? Math.min(...played) : 1, start = Math.max(...fs.filter(f => f != null)) > 4 ? minF : 1
  const barre = [...frets].filter(f => f === String(minF)).length >= 3 && minF > 0 && fs[0] === minF ? minF : null
  const X = i => 20 + i * 16, Y = f => 22 + (f - start + 0.5) * 20
  return <svg viewBox="0 0 120 130" className="w-full max-w-[180px]" role="img" aria-label={`דיאגרמת אקורד ${name}`}>
    {[0, 1, 2, 3, 4, 5].map(i => <line key={i} x1={X(i)} x2={X(i)} y1={22} y2={122} stroke="#333" strokeWidth={1} />)}
    {[0, 1, 2, 3, 4, 5].map(j => <line key={j} x1={X(0)} x2={X(5)} y1={22 + j * 20} y2={22 + j * 20} stroke="#333" strokeWidth={j === 0 && start === 1 ? 4 : 1} />)}
    {start > 1 && <text x={4} y={Y(start) + 4} fontSize="10" fontWeight="700">{start}</text>}
    {barre && <rect x={X(0) - 6} y={Y(barre) - 6} width={X(5) - X(0) + 12} height={12} rx={6} fill="#1d2233" />}
    {fs.map((f, i) => f == null ? <text key={i} x={X(i)} y={16} fontSize="11" textAnchor="middle">✕</text>
      : f === 0 ? <circle key={i} cx={X(i)} cy={12} r={4} fill="none" stroke="#333" strokeWidth={1.2} />
      : barre === f ? null : <circle key={i} cx={X(i)} cy={Y(f)} r={6.5} fill="#1d2233" />)}
  </svg>
}
function ChordCard({ c, big = false }) {
  const [slug, name, he, frets] = c
  return <div className={`music-card text-center ${big ? '' : 'card-lift'}`}>
    <h2 className={big ? 'text-3xl font-black' : 'text-2xl font-black'} dir="ltr">{name}</h2>
    <p className="text-[var(--muted-foreground)]">{he}</p>
    <div className="mx-auto my-2 flex justify-center"><ChordDiagram frets={frets} name={name} /></div>
    <div className="flex flex-wrap justify-center gap-2">
      <button type="button" className="music-chip" onClick={() => strum(chordNotes(frets))}>🎸 שמיעה</button>
      {!big && <Link className="music-chip" to={`/music/guitar-chords/${slug}`}>הסבר ←</Link>}
    </div>
  </div>
}
export function GuitarChords() {
  const faq = [
    { q: 'מאיזה אקורדים כדאי להתחיל?', a: 'מי מינור (Em) ולה מינור (Am) הכי קלים, ואחריהם דו (C), סול (G) ורה (D). עם חמשת האלה כבר אפשר לנגן מאות שירים.' },
    { q: 'איך קוראים דיאגרמת אקורד?', a: 'הקווים האנכיים הם המיתרים — משמאל המיתר העבה. הקווים האופקיים הם השריגים. עיגול מלא = שמים אצבע, עיגול ריק = מיתר פתוח, ✕ = לא פורטים על המיתר הזה.' },
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="אקורדים לגיטרה למתחילים — דיאגרמות ושמיעה" description="16 אקורדים בסיסיים לגיטרה עם דיאגרמה ברורה והשמעה: דו, רה, מי, סול, לה, לה מינור, מי מינור, רה מינור ואקורדי 7. מדריך למתחילים בעברית." path="/music/guitar-chords" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'אקורדים לגיטרה' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎸 </span>אקורדים לגיטרה למתחילים</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">איפה שמים את האצבעות — ולוחצים לשמוע איך זה צריך להישמע</p>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{CHORDS.map(c => <ChordCard key={c[0]} c={c} />)}</div>
    <div className="mt-10"><SeoBody paragraphs={['אקורד הוא כמה תווים שמנגנים ביחד. בגיטרה בונים אותו כששמים אצבעות על כמה מיתרים ופורטים על כולם. בכל דיאגרמה רואים את ששת המיתרים — העבה בצד שמאל — ואיפה בדיוק לשים כל אצבע.', 'לחיצה על "שמיעה" מנגנת את האקורד כמו פריטה על גיטרה, כך שאפשר להשוות לצליל שיוצא אצלכם. אם משהו נשמע עמום, בדרך כלל אצבע נוגעת במיתר הסמוך — מרימים מעט את האצבעות ומכופפים אותן יותר.']} faq={faq} related={[{ label: 'מושגים במוזיקה', href: '/music/concepts' }, { label: 'סגנונות מוזיקה', href: '/music/styles' }]} /></div>
  </div>
}
export function GuitarChord() {
  const { chord } = useParams()
  const c = CHORDS.find(x => x[0] === chord)
  if (!c) return <NotFound />
  const [, name, he, frets] = c
  const notes = chordNotes(frets), pcs = [...new Set(notes.map(n => n % 12))]
  const minor = name.includes('m') && !name.includes('maj'), seventh = name.includes('7')
  const faq = [
    { q: `אילו תווים יש באקורד ${name}?`, a: `${pcs.map(p => SOLFEGE[p]).join(', ')} (${pcs.map(p => LETTER[p]).join(' ')}).` },
    { q: `איך פורטים ${he}?`, a: [...frets].map((f, i) => `מיתר ${6 - i}: ${f === 'x' ? 'לא פורטים' : f === '0' ? 'פתוח' : `שריג ${f}`}`).join(' · ') + '.' },
  ]
  return <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`אקורד ${he} (${name}) בגיטרה — דיאגרמה ושמיעה`} description={`איך מנגנים אקורד ${he} (${name}) בגיטרה: דיאגרמה עם מיקום האצבעות, התווים שבאקורד והשמעה. מדריך למתחילים בעברית.`} path={`/music/guitar-chords/${c[0]}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'אקורדים לגיטרה', href: '/music/guitar-chords' }, { label: name }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-6">אקורד {he} <span dir="ltr">({name})</span></h1>
    <div className="mx-auto max-w-xs"><ChordCard c={c} big /></div>
    <div className="music-card mt-6"><p className="mb-2 text-center font-bold">אותו אקורד בפסנתר</p><Piano from={36} to={72} labels="solfege" marks={Object.fromEntries(notes.map(n => [n, 'chord']))} keyboard={false} /><div className="mt-3 text-center"><button type="button" className="music-chip" onClick={() => playChord(notes, { duration: 1.5 })}>🎹 שמיעה בפסנתר</button></div></div>
    <div className="mt-10"><SeoBody paragraphs={[`אקורד ${he} בנוי מהתווים ${pcs.map(p => SOLFEGE[p]).join(', ')}. ${seventh ? 'זה אקורד 7 — יש בו תו רביעי שנותן תחושה של "עוד רגע ממשיכים", ולכן הוא מופיע הרבה רגע לפני החזרה לאקורד הבית.' : minor ? 'זה אקורד מינור, ולכן הוא נשמע רך ועצוב יותר מאקורד מז׳ור.' : 'זה אקורד מז׳ור — הוא נשמע בהיר ושמח.'}`, 'בדיאגרמה המיתר העבה נמצא בצד שמאל. פורטים רק על המיתרים שלא מסומנים ב-✕, ומקפידים שכל אצבע תלחץ קרוב לשריג — ככה הצליל יוצא נקי.']} faq={faq} related={[{ label: 'כל האקורדים', href: '/music/guitar-chords' }, { label: 'פסנתר אונליין', href: '/music/piano' }]} /></div>
  </div>
}

// ── /music/concepts ───────────────────────────────
const C_MAJOR = 'C4 D4 E4 F4 G4 A4 B4 C5', A_MINOR = 'A3 B3 C4 D4 E4 F4 G4 A4'
const CONCEPTS = [
  ['תו', 'צליל אחד בגובה מסוים. יש 7 תווים בסיסיים: דו, רה, מי, פה, סול, לה, סי — ואחריהם חוזרים לדו.', seq(C_MAJOR, 0.5)],
  ['אוקטבה', 'המרחק בין תו לאותו תו בגובה הבא — למשל מדו לדו הבא. שני הצלילים נשמעים "אותו דבר", רק אחד גבוה מהשני.', seq('C4/1 C5/1 C3/1 C4/1')],
  ['סולם מז׳ור', 'שבעה תווים בסדר קבוע של מרחקים. נשמע שמח ופתוח. סולם דו מז׳ור הוא כל הקלידים הלבנים מדו עד דו.', seq(C_MAJOR, 0.5)],
  ['סולם מינור', 'סדר מרחקים אחר, שנשמע עצוב, מסתורי או רציני. סולם לה מינור הוא הקלידים הלבנים מלה עד לה.', seq(A_MINOR, 0.5)],
  ['מז׳ור מול מינור', 'ההבדל הוא תו אחד באמצע האקורד. שומעים קודם דו מז׳ור ואז דו מינור — מרגישים את ההבדל?', seq('C4+E4+G4/2 C4+Eb4+G4/2')],
  ['אקורד', 'שלושה תווים או יותר שמנגנים ביחד. רוב השירים בנויים על 3–4 אקורדים שחוזרים.', seq('C4+E4+G4 F4+A4+C5 G4+B4+D5 C4+E4+G4/2')],
  ['מלודיה והרמוניה', 'מלודיה היא המנגינה שאפשר לשיר. הרמוניה היא האקורדים שמלווים אותה ונותנים לה צבע.', seq('E4 D4 C4 D4 E4 E4 E4/2 C3+E4 G3+D4 C3+C4 G3+D4 C3+E4 C3+E4 C3+E4/2')],
  ['טמפו', 'המהירות של המוזיקה, נמדדת בפעימות לדקה (BPM). אותה מנגינה מרגישה אחרת לגמרי לאט ומהר.', [...seq('C4 E4 G4 C5', 1), ...seq('C4 E4 G4 C5', 0.3)]],
  ['משקל', 'כמה פעימות יש בכל תיבה. ב-4/4 סופרים 1-2-3-4 (כמו מארש), ב-3/4 סופרים 1-2-3 (כמו ואלס).', [...seq('C3/1 G4/1 G4/1 G4/1 C3/1 G4/1 G4/1 G4/1'), ...seq('C3/1 E4/1 E4/1 C3/1 E4/1 E4/1')]],
  ['דיאז ובמול', 'דיאז (#) מגביה תו בחצי טון — הקליד השחור מימין. במול (♭) מנמיך בחצי טון — הקליד השחור משמאל.', seq('F4/1 F#4/1 B4/1 Bb4/1')],
  ['מרווח', 'המרחק בין שני תווים. מרווחים שונים יוצרים תחושות שונות — קטן ונעים, גדול ונפתח, או מתוח.', seq('C4+D4/1.5 C4+E4/1.5 C4+G4/1.5 C4+B4/1.5 C4+C5/1.5')],
  ['דינמיקה', 'חזק או חלש. פורטה (f) זה חזק, פיאנו (p) זה חלש — מכאן השם המלא של הפסנתר: "פיאנופורטה".', [...seq('C4+E4+G4/1').map(s => ({ ...s, v: 0.15 })), ...seq('C4+E4+G4/1').map(s => ({ ...s, v: 1 }))]],
]
export function Concepts() {
  const sq = useSequencer()
  const [open, setOpen] = useState(null)
  const faq = CONCEPTS.slice(0, 5).map(([t, d]) => ({ q: `מה זה ${t}?`, a: d }))
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מושגים במוזיקה לילדים — עם הדגמה שומעים" description="מילון מושגים במוזיקה בעברית: תו, אוקטבה, סולם מז׳ור ומינור, אקורד, מלודיה והרמוניה, טמפו, משקל, דיאז ובמול — כל מושג עם הדגמה בפסנתר." path="/music/concepts" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'מושגים במוזיקה' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📖 </span>מושגים במוזיקה</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">קוראים הסבר קצר — ולוחצים לשמוע אותו בפסנתר</p>
    <div className="music-card sticky top-2 z-10 mb-6"><Piano from={48} to={84} labels="solfege" marks={marksOf(sq.lit)} keyboard={false} /></div>
    <div className="space-y-3">{CONCEPTS.map(([t, d, steps], i) => <section key={t} className="music-card">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">{t}</h2>
        <button type="button" className="music-chip" onClick={() => { setOpen(i); sq.play(steps, 100) }}>{sq.busy && open === i ? '🔊 מנגן…' : '▶️ לשמוע'}</button></div>
      <p className="mt-2 text-lg">{d}</p>
    </section>)}</div>
    <div className="mt-10"><SeoBody paragraphs={['מושגים במוזיקה נשמעים מסובכים, אבל כשהם מתנגנים מול האוזניים — הם פשוטים. בכל מושג כאן יש הסבר של שניים-שלושה משפטים וכפתור שמנגן הדגמה, והקלידים בפסנתר נדלקים כדי לראות בדיוק מה מתנגן.', 'המושגים מסודרים מהבסיס: תו ואוקטבה, סולמות ואקורדים, ואחר כך קצב, משקל ודינמיקה. זה מתאים לשיעור מוזיקה בכיתה, להכנה לשיעור נגינה, או סתם לסקרנים.']} faq={faq} related={[{ label: 'סגנונות מוזיקה', href: '/music/styles' }, { label: 'קריאת תווים', href: '/music/read-notes' }]} /></div>
  </div>
}

// ── /music/styles ───────────────────────────────
const BLUES = 'C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 F3+F4+A4+Eb5/2 F3+F4+A4+Eb5/2 C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 G3+F4+B4+D5/2 F3+F4+A4+Eb5/2 C3+E4+G4+Bb4/2 G3+F4+B4+D5/2'
const STYLES = [
  ['blues', '🎷', 'בלוז', 'נולד בדרום ארצות הברית בסוף המאה ה-19. בנוי על 12 תיבות שחוזרות, ועל "תווים כחולים" שנשמעים קצת עצובים וקצת מתגרים.', 'מהלך 12 התיבות של הבלוז בדו', seq(BLUES, 1), 120, 'סולם הבלוז', seq('C4 Eb4 F4 F#4 G4 Bb4 C5/2', 0.5)],
  ['jazz', '🎺', 'ג׳אז', 'יצא מהבלוז בניו אורלינס בתחילת המאה ה-20. אקורדים עשירים עם 4–5 תווים, וחופש לאלתר — כל ביצוע קצת שונה.', 'המהלך הכי מפורסם בג׳אז: II–V–I', seq('D3+F4+A4+C5/2 G3+F4+B4+D5/2 C3+E4+G4+B4/4'), 90, 'אקורד ג׳אזי מול אקורד רגיל', seq('C4+E4+G4/2 C3+E4+G4+B4+D5/2')],
  ['classical', '🎻', 'קלאסי', 'מוזיקה של מלחינים כמו באך, מוצרט ובטהובן. הרבה פעמים יד שמאל מנגנת ליווי קבוע — למשל "בס אלברטי" — ויד ימין שרה מעליו.', 'בס אלברטי (כמו אצל מוצרט)', seq('C3 G3 E3 G3 C3 G3 E3 G3 B2 G3 D3 G3 C3 G3 E3 G3', 0.5), 110, 'מנגינה מעל הליווי', seq('C3+C5 G3 E3+E5 G3 C3+G5/0.5 G3/0.5 E3/0.5 G3/0.5 B2+F5 G3 D3+D5 G3 C3+C5/2', 0.5)],
  ['rock', '🎸', 'רוק', 'קצב חזק ונגינה של "פאוור קורדס" — אקורדים של שני תווים בלבד, שנשמעים עוצמתיים במיוחד בגיטרה חשמלית.', 'ריף רוק בפאוור קורדס', seq('E3+B3/0.5 E3+B3/0.5 G3+D4 A3+E4/1.5 E3+B3/0.5 E3+B3/0.5 G3+D4 Bb3+F4/0.5 A3+E4/1.5', 1), 120, 'פאוור קורד מול אקורד מלא', seq('C3+G3/2 C3+E3+G3/2')],
  ['pop', '🎤', 'פופ', 'רוב שירי הפופ בנויים על ארבעה אקורדים שחוזרים — I–V–vi–IV. בדו: דו, סול, לה מינור, פה. מאות להיטים משתמשים בדיוק במהלך הזה.', 'ארבעת האקורדים של הפופ', seq('C3+C4+E4+G4/2 G2+B3+D4+G4/2 A2+C4+E4+A4/2 F2+C4+F4+A4/2 C3+C4+E4+G4/2 G2+B3+D4+G4/2 A2+C4+E4+A4/2 F2+C4+F4+A4/2'), 100, 'הבס בלבד', seq('C3/2 G2/2 A2/2 F2/2')],
  ['mizrahi', '🪘', 'מזרחי', 'מוזיקה מהמזרח התיכון ומצפון אפריקה. משתמשת בסולמות אחרים — כמו "חיג׳אז", עם מרווח גדול ומיוחד בין התו השני לשלישי — וקישוטים רבים במנגינה.', 'סולם חיג׳אז מרה', seq('D4 Eb4 F#4 G4 A4 Bb4 C5 D5/2 C5 Bb4 A4 G4 F#4 Eb4 D4/2', 0.5), 110, 'מנגינה קצרה בחיג׳אז', seq('D4/0.5 Eb4/0.5 F#4 G4/0.5 F#4/0.5 Eb4/0.5 D4/0.5 A4 Bb4/0.5 A4/0.5 G4/0.5 F#4/0.5 G4/0.5 F#4/0.5 Eb4/0.5 D4/2')],
]
export function Styles() {
  const sq = useSequencer()
  const [active, setActive] = useState(null)
  const faq = [{ q: 'מה ההבדל בין בלוז לג׳אז?', a: 'הבלוז הוא הבסיס — 12 תיבות ושלושה אקורדים. הג׳אז התפתח ממנו עם אקורדים עשירים יותר והרבה אלתור.' }, { q: 'למה כל שירי הפופ נשמעים דומים?', a: 'כי רבים מהם בנויים על אותו מהלך של ארבעה אקורדים (I–V–vi–IV). המנגינה והמילים שונות, אבל השלד זהה.' }]
  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="סגנונות מוזיקה לילדים — בלוז, ג׳אז, קלאסי, רוק, פופ ומזרחי" description="מכירים סגנונות מוזיקה ומנגנים אותם: מהלך הבלוז, ה-II–V–I של הג׳אז, בס אלברטי קלאסי, ריף רוק, ארבעת אקורדי הפופ וסולם חיג׳אז מזרחי — עם פסנתר שנדלק." path="/music/styles" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'סגנונות מוזיקה' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎷 </span>סגנונות מוזיקה</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">כל סגנון — הסבר קצר, ומה שמייחד אותו מתנגן בפסנתר</p>
    <div className="music-card sticky top-2 z-10 mb-6"><Piano from={36} to={84} labels="none" marks={marksOf(sq.lit)} keyboard={false} /></div>
    <div className="space-y-4">{STYLES.map(([id, e, t, d, l1, s1, bpm, l2, s2]) => <section key={id} id={id} className="music-card">
      <h2 className="text-2xl font-black"><span aria-hidden="true">{e} </span>{t}</h2>
      <p className="mt-2 text-lg">{d}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="music-chip" onClick={() => { setActive(id + 1); sq.play(s1, bpm) }}>{sq.busy && active === id + 1 ? '🔊' : '▶️'} {l1}</button>
        <button type="button" className="music-chip" onClick={() => { setActive(id + 2); sq.play(s2, bpm) }}>{sq.busy && active === id + 2 ? '🔊' : '▶️'} {l2}</button>
        {sq.busy && (active === id + 1 || active === id + 2) && <button type="button" className="music-chip" onClick={sq.stop}>⏹️ עצירה</button>}
      </div>
    </section>)}</div>
    <div className="mt-10"><SeoBody paragraphs={['כל סגנון מוזיקה הוא בעצם אוסף של הרגלים: אילו אקורדים בוחרים, איזה קצב, ואילו סולמות. כשמכירים את ההרגלים האלה — מזהים סגנון תוך שניות, ויכולים גם לנגן "בסגנון" בעצמכם.', 'בכל סגנון כאן יש שתי דוגמאות קצרות שמתנגנות בפסנתר, והקלידים נדלקים כדי לראות בדיוק מה מנגנים. אפשר לנסות לנגן אותן אחר כך בפסנתר החופשי.']} faq={faq} related={[{ label: 'מושגים במוזיקה', href: '/music/concepts' }, { label: 'פסנתר אונליין', href: '/music/piano' }, { label: 'אקורדים לגיטרה', href: '/music/guitar-chords' }]} /></div>
  </div>
}


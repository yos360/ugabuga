import { useEffect, useMemo, useRef, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Piano from '../Piano'
import { audio, audioTime, midi, playDrum, playPiano } from '../audio'
import { MUSIC_CRUMB } from '../MusicPages'
import { GROOVES, JAZZ_CHORDS, ROOTS, SCALES, formula, scaleById, scaleNotes } from './scales'
import '../music.css'
import './styles.css'

const seq = (text, d = 1) => text.trim().split(/\s+/).map(tok => { const [ns, dd] = tok.split('/'); return { notes: ns.split('+').map(midi), d: dd ? parseFloat(dd) : d } })
const BLUES = 'C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 F3+F4+A4+Eb5/2 F3+F4+A4+Eb5/2 C3+E4+G4+Bb4/2 C3+E4+G4+Bb4/2 G3+F4+B4+D5/2 F3+F4+A4+Eb5/2 C3+E4+G4+Bb4/2 G3+F4+B4+D5/2'

// id, emoji, name, colour, what it is, signature demo label + steps + bpm, the scale to jam with
const STYLES = [
  ['blues', '🎷', 'בלוז', '#cfe3ff', 'נולד בדרום ארצות הברית בסוף המאה ה-19. 12 תיבות שחוזרות, קצב "מתנדנד" (סווינג), ו"תווים כחולים" שנשמעים קצת עצובים וקצת מתגרים.', 'מהלך 12 התיבות', seq(BLUES, 1), 120, 'blues'],
  ['jazz', '🎺', 'ג׳אז', '#ffe1c2', 'יצא מהבלוז בניו אורלינס. אקורדים עשירים של 4–5 תווים, סווינג, ואלתור — כל ביצוע אחר. המהלך הכי מפורסם: II–V–I.', 'II–V–I', seq('D3+F4+A4+C5/2 G3+F4+B4+D5/2 C3+E4+G4+B4/4'), 90, 'dorian'],
  ['classical', '🎻', 'קלאסי', '#efe2ff', 'באך, מוצרט ובטהובן. יד שמאל מנגנת ליווי קבוע — למשל "בס אלברטי" — ויד ימין שרה מעליו.', 'בס אלברטי', seq('C3 G3 E3 G3 C3 G3 E3 G3 B2 G3 D3 G3 C3 G3 E3 G3', 0.5), 110, 'harmonic'],
  ['rock', '🎸', 'רוק', '#ffd0d0', 'תופים חזקים ו"פאוור קורדס" — אקורדים של שני תווים שנשמעים עוצמתיים בגיטרה חשמלית. הסולו? כמעט תמיד בפנטטוני מינור.', 'ריף רוק', seq('E3+B3/0.5 E3+B3/0.5 G3+D4 A3+E4/1.5 E3+B3/0.5 E3+B3/0.5 G3+D4 Bb3+F4/0.5 A3+E4/1.5', 1), 120, 'penta-minor'],
  ['pop', '🎤', 'פופ', '#ffe9a8', 'רוב להיטי הפופ בנויים על ארבעה אקורדים: I–V–vi–IV (דו, סול, לה מינור, פה). המנגינה משתנה — השלד זהה.', '4 האקורדים של הפופ', seq('C3+C4+E4+G4/2 G2+B3+D4+G4/2 A2+C4+E4+A4/2 F2+C4+F4+A4/2'), 100, 'penta-major'],
  ['mizrahi', '🪘', 'מזרחי', '#d9f5d0', 'מוזיקה מהמזרח התיכון ומצפון אפריקה: סולמות כמו חיג׳אז, קצבים של דרבוקה, והרבה סלסולים במנגינה.', 'מנגינה בחיג׳אז', seq('D4/0.5 Eb4/0.5 F#4 G4/0.5 F#4/0.5 Eb4/0.5 D4/0.5 A4 Bb4/0.5 A4/0.5 G4/0.5 F#4/0.5 G4/0.5 F#4/0.5 Eb4/0.5 D4/2'), 110, 'hijaz'],
  ['funk', '🕺', 'פאנק', '#ffd6f2', 'ג׳יימס בראון והגרוב: הכול בשביל הקצב. אקורד 9 קצר וחד, בס שקופץ, ותופים שאי אפשר לא לרקוד אליהם.', 'אקורד הפאנק', seq('E3+D4+G#4+B4+F#5/0.5 E3+D4+G#4+B4+F#5/0.5 E3+D4+G#4+B4+F#5/1', 1), 100, 'dorian'],
  ['bossa', '🌴', 'בוסה נובה', '#c9f0ec', 'נולד בברזיל — סמבה רגועה עם אקורדי ג׳אז. הכי מפורסם: "הנערה מאיפנמה".', 'אקורדי בוסה', seq('C3+E4+G4+A4+D5/2 D3+F4+A4+C5/2 G2+F4+B4+D5/2 C3+E4+G4+B4/2'), 100, 'lydian'],
]
const STYLE_ROOT = { blues: 60, jazz: 62, classical: 60, rock: 64, pop: 60, mizrahi: 62, funk: 64, bossa: 60 }

// Loops a style groove (drums + one chord per bar) on the AudioContext clock until stopped.
function useGroove(onBar) {
  const [playing, setPlaying] = useState(null)
  const timer = useRef(0), next = useRef(0), step = useRef(0), cb = useRef(onBar)
  useEffect(() => { cb.current = onBar })
  const stop = () => { clearInterval(timer.current); timer.current = 0; setPlaying(null); cb.current?.(null) }
  useEffect(() => () => clearInterval(timer.current), [])
  const start = (id, g = GROOVES[id]) => {
    stop()
    if (!g || !audio()) return
    const sixteenth = 60 / g.bpm / 4
    next.current = audioTime() + 0.08; step.current = 0
    setPlaying(id)
    timer.current = setInterval(() => {
      while (next.current < audioTime() + 0.15) {
        const s = step.current, i = s % 16, bar = Math.floor(s / 16) % g.chords.length
        const at = next.current + (g.swing && i % 4 === 2 ? sixteenth * 0.33 : 0)
        for (const [kind, key] of [['kick', 'k'], ['snare', 's'], ['hat', 'h'], ['ride', 'r']]) if (g.drums[key]?.[i] === 'x') playDrum(kind, at, i % 4 === 0 ? 1 : 0.7)
        if (i === 0) {
          const notes = g.chords[bar], delay = (at - audioTime()) * 1000
          notes.forEach(n => playPiano(n, { when: at - audioTime(), duration: sixteenth * 14, velocity: 0.45 }))
          setTimeout(() => cb.current?.(notes), Math.max(0, delay))
        }
        if (id === 'classical' && i % 2 === 0) { const ch = g.chords[bar]; playPiano(ch[[1, 3, 2, 3][(i / 2) % 4] % ch.length], { when: at - audioTime(), duration: sixteenth * 2, velocity: 0.35 }) } // Alberti bass
        next.current += sixteenth; step.current++
      }
    }, 25)
  }
  return { playing, start, stop }
}

// Plays a short list of steps, lighting keys as it goes.
function useDemo(setLit) {
  const timers = useRef([])
  const [busy, setBusy] = useState(null)
  const stop = () => { timers.current.forEach(clearTimeout); timers.current = []; setBusy(null); setLit([]) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const play = (key, steps, bpm = 100, light = true) => {
    stop(); setBusy(key)
    const beat = 60 / bpm; let t = 0
    for (const s of steps) {
      const at = t
      timers.current.push(setTimeout(() => { s.notes.forEach(n => playPiano(n, { duration: s.d * beat, velocity: s.v ?? 0.7 })); if (light) setLit(s.notes) }, at * 1000))
      t += s.d * beat
    }
    timers.current.push(setTimeout(() => { setLit([]); setBusy(null) }, t * 1000 + 200))
  }
  return { busy, play, stop }
}

// Phones get two octaves without labels — 39 labelled keys don't fit a narrow screen.
function useNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches)
  useEffect(() => {
    const m = window.matchMedia?.('(max-width: 640px)'); if (!m) return undefined
    const on = () => setNarrow(m.matches); m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return narrow
}

const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1])
const QUIZ_POOL = ['major', 'minor', 'blues', 'hijaz', 'whole-tone', 'penta-major', 'dorian']

export default function StylesPage() {
  const [lit, setLit] = useState([])
  const [root, setRoot] = useState(60)
  const [scaleId, setScaleId] = useState('blues')
  const [jam, setJam] = useState(false)
  const [quiz, setQuiz] = useState(null) // { answer, options, root, picked }
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 })
  const narrow = useNarrow()
  const demo = useDemo(setLit)
  const groove = useGroove(notes => setLit(notes || []))
  const scale = scaleById(scaleId)
  const notes = useMemo(() => scaleNotes(root, scale), [root, scale])
  const inScale = useMemo(() => new Set(scale.steps.map(s => (root + s) % 12)), [root, scale])

  const marks = {}
  for (let n = 48; n <= 86; n++) if (inScale.has(n % 12)) marks[n] = n % 12 === root % 12 ? 'chord' : 'right'
  for (const n of lit) marks[n] = 'play'

  const stopAll = () => { demo.stop(); groove.stop(); setJam(false) }
  const playScale = () => { groove.stop(); setJam(false); demo.play('scale', [...notes, ...notes.slice(0, -1).reverse()].map(n => ({ notes: [n], d: 0.5 })), 120) }
  const startJam = () => {
    demo.stop()
    // a two-chord vamp built from the scale's own backing chords, under the kid's improvisation
    const g = GROOVES[scale.id === 'blues' || scale.id === 'penta-minor' ? 'blues' : ['dorian', 'mixolydian', 'bebop', 'whole-tone', 'lydian'].includes(scale.id) ? 'jazz' : ['hijaz', 'double-harmonic'].includes(scale.id) ? 'mizrahi' : 'pop']
    groove.start('jam', { ...g, chords: scale.backing.map(c => c.map(s => root - 12 + s)) }); setJam(true)
  }
  const pickStyle = id => { const s = STYLES.find(x => x[0] === id); setScaleId(s[8]); setRoot(STYLE_ROOT[id]); document.getElementById('scale-lab')?.scrollIntoView({ behavior: 'smooth' }) }

  const newQuiz = () => {
    stopAll()
    const answer = QUIZ_POOL[Math.floor(Math.random() * QUIZ_POOL.length)]
    const options = shuffle([answer, ...shuffle(QUIZ_POOL.filter(x => x !== answer)).slice(0, 2)])
    const r = 57 + Math.floor(Math.random() * 7)
    setQuiz({ answer, options, root: r, picked: null })
    playQuiz(answer, r)
  }
  // by ear only: the keys don't light up
  const playQuiz = (id, r) => { const ns = scaleNotes(r, scaleById(id)); demo.play('quiz', [...ns, ...ns.slice(0, -1).reverse()].map(n => ({ notes: [n], d: 0.5 })), 130, false) }
  const answerQuiz = id => {
    if (quiz.picked) return
    const ok = id === quiz.answer
    setQuiz({ ...quiz, picked: id })
    setScore(s => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1, streak: ok ? s.streak + 1 : 0 }))
  }

  const faq = [
    { q: 'מה ההבדל בין בלוז לג׳אז?', a: 'הבלוז הוא הבסיס — 12 תיבות ושלושה אקורדים. הג׳אז התפתח ממנו עם אקורדים עשירים יותר, סווינג והרבה אלתור.' },
    { q: 'איזה סולם מנגנים בג׳אז?', a: 'אין סולם אחד. הכי נפוצים: דורי (מינור עם קריצה), מיקסולידי (על אקורד דומיננט), סולם הבלוז, סולם הביבופ ובמקומות חלומיים — טונים שלמים. במעבדת הסולמות אפשר לשמוע כל אחד מהם ולנגן עליו עם ליווי.' },
    { q: 'מה זה סולם פנטטוני?', a: 'סולם של 5 תווים בלבד. אין בו חצאי טונים "מתנגשים", ולכן כמעט כל תו שמנגנים בו נשמע טוב — מושלם להתחלת אלתור.' },
    { q: 'למה כל שירי הפופ נשמעים דומים?', a: 'כי רבים מהם בנויים על אותו מהלך של ארבעה אקורדים (I–V–vi–IV). המנגינה והמילים שונות, אבל השלד זהה.' },
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="סגנונות מוזיקה וסולמות — בלוז, ג׳אז, רוק, מזרחי ועוד, עם תופים ופסנתר" description="מכירים סגנונות מוזיקה ומנגנים אותם: גרוב עם תופים לכל סגנון, מעבדת סולמות (בלוז, דורי של ג׳אז, ביבופ, חיג׳אז, פנטטוני ועוד) עם ליווי לאלתור, אקורדי ג׳אז וחידון שמיעה." path="/music/styles" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'סגנונות מוזיקה' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎷 </span>סגנונות מוזיקה וסולמות</h1>
    <p className="text-center font-hand text-xl text-[var(--muted-foreground)] mb-6">מפעילים גרוב, שומעים מה מייחד כל סגנון — ומאלתרים עליו בעצמכם</p>

    <div className="music-card sticky top-2 z-10 mb-6 sty-piano">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm font-bold"><span>🟨 תו הבית · 🟩 תווים בסולם · 🟦 מתנגן עכשיו</span>
        {(groove.playing || demo.busy) && <button type="button" className="music-chip !min-h-[36px]" onClick={stopAll}>⏹️ עצירה</button>}</div>
      <Piano from={narrow ? 55 : 48} to={narrow ? 79 : 86} labels={narrow ? 'none' : 'solfege'} marks={marks} keyboard />
    </div>

    <h2 className="sty-h2">🎧 מכונת הגרוב — 8 סגנונות</h2>
    <div className="grid gap-4 sm:grid-cols-2">{STYLES.map(([id, e, t, color, d, l1, s1, bpm]) => <section key={id} id={id} className={`sty-card${groove.playing === id ? ' is-on' : ''}`} style={{ '--sty': color }}>
      <h3 className="text-2xl font-black"><span aria-hidden="true" className={groove.playing === id ? 'sty-bounce' : ''}>{e} </span>{t}</h3>
      <p className="mt-2 text-lg">{d}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="music-chip" aria-pressed={groove.playing === id} onClick={() => (groove.playing === id ? stopAll() : (demo.stop(), setJam(false), groove.start(id)))}>{groove.playing === id ? '⏹️ עצירת הגרוב' : '🥁 הפעלת הגרוב'}</button>
        <button type="button" className="music-chip" onClick={() => { groove.stop(); setJam(false); demo.play(id, s1, bpm) }}>{demo.busy === id ? '🔊' : '▶️'} {l1}</button>
        <button type="button" className="music-chip" onClick={() => pickStyle(id)}>🎹 הסולם של {t}</button>
      </div>
    </section>)}</div>

    <section id="scale-lab" className="sty-lab mt-10">
      <h2 className="sty-h2 !mt-0">🧪 מעבדת הסולמות</h2>
      <p className="text-center text-lg">בוחרים תו בית וסולם, שומעים אותו — ואז מפעילים ליווי ומאלתרים: נוגעים רק בקלידים הירוקים, וזה תמיד נשמע טוב.</p>
      <div className="mt-4"><b>תו הבית:</b>
        <div className="mt-2 flex flex-wrap gap-1.5">{ROOTS.map((r, i) => <button key={r} type="button" className="sty-root" aria-pressed={root % 12 === i} onClick={() => { setRoot(60 + i); if (jam) setTimeout(startJam, 0) }}>{r}</button>)}</div></div>
      <div className="mt-4"><b>הסולם:</b>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{SCALES.map(s => <button key={s.id} type="button" className="sty-scale" aria-pressed={s.id === scaleId} onClick={() => { setScaleId(s.id); demo.stop() }}><b>{s.name}</b><small>{s.style}</small></button>)}</div></div>
      <div className="sty-now mt-5">
        <h3 className="text-2xl font-black">{ROOTS[root % 12]} {scale.name}</h3>
        <p className="mt-1 text-lg">{scale.mood}</p>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">נשמע ב: {scale.style}</p>
        <div className="sty-notes mt-3">{notes.map((n, i) => <span key={i} className={lit.includes(n) ? 'is-now' : ''}>{ROOTS[n % 12]}</span>)}</div>
        <div className="sty-formula mt-2" aria-label="המרווחים בין התווים">{formula(scale).map((g, i) => <span key={i} className={g === 'חצי' ? 'is-half' : g === 'טון' ? '' : 'is-wide'}>{g}</span>)}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="music-chip" onClick={playScale}>{demo.busy === 'scale' ? '🔊 מנגן…' : '▶️ לשמוע את הסולם'}</button>
          <button type="button" className="music-chip sty-jam" aria-pressed={jam} onClick={() => (jam ? stopAll() : startJam())}>{jam ? '⏹️ עצירת הליווי' : '🎶 ליווי לאלתור'}</button>
        </div>
        {jam && <p className="mt-3 font-bold">🎹 נגנו על הקלידים הירוקים (במחשב: שורת האותיות A S D F G H J K היא הקלידים הלבנים, והשורה שמעליה — השחורים). אין טעויות — רק סולו!</p>}
      </div>
    </section>

    <section className="sty-lab mt-10" style={{ '--lab': '#fff4d6' }}>
      <h2 className="sty-h2 !mt-0">🎺 אקורדי ג׳אז</h2>
      <p className="text-center text-lg">אקורד רגיל יש לו 3 תווים. בג׳אז מוסיפים עוד — וכל תו מוסיף "צבע". נבנה על תו הבית {ROOTS[root % 12]}.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{JAZZ_CHORDS.map(c => { const ns = c.notes.map(s => root - 12 + s); return <button key={c.id} type="button" className="sty-scale" onClick={() => { groove.stop(); setJam(false); demo.play('chord-' + c.id, [{ notes: ns, d: 0.5 }, ...ns.map(n => ({ notes: [n], d: 0.35 })), { notes: ns, d: 2 }], 100) }}>
        <b dir="ltr">{ROOTS[root % 12]}{c.sym}</b><small>{c.name} — {c.mood}</small></button> })}</div>
    </section>

    <section className="sty-lab mt-10" style={{ '--lab': '#e9f7ff' }}>
      <h2 className="sty-h2 !mt-0">👂 חידון שמיעה: איזה סולם זה?</h2>
      <p className="text-center text-lg">מקשיבים לסולם — ומנחשים. רמז: שמחים = מז׳ור, עצובים = מינור, "מזרחי" = חיג׳אז, חלום = טונים שלמים.</p>
      <div className="mt-4 text-center">
        {!quiz ? <button type="button" className="music-chip sty-jam" onClick={newQuiz}>▶️ מתחילים</button> : <>
          <button type="button" className="music-chip" onClick={() => playQuiz(quiz.answer, quiz.root)}>🔁 שוב</button>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">{quiz.options.map(id => <button key={id} type="button" disabled={!!quiz.picked}
            className={`sty-scale ${quiz.picked && id === quiz.answer ? 'is-right' : ''} ${quiz.picked === id && id !== quiz.answer ? 'is-wrong' : ''}`} onClick={() => answerQuiz(id)}><b>{scaleById(id).name}</b></button>)}</div>
          {quiz.picked && <p className="mt-3 text-xl font-black" role="status">{quiz.picked === quiz.answer ? `✅ נכון! ${score.streak >= 3 ? `🔥 ${score.streak} ברצף` : ''}` : `❌ זה היה ${scaleById(quiz.answer).name}`}</p>}
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{score.right} נכונות מתוך {score.total}</p>
          {quiz.picked && <button type="button" className="music-chip sty-jam mt-3" onClick={newQuiz}>⏭️ הבא</button>}
        </>}
      </div>
    </section>

    <div className="mt-12"><SeoBody paragraphs={['כל סגנון מוזיקה הוא אוסף של הרגלים: איזה קצב התופים מנגנים, אילו אקורדים בוחרים ובאיזה סולם מאלתרים. כאן מפעילים גרוב של כל סגנון — בלוז, ג׳אז, קלאסי, רוק, פופ, מזרחי, פאנק ובוסה נובה — ושומעים בדיוק מה מייחד אותו.', 'במעבדת הסולמות יש 14 סולמות: מז׳ור ומינור, פנטטוני, סולם הבלוז, סולמות הג׳אז (דורי, מיקסולידי, ביבופ, טונים שלמים, לידי) וסולמות מזרחיים כמו חיג׳אז. לכל סולם רואים את התווים והמרווחים, שומעים אותו, ומפעילים ליווי כדי לאלתר עליו בפסנתר.']} faq={faq} related={[{ label: 'מושגים במוזיקה', href: '/music/concepts' }, { label: 'פסנתר אונליין', href: '/music/piano' }, { label: 'אקורדים לגיטרה', href: '/music/guitar-chords' }]} /></div>
  </div>
}

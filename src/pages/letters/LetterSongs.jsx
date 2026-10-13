import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { Sheet, T } from '../../components/printables/PrintableShell'
import { playPiano } from '../../music/audio'
import { speak, stopSpeaking } from '../../utils/speak'
import { HEBREW } from '../../data/letterLearning'

// Sing-along letter songs on the public-domain "Twinkle Twinkle" tune (the same tune as the ABC song).
// Each token is one sung syllable: [text, note, beats, say?]. `say` is spoken on its beat (a letter's
// recorded name); '~' at the start of a text glues the syllable to the previous one (same word).
// The Hebrew words are original (עוגה בוגה); the English ABC song is traditional (public domain).

const NAME = Object.fromEntries(HEBREW.map(x => [x.l, x.name]))
const heLetters = (ls, notes) => [...ls].map((l, i) => [l, notes[i], i === 6 ? 2 : 1, NAME[l]])
const HE_LINES = [
  heLetters('אבגדהוז', ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4']),
  heLetters('חטיכלמנ', ['F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4']),
  heLetters('סעפצקרש', ['G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4']),
  [['ת!', 'G4', 1, NAME['ת']], ['וְ', 'G4', 1], ['~עַכְ', 'F4', 1], ['~שָׁו', 'F4', 1], ['כֻּ', 'E4', 1], ['~לָּ', 'E4', 1], ['~נוּ', 'D4', 2]],
  [['שָׁ', 'C4', 1], ['~רִים', 'C4', 1], ['אֶת', 'G4', 1], ['הָ', 'G4', 1], ['~אָ', 'A4', 1], ['~לֶף', 'A4', 1], ['בֵּית', 'G4', 2]],
  [['וְ', 'F4', 1], ['~שׁוּב', 'F4', 1], ['מֵ', 'E4', 1], ['~הַ', 'E4', 1], ['~הַתְ', 'D4', 1], ['~חָ', 'D4', 1], ['~לָה', 'C4', 2]],
]
const en = (t, n, b = 1, say = t) => [t, n, b, say]
const EN_LINES = [
  [en('A', 'C4'), en('B', 'C4'), en('C', 'G4'), en('D', 'G4'), en('E', 'A4'), en('F', 'A4'), en('G', 'G4', 2)],
  [en('H', 'F4'), en('I', 'F4'), en('J', 'E4'), en('K', 'E4'), en('L', 'D4', 0.5), en('M', 'D4', 0.5), en('N', 'D4', 0.5), en('O', 'D4', 0.5), en('P', 'C4', 2)],
  [en('Q', 'G4'), en('R', 'G4'), en('S', 'F4', 2), en('T', 'E4'), en('U', 'E4'), en('V', 'D4', 2)],
  [en('W', 'G4', 2), en('X', 'F4', 2), en('Y', 'E4'), ['and', 'E4', 1], en('Z', 'D4', 2)],
  [['Now', 'C4', 1], ['I', 'C4', 1], ['know', 'G4', 1], ['my', 'G4', 1], ['A', 'A4', 1], ['B', 'A4', 1], ['C’s', 'G4', 2]],
  [['Next', 'F4', 1], ['time', 'F4', 1], ['won’t', 'E4', 1], ['you', 'E4', 1], ['sing', 'D4', 1], ['with', 'D4', 1], ['me?', 'C4', 2]],
]
// how Hebrew speakers say the English letter names
const EN_SAY_HE = { A: 'אֵיי', B: 'בִּי', C: 'סִי', D: 'דִּי', E: 'אִי', F: 'אֶף', G: 'גִ׳י', H: 'אֵיץ׳', I: 'אַיי', J: 'גֵ׳יי', K: 'קֵיי', L: 'אֶל', M: 'אֶם', N: 'אֶן', O: 'אוֹ', P: 'פִּי', Q: 'קְיוּ', R: 'אַר', S: 'אֶס', T: 'טִי', U: 'יוּ', V: 'וִי', W: 'דַּאבֶּל יוּ', X: 'אֶקְס', Y: 'וַאי', Z: 'זִי' }

function words(line) {
  const out = []
  line.forEach((tok, i) => { if (tok[0].startsWith('~') && out.length) out[out.length - 1].push(i); else out.push([i]) })
  return out
}

function SingAlong({ lines, lang, bpm: baseBpm = 84, big }) {
  const flat = lines.flatMap((line, li) => line.map((tok, ti) => ({ tok, li, ti })))
  const [pos, setPos] = useState(-1), [speed, setSpeed] = useState(1), [voice, setVoice] = useState(true), [loop, setLoop] = useState(false)
  const timer = useRef(null), state = useRef({})
  state.current = { speed, voice, loop }
  const stop = () => { clearTimeout(timer.current); setPos(-1); stopSpeaking() }
  useEffect(() => () => { clearTimeout(timer.current); stopSpeaking() }, [])
  function step(i) {
    if (i >= flat.length) { if (state.current.loop) i = 0; else { setPos(-1); return } }
    const [, note, beats, say] = flat[i].tok, beat = 60 / (baseBpm * state.current.speed)
    setPos(i)
    playPiano(note, { duration: beats * beat, velocity: 0.55 })
    if (say && state.current.voice) speak(say, lang, { user: false })
    timer.current = setTimeout(() => step(i + 1), beats * beat * 1000)
  }
  const playing = pos >= 0
  const cur = playing ? flat[pos] : null
  const btn = 'min-h-[48px] rounded-xl border-2 border-[var(--border)] px-4 font-bold'
  return <div className="rounded-3xl border-[3px] border-slate-800 bg-white p-4 sm:p-6 sketch-shadow">
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2 no-print">
      <button type="button" onClick={() => (playing ? stop() : step(0))} className={`${btn} bg-[var(--accent)] text-white text-xl px-6`}>{playing ? '⏹️ עצירה' : '▶️ מנגנים ושרים'}</button>
      <button type="button" aria-pressed={speed < 1} onClick={() => setSpeed(s => (s < 1 ? 1 : 0.75))} className={`${btn} ${speed < 1 ? 'bg-[var(--yellow)]' : 'bg-white'}`}>🐢 לאט</button>
      <button type="button" aria-pressed={voice} onClick={() => setVoice(v => !v)} className={`${btn} ${voice ? 'bg-[var(--yellow)]' : 'bg-white'}`}>🗣️ קול שאומר את האותיות</button>
      <button type="button" aria-pressed={loop} onClick={() => setLoop(l => !l)} className={`${btn} ${loop ? 'bg-[var(--yellow)]' : 'bg-white'}`}>🔁 שוב ושוב</button>
    </div>
    <div className="space-y-3" dir={lang.startsWith('he') ? 'rtl' : 'ltr'}>
      {lines.map((line, li) => <p key={li} className="m-0 flex flex-wrap justify-center gap-x-1.5 sm:gap-x-4 gap-y-2 leading-none">
        {words(line).map(ix => <span key={ix[0]} className="inline-flex">
          {ix.map(ti => {
            const t = line[ti][0].replace(/^~/, ''), on = cur && cur.li === li && cur.ti === ti, isLetter = !!line[ti][3]
            return <span key={ti} className={`inline-block rounded-xl px-1 transition-all duration-100 ${isLetter ? (big ? 'text-[2.1rem] sm:text-6xl font-display font-bold' : 'text-3xl sm:text-5xl font-bold') : 'text-xl sm:text-3xl font-bold'} ${on ? 'scale-125 bg-[var(--yellow)] text-[var(--accent)]' : ''}`}>{t}</span>
          })}
        </span>)}
      </p>)}
    </div>
    <p className="mt-4 mb-0 text-center text-sm text-[var(--muted-foreground)] no-print">המנגינה מתנגנת בדפדפן. כדאי להגביר את הקול — ולשיר יחד בקול רם!</p>
  </div>
}

function LyricsSheet({ title, lines, sub, heb }) {
  const text = line => words(line).map(ix => ix.map(i => line[i][0].replace(/^~/, '')).join('')).join(heb ? '  ' : ' ')
  return <Sheet label={title}>
    <T x={100} y={22} size={11} weight={900}>{title}</T>
    <T x={100} y={32} size={5} fill="#555">{sub}</T>
    {lines.map((line, i) => <text key={i} x={100} y={58 + i * 30} fontSize={i < 3 || !heb ? 14 : 11} fontWeight="700" textAnchor="middle" direction={heb ? 'rtl' : 'ltr'} fill={i % 2 ? '#7548b3' : '#111'} letterSpacing={i < 3 ? 2 : 0}>{text(line)}</text>)}
    <T x={100} y={250} size={4.5} fill="#666">שרים על המנגינה של "נצנץ נצנץ כוכב קטן" · מנגנים ושרים באתר: ugabuga.co.il</T>
  </Sheet>
}

const page = 'mx-auto max-w-5xl px-4 py-8 buga-fade-in'

export function HebrewLetterSong() {
  const [print, setPrint] = useState(false)
  const faq = [
    { q: 'על איזו מנגינה שרים את שיר האותיות?', a: 'על המנגינה העממית של "נצנץ נצנץ כוכב קטן" — אותה מנגינה של שיר ה-ABC באנגלית. ילדים מכירים אותה כבר מהגן, ולכן קל להם להצטרף מהפעם הראשונה.' },
    { q: 'מי כתב את השיר הזה?', a: 'המילים הן של עוגה בוגה, והמנגינה עממית (נחלת הכלל). יש עוד שירי אותיות ידועים בעברית — את השיר הזה אפשר לשיר, להדפיס ולהקרין בכיתה בחינם.' },
    { q: 'איך עוזר שיר ללמוד את האותיות?', a: 'מנגינה וקצב עוזרים לזכור רצף: ילדים זוכרים את סדר האותיות כמו שזוכרים שיר. כדאי לשיר כשמצביעים על כל אות — כך מחברים בין השם של האות לצורה שלה.' },
    { q: 'זה מתאים לגן ולכיתה א׳?', a: 'כן. בגן שרים ומצביעים, בהכנה לכיתה א׳ ובכיתה א׳ אפשר לעצור באמצע ולשאול "איזו אות באה עכשיו?", או לבקש מילה שמתחילה באות שעליה עצרנו.' },
  ]
  return <div className={page} dir="rtl">
    <SEO title="שיר האותיות — שיר האלף בית לילדים לשיר יחד (מנגינה ומילים)" description="שיר האותיות בעברית לילדים: א׳ עד ת׳ על מנגינה שכולם מכירים. לוחצים ▶️ — המנגינה מתנגנת, כל אות נדלקת ונשמעת בתורה. לגן, להכנה לכיתה א׳ ולכיתה א׳, עם דף מילים להדפסה." path="/letters/song" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לימוד אותיות', href: '/letters' }, { label: 'שיר האותיות' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl mb-2">🎵 שיר האותיות — שרים את האלף בית</h1>
      <p className="mx-auto max-w-2xl font-hand text-xl text-[var(--muted-foreground)]">לוחצים ▶️ ושרים: כל אות נדלקת בתורה, ויש קול שאומר את שמה. על המנגינה של "נצנץ נצנץ כוכב קטן".</p>
    </header>
    <SingAlong lines={HE_LINES} lang="he-IL" bpm={80} big />
    <div className="mt-4 flex flex-wrap justify-center gap-3 no-print">
      <button type="button" data-print-main onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-red-500 px-6 font-bold text-white">🖨️ דף מילים להדפסה</button>
      <Link to="/letters/game" className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-slate-800 bg-cyan-100 px-5 font-bold">🎮 משחק אותיות ←</Link>
      <Link to="/abc/song" className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-slate-800 bg-[var(--postit)] px-5 font-bold">🔠 שיר ה-ABC באנגלית ←</Link>
    </div>
    <section className="mt-10">
      <h2 className="mb-3 text-center text-3xl font-bold">אות — ומילה: עוד דרך לשיר</h2>
      <p className="mb-4 text-center text-[var(--muted-foreground)]">אחרי שהשיר מוכר, שרים "א׳ — אריה, ב׳ — בננה…". לחיצה על אות משמיעה את המילה.</p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-11">
        {HEBREW.map(x => <button key={x.l} type="button" onClick={() => speak(x.words[0][2] || x.words[0][0])} className="wobbly-sm flex flex-col items-center border-2 border-slate-800 bg-white p-2 hover:bg-[var(--postit)]">
          <span className="text-3xl font-bold font-display">{x.l}</span><span className="text-2xl" aria-hidden="true">{x.words[0][1]}</span><span className="text-sm">{x.words[0][0]}</span>
        </button>)}
      </div>
    </section>
    {print && <PrintPreview title="שיר האותיות" onClose={() => setPrint(false)}>
      <article className="buga-a4"><div className="print-art"><LyricsSheet title="🎵 שיר האותיות" sub="מילים: עוגה בוגה · מנגינה עממית" lines={HE_LINES} heb /></div></article>
    </PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={[
      'שיר האותיות הוא הדרך הכי כיפית להכיר את האלף בית: הילדים שרים את 22 האותיות לפי הסדר, על מנגינה שהם כבר מכירים. אחרי כמה פעמים הם זוכרים את הסדר בעל פה — ואז קל הרבה יותר למצוא אות במילון, לסדר שמות לפי א״ב ולזכור איזו אות באה אחרי איזו.',
      'בעמוד הזה המנגינה מתנגנת בדפדפן, וכל אות נדלקת בדיוק כשמגיעים אליה — כמו קריוקי של אותיות. אפשר להאט את הקצב, להשאיר את השיר מתנגן שוב ושוב, ולהקרין אותו על הלוח בכיתה. בסוף השיר שרים יחד "שרים את האלף בית — ושוב מההתחלה".',
      'רעיונות למשחק עם השיר: לעצור באמצע ולשאול איזו אות באה עכשיו; לשיר ולהצביע על כרטיסיית האות המתאימה; לבקש מכל ילד לקום כשמגיעים לאות הראשונה של השם שלו.',
    ]} faq={faq} related={[{ label: 'לימוד אותיות בעברית', href: '/letters' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'סרגל אותיות להדפסה', href: '/printables/letter-strip' }, { label: 'אותיות בכתב', href: '/letters/cursive' }]} /></div>
  </div>
}

export function AbcSong() {
  const [print, setPrint] = useState(false)
  const faq = [
    { q: 'מה המילים של שיר ה-ABC?', a: 'A B C D E F G, H I J K L M N O P, Q R S, T U V, W X, Y and Z. Now I know my ABC’s, next time won’t you sing with me? — בעברית: "עכשיו אני יודע את ה-ABC, בפעם הבאה תשיר איתי?"' },
    { q: 'למה L M N O שרים כל כך מהר?', a: 'ארבע האותיות האלה נכנסות לשני תווים במנגינה, ולכן שרים אותן בחצי זמן. זה החלק שילדים הכי אוהבים — וגם המקום שבו הם הכי מתבלבלים. במצב "לאט" קל יותר לשמוע כל אות.' },
    { q: 'זו המנגינה של נצנץ נצנץ כוכב קטן?', a: 'כן. שיר ה-ABC, "נצנץ נצנץ כוכב קטן" ו"באה באה כבשה שחורה" מושרים כולם על אותה מנגינה צרפתית עממית מהמאה ה-18.' },
  ]
  return <div className={page} dir="rtl">
    <SEO title="שיר ה-ABC באנגלית — שיר האותיות באנגלית לילדים (מילים ומנגינה)" description="שיר ה-ABC לילדים: A עד Z על המנגינה המוכרת, כל אות נדלקת ונשמעת בתורה, עם איך אומרים כל אות בעברית ודף מילים להדפסה. חינם, לגן ולכיתה א׳–ג׳." path="/abc/song" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'אותיות באנגלית', href: '/abc' }, { label: 'שיר ה-ABC' }]} />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl mb-2">🔠 שיר ה-ABC — שיר האותיות באנגלית</h1>
      <p className="mx-auto max-w-2xl font-hand text-xl text-[var(--muted-foreground)]">לוחצים ▶️ ושרים את A–Z: כל אות נדלקת ונשמעת באנגלית בתורה.</p>
    </header>
    <SingAlong lines={EN_LINES} lang="en-US" bpm={88} big />
    <div className="mt-4 flex flex-wrap justify-center gap-3 no-print">
      <button type="button" data-print-main onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-red-500 px-6 font-bold text-white">🖨️ דף מילים להדפסה</button>
      <Link to="/abc/game" className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-slate-800 bg-cyan-100 px-5 font-bold">🎮 משחק אותיות באנגלית ←</Link>
      <Link to="/letters/song" className="inline-flex min-h-[48px] items-center rounded-xl border-2 border-slate-800 bg-[var(--postit)] px-5 font-bold">🎵 שיר האותיות בעברית ←</Link>
    </div>
    <section className="mt-10">
      <h2 className="mb-3 text-center text-3xl font-bold">איך אומרים כל אות?</h2>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-13" dir="ltr">
        {Object.entries(EN_SAY_HE).map(([l, he]) => <button key={l} type="button" onClick={() => speak(l, 'en-US')} className="wobbly-sm flex flex-col items-center border-2 border-slate-800 bg-white p-2 hover:bg-[var(--postit)]">
          <span className="text-3xl font-bold">{l}{l.toLowerCase()}</span><span className="text-sm" dir="rtl">{he}</span>
        </button>)}
      </div>
    </section>
    {print && <PrintPreview title="שיר ה-ABC" onClose={() => setPrint(false)}>
      <article className="buga-a4"><div className="print-art"><LyricsSheet title="The ABC Song 🎵" sub="שיר ה-ABC · מילים ומנגינה עממיות" lines={EN_LINES} /></div></article>
    </PrintPreview>}
    <div className="mt-12"><SeoBody paragraphs={[
      'שיר ה-ABC הוא השיר הראשון שכמעט כל ילד לומד באנגלית. הוא עוזר לזכור את 26 האותיות לפי הסדר — וזה הבסיס לקריאה, לאיות ולחיפוש מילה במילון.',
      'כאן המנגינה מתנגנת בדפדפן וכל אות נדלקת בזמן, כך שגם ילד שעוד לא קורא יכול לעקוב. מתחת לשיר יש את כל האותיות עם ההגייה שלהן בעברית — לחיצה משמיעה את האות באנגלית.',
      'טיפ להורים: אחרי שהשיר מוכר, שרים אותו לאט ומצביעים על כל אות בכרטיסייה. אחר כך משחקים "מה בא אחרי?" — עוצרים בשיר ומנחשים את האות הבאה.',
    ]} faq={faq} related={[{ label: 'אותיות באנגלית A–Z', href: '/abc' }, { label: 'משחק אותיות באנגלית', href: '/abc/game' }, { label: 'אנגלית לילדים', href: '/english' }]} /></div>
  </div>
}

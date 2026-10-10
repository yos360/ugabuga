import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HolidayShell from '../../components/holidays/HolidayShell'
import { HANUKKAH_H } from '../../holidays/hanukkah'
import {
  HANUKKAH_SONGS, SONG_AGES, BLESSINGS, HANEIROT_HALALU, MAOZ_TZUR,
  youtubeSearchUrl, ageOf, songsForAge, creditLine, makeGame,
} from '../../data/hanukkahSongs'
import '../../learn/learn.css'
import './hanukkahSongs.css'

const PATH = '/holidays/hanukkah/songs'
// The Hanukkah tab row, with this page added (until it's part of the shared config).
const H = HANUKKAH_H.pages.some(p => p.to === PATH) ? HANUKKAH_H
  : { ...HANUKKAH_H, pages: [...HANUKKAH_H.pages, { to: PATH, label: 'שירי חנוכה', emoji: '🎵' }] }

const FAQ = [
  { q: 'מתי שרים את "מעוז צור"?', a: 'בקהילות אשכנז נוהגים לשיר "מעוז צור" מיד אחרי ברכות ההדלקה והדלקת הנרות, בכל אחד משמונת ערבי החג. רבים שרים רק את הבית הראשון, ויש ששרים את כל הבתים. בקהילות עדות המזרח נוהגים לומר אחרי ההדלקה את מזמור ל׳ בתהלים, "מזמור שיר חנוכת הבית".' },
  { q: 'מה זה "הנרות הללו"?', a: 'קטע קצר ועתיק שאומרים או שרים אחרי הדלקת הנר הראשון. מקורו במסכת סופרים, והוא מסביר שהנרות נועדו להסתכל עליהם ולהודות על הנסים — ולא כדי להשתמש באורם, למשל לקריאה. יש לו כמה לחנים מוכרים, ונוסחו שונה מעט בין העדות.' },
  { q: 'אילו ברכות מברכים על נרות חנוכה?', a: 'בכל ערב מברכים שתי ברכות: "להדליק נר חנוכה" ו"שעשה ניסים לאבותינו". בערב הראשון בלבד מוסיפים ברכה שלישית — "שהחיינו". את הברכות אומרים לפני ההדלקה. יש קהילות שאומרות "להדליק נר של חנוכה".' },
  { q: 'למה אין כאן את המילים של כל השירים?', a: 'רוב שירי החנוכה המוכרים נכתבו במאה העשרים, והמילים שלהם מוגנות בזכויות יוצרים (בישראל ההגנה נמשכת 70 שנה אחרי מות היוצר). לכן אנחנו מציגים במלואם רק טקסטים שהם נחלת הכלל — "מעוז צור", "הנרות הללו" והברכות — ולכל שיר אחר מצרפים את שמות היוצרים, הסבר קצר וקישור לחיפוש ביוטיוב, שם אפשר לשמוע ביצועים רשמיים.' },
  { q: 'אילו שירי חנוכה מתאימים לגן?', a: '"סביבון סוב סוב סוב", "באנו חושך לגרש", "כד קטן", "חנוכייה לי יש", "נר לי", "לביבות" ו"חנוכה, חנוכה, חג יפה כל כך" — כולם קצרים, עם חזרות ומשפטים פשוטים. אפשר לסנן את הרשימה לפי גיל ולהדפיס רשימת שירים למסיבת החנוכה בגן.' },
  { q: 'איך משחקים ב"נחשו את השיר"?', a: 'על המסך מופיעה חידת אימוג׳י, ובוחרים את שם השיר מתוך ארבע אפשרויות — או לוחצים "גלו את התשובה". אפשר לשחק בקבוצות: מי שמנחש ראשון גם מתחיל לשיר את השיר.' },
]

const Chip = ({ on, onClick, children }) => <button type="button" className="ln-chip" aria-pressed={on} onClick={onClick}>{children}</button>

function SongCard({ s }) {
  const age = ageOf(s.age)
  return <article className="wobbly border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-4 text-right">
    <div className="hs-card">
      <div className="text-4xl" aria-hidden="true">{s.emoji}</div>
      <h3 className="text-xl font-bold leading-snug">{s.title}</h3>
      <p className="m-0 text-sm font-bold">{creditLine(s)}</p>
      <div className="hs-badges">
        <span className="hs-badge">{age.emoji} {age.label}</span>
        {s.pd && <span className="hs-badge pd">📜 מילים מלאות בעמוד</span>}
      </div>
      <p className="m-0 text-[var(--muted-foreground)]">{s.desc}</p>
      <div className="mt-auto flex flex-wrap gap-x-4">
        <a className="hs-yt" href={youtubeSearchUrl(s)} target="_blank" rel="noopener noreferrer">▶️ חיפוש ביוטיוב<span className="sr-only"> — {s.title} (נפתח בחלון חדש)</span></a>
        {s.pd && <a className="hs-yt" href={s.slug === 'maoz-tzur' ? '#maoz-tzur' : '#blessings'}>📜 למילים</a>}
      </div>
    </div>
  </article>
}

function GuessGame() {
  const [seed, setSeed] = useState(1) // fixed first deck → identical prerender and first paint
  const [game, setGame] = useState(() => makeGame(1))
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [shown, setShown] = useState(false)
  const [score, setScore] = useState(0)
  const q = game[i]
  const done = i >= game.length
  const pick = title => { if (picked || shown) return; setPicked(title); if (title === q.answer) setScore(n => n + 1) }
  const next = () => { setI(n => n + 1); setPicked(null); setShown(false) }
  const restart = () => { const s = seed + 1 + Math.floor(Math.random() * 1000); setSeed(s); setGame(makeGame(s)); setI(0); setPicked(null); setShown(false); setScore(0) }
  const revealed = picked || shown
  return <section id="game" className="ln-box mt-10 text-center" aria-labelledby="game-title">
    <h2 id="game-title" className="text-2xl font-black">🧩 נחשו את השיר</h2>
    <p className="mt-1">חידת אימוג׳י — איזה שיר חנוכה מסתתר כאן? מי שמנחש, מתחיל לשיר!</p>
    {done ? <div className="mt-4 space-y-3" role="status">
      <p className="text-3xl font-black">🎉 ניחשתם {score} מתוך {game.length}!</p>
      <button type="button" className="ln-btn" onClick={restart}>🔄 סיבוב חדש</button>
    </div> : <div className="mt-4 space-y-4">
      <p className="m-0 text-sm font-bold text-[var(--muted-foreground)]">חידה {i + 1} מתוך {game.length} · נקודות: {score}</p>
      <p className="hs-clue m-0" aria-label={`חידת אימוג׳י: ${q.clue}`}>{q.clue}</p>
      <p className="m-0">💡 רמז: {q.hint}</p>
      <div className="hs-options mx-auto max-w-xl" role="group" aria-label="בחרו את שם השיר">
        {q.options.map(t => {
          const cls = revealed && t === q.answer ? 'is-right' : picked === t ? 'is-wrong' : ''
          return <button key={t} type="button" className={`hs-opt ${cls}`} disabled={!!revealed} onClick={() => pick(t)}>{t}</button>
        })}
      </div>
      <div aria-live="polite">{revealed && <p className="m-0 text-xl font-black">{picked ? (picked === q.answer ? '✅ נכון! ' : '❌ כמעט… ') : ''}התשובה: {q.answer}</p>}</div>
      <div className="flex flex-wrap justify-center gap-2">
        {!revealed && <button type="button" className="ln-chip" onClick={() => setShown(true)}>👀 גלו את התשובה</button>}
        {revealed && <button type="button" className="ln-btn" onClick={next}>{i + 1 < game.length ? 'לחידה הבאה ←' : 'לתוצאה ←'}</button>}
        <button type="button" className="ln-chip" onClick={restart}>🔄 מההתחלה</button>
      </div>
    </div>}
  </section>
}

function PrintList({ songs, gan, onClose }) {
  return <PrintPreview title="רשימת שירי חנוכה למסיבה" onClose={onClose}>
    <article className="buga-flow hs-print" dir="rtl">
      <p className="hs-print-sub">🕎 מסיבת חנוכה{gan ? ` · ${gan}` : ''}</p>
      <h2>שירי חנוכה למסיבה</h2>
      <p className="hs-print-sub">סמנו ✓ ליד כל שיר ששרנו</p>
      <table><tbody>{songs.map((s, n) => <tr key={s.slug}>
        <td className="box">☐</td>
        <td><b>{n + 1}. {s.title}</b></td>
        <td className="credit">{creditLine(s)}</td>
      </tr>)}</tbody></table>
      <p className="hs-print-sub" style={{ marginTop: 12 }}>חנוכה שמח! ✨</p>
    </article>
  </PrintPreview>
}

function PrintCandles({ onClose }) {
  return <PrintPreview title="ברכות ההדלקה ומעוז צור" onClose={onClose}>
    <article className="buga-flow hs-print" dir="rtl">
      <h2>🕎 הדלקת נרות חנוכה</h2>
      <h3>ברכות ההדלקה</h3>
      {BLESSINGS.map(b => <p key={b.text}><b>({b.when})</b> {b.text}</p>)}
      <h3>הנרות הללו</h3>
      <p>{HANEIROT_HALALU}</p>
      <h3>מעוז צור</h3>
      {MAOZ_TZUR.map(st => <div key={st.label} style={{ marginBottom: 10 }}><p><b>{st.label}</b></p>{st.lines.map(l => <p key={l} style={{ margin: 0 }}>{l}</p>)}</div>)}
    </article>
  </PrintPreview>
}

export default function HanukkahSongs() {
  const [age, setAge] = useState('')
  const [printing, setPrinting] = useState('')
  const [gan, setGan] = useState('')
  const [partyAge, setPartyAge] = useState('gan')
  const list = songsForAge(age)
  const partySongs = songsForAge(partyAge)
  const kidsCount = songsForAge('gan').length

  return <HolidayShell h={H} crumb="שירי חנוכה">
    <SEO title="שירי חנוכה לילדים — רשימה מלאה, מעוז צור וברכות ההדלקה" description="שירי חנוכה לילדים ולגן: סביבון סוב סוב סוב, באנו חושך לגרש, כד קטן ועוד — עם יוצרים והסבר, מילות מעוז צור והברכות, משחק נחשו את השיר ורשימה להדפסה." path={PATH} structuredData={faqSchema(FAQ)} />

    <header className="hs-hero">
      <p className="text-5xl m-0" aria-hidden="true">🎵🕎</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">שירי חנוכה לילדים</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-blue-100">{HANUKKAH_SONGS.length} שירים ופיוטים — מ"סביבון סוב סוב סוב" ועד "מעוז צור". עם היוצרים, גיל מתאים, מילות הברכות להדלקה, משחק ניחושים ורשימה להדפסה למסיבה בגן.</p>
    </header>

    <nav className="hs-jump no-print mt-5" aria-label="קפיצה בעמוד">
      <a className="ln-chip" href="#songs">🎵 רשימת השירים</a>
      <a className="ln-chip" href="#blessings">🕯️ ברכות ההדלקה</a>
      <a className="ln-chip" href="#maoz-tzur">🪨 מעוז צור</a>
      <a className="ln-chip" href="#game">🧩 נחשו את השיר</a>
      <a className="ln-chip" href="#party">🖨️ רשימה למסיבה</a>
    </nav>

    <div className="mx-auto mt-6 max-w-3xl space-y-3 text-lg leading-relaxed">
      <p>אין חנוכה בלי שירים: שרים ליד החנוכייה אחרי ההדלקה, במסיבה בגן, בתהלוכה עם פנסים ובמעגל סביב הסביבון. רוב שירי החנוכה שהילדים שרים היום נכתבו בארץ ישראל בשנות העשרים עד הארבעים של המאה הקודמת — הרבה מהם בידי המשורר לוין קיפניס, "משורר הילדים" — והם עוברים מדור לדור כבר כמעט מאה שנה.</p>
      <p>ריכזנו כאן את השירים המוכרים ביותר, עם שמות כותבי המילים והלחנים כפי שהם מופיעים במאגרי הזמר העברי, הסבר קצר על כל שיר והמלצה לגיל. את מילות "מעוז צור", "הנרות הללו" וברכות ההדלקה תמצאו כאן במלואן, עם ניקוד.</p>
    </div>

    <section id="songs" className="mt-10 scroll-mt-24" aria-labelledby="songs-title">
      <h2 id="songs-title" className="mb-3 text-center text-3xl font-black">🎵 רשימת שירי חנוכה</h2>
      <div className="no-print mb-5 flex flex-wrap justify-center gap-2" role="group" aria-label="סינון לפי גיל">
        <Chip on={!age} onClick={() => setAge('')}>כל השירים</Chip>
        {SONG_AGES.filter(a => a.id !== 'all').map(a => <Chip key={a.id} on={age === a.id} onClick={() => setAge(a.id)}>{a.emoji} {a.label}</Chip>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(s => <SongCard key={s.slug} s={s} />)}</div>
      <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">קישורי היוטיוב פותחים חיפוש של שם השיר — בחרו את הביצוע שמתאים לכם. מילות השירים המודרניים מוגנות בזכויות יוצרים, ולכן אינן מופיעות כאן.</p>
    </section>

    <section id="blessings" className="mt-10 scroll-mt-24 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-labelledby="bless-title">
      <h2 id="bless-title" className="text-2xl font-black">🕯️ ברכות הדלקת נרות חנוכה</h2>
      <p className="mt-1">מדליקים את השמש, מברכים — ורק אז מדליקים את הנרות. בערב הראשון מברכים שלוש ברכות, ובשאר הערבים שתיים.</p>
      <ol className="hs-bless mt-3 list-none p-0">
        {BLESSINGS.map(b => <li key={b.text}>
          <span className={`hs-when ${b.firstNightOnly ? 'first' : ''}`}>{b.when}</span>
          <p className="hs-text m-0">{b.text}</p>
        </li>)}
      </ol>
      <h3 className="mt-6 text-xl font-black">👉 הנרות הללו</h3>
      <p className="mt-1 text-[var(--muted-foreground)]">נאמר אחרי הדלקת הנר הראשון. זה הנוסח הנפוץ בסידורי אשכנז; בעדות אחרות הנוסח שונה מעט.</p>
      <p className="hs-text mt-2">{HANEIROT_HALALU}</p>
    </section>

    <section id="maoz-tzur" className="ln-box mt-8 scroll-mt-24" aria-labelledby="maoz-title">
      <h2 id="maoz-title" className="text-2xl font-black">🪨 מעוז צור — המילים</h2>
      <p className="mt-1">פיוט מימי הביניים שנכתב באשכנז; שם המחבר, מרדכי, חתום בראשי הבתים. בקהילות אשכנז שרים אותו אחרי ההדלקה. לפניכם הבית הראשון, שרוב המשפחות שרות, והבית החמישי — הבית שמספר את סיפור חנוכה.</p>
      <div className="mt-3">{MAOZ_TZUR.map(st => <div key={st.label} className="hs-stanza">
        <h3>{st.label}</h3>
        <div className="hs-text">{st.lines.map(l => <p key={l}>{l}</p>)}</div>
      </div>)}</div>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">מילים קשות: <b>מעוז צור</b> — סלע חזק, כינוי לאלוהים שמגן; <b>חשמנים</b> — החשמונאים, משפחת המכבים; <b>קנקנים</b> — כדים; <b>בני בינה</b> — החכמים, שקבעו את שמונת ימי החג.</p>
      <div className="no-print mt-4 flex justify-center"><button type="button" className="ln-btn alt" onClick={() => setPrinting('candles')}>🖨️ הדפסת דף ההדלקה (ברכות + מעוז צור)</button></div>
    </section>

    <GuessGame />

    <section id="party" className="ln-box mt-10 scroll-mt-24 space-y-3 text-center" aria-labelledby="party-title">
      <h2 id="party-title" className="text-2xl font-black">🖨️ רשימת שירים למסיבת חנוכה בגן</h2>
      <p className="m-0">דף אחד עם כל השירים ושמות היוצרים — לתלות ליד הפסנתר, לתת לנגן או לסמן ✓ על כל שיר ששרתם.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <label htmlFor="gan-name" className="font-bold">שם הגן או הכיתה:</label>
        <input id="gan-name" className="hs-input" value={gan} maxLength={40} placeholder="למשל: גן רימון" onChange={e => setGan(e.target.value)} />
      </div>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="אילו שירים להדפיס">
        <Chip on={partyAge === 'gan'} onClick={() => setPartyAge('gan')}>🧸 שירים לגן ({kidsCount})</Chip>
        <Chip on={partyAge === ''} onClick={() => setPartyAge('')}>🎵 כל השירים ({HANUKKAH_SONGS.length})</Chip>
      </div>
      <button type="button" className="ln-btn" onClick={() => setPrinting('list')}>🖨️ הדפסת הרשימה</button>
    </section>

    {printing === 'list' && <PrintList songs={partySongs} gan={gan.trim()} onClose={() => setPrinting('')} />}
    {printing === 'candles' && <PrintCandles onClose={() => setPrinting('')} />}

    <section className="mt-10" aria-labelledby="more-title">
      <h2 id="more-title" className="mb-4 text-center text-2xl font-black">🎉 עוד פעילויות לחנוכה</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/holidays/hanukkah/sevivon', emoji: '🎲', label: 'סביבון וירטואלי', text: 'שרים "סביבון סוב סוב סוב" ומסובבים בלחיצה — עם ניקוד לכל המשפחה' },
          { to: '/holidays/hanukkah/coloring', emoji: '🖍️', label: 'דפי צביעה לחנוכה', text: 'חנוכייה, סביבון, סופגניות ופך השמן — להדפסה בחינם' },
          { to: '/holidays/hanukkah/quiz', emoji: '❓', label: 'חידון חנוכה', text: 'שאלות על המכבים, הנרות והסביבון ב־3 רמות' },
        ].map(c => <Link key={c.to} to={c.to} className="wobbly card-lift flex flex-col border-2 border-[var(--border)] bg-blue-50 p-4 sketch-shadow text-right">
          <span className="text-4xl" aria-hidden="true">{c.emoji}</span>
          <h3 className="text-xl font-bold">{c.label}</h3>
          <p className="m-0 flex-1 text-[var(--muted-foreground)]">{c.text}</p>
          <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
        </Link>)}
      </div>
    </section>

    <div className="mt-10"><SeoBody paragraphs={[
      'שירי חנוכה הם חלק מהחג לא פחות מהסופגניות: הילדים לומדים אותם בגן, שרים אותם במסיבת החנוכה ומביאים אותם הביתה אל ההדלקה המשפחתית. רבים מהם נכתבו בשנות העשרים והשלושים, כשגננות ומחנכים בארץ חיפשו שירים עבריים פשוטים לחג — ולוין קיפניס, שרה לוי־תנאי ואחרים כתבו שירים שנשארו איתנו עד היום.',
      'לגן ולפעוטות מתאימים במיוחד שירים קצרים עם חזרות ותנועה: "סביבון סוב סוב סוב" עם סביבון אמיתי, "באנו חושך לגרש" בתהלוכה עם פנסים, ו"חנוכייה יפהפייה" שסופרים בו נרות. לילדי בית הספר אפשר להוסיף את "מי ימלל" בקאנון, את "אנו נושאים לפידים" ואת "מעוז צור" עם הבית החמישי, שמספר את סיפור החג.',
      'רעיון למסיבה: להדפיס את רשימת השירים, לחלק את הילדים לקבוצות ולשחק ב"נחשו את השיר" — הקבוצה שמנחשת שרה את השיר, וכל שיר ששרו מסמנים ברשימה.',
    ]} faq={FAQ} related={[
      { label: 'חנוכה לילדים', href: '/holidays/hanukkah' },
      { label: 'מסיבת חנוכה', href: '/ideas/hanukkah-party' },
      { label: 'מה עושים בחנוכה', href: '/holidays/hanukkah/what-to-do' },
      { label: 'דפי עבודה לחנוכה', href: '/holidays/hanukkah/worksheets' },
    ]} /></div>
  </HolidayShell>
}

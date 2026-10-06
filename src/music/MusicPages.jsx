import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import NotFound from '../pages/NotFound'
import Piano, { SOLFEGE, LETTER, WidePiano } from './Piano'
import { playPiano } from './audio'
import { SONGS, LEVELS, song as findSong, parseNotes, rangeFor } from './songs'
import './music.css'

export const MUSIC_SECTIONS = [
  ['/music/piano', '🎹', 'פסנתר אונליין', 'מנגנים בלחיצה, במגע או מהמקלדת — עם שמות התווים'],
  ['/music/songs', '🎶', 'לומדים שירים בפסנתר', 'הקליד הבא נדלק — לוחצים ומנגנים שיר שלם'],
  ['/music/read-notes', '🎼', 'קריאת תווים', 'משחק: איזה תו זה? מהחמשה אל הפסנתר'],
  ['/music/guitar-chords', '🎸', 'אקורדים לגיטרה', 'איפה שמים את האצבעות — ושומעים איך זה נשמע'],
  ['/music/concepts', '📖', 'מושגים במוזיקה', 'קצב, סולם, מז׳ור ומינור — עם הדגמה שומעים'],
  ['/music/styles', '🎷', 'סגנונות מוזיקה', 'בלוז, ג׳אז, קלאסי, רוק ומזרחי — מנגנים כל סגנון'],
]
export const MUSIC_CRUMB = { label: 'מוזיקה', href: '/music' }

function LabelsChoice({ value, onChange }) {
  return <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="שמות התווים">
    {[['solfege', 'דו רה מי'], ['letters', 'C D E'], ['none', 'בלי שמות']].map(([v, l]) => <button key={v} type="button" className="music-chip" aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>)}
  </div>
}

// ── /music ───────────────────────────────
export function MusicHub() {
  const faq = [
    { q: 'צריך פסנתר אמיתי?', a: 'לא. הפסנתר באתר עובד במחשב, בטאבלט ובטלפון. מי שיש לו פסנתר או אורגנית בבית יכול ללמוד כאן ולנגן שם.' },
    { q: 'השירים באמת חופשיים מזכויות יוצרים?', a: 'כן. בחרנו רק מנגינות עממיות או של מלחינים שנפטרו לפני הרבה שנים, כמו בטהובן, מוצרט וברהמס.' },
    { q: 'מאיזה גיל אפשר להתחיל?', a: 'כבר מגיל 4–5 עם השירים הקלים, כשהקליד הבא נדלק בירוק ורק צריך ללחוץ עליו.' },
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="לימוד מוזיקה לילדים — פסנתר, שירים, תווים ואקורדים" description="אזור מוזיקה בחינם: פסנתר אונליין, לימוד שירים בפסנתר עם קלידים שנדלקים, קריאת תווים, אקורדים לגיטרה, מושגים וסגנונות במוזיקה. בלי הרשמה." path="/music" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'מוזיקה' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎵 </span>לומדים מוזיקה</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">פסנתר, שירים, תווים ואקורדים — מנגנים ולומדים באותו רגע</p>
    <div className="music-card mb-8"><WidePiano from={48} to={84} labels="solfege" /><p className="mt-3 text-center text-sm text-[var(--muted-foreground)]">נסו! לוחצים על הקלידים או על המקלדת (A, S, D…)</p></div>
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {MUSIC_SECTIONS.map(([to, e, t, d]) => <Link key={to} to={to} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-5 text-right">
        <div className="text-4xl mb-2" aria-hidden="true">{e}</div><h2 className="text-2xl font-bold">{t}</h2><p className="text-[var(--muted-foreground)]">{d}</p></Link>)}
    </div>
    <div className="mt-12"><SeoBody paragraphs={['אזור המוזיקה של עוגה בוגה נבנה כדי שכל ילד — וגם כל מבוגר — יוכל להתחיל לנגן בלי מורה ובלי כלי בבית. הפסנתר עובד ישר בדפדפן, והשירים מלמדים את עצמם: הקליד הבא נדלק, לוחצים, וממשיכים.', 'מעבר לשירים יש משחק קריאת תווים שמחבר בין החמשה לפסנתר, דיאגרמות של אקורדים לגיטרה עם השמעה, מילון מושגים עם הדגמות שומעים, וסיור קצר בסגנונות — מבלוז ועד מוזיקה מזרחית. הכול חינם ובלי הרשמה.']} faq={faq} related={[{ label: 'דף תווים ריק להדפסה', href: '/printables/music-paper' }, { label: 'משחקים לכיתה', href: '/games/classroom' }]} /></div>
  </div>
}

// ── /music/piano ───────────────────────────────
export function PianoPage() {
  const [labels, setLabels] = useState('solfege')
  const [last, setLast] = useState(null)
  const faq = [
    { q: 'איך מנגנים מהמקלדת של המחשב?', a: 'השורה האמצעית (A S D F G H J K) היא הקלידים הלבנים מדו עד דו, והשורה שמעליה (W E T Y U) היא הקלידים השחורים. זה עובד גם כשהמקלדת בעברית.' },
    { q: 'אפשר לנגן כמה תווים ביחד?', a: 'כן — בטלפון ובטאבלט עם כמה אצבעות, ובמחשב עם כמה מקשים, כך שאפשר לנגן אקורדים.' },
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="פסנתר אונליין — מנגנים בחינם במחשב ובטלפון" description="פסנתר אונליין בעברית: מנגנים בלחיצה, במגע או מהמקלדת, עם שמות התווים בדו-רה-מי או באותיות. כמה תווים ביחד, שלוש אוקטבות, בלי הורדה ובלי הרשמה." path="/music/piano" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'פסנתר אונליין' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎹 </span>פסנתר אונליין</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">לוחצים, נוגעים או מנגנים מהמקלדת</p>
    <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
      <LabelsChoice value={labels} onChange={setLabels} />
    </div>
    <div className="music-card">
      <p className="mb-3 h-8 text-center text-2xl font-black" aria-live="polite">{last != null ? `${SOLFEGE[last % 12]} · ${LETTER[last % 12]}${Math.floor(last / 12) - 1}` : ' '}</p>
      <WidePiano from={36} to={96} labels={labels} onPress={setLast} showKeys />
    </div>
    <div className="mt-6 text-center"><Link to="/music/songs" className="music-chip">🎶 רוצים לנגן שיר? לשירים עם קלידים שנדלקים ←</Link></div>
    <div className="mt-12"><SeoBody paragraphs={['הפסנתר כאן מנגן ישר מהדפדפן, בלי להוריד אפליקציה. בטלפון ובטאבלט נוגעים בקלידים — גם בכמה אצבעות ביחד — ובמחשב אפשר לנגן מהמקלדת, כמו על פסנתר אמיתי.', 'מעל כל קליד מופיע שם התו: בשיטת דו-רה-מי שלומדים בישראל, או באותיות C-D-E שמופיעות בספרי תווים ובאקורדים. כך לומדים את המקום של כל תו בלי לשים לב.']} faq={faq} related={[{ label: 'לומדים שירים בפסנתר', href: '/music/songs' }, { label: 'קריאת תווים', href: '/music/read-notes' }, { label: 'מושגים במוזיקה', href: '/music/concepts' }]} /></div>
  </div>
}

// ── /music/songs ───────────────────────────────
export function SongsIndex() {
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="לומדים לנגן שירים בפסנתר — קלידים שנדלקים, בחינם" description={`${SONGS.length} שירים קלים לפסנתר לילדים ולמתחילים: נצנץ כוכב קטן, אודה לשמחה, יום הולדת שמח, לאליזה ועוד. הקליד הבא נדלק — לוחצים ומנגנים.`} path="/music/songs" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'שירים לפסנתר' }]} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎶 </span>לומדים לנגן שירים בפסנתר</h1>
    <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">בוחרים שיר — הקליד הבא נדלק בירוק, לוחצים עליו וממשיכים</p>
    {[1, 2, 3].map(lv => <section key={lv} className="mb-8">
      <h2 className="mb-3 text-2xl font-black">{'⭐'.repeat(lv)} {LEVELS[lv]}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{SONGS.filter(s => s.level === lv).map(s => <Link key={s.slug} to={`/music/songs/${s.slug}`} className="music-card card-lift text-right">
        <div className="text-3xl" aria-hidden="true">{s.emoji}</div><h3 className="text-xl font-bold">{s.title}</h3><p className="text-sm text-[var(--muted-foreground)]">{s.origin}</p></Link>)}</div>
    </section>)}
    <SeoBody paragraphs={['כל השירים כאן הם מנגינות שאין עליהן זכויות יוצרים — שירי עם ויצירות של מלחינים קלאסיים — ולכן אפשר לנגן אותם בחופשיות בבית, בכיתה ובהופעה.', 'בכל שיר יש שלושה מצבים: "האזנה" — הפסנתר מנגן לבד והקלידים נדלקים; "אני מנגן/ת" — הקליד הבא נדלק ומחכה ללחיצה; ומהירות שאפשר להאט כשלומדים קטע חדש.']} related={[{ label: 'פסנתר חופשי', href: '/music/piano' }, { label: 'קריאת תווים', href: '/music/read-notes' }]} />
  </div>
}

// ── /music/songs/:slug ───────────────────────────────
export function SongPage() {
  const { slug } = useParams()
  const s = findSong(slug)
  const seq = useMemo(() => (s ? parseNotes(s.notes) : []), [s])
  const range = useMemo(() => (seq.length ? rangeFor(seq) : { from: 48, to: 72 }), [seq])
  const [mode, setMode] = useState('follow')
  const [labels, setLabels] = useState('solfege')
  const [speed, setSpeed] = useState(1)
  const [pos, setPos] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [wrong, setWrong] = useState(null)
  const [mistakes, setMistakes] = useState(0)
  const timer = useRef(null)
  const done = pos >= seq.length

  useEffect(() => () => clearTimeout(timer.current), [])
  useEffect(() => { clearTimeout(timer.current); setPlaying(false); setPos(0); setMistakes(0) }, [slug, mode])

  // "Listen" mode: play through at the chosen tempo, lighting each key.
  useEffect(() => {
    if (!playing || mode !== 'watch') return
    if (pos >= seq.length) { setPlaying(false); return }
    const beat = 60 / (s.bpm * speed), { n, d } = seq[pos]
    playPiano(n, { duration: d * beat })
    timer.current = setTimeout(() => setPos(p => p + 1), d * beat * 1000)
    return () => clearTimeout(timer.current)
  }, [playing, pos, mode, seq, s, speed])

  if (!s) return <NotFound />
  const onPress = n => {
    if (mode !== 'follow' || done) return
    if (n === seq[pos].n) { setPos(p => p + 1); setWrong(null) }
    else { setWrong(n); setMistakes(m => m + 1); setTimeout(() => setWrong(w => (w === n ? null : w)), 400) }
  }
  const marks = {}
  if (!done && seq[pos]) marks[seq[pos].n] = mode === 'watch' ? 'play' : 'next'
  if (wrong != null) marks[wrong] = 'wrong'
  const restart = () => { clearTimeout(timer.current); setPos(0); setMistakes(0); setPlaying(mode === 'watch') }
  const idx = SONGS.indexOf(s), next = SONGS[(idx + 1) % SONGS.length]
  const faq = [
    { q: `כמה תווים יש ב"${s.title}"?`, a: `${seq.length} תווים. התו הראשון הוא ${SOLFEGE[seq[0].n % 12]} (${LETTER[seq[0].n % 12]}).` },
    { q: 'איך לומדים שיר חדש הכי מהר?', a: 'מקשיבים פעם אחת במצב "האזנה", ואז מנגנים במצב "אני מנגן/ת" לאט. כשזה זורם — מגבירים את המהירות.' },
  ]
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title={`${s.title} — לנגן בפסנתר, תווים וקלידים שנדלקים`} description={`לומדים לנגן "${s.title}" בפסנתר: הקלידים נדלקים בירוק, עם שמות התווים בדו-רה-מי. ${s.origin}. חינם ובלי הרשמה.`} path={`/music/songs/${s.slug}`} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, MUSIC_CRUMB, { label: 'שירים לפסנתר', href: '/music/songs' }, { label: s.title }]} />
    <h1 className="text-3xl sm:text-5xl text-center mb-1"><span aria-hidden="true">{s.emoji} </span>{s.title} בפסנתר</h1>
    <p className="text-center text-[var(--muted-foreground)] mb-5">{s.origin} · {'⭐'.repeat(s.level)} {LEVELS[s.level]}</p>
    <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
      {[['follow', '🙋 אני מנגן/ת'], ['watch', '👀 האזנה']].map(([m, l]) => <button key={m} type="button" className="music-chip" aria-pressed={mode === m} onClick={() => setMode(m)}>{l}</button>)}
      <LabelsChoice value={labels} onChange={setLabels} />
    </div>
    <div className="music-card">
      <div className="song-notes mb-4" aria-label="התווים של השיר">{seq.map((x, i) => <span key={i} className={i < pos ? 'is-done' : i === pos ? 'is-now' : ''}>{labels === 'letters' ? LETTER[x.n % 12] : SOLFEGE[x.n % 12]}</span>)}</div>
      <WidePiano from={range.from} to={range.to} focus={done ? null : seq[pos]?.n} marks={marks} labels={labels} onPress={onPress} />
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {mode === 'watch' && <button type="button" className="music-chip" onClick={() => (done ? restart() : setPlaying(p => !p))}>{playing ? '⏸️ עצירה' : '▶️ ניגון'}</button>}
        <button type="button" className="music-chip" onClick={restart}>🔁 מההתחלה</button>
        {mode === 'watch' && <label className="flex items-center gap-2 font-bold">🐢<input type="range" min="0.5" max="1.5" step="0.1" value={speed} onChange={e => setSpeed(+e.target.value)} aria-label="מהירות" />🐇</label>}
      </div>
      {done && mode === 'follow' && <div className="music-pop mt-5 rounded-2xl bg-emerald-50 p-4 text-center" role="status">
        <p className="text-2xl font-black">🎉 ניגנת את כל השיר!</p>
        <p className="mt-1">{mistakes === 0 ? 'בלי אף טעות — מדהים!' : `עם ${mistakes} טעויות. נסו שוב ותראו שזה יורד!`}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2"><button type="button" className="music-chip" onClick={restart}>🔁 עוד פעם</button><Link className="music-chip" to={`/music/songs/${next.slug}`}>הבא: {next.title} ←</Link></div>
      </div>}
    </div>
    <p className="mt-5 rounded-2xl bg-[var(--postit)] p-4 text-center">💡 {s.fact}</p>
    <div className="mt-10"><SeoBody paragraphs={[`"${s.title}" — ${s.origin}. המנגינה בנויה מ-${seq.length} תווים, ובמצב "אני מנגן/ת" הקליד הבא נדלק בירוק ומחכה ללחיצה, כך שאפשר לנגן את כל השיר גם בלי לדעת לקרוא תווים.`, `מתחת לפסנתר רשומים כל התווים של השיר לפי הסדר${labels === 'none' ? '' : ', עם השמות שלהם'} — מי שרוצה יכול להעתיק אותם למחברת ולנגן מהדף, על פסנתר או אורגנית בבית.`]} faq={faq} related={[{ label: 'כל השירים', href: '/music/songs' }, { label: 'פסנתר חופשי', href: '/music/piano' }, { label: 'קריאת תווים', href: '/music/read-notes' }]} /></div>
  </div>
}


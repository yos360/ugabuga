// /typing (course, hub), /typing/test, /typing/english, /typing/game
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import { shareLink } from '../utils/share'
import { LAYOUTS, LESSONS_HE, LESSONS_EN, STAGES_HE, STAGES_EN, HE_WORDS, EN_WORDS, PASSAGES_HE } from './typingData'
import { lessonText, starsFor, speedLabel, shuffled, allowedChars, wpm, accuracy } from './typingEngine'
import { useKeyCapture, useTyper, useCoarsePointer, CaptureInput, TypingText, Stats, Keyboard, Hands, FingerLegend, PhoneNotice, Stars, storeGet, storeSet } from './TypingUi'
import './typing.css'

const HUB = { label: 'הקלדה עיוורת', href: '/typing' }
const crumbs = last => [{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, ...(last ? [HUB, { label: last }] : [{ label: HUB.label }])]
const Page = ({ children }) => <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const blurActive = () => { try { document.activeElement?.blur?.() } catch { /* ignore */ } }

const TRACKS = {
  he: { layout: LAYOUTS.he, lessons: LESSONS_HE, stages: STAGES_HE, words: HE_WORDS, store: 'ugabuga-typing-he' },
  en: { layout: LAYOUTS.en, lessons: LESSONS_EN, stages: STAGES_EN, words: EN_WORDS, store: 'ugabuga-typing-en' },
}

// ── the course (shared by Hebrew and English) ───────────────────────────────
function Trainer({ track }) {
  const { layout, lessons, stages, words, store } = TRACKS[track]
  const [progress, setProgress] = useState({ stars: {}, last: 0 })
  const [idx, setIdx] = useState(0)
  const [seed, setSeed] = useState(0)
  const [wrongCode, setWrongCode] = useState(null)
  const [mobileTry, setMobileTry] = useState(false)
  const inputRef = useRef(null)
  const coarse = useCoarsePointer()
  useEffect(() => {
    const p = storeGet(store, null)
    if (p && typeof p === 'object') { setProgress({ stars: p.stars || {}, last: p.last || 0 }); setIdx(Math.min(p.last || 0, lessons.length - 1)) }
  }, [store, lessons.length])
  const lesson = lessons[idx]
  const stage = stages.find(s => s.id === lesson.stage)
  // seed in the deps → a fresh line for every "again"
  const text = useMemo(() => { void seed; return lessonText(lessons, idx, words, layout, Math.random) }, [lessons, idx, words, layout, seed])
  const t = useTyper(text)
  const onChar = useCallback((ch, code) => {
    if (t.done) { if (ch === ' ') setSeed(s => s + 1); return }
    if (ch !== t.next) { setWrongCode(code || null); setTimeout(() => setWrongCode(null), 220) }
    t.type(ch)
  }, [t])
  const onInput = useKeyCapture(onChar, true, layout)
  const stars = t.done ? starsFor(t.wpm, t.acc, stage.target) : 0
  useEffect(() => {
    if (!t.done) return
    setProgress(p => {
      const best = Math.max(p.stars[lesson.id] || 0, stars)
      const next = { stars: { ...p.stars, [lesson.id]: best }, last: idx }
      storeSet(store, next)
      return next
    })
  }, [t.done, stars, lesson.id, idx, store])
  const practiceRef = useRef(null)
  const choose = (i, scroll) => {
    setIdx(i); setSeed(s => s + 1); blurActive(); storeSet(store, { ...progress, last: i })
    if (scroll) practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const total = Object.values(progress.stars).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      {coarse && !mobileTry && <PhoneNotice onFocus={() => { setMobileTry(true); setTimeout(() => inputRef.current?.focus(), 0) }} />}
      <div ref={practiceRef} className="ty-box space-y-3" style={{ scrollMarginTop: 12 }} onClick={() => { if (mobileTry) inputRef.current?.focus() }}>
        <CaptureInput onInput={onInput} inputRef={inputRef} />
        <div>
          <p className="text-sm text-[var(--muted-foreground)] m-0">שיעור {idx + 1} · {stage.title}</p>
          <h2 className="text-2xl font-bold m-0">{lesson.title}</h2>
          <p className="m-0 mt-1">💡 {lesson.tip}</p>
        </div>
        {!t.done ? <>
          <TypingText t={t} dir={layout.dir} />
          {t.start == null && <p className="text-center font-bold m-0">{coarse && !mobileTry ? 'הקלידו את השורה במקלדת' : 'מניחים את האצבעות על שורת הבית ומתחילים להקליד — אין צורך ללחוץ על כלום'}</p>}
          <Stats t={t} />
        </> : (
          <div className="ty-result space-y-2" role="status">
            <Stars n={stars} />
            <p className="text-2xl font-bold m-0">{stars === 3 ? 'מושלם!' : stars === 2 ? 'יפה מאוד!' : 'סיימתם את השורה!'}</p>
            <p className="m-0"><b>{t.wpm}</b> מילים לדקה · דיוק <b>{t.acc}%</b> · {t.wrong} טעויות</p>
            {stars < 3 && <p className="m-0 text-[var(--muted-foreground)]">לשלושה כוכבים: דיוק של 96% ומעלה ולפחות {stage.target} מילים לדקה.</p>}
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <button type="button" className="ty-btn alt" onClick={() => { setSeed(s => s + 1); blurActive() }}>🔁 עוד שורה</button>
              {idx < lessons.length - 1 && <button type="button" className="ty-btn go" onClick={() => choose(idx + 1)}>לשיעור הבא ←</button>}
            </div>
            <p className="text-sm m-0 text-[var(--muted-foreground)]">או לחצו על רווח לשורה נוספת</p>
          </div>
        )}
        <Keyboard layout={layout} next={t.done ? null : t.next} wrongCode={wrongCode} />
        <Hands layout={layout} next={t.done ? null : t.next} />
        <FingerLegend />
      </div>
      <div className="ty-box">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <h2 className="text-xl font-bold m-0">השיעורים</h2>
          <span className="text-sm text-[var(--muted-foreground)]">⭐ {total} מתוך {lessons.length * 3}</span>
        </div>
        <div className="ty-stages">{stages.map(s => (
          <div key={s.id} className="ty-stage">
            <h3><span aria-hidden="true">{s.emoji} </span>{s.title}</h3>
            <div className="ty-lessons">
              {lessons.map((l, i) => l.stage !== s.id ? null : (
                <button key={l.id} type="button" className="ty-lesson" aria-current={i === idx} onClick={() => choose(i, true)} title={l.title}>
                  {i + 1}<small>{'⭐'.repeat(progress.stars[l.id] || 0)}</small>
                </button>
              ))}
            </div>
          </div>
        ))}</div>
      </div>

    </div>
  )
}

function Spokes({ current }) {
  const items = [
    ['/typing', '⌨️', 'קורס הקלדה עיוורת', '25 שיעורים בעברית, משורת הבית ועד מספרים'],
    ['/typing/test', '⏱️', 'מבחן מהירות הקלדה', 'דקה, שתיים או שלוש — כמה מילים לדקה?'],
    ['/typing/english', '🇬🇧', 'הקלדה עיוורת באנגלית', 'אותה שיטה על המקלדת האנגלית'],
    ['/typing/game', '🎮', 'משחק הקלדה לילדים', 'מילים נופלות מהשמיים — תקלידו לפני שהן נוחתות'],
  ].filter(i => i[0] !== current)
  return <div className="ty-spokes">{items.map(([to, e, t, d]) => <Link key={to} to={to}><b className="text-lg"><span aria-hidden="true">{e} </span>{t}</b><br /><span className="text-sm text-[var(--muted-foreground)]">{d}</span></Link>)}</div>
}

const MAPPING_ANSWER = 'כן. האתר מזהה את המקש הפיזי שנלחץ ולא רק את האות שהמחשב שלח. גם אם שפת המקלדת במחשב מוגדרת לאנגלית, לחיצה על המקש A תיחשב כ-ש, ולחיצה על המקש שמתחתיו יוצאת ז, בדיוק כמו במקלדת העברית. כך ילדים לומדים את המיקום הנכון של האותיות גם בלי להחליף שפה. אם המחשב מוגדר לעברית, הכול עובד כרגיל. בדף האנגלית זה עובד גם הפוך.'

// ── /typing ───────────────────────────────
export function TypingCourse() {
  const faq = [
    { q: 'מה זו הקלדה עיוורת?', a: 'הקלדה עיוורת (נקראת גם כתיבה עיוורת או שיטה עיוורת) היא הקלדה בכל עשר האצבעות בלי להסתכל על המקלדת. לכל אצבע יש "אזור" קבוע של מקשים, והאצבעות תמיד חוזרות לשורת הבית: ש ד ג כ ביד שמאל ו-ח ל ך ף ביד ימין.' },
    { q: 'המחשב שלי מוגדר לאנגלית. זה יעבוד?', a: MAPPING_ANSWER },
    { q: 'כמה זמן לוקח ללמוד הקלדה עיוורת בעברית?', a: 'עם 10–15 דקות של תרגול ביום, רוב הילדים והמבוגרים מכירים את כל האותיות אחרי שבועיים־שלושה. המהירות מגיעה אחר כך, מעצמה. העיקר הוא לא להציץ במקלדת, גם כשבהתחלה זה איטי.' },
    { q: 'מאיזה גיל אפשר להתחיל?', a: 'בדרך כלל מגיל 7–8, כשהילד כבר קורא בצורה שוטפת והידיים מספיק גדולות כדי להגיע לכל שורות המקלדת. לילדים צעירים יותר כדאי להתחיל דווקא במשחק ההקלדה.' },
    { q: 'איך מחושבות מילים לדקה ודיוק?', a: 'כל חמישה תווים שהוקלדו נכון (כולל רווחים) נחשבים למילה אחת, ומחלקים בזמן. הדיוק הוא אחוז ההקשות שהיו נכונות. כשמקלידים אות שגויה, הסמן נשאר במקום עד שמקלידים את האות הנכונה, והטעות נספרת.' },
  ]
  return <Page>
    <SEO title="הקלדה עיוורת בעברית — קורס חינם עם 25 שיעורים" description="לומדים הקלדה עיוורת בעברית בחינם: 25 שיעורים מדורגים משורת הבית ועד משפטים ומספרים, מקלדת צבעונית שמראה באיזו אצבע להקיש, ומדידת מילים לדקה ודיוק. לילדים ולמבוגרים." path="/typing" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={crumbs()} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">⌨️ </span>הקלדה עיוורת בעברית</h1>
    <p className="text-center text-lg mb-6 max-w-2xl mx-auto">קורס הקלדה עיוורת חינמי: לומדים להקליד בעברית בעשר אצבעות, בלי להסתכל על המקלדת. מתחילים משורת הבית, מוסיפים כל פעם שתי אותיות, והמקלדת על המסך מראה בדיוק איזו אצבע צריכה ללחוץ.</p>
    <Trainer track="he" />
    <h2 className="text-2xl font-bold mt-10 mb-3">עוד באזור ההקלדה</h2>
    <Spokes current="/typing" />
    <div className="mt-12"><SeoBody
      paragraphs={[
        'איך מתרגלים: מניחים את האצבעות המורות על כ ועל ח (יש עליהן בליטות קטנות), ואת שאר האצבעות לידן בשורת הבית. האגודלים נחים על מקש הרווח. בכל שיעור מופיעה שורה להקלדה — האות הבאה מסומנת בצהוב, המקש המתאים מהבהב במקלדת שעל המסך, והאצבע הנכונה מודגשת בציור הידיים. כל צבע במקלדת שייך לאצבע אחת.',
        'הקורס בנוי בשישה שלבים: שורת הבית, השורה העליונה, השורה התחתונה, מילים נפוצות, משפטים, ובסוף סימני פיסוק ומספרים. בכל שיעור מופיעות רק אותיות שכבר למדתם, כך שאין הפתעות. על כל שורה מקבלים עד שלושה כוכבים, וההתקדמות נשמרת בדפדפן.',
        'טיפים: דיוק לפני מהירות. עדיף להקליד לאט ונכון מאשר מהר עם טעויות — המהירות תגיע מעצמה. שבו זקוף, עם מרפקים צמודים לגוף, ואל תסתכלו על הידיים. עשר דקות ביום עדיפות על שעה פעם בשבוע. כשתרגישו בטוחים, נסו את מבחן המהירות או את משחק ההקלדה.',
      ]}
      faq={faq}
      related={[{ label: 'מבחן מהירות הקלדה', href: '/typing/test' }, { label: 'הקלדה עיוורת באנגלית', href: '/typing/english' }, { label: 'משחק הקלדה לילדים', href: '/typing/game' }, { label: 'הכתבה אונליין', href: '/learn/dictation' }]}
    /></div>
  </Page>
}

// ── /typing/english ───────────────────────────────
export function TypingEnglish() {
  const faq = [
    { q: 'איך לומדים הקלדה עיוורת באנגלית?', a: 'בדיוק כמו בעברית: האצבעות על שורת הבית (A S D F ביד שמאל, J K L ; ביד ימין), וכל אצבע אחראית על עמודה של מקשים. מתחילים מ-F ו-J, מוסיפים כל פעם כמה אותיות, ובסוף מתרגלים משפטים ואותיות גדולות.' },
    { q: 'המחשב מוגדר לעברית. צריך להחליף שפה?', a: 'לא חייבים. האתר מזהה את המקש הפיזי, כך שלחיצה על המקש של ש תיחשב כ-a. כדאי בכל זאת להתרגל להחליף שפה (Alt+Shift בווינדוס), כי כך תקלידו באמת.' },
    { q: 'כדאי ללמוד קודם עברית או אנגלית?', a: 'מיקום האצבעות זהה בשתי השפות, רק האותיות שונות. ילדים בישראל מקלידים בעיקר בעברית, ולכן מומלץ להתחיל בעברית ולהוסיף אנגלית אחרי שהאצבעות כבר יודעות את הדרך.' },
  ]
  return <Page>
    <SEO title="הקלדה עיוורת באנגלית — שיעורים חינם על המקלדת" description="הקלדה עיוורת באנגלית בחינם: 11 שיעורים משורת הבית ועד משפטים ואותיות גדולות, מקלדת צבעונית שמראה באיזו אצבע להקיש, ומדידת מילים לדקה. ההסברים בעברית." path="/typing/english" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={crumbs('באנגלית')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🇬🇧 </span>הקלדה עיוורת באנגלית</h1>
    <p className="text-center text-lg mb-6 max-w-2xl mx-auto">הקלדה עיוורת באנגלית בשיטה של הקורס בעברית: שורת הבית, השורה העליונה, התחתונה, ובסוף משפטים עם נקודה, פסיק ואותיות גדולות. ההסברים בעברית, הטקסט באנגלית.</p>
    <Trainer track="en" />
    <div className="mt-8"><Spokes current="/typing/english" /></div>
    <div className="mt-12"><SeoBody
      paragraphs={[
        'במקלדת האנגלית שורת הבית היא A S D F ו-J K L ;. האצבעות המורות מוצאות את F ואת J לפי הבליטות הקטנות, וכל שאר האצבעות מסתדרות לידן. האות הגדולה דורשת Shift — תמיד ביד שלא מקלידה את האות.',
        'אחרי ששולטים בעברית, המעבר לאנגלית מהיר: אותן אצבעות, אותם מקשים, רק אותיות אחרות. מומלץ לילדים מכיתה ד׳ ומעלה, כשכבר מכירים את האותיות באנגלית.',
      ]}
      faq={faq}
      related={[{ label: 'הקלדה עיוורת בעברית', href: '/typing' }, { label: 'אנגלית לילדים', href: '/english' }, { label: 'מבחן מהירות הקלדה', href: '/typing/test' }]}
    /></div>
  </Page>
}

// ── /typing/test ───────────────────────────────
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
export function TypingTest() {
  const [minutes, setMinutes] = useState(1)
  const [round, setRound] = useState(0)
  const [showKb, setShowKb] = useState(true)
  const [best, setBest] = useState(null)
  const [mobileTry, setMobileTry] = useState(false)
  const inputRef = useRef(null)
  const coarse = useCoarsePointer()
  useEffect(() => { setBest(storeGet('ugabuga-typing-test-best', null)) }, [])
  const text = useMemo(() => { void round; return shuffled(PASSAGES_HE).join(' ') }, [round])
  const t = useTyper(text)
  const limit = minutes * 60000
  const finished = !!t.end
  useEffect(() => { if (t.running && t.elapsed >= limit) t.stop() })
  const onChar = useCallback(ch => { if (!finished) t.type(ch) }, [t, finished])
  const onInput = useKeyCapture(onChar, !finished, LAYOUTS.he)
  const used = Math.min(t.elapsed, limit)
  const speed = finished ? wpm(t.pos, used) : t.wpm
  const acc = accuracy(t.keys - t.wrong, t.keys)
  useEffect(() => {
    if (!finished || !t.pos || used < 15000) return // a few seconds isn't a real record
    const prev = storeGet('ugabuga-typing-test-best', null)
    if (!prev || speed > prev.wpm) { const b = { wpm: speed, acc }; storeSet('ugabuga-typing-test-best', b); setBest(b) }
  }, [finished]) // only once, when the test ends
  const restart = () => { setRound(r => r + 1); blurActive() }
  const shareText = `⌨️ הקלדתי ${speed} מילים לדקה בעברית, בדיוק של ${acc}%, במבחן מהירות הקלדה של ${minutes === 1 ? 'דקה' : minutes + ' דקות'}. כמה אתם מקלידים? ${shareLink('/typing/test', 'typing_test')}`
  const faq = [
    { q: 'מה נחשב מהירות הקלדה טובה?', a: 'ילדים בכיתות ג׳–ד׳ מקלידים בדרך כלל 10–20 מילים לדקה, ומבוגרים שלא למדו הקלדה עיוורת כ-25–35. מי שמקליד בעשר אצבעות מגיע בקלות ל-40 ומעלה, ומקלדנים מקצועיים עוברים 70.' },
    { q: 'איך מחושבת התוצאה?', a: 'כל חמישה תווים נכונים (כולל רווחים) הם מילה אחת. מחלקים את מספר המילים בזמן שעבר. טעות לא מקדמת את הסמן, כך שהיא עולה לכם בזמן וגם מורידה את אחוז הדיוק.' },
    { q: 'המקלדת שלי באנגלית — אפשר לעשות את המבחן?', a: MAPPING_ANSWER },
    { q: 'הטקסטים חוזרים על עצמם?', a: 'במבחן יש יותר מעשרים קטעים קצרים שנכתבו במיוחד לאתר, והם מופיעים בסדר אקראי בכל פעם.' },
  ]
  return <Page>
    <SEO title="מבחן מהירות הקלדה בעברית — כמה מילים לדקה אתם מקלידים?" description="מבחן מהירות הקלדה בעברית של דקה, שתיים או שלוש דקות: מקלידים קטע קצר ומקבלים מילים לדקה ואחוז דיוק, עם תוצאה לשיתוף בוואטסאפ. חינם ובלי הרשמה." path="/typing/test" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={crumbs('מבחן מהירות')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">⏱️ </span>מבחן מהירות הקלדה</h1>
    <p className="text-center text-lg mb-6 max-w-2xl mx-auto">מבחן מהירות הקלדה בעברית: בוחרים זמן, מתחילים להקליד, ובסוף מקבלים כמה מילים לדקה הקלדתם ובאיזה דיוק. הטיימר מתחיל רק עם ההקשה הראשונה.</p>
    {coarse && !mobileTry && <PhoneNotice onFocus={() => { setMobileTry(true); setTimeout(() => inputRef.current?.focus(), 0) }} />}
    <div className="ty-box space-y-3" onClick={() => { if (mobileTry) inputRef.current?.focus() }}>
      <CaptureInput onInput={onInput} inputRef={inputRef} />
      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="משך המבחן">
        {[1, 2, 3].map(m => <button key={m} type="button" className="ty-chip" aria-pressed={minutes === m} disabled={t.running} onClick={() => { setMinutes(m); restart() }}>{m === 1 ? 'דקה' : m === 2 ? 'שתי דקות' : '3 דקות'}</button>)}
        <button type="button" className="ty-chip" aria-pressed={showKb} onClick={e => { setShowKb(v => !v); e.currentTarget.blur() }}>⌨️ מקלדת</button>
      </div>
      {!finished ? <>
        <TypingText t={t} dir="rtl" scroll />
        <Stats t={{ ...t, acc }} extra={fmt(Math.max(0, (limit - used) / 1000))} />
        {t.start == null && <p className="text-center font-bold m-0">מתחילים להקליד — הזמן ירוץ מההקשה הראשונה</p>}
        {t.running && <div className="text-center"><button type="button" className="ty-chip" onClick={e => { t.stop(); e.currentTarget.blur() }}>⏹ לסיים עכשיו</button></div>}
        {showKb && <><Keyboard layout={LAYOUTS.he} next={t.next} /><Hands layout={LAYOUTS.he} next={t.next} /></>}
      </> : (
        <div className="ty-result space-y-2" role="status">
          <p className="m-0 text-lg">התוצאה שלכם</p>
          <div className="big">{speed}</div>
          <p className="m-0 text-xl font-bold">מילים לדקה · {speedLabel(speed)}</p>
          <p className="m-0">דיוק <b>{acc}%</b> · {t.pos} תווים · {t.wrong} טעויות · {fmt(used / 1000)} דקות</p>
          {best && <p className="m-0 text-[var(--muted-foreground)]">השיא שלכם בדפדפן הזה: {best.wpm} מילים לדקה</p>}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <a className="ty-btn ty-share" href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">שיתוף בוואטסאפ</a>
            <button type="button" className="ty-btn alt" onClick={restart}>🔁 עוד מבחן</button>
          </div>
          {speed < 25 && <p className="m-0 pt-2">רוצים לשפר? <Link to="/typing" className="underline font-bold">התחילו את קורס ההקלדה העיוורת</Link></p>}
        </div>
      )}
    </div>
    <div className="mt-8"><Spokes current="/typing/test" /></div>
    <div className="mt-12"><SeoBody
      paragraphs={[
        'איך עושים את המבחן: בוחרים דקה, שתיים או שלוש, ומתחילים להקליד את הטקסט שמופיע. אין צורך ללחוץ על כפתור — הזמן מתחיל עם האות הראשונה. האות הבאה מסומנת בצהוב, ואות שהוקלדה בטעות נצבעת באדום.',
        'מבחן של דקה מתאים לבדיקה מהירה ולילדים. מבחן של שלוש דקות נותן תוצאה מדויקת יותר, כי הוא פחות מושפע מהתחלה איטית או מטעות אחת. כדאי לחזור על המבחן פעם בשבוע ולראות איך המספר עולה.',
      ]}
      faq={faq}
      related={[{ label: 'קורס הקלדה עיוורת', href: '/typing' }, { label: 'משחק הקלדה לילדים', href: '/typing/game' }, { label: 'אתגר לוח הכפל', href: '/learn/times-tables' }]}
    /></div>
  </Page>
}

// ── /typing/game ───────────────────────────────
const lessonIndex = id => LESSONS_HE.findIndex(l => l.id === id)
const poolUpTo = (id, maxLen) => { const a = allowedChars(LESSONS_HE, lessonIndex(id)); return HE_WORDS.filter(w => w.length <= maxLen && [...w].every(c => a.has(c))) }
const GAME_LEVELS = [
  { id: 'letters', title: 'אותיות בשורת הבית', emoji: '🐣', pool: () => 'שדגכעיחל'.split(''), speed: 26 },
  { id: 'home', title: 'מילים משורת הבית', emoji: '🏠', pool: () => poolUpTo('he-6', 5), speed: 22 },
  { id: 'top', title: 'עם השורה העליונה', emoji: '⬆️', pool: () => poolUpTo('he-11', 5), speed: 22 },
  { id: 'all', title: 'כל המקלדת', emoji: '🚀', pool: () => poolUpTo('he-16', 6), speed: 24 },
]
let dropId = 0
export function TypingGame() {
  const [level, setLevel] = useState(0)
  const [phase, setPhase] = useState('menu') // menu | play | over
  const [, setFrame] = useState(0)
  const [best, setBest] = useState({})
  const [mobileTry, setMobileTry] = useState(false)
  const [wrongCode, setWrongCode] = useState(null)
  const inputRef = useRef(null)
  const arena = useRef(null)
  const coarse = useCoarsePointer()
  const g = useRef(null)
  useEffect(() => { setBest(storeGet('ugabuga-typing-game-best', {}) || {}) }, [])

  const start = i => {
    const lv = GAME_LEVELS[i]
    g.current = { pool: lv.pool(), base: lv.speed, drops: [], pops: [], target: null, score: 0, lives: 3, spawn: 0, last: null, hits: 0 }
    setLevel(i); setPhase('play'); blurActive()
    if (mobileTry) setTimeout(() => inputRef.current?.focus(), 0)
  }
  useEffect(() => {
    if (phase !== 'play') return
    let raf
    const step = now => {
      const s = g.current
      const dt = Math.min(0.1, s.last == null ? 0 : (now - s.last) / 1000)
      s.last = now
      const h = arena.current?.clientHeight || 360
      const speed = s.base + s.hits * 1.2 // px per second, grows as you get better
      s.spawn -= dt
      if (s.spawn <= 0 && s.drops.length < 5) {
        const used = new Set(s.drops.map(d => d.text[0]))
        const options = s.pool.filter(w => !used.has(w[0]))
        const text = (options.length ? options : s.pool)[Math.floor(Math.random() * (options.length ? options.length : s.pool.length))]
        s.drops.push({ id: ++dropId, text, typed: 0, x: 14 + Math.random() * 72, y: -10 })
        s.spawn = Math.max(1.1, 3.2 - s.hits * 0.06)
      }
      for (const d of s.drops) d.y += speed * dt
      const landed = s.drops.filter(d => d.y > h * 0.7 - 34) // the grass line
      if (landed.length) {
        s.lives -= landed.length
        s.drops = s.drops.filter(d => !landed.includes(d))
        if (landed.some(d => d.id === s.target)) s.target = null
      }
      s.pops = s.pops.filter(p => now - p.t < 600)
      if (s.lives <= 0) {
        setPhase('over')
        setBest(b => { const nb = { ...b, [GAME_LEVELS[level].id]: Math.max(b[GAME_LEVELS[level].id] || 0, s.score) }; storeSet('ugabuga-typing-game-best', nb); return nb })
        return
      }
      setFrame(f => f + 1)
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, level])

  const onChar = useCallback((ch, code) => {
    const s = g.current
    if (phase !== 'play' || !s || ch === ' ') return
    let d = s.drops.find(x => x.id === s.target)
    if (!d) {
      d = s.drops.filter(x => x.text[0] === ch).sort((a, b) => b.y - a.y)[0]
      if (d) s.target = d.id
    }
    if (d && d.text[d.typed] === ch) {
      d.typed++
      if (d.typed >= d.text.length) {
        s.score += d.text.length * 10
        s.hits++
        s.pops.push({ id: d.id, x: d.x, y: d.y, t: performance.now(), n: d.text.length * 10 })
        s.drops = s.drops.filter(x => x !== d)
        s.target = null
      }
    } else { setWrongCode(code || null); setTimeout(() => setWrongCode(null), 220) }
  }, [phase])
  const onInput = useKeyCapture(onChar, phase === 'play', LAYOUTS.he)
  const s = g.current
  const target = s?.drops.find(d => d.id === s.target)
  const next = target ? target.text[target.typed] : null
  const lv = GAME_LEVELS[level]

  const faq = [
    { q: 'לאיזה גיל מתאים משחק ההקלדה?', a: 'השלב הראשון, אותיות בודדות משורת הבית, מתאים כבר לילדים בכיתה א׳ שמכירים את האותיות. השלבים עם מילים מתאימים מכיתה ב׳–ג׳ ומעלה.' },
    { q: 'איך משחקים?', a: 'מילים נופלות מלמעלה. מקלידים את האות הראשונה של מילה כדי לבחור בה, וממשיכים עד סוף המילה כדי לפוצץ אותה. כל מילה שנוחתת על הדשא מורידה לב אחד, ואחרי שלושה לבבות המשחק נגמר. ככל שמצליחים, המילים נופלות מהר יותר.' },
    { q: 'המקלדת במחשב באנגלית — זה בסדר?', a: MAPPING_ANSWER },
  ]
  return <Page>
    <SEO title="משחק הקלדה לילדים — מילים נופלות בעברית" description="משחק הקלדה לילדים בעברית: מילים נופלות מהשמיים ומקלידים אותן לפני שהן נוחתות. ארבעה שלבים לפי שיעורי ההקלדה העיוורת, ממקשי שורת הבית ועד כל המקלדת." path="/typing/game" structuredData={faqSchema(faq)} />
    <Breadcrumbs items={crumbs('משחק הקלדה')} />
    <h1 className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">🎮 </span>משחק הקלדה לילדים</h1>
    <p className="text-center text-lg mb-6 max-w-2xl mx-auto">משחק הקלדה בעברית: מילים נופלות מהשמיים, ואתם מקלידים אותן לפני שהן נוחתות על הדשא. כל שלב משתמש רק באותיות של שיעורי ההקלדה העיוורת שכבר למדתם.</p>
    {coarse && !mobileTry && <PhoneNotice onFocus={() => { setMobileTry(true); setTimeout(() => inputRef.current?.focus(), 0) }} />}
    <div className="ty-box space-y-3" onClick={() => { if (mobileTry) inputRef.current?.focus() }}>
      <CaptureInput onInput={onInput} inputRef={inputRef} />
      <div className="ty-hud">
        <span>{lv.emoji} {lv.title}</span>
        <span aria-label="ניקוד">⭐ {s?.score ?? 0}</span>
        <span aria-label="לבבות">{'❤️'.repeat(Math.max(0, s?.lives ?? 3))}{'🤍'.repeat(3 - Math.max(0, s?.lives ?? 3))}</span>
      </div>
      <div className="ty-arena" ref={arena} dir="rtl">
        {phase === 'play' && s.drops.map(d => (
          <div key={d.id} className={'ty-drop' + (d.id === s.target ? ' is-target' : '')} style={{ left: d.x + '%', top: d.y }}>
            <span className="ok">{d.text.slice(0, d.typed)}</span>{d.text.slice(d.typed)}
          </div>
        ))}
        {phase === 'play' && s.pops.map(p => <div key={'p' + p.id} className="ty-pop" style={{ left: p.x + '%', top: p.y }}>+{p.n}</div>)}
        {phase !== 'play' && (
          <div className="ty-overlay">
            {phase === 'over' && <><p className="text-3xl font-black m-0">המשחק נגמר!</p><p className="text-xl m-0">⭐ {s?.score ?? 0} נקודות{best[lv.id] ? ` · שיא: ${best[lv.id]}` : ''}</p></>}
            <p className="font-bold m-0">{phase === 'over' ? 'עוד סיבוב?' : 'בוחרים שלב:'}</p>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {GAME_LEVELS.map((l, i) => <button key={l.id} type="button" className={'ty-btn' + (i === level && phase === 'over' ? ' go' : ' alt')} onClick={() => start(i)}>{l.emoji} {l.title}{best[l.id] ? <small className="font-normal"> · שיא {best[l.id]}</small> : null}</button>)}
            </div>
          </div>
        )}
      </div>
      <Keyboard layout={LAYOUTS.he} next={next} wrongCode={wrongCode} />
    </div>
    <div className="mt-8"><Spokes current="/typing/game" /></div>
    <div className="mt-12"><SeoBody
      paragraphs={[
        'המשחק הוא תרגול הקלדה בתחפושת: הילדים צריכים להקליד מהר ונכון, אבל מרגישים שהם רק מפוצצים מילים. כל שלב מתאים לשיעורים בקורס: קודם רק אותיות משורת הבית, אחר כך מילים מאותן אותיות, ובסוף כל המקלדת.',
        'טיפ להורים: בקשו מהילד להשאיר את האצבעות על שורת הבית ולהסתכל על המסך ולא על הידיים. המקלדת שמתחת למשחק מראה איזה מקש ללחוץ — בהתחלה זה עוזר, ובהמשך כבר לא צריך אותה.',
      ]}
      faq={faq}
      related={[{ label: 'קורס הקלדה עיוורת', href: '/typing' }, { label: 'משחקי אונליין', href: '/online-games' }, { label: 'משחק אותיות לגן', href: '/letters/game' }]}
    /></div>
  </Page>
}

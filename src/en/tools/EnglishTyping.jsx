// /en/typing: the touch-typing course (QWERTY track) with an English interface. The engine, lessons, keyboard
// and hands drawing come from src/typing; only the words differ. Progress is shared with the Hebrew page of the
// same track (the lessons are the same), stored in this browser only.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LAYOUTS, LESSONS_EN, STAGES_EN, EN_WORDS } from '../../typing/typingData'
import { lessonText, starsFor } from '../../typing/typingEngine'
import { useKeyCapture, useTyper, useCoarsePointer, CaptureInput, TypingText, Stats, Keyboard, Hands, FingerLegend, PhoneNotice, Stars, storeGet, storeSet } from '../../typing/TypingUi'
import '../../typing/typing.css'
import ToolFrame from './ToolFrame'

const PATH = '/en/typing'
const STORE = 'ugabuga-typing-en'
const layout = LAYOUTS.en
const blurActive = () => { try { document.activeElement?.blur?.() } catch { /* ignore */ } }

const TIPS = {
  'en-1': 'Rest your index fingers on F and J. They have small bumps you can feel without looking.',
  'en-2': 'Your middle fingers go on D and K.',
  'en-3': 'Your ring fingers go on S and L.',
  'en-4': 'The left pinky rests on A, and your index fingers stretch inward to G and H.',
  'en-5': 'Your index fingers reach up to R and U, and your middle fingers to E and I.',
  'en-6': 'Your index fingers stretch to T and Y, and your ring fingers reach up to W and O.',
  'en-7': 'Your pinkies reach up: left to Q, right to P.',
  'en-8': 'Your index fingers reach down to V and M (and N), and the left middle finger to C.',
  'en-9': 'The left index finger goes to B, the ring finger to X and the pinky to Z.',
  'en-10': 'Whole sentences with a period and a comma.',
  'en-11': 'A capital letter means holding Shift with the other hand and pressing the letter.',
}

// The Hebrew words that the shared typing components show, in English.
const WORDS = {
  'הקלדה': 'Typing', 'הטקסט להקלדה': 'Text to type', 'מילים לדקה': 'Words per minute', 'דיוק': 'Accuracy', 'טעויות': 'Mistakes', 'התקדמות': 'Progress', 'זמן': 'Time', 'רווח': 'Space',
  'האצבע להקשה: ': 'Finger to use: ', 'ידיים על המקלדת': 'Hands on the keyboard', 'אצבע:': 'Finger:',
  'זרת שמאל': 'left pinky', 'קמיצה שמאל': 'left ring finger', 'אמה שמאל': 'left middle finger', 'אצבע מורה שמאל': 'left index finger',
  'אצבע מורה ימין': 'right index finger', 'אמה ימין': 'right middle finger', 'קמיצה ימין': 'right ring finger', 'זרת ימין': 'right pinky', 'אגודל': 'thumb',
  '💻 הקלדה עיוורת לומדים על מקלדת של מחשב.': '💻 Touch typing is learned on a computer keyboard.',
  'בטלפון אין מקשים שאפשר למשש, ולכן מומלץ לפתוח את הדף במחשב או לחבר מקלדת לטאבלט. אפשר בכל זאת לקרוא את ההסבר ולנסות עם המקלדת שעל המסך.': 'A phone has no keys you can feel, so open this page on a computer, or attach a keyboard to a tablet. You can still read the explanations and try the on-screen keyboard.',
  '📱 לנסות עם מקלדת הטלפון': '📱 Try with the phone keyboard',
}
const tr = s => {
  const m = /^(\d) כוכבים מתוך 3$/.exec(s)
  return m ? `${m[1]} of 3 stars` : (WORDS[s] ?? s)
}

const FAQ = [
  { q: 'What is touch typing?', a: 'Touch typing means typing with all ten fingers without looking at the keyboard. Every finger has a fixed zone of keys, and the fingers always return to the home row: A S D F with the left hand and J K L ; with the right.' },
  { q: 'How long does it take to learn?', a: 'With 10 to 15 minutes of practice a day, most children and adults know every letter after two or three weeks. Speed comes later, by itself. The main thing is not to peek at the keyboard, even when it feels slow at the start.' },
  { q: 'My computer is set to another language. Will this work?', a: 'You do not have to switch. The page reads the physical key you press, not only the letter your computer sends, so the key marked with a Hebrew letter on an Israeli keyboard still counts as the English letter on the same key. It is still a good idea to practice with your keyboard set to English.' },
  { q: 'How are words per minute and accuracy calculated?', a: 'Every five correctly typed characters (spaces included) count as one word, divided by the time. Accuracy is the share of key presses that were right. When you press a wrong key the cursor stays in place until you type the right one, and the mistake is counted.' },
  { q: 'What age can start?', a: 'Usually from age 7 or 8, when a child reads fluently and the hands are big enough to reach every row of the keyboard. For younger children a typing game is a better start.' },
]

function Trainer() {
  const lessons = LESSONS_EN, stages = STAGES_EN
  const [progress, setProgress] = useState({ stars: {}, last: 0 })
  const [idx, setIdx] = useState(0)
  const [seed, setSeed] = useState(0)
  const [wrongCode, setWrongCode] = useState(null)
  const [mobileTry, setMobileTry] = useState(false)
  const inputRef = useRef(null)
  const coarse = useCoarsePointer()
  useEffect(() => {
    const p = storeGet(STORE, null)
    if (p && typeof p === 'object') { setProgress({ stars: p.stars || {}, last: p.last || 0 }); setIdx(Math.min(p.last || 0, lessons.length - 1)) }
  }, [lessons.length])
  const lesson = lessons[idx]
  const stage = stages.find(s => s.id === lesson.stage)
  const text = useMemo(() => { void seed; return lessonText(lessons, idx, EN_WORDS, layout, Math.random) }, [lessons, idx, seed])
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
      storeSet(STORE, next)
      return next
    })
  }, [t.done, stars, lesson.id, idx])
  const practiceRef = useRef(null)
  const choose = (i, scroll) => {
    setIdx(i); setSeed(s => s + 1); blurActive(); storeSet(STORE, { ...progress, last: i })
    if (scroll) practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const total = Object.values(progress.stars).reduce((a, b) => a + b, 0)

  return <div className="space-y-4 ty-en">
    {coarse && !mobileTry && <PhoneNotice tr={tr} onFocus={() => { setMobileTry(true); setTimeout(() => inputRef.current?.focus(), 0) }} />}
    <div ref={practiceRef} className="ty-box space-y-3" style={{ scrollMarginTop: 12 }} onClick={() => { if (mobileTry) inputRef.current?.focus() }}>
      <CaptureInput onInput={onInput} inputRef={inputRef} t={tr} />
      <div>
        <p className="text-sm text-[var(--muted-foreground)] m-0">Lesson {idx + 1} · {stage.title}</p>
        <h2 className="text-2xl font-bold m-0">{lesson.title}</h2>
        <p className="m-0 mt-1">💡 {TIPS[lesson.id]}</p>
      </div>
      {!t.done ? <>
        <TypingText t={t} dir="ltr" tr={tr} />
        {t.start == null && <p className="text-center font-bold m-0">{coarse && !mobileTry ? 'Type the line on your keyboard' : 'Place your fingers on the home row and start typing. There is nothing to press first.'}</p>}
        <Stats t={t} tr={tr} />
      </> : (
        <div className="ty-result space-y-2" role="status">
          <Stars n={stars} tr={tr} />
          <p className="text-2xl font-bold m-0">{stars === 3 ? 'Perfect!' : stars === 2 ? 'Very nice!' : 'You finished the line!'}</p>
          <p className="m-0"><b>{t.wpm}</b> words per minute · accuracy <b>{t.acc}%</b> · {t.wrong} {t.wrong === 1 ? 'mistake' : 'mistakes'}</p>
          {stars < 3 && <p className="m-0 text-[var(--muted-foreground)]">For three stars: accuracy of 96% or higher and at least {stage.target} words per minute.</p>}
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button type="button" className="ty-btn alt" onClick={() => { setSeed(s => s + 1); blurActive() }}>🔁 Another line</button>
            {idx < lessons.length - 1 && <button type="button" className="ty-btn go" onClick={() => choose(idx + 1)}>Next lesson →</button>}
          </div>
          <p className="text-sm m-0 text-[var(--muted-foreground)]">Or press space for another line</p>
        </div>
      )}
      <Keyboard layout={layout} next={t.done ? null : t.next} wrongCode={wrongCode} tr={tr} />
      <Hands layout={layout} next={t.done ? null : t.next} tr={tr} />
      <FingerLegend tr={tr} />
    </div>
    <div className="ty-box">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <h2 className="text-xl font-bold m-0">Lessons</h2>
        <span className="text-sm text-[var(--muted-foreground)]">⭐ {total} of {lessons.length * 3}</span>
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
}

export default function EnglishTyping() {
  return <ToolFrame path={PATH} width="max-w-4xl" h1="Touch typing course, free" intro="Learn to type with ten fingers without looking at the keyboard. Start from the home row, add a few letters in every lesson, and watch the on-screen keyboard show exactly which finger should press each key."
    bodyTitle="How the course works" faq={FAQ}
    paragraphs={[
      'How to practice: rest your index fingers on F and J (they have small bumps) and the other fingers beside them on the home row. Your thumbs rest on the space bar. In each lesson a line of text appears: the next letter is marked in yellow, the matching key flashes on the on-screen keyboard, and the right finger is highlighted in the picture of the hands. Every color on the keyboard belongs to one finger.',
      'The course has four stages: the home row, the top row, the bottom row, and then whole sentences with a period, a comma and capital letters. Each lesson uses only letters you already learned, so there are no surprises. You earn up to three stars for each line, and your progress is saved in this browser.',
      'Tips: accuracy before speed. It is better to type slowly and correctly than fast with mistakes, because speed comes by itself. Sit upright with your elbows close to your body, and do not look at your hands. Ten minutes a day beat one hour once a week.',
    ]}
    related={[{ href: '/en/tools/hebrew-keyboard', label: 'the online Hebrew keyboard' }, { href: '/en/tools', label: 'all free tools' }]}>
    <Trainer />
  </ToolFrame>
}

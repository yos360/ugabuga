import { useMemo, useState } from 'react'
import PrintableShell, { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { POSITIONS, SOUND_LETTERS, pickSoundQuestions } from '../../data/soundPosition'
import { emojiFile } from '../../data/englishWords'
import { makeRng, newSeed } from '../../motor/rng'
import SoundPositionGame from './SoundPositionGame'

// /printables/sound-position — "איפה שומעים את הצליל?": 12 cards per A4, each with a letter, a picture and
// three boxes (start / middle / end, right to left). Every refresh deals a new set; an answer key closes the set.
// The same questions also play online at the top of the page (SoundPositionGame), with the same letter and level choices.
const PATH = '/printables/sound-position'
const ALL = ['start', 'middle', 'end'], EDGES = ['start', 'end']
const FONT = 'Heebo, Arial, sans-serif'
const TINTS = ['#fde2e4', '#dbeafe', '#fef3c7', '#dcfce7', '#ede9fe', '#ffedd5']
const art = emoji => `/print-art/words/${emojiFile(emoji)}.svg`
const COLS = 4, CW = 45, CH = 76, GX = (200 - 10 - COLS * CW) / (COLS - 1), GY = 4, Y0 = 24
const at = i => ({ X: 5 + (COLS - 1 - (i % COLS)) * (CW + GX), Y: Y0 + Math.floor(i / COLS) * (CH + GY) })

function Card({ q, i, color, showWord, answer }) {
  const { X, Y } = at(i), pic = showWord ? 30 : 36
  return <g fontFamily={FONT}>
    <rect x={X} y={Y} width={CW} height={CH} rx={3} fill="#fff" stroke="#555" strokeWidth={0.5} />
    <path d={`M${X} ${Y + 14}V${Y + 3}a3 3 0 0 1 3-3h${CW - 6}a3 3 0 0 1 3 3V${Y + 14}Z`} fill={color ? TINTS[i % TINTS.length] : '#fff'} />
    <line x1={X} x2={X + CW} y1={Y + 14} y2={Y + 14} stroke="#555" strokeWidth={0.4} />
    <T x={X + CW / 2} y={Y + 11} size={11} weight={800}>{q.show}</T>
    <image href={art(q.emoji)} x={X + (CW - pic) / 2} y={Y + 17} width={pic} height={pic} />
    {showWord && <T x={X + CW / 2} y={Y + 55} size={6.5} weight={700}>{q.word}</T>}
    {POSITIONS.map((p, k) => { const bx = X + CW - 4 - 8 - k * 14.5; return <g key={p.id}>
      <T x={bx + 4} y={Y + 62} size={3.6}>{p.label}</T>
      <rect x={bx} y={Y + 64} width={8} height={8} rx={1} fill="#fff" stroke="#222" strokeWidth={0.5} />
      {answer && p.id === q.pos && <T x={bx + 4} y={Y + 70.6} size={7} weight={800} fill="#15803d">✓</T>}
    </g> })}
  </g>
}

function CardsSheet({ qs, color, showWord, page, pages, answer }) {
  return <Sheet label={`איפה שומעים את הצליל ${page}/${pages}${answer ? ' — תשובות' : ''}`}>
    <T x={100} y={10} size={7.5} weight={800}>{answer ? '✅ תשובות — ' : ''}איפה שומעים את הצליל?</T>
    <T x={100} y={18} size={4.6} fill="#444">אומרים את שם התמונה בקול ומסמנים ✓ איפה שומעים את הצליל שלמעלה</T>
    {!answer && <T x={22} y={10} size={4.6} fill="#444">שם: __________</T>}
    {qs.map((q, i) => <Card key={q.emoji} q={q} i={i} color={color} showWord={showWord || answer} answer={answer} />)}
    <T x={100} y={267} size={4.2} fill="#666">{page}/{pages} · המשבצת הימנית היא ההתחלה</T>
  </Sheet>
}

const chip = on => `min-h-[44px] min-w-[44px] rounded-xl border-2 px-2 text-xl font-bold ${on ? 'border-violet-600 bg-violet-100' : 'border-slate-300 bg-white text-slate-400'}`

export default function SoundPosition() {
  const [seed, setSeed] = useState(1), [count, setCount] = useState('2'), [level, setLevel] = useState('all')
  const [color, setColor] = useState('color'), [word, setWord] = useState('no'), [key, setKey] = useState('yes')
  const [letters, setLetters] = useState(SOUND_LETTERS)
  const sheets = useMemo(() => {
    const rng = makeRng(seed), used = new Set(), positions = level === 'edges' ? EDGES : ALL
    return Array.from({ length: Number(count) }, () => { const qs = pickSoundQuestions(rng, { letters, positions, used }); qs.forEach(q => used.add(q.emoji)); return qs }).filter(qs => qs.length)
  }, [seed, count, letters, level])
  const toggle = l => setLetters(ls => { const next = ls.includes(l) ? ls.filter(x => x !== l) : [...ls, l]; return next.length ? SOUND_LETTERS.filter(x => next.includes(x)) : ls })
  const n = sheets.length, colored = color === 'color', shown = word === 'yes'
  const pages = [
    ...sheets.map((qs, i) => ({ key: `q-${seed}-${i}-${color}-${word}`, svg: <CardsSheet qs={qs} color={colored} showWord={shown} page={i + 1} pages={n} /> })),
    ...(key === 'yes' ? sheets.map((qs, i) => ({ key: `a-${seed}-${i}-${color}`, svg: <CardsSheet qs={qs} color={colored} page={i + 1} pages={n} answer /> })) : []),
  ]
  return <PrintableShell path={PATH} emoji="👂" h1="איפה שומעים את הצליל? — משחק ודפי עבודה"
    seoTitle="איפה שומעים את הצליל — בהתחלה, באמצע או בסוף (משחק אונליין ודפי עבודה)"
    description="מודעות פונולוגית בחינם: אות, תמונה ושלוש משבצות — שומעים את הצליל בהתחלה, באמצע או בסוף המילה? משחק אונליין עם הקראה, ודפי עבודה להדפסה עם 12 כרטיסים בדף ודף תשובות. לגן חובה ולכיתה א׳."
    sub="משחקים אונליין או מדפיסים · אות, תמונה ושלוש משבצות · דפים חדשים בכל לחיצה"
    lead={<SoundPositionGame key={`${level}-${letters.join('')}`} letters={letters} positions={level === 'edges' ? EDGES : ALL} />}
    crumbs={[{ label: 'אותיות', href: '/letters' }]} previewAll onRefresh={() => setSeed(newSeed())}
    controls={<>
      <Choice label="מה מתרגלים" value={level} onChange={v => { setLevel(v); setSeed(newSeed()) }} options={[['all', 'התחלה, אמצע וסוף'], ['edges', 'רק התחלה וסוף (קל יותר)']]} />
      <Choice label="כמה דפים" value={count} onChange={setCount} options={[['1', 'דף אחד'], ['2', '2 דפים'], ['3', '3 דפים'], ['5', '5 דפים']]} />
      <Choice label="מילה מתחת לתמונה" value={word} onChange={setWord} options={[['no', 'בלי מילה (שמיעה)'], ['yes', 'עם המילה המנוקדת']]} />
      <Choice label="צבע" value={color} onChange={setColor} options={[['color', '🎨 צבעוני'], ['bw', '⚫ שחור־לבן']]} />
      <Choice label="דף תשובות" value={key} onChange={setKey} options={[['yes', '✅ עם דף תשובות'], ['no', 'בלי']]} />
      <details className="w-full rounded-2xl border-2 border-[var(--border)] bg-white p-3" dir="rtl">
        <summary className="cursor-pointer font-bold">🔤 לבחור אותיות ({letters.length === SOUND_LETTERS.length ? 'כל האותיות' : letters.join(' ')})</summary>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="אותיות לתרגול">{SOUND_LETTERS.map(l => <button key={l} type="button" aria-pressed={letters.includes(l)} className={chip(letters.includes(l))} onClick={() => toggle(l)}>{l}</button>)}</div>
        <button type="button" className="mt-2 rounded-xl border-2 border-slate-300 px-3 py-1 font-bold" onClick={() => setLetters(SOUND_LETTERS)}>כל האותיות</button>
      </details>
    </>}
    pages={pages}
    paragraphs={[
      'לפני שקוראים, צריך לשמוע. ילד שיודע לומר איפה במילה מסתתר צליל — בהתחלה, באמצע או בסוף — מוכן לחבר אותיות למילים. זו מודעות פונולוגית, ובגן חובה ובכיתה א׳ מתרגלים אותה הרבה.',
      'בכל כרטיס יש אות, תמונה ושלוש משבצות. אומרים את שם התמונה בקול ולאט, ומסמנים איפה שמענו את הצליל של האות. המשבצת הימנית היא ההתחלה, כי בעברית קוראים מימין לשמאל.',
      'אפשר גם לשחק אונליין, בראש העמוד: עשר שאלות בסיבוב, כפתור שמקריא את המילה, וצליל לתשובה נכונה. אחרי כל תשובה מופיעה המילה המנוקדת, והאות שחיפשנו מסומנת בה — כך רואים בדיוק איפה היא.',
      'כל המילים מנוקדות ונבדקו אחת־אחת: לא שואלים על אות שלא שומעים (כמו ה׳ בסוף "יונה"), ולא על מילה שיש בה שתי אותיות עם אותו צליל (כמו ט׳ ות׳ ב"טבעת"). כך לכל כרטיס יש תשובה אחת נכונה. בכל לחיצה על "דף חדש" יוצא סט אחר, ובסוף הסט יש דף תשובות.',
    ]}
    faq={[
      { q: 'לאיזה גיל מתאימים הדפים?', a: 'לגן חובה ולכיתה א׳. לקטנים כדאי להתחיל ב"רק התחלה וסוף", ולהוסיף את האמצע כשזה כבר קל להם.' },
      { q: 'למה כתוב בּ ולא ב?', a: 'כי לב׳ עם נקודה ולב׳ בלי נקודה יש צליל אחר: בּ כמו ב"בית", וב כמו ב"חלב". אותו דבר בכּ ובכ, ובפּ ובפ. כך הילד מחפש בדיוק את הצליל שהוא שומע.' },
      { q: 'מה עושים כשהילד לא בטוח?', a: 'אומרים את המילה לאט ומותחים את הצלילים: "גגגגָ־מָ־ל". אפשר גם למחוא כף על כל הברה, ולשאול באיזו מחיאה שמענו את הצליל.' },
      { q: 'אפשר לתרגל רק כמה אותיות?', a: 'כן. ב"לבחור אותיות" מסמנים רק את האותיות שלמדתם, והדפים והמשחק אונליין ייבנו רק מהן.' },
      { q: 'אפשר לשחק בטלפון או בטאבלט?', a: 'כן. המשחק בראש העמוד עובד בכל דפדפן, בלי הורדה ובלי הרשמה. כדי לשמוע את המילה לוחצים על 🔊.' },
    ]}
    related={[{ label: 'קוראים רק מה שלמדנו', href: '/letters/reading-practice' }, { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }, { label: 'פאזל מילה', href: '/printables/word-puzzles' }]} />
}

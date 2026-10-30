import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { Choice } from '../../components/printables/PrintableShell'
import { vocalizeAll } from '../../utils/nikudText'
import { SOUNDS, loadSound, itemsFor, POSITIONS, LEVELS } from '../../data/speech/sounds'
import SpeechNote from './SpeechNote'
import { buildSheets, SheetsPreview, OUTPUTS, CARD_COUNTS } from './speechSheets'

// /speech/card-maker — builds printable speech-practice materials from any sounds in the registry
// (src/data/speech/sounds.js): a new sound data file shows up here with no change to this page.

const PATH = '/speech/card-maker'
const HAS_VOWELS = /[ְ-ׇֻ]/

// Niqqud through the site's Nakdan proxy (Dicta). Already-vocalised texts (syllables) are kept.
function useNikud(strings, on) {
  const todo = strings.filter(s => !HAS_VOWELS.test(s))
  const key = todo.join('\u0001')
  const [res, setRes] = useState({ key: '', map: null, state: 'idle' })
  useEffect(() => {
    if (!on || res.key === key) return undefined
    let alive = true
    vocalizeAll(todo).then(map => { if (alive) setRes({ key, map, state: 'ready' }) }).catch(() => { if (alive) setRes({ key, map: null, state: 'error' }) })
    return () => { alive = false }
  }, [on, key]) // eslint-disable-line react-hooks/exhaustive-deps
  const ready = on && res.key === key && res.map
  return { v: s => (ready ? res.map.get(s) || s : s), state: !on ? 'off' : res.key === key ? res.state : 'loading' }
}

const faq = [
  { q: 'מה אפשר להכין במחולל?', a: 'כרטיסיות עם תמונה ומילה (6, 12 או 20 בדף, עם קווי גזירה), לוחות בינגו 3×3 או 4×4 שכל אחד מהם שונה, לוטו עם כרטיסים באותו גודל כמו המשבצות, משחק זיכרון בזוגות וטבלת תרגול בבית — ימים × חזרות עם הסבר להורים.' },
  { q: 'אפשר לשלב כמה צלילים באותו דף?', a: 'כן. מסמנים כמה צלילים (למשל ר׳ וס׳), בוחרים מיקום ורמה, והפריטים של כל הצלילים נכנסים לאותם כרטיסים או לוחות. אפשר להוריד פריטים בלחיצה ולהוסיף מילים משלכם.' },
  { q: 'איך עובד הניקוד?', a: 'הניקוד נוסף אוטומטית בעזרת הנקדן של דיקטה. ברוב המילים הוא מדויק, אבל כדאי להעיף מבט לפני ההדפסה — בעיקר במילים שאפשר לקרוא בשתי דרכים.' },
  { q: 'למה אין "ציון" או בדיקת הגייה?', a: 'כי בדיקה אוטומטית של הגייה אצל ילדים אינה אמינה ועלולה להטעות. המשוב נשאר אצל המבוגר שמקשיב — קלינאית או הורה — והדפים סופרים ניסיונות, לא הצלחות.' },
  { q: 'החומרים חינמיים? מותר להשתמש בהם בקליניקה?', a: 'כן, הכול חינם ובלי הרשמה, לבית, לגן ולקליניקה. אפשר לשנות הגדרות ולהדפיס שוב כמה פעמים שרוצים.' },
]

export default function CardMaker() {
  const [all, setAll] = useState({})
  const [chosen, setChosen] = useState([SOUNDS[0].id])
  const [position, setPosition] = useState('initial')
  const [level, setLevel] = useState('words')
  const [out, setOut] = useState('cards')
  const [per, setPer] = useState(12)
  const [bingo, setBingo] = useState(3)
  const [boards, setBoards] = useState(6)
  const [pictures, setPictures] = useState(true)
  const [nikud, setNikud] = useState(false)
  const [seed, setSeed] = useState(1)
  const [off, setOff] = useState(() => new Set())
  const [custom, setCustom] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all(SOUNDS.map(s => loadSound(s.id).then(d => [s.id, d]))).then(list => { if (alive) setAll(Object.fromEntries(list)) })
    return () => { alive = false }
  }, [])

  const byPosition = level === 'words' || level === 'syllables'
  const pool = useMemo(() => {
    const seen = new Set(), list = []
    for (const id of chosen) {
      const d = all[id]
      if (!d) continue
      for (const it of itemsFor(d, level, byPosition ? position : 'all')) if (!seen.has(it.t)) { seen.add(it.t); list.push({ ...it, sound: id }) }
    }
    return list
  }, [all, chosen, level, position, byPosition])
  const extra = custom.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 40).map(t => ({ t, custom: true }))
  const items = [...pool.filter(i => !off.has(i.t)), ...extra]
  const nk = useNikud(items.map(i => i.t), nikud)
  const shown = items.map(i => ({ ...i, t: nk.v(i.t) }))

  const soundsLabel = SOUNDS.filter(s => chosen.includes(s.id)).map(s => s.label).join(' + ')
  const posLabel = byPosition ? ` ${(POSITIONS.find(p => p[0] === position) || ['all', 'בכל המיקומים'])[1]}` : ''
  const autoTitle = `${soundsLabel} — ${LEVELS.find(l => l[0] === level)[1]}${posLabel}`
  const sheetTitle = title.trim() || (out === 'bingo' ? `בינגו ${soundsLabel}` : out === 'lotto' ? `לוטו ${soundsLabel}` : out === 'memory' ? `זיכרון ${soundsLabel}` : out === 'log' ? 'טבלת תרגול בבית' : autoTitle)
  const pages = buildSheets(out, shown, { per, size: bingo, boards, seed, pictures, title: sheetTitle, soundLabel: soundsLabel })

  const toggleSound = id => { setChosen(l => (l.includes(id) ? (l.length > 1 ? l.filter(x => x !== id) : l) : [...l, id])); setOff(new Set()) }
  const toggleItem = t => setOff(s => { const n = new Set(s); if (n.has(t)) n.delete(t); else n.add(t); return n })
  const needBingo = out === 'bingo' && items.length < bingo * bingo

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מחולל כרטיסיות היגוי: כרטיסיות, בינגו ולוטו לפי צליל" description="מחולל כרטיסיות היגוי לקלינאיות תקשורת ולהורים: בוחרים צליל, מיקום ורמה ומקבלים כרטיסיות עם תמונות, בינגו, לוטו, משחק זיכרון וטבלת תרגול בבית להדפסה. חינם." path={PATH} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'מחולל כרטיסיות' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">🃏 </span>מחולל כרטיסיות היגוי</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">צליל + מיקום + רמה ← כרטיסיות, בינגו, לוטו, זיכרון או טבלת תרגול — מוכן להדפסה</p>
    <QuickAnswer q="איך מכינים כרטיסיות היגוי להדפסה?"
      a="מסמנים צליל אחד או כמה, בוחרים איפה הצליל נמצא במילה (בתחילה, באמצע, בסוף או בצירוף) ואת הרמה — הברות, מילים, צירופים קצרים או משפטים. אחר כך בוחרים מה להדפיס: כרטיסיות, בינגו, לוטו, זוגות לזיכרון או טבלת תרגול בבית, ולוחצים על הדפסה."
      rows={[['צלילים', SOUNDS.map(s => s.label).join(', ')], ['פלט', 'כרטיסיות 6/12/20 בדף, בינגו 3×3/4×4, לוטו, זיכרון, טבלת תרגול'], ['אפשרויות', 'עם או בלי תמונות, ניקוד, מילים משלכם, כותרת לדף'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated="2026-10-24" />
    <SpeechNote />

    <section aria-label="הגדרות" className="mx-auto mb-8 max-w-3xl space-y-4 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm">
      <div className="text-center">
        <p className="mb-2 font-bold">אילו צלילים?</p>
        <div className="flex flex-wrap justify-center gap-2">{SOUNDS.map(s => <button key={s.id} type="button" aria-pressed={chosen.includes(s.id)} onClick={() => toggleSound(s.id)}
          className={`min-h-[44px] rounded-xl border-2 px-4 py-1.5 text-lg font-bold ${chosen.includes(s.id) ? 'border-slate-800 bg-white' : 'border-slate-200 bg-slate-100 text-slate-500'}`}><span aria-hidden="true">{s.emoji} </span>{s.label}</button>)}</div>
      </div>
      <Choice label="רמה" value={level} onChange={v => { setLevel(v); setOff(new Set()) }} options={LEVELS} />
      {byPosition
        ? <Choice label="מיקום הצליל" value={position} onChange={v => { setPosition(v); setOff(new Set()) }} options={[...(level === 'syllables' ? POSITIONS.filter(p => p[0] !== 'clusters') : POSITIONS), ['all', 'הכול']]} />
        : <p className="text-center text-sm text-[var(--muted-foreground)]">בצירופים ובמשפטים הצליל מופיע בכמה מקומות, ולכן אין בחירת מיקום.</p>}
      <Choice label="מה מדפיסים" value={out} onChange={setOut} options={OUTPUTS} />
      {out === 'cards' && <Choice label="כמה כרטיסים בדף" value={per} onChange={setPer} options={CARD_COUNTS} />}
      {out === 'bingo' && <>
        <Choice label="גודל לוח" value={bingo} onChange={setBingo} options={[[3, '3×3'], [4, '4×4']]} />
        <Choice label="כמה לוחות" value={boards} onChange={setBoards} options={[[2, '2'], [4, '4'], [6, '6'], [8, '8'], [10, '10']]} />
      </>}
      <Choice label="תמונות" value={pictures ? 'y' : 'n'} onChange={v => setPictures(v === 'y')} options={[['y', 'עם תמונות'], ['n', 'מילים בלבד']]} />
      <Choice label="ניקוד" value={nikud ? 'y' : 'n'} onChange={v => setNikud(v === 'y')} options={[['n', 'בלי ניקוד'], ['y', 'עם ניקוד']]} />
      {nk.state === 'loading' && <p className="text-center text-sm" role="status">מוסיף ניקוד…</p>}
      {nk.state === 'error' && <p className="text-center text-sm text-red-700" role="status">הניקוד האוטומטי לא זמין כרגע — הדפים יודפסו בלי ניקוד.</p>}
      {nk.state === 'ready' && <p className="text-center text-sm text-[var(--muted-foreground)]">הניקוד אוטומטי (נקדן דיקטה) — כדאי לעבור עליו לפני ההדפסה.</p>}
      <label className="block text-center font-bold">כותרת לדף (לא חובה)
        <input value={title} maxLength={60} placeholder={out === 'log' ? 'טבלת תרגול בבית' : autoTitle} onChange={e => setTitle(e.target.value)} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
      </label>
    </section>

    <section aria-label="הפריטים" className="mx-auto mb-8 max-w-3xl">
      <h2 className="mb-2 text-center text-2xl font-bold">הפריטים ({items.length})</h2>
      <p className="mb-3 text-center text-sm text-[var(--muted-foreground)]">לוחצים על פריט כדי להוריד אותו מההדפסה (ושוב — כדי להחזיר).</p>
      <div className="flex flex-wrap justify-center gap-2">{pool.map(it => <button key={it.t} type="button" aria-pressed={!off.has(it.t)} onClick={() => toggleItem(it.t)}
        className={`min-h-[40px] rounded-full border-2 px-3 py-1 font-bold ${off.has(it.t) ? 'border-slate-200 bg-slate-100 text-slate-400 line-through' : 'border-slate-300 bg-white'}`}>{it.e && <span aria-hidden="true">{it.e} </span>}{it.t}</button>)}</div>
      <label className="mt-4 block text-center font-bold">מילים משלכם — מילה או משפט בכל שורה
        <textarea value={custom} onChange={e => setCustom(e.target.value)} rows={3} placeholder={'למשל:\nרוני\nאריה'} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
      </label>
      {needBingo && <p className="mt-2 text-center font-bold text-red-700" role="status">ללוח {bingo}×{bingo} צריך לפחות {bingo * bingo} פריטים — בחרו "הכול", הוסיפו צליל או מילים משלכם.</p>}
    </section>

    <SheetsPreview pages={pages} title={sheetTitle} onRefresh={out === 'bingo' || out === 'lotto' || out === 'memory' ? () => setSeed(s => s + 1) : null} />

    <div className="mx-auto mt-12 max-w-3xl space-y-5">
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold">איך משתמשים בחומרים — לקלינאיות ולהורים</h2>
        <ul className="space-y-1.5 leading-relaxed">
          <li className="mr-5 list-disc"><b>כרטיסיות:</b> לתרגול "10 חזרות", למשחקי מחבואים בחדר, לשליפה מתוך שקית, או כמסלול על הרצפה.</li>
          <li className="mr-5 list-disc"><b>בינגו:</b> כל לוח שונה. מי ששולף כרטיס קריאה אומר את המילה, וכל מי שיש לו אותה מכסה משבצת ואומר אותה גם.</li>
          <li className="mr-5 list-disc"><b>לוטו:</b> כל ילד מקבל לוח; שולפים כרטיס, אומרים את המילה ומניחים אותה על הלוח הנכון. מתאים גם לגן.</li>
          <li className="mr-5 list-disc"><b>זיכרון:</b> מדפיסים, גוזרים ומערבבים. בכל פעם שהופכים כרטיס — אומרים את המילה בקול.</li>
          <li className="mr-5 list-disc"><b>טבלת תרגול בבית:</b> הקלינאית ממלאת את המטרה לשבוע, ההורים צובעים עיגול על כל חזרה ומביאים את הדף לפגישה הבאה.</li>
        </ul>
      </section>
      <p className="text-center">רוצים לתרגל צליל מסוים עם שמע ומצב תרגול? {SOUNDS.map((s, i) => <span key={s.id}><Link to={s.path} className="font-bold underline">תרגול {s.label}</Link>{i < SOUNDS.length - 1 ? ' · ' : ''}</span>)}</p>
      <SeoBody faq={faq} related={[
        { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
        { label: 'זוגות מינימליים', href: '/speech/minimal-pairs' },
        { label: 'בינגו להדפסה', href: '/tools/bingo-maker' },
        { label: 'כרטיסיות תקשורת וסדר יום', href: '/printables/sensory-communication-cards' },
      ]} />
    </div>
  </div>
}

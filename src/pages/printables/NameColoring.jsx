import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import UseClassRoster from '../../components/ui/UseClassRoster'
import { LatinTrace, latinUnits } from '../../components/ui/HebrewTracing'
import { HERSHEY_CAP } from '../../data/hersheyLatin'
import { vocalizeAll } from '../../utils/nikudText'
import { cleanRosterNames } from '../../utils/classRoster'
import { namePath } from '../../data/babyNames'
import NotFound from '../NotFound'
import { THEMES, Motifs, cloudPath } from './nameColoringArt'
import {
  NC_BASE, NC_MAX, cleanName, plainName, nameLetters, isHebrew, letterGrid, firstLetterChoices, fitName,
  NAME_PAGES, nameColoringPath, resolveNameParam, namePageTitle, namePageDescription, namePageIntro, similarNamePages,
  THEME_IDS, themeForName, countText,
} from './nameColoringData'

// "דף שם לצביעה ולמידת אותיות" (/printables/name-coloring and /printables/name-coloring/:name):
// one A4 sheet per name — the name in big outlined bubble letters inside a cloud, line-art to
// colour around it, and (optionally) a strip of letter activities for kindergarten or first grade.
// Any word works (a pet's name, a holiday word). Black and white only.

const INK = '#111'
const LEVELS = [['gan', '🧸 גן'], ['alef', '✏️ כיתה א׳'], ['none', '🖍️ צביעה בלבד']]
const MAX_NAMES = 60

// The name in bubble letters: a wide black stroke under a slightly narrower white one leaves a
// single thick outline around every letter, white inside for colouring.
function BubbleName({ text, cx, cy, width, height, max }) {
  const { lines, size, lineH, spacing } = fitName(text, width, height, max)
  const sw = size * 0.07
  const step = size * lineH
  const top = cy - (lines.length - 1) * step / 2 + size * 0.3
  const common = { x: cx, textAnchor: 'middle', direction: isHebrew(text) ? 'rtl' : 'ltr', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 900, fontSize: size, letterSpacing: size * spacing, strokeLinejoin: 'round', strokeLinecap: 'round' }
  return <g>
    {lines.map((l, i) => <text key={`o${i}`} {...common} y={top + i * step} fill={INK} stroke={INK} strokeWidth={sw + 2.6}>{l}</text>)}
    {lines.map((l, i) => <text key={`i${i}`} {...common} y={top + i * step} fill="#fff" stroke="#fff" strokeWidth={sw}>{l}</text>)}
  </g>
}

// Tracing font widths (BugaTracer: 0.6em letters, narrow ו י ן, slimmer ג נ).
const tracerEm = s => [...s].reduce((w, c) => w + ('וין'.includes(c) ? 0.29 : c === 'ג' ? 0.51 : c === 'נ' ? 0.48 : c === ' ' ? 0.3 : 0.6), 0)

// "עברו על הקו": the name in a dotted single-line font on a pair of writing lines.
function TraceName({ text, cx, base, width, maxH }) {
  const plain = plainName(text)
  if (!plain) return null
  const heb = isHebrew(plain)
  const h = heb ? Math.min(maxH, width / Math.max(tracerEm(plain), 0.6) * 0.6) : Math.min(maxH, width * HERSHEY_CAP / Math.max(latinUnits(plain), 1))
  return <g>
    <WriteLine x1={cx - width / 2 - 2} x2={cx + width / 2 + 2} base={base} h={maxH} />
    {heb
      ? <text x={cx} y={base} fontSize={h / 0.6} fontFamily="BugaTracer" fill="#444" stroke="#444" strokeWidth={h / 0.6 * 0.012} direction="rtl" textAnchor="middle">{plain}</text>
      : <LatinTrace text={plain} x={cx} y={base} cap={h} color="#444" />}
  </g>
}
const WriteLine = ({ x1, x2, base, h }) => <g fill="none">
  <path d={`M${x1} ${base - h} H${x2}`} stroke="#999" strokeWidth="0.35" strokeDasharray="1.6 1.2" />
  <path d={`M${x1} ${base} H${x2}`} stroke={INK} strokeWidth="0.5" />
</g>

const Box = ({ x, y, w, h }) => <rect x={x} y={y} width={w} height={h} rx="3.5" fill="#fff" stroke={INK} strokeWidth="0.6" />
function Heading({ x, y, n, children }) {
  return <g>
    <circle cx={x - 3} cy={y - 1.6} r="3.1" fill="#fff" stroke={INK} strokeWidth="0.6" />
    <text x={x - 3} y={y - 0.2} fontSize="4" fontWeight="800" textAnchor="middle" fill={INK}>{n}</text>
    <T x={x - 8} y={y} size={4.6} weight={800} anchor="start">{children}</T>
  </g>
}

function Activities({ name, level }) {
  const letters = nameLetters(name)
  const alef = level === 'alef'
  const { cells, cols } = letterGrid(name, level)
  const spacing = Math.min(25, 154 / Math.max(cols - 1, 1))
  const r = Math.min(7.4, spacing * 0.37)
  const firstX = 100 + (cols - 1) * spacing / 2
  const choices = firstLetterChoices(name)
  const count = letters.length
  const squares = Math.min(14, Math.max(8, count + 2))
  const sq = Math.min(7.2, 80 / squares - 1.2)
  const sqStart = 146 + (squares * (sq + 1.2) - 1.2) / 2
  return <g>
    {/* 1 — circle the name's letters */}
    <Box x={10} y={124} w={180} h={56} />
    <Heading x={186} y={133} n="1">הקיפו את אותיות השם</Heading>
    <T x={14} y={133} size={3.4} anchor="end" fill="#444">{alef ? 'זהירות, יש אותיות דומות!' : 'רמז: הסתכלו על השם למעלה'}</T>
    {cells.map((cell, i) => {
      const row = i < cols ? 0 : 1, col = i % cols
      const x = firstX - col * spacing, y = 151 + row * 18
      return <g key={i}>
        <circle cx={x} cy={y} r={r} fill="#fff" stroke={INK} strokeWidth="0.5" strokeDasharray="1.2 1" />
        <text x={x} y={y + r * 0.42} fontSize={r * 1.25} fontWeight="700" textAnchor="middle" fill={INK}>{cell.c}</text>
      </g>
    })}

    {/* 2 — how many letters */}
    <Box x={102} y={184} w={88} h={38} />
    <Heading x={186} y={193} n="2">כמה אותיות יש בשם?</Heading>
    {alef ? <g>
      <T x={180} y={205} size={3.8} anchor="start">ספרו וכתבו:</T>
      <rect x={140} y={198.5} width={12} height={9} rx="1.5" fill="#fff" stroke={INK} strokeWidth="0.6" />
      <T x={137} y={205} size={3.8} anchor="start">אותיות</T>
      <T x={180} y={216} size={3.8} anchor="start">יש בשם אות סופית?</T>
      <T x={130} y={216} size={3.8} weight={700} anchor="start">כן</T>
      <T x={118} y={216} size={3.8} weight={700} anchor="start">לא</T>
    </g> : <g>
      <T x={180} y={200} size={3.5} anchor="start" fill="#444">צבעו משבצת אחת לכל אות</T>
      {Array.from({ length: squares }, (_, i) => <rect key={i} x={sqStart - (i + 1) * (sq + 1.2) + 1.2} y={205} width={sq} height={sq} rx="1" fill="#fff" stroke={INK} strokeWidth="0.55" />)}
    </g>}

    {/* 3 — the first letter */}
    <Box x={10} y={184} w={88} h={38} />
    <Heading x={94} y={193} n="3">{alef ? 'האות הראשונה והאחרונה' : 'מה האות הראשונה?'}</Heading>
    {alef ? <g>
      <T x={88} y={205} size={3.8} anchor="start">האות הראשונה:</T>
      <rect x={32} y={198.5} width={10} height={9} rx="1.5" fill="#fff" stroke={INK} strokeWidth="0.6" />
      <T x={88} y={217} size={3.8} anchor="start">האות האחרונה:</T>
      <rect x={32} y={210.5} width={10} height={9} rx="1.5" fill="#fff" stroke={INK} strokeWidth="0.6" />
    </g> : <g>
      <T x={88} y={200} size={3.5} anchor="start" fill="#444">הקיפו את האות שהשם מתחיל בה</T>
      {choices.map((c, i) => <g key={i}>
        <circle cx={76 - i * 22} cy={211} r={6.4} fill="#fff" stroke={INK} strokeWidth="0.55" />
        <text x={76 - i * 22} y={214.3} fontSize="8.4" fontWeight="700" textAnchor="middle" fill={INK}>{c}</text>
      </g>)}
    </g>}

    {/* 4 — trace the name */}
    <Box x={10} y={226} w={180} h={35} />
    <Heading x={186} y={235} n="4">{alef ? 'עברו על הקו, ואז כתבו לבד' : 'עברו על הקו'}</Heading>
    {alef ? <g>
      <TraceName text={name} cx={142} base={255} width={80} maxH={13} />
      <WriteLine x1={16} x2={94} base={255} h={13} />
    </g> : <TraceName text={name} cx={100} base={255} width={150} maxH={14} />}
  </g>
}

export function NameSheet({ name, display, theme, level }) {
  const label = `דף צביעה עם השם ${plainName(name)}`
  const page = level === 'none'
  const shown = display || name || 'השם שלי'
  const cloud = page ? { cx: 100, cy: 126, rx: 76, ry: 48 } : { cx: 100, cy: 66, rx: 72, ry: 36 }
  return <Sheet label={label}>
    <rect x="5" y="5" width="190" height="260" rx="9" fill="none" stroke={INK} strokeWidth="1.2" />
    <Motifs theme={theme} layout={page ? 'page' : 'full'} />
    <path d={cloudPath(cloud.cx, cloud.cy, cloud.rx, cloud.ry, page ? 16 : 14)} fill="#fff" stroke={INK} strokeWidth="1.3" />
    <BubbleName text={shown} cx={cloud.cx} cy={cloud.cy} width={cloud.rx * 1.6} height={cloud.ry * 1.25} max={page ? 72 : 56} />
    {!page && <Activities name={name || 'השם שלי'} level={level} />}
  </Sheet>
}

const linkCls = 'block wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold hover:bg-[var(--postit)]'
const chipCls = 'rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold hover:bg-[var(--postit)]'

// Every listed name, by first letter — each opens its ready page.
function AllNames() {
  const groups = useMemo(() => {
    const m = new Map()
    for (const n of [...NAME_PAGES].sort((a, b) => a.name.localeCompare(b.name, 'he'))) {
      const k = n.letter || n.name[0]
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(n)
    }
    return [...m]
  }, [])
  return <section className="mx-auto mt-10 max-w-3xl" aria-labelledby="nc-all">
    <h2 id="nc-all" className="mb-2 text-2xl font-bold">דף מוכן לכל שם — {NAME_PAGES.length} שמות</h2>
    <p className="mb-3 text-[var(--foreground)]/80">השמות הנפוצים בגנים ובבתי הספר בישראל, כל אחד עם דף משלו. לא מצאתם? פשוט מקלידים את השם למעלה.</p>
    <details className="rounded-2xl border-2 border-[var(--border)] bg-white p-3">
      <summary className="cursor-pointer font-bold">פתחו את רשימת השמות לפי א״ב</summary>
      <div className="mt-3 space-y-3">{groups.map(([letter, list]) => <div key={letter}>
        <h3 className="mb-1 text-lg font-bold">{letter}</h3>
        <div className="flex flex-wrap gap-1.5 text-sm">{list.map(n => <Link key={n.slug} to={nameColoringPath(n)} className={chipCls}>{n.name}</Link>)}</div>
      </div>)}</div>
    </details>
  </section>
}

function NameColoringTool({ preset }) {
  const entry = preset?.entry || null
  const [mode, setMode] = useState('one')
  const [name, setName] = useState(preset?.name || 'נועה')
  const [listText, setListText] = useState('')
  const [theme, setTheme] = useState(() => preset?.name ? themeForName(preset.name) : 'animals')
  const [level, setLevel] = useState('gan')
  const [niqqud, setNiqqud] = useState(false)
  const [vocal, setVocal] = useState(() => new Map())
  const [niqqudState, setNiqqudState] = useState('')

  const listNames = useMemo(() => cleanRosterNames(listText).map(cleanName).map(s => s.trim()).filter(Boolean).slice(0, MAX_NAMES), [listText])
  const names = mode === 'list' && listNames.length ? listNames : [name.trim() || 'השם שלי']
  const namesKey = names.join('\n')

  useEffect(() => {
    if (!niqqud) return
    const todo = namesKey.split('\n').filter(n => isHebrew(n) && !/[ְ-ׇ]/.test(n))
    if (!todo.length) return
    let live = true
    setNiqqudState('loading')
    vocalizeAll(todo)
      .then(map => { if (live) { setVocal(prev => new Map([...prev, ...map])); setNiqqudState('') } })
      .catch(() => { if (live) setNiqqudState('error') })
    return () => { live = false }
  }, [niqqud, namesKey])

  const themeFor = i => theme === 'mix' ? THEME_IDS[i % THEME_IDS.length] : theme
  const pages = names.map((n, i) => ({
    key: `${i}-${n}-${themeFor(i)}-${level}-${niqqud}`,
    svg: <NameSheet name={plainName(n)} display={niqqud ? (vocal.get(n) || n) : plainName(n)} theme={themeFor(i)} level={level} />,
  }))

  const shown = plainName(names[0])
  const facts = nameLetters(shown)
  const isPreset = Boolean(preset)
  const title = isPreset ? namePageTitle({ name: preset.name }) : 'דף שם לצביעה ולמידת אותיות — מכינים לכל ילד בכיתה, להדפסה'
  const description = entry ? namePageDescription(entry)
    : isPreset ? `דף צביעה עם השם ${preset.name}: אותיות בועה גדולות לצביעה, ציורים ופעילות לזיהוי אותיות השם. חינם להדפסה, A4.`
      : 'מקלידים שם או מדביקים את רשימת הכיתה ומקבלים דף A4 לכל ילד: השם באותיות בועה לצביעה, ציורים לצביעה ופעילות אותיות לגן ולכיתה א׳. חינם, בלי הרשמה.'
  const shareHref = entry && entry.name === shown ? nameColoringPath(entry) : null

  const controls = <>
    <Choice label="כמה דפים" value={mode} onChange={setMode} options={[['one', '🧒 שם אחד'], ['list', '👩‍🏫 כל הכיתה — שם בכל שורה']]} />
    {mode === 'one'
      ? <div>
        <Field label={`השם או המילה (עד ${NC_MAX} אותיות)`} value={name} onChange={v => setName(cleanName(v))} placeholder="למשל: נועה" maxLength={NC_MAX + 8} />
        <p className="mt-1 text-center text-sm text-[var(--muted-foreground)]">עובד עם כל מילה: שם של ילד, של אח או אחות, של חיית המחמד — או מילה לחג, כמו <button type="button" className="font-bold underline" onClick={() => setName('חנוכה')}>חנוכה</button> או <button type="button" className="font-bold underline" onClick={() => setName('סוכות')}>סוכות</button>.</p>
      </div>
      : <div className="space-y-2">
        <label className="block text-center font-bold" htmlFor="nc-list">שמות הילדים — שם בכל שורה (עד {MAX_NAMES})</label>
        <textarea id="nc-list" value={listText} onChange={e => setListText(e.target.value)} rows={6} placeholder={'נועה\nאורי\nתמר\nאדם'}
          className="w-full wobbly-sm border-2 border-[var(--border)] bg-white p-3 text-lg" />
        <UseClassRoster onUse={list => setListText(list.join('\n'))} />
        <p className="text-center text-sm text-[var(--muted-foreground)]">{listNames.length ? `${listNames.length} שמות · דף A4 לכל אחד` : 'אפשר להדביק רשימה מהוואטסאפ או מאקסל — כל שם בשורה.'} השמות לא נשלחים לשום מקום.</p>
      </div>}
    <Choice label="ציורים לצביעה" value={theme} onChange={setTheme} options={[...THEME_IDS.map(id => [id, `${THEMES[id].emoji} ${THEMES[id].label}`]), ...(mode === 'list' ? [['mix', '🔀 נושא אחר לכל ילד']] : [])]} />
    <Choice label="רמה" value={level} onChange={setLevel} options={LEVELS} />
    <Choice label="ניקוד" value={niqqud ? 'on' : 'off'} onChange={v => setNiqqud(v === 'on')} options={[['off', 'בלי ניקוד'], ['on', 'עם ניקוד']]} />
    {niqqud && <p className="text-center text-sm" role="status">{niqqudState === 'loading' ? 'מנקדים…' : niqqudState === 'error' ? 'הניקוד האוטומטי לא זמין כרגע — אפשר להקליד את השם עם ניקוד.' : 'הניקוד אוטומטי. שם שנוקד לא נכון? מקלידים אותו עם ניקוד, והוא יישמר כמו שהוא.'}</p>}
  </>

  const intro = entry ? <div className="mx-auto mb-6 max-w-3xl space-y-2 rounded-2xl border border-[var(--border)] bg-white p-5 text-right shadow-sm">
    <p className="m-0 leading-relaxed">{namePageIntro(entry)}</p>
    <p className="m-0 leading-relaxed"><b>מה פירוש השם {entry.name}?</b> {entry.meaning} <Link to={namePath(entry)} className="font-bold underline">עוד על השם {entry.name}</Link></p>
  </div> : isPreset ? <p className="mx-auto mb-6 max-w-3xl text-center">ב„{shown}” יש {countText(facts.length)}. אפשר לשנות את השם, את הציורים ואת הרמה — ולהדפיס.</p> : null

  const after = <>
    {entry && <section className="mx-auto mt-10 max-w-3xl">
      <h2 className="mb-2 text-2xl font-bold">דפי צביעה עם שמות דומים</h2>
      <div className="flex flex-wrap gap-2">{similarNamePages(entry).map(n => <Link key={n.slug} to={nameColoringPath(n)} className={chipCls}>{n.name}</Link>)}</div>
      <p className="mt-3"><Link to={NC_BASE} className="font-bold underline">לכל השמות, ולהכנת דף לכל הכיתה בבת אחת</Link></p>
    </section>}
    {!isPreset && <AllNames />}
  </>

  const h1 = isPreset ? `דף צביעה עם השם ${preset.name}` : 'דף שם לצביעה ולמידת אותיות'
  const paragraphs = isPreset ? [
    `הדף של ${preset.name} בנוי משני חלקים. למעלה — השם באותיות בועה גדולות בתוך ענן, ומסביב ציורים לצביעה. למטה — פעילות קצרה: מוצאים ומקיפים את האותיות של ${preset.name} בין אותיות אחרות, סופרים כמה אותיות יש בשם, מזהים את האות הראשונה ועוברים על השם בקו מקווקו.`,
    `מתאים לגן ולכיתה א׳: ברמת גן יש פחות אותיות להקפה, וצביעת משבצת לכל אות במקום כתיבת מספר. בכיתה א׳ מופיעות גם אותיות דומות (כמו ב ו־כ, ד ו־ר), שואלים על האות האחרונה ועל אות סופית, ויש שורה לכתיבה עצמאית. מי שרוצה רק לצבוע בוחר „צביעה בלבד”.`,
  ] : [
    'דף שם הוא אחת הדרכים הכי טבעיות להתחיל ללמוד אותיות: השם של הילד הוא המילה הראשונה שהוא רוצה לזהות ולכתוב. כאן מקלידים שם — או מדביקים את כל רשימת הכיתה — ומקבלים דף A4 לכל ילד: השם באותיות בועה גדולות בתוך ענן, ציורים לצביעה מסביב, ופס פעילות קצר שמחזק את הכרת האותיות.',
    'בפס הפעילות ארבע משימות: מקיפים את אותיות השם בין אותיות אחרות, סופרים כמה אותיות יש בשם, מזהים את האות הראשונה, ועוברים על השם בקו מקווקו. האותיות להקפה נבחרות לכל שם מחדש, אבל קבועות — אותו שם יקבל תמיד את אותו דף, כך שאפשר להדפיס שוב בלי הפתעות. אותיות סופיות (ך ם ן ף ץ) נשארות בצורתן, ולא מוצגת לצידן האות הרגילה כדי לא לבלבל.',
    'יש שמונה נושאים לציורים — אמנות ויצירה, כדורגל וספורט, חלל, חיות, פרחים ופרפרים, כלי תחבורה, ים, ויום הולדת — כולם ציורי קו פשוטים ועבים, שקל לצבוע גם בגיל שלוש. הדף כולו בשחור־לבן, כך שהוא נראה טוב בכל מדפסת ולא מבזבז דיו.',
    'איך משתמשים בגן ובכיתה: בתחילת השנה, כדף היכרות ראשון; בפינת הכתיבה; כמתנה ליום הולדת; או כדף אישי לתיק העבודות. בחינוך המיוחד אפשר לבחור „צביעה בלבד” או רמת גן, להדפיס בגדול ולעבוד על אות אחת בכל פעם. ולא רק שמות — עובד עם כל מילה: שם של חיית המחמד, של הגננת, או מילה לחג.',
  ]
  const faq = isPreset ? [
    { q: `כמה אותיות יש בשם ${preset.name}?`, a: `בשם ${preset.name} יש ${countText(facts.length)}${facts.length ? `, והוא מתחיל באות ${facts[0]}` : ''}.` },
    { q: 'אפשר להכין את הדף לכל הכיתה?', a: `כן. בדף הראשי של הכלי מדביקים את רשימת השמות (או טוענים את רשימת הכיתה השמורה) ומקבלים דף לכל ילד בהדפסה אחת.` },
    { q: 'האם הדף בצבע?', a: 'לא — הדף בשחור־לבן בכוונה, כדי שהילדים יצבעו אותו בעצמם. הוא מודפס יפה בכל מדפסת.' },
  ] : [
    { q: 'איך מכינים דף שם לכל ילד בכיתה?', a: 'בוחרים „כל הכיתה”, מדביקים את השמות (שם בכל שורה) או טוענים את רשימת הכיתה השמורה באתר, ולוחצים הדפסה — כל שם מקבל דף A4 משלו.' },
    { q: 'מה ההבדל בין רמת גן לכיתה א׳?', a: 'בגן: 12 אותיות להקפה, צביעת משבצת לכל אות ובחירת האות הראשונה מבין שלוש. בכיתה א׳: 18 אותיות כולל אותיות דומות, כתיבת מספר האותיות, האות הראשונה והאחרונה, שאלה על אות סופית ושורה לכתיבה עצמאית.' },
    { q: 'אפשר שם עם ניקוד?', a: 'כן. בוחרים „עם ניקוד” והשם מנוקד אוטומטית. אם הניקוד לא מדויק (בשמות זה קורה), מקלידים את השם עם הניקוד הנכון והוא יודפס בדיוק כך.' },
    { q: 'זה עובד גם עם שמות ארוכים, שמות באנגלית או שני שמות?', a: 'כן. גודל האותיות מותאם לאורך השם, שם עם רווח מתחלק לשתי שורות כשצריך, ושם באנגלית מקבל קו מעבר באותיות לטיניות.' },
    { q: 'האם השמות נשמרים או נשלחים?', a: 'לא. הדף נבנה בדפדפן שלכם. רשימת הכיתה השמורה נשמרת רק במכשיר שלכם.' },
  ]
  const related = [
    { label: 'דף כתיבת שם למעבר בעיפרון', href: '/printables/hebrew-letters#names' },
    { label: 'אותיות עברית להדפסה', href: '/printables/hebrew-letters' },
    { label: 'צביעה לפי אות', href: '/printables/color-by-letter' },
    { label: 'תגי שם להדפסה', href: '/printables/name-tags' },
    { label: 'רשימת הכיתה שלי', href: '/classroom/roster' },
    ...(entry ? [{ label: `משמעות השם ${entry.name}`, href: namePath(entry) }] : [{ label: 'שמות לתינוקות ומשמעותם', href: '/baby-names' }]),
  ]

  return <PrintableShell copies={false} path={entry ? nameColoringPath(entry) : NC_BASE} emoji="🖍️" h1={h1}
    seoTitle={title} description={description}
    sub={isPreset ? `השם ${preset.name} באותיות בועה לצביעה, עם ציורים ופעילות אותיות — דף A4 בשחור־לבן` : 'שם באותיות בועה לצביעה, ציורים מסביב ופעילות אותיות — דף A4 לכל ילד'}
    crumbs={isPreset ? [{ label: 'דף שם לצביעה', href: NC_BASE }] : [{ label: 'דפי צביעה', href: '/printables/coloring' }]}
    intro={intro}
    controls={controls}
    pages={pages}
    previewAll={pages.length > 1 && pages.length <= 4}
    printTitle={pages.length > 1 ? `דפי שם — ${pages.length} ילדים` : `דף צביעה עם השם ${shown}`}
    extra={<div className="space-y-2 text-sm">
      {pages.length > 4 && <p className="font-bold">בתצוגה: הדף הראשון. כל {pages.length} הדפים בהדפסה.</p>}
      {shareHref && !isPreset && <Link to={shareHref} className={linkCls}>🔗 דף קבוע עם השם {shown}</Link>}
      <Link to="/printables/hebrew-letters#names" className={linkCls}>✏️ דף כתיבת שם למעבר בעיפרון</Link>
      <Link to="/printables/name-tags" className={linkCls}>🏷️ תגי שם להדפסה</Link>
    </div>}
    paragraphs={paragraphs} faq={faq} related={related} after={after}
  />
}

export default function NameColoring() {
  return <NameColoringTool />
}

// /printables/name-coloring/:name — a listed name (by slug) or any word typed into the URL.
export function NameColoringName() {
  const { name: param } = useParams()
  const preset = useMemo(() => resolveNameParam(param), [param])
  if (!preset.name || !nameLetters(preset.name).length) return <NotFound />
  return <NameColoringTool key={param} preset={preset} />
}


import { useMemo, useState } from 'react'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import { ENGLISH_TOPICS, emojiFile } from '../../data/englishWords'

// Paper games and crafts: memory cards, dominoes, a folding gift box and a fortune teller (קוטי פוטי).

const SIBLINGS = [
  { href: '/printables/memory-game', label: '🃏 משחק זיכרון' }, { href: '/printables/dominoes', label: '🁫 דומינו' },
  { href: '/printables/fortune-teller', label: '🌸 קוטי פוטי' }, { href: '/printables/gift-box', label: '🎁 קופסת מתנה' },
]
const CRUMBS = [{ label: 'משחקים ויצירה מנייר', href: '/printables?topic=crafts' }]
const art = emoji => `/print-art/words/${emojiFile(emoji)}.svg`
const THEMES = ['animals', 'fruits', 'transport', 'food', 'birthday', 'clothes', 'weather', 'home']
const topic = slug => ENGLISH_TOPICS.find(t => t.slug === slug)

// ── Memory game ─────────────────────────────────
function MemorySheet({ cards, title }) {
  const cw = 44, ch = 46, gx = 4.5, gy = 3.5, x0 = (200 - 4 * cw - 3 * gx) / 2, y0 = 21
  return <Sheet label={title}>
    <T x={100} y={14} size={7} weight={800}>{title}</T>
    {cards.map((c, i) => { const col = i % 4, row = Math.floor(i / 4), x = x0 + (3 - col) * (cw + gx), y = y0 + row * (ch + gy); return <g key={i}>
      <rect x={x} y={y} width={cw} height={ch} rx={4} fill="#fff" stroke="#111" strokeWidth={0.5} strokeDasharray="2 1.2" />
      {c.img && <image href={c.img} x={x + 8} y={y + (c.text ? 5 : 9)} width={cw - 16} height={cw - 16} />}
      {c.text && <T x={x + cw / 2} y={c.img ? y + ch - 6 : y + ch / 2 + 3} size={c.img ? 6 : c.text.length > 8 ? 6.5 : 8} weight={700} direction={c.en ? 'ltr' : 'rtl'}>{c.text}</T>}
    </g> })}
  </Sheet>
}

export function MemoryGame() {
  const [theme, setTheme] = useState('animals')
  const [mode, setMode] = useState('same')
  const t = topic(theme)
  const words = t.words.filter(w => w.emoji).slice(0, 10)
  const cards = words.flatMap(w => mode === 'same'
    ? [{ img: art(w.emoji) }, { img: art(w.emoji) }]
    : [{ img: art(w.emoji) }, mode === 'he' ? { text: w.he } : { text: w.en, en: true }])
  return <PrintableShell path="/printables/memory-game" emoji="🃏" h1="משחק זיכרון להדפסה"
    seoTitle="משחק זיכרון להדפסה — קלפי זוגות עם תמונות"
    description="משחק זיכרון להדפסה בחינם: 20 קלפים (10 זוגות) של חיות, פירות, כלי תחבורה ועוד. תמונה-תמונה, תמונה-מילה בעברית או תמונה-מילה באנגלית."
    sub="10 זוגות בדף — תמונה ותמונה, או תמונה ומילה בעברית ובאנגלית"
    crumbs={CRUMBS} siblings={SIBLINGS}
    controls={<>
      <Choice label="נושא" value={theme} onChange={setTheme} options={THEMES.map(s => [s, `${topic(s).emoji} ${topic(s).title}`])} />
      <Choice label="סוג זוגות" value={mode} onChange={setMode} options={[['same', '🖼️ תמונה + תמונה'], ['he', 'א תמונה + מילה בעברית'], ['en', 'A תמונה + מילה באנגלית']]} />
    </>}
    pages={[{ key: theme + mode, svg: <MemorySheet cards={cards} title={`משחק זיכרון — ${t.title}`} /> }]}
    paragraphs={['משחק זיכרון הוא משחק הקלפים הראשון של כמעט כל ילד: מניחים את הקלפים הפוכים, הופכים שניים בכל תור ומחפשים זוגות. הוא מאמן ריכוז וזיכרון חזותי, ומתאים כבר מגיל 3.', 'הגרסה עם תמונה ומילה הופכת את המשחק לתרגול קריאה: ילד שמוצא את הזוג "כלב" — תמונה ומילה — קורא את המילה בלי להרגיש שהוא לומד. בגרסה באנגלית זה תרגול מילים ראשונות באנגלית.', 'מדפיסים על בריסטול או מדביקים על קרטון לפני הגזירה, כדי שלא יראו את התמונה מבעד לקלף. דף אחד נותן 20 קלפים; לשני דפים בנושאים שונים יש משחק גדול יותר.']}
    faq={[{ q: 'מאיזה גיל משחקים במשחק זיכרון?', a: 'מגיל 3 עם 6–8 זוגות, ומגיל 5 עם כל 10 הזוגות. אפשר להתחיל עם חלק מהקלפים ולהוסיף בהדרגה.' }, { q: 'איך עושים שהקלפים לא יהיו שקופים?', a: 'מדפיסים על בריסטול, או מדביקים את הדף על קרטון דק לפני הגזירה.' }]}
    related={[{ label: 'דומינו להדפסה', href: '/printables/dominoes' }, { label: 'אנגלית לילדים', href: '/english' }, { label: 'כרטיסיות אותיות', href: '/printables/letter-flashcards' }]} />
}

// ── Dominoes ─────────────────────────────────
const PIPS = { 0: [], 1: [[50, 50]], 2: [[25, 25], [75, 75]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[25, 25], [75, 25], [25, 75], [75, 75]], 5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]], 6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]] }
function Half({ x, y, s, v }) {
  if (v.pips != null) return <g>{PIPS[v.pips].map(([px, py], i) => <circle key={i} cx={x + px / 100 * s} cy={y + py / 100 * s} r={s * 0.08} fill="#111" />)}</g>
  if (v.img) return <image href={v.img} x={x + s * 0.15} y={y + s * 0.15} width={s * 0.7} height={s * 0.7} />
  return <T x={x + s / 2} y={y + s / 2 + (v.text.length > 5 ? 2 : 3.5)} size={v.text.length > 5 ? 7 : 11} weight={800} direction={/^[\d+\-= ]+$/.test(v.text) ? 'ltr' : 'rtl'}>{v.text}</T>
}
function DominoSheet({ tiles, title, page, pages }) {
  const s = 36, tw = s * 2, gap = 8, x0 = (200 - 2 * tw - gap) / 2, y0 = 22
  return <Sheet label={title}>
    <T x={100} y={14} size={7} weight={800}>{title}{pages > 1 ? ` (${page}/${pages})` : ''}</T>
    {tiles.map(([a, b], i) => { const col = i % 2, row = Math.floor(i / 2), x = x0 + (1 - col) * (tw + gap), y = y0 + row * (s + 4.5); return <g key={i}>
      <rect x={x} y={y} width={tw} height={s} rx={4} fill="#fff" stroke="#111" strokeWidth={0.7} />
      <line x1={x + s} x2={x + s} y1={y + 4} y2={y + s - 4} stroke="#111" strokeWidth={0.5} />
      <Half x={x + s} y={y} s={s} v={a} /><Half x={x} y={y} s={s} v={b} />
    </g> })}
  </Sheet>
}
function dominoTiles(kind, theme) {
  if (kind === 'classic') { const out = []; for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) out.push([{ pips: a }, { pips: b }]); return out }
  if (kind === 'count') { const out = []; for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) out.push([{ text: String(a) }, { pips: b }]); return out }
  // A closed loop: each tile carries the answer of the previous one and the next question.
  if (kind === 'math') {
    const qs = [[2, 3], [4, 1], [6, 2], [3, 3], [7, 2], [5, 4], [8, 1], [2, 2], [6, 4], [1, 6], [9, 1], [4, 4], [3, 5], [2, 7]]
    return qs.map(([a, b], i) => { const [pa, pb] = qs[(i + qs.length - 1) % qs.length]; return [{ text: String(pa + pb) }, { text: `${a}+${b}` }] })
  }
  const words = topic(theme).words.filter(w => w.emoji).slice(0, 12)
  return words.map((w, i) => [{ text: words[(i + words.length - 1) % words.length].he }, { img: art(w.emoji) }])
}

export function Dominoes() {
  const [kind, setKind] = useState('classic')
  const [theme, setTheme] = useState('animals')
  const tiles = useMemo(() => dominoTiles(kind, theme), [kind, theme])
  const per = 12, chunks = Array.from({ length: Math.ceil(tiles.length / per) }, (_, i) => tiles.slice(i * per, i * per + per))
  const title = { classic: 'דומינו קלאסי', count: 'דומינו מספרים ונקודות', math: 'דומינו חיבור', words: `דומינו מילים — ${topic(theme).title}` }[kind]
  return <PrintableShell path="/printables/dominoes" emoji="🁫" h1="דומינו להדפסה"
    seoTitle="דומינו להדפסה — קלאסי, מספרים, חיבור ומילים"
    description="דומינו להדפסה בחינם: 28 אבני דומינו קלאסיות, דומינו מספרים ונקודות, דומינו חיבור שנסגר במעגל ודומינו תמונה-מילה בעברית. לגזירה ולמשחק בבית ובכיתה."
    sub="קלאסי, מספרים ונקודות, חיבור, או תמונה ומילה — מדפיסים וגוזרים"
    crumbs={CRUMBS} siblings={SIBLINGS}
    controls={<>
      <Choice label="סוג דומינו" value={kind} onChange={setKind} options={[['classic', '⚫ קלאסי (28 אבנים)'], ['count', '🔢 מספרים ונקודות'], ['math', '➕ חיבור'], ['words', 'א תמונה ומילה']]} />
      {kind === 'words' && <Choice label="נושא" value={theme} onChange={setTheme} options={THEMES.map(s => [s, `${topic(s).emoji} ${topic(s).title}`])} />}
    </>}
    pages={chunks.map((c, i) => ({ key: kind + theme + i, svg: <DominoSheet tiles={c} title={title} page={i + 1} pages={chunks.length} /> }))}
    paragraphs={['דומינו מנייר הוא משחק שאפשר להכין בעשר דקות: מדפיסים, מדביקים על קרטון וגוזרים. הסט הקלאסי כולל את כל 28 האבנים מ-0:0 ועד 6:6, בדיוק כמו בדומינו אמיתי.', 'בגרסאות הלימודיות משחקים באותם חוקים, אבל מחברים דברים שמתאימים זה לזה: מספר לכמות הנקודות שלו, תרגיל חיבור לתשובה שלו, או תמונה למילה. דומינו החיבור ודומינו המילים בנויים כמעגל סגור — אם הכול נכון, האבן האחרונה מתחברת לראשונה.', 'בכיתה אפשר לחלק את האבנים בין הילדים ולבנות שרשרת אחת משותפת על הרצפה.']}
    faq={[{ q: 'איך משחקים דומינו?', a: 'כל שחקן מקבל 7 אבנים. בתורו מניחים אבן שאחד מצדדיה מתאים לקצה פתוח של השרשרת. מי שאין לו אבן מתאימה לוקח מהקופה. מנצח מי שנגמרות לו האבנים ראשון.' }, { q: 'כמה אבנים יש בדומינו?', a: 'בדומינו רגיל (עד 6) יש 28 אבנים — כל צירוף של שני מספרים מ-0 עד 6 פעם אחת.' }]}
    related={[{ label: 'משחק זיכרון להדפסה', href: '/printables/memory-game' }, { label: 'משחקי קוביות', href: '/dice-games' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }]} />
}

// ── Fortune teller (קוטי פוטי) ─────────────────────────────────
const FT_SETS = {
  fun: ['תקבל/י היום הפתעה', 'תעשה/י 10 קפיצות', 'ספר/י בדיחה', 'מישהו חושב עליך עכשיו', 'מחר יהיה יום מעולה', 'עשה/י פרצוף מצחיק', 'תחקה/י חיה', 'שיר/י שיר קצר'],
  birthday: ['השנה תלמד/י משהו מדהים', 'מחכה לך מתנה מיוחדת', 'תחגוג/י עם כל החברים', 'משאלה אחת שלך תתגשם', 'תאכל/י עוד חתיכת עוגה', 'השנה תטייל/י למקום חדש', 'יהיה לך חבר/ה חדש/ה', 'את/ה הכי מיוחד/ת שיש'],
  class: ['כתוב/י מילה שמתחילה ב-מ', 'אמור/י 3 מספרים זוגיים', 'מה ההפך של גדול?', 'כמה זה 5+7?', 'אמור/י מילה באנגלית', 'ספור/י אחורה מ-10', 'מה הבירה של ישראל?', 'כמה רגליים יש לעכביש?'],
}
const FT_COLORS = [['אדום', '#ff6b6b'], ['כחול', '#6cb8ff'], ['ירוק', '#7dd87a'], ['צהוב', '#ffd23f']]
// Up to two short lines (about 12 characters each), split on spaces.
function wrap2(text) {
  if (text.length <= 12) return [text]
  const words = text.split(' ')
  let a = ''
  while (words.length && (a + ' ' + words[0]).trim().length <= Math.max(12, Math.ceil(text.length / 2))) a = (a + ' ' + words.shift()).trim()
  return [a, words.join(' ')].filter(Boolean)
}
function FortuneSheet({ msgs, color }) {
  const S = 180, x0 = 10, y0 = 30, c = S / 2, cx = x0 + c, cy = y0 + c
  // Outer corner triangles: four colours. Inner diamond: 8 triangles, each with a number near its
  // outer edge and a hidden message near the centre (it ends up under the flap once folded).
  const diamond = `${cx},${y0} ${x0 + S},${cy} ${cx},${y0 + S} ${x0},${cy}`
  const segs = [[cx, y0], [x0 + S * 0.75, y0 + S * 0.25], [x0 + S, cy], [x0 + S * 0.75, y0 + S * 0.75], [cx, y0 + S], [x0 + S * 0.25, y0 + S * 0.75], [x0, cy], [x0 + S * 0.25, y0 + S * 0.25]]
  return <Sheet label="קוטי פוטי להדפסה">
    <T x={100} y={13} size={8} weight={800}>קוטי פוטי</T>
    <T x={100} y={22} size={4.6} fill="#444">גוזרים את הריבוע · מקפלים לפי הקווים המקווקווים · ההוראות המלאות מופיעות באתר</T>
    <rect x={x0} y={y0} width={S} height={S} fill="#fff" stroke="#111" strokeWidth={0.9} />
    {[[x0, y0], [x0 + c, y0], [x0, y0 + c], [x0 + c, y0 + c]].map(([x, y], i) => {
      const pts = i === 0 ? `${x},${y} ${x + c},${y} ${x},${y + c}` : i === 1 ? `${x},${y} ${x + c},${y} ${x + c},${y + c}` : i === 2 ? `${x},${y} ${x},${y + c} ${x + c},${y + c}` : `${x + c},${y} ${x + c},${y + c} ${x},${y + c}`
      const [name, col] = FT_COLORS[i], lx = i % 2 ? x + c * 0.72 : x + c * 0.28, ly = i < 2 ? y + c * 0.3 : y + c * 0.76
      return <g key={i}><polygon points={pts} fill={color ? col : '#fff'} stroke="none" /><T x={lx} y={ly} size={7} weight={800}>{name}</T></g>
    })}
    <polygon points={diamond} fill="#fff" stroke="#111" strokeWidth={0.6} strokeDasharray="2 1.2" />
    {/* 8 triangles of the inner diamond: number on the outside half, message on the inside half */}
    {/* fold lines of the second fold: the centre square */}
    <rect x={cx - c / 2} y={cy - c / 2} width={c} height={c} fill="none" stroke="#111" strokeWidth={0.4} strokeDasharray="2 1.2" />
    {segs.map(([sx, sy], k) => { const [nx, ny] = segs[(k + 1) % 8], mx = (sx + nx) / 2, my = (sy + ny) / 2
      const nxp = cx + (mx - cx) * 0.78, nyp = cy + (my - cy) * 0.78
      // The message sits in the matching triangle of the centre square, reading from that square's edge.
      const h = c / 2, side = Math.floor((k + 1) / 2) % 4, sign = k % 2 ? -1 : 1, lines = wrap2(msgs[k])
      return <g key={k}>
        <line x1={cx} y1={cy} x2={sx} y2={sy} stroke="#111" strokeWidth={0.4} strokeDasharray="2 1.2" />
        <T x={nxp} y={nyp + 3} size={9} weight={800}>{k + 1}</T>
        <g transform={`rotate(${side * 90} ${cx} ${cy})`}>{lines.map((l, j) => <T key={j} x={cx + sign * h * 0.36} y={cy - h * (lines.length > 1 ? 0.8 - j * 0.2 : 0.7)} size={3.4}>{l}</T>)}</g>
      </g> })}
    <line x1={x0} y1={y0} x2={x0 + S} y2={y0 + S} stroke="#111" strokeWidth={0.3} strokeDasharray="1 1.5" />
    <line x1={x0 + S} y1={y0} x2={x0} y2={y0 + S} stroke="#111" strokeWidth={0.3} strokeDasharray="1 1.5" />
    <line x1={cx} y1={y0} x2={cx} y2={y0 + S} stroke="#111" strokeWidth={0.3} strokeDasharray="1 1.5" />
    <line x1={x0} y1={cy} x2={x0 + S} y2={cy} stroke="#111" strokeWidth={0.3} strokeDasharray="1 1.5" />
    <T x={100} y={y0 + S + 12} size={4.6}>1. מקפלים את 4 הפינות למרכז · 2. הופכים ושוב מקפלים 4 פינות למרכז</T>
    <T x={100} y={y0 + S + 19} size={4.6}>3. מקפלים לחצי ומכניסים אצבעות מתחת לריבועי הצבע — ומתחילים לשחק!</T>
  </Sheet>
}

export function FortuneTeller() {
  const [set, setSet] = useState('fun')
  const [color, setColor] = useState('color')
  const [custom, setCustom] = useState('')
  const own = custom.split('\n').map(s => s.trim()).filter(Boolean)
  const msgs = set === 'own' ? Array.from({ length: 8 }, (_, i) => own[i] || '______________') : FT_SETS[set]
  return <PrintableShell path="/printables/fortune-teller" emoji="🌸" h1="קוטי פוטי להדפסה"
    seoTitle="קוטי פוטי להדפסה — עם הוראות קיפול ומשפטים משלכם"
    description="קוטי פוטי להדפסה בחינם: תבנית מוכנה לקיפול עם צבעים, מספרים ומשפטים מצחיקים, ליום הולדת או לתרגול בכיתה — או עם משפטים שאתם כותבים. כולל הוראות קיפול."
    sub="מדפיסים, גוזרים ומקפלים — עם משפטים מצחיקים, ליום הולדת, לכיתה או שלכם"
    crumbs={CRUMBS} siblings={SIBLINGS}
    controls={<>
      <Choice label="משפטים" value={set} onChange={setSet} options={[['fun', '😂 מצחיקים'], ['birthday', '🎂 ליום הולדת'], ['class', '✏️ שאלות לכיתה'], ['own', '✍️ שלי']]} />
      {set === 'own' && <label className="mx-auto block max-w-xl text-center font-bold">8 משפטים — אחד בכל שורה (עד 24 תווים)
        <textarea rows={8} value={custom} maxLength={240} onChange={e => setCustom(e.target.value)} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" /></label>}
      <Choice label="צבע" value={color} onChange={setColor} options={[['color', '🌈 צבעוני'], ['bw', '🖍️ לצביעה']]} />
    </>}
    pages={[{ key: set + color, svg: <FortuneSheet msgs={msgs.map(m => m.slice(0, 24))} color={color === 'color'} /> }]}
    paragraphs={['קוטי פוטי — או בשמו הבינלאומי Fortune Teller — הוא משחק קיפול נייר שכל דור מחדש מגלה. מחזיקים אותו על האצבעות, החבר בוחר צבע ומספר, פותחים וסוגרים לפי מספר האותיות, ובסוף מרימים את הדש ומגלים את המשפט שמסתתר מתחתיו.', 'התבנית כאן מוכנה לקיפול: ארבעה ריבועי צבע בפינות, שמונה מספרים ושמונה משפטים שמסתתרים מבפנים. אפשר לבחור משפטים מצחיקים, ניבויים ליום הולדת, שאלות לתרגול בכיתה — או לכתוב שמונה משפטים משלכם.', 'איך מקפלים: גוזרים את הריבוע, מקפלים את ארבע הפינות אל המרכז, הופכים את הדף ומקפלים שוב את ארבע הפינות החדשות אל המרכז. מקפלים לחצי, מכניסים אגודל ואצבע מתחת לכל ריבוע צבע — והקוטי פוטי מוכן.']}
    faq={[{ q: 'איך משחקים בקוטי פוטי?', a: 'החבר בוחר צבע, ופותחים וסוגרים לפי מספר האותיות בשם הצבע. אחר כך בוחר מספר ופותחים וסוגרים שוב לפי המספר. בסוף בוחר מספר אחד מהמספרים שבפנים, ומרימים את הדש כדי לקרוא את המשפט.' }, { q: 'הקוטי פוטי יוצא קטן מדי?', a: 'הוא מודפס בגודל של 18 ס״מ, שזה גודל נוח לידיים של ילדים. על נייר רגיל הוא מתקפל הכי בקלות.' }]}
    related={[{ label: 'קופסת מתנה לקיפול', href: '/printables/gift-box' }, { label: 'משחקים ליום הולדת', href: '/games/birthday' }, { label: 'אמת או בוגה', href: '/tools/truth-or-buga' }]} />
}

// ── Gift box ─────────────────────────────────
const PATTERNS = { dots: '🔵 נקודות', stripes: '〰️ פסים', stars: '⭐ כוכבים', plain: '⬜ חלק לצביעה' }
const BOX_COLORS = { pink: ['#ffc2d1', '#ff6f91'], blue: ['#cfe8ff', '#3d8bfd'], yellow: ['#fff1a8', '#f4a300'], green: ['#d6f5d1', '#36a852'] }
function Pattern({ id, x, y, w, h, pattern, col }) {
  if (pattern === 'plain' || !col) return null
  const [, fg] = col
  const items = []
  if (pattern === 'stripes') for (let k = -h; k < w; k += 7) items.push(<line key={k} x1={x + k} y1={y + h} x2={x + k + h} y2={y} stroke={fg} strokeWidth={1.6} opacity={0.6} />)
  else for (let i = 4; i < w; i += 9) for (let j = 4; j < h; j += 9) items.push(pattern === 'dots'
    ? <circle key={i + '-' + j} cx={x + i + ((j / 9) % 2 ? 4.5 : 0)} cy={y + j} r={1.3} fill={fg} opacity={0.7} />
    : <text key={i + '-' + j} x={x + i + ((j / 9) % 2 ? 4.5 : 0)} y={y + j + 1.5} fontSize={4.5} fill={fg} textAnchor="middle" opacity={0.8}>★</text>)
  return <g clipPath={`url(#${id})`}>{items}</g>
}
// A box net: centre square + 4 walls; each wall gets a glue flap on one side.
function BoxNet({ x0, y0, a, hgt, label, pattern, col, id }) {
  const faces = [[x0 + hgt, y0 + hgt, a, a], [x0 + hgt, y0, a, hgt], [x0 + hgt, y0 + hgt + a, a, hgt], [x0, y0 + hgt, hgt, a], [x0 + hgt + a, y0 + hgt, hgt, a]]
  const flap = 7
  const flaps = [
    `M${x0 + hgt} ${y0} L${x0 + hgt - flap} ${y0 + flap} L${x0 + hgt - flap} ${y0 + hgt - 1} L${x0 + hgt} ${y0 + hgt}`,
    `M${x0 + hgt + a} ${y0} L${x0 + hgt + a + flap} ${y0 + flap} L${x0 + hgt + a + flap} ${y0 + hgt - 1} L${x0 + hgt + a} ${y0 + hgt}`,
    `M${x0 + hgt} ${y0 + hgt + a} L${x0 + hgt - flap} ${y0 + hgt + a + 1} L${x0 + hgt - flap} ${y0 + 2 * hgt + a - flap} L${x0 + hgt} ${y0 + 2 * hgt + a}`,
    `M${x0 + hgt + a} ${y0 + hgt + a} L${x0 + hgt + a + flap} ${y0 + hgt + a + 1} L${x0 + hgt + a + flap} ${y0 + 2 * hgt + a - flap} L${x0 + hgt + a} ${y0 + 2 * hgt + a}`,
  ]
  return <g>
    <defs><clipPath id={id}>{faces.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}</clipPath></defs>
    {flaps.map((d, i) => <path key={i} d={d + ' Z'} fill="#eee" stroke="#111" strokeWidth={0.6} />)}
    {faces.map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={col ? col[0] : '#fff'} />)}
    <Pattern id={id} x={x0} y={y0} w={2 * hgt + a} h={2 * hgt + a} pattern={pattern} col={col} />
    {faces.map(([x, y, w, h], i) => <rect key={'o' + i} x={x} y={y} width={w} height={h} fill="none" stroke="#111" strokeWidth={i ? 0.8 : 0.5} strokeDasharray={i ? undefined : '2 1.2'} />)}
    <T x={x0 + hgt + a / 2} y={y0 + hgt + a / 2 + 2} size={6} weight={800}>{label}</T>
  </g>
}
export function GiftBox() {
  const [pattern, setPattern] = useState('dots')
  const [colorId, setColor] = useState('pink')
  const [to, setTo] = useState('')
  const col = pattern === 'plain' ? null : BOX_COLORS[colorId]
  // Box: 70×70 base, 35 high. Lid: 74×74, 14 high — slips over the box.
  const sheet1 = <Sheet label="קופסת מתנה — תחתית">
    <T x={100} y={13} size={7.5} weight={800}>קופסת מתנה — חלק 1: התחתית</T>
    <T x={100} y={21} size={4.4} fill="#444">גוזרים לאורך הקו החיצוני · מקפלים בקווים · מדביקים את הלשוניות האפורות מבפנים</T>
    <BoxNet id="cb" x0={100 - (70 + 70) / 2} y0={35} a={70} hgt={35} label="" pattern={pattern} col={col} />
  </Sheet>
  const sheet2 = <Sheet label="קופסת מתנה — מכסה">
    <T x={100} y={13} size={7.5} weight={800}>קופסת מתנה — חלק 2: המכסה</T>
    <T x={100} y={21} size={4.4} fill="#444">המכסה מעט גדול מהתחתית ונכנס עליה בקלות</T>
    <BoxNet id="cl" x0={100 - (74 + 28) / 2} y0={50} a={74} hgt={14} label={to ? `ל${to}` : 'מתנה ממני'} pattern={pattern} col={col} />
    <rect x={30} y={180} width={140} height={58} rx={6} fill="#fff" stroke="#111" strokeWidth={0.6} strokeDasharray="2 1.2" />
    <T x={100} y={192} size={6} weight={700}>כרטיס ברכה קטן לגזירה</T>
    {[0, 1, 2].map(i => <line key={i} x1={40} x2={160} y1={206 + i * 10} y2={206 + i * 10} stroke="#bbb" strokeWidth={0.4} />)}
  </Sheet>
  return <PrintableShell path="/printables/gift-box" emoji="🎁" h1="קופסת מתנה לקיפול להדפסה"
    seoTitle="קופסת מתנה להדפסה — תבנית לקיפול עם מכסה"
    description="תבנית קופסת מתנה להדפסה בחינם: קופסה עם מכסה לגזירה וקיפול, בנקודות, פסים או כוכבים, עם שם המקבל וכרטיס ברכה. גודל כ-7 ס״מ — לממתקים ולמתנות קטנות."
    sub="תחתית ומכסה לגזירה — עם דוגמה, צבע ושם של מי שמקבל"
    crumbs={CRUMBS} siblings={SIBLINGS}
    controls={<>
      <Choice label="דוגמה" value={pattern} onChange={setPattern} options={Object.entries(PATTERNS)} />
      {pattern !== 'plain' && <Choice label="צבע" value={colorId} onChange={setColor} options={[['pink', '🩷 ורוד'], ['blue', '💙 כחול'], ['yellow', '💛 צהוב'], ['green', '💚 ירוק']]} />}
      <div className="mx-auto max-w-sm"><Field label="למי המתנה? (לא חובה)" value={to} onChange={setTo} placeholder="למשל: נועה" maxLength={14} /></div>
    </>}
    pages={[{ key: 'base', svg: sheet1 }, { key: 'lid', svg: sheet2 }]}
    paragraphs={['קופסת מתנה מנייר היא אריזה מושלמת לממתקים, לתכשיט קטן או להפתעה ליום הולדת — ובעיקר, יצירה שילדים יכולים להכין לבד. מדפיסים שני דפים: אחד לתחתית ואחד למכסה, שגדול ממנה במעט ונכנס עליה בדיוק.', 'בוחרים דוגמה וצבע, או מדפיסים קופסה חלקה וצובעים בעצמכם. על המכסה מופיע שם המקבל, ובדף השני יש גם כרטיס ברכה קטן לגזירה. הקופסה המוכנה היא בערך 7 על 7 ס״מ.', 'כדי שהקופסה תהיה יציבה מדפיסים על בריסטול, ולפני הקיפול מעבירים עט ריק או סרגל על הקווים — כך הקיפול יוצא חד וישר.']}
    faq={[{ q: 'איזה דבק הכי מתאים?', a: 'מקל דבק מספיק לבריסטול דק. לקופסה חזקה יותר משתמשים בדבק נוזלי או בסלוטייפ דו-צדדי.' }, { q: 'מה אפשר לשים בקופסה?', a: 'ממתקים, תכשיט קטן, פתק הפתעה, מחיק — כל דבר עד כ-7 ס״מ.' }]}
    related={[{ label: 'כרטיסי תודה', href: '/printables/thank-you' }, { label: 'קוטי פוטי להדפסה', href: '/printables/fortune-teller' }, { label: 'רעיונות למתנות', href: '/gifts' }]} />
}

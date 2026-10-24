import { Sheet } from '../../../components/printables/PrintableShell'
import { TextBox, seededShuffle } from '../speechSheets'
import { CutLines, EMOJI, SheetHeader, SvgPic, Txt, rng } from '../languageShared'
import { NAMES, TIMES, TENSE_VERBS, fill, gapsFor, pluralsOf } from '../../../data/speech/grammar'

// Printables for /speech/language/grammar, drawn in the 200×270 A4 box: singular/plural picture
// cards (memory / matching), "complete the sentence" sheets with an answer key, and tense
// sequence cards (before / now / later). All black-and-white friendly.

const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n))

// A few copies of one picture arranged inside a box (1 → centred, 2 → side by side, 3 → triangle).
function ManyPics({ item, n, cx, cy, size }) {
  if (n === 1) return <SvgPic item={item} cx={cx} cy={cy} size={size} />
  const s = size * (n === 2 ? 0.62 : 0.55)
  const spots = n === 2 ? [[-0.55, 0], [0.55, 0]] : [[-0.55, 0.32], [0.55, 0.32], [0, -0.42]]
  return <g>{spots.map(([dx, dy], i) => <SvgPic key={i} item={item} cx={cx + dx * s} cy={cy + dy * s} size={s} />)}</g>
}

// Singular/plural pairs: 16 cards (8 pairs) per page, each row "one — many — one — many".
export function pluralCardSheets(level, words, seed) {
  const list = seededShuffle(pluralsOf(level), rng(seed))
  const pages = chunk(list, 8)
  const cw = 47.5, ch = 60.5
  return pages.map((pairs, p) => {
    const cells = pairs.flatMap((x, k) => [0, 1].map(j => {
      const i = k * 2 + j
      return { x: 5 + 190 - ((i % 4) + 1) * cw, y: 21 + Math.floor(i / 4) * ch, w: cw, h: ch, x0: x, many: j === 1 }
    }))
    return {
      key: `plural-${level}-${p}`,
      svg: <Sheet label={`כרטיסי יחיד ורבים — דף ${p + 1}`}>
        <SheetHeader title={pages.length > 1 ? `יחיד ורבים — כרטיסים (${p + 1}/${pages.length})` : 'יחיד ורבים — כרטיסים'}
          note="✂ גוזרים · זיכרון: מוצאים זוג „אחד — הרבה” ואומרים את שתי המילים · אפשר גם למיין ל„אחד” ול„הרבה”" />
        <CutLines cells={cells} />
        {cells.map((c, i) => <g key={i}>
          <text x={c.x + c.w - 4} y={c.y + 6} fontSize={3} fontFamily="Heebo, Arial, sans-serif" fill="#6b7280" direction="rtl" textAnchor="start">{c.many ? 'רבים' : 'יחיד'}</text>
          <ManyPics item={c.x0} n={c.many ? c.x0.n : 1} cx={c.x + c.w / 2} cy={c.y + (words ? c.h * 0.42 : c.h * 0.52)} size={words ? 22 : 26} />
          {words && <TextBox x={c.x + 3} y={c.y + c.h * 0.72} w={c.w - 6} h={c.h * 0.22} text={c.many ? c.x0.p : c.x0.s} max={7} maxLines={1} />}
        </g>)}
      </Sheet>,
    }
  })
}

// "Complete the sentence": 8 rows per page; the adult reads, the child chooses, someone circles.
export function gapSheets(sec, seed, answers) {
  const rand = rng(seed)
  const items = seededShuffle(gapsFor(sec), rand).slice(0, 16).map(x => ({ ...x, opts: seededShuffle(x.opts, rand) }))
  const pages = chunk(items, 8)
  const rowH = 30, y0 = 24
  const page = (rows, p, key) => <Sheet label={key ? 'השלימו את המשפט — תשובות' : 'השלימו את המשפט'}>
    <SheetHeader title={key ? `השלימו את המשפט — תשובות (דף ${p + 1})` : 'השלימו את המשפט'}
      note={key ? 'בעיגול: המילה הנכונה · מתחת: המשפט המלא' : 'המבוגר קורא את המשפט עם „מממ” במקום החסר · הילד/ה בוחר/ת את המילה המתאימה ומקיפים אותה'} />
    {!key && <Txt x={195} y={22} size={3.6} anchor="start">שם: _______________</Txt>}
    {rows.map((r, ri) => {
      const y = y0 + 3 + ri * rowH
      const ow = r.opts.length === 3 ? 17 : 22
      return <g key={ri}>
        <rect x={5} y={y} width={190} height={rowH - 3} rx={3} fill="#fff" stroke="#d1d5db" strokeWidth=".35" />
        <circle cx={189} cy={y + 13.5} r={3.8} fill="#f3f4f6" stroke="#111" strokeWidth=".4" />
        <Txt x={189} y={y + 15} size={3.9} weight={800}>{p * 8 + ri + 1}</Txt>
        <text x={168} y={y + 13.5} textAnchor="middle" dominantBaseline="central" fontSize={r.pics.length > 2 ? 7 : 9} fontFamily={EMOJI}>{r.pics.join('')}</text>
        <TextBox x={5 + r.opts.length * (ow + 2) + 4} y={y + 2} w={147 - (5 + r.opts.length * (ow + 2) + 4)} h={rowH - 7}
          text={key ? fill(r.text, r.ans) : r.text.replace(/_([א-ת]?)/, (_, c) => c ? `______ ${c}` : '______')} max={5} maxLines={2} weight={key ? 600 : 700} />
        {r.opts.map((o, i) => {
          const x = 7 + i * (ow + 2)
          const hit = key && o === r.ans
          return <g key={o}>
            <rect x={x} y={y + 7} width={ow} height={13} rx={2.5} fill="#fff" stroke="#111" strokeWidth=".5" />
            {hit && <ellipse cx={x + ow / 2} cy={y + 13.5} rx={ow / 2 + 1.6} ry={8.6} fill="none" stroke="#dc2626" strokeWidth="1" />}
            <TextBox x={x + 1} y={y + 8} w={ow - 2} h={11} text={o === 'ו' ? 'ו־' : o} max={5} maxLines={1} />
          </g>
        })}
      </g>
    })}
    {!key && <Txt x={100} y={266} size={3.1} fill="#4b5563">בלי לחץ: אם נבחרה מילה אחרת — אומרים את המשפט הנכון בטבעיות וממשיכים.</Txt>}
  </Sheet>
  return [
    ...pages.map((rows, p) => ({ key: `gap-${sec}-${p}`, svg: page(rows, p, false) })),
    ...(answers ? pages.map((rows, p) => ({ key: `gap-key-${sec}-${p}`, svg: page(rows, p, true) })) : []),
  ]
}

// Tense sequence cards: one verb per row — before (yesterday), now, later (tomorrow), right to left.
export function tenseCardSheets(g, words) {
  const pages = chunk(TENSE_VERBS, 3)
  const cw = 190 / 3, ch = 80
  return pages.map((verbs, p) => {
    const cells = verbs.flatMap((v, r) => TIMES.map((t, ti) => ({ v, t, ti, x: 5 + 190 - (ti + 1) * cw, y: 22 + r * ch, w: cw, h: ch })))
    return {
      key: `tense-${g}-${p}`,
      svg: <Sheet label={`כרטיסי זמנים — ${NAMES[g]}`}>
        <SheetHeader title={`לפני, עכשיו, אחר כך — ${NAMES[g]} (${p + 1}/${pages.length})`}
          note="✂ גוזרים, מערבבים ומסדרים כל שורה לפי הסדר: אתמול ← עכשיו ← מחר · ואומרים את המשפט בכל כרטיס" />
        <CutLines cells={cells} />
        {cells.map((c, i) => {
          const future = c.t.id === 'future', past = c.t.id === 'past'
          return <g key={i}>
            <rect x={c.x + 3} y={c.y + 3} width={c.w - 6} height={c.h - 6} rx={4} fill="#fff" stroke="#111" strokeWidth={c.t.id === 'now' ? 1.1 : 0.5} strokeDasharray={future ? '2.2 1.6' : undefined} />
            <rect x={c.x + 3} y={c.y + 3} width={c.w - 6} height={11} rx={4} fill="#f3f4f6" />
            <Txt x={c.x + c.w / 2} y={c.y + 10.6} size={4.6} weight={900}>{c.t.label === c.t.word ? c.t.label : `${c.t.label} · ${c.t.word}`}</Txt>
            <text x={c.x + c.w / 2} y={c.y + (words ? 37 : 44)} textAnchor="middle" dominantBaseline="central" fontSize={22} fontFamily={EMOJI} opacity={future ? 0.45 : 1}>{c.v.e}</text>
            {past && <g><circle cx={c.x + c.w - 13} cy={c.y + 23} r={5} fill="#fff" stroke="#111" strokeWidth=".6" /><path d={`M${c.x + c.w - 15.5} ${c.y + 23} l2 2.2 l3.6 -4.2`} fill="none" stroke="#111" strokeWidth=".9" /></g>}
            {future && <text x={c.x + 13} y={c.y + 23} textAnchor="middle" dominantBaseline="central" fontSize={7} fontFamily={EMOJI}>⏳</text>}
            {words && <TextBox x={c.x + 5} y={c.y + 54} w={c.w - 10} h={20} text={`${c.t.word} ${NAMES[g]} ${c.v[g][c.ti]} ${c.v.obj}.`} max={5} maxLines={2} />}
          </g>
        })}
      </Sheet>,
    }
  })
}

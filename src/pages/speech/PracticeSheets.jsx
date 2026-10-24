import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuickAnswer from '../../components/ui/QuickAnswer'
import { Sheet, T, Choice } from '../../components/printables/PrintableShell'
import { SOUNDS, loadSound, POSITIONS } from '../../data/speech/sounds'
import {
  PATH, SHEET_TYPES, KIT, GENDERS, gw, DAYS, CUE_LEVELS, CERT_TYPES, CHART_THEMES, defaultWords, defaultSentences,
  emojiLookup, lines, itemsFromText, letterIntro, practiceSteps, praiseTips, certificateText, percent, chartPath,
} from '../../data/speech/practiceSheets'
import SpeechNote from './SpeechNote'
import { SheetsPreview } from './speechSheets'

// /speech/tools/practice-sheets — printable forms for speech-language clinicians: home practice log,
// letter to parents, trial data sheet, session notes, certificates and a sticker chart.
// Privacy: the child's name and every other field live in React state only — never in storage,
// never in the print title, never sent anywhere.

const EMOJI = '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
const INK = '#111', SOFT = '#eef0f4', GRAY = '#6b7280'

function wrap(text, width, size) {
  const max = Math.max(4, Math.floor(width / (size * 0.5)))
  const out = []
  for (const para of String(text || '').split('\n')) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      if (!line) line = word
      else if ((line + ' ' + word).length <= max) line += ' ' + word
      else { out.push(line); line = word }
    }
    if (line) out.push(line)
  }
  return out
}

// Right-aligned paragraph; returns [elements, nextY].
function para(text, { right = 192, y, w = 184, size = 4, weight = 400, lh = 1.5, fill = INK, key = 'p', bullet = '' }) {
  const ls = wrap(text, w - (bullet ? 5 : 0), size)
  const els = ls.map((l, i) => <T key={`${key}-${i}`} x={right - (bullet ? 5 : 0)} y={y + i * size * lh} size={size} anchor="start" weight={weight} fill={fill}>{l}</T>)
  if (bullet && ls.length) els.unshift(<T key={`${key}-b`} x={right} y={y} size={size} anchor="start" weight={800}>{bullet}</T>)
  return [els, y + ls.length * size * lh]
}

function Head({ title, sub }) {
  return <g>
    <T x={100} y={15} size={8.6} weight={900}>{title}</T>
    {sub && <T x={100} y={21.5} size={3.8} fill="#444">{sub}</T>}
    <line x1={8} x2={192} y1={25} y2={25} stroke={INK} strokeWidth={0.4} />
  </g>
}

// "Label: value ______" from `right` leftwards over `w`.
function FieldLine({ right, y, w, label, value = '', size = 4 }) {
  const lw = label.length * size * 0.5 + 2
  return <g>
    <T x={right} y={y} size={size} anchor="start" weight={700}>{label}</T>
    {value && <T x={right - lw - 1} y={y - 0.3} size={size} anchor="start">{value}</T>}
    <line x1={right - w} x2={right - lw} y1={y + 1.3} y2={y + 1.3} stroke="#777" strokeWidth={0.25} />
  </g>
}

function LinedBox({ x = 8, y, w = 184, h, title, text = '', gap = 7.5, size = 3.9, children }) {
  const n = Math.max(0, Math.floor((h - 9) / gap))
  const typed = wrap(text, w - 6, size).slice(0, n)
  return <g>
    <rect x={x} y={y} width={w} height={h} rx={2.5} fill="#fff" stroke={INK} strokeWidth={0.5} />
    <T x={x + w - 3} y={y + 6} size={4.4} anchor="start" weight={800}>{title}</T>
    {Array.from({ length: n }, (_, i) => <line key={i} x1={x + 3} x2={x + w - 3} y1={y + 8 + (i + 1) * gap} y2={y + 8 + (i + 1) * gap} stroke="#aaa" strokeWidth={0.25} />)}
    {typed.map((t, i) => <T key={`t${i}`} x={x + w - 3} y={y + 8 + (i + 1) * gap - 1.4} size={size} anchor="start">{t}</T>)}
    {children}
  </g>
}

const Box = ({ x, y, s = 3.6 }) => <rect x={x} y={y} width={s} height={s} rx={0.6} fill="#fff" stroke={INK} strokeWidth={0.35} />

// Word chips in a grid, right to left.
function Chips({ items, y, cols = 5, h = 14, x0 = 8, w = 184, size = 4.2 }) {
  const cw = w / cols
  return <g>{items.map((it, i) => {
    const x = x0 + w - ((i % cols) + 1) * cw, yy = y + Math.floor(i / cols) * h
    const pic = !!it.e
    const textW = cw - (pic ? 14 : 5)
    const fs = Math.min(size, textW / Math.max(1, it.t.length * 0.52))
    return <g key={i}>
      <rect x={x + 0.8} y={yy + 0.8} width={cw - 1.6} height={h - 1.6} rx={2} fill="#fff" stroke="#9ca3af" strokeWidth={0.4} />
      {pic && <text x={x + cw - 6.5} y={yy + h / 2} textAnchor="middle" dominantBaseline="central" fontSize={h * 0.5} fontFamily={EMOJI}>{it.e}</text>}
      <T x={pic ? x + (cw - 12) / 2 + 1 : x + cw / 2} y={yy + h / 2 + fs * 0.35} size={fs} weight={800}>{it.t}</T>
    </g>
  })}</g>
}

const starPts = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}` }).join(' ')

// Three faces to circle: big smile, small smile, straight mouth.
function Faces({ cx, cy, r = 3.2, gap = 9 }) {
  const mouths = [`M -1.7 0.6 Q 0 2.6 1.7 0.6`, `M -1.5 1 Q 0 1.9 1.5 1`, `M -1.5 1.3 L 1.5 1.3`]
  return <g>{mouths.map((d, i) => <g key={i} transform={`translate(${cx + (1 - i) * gap} ${cy}) scale(${r / 3.2})`}>
    <circle r={3.2} fill="#fff" stroke={INK} strokeWidth={0.35} />
    <circle cx={-1.1} cy={-0.8} r={0.4} fill={INK} /><circle cx={1.1} cy={-0.8} r={0.4} fill={INK} />
    <path d={d} fill="none" stroke={INK} strokeWidth={0.4} strokeLinecap="round" />
  </g>)}</g>
}

// ── 1. Home practice log ─────────────────────────────────────────────────
function LogSheet({ o }) {
  const words = o.words.slice(0, 10)
  const rows = Math.ceil(Math.max(1, words.length) / 5)
  const tY = 52 + rows * 14 + 6
  const rh = Math.min(21, (236 - tY - 11) / 7)
  const cols = [['יום', 22], ['תרגלנו 5 דקות?', 34], ['מה תרגלנו? (מילים, משחק)', 0], ['איך היה?', 34], ['חתימת הורה', 26]]
  const flex = 184 - cols.reduce((s, c) => s + c[1], 0)
  let r = 192
  const pos = cols.map(([l, w]) => { const ww = w || flex; const p = { l, r, w: ww }; r -= ww; return p })
  return <Sheet label="יומן תרגול בבית">
    <Head title="יומן תרגול בבית" sub={o.soundLabel ? `הצליל ${o.soundLabel}${o.posLabel ? ` · ${o.posLabel}` : ''} · מדביקים מדבקה על כל יום של תרגול` : 'מדביקים מדבקה על כל יום של תרגול'} />
    <FieldLine right={192} y={33} w={92} label="שם:" value={o.name} />
    <FieldLine right={96} y={33} w={88} label="שבוע מתאריך:" />
    <FieldLine right={192} y={41} w={184} label="המטרה לשבוע:" value={o.goal} />
    <T x={192} y={49} size={4.2} anchor="start" weight={800}>המילים שלנו השבוע:</T>
    {words.length ? <Chips items={words} y={51.5} /> : <line x1={8} x2={150} y1={60} y2={60} stroke="#aaa" strokeWidth={0.25} />}
    <rect x={8} y={tY} width={184} height={11} fill={SOFT} />
    {pos.map(p => <T key={p.l} x={p.r - p.w / 2} y={tY + 7} size={p.l.length > 14 ? 3.3 : 3.8} weight={800}>{p.l}</T>)}
    {DAYS.map((d, i) => {
      const y = tY + 11 + i * rh
      return <g key={d}>
        <T x={pos[0].r - pos[0].w / 2} y={y + rh / 2 + 1.4} size={4.2} weight={700}>{d}</T>
        <circle cx={pos[1].r - pos[1].w / 2} cy={y + rh / 2} r={Math.min(7.5, rh / 2 - 1.5)} fill="none" stroke={GRAY} strokeWidth={0.45} strokeDasharray="1.6 1.1" />
        <Faces cx={pos[3].r - pos[3].w / 2} cy={y + rh / 2} />
        <line x1={8} x2={192} y1={y + rh} y2={y + rh} stroke={INK} strokeWidth={0.25} />
      </g>
    })}
    {pos.slice(1).map(p => <line key={p.l} x1={p.r} x2={p.r} y1={tY} y2={tY + 11 + 7 * rh} stroke={INK} strokeWidth={0.25} />)}
    <line x1={8} x2={192} y1={tY + 11} y2={tY + 11} stroke={INK} strokeWidth={0.5} />
    <rect x={8} y={tY} width={184} height={11 + 7 * rh} fill="none" stroke={INK} strokeWidth={0.6} />
    <rect x={8} y={242} width={184} height={22} rx={2.5} fill="#fff" stroke="#9ca3af" strokeWidth={0.4} />
    {para('להורים: 5 דקות ביום, במשחק ובמצב רוח טוב. אומרים את המילה ברור בעצמכם ומחכים — בלי לחץ ובלי "תגיד נכון". מסמנים מדבקה על כל יום של תרגול (סופרים מאמץ, לא ציון), מקיפים פרצוף, ומביאים את הדף לפגישה הבאה.', { y: 248, right: 188, w: 176, size: 3.6, lh: 1.45, key: 'tip' })[0]}
  </Sheet>
}

// ── 2. Letter to parents ─────────────────────────────────────────────────
function letterLayout(o, size) {
  const els = []
  let y = 33
  const lh = 1.5
  const add = ([e, ny]) => { els.push(...e); y = ny }
  const heading = (t, k) => { els.push(<T key={k} x={192} y={y + 2} size={size + 0.6} anchor="start" weight={900}>{t}</T>); y += size * 2.1 }
  els.push(<T key="dear" x={192} y={y} size={size + 0.4} anchor="start" weight={800}>הורים יקרים,</T>); y += size * 1.9
  add(para(o.intro, { y, size, lh, key: 'intro' })); y += 2
  if (o.words.length) {
    heading('המילים של השבוע', 'hw')
    const w = o.words.slice(0, 12)
    els.push(<Chips key="chips" items={w} y={y - size * 0.9} cols={6} h={13} size={Math.min(4.2, size + 0.2)} />)
    y += Math.ceil(w.length / 6) * 13 + 3
  }
  if (o.sentences.length) {
    heading('משפטים לתרגול', 'hs')
    o.sentences.slice(0, 5).forEach((s, i) => add(para(s, { y, size, lh, key: `s${i}`, bullet: '•' })))
    y += 2
  }
  if (o.steps.length) {
    heading('איך מתרגלים ב־5 דקות', 'hp')
    o.steps.slice(0, 7).forEach((s, i) => add(para(s, { y, size, lh, key: `st${i}`, bullet: `${i + 1}.` })))
    y += 2
  }
  if (o.tips.length) {
    heading('טיפים לעידוד', 'ht')
    o.tips.slice(0, 6).forEach((s, i) => add(para(s, { y, size, lh, key: `tp${i}`, bullet: '★' })))
  }
  return [els, y]
}
function LetterSheet({ o }) {
  let size = 5, laid = letterLayout(o, size)
  while (laid[1] > 247 && size > 2.9) { size -= 0.2; laid = letterLayout(o, size) }
  return <Sheet label="מכתב להורים">
    <Head title="מתרגלים בבית — מכתב להורים" sub={o.soundLabel ? `הצליל ${o.soundLabel}${o.posLabel ? ` · ${o.posLabel}` : ''}${o.name ? ` · ${o.name}` : ''}` : o.name} />
    {laid[0]}
    <line x1={8} x2={192} y1={252} y2={252} stroke="#bbb" strokeWidth={0.25} />
    <FieldLine right={192} y={260} w={100} label="בברכה," value={o.clinician} />
    <FieldLine right={84} y={260} w={76} label="תאריך:" />
  </Sheet>
}

// ── 3. Data-tracking sheet ───────────────────────────────────────────────
function DataSheet({ o }) {
  const nRows = 12, rh = 13.5, top = 60, headH = 12
  const targets = [...o.words.slice(0, nRows).map(w => w.t), ...Array(Math.max(0, nRows - o.words.length)).fill('')]
  const cols = [['מטרה / מילה', 38], ...Array.from({ length: 10 }, (_, i) => [String(i + 1), 8.5]), ['רמת סיוע', 30], ['סה״כ +', 16], ['%', 21]]
  let r = 192
  const pos = cols.map(([l, w]) => { const p = { l, r, w }; r -= w; return p })
  const bottom = top + headH + nRows * rh
  return <Sheet label="טבלת נתונים">
    <Head title="טבלת נתונים — מעקב ניסיונות" sub="לקלינאית · בכל משבצת: + נכון   − לא נכון   ~ בקירוב" />
    <FieldLine right={192} y={33} w={74} label="שם:" value={o.name} />
    <FieldLine right={114} y={33} w={50} label="תאריך:" />
    <FieldLine right={60} y={33} w={52} label="מפגש מס׳:" />
    <FieldLine right={192} y={41} w={92} label="צליל ומיקום:" value={o.soundLabel ? `${o.soundLabel}${o.posLabel ? ` ${o.posLabel}` : ''}` : ''} />
    <T x={96} y={41} size={4} anchor="start" weight={700}>רמה:</T>
    {['הברה', 'מילה', 'צירוף', 'משפט', 'שיחה'].map((l, i) => <g key={l}><Box x={86 - i * 17} y={38.2} /><T x={81.5 - i * 17} y={41} size={3.4} anchor="start">{l}</T></g>)}
    <FieldLine right={192} y={49} w={184} label="מטרה:" value={o.goal} />
    <T x={192} y={56} size={3.4} anchor="start" fill="#444">מסמנים בכל משבצת תוצאה של ניסיון אחד, ומקיפים את רמת הסיוע של השורה. את האחוז מחשבים בסוף.</T>
    <rect x={8} y={top} width={184} height={headH} fill={SOFT} />
    {pos.map((p, i) => <T key={i} x={p.r - p.w / 2} y={top + headH / 2 + 1.3} size={i >= 1 && i <= 10 ? 3.6 : 3.6} weight={800}>{p.l}</T>)}
    {targets.map((t, i) => {
      const y = top + headH + i * rh
      return <g key={i}>
        {i % 2 === 1 && <rect x={8} y={y} width={184} height={rh} fill="#f7f8fa" />}
        {t && <T x={pos[0].r - 2} y={y + rh / 2 + 1.4} size={Math.min(4, 34 / Math.max(1, t.length * 0.52))} anchor="start" weight={700}>{t}</T>}
        {CUE_LEVELS.map(([s], k) => <g key={s}><circle cx={pos[11].r - 5 - k * 10} cy={y + rh / 2} r={3.3} fill="#fff" stroke={GRAY} strokeWidth={0.35} /><T x={pos[11].r - 5 - k * 10} y={y + rh / 2 + 1.25} size={3.5} weight={700}>{s}</T></g>)}
        <T x={pos[13].r - 3} y={y + rh / 2 + 1.3} size={3.6} anchor="end" fill="#9ca3af">%</T>
      </g>
    })}
    {Array.from({ length: nRows + 1 }, (_, i) => <line key={`h${i}`} x1={8} x2={192} y1={top + headH + i * rh} y2={top + headH + i * rh} stroke={INK} strokeWidth={i === 0 ? 0.5 : 0.25} />)}
    {pos.slice(1).map((p, i) => <line key={`v${i}`} x1={p.r} x2={p.r} y1={top} y2={bottom} stroke={INK} strokeWidth={i === 0 || i >= 10 ? 0.45 : 0.2} />)}
    <rect x={8} y={top} width={184} height={headH + nRows * rh} fill="none" stroke={INK} strokeWidth={0.6} />
    <T x={192} y={bottom + 7} size={3.6} anchor="start"><tspan fontWeight={800}>רמת סיוע: </tspan>{CUE_LEVELS.map(([s, l, d]) => `${s} = ${l} (${d})`).join(' · ')}</T>
    <T x={192} y={bottom + 13} size={3.6} anchor="start"><tspan fontWeight={800}>חישוב: </tspan>% = מספר ה־+ ÷ מספר הניסיונות שנעשו × 100 (בלי משבצות ריקות)</T>
    <FieldLine right={192} y={bottom + 21} w={184} label="סיכום המפגש: ____ + מתוך ____ ניסיונות = ____ %   ·   הערות:" />
  </Sheet>
}

// ── 4. Session notes ─────────────────────────────────────────────────────
function NotesSheet({ o }) {
  const goal = [o.goal, o.soundLabel ? `הצליל ${o.soundLabel}${o.posLabel ? ` ${o.posLabel}` : ''}` : ''].filter(Boolean).join(' · ')
  const home = o.words.length ? `תרגול בבית: ${o.words.slice(0, 8).map(w => w.t).join(', ')}` : ''
  return <Sheet label="סיכום פגישה">
    <Head title="סיכום פגישה" sub="תבנית כללית לתיעוד הפגישה ולתכנון ההמשך" />
    <FieldLine right={192} y={33} w={70} label="שם:" value={o.name} />
    <FieldLine right={118} y={33} w={40} label="תאריך:" />
    <FieldLine right={74} y={33} w={34} label="מפגש מס׳:" />
    <FieldLine right={36} y={33} w={28} label="משך:" />
    <LinedBox y={39} h={38} title="מטרות הפגישה" text={goal} />
    <LinedBox y={80} h={38} title="פעילויות וחומרים" />
    <LinedBox y={121} h={52} title="תגובה והתקדמות">
      <T x={189} y={133} size={3.6} anchor="start" weight={700}>רמת סיוע עיקרית:</T>
      {CUE_LEVELS.map(([, l], k) => <g key={l}><Box x={150 - k * 22} y={130.2} /><T x={145.5 - k * 22} y={133} size={3.6} anchor="start">{l}</T></g>)}
      <T x={78} y={133} size={3.6} anchor="start" weight={700}>דיוק משוער: ______ %</T>
    </LinedBox>
    <LinedBox y={176} h={38} title="משימה לבית" text={home} />
    <LinedBox y={217} h={38} title="הערות ותכנון לפגישה הבאה" />
    <T x={100} y={262} size={3.2} fill={GRAY}>מומלץ לשמור את הדף לפי נוהלי שמירת המידע של המקום שבו אתם עובדים.</T>
  </Sheet>
}

// ── 5. Certificates ──────────────────────────────────────────────────────
function CertSheet({ o, kind }) {
  const c = certificateText(kind, { gender: o.gender, soundLabel: o.soundLabel })
  const name = o.name.trim()
  const medal = kind === 'champ'
    ? <g><circle cx={100} cy={64} r={19} fill="#fff" stroke={INK} strokeWidth={1.2} /><circle cx={100} cy={64} r={15.5} fill="none" stroke={INK} strokeWidth={0.4} strokeDasharray="1.4 1" />
      <T x={100} y={71.5} size={o.soundLabel.length > 3 ? 11 : 20} weight={900}>{o.soundLabel || '★'}</T></g>
    : kind === 'week'
      ? <polygon points={starPts(100, 64, 20)} fill="#fff" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
      : <text x={100} y={76} textAnchor="middle" dominantBaseline="central" fontSize={42} fontFamily={EMOJI}>🏆</text>
  return <Sheet label={c.title}>
    <rect x={7} y={7} width={186} height={256} rx={6} fill="none" stroke={INK} strokeWidth={1.4} />
    <rect x={11} y={11} width={178} height={248} rx={4} fill="none" stroke={INK} strokeWidth={0.4} strokeDasharray="2.2 1.4" />
    {[[22, 22], [178, 22], [22, 248], [178, 248]].map(([x, y], i) => <polygon key={i} points={starPts(x, y, 5)} fill="none" stroke={INK} strokeWidth={0.5} />)}
    {kind !== 'finish' && <g><path d="M 88 80 L 82 104 L 89 99 L 93 106 L 97 82" fill="#fff" stroke={INK} strokeWidth={0.7} strokeLinejoin="round" /><path d="M 112 80 L 118 104 L 111 99 L 107 106 L 103 82" fill="#fff" stroke={INK} strokeWidth={0.7} strokeLinejoin="round" /></g>}
    {medal}
    <T x={100} y={34} size={4.6} fill="#444">{kind === 'finish' ? 'קלינאות תקשורת' : kind === 'week' ? 'תרגול בבית' : 'כל הכבוד!'}</T>
    <T x={100} y={124} size={c.title.length > 14 ? 11 : 13} weight={900}>{c.title}</T>
    <T x={100} y={140} size={5} fill="#444">התעודה מוענקת ל</T>
    {name
      ? <T x={100} y={158} size={name.length > 14 ? 9 : 12} weight={900}>{name}</T>
      : <line x1={45} x2={155} y1={159} y2={159} stroke={INK} strokeWidth={0.4} />}
    {c.lines.map((l, i) => <T key={i} x={100} y={176 + i * 10} size={i === 0 ? 6 : 5} weight={i === 0 ? 800 : 400}>{l}</T>)}
    {o.personal && wrap(o.personal, 150, 4.8).slice(0, 3).map((l, i) => <T key={`p${i}`} x={100} y={200 + i * 7} size={4.8} fill="#333">{l}</T>)}
    <line x1={120} x2={170} y1={240} y2={240} stroke={INK} strokeWidth={0.35} />
    <line x1={30} x2={80} y1={240} y2={240} stroke={INK} strokeWidth={0.35} />
    {o.clinician && <T x={145} y={237} size={4.4} weight={700}>{o.clinician}</T>}
    <T x={145} y={246} size={3.8} fill="#444">חתימה</T>
    <T x={55} y={246} size={3.8} fill="#444">תאריך</T>
  </Sheet>
}

// ── 6. Sticker chart ─────────────────────────────────────────────────────
const DECO_SPOTS = [[16, 58, 8], [140, 66, 6], [63, 118, 6], [137, 118, 6], [100, 170, 6], [50, 170, 5], [150, 170, 5], [182, 220, 7]]
function ChartSheet({ o }) {
  const th = CHART_THEMES.find(t => t.id === o.theme) || CHART_THEMES[0]
  const pts = chartPath()
  const d = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pts[i - 1]
    if (p.y !== prev.y) { const side = prev.x > 100 ? 1 : -1; const cx = prev.x + side * 22; return `C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}` }
    return `L ${p.x} ${p.y}`
  }).join(' ')
  const last = pts[pts.length - 1]
  const who = o.name.trim()
  return <Sheet label={`לוח מדבקות — ${th.label}`}>
    <T x={100} y={17} size={10} weight={900}>{th.label}</T>
    <T x={100} y={25} size={4.4} fill="#444">{th.sub}</T>
    <T x={100} y={36} size={5.4} weight={800}>{who ? `${who} ${gw(o.gender, 'אוסף', 'אוספת', 'אוסף/ת')} מדבקות` : 'השם שלי: ____________________'}</T>
    {o.soundLabel && <T x={100} y={44} size={4.4}>{`הצליל שלי: ${o.soundLabel}`}</T>}
    <T x={100} y={52} size={3.8} fill="#444">על כל תרגול — מדבקה בעיגול. 21 עיגולים עד הסוף!</T>
    {DECO_SPOTS.map(([x, y, s], i) => <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={s} fontFamily={EMOJI} opacity={0.75}>{th.deco[i % th.deco.length]}</text>)}
    <path d={d} fill="none" stroke="#c7cad1" strokeWidth={5} strokeLinecap="round" />
    <path d={d} fill="none" stroke={INK} strokeWidth={0.4} strokeDasharray="2 2" />
    <text x={pts[0].x + 4} y={pts[0].y - 22} textAnchor="middle" dominantBaseline="central" fontSize={13} fontFamily={EMOJI}>{th.start}</text>
    <T x={pts[0].x - 10} y={pts[0].y - 20} size={3.8} weight={800}>התחלה</T>
    {pts.map(p => <g key={p.n}>
      <circle cx={p.x} cy={p.y} r={10.5} fill="#fff" stroke={INK} strokeWidth={0.7} />
      <T x={p.x} y={p.y + 1.6} size={4.4} fill="#c3c7cf" weight={700}>{p.n}</T>
    </g>)}
    <text x={last.x} y={last.y + 30} textAnchor="middle" dominantBaseline="central" fontSize={24} fontFamily={EMOJI}>{th.end}</text>
    <T x={last.x} y={last.y + 47} size={4} weight={800}>הגעתי!</T>
    <rect x={60} y={232} width={132} height={26} rx={4} fill="#fff" stroke={INK} strokeWidth={0.6} />
    <T x={188} y={242} size={4.4} anchor="start" weight={800}>כשמגיעים לסוף:</T>
    {o.reward ? <T x={188} y={252} size={4.6} anchor="start">{o.reward}</T> : <line x1={66} x2={188} y1={253} y2={253} stroke="#999" strokeWidth={0.3} />}
  </Sheet>
}

function buildPages(type, o) {
  const one = t => {
    if (t === 'log') return { key: 'log', svg: <LogSheet o={o} /> }
    if (t === 'letter') return { key: 'letter', svg: <LetterSheet o={o} /> }
    if (t === 'data') return { key: 'data', svg: <DataSheet o={o} /> }
    if (t === 'notes') return { key: 'notes', svg: <NotesSheet o={o} /> }
    if (t === 'chart') return { key: 'chart', svg: <ChartSheet o={o} /> }
    return { key: `cert-${o.certKind}`, svg: <CertSheet o={o} kind={o.certKind} /> }
  }
  return type === 'kit' ? KIT.map(one) : [one(type)]
}

// ── Page ─────────────────────────────────────────────────────────────────

const faq = [
  { q: 'אילו דפים אפשר להכין כאן?', a: 'שישה סוגים: יומן תרגול בבית לשבוע (ימים × "תרגלנו 5 דקות" עם עיגול למדבקה וחתימת הורה), מכתב להורים עם המילים והמשפטים של השבוע והסבר איך מתרגלים, טבלת נתונים לקלינאית (10 ניסיונות לכל מטרה, רמת סיוע ואחוזים), תבנית לסיכום פגישה, תעודות (אלוף/ת הצליל, תרגלתי כל השבוע, תעודת סיום טיפול) ולוח מדבקות עם 21 עיגולים.' },
  { q: 'השם של הילד נשמר או נשלח לאנשהו?', a: 'לא. השם וכל מה שמקלידים נשארים רק בדף הפתוח בדפדפן שלכם — לא נשמרים במכשיר, לא נשלחים לשרת ולא מופיעים בכותרת ההדפסה. כשסוגרים או מרעננים את הדף הם נמחקים. אפשר גם להשאיר את השם ריק ולכתוב אותו בעט.' },
  { q: 'איך המילים נכנסות לדפים?', a: 'בוחרים צליל ומיקום (בתחילת המילה, באמצע, בסוף או בצירוף), והמילים והמשפטים נלקחים אוטומטית ממאגר המילים של עמודי הצלילים באתר — מסודרות לפי ההגייה. אפשר למחוק, לשנות או להוסיף מילים משלכם בתיבת הטקסט.' },
  { q: 'איך מחשבים את האחוזים בטבלת הנתונים?', a: 'סופרים את הניסיונות שסומנו ב־+ ומחלקים במספר הניסיונות שנעשו בפועל (בלי משבצות ריקות), ואז כופלים ב־100. למשל 7 נכונים מתוך 10 ניסיונות = 70%. בדף יש מחשבון קטן שעושה את החשבון במסך.' },
  { q: 'יש בטופס סיכום הפגישה שדות לאבחנה?', a: 'לא, בכוונה. זו תבנית כללית לתיעוד מטרות, פעילויות, תגובה ומשימה לבית — בלי אבחנה ובלי פרטים רפואיים. את התיעוד הרשמי ממשיכים לנהל לפי הנהלים של מקום העבודה.' },
  { q: 'אפשר לבחור ניסוח לבן או לבת?', a: 'כן. בוחרים "ילד", "ילדה" או ניסוח כללי עם לוכסן, והמכתב, התעודות ולוח המדבקות מתאימים את עצמם (אלוף/אלופת, תרגל/תרגלה, סיים/סיימה).' },
  { q: 'זה חינם? מותר להשתמש בקליניקה?', a: 'כן — חינם, בלי הרשמה, לקליניקה פרטית, לגן, לבית הספר ולשיעורי בית. הדפים מותאמים ל־A4 ונראים טוב גם בהדפסה בשחור־לבן.' },
]

const Area = ({ label, value, onChange, rows = 4, onReset, hint }) => <label className="block font-bold">
  <span className="flex flex-wrap items-center justify-between gap-2"><span>{label}</span>
    {onReset && <button type="button" onClick={onReset} className="min-h-[36px] rounded-lg border border-[var(--border)] bg-white px-2 text-sm font-bold">↺ חזרה לנוסח האוטומטי</button>}</span>
  {hint && <span className="block text-sm font-normal text-[var(--muted-foreground)]">{hint}</span>}
  <textarea value={value} rows={rows} onChange={e => onChange(e.target.value)} className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
</label>

const Input = ({ label, value, onChange, placeholder, maxLength = 40, type = 'text', hint }) => <label className="block font-bold">{label}
  {hint && <span className="block text-sm font-normal text-[var(--muted-foreground)]">{hint}</span>}
  <input type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={e => onChange(e.target.value)} autoComplete="off"
    className="mt-1 w-full wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-normal" />
</label>

export default function PracticeSheets() {
  const [type, setType] = useState('log')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('m')
  const [clinician, setClinician] = useState('')
  const [goal, setGoal] = useState('')
  const [soundId, setSoundId] = useState(SOUNDS[0].id)
  const [position, setPosition] = useState('initial')
  const [loaded, setLoaded] = useState({})
  const [wordsText, setWordsText] = useState(null)
  const [sentText, setSentText] = useState(null)
  const [introText, setIntroText] = useState(null)
  const [stepsText, setStepsText] = useState(null)
  const [tipsText, setTipsText] = useState(null)
  const [certKind, setCertKind] = useState('champ')
  const [personal, setPersonal] = useState('')
  const [theme, setTheme] = useState(CHART_THEMES[0].id)
  const [reward, setReward] = useState('')
  const [calc, setCalc] = useState({ c: '', t: '' })

  useEffect(() => {
    let alive = true
    loadSound(soundId).then(d => { if (alive) setLoaded(m => ({ ...m, [soundId]: d })) })
    return () => { alive = false }
  }, [soundId])
  const data = loaded[soundId] || null

  const meta = SOUNDS.find(s => s.id === soundId)
  const soundLabel = meta?.label || ''
  const posLabel = (POSITIONS.find(p => p[0] === position) || ['all', ''])[1]
  const lookup = emojiLookup(data)
  const autoWords = defaultWords(data, position, 10).map(w => w.t).join('\n')
  const autoSent = defaultSentences(data, 4).join('\n')
  const autoIntro = letterIntro({ name, gender, soundLabel, posLabel, goal })
  const autoSteps = practiceSteps({ name, gender }).join('\n')
  const autoTips = praiseTips({ gender }).join('\n')

  const pickSound = id => { setSoundId(id); setWordsText(null); setSentText(null) }
  const pickPosition = p => { setPosition(p); setWordsText(null) }

  const o = {
    name: name.trim(), gender, clinician: clinician.trim(), goal: goal.trim(), soundLabel, posLabel,
    words: itemsFromText(wordsText ?? autoWords, lookup, 12),
    sentences: lines(sentText ?? autoSent).slice(0, 5),
    intro: introText ?? autoIntro,
    steps: lines(stepsText ?? autoSteps),
    tips: lines(tipsText ?? autoTips),
    certKind, personal: personal.trim(), theme, reward: reward.trim(),
  }
  const pages = buildPages(type, o)
  // The print title names the sheet only — never the child.
  const printTitle = type === 'cert' ? CERT_TYPES.find(c => c[0] === certKind)[1] : SHEET_TYPES.find(t => t[0] === type)[1]
  const uses = new Set(type === 'kit' ? KIT : [type])
  const pct = percent(calc.c, calc.t)

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="דפי עבודה לקלינאית תקשורת: מעקב תרגול, שיעורי בית ותעודות"
      description="טופס מעקב טיפול בקלינאות תקשורת, יומן שיעורי בית, מכתב להורים עם מילים לפי צליל, טבלת נתונים, סיכום פגישה, תעודה לילד בסיום טיפול ולוח מדבקות — להדפסה, חינם."
      path={PATH} structuredData={faqSchema(faq)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'דפי עבודה לקלינאית' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl"><span aria-hidden="true">📋 </span>דפי עבודה לקלינאית תקשורת</h1>
    <p className="mb-4 text-center font-hand text-lg text-[var(--muted-foreground)]">מעקב תרגול, שיעורי בית, טבלת נתונים ותעודות — ממלאים במסך ומדפיסים</p>
    <QuickAnswer q="איך מכינים דף שיעורי בית ומעקב לטיפול בקלינאות תקשורת?"
      a="בוחרים את הדף (יומן תרגול, מכתב להורים, טבלת נתונים, סיכום פגישה, תעודה או לוח מדבקות), בוחרים צליל ומיקום — והמילים והמשפטים נכנסים לבד — ומוסיפים אם רוצים שם, מטרה וניסוח לילד או לילדה. מדפיסים ב־A4, גם בשחור־לבן."
      rows={[['דפים', 'יומן תרגול שבועי, מכתב להורים, טבלת נתונים +/−/~, סיכום פגישה, 3 תעודות, לוח 21 מדבקות'], ['מילים', `אוטומטית לפי צליל: ${SOUNDS.map(s => s.label).join(', ')}`], ['פרטיות', 'השם לא נשמר ולא נשלח — רק בדף הפתוח'], ['מחיר', 'חינם, בלי הרשמה']]}
      updated="2026-10-24" />
    <SpeechNote />

    <section aria-label="הגדרות" className="mx-auto mb-8 max-w-3xl space-y-4 wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-4 sketch-shadow-sm">
      <div className="text-center"><p className="mb-2 font-bold">איזה דף?</p><Choice label="איזה דף" value={type} onChange={setType} options={SHEET_TYPES} /></div>
      {type === 'cert' && <Choice label="איזו תעודה" value={certKind} onChange={setCertKind} options={CERT_TYPES} />}
      {type === 'chart' && <Choice label="נושא הלוח" value={theme} onChange={setTheme} options={CHART_THEMES.map(t => [t.id, `${t.start} ${t.label}`])} />}

      <p role="note" className="rounded-xl border border-emerald-300 bg-white p-3 text-center text-sm leading-relaxed">
        <span aria-hidden="true">🔒 </span><b>שום דבר לא יוצא מהמכשיר.</b> השם וכל מה שמקלידים כאן נשארים רק בדף הפתוח — לא נשמרים, לא נשלחים ולא מופיעים בכותרת ההדפסה. אפשר גם להשאיר ריק ולכתוב בעט.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="שם הילד/ה (לא חובה)" value={name} onChange={setName} placeholder="אפשר להשאיר ריק" maxLength={24} />
        <Input label="שם הקלינאית לחתימה (לא חובה)" value={clinician} onChange={setClinician} placeholder="למשל: נועה, קלינאית תקשורת" />
      </div>
      <div className="text-center"><p className="mb-2 font-bold">ניסוח הדפים</p><Choice label="ניסוח" value={gender} onChange={setGender} options={GENDERS} /></div>
      <Input label="המטרה (לא חובה)" value={goal} onChange={setGoal} maxLength={90} placeholder="למשל: לומר ר׳ בתחילת מילה, במילים בודדות" />

      <div className="text-center">
        <p className="mb-2 font-bold">צליל המטרה</p>
        <div className="flex flex-wrap justify-center gap-2">{SOUNDS.map(s => <button key={s.id} type="button" aria-pressed={soundId === s.id} onClick={() => pickSound(s.id)}
          className={`min-h-[44px] rounded-xl border-2 px-4 py-1.5 text-lg font-bold ${soundId === s.id ? 'border-slate-800 bg-white' : 'border-slate-200 bg-slate-100 text-slate-500'}`}><span aria-hidden="true">{s.emoji} </span>{s.label}</button>)}</div>
      </div>
      <div className="text-center"><p className="mb-2 font-bold">מיקום הצליל במילה</p><Choice label="מיקום הצליל" value={position} onChange={pickPosition} options={[...POSITIONS, ['all', 'הכול']]} /></div>

      {(uses.has('log') || uses.has('letter') || uses.has('data') || uses.has('notes')) &&
        <Area label="מילות המטרה — מילה בכל שורה" hint={data ? 'נלקחו אוטומטית מהמאגר; אפשר לשנות, למחוק ולהוסיף' : 'טוען מילים…'} rows={5}
          value={wordsText ?? autoWords} onChange={setWordsText} onReset={wordsText !== null ? () => setWordsText(null) : null} />}
      {uses.has('letter') && <>
        <Area label="משפטים לתרגול — משפט בכל שורה" rows={3} value={sentText ?? autoSent} onChange={setSentText} onReset={sentText !== null ? () => setSentText(null) : null} />
        <Area label="פתיחת המכתב" rows={4} value={introText ?? autoIntro} onChange={setIntroText} onReset={introText !== null ? () => setIntroText(null) : null} hint="מתעדכנת לפי השם, הצליל, המטרה והניסוח — עד שעורכים אותה" />
        <Area label="איך מתרגלים ב־5 דקות — שלב בכל שורה" rows={5} value={stepsText ?? autoSteps} onChange={setStepsText} onReset={stepsText !== null ? () => setStepsText(null) : null} />
        <Area label="טיפים לעידוד — טיפ בכל שורה" rows={4} value={tipsText ?? autoTips} onChange={setTipsText} onReset={tipsText !== null ? () => setTipsText(null) : null} />
      </>}
      {type === 'cert' && <Input label="משפט אישי בתעודה (לא חובה)" value={personal} onChange={setPersonal} maxLength={110} placeholder="למשל: אמרת „רכבת” כמו גדולים!" />}
      {type === 'chart' && <Input label="מה מחכה בסוף? (לא חובה)" value={reward} onChange={setReward} maxLength={40} placeholder="למשל: משחק קופסה עם אבא" />}
    </section>

    <SheetsPreview pages={pages} title={printTitle} />

    {uses.has('data') && <section aria-labelledby="ps-calc" className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-center">
      <h2 id="ps-calc" className="mb-2 text-xl font-bold">🧮 מחשבון אחוזים מהיר</h2>
      <p className="mb-2 text-sm text-[var(--muted-foreground)]">בדף המודפס משבצות האחוז ריקות; כאן אפשר לחשב אחרי המפגש.</p>
      <div className="flex flex-wrap items-end justify-center gap-2">
        <label className="font-bold">נכונים (+)<input inputMode="numeric" value={calc.c} onChange={e => setCalc(v => ({ ...v, c: e.target.value.replace(/\D/g, '').slice(0, 3) }))} className="mt-1 block w-20 rounded-lg border-2 border-[var(--border)] px-2 py-1 text-center" /></label>
        <span className="pb-2 font-bold">מתוך</span>
        <label className="font-bold">ניסיונות<input inputMode="numeric" value={calc.t} onChange={e => setCalc(v => ({ ...v, t: e.target.value.replace(/\D/g, '').slice(0, 3) }))} className="mt-1 block w-20 rounded-lg border-2 border-[var(--border)] px-2 py-1 text-center" /></label>
        <output className="min-w-[5rem] pb-1 text-3xl font-black" aria-live="polite">{pct === '' ? '—' : `${pct}%`}</output>
      </div>
    </section>}

    <div className="mx-auto mt-12 max-w-3xl space-y-5">
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold">מה יש בכל דף</h2>
        <ul className="space-y-1.5 leading-relaxed">
          <li className="mr-5 list-disc"><b>יומן תרגול בבית:</b> שבעה ימים, עיגול למדבקה כש"תרגלנו 5 דקות", מה תרגלנו, שלושה פרצופים להקיף ("איך היה?") וחתימת הורה. בראש הדף — המטרה והמילים של השבוע.</li>
          <li className="mr-5 list-disc"><b>מכתב להורים:</b> מה עבדנו עליו, המילים והמשפטים של השבוע עם תמונות, חמישה שלבים לתרגול של 5 דקות וטיפים לעידוד. כל הטקסט ניתן לעריכה.</li>
          <li className="mr-5 list-disc"><b>טבלת נתונים:</b> 12 שורות מטרה × 10 ניסיונות (+ / − / ~), רמת סיוע (עצמאי, רמז, חיקוי), סה״כ ואחוז — עם תאריך, רמה ומטרה.</li>
          <li className="mr-5 list-disc"><b>סיכום פגישה:</b> מטרות, פעילויות וחומרים, תגובה והתקדמות, משימה לבית ותכנון — בלי שדות אבחנה.</li>
          <li className="mr-5 list-disc"><b>תעודות:</b> אלוף/ת הצליל, "תרגלתי כל השבוע!" ותעודת סיום טיפול — עם משפט אישי וחתימה.</li>
          <li className="mr-5 list-disc"><b>לוח מדבקות:</b> 21 עיגולים בשביל מתפתל, בארבעה נושאים (חלל, גינה, ים, רכבת), עם מקום לכתוב מה מחכה בסוף.</li>
        </ul>
      </section>
      <section className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-2xl font-bold">טיפים לשימוש — לקלינאיות</h2>
        <ul className="space-y-1.5 leading-relaxed">
          <li className="mr-5 list-disc">בסוף הפגישה מדפיסים "ערכה": מכתב ויומן להורים, טבלת נתונים וסיכום לתיק — באותן מילים.</li>
          <li className="mr-5 list-disc">מעט מילים עדיף על הרבה: 5–10 מילות מטרה לשבוע, ברמה שהילד כבר מצליח בה עם מעט עזרה.</li>
          <li className="mr-5 list-disc">היומן סופר מאמץ ולא הצלחה. ההורים לא "בודקים" הגייה — הם מתרגלים, משבחים ומביאים את הדף.</li>
          <li className="mr-5 list-disc">ברמת הסיוע כדאי לסמן את הרמה הנמוכה ביותר שבה הילד הצליח — כך רואים התקדמות לאורך זמן גם כשהאחוז דומה.</li>
          <li className="mr-5 list-disc">תעודה בסוף שלב (ולא רק בסוף הטיפול) היא דרך טובה לשמור על מוטיבציה — במיוחד עם משפט אישי שמזכיר מה בדיוק הצליח.</li>
        </ul>
      </section>
      <p className="text-center">מחפשים משחקים לתרגול? <Link to="/speech/card-maker" className="font-bold underline">מחולל כרטיסיות, בינגו ולוטו</Link> · {SOUNDS.slice(0, 4).map((s, i) => <span key={s.id}><Link to={s.path} className="font-bold underline">תרגול {s.label}</Link>{i < 3 ? ' · ' : ''}</span>)}</p>
      <SeoBody paragraphs={[
        'קלינאיות תקשורת משקיעות זמן רב בהכנת דפי שיעורי בית, טפסי מעקב ומכתבים להורים. כאן כל הדפים נבנים מאותן בחירות: צליל, מיקום ומטרה — והמילים נכנסות לבד מתוך מאגר המילים של האתר, שמסודר לפי ההגייה ולא רק לפי האות.',
        'הדפים נועדו לתמוך בעבודה שכבר נעשית בטיפול: הם לא מאבחנים, לא נותנים ציון להגייה ולא מחליפים את שיקול הדעת של הקלינאית. הם פשוט חוסכים זמן ומחברים את ההורים לתרגול קצר, נעים וקבוע בבית.',
      ]} faq={faq} related={[
        { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
        { label: 'מחולל כרטיסיות היגוי', href: '/speech/card-maker' },
        { label: 'זוגות מינימליים', href: '/speech/minimal-pairs' },
        { label: 'באיזה גיל רוכשים כל צליל?', href: '/speech/parents/sound-acquisition' },
        { label: 'קבצים לרכזות, ניהול כיתה וגן', href: '/printables/teacher-templates' },
      ]} />
    </div>
  </div>
}

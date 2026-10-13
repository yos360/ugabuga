import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'

// "דף צביעה עם השם" (/printables/name-coloring): the child's name in big hollow letters to colour,
// with a decorated frame to match (balloons, stars, hearts, flowers, space).
const PATH = '/printables/name-coloring'
const L = { fill: '#fff', stroke: '#111', strokeWidth: 1.2, strokeLinejoin: 'round', strokeLinecap: 'round' }

const star = (cx, cy, r) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r
  return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`
}).join(' ') + ' Z'
const heart = (cx, cy, s) => `M${cx} ${cy + s * 0.8} C ${cx - s * 1.3} ${cy - s * 0.1} ${cx - s * 0.7} ${cy - s} ${cx} ${cy - s * 0.35} C ${cx + s * 0.7} ${cy - s} ${cx + s * 1.3} ${cy - s * 0.1} ${cx} ${cy + s * 0.8} Z`

const Balloon = ({ x, y, r = 9 }) => <g>
  <ellipse cx={x} cy={y} rx={r} ry={r * 1.2} {...L} />
  <path d={`M${x - 1.5} ${y + r * 1.2} L${x} ${y + r * 1.2 + 2} L${x + 1.5} ${y + r * 1.2} Z`} {...L} strokeWidth={0.8} />
  <path d={`M${x} ${y + r * 1.2 + 2} C ${x - 4} ${y + r * 2} ${x + 4} ${y + r * 2.6} ${x} ${y + r * 3.4}`} fill="none" stroke="#111" strokeWidth={0.7} />
  <path d={`M${x - r * 0.5} ${y - r * 0.5} Q ${x - r * 0.35} ${y - r * 0.85} ${x} ${y - r * 0.9}`} fill="none" stroke="#111" strokeWidth={0.6} />
</g>
const Flower = ({ x, y, r = 7 }) => <g>
  {Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return <ellipse key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} rx={r * 0.65} ry={r * 0.45} transform={`rotate(${i * 60} ${x + Math.cos(a) * r} ${y + Math.sin(a) * r})`} {...L} /> })}
  <circle cx={x} cy={y} r={r * 0.55} {...L} />
</g>
const Planet = ({ x, y, r = 9 }) => <g>
  <circle cx={x} cy={y} r={r} {...L} />
  <ellipse cx={x} cy={y} rx={r * 1.7} ry={r * 0.45} fill="none" stroke="#111" strokeWidth={1.1} transform={`rotate(-18 ${x} ${y})`} />
  <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.2} {...L} strokeWidth={0.7} />
</g>
const Rocket = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s}) rotate(30)`}>
  <path d="M0 -16 C 7 -8 7 6 5 12 H -5 C -7 6 -7 -8 0 -16 Z" {...L} />
  <circle cx="0" cy="-3" r="3" {...L} />
  <path d="M-5 6 L-10 14 L-5 12 Z M5 6 L10 14 L5 12 Z" {...L} />
  <path d="M-3 12 L0 19 L3 12" {...L} />
</g>

// Fixed decoration spots around the name (top band and bottom band), per theme.
const SPOTS = [[24, 34], [62, 26], [138, 26], [176, 34], [22, 190], [58, 206], [100, 212], [142, 206], [178, 190], [100, 30]]
const THEMES = {
  balloons: { label: '🎈 בלונים', draw: ([x, y], i) => <Balloon key={i} x={x} y={y - 6} r={i % 2 ? 8 : 10} /> },
  stars: { label: '⭐ כוכבים', draw: ([x, y], i) => <path key={i} d={star(x, y, i % 2 ? 7 : 10)} {...L} /> },
  hearts: { label: '❤️ לבבות', draw: ([x, y], i) => <path key={i} d={heart(x, y, i % 2 ? 7 : 9)} {...L} /> },
  flowers: { label: '🌸 פרחים', draw: ([x, y], i) => <Flower key={i} x={x} y={y} r={i % 2 ? 5.5 : 7} /> },
  space: { label: '🚀 חלל', draw: ([x, y], i) => i % 3 === 0 ? <Planet key={i} x={x} y={y} r={8} /> : i % 3 === 1 ? <Rocket key={i} x={x} y={y} s={0.8} /> : <path key={i} d={star(x, y, 6)} {...L} /> },
}

export const cleanName = s => String(s || '').replace(/[^\p{L}\s'׳״"-]/gu, '').replace(/\s+/g, ' ').trimStart().slice(0, 14)

function NameSheet({ name, theme }) {
  const words = (name.trim() || 'השם שלי').split(' ').filter(Boolean).slice(0, 2)
  const longest = Math.max(...words.map(w => [...w].length))
  const latin = /[A-Za-z]/.test(name) // Latin letters are wider than Hebrew ones
  const size = Math.min(66, 172 / Math.max(longest * (latin ? 0.8 : 0.66), 1)) * (words.length > 1 ? 0.85 : 1)
  const y0 = words.length > 1 ? 112 : 132
  const th = THEMES[theme]
  return <Sheet label={`דף צביעה עם השם ${name}`}>
    <rect x="6" y="6" width="188" height="258" rx="10" fill="none" stroke="#111" strokeWidth={1.4} />
    <rect x="10" y="10" width="180" height="250" rx="8" fill="none" stroke="#111" strokeWidth={0.5} strokeDasharray="2 2" />
    {SPOTS.map((p, i) => th.draw(p, i))}
    {words.map((w, i) => <text key={i} x="100" y={y0 + i * size * 1.05} textAnchor="middle" direction="rtl"
      fontFamily="Heebo, Arial, sans-serif" fontWeight="900" fontSize={size} fill="#fff" stroke="#111" strokeWidth={2.6} strokeLinejoin="round" paintOrder="stroke">{w}</text>)}
    <T x={100} y={250} size={4.2} fill="#555">הדף של {name.trim() || '__________'} · לצבוע בכל הצבעים!</T>
  </Sheet>
}

export default function NameColoring() {
  const [name, setName] = useState('נועה')
  const [theme, setTheme] = useState('balloons')
  const [copies, setCopies] = useState('1')
  const pages = Array.from({ length: Number(copies) }, (_, i) => ({ key: theme + i, svg: <NameSheet name={name} theme={theme} /> }))
  return <PrintableShell copies={false} path={PATH} emoji="🖍️" h1="דף צביעה עם השם של הילד"
    seoTitle="דף צביעה עם שם — מכינים דף צביעה עם השם של הילד, להדפסה בחינם"
    description="דף צביעה עם השם של הילד: מקלידים שם, בוחרים קישוט (בלונים, כוכבים, לבבות, פרחים או חלל) ומדפיסים — אותיות חלולות וגדולות לצביעה. חינם, בלי הרשמה."
    sub="מקלידים שם, בוחרים קישוט ומדפיסים — אותיות גדולות וחלולות לצביעה"
    crumbs={[{ label: 'דפי צביעה', href: '/printables/coloring' }]}
    controls={<>
      <Field label="השם (עד 14 אותיות)" value={name} onChange={v => setName(cleanName(v))} placeholder="למשל: נועה" maxLength={14} />
      <Choice label="קישוט" value={theme} onChange={setTheme} options={Object.entries(THEMES).map(([k, v]) => [k, v.label])} />
      <Choice label="כמה דפים" value={copies} onChange={setCopies} options={[['1', 'דף אחד'], ['2', '2 דפים'], ['4', '4 דפים']]} />
    </>}
    pages={pages}
    extra={<div className="space-y-2 text-sm">
      <Link to="/printables/coloring" className="block wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold hover:bg-[var(--postit)]">🖍️ כל דפי הצביעה</Link>
      <Link to="/printables/name-tags" className="block wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-bold hover:bg-[var(--postit)]">🏷️ תגי שם להדפסה</Link>
    </div>}
    paragraphs={[
      'דף צביעה עם השם של הילד הוא אחד הדפים שילדים הכי אוהבים לצבוע — כי זה השם שלהם. מקלידים את השם, בוחרים קישוט ומדפיסים: האותיות גדולות וחלולות, כך שגם ילדי גן יכולים לצבוע אותן בקלות.',
      'רעיונות: דף ברכה ליום הולדת עם שם החוגג, שלט לדלת החדר, דף ראשון לגן או לכיתה א׳, או מתנה קטנה לאחים ולחברים. אפשר להדפיס כמה עותקים — לכל ילד בכיתה דף עם השם שלו.',
    ]}
    faq={[
      { q: 'איך מכינים דף צביעה עם שם?', a: 'מקלידים את השם בתיבה, בוחרים קישוט (בלונים, כוכבים, לבבות, פרחים או חלל) ולוחצים הדפסה. הדף מוכן מיד, בחינם.' },
      { q: 'אפשר שם באנגלית או שם עם שתי מילים?', a: 'כן. שם עם רווח (למשל "נועה רוז") מתחלק לשתי שורות, ואפשר להקליד גם באנגלית.' },
      { q: 'לאיזה גיל זה מתאים?', a: 'מגיל 3 ומעלה — האותיות גדולות וחלולות. לילדים שלומדים לכתוב זו גם הזדמנות להכיר את אותיות השם.' },
    ]}
    related={[{ label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'אותיות מקווקוות', href: '/printables/activity/word-tracing' }, { label: 'שלטי יום הולדת', href: '/printables/birthday-signs' }]}
  />
}

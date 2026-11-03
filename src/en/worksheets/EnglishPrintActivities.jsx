import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import DotWorksheet from '../../components/ui/DotWorksheet'
import { EnglishNotFound } from '../EnglishLayout'
import { WORKSHEETS_PAGES, ACTIVITY_TYPES, ACTIVITY_THEMES, WS } from './catalog'
import { Pills, Crumbs, PageHead, PrintNote } from './ui'

// English version of /printables/activity/{dot-to-dot,count-and-write,complete-pattern}[/<theme>].
// Dot-to-dot uses the same DotWorksheet drawings (lang="en"); the other two are built from emoji, like the Hebrew sheets.
const AGES = ['3–4', '5–6', '7–8']
const ITEMS = {
  animals: ['🦁', '🐘', '🦒', '🐶', '🐱', '🐸', '🦋', '🐢'],
  space: ['🚀', '🌙', '🪐', '⭐', '👽', '☄️', '🛰️', '🌍'],
  birthday: ['🎂', '🎈', '🎁', '🎉', '🍭', '🎵', '👑', '🍬'],
  vehicles: ['🚗', '🚌', '🚲', '🚁', '✈️', '🚂', '⛵', '🚜'],
  football: ['⚽', '🥅', '👟', '🏆', '🧤', '🏟️', '📣', '🥇'],
  unicorn: ['🦄', '🌈', '⭐', '🏰', '🌸', '✨', '🍭', '🦋'],
}
const shuffle = (a, seed = 1) => { const r = [...a]; let s = seed + 19; for (let i = r.length - 1; i > 0; i--) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; const j = s % (i + 1);[r[i], r[j]] = [r[j], r[i]] } return r }

function Sheet({ type, theme, age, version }) {
  const t = ACTIVITY_TYPES[type], th = ACTIVITY_THEMES.find(x => x[0] === theme)
  const items = shuffle(ITEMS[theme], version)
  const short = age === '3–4' ? 4 : age === '5–6' ? 6 : 8
  let body
  if (type === 'dot-to-dot') body = <><p>Join the dots in order. At the end, join the last number to 1 and finish the picture.</p><DotWorksheet theme={theme} age={age} version={version} lang="en" /></>
  else if (type === 'count-and-write') body = <><p>Count the pictures and write the number on the line.</p>
    {items.slice(0, 6).map((x, i) => <div key={i} style={{ fontSize: 34, lineHeight: 1.35, padding: '8px 0', borderBottom: '1px dashed #bbb', display: 'flex', alignItems: 'center', gap: 16 }}>
      <b style={{ fontSize: 18, width: 24 }}>{i + 1}.</b><span style={{ flex: 1 }}>{Array(i + 2 + (age === '5–6' ? 3 : age === '7–8' ? 7 : 0)).fill(x).join(' ')}</span><i style={{ fontSize: 28, fontStyle: 'normal' }}>_____</i></div>)}</>
  else {
    const rules = age === '3–4' ? [[0, 1]] : age === '5–6' ? [[0, 0, 1], [0, 1, 2]] : [[0, 1, 1, 2], [0, 0, 1, 2]]
    body = <><p>Read each row from left to right. Draw the next picture in the box.</p>
      {items.slice(0, short).map((x, i) => { const rule = [...rules[i % rules.length]]; return <div key={i} style={{ fontSize: 34, padding: '10px 0', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <b style={{ fontSize: 18, width: 24 }}>{i + 1}.</b>{[...rule, ...rule].map((v, k) => <span key={k}>{items[(i + v) % items.length]}</span>)}<span style={{ display: 'inline-block', width: 56, height: 56, border: '2px dashed #666', borderRadius: 10, textAlign: 'center', fontSize: 32, lineHeight: '56px' }}>?</span></div> })}</>
  }
  return <article className="buga-a4 en-print-sheet" dir="ltr" style={{ alignItems: 'stretch', justifyContent: 'flex-start', textAlign: 'left', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 16 }}>
    <small>Ugabuga · free printable activity pages</small>
    <h2 style={{ fontSize: 26, margin: '6px 0' }}>{t.emoji} {t.name}: {th[1]}</h2>
    <p style={{ margin: '0 0 8px' }}>Age {age} · Name: ____________________ · Date: ____________</p>
    <div>{body}</div>
    <footer style={{ marginTop: 'auto', fontSize: 11 }}>Printed from ugabuga.co.il/en · Version {version + 1}</footer>
  </article>
}

const FAQ = type => {
  const t = ACTIVITY_TYPES[type]
  return [
    { q: `What ages is the ${t.name.toLowerCase()} page for?`, a: 'Ages 3 to 8. Choose 3 to 4, 5 to 6 or 7 to 8: the number of items and the difficulty change with the level.' },
    { q: 'Can I get a different page?', a: 'Yes. "Another version" arranges the pictures differently each time, so you can print as many different pages as you like, free of charge.' },
    { q: 'How do I print on US Letter paper?', a: 'The sheets are A4. In your print settings choose "Fit to page" (or "Scale to fit") and the sheet will fit on Letter paper.' },
  ]
}

const TEXT = {
  'dot-to-dot': ['Children join the numbered dots in order, which practices counting, number order and pencil control. A fine-motor activity that ends with a picture to color.', 'Ages 3 to 4 have the fewest dots, ages 5 to 6 have twice as many, and ages 7 to 8 have three times as many, so the picture takes real concentration.'],
  'count-and-write': ['Children count a row of pictures and write the number. It is one of the first steps from counting aloud to writing numerals.', 'Ages 3 to 4 count 2 to 7 pictures, ages 5 to 6 count 5 to 10, and ages 7 to 8 count 9 to 14. Tip: point at each picture and say the number out loud as you count.'],
  'complete-the-pattern': ['Patterns are the start of algebra: children find the rule (red, red, blue, red, red, blue) and say what comes next.', 'Ages 3 to 4 work with two-picture patterns, ages 5 to 6 with three-step patterns, and ages 7 to 8 with four-step patterns. Ask your child to say the pattern out loud before drawing.'],
}

export default function EnglishPrintActivities({ type, params }) {
  const t = ACTIVITY_TYPES[type], themeParam = params?.theme
  if (!t || (themeParam && !ACTIVITY_THEMES.some(x => x[0] === themeParam))) return <EnglishNotFound />
  return <ActivityPage key={`${type}/${themeParam || ''}`} type={type} themeParam={themeParam} />
}

function ActivityPage({ type, themeParam }) {
  const t = ACTIVITY_TYPES[type]
  const path = themeParam ? `${WS}/${t.slug}/${themeParam}` : `${WS}/${t.slug}`
  const meta = WORKSHEETS_PAGES.find(p => p.path === path)
  const [theme, setTheme] = useState(themeParam || 'animals')
  const [age, setAge] = useState('5–6')
  const [version, setVersion] = useState(0)
  const [printing, setPrinting] = useState(false)
  const th = ACTIVITY_THEMES.find(x => x[0] === (themeParam || theme))
  const faq = FAQ(type)
  const sheetTitle = `${t.name}: ${th[1]}`
  return <div className="en-page ws-page">
    <SEO lang="en" path={meta.path} title={meta.title} description={meta.description} counterpartPath={meta.counterpart} structuredData={faqSchema(faq)} />
    <Crumbs trail={themeParam ? [{ label: t.name, href: `${WS}/${t.slug}` }] : []} current={themeParam ? th[1] : t.name} />
    <PageHead emoji={themeParam ? th[2] : t.emoji} title={themeParam ? `${t.name}: ${th[1]}` : `${t.name} worksheets`} sub={`Free printable page for ages 3 to 8: ${t.blurb}. Choose an age level, make a new version and print or save a PDF.`} />
    <div className="ws-panel">
      {!themeParam && <Pills label="Theme" items={ACTIVITY_THEMES.map(([id, label, emoji]) => [id, `${emoji} ${label}`])} value={theme} onChange={setTheme} />}
      <Pills label="Age" items={AGES.map(a => [a, a])} value={age} onChange={setAge} />
      <div className="ws-actions">
        <button type="button" className="ws-secondary" onClick={() => setVersion(v => v + 1)}>🔄 Another version</button>
        <button type="button" data-print-main className="ws-primary" onClick={() => setPrinting(true)}>🖨️ Print or save a PDF</button>
      </div>
      <PrintNote />
    </div>
    <div className="ws-paper-preview" style={{ maxWidth: 520 }}><div style={{ zoom: 0.55 }}><div style={{ width: '190mm' }}><Sheet type={type} theme={themeParam || theme} age={age} version={version} /></div></div></div>
    {!themeParam && <>
      <h2>Choose a theme</h2>
      <div className="ws-pills">{ACTIVITY_THEMES.map(([id, label, emoji]) => <Link key={id} className="ws-link-pill" to={`${WS}/${t.slug}/${id}`}>{emoji} {label}</Link>)}</div>
    </>}
    <section className="ws-about"><h2>About this activity</h2>{TEXT[type].map(x => <p key={x}>{x}</p>)}
      {themeParam && <p>This page uses a {th[1].toLowerCase()} theme. Pictures change in every version, so children meet the same skill with fresh things to look at.</p>}
    </section>
    <SeoBody lang="en" faq={faq} related={[...Object.values(ACTIVITY_TYPES).filter(x => x.slug !== type).map(x => ({ label: `${x.name} worksheets`, href: `${WS}/${x.slug}${themeParam ? '/' + themeParam : ''}` })), { label: 'mazes', href: `${WS}/mazes` }, { label: 'all printable worksheets', href: WS }]} />
    {printing && <PrintPreview lang="en" title={sheetTitle} onClose={() => setPrinting(false)} onRefresh={() => setVersion(v => v + 1)}><Sheet type={type} theme={themeParam || theme} age={age} version={version} /></PrintPreview>}
  </div>
}

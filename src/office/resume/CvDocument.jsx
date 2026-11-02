// The one renderer every CV template shares. mode: 'edit' (click any text to change it, drag extras),
// 'print' (clean, empty fields dropped) or 'thumb' (template picker).
import { memo, useRef } from 'react'
import { buildLayout } from './templates'
import { label, lines, LIST_SECTIONS, PX_PER_MM, PAGE_W_MM } from './resumeLogic'

const PH = {
  name: 'השם המלא', title: 'במה אתם עובדים או רוצים לעבוד', phone: '050-0000000', email: 'name@gmail.com', city: 'עיר מגורים', link: 'קישור (לא חובה)',
  summary: 'שניים-שלושה משפטים: מי אתם, במה אתם טובים ומה אתם מחפשים.',
  experience: ['תפקיד', 'מקום העבודה, עיר', '2022 – היום', 'מה עשיתם? עדיף הישג עם מספר'],
  education: ['תואר / מגמה / קורס', 'מוסד הלימודים', '2019 – 2022', 'ממוצע, פרויקט גמר או הצטיינות'],
  military: ['תפקיד', 'יחידה / חיל / שירות לאומי', '2017 – 2020', 'אחריות, הישג או הצטיינות'],
  skills: 'כישור', lang: 'שפה', level: 'רמה', volunteer: 'איפה, מה עשיתם ומתי', hobbies: 'שניים-שלושה תחביבים',
}

const ICONS = {
  phone: 'M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1z',
  email: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm1 2v.4l8 5 8-5V7l-8 5z',
  city: 'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7zm0 4.5A2.5 2.5 0 1012 11.5 2.5 2.5 0 0012 6.5z',
  link: 'M10.6 13.4a1 1 0 010-1.4l3.4-3.4a1 1 0 111.4 1.4L12 13.4a1 1 0 01-1.4 0zM7 17a3 3 0 010-4.2l2-2 1.4 1.4-2 2a1 1 0 001.4 1.4l2-2 1.4 1.4-2 2A3 3 0 017 17zm10-10a3 3 0 010 4.2l-2 2-1.4-1.4 2-2a1 1 0 00-1.4-1.4l-2 2L10.8 9l2-2A3 3 0 0117 7z',
}
const Icon = ({ k }) => <svg className="rs-ic" viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[k]} fill="currentColor" /></svg>

// One editable piece of text. In edit mode it is contentEditable and writes back on blur.
function Ed({ ctx, p, v, ph, as: Tag = 'span', className = '', bidi = false, multi = false }) {
  const dir = bidi ? 'auto' : undefined
  if (!ctx.edit) return v ? <Tag className={className} dir={dir}>{v}</Tag> : null
  return (
    <Tag
      key={v}
      className={`${className} rs-ed`}
      dir={dir}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={ph}
      role="textbox"
      aria-label={ph}
      onBlur={e => { const t = e.currentTarget.innerText.replace(/ /g, ' ').trim(); if (t !== v) ctx.onEdit(p, t) }}
      onKeyDown={e => {
        if (e.key === 'Enter' && !multi) { e.preventDefault(); e.currentTarget.blur() }
        if (e.key === 'Escape') { e.currentTarget.innerText = v; e.currentTarget.blur() }
      }}
    >{v}</Tag>
  )
}

function Contact({ ctx }) {
  const { personal: p } = ctx.cv
  const keys = ['phone', 'email', 'city', 'link'].filter(k => ctx.edit ? k !== 'link' || p.link : p[k])
  if (!keys.length) return null
  return (
    <ul className="rs-contact">
      {keys.map(k => <li key={k}><Icon k={k} /><Ed ctx={ctx} p={['personal', k]} v={p[k]} ph={PH[k]} bidi={k !== 'city'} /></li>)}
    </ul>
  )
}

function Photo({ ctx, shape }) {
  const src = ctx.cv.personal.photo
  if (src) return <img className={`rs-photo P-${shape}`} src={src} alt="" />
  if (ctx.mode === 'thumb') return <div className={`rs-photo P-${shape} rs-photo-ph`} />
  if (ctx.edit) return <button type="button" className={`rs-photo P-${shape} rs-photo-ph`} onClick={ctx.onPhoto}>+ תמונה</button>
  return null
}

function Header({ ctx, lay, tpl }) {
  const { personal: p } = ctx.cv
  const initials = p.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('') || 'א'
  const photoShape = lay.photoSlot ? tpl.photo : ''
  return (
    <header className="rs-head">
      {tpl.header === 'initials' && <div className="rs-init" aria-hidden="true">{initials}</div>}
      {photoShape && (lay.photo || ctx.edit || ctx.mode === 'thumb') ? <Photo ctx={ctx} shape={photoShape} /> : null}
      <div className="rs-id">
        <Ed ctx={ctx} as="div" className="rs-name" p={['personal', 'name']} v={p.name} ph={PH.name} />
        <Ed ctx={ctx} as="div" className="rs-title" p={['personal', 'title']} v={p.title} ph={PH.title} />
      </div>
      {lay.contactInHead && <Contact ctx={ctx} />}
    </header>
  )
}

function Items({ ctx, s }) {
  const ph = PH[s]
  return ctx.cv[s].map(it => {
    if (!ctx.edit && !it.title && !it.place && !it.years && !it.text) return null
    const ls = lines(it.text)
    return (
      <div className="rs-item" key={it.id}>
        <div className="rs-item-top">
          <Ed ctx={ctx} as="b" className="rs-item-title" p={[s, it.id, 'title']} v={it.title} ph={ph[0]} />
          <Ed ctx={ctx} as="bdi" className="rs-years" p={[s, it.id, 'years']} v={it.years} ph={ph[2]} bidi />
        </div>
        <Ed ctx={ctx} as="div" className="rs-place" p={[s, it.id, 'place']} v={it.place} ph={ph[1]} />
        {(ls.length > 0 || ctx.edit) && (
          <ul className={'rs-bullets' + (ls.length ? '' : ' rs-noline')}>
            {ls.map((l, i) => <li key={i}><Ed ctx={ctx} p={[s, it.id, 'text', i]} v={l} ph={ph[3]} multi /></li>)}
            {ctx.edit && <li className="rs-addline"><Ed ctx={ctx} p={[s, it.id, 'text', ls.length]} v="" ph={ls.length ? '+ שורה' : ph[3]} multi /></li>}
          </ul>
        )}
      </div>
    )
  })
}

function Skills({ ctx, style }) {
  const ls = lines(ctx.cv.skills)
  const all = ctx.edit ? [...ls, ''] : ls
  return (
    <ul className={`rs-skills Q-${style}`}>
      {all.map((l, i) => <li key={i} className={l ? '' : 'rs-addline'}><Ed ctx={ctx} p={['skills', i]} v={l} ph={ls.length ? '+ כישור' : PH.skills} multi /></li>)}
    </ul>
  )
}

function Section({ ctx, s, lay }) {
  const { cv } = ctx
  let body
  if (s === 'contact') body = <Contact ctx={ctx} />
  else if (LIST_SECTIONS.includes(s)) body = <Items ctx={ctx} s={s} />
  else if (s === 'skills') body = <Skills ctx={ctx} style={lay.skills} />
  else if (s === 'languages') body = (
    <ul className="rs-langs">
      {cv.languages.map(l => (ctx.edit || l.name || l.level) && (
        <li key={l.id}><Ed ctx={ctx} as="b" p={['languages', l.id, 'name']} v={l.name} ph={PH.lang} /> <Ed ctx={ctx} className="rs-level" p={['languages', l.id, 'level']} v={l.level} ph={PH.level} /></li>
      ))}
    </ul>
  )
  else if (s === 'volunteer' || s === 'hobbies') body = (
    <ul className="rs-bullets">
      {(ctx.edit ? [...lines(cv[s]), ''] : lines(cv[s])).map((l, i, a) => <li key={i} className={l ? '' : 'rs-addline'}><Ed ctx={ctx} p={[s, i]} v={l} ph={a.length > 1 ? '+ שורה' : PH[s]} multi /></li>)}
    </ul>
  )
  else body = <Ed ctx={ctx} as="p" className="rs-summary" p={['summary']} v={cv.summary} ph={PH.summary} multi />
  return (
    <section className={`rs-sec rs-sec-${s}`}>
      {/* real headings only in the editable preview; thumbnails and the print copy stay out of the page outline */}
      <Ed ctx={ctx} as={ctx.edit ? 'h3' : 'div'} className="rs-h" p={['labels', s]} v={label(cv, s)} ph={label(cv, s)} />
      {body}
    </section>
  )
}

// Free text boxes and lines placed anywhere on the page (millimetres from the top-left corner).
function Extra({ x, ctx }) {
  const sel = ctx.sel === x.id
  const drag = useRef(null)
  const style = { left: `${x.x}mm`, top: `${x.y}mm`, width: `${x.w}mm`, fontSize: x.kind === 'text' ? `${x.size}pt` : undefined, fontWeight: x.bold ? 700 : undefined }
  if (!ctx.edit) return x.kind === 'text' && !x.text ? null : <div className={`rs-x rs-x-${x.kind}`} style={style}>{x.kind === 'text' ? x.text : null}</div>
  const down = e => {
    if (e.button !== 0) return
    e.stopPropagation()
    ctx.onSelect(x.id)
    if (x.kind === 'text' && !e.target.closest('.rs-grip')) return
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { sx: e.clientX, sy: e.clientY, x: x.x, y: x.y }
  }
  const move = e => {
    const d = drag.current
    if (!d) return
    const k = ctx.scale * PX_PER_MM
    ctx.onExtra(x.id, { x: Math.max(0, Math.min(PAGE_W_MM - 5, d.x + (e.clientX - d.sx) / k)), y: Math.max(0, d.y + (e.clientY - d.sy) / k) }, 'drag:' + x.id)
  }
  const up = () => { drag.current = null }
  const tool = (lbl, title, fn) => <button type="button" title={title} aria-label={title} onPointerDown={e => e.stopPropagation()} onClick={fn}>{lbl}</button>
  return (
    <div className={`rs-x rs-x-${x.kind}${sel ? ' sel' : ''}`} style={style} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      tabIndex={x.kind === 'text' ? undefined : 0} role={x.kind === 'text' ? undefined : 'button'} aria-label={x.kind === 'text' ? undefined : 'קו — גררו כדי להזיז'}
      onKeyDown={e => { if (x.kind !== 'text' && (e.key === 'Delete' || e.key === 'Backspace')) ctx.onRemove(x.id) }}>
      {x.kind === 'text'
        ? <div key={x.text} className="rs-ed rs-x-txt" contentEditable="plaintext-only" suppressContentEditableWarning role="textbox" aria-label="תיבת טקסט" data-ph="כתבו כאן…"
            onBlur={e => { const t = e.currentTarget.innerText.replace(/ /g, ' ').trim(); if (t !== x.text) ctx.onExtra(x.id, { text: t }, 'xt:' + x.id) }}>{x.text}</div>
        : <i aria-hidden="true" />}
      {sel && (
        <div className="rs-xtools no-print">
          {x.kind === 'text' && <span className="rs-grip" title="גררו כדי להזיז">✥ הזזה</span>}
          {tool('↔+', 'רחב יותר', () => ctx.onExtra(x.id, { w: Math.min(PAGE_W_MM, x.w + 10) }))}
          {tool('↔−', 'צר יותר', () => ctx.onExtra(x.id, { w: Math.max(8, x.w - 10) }))}
          {x.kind === 'text' && tool('A+', 'אותיות גדולות יותר', () => ctx.onExtra(x.id, { size: Math.min(28, x.size + 1) }))}
          {x.kind === 'text' && tool('A−', 'אותיות קטנות יותר', () => ctx.onExtra(x.id, { size: Math.max(7, x.size - 1) }))}
          {x.kind === 'text' && tool('B', 'מודגש', () => ctx.onExtra(x.id, { bold: !x.bold }))}
          {tool('🗑️', 'מחיקה', () => ctx.onRemove(x.id))}
        </div>
      )}
    </div>
  )
}

function CvDocument({ cv, design, tpl, extras = [], mode = 'print', onEdit, onPhoto, sel, onSelect, onExtra, onRemove, scale = 1, cvRef }) {
  const edit = mode === 'edit'
  const lay = buildLayout(cv, tpl, { edit, compact: design.compact, accent: design.accent })
  const ctx = { cv, edit, mode, onEdit, onPhoto, sel, onSelect, onExtra, onRemove, scale }
  const head = <Header ctx={ctx} lay={lay} tpl={tpl} />
  const secs = list => list.map(s => <Section key={s} ctx={ctx} s={s} lay={lay} />)
  return (
    <div ref={cvRef} className={lay.cls.join(' ')} style={{ '--acc': lay.accent, width: `${PAGE_W_MM}mm` }} dir="rtl" lang="he">
      {!lay.headerInSide && !lay.headerInMain && head}
      <div className="rs-body">
        <div className="rs-main">{lay.headerInMain && head}{secs(lay.main)}</div>
        {lay.twoCol && <aside className="rs-side">{lay.headerInSide && head}{secs(lay.side)}</aside>}
      </div>
      {extras.map(x => <Extra key={x.id} x={x} ctx={ctx} />)}
    </div>
  )
}

export default memo(CvDocument)

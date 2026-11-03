import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FINGERS, FINGER_OF } from '../../typing/typingData'
import { KB_LAYOUTS, LATIN_ON_KEY, NIQQUD, VAV_VOWELS, SYMBOLS, charFor, remapPhysical, removeNiqqud, insertAt, backspaceAt, countText } from '../../office/keys/virtualKeys'
import '../../office/keys/virtualKeys.css'
import ToolFrame from './ToolFrame'

const PATH = '/en/tools/hebrew-keyboard'
const STORE = 'ugabuga-en-hebrew-keyboard'
const load = () => { try { return JSON.parse(localStorage.getItem(STORE) || '{}') } catch { return {} } }
const save = v => { try { localStorage.setItem(STORE, JSON.stringify(v)) } catch { /* storage blocked */ } }

// English names for the niqqud buttons, in the same order as NIQQUD / VAV_VOWELS.
const NIQQUD_EN = ['kamatz', 'patach', 'tzere', 'segol', 'shva', 'hiriq', 'holam', 'kubutz', 'dagesh', 'chataf patach', 'chataf segol', 'chataf kamatz', 'shin dot (right)', 'sin dot (left)']
const VAV_EN = ['shuruk', 'full holam']
const FINGER_EN = { LP: 'left pinky', LR: 'left ring finger', LM: 'left middle finger', LI: 'left index finger', RI: 'right index finger', RM: 'right middle finger', RR: 'right ring finger', RP: 'right pinky', TH: 'thumb' }

const MOD = {
  Backspace: ['⌫', 2], Tab: ['Tab', 1.5], CapsLock: ['Caps', 1.75], Enter: ['Enter ↵', 2.25],
  ShiftLeft: ['⇧ Shift', 2.25], ShiftRight: ['⇧ Shift', 2.75], Lang: ['', 2.5], At: ['@', 1.5], Space: ['Space', 8.5], Clear: ['', 2.5],
}
const ROWS = lang => {
  const r = KB_LAYOUTS[lang].rows
  return [[...r[0], 'Backspace'], ['Tab', ...r[1]], ['CapsLock', ...r[2], 'Enter'], ['ShiftLeft', ...r[3], 'ShiftRight'], ['Lang', 'At', 'Space', 'Clear']]
}
const HE_ON_KEY = Object.fromEntries(Object.values(KB_LAYOUTS.he.byCode).map(k => [k.code, k.base]))
const COURSE = [
  { to: '/en/typing', emoji: '⌨️', title: 'Touch typing course', desc: 'Learn to type without looking, one row at a time' },
]
const FAQ = [
  { q: 'I do not have Hebrew on my computer. Can I still type Hebrew here?', a: 'Yes. Choose "Hebrew" and type on your normal keyboard: each key writes the Hebrew letter printed on it on an Israeli keyboard. For example, A types ש (shin) and T types א (alef). Nothing needs to be installed, so it works on a library, school or work computer too.' },
  { q: 'How do I add niqqud (vowel marks)?', a: 'Type a letter, then click the vowel mark you want under the keyboard. The mark attaches to the letter before the cursor. You can add several marks to one letter, for example a dagesh and a kamatz. The "Remove niqqud" button strips all vowel marks from the text.' },
  { q: 'Which key types the final letters ך ם ן ף ץ?', a: 'They have their own keys on the Hebrew keyboard: ך is on L, ם on O, ן on I, ף on the semicolon key and ץ on the period key. The little Latin letters printed on each key show you where everything is.' },
  { q: 'What are the finger colors?', a: 'In touch typing every key belongs to one finger. With finger colors on, each key is tinted in the color of its finger, and after every key press the page tells you which finger should have pressed it. It is the same coloring as our touch typing course.' },
  { q: 'Is my text saved?', a: 'Your text is kept only in this browser so you do not lose it if you close the page. It is not sent anywhere. The "Clear" button deletes it.' },
  { q: 'How do I switch languages on my own computer keyboard?', a: 'On Windows press Alt+Shift or the Windows key + Space. On a Mac press Control+Space. On a phone, tap the globe icon or swipe across the space bar. You can also just use this page and skip installing a language.' },
]

export default function EnglishHebrewKeyboard() {
  const saved = useState(load)[0]
  const [text, setText] = useState(saved.text || '')
  const [lang, setLang] = useState(saved.lang === 'en' ? 'en' : 'he')
  const [fingers, setFingers] = useState(!!saved.fingers)
  const [size, setSize] = useState(saved.size || 24)
  const [shift, setShift] = useState(false), [caps, setCaps] = useState(false)
  const [last, setLast] = useState(null), [copied, setCopied] = useState(false)
  const [siteKb, setSiteKb] = useState(false)
  const [wpm, setWpm] = useState(0)
  const ta = useRef(null), stamps = useRef([]), flashT = useRef(0)
  const live = useRef({ text, caret: null })
  const put = v => { live.current = { text: v, caret: null }; setText(v) }

  useEffect(() => { save({ text, lang, fingers, size }) }, [text, lang, fingers, size])
  useEffect(() => { if (window.matchMedia?.('(pointer: coarse)').matches) setSiteKb(true) }, [])

  const edit = fn => {
    const el = ta.current, cur = live.current.text
    const fresh = el && el.value === cur && live.current.caret == null
    const start = fresh ? el.selectionStart : live.current.caret ?? cur.length
    const end = fresh ? el.selectionEnd : start
    const r = fn(cur, start, end)
    live.current = { text: r.text, caret: r.caret }
    setText(r.text)
    requestAnimationFrame(() => {
      if (!el || live.current.caret !== r.caret) return
      el.focus({ preventScroll: true }); el.setSelectionRange(r.caret, r.caret); live.current.caret = null
    })
  }
  const tick = n => {
    const now = Date.now(), s = stamps.current
    for (let i = 0; i < n; i++) s.push(now)
    while (s.length && now - s[0] > 60000) s.shift()
    const secs = Math.max(10, (now - s[0]) / 1000)
    setWpm(s.length >= 15 ? Math.round(s.length / 5 / (secs / 60)) : 0)
  }
  const flash = code => { setLast(code); clearTimeout(flashT.current); flashT.current = setTimeout(() => setLast(c => (c === code ? `${code}:off` : c)), 220) }
  const type = str => { edit((t, a, b) => insertAt(t, a, b, str)); tick(1) }

  const press = code => {
    flash(code)
    if (code === 'Backspace') return edit(backspaceAt)
    if (code === 'Enter') return type('\n')
    if (code === 'Space') return type(' ')
    if (code === 'At') return type('@')
    if (code === 'Tab') return type('\t')
    if (code === 'ShiftLeft' || code === 'ShiftRight') return setShift(s => !s)
    if (code === 'CapsLock') return setCaps(c => !c)
    if (code === 'Lang') return setLang(l => (l === 'he' ? 'en' : 'he'))
    if (code === 'Clear') return clear()
    const ch = charFor(lang, code, { shift, caps })
    if (ch) { type(ch); setShift(false) }
  }
  const onKeyDown = e => {
    if (e.code) flash(e.code)
    if (e.key === 'CapsLock') setCaps(e.getModifierState?.('CapsLock') ?? false)
    const ch = remapPhysical(lang, e)
    if (ch) { e.preventDefault(); type(ch) } else if (e.key?.length === 1 && !e.ctrlKey && !e.metaKey) tick(1)
  }
  function clear() {
    if (text && !window.confirm('Delete all of the text?')) return
    put(''); stamps.current = []; setWpm(0); ta.current?.focus()
  }
  async function copy() {
    let ok = false
    try { await navigator.clipboard.writeText(text); ok = true } catch {
      ta.current?.select(); try { ok = document.execCommand('copy') } catch { /* ignore */ }
    }
    setCopied(ok); setTimeout(() => setCopied(false), 1800)
  }
  const download = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }))
    a.download = 'my-text.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const { chars, words } = countText(text)
  const lastCode = last && !last.endsWith(':off') ? last : null
  const hintCode = last?.replace(':off', '')
  const hintFinger = hintCode && FINGER_OF[hintCode]
  const hintChar = hintCode && charFor(lang, hintCode)
  const hasNiqqud = removeNiqqud(text) !== text

  return <ToolFrame path={PATH} h1="Hebrew keyboard online, with niqqud"
    intro={<>Type Hebrew with your mouse or your normal keyboard, <b>even on a computer with no Hebrew installed</b>. It has vowel marks, symbols, one-click copy and finger colors for touch typing.</>}
    bodyTitle="How to use the Hebrew keyboard" faq={FAQ}
    paragraphs={[
      'Click the keys with your mouse or finger, or simply type on your computer keyboard. When "Hebrew" is selected and your computer is set to English, every key writes the Hebrew letter printed on it on an Israeli keyboard. That lets you write Hebrew on any computer without installing a language. The key you press lights up on screen, which helps you learn where each letter lives.',
      'The niqqud (vowel marks) sit under the keyboard: type a letter and click a mark, and it attaches to the letter before the cursor. There is also shuruk and full holam in one click, and symbols that a regular keyboard does not have, such as ₪, a real geresh and gershayim, and the Hebrew maqaf.',
      'With finger colors on, every key is tinted by the finger that should press it in touch typing, and after each press the page tells you which finger to use. Below the text you also see your typing speed in words per minute. Hebrew is written right to left, so the text box switches direction automatically.',
    ]}
    related={[{ href: '/en/typing', label: 'touch typing' }, { href: '/en/hebrew-alphabet', label: 'the Hebrew alphabet' }, { href: '/en/tools', label: 'all free tools' }]}>
    <section className="okb-card" aria-label="Keyboard">
      <div className="okb-bar">
        <div role="radiogroup" aria-label="Keyboard language" className="okb-seg">
          {[['he', 'Hebrew'], ['en', 'English']].map(([id, label]) => <button key={id} type="button" role="radio" aria-checked={lang === id} onClick={() => { setLang(id); ta.current?.focus() }}>{label}</button>)}
        </div>
        <button type="button" className="okb-btn" aria-pressed={fingers} onClick={() => setFingers(f => !f)}>🖐️ Finger colors</button>
        <span className="okb-size" role="group" aria-label="Text size">
          <button type="button" className="okb-btn" onClick={() => setSize(s => Math.max(16, s - 4))} aria-label="Smaller text">A-</button>
          <button type="button" className="okb-btn" onClick={() => setSize(s => Math.min(48, s + 4))} aria-label="Larger text">A+</button>
        </span>
        <button type="button" className="okb-btn okb-phone" onClick={() => { setSiteKb(s => !s); ta.current?.blur() }}>{siteKb ? '📱 Use my phone keyboard' : '⌨️ Use this page’s keyboard'}</button>
      </div>

      <label htmlFor="okb-text" className="sr-only">Your text</label>
      <textarea id="okb-text" ref={ta} className="okb-text" dir="auto" rows={5} value={text} style={{ fontSize: size }}
        onChange={e => put(e.target.value)} onKeyDown={onKeyDown} inputMode={siteKb ? 'none' : undefined}
        placeholder={lang === 'he' ? 'Type here… even if your computer is in English, Hebrew comes out' : 'Type here…'} spellCheck={lang === 'en'} autoCapitalize="off" autoCorrect="off" />
      <div className="okb-meta">
        <span>{words} words · {chars} characters</span>
        {wpm > 0 && <span>Speed: <b>{wpm}</b> words per minute{wpm < 35 && <> · <Link to="/en/typing">Want more? Try touch typing</Link></>}</span>}
        {fingers && hintFinger && hintChar && <span className="okb-hint"><i style={{ background: FINGERS[hintFinger].color }} />“{hintChar === ' ' ? 'space' : hintChar}” is typed with the <b>{FINGER_EN[hintFinger]}</b></span>}
      </div>

      <div className="okb-kb" dir="ltr" aria-label={lang === 'he' ? 'Hebrew keyboard' : 'English keyboard'}>
        {ROWS(lang).map((row, i) => <div key={i} className="okb-row">{row.map(code => {
          const mod = MOD[code]
          const finger = fingers && (FINGER_OF[code] || (code === 'ShiftLeft' ? 'LP' : code === 'ShiftRight' ? 'RP' : null))
          const on = (code.startsWith('Shift') && shift) || (code === 'CapsLock' && caps) || lastCode === code
          const label = code === 'Lang' ? (lang === 'he' ? '🌐 English' : '🌐 Hebrew') : code === 'Clear' ? '🧹 Clear' : mod ? mod[0] : charFor(lang, code, { shift, caps })
          const sub = !mod && (lang === 'he' ? /^[A-Z]$/.test(LATIN_ON_KEY[code]) && LATIN_ON_KEY[code] : /[א-ת]/.test(HE_ON_KEY[code]) && HE_ON_KEY[code])
          return <button key={code} type="button" className={'okb-key' + (mod ? ' is-mod' : '') + (on ? ' is-on' : '') + (code === 'KeyF' || code === 'KeyJ' ? ' is-bump' : '')}
            style={{ flexGrow: mod ? mod[1] : 1, background: finger ? `color-mix(in srgb, ${FINGERS[finger].color} ${on ? 100 : 55}%, white)` : undefined }}
            onMouseDown={e => e.preventDefault()} onClick={() => press(code)}
            aria-label={code === 'Space' ? 'Space' : code === 'Backspace' ? 'Backspace' : code.startsWith('Shift') ? 'Shift' : undefined}>
            <span>{label}</span>{sub && <small>{sub}</small>}
          </button>
        })}</div>)}
      </div>

      {lang === 'he' && <div className="okb-extra" aria-label="Niqqud">
        <span className="okb-extra-title">Niqqud:</span>
        {NIQQUD.map((n, i) => <button key={n.mark} type="button" className="okb-chip" title={NIQQUD_EN[i]} aria-label={NIQQUD_EN[i]} onMouseDown={e => e.preventDefault()} onClick={() => type(n.mark)}>
          <span className="okb-niq">ב{n.mark}</span><small>{NIQQUD_EN[i]}</small>
        </button>)}
        {VAV_VOWELS.map((v, i) => <button key={v.text} type="button" className="okb-chip" title={VAV_EN[i]} aria-label={VAV_EN[i]} onMouseDown={e => e.preventDefault()} onClick={() => type(v.text)}>
          <span className="okb-niq">{v.text}</span><small>{VAV_EN[i]}</small>
        </button>)}
      </div>}
      <div className="okb-extra" aria-label="Symbols">
        <span className="okb-extra-title">Symbols:</span>
        {SYMBOLS.map(s => <button key={s} type="button" className="okb-chip okb-sym" onMouseDown={e => e.preventDefault()} onClick={() => type(s)}>{s}</button>)}
      </div>

      <div className="okb-actions">
        <button type="button" className="okb-btn okb-primary" onClick={copy} disabled={!text}>{copied ? '✔ Copied!' : '📋 Copy'}</button>
        <a className={'okb-btn okb-wa' + (text ? '' : ' is-disabled')} href={text ? `https://wa.me/?text=${encodeURIComponent(text)}` : undefined} target="_blank" rel="noopener noreferrer">💬 Send on WhatsApp</a>
        <button type="button" className="okb-btn" onClick={download} disabled={!text}>💾 Save as a file</button>
        {hasNiqqud && <button type="button" className="okb-btn" onClick={() => put(removeNiqqud(text))}>Remove niqqud</button>}
      </div>
    </section>

    <section className="mt-10" aria-labelledby="okb-course">
      <h2 id="okb-course" className="text-2xl">Want to type without looking at the keyboard?</h2>
      <p className="mt-1 text-lg">The keyboard here uses the same colors as our touch typing course. Start from the home row, and within a few weeks of ten minutes a day you can type twice as fast without taking your eyes off the screen.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COURSE.map(c => <Link key={c.to} to={c.to} className="okb-course">
          <span aria-hidden="true" className="text-3xl">{c.emoji}</span><b>{c.title}</b><span>{c.desc}</span>
        </Link>)}
      </div>
    </section>
  </ToolFrame>
}

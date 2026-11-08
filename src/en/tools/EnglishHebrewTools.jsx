// English pages of the Hebrew-language tools: gematria, Hebrew birthday and bar/bat mitzvah date,
// the keyboard-layout fixer and the automatic niqqud tool. Logic is shared with the Hebrew pages;
// all text here is English, while Hebrew letters and words stay Hebrew (right to left) inside the tools.
import { useState } from 'react'
import { HDate, getSedra } from '@hebcal/core'
import ToolFrame from './ToolFrame'
import { Field, Panel, Result, Select, bigButtonClass, buttonClass, inputClass, copyText } from './ui'
import { gematriaOf } from '../../utils/calc'
import { birthHDate, birthdayIn, birthNotes, parseISO, MIN_YEAR, MAX_YEAR, MITZVAH_AGE } from '../../utils/hebrewBirthday'
import { fixText, mainScript } from '../../office/keys/keyboardLogic'

const HE_FONT = { fontFamily: '"Noto Sans Hebrew", "Arial Hebrew", Arial, sans-serif' }

// ── gematria ──
export function Gematria() {
  const [text, setText] = useState('שלום')
  const g = gematriaOf(text)
  return <ToolFrame path="/en/tools/gematria" h1="🔢 Gematria calculator" intro="Type a Hebrew name, word or phrase and get its gematria value, with the value of every letter." width="max-w-2xl"
    faq={[
      { q: 'What is gematria?', a: 'A system in which every Hebrew letter has a number: Aleph is 1, Bet 2, up to Yod 10, then Kaf 20 up to Tsadi 90, and Kuf 100 up to Tav 400. Add up the letters and you get the value of the word.' },
      { q: 'How much are the final letters worth?', a: 'In standard gematria (mispar hechrechi) the final forms ך ם ן ף ץ count like the regular letters: 20, 40, 50, 80 and 90.' },
      { q: 'Why is 18 a lucky number?', a: 'The Hebrew word chai (חי), "life", is Chet (8) plus Yod (10), which makes 18. That is why gifts are often given in multiples of 18.' },
      { q: 'I do not have a Hebrew keyboard. How can I type?', a: 'Use our free online Hebrew keyboard, copy the word and paste it here.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/hebrew-keyboard', label: 'online Hebrew keyboard' }, { href: '/en/hebrew-alphabet', label: 'the Hebrew alphabet' }, { href: '/en/tools/hebrew-birthday', label: 'Hebrew birthday calculator' }]}>
    <Panel label="Gematria" className="text-center">
      <label className="mx-auto block max-w-md font-bold">Hebrew word or name<input dir="rtl" lang="he" style={HE_FONT} value={text} onChange={e => setText(e.target.value.slice(0, 60))} className={`${inputClass} text-center text-2xl`} /></label>
      {text && !g.letters.length && <p role="status">Type Hebrew letters (א to ת) to get a value.</p>}
      <div aria-live="polite" className="mx-auto max-w-md rounded-3xl bg-[var(--postit)] p-5">
        <p className="text-6xl font-black">{g.total}</p>
        <p dir="rtl" className="mt-3 flex flex-wrap justify-center gap-2" style={HE_FONT}>{g.letters.map(([c, v], i) => <span key={i} className="rounded-lg bg-white px-2 py-1 text-lg text-[#182139]"><b>{c}</b>={v}</span>)}</p>
      </div>
      <p className="text-sm">Examples: חי = 18 · שלום = 376 · אהבה = 13</p>
    </Panel>
  </ToolFrame>
}

// ── Hebrew birthday ──
const enHebrew = hd => hd.render('en')
const longGreg = d => new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)
const shortGreg = d => new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
const parasha = (hd, israel) => { const r = getSedra(hd.getFullYear(), israel).lookup(hd); const name = r.parsha.join('-'); return r.chag ? `${name} (holiday reading)` : `Parashat ${name}` }
const NOTES = {
  cheshvan30: 'The birthday is on 30 Cheshvan. Some years Cheshvan has only 29 days, and then the birthday is shown on 1 Kislev, the day after 29 Cheshvan, following the usual rule in Jewish calendars.',
  kislev30: 'The birthday is on 30 Kislev. Some years Kislev has only 29 days, and then the birthday is shown on 1 Tevet, the day after 29 Kislev, following the usual rule in Jewish calendars.',
  adarRegular: 'The birth was in Adar of a regular year. A leap year has two Adars, and by the common custom (following the Rema) the birthday and the bar or bat mitzvah fall in Adar II, as shown here.',
  adar1: 'The birth was in Adar I of a leap year. In leap years the birthday falls in Adar I, and in regular years (with a single Adar) in Adar.',
  adar1day30: 'The birth was on 30 Adar I, a day that exists only in leap years. In regular years Adar has 29 days, and the calculator shows the birthday on 1 Nisan. Opinions differ in this rare case.',
  adar2: 'The birth was in Adar II of a leap year. In leap years the birthday falls in Adar II, and in regular years in Adar.',
}
function analyzeEn(date, afterSunset, gender) {
  const g = parseISO(date)
  if (!g) return { error: 'Choose a date of birth.' }
  if (g.getFullYear() < MIN_YEAR || g.getFullYear() > MAX_YEAR) return { error: `Choose a year between ${MIN_YEAR} and ${MAX_YEAR}.` }
  const birth = birthHDate(g, afterSunset), by = birth.getFullYear()
  const today = new HDate(new Date()), upcoming = []
  for (let hy = Math.max(by + 1, today.getFullYear()); upcoming.length < 5 && hy <= by + 150; hy++) {
    const hd = birthdayIn(birth, hy)
    if (hd && hd.abs() >= today.abs()) upcoming.push({ hd, greg: hd.greg(), age: hy - by })
  }
  const age = MITZVAH_AGE[gender]
  const m = birthdayIn(birth, by + age), mg = m.greg()
  const satOffset = (6 - mg.getDay() + 7) % 7
  const sat = new Date(mg.getFullYear(), mg.getMonth(), mg.getDate() + satOffset, 12), satHd = new HDate(sat)
  return { birth, greg: g, notes: birthNotes(birth).map(n => NOTES[n]), upcoming, mitzvah: { age, sameDay: satOffset === 0, hd: m, greg: mg, sat, satHd, il: parasha(satHd, true), diaspora: parasha(satHd, false) } }
}
export function HebrewBirthday() {
  const [date, setDate] = useState(''), [afterSunset, setAfterSunset] = useState(false), [gender, setGender] = useState('boy')
  const r = date ? analyzeEn(date, afterSunset, gender) : null
  return <ToolFrame path="/en/tools/hebrew-birthday" h1="📅 Hebrew birthday calculator" intro="Find your Hebrew date of birth, your next Hebrew birthdays and the bar or bat mitzvah date with its Torah portion." width="max-w-3xl"
    faq={[
      { q: 'What is a Hebrew birthday?', a: 'Your birthday on the Jewish calendar, which follows the moon. It falls on a different civil date each year, usually within a few weeks of your regular birthday.' },
      { q: 'Why does it matter if I was born after sunset?', a: 'The Jewish day starts at nightfall. Someone born in the evening, after sunset, was born on the next Hebrew date.' },
      { q: 'When is a bar or bat mitzvah?', a: 'A boy becomes bar mitzvah on his 13th Hebrew birthday and a girl becomes bat mitzvah on her 12th (many communities celebrate at 13 for girls as well). The page shows the date and the Shabbat right after it, with the Torah portion in Israel and abroad.' },
      { q: 'Why can the Torah portion differ between Israel and abroad?', a: 'Outside Israel some festivals last an extra day, so for part of the year the weekly portions in Israel run one week ahead.' },
    ]} bodyTitle="Questions and answers" paragraphs={['When choosing a date for a bar or bat mitzvah, especially for births in Adar or on the 30th of a month, it is a good idea to check with your rabbi.']}
    related={[{ href: '/en/jewish-holidays', label: 'Jewish holidays' }, { href: '/en/tools/gematria', label: 'gematria calculator' }, { href: '/en/tools/age-calculator', label: 'age calculator' }]}>
    <Panel label="Date of birth">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date of birth" type="date" min={`${MIN_YEAR}-01-01`} max={`${MAX_YEAR}-12-31`} value={date} onChange={e => setDate(e.target.value)} />
        <Select label="Celebration" value={gender} onChange={e => setGender(e.target.value)} options={[['boy', `Bar mitzvah (age ${MITZVAH_AGE.boy})`], ['girl', `Bat mitzvah (age ${MITZVAH_AGE.girl})`]]} />
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={afterSunset} onChange={e => setAfterSunset(e.target.checked)} /> Born after sunset (in the evening or at night)</label>
      {r && <Result error={r.error}>{!r.error && <div className="space-y-4">
        <div><p className="text-base font-normal">Hebrew date of birth</p><p className="text-3xl">{enHebrew(r.birth)}</p><p dir="rtl" lang="he" style={HE_FONT}>{r.birth.renderGematriya()}</p></div>
        {r.notes.map(n => <p key={n} className="text-base font-normal">{n}</p>)}
        <div><p className="text-base font-normal">Next Hebrew birthdays</p><ul className="list-disc pl-5 text-lg">{r.upcoming.map(u => <li key={u.age}>Age {u.age}: {longGreg(u.greg)} ({enHebrew(u.hd)}). Starts the evening before.</li>)}</ul></div>
        <div><p className="text-base font-normal">{gender === 'boy' ? 'Bar' : 'Bat'} mitzvah at {r.mitzvah.age}</p><p className="text-2xl">{longGreg(r.mitzvah.greg)}</p><p className="text-lg">{enHebrew(r.mitzvah.hd)}</p>
          <p className="text-lg">{r.mitzvah.sameDay ? 'It falls on Shabbat' : `The Shabbat after it: ${shortGreg(r.mitzvah.sat)}`}: {r.mitzvah.il}{r.mitzvah.il !== r.mitzvah.diaspora ? ` in Israel, ${r.mitzvah.diaspora} outside Israel` : ''}.</p>
        </div>
      </div>}</Result>}
    </Panel>
  </ToolFrame>
}

// ── keyboard fix ──
export function KeyboardFix() {
  const [text, setText] = useState(''), [mode, setMode] = useState('auto'), [copied, setCopied] = useState(false)
  const forced = mode === 'all' ? mainScript(text) : null
  const r = fixText(text, forced || 'auto')
  return <ToolFrame path="/en/tools/keyboard-fix" h1="⌨️ Fix text typed in the wrong keyboard layout" intro="Typed akuo instead of שלום, or עקךךם instead of hello? Paste it and get the right text back, Hebrew to English and English to Hebrew." width="max-w-3xl"
    faq={[
      { q: 'Why did my text come out as gibberish?', a: 'The keyboard was switched to the other language while you typed. Each key has a Hebrew and an English letter, so שלום typed on the English layout comes out as akuo.' },
      { q: 'How does it know which words to change?', a: 'In automatic mode it changes only words that look wrong as typed and right when converted, so a correct English or Hebrew word next to them stays as it is. "Convert everything" switches every word.' },
      { q: 'Which keyboard layout does it use?', a: 'The standard Israeli Hebrew layout (SI-1452) together with the US English layout, the pair on almost every computer in Israel.' },
      { q: 'Is my text saved?', a: 'No. The conversion happens in your browser and nothing is sent anywhere.' },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/hebrew-keyboard', label: 'online Hebrew keyboard' }, { href: '/en/tools/word-count', label: 'word counter' }]}>
    <Panel label="Keyboard fix">
      <label className="block font-bold">Text typed in the wrong layout<textarea dir="auto" className={inputClass} style={HE_FONT} rows={5} value={text} onChange={e => { setText(e.target.value); setCopied(false) }} placeholder="akuo" /></label>
      <div className="flex flex-wrap gap-2">
        <button className={buttonClass} aria-pressed={mode === 'auto'} style={mode === 'auto' ? { outline: '3px solid #182139' } : undefined} onClick={() => setMode('auto')}>Automatic</button>
        <button className={buttonClass} aria-pressed={mode === 'all'} style={mode === 'all' ? { outline: '3px solid #182139' } : undefined} onClick={() => setMode('all')}>Convert everything</button>
      </div>
      <div><p className="font-bold">Fixed text</p>
        <div aria-live="polite" dir="auto" className="mt-1 min-h-24 whitespace-pre-wrap rounded-xl bg-[var(--postit)] p-3 text-xl" style={HE_FONT}>{r.segments.map((s, i) => s.changed ? <mark key={i} className="rounded bg-green-200 text-[#182139]">{s.text}</mark> : <span key={i}>{s.text}</span>)}</div>
        <p className="mt-1 text-sm">{!text ? '' : r.changed ? `${r.changed} ${r.changed === 1 ? 'word' : 'words'} fixed (highlighted).` : 'Nothing looked wrong. Try "Convert everything".'}</p>
      </div>
      <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={!text} onClick={async () => setCopied(await copyText(r.text))}>{copied ? 'Copied ✓' : 'Copy the fixed text'}</button><button className={buttonClass} disabled={!text} onClick={() => setText('')}>Clear</button></div>
    </Panel>
  </ToolFrame>
}

// ── niqqud ──
const MAX = 3000
const strip = s => s.replace(/[֑-ׇ]/g, m => (m === '־' ? m : ''))
export function AddNiqqud() {
  const [input, setInput] = useState(''), [words, setWords] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [open, setOpen] = useState(-1), [copied, setCopied] = useState(false)
  const shown = w => w.custom ?? (w.o?.length ? w.o[w.pick] : w.t)
  const result = words ? words.map(shown).join('') : ''
  async function run() {
    if (!/[א-ת]/.test(input)) { setError('Type or paste some Hebrew text first.'); return }
    setBusy(true); setError(''); setOpen(-1); setCopied(false)
    try {
      const res = await fetch('/api/nakdan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: strip(input).slice(0, MAX) }) })
      const data = await res.json()
      if (!res.ok || !Array.isArray(data.words)) throw new Error('bad response')
      setWords(data.words.map(w => ({ ...w, pick: 0 })))
    } catch { setError('The vowel service did not answer just now. Please try again in a moment.') }
    setBusy(false)
  }
  const update = (i, patch) => { setWords(ws => ws.map((w, j) => j === i ? { ...w, ...patch } : w)); setCopied(false) }
  return <ToolFrame path="/en/tools/add-niqqud" h1="🪄 Add niqqud (Hebrew vowels) automatically" intro="Paste Hebrew text and get it back with vowel points. Tap any word to pick another reading, then copy the result." width="max-w-4xl"
    faq={[
      { q: 'What is niqqud?', a: 'The dots and dashes under, over and inside Hebrew letters that show the vowels. Everyday Hebrew is written without them, but they help learners, children and anyone reading an unfamiliar word.' },
      { q: 'How accurate is it?', a: 'Very good for ordinary modern Hebrew, but a word can sometimes be read in more than one way. Tap a word to see the other options, or type your own.' },
      { q: 'Who does the vowel marking?', a: 'The free Nakdan of Dicta, the Israel center for text analysis. Your text is sent to it only to add the vowels.' },
      { q: 'How much text can I add?', a: `Up to ${MAX.toLocaleString('en-US')} characters at a time. For longer texts, do it in parts.` },
    ]} bodyTitle="Questions and answers" related={[{ href: '/en/tools/hebrew-keyboard', label: 'Hebrew keyboard with niqqud' }, { href: '/en/hebrew-alphabet', label: 'the Hebrew alphabet' }]}>
    <Panel label="Text to vowelize">
      <label className="block font-bold">Hebrew text<textarea dir="rtl" lang="he" className={`${inputClass} text-xl`} style={HE_FONT} rows={5} maxLength={MAX} value={input} onChange={e => setInput(e.target.value)} /></label>
      <button className={bigButtonClass} onClick={run} disabled={busy || !input.trim()}>{busy ? 'Adding vowels…' : '🪄 Add niqqud'}</button>
      {error && <p role="alert">{error}</p>}
      {words && <>
        <p className="text-sm">Tap a word to choose a different reading or to correct it.</p>
        <div dir="rtl" lang="he" aria-live="polite" className="whitespace-pre-wrap rounded-xl bg-[var(--postit)] p-4 text-2xl leading-loose" style={HE_FONT}>
          {words.map((w, i) => w.o?.length ? <button key={i} type="button" className={`rounded px-0.5 ${open === i ? 'bg-white' : 'hover:bg-white/70'}`} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>{shown(w)}</button> : <span key={i}>{shown(w)}</span>)}
        </div>
        {open >= 0 && words[open] && <div className="rounded-xl border-2 border-[var(--border)] p-3">
          <p className="font-bold">Readings of this word</p>
          <div dir="rtl" className="mt-2 flex flex-wrap gap-2" style={HE_FONT}>{words[open].o.map((o, k) => <button key={k} className={buttonClass} onClick={() => { update(open, { pick: k, custom: undefined }); setOpen(-1) }}>{o}</button>)}<button className={buttonClass} onClick={() => { update(open, { custom: words[open].t }); setOpen(-1) }}>No vowels</button></div>
          <label className="mt-2 block font-bold">Or type it yourself and press Enter<input key={open} dir="rtl" lang="he" className={inputClass} style={HE_FONT} defaultValue={shown(words[open])} onKeyDown={e => { if (e.key === 'Enter') { update(open, { custom: e.currentTarget.value }); setOpen(-1) } }} /></label>
        </div>}
        <button className={buttonClass} onClick={async () => setCopied(await copyText(result))}>{copied ? 'Copied ✓' : 'Copy the text with niqqud'}</button>
      </>}
    </Panel>
  </ToolFrame>
}

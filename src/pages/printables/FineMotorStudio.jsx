import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import ActivitySvg, { Icon } from '../../motor/render/ActivitySvg'
import { GENERATORS, createActivity } from '../../motor/generators'
import { AGES, DIFFICULTIES, newSeed } from '../../motor/rng'
import { THEMES } from '../../motor/themes'
import './fine-motor.css'

// "מוטוריקה עדינה – מחולל דפי תרגול": every page is generated in the browser from rules and a seed —
// no AI, no server, no cost per page. The seed lives in the URL, so a page can be shared or reprinted.

const COUNTS = [1, 3, 5]

function Sheet({ activity, solution }) {
  return (
    <article className="buga-a4 motor-sheet">
      <h2>{solution ? `פתרון: ${activity.title}` : activity.title}</h2>
      {!solution && <p className="art-caption motor-caption"><span>{activity.instruction}</span><span className="motor-name">שם: ______________</span></p>}
      <div className="print-art"><ActivitySvg activity={activity} showSolution={solution} /></div>
      <footer>עוגה בוגה · מחולל מוטוריקה עדינה · ugabuga.co.il</footer>
    </article>
  )
}

function Choice({ group, value, onChange, items, render }) {
  return (
    <div className="motor-choice" role="radiogroup" aria-label={group}>
      <span className="motor-choice-label">{group}</span>
      <div className="motor-pills">
        {items.map(it => <button key={it.id} type="button" role="radio" aria-checked={value === it.id} className={value === it.id ? 'is-on' : ''} onClick={() => onChange(it.id)}>{render ? render(it) : it.label}</button>)}
      </div>
    </div>
  )
}

export default function FineMotorStudio() {
  const [params, setParams] = useSearchParams()
  // A shared link carries its seed (s=…) and shows exactly that page; otherwise every visit/refresh draws a new one.
  const [seed, setSeed] = useState(() => +params.get('s') || newSeed())
  const cfg = {
    type: GENERATORS.some(g => g.id === params.get('t')) ? params.get('t') : 'maze',
    age: AGES.some(a => a.id === params.get('a')) ? params.get('a') : '4-5',
    difficulty: DIFFICULTIES.some(d => d.id === params.get('d')) ? params.get('d') : 'medium',
    theme: THEMES.some(t => t.id === params.get('th')) ? params.get('th') : 'space',
    seed,
  }
  const [interactive, setInteractive] = useState(false)
  const [answers, setAnswers] = useState({})
  const [picker, setPicker] = useState(null)
  const [printing, setPrinting] = useState(false)
  const [count, setCount] = useState(1)
  const [withSolution, setWithSolution] = useState(false)
  const draw = useRef(null)

  const activity = useMemo(() => createActivity(cfg), [cfg.type, cfg.age, cfg.difficulty, cfg.theme, cfg.seed]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = patch => { setParams({ t: cfg.type, a: cfg.age, d: cfg.difficulty, th: cfg.theme, ...patch }, { replace: true }); setSeed(newSeed()); setAnswers({}); setPicker(null); draw.current?.clear() }
  const another = () => set({})
  const [copied, setCopied] = useState(false)
  const shareLink = () => {
    const url = `${location.origin}/printables/fine-motor?t=${cfg.type}&a=${cfg.age}&d=${cfg.difficulty}&th=${cfg.theme}&s=${cfg.seed}`
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    if (navigator.share) navigator.share({ title: activity.title, url }).catch(() => {})
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, () => window.prompt('העתיקו את הקישור:', url))
    else window.prompt('העתיקו את הקישור:', url)
  }
  const NEW_LABEL = { maze: '✨ מבוך חדש', tracing: '✨ דף קווים חדש', pattern: '✨ דפוסים חדשים' }

  const printSet = useMemo(() => {
    if (!printing) return []
    const list = Array.from({ length: count }, (_, i) => i === 0 ? activity : createActivity({ ...cfg, seed: (cfg.seed * 7919 + i * 104729) % 1e9 + 1 }))
    return list.flatMap((a, i) => [<Sheet key={'s' + i} activity={a} />, ...(withSolution && a.kind === 'maze' ? [<Sheet key={'p' + i} activity={a} solution />] : [])])
  }, [printing, count, withSolution, activity]) // eslint-disable-line react-hooks/exhaustive-deps

  const blanks = activity.kind === 'pattern' ? activity.rows.flatMap((row, r) => row.cells.map((c, k) => c.blank ? { key: `${r}-${k}`, item: c.item } : null).filter(Boolean)) : []
  const solved = blanks.length > 0 && blanks.every(b => answers[b.key] === b.item)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 motor" dir="rtl">
      <SEO title="מוטוריקה עדינה – מחולל דפי תרגול" description="מחולל דפי מוטוריקה עדינה בחינם: מבוכים, עקיבה אחרי קווים והמשך דפוסים – לפי גיל, רמה ונושא. דף חדש בכל לחיצה, מוכן להדפסה על A4." path="/printables/fine-motor" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'דפים להדפסה', href: '/printables' }, { label: 'מוטוריקה עדינה' }]} />
      <header className="motor-head">
        <h1>✏️ מוטוריקה עדינה – מחולל דפי תרגול</h1>
        <p>בוחרים גיל, סוג תרגיל, רמה ונושא – ומקבלים דף חדש בכל לחיצה. להדפסה על A4 או לתרגול על המסך.</p>
      </header>

      <div className="motor-layout">
        <aside className="motor-panel">
          <Choice group="סוג פעילות" value={cfg.type} onChange={t => set({ t })} items={GENERATORS} render={g => <><span aria-hidden="true">{g.emoji}</span> {g.label}</>} />
          <Choice group="גיל" value={cfg.age} onChange={a => set({ a })} items={AGES} />
          <Choice group="רמת קושי" value={cfg.difficulty} onChange={d => set({ d })} items={DIFFICULTIES} />
          <Choice group="נושא" value={cfg.theme} onChange={th => set({ th })} items={THEMES} render={t => <><span aria-hidden="true">{t.emoji}</span> {t.label}</>} />
          <div className="motor-actions">
            <button type="button" className="motor-primary" onClick={another}>✨ צרו לי דף חדש</button>
            <button type="button" onClick={() => setPrinting(true)}>🖨️ הדפסה / שמירה כ-PDF</button>
            <button type="button" aria-pressed={interactive} onClick={() => { setInteractive(v => !v); draw.current?.clear() }}>{interactive ? '📄 חזרה לתצוגת דף' : '✋ לתרגל על המסך'}</button>
          </div>
          <div className="motor-print-opts">
            <label>דפים בהדפסה:{' '}
              <select id="motor-count" value={count} onChange={e => setCount(+e.target.value)}>{COUNTS.map(n => <option key={n} value={n}>{n === 1 ? 'דף אחד' : `${n} דפים שונים`}</option>)}</select>
            </label>
            {cfg.type === 'maze' && <label><input id="motor-solution" type="checkbox" checked={withSolution} onChange={e => setWithSolution(e.target.checked)} /> כולל דף פתרון</label>}
          </div>
        </aside>

        <section className="motor-stage" aria-label="הדף שנוצר">
          <div className="motor-bar">
            <button type="button" className="motor-new" onClick={another}>{NEW_LABEL[cfg.type]}</button>
            <button type="button" onClick={() => setPrinting(true)}>🖨️ הדפסה</button>
            <button type="button" onClick={shareLink}>{copied ? '✓ הקישור הועתק' : '🔗 שיתוף'}</button>
          </div>
          <div className="motor-paper">
            <h2>{activity.title}</h2>
            <p className="motor-caption"><span>{activity.instruction}</span><span className="motor-name">שם: ______________</span></p>
            <ActivitySvg activity={activity} interactive={interactive} answers={answers} draw={draw}
              onPick={(r, k, row) => setPicker({ key: `${r}-${k}`, choices: row.choices })} />
          </div>
          {interactive && activity.kind !== 'pattern' && (
            <div className="motor-tools"><span>מציירים עם האצבע או העכבר</span><button type="button" onClick={() => draw.current?.undo()}>↩️ ביטול קו</button><button type="button" onClick={() => draw.current?.clear()}>🧽 ניקוי</button><button type="button" onClick={another}>🔁 עוד אחד כזה</button></div>
          )}
          {interactive && activity.kind === 'pattern' && (
            <div className="motor-tools">
              {picker ? <><span>מה מגיע כאן?</span>{picker.choices.map(c => <button key={c} type="button" className="motor-pick" aria-label="בחירה" onClick={() => { setAnswers(a => ({ ...a, [picker.key]: c })); setPicker(null) }}><svg viewBox="0 0 20 20" width="34" height="34"><Icon id={c} x={10} y={10} size={16} /></svg></button>)}</>
                : <span>{solved ? '🎉 כל הכבוד! כל הדפוסים נכונים' : 'לחצו על ריבוע ריק ובחרו מה חסר'}</span>}
              <button type="button" onClick={another}>🔁 עוד אחד כזה</button>
            </div>
          )}
          {!interactive && <p className="motor-hint">בכל לחיצה על „{NEW_LABEL[cfg.type].slice(2)}” – וגם בכל כניסה לעמוד – נוצר דף אחר.</p>}
        </section>
      </div>

      {printing && <PrintPreview title={`${activity.title}${count > 1 ? ` (${count} דפים)` : ''}`} onClose={() => setPrinting(false)}>{printSet}</PrintPreview>}
    </div>
  )
}

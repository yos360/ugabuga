// Controls for the selected item (photo / text / sticker / mosaic). Plain buttons and sliders,
// big enough for a finger. Every change goes through `set` (live) and `done` (adds an undo step).
import { FONTS, DECOR } from './styles'

const btn = 'min-h-[40px] rounded-xl border-2 border-slate-300 bg-white px-3 py-1 text-sm font-bold hover:border-slate-500'
const on = 'min-h-[40px] rounded-xl border-2 border-[var(--border)] bg-amber-200 px-3 py-1 text-sm font-bold'
const Row = ({ label, children }) => <div className="flex flex-wrap items-center gap-2"><span className="w-full text-sm font-bold text-slate-600">{label}</span>{children}</div>
export function Slider({ label, value, min, max, step = 1, onChange, onDone, fmt }) {
  return <label className="block text-sm font-bold text-slate-600">{label}: <span className="text-slate-900">{fmt ? fmt(value) : Math.round(value * 10) / 10}</span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} onPointerUp={onDone} onKeyUp={onDone} onTouchEnd={onDone} className="mt-1 w-full accent-rose-500" />
  </label>
}
const TONES = [['none', 'רגיל'], ['bw', 'שחור-לבן'], ['sepia', 'ספיה'], ['warm', 'חם'], ['cool', 'קר']]
export const EMOJI = ['❤️', '💍', '🥂', '🎉', '🎈', '🎂', '🎁', '⭐', '✨', '🌸', '🌿', '🕊️', '👑', '💖', '🌈', '☀️', '🌙', '⚽', '🏀', '🎮', '🎵', '📸', '✡️', '📜', '🕯️', '🍰', '🦄', '🐶', '🐱', '🚀', '🏆', '😍', '😂', '🥰', '😎', '🤩', '👶', '👨‍👩‍👧', '💐', '🍾']

export default function Inspector({ it, set, done, photos, onPickPhoto, onAction, crop, setCrop }) {
  const s = (patch) => { set(patch); }
  const sd = (patch) => { set(patch); done() }
  const quick = <div className="flex flex-wrap gap-1.5">
    <button type="button" className={btn} onClick={() => sd({ rot: ((it.rot || 0) + 90) % 360 })} aria-label="סיבוב ימינה">↻ ימינה</button>
    <button type="button" className={btn} onClick={() => sd({ rot: ((it.rot || 0) - 90) % 360 })} aria-label="סיבוב שמאלה">↺ שמאלה</button>
    <button type="button" className={btn} onClick={() => sd({ rot: 0 })}>ישר</button>
    <button type="button" className={btn} onClick={() => onAction('front')}>⬆️ קדימה</button>
    <button type="button" className={btn} onClick={() => onAction('back')}>⬇️ אחורה</button>
    <button type="button" className={btn} onClick={() => onAction('dup')}>📄 שכפול</button>
    <button type="button" className={`${btn} text-red-600`} onClick={() => onAction('del')}>🗑️ מחיקה</button>
  </div>
  const rotate = <Slider label="סיבוב (מעלות)" value={it.rot || 0} min={-180} max={180} onChange={v => s({ rot: v })} onDone={done} />
  return <div className="space-y-3">
    {quick}
    {rotate}
    {it.type === 'photo' && <>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" className={crop ? on : btn} onClick={() => setCrop(!crop)} aria-pressed={crop}>✂️ {crop ? 'סיום חיתוך' : 'חיתוך והזזת התמונה'}</button>
        <button type="button" className={btn} onClick={() => onPickPhoto(id => sd({ photo: id, zoom: 1, ox: 0, oy: 0 }))}>🔁 החלפת תמונה</button>
        <button type="button" className={btn} onClick={() => onAction('same-height')}>📏 כל התמונות בגובה הזה</button>
        <button type="button" className={btn} onClick={() => onAction('remove-bg')}>🪄 הסרת רקע</button>
      </div>
      {crop && <p className="m-0 rounded-lg bg-amber-50 p-2 text-sm">גוררים את התמונה בתוך המסגרת. מגדילים בסרגל, בגלגלת העכבר או בשתי אצבעות.</p>}
      <Slider label="זום בתוך המסגרת" value={it.zoom || 1} min={1} max={5} step={0.02} onChange={v => s({ zoom: v })} onDone={done} fmt={v => `×${v.toFixed(2)}`} />
      <Row label="צבע התמונה">{TONES.map(([v, l]) => <button key={v} type="button" className={(it.tone || 'none') === v ? on : btn} onClick={() => sd({ tone: v, toneSet: true })}>{l}</button>)}</Row>
      <Slider label="וינייט (הכהיית שוליים)" value={it.vignette || 0} min={0} max={1} step={0.05} onChange={v => s({ vignette: v })} onDone={done} fmt={v => `${Math.round(v * 100)}%`} />
      <Slider label="מסגרת (מ״מ)" value={it.border || 0} min={0} max={15} step={0.5} onChange={v => s({ border: v, custom: true })} onDone={done} />
      <Slider label="פינות מעוגלות" value={it.radius || 0} min={0} max={Math.round(Math.min(it.w, it.h) / 2)} step={0.5} onChange={v => s({ radius: v, custom: true })} onDone={done} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-bold">צבע מסגרת <input type="color" value={it.borderColor || '#ffffff'} onChange={e => s({ borderColor: e.target.value, custom: true })} onBlur={done} className="h-9 w-12" /></label>
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!it.shadow} onChange={e => sd({ shadow: e.target.checked, custom: true })} className="h-5 w-5" /> צל</label>
      </div>
    </>}
    {it.type === 'text' && <>
      <label className="block text-sm font-bold">הטקסט
        <textarea value={it.text} rows={2} dir="auto" onChange={e => s({ text: e.target.value })} onBlur={done} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2 text-lg" />
      </label>
      <label className="block text-sm font-bold">גופן
        <select value={it.font} onChange={e => sd({ font: e.target.value })} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2" style={{ fontFamily: it.font }}>
          {FONTS.map(([f, l]) => <option key={f} value={f} style={{ fontFamily: f }}>{f} · {l}</option>)}
        </select>
      </label>
      <Slider label="גודל (מ״מ)" value={it.size} min={3} max={Math.max(120, Math.round(it.size * 1.5))} step={0.5} onChange={v => s({ size: v })} onDone={done} />
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm font-bold">צבע <input type="color" value={it.color || '#222222'} onChange={e => s({ color: e.target.value })} onBlur={done} className="h-9 w-12" /></label>
        {[['right', 'ימין'], ['center', 'מרכז'], ['left', 'שמאל']].map(([v, l]) => <button key={v} type="button" className={(it.align || 'center') === v ? on : btn} onClick={() => sd({ align: v })}>{l}</button>)}
        <button type="button" className={(it.weight || 700) >= 700 ? on : btn} onClick={() => sd({ weight: (it.weight || 700) >= 700 ? 400 : 800 })}>מודגש</button>
        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!it.shadow} onChange={e => sd({ shadow: e.target.checked })} className="h-5 w-5" /> צל</label>
      </div>
      <Slider label="קו מתאר (מ״מ)" value={it.stroke || 0} min={0} max={4} step={0.1} onChange={v => s({ stroke: v })} onDone={done} />
      <div className="rounded-xl bg-sky-50 p-3">
        <p className="m-0 text-sm font-bold">🅰️ תמונה בתוך האותיות</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button type="button" className={btn} onClick={() => onPickPhoto(id => sd({ photoFill: id, zoom: 1, ox: 0, oy: 0 }))}>{it.photoFill ? 'החלפת התמונה' : 'בחירת תמונה למילוי'}</button>
          {it.photoFill && <button type="button" className={btn} onClick={() => sd({ photoFill: null })}>בלי תמונה</button>}
          {it.photoFill && <button type="button" className={crop ? on : btn} onClick={() => setCrop(!crop)}>✂️ הזזת התמונה</button>}
        </div>
        {it.photoFill && <Slider label="זום" value={it.zoom || 1} min={1} max={4} step={0.02} onChange={v => s({ zoom: v })} onDone={done} />}
      </div>
    </>}
    {it.type === 'decor' && <>
      <label className="flex items-center gap-2 text-sm font-bold">צבע <input type="color" value={/^#[0-9a-f]{6}$/i.test(it.color || '') ? it.color : '#c9a961'} onChange={e => s({ color: e.target.value })} onBlur={done} className="h-9 w-12" /></label>
      <Row label="צורה">{Object.entries(DECOR).map(([k, d]) => <button key={k} type="button" className={it.kind === k ? on : btn} onClick={() => sd({ kind: k })}>{d.label}</button>)}</Row>
      <Slider label="שקיפות" value={it.opacity ?? 1} min={0.1} max={1} step={0.05} onChange={v => s({ opacity: v })} onDone={done} fmt={v => `${Math.round(v * 100)}%`} />
    </>}
    {it.type === 'mosaic' && <>
      <Row label="צורה">{[['text', 'מספר / שם'], ['heart', 'לב'], ['circle', 'עיגול'], ['star', 'כוכב']].map(([v, l]) => <button key={v} type="button" className={it.shape === v ? on : btn} onClick={() => sd({ shape: v })}>{l}</button>)}</Row>
      {it.shape === 'text' && <label className="block text-sm font-bold">מספר או שם
        <input value={it.text} dir="auto" onChange={e => s({ text: e.target.value.slice(0, 12) })} onBlur={done} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2 text-2xl font-black" />
      </label>}
      {it.shape === 'text' && <label className="block text-sm font-bold">גופן
        <select value={it.font} onChange={e => sd({ font: e.target.value })} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2">{FONTS.map(([f, l]) => <option key={f} value={f}>{f} · {l}</option>)}</select>
      </label>}
      <Slider label="כמה ריבועים" value={it.count || 40} min={8} max={400} onChange={v => s({ count: v })} onDone={done} />
      <Slider label="רווח בין התמונות (מ״מ)" value={it.gap ?? 1} min={0} max={6} step={0.1} onChange={v => s({ gap: v })} onDone={done} />
      <Slider label="פינות מעוגלות" value={it.radius || 0} min={0} max={50} onChange={v => s({ radius: v })} onDone={done} fmt={v => `${v}%`} />
      <Row label="צבע התמונות">{TONES.map(([v, l]) => <button key={v} type="button" className={(it.tone || 'none') === v ? on : btn} onClick={() => sd({ tone: v })}>{l}</button>)}</Row>
      <p className="m-0 text-sm text-slate-600">{(it.photos || []).length} תמונות בפסיפס, לפי תאריך הצילום. {photos.length > (it.photos || []).length ? <button type="button" className="underline" onClick={() => sd({ photos: [...photos].sort((a, b) => a.date - b.date).map(p => p.id) })}>להכניס את כל {photos.length} התמונות</button> : null}</p>
    </>}
  </div>
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HolidayShell from '../../components/holidays/HolidayShell'
import SpeciesIcon from '../../components/tubishvat/SpeciesIcon'
import { Cup, GroupIcon, VineDivider, SederCover, AlmondTemplate } from '../../components/tubishvat/SederArt'
import { FONT } from '../../components/holidays/printKit'
import { TUBISHVAT_H } from '../../holidays/tubishvat'
import {
  SEDER_PATH, SEDER_INTRO, CUPS, FRUIT_GROUPS, SEDER_SPECIES, BLESSINGS, ROLES, SAFETY, CRAFTS, SEDER_FAQ, buildSeder,
} from '../../data/tubishvatSeder'

// /holidays/tu-bishvat/seder — an original Tu BiShvat seder in two versions (family: short;
// class/kindergarten: with roles), printed as an A4 cover + a flowing booklet, and a crafts section
// with one printable template (almond branch + blossoms).

const VERSIONS = [
  { id: 'family', label: '👨‍👩‍👧 למשפחה (קצר)' },
  { id: 'class', label: '🏫 לכיתה ולגן (עם תפקידים)' },
]
const groupOf = id => FRUIT_GROUPS.find(g => g.id === id)

function StepIcon({ s, size = 44 }) {
  if (s.kind === 'cup') return <Cup fill={CUPS[s.cup].fill} size={size} />
  if (s.kind === 'fruit') return <GroupIcon id={s.group} size={size} />
  if (s.kind === 'species') return <SpeciesIcon id="pomegranate" size={size} />
  return <span aria-hidden="true" style={{ fontSize: size * 0.7, lineHeight: 1 }}>{s.kind === 'riddles' ? '❓' : '🌳'}</span>
}

// On screen: one card per step.
function StepCard({ s, i }) {
  const g = s.group && groupOf(s.group)
  return <li className="rounded-3xl border-2 border-[var(--border)] bg-white p-4 sm:p-5">
    <div className="mb-2 flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50"><StepIcon s={s} /></div>
      <div className="min-w-0">
        <h3 className="text-xl font-black sm:text-2xl">{i + 1}. {s.title}</h3>
        {s.roleName && <p className="text-sm font-bold text-green-800">🎭 קוראים: {s.roleName}</p>}
      </div>
    </div>
    <div className="space-y-1.5 text-lg leading-relaxed">{s.lines.map(l => <p key={l}>{l}</p>)}</div>
    {g && <p className="mt-2 text-base"><b>מה לשים:</b> {g.examples.join(' · ')}</p>}
    {s.ask && <p className="mt-2 rounded-xl bg-[var(--postit)] p-2 text-lg font-bold">💬 {s.ask}</p>}
    {s.kind === 'species' && <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
      {SEDER_SPECIES.map(sp => <li key={sp.id} className="flex flex-col items-center rounded-2xl bg-green-50 p-2 text-center">
        <SpeciesIcon id={sp.id} size={52} title={sp.name} /><b>{sp.name}</b><span className="text-sm">{sp.serve}</span>
      </li>)}
    </ul>}
    {s.riddles && <Riddles s={s} />}
    {s.blessing && <Blessing b={BLESSINGS[s.blessing]} />}
  </li>
}

function Riddles({ s }) {
  const [open, setOpen] = useState({})
  return <div className="mt-3 space-y-2">
    {s.riddles.map((r, k) => <div key={r.q} className="rounded-2xl bg-amber-50 p-3">
      <p className="text-lg font-bold">🔎 {r.q}</p>
      <button type="button" aria-expanded={!!open[k]} onClick={() => setOpen(o => ({ ...o, [k]: !o[k] }))} className="mt-1 min-h-[44px] rounded-full border-2 border-slate-800 bg-white px-4 font-bold">{open[k] ? r.a : 'הצגת התשובה'}</button>
    </div>)}
    {s.talk && <div className="rounded-2xl bg-sky-50 p-3"><p className="font-black">💬 שאלות לשיחה</p><ul className="list-disc pr-6 text-lg">{s.talk.map(t => <li key={t}>{t}</li>)}</ul></div>}
  </div>
}

const Blessing = ({ b }) => <div className="mt-3 rounded-2xl border-2 border-dashed border-green-700 bg-green-50 p-3">
  <p className="text-sm font-bold text-green-900">למי שנוהג לברך — {b.title}:</p>
  <p className="text-xl font-bold">{b.text}</p>
</div>

// Print: the seder as a flowing booklet after the A4 cover.
const P = { fontSize: 15, lineHeight: 1.55, margin: '0 0 4px' }
function SederBooklet({ version, steps }) {
  const cls = version === 'class'
  return <article className="buga-flow" dir="rtl" style={{ fontFamily: FONT, color: '#111' }}>
    <h2 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', color: '#3f7d20', margin: 0 }}>סדר ט״ו בשבט {cls ? 'לכיתה ולגן' : 'למשפחה'}</h2>
    <VineDivider />
    {cls && <>
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: '4px 0' }}>🎭 מי קורא מה</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, marginBottom: 6 }}>
        <tbody>{ROLES.map(r => <tr key={r.id} style={{ borderBottom: '1px solid #d9e7c8' }}>
          <td style={{ padding: '3px 4px', fontWeight: 800, whiteSpace: 'nowrap' }}>{r.name}</td>
          <td style={{ padding: '3px 4px', whiteSpace: 'nowrap' }}>{r.who}</td>
          <td style={{ padding: '3px 4px' }}>{r.job}</td>
          <td style={{ padding: '3px 4px', width: '28%' }}>שמות: ____________</td>
        </tr>)}</tbody>
      </table>
    </>}
    {!cls && <p style={{ ...P, fontStyle: 'italic' }}>מתחלפים בקריאה: כל אחד ליד השולחן קורא קטע אחד.</p>}
    {steps.map((s, i) => {
      const g = s.group && groupOf(s.group)
      return <section key={s.id} style={{ breakInside: 'avoid', margin: '8px 0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <StepIcon s={s} size={30} /><span>{i + 1}. {s.title}</span>
          {s.roleName && <span style={{ fontSize: 13, fontWeight: 700, color: '#3f7d20' }}>· קוראים: {s.roleName}</span>}
        </h3>
        {s.lines.map(l => <p key={l} style={P}>{l}</p>)}
        {g && <p style={P}><b>מה לשים:</b> {g.examples.join(' · ')}</p>}
        {s.ask && <p style={{ ...P, fontWeight: 800 }}>💬 {s.ask}</p>}
        {s.kind === 'species' && <p style={P}>{SEDER_SPECIES.map(sp => `${sp.name} — ${sp.serve}`).join(' · ')}</p>}
        {s.riddles && <ol style={{ paddingRight: 22, margin: '2px 0', fontSize: 15 }}>{s.riddles.map(r => <li key={r.q}>{r.q}</li>)}</ol>}
        {s.talk && <p style={P}><b>שאלות לשיחה:</b> {s.talk.join(' · ')}</p>}
        {s.blessing && <p style={{ ...P, border: '1.5px dashed #3f7d20', borderRadius: 10, padding: '4px 8px' }}><span style={{ fontSize: 12.5 }}>למי שנוהג לברך — {BLESSINGS[s.blessing].title}: </span><b style={{ fontSize: 16 }}>{BLESSINGS[s.blessing].text}</b></p>}
      </section>
    })}
    <VineDivider />
    <p style={{ ...P, fontSize: 12.5 }}><b>תשובות לחידות:</b> {steps.find(s => s.riddles).riddles.map((r, k) => `${k + 1}. ${r.a}`).join(' · ')}</p>
    <p style={{ ...P, fontSize: 12.5 }}>⚠️ {SAFETY}</p>
  </article>
}

function CraftCard({ c, onPrint }) {
  return <li className="rounded-3xl border-2 border-[var(--border)] bg-white p-4">
    <h3 className="text-xl font-black">{c.emoji} {c.title}</h3>
    <p className="mb-2 text-sm font-bold text-[var(--muted-foreground)]">גיל: {c.age}</p>
    <p className="font-bold">צריך:</p>
    <ul className="mb-2 list-disc pr-6">{c.materials.map(m => <li key={m}>{m}</li>)}</ul>
    <p className="font-bold">איך מכינים:</p>
    <ol className="list-decimal space-y-1 pr-6">{c.steps.map(s => <li key={s}>{s}</li>)}</ol>
    {c.template && <button type="button" onClick={onPrint} className="mt-3 min-h-[44px] rounded-full bg-pink-600 px-4 font-bold text-white">🖨️ הדפסת ענף ופרחים לגזירה</button>}
  </li>
}

export default function TuBishvatSeder() {
  const [version, setVersion] = useState('family'), [print, setPrint] = useState(null)
  const steps = useMemo(() => buildSeder(version), [version])
  const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-green-200' : 'border-[var(--border)] bg-white'}`
  return <HolidayShell h={TUBISHVAT_H} crumb="סדר ט״ו בשבט">
    <SEO title="סדר ט״ו בשבט להדפסה — הגדה למשפחה, לגן ולכיתה" description="סדר ט״ו בשבט מקורי להדפסה: ארבע כוסות, פירות לפי קבוצות, שבעת המינים, קטעי קריאה קצרים, חידות לילדים וחלוקת תפקידים לכיתה ולגן — ועוד 6 יצירות לט״ו בשבט." path={SEDER_PATH} structuredData={faqSchema(SEDER_FAQ)} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🍇 סדר ט״ו בשבט</h1>
    <p className="mx-auto mb-5 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">הגדה קצרה ומקורית לשולחן החג: ארבע כוסות, שלוש קבוצות של פירות, שבעת המינים וחידות. גרסה למשפחה וגרסה לכיתה ולגן עם תפקידים — ובסוף 6 יצירות לט״ו בשבט.</p>

    <div className="mb-3 flex flex-wrap justify-center gap-2" role="group" aria-label="גרסה">
      {VERSIONS.map(v => <button key={v.id} type="button" aria-pressed={version === v.id} onClick={() => setVersion(v.id)} className={chip(version === v.id)}>{v.label}</button>)}
    </div>
    <div className="mb-6 flex justify-center">
      <button data-print-main type="button" onClick={() => setPrint({ kind: 'seder', version })} className="min-h-[52px] rounded-2xl bg-green-700 px-6 text-xl font-bold text-white">🖨️ הדפסת הסדר {version === 'class' ? 'לכיתה' : 'למשפחה'}</button>
    </div>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-green-50 p-5" aria-labelledby="what">
      <h2 id="what" className="mb-2 text-2xl font-bold">🌳 מה זה סדר ט״ו בשבט?</h2>
      <div className="space-y-2 text-lg">{SEDER_INTRO.map(p => <p key={p}>{p}</p>)}</div>
      <div className="mt-4 flex flex-wrap items-end justify-center gap-4" aria-label="ארבע הכוסות">
        {CUPS.map(c => <div key={c.n} className="flex w-24 flex-col items-center text-center">
          <Cup fill={c.fill} size={64} title={`כוס ${c.n}: ${c.name}`} />
          <b className="text-sm">{c.n}. {c.name}</b><span className="text-xs">{c.season}</span>
        </div>)}
      </div>
      <p className="mt-3 text-center text-base">לילדים מוזגים מיץ ענבים: לבן, ואז מוסיפים בכל כוס עוד קצת אדום.</p>
    </section>

    {version === 'class' && <section className="mb-6 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5" aria-labelledby="roles">
      <h2 id="roles" className="mb-3 text-2xl font-bold">🎭 חלוקת תפקידים</h2>
      <ul className="grid gap-2 sm:grid-cols-2">{ROLES.map(r => <li key={r.id} className="rounded-2xl bg-white p-3"><b>{r.name}</b> <span className="text-sm">({r.who})</span><br />{r.job}</li>)}</ul>
    </section>}

    <h2 className="mb-3 text-3xl font-black">📜 סדר הסדר {version === 'class' ? '— לכיתה ולגן' : '— למשפחה'}</h2>
    <ol className="mb-6 space-y-4">{steps.map((s, i) => <StepCard key={s.id} s={s} i={i} />)}</ol>
    <p className="mb-10 rounded-2xl bg-amber-50 p-3 text-base">⚠️ {SAFETY}</p>

    <section aria-labelledby="crafts" className="mb-8">
      <h2 id="crafts" className="mb-1 text-3xl font-black">✂️ יצירה לט״ו בשבט</h2>
      <p className="mb-4 text-lg text-[var(--muted-foreground)]">{CRAFTS.length} יצירות פשוטות לגן, לכיתה ולבית — עם רשימת חומרים ושלבים.</p>
      <ul className="grid gap-4 md:grid-cols-2">{CRAFTS.map(c => <CraftCard key={c.id} c={c} onPrint={() => setPrint({ kind: 'template' })} />)}</ul>
    </section>

    {print && <PrintPreview title={print.kind === 'template' ? 'שקדייה פורחת לגזירה' : 'סדר ט״ו בשבט'} onClose={() => setPrint(null)}>
      {print.kind === 'template'
        ? <article className="buga-a4"><div className="print-art"><AlmondTemplate /></div></article>
        : <>
          <article className="buga-a4"><div className="print-art"><SederCover version={print.version} /></div></article>
          <SederBooklet version={print.version} steps={buildSeder(print.version)} />
        </>}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד לט״ו בשבט: <Link className="font-bold underline" to="/holidays/tu-bishvat/seven-species">שבעת המינים</Link> · <Link className="font-bold underline" to="/holidays/tu-bishvat/coloring">דפי צביעה</Link> · <Link className="font-bold underline" to="/holidays/tu-bishvat/what-to-do">פעילויות</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'סדר ט״ו בשבט להדפסה שנכתב במיוחד לעוגה בוגה: קטעי קריאה קצרים בשפה של ילדים, ארבע כוסות שהצבע שלהן עובר מלבן לאדום כמו העונות, שלוש קבוצות של פירות — עם קליפה, עם גלעין ופירות שאוכלים כולם — ושבעת המינים מהפסוק בספר דברים.',
      'הגרסה למשפחה קצרה ומתאימה לשולחן בבית. הגרסה לכיתה ולגן מוסיפה חלוקת תפקידים, קטעים נוספים, שאלות לשיחה ועוד חידות. בהדפסה יוצא דף פתיחה צבעוני עם מסגרת, הכוסות, שבעת המינים ורשימת "מה שמים על השולחן", ואחריו הסדר כולו.',
    ]} faq={SEDER_FAQ} related={[{ label: 'ט״ו בשבט לילדים', href: '/holidays/tu-bishvat' }, { label: 'שבעת המינים', href: '/holidays/tu-bishvat/seven-species' }, { label: 'חידון ט״ו בשבט', href: '/holidays/tu-bishvat/quiz' }]} /></div>
  </HolidayShell>
}

import { useState } from 'react'
import PrintableShell, { Sheet, T, Choice, Field } from '../../components/printables/PrintableShell'
import PersonalPhoto from '../../components/printables/PersonalPhoto'

function Poster({ role, name, group, date, photo, theme, empty }) {
  const color = theme === 'color', ink = color ? '#315c51' : '#303030', gold = color ? '#bd9244' : '#555'
  return <Sheet label={`${role} — ${name || 'שם הילד או הילדה'}`}>
    <rect x="5" y="5" width="190" height="251" rx="10" fill={color ? '#faf7ed' : '#fff'} stroke={ink} strokeWidth="0.8" />
    <rect x="9" y="9" width="182" height="243" rx="8" fill="none" stroke={gold} strokeWidth="0.35" />
    <T x="100" y="24" size="4.5" fill={ink}>רגע קטן של אור · מזכרת מהגן</T>
    <T x="100" y="44" size="14" weight="800" fill={ink}>{role}</T>
    <path d="M55 53 Q100 61 145 53" fill="none" stroke={gold} strokeWidth="0.8" />
    {(photo || empty === 'frame') && <rect x="43" y="64" width="114" height="108" rx="8" fill="#fff" stroke={gold} strokeWidth="0.6" />}
    {photo ? <image href={photo} x="47" y="68" width="106" height="100" preserveAspectRatio="xMidYMid meet" /> : empty === 'plain' ? <g stroke={gold} strokeWidth="1.2" fill="none">{[82,118].map(x => <g key={x}><path d={`M${x-9} 119 H${x+9} M${x} 119 V101 M${x-4} 101 H${x+4} V82 H${x-4} Z`} /><path d={`M${x} 78 Q${x-7} 71 ${x} 63 Q${x+7} 71 ${x} 78Z`} fill={color ? '#f1c260' : '#fff'} /></g>)}</g> : null}
    <T x="100" y={photo || empty === 'frame' ? 190 : 153} size={(name || '').length > 17 ? 8 : 11} weight="700" fill={ink}>{name || 'השם שלי'}</T>
    <T x="100" y={photo || empty === 'frame' ? 201 : 167} size="4.7" fill={ink}>{group || 'מכניסים לגן אור ושמחה'}</T>
    {date && <T x="100" y={photo || empty === 'frame' ? 210 : 180} size="4" fill={ink}>{date.split('-').reverse().join('.')}</T>}
    {[43,157].map(x => <g key={x} stroke={gold} strokeWidth="0.8" fill="none"><path d={`M${x-7} 239 H${x+7} M${x} 239 V223 M${x-4} 223 H${x+4} V210 H${x-4} Z`} /><path d={`M${x} 207 Q${x-6} 202 ${x} 196 Q${x+6} 202 ${x} 207Z`} fill={color ? '#f1c260' : '#fff'} /></g>)}
    <T x="100" y="229" size="10" weight="700" fill={ink}>שבת שלום!</T>
    <T x="100" y="241" size="4.3" fill={ink}>אור בבית, שמחה בלב</T>
  </Sheet>
}

export default function ShabbatParents() {
  const [role, setRole] = useState('אבא של שבת'), [name, setName] = useState(''), [group, setGroup] = useState(''), [date, setDate] = useState(''), [photo, setPhoto] = useState(''), [theme, setTheme] = useState('color'), [empty, setEmpty] = useState('plain')
  return <PrintableShell path="/holidays/shabbat-parents" seoTitle="אבא של שבת ואמא של שבת — דף אישי עם תמונה להדפסה" description="מכינים מזכרת לאבא של שבת או לאמא של שבת: תמונת הילד, שם, גן ותאריך. שני עיצובים, תצוגה מקדימה והדפסה או PDF בחינם." emoji="🕯️" h1="אבא של שבת ואמא של שבת" sub="מזכרת אישית מהרגע שבו כל הגן אומר: שבת שלום!" crumbs={[{ label: 'שבתות וחגים', href: '/holidays' }]} printTitle={`${role} — ${name || 'מזכרת מהגן'}`} copies={false}
    controls={<><Choice label="תפקיד בשבת" value={role} onChange={setRole} options={[['אבא של שבת','אבא של שבת'],['אמא של שבת','אמא של שבת']]} /><div className="grid gap-4 sm:grid-cols-2"><Field label="שם הילד או הילדה" value={name} onChange={setName} maxLength={28} placeholder="למשל: נועם" /><Field label="שם הגן או הכיתה (לא חובה)" value={group} onChange={setGroup} maxLength={36} placeholder="למשל: גן רימון" /><Field label="תאריך (לא חובה)" type="date" value={date} onChange={setDate} /></div><PersonalPhoto label="תמונת הילד או הילדה (לא חובה)" value={photo} onChange={setPhoto} />{!photo && <Choice label="עיצוב ללא תמונה" value={empty} onChange={setEmpty} options={[['plain','בלי תמונה ובלי מסגרת'],['frame','מסגרת ריקה לציור או להדבקה']]} />}<Choice label="עיצוב הדף" value={theme} onChange={setTheme} options={[['color','צבעוני ועדין'],['ink','חסכוני בדיו']]} /></>}
    pages={[{ key: 'shabbat-parent', svg: <Poster {...{ role, name, group, date, photo, theme, empty }} /> }]}
    paragraphs={['תור אבא של שבת או אמא של שבת הוא רגע שילדים אוהבים לזכור. הוסיפו שם ותמונה, בחרו עיצוב והכינו דף אישי שאפשר לתלות בגן, להביא הביתה או לשמור כמזכרת.', 'אפשר להכין את הדף מראש עם הילד או הילדה ולשוחח על מה ירצו להביא לשולחן השבת: שיר, מעשה טוב או ברכה למשפחה. אפשר להדפיס גם בלי תמונה ולהדביק צילום או לצייר בתוך המסגרת.']}
    faq={[{ q: 'האם התמונה נשמרת באתר?', a: 'לא. התמונה מעובדת בדפדפן ונכללת רק בדף שאתם מדפיסים או שומרים כ־PDF. רענון הדף מאפס את הבחירה.' },{ q: 'אפשר להכין דף גם בלי תמונה?', a: 'כן. בוחרים עיצוב בלי תמונה ובלי מסגרת, או משאירים מסגרת ריקה להדבקת צילום או לציור.' },{ q: 'מה גודל הדף?', a: 'דף A4 לאורך. אפשר לבחור עיצוב צבעוני או עיצוב חסכוני בדיו.' }]}
    related={[{href:'/shabbat-times#calendar',label:'לוח שבת חודשי ושנתי עם תמונה'},{href:'/parasha',label:'בלשי הפרשה — חידון שבועי להדפסה'},{href:'/games/shabbat',label:'משחקים לשבת'}]} />
}

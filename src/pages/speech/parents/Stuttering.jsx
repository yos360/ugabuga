import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import QuickAnswer from '../../../components/ui/QuickAnswer'
import PrintPreview from '../../../components/ui/PrintPreview'
import SpeechNote from '../SpeechNote'
import { Section, Bullets, OnThisPage, SiblingNav, Sources } from './ParentParts'
import { COMPARE_ROWS, REFER_SIGNS, HOME_TIPS, AVOID, MYTHS, TEACHER_TIPS, FAQ } from '../../../data/speech/stuttering'
import { STUTTER_SOURCES } from '../../../data/speech/parentSources'
import './speech-parents.css'

// Parents' guide to stuttering in young children: typical disfluency vs. stuttering (a comparison, not a
// diagnostic tool), sourced onset/recovery figures, when to refer, what helps at home, myths, tips for
// kindergarten/school staff, and two one-page printables (parents / teacher).

const PATH = '/speech/parents/stuttering'

const SHEET_FOOT = 'מבוסס על ASHA ועל ה־Stuttering Foundation. הדף אינו כלי אבחון ואינו מחליף הערכה של קלינאי/ת תקשורת. תמיכה ומידע בעברית: אמב״י — ארגון האנשים שמגמגמים בישראל.'

function ParentSheet() {
  return <article className="buga-a4 spk-sheet spk-stutter" dir="rtl">
    <h2>💬 טיפים להורים: איך לעזור לילד שמגמגם</h2>
    <p className="spk-sub">גמגום אינו נגרם בגלל ההורים — אבל הדרך שבה אנחנו מדברים ומקשיבים יכולה להקל מאוד על הילד.</p>
    <div className="spk-grid">
      {HOME_TIPS.map(t => <div key={t.title} className="spk-box"><h3>{t.icon} {t.title}</h3><p style={{ margin: 0 }}>{t.text}</p></div>)}
      <div className="spk-box spk-wide"><h3>🚫 מה עדיף לא לומר ולא לעשות</h3><ul>{AVOID.map(t => <li key={t}>{t}</li>)}</ul></div>
      <div className="spk-box spk-wide spk-consult"><h3>כדאי לפנות לקלינאי/ת תקשורת אם…</h3><ul>{REFER_SIGNS.map(t => <li key={t}>{t}</li>)}</ul></div>
    </div>
    <p className="spk-foot">{SHEET_FOOT}</p>
    <footer>עוגה בוגה · ugabuga.co.il{PATH}</footer>
  </article>
}

function TeacherSheet() {
  return <article className="buga-a4 spk-sheet spk-stutter spk-roomy" dir="rtl">
    <h2>🏫 טיפים לגננת ולמורה: ילד שמגמגם בגן ובכיתה</h2>
    <p className="spk-sub">ילדים שמגמגמים יודעים בדיוק מה הם רוצים להגיד. מה שעוזר להם הוא זמן, סבלנות ותחושה שמקשיבים להם.</p>
    <div className="spk-box"><h3>✅ מה עוזר</h3><ul>{TEACHER_TIPS.map(t => <li key={t}>{t}</li>)}</ul></div>
    <div className="spk-grid" style={{ marginTop: '2.5mm' }}>
      <div className="spk-box"><h3>🚫 מה עדיף לא לומר</h3><ul>
        <li>"דבר לאט", "תירגע", "תנשום"</li>
        <li>"תתחיל מחדש"</li>
        <li>להשלים את המילה במקום הילד</li>
        <li>"מהר, אנחנו ממשיכים"</li>
      </ul></div>
      <div className="spk-box"><h3>💡 כדאי לדעת</h3><ul>
        <li>גמגום אינו קשור לאינטליגנציה ואינו נגרם בגלל לחץ או חינוך</li>
        <li>הגמגום יכול להשתנות מיום ליום — יום טוב לא אומר שהוא "עבר"</li>
        <li>רבים מהילדים קוראים בקלות רבה יותר כשקוראים יחד עם עוד מישהו</li>
      </ul></div>
      <div className="spk-box spk-wide spk-consult"><h3>כדאי לשתף את ההורים ואת הקלינאית אם…</h3><ul>
        <li>הילד נמנע מלדבר, מוותר על תשובות או מחליף מילים כדי לא להיתקע</li>
        <li>יש לעג, חיקוי או הצקות סביב הדיבור</li>
        <li>הגמגום מלווה במאמץ או בתסכול גלוי, או שהוא הולך ומתגבר</li>
      </ul></div>
    </div>
    <p className="spk-sub" style={{ marginTop: '3mm' }}>הדבר הכי חשוב: לשאול את הילד עצמו מה נוח לו — ולכבד את התשובה.</p>
    <p className="spk-foot">{SHEET_FOOT}</p>
    <footer>עוגה בוגה · ugabuga.co.il{PATH}</footer>
  </article>
}

export default function Stuttering() {
  const [printing, setPrinting] = useState(null)
  const sheets = printing === 'both' ? ['parents', 'teacher'] : printing ? [printing] : []
  const printTitle = printing === 'teacher' ? 'גמגום — טיפים לגננת ולמורה' : printing === 'both' ? 'גמגום — טיפים להורים ולצוות החינוכי' : 'גמגום — טיפים להורים'

  return <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO path={PATH}
      title="גמגום אצל ילדים: מה נורמלי, מתי לפנות ואיך לעזור"
      description="גמגום אצל ילדים בגיל 2–5: ההבדל בין היסוסים רגילים לגמגום, מתי לפנות לקלינאית תקשורת, איך לעזור לילד שמגמגם בבית ובגן, מיתוסים וטיפים להדפסה להורים ולגננת. עם מקורות."
      structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'קלינאות תקשורת', href: '/speech' }, { label: 'גמגום אצל ילדים' }]} />
    <h1 className="text-center text-3xl font-black sm:text-5xl"><span aria-hidden="true">💬 </span>גמגום אצל ילדים</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-[var(--foreground)]/80">מה נורמלי, מתי לפנות לקלינאית תקשורת — ואיך לעזור בבית ובגן</p>
    <SiblingNav path={PATH} />

    <QuickAnswer q="הילד שלי מגמגם. זה נורמלי, ומתי לפנות?"
      a="היסוסים וחזרות נפוצים מאוד בגיל 2–5, וגמגום מתחיל בדרך כלל בגילים האלה. רוב הילדים שמתחילים לגמגם מפסיקים בתוך שנה־שנתיים, אבל אי אפשר לדעת מראש אצל מי. כדאי לפנות לקלינאי/ת תקשורת אם הגמגום נמשך יותר מחצי שנה, אם יש גמגום במשפחה, אם הוא התחיל אחרי גיל 3.5, אם רואים מאמץ או מתח, או אם הילד מתוסכל או נמנע מלדבר. בבית: מדברים בעצמכם בנינוחות, מחכים ולא אומרים &quot;דבר לאט&quot;."
      rows={[
        ['מתי גמגום מתחיל בדרך כלל', 'בין גיל 2 ל־5, אצל רובם לפני גיל 3.5'],
        ['כמה ילדים עוברים תקופה של גמגום', 'בערך 5% (ויש מחקרים שמעריכים יותר)'],
        ['כמה מפסיקים בלי טיפול', '75%–80%, לרוב בתוך 12–24 חודשים'],
        ['מתי לפנות', 'מעל כחצי שנה, היסטוריה משפחתית, מאמץ, תסכול או הימנעות'],
        ['מה לא אומרים', '"דבר לאט", "תנשום", "תתחיל מחדש"'],
      ]}
      updated="2026-10-24" />

    <SpeechNote className="mt-2" />

    <p className="mx-auto mt-6 max-w-3xl leading-relaxed text-[var(--foreground)]/85">
      אם שמתם לב שהילד שלכם נתקע במילים, חוזר על צלילים או &quot;נתקע&quot; בתחילת משפט — אתם לא לבד, וזה לא בגללכם. גמגום הוא תופעה נפוצה בגיל הגן, ולרוב הילדים הוא חולף. העמוד מסביר מה בדרך כלל חלק מהתפתחות רגילה, מה כדאי לבדוק, ומה אתם יכולים לעשות כבר היום כדי שלילד יהיה קל ונעים יותר לדבר.
    </p>

    <OnThisPage items={[['what', 'מה זה גמגום'], ['compare', 'רגיל או גמגום?'], ['numbers', 'התחלה והחלמה'], ['refer', 'מתי לפנות'], ['home', 'מה עוזר בבית'], ['myths', 'מיתוסים'], ['teachers', 'לגננת ולמורה'], ['treatment', 'טיפול'], ['print', 'טיפים להדפסה'], ['sources', 'מקורות']]} />

    <Section id="what" title="מה זה גמגום?">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
        <p>גמגום הוא הפרעה ברצף של הדיבור: הילד יודע מה הוא רוצה להגיד, אבל המילים לא יוצאות בזרימה. יש שלושה סוגים עיקריים של &quot;שיבושי שטף&quot; שמאפיינים גמגום:</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ['🔁', 'חזרות', 'על צליל או על הברה, בדרך כלל בתחילת מילה: "ב־ב־ב־בובה", "גו־גו־גו־גורה".'],
            ['〰️', 'הארכות', 'צליל אחד נמתח: "ממממממים", "סססססבון".'],
            ['⛔', 'חסימות', '"תקיעה": הפה מוכן למילה אבל הקול לא יוצא, לפעמים עם מתח נראה לעין.'],
          ].map(([e, t, d]) => <article key={t} className="rounded-xl bg-[var(--postit)] p-3">
            <h3 className="text-lg font-black"><span aria-hidden="true">{e} </span>{t}</h3>
            <p className="mt-1">{d}</p>
          </article>)}
        </div>
        <p className="mt-3">לפעמים מצטרפות התנהגויות נוספות, כמו מצמוץ, תנועת ראש או מאמץ בפנים, שהילד עושה כדי &quot;לשחרר&quot; את המילה. הגמגום משתנה מיום ליום וממצב למצב: יש ימים כמעט בלי, וימים קשים יותר — וזה חלק מהתופעה.</p>
      </div>
    </Section>

    <Section id="compare" title="היסוסים רגילים או גמגום?" intro="כמעט כל הילדים בגיל 2–5 מהססים, חוזרים על מילים ומתקנים את עצמם — במיוחד בתקופה שבה השפה מתפתחת מהר. הטבלה מציגה את ההבדלים העיקריים כפי שהם מתוארים ב־ASHA.">
      <div className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-3 text-center font-bold">
        <span aria-hidden="true">⚠️ </span>הטבלה עוזרת להבין, אבל היא <u>לא כלי אבחון</u>. גם ילדים שמגמגמים מהססים לפעמים בדרך הרגילה, וההבחנה נעשית על ידי קלינאי/ת תקשורת לפי התמונה הכללית.
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl border-2 border-[var(--border)] bg-white">
        <table className="w-full border-collapse text-right">
          <caption className="sr-only">השוואה בין היסוסים רגילים בגיל הגן לסימנים שכדאי לבדוק</caption>
          <thead><tr className="bg-[var(--muted)]/30">
            <th scope="col" className="p-2 sm:p-3">&nbsp;</th>
            <th scope="col" className="p-2 sm:p-3"><span aria-hidden="true">🙂 </span>בדרך כלל חלק מהתפתחות רגילה</th>
            <th scope="col" className="p-2 sm:p-3"><span aria-hidden="true">🔎 </span>כדאי לבדוק עם קלינאי/ת תקשורת</th>
          </tr></thead>
          <tbody>{COMPARE_ROWS.map(r => <tr key={r.topic} className="border-t border-[var(--border)] align-top">
            <th scope="row" className="p-2 font-black sm:p-3">{r.topic}</th>
            <td className="p-2 leading-relaxed sm:p-3">{r.typical}</td>
            <td className="bg-amber-50/60 p-2 leading-relaxed sm:p-3">{r.check}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-[var(--foreground)]/75">חזרה על מילה קצרה של הברה אחת (&quot;לא־לא־לא&quot;, &quot;גם־גם&quot;) נמצאת באמצע: היא יכולה להיות חלק מהתפתחות רגילה וגם חלק מגמגום. כאן במיוחד חשובים המתח, התדירות ותגובת הילד.</p>
    </Section>

    <Section id="numbers" title="מתי גמגום מתחיל, וכמה ילדים מפסיקים לגמגם?">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['🎂', 'גיל ההתחלה', 'גמגום מתחיל בדרך כלל בין גיל שנתיים לחמש, לעיתים בהדרגה ולעיתים בבת אחת. בתוכנית המחקר של אוניברסיטת אילינוי (יאירי ואמברוז) אצל כ־65% מהילדים הגמגום התחיל לפני גיל 3, ואצל כ־85% — עד גיל 3.5. רוב הסיכון להתחלת גמגום חולף עד גיל 5 בערך.'],
          ['👧👦', 'כמה ילדים', 'לפי ההערכה המקובלת כ־5% מהילדים עוברים תקופה של גמגום. סקירה של יאירי ואמברוז (2013) מראה שייתכן שהשיעור אף גבוה מזה — כלומר זו תופעה נפוצה מאוד.'],
          ['🌱', 'החלמה טבעית', 'רוב הילדים מפסיקים לגמגם: לפי ה־Stuttering Foundation בין 75% ל־80% בתוך 12–24 חודשים, גם בלי טיפול. במחקר המעקב של יאירי ואמברוז (1999) נמצאה החלמה אצל כ־74% מהילדים.'],
          ['⚖️', 'מי ממשיך לגמגם', 'בתחילת הדרך מספר הבנים והבנות קרוב, אבל בנים ממשיכים לגמגם יותר: בגיל בית הספר יש פי 3–4 בנים מגמגמים. הסיכוי שהגמגום יימשך גבוה יותר כשיש היסטוריה משפחתית, כשהוא התחיל מאוחר וכשהוא נמשך זמן רב.'],
        ].map(([e, t, d]) => <article key={t} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-lg font-black"><span aria-hidden="true">{e} </span>{t}</h3>
          <p className="mt-1 leading-relaxed">{d}</p>
        </article>)}
      </div>
      <p className="mt-3 rounded-xl bg-[var(--postit)] p-3 leading-relaxed">המספרים מעודדים, אבל הם מדברים על קבוצות ולא על ילד מסוים. <b>אי אפשר לדעת מראש מי יפסיק לגמגם לבד</b> — ולכן כשיש סימני סיכון, לא מחכים.</p>
    </Section>

    <Section id="refer" title="מתי לפנות לקלינאית תקשורת בגלל גמגום?" intro="אלה הסימנים שה־Stuttering Foundation ו־ASHA מציינים כסיבה טובה להערכה. מספיק סימן אחד כדי לשאול.">
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border-2 border-amber-500 bg-amber-50 p-4">
          <h3 className="text-lg font-black"><span aria-hidden="true">🔎 </span>כדאי לפנות אם…</h3>
          <Bullets className="mt-2" items={REFER_SIGNS} />
        </article>
        <article className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
          <h3 className="text-lg font-black">למי פונים?</h3>
          <p className="mt-1">אפשר להתחיל ברופא/ת הילדים, שיכולים להפנות להערכה — בקופות החולים בדרך כלל דרך המכון להתפתחות הילד — או לפנות ישירות לקלינאי/ת תקשורת. כדאי לשאול אם יש לה ניסיון בטיפול בגמגום בגיל הגן.</p>
          <p className="mt-2">לפגישה כדאי להביא <b>סרטון קצר מהבית</b>: לפעמים דווקא בפגישה הילד מדבר בשטף, והסרטון עוזר לקלינאית לראות את מה שאתם רואים.</p>
          <p className="mt-2">הערכה אינה &quot;מסמנת&quot; את הילד. לפעמים היא מרגיעה, ולפעמים היא נותנת לכם כלים מוקדם — וגם זה טוב.</p>
        </article>
      </div>
    </Section>

    <Section id="home" title="איך לעזור לילד שמגמגם בבית" intro="אין צורך ב&quot;תרגילים&quot;. מה שעוזר הוא בעיקר האופן שבו המבוגרים מדברים ומקשיבים. אלה ההמלצות של ה־Stuttering Foundation ו־ASHA להורים לילדים בגיל הגן:">
      <div className="grid gap-3 sm:grid-cols-2">
        {HOME_TIPS.map(t => <article key={t.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-lg font-black"><span aria-hidden="true">{t.icon} </span>{t.title}</h3>
          <p className="mt-1 leading-relaxed">{t.text}</p>
        </article>)}
      </div>
      <article className="mt-4 rounded-2xl border-2 border-amber-500 bg-amber-50 p-4">
        <h3 className="text-lg font-black"><span aria-hidden="true">🚫 </span>מה עדיף לא לומר ולא לעשות</h3>
        <Bullets className="mt-2" items={AVOID} />
        <p className="mt-2 text-sm text-[var(--foreground)]/80">גם כשהכוונה טובה, משפטים כאלה מוסיפים לילד מתח ומלמדים אותו שהדיבור שלו &quot;לא בסדר&quot;. ואם זה כבר קרה — זה בסדר. כל ההורים אומרים דברים כאלה לפעמים. מה שחשוב הוא האווירה הכללית לאורך זמן.</p>
      </article>
    </Section>

    <Section id="myths" title="מיתוסים ועובדות על גמגום">
      <div className="grid gap-3 sm:grid-cols-2">
        {MYTHS.map(m => <article key={m.myth} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
          <h3 className="text-lg font-black"><span aria-hidden="true">❌ </span>&quot;{m.myth}&quot;</h3>
          <p className="mt-1 leading-relaxed"><span aria-hidden="true">✅ </span>{m.fact}</p>
        </article>)}
      </div>
    </Section>

    <Section id="teachers" title="לגננת ולמורה: ילד שמגמגם בגן ובכיתה" intro="הצוות החינוכי יכול לעשות הבדל גדול. ההמלצות מבוססות על חוברת ה־Stuttering Foundation למורים (Notes to the Teacher):">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
        <Bullets items={TEACHER_TIPS} />
      </div>
      <p className="mt-3 leading-relaxed"><b>קריאה בקול:</b> ילדים רבים שמגמגמים קוראים בקלות רבה יותר כשהם קוראים יחד עם מישהו — בזוגות או במקהלה. ילדים אחרים מעדיפים לקרוא לבד, אחרי תרגול בבית. במקום לדלג על הילד או לחייב אותו, שואלים אותו בפרטיות מה נוח לו.</p>
    </Section>

    <Section id="treatment" title="איך מטפלים בגמגום בגיל הגן?">
      <div className="rounded-2xl border-2 border-[var(--border)] bg-white p-4 leading-relaxed">
        <p>לפי ASHA, ילדים עם סימני גמגום שלא מקבלים התערבות נוטים יותר להמשיך לגמגם — ולכן מומלץ להעריך מוקדם. ההחלטה אם לטפל, מתי ואיך מתקבלת יחד עם קלינאי/ת תקשורת, לפי הילד והמשפחה. יש כמה גישות טיפול לגיל הגן, ובכולן להורים יש תפקיד מרכזי.</p>
        <p className="mt-2"><b>תוכנית לידקום (Lidcombe)</b> היא אחת הגישות שנחקרו הכי הרבה. ההורה מתרגל עם הילד בבית, בשיחות קצרות ומשחקיות, בהדרכה שבועית של קלינאית: משבחים דיבור שוטף, ולפעמים, בעדינות, מתייחסים לגמגום. במחקר מבוקר (Jones ושות׳, BMJ 2005) נמצא אצל ילדים בני 3–6 שקיבלו את התוכנית פחות גמגום אחרי 9 חודשים מאשר אצל ילדים שלא קיבלו אותה.</p>
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm"><b>חשוב:</b> תוכניות כאלה עושים רק בליווי קלינאית שהוכשרה בהן. אל תנסו &quot;לתקן&quot; את הגמגום לבד לפי מה שקראתם — בלי הדרכה זה עלול להוסיף לחץ. מה שכן אפשר לעשות לבד הוא כל מה שמופיע בפרק &quot;מה עוזר בבית&quot;.</p>
        <p className="mt-2">תמיכה, מידע ומפגשים להורים ולאנשים שמגמגמים יש באמב״י — ארגון האנשים שמגמגמים בישראל (פרטים ב<a href="https://www.kolzchut.org.il/he/%D7%90%D7%9E%D7%91%22%D7%99_-_%D7%90%D7%A8%D7%92%D7%95%D7%9F_%D7%9E%D7%92%D7%9E%D7%92%D7%9E%D7%99%D7%9D_%D7%91%D7%99%D7%A9%D7%A8%D7%90%D7%9C" target="_blank" rel="noopener noreferrer" className="font-bold underline">כל זכות</a>).</p>
      </div>
    </Section>

    <Section id="print" title="טיפים להדפסה: להורים ולגננת/מורה" intro="דף A4 אחד לכל קהל — לתלות על המקרר, לתת לסבא ולסבתא, או להביא לגננת בתחילת השנה. אפשר להדפיס או לשמור כ־PDF.">
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] p-4">
          <h3 className="text-lg font-black"><span aria-hidden="true">🏡 </span>טיפים להורים</h3>
          <p className="mt-1 leading-relaxed">מה עוזר בבית, מה עדיף לא לומר, ומתי לפנות לקלינאית.</p>
          <button type="button" onClick={() => setPrinting('parents')} className="mt-3 min-h-[48px] rounded-xl bg-red-500 px-5 py-2 text-lg font-bold text-white">🖨️ דף טיפים להורים</button>
        </article>
        <article className="rounded-2xl border-2 border-[var(--border)] bg-[var(--postit)] p-4">
          <h3 className="text-lg font-black"><span aria-hidden="true">🏫 </span>טיפים לגננת ולמורה</h3>
          <p className="mt-1 leading-relaxed">איך להגיב בכיתה, קריאה בקול, לעג, ומתי לשתף את ההורים.</p>
          <button type="button" onClick={() => setPrinting('teacher')} className="mt-3 min-h-[48px] rounded-xl bg-red-500 px-5 py-2 text-lg font-bold text-white">🖨️ דף טיפים לצוות</button>
        </article>
      </div>
      <div className="mt-3 text-center">
        <button type="button" onClick={() => setPrinting('both')} className="min-h-[48px] wobbly-sm border-2 border-[var(--border)] bg-white px-4 py-2 font-bold hover:bg-[var(--muted)]/30">שני הדפים יחד (2 עמודים)</button>
      </div>
    </Section>

    <Section id="more" title="עוד בנושא">
      <p className="leading-relaxed">רוצים לדעת מה מצופה בדיבור ובשפה בכל גיל? ב<Link to="/speech/parents/language-milestones" className="font-bold underline">התפתחות שפה ודיבור לפי גיל</Link> יש טווחים, סימנים להתייעצות ורעיונות לבית. ב<Link to="/speech/parents/sound-acquisition" className="font-bold underline">טבלת גיל רכישת הצלילים</Link> אפשר לבדוק באיזה גיל ילדים אומרים ר, ש או ס, ובמרכז <Link to="/speech" className="font-bold underline">קלינאות התקשורת</Link> יש עוד חומרים לתרגול משחקי.</p>
    </Section>

    <div className="mt-12">
      <SeoBody
        paragraphs={[
          'גמגום אצל ילדים מתחיל בדרך כלל בגיל הגן, בין שנתיים לחמש, ולעיתים קרובות בתקופה שבה השפה מתפתחת מהר. גמגום בגיל 3 הוא תופעה נפוצה, ורוב הילדים מפסיקים לגמגם בתוך שנה־שנתיים. ובכל זאת, כשהגמגום נמשך יותר מחצי שנה, כשיש היסטוריה משפחתית, כשרואים מאמץ או כשהילד מתוסכל — כדאי לפנות לקלינאית תקשורת. טיפול מוקדם בגיל הגן נמצא יעיל.',
          'העמוד מיועד להורים, לסבים ולסבתות ולצוותי גן ובית ספר שרוצים לדעת איך לעזור לילד שמגמגם: איך להגיב, מה לא לומר, ואיך לבנות סביבה רגועה שבה נעים לדבר. הוא אינו מחליף הערכה או טיפול של קלינאי/ת תקשורת.',
        ]}
        faq={FAQ}
        related={[
          { label: 'התפתחות שפה ודיבור לפי גיל', href: '/speech/parents/language-milestones' },
          { label: 'גיל רכישת הצלילים בעברית', href: '/speech/parents/sound-acquisition' },
          { label: 'קלינאות תקשורת — כל החומרים', href: '/speech' },
          { label: 'תרגול שפה לגן', href: '/speech/language' },
          { label: 'פעילויות לפעוטות', href: '/toddlers' },
        ]} />
    </div>

    <Sources list={STUTTER_SOURCES} note="התוכן נכתב על בסיס המקורות האלה. המספרים מעוגלים ומתייחסים לקבוצות של ילדים, לא לילד מסוים." />

    {printing && <PrintPreview title={printTitle} onClose={() => setPrinting(null)}>
      {sheets.map(s => s === 'teacher' ? <TeacherSheet key={s} /> : <ParentSheet key={s} />)}
    </PrintPreview>}
  </div>
}

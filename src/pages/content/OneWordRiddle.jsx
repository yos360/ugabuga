import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import SeoBody from '../../components/ui/SeoBody'
import { ONE_WORD_LEVELS, ONE_WORD_PATH } from '../../data/oneWordRiddle'
import { shareLink, shareOnFacebook, shareOnWhatsApp } from '../../utils/share'
import { Chip, Header } from './contentUi'

// /riddles/one-word: the five proverbs of the "מילה אחת" reel. A word is written to the page only once it is
// revealed, so a hidden answer never shows up in the page's text. Tiles keep the word's width, as in the reel.
const CAMPAIGN = 'one_word'
const shareText = () => `מילה אחת. פתגם שלם. 🤯\nבכל שלב רואים רק מילה אחת מהפתגם. עד איזה שלב תגיעו?\n${shareLink(ONE_WORD_PATH, CAMPAIGN)}`

function Share({ title }) {
  return (
    <div className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5 text-center">
      <p className="font-display text-2xl font-bold">{title}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <WobblyButton variant="green" onClick={() => shareOnWhatsApp(shareText())}>📣 שליחה בוואטסאפ</WobblyButton>
        <WobblyButton variant="outline" onClick={() => shareOnFacebook(ONE_WORD_PATH, CAMPAIGN)}>שיתוף בפייסבוק</WobblyButton>
      </div>
    </div>
  )
}

function Level({ level, index }) {
  const hidden = level.words.map((_, i) => i).filter(i => i !== level.shown)
  const [hints, setHints] = useState(0)
  const open = new Set([level.shown, ...hidden.slice(0, hints)])
  const solved = hints >= hidden.length
  return (
    <section id={`level-${index + 1}`} className="scroll-mt-24" aria-label={`שלב ${index + 1}: ${level.label}`}>
      <WobblyCard hover={false} padding="p-5">
        <h2 className="text-center font-hand text-2xl font-bold">שלב {index + 1}: {level.label}</h2>
        <div dir="rtl" className="mt-4 flex flex-wrap justify-center gap-2">
          {level.words.map((w, i) => (
            <span key={i} style={{ minWidth: `${w.length + 1.5}ch` }} className={`flex min-h-[52px] items-center justify-center rounded-xl border-2 border-slate-800 px-2 text-2xl font-bold ${i === level.shown ? 'bg-[var(--postit)]' : open.has(i) ? 'bg-green-50' : 'bg-slate-100'}`}>
              {open.has(i) ? w : ' '}
            </span>
          ))}
        </div>
        {solved
          ? <p className="mt-4 rounded-xl bg-green-50 p-3 text-center text-lg leading-relaxed"><b>✅ {level.words.join(' ')}</b><br />{level.meaning}</p>
          : <div className="mt-4 flex flex-wrap justify-center gap-2">
              <WobblyButton variant="outline" onClick={() => setHints(hints + 1)}>💡 עוד מילה</WobblyButton>
              <WobblyButton onClick={() => setHints(hidden.length)}>👀 הצגת הפתרון</WobblyButton>
            </div>}
      </WobblyCard>
    </section>
  )
}

export default function OneWordRiddle() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title="חידת מילה אחת: מזהים פתגם ממילה אחת? עם פתרון" description="חמישה פתגמים ובכל אחד רואים רק מילה אחת. מהקל ועד 'רק לאלופים': כל שלב עם רמזים, הפתרון בלחיצה והסבר קצר. שלחו למי שתמיד יודע הכול." path={ONE_WORD_PATH} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חידות', href: '/tools/riddles' }, { label: 'מילה אחת' }]} />
      <Header emoji="🤯" title="מילה אחת. פתגם שלם." intro="בכל שלב רואים רק מילה אחת מהפתגם. עד איזה שלב תגיעו?" />
      <p className="mb-5 text-center"><a href="#level-5" className="font-bold underline">באתם מהסרטון? הפתרון של שלב 5 כאן ←</a></p>
      <div className="space-y-4">
        {ONE_WORD_LEVELS.map((l, i) => <Level key={i} level={l} index={i} />)}
      </div>
      <div className="mt-6">
        <Share title="מי לא יעבור את שלב 5? שלחו להם" />
      </div>
      <nav className="mt-6 flex flex-wrap justify-center gap-2" aria-label="עוד חידות">
        <Chip to="/riddles/daily" hl>🧠 החידה היומית</Chip>
        <Chip to="/tools/riddles">מאגר החידות</Chip>
        <Chip to="/riddles/topics">חידות לפי נושא</Chip>
        <Chip to="/trick-questions">שאלות מכשילות</Chip>
      </nav>
      <div className="mt-10">
        <SeoBody paragraphs={[
          'חידת מילה אחת היא משחק פתגמים לכל המשפחה ולכיתה: כל ריבוע הוא מילה, ורק מילה אחת גלויה. מנסים לזהות את הפתגם, ואם נתקעים לוחצים על עוד מילה ומקבלים רמז.',
          'אפשר לשחק הורים מול ילדים, להציג בכיתה על המסך, או לשלוח בוואטסאפ ולראות מי מגיע הכי רחוק. אחרי הפתרון מופיע הסבר קצר למשמעות של הפתגם.',
        ]} related={[{ href: '/riddles/daily', label: 'החידה היומית' }, { href: '/tools/riddles', label: 'מאגר החידות' }, { href: '/trick-questions', label: 'שאלות מכשילות' }]} />
      </div>
    </div>
  )
}

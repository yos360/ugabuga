import { Certificate, ChoicePage, Cover, FillPage, Head, MatchPage, Pic, SvgPage, AnswerKey } from './kit'
import { bookletBySlug } from './registry'
import { VOWELS, syllable } from './nikudData'

// "חוברת תנועות וניקוד" — one page for each vowel: six letters with the vowel under them and a picture of a
// word that starts with that letter and vowel, then syllables to read, a matching page and a choice page.
const PAGES = bookletBySlug('nikud').pages
const FONT = 'Heebo, Arial, sans-serif'

function VowelPage({ n, vowel }) {
  const { name, mark, sound, vav, words } = vowel
  return <SvgPage label={`תנועה: ${name}`}>
    <Head n={n} title={`התנועה ${name}`} instruction={`היא נשמעת כמו ${sound}. קוראים כל הברה ואת המילה שמתחת`} />
    <g fontFamily={FONT} textAnchor="middle" fill="#111">
      <text x="300" y="168" fontSize="64" fontWeight="800">{vav ? mark : `◌${mark}`}</text>
      {words.map(([word, emoji], i) => {
        const cx = 500 - (i % 3) * 200, top = i < 3 ? 195 : 490
        return <g key={word}>
          <rect x={cx - 85} y={top} width="170" height="270" rx="16" fill="none" stroke="#9aa5b5" strokeWidth="2" />
          <text x={cx} y={top + 85} fontSize="78" fontWeight="800">{syllable(word, vav)}</text>
          <Pic item={{ emoji }} x={cx} y={top + 160} size={90} />
          <text x={cx} y={top + 242} fontSize="28" fontWeight="700" direction="rtl">{word}</text>
        </g>
      })}
    </g>
  </SvgPage>
}

const ROWS = 'למנרסזה'
const SYLLABLE_LINES = [...ROWS].map(l => ['ַ', 'ָ', 'ֵ', 'ֶ', 'ִ', 'ֹ'].map(m => l + m).concat(l + 'וּ').join('   '))
const MATCH = [['בָּ', '🎈'], ['דַּ', '🐟'], ['לֵ', '❤️'], ['דֶּ', '🚪'], ['פִּ', '🐘'], ['סוֹ', '🐴']]
const CHOICE = [
  { pic: '🎈', options: ['בִּ', 'בָּ', 'בּוּ'], answer: 'בָּ' }, { pic: '🐟', options: ['דַּ', 'דִּ', 'דֹּ'], answer: 'דַּ' },
  { pic: '❤️', options: ['לוּ', 'לִ', 'לֵ'], answer: 'לֵ' }, { pic: '🐕', options: ['כֹּ', 'כּוּ', 'כֶּ'], answer: 'כֶּ' },
  { pic: '🐘', options: ['פָּ', 'פִּ', 'פֹּ'], answer: 'פִּ' }, { pic: '🐴', options: ['סוּ', 'סִ', 'סוֹ'], answer: 'סוֹ' },
]

export default function NikudBooklet({ seed }) {
  return <>
    <Cover emoji="🔤✨" title="חוברת תנועות וניקוד" subtitle="עמוד לכל תנועה: אות, ניקוד ותמונה של מילה שמתחילה בהן" pages={PAGES}
      note="כל התנועות בעברית מופיעות כאן. פַּתָח וקָמָץ נשמעות אותו דבר (אַ), וגם צֵירֶה וסֶגּוֹל (אֵ). שׁוּרוּק וקֻבּוּץ נשמעות אוּ — בעמוד שׁוּרוּק כל המילים נפתחות באות עם וּ. כדאי לקרוא כל הברה בקול, ואחר כך את המילה כולה." />
    {VOWELS.map((v, i) => <VowelPage key={v.key} n={i + 2} vowel={v} />)}
    <FillPage n={9} title="קוראים הברות" instruction="קוראים בקול כל שורה — אותה אות עם כל התנועות" lines={SYLLABLE_LINES} size={30} />
    <MatchPage n={10} title="מתאימים הברה לתמונה" instruction="מושכים קו מההברה לתמונה שהמילה שלה מתחילה בה" pairs={MATCH.map(([s, e]) => [{ text: s }, { emoji: e }])} seed={seed} />
    <ChoicePage n={11} title="באיזו הברה מתחילה המילה?" instruction="מקיפים את ההברה הנכונה" items={CHOICE.map(c => ({ pic: { emoji: c.pic }, options: c.options }))} />
    <AnswerKey n={12} sections={[
      { title: 'עמוד 10 — התאמה', answers: MATCH.map(([s, e]) => `${s} ← ${e}`) },
      { title: 'עמוד 11 — באיזו הברה מתחילה המילה', answers: CHOICE.map(c => `${c.pic} ${c.answer}`) },
    ]} />
    <Certificate booklet="חוברת התנועות" done="קראתי את כל התנועות, הברות ומילים עם ניקוד." cheer="כל הכבוד, קורא/ת מצוין/ת!" />
  </>
}

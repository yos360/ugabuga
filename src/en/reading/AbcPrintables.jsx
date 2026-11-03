import { useState } from 'react'
import PrintableShell, { Choice, Sheet } from '../../components/printables/PrintableShell'
import FlashcardSheet, { PER_SHEET } from '../../components/letters/FlashcardSheet'
import { LetterSheet } from '../../components/ui/HebrewTracing'
import { ENGLISH } from '../../data/letterLearning'
import { ABC_ROOT } from './abcMeta'
import './reading.css'

// Three printable ABC pages: tracing sheets, picture flashcards and handwriting lines (English only).
const ALL = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
const SIBLINGS = [
  { href: `${ABC_ROOT}/tracing`, label: '✏️ Tracing sheets' },
  { href: `${ABC_ROOT}/flashcards`, label: '🃏 Flashcards' },
  { href: `${ABC_ROOT}/handwriting-lines`, label: '📝 Handwriting lines' },
]
const RELATED = [{ label: 'Learn the ABC', href: ABC_ROOT }, { label: 'First words with pictures', href: '/en/words' }, { label: 'Reading practice', href: '/en/reading' }]
const common = { lang: 'en', crumbs: [{ label: 'ABC', href: ABC_ROOT }], siblings: SIBLINGS, related: RELATED }

function Tracing() {
  const [pick, setPick] = useState('all')
  const letters = pick === 'all' ? ALL : [pick]
  return <PrintableShell {...common} path={`${ABC_ROOT}/tracing`} counterpartPath="/printables/abc-letters" emoji="✏️"
    seoTitle="Printable ABC letter tracing sheets A to Z"
    description="Free printable tracing sheets for every letter A-Z: a big letter to trace, capital and small letters on handwriting lines, and a letter to color."
    h1="ABC letter tracing sheets" sub="One A4 page for each letter, in black and white"
    controls={<Choice label="Letters to print" value={pick} onChange={setPick} options={[['all', 'All 26 letters'], ...ALL.map(L => [L, `${L}${L.toLowerCase()}`])]} />}
    pages={letters.map(L => ({ key: L, svg: <LetterSheet letter={L} lang="en" /> }))}
    printTitle={pick === 'all' ? 'ABC tracing sheets A-Z' : `Trace the letter ${pick}${pick.toLowerCase()}`}
    paragraphs={[
      'Tracing helps young hands learn how each letter is formed. Every sheet has a big letter to trace with a finger and then a pencil, a line of capital letters and a line of small letters on handwriting lines, and a large outline to color.',
      'Print all 26 letters for a full set, or choose one letter to practice the one your child finds hardest. Printing in black and white keeps the sheets cheap, and the colored letter makes a nice reward at the end.',
      'Tip: say the letter name and its sound out loud each time you trace it. Start at the top, and let your child take their time. Neat and slow is better than fast.',
    ]}
    faq={[
      { q: 'What is on each sheet?', a: 'A big letter to trace, a line of capital letters, a line of small letters on handwriting lines with a dashed middle line, and a letter to color.' },
      { q: 'What age are these for?', a: 'They suit ages 4 to 7, when children are learning to form letters. Older children who need practice can use them too.' },
      { q: 'Are the sheets free?', a: 'Yes. Print or save them as PDF, free and with no sign-up.' },
    ]} />
}

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))
const cards = ENGLISH.map(x => ({ l: x.l, sub: x.lower, emoji: x.emoji, word: x.word, dir: 'ltr' }))

function Flashcards() {
  const [style, setStyle] = useState('full')
  const [color, setColor] = useState('color')
  const pages = chunk(cards, PER_SHEET)
  const title = 'ABC letter flashcards'
  return <PrintableShell {...common} path={`${ABC_ROOT}/flashcards`} counterpartPath="/printables/letter-flashcards" emoji="🃏"
    seoTitle="Printable ABC letter flashcards with pictures"
    description="Free printable alphabet flashcards: capital and small letters with a picture and a word, eight cards to an A4 page, in color or black and white."
    h1="ABC letter flashcards" sub="26 cards with a picture and a word · 8 cards to a page" wide
    controls={<>
      <Choice label="Card style" value={style} onChange={setStyle} options={[['full', 'Letter + picture + word'], ['letter', 'Big letter only']]} />
      <Choice label="Color" value={color} onChange={setColor} options={[['color', '🎨 In color'], ['bw', '🖍️ Black and white, to color in']]} />
    </>}
    pages={pages.map((p, i) => ({ key: `${style}${color}${i}`, svg: <FlashcardSheet lang="en" cards={p} title={`${title} - page ${i + 1}`} style={style} color={color === 'color'} /> }))}
    printTitle={title} printLabel={`Print ${cards.length} flashcards (${pages.length} pages)`}
    paragraphs={[
      'Flashcards link a letter shape to a picture and a word that starts with it. Each card shows the capital and small letter together, such as Aa and Bb, the way children see them at school.',
      'Print on thick paper or glue the sheets to card so they last through many games. In the black-and-white version, children can color the cards in before you cut them out.',
      'Games to play: turn the cards face down and find a match for a letter you call out; put the cards in alphabet order; or draw a card and think of another word that starts with the same letter.',
    ]}
    faq={[
      { q: 'How many cards are there?', a: 'There are 26 cards, one per letter, with eight cards on each A4 page. That makes four pages.' },
      { q: 'Can I print black and white?', a: 'Yes. Choose the black-and-white option and children can color the cards themselves.' },
      { q: 'What can we play?', a: 'Memory, "find the letter", putting the letters in order, and "what else starts with this letter?" all work well.' },
    ]} />
}

const W = 180, H = 236, TOP = 12
function LinesSheet({ big }) {
  const g = [], x = big ? 7 : 5, gap = big ? 9 : 6
  const line = (x1, y1, x2, y2, stroke, w, dash) => g.push(<line key={g.length} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={w} strokeDasharray={dash} />)
  g.push(<text key="name" x={16} y={7} fontSize={4} textAnchor="start" fill="#555">Name: ____________________</text>)
  g.push(<text key="date" x={W - 1} y={7} fontSize={4} textAnchor="end" fill="#555">Date: ____________</text>)
  line(12, TOP, 12, H, '#bd6464', 0.3)
  for (let y = TOP + 6; y + 3 * x <= H; y += 3 * x + gap) {
    line(16, y, W, y, '#70859b', 0.3)
    line(16, y + x, W, y + x, '#70859b', 0.25, '1.5 1.2')
    line(16, y + 2 * x, W, y + 2 * x, '#333', 0.4)
    line(16, y + 3 * x, W, y + 3 * x, '#70859b', 0.25)
  }
  return <Sheet w={W} h={H} label="Handwriting lines">{g}</Sheet>
}

function HandwritingLines() {
  const [size, setSize] = useState('big')
  return <PrintableShell {...common} path={`${ABC_ROOT}/handwriting-lines`} counterpartPath="/printables/english-lines" emoji="📝"
    seoTitle="Printable handwriting lines for English"
    description="Free printable handwriting paper with four guide lines and a dashed middle line, in wide or regular size, for practicing capital and small letters."
    h1="Handwriting lines for English" sub="Four guide lines with a dashed middle line"
    controls={<Choice label="Line size" value={size} onChange={setSize} options={[['big', 'Wide, for beginners'], ['normal', 'Regular']]} />}
    pages={[{ key: size, svg: <LinesSheet big={size === 'big'} /> }]}
    extra={<p className="text-sm text-[var(--muted-foreground)]">Tip: in the print window choose "actual size" (100%) so the lines keep their spacing.</p>}
    paragraphs={[
      'The hardest part of writing English letters is getting the height right. Capital letters and tall letters such as b, d, h and l reach the top line. Small letters such as a, c, e and o reach only the dashed middle line. Letters such as g, j, p, q and y drop below the heavy base line.',
      'Each row on this sheet has four guide lines: a top line, a dashed middle line, a heavy base line and a bottom line for letters that hang down. There is a margin on the left, and a place for a name and date at the top.',
      'Start with the wide lines. When letters sit neatly on the base line and stop at the right height, move on to the regular size.',
    ]}
    faq={[
      { q: 'Where do the small letters stop?', a: 'Letters like a, c, e and o reach the dashed middle line. Letters with a tall stem, such as b, d, h and l, reach the top line. Letters such as g, j, p, q and y go down below the heavy base line.' },
      { q: 'How do I keep the line spacing exact?', a: 'In the print window choose "actual size" or 100%, not "fit to page".' },
    ]} />
}

export default function AbcPrintables({ kind }) {
  return kind === 'flashcards' ? <Flashcards /> : kind === 'handwriting' ? <HandwritingLines /> : <Tracing />
}

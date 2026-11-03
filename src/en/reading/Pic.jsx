import { emojiFile } from '../../data/englishWords'

// A word's picture: vector emoji art (sharp on screen and on paper), or big text for numbers and days.
export default function Pic({ word, size = 72, eager = false }) {
  if (word.text) return <span style={{ fontSize: size * 0.8, lineHeight: 1, fontWeight: 900, color: '#1e1b4b' }}>{word.text}</span>
  return <img src={`/print-art/words/${emojiFile(word.emoji)}.svg`} alt="" width={size} height={size} style={{ width: size, height: size }} loading={eager ? 'eager' : 'lazy'} decoding="async" />
}

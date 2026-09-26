import { ChessPlay, ChessLearn } from './Chess'
import '../boardgames.css'

export default function ChessModule({ tab, onPlay }) {
  return tab === 'learn' ? <ChessLearn onPlay={onPlay} /> : <ChessPlay />
}

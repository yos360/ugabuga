import { CheckersPlay, CheckersLearn } from './Checkers'
import '../boardgames.css'

export default function CheckersModule({ tab, onPlay }) {
  return tab === 'learn' ? <CheckersLearn onPlay={onPlay} /> : <CheckersPlay />
}

import { BackgammonPlay, BackgammonLearn } from './Backgammon'
import '../boardgames.css'

export default function BackgammonModule({ tab, onPlay }) {
  return tab === 'learn' ? <BackgammonLearn onPlay={onPlay} /> : <BackgammonPlay />
}

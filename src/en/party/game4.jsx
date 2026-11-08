import PartyGame from './PartyGame'
import { PARTY_4 } from './content/party4'

// Party games whose text lives in content/party4.js (one chunk per part, so a game page loads a quarter of the text).
export default function PartyGame4(props) { return <PartyGame {...props} data={PARTY_4} /> }

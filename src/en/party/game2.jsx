import PartyGame from './PartyGame'
import { PARTY_2 } from './content/party2'

// Party games whose text lives in content/party2.js (one chunk per part, so a game page loads a quarter of the text).
export default function PartyGame2(props) { return <PartyGame {...props} data={PARTY_2} /> }

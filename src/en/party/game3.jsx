import PartyGame from './PartyGame'
import { PARTY_3 } from './content/party3'

// Party games whose text lives in content/party3.js (one chunk per part, so a game page loads a quarter of the text).
export default function PartyGame3(props) { return <PartyGame {...props} data={PARTY_3} /> }

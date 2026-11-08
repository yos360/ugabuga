import PartyGame from './PartyGame'
import { PARTY_1 } from './content/party1'

// Party games whose text lives in content/party1.js (one chunk per part, so a game page loads a quarter of the text).
export default function PartyGame1(props) { return <PartyGame {...props} data={PARTY_1} /> }

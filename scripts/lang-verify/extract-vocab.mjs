// Dumps src/data/languages/vocab.js to JSON for vocab.py.
import { LANGS, TOPICS, WORDS } from '../../src/data/languages/vocab.js'
process.stdout.write(JSON.stringify({ LANGS, TOPICS, WORDS }))

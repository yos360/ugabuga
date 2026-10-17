import { bugaPediaSearchTerms, findBugaPediaKnowledge } from '../data/bugapediaKnowledge.js'
import { checkBugaPediaQuery, filterSafeResults } from './bugapediaSafety.js'

const HEBREW_WIKIPEDIA = 'https://he.wikipedia.org/w/api.php'
const ENGLISH_WIKIPEDIA = 'https://en.wikipedia.org/w/api.php'
const HEBREW_WIKTIONARY = 'https://he.wiktionary.org/w/api.php'
const WIKIDATA = 'https://www.wikidata.org/w/api.php'

const cleanText = value => String(value || '').replace(/\s+/g, ' ').trim()
const lower = value => cleanText(value).toLocaleLowerCase('he-IL')
const coreTerm = value => lower(value).replace(/[\u0591-\u05C7]/g, '').replace(/^ה(?=[א-ת]{3,}$)/u, '')

const QUESTION_PREFIX = /^(?:כמה|מה)\s+(?:זה|יוצא|הם|יהיה|שווה)\s*/u
const WORD_OPERATORS = [[/לחלק\s*ל-?/gu, '/'], [/חלקי/gu, '/'], [/כפול/gu, '*'], [/פלוס/gu, '+'], [/ועוד/gu, '+'], [/פחות/gu, '-']]
const SYMBOLS = { '×': '*', x: '*', '÷': '/' }
const formatNumber = value => new Intl.NumberFormat('he-IL', { maximumFractionDigits: 10 }).format(value)

// Evaluates "a op b op c…" (no parentheses) with * and / before + and -.
function evaluate(tokens) {
  const terms = [Number(tokens[0])]
  const ops = []
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]
    const right = Number(tokens[i + 1])
    if (op === '*') terms.push(terms.pop() * right)
    else if (op === '/') { if (right === 0) return NaN; terms.push(terms.pop() / right) }
    else { ops.push(op); terms.push(right) }
  }
  return ops.reduce((total, op, i) => op === '+' ? total + terms[i + 1] : total - terms[i + 1], terms[0])
}

// Arithmetic only when the WHOLE question is an expression, e.g. "12*3" or "כמה זה 7+5?".
export function calculateBugaPedia(question) {
  let value = lower(question)
  const explicit = QUESTION_PREFIX.test(value)
  value = value.replace(QUESTION_PREFIX, '').replace(/[?？!=]/g, ' ').trim()
  for (const [pattern, symbol] of WORD_OPERATORS) value = value.replace(pattern, ` ${symbol} `)
  value = value.replace(/(\d),(?=\d{3}(?!\d))/g, '$1')
  const percent = value.match(/^(\d+(?:\.\d+)?)\s*(?:%|אחוז(?:ים)?)\s*(?:מתוך|מ-?)\s*(\d+(?:\.\d+)?)$/u)
  if (percent) {
    const result = (Number(percent[1]) / 100) * Number(percent[2])
    return { expression: `${percent[1]}% מתוך ${percent[2]}`, result }
  }
  const compact = value.replace(/\s+/g, '').replace(/[×x÷]/g, symbol => SYMBOLS[symbol])
  if (!/^-?\d+(?:\.\d+)?(?:[+\-*/]-?\d+(?:\.\d+)?)+$/.test(compact)) return null
  // A bare date or year range ("14/5/1948", "1939-1945") is not a calculation unless asked explicitly.
  if (!explicit && (/^\d{1,2}([/.])\d{1,2}\1\d{2,4}$/.test(compact) || /^\d{4}-\d{4}$/.test(compact))) return null
  const tokens = compact.match(/(?<=^|[+\-*/])-?\d+(?:\.\d+)?|[+\-*/]/g)
  const result = evaluate(tokens)
  return Number.isFinite(result) ? { expression: tokens.join(' ').replace(/\*/g, '×').replace(/\//g, '÷'), result } : null
}

function localAnswer(question) {
  const value = lower(question)
  const math = calculateBugaPedia(question)
  if (math) {
    const shown = formatNumber(math.result)
    return { id: `calculation-${math.expression}`, title: `התשובה היא ${shown}`, extract: `${math.expression} = ${shown}. החישוב בוצע ישירות בבוגה־פדיה.`, image: '', verified: true, computed: true, sourceLabel: 'חישוב מדויק' }
  }

  if (/^(איזה יום היום|מה היום|מה התאריך היום|מה התאריך)$/u.test(value.replace(/[?!.,]/g, '').trim())) {
    const now = new Date()
    const fullDate = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    return { id: 'date-today', title: `היום ${fullDate}`, extract: 'התאריך מוצג לפי שעון ישראל.', image: '', verified: true, computed: true, sourceLabel: 'תאריך עדכני · שעון ישראל' }
  }

  return null
}

function englishLookup(question) {
  const words = lower(question).match(/[a-z][a-z'-]*/g) || []
  const ignored = new Set(['what', 'does', 'mean', 'translate', 'the', 'a', 'an', 'in', 'english', 'hebrew'])
  return words.filter(word => !ignored.has(word)).slice(0, 4).join(' ')
}

function isDictionaryQuestion(question) {
  const value = lower(question)
  return /(?:מה\s+(?:הפירוש|פירוש|זה)|איך\s+אומרים|תרג(?:ם|ום)|מילה|משמעות)/u.test(value) || /^[a-z][a-z'-]{1,35}$/i.test(value)
}

async function searchMediaWiki({ api, query, signal, source, sourceLabel, linkLabel, language = 'he', dictionary = false }) {
  const terms = bugaPediaSearchTerms(query)
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '8',
    prop: 'extracts|pageimages|info', explaintext: '1',
    piprop: 'thumbnail', pithumbsize: '400', inprop: 'url',
    redirects: '1', format: 'json', origin: '*', formatversion: '2',
  })
  if (dictionary) params.set('exchars', '850')
  else { params.set('exintro', '1'); params.set('exsentences', '8') }
  const response = await fetch(`${api}?${params}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('network')
  const payload = await response.json()
  return (payload?.query?.pages || [])
    .filter(page => !page.missing && cleanText(page.extract))
    .sort((a, b) => (a.index ?? 999) - (b.index ?? 999))
    .map(page => {
      const title = coreTerm(page.title)
      const body = coreTerm(page.extract)
      const score = terms.reduce((total, term) => {
        const needle = coreTerm(term)
        return total + (title.includes(needle) ? 5 : 0) + (body.includes(needle) ? 1 : 0)
      }, 0)
      return {
        id: `${language}-${page.pageid}`,
        title: page.title,
        extract: cleanText(page.extract),
        url: page.fullurl,
        image: page.thumbnail?.source || '',
        score,
        source,
        sourceLabel,
        linkLabel,
      }
    })
    .filter(page => page.score > 0 || dictionary)
    .sort((a, b) => b.score - a.score)
}

async function searchWikidata(question, signal) {
  const params = new URLSearchParams({ action: 'wbsearchentities', search: question, language: 'he', uselang: 'he', type: 'item', limit: '6', origin: '*', format: 'json' })
  const response = await fetch(`${WIKIDATA}?${params}`, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('network')
  const payload = await response.json()
  return (payload?.search || []).filter(item => item.label && item.description).map(item => ({
    id: `wikidata-${item.id}`,
    title: item.label,
    extract: item.description,
    url: item.concepturi || `https://www.wikidata.org/wiki/${item.id}`,
    image: '',
    source: 'wikidata',
    sourceLabel: 'ויקינתונים',
    linkLabel: 'לפריט המלא בוויקינתונים ↗',
  }))
}

function uniqueResults(groups) {
  const seen = new Set()
  return groups.flat().filter(item => {
    const key = lower(`${item.title}|${item.url || ''}`)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const BUGAPEDIA_MAX_QUERY = 180

export async function searchBugaPedia(question, signal) {
  const query = cleanText(String(question || '').slice(0, BUGAPEDIA_MAX_QUERY))
  if (query.length < 2) throw new Error('short')
  const safety = checkBugaPediaQuery(query)
  if (safety) throw new Error(safety)

  const verified = findBugaPediaKnowledge(query)
  if (verified) return [verified]
  const local = localAnswer(query)
  if (local) return [local]

  const terms = bugaPediaSearchTerms(query)
  const encyclopediaQuery = terms.join(' ') || query
  const dictionaryQuestion = isDictionaryQuestion(query)
  const dictionaryQuery = englishLookup(query) || encyclopediaQuery
  const mostlyEnglish = (query.match(/[a-z]/gi) || []).length > query.length / 3

  const hebrewWikipedia = searchMediaWiki({ api: HEBREW_WIKIPEDIA, query: encyclopediaQuery, signal, source: 'he-wikipedia', sourceLabel: 'ויקיפדיה העברית', linkLabel: 'לערך המלא בוויקיפדיה ↗' })
  const tasks = [hebrewWikipedia, searchWikidata(encyclopediaQuery, signal)]
  if (mostlyEnglish) tasks.unshift(searchMediaWiki({ api: ENGLISH_WIKIPEDIA, query, signal, language: 'en', source: 'en-wikipedia', sourceLabel: 'Wikipedia באנגלית', linkLabel: 'לערך המלא ב־Wikipedia ↗' }))
  if (dictionaryQuestion) tasks.unshift(searchMediaWiki({ api: HEBREW_WIKTIONARY, query: dictionaryQuery, signal, dictionary: true, source: 'he-wiktionary', sourceLabel: 'ויקימילון העברי', linkLabel: 'לערך המלא בוויקימילון ↗' }))

  const settled = await Promise.allSettled(tasks)
  const groups = settled.filter(result => result.status === 'fulfilled').map(result => result.value)
  if (!groups.length) {
    if (signal?.aborted || settled.some(result => result.reason?.name === 'AbortError')) throw new DOMException('Aborted', 'AbortError')
    throw new Error('network')
  }
  const safe = list => filterSafeResults(uniqueResults(list), query)
  if (dictionaryQuestion && settled[0]?.status === 'fulfilled') {
    const dictionary = safe([settled[0].value])
    if (dictionary.length) return dictionary.slice(0, 3)
  }
  return safe(groups).slice(0, 6)
}

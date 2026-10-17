import { bugaPediaSearchTerms, findBugaPediaKnowledge } from '../data/bugapediaKnowledge.js'

const HEBREW_WIKIPEDIA = 'https://he.wikipedia.org/w/api.php'
const ENGLISH_WIKIPEDIA = 'https://en.wikipedia.org/w/api.php'
const HEBREW_WIKTIONARY = 'https://he.wiktionary.org/w/api.php'
const WIKIDATA = 'https://www.wikidata.org/w/api.php'

const cleanText = value => String(value || '').replace(/\s+/g, ' ').trim()
const lower = value => cleanText(value).toLocaleLowerCase('he-IL')
const coreTerm = value => lower(value).replace(/[\u0591-\u05C7]/g, '').replace(/^ה(?=[א-ת]{3,}$)/u, '')

function localAnswer(question) {
  const value = lower(question).replace(/,/g, '.')
  const math = value.match(/(?:כמה\s+(?:זה|הם)\s*)?(-?\d+(?:\.\d+)?)\s*(פלוס|פחות|כפול|לחלק ל|חלקי|אחוז מתוך|[+×x*÷/-])\s*(-?\d+(?:\.\d+)?)/)
  if (math) {
    const left = Number(math[1])
    const right = Number(math[3])
    const operator = math[2]
    let result
    if (operator === 'פלוס' || operator === '+') result = left + right
    else if (operator === 'פחות' || operator === '-') result = left - right
    else if (['כפול', '×', 'x', '*'].includes(operator)) result = left * right
    else if (operator === 'אחוז מתוך') result = (left / 100) * right
    else if (right !== 0) result = left / right
    if (Number.isFinite(result)) {
      const shown = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 10 }).format(result)
      return { id: `calculation-${left}-${operator}-${right}`, title: `התשובה היא ${shown}`, extract: `${math[1]} ${operator} ${math[3]} = ${shown}. החישוב בוצע ישירות בבוגה־פדיה.`, image: '', verified: true, sourceLabel: 'חישוב מדויק' }
    }
  }

  if (/^(איזה יום היום|מה היום|מה התאריך היום|מה התאריך)$/u.test(value.replace(/[?!.,]/g, '').trim())) {
    const now = new Date()
    const fullDate = new Intl.DateTimeFormat('he-IL', { timeZone: 'Asia/Jerusalem', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    return { id: 'date-today', title: `היום ${fullDate}`, extract: 'התאריך מוצג לפי שעון ישראל.', image: '', verified: true, sourceLabel: 'תאריך עדכני · שעון ישראל' }
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

async function searchMediaWiki({ api, query, signal, sourceLabel, linkLabel, language = 'he', dictionary = false }) {
  const terms = bugaPediaSearchTerms(query)
  const params = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '8',
    prop: 'extracts|pageimages|info', explaintext: '1',
    piprop: 'thumbnail', pithumbsize: '900', inprop: 'url',
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

export async function searchBugaPedia(question, signal) {
  const query = cleanText(question)
  if (query.length < 2) throw new Error('short')

  const verified = findBugaPediaKnowledge(query)
  if (verified) return [verified]
  const local = localAnswer(query)
  if (local) return [local]

  const terms = bugaPediaSearchTerms(query)
  const encyclopediaQuery = terms.join(' ') || query
  const dictionaryQuestion = isDictionaryQuestion(query)
  const dictionaryQuery = englishLookup(query) || encyclopediaQuery
  const mostlyEnglish = (query.match(/[a-z]/gi) || []).length > query.length / 3

  const hebrewWikipedia = searchMediaWiki({ api: HEBREW_WIKIPEDIA, query: encyclopediaQuery, signal, sourceLabel: 'ויקיפדיה העברית', linkLabel: 'לערך המלא בוויקיפדיה ↗' })
  const tasks = [hebrewWikipedia, searchWikidata(encyclopediaQuery, signal)]
  if (mostlyEnglish) tasks.unshift(searchMediaWiki({ api: ENGLISH_WIKIPEDIA, query, signal, language: 'en', sourceLabel: 'Wikipedia באנגלית', linkLabel: 'לערך המלא ב־Wikipedia ↗' }))
  if (dictionaryQuestion) tasks.unshift(searchMediaWiki({ api: HEBREW_WIKTIONARY, query: dictionaryQuery, signal, dictionary: true, sourceLabel: 'ויקימילון העברי', linkLabel: 'לערך המלא בוויקימילון ↗' }))

  const settled = await Promise.allSettled(tasks)
  if (dictionaryQuestion && settled[0]?.status === 'fulfilled' && settled[0].value.length) return uniqueResults([settled[0].value]).slice(0, 3)
  const groups = settled.filter(result => result.status === 'fulfilled').map(result => result.value)
  if (!groups.length && settled.some(result => result.status === 'rejected' && result.reason?.name === 'AbortError')) throw new DOMException('Aborted', 'AbortError')
  return uniqueResults(groups).slice(0, 6)
}

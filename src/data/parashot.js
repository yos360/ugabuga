import genesis from './parasha/genesis.js'
import exodus from './parasha/exodus.js'
import leviticus from './parasha/leviticus.js'
import numbers from './parasha/numbers.js'
import deuteronomy from './parasha/deuteronomy.js'
import { QUIZ_SOURCES } from './parasha/quizSources.js'

export const PARASHA_BOOKS = ['בראשית', 'שמות', 'ויקרא', 'במדבר', 'דברים']
export const PARASHOT = [genesis, exodus, leviticus, numbers, deuteronomy].flatMap((rows, book) => rows.map(([slug, name, ref, paragraphs, questions, discussion]) => {
  const data = QUIZ_SOURCES[slug], sourceBook = ref.split(' ')[0]
  const withSources = (q, a, ranges) => ({ q, a, sources: ranges.split(';').map(range => `${sourceBook} ${range}`) })
  const warmup = questions.map(([q, a], i) => withSources(q, a, data.sources[i]))
  return { slug, name, book: PARASHA_BOOKS[book], ref, paragraphs, questions: warmup, quizQuestions: [...warmup, ...data.extra.map(([q, a, ranges]) => withSources(q, a, ranges))], discussion }
}))
export const parashaBySlug = slug => PARASHOT.find(p => p.slug === slug)
export const parashaHref = p => `/parasha/${p.slug}`
export const parashaSource = p => `https://www.sefaria.org/${p.ref.replaceAll(' ', '.').replaceAll(':', '.')}?lang=he`

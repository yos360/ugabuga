import genesis from './parasha/genesis.js'
import exodus from './parasha/exodus.js'
import leviticus from './parasha/leviticus.js'
import numbers from './parasha/numbers.js'
import deuteronomy from './parasha/deuteronomy.js'

export const PARASHA_BOOKS = ['בראשית', 'שמות', 'ויקרא', 'במדבר', 'דברים']
export const PARASHOT = [genesis, exodus, leviticus, numbers, deuteronomy].flatMap((rows, book) => rows.map(([slug, name, ref, paragraphs, questions, discussion]) => ({ slug, name, book: PARASHA_BOOKS[book], ref, paragraphs, questions: questions.map(([q, a]) => ({ q, a })), discussion })))
export const parashaBySlug = slug => PARASHOT.find(p => p.slug === slug)
export const parashaHref = p => `/parasha/${p.slug}`
export const parashaSource = p => `https://www.sefaria.org/${p.ref.replaceAll(' ', '.').replaceAll(':', '.')}?lang=he`

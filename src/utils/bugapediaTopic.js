// Turns a child's question into the encyclopedia topic it asks about:
// "מה זה הר געש?" → "הר געש", "מי היה בן גוריון?" → "בן גוריון", "מה ההבדל בין וירוס לחיידק?" → ["וירוס", "חיידק"].
// Wikipedia titles are bare topics, so looking the topic up by title beats a word search on the whole question.

const tidy = value => String(value || '').normalize('NFKC').replace(/[֑-ׇ]/g, '').replace(/[?!.,;:"״׳']/g, ' ').replace(/־/g, ' ').replace(/\s+/g, ' ').trim()

const LEAD = [
  /^(?:תסביר|תסבירי|הסבר|הסבירו|ספר|ספרי|ספרו)\s+(?:לי\s+|לנו\s+)?(?:מה\s+(?:זה|זאת|זו|הוא|היא)\s+|על\s+)?/u,
  /^(?:אני\s+)?(?:רוצה|רוצים)\s+לדעת\s+(?:מה\s+(?:זה|זאת)\s+|על\s+)?/u,
  /^(?:מה|מהו|מהי|מהם|מהן|מי|מיהו|מיהי|מיהם|מיהן)\s+(?:זה|זאת|זו|הוא|היא|הם|הן|היה|הייתה|היתה|היו)\s+/u,
  /^(?:מהו|מהי|מהם|מהן|מיהו|מיהי|מיהם|מיהן)\s+/u,
  // "מי המציא את השפה הרוסית?" is about "השפה הרוסית", not about the word "המציא".
  /^מי\s+(?:המציא|המציאה|המציאו|גילה|גילתה|גילו|כתב|כתבה|כתבו|בנה|בנתה|בנו|הקים|הקימה|הקימו|ייסד|ייסדה|יסד|צייר|ציירה|הלחין|הלחינה|פיתח|פיתחה|יצר|יצרה)\s+(?:את\s+)?/u,
  /^(?:מי)\s+/u,
]
// Questions about how/why/when are not "what is X" and keep their words for the search engine.
const NOT_A_TOPIC = /^(?:איך|כיצד|למה|מדוע|מתי|איפה|היכן|כמה|האם|באיזה|באיזו|איזה|איזו|אילו|מה\s+(?:קרה|קורה|גורם|עושה|עושים|צריך|אוכל|אוכלים|יש))(?:\s|$)/u

const stripHe = word => /^ה[א-ת]{3,}$/u.test(word) ? word.slice(1) : word

export function bugaPediaTopic(question) {
  let value = tidy(question)
  if (!value || NOT_A_TOPIC.test(value)) return null
  const between = value.match(/^מה\s+(?:ה)?הבדל\s+בין\s+(.+?)\s+(?:לבין\s+|ל\s?)([א-תa-z].*)$/iu)
  if (between) {
    const pair = [between[1], between[2]].map(part => part.trim()).filter(part => part.length >= 2 && part.split(' ').length <= 3)
    return pair.length === 2 ? { topic: pair.join(' '), titles: pair.flatMap(titleVariants), pair } : null
  }
  for (const lead of LEAD) {
    if (lead.test(value)) { value = value.replace(lead, ''); break }
  }
  // A plain "מה X?" with nothing stripped above ("מה פסח") still names a topic.
  value = value.replace(/^מה\s+/u, '').trim()
  if (value.length < 2 || value.split(' ').length > 4) return null
  return { topic: value, titles: titleVariants(value) }
}

// Title forms worth trying: as asked, without the leading ה ("המוח" → "מוח"), without "חג" ("חג החנוכה" → "חנוכה").
export function titleVariants(topic) {
  const value = tidy(topic)
  const words = value.split(' ')
  const variants = [value]
  if (words.length === 1) variants.push(stripHe(value))
  const noHoliday = value.replace(/^(?:חג|החג)\s+/u, '')
  if (noHoliday !== value) variants.push(noHoliday, stripHe(noHoliday))
  return [...new Set(variants.filter(item => item.length >= 2))]
}

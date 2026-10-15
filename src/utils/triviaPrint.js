// Short explicit pages keep the numbered answer key aligned with every copy.
export function triviaPrintPages(questions) {
  const pages = []
  for (let start = 0; start < questions.length; start += 6) pages.push({ start, questions: questions.slice(start, start + 6) })
  return pages
}

export function topicPrintQuestions(questions) {
  return questions.map(q => ({ q: q.q, options: [...q.options], a: q.options[q.answer], explain: q.explain || '' }))
}

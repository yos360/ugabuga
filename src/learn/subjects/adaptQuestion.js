// Adapted exam: three answers instead of four. Keeps the right answer and two wrong ones; which wrong
// one is dropped is fixed per question id. Options that only make sense next to the full list
// ("all of the above") keep all four.
const LINKED = /כל התשובות|כל הנ"ל|כל הנ״ל|אף תשובה|אף אחת|שתי התשובות|תשובות [אבגד]/

export function adaptQuestion(q) {
  if (q.options.length <= 3 || q.options.some(o => LINKED.test(o))) return q
  const h = [...String(q.id)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const wrong = q.options.map((_, j) => j).filter(j => j !== q.answer)
  const drop = wrong[h % wrong.length]
  const keep = q.options.map((_, j) => j).filter(j => j !== drop)
  return { ...q, options: keep.map(j => q.options[j]), answer: keep.indexOf(q.answer) }
}

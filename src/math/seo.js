// SEO wording for the generated /math pages — one place, pure functions, unit-tested.
// Parents of elementary-school kids search "חשבון" ("תרגילי חשבון לכיתה ג", "מבחן בחשבון לכיתה ד");
// from grade 7 the searches switch to "מתמטיקה" ("מתמטיקה כיתה ז", "מבחן במתמטיקה לכיתה ט").

const MAX_TITLE = 60 // the site appends " | עוגה בוגה" itself

export const isElementary = n => Number(n) <= 6

// Primary keyword of a grade page (/math/grade-N).
export function gradeKeyword(g) {
  return isElementary(g.n) ? `תרגילי חשבון לכיתה ${g.label}` : `מתמטיקה לכיתה ${g.label}`
}

export function gradeSeo(g, topicCount) {
  const kw = gradeKeyword(g)
  const n = topicCount ? `${topicCount} נושאים` : 'נושאים'
  if (isElementary(g.n)) {
    return {
      title: `${kw} — דפי עבודה, תרגול אונליין ומבחן`,
      h1: kw,
      description: `${kw}: ${n} לפי תכנית הלימודים, עם הסבר קצר, תרגול אונליין בשלוש רמות, מבחן מסכם ודפי עבודה בחשבון להדפסה עם תשובות. חינם.`,
    }
  }
  const tail = g.n >= 10 ? 'תרגול לבגרות, הסברים ומבחן' : 'תרגול, הסברים, דפי עבודה ומבחן'
  return {
    title: `${kw} — ${tail}`,
    h1: kw,
    description: `${kw} (${g.stageLabel}): ${n} לפי תכנית הלימודים, עם הסבר ודוגמה פתורה, תרגול בשלוש רמות, מבחן מסכם ודפי עבודה להדפסה עם תשובות. חינם.`,
  }
}

// Primary keyword of a summary-test page (/math/tests/grade-N).
export function testKeyword(g) {
  return isElementary(g.n) ? `מבחן בחשבון לכיתה ${g.label}` : `מבחן במתמטיקה לכיתה ${g.label}`
}

export function testSeo(g) {
  const kw = testKeyword(g)
  return {
    title: `${kw} עם תשובות — אונליין ולהדפסה`,
    h1: kw,
    description: `${kw} עם תשובות: מבחן מסכם מכל הנושאים של כיתה ${g.label}, 10 או 20 שאלות בשלוש רמות, טיימר וציון — וגם מבחן להדפסה עם דף תשובות. חינם.`,
  }
}

// Topic titles in the data carry a units suffix ("— 3–5 יח״ל") and a few already name the grade.
export function topicBaseTitle(topic) {
  return topic.title.replace(/\s+—\s+[\d–-]+\s*יח״ל$/, '').trim()
}

export function topicH1(topic, g) {
  const base = topicBaseTitle(topic)
  return base.includes(`כיתה ${g.label}`) ? topic.title : `${topic.title} — כיתה ${g.label}`
}

// "<topic> לכיתה <grade> — תרגול ודף עבודה", shortened step by step to stay near 60 characters.
export function topicSeoTitle(topic, g) {
  if (topic.seoTitle) return topic.seoTitle
  const base = topicBaseTitle(topic)
  const core = base.includes(`כיתה ${g.label}`) ? base : `${base} לכיתה ${g.label}`
  const options = [`${core} — הסבר, תרגול ודף עבודה`, `${core} — תרגול ודף עבודה`, `${core} — תרגול`, core]
  return options.find(t => t.length <= MAX_TITLE) || core
}

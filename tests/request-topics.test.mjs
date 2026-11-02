import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requestTopic, groupByTopic } from '../src/data/requestTopics.js'

const t = (title, path) => requestTopic({ title, path }).key

test('request topics: pages land in the subject a visitor would look in', () => {
  assert.equal(t('חוברת חשבון ראשונה לגיל 4–5', '/booklets/first-math-age-4'), 'math')
  assert.equal(t('שאלות מילוליות בעשרת הראשונה — כיתה א׳ חינוך מיוחד', '/booklets/word-problems-special-ed'), 'math')
  assert.equal(t('חוקי החשבון וסדר פעולות', '/math/grade-6/arithmetic-laws'), 'math')
  assert.equal(t('דפי צביעה לסיגד — להדפסה בחינם', '/holidays/sigd/coloring'), 'holidays')
  assert.equal(t('חוברת העשרה וכיף לחנוכה — כיתות ה׳–ו׳', '/booklets/hanukkah-grade5'), 'holidays')
  assert.equal(t('זיכרון ופאזל פירות הדר עם ניקוד', '/online-games/memory-citrus'), 'topics')
  assert.equal(t('חוברת כלי תחבורה לגן חובה', '/booklets/transport-kindergarten'), 'topics')
  assert.equal(t('חוברת תנועות וניקוד — עמוד לחיריק', '/booklets/nikud'), 'reading')
  assert.equal(t('הבנת הנקרא לכיתה ב׳', '/learn/reading/grade-2'), 'reading')
  assert.equal(t('חוברת צליל פותח — היגיינה אישית', '/booklets/hygiene-first-sound'), 'reading')
  assert.equal(t('משפטי פירמידה — קריאה מנוקדת עם שאלות', '/booklets/sentence-pyramids'), 'reading')
  assert.equal(t('משהו אחר לגמרי', '/x'), 'other')
})

test('request topics: groups keep order inside a topic and drop empty topics', () => {
  const rows = [{ title: 'חוברת חשבון א', path: '/a' }, { title: 'הבנת הנקרא', path: '/b' }, { title: 'חוברת חשבון ב', path: '/c' }]
  const g = groupByTopic(rows)
  assert.deepEqual(g.map(x => x.key), ['math', 'reading'])
  assert.deepEqual(g[0].items.map(r => r.path), ['/a', '/c'])
})

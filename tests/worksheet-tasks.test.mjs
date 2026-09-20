import { test } from 'node:test'
import assert from 'node:assert/strict'
import { missingRows, orderCards, searchObjects } from '../src/data/worksheetTasks.js'
import { activityForPath, validActivity, presenceCount, recentPresence, buttonAction } from '../src/utils/liveActivity.js'
const items=['a','b','c','d','e','f','g','h']
for(const age of ['3–4','5–6','7–8']) test(`solvable worksheets ${age}`,()=>{
  for(let version=0;version<20;version++){
    const order=orderCards(age,version)
    assert.notDeepEqual(order.cards,order.ordered)
    assert.deepEqual([...order.cards].sort((a,b)=>a-b),order.ordered)
    const search=searchObjects(items,age,version)
    search.targets.forEach((target,i)=>assert.equal(search.answers[i],search.objects.filter(x=>x===target).length))
    missingRows(items,age,version).forEach(row=>assert.equal(row.answer,row.sequence[row.missing]))
  }
})
test('activity accepts only fixed codes and no arbitrary labels',()=>{
  assert.equal(activityForPath('/tools/eretz-ir'),'eretz-ir')
  assert.equal(activityForPath('/games/some-personal-title'),'game')
  assert.equal(activityForPath('/admin/mandalas'),null)
  assert.equal(activityForPath('/tools/bingo'),'bingo-maker')
  assert.equal(validActivity({action:'print',category:'mandalas'}),true)
  assert.equal(validActivity({action:'open',category:'__proto__'}),false)
  assert.equal(validActivity({action:'hack',category:'game'}),false)
})
test('multiple tabs under the same browser key count once',()=>{
  assert.equal(presenceCount({same:[{},{}],other:[{}],empty:[]}),2)
})
test('recent activity survives joining but expires and deduplicates tabs',()=>{
  const at=200000
  const entries={mine:[{activity:{action:'open',category:'mandalas',at}},{activity:{action:'use',category:'mandalas',at:at+1000}}],old:[{activity:{action:'print',category:'game',at:1}}],bad:[{activity:{action:'injected',category:'game',at}}]}
  const rows=recentPresence(entries,'mine',at+2000)
  assert.equal(rows.length,1);assert.equal(rows[0].own,true);assert.equal(rows[0].action,'use')
  assert.equal(buttonAction('בדקו תשובות'),'check');assert.equal(buttonAction('הדפיסו דף'),null)
})

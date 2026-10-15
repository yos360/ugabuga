import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LETTER_CARDS, CATEGORY_CARDS, TABLE_QUIZ, SHABBAT_ACTIVITIES, SHABBAT_ACTIVITY_PATHS, activityPrintPlan, weeklyActivity, SHABBAT_PREPARATION, SHABBAT_CUSTOM } from '../src/data/shabbatActivities.js'
import { readingForDate, israelToday } from '../src/utils/parashaCalendar.js'
import { RIDDLE_PAGES } from '../src/data/content/riddles.js'

test('eight useful activities, unique metadata and sitemap entries',()=>{
 assert.equal(SHABBAT_ACTIVITIES.length,8);assert.equal(SHABBAT_ACTIVITY_PATHS.length,10)
 const xml=readFileSync(new URL('../public/sitemap-static.xml',import.meta.url),'utf8')
 for(const p of SHABBAT_ACTIVITY_PATHS)assert.ok(xml.includes(`<loc>https://ugabuga.co.il${p}</loc>`),p)
 for(const a of SHABBAT_ACTIVITIES){assert.ok(a.description.length<=165&&a.description.length>70,a.slug);assert.ok(a.rules.length>=3&&a.paragraphs.length>=2&&a.faq.length>=2&&a.age&&a.players&&a.minutes,a.slug)}
 assert.equal(new Set(SHABBAT_ACTIVITIES.map(a=>a.title)).size,8)
 assert.match(SHABBAT_PREPARATION,/לפני שבת/);assert.match(SHABBAT_PREPARATION,/בלי כתיבה, גזירה, צביעה, הדבקה, חשמל או מסך/)
 assert.equal(SHABBAT_CUSTOM,'יש משפחות שנוהגות אחרת במשחקים מסוימים — בדקו לפי מנהג המשפחה')
})
test('letters, categories, age quizzes, memory pairs and missing-picture sets',()=>{
 assert.equal(LETTER_CARDS.length,22);assert.equal(new Set(LETTER_CARDS).size,22)
 assert.equal(CATEGORY_CARDS.length,12)
 for(const age of ['4-6','7-9','10-12','family']){assert.equal(TABLE_QUIZ[age].length,6);const pages=activityPrintPlan('table-quiz','2026-10-15',age);assert.equal(pages.length,2);assert.deepEqual(pages[0].cards,TABLE_QUIZ[age])}
 const memory=activityPrintPlan('memory','2026-10-15')[0].cards
 assert.equal(memory.length,16);for(const id of new Set(memory.map(x=>x.id)))assert.equal(memory.filter(x=>x.id===id).length,2)
 for(const p of activityPrintPlan('whats-missing','2026-10-15')){assert.equal(p.cards.length,6);assert.equal(p.cards.filter(c=>c.id!==p.missing.id).length,5)}
 const riddles=activityPrintPlan('riddles','2026-10-15').flatMap(p=>p.cards)
 assert.deepEqual(riddles,RIDDLE_PAGES.find(r=>r.slug==='kids-easy').riddles)
 assert.equal(activityPrintPlan('twenty-questions','2026-10-15')[1].cards.length,20)
})
test('every weekly pack is exactly five sheets and reuses the correct parasha questions',()=>{
 let doubles=0,holidays=0
 for(let n=0;n<110;n++){
  const date=new Date(Date.UTC(2025,0,1+n*7,12)),iso=date.toISOString().slice(0,10)
  const reading=readingForDate(iso),week=weeklyActivity(iso),pages=activityPrintPlan('pack',iso)
  assert.equal(week.reading.name,reading.name);assert.equal(pages.length,5);assert.equal(new Set(pages.map(p=>p.key)).size,5)
  assert.equal(pages[1].cards.length,22);assert.equal(pages[2].cards.length,12)
  if(reading.portions.length){
   for(const q of pages[0].cards.filter(q=>q.sources))assert.ok(reading.portions.some(p=>p.quizQuestions.some(x=>x.q===q.q&&x.a===q.a)))
   if(reading.portions.length===2){doubles++;for(const p of reading.portions)assert.equal(pages[0].cards.filter(q=>q.category===p.name).length,3)}
  }else{holidays++;assert.ok(reading.holiday);assert.match(pages[0].subtitle,/ללא פרשה רגילה/);assert.deepEqual(pages[0].cards,TABLE_QUIZ.family)}
 }
 assert.ok(doubles>0&&holidays>0)
})
test('Israel timezone midnight rolls the weekly pack forward, invalid dates stay empty',()=>{
 const before=israelToday(new Date('2026-10-17T20:59:00Z')),after=israelToday(new Date('2026-10-17T21:01:00Z'))
 assert.equal(before,'2026-10-17');assert.equal(after,'2026-10-18')
 assert.notEqual(weeklyActivity(before).reading.date,weeklyActivity(after).reading.date)
 assert.equal(weeklyActivity('invalid'),null);assert.deepEqual(activityPrintPlan('pack','invalid'),[])
})

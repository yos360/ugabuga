import test from 'node:test'
import assert from 'node:assert/strict'
import {normalizeSpace,makeTimeSlots,bestMeeting,calendarEvent,csvCell,spaceCsv,validDate} from '../src/utils/sharedSpaces.js'

test('appointments stop at the end time, never roll into another day and reject zero-duration loops',()=>{
 assert.deepEqual(makeTimeSlots('2026-10-20','17:00','17:25',10).map(x=>x.time),['17:00','17:10'])
 for(const input of [['17:00','16:00',10],['25:00','26:00',10],['17:00','19:00',0]])assert.deepEqual(makeTimeSlots('2026-10-20',...input),[])
 assert.equal(makeTimeSlots('2026-10-20','00:00','23:59',5).length,80)
})
test('invalid calendar dates and duplicate appointments are rejected on the server as well as browser',()=>{
 assert.equal(validDate('2026-02-30'),false)
 assert.equal(validDate('2028-02-29'),true)
 const i={date:'2026-10-20',time:'17:00'}
 assert.throws(()=>normalizeSpace('parents',{title:'אספה',items:[i,i]}),/bad_input/)
 assert.throws(()=>normalizeSpace('meet',{title:'מפגש',items:[i]}),/bad_input/)
 assert.throws(()=>normalizeSpace('help',{title:'עזרה',items:[i]}),/bad_input/)
 assert.throws(()=>normalizeSpace('unknown',{title:'x'}),/bad_input/)
 assert.throws(()=>normalizeSpace('album',{title:'   '}),/bad_input/)
})
test('client-generated identifiers and extra fields cannot change appointment identities or owner permissions',()=>{
 const config=normalizeSpace('help',{title:' עזרה ',owner:'attacker',items:[{id:'other-id',date:'2026-10-20',time:'',label:'קניות',capacity:10000}]})
 assert.equal(config.owner,undefined);assert.equal(config.title,'עזרה');assert.equal(config.items[0].id,'s1');assert.equal(config.items[0].capacity,10)
 assert.deepEqual(normalizeSpace('album',{title:'מסיבה',items:['ignored']} ).items,[])
})
test('meeting ranking prioritizes confirmed yes over maybes',()=>{
 const items=[{id:'a'},{id:'b'},{id:'c'}], entries=[{item_id:'a',value:'yes'},{item_id:'b',value:'maybe'},{item_id:'b',value:'maybe'},{item_id:'c',value:'yes'},{item_id:'c',value:'maybe'}]
 assert.deepEqual(bestMeeting(items,entries).map(x=>x.id),['c','a','b'])
})
test('CSV neutralizes spreadsheet formulas and calendar exports escape content',()=>{
 assert.equal(csvCell('=HYPERLINK("x")'),'"\'=HYPERLINK(""x"")"')
 const space={code:'test',config:{title:'פגישה;\nBEGIN:VEVENT',place:'חדר,3',items:[{id:'s1',date:'2026-10-20',time:'17:00'}]},entries:[{name:'=bad',item_id:'s1',value:'booked'}]}
 assert.ok(spaceCsv(space).includes('"\'=bad"'))
 const ics=calendarEvent(space,space.config.items[0])
 assert.ok(ics.includes('DTSTART;TZID=Asia/Jerusalem:20261020T170000'))
 assert.ok(ics.includes('SUMMARY:פגישה\\;\\nBEGIN:VEVENT'))
 assert.equal(ics.split('\r\n').filter(x=>x==='BEGIN:VEVENT').length,1)
})

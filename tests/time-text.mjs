import test from 'node:test'
import assert from 'node:assert/strict'
import { minutes,durationLabel,shiftMinutes,timesheet,calendarDay,dateDifference,addDateDays,jerusalemToday,describeDate,zoneParts,zoneOffset,israelInstants,countText } from '../src/utils/timeText.js'
test('durations, overnight work and breaks',()=>{
 assert.equal(minutes('125:59'),7559);assert.equal(durationLabel(-90),'−1:30')
 assert.equal(shiftMinutes('22:00','06:00',30),450);assert.equal(shiftMinutes('09:00','09:00'),0)
 for(const s of ['24:00','12:60','-1:00',''])assert.throws(()=>minutes(s,true))
 assert.throws(()=>shiftMinutes('09:00','10:00',61));assert.throws(()=>shiftMinutes('09:00','10:00',0.5))
 assert.deepEqual(timesheet([{start:'09:00',end:'10:30',pause:'0'}],'40'),{total:90,pay:60})
 assert.throws(()=>timesheet([],'-1'))
})
test('calendar differences cross leap days and Israeli DST without losing days',()=>{
 assert.equal(dateDifference('2024-02-28','2024-03-01').days,2)
 assert.equal(dateDifference('2026-03-26','2026-03-28').days,2)
 assert.equal(dateDifference('2026-10-24','2026-10-26',true).days,3)
 assert.deepEqual(dateDifference('2025-01-31','2025-02-28'),{days:28,weeks:4,weekDays:0,months:1,monthDays:0})
 assert.equal(dateDifference('2025-01-31','2025-03-30').months,1)
 assert.equal(addDateDays('2024-03-01',-1),'2024-02-29')
 assert.throws(()=>calendarDay('2025-02-29'));assert.throws(()=>dateDifference('2025-02-02','2025-02-01'))
 assert.throws(()=>addDateDays('2025-01-01',0.5))
 assert.equal(jerusalemToday(new Date('2026-07-01T22:00:00Z')),'2026-07-02')
 assert.match(describeDate('2026-10-14').weekday,/רביעי/);assert.ok(describeDate('2026-10-14').hebrew)
})
test('world clock handles fractional zones, date rollover, gaps and repeated hours',()=>{
 const d=new Date('2026-07-01T22:00:00Z')
 assert.deepEqual(zoneParts(d,'Asia/Jerusalem'),{date:'2026-07-02',time:'01:00'})
 assert.equal(zoneOffset(d,'Asia/Kolkata'),330)
 assert.equal(israelInstants('2026-03-27','02:30').length,0)
 assert.equal(israelInstants('2026-10-25','01:30').length,2)
 assert.equal(israelInstants('2026-07-01','12:00')[0].toISOString(),'2026-07-01T09:00:00.000Z')
})
test('Hebrew niqqud, geresh, gershayim and English word counting',()=>{
 const r=countText('שָׁלוֹם צה״ל ג׳וני!\n\nHello, don’t stop.')
 assert.equal(r.words,6);assert.equal(r.sentences,2);assert.equal(r.paragraphs,2);assert.equal(r.readingMinutes,1)
 assert.equal(countText('שָׁלוֹם').characters,4);assert.equal(countText('a b').withoutSpaces,2)
 assert.deepEqual(countText(''),{words:0,characters:0,withoutSpaces:0,sentences:0,paragraphs:0,readingMinutes:0})
 assert.equal(countText('!!!').words,0);assert.equal(countText('!!!').sentences,0)
})

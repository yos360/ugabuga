import test from 'node:test'
import assert from 'node:assert/strict'
import {existsSync,readFileSync} from 'node:fs'
import {holidayDates,dateISO,nextShabbat} from '../src/en/holidayDates.js'
import {HOLIDAYS} from '../src/en/holidayData.js'
import {HOLIDAY_DRAWINGS,drawingPath,drawingsFor} from '../src/en/holidayColoringData.js'
import {ENGLISH_BLESSINGS} from '../src/en/holidayBlessingsEn.js'
test('holiday dates match published 2026/2027 diaspora fixtures including leap Adar and year rollover',()=>{
 const fixtures=[['rosh-hashanah',2026,'2026-09-11','2026-09-13'],['yom-kippur',2026,'2026-09-20','2026-09-21'],['sukkot',2026,'2026-09-25','2026-10-02'],['simchat-torah',2026,'2026-10-03','2026-10-04'],['hanukkah',2026,'2026-12-04','2026-12-12'],['hanukkah',2027,'2027-12-24','2028-01-01'],['tu-bishvat',2027,'2027-01-22','2027-01-23'],['purim',2027,'2027-03-22','2027-03-23'],['passover',2027,'2027-04-21','2027-04-29'],['lag-baomer',2027,'2027-05-24','2027-05-25'],['shavuot',2027,'2027-06-10','2027-06-12']]
 for(const[slug,year,start,end]of fixtures){const d=holidayDates(slug,year);assert.equal(dateISO(d.start),start,slug);assert.equal(dateISO(d.end),end,slug)}
 assert.equal(dateISO(holidayDates('passover',2027,true).end),'2027-04-28')
 assert.equal(dateISO(holidayDates('shavuot',2027,true).end),'2027-06-11')
 assert.equal(dateISO(holidayDates('simchat-torah',2026,true).end),'2026-10-03')
 assert.equal(dateISO(nextShabbat(new Date(2026,9,14,12)).end),'2026-10-17')
 assert.equal(dateISO(nextShabbat(new Date(2027,0,1,12)).start),'2027-01-01')
 assert.equal(holidayDates('invalid',2027),null)
})
test('English holiday drawings are named existing assets, with no generic coloring expansion',()=>{
 assert.equal(HOLIDAYS.length,11);assert.equal(HOLIDAY_DRAWINGS.length,99)
 assert.equal(new Set(HOLIDAY_DRAWINGS.map(drawingPath)).size,99)
 assert.equal(new Set(HOLIDAY_DRAWINGS.map(d=>d.name)).size,99)
 assert.equal(HOLIDAY_DRAWINGS.filter(d=>d.counterpart).length,45)
 const nativePaths={'rosh-hashanah':'roshhashana/RoshHashanaPrint','yom-kippur':'yomkippur/YomKippurPrint',sukkot:'sukkot/SukkotPrint',hanukkah:'hanukkah/HanukkahArt','tu-bishvat':'tubishvat/TuBishvatPrint',purim:'purim/PurimPrint',passover:'pesach/PesachPrint','lag-baomer':'lagbaomer/LagBaomerPrint',shavuot:'shavuot/ShavuotPrint'}
 for(const d of HOLIDAY_DRAWINGS){assert.ok(d.description.trim());assert.ok(HOLIDAYS.some(h=>h.slug===d.holiday));if(d.native){assert.ok(readFileSync(`src/components/${nativePaths[d.holiday]}.jsx`,'utf8').includes(`id: '${d.id}'`))}else{assert.ok(existsSync('public'+d.src),d.src);assert.ok(existsSync('public'+d.thumb),d.thumb)}}
 assert.equal(drawingsFor('shabbat').length,0);assert.equal(drawingsFor('simchat-torah')[0].id,'torah')
 for(const b of Object.values(ENGLISH_BLESSINGS)){assert.ok(b.he.includes('בָּרוּךְ'));assert.ok(b.transliteration.startsWith('Barukh'));assert.ok(b.translation.startsWith('Blessed'))}
})

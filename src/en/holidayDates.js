import { hebrewParts } from '../utils/hebrewCalendar.js'
const rules = {
 'rosh-hashanah':['תשרי',1,2], 'yom-kippur':['תשרי',10,1], sukkot:['תשרי',15,7],
 'simchat-torah':['תשרי',23,1], hanukkah:['כסלו',25,8], 'tu-bishvat':['שבט',15,1],
 purim:['אדר',14,1], passover:['ניסן',15,8], 'lag-baomer':['אייר',18,1], shavuot:['סיוון',6,2],
}
export const addCalendarDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,12)
export const dateISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
// Reuse the site's Intl Hebrew-calendar conversion. Noon avoids DST boundary arithmetic.
export function holidayDates(slug,year,israel=false) {
 const rule=rules[slug];if(!rule)return null
 let [month,day,length]=rule
 if(israel){if(slug==='simchat-torah')day=22;if(slug==='passover')length=7;if(slug==='shavuot')length=1}
 for(let d=new Date(year,0,1,12);d.getFullYear()===year;d=addCalendarDays(d,1)){
  const h=hebrewParts(d);if(!h)return null
  const monthMatches=slug==='purim'?['אדר','אדר ב׳'].includes(h.month):h.month===month
  if(monthMatches&&h.day===day)return {start:addCalendarDays(d,-1),end:addCalendarDays(d,length-1),hebrewYear:h.year}
 }
 return null
}
export function nextShabbat(from=new Date()){
 const saturday=addCalendarDays(from,(6-from.getDay()+7)%7)
 return {start:addCalendarDays(saturday,-1),end:saturday}
}
export const displayDate=d=>new Intl.DateTimeFormat('en-US',{weekday:'short',month:'long',day:'numeric',year:'numeric'}).format(d)

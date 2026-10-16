import test from 'node:test'
import assert from 'node:assert/strict'
import {INVITATION_THEMES,cropCover,invitationText,readInvitePhoto} from '../src/utils/invitationDesign.js'
test('photo crop always covers frame at both pan extremes and zoom levels',()=>{
 for(const [w,h] of [[1600,900],[900,1600],[500,500]])for(const zoom of [1,1.5,2.5])for(const x of [0,50,100])for(const y of [0,50,100]){const c=cropCover(w,h,400,zoom,x,y);assert.ok(c.x<=0&&c.y<=0);assert.ok(c.x+c.width>=399.999&&c.y+c.height>=399.999)}
})
test('WhatsApp message includes clickable RSVP and preserves numeric direction',()=>{
 const text=invitationText({name:'נועה',age:'7',date:'שישי 14.11',time:'17:00–19:00',place:'הפארק',phone:'050-0000000',notes:'מחכים לכם'},'https://ugabuga.co.il/r/abcd2345')
 assert.ok(text.includes('https://ugabuga.co.il/r/abcd2345'));assert.ok(text.includes('\u206617:00–19:00\u2069'));assert.ok(text.includes('נועה'))
})
test('unsupported and oversized photos fail before decode',async()=>{
 await assert.rejects(readInvitePhoto({type:'image/heic',size:10}),/HEIC/)
 await assert.rejects(readInvitePhoto({type:'image/jpeg',size:16*1024*1024}),/15/)
})
test('six designs preserve existing stable theme IDs',()=>{assert.deepEqual(INVITATION_THEMES.map(t=>t.id),['balloons','space','dino','princess','football','gaming']);assert.equal(new Set(INVITATION_THEMES.map(t=>t.bg)).size,6)})

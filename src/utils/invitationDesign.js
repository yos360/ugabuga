import { renderPremiumInvitation } from './invitationRenderer.js'

export const INVITATION_THEMES = [
 {id:'balloons',name:'מסיבת בלונים',emoji:'🎈',bg:'#fff1e5',ink:'#74304e',accent:'#dc5c83',second:'#f6bd61',tag:'שמחה בצבעי פסטל'},
 {id:'space',name:'הרפתקה בחלל',emoji:'🚀',bg:'#101b48',ink:'#ffffff',accent:'#9de4ff',second:'#ffc773',tag:'כוכבים, מסלול והמראה'},
 {id:'dino',name:'ספארי דינוזאורים',emoji:'🦖',bg:'#e9efda',ink:'#234c35',accent:'#53794d',second:'#e2a85e',tag:'מסע בג׳ונגל הירוק'},
 {id:'princess',name:'נשף קסום',emoji:'👑',bg:'#f6e9f6',ink:'#653978',accent:'#a575b5',second:'#b89351',tag:'מסגרת מלכותית וזהב'},
 {id:'football',name:'כרטיס למשחק',emoji:'⚽',bg:'#145446',ink:'#ffffff',accent:'#e3f78d',second:'#f4bd49',tag:'הזמנה ליום הולדת של אלופים'},
 {id:'gaming',name:'מסיבת גיימינג',emoji:'🎮',bg:'#17132f',ink:'#ffffff',accent:'#77f3d1',second:'#cb8cff',tag:'ניאון, פיקסלים ושלב חדש'},
 {id:'scrapbook',name:'אלבום צבעוני',emoji:'✂️',bg:'#fff8e8',ink:'#342d46',accent:'#ef4e82',second:'#55b9c6',tag:'קולאז׳, מדבקות וצילום אישי',art:false},
 {id:'ribbon',name:'סרט ופפיון',emoji:'🎀',bg:'#fff5f6',ink:'#74394b',accent:'#df7894',second:'#e5b96b',tag:'נקי, עדין וחגיגי',art:false},
 {id:'retro',name:'מסיבת רטרו',emoji:'🪩',bg:'#fff1cd',ink:'#253b55',accent:'#e56a3e',second:'#47a7a0',tag:'שנות השבעים וצבעי שקיעה',art:false},
 {id:'disco',name:'דיסקו נוצץ',emoji:'✨',bg:'#251445',ink:'#ffffff',accent:'#ff70be',second:'#72e6dc',tag:'נצנצים, קצב ואורות',art:false},
 {id:'ocean',name:'ים קסום',emoji:'🐚',bg:'#eafcff',ink:'#235271',accent:'#55bfc8',second:'#e8a8d5',tag:'גלים, פנינים וצבעי מים',art:false},
 {id:'elegant',name:'ערב חגיגי',emoji:'🥂',bg:'#241b20',ink:'#fff8ed',accent:'#c69a55',second:'#8c3148',tag:'זהב, פרחים ויום הולדת עגול',art:false},
]
export const INVITATION_FIELDS = [['name','שם החוגג/ת','text','למשל: נועה',32],['age','גיל','text','למשל: 7',3],['date','תאריך','text','למשל: שישי, 14.11',40],['time','שעה','text','למשל: 17:00–19:00',25],['place','מקום וכתובת','text','למשל: גן השעשועים ברחוב הרצל',100],['phone','טלפון לאישור הגעה','tel','050-0000000',25]]
export const INVITATION_FONTS = [['Heebo','נקי ומודרני'],['Fredoka','שמח ועגול'],['KtavYad','כתב יד'],['Arial','קלאסי וברור']]
export const INVITATION_PALETTES = [
 {name:'ורוד שמח',bg:'#fff0f5',ink:'#64213d',accent:'#e3477b',second:'#ffbd59'},
 {name:'שמיים',bg:'#eaf8ff',ink:'#153f63',accent:'#168fc5',second:'#ffca5c'},
 {name:'סגול קסום',bg:'#f4edff',ink:'#4c2870',accent:'#9254c8',second:'#e5b653'},
 {name:'ג׳ונגל',bg:'#edf5e6',ink:'#254936',accent:'#47885d',second:'#e49d55'},
 {name:'ניאון',bg:'#17132f',ink:'#ffffff',accent:'#68efd1',second:'#d08bff'},
 {name:'שחור וזהב',bg:'#171717',ink:'#ffffff',accent:'#e6bd62',second:'#fff0bd'},
]
export const invitationStyleFor = theme => ({
 bg:theme.bg,ink:theme.ink,accent:theme.accent,second:theme.second,font:'Heebo',nameSize:88,
 photoShape:['gaming','football'].includes(theme.id)?'rounded':'circle',photoScale:100,panel:'card',effect:'solid',frame:'theme',decorations:true,
 headline:'',footer:'מחכים לחגוג איתכם!'
})
// Bar/bat mitzvah invitations use the same studio with their own wording (data.occasion).
export const INVITATION_OCCASIONS = {
 'bat-mitzvah': { title: 'בת מצווה', headline: 'בשמחה רבה מזמינים אתכם לחגוג', line: 'חוגגת בת מצווה', invite: 'הוזמנתם לחגוג את בת המצווה של' },
 'bar-mitzvah': { title: 'בר מצווה', headline: 'בשמחה רבה מזמינים אתכם לחגוג', line: 'חוגג בר מצווה', invite: 'הוזמנתם לחגוג את בר המצווה של' },
}
export function invitationText(data, link='') {
 const ltr=v=>`\u2066${v}\u2069`, occ=INVITATION_OCCASIONS[data.occasion]
 return [occ ? `${occ.invite} ${data.name || '___'}!` : `הוזמנתם ליום ההולדת של ${data.name || '___'}${data.age ? ` — חוגגים ${data.age}!` : '!'}`,`תאריך: ${data.date || '___'}`,`שעה: ${data.time ? ltr(data.time) : '___'}`,`מקום: ${data.place || '___'}`,data.phone && `אישור הגעה: ${ltr(data.phone)}`,link && `אישור הגעה אונליין: ${link}`,data.notes].filter(Boolean).join('\n')
}
export function cropCover(width,height,size,zoom=1,x=50,y=50) {
 const scale=Math.max(size/width,size/height)*zoom,w=width*scale,h=height*scale
 return {x:-(w-size)*x/100,y:-(h-size)*y/100,width:w,height:h}
}
export function loadInviteImage(src) {
 return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('לא הצלחנו לפתוח את התמונה. נסו קובץ JPG או PNG אחר.'));img.src=src})
}
export async function readInvitePhoto(file) {
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('בחרו תמונת JPG, PNG או WebP. לתמונת HEIC יש לשמור תחילה עותק JPG.')
 if(file.size>15*1024*1024)throw new Error('התמונה גדולה מדי. בחרו קובץ עד 15 מגה־בייט.')
 const url=URL.createObjectURL(file)
 try {
  const image=await loadInviteImage(url)
  if(!image.naturalWidth||image.naturalWidth*image.naturalHeight>40000000)throw new Error('בחרו תמונה ברזולוציה קטנה יותר (עד 40 מגה־פיקסל).')
  const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas')
  canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale)
  const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0,canvas.width,canvas.height)
  return await loadInviteImage(canvas.toDataURL('image/jpeg',.92))
 } finally { URL.revokeObjectURL(url) }
}

export function renderInvitationLegacy(canvas,{theme,data,format='portrait',photo,art,crop={zoom:1,x:50,y:50},rsvp='',design=invitationStyleFor(theme)}) {
 const W=1080,H=format==='story'?1920:1350,extra=H-1350
 canvas.width=W;canvas.height=H
 const p={...theme,...design},c=canvas.getContext('2d')
 if(p.effect==='gradient'){const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,p.bg);g.addColorStop(1,p.accent);c.fillStyle=g}else c.fillStyle=p.bg;c.fillRect(0,0,W,H)
 const round=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke()}}
 const circle=(x,y,r,fill)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill()}
 const text=(s,x,y,size,color=p.ink,max=900,weight=600)=>{
  c.font=`${weight} ${size}px "${p.font}", "Heebo", Arial, sans-serif`;while(c.measureText(String(s)).width>max&&size>18){size--;c.font=`${weight} ${size}px "${p.font}", "Heebo", Arial, sans-serif`}
  c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText(s,x,y)
 }
 const lines=(value,y,size,maxLines=2,color=p.ink,width=840)=>{
  c.font=`500 ${size}px "${p.font}", "Heebo", Arial, sans-serif`
  // Shrink to fit every character rather than silently truncating an address or note.
  let rows=[]
  for(;size>=18;size--){rows=[''];for(const ch of String(value)){const i=rows.length-1;if(c.measureText(rows[i]+ch).width>width)rows.push(ch);else rows[i]+=ch}if(rows.length<=maxLines)break;c.font=`500 ${size-1}px "${p.font}", "Heebo", Arial, sans-serif`}
  rows.forEach((row,i)=>text(row.trim(),540,y+i*(size+9),size,color,width,500));return rows.length*(size+9)
 }
 // Six distinct graphic systems. Every system can also be simplified or recoloured by the user.
 if(p.decorations&&theme.id==='balloons'){
  for(let i=0;i<12;i++){const x=i%2?1020:60,y=100+Math.floor(i/2)*250;c.strokeStyle=p.second;c.globalAlpha=.4;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-50,y+100,x+70,y+180,x,y+230);c.stroke();c.globalAlpha=1;c.save();c.translate(x,y);c.scale(.8,1);circle(0,0,88,[p.accent,p.second,'#a7d8ce'][i%3]);c.restore()}
  for(let i=0;i<32;i++){c.save();c.translate(180+(i*173)%740,30+(i*131)%H);c.rotate(i);c.fillStyle=[p.accent,p.second,'#a7d8ce'][i%3];c.fillRect(0,0,7,20);c.restore()}
 } else if(p.decorations&&theme.id==='space'){
  const glow=c.createRadialGradient(540,540,30,540,540,760);glow.addColorStop(0,p.accent+'66');glow.addColorStop(1,p.bg);c.fillStyle=glow;c.fillRect(0,0,W,H)
  for(let i=0;i<100;i++)circle((i*163+43)%W,(i*293+39)%H,i%4===0?3:1.5,i%3? '#ffffff99':p.second)
  c.save();c.translate(540,530+extra*.3);c.rotate(-.3);c.strokeStyle=p.accent+'66';c.lineWidth=3;c.beginPath();c.ellipse(0,0,490,210,0,0,Math.PI*2);c.stroke();c.restore();circle(930,170,65,p.second)
 } else if(p.decorations&&theme.id==='dino'){
  for(let i=0;i<16;i++){c.save();c.translate(i%2?W:0,80+i*110);c.rotate(i%2?2.7:.3);c.fillStyle=i%3?p.accent:p.second;c.globalAlpha=.55;c.beginPath();c.ellipse(0,0,160,43,.65,0,Math.PI*2);c.fill();c.restore()}c.globalAlpha=1
  round(45,45,990,H-90,210,null,p.accent)
 } else if(p.decorations&&theme.id==='princess'){
  round(36,36,1008,H-72,220,null,p.second);round(57,57,966,H-114,200,null,p.accent+'66')
  for(let i=0;i<18;i++){const x=70+(i*197)%950,y=100+(i*263)%(H-200);c.fillStyle=p.second;c.beginPath();c.moveTo(x,y-13);c.lineTo(x+5,y-4);c.lineTo(x+13,y);c.lineTo(x+5,y+4);c.lineTo(x,y+13);c.lineTo(x-5,y+4);c.lineTo(x-13,y);c.lineTo(x-5,y-4);c.closePath();c.fill()}
 } else if(p.decorations&&theme.id==='football'){
  for(let i=0;i<9;i++){c.fillStyle=i%2?'#ffffff06':'#00000006';c.fillRect(i*120,0,120,H)}
  round(40,40,1000,H-80,0,null,'#ffffff55');round(320,40,440,160,0,null,'#ffffff55');round(320,H-200,440,160,0,null,'#ffffff55');c.strokeStyle='#ffffff33';c.beginPath();c.arc(540,H/2,220,0,Math.PI*2);c.stroke()
 } else if(p.decorations&&theme.id==='gaming'){
  c.strokeStyle='#65469a33';c.lineWidth=2;for(let x=0;x<W;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  for(let i=0;i<18;i++){c.fillStyle=i%2?p.accent:p.second;c.globalAlpha=.5;c.fillRect(i%2?40:990,90+i*91,25,25)}c.globalAlpha=1
  round(70,70,940,H-140,4,null,p.accent)
 } else if(p.decorations&&theme.id==='scrapbook'){
  for(let i=0;i<18;i++){c.save();c.translate(45+(i*211)%990,60+(i*307)%(H-110));c.rotate((i%5-2)*.16);c.fillStyle=[p.accent,p.second,'#f3c747','#8d73cf'][i%4];if(i%3)c.fillRect(-12,-28,24,56);else{c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.fill()}c.restore()}
  c.setLineDash([18,12]);round(42,42,996,H-84,28,null,p.second);c.setLineDash([])
 } else if(p.decorations&&theme.id==='ribbon'){
  c.globalAlpha=.16;for(let x=0;x<W;x+=74){c.fillStyle=x%148?p.accent:p.second;c.fillRect(x,0,34,H)}c.globalAlpha=1
  const bow=(x,y,s)=>{c.fillStyle=p.accent;c.beginPath();c.ellipse(x-s*.45,y,s*.48,s*.25,-.28,0,Math.PI*2);c.ellipse(x+s*.45,y,s*.48,s*.25,.28,0,Math.PI*2);c.fill();circle(x,y,s*.17,p.second)};bow(115,115,90);bow(965,H-120,72)
  round(48,48,984,H-96,65,null,p.accent)
 } else if(p.decorations&&theme.id==='retro'){
  const bands=[p.accent,p.second,'#e6ad3d','#e78ba7'];for(let i=0;i<7;i++){c.strokeStyle=bands[i%4];c.lineWidth=18;c.beginPath();c.arc(540,260,300+i*28,Math.PI,Math.PI*2);c.stroke()}
  for(let y=650;y<H;y+=120){c.fillStyle=y%240?p.second+'22':p.accent+'22';c.fillRect(0,y,W,60)}
 } else if(p.decorations&&theme.id==='disco'){
  for(let i=0;i<80;i++){const x=(i*179)%W,y=(i*251)%H,r=i%5===0?8:3;c.fillStyle=[p.accent,p.second,'#ffffff'][i%3];c.save();c.translate(x,y);c.rotate(Math.PI/4);c.fillRect(-r,-r,r*2,r*2);c.restore()}
  const dg=c.createRadialGradient(540,580,30,540,580,600);dg.addColorStop(0,p.accent+'44');dg.addColorStop(1,'#00000000');c.fillStyle=dg;c.fillRect(0,0,W,H)
 } else if(p.decorations&&theme.id==='ocean'){
  for(let row=0;row<5;row++){c.fillStyle=[p.accent,p.second,'#f1c6a8'][row%3]+'55';c.beginPath();c.moveTo(0,H-80-row*58);for(let x=0;x<=W;x+=80)c.quadraticCurveTo(x+40,H-115-row*58,x+80,H-80-row*58);c.lineTo(W,H);c.lineTo(0,H);c.fill()}
  for(let i=0;i<30;i++){c.strokeStyle=i%2?p.accent:p.second;c.globalAlpha=.35;c.lineWidth=3;c.beginPath();c.arc((i*197)%W,90+(i*233)%(H-260),8+(i%4)*5,0,Math.PI*2);c.stroke()}c.globalAlpha=1
 } else if(p.decorations&&theme.id==='elegant'){
  round(30,30,1020,H-60,6,null,p.accent);round(48,48,984,H-96,4,null,p.accent)
  for(const [x,y,r] of [[70,80,0],[1010,80,1],[70,H-80,1],[1010,H-80,0]])for(let i=0;i<7;i++){c.save();c.translate(x,y);c.rotate((i+r)*.72);c.fillStyle=i%2?p.second:p.accent;c.globalAlpha=.65;c.beginPath();c.ellipse(55,0,52,18,0,0,Math.PI*2);c.fill();c.restore()}c.globalAlpha=1
 }
 if(p.frame==='thin')round(35,35,1010,H-70,36,null,p.ink)
 if(p.frame==='double'){round(28,28,1024,H-56,42,null,p.accent);round(48,48,984,H-96,34,null,p.second)}
 const top=125+extra*.12
 const defaultHeadline=theme.id==='gaming'?'עולים שלב — חוגגים יום הולדת!':theme.id==='football'?'כרטיס כניסה למסיבת האלופים':theme.id==='space'?'מתכוננים להמראה למסיבת יום הולדת':theme.id==='dino'?'יוצאים להרפתקת יום הולדת':theme.id==='princess'?'הוזמנתם לחגיגה קסומה':'יש מסיבה, ואתם מוזמנים!'
 const occ=INVITATION_OCCASIONS[data.occasion]
 text(p.headline||(occ?occ.headline:defaultHeadline),540,top,32)
 text(data.name||'שם החוגג/ת',540,top+85,p.nameSize||88,p.ink,850,800)
 text(occ?occ.line:data.age?`חוגגים ${data.age}`:'יום הולדת שמח',540,top+160,38,p.accent)
 const size=(400+extra*.24)*(p.photoScale||100)/100,x=(W-size)/2,y=340+extra*.2+(400+extra*.24-size)/2
 c.save();c.beginPath();if(p.photoShape==='rounded')c.roundRect(x,y,size,size,38);else if(p.photoShape==='square')c.roundRect(x,y,size,size,4);else c.arc(540,y+size/2,size/2,0,Math.PI*2);c.clip()
 c.fillStyle='#fff';c.fillRect(x,y,size,size)
 const img=photo||art
 if(img){const box=cropCover(img.naturalWidth,img.naturalHeight,size,photo?crop.zoom:1,photo?crop.x:50,photo?crop.y:50);c.drawImage(img,x+box.x,y+box.y,box.width,box.height)}else{
  const artFill=c.createLinearGradient(x,y,x+size,y+size);artFill.addColorStop(0,p.accent+'55');artFill.addColorStop(1,p.second+'77');c.fillStyle=artFill;c.fillRect(x,y,size,size)
  c.font=`${Math.round(size*.32)}px "Segoe UI Emoji", sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=p.ink;c.fillText(theme.emoji,540,y+size/2)
 }
 c.restore();c.strokeStyle=p.second;c.lineWidth=8;c.beginPath();if(p.photoShape==='rounded')c.roundRect(x-7,y-7,size+14,size+14,45);else if(p.photoShape==='square')c.roundRect(x-7,y-7,size+14,size+14,8);else c.arc(540,y+size/2,size/2+7,0,Math.PI*2);c.stroke()
 const by=795+extra*.58,boxColor=p.panel==='glass'?'#ffffffc7':p.panel==='outline'?'#ffffff22':'#ffffff',ink=p.panel==='outline'?p.ink:'#253144'
 round(100,by,880,420,theme.id==='gaming'?10:theme.id==='football'?4:40,boxColor,p.panel==='outline'?p.second:null)
 text(data.date||'תאריך החגיגה',540,by+56,38,ink,800,700)
 text(data.time?`\u2066${data.time}\u2069`:'שעת החגיגה',540,by+106,36,ink,800,600)
 c.fillStyle=p.accent;c.fillRect(445,by+144,190,3)
 lines(data.place||'כאן נפגשים לחגוג',by+185,31,2,ink,790)
 if(data.phone)text(`אישור הגעה: \u2066${data.phone}\u2069`,540,by+277,28,ink,800,500)
 if(data.notes)lines(data.notes,by+326,27,2,ink,790)
 if(rsvp)text(rsvp.replace('https://',''),540,by+394,22,ink,800,500)
 text(p.footer||'מחכים לחגוג איתכם!',540,H-81,27)
 text('עוגה בוגה · ugabuga.co.il',540,H-38,20,p.ink,900,400)
}

export const renderInvitation = renderPremiumInvitation

export const INVITATION_THEMES = [
 {id:'balloons',name:'מסיבת בלונים',emoji:'🎈',bg:'#fff1e5',ink:'#74304e',accent:'#dc5c83',second:'#f6bd61',tag:'שמחה בצבעי פסטל'},
 {id:'space',name:'הרפתקה בחלל',emoji:'🚀',bg:'#101b48',ink:'#ffffff',accent:'#9de4ff',second:'#ffc773',tag:'כוכבים, מסלול והמראה'},
 {id:'dino',name:'ספארי דינוזאורים',emoji:'🦖',bg:'#e9efda',ink:'#234c35',accent:'#53794d',second:'#e2a85e',tag:'מסע בג׳ונגל הירוק'},
 {id:'princess',name:'נשף קסום',emoji:'👑',bg:'#f6e9f6',ink:'#653978',accent:'#a575b5',second:'#b89351',tag:'מסגרת מלכותית וזהב'},
 {id:'football',name:'כרטיס למשחק',emoji:'⚽',bg:'#145446',ink:'#ffffff',accent:'#e3f78d',second:'#f4bd49',tag:'הזמנה ליום הולדת של אלופים'},
 {id:'gaming',name:'מסיבת גיימינג',emoji:'🎮',bg:'#17132f',ink:'#ffffff',accent:'#77f3d1',second:'#cb8cff',tag:'ניאון, פיקסלים ושלב חדש'},
]
export const INVITATION_FIELDS = [['name','שם החוגג/ת','text','למשל: נועה',32],['age','גיל','text','למשל: 7',3],['date','תאריך','text','למשל: שישי, 14.11',40],['time','שעה','text','למשל: 17:00–19:00',25],['place','מקום וכתובת','text','למשל: גן השעשועים ברחוב הרצל',100],['phone','טלפון לאישור הגעה','tel','050-0000000',25]]
export function invitationText(data, link='') {
 const ltr=v=>`\u2066${v}\u2069`
 return [`הוזמנתם ליום ההולדת של ${data.name || '___'}${data.age ? ` — חוגגים ${data.age}!` : '!'}`,`תאריך: ${data.date || '___'}`,`שעה: ${data.time ? ltr(data.time) : '___'}`,`מקום: ${data.place || '___'}`,data.phone && `אישור הגעה: ${ltr(data.phone)}`,link && `אישור הגעה אונליין: ${link}`,data.notes].filter(Boolean).join('\n')
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

export function renderInvitation(canvas,{theme,data,format='portrait',photo,art,crop={zoom:1,x:50,y:50},rsvp=''}) {
 const W=1080,H=format==='story'?1920:1350,extra=H-1350
 canvas.width=W;canvas.height=H
 const c=canvas.getContext('2d');c.fillStyle=theme.bg;c.fillRect(0,0,W,H)
 const round=(x,y,w,h,r,fill,stroke)=>{c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke()}}
 const circle=(x,y,r,fill)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill()}
 const text=(s,x,y,size,color=theme.ink,max=900,weight=600)=>{
  c.font=`${weight} ${size}px "Heebo", Arial, sans-serif`;while(c.measureText(String(s)).width>max&&size>18){size--;c.font=`${weight} ${size}px "Heebo", Arial, sans-serif`}
  c.fillStyle=color;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText(s,x,y)
 }
 const lines=(value,y,size,maxLines=2,color=theme.ink,width=840)=>{
  c.font=`500 ${size}px "Heebo", Arial, sans-serif`
  // Shrink to fit every character rather than silently truncating an address or note.
  let rows=[]
  for(;size>=18;size--){rows=[''];for(const ch of String(value)){const i=rows.length-1;if(c.measureText(rows[i]+ch).width>width)rows.push(ch);else rows[i]+=ch}if(rows.length<=maxLines)break;c.font=`500 ${size-1}px "Heebo", Arial, sans-serif`}
  rows.forEach((row,i)=>text(row.trim(),540,y+i*(size+9),size,color,width,500));return rows.length*(size+9)
 }
 // Six distinct graphic systems, not a single background recolored six ways.
 if(theme.id==='balloons'){
  for(let i=0;i<12;i++){const x=i%2?1020:60,y=100+Math.floor(i/2)*250;c.strokeStyle='#e7bdc2';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x-50,y+100,x+70,y+180,x,y+230);c.stroke();c.save();c.translate(x,y);c.scale(.8,1);circle(0,0,88,[theme.accent,theme.second,'#a7d8ce'][i%3]);c.restore()}
  for(let i=0;i<32;i++){c.save();c.translate(180+(i*173)%740,30+(i*131)%H);c.rotate(i);c.fillStyle=[theme.accent,theme.second,'#a7d8ce'][i%3];c.fillRect(0,0,7,20);c.restore()}
 } else if(theme.id==='space'){
  const glow=c.createRadialGradient(540,540,30,540,540,760);glow.addColorStop(0,'#344a8e');glow.addColorStop(1,theme.bg);c.fillStyle=glow;c.fillRect(0,0,W,H)
  for(let i=0;i<100;i++)circle((i*163+43)%W,(i*293+39)%H,i%4===0?3:1.5,i%3? '#ffffff99':theme.second)
  c.save();c.translate(540,530+extra*.3);c.rotate(-.3);c.strokeStyle='#88cbe966';c.lineWidth=3;c.beginPath();c.ellipse(0,0,490,210,0,0,Math.PI*2);c.stroke();c.restore();circle(930,170,65,theme.second)
 } else if(theme.id==='dino'){
  for(let i=0;i<16;i++){c.save();c.translate(i%2?W:0,80+i*110);c.rotate(i%2?2.7:.3);c.fillStyle=i%3? '#adc69a':'#83a77b';c.beginPath();c.ellipse(0,0,160,43,.65,0,Math.PI*2);c.fill();c.restore()}
  round(45,45,990,H-90,210,null,'#95af80')
 } else if(theme.id==='princess'){
  round(36,36,1008,H-72,220,null,theme.second);round(57,57,966,H-114,200,null,'#d6bdde')
  for(let i=0;i<18;i++){const x=70+(i*197)%950,y=100+(i*263)%(H-200);c.fillStyle=theme.second;c.beginPath();c.moveTo(x,y-13);c.lineTo(x+5,y-4);c.lineTo(x+13,y);c.lineTo(x+5,y+4);c.lineTo(x,y+13);c.lineTo(x-5,y+4);c.lineTo(x-13,y);c.lineTo(x-5,y-4);c.closePath();c.fill()}
 } else if(theme.id==='football'){
  for(let i=0;i<9;i++){c.fillStyle=i%2?'#ffffff06':'#00000006';c.fillRect(i*120,0,120,H)}
  round(40,40,1000,H-80,0,null,'#ffffff55');round(320,40,440,160,0,null,'#ffffff55');round(320,H-200,440,160,0,null,'#ffffff55');c.strokeStyle='#ffffff33';c.beginPath();c.arc(540,H/2,220,0,Math.PI*2);c.stroke()
 } else {
  c.strokeStyle='#65469a33';c.lineWidth=2;for(let x=0;x<W;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(let y=0;y<H;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  for(let i=0;i<18;i++){c.fillStyle=i%2?theme.accent:theme.second;c.globalAlpha=.5;c.fillRect(i%2?40:990,90+i*91,25,25)}c.globalAlpha=1
  round(70,70,940,H-140,4,null,theme.accent)
 }
 const top=125+extra*.12
 text(theme.id==='gaming'?'עולים שלב — חוגגים יום הולדת!':theme.id==='football'?'כרטיס כניסה למסיבת האלופים':theme.id==='space'?'מתכוננים להמראה למסיבת יום הולדת':theme.id==='dino'?'יוצאים להרפתקת יום הולדת':theme.id==='princess'?'הוזמנתם לחגיגה קסומה':'יש מסיבה, ואתם מוזמנים!',540,top,32)
 text(data.name||'שם החוגג/ת',540,top+85,88,theme.ink,850,800)
 text(data.age?`חוגגים ${data.age}`:'יום הולדת שמח',540,top+160,38,theme.accent)
 const size=400+extra*.24,x=(W-size)/2,y=340+extra*.2
 c.save();c.beginPath();if(theme.id==='gaming'||theme.id==='football')c.roundRect(x,y,size,size,theme.id==='gaming'?12:32);else c.arc(540,y+size/2,size/2,0,Math.PI*2);c.clip()
 c.fillStyle='#fff';c.fillRect(x,y,size,size)
 const img=photo||art
 if(img){const box=cropCover(img.naturalWidth,img.naturalHeight,size,photo?crop.zoom:1,photo?crop.x:50,photo?crop.y:50);c.drawImage(img,x+box.x,y+box.y,box.width,box.height)}
 c.restore();c.strokeStyle=theme.second;c.lineWidth=8;c.beginPath();if(theme.id==='gaming'||theme.id==='football')c.roundRect(x-7,y-7,size+14,size+14,theme.id==='gaming'?12:38);else c.arc(540,y+size/2,size/2+7,0,Math.PI*2);c.stroke()
 const by=795+extra*.58,dark=['space','gaming','football'].includes(theme.id),boxColor=dark?'#ffffff':'#ffffffed',ink='#253144'
 round(100,by,880,420,theme.id==='gaming'?10:theme.id==='football'?4:40,boxColor)
 text(data.date||'תאריך החגיגה',540,by+56,38,ink,800,700)
 text(data.time?`\u2066${data.time}\u2069`:'שעת החגיגה',540,by+106,36,ink,800,600)
 c.fillStyle=theme.accent;c.fillRect(445,by+144,190,3)
 lines(data.place||'כאן נפגשים לחגוג',by+185,31,2,ink,790)
 if(data.phone)text(`אישור הגעה: \u2066${data.phone}\u2069`,540,by+277,28,ink,800,500)
 if(data.notes)lines(data.notes,by+326,27,2,ink,790)
 if(rsvp)text(rsvp.replace('https://',''),540,by+394,22,ink,800,500)
 text('מחכים לחגוג איתכם!',540,H-81,27)
 text('עוגה בוגה · ugabuga.co.il',540,H-38,20,theme.ink,900,400)
}

const alpha=(hex,a)=>{
 const value=String(hex||'#000000').replace('#','')
 if(value.length!==6)return hex
 return `rgba(${parseInt(value.slice(0,2),16)},${parseInt(value.slice(2,4),16)},${parseInt(value.slice(4,6),16)},${a})`
}

export function renderPremiumInvitation(canvas,{theme,data,format='portrait',photo,art,crop={zoom:1,x:50,y:50},rsvp='',design={}}) {
 const W=1080,H=format==='story'?1920:1350,extra=H-1350,p={...theme,...design},c=canvas.getContext('2d')
 canvas.width=W;canvas.height=H;c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high'
 const font=`"${p.font||'Heebo'}", "Heebo", Arial, sans-serif`
 const rr=(x,y,w,h,r,fill,stroke,lw=3)=>{c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
 const circle=(x,y,r,fill,stroke,lw=3)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
 const text=(value,x,y,size,color=p.ink,max=900,weight=700,align='center')=>{
  const raw=String(value||'');c.font=`${weight} ${size}px ${font}`
  while(size>18&&c.measureText(raw).width>max){size-=2;c.font=`${weight} ${size}px ${font}`}
  c.fillStyle=color;c.textAlign=align;c.textBaseline='middle';c.direction='rtl';c.fillText(raw,x,y);return size
 }
 const wrap=(value,x,y,size,color,maxWidth,maxLines=2,weight=500,lineGap=9)=>{
  const words=String(value||'').split(/\s+/),rows=[];let row=''
  c.font=`${weight} ${size}px ${font}`
  for(const word of words){const next=row?`${row} ${word}`:word;if(c.measureText(next).width<=maxWidth)row=next;else{if(row)rows.push(row);row=word}}
  if(row)rows.push(row)
  while(rows.length>maxLines&&size>18)return wrap(value,x,y,size-2,color,maxWidth,maxLines,weight,lineGap)
  rows.slice(0,maxLines).forEach((line,i)=>text(line,x,y+i*(size+lineGap),size,color,maxWidth,weight));return rows.length*(size+lineGap)
 }
 const gradient=(a,b,x1=0,y1=0,x2=W,y2=H)=>{const g=c.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,a);g.addColorStop(1,b);return g}
 const shadow=(blur=30,color='rgba(0,0,0,.22)',x=0,y=12)=>{c.shadowBlur=blur;c.shadowColor=color;c.shadowOffsetX=x;c.shadowOffsetY=y}
 const noShadow=()=>{c.shadowBlur=0;c.shadowColor='transparent';c.shadowOffsetX=0;c.shadowOffsetY=0}
 const cropBox=(img,w,h,zoom=1,x=50,y=50)=>{const s=Math.max(w/img.naturalWidth,h/img.naturalHeight)*zoom,iw=img.naturalWidth*s,ih=img.naturalHeight*s;return{sx:-(iw-w)*x/100,sy:-(ih-h)*y/100,w:iw,h:ih}}
 const drawCover=(img,x,y,w,h,isPhoto=false,opacity=1)=>{if(!img)return;c.save();c.globalAlpha=opacity;c.beginPath();c.rect(x,y,w,h);c.clip();const b=cropBox(img,w,h,isPhoto?crop.zoom:1,isPhoto?crop.x:50,isPhoto?crop.y:50);c.drawImage(img,x+b.sx,y+b.sy,b.w,b.h);c.restore()}
 const drawFramed=(img,x,y,w,h,shape='rounded',tilt=0)=>{
  c.save();c.translate(x+w/2,y+h/2);c.rotate(tilt);const xx=-w/2,yy=-h/2
  shadow(34,'rgba(20,12,35,.28)',0,16);rr(xx-15,yy-15,w+30,h+30,shape==='circle'?w:shape==='square'?5:42,'#fff');noShadow()
  c.beginPath();if(shape==='circle')c.arc(0,0,Math.min(w,h)/2,0,Math.PI*2);else c.roundRect(xx,yy,w,h,shape==='square'?3:30);c.clip()
  if(img)drawCover(img,xx,yy,w,h,img===photo)
  else drawOriginalArt(xx,yy,w,h)
  c.restore()
 }
 const star=(x,y,r,color,points=4)=>{c.save();c.translate(x,y);c.fillStyle=color;c.beginPath();for(let i=0;i<points*2;i++){const a=-Math.PI/2+i*Math.PI/points,rad=i%2?r:r*.28;c.lineTo(Math.cos(a)*rad,Math.sin(a)*rad)}c.closePath();c.fill();c.restore()}
 const leaf=(x,y,w,h,rot,color)=>{c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=color;c.beginPath();c.ellipse(0,0,w,h,0,0,Math.PI*2);c.fill();c.strokeStyle=alpha(p.ink,.18);c.lineWidth=2;c.beginPath();c.moveTo(-w*.7,0);c.lineTo(w*.7,0);c.stroke();c.restore()}
 const bow=(x,y,s,color=p.accent)=>{c.save();c.translate(x,y);c.fillStyle=color;c.beginPath();c.moveTo(-8,0);c.bezierCurveTo(-s*.25,-s*.34,-s*.72,-s*.45,-s*.72,0);c.bezierCurveTo(-s*.72,s*.45,-s*.25,s*.34,-8,0);c.moveTo(8,0);c.bezierCurveTo(s*.25,-s*.34,s*.72,-s*.45,s*.72,0);c.bezierCurveTo(s*.72,s*.45,s*.25,s*.34,8,0);c.fill();circle(0,0,s*.14,p.second);c.beginPath();c.moveTo(-12,12);c.lineTo(-s*.35,s*.8);c.lineTo(0,s*.58);c.lineTo(s*.35,s*.8);c.lineTo(12,12);c.fill();c.restore()}
 const discoBall=(x,y,r)=>{const g=c.createRadialGradient(x-r*.35,y-r*.35,5,x,y,r);g.addColorStop(0,'#fff');g.addColorStop(.25,p.second);g.addColorStop(.7,p.accent);g.addColorStop(1,p.bg);circle(x,y,r,g);c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.clip();for(let yy=y-r;yy<y+r;yy+=24){for(let xx=x-r;xx<x+r;xx+=24){c.fillStyle=(xx+yy)%48?'rgba(255,255,255,.28)':'rgba(255,255,255,.65)';c.fillRect(xx,yy,19,19)}}c.restore();c.strokeStyle=alpha('#ffffff',.8);c.lineWidth=4;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke()}
 const drawOriginalArt=(x,y,w,h)=>{
  c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.fillStyle=gradient(alpha(p.accent,.3),alpha(p.second,.45),x,y,x+w,y+h);c.fillRect(x,y,w,h)
  const cx=x+w/2,cy=y+h/2,s=Math.min(w,h)
  if(theme.id==='scrapbook'){
   c.save();c.translate(cx,cy);c.rotate(-.1);rr(-s*.33,-s*.3,s*.5,s*.62,12,'#fff');c.fillStyle=alpha(p.accent,.28);c.fillRect(-s*.29,-s*.25,s*.42,s*.4);c.restore();c.save();c.translate(cx+s*.09,cy+s*.02);c.rotate(.13);rr(-s*.2,-s*.28,s*.48,s*.58,12,'#fff');c.fillStyle=alpha(p.second,.45);c.fillRect(-s*.16,-s*.23,s*.4,s*.36);c.restore();star(cx-s*.25,cy+s*.23,s*.08,p.accent,5);star(cx+s*.28,cy-s*.23,s*.07,p.second,4)
  }else if(theme.id==='ribbon'){bow(cx,cy-s*.04,s*.5);circle(cx,cy+s*.04,s*.09,p.second)}
  else if(theme.id==='retro'){for(let i=0;i<5;i++){c.strokeStyle=[p.accent,p.second,'#f5c34c','#ef8cab'][i%4];c.lineWidth=s*.055;c.beginPath();c.arc(cx,cy+s*.14,s*(.18+i*.08),Math.PI,Math.PI*2);c.stroke()}circle(cx,cy+s*.15,s*.16,'#fff6db');circle(cx-s*.055,cy+s*.12,s*.014,p.ink);circle(cx+s*.055,cy+s*.12,s*.014,p.ink);c.strokeStyle=p.ink;c.lineWidth=5;c.beginPath();c.arc(cx,cy+s*.14,s*.07,.1*Math.PI,.9*Math.PI);c.stroke()}
  else if(theme.id==='disco'){discoBall(cx,cy,s*.31);for(let i=0;i<8;i++)star(cx+Math.cos(i)*s*.42,cy+Math.sin(i)*s*.38,s*.035,i%2?p.second:'#fff')}
  else if(theme.id==='ocean'){const shell=gradient(alpha(p.second,.95),alpha(p.accent,.7),cx-s*.3,cy-s*.2,cx+s*.3,cy+s*.25);c.fillStyle=shell;c.beginPath();c.moveTo(cx-s*.34,cy+s*.2);c.quadraticCurveTo(cx-s*.31,cy-s*.25,cx,cy-s*.34);c.quadraticCurveTo(cx+s*.31,cy-s*.25,cx+s*.34,cy+s*.2);c.quadraticCurveTo(cx,cy+s*.34,cx-s*.34,cy+s*.2);c.fill();for(let i=-3;i<=3;i++){c.strokeStyle=alpha('#ffffff',.65);c.lineWidth=3;c.beginPath();c.moveTo(cx,cy+s*.2);c.lineTo(cx+i*s*.09,cy-s*.22+Math.abs(i)*s*.018);c.stroke()}circle(cx,cy+s*.08,s*.115,'#fff8f1',alpha(p.second,.8),4);for(let i=0;i<8;i++)circle(x+(i+1)*w/9,y+h*.16+(i%3)*18,6+i%4,alpha('#ffffff',.7))}
  else if(theme.id==='elegant'){c.strokeStyle=p.second;c.lineWidth=5;c.beginPath();c.arc(cx,cy,s*.29,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++)leaf(cx+Math.cos(i*Math.PI/6)*s*.34,cy+Math.sin(i*Math.PI/6)*s*.34,s*.07,s*.024,i*Math.PI/6,p.accent);text(data.age||'♥',cx,cy,s*.32,p.second,s*.5,800)}
  c.restore()
 }

 const fillBackground=()=>{
  c.fillStyle=p.effect==='gradient'?gradient(p.bg,p.accent):p.bg;c.fillRect(0,0,W,H)
  if(!p.decorations)return
  if(['space','gaming','disco'].includes(theme.id)){
   const glow=c.createRadialGradient(820,360+extra*.1,10,820,360+extra*.1,720);glow.addColorStop(0,alpha(p.accent,.42));glow.addColorStop(1,alpha(p.bg,0));c.fillStyle=glow;c.fillRect(0,0,W,H)
   for(let i=0;i<70;i++)star((i*173+31)%W,(i*281+47)%H,i%9===0?10:3,i%3===0?p.second:'rgba(255,255,255,.62)',i%9===0?4:5)
  }else if(theme.id==='football'){
   c.globalAlpha=.1;for(let x=-H;x<W+H;x+=180){c.save();c.translate(x,0);c.rotate(-.28);c.fillStyle=x%360?p.accent:'#fff';c.fillRect(0,-200,90,H+400);c.restore()}c.globalAlpha=1
  }else if(theme.id==='scrapbook'){
   c.fillStyle='#fffaf0';c.fillRect(0,0,W,H);for(let y=55;y<H;y+=55){c.strokeStyle=alpha(p.second,.2);c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}for(let i=0;i<16;i++){c.save();c.translate(45+(i*197)%990,50+(i*293)%(H-100));c.rotate((i%5-2)*.15);c.fillStyle=[p.accent,p.second,'#f5c846','#8b73ca'][i%4];c.fillRect(-9,-25,18,50);c.restore()}
  }else if(theme.id==='retro'){
   c.fillStyle=p.bg;c.fillRect(0,0,W,H);const cols=[p.accent,p.second,'#f3b52f','#e58aa2'];for(let i=0;i<7;i++){c.strokeStyle=cols[i%4];c.lineWidth=26;c.beginPath();c.arc(540,220+extra*.06,330+i*35,Math.PI,Math.PI*2);c.stroke()}
  }else if(theme.id==='ribbon'){
   c.fillStyle='#fffaf7';c.fillRect(0,0,W,H);c.globalAlpha=.13;for(let x=0;x<W;x+=80){c.fillStyle=x%160?p.accent:p.second;c.fillRect(x,0,38,H)}c.globalAlpha=1
  }else if(theme.id==='elegant'){
   c.fillStyle=gradient(p.bg,'#090709');c.fillRect(0,0,W,H);rr(32,32,W-64,H-64,8,null,p.second,3);rr(50,50,W-100,H-100,6,null,alpha(p.accent,.75),2);for(const [x,y] of [[70,80],[1010,80],[70,H-80],[1010,H-80]])for(let i=0;i<7;i++)leaf(x+Math.cos(i*.82)*70,y+Math.sin(i*.82)*70,54,17,i*.82,i%2?p.accent:p.second)
  }else if(theme.id==='ocean'){
   c.fillStyle=gradient('#eaffff',p.bg);c.fillRect(0,0,W,H);for(let row=0;row<4;row++){c.fillStyle=alpha(row%2?p.accent:p.second,.18);c.beginPath();c.moveTo(0,H-90-row*65);for(let x=0;x<=W;x+=90)c.quadraticCurveTo(x+45,H-135-row*65,x+90,H-90-row*65);c.lineTo(W,H);c.lineTo(0,H);c.fill()}
  }else{
   for(let i=0;i<24;i++){const x=(i*199+45)%W,y=(i*307+72)%H;if(theme.id==='dino')leaf(x,y,70,24,(i%6)*.6,i%2?p.accent:p.second);else if(theme.id==='princess')star(x,y,10+(i%3)*5,i%2?p.second:alpha(p.accent,.8),4);else{c.save();c.translate(x,y);c.rotate(i);c.fillStyle=[p.accent,p.second,'#7dd4c6'][i%3];c.fillRect(-6,-20,12,40);c.restore()}}
  }
 }

 const headline=p.headline||({space:'המשימה מתחילה בעוד רגע',dino:'הרפתקה פראית מתחילה כאן',princess:'הזמנה לנשף בלתי נשכח',football:'הכרטיס שלכם לחגיגה',gaming:'שלב חדש עומד להתחיל',scrapbook:'רגעים טובים מתחילים יחד',ribbon:'נשמח לחגוג איתכם',retro:'מוכנים לחגיגה צבעונית?',disco:'הלילה כולו נוצץ',ocean:'צוללים לחגיגה קסומה',elegant:'ערב מיוחד. אנשים אהובים.'}[theme.id]||'יש סיבה טובה לחגוג')
 const name=data.name||'שם החוגג/ת',age=data.age||'?',date=data.date||'יום ותאריך',time=data.time||'שעת המסיבה',place=data.place||'מקום החגיגה'
 const info=(y,color='#253144',panel='#ffffffed',variant='card')=>{
  if(variant==='card'){shadow(34,'rgba(20,18,35,.16)',0,14);rr(86,y,908,330,44,panel);noShadow()}
  text(date,540,y+58,38,color,820,750);text(time.includes(':')?`\u2066${time}\u2069`:time,540,y+108,34,color,820,600)
  c.fillStyle=p.accent;c.fillRect(445,y+146,190,4);wrap(place,540,y+188,31,color,790,2,550)
  if(data.phone)text(`אישור הגעה: \u2066${data.phone}\u2069`,540,y+267,25,color,800,500)
  if(data.notes)wrap(data.notes,540,y+(data.phone?304:274),23,color,790,1,500)
  if(rsvp)text(rsvp.replace('https://',''),540,y+316,18,color,780,500)
 }
 const brand=(color=p.ink)=>{text(p.footer||'מחכים לחגוג איתכם!',540,H-62,25,color,820,650);text('עוגה בוגה · ugabuga.co.il',540,H-27,16,alpha(color,.75),900,450)}
 const image=photo||art
 fillBackground()

 if(['space','football','gaming'].includes(theme.id)){
  const dark='#ffffff',top=90+extra*.12
  c.save();c.translate(0,top);c.fillStyle=alpha('#000000',.18);c.beginPath();c.moveTo(0,0);c.lineTo(W,0);c.lineTo(W,710);c.lineTo(0,820);c.closePath();c.fill();c.restore()
  text(headline,500,top+70,28,dark,430,650,'right');text(name,500,top+155,p.nameSize||94,dark,440,850,'right')
  text(age==='?'?'יום הולדת':`חוגג/ת ${age}`,500,top+245,40,p.second,430,750,'right')
  if(image)drawFramed(image,560,top+55,405,520,p.photoShape||'rounded',theme.id==='gaming'?.035:-.025);else drawFramed(null,560,top+55,405,520,'rounded',-.025)
  if(theme.id==='football'){text(age,190,top+500,225,alpha('#ffffff',.14),310,900);rr(70,top+335,400,82,12,p.accent);text('כרטיס כניסה לחגיגה',270,top+377,30,p.ink,350,800)}
  if(theme.id==='gaming'){rr(70,top+340,360,72,4,alpha(p.accent,.18),p.accent,3);text('PRESS START',250,top+377,31,p.accent,320,800);for(let i=0;i<4;i++)rr(72+i*62,top+455,42,42,8,i%2?p.second:p.accent)}
  if(theme.id==='space'){for(let i=0;i<3;i++){c.strokeStyle=alpha(p.accent,.45);c.lineWidth=4;c.beginPath();c.arc(215,top+460,72+i*34,0,Math.PI*2);c.stroke()}circle(215,top+460,29,p.second)}
  info(785+extra*.63,'#20283d','#ffffffed');brand(dark)
 }else if(['scrapbook','retro','disco'].includes(theme.id)){
  const top=75+extra*.1,tilt=theme.id==='scrapbook'?-0.045:theme.id==='retro'?.025:-.02
  text(headline,540,top+48,29,theme.id==='disco'?'#fff':p.ink,880,650)
  text(name,540,top+130,p.nameSize||92,theme.id==='disco'?'#fff':p.ink,900,850)
  rr(790,top+190,190,190,theme.id==='retro'?95:28,p.accent);text(age,885,top+286,116,theme.id==='disco'?'#fff':p.bg,150,900)
  text('חוגג/ת',885,top+365,25,theme.id==='disco'?'#fff':p.ink,170,700)
  drawFramed(image,115,top+205,620,500,p.photoShape||'rounded',tilt)
  if(theme.id==='scrapbook'){c.save();c.translate(200,top+195);c.rotate(-.09);rr(-55,-22,160,45,4,'#f2cd72cc');c.restore();star(770,top+470,35,p.second,5)}
  if(theme.id==='disco'){discoBall(875,top+560,92);for(let i=0;i<5;i++)star(770+i*55,top+690+(i%2)*20,13,i%2?p.accent:p.second)}
  info(800+extra*.62,theme.id==='disco'?'#27213d':'#253144','#ffffffef');brand(theme.id==='disco'?'#fff':p.ink)
 }else if(['ribbon','elegant'].includes(theme.id)){
  const light=theme.id==='elegant'?'#fff9ee':p.ink,top=90+extra*.16
  if(theme.id==='ribbon')bow(540,top+45,165)
  else{text('✦',540,top+30,42,p.second,100,400);c.fillStyle=p.second;c.fillRect(390,top+30,90,2);c.fillRect(600,top+30,90,2)}
  text(headline,540,top+135,27,light,820,550);text(name,540,top+220,p.nameSize||90,light,850,800)
  text(age==='?'?'יום הולדת':`חוגג/ת ${age}`,540,top+292,35,p.second,700,700)
  if(image)drawFramed(image,330,top+345,420,390,p.photoShape==='circle'?'circle':'rounded',0)
  else if(theme.id==='ribbon'){
   c.strokeStyle=alpha(p.accent,.38);c.lineWidth=3;c.beginPath();c.moveTo(260,top+510);c.lineTo(440,top+510);c.moveTo(640,top+510);c.lineTo(820,top+510);c.stroke();text(age,540,top+515,210,alpha(p.accent,.23),260,900);text('יום הולדת',540,top+630,30,p.ink,440,650)
  }else{
   c.strokeStyle=alpha(p.second,.78);c.lineWidth=4;c.beginPath();c.arc(540,top+535,175,0,Math.PI*2);c.stroke();for(let i=0;i<14;i++)leaf(540+Math.cos(i*Math.PI/7)*210,top+535+Math.sin(i*Math.PI/7)*210,48,14,i*Math.PI/7,i%2?p.accent:p.second);text(age,540,top+535,185,p.second,260,850)
  }
  info(790+extra*.62,theme.id==='elegant'?'#2b2024':'#4b3340',theme.id==='elegant'?'#fff7eaef':'#ffffffed');brand(light)
 }else{
  const top=75+extra*.12,light=['princess'].includes(theme.id)?p.ink:p.ink
  text(headline,540,top+45,29,light,900,650);text(name,540,top+128,p.nameSize||92,light,900,850)
  rr(430,top+186,220,68,34,p.accent);text(age==='?'?'יום הולדת':`חוגג/ת ${age}`,540,top+221,31,theme.id==='space'?'#fff':p.bg,190,750)
  if(image){
   if(!photo){shadow(38,'rgba(31,24,45,.22)',0,16);rr(130,top+285,820,475,64,'#fff');noShadow();drawCover(image,150,top+305,780,435,false);c.fillStyle=gradient(alpha('#ffffff',0),alpha(p.bg,.22),150,top+305,150,top+740);c.fillRect(150,top+305,780,435)}
   else drawFramed(photo,250,top+275,580,485,p.photoShape||'rounded',0)
  }else drawFramed(null,245,top+275,590,485,p.photoShape||'rounded',0)
  if(theme.id==='princess'){c.strokeStyle=p.second;c.lineWidth=5;c.beginPath();c.roundRect(110,top+265,860,515,240,240);c.stroke();star(540,top+280,25,p.second,4)}
  if(theme.id==='dino'){leaf(145,top+330,130,44,.6,p.accent);leaf(925,top+700,150,50,-2.5,p.second)}
  if(theme.id==='ocean'){for(let i=0;i<8;i++)circle(155+i*110,top+770,8+i%3*5,alpha(i%2?p.accent:p.second,.65))}
  info(795+extra*.62,'#253144','#ffffffed');brand(p.ink)
 }
 if(p.frame==='thin')rr(24,24,W-48,H-48,30,null,alpha(p.ink,.55),3)
 if(p.frame==='double'){rr(22,22,W-44,H-44,34,null,p.accent,3);rr(38,38,W-76,H-76,27,null,p.second,2)}
}

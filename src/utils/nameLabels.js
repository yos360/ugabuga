export const LABEL_LAYOUTS = {
  standard21: { label:'21 מדבקות — 63.5 × 38.1 מ״מ', width:63.5,height:38.1,columns:3,rows:7,gapX:2.5,gapY:0 },
  standard14: { label:'14 מדבקות — 99.1 × 38.1 מ״מ', width:99.1,height:38.1,columns:2,rows:7,gapX:2.5,gapY:0 },
  plain: { label:'נייר רגיל לגזירה — 60 × 30 מ״מ',width:60,height:30,columns:3,rows:8,gapX:5,gapY:3 },
}
export function labelLayout(key) {
  if(!Object.hasOwn(LABEL_LAYOUTS,key))throw new Error('פריסת מדבקות לא מוכרת.')
  const p=LABEL_LAYOUTS[key],left=(210-p.columns*p.width-(p.columns-1)*p.gapX)/2,top=(297-p.rows*p.height-(p.rows-1)*p.gapY)/2
  return {...p,left,top,labels:Array.from({length:p.columns*p.rows},(_,i)=>({x:left+(i%p.columns)*(p.width+p.gapX),y:top+Math.floor(i/p.columns)*(p.height+p.gapY),width:p.width,height:p.height}))}
}
export function labelFontSize(text,width) { return Math.max(2.5,Math.min(6,(width-18)/Math.max(1,[...text].length*0.72))) }

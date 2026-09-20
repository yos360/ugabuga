// Columns increase from right to left in the rendered Hebrew board.
export const normalize = value => value.normalize('NFKD').replace(/[\u0591-\u05BD\u05BF-\u05C7\s־-]/g, '').replace(/[ךםןףץ]/g, c => ({ך:'כ',ם:'מ',ן:'נ',ף:'פ',ץ:'צ'}[c]))
export const keyOf = (r,c) => `${r},${c}`
export function random(seed=1) { let s=seed>>>0; return ()=> {s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296} }
const shuffle=(items,rng)=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
export function crossword(entries, seed=1) {
  const words=entries.map(([word,clue])=>({word:normalize(word),clue,display:word})).filter(x=>x.word.length>=2&&x.word.length<=14)
  let best=null
  for(let attempt=0;attempt<24;attempt++) {
    const rng=random(seed+attempt*7919), pending=shuffle(words,rng), cells=new Map(), placed=[]
    const put=(entry,r,c,d)=>{const keys=[];for(let i=0;i<entry.word.length;i++){const rr=r+(d==='down'?i:0),cc=c+(d==='across'?i:0),key=keyOf(rr,cc);const prev=cells.get(key);cells.set(key,{r:rr,c:cc,letter:entry.word[i],dirs:[...(prev?.dirs||[]),d]});keys.push(key)}placed.push({...entry,r,c,d,keys})}
    if(!pending.length)return {cells:[],placed:[],rows:0,cols:0,omitted:[]}
    put(pending.shift(),0,0,'across')
    let progress=true
    while(progress&&pending.length){progress=false;for(let w=pending.length-1;w>=0;w--){const entry=pending[w],options=[]
      for(const cell of cells.values())for(let i=0;i<entry.word.length;i++)if(cell.letter===entry.word[i])for(const d of ['across','down']){
        const dr=d==='down'?1:0,dc=1-dr,r=cell.r-dr*i,c=cell.c-dc*i,len=entry.word.length
        if(cells.has(keyOf(r-dr,c-dc))||cells.has(keyOf(r+dr*len,c+dc*len)))continue
        let ok=true,crossings=0
        for(let j=0;j<len;j++){const rr=r+dr*j,cc=c+dc*j,existing=cells.get(keyOf(rr,cc));if(existing){if(existing.letter!==entry.word[j]||existing.dirs.includes(d)){ok=false;break}crossings++}else if(cells.has(keyOf(rr-dc,cc-dr))||cells.has(keyOf(rr+dc,cc+dr))){ok=false;break}}
        const all=[...cells.values(),{r,c},{r:r+dr*(len-1),c:c+dc*(len-1)}],height=Math.max(...all.map(x=>x.r))-Math.min(...all.map(x=>x.r))+1,width=Math.max(...all.map(x=>x.c))-Math.min(...all.map(x=>x.c))+1
        if(ok&&crossings&&height<=15&&width<=15)options.push({r,c,d,score:crossings*30-height*width*.12-Math.abs(height-width)+rng()})
      }
      if(options.length){options.sort((a,b)=>b.score-a.score);const x=options[0];put(entry,x.r,x.c,x.d);pending.splice(w,1);progress=true}
    }}
    const all=[...cells.values()],minR=Math.min(...all.map(x=>x.r)),minC=Math.min(...all.map(x=>x.c)),rows=Math.max(...all.map(x=>x.r))-minR+1,cols=Math.max(...all.map(x=>x.c))-minC+1
    const score=placed.length*1000-rows*cols
    if(!best||score>best.score){const shifted=placed.map(p=>({...p,r:p.r-minR,c:p.c-minC,keys:p.keys.map(k=>{const [r,c]=k.split(',').map(Number);return keyOf(r-minR,c-minC)})})).sort((a,b)=>a.r-b.r||a.c-b.c);const nums=new Map();shifted.forEach(p=>{const k=keyOf(p.r,p.c);if(!nums.has(k))nums.set(k,nums.size+1);p.number=nums.get(k)})
      best={score,rows,cols,placed:shifted,omitted:pending.map(x=>x.display),cells:Array.from({length:rows*cols},(_,i)=>{const r=Math.floor(i/cols),c=i%cols,key=keyOf(r,c);return {key,r,c,letter:cells.get(keyOf(r+minR,c+minC))?.letter||'',number:nums.get(key)}})}
    }
  }
  return best
}
export function wordSearch(entries,seed=1,diagonal=false){const rng=random(seed),words=[...new Set(entries.map(normalize))].filter(w=>w.length>=2&&w.length<=12),n=Math.max(8,...words.map(w=>w.length+1)),grid=Array(n*n).fill(''),placed=[];for(const word of [...words].sort((a,b)=>b.length-a.length)){const candidates=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)for(const [dr,dc] of (diagonal?[[0,1],[1,0],[1,1]]:[[0,1],[1,0]])){const keys=Array.from(word,(_,i)=>(r+dr*i)*n+c+dc*i);if(r+dr*(word.length-1)<n&&c+dc*(word.length-1)<n&&keys.every((k,i)=>!grid[k]||grid[k]===word[i]))candidates.push(keys)}if(candidates.length){const keys=candidates[Math.floor(rng()*candidates.length)];keys.forEach((k,i)=>grid[k]=word[i]);placed.push({word,keys})}}const letters='אבגדהוזחטיכלמנסעפצקרשת';return {n,placed,grid:grid.map(c=>c||letters[Math.floor(rng()*letters.length)])}}
export function countSudoku(board,n,limit=2){const box=Math.sqrt(n),a=[...board];function solve(){let at=-1,choices=null;for(let k=0;k<a.length;k++)if(!a[k]){const r=Math.floor(k/n),c=k%n,used=new Set();for(let j=0;j<n;j++){used.add(a[r*n+j]);used.add(a[j*n+c]);used.add(a[(Math.floor(r/box)*box+Math.floor(j/box))*n+Math.floor(c/box)*box+j%box])}const possible=Array.from({length:n},(_,i)=>i+1).filter(v=>!used.has(v));if(!possible.length)return 0;if(!choices||possible.length<choices.length){at=k;choices=possible}}if(at<0)return 1;let count=0;for(const v of choices){a[at]=v;count+=solve();if(count>=limit)break}a[at]=0;return count}return solve()}
export function sudoku(n=4,seed=1){const rng=random(seed),box=Math.sqrt(n),groups=Array.from({length:box},(_,i)=>i),order=()=>shuffle(groups,rng).flatMap(g=>shuffle(groups,rng).map(i=>g*box+i)),rs=order(),cs=order(),digits=shuffle(Array.from({length:n},(_,i)=>i+1),rng),solution=rs.flatMap(r=>cs.map(c=>digits[(r*box+Math.floor(r/box)+c)%n])),board=[...solution];let holes=0;for(const i of shuffle(Array.from({length:n*n},(_,i)=>i),rng)){const saved=board[i];board[i]=0;if(countSudoku(board,n)!==1)board[i]=saved;else holes++;if(holes>=Math.floor(n*n*.55))break}return {n,board,solution}}

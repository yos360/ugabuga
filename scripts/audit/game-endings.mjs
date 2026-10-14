// Run with AUDIT_BASE/CHROME_PATH: node scripts/audit/game-endings.mjs
// Completes puzzles using visible board geometry; never changes application/React state.
import {chromium} from 'playwright'
import {writeFileSync} from 'node:fs'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',results=[]
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(2000)
await page.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
const ended=async()=>!!await page.locator('.arc-end').count()
for(const slug of ['minesweeper','battleship','sliding-puzzle','traffic-jam','block-puzzle','solitaire','spider-solitaire'].filter(s=>!process.env.AUDIT_GAME_FILTER||new RegExp(process.env.AUDIT_GAME_FILTER).test(s))){const r={slug,moves:0};try{
 await page.goto(base+'/online-games/'+slug);await page.getByRole('button',{name:/שחקו עכשיו/}).click();await page.locator('.arc-game').waitFor()
 if(slug==='minesweeper'){for(let i=0;i<81&&!await ended();i++){await page.getByRole('button',{name:'סגור',exact:true}).first().click();r.moves++;await page.waitForTimeout(100)}}
 if(slug==='battleship'){await page.getByRole('button',{name:'▶ מתחילים!',exact:true}).click();for(let i=0;i<100&&!await ended();i++){await page.waitForFunction(()=>document.querySelector('.arc-end,button.bs2-cell.is-target'),{},{timeout:20000});if(await ended())break;await page.locator('button.bs2-cell.is-target').first().click();r.moves++;await page.waitForTimeout(100)}}
 if(slug==='sliding-puzzle'){
  const board=await page.locator('.sl-tile').evaluateAll(es=>{const out=Array(9).fill(0);for(const e of es){const m=e.style.transform.match(/translate\(([^,]+),\s*([^)]+)\)/);const xs=es.map(x=>parseFloat(x.style.transform.match(/translate\(([^,]+)/)[1]));const ys=es.map(x=>parseFloat(x.style.transform.match(/,\s*([^)]+)/)[1]));const xvals=[...new Set(xs)].sort((a,b)=>a-b),yvals=[...new Set(ys)].sort((a,b)=>a-b);out[yvals.indexOf(parseFloat(m[2]))*3+xvals.indexOf(parseFloat(m[1]))]=+e.textContent}return out})
  const start=board.join(''),goal='123456780',queue=[start],prev=new Map([[start,null]])
  for(let q=0;q<queue.length&&!prev.has(goal);q++){const s=queue[q],z=s.indexOf('0');for(const j of [z-3,z+3,z-1,z+1]){if(j<0||j>8||Math.abs(j-z)===1&&Math.floor(j/3)!==Math.floor(z/3))continue;const a=[...s];[a[z],a[j]]=[a[j],a[z]];const next=a.join('');if(!prev.has(next)){prev.set(next,[s,+s[j]]);queue.push(next)}}}
  const moves=[];for(let s=goal;s!==start;){const p=prev.get(s);if(!p)throw Error('No solution from visible board');moves.unshift(p[1]);s=p[0]}for(const n of moves){await page.getByRole('button',{name:'אריח '+n,exact:true}).click();r.moves++}
 }
 if(slug==='traffic-jam'){for(let i=0;i<100&&!await ended();i++){await page.getByRole('button',{name:'רמז',exact:true}).click();const car=page.locator('.tj-car.is-hint');if(!await car.count())break;const b=await car.boundingBox(),board=await page.locator('.tj-board').boundingBox(),text=await page.locator('.arc-toast').innerText(),step=board.width/6;const dx=text.includes('ימינה')?step:text.includes('שמאלה')?-step:0,dy=text.includes('למטה')?step:text.includes('למעלה')?-step:0;await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+dx,b.y+b.height/2+dy,{steps:5});await page.mouse.up();r.moves++;await page.waitForTimeout(180)}}
 if(slug==='block-puzzle'){for(let turn=0;turn<150&&!await ended();turn++){
  const move=await page.evaluate(()=>{const board=[...document.querySelectorAll('.bp-board .bp-cell')].map(e=>e.classList.contains('is-full'));const slots=[...document.querySelectorAll('.bp-slot')];for(let i=0;i<slots.length;i++){const shape=[...slots[i].querySelectorAll('.bp-mini')].map(e=>[parseInt(e.style.gridColumn)-1,parseInt(e.style.gridRow)-1]);if(!shape.length)continue;for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(shape.every(([dx,dy])=>x+dx<8&&y+dy<8&&!board[(y+dy)*8+x+dx]))return{i,index:y*8+x}}return null})
  if(!move)break;await page.locator('.bp-slot').nth(move.i).click();await page.locator('.bp-board .bp-cell').nth(move.index).click();r.moves++;await page.waitForTimeout(220)
 }}
 if(slug==='solitaire'||slug==='spider-solitaire'){for(let i=0;i<120&&!await ended();i++){await page.getByRole('button',{name:'רמז',exact:true}).click();const hint=page.locator('.cd.is-hint,.cd-slot.is-active,.cd-slot.is-hint').first();if(!await hint.count())break;const b=await hint.boundingBox();await page.mouse.click(b.x+b.width/2,b.y+5);r.moves++;await page.waitForTimeout(150)}}
 await page.waitForTimeout(650);r.end=await ended();r.status=r.end?'pass':'partial'
 }catch(e){r.end=await ended();r.status=r.end?'pass':'fail';if(!r.end)r.error=e.message}results.push(r);writeFileSync(process.env.AUDIT_GAME_OUTPUT||'out/audit/game-endings.json',JSON.stringify(results,null,2));console.log(r)
}
await browser.close()

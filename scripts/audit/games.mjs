// Run: AUDIT_BASE=... CHROME_PATH=... node scripts/audit/games.mjs
// UI-only game actions. Reports incomplete end-screen coverage explicitly, never as a pass.
import {chromium} from 'playwright'
import {readFileSync,writeFileSync} from 'node:fs'
import assert from 'node:assert/strict'
const base=process.env.AUDIT_BASE||'http://127.0.0.1:5199',results=[]
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined})
const context=await browser.newContext({viewport:{width:390,height:844}})
await context.route('**/*',r=>r.request().url().startsWith(base)&&['GET','HEAD'].includes(r.request().method())?r.continue():r.abort())
const page=await context.newPage();page.setDefaultTimeout(3500)
const end=async()=>await page.locator('.arc-end').count()>0||await page.getByRole('button',{name:/עוד משחק/}).count()>0
const slugs=[...readFileSync('src/arcade/registry.js','utf8').matchAll(/slug: '([^']+)'/g)].map(m=>m[1])
for(const slug of slugs.filter(s=>!process.env.AUDIT_FILTER||new RegExp(process.env.AUDIT_FILTER).test(s))){const r={slug,started:false,moves:0,end:false},errors=[];const onError=e=>errors.push(e.message);page.on('pageerror',onError)
 try{await page.goto(base+'/online-games/'+slug);await page.getByRole('button',{name:/שחקו עכשיו/}).click();await page.locator('.arc-body .arc-game').waitFor();r.started=true
 const click=async loc=>{await loc.click();r.moves++}
 if(slug==='tic-tac-toe'||slug==='four-in-a-row'){
  await page.getByRole('button',{name:'👥 שניים',exact:true}).click();for(const i of slug==='tic-tac-toe'?[0,3,1,4,2]:[0,1,0,1,0,1,0])await click(page.locator(slug==='tic-tac-toe'?'.ttta-cell':'.c4a-col').nth(i))
 }else if(slug==='arrow-escape'){
  for(let i=0;i<80&&!await end();i++){await page.getByRole('button',{name:'רמז',exact:true}).click();const hint=page.locator('.ae-tile.is-hint');if(!await hint.count())break;await click(hint);await page.waitForTimeout(100)}
 }else if(slug==='flying-cubes'){
  await page.getByRole('button',{name:'רמז',exact:true}).click();const box=await page.locator('.fc-canvas').boundingBox();for(const[x,y]of [[.5,.5],[.6,.5],[.4,.5],[.5,.4],[.5,.6]]){await page.mouse.click(box.x+box.width*x,box.y+box.height*y);r.moves++;await page.waitForTimeout(400)}
 }else if(slug==='ball-sort'){
  const initial=await page.locator('.bs-tube').evaluateAll(es=>es.map(e=>e.innerText.trim().split(/\s+/).filter(Boolean)))
  // The visible tube labels are rendered bottom-to-top. Search legal moves from those symbols.
  const seen=new Set(),solve=(state,path=[])=>{if(state.every(t=>!t.length||(t.length===4&&t.every(c=>c===t[0]))))return path;if(path.length>45)return null;const key=state.map(t=>t.join('')).join('|');if(seen.has(key))return null;seen.add(key);for(let a=0;a<state.length;a++)for(let b=0;b<state.length;b++){const s=state[a],d=state[b];if(a===b||!s.length||d.length===4||(d.length&&d.at(-1)!==s.at(-1))||(!d.length&&s.every(c=>c===s[0])))continue;const next=state.map(t=>[...t]);next[b].push(next[a].pop());const result=solve(next,[...path,[a,b]]);if(result)return result}return null}
  const solution=solve(initial);if(solution){for(const[a,b]of solution){await click(page.locator('.bs-tube').nth(a));await click(page.locator('.bs-tube').nth(b))}}else{await click(page.locator('.bs-tube').nth(0));await click(page.locator('.bs-tube').nth(3));r.note='Solver did not find a finish within its bound'}
 }else if(slug==='minesweeper'){
  for(let i=0;i<80&&!await end();i++){const cell=page.getByRole('button',{name:'סגור',exact:true}).first();if(!await cell.count())break;await click(cell)}
 }else if(slug==='sudoku'){
  await page.getByRole('button',{name:'קטנטנים 4×4',exact:true}).click();for(let i=0;i<16&&!await end();i++)await click(page.getByRole('button',{name:'רמז',exact:true}))
 }else if(slug==='memory'){
  const values=await page.locator('.mm-card').allTextContents();await page.waitForTimeout(2400);const pairs=new Map();values.forEach((v,i)=>{if(!pairs.has(v))pairs.set(v,[]);pairs.get(v).push(i)});for(const ids of pairs.values()){for(const i of ids)await click(page.locator('.mm-card').nth(i));await page.waitForTimeout(450)}
 }else if(slug==='word-guess'){
  await page.getByRole('button',{name:/רמז — מה הנושא/}).click();assert.ok(await page.locator('.wg5-hint').count());await page.getByRole('button',{name:/רמז/}).first().click()
  const type=async word=>{for(const c of word)await page.locator('.wg-key').filter({hasText:new RegExp('^'+c+'$')}).click();await page.getByRole('button',{name:'✓ בדיקה',exact:true}).click();r.moves++}
  await type('קקקקק');assert.ok((await page.locator('.wg5-msg').innerText()).includes('לא במילון'));for(let i=0;i<5;i++)await page.getByRole('button',{name:'מחיקת אות',exact:true}).click()
  await page.getByRole('button',{name:'⚡ מרתון',exact:true}).click();await page.getByLabel('רק מילים מהמילון').uncheck();for(let i=0;i<6;i++)await type('קקקקק')
 }else if(slug==='snake'){
  await page.getByRole('button',{name:'🌀 קלאסי: קירות פתוחים',exact:true}).click();await page.locator('.sn-mode').first().click();await page.keyboard.press('ArrowRight');r.moves++;await page.waitForTimeout(6000)
 }else if(slug==='whack-a-mole'){
  await click(page.locator('.wm-hole').first());for(let i=0;i<6;i++){await page.waitForTimeout(500);const mole=page.getByRole('button',{name:'חפרפרת!',exact:true}).first();if(await mole.count())await click(mole)}await page.waitForTimeout(43000)
 }else if(slug==='falling-blocks'){
  await page.locator('.arc-body canvas').first().click();for(let i=0;i<60&&!await end();i++){await page.keyboard.press('Space');r.moves++;await page.waitForTimeout(60)}
 }else if(slug==='merge-2048'){
  for(let i=0;i<1200&&!await end();i++){await page.keyboard.press(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp'][i%4]);r.moves++;if(i%20===0)await page.waitForTimeout(20)}
 }else if(slug==='battleship'){
  await page.getByRole('button',{name:'▶ מתחילים!',exact:true}).click();for(let i=0;i<100&&!await end();i++){const cell=page.locator('button.bs2-cell.is-target').first();if(!await cell.count())break;await click(cell);await page.waitForTimeout(600)}
 }else if(slug==='sliding-puzzle'){
  for(let i=0;i<12;i++)await click(page.locator('.sl-tile').nth(i%8))
 }else if(slug==='traffic-jam'){
  await page.getByRole('button',{name:'רמז',exact:true}).click();const car=page.locator('.tj-car').first(),b=await car.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+40,b.y+b.height/2,{steps:10});await page.mouse.up();r.moves++
 }else if(slug==='block-puzzle'){
  for(let i=0;i<3;i++){await click(page.locator('.bp-slot').nth(i));await page.locator('.arc-field').click({position:{x:100+i*20,y:100}});r.moves++}
 }else if(slug==='solitaire'||slug==='spider-solitaire'){
  await page.getByRole('button',{name:'רמז',exact:true}).click();const board=page.locator('.arc-field');for(let i=0;i<4;i++){await board.click({position:{x:35+i*65,y:40}});r.moves++}
 }
 await page.waitForTimeout(650);r.end=await end();r.status=r.end?'pass':'partial';if(!r.end)r.note=r.note||'Started and exercised controls; end screen not verified'
 }catch(e){r.status='fail';r.error=e.message}r.errors=errors;page.off('pageerror',onError);results.push(r);writeFileSync(process.env.AUDIT_GAMES_OUTPUT||'out/audit/games.json',JSON.stringify(results,null,2));console.log(r)
}
await browser.close()

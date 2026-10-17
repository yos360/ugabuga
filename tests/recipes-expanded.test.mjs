import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ALL_EXPANDED_RECIPES as recipes, NEW_CAKES, NEW_KIDS_RECIPES, SHABBAT_RECIPES } from '../src/data/recipesExpanded.js'
import { recipeSchema, formatIngredient, UNITS } from '../src/data/cakes.js'
import { RECIPES } from '../src/family/kidsKitchen.js'
const get=slug=>recipes.find(r=>r.slug===slug)
const quantities=slug=>get(slug).ingredients.flatMap(g=>g.items).map(({q,u,metric})=>[q,u,metric??null])
test('30 additions, no duplicate paths, complete printable recipe metadata',()=>{
  assert.equal(NEW_CAKES.length,10);assert.equal(NEW_KIDS_RECIPES.length,10);assert.equal(SHABBAT_RECIPES.length,10)
  assert.equal(new Set(recipes.map(r=>r.path)).size,31)
  const sitemap=readFileSync(new URL('../public/sitemap-static.xml',import.meta.url),'utf8')
  for(const r of recipes){
    assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${r.path}</loc>`),r.path)
    assert.ok(r.description.length<=165&&r.intro.length>=2&&r.faq.length>=3,r.slug)
    assert.ok(r.servings>0&&r.pan&&r.time.prep>0,r.slug)
    assert.ok(r.steps.flatMap(g=>g.items).length>=3,r.slug)
    assert.ok(r.steps.flatMap(g=>g.items).every(s=>/^🧒 הילד\/ה עושה:|^🧑 מבוגר עושה:/.test(s)),r.slug)
    assert.ok(r.ingredients.flatMap(g=>g.items).every(i=>i.q>0&&i.u in UNITS),r.slug)
    if(r.steps.flatMap(g=>g.items).some(s=>/אופים/.test(s)))assert.ok(r.ovenC>=150&&r.ovenC<=220,r.slug)
    assert.equal(recipeSchema(r).url,`https://ugabuga.co.il${r.path}`)
    assert.ok(recipeSchema(r).recipeInstructions.length>=3)
  }
  assert.equal(RECIPES.filter(r=>r.slug==='pancakes').length,1)
  assert.equal(RECIPES.find(r=>r.slug==='pancakes').recipe,get('pancakes'))
})
test('Addition exact pancake quantities, including the corrected tablespoon of baking powder and fat',()=>{
  const base=[[1.5,'cup',190],[2,'tbsp',25],[1,'tbsp',null],[.25,'tsp',null]]
  assert.deepEqual(quantities('pancakes'),[...base,[1.25,'cup',300],[1,'egg',null],[3,'tbsp',40],[1,'tsp',null]])
  assert.deepEqual(quantities('pancakes-parve'),[...base,[1.25,'cup',300],[1,'egg',null],[3,'tbsp',45],[1,'tsp',null]])
  assert.deepEqual(quantities('banana-pancakes'),[[1,'',null],[2,'egg',null]])
  assert.deepEqual(quantities('oat-pancakes'),[[1,'cup',90],[1,'',null],[1,'egg',null],[.5,'cup',120],[1,'tsp',null],[1,'pinch',null]])
  for(const slug of ['pancakes','pancakes-parve','oat-pancakes']) assert.match(get(slug).steps[0].items.join(' '),/5 דקות/)
  assert.match(get('banana-pancakes').steps[0].items.join(' '),/כף בלילה/)
})
test('Addition exact cupcakes and frosting formulas, yields and temperatures',()=>{
  assert.deepEqual(quantities('chocolate-cupcakes'),[[1,'cup',200],[.875,'cup',110],[1/3,'cup',35],[.75,'tsp',null],[.75,'tsp',null],[.5,'tsp',null],[1,'egg',null],[.5,'cup',120],[.25,'cup',60],[1,'tsp',null],[.5,'cup',120]])
  assert.deepEqual(quantities('vanilla-cupcakes-parve'),[[2,'egg',null],[.75,'cup',150],[.5,'cup',120],[.5,'cup',120],[1,'tsp',null],[1.5,'cup',190],[2,'tsp',null],[1,'pinch',null]])
  assert.deepEqual(quantities('buttercream'),[[110,'g',null],[1.75,'cup',210],[1,'tbsp',15],[.5,'tsp',null]])
  assert.deepEqual(quantities('ganache'),[[100,'g',null],[100,'ml',null]])
  for(const [slug,n] of [['chocolate-cupcakes',15],['vanilla-cupcakes-parve',12]]){assert.equal(get(slug).ovenC,180);assert.equal(get(slug).servings,n);assert.match(get(slug).steps[0].items.join(' '),/18–20/)}
})
test('metric and cup quantities scale together, including seven eighths',()=>{
  const flour=get('chocolate-cupcakes').ingredients[0].items[1]
  assert.equal(formatIngredient(flour),'⅞ כוס קמח (110 גרם)')
  assert.equal(formatIngredient(flour,2),'1¾ כוסות קמח (220 גרם)')
  assert.equal(formatIngredient(get('pancakes').ingredients[0].items[4],2),'2½ כוסות חלב (600 מ״ל)')
})
test('challah hydration and conventional cookie ratios stay in a practical range',()=>{
  for(const r of SHABBAT_RECIPES.filter(r=>r.category==='challah')){
    const water=r.ingredients[0].items.find(i=>i.name==='מים').metric
    assert.ok((water+35)/500>=.5&&(water+35)/500<=.7,r.slug)
  }
  for(const slug of ['chocolate-chip-cookies','butter-cookies']){
    const items=get(slug).ingredients[0].items,flour=items.find(i=>i.name==='קמח').metric,butter=items.find(i=>i.name.startsWith('חמאה')).q
    assert.ok(flour/butter>=1&&flour/butter<=1.7,slug)
  }
})

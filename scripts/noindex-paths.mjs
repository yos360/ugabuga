// Thin template pages that Google crawled and chose not to index ("נסרק אך לא נכלל באינדקס" in Search
// Console, examples export of 2026-11-03). Only families that are near-identical variants are listed:
// numbered colouring drawings (Hebrew and English), colour-by-number sheets and single baby-name pages.
// Not in the index means 0 clicks and 0 impressions, so nothing that brings visitors is lost.
// The pages stay live and linked for visitors; they are just:
//   - prerendered with <meta name="robots" content="noindex, follow"> (scripts/prerender.mjs),
//   - held back from the sitemaps sent to Google (scripts/sitemap-groups.mjs).
// Undo: remove entries here, rebuild, resubmit the sitemap. Log: docs/seo/noindex-thin-pages.md.
const groups = (base, spec) => spec.split('|').flatMap(g => { const [slug, nums] = g.split(':'); return nums.split(',').map(n => `${base}/${slug}/${n}`) })

const COLORING = 'airplane:2,7,8,9|balloons:1,9|bee:2,3,4,5|birds:2,8|bunny:1,3,4,5,7,9|butterfly:1,2,3,7,8|cake:1,3,5,6,7,8,9|cat:1,5|clown:3,5,6,7,9|cow:1,2,3,4,9|dinosaur:1,2,3,7|dog:1,6,7|dolphin:3,8,9|dragon:1,5,6,7|dreidel:4|elephant:2,5,6,7,8,9|fish:1,2,4,6,7,9|flowers:1,4|food:1,4,5,6,9|fruits:4|hanukkiah:5,6,9|hearts:5,7,9|horse:1,2,3,4,6,7,8|ice-cream:2,7,8|lion:1,3,5|mandala-adults:7,9|mandala-animals:10,4,9|mandala-kids:1,10,6,9|monkey:4,5,8,9|older-kids:1,4|penguin:1,4|princess:3,5,6,8|purim-masks:3,4,6,7|rainbow-sun:1,4,5|seahorse:1,5,7|seal:4|soccer:2,3,5,7|starfish:5,6,7|sufganiyah:2,4|superhero:2,4,6,7,8,9|sweets:1,3,5,6,7,8|tiger:1,3|tu-bishvat:4,5,8,9|turtle:5,6,7,9|umbrella:1,3,5,6,7,8,9|unicorn:8,9|vehicles:1,3,4'
const EN_COLORING = 'hanukkah:1,19,22,28,29,30,33,6|lag-baomer:2,3,5,6|passover:1,5,6|purim:1,12,13,3,9|rosh-hashanah:1,4,5|shavuot:1,2,4,5,6|sukkot:1,3|tu-bishvat:1,15,2,4|yom-kippur:5,6'
const COLOR_BY_NUMBER = 'airplane,apple,autumn-leaf,bee,bus,butterfly,cheese,coral-reef,dreidel,fireworks,fish,fox,frog,gift,hamantasch,hanukkiah,honey-jar,hot-air-balloon,house,ice-cream,kiddush-cup,lighthouse,penguin,pizza,rocket,snowman,sufganiyah,sukkah,train,tree,umbrella,watermelon,whale'
const BABY_NAMES = 'agam,aharon,alma,almog,alon,amichai,amir,amit,amos,arbel,ariel,arye,avichai,aviya,barak,dafna,daniel,dor,dvora,eitan,ela,elad,elazar,elchanan,eliezer,elior,eliya,elkana,emuna,eran,erez,ester,evyatar,eyal,gad,gaia,gal,gavriel,gefen,gidon,gilad,gili,hadasa,hanan,hava,hodaya,idan,ilan,ilana,inbar,kalanit,keren,leah,levana,liam,liat,liel,lior,liron,lital,lotem,malka,matan,matanya,may,maya,meir,menashe,miriam,mor,moran,mordechai,moshe,naama,nadav,naftali,nahum,naomi,nehama,nehorai,neriya,neta,netanel,nevo,nir,noa,noam,noga,ofek,ofir,omer,or,orel,ori,ovadya,oz,pnina,rachel,rakefet,ravid,raz,renana,roni,rotem,roy,sahar,shalva,shani,shifra,shimon,shimshon,shira,shiran,shlomit,shmuel,sivan,tal,talya,tamar,tomer,tzipora,uriel,uriya,vered,victoria,yaakov,yaara,yael,yahali,yasmin,yechiel,yedidya,yehonatan,yehoshua,yehudit,yeshayahu,yiftach,yonatan,zevulun,ziv,zohar'

export const NOINDEX_PATHS = new Set([
  ...groups('/printables/coloring', COLORING),
  ...groups('/en/coloring', EN_COLORING),
  ...COLOR_BY_NUMBER.split(',').map(s => `/printables/color-by-number/${s}`),
  ...BABY_NAMES.split(',').map(s => `/baby-names/name/${s}`),
])

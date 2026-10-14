// Original hand-authored vector drawings for Ugabuga, dedicated to CC0-1.0.
// All geometry below was drawn for this collection; no vendor artwork or fonts.
import { mkdir, writeFile } from 'node:fs/promises'
const C={ink:'#493449',gold:'#ffc857',orange:'#f49b49',red:'#ef6b72',pink:'#ffb4c3',blue:'#64b6ed',green:'#75c99a',cream:'#fff1ce',white:'#fffdf5',brown:'#b9784e',purple:'#b29be0'}
const path=(d,fill='none',extra='')=>`<path d="${d}" fill="${C[fill]||fill}" ${extra}/>`
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${C[fill]||fill}"/>`
const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C[fill]||fill}" ${extra}/>`
const rect=(x,y,w,h,fill,rx=4)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${C[fill]||fill}"/>`
const line=(x,y,a,b)=>path(`M${x} ${y}L${a} ${b}`)
const star=(x,y)=>path(`M${x} ${y-7}L${x+2} ${y-2}L${x+7} ${y}L${x+2} ${y+2}L${x} ${y+7}L${x-2} ${y+2}L${x-7} ${y}L${x-2} ${y-2}Z`,'gold')
const flame=(x,y)=>path(`M${x} ${y-12}C${x+15} ${y+1} ${x+7} ${y+11} ${x} ${y+10}C${x-10} ${y+9} ${x-10} ${y} ${x} ${y-12}Z`,'gold')
const leaf=(x,y,angle=0)=>ellipse(x,y,5,11,'green',`transform="rotate(${angle} ${x} ${y})"`)
const seeds=(points)=>points.map(([x,y])=>ellipse(x,y,1,2,'cream','stroke-width="0.4"')).join('')
const cup=(fill='purple')=>ellipse(50,83,22,5,'gold')+rect(46,56,8,25,'gold')+path('M25 25H75L70 50Q50 72 30 50Z',fill)+ellipse(50,25,25,6,'red')
const apple=()=>path('M50 32C21 17 17 48 26 65C35 84 44 73 50 75C60 73 67 83 77 62C86 40 74 19 50 32Z','red')+path('M50 32Q45 19 54 13')+leaf(64,20,55)+path('M32 39Q26 46 31 53','none','stroke="#fffdf5"')
const entries=[]
function add(slug,name,group,situations,art){entries.push({slug,name,group,situations,art})}
add('dreidel','סביבון','hanukkah',['hanukkah'],rect(45,12,10,20,'gold')+path('M25 34L52 25L76 37V65L51 89L25 66Z','blue')+path('M25 34L51 46L76 37M51 46V89')+path('M35 46H41V62H33')+star(83,20))
add('sufganiya','סופגנייה','hanukkah',['hanukkah'],ellipse(50,59,37,27,'orange')+path('M14 57Q50 71 86 57','cream')+ellipse(50,47,34,17,'gold')+path('M25 43Q36 34 48 36M60 37L68 40','none','stroke="#fffdf5" stroke-width="6"')+circle(51,43,7,'red')+path('M49 41Q51 38 54 41','none','stroke="#fffdf5" stroke-width="2"'))
let menorah=rect(29,82,42,6,'gold')+line(50,23,50,82)
for(const x of [14,23,32,41,59,68,77,86]) menorah+=path(`M${x} 43V${55+Math.abs(50-x)/3}Q${x} 76 50 76`)+rect(x-2,33,4,12,'cream',1)+`<g transform="translate(${x} 25) scale(.55)">${flame(0,0)}</g>`
menorah+=rect(47,18,6,13,'cream',1)+`<g transform="translate(50 11) scale(.6)">${flame(0,0)}</g>`
add('hanukkiah','חנוכייה','hanukkah',['hanukkah'],menorah)
add('oil-jug','פך שמן','hanukkah',['hanukkah'],path('M61 35Q91 27 86 53Q80 69 68 60','gold')+path('M39 22H61V40Q80 51 70 75Q50 91 29 75Q20 53 39 40Z','cream')+ellipse(50,22,15,5,'gold')+path('M32 63Q50 73 69 63')+leaf(49,54,45)+line(44,61,57,48))
add('shabbat-candles','נרות שבת','shabbat',['shabbat'],ellipse(50,85,38,7,'purple')+[30,70].map(x=>ellipse(x,78,14,4,'gold')+line(x,48,x,76)+rect(x-7,31,14,22,'cream')+flame(x,18)).join('')+star(50,44))
add('challah','חלה קלועה','shabbat',['shabbat'],ellipse(50,54,39,24,'orange')+[0,1,2,3].map(i=>path(`M${15+i*17} 51Q${18+i*17} 32 ${29+i*17} 35Q${42+i*17} 38 ${36+i*17} 51L${25+i*17} 69Q${13+i*17} 74 ${13+i*17} 61Z`,'gold')).join('')+path('M23 46Q41 47 34 65M40 44Q58 47 51 66M58 44Q76 47 68 65')+seeds([[24,43],[40,40],[56,41],[74,43],[24,59],[42,59],[59,59],[77,55]]))
add('kippah','כיפה','tradition',['bar-bat-mitzvah','shabbat'],path('M15 65Q17 22 50 21Q83 22 85 65Q50 88 15 65Z','blue')+path('M16 63Q50 80 84 63M21 52Q50 66 79 52')+path('M50 23Q36 42 36 61M50 23Q64 42 64 61')+circle(50,24,3,'gold'))
add('kiddush-cup','גביע קידוש','shabbat',['shabbat','wedding'],cup('blue')+path('M35 39L50 48L65 39')+star(83,17))
add('torah-scroll','ספר תורה','tradition',['bar-bat-mitzvah','shavuot'],rect(25,25,50,49,'cream')+rect(18,18,13,65,'gold')+rect(69,18,13,65,'gold')+[24,76].map(x=>circle(x,15,6,'brown')+circle(x,86,6,'brown')).join('')+rect(32,28,36,43,'blue')+path('M42 46L50 32L58 46ZM42 37H58L50 51Z','none')+rect(38,58,24,6,'gold',1))
add('havdalah','נר הבדלה קלוע','shabbat',['shabbat'],[0,1,2,3].map(i=>path(`M35 ${35+i*12}Q50 ${24+i*12} 65 ${35+i*12}L58 ${47+i*12}Q48 ${36+i*12} 35 ${47+i*12}Z`,i%2?'blue':'cream')).join('')+flame(50,18)+ellipse(50,88,27,5,'gold'))
add('shofar','שופר','rosh-hashanah',['rosh-hashanah'],path('M16 28Q25 81 58 76Q84 70 87 27L73 34Q70 59 57 59Q35 63 29 23Z','gold')+ellipse(23,26,11,6,'brown', 'transform="rotate(-20 23 26)"')+path('M33 49L40 44M40 62L47 54M52 72L54 61M66 68L62 59M77 54L68 50'))
add('apple-honey','תפוח בדבש','rosh-hashanah',['rosh-hashanah'],`<g transform="translate(-5 6) scale(.8)">${apple()}</g>`+rect(61,49,26,33,'gold')+ellipse(74,49,13,4,'cream')+line(69,46,83,23)+rect(75,18,16,12,'brown',3)+path('M73 59Q77 68 81 59','cream'))
add('pomegranate','רימון','rosh-hashanah',['rosh-hashanah','tu-bishvat'],circle(50,58,31,'red')+path('M38 29L34 15L45 21L50 11L56 21L67 15L62 30Z','red')+path('M28 51Q27 40 37 37','none','stroke="#fffdf5" stroke-width="4"')+path('M51 45Q72 43 73 64Q60 78 46 65Z','cream')+[[55,53],[65,54],[54,63],[64,65]].map(([x,y])=>circle(x,y,3,'red')).join(''))
add('honey-jar','צנצנת דבש','rosh-hashanah',['rosh-hashanah'],rect(24,29,50,55,'gold',11)+rect(24,20,50,13,'brown')+path('M25 38H74V51Q66 58 62 49Q55 61 48 49Q40 58 34 49L25 50Z','cream')+rect(34,60,29,15,'white')+ellipse(49,68,7,4,'gold')+line(78,42,88,18)+rect(80,13,13,11,'brown',2))
add('sukkah','סוכה','sukkot',['sukkot'],rect(18,30,65,55,'cream')+path('M18 31L18 85M82 31L82 85M14 30H87','none','stroke-width="5"')+rect(39,46,27,39,'brown',0)+path('M16 41Q50 65 84 41')+[29,43,57,71].map((x,i)=>path(`M${x-5} ${46+i%2*4}L${x+5} ${46+i%2*4}L${x} ${55+i%2*4}Z`,['red','blue','gold','green'][i])).join('')+[0,1,2,3,4,5].map(i=>path(`M${13+i*13} 30L${25+i*11} 17L${31+i*10} 29`,'green')).join(''))
add('lulav-etrog','לולב ואתרוג','sukkot',['sukkot'],path('M48 81Q33 36 46 10Q57 37 48 81Z','green')+line(47,18,49,82)+path('M44 76Q22 48 27 30Q44 43 44 76ZM54 76Q73 48 67 31Q51 44 54 76Z','green')+rect(39,66,20,9,'gold',1)+path('M65 70Q58 53 73 49Q87 45 90 62Q99 78 82 84Q66 89 65 70Z','gold')+line(79,50,82,43)+path('M73 61Q69 66 73 73'))
add('etrog','אתרוג','sukkot',['sukkot'],path('M23 51Q19 28 44 25Q64 15 75 39Q91 54 77 73Q67 88 43 79Q20 77 23 51Z','gold')+rect(46,15,9,13,'brown',2)+path('M35 36Q29 51 36 68M48 32Q43 53 49 73M62 36Q58 57 65 71')+leaf(68,19,60))
add('esther-scroll','מגילת אסתר','purim',['purim'],path('M29 22H76V72H36Q24 73 24 83H13V35Q13 22 29 22Z','cream')+path('M34 22V74M24 83H77Q90 83 86 72H37Q25 72 24 83Z','gold')+rect(20,13,13,18,'brown')+path('M45 35H65M45 44H70M45 53H62')+path('M56 65L61 58L66 65','red'))
add('gragger','רעשן','purim',['purim'],rect(42,53,13,33,'gold')+path('M24 22L72 29L77 61L29 54Z','red')+path('M31 28L66 34L68 51L34 47Z','blue')+circle(49,42,6,'gold')+path('M18 20L12 13M80 24L88 19M81 66L89 71'))
add('mishloach-manot','משלוח מנות','purim',['purim'],path('M23 49Q20 14 50 14Q80 14 77 49','none','stroke-width="6"')+rect(28,31,17,28,'red')+circle(61,43,13,'gold')+path('M59 35L63 40M66 47L59 49')+path('M16 49H84L75 83H25Z','brown')+path('M28 60H73M31 71H70M39 50L42 82M61 50L58 82')+path('M48 55Q23 43 29 60Q38 70 50 60Q74 44 70 61Q61 72 50 60Z','pink')+circle(50,60,4,'red'))
add('hamantaschen','אוזן המן','purim',['purim'],path('M50 15L89 77Q92 85 81 85H19Q8 85 13 76L42 20Q47 12 50 15Z','gold')+path('M49 37L70 73H30Z','brown')+path('M18 78L43 27M56 27L82 77M24 80H75','none','stroke="#fff1ce" stroke-width="4"'))
add('festive-crown','כתר חגיגי','purim',['purim','birthday'],path('M18 31L34 47L50 20L67 47L83 31L76 78H25Z','gold')+rect(24,70,53,13,'orange')+circle(50,53,7,'red')+circle(32,60,4,'blue')+circle(69,60,4,'green')+[18,50,83].map((x,i)=>circle(x,i===1?18:29,5,'gold')).join(''))
let matzah=rect(16,17,69,69,'cream',5)
for(let y=28;y<80;y+=10)for(let x=25;x<80;x+=10)matzah+=line(x,y,x+2,y+1)
add('matzah','מצה','pesach',['pesach'],matzah)
add('seder-plate','קערת סדר','pesach',['pesach'],ellipse(50,56,41,32,'blue')+ellipse(50,56,33,25,'cream')+[[31,42],[50,33],[70,43],[30,65],[50,75],[71,66]].map(([x,y],i)=>ellipse(x,y,9,6,'white')+([leaf(x,y,60),ellipse(x,y,6,3,'brown'),ellipse(x,y,5,4,'cream'),path(`M${x-5} ${y}L${x+5} ${y}`,'none','stroke="#b9784e" stroke-width="4"'),circle(x,y,4,'red'),leaf(x,y,30)][i])).join('')+star(50,55))
add('elijah-cup','כוס אליהו','pesach',['pesach'],cup('gold')+path('M35 40Q50 58 65 40')+circle(50,45,4,'blue')+star(17,18))
add('afikoman','אפיקומן עטוף','pesach',['pesach'],rect(20,23,61,60,'cream')+path('M17 45L50 61L84 45V86H17Z','blue')+path('M17 45L50 29L84 45L50 61Z','white')+path('M18 84L41 62M83 84L60 62')+rect(43,45,14,41,'gold',0)+seeds([[30,32],[40,28],[60,30],[69,35]]))
add('haggadah','הגדה של פסח','pesach',['pesach'],path('M17 20H77Q84 20 84 27V80H24Q16 80 16 72Z','red')+path('M24 20V72H83M17 73Q17 83 27 83H83','cream')+rect(34,30,39,31,'gold')+path('M44 40H64M44 49H59')+path('M66 72V91L58 86L51 91V72Z','blue'))
add('bikkurim','סל ביכורים','shavuot',['shavuot','tu-bishvat'],path('M24 53Q23 16 50 16Q79 16 77 53','none','stroke-width="5"')+circle(36,46,13,'red')+leaf(38,31,45)+[0,1,2,3,4].map(i=>circle(61+(i%2)*9,36+Math.floor(i/2)*8,6,'purple')).join('')+path('M17 53H85L75 85H27Z','gold')+path('M23 64H80M27 75H76M38 54L42 84M63 54L59 84'))
add('cheesecake','עוגת גבינה','shavuot',['shavuot'],path('M18 42L69 21L87 51V79L18 76Z','cream')+path('M18 42L69 21L87 51L18 56Z','white')+path('M18 69L87 72V79L18 76Z','brown')+path('M18 55L87 51')+circle(60,35,7,'red')+leaf(67,27,45))
let wheat=line(49,88,49,20)+line(32,87,25,40)+line(65,86,76,39)
for(const [x,y] of [[49,30],[49,45],[49,60],[26,48],[29,61],[74,48],[70,61]])wheat+=ellipse(x-5,y,4,9,'gold','transform="rotate(-35 '+(x-5)+' '+y+')"')+ellipse(x+5,y,4,9,'gold','transform="rotate(35 '+(x+5)+' '+y+')"')
add('wheat','שיבולים','shavuot',['shavuot','tu-bishvat'],wheat+path('M32 78Q49 71 67 78M36 84Q50 78 64 84','none','stroke="#ef6b72" stroke-width="4"'))
add('milk-bag','שקית חלב','everyday',['shavuot'],path('M26 17L75 19L71 31Q83 57 75 84L21 82Q16 60 29 32Z','white')+path('M25 41H74L77 69H22Z','blue')+path('M25 23L72 25M24 77L74 79')+path('M49 44Q65 60 50 66Q35 61 49 44Z','white'))
add('bonfire','מדורת ל״ג בעומר','lag-baomer',['lag-baomer'],path('M18 77L79 88L84 79L23 68Z','brown')+path('M18 87L81 72L77 64L15 79Z','brown')+path('M48 13Q65 28 61 40Q73 35 73 28Q95 64 68 76Q40 88 23 68Q12 49 32 29Q30 48 40 48Q50 36 48 13Z','orange')+path('M49 42Q50 56 59 52Q70 71 52 76Q30 75 39 59Z','gold'))
add('israel-flag','דגל ישראל מתנופף','independence',['independence-day'],line(17,13,17,89)+circle(17,12,4,'gold')+path('M19 20Q37 9 55 21Q72 33 88 20V70Q72 83 54 70Q37 58 19 71Z','white')+path('M20 28Q37 17 55 29Q72 41 87 28V35Q72 48 55 36Q37 24 20 35ZM20 58Q37 47 55 59Q72 71 87 58V65Q72 78 55 66Q37 54 20 65Z','blue','stroke="none"')+path('M45 50L53 37L61 50ZM45 41H61L53 54Z','none','stroke="#3585bc" stroke-width="2"'))
add('grill','מנגל','independence',['independence-day'],path('M24 49Q25 75 50 75Q77 75 78 49Z','red')+ellipse(51,48,29,9,'ink')+path('M27 45L74 50M34 41L65 54','none','stroke="#fff1ce"')+line(35,72,27,88)+line(65,72,74,88)+line(30,84,71,84)+path('M36 31Q27 23 37 15M52 31Q43 23 53 13M67 32Q59 22 69 15'))
add('falafel-pita','פלאפל בפיתה','food',['independence-day'],path('M17 39Q47 14 83 38L73 79Q51 94 29 79Z','cream')+ellipse(50,39,33,12,'brown')+path('M21 42L28 29L37 35L43 24L52 34L62 25L69 37L79 30L81 45Z','green')+[32,50,68].map((x,i)=>circle(x,42-i%2*9,10,'brown')+seeds([[x-3,40-i%2*9],[x+3,44-i%2*9]])).join('')+path('M24 52Q48 68 76 52L69 78Q50 89 33 77Z','gold')+path('M35 62Q49 74 63 65','none','stroke="#fffdf5" stroke-width="5"'))
add('shakshuka','שקשוקה','food',[],rect(75,49,21,10,'brown')+ellipse(44,55,35,28,'ink')+ellipse(44,52,29,22,'red')+[29,55].map((x,i)=>ellipse(x,51+i*5,12,14,'white')+circle(x,51+i*5,6,'gold')).join('')+leaf(43,37,70)+leaf(42,70,90))
add('peanut-snack','חטיף בוטנים','food',[],path('M19 20L75 16L82 82L26 88Z','gold')+path('M19 20L75 16L76 25L20 29ZM25 79L81 73L82 82L26 88Z','orange')+ellipse(49,53,23,19,'cream')+path('M39 44Q31 41 32 49Q34 55 39 55Q44 66 51 60Q56 55 49 51Q46 43 39 44Z','gold')+path('M61 37Q68 35 69 43Q67 50 59 47Q53 51 51 45Q49 37 61 37Z','gold'))
add('popsicle','ארטיק','summer',[],rect(45,63,12,27,'brown',6)+path('M28 31Q28 12 50 12Q74 12 74 31V67Q52 77 28 67Z','pink')+path('M28 46H74V66Q52 76 28 66Z','red')+line(40,26,40,40)+line(61,26,61,40))
add('matkot','מטקות','summer',[],`<g transform="rotate(-24 32 50)">${rect(27,58,11,32,'brown')+ellipse(33,37,20,27,'gold')+ellipse(33,37,13,20,'cream')}</g><g transform="rotate(25 69 51)">${rect(64,62,10,27,'brown')+ellipse(69,40,19,26,'blue')+ellipse(69,40,12,18,'white')}</g>`+circle(51,80,8,'red'))
add('watermelon','פלח אבטיח','summer',[],path('M13 32H87Q83 85 50 87Q18 84 13 32Z','green')+path('M18 33H82Q77 75 50 79Q24 75 18 33Z','cream')+path('M23 33H77Q71 67 50 72Q29 67 23 33Z','red')+[[34,43],[49,43],[64,43],[43,57],[57,58]].map(([x,y])=>ellipse(x,y,1.5,3,'ink')).join(''))
add('sabra','צבר','nature',['tu-bishvat'],ellipse(50,90,26,4,'gold')+ellipse(50,68,15,20,'green')+ellipse(33,41,10,15,'green','transform="rotate(-28 33 41)"')+ellipse(67,41,10,15,'green','transform="rotate(28 67 41)"')+ellipse(27,25,5,6,'red')+ellipse(39,24,5,6,'orange')+ellipse(73,25,5,6,'red')+ellipse(61,24,5,6,'orange')+path('M44 62H46M54 72H56M47 81H49M30 43H32M68 45H70M36 34H38M63 35H65'))
let olive=path('M24 87Q44 54 75 19','none','stroke-width="4"')
for(const [x,y,a] of [[37,64,-45],[50,59,45],[48,45,-45],[64,42,45],[62,27,-45]])olive+=leaf(x,y,a)
add('olive-branch','ענף זית','nature',['tu-bishvat','independence-day'],olive+circle(39,75,5,'purple')+circle(57,51,5,'purple')+circle(71,33,5,'purple'))
add('jerusalem-stone','אבני ירושלים','tradition',['bar-bat-mitzvah'],path('M13 83V38H21V25H39V38H60V25H78V38H88V83Z','cream')+path('M14 52H87M14 67H87M29 38V52M52 38V52M73 38V52M38 52V67M65 52V67M26 67V82M76 67V82')+path('M41 83V71Q41 54 58 62Q64 65 64 74V83Z','gold')+star(49,16))
add('sandals','סנדלים','summer',[],`<g transform="rotate(-17 32 50)">${rect(17,16,28,70,'brown',13)+rect(20,23,22,54,'cream',10)+path('M19 36H44V46H19ZM19 59H44V68H19Z','orange')+rect(30,40,10,6,'gold',1)}</g><g transform="rotate(17 70 54)">${rect(57,22,28,68,'brown',13)+rect(60,28,22,54,'cream',10)+path('M59 42H84V52H59ZM59 65H84V74H59Z','blue')+rect(70,46,10,6,'gold',1)}</g>`)
add('coffee-pot','פינג׳אן','everyday',[],path('M68 40L91 30L94 36L70 48Z','brown')+path('M31 30H63L73 78Q52 91 22 78Z','gold')+ellipse(47,30,16,5,'brown')+path('M33 57H64M31 65H66')+path('M37 20Q29 14 37 8M52 20Q45 13 53 7'))
add('beach-umbrella','שמשיית חוף','summer',[],path('M12 48Q22 13 51 14Q80 16 88 48Q76 41 65 49Q51 41 37 49Q25 42 12 48Z','red')+path('M37 49Q38 23 51 14Q65 25 65 49Q51 42 37 49Z','gold')+path('M51 49V82Q52 90 61 85')+ellipse(51,91,35,4,'cream'))
add('orange','תפוז','nature',['tu-bishvat'],circle(49,57,31,'orange')+path('M48 28Q45 17 53 13')+leaf(64,22,60)+path('M30 45Q25 50 27 58','none','stroke="#fff1ce" stroke-width="4"')+circle(65,65,1,'brown')+circle(59,73,1,'brown')+circle(71,57,1,'brown'))
let blossom=path('M21 87Q44 56 75 18','none','stroke-width="5"')+path('M45 58L22 37M61 37L84 39')+leaf(34,68,-45)
for(const [x,y] of [[29,36],[64,33],[73,60]]){for(const [dx,dy]of [[0,-8],[8,-2],[5,7],[-5,7],[-8,-2]])blossom+=ellipse(x+dx,y+dy,7,7,'pink');blossom+=circle(x,y,5,'gold')}
add('almond-blossom','פריחת השקד','nature',['tu-bishvat'],blossom)

if(entries.length!==48)throw new Error(`Expected 48 drawings, got ${entries.length}`)
const folder=new URL('../public/icons/israeli/',import.meta.url)
await mkdir(folder,{recursive:true})
for(const icon of entries){
  const header=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100" role="img" aria-labelledby="title"><title id="title">${icon.name}</title><metadata>Original Ugabuga vector illustration. Creator: Ugabuga / Codex. License: CC0-1.0. https://creativecommons.org/publicdomain/zero/1.0/</metadata>`
  const wrap=art=>`${header}<g stroke="${C.ink}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">${art}</g></svg>\n`
  await writeFile(new URL(icon.slug+'.svg',folder),wrap(icon.art))
  const outline=icon.art.replace(/<path[^>]*stroke="#fffdf5"[^>]*\/>/g,'').replace(/fill="(?!none)[^"]*"/g,'fill="#ffffff"').replace(/stroke="[^"]*"/g,'stroke="#222222"')
  await writeFile(new URL(icon.slug+'-outline.svg',folder),wrap(outline).replace(`stroke="${C.ink}"`,'stroke="#222222"'))
}
const metadata=entries.map(({art,...i})=>({...i,creator:'Ugabuga / Codex',license:'CC0-1.0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',src:`/icons/israeli/${i.slug}.svg`,outline:`/icons/israeli/${i.slug}-outline.svg`}))
await writeFile(new URL('../src/emoji/israeliIconData.js',import.meta.url),'// Generated by scripts/generate-israeli-icons.mjs from original hand-authored geometry.\nexport const ISRAELI_ICONS = '+JSON.stringify(metadata,null,2)+'\n')
await writeFile(new URL('LICENSE.txt',folder),'Original Israeli and Jewish icon collection\nCreator: Ugabuga / Codex\n48 original hand-authored vector drawings and their outline versions.\n\nTo the extent possible under law, the creator has waived all copyright and related or neighboring rights to these works under CC0 1.0 Universal.\nhttps://creativecommons.org/publicdomain/zero/1.0/legalcode\n\nNo third-party emoji artwork, logos, branded packaging, or likenesses are included.\n')
console.log('Generated 48 original icons, 48 outlines, metadata and CC0 notice.')

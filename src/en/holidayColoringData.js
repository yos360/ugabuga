import { COLORING_SUBJECTS, coloringSrc, coloringFmt } from '../data/coloringSubjects.js'
import { COLORING_DRAWINGS } from '../data/coloringDrawings.js'
// Each row describes a specific existing drawing. Numbers are stable URL identifiers, never titles.
const native={
 'rosh-hashanah':[
 ['apple-honey','Apple and honey for a sweet year','An apple and honey introduce the wish for a sweet new year. Color the fruit and honey separately, then share a kind wish.'],
 ['pomegranate','Rosh Hashanah pomegranate','A pomegranate offers small seed shapes to explore. Try a few shades of red and compare the seeds with the outer skin.'],
 ['shofar','A shofar to welcome the year','The curved shofar is ready to color. Follow its outline and talk about the sound heard at Rosh Hashanah services.'],
 ['hive','Honey hive and bees','Bees and a hive connect the holiday honey with the natural world. Choose a repeated pattern for the hive.'],
 ['card','A New Year greeting card','Decorate this existing New Year card and give it to someone you appreciate. The Hebrew greeting can become a conversation about good wishes.'],
 ['greeting','A good and sweet year in Hebrew','Large Hebrew greeting letters invite careful coloring. The words wish the reader a good and sweet year.']],
 'yom-kippur':[
 ['dove','A dove carrying an olive leaf','A dove and olive leaf suggest peace. Leave some white space around the bird and talk about one way to make peace with a friend.'],
 ['bike','Bicycle and helmet for an Israeli holiday scene','A bicycle and helmet reflect a familiar secular Israeli Yom Kippur scene. Cycling is not a religious observance or a universal holiday custom.'],
 ['shofar','Shofar at the close of Yom Kippur','A shofar and stars recall the close of the fast. Color the horn and night sky with contrasting shades.'],
 ['heart','A heart for forgiveness','A large heart offers room for gentle colors. Think of a concrete action that can help repair a hurt.'],
 ['fish','Jonah and the great fish','The great fish recalls the story of Jonah, read on Yom Kippur. Add ocean colors while discussing listening and second chances.'],
 ['greeting','A Hebrew wish for Yom Kippur','Color the traditional Hebrew greeting gmar chatimah tovah. It expresses a wish for a good sealing in the Book of Life.']],
 sukkot:[
 ['sukkah','A sukkah with decorations','A decorated temporary shelter is ready for holiday guests. Give its roof and hanging decorations different textures.'],
 ['etrog','A Sukkot citron','The etrog is a citron used with the other three species. Look closely at its textured outline before choosing a yellow or green shade.'],
 ['lulav','Palm, myrtle and willow branches','Three leafy species stand together in this drawing. Compare the long palm shape with the smaller leaves.'],
 ['garland','Decorations for the sukkah','A paper decoration chain invites a repeating color pattern. Plan two or three colors and continue the sequence.'],
 ['torah','Torah scroll and celebration flag','A Torah scroll and flag connect the end of the festival season with Simchat Torah. Decorate the flag while leaving the scroll easy to recognize.'],
 ['greeting','Happy Sukkot in Hebrew','Large Hebrew holiday words form a greeting to color. Use a different color for each word and look for repeated letters.']],
 hanukkah:[
 ['hanukkiah','A Hanukkah candle stand','A hanukkiah has eight festival lights and a helper light. Count its places before adding a color pattern.'],
 ['sevivon','A holiday spinning top','The dreidel is a four-sided spinning top. Color the visible faces and learn that its letters may differ in Israel and abroad.'],
 ['sufganiyot','Hanukkah jelly doughnuts','Round sufganiyot recall foods cooked in oil. Choose a filling color and leave a little white space for sugar.'],
 ['pach','A small jug of oil','An oil jug recalls the traditional Hanukkah story. Add a pattern to the jug without covering its outline.'],
 ['candles','Eight festival candles','Eight candles invite counting from one to eight. Make a repeating color sequence and keep the flames distinct.'],
 ['greeting','Happy Hanukkah in Hebrew','Color a Hebrew Hanukkah greeting. Find the repeated letters and use the finished page as a seasonal decoration.']],
 'tu-bishvat':[
 ['tree','My Tu BiShvat tree','A broad tree offers fruit and branches to explore. Give the trunk a different texture from the crown.'],
 ['almond','Almond blossom branches','Almond blossoms mark a familiar Tu BiShvat theme in Israel. Keep the petals light and give the branches stronger outlines.'],
 ['species','The seven species of the land','Seven traditional crops share this page. Identify wheat, barley, grapes, figs, pomegranates, olives and dates together.'],
 ['pomegranate','A pomegranate for Tu BiShvat','A pomegranate connects the holiday with tree fruit. Notice the crown at the top and color the seeds carefully.'],
 ['grapes','A bunch of Tu BiShvat grapes','A cluster of grapes offers repeated round shapes. Try green grapes, purple grapes or a pattern of your own.'],
 ['greeting','Happy Tu BiShvat in Hebrew','A Hebrew greeting celebrates the New Year for Trees. Decorate the letters with colors inspired by leaves and fruit.']],
 purim:[
 ['mask','A festive Purim mask','A decorated mask invites symmetrical color choices. Compare the two sides before adding your own pattern.'],
 ['raashan','A Purim noisemaker','The raashan is a traditional Purim noisemaker. Color its handle and body in contrasting shades.'],
 ['hamantaschen','Triangular Purim pastries','Hamantaschen have a familiar triangular shape and a center of filling. Choose different filling colors for a pretend bakery.'],
 ['crown','Queen Esther crown','A crown recalls Esther in the Purim story. Decorate its details and discuss a brave choice Esther made.'],
 ['basket','A Purim food-gift basket','A basket represents mishloach manot, gifts of food. Color the contents and think about someone you could include.'],
 ['greeting','Happy Purim in Hebrew','Large Hebrew greeting letters make a cheerful Purim page. Choose a bright palette and find a letter you already know.']],
 passover:[
 ['seder-plate','A labeled Passover seder plate','A seder plate shows symbolic foods with Hebrew labels. An adult can help match each item with its role in telling the Exodus story.'],
 ['matza','Matzah for the seder table','Flat matzah has a textured, dotted surface. Try light brown shading and leave some pale areas to suggest its crisp surface.'],
 ['cup','Elijah cup for Passover','A decorated cup recalls Elijah cup at the seder. Color the cup and its central decoration with contrasting tones.'],
 ['frog','A frog from the Exodus story','A large frog recalls one of the plagues in the Passover story. Give its body and belly different shades of green.'],
 ['pyramids','Egyptian pyramids and a palm tree','Pyramids and a palm tree create an Egyptian setting. They are scenery, not a claim that the Israelites built the pyramids.'],
 ['greeting','Happy Passover in Hebrew','Color the Hebrew words for a happy Passover. Look at the letters before choosing a color for each word.']],
 'lag-baomer':[
 ['bonfire','A Lag BaOmer bonfire on paper','A drawn bonfire offers flame and log shapes to color. This paper activity needs no real flame.'],
 ['bow','A Lag BaOmer bow and arrow','A traditional bow-and-arrow motif appears in this line drawing. Color it as a holiday symbol rather than instructions for using a weapon.'],
 ['potatoes','Potatoes beside the embers','Potatoes in a campfire scene recall an outdoor gathering. Use warm colors for the embers and earthy colors for the food.'],
 ['marshmallow','A marshmallow on a stick','A marshmallow on a long stick suggests a campfire snack. Choose how toasted it looks in your picture.'],
 ['tent','A night in a tent','A tent makes an outdoor holiday scene. Add colors that suggest evening and talk about enjoying nature together.'],
 ['greeting','Happy Lag BaOmer in Hebrew','A Hebrew holiday greeting is ready to color. Find lamed and gimel, the letters whose values add up to thirty-three.']],
 shavuot:[
 ['basket','A basket of first fruits','A fruit basket recalls bikkurim, the first-fruit offering. Color each fruit and name the ones you recognize.'],
 ['tablets','The tablets for Shavuot','The tablets connect Shavuot with the giving of the Torah. Color the stone shapes and notice the Hebrew lettering.'],
 ['dairy','Dairy foods for Shavuot','A group of dairy foods recalls a widespread holiday custom. Compare their containers and choose a simple color palette.'],
 ['wheat','Wheat stalks at harvest time','Wheat stalks connect Shavuot with the grain harvest. Follow the repeated grains with a fine pencil.'],
 ['wagon','A first-fruits wagon','A wagon carries a harvest display. Give the wheels, basket and produce different colors.'],
 ['greeting','Happy Shavuot in Hebrew','A Hebrew Shavuot greeting offers large letters to decorate. Use harvest or flower colors for a seasonal display.']],
}
const subjectRows={
 sufganiyah:[
 ['Smiling jelly doughnut','A smiling doughnut has a round outline and cheerful face.'],['Doughnut on a plate','A single doughnut sits on a plate with room for a border pattern.'],['Doughnuts and a glass of milk','A plate of doughnuts stands beside a glass of milk.'],['A child holding a doughnut','A child holds a large doughnut ready for a holiday treat.'],['A tray full of doughnuts','Several doughnuts fill a serving tray.'],['A baker dusting a doughnut','A baker sprinkles powdered sugar over a doughnut.'],['Children building a giant doughnut','Children use blocks to build a giant doughnut shape.'],['Filling doughnuts at the bakery','Doughnuts are filled with jam in a busy bakery scene.'],['A doughnut gift box','A box of doughnuts is wrapped as a gift.']],
 dreidel:[
 ['A large dreidel to decorate','A large spinning top offers broad areas for color.'],['A smiling spinning dreidel','A cheerful dreidel spins with a smiling face.'],['Dreidels and coins','Spinning tops and coins suggest a traditional holiday game.'],['Dreidel, doughnut and candle','Three familiar Hanukkah objects share the page.'],['Children playing dreidel','Children gather around a game of spinning tops.'],['Four dreidels with Hebrew letters','Four dreidels display nun, gimel, he and pe, the Israeli letter set.'],['A girl painting a giant dreidel','A girl decorates a dreidel much larger than herself.'],['Dreidels in a box','A collection of spinning tops rests inside a box.'],['A dancing dreidel on stage','A dreidel with a face performs on a small stage.']],
 hanukkiah:[
 ['Nine candles in a hanukkiah','A hanukkiah holds eight festival candles and a helper candle.'],['Hanukkiah with dreidel and doughnuts','A candle stand, spinning top and doughnuts form a holiday still life.'],['A child lighting a hanukkiah','A child takes part in candle lighting in this holiday illustration.'],['A hanukkiah in the window','A candle stand sits in a window for its lights to be seen.'],['A family singing by the hanukkiah','A family gathers beside the candle stand to sing.'],['Oil lamps, jugs and an olive branch','An oil hanukkiah stands with small jugs and an olive branch.'],['A flower-shaped hanukkiah','Flower forms decorate the branches of this candle stand.'],['Children making a clay hanukkiah','Children shape a candle stand from clay.'],['A Maccabee with a shield','A Maccabee figure carries a shield in a historical holiday scene.']],
 'tu-bishvat':[
 ['A blossoming almond tree','An almond tree spreads branches covered in blossoms.'],['Children planting a tree','Children work together to plant a young tree.'],['Seven species coloring collection','The traditional seven crops appear together for recognition and coloring.'],['A bowl of fruit for Tu BiShvat','A fruit bowl brings several tree fruits together.'],['A smiling tree with birds','A friendly tree shelters a nest and birds among its branches.'],['A basket of dried fruit','A woven basket holds an assortment of dried fruit.'],['Children watering a garden','Children care for garden plants with water.'],['A fruit tree with squirrels and birds','Birds and squirrels share a fruit tree.'],['A tree and its roots','The roots beneath a tree are visible as part of the scene.']],
 'purim-masks':[
 ['Lion mask for Purim','A lion face forms a mask with a broad mane.'],['Cat mask for Purim','A cat mask has pointed ears and whisker details.'],['Royal crown mask','A royal mask includes a crown to decorate.'],['Butterfly mask','Butterfly wings create a patterned mask shape.'],['Fox mask','A fox mask has pointed ears and a long muzzle.'],['Bird mask','A bird-inspired mask has feather and beak details.'],['A mask with a tall crown','A festive mask is topped by a decorative crown.'],['A floral Purim mask','Flowers frame the face of this festive mask.'],['Bear mask with open eye spaces','A bear face has clearly marked eye openings for a mask craft.']],
}
export const HOLIDAY_DRAWINGS=Object.entries(native).flatMap(([holiday,rows])=>rows.map(([id,name,description],i)=>({holiday,n:i+1,id,name,description,native:true,unpairedReason:'The Hebrew site offers this artwork inside a multi-image holiday gallery, not on an equivalent single-drawing page.'})))
for(const [subject,rows] of Object.entries(subjectRows)){
 const holiday=['sufganiyah','dreidel','hanukkiah'].includes(subject)?'hanukkah':subject==='purim-masks'?'purim':'tu-bishvat'
 const start=HOLIDAY_DRAWINGS.filter(d=>d.holiday===holiday).length
 const s=COLORING_SUBJECTS.find(s=>s.slug===subject)
 rows.forEach(([name,description],i)=>HOLIDAY_DRAWINGS.push({holiday,n:start+i+1,id:`${subject}-${i+1}`,name,description,subject,sourceNumber:i+1,ages:COLORING_DRAWINGS[subject][i].ages,src:coloringSrc(subject,i+1,coloringFmt(s)),thumb:coloringSrc(subject,i+1,'webp'),counterpart:`/printables/coloring/${subject}/${i+1}`}))
}
export const drawingPath=d=>`/en/coloring/${d.holiday}/${d.n}`
export const HOLIDAY_COLORING_PAGES=HOLIDAY_DRAWINGS.map(d=>({path:drawingPath(d),title:`${d.name} coloring page`,...(d.counterpart?{counterpart:d.counterpart}:{unpairedReason:d.unpairedReason})}))
export const drawingsFor=slug=>slug==='simchat-torah'?HOLIDAY_DRAWINGS.filter(d=>d.holiday==='sukkot'&&d.id==='torah'):HOLIDAY_DRAWINGS.filter(d=>d.holiday===slug)

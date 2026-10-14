import { HOLIDAY_BLESSINGS } from '../data/holidayBlessings.js'
const opening='Barukh atah Adonai, Eloheinu melekh ha-olam, '
const translated='Blessed are You, Lord our God, ruler of the universe, '
const command='asher kideshanu bemitzvotav vetsivanu '
const commanded='who made us holy through Your commandments and commanded us '
// Hebrew is reused verbatim from the site's checked traditional texts. English translations are original.
const selections={
 'rosh-hashanah':['rosh-hashana','shehecheyanu','Welcoming this season','shehecheyanu vekiyemanu vehigianu lazman hazeh.','who has kept us alive, sustained us, and brought us to this time.','Said at the arrival of the festival; follow your family or community practice.'],
 'yom-kippur':['yom-kippur','shehecheyanu','Shehecheyanu','shehecheyanu vekiyemanu vehigianu lazman hazeh.','who has kept us alive, sustained us, and brought us to this time.','Part of welcoming the holy day. Local services guide when it is said.'],
 sukkot:['sukkot','sukkah','Dwelling in the sukkah',command+'leishev basukkah.',commanded+'to dwell in the sukkah.','Used with eating in the sukkah according to community practice.'],
 'simchat-torah':['simchat-torah','shehecheyanu','Welcoming the festival','shehecheyanu vekiyemanu vehigianu lazman hazeh.','who has kept us alive, sustained us, and brought us to this time.','Festival practice differs between Israel and communities abroad. Ask your community about when it is said.'],
 hanukkah:['hanukkah','ner','Lighting the Hanukkah lights',command+'lehadlik ner Hanukkah.',commanded+'to light a Hanukkah lamp.','This is the first candle-lighting blessing. Other blessings are also said; Shehecheyanu is normally added on the first night. An adult handles the lighting.'],
 'tu-bishvat':['tu-bishvat','haetz','Fruit of the tree','borei peri ha-etz.','who creates the fruit of the tree.','Said before eating tree fruit. Not every food on a fruit plate takes this blessing.'],
 purim:['purim','megillah','Reading the Megillah',command+'al mikra megillah.',commanded+'concerning the reading of the Megillah.','The reader says this before reading the Megillah, together with the other customary blessings.'],
 passover:['pesach','motzi','Bread at the seder','hamotzi lechem min ha-aretz.','who brings bread out of the earth.','At the seder this is followed by the specific blessing over matzah. This excerpt is not a complete seder guide.'],
 shavuot:['shavuot','shehecheyanu','Welcoming Shavuot','shehecheyanu vekiyemanu vehigianu lazman hazeh.','who has kept us alive, sustained us, and brought us to this time.','Included when welcoming the festival according to community practice.'],
 shabbat:['shabbat','candles','Lighting Shabbat candles',command+'lehadlik ner shel Shabbat.',commanded+'to light a Shabbat lamp.','Candles are lit before sunset. Exact times and the order of blessing and lighting follow local practice.'],
}
export const ENGLISH_BLESSINGS=Object.fromEntries(Object.entries(selections).map(([slug,[heSlug,id,title,say,translation,note]])=>{
 const source=HOLIDAY_BLESSINGS.find(h=>h.slug===heSlug),b=source.blessings.find(b=>b.id===id)
 return [slug,{title,he:b.text,transliteration:opening+say,translation:translated+translation,note,source:source.sources}]
}))

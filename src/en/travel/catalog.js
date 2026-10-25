export const TRAVEL_PAGES=[['','Travel with Buga','Free family activities for every journey, including an offline flight bag.'],['kit','Flight and road trip activity kit','Make an A4 activity booklet for ages 2–10.'],['bingo','Road, airport and train bingo','Six different boards per setting, on screen or on paper.'],['passport','My travel passport','Fold a passport and collect little memories.'],['journal','My travel journal','A page a day for drawing, writing and souvenirs.'],['packing-list','Packing for a trip with children','A checklist saved only on your device.'],['stories','Buga Radio: travel stories','English stories, playlists and a sleep timer.'],['listen','Listening games and riddles','Animal clues, riddles and checked facts.'],['talk-games','Family talking games','One prompt at a time, with 30 story starters.'],['offline','Your offline flight bag','Save games, stories and your latest booklet.'],['play','Buga flight mode','Six big buttons for a calmer journey.'],['countdown','Are we nearly there?','A visual timer with gentle milestones.'],['surprise-bags','Hourly surprise envelopes','Print and fold a little surprise for each hour.'],['waiting-games','Games for waiting, airports and restaurants','28 small games without special equipment.'],['guides/toddler-flight','How to keep a toddler busy on a flight','Small activities, familiar objects and time to rest.'],['guides/long-car-ride','Games for a long car ride','Conversation, listening and comfortable breaks.'],['guides/carry-on-for-kids','What to pack in a child’s carry-on','Keep the important things accessible.'],['guides/flying-with-baby','Flying with a baby: what to know','Practical preparation with reliable safety sources.'],['guides/car-sickness','Car sickness in children: what may help','Comfort, alternatives to screens and medical advice.']].map(([slug,title,description])=>({slug,title,description,path:'/en/travel'+(slug?'/'+slug:''),counterpart:'/travel'+(slug?'/'+slug:'')}))
export const TRAVEL_INTRO='Travel with Buga — anywhere, even without internet. Everything for a happier journey: booklets to print before you leave, screen-free family games, stories to listen to, and a flight bag saved on your phone that works in airplane mode. Free, with no sign-up.'
export const AGES=['2–3','4–5','6–7','8–10']
export const DURATIONS=['Up to an hour','1–3 hours','A flight or a long journey']
const road=['Truck','Cow','Traffic light','Gas station','Bus','Bridge','Tractor','Bicycle','Police car','Tree','House','Bus stop','Dog','Cloud','Ambulance','Motorcycle','Roadworks','Stop sign','Train','Sign','Fire engine','Flower','Crane','Bird']
const airport=['Suitcase','Cabin crew','Baggage belt','Control tower','Seat belt','Airplane','Backpack','Boarding pass','Window','Cafe','Gate','Seat','Book','Passport control','Clock','Water bottle','Trolley','Pilot','Screen','Stairs','Service vehicle','Cloud','Shop','Teddy bear']
const train=['Train','Station','Ticket','Traffic light','Bicycle','Pedestrian','Building','Tree','Bridge','Track','Door','Window','Clock','Bench','Cafe','Backpack','Bus','Shop','Flower','Dog','Sign','Suitcase','Bird','Roadworks']
import { BINGO as ORIGINAL } from '../../travel/printData.js'
export const BINGO=Object.fromEntries(Object.entries({road,airport,train}).map(([key,words])=>[key,{label:{road:'Road trip',airport:'Airport and flight',train:'Train and city'}[key],items:words.map((word,i)=>[ORIGINAL[key].items[i][0],word])}]))
export const bingoBoards=(kind,size=3)=>Array.from({length:6},(_,b)=>Array.from({length:size*size},(_,i)=>BINGO[kind].items[(i*5+b*3)%24]))
export const PACKING={
 common:[['hand','An accessible carry-on bag'],['drink','Age-appropriate drinks and feeding supplies'],['food','Familiar food in a safe texture for the child'],['clothes','Spare clothes and a bag for dirty items'],['wipes','Wipes or a washable cloth'],['firstaid','A basic first-aid kit'],['meds','Regular medicines and your clinician’s instructions'],['activity','A small activity or printed booklet'],['power','A charged phone and charger'],['comfort','A familiar comfort item']],
 baby:[['diapers','Diapers and a changing mat'],['feeding','Clean, familiar feeding equipment'],['pacifier','A spare pacifier, if used'],['adultshirt','A spare shirt for the adult']],
 toddler:[['bigtoy','A large toy without small parts'],['crayon','A chunky crayon and paper'],['potty','Changing or potty-training supplies as needed']],
 child:[['book','A small book or activity booklet'],['headphones','Suitable headphones at a comfortable volume'],['notebook','A notebook and pencil']],
 car:[['seat','A suitable car seat installed to its instructions'],['break','A safe place planned for a break'],['sun','Safe shade that does not block the driver’s view']],
 plane:[['documents','Travel documents accessible to the adult'],['rules','Airline and airport rules checked for liquids, stroller and car seat'],['offline','A saved flight bag tested in airplane mode']],
 train:[['tickets','Tickets and station details available'],['bags','Bags you can supervise without blocking the aisle'],['layers','An extra layer appropriate to the weather']],
}
export const packingItems=(age,type)=>[...PACKING.common,...PACKING[age],...PACKING[type]]
const all=['queue','restaurant','airport']
export const WAITING_GAMES=[
 ['Quiet mirror','Make a tiny hand movement. Your partner copies it like a mirror, then swap.',2,true,all],
 ['A color hunt','Find three things of one color with your eyes. Point without leaving your place.',2,true,all],
 ['Funny faces','Make a gentle expression. Can your partner guess the feeling?',2,true,all],
 ['Finger numbers','Show a few fingers and copy the number. Start with one for younger children.',2,true,all],
 ['Rain on your knees','Tap one finger on your knee, then two, then rest. Copy the rhythm.',2,true,all],
 ['What changed?','Make a hand shape. Your partner closes their eyes while you move one finger.',4,true,all],
 ['Secret number','Choose a number from one to five. Show your fingers together and see whether you match.',4,true,all],
 ['Tiny sculptures','Make a little house, butterfly or pair of glasses with your hands.',3,true,all],
 ['Movement pattern','Lift a finger, turn a hand and touch thumbs. Add one small movement each turn.',4,true,all],
 ['Name that cloud','Look through a window at a cloud or shape. Invent a name for it.',3,false,['airport','restaurant']],
 ['One lovely thing','Share one small happy thing from today. A word or a pointing finger counts.',2,false,all],
 ['Three uses','Choose a familiar object and invent three silly new uses for it.',5,false,all],
 ['Three-word story','Add three words each to a story. Stop whenever someone suggests an ending.',6,false,all],
 ['An animal menu','Invent a restaurant for animals. What would a rabbit or a dragon order?',3,false,['restaurant','queue']],
 ['The unusual shop','Open an imaginary shop selling clouds, smiles or extra time to rest.',5,false,all],
 ['What am I at home?','Think of an object at home. Give one clue at a time until someone guesses.',4,false,all],
 ['Finish the sentence','Start “If my backpack had legs…” and invent a different ending each turn.',4,false,all],
 ['Three of a kind','Name three things in a category together: fruit, clothes or kitchen tools.',3,false,all],
 ['Napkin map','Draw a short path on a napkin. Trace it with a finger and add a stop.',3,true,['restaurant']],
 ['Drawing together','Draw one line each on paper. Discover the picture together.',3,true,['restaurant','airport']],
 ['Dots and lines','Draw a few dots. Take turns joining two until you have a shared picture.',4,true,['restaurant','airport']],
 ['Hidden letter','Turn a large letter into a picture. Can your partner find it?',6,true,['restaurant','airport']],
 ['The placemat plan','Draw a place for a plate and cup on a napkin. Add a decoration.',4,true,['restaurant']],
 ['Make it an animal','Draw a circle and a line. Turn them into an animal or imaginary character.',4,true,['restaurant','airport']],
 ['The dream gate','Design an imaginary airport gate for families. Where would people rest?',6,false,['airport']],
 ['The suitcase journey','Invent a suitcase’s trip. Where did it come from and what will it see?',4,false,['airport']],
 ['Backwards routine','Tell a familiar routine backwards, such as putting on socks and shoes.',5,false,['queue','restaurant']],
 ['Number detective','Find numbers on nearby signs. Older children can find two that add up to ten.',6,true,['queue','airport']],
].map(([title,how,age,quiet,places],id)=>({id,title,how,age,quiet,places}))

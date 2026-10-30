// English vocabulary by grade (/learn/english/grade-N/vocabulary), arranged by the Israeli English
// curriculum: an early start in grades 1–2 (concrete, picture-friendly words), Band I for the Foundation
// grades 3–6, Band II for the Intermediate grades 7–9 and Band III (the Bagrut years) for grades 10–12.
// Every unit is a list of [english, hebrew, example sentence]. Units are written as "en | he | example" lines.
const words = text => text.trim().split('\n').map(line => line.split(' | ').map(x => x.trim()))
const u = (slug, title, en, emoji, text) => ({ slug, title, en, emoji, words: words(text) })

export const VOCAB_BANDS = {
  early: { label: 'התחלה מוקדמת', en: 'Early Start', about: 'מילים ראשונות, מוחשיות וקלות לציור: צבעים, חיות, משפחה, אוכל, הגוף וצעצועים.' },
  band1: { label: 'רמת יסוד', en: 'Band I', about: 'אוצר המילים הבסיסי של תוכנית הלימודים (Band I): בית הספר, הבית, תחביבים, מזג אוויר, מקומות, רגשות וטיולים.' },
  band2: { label: 'רמת ביניים', en: 'Band II', about: 'אוצר המילים של חטיבת הביניים (Band II): טכנולוגיה, סביבה, בריאות, תקשורת, חברה ומדע — ופעלים ותארים שחוזרים בכל אנסין.' },
  band3: { label: 'רמת שליטה ובגרות', en: 'Band III', about: 'אוצר מילים אקדמי לבגרות (Band III): טיעון, מחקר, חברה, פסיכולוגיה, כלכלה, מילות קישור ופעלים אקדמיים.' },
}
export const bandOfGrade = n => (n <= 2 ? 'early' : n <= 6 ? 'band1' : n <= 9 ? 'band2' : 'band3')

export const VOCAB_GRADES = [
  { n: 1, units: [
    u('colors', 'צבעים', 'Colours', '🎨', `
red | אדום | The apple is red.
blue | כחול | The sky is blue.
yellow | צהוב | The sun is yellow.
green | ירוק | The grass is green.
orange | כתום | I have an orange ball.
pink | ורוד | Her dress is pink.
purple | סגול | I like purple grapes.
black | שחור | The cat is black.
white | לבן | The snow is white.
brown | חום | The dog is brown.`),
    u('animals', 'חיות', 'Animals', '🐶', `
dog | כלב | My dog can run fast.
cat | חתול | The cat is sleeping.
fish | דג | The fish is in the water.
bird | ציפור | A bird can fly.
cow | פרה | The cow says moo.
horse | סוס | I can ride a horse.
duck | ברווז | The duck can swim.
lion | אריה | The lion is big.
monkey | קוף | The monkey eats a banana.
rabbit | ארנב | The rabbit has long ears.`),
    u('family', 'משפחה', 'Family', '👨‍👩‍👧', `
mother | אמא | My mother is kind.
father | אבא | My father is tall.
sister | אחות | My sister is five.
brother | אח | I play with my brother.
baby | תינוק | The baby is sleeping.
grandma | סבתא | Grandma makes a cake.
grandpa | סבא | Grandpa reads a book.
family | משפחה | I love my family.
boy | ילד | The boy has a ball.
girl | ילדה | The girl is happy.`),
    u('food', 'אוכל ופירות', 'Food & Fruit', '🍎', `
apple | תפוח | I eat an apple.
banana | בננה | The banana is yellow.
bread | לחם | I like bread with butter.
milk | חלב | I drink milk.
egg | ביצה | I eat an egg in the morning.
cake | עוגה | The cake is sweet.
water | מים | I drink water.
cheese | גבינה | The cheese is yellow.
grapes | ענבים | Grapes are green or purple.
pizza | פיצה | We eat pizza.`),
    u('body', 'הגוף', 'My Body', '👃', `
head | ראש | Touch your head.
eyes | עיניים | I have two eyes.
ears | אוזניים | A rabbit has long ears.
nose | אף | Touch your nose.
mouth | פה | Open your mouth.
hand | יד | Raise your hand.
foot | כף רגל | Stand on one foot.
hair | שיער | Her hair is long.
teeth | שיניים | I brush my teeth.
legs | רגליים | A dog has four legs.`),
    u('toys', 'צעצועים', 'Toys', '🧸', `
ball | כדור | Kick the ball.
doll | בובה | My doll has a pink dress.
teddy bear | דובי | I sleep with my teddy bear.
car | מכונית | My toy car is red.
kite | עפיפון | The kite flies high.
blocks | קוביות | I build a tower with blocks.
puzzle | פאזל | We do a puzzle together.
robot | רובוט | My robot can walk.
train | רכבת | The toy train goes fast.
balloon | בלון | The balloon is red.`),
  ] },
  { n: 2, units: [
    u('clothes', 'בגדים', 'Clothes', '👕', `
shirt | חולצה | I wear a blue shirt.
pants | מכנסיים | My pants are long.
dress | שמלה | She has a new dress.
shoes | נעליים | Put on your shoes.
socks | גרביים | My socks are white.
hat | כובע | I wear a hat in the sun.
coat | מעיל | It is cold, wear a coat.
skirt | חצאית | Her skirt is pink.
jacket | ז׳קט, מעיל קל | I have a green jacket.
scarf | צעיף | The scarf is warm.`),
    u('my-home', 'הבית שלי', 'My Home', '🏠', `
house | בית | I live in a big house.
door | דלת | Close the door, please.
window | חלון | Look out of the window.
bed | מיטה | I sleep in my bed.
table | שולחן | The book is on the table.
chair | כיסא | Sit on the chair.
kitchen | מטבח | Mom is in the kitchen.
bathroom | חדר אמבטיה | The bathroom is clean.
bedroom | חדר שינה | My bedroom is small.
sofa | ספה | We sit on the sofa.`),
    u('school-bag', 'בתיק שלי', 'In My School Bag', '🎒', `
pencil | עיפרון | I write with a pencil.
pen | עט | I have a blue pen.
book | ספר | Open your book.
notebook | מחברת | Write in your notebook.
eraser | מחק | Can I use your eraser?
ruler | סרגל | Draw a line with a ruler.
bag | תיק | My bag is heavy.
crayon | צבע שעווה | I draw with a red crayon.
scissors | מספריים | Cut the paper with scissors.
glue | דבק | I need glue for my picture.`),
    u('actions', 'פעולות', 'Actions', '🏃', `
run | לרוץ | I run in the park.
jump | לקפוץ | Frogs jump high.
swim | לשחות | Fish swim in the sea.
sing | לשיר | We sing a song.
dance | לרקוד | I like to dance.
eat | לאכול | We eat lunch at one.
sleep | לישון | Babies sleep a lot.
read | לקרוא | I read a book every night.
write | לכתוב | Write your name.
play | לשחק | Let's play outside.`),
    u('nature', 'טבע ומזג אוויר', 'Nature & Weather', '☀️', `
sun | שמש | The sun is hot.
moon | ירח | I see the moon at night.
star | כוכב | Look at that star!
tree | עץ | The bird is in the tree.
flower | פרח | This flower is red.
rain | גשם | I like the rain.
cloud | ענן | The cloud is grey.
sea | ים | We swim in the sea.
sky | שמיים | The sky is blue today.
snow | שלג | The snow is cold.`),
    u('transport', 'תחבורה', 'Transport', '🚌', `
bus | אוטובוס | I go to school by bus.
bike | אופניים | I ride my bike.
plane | מטוס | The plane is in the sky.
boat | סירה | The boat is on the water.
taxi | מונית | We take a taxi.
truck | משאית | The truck is very big.
ship | אונייה | The ship sails on the sea.
helicopter | מסוק | The helicopter is loud.
motorcycle | אופנוע | Dad rides a motorcycle.
scooter | קורקינט | I ride my scooter to the park.`),
  ] },
  { n: 3, units: [
    u('school', 'בית הספר', 'School', '🏫', `
teacher | מורה | Our teacher is nice.
classroom | כיתה | Our classroom is big.
lesson | שיעור | The English lesson is fun.
homework | שיעורי בית | I do my homework after school.
board | לוח | The teacher writes on the board.
desk | שולחן תלמיד | My desk is next to the window.
friend | חבר, חברה | Dana is my best friend.
break | הפסקה | We play ball at break.
test | מבחן | I have a test tomorrow.
question | שאלה | Can I ask a question?
answer | תשובה | I know the answer!
library | ספרייה | We borrow books from the library.`),
    u('at-home', 'בבית', 'At Home', '🛋️', `
living room | סלון | We watch TV in the living room.
garden | גינה | There are flowers in the garden.
stairs | מדרגות | Walk up the stairs.
floor | רצפה | The toy is on the floor.
wall | קיר | There is a picture on the wall.
lamp | מנורה | Turn on the lamp.
fridge | מקרר | The milk is in the fridge.
shower | מקלחת | I take a shower every evening.
closet | ארון | My clothes are in the closet.
mirror | מראה | Look in the mirror.
key | מפתח | I can't find my key.
roof | גג | The cat is on the roof.`),
    u('hobbies', 'תחביבים', 'Hobbies', '⚽', `
football | כדורגל | We play football after school.
basketball | כדורסל | He is tall and good at basketball.
draw | לצייר | I like to draw animals.
paint | לצבוע, לצייר בצבעים | We paint a big picture.
music | מוזיקה | I listen to music.
guitar | גיטרה | My brother plays the guitar.
game | משחק | This game is fun.
cook | לבשל | Dad and I cook dinner.
ride | לרכוב | I ride a horse on Fridays.
collect | לאסוף | I collect stickers.
camera | מצלמה | I take pictures with my camera.
chess | שחמט | Grandpa teaches me chess.`),
    u('weather', 'מזג אוויר ועונות', 'Weather & Seasons', '🌦️', `
sunny | שמשי | It is sunny today.
rainy | גשום | It is a rainy day.
windy | עם רוח חזקה | It is windy, hold your hat!
cloudy | מעונן | The sky is cloudy.
hot | חם | It is hot in summer.
cold | קר | It is cold in winter.
summer | קיץ | We go to the beach every summer.
winter | חורף | It rains a lot in winter.
spring | אביב | Flowers grow in spring.
autumn | סתיו | Leaves fall in autumn.
umbrella | מטרייה | Take an umbrella, it's raining.
weather | מזג אוויר | What is the weather like today?`),
    u('food-drinks', 'אוכל ושתייה', 'Food & Drinks', '🥪', `
breakfast | ארוחת בוקר | I eat breakfast at seven.
lunch | ארוחת צהריים | We have lunch at school.
dinner | ארוחת ערב | Dinner is ready!
sandwich | כריך | I have a cheese sandwich.
salad | סלט | Mom makes a big salad.
soup | מרק | The soup is hot.
juice | מיץ | I drink orange juice.
chicken | עוף | We eat chicken and potatoes.
rice | אורז | I like rice with vegetables.
vegetables | ירקות | Vegetables are good for you.
chocolate | שוקולד | I love chocolate ice cream.
hungry | רעב | I am hungry. Let's eat!`),
    u('feelings', 'רגשות', 'Feelings', '😊', `
happy | שמח | I am happy today.
sad | עצוב | Why are you sad?
angry | כועס | He is angry with his brother.
tired | עייף | I am tired after the game.
scared | מפוחד | The little dog is scared.
excited | נרגש | I am excited about my birthday.
bored | משועמם | I am bored. Let's play!
surprised | מופתע | She was surprised by the gift.
proud | גאה | Mom is proud of me.
worried | מודאג | Don't be worried, it's OK.
calm | רגוע | Take a deep breath and be calm.
shy | ביישן | He is shy in a new class.`),
  ] },
  { n: 4, units: [
    u('town', 'מקומות בעיר', 'Places in Town', '🏙️', `
park | פארק | We play in the park.
shop | חנות | The shop opens at nine.
supermarket | סופרמרקט | We buy food at the supermarket.
hospital | בית חולים | The doctor works in a hospital.
post office | סניף דואר | Send the letter from the post office.
bank | בנק | Dad goes to the bank.
restaurant | מסעדה | We eat at a restaurant on Friday.
museum | מוזיאון | The museum has very old things.
cinema | קולנוע | We see a film at the cinema.
street | רחוב | I live on a quiet street.
bridge | גשר | We walk over the bridge.
playground | גן שעשועים | The kids are in the playground.`),
    u('jobs', 'מקצועות', 'Jobs', '👩‍⚕️', `
doctor | רופא | The doctor helps sick people.
nurse | אח, אחות (בבית חולים) | The nurse is very kind.
farmer | חקלאי | The farmer grows vegetables.
pilot | טייס | The pilot flies the plane.
police officer | שוטר | The police officer helps us cross the road.
firefighter | כבאי | The firefighter puts out the fire.
chef | שף | The chef makes great pasta.
driver | נהג | The bus driver says good morning.
vet | וטרינר | The vet takes care of my dog.
dentist | רופא שיניים | The dentist checks my teeth.
singer | זמר | She is a famous singer.
builder | בנאי | The builder makes a new house.`),
    u('days-time', 'ימים וזמן', 'Days & Time', '🕒', `
Sunday | יום ראשון | On Sunday I go back to school.
Monday | יום שני | I have a test on Monday.
Tuesday | יום שלישי | We have art on Tuesday.
Wednesday | יום רביעי | Wednesday is in the middle of the week.
Thursday | יום חמישי | On Thursday we play football.
Friday | יום שישי | On Friday we visit Grandma.
Saturday | שבת | On Saturday we rest.
week | שבוע | There are seven days in a week.
month | חודש | My birthday is next month.
year | שנה | A year has twelve months.
today | היום | Today is a sunny day.
tomorrow | מחר | See you tomorrow!`),
    u('animals-nature', 'בעלי חיים וטבע', 'Animals & Nature', '🐘', `
elephant | פיל | An elephant has a long trunk.
giraffe | ג׳ירפה | The giraffe eats leaves from tall trees.
snake | נחש | The snake is long and thin.
bear | דוב | The bear sleeps in winter.
tiger | נמר | The tiger has stripes.
frog | צפרדע | The frog jumps into the pond.
bee | דבורה | The bee makes honey.
butterfly | פרפר | A butterfly sits on the flower.
forest | יער | Many animals live in the forest.
river | נהר | The river is long.
mountain | הר | We climb the mountain.
farm | חווה | There are cows on the farm.`),
    u('health', 'בריאות והגוף', 'Health & Body', '🩺', `
sick | חולה | I am sick today.
headache | כאב ראש | I have a headache.
fever | חום גבוה | The baby has a fever.
medicine | תרופה | Take your medicine.
healthy | בריא | Fruit is healthy.
strong | חזק | Exercise makes you strong.
arm | זרוע | I hurt my arm.
neck | צוואר | Wear a scarf on your neck.
shoulder | כתף | Put your hand on my shoulder.
knee | ברך | I fell and hurt my knee.
stomach | בטן | My stomach hurts.
exercise | התעמלות, פעילות גופנית | I exercise every morning.`),
    u('describing', 'מילים לתיאור', 'Describing Words', '🔍', `
big | גדול | An elephant is big.
small | קטן | A mouse is small.
tall | גבוה | My father is tall.
short | נמוך, קצר | My sister is short.
long | ארוך | The snake is long.
fast | מהיר | A cheetah is fast.
slow | איטי | A turtle is slow.
new | חדש | I have new shoes.
old | ישן, זקן | This house is very old.
beautiful | יפה | What a beautiful flower!
funny | מצחיק | The clown is funny.
quiet | שקט | Please be quiet in the library.`),
  ] },
  { n: 5, units: [
    u('travel', 'טיולים ונסיעות', 'Travel', '✈️', `
trip | טיול | We are going on a trip.
airport | שדה תעופה | We arrive at the airport early.
ticket | כרטיס | I have a ticket for the train.
passport | דרכון | Don't forget your passport.
suitcase | מזוודה | My suitcase is heavy.
hotel | מלון | Our hotel is near the sea.
map | מפה | Let's look at the map.
beach | חוף | We swim at the beach.
holiday | חופשה | We had a great holiday in Eilat.
visit | לבקר | We visit our cousins in Haifa.
country | ארץ, מדינה | Italy is a beautiful country.
tourist | תייר | Many tourists visit Jerusalem.`),
    u('nature', 'טבע וסביבה', 'Nature & Environment', '🌳', `
plant | צמח; לשתול | We plant a tree on Tu BiShvat.
leaf | עלה | The leaf is green.
desert | מדבר | It is hot in the desert.
lake | אגם | We swim in the lake.
ocean | אוקיינוס | Whales live in the ocean.
island | אי | The island is in the middle of the sea.
earth | כדור הארץ | The earth goes around the sun.
air | אוויר | We need clean air.
recycle | למחזר | We recycle bottles and paper.
rubbish | אשפה, זבל | Put the rubbish in the bin.
protect | להגן | We must protect animals.
nature | טבע | I love walking in nature.`),
    u('shopping', 'קניות וכסף', 'Shopping & Money', '🛒', `
money | כסף | I save my money in a box.
price | מחיר | What is the price of this book?
cheap | זול | This shirt is cheap.
expensive | יקר | The new phone is expensive.
buy | לקנות | I want to buy a present.
sell | למכור | They sell fruit at the market.
pay | לשלם | Can I pay with a card?
market | שוק | We buy vegetables at the market.
customer | לקוח | The customer asks a question.
change | עודף | Here is your change.
coin | מטבע | I found a coin on the floor.
cost | לעלות (מחיר) | How much does it cost?`),
    u('technology', 'מחשבים וטכנולוגיה', 'Computers & Technology', '💻', `
computer | מחשב | I do my homework on the computer.
screen | מסך | The screen is too bright.
keyboard | מקלדת | Type your name on the keyboard.
mouse | עכבר (של מחשב) | Click with the mouse.
internet | אינטרנט | We find information on the internet.
website | אתר אינטרנט | This website has fun games.
password | סיסמה | Never tell anyone your password.
email | דואר אלקטרוני | I sent an email to my teacher.
phone | טלפון | My phone is in my bag.
message | הודעה | I got a message from Noa.
video | סרטון | We watched a video about whales.
print | להדפיס | Print the page, please.`),
    u('family-friends', 'משפחה וחברים', 'Family & Friends', '🤝', `
cousin | בן דוד, בת דודה | My cousin lives in Tel Aviv.
uncle | דוד | My uncle is a pilot.
aunt | דודה | My aunt bakes great cookies.
parents | הורים | My parents work in Haifa.
neighbor | שכן | Our neighbor has a big dog.
together | ביחד | We play together every day.
share | לחלוק, לשתף | Let's share the cake.
help | לעזור | Can you help me, please?
party | מסיבה | I invited my class to my party.
birthday | יום הולדת | Happy birthday, Tom!
invite | להזמין | I want to invite you to my house.
gift | מתנה | Thank you for the gift.`),
    u('daily-routine', 'סדר יום', 'Daily Routine', '⏰', `
wake up | להתעורר | I wake up at seven.
get dressed | להתלבש | I get dressed for school.
brush | לצחצח | Brush your teeth twice a day.
wash | לשטוף, לרחוץ | Wash your hands before you eat.
always | תמיד | I always eat breakfast.
usually | בדרך כלל | I usually walk to school.
sometimes | לפעמים | Sometimes I take the bus.
never | אף פעם | I never go to bed late.
early | מוקדם | I get up early.
late | מאוחר | Don't be late!
go to bed | ללכת לישון | I go to bed at nine.
clock | שעון | The clock on the wall is slow.`),
  ] },
  { n: 6, units: [
    u('holidays', 'חופשות ומסעות', 'Holidays & Journeys', '🧳', `
journey | מסע, נסיעה | The journey to the north took three hours.
abroad | לחו״ל, בחו״ל | We are flying abroad this summer.
luggage | מטען, מזוודות | Our luggage was very heavy.
flight | טיסה | The flight leaves at six.
guide | מדריך | The guide told us about the old city.
souvenir | מזכרת | I bought a souvenir for my sister.
camping | קמפינג | We went camping by the lake.
tent | אוהל | We slept in a tent.
sightseeing | סיור באתרים | We went sightseeing in Rome.
arrive | להגיע | We arrive in London at noon.
leave | לעזוב, לצאת | The bus will leave in five minutes.
adventure | הרפתקה | The trip was a real adventure.`),
    u('personality', 'אופי', 'Personality', '🙂', `
friendly | ידידותי | Our new neighbor is very friendly.
honest | ישר, כן | An honest person tells the truth.
brave | אמיץ | The brave girl saved the cat.
lazy | עצלן | My cat is lazy; it sleeps all day.
clever | חכם, פיקח | That was a clever idea.
polite | מנומס | Please be polite and say thank you.
rude | גס רוח | It is rude to shout.
patient | סבלני | A good teacher is patient.
generous | נדיב | My grandpa is very generous.
creative | יצירתי | She is creative and loves to paint.
selfish | אנוכי | Don't be selfish; share your toys.
helpful | עוזר, מועיל | Thank you, you were very helpful.`),
    u('science-space', 'מדע וחלל', 'Science & Space', '🚀', `
planet | כוכב לכת | Mars is a red planet.
space | חלל | Astronauts travel into space.
astronaut | אסטרונאוט | The astronaut walked on the moon.
rocket | רקטה, טיל | The rocket flew into the sky.
telescope | טלסקופ | We looked at the stars through a telescope.
experiment | ניסוי | We did an experiment in science class.
scientist | מדען | The scientist works in a lab.
gravity | כוח המשיכה | Gravity keeps us on the ground.
energy | אנרגיה | The sun gives us energy.
magnet | מגנט | A magnet picks up metal.
discover | לגלות | Scientists discover new things every day.
universe | היקום | The universe is very big.`),
    u('sports', 'ספורט ותחביבים', 'Sports & Hobbies', '🏅', `
team | קבוצה | Our team won the game.
player | שחקן | He is the best player in the team.
coach | מאמן | The coach shouted, "Run!"
match | משחק (תחרות) | We watched the football match on TV.
win | לנצח | I hope we win today.
lose | להפסיד | It's OK to lose sometimes.
score | להבקיע; תוצאה | She scored two goals.
practice | להתאמן | I practice the piano every day.
competition | תחרות | She won a swimming competition.
hobby | תחביב | My hobby is photography.
tennis | טניס | We play tennis on Fridays.
volunteer | להתנדב | I volunteer at the animal shelter.`),
    u('cooking', 'אוכל ובישול', 'Food & Cooking', '🍳', `
recipe | מתכון | This is my grandma's recipe.
ingredients | מרכיבים | Mix all the ingredients in a bowl.
bake | לאפות | Let's bake cookies.
boil | להרתיח | Boil the water for the pasta.
fry | לטגן | Fry the eggs in a pan.
mix | לערבב | Mix the flour and the milk.
cut | לחתוך | Cut the tomatoes into small pieces.
oven | תנור | Put the cake in the oven.
delicious | טעים מאוד | This soup is delicious!
sweet | מתוק | The cake is too sweet.
salty | מלוח | The chips are salty.
spicy | חריף | I don't like spicy food.`),
    u('community', 'הקהילה שלי', 'My Community', '🏘️', `
neighborhood | שכונה | Our neighborhood has a big park.
city | עיר | Tel Aviv is a busy city.
village | כפר | My grandparents live in a small village.
center | מרכז | The library is in the city center.
traffic | תנועה, פקקים | There is a lot of traffic in the morning.
building | בניין | We live in a tall building.
crowded | צפוף, הומה אדם | The bus was very crowded.
noisy | רועש | The street is noisy at night.
clean | נקי | Keep our park clean.
safe | בטוח | Is it safe to cross here?
citizen | אזרח | Every citizen can vote.
event | אירוע | There is a big event in the park tonight.`),
  ] },
  { n: 7, units: [
    u('technology', 'טכנולוגיה', 'Technology', '📱', `
device | מכשיר | A smartphone is a useful device.
smartphone | טלפון חכם | Many kids get a smartphone in seventh grade.
app | אפליקציה | This app helps me learn new words.
download | להוריד (קובץ) | You can download the game for free.
upload | להעלות (קובץ) | I uploaded the photos to the cloud.
online | מקוון, ברשת | We had an online lesson.
offline | לא מחובר | The game works offline too.
battery | סוללה | My battery is almost dead.
charge | להטעין | I need to charge my phone.
software | תוכנה | The school bought new software.
invent | להמציא | Who invented the telephone?
update | לעדכן; עדכון | Update the app to get new features.
search | לחפש; חיפוש | Search for the answer on the internet.
screen time | זמן מסך | Parents worry about screen time.`),
    u('environment', 'סביבה', 'Environment', '🌍', `
pollution | זיהום | Air pollution is bad for our health.
climate | אקלים | The climate is getting warmer.
waste | פסולת; לבזבז | Don't waste water.
plastic | פלסטיק | Plastic bags are bad for the sea.
reduce | להפחית | We should reduce the use of plastic.
reuse | לעשות שימוש חוזר | Reuse your water bottle.
endangered | בסכנת הכחדה | The tiger is an endangered animal.
species | מין (של בעלי חיים או צמחים) | Many species live in the rainforest.
solar | סולארי, של השמש | Solar panels make power from the sun.
electricity | חשמל | Turn off the lights to save electricity.
save | לחסוך; להציל | We can save energy at home.
global warming | התחממות כדור הארץ | Global warming melts the ice.
flood | שיטפון | The flood damaged many homes.
wildlife | חיות בר | The park protects wildlife.`),
    u('health', 'בריאות', 'Health', '🥗', `
diet | תזונה, תפריט | A healthy diet includes fruit and vegetables.
habit | הרגל | Reading every day is a good habit.
fit | בכושר | I swim to stay fit.
injury | פציעה | He missed the game because of an injury.
pain | כאב | I have a pain in my back.
heart | לב | Exercise is good for your heart.
blood | דם | The nurse took some blood.
muscle | שריר | Running makes your leg muscles strong.
sugar | סוכר | Too much sugar is bad for your teeth.
vitamin | ויטמין | Oranges have a lot of vitamin C.
stress | לחץ, מתח | Exams can cause stress.
rest | מנוחה; לנוח | You need to rest after a long day.
disease | מחלה | Doctors are fighting the disease.
treatment | טיפול | The treatment worked and she got better.`),
    u('media', 'תקשורת', 'Media', '📺', `
news | חדשות | We watch the news every evening.
newspaper | עיתון | My grandpa reads the newspaper.
article | כתבה, מאמר | I read an article about sharks.
headline | כותרת | The headline was in big letters.
reporter | כתב | The reporter asked the minister questions.
interview | ראיון | She gave an interview on TV.
advertisement | פרסומת | The advertisement was funny.
channel | ערוץ | Change the channel, please.
program | תוכנית | My favorite program starts at eight.
audience | קהל | The audience clapped.
social media | רשתות חברתיות | Many teens spend hours on social media.
post | לפרסם (ברשת); פוסט | She posted a photo of her dog.
fake | מזויף | Be careful of fake news.
comment | תגובה; להגיב | He wrote a nice comment on my post.`),
    u('society', 'חברה', 'Society', '👥', `
community | קהילה | The whole community helped after the storm.
rights | זכויות | Children have rights too.
law | חוק | It is against the law to steal.
government | ממשלה | The government built a new hospital.
vote | להצביע | People vote every four years.
equal | שווה | All people are equal.
respect | כבוד; לכבד | We must respect each other.
culture | תרבות | Food is part of every culture.
tradition | מסורת | Lighting candles is a Hanukkah tradition.
religion | דת | Israel has people of many religions.
population | אוכלוסייה | The population of Israel is about ten million.
poor | עני | They help poor families.
rich | עשיר | He became rich from his company.
charity | צדקה, ארגון צדקה | We gave money to charity.`),
    u('verbs-adjectives', 'פעלים ותארים', 'Verbs & Adjectives', '⚡', `
describe | לתאר | Describe your best friend.
compare | להשוות | Compare the two pictures.
explain | להסביר | Can you explain the rule?
decide | להחליט | I can't decide what to wear.
improve | לשפר | I want to improve my English.
prefer | להעדיף | I prefer tea to coffee.
suggest | להציע | I suggest we leave early.
avoid | להימנע | Avoid sugary drinks.
important | חשוב | Sleep is important for teenagers.
dangerous | מסוכן | It is dangerous to swim here.
difficult | קשה | The test was difficult.
possible | אפשרי | Is it possible to finish today?
popular | פופולרי, אהוד | This song is very popular.
useful | שימושי | A dictionary is very useful.`),
  ] },
  { n: 8, units: [
    u('digital-world', 'העולם הדיגיטלי', 'The Digital World', '🌐', `
privacy | פרטיות | Protect your privacy online.
account | חשבון | I opened a new account.
profile | פרופיל | Update your profile picture.
link | קישור | Click the link to read more.
browser | דפדפן | Open the website in your browser.
virus | וירוס | A virus can damage your computer.
hacker | האקר | A hacker stole the passwords.
data | נתונים | The app collects data about users.
digital | דיגיטלי | We live in a digital world.
artificial intelligence | בינה מלאכותית | Artificial intelligence can write stories.
cyberbullying | בריונות ברשת | Cyberbullying can hurt people deeply.
addicted | מכור | He is addicted to video games.
connect | להתחבר, לחבר | Connect the printer to the computer.
user | משתמש | The app has a million users.`),
    u('climate-energy', 'אקלים ואנרגיה', 'Climate & Energy', '🌡️', `
temperature | טמפרטורה | The temperature rose to 40 degrees.
drought | בצורת | The drought killed the crops.
fuel | דלק | Cars use a lot of fuel.
carbon | פחמן | Trees absorb carbon from the air.
emissions | פליטות (של גזים) | Factories must cut their emissions.
renewable | מתחדש | Wind is a renewable source of energy.
resources | משאבים | Water is one of our most important resources.
extinct | נכחד | Dinosaurs are extinct.
habitat | בית גידול | The forest is the bear's natural habitat.
melt | להימס | The ice is starting to melt.
consume | לצרוך | We consume too much energy.
environmental | סביבתי | Environmental groups are protesting.
crisis | משבר | The world faces a climate crisis.
sustainable | בר־קיימא | We need sustainable solutions.`),
    u('fitness', 'כושר ותזונה', 'Fitness & Nutrition', '🏋️', `
nutrition | תזונה | Good nutrition helps you grow.
protein | חלבון | Eggs are full of protein.
calories | קלוריות | This drink has a lot of calories.
balanced | מאוזן | Eat a balanced meal.
weight | משקל | He lost weight by walking every day.
workout | אימון | My workout lasts one hour.
sweat | להזיע; זיעה | You sweat a lot when you run.
breathe | לנשום | Breathe slowly and deeply.
recover | להחלים | She recovered quickly after the surgery.
symptom | תסמין | A fever is a common symptom of the flu.
allergic | אלרגי | I am allergic to peanuts.
mental health | בריאות הנפש | Mental health is as important as physical health.
lifestyle | אורח חיים | An active lifestyle keeps you healthy.
junk food | ג׳אנק פוד, מזון לא בריא | Try not to eat too much junk food.`),
    u('communication', 'תקשורת ושיח', 'Communication', '💬', `
communicate | לתקשר | We communicate by text messages.
express | להביע | Art helps us express our feelings.
opinion | דעה | In my opinion, the film was too long.
argue | להתווכח | My brothers argue all the time.
agree | להסכים | I agree with you.
disagree | לא להסכים | I disagree with this idea.
discuss | לדון | Let's discuss the problem.
announce | להודיע, להכריז | The principal announced a school trip.
broadcast | לשדר; שידור | The match was broadcast live.
source | מקור | Wikipedia is not always a reliable source.
reliable | אמין | We need reliable information.
influence | להשפיע; השפעה | Social media can influence young people.
podcast | פודקאסט | I listen to a podcast on the bus.
misunderstand | לא להבין נכון | Sorry, I misunderstood your question.`),
    u('culture', 'תרבות ומסורת', 'Culture & Heritage', '🎭', `
heritage | מורשת | Jerusalem is part of our heritage.
custom | מנהג | It is a custom to eat apples with honey on Rosh Hashanah.
celebrate | לחגוג | We celebrate Independence Day with a barbecue.
festival | פסטיבל, חג | The music festival lasts three days.
immigrant | עולה, מהגר | My grandmother was an immigrant from Morocco.
generation | דור | Three generations live in this house.
language | שפה | Hebrew is an ancient language.
belief | אמונה | People have different beliefs.
society | חברה (ציבור) | Teachers are important in our society.
minority | מיעוט | The law protects the rights of minorities.
diversity | גיוון | Our class is proud of its diversity.
ancient | עתיק | We visited an ancient city.
national | לאומי | The flag is a national symbol.
ceremony | טקס | The ceremony started at nine.`),
    u('science', 'מדע', 'Science', '🔬', `
laboratory | מעבדה | The students work in the laboratory.
research | מחקר | Research shows that sleep helps memory.
result | תוצאה | The results of the experiment surprised us.
observe | לצפות, להתבונן | Observe the plant for a week.
measure | למדוד | Measure the length of the table.
cell | תא | Every living thing is made of cells.
chemical | כימי; חומר כימי | Some chemicals are dangerous.
liquid | נוזל | Water is a liquid.
solid | מוצק | Ice is water in solid form.
gas | גז | Oxygen is a gas.
oxygen | חמצן | We need oxygen to live.
theory | תאוריה | Einstein's theory changed science.
evidence | ראיה, הוכחה | There is no evidence for this claim.
predict | לחזות | Can you predict the weather?`),
  ] },
  { n: 9, units: [
    u('careers', 'עבודה וקריירה', 'Work & Careers', '💼', `
career | קריירה | She wants a career in medicine.
salary | משכורת | He earns a good salary.
employee | עובד | The company has 200 employees.
employer | מעסיק | My employer gave me a day off.
apply | להגיש מועמדות | I applied for a summer job.
skill | מיומנות | Teamwork is an important skill.
experience | ניסיון | Do you have any experience with children?
manager | מנהל | The manager called a meeting.
profession | מקצוע | Teaching is a noble profession.
hire | להעסיק, לגייס | The shop hired three new workers.
fire | לפטר | He was fired for being late every day.
responsible | אחראי | A manager is responsible for the team.
retire | לפרוש לגמלאות | My grandfather retired at 67.
unemployed | מובטל | Many people were unemployed after the crisis.`),
    u('inventions', 'תגליות והמצאות', 'Discoveries & Inventions', '🧪', `
invention | המצאה | The wheel was an important invention.
inventor | ממציא | Edison was a famous inventor.
discovery | תגלית | The discovery of penicillin saved millions.
develop | לפתח | Scientists are developing a new vaccine.
vaccine | חיסון | The vaccine protects against the virus.
progress | התקדמות | Medicine has made great progress.
method | שיטה | This is a new method for cleaning water.
analyze | לנתח | The scientists analyzed the samples.
sample | דגימה | The doctor took a blood sample.
accurate | מדויק | The measurement must be accurate.
mistake | טעות | Every scientist makes mistakes.
achievement | הישג | Landing on the moon was a great achievement.
electric | חשמלי | Electric cars are becoming popular.
patent | פטנט | He got a patent for his invention.`),
    u('tourism', 'תיירות', 'Tourism', '🗺️', `
destination | יעד | Eilat is a popular destination.
accommodation | לינה, מקום לינה | The price includes accommodation.
reservation | הזמנה (של מקום) | I made a reservation for two nights.
landmark | אתר מפורסם, ציון דרך | The Eiffel Tower is a famous landmark.
local | מקומי | Try the local food.
foreign | זר | It's fun to learn a foreign language.
currency | מטבע (של מדינה) | The currency in Japan is the yen.
border | גבול | We crossed the border into Jordan.
schedule | לוח זמנים | The tour has a busy schedule.
delay | עיכוב | The flight had a two-hour delay.
cancel | לבטל | The trip was cancelled because of the storm.
explore | לחקור, לסייר | We explored the old city.
departure | יציאה, המראה | Departure is at 6 a.m.
tour | סיור | We took a tour of the museum.`),
    u('law', 'חוק וצדק', 'Law & Justice', '⚖️', `
crime | פשע | Crime in the city went down.
criminal | פושע | The criminal was caught.
arrest | לעצור (חשוד) | The police arrested two men.
judge | שופט | The judge listened to both sides.
court | בית משפט | The case went to court.
guilty | אשם | He was found guilty.
innocent | חף מפשע | She says she is innocent.
prison | כלא | He spent five years in prison.
punishment | עונש | The punishment was too harsh.
witness | עד | The witness saw the accident.
steal | לגנוב | Someone tried to steal my bike.
fair | הוגן | That's not fair!
justice | צדק | They want justice for the victims.
victim | קורבן | The victim was taken to hospital.`),
    u('relationships', 'אישיות ויחסים', 'Personality & Relationships', '💞', `
relationship | קשר, מערכת יחסים | They have a close relationship.
trust | אמון; לסמוך על | I trust my best friend.
loyal | נאמן | A dog is a loyal friend.
jealous | מקנא | He was jealous of his brother's new phone.
confident | בטוח בעצמו | She is confident on stage.
sensitive | רגיש | He is sensitive to criticism.
stubborn | עקשן | My little sister is so stubborn.
ambitious | שאפתן | She is ambitious and works hard.
mature | בוגר | He is very mature for his age.
apologize | להתנצל | I apologized for being rude.
forgive | לסלוח | Please forgive me.
support | לתמוך; תמיכה | My family supports me.
peer pressure | לחץ חברתי | Peer pressure can be hard to resist.
get along | להסתדר (עם מישהו) | I get along well with my sister.`),
    u('change', 'פעלים של שינוי', 'Verbs of Change', '🔄', `
increase | לעלות, להגדיל | Prices increased last year.
decrease | לרדת, להקטין | The number of smokers decreased.
grow | לגדול | The city continues to grow quickly.
rise | לעלות | The sun rises in the east.
fall | ליפול; לרדת | Prices fall after the holiday season.
become | להפוך ל־, להיעשות | He wants to become a doctor.
replace | להחליף | Robots may replace some workers.
transform | לשנות מן היסוד | The internet transformed our lives.
affect | להשפיע על | Lack of sleep affects your mood.
cause | לגרום | Smoking causes disease.
prevent | למנוע | Washing hands prevents infection.
expand | להתרחב | The company expanded to Europe.
remain | להישאר | Prices remained the same.
disappear | להיעלם | The sun disappeared behind the clouds.`),
  ] },
  { n: 10, units: [
    u('argument', 'טיעון ודעה', 'Argument & Opinion', '🗣️', `
claim | טענה; לטעון | The writer claims that homework is useless.
argue | לטעון | Some experts argue that screens harm sleep.
persuade | לשכנע (לעשות משהו) | She persuaded her parents to buy a dog.
convince | לשכנע (שמשהו נכון) | He convinced me that he was right.
point of view | נקודת מבט | Try to see it from my point of view.
counterargument | טיעון נגדי | A good essay answers the counterargument.
justify | להצדיק | Can you justify your decision?
valid | תקף | That is a valid point.
biased | מוטה, משוחד | The article is biased against young people.
objective | אובייקטיבי | A reporter should be objective.
controversial | שנוי במחלוקת | Animal testing is a controversial issue.
debate | דיון, ויכוח | We held a debate about school uniforms.
conclusion | מסקנה | What is the writer's conclusion?
assume | להניח | Don't assume that everyone agrees with you.
oppose | להתנגד | Many residents oppose the new road.`),
    u('research', 'מחקר ונתונים', 'Research & Data', '📊', `
survey | סקר | A survey of 500 students found that most sleep too little.
study | מחקר | A recent study shows that music helps memory.
participants | משתתפים | The participants answered ten questions.
percent | אחוז | Forty percent of the students walk to school.
average | ממוצע | The average age of the group was 16.
majority | רוב | The majority of people agreed.
statistics | סטטיסטיקה, נתונים | Statistics show that crime is falling.
findings | ממצאים | The findings were published in a journal.
conduct | לערוך (מחקר) | Researchers conducted a study in ten schools.
hypothesis | השערה | The results supported the hypothesis.
graph | גרף | The graph shows a sharp rise in prices.
trend | מגמה | There is a trend toward online shopping.
significant | משמעותי | There was a significant difference between the groups.
estimate | להעריך; הערכה | Experts estimate that a million people visited.
investigate | לחקור | The police are investigating the case.`),
    u('society', 'חברה ופוליטיקה', 'Society & Politics', '🏛️', `
democracy | דמוקרטיה | In a democracy, citizens choose their leaders.
election | בחירות | The election will be held in March.
policy | מדיניות | The new policy bans phones in class.
inequality | אי־שוויון | Inequality between rich and poor is growing.
poverty | עוני | Millions of people live in poverty.
discrimination | אפליה | Discrimination against women is illegal.
freedom | חופש | Freedom of speech is a basic right.
protest | הפגנה; למחות | Thousands joined the protest.
authority | רשות, סמכות | The local authority closed the beach.
public | ציבור; ציבורי | The park is open to the public.
welfare | רווחה | The welfare system helps the elderly.
reform | רפורמה | The government plans an education reform.
issue | סוגיה, נושא | Climate change is a global issue.
responsibility | אחריות | Parents have a responsibility to their children.
leader | מנהיג | A good leader listens to people.`),
    u('psychology', 'פסיכולוגיה', 'Psychology', '🧠', `
behavior | התנהגות | Rewards can change a child's behavior.
emotion | רגש | Music can stir strong emotions.
memory | זיכרון | Sleep improves memory.
personality | אישיות | Every child has a different personality.
anxiety | חרדה | Many students feel anxiety before exams.
motivation | מוטיבציה | Praise increases motivation.
self-esteem | הערכה עצמית, ביטחון עצמי | Sport can build self-esteem.
attitude | גישה, יחס | She has a positive attitude.
react | להגיב | How did he react to the news?
cope | להתמודד | Teens learn to cope with stress.
aware | מודע | Be aware of your feelings.
encourage | לעודד | Teachers should encourage students to ask questions.
depressed | מדוכדך, בדיכאון | He felt depressed after losing his job.
mood | מצב רוח | Exercise improves your mood.
instinct | אינסטינקט, חוש טבעי | Animals follow their instincts.`),
    u('economy', 'כלכלה', 'Economy', '💰', `
economy | כלכלה | The economy grew by three percent.
income | הכנסה | Their income is not enough for rent.
budget | תקציב | We have a budget of 500 shekels.
tax | מס | Everyone has to pay tax.
profit | רווח | The company made a big profit.
loss | הפסד | The shop ended the year with a loss.
industry | תעשייה | The tech industry is huge in Israel.
invest | להשקיע | He invested his money in a new company.
afford | לעמוד בהוצאה, להרשות לעצמו | We can't afford a new car.
consumer | צרכן | Consumers want lower prices.
product | מוצר | The company sells its products online.
demand | ביקוש; לדרוש | Demand for electric cars is rising.
supply | היצע; אספקה | The supply of water is limited.
loan | הלוואה | They took a loan from the bank.
debt | חוב | He paid off all his debt.`),
    u('connectors', 'מילות קישור ופעלים אקדמיים', 'Connectors & Academic Verbs', '🔗', `
however | אולם, עם זאת | The plan is good; however, it is expensive.
therefore | לכן | It rained; therefore, the game was cancelled.
although | למרות ש־ | Although it was late, we kept working.
moreover | יתרה מזאת | The car is cheap; moreover, it is safe.
in addition | בנוסף | In addition, students will get a free lunch.
on the other hand | מצד שני | On the other hand, it takes more time.
despite | למרות | Despite the rain, we went out.
whereas | בעוד ש־ | I like tea, whereas my sister likes coffee.
as a result | כתוצאה מכך | As a result, many people lost their jobs.
for example | לדוגמה | Many fruits, for example apples, are rich in fiber.
indicate | להצביע על, להראות | The results indicate a clear trend.
mention | להזכיר | The article mentions three reasons.
state | לציין, לקבוע | The report states that crime is down.
refer to | להתייחס ל־ | The word "it" in line 5 refers to the plan.
illustrate | להמחיש | The writer uses a story to illustrate the point.`),
  ] },
  { n: 11, units: [
    u('critical-thinking', 'חשיבה ביקורתית', 'Critical Thinking', '⚖️', `
evaluate | להעריך | Evaluate the writer's argument.
interpret | לפרש | How do you interpret the last line?
infer | להסיק | What can we infer from the text?
imply | לרמוז | The writer implies that the plan will fail.
assumption | הנחה | This argument is based on a false assumption.
perspective | נקודת מבט | The story is told from a child's perspective.
reasoning | היגיון, נימוק | I don't follow your reasoning.
logical | הגיוני | That is a logical conclusion.
contradict | לסתור | The two reports contradict each other.
reject | לדחות | The committee rejected the proposal.
acknowledge | להכיר ב־, להודות ב־ | The author acknowledges the problem.
emphasize | להדגיש | The speaker emphasized the need for change.
doubt | ספק; לפקפק | There is no doubt that he is talented.
relevant | רלוונטי, נוגע לעניין | This information is not relevant to the question.
criticize | לבקר, למתוח ביקורת | Critics criticized the film for its ending.`),
    u('academic-research', 'מחקר אקדמי', 'Academic Research', '🔍', `
analysis | ניתוח | The analysis showed clear differences.
approach | גישה | We need a new approach to the problem.
variable | משתנה | Age was an important variable.
factor | גורם | Stress is a major factor in illness.
correlation | מתאם, קשר | There is a correlation between sleep and grades.
phenomenon | תופעה | Global warming is a worldwide phenomenon.
criteria | קריטריונים, אמות מידה | The criteria for success were clear.
verify | לאמת | Scientists must verify their results.
publish | לפרסם | The study was published in 2024.
previous | קודם | Previous research found similar results.
consistent | עקבי | The results were consistent across all groups.
insight | תובנה | The study gives new insight into how children learn.
framework | מסגרת | The report offers a framework for future work.
scope | היקף | The scope of the study was limited.
outcome | תוצאה | The outcome of the experiment was unexpected.`),
    u('global-society', 'חברה גלובלית', 'Global Society', '🌐', `
globalization | גלובליזציה | Globalization has changed the way we shop.
migration | הגירה | Migration from villages to cities is increasing.
refugee | פליט | The refugees crossed the border on foot.
conflict | סכסוך | The conflict lasted many years.
tolerance | סובלנות | Tolerance is the key to living together.
prejudice | דעה קדומה | We must fight prejudice in schools.
ethnic | אתני | The city has many ethnic groups.
identity | זהות | Language is part of our identity.
integrate | להשתלב, לשלב | It took time for them to integrate into society.
urban | עירוני | Urban areas are growing fast.
rural | כפרי | Life in rural areas is quieter.
humanitarian | הומניטרי | The UN sent humanitarian help to the region.
aid | סיוע | Food aid reached the village.
treaty | אמנה, הסכם | The two countries signed a peace treaty.
international | בינלאומי | English is an international language.`),
    u('mind-behavior', 'מוח והתנהגות', 'Mind & Behavior', '🧩', `
cognitive | קוגניטיבי, שכלי | Reading improves cognitive skills.
perception | תפיסה | Our perception of time changes with age.
conscious | מודע | He made a conscious decision to change.
subconscious | תת־מודע | Dreams may reveal subconscious fears.
trauma | טראומה | The war left deep trauma.
resilience | חוסן | Children often show great resilience.
empathy | אמפתיה | Empathy helps us understand others.
impulse | דחף | He bought the shoes on impulse.
reward | תגמול, פרס | A reward can motivate a child.
addiction | התמכרות | Phone addiction is a growing problem.
isolation | בידוד | Isolation can lead to depression.
temper | מזג | He lost his temper and shouted.
tendency | נטייה | She has a tendency to worry.
overcome | להתגבר | She overcame her fear of flying.
distract | להסיח את הדעת | Phones distract students in class.`),
    u('business', 'עסקים ושוק העבודה', 'Business & the Job Market', '📈', `
entrepreneur | יזם | The young entrepreneur started a tech company.
startup | סטארט־אפ | Israel is known for its startups.
investor | משקיע | Investors put millions into the company.
revenue | הכנסות | The company's revenue doubled.
competitor | מתחרה | Our main competitor lowered its prices.
marketing | שיווק | They spent a lot on marketing.
brand | מותג | Nike is a global brand.
negotiate | לנהל משא ומתן | The workers negotiated a higher salary.
inflation | אינפלציה | Inflation made everything more expensive.
recession | מיתון | Many businesses closed during the recession.
workforce | כוח העבודה | Women make up half of the workforce.
automation | אוטומציה | Automation may replace many jobs.
wage | שכר | The minimum wage went up.
contract | חוזה | She signed a two-year contract.
export | לייצא; יצוא | Israel exports technology all over the world.`),
    u('connectors', 'מילות קישור מתקדמות', 'Advanced Connectors', '🔗', `
nevertheless | אף על פי כן | It was raining; nevertheless, they played.
furthermore | יתר על כן | Furthermore, the plan saves money.
consequently | כתוצאה מכך | He missed the bus; consequently, he was late.
thus | כך, לפיכך | Thus, the problem was solved.
in contrast | לעומת זאת | In contrast, the north is green and wet.
similarly | באופן דומה | Similarly, teenagers sleep less in summer.
even though | אף על פי ש־ | Even though he was tired, he finished the race.
unless | אלא אם כן | You will fail unless you study.
in order to | כדי ש־, על מנת | She saves money in order to travel.
due to | בשל, בגלל | The flight was delayed due to fog.
instead of | במקום | Walk instead of taking the car.
regarding | בנוגע ל־ | I have a question regarding the test.
according to | לפי, על פי | According to the report, prices will rise.
in fact | למעשה | In fact, most people agree.
otherwise | אחרת | Hurry up; otherwise, we'll miss the train.`),
  ] },
  { n: 12, units: [
    u('rhetoric', 'רטוריקה וכתיבת חיבור', 'Rhetoric & Essay Writing', '🎤', `
thesis | טענה מרכזית (תזה) | State your thesis in the first paragraph.
rhetorical | רטורי | That was a rhetorical question.
elaborate | להרחיב, לפרט | Can you elaborate on that point?
coherent | קוהרנטי, מגובש | Write a coherent essay with clear paragraphs.
concise | תמציתי | Keep your answer concise.
refute | להפריך | The scientist refuted the old theory.
undermine | לערער, להחליש | The scandal undermined public trust.
compelling | משכנע, מרתק | She made a compelling argument.
subjective | סובייקטיבי | Taste in music is subjective.
tone | נימה, טון | The tone of the letter is angry.
irony | אירוניה | The irony is that the fire station burned down.
paraphrase | לנסח מחדש במילים אחרות | Paraphrase the sentence in your own words.
summarize | לסכם | Summarize the article in five sentences.
address | להתייחס ל־, לטפל ב־ | The essay does not address the main problem.
advocate | לתמוך ב־, לקדם | She advocates for animal rights.`),
    u('methodology', 'שיטות מחקר', 'Research Methods', '🧪', `
empirical | אמפירי | There is little empirical evidence for this.
quantitative | כמותי | The study used quantitative methods.
qualitative | איכותני | Interviews are a qualitative research tool.
controlled | מבוקר | They ran a controlled experiment.
bias | הטיה | The study was free of bias.
replicate | לשחזר (תוצאות) | Other scientists could not replicate the results.
longitudinal | מחקר אורך, לאורך זמן | A longitudinal study followed the children for 20 years.
sample size | גודל המדגם | The sample size was too small.
margin of error | טווח טעות | The poll has a margin of error of three percent.
peer review | ביקורת עמיתים | The paper passed peer review.
cite | לצטט (מקור) | Always cite your sources.
derive | לגזור, להפיק | The data were derived from hospital records.
anomaly | חריגה | The scientists noticed an anomaly in the data.
validate | לתקף, לאשש | Further tests validated the findings.
conclusive | חד־משמעי, מכריע | The evidence is not conclusive.`),
    u('ethics', 'אתיקה וחברה', 'Ethics & Society', '🧭', `
ethical | אתי | Is it ethical to test drugs on animals?
moral | מוסרי | He felt a moral duty to help.
dilemma | דילמה | Doctors often face a difficult dilemma.
integrity | יושרה | A judge must act with integrity.
censorship | צנזורה | Censorship limits freedom of speech.
surveillance | מעקב, פיקוח | Cameras allow constant surveillance of citizens.
consent | הסכמה | You need the patient's consent.
exploit | לנצל | Some companies exploit their workers.
accountable | נושא באחריות | Leaders must be held accountable.
corruption | שחיתות | The minister was accused of corruption.
transparency | שקיפות | The public demands transparency.
privilege | זכות יתר, פריבילגיה | Education should be a right, not a privilege.
obligation | חובה, מחויבות | We have an obligation to protect nature.
legitimate | לגיטימי, מוצדק | That is a legitimate question.
controversy | מחלוקת | The decision caused a lot of controversy.`),
    u('wellbeing', 'נפש ורווחה', 'Mind & Wellbeing', '🌱', `
well-being | רווחה, שלומות | Sport improves both physical and mental well-being.
burnout | שחיקה | Many nurses suffer from burnout.
mindfulness | קשיבות, מיינדפולנס | Mindfulness can reduce stress.
vulnerable | פגיע | Young children are especially vulnerable.
compassion | חמלה | She treats her patients with compassion.
frustration | תסכול | He shouted in frustration.
optimistic | אופטימי | I am optimistic about the future.
pessimistic | פסימי | Don't be so pessimistic!
interaction | אינטראקציה, קשר הדדי | Social interaction is important for children.
adolescence | גיל ההתבגרות | Adolescence is a time of big changes.
independence | עצמאות | Teenagers want more independence.
conform | להתאים את עצמו לנורמה | Many teens feel they must conform.
stereotype | סטריאוטיפ | The film breaks the stereotype of the lazy teenager.
manipulate | לתמרן, להשפיע בעורמה | Ads try to manipulate our emotions.
sustain | לשמר, לקיים לאורך זמן | It is hard to sustain motivation for a long time.`),
    u('global-economy', 'כלכלה עולמית', 'Global Economy', '🏦', `
trade | סחר | Trade between the two countries grew.
import | לייבא; יבוא | Israel imports most of its oil.
tariff | מכס | The new tariff raised the price of cars.
subsidy | סובסידיה, סבסוד | The government gives a subsidy to farmers.
monopoly | מונופול | The company has a monopoly on electricity.
privatize | להפריט | The state privatized the airline.
interest rate | ריבית | The bank raised the interest rate.
exchange rate | שער חליפין | The exchange rate changes every day.
shortage | מחסור | There is a shortage of teachers.
surplus | עודף | The country had a budget surplus.
deficit | גירעון | The deficit grew to four percent.
prosperity | שגשוג | The country enjoyed years of prosperity.
regulation | רגולציה, תקנה | New regulations protect consumers.
asset | נכס | Their home is their biggest asset.
stock market | בורסה | The stock market fell sharply.`),
    u('academic-verbs', 'פעלים אקדמיים', 'Academic Verbs', '🎓', `
demonstrate | להדגים, להראות | The study demonstrates the value of sleep.
constitute | להוות | Women constitute half of the workforce.
attribute | לייחס | He attributes his success to hard work.
facilitate | להקל, לאפשר | Technology can facilitate learning.
enhance | לשפר, להגביר | Music can enhance concentration.
diminish | להפחית, לפחות | His influence diminished over time.
implement | ליישם | The school will implement the new plan next year.
allocate | להקצות | The city allocated money for parks.
assess | להעריך, לבחון | Teachers assess students in many ways.
comprise | להיות מורכב מ־ | The book comprises ten chapters.
distinguish | להבחין | It is hard to distinguish between the twins.
highlight | להדגיש | The report highlights the need for change.
underlie | לעמוד ביסוד | Many factors underlie this problem.
yield | להניב | The experiment yielded surprising results.
pursue | לחתור ל־, לעסוק ב־ | She wants to pursue a career in law.`),
  ] },
]

export const vocabGrade = n => VOCAB_GRADES.find(g => g.n === Number(n))
export const vocabUnit = (n, slug) => vocabGrade(n)?.units.find(x => x.slug === slug)
export const vocabHref = (n, slug) => `/learn/english/grade-${n}/vocabulary${slug ? `/${slug}` : ''}`
export const vocabWordCount = g => g.units.reduce((s, x) => s + x.words.length, 0)

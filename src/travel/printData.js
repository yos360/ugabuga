export const AGES = ['2–3','4–5','6–7','8–10']
export const DURATIONS = ['עד שעה','1–3 שעות','טיסה או נסיעה ארוכה']
export const KIT_COUNTS = [5,9,15]
export function kitPlan(age,duration) {
  if(!Number.isInteger(age)||age<0||age>3||!Number.isInteger(duration)||duration<0||duration>2)throw Error('בחרו גיל ומשך תקינים')
  const kinds=age===0?['color','drawing','maze','differences']:age===1?['color','maze','dots','differences','drawing','sudoku']:['color','maze','dots','differences','wordsearch','sudoku','drawing']
  return ['cover',...Array.from({length:KIT_COUNTS[duration]-1},(_,i)=>kinds[i%kinds.length])]
}
export const BINGO = {
 road:{label:'דרכים',items:[['🚚','משאית'],['🐄','פרה'],['🚦','רמזור'],['⛽','תחנת דלק'],['🚌','אוטובוס'],['🌉','גשר'],['🚜','טרקטור'],['🚲','אופניים'],['🚓','ניידת'],['🌳','עץ'],['🏠','בית'],['🚏','תחנת אוטובוס'],['🐕','כלב'],['☁️','ענן'],['🚑','אמבולנס'],['🏍️','אופנוע'],['🚧','עבודות בדרך'],['🛑','תמרור עצור'],['🚂','רכבת'],['🪧','שלט'],['🚒','כבאית'],['🌻','פרח'],['🏗️','מנוף'],['🦅','ציפור']]},
 airport:{label:'שדה תעופה וטיסה',items:[['🧳','מזוודה'],['🧑‍✈️','דיילת או דייל'],['🔄','מסוע'],['🗼','מגדל פיקוח'],['🔗','חגורה'],['✈️','מטוס'],['🎒','תיק גב'],['🎫','כרטיס'],['🪟','חלון'],['☕','בית קפה'],['🚪','שער'],['🪑','מושב'],['📖','ספר'],['🛂','ביקורת דרכונים'],['🕰️','שעון'],['💧','בקבוק מים'],['🛒','עגלה'],['👨‍✈️','טייס או טייסת'],['📺','מסך'],['🪜','מדרגות'],['🚐','רכב שירות'],['☁️','ענן'],['🛍️','חנות'],['🧸','בובה']]},
 train:{label:'רכבת ועיר',items:[['🚆','רכבת'],['🚉','תחנה'],['🎫','כרטיס'],['🚦','רמזור'],['🚲','אופניים'],['🚶','הולך רגל'],['🏢','בניין'],['🌳','עץ'],['🌉','גשר'],['🛤️','מסילה'],['🚪','דלת'],['🪟','חלון'],['🕰️','שעון'],['🪑','ספסל'],['☕','בית קפה'],['🎒','תיק גב'],['🚌','אוטובוס'],['🏪','חנות'],['🌻','פרח'],['🐕','כלב'],['🪧','שלט'],['🧳','מזוודה'],['🦅','ציפור'],['🚧','עבודות בדרך']]},
}
export function bingoBoards(kind,size=3) {
 const items=BINGO[kind]?.items
 if(!items||![3,4].includes(size))throw Error('לוח לא תקין')
 // Six permutations with different subsets, not merely reordered copies.
 return Array.from({length:6},(_,board)=>Array.from({length:size*size},(_,i)=>items[(i*5+board*3)%items.length]))
}

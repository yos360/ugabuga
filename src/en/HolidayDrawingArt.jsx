import { HANUKKAH_ART } from '../components/hanukkah/HanukkahArt'
import { TUBISHVAT_ART } from '../components/tubishvat/TuBishvatPrint'
import { ROSHHASHANA_ART } from '../components/roshhashana/RoshHashanaPrint'
import { YOMKIPPUR_ART } from '../components/yomkippur/YomKippurPrint'
import { SUKKOT_ART } from '../components/sukkot/SukkotPrint'
import { PURIM_ART } from '../components/purim/PurimPrint'
import { PESACH_ART } from '../components/pesach/PesachPrint'
import { LAGBAOMER_ART } from '../components/lagbaomer/LagBaomerPrint'
import { SHAVUOT_ART } from '../components/shavuot/ShavuotPrint'
import { HolidayPrintLanguage } from '../components/holidays/HolidayPrintLanguage'
const art={hanukkah:HANUKKAH_ART,'tu-bishvat':TUBISHVAT_ART,'rosh-hashanah':ROSHHASHANA_ART,'yom-kippur':YOMKIPPUR_ART,sukkot:SUKKOT_ART,purim:PURIM_ART,passover:PESACH_ART,'lag-baomer':LAGBAOMER_ART,shavuot:SHAVUOT_ART}
export default function HolidayDrawingArt({drawing:d,thumbnail=false}){
 if(!d.native)return <img src={thumbnail?d.thumb:d.src} alt={d.name} loading={thumbnail?'lazy':undefined} className="block h-auto w-full object-contain"/>
 const C=art[d.holiday].find(a=>a.id===d.id)?.C
 if(!C)throw new Error(`Missing holiday artwork: ${d.holiday}/${d.id}`)
 return <HolidayPrintLanguage.Provider value={{title:d.name}}><C/></HolidayPrintLanguage.Provider>
}

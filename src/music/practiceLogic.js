export const STRINGS = [{note:'E2',midi:40,label:'6 · מי נמוך'}, {note:'A2',midi:45,label:'5 · לה'}, {note:'D3',midi:50,label:'4 · רה'}, {note:'G3',midi:55,label:'3 · סול'}, {note:'B3',midi:59,label:'2 · סי'}, {note:'E4',midi:64,label:'1 · מי גבוה'}]
export function beatDuration(bpm) {
  if (!Number.isFinite(bpm) || bpm < 30 || bpm > 250) throw new Error('הקצב צריך להיות בין 30 ל־250 פעימות בדקה.')
  return 60 / bpm
}
export function tapTempo(taps, now) {
  const previous = taps.length && now - taps[taps.length-1] <= 2100 && now > taps[taps.length-1] ? taps : []
  const next = [...previous,now].slice(-8)
  const bpm = next.length < 2 ? null : Math.max(30,Math.min(250,Math.round(60000*(next.length-1)/(now-next[0]))))
  return {taps:next,bpm}
}
export function beatSchedule(next, index, now, bpm, beats, horizon=0.1) {
  const duration=beatDuration(bpm)
  if (!Number.isInteger(beats)||beats<1||beats>12) throw new Error('מספר פעימות לא תקין.')
  if(next<now-0.1){next=now+0.02;index=0}
  const events=[]
  while(next<now+horizon){events.push({time:next,beat:index%beats,accent:index%beats===0});next+=duration;index++}
  return {next,index,events}
}
// YIN cumulative mean normalized difference with parabolic lag refinement.
export function detectPitch(samples,sampleRate) {
  if(!samples?.length||!Number.isFinite(sampleRate)||sampleRate<=0)return null
  let energy=0,mean=0
  for(const x of samples){if(!Number.isFinite(x))return null;mean+=x}
  mean/=samples.length
  for(const x of samples)energy+=(x-mean)**2
  if(Math.sqrt(energy/samples.length)<0.008)return null
  const min=Math.floor(sampleRate/400),max=Math.min(Math.floor(sampleRate/65),Math.floor(samples.length/2)-1)
  if(max<=min)return null
  const diff=new Float64Array(max+1),size=samples.length-max
  for(let lag=1;lag<=max;lag++)for(let i=0;i<size;i++)diff[lag]+=(samples[i]-samples[i+lag])**2
  let sum=0;diff[0]=1
  for(let lag=1;lag<=max;lag++){sum+=diff[lag];diff[lag]=sum?diff[lag]*lag/sum:1}
  for(let lag=Math.max(2,min);lag<max;lag++)if(diff[lag]<0.15){
    while(lag+1<max&&diff[lag+1]<diff[lag])lag++
    const a=diff[lag-1],b=diff[lag],c=diff[lag+1],denom=a-2*b+c
    const refined=lag+(denom?(a-c)/(2*denom):0)
    return sampleRate/refined
  }
  return null
}
export function tuning(frequency, selected=null) {
  if(!Number.isFinite(frequency)||frequency<=0)throw new Error('תדר לא תקין.')
  const measured=69+12*Math.log2(frequency/440)
  const string=selected===null?STRINGS.reduce((a,b)=>Math.abs(a.midi-measured)<Math.abs(b.midi-measured)?a:b):STRINGS[selected]
  if(!string)throw new Error('בחרו מיתר תקין.')
  return {string,cents:(measured-string.midi)*100,frequency}
}

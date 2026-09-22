import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import SEO from '../components/ui/SEO'

const OWNER_EMAIL = 'yos300@gmail.com'
export default function OwnerLogin({ children }){
  const [session,setSession]=useState(undefined),[email,setEmail]=useState(OWNER_EMAIL),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
  useEffect(()=>{let active=true;supabase.auth.getSession().then(({data})=>active&&setSession(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next));return()=>{active=false;subscription.unsubscribe()}},[])
  if(session?.user?.email?.toLowerCase()===OWNER_EMAIL)return children
  async function login(event){event.preventDefault();setBusy(true);setError('');const {data,error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});if(error||data.user?.email?.toLowerCase()!==OWNER_EMAIL){if(!error&&data.session)await supabase.auth.signOut();setError(error?.message||'החשבון הזה אינו חשבון הבעלים.');}setBusy(false)}
  return <div className="mx-auto max-w-md px-4 py-16" dir="rtl"><SEO title="כניסת בעלים" description="כניסה מאובטחת לדוח פעילות עוגה בוגה." noindex path="/admin/login"/><form onSubmit={login} className="rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-[0_7px_0_#e5e7eb]"><p className="font-bold text-violet-600">עוגה בוגה · אזור בעלים</p><h1 className="mt-2 text-3xl font-black">כניסה לדוח הפעילות</h1><p className="mt-2 text-slate-600">הדוח זמין רק לחשבון הבעלים המאושר.</p><label className="mt-6 block font-bold">אימייל<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" className="mt-1 w-full rounded-xl border-2 p-3" required/></label><label className="mt-4 block font-bold">סיסמה<input value={password} onChange={e=>setPassword(e.target.value)} type="password" autoComplete="current-password" className="mt-1 w-full rounded-xl border-2 p-3" required/></label>{error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}<button disabled={busy} className="mt-6 w-full rounded-xl bg-violet-600 px-5 py-3 font-bold text-white disabled:opacity-60">{busy?'נכנסים…':'כניסה מאובטחת'}</button></form></div>
}

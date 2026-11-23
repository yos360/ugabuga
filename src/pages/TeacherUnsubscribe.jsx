import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import { unsubscribeTeacher } from '../utils/teacherSignup'

export default function TeacherUnsubscribe() {
  const [params] = useSearchParams()
  const token = params.get('t')
  const [state, setState] = useState('working')
  useEffect(() => { let live = true; unsubscribeTeacher(token).then(ok => { if (live) setState(ok ? 'done' : 'fail') }); return () => { live = false } }, [token])
  return <div className="mx-auto max-w-xl px-4 py-12 text-center" dir="rtl">
    <SEO title="הסרה מרשימת העדכונים" description="הסרה מרשימת התפוצה של עוגה בוגה" path="/teachers/unsubscribe" noindex />
    <h1 className="text-3xl font-black">הסרה מרשימת העדכונים</h1>
    {state === 'working' && <p className="mt-4 text-lg" role="status">מסירים…</p>}
    {state === 'done' && <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-lg font-bold text-emerald-800" role="status">הוסרתם מהרשימה. לא נשלח לכם עוד מיילים.</p>}
    {state === 'fail' && <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-lg font-bold" role="alert">הקישור לא תקין או שכבר הוסרתם. אפשר לכתוב לנו ל־hellohugabuga@gmail.com ונסיר ידנית.</p>}
    <p className="mt-6"><Link to="/" className="font-bold text-violet-700 underline">חזרה לאתר</Link></p>
  </div>
}

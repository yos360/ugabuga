// "Report inappropriate content" on every page that shows what visitors wrote (walls, invitations,
// lists, draws, quizzes, live games, homework, shared pages). Opens the site chat with the link filled in.
const UGC = /^\/(w|r|l|g|q|t|hw|play|en\/play)\//
export const isUgcPath = pathname => UGC.test(pathname)

export default function ReportContent() {
  const report = () => window.dispatchEvent(new CustomEvent('buga-chat-open', { detail: { topic: 'דיווח על תוכן לא הולם', message: `ראיתי תוכן לא הולם בעמוד הזה:\n${location.origin}${location.pathname}\n\nמה ראיתי: ` } }))
  return <p className="no-print no-present mx-auto max-w-3xl px-4 pb-6 text-center text-sm text-[var(--muted-foreground)]">
    התוכן בעמוד נכתב על ידי מי שיצר אותו. ראיתם משהו לא הולם? <button type="button" onClick={report} className="font-bold underline">🚩 דווחו לנו</button> ונסיר אותו.
  </p>
}

// "בקצרה" box placed right under a page's H1: answers the searcher's question in the first
// lines of the page, with a small facts table and a visible "updated" date.
// AI answer engines (ChatGPT search, Perplexity, Google AI Overviews) quote pages whose
// opening lines answer the question directly, so the top pages lead with this block.
//
// Props:
//   q        — the question a parent/teacher would type (shown as the box heading)
//   a        — 1–3 sentence direct answer (string or JSX)
//   rows     — optional [[label, value], …] facts table
//   updated  — ISO date 'YYYY-MM-DD' of the last real content update
export default function QuickAnswer({ q, a, rows = [], updated }) {
  const d = updated ? updated.split('-') : null
  return (
    <aside className="quick-answer mx-auto my-6 max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 text-right shadow-sm" dir="rtl" aria-label="בקצרה">
      <p className="m-0 mb-1 text-sm font-bold text-[var(--muted-foreground)]">בקצרה</p>
      <h2 className="m-0 mb-2 text-xl font-bold sm:text-2xl">{q}</h2>
      <p className="m-0 text-base leading-relaxed text-[var(--foreground)]/85">{a}</p>
      {rows.length > 0 && (
        <table className="mt-4 w-full border-collapse text-sm sm:text-base">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k} className="border-t border-[var(--border)]">
                <th scope="row" className="w-1/3 py-2 pl-3 align-top font-bold">{k}</th>
                <td className="py-2 align-top text-[var(--foreground)]/85">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {d && <p className="m-0 mt-3 text-xs text-[var(--muted-foreground)]">עודכן: <time dateTime={updated}>{`${Number(d[2])}.${Number(d[1])}.${d[0]}`}</time></p>}
    </aside>
  )
}

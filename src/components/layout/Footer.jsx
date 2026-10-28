import { Link, useLocation } from 'react-router-dom'
import { SITE_SLOGAN, CHANNEL_GO } from '../../data/brand'
import { SOCIAL_LIVE } from '../../data/social'
import MailSignup from '../mail/MailSignup'
import '../mail/mail.css'

import { FOOTER_COLUMNS as COLUMNS } from '../../data/siteMenu'

function FooterLink({ to, children }) {
  return <li><Link to={to} className="flex min-h-[44px] w-full items-center py-1.5 hover:underline underline-offset-4">{children}</Link></li>
}

function ColumnLinks({ links }) {
  return <ul className="mt-2 text-lg">{links.map(([to, label]) => <FooterLink key={to} to={to}>{label}</FooterLink>)}</ul>
}

// The kids zone promises a child browsing alone no outside links: no WhatsApp,
// no supplier sign-up, no mailto — just a quiet sign-off.
function KidsFooter() {
  return (
    <footer className="site-footer mt-16 border-t border-[var(--border)] no-print">
      <p className="mx-auto max-w-6xl px-4 py-8 text-center text-base text-[var(--muted-foreground)]">עוגה בוגה 🎂 משחקים ופעילויות בעברית</p>
    </footer>
  )
}

export default function Footer() {
  const { pathname } = useLocation()
  if (/^\/kids\/?$/.test(pathname)) return <KidsFooter />
  return (
    <footer className="site-footer mt-16 border-t border-[var(--border)] no-print">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {!/^\/(admin|en|mail-preferences)(\/|$)/.test(pathname) && !/^\/shabbat-times\/[^/]+\/?$/.test(pathname) && <MailSignup key={pathname} allowShabbat={/^\/(holidays|shabbat-times|shabbat-activities|shabbat-parents)(\/|$)/.test(pathname)} />}
        {/* Mobile: collapsed accordions to keep the footer short */}
        <div className="sm:hidden">
          {COLUMNS.map(col => (
            <details key={col.title} className="border-b border-[var(--border)] py-2">
              <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between py-2 text-xl font-bold">
                {col.title}<span aria-hidden="true">▾</span>
              </summary>
              <ColumnLinks links={col.links} />
            </details>
          ))}
        </div>
        {/* Desktop: open columns, unchanged */}
        <div className="hidden gap-8 sm:grid sm:grid-cols-3 lg:grid-cols-4">
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h2 className="text-xl">{col.title}</h2>
              <ColumnLinks links={col.links} />
            </div>
          ))}
        </div>
        <Link to="/en" lang="en" className="mt-6 inline-block text-sm underline">English</Link>
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-base">
          <a href="mailto:hellohugabuga@gmail.com" className="flex min-h-[44px] items-center underline decoration-dashed" dir="ltr">✉️ hellohugabuga@gmail.com</a>
          <p className="mt-2">📢 דף חדש כל יום: <a href={CHANNEL_GO} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-dashed">הצטרפו לערוץ הוואטסאפ שלנו</a></p>
          <p className="mt-2">💛 רעיון למשחק? תיקון? משוב? כתבו לנו בוואטסאפ: <a href="https://wa.me/972507772930" target="_blank" rel="noopener noreferrer" className="underline decoration-dashed">050-7772930</a></p>
          {SOCIAL_LIVE.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-2"><span>📱 עקבו אחרינו:</span>{SOCIAL_LIVE.map(([id, name, href, d]) => <a key={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={`עוגה בוגה ב${name}`} title={name} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--border)] hover:bg-[var(--muted)]"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d={d} fill="currentColor" /></svg></a>)}</div>}
          <p className="mt-2">🎪 נותנים שירות לימי הולדת? <Link to="/suppliers/me" className="underline decoration-dashed">הצטרפו למאגר הספקים בחינם</Link></p>
          <p className="mt-2">📣 רוצים להגיע להורים ולגננות? <Link to="/advertise" className="underline decoration-dashed">פרסום בעוגה בוגה</Link></p>
          <p className="mt-4 text-[var(--muted-foreground)]">עוגה בוגה 🎂 {SITE_SLOGAN} · כל הזכויות שמורות.</p>
        </div>
      </div>
    </footer>
  )
}

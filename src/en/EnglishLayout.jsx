import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import SEO from '../components/ui/SEO'
import ScrollToTop from '../components/layout/ScrollToTop'
import { ENGLISH_SECTIONS } from './englishRoutes'
import './english.css'
export default function EnglishLayout({ children }) {
  return <div className="english-site" lang="en" dir="ltr">
    <Helmet htmlAttributes={{ lang: 'en', dir: 'ltr' }} />
    <ScrollToTop />
    <a className="en-skip" href="#site-content">Skip to content</a>
    <header className="en-header"><Link to="/en" className="en-brand">Ugabuga <span aria-hidden="true">🎂</span></Link><nav aria-label="Main navigation"><Link to="/en">Home</Link>{ENGLISH_SECTIONS.map(s => <Link key={s.path} to={s.path}>{s.label}</Link>)}</nav></header>
    <main id="site-content" tabIndex={-1}>{children}</main>
    <footer className="en-footer"><p><strong>Ugabuga</strong> — learning together, one small discovery at a time.</p><nav aria-label="Footer navigation"><Link to="/en">English home</Link>{ENGLISH_SECTIONS.map(s => <Link key={s.path} to={s.path}>{s.label}</Link>)}<Link to="/" lang="he">עברית</Link></nav><p><a href="mailto:hellohugabuga@gmail.com">Contact us</a> · <Link to="/privacy">Privacy policy (Hebrew)</Link></p></footer>
  </div>
}
export function EnglishNotFound() {
  return <div className="en-page"><SEO lang="en" title="Page not found" description="This English page is not available. Return to the Ugabuga English home." noindex /><h1>We could not find that page</h1><p>The address may be incomplete, or this activity may not be available in English yet.</p><Link to="/en">Back to English home</Link></div>
}

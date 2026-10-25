import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { previewFor } from '../layout/PrintPreviewFigure'
import { englishCounterpart } from '../../en/englishLinks'
import { SOCIAL_LIVE } from '../../data/social'

// Other ways people write the name (search engines use these to match brand searches).
export const BRAND_ALIASES = ['UGABUGA', 'Ugabuga', 'אוגה בוגה', 'עוגה-בוגה', 'עוגהבוגה']

// Who runs the site — on the homepage, so search engines and AI assistants can describe the brand.
const ORGANIZATION = {
  '@type': 'Organization',
  'name': 'עוגה בוגה',
  'alternateName': BRAND_ALIASES,
  'url': 'https://ugabuga.co.il',
  'logo': { '@type': 'ImageObject', 'url': 'https://ugabuga.co.il/og-image.png' },
  'description': 'אתר ישראלי חינמי בעברית עם משחקים, דפים להדפסה ולמידה לילדים בגילי 3–12 — להורים, לגננות ולמורות.',
  'email': 'hellohugabuga@gmail.com',
  'areaServed': { '@type': 'Country', 'name': 'Israel' },
  'knowsLanguage': 'he',
  ...(SOCIAL_LIVE.length ? { 'sameAs': SOCIAL_LIVE.map(([, , href]) => href) } : {}),
}

// Google shows about 60–70 characters of a title and ~160 of a description. Past that, the brand
// suffix is dropped first (the page's own words matter more), and descriptions are cut at a word.
export const TITLE_MAX = 70, DESC_MAX = 165
export function seoTitle(title, lang = 'he') {
  if (lang === 'en') { const full = `${title || "Ugabuga — Hebrew learning for families"} | Ugabuga`; return full.length <= TITLE_MAX ? full : title }
  if (!title) return 'עוגה בוגה — משחקים, דפי הדפסה ולמידה לילדים | UGABUGA'
  const full = title + (title.includes('עוגה בוגה') ? ' | UGABUGA' : ' | עוגה בוגה')
  return full.length <= TITLE_MAX ? full : title
}
export function seoDescription(d) {
  if (!d || d.length <= DESC_MAX) return d
  const cut = d.slice(0, DESC_MAX - 1)
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), DESC_MAX - 30)).replace(/[\s,;:—–-]+$/, '') + '…'
}

export function languageAlternates(path, counterpartPath, lang = 'he') {
  if (!counterpartPath) return []
  const he = lang === 'en' ? counterpartPath : path
  const en = lang === 'en' ? path : counterpartPath
  return [{ lang: 'he', href: 'https://ugabuga.co.il' + he }, { lang: 'en', href: 'https://ugabuga.co.il' + en }, { lang: 'x-default', href: 'https://ugabuga.co.il' + he }]
}

export default function SEO({ title, description, path, image = '/og-image.png', noindex = false, type = 'website', structuredData = null, lang = 'he', counterpartPath }) {
  const location = useLocation()
  // The Hebrew brand closes every title, so a search for "עוגה בוגה" matches the whole site.
  const en = lang === 'en'
  const siteName = en ? 'Ugabuga' : 'עוגה בוגה'
  const fullTitle = seoTitle(title, lang)
  const canonicalPath = path ?? location.pathname
  const normalizedPath = canonicalPath === '/' ? '/' : canonicalPath.replace(/\/+$/, '')
  const url = 'https://ugabuga.co.il' + normalizedPath
  // Printable pages share a picture of the sheet itself instead of the generic site image.
  const preview = image === '/og-image.png' ? previewFor(normalizedPath) : null
  const shareImage = preview ? preview.src : image
  const fullImage = shareImage.startsWith('http') ? shareImage : 'https://ugabuga.co.il' + shareImage
  const fullDescription = seoDescription(description) || 'מאגר משחקים ופעילויות בעברית — 100+ משחקים לימי הולדת, כיתה, צהרון ומשפחה. חינם.'
  const isHome = normalizedPath === '/'
  const alternates = languageAlternates(normalizedPath, counterpartPath || (!en ? englishCounterpart(normalizedPath) : undefined), lang)

  // The site-wide WebSite + SearchAction schema only makes sense once, on the
  // homepage — repeating it identically on every game/category/tool page is
  // duplicate structured data that tells search engines nothing page-specific.
  // Pages that have something more specific to say (a game, a tool) can pass
  // their own `structuredData` object/array instead.
  const schemaData = isHome ? {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'עוגה בוגה',
    'alternateName': BRAND_ALIASES,
    'url': 'https://ugabuga.co.il',
    'description': fullDescription,
    'inLanguage': 'he',
    'image': fullImage,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://ugabuga.co.il/games?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    'publisher': ORGANIZATION,
  } : null
  // Every other indexable page says what it is and whose it is — the facts answer engines quote
  // (page name, summary, language, audience, publisher). Page-specific schemas are added after it.
  const pageSchema = !isHome && !noindex ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': title || fullTitle,
    'description': fullDescription,
    'url': url,
    'inLanguage': 'he',
    'isPartOf': { '@type': 'WebSite', 'name': 'עוגה בוגה', 'url': 'https://ugabuga.co.il' },
    'publisher': { '@type': 'Organization', 'name': 'עוגה בוגה', 'url': 'https://ugabuga.co.il' },
    'isAccessibleForFree': true,
    ...(preview ? { 'primaryImageOfPage': fullImage } : {}),
  } : null

  const englishSchema = en && !noindex ? { '@context': 'https://schema.org', '@type': normalizedPath === '/en' ? 'WebSite' : 'WebPage', name: title || fullTitle, description: fullDescription, url, inLanguage: 'en', isAccessibleForFree: true, isPartOf: { '@type': 'WebSite', name: 'Ugabuga', url: 'https://ugabuga.co.il/en' }, publisher: { '@type': 'Organization', name: 'Ugabuga', url: 'https://ugabuga.co.il' } } : null
  const schemas = [en ? englishSchema : schemaData, en ? null : pageSchema, ...(Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [])].filter(Boolean)

  return (
    <Helmet htmlAttributes={{ lang, dir: en ? 'ltr' : 'rtl' }}>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={url} />
      {alternates.map(a => <link key={a.lang} rel="alternate" hrefLang={a.lang} href={a.href} />)}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullImage} />
      {!preview && image === '/og-image.png' && <meta property="og:image:width" content="1200" />}
      {!preview && image === '/og-image.png' && <meta property="og:image:height" content="630" />}
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={en ? 'en_US' : 'he_IL'} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      {schemas.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  )
}

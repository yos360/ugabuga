import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

export default function SEO({ title, description, path, image = '/og-image.png', noindex = false, type = 'website', structuredData = null }) {
  const location = useLocation()
  const fullTitle = title ? title + ' | UGABUGA' : 'עוגה בוגה — מאגר משחקים ופעילויות בעברית | UGABUGA'
  const canonicalPath = path ?? location.pathname
  const normalizedPath = canonicalPath === '/' ? '/' : canonicalPath.replace(/\/+$/, '')
  const url = 'https://ugabuga.co.il' + normalizedPath
  const fullImage = image.startsWith('http') ? image : 'https://ugabuga.co.il' + image
  const fullDescription = description || 'מאגר משחקים ופעילויות בעברית — 100+ משחקים לימי הולדת, כיתה, צהרון ומשפחה. חינם.'
  const isHome = normalizedPath === '/'

  // The site-wide WebSite + SearchAction schema only makes sense once, on the
  // homepage — repeating it identically on every game/category/tool page is
  // duplicate structured data that tells search engines nothing page-specific.
  // Pages that have something more specific to say (a game, a tool) can pass
  // their own `structuredData` object/array instead.
  const schemaData = isHome ? {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'עוגה בוגה',
    'alternateName': 'UGABUGA',
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
    'publisher': {
      '@type': 'Organization',
      'name': 'UGABUGA',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://ugabuga.co.il/og-image.png'
      }
    }
  } : null

  const schemas = [schemaData, ...(Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [])].filter(Boolean)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="he_IL" />
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

import { Helmet } from 'react-helmet-async'

export default function SEO({ title, description, path = '', image = '/og-image.png' }) {
  const fullTitle = title ? title + ' | UGABUGA' : 'עוגה בוגה — מאגר משחקים ופעילויות בעברית | UGABUGA'
  const url = 'https://ugabuga.co.il' + path
  const fullImage = image.startsWith('http') ? image : 'https://ugabuga.co.il' + image

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'מאגר משחקים ופעילויות בעברית — 100+ משחקים לימי הולדת, כיתה, צהרון ומשפחה. חינם.'} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || 'מאגר משחקים ופעילויות בעברית'} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="he_IL" />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  )
}

// Sponsored banners ("פרסומת"), shown by <SponsorBanner /> on a few topic pages.
//
// Each entry:
//   id          stable id, used for the dismiss memory and the `sponsor_click` analytics event
//   name        the advertiser's name as shown on the card
//   label       the ad marking shown on the card (Israeli consumer law: ads must be clearly marked)
//   title       short headline
//   text        one line of modest copy — no invented claims, prices or awards
//   cta         button text
//   url         https link to the advertiser (opens in a new tab, rel="sponsored noopener")
//   image       { src, width, height, alt } — the advertiser's own product photo (in public/sponsors/)
//   placements  path prefixes where the sponsor may appear. '/' means the home page only;
//               any other prefix matches the path itself and everything under it.
//   active      false hides the sponsor everywhere without deleting it
export const SPONSOR_LABEL = 'פרסומת'

export const SPONSORS = [
  {
    id: 'eureka',
    name: 'אאורקה',
    label: SPONSOR_LABEL,
    title: '🃏 חכם על קטנים',
    text: 'כרטיסיות חכמות לגיל הרך — חיות, מילים ראשונות, בעלי מקצוע ובעלי חיים וסביבתם. מאוירות, עם שיר בחרוזים ומשחקים קטנים לשחק ביחד.',
    cta: 'לסדרה באאורקה ←',
    url: 'https://eureka2010.co.il/catalog.asp?Action=Search&SW=%D7%97%D7%9B%D7%9D%20%D7%A2%D7%9C%20%D7%A7%D7%98%D7%A0%D7%99%D7%9D',
    image: {
      src: '/sponsors/eureka/haham-al-ktanim-set.webp',
      width: 500,
      height: 500,
      alt: 'ארבע קופסאות של חכם על קטנים: חיות, מילים ראשונות, בעלי מקצוע, בעלי חיים וסביבתם',
    },
    placements: [
      '/',
      '/speech',
      '/toddlers',
      '/letters',
      '/abc',
      '/printables',
      '/stories',
      '/animals',
      '/words',
      '/english',
      '/family',
      '/ideas',
      '/baby-names',
      '/card-games',
      '/board-games',
      '/teachers',
      '/classroom',
      '/holidays',
      '/gifts',
      '/shabbat-activities',
      '/origami',
      '/music',
    ],
    active: true,
  },
]

// Normalised path without a trailing slash ('/' stays '/').
const clean = path => (String(path || '/').split(/[?#]/)[0].replace(/\/+$/, '') || '/')

export function matchesPlacement(placement, path) {
  const p = clean(placement), here = clean(path)
  if (p === '/') return here === '/'
  return here === p || here.startsWith(p + '/')
}

// The active sponsor for a page (first match wins), or null.
export function sponsorForPath(path, list = SPONSORS) {
  return list.find(s => s.active && (s.placements || []).some(p => matchesPlacement(p, path))) || null
}

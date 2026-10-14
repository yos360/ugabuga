// Coordinates: GeoNames, CC BY 4.0. Rules and provenance: docs/shabbat-times-sources.md.
import { SHABBAT_TOWNS } from './shabbatTowns.js'

export const SHABBAT_CITIES = [
  {
    "slug": "jerusalem",
    "name": "ירושלים",
    "latitude": 31.76904,
    "longitude": 35.21633,
    "geonameId": 281184,
    "offset": 40,
    "offsetSource": "https://www.shomron.org.il/1982/",
    "offsetLabel": "מנהג מתועד"
  },
  {
    "slug": "tel-aviv",
    "name": "תל אביב",
    "latitude": 32.08088,
    "longitude": 34.78057,
    "geonameId": 293397,
    "offset": 22,
    "offsetSource": "https://calendar.2net.co.il/parasha.aspx?city=%D7%AA%D7%9C%20%D7%90%D7%91%D7%99%D7%91&hyear=5785",
    "offsetLabel": "מנהג מתועד"
  },
  {
    "slug": "haifa",
    "name": "חיפה",
    "latitude": 32.81303,
    "longitude": 34.99928,
    "geonameId": 294801,
    "offset": 30,
    "offsetSource": "https://www.shomron.org.il/1982/",
    "offsetLabel": "מנהג מתועד"
  },
  {
    "slug": "beer-sheva",
    "name": "באר שבע",
    "latitude": 31.25181,
    "longitude": 34.7913,
    "geonameId": 295530,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "eilat",
    "name": "אילת",
    "latitude": 29.55805,
    "longitude": 34.94821,
    "geonameId": 295277,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "tiberias",
    "name": "טבריה",
    "latitude": 32.79396,
    "longitude": 35.53152,
    "geonameId": 293322,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "safed",
    "name": "צפת",
    "latitude": 32.96465,
    "longitude": 35.496,
    "geonameId": 293100,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "modiin",
    "name": "מודיעין",
    "latitude": 31.89385,
    "longitude": 35.01504,
    "geonameId": 282926,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "bnei-brak",
    "name": "בני ברק",
    "latitude": 32.08074,
    "longitude": 34.8338,
    "geonameId": 295514,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "petah-tikva",
    "name": "פתח תקווה",
    "latitude": 32.0888,
    "longitude": 34.88666,
    "geonameId": 293918,
    "offset": 30,
    "offsetSource": "docs/codex-task-shabbat-parasha.md",
    "offsetLabel": "מנהג רווח בעיר"
  },
  {
    "slug": "netanya",
    "name": "נתניה",
    "latitude": 32.33294,
    "longitude": 34.85917,
    "geonameId": 294071,
    "offset": 22,
    "offsetSource": "https://calendar.2net.co.il/parasha.aspx?city=%D7%A0%D7%AA%D7%A0%D7%99%D7%94&hyear=5785",
    "offsetLabel": "מנהג מתועד"
  },
  {
    "slug": "ashdod",
    "name": "אשדוד",
    "latitude": 31.79213,
    "longitude": 34.64966,
    "geonameId": 295629,
    "offset": 22,
    "offsetSource": "https://calendar.2net.co.il/parasha.aspx?city=%D7%90%D7%A9%D7%93%D7%95%D7%93&hyear=5785",
    "offsetLabel": "מנהג מתועד"
  },
  {
    "slug": "rishon-lezion",
    "name": "ראשון לציון",
    "latitude": 31.97102,
    "longitude": 34.78939,
    "geonameId": 293703,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "holon",
    "name": "חולון",
    "latitude": 32.01034,
    "longitude": 34.77918,
    "geonameId": 294751,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "ramat-gan",
    "name": "רמת גן",
    "latitude": 32.08227,
    "longitude": 34.81065,
    "geonameId": 293788,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "rehovot",
    "name": "רחובות",
    "latitude": 31.89421,
    "longitude": 34.81199,
    "geonameId": 293725,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "herzliya",
    "name": "הרצליה",
    "latitude": 32.16627,
    "longitude": 34.82536,
    "geonameId": 294778,
    "offset": 22,
    "offsetSource": "https://calendar.2net.co.il/parasha.aspx?city=%D7%94%D7%A8%D7%A6%D7%9C%D7%99%D7%94&hyear=5785",
    "offsetLabel": "מנהג מתועד"
  },
  {
    "slug": "kfar-saba",
    "name": "כפר סבא",
    "latitude": 32.175,
    "longitude": 34.90694,
    "geonameId": 294514,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "raanana",
    "name": "רעננה",
    "latitude": 32.1836,
    "longitude": 34.87386,
    "geonameId": 293807,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "beit-shemesh",
    "name": "בית שמש",
    "latitude": 31.73072,
    "longitude": 34.99293,
    "geonameId": 295432,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "ashkelon",
    "name": "אשקלון",
    "latitude": 31.66926,
    "longitude": 34.57149,
    "geonameId": 295620,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "afula",
    "name": "עפולה",
    "latitude": 32.60907,
    "longitude": 35.2892,
    "geonameId": 295740,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "karmiel",
    "name": "כרמיאל",
    "latitude": 32.90951,
    "longitude": 35.29768,
    "geonameId": 294577,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "nahariya",
    "name": "נהריה",
    "latitude": 33.00892,
    "longitude": 35.09814,
    "geonameId": 294117,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "hadera",
    "name": "חדרה",
    "latitude": 32.44192,
    "longitude": 34.9039,
    "geonameId": 294946,
    "offset": 30,
    "offsetSource": "https://calendar.2net.co.il/parasha.aspx?city=%D7%97%D7%93%D7%A8%D7%94&hyear=5785",
    "offsetLabel": "מנהג מתועד"
  },
  {
    "slug": "ariel",
    "name": "אריאל",
    "latitude": 32.1065,
    "longitude": 35.18449,
    "geonameId": 8199394,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "maale-adumim",
    "name": "מעלה אדומים",
    "latitude": 31.7774,
    "longitude": 35.29875,
    "geonameId": 282993,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "kiryat-shmona",
    "name": "קריית שמונה",
    "latitude": 33.21204,
    "longitude": 35.57044,
    "geonameId": 293825,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "dimona",
    "name": "דימונה",
    "latitude": 31.07079,
    "longitude": 35.03269,
    "geonameId": 295328,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  },
  {
    "slug": "arad",
    "name": "ערד",
    "latitude": 31.25882,
    "longitude": 35.21282,
    "geonameId": 295657,
    "offset": 20,
    "offsetSource": null,
    "offsetLabel": "מנהג רווח"
  }
]

// The 30 documented cities first, then every other city and local council.
export const SHABBAT_PLACES = [...SHABBAT_CITIES, ...SHABBAT_TOWNS]
export const shabbatCity = slug => SHABBAT_PLACES.find(city => city.slug === slug)

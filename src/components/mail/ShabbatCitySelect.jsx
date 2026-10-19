import { SHABBAT_PLACES } from '../../data/shabbatCities'

export default function ShabbatCitySelect({ value, onChange }) {
  return <select value={value} onChange={onChange}>{SHABBAT_PLACES.map(city => <option key={city.slug} value={city.slug}>{city.name} · {city.offset} דק׳ לפני השקיעה</option>)}</select>
}

import { Plane, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COUNTRIES_DATA, MEALS, minPrice } from '../data/countries';
import HotelCard from './HotelCard';

const sel = 'bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500';

export default function CountryView() {
  const { countryId, go, mealFilter, setMealFilter, starFilter, setStarFilter, sort, setSort } = useApp();
  const country = COUNTRIES_DATA.find((c) => c.id === countryId);

  let hotels = country.hotels.filter(
    (h) => (mealFilter === 'all' || h.meal === mealFilter) && Number(h.category) >= starFilter
  );
  if (sort === 'asc') hotels = [...hotels].sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === 'desc') hotels = [...hotels].sort((a, b) => minPrice(b) - minPrice(a));

  return (
    <div>
      <button onClick={() => go('home')} className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition">
        <ArrowRight className="w-4 h-4 transform rotate-180" />
        <span>Назад к списку стран</span>
      </button>

      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 text-white mb-10 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{country.name}</h1>
        <p className="text-slate-300 text-sm max-w-2xl mb-4">{country.description}</p>
        <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-xl text-xs text-blue-200 backdrop-blur-sm">
          <Plane className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{country.flightFrom}</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-4">Лучшие отели направления</h2>
      <div className="flex flex-wrap gap-3 mb-6">
        <select aria-label="Питание" className={sel} value={mealFilter} onChange={(e) => setMealFilter(e.target.value)}>
          {MEALS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <select aria-label="Звёзды" className={sel} value={starFilter} onChange={(e) => setStarFilter(Number(e.target.value))}>
          <option value={0}>Любые звёзды</option>
          <option value={5}>Только 5★</option>
          <option value={4}>4★ и выше</option>
        </select>
        <select aria-label="Сортировка" className={sel} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="default">По умолчанию</option>
          <option value="asc">Сначала дешевле</option>
          <option value="desc">Сначала дороже</option>
        </select>
      </div>

      {hotels.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => <HotelCard key={h.id} hotel={h} countryId={country.id} />)}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
          Нет отелей с такими фильтрами. Выберите «Любое питание» или «Любые звёзды».
        </div>
      )}
    </div>
  );
}

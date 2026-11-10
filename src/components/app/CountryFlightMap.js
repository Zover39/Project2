import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ArrowUpRight, MapPin, Plane } from 'lucide-react';

const RealFlightMap = dynamic(() => import('./RealFlightMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500 sm:h-[390px] dark:bg-slate-800">
      Загружаем карту…
    </div>
  )
});

const ROUTES = [
  { country: 'ОАЭ', city: 'Дубай', airport: 'DXB', position: [25.2532, 55.3657], color: '#0284c7' },
  { country: 'Турция', city: 'Анталья', airport: 'AYT', position: [36.8987, 30.8005], color: '#7c3aed' },
  { country: 'Таиланд', city: 'Пхукет', airport: 'HKT', position: [8.1132, 98.3169], color: '#e11d48' },
  { country: 'Египет', city: 'Шарм-эль-Шейх', airport: 'SSH', position: [27.9773, 34.3949], color: '#d97706' },
  { country: 'Мальдивы', city: 'Мале', airport: 'MLE', position: [4.1918, 73.5291], color: '#0f766e' },
  { country: 'Вьетнам', city: 'Нячанг', airport: 'CXR', position: [12.2279, 109.1924], color: '#15803d' },
  { country: 'Бали', city: 'Денпасар', airport: 'DPS', position: [-8.7482, 115.1672], color: '#be185d' }
];

export default function CountryFlightMap({ hotels, formatMoney, onSelectCountry }) {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const routes = ROUTES.map(route => {
    const countryHotels = hotels.filter(hotel => hotel.country === route.country);
    const lowestPrice = countryHotels.length
      ? Math.min(...countryHotels.map(hotel => Number(hotel.price) || Infinity))
      : null;
    return { ...route, hotelCount: countryHotels.length, lowestPrice };
  });
  const selectedRoute = routes.find(route => route.country === selectedCountry);

  const selectRoute = country => {
    setSelectedCountry(country);
    onSelectCountry?.(country);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900" aria-labelledby="country-flight-map-title">
      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col justify-center">
          <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">
            <Plane className="h-3.5 w-3.5" /> Направления из Астаны · NQZ
          </div>
          <h2 id="country-flight-map-title" className="text-2xl font-black sm:text-3xl">Карта направлений</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Интерактивная карта мира. Нажми на аэропорт назначения или выбери страну ниже, чтобы посмотреть отели.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 text-indigo-500" /> Астана, Казахстан · международный аэропорт NQZ
          </p>
          {selectedRoute && (
            <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/50" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Выбрано направление</p>
                  <p className="mt-1 text-lg font-black">{selectedRoute.city}, {selectedRoute.country}</p>
                </div>
                <div className="rounded-xl bg-white px-3 py-2 text-sm font-black text-indigo-700 dark:bg-slate-900 dark:text-indigo-300">
                  {selectedRoute.airport}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                <span>NQZ</span><ArrowUpRight className="h-3.5 w-3.5" /><span>{selectedRoute.airport}</span>
                <span>·</span><span>{selectedRoute.hotelCount} отелей в каталоге</span>
                {selectedRoute.lowestPrice != null && (
                  <>
                    <span>·</span>
                    <span>от {formatMoney(selectedRoute.lowestPrice)} ₸ / гость за 7 ночей</span>
                  </>
                )}
              </div>
              <button onClick={() => onSelectCountry?.(selectedRoute.country)} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-black text-white transition hover:bg-indigo-700">
                Смотреть отели страны
              </button>
            </div>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
            Карта и координаты аэропортов реальные. Линии показывают направления между городами, но не подтверждают прямые рейсы; расписание, наличие и цены авиабилетов не подключены. Цены отелей — демо.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
          <RealFlightMap
            routes={routes}
            selectedCountry={selectedCountry}
            onSelectCountry={selectRoute}
            formatMoney={formatMoney}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-4 lg:grid-cols-7 dark:bg-slate-800">
        {routes.map(route => (
          <button
            key={route.country}
            type="button"
            onClick={() => selectRoute(route.country)}
            aria-pressed={selectedCountry === route.country}
            className={`bg-white p-3 text-left transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400 dark:bg-slate-900 dark:hover:bg-slate-800 ${selectedCountry === route.country ? 'bg-indigo-50 dark:bg-indigo-950/50' : ''}`}
          >
            <span className="flex items-center gap-2 text-xs font-black">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: route.color }} />
              {route.country}
            </span>
            <span className="mt-1 block truncate text-[10px] text-slate-500">{route.city} · {route.airport}</span>
            <span className="mt-2 block text-[10px] font-bold text-slate-600 dark:text-slate-300">{route.hotelCount} отелей</span>
          </button>
        ))}
      </div>
    </section>
  );
}

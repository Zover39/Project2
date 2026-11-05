import { Plane, Search, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COUNTRIES_DATA, ALL_HOTELS, countryMin } from '../data/countries';
import Img from './Img';
import HotelCard from './HotelCard';

export default function HomeView() {
  const { searchQuery, setSearchQuery, go, money, t } = useApp();
  const q = searchQuery.trim().toLowerCase();
  const countries = COUNTRIES_DATA.filter((c) => c.name.toLowerCase().includes(q));
  const hotels = q ? ALL_HOTELS.filter((h) => (h.name + ' ' + h.beach).toLowerCase().includes(q)) : [];

  return (
    <div>
      {/* Геро-блок */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-14 mb-12 shadow-2xl">
        <div
          className="absolute inset-0 opacity-45 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Вылеты напрямую из Международного аэропорта Астаны (NQZ)</span>
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            {t('Откройте мир с вылетом из столицы')}
          </h1>
          <p className="text-slate-300 text-base md:text-lg mb-8 leading-relaxed">
            Роскошные отели в 7 лучших странах мира. Быстрое бронирование, оплата через Kaspi Pay и расчёт стоимости тура прямо на сайте.
          </p>
          <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center space-x-2" role="search">
            <Search className="w-5 h-5 text-slate-400 ml-2" />
            <input
              type="search"
              aria-label="Поиск"
              placeholder={t('Поиск по стране, городу или отелю...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm md:text-base focus:outline-none px-2"
            />
          </div>
        </div>
      </div>

      {/* Сетка стран */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('Популярные направления из Астаны')}</h2>
        {countries.length === 0 && hotels.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            Ничего не найдено по запросу «{searchQuery}». Попробуйте «Дубай», «Бали» или «Rixos».
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((country) => (
            <div
              key={country.id}
              onClick={() => go('home', country.id)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-slate-800 to-blue-600">
                <Img src={country.image} alt={country.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{country.name}</h3>
                  <p className="text-xs text-slate-200 line-clamp-1">{country.description}</p>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 mb-2 flex items-center space-x-1.5">
                  <Plane className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>{country.flightFrom}</span>
                </p>
                <p className="text-sm text-slate-600 mb-4">Отели от <b className="text-blue-600">{money(countryMin(country))}</b></p>
                <button className="w-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center space-x-2">
                  <span>Смотреть отели ({country.hotels.length})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hotels.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Найденные отели ({hotels.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((h) => <HotelCard key={h.id} hotel={h} countryId={h.countryId} />)}
          </div>
        </div>
      )}
    </div>
  );
}

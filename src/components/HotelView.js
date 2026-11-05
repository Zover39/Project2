import { useState } from 'react';
import { ArrowRight, MapPin, Check, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COUNTRIES_DATA, FLIGHT_CLASSES } from '../data/countries';
import Img from './Img';
import CheckoutModal from './CheckoutModal';

const field = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500';

export default function HotelView() {
  const { countryId, hotelId, go, favorites, toggleFavorite, money, calculatePrice, trip, updateTrip, minDate, t } = useApp();
  const [room, setRoom] = useState(null);
  const country = COUNTRIES_DATA.find((c) => c.id === countryId);
  const hotel = country.hotels.find((h) => h.id === hotelId);
  const fav = favorites.includes(hotel.id);

  return (
    <div>
      <button onClick={() => go('home', country.id)} className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6 transition">
        <ArrowRight className="w-4 h-4 transform rotate-180" />
        <span>Назад к списку отелей</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Левая колонка: информация об отеле */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="relative h-72 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-slate-800 to-blue-600">
              <Img src={hotel.image} alt={hotel.name} />
            </div>

            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{hotel.name}</h1>
                <p className="text-sm text-slate-500 flex items-center space-x-1.5">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{hotel.beach}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleFavorite(hotel.id)}
                  aria-pressed={fav}
                  aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
                  className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center"
                >
                  <Heart className={`w-5 h-5 ${fav ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
                </button>
                <span className="bg-blue-50 text-blue-600 text-sm font-bold px-3 py-1 rounded-xl">★ {hotel.category} Звезды</span>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-6">{hotel.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Спорт и активность</h4>
                <p className="text-xs text-slate-700">{hotel.amenities.sport}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Рестораны и бары</h4>
                <p className="text-xs text-slate-700">{hotel.amenities.restaurants}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Для детей</h4>
                <p className="text-xs text-slate-700">{hotel.amenities.children}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Что входит в тур</h4>
                <ul className="space-y-1">
                  {hotel.amenities.tourIncludes.map((inc) => (
                    <li key={inc} className="text-xs text-slate-700 flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Выбор номера */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Выберите категорию номера</h3>
            <div className="space-y-4">
              {hotel.rooms.map((r) => (
                <div key={r.type} className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-blue-500 transition">
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{r.type}</h4>
                    <p className="text-xs text-slate-500">Включает проживание, питание и трансфер из аэропорта</p>
                  </div>
                  <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Итого за тур</span>
                      <span className="text-xl font-extrabold text-blue-600">{money(calculatePrice(r.priceBase))}</span>
                    </div>
                    <button onClick={() => setRoom(r)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition">
                      {t('Забронировать')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка: калькулятор тура и дат */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm lg:sticky lg:top-28">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('Настройка перелета и дат')}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="dep" className="text-xs font-bold text-slate-600 block mb-1">Дата вылета из Астаны (NQZ)</label>
                <input
                  id="dep" type="date" min={minDate} value={trip.departureDate} className={field}
                  onChange={(e) => updateTrip({ departureDate: e.target.value && e.target.value < minDate ? minDate : e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="nights" className="text-xs font-bold text-slate-600 block mb-1">Количество ночей: {trip.nights}</label>
                <input id="nights" type="range" min="3" max="21" value={trip.nights} onChange={(e) => updateTrip({ nights: Number(e.target.value) })} className="w-full accent-blue-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ad" className="text-xs font-bold text-slate-600 block mb-1">Взрослые</label>
                  <select id="ad" value={trip.adults} onChange={(e) => updateTrip({ adults: Number(e.target.value) })} className={field}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} взр.</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ch" className="text-xs font-bold text-slate-600 block mb-1">Дети</label>
                  <select id="ch" value={trip.children} onChange={(e) => updateTrip({ children: Number(e.target.value) })} className={field}>
                    {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} дет.</option>)}
                  </select>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-1">Класс перелета</span>
                <div className="grid grid-cols-3 gap-2">
                  {FLIGHT_CLASSES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateTrip({ flightClass: c.id })}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${trip.flightClass === c.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500">Ребёнок считается как 0,7 взрослого. Цены ориентировочные.</p>
            </div>
          </div>
        </div>
      </div>

      {room && <CheckoutModal hotel={hotel} country={country} room={room} onClose={() => setRoom(null)} />}
    </div>
  );
}

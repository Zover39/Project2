import { useMemo, useState } from 'react';
import HotelListingCard from './HotelListingCard';
import GuestSelector from './GuestSelector';

export function TourFinder({ app }) {
  const {
    hotels, COUNTRIES, formatMoney, favorites, toggleFav, openHotel, compareIds,
    toggleCompare, adults, children, updateGuestCounts
  } = app;
  const [country, setCountry] = useState('ALL');
  const [departure, setDeparture] = useState('');
  const [nights, setNights] = useState(7);
  const [budget, setBudget] = useState(3000000);
  const [minimumStars, setMinimumStars] = useState(0);
  const guests = adults + children;

  const results = useMemo(() => hotels
    .filter(hotel => country === 'ALL' || hotel.country === country)
    .filter(hotel => !minimumStars || hotel.stars >= minimumStars)
    .filter(hotel => hotel.price * (nights / 7) * guests <= budget)
    .sort((a, b) => a.price * nights - b.price * nights), [hotels, country, minimumStars, nights, guests, budget]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-black">Подбор тура под ваш бюджет</h2>
        <p className="mt-2 text-sm text-indigo-200">Укажите параметры — стоимость рассчитывается для выбранных гостей и длительности. Доступность дат пока не проверяется.</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="text-xs font-bold">Страна
            <select value={country} onChange={event => setCountry(event.target.value)} className="mt-1 w-full rounded-xl bg-white p-3 text-sm text-slate-900">
              <option value="ALL">Любая страна</option>
              {COUNTRIES.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold">Дата заезда
            <input type="date" min={new Date().toLocaleDateString('sv-SE')} value={departure} onChange={event => setDeparture(event.target.value)} className="mt-1 w-full rounded-xl bg-white p-3 text-sm text-slate-900" />
          </label>
          <label className="text-xs font-bold">Длительность
            <select value={nights} onChange={event => setNights(Number(event.target.value))} className="mt-1 w-full rounded-xl bg-white p-3 text-sm text-slate-900">
              {[3, 5, 7, 10, 14].map(value => <option key={value} value={value}>{value} ночей</option>)}
            </select>
          </label>
          <div className="rounded-xl bg-white p-3 text-slate-900">
            <p className="mb-2 text-xs font-bold">Количество гостей</p>
            <GuestSelector adults={adults} children={children} onChange={updateGuestCounts} />
          </div>
          <label className="text-xs font-bold">Минимум звёзд
            <select value={minimumStars} onChange={event => setMinimumStars(Number(event.target.value))} className="mt-1 w-full rounded-xl bg-white p-3 text-sm text-slate-900">
              <option value={0}>Любой рейтинг</option>
              {[3, 4, 5].map(value => <option key={value} value={value}>{value}+ звёзд</option>)}
            </select>
          </label>
          <label className="text-xs font-bold">Бюджет: {formatMoney(budget)} ₸
            <input type="range" min="200000" max="50000000" step="500000" value={budget} onChange={event => setBudget(Number(event.target.value))} className="mt-3 w-full accent-indigo-300" />
          </label>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-lg">Подходящих вариантов: {results.length}</h3>
        {departure && <p className="text-sm text-slate-500">Планируемый заезд: {new Date(`${departure}T00:00:00`).toLocaleDateString('ru-RU')}</p>}
      </div>
      {results.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(hotel => (
            <HotelListingCard
              key={hotel.id}
              hotel={hotel}
              isFavorite={favorites.includes(hotel.id)}
              onToggleFavorite={toggleFav}
              onSelect={hotel => openHotel(hotel, {
                adults,
                children,
                nights,
                departureDate: departure
              })}
              isCompared={compareIds.includes(hotel.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white dark:bg-slate-900 p-8 text-center text-slate-500">Нет вариантов в выбранном бюджете. Попробуйте увеличить бюджет или изменить параметры.</p>
      )}
    </section>
  );
}

export function HotelComparison({ app }) {
  const { comparedHotels, clearCompare, openHotel, formatMoney, setActiveTab } = app;
  const rows = [
    ['Страна и город', hotel => `${hotel.country}, ${hotel.city}`],
    ['Категория', hotel => `${hotel.stars} звёзд`],
    ['Рейтинг гостей', hotel => hotel.rating != null && hotel.reviews?.length ? `${hotel.rating} / 5` : 'Пока нет оценок'],
    ['Питание', hotel => hotel.meal],
    ['Пляж', hotel => hotel.beach],
    ['Цена за тур', hotel => `${formatMoney(hotel.price)} ₸`]
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Сравнение отелей</h2>
          <p className="text-sm text-slate-500 mt-1">Выбрано {comparedHotels.length} из 3. Список сохраняется в этом браузере.</p>
        </div>
        {comparedHotels.length > 0 && <button onClick={clearCompare} className="rounded-xl border px-4 py-2 text-sm font-bold">Очистить сравнение</button>}
      </div>
      {comparedHotels.length < 2 ? (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <p className="font-bold">Добавьте минимум два отеля для сравнения</p>
          <p className="mt-2 text-sm text-slate-500">Нажмите «Сравнить» на карточках в каталоге или в подборщике.</p>
          <button onClick={() => setActiveTab('catalog')} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white">Открыть каталог</button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-36 p-4 text-slate-500">Параметр</th>
                {comparedHotels.map(hotel => (
                  <th scope="col" key={hotel.id} className="min-w-48 p-4 align-top">
                    <button onClick={() => openHotel(hotel)} className="text-left font-black text-indigo-600 hover:underline">{hotel.name}</button>
                    <img src={hotel.image} alt={hotel.name} className="mt-3 h-32 w-full rounded-xl object-cover" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-t border-slate-100 dark:border-slate-800">
                  <th scope="row" className="p-4 font-semibold text-slate-500">{label}</th>
                  {comparedHotels.map(hotel => <td key={hotel.id} className="p-4 font-semibold">{value(hotel)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

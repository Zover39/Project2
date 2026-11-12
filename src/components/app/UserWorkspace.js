import {
  AlertTriangle, Bot, CalendarDays, Download, Filter, Heart, MapPin, Search, ShoppingBag, Sparkles, X, Zap
} from 'lucide-react';
import HotelListingCard from './HotelListingCard';
import GuestSelector from './GuestSelector';
import { HotelComparison, TourFinder } from './HotelTools';
import CountryFlightMap from './CountryFlightMap';
import { buildBookingsCsv, buildFavoritesCsv } from '../../utils/csv';

export default function UserWorkspace({ app }) {
  const today = new Date();
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const {
    activeTab, hotels, tinderIndex, setTinderIndex, formatMoney, toggleFav,
    pushToast, currentUser, bookings, search, setSearch, filterCountry,
    setFilterCountry, filterCity, setFilterCity, filterMeal, setFilterMeal,
    maxPrice, setMaxPrice, sortOrder, setSortOrder, resetFilters,
    quickFilters, setQuickFilters,
    destinationQuery, setDestinationQuery, checkInDate, setCheckInDate,
    checkOutDate, setCheckOutDate, adults, children, updateGuestCounts,
    appliedDestination, setAppliedDestination, handleCatalogSearch,
    COUNTRIES, CITIES, MEAL_TYPES, filteredCatalog, favoriteHotels,
    favorites, openHotel, tourConfig, clearFavorites, setCheckoutStep,
    favoriteNotes, updateFavoriteNote, recentlyViewedHotels,
    compareIds, toggleCompare, cancelBooking
  } = app;
  const currentUserBookings = bookings.filter(booking => booking.user.id === currentUser.id);

  const downloadCsv = (content, fileName) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const downloadFavorites = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(buildFavoritesCsv(favoriteHotels, favoriteNotes), `astana-travel-favorites-${date}.csv`);
  };

  const downloadBookings = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(buildBookingsCsv(currentUserBookings), `astana-travel-bookings-${date}.csv`);
  };

  return (
    <>
            {/* 1. КАТАЛОГ И ФИЛЬТРЫ */}
            {activeTab === 'catalog' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <section className="motion-hero overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-800 to-indigo-700 p-5 text-white shadow-xl sm:p-8">
                  <div className="mx-auto max-w-4xl">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">ASTANA TRAVEL · КАТАЛОГ ОТЕЛЕЙ</p>
                    <h2 className="text-3xl font-black sm:text-4xl">Найдите свой отдых</h2>
                    <p className="mb-6 mt-2 text-sm text-indigo-100">Выберите направление, даты и гостей — покажем подходящие отели из каталога.</p>

                    <form onSubmit={handleCatalogSearch} className="rounded-2xl bg-white p-3 text-slate-900 shadow-2xl">
                      <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-[1.4fr_1fr_1fr] md:divide-x md:divide-y-0">
                        <label className="flex min-w-0 items-center gap-3 px-3 py-3">
                          <MapPin className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Направление</span>
                            <input
                              list="hotel-destinations"
                              value={destinationQuery}
                              onChange={event => setDestinationQuery(event.target.value)}
                              placeholder="Страна, город или отель"
                              aria-label="Страна, город или отель"
                              className="mt-1 w-full bg-transparent text-sm font-bold outline-none placeholder:font-normal placeholder:text-slate-400"
                            />
                            <datalist id="hotel-destinations">
                              {[...new Set([...COUNTRIES, ...Object.values(CITIES).flat(), ...hotels.map(hotel => hotel.name)])]
                                .map(destination => <option key={destination} value={destination} />)}
                            </datalist>
                          </span>
                        </label>
                        <label className="flex items-center gap-3 px-3 py-3">
                          <CalendarDays className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Заезд</span>
                            <input
                              type="date"
                              value={checkInDate}
                              min={todayValue}
                              onChange={event => setCheckInDate(event.target.value)}
                              aria-label="Дата заезда"
                              className="mt-1 w-full bg-transparent text-sm font-bold outline-none"
                            />
                          </span>
                        </label>
                        <label className="flex items-center gap-3 px-3 py-3">
                          <CalendarDays className="h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Выезд</span>
                            <input
                              type="date"
                              value={checkOutDate}
                              min={checkInDate || todayValue}
                              onChange={event => setCheckOutDate(event.target.value)}
                              aria-label="Дата выезда"
                              className="mt-1 w-full bg-transparent text-sm font-bold outline-none"
                            />
                          </span>
                        </label>
                      </div>
                      <div className="mt-2 flex flex-col gap-3 border-t border-slate-100 px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <GuestSelector adults={adults} children={children} onChange={updateGuestCounts} />
                        <button type="submit" className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2">
                          Найти отели
                        </button>
                      </div>
                    </form>

                    <p className="mt-3 text-xs leading-relaxed text-indigo-200">
                      Демокаталог: поиск подбирает отели по направлению. Цены, наличие, перелёты и тарифы не проверяются.
                    </p>
                  </div>
                </section>

                <CountryFlightMap
                  hotels={hotels}
                  formatMoney={formatMoney}
                  onSelectCountry={country => {
                    setDestinationQuery(country);
                    setAppliedDestination(country);
                    setFilterCountry('ALL');
                    setFilterCity('ALL');
                  }}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <details>
                    <summary className="cursor-pointer list-none text-sm font-bold text-slate-700 dark:text-slate-200">
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><Filter className="h-4 w-4 text-indigo-500" /> Точные фильтры</span>
                        <span className="text-xs font-medium text-slate-500">Страна · курорт · питание · цена</span>
                      </span>
                    </summary>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      <label className="text-xs font-bold text-slate-500">Поиск по отелю
                        <input type="search" placeholder="Название или город" value={search} onChange={event => setSearch(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                      </label>
                      <label className="text-xs font-bold text-slate-500">Страна
                        <select value={filterCountry} onChange={event => { setFilterCountry(event.target.value); setFilterCity('ALL'); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                          <option value="ALL">Все страны</option>
                          {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-slate-500">Курорт / город
                        <select value={filterCity} onChange={event => setFilterCity(event.target.value)} disabled={filterCountry === 'ALL'} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                          <option value="ALL">Все курорты</option>
                          {filterCountry !== 'ALL' && (CITIES[filterCountry] || []).map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-slate-500">Тип питания
                        <select value={filterMeal} onChange={event => setFilterMeal(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                          <option value="ALL">Любое питание</option>
                          {MEAL_TYPES.map(meal => <option key={meal} value={meal}>{meal}</option>)}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-slate-500">Цена до: {formatMoney(maxPrice)} ₸
                        <input type="range" min="300000" max="4000000" step="50000" value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} className="mt-3 w-full accent-indigo-600" />
                      </label>
                    </div>
                  </details>
                  <div className="mt-4 flex flex-wrap gap-2" aria-label="Быстрые фильтры">
                      {[
                        ['beach', 'У моря'],
                        ['pool', 'Бассейн'],
                        ['breakfast', 'Завтрак'],
                        ['budget', 'До 1 млн ₸']
                      ].map(([filter, label]) => {
                        const selected = quickFilters.includes(filter);
                        return (
                          <button
                            key={filter}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setQuickFilters(current => selected
                              ? current.filter(item => item !== filter)
                              : [...current, filter])}
                            className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                              selected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                  </div>
                  {appliedDestination && (
                    <div className="flex flex-wrap items-center gap-2 px-1 text-sm" role="status">
                      <span className="text-slate-500">Направление:</span>
                      <span className="rounded-full bg-indigo-50 px-3 py-1 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{appliedDestination}</span>
                      {checkInDate && <span className="text-slate-500">{new Date(`${checkInDate}T00:00:00`).toLocaleDateString('ru-RU')}{checkOutDate ? ` — ${new Date(`${checkOutDate}T00:00:00`).toLocaleDateString('ru-RU')}` : ''}</span>}
                      <span className="text-slate-500">{adults} взр. · {children} детей</span>
                      <button type="button" onClick={resetFilters} className="font-bold text-indigo-600 hover:underline">Сбросить</button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-2">
                  <h3 className="font-bold text-lg flex items-center gap-2"><Filter className="w-5 h-5 text-indigo-500"/> Найдено туров: {filteredCatalog.length}</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="sr-only" htmlFor="catalog-sort">Сортировка отелей</label>
                    <select
                      id="catalog-sort"
                      value={sortOrder}
                      onChange={event => setSortOrder(event.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold"
                    >
                      <option value="recommended">Сначала рекомендуемые</option>
                      <option value="price-asc">Сначала дешевле</option>
                      <option value="price-desc">Сначала дороже</option>
                    </select>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCatalog.map(h => (
                    <HotelListingCard
                      key={h.id}
                      hotel={h}
                      isFavorite={favorites.includes(h.id)}
                      onToggleFavorite={toggleFav}
                      onSelect={openHotel}
                      isCompared={compareIds.includes(h.id)}
                      onToggleCompare={toggleCompare}
                    />
                  ))}
                  {filteredCatalog.length === 0 && (
                    <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                      <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                      <p className="text-lg font-bold">По вашему запросу ничего не найдено</p>
                      <p className="mt-1 text-slate-500">Попробуйте убрать часть фильтров или сбросить их.</p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                      >
                        Сбросить фильтры
                      </button>
                    </div>
                  )}
                </div>
                {recentlyViewedHotels.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">Недавно смотрели</h3>
                      <button onClick={() => app.setActiveTab('recent')} className="text-sm font-bold text-indigo-600">Все просмотры</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentlyViewedHotels.slice(0, 3).map(hotel => (
                        <HotelListingCard key={hotel.id} hotel={hotel} isFavorite={favorites.includes(hotel.id)} onToggleFavorite={toggleFav} onSelect={openHotel} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {activeTab === 'trip-finder' && <TourFinder app={app} />}

            {activeTab === 'compare' && <HotelComparison app={app} />}

            {activeTab === 'recent' && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-black">Недавно просмотренные</h2>
                  <p className="text-sm text-slate-500 mt-1">История хранится только в этом браузере.</p>
                </div>
                {recentlyViewedHotels.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentlyViewedHotels.map(hotel => (
                      <HotelListingCard key={hotel.id} hotel={hotel} isFavorite={favorites.includes(hotel.id)} onToggleFavorite={toggleFav} onSelect={openHotel} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white dark:bg-slate-900 p-10 text-center text-slate-500">Здесь появятся отели, которые вы открывали.</div>
                )}
              </section>
            )}

            {activeTab === 'favorites' && (
              <section className="space-y-6 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black flex items-center gap-2">
                      <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                      Избранное
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Сохранённые вами отели: {favoriteHotels.length}</p>
                  </div>
                  {favoriteHotels.length > 0 && (
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        type="button"
                        onClick={downloadFavorites}
                        className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        Скачать список
                      </button>
                      <button onClick={clearFavorites} className="text-sm font-bold text-rose-500 hover:text-rose-600 transition">
                        Очистить избранное
                      </button>
                    </div>
                  )}
                </div>
                {favoriteHotels.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 py-16 px-6 text-center">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">Пока ничего не добавлено</h3>
                    <p className="text-sm text-slate-500 mt-2">Нажмите на сердечко в карточке отеля, чтобы сохранить его здесь.</p>
                    <button onClick={() => app.setActiveTab('catalog')} className="mt-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl transition">
                      Перейти в каталог
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoriteHotels.map(hotel => (
                      <div key={hotel.id}>
                        <HotelListingCard
                          hotel={hotel}
                          isFavorite
                          onToggleFavorite={toggleFav}
                          onSelect={openHotel}
                          isCompared={compareIds.includes(hotel.id)}
                          onToggleCompare={toggleCompare}
                        />
                        <label className="mt-[-1.25rem] block">
                          <span className="sr-only">Заметка к отелю {hotel.name}</span>
                          <textarea
                            rows="2"
                            value={favoriteNotes[hotel.id] || ''}
                            onChange={event => updateFavoriteNote(hotel.id, event.target.value)}
                            onClick={event => event.stopPropagation()}
                            placeholder="Добавить личную заметку..."
                            className="w-full resize-y rounded-b-2xl border border-t-0 border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 2. TINDER РЕЖИМ */}
            {activeTab === 'tinder' && hotels.length > 0 && (
              <div className="flex flex-col items-center justify-center py-10 animate-in slide-in-from-bottom-8">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-rose-500 flex items-center justify-center gap-2"><Zap /> Быстрый подбор</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Смахните вправо, чтобы добавить в избранное.</p>
                </div>
                {tinderIndex < hotels.length ? (
                  <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="relative h-96">
                      <img src={hotels[tinderIndex].image} className="w-full h-full object-cover" alt="Hotel" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                        <h3 className="text-3xl font-black leading-tight mb-1">{hotels[tinderIndex].name}</h3>
                        <p className="text-sm opacity-90">{hotels[tinderIndex].country} • {'★'.repeat(hotels[tinderIndex].stars)}</p>
                        <p className="text-2xl font-bold mt-2 text-indigo-300">{formatMoney(hotels[tinderIndex].price)} ₸</p>
                      </div>
                    </div>
                    <div className="p-6 flex justify-center gap-8 bg-slate-50 dark:bg-slate-950">
                      <button onClick={() => setTinderIndex(i => i + 1)} className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-lg text-slate-400 flex items-center justify-center hover:scale-110 hover:text-rose-500 transition border border-slate-200 dark:border-slate-700"><X className="w-8 h-8" /></button>
                      <button onClick={() => { toggleFav(hotels[tinderIndex]); setTinderIndex(i => i + 1); }} className="w-16 h-16 rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/40 text-white flex items-center justify-center hover:scale-110 transition"><Heart className="w-8 h-8" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center font-bold text-slate-500">Вы просмотрели всю базу! Перейдите в Избранное.</div>
                )}
              </div>
            )}

            {/* 3. AI ASSISTANT */}
            {activeTab === 'ai' && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg animate-in zoom-in-95">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center"><Bot className="w-8 h-8 text-purple-600 dark:text-purple-400"/></div>
                  <div><h2 className="text-2xl font-black">Smart AI Ассистент</h2><p className="text-sm text-slate-500 dark:text-slate-400">Напишите запрос в свободной форме</p></div>
                </div>
                <textarea rows="4" placeholder="Например: Хочу на море в Дубай, нас двое взрослых, бюджет до 1.5 млн тенге..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500 mb-4 placeholder:text-slate-400" />
                <button onClick={() => pushToast('AI: Анализирую базу данных... (Симуляция)')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition">
                  <Sparkles className="w-5 h-5"/> Искать идеальный тур
                </button>
              </div>
            )}

            {/* 4. КАБИНЕТ (ПРОФИЛЬ & ЛОЯЛЬНОСТЬ) */}
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
                {currentUser.isBanned && (
                  <div className="bg-rose-500 text-white p-4 rounded-2xl font-bold flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6"/> Ваш аккаунт ограничен модератором. Вы не можете оставлять отзывы.
                  </div>
                )}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400">{currentUser.name[0]}</div>
                    <div><h2 className="text-2xl font-bold">{currentUser.name}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.phone}</p></div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs uppercase font-bold text-amber-500">Статус лояльности</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{currentUser.status}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-bold">Мои демо-бронирования</h3>
                  {currentUserBookings.length > 0 && (
                    <button
                      type="button"
                      onClick={downloadBookings}
                      className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Скачать заявки
                    </button>
                  )}
                </div>
                {currentUserBookings.length === 0 ? (
                  <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">У вас пока нет демо-заявок</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentUserBookings.map(b => (
                      <div key={b.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <img src={b.hotel.image} className="w-20 h-20 rounded-xl object-cover" alt="Hotel" />
                          <div>
                            <h4 className="font-bold text-lg leading-tight">{b.hotel.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">Номер: {b.id} | Создано: {b.date}</p>
                            <p className="text-xs text-slate-500 mt-1">{b.trip?.pax || 2} гостей · {b.trip?.nights || 7} ночей</p>
                            <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">Демо-бронирование — оплата не производилась</p>
                          </div>
                        </div>
                        <div className="text-right w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                          <p className="font-black text-xl text-indigo-600 dark:text-indigo-400">{formatMoney(b.price)} ₸</p>
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold mt-1 inline-block ${b.status === 'cancelled_demo' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'}`}>
                            {b.status === 'cancelled_demo' ? 'Отменено' : 'Демо подтверждено'}
                          </span>
                          {b.status !== 'cancelled_demo' && (
                            <button onClick={() => cancelBooking(b.id)} className="ml-2 mt-2 text-xs font-bold text-rose-600 hover:underline">Отменить демо-бронирование</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
    </>
  );
}

import { useState } from 'react';
import {
  ArrowUpRight, CheckCircle2, ClipboardList, DollarSign, Edit3, History, Hotel,
  Download, MessageSquare, Search, ShieldCheck, Star, Trash2, UserCheck, UserX, Users, XCircle
} from 'lucide-react';
import CountryFlightMap from './CountryFlightMap';
import { buildBookingsCsv } from '../../utils/csv';
import { BOOKING_STATUSES, getBookingStatusLabel } from '../../utils/booking';

const formatDateTime = value => {
  if (!value) return 'Не указано';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU');
};

export default function AdminWorkspace({ app }) {
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [hotelSearch, setHotelSearch] = useState('');
  const [hotelCountryFilter, setHotelCountryFilter] = useState('ALL');
  const [hotelCityFilter, setHotelCityFilter] = useState('ALL');
  const [hotelStarsFilter, setHotelStarsFilter] = useState('ALL');
  const [hotelMealFilter, setHotelMealFilter] = useState('ALL');
  const [hotelSort, setHotelSort] = useState('recommended');
  const [hotelStatusFilter, setHotelStatusFilter] = useState('published');
  const [userSearch, setUserSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const [directoryCountry, setDirectoryCountry] = useState(app.COUNTRIES[0] || '');
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryAliases, setNewCountryAliases] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newCityAliases, setNewCityAliases] = useState('');
  const {
    activeTab, touristUsers, bookings, formatMoney, bulkConfig, setBulkConfig, lastBulkPriceChange, undoBulkPrice,
    COUNTRIES, CITIES, destinationDirectory, addDestinationCountry, addDestinationCity,
    applyBulkPrice, hotelForm, setHotelForm, MEAL_TYPES,
    editingHotelId, handleSaveHotel, setEditingHotelId, hotels, handleEditHotel,
    setHotelArchived, pushToast, filteredLogs, logFilter, setLogFilter,
    toggleBlockUser, allReviews, adminReplyText, setAdminReplyText,
    replyToReview, deleteReview, moderateReview, cancelBooking, restoreBooking, setBookingStatus, setActiveTab
  } = app;
  const activeBookings = bookings.filter(booking => ['pending_demo', 'confirmed_demo'].includes(booking.status));
  const cancelledBookings = bookings.filter(booking => booking.status === 'cancelled_demo').length;
  const demoRequestTotal = activeBookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
  const affectedBulkHotels = hotels.filter(hotel => bulkConfig.country === 'ALL' || hotel.country === bulkConfig.country);
  const bulkPriceExample = affectedBulkHotels[0];
  const bulkPriceMultiplier = 1 + (Number(bulkConfig.percent) / 100);
  const hotelCounts = hotels.reduce((counts, hotel) => {
    counts[hotel.country] = (counts[hotel.country] || 0) + 1;
    return counts;
  }, {});
  const topCountries = Object.entries(hotelCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const matchingBookings = bookings.filter(booking => {
    const matchesStatus = bookingFilter === 'ALL'
      || (bookingFilter === 'ACTIVE' ? ['pending_demo', 'confirmed_demo'].includes(booking.status)
        : bookingFilter === 'CANCELLED' ? booking.status === 'cancelled_demo'
          : booking.status === bookingFilter);
    const query = bookingSearch.trim().toLowerCase();
    const matchesSearch = !query || [
      booking.id,
      booking.user?.name,
      booking.hotel?.name,
      booking.hotel?.city,
      booking.hotel?.country,
      ...(booking.travelers || []).map(traveler => traveler.name),
      ...(booking.shareInvites || []).map(invite => invite.phone)
    ].some(value => String(value || '').toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });
  const matchingHotels = hotels
    .filter(hotel => {
      const country = destinationDirectory.find(item => item.name === hotel.country);
      const city = country?.cities.find(item => item.name === hotel.city);
      const aliases = [...(country?.aliases || []), ...(city?.aliases || [])].join(' ');
      return `${hotel.name} ${hotel.city} ${hotel.country} ${hotel.meal} ${aliases}`.toLowerCase().includes(hotelSearch.trim().toLowerCase());
    })
    .filter(hotel => hotelStatusFilter === 'ALL'
      || (hotelStatusFilter === 'published' ? hotel.status !== 'archived' : hotel.status === 'archived'))
    .filter(hotel => hotelCountryFilter === 'ALL' || hotel.country === hotelCountryFilter)
    .filter(hotel => hotelCityFilter === 'ALL' || hotel.city === hotelCityFilter)
    .filter(hotel => hotelStarsFilter === 'ALL' || String(hotel.stars) === hotelStarsFilter)
    .filter(hotel => hotelMealFilter === 'ALL' || hotel.meal === hotelMealFilter)
    .sort((first, second) => hotelSort === 'price-asc'
      ? first.price - second.price
      : hotelSort === 'price-desc'
        ? second.price - first.price
        : 0);
  const hotelCountryOptions = Array.from(new Set([...COUNTRIES, ...hotels.map(hotel => hotel.country).filter(Boolean)]));
  const hotelCityOptions = hotelCountryFilter === 'ALL'
    ? Array.from(new Set(hotels.map(hotel => hotel.city).filter(Boolean)))
    : CITIES[hotelCountryFilter] || [];
  const selectedDirectoryCountry = destinationDirectory.find(country => country.name === directoryCountry);
  const availableCountries = Array.from(new Set([
    ...COUNTRIES,
    ...hotels.map(hotel => hotel.country).filter(Boolean)
  ]));
  const matchingUsers = touristUsers.filter(user =>
    `${user.name} ${user.phone} ${user.email || ''} ${user.status}`.toLowerCase().includes(userSearch.trim().toLowerCase())
  );
  const matchingReviews = allReviews.filter(review => {
    if (reviewFilter === 'PENDING') return review.status === 'pending_review';
    if (reviewFilter === 'REJECTED') return review.status === 'rejected';
    if (reviewFilter === 'UNANSWERED') return review.status === 'published' && !review.adminReply;
    if (reviewFilter === 'ANSWERED') return review.status === 'published' && Boolean(review.adminReply);
    return true;
  });
  const handleAddCountry = event => {
    event.preventDefault();
    const country = addDestinationCountry(newCountryName, newCountryAliases);
    if (!country) return;
    setDirectoryCountry(country);
    setHotelForm(form => ({ ...form, country, city: CITIES[country]?.[0] || '' }));
    setNewCountryName('');
    setNewCountryAliases('');
  };
  const handleAddCity = event => {
    event.preventDefault();
    const city = addDestinationCity(directoryCountry, newCityName, newCityAliases);
    if (!city) return;
    setHotelForm(form => ({ ...form, country: directoryCountry, city }));
    setNewCityName('');
    setNewCityAliases('');
  };
  const exportBookings = () => {
    if (matchingBookings.length === 0) {
      pushToast('Нет заявок для выгрузки');
      return;
    }
    const blob = new Blob([buildBookingsCsv(matchingBookings)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `astana-travel-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    pushToast(`Выгружено заявок: ${matchingBookings.length}`);
  };

  return (
    <>
          <div className="space-y-6 animate-in fade-in">
            {/* 1. DASHBOARD */}
            {activeTab === 'admin-dash' && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">Центр управления</p>
                    <h2 className="mt-1 text-3xl font-black">Панель администратора</h2>
                    <p className="mt-1 text-sm text-slate-500">Сводка по локальным демо-данным и быстрый доступ к рабочим разделам.</p>
                  </div>
                  <button onClick={() => setActiveTab('admin-bookings')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">
                    <ClipboardList className="h-4 w-4" /> Открыть заявки
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: 'Демо-заявки', value: bookings.length, note: `${activeBookings.length} требуют обработки`, icon: ClipboardList, color: 'text-indigo-500', action: 'admin-bookings' },
                    { label: 'Сумма активных демо-заявок', value: `${formatMoney(demoRequestTotal)} ₸`, note: 'Не выручка: оплаты нет', icon: DollarSign, color: 'text-emerald-500', action: 'admin-bookings' },
                    { label: 'Клиенты CRM', value: touristUsers.length, note: `${touristUsers.filter(user => user.isBanned).length} ограничено`, icon: Users, color: 'text-rose-500', action: 'admin-crm' },
                    { label: 'Отели в каталоге', value: hotels.length, note: `${allReviews.length} отзывов`, icon: Hotel, color: 'text-amber-500', action: 'admin-hotels' }
                  ].map(card => (
                    <button key={card.label} onClick={() => setActiveTab(card.action)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                      <div className="flex items-start justify-between">
                        <card.icon className={`h-6 w-6 ${card.color}`} />
                        <ArrowUpRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="mt-4 text-xs font-semibold text-slate-500">{card.label}</p>
                      <p className="mt-1 break-words text-2xl font-black">{card.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{card.note}</p>
                    </button>
                  ))}
                </div>

                <CountryFlightMap
                  hotels={hotels}
                  formatMoney={formatMoney}
                  onSelectCountry={country => {
                    setHotelSearch(country);
                    setActiveTab('admin-hotels');
                  }}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold">Последние заявки</h3>
                        <p className="text-xs text-slate-500">Статусы показывают демо-состояние, не подтверждение отеля.</p>
                      </div>
                      <button onClick={() => setActiveTab('admin-bookings')} className="text-xs font-bold text-indigo-600 hover:underline">Все заявки</button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {bookings.slice(0, 5).map(booking => (
                        <div key={booking.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{booking.hotel?.name || 'Отель не указан'}</p>
                            <p className="mt-0.5 text-xs text-slate-500">{booking.id} · {booking.user?.name || 'Клиент не указан'} · {booking.date}</p>
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:justify-end">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${booking.status === 'cancelled_demo' || booking.status === 'rejected_demo' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                              {getBookingStatusLabel(booking.status)}
                            </span>
                            <span className="text-sm font-black">{formatMoney(booking.price || 0)} ₸</span>
                          </div>
                        </div>
                      ))}
                      {bookings.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Заявок пока нет.</p>}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="font-bold">Каталог по странам</h3>
                    <p className="mt-1 text-xs text-slate-500">Количество отелей в локальном каталоге</p>
                    <div className="mt-5 space-y-4">
                      {topCountries.map(([country, count]) => (
                        <div key={country}>
                          <div className="mb-1 flex justify-between gap-3 text-xs">
                            <span className="font-semibold">{country}</span>
                            <span className="text-slate-500">{count} из {hotels.length}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${hotels.length ? (count / hotels.length) * 100 : 0}%` }} />
                          </div>
                        </div>
                      ))}
                      {topCountries.length === 0 && <p className="text-sm text-slate-500">В каталоге пока нет отелей.</p>}
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div><p className="text-xs text-slate-500">Активные заявки</p><p className="mt-1 text-xl font-black text-emerald-600">{activeBookings.length}</p></div>
                      <div><p className="text-xs text-slate-500">Отменённые</p><p className="mt-1 text-xl font-black text-slate-500">{cancelledBookings}</p></div>
                    </div>
                  </section>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-4 flex items-center gap-2 font-bold"><DollarSign className="h-5 w-5 text-emerald-500" /> Массовое управление демо-ценами</h3>
                  <div className="flex flex-col items-end gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950 sm:flex-row">
                    <div className="w-full">
                      <label htmlFor="bulk-price-country" className="text-xs font-bold text-slate-500">Страна</label>
                      <select id="bulk-price-country" value={bulkConfig.country} onChange={e=>setBulkConfig({...bulkConfig, country: e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                        <option value="ALL">Весь каталог</option>
                        {availableCountries.map(country => <option key={country} value={country}>{country}</option>)}
                      </select>
                    </div>
                    <div className="w-full">
                      <label htmlFor="bulk-price-percent" className="text-xs font-bold text-slate-500">Изменение цены (%)</label>
                      <input id="bulk-price-percent" type="number" min="-90" max="500" value={bulkConfig.percent} onChange={e=>setBulkConfig({...bulkConfig, percent: Number(e.target.value)})} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <button onClick={() => {
                      const target = bulkConfig.country === 'ALL' ? 'всему каталогу' : `стране «${bulkConfig.country}»`;
                      const example = bulkPriceExample
                        ? ` Пример: ${bulkPriceExample.name}, ${formatMoney(bulkPriceExample.price)} → ${formatMoney(Math.round(bulkPriceExample.price * bulkPriceMultiplier))} ₸.`
                        : '';
                      if (window.confirm(`Изменить цены на ${bulkConfig.percent}% для ${affectedBulkHotels.length} отелей (${target})?${example}`)) applyBulkPrice();
                    }} className="w-full whitespace-nowrap rounded-lg bg-slate-900 px-6 py-2.5 font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 sm:w-auto">Применить к демо-каталогу</button>
                    <p className="w-full text-xs text-slate-500">
                      Будут изменены {affectedBulkHotels.length} отелей.
                      {bulkPriceExample ? ` Пример: ${formatMoney(bulkPriceExample.price)} → ${formatMoney(Math.round(bulkPriceExample.price * bulkPriceMultiplier))} ₸.` : ''}
                    </p>
                    {lastBulkPriceChange && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Вернуть прежние цены для ${lastBulkPriceChange.priceChanges.length} отелей?`)) undoBulkPrice();
                        }}
                        className="w-full rounded-lg border border-amber-300 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/40 sm:w-auto"
                      >
                        Отменить последнее массовое изменение
                      </button>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* УПРАВЛЕНИЕ ЗАЯВКАМИ */}
            {activeTab === 'admin-bookings' && (
              <section className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">Операции</p>
                    <h2 className="mt-1 text-3xl font-black">Заявки и бронирования</h2>
                    <p className="mt-1 text-sm text-slate-500">Все записи локальные и демонстрационные — оплаты и связи с отелями нет.</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900"><p className="text-lg font-black">{bookings.length}</p><p className="text-[10px] text-slate-500">Всего</p></div>
                      <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900"><p className="text-lg font-black text-emerald-600">{activeBookings.length}</p><p className="text-[10px] text-slate-500">Активно</p></div>
                      <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900"><p className="text-lg font-black text-slate-500">{cancelledBookings}</p><p className="text-[10px] text-slate-500">Отменено</p></div>
                    </div>
                    <button type="button" onClick={exportBookings} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800">
                      <Download className="h-4 w-4" /> Скачать CSV
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row">
                  <label className="relative flex-1">
                    <span className="sr-only">Поиск заявки</span>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={bookingSearch} onChange={event => setBookingSearch(event.target.value)} placeholder="Номер, клиент, отель или город" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
                  </label>
                  <select aria-label="Фильтр заявок" value={bookingFilter} onChange={event => setBookingFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold dark:border-slate-700 dark:bg-slate-950">
                    <option value="ALL">Все заявки</option>
                    <option value="ACTIVE">Требуют действий</option>
                    <option value="pending_demo">Новые</option>
                    <option value="confirmed_demo">Подтверждённые · демо</option>
                    <option value="completed_demo">Завершённые · демо</option>
                    <option value="CANCELLED">Отменённые</option>
                    <option value="rejected_demo">Отклонённые · демо</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {matchingBookings.map(booking => {
                    const trip = booking.trip || {};
                    const isCancelled = booking.status === 'cancelled_demo';
                    const cancellationHistory = booking.cancellationHistory
                      || (booking.cancellation ? [booking.cancellation] : []);
                    const checkIn = trip.departureDate
                      ? new Date(`${trip.departureDate}T00:00:00`).toLocaleDateString('ru-RU')
                      : 'Даты не указаны';
                    const checkOut = trip.checkOutDate
                      ? new Date(`${trip.checkOutDate}T00:00:00`).toLocaleDateString('ru-RU')
                      : '';
                    return (
                      <article key={booking.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-center gap-4">
                            <img src={booking.hotel?.image || ''} alt="" className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 object-cover dark:bg-slate-800" />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black">{booking.id}</span>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isCancelled || booking.status === 'rejected_demo' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'}`}>
                                    {getBookingStatusLabel(booking.status)}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm font-semibold">{booking.hotel?.name || 'Отель не указан'} · {booking.hotel?.city || ''}</p>
                              <p className="mt-1 text-xs text-slate-500">{booking.user?.name || 'Клиент не указан'} · Создана {booking.date || '—'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs lg:min-w-[280px]">
                            <span className="text-slate-500">Поездка</span><span className="font-bold">{checkIn}{checkOut ? ` — ${checkOut}` : ''}</span>
                            <span className="text-slate-500">Гости / ночи</span><span className="font-bold">{trip.pax || 0} / {trip.nights || 0}</span>
                            <span className="text-slate-500">Демо-сумма</span><span className="font-black">{formatMoney(booking.price || 0)} ₸</span>
                          </div>
                          {isCancelled ? (
                            <button onClick={() => restoreBooking(booking.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40">
                              <CheckCircle2 className="h-4 w-4" /> Восстановить демо-заявку
                            </button>
                          ) : ['pending_demo', 'confirmed_demo'].includes(booking.status) ? (
                            <button onClick={() => {
                              if (window.confirm(`Отменить демо-заявку ${booking.id}?`)) {
                                cancelBooking(booking.id, { reason: 'Отменено администратором', cancelledBy: 'Администратор' });
                              }
                            }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40">
                              <XCircle className="h-4 w-4" /> Отменить демо-заявку
                            </button>
                          ) : null}
                          {!isCancelled && (
                            <label className="sr-only" htmlFor={`booking-status-${booking.id}`}>Статус заявки {booking.id}</label>
                          )}
                          {!isCancelled && (
                            <select
                              id={`booking-status-${booking.id}`}
                              value={booking.status}
                              onChange={event => setBookingStatus(booking.id, event.target.value)}
                              aria-label={`Изменить статус заявки ${booking.id}`}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                            >
                              {BOOKING_STATUSES.filter(status => status.value !== 'cancelled_demo').map(status => (
                                <option key={status.value} value={status.value}>{status.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <details open={isCancelled} className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                          <summary className="cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400">Полная информация и история заявки</summary>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {[
                              ['Клиент', booking.user?.name || 'Не указан'],
                              ['Телефон', booking.user?.phone || 'Не указан'],
                              ['Email', booking.user?.email || 'Не указан'],
                              ['Отель', booking.hotel?.name || 'Отель не указан'],
                              ['Направление', [booking.hotel?.country, booking.hotel?.city].filter(Boolean).join(', ') || 'Не указано'],
                              ['Питание', booking.hotel?.meal || 'Не указано'],
                              ['Заезд', checkIn],
                              ['Выезд', checkOut || 'Не указан'],
                              ['Гости', `${trip.adults ?? trip.pax ?? 0} взрослых · ${trip.children ?? 0} детей · ${trip.pax ?? 0} всего`],
                              ['Ночей', trip.nights ?? 'Не указано'],
                              ['Тариф', trip.class === 1.5 ? 'Бизнес' : trip.class ? 'Эконом' : 'Не указан'],
                              ['Создана', booking.date || 'Не указана'],
                              ['Статус оплаты', 'Не оплачено · демо'],
                              ['Сумма заявки', `${formatMoney(booking.price || 0)} ₸`]
                            ].map(([label, value]) => (
                              <div key={label} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                                <p className="mt-1 break-words text-xs font-semibold">{value}</p>
                              </div>
                            ))}
                          </div>
                          {(booking.travelers?.length > 0 || booking.shareInvites?.length > 0) && (
                            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                              <h4 className="text-xs font-bold">Участники поездки и приглашения</h4>
                              {booking.travelers?.length > 0 && (
                                <ul className="mt-2 space-y-1 text-xs">
                                  {booking.travelers.map(traveler => {
                                    const invite = (booking.shareInvites || []).find(item => item.travelerIds?.includes(traveler.id));
                                    return (
                                      <li key={traveler.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-950">
                                        <span>{traveler.name} · {traveler.type === 'child' ? 'ребёнок' : 'взрослый'}{traveler.phone ? ` · ${traveler.phone}` : ''}</span>
                                        <span className="font-semibold">{invite ? ({ pending: 'Ожидает принятия', accepted: 'Принято', declined: 'Отклонено', revoked: 'Доступ отозван' }[invite.status] || invite.status) : 'Без приглашения'}</span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          )}
                          <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                            <h4 className="text-xs font-bold">История статусов</h4>
                            <ol className="mt-2 space-y-2">
                              {(booking.statusHistory || []).map((entry, index) => (
                                <li key={`${booking.id}-status-${index}`} className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-950">
                                  <p className="font-bold">{getBookingStatusLabel(entry.status)}</p>
                                  <p className="mt-1 text-slate-500">{formatDateTime(entry.changedAt)} · {entry.changedBy || 'Система'}</p>
                                  {entry.note && <p className="mt-1 text-slate-600 dark:text-slate-400">{entry.note}</p>}
                                </li>
                              ))}
                            </ol>
                          </div>
                          <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
                            <h4 className="text-xs font-bold">История отмены</h4>
                            {cancellationHistory.length > 0 ? (
                              <ol className="mt-2 space-y-2">
                                {cancellationHistory.map((cancellation, index) => (
                                  <li key={`${booking.id}-cancel-${index}`} className="rounded-lg bg-rose-50 p-3 text-xs dark:bg-rose-950/20">
                                    <p className="font-bold text-rose-700 dark:text-rose-300">
                                      {formatDateTime(cancellation.cancelledAt)} · {cancellation.cancelledBy || 'Пользователь'}
                                    </p>
                                    <p className="mt-1">Причина: {cancellation.reason || 'не указана'}</p>
                                    {cancellation.note && <p className="mt-1 text-slate-600 dark:text-slate-400">Комментарий: {cancellation.note}</p>}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="mt-2 text-xs text-slate-500">Заявка не отменялась.</p>
                            )}
                          </div>
                        </details>
                      </article>
                    );
                  })}
                  {matchingBookings.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">Заявки по выбранным условиям не найдены.</p>}
                </div>
              </section>
            )}

            {/* 2. УПРАВЛЕНИЕ КАТАЛОГОМ (CRUD) */}
            {activeTab === 'admin-hotels' && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">Каталог</p>
                  <h2 className="mt-1 text-3xl font-black">Управление отелями</h2>
                  <p className="mt-1 text-sm text-slate-500">Добавляйте и обновляйте карточки локального демо-каталога.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    <h3 className="font-bold mb-4 text-xl">{editingHotelId ? 'Редактировать отель' : 'Добавить новый отель'}</h3>
                    <form onSubmit={event => { event.preventDefault(); handleSaveHotel(); }} className="space-y-3 text-sm">
                      <label htmlFor="hotel-name" className="block text-xs font-semibold text-slate-500">Название отеля</label>
                      <input id="hotel-name" type="text" maxLength="120" required placeholder="Введите название отеля" value={hotelForm.name} onChange={e=>setHotelForm({...hotelForm, name:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="hotel-price" className="block text-xs font-semibold text-slate-500">Базовая цена (₸)</label>
                          <input id="hotel-price" type="number" min="1" step="1" required placeholder="Введите цену" value={hotelForm.price} onChange={e=>setHotelForm({...hotelForm, price:e.target.value === '' ? '' : Number(e.target.value)})} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                          <label htmlFor="hotel-stars" className="block text-xs font-semibold text-slate-500">Количество звёзд</label>
                          <select id="hotel-stars" value={hotelForm.stars} onChange={e=>setHotelForm({...hotelForm, stars: Number(e.target.value)})} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                            <option value="3">3 звезды</option>
                            <option value="4">4 звезды</option>
                            <option value="5">5 звёзд</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="hotel-country" className="block text-xs font-semibold text-slate-500">Страна</label>
                          <select id="hotel-country" required value={hotelForm.country} onChange={event => {
                            const country = event.target.value;
                            setHotelForm({ ...hotelForm, country, city: CITIES[country]?.[0] || '' });
                          }} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                            <option value="">Выберите страну</option>
                            {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="hotel-city" className="block text-xs font-semibold text-slate-500">Город</label>
                          <select id="hotel-city" required value={hotelForm.city} onChange={event => setHotelForm({ ...hotelForm, city: event.target.value })} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                            <option value="">Выберите город</option>
                            {(CITIES[hotelForm.country] || []).map(city => <option key={city} value={city}>{city}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="hotel-meal" className="block text-xs font-semibold text-slate-500">Тип питания</label>
                          <select id="hotel-meal" value={hotelForm.meal} onChange={e=>setHotelForm({...hotelForm, meal: e.target.value})} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                            {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="hotel-beach" className="block text-xs font-semibold text-slate-500">Тип пляжа</label>
                          <input id="hotel-beach" type="text" placeholder="Например, песчаный" value={hotelForm.beach} onChange={e=>setHotelForm({...hotelForm, beach:e.target.value})} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="hotel-image" className="block text-xs font-semibold text-slate-500">Основное фото (URL или Base64)</label>
                        <input id="hotel-image" type="text" required placeholder="https://… или image Base64" value={hotelForm.image} onChange={e=>setHotelForm({...hotelForm, image:e.target.value})} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none" />
                        {hotelForm.image && (
                          <img src={hotelForm.image} alt="Предпросмотр основного фото отеля" className="mt-2 h-32 w-full rounded-xl object-cover" />
                        )}
                      </div>
                      <div>
                        <label htmlFor="hotel-gallery" className="block text-xs font-semibold text-slate-500">Дополнительные фото (по одному URL в строке)</label>
                        <textarea id="hotel-gallery" placeholder="Вставьте ссылки на фото, каждая с новой строки" rows="3" value={hotelForm.gallery} onChange={e=>setHotelForm({...hotelForm, gallery:e.target.value})} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none resize-y" />
                      </div>
                      <div>
                        <label htmlFor="hotel-description" className="block text-xs font-semibold text-slate-500">Описание отеля</label>
                        <textarea id="hotel-description" placeholder="Расскажите об отеле" rows="3" value={hotelForm.description} onChange={e=>setHotelForm({...hotelForm, description:e.target.value})} className="mt-1 w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none resize-none"></textarea>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl transition shadow-md">
                          {editingHotelId ? 'Сохранить изменения' : 'Создать отель'}
                        </button>
                        {editingHotelId && (
                          <button type="button" onClick={() => { setEditingHotelId(null); setHotelForm({name:'', price:0, image:'', country:'ОАЭ', city:'Дубай', meal:'Ultra All Inclusive', beach: 'Песчаный', stars: 5, description: '', gallery: ''}); }} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold p-3 rounded-xl transition hover:bg-slate-300 dark:hover:bg-slate-700">
                            Отмена
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                  <div className="w-full md:w-2/3">
                    <label className="relative mb-3 block">
                      <span className="sr-only">Поиск отеля в каталоге</span>
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input value={hotelSearch} onChange={event => setHotelSearch(event.target.value)} placeholder="Найти отель, город или страну" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
                    </label>
                    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <select aria-label="Статус публикации отеля" value={hotelStatusFilter} onChange={event => setHotelStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                        <option value="published">Опубликованные</option>
                        <option value="archived">Архив</option>
                        <option value="ALL">Все статусы</option>
                      </select>
                      <select aria-label="Фильтр по стране" value={hotelCountryFilter} onChange={event => {
                        setHotelCountryFilter(event.target.value);
                        setHotelCityFilter('ALL');
                      }} className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                        <option value="ALL">Все страны</option>
                        {hotelCountryOptions.map(country => <option key={country} value={country}>{country}</option>)}
                      </select>
                      <select aria-label="Фильтр по городу" value={hotelCityFilter} onChange={event => setHotelCityFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                        <option value="ALL">Все города</option>
                        {hotelCityOptions.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                      <select aria-label="Фильтр по звёздам" value={hotelStarsFilter} onChange={event => setHotelStarsFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                        <option value="ALL">Любая категория</option>
                        {[3, 4, 5].map(stars => <option key={stars} value={String(stars)}>{stars} звезды</option>)}
                      </select>
                      <select aria-label="Фильтр по питанию" value={hotelMealFilter} onChange={event => setHotelMealFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                        <option value="ALL">Любое питание</option>
                        {MEAL_TYPES.map(meal => <option key={meal} value={meal}>{meal}</option>)}
                      </select>
                      <select aria-label="Сортировка отелей" value={hotelSort} onChange={event => setHotelSort(event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-950">
                        <option value="recommended">Порядок каталога</option>
                        <option value="price-asc">Сначала дешевле</option>
                        <option value="price-desc">Сначала дороже</option>
                      </select>
                      <button type="button" onClick={() => {
                        setHotelSearch('');
                        setHotelCountryFilter('ALL');
                        setHotelCityFilter('ALL');
                        setHotelStarsFilter('ALL');
                        setHotelMealFilter('ALL');
                        setHotelSort('recommended');
                      }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        Сбросить фильтры
                      </button>
                    </div>
                    <p className="mb-2 text-xs text-slate-500">Показано {matchingHotels.length} из {hotels.length} отелей</p>
                    <div className="max-h-[650px] space-y-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    {matchingHotels.map(h => (
                      <div key={h.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <img src={h.image || ''} className="w-16 h-16 rounded-lg object-cover" alt={h.name} />
                          <div>
                            <p className="font-bold text-base">{h.name} {'★'.repeat(h.stars)} {h.status === 'archived' && <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">Архив</span>}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatMoney(h.price)} ₸ • {h.country}, {h.city} • {h.meal}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEditHotel(h)} aria-label={`Редактировать отель ${h.name}`} className="text-indigo-500 p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition" title="Редактировать">
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button type="button" onClick={() => {
                            const action = h.status === 'archived' ? 'вернуть в каталог' : 'переместить в архив';
                            if (window.confirm(`${action === 'вернуть в каталог' ? 'Опубликовать' : 'Архивировать'} отель «${h.name}»?`)) {
                              setHotelArchived(h.id, h.status !== 'archived');
                            }
                          }} aria-label={`${h.status === 'archived' ? 'Опубликовать' : 'Архивировать'} отель ${h.name}`} className={`${h.status === 'archived' ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30' : 'text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30'} p-2 rounded-lg transition`} title={h.status === 'archived' ? 'Опубликовать' : 'Архивировать'}>
                            {h.status === 'archived' ? <CheckCircle2 className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {matchingHotels.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Отели не найдены.</p>}
                    </div>
                  </div>
                </div>
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                  <div className="mb-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">Справочник</p>
                    <h3 className="mt-1 text-xl font-black">Страны, города и варианты написания</h3>
                    <p className="mt-1 text-sm text-slate-500">Отели выбираются по единому названию. Синонимы вроде «Дубаи» и «Dubai» привязываются к городу «Дубай», не создавая дублей.</p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <form onSubmit={handleAddCountry} className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                      <h4 className="font-bold">Добавить страну или вариант написания</h4>
                      <label htmlFor="directory-country-name" className="block text-xs font-semibold text-slate-500">Название страны</label>
                      <input id="directory-country-name" required maxLength="80" value={newCountryName} onChange={event => setNewCountryName(event.target.value)} placeholder="Например, ОАЭ" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                      <label htmlFor="directory-country-aliases" className="block text-xs font-semibold text-slate-500">Синонимы через запятую (необязательно)</label>
                      <input id="directory-country-aliases" maxLength="240" value={newCountryAliases} onChange={event => setNewCountryAliases(event.target.value)} placeholder="UAE, Объединённые Арабские Эмираты" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                      <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">Добавить страну / синоним</button>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {COUNTRIES.map(country => (
                          <span key={country} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">{country}</span>
                        ))}
                      </div>
                    </form>

                    <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                      <h4 className="font-bold">Города выбранной страны</h4>
                      <label htmlFor="directory-city-country" className="block text-xs font-semibold text-slate-500">Страна</label>
                      <select id="directory-city-country" value={directoryCountry} onChange={event => setDirectoryCountry(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
                        {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                      </select>
                      {selectedDirectoryCountry?.aliases?.length > 0 && (
                        <p className="text-xs text-slate-500">Варианты названия: {selectedDirectoryCountry.aliases.join(', ')}</p>
                      )}
                      <form onSubmit={handleAddCity} className="space-y-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                        <label htmlFor="directory-city-name" className="block text-xs font-semibold text-slate-500">Город или его новое написание</label>
                        <input id="directory-city-name" required maxLength="80" value={newCityName} onChange={event => setNewCityName(event.target.value)} placeholder="Например, Дубай или Дубаи" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                        <label htmlFor="directory-city-aliases" className="block text-xs font-semibold text-slate-500">Дополнительные синонимы через запятую</label>
                        <input id="directory-city-aliases" maxLength="240" value={newCityAliases} onChange={event => setNewCityAliases(event.target.value)} placeholder="Dubai, Dubayy" className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900" />
                        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700">Добавить город / синоним</button>
                      </form>
                      <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                        {(selectedDirectoryCountry?.cities || []).map(city => (
                          <span key={city.name} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                            {city.name}{city.aliases.length ? ` · ${city.aliases.join(', ')}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* 3. CRM И ЛОГИ */}
            {activeTab === 'admin-crm' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-indigo-500"/> CRM и пользователи</h3>
                    <span className="text-xs text-slate-500">{touristUsers.length} клиентов · {touristUsers.filter(user => user.isBanned).length} ограничено</span>
                  </div>
                  <label className="relative mb-4 block">
                    <span className="sr-only">Поиск пользователя</span>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={userSearch} onChange={event => setUserSearch(event.target.value)} placeholder="Имя, телефон или статус" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
                  </label>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {matchingUsers.map(u => {
                      const userBookings = bookings.filter(b => b.user?.id === u.id);
                      const activeUserBookings = userBookings.filter(booking => ['pending_demo', 'confirmed_demo'].includes(booking.status));
                      const activeDemoValue = activeUserBookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
                      return (
                      <div key={u.id} className={`p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 ${u.isBanned ? 'border-rose-500 dark:border-rose-500/50' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm flex items-center gap-2">{u.name} {u.isBanned && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">Banned</span>}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{u.phone}{u.email ? ` • ${u.email}` : ''} • Аккаунт: {u.isBanned ? 'ограничен' : 'активен'}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-emerald-600">{formatMoney(activeDemoValue)} ₸</p>
                            <p className="text-[10px] text-slate-500">Сумма активных демо-заявок · {activeUserBookings.length} шт.</p>
                          </div>
                        </div>
                        {userBookings.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                            {userBookings.map(b => (
                              <p key={b.id} className="text-xs text-slate-600 dark:text-slate-400 truncate">• {b.hotel?.name || b.hotelName || 'Отель'} ({b.date})</p>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          <button type="button" onClick={() => toggleBlockUser(u.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${u.isBanned ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {u.isBanned ? <CheckCircle2 className="w-3 h-3"/> : <UserX className="w-3 h-3"/>}
                            {u.isBanned ? 'Разблокировать' : 'Заблокировать'}
                          </button>
                        </div>
                      </div>
                    )})}
                    {matchingUsers.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Пользователи не найдены.</p>}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><History className="w-5 h-5 text-purple-500"/> Журнал аудита</h3>
                    <select value={logFilter} onChange={e=>setLogFilter(e.target.value)} className="bg-slate-100 dark:bg-slate-800 border-0 rounded-lg text-xs p-2 font-bold outline-none">
                      <option value="ALL">Все события</option>
                      <option value="ПОКУПКА">Покупки</option>
                      <option value="МОДЕРАЦИЯ">Модерация</option>
                      <option value="СИСТЕМА">Система</option>
                    </select>
                  </div>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {filteredLogs.map(l => (
                      <div key={l.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 flex gap-3">
                        <div className={`w-2 h-full rounded-full flex-shrink-0 ${l.type === 'ПОКУПКА' ? 'bg-emerald-500' : l.type === 'МОДЕРАЦИЯ' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                        <div className="w-full">
                          <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                            <span>{l.action}</span><span className="text-slate-400 font-normal">{l.time}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-tight">{l.details}</p>
                        </div>
                      </div>
                    ))}
                    {filteredLogs.length === 0 && <p className="text-sm text-slate-500">Нет записей по этому фильтру.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* 4. МОДЕРАЦИЯ ОТЗЫВОВ */}
            {activeTab === 'admin-mod' && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-rose-500"/> Модерация отзывов</h3>
                    <p className="mt-1 text-xs text-slate-500">{allReviews.length} отзывов · {allReviews.filter(review => review.status === 'pending_review').length} на проверке · {allReviews.filter(review => review.status === 'published' && !review.adminReply).length} без ответа</p>
                  </div>
                  <select aria-label="Фильтр отзывов" value={reviewFilter} onChange={event => setReviewFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950">
                    <option value="ALL">Все отзывы</option>
                    <option value="PENDING">Ожидают проверки</option>
                    <option value="UNANSWERED">Без ответа</option>
                    <option value="ANSWERED">С ответом</option>
                    <option value="REJECTED">Отклонённые</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                  {matchingReviews.map(r => (
                    <div key={r.id} className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase">{r.hotelName}</span>
                            <p className="font-bold text-sm mt-1">{r.author} <span className="text-slate-400 font-normal">({r.date})</span></p>
                            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${r.status === 'pending_review' ? 'bg-amber-100 text-amber-800' : r.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              {r.status === 'pending_review' ? 'Ожидает проверки' : r.status === 'rejected' ? 'Отклонён' : 'Опубликован'}
                            </span>
                          </div>
                          <span className="flex items-center text-xs font-bold text-amber-500"><Star className="w-3 h-3 fill-amber-500 mr-1"/>{r.rating}</span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 italic">«{r.text}»</p>
                        {r.adminReply && (
                          <div className="mt-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="font-bold text-indigo-600 flex items-center gap-1 mb-1"><ShieldCheck className="w-3 h-3"/> Официальный ответ</span>
                            <p>{r.adminReply}</p>
                          </div>
                        )}
                      </div>

                      {r.verifiedStay && <p className="text-xs font-bold text-emerald-700">Есть завершённая демо-заявка этого пользователя</p>}
                      {r.status === 'pending_review' && (
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => moderateReview(r.hotelId, r.id, 'published')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Опубликовать</button>
                          <button type="button" onClick={() => moderateReview(r.hotelId, r.id, 'rejected')} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white">Отклонить</button>
                        </div>
                      )}
                      {r.status === 'published' && !r.adminReply && (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Официальный ответ..." value={adminReplyText[r.id] || ''} onChange={e=>setAdminReplyText({...adminReplyText, [r.id]: e.target.value})} className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none"/>
                          <button onClick={() => replyToReview(r.hotelId, r.id)} className="bg-indigo-600 text-white px-3 rounded-lg text-xs font-bold whitespace-nowrap">Ответить</button>
                        </div>
                      )}
                      <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={() => {
                          if (window.confirm(`Удалить отзыв пользователя ${r.author}?`)) deleteReview(r.hotelId, r.id);
                        }} className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline"><Trash2 className="w-3 h-3"/> Удалить отзыв</button>
                      </div>
                    </div>
                  ))}
                  {matchingReviews.length === 0 && <p className="col-span-full py-10 text-center text-sm text-slate-500">Отзывы по выбранному фильтру не найдены.</p>}
                </div>
              </div>
            )}
          </div>
    </>
  );
}

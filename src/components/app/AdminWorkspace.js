import { useState } from 'react';
import {
  ArrowUpRight, CheckCircle2, ClipboardList, DollarSign, Edit3, History, Hotel,
  MessageSquare, Search, ShieldCheck, Star, Trash2, UserCheck, UserX, Users, XCircle
} from 'lucide-react';
import CountryFlightMap from './CountryFlightMap';

export default function AdminWorkspace({ app }) {
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('ALL');
  const [hotelSearch, setHotelSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState('ALL');
  const {
    activeTab, users, bookings, formatMoney, bulkConfig, setBulkConfig,
    COUNTRIES, applyBulkPrice, hotelForm, setHotelForm, CITIES, MEAL_TYPES,
    editingHotelId, handleSaveHotel, setEditingHotelId, hotels, handleEditHotel,
    syncHotels, pushToast, logAction, filteredLogs, logFilter, setLogFilter,
    toggleBlockUser, allReviews, adminReplyText, setAdminReplyText,
    replyToReview, deleteReview, cancelBooking, setActiveTab
  } = app;
  const activeBookings = bookings.filter(booking => booking.status !== 'cancelled_demo');
  const cancelledBookings = bookings.length - activeBookings.length;
  const demoRequestTotal = activeBookings.reduce((sum, booking) => sum + (Number(booking.price) || 0), 0);
  const hotelCounts = hotels.reduce((counts, hotel) => {
    counts[hotel.country] = (counts[hotel.country] || 0) + 1;
    return counts;
  }, {});
  const topCountries = Object.entries(hotelCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const matchingBookings = bookings.filter(booking => {
    const matchesStatus = bookingFilter === 'ALL'
      || (bookingFilter === 'ACTIVE' ? booking.status !== 'cancelled_demo' : booking.status === 'cancelled_demo');
    const query = bookingSearch.trim().toLowerCase();
    const matchesSearch = !query || [
      booking.id,
      booking.user?.name,
      booking.hotel?.name,
      booking.hotel?.city,
      booking.hotel?.country
    ].some(value => String(value || '').toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });
  const matchingHotels = hotels.filter(hotel =>
    `${hotel.name} ${hotel.city} ${hotel.country}`.toLowerCase().includes(hotelSearch.trim().toLowerCase())
  );
  const matchingUsers = users.filter(user =>
    `${user.name} ${user.phone} ${user.status}`.toLowerCase().includes(userSearch.trim().toLowerCase())
  );
  const matchingReviews = allReviews.filter(review =>
    reviewFilter === 'ALL' || (reviewFilter === 'UNANSWERED' ? !review.adminReply : Boolean(review.adminReply))
  );

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
                    { label: 'Демо-заявки', value: bookings.length, note: `${activeBookings.length} активных`, icon: ClipboardList, color: 'text-indigo-500', action: 'admin-bookings' },
                    { label: 'Сумма демо-заявок', value: `${formatMoney(demoRequestTotal)} ₸`, note: 'Не выручка, оплаты нет', icon: DollarSign, color: 'text-emerald-500', action: 'admin-bookings' },
                    { label: 'Клиенты CRM', value: users.length, note: `${users.filter(user => user.isBanned).length} ограничено`, icon: Users, color: 'text-rose-500', action: 'admin-crm' },
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
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${booking.status === 'cancelled_demo' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                              {booking.status === 'cancelled_demo' ? 'Отменена · демо' : 'Активна · демо'}
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
                        {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
                      </select>
                    </div>
                    <div className="w-full">
                      <label htmlFor="bulk-price-percent" className="text-xs font-bold text-slate-500">Изменение цены (%)</label>
                      <input id="bulk-price-percent" type="number" min="-90" max="500" value={bulkConfig.percent} onChange={e=>setBulkConfig({...bulkConfig, percent: Number(e.target.value)})} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-800" />
                    </div>
                    <button onClick={applyBulkPrice} className="w-full whitespace-nowrap rounded-lg bg-slate-900 px-6 py-2.5 font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 sm:w-auto">Применить к демо-каталогу</button>
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
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900"><p className="text-lg font-black">{bookings.length}</p><p className="text-[10px] text-slate-500">Всего</p></div>
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900"><p className="text-lg font-black text-emerald-600">{activeBookings.length}</p><p className="text-[10px] text-slate-500">Активно</p></div>
                    <div className="rounded-xl bg-white px-3 py-2 shadow-sm dark:bg-slate-900"><p className="text-lg font-black text-slate-500">{cancelledBookings}</p><p className="text-[10px] text-slate-500">Отменено</p></div>
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
                    <option value="ACTIVE">Активные</option>
                    <option value="CANCELLED">Отменённые</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {matchingBookings.map(booking => {
                    const trip = booking.trip || {};
                    const isCancelled = booking.status === 'cancelled_demo';
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
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${isCancelled ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                                  {isCancelled ? 'Отменена · демо' : 'Активна · демо'}
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
                          {!isCancelled && (
                            <button onClick={() => cancelBooking(booking.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40">
                              <XCircle className="h-4 w-4" /> Отменить демо-заявку
                            </button>
                          )}
                        </div>
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
                    <div className="space-y-3 text-sm">
                      <input type="text" placeholder="Название отеля" value={hotelForm.name} onChange={e=>setHotelForm({...hotelForm, name:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500 font-bold" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="number" placeholder="Базовая цена (₸)" value={hotelForm.price} onChange={e=>setHotelForm({...hotelForm, price:Number(e.target.value)})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-indigo-500" />
                        <select value={hotelForm.stars} onChange={e=>setHotelForm({...hotelForm, stars: Number(e.target.value)})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          <option value="3">3 Звезды</option>
                          <option value="4">4 Звезды</option>
                          <option value="5">5 Звезд</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={hotelForm.country} onChange={e=>setHotelForm({...hotelForm, country: e.target.value, city: CITIES[e.target.value][0]})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={hotelForm.city} onChange={e=>setHotelForm({...hotelForm, city: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          {CITIES[hotelForm.country].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select value={hotelForm.meal} onChange={e=>setHotelForm({...hotelForm, meal: e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none">
                          {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input type="text" placeholder="Тип пляжа" value={hotelForm.beach} onChange={e=>setHotelForm({...hotelForm, beach:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none" />
                      </div>
                      <input type="text" placeholder="URL Картинки (или Base64)" value={hotelForm.image} onChange={e=>setHotelForm({...hotelForm, image:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none" />
                      <textarea placeholder="Дополнительные фото: по одному URL в строке" rows="3" value={hotelForm.gallery} onChange={e=>setHotelForm({...hotelForm, gallery:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none resize-y" />
                      <textarea placeholder="Полное описание отеля..." rows="3" value={hotelForm.description} onChange={e=>setHotelForm({...hotelForm, description:e.target.value})} className="w-full p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none resize-none"></textarea>

                      <div className="flex gap-2 pt-2">
                        <button onClick={handleSaveHotel} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-xl transition shadow-md">
                          {editingHotelId ? 'Сохранить изменения' : 'Создать отель'}
                        </button>
                        {editingHotelId && (
                          <button onClick={() => { setEditingHotelId(null); setHotelForm({name:'', price:0, image:'', country:'ОАЭ', city:'Дубай', meal:'Ultra All Inclusive', beach: 'Песчаный', stars: 5, description: '', gallery: ''}); }} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold p-3 rounded-xl transition hover:bg-slate-300 dark:hover:bg-slate-700">
                            Отмена
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="w-full md:w-2/3">
                    <label className="relative mb-3 block">
                      <span className="sr-only">Поиск отеля в каталоге</span>
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input value={hotelSearch} onChange={event => setHotelSearch(event.target.value)} placeholder="Найти отель, город или страну" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
                    </label>
                    <div className="max-h-[650px] space-y-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                    {matchingHotels.map(h => (
                      <div key={h.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <img src={h.image} className="w-16 h-16 rounded-lg object-cover" alt="img" />
                          <div>
                            <p className="font-bold text-base">{h.name} {'★'.repeat(h.stars)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatMoney(h.price)} ₸ • {h.country}, {h.city} • {h.meal}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditHotel(h)} className="text-indigo-500 p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition" title="Редактировать">
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button onClick={() => {syncHotels(hotels.filter(x=>x.id!==h.id)); pushToast('Отель удален'); logAction('Удаление', `Удален отель ${h.name}`, 'СИСТЕМА');}} className="text-rose-500 p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 rounded-lg transition" title="Удалить">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {matchingHotels.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Отели не найдены.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CRM И ЛОГИ */}
            {activeTab === 'admin-crm' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="font-bold text-lg flex items-center gap-2"><UserCheck className="w-5 h-5 text-indigo-500"/> CRM и пользователи</h3>
                    <span className="text-xs text-slate-500">{users.length} профилей · {users.filter(user => user.isBanned).length} ограничено</span>
                  </div>
                  <label className="relative mb-4 block">
                    <span className="sr-only">Поиск пользователя</span>
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={userSearch} onChange={event => setUserSearch(event.target.value)} placeholder="Имя, телефон или статус" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" />
                  </label>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {matchingUsers.map(u => {
                      const userBookings = bookings.filter(b => b.user?.id === u.id);
                      return (
                      <div key={u.id} className={`p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 ${u.isBanned ? 'border-rose-500 dark:border-rose-500/50' : 'border-slate-200 dark:border-slate-800'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-sm flex items-center gap-2">{u.name} {u.isBanned && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded font-black uppercase">Banned</span>}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{u.phone} • Статус: {u.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-emerald-600">{formatMoney(u.ltv)} ₸</p>
                            <p className="text-[10px] text-slate-500">Покупок: {userBookings.length}</p>
                          </div>
                        </div>
                        {userBookings.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                            {userBookings.map(b => (
                              <p key={b.id} className="text-xs text-slate-600 dark:text-slate-400 truncate">• {b.hotelName} ({b.date})</p>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          <button onClick={() => toggleBlockUser(u.id)} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 ${u.isBanned ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
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
                    <p className="mt-1 text-xs text-slate-500">{allReviews.length} отзывов · {allReviews.filter(review => !review.adminReply).length} без ответа</p>
                  </div>
                  <select aria-label="Фильтр отзывов" value={reviewFilter} onChange={event => setReviewFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-bold dark:border-slate-700 dark:bg-slate-950">
                    <option value="ALL">Все отзывы</option>
                    <option value="UNANSWERED">Без ответа</option>
                    <option value="ANSWERED">С ответом</option>
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

                      {!r.adminReply && (
                        <div className="flex gap-2">
                          <input type="text" placeholder="Официальный ответ..." value={adminReplyText[r.id] || ''} onChange={e=>setAdminReplyText({...adminReplyText, [r.id]: e.target.value})} className="w-full text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 outline-none"/>
                          <button onClick={() => replyToReview(r.hotelId, r.id)} className="bg-indigo-600 text-white px-3 rounded-lg text-xs font-bold whitespace-nowrap">Ответить</button>
                        </div>
                      )}
                      <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button onClick={() => deleteReview(r.hotelId, r.id)} className="text-xs text-rose-500 font-bold flex items-center gap-1 hover:underline"><Trash2 className="w-3 h-3"/> Удалить отзыв</button>
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

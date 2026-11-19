import { useEffect, useState } from 'react';
import {
  AlertTriangle, Download, Edit3, LogIn, LogOut, MessageSquare,
  PlusCircle, ShoppingBag, Star, UserCheck, UserPlus
} from 'lucide-react';

const CANCELLATION_REASONS = [
  { value: 'changed_plans', label: 'Изменились планы' },
  { value: 'wrong_dates', label: 'Ошибка в датах или данных' },
  { value: 'found_another', label: 'Нашёл другой вариант' },
  { value: 'price', label: 'Не подходит цена' },
  { value: 'other', label: 'Другая причина' }
];

const formatDateTime = value => {
  if (!value) return 'Дата не указана';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('ru-RU');
};

export default function AccountWorkspace({ app }) {
  const {
    currentUser, touristUsers, switchAccount, loginWithPhone,
    registerAccount, updateCurrentProfile, bookings, hotels,
    formatMoney, cancelBooking, openHotel, setActiveTab
  } = app;

  const [authTab, setAuthTab] = useState('login');
  const [loginPhone, setLoginPhone] = useState('');
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '' });
  const [cancellationBookingId, setCancellationBookingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState(CANCELLATION_REASONS[0].value);
  const [cancellationNote, setCancellationNote] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || ''
      });
      setIsEditingProfile(false);
      setShowCreateForm(false);
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.phone, currentUser?.email]);

  const currentUserBookings = currentUser
    ? bookings.filter(booking => booking.user?.id === currentUser.id)
    : [];

  const currentUserReviews = currentUser
    ? hotels.flatMap(hotel =>
        (hotel.reviews || [])
          .filter(review => review.userId === currentUser.id)
          .map(review => ({ ...review, hotel }))
      )
    : [];

  const handleLoginSubmit = event => {
    event.preventDefault();
    if (loginWithPhone(loginPhone)) {
      setLoginPhone('');
    }
  };

  const handleRegisterSubmit = event => {
    event.preventDefault();
    if (registerAccount(regForm)) {
      setRegForm({ name: '', phone: '', email: '' });
      setShowCreateForm(false);
    }
  };

  const handleProfileSave = event => {
    event.preventDefault();
    if (updateCurrentProfile(editForm)) {
      setIsEditingProfile(false);
    }
  };

  const downloadBookings = () => {
    const date = new Date().toISOString().slice(0, 10);
    app.downloadBookings?.(currentUserBookings, `astana-travel-bookings-${date}.csv`);
  };

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-500">Личный кабинет</p>
              <h2 className="text-2xl font-black mt-1">Вход или регистрация</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Войдите в свой профиль, чтобы оставлять отзывы и сохранять демо-бронирования.
              </p>
            </div>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start">
              <button
                type="button"
                onClick={() => setAuthTab('login')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${authTab === 'login' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => setAuthTab('register')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition ${authTab === 'register' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Регистрация
              </button>
            </div>
          </div>

          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Номер телефона
                <input
                  type="tel"
                  required
                  value={loginPhone}
                  onChange={event => setLoginPhone(event.target.value)}
                  placeholder="+7 777 123 45 67"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm outline-none focus:border-indigo-500"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white transition"
              >
                <LogIn className="w-4 h-4" />
                Войти по номеру
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Имя и фамилия
                  <input
                    type="text"
                    required
                    minLength={2}
                    value={regForm.name}
                    onChange={event => setRegForm({ ...regForm, name: event.target.value })}
                    placeholder="Например: Айдана Нурланова"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm outline-none focus:border-indigo-500"
                  />
                </label>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  Номер телефона
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={event => setRegForm({ ...regForm, phone: event.target.value })}
                    placeholder="+7 707 111 22 33"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm outline-none focus:border-indigo-500"
                  />
                </label>
              </div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Email (необязательно)
                <input
                  type="email"
                  value={regForm.email}
                  onChange={event => setRegForm({ ...regForm, email: event.target.value })}
                  placeholder="name@example.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-sm outline-none focus:border-indigo-500"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-sm font-bold text-white transition"
              >
                <UserPlus className="w-4 h-4" />
                Создать аккаунт и войти
              </button>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-500" />
                Быстрый вход в демо-аккаунты
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Выберите готовый профиль туриста в один клик.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{touristUsers.length} профилей</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {touristUsers.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => switchAccount(user.id)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-left hover:border-indigo-400 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-black">
                    {user.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate flex items-center gap-1.5">
                      {user.name}
                      {user.isBanned && (
                        <span className="rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">Бан</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user.phone}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white">Войти</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      {currentUser.isBanned && (
        <div className="bg-rose-500 text-white p-4 rounded-2xl font-bold flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          Ваш аккаунт ограничен модератором. Вы не можете оставлять отзывы.
        </div>
      )}

      {/* КАРТОЧКА ПРОФИЛЯ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {currentUser.name[0]}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-black text-amber-700 dark:text-amber-300">
                  {currentUser.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser.phone}
                {currentUser.email ? ` • ${currentUser.email}` : ''}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Сумма демо-покупок (LTV): <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(currentUser.ltv || 0)} ₸</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingProfile(prev => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingProfile ? 'Закрыть' : 'Редактировать'}
            </button>
            <button
              type="button"
              onClick={() => switchAccount('')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Выйти
            </button>
          </div>
        </div>

        {isEditingProfile && (
          <form onSubmit={handleProfileSave} className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-bold text-slate-500">
              Имя
              <input
                type="text"
                required
                minLength={2}
                value={editForm.name}
                onChange={event => setEditForm({ ...editForm, name: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-sm text-slate-900 dark:text-white"
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              Телефон
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={event => setEditForm({ ...editForm, phone: event.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-sm text-slate-900 dark:text-white"
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              Email
              <input
                type="email"
                value={editForm.email}
                onChange={event => setEditForm({ ...editForm, email: event.target.value })}
                placeholder="name@example.com"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-sm text-slate-900 dark:text-white"
              />
            </label>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white transition"
              >
                Сохранить изменения
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ПЕРЕКЛЮЧЕНИЕ И СОЗДАНИЕ АККАУНТОВ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base">Аккаунты туристов</h3>
            <p className="text-xs text-slate-500 mt-0.5">Переключайтесь между профилями или создайте новый аккаунт.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateForm(prev => !prev)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
          >
            <PlusCircle className="w-4 h-4" />
            {showCreateForm ? 'Скрыть форму' : 'Новый аккаунт'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {touristUsers.map(user => {
            const isActive = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => !isActive && switchAccount(user.id)}
                className={`flex items-center gap-2.5 rounded-2xl border px-3.5 py-2 text-left transition ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:border-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-indigo-300'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                  {user.name[0]}
                </span>
                <span>
                  <span className="block text-xs font-bold leading-tight">
                    {user.name}
                    {user.isBanned && <span className="ml-1.5 text-[10px] text-rose-500">(Бан)</span>}
                  </span>
                  <span className="block text-[10px] text-slate-500">{user.status}</span>
                </span>
              </button>
            );
          })}
        </div>

        {showCreateForm && (
          <form onSubmit={handleRegisterSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-bold text-slate-500">
              Имя и фамилия
              <input
                type="text"
                required
                minLength={2}
                value={regForm.name}
                onChange={event => setRegForm({ ...regForm, name: event.target.value })}
                placeholder="Имя туриста"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-sm text-slate-900 dark:text-white"
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              Телефон
              <input
                type="tel"
                required
                value={regForm.phone}
                onChange={event => setRegForm({ ...regForm, phone: event.target.value })}
                placeholder="+7 707 111 22 33"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-sm text-slate-900 dark:text-white"
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              Email (необязательно)
              <input
                type="email"
                value={regForm.email}
                onChange={event => setRegForm({ ...regForm, email: event.target.value })}
                placeholder="name@example.com"
                className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-sm text-slate-900 dark:text-white"
              />
            </label>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition"
              >
                <UserPlus className="w-4 h-4" />
                Создать и переключиться
              </button>
            </div>
          </form>
        )}
      </div>

      {/* МОИ ДЕМО-БРОНИРОВАНИЯ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <h3 className="text-xl font-bold">Мои демо-бронирования ({currentUserBookings.length})</h3>
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
          <p className="text-slate-500 font-medium">У этого аккаунта пока нет демо-заявок</p>
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white transition"
          >
            Выбрать отель
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {currentUserBookings.map(b => {
            const lastCancellation = b.cancellationHistory?.[b.cancellationHistory.length - 1] || b.cancellation;
            const selectedReason = CANCELLATION_REASONS.find(reason => reason.value === cancellationReason);
            return (
              <article key={b.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <img src={b.hotel?.image || ''} className="w-20 h-20 rounded-xl object-cover" alt={b.hotel?.name || 'Отель'} />
                    <div className="min-w-0">
                      <h4 className="font-bold text-lg leading-tight">{b.hotel?.name || 'Отель удалён из каталога'}</h4>
                      <p className="text-xs text-slate-500 mt-1">Заявка {b.id} · Создана {b.date || '—'}</p>
                      <p className="text-xs text-slate-500 mt-1">{b.hotel?.country || 'Страна не указана'}, {b.hotel?.city || 'город не указан'} · {b.trip?.pax || 2} гостей · {b.trip?.nights || 7} ночей</p>
                      <p className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">Демо-бронирование — оплата не производилась</p>
                    </div>
                  </div>
                  <div className="w-full text-right sm:w-auto">
                    <p className="font-black text-xl text-indigo-600 dark:text-indigo-400">{formatMoney(b.price)} ₸</p>
                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold mt-1 inline-block ${b.status === 'cancelled_demo' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'}`}>
                      {b.status === 'cancelled_demo' ? 'Отменено' : 'Демо подтверждено'}
                    </span>
                    {b.status !== 'cancelled_demo' && cancellationBookingId !== b.id && (
                      <button type="button" onClick={() => {
                        setCancellationBookingId(b.id);
                        setCancellationReason(CANCELLATION_REASONS[0].value);
                        setCancellationNote('');
                      }} className="ml-2 mt-2 text-xs font-bold text-rose-600 hover:underline">
                        Отменить демо-бронирование
                      </button>
                    )}
                  </div>
                </div>

                {b.status === 'cancelled_demo' && (
                  <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm dark:border-rose-900/50 dark:bg-rose-950/20">
                    <p className="font-bold text-rose-700 dark:text-rose-300">
                      Отменено {formatDateTime(lastCancellation?.cancelledAt)}
                      {lastCancellation?.cancelledBy ? ` · ${lastCancellation.cancelledBy}` : ''}
                    </p>
                    <p className="mt-1 text-slate-700 dark:text-slate-300">Причина: {lastCancellation?.reason || 'не указана'}</p>
                    {lastCancellation?.note && <p className="mt-1 text-slate-600 dark:text-slate-400">Комментарий: {lastCancellation.note}</p>}
                  </div>
                )}

                {cancellationBookingId === b.id && b.status !== 'cancelled_demo' && (
                  <form onSubmit={event => {
                    event.preventDefault();
                    cancelBooking(b.id, {
                      cancelledBy: currentUser.name,
                      reason: selectedReason?.label || 'Причина не указана',
                      note: cancellationNote
                    });
                    setCancellationBookingId(null);
                    setCancellationNote('');
                  }} className="mt-4 space-y-3 rounded-xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
                    <h5 className="font-bold text-rose-800 dark:text-rose-200">Почему отменяете заявку?</h5>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor={`cancel-reason-${b.id}`}>Причина отмены</label>
                    <select id={`cancel-reason-${b.id}`} required value={cancellationReason} onChange={event => setCancellationReason(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">
                      {CANCELLATION_REASONS.map(reason => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
                    </select>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300" htmlFor={`cancel-note-${b.id}`}>Комментарий {cancellationReason === 'other' ? '(обязательно)' : '(необязательно)'}</label>
                    <textarea id={`cancel-note-${b.id}`} value={cancellationNote} onChange={event => setCancellationNote(event.target.value)} maxLength="500" required={cancellationReason === 'other'} rows="2" placeholder="Добавьте подробность, если нужно" className="w-full resize-y rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" />
                    <div className="flex flex-wrap justify-end gap-2">
                      <button type="button" onClick={() => setCancellationBookingId(null)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold dark:border-slate-700">Оставить заявку</button>
                      <button type="submit" className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">Подтвердить отмену</button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* МОИ ОТЗЫВЫ */}
      <div className="pt-2 space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          Мои отзывы ({currentUserReviews.length})
        </h3>
        {currentUserReviews.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500">
            Вы ещё не оставляли отзывов с этого аккаунта.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentUserReviews.map(review => (
              <div key={review.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openHotel(review.hotel)}
                    className="font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:underline text-left"
                  >
                    {review.hotel.name}
                  </button>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {review.rating}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{review.date}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{review.text}</p>
                {review.adminReply && (
                  <p className="text-xs bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 text-slate-600 dark:text-slate-300 border-l-2 border-indigo-500">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Ответ администрации:</span> {review.adminReply}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

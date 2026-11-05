import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { RATE, FLIGHT_CLASSES } from '../data/countries';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

// Небольшой словарь для переключателя языка (ru / kz)
const KZ = {
  Главная: 'Басты бет',
  Избранное: 'Таңдаулылар',
  'Мои туры': 'Менің турларым',
  Настройки: 'Баптаулар',
  'Популярные направления из Астаны': 'Астанадан танымал бағыттар',
  'Откройте мир с вылетом из столицы': 'Әлемді астанадан ұшып ашыңыз',
  'Поиск по стране, городу или отелю...': 'Ел, қала немесе қонақүй бойынша іздеу...',
  Забронировать: 'Брондау',
  'Выбрать тур и номера': 'Тур мен бөлмені таңдау',
  'Настройка перелета и дат': 'Ұшу және күндерді баптау',
  'Валюта отображения': 'Көрсету валютасы',
  'Язык интерфейса': 'Интерфейс тілі',
  'Настройки приложения': 'Қолданба баптаулары',
  Уведомления: 'Хабарландырулар',
  'Тема оформления': 'Безендіру тақырыбы',
};

const read = (k, d) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const DEFAULT_SETTINGS = { theme: 'light', currency: 'KZT', language: 'ru', notifications: true };

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('home');
  const [countryId, setCountryId] = useState(null);
  const [hotelId, setHotelId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealFilter, setMealFilter] = useState('all');
  const [starFilter, setStarFilter] = useState(0);
  const [sort, setSort] = useState('default');
  const [trip, setTrip] = useState({ departureDate: '', nights: 7, adults: 2, children: 0, flightClass: 'economy' });
  const [minDate, setMinDate] = useState('');
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);

  useEffect(() => {
    setFavorites(read('at_fav', []));
    setBookings(read('at_bk', []));
    const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSettings({ ...DEFAULT_SETTINGS, theme: dark ? 'dark' : 'light', ...read('at_set', {}) });
    setTrip((t) => ({ ...t, departureDate: addDays(30) }));
    setMinDate(addDays(3));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    document.documentElement.lang = settings.language === 'kz' ? 'kk' : 'ru';
  }, [settings.theme, settings.language]);

  const t = (s) => (settings.language === 'kz' && KZ[s]) || s;

  const notify = (msg) => {
    if (!settings.notifications) return;
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const go = (tab, cId = null, hId = null) => {
    setActiveTab(tab); setCountryId(cId); setHotelId(hId);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const toggleFavorite = (id) => {
    const adding = !favorites.includes(id);
    const next = adding ? [...favorites, id] : favorites.filter((x) => x !== id);
    setFavorites(next); write('at_fav', next);
    notify(adding ? 'Добавлено в избранное' : 'Удалено из избранного');
  };

  const updateSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next); write('at_set', next);
  };

  const updateTrip = (patch) => setTrip((x) => ({ ...x, ...patch }));

  const addBooking = (b) => {
    const next = [b, ...bookings];
    setBookings(next); write('at_bk', next);
    notify('Тур оформлен: ' + b.id);
  };
  const cancelBooking = (id) => {
    const next = bookings.filter((b) => b.id !== id);
    setBookings(next); write('at_bk', next);
  };
  const clearData = () => {
    setFavorites([]); setBookings([]); write('at_fav', []); write('at_bk', []);
  };

  const money = (v) =>
    settings.currency === 'USD'
      ? '$' + Math.round(v / RATE).toLocaleString('ru-RU')
      : Math.round(v).toLocaleString('ru-RU') + ' ₸';

  // Расчёт цены: база (1 чел., 7 ночей) × класс × (взрослые + дети×0.7) × ночи/7
  const calculatePrice = (base) => {
    if (!base) return 0;
    const k = FLIGHT_CLASSES.find((c) => c.id === trip.flightClass).k;
    const pax = trip.adults + trip.children * 0.7;
    return Math.round(base * k * pax * (trip.nights / 7));
  };

  return (
    <Ctx.Provider
      value={{
        activeTab, countryId, hotelId, favorites, bookings, settings, trip, minDate, toast,
        searchQuery, setSearchQuery, mealFilter, setMealFilter, starFilter, setStarFilter, sort, setSort,
        go, toggleFavorite, updateSettings, updateTrip, addBooking, cancelBooking, clearData,
        money, calculatePrice, t,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

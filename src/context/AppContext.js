import { createContext, useContext, useEffect, useState } from 'react';
import { RATE, FLIGHT } from '../data/countries';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const read = (k, d) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; }
};
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export const addDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export function AppProvider({ children }) {
  const [view, setView] = useState('home');
  const [cid, setCid] = useState(null);
  const [hid, setHid] = useState(null);
  const [q, setQ] = useState('');
  const [stars, setStars] = useState(0);
  const [sort, setSort] = useState('pop');
  const [fav, setFav] = useState([]);
  const [bk, setBk] = useState([]);
  const [settings, setSettings] = useState({ cur: 'KZT', theme: 'light' });
  const [trip, setTrip] = useState({ date: '', nights: 7, ad: 2, ch: 0, cls: 'economy' });
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    setFav(read('fav', []));
    setBk(read('bk', []));
    const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSettings(read('set', { cur: 'KZT', theme: dark ? 'dark' : 'light' }));
    setTrip((t) => ({ ...t, date: addDays(30) }));
    setMinDate(addDays(3));
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = settings.theme; }, [settings.theme]);

  const go = (v, c = null, h = null) => {
    setView(v); setCid(c); setHid(h);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  const toggleFav = (id) => {
    const next = fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id];
    setFav(next); write('fav', next);
  };

  const updateSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next); write('set', next);
  };

  const updateTrip = (patch) => setTrip((t) => ({ ...t, ...patch }));

  const addBooking = (b) => { const next = [b, ...bk]; setBk(next); write('bk', next); };
  const cancelBooking = (id) => { const next = bk.filter((b) => b.id !== id); setBk(next); write('bk', next); };
  const clearData = () => { setFav([]); setBk([]); write('fav', []); write('bk', []); };

  const money = (v) =>
    settings.cur === 'USD'
      ? '$' + Math.round(v / RATE).toLocaleString('ru-RU')
      : Math.round(v).toLocaleString('ru-RU') + ' ₸';

  // цена за 1 человека на 7 ночей -> цена тура
  const calc = (p) => Math.round((p * FLIGHT[trip.cls][1] * (trip.ad + trip.ch * 0.7) * trip.nights) / 7);

  return (
    <Ctx.Provider
      value={{ view, cid, hid, q, setQ, stars, setStars, sort, setSort, fav, bk, settings, trip, minDate,
        go, toggleFav, updateSettings, updateTrip, addBooking, cancelBooking, clearData, money, calc }}
    >
      {children}
    </Ctx.Provider>
  );
}

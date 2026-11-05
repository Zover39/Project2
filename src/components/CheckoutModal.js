import { useEffect, useState } from 'react';
import { X, ShieldCheck, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FLIGHT_CLASSES } from '../data/countries';

const field = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500';

export default function CheckoutModal({ hotel, country, room, onClose }) {
  const { trip, calculatePrice, money, addBooking, go } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errs, setErrs] = useState({});
  const [done, setDone] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const total = calculatePrice(room.priceBase);
  const cls = FLIGHT_CLASSES.find((c) => c.id === trip.flightClass).label;

  const confirmPayment = () => {
    const e = {};
    if (name.trim().split(/\s+/).length < 2) e.name = 'Введите имя и фамилию';
    if (!/^[78]\d{10}$/.test(phone.replace(/\D/g, ''))) e.phone = 'Телефон: 11 цифр, например +7 701 123 45 67';
    setErrs(e);
    if (Object.keys(e).length) return;

    const booking = {
      id: 'AST-' + Math.floor(100000 + Math.random() * 900000),
      country: country.name,
      hotel: hotel.name,
      room: room.type,
      dates: `${trip.departureDate} (${trip.nights} ночей)`,
      pax: `${trip.adults} взр., ${trip.children} дет.`,
      class: cls.toUpperCase(),
      guest: name.trim(),
      total,
      dateBooked: new Date().toLocaleDateString('ru-RU'),
    };
    addBooking(booking);
    setDone(booking);
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div role="dialog" aria-modal="true" className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Тур успешно оформлен!</h2>
          <p className="text-xs text-slate-500 mb-6">Это демо-версия: авиабилеты и ваучер отеля не выпускаются, деньги не списываются.</p>
          <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-1.5 text-xs text-slate-700 mb-6">
            <p><b>Номер брони:</b> {done.id}</p>
            <p><b>Направление:</b> {done.country}</p>
            <p><b>Отель:</b> {done.hotel}</p>
            <p><b>Сумма:</b> {money(done.total)}</p>
          </div>
          <button onClick={() => { onClose(); go('bookings'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-sm font-semibold transition">
            Отлично, перейти в «Мои туры»
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Оплата тура" className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
        <button onClick={onClose} aria-label="Закрыть" className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-500 rounded-2xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg shadow-red-500/30">K</div>
          <h2 className="text-xl font-bold text-slate-900">Kaspi Pay / Оплата тура</h2>
          <p className="text-xs text-slate-500 mt-1">Демо: деньги не списываются</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl space-y-2 mb-5 text-xs text-slate-700">
          <div className="flex justify-between gap-3"><span className="text-slate-500">Отель:</span><span className="font-bold text-right">{hotel.name}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Номер:</span><span className="font-bold text-right">{room.type}</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Вылет:</span><span className="font-bold">Астана (NQZ) → {trip.departureDate}, {trip.nights} ноч.</span></div>
          <div className="flex justify-between gap-3"><span className="text-slate-500">Туристы:</span><span className="font-bold">{trip.adults} взр., {trip.children} дет. · {cls}</span></div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-blue-600">
            <span>К оплате:</span><span>{money(total)}</span>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label htmlFor="nm" className="text-xs font-bold text-slate-600 block mb-1">Имя и фамилия как в паспорте</label>
            <input id="nm" autoFocus autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
            <p className="text-xs text-red-500 min-h-[16px] mt-1">{errs.name}</p>
          </div>
          <div>
            <label htmlFor="ph" className="text-xs font-bold text-slate-600 block mb-1">Телефон Kaspi</label>
            <input id="ph" type="tel" autoComplete="tel" placeholder="+7 7__ ___ __ __" value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
            <p className="text-xs text-red-500 min-h-[16px] mt-1">{errs.phone}</p>
          </div>
        </div>

        <button onClick={confirmPayment} className="w-full bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-red-500/30 transition flex items-center justify-center space-x-2">
          <ShieldCheck className="w-5 h-5" />
          <span>Оплатить через Kaspi / Рассрочка 0-0-12</span>
        </button>
      </div>
    </div>
  );
}

import { ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BookingsView() {
  const { bookings, money, cancelBooking, go, t } = useApp();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('Мои туры')}: забронированные ({bookings.length})</h1>
      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">У вас пока нет оформленных туров</p>
          <button onClick={() => go('home')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">Подобрать тур</button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{b.id}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{b.hotel}</h3>
                <p className="text-xs text-slate-500">{b.country} • {b.room}</p>
                <p className="text-xs text-slate-600 mt-1">Даты: {b.dates} | Пассажиры: {b.pax} | Класс: {b.class}</p>
                {b.guest && <p className="text-xs text-slate-500 mt-1">Гость: {b.guest} · оформлено {b.dateBooked}</p>}
              </div>
              <div className="md:text-right">
                <span className="text-lg font-extrabold text-blue-600 block">{money(b.total)}</span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg inline-block mt-1">Оплачено через Kaspi Pay (демо)</span>
                <div>
                  <button
                    onClick={() => confirm('Отменить бронь ' + b.id + '?') && cancelBooking(b.id)}
                    className="mt-3 text-xs font-semibold text-slate-500 hover:text-red-500 transition"
                  >
                    Отменить бронь
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

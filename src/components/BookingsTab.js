import { ShoppingBag, QrCode } from 'lucide-react';
import EmptyState from './EmptyState';

export default function BookingsTab({ bookings, onOpenVoucher }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Мои бронирования и билеты ({bookings.length})</h2>
      {bookings.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="У вас пока нет оформленных туров" />
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-3xl border p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <img src={b.image} alt={b.hotelName} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Оплачено • Бронь #{b.id}</span>
                  <h4 className="text-lg font-bold text-slate-900">{b.hotelName}</h4>
                  <p className="text-xs text-slate-500">{b.country} • {b.roomName} ({b.passengers})</p>
                  <p className="text-xs text-slate-600">Даты: <b>{b.date}</b> ({b.nights} ночей)</p>
                </div>
              </div>
              <div className="text-right w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <span className="text-xl font-black text-slate-900 block">{b.totalStr}</span>
                <button onClick={() => onOpenVoucher(b)} className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 w-full md:w-auto">
                  <QrCode className="w-4 h-4" /> Электронный билет
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

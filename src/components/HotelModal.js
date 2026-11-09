import { X } from 'lucide-react';
import { formatPrice } from '../utils/format';

export default function HotelModal({ trip, onCheckout }) {
  const {
    activeHotel, selectedRoom, setSelectedRoom, closeHotel, total,
    flightClass, setFlightClass, adults, setAdults, childrenCount, setChildrenCount,
    nights, setNights, departureDate, setDepartureDate
  } = trip;

  if (!activeHotel || !selectedRoom) return null;

  const classBtn = (value, label) => (
    <button onClick={() => setFlightClass(value)} className={`py-2 text-xs font-bold rounded-xl border ${flightClass === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300'}`}>{label}</button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border p-6 sm:p-8 space-y-6 relative">
        <button onClick={closeHotel} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <img src={activeHotel.image} alt={activeHotel.name} className="w-full md:w-72 h-48 rounded-2xl object-cover" />
          <div className="space-y-2">
            <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-md font-bold">{activeHotel.country} • {activeHotel.city}</span>
            <h3 className="text-2xl font-black text-slate-900">{activeHotel.name}</h3>
            <p className="text-xs text-slate-500">Питание: <b>{activeHotel.meal}</b> | Пляж: {activeHotel.beach}</p>
            <p className="text-xs text-indigo-600 font-medium">{activeHotel.flightRoute}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t">
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-2xl space-y-2 border border-indigo-100">
              <h4 className="font-bold text-xs text-indigo-600 uppercase tracking-wider">Что входит в стоимость:</h4>
              <ul className="text-xs space-y-1 text-slate-700 list-disc list-inside">
                {activeHotel.tourIncludes.map((inc, i) => <li key={i}>{inc}</li>)}
              </ul>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">Конструктор поездки из Астаны</h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Категория номера:</label>
              <select onChange={(e) => setSelectedRoom(activeHotel.rooms[e.target.value])} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold">
                {activeHotel.rooms.map((r, idx) => (
                  <option key={idx} value={idx}>{r.name} (+{formatPrice(r.priceExtra)} ₸)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Класс перелета:</label>
              <div className="grid grid-cols-3 gap-2">
                {classBtn(1.0, 'Эконом')}
                {classBtn(1.6, 'Бизнес')}
                {classBtn(2.5, 'Первый')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Взрослые:</label>
                <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n} взр.</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Дети:</label>
                <select value={childrenCount} onChange={(e) => setChildrenCount(Number(e.target.value))} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs">
                  {[0,1,2].map(n => <option key={n} value={n}>{n} дет.</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Дата вылета из NQZ:</label>
                <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ночей: {nights}</label>
                <input type="range" min="3" max="21" value={nights} onChange={(e) => setNights(Number(e.target.value))} className="w-full accent-indigo-600" />
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Итого к оплате</span>
                <span className="text-2xl font-black text-slate-900">{formatPrice(total)} ₸</span>
              </div>
              <button onClick={onCheckout} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-lg shadow-emerald-600/30">
                Оплатить тур
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

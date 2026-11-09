import { ShieldCheck } from 'lucide-react';
import { formatPrice } from '../utils/format';

export default function CheckoutModal({ trip, onPay, onCancel }) {
  const { activeHotel, selectedRoom, departureDate, nights, total } = trip;
  if (!activeHotel || !selectedRoom) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center relative">
        <div className="w-16 h-16 bg-red-600 text-white rounded-2xl mx-auto flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-red-600/30">K</div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Kaspi Pay / Банковский эквайринг</h3>
          <p className="text-xs text-slate-500">Оплата тура в {activeHotel.name}</p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-slate-500">Направление:</span><span className="font-bold">{activeHotel.country}, {activeHotel.city}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Номер:</span><span className="font-bold">{selectedRoom.name}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Дата вылета из NQZ:</span><span className="font-bold">{departureDate} ({nights} ночей)</span></div>
          <div className="flex justify-between pt-2 border-t font-bold text-slate-900">
            <span>К списанию:</span>
            <span className="text-red-600 text-sm">{formatPrice(total)} ₸</span>
          </div>
        </div>

        <div className="space-y-3">
          <button onClick={onPay} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Подтвердить оплату через Kaspi QR
          </button>
          <button onClick={onCancel} className="w-full bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-xl text-xs">Отмена</button>
        </div>
      </div>
    </div>
  );
}

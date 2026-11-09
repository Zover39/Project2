import { X, QrCode } from 'lucide-react';

export default function VoucherModal({ voucher, onClose }) {
  if (!voucher) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-center">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400">
          <X className="w-6 h-6" />
        </button>
        <div className="space-y-1 border-b pb-4">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Astana Travel Electronic Ticket</span>
          <h3 className="text-xl font-black text-slate-900">Посадочный ваучер #{voucher.id}</h3>
        </div>
        <div className="space-y-2 text-xs text-left">
          <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Отель:</span><span className="font-bold">{voucher.hotelNode || voucher.hotelName}</span></div>
          <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Номер:</span><span className="font-bold">{voucher.roomName}</span></div>
          <div className="flex justify-between py-1 border-b"><span className="text-slate-500">Маршрут:</span><span className="font-bold">{voucher.flightRoute}</span></div>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center gap-4 border">
          <QrCode className="w-20 h-20 text-slate-900" />
          <div className="text-left space-y-1">
            <span className="text-xs font-bold text-slate-900 block">QR-код посадочного талона</span>
            <p className="text-[11px] text-slate-500">Предъявите в аэропорту Астаны (NQZ).</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-sm">Закрыть</button>
      </div>
    </div>
  );
}

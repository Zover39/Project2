import { Heart } from 'lucide-react';
import { HOTELS_DATA } from '../data/hotels';
import { formatPrice } from '../utils/format';
import EmptyState from './EmptyState';

export default function FavoritesTab({ favorites, onClear, onToggleFav, onSelectHotel }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold">Избранные отели ({favorites.length})</h2>
        {favorites.length > 0 && (
          <button onClick={onClear} className="text-xs text-rose-500 font-bold hover:underline">Очистить всё</button>
        )}
      </div>
      {favorites.length === 0 ? (
        <EmptyState icon={Heart} title="В избранном пока пусто" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOTELS_DATA.filter(h => favorites.includes(h.id)).map(h => (
            <div key={h.id} className="bg-white rounded-3xl p-5 border shadow-sm space-y-3">
              <div className="relative h-44 rounded-2xl overflow-hidden">
                <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                <button onClick={() => onToggleFav(h.id)} className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white text-rose-500 flex items-center justify-center shadow">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-600">{h.country}, {h.city}</span>
                <h4 className="font-bold text-slate-900 text-base">{h.name}</h4>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="font-black text-slate-900">{formatPrice(h.price)} ₸</span>
                <button onClick={() => onSelectHotel(h)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">Забронировать</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

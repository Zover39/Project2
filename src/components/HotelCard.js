import { Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { formatPrice } from '../utils/format';

export default function HotelCard({ hotel: h, isFav, onToggleFav, onSelect }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Открыть тур: ${h.name}`}
      onClick={() => onSelect(h)}
      onKeyDown={event => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect(h);
        }
      }}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div>
        <div className="relative h-56 overflow-hidden">
          <img src={h.image} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm">
            {h.country}, {h.city}
          </div>
          <button onClick={event => { event.stopPropagation(); onToggleFav(h.id); }} className="absolute top-3 right-3 w-10 h-10 rounded-xl bg-white/90 text-rose-500 flex items-center justify-center shadow hover:scale-110 transition">
            <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
          </button>
          <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow">
            <Star className="w-3.5 h-3.5 fill-slate-950" /> {h.rating} ({h.reviewsCount})
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-indigo-600 font-bold">
            <span>{h.meal}</span>
            <span>{'★'.repeat(h.stars)}</span>
          </div>
          <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{h.name}</h4>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" /> {h.beach}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
        <div>
          <span className="block text-[10px] text-slate-400 font-semibold uppercase">От (2 чел)</span>
          <span className="text-xl font-black text-slate-900">{formatPrice(h.price)} ₸</span>
        </div>
        <button onClick={event => { event.stopPropagation(); onSelect(h); }} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5">
          <span>Выбрать тур</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

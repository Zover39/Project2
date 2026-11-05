import { Heart, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { minPrice, MEALS } from '../data/countries';
import Img from './Img';

export default function HotelCard({ hotel, countryId }) {
  const { go, favorites, toggleFavorite, money, t } = useApp();
  const fav = favorites.includes(hotel.id);
  const meal = MEALS.find((m) => m.id === hotel.meal);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col justify-between">
      <div>
        <div className="relative h-48 bg-gradient-to-br from-slate-800 to-blue-600">
          <Img src={hotel.image} alt={hotel.name} />
          <button
            onClick={() => toggleFavorite(hotel.id)}
            aria-label={fav ? 'Убрать из избранного' : 'В избранное'}
            aria-pressed={fav}
            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:bg-white transition"
          >
            <Heart className={`w-5 h-5 ${fav ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
          </button>
          <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-semibold">
            ★ {hotel.category} Звезды
          </span>
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-2">{hotel.name}</h3>
          <p className="text-xs text-slate-500 mb-2 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span>{hotel.beach}</span>
          </p>
          {meal && <span className="inline-block text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md mb-2">{meal.label}</span>}
          <p className="text-xs text-slate-600 line-clamp-2">{hotel.description}</p>
        </div>
      </div>
      <div className="p-5 pt-0">
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 block">Цена от</span>
            <span className="text-lg font-extrabold text-blue-600">{money(minPrice(hotel))}</span>
          </div>
          <span className="text-xs text-slate-500">за 7 ночей / чел.</span>
        </div>
        <button
          onClick={() => go('home', countryId || hotel.countryId, hotel.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/20"
        >
          {t('Выбрать тур и номера')}
        </button>
      </div>
    </div>
  );
}

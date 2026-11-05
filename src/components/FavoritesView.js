import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ALL_HOTELS } from '../data/countries';
import HotelCard from './HotelCard';

export default function FavoritesView() {
  const { favorites, t } = useApp();
  const hotels = ALL_HOTELS.filter((h) => favorites.includes(h.id));
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t('Избранное')}: отели ({hotels.length})</h1>
      {hotels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">У вас пока нет сохраненных отелей</p>
          <p className="text-xs text-slate-400 mt-1">Нажмите на сердечко на карточке отеля</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => <HotelCard key={h.id} hotel={h} countryId={h.countryId} />)}
        </div>
      )}
    </div>
  );
}

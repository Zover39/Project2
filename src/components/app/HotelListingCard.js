import { ArrowRight, Heart, MapPin, MessageCircle } from 'lucide-react';

export default function HotelListingCard({
  hotel, isFavorite, onToggleFavorite, onSelect,
  isCompared = false, onToggleCompare
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Открыть тур: ${hotel.name}`}
      onClick={() => onSelect(hotel)}
      onKeyDown={event => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelect(hotel);
        }
      }}
      className="hotel-card-motion bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition group relative flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="relative h-56 overflow-hidden">
        <img src={hotel.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt={hotel.name} />
        <span className="absolute left-4 top-4 rounded-lg bg-black/55 px-2.5 py-1.5 text-[10px] font-bold text-white backdrop-blur">
          Фото отеля
        </span>
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {onToggleCompare && (
            <button
              onClick={event => { event.stopPropagation(); onToggleCompare(hotel); }}
              aria-pressed={isCompared}
              aria-label={isCompared ? 'Убрать из сравнения' : 'Добавить к сравнению'}
              className="rounded-lg bg-white/90 px-2.5 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:bg-slate-900/90 dark:text-indigo-300"
            >
              {isCompared ? '✓ Сравнение' : 'Сравнить'}
            </button>
          )}
          <button
            onClick={event => { event.stopPropagation(); onToggleFavorite(hotel); }}
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
            aria-pressed={isFavorite}
            className="favorite-motion rounded-xl bg-white/80 p-2 text-rose-500 shadow-sm backdrop-blur transition hover:scale-110 dark:bg-slate-900/80"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-slate-200" />
            {hotel.rating != null && hotel.reviews?.length
              ? `${hotel.rating} (${hotel.reviews.length} отз.)`
              : 'Нет оценок гостей'}
          </span>
          <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            Фото: {hotel.photos?.length || ((hotel.gallery?.length || 0) + 1)}
          </span>
        </div>
      </div>
      <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
        <div>
          <div className="flex justify-between items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
            <span>{hotel.country}, {hotel.city}</span>
            <span aria-label={`Категория отеля: ${hotel.stars} звёзд`}>{hotel.stars}★ отель</span>
          </div>
          <h3 className="font-bold text-lg leading-tight line-clamp-1">{hotel.name}</h3>
          {hotel.locationDescription && (
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">{hotel.locationDescription}</p>
          )}
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {hotel.beach} • {hotel.meal}
          </p>
          {hotel.amenities?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hotel.amenities.slice(0, 2).map(amenity => (
                <span key={amenity} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Демо-цена · 7 ночей / гость</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{hotel.price.toLocaleString('ru-RU')} ₸</span>
          </div>
          <button
            onClick={event => { event.stopPropagation(); onSelect(hotel); }}
            aria-label={`Выбрать тур: ${hotel.name}`}
            className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl hover:bg-indigo-600 hover:text-white transition"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { Plane } from 'lucide-react';
import Hero from './Hero';
import CountryTabs from './CountryTabs';
import HotelCard from './HotelCard';
import EmptyState from './EmptyState';

export default function CatalogTab({ filters, favorites, onToggleFav, onSelectHotel }) {
  const { filteredHotels, selectedCountry, setSelectedCountry } = filters;
  return (
    <div className="space-y-8">
      <Hero filters={filters} />
      <CountryTabs selectedCountry={selectedCountry} onSelect={setSelectedCountry} />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Каталог туров и отелей</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-600 font-bold">{filteredHotels.length} отелей</span>
          </h3>
          <span className="text-xs text-slate-500">Цены в тенге (₸) с перелетом из Астаны</span>
        </div>

        {filteredHotels.length === 0 ? (
          <EmptyState icon={Plane} title="Отели не найдены" className="border-slate-200" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHotels.map(h => (
              <HotelCard key={h.id} hotel={h} isFav={favorites.includes(h.id)} onToggleFav={onToggleFav} onSelect={onSelectHotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

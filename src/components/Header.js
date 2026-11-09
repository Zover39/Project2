import { Heart, ShoppingBag, Compass } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, favoritesCount, bookingsCount }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-500/30">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-indigo-600">ASTANA TRAVEL</h1>
            <p className="text-xs text-slate-500 font-semibold">Туроператор №1 в Астане (NQZ)</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <button onClick={() => setActiveTab('catalog')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${activeTab === 'catalog' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            Каталог туров
          </button>
          <button onClick={() => setActiveTab('favorites')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 relative ${activeTab === 'favorites' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Избранное</span>
            {favoritesCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {favoritesCount}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 ${activeTab === 'bookings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}>
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            <span>Мои билеты ({bookingsCount})</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

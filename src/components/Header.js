import { Plane, Heart, ShoppingBag, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { activeTab, countryId, go, favorites, bookings, t } = useApp();
  const base = 'px-3 sm:px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition';
  const on = 'bg-blue-50 text-blue-600';
  const off = 'text-slate-600 hover:bg-slate-100';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <button className="flex items-center space-x-3 text-left" onClick={() => go('home')} aria-label="На главную">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Plane className="w-6 h-6 transform -rotate-45" />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold tracking-tight text-slate-900 block">Astana Travel</span>
            <span className="text-xs text-blue-600 font-semibold tracking-wider uppercase">Астана (NQZ)</span>
          </div>
        </button>

        <nav className="flex items-center space-x-1" aria-label="Основное меню">
          <button onClick={() => go('home')} className={`${base} ${activeTab === 'home' && !countryId ? on : off}`}>
            <span>{t('Главная')}</span>
          </button>
          <button onClick={() => go('favorites')} className={`${base} ${activeTab === 'favorites' ? on : off}`} aria-label={t('Избранное')}>
            <Heart className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">{t('Избранное')} ({favorites.length})</span>
            <span className="sm:hidden">{favorites.length}</span>
          </button>
          <button onClick={() => go('bookings')} className={`${base} ${activeTab === 'bookings' ? on : off}`} aria-label={t('Мои туры')}>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">{t('Мои туры')} ({bookings.length})</span>
            <span className="sm:hidden">{bookings.length}</span>
          </button>
          <button onClick={() => go('settings')} className={`${base} ${activeTab === 'settings' ? on : off}`} aria-label={t('Настройки')}>
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">{t('Настройки')}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

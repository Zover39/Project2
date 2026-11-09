import { Sparkles, RotateCcw } from 'lucide-react';
import { COUNTRY_NAMES } from '../data/config';

export default function Hero({ filters }) {
  const { searchQuery, setSearchQuery, selectedCountry, setSelectedCountry, selectedMeal, setSelectedMeal, resetFilters } = filters;
  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white p-6 sm:p-12 shadow-2xl">
      <div className="relative z-10 max-w-3xl space-y-4">
        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/30 text-indigo-300 text-xs font-semibold border border-indigo-400/20">
          <Sparkles className="w-3.5 h-3.5" /> Прямой вылет из аэропорта Астаны (NQZ)
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
          Лучшие курорты мира с вылетом из Астаны
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          105 эксклюзивных отелей, настраиваемый конструктор дат и класса перелета, рассрочка и билеты прямо в смартфоне.
        </p>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1">Поиск</label>
            <input type="text" placeholder="Отель или город..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1">Страна</label>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="all">Все страны (105 туров)</option>
              {COUNTRY_NAMES.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-indigo-200 mb-1">Тип питания</label>
            <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)} className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none">
              <option value="all">Любое питание</option>
              <option value="Ultra All Inclusive">Ultra All Inclusive</option>
              <option value="All Inclusive">All Inclusive</option>
              <option value="Full Board">Full Board</option>
              <option value="Half Board">Half Board</option>
              <option value="Breakfast">Завтраки (BB)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={resetFilters} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
